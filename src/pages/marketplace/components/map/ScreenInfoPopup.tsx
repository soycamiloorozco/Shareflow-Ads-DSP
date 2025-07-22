/**
 * ScreenInfoPopup Component
 * Popup that displays when a marker is clicked on the map
 */

import React, { useState, useCallback } from 'react';
import { Heart, Eye, Star, MapPin, Monitor, Clock, ArrowRight, X } from 'lucide-react';
import { Screen } from '../../types/marketplace.types';
import { getScreenMinPrice } from '../../types/screen.types';
import favoritesService from '../../../../services/favoritesService';

interface ScreenInfoPopupProps {
  screen: Screen;
  onClose: () => void;
  onViewDetails: (screen: Screen) => void;
  onFavoriteChange?: () => void;
}

export function ScreenInfoPopup({
  screen,
  onClose,
  onViewDetails,
  onFavoriteChange
}: ScreenInfoPopupProps) {
  const [isFavorite, setIsFavorite] = useState(() => favoritesService.isFavorite(screen.id));
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate minimum price
  const minPrice = getScreenMinPrice(screen);
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(minPrice);

  // Get environment badge
  const environmentBadge = {
    indoor: { label: 'Interior', color: 'bg-blue-100 text-blue-800', icon: '🏢' },
    outdoor: { label: 'Exterior', color: 'bg-green-100 text-green-800', icon: '🌳' }
  }[screen.environment];

  // Handle favorite toggle
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

  // Handle view details click
  const handleViewDetails = useCallback(() => {
    onViewDetails(screen);
  }, [screen, onViewDetails]);

  return (
    <div className="w-80 max-w-sm bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with close button */}
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-3 h-3" />
        </button>
        
        {/* Screen Image */}
        <div className="relative h-32 bg-gray-200">
          <img
            src={screen.image}
            alt={screen.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Monitor className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Environment Badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${environmentBadge.color}`}>
              <span>{environmentBadge.icon}</span>
              {environmentBadge.label}
            </span>
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-8 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={`w-4 h-4 ${
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Screen Name */}
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {screen.name}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 text-xs mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{screen.location}</span>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{(screen.views.daily / 1000).toFixed(0)}K/día</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>{screen.rating}</span>
            <span className="text-gray-400">({screen.reviews})</span>
          </div>
          
          {screen.operatingHours && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{screen.operatingHours.start}-{screen.operatingHours.end}</span>
            </div>
          )}
        </div>
        
        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formattedPrice}
            </div>
            <div className="text-xs text-gray-500">
              desde
            </div>
          </div>
          
          <button
            onClick={handleViewDetails}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ver detalles
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{screen.specs.resolution} • {screen.specs.brightness}</span>
            <span className="capitalize">{screen.category.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenInfoPopup;