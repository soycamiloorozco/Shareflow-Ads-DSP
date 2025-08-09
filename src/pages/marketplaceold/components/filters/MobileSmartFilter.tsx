import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, X, Search, MapPin, Building2, DollarSign, 
  Star, Sparkles, Check, ChevronRight
} from 'lucide-react';
import { FilterState } from '../../types';
import { 
  CITIES, 
  VENUE_CATEGORIES, 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_ICONS, 
  PRICE_RANGES 
} from '../../../../types/venue-categories';

interface MobileSmartFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
}

export const MobileSmartFilter: React.FC<MobileSmartFilterProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultCount
}) => {
  const [activeSection, setActiveSection] = useState<'main' | 'cities' | 'categories' | 'price'>('main');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCity = (cityId: string) => {
    const newCities = filters.location.cities.includes(cityId)
      ? filters.location.cities.filter(c => c !== cityId)
      : [...filters.location.cities, cityId];
    
    onFiltersChange({
      ...filters,
      location: { ...filters.location, cities: newCities }
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.category.categories.includes(categoryId)
      ? filters.category.categories.filter(c => c !== categoryId)
      : [...filters.category.categories, categoryId];
    
    onFiltersChange({
      ...filters,
      category: { ...filters.category, categories: newCategories }
    });
  };

  const togglePriceRange = (rangeId: string) => {
    const newRanges = filters.price.ranges.includes(rangeId)
      ? filters.price.ranges.filter(r => r !== rangeId)
      : [...filters.price.ranges, rangeId];
    
    onFiltersChange({
      ...filters,
      price: { ...filters.price, ranges: newRanges }
    });
  };

  const clearAllFilters = () => {
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
  };

  const filteredCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#353FEF]" />
                <div>
                  <h2 className="font-semibold text-gray-900">Filtros</h2>
                  <p className="text-sm text-gray-500">
                    {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeSection === 'main' && (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 space-y-4"
                  >
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar pantallas..."
                        value={filters.search.query}
                        onChange={(e) => onFiltersChange({
                          ...filters,
                          search: { ...filters.search, query: e.target.value }
                        })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors"
                      />
                    </div>

                    {/* Quick Filters */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Filtros Rápidos</h3>
                      
                      <button
                        onClick={() => onFiltersChange({
                          ...filters,
                          features: {
                            ...filters.features,
                            allowsMoments: filters.features.allowsMoments ? null : true
                          }
                        })}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          filters.features.allowsMoments
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles className={`w-5 h-5 ${filters.features.allowsMoments ? 'text-purple-600' : 'text-gray-500'}`} />
                          <span className="font-medium">Permite Momentos</span>
                        </div>
                        {filters.features.allowsMoments && <Check className="w-5 h-5 text-purple-600" />}
                      </button>

                      <button
                        onClick={() => onFiltersChange({
                          ...filters,
                          features: {
                            ...filters.features,
                            rating: filters.features.rating === 4.5 ? null : 4.5
                          }
                        })}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          filters.features.rating === 4.5
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Star className={`w-5 h-5 ${filters.features.rating === 4.5 ? 'text-yellow-600' : 'text-gray-500'}`} />
                          <span className="font-medium">Populares (4.5+)</span>
                        </div>
                        {filters.features.rating === 4.5 && <Check className="w-5 h-5 text-yellow-600" />}
                      </button>
                    </div>

                    {/* Filter Categories */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Categorías</h3>
                      
                      <button
                        onClick={() => setActiveSection('cities')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div className="text-left">
                            <div className="font-medium">Ubicación</div>
                            {filters.location.cities.length > 0 && (
                              <div className="text-sm text-gray-500">
                                {filters.location.cities.length} {filters.location.cities.length === 1 ? 'ciudad' : 'ciudades'}
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>

                      <button
                        onClick={() => setActiveSection('categories')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-500" />
                          <div className="text-left">
                            <div className="font-medium">Tipo de Venue</div>
                            {filters.category.categories.length > 0 && (
                              <div className="text-sm text-gray-500">
                                {filters.category.categories.length} {filters.category.categories.length === 1 ? 'categoría' : 'categorías'}
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>

                      <button
                        onClick={() => setActiveSection('price')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <div className="text-left">
                            <div className="font-medium">Precio</div>
                            {filters.price.ranges.length > 0 && (
                              <div className="text-sm text-gray-500">
                                {filters.price.ranges.length} {filters.price.ranges.length === 1 ? 'rango' : 'rangos'}
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'cities' && (
                  <motion.div
                    key="cities"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => setActiveSection('main')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
                      </button>
                      <h3 className="font-medium text-gray-900">Ciudades</h3>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar ciudades..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredCities.map(city => {
                        const isSelected = filters.location.cities.includes(city.id);
                        return (
                          <button
                            key={city.id}
                            onClick={() => toggleCity(city.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : 'text-gray-500'}`} />
                              <div className="text-left">
                                <div className="font-medium">{city.name}</div>
                                <div className="text-sm text-gray-500">{city.count} pantallas</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#353FEF]" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeSection === 'categories' && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => setActiveSection('main')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
                      </button>
                      <h3 className="font-medium text-gray-900">Tipos de Venue</h3>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(VENUE_CATEGORIES).map(([categoryId, category]) => {
                        const isSelected = filters.category.categories.includes(categoryId);
                        const displayName = CATEGORY_DISPLAY_NAMES[categoryId];
                        const icon = CATEGORY_ICONS[categoryId];
                        
                        return (
                          <button
                            key={categoryId}
                            onClick={() => toggleCategory(categoryId)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{displayName}</div>
                                <div className="text-sm text-gray-500">
                                  {category.mlFeatures.avgFootTraffic.toLocaleString()} tráfico
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#353FEF]" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeSection === 'price' && (
                  <motion.div
                    key="price"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => setActiveSection('main')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
                      </button>
                      <h3 className="font-medium text-gray-900">Rangos de Precio</h3>
                    </div>

                    <div className="space-y-2">
                      {PRICE_RANGES.map(range => {
                        const isSelected = filters.price.ranges.includes(range.id);
                        return (
                          <button
                            key={range.id}
                            onClick={() => togglePriceRange(range.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">💰</span>
                              <div className="text-left">
                                <div className="font-medium">{range.label}</div>
                                <div className="text-sm opacity-75">
                                  ${range.min.toLocaleString()} - {range.max === Infinity ? '∞' : `$${range.max.toLocaleString()}`}
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-green-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              <button
                onClick={clearAllFilters}
                className="w-full py-3 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#353FEF] text-white font-medium rounded-lg hover:bg-[#2A32C5] transition-colors"
              >
                Ver {resultCount} Resultados
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};