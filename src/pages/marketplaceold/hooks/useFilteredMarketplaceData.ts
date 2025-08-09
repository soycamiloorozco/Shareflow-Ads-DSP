import { useState, useEffect, useCallback, useMemo } from 'react';
import { Screen } from '../types';
import { MarketplaceSection } from '../types/intelligent-grouping.types';
import { filterApiService, FilterQuery } from '../services/FilterApiService';

interface UseFilteredMarketplaceDataProps {
  initialScreens: Screen[];
  filters: FilterQuery;
}

interface UseFilteredMarketplaceDataReturn {
  screens: Screen[];
  filteredScreens: Screen[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  facets: {
    cities: Array<{ id: string; name: string; count: number }>;
    categories: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ id: string; name: string; count: number }>;
  };
  // Sectioned data
  sections: MarketplaceSection[];
  sectionsLoading: boolean;
  sectionsError: string | null;
  loadSections: (options?: any) => Promise<void>;
  refreshSections: (userId?: string) => Promise<void>;
  totalScreensInSections: number;
}

export const useFilteredMarketplaceData = ({
  initialScreens,
  filters
}: UseFilteredMarketplaceDataProps): UseFilteredMarketplaceDataReturn => {
  const [screens] = useState<Screen[]>(initialScreens);
  const [filteredScreens, setFilteredScreens] = useState<Screen[]>(initialScreens);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialScreens.length);
  const [facets, setFacets] = useState({
    cities: [],
    categories: [],
    priceRanges: []
  });

  // Sectioned data state
  const [sections, setSections] = useState<MarketplaceSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  // Apply filters whenever they change
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await filterApiService.applyFilters(screens, filters);
        setFilteredScreens(result.screens);
        setTotalCount(result.totalCount);
        setFacets(result.facets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error applying filters');
        setFilteredScreens(screens); // Fallback to unfiltered screens
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [screens, filters]);

  // Generate sections from filtered screens
  useEffect(() => {
    const generateSections = () => {
      if (filteredScreens.length === 0) {
        setSections([]);
        return;
      }

      const generatedSections: MarketplaceSection[] = [];

      // 1. Popular screens section
      const popularScreens = filteredScreens
        .filter(screen => (screen.rating || 0) >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8);

      if (popularScreens.length > 0) {
        generatedSections.push({
          id: 'popular',
          title: 'Pantallas Populares',
          subtitle: 'Las pantallas mejor calificadas',
          screens: popularScreens,
          displayType: 'horizontal-scroll',
          priority: 1,
          metadata: {
            algorithm: 'trending-analysis',
            confidence: 0.9,
            refreshInterval: 900000,
            trackingId: `popular-${Date.now()}`,
            generatedAt: new Date()
          }
        });
      }

      // 2. High traffic section
      const highTrafficScreens = filteredScreens
        .filter(screen => (screen.views?.daily || 0) > 10000)
        .sort((a, b) => (b.views?.daily || 0) - (a.views?.daily || 0))
        .slice(0, 6);

      if (highTrafficScreens.length > 0) {
        generatedSections.push({
          id: 'high-traffic',
          title: 'Alto Tráfico',
          subtitle: 'Pantallas con mayor audiencia diaria',
          screens: highTrafficScreens,
          displayType: 'horizontal-scroll',
          priority: 2,
          metadata: {
            algorithm: 'geographic-popularity',
            confidence: 0.85,
            refreshInterval: 1800000,
            trackingId: `high-traffic-${Date.now()}`,
            generatedAt: new Date()
          }
        });
      }

      // 3. Budget friendly section
      const budgetScreens = filteredScreens
        .filter(screen => {
          const price = getScreenMinPrice(screen);
          return price > 0 && price <= 500000;
        })
        .sort((a, b) => getScreenMinPrice(a) - getScreenMinPrice(b))
        .slice(0, 6);

      if (budgetScreens.length > 0) {
        generatedSections.push({
          id: 'budget-friendly',
          title: 'Precios Accesibles',
          subtitle: 'Pantallas económicas con buena calidad',
          screens: budgetScreens,
          displayType: 'horizontal-scroll',
          priority: 3,
          metadata: {
            algorithm: 'content-based',
            confidence: 0.8,
            refreshInterval: 3600000,
            trackingId: `budget-${Date.now()}`,
            generatedAt: new Date()
          }
        });
      }

      setSections(generatedSections);
    };

    generateSections();
  }, [filteredScreens]);

  // Helper function to get minimum price
  const getScreenMinPrice = (screen: Screen): number => {
    if (!screen.pricing?.bundles) return screen.price || 0;
    
    const prices = [];
    if (screen.pricing.bundles.hourly?.enabled) {
      prices.push(screen.pricing.bundles.hourly.price);
    }
    if (screen.pricing.bundles.daily?.enabled) {
      prices.push(screen.pricing.bundles.daily.price / 24);
    }
    if (screen.pricing.bundles.weekly?.enabled) {
      prices.push(screen.pricing.bundles.weekly.price / (24 * 7));
    }
    
    return prices.length > 0 ? Math.min(...prices) : screen.price || 0;
  };

  // Load sections (for compatibility with existing interface)
  const loadSections = useCallback(async (options?: any) => {
    setSectionsLoading(true);
    setSectionsError(null);

    try {
      // Sections are automatically generated from filtered screens
      // This is just for compatibility
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      setSectionsError(err instanceof Error ? err.message : 'Error loading sections');
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  // Refresh sections
  const refreshSections = useCallback(async (userId?: string) => {
    setSectionsLoading(true);
    setSectionsError(null);

    try {
      // Force regeneration of sections
      await new Promise(resolve => setTimeout(resolve, 500));
      // Sections will be regenerated automatically via useEffect
    } catch (err) {
      setSectionsError(err instanceof Error ? err.message : 'Error refreshing sections');
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  // Calculate total screens in sections
  const totalScreensInSections = useMemo(() => {
    return sections.reduce((total, section) => total + section.screens.length, 0);
  }, [sections]);

  return {
    screens,
    filteredScreens,
    loading,
    error,
    totalCount,
    facets,
    sections,
    sectionsLoading,
    sectionsError,
    loadSections,
    refreshSections,
    totalScreensInSections
  };
};