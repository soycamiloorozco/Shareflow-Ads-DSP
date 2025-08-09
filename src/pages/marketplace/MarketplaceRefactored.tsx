/**
 * Refactored Marketplace Component
 * Modular, performant, and accessible marketplace for digital screens
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutList, Map, Filter, Layers, Monitor } from 'lucide-react';

// Refactored Components
import { SearchHeader } from './components/search/SearchHeader';
import { SmartFilterSystem } from './components/filters/SmartFilterSystem';
import { MobileMarketplaceInterface } from './components/MobileMarketplaceInterface';
import { ScreenList } from './components/screens/ScreenList';
import { MarketplaceErrorBoundary } from './components/common/ErrorBoundary';
import { SectionedScreenGrid } from './components/sections/SectionedScreenGrid';
import { MapContainer } from './components/map/MapContainer';

// Hooks
import { useMarketplaceData } from './hooks/useMarketplaceData';
import { useDebounce } from './hooks/useDebounce';
import { useSSPInventory } from './hooks/useSSPInventory';
import { useSmartFilters } from './hooks/useSmartFilters';

// Types
import { Screen, FilterState, ViewMode, FilterOptions } from './types';
import { getScreenMinPrice, groupScreensByCircuit, isScreenWithCircuit } from './utils/screen-utils';

// API Hook for fetching real screens data
import { useScreensApi } from './hooks/useScreensApi';

// API Initialization
import { initializeApiServices } from './services/api/ApiInitializer';

// Demo data - temporary until API is fully implemented
import { demoScreens } from '../../data/demoScreens';

// API Services  
import { MarketplaceApiService } from './services/api/MarketplaceApiService';

// Helper function to convert demo screens to Screen format
const convertDemoScreensToScreens = (demoScreens: any[]): Screen[] => {
  const converted = demoScreens.map(screen => {
    const converted = {
      ...screen,
      // Ensure we have locationDetails for the Screen interface
      locationDetails: {
        address: screen.location || '',
        city: (screen.location || '').split(',').pop()?.trim() || 'Colombia',
        region: 'Colombia',
        country: 'Colombia',
        coordinates: screen.coordinates || { lat: 4.7110, lng: -74.0721 },
        timezone: 'America/Bogota',
        landmarks: []
      },
      // Ensure specs are complete
      specs: {
        width: screen.specs?.width || 1920,
        height: screen.specs?.height || 1080,
        resolution: screen.specs?.resolution || 'HD',
        brightness: screen.specs?.brightness || '5000 nits',
        aspectRatio: '16:9',
        orientation: screen.specs?.orientation || (screen.specs?.width > screen.specs?.height ? 'landscape' : 'portrait'),
        pixelDensity: 72,
        colorDepth: 24,
        refreshRate: 60
      },
      // Ensure metrics exist
      metrics: {
        dailyTraffic: screen.views?.daily || 10000,
        monthlyTraffic: screen.views?.monthly || 300000,
        averageEngagement: 85
      }
    };

    // Debug log each conversion
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('🔄 Converting screen:', {
    //     id: screen.id,
    //     name: screen.name?.slice(0, 30) + '...',
    //     originalCoords: screen.coordinates,
    //     convertedCoords: converted.coordinates,
    //     hasValidCoords: !!(converted.coordinates?.lat && converted.coordinates?.lng)
    //   });
    // }
    return converted;
  });

  // if (process.env.NODE_ENV === 'development') {
  //   console.log('✅ Conversion complete:', {
  //     total: converted.length,
  //     withCoords: converted.filter(s => s.coordinates?.lat && s.coordinates?.lng).length,
  //     withoutCoords: converted.filter(s => !s.coordinates?.lat || !s.coordinates?.lng).length
  //   });
  // }
  return converted as Screen[];
};

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
    const parts = (screen.location || '').split(',');
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
  
  // Smart filters hook
  const {
    filters: smartFilters,
    filterOptions: smartFilterOptions,
    updateFilters: updateSmartFilters,
    activeFilterCount: smartActiveFilterCount,
    hasActiveFilters,
    clearAllFilters,
    getFilterQuery
  } = useSmartFilters();

  // SSP Inventory Hook
  const { sspScreens, loading: sspLoading, totalSSPScreens, inventoryStats } = useSSPInventory();
  
  // Convert converted demo screens for debugging
  const convertedInitialScreens = useMemo(() => {
    const converted = convertDemoScreensToScreens(demoScreens);
    
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('🔍 Initial screens being passed to useMarketplaceData:', {
    //     totalScreens: converted.length,
    //     screenIds: converted.map(s => s.id),
    //     sampleScreen: converted[0] ? {
    //       id: converted[0].id,
    //       name: converted[0].name,
    //       location: converted[0].location
    //     } : null
    //   });
    // }
    
    return converted;
  }, []);

  // State management with custom hook - will fetch from API
  const {
    screens,
    filteredScreens,
    filters,
    loading,
    error,
    updateFilters,
    updateScreens,
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
    // Let the hook fetch from real API instead of using mock data
    // initialScreens: convertedInitialScreens // Commented out to use real API
  });

  // Load real screens from API on mount with fallback to demo data
  useEffect(() => {
    const loadScreensWithFallback = async () => {
      try {
        // Try to fetch from API first
        await fetchScreens();
      } catch (error) {
        console.warn('⚠️ API not available, using demo data as fallback:', error);
        
        // If API fails, use demo data as fallback
        const fallbackScreens = convertDemoScreensToScreens(demoScreens);
        
        // Update the marketplace data hook with fallback data
        updateScreens(fallbackScreens);
        
        console.log('✅ Loaded fallback demo data:', {
          screensCount: fallbackScreens.length,
          sampleScreens: fallbackScreens.slice(0, 3).map(s => ({ id: s.id, name: s.name }))
        });
      }
    };

    // Only load if we don't have screens yet
    if (screens.length === 0 && !loading) {
      loadScreensWithFallback();
    }
  }, []); // Only run once on mount

  // Combine API screens with SSP inventory
  const allCombinedScreens = useMemo(() => {
    return [...screens, ...sspScreens];
  }, [screens, sspScreens]);

  // Additional debugging for screens loading
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('📊 Marketplace Data Debug:', {
  //       screensFromAPI: screens.length,
  //       sspScreens: sspScreens.length,
  //       combinedTotal: allCombinedScreens.length,
  //       sampleScreenIds: screens.slice(0, 3).map(s => s.id),
  //       loading,
  //       error: error?.message
  //     });
  //   }
  // }, [screens.length, sspScreens.length, allCombinedScreens.length, loading, error]);

  // UI State - Default to sectioned view for better performance
  const [viewMode, setViewMode] = useState<ViewMode>('sectioned');
  const [showCircuits, setShowCircuits] = useState(false); // Changed to false so API screens are shown by default

  // Estado local para el input de búsqueda (completamente independiente)
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search para actualizar los filtros sin afectar el input
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Ref para evitar ciclos infinitos
  const isUpdatingFiltersRef = useRef(false);

  // Actualizar filtros solo cuando el debounced query cambie
  useEffect(() => {
    // Evitar ciclos infinitos
    if (isUpdatingFiltersRef.current) return;
    
    // Solo actualizar si realmente cambió
    if (debouncedSearchQuery !== smartFilters.search.query) {
      isUpdatingFiltersRef.current = true;
      const newFilters = {
        ...smartFilters,
        search: { ...smartFilters.search, query: debouncedSearchQuery }
      };
      updateSmartFilters(newFilters);
      
      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingFiltersRef.current = false;
      }, 50);
    }
  }, [debouncedSearchQuery]); // Solo depender del debounced query

  // Auto-switch to list view when there's an active search or filters
  useEffect(() => {
    if ((smartFilters.search.query || hasActiveFilters) && viewMode === 'sectioned') {
      setViewMode('compact');
    }
  }, [smartFilters.search.query, hasActiveFilters, viewMode]);

  // Filter options based on combined screens
  const filterOptions = useMemo(() => generateFilterOptions(allCombinedScreens), [allCombinedScreens]);

  // Use combined screens for filtering
  const combinedFilteredScreens = useMemo(() => {
    // Helper: normalize text
    const normalizeText = (text: string | undefined | null): string =>
      (text ?? '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    // Helper: aliases for common spellings without diacritics
    const applyAliases = (text: string): string =>
      text
        .replace(/\bitagu[ui]\b/g, 'itagui')
        .replace(/\bmedellin\b/g, 'medellin')
        .replace(/\bbogota\b/g, 'bogota');

    // Source of truth: debounced query to avoid stale filter sync
    const effectiveQueryRaw = debouncedSearchQuery || smartFilters.search.query || '';
    const effectiveQuery = applyAliases(normalizeText(effectiveQueryRaw));

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Filtering screens:', {
        searchQuery: effectiveQueryRaw,
        totalScreens: allCombinedScreens.length,
        sampleScreenNames: allCombinedScreens.slice(0, 3).map(s => s.name)
      });
    }

    const queryTokens = effectiveQuery
      .split(/\s+/)
      .filter(token => token.length >= 2);

    return allCombinedScreens.filter(screen => {
      // Text search across name, location, category
      if (queryTokens.length > 0) {
        const nameText = normalizeText(screen.name);
        const locationText = applyAliases(normalizeText(screen.location));
        const categoryText = normalizeText(screen.category?.name || '');

        const locationWords = locationText
          .split(/[\,\s]+/)
          .map(word => word.trim())
          .filter(Boolean);

        // AND across tokens: each token must match at least one field
        const allTokensMatch = queryTokens.every(token => {
          const locationMatch = locationWords.some(word =>
            word === token || (token.length >= 3 && word.startsWith(token))
          );
          const nameMatch = token.length >= 3 && nameText.includes(token);
          const categoryMatch = token.length >= 3 && categoryText.includes(token);
          return locationMatch || nameMatch || categoryMatch;
        });

        if (!allTokensMatch) return false;
      }

      // Apply location filters
      if (smartFilters.location.cities.length > 0) {
        const matchesLocation = smartFilters.location.cities.some(city =>
          normalizeText(screen.location).includes(normalizeText(city))
        );
        if (!matchesLocation) return false;
      }

      // Apply category filters
      if (smartFilters.category.categories.length > 0) {
        const matchesCategory = smartFilters.category.categories.includes(screen.category?.id || '');
        if (!matchesCategory) return false;
      }

      // Apply feature filters
      if (smartFilters.features.allowsMoments !== null) {
        const matchesMoments = screen.pricing?.allowMoments === smartFilters.features.allowsMoments;
        if (!matchesMoments) return false;
      }

      if (smartFilters.features.rating !== null) {
        const matchesRating = screen.rating >= (smartFilters.features.rating || 0);
        if (!matchesRating) return false;
      }

      return true;
    });
  }, [allCombinedScreens, debouncedSearchQuery, smartFilters]);

  // Debug logging for filtered results
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Filter Results:', {
        searchQuery: smartFilters.search.query,
        inputQuery: searchQuery,
        debouncedQuery: debouncedSearchQuery,
        totalScreens: allCombinedScreens.length,
        filteredScreens: combinedFilteredScreens.length,
        filteredScreenNames: combinedFilteredScreens.slice(0, 5).map(s => s.name),
        filteredScreenLocations: combinedFilteredScreens.slice(0, 5).map(s => s.location),
        hasResults: combinedFilteredScreens.length > 0,
        isLoading: loading || sspLoading,
        viewMode,
        hasActiveFilters,
        shouldShowSections: viewMode === 'sectioned' && !smartFilters.search.query && !hasActiveFilters
      });
      
      // Test específico para búsquedas
      if (smartFilters.search.query.toLowerCase().includes('medellin')) {
        const medellinScreens = allCombinedScreens.filter(screen => 
          screen.location.toLowerCase().includes('medellín') || 
          screen.location.toLowerCase().includes('medellin')
        );
        console.log('🏙️ Medellín Test:', {
          totalMedellinScreens: medellinScreens.length,
          medellinScreenNames: medellinScreens.map(s => s.name),
          medellinScreenLocations: medellinScreens.map(s => s.location),
          filteredMedellinScreens: combinedFilteredScreens.filter(screen => 
            screen.location.toLowerCase().includes('medellín') || 
            screen.location.toLowerCase().includes('medellin')
          ).length
        });
      }
      
      // Test específico para búsqueda de Metro
      if (smartFilters.search.query.toLowerCase().includes('metro')) {
        const metroScreens = allCombinedScreens.filter(screen => 
          screen.name.toLowerCase().includes('metro') || 
          screen.location.toLowerCase().includes('metro')
        );
        console.log('🚇 Metro Test:', {
          totalMetroScreens: metroScreens.length,
          metroScreenNames: metroScreens.map(s => s.name),
          metroScreenLocations: metroScreens.map(s => s.location),
          filteredMetroScreens: combinedFilteredScreens.filter(screen => 
            screen.name.toLowerCase().includes('metro') || 
            screen.location.toLowerCase().includes('metro')
          ).length,
          shouldShow: 2, // Solo deberían mostrarse 2 pantallas
          isCorrect: combinedFilteredScreens.filter(screen => 
            screen.name.toLowerCase().includes('metro') || 
            screen.location.toLowerCase().includes('metro')
          ).length === 2
        });
      }
    }
  }, [smartFilters.search.query, searchQuery, debouncedSearchQuery, allCombinedScreens.length, combinedFilteredScreens.length, loading, sspLoading, viewMode, hasActiveFilters, allCombinedScreens]);

  // Group screens by circuits (for list view only)
  const { individualScreens } = useMemo(() => {
    const screensWithCircuit = combinedFilteredScreens.filter(isScreenWithCircuit);
    return groupScreensByCircuit(screensWithCircuit);
  }, [combinedFilteredScreens]);

  const finalScreens = showCircuits ? individualScreens : combinedFilteredScreens;

  // Debug logging for list view
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('🔍 List View Debug:', {
  //       viewMode,
  //       showCircuits,
  //       combinedFilteredScreensCount: combinedFilteredScreens.length,
  //       individualScreensCount: individualScreens.length,
  //       finalScreensCount: finalScreens.length,
  //       firstFewScreens: finalScreens.slice(0, 3).map(s => ({
  //       id: s.id,
  //       name: s.name?.slice(0, 30) + '...',
  //       location: s.location?.slice(0, 30) + '...'
  //     })),
  //       allCombinedScreensCount: allCombinedScreens.length,
  //       screensFromApiCount: screens.length,
  //       sspScreensCount: sspScreens.length
  //     });
  //   }
  // }, [
  //   viewMode, 
  //   showCircuits, 
  //   combinedFilteredScreens.length, 
  //   individualScreens.length, 
  //   finalScreens.length,
  //   allCombinedScreens.length,
  //   screens.length,
  //   sspScreens.length
  // ]);

  // Load sections when in sectioned view mode
  useEffect(() => {
    if (viewMode === 'sectioned') {
      const userId = undefined; // For now, no user ID for anonymous users
      const location = smartFilters.location.cities.length > 0 ? smartFilters.location.cities[0] : undefined;
      
      loadSections({
        userId,
        location,
        maxSections: 6,
        forceRefresh: false
      });
    }
  }, [viewMode, smartFilters, debouncedSearchQuery, loadSections]);

  // Refresh sections handler
  const handleRefreshSections = useCallback(async () => {
    const userId = undefined; // For now, no user ID for anonymous users
    await hookRefreshSections(userId);
  }, [hookRefreshSections]);

  // Debug log when switching to map view
  // useEffect(() => {
  //   if (viewMode === 'map' && process.env.NODE_ENV === 'development') {
  //     console.log('🗺️ Switching to map view with screens:', {
  //       combinedScreens: combinedFilteredScreens.length,
  //       screensFromHook: screens.length,
  //       sspScreens: sspScreens.length,
  //       allCombinedScreens: allCombinedScreens.length,
  //       screensWithCoords: combinedFilteredScreens.filter(s => s.coordinates?.lat && s.coordinates?.lng).length,
  //       screensWithoutCoords: combinedFilteredScreens.filter(s => !s.coordinates?.lat || !s.coordinates?.lng).length,
  //       firstFewWithCoords: combinedFilteredScreens
  //         .filter(s => s.coordinates?.lat && s.coordinates?.lng)
  //         .slice(0, 3)
  //         .map(s => ({
  //           id: s.id,
  //       name: s.name?.slice(0, 30) + '...',
  //       coordinates: s.coordinates
  //     })),
  //       firstFewWithoutCoords: combinedFilteredScreens
  //         .filter(s => !s.coordinates?.lat || !s.coordinates?.lng)
  //         .slice(0, 3)
  //         .map(s => ({
  //           id: s.id,
  //       name: s.name?.slice(0, 30) + '...',
  //       coordinates: s.coordinates
  //     }))
  //     });
  //   }
  // }, [viewMode, combinedFilteredScreens, screens, sspScreens, allCombinedScreens]);

  // Simple debug logging
  const logSearchDebug = useCallback((query: string) => {
    if (process.env.NODE_ENV === 'development' && query.length >= 3) {
      console.log(`🔍 Searching for: "${query}"`);
      console.log(`Results: ${combinedFilteredScreens.length} screens found`);
    }
  }, [combinedFilteredScreens.length]);

  // Event handlers
  const handleSearchChange = useCallback((query: string) => {
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Search query changed:', query);
    }
    // Actualizar solo el estado local, los filtros se actualizarán via debounce
    setSearchQuery(query);
    
    // Log search results after a short delay
    setTimeout(() => logSearchDebug(query), 500);
  }, [searchQuery, logSearchDebug]);

  const handleScreenSelect = useCallback((screen: Screen) => {
    const targetPath = `/screens/${screen.id}`;
    
    // Development-only logging
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('🎯 Screen clicked:', {
    //     screenId: screen.id,
    //     screenName: screen.name,
    //     targetPath,
    //     fullScreen: {
    //       id: screen.id,
    //       name: screen.name,
    //       location: screen.location,
    //       coordinates: screen.coordinates
    //     }
    //   });
    // }
    
    try {
      navigate(targetPath);
    } catch (error) {
      // console.error('Navigation error:', { 
      //   error: error instanceof Error ? error.message : 'Unknown error',
      //   screenId: screen.id,
      //   targetPath 
      // });
      
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
    // console.log('Info clicked');
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    // Si los filtros se están limpiando completamente, también limpiar el input local
    if (newFilters.search.query === '' && searchQuery !== '') {
      setSearchQuery('');
    }
    updateSmartFilters(newFilters);
  }, [updateSmartFilters]);



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
            screens={combinedFilteredScreens}
            filters={smartFilters}
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
            filteredCount={combinedFilteredScreens.length}
            loading={loading}
            availableScreens={screens}
          />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          
          {/* Connection Status Indicator */}
          {screens.length > 0 && screens.length === convertedInitialScreens.length && (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span>
                  Usando datos de demostración - API no disponible temporalmente
                </span>
                <button
                  onClick={() => fetchScreens().catch(() => {})}
                  className="text-xs text-amber-600 hover:text-amber-800 underline ml-2"
                >
                  Reintentar conexión
                </button>
              </div>
            </div>
          )}

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

          {/* Smart Filter System */}
          <div className="mb-4">
            <SmartFilterSystem
              filters={smartFilters}
              onFiltersChange={handleFiltersChange}
              availableOptions={smartFilterOptions}
              resultCount={combinedFilteredScreens.length}
            />
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode === 'sectioned' && !smartFilters.search.query && !hasActiveFilters ? 'Secciones personalizadas' : 'Pantallas disponibles'}
              </h2>
              <p className="text-gray-600 mt-1">
                {viewMode === 'sectioned' && !smartFilters.search.query && !hasActiveFilters ? (
                  <>
                    Contenido personalizado basado en tus preferencias
                  </>
                ) : (
                  <>
                    {combinedFilteredScreens.length} {combinedFilteredScreens.length === 1 ? 'pantalla encontrada' : 'pantallas encontradas'}
                    {smartFilters.search.query && (
                      <span className="text-blue-600">
                        {' '}para "{smartFilters.search.query}"
                      </span>
                    )}
                    {smartActiveFilterCount > 0 && ` con ${smartActiveFilterCount} ${smartActiveFilterCount === 1 ? 'filtro' : 'filtros'}`}
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
                onClick={() => {
                  // Try to refetch screens
                  fetchScreens().catch(() => {
                    // If refetch fails, reload page
                    window.location.reload();
                  });
                }}
                className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (loading || sspLoading) && allCombinedScreens.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Monitor className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando pantallas...</h3>
              <p className="text-gray-600">Obteniendo las mejores opciones para ti</p>
            </div>
          ) : combinedFilteredScreens.length === 0 && !loading && !sspLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pantallas</h3>
              <p className="text-gray-600 mb-6">
                {smartFilters.search.query ? (
                  <>
                    No encontramos pantallas que coincidan con "{smartFilters.search.query}".
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">
                      Intenta buscar por ciudad (ej: Bogotá, Medellín), categoría o nombre de pantalla.
                    </span>
                  </>
                ) : (
                  <>No hay pantallas disponibles con los filtros seleccionados</>
                )}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : viewMode === 'sectioned' && !smartFilters.search.query && !hasActiveFilters ? (
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
                screens={combinedFilteredScreens}
                onScreenSelect={handleScreenSelect}
                onMarkerClick={handleScreenSelect}
                onFavoriteChange={handleFavoriteChange}
              />
            </div>
          ) : (
            <>
              {/* Debug info for development */}
              {process.env.NODE_ENV === 'development' && smartFilters.search.query && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>Debug - Búsqueda "{smartFilters.search.query}":</strong>
                    <br />
                    Pantallas filtradas: {combinedFilteredScreens.length}
                    <br />
                    Pantallas finales: {finalScreens.length}
                    <br />
                    Nombres: {finalScreens.slice(0, 3).map(s => s.name).join(', ')}
                    {finalScreens.length > 3 && '...'}
                  </div>
                </div>
              )}
              
              <ScreenList
                screens={finalScreens}
                onScreenSelect={handleScreenSelect}
                onFavoriteChange={handleFavoriteChange}
                loading={loading || sspLoading}
              />
            </>
          )}
          
          {/* Debug info for list view */}
          {/* {process.env.NODE_ENV === 'development' && viewMode === 'compact' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Debug: List View Data</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Showing {finalScreens.length} screens to ScreenList component:
              </p>
              <div className="text-xs text-yellow-600 space-y-1 max-h-32 overflow-y-auto">
                {finalScreens.slice(0, 5).map((screen, idx) => (
                  <div key={idx}>
                    {idx + 1}. ID: <span className="font-mono bg-yellow-100 px-1 rounded">{screen.id}</span> 
                    - Name: {screen.name?.slice(0, 40)}...
                  </div>
                ))}
                {finalScreens.length > 5 && (
                  <div>... and {finalScreens.length - 5} more</div>
                )}
              </div>
            </div>
          )} */}
          </div>
        </div>
      </div>
    </MarketplaceErrorBoundary>
  );
}
