/**
 * Error Logging Service
 * Comprehensive error tracking, performance monitoring, and user experience reporting
 * Requirements: 9.4
 */

import {
  GroupingError,
  PerformanceMetrics,
  UserExperienceError,
  ErrorSeverity,
  ErrorCategory,
  PerformanceThreshold
} from '../types/intelligent-grouping.types';

export interface ErrorLoggingConfig {
  readonly enableConsoleLogging: boolean;
  readonly enableRemoteLogging: boolean;
  readonly enablePerformanceMonitoring: boolean;
  readonly enableUserExperienceTracking: boolean;
  readonly maxLogEntries: number;
  readonly performanceThresholds: PerformanceThreshold;
  readonly remoteEndpoint?: string;
  readonly batchSize: number;
  readonly flushIntervalMs: number;
}

export interface LogEntry {
  readonly id: string;
  readonly timestamp: Date;
  readonly level: 'error' | 'warn' | 'info' | 'debug';
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly message: string;
  readonly context: Record<string, any>;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly stackTrace?: string;
  readonly userAgent?: string;
  readonly url?: string;
}

export interface PerformanceLog {
  readonly id: string;
  readonly timestamp: Date;
  readonly operation: string;
  readonly duration: number;
  readonly success: boolean;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly metadata: Record<string, any>;
  readonly threshold: number;
  readonly isSlowOperation: boolean;
}

export interface UserExperienceLog {
  readonly id: string;
  readonly timestamp: Date;
  readonly errorType: 'interaction_failure' | 'loading_timeout' | 'ui_error' | 'data_inconsistency';
  readonly severity: ErrorSeverity;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly component: string;
  readonly action: string;
  readonly errorMessage: string;
  readonly context: Record<string, any>;
  readonly userImpact: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorAnalytics {
  readonly totalErrors: number;
  readonly errorsByCategory: Record<ErrorCategory, number>;
  readonly errorsBySeverity: Record<ErrorSeverity, number>;
  readonly topErrors: Array<{ message: string; count: number; lastOccurrence: Date }>;
  readonly errorRate: number;
  readonly averageResolutionTime: number;
  readonly userImpactScore: number;
  readonly timeRange: { start: Date; end: Date };
}

export interface PerformanceAnalytics {
  readonly totalOperations: number;
  readonly averageDuration: number;
  readonly slowOperations: number;
  readonly operationsByType: Record<string, { count: number; avgDuration: number; slowCount: number }>;
  readonly performanceScore: number;
  readonly bottlenecks: Array<{ operation: string; avgDuration: number; threshold: number }>;
  readonly timeRange: { start: Date; end: Date };
}

/**
 * Comprehensive error logging and monitoring service
 */
export class ErrorLoggingService {
  private readonly config: ErrorLoggingConfig;
  private readonly errorLog: LogEntry[] = [];
  private readonly performanceLog: PerformanceLog[] = [];
  private readonly userExperienceLog: UserExperienceLog[] = [];
  private readonly pendingLogs: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config?: Partial<ErrorLoggingConfig>) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      enablePerformanceMonitoring: true,
      enableUserExperienceTracking: true,
      maxLogEntries: 10000,
      performanceThresholds: {
        sectionGeneration: 2000, // 2 seconds
        recommendationService: 1500, // 1.5 seconds
        marketDataService: 1000, // 1 second
        deduplication: 500, // 0.5 seconds
        userBehaviorAnalysis: 800, // 0.8 seconds
        cacheOperation: 100 // 0.1 seconds
      },
      batchSize: 50,
      flushIntervalMs: 30000, // 30 seconds
      ...config
    };

    if (this.config.enableRemoteLogging) {
      this.startBatchFlush();
    }
  }

  /**
   * Log recommendation service failures
   * Requirements: 9.4
   */
  logRecommendationServiceError(
    error: Error,
    context: {
      userId?: string;
      sessionId?: string;
      operation: string;
      parameters?: Record<string, any>;
      duration?: number;
    }
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      category: 'recommendation_service',
      severity: this.determineSeverity(error, context),
      message: `Recommendation service error in ${context.operation}: ${error.message}`,
      context: {
        operation: context.operation,
        parameters: context.parameters,
        duration: context.duration,
        errorName: error.name,
        errorStack: error.stack
      },
      userId: context.userId,
      sessionId: context.sessionId,
      stackTrace: error.stack,
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl()
    };

    this.addLogEntry(logEntry);
    this.logToConsole(logEntry);
  }

  /**
   * Log section generation performance and failures
   * Requirements: 9.4
   */
  logSectionGenerationError(
    error: Error,
    context: {
      userId?: string;
      sessionId?: string;
      sectionId: string;
      algorithm: string;
      duration?: number;
      screenCount?: number;
    }
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      category: 'section_generation',
      severity: this.determineSeverity(error, context),
      message: `Section generation failed for ${context.sectionId} using ${context.algorithm}: ${error.message}`,
      context: {
        sectionId: context.sectionId,
        algorithm: context.algorithm,
        duration: context.duration,
        screenCount: context.screenCount,
        errorName: error.name
      },
      userId: context.userId,
      sessionId: context.sessionId,
      stackTrace: error.stack,
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl()
    };

    this.addLogEntry(logEntry);
    this.logToConsole(logEntry);
  }

  /**
   * Log market data service failures
   * Requirements: 9.4
   */
  logMarketDataError(
    error: Error,
    context: {
      userId?: string;
      sessionId?: string;
      operation: string;
      location?: string;
      timeframe?: number;
      duration?: number;
    }
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      category: 'market_data',
      severity: this.determineSeverity(error, context),
      message: `Market data service error in ${context.operation}: ${error.message}`,
      context: {
        operation: context.operation,
        location: context.location,
        timeframe: context.timeframe,
        duration: context.duration,
        errorName: error.name
      },
      userId: context.userId,
      sessionId: context.sessionId,
      stackTrace: error.stack,
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl()
    };

    this.addLogEntry(logEntry);
    this.logToConsole(logEntry);
  }

  /**
   * Monitor and log performance metrics for section generation
   * Requirements: 9.4
   */
  logPerformanceMetrics(
    operation: string,
    duration: number,
    context: {
      userId?: string;
      sessionId?: string;
      success: boolean;
      metadata?: Record<string, any>;
    }
  ): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const threshold = this.config.performanceThresholds[operation as keyof PerformanceThreshold] || 1000;
    const isSlowOperation = duration > threshold;

    const performanceLog: PerformanceLog = {
      id: this.generateId(),
      timestamp: new Date(),
      operation,
      duration,
      success: context.success,
      userId: context.userId,
      sessionId: context.sessionId,
      metadata: context.metadata || {},
      threshold,
      isSlowOperation
    };

    this.performanceLog.push(performanceLog);

    // Log slow operations as warnings
    if (isSlowOperation) {
      const logEntry: LogEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        level: 'warn',
        category: 'performance',
        severity: 'medium',
        message: `Slow operation detected: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
        context: {
          operation,
          duration,
          threshold,
          success: context.success,
          metadata: context.metadata
        },
        userId: context.userId,
        sessionId: context.sessionId,
        userAgent: this.getUserAgent(),
        url: this.getCurrentUrl()
      };

      this.addLogEntry(logEntry);
      this.logToConsole(logEntry);
    }

    // Maintain log size
    if (this.performanceLog.length > this.config.maxLogEntries) {
      this.performanceLog.splice(0, this.performanceLog.length - this.config.maxLogEntries);
    }
  }

  /**
   * Log user experience errors and failed interactions
   * Requirements: 9.4
   */
  logUserExperienceError(
    errorType: 'interaction_failure' | 'loading_timeout' | 'ui_error' | 'data_inconsistency',
    context: {
      userId?: string;
      sessionId?: string;
      component: string;
      action: string;
      errorMessage: string;
      severity: ErrorSeverity;
      userImpact: 'low' | 'medium' | 'high' | 'critical';
      additionalContext?: Record<string, any>;
    }
  ): void {
    if (!this.config.enableUserExperienceTracking) return;

    const uxLog: UserExperienceLog = {
      id: this.generateId(),
      timestamp: new Date(),
      errorType,
      severity: context.severity,
      userId: context.userId,
      sessionId: context.sessionId,
      component: context.component,
      action: context.action,
      errorMessage: context.errorMessage,
      context: context.additionalContext || {},
      userImpact: context.userImpact
    };

    this.userExperienceLog.push(uxLog);

    // Also log as regular error entry
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level: context.severity === 'critical' || context.severity === 'high' ? 'error' : 'warn',
      category: 'user_experience',
      severity: context.severity,
      message: `User experience error in ${context.component}: ${context.errorMessage}`,
      context: {
        errorType,
        component: context.component,
        action: context.action,
        userImpact: context.userImpact,
        ...context.additionalContext
      },
      userId: context.userId,
      sessionId: context.sessionId,
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl()
    };

    this.addLogEntry(logEntry);
    this.logToConsole(logEntry);

    // Maintain log size
    if (this.userExperienceLog.length > this.config.maxLogEntries) {
      this.userExperienceLog.splice(0, this.userExperienceLog.length - this.config.maxLogEntries);
    }
  }

  /**
   * Get error analytics for monitoring dashboard
   * Requirements: 9.4
   */
  getErrorAnalytics(timeRange?: { start: Date; end: Date }): ErrorAnalytics {
    const filteredLogs = this.filterLogsByTimeRange(this.errorLog, timeRange);
    const errorLogs = filteredLogs.filter(log => log.level === 'error');

    const errorsByCategory: Record<ErrorCategory, number> = {
      recommendation_service: 0,
      section_generation: 0,
      market_data: 0,
      user_experience: 0,
      performance: 0,
      cache: 0,
      api: 0,
      unknown: 0
    };

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    const errorCounts = new Map<string, { count: number; lastOccurrence: Date }>();

    errorLogs.forEach(log => {
      errorsByCategory[log.category]++;
      errorsBySeverity[log.severity]++;

      const key = log.message;
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
        if (log.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = log.timestamp;
        }
      } else {
        errorCounts.set(key, { count: 1, lastOccurrence: log.timestamp });
      }
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalOperations = this.performanceLog.length;
    const errorRate = totalOperations > 0 ? errorLogs.length / totalOperations : 0;

    // Calculate user impact score based on UX errors
    const uxErrors = this.userExperienceLog.filter(log => 
      !timeRange || (log.timestamp >= timeRange.start && log.timestamp <= timeRange.end)
    );
    const userImpactScore = this.calculateUserImpactScore(uxErrors);

    return {
      totalErrors: errorLogs.length,
      errorsByCategory,
      errorsBySeverity,
      topErrors,
      errorRate,
      averageResolutionTime: 0, // Would be calculated based on resolution tracking
      userImpactScore,
      timeRange: timeRange || { start: new Date(0), end: new Date() }
    };
  }

  /**
   * Get performance analytics for monitoring dashboard
   * Requirements: 9.4
   */
  getPerformanceAnalytics(timeRange?: { start: Date; end: Date }): PerformanceAnalytics {
    const filteredLogs = this.filterLogsByTimeRange(this.performanceLog, timeRange);

    const totalOperations = filteredLogs.length;
    const averageDuration = totalOperations > 0 
      ? filteredLogs.reduce((sum, log) => sum + log.duration, 0) / totalOperations 
      : 0;
    const slowOperations = filteredLogs.filter(log => log.isSlowOperation).length;

    const operationsByType: Record<string, { count: number; avgDuration: number; slowCount: number }> = {};
    
    filteredLogs.forEach(log => {
      if (!operationsByType[log.operation]) {
        operationsByType[log.operation] = { count: 0, avgDuration: 0, slowCount: 0 };
      }
      
      const op = operationsByType[log.operation];
      op.count++;
      op.avgDuration = (op.avgDuration * (op.count - 1) + log.duration) / op.count;
      if (log.isSlowOperation) {
        op.slowCount++;
      }
    });

    const bottlenecks = Object.entries(operationsByType)
      .filter(([_, data]) => data.slowCount > 0)
      .map(([operation, data]) => ({
        operation,
        avgDuration: data.avgDuration,
        threshold: this.config.performanceThresholds[operation as keyof PerformanceThreshold] || 1000
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    const performanceScore = this.calculatePerformanceScore(filteredLogs);

    return {
      totalOperations,
      averageDuration,
      slowOperations,
      operationsByType,
      performanceScore,
      bottlenecks,
      timeRange: timeRange || { start: new Date(0), end: new Date() }
    };
  }

  /**
   * Get recent error logs for debugging
   */
  getRecentErrors(limit: number = 100): LogEntry[] {
    return this.errorLog
      .filter(log => log.level === 'error')
      .slice(-limit)
      .reverse();
  }

  /**
   * Get recent performance logs
   */
  getRecentPerformanceLogs(limit: number = 100): PerformanceLog[] {
    return this.performanceLog.slice(-limit).reverse();
  }

  /**
   * Get recent user experience errors
   */
  getRecentUXErrors(limit: number = 100): UserExperienceLog[] {
    return this.userExperienceLog.slice(-limit).reverse();
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.errorLog.length = 0;
    this.performanceLog.length = 0;
    this.userExperienceLog.length = 0;
    this.pendingLogs.length = 0;
  }

  /**
   * Export logs for external analysis
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const data = {
      errors: this.errorLog,
      performance: this.performanceLog,
      userExperience: this.userExperienceLog,
      exportedAt: new Date()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Simple CSV export for errors
      const csvHeaders = 'timestamp,level,category,severity,message,userId,sessionId\n';
      const csvRows = this.errorLog.map(log => 
        `${log.timestamp.toISOString()},${log.level},${log.category},${log.severity},"${log.message}",${log.userId || ''},${log.sessionId || ''}`
      ).join('\n');
      return csvHeaders + csvRows;
    }
  }

  /**
   * Cleanup and stop background processes
   */
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    
    // Flush any pending logs
    if (this.pendingLogs.length > 0) {
      this.flushPendingLogs();
    }
  }

  // Private helper methods

  private addLogEntry(entry: LogEntry): void {
    this.errorLog.push(entry);
    
    if (this.config.enableRemoteLogging) {
      this.pendingLogs.push(entry);
    }

    // Maintain log size
    if (this.errorLog.length > this.config.maxLogEntries) {
      this.errorLog.splice(0, this.errorLog.length - this.config.maxLogEntries);
    }
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsoleLogging) return;

    const message = `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()} [${entry.category}] ${entry.message}`;
    
    switch (entry.level) {
      case 'error':
        console.error(message, entry.context);
        break;
      case 'warn':
        console.warn(message, entry.context);
        break;
      case 'info':
        console.info(message, entry.context);
        break;
      case 'debug':
        console.debug(message, entry.context);
        break;
    }
  }

  private determineSeverity(error: Error, context: any): ErrorSeverity {
    // Determine severity based on error type and context
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }
    
    if (context.duration && context.duration > 5000) {
      return 'medium';
    }
    
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return 'medium';
    }
    
    return 'low';
  }

  private calculateUserImpactScore(uxErrors: UserExperienceLog[]): number {
    if (uxErrors.length === 0) return 0;

    const impactWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalImpact = uxErrors.reduce((sum, error) => sum + impactWeights[error.userImpact], 0);
    const maxPossibleImpact = uxErrors.length * 4; // All critical
    
    return (totalImpact / maxPossibleImpact) * 100;
  }

  private calculatePerformanceScore(logs: PerformanceLog[]): number {
    if (logs.length === 0) return 100;

    const slowOperationPenalty = logs.filter(log => log.isSlowOperation).length / logs.length;
    const failureRate = logs.filter(log => !log.success).length / logs.length;
    
    return Math.max(0, 100 - (slowOperationPenalty * 50) - (failureRate * 50));
  }

  private filterLogsByTimeRange<T extends { timestamp: Date }>(
    logs: T[], 
    timeRange?: { start: Date; end: Date }
  ): T[] {
    if (!timeRange) return logs;
    
    return logs.filter(log => 
      log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
    );
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.pendingLogs.length >= this.config.batchSize) {
        this.flushPendingLogs();
      }
    }, this.config.flushIntervalMs);
  }

  private async flushPendingLogs(): Promise<void> {
    if (this.pendingLogs.length === 0 || !this.config.remoteEndpoint) return;

    const logsToFlush = this.pendingLogs.splice(0, this.config.batchSize);
    
    try {
      // In a real implementation, this would send to your logging service
      // For now, we'll just simulate the remote logging
      console.debug(`Flushing ${logsToFlush.length} logs to remote endpoint`);
      
      // Simulate API call
      // await fetch(this.config.remoteEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ logs: logsToFlush })
      // });
    } catch (error) {
      console.error('Failed to flush logs to remote endpoint:', error);
      // Re-add logs to pending queue for retry
      this.pendingLogs.unshift(...logsToFlush);
    }
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  private getCurrentUrl(): string {
    return typeof window !== 'undefined' ? window.location.href : 'Unknown';
  }
}

// Export singleton instance
export const errorLoggingService = new ErrorLoggingService({
  enableConsoleLogging: true,
  enablePerformanceMonitoring: true,
  enableUserExperienceTracking: true,
  maxLogEntries: 5000
});