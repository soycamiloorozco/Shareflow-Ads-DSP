/**
 * Comprehensive TypeScript type definitions for Marketplace components
 * This file contains all core interfaces and types used throughout the marketplace
 */

import { SearchSuggestion } from './filter.types';
import { ConditionalFilterRule, FilterGroup, LogicOperator } from './conditional-filter.types';

// =============================================================================
// CORE SCREEN TYPES
// =============================================================================

export interface Coordinates {
  readonly lat: number;
  readonly lng: number;
}

export interface Location {
  readonly address: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
  readonly coordinates: Coordinates;
  readonly timezone: string;
  readonly neighborhood?: string;
  readonly landmarks: string[];
}

export interface ScreenSpecs {
  readonly width: number;
  readonly height: number;
  readonly resolution: string;
  readonly brightness: string;
  readonly aspectRatio: string;
  readonly orientation: 'landscape' | 'portrait';
  readonly pixelDensity: number;
  readonly colorDepth: number;
  readonly refreshRate: number;
}

export interface PricingBundle {
  readonly enabled: boolean;
  readonly price: number;
  readonly spots: number;
  readonly duration?: string;
}

export interface PricingInfo {
  readonly allowMoments: boolean;
  readonly deviceId: string;
  readonly bundles: {
    readonly hourly?: PricingBundle;
    readonly daily?: PricingBundle;
    readonly weekly?: PricingBundle;
    readonly monthly?: PricingBundle;
  };
}

export interface AudienceMetrics {
  readonly dailyTraffic: number;
  readonly monthlyTraffic: number;
  readonly averageEngagement: number;
  readonly demographics?: {
    readonly ageGroups: Record<string, number>;
    readonly gender: Record<string, number>;
    readonly income: Record<string, number>;
  };
  readonly dwellTime?: {
    readonly average: number;
    readonly median: number;
    readonly distribution: Record<string, number>;
  };
}

export interface OperatingHours {
  readonly start: string;
  readonly end: string;
  readonly daysActive: string[];
  readonly timezone?: string;
}

export interface ScreenCategory {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
}

export interface Screen {
  readonly id: string;
  readonly name: string;
  readonly location: string; // Legacy format for compatibility
  readonly locationDetails: Location;
  readonly price: number; // Base price for compatibility
  readonly availability: boolean;
  readonly image: string;
  readonly category: ScreenCategory;
  readonly environment: 'indoor' | 'outdoor';
  readonly specs: ScreenSpecs;
  readonly views: {
    readonly daily: number;
    readonly monthly: number;
  };
  readonly rating: number;
  readonly reviews: number;
  readonly coordinates?: Coordinates; // Legacy format for compatibility
  readonly pricing: PricingInfo;
  readonly metrics: AudienceMetrics;
  readonly operatingHours?: OperatingHours;
  readonly accessibility?: AccessibilityInfo;
  readonly venue?: VenueInfo;
  readonly media?: MediaInfo;
  // API screen packages data for price calculations
  readonly screenPackages?: Array<{
    readonly id: number;
    readonly screenId: number;
    readonly packageType: 'moments' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    readonly enabled: boolean;
    readonly price: number;
    readonly spots: number;
    readonly duration: string;
    readonly reach: number;
    readonly variants: Array<{
      readonly id: number;
      readonly variantId: string;
      readonly name: string;
      readonly frequency: string;
      readonly spotsPerHour?: number;
      readonly spotsPerDay?: number;
      readonly spotsPerWeek?: number;
      readonly spotsPerMonth?: number;
      readonly price: number;
      readonly enabled: boolean;
    }>;
  }>;
}

export interface AccessibilityInfo {
  readonly wheelchairAccessible: boolean;
  readonly audioDescription: boolean;
  readonly visuallyImpairedSupport: boolean;
  readonly hearingImpairedSupport: boolean;
  readonly keyboardNavigation: boolean;
  readonly screenReaderCompatible: boolean;
}

export interface VenueInfo {
  readonly type: string;
  readonly subType?: string;
  readonly capacity?: number;
  readonly footTraffic: 'low' | 'medium' | 'high' | 'very_high';
  readonly audienceType: string[];
  readonly peakHours: string[];
}

export interface MediaInfo {
  readonly supportedFormats: string[];
  readonly maxFileSize: number;
  readonly recommendedDimensions: {
    readonly width: number;
    readonly height: number;
  };
  readonly animationSupport: boolean;
  readonly videoSupport: boolean;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface SearchFilter {
  readonly query: string;
  readonly suggestions?: string[];
}

export interface LocationFilter {
  readonly cities: string[];
  readonly regions: string[];
  readonly coordinates?: {
    readonly center: Coordinates;
    readonly radius: number;
  };
  readonly neighborhoods: string[];
}

export interface CategoryFilter {
  readonly categories: string[];
  readonly venueTypes: string[];
  readonly environments: string[];
  readonly dwellTimes: string[];
}

export interface PriceFilter {
  readonly min: number;
  readonly max: number;
  readonly ranges: string[];
  readonly currency: string;
}

export interface FeatureFilter {
  readonly allowsMoments: boolean | null;
  readonly rating: number | null;
  readonly accessibility: string[];
  readonly supportedFormats: string[];
}

export interface AvailabilityFilter {
  readonly dateRange?: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly timeSlots: string[];
  readonly daysOfWeek: number[];
}

export interface SortFilter {
  readonly field: 'relevance' | 'price' | 'rating' | 'distance' | 'popularity';
  readonly direction: 'asc' | 'desc';
}

export interface FilterState {
  readonly search: SearchFilter;
  readonly location: LocationFilter;
  readonly category: CategoryFilter;
  readonly price: PriceFilter;
  readonly features: FeatureFilter;
  readonly availability: AvailabilityFilter;
  readonly sort: SortFilter;
  readonly showFavoritesOnly: boolean;
  readonly showCircuits: boolean;
}

// Enhanced FilterState with conditional logic support
export interface EnhancedFilterState extends FilterState {
  readonly conditionalRules: ConditionalFilterRule[];
  readonly filterGroups: FilterGroup[];
  readonly globalLogic: LogicOperator;
  readonly displayMode: 'sections' | 'individual';
  readonly viewMode: 'grid' | 'list' | 'map';
  readonly metadata: FilterStateMetadata;
}

export interface FilterStateMetadata {
  readonly lastModified: Date;
  readonly source: 'user' | 'suggestion' | 'saved' | 'migration';
  readonly version: string;
  readonly migrationInfo?: MigrationInfo;
}

export interface MigrationInfo {
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly migratedAt: Date;
  readonly migrationStrategy: 'automatic' | 'manual' | 'hybrid';
  readonly warnings: string[];
  readonly dataLoss: boolean;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
}

export interface ResponseMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
  readonly timestamp: string;
  readonly requestId: string;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly meta: ResponseMeta;
  readonly errors?: ApiError[];
  readonly warnings?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly pageSize: number;
    readonly totalItems: number;
  };
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface BaseComponentProps {
  readonly className?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
  readonly 'data-testid'?: string;
}

export interface ScreenCardProps extends BaseComponentProps {
  readonly screen: Screen;
  readonly index: number;
  readonly onSelect: (screen: Screen) => void;
  readonly onFavoriteChange?: () => void;
  readonly loading?: boolean;
  readonly variant?: 'default' | 'compact' | 'detailed';
}

export interface ScreenGridProps extends BaseComponentProps {
  readonly screens: Screen[];
  readonly circuits: Screen[][];
  readonly onScreenSelect: (screen: Screen) => void;
  readonly onFavoriteChange?: () => void;
  readonly loading?: boolean;
  readonly viewMode?: 'grid' | 'list' | 'map';
}

export interface FilterPanelProps extends BaseComponentProps {
  readonly filters: FilterState;
  readonly onFiltersChange: (filters: FilterState) => void;
  readonly availableOptions: FilterOptions;
  readonly loading?: boolean;
  readonly 'aria-expanded'?: boolean;
}

export interface SearchHeaderProps extends BaseComponentProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly onInfoClick: () => void;
  readonly filteredCount: number;
  readonly suggestions?: SearchSuggestion[];
  readonly loading?: boolean;
}

// =============================================================================
// FILTER OPTIONS TYPES
// =============================================================================

export interface FilterOption {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly icon?: string;
  readonly emoji?: string;
  readonly disabled?: boolean;
}

export interface FilterOptions {
  readonly cities: FilterOption[];
  readonly categories: FilterOption[];
  readonly priceRanges: FilterOption[];
  readonly venueTypes: FilterOption[];
  readonly environments: FilterOption[];
  readonly dwellTimes: FilterOption[];
  readonly features: FilterOption[];
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

export interface MarketplaceState {
  readonly screens: Screen[];
  readonly filteredScreens: Screen[];
  readonly filters: FilterState;
  readonly ui: UIState;
  readonly cache: CacheState;
  readonly user: UserState;
  readonly loading: boolean;
  readonly error: ApiError | null;
}

export interface UIState {
  readonly viewMode: 'sectioned' | 'card' | 'compact' | 'table' | 'map';
  readonly selectedScreen: Screen | null;
  readonly isFilterDrawerOpen: boolean;
  readonly isInfoModalOpen: boolean;
  readonly searchQuery: string;
  readonly sortBy: string;
}

export interface CacheState {
  readonly screens: Map<string, { data: Screen[]; timestamp: number; ttl: number }>;
  readonly filters: Map<string, { data: FilterOptions; timestamp: number; ttl: number }>;
  readonly search: Map<string, { data: string[]; timestamp: number; ttl: number }>;
}

export interface UserState {
  readonly favorites: string[];
  readonly recentSearches: string[];
  readonly preferences: UserPreferences;
}

export interface UserPreferences {
  readonly defaultViewMode: 'sectioned' | 'card' | 'compact' | 'table' | 'map';
  readonly defaultSort: string;
  readonly savedFilters: FilterState[];
  readonly accessibility: {
    readonly reducedMotion: boolean;
    readonly highContrast: boolean;
    readonly largeText: boolean;
  };
}

// =============================================================================
// BOOKING TYPES
// =============================================================================

export type BookingStep = 'browse' | 'details' | 'time-selection' | 'creative-upload' | 'summary' | 'payment' | 'confirmation';
export type BookingType = 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly' | null;

export interface BookingData {
  readonly screen: Screen | null;
  readonly type: BookingType;
  readonly date?: Date;
  readonly dates?: Date[];
  readonly time?: string;
  readonly minute?: number;
  readonly timeSlots?: string[];
  readonly file?: File | null;
  readonly filePreview?: string | null;
  readonly uploadLater?: boolean;
  readonly price?: number;
  readonly fileDimensions?: FileDimensions;
  readonly totalCost?: number;
  readonly duration?: number;
}

export interface FileDimensions {
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly matchesScreen?: boolean;
  readonly scaleMethod: 'fill' | 'expand' | 'fit';
  readonly fileSize: number;
  readonly format: string;
}

// =============================================================================
// PERFORMANCE TYPES
// =============================================================================

export interface VirtualizationConfig {
  readonly itemHeight: number;
  readonly containerHeight: number;
  readonly overscan?: number;
  readonly threshold?: number;
}

export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly loadTime: number;
  readonly interactionTime: number;
  readonly memoryUsage: number;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

export interface ErrorInfo {
  readonly componentStack: string;
  readonly errorBoundary?: string;
  readonly eventType?: string;
}

export interface ErrorContext {
  readonly component: string;
  readonly action: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly timestamp: string;
  readonly userAgent: string;
  readonly url: string;
  readonly additionalData?: Record<string, unknown>;
}

export interface RetryConfig {
  readonly maxRetries: number;
  readonly baseDelay: number;
  readonly maxDelay: number;
  readonly backoffFactor: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ViewMode = 'sectioned' | 'card' | 'compact' | 'table' | 'map';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SortDirection = 'asc' | 'desc';

// Type guards
export const isScreen = (obj: unknown): obj is Screen => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
};

export const isApiError = (obj: unknown): obj is ApiError => {
  return typeof obj === 'object' && obj !== null && 'code' in obj && 'message' in obj;
};

export const isFilterState = (obj: unknown): obj is FilterState => {
  return typeof obj === 'object' && obj !== null && 'search' in obj && 'location' in obj;
};

// Utility type for making properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type for making properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep readonly utility type
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};