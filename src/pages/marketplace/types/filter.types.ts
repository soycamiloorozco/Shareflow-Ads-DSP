/**
 * Filter-specific type definitions
 * Types for filtering, searching, and sorting functionality
 */

import { FilterState, FilterOption, EnhancedFilterState } from './marketplace.types';
import { LogicOperator } from './conditional-filter.types';

// =============================================================================
// VENUE TAXONOMY TYPES
// =============================================================================

export type VenueParentCategory = 
  | 'retail'
  | 'transit'
  | 'outdoor'
  | 'health_beauty'
  | 'point_of_care'
  | 'education'
  | 'office_buildings'
  | 'leisure'
  | 'government'
  | 'financial'
  | 'residential';

export type VenueChildCategory = string; // Dynamic based on parent category

export type EnvironmentType = 
  | 'indoor_controlled'
  | 'indoor_semi_open'
  | 'outdoor_covered'
  | 'outdoor_exposed';

export type DwellTime = 
  | 'very_short'  // < 30s
  | 'short'       // 30s - 2min
  | 'medium'      // 2 - 15min
  | 'long'        // 15 - 60min
  | 'very_long';  // > 60min

// =============================================================================
// SMART FILTER TYPES
// =============================================================================

export interface SmartFiltersState {
  readonly parentCategories: VenueParentCategory[];
  readonly childCategories: VenueChildCategory[];
  readonly environments: EnvironmentType[];
  readonly dwellTimes: DwellTime[];
  readonly priceRanges: string[];
  readonly allowsMoments: boolean | null;
  readonly rating: number | null;
}

export interface VenueFilter {
  readonly parentCategories: VenueParentCategory[];
  readonly childCategories: VenueChildCategory[];
  readonly environments: EnvironmentType[];
  readonly dwellTimes: DwellTime[];
}

// =============================================================================
// PRICE RANGE TYPES
// =============================================================================

export interface PriceRange {
  readonly id: string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly count: number;
  readonly emoji?: string;
  readonly popular?: boolean;
}

export const PRICE_RANGES: readonly PriceRange[] = [
  {
    id: 'budget',
    label: 'Económico',
    min: 0,
    max: 500000,
    count: 0,
    emoji: '💚',
    popular: true
  },
  {
    id: 'mid-range',
    label: 'Medio',
    min: 500000,
    max: 1000000,
    count: 0,
    emoji: '💛'
  },
  {
    id: 'premium',
    label: 'Premium',
    min: 1000000,
    max: 2000000,
    count: 0,
    emoji: '🧡',
    popular: true
  },
  {
    id: 'luxury',
    label: 'Lujo',
    min: 2000000,
    max: 5000000,
    count: 0,
    emoji: '💜'
  },
  {
    id: 'ultra-premium',
    label: 'Ultra Premium',
    min: 5000000,
    max: Number.MAX_SAFE_INTEGER,
    count: 0,
    emoji: '💎'
  }
] as const;

// =============================================================================
// SEARCH TYPES
// =============================================================================

export interface SearchSuggestion {
  readonly id: string;
  readonly text: string;
  readonly type: 'location' | 'category' | 'screen' | 'venue' | 'recent' | 'personalized';
  readonly count?: number;
  readonly icon?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface SearchHistory {
  readonly query: string;
  readonly timestamp: string;
  readonly resultCount: number;
  readonly filters?: Partial<FilterState>;
}

export interface SearchAnalytics {
  readonly query: string;
  readonly timestamp: string;
  readonly resultCount: number;
  readonly clickedResults: string[];
  readonly timeSpent: number;
  readonly refinements: number;
}

// =============================================================================
// SORT TYPES
// =============================================================================

export interface SortOption {
  readonly id: string;
  readonly label: string;
  readonly field: string;
  readonly direction: 'asc' | 'desc';
  readonly icon?: string;
  readonly description?: string;
}

export const SORT_OPTIONS: readonly SortOption[] = [
  {
    id: 'relevance',
    label: 'Relevancia',
    field: 'relevance',
    direction: 'desc',
    icon: '🎯',
    description: 'Ordenado por relevancia y popularidad'
  },
  {
    id: 'price_asc',
    label: 'Precio: Menor a Mayor',
    field: 'price',
    direction: 'asc',
    icon: '💰',
    description: 'Pantallas más económicas primero'
  },
  {
    id: 'price_desc',
    label: 'Precio: Mayor a Menor',
    field: 'price',
    direction: 'desc',
    icon: '💎',
    description: 'Pantallas premium primero'
  },
  {
    id: 'rating',
    label: 'Mejor Calificadas',
    field: 'rating',
    direction: 'desc',
    icon: '⭐',
    description: 'Ordenado por calificación de usuarios'
  },
  {
    id: 'views',
    label: 'Más Vistas',
    field: 'views',
    direction: 'desc',
    icon: '👁️',
    description: 'Pantallas con mayor audiencia'
  },
  {
    id: 'newest',
    label: 'Más Recientes',
    field: 'createdAt',
    direction: 'desc',
    icon: '🆕',
    description: 'Pantallas agregadas recientemente'
  }
] as const;

// =============================================================================
// FILTER PRESET TYPES
// =============================================================================

export interface FilterPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly filters: FilterState;
  readonly icon?: string;
  readonly popular?: boolean;
  readonly category?: string;
}

export const FILTER_PRESETS: readonly FilterPreset[] = [
  {
    id: 'high-traffic',
    name: 'Alto Tráfico',
    description: 'Pantallas en ubicaciones de alto tráfico peatonal',
    filters: {} as FilterState, // Would be populated with actual filter state
    icon: '🚶‍♂️',
    popular: true,
    category: 'audience'
  },
  {
    id: 'budget-friendly',
    name: 'Económicas',
    description: 'Pantallas con precios accesibles',
    filters: {} as FilterState,
    icon: '💚',
    popular: true,
    category: 'price'
  },
  {
    id: 'premium-locations',
    name: 'Ubicaciones Premium',
    description: 'Pantallas en las mejores ubicaciones de la ciudad',
    filters: {} as FilterState,
    icon: '⭐',
    popular: true,
    category: 'location'
  },
  {
    id: 'moments-enabled',
    name: 'Con Momentos',
    description: 'Pantallas que permiten anuncios de 15 segundos',
    filters: {} as FilterState,
    icon: '⚡',
    category: 'features'
  }
] as const;

// =============================================================================
// FILTER VALIDATION TYPES
// =============================================================================

export interface FilterValidationRule {
  readonly field: keyof FilterState;
  readonly validator: (value: unknown) => boolean;
  readonly message: string;
}

export interface FilterValidationResult {
  readonly isValid: boolean;
  readonly errors: Array<{
    readonly field: string;
    readonly message: string;
  }>;
  readonly warnings: Array<{
    readonly field: string;
    readonly message: string;
  }>;
}

// =============================================================================
// FILTER ANALYTICS TYPES
// =============================================================================

export interface FilterUsageAnalytics {
  readonly filterId: string;
  readonly usageCount: number;
  readonly lastUsed: string;
  readonly averageResultCount: number;
  readonly conversionRate: number;
}

export interface FilterPerformanceMetrics {
  readonly filterCombination: string;
  readonly searchTime: number;
  readonly resultCount: number;
  readonly userEngagement: number;
  readonly timestamp: string;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const createEmptyFilterState = (): FilterState => ({
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

export const isFilterActive = (filters: FilterState): boolean => {
  return (
    filters.search.query.length > 0 ||
    filters.location.cities.length > 0 ||
    filters.category.categories.length > 0 ||
    filters.price.ranges.length > 0 ||
    filters.features.allowsMoments !== null ||
    filters.features.rating !== null ||
    filters.showFavoritesOnly ||
    !filters.showCircuits
  );
};

export const getActiveFilterCount = (filters: FilterState): number => {
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
};

// Enhanced filter state utilities
export const createEmptyEnhancedFilterState = (): EnhancedFilterState => ({
  ...createEmptyFilterState(),
  conditionalRules: [],
  filterGroups: [],
  globalLogic: 'AND' as LogicOperator,
  displayMode: 'sections',
  viewMode: 'grid',
  metadata: {
    lastModified: new Date(),
    source: 'user',
    version: '2.0'
  }
});

export const isEnhancedFilterActive = (filters: EnhancedFilterState): boolean => {
  const legacyActive = isFilterActive(filters);
  const conditionalActive = filters.conditionalRules.length > 0 || filters.filterGroups.length > 0;
  return legacyActive || conditionalActive;
};

export const getEnhancedActiveFilterCount = (filters: EnhancedFilterState): number => {
  const legacyCount = getActiveFilterCount(filters);
  const conditionalCount = filters.conditionalRules.length + 
                          filters.filterGroups.reduce((sum, group) => sum + group.rules.length, 0);
  return legacyCount + conditionalCount;
};

export const serializeFilters = (filters: FilterState): string => {
  return btoa(JSON.stringify(filters));
};

export const deserializeFilters = (serialized: string): FilterState => {
  try {
    return JSON.parse(atob(serialized));
  } catch {
    return createEmptyFilterState();
  }
};

export const validateFilters = (filters: FilterState): FilterValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];
  const warnings: Array<{ field: string; message: string }> = [];
  
  // Validate price range
  if (filters.price.min < 0) {
    errors.push({ field: 'price.min', message: 'El precio mínimo no puede ser negativo' });
  }
  
  if (filters.price.max < filters.price.min) {
    errors.push({ field: 'price.max', message: 'El precio máximo debe ser mayor al mínimo' });
  }
  
  // Validate rating
  if (filters.features.rating !== null && (filters.features.rating < 0 || filters.features.rating > 5)) {
    errors.push({ field: 'features.rating', message: 'La calificación debe estar entre 0 y 5' });
  }
  
  // Add warnings for potentially restrictive filters
  if (getActiveFilterCount(filters) > 5) {
    warnings.push({ field: 'general', message: 'Muchos filtros activos pueden limitar los resultados' });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Type guards
export const isValidVenueParentCategory = (category: string): category is VenueParentCategory => {
  const validCategories: VenueParentCategory[] = [
    'retail', 'transit', 'outdoor', 'health_beauty', 'point_of_care',
    'education', 'office_buildings', 'leisure', 'government', 'financial', 'residential'
  ];
  return validCategories.includes(category as VenueParentCategory);
};

export const isValidEnvironmentType = (environment: string): environment is EnvironmentType => {
  const validEnvironments: EnvironmentType[] = [
    'indoor_controlled', 'indoor_semi_open', 'outdoor_covered', 'outdoor_exposed'
  ];
  return validEnvironments.includes(environment as EnvironmentType);
};

export const isValidDwellTime = (dwellTime: string): dwellTime is DwellTime => {
  const validDwellTimes: DwellTime[] = ['very_short', 'short', 'medium', 'long', 'very_long'];
  return validDwellTimes.includes(dwellTime as DwellTime);
};