/**
 * ScreenMarker Component
 * Custom marker for displaying screens on Google Maps
 */

import React, { useState, useCallback } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { Screen } from '../../types/marketplace.types';
import { Star, Eye, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';

interface ScreenMarkerProps {
  screen: Screen;
  onScreenSelect: (screen: Screen) => void;
  onFavoriteChange?: () => void;
  isSelected?: boolean;
}

export function ScreenMarker({
  screen,
  onScreenSelect,
  onFavoriteChange,
  isSelected = false
}: ScreenMarkerProps) {
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(isSelected);

  // Create custom marker icon based on screen environment
  const getMarkerIcon = useCallback((): google.maps.Icon | undefined => {
    if (!window.google?.maps) return undefined;
    
    const color = screen.environment === 'indoor' ? '#3B82F6' : '#10B981'; // Blue for indoor, Green for outdoor
    const size = isSelected ? 40 : 32;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" fill="white" stroke="${color}" stroke-width="1.5"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    };
  }, [screen.environment, isSelected]);

  const handleMarkerClick = useCallback(() => {
    setIsInfoWindowOpen(true);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setIsInfoWindowOpen(false);
  }, []);

  const handleViewDetails = useCallback(() => {
    onScreenSelect(screen);
    setIsInfoWindowOpen(false);
  }, [screen, onScreenSelect]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K`;
    }
    return views.toString();
  };

  // Only render if screen has valid coordinates
  if (!screen.coordinates?.lat || !screen.coordinates?.lng) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚫 ScreenMarker skipped for:', screen.name, 'Invalid coordinates:', screen.coordinates);
    }
    return null;
  }

  // Debug log for successful marker render
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ ScreenMarker rendering for:', screen.name, 'at:', screen.coordinates);
  }

  return (
    <>
      <Marker
        position={{
          lat: screen.coordinates.lat,
          lng: screen.coordinates.lng,
        }}
        icon={getMarkerIcon()}
        onClick={handleMarkerClick}
        title={screen.name}
        zIndex={isSelected ? 1000 : 1}
      />

      {isInfoWindowOpen && (
        <InfoWindow
          position={{
            lat: screen.coordinates.lat,
            lng: screen.coordinates.lng,
          }}
          onCloseClick={handleInfoWindowClose}
          options={{
            pixelOffset: window.google?.maps ? new google.maps.Size(0, -20) : undefined,
            maxWidth: 320,
          }}
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm">
            {/* Screen Image */}
            <div className="relative h-32 bg-gray-100">
              <img
                src={screen.image}
                alt={screen.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/300/200';
                }}
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  screen.environment === 'indoor' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {screen.environment === 'indoor' ? 'Interior' : 'Exterior'}
                </span>
              </div>
            </div>

            {/* Screen Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                {screen.name}
              </h3>
              
              <p className="text-xs text-gray-600 mb-3 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {screen.location}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center text-xs text-gray-600">
                  <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                  <span>{screen.rating}</span>
                  <span className="ml-1">({screen.reviews})</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Eye className="w-3 h-3 mr-1" />
                  <span>{formatViews(screen.views.daily)}/día</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-3">
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <DollarSign className="w-3 h-3 mr-1" />
                  <span>Desde {formatPrice(screen.price)}</span>
                </div>
                {screen.operatingHours && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{screen.operatingHours.start} - {screen.operatingHours.end}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleViewDetails}
                  className="flex-1 bg-indigo-600 text-white text-xs px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  Ver detalles
                </button>
                {onFavoriteChange && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoriteChange();
                    }}
                    className="px-3 py-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Agregar a favoritos"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default ScreenMarker; 