import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, MapPin, Building2, DollarSign, 
  Star, Sparkles, Clock, Users, TrendingUp, Zap, Check, Plus, Sliders
} from 'lucide-react';
import { FilterState, FilterOptions } from '../../types';
import { 
  VENUE_CATEGORIES, 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_ICONS, 
  CITIES, 
  PRICE_RANGES, 
  ENVIRONMENTS, 
  AUDIENCE_TYPES,
  VenueParentCategory,
  VenueChildCategory,
  EnvironmentType,
  AudienceType
} from '../../../../types/venue-categories';

interface SmartFilterSystemProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableOptions: FilterOptions;
  resultCount: number;
  className?: string;
}

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  count?: number;
  action: () => void;
  active: boolean;
}

interface FilterChip {
  id: string;
  label: string;
  value: string;
  color: string;
  onRemove: () => void;
}

export const SmartFilterSystem = React.memo<SmartFilterSystemProps>(({
  filters,
  onFiltersChange,
  availableOptions,
  resultCount,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'location' | 'category' | 'price' | 'features'>('quick');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick filters for common actions
  const quickFilters: QuickFilter[] = useMemo(() => [
    {
      id: 'popular',
      label: 'Populares',
      icon: TrendingUp,
      color: 'orange',
      count: availableOptions.categories.reduce((sum, cat) => sum + (cat.count > 15 ? cat.count : 0), 0),
      active: filters.features.rating !== null && filters.features.rating >= 4.5,
      action: () => onFiltersChange({
        ...filters,
        features: { 
          ...filters.features, 
          rating: filters.features.rating === 4.5 ? null : 4.5 
        }
      })
    },
    {
      id: 'moments',
      label: 'Momentos',
      icon: Zap,
      color: 'purple',
      count: 23,
      active: filters.features.allowsMoments === true,
      action: () => onFiltersChange({
        ...filters,
        features: { 
          ...filters.features, 
          allowsMoments: filters.features.allowsMoments ? null : true 
        }
      })
    },
    {
      id: 'budget',
      label: 'Económico',
      icon: DollarSign,
      color: 'green',
      count: PRICE_RANGES.find(r => r.id === 'budget')?.count || 0,
      active: filters.price.ranges.includes('budget'),
      action: () => {
        const newRanges = filters.price.ranges.includes('budget')
          ? filters.price.ranges.filter(r => r !== 'budget')
          : [...filters.price.ranges, 'budget'];
        onFiltersChange({
          ...filters,
          price: { ...filters.price, ranges: newRanges }
        });
      }
    },
    {
      id: 'premium',
      label: 'Premium',
      icon: Star,
      color: 'blue',
      count: PRICE_RANGES.find(r => r.id === 'premium')?.count || 0,
      active: filters.price.ranges.includes('premium'),
      action: () => {
        const newRanges = filters.price.ranges.includes('premium')
          ? filters.price.ranges.filter(r => r !== 'premium')
          : [...filters.price.ranges, 'premium'];
        onFiltersChange({
          ...filters,
          price: { ...filters.price, ranges: newRanges }
        });
      }
    }
  ], [filters, onFiltersChange, availableOptions]);

  // Active filter chips
  const activeChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = [];

    // Search chip
    if (filters.search.query) {
      chips.push({
        id: 'search',
        label: `"${filters.search.query}"`,
        value: filters.search.query,
        color: 'gray',
        onRemove: () => onFiltersChange({
          ...filters,
          search: { ...filters.search, query: '' }
        })
      });
    }

    // City chips
    filters.location.cities.forEach(cityId => {
      const city = CITIES.find(c => c.id === cityId);
      if (city) {
        chips.push({
          id: `city-${cityId}`,
          label: city.name,
          value: cityId,
          color: 'blue',
          onRemove: () => onFiltersChange({
            ...filters,
            location: {
              ...filters.location,
              cities: filters.location.cities.filter(c => c !== cityId)
            }
          })
        });
      }
    });

    // Category chips
    filters.category.categories.forEach(categoryId => {
      const categoryName = CATEGORY_DISPLAY_NAMES[categoryId];
      if (categoryName) {
        chips.push({
          id: `category-${categoryId}`,
          label: categoryName,
          value: categoryId,
          color: 'indigo',
          onRemove: () => onFiltersChange({
            ...filters,
            category: {
              ...filters.category,
              categories: filters.category.categories.filter(c => c !== categoryId)
            }
          })
        });
      }
    });

    // Price range chips
    filters.price.ranges.forEach(rangeId => {
      const range = PRICE_RANGES.find(r => r.id === rangeId);
      if (range) {
        chips.push({
          id: `price-${rangeId}`,
          label: range.label,
          value: rangeId,
          color: 'green',
          onRemove: () => onFiltersChange({
            ...filters,
            price: {
              ...filters.price,
              ranges: filters.price.ranges.filter(r => r !== rangeId)
            }
          })
        });
      }
    });

    return chips;
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
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
  }, [onFiltersChange]);

  const getColorClasses = (color: string, active: boolean = false) => {
    const colors = {
      orange: active ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 border-orange-200',
      purple: active ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 border-purple-200',
      green: active ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 border-green-200',
      blue: active ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 border-blue-200',
      indigo: active ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
      gray: active ? 'bg-gray-500 text-white' : 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Compact Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 group"
          >
            <div className="p-2 bg-[#353FEF]/10 rounded-xl group-hover:bg-[#353FEF]/20 transition-colors">
              <Sliders className="w-5 h-5 text-[#353FEF]" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Filtros</h3>
              <p className="text-sm text-gray-500">
                {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
              </p>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {activeChips.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Quick Filters - Always Visible */}
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickFilters.map(filter => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={filter.action}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all min-h-[44px] ${
                    getColorClasses(filter.color, filter.active)
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                  {filter.count && filter.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      filter.active ? 'bg-white/20' : 'bg-black/10'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <AnimatePresence>
              {activeChips.map(chip => (
                <motion.div
                  key={chip.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                    getColorClasses(chip.color, true)
                  }`}
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Expandable Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Filtros avanzados disponibles próximamente</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SmartFilterSystem.displayName = 'SmartFilterSystem';