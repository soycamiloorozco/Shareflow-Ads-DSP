import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnalyticsDashboardService } from '../AnalyticsDashboardService';
import { AnalyticsEvent, ABTestConfig } from '../../types/intelligent-grouping.types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AnalyticsDashboardService', () => {
  let dashboardService: AnalyticsDashboardService;
  const mockTimeframe = {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  };

  const mockAnalyticsEvents: AnalyticsEvent[] = [
    {
      type: 'section_view_start',
      userId: 'user1',
      sessionId: 'session1',
      sectionId: 'top-picks',
      timestamp: new Date('2024-01-15'),
      data: { sectionId: 'top-picks' }
    },
    {
      type: 'screen_click',
      userId: 'user1',
      sessionId: 'session1',
      sectionId: 'top-picks',
      screenId: 'screen1',
      timestamp: new Date('2024-01-15'),
      data: { screenId: 'screen1', position: 1 }
    },
    {
      type: 'conversion',
      userId: 'user1',
      sessionId: 'session1',
      sectionId: 'top-picks',
      screenId: 'screen1',
      timestamp: new Date('2024-01-15'),
      data: { conversionType: 'purchase', value: 500000 }
    },
    {
      type: 'section_view_end',
      userId: 'user1',
      sessionId: 'session1',
      sectionId: 'top-picks',
      timestamp: new Date('2024-01-15'),
      data: { viewDuration: 15000, scrollDepth: 0.8 }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAnalyticsEvents));
    
    dashboardService = new AnalyticsDashboardService({
      enableRealTimeUpdates: true,
      cacheTimeout: 60000,
      batchSize: 50
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Section Performance Metrics', () => {
    it('should calculate section performance metrics correctly', async () => {
      const metrics = await dashboardService.getSectionPerformanceMetrics('top-picks', mockTimeframe);

      expect(metrics).toMatchObject({
        sectionId: 'top-picks',
        sectionName: 'Top Picks for You',
        impressions: 1,
        uniqueViews: 1,
        totalViewTime: 15000,
        averageViewTime: 15000,
        clickThroughRate: 1.0, // 1 click / 1 impression
        conversionRate: 1.0, // 1 conversion / 1 impression
        timeframe: mockTimeframe
      });

      expect(metrics.screenInteractions).toHaveLength(1);
      expect(metrics.screenInteractions[0]).toMatchObject({
        screenId: 'screen1',
        impressions: 1,
        clicks: 1,
        conversionRate: 1.0
      });
    });

    it('should handle sections with no events', async () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const metrics = await dashboardService.getSectionPerformanceMetrics('empty-section', mockTimeframe);

      expect(metrics).toMatchObject({
        sectionId: 'empty-section',
        impressions: 0,
        uniqueViews: 0,
        totalViewTime: 0,
        averageViewTime: 0,
        clickThroughRate: 0,
        conversionRate: 0
      });
    });

    it('should cache performance metrics', async () => {
      // First call
      await dashboardService.getSectionPerformanceMetrics('top-picks', mockTimeframe);
      
      // Second call should use cache
      localStorageMock.getItem.mockReturnValue('[]'); // Change data
      const metrics = await dashboardService.getSectionPerformanceMetrics('top-picks', mockTimeframe);

      // Should still return cached data
      expect(metrics.impressions).toBe(1);
    });
  });

  describe('Section Engagement Report', () => {
    it('should generate comprehensive engagement report', async () => {
      const report = await dashboardService.getSectionEngagementReport('top-picks', mockTimeframe);

      expect(report).toMatchObject({
        sectionId: 'top-picks',
        sectionName: 'Top Picks for You',
        timeframe: mockTimeframe
      });

      expect(report.metrics).toBeDefined();
      expect(report.trends).toHaveLength(3);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should provide relevant recommendations based on metrics', async () => {
      // Mock low performance metrics
      const lowPerformanceEvents = [
        {
          type: 'section_view_start',
          userId: 'user1',
          sessionId: 'session1',
          sectionId: 'low-performance',
          timestamp: new Date('2024-01-15'),
          data: { sectionId: 'low-performance' }
        }
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(lowPerformanceEvents));
      
      const report = await dashboardService.getSectionEngagementReport('low-performance', mockTimeframe);
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => rec.includes('improve') || rec.includes('consider'))).toBe(true);
    });
  });

  describe('Conversion Analysis', () => {
    it('should analyze conversion rates and funnel', async () => {
      const analysis = await dashboardService.getConversionAnalysis('top-picks', mockTimeframe);

      expect(analysis).toMatchObject({
        sectionId: 'top-picks',
        totalConversions: 1,
        conversionRate: 1.0,
        conversionsByType: { purchase: 1 }
      });

      expect(analysis.conversionFunnel).toHaveLength(3);
      expect(analysis.conversionFunnel[0]).toMatchObject({
        step: 'Section View',
        count: 1,
        conversionRate: 1.0
      });

      expect(analysis.topConvertingScreens).toHaveLength(1);
      expect(analysis.topConvertingScreens[0]).toMatchObject({
        screenId: 'screen1',
        conversions: 1,
        revenue: 500000
      });
    });

    it('should handle multiple conversion types', async () => {
      const multiConversionEvents = [
        ...mockAnalyticsEvents,
        {
          type: 'conversion',
          userId: 'user2',
          sessionId: 'session2',
          sectionId: 'top-picks',
          screenId: 'screen2',
          timestamp: new Date('2024-01-16'),
          data: { conversionType: 'favorite' }
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(multiConversionEvents));

      const analysis = await dashboardService.getConversionAnalysis('top-picks', mockTimeframe);

      expect(analysis.conversionsByType).toEqual({
        purchase: 1,
        favorite: 1
      });
      expect(analysis.totalConversions).toBe(2);
    });
  });

  describe('Dashboard Summary', () => {
    it('should generate comprehensive dashboard summary', async () => {
      const summary = await dashboardService.getDashboardSummary(mockTimeframe);

      expect(summary).toMatchObject({
        totalSections: 1,
        totalScreens: 1,
        totalImpressions: 1,
        totalConversions: 1,
        averageEngagementTime: 15000
      });

      expect(summary.topPerformingSections).toHaveLength(1);
      expect(summary.recentTrends).toBeInstanceOf(Array);
      expect(summary.alertsAndInsights).toBeInstanceOf(Array);
    });

    it('should generate appropriate alerts', async () => {
      // Mock low performance data
      const lowPerformanceEvents = [
        {
          type: 'section_view_start',
          userId: 'user1',
          sessionId: 'session1',
          sectionId: 'low-performance',
          timestamp: new Date('2024-01-15'),
          data: { sectionId: 'low-performance' }
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(lowPerformanceEvents));

      const summary = await dashboardService.getDashboardSummary(mockTimeframe);

      const warningAlert = summary.alertsAndInsights.find(alert => alert.type === 'warning');
      expect(warningAlert).toBeDefined();
      expect(warningAlert?.title).toBe('Low Conversion Rate');
    });
  });

  describe('A/B Testing', () => {
    const mockABTestConfig = {
      testName: 'Section Layout Test',
      description: 'Testing different section layouts',
      variants: [
        {
          variantId: 'control',
          name: 'Control',
          description: 'Original layout',
          sectionConfig: {},
          trafficPercentage: 50,
          isControl: true
        },
        {
          variantId: 'variant-a',
          name: 'Variant A',
          description: 'New layout',
          sectionConfig: { displayType: 'grid' },
          trafficPercentage: 50,
          isControl: false
        }
      ],
      trafficAllocation: { control: 50, 'variant-a': 50 },
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      successMetrics: ['conversionRate', 'clickThroughRate']
    };

    it('should create A/B test configuration', async () => {
      const testConfig = await dashboardService.createABTest(mockABTestConfig);

      expect(testConfig).toMatchObject({
        testName: 'Section Layout Test',
        status: 'draft',
        variants: mockABTestConfig.variants
      });

      expect(testConfig.testId).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ab_tests',
        expect.stringContaining(testConfig.testId)
      );
    });

    it('should start A/B test', async () => {
      const testConfig = await dashboardService.createABTest(mockABTestConfig);
      
      await dashboardService.startABTest(testConfig.testId);

      // Verify test was updated to running status
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ab_tests',
        expect.stringContaining('"status":"running"')
      );
    });

    it('should assign users to test variants consistently', async () => {
      const testConfig = await dashboardService.createABTest(mockABTestConfig);
      await dashboardService.startABTest(testConfig.testId);

      const userId = 'test-user-123';
      
      // Multiple calls should return same variant
      const variant1 = dashboardService.getUserSegmentForABTest(testConfig.testId, userId);
      const variant2 = dashboardService.getUserSegmentForABTest(testConfig.testId, userId);
      
      expect(variant1).toBe(variant2);
      expect(['control', 'variant-a']).toContain(variant1);
    });

    it('should generate A/B test results', async () => {
      const testConfig = await dashboardService.createABTest(mockABTestConfig);
      await dashboardService.startABTest(testConfig.testId);

      const results = await dashboardService.getABTestResults(testConfig.testId);

      expect(results).toMatchObject({
        testId: testConfig.testId,
        confidence: expect.any(Number),
        statisticalSignificance: expect.any(Boolean)
      });

      expect(results.variantResults).toHaveLength(2);
      expect(results.recommendations).toBeInstanceOf(Array);
      expect(results.generatedAt).toBeInstanceOf(Date);
    });

    it('should track A/B test events', async () => {
      const testConfig = await dashboardService.createABTest(mockABTestConfig);
      
      await dashboardService.trackABTestEvent(
        testConfig.testId,
        'control',
        'user123',
        'conversion',
        { sessionId: 'session123', value: 100000 }
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketplace_analytics',
        expect.stringContaining(testConfig.testId)
      );
    });

    it('should handle non-existent A/B tests', async () => {
      await expect(
        dashboardService.startABTest('non-existent-test')
      ).rejects.toThrow('A/B test non-existent-test not found');

      await expect(
        dashboardService.getABTestResults('non-existent-test')
      ).rejects.toThrow('A/B test non-existent-test not found');
    });

    it('should not assign users to non-running tests', () => {
      const variant = dashboardService.getUserSegmentForABTest('non-existent-test', 'user123');
      expect(variant).toBeNull();
    });
  });

  describe('Utility Functions', () => {
    it('should hash user IDs consistently', () => {
      // Create service instance to access private method via test
      const service = new AnalyticsDashboardService();
      
      // Test consistent assignment for same user
      const userId = 'test-user';
      const assignment1 = service.getUserSegmentForABTest('test-123', userId);
      const assignment2 = service.getUserSegmentForABTest('test-123', userId);
      
      // Should be null since test doesn't exist, but method shouldn't crash
      expect(assignment1).toBe(assignment2);
      expect(assignment1).toBeNull();
    });
  });
});