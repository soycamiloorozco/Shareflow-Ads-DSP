/**
 * Refactored Marketplace Component
 * Modular, performant, and accessible marketplace for digital screens
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutGrid, LayoutList, Map, Heart, Filter, Layers } from 'lucide-react';

// Refactored Components
import { SearchHeader } from './components/search/SearchHeader';
import { ModernFilterSystem } from './components/filters/ModernFilterSystem';
import { ScreenGrid } from './components/screens/ScreenGrid';
import { ScreenList } from './components/screens/ScreenList';
import { MarketplaceErrorBoundary } from './components/common/ErrorBoundary';
import { NoResultsState, LoadingSpinner } from './components/common/LoadingStates';
import { SectionedScreenGrid } from './components/sections/SectionedScreenGrid';

// Hooks
import { useMarketplaceData } from './hooks/useMarketplaceData';
import { useDebounce } from './hooks/useDebounce';

// Types
import { Screen, FilterState, ViewMode, FilterOptions } from './types';
import { MarketplaceSection } from './types/intelligent-grouping.types';
import { getScreenMinPrice, groupScreensByCircuit, isScreenWithCircuit } from './utils/screen-utils';

// Services
import favoritesService from '../../services/favoritesService';
import { groupingEngine } from './services/GroupingEngine';

// Mock data (would be replaced with API calls)
import { screens as mockScreens } from '../../data/mockData';

// Demo screens from original component
const demoScreens = [
  {
    id: 'demo-stadium-1',
    name: 'Pantalla LED Perimetral - Estadio Atanasio Girardot',
    location: 'Estadio Atanasio Girardot, Medellín',
    price: 1200000,
    availability: true,
    image: '/screens_photos/9007-639a2c4721253.jpg',
    category: { id: 'stadium', name: 'Estadio' },
    environment: 'outdoor' as const,
    specs: {
      width: 1920,
      height: 128,
      resolution: 'HD',
      brightness: '7500 nits',
      aspectRatio: '15:1',
      orientation: 'landscape' as const,
      pixelDensity: 72,
      colorDepth: 24,
      refreshRate: 60
    },
    views: { daily: 45000, monthly: 180000 },
    rating: 4.9,
    reviews: 76,
    coordinates: { lat: 6.2447, lng: -75.5916 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_S001',
      bundles: {
        hourly: { enabled: true, price: 800000, spots: 4 },
        daily: { enabled: true, price: 4000000, spots: 24 },
        weekly: { enabled: true, price: 18000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 42000,
      monthlyTraffic: 168000,
      averageEngagement: 98
    },
    locationDetails: {
      address: 'Estadio Atanasio Girardot',
      city: 'Medellín',
      region: 'Antioquia',
      country: 'Colombia',
      coordinates: { lat: 6.2447, lng: -75.5916 },
      timezone: 'America/Bogota',
      landmarks: ['Estadio Atanasio Girardot']
    }
  },
  // Add more demo screens as needed...
];

// Combine all screens
const allScreens = [...mockScreens, ...demoScreens] as Screen[];

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
  
  // State management with custom hook
  const {
    screens,
    filteredScreens,
    filters,
    loading,
    error,
    updateFilters,
    updateScreens,
    setLoading,
    clearFilters,
    activeFilterCount,
    // Sectioned data
    sections: hookSections,
    sectionsLoading: hookSectionsLoading,
    sectionsError: hookSectionsError,
    loadSections,
    refreshSections: hookRefreshSections,
    totalScreensInSections
  } = useMarketplaceData({
    initialScreens: allScreens,
  });

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('sectioned');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCircuits, setShowCircuits] = useState(true);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update search filter when debounced query changes
  useEffect(() => {
    updateFilters({
      ...filters,
      search: { ...filters.search, query: debouncedSearchQuery }
    });
  }, [debouncedSearchQuery, updateFilters]);

  // Filter options
  const filterOptions = useMemo(() => generateFilterOptions(screens), [screens]);

  // Group screens by circuits
  const { circuits, individualScreens } = useMemo(() => {
    const screensWithCircuit = filteredScreens.filter(isScreenWithCircuit);
    return groupScreensByCircuit(screensWithCircuit);
  }, [filteredScreens]);

  const circuitArrays = Object.values(circuits).filter(circuit => circuit.length > 1 && showCircuits);
  const finalScreens = showCircuits ? individualScreens : filteredScreens;

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
    setSearchQuery(query);
  }, []);

  const handleScreenSelect = useCallback((screen: Screen) => {
    navigate(`/screen/${screen.id}`);
  }, [navigate]);

  const handleFavoriteChange = useCallback(() => {
    setFavoritesUpdateTrigger(prev => prev + 1);
  }, []);

  const handleInfoClick = useCallback(() => {
    setIsInfoModalOpen(true);
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
                    {hookSections.length} {hookSections.length === 1 ? 'sección disponible' : 'secciones disponibles'}
                    {hookSections.length > 0 && (
                      <> con {totalScreensInSections} pantallas</>
                    )}
                    {activeFilterCount > 0 && ` (${activeFilterCount} ${activeFilterCount === 1 ? 'filtro aplicado' : 'filtros aplicados'})`}
                  </>
                ) : (
                  <>
                    {filteredScreens.length} {filteredScreens.length === 1 ? 'pantalla encontrada' : 'pantallas encontradas'}
                    {activeFilterCount > 0 && ` con ${activeFilterCount} ${activeFilterCount === 1 ? 'filtro' : 'filtros'}`}
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
                  viewMode === 'card' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
                }`}
                onClick={() => setViewMode('card')}
                aria-label="Vista en tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
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

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowCircuits(!showCircuits)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all min-h-[44px] ${
                showCircuits 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {showCircuits ? 'Ocultar circuitos' : 'Mostrar circuitos'}
            </button>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all min-h-[44px] ${
                showFavoritesOnly 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
              {showFavoritesOnly ? 'Todos' : 'Solo favoritos'}
            </button>
          </div>

          {/* Results */}
          {error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar pantallas</h3>
              <p className="text-gray-600 mb-6">{error.message}</p>
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
          ) : viewMode === 'card' ? (
            <ScreenGrid
              screens={finalScreens}
              circuits={circuitArrays}
              onScreenSelect={handleScreenSelect}
              onFavoriteChange={handleFavoriteChange}
              loading={loading}
            />
          ) : (
            <ScreenList
              screens={finalScreens}
              onScreenSelect={handleScreenSelect}
              onFavoriteChange={handleFavoriteChange}
              loading={loading}
            />
          )}
        </div>
      </div>
    </MarketplaceErrorBoundary>
  );
}