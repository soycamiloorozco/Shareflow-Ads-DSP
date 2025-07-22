/**
 * Screen-specific type definitions
 * Extended types for screen entities and related functionality
 */

import { Screen, Coordinates, ScreenSpecs, PricingInfo, AudienceMetrics } from './marketplace.types';

// =============================================================================
// EXTENDED SCREEN TYPES
// =============================================================================

export interface ScreenWithCircuit extends Screen {
  readonly isPartOfCircuit: boolean;
  readonly circuitId?: string;
  readonly circuitName?: string;
  readonly circuitPosition?: number;
}

export interface CircuitInfo {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly screens: ScreenWithCircuit[];
  readonly totalViews: number;
  readonly averageRating: number;
  readonly totalPrice: number;
  readonly cities: string[];
  readonly coverageArea?: {
    readonly center: Coordinates;
    readonly radius: number;
  };
}

// =============================================================================
// SCREEN PERFORMANCE TYPES
// =============================================================================

export interface ScreenPerformance {
  readonly screenId: string;
  readonly impressions: {
    readonly daily: number;
    readonly weekly: number;
    readonly monthly: number;
  };
  readonly engagement: {
    readonly viewTime: number;
    readonly interactionRate: number;
    readonly completionRate: number;
  };
  readonly demographics: {
    readonly ageDistribution: Record<string, number>;
    readonly genderDistribution: Record<string, number>;
    readonly incomeDistribution: Record<string, number>;
  };
  readonly timeAnalytics: {
    readonly peakHours: number[];
    readonly peakDays: number[];
    readonly seasonalTrends: Record<string, number>;
  };
}

// =============================================================================
// SCREEN AVAILABILITY TYPES
// =============================================================================

export interface TimeSlot {
  readonly start: string;
  readonly end: string;
  readonly available: boolean;
  readonly price?: number;
  readonly bookedBy?: string;
}

export interface DayAvailability {
  readonly date: string;
  readonly timeSlots: TimeSlot[];
  readonly isHoliday?: boolean;
  readonly specialPricing?: number;
}

export interface ScreenAvailability {
  readonly screenId: string;
  readonly calendar: DayAvailability[];
  readonly lastUpdated: string;
  readonly timezone: string;
}

// =============================================================================
// SCREEN CONTENT TYPES
// =============================================================================

export interface ContentRequirements {
  readonly formats: string[];
  readonly maxFileSize: number;
  readonly minDuration: number;
  readonly maxDuration: number;
  readonly aspectRatio: string;
  readonly resolution: {
    readonly min: { width: number; height: number };
    readonly recommended: { width: number; height: number };
    readonly max: { width: number; height: number };
  };
  readonly colorProfile: string;
  readonly frameRate: number;
  readonly audioSupport: boolean;
}

export interface CreativeAsset {
  readonly id: string;
  readonly name: string;
  readonly type: 'image' | 'video' | 'animation';
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly dimensions: {
    readonly width: number;
    readonly height: number;
  };
  readonly fileSize: number;
  readonly duration?: number;
  readonly format: string;
  readonly uploadedAt: string;
  readonly status: 'pending' | 'approved' | 'rejected';
}

// =============================================================================
// SCREEN ANALYTICS TYPES
// =============================================================================

export interface ScreenAnalytics {
  readonly screenId: string;
  readonly period: {
    readonly start: string;
    readonly end: string;
  };
  readonly metrics: {
    readonly totalImpressions: number;
    readonly uniqueViews: number;
    readonly averageViewTime: number;
    readonly peakViewTime: string;
    readonly engagementRate: number;
  };
  readonly hourlyBreakdown: Array<{
    readonly hour: number;
    readonly impressions: number;
    readonly engagement: number;
  }>;
  readonly demographicBreakdown: {
    readonly age: Record<string, number>;
    readonly gender: Record<string, number>;
    readonly interests: Record<string, number>;
  };
}

// =============================================================================
// SCREEN COMPARISON TYPES
// =============================================================================

export interface ScreenComparison {
  readonly screens: Screen[];
  readonly metrics: {
    readonly priceComparison: Array<{
      readonly screenId: string;
      readonly price: number;
      readonly pricePerImpression: number;
    }>;
    readonly audienceComparison: Array<{
      readonly screenId: string;
      readonly dailyViews: number;
      readonly engagement: number;
      readonly demographics: Record<string, number>;
    }>;
    readonly locationComparison: Array<{
      readonly screenId: string;
      readonly city: string;
      readonly neighborhood: string;
      readonly footTraffic: string;
    }>;
  };
  readonly recommendations: Array<{
    readonly screenId: string;
    readonly reason: string;
    readonly score: number;
  }>;
}

// =============================================================================
// SCREEN SEARCH TYPES
// =============================================================================

export interface ScreenSearchResult {
  readonly screen: Screen;
  readonly relevanceScore: number;
  readonly matchedFields: string[];
  readonly highlights: Record<string, string>;
}

export interface ScreenSearchResponse {
  readonly results: ScreenSearchResult[];
  readonly total: number;
  readonly facets: {
    readonly cities: Array<{ name: string; count: number }>;
    readonly categories: Array<{ name: string; count: number }>;
    readonly priceRanges: Array<{ range: string; count: number }>;
  };
  readonly suggestions: string[];
  readonly searchTime: number;
}

// =============================================================================
// SCREEN RECOMMENDATION TYPES
// =============================================================================

export interface RecommendationCriteria {
  readonly budget?: {
    readonly min: number;
    readonly max: number;
  };
  readonly targetAudience?: {
    readonly ageGroups: string[];
    readonly interests: string[];
    readonly demographics: Record<string, unknown>;
  };
  readonly location?: {
    readonly cities: string[];
    readonly radius?: number;
    readonly coordinates?: Coordinates;
  };
  readonly campaign?: {
    readonly duration: number;
    readonly objectives: string[];
    readonly industry: string;
  };
}

export interface ScreenRecommendation {
  readonly screen: Screen;
  readonly score: number;
  readonly reasons: Array<{
    readonly type: 'price' | 'audience' | 'location' | 'performance';
    readonly description: string;
    readonly weight: number;
  }>;
  readonly projectedPerformance: {
    readonly estimatedImpressions: number;
    readonly estimatedReach: number;
    readonly estimatedEngagement: number;
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getScreenMinPrice = (screen: Screen): number => {
  const prices: number[] = [];
  
  if (screen.pricing.bundles.hourly?.enabled) {
    prices.push(screen.pricing.bundles.hourly.price);
  }
  if (screen.pricing.bundles.daily?.enabled) {
    prices.push(screen.pricing.bundles.daily.price);
  }
  if (screen.pricing.bundles.weekly?.enabled) {
    prices.push(screen.pricing.bundles.weekly.price);
  }
  if (screen.pricing.bundles.monthly?.enabled) {
    prices.push(screen.pricing.bundles.monthly.price);
  }
  
  return prices.length > 0 ? Math.min(...prices) : screen.price || 0;
};

export const getScreenMaxPrice = (screen: Screen): number => {
  const prices: number[] = [];
  
  if (screen.pricing.bundles.hourly?.enabled) {
    prices.push(screen.pricing.bundles.hourly.price);
  }
  if (screen.pricing.bundles.daily?.enabled) {
    prices.push(screen.pricing.bundles.daily.price);
  }
  if (screen.pricing.bundles.weekly?.enabled) {
    prices.push(screen.pricing.bundles.weekly.price);
  }
  if (screen.pricing.bundles.monthly?.enabled) {
    prices.push(screen.pricing.bundles.monthly.price);
  }
  
  return prices.length > 0 ? Math.max(...prices) : screen.price || 0;
};

export const isScreenAvailable = (screen: Screen, date?: Date): boolean => {
  if (!screen.availability) return false;
  
  // Add more sophisticated availability checking logic here
  // For now, just return the basic availability flag
  return screen.availability;
};

export const calculateScreenScore = (screen: Screen, criteria: RecommendationCriteria): number => {
  let score = 0;
  
  // Price score (0-25 points)
  if (criteria.budget) {
    const minPrice = getScreenMinPrice(screen);
    if (minPrice >= criteria.budget.min && minPrice <= criteria.budget.max) {
      score += 25;
    } else if (minPrice < criteria.budget.max) {
      score += 15;
    }
  }
  
  // Audience score (0-25 points)
  if (criteria.targetAudience) {
    // Add audience matching logic
    score += 20; // Placeholder
  }
  
  // Location score (0-25 points)
  if (criteria.location) {
    // Add location matching logic
    score += 20; // Placeholder
  }
  
  // Performance score (0-25 points)
  const performanceScore = Math.min(25, (screen.rating / 5) * 25);
  score += performanceScore;
  
  return Math.min(100, score);
};

// Type guards
export const isScreenWithCircuit = (screen: Screen): screen is ScreenWithCircuit => {
  return 'isPartOfCircuit' in screen;
};

export const hasValidCoordinates = (screen: Screen): boolean => {
  return !!(screen.coordinates?.lat && screen.coordinates?.lng);
};

export const supportsFormat = (screen: Screen, format: string): boolean => {
  return screen.media?.supportedFormats?.includes(format) ?? false;
};