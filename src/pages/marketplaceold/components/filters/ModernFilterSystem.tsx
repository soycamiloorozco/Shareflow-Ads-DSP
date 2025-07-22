import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, MapPin, Building2, DollarSign, 
  Star, Sparkles, Clock, Users, TrendingUp, Zap, Check, Plus
} from 'lucide-react';
import { FilterState, FilterOptions } from '../../types';
import { MobileFilterDrawer } from './MobileFilterDrawer';

interface ModernFilterSystemProps {
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

export const ModernFilterSystem = React.memo<ModernFilterSystemProps>(({
  filters,
  onFiltersChange,
  availableOptions,
  resultCount,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'location' | 'category' | 'price' | 'features'>('quick');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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
      count: availableOptions.priceRanges.find(r => r.id === 'budget')?.count || 0,
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
      count: availableOptions.priceRanges.find(r => r.id === 'premium')?.count || 0,
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
      const city = availableOptions.cities.find(c => c.id === cityId);
      if (city) {
        chips.push({
          id: `city-${cityId}`,
          label: city.label,
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
      const category = availableOptions.categories.find(c => c.id === categoryId);
      if (category) {
        chips.push({
          id: `category-${categoryId}`,
          label: category.label,
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
      const range = availableOptions.priceRanges.find(r => r.id === rangeId);
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
  }, [filters, availableOptions, onFiltersChange]);

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
    <>
      {/* Desktop/Tablet Filter System */}
      <div className={`hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
        {/* Compact Header */}
        <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 group"
          >
            <div className="p-2 bg-[#353FEF]/10 rounded-xl group-hover:bg-[#353FEF]/20 transition-colors">
              <Filter className="w-5 h-5 text-[#353FEF]" />
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
            {/* Filter Tabs */}
            <div className="border-b border-gray-100">
              <div className="flex overflow-x-auto scrollbar-hide">
                {[
                  { id: 'quick', label: 'Rápidos', icon: Zap },
                  { id: 'location', label: 'Ubicación', icon: MapPin },
                  { id: 'category', label: 'Categoría', icon: Building2 },
                  { id: 'price', label: 'Precio', icon: DollarSign },
                  { id: 'features', label: 'Características', icon: Star }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors min-h-[44px] ${
                      activeTab === tab.id
                        ? 'border-[#353FEF] text-[#353FEF] bg-[#353FEF]/5'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'quick' && (
                    <QuickFiltersTab 
                      quickFilters={quickFilters}
                      onClearAll={clearAllFilters}
                    />
                  )}
                  
                  {activeTab === 'location' && (
                    <LocationFiltersTab
                      selectedCities={filters.location.cities}
                      availableCities={availableOptions.cities}
                      onCitiesChange={(cities) => onFiltersChange({
                        ...filters,
                        location: { ...filters.location, cities }
                      })}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  )}
                  
                  {activeTab === 'category' && (
                    <CategoryFiltersTab
                      selectedCategories={filters.category.categories}
                      availableCategories={availableOptions.categories}
                      onCategoriesChange={(categories) => onFiltersChange({
                        ...filters,
                        category: { ...filters.category, categories }
                      })}
                    />
                  )}
                  
                  {activeTab === 'price' && (
                    <PriceFiltersTab
                      selectedRanges={filters.price.ranges}
                      availableRanges={availableOptions.priceRanges}
                      onRangesChange={(ranges) => onFiltersChange({
                        ...filters,
                        price: { ...filters.price, ranges }
                      })}
                    />
                  )}
                  
                  {activeTab === 'features' && (
                    <FeaturesFiltersTab
                      features={filters.features}
                      onFeaturesChange={(features) => onFiltersChange({
                        ...filters,
                        features
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

      {/* Mobile Filter Button & Compact Display */}
      <div className="lg:hidden">
        {/* Mobile Quick Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#353FEF]" />
              <span className="font-medium text-gray-900">Filtros</span>
              <span className="text-sm text-gray-500">
                ({resultCount} {resultCount === 1 ? 'resultado' : 'resultados'})
              </span>
            </div>
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="px-3 py-1.5 bg-[#353FEF] text-white rounded-lg text-sm font-medium hover:bg-[#2A32C5] transition-colors"
            >
              Filtrar
            </button>
          </div>

          {/* Mobile Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickFilters.slice(0, 3).map(filter => {
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
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips - Mobile */}
          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <AnimatePresence>
                {activeChips.slice(0, 4).map(chip => (
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
              {activeChips.length > 4 && (
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
                >
                  +{activeChips.length - 4} más
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableOptions={availableOptions}
        resultCount={resultCount}
      />

      {/* Floating Filter Button for Mobile (when scrolled) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-14 h-14 bg-[#353FEF] text-white rounded-full shadow-lg hover:bg-[#2A32C5] transition-colors flex items-center justify-center"
        >
          <Filter className="w-6 h-6" />
          {activeChips.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {activeChips.length}
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
});

// Quick Filters Tab
const QuickFiltersTab: React.FC<{
  quickFilters: QuickFilter[];
  onClearAll: () => void;
}> = ({ quickFilters, onClearAll }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900">Filtros Rápidos</h4>
      <button
        onClick={onClearAll}
        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        Limpiar todos
      </button>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      {quickFilters.map(filter => {
        const Icon = filter.icon;
        return (
          <button
            key={filter.id}
            onClick={filter.action}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter.active
                ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-5 h-5 ${filter.active ? 'text-[#353FEF]' : 'text-gray-500'}`} />
              <span className="font-medium">{filter.label}</span>
            </div>
            {filter.count && (
              <p className="text-sm text-gray-500">
                {filter.count} pantallas disponibles
              </p>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// Location Filters Tab
const LocationFiltersTab: React.FC<{
  selectedCities: string[];
  availableCities: any[];
  onCitiesChange: (cities: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ selectedCities, availableCities, onCitiesChange, searchQuery, onSearchChange }) => {
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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar ciudades..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
        {filteredCities.map(city => {
          const isSelected = selectedCities.includes(city.id);
          return (
            <button
              key={city.id}
              onClick={() => toggleCity(city.id)}
              className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : 'text-gray-500'}`} />
                <div>
                  <div className="font-medium">{city.label}</div>
                  <div className="text-sm text-gray-500">{city.count} pantallas</div>
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[#353FEF]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Category Filters Tab
const CategoryFiltersTab: React.FC<{
  selectedCategories: string[];
  availableCategories: any[];
  onCategoriesChange: (categories: string[]) => void;
}> = ({ selectedCategories, availableCategories, onCategoriesChange }) => {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {availableCategories.map(category => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
              isSelected
                ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : 'text-gray-500'}`} />
              <div>
                <div className="font-medium">{category.label}</div>
                <div className="text-sm text-gray-500">{category.count} pantallas</div>
              </div>
            </div>
            {isSelected && <Check className="w-4 h-4 text-[#353FEF]" />}
          </button>
        );
      })}
    </div>
  );
};

// Price Filters Tab
const PriceFiltersTab: React.FC<{
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
    <div className="grid grid-cols-1 gap-2">
      {availableRanges.map(range => {
        const isSelected = selectedRanges.includes(range.id);
        return (
          <button
            key={range.id}
            onClick={() => toggleRange(range.id)}
            disabled={range.count === 0}
            className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
              range.count === 0
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : isSelected
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{range.emoji}</span>
              <div>
                <div className="font-medium">{range.label}</div>
                <div className="text-sm opacity-75">{range.count} pantallas</div>
              </div>
            </div>
            {isSelected && <Check className="w-4 h-4 text-green-600" />}
          </button>
        );
      })}
    </div>
  );
};

// Features Filters Tab
const FeaturesFiltersTab: React.FC<{
  features: any;
  onFeaturesChange: (features: any) => void;
}> = ({ features, onFeaturesChange }) => (
  <div className="space-y-4">
    <button
      onClick={() => onFeaturesChange({
        ...features,
        allowsMoments: features.allowsMoments ? null : true
      })}
      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
        features.allowsMoments
          ? 'border-purple-500 bg-purple-50 text-purple-700'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Sparkles className={`w-5 h-5 ${features.allowsMoments ? 'text-purple-600' : 'text-gray-500'}`} />
        <div className="text-left">
          <div className="font-medium">Permite Momentos</div>
          <div className="text-sm opacity-75">Anuncios de 15 segundos</div>
        </div>
      </div>
      {features.allowsMoments && <Check className="w-5 h-5 text-purple-600" />}
    </button>

    <div>
      <h5 className="font-medium text-gray-900 mb-3">Rating mínimo</h5>
      <div className="flex gap-2">
        {[4, 4.5, 5].map(rating => (
          <button
            key={rating}
            onClick={() => onFeaturesChange({
              ...features,
              rating: features.rating === rating ? null : rating
            })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              features.rating === rating
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
            {rating}+
          </button>
        ))}
      </div>
    </div>
  </div>
);

ModernFilterSystem.displayName = 'ModernFilterSystem';