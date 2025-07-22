/**
 * Section Configuration Manager
 * Manages section configurations, dynamic enabling/disabling, and metadata tracking
 */

import {
  SectionConfig,
  AlgorithmType,
  SectionDisplayType,
  UserProfile,
  SectionMetadata,
  GroupingAnalytics,
  SectionEngagement,
  TimeRestrictions,
  createEmptyUserProfile
} from '../types/intelligent-grouping.types';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';

export interface SectionConfigManagerOptions {
  readonly enableDynamicSections: boolean;
  readonly enableAnalyticsTracking: boolean;
  readonly configRefreshInterval: number;
  readonly debugMode: boolean;
}

export interface SectionPerformanceMetrics {
  readonly sectionId: string;
  readonly impressions: number;
  readonly clicks: number;
  readonly conversions: number;
  readonly averageEngagementTime: number;
  readonly conversionRate: number;
  readonly userSatisfactionScore: number;
  readonly lastUpdated: Date;
}

export interface DynamicSectionRule {
  readonly id: string;
  readonly condition: string;
  readonly action: 'enable' | 'disable' | 'modify';
  readonly targetSections: string[];
  readonly parameters?: Record<string, unknown>;
  readonly priority: number;
  readonly enabled: boolean;
}

/**
 * Manages section configurations and dynamic behavior
 */
export class SectionConfigManager {
  private readonly options: SectionConfigManagerOptions;
  private readonly behaviorAnalytics: UserBehaviorAnalytics;
  
  // Configuration storage
  private readonly sectionConfigs = new Map<string, SectionConfig>();
  private readonly userSpecificConfigs = new Map<string, Map<string, SectionConfig>>();
  private readonly dynamicRules = new Map<string, DynamicSectionRule>();
  
  // Performance tracking
  private readonly performanceMetrics = new Map<string, SectionPerformanceMetrics>();
  private readonly sectionAnalytics = new Map<string, SectionEngagement[]>();
  
  // Caching
  private readonly configCache = new Map<string, { configs: SectionConfig[]; timestamp: number }>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    behaviorAnalytics: UserBehaviorAnalytics,
    options?: Partial<SectionConfigManagerOptions>
  ) {
    this.behaviorAnalytics = behaviorAnalytics;
    this.options = {
      enableDynamicSections: true,
      enableAnalyticsTracking: true,
      configRefreshInterval: 15 * 60 * 1000, // 15 minutes
      debugMode: false,
      ...options
    };

    this.initializeDefaultConfigs();
    this.initializeDynamicRules();
  }

  /**
   * Get section configurations for a user
   * Requirements: 2.2, 7.3, 9.1
   */
  async getSectionConfigs(userId?: string, location?: string): Promise<SectionConfig[]> {
    const cacheKey = this.getCacheKey(userId, location);
    
    // Check cache first
    const cached = this.configCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.configs;
    }

    try {
      // Get base configurations
      let configs = this.getBaseConfigurations();
      
      // Apply user-specific modifications
      if (userId) {
        configs = await this.applyUserSpecificConfigs(configs, userId);
      }
      
      // Apply dynamic rules
      if (this.options.enableDynamicSections) {
        configs = await this.applyDynamicRules(configs, userId, location);
      }
      
      // Filter enabled configurations
      configs = configs.filter(config => config.enabled);
      
      // Sort by priority
      configs.sort((a, b) => b.priority - a.priority);
      
      // Cache results
      this.configCache.set(cacheKey, {
        configs,
        timestamp: Date.now()
      });
      
      this.debug(`Generated ${configs.length} section configs for user ${userId || 'anonymous'}`);
      
      return configs;
    } catch (error) {
      this.debug(`Error getting section configs: ${error}`);
      return this.getFallbackConfigs();
    }
  }

  /**
   * Update section configuration
   */
  async updateSectionConfig(sectionId: string, updates: Partial<SectionConfig>): Promise<void> {
    const existingConfig = this.sectionConfigs.get(sectionId);
    if (!existingConfig) {
      throw new Error(`Section config not found: ${sectionId}`);
    }

    const updatedConfig: SectionConfig = {
      ...existingConfig,
      ...updates
    };

    this.sectionConfigs.set(sectionId, updatedConfig);
    this.clearConfigCache();
    
    this.debug(`Updated section config: ${sectionId}`);
  }

  /**
   * Enable or disable a section
   */
  async toggleSection(sectionId: string, enabled: boolean): Promise<void> {
    await this.updateSectionConfig(sectionId, { enabled });
    this.debug(`Section ${sectionId} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Add dynamic rule for section management
   */
  addDynamicRule(rule: DynamicSectionRule): void {
    this.dynamicRules.set(rule.id, rule);
    this.clearConfigCache();
    this.debug(`Added dynamic rule: ${rule.id}`);
  }

  /**
   * Remove dynamic rule
   */
  removeDynamicRule(ruleId: string): void {
    this.dynamicRules.delete(ruleId);
    this.clearConfigCache();
    this.debug(`Removed dynamic rule: ${ruleId}`);
  }

  /**
   * Track section engagement for analytics
   */
  async trackSectionEngagement(engagement: SectionEngagement): Promise<void> {
    if (!this.options.enableAnalyticsTracking) {
      return;
    }

    const sectionEngagements = this.sectionAnalytics.get(engagement.sectionId) || [];
    sectionEngagements.push(engagement);
    
    // Keep only last 1000 engagements per section
    if (sectionEngagements.length > 1000) {
      sectionEngagements.splice(0, sectionEngagements.length - 1000);
    }
    
    this.sectionAnalytics.set(engagement.sectionId, sectionEngagements);
    
    // Update performance metrics
    await this.updatePerformanceMetrics(engagement.sectionId);
    
    this.debug(`Tracked engagement for section: ${engagement.sectionId}`);
  }

  /**
   * Get section performance metrics
   */
  getSectionPerformanceMetrics(sectionId: string): SectionPerformanceMetrics | null {
    return this.performanceMetrics.get(sectionId) || null;
  }

  /**
   * Get all section analytics
   */
  getAllSectionAnalytics(): Record<string, SectionEngagement[]> {
    const analytics: Record<string, SectionEngagement[]> = {};
    this.sectionAnalytics.forEach((engagements, sectionId) => {
      analytics[sectionId] = [...engagements];
    });
    return analytics;
  }

  /**
   * Create user-specific section configuration
   */
  async createUserSpecificConfig(
    userId: string, 
    baseSectionId: string, 
    customizations: Partial<SectionConfig>
  ): Promise<string> {
    const baseConfig = this.sectionConfigs.get(baseSectionId);
    if (!baseConfig) {
      throw new Error(`Base section config not found: ${baseSectionId}`);
    }

    const userConfigId = `${baseSectionId}-${userId}`;
    const userConfig: SectionConfig = {
      ...baseConfig,
      ...customizations,
      id: userConfigId
    };

    let userConfigs = this.userSpecificConfigs.get(userId);
    if (!userConfigs) {
      userConfigs = new Map();
      this.userSpecificConfigs.set(userId, userConfigs);
    }
    
    userConfigs.set(userConfigId, userConfig);
    this.clearConfigCache();
    
    this.debug(`Created user-specific config: ${userConfigId}`);
    return userConfigId;
  }

  /**
   * Get section metadata for debugging and analytics
   */
  getSectionMetadata(sectionId: string): SectionMetadata | null {
    const config = this.sectionConfigs.get(sectionId);
    if (!config) {
      return null;
    }

    return {
      algorithm: config.algorithm,
      confidence: 0.8, // This would be calculated based on performance
      refreshInterval: config.refreshInterval,
      trackingId: this.generateTrackingId(sectionId),
      generatedAt: new Date()
    };
  }

  /**
   * Cleanup old data and optimize performance
   */
  cleanup(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days of data

    // Clean old analytics data
    this.sectionAnalytics.forEach((engagements, sectionId) => {
      const filteredEngagements = engagements.filter(
        engagement => engagement.timestamp >= cutoffDate
      );
      this.sectionAnalytics.set(sectionId, filteredEngagements);
    });

    // Clear old cache entries
    this.configCache.clear();
    
    this.debug('Cleanup completed');
  }

  // Private methods

  /**
   * Initialize default section configurations
   */
  private initializeDefaultConfigs(): void {
    const defaultConfigs: SectionConfig[] = [
      {
        id: 'top-picks',
        name: 'Top picks for you',
        description: 'Personalized recommendations based on your preferences',
        algorithm: 'ml-personalized',
        priority: 10,
        maxScreens: 6,
        minScreens: 3,
        refreshInterval: 3600000, // 1 hour
        enabled: true,
        targetAudience: ['all'],
        displayConfig: {
          displayType: 'featured',
          cardSize: 'large',
          showMetadata: true,
          maxVisible: 6,
          spacing: 'normal',
          mobileLayout: {
            horizontalScroll: true,
            cardsPerView: 1.2,
            snapToCards: true,
            showScrollIndicator: true
          }
        },
        conditions: {
          requiresLogin: false,
          minUserInteractions: 0,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      },
      {
        id: 'trending',
        name: 'Trending now',
        description: 'Most popular screens this week',
        algorithm: 'trending-analysis',
        priority: 8,
        maxScreens: 8,
        minScreens: 4,
        refreshInterval: 900000, // 15 minutes
        enabled: true,
        targetAudience: ['all'],
        displayConfig: {
          displayType: 'horizontal-scroll',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 8,
          spacing: 'normal',
          mobileLayout: {
            horizontalScroll: true,
            cardsPerView: 2.5,
            snapToCards: false,
            showScrollIndicator: true
          }
        },
        conditions: {
          requiresLogin: false,
          minUserInteractions: 0,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      },
      {
        id: 'recently-purchased',
        name: 'Recently purchased',
        description: 'Based on your recent purchases',
        algorithm: 'purchase-history',
        priority: 9,
        maxScreens: 6,
        minScreens: 2,
        refreshInterval: 7200000, // 2 hours
        enabled: true,
        targetAudience: ['returning-customers'],
        displayConfig: {
          displayType: 'horizontal-scroll',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 6,
          spacing: 'normal',
          mobileLayout: {
            horizontalScroll: true,
            cardsPerView: 2,
            snapToCards: true,
            showScrollIndicator: true
          }
        },
        conditions: {
          requiresLogin: false,
          minUserInteractions: 0,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      },
      {
        id: 'new-discovery',
        name: 'New to discover',
        description: 'Fresh screens matching your interests',
        algorithm: 'new-discovery',
        priority: 6,
        maxScreens: 5,
        minScreens: 3,
        refreshInterval: 1800000, // 30 minutes
        enabled: true,
        targetAudience: ['engaged-users'],
        displayConfig: {
          displayType: 'horizontal-scroll',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 5,
          spacing: 'normal',
          mobileLayout: {
            horizontalScroll: true,
            cardsPerView: 2,
            snapToCards: false,
            showScrollIndicator: true
          }
        },
        conditions: {
          requiresLogin: false,
          minUserInteractions: 0,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      },
      {
        id: 'top-in-city',
        name: 'Top in your city',
        description: 'Most popular screens in your area',
        algorithm: 'geographic-popularity',
        priority: 7,
        maxScreens: 8,
        minScreens: 4,
        refreshInterval: 3600000, // 1 hour
        enabled: true,
        targetAudience: ['location-aware'],
        displayConfig: {
          displayType: 'horizontal-scroll',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 8,
          spacing: 'normal',
          mobileLayout: {
            horizontalScroll: true,
            cardsPerView: 2.5,
            snapToCards: false,
            showScrollIndicator: true
          }
        },
        conditions: {
          requiresLogin: false,
          minUserInteractions: 0,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      },
      {
        id: 'other-users-buying',
        name: 'Other users are buying most',
        description: 'Trending purchases from other advertisers',
        algorithm: 'trending-analysis',
        priority: 5,
        maxScreens: 6,
        minScreens: 3,
        refreshInterval: 900000, // 15 minutes
        enabled: true,
        targetAudience: ['all'],
        displayConfig: {
          displayType: 'horizontal-scroll',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 6,
          spacing: 'normal',
          mobileLayout: {
            horizontalScroll: true,
            cardsPerView: 2,
            snapToCards: false,
            showScrollIndicator: true
          }
        },
        conditions: {
          requiresLogin: false,
          minUserInteractions: 0,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      }
    ];

    defaultConfigs.forEach(config => {
      this.sectionConfigs.set(config.id, config);
    });

    this.debug(`Initialized ${defaultConfigs.length} default section configs`);
  }

  /**
   * Initialize dynamic rules for section management
   */
  private initializeDynamicRules(): void {
    const defaultRules: DynamicSectionRule[] = [
      {
        id: 'disable-purchase-history-for-new-users',
        condition: 'user.totalPurchases === 0',
        action: 'disable',
        targetSections: ['recently-purchased'],
        priority: 10,
        enabled: false // Disabled for demo
      },
      {
        id: 'disable-personalized-for-insufficient-data',
        condition: 'user.interactionHistory.totalInteractions < 5',
        action: 'disable',
        targetSections: ['top-picks'],
        priority: 9,
        enabled: false // Disabled for demo
      },
      {
        id: 'enable-discovery-for-engaged-users',
        condition: 'user.interactionHistory.totalInteractions >= 20',
        action: 'enable',
        targetSections: ['new-discovery'],
        priority: 8,
        enabled: false // Disabled for demo
      },
      {
        id: 'disable-location-sections-without-location',
        condition: 'location === undefined || location === null',
        action: 'disable',
        targetSections: ['top-in-city'],
        priority: 7,
        enabled: false // Disabled for demo
      }
    ];

    defaultRules.forEach(rule => {
      this.dynamicRules.set(rule.id, rule);
    });

    this.debug(`Initialized ${defaultRules.length} dynamic rules`);
  }

  /**
   * Get base section configurations
   */
  private getBaseConfigurations(): SectionConfig[] {
    return Array.from(this.sectionConfigs.values());
  }

  /**
   * Apply user-specific configuration modifications
   */
  private async applyUserSpecificConfigs(
    configs: SectionConfig[], 
    userId: string
  ): Promise<SectionConfig[]> {
    const userConfigs = this.userSpecificConfigs.get(userId);
    if (!userConfigs) {
      return configs;
    }

    // Replace base configs with user-specific ones where they exist
    const modifiedConfigs = configs.map(config => {
      const userSpecificConfig = userConfigs.get(`${config.id}-${userId}`);
      return userSpecificConfig || config;
    });

    // Add any additional user-specific configs
    userConfigs.forEach(userConfig => {
      const baseConfigExists = configs.some(config => 
        userConfig.id.startsWith(config.id)
      );
      if (!baseConfigExists) {
        modifiedConfigs.push(userConfig);
      }
    });

    return modifiedConfigs;
  }

  /**
   * Apply dynamic rules to section configurations
   */
  private async applyDynamicRules(
    configs: SectionConfig[], 
    userId?: string, 
    location?: string
  ): Promise<SectionConfig[]> {
    let userProfile: UserProfile | null = null;
    
    if (userId) {
      try {
        userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      } catch (error) {
        this.debug(`Failed to get user profile for dynamic rules: ${error}`);
        userProfile = createEmptyUserProfile(userId);
      }
    }

    const sortedRules = Array.from(this.dynamicRules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    let modifiedConfigs = [...configs];

    for (const rule of sortedRules) {
      try {
        const shouldApply = this.evaluateRuleCondition(rule.condition, userProfile, location);
        
        if (shouldApply) {
          modifiedConfigs = this.applyRule(modifiedConfigs, rule);
          this.debug(`Applied dynamic rule: ${rule.id}`);
        }
      } catch (error) {
        this.debug(`Error applying dynamic rule ${rule.id}: ${error}`);
      }
    }

    return modifiedConfigs;
  }

  /**
   * Evaluate rule condition
   */
  private evaluateRuleCondition(
    condition: string, 
    userProfile: UserProfile | null, 
    location?: string
  ): boolean {
    try {
      // Create evaluation context
      const context = {
        user: userProfile,
        location,
        now: new Date(),
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };

      // Simple condition evaluation (in production, use a proper expression evaluator)
      return this.simpleConditionEvaluator(condition, context);
    } catch (error) {
      this.debug(`Error evaluating condition "${condition}": ${error}`);
      return false;
    }
  }

  /**
   * Simple condition evaluator (replace with proper expression evaluator in production)
   */
  private simpleConditionEvaluator(condition: string, context: any): boolean {
    // This is a simplified evaluator - in production, use a proper expression library
    if (condition.includes('user.totalPurchases === 0')) {
      return context.user?.purchaseProfile?.totalPurchases === 0;
    }
    
    if (condition.includes('user.interactionHistory.totalInteractions < 5')) {
      return (context.user?.interactionHistory?.totalInteractions || 0) < 5;
    }
    
    if (condition.includes('user.interactionHistory.totalInteractions >= 20')) {
      return (context.user?.interactionHistory?.totalInteractions || 0) >= 20;
    }
    
    if (condition.includes('location === undefined || location === null')) {
      return context.location === undefined || context.location === null;
    }

    return false;
  }

  /**
   * Apply a dynamic rule to configurations
   */
  private applyRule(configs: SectionConfig[], rule: DynamicSectionRule): SectionConfig[] {
    return configs.map(config => {
      if (rule.targetSections.includes(config.id)) {
        switch (rule.action) {
          case 'enable':
            return { ...config, enabled: true };
          case 'disable':
            return { ...config, enabled: false };
          case 'modify':
            return { ...config, ...rule.parameters };
          default:
            return config;
        }
      }
      return config;
    });
  }

  /**
   * Update performance metrics for a section
   */
  private async updatePerformanceMetrics(sectionId: string): Promise<void> {
    const engagements = this.sectionAnalytics.get(sectionId) || [];
    
    if (engagements.length === 0) {
      return;
    }

    const totalImpressions = engagements.length;
    const totalClicks = engagements.reduce((sum, e) => sum + e.clickCount, 0);
    const totalConversions = engagements.reduce((sum, e) => sum + (e.conversionRate > 0 ? 1 : 0), 0);
    const totalEngagementTime = engagements.reduce((sum, e) => sum + e.viewTime, 0);
    
    const metrics: SectionPerformanceMetrics = {
      sectionId,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      averageEngagementTime: totalEngagementTime / totalImpressions,
      conversionRate: totalConversions / totalImpressions,
      userSatisfactionScore: this.calculateSatisfactionScore(engagements),
      lastUpdated: new Date()
    };

    this.performanceMetrics.set(sectionId, metrics);
  }

  /**
   * Calculate user satisfaction score based on engagement patterns
   */
  private calculateSatisfactionScore(engagements: SectionEngagement[]): number {
    if (engagements.length === 0) return 0;

    const avgViewTime = engagements.reduce((sum, e) => sum + e.viewTime, 0) / engagements.length;
    const avgScrollDepth = engagements.reduce((sum, e) => sum + e.scrollDepth, 0) / engagements.length;
    const avgClickRate = engagements.reduce((sum, e) => sum + e.clickCount, 0) / engagements.length;

    // Normalize and combine metrics (0-100 scale)
    const viewTimeScore = Math.min(avgViewTime / 30000, 1) * 40; // 30 seconds = full score
    const scrollScore = avgScrollDepth * 30; // Already 0-1, scale to 30
    const clickScore = Math.min(avgClickRate / 3, 1) * 30; // 3 clicks = full score

    return Math.round(viewTimeScore + scrollScore + clickScore);
  }

  /**
   * Get fallback configurations when main system fails
   */
  private getFallbackConfigs(): SectionConfig[] {
    return [
      {
        id: 'fallback-popular',
        name: 'Popular screens',
        description: 'Most popular screens',
        algorithm: 'fallback-popular',
        priority: 1,
        maxScreens: 12,
        minScreens: 6,
        refreshInterval: 3600000,
        enabled: true,
        targetAudience: ['all'],
        displayConfig: {
          displayType: 'grid',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 12,
          spacing: 'normal',
          mobileLayout: {
            horizontalScroll: false,
            cardsPerView: 2,
            snapToCards: false,
            showScrollIndicator: false
          }
        },
        conditions: {
          requiresLogin: false,
          minUserInteractions: 0,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      }
    ];
  }

  /**
   * Generate cache key for configurations
   */
  private getCacheKey(userId?: string, location?: string): string {
    return `configs_${userId || 'anonymous'}_${location || 'no-location'}`;
  }

  /**
   * Clear configuration cache
   */
  private clearConfigCache(): void {
    this.configCache.clear();
  }

  /**
   * Generate tracking ID for section metadata
   */
  private generateTrackingId(sectionId: string): string {
    return `${sectionId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Debug logging
   */
  private debug(message: string): void {
    if (this.options.debugMode) {
      console.debug(`[SectionConfigManager] ${message}`);
    }
  }
}

// Export singleton instance
export const sectionConfigManager = new SectionConfigManager(
  new UserBehaviorAnalytics(),
  {
    enableDynamicSections: true,
    enableAnalyticsTracking: true,
    debugMode: process.env.NODE_ENV === 'development'
  }
);