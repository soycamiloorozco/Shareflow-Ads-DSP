/**
 * Tests for DynamicFilterOptionsService
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DynamicFilterOptionsService } from '../DynamicFilterOptionsService';
import { Screen, FilterState } from '../../types/marketplace.types';
import { CacheService } from '../CacheService';

// Mock CacheService
vi.mock('../CacheService', () => ({
  CacheService: {
    getInstance: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn()
    }))
  }
}));

describe('DynamicFilterOptionsService', () => {
  let service: DynamicFilterOptionsService;
  let mockCacheService: any;
  let mockScreens: Screen[];
  let emptyFilters: FilterState;

  beforeEach(() => {
    // Reset singleton
    (DynamicFilterOptionsService as any).instance = undefined;
    service = DynamicFilterOptionsService.getInstance();
    
    mockCacheService = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined)
    };
    
    (CacheService.getInstance as any).mockReturnValue(mockCacheService);

    // Create mock screens
    mockScreens = [
      {
        id: 'screen-1',
        name: 'Test Screen 1',
        location: 'Mall, Bogotá',
        price: 750000,
        availability: true,
        image: '/test.jpg',
        category: { id: 'mall', name: 'Centro Comercial', icon: '🛍️' },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '5000 nits' },
        views: { daily: 25000, monthly: 750000 },
        rating: 4.5,
        reviews: 50,
        coordinates: { lat: 4.6, lng: -74.1 },
        pricing: { allowMoments: true, deviceId: 'DEV001', bundles: {} },
        metrics: { dailyTraffic: 25000, monthlyTraffic: 750000, averageEngagement: 85 },
        locationDetails: {
          address: 'Test Address',
          city: 'Bogotá',
          region: 'Cundinamarca',
          country: 'Colombia',
          coordinates: { lat: 4.6, lng: -74.1 },
          timezone: 'America/Bogota',
          landmarks: []
        },
        venue: { type: 'mall', footTraffic: 'high', audienceType: ['shoppers'], peakHours: ['18:00'] }
      } as Screen,
      {
        id: 'screen-2',
        name: 'Test Screen 2',
        location: 'Stadium, Medellín',
        price: 1200000,
        availability: true,
        image: '/test2.jpg',
        category: { id: 'stadium', name: 'Estadio', icon: '🏟️' },
        environment: 'outdoor',
        specs: { width: 2560, height: 1440, resolution: '2K', brightness: '7000 nits' },
        views: { daily: 45000, monthly: 1350000 },
        rating: 4.8,
        reviews: 75,
        coordinates: { lat: 6.2, lng: -75.6 },
        pricing: { allowMoments: false, deviceId: 'DEV002', bundles: {} },
        metrics: { dailyTraffic: 45000, monthlyTraffic: 1350000, averageEngagement: 92 },
        locationDetails: {
          address: 'Test Stadium Address',
          city: 'Medellín',
          region: 'Antioquia',
          country: 'Colombia',
          coordinates: { lat: 6.2, lng: -75.6 },
          timezone: 'America/Bogota',
          landmarks: []
        },
        venue: { type: 'stadium', footTraffic: 'very_high', audienceType: ['sports_fans'], peakHours: ['20:00'] }
      } as Screen,
      {
        id: 'screen-3',
        name: 'Test Screen 3',
        location: 'Airport, Bogotá',
        price: 2000000,
        availability: true,
        image: '/test3.jpg',
        category: { id: 'airport', name: 'Aeropuerto', icon: '✈️' },
        environment: 'indoor',
        specs: { width: 3840, height: 2160, resolution: '4K', brightness: '6000 nits' },
        views: { daily: 80000, monthly: 2400000 },
        rating: 4.9,
        reviews: 120,
        coordinates: { lat: 4.7, lng: -74.1 },
        pricing: { allowMoments: true, deviceId: 'DEV003', bundles: {} },
        metrics: { dailyTraffic: 80000, monthlyTraffic: 2400000, averageEngagement: 95 },
        locationDetails: {
          address: 'Airport Address',
          city: 'Bogotá',
          region: 'Cundinamarca',
          country: 'Colombia',
          coordinates: { lat: 4.7, lng: -74.1 },
          timezone: 'America/Bogota',
          landmarks: []
        },
        venue: { type: 'airport', footTraffic: 'very_high', audienceType: ['travelers'], peakHours: ['08:00', '18:00'] }
      } as Screen
    ];

    emptyFilters = {
      search: { query: '' },
      location: { cities: [], regions: [], neighborhoods: [] },
      category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
      price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
      features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
      availability: { timeSlots: [], daysOfWeek: [] },
      sort: { field: 'relevance', direction: 'desc' },
      showFavoritesOnly: false,
      showCircuits: true
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    service.clearTrendHistory();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DynamicFilterOptionsService.getInstance();
      const instance2 = DynamicFilterOptionsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('calculateDynamicOptions', () => {
    it('should calculate dynamic options for all filter types', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);

      expect(result).toHaveProperty('cities');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('priceRanges');
      expect(result).toHaveProperty('venueTypes');
      expect(result).toHaveProperty('environments');
      expect(result).toHaveProperty('dwellTimes');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('totalResults');
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('computationTime');

      expect(result.totalResults).toBe(mockScreens.length);
      expect(result.computationTime).toBeGreaterThan(0);
    });

    it('should return cached results when available', async () => {
      const cachedResult = {
        cities: [],
        categories: [],
        priceRanges: [],
        venueTypes: [],
        environments: [],
        dwellTimes: [],
        features: [],
        totalResults: 5,
        lastUpdated: new Date(),
        computationTime: 10
      };

      mockCacheService.get.mockResolvedValueOnce({
        options: cachedResult,
        timestamp: Date.now(),
        ttl: 300000
      });

      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      expect(result).toEqual(cachedResult);
      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
    });

    it('should cache results after calculation', async () => {
      await service.calculateDynamicOptions(mockScreens, emptyFilters);
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('City Options', () => {
    it('should calculate city options correctly', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      expect(result.cities).toHaveLength(2); // Bogotá and Medellín
      
      const bogotaOption = result.cities.find(c => c.id === 'Bogotá');
      const medellinOption = result.cities.find(c => c.id === 'Medellín');
      
      expect(bogotaOption).toBeDefined();
      expect(bogotaOption?.count).toBe(2); // 2 screens in Bogotá
      expect(bogotaOption?.percentage).toBeCloseTo(66.67, 1);
      expect(bogotaOption?.isActive).toBe(false);
      
      expect(medellinOption).toBeDefined();
      expect(medellinOption?.count).toBe(1); // 1 screen in Medellín
      expect(medellinOption?.percentage).toBeCloseTo(33.33, 1);
    });

    it('should exclude active city filters when requested', async () => {
      const filtersWithCity = {
        ...emptyFilters,
        location: { ...emptyFilters.location, cities: ['Bogotá'] }
      };

      const result = await service.calculateDynamicOptions(mockScreens, filtersWithCity, true);
      
      const bogotaOption = result.cities.find(c => c.id === 'Bogotá');
      expect(bogotaOption).toBeUndefined();
    });
  });

  describe('Category Options', () => {
    it('should calculate category options correctly', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      expect(result.categories.length).toBeGreaterThan(0);
      
      const mallOption = result.categories.find(c => c.id === 'mall');
      const stadiumOption = result.categories.find(c => c.id === 'stadium');
      const airportOption = result.categories.find(c => c.id === 'airport');
      
      expect(mallOption).toBeDefined();
      expect(mallOption?.count).toBe(1);
      expect(mallOption?.label).toBe('Centro Comercial');
      
      expect(stadiumOption).toBeDefined();
      expect(stadiumOption?.count).toBe(1);
      
      expect(airportOption).toBeDefined();
      expect(airportOption?.count).toBe(1);
    });
  });

  describe('Price Range Options', () => {
    it('should calculate price range options correctly', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      expect(result.priceRanges.length).toBeGreaterThan(0);
      
      // Check that screens are distributed across price ranges
      const midRangeOption = result.priceRanges.find(p => p.id === 'mid-range');
      const premiumOption = result.priceRanges.find(p => p.id === 'premium');
      
      expect(midRangeOption).toBeDefined();
      expect(midRangeOption?.count).toBe(1); // Screen 1 (750K)
      
      expect(premiumOption).toBeDefined();
      expect(premiumOption?.count).toBe(1); // Screen 2 (1.2M)
    });
  });

  describe('Environment Options', () => {
    it('should calculate environment options correctly', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      const indoorOption = result.environments.find(e => e.id === 'indoor');
      const outdoorOption = result.environments.find(e => e.id === 'outdoor');
      
      expect(indoorOption).toBeDefined();
      expect(indoorOption?.count).toBe(2); // Screens 1 and 3
      expect(indoorOption?.label).toBe('Interior');
      
      expect(outdoorOption).toBeDefined();
      expect(outdoorOption?.count).toBe(1); // Screen 2
      expect(outdoorOption?.label).toBe('Exterior');
    });
  });

  describe('Feature Options', () => {
    it('should calculate feature options correctly', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      const momentsOption = result.features.find(f => f.id === 'moments');
      const highRatingOption = result.features.find(f => f.id === 'high_rating');
      const highTrafficOption = result.features.find(f => f.id === 'high_traffic');
      
      expect(momentsOption).toBeDefined();
      expect(momentsOption?.count).toBe(2); // Screens 1 and 3 allow moments
      
      expect(highRatingOption).toBeDefined();
      expect(highRatingOption?.count).toBe(3); // All screens have rating >= 4.5
      
      expect(highTrafficOption).toBeDefined();
      expect(highTrafficOption?.count).toBe(1); // Only screen 3 has > 50K daily views (80K)
    });
  });

  describe('Filtering Logic', () => {
    it('should apply search filter correctly', async () => {
      const filtersWithSearch = {
        ...emptyFilters,
        search: { query: 'Stadium' }
      };

      const result = await service.calculateDynamicOptions(mockScreens, filtersWithSearch);
      
      // Only stadium screen should be included in base filtered screens
      expect(result.totalResults).toBe(1);
    });

    it('should apply price filter correctly', async () => {
      const filtersWithPrice = {
        ...emptyFilters,
        price: { ...emptyFilters.price, min: 1000000, max: 1500000 }
      };

      const result = await service.calculateDynamicOptions(mockScreens, filtersWithPrice);
      
      // Only screen 2 (1.2M) should be included
      expect(result.totalResults).toBe(1);
    });

    it('should apply features filter correctly', async () => {
      const filtersWithFeatures = {
        ...emptyFilters,
        features: { ...emptyFilters.features, allowsMoments: true }
      };

      const result = await service.calculateDynamicOptions(mockScreens, filtersWithFeatures);
      
      // Only screens 1 and 3 allow moments
      expect(result.totalResults).toBe(2);
    });
  });

  describe('Trend Calculation', () => {
    it('should initialize trend as stable for new options', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      const cityOption = result.cities[0];
      expect(cityOption.trend).toBe('stable');
    });

    it('should calculate trend correctly over multiple calls', async () => {
      // First call
      await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      // Second call with more screens (simulating growth)
      const moreScreens = [...mockScreens, {
        ...mockScreens[0],
        id: 'screen-4',
        name: 'Test Screen 4'
      }];
      
      const result = await service.calculateDynamicOptions(moreScreens, emptyFilters);
      
      // Trend should be calculated based on count changes
      const trendHistory = service.getTrendHistory();
      expect(trendHistory.size).toBeGreaterThan(0);
    });
  });

  describe('Recommendation Logic', () => {
    it('should mark high-performing options as recommended', async () => {
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      
      // Check if any options are marked as recommended
      const hasRecommendedCities = result.cities.some(c => c.isRecommended);
      const hasRecommendedCategories = result.categories.some(c => c.isRecommended);
      
      // At least some options should be recommended based on our mock data
      expect(hasRecommendedCities || hasRecommendedCategories).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete calculation within reasonable time', async () => {
      const startTime = performance.now();
      await service.calculateDynamicOptions(mockScreens, emptyFilters);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large datasets efficiently', async () => {
      // Create a larger dataset
      const largeScreenSet: Screen[] = [];
      for (let i = 0; i < 100; i++) {
        largeScreenSet.push({
          ...mockScreens[i % mockScreens.length],
          id: `screen-${i}`,
          name: `Test Screen ${i}`
        });
      }

      const startTime = performance.now();
      const result = await service.calculateDynamicOptions(largeScreenSet, emptyFilters);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.totalResults).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', async () => {
      mockCacheService.get.mockRejectedValueOnce(new Error('Cache error'));
      mockCacheService.set.mockRejectedValueOnce(new Error('Cache error'));

      // Should not throw and should still return results
      const result = await service.calculateDynamicOptions(mockScreens, emptyFilters);
      expect(result).toBeDefined();
      expect(result.totalResults).toBe(mockScreens.length);
    });

    it('should handle empty screen array', async () => {
      const result = await service.calculateDynamicOptions([], emptyFilters);
      
      expect(result.totalResults).toBe(0);
      expect(result.cities).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });

    it('should handle malformed screen data', async () => {
      const malformedScreens = [
        {
          id: 'malformed',
          name: 'Malformed Screen',
          location: '', // Empty location
          price: null, // Null price
          category: { id: '', name: '' }, // Empty category
          // Missing other required fields
        } as any
      ];

      // Should not throw
      const result = await service.calculateDynamicOptions(malformedScreens, emptyFilters);
      expect(result).toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    it('should clear trend history', () => {
      service.clearTrendHistory();
      const history = service.getTrendHistory();
      expect(history.size).toBe(0);
    });

    it('should return trend history', async () => {
      await service.calculateDynamicOptions(mockScreens, emptyFilters);
      const history = service.getTrendHistory();
      expect(history.size).toBeGreaterThan(0);
    });
  });

  describe('Integration with Filters', () => {
    it('should work with complex filter combinations', async () => {
      const complexFilters = {
        ...emptyFilters,
        search: { query: 'Test' },
        location: { ...emptyFilters.location, cities: ['Bogotá'] },
        price: { ...emptyFilters.price, min: 500000, max: 1500000 },
        features: { ...emptyFilters.features, rating: 4.0 }
      };

      const result = await service.calculateDynamicOptions(mockScreens, complexFilters);
      expect(result).toBeDefined();
      expect(result.totalResults).toBeGreaterThanOrEqual(0);
    });

    it('should handle filters that result in no matches', async () => {
      const restrictiveFilters = {
        ...emptyFilters,
        price: { ...emptyFilters.price, min: 10000000, max: 20000000 } // Very high price range
      };

      const result = await service.calculateDynamicOptions(mockScreens, restrictiveFilters);
      expect(result.totalResults).toBe(0);
      
      // All option counts should be 0
      result.cities.forEach(city => expect(city.count).toBe(0));
      result.categories.forEach(category => expect(category.count).toBe(0));
    });
  });
});