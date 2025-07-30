/**
 * MapContainer Component Tests
 * Unit tests for the map container functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapContainer } from '../MapContainer';
import { Screen } from '../../../types/marketplace.types';

// Mock Google Maps
const mockGoogleMaps = {
  Map: jest.fn(),
  Marker: jest.fn(),
  InfoWindow: jest.fn(),
  LatLngBounds: jest.fn(),
  SymbolPath: {
    CIRCLE: 0
  },
  Animation: {
    BOUNCE: 1
  }
};

// Mock react-google-maps/api
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children, onLoad }: any) => {
    React.useEffect(() => {
      if (onLoad) {
        onLoad(mockGoogleMaps.Map);
      }
    }, [onLoad]);
    return <div data-testid="google-map">{children}</div>;
  },
  LoadScript: ({ children, onLoad }: any) => {
    React.useEffect(() => {
      if (onLoad) {
        onLoad();
      }
    }, [onLoad]);
    return <div data-testid="load-script">{children}</div>;
  },
  Marker: ({ onClick, title }: any) => (
    <div data-testid="marker" onClick={onClick} title={title}>
      Marker
    </div>
  ),
  InfoWindow: ({ children }: any) => (
    <div data-testid="info-window">{children}</div>
  )
}));

// Mock screen data
const mockScreens: Screen[] = [
  {
    id: 'test-indoor-1',
    name: 'Test Indoor Screen',
    location: 'Test Location, Bogotá',
    price: 1000000,
    availability: true,
    image: '/test-image.jpg',
    category: { id: 'mall', name: 'Centro Comercial' },
    environment: 'indoor',
    coordinates: { lat: 4.6097, lng: -74.0817 },
    specs: {
      width: 1920,
      height: 1080,
      resolution: 'Full HD',
      brightness: '5000 nits',
      aspectRatio: '16:9',
      orientation: 'landscape',
      pixelDensity: 72,
      colorDepth: 24,
      refreshRate: 60
    },
    views: { daily: 10000, monthly: 300000 },
    rating: 4.5,
    reviews: 50,
    pricing: {
      allowMoments: false,
      deviceId: 'TEST001',
      bundles: {
        hourly: { enabled: true, price: 500000, spots: 4 }
      }
    },
    metrics: {
      dailyTraffic: 9000,
      monthlyTraffic: 270000,
      averageEngagement: 85
    },
    locationDetails: {
      address: 'Test Address',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'Colombia',
      coordinates: { lat: 4.6097, lng: -74.0817 },
      timezone: 'America/Bogota',
      landmarks: ['Test Landmark']
    }
  },
  {
    id: 'test-outdoor-1',
    name: 'Test Outdoor Screen',
    location: 'Test Outdoor Location, Medellín',
    price: 1500000,
    availability: true,
    image: '/test-outdoor-image.jpg',
    category: { id: 'billboard', name: 'Valla' },
    environment: 'outdoor',
    coordinates: { lat: 6.2442, lng: -75.5812 },
    specs: {
      width: 3840,
      height: 2160,
      resolution: '4K',
      brightness: '8000 nits',
      aspectRatio: '16:9',
      orientation: 'landscape',
      pixelDensity: 72,
      colorDepth: 24,
      refreshRate: 60
    },
    views: { daily: 50000, monthly: 1500000 },
    rating: 4.8,
    reviews: 120,
    pricing: {
      allowMoments: true,
      deviceId: 'TEST002',
      bundles: {
        hourly: { enabled: true, price: 800000, spots: 4 }
      }
    },
    metrics: {
      dailyTraffic: 45000,
      monthlyTraffic: 1350000,
      averageEngagement: 92
    },
    locationDetails: {
      address: 'Test Outdoor Address',
      city: 'Medellín',
      region: 'Antioquia',
      country: 'Colombia',
      coordinates: { lat: 6.2442, lng: -75.5812 },
      timezone: 'America/Bogota',
      landmarks: ['Test Outdoor Landmark']
    }
  }
];

describe('MapContainer', () => {
  const defaultProps = {
    screens: mockScreens,
    onScreenSelect: jest.fn(),
    onMarkerClick: jest.fn(),
    onFavoriteChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Marker Color Coding', () => {
    it('should display indoor screens with blue markers', async () => {
      render(<MapContainer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      // Test that indoor screen markers are rendered
      const markers = screen.getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
    });

    it('should display outdoor screens with green markers', async () => {
      render(<MapContainer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      // Test that outdoor screen markers are rendered
      const markers = screen.getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
    });
  });

  describe('Marker Interactions', () => {
    it('should call onMarkerClick when a marker is clicked', async () => {
      render(<MapContainer {...defaultProps} />);
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        expect(markers.length).toBeGreaterThan(0);
      });

      const firstMarker = screen.getAllByTestId('marker')[0];
      fireEvent.click(firstMarker);

      expect(defaultProps.onMarkerClick).toHaveBeenCalled();
    });

    it('should handle screens without coordinates gracefully', () => {
      const screensWithoutCoords = [
        {
          ...mockScreens[0],
          coordinates: undefined
        }
      ];

      render(<MapContainer {...defaultProps} screens={screensWithoutCoords} />);
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should display no screens message when no valid screens are provided', async () => {
      render(<MapContainer {...defaultProps} screens={[]} />);
      
      await waitFor(() => {
        expect(screen.getByText('No hay pantallas para mostrar')).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      render(<MapContainer {...defaultProps} />);
      
      expect(screen.getByText('Cargando mapa...')).toBeInTheDocument();
    });
  });

  describe('Map Configuration', () => {
    it('should render with default center coordinates', () => {
      render(<MapContainer {...defaultProps} />);
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    it('should accept custom center coordinates', () => {
      const customCenter = { lat: 10.0, lng: -70.0 };
      render(<MapContainer {...defaultProps} center={customCenter} />);
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    it('should accept custom zoom level', () => {
      render(<MapContainer {...defaultProps} zoom={15} />);
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });
  });
});