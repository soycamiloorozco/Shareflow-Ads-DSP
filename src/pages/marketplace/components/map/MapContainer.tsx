/**
 * MapContainer Component
 * Google Maps implementation for displaying screens
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Screen, Coordinates } from '../../types/marketplace.types';
import { GOOGLE_MAPS_CONFIG, MAP_CONTAINER_STYLE, GOOGLE_MAPS_ERRORS } from '../../../../config/googleMaps';
import { ScreenMarker } from './ScreenMarker';
import { MapLegend } from './MapLegend';
// import { GoogleMapsDebug } from './GoogleMapsDebug'; // Hidden for production
import { logEnvironmentStatus } from '../../../../utils/environmentCheck';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(
    selectedScreen?.id || null
  );
  const [markersLoaded, setMarkersLoaded] = useState(false);
  const [screenDataReady, setScreenDataReady] = useState(false);

  // Load Google Maps API (must be first)
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries,
    language: 'es',
    region: 'CO'
  });

  // Log environment status in development
  useEffect(() => {
    logEnvironmentStatus();
  }, []);

  // Monitor screen data readiness
  useEffect(() => {
    if (screens.length > 0) {
      setScreenDataReady(true);
      if (process.env.NODE_ENV === 'development') {
        // console.log('📊 Screen data ready:', screens.length, 'screens received');
      }
    } else {
      setScreenDataReady(false);
    }
  }, [screens]);



  // Filter screens with valid coordinates (always call useMemo)
  const validScreens = useMemo(() => {
    const filtered = screens.filter((screen: Screen) => 
      screen.coordinates?.lat && 
      screen.coordinates?.lng &&
      !isNaN(screen.coordinates.lat) &&
      !isNaN(screen.coordinates.lng) &&
      Math.abs(screen.coordinates.lat) <= 90 &&
      Math.abs(screen.coordinates.lng) <= 180
    );
    
    
    return filtered;
  }, [screens]);

  // Monitor markers loading (after validScreens is defined)
  useEffect(() => {
    if (isLoaded && screenDataReady && validScreens.length >= 0) {
      // Add a small delay to ensure markers are rendered
      const timer = setTimeout(() => {
        setMarkersLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          // console.log('✅ Markers loaded:', validScreens.length, 'valid screens');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setMarkersLoaded(false);
    }
  }, [isLoaded, screenDataReady, validScreens]);

  // Calculate map bounds based on screens (always call useMemo)
  const mapBounds = useMemo(() => {
    if (validScreens.length === 0 || !isLoaded || !window.google?.maps) return null;
    
    const bounds = new google.maps.LatLngBounds();
    validScreens.forEach(screen => {
      if (screen.coordinates) {
        bounds.extend({
          lat: screen.coordinates.lat,
          lng: screen.coordinates.lng
        });
      }
    });
    
    return bounds;
  }, [validScreens, isLoaded]);

  // Handle map load (always define callback)
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Fit bounds if we have screens
    // Wait a bit for the map to be ready
    setTimeout(() => {
      if (mapBounds && validScreens.length > 1) {
        map.fitBounds(mapBounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        });
      } else if (validScreens.length === 1 && validScreens[0].coordinates) {
        // Center on single screen
        map.setCenter({
          lat: validScreens[0].coordinates.lat,
          lng: validScreens[0].coordinates.lng
        });
        map.setZoom(15);
      }
    }, 100);
  }, [mapBounds, validScreens]);

  // Handle map unmount (always define callback)
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker click (always define callback)
  const handleMarkerClick = useCallback((screen: Screen) => {
    setSelectedScreenId(screen.id);
    onMarkerClick(screen);
  }, [onMarkerClick]);

  // Handle screen selection (always define callback)
  const handleScreenSelect = useCallback((screen: Screen) => {
    onScreenSelect(screen);
  }, [onScreenSelect]);

  // Retry loading maps (always define callback)
  const retryLoad = useCallback(() => {
    window.location.reload();
  }, []);

  // Early returns only after all hooks
  if (!isLoaded) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    const errorMessage = !GOOGLE_MAPS_CONFIG.apiKey 
      ? GOOGLE_MAPS_ERRORS.API_KEY_MISSING 
      : GOOGLE_MAPS_ERRORS.LOAD_ERROR;

    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar el mapa
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            {errorMessage}
          </p>
          <button
            onClick={retryLoad}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }



  // Determine if we should show loading
  const showLoading = !isLoaded || !screenDataReady || !markersLoaded;

  return (
    <div className={`w-full h-full relative ${className}`}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          ...GOOGLE_MAPS_CONFIG.defaultOptions,
          restriction: {
            latLngBounds: {
              north: 12.5,
              south: -4.2,
              east: -66.8,
              west: -81.7
            },
            strictBounds: false
          }
        }}
      >
        {/* Render screen markers only when ready */}
        {markersLoaded && validScreens.map(screen => {
          // Debug log for each marker
          // if (process.env.NODE_ENV === 'development') {
          //   console.log('🎯 Rendering marker for:', {
          //     id: screen.id,
          //     name: screen.name,
          //     coordinates: screen.coordinates
          //   });
          // }
          
          return (
            <ScreenMarker
              key={screen.id}
              screen={screen}
              onScreenSelect={handleScreenSelect}
              onFavoriteChange={onFavoriteChange}
              isSelected={selectedScreenId === screen.id}
            />
          );
        })}
      </GoogleMap>

      {/* Loading Overlay */}
      {showLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">Cargando mapa</p>
              <div className="text-sm text-gray-500">
                {!isLoaded && "Inicializando Google Maps..."}
                {isLoaded && !screenDataReady && "Cargando pantallas..."}
                {isLoaded && screenDataReady && !markersLoaded && `Ubicando ${validScreens.length} pantallas...`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend - only show when not loading */}
      {!showLoading && (
        <MapLegend 
          className="absolute bottom-4 left-4 z-10"
          totalScreens={validScreens.length}
        />
      )}

      {/* Debug component (development only) - HIDDEN */}
      {/* <GoogleMapsDebug 
        screens={screens} 
        validScreens={validScreens}
      /> */}

      {/* No screens message - only show when loaded and no valid screens */}
      {!showLoading && validScreens.length === 0 && screens.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay pantallas para mostrar
            </h3>
            <p className="text-gray-600">
              Las pantallas no tienen coordenadas válidas para mostrar en el mapa
            </p>
          </div>
        </div>
      )}

      {/* No data message - when no screens at all */}
      {!showLoading && screens.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay pantallas disponibles
            </h3>
            <p className="text-gray-600">
              Ajusta los filtros para ver más pantallas en el mapa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapContainer;