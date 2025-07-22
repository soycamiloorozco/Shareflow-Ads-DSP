/**
 * Intelligent Grouping Type Definitions
 * Types for AI/ML-powered marketplace sections and personalized recommendations
 */

import { Screen } from './marketplace.types';

// =============================================================================
// CORE GROUPING TYPES
// =============================================================================

export interface MarketplaceSection {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly screens: Screen[];
  readonly displayType: SectionDisplayType;
  readonly priority: number;
  readonly metadata: SectionMetadata;
}

export type SectionDisplayType = 
  | 'horizontal-scroll' 
  | 'grid' 
  | 'featured'
  | 'hero'
  | 'compact-list';

export interface SectionMetadata {
  readonly algorithm: AlgorithmType;
  readonly confidence: number;
  readonly refreshInterval: number;
  readonly trackingId: string;
  readonly generatedAt: Date;
  readonly userContext?: UserContext;
}

export interface UserContext {
  readonly userId?: string;
  readonly sessionId: string;
  readonly location?: string;
  readonly deviceType: 'mobile' | 'tablet' | 'desktop';
  readonly timestamp: Date;
}

// =============================================================================
// ALGORITHM TYPES
// =============================================================================

export type AlgorithmType = 
  | 'ml-personalized'
  | 'collaborative-filtering'
  | 'content-based'
  | 'trending-analysis'
  | 'geographic-popularity'
  | 'recent-activity'
  | 'purchase-history'
  | 'new-discovery'
  | 'other-users-buying'
  | 'fallback-popular';

export interface AlgorithmConfig {
  readonly type: AlgorithmType;
  readonly enabled: boolean;
  readonly weight: number;
  readonly parameters: Record<string, unknown>;
  readonly fallbackStrategy?: AlgorithmType;
}

// =============================================================================
// SECTION CONFIGURATION TYPES
// =============================================================================

export interface SectionConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly algorithm: AlgorithmType;
  readonly priority: number;
  readonly maxScreens: number;
  readonly minScreens: number;
  readonly refreshInterval: number;
  readonly enabled: boolean;
  readonly targetAudience: string[];
  readonly displayConfig: SectionDisplayConfig;
  readonly conditions: SectionConditions;
}

export interface SectionDisplayConfig {
  readonly displayType: SectionDisplayType;
  readonly cardSize: 'small' | 'medium' | 'large' | 'featured';
  readonly showMetadata: boolean;
  readonly maxVisible: number;
  readonly spacing: 'tight' | 'normal' | 'loose';
  readonly mobileLayout: MobileLayoutConfig;
}

export interface MobileLayoutConfig {
  readonly horizontalScroll: boolean;
  readonly cardsPerView: number;
  readonly snapToCards: boolean;
  readonly showScrollIndicator: boolean;
}

export interface SectionConditions {
  readonly requiresLogin: boolean;
  readonly minUserInteractions: number;
  readonly minPurchaseHistory: number;
  readonly locationRequired: boolean;
  readonly timeRestrictions?: TimeRestrictions;
}

export interface TimeRestrictions {
  readonly startHour: number;
  readonly endHour: number;
  readonly daysOfWeek: number[];
  readonly timezone: string;
}

export interface DynamicSectionRule {
  readonly id: string;
  readonly condition: string;
  readonly action: 'enable' | 'disable' | 'modify';
  readonly targetSections: string[];
  readonly parameters?: Record<string, unknown>;
  readonly priority: number;
  readonly enabled: boolean;
}

// =============================================================================
// USER PROFILE TYPES
// =============================================================================

export interface UserProfile {
  readonly userId: string;
  readonly preferredCategories: CategoryPreference[];
  readonly budgetRange: PriceRange;
  readonly locationPreferences: LocationPreference[];
  readonly behaviorScore: number;
  readonly lastActivity: Date;
  readonly interactionHistory: UserInteractionSummary;
  readonly purchaseProfile: PurchaseProfile;
  readonly preferences: UserPreferences;
}

export interface CategoryPreference {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly score: number;
  readonly interactionCount: number;
  readonly lastInteraction: Date;
  readonly conversionRate: number;
}

export interface PriceRange {
  readonly min: number;
  readonly max: number;
  readonly preferred: number;
  readonly currency: string;
  readonly confidence: number;
}

export interface LocationPreference {
  readonly city: string;
  readonly region: string;
  readonly score: number;
  readonly interactionCount: number;
  readonly purchaseCount: number;
  readonly lastActivity: Date;
}

export interface UserInteractionSummary {
  readonly totalInteractions: number;
  readonly averageSessionDuration: number;
  readonly mostActiveTimeOfDay: number;
  readonly preferredDeviceType: string;
  readonly engagementRate: number;
  readonly lastInteractionDate: Date;
}

export interface PurchaseProfile {
  readonly totalPurchases: number;
  readonly totalSpent: number;
  readonly averageOrderValue: number;
  readonly preferredPurchaseType: string[];
  readonly seasonalPatterns: Record<string, number>;
  readonly lastPurchaseDate?: Date;
  readonly purchaseFrequency: 'low' | 'medium' | 'high';
}

export interface UserPreferences {
  readonly notifications: NotificationPreferences;
  readonly display: DisplayPreferences;
  readonly privacy: PrivacyPreferences;
  readonly accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  readonly newScreens: boolean;
  readonly priceDrops: boolean;
  readonly recommendations: boolean;
  readonly marketingEmails: boolean;
}

export interface DisplayPreferences {
  readonly defaultViewMode: 'sectioned' | 'grid' | 'list';
  readonly cardsPerRow: number;
  readonly showPrices: boolean;
  readonly showRatings: boolean;
  readonly compactMode: boolean;
}

export interface PrivacyPreferences {
  readonly allowPersonalization: boolean;
  readonly allowLocationTracking: boolean;
  readonly allowBehaviorTracking: boolean;
  readonly shareDataWithPartners: boolean;
}

export interface AccessibilityPreferences {
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
  readonly largeText: boolean;
  readonly screenReader: boolean;
  readonly keyboardNavigation: boolean;
}

// =============================================================================
// USER INTERACTION TYPES
// =============================================================================

export interface UserInteraction {
  readonly id: string;
  readonly userId: string;
  readonly screenId: string;
  readonly action: InteractionAction;
  readonly timestamp: Date;
  readonly context: InteractionContext;
  readonly metadata: InteractionMetadata;
}

export type InteractionAction = 
  | 'view'
  | 'click'
  | 'purchase'
  | 'favorite'
  | 'share'
  | 'compare'
  | 'filter'
  | 'search'
  | 'scroll'
  | 'hover';

export interface InteractionContext {
  readonly section?: string;
  readonly searchQuery?: string;
  readonly filters?: Record<string, unknown>;
  readonly sessionId: string;
  readonly pageUrl: string;
  readonly referrer?: string;
  readonly deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  readonly type: 'mobile' | 'tablet' | 'desktop';
  readonly os: string;
  readonly browser: string;
  readonly screenSize: { width: number; height: number };
  readonly touchEnabled: boolean;
}

export interface InteractionMetadata {
  readonly duration?: number;
  readonly scrollDepth?: number;
  readonly clickPosition?: { x: number; y: number };
  readonly elementId?: string;
  readonly additionalData?: Record<string, unknown>;
}

// =============================================================================
// SCREEN ENHANCEMENT TYPES
// =============================================================================

export interface EnhancedScreen extends Screen {
  readonly performanceMetrics: ScreenPerformanceMetrics;
  readonly recommendationScore?: number;
  readonly trendingScore?: number;
  readonly personalizedScore?: number;
  readonly sectionAssignment?: string;
  readonly lastBookingDate?: Date;
  readonly bookingFrequency: BookingFrequency;
  readonly engagementMetrics: ScreenEngagementMetrics;
  readonly audienceInsights: AudienceInsights;
}

export interface ScreenPerformanceMetrics {
  readonly screenId: string;
  readonly bookingRate: number;
  readonly averageRating: number;
  readonly engagementScore: number;
  readonly revenueGenerated: number;
  readonly impressionCount: number;
  readonly conversionRate: number;
  readonly lastUpdated: Date;
  readonly trendDirection: 'up' | 'down' | 'stable';
}

export type BookingFrequency = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

export interface ScreenEngagementMetrics {
  readonly viewTime: number;
  readonly interactionRate: number;
  readonly completionRate: number;
  readonly shareRate: number;
  readonly favoriteRate: number;
  readonly clickThroughRate: number;
  readonly bounceRate: number;
}

export interface AudienceInsights {
  readonly primaryDemographic: string;
  readonly ageDistribution: Record<string, number>;
  readonly genderDistribution: Record<string, number>;
  readonly interestCategories: string[];
  readonly peakEngagementHours: number[];
  readonly seasonalTrends: Record<string, number>;
}

// =============================================================================
// RECOMMENDATION SERVICE TYPES
// =============================================================================

export interface RecommendationService {
  getTopPicks(userId: string, limit: number): Promise<EnhancedScreen[]>;
  getSimilarScreens(screenId: string, userId: string): Promise<EnhancedScreen[]>;
  getNewDiscoveries(userId: string, limit: number): Promise<EnhancedScreen[]>;
  getTrendingScreens(location?: string, limit?: number): Promise<EnhancedScreen[]>;
  updateUserPreferences(userId: string, interactions: UserInteraction[]): Promise<void>;
  generatePersonalizedSections(userId: string): Promise<MarketplaceSection[]>;
}

export interface RecommendationRequest {
  readonly userId: string;
  readonly sectionType: string;
  readonly limit: number;
  readonly filters?: Record<string, unknown>;
  readonly context: RecommendationContext;
}

export interface RecommendationContext {
  readonly location?: string;
  readonly timeOfDay: number;
  readonly dayOfWeek: number;
  readonly season: string;
  readonly userSegment?: string;
  readonly campaignContext?: CampaignContext;
}

export interface CampaignContext {
  readonly industry?: string;
  readonly budget?: PriceRange;
  readonly duration?: number;
  readonly objectives?: string[];
  readonly targetAudience?: Record<string, unknown>;
}

export interface RecommendationResponse {
  readonly screens: EnhancedScreen[];
  readonly metadata: RecommendationMetadata;
  readonly fallbackUsed: boolean;
  readonly confidence: number;
}

export interface RecommendationMetadata {
  readonly algorithm: AlgorithmType;
  readonly processingTime: number;
  readonly dataFreshness: Date;
  readonly factors: RecommendationFactor[];
  readonly debugInfo?: Record<string, unknown>;
}

export interface RecommendationFactor {
  readonly type: string;
  readonly weight: number;
  readonly description: string;
  readonly value: number;
}

// =============================================================================
// MARKET DATA TYPES
// =============================================================================

export interface MarketDataService {
  getTrendingScreens(location?: string, timeframe?: number): Promise<TrendingScreen[]>;
  getTopPerformingScreens(location: string, limit: number): Promise<EnhancedScreen[]>;
  getRecentBookings(timeframe: number): Promise<BookingActivity[]>;
  getScreenPerformanceMetrics(screenId: string): Promise<ScreenPerformanceMetrics>;
  getMarketInsights(location?: string): Promise<MarketInsights>;
}

export interface TrendingScreen {
  readonly screen: EnhancedScreen;
  readonly bookingVelocity: number;
  readonly purchaseVelocity: number;
  readonly trendScore: number;
  readonly bookingCount: number;
  readonly recentPurchases: number;
  readonly timeframe: string;
  readonly growthRate: number;
  readonly rankChange: number;
}

export interface BookingActivity {
  readonly screenId: string;
  readonly timestamp: Date;
  readonly bookingType: string;
  readonly duration: number;
  readonly price: number;
  readonly userId?: string;
  readonly location: string;
}

export interface MarketInsights {
  readonly location: string;
  readonly totalScreens: number;
  readonly averagePrice: number;
  readonly topCategories: string[];
  readonly seasonalTrends: Record<string, number>;
  readonly competitiveIndex: number;
  readonly growthRate: number;
  readonly lastUpdated: Date;
}

// =============================================================================
// DEDUPLICATION TYPES
// =============================================================================

export interface DeduplicationEngine {
  removeDuplicates(sections: MarketplaceSection[]): Promise<MarketplaceSection[]>;
  assignScreenPriority(screen: EnhancedScreen, sections: string[]): Promise<string>;
  backfillSections(sections: MarketplaceSection[], availableScreens: EnhancedScreen[]): Promise<MarketplaceSection[]>;
}

export interface ScreenPriority {
  readonly screenId: string;
  readonly sectionPriorities: Record<string, number>;
  readonly finalAssignment: string;
  readonly confidence: number;
  readonly reasons: string[];
}

export interface DeduplicationResult {
  readonly sections: MarketplaceSection[];
  readonly duplicatesRemoved: number;
  readonly screensReassigned: number;
  readonly backfillsApplied: number;
  readonly processingTime: number;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface SectionEngagement {
  readonly sectionId: string;
  readonly viewTime: number;
  readonly clickCount: number;
  readonly scrollDepth: number;
  readonly conversionRate: number;
  readonly screenInteractions: Record<string, number>;
  readonly timestamp: Date;
}

export interface SectionMetrics {
  readonly sectionId: string;
  readonly impressions: number;
  readonly clicks: number;
  readonly conversions: number;
  readonly averageEngagementTime: number;
  readonly topPerformingScreens: string[];
  readonly userSegmentPerformance: Record<string, number>;
  readonly timeframe: { start: Date; end: Date };
}

export interface GroupingAnalytics {
  readonly userId?: string;
  readonly sessionId: string;
  readonly sectionsViewed: string[];
  readonly totalEngagementTime: number;
  readonly sectionsEngagement: SectionEngagement[];
  readonly conversionPath: string[];
  readonly timestamp: Date;
}

export interface AnalyticsEvent {
  readonly type: AnalyticsEventType;
  readonly userId: string;
  readonly sessionId: string;
  readonly sectionId?: string;
  readonly screenId?: string;
  readonly timestamp: Date;
  readonly data: Record<string, any>;
}

export type AnalyticsEventType = 
  | 'section_view_start'
  | 'section_view_end'
  | 'section_scroll'
  | 'screen_click'
  | 'screen_hover'
  | 'conversion'
  | 'section_engagement'
  | 'user_session_start'
  | 'user_session_end';

export interface ConversionEvent {
  readonly userId: string;
  readonly sessionId: string;
  readonly sectionId: string;
  readonly screenId: string;
  readonly conversionType: 'click' | 'purchase' | 'favorite' | 'share';
  readonly timestamp: Date;
  readonly value?: number;
  readonly metadata?: Record<string, any>;
}

export interface SectionPerformanceMetrics {
  readonly sectionId: string;
  readonly sectionName: string;
  readonly impressions: number;
  readonly uniqueViews: number;
  readonly totalViewTime: number;
  readonly averageViewTime: number;
  readonly clickThroughRate: number;
  readonly conversionRate: number;
  readonly scrollDepthAverage: number;
  readonly screenInteractions: ScreenInteractionSummary[];
  readonly timeframe: { start: Date; end: Date };
  readonly lastUpdated: Date;
}

export interface ScreenInteractionSummary {
  readonly screenId: string;
  readonly screenName: string;
  readonly position: number;
  readonly impressions: number;
  readonly clicks: number;
  readonly hoverTime: number;
  readonly conversionRate: number;
  readonly clickThroughRate: number;
}

export interface ABTestConfig {
  readonly testId: string;
  readonly testName: string;
  readonly description: string;
  readonly variants: ABTestVariant[];
  readonly trafficAllocation: Record<string, number>;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly status: 'draft' | 'running' | 'paused' | 'completed';
  readonly successMetrics: string[];
  readonly targetAudience?: ABTestAudience;
}

export interface ABTestVariant {
  readonly variantId: string;
  readonly name: string;
  readonly description: string;
  readonly sectionConfig: Partial<SectionConfig>;
  readonly trafficPercentage: number;
  readonly isControl: boolean;
}

export interface ABTestAudience {
  readonly userSegments: string[];
  readonly locations: string[];
  readonly deviceTypes: string[];
  readonly minInteractions: number;
  readonly excludeUsers: string[];
}

export interface ABTestResult {
  readonly testId: string;
  readonly variantResults: ABTestVariantResult[];
  readonly winner?: string;
  readonly confidence: number;
  readonly statisticalSignificance: boolean;
  readonly recommendations: string[];
  readonly generatedAt: Date;
}

export interface ABTestVariantResult {
  readonly variantId: string;
  readonly participants: number;
  readonly conversions: number;
  readonly conversionRate: number;
  readonly averageEngagementTime: number;
  readonly clickThroughRate: number;
  readonly bounceRate: number;
  readonly revenuePerUser: number;
  readonly confidence: number;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

export interface GroupingError {
  readonly code: string;
  readonly message: string;
  readonly context: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly recoveryStrategy?: string;
}

export interface FallbackStrategy {
  readonly type: 'default-sections' | 'popular-screens' | 'cached-results' | 'empty-state';
  readonly reason: string;
  readonly data?: unknown;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type SectionPriority = 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type RefreshStrategy = 'immediate' | 'background' | 'scheduled' | 'on-demand';

// =============================================================================
// TYPE GUARDS
// =============================================================================

export const isEnhancedScreen = (screen: Screen | EnhancedScreen): screen is EnhancedScreen => {
  return 'performanceMetrics' in screen && 'bookingFrequency' in screen;
};

export const isValidAlgorithmType = (algorithm: string): algorithm is AlgorithmType => {
  const validAlgorithms: AlgorithmType[] = [
    'ml-personalized', 'collaborative-filtering', 'content-based', 'trending-analysis',
    'geographic-popularity', 'recent-activity', 'purchase-history', 'new-discovery', 
    'other-users-buying', 'fallback-popular'
  ];
  return validAlgorithms.includes(algorithm as AlgorithmType);
};

export const isValidSectionDisplayType = (displayType: string): displayType is SectionDisplayType => {
  const validDisplayTypes: SectionDisplayType[] = [
    'horizontal-scroll', 'grid', 'featured', 'hero', 'compact-list'
  ];
  return validDisplayTypes.includes(displayType as SectionDisplayType);
};

export const isValidInteractionAction = (action: string): action is InteractionAction => {
  const validActions: InteractionAction[] = [
    'view', 'click', 'purchase', 'favorite', 'share', 'compare', 'filter', 'search', 'scroll', 'hover'
  ];
  return validActions.includes(action as InteractionAction);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const createEmptyUserProfile = (userId: string): UserProfile => ({
  userId,
  preferredCategories: [],
  budgetRange: { min: 0, max: Number.MAX_SAFE_INTEGER, preferred: 500000, currency: 'COP', confidence: 0 },
  locationPreferences: [],
  behaviorScore: 0,
  lastActivity: new Date(),
  interactionHistory: {
    totalInteractions: 0,
    averageSessionDuration: 0,
    mostActiveTimeOfDay: 12,
    preferredDeviceType: 'desktop',
    engagementRate: 0,
    lastInteractionDate: new Date()
  },
  purchaseProfile: {
    totalPurchases: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    preferredPurchaseType: [],
    seasonalPatterns: {},
    purchaseFrequency: 'low'
  },
  preferences: {
    notifications: {
      newScreens: true,
      priceDrops: true,
      recommendations: true,
      marketingEmails: false
    },
    display: {
      defaultViewMode: 'sectioned',
      cardsPerRow: 3,
      showPrices: true,
      showRatings: true,
      compactMode: false
    },
    privacy: {
      allowPersonalization: true,
      allowLocationTracking: false,
      allowBehaviorTracking: true,
      shareDataWithPartners: false
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: false
    }
  }
});

export const calculateConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score >= 0.8) return 'very-high';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  if (score >= 0.2) return 'low';
  return 'very-low';
};

export const getBookingFrequency = (bookingCount: number, timeframe: number): BookingFrequency => {
  const rate = bookingCount / timeframe;
  if (rate >= 10) return 'very-high';
  if (rate >= 5) return 'high';
  if (rate >= 2) return 'medium';
  if (rate >= 0.5) return 'low';
  return 'very-low';
};

export const enhanceScreen = (screen: Screen, metrics: ScreenPerformanceMetrics): EnhancedScreen => ({
  ...screen,
  performanceMetrics: metrics,
  bookingFrequency: getBookingFrequency(metrics.impressionCount, 30),
  engagementMetrics: {
    viewTime: 0,
    interactionRate: metrics.engagementScore,
    completionRate: metrics.conversionRate,
    shareRate: 0,
    favoriteRate: 0,
    clickThroughRate: 0,
    bounceRate: 0
  },
  audienceInsights: {
    primaryDemographic: 'general',
    ageDistribution: {},
    genderDistribution: {},
    interestCategories: [],
    peakEngagementHours: [9, 12, 18],
    seasonalTrends: {}
  }
});

// =============================================================================
// ERROR LOGGING TYPES
// =============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory = 
  | 'recommendation_service'
  | 'section_generation'
  | 'market_data'
  | 'user_experience'
  | 'performance'
  | 'cache'
  | 'api'
  | 'unknown';

export interface PerformanceThreshold {
  readonly sectionGeneration: number;
  readonly recommendationService: number;
  readonly marketDataService: number;
  readonly deduplication: number;
  readonly userBehaviorAnalysis: number;
  readonly cacheOperation: number;
  readonly [key: string]: number;
}

export interface UserExperienceError {
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

export interface PerformanceMetrics {
  readonly operation: string;
  readonly duration: number;
  readonly success: boolean;
  readonly timestamp: Date;
  readonly metadata?: Record<string, any>;
}

export interface ErrorRecoveryStrategy {
  readonly type: 'retry' | 'fallback' | 'cache' | 'default' | 'skip';
  readonly maxRetries?: number;
  readonly retryDelay?: number;
  readonly fallbackData?: any;
  readonly cacheKey?: string;
  readonly skipConditions?: string[];
}