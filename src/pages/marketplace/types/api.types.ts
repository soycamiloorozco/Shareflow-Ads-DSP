/**
 * API-specific type definitions
 * Types for API requests, responses, and data transfer objects
 */

import { Screen, FilterState, ApiResponse, PaginatedResponse } from './marketplace.types';
import { ScreenAnalytics, ScreenAvailability } from './screen.types';
import { FilterOptions } from './filter.types';

// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface GetScreensRequest {
  readonly filters?: Partial<FilterState>;
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sort?: {
    readonly field: string;
    readonly direction: 'asc' | 'desc';
  };
  readonly include?: Array<'analytics' | 'availability' | 'recommendations'>;
}

export interface SearchScreensRequest {
  readonly query: string;
  readonly filters?: Partial<FilterState>;
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
  };
  readonly facets?: string[];
  readonly highlight?: boolean;
}

export interface GetScreenDetailsRequest {
  readonly screenId: string;
  readonly include?: Array<'analytics' | 'availability' | 'similar' | 'reviews'>;
  readonly dateRange?: {
    readonly start: string;
    readonly end: string;
  };
}

export interface GetScreenAvailabilityRequest {
  readonly screenId: string;
  readonly dateRange: {
    readonly start: string;
    readonly end: string;
  };
  readonly timeZone?: string;
}

export interface CreateBookingRequest {
  readonly screenId: string;
  readonly bookingType: 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  readonly startDate: string;
  readonly endDate?: string;
  readonly timeSlots?: string[];
  readonly creativeAssetId?: string;
  readonly totalAmount: number;
  readonly currency: string;
  readonly metadata?: Record<string, unknown>;
}

export interface UploadCreativeRequest {
  readonly file: File;
  readonly name: string;
  readonly description?: string;
  readonly targetScreens?: string[];
  readonly metadata?: {
    readonly campaign?: string;
    readonly advertiser?: string;
    readonly tags?: string[];
  };
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface GetScreensResponse extends PaginatedResponse<Screen> {
  readonly facets?: {
    readonly cities: Array<{ name: string; count: number }>;
    readonly categories: Array<{ name: string; count: number }>;
    readonly priceRanges: Array<{ range: string; count: number }>;
  };
  readonly recommendations?: Screen[];
}

export interface SearchScreensResponse extends ApiResponse<Screen[]> {
  readonly searchMetadata: {
    readonly query: string;
    readonly totalResults: number;
    readonly searchTime: number;
    readonly suggestions: string[];
  };
  readonly facets: {
    readonly cities: Array<{ name: string; count: number }>;
    readonly categories: Array<{ name: string; count: number }>;
    readonly priceRanges: Array<{ range: string; count: number }>;
    readonly ratings: Array<{ rating: number; count: number }>;
  };
  readonly highlights?: Record<string, string[]>;
}

export interface GetScreenDetailsResponse extends ApiResponse<Screen> {
  readonly analytics?: ScreenAnalytics;
  readonly availability?: ScreenAvailability;
  readonly similarScreens?: Screen[];
  readonly reviews?: ScreenReview[];
  readonly recommendations?: {
    readonly reason: string;
    readonly alternatives: Screen[];
  };
}

export interface GetFilterOptionsResponse extends ApiResponse<FilterOptions> {
  readonly metadata: {
    readonly lastUpdated: string;
    readonly totalScreens: number;
    readonly activeFilters: number;
  };
}

export interface CreateBookingResponse extends ApiResponse<BookingDetails> {
  readonly paymentUrl?: string;
  readonly confirmationCode: string;
  readonly estimatedApprovalTime: string;
}

export interface UploadCreativeResponse extends ApiResponse<CreativeAsset> {
  readonly processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  readonly previewUrl?: string;
  readonly validationResults?: {
    readonly isValid: boolean;
    readonly errors: string[];
    readonly warnings: string[];
  };
}

// =============================================================================
// DATA TRANSFER OBJECTS
// =============================================================================

export interface ScreenDTO {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly city: string;
  readonly coordinates: {
    readonly lat: number;
    readonly lng: number;
  };
  readonly category: {
    readonly id: string;
    readonly name: string;
  };
  readonly specs: {
    readonly width: number;
    readonly height: number;
    readonly resolution: string;
    readonly brightness: string;
  };
  readonly pricing: {
    readonly hourly?: number;
    readonly daily?: number;
    readonly weekly?: number;
    readonly monthly?: number;
    readonly allowsMoments: boolean;
  };
  readonly metrics: {
    readonly dailyViews: number;
    readonly monthlyViews: number;
    readonly rating: number;
    readonly reviews: number;
  };
  readonly availability: boolean;
  readonly imageUrl: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BookingDetails {
  readonly id: string;
  readonly screenId: string;
  readonly userId: string;
  readonly bookingType: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly timeSlots: string[];
  readonly status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  readonly totalAmount: number;
  readonly currency: string;
  readonly creativeAssetId?: string;
  readonly paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreativeAsset {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: 'image' | 'video' | 'animation';
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly fileSize: number;
  readonly dimensions: {
    readonly width: number;
    readonly height: number;
  };
  readonly duration?: number;
  readonly format: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly uploadedBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ScreenReview {
  readonly id: string;
  readonly screenId: string;
  readonly userId: string;
  readonly userName: string;
  readonly rating: number;
  readonly comment?: string;
  readonly helpful: number;
  readonly verified: boolean;
  readonly createdAt: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ValidationError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly value?: unknown;
}

export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
    readonly validationErrors?: ValidationError[];
  };
  readonly requestId: string;
  readonly timestamp: string;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

export interface WebhookEvent {
  readonly id: string;
  readonly type: 'booking.created' | 'booking.confirmed' | 'booking.cancelled' | 'creative.approved' | 'creative.rejected';
  readonly data: Record<string, unknown>;
  readonly timestamp: string;
  readonly signature: string;
}

export interface BookingWebhookData {
  readonly bookingId: string;
  readonly screenId: string;
  readonly userId: string;
  readonly status: string;
  readonly previousStatus?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface CreativeWebhookData {
  readonly creativeId: string;
  readonly userId: string;
  readonly status: string;
  readonly previousStatus?: string;
  readonly validationResults?: {
    readonly isValid: boolean;
    readonly errors: string[];
    readonly warnings: string[];
  };
}

// =============================================================================
// CACHE TYPES
// =============================================================================

export interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
  readonly key: string;
}

export interface CacheConfig {
  readonly defaultTTL: number;
  readonly maxSize: number;
  readonly strategy: 'lru' | 'fifo' | 'lfu';
}

// =============================================================================
// RATE LIMITING TYPES
// =============================================================================

export interface RateLimitInfo {
  readonly limit: number;
  readonly remaining: number;
  readonly resetTime: number;
  readonly retryAfter?: number;
}

export interface RateLimitedResponse<T> extends ApiResponse<T> {
  readonly rateLimit: RateLimitInfo;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const transformScreenDTOToScreen = (dto: ScreenDTO): Screen => {
  return {
    id: dto.id,
    name: dto.name,
    location: dto.location,
    locationDetails: {
      address: dto.location,
      city: dto.city,
      region: '',
      country: 'Colombia',
      coordinates: dto.coordinates,
      timezone: 'America/Bogota',
      landmarks: []
    },
    price: dto.pricing.hourly || dto.pricing.daily || 0,
    availability: dto.availability,
    image: dto.imageUrl,
    category: dto.category,
    environment: 'outdoor', // Default, should be determined from category
    specs: {
      ...dto.specs,
      aspectRatio: `${dto.specs.width}:${dto.specs.height}`,
      orientation: dto.specs.width >= dto.specs.height ? 'landscape' : 'portrait',
      pixelDensity: 72,
      colorDepth: 24,
      refreshRate: 60
    },
    views: {
      daily: dto.metrics.dailyViews,
      monthly: dto.metrics.monthlyViews
    },
    rating: dto.metrics.rating,
    reviews: dto.metrics.reviews,
    coordinates: dto.coordinates,
    pricing: {
      allowMoments: dto.pricing.allowsMoments,
      deviceId: dto.id,
      bundles: {
        hourly: dto.pricing.hourly ? {
          enabled: true,
          price: dto.pricing.hourly,
          spots: 4
        } : undefined,
        daily: dto.pricing.daily ? {
          enabled: true,
          price: dto.pricing.daily,
          spots: 24
        } : undefined,
        weekly: dto.pricing.weekly ? {
          enabled: true,
          price: dto.pricing.weekly,
          spots: 168
        } : undefined,
        monthly: dto.pricing.monthly ? {
          enabled: true,
          price: dto.pricing.monthly,
          spots: 720
        } : undefined
      }
    },
    metrics: {
      dailyTraffic: dto.metrics.dailyViews,
      monthlyTraffic: dto.metrics.monthlyViews,
      averageEngagement: 85 // Default value
    }
  };
};

export const isApiError = (response: unknown): response is ApiErrorResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as any).error === 'object'
  );
};

export const isRateLimited = (response: unknown): response is RateLimitedResponse<any> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'rateLimit' in response
  );
};

export const createCacheKey = (endpoint: string, params?: Record<string, unknown>): string => {
  const baseKey = endpoint.replace(/\//g, '_');
  if (!params) return baseKey;
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${baseKey}?${sortedParams}`;
};

export const isStale = (cacheEntry: CacheEntry<unknown>): boolean => {
  return Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
};