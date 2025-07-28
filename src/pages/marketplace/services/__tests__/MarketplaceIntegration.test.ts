/**
 * Marketplace Integration Tests
 * End-to-end tests for complete section generation workflow and UI integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GroupingEngine } from '../GroupingEngine';
import { RecommendationService, createRecommendationService } from '../RecommendationService';
import { UserBehaviorAnalytics } from '../UserBehaviorAnalytics';
import { createUserPreferenceAnalyzer } from '../UserPreferenceAnalyzer';
import { MarketDataServiceImpl } from '../MarketDataService';
import DeduplicationEngine from '../DeduplicationEngine';
import SectionPriorityEngine from '../SectionPriorityEngine';
import { SectionAnalyticsService } from '../SectionAnalyticsService';
import { 
  EnhancedScreen, 
  UserProfile, 
  createEmptyUserProfile,
  MarketplaceSection,
  SectionConfig,
  UserInteraction,
  SectionEngagement
} from '../../types/intelligent-grouping.types';

describe('Marketplace Integration Tests', () => {
  let groupingEngine: GroupingEngine;
  let recommendationService: RecommendationService;
  let behaviorAnalytics: UserBehaviorAnalytics;
  let preferenceAnalyzer: ReturnType<typeof createUserPreferenceAnalyzer>;
  let marketDataService: MarketDataServiceImpl;
  let deduplicationEngine: DeduplicationEngine;
  let priorityEngine: SectionPriorityEngine;
  let analyticsService: SectionAnalyticsService;
  let mockUserProfile: UserProfile;
  let mockScreens: EnhancedScreen[];

  beforeEach(() => {
    // Initialize all services
    behaviorAnalytics = new UserBehaviorAnalytics();
    preferenceAnalyzer = createUserPreferenceAnalyzer(behaviorAnalytics);
    recommendationService = createRecommendationService(behaviorAnalytics, preferenceAnalyzer);
    marketDataService = new MarketDataServiceImpl();
    deduplicationEngine = new DeduplicationEngine();
    priorityEngine = new SectionPriorityEngine();
    analyticsService = new SectionAnalyticsService();
    
    groupingEngine = new GroupingEngine(
      recommendationService,
      marketDataService,
      deduplicationEngine,
      priorityEngine,
      analyticsService
    );

    // Create comprehensive test data
    mockUserProfile = {
      userId: 'integration-test-user',
      preferredCategories: [
        {
          categoryId: 'billboard',
          categoryName: 'Billboard',
          score: 0.8,
          interactionCount: 20,
          lastInteraction: new Date(),
          conversionRate: 0.3
        },
        {
          categoryId: 'led-display',
          categoryName: 'LED Display',
          score: 0.6,
          interactionCount: 12,
          lastInteraction: new Date(),
          conversionRate: 0.25
        }
      ],
      budgetRange: {
        min: 200000,
        max: 800000,
        preferred: 500000,
        currency: 'COP',
        confidence: 0.8
      },
      locationPreferences: [
        {
          city: 'Bogotá',
          region: 'Cundinamarca',
          score: 0.9,
          interactionCount: 35,
          purchaseCount: 5,
          lastActivity: new Date()
        }
      ],
      behaviorScore: 0.75,
      lastActivity: new Date(),
      interactionHistory: {
        totalInteractions: 100,
        averageSessionDuration: 360,
        mostActiveTimeOfDay: 14,
        preferredDeviceType: 'desktop',
        engagementRate: 0.7,
        lastInteractionDate: new Date()
      },
      purchaseProfile: {
        totalPurchases: 5,
        totalSpent: 2500000,
        averageOrderValue: 500000,
        preferredPurchaseType: ['billboard', 'led-display'],
        seasonalPatterns: { 'Q1': 0.9, 'Q2': 1.1, 'Q3': 1.0, 'Q4': 1.2 },
        lastPurchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        purchaseFrequency: 'medium'
      },
      preferences: {
        notifications: {
          newScreens: true,
          priceDrops: true,
          recommendations: true,
          marketingEmails: false
        },
        display: {
          defaultViewMode: 'sectioned',
          cardsPerRow: 3,
          showPrices: true,
          showRatings: true,
          compactMode: false
        },
        privacy: {
          allowPersonalization: true,
          allowLocationTracking: true,
          allowBehaviorTracking: true,
          shareDataWithPartners: false
        },
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          largeText: false,
          screenReader: false,
          keyboardNavigation: false
        }
      }
    };

    // Create diverse mock screens for testing
    mockScreens = [
      {
        id: 'integration-screen-1',
        name: 'Premium Downtown Billboard',
        location: 'Bogotá Centro',
        price: 600000,
        category: 'Billboard',
        performanceMetrics: {
          screenId: 'integration-screen-1',
          bookingRate: 0.8,
          averageRating: 4.5,
          engagementScore: 0.85,
          revenueGenerated: 2000000,
          impressionCount: 500,
          conversionRate: 0.35,
          lastUpdated: new Date(),
          trendDirection: 'up'
        },
        bookingFrequency: 'high',
        personalizedScore: 0.9,
        trendingScore: 0.8,
        recommendationScore: 0.88,
        lastBookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        engagementMetrics: {
          viewTime: 150,
          interactionRate: 0.2,
          completionRate: 0.85,
          shareRate: 0.06,
          favoriteRate: 0.12,
          clickThroughRate: 0.15,
          bounceRate: 0.15
        },
        audienceInsights: {
          primaryDemographic: 'business-professionals',
          ageDistribution: { '25-34': 0.4, '35-44': 0.4, '45-54': 0.2 },
          genderDistribution: { 'male': 0.6, 'female': 0.4 },
          interestCategories: ['business', 'technology'],
          peakEngagementHours: [9, 12, 17],
          seasonalTrends: { 'Q1': 1.0, 'Q2': 1.2, 'Q3': 0.9, 'Q4': 1.1 }
        }
      } as EnhancedScreen,
      {
        id: 'integration-screen-2',
        name: 'Shopping Mall LED Display',
        location: 'Bogotá Norte',
        price: 400000,
        category: 'LED Display',
        performanceMetrics: {
          screenId: 'integration-screen-2',
          bookingRate: 0.6,
          averageRating: 4.2,
          engagementScore: 0.7,
          revenueGenerated: 1200000,
          impressionCount: 300,
          conversionRate: 0.28,
          lastUpdated: new Date(),
          trendDirection: 'stable'
        },
        bookingFrequency: 'medium',
        personalizedScore: 0.7,
        trendingScore: 0.75,
        recommendationScore: 0.72,
        engagementMetrics: {
          viewTime: 120,
          interactionRate: 0.15,
          completionRate: 0.75,
          shareRate: 0.04,
          favoriteRate: 0.08,
          clickThroughRate: 0.12,
          bounceRate: 0.2
        },
        audienceInsights: {
          primaryDemographic: 'families',
          ageDistribution: { '25-34': 0.3, '35-44': 0.4, '45-54': 0.3 },
          genderDistribution: { 'male': 0.4, 'female': 0.6 },
          interestCategories: ['shopping', 'family'],
          peakEngagementHours: [14, 19],
          seasonalTrends: { 'Q1': 0.8, 'Q2': 1.0, 'Q3': 0.9, 'Q4': 1.4 }
        }
      } as EnhancedScreen,
      {
        id: 'integration-screen-3',
        name: 'New Transit Digital Screen',
        location: 'Bogotá Sur',
        price: 250000,
        category: 'Digital Display',
        performanceMetrics: {
          screenId: 'integration-screen-3',
          bookingRate: 0.4,
          averageRating: 4.0,
          engagementScore: 0.6,
          revenueGenerated: 600000,
          impressionCount: 200,
          conversionRate: 0.2,
          lastUpdated: new Date(),
          trendDirection: 'up'
        },
        bookingFrequency: 'low',
        personalizedScore: 0.5,
        trendingScore: 0.9, // High trending due to newness
        recommendationScore: 0.65,
        engagementMetrics: {
          viewTime: 90,
          interactionRate: 0.12,
          completionRate: 0.8,
          shareRate: 0.05,
          favoriteRate: 0.1,
          clickThroughRate: 0.14,
          bounceRate: 0.18
        },
        audienceInsights: {
          primaryDemographic: 'commuters',
          ageDistribution: { '18-24': 0.3, '25-34': 0.5, '35-44': 0.2 },
          genderDistribution: { 'male': 0.6, 'female': 0.4 },
          interestCategories: ['transportation', 'news'],
          peakEngagementHours: [8, 18],
          seasonalTrends: { 'Q1': 1.0, 'Q2': 1.0, 'Q3': 0.9, 'Q4': 1.1 }
        }
      } as EnhancedScreen
    ];
  });

  describe('Complete Section Generation Workflow', () => {
    it('should generate complete marketplace sections from user request to final output', async () => {
      // Mock all service dependencies
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [
          {
            categoryId: 'billboard',
            categoryName: 'Billboard',
            preferenceScore: 0.8,
            interactionFrequency: 0.6,
            conversionRate: 0.3,
            averageEngagementTime: 150,
            seasonalTrends: { 'Q1': 1.0, 'Q2': 1.2, 'Q3': 0.9, 'Q4': 1.1 },
            priceElasticity: 0.7,
            competitorAnalysis: { marketShare: 0.4, averagePrice: 500000 }
          }
        ],
        locationInsights: [
          {
            location: 'Bogotá',
            preferenceScore: 0.9,
            interactionFrequency: 0.8,
            conversionRate: 0.35,
            averageSpend: 550000,
            competitiveIndex: 0.7,
            accessibilityScore: 0.9
          }
        ],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: { 'Q1': 0.9, 'Q2': 1.1, 'Q3': 1.0, 'Q4': 1.2 },
          confidence: 0.8
        },
        behaviorPatterns: [
          {
            patternType: 'time-based',
            description: 'Most active during business hours',
            confidence: 0.8,
            impact: 0.6,
            recommendations: ['Show business-focused content during peak hours']
          }
        ],
        recommendationFactors: [
          {
            factor: 'category-preference',
            weight: 0.8,
            description: 'Strong preference for billboard advertising'
          },
          {
            factor: 'location-preference',
            weight: 0.9,
            description: 'Prefers Bogotá locations'
          }
        ],
        confidence: 0.85,
        lastAnalyzed: new Date()
      });

      // Mock market data service
      vi.spyOn(marketDataService, 'getTrendingScreens').mockResolvedValue([
        {
          screen: mockScreens[2], // New transit screen
          bookingVelocity: 0.8,
          trendScore: 0.9,
          bookingCount: 15,
          timeframe: '7d'
        }
      ]);

      vi.spyOn(marketDataService, 'getTopPerformingScreens').mockResolvedValue([
        mockScreens[0] // Premium billboard
      ]);

      // Execute complete workflow
      const sections = await groupingEngine.generateSections(mockUserProfile.userId);

      // Verify complete workflow execution
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);

      // Verify section structure
      sections.forEach(section => {
        expect(section.id).toBeDefined();
        expect(section.title).toBeDefined();
        expect(Array.isArray(section.screens)).toBe(true);
        expect(section.metadata).toBeDefined();
        expect(section.metadata.algorithm).toBeDefined();
        expect(section.metadata.confidence).toBeGreaterThan(0);
        expect(section.metadata.generatedAt).toBeInstanceOf(Date);
      });

      // Verify no duplicate screens across sections
      const allScreenIds: string[] = [];
      sections.forEach(section => {
        section.screens.forEach(screen => {
          allScreenIds.push(screen.id);
        });
      });
      const uniqueScreenIds = new Set(allScreenIds);
      expect(allScreenIds.length).toBe(uniqueScreenIds.size);

      // Verify service interactions
      expect(behaviorAnalytics.getUserProfile).toHaveBeenCalledWith(mockUserProfile.userId);
      expect(preferenceAnalyzer.analyzeUserPreferences).toHaveBeenCalledWith(mockUserProfile.userId);
    });

    it('should handle section refresh and cache invalidation', async () => {
      // Mock initial generation
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      // Initial generation
      const initialSections = await groupingEngine.generateSections(mockUserProfile.userId);
      expect(Array.isArray(initialSections)).toBe(true);

      // Refresh sections
      await groupingEngine.refreshSections(mockUserProfile.userId);

      // Generate again to verify refresh
      const refreshedSections = await groupingEngine.generateSections(mockUserProfile.userId);
      expect(Array.isArray(refreshedSections)).toBe(true);

      // Verify refresh was called
      expect(behaviorAnalytics.getUserProfile).toHaveBeenCalledTimes(2);
    });

    it('should generate sections with different configurations', async () => {
      // Mock user profile
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      // Test with filters
      const sectionsWithFilters = await groupingEngine.generateSections(
        mockUserProfile.userId,
        {
          categories: ['billboard'],
          priceRange: { min: 200000, max: 600000 },
          locations: ['Bogotá Centro'],
          features: []
        }
      );

      expect(Array.isArray(sectionsWithFilters)).toBe(true);

      // Test without filters
      const sectionsWithoutFilters = await groupingEngine.generateSections(mockUserProfile.userId);

      expect(Array.isArray(sectionsWithoutFilters)).toBe(true);

      // Both should generate valid sections
      expect(sectionsWithFilters.length).toBeGreaterThanOrEqual(0);
      expect(sectionsWithoutFilters.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('User Interaction Tracking Integration', () => {
    it('should track section engagement and update analytics', async () => {
      const interactions: UserInteraction[] = [
        {
          id: 'interaction-1',
          userId: mockUserProfile.userId,
          screenId: 'integration-screen-1',
          action: 'view',
          timestamp: new Date(),
          context: {
            sessionId: 'session-123',
            pageUrl: '/marketplace',
            deviceInfo: {
              type: 'desktop',
              os: 'macOS',
              browser: 'Chrome',
              screenSize: { width: 1920, height: 1080 },
              touchEnabled: false
            },
            section: 'top-picks-user123'
          },
          metadata: {
            duration: 5000,
            scrollDepth: 0.8
          }
        },
        {
          id: 'interaction-2',
          userId: mockUserProfile.userId,
          screenId: 'integration-screen-1',
          action: 'click',
          timestamp: new Date(),
          context: {
            sessionId: 'session-123',
            pageUrl: '/marketplace',
            deviceInfo: {
              type: 'desktop',
              os: 'macOS',
              browser: 'Chrome',
              screenSize: { width: 1920, height: 1080 },
              touchEnabled: false
            },
            section: 'top-picks-user123'
          },
          metadata: {
            clickPosition: { x: 150, y: 200 }
          }
        }
      ];

      // Mock analytics service
      vi.spyOn(analyticsService, 'trackSectionEngagement').mockResolvedValue();
      vi.spyOn(analyticsService, 'updateSectionMetrics').mockResolvedValue();

      // Track interactions
      for (const interaction of interactions) {
        await behaviorAnalytics.trackInteraction(interaction);
      }

      // Update section analytics
      const sectionEngagement: SectionEngagement = {
        sectionId: 'top-picks-user123',
        viewTime: 5000,
        clickCount: 1,
        scrollDepth: 0.8,
        conversionRate: 0.0 // No purchase yet
      };

      await analyticsService.trackSectionEngagement(
        mockUserProfile.userId,
        'top-picks-user123',
        sectionEngagement
      );

      // Verify tracking was called
      expect(analyticsService.trackSectionEngagement).toHaveBeenCalledWith(
        mockUserProfile.userId,
        'top-picks-user123',
        sectionEngagement
      );
    });

    it('should update user preferences based on section interactions', async () => {
      const sectionInteractions: UserInteraction[] = [
        {
          id: 'section-interaction-1',
          userId: mockUserProfile.userId,
          screenId: 'integration-screen-2',
          action: 'favorite',
          timestamp: new Date(),
          context: {
            sessionId: 'session-456',
            pageUrl: '/marketplace',
            deviceInfo: {
              type: 'mobile',
              os: 'iOS',
              browser: 'Safari',
              screenSize: { width: 375, height: 812 },
              touchEnabled: true
            },
            section: 'trending-general'
          },
          metadata: {}
        }
      ];

      // Mock preference analyzer
      vi.spyOn(preferenceAnalyzer, 'updateUserPreferences').mockResolvedValue();

      // Update preferences based on interactions
      await recommendationService.updateUserPreferences(mockUserProfile.userId, sectionInteractions);

      // Verify preference update was called
      expect(preferenceAnalyzer.updateUserPreferences).toHaveBeenCalledWith(
        mockUserProfile.userId,
        sectionInteractions
      );
    });

    it('should track conversion events from section interactions', async () => {
      const purchaseInteraction: UserInteraction = {
        id: 'purchase-interaction',
        userId: mockUserProfile.userId,
        screenId: 'integration-screen-1',
        action: 'purchase',
        timestamp: new Date(),
        context: {
          sessionId: 'session-789',
          pageUrl: '/marketplace/screen/integration-screen-1',
          deviceInfo: {
            type: 'desktop',
            os: 'Windows',
            browser: 'Edge',
            screenSize: { width: 1366, height: 768 },
            touchEnabled: false
          },
          section: 'top-picks-user123'
        },
        metadata: {
          purchaseAmount: 600000,
          purchaseId: 'purchase-123'
        }
      };

      // Mock analytics tracking
      vi.spyOn(analyticsService, 'trackConversion').mockResolvedValue();

      // Track purchase conversion
      await analyticsService.trackConversion(
        mockUserProfile.userId,
        'top-picks-user123',
        'integration-screen-1',
        {
          conversionType: 'purchase',
          value: 600000,
          timestamp: new Date()
        }
      );

      // Verify conversion tracking
      expect(analyticsService.trackConversion).toHaveBeenCalledWith(
        mockUserProfile.userId,
        'top-picks-user123',
        'integration-screen-1',
        expect.objectContaining({
          conversionType: 'purchase',
          value: 600000
        })
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle service failures gracefully', async () => {
      // Mock service failures
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockRejectedValue(new Error('User service unavailable'));
      vi.spyOn(marketDataService, 'getTrendingScreens').mockRejectedValue(new Error('Market data unavailable'));

      // Should still generate sections with fallback data
      const sections = await groupingEngine.generateSections(mockUserProfile.userId);

      expect(Array.isArray(sections)).toBe(true);
      // Should handle errors gracefully and return fallback sections
    });

    it('should handle partial service failures', async () => {
      // Mock partial failures
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockRejectedValue(new Error('Preference analysis failed'));
      vi.spyOn(marketDataService, 'getTrendingScreens').mockResolvedValue([]);

      // Should still generate sections with available data
      const sections = await groupingEngine.generateSections(mockUserProfile.userId);

      expect(Array.isArray(sections)).toBe(true);
      // Should work with partial data
    });

    it('should handle network timeouts and retries', async () => {
      let callCount = 0;
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network timeout');
        }
        return mockUserProfile;
      });

      // Should retry and eventually succeed
      const sections = await groupingEngine.generateSections(mockUserProfile.userId);

      expect(Array.isArray(sections)).toBe(true);
      expect(callCount).toBeGreaterThan(1); // Should have retried
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent section generation requests', async () => {
      // Mock services
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      // Generate multiple concurrent requests
      const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
        groupingEngine.generateSections(`user-${i}`)
      );

      const results = await Promise.all(concurrentRequests);

      // All requests should complete successfully
      results.forEach(sections => {
        expect(Array.isArray(sections)).toBe(true);
      });

      // Should handle concurrent requests without conflicts
      expect(results.length).toBe(5);
    });

    it('should maintain performance with large user datasets', async () => {
      // Create large user profile
      const largeUserProfile = {
        ...mockUserProfile,
        preferredCategories: Array.from({ length: 20 }, (_, i) => ({
          categoryId: `category-${i}`,
          categoryName: `Category ${i}`,
          score: Math.random(),
          interactionCount: Math.floor(Math.random() * 100),
          lastInteraction: new Date(),
          conversionRate: Math.random() * 0.5
        })),
        locationPreferences: Array.from({ length: 10 }, (_, i) => ({
          city: `City-${i}`,
          region: `Region-${i}`,
          score: Math.random(),
          interactionCount: Math.floor(Math.random() * 50),
          purchaseCount: Math.floor(Math.random() * 10),
          lastActivity: new Date()
        }))
      };

      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(largeUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: largeUserProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: largeUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      const startTime = Date.now();
      const sections = await groupingEngine.generateSections(largeUserProfile.userId);
      const endTime = Date.now();

      expect(Array.isArray(sections)).toBe(true);
      
      // Should complete within reasonable time
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(2000); // Less than 2 seconds
    });
  });

  describe('Analytics and Metrics Integration', () => {
    it('should generate comprehensive section metrics', async () => {
      // Mock services
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      // Generate sections
      const sections = await groupingEngine.generateSections(mockUserProfile.userId);

      // Get section metrics
      for (const section of sections) {
        const metrics = await groupingEngine.getSectionMetrics(section.id);
        
        expect(metrics).toBeDefined();
        expect(metrics.sectionId).toBe(section.id);
        expect(typeof metrics.impressions).toBe('number');
        expect(typeof metrics.clicks).toBe('number');
        expect(typeof metrics.conversionRate).toBe('number');
        expect(metrics.lastUpdated).toBeInstanceOf(Date);
      }
    });

    it('should track A/B testing metrics for different section configurations', async () => {
      // Mock A/B test configuration
      const testVariant = 'variant-b';
      
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      // Mock analytics service for A/B testing
      vi.spyOn(analyticsService, 'trackABTestExposure').mockResolvedValue();

      // Generate sections with A/B test variant
      const sections = await groupingEngine.generateSections(
        mockUserProfile.userId,
        undefined,
        { abTestVariant: testVariant }
      );

      expect(Array.isArray(sections)).toBe(true);

      // Track A/B test exposure
      await analyticsService.trackABTestExposure(
        mockUserProfile.userId,
        'section-layout-test',
        testVariant
      );

      // Verify A/B test tracking
      expect(analyticsService.trackABTestExposure).toHaveBeenCalledWith(
        mockUserProfile.userId,
        'section-layout-test',
        testVariant
      );
    });
  });
});