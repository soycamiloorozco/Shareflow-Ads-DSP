import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Star, Eye, ChevronRight, Heart, Clock, Monitor, Zap
} from 'lucide-react';
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

  // Get purchase type configuration - minimal and clean
  const getPurchaseTypeConfig = useCallback((screen: Screen) => {
    const hasMoments = screen.pricing?.allowMoments || screen.screenPackages?.some(pkg => pkg.packageType === 'moments');
    const hasHourly = screen.screenPackages?.some(pkg => pkg.packageType === 'hourly');
    const hasDaily = screen.screenPackages?.some(pkg => pkg.packageType === 'daily');
    const hasWeekly = screen.screenPackages?.some(pkg => pkg.packageType === 'weekly');
    const hasMonthly = screen.screenPackages?.some(pkg => pkg.packageType === 'monthly');

    if (hasMoments) {
      return { type: 'Momentos', emoji: '⚡', color: 'text-amber-600' };
    } else if (hasHourly || hasDaily) {
      return { type: 'Marketplace', emoji: '🛒', color: 'text-blue-600' };
    } else if (hasWeekly || hasMonthly) {
      return { type: 'Programático', emoji: '🤖', color: 'text-emerald-600' };
    } else {
      return { type: 'Marketplace', emoji: '🛒', color: 'text-blue-600' };
    }
  }, []);

  // Get venue category - simplified with emojis
  const getVenueCategory = useCallback((screen: Screen) => {
    const categoryId = screen.category?.id?.toLowerCase() || '';
    const screenName = screen.name.toLowerCase();
    const screenLocation = screen.location.toLowerCase();
    
    // Simple category detection
    if (categoryId.includes('mall') || screenName.includes('mall') || screenLocation.includes('mall')) {
      return { emoji: '🏬', label: 'Centro Comercial' };
    } else if (categoryId.includes('airport') || screenName.includes('airport') || screenLocation.includes('aeropuerto')) {
      return { emoji: '✈️', label: 'Aeropuerto' };
    } else if (categoryId.includes('bus') || screenName.includes('bus') || screenLocation.includes('terminal')) {
      return { emoji: '🚌', label: 'Terminal' };
    } else if (categoryId.includes('restaurant') || screenName.includes('restaurant') || screenLocation.includes('restaurante')) {
      return { emoji: '🍽️', label: 'Restaurante' };
    } else if (categoryId.includes('gym') || screenName.includes('gym') || screenLocation.includes('gimnasio')) {
      return { emoji: '💪', label: 'Gimnasio' };
    } else if (categoryId.includes('hotel') || screenName.includes('hotel') || screenLocation.includes('hotel')) {
      return { emoji: '🏨', label: 'Hotel' };
    } else if (categoryId.includes('office') || screenName.includes('office') || screenLocation.includes('oficina')) {
      return { emoji: '🏢', label: 'Oficinas' };
    } else if (categoryId.includes('outdoor') || categoryId.includes('billboard') || screen.environment === 'outdoor') {
      return { emoji: '📺', label: 'Exterior' };
    } else {
      return { emoji: screen.category?.icon || '🏢', label: screen.category?.name || 'General' };
    }
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
            className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-14 bg-gray-100 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded-lg w-1/2 mb-3"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-6 bg-gray-100 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-100 rounded-full w-14"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <div className="h-3 bg-gray-100 rounded w-12"></div>
                    <div className="h-3 bg-gray-100 rounded w-10"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                  <div className="h-5 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!screens || screens.length === 0) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📺</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay pantallas disponibles</h3>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          No encontramos pantallas que coincidan con tus filtros. 
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
        const purchaseType = getPurchaseTypeConfig(screen);
        const venueCategory = getVenueCategory(screen);
        
        return (
          <motion.div
            key={screen.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer group"
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
            <div className="flex items-start gap-4">
              {/* Screen Image */}
              <div className="w-20 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img 
                  src={screen.image} 
                  alt={screen.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-screen.jpg';
                  }}
                />
                {/* Favorite button */}
                <button
                  onClick={(e) => handleFavoriteClick(e, screen.id)}
                  className="absolute top-1 right-1 p-1 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart 
                    className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                  />
                </button>
              </div>
              
              {/* Screen Info */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#353FEF] transition-colors">
                      {screen.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{screen.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {screen.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Tags Row */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Venue Category */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-700">
                    <span className="text-sm">{venueCategory.emoji}</span>
                    <span>{venueCategory.label}</span>
                  </div>
                  
                  {/* Purchase Type */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-700">
                    <span className="text-sm">{purchaseType.emoji}</span>
                    <span>{purchaseType.type}</span>
                  </div>
                  
                  {/* Environment */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    screen.environment === 'outdoor' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {screen.environment === 'outdoor' ? '🌤️ Exterior' : '🏠 Interior'}
                  </div>
                  
                  {/* Availability */}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      screen.availability ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {screen.availability ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {/* Daily Views */}
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span className="font-medium">{formatViews(screen.views.daily)}</span>
                      <span>vistas/día</span>
                    </div>
                    
                    {/* Resolution */}
                    <div className="flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      <span>{screen.specs.resolution}</span>
                    </div>
                    
                    {/* Operating Hours */}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{screen.operatingHours?.start || '06:00'}-{screen.operatingHours?.end || '22:00'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(minPrice)}
                      </div>
                      <div className="text-xs text-gray-500">desde</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#353FEF] transition-colors" />
                  </div>
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