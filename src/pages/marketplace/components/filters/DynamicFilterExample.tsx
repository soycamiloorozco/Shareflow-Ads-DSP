/**
 * DynamicFilterExample Component
 * 
 * Example component demonstrating the usage of DynamicFilterOptionsService
 * with real-time updates, caching, and performance monitoring.
 */

import React, { useState, useCallback } from 'react';
import { Screen, FilterState } from '../../types/marketplace.types';
import { useDynamicFilterOptions, useFilterOptionStats, useTopFilterOptions } from '../../hooks/useDynamicFilterOptions';
import { DynamicFilterOptionsDisplay } from './DynamicFilterOptionsDisplay';
import { DynamicFilterOption } from '../../services/DynamicFilterOptionsService';
import { demoScreens } from '../../../../data/demoScreens';

// =============================================================================
// TYPES
// =============================================================================

interface DynamicFilterExampleProps {
  /** Optional custom screens data */
  screens?: Screen[];
  /** Whether to show performance metrics */
  showMetrics?: boolean;
  /** Whether to enable auto-refresh */
  enableAutoRefresh?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const DynamicFilterExample: React.FC<DynamicFilterExampleProps> = ({
  screens = demoScreens,
  showMetrics = true,
  enableAutoRefresh = false
}) => {
  // State
  const [filters, setFilters] = useState<FilterState>({
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

  const [selectedTab, setSelectedTab] = useState<'cities' | 'categories' | 'prices' | 'features'>('cities');

  // Hooks
  const {
    options,
    loading,
    error,
    lastUpdated,
    computationTime,
    refresh,
    clearError
  } = useDynamicFilterOptions(screens, filters, {
    debounceDelay: 300,
    excludeActiveFilters: true,
    enableAutoUpdate: enableAutoRefresh,
    updateInterval: 30000
  });

  const stats = useFilterOptionStats(options);
  const topOptions = useTopFilterOptions(options, 3);

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setFilters(prev => ({
      ...prev,
      search: { query }
    }));
  }, []);

  const handleCitySelect = useCallback((option: DynamicFilterOption) => {
    setFilters(prev => ({
      ...prev,
      location: {
        ...prev.location,
        cities: prev.location.cities.includes(option.id)
          ? prev.location.cities.filter(id => id !== option.id)
          : [...prev.location.cities, option.id]
      }
    }));
  }, []);

  const handleCategorySelect = useCallback((option: DynamicFilterOption) => {
    setFilters(prev => ({
      ...prev,
      category: {
        ...prev.category,
        categories: prev.category.categories.includes(option.id)
          ? prev.category.categories.filter(id => id !== option.id)
          : [...prev.category.categories, option.id]
      }
    }));
  }, []);

  const handlePriceRangeSelect = useCallback((option: DynamicFilterOption) => {
    setFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        ranges: prev.price.ranges.includes(option.id)
          ? prev.price.ranges.filter(id => id !== option.id)
          : [...prev.price.ranges, option.id]
      }
    }));
  }, []);

  const handleFeatureSelect = useCallback((option: DynamicFilterOption) => {
    let newFilters = { ...filters };
    
    switch (option.id) {
      case 'moments':
        newFilters.features.allowsMoments = 
          filters.features.allowsMoments === true ? null : true;
        break;
      case 'high_rating':
        newFilters.features.rating = 
          filters.features.rating === 4.5 ? null : 4.5;
        break;
    }
    
    setFilters(newFilters);
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    setFilters({
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
  }, []);

  // Get active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.search.query) count++;
    if (filters.location.cities.length > 0) count++;
    if (filters.category.categories.length > 0) count++;
    if (filters.price.ranges.length > 0) count++;
    if (filters.features.allowsMoments !== null) count++;
    if (filters.features.rating !== null) count++;
    return count;
  }, [filters]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema de Filtros Dinámicos
            </h1>
            <p className="text-gray-600 mt-1">
              Filtros con conteos en tiempo real, tendencias y recomendaciones
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '🔄' : '↻'} Actualizar
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Limpiar Filtros ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar pantallas..."
            value={filters.search.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-800 font-medium">Error al cargar filtros</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
            <p className="text-red-700 text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Performance Metrics */}
        {showMetrics && options && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalResults.toLocaleString()}
              </div>
              <div className="text-sm text-blue-800">Resultados</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {computationTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-green-800">Tiempo de cálculo</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.recommendedCount}
              </div>
              <div className="text-sm text-yellow-800">Recomendadas</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.trendingUpCount}
              </div>
              <div className="text-sm text-purple-800">En tendencia</div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 text-center">
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'cities', label: 'Ciudades', count: options?.cities.length || 0 },
              { id: 'categories', label: 'Categorías', count: options?.categories.length || 0 },
              { id: 'prices', label: 'Precios', count: options?.priceRanges.length || 0 },
              { id: 'features', label: 'Características', count: options?.features.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Cities Tab */}
          {selectedTab === 'cities' && (
            <DynamicFilterOptionsDisplay
              options={options?.cities || []}
              title="Filtrar por Ciudad"
              onOptionSelect={handleCitySelect}
              selectedOptions={filters.location.cities}
              loading={loading}
              maxOptions={10}
            />
          )}

          {/* Categories Tab */}
          {selectedTab === 'categories' && (
            <DynamicFilterOptionsDisplay
              options={options?.categories || []}
              title="Filtrar por Categoría"
              onOptionSelect={handleCategorySelect}
              selectedOptions={filters.category.categories}
              loading={loading}
              maxOptions={10}
            />
          )}

          {/* Price Ranges Tab */}
          {selectedTab === 'prices' && (
            <DynamicFilterOptionsDisplay
              options={options?.priceRanges || []}
              title="Filtrar por Rango de Precio"
              onOptionSelect={handlePriceRangeSelect}
              selectedOptions={filters.price.ranges}
              loading={loading}
            />
          )}

          {/* Features Tab */}
          {selectedTab === 'features' && (
            <DynamicFilterOptionsDisplay
              options={options?.features || []}
              title="Filtrar por Características"
              onOptionSelect={handleFeatureSelect}
              selectedOptions={[
                ...(filters.features.allowsMoments === true ? ['moments'] : []),
                ...(filters.features.rating === 4.5 ? ['high_rating'] : [])
              ]}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Top Options Summary */}
      {options && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top by Count */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Más Populares
            </h3>
            <div className="space-y-3">
              {topOptions.topByCount.slice(0, 3).map((option, index) => (
                <div key={option.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-sm">{option.emoji || option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {option.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recommended */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recomendadas
            </h3>
            <div className="space-y-3">
              {topOptions.topRecommended.slice(0, 3).map((option, index) => (
                <div key={option.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm">{option.emoji || option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {option.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Trending */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              En Tendencia
            </h3>
            <div className="space-y-3">
              {topOptions.topTrending.slice(0, 3).map((option, index) => (
                <div key={option.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">📈</span>
                    <span className="text-sm">{option.emoji || option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {option.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFilterExample;