/**
 * Refactored Marketplace Component
 * Modular, performant, and accessible marketplace for digital screens
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutList, Map, Filter, Layers } from 'lucide-react';

// Refactored Components
import { SearchHeader } from './components/search/SearchHeader';
import { ModernFilterSystem } from './components/filters/ModernFilterSystem';
import { MobileMarketplaceInterface } from './components/MobileMarketplaceInterface';
import { ScreenList } from './components/screens/ScreenList';
import { MarketplaceErrorBoundary } from './components/common/ErrorBoundary';
import { SectionedScreenGrid } from './components/sections/SectionedScreenGrid';
import { MapContainer } from './components/map/MapContainer';

// Hooks
import { useMarketplaceData } from './hooks/useMarketplaceData';
import { useDebounce } from './hooks/useDebounce';
import { useSSPInventory } from './hooks/useSSPInventory';

// Types
import { Screen, FilterState, ViewMode, FilterOptions } from './types';
import { getScreenMinPrice, groupScreensByCircuit, isScreenWithCircuit } from './utils/screen-utils';

// API Hook for fetching real screens data
import { useScreensApi } from './hooks/useScreensApi';

// API Initialization
import { initializeApiServices } from './services/api/ApiInitializer';

// API Test and Diagnostic (development only)
if (process.env.NODE_ENV === 'development') {
  import('./services/api/ApiTest');
  import('./services/api/ApiDiagnostic');
  import('./services/api/BackendTest');
  import('./services/api/ForceApiTest');
}

// Generate filter options from available screens
const generateFilterOptions = (screens: Screen[]): FilterOptions => {
  const cities = [...new Set(screens.map(screen => {
    const parts = screen.location.split(',');
    return parts[parts.length - 1]?.trim() || '';
  }).filter(Boolean))].map(city => ({
    id: city.toLowerCase().replace(/\s+/g, '-'),
    label: city,
    count: screens.filter(s => s.location.toLowerCase().includes(city.toLowerCase())).length,
    icon: '📍'
  }));

  const categories = [...new Set(screens.map(screen => screen.category?.id).filter(Boolean))].map(categoryId => {
    const screen = screens.find(s => s.category?.id === categoryId);
    return {
      id: categoryId!,
      label: screen?.category?.name || categoryId!,
      count: screens.filter(s => s.category?.id === categoryId).length,
      icon: '🏢'
    };
  });

  const priceRanges = [
    { id: 'budget', label: 'Económico (< $500K)', count: 0, emoji: '💚' },
    { id: 'mid-range', label: 'Medio ($500K - $1M)', count: 0, emoji: '💛' },
    { id: 'premium', label: 'Premium ($1M - $2M)', count: 0, emoji: '🧡' },
    { id: 'luxury', label: 'Lujo (> $2M)', count: 0, emoji: '💜' }
  ].map(range => ({
    ...range,
    count: screens.filter(screen => {
      const price = getScreenMinPrice(screen);
      switch (range.id) {
        case 'budget': return price < 500000;
        case 'mid-range': return price >= 500000 && price < 1000000;
        case 'premium': return price >= 1000000 && price < 2000000;
        case 'luxury': return price >= 2000000;
        default: return false;
      }
    }).length
  }));

  return {
    cities,
    categories,
    priceRanges,
    venueTypes: [],
    environments: [],
    dwellTimes: [],
    features: []
  };
};

export function MarketplaceRefactored() {
  const navigate = useNavigate();
  
  // Initialize API services on component mount
  useEffect(() => {
    initializeApiServices();
  }, []);
  
  // SSP Inventory Hook
  const { sspScreens, loading: sspLoading, totalSSPScreens, inventoryStats } = useSSPInventory();
  
  // State management with custom hook - will fetch from API
  const {
    screens,
    filteredScreens,
    filters,
    loading,
    error,
    updateFilters,
    activeFilterCount,
    // API methods
    fetchScreens,
    searchScreens,
    getTrendingScreens,
    getFilterOptions,
    // Sectioned data
    sections: hookSections,
    sectionsLoading: hookSectionsLoading,
    sectionsError: hookSectionsError,
    loadSections,
    refreshSections: hookRefreshSections
  } = useMarketplaceData({
    // No initial screens - will fetch from API
  });

  // Combine API screens with SSP inventory
  const allCombinedScreens = useMemo(() => {
    return [...screens, ...sspScreens];
  }, [screens, sspScreens]);

  // UI State - Default to sectioned view for better performance
  const [viewMode, setViewMode] = useState<ViewMode>('sectioned');
  const [showCircuits, setShowCircuits] = useState(true);

  // Get search query from filters state
  const searchQuery = filters.search.query;

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update search filter when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== filters.search.query) {
      updateFilters({
        ...filters,
        search: { ...filters.search, query: debouncedSearchQuery }
      });
    }
  }, [debouncedSearchQuery, filters, updateFilters]);

  // Filter options based on combined screens
  const filterOptions = useMemo(() => generateFilterOptions(allCombinedScreens), [allCombinedScreens]);

  // Use combined screens for filtering
  const combinedFilteredScreens = useMemo(() => {
    // Apply the same filtering logic to combined screens
    return allCombinedScreens.filter(screen => {
      // Apply search filter
      if (filters.search.query) {
        const query = filters.search.query.toLowerCase();
        const matchesSearch = screen.name.toLowerCase().includes(query) ||
          screen.location.toLowerCase().includes(query) ||
          screen.category?.name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Apply location filters
      if (filters.location.cities.length > 0) {
        const matchesLocation = filters.location.cities.some(city =>
          screen.location.toLowerCase().includes(city.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      // Apply category filters
      if (filters.category.categories.length > 0) {
        const matchesCategory = filters.category.categories.includes(screen.category?.id || '');
        if (!matchesCategory) return false;
      }

      // Apply feature filters
      if (filters.features.allowsMoments !== null) {
        const matchesMoments = screen.pricing?.allowMoments === filters.features.allowsMoments;
        if (!matchesMoments) return false;
      }

      if (filters.features.rating !== null) {
        const matchesRating = screen.rating >= (filters.features.rating || 0);
        if (!matchesRating) return false;
      }

      return true;
    });
  }, [allCombinedScreens, filters]);

  // Group screens by circuits (for list view only)
  const { individualScreens } = useMemo(() => {
    const screensWithCircuit = combinedFilteredScreens.filter(isScreenWithCircuit);
    return groupScreensByCircuit(screensWithCircuit);
  }, [combinedFilteredScreens]);

  const finalScreens = showCircuits ? individualScreens : combinedFilteredScreens;

  // Load sections when in sectioned view mode
  useEffect(() => {
    if (viewMode === 'sectioned') {
      const userId = undefined; // For now, no user ID for anonymous users
      const location = filters.location.cities.length > 0 ? filters.location.cities[0] : undefined;
      
      loadSections({
        userId,
        location,
        maxSections: 6,
        forceRefresh: false
      });
    }
  }, [viewMode, filters, debouncedSearchQuery, loadSections]);

  // Refresh sections handler
  const handleRefreshSections = useCallback(async () => {
    const userId = undefined; // For now, no user ID for anonymous users
    await hookRefreshSections(userId);
  }, [hookRefreshSections]);

  // Event handlers
  const handleSearchChange = useCallback((query: string) => {
    updateFilters({
      ...filters,
      search: { ...filters.search, query }
    });
  }, [filters, updateFilters]);

  const handleScreenSelect = useCallback((screen: Screen) => {
    const targetPath = `/screens/${screen.id}`;
    
    // Development-only logging
    if (process.env.NODE_ENV === 'development') {
      console.debug('Screen selection:', { screenId: screen.id, targetPath });
    }
    
    try {
      navigate(targetPath);
    } catch (error) {
      console.error('Navigation error:', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        screenId: screen.id,
        targetPath 
      });
      
      // Robust fallback
      window.location.assign(targetPath);
    }
  }, [navigate]);

  const handleFavoriteChange = useCallback(() => {
    // Trigger re-render for favorites
    // This could be enhanced with a proper favorites state management
  }, []);

  const handleInfoClick = useCallback(() => {
    // Show info modal - placeholder for future implementation
    console.log('Info clicked');
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    updateFilters(newFilters);
  }, [updateFilters]);



  // SEO metadata
  const title = `Marketplace de Pantallas Digitales Colombia 2025 | Shareflow.me`;
  const description = `🚀 Marketplace líder de pantallas y vallas digitales en Colombia. Más de ${filteredScreens.length}+ ubicaciones premium verificadas. Publicidad exterior DOOH con IA, datos en tiempo real, reserva instantánea y precios transparentes.`;

  return (
    <MarketplaceErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* SEO */}
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content="pantallas digitales Colombia, vallas publicitarias LED, publicidad exterior DOOH, digital out of home" />
          <link rel="canonical" href="https://shareflow.me/marketplace" />
        </Helmet>

        {/* Mobile Interface (< lg breakpoint) */}
        <div className="lg:hidden">
          <MobileMarketplaceInterface
            sections={hookSections}
            screens={filteredScreens}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onScreenSelect={handleScreenSelect}
            onFavoriteChange={handleFavoriteChange}
            loading={loading || hookSectionsLoading}
            error={error?.message || hookSectionsError}
          />
        </div>

        {/* Desktop Interface (>= lg breakpoint) */}
        <div className="hidden lg:block">
          {/* Search Header */}
          <SearchHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onInfoClick={handleInfoClick}
            filteredCount={filteredScreens.length}
            loading={loading}
          />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* SSP Inventory Indicator */}
          {totalSSPScreens > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>
                  {totalSSPScreens} pantallas adicionales disponibles via SSPs conectados
                </span>
                <span className="text-xs text-blue-600 ml-2">
                  ({inventoryStats.bySSP && Object.keys(inventoryStats.bySSP).length} partners)
                </span>
              </div>
            </div>
          )}

          {/* Modern Filter System */}
          <div className="mb-8">
            <ModernFilterSystem
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableOptions={filterOptions}
              resultCount={filteredScreens.length}
            />
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode === 'sectioned' ? 'Secciones personalizadas' : 'Pantallas disponibles'}
              </h2>
              <p className="text-gray-600 mt-1">
                {viewMode === 'sectioned' ? (
                  <>
                    {activeFilterCount > 0 && `${activeFilterCount} ${activeFilterCount === 1 ? 'filtro aplicado' : 'filtros aplicados'}`}
                  </>
                ) : (
                  <>
                    {filteredScreens.length} {filteredScreens.length === 1 ? 'pantalla encontrada' : 'pantallas encontradas'}
                    {activeFilterCount > 0 && ` con ${activeFilterCount} ${activeFilterCount === 1 ? 'filtro' : 'filtros'}`}
                    {totalSSPScreens > 0 && (
                      <span className="text-blue-600">
                        {' '}(incluyendo {totalSSPScreens} via SSPs)
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            
            {/* View Mode Selector */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-1.5 transition-all min-h-[44px] ${
                  viewMode === 'sectioned' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
                }`}
                onClick={() => setViewMode('sectioned')}
                aria-label="Vista por secciones"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Secciones</span>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-1.5 transition-all min-h-[44px] ${
                  viewMode === 'map' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
                }`}
                onClick={() => setViewMode('map')}
                aria-label="Vista de mapa"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Mapa</span>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-1.5 transition-all min-h-[44px] ${
                  viewMode === 'compact' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
                }`}
                onClick={() => setViewMode('compact')}
                aria-label="Vista en lista compacta"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>



          {/* Results */}
          {error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar pantallas</h3>
              <p className="text-gray-600 mb-6">{typeof error === 'string' ? error : error?.message || 'Error desconocido'}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : viewMode === 'sectioned' ? (
            <SectionedScreenGrid
              sections={hookSections}
              onScreenSelect={handleScreenSelect}
              onFavoriteChange={handleFavoriteChange}
              onRefreshSections={handleRefreshSections}
              loading={hookSectionsLoading}
              error={hookSectionsError}
              aria-label="Intelligent marketplace sections"
            />
          ) : viewMode === 'map' ? (
            <div className="h-[600px] bg-white rounded-lg border border-gray-200 overflow-hidden">
              <MapContainer
                screens={filteredScreens}
                onScreenSelect={handleScreenSelect}
                onMarkerClick={handleScreenSelect}
                onFavoriteChange={handleFavoriteChange}
              />
            </div>
          ) : (
            <ScreenList
              screens={finalScreens}
              onScreenSelect={handleScreenSelect}
              onFavoriteChange={handleFavoriteChange}
              loading={loading || sspLoading}
            />
          )}
          </div>
        </div>
      </div>
    </MarketplaceErrorBoundary>
  );
}