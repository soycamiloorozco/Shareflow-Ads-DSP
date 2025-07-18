/**
 * MarketplaceMapView Component
 * Main map-based interface for the marketplace that replaces card-based views
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Map, Layers, Filter, AlertTriangle } from 'lucide-react';

// Components
import { SearchHeader } from '../search/SearchHeader';
import { ModernFilterSystem } from '../filters/ModernFilterSystem';
import { MapContainer } from './MapContainer';
import { MapLegend } from './MapLegend';
import { MarketplaceErrorBoundary } from '../common/ErrorBoundary';
import { LoadingSpinner } from '../common/LoadingStates';

// Hooks
import { useMarketplaceData } from '../../hooks/useMarketplaceData';
import { useDebounce } from '../../hooks/useDebounce';
import { useSSPInventory } from '../../hooks/useSSPInventory';

// Types
import { Screen, FilterState, FilterOptions, Coordinates } from '../../types/marketplace.types';
import { getScreenMinPrice } from '../../types/screen.types';

// Services
import favoritesService from '../../../../services/favoritesService';

// Mock data (would be replaced with API calls)
import { screens as mockScreens } from '../../../../data/mockData';
import { demoScreens } from '../../../../data/demoScreens';

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

interface MarketplaceMapViewProps {
  className?: string;
}

export function MarketplaceMapView({ className = '' }: MarketplaceMapViewProps) {
  const navigate = useNavigate();
  
  // SSP Inventory Hook
  const { sspScreens, loading: sspLoading, totalSSPScreens, inventoryStats } = useSSPInventory();
  
  // Combine local and SSP inventory
  const allCombinedScreens = useMemo(() => {
    return [...allScreens, ...sspScreens];
  }, [sspScreens]);
  
  // State management with custom hook
  const {
    screens,
    filteredScreens,
    filters,
    loading,
    error,
    updateFilters,
    activeFilterCount
  } = useMarketplaceData({
    initialScreens: allCombinedScreens,
  });

  // UI State
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 4.7110, lng: -74.0721 }); // Bogotá center
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState(0);

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

  // Filter options
  const filterOptions = useMemo(() => generateFilterOptions(screens), [screens]);

  // Calculate map bounds to fit all visible screens
  const mapBounds = useMemo(() => {
    if (filteredScreens.length === 0) return null;
    
    const validScreens = filteredScreens.filter(screen => 
      screen.coordinates?.lat && screen.coordinates?.lng
    );
    
    if (validScreens.length === 0) return null;
    
    const lats = validScreens.map(screen => screen.coordinates!.lat);
    const lngs = validScreens.map(screen => screen.coordinates!.lng);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }, [filteredScreens]);

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

  const handleMarkerClick = useCallback((screen: Screen) => {
    setSelectedScreen(screen);
    setMapCenter(screen.coordinates || mapCenter);
  }, [mapCenter]);

  const handleFavoriteChange = useCallback(() => {
    setFavoritesUpdateTrigger(prev => prev + 1);
  }, []);

  const handleInfoClick = useCallback(() => {
    setIsInfoModalOpen(true);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleMapBoundsChange = useCallback((bounds: google.maps.LatLngBounds) => {
    const center = bounds.getCenter();
    setMapCenter({ lat: center.lat(), lng: center.lng() });
  }, []);

  // SEO metadata
  const title = `Mapa de Pantallas Digitales Colombia 2025 | Shareflow.me`;
  const description = `🗺️ Explora más de ${filteredScreens.length}+ pantallas digitales en Colombia con nuestro mapa interactivo. Encuentra ubicaciones Indoor y Outdoor con precios transparentes y reserva instantánea.`;

  return (
    <MarketplaceErrorBoundary>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* SEO */}
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content="mapa pantallas digitales Colombia, vallas publicitarias ubicaciones, DOOH mapa interactivo" />
          <link rel="canonical" href="https://shareflow.me/marketplace/map" />
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
        <div className="flex flex-col h-[calc(100vh-80px)]">
          
          {/* SSP Inventory Indicator */}
          {totalSSPScreens > 0 && (
            <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
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

          {/* Filter System */}
          <div className="mx-4 mt-4">
            <ModernFilterSystem
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableOptions={filterOptions}
              resultCount={filteredScreens.length}
            />
          </div>

          {/* Results Header */}
          <div className="mx-4 mt-4 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Map className="w-5 h-5 text-indigo-600" />
                  Mapa de Pantallas
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredScreens.length} {filteredScreens.length === 1 ? 'pantalla encontrada' : 'pantallas encontradas'}
                  {activeFilterCount > 0 && ` con ${activeFilterCount} ${activeFilterCount === 1 ? 'filtro' : 'filtros'}`}
                  {totalSSPScreens > 0 && (
                    <span className="text-blue-600">
                      {' '}(incluyendo {totalSSPScreens} via SSPs)
                    </span>
                  )}
                </p>
              </div>
              
              {/* Map Legend Toggle */}
              <MapLegend />
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 mx-4 mb-4 relative">
            {error ? (
              <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el mapa</h3>
                  <p className="text-gray-600 mb-6">
                    {typeof error === 'string' ? error : error?.message || 'Error desconocido'}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                {(loading || sspLoading) && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <LoadingSpinner />
                  </div>
                )}
                
                <MapContainer
                  screens={filteredScreens}
                  selectedScreen={selectedScreen}
                  onScreenSelect={handleScreenSelect}
                  onMarkerClick={handleMarkerClick}
                  onFavoriteChange={handleFavoriteChange}
                  onMapBoundsChange={handleMapBoundsChange}
                  center={mapCenter}
                  zoom={mapZoom}
                  bounds={mapBounds}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </MarketplaceErrorBoundary>
  );
}

export default MarketplaceMapView;