/**
 * User Preference Analysis System
 * Analyzes user interactions to build preference profiles and scoring algorithms
 */

import { 
  UserInteraction, 
  UserProfile, 
  UserPreferences,
  CategoryPreference,
  LocationPreference,
  PriceRange,
  InteractionAction,
  createEmptyUserProfile
} from '../types/intelligent-grouping.types';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';

export interface PreferenceWeights {
  readonly recency: number;
  readonly frequency: number;
  readonly engagement: number;
  readonly conversion: number;
  readonly timeSpent: number;
}

export interface PreferenceAnalysisConfig {
  readonly minInteractionsForReliability: number;
  readonly decayFactor: number;
  readonly categoryConfidenceThreshold: number;
  readonly locationConfidenceThreshold: number;
  readonly priceConfidenceThreshold: number;
  readonly weights: PreferenceWeights;
}

export interface PreferenceScore {
  readonly value: number;
  readonly confidence: number;
  readonly factors: PreferenceFactor[];
  readonly lastUpdated: Date;
}

export interface PreferenceFactor {
  readonly type: 'recency' | 'frequency' | 'engagement' | 'conversion' | 'time_spent';
  readonly weight: number;
  readonly contribution: number;
  readonly description: string;
}

export interface UserPreferenceInsights {
  readonly userId: string;
  readonly categoryInsights: CategoryInsight[];
  readonly locationInsights: LocationInsight[];
  readonly priceInsights: PriceInsight;
  readonly behaviorPatterns: BehaviorPattern[];
  readonly recommendationFactors: RecommendationFactor[];
  readonly confidence: number;
  readonly lastAnalyzed: Date;
}

export interface CategoryInsight {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly preferenceScore: PreferenceScore;
  readonly interactionPattern: InteractionPattern;
  readonly conversionMetrics: ConversionMetrics;
  readonly trendDirection: 'increasing' | 'decreasing' | 'stable';
}

export interface LocationInsight {
  readonly city: string;
  readonly region: string;
  readonly preferenceScore: PreferenceScore;
  readonly interactionPattern: InteractionPattern;
  readonly conversionMetrics: ConversionMetrics;
  readonly proximityFactor: number;
}

export interface PriceInsight {
  readonly preferredRange: PriceRange;
  readonly priceElasticity: number;
  readonly budgetUtilization: number;
  readonly seasonalVariation: Record<string, number>;
  readonly confidence: number;
}

export interface InteractionPattern {
  readonly totalInteractions: number;
  readonly averageEngagementTime: number;
  readonly peakInteractionHours: number[];
  readonly interactionVelocity: number;
  readonly sessionDepth: number;
}

export interface ConversionMetrics {
  readonly conversionRate: number;
  readonly averageTimeToConversion: number;
  readonly conversionValue: number;
  readonly repeatPurchaseRate: number;
}

export interface BehaviorPattern {
  readonly type: 'browsing' | 'comparison' | 'impulse' | 'research' | 'loyalty';
  readonly strength: number;
  readonly description: string;
  readonly indicators: string[];
}

export interface RecommendationFactor {
  readonly type: string;
  readonly importance: number;
  readonly description: string;
  readonly applicableScenarios: string[];
}

export class UserPreferenceAnalyzer {
  private config: PreferenceAnalysisConfig;
  private behaviorAnalytics: UserBehaviorAnalytics;
  private preferenceCache: Map<string, UserPreferenceInsights> = new Map();

  constructor(
    behaviorAnalytics: UserBehaviorAnalytics,
    config?: Partial<PreferenceAnalysisConfig>
  ) {
    this.behaviorAnalytics = behaviorAnalytics;
    this.config = {
      minInteractionsForReliability: 10,
      decayFactor: 0.95, // Daily decay factor
      categoryConfidenceThreshold: 0.6,
      locationConfidenceThreshold: 0.5,
      priceConfidenceThreshold: 0.7,
      weights: {
        recency: 0.3,
        frequency: 0.25,
        engagement: 0.2,
        conversion: 0.15,
        timeSpent: 0.1
      },
      ...config
    };
  }

  /**
   * Get comprehensive user preferences with analysis
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const profile = await this.behaviorAnalytics.getUserProfile(userId);
    
    if (profile.interactionHistory.totalInteractions < this.config.minInteractionsForReliability) {
      return this.getFallbackPreferences(userId);
    }

    const insights = await this.analyzeUserPreferences(userId);
    
    return {
      notifications: this.deriveNotificationPreferences(insights),
      display: this.deriveDisplayPreferences(insights, profile),
      privacy: profile.preferences.privacy, // Keep existing privacy settings
      accessibility: profile.preferences.accessibility // Keep existing accessibility settings
    };
  }

  /**
   * Update user preferences based on new interactions
   */
  async updateUserPreferences(userId: string, interactions: UserInteraction[]): Promise<void> {
    // Track new interactions
    for (const interaction of interactions) {
      await this.behaviorAnalytics.trackInteraction(interaction);
    }

    // Invalidate preference cache to force re-analysis
    this.preferenceCache.delete(userId);

    // Optionally trigger immediate re-analysis for high-value interactions
    const hasHighValueInteraction = interactions.some(i => 
      ['purchase', 'favorite', 'share'].includes(i.action)
    );

    if (hasHighValueInteraction) {
      await this.analyzeUserPreferences(userId);
    }
  }

  /**
   * Analyze user preferences and generate insights
   */
  async analyzeUserPreferences(userId: string): Promise<UserPreferenceInsights> {
    // Check cache first
    const cached = this.preferenceCache.get(userId);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const interactions = await this.behaviorAnalytics.getUserInteractions(userId);
    const profile = await this.behaviorAnalytics.getUserProfile(userId);

    if (interactions.length < this.config.minInteractionsForReliability) {
      return this.generateFallbackInsights(userId);
    }

    const categoryInsights = await this.analyzeCategoryPreferences(interactions);
    const locationInsights = await this.analyzeLocationPreferences(interactions);
    const priceInsights = await this.analyzePricePreferences(interactions);
    const behaviorPatterns = this.identifyBehaviorPatterns(interactions);
    const recommendationFactors = this.generateRecommendationFactors(
      categoryInsights, locationInsights, priceInsights, behaviorPatterns
    );

    const confidence = this.calculateOverallConfidence(
      categoryInsights, locationInsights, priceInsights, interactions.length
    );

    const insights: UserPreferenceInsights = {
      userId,
      categoryInsights,
      locationInsights,
      priceInsights,
      behaviorPatterns,
      recommendationFactors,
      confidence,
      lastAnalyzed: new Date()
    };

    // Cache the results
    this.preferenceCache.set(userId, insights);

    return insights;
  }

  /**
   * Get preference scores for specific categories
   */
  async getCategoryPreferenceScores(userId: string, categoryIds: string[]): Promise<Record<string, PreferenceScore>> {
    const insights = await this.analyzeUserPreferences(userId);
    const scores: Record<string, PreferenceScore> = {};

    for (const categoryId of categoryIds) {
      const categoryInsight = insights.categoryInsights.find(c => c.categoryId === categoryId);
      if (categoryInsight) {
        scores[categoryId] = categoryInsight.preferenceScore;
      } else {
        // Generate default score for unknown categories
        scores[categoryId] = {
          value: 0.1,
          confidence: 0,
          factors: [],
          lastUpdated: new Date()
        };
      }
    }

    return scores;
  }

  /**
   * Get location preference scores
   */
  async getLocationPreferenceScores(userId: string, locations: Array<{city: string, region: string}>): Promise<Record<string, PreferenceScore>> {
    const insights = await this.analyzeUserPreferences(userId);
    const scores: Record<string, PreferenceScore> = {};

    for (const location of locations) {
      const locationKey = `${location.city}-${location.region}`;
      const locationInsight = insights.locationInsights.find(l => 
        l.city === location.city && l.region === location.region
      );
      
      if (locationInsight) {
        scores[locationKey] = locationInsight.preferenceScore;
      } else {
        // Generate default score for unknown locations
        scores[locationKey] = {
          value: 0.1,
          confidence: 0,
          factors: [],
          lastUpdated: new Date()
        };
      }
    }

    return scores;
  }

  /**
   * Predict user interest in a specific screen
   */
  async predictScreenInterest(userId: string, screenMetadata: {
    categoryId?: string;
    location?: { city: string; region: string };
    price?: number;
    features?: string[];
  }): Promise<{ score: number; confidence: number; reasons: string[] }> {
    const insights = await this.analyzeUserPreferences(userId);
    let totalScore = 0;
    let totalWeight = 0;
    const reasons: string[] = [];

    // Category preference
    if (screenMetadata.categoryId) {
      const categoryInsight = insights.categoryInsights.find(c => c.categoryId === screenMetadata.categoryId);
      if (categoryInsight) {
        const weight = 0.4;
        totalScore += categoryInsight.preferenceScore.value * weight;
        totalWeight += weight;
        reasons.push(`Strong preference for ${categoryInsight.categoryName} category`);
      }
    }

    // Location preference
    if (screenMetadata.location) {
      const locationInsight = insights.locationInsights.find(l => 
        l.city === screenMetadata.location!.city && l.region === screenMetadata.location!.region
      );
      if (locationInsight) {
        const weight = 0.3;
        totalScore += locationInsight.preferenceScore.value * weight;
        totalWeight += weight;
        reasons.push(`Preferred location: ${locationInsight.city}`);
      }
    }

    // Price preference
    if (screenMetadata.price && insights.priceInsights.preferredRange) {
      const priceRange = insights.priceInsights.preferredRange;
      const priceScore = this.calculatePriceScore(screenMetadata.price, priceRange);
      const weight = 0.2;
      totalScore += priceScore * weight;
      totalWeight += weight;
      
      if (priceScore > 0.7) {
        reasons.push('Price within preferred range');
      } else if (priceScore < 0.3) {
        reasons.push('Price outside preferred range');
      }
    }

    // Behavior pattern matching
    const behaviorScore = this.calculateBehaviorPatternMatch(insights.behaviorPatterns, screenMetadata);
    const behaviorWeight = 0.1;
    totalScore += behaviorScore * behaviorWeight;
    totalWeight += behaviorWeight;

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0.1;
    const confidence = Math.min(insights.confidence, totalWeight);

    return {
      score: Math.max(0, Math.min(1, finalScore)),
      confidence,
      reasons
    };
  }

  // Private helper methods

  private async analyzeCategoryPreferences(interactions: UserInteraction[]): Promise<CategoryInsight[]> {
    const categoryStats = this.aggregateCategoryStats(interactions);
    const insights: CategoryInsight[] = [];

    for (const [categoryId, stats] of Object.entries(categoryStats)) {
      const preferenceScore = this.calculateCategoryPreferenceScore(stats, interactions.length);
      const interactionPattern = this.calculateInteractionPattern(stats.interactions);
      const conversionMetrics = this.calculateConversionMetrics(stats.interactions);
      const trendDirection = this.calculateTrendDirection(stats.interactions);

      insights.push({
        categoryId,
        categoryName: this.getCategoryName(categoryId),
        preferenceScore,
        interactionPattern,
        conversionMetrics,
        trendDirection
      });
    }

    return insights.sort((a, b) => b.preferenceScore.value - a.preferenceScore.value);
  }

  private async analyzeLocationPreferences(interactions: UserInteraction[]): Promise<LocationInsight[]> {
    const locationStats = this.aggregateLocationStats(interactions);
    const insights: LocationInsight[] = [];

    for (const [locationKey, stats] of Object.entries(locationStats)) {
      const [city, region] = locationKey.split('-');
      const preferenceScore = this.calculateLocationPreferenceScore(stats, interactions.length);
      const interactionPattern = this.calculateInteractionPattern(stats.interactions);
      const conversionMetrics = this.calculateConversionMetrics(stats.interactions);
      const proximityFactor = this.calculateProximityFactor(city, region);

      insights.push({
        city,
        region,
        preferenceScore,
        interactionPattern,
        conversionMetrics,
        proximityFactor
      });
    }

    return insights.sort((a, b) => b.preferenceScore.value - a.preferenceScore.value);
  }

  private async analyzePricePreferences(interactions: UserInteraction[]): Promise<PriceInsight> {
    const priceInteractions = interactions.filter(i => 
      i.metadata.additionalData?.price && typeof i.metadata.additionalData.price === 'number'
    );

    if (priceInteractions.length === 0) {
      return {
        preferredRange: { min: 0, max: Number.MAX_SAFE_INTEGER, preferred: 500000, currency: 'COP', confidence: 0 },
        priceElasticity: 0.5,
        budgetUtilization: 0,
        seasonalVariation: {},
        confidence: 0
      };
    }

    const prices = priceInteractions.map(i => i.metadata.additionalData!.price as number);
    const purchases = priceInteractions.filter(i => i.action === 'purchase');
    const purchasePrices = purchases.map(i => i.metadata.additionalData!.price as number);

    const preferredRange = this.calculatePreferredPriceRange(prices, purchasePrices);
    const priceElasticity = this.calculatePriceElasticity(priceInteractions);
    const budgetUtilization = this.calculateBudgetUtilization(purchasePrices);
    const seasonalVariation = this.calculateSeasonalPriceVariation(priceInteractions);
    const confidence = Math.min(priceInteractions.length / 20, 1);

    return {
      preferredRange,
      priceElasticity,
      budgetUtilization,
      seasonalVariation,
      confidence
    };
  }

  private identifyBehaviorPatterns(interactions: UserInteraction[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];

    // Browsing pattern
    const browsingStrength = this.calculateBrowsingPattern(interactions);
    if (browsingStrength > 0.3) {
      patterns.push({
        type: 'browsing',
        strength: browsingStrength,
        description: 'User tends to browse extensively before making decisions',
        indicators: ['High view-to-click ratio', 'Multiple sessions before purchase']
      });
    }

    // Comparison pattern
    const comparisonStrength = this.calculateComparisonPattern(interactions);
    if (comparisonStrength > 0.4) {
      patterns.push({
        type: 'comparison',
        strength: comparisonStrength,
        description: 'User frequently compares options before purchasing',
        indicators: ['Uses comparison features', 'Views similar screens in sequence']
      });
    }

    // Impulse pattern
    const impulseStrength = this.calculateImpulsePattern(interactions);
    if (impulseStrength > 0.3) {
      patterns.push({
        type: 'impulse',
        strength: impulseStrength,
        description: 'User makes quick purchase decisions',
        indicators: ['Short time between view and purchase', 'Limited browsing before purchase']
      });
    }

    // Research pattern
    const researchStrength = this.calculateResearchPattern(interactions);
    if (researchStrength > 0.4) {
      patterns.push({
        type: 'research',
        strength: researchStrength,
        description: 'User conducts thorough research before purchasing',
        indicators: ['Multiple search queries', 'Extended session durations', 'Detailed screen views']
      });
    }

    // Loyalty pattern
    const loyaltyStrength = this.calculateLoyaltyPattern(interactions);
    if (loyaltyStrength > 0.5) {
      patterns.push({
        type: 'loyalty',
        strength: loyaltyStrength,
        description: 'User shows loyalty to specific categories or locations',
        indicators: ['Repeat purchases in same category', 'Consistent location preferences']
      });
    }

    return patterns.sort((a, b) => b.strength - a.strength);
  }

  private generateRecommendationFactors(
    categoryInsights: CategoryInsight[],
    locationInsights: LocationInsight[],
    priceInsights: PriceInsight,
    behaviorPatterns: BehaviorPattern[]
  ): RecommendationFactor[] {
    const factors: RecommendationFactor[] = [];

    // Category factors
    const topCategories = categoryInsights.slice(0, 3);
    topCategories.forEach((category, index) => {
      factors.push({
        type: 'category_preference',
        importance: (3 - index) * 0.3,
        description: `Strong preference for ${category.categoryName}`,
        applicableScenarios: ['personalized_recommendations', 'category_filtering']
      });
    });

    // Location factors
    const topLocations = locationInsights.slice(0, 2);
    topLocations.forEach((location, index) => {
      factors.push({
        type: 'location_preference',
        importance: (2 - index) * 0.25,
        description: `Prefers screens in ${location.city}`,
        applicableScenarios: ['geographic_recommendations', 'location_filtering']
      });
    });

    // Price factors
    if (priceInsights.confidence > 0.5) {
      factors.push({
        type: 'price_preference',
        importance: 0.4,
        description: `Budget range: ${priceInsights.preferredRange.min} - ${priceInsights.preferredRange.max}`,
        applicableScenarios: ['price_filtering', 'budget_recommendations']
      });
    }

    // Behavior factors
    behaviorPatterns.forEach(pattern => {
      factors.push({
        type: `behavior_${pattern.type}`,
        importance: pattern.strength * 0.3,
        description: pattern.description,
        applicableScenarios: ['recommendation_timing', 'content_presentation']
      });
    });

    return factors.sort((a, b) => b.importance - a.importance);
  }

  private getFallbackPreferences(userId: string): UserPreferences {
    // Return default preferences for users with insufficient data
    const emptyProfile = createEmptyUserProfile(userId);
    return emptyProfile.preferences;
  }

  private generateFallbackInsights(userId: string): UserPreferenceInsights {
    return {
      userId,
      categoryInsights: [],
      locationInsights: [],
      priceInsights: {
        preferredRange: { min: 0, max: Number.MAX_SAFE_INTEGER, preferred: 500000, currency: 'COP', confidence: 0 },
        priceElasticity: 0.5,
        budgetUtilization: 0,
        seasonalVariation: {},
        confidence: 0
      },
      behaviorPatterns: [],
      recommendationFactors: [],
      confidence: 0,
      lastAnalyzed: new Date()
    };
  }

  private deriveNotificationPreferences(insights: UserPreferenceInsights): {
    newScreens: boolean;
    priceDrops: boolean;
    recommendations: boolean;
    marketingEmails: boolean;
  } {
    // Derive notification preferences based on behavior patterns
    const hasResearchPattern = insights.behaviorPatterns.some(p => p.type === 'research');
    const hasImpulsePattern = insights.behaviorPatterns.some(p => p.type === 'impulse');
    
    return {
      newScreens: hasResearchPattern || insights.confidence > 0.6,
      priceDrops: insights.priceInsights.confidence > 0.5,
      recommendations: insights.confidence > 0.4,
      marketingEmails: !hasImpulsePattern && insights.confidence > 0.7
    };
  }

  private deriveDisplayPreferences(insights: UserPreferenceInsights, profile: UserProfile): {
    defaultViewMode: 'sectioned' | 'grid' | 'list';
    cardsPerRow: number;
    showPrices: boolean;
    showRatings: boolean;
    compactMode: boolean;
  } {
    const hasBrowsingPattern = insights.behaviorPatterns.some(p => p.type === 'browsing');
    const hasComparisonPattern = insights.behaviorPatterns.some(p => p.type === 'comparison');
    
    return {
      defaultViewMode: insights.confidence > 0.5 ? 'sectioned' : 'grid',
      cardsPerRow: hasBrowsingPattern ? 4 : 3,
      showPrices: insights.priceInsights.confidence > 0.3,
      showRatings: hasComparisonPattern,
      compactMode: profile.interactionHistory.preferredDeviceType === 'mobile'
    };
  }

  // Additional helper methods would be implemented here...
  // (Truncated for brevity - these would include all the calculation methods referenced above)

  private isCacheValid(insights: UserPreferenceInsights): boolean {
    const cacheAge = Date.now() - insights.lastAnalyzed.getTime();
    const maxCacheAge = 60 * 60 * 1000; // 1 hour
    return cacheAge < maxCacheAge;
  }

  private calculateOverallConfidence(
    categoryInsights: CategoryInsight[],
    locationInsights: LocationInsight[],
    priceInsights: PriceInsight,
    totalInteractions: number
  ): number {
    const interactionConfidence = Math.min(totalInteractions / 50, 1);
    const categoryConfidence = categoryInsights.length > 0 ? 
      categoryInsights.reduce((sum, c) => sum + c.preferenceScore.confidence, 0) / categoryInsights.length : 0;
    const locationConfidence = locationInsights.length > 0 ?
      locationInsights.reduce((sum, l) => sum + l.preferenceScore.confidence, 0) / locationInsights.length : 0;
    
    return (interactionConfidence + categoryConfidence + locationConfidence + priceInsights.confidence) / 4;
  }

  // Placeholder implementations for calculation methods
  private aggregateCategoryStats(interactions: UserInteraction[]): Record<string, any> { return {}; }
  private aggregateLocationStats(interactions: UserInteraction[]): Record<string, any> { return {}; }
  private calculateCategoryPreferenceScore(stats: any, totalInteractions: number): PreferenceScore {
    return { value: 0.5, confidence: 0.5, factors: [], lastUpdated: new Date() };
  }
  private calculateLocationPreferenceScore(stats: any, totalInteractions: number): PreferenceScore {
    return { value: 0.5, confidence: 0.5, factors: [], lastUpdated: new Date() };
  }
  private calculateInteractionPattern(interactions: UserInteraction[]): InteractionPattern {
    return { totalInteractions: 0, averageEngagementTime: 0, peakInteractionHours: [], interactionVelocity: 0, sessionDepth: 0 };
  }
  private calculateConversionMetrics(interactions: UserInteraction[]): ConversionMetrics {
    return { conversionRate: 0, averageTimeToConversion: 0, conversionValue: 0, repeatPurchaseRate: 0 };
  }
  private calculateTrendDirection(interactions: UserInteraction[]): 'increasing' | 'decreasing' | 'stable' { return 'stable'; }
  private calculateProximityFactor(city: string, region: string): number { return 1; }
  private calculatePreferredPriceRange(prices: number[], purchasePrices: number[]): PriceRange {
    return { min: 0, max: 1000000, preferred: 500000, currency: 'COP', confidence: 0.5 };
  }
  private calculatePriceElasticity(interactions: UserInteraction[]): number { return 0.5; }
  private calculateBudgetUtilization(prices: number[]): number { return 0.5; }
  private calculateSeasonalPriceVariation(interactions: UserInteraction[]): Record<string, number> { return {}; }
  private calculateBrowsingPattern(interactions: UserInteraction[]): number { return 0.5; }
  private calculateComparisonPattern(interactions: UserInteraction[]): number { return 0.5; }
  private calculateImpulsePattern(interactions: UserInteraction[]): number { return 0.3; }
  private calculateResearchPattern(interactions: UserInteraction[]): number { return 0.4; }
  private calculateLoyaltyPattern(interactions: UserInteraction[]): number { return 0.6; }
  private calculatePriceScore(price: number, range: PriceRange): number { return 0.7; }
  private calculateBehaviorPatternMatch(patterns: BehaviorPattern[], metadata: any): number { return 0.5; }
  private getCategoryName(categoryId: string): string { return categoryId; }
}

// Export factory function to create analyzer with behavior analytics
export const createUserPreferenceAnalyzer = (behaviorAnalytics: UserBehaviorAnalytics): UserPreferenceAnalyzer => {
  return new UserPreferenceAnalyzer(behaviorAnalytics);
};