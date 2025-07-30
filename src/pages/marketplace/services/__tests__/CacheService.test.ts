/**
 * Cache Service Tests
 * Tests for Redis/memory caching functionality with cache invalidation and background refresh
 */

import { CacheService } from '../CacheService';
import { MarketplaceSection, EnhancedScreen, UserProfile, TrendingScreen, ScreenPerformanceMetrics, UserInteraction } from '../../types/intelligent-grouping.types';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService({
      enableBackgroundRefresh: false, // Disable for testing
      defaultTTL: 1000, // 1 second for quick expiration tests
      maxMemoryItems: 100,
      enableMetrics: true
    });
  });

  afterEach(() => {
    cacheService.shutdown();
  });

  describe('User Recommendations Caching', () => {
    const mockSections: MarketplaceSection[] = [
      {
        id: 'top-picks',
        title: 'Top picks for you',
        subtitle: 'Personalized recommendations',
        screens: [],
        displayType: 'featured',
        priority: 1,
        metadata: {
          algorithm: 'ml-personalized',
          confidence: 0.8,
          refreshInterval: 3600000,
          trackingId: 'test-tracking-id',
          generatedAt: new Date()
        }
      }
    ];

    it('should cache and retrieve user recommendations', async () => {
      const userId = 'test-user-123';
      
      // Cache recommendations
      await cacheService.cacheUserRecommendations(userId, mockSections);
      
      // Retrieve recommendations
      const cached = await cacheService.getUserRecommendations(userId);
      
      expect(cached).toEqual(mockSections);
    });

    it('should return null for non-existent user recommendations', async () => {
      const cached = await cacheService.getUserRecommendations('non-existent-user');
      expect(cached).toBeNull();
    });

    it('should expire user recommendations after TTL', async () => {
      const userId = 'test-user-expire';
      
      // Cache with short TTL
      await cacheService.cacheUserRecommendations(userId, mockSections, 100);
      
      // Should be available immediately
      let cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toEqual(mockSections);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be expired
      cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toBeNull();
    });
  });

  describe('Market Data Caching', () => {
    const mockTrendingScreens: TrendingScreen[] = [
      {
        screen: {} as EnhancedScreen,
        bookingVelocity: 5.2,
        purchaseVelocity: 4.1,
        trendScore: 0.85,
        bookingCount: 15,
        recentPurchases: 12,
        timeframe: '7d',
        growthRate: 0.3,
        rankChange: 2
      }
    ];

    it('should cache and retrieve market data', async () => {
      const location = 'Bogotá';
      const timeframe = 7;
      
      // Cache market data
      await cacheService.cacheMarketData(location, timeframe, mockTrendingScreens);
      
      // Retrieve market data
      const cached = await cacheService.getMarketData(location, timeframe);
      
      expect(cached).toEqual(mockTrendingScreens);
    });

    it('should handle undefined location in market data caching', async () => {
      const timeframe = 7;
      
      // Cache market data without location
      await cacheService.cacheMarketData(undefined, timeframe, mockTrendingScreens);
      
      // Retrieve market data
      const cached = await cacheService.getMarketData(undefined, timeframe);
      
      expect(cached).toEqual(mockTrendingScreens);
    });
  });

  describe('Screen Metrics Caching', () => {
    const mockMetrics: ScreenPerformanceMetrics = {
      screenId: 'screen-123',
      bookingRate: 2.5,
      averageRating: 4.2,
      engagementScore: 75,
      revenueGenerated: 1500000,
      impressionCount: 5000,
      conversionRate: 0.05,
      lastUpdated: new Date(),
      trendDirection: 'up'
    };

    it('should cache and retrieve screen metrics', async () => {
      const screenId = 'screen-123';
      
      // Cache metrics
      await cacheService.cacheScreenMetrics(screenId, mockMetrics);
      
      // Retrieve metrics
      const cached = await cacheService.getScreenMetrics(screenId);
      
      expect(cached).toEqual(mockMetrics);
    });
  });

  describe('User Profile Caching', () => {
    const mockProfile: UserProfile = {
      userId: 'test-user',
      preferredCategories: [],
      budgetRange: { min: 100000, max: 1000000, preferred: 500000, currency: 'COP', confidence: 0.8 },
      locationPreferences: [],
      behaviorScore: 75,
      lastActivity: new Date(),
      interactionHistory: {
        totalInteractions: 10,
        averageSessionDuration: 180000,
        mostActiveTimeOfDay: 14,
        preferredDeviceType: 'desktop',
        engagementRate: 3.5,
        lastInteractionDate: new Date()
      },
      purchaseProfile: {
        totalPurchases: 2,
        totalSpent: 800000,
        averageOrderValue: 400000,
        preferredPurchaseType: ['daily'],
        seasonalPatterns: { 'summer': 2 },
        purchaseFrequency: 'medium'
      },
      preferences: {
        notifications: { email: true, push: false, sms: false },
        privacy: { shareData: false, trackingEnabled: true },
        display: { theme: 'light', language: 'es', currency: 'COP' }
      }
    };

    it('should cache and retrieve user profile', async () => {
      const userId = 'test-user';
      
      // Cache profile
      await cacheService.cacheUserProfile(userId, mockProfile);
      
      // Retrieve profile
      const cached = await cacheService.getUserProfile(userId);
      
      expect(cached).toEqual(mockProfile);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache by tags', async () => {
      const userId = 'test-user-invalidation';
      const mockSections: MarketplaceSection[] = [{
        id: 'test-section',
        title: 'Test Section',
        screens: [],
        displayType: 'grid',
        priority: 1,
        metadata: {
          algorithm: 'test',
          confidence: 0.5,
          refreshInterval: 3600000,
          trackingId: 'test-id',
          generatedAt: new Date()
        }
      }];
      
      // Cache recommendations
      await cacheService.cacheUserRecommendations(userId, mockSections);
      
      // Verify cached
      let cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toEqual(mockSections);
      
      // Invalidate by user tag
      await cacheService.invalidateByTags([`user:${userId}`]);
      
      // Should be invalidated
      cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toBeNull();
    });

    it('should invalidate cache on user interaction', async () => {
      const userId = 'test-user-interaction';
      const mockSections: MarketplaceSection[] = [{
        id: 'test-section',
        title: 'Test Section',
        screens: [],
        displayType: 'grid',
        priority: 1,
        metadata: {
          algorithm: 'test',
          confidence: 0.5,
          refreshInterval: 3600000,
          trackingId: 'test-id',
          generatedAt: new Date()
        }
      }];
      
      // Cache recommendations
      await cacheService.cacheUserRecommendations(userId, mockSections);
      
      // Verify cached
      let cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toEqual(mockSections);
      
      // Simulate user interaction
      const interaction: UserInteraction = {
        id: 'test-interaction',
        userId,
        screenId: 'screen-123',
        action: 'purchase',
        timestamp: new Date(),
        context: {
          section: 'test-section',
          sessionId: 'test-session',
          pageUrl: '/marketplace',
          referrer: '',
          deviceInfo: {
            type: 'desktop',
            os: 'macOS',
            browser: 'Chrome',
            screenResolution: '1920x1080',
            userAgent: 'test-agent'
          }
        },
        metadata: {
          duration: 5000,
          additionalData: {}
        }
      };
      
      // Invalidate based on interaction
      await cacheService.invalidateOnUserInteraction(interaction);
      
      // Should be invalidated
      cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toBeNull();
    });

    it('should clear all user cache', async () => {
      const userId = 'test-user-clear';
      const mockSections: MarketplaceSection[] = [{
        id: 'test-section',
        title: 'Test Section',
        screens: [],
        displayType: 'grid',
        priority: 1,
        metadata: {
          algorithm: 'test',
          confidence: 0.5,
          refreshInterval: 3600000,
          trackingId: 'test-id',
          generatedAt: new Date()
        }
      }];
      
      // Cache multiple items for user
      await cacheService.cacheUserRecommendations(userId, mockSections);
      await cacheService.cacheUserProfile(userId, {
        userId,
        preferredCategories: [],
        budgetRange: { min: 0, max: 1000000, preferred: 500000, currency: 'COP', confidence: 0.5 },
        locationPreferences: [],
        behaviorScore: 50,
        lastActivity: new Date(),
        interactionHistory: {
          totalInteractions: 0,
          averageSessionDuration: 0,
          mostActiveTimeOfDay: 12,
          preferredDeviceType: 'desktop',
          engagementRate: 0,
          lastInteractionDate: new Date()
        },
        purchaseProfile: {
          totalPurchases: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          preferredPurchaseType: [],
          seasonalPatterns: {},
          purchaseFrequency: 'low'
        },
        preferences: {
          notifications: { email: true, push: false, sms: false },
          privacy: { shareData: false, trackingEnabled: true },
          display: { theme: 'light', language: 'es', currency: 'COP' }
        }
      });
      
      // Verify cached
      expect(await cacheService.getUserRecommendations(userId)).toEqual(mockSections);
      expect(await cacheService.getUserProfile(userId)).toBeTruthy();
      
      // Clear user cache
      await cacheService.clearUserCache(userId);
      
      // Should be cleared
      expect(await cacheService.getUserRecommendations(userId)).toBeNull();
      expect(await cacheService.getUserProfile(userId)).toBeNull();
    });
  });

  describe('Cache Metrics', () => {
    it('should track cache metrics', async () => {
      const userId = 'test-user-metrics';
      const mockSections: MarketplaceSection[] = [{
        id: 'test-section',
        title: 'Test Section',
        screens: [],
        displayType: 'grid',
        priority: 1,
        metadata: {
          algorithm: 'test',
          confidence: 0.5,
          refreshInterval: 3600000,
          trackingId: 'test-id',
          generatedAt: new Date()
        }
      }];
      
      // Initial metrics
      let metrics = cacheService.getMetrics();
      const initialHits = metrics.hits;
      const initialMisses = metrics.misses;
      
      // Cache miss
      await cacheService.getUserRecommendations(userId);
      
      // Cache hit
      await cacheService.cacheUserRecommendations(userId, mockSections);
      await cacheService.getUserRecommendations(userId);
      
      // Check updated metrics
      metrics = cacheService.getMetrics();
      expect(metrics.hits).toBe(initialHits + 1);
      expect(metrics.misses).toBe(initialMisses + 1);
      expect(metrics.totalRequests).toBe(initialHits + initialMisses + 2);
      expect(metrics.itemCount).toBeGreaterThan(0);
    });
  });

  describe('Cache Cleanup', () => {
    it('should clean up expired entries', async () => {
      const userId = 'test-user-cleanup';
      const mockSections: MarketplaceSection[] = [{
        id: 'test-section',
        title: 'Test Section',
        screens: [],
        displayType: 'grid',
        priority: 1,
        metadata: {
          algorithm: 'test',
          confidence: 0.5,
          refreshInterval: 3600000,
          trackingId: 'test-id',
          generatedAt: new Date()
        }
      }];
      
      // Cache with short TTL
      await cacheService.cacheUserRecommendations(userId, mockSections, 50);
      
      // Verify cached
      let cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toEqual(mockSections);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Run cleanup
      await cacheService.cleanup();
      
      // Should be cleaned up
      cached = await cacheService.getUserRecommendations(userId);
      expect(cached).toBeNull();
    });
  });

  describe('Background Refresh', () => {
    it('should schedule background refresh when enabled', () => {
      // Create cache service with background refresh enabled
      const cacheWithRefresh = new CacheService({
        enableBackgroundRefresh: true,
        defaultTTL: 1000,
        maxMemoryItems: 100,
        enableMetrics: true
      });
      
      const refreshFunction = vi.fn().mockResolvedValue(['refreshed data']);
      
      // Schedule refresh
      cacheWithRefresh.scheduleRefresh('test-key', refreshFunction);
      
      // Verify function is stored (this is implementation-specific)
      expect((cacheWithRefresh as any).refreshQueue.has('test-key')).toBe(true);
      
      // Cleanup
      cacheWithRefresh.shutdown();
    });
  });
});