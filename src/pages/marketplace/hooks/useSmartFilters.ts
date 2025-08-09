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
    clearAllFilters,

    // Utilities
    getFilterQuery
  };
};