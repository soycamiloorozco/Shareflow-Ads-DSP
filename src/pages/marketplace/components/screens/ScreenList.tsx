import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Eye, ChevronRight, Heart, Clock, Sparkles } from 'lucide-react';
import { getScreenMinPrice } from '../../utils/screen-utils';
import favoritesService from '../../../../services/favoritesService';

interface ScreenListProps {
  screens: any[];
  onScreenSelect: (screen: any) => void;
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
  const handleScreenSelect = useCallback((screen: any) => {
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
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-20 h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (screens.length === 0) {
    return (
      <div 
        className={`text-center py-16 ${className}`}
        aria-label={`${ariaLabel} (no results)`}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pantallas</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
            aria-label={`${screen.name} in ${screen.location}`}
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
                />
                {/* Category badge */}
                <div className="absolute top-1 left-1">
                  <span className="px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                    {screen.category?.name || 'Pantalla'}
                  </span>
                </div>
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
                      {screen.rating}
                    </span>
                    <span className="text-xs text-gray-500">({screen.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{screen.location}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{(screen.views?.daily / 1000 || 0).toFixed(0)}K/día</span>
                  </div>
                  
                  {screen.pricing?.allowMoments && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs font-medium">Momentos</span>
                    </div>
                  )}
                  
                  {screen.operatingHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {screen.operatingHours.start}-{screen.operatingHours.end}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price and Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Favorite Button */}
                <button
                  onClick={(e) => handleFavoriteClick(e, screen.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
                    }`} 
                  />
                </button>
                
                {/* Price */}
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      notation: minPrice >= 1000000 ? 'compact' : 'standard'
                    }).format(minPrice)}
                  </div>
                  <div className="text-xs text-gray-500">por hora</div>
                </div>
                
                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScreenSelect(screen);
                  }}
                  className="p-2 text-[#353FEF] hover:bg-[#353FEF]/10 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Ver detalles de ${screen.name}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

ScreenList.displayName = 'ScreenList';