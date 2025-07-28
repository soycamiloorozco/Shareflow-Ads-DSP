import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Maximize2, X, ExternalLink
} from 'lucide-react';
import { Screen } from '../../types';

interface ScreenLocationMapProps {
  screen: Screen;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const ScreenLocationMap: React.FC<ScreenLocationMapProps> = ({ screen }) => {
  const [isFullScreenMap, setIsFullScreenMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const locationData = {
    address: screen.location,
    coordinates: screen.coordinates || { lat: 6.2442, lng: -75.5812 }
  };
  
  const openDirections = () => {
    const { lat, lng } = locationData.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };
  
  const getMarkerIcon = () => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return {
        url: 'data:image/svg+xml,' + encodeURIComponent(`
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 12 30 12 30S24 18.627 24 12C24 5.373 18.627 0 12 0Z" fill="#FF385C"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 30),
        anchor: new window.google.maps.Point(12, 30)
      };
    }
    return undefined;
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-6">
      {/* Title */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Dónde estarás</h2>
      </div>

      {/* Map Container */}
      <div className="px-4 sm:px-6">
          <div className="relative">
          <div className="h-80 sm:h-96 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dO9F0R9-8J0Q8Y'}
                onLoad={() => setMapLoaded(true)}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={locationData.coordinates}
                  zoom={15}
                  options={mapOptions}
                >
                  {mapLoaded && (
                    <Marker
                      position={locationData.coordinates}
                      icon={getMarkerIcon()}
                      title={screen.name}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
              
            {/* Expand button */}
            <button
                  onClick={() => setIsFullScreenMap(true)}
              className="absolute top-4 right-4 w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md transition-shadow"
                >
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
              </div>
              
      {/* Location Details */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-4">
                    <div>
            <h3 className="font-semibold text-gray-900 mb-2">{screen.name}</h3>
                      <p className="text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
                        {locationData.address}
                      </p>
          </div>

          {/* Action Button */}
          <button
            onClick={openDirections}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver en Google Maps
          </button>
            </div>
          </div>
      
      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullScreenMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                  onClick={() => setIsFullScreenMap(false)}
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              </div>
            
            <div className="w-full h-full relative">
              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dO9F0R9-8J0Q8Y'}
              >
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={locationData.coordinates}
                  zoom={16}
                  options={mapOptions}
                >
                  <Marker
                    position={locationData.coordinates}
                    icon={getMarkerIcon()}
                    title={screen.name}
                  />
                </GoogleMap>
              </LoadScript>
              
              <div className="absolute bottom-6 left-6">
                <button
                  onClick={openDirections}
                  className="px-6 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow font-medium text-gray-900"
                >
                  Ver direcciones
                </button>
                  </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScreenLocationMap;