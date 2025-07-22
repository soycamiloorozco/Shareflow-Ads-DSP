import { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterState, Screen } from '../types';
import { MarketplaceSection } from '../types/intelligent-grouping.types';
import { getActiveFilterCount } from '../types/filter.types';
import { groupingEngine } from '../services/GroupingEngine';

interface UseMarketplaceDataProps {
  initialScreens?: Screen[];
  initialFilters?: FilterState;
}

interface MarketplaceDataState {
  screens: Screen[];
  filteredScreens: Screen[];
  loading: boolean;
  error: Error | null;
  filters: FilterState;
  // Sectioned data state
  sections: MarketplaceSection[];
  sectionsLoading: boolean;
  sectionsError: string | null;
  sectionsCacheKey: string | null;
  lastSectionRefresh: Date | null;
}

export const useMarketplaceData = ({ 
  initialScreens = [], 
  initialFilters 
}: UseMarketplaceDataProps = {}) => {
  const [state, setState] = useState<MarketplaceDataState>({
    screens: initialScreens,
    filteredScreens: initialScreens,
    loading: false,
    error: null,
    filters: initialFilters || {
      search: { query: '' },
      location: { cities: [], regions: [], neighborhoods: [] },
      category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
      price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
      features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
      availability: { timeSlots: [], daysOfWeek: [] },
      sort: { field: 'relevance', direction: 'desc' },
      showFavoritesOnly: false,
      showCircuits: true
    },
    // Initialize sectioned data state
    sections: [],
    sectionsLoading: false,
    sectionsError: null,
    sectionsCacheKey: null,
    lastSectionRefresh: null
  });

  // Filter screens based on current filters
  const applyFilters = useCallback((screens: Screen[], filters: FilterState) => {
    let filtered = [...screens];

    // Search filter
    if (filters.search.query) {
      const query = filters.search.query.toLowerCase();
      filtered = filtered.filter(screen => 
        screen.name.toLowerCase().includes(query) ||
        screen.location.toLowerCase().includes(query) ||
        screen.category?.name?.toLowerCase().includes(query)
      );
    }

    // Location filters
    if (filters.location.cities.length > 0) {
      filtered = filtered.filter(screen =>
        filters.location.cities.some(city =>
          screen.location.toLowerCase().includes(city.toLowerCase())
        )
      );
    }

    // Category filters
    if (filters.category.categories.length > 0) {
      filtered = filtered.filter(screen =>
        filters.category.categories.includes(screen.category?.id || '')
      );
    }

    // Price filters
    if (filters.price.ranges.length > 0) {
      // This would need to be implemented based on your price range logic
      // For now, we'll keep all screens
    }

    // Feature filters
    if (filters.features.allowsMoments !== null) {
      filtered = filtered.filter(screen =>
        screen.pricing?.allowMoments === filters.features.allowsMoments
      );
    }

    if (filters.features.rating !== null) {
      filtered = filtered.filter(screen =>
        screen.rating >= (filters.features.rating || 0)
      );
    }

    // Favorites filter
    if (filters.showFavoritesOnly) {
      // This would need to integrate with your favorites service
      // For now, we'll keep all screens
    }

    // Sort results
    switch (filters.sort.field) {
      case 'price':
        filtered.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return filters.sort.direction === 'asc' ? priceA - priceB : priceB - priceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => {
          return filters.sort.direction === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        });
        break;
      case 'relevance':
      default:
        // Keep current order or implement relevance scoring
        break;
    }

    return filtered;
  }, []);

  // Update filtered screens when screens or filters change
  useEffect(() => {
    const filteredScreens = applyFilters(state.screens, state.filters);
    setState(prev => ({ ...prev, filteredScreens }));
  }, [state.screens, state.filters, applyFilters]);

  // Update filters
  const updateFilters = useCallback((newFilters: FilterState) => {
    setState(prev => ({ ...prev, filters: newFilters }));
  }, []);

  // Update screens
  const updateScreens = useCallback((newScreens: Screen[]) => {
    setState(prev => ({ ...prev, screens: newScreens }));
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // Set error state
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        search: { query: '' },
        location: { cities: [], regions: [], neighborhoods: [] },
        category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
        price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
        features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
        availability: { timeSlots: [], daysOfWeek: [] },
        sort: { field: 'relevance', direction: 'desc' },
        showFavoritesOnly: false,
        showCircuits: true
      }
    }));
  }, []);

  // Computed values (needed before sectioned data methods)
  const activeFilterCount = useMemo(() => getActiveFilterCount(state.filters), [state.filters]);
  const hasActiveFilters = activeFilterCount > 0;

  // Sectioned data methods
  
  // Generate cache key for sections based on user and filters
  const generateSectionsCacheKey = useCallback((userId?: string, filters?: FilterState): string => {
    const userPart = userId || 'anonymous';
    const filterPart = filters ? JSON.stringify({
      search: filters.search.query,
      location: filters.location.cities,
      category: filters.category.categories,
      features: {
        allowsMoments: filters.features.allowsMoments,
        rating: filters.features.rating
      }
    }) : '';
    return `sections_${userPart}_${btoa(filterPart).slice(0, 16)}`;
  }, []);

  // Load sections with caching and error handling
  const loadSections = useCallback(async (options: {
    userId?: string;
    location?: string;
    forceRefresh?: boolean;
    maxSections?: number;
  } = {}) => {
    const cacheKey = generateSectionsCacheKey(options.userId, state.filters);
    
    // Check if we need to refresh based on cache key or force refresh
    if (!options.forceRefresh && state.sectionsCacheKey === cacheKey && state.sections.length > 0) {
      // Check if cache is still valid (within 30 minutes)
      const cacheAge = state.lastSectionRefresh ? Date.now() - state.lastSectionRefresh.getTime() : Infinity;
      if (cacheAge < 30 * 60 * 1000) { // 30 minutes
        return; // Use cached sections
      }
    }

    setState(prev => ({ ...prev, sectionsLoading: true, sectionsError: null }));

    try {
      // Determine location from filters or provided location
      const targetLocation = options.location || 
        (state.filters.location.cities.length > 0 ? state.filters.location.cities[0] : undefined);

      // Generate sections using the grouping engine
      const result = await groupingEngine.generateSections({
        userId: options.userId,
        location: targetLocation,
        maxSections: options.maxSections || 6,
        forceRefresh: options.forceRefresh || false,
        includeAnalytics: true
      });

      // Apply current filters to sections if any are active
      let processedSections = result.sections;
      if (hasActiveFilters) {
        processedSections = await applyFiltersToSections(result.sections, state.filters);
      }

      setState(prev => ({
        ...prev,
        sections: processedSections,
        sectionsLoading: false,
        sectionsError: null,
        sectionsCacheKey: cacheKey,
        lastSectionRefresh: new Date()
      }));

      // Track section generation for analytics
      if (result.analytics && process.env.NODE_ENV === 'development') {
        console.debug('Section generation analytics:', result.analytics);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate sections';
      console.error('Failed to load sections:', error);
      
      setState(prev => ({
        ...prev,
        sectionsLoading: false,
        sectionsError: errorMessage,
        sections: [] // Clear sections on error
      }));
    }
  }, [state.filters, state.sectionsCacheKey, state.sections.length, state.lastSectionRefresh, hasActiveFilters, generateSectionsCacheKey]);

  // Apply filters to sections while maintaining section structure
  const applyFiltersToSections = useCallback(async (sections: MarketplaceSection[], filters: FilterState): Promise<MarketplaceSection[]> => {
    return sections.map(section => {
      let filteredScreens = [...section.screens];
      
      // Apply search filter
      if (filters.search.query) {
        const query = filters.search.query.toLowerCase();
        filteredScreens = filteredScreens.filter(screen => 
          screen.name.toLowerCase().includes(query) ||
          screen.location.toLowerCase().includes(query) ||
          screen.category?.name?.toLowerCase().includes(query)
        );
      }
      
      // Apply location filters
      if (filters.location.cities.length > 0) {
        filteredScreens = filteredScreens.filter(screen =>
          filters.location.cities.some(city =>
            screen.location.toLowerCase().includes(city.toLowerCase())
          )
        );
      }
      
      // Apply category filters
      if (filters.category.categories.length > 0) {
        filteredScreens = filteredScreens.filter(screen =>
          filters.category.categories.includes(screen.category?.id || '')
        );
      }
      
      // Apply feature filters
      if (filters.features.allowsMoments !== null) {
        filteredScreens = filteredScreens.filter(screen =>
          screen.pricing?.allowMoments === filters.features.allowsMoments
        );
      }
      
      if (filters.features.rating !== null) {
        filteredScreens = filteredScreens.filter(screen =>
          screen.rating >= (filters.features.rating || 0)
        );
      }
      
      return {
        ...section,
        screens: filteredScreens
      };
    }).filter(section => section.screens.length > 0); // Remove empty sections
  }, []);

  // Refresh sections
  const refreshSections = useCallback(async (userId?: string) => {
    await loadSections({ userId, forceRefresh: true });
  }, [loadSections]);

  // Clear sections cache
  const clearSectionsCache = useCallback(() => {
    setState(prev => ({
      ...prev,
      sections: [],
      sectionsCacheKey: null,
      lastSectionRefresh: null,
      sectionsError: null
    }));
  }, []);

  // Set sections loading state
  const setSectionsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, sectionsLoading: loading }));
  }, []);

  // Set sections error state
  const setSectionsError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, sectionsError: error }));
  }, []);

  // Update sections directly (for external updates)
  const updateSections = useCallback((newSections: MarketplaceSection[]) => {
    setState(prev => ({ 
      ...prev, 
      sections: newSections,
      lastSectionRefresh: new Date()
    }));
  }, []);

  // Auto-refresh sections when filters change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.sections.length > 0) {
        // Only refresh if we already have sections loaded
        loadSections({ forceRefresh: false });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [state.filters, loadSections]);

  // Computed values for sections
  const totalScreensInSections = useMemo(() => {
    return state.sections.reduce((total, section) => total + section.screens.length, 0);
  }, [state.sections]);

  const sectionsWithScreens = useMemo(() => {
    return state.sections.filter(section => section.screens.length > 0);
  }, [state.sections]);

  const isSectionsCacheValid = useMemo(() => {
    if (!state.lastSectionRefresh) return false;
    const cacheAge = Date.now() - state.lastSectionRefresh.getTime();
    return cacheAge < 30 * 60 * 1000; // 30 minutes
  }, [state.lastSectionRefresh]);

  return {
    // State
    screens: state.screens,
    filteredScreens: state.filteredScreens,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    
    // Sectioned data state
    sections: state.sections,
    sectionsLoading: state.sectionsLoading,
    sectionsError: state.sectionsError,
    sectionsCacheKey: state.sectionsCacheKey,
    lastSectionRefresh: state.lastSectionRefresh,
    
    // Computed
    activeFilterCount,
    hasActiveFilters,
    totalScreensInSections,
    sectionsWithScreens,
    isSectionsCacheValid,
    
    // Actions
    updateFilters,
    updateScreens,
    setLoading,
    setError,
    clearFilters,
    applyFilters,
    
    // Sectioned data actions
    loadSections,
    refreshSections,
    clearSectionsCache,
    setSectionsLoading,
    setSectionsError,
    updateSections,
    applyFiltersToSections
  };
};