/**
 * Request Deduplicator
 * Prevents duplicate API requests and optimizes network usage
 */

export interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
  requestCount: number;
}

export interface BatchRequest<T> {
  key: string;
  request: () => Promise<T>;
  priority?: number;
}

export interface DeduplicationStats {
  totalRequests: number;
  deduplicatedRequests: number;
  activePendingRequests: number;
  batchedRequests: number;
  averageResponseTime: number;
  deduplicationRate: number;
}

/**
 * Request Deduplicator Class
 */
export class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private batchQueue = new Map<string, BatchRequest<any>[]>();
  private stats = {
    totalRequests: 0,
    deduplicatedRequests: 0,
    batchedRequests: 0,
    responseTimes: [] as number[],
  };
  private cleanupTimer: NodeJS.Timeout | null = null;
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly BATCH_DELAY = 100; // 100ms
  private readonly MAX_PENDING_AGE = 300000; // 5 minutes

  private constructor() {
    this.startCleanupTimer();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator();
    }
    return RequestDeduplicator.instance;
  }

  /**
   * Deduplicate identical requests
   */
  public async deduplicate<T>(
    key: string,
    request: () => Promise<T>
  ): Promise<T> {
    this.stats.totalRequests++;

    // Check if there's already a pending request for this key
    const existing = this.pendingRequests.get(key);
    if (existing) {
      this.stats.deduplicatedRequests++;
      existing.requestCount++;
      
      // Return the existing promise
      return existing.promise;
    }

    // Create new request
    const startTime = Date.now();
    const promise = request().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
      
      // Track response time
      const responseTime = Date.now() - startTime;
      this.stats.responseTimes.push(responseTime);
      
      // Keep only last 100 response times
      if (this.stats.responseTimes.length > 100) {
        this.stats.responseTimes = this.stats.responseTimes.slice(-100);
      }
    });

    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
      requestCount: 1,
    });

    return promise;
  }

  /**
   * Batch multiple requests together
   */
  public async batch<T>(requests: BatchRequest<T>[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      // Add requests to batch queue
      requests.forEach(req => {
        const existing = this.batchQueue.get(req.key) || [];
        existing.push(req);
        this.batchQueue.set(req.key, existing);
      });

      // Clear existing batch timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }

      // Set new batch timer
      this.batchTimer = setTimeout(async () => {
        try {
          const results = await this.processBatchQueue();
          resolve(results.slice(0, requests.length));
        } catch (error) {
          reject(error);
        }
      }, this.BATCH_DELAY);
    });
  }

  /**
   * Process batch queue
   */
  private async processBatchQueue<T>(): Promise<T[]> {
    const allRequests: BatchRequest<T>[] = [];
    
    // Collect all batched requests
    for (const requests of this.batchQueue.values()) {
      allRequests.push(...requests);
    }

    // Clear the queue
    this.batchQueue.clear();

    if (allRequests.length === 0) {
      return [];
    }

    // Sort by priority (higher priority first)
    allRequests.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Execute requests with deduplication
    const promises = allRequests.map(req => 
      this.deduplicate(req.key, req.request)
    );

    this.stats.batchedRequests += allRequests.length;

    return Promise.all(promises);
  }

  /**
   * Cancel pending request
   */
  public cancel(key: string): boolean {
    const pending = this.pendingRequests.get(key);
    if (pending) {
      this.pendingRequests.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Cancel all pending requests
   */
  public cancelAll(): void {
    this.pendingRequests.clear();
    this.batchQueue.clear();
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Get pending request keys
   */
  public getPendingKeys(): string[] {
    return Array.from(this.pendingRequests.keys());
  }

  /**
   * Check if request is pending
   */
  public isPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * Get request statistics
   */
  public getStats(): DeduplicationStats {
    const averageResponseTime = this.stats.responseTimes.length > 0
      ? this.stats.responseTimes.reduce((sum, time) => sum + time, 0) / this.stats.responseTimes.length
      : 0;

    const deduplicationRate = this.stats.totalRequests > 0
      ? (this.stats.deduplicatedRequests / this.stats.totalRequests) * 100
      : 0;

    return {
      totalRequests: this.stats.totalRequests,
      deduplicatedRequests: this.stats.deduplicatedRequests,
      activePendingRequests: this.pendingRequests.size,
      batchedRequests: this.stats.batchedRequests,
      averageResponseTime,
      deduplicationRate,
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      batchedRequests: 0,
      responseTimes: [],
    };
  }

  /**
   * Clear all pending requests and reset
   */
  public clear(): void {
    this.cancelAll();
    this.resetStats();
  }

  /**
   * Start cleanup timer for old pending requests
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldRequests();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Clean up old pending requests
   */
  private cleanupOldRequests(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.MAX_PENDING_AGE) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      this.pendingRequests.delete(key);
    });

    if (keysToRemove.length > 0) {
      console.warn(`Cleaned up ${keysToRemove.length} old pending requests`);
    }
  }

  /**
   * Get detailed information about pending requests
   */
  public getPendingRequestsInfo(): Array<{
    key: string;
    timestamp: number;
    age: number;
    requestCount: number;
  }> {
    const now = Date.now();
    return Array.from(this.pendingRequests.entries()).map(([key, request]) => ({
      key,
      timestamp: request.timestamp,
      age: now - request.timestamp,
      requestCount: request.requestCount,
    }));
  }

  /**
   * Set configuration options
   */
  public configure(options: {
    cleanupInterval?: number;
    batchDelay?: number;
    maxPendingAge?: number;
  }): void {
    if (options.cleanupInterval !== undefined) {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
      }
      this.startCleanupTimer();
    }

    if (options.batchDelay !== undefined) {
      // Update batch delay for future batches
      Object.defineProperty(this, 'BATCH_DELAY', {
        value: options.batchDelay,
        writable: false,
      });
    }

    if (options.maxPendingAge !== undefined) {
      Object.defineProperty(this, 'MAX_PENDING_AGE', {
        value: options.maxPendingAge,
        writable: false,
      });
    }
  }

  /**
   * Destroy deduplicator and cleanup resources
   */
  public destroy(): void {
    this.cancelAll();
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Create a scoped deduplicator for specific operations
   */
  public createScope(prefix: string): {
    deduplicate: <T>(key: string, request: () => Promise<T>) => Promise<T>;
    clear: () => void;
  } {
    return {
      deduplicate: <T>(key: string, request: () => Promise<T>) => {
        return this.deduplicate(`${prefix}_${key}`, request);
      },
      clear: () => {
        const keysToRemove = Array.from(this.pendingRequests.keys())
          .filter(key => key.startsWith(`${prefix}_`));
        keysToRemove.forEach(key => this.pendingRequests.delete(key));
      },
    };
  }
}

export default RequestDeduplicator;