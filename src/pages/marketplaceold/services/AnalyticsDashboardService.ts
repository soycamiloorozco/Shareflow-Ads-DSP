import { 
  SectionPerformanceMetrics, 
  ScreenInteractionSummary, 
  ABTestConfig, 
  ABTestResult, 
  ABTestVariant,
  ABTestVariantResult,
  AnalyticsEvent,
  ConversionEvent,
  SectionEngagement
} from '../types/intelligent-grouping.types';

export interface AnalyticsDashboardConfig {
  apiEndpoint?: string;
  enableRealTimeUpdates: boolean;
  cacheTimeout: number;
  batchSize: number;
}

export interface SectionPerformanceReport {
  sectionId: string;
  sectionName: string;
  timeframe: { start: Date; end: Date };
  metrics: SectionPerformanceMetrics;
  trends: PerformanceTrend[];
  recommendations: string[];
}

export interface PerformanceTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  changePercentage: number;
  significance: 'high' | 'medium' | 'low';
}

export interface ConversionAnalysis {
  sectionId: string;
  totalConversions: number;
  conversionRate: number;
  conversionsByType: Record<string, number>;
  conversionFunnel: ConversionFunnelStep[];
  topConvertingScreens: ScreenConversionMetrics[];
}

export interface ConversionFunnelStep {
  step: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface ScreenConversionMetrics {
  screenId: string;
  screenName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export interface DashboardSummary {
  totalSections: number;
  totalScreens: number;
  totalImpressions: number;
  totalConversions: number;
  averageEngagementTime: number;
  topPerformingSections: SectionPerformanceMetrics[];
  recentTrends: PerformanceTrend[];
  alertsAndInsights: DashboardAlert[];
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  sectionId?: string;
  actionRequired: boolean;
  timestamp: Date;
}

export class AnalyticsDashboardService {
  private config: AnalyticsDashboardConfig;
  private cache: Map<string, { data: any; timestamp: Date }> = new Map();
  private activeABTests: Map<string, ABTestConfig> = new Map();

  constructor(config: Partial<AnalyticsDashboardConfig> = {}) {
    this.config = {
      apiEndpoint: '/api/analytics',
      enableRealTimeUpdates: true,
      cacheTimeout: 300000, // 5 minutes
      batchSize: 100,
      ...config
    };
  }

  /**
   * Get comprehensive section performance metrics
   */
  async getSectionPerformanceMetrics(
    sectionId: string, 
    timeframe: { start: Date; end: Date }
  ): Promise<SectionPerformanceMetrics> {
    const cacheKey = `section-performance-${sectionId}-${timeframe.start.getTime()}-${timeframe.end.getTime()}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Get analytics events from localStorage (in production, this would be from API)
    const events = this.getAnalyticsEvents(sectionId, timeframe);
    const metrics = this.calculateSectionMetrics(sectionId, events, timeframe);

    // Cache the result
    this.setCachedData(cacheKey, metrics);
    
    return metrics;
  }

  /**
   * Get section engagement report with detailed analysis
   */
  async getSectionEngagementReport(
    sectionId: string,
    timeframe: { start: Date; end: Date }
  ): Promise<SectionPerformanceReport> {
    const metrics = await this.getSectionPerformanceMetrics(sectionId, timeframe);
    const trends = await this.calculatePerformanceTrends(sectionId, timeframe);
    const recommendations = this.generateRecommendations(metrics, trends);

    return {
      sectionId,
      sectionName: this.getSectionName(sectionId),
      timeframe,
      metrics,
      trends,
      recommendations
    };
  }

  /**
   * Analyze conversion rates and funnel performance
   */
  async getConversionAnalysis(
    sectionId: string,
    timeframe: { start: Date; end: Date }
  ): Promise<ConversionAnalysis> {
    const events = this.getAnalyticsEvents(sectionId, timeframe);
    const conversionEvents = events.filter(e => e.type === 'conversion') as ConversionEvent[];
    
    const totalConversions = conversionEvents.length;
    const totalImpressions = events.filter(e => e.type === 'section_view_start').length;
    const conversionRate = totalImpressions > 0 ? totalConversions / totalImpressions : 0;

    const conversionsByType = conversionEvents.reduce((acc, event) => {
      const type = event.data.conversionType as string;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conversionFunnel = this.calculateConversionFunnel(events);
    const topConvertingScreens = this.getTopConvertingScreens(events);

    return {
      sectionId,
      totalConversions,
      conversionRate,
      conversionsByType,
      conversionFunnel,
      topConvertingScreens
    };
  }

  /**
   * Get dashboard summary with key metrics
   */
  async getDashboardSummary(timeframe: { start: Date; end: Date }): Promise<DashboardSummary> {
    const allEvents = this.getAllAnalyticsEvents(timeframe);
    const sectionIds = [...new Set(allEvents.map(e => e.sectionId).filter(Boolean))];
    
    const sectionMetrics = await Promise.all(
      sectionIds.map(id => this.getSectionPerformanceMetrics(id!, timeframe))
    );

    const totalImpressions = sectionMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalConversions = allEvents.filter(e => e.type === 'conversion').length;
    const averageEngagementTime = sectionMetrics.length > 0 
      ? sectionMetrics.reduce((sum, m) => sum + m.averageViewTime, 0) / sectionMetrics.length 
      : 0;

    const topPerformingSections = sectionMetrics
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    const recentTrends = await this.getRecentTrends(timeframe);
    const alertsAndInsights = await this.generateDashboardAlerts(sectionMetrics);

    return {
      totalSections: sectionIds.length,
      totalScreens: this.getTotalUniqueScreens(allEvents),
      totalImpressions,
      totalConversions,
      averageEngagementTime,
      topPerformingSections,
      recentTrends,
      alertsAndInsights
    };
  }

  /**
   * Create and configure A/B test
   */
  async createABTest(testConfig: Omit<ABTestConfig, 'testId'>): Promise<ABTestConfig> {
    const testId = `ab-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullConfig: ABTestConfig = {
      ...testConfig,
      testId,
      status: 'draft'
    };

    this.activeABTests.set(testId, fullConfig);
    
    // In production, this would save to database
    this.saveABTestConfig(fullConfig);
    
    return fullConfig;
  }

  /**
   * Start an A/B test
   */
  async startABTest(testId: string): Promise<void> {
    const testConfig = this.activeABTests.get(testId);
    if (!testConfig) {
      throw new Error(`A/B test ${testId} not found`);
    }

    const updatedConfig = { ...testConfig, status: 'running' as const };
    this.activeABTests.set(testId, updatedConfig);
    this.saveABTestConfig(updatedConfig);
  }

  /**
   * Get A/B test results and analysis
   */
  async getABTestResults(testId: string): Promise<ABTestResult> {
    const testConfig = this.activeABTests.get(testId);
    if (!testConfig) {
      throw new Error(`A/B test ${testId} not found`);
    }

    const variantResults = await Promise.all(
      testConfig.variants.map(variant => this.calculateVariantResults(testId, variant))
    );

    const winner = this.determineABTestWinner(variantResults);
    const confidence = this.calculateStatisticalConfidence(variantResults);
    const statisticalSignificance = confidence >= 0.95;
    const recommendations = this.generateABTestRecommendations(variantResults, winner);

    return {
      testId,
      variantResults,
      winner,
      confidence,
      statisticalSignificance,
      recommendations,
      generatedAt: new Date()
    };
  }

  /**
   * Get user segment assignment for A/B testing
   */
  getUserSegmentForABTest(testId: string, userId: string): string | null {
    const testConfig = this.activeABTests.get(testId);
    if (!testConfig || testConfig.status !== 'running') {
      return null;
    }

    // Simple hash-based assignment for consistent user experience
    const hash = this.hashUserId(userId + testId);
    const totalTraffic = Object.values(testConfig.trafficAllocation).reduce((sum, val) => sum + val, 0);
    const normalizedHash = hash % totalTraffic;

    let currentThreshold = 0;
    for (const [variantId, allocation] of Object.entries(testConfig.trafficAllocation)) {
      currentThreshold += allocation;
      if (normalizedHash < currentThreshold) {
        return variantId;
      }
    }

    return testConfig.variants[0]?.variantId || null;
  }

  /**
   * Track A/B test event
   */
  async trackABTestEvent(
    testId: string,
    variantId: string,
    userId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    const event: AnalyticsEvent = {
      type: 'conversion', // Using existing type, in production would have ab_test_event type
      userId,
      sessionId: eventData.sessionId || 'unknown',
      timestamp: new Date(),
      data: {
        testId,
        variantId,
        eventType,
        ...eventData
      }
    };

    // Store event (in production, this would go to analytics backend)
    this.storeAnalyticsEvent(event);
  }

  // Private helper methods

  private getAnalyticsEvents(sectionId: string, timeframe: { start: Date; end: Date }): AnalyticsEvent[] {
    const allEvents = JSON.parse(localStorage.getItem('marketplace_analytics') || '[]') as AnalyticsEvent[];
    return allEvents.filter(event => 
      event.sectionId === sectionId &&
      new Date(event.timestamp) >= timeframe.start &&
      new Date(event.timestamp) <= timeframe.end
    );
  }

  private getAllAnalyticsEvents(timeframe: { start: Date; end: Date }): AnalyticsEvent[] {
    const allEvents = JSON.parse(localStorage.getItem('marketplace_analytics') || '[]') as AnalyticsEvent[];
    return allEvents.filter(event => 
      new Date(event.timestamp) >= timeframe.start &&
      new Date(event.timestamp) <= timeframe.end
    );
  }

  private calculateSectionMetrics(
    sectionId: string, 
    events: AnalyticsEvent[], 
    timeframe: { start: Date; end: Date }
  ): SectionPerformanceMetrics {
    const impressions = events.filter(e => e.type === 'section_view_start').length;
    const uniqueViews = new Set(events.filter(e => e.type === 'section_view_start').map(e => e.userId)).size;
    const clicks = events.filter(e => e.type === 'screen_click').length;
    const conversions = events.filter(e => e.type === 'conversion').length;

    const viewEvents = events.filter(e => e.type === 'section_view_end');
    const totalViewTime = viewEvents.reduce((sum, e) => sum + (e.data.viewDuration || 0), 0);
    const averageViewTime = viewEvents.length > 0 ? totalViewTime / viewEvents.length : 0;

    const scrollEvents = events.filter(e => e.type === 'section_scroll');
    const scrollDepthAverage = scrollEvents.length > 0 
      ? scrollEvents.reduce((sum, e) => sum + (e.data.scrollDepth || 0), 0) / scrollEvents.length 
      : 0;

    const clickThroughRate = impressions > 0 ? clicks / impressions : 0;
    const conversionRate = impressions > 0 ? conversions / impressions : 0;

    const screenInteractions = this.calculateScreenInteractions(events);

    return {
      sectionId,
      sectionName: this.getSectionName(sectionId),
      impressions,
      uniqueViews,
      totalViewTime,
      averageViewTime,
      clickThroughRate,
      conversionRate,
      scrollDepthAverage,
      screenInteractions,
      timeframe,
      lastUpdated: new Date()
    };
  }

  private calculateScreenInteractions(events: AnalyticsEvent[]): ScreenInteractionSummary[] {
    const screenMap = new Map<string, ScreenInteractionSummary>();

    // First, count impressions for each screen based on section views
    const sectionViewEvents = events.filter(e => e.type === 'section_view_start');
    const screenClickEvents = events.filter(e => e.type === 'screen_click');
    
    // Get unique screens from click events
    const uniqueScreens = new Set(screenClickEvents.map(e => e.screenId).filter(Boolean));

    uniqueScreens.forEach(screenId => {
      if (!screenId) return;
      
      screenMap.set(screenId, {
        screenId,
        screenName: `Screen ${screenId}`,
        position: 0,
        impressions: sectionViewEvents.length, // Each section view is an impression for all screens in that section
        clicks: 0,
        hoverTime: 0,
        conversionRate: 0,
        clickThroughRate: 0
      });
    });

    events.forEach(event => {
      if (!event.screenId || !screenMap.has(event.screenId)) return;

      const summary = screenMap.get(event.screenId)!;

      switch (event.type) {
        case 'screen_click':
          summary.clicks++;
          summary.position = event.data.position || 0;
          break;
        case 'screen_hover':
          summary.hoverTime += event.data.hoverDuration || 0;
          break;
      }
    });

    // Calculate rates
    screenMap.forEach(summary => {
      summary.clickThroughRate = summary.impressions > 0 ? summary.clicks / summary.impressions : 0;
      const conversions = events.filter(e => 
        e.type === 'conversion' && e.screenId === summary.screenId
      ).length;
      summary.conversionRate = summary.impressions > 0 ? conversions / summary.impressions : 0;
    });

    return Array.from(screenMap.values()).sort((a, b) => b.conversionRate - a.conversionRate);
  }

  private async calculatePerformanceTrends(
    sectionId: string, 
    timeframe: { start: Date; end: Date }
  ): Promise<PerformanceTrend[]> {
    // For demo purposes, return mock trends
    // In production, this would compare with previous periods
    return [
      {
        metric: 'conversionRate',
        direction: 'up',
        changePercentage: 12.5,
        significance: 'high'
      },
      {
        metric: 'clickThroughRate',
        direction: 'up',
        changePercentage: 8.3,
        significance: 'medium'
      },
      {
        metric: 'averageViewTime',
        direction: 'stable',
        changePercentage: 1.2,
        significance: 'low'
      }
    ];
  }

  private generateRecommendations(
    metrics: SectionPerformanceMetrics, 
    trends: PerformanceTrend[]
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.conversionRate < 0.02) {
      recommendations.push('Consider improving screen quality or relevance to increase conversion rate');
    }

    if (metrics.clickThroughRate < 0.05) {
      recommendations.push('Optimize screen thumbnails and titles to improve click-through rate');
    }

    if (metrics.averageViewTime < 5000) {
      recommendations.push('Section content may not be engaging enough - consider A/B testing different layouts');
    }

    const positiveConversionTrend = trends.find(t => t.metric === 'conversionRate' && t.direction === 'up');
    if (positiveConversionTrend) {
      recommendations.push('Conversion rate is trending up - consider scaling successful strategies');
    }

    return recommendations;
  }

  private calculateConversionFunnel(events: AnalyticsEvent[]): ConversionFunnelStep[] {
    const impressions = events.filter(e => e.type === 'section_view_start').length;
    const clicks = events.filter(e => e.type === 'screen_click').length;
    const conversions = events.filter(e => e.type === 'conversion').length;

    return [
      {
        step: 'Section View',
        count: impressions,
        conversionRate: 1.0,
        dropOffRate: 0
      },
      {
        step: 'Screen Click',
        count: clicks,
        conversionRate: impressions > 0 ? clicks / impressions : 0,
        dropOffRate: impressions > 0 ? (impressions - clicks) / impressions : 0
      },
      {
        step: 'Conversion',
        count: conversions,
        conversionRate: clicks > 0 ? conversions / clicks : 0,
        dropOffRate: clicks > 0 ? (clicks - conversions) / clicks : 0
      }
    ];
  }

  private getTopConvertingScreens(events: AnalyticsEvent[]): ScreenConversionMetrics[] {
    const screenMap = new Map<string, ScreenConversionMetrics>();

    events.forEach(event => {
      if (!event.screenId) return;

      if (!screenMap.has(event.screenId)) {
        screenMap.set(event.screenId, {
          screenId: event.screenId,
          screenName: `Screen ${event.screenId}`,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0
        });
      }

      const metrics = screenMap.get(event.screenId)!;

      switch (event.type) {
        case 'section_view_start':
          metrics.impressions++;
          break;
        case 'screen_click':
          metrics.clicks++;
          break;
        case 'conversion':
          metrics.conversions++;
          metrics.revenue += event.data.value || 0;
          break;
      }
    });

    // Calculate conversion rates
    screenMap.forEach(metrics => {
      metrics.conversionRate = metrics.impressions > 0 ? metrics.conversions / metrics.impressions : 0;
    });

    return Array.from(screenMap.values())
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);
  }

  private async getRecentTrends(timeframe: { start: Date; end: Date }): Promise<PerformanceTrend[]> {
    // Mock implementation - in production would analyze historical data
    return [
      {
        metric: 'totalConversions',
        direction: 'up',
        changePercentage: 15.2,
        significance: 'high'
      },
      {
        metric: 'averageEngagementTime',
        direction: 'up',
        changePercentage: 7.8,
        significance: 'medium'
      }
    ];
  }

  private async generateDashboardAlerts(metrics: SectionPerformanceMetrics[]): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];

    metrics.forEach(metric => {
      if (metric.conversionRate < 0.01) {
        alerts.push({
          id: `low-conversion-${metric.sectionId}`,
          type: 'warning',
          title: 'Low Conversion Rate',
          message: `Section "${metric.sectionName}" has a conversion rate below 1%`,
          sectionId: metric.sectionId,
          actionRequired: true,
          timestamp: new Date()
        });
      }

      if (metric.clickThroughRate > 0.1) {
        alerts.push({
          id: `high-ctr-${metric.sectionId}`,
          type: 'success',
          title: 'High Engagement',
          message: `Section "${metric.sectionName}" has excellent click-through rate of ${(metric.clickThroughRate * 100).toFixed(1)}%`,
          sectionId: metric.sectionId,
          actionRequired: false,
          timestamp: new Date()
        });
      }
    });

    return alerts;
  }

  private getTotalUniqueScreens(events: AnalyticsEvent[]): number {
    return new Set(events.map(e => e.screenId).filter(Boolean)).size;
  }

  private async calculateVariantResults(testId: string, variant: ABTestVariant): Promise<ABTestVariantResult> {
    // Mock implementation - in production would query actual test data
    const participants = Math.floor(Math.random() * 1000) + 100;
    const conversions = Math.floor(participants * (Math.random() * 0.1 + 0.02));
    
    return {
      variantId: variant.variantId,
      participants,
      conversions,
      conversionRate: conversions / participants,
      averageEngagementTime: Math.random() * 30000 + 10000,
      clickThroughRate: Math.random() * 0.1 + 0.02,
      bounceRate: Math.random() * 0.3 + 0.1,
      revenuePerUser: Math.random() * 50000 + 10000,
      confidence: Math.random() * 0.4 + 0.6
    };
  }

  private determineABTestWinner(results: ABTestVariantResult[]): string | undefined {
    if (results.length < 2) return undefined;
    
    const bestResult = results.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );

    return bestResult.confidence > 0.95 ? bestResult.variantId : undefined;
  }

  private calculateStatisticalConfidence(results: ABTestVariantResult[]): number {
    if (results.length < 2) return 0;
    
    // Simplified confidence calculation - in production would use proper statistical tests
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    return Math.min(avgConfidence, 0.99);
  }

  private generateABTestRecommendations(
    results: ABTestVariantResult[], 
    winner?: string
  ): string[] {
    const recommendations: string[] = [];

    if (winner) {
      recommendations.push(`Implement variant ${winner} as it shows statistically significant improvement`);
    } else {
      recommendations.push('Continue test - no statistically significant winner yet');
    }

    const bestCTR = Math.max(...results.map(r => r.clickThroughRate));
    const bestConversion = Math.max(...results.map(r => r.conversionRate));

    if (bestCTR > 0.08) {
      recommendations.push('High click-through rates observed - consider scaling successful elements');
    }

    if (bestConversion > 0.05) {
      recommendations.push('Strong conversion performance - analyze winning elements for broader application');
    }

    return recommendations;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getSectionName(sectionId: string): string {
    // In production, this would fetch from configuration
    const sectionNames: Record<string, string> = {
      'top-picks': 'Top Picks for You',
      'recently-purchased': 'Recently Purchased',
      'trending': 'Trending Now',
      'new-discovery': 'New to Discover',
      'top-in-city': 'Top in Your City'
    };
    return sectionNames[sectionId] || `Section ${sectionId}`;
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp.getTime() < this.config.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: new Date() });
  }

  private saveABTestConfig(config: ABTestConfig): void {
    // In production, this would save to database
    const existingTests = JSON.parse(localStorage.getItem('ab_tests') || '[]');
    const updatedTests = existingTests.filter((t: ABTestConfig) => t.testId !== config.testId);
    updatedTests.push(config);
    localStorage.setItem('ab_tests', JSON.stringify(updatedTests));
  }

  private storeAnalyticsEvent(event: AnalyticsEvent): void {
    const existingEvents = JSON.parse(localStorage.getItem('marketplace_analytics') || '[]');
    existingEvents.push(event);
    localStorage.setItem('marketplace_analytics', JSON.stringify(existingEvents));
  }
}

// Singleton instance for global use
export const analyticsDashboard = new AnalyticsDashboardService();