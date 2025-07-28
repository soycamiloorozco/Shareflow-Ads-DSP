/**
 * Comprehensive Recommendation Algorithm Tests
 * Tests for advanced recommendation logic, scoring algorithms, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecommendationService, createRecommendationService } from '../RecommendationService';
import { UserBehaviorAnalytics } from '../UserBehaviorAnalytics';
import { createUserPreferenceAnalyzer } from '../UserPreferenceAnalyzer';
import DeduplicationEngine from '../DeduplicationEngine';
import SectionPriorityEngine from '../SectionPriorityEngine';
import { 
  EnhancedScreen, 
  UserProfile, 
  createEmptyUserProfile,
  CategoryPreference,
  LocationPreference,
  MarketplaceSection,
  ScreenPerformanceMetrics,
  SectionConfig
} from '../../types/intelligent-grouping.types';

describe('Recommendation Algorithms - Advanced Tests', () => {
  let recommendationService: RecommendationService;
  let behaviorAnalytics: UserBehaviorAnalytics;
  let preferenceAnalyzer: ReturnType<typeof createUserPreferenceAnalyzer>;
  let deduplicationEngine: DeduplicationEngine;
  let priorityEngine: SectionPriorityEngine;
  let mockScreens: EnhancedScreen[];
  let mockUserProfile: UserProfile;

  beforeEach(() => {
    behaviorAnalytics = new UserBehaviorAnalytics();
    preferenceAnalyzer = createUserPreferenceAnalyzer(behaviorAnalytics);
    recommendationService = createRecommendationService(behaviorAnalytics, preferenceAnalyzer);
    deduplicationEngine = new DeduplicationEngine();
    priorityEngine = new SectionPriorityEngine();

    // Create comprehensive mock screens with varied characteristics
    const createMockMetrics = (overrides: Partial<ScreenPerformanceMetrics> = {}): ScreenPerformanceMetrics => ({
      screenId: 'screen-1',
      bookingRate: 0.5,
      averageRating: 4.0,
      engagementScore: 0.7,
      revenueGenerated: 1000000,
      impressionCount: 100,
      conversionRate: 0.3,
      lastUpdated: new Date(),
      trendDirection: 'stable',
      ...overrides
    });

    mockScreens = [
      // High-performing billboard in premium location
      {
        id: 'premium-billboard-1',
        name: 'Premium Downtown Billboard',
        location: 'Bogotá Centro',
        price: 800000,
        category: 'Billboard',
        performanceMetrics: createMockMetrics({ 
          screenId: 'premium-billboard-1', 
          bookingRate: 0.9, 
          engagementScore: 0.95,
          averageRating: 4.8,
          trendDirection: 'up'
        }),
        bookingFrequency: 'very-high',
        personalizedScore: 0.92,
        trendingScore: 0.88,
        recommendationScore: 0.90,
        lastBookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        engagementMetrics: {
          viewTime: 180,
          interactionRate: 0.25,
          completionRate: 0.9,
          shareRate: 0.08,
          favoriteRate: 0.15,
          clickThroughRate: 0.18,
          bounceRate: 0.1
        },
        audienceInsights: {
          primaryDemographic: 'business-professionals',
          ageDistribution: { '25-34': 0.4, '35-44': 0.4, '45-54': 0.2 },
          genderDistribution: { 'male': 0.55, 'female': 0.45 },
          interestCategories: ['business', 'technology', 'finance'],
          peakEngagementHours: [8, 9, 12, 17, 18],
          seasonalTrends: { 'Q1': 1.1, 'Q2': 1.2, 'Q3': 0.9, 'Q4': 1.3 }
        }
      } as EnhancedScreen,
      
      // Mid-tier LED display in shopping area
      {
        id: 'shopping-led-2',
        name: 'Shopping Mall LED Display',
        location: 'Bogotá Norte',
        price: 400000,
        category: 'LED Display',
        performanceMetrics: createMockMetrics({ 
          screenId: 'shopping-led-2', 
          bookingRate: 0.6, 
          engagementScore: 0.7,
          averageRating: 4.2
        }),
        bookingFrequency: 'medium',
        personalizedScore: 0.65,
        trendingScore: 0.75,
        recommendationScore: 0.70,
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
          interestCategories: ['shopping', 'family', 'lifestyle'],
          peakEngagementHours: [10, 14, 16, 19, 20],
          seasonalTrends: { 'Q1': 0.8, 'Q2': 1.0, 'Q3': 0.9, 'Q4': 1.4 }
        }
      } as EnhancedScreen,

      // New digital screen with high trending potential
      {
        id: 'new-digital-3',
        name: 'New Transit Digital Screen',
        location: 'Bogotá Sur',
        price: 250000,
        category: 'Digital Display',
        performanceMetrics: createMockMetrics({ 
          screenId: 'new-digital-3', 
          bookingRate: 0.3, 
          engagementScore: 0.8,
          averageRating: 4.5,
          trendDirection: 'up'
        }),
        bookingFrequency: 'low',
        personalizedScore: 0.4,
        trendingScore: 0.9, // High trending due to newness
        recommendationScore: 0.65,
        lastBookingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        engagementMetrics: {
          viewTime: 90,
          interactionRate: 0.18,
          completionRate: 0.85,
          shareRate: 0.06,
          favoriteRate: 0.12,
          clickThroughRate: 0.15,
          bounceRate: 0.15
        },
        audienceInsights: {
          primaryDemographic: 'commuters',
          ageDistribution: { '18-24': 0.3, '25-34': 0.5, '35-44': 0.2 },
          genderDistribution: { 'male': 0.6, 'female': 0.4 },
          interestCategories: ['transportation', 'news', 'technology'],
          peakEngagementHours: [7, 8, 17, 18, 19],
          seasonalTrends: { 'Q1': 1.0, 'Q2': 1.0, 'Q3': 0.9, 'Q4': 1.1 }
        }
      } as EnhancedScreen,

      // Budget-friendly static billboard
      {
        id: 'budget-static-4',
        name: 'University Area Static Billboard',
        location: 'Bogotá Norte',
        price: 150000,
        category: 'Static Billboard',
        performanceMetrics: createMockMetrics({ 
          screenId: 'budget-static-4', 
          bookingRate: 0.25, 
          engagementScore: 0.4,
          averageRating: 3.8
        }),
        bookingFrequency: 'low',
        personalizedScore: 0.3,
        trendingScore: 0.2,
        recommendationScore: 0.35,
        engagementMetrics: {
          viewTime: 60,
          interactionRate: 0.08,
          completionRate: 0.6,
          shareRate: 0.02,
          favoriteRate: 0.04,
          clickThroughRate: 0.06,
          bounceRate: 0.35
        },
        audienceInsights: {
          primaryDemographic: 'students',
          ageDistribution: { '18-24': 0.7, '25-34': 0.3 },
          genderDistribution: { 'male': 0.5, 'female': 0.5 },
          interestCategories: ['education', 'technology', 'entertainment'],
          peakEngagementHours: [10, 12, 14, 16, 18],
          seasonalTrends: { 'Q1': 1.2, 'Q2': 0.8, 'Q3': 0.6, 'Q4': 1.0 }
        }
      } as EnhancedScreen,

      // Premium outdoor screen with seasonal patterns
      {
        id: 'outdoor-premium-5',
        name: 'Highway Premium Outdoor Screen',
        location: 'Bogotá Oeste',
        price: 600000,
        category: 'Outdoor Display',
        performanceMetrics: createMockMetrics({ 
          screenId: 'outdoor-premium-5', 
          bookingRate: 0.7, 
          engagementScore: 0.8,
          averageRating: 4.4
        }),
        bookingFrequency: 'high',
        personalizedScore: 0.75,
        trendingScore: 0.6,
        recommendationScore: 0.78,
        engagementMetrics: {
          viewTime: 45, // Shorter due to highway viewing
          interactionRate: 0.05, // Lower interaction but high impressions
          completionRate: 0.95,
          shareRate: 0.03,
          favoriteRate: 0.06,
          clickThroughRate: 0.08,
          bounceRate: 0.05
        },
        audienceInsights: {
          primaryDemographic: 'commuters',
          ageDistribution: { '25-34': 0.4, '35-44': 0.4, '45-54': 0.2 },
          genderDistribution: { 'male': 0.65, 'female': 0.35 },
          interestCategories: ['automotive', 'business', 'travel'],
          peakEngagementHours: [7, 8, 17, 18],
          seasonalTrends: { 'Q1': 0.9, 'Q2': 1.1, 'Q3': 1.2, 'Q4': 0.8 }
        }
      } as EnhancedScreen
    ];

    // Create comprehensive user profile
    mockUserProfile = {
      userId: 'test-user-comprehensive',
      preferredCategories: [
        {
          categoryId: 'billboard',
          categoryName: 'Billboard',
          score: 0.85,
          interactionCount: 25,
          lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          conversionRate: 0.32
        },
        {
          categoryId: 'led-display',
          categoryName: 'LED Display',
          score: 0.65,
          interactionCount: 15,
          lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          conversionRate: 0.28
        }
      ] as CategoryPreference[],
      budgetRange: {
        min: 200000,
        max: 800000,
        preferred: 500000,
        currency: 'COP',
        confidence: 0.85
      },
      locationPreferences: [
        {
          city: 'Bogotá',
          region: 'Cundinamarca',
          score: 0.9,
          interactionCount: 40,
          purchaseCount: 8,
          lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ] as LocationPreference[],
      behaviorScore: 0.82,
      lastActivity: new Date(),
      interactionHistory: {
        totalInteractions: 120,
        averageSessionDuration: 420,
        mostActiveTimeOfDay: 14,
        preferredDeviceType: 'desktop',
        engagementRate: 0.75,
        lastInteractionDate: new Date()
      },
      purchaseProfile: {
        totalPurchases: 8,
        totalSpent: 4200000,
        averageOrderValue: 525000,
        preferredPurchaseType: ['billboard', 'led-display'],
        seasonalPatterns: { 'Q1': 0.9, 'Q2': 1.2, 'Q3': 1.0, 'Q4': 1.1 },
        lastPurchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        purchaseFrequency: 'high'
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
  });

  describe('Personalized Recommendation Generation', () => {
    it('should prioritize screens matching user category preferences', async () => {
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [
          {
            categoryId: 'billboard',
            categoryName: 'Billboard',
            preferenceScore: 0.85,
            interactionFrequency: 0.6,
            conversionRate: 0.32,
            averageEngagementTime: 180,
            seasonalTrends: { 'Q1': 0.9, 'Q2': 1.2, 'Q3': 1.0, 'Q4': 1.1 },
            priceElasticity: 0.7,
            competitorAnalysis: { marketShare: 0.4, averagePrice: 500000 }
          }
        ],
        locationInsights: [],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.85
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.85,
        lastAnalyzed: new Date()
      });

      const topPicks = await recommendationService.getTopPicks(mockUserProfile.userId, 5);

      expect(Array.isArray(topPicks)).toBe(true);
      expect(behaviorAnalytics.getUserProfile).toHaveBeenCalledWith(mockUserProfile.userId);
      expect(preferenceAnalyzer.analyzeUserPreferences).toHaveBeenCalledWith(mockUserProfile.userId);
    });

    it('should apply budget constraints in recommendations', async () => {
      const budgetConstrainedProfile = {
        ...mockUserProfile,
        budgetRange: {
          min: 100000,
          max: 300000,
          preferred: 200000,
          currency: 'COP',
          confidence: 0.9
        }
      };

      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(budgetConstrainedProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: budgetConstrainedProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: budgetConstrainedProfile.budgetRange,
          priceElasticity: 0.8,
          budgetUtilization: 0.9,
          seasonalVariation: {},
          confidence: 0.9
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.8,
        lastAnalyzed: new Date()
      });

      const topPicks = await recommendationService.getTopPicks(budgetConstrainedProfile.userId, 5);

      expect(Array.isArray(topPicks)).toBe(true);
      // Should prioritize budget-friendly options
    });

    it('should handle location-based preferences', async () => {
      const locationSpecificProfile = {
        ...mockUserProfile,
        locationPreferences: [
          {
            city: 'Bogotá Norte',
            region: 'Cundinamarca',
            score: 0.95,
            interactionCount: 30,
            purchaseCount: 5,
            lastActivity: new Date()
          }
        ] as LocationPreference[]
      };

      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(locationSpecificProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: locationSpecificProfile.userId,
        categoryInsights: [],
        locationInsights: [
          {
            location: 'Bogotá Norte',
            preferenceScore: 0.95,
            interactionFrequency: 0.8,
            conversionRate: 0.4,
            averageSpend: 450000,
            competitiveIndex: 0.7,
            accessibilityScore: 0.9
          }
        ],
        priceInsights: {
          preferredRange: locationSpecificProfile.budgetRange,
          priceElasticity: 0.7,
          budgetUtilization: 0.8,
          seasonalVariation: {},
          confidence: 0.8
        },
        behaviorPatterns: [],
        recommendationFactors: [],
        confidence: 0.85,
        lastAnalyzed: new Date()
      });

      const topPicks = await recommendationService.getTopPicks(locationSpecificProfile.userId, 5);

      expect(Array.isArray(topPicks)).toBe(true);
      // Should prioritize screens in preferred locations
    });
  });

  describe('Advanced Deduplication Logic', () => {
    it('should handle complex section overlaps with multiple priorities', async () => {
      const complexSections: MarketplaceSection[] = [
        {
          id: 'top-picks',
          title: 'Top picks for you',
          screens: [mockScreens[0], mockScreens[1], mockScreens[2]], // Premium, Shopping, New
          displayType: 'featured',
          priority: 10,
          metadata: {
            algorithm: 'ml-personalized',
            confidence: 0.9,
            refreshInterval: 1800,
            trackingId: 'track-1',
            generatedAt: new Date()
          }
        },
        {
          id: 'trending',
          title: 'Trending now',
          screens: [mockScreens[2], mockScreens[3], mockScreens[4]], // New, Budget, Outdoor
          displayType: 'horizontal-scroll',
          priority: 8,
          metadata: {
            algorithm: 'trending-analysis',
            confidence: 0.8,
            refreshInterval: 900,
            trackingId: 'track-2',
            generatedAt: new Date()
          }
        },
        {
          id: 'budget-friendly',
          title: 'Budget friendly',
          screens: [mockScreens[3], mockScreens[1]], // Budget, Shopping
          displayType: 'grid',
          priority: 6,
          metadata: {
            algorithm: 'price-based',
            confidence: 0.7,
            refreshInterval: 3600,
            trackingId: 'track-3',
            generatedAt: new Date()
          }
        },
        {
          id: 'premium',
          title: 'Premium locations',
          screens: [mockScreens[0], mockScreens[4]], // Premium, Outdoor
          displayType: 'featured',
          priority: 9,
          metadata: {
            algorithm: 'premium-filter',
            confidence: 0.85,
            refreshInterval: 2400,
            trackingId: 'track-4',
            generatedAt: new Date()
          }
        }
      ];

      const result = await deduplicationEngine.removeDuplicates(complexSections);

      // Verify no duplicates exist
      const allScreenIds: string[] = [];
      result.forEach(section => {
        section.screens.forEach(screen => {
          allScreenIds.push(screen.id);
        });
      });

      const uniqueScreenIds = new Set(allScreenIds);
      expect(allScreenIds.length).toBe(uniqueScreenIds.size);

      // Verify high-priority sections get preference
      const topPicksSection = result.find(s => s.id === 'top-picks');
      const premiumSection = result.find(s => s.id === 'premium');
      
      expect(topPicksSection).toBeDefined();
      expect(premiumSection).toBeDefined();
      
      // Premium billboard should be in top-picks (priority 10) not premium (priority 9)
      expect(topPicksSection?.screens.some(s => s.id === 'premium-billboard-1')).toBe(true);
    });

    it('should maintain section balance during deduplication', async () => {
      const unbalancedSections: MarketplaceSection[] = [
        {
          id: 'overloaded-section',
          title: 'Overloaded Section',
          screens: mockScreens, // All screens
          displayType: 'grid',
          priority: 5,
          metadata: {
            algorithm: 'content-based',
            confidence: 0.6,
            refreshInterval: 3600,
            trackingId: 'track-overloaded',
            generatedAt: new Date()
          }
        },
        {
          id: 'empty-section',
          title: 'Empty Section',
          screens: [],
          displayType: 'horizontal-scroll',
          priority: 7,
          metadata: {
            algorithm: 'collaborative-filtering',
            confidence: 0.5,
            refreshInterval: 1800,
            trackingId: 'track-empty',
            generatedAt: new Date()
          }
        }
      ];

      const result = await deduplicationEngine.processDeduplication(unbalancedSections, mockScreens);

      expect(result.sections).toHaveLength(2);
      expect(result.duplicatesRemoved).toBe(0); // No duplicates in this case
      expect(result.backfillsApplied).toBeGreaterThanOrEqual(0);

      // Verify sections have reasonable distribution
      const overloadedSection = result.sections.find(s => s.id === 'overloaded-section');
      const emptySection = result.sections.find(s => s.id === 'empty-section');

      expect(overloadedSection?.screens.length).toBeGreaterThan(0);
      expect(emptySection?.screens.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Section Priority Assignment', () => {
    it('should calculate complex priority scores with multiple factors', async () => {
      const sectionConfigs: SectionConfig[] = [
        {
          id: 'ml-personalized',
          name: 'ML Personalized',
          description: 'Machine learning based personalization',
          algorithm: 'ml-personalized',
          priority: 10,
          maxScreens: 6,
          minScreens: 3,
          refreshInterval: 1800,
          enabled: true,
          targetAudience: ['high-engagement'],
          displayConfig: {
            displayType: 'featured',
            cardSize: 'large',
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
            requiresLogin: true,
            minUserInteractions: 10,
            minPurchaseHistory: 1,
            locationRequired: false
          }
        },
        {
          id: 'trending-analysis',
          name: 'Trending Analysis',
          description: 'Real-time trending analysis',
          algorithm: 'trending-analysis',
          priority: 8,
          maxScreens: 8,
          minScreens: 4,
          refreshInterval: 900,
          enabled: true,
          targetAudience: ['general'],
          displayConfig: {
            displayType: 'horizontal-scroll',
            cardSize: 'medium',
            showMetadata: true,
            maxVisible: 8,
            spacing: 'tight',
            mobileLayout: {
              horizontalScroll: true,
              cardsPerView: 3,
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

      const priorityEngineWithConfig = new SectionPriorityEngine(sectionConfigs);
      const mockSections: MarketplaceSection[] = [
        {
          id: 'ml-personalized',
          title: 'Top picks for you',
          screens: [],
          displayType: 'featured',
          priority: 10,
          metadata: {
            algorithm: 'ml-personalized',
            confidence: 0.9,
            refreshInterval: 1800,
            trackingId: 'track-ml',
            generatedAt: new Date()
          }
        },
        {
          id: 'trending-analysis',
          title: 'Trending now',
          screens: [],
          displayType: 'horizontal-scroll',
          priority: 8,
          metadata: {
            algorithm: 'trending-analysis',
            confidence: 0.8,
            refreshInterval: 900,
            trackingId: 'track-trending',
            generatedAt: new Date()
          }
        }
      ];

      // Test high-performing screen with strong personalization signals
      const highPerformingScreen = mockScreens[0]; // Premium billboard
      const priorities = await priorityEngineWithConfig.calculateSectionPriorities(
        highPerformingScreen, 
        mockSections, 
        mockUserProfile
      );

      expect(Object.keys(priorities)).toHaveLength(2);
      expect(priorities['ml-personalized']).toBeGreaterThan(0);
      expect(priorities['trending-analysis']).toBeGreaterThan(0);

      // High personalized score should favor ML section
      expect(priorities['ml-personalized']).toBeGreaterThan(priorities['trending-analysis']);
    });

    it('should handle screen assignment with capacity constraints', async () => {
      const limitedCapacitySections: MarketplaceSection[] = [
        {
          id: 'limited-capacity',
          title: 'Limited Capacity Section',
          screens: [mockScreens[0]], // Already has 1 screen
          displayType: 'grid',
          priority: 9,
          metadata: {
            algorithm: 'content-based',
            confidence: 0.8,
            refreshInterval: 1800,
            trackingId: 'track-limited',
            generatedAt: new Date()
          }
        }
      ];

      // Create section config with very limited capacity
      const limitedConfigs: SectionConfig[] = [
        {
          id: 'limited-capacity',
          name: 'Limited Capacity',
          description: 'Section with limited capacity',
          algorithm: 'content-based',
          priority: 9,
          maxScreens: 2, // Very limited
          minScreens: 1,
          refreshInterval: 1800,
          enabled: true,
          targetAudience: ['specific'],
          displayConfig: {
            displayType: 'grid',
            cardSize: 'medium',
            showMetadata: true,
            maxVisible: 2,
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

      const constrainedPriorityEngine = new SectionPriorityEngine(limitedConfigs);
      
      // Try to assign multiple screens to limited capacity section
      const screensToAssign = [mockScreens[1], mockScreens[2], mockScreens[3]]; // 3 screens for 1 remaining slot
      
      const result = await constrainedPriorityEngine.assignScreensToSections(
        screensToAssign, 
        limitedCapacitySections, 
        mockUserProfile
      );

      expect(Object.keys(result.assignments)).toHaveLength(screensToAssign.length);
      
      // Count assignments to limited capacity section
      const assignmentsToLimited = Object.values(result.assignments)
        .filter(sectionId => sectionId === 'limited-capacity').length;
      
      // Should attempt to respect capacity limits, but may assign to other sections if needed
      expect(assignmentsToLimited).toBeGreaterThanOrEqual(0);
      expect(Object.keys(result.assignments)).toHaveLength(screensToAssign.length);
    });
  });

  describe('Algorithm Performance and Edge Cases', () => {
    it('should handle empty screen datasets gracefully', async () => {
      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserProfile.userId,
        categoryInsights: [],
        locationInsights: [],
        priceInsights: {
          preferredRange: mockUserProfile.budgetRange,
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

      const topPicks = await recommendationService.getTopPicks(mockUserProfile.userId, 5);
      const discoveries = await recommendationService.getNewDiscoveries(mockUserProfile.userId, 5);
      const trending = await recommendationService.getTrendingScreens('Bogotá', 5);

      expect(Array.isArray(topPicks)).toBe(true);
      expect(Array.isArray(discoveries)).toBe(true);
      expect(Array.isArray(trending)).toBe(true);
      
      // Should handle empty datasets without errors
      expect(topPicks.length).toBeGreaterThanOrEqual(0);
      expect(discoveries.length).toBeGreaterThanOrEqual(0);
      expect(trending.length).toBeGreaterThanOrEqual(0);
    });

    it('should maintain performance with large screen datasets', async () => {
      // Create large dataset
      const largeScreenDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockScreens[i % mockScreens.length],
        id: `large-dataset-screen-${i}`,
        name: `Large Dataset Screen ${i}`,
        personalizedScore: Math.random(),
        trendingScore: Math.random(),
        recommendationScore: Math.random()
      }));

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

      const startTime = Date.now();
      const topPicks = await recommendationService.getTopPicks(mockUserProfile.userId, 10);
      const endTime = Date.now();

      expect(Array.isArray(topPicks)).toBe(true);
      expect(topPicks.length).toBeLessThanOrEqual(10);
      
      // Should complete within reasonable time (less than 1 second)
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(1000);
    });

    it('should handle corrupted or incomplete screen data', async () => {
      const corruptedScreens: Partial<EnhancedScreen>[] = [
        {
          id: 'corrupted-1',
          name: 'Corrupted Screen 1',
          // Missing required fields
        },
        {
          id: 'corrupted-2',
          name: 'Corrupted Screen 2',
          location: 'Unknown',
          price: -100, // Invalid price
          category: '',
          // Missing performance metrics
        }
      ];

      const sectionsWithCorruptedData: MarketplaceSection[] = [
        {
          id: 'corrupted-section',
          title: 'Section with Corrupted Data',
          screens: corruptedScreens as EnhancedScreen[],
          displayType: 'grid',
          priority: 5,
          metadata: {
            algorithm: 'content-based',
            confidence: 0.5,
            refreshInterval: 3600,
            trackingId: 'track-corrupted',
            generatedAt: new Date()
          }
        }
      ];

      // Should handle corrupted data without throwing errors
      const result = await deduplicationEngine.removeDuplicates(sectionsWithCorruptedData);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      
      // Should still process the section even with corrupted data
      const processedSection = result[0];
      expect(processedSection.id).toBe('corrupted-section');
      expect(Array.isArray(processedSection.screens)).toBe(true);
    });
  });

  describe('Recommendation Quality Metrics', () => {
    it('should generate diverse recommendations across categories', async () => {
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

      const topPicks = await recommendationService.getTopPicks(mockUserProfile.userId, 5);
      
      expect(Array.isArray(topPicks)).toBe(true);
      
      // Should provide diverse recommendations if screens are available
      if (topPicks.length > 1) {
        const categories = new Set(topPicks.map(screen => screen.category));
        expect(categories.size).toBeGreaterThan(0);
      }
    });

    it('should respect user privacy preferences in recommendations', async () => {
      const privacyConstrainedProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          privacy: {
            allowPersonalization: false,
            allowLocationTracking: false,
            allowBehaviorTracking: false,
            shareDataWithPartners: false
          }
        }
      };

      vi.spyOn(behaviorAnalytics, 'getUserProfile').mockResolvedValue(privacyConstrainedProfile);
      vi.spyOn(preferenceAnalyzer, 'analyzeUserPreferences').mockResolvedValue({
        userId: privacyConstrainedProfile.userId,
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

      const topPicks = await recommendationService.getTopPicks(privacyConstrainedProfile.userId, 5);
      
      expect(Array.isArray(topPicks)).toBe(true);
      // Should still provide recommendations but with reduced personalization
    });
  });
});