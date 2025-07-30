import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Filter } from 'lucide-react';
import { FilterPanelProps } from '../../types';
import { CityFilter } from './CityFilter';
import { CategoryFilter } from './CategoryFilter';
import { PriceFilter } from './PriceFilter';
import { ActiveFilters } from './ActiveFilters';
import { getActiveFilterCount } from '../../types/filter.types';

export const FilterPanel = React.memo<FilterPanelProps>(({
  filters,
  onFiltersChange,
  availableOptions,
  loading = false,
  className = '',
  'aria-expanded': ariaExpanded,
  'aria-label': ariaLabel = 'Filter panel for marketplace screens'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const activeFilterCount = getActiveFilterCount(filters);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    onFiltersChange({
      ...filters,
      search: { query: '' },
      location: { cities: [], regions: [], neighborhoods: [] },
      category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
      price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
      features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
      showFavoritesOnly: false,
      showCircuits: true
    });
  }, [filters, onFiltersChange]);

  const handleSectionToggle = useCallback((section: string) => {
    setActiveSection(prev => prev === section ? null : section);
  }, []);

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}
      aria-label={ariaLabel}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={handleToggleExpanded}
          className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors group"
          aria-expanded={isExpanded}
          aria-controls="filter-panel-content"
        >
          <div className="p-2 bg-[#353FEF]/10 rounded-lg group-hover:bg-[#353FEF]/20 transition-colors">
            <Filter className="w-5 h-5 text-[#353FEF]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Filtros</h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-500">
                {activeFilterCount} {activeFilterCount === 1 ? 'filtro activo' : 'filtros activos'}
              </p>
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </button>
        
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="bg-[#353FEF] text-white text-sm px-3 py-1 rounded-full font-medium">
              {activeFilterCount}
            </span>
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              aria-label="Clear all filters"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Active Filters - Always visible when present */}
      {activeFilterCount > 0 && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <ActiveFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            availableOptions={availableOptions}
          />
        </div>
      )}

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="filter-panel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* City Filter */}
                  <div>
                    <button
                      onClick={() => handleSectionToggle('cities')}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-expanded={activeSection === 'cities'}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span className="font-medium text-gray-900">Ciudades</span>
                        {filters.location.cities.length > 0 && (
                          <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
                            {filters.location.cities.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          activeSection === 'cities' ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeSection === 'cities' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-2"
                        >
                          <CityFilter
                            selectedCities={filters.location.cities}
                            onCitiesChange={(cities) => 
                              onFiltersChange({
                                ...filters,
                                location: { ...filters.location, cities }
                              })
                            }
                            availableCities={availableOptions.cities}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <button
                      onClick={() => handleSectionToggle('categories')}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-expanded={activeSection === 'categories'}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏢</span>
                        <span className="font-medium text-gray-900">Categorías</span>
                        {filters.category.categories.length > 0 && (
                          <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
                            {filters.category.categories.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          activeSection === 'categories' ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeSection === 'categories' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-2"
                        >
                          <CategoryFilter
                            selectedCategories={filters.category.categories}
                            onCategoriesChange={(categories) => 
                              onFiltersChange({
                                ...filters,
                                category: { ...filters.category, categories }
                              })
                            }
                            availableCategories={availableOptions.categories}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <button
                      onClick={() => handleSectionToggle('price')}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-expanded={activeSection === 'price'}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <span className="font-medium text-gray-900">Precio</span>
                        {filters.price.ranges.length > 0 && (
                          <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
                            {filters.price.ranges.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          activeSection === 'price' ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeSection === 'price' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-2"
                        >
                          <PriceFilter
                            selectedRanges={filters.price.ranges}
                            onRangesChange={(ranges) => 
                              onFiltersChange({
                                ...filters,
                                price: { ...filters.price, ranges }
                              })
                            }
                            availableRanges={availableOptions.priceRanges}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Features Filter */}
                  <div>
                    <button
                      onClick={() => handleSectionToggle('features')}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-expanded={activeSection === 'features'}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        <span className="font-medium text-gray-900">Características</span>
                        {(filters.features.allowsMoments !== null || filters.features.rating !== null) && (
                          <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
                            {(filters.features.allowsMoments !== null ? 1 : 0) + 
                             (filters.features.rating !== null ? 1 : 0)}
                          </span>
                        )}
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          activeSection === 'features' ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeSection === 'features' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-2"
                        >
                          <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
                            {/* Moments Filter */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.features.allowsMoments === true}
                                onChange={(e) => 
                                  onFiltersChange({
                                    ...filters,
                                    features: {
                                      ...filters.features,
                                      allowsMoments: e.target.checked ? true : null
                                    }
                                  })
                                }
                                className="w-4 h-4 text-[#353FEF] border-gray-300 rounded focus:ring-[#353FEF]"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-sm">⚡</span>
                                <span className="text-sm font-medium">Permite Momentos (15s)</span>
                              </div>
                            </label>

                            {/* Rating Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating mínimo
                              </label>
                              <div className="flex gap-2">
                                {[4, 4.5, 5].map(rating => (
                                  <button
                                    key={rating}
                                    onClick={() => 
                                      onFiltersChange({
                                        ...filters,
                                        features: {
                                          ...filters.features,
                                          rating: filters.features.rating === rating ? null : rating
                                        }
                                      })
                                    }
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                      filters.features.rating === rating
                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    <span className="text-yellow-400">⭐</span>
                                    {rating}+
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';