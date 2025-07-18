/**
 * Cache Manager
 * Intelligent caching system with multiple storage strategies and automatic invalidation
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  memoryEntries: number;
  sessionEntries: number;
  localEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
}

export interface CacheConfig {
  maxMemoryEntries: number;
  maxSessionEntries: number;
  maxLocalEntries: number;
  defaultTTL: number;
  cleanupInterval: number;
}

/**
 * Multi-level cache manager with memory, session, and local storage
 */
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private stats = {
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxMemoryEntries: 100,
      maxSessionEntries: 50,
      maxLocalEntries: 200,
      defaultTTL: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  /**
   * Get item from cache (checks memory -> session -> local storage)
   */
  public async get<T>(key: string, includeExpired = false): Promise<T | null> {
    this.stats.totalRequests++;

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (includeExpired || this.isEntryValid(memoryEntry)) {
        memoryEntry.accessCount++;
        memoryEntry.lastAccessed = Date.now();
        this.stats.totalHits++;
        return memoryEntry.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check session storage
    try {
      const sessionData = sessionStorage.getItem(`cache_${key}`);
      if (sessionData) {
        const entry: CacheEntry<T> = JSON.parse(sessionData);
        if (includeExpired || this.isEntryValid(entry)) {
          // Promote to memory cache
          this.setMemoryCache(key, entry.data, entry.ttl);
          this.stats.totalHits++;
          return entry.data;
        } else {
          sessionStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Session storage error:', error);
    }

    // Check local storage
    try {
      const localData = localStorage.getItem(`cache_${key}`);
      if (localData) {
        const entry: CacheEntry<T> = JSON.parse(localData);
        if (includeExpired || this.isEntryValid(entry)) {
          // Promote to memory cache
          this.setMemoryCache(key, entry.data, entry.ttl);
          this.stats.totalHits++;
          return entry.data;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Local storage error:', error);
    }

    this.stats.totalMisses++;
    return null;
  }

  /**
   * Set item in cache with TTL
   */
  public async set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    storage: 'memory' | 'session' | 'local' = 'memory'
  ): Promise<void> {
    const actualTTL = ttl || this.config.defaultTTL;

    switch (storage) {
      case 'memory':
        this.setMemoryCache(key, value, actualTTL);
        break;
      case 'session':
        this.setSessionCache(key, value, actualTTL);
        break;
      case 'local':
        this.setLocalCache(key, value, actualTTL);
        break;
    }
  }

  /**
   * Set item in memory cache
   */
  private setMemoryCache<T>(key: string, value: T, ttl: number): void {
    // Clean up if at capacity
    if (this.memoryCache.size >= this.config.maxMemoryEntries) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.memoryCache.set(key, entry);
  }

  /**
   * Set item in session storage
   */
  private setSessionCache<T>(key: string, value: T, ttl: number): void {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      
      // Also set in memory for faster access
      this.setMemoryCache(key, value, ttl);
    } catch (error) {
      console.warn('Failed to set session cache:', error);
      // Fallback to memory cache
      this.setMemoryCache(key, value, ttl);
    }
  }

  /**
   * Set item in local storage
   */
  private setLocalCache<T>(key: string, value: T, ttl: number): void {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      
      // Also set in memory for faster access
      this.setMemoryCache(key, value, ttl);
    } catch (error) {
      console.warn('Failed to set local cache:', error);
      // Fallback to memory cache
      this.setMemoryCache(key, value, ttl);
    }
  }

  /**
   * Invalidate specific cache entry
   */
  public async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    try {
      sessionStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from session storage:', error);
    }
    
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from local storage:', error);
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  public async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);

    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear session storage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_') && regex.test(key.substring(6))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear session storage pattern:', error);
    }

    // Clear local storage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_') && regex.test(key.substring(6))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear local storage pattern:', error);
    }
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
    
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear local storage:', error);
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const memoryEntries = this.memoryCache.size;
    let sessionEntries = 0;
    let localEntries = 0;
    let totalSize = 0;

    // Count session storage entries
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          sessionEntries++;
          totalSize += sessionStorage.getItem(key)?.length || 0;
        }
      }
    } catch (error) {
      console.warn('Failed to get session storage stats:', error);
    }

    // Count local storage entries
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          localEntries++;
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      }
    } catch (error) {
      console.warn('Failed to get local storage stats:', error);
    }

    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.totalHits / this.stats.totalRequests) * 100 
      : 0;
    const missRate = 100 - hitRate;

    return {
      memoryEntries,
      sessionEntries,
      localEntries,
      totalSize,
      hitRate,
      missRate,
      totalRequests: this.stats.totalRequests,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
    };
  }

  /**
   * Check if cache entry is still valid
   */
  private isEntryValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Evict least recently used entries from memory cache
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Start cleanup timer for expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries from all storage levels
   */
  private cleanupExpiredEntries(): void {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isEntryValid(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean session storage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          const data = sessionStorage.getItem(key);
          if (data) {
            try {
              const entry = JSON.parse(data);
              if (!this.isEntryValid(entry)) {
                keysToRemove.push(key);
              }
            } catch {
              keysToRemove.push(key); // Remove invalid entries
            }
          }
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to cleanup session storage:', error);
    }

    // Clean local storage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const entry = JSON.parse(data);
              if (!this.isEntryValid(entry)) {
                keysToRemove.push(key);
              }
            } catch {
              keysToRemove.push(key); // Remove invalid entries
            }
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to cleanup local storage:', error);
    }
  }

  /**
   * Destroy cache manager and cleanup resources
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.memoryCache.clear();
  }
}

export default CacheManager;