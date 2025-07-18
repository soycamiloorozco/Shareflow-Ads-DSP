/**
 * MapContainer Component
 * Simplified map view without Google Maps dependency
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Screen, Coordinates } from '../../types/marketplace.types';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Heart, Star, Eye } from 'lucide-react';

interface MapContainerProps {
  screens: Screen[];
  selectedScreen?: Screen | null;
  onScreenSelect: (screen: Screen) => void;
  onMarkerClick: (screen: Screen) => void;
  onFavoriteChange?: () => void;
  center?: Coordinates;
  zoom?: number;
  className?: string;
}

const defaultCenter: Coordinates = {
  lat: 4.7110,
  lng: -74.0721 // Bogotá, Colombia
};

export function MapContainer({
  screens,
  selectedScreen,
  onScreenSelect,
  onMarkerClick,
  onFavoriteChange,
  center = defaultCenter,
  zoom = 11,
  className = ''
}: MapContainerProps) {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Filter screens with valid coordinates
  const validScreens = useMemo(() => {
    return screens.filter(screen => 
      screen.coordinates?.lat && 
      screen.coordinates?.lng &&
      !isNaN(screen.coordinates.lat) &&
      !isNaN(screen.coordinates.lng)
    );
  }, [screens]);

  // Handle marker click
  const handleMarkerClick = useCallback((screen: Screen) => {
    setSelectedScreenId(screen.id);
    onMarkerClick(screen);
  }, [onMarkerClick]);

  // Handle screen selection
  const handleScreenSelect = useCallback((screen: Screen) => {
    onScreenSelect(screen);
  }, [onScreenSelect]);

  // Calculate bounds for all screens
  const mapBounds = useMemo(() => {
    if (validScreens.length === 0) return null;
    
    const lats = validScreens.map(s => s.coordinates!.lat);
    const lngs = validScreens.map(s => s.coordinates!.lng);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  }, [validScreens]);

  // Convert coordinates to screen position
  const coordsToPosition = useCallback((lat: number, lng: number) => {
    if (!mapBounds) return { x: 50, y: 50 };
    
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  }, [mapBounds]);

  // Group screens by proximity for clustering
  const clusteredScreens = useMemo(() => {
    if (currentZoom >= 14) {
      return validScreens.map(screen => ({ screen, isCluster: false, count: 1 }));
    }

    const clusters: Array<{ screen: Screen; isCluster: boolean; count: number; screens?: Screen[] }> = [];
    const processed = new Set<string>();
    const clusterDistance = currentZoom < 10 ? 0.05 : 0.02;

    validScreens.forEach(screen => {
      if (processed.has(screen.id)) return;

      const nearbyScreens = validScreens.filter(otherScreen => {
        if (processed.has(otherScreen.id) || screen.id === otherScreen.id) return false;
        
        const latDiff = Math.abs(screen.coordinates!.lat - otherScreen.coordinates!.lat);
        const lngDiff = Math.abs(screen.coordinates!.lng - otherScreen.coordinates!.lng);
        
        return latDiff < clusterDistance && lngDiff < clusterDistance;
      });

      if (nearbyScreens.length > 0) {
        nearbyScreens.forEach(s => processed.add(s.id));
        processed.add(screen.id);
        
        clusters.push({
          screen,
          isCluster: true,
          count: nearbyScreens.length + 1,
          screens: [screen, ...nearbyScreens]
        });
      } else {
        processed.add(screen.id);
        clusters.push({
          screen,
          isCluster: false,
          count: 1
        });
      }
    });

    return clusters;
  }, [validScreens, currentZoom]);

  return (
    <div className={`w-full h-full relative bg-gradient-to-br from-blue-50 to-green-50 ${className}`}>
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 opacity-50">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setCurrentZoom(Math.min(18, currentZoom + 2))}
          className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors"
          title="Acercar"
        >
          <ZoomIn className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => setCurrentZoom(Math.max(8, currentZoom - 2))}
          className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors"
          title="Alejar"
        >
          <ZoomOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Leyenda</h4>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Interior</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Exterior</span>
          </div>
        </div>
      </div>

      {/* Screen Markers */}
      {clusteredScreens.map((item, index) => {
        const position = coordsToPosition(item.screen.coordinates!.lat, item.screen.coordinates!.lng);
        const isSelected = selectedScreenId === item.screen.id;
        
        if (item.isCluster && item.screens) {
          // Cluster marker
          return (
            <div
              key={`cluster-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onClick={() => setCurrentZoom(Math.min(16, currentZoom + 3))}
            >
              <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white hover:scale-110 transition-transform">
                {item.count}
              </div>
            </div>
          );
        } else {
          // Individual marker
          return (
            <div
              key={item.screen.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onClick={() => handleMarkerClick(item.screen)}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white
                transition-all duration-200 hover:scale-125
                ${isSelected ? 'w-8 h-8 animate-pulse' : ''}
                ${item.screen.environment === 'indoor' ? 'bg-blue-500' : 'bg-green-500'}
              `}>
                <MapPin className="w-3 h-3 text-white" />
              </div>
              
              {/* Screen info popup */}
              {isSelected && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-4 min-w-[280px] z-30">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.screen.image}
                      alt={item.screen.name}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">
                        {item.screen.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {item.screen.location}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{item.screen.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {(item.screen.views.daily / 1000).toFixed(0)}K/día
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScreenSelect(item.screen);
                          }}
                          className="flex-1 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Ver detalles
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScreenId(null);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
      })}

      {/* No screens message */}
      {validScreens.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pantallas para mostrar</h3>
            <p className="text-gray-600">
              Ajusta los filtros para ver más pantallas en el mapa
            </p>
          </div>
        </div>
      )}

      {/* Map info */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Navigation className="w-4 h-4" />
          <span>{validScreens.length} pantallas disponibles</span>
        </div>
      </div>
    </div>
  );
}

export default MapContainer;