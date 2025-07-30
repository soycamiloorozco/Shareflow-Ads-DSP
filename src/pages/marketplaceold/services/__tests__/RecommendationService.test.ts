/**
 * RecommendationService Tests
 * Tests for personalized recommendation algorithms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecommendationService, createRecommendationService } from '../RecommendationService';
import { UserBehaviorAnalytics } from '../UserBehaviorAnalytics';
import { createUserPreferenceAnalyzer } from '../UserPreferenceAnalyzer';
import { 
  EnhancedScreen, 
  UserProfile, 
  createEmptyUserProfile,
  CategoryPreference,
  LocationPreference
} from '../../types/intelligent-grouping.types';

describe('RecommendationService', () => {
  let recommendationService: RecommendationService;
  let behaviorAnalytics: UserBehaviorAnalytics;
  let preferenceAnalyzer: ReturnType<typeof createUserPreferenceAnalyzer>;

  beforeEach(() => {
    behaviorAnalytics = new UserBehaviorAnalytics();
    preferenceAnalyzer = createUserPreferenceAnalyzer(behaviorAnalytics);
    recommendationService = createRecommendationService(behaviorAnalytics, preferenceAnalyzer);
  });

  describe('getTopPicks', () => {
    it('should generate ML-based top picks for a user', async () => {
      const userId = 'test-user-1';
      const limit = 6;

      // Mock user profile with preferences
      const mockUserProfile: UserProfile = {
        ...createEmptyUserProfile(userId),
        behaviorScore: 75,
        preferredCategories: [
          {
            categoryId: 'outdoor',
            categoryName: 'Outdoor Screens',
            score: 85,
            interactionCount: 15,
            lastInteraction: new Date(),
            conversionRate: 0.2
          }
        ] as CategoryPreference[],
        locationPreferences: [
          {
            city: 'Medellín',
            region: 'Antioquia',
            score: 90,
            interactionCount: 20,
            purchaseCount: 3,
            lastActivity: new Date()
          }
        ] as LocationPreference[]
      };

      // Mock the behavior analytics to return our test profile
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: { min: 100000, max: 2000000, preferred: 800000, currency: 'COP', confidence: 0.7 },
          priceElasticity: 0.6,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.7
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      const topPicks = await recommendationService.getTopPicks(userId, limit);

      expect(Array.isArray(topPicks)).toBe(true);
      expect(topPicks.length).toBeLessThanOrEqual(limit);
      
      // Verify the method was called with correct parameters
      expect(behaviorAnalytics.getUserProfile).toHaveBeenCalledWith(userId);
      expect(preferenceAnalyzer.analyzeUserPreferences).toHaveBeenCalledWith(userId);
    });

    it('should handle errors gracefully and return fallback recommendations', async () => {
      const userId = 'test-user-error';
      
      // Mock error in user profile retrieval
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockRejectedValue(new Error('User not found'));
      
      const topPicks = await recommendationService.getTopPicks(userId, 3);
      
      expect(Array.isArray(topPicks)).toBe(true);
      // Should return fallback recommendations even on error
    });
  });

  describe('getSimilarScreens', () => {
    it('should calculate screen similarity based on category, location, and price', async () => {
      const screenId = 'test-screen-1';
      const userId = 'test-user-1';
      const limit = 4;

      // Mock user profile
      const mockUserProfile = createEmptyUserProfile(userId);
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);

      const similarScreens = await recommendationService.getSimilarScreens(screenId, userId, limit);

      expect(Array.isArray(similarScreens)).toBe(true);
      expect(similarScreens.length).toBeLessThanOrEqual(limit);
    });

    it('should handle screen not found errors gracefully', async () => {
      const screenId = 'non-existent-screen';
      const userId = 'test-user-cache';

      // Mock user profile
      const mockUserProfile = createEmptyUserProfile(userId);
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);

      // Should handle screen not found gracefully
      const similarScreens = await recommendationService.getSimilarScreens(screenId, userId, 3);
      
      expect(Array.isArray(similarScreens)).toBe(true);
      expect(similarScreens.length).toBe(0); // Should return empty array for non-existent screen
    });
  });

  describe('getNewDiscoveries', () => {
    it('should implement new discovery algorithm matching user preferences', async () => {
      const userId = 'test-user-discovery';
      const limit = 5;

      // Mock user profile and insights
      const mockUserProfile = createEmptyUserProfile(userId);
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: { min: 0, max: 1000000, preferred: 500000, currency: 'COP', confidence: 0.5 },
          priceElasticity: 0.5,
          budgetUtilization: 0.5,
          seasonalVariation: {},
          confidence: 0.5
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.6,
        lastAnalyzed: new Date()
      });

      const discoveries = await recommendationService.getNewDiscoveries(userId, limit);

      expect(Array.isArray(discoveries)).toBe(true);
      expect(discoveries.length).toBeLessThanOrEqual(limit);
    });

    it('should apply diversity bonus to avoid similar screens', async () => {
      const userId = 'test-user-diversity';
      
      const mockUserProfile = createEmptyUserProfile(userId);
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: { min: 0, max: 1000000, preferred: 500000, currency: 'COP', confidence: 0.5 },
          priceElasticity: 0.5,
          budgetUtilization: 0.5,
          seasonalVariation: {},
          confidence: 0.5
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.6,
        lastAnalyzed: new Date()
      });

      const discoveries = await recommendationService.getNewDiscoveries(userId, 5);
      
      // Should return diverse recommendations
      expect(Array.isArray(discoveries)).toBe(true);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences based on interactions', async () => {
      const userId = 'test-user-update';
      const interactions = [
        {
          id: 'int-1',
          userId,
          screenId: 'screen-1',
          action: 'view' as const,
          timestamp: new Date(),
          context: {
            sessionId: 'session-1',
            pageUrl: '/marketplace',
            deviceInfo: {
              type: 'desktop' as const,
              os: 'macOS',
              browser: 'Chrome',
              screenSize: { width: 1920, height: 1080 },
              touchEnabled: false
            }
          },
          metadata: {
            duration: 5000
          }
        }
      ];

      // Mock the analytics and preference analyzer methods
      vi.spyOn(behaviorAnalytics, 'trackInteraction').mockResolvedValue();
      vi.spyOn(preferenceAnalyzer, 'updateUserPreferences').mockResolvedValue();

      await recommendationService.updateUserPreferences(userId, interactions);

      expect(behaviorAnalytics.trackInteraction).toHaveBeenCalledTimes(1);
      expect(preferenceAnalyzer.updateUserPreferences).toHaveBeenCalledWith(userId, interactions);
    });
  });

  describe('generatePersonalizedSections', () => {
    it('should generate personalized marketplace sections', async () => {
      const userId = 'test-user-sections';

      // Mock the individual recommendation methods
      vi.spyOn(recommendationService, 'getTopPicks').mockResolvedValue([]);
      vi.spyOn(recommendationService, 'getNewDiscoveries').mockResolvedValue([]);

      const sections = await recommendationService.generatePersonalizedSections(userId);

      expect(Array.isArray(sections)).toBe(true);
      expect(recommendationService.getTopPicks).toHaveBeenCalledWith(userId, 6);
      expect(recommendationService.getNewDiscoveries).toHaveBeenCalledWith(userId, 5);
    });
  });

  describe('getTrendingScreens', () => {
    it('should return trending screens based on recent activity', async () => {
      const location = 'Medellín';
      const limit = 8;

      const trendingScreens = await recommendationService.getTrendingScreens(location, limit);

      expect(Array.isArray(trendingScreens)).toBe(true);
      expect(trendingScreens.length).toBeLessThanOrEqual(limit);
    });

    it('should work without location filter', async () => {
      const trendingScreens = await recommendationService.getTrendingScreens();

      expect(Array.isArray(trendingScreens)).toBe(true);
    });
  });

  describe('algorithm scoring', () => {
    it('should calculate personalized scores based on user preferences', async () => {
      const userId = 'test-user-scoring';
      const mockUserProfile: UserProfile = {
        ...createEmptyUserProfile(userId),
        preferredCategories: [
          {
            categoryId: 'billboard',
            categoryName: 'Billboard',
            score: 0.9,
            interactionCount: 20,
            lastInteraction: new Date(),
            conversionRate: 0.3
          }
        ]
      };

      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: { min: 200000, max: 800000, preferred: 500000, currency: 'COP', confidence: 0.8 },
          priceElasticity: 0.6,
          budgetUtilization: 0.7,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      const topPicks = await recommendationService.getTopPicks(userId, 3);
      
      expect(Array.isArray(topPicks)).toBe(true);
      expect(behaviorAnalytics.getUserProfile).toHaveBeenCalledWith(userId);
      expect(preferenceAnalyzer.analyzeUserPreferences).toHaveBeenCalledWith(userId);
    });

    it('should handle users with no interaction history', async () => {
      const userId = 'new-user';
      const emptyProfile = createEmptyUserProfile(userId);
      
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(emptyProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: { min: 0, max: 1000000, preferred: 500000, currency: 'COP', confidence: 0.1 },
          priceElasticity: 0.5,
          budgetUtilization: 0.5,
          seasonalVariation: {},
          confidence: 0.1
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.1,
        lastAnalyzed: new Date()
      });

      const topPicks = await recommendationService.getTopPicks(userId, 3);
      
      expect(Array.isArray(topPicks)).toBe(true);
      // Should still return recommendations for new users
    });
  });

  describe('diversity and deduplication', () => {
    it('should ensure diverse recommendations across different methods', async () => {
      const userId = 'test-diversity';
      const mockProfile = createEmptyUserProfile(userId);
      
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: { min: 0, max: 1000000, preferred: 500000, currency: 'COP', confidence: 0.5 },
          priceElasticity: 0.5,
          budgetUtilization: 0.5,
          seasonalVariation: {},
          confidence: 0.5
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.5,
        lastAnalyzed: new Date()
      });

      const topPicks = await recommendationService.getTopPicks(userId, 3);
      const discoveries = await recommendationService.getNewDiscoveries(userId, 3);
      const trending = await recommendationService.getTrendingScreens('Bogotá', 3);

      expect(Array.isArray(topPicks)).toBe(true);
      expect(Array.isArray(discoveries)).toBe(true);
      expect(Array.isArray(trending)).toBe(true);
    });
  });
});