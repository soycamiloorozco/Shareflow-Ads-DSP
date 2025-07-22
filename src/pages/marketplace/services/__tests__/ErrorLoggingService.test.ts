/**
 * Error Logging Service Tests
 * Tests for comprehensive error tracking, performance monitoring, and user experience reporting
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorLoggingService } from '../ErrorLoggingService';

// Mock browser APIs
Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'Test Browser' },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: { location: { href: 'http://localhost:3000/test' } },
  writable: true
});

describe('ErrorLoggingService', () => {
  let errorLoggingService: ErrorLoggingService;

  beforeEach(() => {
    errorLoggingService = new ErrorLoggingService({
      enableConsoleLogging: false, // Disable console logging for tests
      enableRemoteLogging: false,
      enablePerformanceMonitoring: true,
      enableUserExperienceTracking: true,
      maxLogEntries: 1000,
      performanceThresholds: {
        sectionGeneration: 1000,
        recommendationService: 800,
        marketDataService: 500,
        deduplication: 300,
        userBehaviorAnalysis: 400,
        cacheOperation: 50
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    errorLoggingService.clearLogs();
  });

  describe('Recommendation Service Error Logging', () => {
    it('should log recommendation service errors with proper context', () => {
      const error = new Error('ML model failed to load');
      const context = {
        userId: 'user-123',
        sessionId: 'session-456',
        operation: 'getTopPicks',
        parameters: { limit: 6, location: 'New York' },
        duration: 2500
      };

      errorLoggingService.logRecommendationServiceError(error, context);

      const recentErrors = errorLoggingService.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);

      const logEntry = recentErrors[0];
      expect(logEntry.level).toBe('error');
      expect(logEntry.category).toBe('recommendation_service');
      expect(logEntry.message).toContain('getTopPicks');
      expect(logEntry.message).toContain('ML model failed to load');
      expect(logEntry.userId).toBe('user-123');
      expect(logEntry.sessionId).toBe('session-456');
      expect(logEntry.context.operation).toBe('getTopPicks');
      expect(logEntry.context.parameters).toEqual({ limit: 6, location: 'New York' });
      expect(logEntry.context.duration).toBe(2500);
      expect(logEntry.stackTrace).toBeDefined();
    });

    it('should determine appropriate severity levels', () => {
      const typeError = new TypeError('Cannot read property of undefined');
      const networkError = new Error('Network timeout');
      const genericError = new Error('Generic error');

      errorLoggingService.logRecommendationServiceError(typeError, {
        operation: 'test',
        sessionId: 'session-1'
      });

      errorLoggingService.logRecommendationServiceError(networkError, {
        operation: 'test',
        sessionId: 'session-2'
      });

      errorLoggingService.logRecommendationServiceError(genericError, {
        operation: 'test',
        sessionId: 'session-3'
      });

      const errors = errorLoggingService.getRecentErrors(3);
      
      const typeErrorLog = errors.find(e => e.context.errorName === 'TypeError');
      const networkErrorLog = errors.find(e => e.message.includes('timeout'));
      const genericErrorLog = errors.find(e => e.message.includes('Generic error'));

      expect(typeErrorLog?.severity).toBe('high');
      expect(networkErrorLog?.severity).toBe('medium');
      expect(genericErrorLog?.severity).toBe('low');
    });
  });

  describe('Section Generation Error Logging', () => {
    it('should log section generation failures with algorithm context', () => {
      const error = new Error('Section generation timeout');
      const context = {
        userId: 'user-789',
        sessionId: 'session-abc',
        sectionId: 'top-picks',
        algorithm: 'ml-personalized',
        duration: 3000,
        screenCount: 0
      };

      errorLoggingService.logSectionGenerationError(error, context);

      const recentErrors = errorLoggingService.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);

      const logEntry = recentErrors[0];
      expect(logEntry.level).toBe('error');
      expect(logEntry.category).toBe('section_generation');
      expect(logEntry.message).toContain('top-picks');
      expect(logEntry.message).toContain('ml-personalized');
      expect(logEntry.message).toContain('Section generation timeout');
      expect(logEntry.context.sectionId).toBe('top-picks');
      expect(logEntry.context.algorithm).toBe('ml-personalized');
      expect(logEntry.context.duration).toBe(3000);
      expect(logEntry.context.screenCount).toBe(0);
    });
  });

  describe('Market Data Error Logging', () => {
    it('should log market data service failures', () => {
      const error = new Error('API rate limit exceeded');
      const context = {
        userId: 'user-456',
        sessionId: 'session-def',
        operation: 'getTrendingScreens',
        location: 'Los Angeles',
        timeframe: 7,
        duration: 1200
      };

      errorLoggingService.logMarketDataError(error, context);

      const recentErrors = errorLoggingService.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);

      const logEntry = recentErrors[0];
      expect(logEntry.level).toBe('error');
      expect(logEntry.category).toBe('market_data');
      expect(logEntry.message).toContain('getTrendingScreens');
      expect(logEntry.message).toContain('API rate limit exceeded');
      expect(logEntry.context.location).toBe('Los Angeles');
      expect(logEntry.context.timeframe).toBe(7);
    });
  });

  describe('Performance Monitoring', () => {
    it('should log performance metrics for operations', () => {
      const context = {
        userId: 'user-perf',
        sessionId: 'session-perf',
        success: true,
        metadata: { screenCount: 12, cacheHit: false }
      };

      errorLoggingService.logPerformanceMetrics('sectionGeneration', 800, context);

      const performanceLogs = errorLoggingService.getRecentPerformanceLogs(1);
      expect(performanceLogs).toHaveLength(1);

      const perfLog = performanceLogs[0];
      expect(perfLog.operation).toBe('sectionGeneration');
      expect(perfLog.duration).toBe(800);
      expect(perfLog.success).toBe(true);
      expect(perfLog.threshold).toBe(1000);
      expect(perfLog.isSlowOperation).toBe(false);
      expect(perfLog.metadata.screenCount).toBe(12);
    });

    it('should detect and log slow operations', () => {
      const context = {
        userId: 'user-slow',
        sessionId: 'session-slow',
        success: true
      };

      errorLoggingService.logPerformanceMetrics('recommendationService', 1500, context);

      const performanceLogs = errorLoggingService.getRecentPerformanceLogs(1);
      const perfLog = performanceLogs[0];
      expect(perfLog.isSlowOperation).toBe(true);

      // Should also create a warning log entry
      const recentErrors = errorLoggingService.getRecentErrors(1);
      const warningLog = recentErrors.find(log => log.level === 'warn');
      expect(warningLog).toBeDefined();
      expect(warningLog?.category).toBe('performance');
      expect(warningLog?.message).toContain('Slow operation detected');
    });

    it('should use default threshold for unknown operations', () => {
      errorLoggingService.logPerformanceMetrics('unknownOperation', 1200, {
        success: true,
        sessionId: 'session-unknown'
      });

      const performanceLogs = errorLoggingService.getRecentPerformanceLogs(1);
      const perfLog = performanceLogs[0];
      expect(perfLog.threshold).toBe(1000); // Default threshold
      expect(perfLog.isSlowOperation).toBe(true);
    });
  });

  describe('User Experience Error Logging', () => {
    it('should log user experience errors with impact assessment', () => {
      const context = {
        userId: 'user-ux',
        sessionId: 'session-ux',
        component: 'SectionedScreenGrid',
        action: 'loadSection',
        errorMessage: 'Failed to load section data',
        severity: 'high' as const,
        userImpact: 'high' as const,
        additionalContext: {
          sectionId: 'trending-screens',
          retryCount: 3,
          lastError: 'Network timeout'
        }
      };

      errorLoggingService.logUserExperienceError('loading_timeout', context);

      const uxErrors = errorLoggingService.getRecentUXErrors(1);
      expect(uxErrors).toHaveLength(1);

      const uxError = uxErrors[0];
      expect(uxError.errorType).toBe('loading_timeout');
      expect(uxError.severity).toBe('high');
      expect(uxError.component).toBe('SectionedScreenGrid');
      expect(uxError.action).toBe('loadSection');
      expect(uxError.userImpact).toBe('high');
      expect(uxError.context.sectionId).toBe('trending-screens');
      expect(uxError.context.retryCount).toBe(3);

      // Should also create a regular error log entry
      const recentErrors = errorLoggingService.getRecentErrors(1);
      const errorLog = recentErrors.find(log => log.category === 'user_experience');
      expect(errorLog).toBeDefined();
      expect(errorLog?.level).toBe('error'); // High severity UX error becomes error level
    });

    it('should create warning logs for medium severity UX errors', () => {
      errorLoggingService.logUserExperienceError('ui_error', {
        component: 'FilterPanel',
        action: 'applyFilters',
        errorMessage: 'Filter animation glitch',
        severity: 'medium',
        userImpact: 'low',
        sessionId: 'session-ui'
      });

      const recentErrors = errorLoggingService.getRecentErrors(1);
      const errorLog = recentErrors.find(log => log.category === 'user_experience');
      expect(errorLog?.level).toBe('warn'); // Medium severity becomes warning
    });
  });

  describe('Error Analytics', () => {
    beforeEach(() => {
      // Create sample error data
      const errors = [
        new Error('ML service timeout'),
        new Error('Network connection failed'),
        new TypeError('Cannot read property'),
        new Error('ML service timeout'), // Duplicate
        new Error('Cache miss')
      ];

      const contexts = [
        { operation: 'getTopPicks', sessionId: 'session-1' },
        { operation: 'getTrending', sessionId: 'session-2' },
        { operation: 'getSimilar', sessionId: 'session-3' },
        { operation: 'getTopPicks', sessionId: 'session-4' },
        { operation: 'cacheGet', sessionId: 'session-5' }
      ];

      errors.forEach((error, index) => {
        errorLoggingService.logRecommendationServiceError(error, contexts[index]);
      });

      // Add some UX errors for impact score calculation
      errorLoggingService.logUserExperienceError('interaction_failure', {
        component: 'ScreenCard',
        action: 'click',
        errorMessage: 'Click handler failed',
        severity: 'high',
        userImpact: 'critical',
        sessionId: 'session-ux-1'
      });

      errorLoggingService.logUserExperienceError('loading_timeout', {
        component: 'SectionLoader',
        action: 'load',
        errorMessage: 'Section load timeout',
        severity: 'medium',
        userImpact: 'medium',
        sessionId: 'session-ux-2'
      });
    });

    it('should generate comprehensive error analytics', () => {
      const analytics = errorLoggingService.getErrorAnalytics();

      expect(analytics.totalErrors).toBe(5);
      expect(analytics.errorsByCategory.recommendation_service).toBe(5);
      expect(analytics.errorsBySeverity.high).toBe(1); // TypeError
      expect(analytics.errorsBySeverity.medium).toBe(1); // Network error
      expect(analytics.errorsBySeverity.low).toBe(3); // Others

      expect(analytics.topErrors).toHaveLength(4); // 4 unique error messages
      const topError = analytics.topErrors[0];
      expect(topError.message).toContain('ML service timeout');
      expect(topError.count).toBe(2); // Appears twice

      expect(analytics.userImpactScore).toBeGreaterThan(0);
    });

    it('should filter analytics by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const analytics = errorLoggingService.getErrorAnalytics({
        start: oneHourAgo,
        end: now
      });

      expect(analytics.timeRange.start).toEqual(oneHourAgo);
      expect(analytics.timeRange.end).toEqual(now);
      // All errors should be within the time range since they were just created
      expect(analytics.totalErrors).toBe(5);
    });
  });

  describe('Performance Analytics', () => {
    beforeEach(() => {
      // Create sample performance data
      const operations = [
        { name: 'sectionGeneration', duration: 800, success: true },
        { name: 'sectionGeneration', duration: 1200, success: true }, // Slow
        { name: 'recommendationService', duration: 600, success: true },
        { name: 'recommendationService', duration: 1000, success: false }, // Slow + failed
        { name: 'marketDataService', duration: 300, success: true },
        { name: 'cacheOperation', duration: 80, success: true }
      ];

      operations.forEach(op => {
        errorLoggingService.logPerformanceMetrics(op.name, op.duration, {
          success: op.success,
          sessionId: `session-${op.name}`
        });
      });
    });

    it('should generate comprehensive performance analytics', () => {
      const analytics = errorLoggingService.getPerformanceAnalytics();

      expect(analytics.totalOperations).toBe(6);
      expect(analytics.slowOperations).toBe(2); // 2 operations exceeded thresholds
      expect(analytics.averageDuration).toBeCloseTo(663.33, 1); // Average of all durations

      expect(analytics.operationsByType.sectionGeneration.count).toBe(2);
      expect(analytics.operationsByType.sectionGeneration.slowCount).toBe(1);
      expect(analytics.operationsByType.recommendationService.slowCount).toBe(1);

      expect(analytics.bottlenecks).toHaveLength(2); // 2 operations with slow instances
      expect(analytics.bottlenecks[0].operation).toBe('recommendationService'); // Highest avg duration
      expect(analytics.performanceScore).toBeLessThan(100); // Should be penalized for slow operations
    });

    it('should identify bottlenecks correctly', () => {
      const analytics = errorLoggingService.getPerformanceAnalytics();
      
      const bottlenecks = analytics.bottlenecks;
      expect(bottlenecks.length).toBeGreaterThan(0);
      
      bottlenecks.forEach(bottleneck => {
        expect(bottleneck.avgDuration).toBeGreaterThan(bottleneck.threshold);
      });
    });
  });

  describe('Log Management', () => {
    it('should maintain maximum log entries limit', () => {
      const smallLogService = new ErrorLoggingService({
        maxLogEntries: 3,
        enableConsoleLogging: false
      });

      // Add more errors than the limit
      for (let i = 0; i < 5; i++) {
        smallLogService.logRecommendationServiceError(
          new Error(`Error ${i}`),
          { operation: `op-${i}`, sessionId: `session-${i}` }
        );
      }

      const recentErrors = smallLogService.getRecentErrors(10);
      expect(recentErrors.length).toBeLessThanOrEqual(3);
    });

    it('should clear all logs', () => {
      errorLoggingService.logRecommendationServiceError(
        new Error('Test error'),
        { operation: 'test', sessionId: 'session-clear' }
      );

      errorLoggingService.logPerformanceMetrics('testOp', 500, {
        success: true,
        sessionId: 'session-clear'
      });

      errorLoggingService.logUserExperienceError('ui_error', {
        component: 'TestComponent',
        action: 'test',
        errorMessage: 'Test UX error',
        severity: 'low',
        userImpact: 'low',
        sessionId: 'session-clear'
      });

      expect(errorLoggingService.getRecentErrors().length).toBeGreaterThan(0);
      expect(errorLoggingService.getRecentPerformanceLogs().length).toBeGreaterThan(0);
      expect(errorLoggingService.getRecentUXErrors().length).toBeGreaterThan(0);

      errorLoggingService.clearLogs();

      expect(errorLoggingService.getRecentErrors()).toHaveLength(0);
      expect(errorLoggingService.getRecentPerformanceLogs()).toHaveLength(0);
      expect(errorLoggingService.getRecentUXErrors()).toHaveLength(0);
    });
  });

  describe('Log Export', () => {
    beforeEach(() => {
      errorLoggingService.logRecommendationServiceError(
        new Error('Export test error'),
        { operation: 'exportTest', sessionId: 'session-export' }
      );
    });

    it('should export logs in JSON format', () => {
      const jsonExport = errorLoggingService.exportLogs('json');
      const data = JSON.parse(jsonExport);

      expect(data.errors).toBeDefined();
      expect(data.performance).toBeDefined();
      expect(data.userExperience).toBeDefined();
      expect(data.exportedAt).toBeDefined();
      expect(data.errors.length).toBeGreaterThan(0);
    });

    it('should export logs in CSV format', () => {
      const csvExport = errorLoggingService.exportLogs('csv');
      
      expect(csvExport).toContain('timestamp,level,category,severity,message,userId,sessionId');
      expect(csvExport).toContain('Export test error');
      expect(csvExport).toContain('recommendation_service');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', () => {
      // This test ensures cleanup doesn't throw errors
      expect(() => {
        errorLoggingService.cleanup();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors without stack traces', () => {
      const errorWithoutStack = new Error('No stack trace');
      delete errorWithoutStack.stack;

      expect(() => {
        errorLoggingService.logRecommendationServiceError(errorWithoutStack, {
          operation: 'test',
          sessionId: 'session-no-stack'
        });
      }).not.toThrow();

      const recentErrors = errorLoggingService.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
    });

    it('should handle missing browser APIs gracefully', () => {
      // Temporarily remove browser APIs
      const originalNavigator = global.navigator;
      const originalWindow = global.window;

      delete (global as any).navigator;
      delete (global as any).window;

      expect(() => {
        errorLoggingService.logRecommendationServiceError(
          new Error('Browser API test'),
          { operation: 'test', sessionId: 'session-no-browser' }
        );
      }).not.toThrow();

      // Restore browser APIs
      global.navigator = originalNavigator;
      global.window = originalWindow;
    });

    it('should handle performance monitoring when disabled', () => {
      const disabledPerfService = new ErrorLoggingService({
        enablePerformanceMonitoring: false,
        enableConsoleLogging: false
      });

      disabledPerfService.logPerformanceMetrics('testOp', 1000, {
        success: true,
        sessionId: 'session-disabled'
      });

      const performanceLogs = disabledPerfService.getRecentPerformanceLogs();
      expect(performanceLogs).toHaveLength(0);
    });

    it('should handle UX tracking when disabled', () => {
      const disabledUXService = new ErrorLoggingService({
        enableUserExperienceTracking: false,
        enableConsoleLogging: false
      });

      disabledUXService.logUserExperienceError('ui_error', {
        component: 'TestComponent',
        action: 'test',
        errorMessage: 'Test error',
        severity: 'low',
        userImpact: 'low',
        sessionId: 'session-disabled-ux'
      });

      const uxErrors = disabledUXService.getRecentUXErrors();
      expect(uxErrors).toHaveLength(0);
    });
  });
});