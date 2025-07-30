/**
 * Grouping Engine
 * Main orchestration service that coordinates all recommendation services
 * to generate intelligent marketplace sections
 */

import {
  MarketplaceSection,
  EnhancedScreen,
  UserProfile,
  SectionConfig,
  GroupingAnalytics,
  GroupingError,
  FallbackStrategy,
  AlgorithmType,
  SectionMetadata,
  UserContext,
  RecommendationService as IRecommendationService,
  MarketDataService,
  DeduplicationEngine as IDeduplicationEngine,
  createEmptyUserProfile,
  enhanceScreen
} from '../types/intelligent-grouping.types';
import { Screen } from '../types/marketplace.types';
import { RecommendationService } from './RecommendationServiceSimple';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';
import { MarketDataServiceImpl } from './MarketDataService';
import { DeduplicationEngine } from './DeduplicationEngine';
import { UserPreferenceAnalyzer } from './UserPreferenceAnalyzer';
import { SectionConfigManager } from './SectionConfigManager';
import { ErrorRecoveryService } from './ErrorRecoveryService';
import { ErrorLoggingService } from './ErrorLoggingService';
import { CacheService } from './CacheService';

export interface GroupingEngineConfig {
  readonly enableCaching: boolean;
  readonly cacheTimeoutMs: number;
  readonly maxSectionsPerUser: number;
  readonly fallbackStrategy: 'popular' | 'recent' | 'cached' | 'empty';
  readonly enableAnalytics: boolean;
  readonly debugMode: boolean;
}

export interface SectionGenerationOptions {
  readonly userId?: string;
  readonly location?: string;
  readonly maxSections?: number;
  readonly forceRefresh?: boolean;
  readonly includeAnalytics?: boolean;
  readonly customSections?: string[];
}

export interface GroupingResult {
  readonly sections: MarketplaceSection[];
  readonly analytics: GroupingAnalytics;
  readonly fallbackUsed: boolean;
  readonly processingTime: number;
  readonly cacheHit: boolean;
  readonly errors: GroupingError[];
}

/**
 * Main orchestration service for intelligent marketplace grouping
 */
export class GroupingEngine {
  private readonly config: GroupingEngineConfig;
  private readonly recommendationService: IRecommendationService;
  private readonly marketDataService: MarketDataService;
  private readonly deduplicationEngine: IDeduplicationEngine;
  private readonly behaviorAnalytics: UserBehaviorAnalytics;
  private readonly sectionConfigManager: SectionConfigManager;
  private readonly errorRecoveryService: ErrorRecoveryService;
  private readonly errorLoggingService: ErrorLoggingService;
  private readonly cacheService: CacheService;
  
  // Analytics
  private readonly analyticsBuffer: GroupingAnalytics[] = [];
  private readonly errorLog: GroupingError[] = [];

  constructor(
    behaviorAnalytics: UserBehaviorAnalytics,
    config?: Partial<GroupingEngineConfig>
  ) {
    this.config = {
      enableCaching: true,
      cacheTimeoutMs: 30 * 60 * 1000, // 30 minutes
      maxSectionsPerUser: 8,
      fallbackStrategy: 'popular',
      enableAnalytics: true,
      debugMode: false,
      ...config
    };

    this.behaviorAnalytics = behaviorAnalytics;
    
    // Initialize services
    const preferenceAnalyzer = new UserPreferenceAnalyzer(behaviorAnalytics);
    this.recommendationService = new RecommendationService(behaviorAnalytics, preferenceAnalyzer);
    this.marketDataService = new MarketDataServiceImpl();
    this.deduplicationEngine = new DeduplicationEngine();
    this.sectionConfigManager = new SectionConfigManager(behaviorAnalytics, {
      enableDynamicSections: true,
      enableAnalyticsTracking: this.config.enableAnalytics,
      debugMode: this.config.debugMode
    });
    this.errorRecoveryService = new ErrorRecoveryService({
      enableFallbacks: true,
      logErrors: this.config.debugMode,
      enableMetrics: this.config.enableAnalytics
    });
    this.errorLoggingService = new ErrorLoggingService({
      enableConsoleLogging: this.config.debugMode,
      enablePerformanceMonitoring: this.config.enableAnalytics,
      enableUserExperienceTracking: this.config.enableAnalytics
    });
    this.cacheService = new CacheService({
      enableBackgroundRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      maxMemoryItems: 5000,
      defaultTTL: this.config.cacheTimeoutMs,
      enableMetrics: this.config.enableAnalytics
    });
  }

  /**
   * Generate intelligent sections for a user
   * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1
   */
  async generateSections(options: SectionGenerationOptions = {}): Promise<GroupingResult> {
    const startTime = Date.now();
    const sessionId = this.generateSessionId();
    let fallbackUsed = false;
    let cacheHit = false;
    const errors: GroupingError[] = [];

    try {
      // Check cache first
      if (this.config.enableCaching && !options.forceRefresh && options.userId) {
        const cacheStartTime = Date.now();
        const cached = await this.cacheService.getUserRecommendations(options.userId);
        this.errorLoggingService.logPerformanceMetrics('cacheOperation', Date.now() - cacheStartTime, {
          success: cached !== null,
          userId: options.userId,
          sessionId,
          metadata: { operation: 'getCachedSections', cacheHit: cached !== null }
        });
        
        if (cached) {
          cacheHit = true;
          return this.createGroupingResult(cached, sessionId, startTime, true, false, []);
        }
      }

      // Get section configurations
      const configStartTime = Date.now();
      const sectionConfigs = await this.sectionConfigManager.getSectionConfigs(options.userId, options.location);
      this.errorLoggingService.logPerformanceMetrics('sectionGeneration', Date.now() - configStartTime, {
        success: true,
        userId: options.userId,
        sessionId,
        metadata: { operation: 'getSectionConfigs', configCount: sectionConfigs.length }
      });
      
      // Generate sections based on configurations
      const sections: MarketplaceSection[] = [];
      
      for (const config of sectionConfigs) {
        const sectionStartTime = Date.now();
        try {
          const section = await this.generateSection(config, options);
          const sectionDuration = Date.now() - sectionStartTime;
          
          this.errorLoggingService.logPerformanceMetrics('sectionGeneration', sectionDuration, {
            success: section !== null,
            userId: options.userId,
            sessionId,
            metadata: { 
              sectionId: config.id, 
              algorithm: config.algorithm,
              screenCount: section?.screens.length || 0
            }
          });
          
          if (section && section.screens.length >= config.minScreens) {
            sections.push(section);
          }
        } catch (error) {
          const sectionDuration = Date.now() - sectionStartTime;
          
          // Log section generation error with comprehensive context
          this.errorLoggingService.logSectionGenerationError(error as Error, {
            userId: options.userId,
            sessionId,
            sectionId: config.id,
            algorithm: config.algorithm,
            duration: sectionDuration,
            screenCount: 0
          });
          
          const groupingError = this.createError(
            'SECTION_GENERATION_FAILED',
            `Failed to generate section ${config.id}: ${error}`,
            'generateSection',
            options.userId
          );
          errors.push(groupingError);
          this.logError(groupingError);
        }
      }

      // Apply deduplication
      let deduplicatedSections: MarketplaceSection[] = [];
      try {
        const availableScreens = await this.getAllAvailableScreens();
        deduplicatedSections = await this.deduplicationEngine.removeDuplicates(sections);
        deduplicatedSections = await this.deduplicationEngine.backfillSections(deduplicatedSections, availableScreens);
      } catch (error) {
        const groupingError = this.createError(
          'DEDUPLICATION_FAILED',
          `Deduplication failed: ${error}`,
          'deduplication',
          options.userId
        );
        errors.push(groupingError);
        this.logError(groupingError);
        deduplicatedSections = sections; // Use original sections as fallback
      }

      // Apply fallback if no sections generated
      if (deduplicatedSections.length === 0) {
        deduplicatedSections = await this.applyFallbackStrategy(options);
        fallbackUsed = true;
      }

      // Limit sections per user
      const finalSections = deduplicatedSections.slice(0, this.config.maxSectionsPerUser);

      // Cache results
      if (this.config.enableCaching && options.userId) {
        await this.cacheService.cacheUserRecommendations(options.userId, finalSections);
      }

      return this.createGroupingResult(finalSections, sessionId, startTime, cacheHit, fallbackUsed, errors);

    } catch (error) {
      const groupingError = this.createError(
        'GENERATION_FAILED',
        `Section generation failed: ${error}`,
        'generateSections',
        options.userId
      );
      errors.push(groupingError);
      this.logError(groupingError);

      // Apply fallback strategy
      const fallbackSections = await this.applyFallbackStrategy(options);
      return this.createGroupingResult(fallbackSections, sessionId, startTime, false, true, errors);
    }
  }

  /**
   * Refresh sections for a user
   */
  async refreshSections(userId: string): Promise<void> {
    try {
      // Clear cache
      await this.cacheService.clearUserCache(userId);
      
      // Regenerate sections
      await this.generateSections({ userId, forceRefresh: true });
      
      this.debug(`Sections refreshed for user ${userId}`);
    } catch (error) {
      const groupingError = this.createError(
        'REFRESH_FAILED',
        `Failed to refresh sections for user ${userId}: ${error}`,
        'refreshSections',
        userId
      );
      this.logError(groupingError);
      throw error;
    }
  }

  /**
   * Get section metrics for analytics
   */
  async getSectionMetrics(sectionId: string): Promise<any> {
    // Get metrics from section config manager
    const performanceMetrics = this.sectionConfigManager.getSectionPerformanceMetrics(sectionId);
    
    if (performanceMetrics) {
      return {
        sectionId: performanceMetrics.sectionId,
        impressions: performanceMetrics.impressions,
        clicks: performanceMetrics.clicks,
        conversions: performanceMetrics.conversions,
        averageEngagementTime: performanceMetrics.averageEngagementTime,
        conversionRate: performanceMetrics.conversionRate,
        userSatisfactionScore: performanceMetrics.userSatisfactionScore,
        topPerformingScreens: [],
        userSegmentPerformance: {},
        timeframe: { start: new Date(), end: new Date() }
      };
    }

    // Fallback to basic metrics
    return {
      sectionId,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      averageEngagementTime: 0,
      topPerformingScreens: [],
      userSegmentPerformance: {},
      timeframe: { start: new Date(), end: new Date() }
    };
  }

  /**
   * Track section engagement for analytics
   * Requirements: 9.1
   */
  async trackSectionEngagement(engagement: import('../types/intelligent-grouping.types').SectionEngagement): Promise<void> {
    await this.sectionConfigManager.trackSectionEngagement(engagement);
  }

  /**
   * Update section configuration
   * Requirements: 2.2, 7.3
   */
  async updateSectionConfig(sectionId: string, updates: Partial<SectionConfig>): Promise<void> {
    await this.sectionConfigManager.updateSectionConfig(sectionId, updates);
    
    // Clear cache to force regeneration with new config
    await this.cacheService.invalidateByTags(['sections', `section:${sectionId}`]);
  }

  /**
   * Enable or disable a section dynamically
   * Requirements: 2.2
   */
  async toggleSection(sectionId: string, enabled: boolean): Promise<void> {
    await this.sectionConfigManager.toggleSection(sectionId, enabled);
    
    // Clear cache to force regeneration
    await this.cacheService.invalidateByTags(['sections']);
  }

  /**
   * Add dynamic rule for section management
   * Requirements: 2.2
   */
  addDynamicRule(rule: import('../types/intelligent-grouping.types').DynamicSectionRule): void {
    this.sectionConfigManager.addDynamicRule(rule);
    
    // Clear cache to apply new rule
    this.cacheService.invalidateByTags(['sections']);
  }

  /**
   * Remove dynamic rule
   * Requirements: 2.2
   */
  removeDynamicRule(ruleId: string): void {
    this.sectionConfigManager.removeDynamicRule(ruleId);
    
    // Clear cache to remove rule effects
    this.cacheService.invalidateByTags(['sections']);
  }

  /**
   * Get all section analytics
   * Requirements: 9.1
   */
  getAllSectionAnalytics(): Record<string, import('../types/intelligent-grouping.types').SectionEngagement[]> {
    return this.sectionConfigManager.getAllSectionAnalytics();
  }

  /**
   * Create user-specific section configuration
   * Requirements: 2.2, 7.3
   */
  async createUserSpecificConfig(
    userId: string, 
    baseSectionId: string, 
    customizations: Partial<SectionConfig>
  ): Promise<string> {
    const configId = await this.sectionConfigManager.createUserSpecificConfig(userId, baseSectionId, customizations);
    
    // Clear user cache to apply new config
    await this.cacheService.clearUserCache(userId);
    
    return configId;
  }

  /**
   * Get section metadata for debugging and analytics
   * Requirements: 9.1
   */
  getSectionMetadata(sectionId: string): SectionMetadata | null {
    return this.sectionConfigManager.getSectionMetadata(sectionId);
  }

  /**
   * Get analytics data
   */
  getAnalytics(): GroupingAnalytics[] {
    return [...this.analyticsBuffer];
  }

  /**
   * Get error log
   */
  getErrors(): GroupingError[] {
    return [...this.errorLog];
  }

  /**
   * Clear caches and cleanup
   */
  cleanup(): void {
    this.cacheService.shutdown();
    this.sectionConfigManager.cleanup();
    this.analyticsBuffer.length = 0;
    this.errorLog.length = 0;
  }

  // Private methods

  /**
   * Generate a single section based on configuration
   */
  private async generateSection(config: SectionConfig, options: SectionGenerationOptions): Promise<MarketplaceSection | null> {
    const userContext = this.createUserContext(options.userId, options.location);
    
    // Check if section conditions are met
    if (!await this.checkSectionConditions(config, options.userId)) {
      return null;
    }

    let screens: EnhancedScreen[] = [];

    try {
      // Generate screens based on algorithm type
      switch (config.algorithm) {
        case 'ml-personalized':
          screens = await this.generatePersonalizedSection(config, options);
          break;
        case 'trending-analysis':
          screens = await this.generateTrendingSection(config, options);
          break;
        case 'geographic-popularity':
          screens = await this.generateGeographicSection(config, options);
          break;
        case 'recent-activity':
          screens = await this.generateRecentActivitySection(config, options);
          break;
        case 'purchase-history':
          screens = await this.generatePurchaseHistorySection(config, options);
          break;
        case 'new-discovery':
          screens = await this.generateNewDiscoverySection(config, options);
          break;
        case 'other-users-buying':
          screens = await this.generateOtherUsersBuyingSection(config, options);
          break;
        case 'collaborative-filtering':
        case 'content-based':
          screens = await this.generateRecommendationSection(config, options);
          break;
        default:
          screens = await this.generateFallbackSection(config, options);
      }

      // Limit screens to max allowed
      screens = screens.slice(0, config.maxScreens);

      if (screens.length === 0) {
        return null;
      }

      // Create section metadata
      const metadata: SectionMetadata = {
        algorithm: config.algorithm,
        confidence: this.calculateSectionConfidence(screens),
        refreshInterval: config.refreshInterval,
        trackingId: this.generateTrackingId(config.id, options.userId),
        generatedAt: new Date(),
        userContext
      };

      return {
        id: config.id,
        title: config.name,
        subtitle: config.description,
        screens,
        displayType: config.displayConfig.displayType,
        priority: config.priority,
        metadata
      };

    } catch (error) {
      this.debug(`Failed to generate section ${config.id}: ${error}`);
      return null;
    }
  }

  /**
   * Generate personalized section using ML recommendations with error recovery
   */
  private async generatePersonalizedSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    const userId = options.userId || 'demo-user-anonymous';
    
    return await this.errorRecoveryService.executeWithRetry(
      async () => await this.recommendationService.getTopPicks(userId, config.maxScreens),
      async () => await this.errorRecoveryService.handleMLServiceFailure(userId, options.location, config.maxScreens),
      'generatePersonalizedSection',
      userId
    );
  }

  /**
   * Generate trending section with error recovery
   */
  private async generateTrendingSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    return await this.errorRecoveryService.executeWithRetry(
      async () => {
        const trendingScreens = await this.marketDataService.getTrendingScreens(options.location, 7);
        return trendingScreens.slice(0, config.maxScreens).map(trending => trending.screen);
      },
      async () => {
        const fallbackTrending = await this.errorRecoveryService.handleMarketDataFailure(options.location, 7);
        return fallbackTrending.slice(0, config.maxScreens).map(trending => trending.screen);
      },
      'generateTrendingSection',
      options.userId
    );
  }

  /**
   * Generate geographic popularity section
   */
  private async generateGeographicSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    if (!options.location) {
      return [];
    }

    return await this.marketDataService.getTopPerformingScreens(options.location, config.maxScreens);
  }

  /**
   * Generate recent activity section
   */
  private async generateRecentActivitySection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    const userId = options.userId || 'demo-user-anonymous';

    // Get user's recent interactions and find similar screens
    const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
    const recentInteractions = await this.behaviorAnalytics.getUserInteractions(userId);
    
    if (recentInteractions.length === 0) {
      // For demo purposes, return some popular screens as "recent activity"
      return await this.recommendationService.getTrendingScreens(options.location, config.maxScreens);
    }

    // Get screens from recent interactions
    const recentScreenIds = [...new Set(recentInteractions.slice(0, 10).map(i => i.screenId))];
    const screens: EnhancedScreen[] = [];

    for (const screenId of recentScreenIds) {
      try {
        const similarScreens = await this.recommendationService.getSimilarScreens(screenId, userId);
        screens.push(...similarScreens.slice(0, 2)); // Add 2 similar screens per recent screen
      } catch (error) {
        this.debug(`Failed to get similar screens for ${screenId}: ${error}`);
      }
    }

    return screens.slice(0, config.maxScreens);
  }

  /**
   * Generate purchase history section
   */
  private async generatePurchaseHistorySection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    const userId = options.userId || 'demo-user-anonymous';

    const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
    
    if (userProfile.purchaseProfile.totalPurchases === 0) {
      // For demo purposes, return some screens as if they were previously purchased
      return await this.recommendationService.getTrendingScreens(options.location, config.maxScreens);
    }

    // Get screens similar to previously purchased ones
    const purchaseInteractions = await this.behaviorAnalytics.getUserInteractions(userId);
    const purchasedScreenIds = purchaseInteractions
      .filter(i => i.action === 'purchase')
      .map(i => i.screenId);

    const screens: EnhancedScreen[] = [];
    for (const screenId of purchasedScreenIds.slice(0, 5)) {
      try {
        const similarScreens = await this.recommendationService.getSimilarScreens(screenId, userId);
        screens.push(...similarScreens.slice(0, 2));
      } catch (error) {
        this.debug(`Failed to get similar screens for purchased screen ${screenId}: ${error}`);
      }
    }

    return screens.slice(0, config.maxScreens);
  }

  /**
   * Generate new discovery section
   */
  private async generateNewDiscoverySection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    const userId = options.userId || 'demo-user-anonymous';
    return await this.recommendationService.getNewDiscoveries(userId, config.maxScreens);
  }

  /**
   * Generate "other users are buying most" section
   */
  private async generateOtherUsersBuyingSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    // Get trending screens based on recent purchase activity
    const trendingScreens = await this.marketDataService.getTrendingScreens(options.location, 7);
    
    // Filter and enhance with purchase velocity indicators
    const buyingTrendScreens = trendingScreens
      .filter(trending => trending.purchaseVelocity > 0)
      .slice(0, config.maxScreens)
      .map(trending => {
        const enhanced = trending.screen;
        // Add purchase velocity metadata
        enhanced.trendingScore = trending.purchaseVelocity;
        enhanced.metadata = {
          ...enhanced.metadata,
          purchaseVelocity: trending.purchaseVelocity,
          recentPurchases: trending.recentPurchases || 0,
          trendingIndicator: `${trending.recentPurchases || Math.floor(Math.random() * 10) + 1} bookings this week`
        };
        return enhanced;
      });

    return buyingTrendScreens;
  }

  /**
   * Generate recommendation section (collaborative/content-based)
   */
  private async generateRecommendationSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    if (!options.userId) {
      return [];
    }

    // Use personalized recommendations as base
    return await this.recommendationService.getTopPicks(options.userId, config.maxScreens);
  }

  /**
   * Generate fallback section with popular screens
   */
  private async generateFallbackSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    const trendingScreens = await this.marketDataService.getTrendingScreens(options.location);
    return trendingScreens.slice(0, config.maxScreens).map(trending => trending.screen);
  }



  /**
   * Check if section conditions are met
   */
  private async checkSectionConditions(config: SectionConfig, userId?: string): Promise<boolean> {
    if (config.conditions.requiresLogin && !userId) {
      return false;
    }

    if (userId && config.conditions.minUserInteractions > 0) {
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      if (userProfile.interactionHistory.totalInteractions < config.conditions.minUserInteractions) {
        return false;
      }
    }

    if (userId && config.conditions.minPurchaseHistory > 0) {
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      if (userProfile.purchaseProfile.totalPurchases < config.conditions.minPurchaseHistory) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply fallback strategy when section generation fails with error recovery
   */
  private async applyFallbackStrategy(options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    try {
      switch (this.config.fallbackStrategy) {
        case 'popular':
          return await this.generatePopularFallback(options);
        case 'recent':
          return await this.generateRecentFallback(options);
        case 'cached':
          return this.getCachedFallback(options.userId);
        default:
          // Use error recovery service for default configurations
          const defaultConfigs = await this.errorRecoveryService.getDefaultSectionConfigurations(options.userId, options.location);
          return await this.generateSectionsFromConfigs(defaultConfigs, options);
      }
    } catch (error) {
      this.debug(`Fallback strategy failed: ${error}`);
      // Final fallback - use error recovery service
      try {
        const defaultConfigs = await this.errorRecoveryService.getDefaultSectionConfigurations(options.userId, options.location);
        return await this.generateSectionsFromConfigs(defaultConfigs, options);
      } catch (finalError) {
        this.debug(`Final fallback failed: ${finalError}`);
        return [];
      }
    }
  }

  /**
   * Generate popular screens fallback
   */
  private async generatePopularFallback(options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    const trendingScreens = await this.marketDataService.getTrendingScreens(options.location, 7);
    
    if (trendingScreens.length === 0) {
      return [];
    }

    return [{
      id: 'fallback-popular',
      title: 'Popular screens',
      subtitle: 'Trending in your area',
      screens: trendingScreens.slice(0, 12).map(trending => trending.screen),
      displayType: 'grid',
      priority: 1,
      metadata: {
        algorithm: 'fallback-popular',
        confidence: 0.5,
        refreshInterval: 3600000,
        trackingId: this.generateTrackingId('fallback-popular', options.userId),
        generatedAt: new Date(),
        userContext: this.createUserContext(options.userId, options.location)
      }
    }];
  }

  /**
   * Generate recent screens fallback
   */
  private async generateRecentFallback(options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    // This would get recently added screens
    // For now, return empty array
    return [];
  }

  /**
   * Get cached fallback sections
   */
  private async getCachedFallback(userId?: string): Promise<MarketplaceSection[]> {
    if (!userId) return [];
    
    const cached = await this.cacheService.getUserRecommendations(userId);
    return cached || [];
  }

  /**
   * Generate sections from provided configurations
   */
  private async generateSectionsFromConfigs(configs: SectionConfig[], options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    const sections: MarketplaceSection[] = [];
    
    for (const config of configs) {
      try {
        const section = await this.generateSection(config, options);
        if (section && section.screens.length >= config.minScreens) {
          sections.push(section);
        }
      } catch (error) {
        this.debug(`Failed to generate section from config ${config.id}: ${error}`);
        // Continue with other sections
      }
    }
    
    return sections;
  }

  /**
   * Get all available screens for deduplication
   */
  private async getAllAvailableScreens(): Promise<EnhancedScreen[]> {
    try {
      // This would typically fetch from your screens API
      const { demoScreens } = await import('../../../data/demoScreens');
      const screens = demoScreens as Screen[];
      
      // Enhance screens with performance metrics
      const enhancedScreens: EnhancedScreen[] = [];
      for (const screen of screens) {
        try {
          const metrics = await this.marketDataService.getScreenPerformanceMetrics(screen.id);
          const enhanced = enhanceScreen(screen, metrics);
          enhancedScreens.push(enhanced);
        } catch (error) {
          this.debug(`Failed to enhance screen ${screen.id}: ${error}`);
        }
      }
      
      return enhancedScreens;
    } catch (error) {
      this.debug(`Failed to get available screens: ${error}`);
      return [];
    }
  }

  // Utility methods



  private calculateSectionConfidence(screens: EnhancedScreen[]): number {
    if (screens.length === 0) return 0;
    
    const avgScore = screens.reduce((sum, screen) => {
      const score = screen.personalizedScore || screen.trendingScore || screen.recommendationScore || 0.5;
      return sum + score;
    }, 0) / screens.length;
    
    return Math.min(avgScore, 1);
  }

  private createUserContext(userId?: string, location?: string): UserContext {
    return {
      userId,
      sessionId: this.generateSessionId(),
      location,
      deviceType: 'desktop', // This would be detected from request
      timestamp: new Date()
    };
  }

  private createGroupingResult(
    sections: MarketplaceSection[],
    sessionId: string,
    startTime: number,
    cacheHit: boolean,
    fallbackUsed: boolean,
    errors: GroupingError[]
  ): GroupingResult {
    const processingTime = Date.now() - startTime;
    
    const analytics: GroupingAnalytics = {
      sessionId,
      sectionsViewed: sections.map(s => s.id),
      totalEngagementTime: 0,
      sectionsEngagement: [],
      conversionPath: [],
      timestamp: new Date()
    };

    if (this.config.enableAnalytics) {
      this.analyticsBuffer.push(analytics);
    }

    return {
      sections,
      analytics,
      fallbackUsed,
      processingTime,
      cacheHit,
      errors
    };
  }

  private createError(code: string, message: string, context: string, userId?: string): GroupingError {
    return {
      code,
      message,
      context,
      timestamp: new Date(),
      userId,
      recoveryStrategy: this.getRecoveryStrategy(code)
    };
  }

  private getRecoveryStrategy(errorCode: string): string {
    const strategies: Record<string, string> = {
      'SECTION_GENERATION_FAILED': 'Use fallback section configuration',
      'DEDUPLICATION_FAILED': 'Skip deduplication and use original sections',
      'GENERATION_FAILED': 'Apply fallback strategy',
      'REFRESH_FAILED': 'Use cached sections if available'
    };
    
    return strategies[errorCode] || 'Log error and continue';
  }

  private logError(error: GroupingError): void {
    this.errorLog.push(error);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog.splice(0, this.errorLog.length - 100);
    }
    
    if (this.config.debugMode) {
      console.error('GroupingEngine Error:', error);
    }
  }

  private debug(message: string): void {
    if (this.config.debugMode) {
      console.debug(`[GroupingEngine] ${message}`);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateTrackingId(sectionId: string, userId?: string): string {
    const userPart = userId ? `_${userId}` : '';
    return `${sectionId}${userPart}_${Date.now()}`;
  }
}

// Export singleton instance
export const groupingEngine = new GroupingEngine(
  new UserBehaviorAnalytics(),
  {
    enableCaching: true,
    debugMode: process.env.NODE_ENV === 'development'
  }
);