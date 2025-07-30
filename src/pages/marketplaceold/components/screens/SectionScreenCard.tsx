import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Star, MapPin, Clock, Heart, ChevronRight, Sparkles, Eye, TrendingUp, Zap, Crown, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { EnhancedScreen, AlgorithmType } from '../../types/intelligent-grouping.types';
import { getScreenMinPrice } from '../../utils/screen-utils';
import favoritesService from '../../../../services/favoritesService';

interface SectionScreenCardProps {
  screen: EnhancedScreen;
  sectionType: AlgorithmType;
  index: number;
  onSelect: (screen: EnhancedScreen) => void;
  onFavoriteChange?: () => void;
  loading?: boolean;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
  'aria-label'?: string;
}

// Optimized pricing simulation hook
const useOptimizedPricing = (screenId: string) => {
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadPricing = useCallback(async () => {
    if (priceData || loading) return;
    
    setLoading(true);
    
    // Simulate AI pricing API call
    setTimeout(() => {
      const demandLevel = Math.random() * 2; // 0-2 demand multiplier
      const basePrice = 1000000; // Default base price
      const demandMultiplier = 1 + (demandLevel - 1) * 0.3;
      const timeOfDayMultiplier = new Date().getHours() > 18 ? 1.15 : 1;
      
      setPriceData({
        originalPrice: basePrice,
        optimizedPrice: Math.round(basePrice * demandMultiplier * timeOfDayMultiplier),
        savings: demandLevel < 1 ? Math.round(basePrice * 0.1) : 0,
        demandLevel: demandLevel > 1.2 ? 'high' : demandLevel > 0.8 ? 'medium' : 'low'
      });
      setLoading(false);
    }, 800);
  }, [screenId, priceData, loading]);

  return { priceData, loading, loadPricing };
};

export const SectionScreenCard = React.memo<SectionScreenCardProps>(({ 
  screen, 
  sectionType,
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
  const { priceData, loading: pricingLoading, loadPricing } = useOptimizedPricing(screen.id);

  // Update favorite state when screen changes
  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(screen.id));
  }, [screen.id]);

  // Enhanced data calculation with section-specific insights
  const enhancedData = useMemo(() => {
    const allowedTypes = [];
    if (screen.pricing?.bundles?.hourly?.enabled) allowedTypes.push('Hora');
    if (screen.pricing?.bundles?.daily?.enabled) allowedTypes.push('Día');
    if (screen.pricing?.bundles?.weekly?.enabled) allowedTypes.push('Semana');

    // Section-specific indicators
    const getSectionIndicator = () => {
      switch (sectionType) {
        case 'ml-personalized':
          return { 
            icon: Sparkles, 
            label: 'Para ti', 
            color: 'purple',
            confidence: screen.personalizedScore || 0.8
          };
        case 'trending-analysis':
          return { 
            icon: TrendingUp, 
            label: 'Trending', 
            color: 'orange',
            confidence: screen.trendingScore || 0.7
          };
        case 'new-discovery':
          return { 
            icon: Gift, 
            label: 'Nuevo', 
            color: 'green',
            confidence: 0.9
          };
        case 'geographic-popularity':
          return { 
            icon: Crown, 
            label: 'Popular', 
            color: 'yellow',
            confidence: 0.8
          };
        case 'recent-activity':
          return { 
            icon: Zap, 
            label: 'Activo', 
            color: 'blue',
            confidence: 0.7
          };
        default:
          return null;
      }
    };

    return {
      location: screen.location.split(',')[0],
      city: screen.location.split(',')[1]?.trim() || '',
      allowedTypes: allowedTypes.slice(0, 2),
      moreTypes: Math.max(0, allowedTypes.length - 2),
      dailyViews: screen.views?.daily || 0,
      engagement: screen.engagementMetrics?.engagementScore || screen.metrics?.averageEngagement || 85,
      isPopular: screen.rating > 4.7,
      priceDisplay: `${(getScreenMinPrice(screen) / 1000).toFixed(0)}K`,
      sectionIndicator: getSectionIndicator(),
      performanceScore: screen.performanceMetrics?.engagementScore || 0,
      bookingFrequency: screen.bookingFrequency,
      trendDirection: screen.performanceMetrics?.trendDirection || 'stable'
    };
  }, [screen, sectionType]);

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

  const handleCardClick = useCallback(() => {
    onSelect(screen);
  }, [screen, onSelect]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    loadPricing();
  }, [loadPricing]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  // Get indicator colors
  const getIndicatorColors = (color: string) => {
    const colors = {
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      blue: 'bg-blue-500 text-white'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  // Get performance indicator
  const getPerformanceIndicator = () => {
    if (enhancedData.performanceScore >= 0.8) return { color: 'text-green-500', label: 'Alto rendimiento' };
    if (enhancedData.performanceScore >= 0.6) return { color: 'text-yellow-500', label: 'Buen rendimiento' };
    return { color: 'text-gray-500', label: 'Rendimiento estándar' };
  };

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

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

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
      <motion.div 
        className={`relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full transform hover:-translate-y-1 ${
          isFeatured ? 'ring-2 ring-purple-200' : ''
        }`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        
        {/* Main Image with Consistent Aspect Ratio */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={screen.image}
            alt={screen.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            srcSet={`${screen.image} 1x, ${screen.image} 2x`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          
          {/* Section-specific indicator */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2">
            {enhancedData.sectionIndicator && (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`px-2 py-1 sm:px-2.5 sm:py-1.5 ${getIndicatorColors(enhancedData.sectionIndicator.color)} text-xs sm:text-sm font-semibold rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm`}
              >
                <enhancedData.sectionIndicator.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{enhancedData.sectionIndicator.label}</span>
              </motion.span>
            )}
            
            {/* Performance indicator */}
            {enhancedData.performanceScore > 0.7 && (
              <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Top</span>
              </span>
            )}

            {/* Category badge */}
            <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
              {screen.category?.name || 'Pantalla'}
            </span>
          </div>
          
          {/* Enhanced favorite button */}
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

          {/* Booking frequency indicator */}
          {enhancedData.bookingFrequency !== 'very-low' && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                enhancedData.bookingFrequency === 'very-high' ? 'bg-red-500/90 text-white' :
                enhancedData.bookingFrequency === 'high' ? 'bg-orange-500/90 text-white' :
                'bg-yellow-500/90 text-white'
              }`}>
                🔥 Demandado
              </span>
            </div>
          )}

          {/* Enhanced screen specs on hover */}
          {isHovered && screen.specs && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3"
            >
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-end">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.specs.resolution || 'HD'}
                </span>
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.specs.brightness || '7500 nits'}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Content Section */}
        <div className={`${isCompact ? 'p-3' : 'p-3 sm:p-4 lg:p-5'}`}>
          {/* Title and rating with performance indicator */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-900 leading-snug line-clamp-2 ${
                isCompact ? 'text-sm' : 'text-base'
              }`}>
                {screen.name}
              </h3>
              {/* Performance indicator */}
              {enhancedData.performanceScore > 0 && (
                <div className={`flex items-center gap-1 mt-1 ${getPerformanceIndicator().color}`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="text-xs">{getPerformanceIndicator().label}</span>
                </div>
              )}
            </div>
            
            {/* Enhanced rating with trend indicator */}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
              <span className="text-sm font-medium">{screen.rating}</span>
              {enhancedData.trendDirection === 'up' && (
                <TrendingUp className="w-3 h-3 text-green-500" />
              )}
              <span className="text-xs text-gray-500 hidden sm:inline">({screen.reviews})</span>
            </div>
          </div>

          {/* Enhanced location details */}
          <div className="mb-3">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">
                  {enhancedData.location}
                </div>
                {enhancedData.city && (
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {enhancedData.city}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced purchase options */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              <span className="text-xs text-gray-600">Disponible:</span>
            </div>
            <div className="flex gap-1">
              {enhancedData.allowedTypes.map((type) => (
                <span 
                  key={type}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                >
                  {type}
                </span>
              ))}
              {enhancedData.moreTypes > 0 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                  +{enhancedData.moreTypes}
                </span>
              )}
            </div>
          </div>

          {/* Enhanced moments badge */}
          {screen.pricing?.allowMoments && (
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
              <span className="text-xs text-purple-700 font-medium">Momentos disponibles</span>
            </div>
          )}

          {/* Enhanced audience metrics */}
          {enhancedData.dailyViews > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Eye className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
              <span className="text-xs text-gray-600">
                {(enhancedData.dailyViews / 1000).toFixed(0)}K vistas/día
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                enhancedData.engagement >= 90 ? 'bg-green-100 text-green-700' :
                enhancedData.engagement >= 70 ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {enhancedData.engagement}% engagement
              </span>
            </div>
          )}

          {/* Enhanced price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              {priceData ? (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-bold text-gray-900 ${
                      isCompact ? 'text-base' : 'text-lg'
                    }`}>
                      ${(priceData.optimizedPrice / 1000).toFixed(0)}K
                    </span>
                    <span className="text-sm text-gray-600">COP</span>
                    {priceData.savings > 0 && (
                      <span className="text-xs text-green-600 font-medium ml-1">
                        -{(priceData.savings / 1000).toFixed(0)}K
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    desde / hora
                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                      priceData.demandLevel === 'high' ? 'bg-red-100 text-red-700' :
                      priceData.demandLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {priceData.demandLevel === 'high' ? '🔥' : 
                       priceData.demandLevel === 'medium' ? '📈' : '💚'}
                    </span>
                  </div>
                </div>
              ) : pricingLoading ? (
                <div>
                  <div className="flex items-baseline gap-1">
                    <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <span className="text-sm text-gray-600">COP</span>
                  </div>
                  <div className="text-xs text-gray-500">Cargando precio...</div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-bold text-gray-900 ${
                      isCompact ? 'text-base' : 'text-lg'
                    }`}>
                      {enhancedData.priceDisplay}
                    </span>
                    <span className="text-sm text-gray-600">COP</span>
                  </div>
                  <div className="text-xs text-gray-500">desde / hora</div>
                </div>
              )}
            </div>

            {/* Enhanced CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardClick();
              }}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 bg-[#353FEF] hover:bg-[#2A32C5] text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm touch-manipulation min-h-[44px] ${
                isCompact ? 'text-sm' : 'text-sm'
              }`}
              aria-label={`Ver detalles de ${screen.name}`}
            >
              <span>Ver</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

SectionScreenCard.displayName = 'SectionScreenCard';