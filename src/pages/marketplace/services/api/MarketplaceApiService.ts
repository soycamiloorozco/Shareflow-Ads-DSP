/**
 * Marketplace API Service
 * Comprehensive service for all marketplace-related API calls with caching, error handling, and optimization
 */

import { 
  Screen, 
  FilterState, 
  PaginatedResponse, 
  ApiResponse,
  ApiError 
} from '../../types/marketplace.types';
import { MarketplaceSection } from '../../types/intelligent-grouping.types';
import { CacheManager } from './CacheManager';
import { ErrorRecoveryService } from './ErrorRecoveryService';
import { RequestDeduplicator } from './RequestDeduplicator';

// API Configuration  
const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Request interfaces
export interface ScreenFilters {
  search?: string;
  cities?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  environment?: 'indoor' | 'outdoor';
  rating?: number;
  allowsMoments?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'price' | 'rating' | 'distance' | 'popularity';
  sortDirection?: 'asc' | 'desc';
}

export interface SectionRequest {
  userId?: string;
  location?: string;
  maxSections?: number;
  includeAnalytics?: boolean;
  preferences?: Record<string, any>;
}

export interface SearchResult {
  screens: Screen[];
  suggestions: string[];
  totalResults: number;
  searchTime: number;
}

export interface TrendingScreen extends Screen {
  trendScore: number;
  trendReason: string;
}

export interface FilterOptions {
  cities: Array<{ id: string; name: string; count: number }>;
  categories: Array<{ id: string; name: string; count: number; icon?: string }>;
  priceRanges: Array<{ id: string; label: string; min: number; max: number; count: number }>;
  environments: Array<{ id: string; name: string; count: number }>;
  features: Array<{ id: string; name: string; count: number }>;
}

export interface MarketInsights {
  totalScreens: number;
  averagePrice: number;
  popularCategories: Array<{ category: string; percentage: number }>;
  priceDistribution: Array<{ range: string; count: number }>;
  locationStats: Array<{ city: string; screenCount: number; averagePrice: number }>;
  trends: Array<{ metric: string; change: number; period: string }>;
}

// API Response types from backend
interface ApiScreenResponse {
  id: string;
  name: string;
  location: string;
  price: number;
  availability: boolean;
  image: string;
  category: { id: string; name: string };
  environment: 'indoor' | 'outdoor';
  specs: {
    width: number;
    height: number;
    resolution: string;
    brightness: string;
  };
  views: { daily: number; monthly: number };
  rating: number;
  reviews: number;
  coordinates?: { lat: number; lng: number };
  pricing: {
    allowMoments: boolean;
    deviceId: string;
    bundles: Record<string, { enabled: boolean; price: number; spots: number }>;
  };
  metrics?: {
    dailyTraffic: number;
    monthlyTraffic: number;
    averageEngagement: number;
  };
  locationDetails?: {
    address: string;
    city: string;
    region: string;
    country: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
    landmarks: string[];
  };
  partnerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Main Marketplace API Service Class
 */
export class MarketplaceApiService {
  private static instance: MarketplaceApiService;
  private baseUrl: string;
  private timeout: number;
  private authToken: string | null = null;
  private cacheManager: CacheManager;
  private errorRecoveryService: ErrorRecoveryService;
  private requestDeduplicator: RequestDeduplicator;

  private constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeout = DEFAULT_TIMEOUT;
    this.cacheManager = CacheManager.getInstance();
    this.errorRecoveryService = ErrorRecoveryService.getInstance();
    this.requestDeduplicator = RequestDeduplicator.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MarketplaceApiService {
    if (!MarketplaceApiService.instance) {
      MarketplaceApiService.instance = new MarketplaceApiService();
    }
    return MarketplaceApiService.instance;
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError: ApiError = {
          code: errorData.code || response.status.toString(),
          message: errorData.message || response.statusText,
          details: errorData.details,
          timestamp: new Date().toISOString(),
        };
        throw apiError;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Convert API screen response to internal Screen format
   */
  private convertApiScreenToScreen(apiScreen: ApiScreenResponse): Screen {
    return {
      id: apiScreen.id,
      name: apiScreen.name,
      location: apiScreen.location,
      price: apiScreen.price,
      availability: apiScreen.availability,
      image: apiScreen.image,
      category: apiScreen.category,
      environment: apiScreen.environment,
      specs: {
        width: apiScreen.specs.width,
        height: apiScreen.specs.height,
        resolution: apiScreen.specs.resolution,
        brightness: apiScreen.specs.brightness,
        aspectRatio: `${apiScreen.specs.width}:${apiScreen.specs.height}`,
        orientation: apiScreen.specs.width >= apiScreen.specs.height ? 'landscape' : 'portrait',
        pixelDensity: 72,
        colorDepth: 24,
        refreshRate: 60,
      },
      views: {
        daily: apiScreen.views.daily,
        monthly: apiScreen.views.monthly,
      },
      rating: apiScreen.rating,
      reviews: apiScreen.reviews,
      coordinates: apiScreen.coordinates,
      pricing: {
        allowMoments: apiScreen.pricing.allowMoments,
        deviceId: apiScreen.pricing.deviceId,
        bundles: apiScreen.pricing.bundles,
      },
      metrics: apiScreen.metrics || {
        dailyTraffic: apiScreen.views.daily,
        monthlyTraffic: apiScreen.views.monthly,
        averageEngagement: 85,
      },
      locationDetails: apiScreen.locationDetails || {
        address: apiScreen.location,
        city: apiScreen.location.split(',')[1]?.trim() || 'Unknown',
        region: apiScreen.location.split(',')[2]?.trim() || 'Unknown',
        country: 'Colombia',
        coordinates: apiScreen.coordinates || { lat: 4.7110, lng: -74.0721 },
        timezone: 'America/Bogota',
        landmarks: [apiScreen.name],
        neighborhood: undefined,
      },
      operatingHours: {
        start: '06:00',
        end: '22:00',
        daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    };
  }

  /**
   * Get screens with filtering and pagination
   */
  public async getScreens(filters: ScreenFilters = {}): Promise<PaginatedResponse<Screen>> {
    const cacheKey = `screens_${JSON.stringify(filters)}`;
    
    return this.requestDeduplicator.deduplicate(cacheKey, async () => {
      // Check cache first
      const cached = await this.cacheManager.get<PaginatedResponse<Screen>>(cacheKey);
      if (cached) {
        return cached;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.cities?.length) queryParams.append('cities', filters.cities.join(','));
      if (filters.categories?.length) queryParams.append('categories', filters.categories.join(','));
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.environment) queryParams.append('environment', filters.environment);
      if (filters.rating !== undefined) queryParams.append('rating', filters.rating.toString());
      if (filters.allowsMoments !== undefined) queryParams.append('allowsMoments', filters.allowsMoments.toString());
      if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
      if (filters.limit !== undefined) queryParams.append('limit', filters.limit.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

      const url = `${this.baseUrl}/Marketplace/screens?${queryParams.toString()}`;

      try {
        console.log('🔍 Making API request to:', url);
        console.log('🔑 Auth token present:', !!this.authToken);
        
        const response = await this.makeRequest<{
          success: boolean;
          message: string;
          data: {
            screens: ApiScreenResponse[];
            pagination: {
              currentPage: number;
              totalPages: number;
              pageSize: number;
              totalItems: number;
            };
          };
        }>(url);
        
        console.log('✅ API response received:', response);

        const result: PaginatedResponse<Screen> = {
          data: response.data.screens.map(this.convertApiScreenToScreen),
          meta: {
            total: response.data.pagination.totalItems,
            page: response.data.pagination.currentPage,
            limit: response.data.pagination.pageSize,
            hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages,
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          },
          pagination: response.data.pagination,
        };

        // Cache the result
        await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes TTL

        return result;
      } catch (error) {
        console.error('❌ API Error:', error);
        
        // Log the actual error details
        console.error('🚨 API Error Details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          url: `${this.baseUrl}/Marketplace/screens`,
          authToken: this.authToken ? 'Present' : 'Missing',
          filters
        });

        // In development, use mock data as fallback ONLY after logging the real error
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Using mock data fallback in development due to API error');
          console.log('💡 To fix this, check the API error details above');
          
          const { getMockScreensResponse } = await import('./MockDataFallback');
          const mockResponse = getMockScreensResponse();
          
          // Cache the mock response
          await this.cacheManager.set(cacheKey, mockResponse, 60000); // 1 minute TTL for mock data
          
          return mockResponse;
        }
        
        return this.errorRecoveryService.handleApiError(error as ApiError, {
          operation: 'getScreens',
          filters,
          fallbackData: async () => {
            // Try to get cached data even if expired
            return this.cacheManager.get<PaginatedResponse<Screen>>(cacheKey, true);
          },
        });
      }
    });
  }

  /**
   * Get a specific screen by ID
   */
  public async getScreen(id: string): Promise<Screen> {
    const cacheKey = `screen_${id}`;
    
    return this.requestDeduplicator.deduplicate(cacheKey, async () => {
      // Check cache first
      const cached = await this.cacheManager.get<Screen>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/Marketplace/screens/${id}`;

      try {
        const response = await this.makeRequest<{
          success: boolean;
          message: string;
          data: ApiScreenResponse;
        }>(url);
        const screen = this.convertApiScreenToScreen(response.data);

        // Cache the result
        await this.cacheManager.set(cacheKey, screen, 900000); // 15 minutes TTL

        return screen;
      } catch (error) {
        return this.errorRecoveryService.handleApiError(error as ApiError, {
          operation: 'getScreen',
          screenId: id,
          fallbackData: async () => {
            return this.cacheManager.get<Screen>(cacheKey, true);
          },
        });
      }
    });
  }

  /**
   * Get intelligent sections for personalized content
   */
  public async getIntelligentSections(request: SectionRequest): Promise<MarketplaceSection[]> {
    const cacheKey = `sections_${JSON.stringify(request)}`;
    
    return this.requestDeduplicator.deduplicate(cacheKey, async () => {
      // Check cache first
      const cached = await this.cacheManager.get<MarketplaceSection[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/Marketplace/sections`;

      try {
        const response = await this.makeRequest<{
          sections: Array<{
            id: string;
            title: string;
            description: string;
            screens: ApiScreenResponse[];
            metadata: Record<string, any>;
          }>;
        }>(url, {
          method: 'POST',
          body: JSON.stringify(request),
        });

        const sections: MarketplaceSection[] = response.sections.map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          screens: section.screens.map(this.convertApiScreenToScreen),
          metadata: section.metadata,
          priority: 1,
          algorithm: 'api',
          confidence: 0.9,
          analytics: {
            generatedAt: new Date(),
            processingTime: 0,
            screenCount: section.screens.length,
            algorithm: 'api',
            confidence: 0.9,
          },
        }));

        // Cache the result
        await this.cacheManager.set(cacheKey, sections, 600000); // 10 minutes TTL

        return sections;
      } catch (error) {
        return this.errorRecoveryService.handleApiError(error as ApiError, {
          operation: 'getIntelligentSections',
          request,
          fallbackData: async () => {
            return this.cacheManager.get<MarketplaceSection[]>(cacheKey, true) || [];
          },
        });
      }
    });
  }

  /**
   * Get trending screens
   */
  public async getTrendingScreens(location?: string, timeframe?: number): Promise<TrendingScreen[]> {
    const cacheKey = `trending_${location || 'all'}_${timeframe || 7}`;
    
    return this.requestDeduplicator.deduplicate(cacheKey, async () => {
      // Check cache first
      const cached = await this.cacheManager.get<TrendingScreen[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const queryParams = new URLSearchParams();
      if (location) queryParams.append('location', location);
      if (timeframe) queryParams.append('timeframe', timeframe.toString());

      const url = `${this.baseUrl}/Marketplace/trending?${queryParams.toString()}`;

      try {
        const response = await this.makeRequest<{
          trending: Array<ApiScreenResponse & { trendScore: number; trendReason: string }>;
        }>(url);

        const trendingScreens: TrendingScreen[] = response.trending.map(screen => ({
          ...this.convertApiScreenToScreen(screen),
          trendScore: screen.trendScore,
          trendReason: screen.trendReason,
        }));

        // Cache the result
        await this.cacheManager.set(cacheKey, trendingScreens, 1800000); // 30 minutes TTL

        return trendingScreens;
      } catch (error) {
        return this.errorRecoveryService.handleApiError(error as ApiError, {
          operation: 'getTrendingScreens',
          location,
          timeframe,
          fallbackData: async () => {
            return this.cacheManager.get<TrendingScreen[]>(cacheKey, true) || [];
          },
        });
      }
    });
  }

  /**
   * Get filter options with counts
   */
  public async getFilterOptions(): Promise<FilterOptions> {
    const cacheKey = 'filter_options';
    
    return this.requestDeduplicator.deduplicate(cacheKey, async () => {
      // Check cache first
      const cached = await this.cacheManager.get<FilterOptions>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/Marketplace/filter-options`;

      try {
        const response = await this.makeRequest<FilterOptions>(url);

        // Cache the result
        await this.cacheManager.set(cacheKey, response, 1800000); // 30 minutes TTL

        return response;
      } catch (error) {
        return this.errorRecoveryService.handleApiError(error as ApiError, {
          operation: 'getFilterOptions',
          fallbackData: async () => {
            return this.cacheManager.get<FilterOptions>(cacheKey, true) || {
              cities: [],
              categories: [],
              priceRanges: [],
              environments: [],
              features: [],
            };
          },
        });
      }
    });
  }

  /**
   * Search screens with suggestions
   */
  public async searchScreens(query: string, limit?: number): Promise<SearchResult> {
    const cacheKey = `search_${query}_${limit || 10}`;
    
    return this.requestDeduplicator.deduplicate(cacheKey, async () => {
      // Check cache first
      const cached = await this.cacheManager.get<SearchResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (limit) queryParams.append('limit', limit.toString());

      const url = `${this.baseUrl}/Marketplace/search?${queryParams.toString()}`;

      try {
        const startTime = Date.now();
        const response = await this.makeRequest<{
          screens: ApiScreenResponse[];
          suggestions: string[];
          totalResults: number;
        }>(url);

        const result: SearchResult = {
          screens: response.screens.map(this.convertApiScreenToScreen),
          suggestions: response.suggestions,
          totalResults: response.totalResults,
          searchTime: Date.now() - startTime,
        };

        // Cache the result
        await this.cacheManager.set(cacheKey, result, 180000); // 3 minutes TTL

        return result;
      } catch (error) {
        return this.errorRecoveryService.handleApiError(error as ApiError, {
          operation: 'searchScreens',
          query,
          limit,
          fallbackData: async () => {
            return this.cacheManager.get<SearchResult>(cacheKey, true) || {
              screens: [],
              suggestions: [],
              totalResults: 0,
              searchTime: 0,
            };
          },
        });
      }
    });
  }

  /**
   * Get market insights
   */
  public async getMarketInsights(location?: string): Promise<MarketInsights> {
    const cacheKey = `market_insights_${location || 'all'}`;
    
    return this.requestDeduplicator.deduplicate(cacheKey, async () => {
      // Check cache first
      const cached = await this.cacheManager.get<MarketInsights>(cacheKey);
      if (cached) {
        return cached;
      }

      const queryParams = new URLSearchParams();
      if (location) queryParams.append('location', location);

      const url = `${this.baseUrl}/Marketplace/insights?${queryParams.toString()}`;

      try {
        const response = await this.makeRequest<MarketInsights>(url);

        // Cache the result
        await this.cacheManager.set(cacheKey, response, 3600000); // 1 hour TTL

        return response;
      } catch (error) {
        return this.errorRecoveryService.handleApiError(error as ApiError, {
          operation: 'getMarketInsights',
          location,
          fallbackData: async () => {
            return this.cacheManager.get<MarketInsights>(cacheKey, true) || {
              totalScreens: 0,
              averagePrice: 0,
              popularCategories: [],
              priceDistribution: [],
              locationStats: [],
              trends: [],
            };
          },
        });
      }
    });
  }

  /**
   * Clear all caches
   */
  public async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return this.cacheManager.getStats();
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    // Use crypto.randomUUID if available, otherwise fallback to custom implementation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export singleton instance
export default MarketplaceApiService.getInstance();