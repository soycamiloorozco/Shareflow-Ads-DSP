/**
 * Google Maps Configuration
 * Configure Google Maps API settings and options
 */

// Google Maps API Configuration
export const GOOGLE_MAPS_CONFIG = {
  // API Key - Should be set in environment variables
  get apiKey() {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  },
  
  // Map libraries to load
  libraries: ['places', 'geometry'] as ('places' | 'geometry')[],
  
  // Default map options
  defaultOptions: {
    zoom: 11,
    center: {
      lat: 4.7110,
      lng: -74.0721 // Bogotá, Colombia
    },
    mapTypeId: 'roadmap',
    gestureHandling: 'cooperative',
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: false,
    fullscreenControl: true,
    disableDefaultUI: false,
    clickableIcons: false,
    styles: [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.medical',
        stylers: [{ visibility: 'off' }]
      }
    ]
  },
  
  // Marker clustering options
  clusterOptions: {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    maxZoom: 15,
    gridSize: 60,
    styles: [
      {
        textColor: 'white',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzM1M0ZFRiIvPjwvc3ZnPg==',
        height: 40,
        width: 40,
        textSize: 12
      },
      {
        textColor: 'white',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyNSIgZmlsbD0iIzM1M0ZFRiIvPjwvc3ZnPg==',
        height: 50,
        width: 50,
        textSize: 14
      },
      {
        textColor: 'white',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iIzM1M0ZFRiIvPjwvc3ZnPg==',
        height: 60,
        width: 60,
        textSize: 16
      }
    ]
  }
};

// Map container style
export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%'
};

// Colombia bounds for restricting map view
export const COLOMBIA_BOUNDS = {
  north: 12.5,
  south: -4.2,
  east: -66.8,
  west: -81.7
};

// Major Colombian cities
export const COLOMBIAN_CITIES = [
  { name: 'Bogotá', lat: 4.7110, lng: -74.0721 },
  { name: 'Medellín', lat: 6.2518, lng: -75.5636 },
  { name: 'Cali', lat: 3.4516, lng: -76.5320 },
  { name: 'Barranquilla', lat: 10.9639, lng: -74.7964 },
  { name: 'Cartagena', lat: 10.3932, lng: -75.4832 },
  { name: 'Bucaramanga', lat: 7.1253, lng: -73.1198 }
];

// Error messages
export const GOOGLE_MAPS_ERRORS = {
  API_KEY_MISSING: 'Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.',
  LOAD_ERROR: 'Failed to load Google Maps. Please check your internet connection and API key.',
  GEOCODING_ERROR: 'Failed to get location coordinates.'
}; 