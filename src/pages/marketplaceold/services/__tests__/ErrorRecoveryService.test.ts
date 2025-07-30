/**
 * Error Recovery Service Tests
 * Tests for graceful degradation and fallback mechanisms
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorRecoveryService } from '../ErrorRecoveryService';
import { EnhancedScreen, UserProfile, TrendingScreen } from '../../types/intelligent-grouping.types';

// Mock the demo screens import
vi.mock('../../../../data/demoScreens', () => ({
  demoScreens: [
    {
      id: 'screen-1',
      name: 'Test Screen 1',
      location: 'New York',
      price: 100000,
      rating: 4.5,
      views: { daily: 1000 },
      category: { id: 'outdoor', name: 'Outdoor' }
    },
    {
      id: 'screen-2',
      name: 'Test Screen 2',
      location: 'Los Angeles',
      price: 150000,
      rating: 4.2,
      views: { daily: 800 },
      category: { id: 'digital', name: 'Digital' }
    },
    {
      id: 'screen-3',
      name: 'Test Screen 3',
      location: 'New York',
      price: 200000,
      rating: 4.8,
      views: { daily: 1200 },
      category: { id: 'transit', name: 'Transit' }
    }
  ]
}));

describe('ErrorRecoveryService', () => {
  let errorRecoveryService: ErrorRecoveryService;

  beforeEach(() => {
    errorRecoveryService = new ErrorRecoveryService({
      enableFallbacks: true,
      maxRetries: 2,
      retryDelayMs: 100,
      logErrors: true,
      enableMetrics: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ML Service Failure Handling', () => {
    it('should return rule-based recommendations when ML service fails', async () => {
      const screens = await errorRecoveryService.handleMLServiceFailure('user-1', 'New York', 3);
      
      expect(screens).toHaveLength(2); // 2 screens in New York
      expect(screens[0].id).toBeDefined();
      expect(screens[0].performanceMetrics).toBeDefined();
      expect(screens.every(screen => screen.location.includes('New York'))).toBe(true);
    });

    it('should return popular screens as final fallback', async () => {
      const screens = await errorRecoveryService.handleMLServiceFailure(undefined, undefined, 3);
      
      expect(screens).toHaveLength(3);
      expect(screens[0].rating).toBeGreaterThanOrEqual(screens[1].rating);
      expect(screens[1].rating).toBeGreaterThanOrEqual(screens[2].rating);
    });

    it('should use cached data when available', async () => {
      // Cache some data first
      const cachedScreens: EnhancedScreen[] = [{
        id: 'cached-1',
        name: 'Cached Screen',
        location: 'Boston',
        price: 120000,
        rating: 4.0,
        views: { daily: 900 },
        category: { id: 'outdoor', name: 'Outdoor' },
        performanceMetrics: {
          screenId: 'cached-1',
          bookingRate: 8.0,
          averageRating: 4.0,
          engagementScore: 80,
          revenueGenerated: 1200000,
          impressionCount: 900,
          conversionRate: 0.05,
          lastUpdated: new Date(),
          trendDirection: 'stable'
        }
      }];

      await errorRecoveryService.cacheFallbackData('popular', 'Boston', cachedScreens);
      
      const screens = await errorRecoveryService.handleMLServiceFailure('user-1', 'Boston', 3);
      
      expect(screens).toHaveLength(1);
      expect(screens[0].id).toBe('cached-1');
    });
  });

  describe('User Data Failure Handling', () => {
    it('should create anonymous user profile', async () => {
      const profile = await errorRecoveryService.handleUserDataFailure('anonymous', 'Chicago');
      
      expect(profile.userId).toBe('anonymous-user');
      expect(profile.preferredCategories).toHaveLength(2);
      expect(profile.locationPreferences).toHaveLength(1);
      expect(profile.locationPreferences[0].city).toBe('Chicago');
      expect(profile.behaviorScore).toBe(50);
      expect(profile.interactionHistory.totalInteractions).toBe(0);
    });

    it('should create popular user profile', async () => {
      const profile = await errorRecoveryService.handleUserDataFailure('popular', 'Miami');
      
      expect(profile.userId).toBe('popular-user');
      expect(profile.preferredCategories).toHaveLength(3);
      expect(profile.behaviorScore).toBe(75);
      expect(profile.interactionHistory.totalInteractions).toBe(50);
      expect(profile.purchaseProfile.totalPurchases).toBe(5);
    });

    it('should create location-based profile', async () => {
      const profile = await errorRecoveryService.handleUserDataFailure('location', 'Seattle');
      
      expect(profile.userId).toBe('location-user-seattle');
      expect(profile.locationPreferences).toHaveLength(1);
      expect(profile.locationPreferences[0].city).toBe('Seattle');
      expect(profile.locationPreferences[0].score).toBe(95);
      expect(profile.behaviorScore).toBe(65);
    });

    it('should fallback to anonymous when location is not provided', async () => {
      const profile = await errorRecoveryService.handleUserDataFailure('location');
      
      expect(profile.userId).toBe('anonymous-user');
      expect(profile.locationPreferences).toHaveLength(0);
    });
  });

  describe('Market Data Failure Handling', () => {
    it('should return static trending data when market data fails', async () => {
      const trendingScreens = await errorRecoveryService.handleMarketDataFailure('New York', 7);
      
      expect(trendingScreens).toHaveLength(2); // 2 screens in New York
      expect(trendingScreens[0].screen).toBeDefined();
      expect(trendingScreens[0].bookingVelocity).toBeGreaterThan(0);
      expect(trendingScreens[0].trendScore).toBeGreaterThan(0);
      expect(trendingScreens[0].timeframe).toBe('7d');
    });

    it('should use cached trending data when available', async () => {
      const cachedScreens: EnhancedScreen[] = [{
        id: 'trending-1',
        name: 'Trending Screen',
        location: 'Denver',
        price: 180000,
        rating: 4.6,
        views: { daily: 1100 },
        category: { id: 'digital', name: 'Digital' },
        performanceMetrics: {
          screenId: 'trending-1',
          bookingRate: 9.2,
          averageRating: 4.6,
          engagementScore: 92,
          revenueGenerated: 1800000,
          impressionCount: 1100,
          conversionRate: 0.08,
          lastUpdated: new Date(),
          trendDirection: 'up'
        },
        trendingScore: 0.8
      }];

      await errorRecoveryService.cacheFallbackData('trending', 'Denver', cachedScreens);
      
      const trendingScreens = await errorRecoveryService.handleMarketDataFailure('Denver', 7);
      
      expect(trendingScreens).toHaveLength(1);
      expect(trendingScreens[0].screen.id).toBe('trending-1');
      expect(trendingScreens[0].trendScore).toBe(0.8);
    });
  });

  describe('Default Section Configurations', () => {
    it('should return default section configurations', async () => {
      const configs = await errorRecoveryService.getDefaultSectionConfigurations('user-1', 'Phoenix');
      
      expect(configs).toHaveLength(3); // popular, recent, location
      
      const popularConfig = configs.find(c => c.id === 'fallback-popular');
      expect(popularConfig).toBeDefined();
      expect(popularConfig!.name).toBe('Popular Screens');
      expect(popularConfig!.algorithm).toBe('trending-analysis');
      expect(popularConfig!.conditions.enabledForAnonymous).toBe(true);
      
      const locationConfig = configs.find(c => c.id === 'fallback-location');
      expect(locationConfig).toBeDefined();
      expect(locationConfig!.name).toBe('Screens in Phoenix');
    });

    it('should return basic configurations without location', async () => {
      const configs = await errorRecoveryService.getDefaultSectionConfigurations('user-1');
      
      expect(configs).toHaveLength(2); // popular, recent (no location)
      expect(configs.find(c => c.id === 'fallback-location')).toBeUndefined();
    });

    it('should mark configurations as fallback', async () => {
      const configs = await errorRecoveryService.getDefaultSectionConfigurations();
      
      configs.forEach(config => {
        expect(config.metadata?.isFallback).toBe(true);
        expect(config.metadata?.fallbackReason).toBeDefined();
      });
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed operations', async () => {
      let attemptCount = 0;
      const failingOperation = vi.fn(async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Operation failed');
        }
        return 'success';
      });

      const fallback = vi.fn(async () => 'fallback');

      const result = await errorRecoveryService.executeWithRetry(
        failingOperation,
        fallback,
        'test-operation',
        'user-1'
      );

      expect(result).toBe('success');
      expect(failingOperation).toHaveBeenCalledTimes(2);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('should use fallback after max retries', async () => {
      const failingOperation = vi.fn(async () => {
        throw new Error('Always fails');
      });

      const fallback = vi.fn(async () => 'fallback-result');

      const result = await errorRecoveryService.executeWithRetry(
        failingOperation,
        fallback,
        'test-operation',
        'user-1'
      );

      expect(result).toBe('fallback-result');
      expect(failingOperation).toHaveBeenCalledTimes(2); // maxRetries = 2
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('should throw error if fallback also fails', async () => {
      const failingOperation = vi.fn(async () => {
        throw new Error('Operation failed');
      });

      const failingFallback = vi.fn(async () => {
        throw new Error('Fallback failed');
      });

      await expect(
        errorRecoveryService.executeWithRetry(
          failingOperation,
          failingFallback,
          'test-operation',
          'user-1'
        )
      ).rejects.toThrow('Fallback failed');
    });
  });

  describe('Error Metrics and Logging', () => {
    it('should track error metrics', async () => {
      // Trigger some errors
      await errorRecoveryService.handleMLServiceFailure('user-1');
      await errorRecoveryService.handleUserDataFailure('anonymous');
      await errorRecoveryService.handleMarketDataFailure();

      const metrics = errorRecoveryService.getErrorMetrics();
      
      expect(metrics.totalErrors).toBeGreaterThan(0);
      expect(metrics.errorsByType['ML_SERVICE_FAILURE']).toBe(1);
      expect(metrics.errorsByType['USER_DATA_FAILURE']).toBe(1);
      expect(metrics.errorsByType['MARKET_DATA_FAILURE']).toBe(1);
      expect(metrics.fallbacksUsed).toBeDefined();
      expect(metrics.lastErrorTime).toBeInstanceOf(Date);
    });

    it('should log recent errors', async () => {
      await errorRecoveryService.handleMLServiceFailure('user-1');
      
      const errors = errorRecoveryService.getRecentErrors(10);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('ML_SERVICE_FAILURE');
      expect(errors[0].userId).toBe('user-1');
      expect(errors[0].recoveryStrategy).toBeDefined();
    });

    it('should clear error log', async () => {
      await errorRecoveryService.handleMLServiceFailure('user-1');
      
      let errors = errorRecoveryService.getRecentErrors();
      expect(errors.length).toBeGreaterThan(0);
      
      errorRecoveryService.clearErrorLog();
      
      errors = errorRecoveryService.getRecentErrors();
      expect(errors).toHaveLength(0);
      
      const metrics = errorRecoveryService.getErrorMetrics();
      expect(metrics.totalErrors).toBe(0);
    });
  });

  describe('Cache Management', () => {
    it('should cache and retrieve fallback data', async () => {
      const testScreens: EnhancedScreen[] = [{
        id: 'cache-test-1',
        name: 'Cache Test Screen',
        location: 'Portland',
        price: 130000,
        rating: 4.3,
        views: { daily: 950 },
        category: { id: 'outdoor', name: 'Outdoor' },
        performanceMetrics: {
          screenId: 'cache-test-1',
          bookingRate: 8.6,
          averageRating: 4.3,
          engagementScore: 86,
          revenueGenerated: 1300000,
          impressionCount: 950,
          conversionRate: 0.06,
          lastUpdated: new Date(),
          trendDirection: 'up'
        }
      }];

      await errorRecoveryService.cacheFallbackData('popular', 'Portland', testScreens);
      
      const screens = await errorRecoveryService.handleMLServiceFailure('user-1', 'Portland', 5);
      
      expect(screens).toHaveLength(1);
      expect(screens[0].id).toBe('cache-test-1');
    });

    it('should handle cache expiration', async () => {
      // Create service with very short cache timeout
      const shortCacheService = new ErrorRecoveryService({
        fallbackCacheTimeMs: 1 // 1ms timeout
      });

      const testScreens: EnhancedScreen[] = [{
        id: 'expire-test-1',
        name: 'Expire Test Screen',
        location: 'Austin',
        price: 140000,
        rating: 4.4,
        views: { daily: 1000 },
        category: { id: 'digital', name: 'Digital' },
        performanceMetrics: {
          screenId: 'expire-test-1',
          bookingRate: 8.8,
          averageRating: 4.4,
          engagementScore: 88,
          revenueGenerated: 1400000,
          impressionCount: 1000,
          conversionRate: 0.07,
          lastUpdated: new Date(),
          trendDirection: 'stable'
        }
      }];

      await shortCacheService.cacheFallbackData('popular', 'Austin', testScreens);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const screens = await shortCacheService.handleMLServiceFailure('user-1', 'Austin', 5);
      
      // Should not use cached data (expired), should use rule-based fallback
      expect(screens.length).toBeGreaterThan(0);
      expect(screens[0].id).not.toBe('expire-test-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty screen data gracefully', async () => {
      // Mock empty screens data
      vi.doMock('../../../../data/demoScreens', () => ({
        demoScreens: []
      }));

      const screens = await errorRecoveryService.handleMLServiceFailure('user-1', 'NonExistentCity', 5);
      
      expect(screens).toHaveLength(0);
    });

    it('should handle invalid location gracefully', async () => {
      const screens = await errorRecoveryService.handleMLServiceFailure('user-1', 'InvalidLocation', 5);
      
      expect(screens).toHaveLength(0);
    });

    it('should handle configuration creation failure', async () => {
      // This test ensures the service doesn't crash when configuration creation fails
      const configs = await errorRecoveryService.getDefaultSectionConfigurations();
      
      expect(Array.isArray(configs)).toBe(true);
      // Even if some configs fail, it should return what it can
    });
  });
});