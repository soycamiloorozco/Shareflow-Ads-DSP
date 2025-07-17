/**
 * Cache Service
 * Implements Redis/memory caching for user recommendations and market data
 * with cache invalidation logic and background refresh capabilities
 */

import {
  MarketplaceSection,
  EnhancedScreen,
  UserProfile,
  TrendingScreen,
  ScreenPerformanceMetrics,
  UserInteraction,
  MarketInsights
} from '../types/intelligent-grouping.types';

export interface CacheConfig {
  readonly enableRedis: boolean;
  readonly redisUrl?: string;
  readonly defaultTTL: number;
  readonly maxMemoryItems: number;
  readonly enableBackgroundRefresh: boolean;
  readonly refreshInterval: number;
  readonly enableMetrics: boolean;
}

export interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
  readonly accessCount: number;
  readonly lastAccessed: number;
  readonly tags: string[];
}

export interface CacheMetrics {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly totalRequests: number;
  readonly memoryUsage: number;
  readonly itemCount: number;
  readonly evictions: number;
}

export interface CacheInvalidationRule {
  readonly pattern: string;
  readonly triggers: string[];
  readonly cascade: boolean;
}

export type CacheKey = string;
export type CacheTag = string;

/**
 * Comprehensive caching service for marketplace intelligent grouping
 * Requirements: 1.1, 3.1, 5.1
 */
export class CacheService {
  private readonly config: CacheConfig;
  private readonly memoryCache = new Map<CacheKey, CacheEntry<any>>();
  private readonly tagIndex = new Map<CacheTag, Set<CacheKey>>();
  private readonly refreshQueue = new Set<CacheKey>();
  private readonly metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    memoryUsage: 0,
    itemCount: 0,
    evictions: 0
  };
  private readonly invalidationRules: CacheInvalidationRule[] = [];
  private refreshTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      enableRedis: false, // Start with memory cache only
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      maxMemoryItems: 10000,
      enableBackgroundRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      enableMetrics: true,
      ...config
    };

    this.setupInvalidationRules();
    this.startBackgroundProcesses();
  }

  /**
   * Cache user recommendations with personalized TTL
   * Requirements: 1.1
   */
  async cacheUserRecommendations(
    userId: string,
    sections: MarketplaceSection[],
    ttl?: number
  ): Promise<void> {
    const key = this.getUserRecommendationsKey(userId);
    const tags = ['user-recommendations', `user:${userId}`, 'sections'];
    
    await this.set(key, sections, ttl || this.config.defaultTTL, tags);
    
    // Cache individual sections for partial updates
    for (const section of sections) {
      const sectionKey = this.getSectionKey(userId, section.id);
      await this.set(sectionKey, section, ttl || this.config.defaultTTL, [
        'sections',
        `user:${userId}`,
        `section:${section.id}`
      ]);
    }
  }

  /**
   * Get cached user recommendations
   * Requirements: 1.1
   */
  async getUserRecommendations(userId: string): Promise<MarketplaceSection[] | null> {
    const key = this.getUserRecommendationsKey(userId);
    return await this.get<MarketplaceSection[]>(key);
  }

  /**
   * Cache market data with location-specific keys
   * Requirements: 3.1
   */
  async cacheMarketData(
    location: string | undefined,
    timeframe: number,
    data: TrendingScreen[],
    ttl?: number
  ): Promise<void> {
    const key = this.getMarketDataKey(location, timeframe);
    const tags = ['market-data', 'trending'];
    
    if (location) {
      tags.push(`location:${location.toLowerCase()}`);
    }
    
    await this.set(key, data, ttl || 15 * 60 * 1000, tags); // 15 minutes for market data
  }

  /**
   * Get cached market data
   * Requirements: 3.1
   */
  async getMarketData(location: string | undefined, timeframe: number): Promise<TrendingScreen[] | null> {
    const key = this.getMarketDataKey(location, timeframe);
    return await this.get<TrendingScreen[]>(key);
  }

  /**
   * Cache screen performance metrics
   * Requirements: 5.1
   */
  async cacheScreenMetrics(screenId: string, metrics: ScreenPerformanceMetrics): Promise<void> {
    const key = this.getScreenMetricsKey(screenId);
    const tags = ['screen-metrics', `screen:${screenId}`];
    
    await this.set(key, metrics, 60 * 60 * 1000, tags); // 1 hour for metrics
  }

  /**
   * Get cached screen performance metrics
   * Requirements: 5.1
   */
  async getScreenMetrics(screenId: string): Promise<ScreenPerformanceMetrics | null> {
    const key = this.getScreenMetricsKey(screenId);
    return await this.get<ScreenPerformanceMetrics>(key);
  }

  /**
   * Cache user profile data
   */
  async cacheUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const key = this.getUserProfileKey(userId);
    const tags = ['user-profiles', `user:${userId}`];
    
    await this.set(key, profile, 60 * 60 * 1000, tags); // 1 hour for user profiles
  }

  /**
   * Get cached user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const key = this.getUserProfileKey(userId);
    return await this.get<UserProfile>(key);
  }

  /**
   * Cache market insights
   */
  async cacheMarketInsights(location: string | undefined, insights: MarketInsights): Promise<void> {
    const key = this.getMarketInsightsKey(location);
    const tags = ['market-insights'];
    
    if (location) {
      tags.push(`location:${location.toLowerCase()}`);
    }
    
    await this.set(key, insights, 2 * 60 * 60 * 1000, tags); // 2 hours for insights
  }

  /**
   * Get cached market insights
   */
  async getMarketInsights(location: string | undefined): Promise<MarketInsights | null> {
    const key = this.getMarketInsightsKey(location);
    return await this.get<MarketInsights>(key);
  }

  /**
   * Invalidate cache based on user interactions
   * Requirements: 1.1, 3.1
   */
  async invalidateOnUserInteraction(interaction: UserInteraction): Promise<void> {
    const tagsToInvalidate: string[] = [];
    
    // Always invalidate user-specific caches
    tagsToInvalidate.push(`user:${interaction.userId}`);
    
    // Invalidate screen-specific caches for certain actions
    if (['purchase', 'favorite', 'share'].includes(interaction.action)) {
      tagsToInvalidate.push(`screen:${interaction.screenId}`);
    }
    
    // Invalidate market data for purchases (affects trending)
    if (interaction.action === 'purchase') {
      tagsToInvalidate.push('market-data', 'trending');
      
      // Invalidate location-specific market data
      if (interaction.context?.location) {
        tagsToInvalidate.push(`location:${interaction.context.location.toLowerCase()}`);
      }
    }
    
    await this.invalidateByTags(tagsToInvalidate);
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToInvalidate = new Set<CacheKey>();
    
    for (const tag of tags) {
      const taggedKeys = this.tagIndex.get(tag);
      if (taggedKeys) {
        taggedKeys.forEach(key => keysToInvalidate.add(key));
      }
    }
    
    for (const key of keysToInvalidate) {
      await this.delete(key);
    }
    
    console.debug('Cache invalidated by tags:', {
      tags,
      keysInvalidated: keysToInvalidate.size
    });
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToInvalidate: CacheKey[] = [];
    
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        keysToInvalidate.push(key);
      }
    }
    
    for (const key of keysToInvalidate) {
      await this.delete(key);
    }
    
    console.debug('Cache invalidated by pattern:', {
      pattern,
      keysInvalidated: keysToInvalidate.length
    });
  }

  /**
   * Clear all user-specific cache
   */
  async clearUserCache(userId: string): Promise<void> {
    await this.invalidateByTags([`user:${userId}`]);
  }

  /**
   * Clear all market data cache
   */
  async clearMarketDataCache(): Promise<void> {
    await this.invalidateByTags(['market-data', 'trending', 'market-insights']);
  }

  /**
   * Schedule background refresh for a cache key
   */
  scheduleRefresh(key: CacheKey, refreshFunction: () => Promise<any>): void {
    if (!this.config.enableBackgroundRefresh) return;
    
    this.refreshQueue.add(key);
    
    // Store refresh function for later execution
    (this as any)[`refresh_${key}`] = refreshFunction;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return {
      ...this.metrics,
      hitRate: this.metrics.totalRequests > 0 
        ? this.metrics.hits / this.metrics.totalRequests 
        : 0,
      memoryUsage: this.calculateMemoryUsage(),
      itemCount: this.memoryCache.size
    };
  }

  /**
   * Cleanup expired entries and optimize memory usage
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    const keysToDelete: CacheKey[] = [];
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      await this.delete(key);
      this.metrics.evictions++;
    }
    
    // LRU eviction if over memory limit
    if (this.memoryCache.size > this.config.maxMemoryItems) {
      await this.evictLRU();
    }
    
    console.debug('Cache cleanup completed:', {
      expiredKeys: keysToDelete.length,
      totalItems: this.memoryCache.size,
      memoryUsage: this.calculateMemoryUsage()
    });
  }

  /**
   * Shutdown cache service
   */
  shutdown(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.memoryCache.clear();
    this.tagIndex.clear();
    this.refreshQueue.clear();
  }

  // Private methods

  private async get<T>(key: CacheKey): Promise<T | null> {
    this.metrics.totalRequests++;
    
    const entry = this.memoryCache.get(key);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      await this.delete(key);
      this.metrics.misses++;
      return null;
    }
    
    // Update access statistics
    const updatedEntry = {
      ...entry,
      accessCount: entry.accessCount + 1,
      lastAccessed: Date.now()
    };
    this.memoryCache.set(key, updatedEntry);
    
    this.metrics.hits++;
    return entry.data as T;
  }

  private async set<T>(
    key: CacheKey,
    data: T,
    ttl: number,
    tags: string[] = []
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags
    };
    
    this.memoryCache.set(key, entry);
    
    // Update tag index
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
    
    // Check memory limits
    if (this.memoryCache.size > this.config.maxMemoryItems) {
      await this.evictLRU();
    }
  }

  private async delete(key: CacheKey): Promise<void> {
    const entry = this.memoryCache.get(key);
    if (!entry) return;
    
    // Remove from memory cache
    this.memoryCache.delete(key);
    
    // Remove from tag index
    for (const tag of entry.tags) {
      const taggedKeys = this.tagIndex.get(tag);
      if (taggedKeys) {
        taggedKeys.delete(key);
        if (taggedKeys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }

  private async evictLRU(): Promise<void> {
    // Find least recently used entries
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Evict 10% of entries
    const evictCount = Math.floor(this.config.maxMemoryItems * 0.1);
    const toEvict = entries.slice(0, evictCount);
    
    for (const [key] of toEvict) {
      await this.delete(key);
      this.metrics.evictions++;
    }
  }

  private calculateMemoryUsage(): number {
    // Rough estimation of memory usage
    let totalSize = 0;
    
    for (const entry of this.memoryCache.values()) {
      totalSize += JSON.stringify(entry.data).length;
    }
    
    return totalSize;
  }

  private setupInvalidationRules(): void {
    this.invalidationRules.push(
      {
        pattern: 'user_recommendations:.*',
        triggers: ['user_interaction', 'user_profile_update'],
        cascade: true
      },
      {
        pattern: 'market_data:.*',
        triggers: ['screen_booking', 'screen_update'],
        cascade: false
      },
      {
        pattern: 'screen_metrics:.*',
        triggers: ['screen_booking', 'screen_rating'],
        cascade: false
      }
    );
  }

  private startBackgroundProcesses(): void {
    if (this.config.enableBackgroundRefresh) {
      this.refreshTimer = setInterval(() => {
        this.processRefreshQueue();
      }, this.config.refreshInterval);
    }
    
    // Cleanup timer - run every 10 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  private async processRefreshQueue(): Promise<void> {
    if (this.refreshQueue.size === 0) return;
    
    const keysToRefresh = Array.from(this.refreshQueue);
    this.refreshQueue.clear();
    
    for (const key of keysToRefresh) {
      try {
        const refreshFunction = (this as any)[`refresh_${key}`];
        if (refreshFunction) {
          const newData = await refreshFunction();
          // Update cache with new data (preserve existing TTL and tags)
          const existingEntry = this.memoryCache.get(key);
          if (existingEntry) {
            await this.set(key, newData, existingEntry.ttl, existingEntry.tags);
          }
        }
      } catch (error) {
        console.error(`Background refresh failed for key ${key}:`, error);
      }
    }
    
    console.debug('Background refresh completed:', {
      keysProcessed: keysToRefresh.length
    });
  }

  // Cache key generators

  private getUserRecommendationsKey(userId: string): CacheKey {
    return `user_recommendations:${userId}`;
  }

  private getSectionKey(userId: string, sectionId: string): CacheKey {
    return `section:${userId}:${sectionId}`;
  }

  private getMarketDataKey(location: string | undefined, timeframe: number): CacheKey {
    return `market_data:${location || 'all'}:${timeframe}d`;
  }

  private getScreenMetricsKey(screenId: string): CacheKey {
    return `screen_metrics:${screenId}`;
  }

  private getUserProfileKey(userId: string): CacheKey {
    return `user_profile:${userId}`;
  }

  private getMarketInsightsKey(location: string | undefined): CacheKey {
    return `market_insights:${location || 'all'}`;
  }
}

// Export singleton instance
export const cacheService = new CacheService({
  enableBackgroundRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  maxMemoryItems: 5000,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  enableMetrics: true
});