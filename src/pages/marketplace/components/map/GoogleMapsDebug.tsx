/**
 * GoogleMapsDebug Component
 * Debug component to verify Google Maps configuration
 * Only shows in development mode
 */

import React from 'react';

interface GoogleMapsDebugProps {
  screens?: any[];
  validScreens?: any[];
}

export function GoogleMapsDebug({ screens = [], validScreens = [] }: GoogleMapsDebugProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasGoogleMaps = !!window.google?.maps;

  // Sample first few screens for debugging
  const sampleScreens = screens.slice(0, 3).map(screen => ({
    id: screen?.id,
    name: screen?.name?.slice(0, 20) + '...',
    hasCoordinates: !!(screen?.coordinates?.lat && screen?.coordinates?.lng),
    coordinates: screen?.coordinates
  }));

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border-yellow-400 border rounded-lg p-3 text-xs max-w-xs max-h-96 overflow-y-auto">
      <h4 className="font-medium text-yellow-800 mb-2">
        Google Maps Debug
      </h4>
      <div className="space-y-1 text-yellow-700">
        <div>
          <strong>API Key:</strong> {apiKey ? '✅ Set' : '❌ Missing'}
        </div>
        {apiKey && (
          <div>
            <strong>Key:</strong> {apiKey.slice(0, 10)}...{apiKey.slice(-4)}
          </div>
        )}
        <div>
          <strong>Google Object:</strong> {hasGoogleMaps ? '✅ Loaded' : '❌ Not loaded'}
        </div>
        <div>
          <strong>Environment:</strong> {import.meta.env.MODE}
        </div>
        <hr className="border-yellow-300 my-2" />
        <div>
          <strong>Total Screens:</strong> {screens.length}
        </div>
        <div>
          <strong>Valid Screens:</strong> {validScreens.length}
        </div>
        {sampleScreens.length > 0 && (
          <div>
            <strong>Sample Screens:</strong>
            {sampleScreens.map((screen, i) => (
              <div key={i} className="ml-2 text-xs">
                • {screen.name} - {screen.hasCoordinates ? '✅' : '❌'} coords
                {screen.coordinates && (
                  <div className="ml-4 text-xs text-gray-600">
                    ({screen.coordinates.lat?.toFixed(4)}, {screen.coordinates.lng?.toFixed(4)})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleMapsDebug; 