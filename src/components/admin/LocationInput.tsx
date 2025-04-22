import React, { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    googleMapsLoaded: boolean;
  }
}

export const LocationInput: React.FC = () => {
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.googleMapsLoaded) {
      window.initMap();
      return;
    }

    // Load Google Maps script dynamically
    const loadGoogleMapsScript = () => {
      // Check if script is already in the document
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    // Initialize map callback only if not already defined
    if (!window.initMap) {
      window.initMap = () => {
        // Your map initialization code here
        console.log('Google Maps loaded successfully');
        window.googleMapsLoaded = true;
      };
    }

    loadGoogleMapsScript();

    return () => {
      // Don't remove the script on component unmount
      // as other instances might need it
    };
  }, []);

  return (
    <div>
      {/* Your location input component content */}
      <div id="map" style={{ height: '400px', width: '100%' }}></div>
    </div>
  );
};

export default LocationInput;