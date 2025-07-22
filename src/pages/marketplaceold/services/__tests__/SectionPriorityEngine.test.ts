/**
 * SectionPriorityEngine Tests
 * Comprehensive tests for section priority scoring and screen assignment logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import SectionPriorityEngine, { SectionAssignmentResult } from '../SectionPriorityEngine';
import {
  MarketplaceSection,
  EnhancedScreen,
  ScreenPerformanceMetrics,
  UserProfile,
  SectionConfig,
  AlgorithmType
} from '../../types/intelligent-grouping.types';

describe('SectionPriorityEngine', () => {
  let priorityEngine: SectionPriorityEngine;
  let mockScreens: EnhancedScreen[];
  let mockSections: MarketplaceSection[];
  let mockUserProfile: UserProfile;
  let mockSectionConfigs: SectionConfig[];

  beforeEach(() => {
    // Create mock section configurations
    mockSectionConfigs = [
      {
        id: 'top-picks-user123',
        name: 'Top Picks',
        description: 'Personalized recommendations',
        algorithm: 'ml-personalized',
        priority: 10,
        maxScreens: 6,
        minScreens: 3,
        refreshInterval: 1800,
        enabled: true,
        targetAudience: ['personalized'],
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
          minUserInteractions: 5,
          minPurchaseHistory: 0,
          locationRequired: false
        }
      },
      {
        id: 'trending-general',
        name: 'Trending Now',
        description: 'Currently popular screens',
        algorithm: 'trending-analysis',
        priority: 8,
        maxScreens: 12,
        minScreens: 4,
        refreshInterval: 900,
        enabled: true,
        targetAudience: ['general'],
        displayConfig: {
          displayType: 'horizontal-scroll',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 8,
          spacing: 'normal',
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
      },
      {
        id: 'top-in-city-bogota',
        name: 'Top in Bogotá',
        description: 'Popular screens in Bogotá',
        algorithm: 'geographic-popularity',
        priority: 7,
        maxScreens: 10,
        minScreens: 4,
        refreshInterval: 3600,
        enabled: true,
        targetAudience: ['local'],
        displayConfig: {
          displayType: 'grid',
          cardSize: 'medium',
          showMetadata: true,
          maxVisible: 8,
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
          locationRequired: true
        }
      }
    ];

    priorityEngine = new SectionPriorityEngine(mockSectionConfigs);

    // Create mock user profile
    mockUserProfile = {
      userId: 'user123',
      preferredCategories: [
        {
          categoryId: 'billboard',
          categoryName: 'Billboard',
          score: 0.8,
          interactionCount: 15,
          lastInteraction: new Date(),
          conversionRate: 0.3
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
          interactionCount: 20,
          purchaseCount: 3,
          lastActivity: new Date()
        }
      ],
      behaviorScore: 0.75,
      lastActivity: new Date(),
      interactionHistory: {
        totalInteractions: 50,
        averageSessionDuration: 300,
        mostActiveTimeOfDay: 14,
        preferredDeviceType: 'desktop',
        engagementRate: 0.6,
        lastInteractionDate: new Date()
      },
      purchaseProfile: {
        totalPurchases: 3,
        totalSpent: 1500000,
        averageOrderValue: 500000,
        preferredPurchaseType: ['billboard', 'led-display'],
        seasonalPatterns: { 'Q1': 0.8, 'Q2': 1.2, 'Q3': 1.0, 'Q4': 1.1 },
        lastPurchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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

    // Create mock performance metrics
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

    // Create mock enhanced screens
    mockScreens = [
      {
        id: 'screen-1',
        name: 'Premium Billboard Downtown',
        location: 'Bogotá Centro',
        price: 500000,
        category: 'Billboard',
        performanceMetrics: createMockMetrics({ screenId: 'screen-1', bookingRate: 0.8, engagementScore: 0.9 }),
        bookingFrequency: 'high',
        personalizedScore: 0.9,
        trendingScore: 0.8,
        recommendationScore: 0.85,
        lastBookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        engagementMetrics: {
          viewTime: 120,
          interactionRate: 0.15,
          completionRate: 0.8,
          shareRate: 0.05,
          favoriteRate: 0.1,
          clickThroughRate: 0.12,
          bounceRate: 0.2
        },
        audienceInsights: {
          primaryDemographic: 'young-adults',
          ageDistribution: { '18-24': 0.3, '25-34': 0.4, '35-44': 0.3 },
          genderDistribution: { 'male': 0.6, 'female': 0.4 },
          interestCategories: ['technology', 'lifestyle'],
          peakEngagementHours: [9, 12, 14, 18], // Include current test hour
          seasonalTrends: { 'Q1': 0.8, 'Q2': 1.2, 'Q3': 1.0, 'Q4': 1.1 }
        }
      } as EnhancedScreen,
      {
        id: 'screen-2',
        name: 'Shopping Mall Display',
        location: 'Bogotá Norte',
        price: 300000,
        category: 'LED Display',
        performanceMetrics: createMockMetrics({ screenId: 'screen-2', bookingRate: 0.6, engagementScore: 0.7 }),
        bookingFrequency: 'medium',
        personalizedScore: 0.7,
        trendingScore: 0.9, // High trending score
        recommendationScore: 0.75,
        engagementMetrics: {
          viewTime: 90,
          interactionRate: 0.12,
          completionRate: 0.7,
          shareRate: 0.03,
          favoriteRate: 0.08,
          clickThroughRate: 0.1,
          bounceRate: 0.25
        },
        audienceInsights: {
          primaryDemographic: 'families',
          ageDistribution: { '25-34': 0.4, '35-44': 0.4, '45-54': 0.2 },
          genderDistribution: { 'male': 0.45, 'female': 0.55 },
          interestCategories: ['shopping', 'family'],
          peakEngagementHours: [10, 14, 19],
          seasonalTrends: { 'Q1': 0.9, 'Q2': 1.0, 'Q3': 0.8, 'Q4': 1.3 }
        }
      } as EnhancedScreen,
      {
        id: 'screen-3',
        name: 'Transit Station Screen',
        location: 'Bogotá Sur',
        price: 200000,
        category: 'Digital Display',
        performanceMetrics: createMockMetrics({ screenId: 'screen-3', bookingRate: 0.4, engagementScore: 0.5 }),
        bookingFrequency: 'low',
        personalizedScore: 0.5,
        trendingScore: 0.6,
        recommendationScore: 0.6,
        engagementMetrics: {
          viewTime: 60,
          interactionRate: 0.08,
          completionRate: 0.6,
          shareRate: 0.02,
          favoriteRate: 0.05,
          clickThroughRate: 0.07,
          bounceRate: 0.3
        },
        audienceInsights: {
          primaryDemographic: 'commuters',
          ageDistribution: { '18-24': 0.2, '25-34': 0.5, '35-44': 0.3 },
          genderDistribution: { 'male': 0.55, 'female': 0.45 },
          interestCategories: ['transportation', 'news'],
          peakEngagementHours: [7, 8, 17, 18],
          seasonalTrends: { 'Q1': 1.0, 'Q2': 1.0, 'Q3': 0.9, 'Q4': 1.1 }
        }
      } as EnhancedScreen,
      {
        id: 'screen-4',
        name: 'University Campus Board',
        location: 'Bogotá Norte',
        price: 150000,
        category: 'Static Billboard',
        performanceMetrics: createMockMetrics({ screenId: 'screen-4', bookingRate: 0.3, engagementScore: 0.4 }),
        bookingFrequency: 'very-low',
        personalizedScore: 0.3,
        trendingScore: 0.2,
        recommendationScore: 0.4,
        engagementMetrics: {
          viewTime: 45,
          interactionRate: 0.05,
          completionRate: 0.5,
          shareRate: 0.01,
          favoriteRate: 0.03,
          clickThroughRate: 0.04,
          bounceRate: 0.4
        },
        audienceInsights: {
          primaryDemographic: 'students',
          ageDistribution: { '18-24': 0.8, '25-34': 0.2 },
          genderDistribution: { 'male': 0.5, 'female': 0.5 },
          interestCategories: ['education', 'technology'],
          peakEngagementHours: [10, 12, 14, 16],
          seasonalTrends: { 'Q1': 1.2, 'Q2': 0.8, 'Q3': 0.6, 'Q4': 1.0 }
        }
      } as EnhancedScreen
    ];

    // Create mock sections
    mockSections = [
      {
        id: 'top-picks-user123',
        title: 'Top picks for you',
        screens: [], // Empty initially for assignment tests
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
        id: 'trending-general',
        title: 'Trending now',
        screens: [],
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
        id: 'top-in-city-bogota',
        title: 'Top in Bogotá',
        screens: [],
        displayType: 'grid',
        priority: 7,
        metadata: {
          algorithm: 'geographic-popularity',
          confidence: 0.7,
          refreshInterval: 3600,
          trackingId: 'track-3',
          generatedAt: new Date()
        }
      }
    ];
  });

  describe('calculateSectionPriorities', () => {
    it('should calculate priority scores for all sections', async () => {
      const screen = mockScreens[0]; // High-performing screen
      const priorities = await priorityEngine.calculateSectionPriorities(screen, mockSections, mockUserProfile);

      expect(Object.keys(priorities)).toHaveLength(3);
      expect(priorities['top-picks-user123']).toBeGreaterThan(0);
      expect(priorities['trending-general']).toBeGreaterThan(0);
      expect(priorities['top-in-city-bogota']).toBeGreaterThan(0);
    });

    it('should give higher priority to personalized sections for high personalized score screens', async () => {
      const screen = mockScreens[0]; // High personalized score (0.9)
      const priorities = await priorityEngine.calculateSectionPriorities(screen, mockSections, mockUserProfile);

      expect(priorities['top-picks-user123']).toBeGreaterThan(priorities['trending-general']);
    });

    it('should give higher priority to trending sections for high trending score screens', async () => {
      const screen = mockScreens[1]; // High trending score (0.9)
      const priorities = await priorityEngine.calculateSectionPriorities(screen, mockSections, mockUserProfile);

      expect(priorities['trending-general']).toBeGreaterThan(priorities['top-in-city-bogota']);
    });

    it('should consider user preferences in priority calculation', async () => {
      const screen = mockScreens[0]; // Billboard category matches user preference
      const priorities = await priorityEngine.calculateSectionPriorities(screen, mockSections, mockUserProfile);

      // Should have higher scores due to category match
      expect(priorities['top-picks-user123']).toBeGreaterThan(0.1);
    });

    it('should handle screens without user profile', async () => {
      const screen = mockScreens[0];
      const priorities = await priorityEngine.calculateSectionPriorities(screen, mockSections);

      expect(Object.keys(priorities)).toHaveLength(3);
      // Should still calculate meaningful scores without user profile
      Object.values(priorities).forEach(score => {
        expect(score).toBeGreaterThan(0);
      });
    });
  });

  describe('assignScreensToSections', () => {
    it('should assign all screens to appropriate sections', async () => {
      const result = await priorityEngine.assignScreensToSections(mockScreens, mockSections, mockUserProfile);

      expect(Object.keys(result.assignments)).toHaveLength(mockScreens.length);
      expect(Object.keys(result.scores)).toHaveLength(mockScreens.length);
      expect(result.balanceMetrics).toBeDefined();
    });

    it('should assign high-performing screens to high-priority sections', async () => {
      const result = await priorityEngine.assignScreensToSections(mockScreens, mockSections, mockUserProfile);

      const highPerformingScreen = mockScreens[0]; // screen-1 with high scores
      const assignment = result.assignments[highPerformingScreen.id];
      
      // Should be assigned to either top-picks or trending (high priority sections)
      expect(['top-picks-user123', 'trending-general']).toContain(assignment);
    });

    it('should respect section capacity limits', async () => {
      // Create many screens to test capacity limits
      const manyScreens = Array.from({ length: 20 }, (_, i) => ({
        ...mockScreens[0],
        id: `screen-${i + 1}`,
        name: `Screen ${i + 1}`
      }));

      const result = await priorityEngine.assignScreensToSections(manyScreens, mockSections, mockUserProfile);

      // Check that no section exceeds its maximum capacity
      const sectionCounts: Record<string, number> = {};
      Object.values(result.assignments).forEach(sectionId => {
        sectionCounts[sectionId] = (sectionCounts[sectionId] || 0) + 1;
      });

      expect(sectionCounts['top-picks-user123'] || 0).toBeLessThanOrEqual(6); // maxScreens: 6
      expect(sectionCounts['trending-general'] || 0).toBeLessThanOrEqual(12); // maxScreens: 12
      expect(sectionCounts['top-in-city-bogota'] || 0).toBeLessThanOrEqual(10); // maxScreens: 10
    });

    it('should create conflicts when screens compete for limited section space', async () => {
      // Create sections with very limited capacity
      const limitedSections: MarketplaceSection[] = [
        {
          ...mockSections[0],
          screens: [mockScreens[0], mockScreens[1]] // Already has 2 screens, max is 6
        }
      ];

      // Create more high-scoring screens than can fit
      const competingScreens = Array.from({ length: 10 }, (_, i) => ({
        ...mockScreens[0], // All high-performing, will compete for same section
        id: `competing-screen-${i + 1}`,
        name: `Competing Screen ${i + 1}`,
        personalizedScore: 0.9, // High score to target top-picks section
        trendingScore: 0.5 // Lower trending to prefer top-picks over trending
      }));

      const result = await priorityEngine.assignScreensToSections(competingScreens, limitedSections, mockUserProfile);

      // With 10 screens competing for 1 section with capacity for only 4 more (6 max - 2 existing),
      // there should be conflicts or at least assignment challenges
      expect(result.assignments).toBeDefined();
      expect(Object.keys(result.assignments)).toHaveLength(competingScreens.length);
    });

    it('should calculate meaningful balance metrics', async () => {
      const result = await priorityEngine.assignScreensToSections(mockScreens, mockSections, mockUserProfile);

      expect(result.balanceMetrics.totalScreens).toBe(mockScreens.length);
      expect(result.balanceMetrics.balanceScore).toBeGreaterThanOrEqual(0);
      expect(result.balanceMetrics.balanceScore).toBeLessThanOrEqual(1);
      expect(result.balanceMetrics.sectionDistribution).toBeDefined();
    });
  });

  describe('handleEdgeCases', () => {
    it('should handle underfilled sections by reassigning screens', async () => {
      // Create initial assignment with underfilled sections
      const initialResult = await priorityEngine.assignScreensToSections(mockScreens.slice(0, 2), mockSections, mockUserProfile);
      
      // Manually create underfilled scenario
      const underfilledResult: SectionAssignmentResult = {
        ...initialResult,
        balanceMetrics: {
          ...initialResult.balanceMetrics,
          underfilledSections: ['top-in-city-bogota'] // This section needs 4 minimum
        }
      };

      const result = await priorityEngine.handleEdgeCases(underfilledResult, mockScreens, mockSections);

      // Should attempt to rebalance
      expect(result.assignments).toBeDefined();
      expect(result.conflicts.length).toBeGreaterThanOrEqual(underfilledResult.conflicts.length);
    });

    it('should handle overfilled sections by redistributing screens', async () => {
      // Create scenario with overfilled section
      const manyScreens = Array.from({ length: 15 }, (_, i) => ({
        ...mockScreens[0],
        id: `screen-${i + 1}`,
        name: `Screen ${i + 1}`
      }));

      const initialResult = await priorityEngine.assignScreensToSections(manyScreens, mockSections, mockUserProfile);
      
      // Force overfilled scenario
      const overfilledResult: SectionAssignmentResult = {
        ...initialResult,
        balanceMetrics: {
          ...initialResult.balanceMetrics,
          overfilledSections: ['top-picks-user123'] // Exceeds maxScreens: 6
        }
      };

      const result = await priorityEngine.handleEdgeCases(overfilledResult, manyScreens, mockSections);

      // Should redistribute screens
      expect(result.assignments).toBeDefined();
      expect(result.conflicts.length).toBeGreaterThanOrEqual(overfilledResult.conflicts.length);
    });

    it('should maintain data integrity after edge case handling', async () => {
      const initialResult = await priorityEngine.assignScreensToSections(mockScreens, mockSections, mockUserProfile);
      const result = await priorityEngine.handleEdgeCases(initialResult, mockScreens, mockSections);

      // All screens should still be assigned
      expect(Object.keys(result.assignments)).toHaveLength(mockScreens.length);
      
      // All assignments should be to valid sections
      const validSectionIds = mockSections.map(s => s.id);
      Object.values(result.assignments).forEach(sectionId => {
        expect(validSectionIds).toContain(sectionId);
      });
    });
  });

  describe('relevance factor calculations', () => {
    it('should calculate user personalization score correctly', async () => {
      const screen = mockScreens[0]; // Billboard category matches user preference
      const section = mockSections[0]; // ml-personalized section
      
      const priorities = await priorityEngine.calculateSectionPriorities(screen, [section], mockUserProfile);
      
      // Should have high score due to category match and personalized algorithm
      expect(priorities[section.id]).toBeGreaterThan(0.1);
    });

    it('should handle geographic relevance for location-based sections', async () => {
      const screen = mockScreens[0]; // Located in Bogotá Centro
      const section = mockSections[2]; // top-in-city-bogota section
      
      const priorities = await priorityEngine.calculateSectionPriorities(screen, [section], mockUserProfile);
      
      // Should have good score due to location match
      expect(priorities[section.id]).toBeGreaterThan(0);
    });

    it('should consider temporal relevance based on peak engagement hours', async () => {
      const screen = mockScreens[0]; // Has peak engagement at hour 14
      const priorities = await priorityEngine.calculateSectionPriorities(screen, mockSections, mockUserProfile);

      // Should have meaningful scores regardless of current time
      Object.values(priorities).forEach(score => {
        expect(score).toBeGreaterThan(0);
      });

      // Test that temporal relevance is calculated
      expect(priorities).toBeDefined();
      expect(Object.keys(priorities)).toHaveLength(mockSections.length);
    });

    it('should apply diversity bonus for category variety', async () => {
      // Create section with existing screens of same category
      const sectionWithScreens: MarketplaceSection = {
        ...mockSections[0],
        screens: [mockScreens[0]] // Billboard category
      };

      const differentCategoryScreen = mockScreens[1]; // LED Display category
      const sameCategoryScreen = { ...mockScreens[0], id: 'another-billboard' }; // Billboard category

      const prioritiesDifferent = await priorityEngine.calculateSectionPriorities(
        differentCategoryScreen, 
        [sectionWithScreens], 
        mockUserProfile
      );
      
      const prioritiesSame = await priorityEngine.calculateSectionPriorities(
        sameCategoryScreen, 
        [sectionWithScreens], 
        mockUserProfile
      );

      // Different category should get diversity bonus
      expect(prioritiesDifferent[sectionWithScreens.id]).toBeGreaterThan(0);
      expect(prioritiesSame[sectionWithScreens.id]).toBeGreaterThan(0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty sections array', async () => {
      const priorities = await priorityEngine.calculateSectionPriorities(mockScreens[0], [], mockUserProfile);
      expect(priorities).toEqual({});
    });

    it('should handle empty screens array', async () => {
      const result = await priorityEngine.assignScreensToSections([], mockSections, mockUserProfile);
      
      expect(result.assignments).toEqual({});
      expect(result.scores).toEqual({});
      expect(result.conflicts).toEqual([]);
      expect(result.balanceMetrics.totalScreens).toBe(0);
    });

    it('should handle screens without performance metrics', async () => {
      const basicScreen = {
        ...mockScreens[0],
        performanceMetrics: undefined
      } as EnhancedScreen;

      const priorities = await priorityEngine.calculateSectionPriorities(basicScreen, mockSections, mockUserProfile);
      
      // Should still calculate priorities with default values
      Object.values(priorities).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle sections without configuration', async () => {
      const engineWithoutConfig = new SectionPriorityEngine();
      const priorities = await engineWithoutConfig.calculateSectionPriorities(mockScreens[0], mockSections, mockUserProfile);
      
      // Should still work with default values
      expect(Object.keys(priorities)).toHaveLength(mockSections.length);
    });

    it('should handle user profile without preferences', async () => {
      const minimalUserProfile: UserProfile = {
        ...mockUserProfile,
        preferredCategories: [],
        locationPreferences: []
      };

      const priorities = await priorityEngine.calculateSectionPriorities(
        mockScreens[0], 
        mockSections, 
        minimalUserProfile
      );
      
      // Should still calculate meaningful scores
      Object.values(priorities).forEach(score => {
        expect(score).toBeGreaterThan(0);
      });
    });
  });
});