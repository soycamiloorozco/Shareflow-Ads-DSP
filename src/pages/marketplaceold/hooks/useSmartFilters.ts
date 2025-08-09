import { useState, useCallback, useMemo, useEffect } from 'react';
import { FilterState } from '../types';
import { 
  VENUE_CATEGORIES, 
  CITIES, 
  PRICE_RANGES,
  VenueParentCategory,
  VenueChildCategory 
} from '../../../types/venue-categories';

interface UseSmartFiltersProps {
  initialFilters?: Partial<FilterState>;
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterOptions {
  cities: Array<{ id: string; label: string; count: number; icon?: string }>;
  categories: Array<{ id: string; label: string; count: number; icon?: string }>;
  priceRanges: Array<{ id: string; label: string; count: number; emoji?: string }>;
  environments: Array<{ id: string; label: string; count: number; icon?: string }>;
  audienceTypes: Array<{ id: string; label: string; count: number; icon?: string }>;
}

const createEmptyFilterState = (): FilterState => ({
  search: { query: '' },
  location: { cities: [], regions: [], neighborhoods: [] },
  category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
  price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
  features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
  availability: { timeSlots: [], daysOfWeek: [] },
  sort: { field: 'relevance', direction: 'desc' },
  showFavoritesOnly: false,
  showCircuits: true
});

export const useSmartFilters = ({ 
  initialFilters = {}, 
  onFiltersChange 
}: UseSmartFiltersProps = {}) => {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...createEmptyFilterState(),
    ...initialFilters
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update filters and notify parent
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  // Generate filter options based on available data
  const filterOptions: FilterOptions = useMemo(() => {
    return {
      cities: CITIES.map(city => ({
        id: city.id,
        label: city.name,
        count: city.count,
        icon: '📍'
      })),
      categories: Object.entries(VENUE_CATEGORIES).map(([id, category]) => ({
        id,
        label: category.mlFeatures.primaryKeywords[0] || id,
        count: category.mlFeatures.avgFootTraffic,
        icon: '🏢'
      })),
      priceRanges: PRICE_RANGES.map(range => ({
        id: range.id,
        label: range.label,
        count: range.count,
        emoji: '💰'
      })),
      environments: [
        { id: 'indoor_controlled', label: 'Interior', count: 0, icon: '🏢' },
        { id: 'indoor_semi_open', label: 'Semi-abierto', count: 0, icon: '🏬' },
        { id: 'outdoor_covered', label: 'Exterior cubierto', count: 0, icon: '🏛️' },
        { id: 'outdoor_exposed', label: 'Exterior', count: 0, icon: '🌤️' }
      ],
      audienceTypes: [
        { id: 'families', label: 'Familias', count: 0, icon: '👨‍👩‍👧‍👦' },
        { id: 'young_adults', label: 'Jóvenes', count: 0, icon: '👥' },
        { id: 'professionals', label: 'Profesionales', count: 0, icon: '💼' },
        { id: 'students', label: 'Estudiantes', count: 0, icon: '🎓' },
        { id: 'tourists', label: 'Turistas', count: 0, icon: '🧳' },
        { id: 'commuters', label: 'Viajeros', count: 0, icon: '🚇' },
        { id: 'shoppers', label: 'Compradores', count: 0, icon: '🛍️' }
      ]
    };
  }, []);

  // Quick filter actions
  const quickFilters = useMemo(() => ({
    togglePopular: () => {
      updateFilters({
        ...filters,
        features: {
          ...filters.features,
          rating: filters.features.rating === 4.5 ? null : 4.5
        }
      });
    },
    
    toggleMoments: () => {
      updateFilters({
        ...filters,
        features: {
          ...filters.features,
          allowsMoments: filters.features.allowsMoments ? null : true
        }
      });
    },
    
    toggleBudget: () => {
      const newRanges = filters.price.ranges.includes('budget')
        ? filters.price.ranges.filter(r => r !== 'budget')
        : [...filters.price.ranges, 'budget'];
      updateFilters({
        ...filters,
        price: { ...filters.price, ranges: newRanges }
      });
    },
    
    togglePremium: () => {
      const newRanges = filters.price.ranges.includes('premium')
        ? filters.price.ranges.filter(r => r !== 'premium')
        : [...filters.price.ranges, 'premium'];
      updateFilters({
        ...filters,
        price: { ...filters.price, ranges: newRanges }
      });
    }
  }), [filters, updateFilters]);

  // Filter management functions
  const addCityFilter = useCallback((cityId: string) => {
    if (!filters.location.cities.includes(cityId)) {
      updateFilters({
        ...filters,
        location: {
          ...filters.location,
          cities: [...filters.location.cities, cityId]
        }
      });
    }
  }, [filters, updateFilters]);

  const removeCityFilter = useCallback((cityId: string) => {
    updateFilters({
      ...filters,
      location: {
        ...filters.location,
        cities: filters.location.cities.filter(c => c !== cityId)
      }
    });
  }, [filters, updateFilters]);

  const addCategoryFilter = useCallback((categoryId: string) => {
    if (!filters.category.categories.includes(categoryId)) {
      updateFilters({
        ...filters,
        category: {
          ...filters.category,
          categories: [...filters.category.categories, categoryId]
        }
      });
    }
  }, [filters, updateFilters]);

  const removeCategoryFilter = useCallback((categoryId: string) => {
    updateFilters({
      ...filters,
      category: {
        ...filters.category,
        categories: filters.category.categories.filter(c => c !== categoryId)
      }
    });
  }, [filters, updateFilters]);

  const addPriceRangeFilter = useCallback((rangeId: string) => {
    if (!filters.price.ranges.includes(rangeId)) {
      updateFilters({
        ...filters,
        price: {
          ...filters.price,
          ranges: [...filters.price.ranges, rangeId]
        }
      });
    }
  }, [filters, updateFilters]);

  const removePriceRangeFilter = useCallback((rangeId: string) => {
    updateFilters({
      ...filters,
      price: {
        ...filters.price,
        ranges: filters.price.ranges.filter(r => r !== rangeId)
      }
    });
  }, [filters, updateFilters]);

  const setSearchQuery = useCallback((query: string) => {
    updateFilters({
      ...filters,
      search: { ...filters.search, query }
    });
  }, [filters, updateFilters]);

  const clearAllFilters = useCallback(() => {
    updateFilters(createEmptyFilterState());
  }, [updateFilters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.search.query.length > 0) count++;
    if (filters.location.cities.length > 0) count++;
    if (filters.category.categories.length > 0) count++;
    if (filters.price.ranges.length > 0) count++;
    if (filters.features.allowsMoments !== null) count++;
    if (filters.features.rating !== null) count++;
    if (filters.showFavoritesOnly) count++;
    if (!filters.showCircuits) count++;
    
    return count;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => activeFilterCount > 0, [activeFilterCount]);

  // Generate filter query for API
  const getFilterQuery = useCallback(() => {
    const query: Record<string, any> = {};

    // Search
    if (filters.search.query) {
      query.search = filters.search.query;
    }

    // Location
    if (filters.location.cities.length > 0) {
      query.cities = filters.location.cities;
    }

    // Categories
    if (filters.category.categories.length > 0) {
      query.categories = filters.category.categories;
    }

    // Price ranges
    if (filters.price.ranges.length > 0) {
      query.priceRanges = filters.price.ranges;
    }

    // Features
    if (filters.features.allowsMoments !== null) {
      query.allowsMoments = filters.features.allowsMoments;
    }

    if (filters.features.rating !== null) {
      query.minRating = filters.features.rating;
    }

    // Other filters
    if (filters.showFavoritesOnly) {
      query.favoritesOnly = true;
    }

    if (!filters.showCircuits) {
      query.excludeCircuits = true;
    }

    // Sort
    query.sortBy = filters.sort.field;
    query.sortOrder = filters.sort.direction;

    return query;
  }, [filters]);

  // Serialize filters for URL or storage
  const serializeFilters = useCallback(() => {
    return btoa(JSON.stringify(filters));
  }, [filters]);

  // Deserialize filters from URL or storage
  const deserializeFilters = useCallback((serialized: string) => {
    try {
      const parsed = JSON.parse(atob(serialized));
      updateFilters({ ...createEmptyFilterState(), ...parsed });
    } catch (error) {
      console.error('Error deserializing filters:', error);
      updateFilters(createEmptyFilterState());
    }
  }, [updateFilters]);

  // Save filters to localStorage
  const saveFiltersToStorage = useCallback(() => {
    try {
      localStorage.setItem('marketplace-filters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to storage:', error);
    }
  }, [filters]);

  // Load filters from localStorage
  const loadFiltersFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('marketplace-filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        updateFilters({ ...createEmptyFilterState(), ...parsed });
      }
    } catch (error) {
      console.error('Error loading filters from storage:', error);
    }
  }, [updateFilters]);

  // Auto-save filters to localStorage when they change
  useEffect(() => {
    if (hasActiveFilters) {
      saveFiltersToStorage();
    }
  }, [filters, hasActiveFilters, saveFiltersToStorage]);

  return {
    // State
    filters,
    filterOptions,
    isLoading,
    error,
    activeFilterCount,
    hasActiveFilters,

    // Actions
    updateFilters,
    quickFilters,
    
    // Specific filter actions
    addCityFilter,
    removeCityFilter,
    addCategoryFilter,
    removeCategoryFilter,
    addPriceRangeFilter,
    removePriceRangeFilter,
    setSearchQuery,
    clearAllFilters,

    // Utilities
    getFilterQuery,
    serializeFilters,
    deserializeFilters,
    saveFiltersToStorage,
    loadFiltersFromStorage
  };
};