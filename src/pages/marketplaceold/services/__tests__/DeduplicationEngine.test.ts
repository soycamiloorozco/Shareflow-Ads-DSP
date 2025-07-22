/**
 * DeduplicationEngine Tests
 * Comprehensive tests for screen deduplication and priority assignment
 */

import { describe, it, expect, beforeEach } from 'vitest';
import DeduplicationEngine from '../DeduplicationEngine';
import {
  MarketplaceSection,
  EnhancedScreen,
  ScreenPerformanceMetrics,
  AlgorithmType
} from '../../types/intelligent-grouping.types';

describe('DeduplicationEngine', () => {
  let deduplicationEngine: DeduplicationEngine;
  let mockScreens: EnhancedScreen[];
  let mockSections: MarketplaceSection[];

  beforeEach(() => {
    deduplicationEngine = new DeduplicationEngine();
    
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
          peakEngagementHours: [9, 12, 18],
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
        trendingScore: 0.6,
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
        trendingScore: 0.9,
        recommendationScore: 0.6,
        lastBookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
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

    // Create mock sections with overlapping screens
    mockSections = [
      {
        id: 'top-picks-user123',
        title: 'Top picks for you',
        screens: [mockScreens[0], mockScreens[1]], // screen-1, screen-2
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
        screens: [mockScreens[0], mockScreens[2]], // screen-1 (duplicate), screen-3
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
        screens: [mockScreens[1], mockScreens[3]], // screen-2 (duplicate), screen-4
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

  describe('removeDuplicates', () => {
    it('should remove duplicate screens across sections', async () => {
      const result = await deduplicationEngine.removeDuplicates(mockSections);

      // Collect all screen IDs across sections
      const allScreenIds: string[] = [];
      result.forEach(section => {
        section.screens.forEach(screen => {
          allScreenIds.push(screen.id);
        });
      });

      // Check that no screen appears more than once
      const uniqueScreenIds = new Set(allScreenIds);
      expect(allScreenIds.length).toBe(uniqueScreenIds.size);
    });

    it('should prioritize higher priority sections for screen assignment', async () => {
      const result = await deduplicationEngine.removeDuplicates(mockSections);

      // screen-1 should be in top-picks (priority 10) not trending (priority 8)
      const topPicksSection = result.find(s => s.id === 'top-picks-user123');
      const trendingSection = result.find(s => s.id === 'trending-general');

      expect(topPicksSection?.screens.some(s => s.id === 'screen-1')).toBe(true);
      expect(trendingSection?.screens.some(s => s.id === 'screen-1')).toBe(false);
    });

    it('should maintain section structure and metadata', async () => {
      const result = await deduplicationEngine.removeDuplicates(mockSections);

      expect(result).toHaveLength(3);
      result.forEach(section => {
        expect(section.id).toBeDefined();
        expect(section.title).toBeDefined();
        expect(section.metadata).toBeDefined();
        expect(section.priority).toBeDefined();
      });
    });

    it('should assign sectionAssignment to screens', async () => {
      const result = await deduplicationEngine.removeDuplicates(mockSections);

      result.forEach(section => {
        section.screens.forEach(screen => {
          expect(screen.sectionAssignment).toBe(section.id);
        });
      });
    });
  });

  describe('assignScreenPriority', () => {
    it('should assign screen to section with highest relevance score', async () => {
      const screen = mockScreens[0]; // High-performing screen
      const sectionIds = ['top-picks-user123', 'trending-general', 'top-in-city-bogota'];

      const assignment = await deduplicationEngine.assignScreenPriority(screen, sectionIds);

      // Should assign to top-picks due to high personalized score and section priority
      expect(assignment).toBe('top-picks-user123');
    });

    it('should handle screens with different performance characteristics', async () => {
      const trendingScreen = mockScreens[2]; // High trending score
      const sectionIds = ['trending-general', 'top-in-city-bogota'];

      const assignment = await deduplicationEngine.assignScreenPriority(trendingScreen, sectionIds);

      // Should assign to trending due to high trending score
      expect(assignment).toBe('trending-general');
    });

    it('should return first section if all scores are equal', async () => {
      const lowPerformingScreen = mockScreens[3];
      const sectionIds = ['section-a', 'section-b'];

      const assignment = await deduplicationEngine.assignScreenPriority(lowPerformingScreen, sectionIds);

      expect(assignment).toBe('section-a');
    });
  });

  describe('backfillSections', () => {
    it('should backfill sections below minimum screen count', async () => {
      // Create sections with insufficient screens
      const sparseSections: MarketplaceSection[] = [
        {
          id: 'top-picks-user123',
          title: 'Top picks for you',
          screens: [mockScreens[0]], // Only 1 screen, needs minimum 3
          displayType: 'featured',
          priority: 10,
          metadata: {
            algorithm: 'ml-personalized',
            confidence: 0.9,
            refreshInterval: 1800,
            trackingId: 'track-1',
            generatedAt: new Date()
          }
        }
      ];

      const availableScreens = [mockScreens[1], mockScreens[2], mockScreens[3]];
      const result = await deduplicationEngine.backfillSections(sparseSections, availableScreens);

      const topPicksSection = result.find(s => s.id === 'top-picks-user123');
      expect(topPicksSection?.screens.length).toBeGreaterThanOrEqual(3);
    });

    it('should not modify sections that meet minimum requirements', async () => {
      const adequateSections: MarketplaceSection[] = [
        {
          id: 'trending-general',
          title: 'Trending now',
          screens: [mockScreens[0], mockScreens[1], mockScreens[2], mockScreens[3]], // 4 screens, meets minimum
          displayType: 'horizontal-scroll',
          priority: 8,
          metadata: {
            algorithm: 'trending-analysis',
            confidence: 0.8,
            refreshInterval: 900,
            trackingId: 'track-2',
            generatedAt: new Date()
          }
        }
      ];

      const result = await deduplicationEngine.backfillSections(adequateSections, []);

      const trendingSection = result.find(s => s.id === 'trending-general');
      expect(trendingSection?.screens.length).toBe(4);
    });

    it('should not reuse screens already assigned to sections', async () => {
      // Create sections without overlapping screens for this test
      const nonOverlappingSections: MarketplaceSection[] = [
        {
          id: 'section-1',
          title: 'Section 1',
          screens: [mockScreens[0]], // Only screen-1
          displayType: 'grid',
          priority: 8,
          metadata: {
            algorithm: 'content-based',
            confidence: 0.8,
            refreshInterval: 1800,
            trackingId: 'track-1',
            generatedAt: new Date()
          }
        },
        {
          id: 'section-2',
          title: 'Section 2',
          screens: [mockScreens[1]], // Only screen-2
          displayType: 'grid',
          priority: 7,
          metadata: {
            algorithm: 'trending-analysis',
            confidence: 0.7,
            refreshInterval: 1800,
            trackingId: 'track-2',
            generatedAt: new Date()
          }
        }
      ];

      const availableScreens = [mockScreens[2], mockScreens[3]]; // Only unused screens

      const result = await deduplicationEngine.backfillSections(nonOverlappingSections, availableScreens);

      // Collect all screen IDs used in result
      const allScreenIds: string[] = [];
      result.forEach(section => {
        section.screens.forEach(screen => {
          allScreenIds.push(screen.id);
        });
      });

      // Check that no screen appears more than once across all sections
      const uniqueScreenIds = new Set(allScreenIds);
      expect(allScreenIds.length).toBe(uniqueScreenIds.size);
    });

    it('should select most relevant screens for backfilling', async () => {
      const sparseSections: MarketplaceSection[] = [
        {
          id: 'top-picks-user123',
          title: 'Top picks for you',
          screens: [], // Empty section
          displayType: 'featured',
          priority: 10,
          metadata: {
            algorithm: 'ml-personalized',
            confidence: 0.9,
            refreshInterval: 1800,
            trackingId: 'track-1',
            generatedAt: new Date()
          }
        }
      ];

      const result = await deduplicationEngine.backfillSections(sparseSections, mockScreens);
      const topPicksSection = result.find(s => s.id === 'top-picks-user123');

      // Should select screens with highest personalized scores first
      expect(topPicksSection?.screens[0].id).toBe('screen-1'); // Highest personalized score
    });
  });

  describe('createScreenPriority', () => {
    it('should create detailed priority assignment with reasons', async () => {
      const screen = mockScreens[0]; // High-performing screen
      const sectionIds = ['top-picks-user123', 'trending-general'];

      const priority = await deduplicationEngine.createScreenPriority(screen, sectionIds);

      expect(priority.screenId).toBe('screen-1');
      expect(priority.finalAssignment).toBeDefined();
      expect(priority.confidence).toBeGreaterThan(0);
      expect(priority.reasons.length).toBeGreaterThan(0);
      expect(priority.sectionPriorities).toHaveProperty('top-picks-user123');
      expect(priority.sectionPriorities).toHaveProperty('trending-general');
    });

    it('should include relevant reasons for high-performing screens', async () => {
      const screen = mockScreens[0]; // High personalized score, trending, high booking rate
      const sectionIds = ['top-picks-user123'];

      const priority = await deduplicationEngine.createScreenPriority(screen, sectionIds);

      expect(priority.reasons).toContain('High personalization score');
      expect(priority.reasons).toContain('Currently trending');
      expect(priority.reasons).toContain('High booking rate');
      expect(priority.reasons).toContain('Frequently booked');
    });

    it('should have lower confidence for low-performing screens', async () => {
      const screen = mockScreens[3]; // Low-performing screen
      const sectionIds = ['top-picks-user123'];

      const priority = await deduplicationEngine.createScreenPriority(screen, sectionIds);

      expect(priority.confidence).toBeLessThan(0.5);
      expect(priority.reasons.length).toBeLessThan(3);
    });
  });

  describe('processDeduplication', () => {
    it('should provide comprehensive deduplication results', async () => {
      const result = await deduplicationEngine.processDeduplication(mockSections, mockScreens);

      expect(result.sections).toBeDefined();
      expect(result.duplicatesRemoved).toBeGreaterThanOrEqual(0);
      expect(result.screensReassigned).toBeGreaterThanOrEqual(0);
      expect(result.backfillsApplied).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should maintain data integrity throughout the process', async () => {
      const result = await deduplicationEngine.processDeduplication(mockSections, mockScreens);

      // Verify no duplicate screens in final result
      const allScreenIds: string[] = [];
      result.sections.forEach(section => {
        section.screens.forEach(screen => {
          allScreenIds.push(screen.id);
        });
      });

      const uniqueScreenIds = new Set(allScreenIds);
      expect(allScreenIds.length).toBe(uniqueScreenIds.size);

      // Verify all sections have section assignments
      result.sections.forEach(section => {
        section.screens.forEach(screen => {
          expect(screen.sectionAssignment).toBe(section.id);
        });
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty sections array', async () => {
      const result = await deduplicationEngine.removeDuplicates([]);
      expect(result).toEqual([]);
    });

    it('should handle sections with no screens', async () => {
      const emptySections: MarketplaceSection[] = [
        {
          id: 'empty-section',
          title: 'Empty Section',
          screens: [],
          displayType: 'grid',
          priority: 5,
          metadata: {
            algorithm: 'content-based',
            confidence: 0.5,
            refreshInterval: 3600,
            trackingId: 'track-empty',
            generatedAt: new Date()
          }
        }
      ];

      const result = await deduplicationEngine.removeDuplicates(emptySections);
      expect(result).toHaveLength(1);
      expect(result[0].screens).toHaveLength(0);
    });

    it('should handle screens without performance metrics gracefully', async () => {
      const basicScreen = {
        id: 'basic-screen',
        name: 'Basic Screen',
        location: 'Test Location',
        price: 100000,
        category: 'Test',
        bookingFrequency: 'low' as const,
        engagementMetrics: {
          viewTime: 30,
          interactionRate: 0.05,
          completionRate: 0.4,
          shareRate: 0.01,
          favoriteRate: 0.02,
          clickThroughRate: 0.03,
          bounceRate: 0.5
        },
        audienceInsights: {
          primaryDemographic: 'general',
          ageDistribution: {},
          genderDistribution: {},
          interestCategories: [],
          peakEngagementHours: [12],
          seasonalTrends: {}
        }
      } as EnhancedScreen;

      const assignment = await deduplicationEngine.assignScreenPriority(basicScreen, ['test-section']);
      expect(assignment).toBe('test-section');
    });

    it('should handle single section assignment', async () => {
      const screen = mockScreens[0];
      const assignment = await deduplicationEngine.assignScreenPriority(screen, ['single-section']);
      expect(assignment).toBe('single-section');
    });
  });
});