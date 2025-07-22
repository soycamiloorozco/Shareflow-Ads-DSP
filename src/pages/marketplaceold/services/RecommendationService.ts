/**
 * Recommendation Service
 * Implements personalized recommendation algorithms for intelligent marketplace grouping
 */

import { 
  EnhancedScreen,
  UserProfile,
  UserInteraction,
  RecommendationService as IRecommendationService,
  RecommendationFactor,
  AlgorithmType,
  CategoryPreference,
  LocationPreference,
  PriceRange
} from '../types/intelligent-grouping.types';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';
import { UserPreferenceAnalyzer } from './UserPreferenceAnalyzer';

export interface MLModelConfig {
  readonly topPicksWeights: {
    readonly behaviorScore: number;
    readonly categoryMatch: number;
    readonly locationMatch: number;
    readonly priceMatch: number;
    readonly recency: number;
    readonly popularity: number;
  };
  readonly similarityWeights: {
    readonly category: number;
    readonly location: number;
    readonly price: number;
    readonly features: number;
    readonly audience: number;
  };
  readonly discoveryWeights: {
    readonly newness: number;
    readonly preferenceMatch: number;
    readonly trendingScore: number;
    readonly diversityBonus: number;
  };
}

export interface SimilarityScore {
  readonly screenId: string;
  readonly totalScore: number;
  readonly categoryScore: number;
  readonly locationScore: number;
  readonly priceScore: number;
  readonly featureScore: number;
  readonly audienceScore: number;
  readonly factors: string[];
}

export interface PersonalizedScore {
  readonly screenId: string;
  readonly score: number;
  readonly confidence: number;
  readonly factors: RecommendationFactor[];
  readonly algorithm: AlgorithmType;
}

export class RecommendationService implements IRecommendationService {
  private behaviorAnalytics: UserBehaviorAnalytics;
  private preferenceAnalyzer: UserPreferenceAnalyzer;
  private config: MLModelConfig;
  private screenCache: Map<string, EnhancedScreen> = new Map();
  private similarityCache: Map<string, SimilarityScore[]> = new Map();

  constructor(
    behaviorAnalytics: UserBehaviorAnalytics,
    preferenceAnalyzer: UserPreferenceAnalyzer,
    config?: Partial<MLModelConfig>
  ) {
    this.behaviorAnalytics = behaviorAnalytics;
    this.preferenceAnalyzer = preferenceAnalyzer;
    this.config = {
      topPicksWeights: {
        behaviorScore: 0.25,
        categoryMatch: 0.20,
        locationMatch: 0.15,
        priceMatch: 0.15,
        recency: 0.10,
        popularity: 0.15
      },
      similarityWeights: {
        category: 0.30,
        location: 0.25,
        price: 0.20,
        features: 0.15,
        audience: 0.10
      },
      discoveryWeights: {
        newness: 0.30,
        preferenceMatch: 0.35,
        trendingScore: 0.20,
        diversityBonus: 0.15
      },
      ...config
    };
  }

  /**
   * Generate ML-based top picks using user behavior patterns
   * Requirements: 1.1, 4.1, 4.2
   */
  async getTopPicks(userId: string, limit: number = 6): Promise<EnhancedScreen[]> {
    const startTime = Date.now();
    
    try {
      // Get user profile and preferences
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      const userInsights = await this.preferenceAnalyzer.analyzeUserPreferences(userId);
      
      // Get all available screens
      const allScreens = await this.getAllScreens();
      
      // Calculate personalized scores for each screen
      const scoredScreens = await Promise.all(
        allScreens.map(screen => this.calculatePersonalizedScore(screen, userProfile, userInsights))
      );

      // Sort by score and take top picks
      const topPicks = scoredScreens
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(scored => this.enhanceScreenWithScore(scored));

      console.debug('Top picks generated:', {
        userId,
        count: topPicks.length,
        processingTime: Date.now() - startTime,
        topScores: topPicks.slice(0, 3).map(s => ({ id: s.id, score: s.personalizedScore }))
      });

      return topPicks;
    } catch (error) {
      console.error('Error generating top picks:', error);
      // Fallback to popular screens
      return this.getFallbackTopPicks(limit);
    }
  }  /**
   *
 Create screen similarity scoring based on category, location, and price
   * Requirements: 4.2
   */
  async getSimilarScreens(screenId: string, userId: string, limit: number = 4): Promise<EnhancedScreen[]> {
    const startTime = Date.now();
    
    try {
      // Get the reference screen
      const referenceScreen = await this.getScreenById(screenId);
      if (!referenceScreen) {
        throw new Error(`Screen not found: ${screenId}`);
      }

      // Check cache first
      const cacheKey = `${screenId}_${userId}`;
      let similarityScores = this.similarityCache.get(cacheKey);
      
      if (!similarityScores) {
        // Calculate similarity scores
        const allScreens = await this.getAllScreens();
        const otherScreens = allScreens.filter(s => s.id !== screenId);
        
        similarityScores = await Promise.all(
          otherScreens.map(screen => this.calculateSimilarityScore(referenceScreen, screen))
        );
        
        // Cache the results
        this.similarityCache.set(cacheKey, similarityScores);
      }

      // Get user preferences to personalize similarity ranking
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      
      // Apply user preference weighting to similarity scores
      const personalizedSimilarity = similarityScores.map(similarity => ({
        ...similarity,
        personalizedScore: this.applyUserPreferenceWeighting(similarity, userProfile)
      }));

      // Sort by personalized score and take top similar screens
      const topSimilar = personalizedSimilarity
        .sort((a, b) => b.personalizedScore - a.personalizedScore)
        .slice(0, limit);

      // Convert to enhanced screens
      const similarScreens = await Promise.all(
        topSimilar.map(async (similarity) => {
          const screen = await this.getScreenById(similarity.screenId);
          return this.enhanceScreenWithSimilarity(screen!, similarity);
        })
      );

      console.debug('Similar screens generated:', {
        referenceScreenId: screenId,
        userId,
        count: similarScreens.length,
        processingTime: Date.now() - startTime,
        topScores: topSimilar.slice(0, 3).map(s => ({ 
          id: s.screenId, 
          score: s.totalScore,
          personalizedScore: s.personalizedScore 
        }))
      });

      return similarScreens;
    } catch (error) {
      console.error('Error generating similar screens:', error);
      return this.getFallbackSimilarScreens(screenId, limit);
    }
  }  /**

   * Implement new discovery algorithm matching user preferences to recent screens
   * Requirements: 4.1, 4.2
   */
  async getNewDiscoveries(userId: string, limit: number = 5): Promise<EnhancedScreen[]> {
    const startTime = Date.now();
    
    try {
      // Get user preferences and insights
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      const userInsights = await this.preferenceAnalyzer.analyzeUserPreferences(userId);
      
      // Get recently added screens (last 30 days)
      const recentScreens = await this.getRecentScreens(30);
      
      if (recentScreens.length === 0) {
        return [];
      }

      // Calculate discovery scores for each recent screen
      const discoveryScores = await Promise.all(
        recentScreens.map(screen => this.calculateDiscoveryScore(screen, userProfile, userInsights))
      );

      // Apply diversity bonus to avoid showing too many similar screens
      const diversifiedScores = this.applyDiversityBonus(discoveryScores);

      // Sort by discovery score and take top discoveries
      const topDiscoveries = diversifiedScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(scored => this.enhanceScreenWithDiscoveryScore(scored));

      console.debug('New discoveries generated:', {
        userId,
        totalRecentScreens: recentScreens.length,
        count: topDiscoveries.length,
        processingTime: Date.now() - startTime,
        topScores: topDiscoveries.slice(0, 3).map(s => ({ 
          id: s.id, 
          score: s.personalizedScore,
          addedDate: s.performanceMetrics.lastUpdated
        }))
      });

      return topDiscoveries;
    } catch (error) {
      console.error('Error generating new discoveries:', error);
      return this.getFallbackNewDiscoveries(limit);
    }
  }

  /**
   * Get trending screens based on recent activity
   */
  async getTrendingScreens(location?: string, limit: number = 8): Promise<EnhancedScreen[]> {
    try {
      const allScreens = await this.getAllScreens();
      
      // Filter by location if specified
      const filteredScreens = location 
        ? allScreens.filter(screen => this.matchesLocation(screen, location))
        : allScreens;

      // Calculate trending scores based on recent booking activity
      const trendingScores = filteredScreens.map(screen => ({
        screen,
        trendingScore: this.calculateTrendingScore(screen)
      }));

      // Sort by trending score and take top trending
      const topTrending = trendingScores
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit)
        .map(({ screen, trendingScore }) => ({
          ...screen,
          trendingScore
        }));

      return topTrending;
    } catch (error) {
      console.error('Error getting trending screens:', error);
      return [];
    }
  }  /**
 
  * Update user preferences based on interactions
   */
  async updateUserPreferences(userId: string, interactions: UserInteraction[]): Promise<void> {
    try {
      // Update behavior analytics
      for (const interaction of interactions) {
        await this.behaviorAnalytics.trackInteraction(interaction);
      }

      // Update preference analyzer
      await this.preferenceAnalyzer.updateUserPreferences(userId, interactions);

      // Clear relevant caches
      this.clearUserCaches(userId);

      console.debug('User preferences updated:', {
        userId,
        interactionCount: interactions.length,
        interactionTypes: [...new Set(interactions.map(i => i.action))]
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  /**
   * Generate personalized sections for a user
   */
  async generatePersonalizedSections(userId: string): Promise<import('../types/intelligent-grouping.types').MarketplaceSection[]> {
    try {
      const sections: import('../types/intelligent-grouping.types').MarketplaceSection[] = [];

      // Top picks section
      const topPicks = await this.getTopPicks(userId, 6);
      if (topPicks.length > 0) {
        sections.push({
          id: 'top-picks',
          title: 'Top picks for you',
          subtitle: 'Screens we think you\'ll love',
          screens: topPicks,
          displayType: 'featured',
          priority: 1,
          metadata: {
            algorithm: 'ml-personalized',
            confidence: this.calculateSectionConfidence(topPicks),
            refreshInterval: 3600000, // 1 hour
            trackingId: `top-picks-${userId}-${Date.now()}`,
            generatedAt: new Date()
          }
        });
      }

      // New discoveries section
      const newDiscoveries = await this.getNewDiscoveries(userId, 5);
      if (newDiscoveries.length > 0) {
        sections.push({
          id: 'new-discoveries',
          title: 'New to discover',
          subtitle: 'Fresh screens matching your interests',
          screens: newDiscoveries,
          displayType: 'horizontal-scroll',
          priority: 3,
          metadata: {
            algorithm: 'new-discovery',
            confidence: this.calculateSectionConfidence(newDiscoveries),
            refreshInterval: 1800000, // 30 minutes
            trackingId: `new-discoveries-${userId}-${Date.now()}`,
            generatedAt: new Date()
          }
        });
      }

      return sections;
    } catch (error) {
      console.error('Error generating personalized sections:', error);
      return [];
    }
  } 
 // Private helper methods

  /**
   * Calculate personalized score for a screen based on user profile
   */
  private async calculatePersonalizedScore(
    screen: EnhancedScreen, 
    userProfile: UserProfile,
    userInsights: any
  ): Promise<PersonalizedScore> {
    const factors: RecommendationFactor[] = [];
    let totalScore = 0;

    // Behavior score factor
    const behaviorScore = userProfile.behaviorScore / 100;
    const behaviorWeight = this.config.topPicksWeights.behaviorScore;
    totalScore += behaviorScore * behaviorWeight;
    factors.push({
      type: 'behavior_score',
      weight: behaviorWeight,
      description: `User behavior score: ${userProfile.behaviorScore}`,
      value: behaviorScore
    });

    // Category match factor
    const categoryScore = this.calculateCategoryMatchScore(screen, userProfile.preferredCategories);
    const categoryWeight = this.config.topPicksWeights.categoryMatch;
    totalScore += categoryScore * categoryWeight;
    factors.push({
      type: 'category_match',
      weight: categoryWeight,
      description: 'Category preference alignment',
      value: categoryScore
    });

    // Location match factor
    const locationScore = this.calculateLocationMatchScore(screen, userProfile.locationPreferences);
    const locationWeight = this.config.topPicksWeights.locationMatch;
    totalScore += locationScore * locationWeight;
    factors.push({
      type: 'location_match',
      weight: locationWeight,
      description: 'Location preference alignment',
      value: locationScore
    });

    // Price match factor
    const priceScore = this.calculatePriceMatchScore(screen, userProfile.budgetRange);
    const priceWeight = this.config.topPicksWeights.priceMatch;
    totalScore += priceScore * priceWeight;
    factors.push({
      type: 'price_match',
      weight: priceWeight,
      description: 'Price within preferred range',
      value: priceScore
    });

    // Recency factor (how recently user interacted with similar screens)
    const recencyScore = this.calculateRecencyScore(screen, userProfile);
    const recencyWeight = this.config.topPicksWeights.recency;
    totalScore += recencyScore * recencyWeight;
    factors.push({
      type: 'recency',
      weight: recencyWeight,
      description: 'Recent interaction relevance',
      value: recencyScore
    });

    // Popularity factor
    const popularityScore = this.calculatePopularityScore(screen);
    const popularityWeight = this.config.topPicksWeights.popularity;
    totalScore += popularityScore * popularityWeight;
    factors.push({
      type: 'popularity',
      weight: popularityWeight,
      description: 'Screen popularity and performance',
      value: popularityScore
    });

    const confidence = this.calculateScoreConfidence(factors, userProfile);

    return {
      screenId: screen.id,
      score: Math.max(0, Math.min(1, totalScore)),
      confidence,
      factors,
      algorithm: 'ml-personalized'
    };
  }  /**
 
  * Calculate similarity score between two screens
   */
  private async calculateSimilarityScore(
    referenceScreen: EnhancedScreen, 
    compareScreen: EnhancedScreen
  ): Promise<SimilarityScore> {
    const factors: string[] = [];
    let totalScore = 0;

    // Category similarity
    const categoryScore = this.calculateCategorySimilarity(referenceScreen, compareScreen);
    totalScore += categoryScore * this.config.similarityWeights.category;
    if (categoryScore > 0.7) factors.push('Same category');

    // Location similarity
    const locationScore = this.calculateLocationSimilarity(referenceScreen, compareScreen);
    totalScore += locationScore * this.config.similarityWeights.location;
    if (locationScore > 0.7) factors.push('Similar location');

    // Price similarity
    const priceScore = this.calculatePriceSimilarity(referenceScreen, compareScreen);
    totalScore += priceScore * this.config.similarityWeights.price;
    if (priceScore > 0.7) factors.push('Similar price range');

    // Feature similarity
    const featureScore = this.calculateFeatureSimilarity(referenceScreen, compareScreen);
    totalScore += featureScore * this.config.similarityWeights.features;
    if (featureScore > 0.7) factors.push('Similar features');

    // Audience similarity
    const audienceScore = this.calculateAudienceSimilarity(referenceScreen, compareScreen);
    totalScore += audienceScore * this.config.similarityWeights.audience;
    if (audienceScore > 0.7) factors.push('Similar audience');

    return {
      screenId: compareScreen.id,
      totalScore: Math.max(0, Math.min(1, totalScore)),
      categoryScore,
      locationScore,
      priceScore,
      featureScore,
      audienceScore,
      factors
    };
  }

  /**
   * Calculate discovery score for new screens
   */
  private async calculateDiscoveryScore(
    screen: EnhancedScreen,
    userProfile: UserProfile,
    userInsights: any
  ): Promise<PersonalizedScore> {
    const factors: RecommendationFactor[] = [];
    let totalScore = 0;

    // Newness factor (how recently the screen was added)
    const newnessScore = this.calculateNewnessScore(screen);
    const newnessWeight = this.config.discoveryWeights.newness;
    totalScore += newnessScore * newnessWeight;
    factors.push({
      type: 'newness',
      weight: newnessWeight,
      description: 'Recently added to marketplace',
      value: newnessScore
    });

    // Preference match factor
    const preferenceScore = await this.calculatePreferenceMatchScore(screen, userProfile);
    const preferenceWeight = this.config.discoveryWeights.preferenceMatch;
    totalScore += preferenceScore * preferenceWeight;
    factors.push({
      type: 'preference_match',
      weight: preferenceWeight,
      description: 'Matches your preferences',
      value: preferenceScore
    });

    // Trending score factor
    const trendingScore = this.calculateTrendingScore(screen);
    const trendingWeight = this.config.discoveryWeights.trendingScore;
    totalScore += trendingScore * trendingWeight;
    factors.push({
      type: 'trending',
      weight: trendingWeight,
      description: 'Currently trending',
      value: trendingScore
    });

    const confidence = this.calculateScoreConfidence(factors, userProfile);

    return {
      screenId: screen.id,
      score: Math.max(0, Math.min(1, totalScore)),
      confidence,
      factors,
      algorithm: 'new-discovery'
    };
  }

  // Scoring helper methods

  private calculateCategoryMatchScore(screen: EnhancedScreen, preferences: CategoryPreference[]): number {
    if (!preferences.length) return 0.1;
    
    const screenCategory = screen.category?.id || '';
    const matchingPreference = preferences.find(p => p.categoryId === screenCategory);
    
    return matchingPreference ? matchingPreference.score / 100 : 0.1;
  }

  private calculateLocationMatchScore(screen: EnhancedScreen, preferences: LocationPreference[]): number {
    if (!preferences.length) return 0.1;
    
    const screenLocation = this.extractLocationFromScreen(screen);
    const matchingPreference = preferences.find(p => 
      p.city.toLowerCase() === screenLocation.city.toLowerCase()
    );
    
    return matchingPreference ? matchingPreference.score / 100 : 0.1;
  }

  private calculatePriceMatchScore(screen: EnhancedScreen, budgetRange: PriceRange): number {
    const screenPrice = screen.price || 0;
    
    if (screenPrice >= budgetRange.min && screenPrice <= budgetRange.max) {
      return 1.0;
    }
    
    // Calculate how close the price is to the preferred range
    const distanceFromRange = Math.min(
      Math.abs(screenPrice - budgetRange.min),
      Math.abs(screenPrice - budgetRange.max)
    );
    
    const maxDistance = budgetRange.max - budgetRange.min;
    return Math.max(0, 1 - (distanceFromRange / maxDistance));
  }

  private calculateRecencyScore(screen: EnhancedScreen, userProfile: UserProfile): number {
    const daysSinceLastActivity = (Date.now() - userProfile.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceLastActivity / 30)); // Decay over 30 days
  }

  private calculatePopularityScore(screen: EnhancedScreen): number {
    const rating = screen.rating || 0;
    const bookingFrequency = this.getBookingFrequencyScore(screen.bookingFrequency);
    const engagementScore = screen.performanceMetrics.engagementScore / 100;
    
    return (rating / 5 * 0.4) + (bookingFrequency * 0.3) + (engagementScore * 0.3);
  }

  private calculateCategorySimilarity(screen1: EnhancedScreen, screen2: EnhancedScreen): number {
    return screen1.category?.id === screen2.category?.id ? 1.0 : 0.0;
  }

  private calculateLocationSimilarity(screen1: EnhancedScreen, screen2: EnhancedScreen): number {
    const loc1 = this.extractLocationFromScreen(screen1);
    const loc2 = this.extractLocationFromScreen(screen2);
    
    if (loc1.city === loc2.city) return 1.0;
    if (loc1.region === loc2.region) return 0.6;
    return 0.0;
  }

  private calculatePriceSimilarity(screen1: EnhancedScreen, screen2: EnhancedScreen): number {
    const price1 = screen1.price || 0;
    const price2 = screen2.price || 0;
    
    if (price1 === 0 || price2 === 0) return 0.5;
    
    const ratio = Math.min(price1, price2) / Math.max(price1, price2);
    return ratio;
  }

  private calculateFeatureSimilarity(screen1: EnhancedScreen, screen2: EnhancedScreen): number {
    // Compare screen specifications and features
    const specs1 = screen1.specs || {};
    const specs2 = screen2.specs || {};
    
    let matches = 0;
    let total = 0;
    
    const commonKeys = Object.keys(specs1).filter(key => key in specs2);
    
    for (const key of commonKeys) {
      total++;
      if (specs1[key] === specs2[key]) {
        matches++;
      }
    }
    
    return total > 0 ? matches / total : 0.5;
  }

  private calculateAudienceSimilarity(screen1: EnhancedScreen, screen2: EnhancedScreen): number {
    // Compare audience insights if available
    const audience1 = screen1.audienceInsights;
    const audience2 = screen2.audienceInsights;
    
    if (!audience1 || !audience2) return 0.5;
    
    // Compare primary demographics
    if (audience1.primaryDemographic === audience2.primaryDemographic) {
      return 0.8;
    }
    
    // Compare interest categories overlap
    const interests1 = new Set(audience1.interestCategories);
    const interests2 = new Set(audience2.interestCategories);
    const intersection = new Set([...interests1].filter(x => interests2.has(x)));
    const union = new Set([...interests1, ...interests2]);
    
    return union.size > 0 ? intersection.size / union.size : 0.5;
  } 
 private calculateNewnessScore(screen: EnhancedScreen): number {
    const addedDate = screen.performanceMetrics.lastUpdated;
    const daysSinceAdded = (Date.now() - addedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Full score for screens added in last 7 days, decay over 30 days
    if (daysSinceAdded <= 7) return 1.0;
    if (daysSinceAdded >= 30) return 0.0;
    
    return 1 - ((daysSinceAdded - 7) / 23);
  }

  private async calculatePreferenceMatchScore(screen: EnhancedScreen, userProfile: UserProfile): Promise<number> {
    const categoryScore = this.calculateCategoryMatchScore(screen, userProfile.preferredCategories);
    const locationScore = this.calculateLocationMatchScore(screen, userProfile.locationPreferences);
    const priceScore = this.calculatePriceMatchScore(screen, userProfile.budgetRange);
    
    return (categoryScore * 0.4) + (locationScore * 0.3) + (priceScore * 0.3);
  }

  private calculateTrendingScore(screen: EnhancedScreen): number {
    const bookingRate = screen.performanceMetrics.bookingRate;
    const engagementScore = screen.performanceMetrics.engagementScore / 100;
    const conversionRate = screen.performanceMetrics.conversionRate;
    
    return (bookingRate * 0.4) + (engagementScore * 0.3) + (conversionRate * 0.3);
  }

  // Utility methods

  private applyUserPreferenceWeighting(similarity: SimilarityScore, userProfile: UserProfile): number {
    // Apply user-specific weighting to similarity scores
    let weightedScore = similarity.totalScore;
    
    // Boost scores for preferred categories
    const preferredCategories = userProfile.preferredCategories.map(p => p.categoryId);
    // This would need access to screen data to check category
    
    return weightedScore;
  }

  private applyDiversityBonus(scores: PersonalizedScore[]): PersonalizedScore[] {
    // Apply diversity bonus to avoid showing too many similar screens
    const categoryGroups = new Map<string, PersonalizedScore[]>();
    
    // Group by category (would need screen data)
    scores.forEach(score => {
      // This is a simplified version - would need actual screen category data
      const category = 'general';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(score);
    });
    
    // Apply diversity bonus
    return scores.map(score => ({
      ...score,
      score: score.score * (1 + this.config.discoveryWeights.diversityBonus * 0.1)
    }));
  }

  private calculateScoreConfidence(factors: RecommendationFactor[], userProfile: UserProfile): number {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const userDataConfidence = Math.min(userProfile.interactionHistory.totalInteractions / 50, 1);
    
    return (totalWeight + userDataConfidence) / 2;
  }

  private calculateSectionConfidence(screens: EnhancedScreen[]): number {
    if (screens.length === 0) return 0;
    
    const avgScore = screens.reduce((sum, screen) => 
      sum + (screen.personalizedScore || 0.5), 0) / screens.length;
    
    return Math.min(avgScore, 1);
  }  
private enhanceScreenWithScore(scored: PersonalizedScore): EnhancedScreen {
    // This would enhance the screen with the calculated score
    // For now, return a placeholder - would need actual screen data
    return {} as EnhancedScreen;
  }

  private enhanceScreenWithSimilarity(screen: EnhancedScreen, similarity: SimilarityScore): EnhancedScreen {
    return {
      ...screen,
      recommendationScore: similarity.totalScore
    };
  }

  private enhanceScreenWithDiscoveryScore(scored: PersonalizedScore): EnhancedScreen {
    // This would enhance the screen with the discovery score
    return {} as EnhancedScreen;
  }

  private getBookingFrequencyScore(frequency: import('../types/intelligent-grouping.types').BookingFrequency): number {
    const frequencyScores = {
      'very-low': 0.1,
      'low': 0.3,
      'medium': 0.6,
      'high': 0.8,
      'very-high': 1.0
    };
    return frequencyScores[frequency] || 0.5;
  }

  private extractLocationFromScreen(screen: EnhancedScreen): { city: string; region: string } {
    // Extract location from screen data
    const location = screen.location || '';
    const parts = location.split(',').map(p => p.trim());
    
    return {
      city: parts[parts.length - 1] || '',
      region: parts[parts.length - 2] || ''
    };
  }

  private matchesLocation(screen: EnhancedScreen, location: string): boolean {
    const screenLocation = this.extractLocationFromScreen(screen);
    return screenLocation.city.toLowerCase().includes(location.toLowerCase()) ||
           screenLocation.region.toLowerCase().includes(location.toLowerCase());
  }

  private clearUserCaches(userId: string): void {
    // Clear similarity cache entries for this user
    const keysToDelete: string[] = [];
    this.similarityCache.forEach((_, key) => {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.similarityCache.delete(key));
  }

  // Fallback methods for error cases

  private async getFallbackTopPicks(limit: number): Promise<EnhancedScreen[]> {
    // Return popular screens as fallback
    const allScreens = await this.getAllScreens();
    return allScreens
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  private async getFallbackSimilarScreens(screenId: string, limit: number): Promise<EnhancedScreen[]> {
    // Return screens from same category as fallback
    const referenceScreen = await this.getScreenById(screenId);
    if (!referenceScreen) return [];
    
    const allScreens = await this.getAllScreens();
    return allScreens
      .filter(s => s.id !== screenId && s.category?.id === referenceScreen.category?.id)
      .slice(0, limit);
  }

  private async getFallbackNewDiscoveries(limit: number): Promise<EnhancedScreen[]> {
    // Return recently added screens as fallback
    const recentScreens = await this.getRecentScreens(30);
    return recentScreens.slice(0, limit);
  }

  // Data access methods (these would be implemented to connect to actual data sources)

  private async getAllScreens(): Promise<EnhancedScreen[]> {
    // This would fetch all screens from the data source
    // For now, return empty array - would be implemented with actual data access
    return [];
  }

  private async getScreenById(screenId: string): Promise<EnhancedScreen | null> {
    // This would fetch a specific screen by ID
    return this.screenCache.get(screenId) || null;
  }

  private async getRecentScreens(days: number): Promise<EnhancedScreen[]> {
    // This would fetch screens added in the last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const allScreens = await this.getAllScreens();
    return allScreens.filter(screen => 
      screen.performanceMetrics.lastUpdated >= cutoffDate
    );
  }
}

// Export factory function
export const createRecommendationService = (
  behaviorAnalytics: UserBehaviorAnalytics,
  preferenceAnalyzer: UserPreferenceAnalyzer,
  config?: Partial<MLModelConfig>
): RecommendationService => {
  return new RecommendationService(behaviorAnalytics, preferenceAnalyzer, config);
};