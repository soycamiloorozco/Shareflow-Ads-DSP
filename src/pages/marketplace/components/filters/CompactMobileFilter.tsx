import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, Search, MapPin, Building2, DollarSign, Star, 
  Sparkles, Check, ChevronDown, Zap, Car, ShoppingBag, 
  TreePine, Stethoscope, GraduationCap, Banknote, Home, Landmark, Trophy,
  Heart
} from 'lucide-react';
import { FilterState, FilterOptions } from '../../types';
import { 
  VENUE_CATEGORIES, 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_ICONS, 
  VenueUtils 
} from '../../../../types/venue-categories';

interface CompactMobileFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableOptions: FilterOptions;
  resultCount: number;
  className?: string;
}

// Venue category icons mapping
const getVenueIcon = (categoryId: string): React.ComponentType<any> => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    transit: Car,
    retail: ShoppingBag,
    outdoor: TreePine,
    health_beauty: Stethoscope,
    point_of_care: Stethoscope,
    education: GraduationCap,
    office_buildings: Building2,
    leisure: Trophy,
    government: Landmark,
    financial: Banknote,
    residential: Home,
  };
  
  const key = Object.keys(iconMap).find(k => categoryId.toLowerCase().includes(k));
  return key ? iconMap[key] : Building2;
};

export const CompactMobileFilter = React.memo<CompactMobileFilterProps>(({
  filters,
  onFiltersChange,
  availableOptions,
  resultCount,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'quick' | 'location' | 'category' | 'price'>('quick');

  // Get venue categories from taxonomy
  const venueCategories = useMemo(() => {
    return VenueUtils.getAllCategories().map(cat => ({
      id: cat.key,
      label: cat.name,
      icon: getVenueIcon(cat.key),
      count: Math.floor(Math.random() * 50) + 5, // Mock count - replace with real data
      environment: cat.environment
    }));
  }, []);

  // Compact quick filters
  const quickFilters = useMemo(() => [
    {
      id: 'popular',
      label: 'Populares',
      icon: '🔥',
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
      icon: '⚡',
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
      icon: '💰',
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
    }
  ], [filters, onFiltersChange]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return filters.location.cities.length + 
           filters.category.categories.length + 
           filters.price.ranges.length +
           (filters.features.allowsMoments ? 1 : 0) +
           (filters.features.rating ? 1 : 0) +
           (filters.search.query ? 1 : 0);
  }, [filters]);

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

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {/* Compact Header */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#353FEF]" />
            <span className="font-medium text-gray-900 text-sm">Filtros</span>
            <span className="text-xs text-gray-500">
              ({resultCount})
            </span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#353FEF] text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Quick Filters Row */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {quickFilters.map(filter => (
            <button
              key={filter.id}
              onClick={filter.action}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter.active
                  ? 'bg-[#353FEF] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
          
          {/* Favorites Toggle */}
          <button
            onClick={() => onFiltersChange({
              ...filters,
              showFavoritesOnly: !filters.showFavoritesOnly
            })}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.showFavoritesOnly
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-3 h-3 ${filters.showFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Favoritos</span>
          </button>
        </div>
      </div>

      {/* Expandable Detailed Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            {/* Section Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { id: 'quick', label: 'Rápido', icon: Zap },
                { id: 'location', label: 'Ubicación', icon: MapPin },
                { id: 'category', label: 'Tipo', icon: Building2 },
                { id: 'price', label: 'Precio', icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeSection === tab.id
                      ? 'border-[#353FEF] text-[#353FEF] bg-[#353FEF]/5'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Section Content */}
            <div className="p-3 max-h-64 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeSection === 'quick' && (
                    <QuickSection 
                      filters={filters}
                      onFiltersChange={onFiltersChange}
                    />
                  )}
                  
                  {activeSection === 'location' && (
                    <LocationSection
                      selectedCities={filters.location.cities}
                      availableCities={availableOptions.cities}
                      onCitiesChange={(cities) => onFiltersChange({
                        ...filters,
                        location: { ...filters.location, cities }
                      })}
                    />
                  )}
                  
                  {activeSection === 'category' && (
                    <CategorySection
                      selectedCategories={filters.category.categories}
                      venueCategories={venueCategories}
                      onCategoriesChange={(categories) => onFiltersChange({
                        ...filters,
                        category: { ...filters.category, categories }
                      })}
                    />
                  )}
                  
                  {activeSection === 'price' && (
                    <PriceSection
                      selectedRanges={filters.price.ranges}
                      availableRanges={availableOptions.priceRanges}
                      onRangesChange={(ranges) => onFiltersChange({
                        ...filters,
                        price: { ...filters.price, ranges }
                      })}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Quick Section
const QuickSection: React.FC<{
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}> = ({ filters, onFiltersChange }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onFiltersChange({
          ...filters,
          features: { 
            ...filters.features, 
            allowsMoments: filters.features.allowsMoments ? null : true 
          }
        })}
        className={`p-2 rounded-lg text-xs font-medium transition-all ${
          filters.features.allowsMoments
            ? 'bg-purple-100 text-purple-700 border border-purple-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>Momentos</span>
        </div>
      </button>

      <button
        onClick={() => onFiltersChange({
          ...filters,
          features: { 
            ...filters.features, 
            rating: filters.features.rating === 4.5 ? null : 4.5 
          }
        })}
        className={`p-2 rounded-lg text-xs font-medium transition-all ${
          filters.features.rating
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3" />
          <span>4.5+ ⭐</span>
        </div>
      </button>
    </div>

    <div className="flex gap-2">
      {['budget', 'premium'].map(range => (
        <button
          key={range}
          onClick={() => {
            const newRanges = filters.price.ranges.includes(range)
              ? filters.price.ranges.filter(r => r !== range)
              : [...filters.price.ranges, range];
            onFiltersChange({
              ...filters,
              price: { ...filters.price, ranges: newRanges }
            });
          }}
          className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all ${
            filters.price.ranges.includes(range)
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {range === 'budget' ? '💰 Económico' : '💎 Premium'}
        </button>
      ))}
    </div>
  </div>
);

// Location Section
const LocationSection: React.FC<{
  selectedCities: string[];
  availableCities: any[];
  onCitiesChange: (cities: string[]) => void;
}> = ({ selectedCities, availableCities, onCitiesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = availableCities.filter(city =>
    city.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCity = (cityId: string) => {
    if (selectedCities.includes(cityId)) {
      onCitiesChange(selectedCities.filter(id => id !== cityId));
    } else {
      onCitiesChange([...selectedCities, cityId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar ciudades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors"
        />
      </div>

      <div className="space-y-1">
        {filteredCities.slice(0, 6).map(city => {
          const isSelected = selectedCities.includes(city.id);
          return (
            <button
              key={city.id}
              onClick={() => toggleCity(city.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                isSelected
                  ? 'bg-[#353FEF]/10 text-[#353FEF] border border-[#353FEF]/20'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">{city.label}</span>
                <span className="text-gray-500">({city.count})</span>
              </div>
              {isSelected && <Check className="w-3 h-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Category Section
const CategorySection: React.FC<{
  selectedCategories: string[];
  venueCategories: any[];
  onCategoriesChange: (categories: string[]) => void;
}> = ({ selectedCategories, venueCategories, onCategoriesChange }) => {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  // Group categories by parent type
  const groupedCategories = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    venueCategories.forEach(cat => {
      const parentType = cat.key.split('_')[0];
      const groupName = parentType === 'retail' ? 'Comercial' :
                       parentType === 'transit' ? 'Transporte' :
                       parentType === 'leisure' ? 'Entretenimiento' :
                       parentType === 'outdoor' ? 'Exterior' : 'Otros';
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(cat);
    });
    
    return groups;
  }, [venueCategories]);

  return (
    <div className="space-y-3">
      {Object.entries(groupedCategories).slice(0, 3).map(([groupName, categories]) => (
        <div key={groupName}>
          <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <span>
              {groupName === 'Comercial' ? '🏬' : 
               groupName === 'Transporte' ? '🚗' : 
               groupName === 'Entretenimiento' ? '🎭' : 
               groupName === 'Exterior' ? '🌳' : '🏢'}
            </span>
            {groupName}
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {categories.slice(0, 4).map(category => {
              const isSelected = selectedCategories.includes(category.id);
              const Icon = category.icon;
              
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#353FEF]/10 text-[#353FEF] border border-[#353FEF]/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />
                    <span className="truncate">{category.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Price Section
const PriceSection: React.FC<{
  selectedRanges: string[];
  availableRanges: any[];
  onRangesChange: (ranges: string[]) => void;
}> = ({ selectedRanges, availableRanges, onRangesChange }) => {
  const toggleRange = (rangeId: string) => {
    if (selectedRanges.includes(rangeId)) {
      onRangesChange(selectedRanges.filter(id => id !== rangeId));
    } else {
      onRangesChange([...selectedRanges, rangeId]);
    }
  };

  return (
    <div className="space-y-2">
      {availableRanges.slice(0, 4).map(range => {
        const isSelected = selectedRanges.includes(range.id);
        return (
          <button
            key={range.id}
            onClick={() => toggleRange(range.id)}
            disabled={range.count === 0}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
              range.count === 0
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                : isSelected
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{range.emoji}</span>
              <span className="font-medium">{range.label}</span>
              <span className="text-gray-500">({range.count})</span>
            </div>
            {isSelected && <Check className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
};

CompactMobileFilter.displayName = 'CompactMobileFilter';