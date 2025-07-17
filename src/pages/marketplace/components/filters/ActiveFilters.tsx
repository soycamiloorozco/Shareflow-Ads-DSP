/**
 * ActiveFilters Component - Displays and manages active filter chips
 * Provides visual feedback for applied filters with removal functionality
 */

import React, { useCallback } from 'react';
import { X, MapPin, Building2, DollarSign, Star, Heart, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterState } from '../../types/marketplace.types';

interface FilterOptions {
  cities: Array<{ value: string; label: string; count: number }>;
  categories: Array<{ id: string; label: string; count: number; icon?: string }>;
  priceRanges: Array<{ id: string; label: string; min: number; max: number; count: number }>;
  venueTypes: Array<{ id: string; label: string; count: number; icon?: string }>;
}

interface ActiveFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableOptions: FilterOptions;
  className?: string;
  'aria-label'?: string;
}

interface ActiveFilter {
  type: string;
  value: string;
  label: string;
  emoji: string;
  onRemove: () => void;
}

export const ActiveFilters = React.memo<ActiveFiltersProps>(({
  filters,
  onFiltersChange,
  availableOptions,
  className = '',
  'aria-label': ariaLabel = 'Active filters'
}) => {
  // Generate active filters array
  const activeFilters: ActiveFilter[] = [];

  // Add search filter
  if (filters.search.query) {
    activeFilters.push({
      type: 'search',
      value: filters.search.query,
      label: `"${filters.search.query}"`,
      emoji: '🔍',
      onRemove: () => onFiltersChange({
        ...filters,
        search: { ...filters.search, query: '' }
      })
    });
  }

  // Add city filters
  filters.location.cities.forEach(cityValue => {
    const city = availableOptions.cities.find(c => c.value === cityValue);
    activeFilters.push({
      type: 'city',
      value: cityValue,
      label: city?.label || cityValue,
      emoji: '📍',
      onRemove: () => onFiltersChange({
        ...filters,
        location: {
          ...filters.location,
          cities: filters.location.cities.filter(c => c !== cityValue)
        }
      })
    });
  });

  // Add category filters
  filters.category.categories.forEach(categoryId => {
    const category = availableOptions.categories.find(c => c.id === categoryId);
    activeFilters.push({
      type: 'category',
      value: categoryId,
      label: category?.label || categoryId,
      emoji: '🏢',
      onRemove: () => onFiltersChange({
        ...filters,
        category: {
          ...filters.category,
          categories: filters.category.categories.filter(c => c !== categoryId)
        }
      })
    });
  });

  // Add venue type filters
  filters.category.venueTypes.forEach(venueTypeId => {
    const venueType = availableOptions.venueTypes.find(v => v.id === venueTypeId);
    activeFilters.push({
      type: 'venueType',
      value: venueTypeId,
      label: venueType?.label || venueTypeId,
      emoji: '🏪',
      onRemove: () => onFiltersChange({
        ...filters,
        category: {
          ...filters.category,
          venueTypes: filters.category.venueTypes.filter(v => v !== venueTypeId)
        }
      })
    });
  });

  // Add environment filters
  filters.category.environments.forEach(environmentId => {
    const environmentLabels: Record<string, string> = {
      indoor_controlled: 'Interior Controlado',
      indoor_semi_open: 'Interior Semi-abierto',
      outdoor_covered: 'Exterior Cubierto',
      outdoor_exposed: 'Exterior Expuesto'
    };
    
    activeFilters.push({
      type: 'environment',
      value: environmentId,
      label: environmentLabels[environmentId] || environmentId,
      emoji: environmentId.includes('outdoor') ? '🌤️' : '🏠',
      onRemove: () => onFiltersChange({
        ...filters,
        category: {
          ...filters.category,
          environments: filters.category.environments.filter(e => e !== environmentId)
        }
      })
    });
  });

  // Add dwell time filters
  filters.category.dwellTimes.forEach(dwellTimeId => {
    const dwellTimeLabels: Record<string, string> = {
      very_short: 'Muy Corto',
      short: 'Corto',
      medium: 'Medio',
      long: 'Largo',
      very_long: 'Muy Largo'
    };
    
    activeFilters.push({
      type: 'dwellTime',
      value: dwellTimeId,
      label: dwellTimeLabels[dwellTimeId] || dwellTimeId,
      emoji: '⏱️',
      onRemove: () => onFiltersChange({
        ...filters,
        category: {
          ...filters.category,
          dwellTimes: filters.category.dwellTimes.filter(d => d !== dwellTimeId)
        }
      })
    });
  });

  // Add price range filters
  filters.price.ranges.forEach(rangeId => {
    const range = availableOptions.priceRanges.find(r => r.id === rangeId);
    activeFilters.push({
      type: 'priceRange',
      value: rangeId,
      label: range?.label || rangeId,
      emoji: '💰',
      onRemove: () => onFiltersChange({
        ...filters,
        price: {
          ...filters.price,
          ranges: filters.price.ranges.filter(r => r !== rangeId)
        }
      })
    });
  });

  // Add feature filters
  if (filters.features.allowsMoments) {
    activeFilters.push({
      type: 'moments',
      value: 'true',
      label: 'Permite Momentos',
      emoji: '⚡',
      onRemove: () => onFiltersChange({
        ...filters,
        features: { ...filters.features, allowsMoments: null }
      })
    });
  }

  if (filters.features.rating !== null) {
    activeFilters.push({
      type: 'rating',
      value: filters.features.rating.toString(),
      label: `${filters.features.rating}+ estrellas`,
      emoji: '⭐',
      onRemove: () => onFiltersChange({
        ...filters,
        features: { ...filters.features, rating: null }
      })
    });
  }

  // Add favorites filter
  if (filters.showFavoritesOnly) {
    activeFilters.push({
      type: 'favorites',
      value: 'true',
      label: 'Solo Favoritos',
      emoji: '❤️',
      onRemove: () => onFiltersChange({
        ...filters,
        showFavoritesOnly: false
      })
    });
  }

  // Add circuits filter
  if (!filters.showCircuits) {
    activeFilters.push({
      type: 'circuits',
      value: 'false',
      label: 'Sin Circuitos',
      emoji: '🚫',
      onRemove: () => onFiltersChange({
        ...filters,
        showCircuits: true
      })
    });
  }

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      search: { query: '' },
      location: { cities: [] },
      category: { 
        categories: [], 
        venueTypes: [], 
        environments: [], 
        dwellTimes: [] 
      },
      price: { ranges: [], currency: 'COP' },
      features: { allowsMoments: null, rating: null, accessibility: [] },
      availability: {},
      sort: { field: 'relevance', direction: 'desc' },
      showFavoritesOnly: false,
      showCircuits: true,
    });
  }, [onFiltersChange]);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`} role="group" aria-label={ariaLabel}>
      {/* Active Filters Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Filtros activos ({activeFilters.length})
        </span>
        <button
          onClick={clearAllFilters}
          className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Clear all active filters"
        >
          Limpiar todos
        </button>
      </div>

      {/* Active Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {activeFilters.map((filter, index) => (
            <motion.div
              key={`${filter.type}-${filter.value}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200 hover:bg-blue-200 transition-colors"
            >
              <span aria-hidden="true">{filter.emoji}</span>
              <span className="font-medium">{filter.label}</span>
              <button
                onClick={filter.onRemove}
                className="hover:bg-blue-300 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Filter Summary */}
      {activeFilters.length > 3 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
          💡 Tienes {activeFilters.length} filtros activos. Usa "Limpiar todos" para resetear la búsqueda.
        </div>
      )}
    </div>
  );
});

ActiveFilters.displayName = 'ActiveFilters';