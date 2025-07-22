/**
 * MarketplaceApiService Tests
 * Basic tests to verify the core API infrastructure works correctly
 */

import { MarketplaceApiService } from '../MarketplaceApiService';
import { CacheManager } from '../CacheManager';
import { ErrorRecoveryService } from '../ErrorRecoveryService';
import { RequestDeduplicator } from '../RequestDeduplicator';

// Mock fetch for testing
global.fetch = jest.fn();

describe('MarketplaceApiService', () => {
  let apiService: MarketplaceApiService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
    
    apiService = new MarketplaceApiService({
      baseUrl: 'http://localhost:5000/api',
      cacheEnabled: false, // Disable cache for testing
      debugMode: true
    });
  });

  describe('getScreens', () => {
    it('should fetch screens successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          screens: [
            {
              id: '1',
              name: 'Test Screen',
              location: 'Test Location',
              price: 100,
              availability: true,
              image: 'test.jpg',
              category: { id: '1', name: 'Test Category' },
              environment: 'outdoor',
              specs: { width: 1920, height: 1080, resolution: '1920x1080', brightness: '5000 nits' },
              views: { daily: 1000, monthly: 30000 },
              rating: 4.5,
              reviews: 10,
              coordinates: { lat: 4.6097, lng: -74.0817 },
              pricing: { allowMoments: true, deviceId: '1', bundles: {} },
              metrics: { dailyTraffic: 1000, monthlyTraffic: 30000, averageEngagement: 85 }
            }
          ],
          totalCount: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await apiService.getScreens({ page: 1, pageSize: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/marketplace/screens?page=1&pageSize=20',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Test Screen');
      expect(result.pagination.totalItems).toBe(1);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getScreens()).rejects.toThrow();
    });
  });

  describe('getScreen', () => {
    it('should fetch single screen successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          name: 'Test Screen',
          location: 'Test Location',
          price: 100,
          availability: true,
          image: 'test.jpg',
          category: { id: '1', name: 'Test Category' },
          environment: 'outdoor',
          specs: { width: 1920, height: 1080, resolution: '1920x1080', brightness: '5000 nits' },
          views: { daily: 1000, monthly: 30000 },
          rating: 4.5,
          reviews: 10,
          coordinates: { lat: 4.6097, lng: -74.0817 },
          pricing: { allowMoments: true, deviceId: '1', bundles: {} },
          metrics: { dailyTraffic: 1000, monthlyTraffic: 30000, averageEngagement: 85 }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await apiService.getScreen('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/marketplace/screens/1',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );

      expect(result.id).toBe('1');
      expect(result.name).toBe('Test Screen');
    });
  });

  describe('searchScreens', () => {
    it('should search screens successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          query: 'test',
          results: [],
          suggestions: ['test screen', 'test location'],
          totalCount: 0
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await apiService.searchScreens('test', 10);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/marketplace/search?query=test&limit=10',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );

      expect(result.query).toBe('test');
      expect(result.suggestions).toContain('test screen');
    });
  });
});

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager({
      defaultTTL: 1000, // 1 second for testing
      maxMemorySize: 5
    });
  });

  afterEach(() => {
    cacheManager.destroy();
  });

  it('should store and retrieve data from memory cache', async () => {
    const testData = { id: '1', name: 'Test' };
    
    await cacheManager.set('test-key', testData, 5000);
    const retrieved = await cacheManager.get('test-key');
    
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired data', async () => {
    const testData = { id: '1', name: 'Test' };
    
    await cacheManager.set('test-key', testData, 1); // 1ms TTL
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const retrieved = await cacheManager.get('test-key');
    expect(retrieved).toBeNull();
  });

  it('should provide cache statistics', async () => {
    await cacheManager.set('key1', 'value1');
    await cacheManager.set('key2', 'value2');
    
    const stats = cacheManager.getStats();
    expect(stats.memorySize).toBe(2);
    expect(stats.totalEntries).toBeGreaterThan(0);
  });
});

describe('ErrorRecoveryService', () => {
  let errorService: ErrorRecoveryService;

  beforeEach(() => {
    errorService = new ErrorRecoveryService({
      maxRetries: 2,
      baseDelay: 10 // Fast for testing
    });
  });

  it('should classify network errors correctly', () => {
    const networkError = new Error('Network request failed');
    networkError.name = 'NetworkError';
    
    const message = errorService.getUserFriendlyMessage(networkError);
    expect(message).toContain('internet connection');
  });

  it('should classify server errors correctly', () => {
    const serverError = new Error('HTTP 500: Internal Server Error');
    
    const message = errorService.getUserFriendlyMessage(serverError);
    expect(message).toContain('servers are experiencing issues');
  });

  it('should retry operations with backoff', async () => {
    let attempts = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    const result = await errorService.retryWithBackoff(operation, 3);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });
});

describe('RequestDeduplicator', () => {
  let deduplicator: RequestDeduplicator;

  beforeEach(() => {
    deduplicator = new RequestDeduplicator({
      requestTimeout: 1000
    });
  });

  afterEach(() => {
    deduplicator.destroy();
  });

  it('should deduplicate identical requests', async () => {
    let callCount = 0;
    const mockRequest = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    });

    // Make multiple identical requests
    const promises = [
      deduplicator.deduplicate('test-key', mockRequest),
      deduplicator.deduplicate('test-key', mockRequest),
      deduplicator.deduplicate('test-key', mockRequest)
    ];

    const results = await Promise.all(promises);

    // Should only call the function once
    expect(mockRequest).toHaveBeenCalledTimes(1);
    
    // All results should be the same
    expect(results).toEqual(['result-1', 'result-1', 'result-1']);
  });

  it('should provide deduplication statistics', async () => {
    const mockRequest = () => Promise.resolve('test');
    
    await deduplicator.deduplicate('key1', mockRequest);
    await deduplicator.deduplicate('key1', mockRequest); // This should be deduplicated
    
    const stats = deduplicator.getStats();
    expect(stats.totalRequests).toBe(2);
    expect(stats.deduplicatedRequests).toBe(1);
    expect(stats.deduplicationRate).toBe(50);
  });
});