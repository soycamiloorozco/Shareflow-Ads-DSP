/**
 * Error Recovery Service
 * Implements graceful degradation and fallback mechanisms for intelligent grouping
 * Requirements: 1.3, 2.2
 */

import {
  EnhancedScreen,
  UserProfile,
  TrendingScreen,
  MarketplaceSection,
  SectionConfig,
  GroupingError,
  FallbackStrategy,
  ErrorRecoveryStrategy,
  createEmptyUserProfile,
  enhanceScreen
} from '../types/intelligent-grouping.types';
import { Screen } from '../types/marketplace.types';

export interface ErrorRecoveryConfig {
  readonly enableFallbacks: boolean;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly fallbackCacheTimeMs: number;
  readonly logErrors: boolean;
  readonly enableMetrics: boolean;
}

export interface FallbackCache {
  readonly popularScreens: EnhancedScreen[];
  readonly recentScreens: EnhancedScreen[];
  readonly defaultSections: MarketplaceSection[];
  readonly timestamp: number;
}

export interface ErrorMetrics {
  readonly totalErrors: number;
  readonly errorsByType: Record<string, number>;
  readonly fallbacksUsed: Record<string, number>;
  readonly recoverySuccessRate: number;
  readonly lastErrorTime: Date;
}

/**
 * Service for handling errors and implementing graceful degradation
 */
export class ErrorRecoveryService {
  private readonly config: ErrorRecoveryConfig;
  private readonly fallbackCache = new Map<string, FallbackCache>();
  private readonly errorLog: GroupingError[] = [];
  private readonly errorMetrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    fallbacksUsed: {},
    recoverySuccessRate: 0,
    lastErrorTime: new Date()
  };

  constructor(config?: Partial<ErrorRecoveryConfig>) {
    this.config = {
      enableFallbacks: true,
      maxRetries: 3,
      retryDelayMs: 1000,
      fallbackCacheTimeMs: 60 * 60 * 1000, // 1 hour
      logErrors: true,
      enableMetrics: true,
      ...config
    };
  }

  /**
   * Handle ML service failures with fallback to rule-based recommendations
   * Requirements: 1.3
   */
  async handleMLServiceFailure(
    userId?: string,
    location?: string,
    limit: number = 6
  ): Promise<EnhancedScreen[]> {
    try {
      this.logError('ML_SERVICE_FAILURE', 'ML recommendation service unavailable', 'handleMLServiceFailure', userId);
      
      // Try cached popular screens first
      const cached = this.getCachedFallback('popular', location);
      if (cached && cached.length > 0) {
        this.recordFallbackUsage('cached_popular');
        return cached.slice(0, limit);
      }

      // Fall back to rule-based recommendations
      const ruleBasedScreens = await this.generateRuleBasedRecommendations(userId, location, limit);
      if (ruleBasedScreens.length > 0) {
        this.recordFallbackUsage('rule_based');
        return ruleBasedScreens;
      }

      // Final fallback to popular screens
      const popularScreens = await this.getPopularScreensFallback(location, limit);
      this.recordFallbackUsage('popular_fallback');
      return popularScreens;

    } catch (error) {
      this.logError('FALLBACK_FAILURE', `ML service fallback failed: ${error}`, 'handleMLServiceFailure', userId);
      return [];
    }
  }

  /**
   * Handle user data unavailable scenarios
   * Requirements: 1.3, 2.2
   */
  async handleUserDataFailure(
    fallbackStrategy: 'anonymous' | 'popular' | 'location' = 'anonymous',
    location?: string
  ): Promise<UserProfile> {
    try {
      this.logError('USER_DATA_FAILURE', 'User data unavailable', 'handleUserDataFailure');

      switch (fallbackStrategy) {
        case 'anonymous':
          return this.createAnonymousUserProfile(location);
        
        case 'popular':
          return this.createPopularUserProfile(location);
        
        case 'location':
          return this.createLocationBasedProfile(location);
        
        default:
          return this.createAnonymousUserProfile(location);
      }
    } catch (error) {
      this.logError('USER_PROFILE_FALLBACK_FAILURE', `User profile fallback failed: ${error}`, 'handleUserDataFailure');
      return createEmptyUserProfile('fallback-user');
    }
  }

  /**
   * Handle market data service failures
   * Requirements: 1.3
   */
  async handleMarketDataFailure(
    location?: string,
    timeframe: number = 7
  ): Promise<TrendingScreen[]> {
    try {
      this.logError('MARKET_DATA_FAILURE', 'Market data service unavailable', 'handleMarketDataFailure');

      // Try cached trending data first
      const cached = this.getCachedFallback('trending', location);
      if (cached && cached.length > 0) {
        this.recordFallbackUsage('cached_trending');
        return this.convertToTrendingScreens(cached, timeframe);
      }

      // Fall back to static trending data
      const staticTrending = await this.getStaticTrendingData(location, timeframe);
      this.recordFallbackUsage('static_trending');
      return staticTrending;

    } catch (error) {
      this.logError('TRENDING_FALLBACK_FAILURE', `Market data fallback failed: ${error}`, 'handleMarketDataFailure');
      return [];
    }
  }

  /**
   * Implement default section configurations for edge cases
   * Requirements: 1.3, 2.2
   */
  async getDefaultSectionConfigurations(
    userId?: string,
    location?: string
  ): Promise<SectionConfig[]> {
    try {
      const defaultConfigs: SectionConfig[] = [
        {
          id: 'fallback-popular',
          name: 'Popular Screens',
          description: 'Most viewed screens in your area',
          algorithm: 'trending-analysis',
          priority: 1,
          maxScreens: 8,
          minScreens: 3,
          refreshInterval: 3600000, // 1 hour
          enabled: true,
          displayConfig: {
            displayType: 'grid',
            cardSize: 'medium',
            showMetadata: true,
            maxVisible: 8
          },
          conditions: {
            requiresLogin: false,
            minUserInteractions: 0,
            minPurchaseHistory: 0,
            enabledForAnonymous: true
          },
          targetAudience: ['all'],
          metadata: {
            isFallback: true,
            fallbackReason: 'Default configuration for service failures'
          }
        },
        {
          id: 'fallback-recent',
          name: 'Recently Added',
          description: 'New screens available for booking',
          algorithm: 'recent-activity',
          priority: 2,
          maxScreens: 6,
          minScreens: 2,
          refreshInterval: 1800000, // 30 minutes
          enabled: true,
          displayConfig: {
            displayType: 'horizontal-scroll',
            cardSize: 'medium',
            showMetadata: true,
            maxVisible: 6
          },
          conditions: {
            requiresLogin: false,
            minUserInteractions: 0,
            minPurchaseHistory: 0,
            enabledForAnonymous: true
          },
          targetAudience: ['all'],
          metadata: {
            isFallback: true,
            fallbackReason: 'Default configuration for service failures'
          }
        }
      ];

      // Add location-specific section if location is available
      if (location) {
        defaultConfigs.push({
          id: 'fallback-location',
          name: `Screens in ${location}`,
          description: `Available screens in ${location}`,
          algorithm: 'geographic-popularity',
          priority: 3,
          maxScreens: 6,
          minScreens: 2,
          refreshInterval: 3600000,
          enabled: true,
          displayConfig: {
            displayType: 'grid',
            cardSize: 'medium',
            showMetadata: true,
            maxVisible: 6
          },
          conditions: {
            requiresLogin: false,
            minUserInteractions: 0,
            minPurchaseHistory: 0,
            enabledForAnonymous: true
          },
          targetAudience: ['all'],
          metadata: {
            isFallback: true,
            fallbackReason: 'Location-based fallback configuration'
          }
        });
      }

      return defaultConfigs;
    } catch (error) {
      this.logError('DEFAULT_CONFIG_FAILURE', `Failed to create default configurations: ${error}`, 'getDefaultSectionConfigurations', userId);
      return [];
    }
  }

  /**
   * Execute operation with retry logic and fallback
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    context: string,
    userId?: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.maxRetries) {
          // Wait before retry
          await this.delay(this.config.retryDelayMs * attempt);
          continue;
        }
      }
    }

    // All retries failed, use fallback
    this.logError('RETRY_EXHAUSTED', `All retries failed for ${context}: ${lastError}`, context, userId);
    
    try {
      const result = await fallback();
      this.recordFallbackUsage(context);
      return result;
    } catch (fallbackError) {
      this.logError('FALLBACK_FAILED', `Fallback failed for ${context}: ${fallbackError}`, context, userId);
      throw fallbackError;
    }
  }

  /**
   * Cache fallback data for future use
   */
  async cacheFallbackData(
    type: 'popular' | 'recent' | 'trending',
    location?: string,
    data: EnhancedScreen[]
  ): Promise<void> {
    const cacheKey = `${type}_${location || 'all'}`;
    
    const fallbackCache: FallbackCache = {
      popularScreens: type === 'popular' ? data : [],
      recentScreens: type === 'recent' ? data : [],
      defaultSections: [],
      timestamp: Date.now()
    };

    this.fallbackCache.set(cacheKey, fallbackCache);
  }

  /**
   * Get error metrics for monitoring
   */
  getErrorMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 50): GroupingError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log and reset metrics
   */
  clearErrorLog(): void {
    this.errorLog.length = 0;
    this.errorMetrics.totalErrors = 0;
    this.errorMetrics.errorsByType = {};
    this.errorMetrics.fallbacksUsed = {};
  }

  // Private helper methods

  private async generateRuleBasedRecommendations(
    userId?: string,
    location?: string,
    limit: number = 6
  ): Promise<EnhancedScreen[]> {
    try {
      // Get all available screens
      const screens = await this.getAllScreens();
      
      // Apply simple rule-based filtering
      let filteredScreens = screens;

      // Filter by location if specified
      if (location) {
        filteredScreens = screens.filter(screen => 
          screen.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Sort by rating and views (simple popularity)
      const scoredScreens = filteredScreens.map(screen => ({
        screen,
        score: (screen.rating * 0.6) + (Math.log(screen.views.daily + 1) * 0.4)
      }));

      scoredScreens.sort((a, b) => b.score - a.score);

      // Enhance screens with basic performance metrics
      const enhancedScreens: EnhancedScreen[] = [];
      for (const { screen } of scoredScreens.slice(0, limit)) {
        const enhanced = enhanceScreen(screen, {
          screenId: screen.id,
          bookingRate: screen.rating * 2,
          averageRating: screen.rating,
          engagementScore: Math.min(screen.views.daily / 100, 100),
          revenueGenerated: screen.price * 10,
          impressionCount: screen.views.daily,
          conversionRate: 0.05,
          lastUpdated: new Date(),
          trendDirection: 'stable'
        });
        enhancedScreens.push(enhanced);
      }

      return enhancedScreens;
    } catch (error) {
      console.error('Rule-based recommendations failed:', error);
      return [];
    }
  }

  private async getPopularScreensFallback(location?: string, limit: number = 6): Promise<EnhancedScreen[]> {
    try {
      const screens = await this.getAllScreens();
      
      let filteredScreens = screens;
      if (location) {
        filteredScreens = screens.filter(screen => 
          screen.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Sort by rating and return top screens
      const topScreens = filteredScreens
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);

      return topScreens.map(screen => enhanceScreen(screen, {
        screenId: screen.id,
        bookingRate: screen.rating * 1.5,
        averageRating: screen.rating,
        engagementScore: 60,
        revenueGenerated: screen.price * 8,
        impressionCount: screen.views.daily,
        conversionRate: 0.04,
        lastUpdated: new Date(),
        trendDirection: 'stable'
      }));
    } catch (error) {
      console.error('Popular screens fallback failed:', error);
      return [];
    }
  }

  private createAnonymousUserProfile(location?: string): UserProfile {
    return {
      userId: 'anonymous-user',
      preferredCategories: [
        { categoryId: 'outdoor', score: 70, name: 'Outdoor' },
        { categoryId: 'digital', score: 60, name: 'Digital' }
      ],
      budgetRange: { min: 50000, max: 500000 },
      locationPreferences: location ? [
        { city: location, score: 80, region: location }
      ] : [],
      behaviorScore: 50,
      lastActivity: new Date(),
      interactionHistory: {
        totalInteractions: 0,
        categories: {},
        locations: {},
        priceRanges: {},
        timePatterns: {}
      },
      purchaseProfile: {
        totalPurchases: 0,
        averageOrderValue: 0,
        preferredCategories: [],
        seasonalPatterns: {},
        lastPurchaseDate: null
      }
    };
  }

  private createPopularUserProfile(location?: string): UserProfile {
    return {
      userId: 'popular-user',
      preferredCategories: [
        { categoryId: 'outdoor', score: 85, name: 'Outdoor' },
        { categoryId: 'digital', score: 75, name: 'Digital' },
        { categoryId: 'transit', score: 65, name: 'Transit' }
      ],
      budgetRange: { min: 100000, max: 1000000 },
      locationPreferences: location ? [
        { city: location, score: 90, region: location }
      ] : [],
      behaviorScore: 75,
      lastActivity: new Date(),
      interactionHistory: {
        totalInteractions: 50,
        categories: { 'outdoor': 20, 'digital': 15, 'transit': 15 },
        locations: location ? { [location]: 30 } : {},
        priceRanges: { 'medium': 25, 'high': 25 },
        timePatterns: { 'morning': 20, 'afternoon': 30 }
      },
      purchaseProfile: {
        totalPurchases: 5,
        averageOrderValue: 250000,
        preferredCategories: ['outdoor', 'digital'],
        seasonalPatterns: { 'Q1': 2, 'Q2': 1, 'Q3': 1, 'Q4': 1 },
        lastPurchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      }
    };
  }

  private createLocationBasedProfile(location?: string): UserProfile {
    if (!location) {
      return this.createAnonymousUserProfile();
    }

    return {
      userId: `location-user-${location.toLowerCase()}`,
      preferredCategories: [
        { categoryId: 'outdoor', score: 80, name: 'Outdoor' },
        { categoryId: 'digital', score: 70, name: 'Digital' }
      ],
      budgetRange: { min: 75000, max: 750000 },
      locationPreferences: [
        { city: location, score: 95, region: location }
      ],
      behaviorScore: 65,
      lastActivity: new Date(),
      interactionHistory: {
        totalInteractions: 25,
        categories: { 'outdoor': 15, 'digital': 10 },
        locations: { [location]: 25 },
        priceRanges: { 'medium': 20, 'low': 5 },
        timePatterns: { 'afternoon': 15, 'evening': 10 }
      },
      purchaseProfile: {
        totalPurchases: 2,
        averageOrderValue: 150000,
        preferredCategories: ['outdoor'],
        seasonalPatterns: { 'Q2': 1, 'Q4': 1 },
        lastPurchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      }
    };
  }

  private async getStaticTrendingData(location?: string, timeframe: number = 7): Promise<TrendingScreen[]> {
    try {
      const screens = await this.getAllScreens();
      
      let filteredScreens = screens;
      if (location) {
        filteredScreens = screens.filter(screen => 
          screen.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Create static trending data based on screen properties
      return filteredScreens
        .sort((a, b) => (b.rating * b.views.daily) - (a.rating * a.views.daily))
        .slice(0, 10)
        .map(screen => ({
          screen: enhanceScreen(screen, {
            screenId: screen.id,
            bookingRate: screen.rating * 1.8,
            averageRating: screen.rating,
            engagementScore: Math.min(screen.views.daily / 50, 100),
            revenueGenerated: screen.price * 12,
            impressionCount: screen.views.daily,
            conversionRate: 0.06,
            lastUpdated: new Date(),
            trendDirection: 'up'
          }),
          bookingVelocity: screen.rating * 0.5,
          purchaseVelocity: screen.rating * 0.4,
          trendScore: screen.rating / 5,
          bookingCount: Math.floor(screen.views.daily / 100),
          recentPurchases: Math.floor(screen.views.daily / 200),
          timeframe: `${timeframe}d`,
          growthRate: 0.1,
          rankChange: Math.floor(Math.random() * 5) - 2
        }));
    } catch (error) {
      console.error('Static trending data failed:', error);
      return [];
    }
  }

  private convertToTrendingScreens(screens: EnhancedScreen[], timeframe: number): TrendingScreen[] {
    return screens.map(screen => ({
      screen,
      bookingVelocity: screen.trendingScore || 0.5,
      purchaseVelocity: (screen.trendingScore || 0.5) * 0.8,
      trendScore: screen.trendingScore || 0.5,
      bookingCount: Math.floor((screen.performanceMetrics.impressionCount || 1000) / 100),
      recentPurchases: Math.floor((screen.performanceMetrics.impressionCount || 1000) / 200),
      timeframe: `${timeframe}d`,
      growthRate: 0.05,
      rankChange: 0
    }));
  }

  private getCachedFallback(type: string, location?: string): EnhancedScreen[] | null {
    const cacheKey = `${type}_${location || 'all'}`;
    const cached = this.fallbackCache.get(cacheKey);
    
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.config.fallbackCacheTimeMs) {
      this.fallbackCache.delete(cacheKey);
      return null;
    }

    switch (type) {
      case 'popular':
        return cached.popularScreens;
      case 'recent':
        return cached.recentScreens;
      case 'trending':
        return cached.popularScreens; // Use popular as trending fallback
      default:
        return null;
    }
  }

  private async getAllScreens(): Promise<Screen[]> {
    try {
      const { demoScreens } = await import('../../../data/demoScreens');
      return demoScreens as Screen[];
    } catch (error) {
      console.error('Failed to load screens data:', error);
      return [];
    }
  }

  private logError(code: string, message: string, context: string, userId?: string): void {
    const error: GroupingError = {
      code,
      message,
      context,
      timestamp: new Date(),
      userId,
      recoveryStrategy: this.getRecoveryStrategy(code)
    };

    if (this.config.logErrors) {
      this.errorLog.push(error);
      
      // Keep only last 1000 errors
      if (this.errorLog.length > 1000) {
        this.errorLog.splice(0, this.errorLog.length - 1000);
      }
    }

    if (this.config.enableMetrics) {
      this.updateErrorMetrics(code);
    }

    console.error(`[ErrorRecovery] ${code}: ${message}`, { context, userId });
  }

  private updateErrorMetrics(errorCode: string): void {
    this.errorMetrics.totalErrors++;
    this.errorMetrics.errorsByType[errorCode] = (this.errorMetrics.errorsByType[errorCode] || 0) + 1;
    this.errorMetrics.lastErrorTime = new Date();
    
    // Calculate recovery success rate
    const totalFallbacks = Object.values(this.errorMetrics.fallbacksUsed).reduce((sum, count) => sum + count, 0);
    this.errorMetrics.recoverySuccessRate = totalFallbacks > 0 ? totalFallbacks / this.errorMetrics.totalErrors : 0;
  }

  private recordFallbackUsage(fallbackType: string): void {
    if (this.config.enableMetrics) {
      this.errorMetrics.fallbacksUsed[fallbackType] = (this.errorMetrics.fallbacksUsed[fallbackType] || 0) + 1;
    }
  }

  private getRecoveryStrategy(errorCode: string): string {
    const strategies: Record<string, string> = {
      'ML_SERVICE_FAILURE': 'Use rule-based recommendations and cached data',
      'USER_DATA_FAILURE': 'Create anonymous or location-based user profile',
      'MARKET_DATA_FAILURE': 'Use cached trending data or static fallbacks',
      'SECTION_GENERATION_FAILED': 'Use default section configurations',
      'FALLBACK_FAILURE': 'Log error and return empty results',
      'RETRY_EXHAUSTED': 'Execute fallback strategy',
      'DEFAULT_CONFIG_FAILURE': 'Return minimal section configuration'
    };
    
    return strategies[errorCode] || 'Log error and continue with degraded functionality';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const errorRecoveryService = new ErrorRecoveryService({
  enableFallbacks: true,
  logErrors: true,
  enableMetrics: true,
  maxRetries: 2
});