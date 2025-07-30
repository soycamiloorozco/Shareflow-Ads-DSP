/**
 * Integration tests for SSP inventory in marketplace components
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MarketplaceRefactored } from '../MarketplaceRefactored';
import { InventoryAggregationService } from '../../../services/InventoryAggregationService';
import { DOOHInventoryData } from '../../../types/openrtb-dooh';
import { Screen } from '../types/screen.types';

// Mock services
jest.mock('../../../services/InventoryAggregationService');
jest.mock('../hooks/useMarketplaceData');
jest.mock('../hooks/useDebounce');

const mockInventoryService = InventoryAggregationService as jest.Mocked<typeof InventoryAggregationService>;

// Mock marketplace data hook
const mockUseMarketplaceData = require('../hooks/useMarketplaceData').useMarketplaceData as jest.Mock;
const mockUseDebounce = require('../hooks/useDebounce').useDebounce as jest.Mock;

describe('SSP Marketplace Integration', () => {
  let mockServiceInstance: jest.Mocked<InventoryAggregationService>;
  let mockSSPScreens: Screen[];
  let mockLocalScreens: Screen[];

  beforeEach(() => {
    // Mock SSP screens
    mockSSPScreens = [
      {
        id: 'ssp-test-001',
        name: 'SSP Test Screen 1',
        location: 'Medellín, Colombia',
        price: 150,
        availability: true,
        image: '/screens_photos/ssp-default.jpg',
        category: { id: 'mall', name: 'Centro Comercial' },
        environment: 'indoor',
        specs: {
          width: 1920,
          height: 1080,
          resolution: 'Full HD',
          brightness: '5000 nits',
          aspectRatio: '16:9',
          orientation: 'landscape',
          pixelDensity: 72,
          colorDepth: 24,
          refreshRate: 60,
          technology: 'LED'
        },
        views: { daily: 12000, weekly: 84000, monthly: 360000 },
        rating: 4.3,
        reviews: 18,
        coordinates: { lat: 6.2447, lng: -75.5916 },
        pricing: {
          allowMoments: true,
          deviceId: 'SSP_001',
          bundles: {
            hourly: { enabled: true, price: 120, spots: 4 },
            daily: { enabled: true, price: 1920, spots: 64 },
            weekly: { enabled: true, price: 13440, spots: 448 },
            monthly: { enabled: true, price: 57600, spots: 1920 }
          }
        },
        metrics: {
          dailyTraffic: 12000,
          monthlyTraffic: 360000,
          averageEngagement: 88
        },
        locationDetails: {
          address: 'SSP Location Address',
          city: 'Medellín',
          region: 'Antioquia',
          country: 'Colombia',
          coordinates: { lat: 6.2447, lng: -75.5916 },
          timezone: 'America/Bogota',
          landmarks: ['SSP Test Screen 1']
        },
        operatingHours: {
          start: '06:00',
          end: '23:00',
          daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        },
        sspMetadata: {
          sspId: 'test-ssp-001',
          sspName: 'Test SSP Partner',
          originalInventoryId: 'ssp-inv-001',
          lastUpdated: new Date().toISOString(),
          isSSPInventory: true
        }
      },
      {
        id: 'ssp-test-002',
        name: 'SSP Test Screen 2',
        location: 'Bogotá, Colombia',
        price: 200,
        availability: true,
        image: '/screens_photos/ssp-default.jpg',
        category: { id: 'transport', name: 'Transporte' },
        environment: 'outdoor',
        specs: {
          width: 2560,
          height: 1440,
          resolution: '4K',
          brightness: '7000 nits',
          aspectRatio: '16:9',
          orientation: 'landscape',
          pixelDensity: 96,
          colorDepth: 24,
          refreshRate: 60,
          technology: 'LED'
        },
        views: { daily: 25000, weekly: 175000, monthly: 750000 },
        rating: 4.7,
        reviews: 32,
        coordinates: { lat: 4.7110, lng: -74.0721 },
        pricing: {
          allowMoments: true,
          deviceId: 'SSP_002',
          bundles: {
            hourly: { enabled: true, price: 200, spots: 4 },
            daily: { enabled: true, price: 3200, spots: 64 },
            weekly: { enabled: true, price: 22400, spots: 448 },
            monthly: { enabled: true, price: 96000, spots: 1920 }
          }
        },
        metrics: {
          dailyTraffic: 25000,
          monthlyTraffic: 750000,
          averageEngagement: 92
        },
        locationDetails: {
          address: 'SSP Location 2 Address',
          city: 'Bogotá',
          region: 'Cundinamarca',
          country: 'Colombia',
          coordinates: { lat: 4.7110, lng: -74.0721 },
          timezone: 'America/Bogota',
          landmarks: ['SSP Test Screen 2']
        },
        operatingHours: {
          start: '06:00',
          end: '23:00',
          daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        },
        sspMetadata: {
          sspId: 'test-ssp-002',
          sspName: 'Another SSP Partner',
          originalInventoryId: 'ssp-inv-002',
          lastUpdated: new Date().toISOString(),
          isSSPInventory: true
        }
      }
    ];

    // Mock local screens
    mockLocalScreens = [
      {
        id: 'local-001',
        name: 'Local Test Screen',
        location: 'Cali, Colombia',
        price: 100,
        availability: true,
        image: '/screens_photos/local-screen.jpg',
        category: { id: 'billboard', name: 'Valla Exterior' },
        environment: 'outdoor',
        specs: {
          width: 1920,
          height: 1080,
          resolution: 'Full HD',
          brightness: '6000 nits',
          aspectRatio: '16:9',
          orientation: 'landscape',
          pixelDensity: 72,
          colorDepth: 24,
          refreshRate: 60,
          technology: 'LED'
        },
        views: { daily: 8000, weekly: 56000, monthly: 240000 },
        rating: 4.1,
        reviews: 12,
        coordinates: { lat: 3.4516, lng: -76.5320 },
        pricing: {
          allowMoments: true,
          deviceId: 'LOCAL_001',
          bundles: {
            hourly: { enabled: true, price: 80, spots: 4 },
            daily: { enabled: true, price: 1280, spots: 64 },
            weekly: { enabled: true, price: 8960, spots: 448 },
            monthly: { enabled: true, price: 38400, spots: 1920 }
          }
        },
        metrics: {
          dailyTraffic: 8000,
          monthlyTraffic: 240000,
          averageEngagement: 82
        },
        locationDetails: {
          address: 'Local Screen Address',
          city: 'Cali',
          region: 'Valle del Cauca',
          country: 'Colombia',
          coordinates: { lat: 3.4516, lng: -76.5320 },
          timezone: 'America/Bogota',
          landmarks: ['Local Test Screen']
        },
        operatingHours: {
          start: '06:00',
          end: '23:00',
          daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        }
      }
    ];

    // Setup mock service instance
    mockServiceInstance = {
      getAllInventory: jest.fn().mockReturnValue([...mockLocalScreens, ...mockSSPScreens]),
      getSSPInventory: jest.fn().mockReturnValue(mockSSPScreens),
      getInventoryBySSP: jest.fn().mockReturnValue(mockSSPScreens),
      addSSPInventory: jest.fn().mockResolvedValue(undefined),
      removeSSPInventory: jest.fn(),
      clearSSPInventory: jest.fn(),
      onInventoryUpdate: jest.fn(),
      offInventoryUpdate: jest.fn(),
      removeExpiredSSPInventory: jest.fn(),
      getInventoryStats: jest.fn().mockReturnValue({
        total: 3,
        ssp: 2,
        local: 1,
        bySSP: { 
          'Test SSP Partner': 1,
          'Another SSP Partner': 1
        },
        lastUpdated: new Date().toISOString()
      }),
      validateInventory: jest.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      }),
      clearInventory: jest.fn(),
      destroy: jest.fn()
    } as any;

    mockInventoryService.getInstance.mockReturnValue(mockServiceInstance);

    // Mock marketplace data hook
    mockUseMarketplaceData.mockReturnValue({
      screens: [...mockLocalScreens, ...mockSSPScreens],
      filteredScreens: [...mockLocalScreens, ...mockSSPScreens],
      filters: {
        search: { query: '' },
        location: { cities: [] },
        category: { categories: [] },
        price: { min: 0, max: 1000000 },
        environment: { environments: [] },
        features: { features: [] }
      },
      loading: false,
      error: null,
      updateFilters: jest.fn(),
      updateScreens: jest.fn(),
      setLoading: jest.fn(),
      clearFilters: jest.fn(),
      activeFilterCount: 0,
      sections: [],
      sectionsLoading: false,
      sectionsError: null,
      loadSections: jest.fn(),
      refreshSections: jest.fn(),
      totalScreensInSections: 0
    });

    // Mock debounce hook
    mockUseDebounce.mockImplementation((value) => value);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderMarketplace = () => {
    return render(
      <BrowserRouter>
        <HelmetProvider>
          <MarketplaceRefactored />
        </HelmetProvider>
      </BrowserRouter>
    );
  };

  describe('SSP Inventory Display', () => {
    it('should display SSP inventory alongside local inventory', async () => {
      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 1')).toBeInTheDocument();
        expect(screen.getByText('SSP Test Screen 2')).toBeInTheDocument();
        expect(screen.getByText('Local Test Screen')).toBeInTheDocument();
      });
    });

    it('should show SSP inventory indicator', async () => {
      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText(/pantallas adicionales disponibles via SSPs conectados/)).toBeInTheDocument();
        expect(screen.getByText(/2 partners/)).toBeInTheDocument();
      });
    });

    it('should display SSP inventory count in results', async () => {
      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText(/3 pantallas encontradas/)).toBeInTheDocument();
        expect(screen.getByText(/incluyendo 2 via SSPs/)).toBeInTheDocument();
      });
    });

    it('should render SSP source indicators on screen cards', async () => {
      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('Test SSP Partner')).toBeInTheDocument();
        expect(screen.getByText('Another SSP Partner')).toBeInTheDocument();
      });
    });
  });

  describe('SSP Inventory Filtering', () => {
    it('should filter SSP inventory by location', async () => {
      // Mock filtered results to only show Medellín screens
      const medellinScreens = [...mockLocalScreens, ...mockSSPScreens].filter(
        screen => screen.location.includes('Medellín')
      );

      mockUseMarketplaceData.mockReturnValue({
        screens: [...mockLocalScreens, ...mockSSPScreens],
        filteredScreens: medellinScreens,
        filters: {
          search: { query: '' },
          location: { cities: ['medellin'] },
          category: { categories: [] },
          price: { min: 0, max: 1000000 },
          environment: { environments: [] },
          features: { features: [] }
        },
        loading: false,
        error: null,
        updateFilters: jest.fn(),
        updateScreens: jest.fn(),
        setLoading: jest.fn(),
        clearFilters: jest.fn(),
        activeFilterCount: 1,
        sections: [],
        sectionsLoading: false,
        sectionsError: null,
        loadSections: jest.fn(),
        refreshSections: jest.fn(),
        totalScreensInSections: 0
      });

      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 1')).toBeInTheDocument();
        expect(screen.queryByText('SSP Test Screen 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Local Test Screen')).not.toBeInTheDocument();
      });
    });

    it('should filter SSP inventory by category', async () => {
      // Mock filtered results to only show transport category
      const transportScreens = [...mockLocalScreens, ...mockSSPScreens].filter(
        screen => screen.category.id === 'transport'
      );

      mockUseMarketplaceData.mockReturnValue({
        screens: [...mockLocalScreens, ...mockSSPScreens],
        filteredScreens: transportScreens,
        filters: {
          search: { query: '' },
          location: { cities: [] },
          category: { categories: ['transport'] },
          price: { min: 0, max: 1000000 },
          environment: { environments: [] },
          features: { features: [] }
        },
        loading: false,
        error: null,
        updateFilters: jest.fn(),
        updateScreens: jest.fn(),
        setLoading: jest.fn(),
        clearFilters: jest.fn(),
        activeFilterCount: 1,
        sections: [],
        sectionsLoading: false,
        sectionsError: null,
        loadSections: jest.fn(),
        refreshSections: jest.fn(),
        totalScreensInSections: 0
      });

      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 2')).toBeInTheDocument();
        expect(screen.queryByText('SSP Test Screen 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Local Test Screen')).not.toBeInTheDocument();
      });
    });

    it('should filter SSP inventory by price range', async () => {
      // Mock filtered results for price range 100-180
      const priceFilteredScreens = [...mockLocalScreens, ...mockSSPScreens].filter(
        screen => screen.price >= 100 && screen.price <= 180
      );

      mockUseMarketplaceData.mockReturnValue({
        screens: [...mockLocalScreens, ...mockSSPScreens],
        filteredScreens: priceFilteredScreens,
        filters: {
          search: { query: '' },
          location: { cities: [] },
          category: { categories: [] },
          price: { min: 100, max: 180 },
          environment: { environments: [] },
          features: { features: [] }
        },
        loading: false,
        error: null,
        updateFilters: jest.fn(),
        updateScreens: jest.fn(),
        setLoading: jest.fn(),
        clearFilters: jest.fn(),
        activeFilterCount: 1,
        sections: [],
        sectionsLoading: false,
        sectionsError: null,
        loadSections: jest.fn(),
        refreshSections: jest.fn(),
        totalScreensInSections: 0
      });

      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 1')).toBeInTheDocument();
        expect(screen.getByText('Local Test Screen')).toBeInTheDocument();
        expect(screen.queryByText('SSP Test Screen 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('SSP Inventory Search', () => {
    it('should search SSP inventory by name', async () => {
      // Mock search results
      const searchResults = [...mockLocalScreens, ...mockSSPScreens].filter(
        screen => screen.name.toLowerCase().includes('ssp test screen 1')
      );

      mockUseMarketplaceData.mockReturnValue({
        screens: [...mockLocalScreens, ...mockSSPScreens],
        filteredScreens: searchResults,
        filters: {
          search: { query: 'SSP Test Screen 1' },
          location: { cities: [] },
          category: { categories: [] },
          price: { min: 0, max: 1000000 },
          environment: { environments: [] },
          features: { features: [] }
        },
        loading: false,
        error: null,
        updateFilters: jest.fn(),
        updateScreens: jest.fn(),
        setLoading: jest.fn(),
        clearFilters: jest.fn(),
        activeFilterCount: 1,
        sections: [],
        sectionsLoading: false,
        sectionsError: null,
        loadSections: jest.fn(),
        refreshSections: jest.fn(),
        totalScreensInSections: 0
      });

      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 1')).toBeInTheDocument();
        expect(screen.queryByText('SSP Test Screen 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Local Test Screen')).not.toBeInTheDocument();
      });
    });

    it('should search SSP inventory by location', async () => {
      // Mock search results for Bogotá
      const searchResults = [...mockLocalScreens, ...mockSSPScreens].filter(
        screen => screen.location.toLowerCase().includes('bogotá')
      );

      mockUseMarketplaceData.mockReturnValue({
        screens: [...mockLocalScreens, ...mockSSPScreens],
        filteredScreens: searchResults,
        filters: {
          search: { query: 'Bogotá' },
          location: { cities: [] },
          category: { categories: [] },
          price: { min: 0, max: 1000000 },
          environment: { environments: [] },
          features: { features: [] }
        },
        loading: false,
        error: null,
        updateFilters: jest.fn(),
        updateScreens: jest.fn(),
        setLoading: jest.fn(),
        clearFilters: jest.fn(),
        activeFilterCount: 1,
        sections: [],
        sectionsLoading: false,
        sectionsError: null,
        loadSections: jest.fn(),
        refreshSections: jest.fn(),
        totalScreensInSections: 0
      });

      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 2')).toBeInTheDocument();
        expect(screen.queryByText('SSP Test Screen 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Local Test Screen')).not.toBeInTheDocument();
      });
    });
  });

  describe('SSP Inventory Navigation', () => {
    it('should navigate to SSP screen detail page', async () => {
      const mockNavigate = jest.fn();
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));

      renderMarketplace();

      await waitFor(() => {
        const sspScreen = screen.getByText('SSP Test Screen 1');
        expect(sspScreen).toBeInTheDocument();
      });

      // Click on SSP screen should navigate to detail page
      const sspScreenCard = screen.getByText('SSP Test Screen 1').closest('[data-testid="screen-card"]');
      if (sspScreenCard) {
        fireEvent.click(sspScreenCard);
        expect(mockNavigate).toHaveBeenCalledWith('/screens/ssp-test-001');
      }
    });
  });

  describe('SSP Inventory Error Handling', () => {
    it('should handle SSP inventory loading errors gracefully', async () => {
      mockUseMarketplaceData.mockReturnValue({
        screens: mockLocalScreens,
        filteredScreens: mockLocalScreens,
        filters: {
          search: { query: '' },
          location: { cities: [] },
          category: { categories: [] },
          price: { min: 0, max: 1000000 },
          environment: { environments: [] },
          features: { features: [] }
        },
        loading: false,
        error: new Error('SSP inventory failed to load'),
        updateFilters: jest.fn(),
        updateScreens: jest.fn(),
        setLoading: jest.fn(),
        clearFilters: jest.fn(),
        activeFilterCount: 0,
        sections: [],
        sectionsLoading: false,
        sectionsError: null,
        loadSections: jest.fn(),
        refreshSections: jest.fn(),
        totalScreensInSections: 0
      });

      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('Local Test Screen')).toBeInTheDocument();
        expect(screen.queryByText('SSP Test Screen 1')).not.toBeInTheDocument();
        expect(screen.queryByText('SSP Test Screen 2')).not.toBeInTheDocument();
      });
    });

    it('should continue functioning when SSP inventory is unavailable', async () => {
      // Mock empty SSP inventory
      mockServiceInstance.getSSPInventory.mockReturnValue([]);
      mockServiceInstance.getInventoryStats.mockReturnValue({
        total: 1,
        ssp: 0,
        local: 1,
        bySSP: {},
        lastUpdated: new Date().toISOString()
      });

      mockUseMarketplaceData.mockReturnValue({
        screens: mockLocalScreens,
        filteredScreens: mockLocalScreens,
        filters: {
          search: { query: '' },
          location: { cities: [] },
          category: { categories: [] },
          price: { min: 0, max: 1000000 },
          environment: { environments: [] },
          features: { features: [] }
        },
        loading: false,
        error: null,
        updateFilters: jest.fn(),
        updateScreens: jest.fn(),
        setLoading: jest.fn(),
        clearFilters: jest.fn(),
        activeFilterCount: 0,
        sections: [],
        sectionsLoading: false,
        sectionsError: null,
        loadSections: jest.fn(),
        refreshSections: jest.fn(),
        totalScreensInSections: 0
      });

      renderMarketplace();

      await waitFor(() => {
        expect(screen.getByText('Local Test Screen')).toBeInTheDocument();
        expect(screen.getByText(/1 pantalla encontrada/)).toBeInTheDocument();
        expect(screen.queryByText(/pantallas adicionales disponibles via SSPs/)).not.toBeInTheDocument();
      });
    });
  });

  describe('View Mode Compatibility', () => {
    it('should display SSP inventory in card view mode', async () => {
      renderMarketplace();

      await waitFor(() => {
        const cardViewButton = screen.getByLabelText('Vista en tarjetas');
        fireEvent.click(cardViewButton);
      });

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 1')).toBeInTheDocument();
        expect(screen.getByText('SSP Test Screen 2')).toBeInTheDocument();
        expect(screen.getByText('Test SSP Partner')).toBeInTheDocument();
        expect(screen.getByText('Another SSP Partner')).toBeInTheDocument();
      });
    });

    it('should display SSP inventory in list view mode', async () => {
      renderMarketplace();

      await waitFor(() => {
        const listViewButton = screen.getByLabelText('Vista en lista compacta');
        fireEvent.click(listViewButton);
      });

      await waitFor(() => {
        expect(screen.getByText('SSP Test Screen 1')).toBeInTheDocument();
        expect(screen.getByText('SSP Test Screen 2')).toBeInTheDocument();
        expect(screen.getByText('Test SSP Partner')).toBeInTheDocument();
        expect(screen.getByText('Another SSP Partner')).toBeInTheDocument();
      });
    });
  });
});