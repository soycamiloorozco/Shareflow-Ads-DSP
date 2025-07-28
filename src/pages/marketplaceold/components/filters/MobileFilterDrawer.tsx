import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Filter, Search, MapPin, Building2, DollarSign, Star, 
  Sparkles, Check, ChevronRight, Zap, TrendingUp
} from 'lucide-react';
import { FilterState, FilterOptions } from '../../types';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableOptions: FilterOptions;
  resultCount: number;
}

export const MobileFilterDrawer = React.memo<MobileFilterDrawerProps>(({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableOptions,
  resultCount
}) => {
  const [activeStep, setActiveStep] = useState<'main' | 'location' | 'category' | 'price' | 'features'>('main');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = useCallback(() => {
    setActiveStep('main');
  }, []);

  const handleApplyAndClose = useCallback(() => {
    onClose();
  }, [onClose]);

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

  // Quick actions for main screen
  const quickActions = [
    {
      id: 'popular',
      label: 'Populares',
      icon: TrendingUp,
      color: 'orange',
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
      label: 'Con Momentos',
      icon: Zap,
      color: 'purple',
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
  ];

  const getActiveCount = (section: string) => {
    switch (section) {
      case 'location': return filters.location.cities.length;
      case 'category': return filters.category.categories.length;
      case 'price': return filters.price.ranges.length;
      case 'features': 
        return (filters.features.allowsMoments ? 1 : 0) + (filters.features.rating ? 1 : 0);
      default: return 0;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  {activeStep !== 'main' && (
                    <button
                      onClick={handleBack}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activeStep === 'main' ? 'Filtros' :
                       activeStep === 'location' ? 'Ubicación' :
                       activeStep === 'category' ? 'Categorías' :
                       activeStep === 'price' ? 'Precio' :
                       'Características'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4"
                  >
                    {activeStep === 'main' && (
                      <MainFilterScreen
                        quickActions={quickActions}
                        onNavigate={setActiveStep}
                        getActiveCount={getActiveCount}
                        onClearAll={clearAllFilters}
                      />
                    )}

                    {activeStep === 'location' && (
                      <LocationFilterScreen
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

                    {activeStep === 'category' && (
                      <CategoryFilterScreen
                        selectedCategories={filters.category.categories}
                        availableCategories={availableOptions.categories}
                        onCategoriesChange={(categories) => onFiltersChange({
                          ...filters,
                          category: { ...filters.category, categories }
                        })}
                      />
                    )}

                    {activeStep === 'price' && (
                      <PriceFilterScreen
                        selectedRanges={filters.price.ranges}
                        availableRanges={availableOptions.priceRanges}
                        onRangesChange={(ranges) => onFiltersChange({
                          ...filters,
                          price: { ...filters.price, ranges }
                        })}
                      />
                    )}

                    {activeStep === 'features' && (
                      <FeaturesFilterScreen
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

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <button
                  onClick={handleApplyAndClose}
                  className="w-full bg-[#353FEF] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#2A32C5] transition-colors"
                >
                  Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// Main Filter Screen
const MainFilterScreen: React.FC<{
  quickActions: any[];
  onNavigate: (step: any) => void;
  getActiveCount: (section: string) => number;
  onClearAll: () => void;
}> = ({ quickActions, onNavigate, getActiveCount, onClearAll }) => (
  <div className="space-y-6">
    {/* Quick Actions */}
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Filtros Rápidos</h3>
      <div className="space-y-2">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                action.active
                  ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${action.active ? 'text-[#353FEF]' : 'text-gray-500'}`} />
                <span className="font-medium">{action.label}</span>
              </div>
              {action.active && <Check className="w-5 h-5 text-[#353FEF]" />}
            </button>
          );
        })}
      </div>
    </div>

    {/* Filter Categories */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Filtros Detallados</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Limpiar todo
        </button>
      </div>
      
      <div className="space-y-2">
        {[
          { id: 'location', label: 'Ubicación', icon: MapPin },
          { id: 'category', label: 'Categorías', icon: Building2 },
          { id: 'price', label: 'Precio', icon: DollarSign },
          { id: 'features', label: 'Características', icon: Star }
        ].map(section => {
          const Icon = section.icon;
          const activeCount = getActiveCount(section.id);
          
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id as any)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">{section.label}</span>
                {activeCount > 0 && (
                  <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// Location Filter Screen
const LocationFilterScreen: React.FC<{
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

      <div className="space-y-2">
        {filteredCities.map(city => {
          const isSelected = selectedCities.includes(city.id);
          return (
            <button
              key={city.id}
              onClick={() => toggleCity(city.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : 'text-gray-500'}`} />
                <div className="text-left">
                  <div className="font-medium">{city.label}</div>
                  <div className="text-sm opacity-75">{city.count} pantallas</div>
                </div>
              </div>
              {isSelected && <Check className="w-5 h-5 text-[#353FEF]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Category Filter Screen
const CategoryFilterScreen: React.FC<{
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
    <div className="space-y-2">
      {availableCategories.map(category => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              isSelected
                ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : 'text-gray-500'}`} />
              <div className="text-left">
                <div className="font-medium">{category.label}</div>
                <div className="text-sm opacity-75">{category.count} pantallas</div>
              </div>
            </div>
            {isSelected && <Check className="w-5 h-5 text-[#353FEF]" />}
          </button>
        );
      })}
    </div>
  );
};

// Price Filter Screen
const PriceFilterScreen: React.FC<{
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
      {availableRanges.map(range => {
        const isSelected = selectedRanges.includes(range.id);
        return (
          <button
            key={range.id}
            onClick={() => toggleRange(range.id)}
            disabled={range.count === 0}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              range.count === 0
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : isSelected
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{range.emoji}</span>
              <div className="text-left">
                <div className="font-medium">{range.label}</div>
                <div className="text-sm opacity-75">{range.count} pantallas</div>
              </div>
            </div>
            {isSelected && <Check className="w-5 h-5 text-green-600" />}
          </button>
        );
      })}
    </div>
  );
};

// Features Filter Screen
const FeaturesFilterScreen: React.FC<{
  features: any;
  onFeaturesChange: (features: any) => void;
}> = ({ features, onFeaturesChange }) => (
  <div className="space-y-4">
    <button
      onClick={() => onFeaturesChange({
        ...features,
        allowsMoments: features.allowsMoments ? null : true
      })}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
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
      <h4 className="font-medium text-gray-900 mb-3">Rating mínimo</h4>
      <div className="space-y-2">
        {[4, 4.5, 5].map(rating => (
          <button
            key={rating}
            onClick={() => onFeaturesChange({
              ...features,
              rating: features.rating === rating ? null : rating
            })}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              features.rating === rating
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{rating}+ estrellas</span>
            </div>
            {features.rating === rating && <Check className="w-4 h-4 text-yellow-600" />}
          </button>
        ))}
      </div>
    </div>
  </div>
);

MobileFilterDrawer.displayName = 'MobileFilterDrawer';