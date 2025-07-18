/**
 * Simple RecommendationService for testing
 */

import { 
  EnhancedScreen,
  UserProfile,
  UserInteraction,
  RecommendationService as IRecommendationService,
  enhanceScreen,
  ScreenPerformanceMetrics
} from '../types/intelligent-grouping.types';
import { Screen } from '../types/marketplace.types';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';
import { UserPreferenceAnalyzer } from './UserPreferenceAnalyzer';

export class RecommendationService implements IRecommendationService {
  private behaviorAnalytics: UserBehaviorAnalytics;
  private preferenceAnalyzer: UserPreferenceAnalyzer;

  constructor(
    behaviorAnalytics: UserBehaviorAnalytics,
    preferenceAnalyzer: UserPreferenceAnalyzer
  ) {
    this.behaviorAnalytics = behaviorAnalytics;
    this.preferenceAnalyzer = preferenceAnalyzer;
  }

  async getTopPicks(userId: string, limit: number = 6): Promise<EnhancedScreen[]> {
    try {
      const screens = await this.getAllScreens();
      
      // For anonymous users or users without enough data, return popular screens
      if (!userId) {
        return this.getPopularScreens(screens, limit);
      }

      // Get user profile for personalization
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      
      // If user has no interaction history, return popular screens
      if (userProfile.interactionHistory.totalInteractions === 0) {
        return this.getPopularScreens(screens, limit);
      }

      // Score screens based on user preferences
      const scoredScreens = await this.scoreScreensForUser(screens, userProfile);
      
      // Return top scored screens
      return scoredScreens
        .sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top picks:', error);
      return this.getFallbackScreens(limit);
    }
  }

  async getSimilarScreens(screenId: string, userId: string): Promise<EnhancedScreen[]> {
    try {
      const screens = await this.getAllScreens();
      const targetScreen = screens.find(s => s.id === screenId);
      
      if (!targetScreen) {
        return [];
      }

      // Find screens with similar characteristics
      const similarScreens = screens
        .filter(screen => screen.id !== screenId)
        .map(screen => {
          const similarity = this.calculateSimilarity(targetScreen, screen);
          return { screen, similarity };
        })
        .filter(item => item.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 6)
        .map(item => item.screen);

      // Enhance screens with performance metrics
      const enhancedScreens: EnhancedScreen[] = [];
      for (const screen of similarScreens) {
        const metrics = this.generateMockPerformanceMetrics(screen.id);
        const enhanced = enhanceScreen(screen, metrics);
        enhanced.recommendationScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
        enhancedScreens.push(enhanced);
      }

      return enhancedScreens;
    } catch (error) {
      console.error('Error getting similar screens:', error);
      return [];
    }
  }

  async getNewDiscoveries(userId: string, limit: number = 5): Promise<EnhancedScreen[]> {
    try {
      const screens = await this.getAllScreens();
      
      // Filter for "new" screens (added in last 30 days or with few reviews)
      const newScreens = screens.filter(screen => {
        return screen.reviews < 50 || screen.name.toLowerCase().includes('nuevo');
      });

      // If user exists, personalize based on preferences
      let scoredScreens = newScreens;
      if (userId) {
        try {
          const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
          scoredScreens = await this.scoreScreensForUser(newScreens, userProfile);
        } catch (error) {
          console.debug('Could not get user profile for new discoveries:', error);
        }
      }

      // Enhance screens with performance metrics
      const enhancedScreens: EnhancedScreen[] = [];
      for (const screen of scoredScreens.slice(0, limit)) {
        const metrics = this.generateMockPerformanceMetrics(screen.id);
        const enhanced = enhanceScreen(screen, metrics);
        enhanced.recommendationScore = Math.random() * 0.4 + 0.6; // 0.6-1.0
        enhancedScreens.push(enhanced);
      }

      return enhancedScreens;
    } catch (error) {
      console.error('Error getting new discoveries:', error);
      return this.getFallbackScreens(limit);
    }
  }

  async getTrendingScreens(location?: string, limit?: number): Promise<EnhancedScreen[]> {
    try {
      const screens = await this.getAllScreens();
      let filteredScreens = screens;

      // Filter by location if provided
      if (location) {
        filteredScreens = screens.filter(screen => 
          screen.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Sort by a combination of rating, views, and recent activity
      const trendingScreens = filteredScreens
        .map(screen => {
          const trendScore = this.calculateTrendScore(screen);
          return { screen, trendScore };
        })
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit || 8)
        .map(item => item.screen);

      // Enhance screens with performance metrics
      const enhancedScreens: EnhancedScreen[] = [];
      for (const screen of trendingScreens) {
        const metrics = this.generateMockPerformanceMetrics(screen.id);
        const enhanced = enhanceScreen(screen, metrics);
        enhanced.trendingScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
        enhancedScreens.push(enhanced);
      }

      return enhancedScreens;
    } catch (error) {
      console.error('Error getting trending screens:', error);
      return this.getFallbackScreens(limit || 8);
    }
  }

  async updateUserPreferences(userId: string, interactions: UserInteraction[]): Promise<void> {
    // This would update user preferences based on interactions
    // For now, we'll just log the interactions
    console.debug(`Updating preferences for user ${userId} with ${interactions.length} interactions`);
  }

  async generatePersonalizedSections(userId: string): Promise<import('../types/intelligent-grouping.types').MarketplaceSection[]> {
    // This would generate complete personalized sections
    // For now, return empty array as this is handled by GroupingEngine
    return [];
  }

  // Private helper methods

  private async getAllScreens(): Promise<Screen[]> {
    try {
      const { demoScreens } = await import('../../../data/demoScreens');
      return demoScreens as Screen[];
    } catch (error) {
      console.error('Error loading screens:', error);
      return [];
    }
  }

  private getPopularScreens(screens: Screen[], limit: number): EnhancedScreen[] {
    const popularScreens = screens
      .sort((a, b) => {
        // Sort by rating and views
        const scoreA = a.rating * 0.6 + (a.views.daily / 10000) * 0.4;
        const scoreB = b.rating * 0.6 + (b.views.daily / 10000) * 0.4;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return popularScreens.map(screen => {
      const metrics = this.generateMockPerformanceMetrics(screen.id);
      const enhanced = enhanceScreen(screen, metrics);
      enhanced.personalizedScore = Math.random() * 0.3 + 0.5; // 0.5-0.8
      return enhanced;
    });
  }

  private async scoreScreensForUser(screens: Screen[], userProfile: UserProfile): Promise<EnhancedScreen[]> {
    const scoredScreens: EnhancedScreen[] = [];

    for (const screen of screens) {
      const metrics = this.generateMockPerformanceMetrics(screen.id);
      const enhanced = enhanceScreen(screen, metrics);
      
      // Calculate personalized score based on user preferences
      let score = 0.5; // Base score

      // Category preference scoring
      const categoryPref = userProfile.preferredCategories.find(
        cat => cat.categoryId === screen.category?.id
      );
      if (categoryPref) {
        score += categoryPref.score * 0.3;
      }

      // Location preference scoring
      const locationPref = userProfile.locationPreferences.find(
        loc => screen.location.toLowerCase().includes(loc.city.toLowerCase())
      );
      if (locationPref) {
        score += locationPref.score * 0.2;
      }

      // Budget compatibility
      if (screen.price >= userProfile.budgetRange.min && screen.price <= userProfile.budgetRange.max) {
        score += 0.2;
      }

      // Rating bonus
      score += (screen.rating - 3) * 0.1; // Bonus for ratings above 3

      enhanced.personalizedScore = Math.min(score, 1);
      scoredScreens.push(enhanced);
    }

    return scoredScreens;
  }

  private calculateSimilarity(screen1: Screen, screen2: Screen): number {
    let similarity = 0;

    // Category similarity
    if (screen1.category?.id === screen2.category?.id) {
      similarity += 0.4;
    }

    // Price similarity (within 30% range)
    const priceDiff = Math.abs(screen1.price - screen2.price) / Math.max(screen1.price, screen2.price);
    if (priceDiff < 0.3) {
      similarity += 0.3;
    }

    // Location similarity (same city)
    const city1 = screen1.location.split(',').pop()?.trim().toLowerCase();
    const city2 = screen2.location.split(',').pop()?.trim().toLowerCase();
    if (city1 === city2) {
      similarity += 0.2;
    }

    // Rating similarity
    const ratingDiff = Math.abs(screen1.rating - screen2.rating);
    if (ratingDiff < 0.5) {
      similarity += 0.1;
    }

    return similarity;
  }

  private calculateTrendScore(screen: Screen): number {
    // Calculate trend score based on various factors
    const ratingScore = screen.rating / 5; // Normalize rating
    const viewsScore = Math.min(screen.views.daily / 100000, 1); // Normalize views
    const reviewsScore = Math.min(screen.reviews / 100, 1); // Normalize reviews
    
    // Random factor to simulate recent activity
    const activityScore = Math.random() * 0.3;

    return ratingScore * 0.3 + viewsScore * 0.3 + reviewsScore * 0.2 + activityScore * 0.2;
  }

  private generateMockPerformanceMetrics(screenId: string): ScreenPerformanceMetrics {
    return {
      screenId,
      bookingRate: Math.random() * 8 + 2, // 2-10
      averageRating: Math.random() * 1.5 + 3.5, // 3.5-5.0
      engagementScore: Math.random() * 40 + 60, // 60-100
      revenueGenerated: Math.random() * 5000000 + 1000000, // 1M-6M
      impressionCount: Math.floor(Math.random() * 50000 + 10000), // 10K-60K
      conversionRate: Math.random() * 0.08 + 0.02, // 2-10%
      lastUpdated: new Date(),
      trendDirection: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    };
  }

  private getFallbackScreens(limit: number): EnhancedScreen[] {
    // Return some basic fallback screens
    const fallbackScreenData = [
      {
        id: 'fallback-1',
        name: 'Pantalla Popular - Centro',
        location: 'Centro, Bogotá',
        price: 800000,
        availability: true,
        image: '/screens_photos/976-5f4a82cd6c675.jpg',
        category: { id: 'billboard', name: 'Valla' },
        environment: 'outdoor' as const,
        specs: { width: 1920, height: 1080, resolution: 'Full HD', brightness: '5000 nits' },
        views: { daily: 50000, monthly: 1500000 },
        rating: 4.5,
        reviews: 85,
        coordinates: { lat: 4.6097, lng: -74.0817 }
      }
    ];

    return fallbackScreenData.slice(0, limit).map(screen => {
      const metrics = this.generateMockPerformanceMetrics(screen.id);
      return enhanceScreen(screen as Screen, metrics);
    });
  }
}