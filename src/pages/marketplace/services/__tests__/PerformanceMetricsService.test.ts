/**
 * Tests for PerformanceMetricsService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMetricsService } from '../PerformanceMetricsService';
import { BookingActivity, UserInteraction } from '../../types/intelligent-grouping.types';
import { Screen } from '../../types/marketplace.types';

describe('PerformanceMetricsService', () => {
  let service: PerformanceMetricsService;
  let mockScreen: Screen;
  let mockBookings: BookingActivity[];
  let mockInteractions: UserInteraction[];

  beforeEach(() => {
    service = new PerformanceMetricsService();
    
    mockScreen = {
      id: 'test-screen-1',
      name: 'Test Screen',
      location: 'Test City',
      locationDetails: {
        address: 'Test Address',
        city: 'Test City',
        region: 'Test Region',
        country: 'Test Country',
        coordinates: { lat: 0, lng: 0 },
        timezone: 'UTC',
        landmarks: []
      },
      price: 1000000,
      availability: true,
      image: 'test.jpg',
      category: { id: 'test', name: 'Test Category' },
      environment: 'outdoor',
      specs: {
        width: 1920,
        height: 1080,
        resolution: 'HD',
        brightness: '5000 nits',
        aspectRatio: '16:9',
        orientation: 'landscape',
        pixelDensity: 72,
        colorDepth: 24,
        refreshRate: 60
      },
      views: { daily: 10000, monthly: 300000 },
      rating: 4.5,
      reviews: 100,
      pricing: {
        allowMoments: true,
        deviceId: 'test-device',
        bundles: {
          hourly: { enabled: true, price: 100000, spots: 1 }
        }
      },
      metrics: {
        dailyTraffic: 10000,
        monthlyTraffic: 300000,
        averageEngagement: 85
      }
    } as Screen;

    // Create mock bookings for the last 7 days
    mockBookings = [];
    const now = Date.now();
    for (let i = 0; i < 10; i++) {
      mockBookings.push({
        screenId: 'test-screen-1',
        timestamp: new Date(now - i * 24 * 60 * 60 * 1000), // i days ago
        bookingType: 'hourly',
        duration: 1,
        price: 100000,
        location: 'Test City'
      });
    }

    // Create mock interactions
    mockInteractions = [];
    for (let i = 0; i < 50; i++) {
      mockInteractions.push({
        id: `interaction-${i}`,
        userId: `user-${i % 10}`,
        screenId: 'test-screen-1',
        action: ['view', 'click', 'favorite', 'share'][i % 4] as any,
        timestamp: new Date(now - i * 60 * 60 * 1000), // i hours ago
        context: {
          sessionId: `session-${i % 20}`,
          pageUrl: 'test-url',
          deviceInfo: {
            type: 'desktop',
            os: 'Windows',
            browser: 'Chrome',
            screenSize: { width: 1920, height: 1080 },
            touchEnabled: false
          }
        },
        metadata: {
          duration: Math.random() * 60000 // Random duration up to 1 minute
        }
      });
    }
  });

  describe('calculatePerformanceScore', () => {
    it('should calculate a performance score between 0 and 1', () => {
      const score = service.calculatePerformanceScore(
        mockScreen,
        mockBookings,
        mockInteractions
      );

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return higher scores for screens with more bookings', () => {
      const moreBookings = [...mockBookings, ...mockBookings]; // Double the bookings
      
      const normalScore = service.calculatePerformanceScore(
        mockScreen,
        mockBookings,
        mockInteractions
      );
      
      const higherScore = service.calculatePerformanceScore(
        mockScreen,
        moreBookings,
        mockInteractions
      );

      expect(higherScore).toBeGreaterThan(normalScore);
    });

    it('should return higher scores for screens with better ratings', () => {
      const lowerRatedScreen = { ...mockScreen, rating: 2.0 };
      
      const normalScore = service.calculatePerformanceScore(
        mockScreen,
        mockBookings,
        mockInteractions
      );
      
      const lowerScore = service.calculatePerformanceScore(
        lowerRatedScreen,
        mockBookings,
        mockInteractions
      );

      expect(normalScore).toBeGreaterThan(lowerScore);
    });
  });

  describe('calculateTrendingScore', () => {
    it('should calculate a trending score between 0 and 1', () => {
      const score = service.calculateTrendingScore(
        'test-screen-1',
        mockBookings
      );

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return 0 for screens with no bookings', () => {
      const score = service.calculateTrendingScore(
        'non-existent-screen',
        mockBookings
      );

      expect(score).toBe(0);
    });

    it('should return higher scores for screens with recent activity', () => {
      // Create bookings with recent activity
      const recentBookings = mockBookings.map((booking, index) => ({
        ...booking,
        timestamp: new Date(Date.now() - index * 60 * 60 * 1000) // Recent hours instead of days
      }));

      const recentScore = service.calculateTrendingScore(
        'test-screen-1',
        recentBookings
      );

      const oldScore = service.calculateTrendingScore(
        'test-screen-1',
        mockBookings
      );

      expect(recentScore).toBeGreaterThan(oldScore);
    });
  });

  describe('calculateEngagementMetrics', () => {
    it('should calculate engagement metrics with correct structure', () => {
      const metrics = service.calculateEngagementMetrics(
        'test-screen-1',
        mockInteractions,
        mockBookings
      );

      expect(metrics).toHaveProperty('viewTime');
      expect(metrics).toHaveProperty('interactionRate');
      expect(metrics).toHaveProperty('completionRate');
      expect(metrics).toHaveProperty('shareRate');
      expect(metrics).toHaveProperty('favoriteRate');
      expect(metrics).toHaveProperty('clickThroughRate');
      expect(metrics).toHaveProperty('bounceRate');

      // All metrics should be numbers between 0 and 1 (except viewTime)
      expect(metrics.interactionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.interactionRate).toBeLessThanOrEqual(1);
      expect(metrics.completionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.shareRate).toBeGreaterThanOrEqual(0);
      expect(metrics.shareRate).toBeLessThanOrEqual(1);
      expect(metrics.favoriteRate).toBeGreaterThanOrEqual(0);
      expect(metrics.favoriteRate).toBeLessThanOrEqual(1);
      expect(metrics.clickThroughRate).toBeGreaterThanOrEqual(0);
      expect(metrics.bounceRate).toBeGreaterThanOrEqual(0);
      expect(metrics.bounceRate).toBeLessThanOrEqual(1);
    });

    it('should return zero metrics for screens with no interactions', () => {
      const metrics = service.calculateEngagementMetrics(
        'non-existent-screen',
        mockInteractions,
        mockBookings
      );

      expect(metrics.viewTime).toBe(0);
      expect(metrics.interactionRate).toBe(0);
      expect(metrics.completionRate).toBe(0);
      expect(metrics.shareRate).toBe(0);
      expect(metrics.favoriteRate).toBe(0);
      expect(metrics.clickThroughRate).toBe(0);
      expect(metrics.bounceRate).toBe(0);
    });
  });

  describe('generateScreenPerformanceMetrics', () => {
    it('should generate complete performance metrics', async () => {
      const metrics = await service.generateScreenPerformanceMetrics(
        mockScreen,
        mockBookings,
        mockInteractions
      );

      expect(metrics).toHaveProperty('screenId', 'test-screen-1');
      expect(metrics).toHaveProperty('bookingRate');
      expect(metrics).toHaveProperty('averageRating', 4.5);
      expect(metrics).toHaveProperty('engagementScore');
      expect(metrics).toHaveProperty('revenueGenerated');
      expect(metrics).toHaveProperty('impressionCount');
      expect(metrics).toHaveProperty('conversionRate');
      expect(metrics).toHaveProperty('lastUpdated');
      expect(metrics).toHaveProperty('trendDirection');

      // Validate numeric ranges
      expect(metrics.bookingRate).toBeGreaterThanOrEqual(0);
      expect(metrics.engagementScore).toBeGreaterThanOrEqual(0);
      expect(metrics.engagementScore).toBeLessThanOrEqual(100);
      expect(metrics.revenueGenerated).toBeGreaterThanOrEqual(0);
      expect(metrics.impressionCount).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeLessThanOrEqual(1);
      expect(['up', 'down', 'stable']).toContain(metrics.trendDirection);
    });
  });

  describe('trackEngagementEvent', () => {
    it('should track engagement events without throwing errors', () => {
      expect(() => {
        service.trackEngagementEvent('test-screen-1', 'view');
        service.trackEngagementEvent('test-screen-1', 'click', { source: 'test' });
        service.trackEngagementEvent('test-screen-1', 'purchase', { amount: 100000 });
      }).not.toThrow();
    });
  });
});