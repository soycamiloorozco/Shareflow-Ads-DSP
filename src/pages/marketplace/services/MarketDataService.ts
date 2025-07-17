/**
 * Market Data Service
 * Provides real-time market trends, booking activity tracking, and geographic popularity analysis
 * for intelligent marketplace grouping
 */

import {
  MarketDataService,
  TrendingScreen,
  BookingActivity,
  ScreenPerformanceMetrics,
  MarketInsights,
  EnhancedScreen,
  BookingFrequency,
  getBookingFrequency,
  enhanceScreen
} from '../types/intelligent-grouping.types';
import { Screen } from '../types/marketplace.types';
import { CacheService } from './CacheService';

/**
 * Implementation of MarketDataService for trending analysis and market insights
 */
export class MarketDataServiceImpl implements MarketDataService {
  private readonly cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService({
      enableBackgroundRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      defaultTTL: 15 * 60 * 1000, // 15 minutes for market data
      maxMemoryItems: 2000,
      enableMetrics: true
    });
  }

  /**
   * Get trending screens based on recent booking velocity and engagement
   */
  async getTrendingScreens(location?: string, timeframe: number = 7): Promise<TrendingScreen[]> {
    // Check cache first
    const cached = await this.cacheService.getMarketData(location, timeframe);
    if (cached) {
      return cached;
    }

    try {
      // Get recent booking activity
      const recentBookings = await this.getRecentBookings(timeframe);
      
      // Calculate booking velocity and trend scores
      const screenBookingStats = this.calculateBookingStats(recentBookings, location);
      
      // Get screen data and enhance with performance metrics
      const screens = await this.getScreensData(location);
      const trendingScreens: TrendingScreen[] = [];

      for (const screen of screens) {
        const stats = screenBookingStats.get(screen.id);
        if (!stats) continue;

        const performanceMetrics = await this.getScreenPerformanceMetrics(screen.id);
        const enhancedScreen = enhanceScreen(screen, performanceMetrics);

        // Calculate trend score based on booking velocity, growth rate, and engagement
        const trendScore = this.calculateTrendScore(stats, performanceMetrics);
        
        if (trendScore > 0.3) { // Only include screens with significant trending activity
          trendingScreens.push({
            screen: enhancedScreen,
            bookingVelocity: stats.velocity,
            purchaseVelocity: stats.velocity * 0.8, // Simulate purchase velocity as 80% of booking velocity
            trendScore,
            bookingCount: stats.bookingCount,
            recentPurchases: Math.floor(stats.bookingCount * 0.7), // Simulate recent purchases
            timeframe: `${timeframe}d`,
            growthRate: stats.growthRate,
            rankChange: stats.rankChange
          });
        }
      }

      // Sort by trend score and limit results
      const sortedTrending = trendingScreens
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 20);

      // Cache results with background refresh
      await this.cacheService.cacheMarketData(location, timeframe, sortedTrending);
      this.cacheService.scheduleRefresh(
        `market_data:${location || 'all'}:${timeframe}d`,
        () => this.getTrendingScreens(location, timeframe)
      );

      return sortedTrending;
    } catch (error) {
      console.error('Error getting trending screens:', error);
      return this.getFallbackTrendingScreens(location);
    }
  }

  /**
   * Get top performing screens in a specific location
   */
  async getTopPerformingScreens(location: string, limit: number = 10): Promise<EnhancedScreen[]> {
    const cacheKey = `top_performing_${location}_${limit}`;
    
    try {
      const screens = await this.getScreensData(location);
      const performingScreens: Array<{ screen: EnhancedScreen; score: number }> = [];

      for (const screen of screens) {
        const performanceMetrics = await this.getScreenPerformanceMetrics(screen.id);
        const enhancedScreen = enhanceScreen(screen, performanceMetrics);
        
        // Calculate performance score based on multiple factors
        const performanceScore = this.calculatePerformanceScore(performanceMetrics);
        
        performingScreens.push({
          screen: enhancedScreen,
          score: performanceScore
        });
      }

      // Sort by performance score and return top performers
      return performingScreens
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.screen);
    } catch (error) {
      console.error('Error getting top performing screens:', error);
      return [];
    }
  }

  /**
   * Get recent booking activity for trend analysis
   */
  async getRecentBookings(timeframe: number = 7): Promise<BookingActivity[]> {
    try {
      // In a real implementation, this would fetch from your booking API
      // For now, we'll simulate booking activity based on screen data
      const bookingActivity = await this.simulateBookingActivity(timeframe);
      
      return bookingActivity;
    } catch (error) {
      console.error('Error getting recent bookings:', error);
      return [];
    }
  }

  /**
   * Get detailed performance metrics for a specific screen
   */
  async getScreenPerformanceMetrics(screenId: string): Promise<ScreenPerformanceMetrics> {
    // Check cache first
    const cached = await this.cacheService.getScreenMetrics(screenId);
    if (cached) {
      return cached;
    }

    try {
      // In a real implementation, this would fetch from analytics API
      // For now, we'll calculate based on available data and simulate metrics
      const metrics = await this.calculateScreenMetrics(screenId);
      
      // Cache the metrics
      await this.cacheService.cacheScreenMetrics(screenId, metrics);

      return metrics;
    } catch (error) {
      console.error('Error getting screen performance metrics:', error);
      return this.getDefaultPerformanceMetrics(screenId);
    }
  }

  /**
   * Get market insights for a location
   */
  async getMarketInsights(location?: string): Promise<MarketInsights> {
    // Check cache first
    const cached = await this.cacheService.getMarketInsights(location);
    if (cached) {
      return cached;
    }

    try {
      const screens = await this.getScreensData(location);
      const recentBookings = await this.getRecentBookings(30); // Last 30 days
      
      const insights: MarketInsights = {
        location: location || 'All Markets',
        totalScreens: screens.length,
        averagePrice: this.calculateAveragePrice(screens),
        topCategories: this.getTopCategories(screens),
        seasonalTrends: this.calculateSeasonalTrends(recentBookings),
        competitiveIndex: this.calculateCompetitiveIndex(screens),
        growthRate: this.calculateMarketGrowthRate(recentBookings),
        lastUpdated: new Date()
      };

      // Cache the insights
      await this.cacheService.cacheMarketInsights(location, insights);

      return insights;
    } catch (error) {
      console.error('Error getting market insights:', error);
      return this.getDefaultMarketInsights(location);
    }
  }

  // Private helper methods

  private calculateBookingStats(bookings: BookingActivity[], location?: string) {
    const screenStats = new Map<string, {
      bookingCount: number;
      velocity: number;
      growthRate: number;
      rankChange: number;
      recentRevenue: number;
    }>();

    // Filter bookings by location if specified
    const filteredBookings = location 
      ? bookings.filter(booking => booking.location.toLowerCase().includes(location.toLowerCase()))
      : bookings;

    // Group bookings by screen
    const screenBookings = new Map<string, BookingActivity[]>();
    filteredBookings.forEach(booking => {
      if (!screenBookings.has(booking.screenId)) {
        screenBookings.set(booking.screenId, []);
      }
      screenBookings.get(booking.screenId)!.push(booking);
    });

    // Calculate stats for each screen
    screenBookings.forEach((screenBookingList, screenId) => {
      const bookingCount = screenBookingList.length;
      const velocity = bookingCount / 7; // bookings per day
      
      // Calculate growth rate (comparing first half vs second half of period)
      const midPoint = Math.floor(screenBookingList.length / 2);
      const firstHalf = screenBookingList.slice(0, midPoint);
      const secondHalf = screenBookingList.slice(midPoint);
      const growthRate = secondHalf.length > 0 && firstHalf.length > 0 
        ? (secondHalf.length - firstHalf.length) / firstHalf.length 
        : 0;

      const recentRevenue = screenBookingList.reduce((sum, booking) => sum + booking.price, 0);
      
      screenStats.set(screenId, {
        bookingCount,
        velocity,
        growthRate,
        rankChange: Math.floor(Math.random() * 10) - 5, // Simulated rank change
        recentRevenue
      });
    });

    return screenStats;
  }

  private calculateTrendScore(
    stats: { bookingCount: number; velocity: number; growthRate: number; rankChange: number },
    performanceMetrics: ScreenPerformanceMetrics
  ): number {
    // Weighted combination of factors
    const velocityScore = Math.min(stats.velocity / 5, 1); // Normalize to 0-1
    const growthScore = Math.max(0, Math.min(stats.growthRate + 0.5, 1)); // Normalize growth rate
    const engagementScore = performanceMetrics.engagementScore / 100; // Assuming 0-100 scale
    const rankScore = Math.max(0, stats.rankChange / 10 + 0.5); // Normalize rank change

    return (
      velocityScore * 0.4 +
      growthScore * 0.3 +
      engagementScore * 0.2 +
      rankScore * 0.1
    );
  }

  private calculatePerformanceScore(metrics: ScreenPerformanceMetrics): number {
    // Weighted combination of performance factors
    const bookingScore = Math.min(metrics.bookingRate / 10, 1); // Normalize booking rate
    const ratingScore = metrics.averageRating / 5; // Normalize rating (0-5 scale)
    const engagementScore = metrics.engagementScore / 100; // Normalize engagement
    const conversionScore = metrics.conversionRate; // Already normalized (0-1)

    return (
      bookingScore * 0.3 +
      ratingScore * 0.25 +
      engagementScore * 0.25 +
      conversionScore * 0.2
    );
  }

  private async simulateBookingActivity(timeframe: number): Promise<BookingActivity[]> {
    // This simulates booking activity - in a real app, this would come from your booking API
    const screens = await this.getScreensData();
    const bookings: BookingActivity[] = [];
    const now = new Date();

    screens.forEach(screen => {
      // Generate random bookings for each screen based on its popularity
      const bookingCount = Math.floor(Math.random() * 10) + 1;
      
      for (let i = 0; i < bookingCount; i++) {
        const daysAgo = Math.floor(Math.random() * timeframe);
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        bookings.push({
          screenId: screen.id,
          timestamp,
          bookingType: ['hourly', 'daily', 'weekly'][Math.floor(Math.random() * 3)],
          duration: Math.floor(Math.random() * 24) + 1,
          price: screen.price * (0.8 + Math.random() * 0.4), // ±20% price variation
          location: screen.location
        });
      }
    });

    return bookings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private async calculateScreenMetrics(screenId: string): Promise<ScreenPerformanceMetrics> {
    // This would typically fetch from analytics database
    // For now, we'll simulate based on screen data
    const screens = await this.getScreensData();
    const screen = screens.find(s => s.id === screenId);
    
    if (!screen) {
      return this.getDefaultPerformanceMetrics(screenId);
    }

    // Simulate metrics based on screen properties
    const baseBookingRate = screen.rating * 2; // Higher rated screens get more bookings
    const baseEngagement = screen.views.daily / 1000; // Convert views to engagement score
    
    return {
      screenId,
      bookingRate: baseBookingRate + Math.random() * 5,
      averageRating: screen.rating,
      engagementScore: Math.min(baseEngagement + Math.random() * 20, 100),
      revenueGenerated: screen.price * (5 + Math.random() * 10),
      impressionCount: screen.views.daily,
      conversionRate: 0.02 + Math.random() * 0.08, // 2-10% conversion rate
      lastUpdated: new Date(),
      trendDirection: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    };
  }

  private getDefaultPerformanceMetrics(screenId: string): ScreenPerformanceMetrics {
    return {
      screenId,
      bookingRate: 1.0,
      averageRating: 3.5,
      engagementScore: 50,
      revenueGenerated: 1000000,
      impressionCount: 1000,
      conversionRate: 0.05,
      lastUpdated: new Date(),
      trendDirection: 'stable'
    };
  }

  private calculateAveragePrice(screens: Screen[]): number {
    if (screens.length === 0) return 0;
    const total = screens.reduce((sum, screen) => sum + screen.price, 0);
    return total / screens.length;
  }

  private getTopCategories(screens: Screen[]): string[] {
    const categoryCount = new Map<string, number>();
    
    screens.forEach(screen => {
      const category = screen.category.name;
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    return Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);
  }

  private calculateSeasonalTrends(bookings: BookingActivity[]): Record<string, number> {
    const monthlyBookings = new Map<string, number>();
    
    bookings.forEach(booking => {
      const month = booking.timestamp.toLocaleString('default', { month: 'long' });
      monthlyBookings.set(month, (monthlyBookings.get(month) || 0) + 1);
    });

    return Object.fromEntries(monthlyBookings);
  }

  private calculateCompetitiveIndex(screens: Screen[]): number {
    // Simple competitive index based on screen density and price variation
    const priceVariation = this.calculatePriceVariation(screens);
    const density = screens.length / 100; // Normalize by arbitrary base
    
    return Math.min((priceVariation + density) / 2, 1);
  }

  private calculatePriceVariation(screens: Screen[]): number {
    if (screens.length < 2) return 0;
    
    const prices = screens.map(s => s.price);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.min(standardDeviation / mean, 1); // Coefficient of variation, capped at 1
  }

  private calculateMarketGrowthRate(bookings: BookingActivity[]): number {
    if (bookings.length < 2) return 0;
    
    // Sort bookings by date
    const sortedBookings = bookings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Compare first and last week
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const firstWeek = sortedBookings.filter(b => now - b.timestamp.getTime() > oneWeekMs * 3);
    const lastWeek = sortedBookings.filter(b => now - b.timestamp.getTime() <= oneWeekMs);
    
    if (firstWeek.length === 0) return 0;
    
    return (lastWeek.length - firstWeek.length) / firstWeek.length;
  }

  private getDefaultMarketInsights(location?: string): MarketInsights {
    return {
      location: location || 'All Markets',
      totalScreens: 0,
      averagePrice: 0,
      topCategories: [],
      seasonalTrends: {},
      competitiveIndex: 0.5,
      growthRate: 0,
      lastUpdated: new Date()
    };
  }

  private getFallbackTrendingScreens(location?: string): TrendingScreen[] {
    // Return empty array as fallback - in a real app, you might return cached data
    return [];
  }

  private async getScreensData(location?: string): Promise<Screen[]> {
    // This would typically fetch from your screens API
    // For now, we'll import from demo data
    try {
      const { demoScreens } = await import('../../../data/demoScreens');
      let screens = demoScreens as Screen[];
      
      if (location) {
        screens = screens.filter(screen => 
          screen.location.toLowerCase().includes(location.toLowerCase()) ||
          screen.locationDetails?.city.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      return screens;
    } catch (error) {
      console.error('Error loading screens data:', error);
      return [];
    }
  }
}

// Export singleton instance with shared cache service
import { cacheService } from './CacheService';
export const marketDataService = new MarketDataServiceImpl(cacheService);