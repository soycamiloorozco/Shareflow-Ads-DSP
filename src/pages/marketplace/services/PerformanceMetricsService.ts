/**
 * Performance Metrics Service
 * Handles screen performance scoring, trending calculations, and engagement metrics
 * for intelligent marketplace grouping
 */

import {
  ScreenPerformanceMetrics,
  BookingActivity,
  ScreenEngagementMetrics,
  UserInteraction,
  BookingFrequency,
  getBookingFrequency
} from '../types/intelligent-grouping.types';
import { Screen } from '../types/marketplace.types';

export interface PerformanceCalculationConfig {
  bookingWeight: number;
  ratingWeight: number;
  engagementWeight: number;
  revenueWeight: number;
  trendWeight: number;
}

export interface TrendingCalculationConfig {
  velocityWeight: number;
  growthWeight: number;
  consistencyWeight: number;
  recentWeight: number;
}

export interface EngagementTrackingData {
  screenId: string;
  interactions: UserInteraction[];
  viewDuration: number;
  clickThroughRate: number;
  conversionEvents: number;
  shareCount: number;
  favoriteCount: number;
}

/**
 * Service for calculating and managing screen performance metrics
 */
export class PerformanceMetricsService {
  private readonly defaultPerformanceConfig: PerformanceCalculationConfig = {
    bookingWeight: 0.3,
    ratingWeight: 0.25,
    engagementWeight: 0.25,
    revenueWeight: 0.15,
    trendWeight: 0.05
  };

  private readonly defaultTrendingConfig: TrendingCalculationConfig = {
    velocityWeight: 0.4,
    growthWeight: 0.3,
    consistencyWeight: 0.2,
    recentWeight: 0.1
  };

  /**
   * Calculate comprehensive performance score for a screen
   */
  calculatePerformanceScore(
    screen: Screen,
    bookings: BookingActivity[],
    interactions: UserInteraction[],
    config: PerformanceCalculationConfig = this.defaultPerformanceConfig
  ): number {
    const bookingScore = this.calculateBookingScore(screen.id, bookings);
    const ratingScore = this.normalizeRating(screen.rating);
    const engagementScore = this.calculateEngagementScore(screen.id, interactions);
    const revenueScore = this.calculateRevenueScore(screen.id, bookings);
    const trendScore = this.calculateTrendScore(screen.id, bookings);

    return (
      bookingScore * config.bookingWeight +
      ratingScore * config.ratingWeight +
      engagementScore * config.engagementWeight +
      revenueScore * config.revenueWeight +
      trendScore * config.trendWeight
    );
  }

  /**
   * Calculate trending score based on booking velocity and growth patterns
   */
  calculateTrendingScore(
    screenId: string,
    bookings: BookingActivity[],
    timeframe: number = 7,
    config: TrendingCalculationConfig = this.defaultTrendingConfig
  ): number {
    const screenBookings = bookings.filter(b => b.screenId === screenId);
    
    if (screenBookings.length === 0) return 0;

    const velocityScore = this.calculateVelocityScore(screenBookings, timeframe);
    const growthScore = this.calculateGrowthScore(screenBookings, timeframe);
    const consistencyScore = this.calculateConsistencyScore(screenBookings, timeframe);
    const recentActivityScore = this.calculateRecentActivityScore(screenBookings);

    return (
      velocityScore * config.velocityWeight +
      growthScore * config.growthWeight +
      consistencyScore * config.consistencyWeight +
      recentActivityScore * config.recentWeight
    );
  }

  /**
   * Calculate detailed engagement metrics for a screen
   */
  calculateEngagementMetrics(
    screenId: string,
    interactions: UserInteraction[],
    bookings: BookingActivity[]
  ): ScreenEngagementMetrics {
    const screenInteractions = interactions.filter(i => i.screenId === screenId);
    const screenBookings = bookings.filter(b => b.screenId === screenId);

    // Calculate various engagement metrics
    const viewTime = this.calculateAverageViewTime(screenInteractions);
    const interactionRate = this.calculateInteractionRate(screenInteractions);
    const completionRate = this.calculateCompletionRate(screenInteractions, screenBookings);
    const shareRate = this.calculateShareRate(screenInteractions);
    const favoriteRate = this.calculateFavoriteRate(screenInteractions);
    const clickThroughRate = this.calculateClickThroughRate(screenInteractions);
    const bounceRate = this.calculateBounceRate(screenInteractions);

    return {
      viewTime,
      interactionRate,
      completionRate,
      shareRate,
      favoriteRate,
      clickThroughRate,
      bounceRate
    };
  }

  /**
   * Generate comprehensive performance metrics for a screen
   */
  async generateScreenPerformanceMetrics(
    screen: Screen,
    bookings: BookingActivity[],
    interactions: UserInteraction[]
  ): Promise<ScreenPerformanceMetrics> {
    const screenBookings = bookings.filter(b => b.screenId === screen.id);
    const screenInteractions = interactions.filter(i => i.screenId === screen.id);

    // Calculate core metrics
    const bookingRate = this.calculateBookingRate(screen.id, bookings);
    const engagementScore = this.calculateEngagementScore(screen.id, interactions);
    const revenueGenerated = this.calculateTotalRevenue(screenBookings);
    const impressionCount = this.calculateImpressionCount(screen, screenInteractions);
    const conversionRate = this.calculateConversionRate(screenInteractions, screenBookings);
    const trendDirection = this.determineTrendDirection(screenBookings);

    return {
      screenId: screen.id,
      bookingRate,
      averageRating: screen.rating,
      engagementScore,
      revenueGenerated,
      impressionCount,
      conversionRate,
      lastUpdated: new Date(),
      trendDirection
    };
  }

  /**
   * Track and update engagement metrics in real-time
   */
  trackEngagementEvent(
    screenId: string,
    eventType: 'view' | 'click' | 'share' | 'favorite' | 'purchase',
    metadata: Record<string, unknown> = {}
  ): void {
    // In a real implementation, this would send data to analytics service
    const event = {
      screenId,
      eventType,
      timestamp: new Date(),
      metadata
    };

    // Log for debugging
    console.log('Engagement event tracked:', event);
    
    // Here you would typically:
    // 1. Send to analytics service
    // 2. Update real-time metrics
    // 3. Trigger metric recalculation if needed
  }

  // Private calculation methods

  private calculateBookingScore(screenId: string, bookings: BookingActivity[]): number {
    const screenBookings = bookings.filter(b => b.screenId === screenId);
    const bookingCount = screenBookings.length;
    
    // Normalize booking count (assuming max 50 bookings per week is excellent)
    return Math.min(bookingCount / 50, 1);
  }

  private normalizeRating(rating: number): number {
    // Normalize rating from 0-5 scale to 0-1 scale
    return rating / 5;
  }

  private calculateEngagementScore(screenId: string, interactions: UserInteraction[]): number {
    const screenInteractions = interactions.filter(i => i.screenId === screenId);
    
    if (screenInteractions.length === 0) return 0;

    // Weight different interaction types
    const weights = {
      view: 1,
      click: 2,
      favorite: 3,
      share: 4,
      purchase: 5
    };

    const totalScore = screenInteractions.reduce((sum, interaction) => {
      const weight = weights[interaction.action as keyof typeof weights] || 1;
      return sum + weight;
    }, 0);

    // Normalize by interaction count and max possible score
    const maxPossibleScore = screenInteractions.length * 5;
    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  }

  private calculateRevenueScore(screenId: string, bookings: BookingActivity[]): number {
    const screenBookings = bookings.filter(b => b.screenId === screenId);
    const totalRevenue = screenBookings.reduce((sum, booking) => sum + booking.price, 0);
    
    // Normalize revenue (assuming 10M COP per week is excellent)
    return Math.min(totalRevenue / 10000000, 1);
  }

  private calculateTrendScore(screenId: string, bookings: BookingActivity[]): number {
    const screenBookings = bookings.filter(b => b.screenId === screenId);
    
    if (screenBookings.length < 2) return 0.5; // Neutral trend for insufficient data

    // Sort by timestamp
    const sortedBookings = screenBookings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Compare recent vs older bookings
    const midPoint = Math.floor(sortedBookings.length / 2);
    const olderBookings = sortedBookings.slice(0, midPoint);
    const recentBookings = sortedBookings.slice(midPoint);
    
    if (olderBookings.length === 0) return 0.5;
    
    const growthRate = (recentBookings.length - olderBookings.length) / olderBookings.length;
    
    // Normalize growth rate to 0-1 scale
    return Math.max(0, Math.min(1, (growthRate + 1) / 2));
  }

  private calculateVelocityScore(bookings: BookingActivity[], timeframe: number): number {
    const bookingsPerDay = bookings.length / timeframe;
    
    // Normalize velocity (assuming 5 bookings per day is excellent)
    return Math.min(bookingsPerDay / 5, 1);
  }

  private calculateGrowthScore(bookings: BookingActivity[], timeframe: number): number {
    if (bookings.length < 2) return 0;

    const sortedBookings = bookings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const halfPoint = Math.floor(timeframe / 2);
    const cutoffTime = Date.now() - halfPoint * 24 * 60 * 60 * 1000;
    
    const earlierBookings = sortedBookings.filter(b => b.timestamp.getTime() < cutoffTime);
    const laterBookings = sortedBookings.filter(b => b.timestamp.getTime() >= cutoffTime);
    
    if (earlierBookings.length === 0) return 0.5;
    
    const growthRate = (laterBookings.length - earlierBookings.length) / earlierBookings.length;
    
    // Normalize growth rate
    return Math.max(0, Math.min(1, (growthRate + 1) / 2));
  }

  private calculateConsistencyScore(bookings: BookingActivity[], timeframe: number): number {
    if (bookings.length < timeframe) return 0;

    // Calculate daily booking counts
    const dailyCounts = new Array(timeframe).fill(0);
    const now = Date.now();
    
    bookings.forEach(booking => {
      const daysAgo = Math.floor((now - booking.timestamp.getTime()) / (24 * 60 * 60 * 1000));
      if (daysAgo >= 0 && daysAgo < timeframe) {
        dailyCounts[timeframe - 1 - daysAgo]++;
      }
    });

    // Calculate coefficient of variation (lower is more consistent)
    const mean = dailyCounts.reduce((sum, count) => sum + count, 0) / dailyCounts.length;
    if (mean === 0) return 0;
    
    const variance = dailyCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / dailyCounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;
    
    // Convert to consistency score (1 - normalized CV)
    return Math.max(0, 1 - Math.min(coefficientOfVariation, 1));
  }

  private calculateRecentActivityScore(bookings: BookingActivity[]): number {
    if (bookings.length === 0) return 0;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Weight recent bookings more heavily
    const weightedScore = bookings.reduce((sum, booking) => {
      const daysAgo = (now - booking.timestamp.getTime()) / oneDayMs;
      const weight = Math.max(0, 1 - daysAgo / 7); // Linear decay over 7 days
      return sum + weight;
    }, 0);

    // Normalize by booking count
    return Math.min(weightedScore / bookings.length, 1);
  }

  private calculateAverageViewTime(interactions: UserInteraction[]): number {
    const viewInteractions = interactions.filter(i => i.action === 'view');
    if (viewInteractions.length === 0) return 0;

    const totalViewTime = viewInteractions.reduce((sum, interaction) => {
      return sum + (interaction.metadata.duration || 0);
    }, 0);

    return totalViewTime / viewInteractions.length;
  }

  private calculateInteractionRate(interactions: UserInteraction[]): number {
    if (interactions.length === 0) return 0;

    const actionableInteractions = interactions.filter(i => 
      ['click', 'favorite', 'share', 'purchase'].includes(i.action)
    );

    return actionableInteractions.length / interactions.length;
  }

  private calculateCompletionRate(interactions: UserInteraction[], bookings: BookingActivity[]): number {
    const viewInteractions = interactions.filter(i => i.action === 'view');
    if (viewInteractions.length === 0) return 0;

    return bookings.length / viewInteractions.length;
  }

  private calculateShareRate(interactions: UserInteraction[]): number {
    const totalInteractions = interactions.length;
    if (totalInteractions === 0) return 0;

    const shareInteractions = interactions.filter(i => i.action === 'share');
    return shareInteractions.length / totalInteractions;
  }

  private calculateFavoriteRate(interactions: UserInteraction[]): number {
    const totalInteractions = interactions.length;
    if (totalInteractions === 0) return 0;

    const favoriteInteractions = interactions.filter(i => i.action === 'favorite');
    return favoriteInteractions.length / totalInteractions;
  }

  private calculateClickThroughRate(interactions: UserInteraction[]): number {
    const viewInteractions = interactions.filter(i => i.action === 'view');
    const clickInteractions = interactions.filter(i => i.action === 'click');
    
    if (viewInteractions.length === 0) return 0;
    
    return clickInteractions.length / viewInteractions.length;
  }

  private calculateBounceRate(interactions: UserInteraction[]): number {
    // Group interactions by session
    const sessionInteractions = new Map<string, UserInteraction[]>();
    
    interactions.forEach(interaction => {
      const sessionId = interaction.context.sessionId;
      if (!sessionInteractions.has(sessionId)) {
        sessionInteractions.set(sessionId, []);
      }
      sessionInteractions.get(sessionId)!.push(interaction);
    });

    if (sessionInteractions.size === 0) return 0;

    // Count sessions with only one interaction (bounces)
    const bounceSessions = Array.from(sessionInteractions.values()).filter(
      sessionInteractionList => sessionInteractionList.length === 1
    );

    return bounceSessions.length / sessionInteractions.size;
  }

  private calculateBookingRate(screenId: string, bookings: BookingActivity[]): number {
    const screenBookings = bookings.filter(b => b.screenId === screenId);
    const timeframe = 7; // days
    
    return screenBookings.length / timeframe;
  }

  private calculateTotalRevenue(bookings: BookingActivity[]): number {
    return bookings.reduce((sum, booking) => sum + booking.price, 0);
  }

  private calculateImpressionCount(screen: Screen, interactions: UserInteraction[]): number {
    // Use screen's daily views as base, adjust with actual interactions
    const baseImpressions = screen.views.daily;
    const interactionMultiplier = Math.max(1, interactions.length / 100); // Boost for high interaction
    
    return Math.floor(baseImpressions * interactionMultiplier);
  }

  private calculateConversionRate(interactions: UserInteraction[], bookings: BookingActivity[]): number {
    const viewInteractions = interactions.filter(i => i.action === 'view');
    if (viewInteractions.length === 0) return 0;

    return bookings.length / viewInteractions.length;
  }

  private determineTrendDirection(bookings: BookingActivity[]): 'up' | 'down' | 'stable' {
    if (bookings.length < 4) return 'stable';

    const sortedBookings = bookings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const midPoint = Math.floor(sortedBookings.length / 2);
    
    const earlierCount = sortedBookings.slice(0, midPoint).length;
    const laterCount = sortedBookings.slice(midPoint).length;
    
    const changeRatio = (laterCount - earlierCount) / earlierCount;
    
    if (changeRatio > 0.1) return 'up';
    if (changeRatio < -0.1) return 'down';
    return 'stable';
  }
}

// Export singleton instance
export const performanceMetricsService = new PerformanceMetricsService();