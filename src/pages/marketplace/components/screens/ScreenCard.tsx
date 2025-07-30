import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Star, MapPin, Clock, Heart, ChevronRight, Sparkles, Eye, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScreenCardProps } from '../../types';
import { getScreenMinPrice } from '../../utils/screen-utils';
import favoritesService from '../../../../services/favoritesService';

export const ScreenCard = React.memo<ScreenCardProps>(({ 
  screen, 
  index,
  onSelect,
  onFavoriteChange,
  loading = false,
  variant = 'default',
  className = '',
  'aria-label': ariaLabel
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => favoritesService.isFavorite(screen.id));

  // Update favorite state when screen changes
  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(screen.id));
  }, [screen.id]);

  // Compact data calculation with responsive considerations
  const compactData = useMemo(() => {
    const allowedTypes = [];
    if (screen.pricing?.bundles?.hourly?.enabled) allowedTypes.push('Hora');
    if (screen.pricing?.bundles?.daily?.enabled) allowedTypes.push('Día');
    if (screen.pricing?.bundles?.weekly?.enabled) allowedTypes.push('Semana');

    // Safe location handling for API real data
    const locationString = screen.location || (screen as any).address || '';
    const locationParts = locationString.split(',');
    
    return {
      location: locationParts[0] || 'Ubicación no disponible',
      city: locationParts[1]?.trim() || '',
      allowedTypes: allowedTypes.slice(0, 2),
      moreTypes: Math.max(0, allowedTypes.length - 2),
      dailyViews: screen.views?.daily || 0,
      engagement: screen.metrics?.averageEngagement || 85,
      isPopular: screen.rating > 4.7,
      priceDisplay: `$${(getScreenMinPrice(screen) / 1000).toFixed(0)}K`
    };
  }, [screen]);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await favoritesService.toggleFavorite(screen.id);
      if (success) {
        setIsFavorite(favoritesService.isFavorite(screen.id));
        onFavoriteChange?.();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [screen.id, onFavoriteChange]);

  const handleCardClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('ScreenCard clicked:', screen.id, screen.name);
    console.log('Calling onSelect with screen:', screen);
    onSelect(screen);
  }, [screen, onSelect]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);



  if (loading) {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse ${className}`}>
        <div className="aspect-[4/3] bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`cursor-pointer group relative ${className}`}
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        animationFillMode: 'both'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || `${screen.name} in ${screen.location}`}
    >
      {/* Enhanced Card with Responsive Design */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full transform hover:-translate-y-1">
        
        {/* Main Image - Consistent Aspect Ratio */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={screen.image}
            alt={screen.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            srcSet={`${screen.image} 1x, ${screen.image} 2x`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
          
          {/* Gradient overlay - Responsive opacity */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Essential badges with Enhanced Touch Targets */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2">
            {compactData.isPopular && (
              <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-orange-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">Popular</span>
              </span>
            )}
            <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
              {screen.category?.name || 'Pantalla'}
            </span>
          </div>
          
          {/* Favorite button - Enhanced for Touch */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md touch-manipulation min-h-[44px] min-w-[44px]"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={isFavorite}
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Screen specs on hover - Responsive Layout */}
          {isHovered && screen.specs && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3"
            >
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.specs.resolution || 'HD'}
                </span>
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.specs.brightness || '7500 nits'}
                </span>
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.environment === 'indoor' ? 'Interior' : 'Exterior'}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content section - Enhanced Responsive Design */}
        <div className="p-3 sm:p-4 lg:p-5">
          {/* Title and rating - Improved Typography */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2"
                  style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
                {screen.name}
              </h3>
            </div>
            
            {/* Compact rating - Enhanced Touch Target */}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
              <span className="text-sm font-medium">{screen.rating}</span>
              <span className="text-xs text-gray-500 hidden sm:inline">({screen.reviews})</span>
            </div>
          </div>

          {/* Location details - Responsive Layout */}
          <div className="mb-3">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">
                  {compactData.location}
                </div>
                {compactData.city && (
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {compactData.city}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Purchase options - Responsive Design */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              <span className="text-xs text-gray-600">Disponible:</span>
            </div>
            <div className="flex gap-1">
              {compactData.allowedTypes.map((type) => (
                <span 
                  key={type}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                >
                  {type}
                </span>
              ))}
              {compactData.moreTypes > 0 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                  +{compactData.moreTypes}
                </span>
              )}
            </div>
          </div>

          {/* Moments badge - Enhanced */}
          {screen.pricing?.allowMoments && (
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
              <span className="text-xs text-purple-700 font-medium">Momentos disponibles</span>
            </div>
          )}

          {/* Audience metrics */}
          {compactData.dailyViews > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Eye className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
              <span className="text-xs text-gray-600">
                {(compactData.dailyViews / 1000).toFixed(0)}K vistas/día
              </span>
            </div>
          )}

          {/* Price and CTA - Responsive Layout */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-900"
                      style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                  {compactData.priceDisplay}
                </span>
                <span className="text-sm text-gray-600">COP</span>
              </div>
              <div className="text-xs text-gray-500">desde / hora</div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-2">
              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('CTA Button clicked for screen:', screen.id);
                  onSelect(screen);
                }}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#353FEF] hover:bg-[#2A32C5] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
                aria-label={`Ver detalles de ${screen.name}`}
              >
                <span>Ver detalles</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ScreenCard.displayName = 'ScreenCard';