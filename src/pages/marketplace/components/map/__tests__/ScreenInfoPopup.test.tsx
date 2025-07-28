/**
 * ScreenInfoPopup Component Tests
 * Unit tests for the screen info popup functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScreenInfoPopup } from '../ScreenInfoPopup';
import { Screen } from '../../../types/marketplace.types';

// Mock favorites service
jest.mock('../../../../../services/favoritesService', () => ({
  isFavorite: jest.fn(() => false),
  toggleFavorite: jest.fn(() => Promise.resolve(true))
}));

// Mock screen data
const mockScreen: Screen = {
  id: 'test-screen-1',
  name: 'Test Screen for Popup',
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
  },
  operatingHours: {
    start: '08:00',
    end: '22:00',
    daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  }
};

describe('ScreenInfoPopup', () => {
  const defaultProps = {
    screen: mockScreen,
    onClose: jest.fn(),
    onViewDetails: jest.fn(),
    onFavoriteChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Popup Content', () => {
    it('should display screen name and basic information', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      expect(screen.getByText('Test Screen for Popup')).toBeInTheDocument();
      expect(screen.getByText('Test Location, Bogotá')).toBeInTheDocument();
    });

    it('should display environment badge for indoor screens', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      expect(screen.getByText('Interior')).toBeInTheDocument();
    });

    it('should display environment badge for outdoor screens', () => {
      const outdoorScreen = { ...mockScreen, environment: 'outdoor' as const };
      render(<ScreenInfoPopup {...defaultProps} screen={outdoorScreen} />);
      
      expect(screen.getByText('Exterior')).toBeInTheDocument();
    });

    it('should display formatted price', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      // Should display the minimum price formatted as currency
      expect(screen.getByText(/\$500\.000/)).toBeInTheDocument();
    });

    it('should display screen stats', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      expect(screen.getByText('10K/día')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('(50)')).toBeInTheDocument();
    });

    it('should display operating hours when available', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      expect(screen.getByText('08:00-22:00')).toBeInTheDocument();
    });
  });

  describe('Popup Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Cerrar');
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onViewDetails when view details button is clicked', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      const viewDetailsButton = screen.getByText('Ver detalles');
      fireEvent.click(viewDetailsButton);
      
      expect(defaultProps.onViewDetails).toHaveBeenCalledWith(mockScreen);
    });

    it('should handle favorite toggle', async () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      const favoriteButton = screen.getByLabelText('Agregar a favoritos');
      fireEvent.click(favoriteButton);
      
      await waitFor(() => {
        expect(defaultProps.onFavoriteChange).toHaveBeenCalled();
      });
    });
  });

  describe('Image Handling', () => {
    it('should display screen image', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      const image = screen.getByAltText('Test Screen for Popup');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });

    it('should handle image loading states', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      // Initially should show loading state (opacity-0)
      const image = screen.getByAltText('Test Screen for Popup');
      expect(image).toHaveClass('opacity-0');
    });
  });

  describe('Responsive Design', () => {
    it('should have proper responsive classes', () => {
      render(<ScreenInfoPopup {...defaultProps} />);
      
      const popup = screen.getByText('Test Screen for Popup').closest('div');
      expect(popup?.parentElement).toHaveClass('w-80', 'max-w-sm');
    });
  });
});