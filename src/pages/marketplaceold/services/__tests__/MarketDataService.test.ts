/**
 * Tests for MarketDataService
 * Basic integration tests to verify the service works correctly
 */

import { MarketDataServiceImpl } from '../MarketDataService';
import { BookingActivity } from '../../types/intelligent-grouping.types';

describe('MarketDataService', () => {
  let service: MarketDataServiceImpl;

  beforeEach(() => {
    service = new MarketDataServiceImpl();
  });

  describe('getTrendingScreens', () => {
    it('should return trending screens array', async () => {
      const trendingScreens = await service.getTrendingScreens();
      
      expect(Array.isArray(trendingScreens)).toBe(true);
      
      // If there are trending screens, verify structure
      if (trendingScreens.length > 0) {
        const firstScreen = trendingScreens[0];
        expect(firstScreen).toHaveProperty('screen');
        expect(firstScreen).toHaveProperty('bookingVelocity');
        expect(firstScreen).toHaveProperty('trendScore');
        expect(firstScreen).toHaveProperty('bookingCount');
        expect(firstScreen).toHaveProperty('timeframe');
        expect(firstScreen).toHaveProperty('growthRate');
        expect(firstScreen).toHaveProperty('rankChange');
        
        // Verify numeric ranges
        expect(firstScreen.trendScore).toBeGreaterThanOrEqual(0);
        expect(firstScreen.trendScore).toBeLessThanOrEqual(1);
        expect(firstScreen.bookingVelocity).toBeGreaterThanOrEqual(0);
        expect(firstScreen.bookingCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should filter by location when provided', async () => {
      const allTrending = await service.getTrendingScreens();
      const medellinTrending = await service.getTrendingScreens('Medellín');
      
      // Both should be arrays
      expect(Array.isArray(allTrending)).toBe(true);
      expect(Array.isArray(medellinTrending)).toBe(true);
      
      // Location-filtered results should be subset or equal
      expect(medellinTrending.length).toBeLessThanOrEqual(allTrending.length);
    });

    it('should respect timeframe parameter', async () => {
      const shortTerm = await service.getTrendingScreens(undefined, 3);
      const longTerm = await service.getTrendingScreens(undefined, 14);
      
      expect(Array.isArray(shortTerm)).toBe(true);
      expect(Array.isArray(longTerm)).toBe(true);
    });
  });

  describe('getTopPerformingScreens', () => {
    it('should return top performing screens for a location', async () => {
      const topScreens = await service.getTopPerformingScreens('Medellín', 5);
      
      expect(Array.isArray(topScreens)).toBe(true);
      expect(topScreens.length).toBeLessThanOrEqual(5);
      
      // Verify enhanced screen structure
      if (topScreens.length > 0) {
        const firstScreen = topScreens[0];
        expect(firstScreen).toHaveProperty('id');
        expect(firstScreen).toHaveProperty('name');
        expect(firstScreen).toHaveProperty('performanceMetrics');
        expect(firstScreen).toHaveProperty('bookingFrequency');
        expect(firstScreen).toHaveProperty('engagementMetrics');
        expect(firstScreen).toHaveProperty('audienceInsights');
      }
    });

    it('should return empty array for non-existent location', async () => {
      const topScreens = await service.getTopPerformingScreens('NonExistentCity', 5);
      
      expect(Array.isArray(topScreens)).toBe(true);
      expect(topScreens.length).toBe(0);
    });
  });

  describe('getRecentBookings', () => {
    it('should return booking activity array', async () => {
      const bookings = await service.getRecentBookings(7);
      
      expect(Array.isArray(bookings)).toBe(true);
      
      // Verify booking structure if any exist
      if (bookings.length > 0) {
        const firstBooking = bookings[0];
        expect(firstBooking).toHaveProperty('screenId');
        expect(firstBooking).toHaveProperty('timestamp');
        expect(firstBooking).toHaveProperty('bookingType');
        expect(firstBooking).toHaveProperty('duration');
        expect(firstBooking).toHaveProperty('price');
        expect(firstBooking).toHaveProperty('location');
        
        // Verify data types
        expect(typeof firstBooking.screenId).toBe('string');
        expect(firstBooking.timestamp instanceof Date).toBe(true);
        expect(typeof firstBooking.price).toBe('number');
        expect(firstBooking.price).toBeGreaterThan(0);
      }
    });

    it('should return bookings sorted by timestamp (newest first)', async () => {
      const bookings = await service.getRecentBookings(7);
      
      if (bookings.length > 1) {
        for (let i = 1; i < bookings.length; i++) {
          expect(bookings[i-1].timestamp.getTime()).toBeGreaterThanOrEqual(
            bookings[i].timestamp.getTime()
          );
        }
      }
    });
  });

  describe('getScreenPerformanceMetrics', () => {
    it('should return performance metrics for any screen ID', async () => {
      const metrics = await service.getScreenPerformanceMetrics('test-screen-id');
      
      expect(metrics).toHaveProperty('screenId', 'test-screen-id');
      expect(metrics).toHaveProperty('bookingRate');
      expect(metrics).toHaveProperty('averageRating');
      expect(metrics).toHaveProperty('engagementScore');
      expect(metrics).toHaveProperty('revenueGenerated');
      expect(metrics).toHaveProperty('impressionCount');
      expect(metrics).toHaveProperty('conversionRate');
      expect(metrics).toHaveProperty('lastUpdated');
      expect(metrics).toHaveProperty('trendDirection');
      
      // Verify numeric ranges
      expect(metrics.bookingRate).toBeGreaterThanOrEqual(0);
      expect(metrics.averageRating).toBeGreaterThanOrEqual(0);
      expect(metrics.averageRating).toBeLessThanOrEqual(5);
      expect(metrics.engagementScore).toBeGreaterThanOrEqual(0);
      expect(metrics.engagementScore).toBeLessThanOrEqual(100);
      expect(metrics.revenueGenerated).toBeGreaterThanOrEqual(0);
      expect(metrics.impressionCount).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeLessThanOrEqual(1);
      expect(['up', 'down', 'stable']).toContain(metrics.trendDirection);
      expect(metrics.lastUpdated instanceof Date).toBe(true);
    });
  });

  describe('getMarketInsights', () => {
    it('should return market insights for all markets', async () => {
      const insights = await service.getMarketInsights();
      
      expect(insights).toHaveProperty('location');
      expect(insights).toHaveProperty('totalScreens');
      expect(insights).toHaveProperty('averagePrice');
      expect(insights).toHaveProperty('topCategories');
      expect(insights).toHaveProperty('seasonalTrends');
      expect(insights).toHaveProperty('competitiveIndex');
      expect(insights).toHaveProperty('growthRate');
      expect(insights).toHaveProperty('lastUpdated');
      
      // Verify data types
      expect(typeof insights.location).toBe('string');
      expect(typeof insights.totalScreens).toBe('number');
      expect(typeof insights.averagePrice).toBe('number');
      expect(Array.isArray(insights.topCategories)).toBe(true);
      expect(typeof insights.seasonalTrends).toBe('object');
      expect(typeof insights.competitiveIndex).toBe('number');
      expect(typeof insights.growthRate).toBe('number');
      expect(insights.lastUpdated instanceof Date).toBe(true);
      
      // Verify numeric ranges
      expect(insights.totalScreens).toBeGreaterThanOrEqual(0);
      expect(insights.averagePrice).toBeGreaterThanOrEqual(0);
      expect(insights.competitiveIndex).toBeGreaterThanOrEqual(0);
      expect(insights.competitiveIndex).toBeLessThanOrEqual(1);
    });

    it('should return location-specific insights when location provided', async () => {
      const insights = await service.getMarketInsights('Medellín');
      
      expect(insights.location).toBe('Medellín');
      expect(typeof insights.totalScreens).toBe('number');
      expect(insights.totalScreens).toBeGreaterThanOrEqual(0);
    });
  });

  describe('caching behavior', () => {
    it('should cache trending screens results', async () => {
      const start1 = Date.now();
      const result1 = await service.getTrendingScreens();
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      const result2 = await service.getTrendingScreens();
      const time2 = Date.now() - start2;
      
      // Second call should be faster due to caching
      expect(time2).toBeLessThan(time1);
      
      // Results should be identical
      expect(result1).toEqual(result2);
    });

    it('should cache performance metrics results', async () => {
      const screenId = 'test-screen-cache';
      
      const start1 = Date.now();
      const result1 = await service.getScreenPerformanceMetrics(screenId);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      const result2 = await service.getScreenPerformanceMetrics(screenId);
      const time2 = Date.now() - start2;
      
      // Second call should be faster due to caching
      expect(time2).toBeLessThan(time1);
      
      // Results should be identical
      expect(result1).toEqual(result2);
    });
  });
});