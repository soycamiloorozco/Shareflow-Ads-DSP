import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid3X3, List, Heart, Eye, Settings, Map } from 'lucide-react';
import { CompactMobileFilter } from './filters/CompactMobileFilter';
import { SectionedScreenGrid } from './sections/SectionedScreenGrid';
import { ScreenGrid } from './screens/ScreenGrid';
import { MapContainer } from './map/MapContainer';
import { FilterState, FilterOptions } from '../types';
import { MarketplaceSection } from '../types/intelligent-grouping.types';
import { 
  VENUE_CATEGORIES, 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_ICONS, 
  VenueUtils 
} from '../../../types/venue-categories';

interface MobileMarketplaceInterfaceProps {
  sections: MarketplaceSection[];
  screens: any[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onScreenSelect: (screen: any) => void;
  onFavoriteChange?: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

type ViewMode = 'sections' | 'list' | 'map';

export const MobileMarketplaceInterface = React.memo<MobileMarketplaceInterfaceProps>(({
  sections,
  screens,
  filters,
  onFiltersChange,
  onScreenSelect,
  onFavoriteChange,
  loading = false,
  error = null,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const [searchQuery, setSearchQuery] = useState(filters.search.query || '');

  // Auto-update search filter when user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search.query) {
        onFiltersChange({
          ...filters,
          search: { ...filters.search, query: searchQuery }
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, onFiltersChange]);

  // Generate filter options from venue categories
  const availableOptions: FilterOptions = useMemo(() => {
    const venueCategories = VenueUtils.getAllCategories();
    
    return {
      cities: [
        { id: 'bogota', label: 'Bogotá', count: 156 },
        { id: 'medellin', label: 'Medellín', count: 89 },
        { id: 'cali', label: 'Cali', count: 67 },
        { id: 'barranquilla', label: 'Barranquilla', count: 45 },
        { id: 'cartagena', label: 'Cartagena', count: 34 }
      ],
      categories: venueCategories.map(cat => ({
        id: cat.key,
        label: cat.name,
        count: Math.floor(Math.random() * 50) + 5
      })),
      priceRanges: [
        { id: 'budget', label: 'Económico', emoji: '💰', count: 89, min: 0, max: 500000 },
        { id: 'mid', label: 'Intermedio', emoji: '💳', count: 134, min: 500000, max: 1500000 },
        { id: 'premium', label: 'Premium', emoji: '💎', count: 67, min: 1500000, max: 5000000 },
        { id: 'luxury', label: 'Lujo', emoji: '👑', count: 23, min: 5000000, max: Number.MAX_SAFE_INTEGER }
      ],
      venueTypes: [],
      environments: [],
      dwellTimes: [],
      features: []
    };
  }, []);

  // Calculate result count based on filters
  const resultCount = useMemo(() => {
    let count = screens.length;
    
    // Apply basic filtering logic for demo
    if (filters.search.query) {
      count = Math.floor(count * 0.7);
    }
    if (filters.location.cities.length > 0) {
      count = Math.floor(count * 0.8);
    }
    if (filters.category.categories.length > 0) {
      count = Math.floor(count * 0.6);
    }
    if (filters.showFavoritesOnly) {
      count = Math.floor(count * 0.3);
    }
    
    return Math.max(count, 1);
  }, [screens.length, filters]);

  // Auto-refresh sections when filters change significantly
  const handleAutoRefresh = useCallback(async () => {
    // Simulate section regeneration based on new filters
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pantallas, ubicaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#353FEF]/20 focus:bg-white transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('sections')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'sections'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Secciones</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-3 h-3" />
                <span>Lista</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-3 h-3" />
                <span>Mapa</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFiltersChange({
                  ...filters,
                  showFavoritesOnly: !filters.showFavoritesOnly
                })}
                className={`p-2 rounded-lg transition-colors ${
                  filters.showFavoritesOnly
                    ? 'bg-pink-100 text-pink-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${filters.showFavoritesOnly ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Filter System */}
      <div className="px-4 py-3">
        <CompactMobileFilter
          filters={filters}
          onFiltersChange={onFiltersChange}
          availableOptions={availableOptions}
          resultCount={resultCount}
        />
      </div>

      {/* Content Area */}
      <div className="px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'sections' && (
              <SectionedScreenGrid
                sections={sections}
                onScreenSelect={onScreenSelect}
                onFavoriteChange={onFavoriteChange}
                onRefreshSections={handleAutoRefresh}
                loading={loading}
                error={error}
                className="mt-4"
              />
            )}

            {viewMode === 'list' && (
              <div className="mt-4">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Todas las pantallas
                    </h2>
                    <p className="text-sm text-gray-500">
                      {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                    </p>
                  </div>
                </div>

                <ScreenGrid
                  screens={screens.slice(0, resultCount)}
                  circuits={[]}
                  onScreenSelect={onScreenSelect}
                  onFavoriteChange={onFavoriteChange}
                  loading={loading}
                  viewMode="list"
                  className="space-y-4"
                />
              </div>
            )}

            {viewMode === 'map' && (
              <div className="mt-4">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Vista de mapa
                    </h2>
                    <p className="text-sm text-gray-500">
                      {screens.length} {screens.length === 1 ? 'pantalla' : 'pantallas'} en el mapa
                    </p>
                  </div>
                </div>

                {/* Map Container */}
                <div className="h-[400px] bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <MapContainer
                    screens={screens}
                    onScreenSelect={onScreenSelect}
                    onMarkerClick={onScreenSelect}
                    onFavoriteChange={onFavoriteChange}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#353FEF] border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-900 font-medium">Cargando...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MobileMarketplaceInterface.displayName = 'MobileMarketplaceInterface';