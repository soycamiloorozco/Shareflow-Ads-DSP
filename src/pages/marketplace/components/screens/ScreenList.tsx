import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Eye, ChevronRight, Heart, Clock, Sparkles, Monitor, Zap } from 'lucide-react';
import { Screen } from '../../types/marketplace.types';
import { getScreenMinPrice } from '../../utils/screen-utils';
import favoritesService from '../../../../services/favoritesService';

interface ScreenListProps {
  screens: Screen[];
  onScreenSelect: (screen: Screen) => void;
  onFavoriteChange?: () => void;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const ScreenList = React.memo<ScreenListProps>(({
  screens,
  onScreenSelect,
  onFavoriteChange,
  loading = false,
  className = '',
  'aria-label': ariaLabel = 'List of available screens'
}) => {
  const handleScreenSelect = useCallback((screen: Screen) => {
    onScreenSelect(screen);
  }, [onScreenSelect]);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent, screenId: string) => {
    e.stopPropagation();
    try {
      const success = await favoritesService.toggleFavorite(screenId);
      if (success) {
        onFavoriteChange?.();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [onFavoriteChange]);

  // Format price with Colombian peso format
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Format views with K/M suffix
  const formatViews = useCallback((views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K`;
    }
    return views.toString();
  }, []);

  if (loading) {
    return (
      <div 
        className={`space-y-3 ${className}`}
        aria-label={`${ariaLabel} (loading)`}
        aria-busy="true"
      >
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!screens || screens.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Monitor className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pantallas disponibles</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No hay pantallas disponibles que coincidan con tus filtros actuales. 
          Intenta ajustar los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`space-y-3 ${className}`}
      aria-label={ariaLabel}
    >
      {screens.map((screen, index) => {
        const isFavorite = favoritesService.isFavorite(screen.id);
        const minPrice = getScreenMinPrice(screen);
        
        return (
          <motion.div
            key={screen.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
            onClick={() => handleScreenSelect(screen)}
            role="button"
            tabIndex={0}
            aria-label={`${screen.name} en ${screen.location}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleScreenSelect(screen);
              }
            }}
          >
            <div className="flex items-center gap-4">
              {/* Screen Image */}
              <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img 
                  src={screen.image} 
                  alt={screen.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-screen.jpg';
                  }}
                />
                {/* Environment badge */}
                <div className="absolute top-1 left-1">
                  <span className={`px-1.5 py-0.5 text-white text-xs rounded ${
                    screen.environment === 'outdoor' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {screen.environment === 'outdoor' ? 'Exterior' : 'Interior'}
                  </span>
                </div>
                {/* Favorite button */}
                <button
                  onClick={(e) => handleFavoriteClick(e, screen.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart 
                    className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                  />
                </button>
              </div>
              
              {/* Screen Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate pr-2 group-hover:text-[#353FEF] transition-colors">
                    {screen.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {screen.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">({screen.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{screen.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {/* Category */}
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{screen.category?.icon || '🏢'}</span>
                      <span>{screen.category?.name || 'General'}</span>
                    </div>
                    
                    {/* Views */}
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatViews(screen.views.daily)}/día</span>
                    </div>
                    
                    {/* Specs */}
                    <div className="flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      <span>{screen.specs.resolution}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(minPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      desde
                    </div>
                  </div>
                </div>
                
                {/* Additional info row */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {/* Availability */}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        screen.availability ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span>{screen.availability ? 'Disponible' : 'No disponible'}</span>
                    </div>
                    
                    {/* Operating hours */}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{screen.operatingHours?.start || '06:00'} - {screen.operatingHours?.end || '22:00'}</span>
                    </div>
                    
                    {/* Moments available */}
                    {screen.pricing?.allowMoments && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>Momentos</span>
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#353FEF] transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

ScreenList.displayName = 'ScreenList';