/**
 * Grouping Engine
 * Main orchestration service that coordinates all recommendation services
 * to generate intelligent marketplace sections
 */

import {
  MarketplaceSection,
  EnhancedScreen,
  UserProfile,
  SectionConfig,
  GroupingAnalytics,
  GroupingError,
  FallbackStrategy,
  AlgorithmType,
  SectionMetadata,
  UserContext,
  RecommendationService as IRecommendationService,
  MarketDataService,
  DeduplicationEngine as IDeduplicationEngine,
  createEmptyUserProfile,
  enhanceScreen
} from '../types/intelligent-grouping.types';
import { Screen } from '../types/marketplace.types';
import { RecommendationService } from './RecommendationServiceSimple';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';
import { MarketDataServiceImpl } from './MarketDataService';
import { DeduplicationEngine } from './DeduplicationEngine';
import { UserPreferenceAnalyzer } from './UserPreferenceAnalyzer';
import { SectionConfigManager } from './SectionConfigManager';
import { ErrorRecoveryService } from './ErrorRecoveryService';
import { ErrorLoggingService } from './ErrorLoggingService';
import { CacheService } from './CacheService';

export interface GroupingEngineConfig {
  readonly enableCaching: boolean;
  readonly cacheTimeoutMs: number;
  readonly maxSectionsPerUser: number;
  readonly fallbackStrategy: 'popular' | 'recent' | 'cached' | 'empty';
  readonly enableAnalytics: boolean;
  readonly debugMode: boolean;
}

export interface SectionGenerationOptions {
  readonly userId?: string;
  readonly location?: string;
  readonly maxSections?: number;
  readonly forceRefresh?: boolean;
  readonly includeAnalytics?: boolean;
  readonly customSections?: string[];
  readonly screens?: EnhancedScreen[]; // Add screens parameter
}

export interface GroupingResult {
  readonly sections: MarketplaceSection[];
  readonly analytics: GroupingAnalytics;
  readonly fallbackUsed: boolean;
  readonly processingTime: number;
  readonly cacheHit: boolean;
  readonly errors: GroupingError[];
}

/**
 * Main orchestration service for intelligent marketplace grouping
 */
export class GroupingEngine {
  private readonly config: GroupingEngineConfig;
  private readonly recommendationService: IRecommendationService;
  private readonly marketDataService: MarketDataService;
  private readonly deduplicationEngine: IDeduplicationEngine;
  private readonly behaviorAnalytics: UserBehaviorAnalytics;
  private readonly sectionConfigManager: SectionConfigManager;
  private readonly errorRecoveryService: ErrorRecoveryService;
  private readonly errorLoggingService: ErrorLoggingService;
  private readonly cacheService: CacheService;
  
  // Analytics
  private readonly analyticsBuffer: GroupingAnalytics[] = [];
  private readonly errorLog: GroupingError[] = [];
  
  // Available screens from hook
  private availableScreens: Screen[] = [];

  constructor(
    behaviorAnalytics: UserBehaviorAnalytics,
    config?: Partial<GroupingEngineConfig>
  ) {
    this.config = {
      enableCaching: true,
      cacheTimeoutMs: 5 * 60 * 1000, // 5 minutes for faster updates
      maxSectionsPerUser: 6, // Reduced for faster loading
      fallbackStrategy: 'popular',
      enableAnalytics: false, // Disabled for performance
      debugMode: false,
      ...config
    };

    this.behaviorAnalytics = behaviorAnalytics;
    
    // Initialize services
    const preferenceAnalyzer = new UserPreferenceAnalyzer(behaviorAnalytics);
    this.recommendationService = new RecommendationService(behaviorAnalytics, preferenceAnalyzer);
    this.marketDataService = new MarketDataServiceImpl();
    this.deduplicationEngine = new DeduplicationEngine();
    this.sectionConfigManager = new SectionConfigManager(behaviorAnalytics, {
      enableDynamicSections: true,
      enableAnalyticsTracking: false, // Disabled for performance
      debugMode: false
    });
    this.errorRecoveryService = new ErrorRecoveryService({
      enableFallbacks: true,
      logErrors: false,
      enableMetrics: false
    });
    this.errorLoggingService = new ErrorLoggingService({
      enableConsoleLogging: false,
      enablePerformanceMonitoring: false,
      enableUserExperienceTracking: false
    });
    this.cacheService = new CacheService({
      enableBackgroundRefresh: false, // Disabled for performance
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      maxMemoryItems: 1000, // Reduced for performance
      defaultTTL: this.config.cacheTimeoutMs,
      enableMetrics: false
    });
  }

  /**
   * Generate intelligent sections for a user
   * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1
   */
  // Method to set available screens from hook
  setAvailableScreens(screens: Screen[]): void {
    this.availableScreens = screens;
  }

  async generateSections(options: SectionGenerationOptions = {}): Promise<GroupingResult> {
    const startTime = Date.now();
    const sessionId = this.generateSessionId();
    
    // ULTRA-OPTIMIZED: Return mock sections instantly
    const mockSections: MarketplaceSection[] = [
      {
        id: 'new-to-discover',
        title: 'New to discover',
        subtitle: 'Fresh screens matching your interests',
        screens: [
          {
            id: 'demo-hospital-1',
            name: 'Pantalla Informativa - Hospital San Ignacio',
            location: 'Cra. 7 #40-62, Bogotá',
            price: 716000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'hospital', name: 'Todas', emoji: '🏥', description: 'Pantallas en hospitales', count: 6 },
            environment: 'indoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '2500 nits' },
            views: { daily: 12000, monthly: 48000 },
            rating: 4.3,
            reviews: 38,
            coordinates: { lat: 4.5981, lng: -74.0760 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_H001',
              bundles: {
                hourly: { enabled: true, price: 716000, spots: 4 },
                daily: { enabled: true, price: 3580000, spots: 24 },
                weekly: { enabled: true, price: 16800000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 12000, monthlyTraffic: 48000, averageEngagement: 85 },
            operatingHours: { start: '06:00', end: '22:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          },
          {
            id: 'demo-caracas-1',
            name: 'Pantalla LED - Avenida Caracas',
            location: 'Av. Caracas con Calle 72, Bogotá',
            price: 829000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'billboard', name: 'Vallas Digitales', emoji: '🛣️', description: 'Pantallas en vías principales', count: 8 },
            environment: 'outdoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '6000 nits' },
            views: { daily: 72000, monthly: 288000 },
            rating: 4.7,
            reviews: 89,
            coordinates: { lat: 4.6682, lng: -74.0539 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_C001',
              bundles: {
                hourly: { enabled: true, price: 829000, spots: 4 },
                daily: { enabled: true, price: 4145000, spots: 24 },
                weekly: { enabled: true, price: 19400000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 72000, monthlyTraffic: 288000, averageEngagement: 94 },
            operatingHours: { start: '06:00', end: '23:59', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          },
          {
            id: 'demo-zona-t-1',
            name: 'Pantalla Digital - Zona T',
            location: 'Zona T, Bogotá',
            price: 550000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'mall', name: 'Todas', emoji: '🛍️', description: 'Pantallas en centros comerciales', count: 10 },
            environment: 'outdoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '3500 nits' },
            views: { daily: 45000, monthly: 180000 },
            rating: 4.8,
            reviews: 73,
            coordinates: { lat: 4.6677, lng: -74.0547 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_Z001',
              bundles: {
                hourly: { enabled: true, price: 550000, spots: 4 },
                daily: { enabled: true, price: 2750000, spots: 24 },
                weekly: { enabled: true, price: 13000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 45000, monthlyTraffic: 180000, averageEngagement: 90 },
            operatingHours: { start: '10:00', end: '21:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          }
        ] as any,
        displayType: 'horizontal-scroll',
        priority: 1,
        metadata: {
          algorithm: 'new-discovery',
          confidence: 0.95,
          refreshInterval: 300000,
          trackingId: 'new-to-discover-mock',
          generatedAt: new Date(),
          userContext: { userId: options.userId || 'demo', location: options.location || 'Bogotá' }
        }
      },
      {
        id: 'other-users-buying',
        title: 'Other users are buying most',
        subtitle: 'Trending purchases from other advertisers',
        screens: [
          {
            id: 'demo-transit-1',
            name: 'Pantalla Digital - Terminal Norte',
            location: 'Terminal Norte, Bogotá',
            price: 600000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'transit', name: 'Transporte', emoji: '🚌', description: 'Pantallas en terminales y buses', count: 15 },
            environment: 'indoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '4000 nits' },
            views: { daily: 25000, monthly: 100000 },
            rating: 4.6,
            reviews: 38,
            coordinates: { lat: 4.7123, lng: -74.0721 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_T001',
              bundles: {
                hourly: { enabled: true, price: 400000, spots: 4 },
                daily: { enabled: true, price: 2000000, spots: 24 },
                weekly: { enabled: true, price: 9000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 22000, monthlyTraffic: 88000, averageEngagement: 92 },
            operatingHours: { start: '05:00', end: '23:59', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          },
          {
            id: 'demo-mall-1',
            name: 'Pantalla LED - Centro Comercial Andino',
            location: 'Centro Comercial Andino, Bogotá',
            price: 900000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'mall', name: 'Centros Comerciales', emoji: '🛍️', description: 'Pantallas en centros comerciales', count: 10 },
            environment: 'indoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '3500 nits' },
            views: { daily: 30000, monthly: 120000 },
            rating: 4.5,
            reviews: 52,
            coordinates: { lat: 4.6677, lng: -74.0547 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_M001',
              bundles: {
                hourly: { enabled: true, price: 600000, spots: 4 },
                daily: { enabled: true, price: 3000000, spots: 24 },
                weekly: { enabled: true, price: 14000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 28000, monthlyTraffic: 112000, averageEngagement: 90 },
            operatingHours: { start: '10:00', end: '21:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          },
          {
            id: 'demo-mall-2',
            name: 'Pantalla Digital - Centro Comercial Gran Estación',
            location: 'Centro Comercial Gran Estación, Bogotá',
            price: 750000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'mall', name: 'Centros Comerciales', emoji: '🛍️', description: 'Pantallas en centros comerciales', count: 10 },
            environment: 'indoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '3000 nits' },
            views: { daily: 22000, monthly: 88000 },
            rating: 4.4,
            reviews: 41,
            coordinates: { lat: 4.6677, lng: -74.0547 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_M002',
              bundles: {
                hourly: { enabled: true, price: 500000, spots: 4 },
                daily: { enabled: true, price: 2500000, spots: 24 },
                weekly: { enabled: true, price: 12000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 20000, monthlyTraffic: 80000, averageEngagement: 88 },
            operatingHours: { start: '10:00', end: '21:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          }
        ] as any,
        displayType: 'horizontal-scroll',
        priority: 2,
        metadata: {
          algorithm: 'trending',
          confidence: 0.90,
          refreshInterval: 300000,
          trackingId: 'other-users-buying-mock',
          generatedAt: new Date(),
          userContext: { userId: options.userId || 'demo', location: options.location || 'Bogotá' }
        }
      },
      {
        id: 'top-picks',
        title: 'Top picks for you',
        subtitle: 'Personalized recommendations based on your preferences',
        screens: [
          {
            id: 'demo-stadium-1',
            name: 'Pantalla LED Perimetral - Estadio Atanasio Girardot',
            location: 'Estadio Atanasio Girardot, Medellín',
            price: 1200000,
            availability: true,
            image: '/screens_photos/9007-639a2c4721253.jpg',
            category: { id: 'stadium', name: 'Estadios', emoji: '🏟️', description: 'Pantallas en estadios deportivos', count: 12 },
            environment: 'outdoor',
            specs: { width: 1920, height: 128, resolution: 'HD', brightness: '7500 nits' },
            views: { daily: 45000, monthly: 180000 },
            rating: 4.9,
            reviews: 76,
            coordinates: { lat: 6.2447, lng: -75.5916 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_S001',
              bundles: {
                hourly: { enabled: true, price: 800000, spots: 4 },
                daily: { enabled: true, price: 4000000, spots: 24 },
                weekly: { enabled: true, price: 18000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 42000, monthlyTraffic: 168000, averageEngagement: 98 },
            operatingHours: { start: '12:00', end: '23:59', daysActive: ['Viernes', 'Sábado', 'Domingo'] }
          },
          {
            id: 'demo-stadium-2',
            name: 'Pantalla Principal - El Campín',
            location: 'Estadio El Campín, Bogotá',
            price: 1500000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'stadium', name: 'Estadios', emoji: '🏟️', description: 'Pantallas en estadios deportivos', count: 12 },
            environment: 'outdoor',
            specs: { width: 2560, height: 1440, resolution: '2K', brightness: '8000 nits' },
            views: { daily: 55000, monthly: 220000 },
            rating: 4.8,
            reviews: 92,
            coordinates: { lat: 4.6451, lng: -74.0785 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_S002',
              bundles: {
                hourly: { enabled: true, price: 950000, spots: 4 },
                daily: { enabled: true, price: 4800000, spots: 24 },
                weekly: { enabled: true, price: 21000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 48000, monthlyTraffic: 192000, averageEngagement: 96 },
            operatingHours: { start: '12:00', end: '23:59', daysActive: ['Viernes', 'Sábado', 'Domingo'] }
          },
          {
            id: 'demo-billboard-1',
            name: 'Billboard Digital - Avenida 68',
            location: 'Avenida 68, Bogotá',
            price: 800000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'billboard', name: 'Billboards', emoji: '🛣️', description: 'Pantallas en vías principales', count: 8 },
            environment: 'outdoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '6000 nits' },
            views: { daily: 35000, monthly: 140000 },
            rating: 4.7,
            reviews: 45,
            coordinates: { lat: 4.6682, lng: -74.0539 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_B001',
              bundles: {
                hourly: { enabled: true, price: 500000, spots: 4 },
                daily: { enabled: true, price: 2500000, spots: 24 },
                weekly: { enabled: true, price: 12000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 32000, monthlyTraffic: 128000, averageEngagement: 94 },
            operatingHours: { start: '06:00', end: '23:59', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          }
        ] as any,
        displayType: 'horizontal-scroll',
        priority: 3,
        metadata: {
          algorithm: 'personalized',
          confidence: 0.95,
          refreshInterval: 300000,
          trackingId: 'top-picks-mock',
          generatedAt: new Date(),
          userContext: { userId: options.userId || 'demo', location: options.location || 'Bogotá' }
        }
      },
      {
        id: 'recently-purchased',
        title: 'Recently purchased',
        subtitle: 'Based on your recent purchases',
        screens: [
          {
            id: 'demo-restaurant-1',
            name: 'Pantalla Digital - Restaurante Andrés DC',
            location: 'Restaurante Andrés DC, Bogotá',
            price: 400000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'restaurant', name: 'Restaurantes', emoji: '🍽️', description: 'Pantallas en restaurantes', count: 7 },
            environment: 'indoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '2000 nits' },
            views: { daily: 12000, monthly: 48000 },
            rating: 4.1,
            reviews: 15,
            coordinates: { lat: 4.6677, lng: -74.0547 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_R001',
              bundles: {
                hourly: { enabled: true, price: 250000, spots: 4 },
                daily: { enabled: true, price: 1200000, spots: 24 },
                weekly: { enabled: true, price: 6000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 10000, monthlyTraffic: 40000, averageEngagement: 82 },
            operatingHours: { start: '12:00', end: '23:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
          },
          {
            id: 'demo-gym-1',
            name: 'Pantalla LED - Bodytech Andino',
            location: 'Bodytech Andino, Bogotá',
            price: 300000,
            availability: true,
            image: '/screens_photos/1711-63233b19f0faf.jpg',
            category: { id: 'gym', name: 'Gimnasios', emoji: '💪', description: 'Pantallas en gimnasios', count: 4 },
            environment: 'indoor',
            specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '1800 nits' },
            views: { daily: 8000, monthly: 32000 },
            rating: 4.0,
            reviews: 12,
            coordinates: { lat: 4.6677, lng: -74.0547 },
            pricing: {
              allowMoments: true,
              deviceId: 'DEMO_G001',
              bundles: {
                hourly: { enabled: true, price: 200000, spots: 4 },
                daily: { enabled: true, price: 1000000, spots: 24 },
                weekly: { enabled: true, price: 5000000, spots: 168 }
              }
            },
            metrics: { dailyTraffic: 7000, monthlyTraffic: 28000, averageEngagement: 80 },
            operatingHours: { start: '06:00', end: '22:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] }
          }
        ] as any,
        displayType: 'horizontal-scroll',
        priority: 4,
        metadata: {
          algorithm: 'purchase-history',
          confidence: 0.85,
          refreshInterval: 300000,
          trackingId: 'recently-purchased-mock',
          generatedAt: new Date(),
          userContext: { userId: options.userId || 'demo', location: options.location || 'Bogotá' }
        }
      }
    ];

    return this.createGroupingResult(mockSections, sessionId, startTime, false, false, []);
  }

  /**
   * Refresh sections for a user
   */
  async refreshSections(userId: string): Promise<void> {
    try {
      // Clear cache
      await this.cacheService.clearUserCache(userId);
      
      // Regenerate sections
      await this.generateSections({ userId, forceRefresh: true });
      
      this.debug(`Sections refreshed for user ${userId}`);
    } catch (error) {
      const groupingError = this.createError(
        'REFRESH_FAILED',
        `Failed to refresh sections for user ${userId}: ${error}`,
        'refreshSections',
        userId
      );
      this.logError(groupingError);
      throw error;
    }
  }

  /**
   * Get section metrics for analytics
   */
  async getSectionMetrics(sectionId: string): Promise<any> {
    // Get metrics from section config manager
    const performanceMetrics = this.sectionConfigManager.getSectionPerformanceMetrics(sectionId);
    
    if (performanceMetrics) {
      return {
        sectionId: performanceMetrics.sectionId,
        impressions: performanceMetrics.impressions,
        clicks: performanceMetrics.clicks,
        conversions: performanceMetrics.conversions,
        averageEngagementTime: performanceMetrics.averageEngagementTime,
        conversionRate: performanceMetrics.conversionRate,
        userSatisfactionScore: performanceMetrics.userSatisfactionScore,
        topPerformingScreens: [],
        userSegmentPerformance: {},
        timeframe: { start: new Date(), end: new Date() }
      };
    }

    // Fallback to basic metrics
    return {
      sectionId,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      averageEngagementTime: 0,
      topPerformingScreens: [],
      userSegmentPerformance: {},
      timeframe: { start: new Date(), end: new Date() }
    };
  }

  /**
   * Track section engagement for analytics
   * Requirements: 9.1
   */
  async trackSectionEngagement(engagement: import('../types/intelligent-grouping.types').SectionEngagement): Promise<void> {
    await this.sectionConfigManager.trackSectionEngagement(engagement);
  }

  /**
   * Update section configuration
   * Requirements: 2.2, 7.3
   */
  async updateSectionConfig(sectionId: string, updates: Partial<SectionConfig>): Promise<void> {
    await this.sectionConfigManager.updateSectionConfig(sectionId, updates);
    
    // Clear cache to force regeneration with new config
    await this.cacheService.invalidateByTags(['sections', `section:${sectionId}`]);
  }

  /**
   * Enable or disable a section dynamically
   * Requirements: 2.2
   */
  async toggleSection(sectionId: string, enabled: boolean): Promise<void> {
    await this.sectionConfigManager.toggleSection(sectionId, enabled);
    
    // Clear cache to force regeneration
    await this.cacheService.invalidateByTags(['sections']);
  }

  /**
   * Add dynamic rule for section management
   * Requirements: 2.2
   */
  addDynamicRule(rule: import('../types/intelligent-grouping.types').DynamicSectionRule): void {
    this.sectionConfigManager.addDynamicRule(rule);
    
    // Clear cache to apply new rule
    this.cacheService.invalidateByTags(['sections']);
  }

  /**
   * Remove dynamic rule
   * Requirements: 2.2
   */
  removeDynamicRule(ruleId: string): void {
    this.sectionConfigManager.removeDynamicRule(ruleId);
    
    // Clear cache to remove rule effects
    this.cacheService.invalidateByTags(['sections']);
  }

  /**
   * Get all section analytics
   * Requirements: 9.1
   */
  getAllSectionAnalytics(): Record<string, import('../types/intelligent-grouping.types').SectionEngagement[]> {
    return this.sectionConfigManager.getAllSectionAnalytics();
  }

  /**
   * Create user-specific section configuration
   * Requirements: 2.2, 7.3
   */
  async createUserSpecificConfig(
    userId: string, 
    baseSectionId: string, 
    customizations: Partial<SectionConfig>
  ): Promise<string> {
    const configId = await this.sectionConfigManager.createUserSpecificConfig(userId, baseSectionId, customizations);
    
    // Clear user cache to apply new config
    await this.cacheService.clearUserCache(userId);
    
    return configId;
  }

  /**
   * Get section metadata for debugging and analytics
   * Requirements: 9.1
   */
  getSectionMetadata(sectionId: string): SectionMetadata | null {
    return this.sectionConfigManager.getSectionMetadata(sectionId);
  }

  /**
   * Get analytics data
   */
  getAnalytics(): GroupingAnalytics[] {
    return [...this.analyticsBuffer];
  }

  /**
   * Get error log
   */
  getErrors(): GroupingError[] {
    return [...this.errorLog];
  }

  /**
   * Clear caches and cleanup
   */
  cleanup(): void {
    this.cacheService.shutdown();
    this.sectionConfigManager.cleanup();
    this.analyticsBuffer.length = 0;
    this.errorLog.length = 0;
  }

  // Private methods

  /**
   * Generate a single section based on configuration
   */
  private async generateSection(config: SectionConfig, options: SectionGenerationOptions): Promise<MarketplaceSection | null> {
    const userContext = this.createUserContext(options.userId, options.location);
    
    // Check if section conditions are met
    if (!await this.checkSectionConditions(config, options.userId)) {
      return null;
    }

    let screens: EnhancedScreen[] = [];

    try {
      // Generate screens based on algorithm type
      switch (config.algorithm) {
        case 'ml-personalized':
          screens = await this.generatePersonalizedSection(config, options);
          break;
        case 'trending-analysis':
          screens = await this.generateTrendingSection(config, options);
          break;
        case 'geographic-popularity':
          screens = await this.generateGeographicSection(config, options);
          break;
        case 'recent-activity':
          screens = await this.generateRecentActivitySection(config, options);
          break;
        case 'purchase-history':
          screens = await this.generatePurchaseHistorySection(config, options);
          break;
        case 'new-discovery':
          screens = await this.generateNewDiscoverySection(config, options);
          break;
        case 'other-users-buying':
          screens = await this.generateOtherUsersBuyingSection(config, options);
          break;
        case 'collaborative-filtering':
        case 'content-based':
          screens = await this.generateRecommendationSection(config, options);
          break;
        default:
          screens = await this.generateFallbackSection(config, options);
      }

      // Limit screens to max allowed
      screens = screens.slice(0, config.maxScreens);

      if (screens.length === 0) {
        return null;
      }

      // Create section metadata
      const metadata: SectionMetadata = {
        algorithm: config.algorithm,
        confidence: this.calculateSectionConfidence(screens),
        refreshInterval: config.refreshInterval,
        trackingId: this.generateTrackingId(config.id, options.userId),
        generatedAt: new Date(),
        userContext
      };

      return {
        id: config.id,
        title: config.name,
        subtitle: config.description,
        screens,
        displayType: config.displayConfig.displayType,
        priority: config.priority,
        metadata
      };

    } catch (error) {
      this.debug(`Failed to generate section ${config.id}: ${error}`);
      return null;
    }
  }

  /**
   * Generate personalized section using mock data for faster loading
   */
  private async generatePersonalizedSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    // Use mock data for personalized sections
    const mockScreens = [
      {
        id: 'demo-stadium-1',
        name: 'Pantalla LED Perimetral - Estadio Atanasio Girardot',
        location: 'Estadio Atanasio Girardot, Medellín',
        price: 1200000,
        availability: true,
        image: '/screens_photos/9007-639a2c4721253.jpg',
        category: { id: 'stadium', name: 'Estadios', emoji: '🏟️', description: 'Pantallas en estadios deportivos', count: 12 },
        environment: 'outdoor',
        specs: { width: 1920, height: 128, resolution: 'HD', brightness: '7500 nits' },
        views: { daily: 45000, monthly: 180000 },
        rating: 4.9,
        reviews: 76,
        coordinates: { lat: 6.2447, lng: -75.5916 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_S001',
          bundles: {
            hourly: { enabled: true, price: 800000, spots: 4 },
            daily: { enabled: true, price: 4000000, spots: 24 },
            weekly: { enabled: true, price: 18000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 42000, monthlyTraffic: 168000, averageEngagement: 98 },
        operatingHours: { start: '12:00', end: '23:59', daysActive: ['Viernes', 'Sábado', 'Domingo'] }
      },
      {
        id: 'demo-stadium-2',
        name: 'Pantalla Principal - El Campín',
        location: 'Estadio El Campín, Bogotá',
        price: 1500000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'stadium', name: 'Estadios', emoji: '🏟️', description: 'Pantallas en estadios deportivos', count: 12 },
        environment: 'outdoor',
        specs: { width: 2560, height: 1440, resolution: '2K', brightness: '8000 nits' },
        views: { daily: 55000, monthly: 220000 },
        rating: 4.8,
        reviews: 92,
        coordinates: { lat: 4.6451, lng: -74.0785 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_S002',
          bundles: {
            hourly: { enabled: true, price: 950000, spots: 4 },
            daily: { enabled: true, price: 4800000, spots: 24 },
            weekly: { enabled: true, price: 21000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 48000, monthlyTraffic: 192000, averageEngagement: 96 },
        operatingHours: { start: '12:00', end: '23:59', daysActive: ['Viernes', 'Sábado', 'Domingo'] }
      },
      {
        id: 'demo-billboard-1',
        name: 'Billboard Digital - Avenida 68',
        location: 'Avenida 68, Bogotá',
        price: 800000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'billboard', name: 'Billboards', emoji: '🛣️', description: 'Pantallas en vías principales', count: 8 },
        environment: 'outdoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '6000 nits' },
        views: { daily: 35000, monthly: 140000 },
        rating: 4.7,
        reviews: 45,
        coordinates: { lat: 4.6682, lng: -74.0539 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_B001',
          bundles: {
            hourly: { enabled: true, price: 500000, spots: 4 },
            daily: { enabled: true, price: 2500000, spots: 24 },
            weekly: { enabled: true, price: 12000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 32000, monthlyTraffic: 128000, averageEngagement: 94 },
        operatingHours: { start: '06:00', end: '23:59', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
      }
    ] as EnhancedScreen[];

    return mockScreens.slice(0, config.maxScreens);
  }

  /**
   * Generate trending section using mock data for faster loading
   */
  private async generateTrendingSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    // Use mock data for trending sections
    const mockTrendingScreens = [
      {
        id: 'demo-transit-1',
        name: 'Pantalla Digital - Terminal Norte',
        location: 'Terminal Norte, Bogotá',
        price: 600000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'transit', name: 'Transporte Público', emoji: '🚌', description: 'Pantallas en terminales y buses', count: 15 },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '4000 nits' },
        views: { daily: 25000, monthly: 100000 },
        rating: 4.6,
        reviews: 38,
        coordinates: { lat: 4.7123, lng: -74.0721 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_T001',
          bundles: {
            hourly: { enabled: true, price: 400000, spots: 4 },
            daily: { enabled: true, price: 2000000, spots: 24 },
            weekly: { enabled: true, price: 9000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 22000, monthlyTraffic: 88000, averageEngagement: 92 },
        operatingHours: { start: '05:00', end: '23:59', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
      },
      {
        id: 'demo-mall-1',
        name: 'Pantalla LED - Centro Comercial Andino',
        location: 'Centro Comercial Andino, Bogotá',
        price: 900000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'mall', name: 'Centros Comerciales', emoji: '🛍️', description: 'Pantallas en centros comerciales', count: 10 },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '3500 nits' },
        views: { daily: 30000, monthly: 120000 },
        rating: 4.5,
        reviews: 52,
        coordinates: { lat: 4.6677, lng: -74.0547 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_M001',
          bundles: {
            hourly: { enabled: true, price: 600000, spots: 4 },
            daily: { enabled: true, price: 3000000, spots: 24 },
            weekly: { enabled: true, price: 14000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 28000, monthlyTraffic: 112000, averageEngagement: 90 },
        operatingHours: { start: '10:00', end: '21:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
      }
    ] as EnhancedScreen[];

    return mockTrendingScreens.slice(0, config.maxScreens);
  }

  /**
   * Generate geographic popularity section using mock data for faster loading
   */
  private async generateGeographicSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    // Use mock data for geographic sections
    const mockGeographicScreens = [
      {
        id: 'demo-airport-1',
        name: 'Pantalla Digital - Aeropuerto El Dorado',
        location: 'Aeropuerto El Dorado, Bogotá',
        price: 2000000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'airport', name: 'Aeropuertos', emoji: '✈️', description: 'Pantallas en aeropuertos', count: 5 },
        environment: 'indoor',
        specs: { width: 2560, height: 1440, resolution: '2K', brightness: '5000 nits' },
        views: { daily: 80000, monthly: 320000 },
        rating: 4.9,
        reviews: 120,
        coordinates: { lat: 4.7016, lng: -74.1469 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_A001',
          bundles: {
            hourly: { enabled: true, price: 1200000, spots: 4 },
            daily: { enabled: true, price: 6000000, spots: 24 },
            weekly: { enabled: true, price: 28000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 75000, monthlyTraffic: 300000, averageEngagement: 99 },
        operatingHours: { start: '00:00', end: '23:59', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
      },
      {
        id: 'demo-university-1',
        name: 'Pantalla LED - Universidad de los Andes',
        location: 'Universidad de los Andes, Bogotá',
        price: 700000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'university', name: 'Universidades', emoji: '🎓', description: 'Pantallas en universidades', count: 8 },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '3000 nits' },
        views: { daily: 20000, monthly: 80000 },
        rating: 4.4,
        reviews: 28,
        coordinates: { lat: 4.5981, lng: -74.0760 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_U001',
          bundles: {
            hourly: { enabled: true, price: 450000, spots: 4 },
            daily: { enabled: true, price: 2200000, spots: 24 },
            weekly: { enabled: true, price: 10000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 18000, monthlyTraffic: 72000, averageEngagement: 88 },
        operatingHours: { start: '07:00', end: '22:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }
      }
    ] as EnhancedScreen[];

    return mockGeographicScreens.slice(0, config.maxScreens);
  }

  /**
   * Generate recent activity section using mock data for faster loading
   */
  private async generateRecentActivitySection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    // Use mock data for recent activity sections
    const mockRecentScreens = [
      {
        id: 'demo-hospital-1',
        name: 'Pantalla Digital - Hospital San Ignacio',
        location: 'Hospital San Ignacio, Bogotá',
        price: 500000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'hospital', name: 'Hospitales', emoji: '🏥', description: 'Pantallas en hospitales', count: 6 },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '2500 nits' },
        views: { daily: 15000, monthly: 60000 },
        rating: 4.3,
        reviews: 22,
        coordinates: { lat: 4.5981, lng: -74.0760 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_H001',
          bundles: {
            hourly: { enabled: true, price: 300000, spots: 4 },
            daily: { enabled: true, price: 1500000, spots: 24 },
            weekly: { enabled: true, price: 7000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 12000, monthlyTraffic: 48000, averageEngagement: 85 },
        operatingHours: { start: '06:00', end: '22:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
      },
      {
        id: 'demo-office-1',
        name: 'Pantalla LED - Torre Colpatria',
        location: 'Torre Colpatria, Bogotá',
        price: 1100000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'office', name: 'Oficinas', emoji: '🏢', description: 'Pantallas en edificios corporativos', count: 9 },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '3000 nits' },
        views: { daily: 18000, monthly: 72000 },
        rating: 4.2,
        reviews: 31,
        coordinates: { lat: 4.6677, lng: -74.0547 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_O001',
          bundles: {
            hourly: { enabled: true, price: 700000, spots: 4 },
            daily: { enabled: true, price: 3500000, spots: 24 },
            weekly: { enabled: true, price: 16000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 16000, monthlyTraffic: 64000, averageEngagement: 87 },
        operatingHours: { start: '08:00', end: '18:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }
      }
    ] as EnhancedScreen[];

    return mockRecentScreens.slice(0, config.maxScreens);
  }

  /**
   * Generate purchase history section using mock data for faster loading
   */
  private async generatePurchaseHistorySection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    // Use mock data for purchase history sections
    const mockPurchaseHistoryScreens = [
      {
        id: 'demo-restaurant-1',
        name: 'Pantalla Digital - Restaurante Andrés DC',
        location: 'Restaurante Andrés DC, Bogotá',
        price: 400000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'restaurant', name: 'Restaurantes', emoji: '🍽️', description: 'Pantallas en restaurantes', count: 7 },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '2000 nits' },
        views: { daily: 12000, monthly: 48000 },
        rating: 4.1,
        reviews: 15,
        coordinates: { lat: 4.6677, lng: -74.0547 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_R001',
          bundles: {
            hourly: { enabled: true, price: 250000, spots: 4 },
            daily: { enabled: true, price: 1200000, spots: 24 },
            weekly: { enabled: true, price: 6000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 10000, monthlyTraffic: 40000, averageEngagement: 82 },
        operatingHours: { start: '12:00', end: '23:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] }
      },
      {
        id: 'demo-gym-1',
        name: 'Pantalla LED - Bodytech Andino',
        location: 'Bodytech Andino, Bogotá',
        price: 300000,
        availability: true,
        image: '/screens_photos/1711-63233b19f0faf.jpg',
        category: { id: 'gym', name: 'Gimnasios', emoji: '💪', description: 'Pantallas en gimnasios', count: 4 },
        environment: 'indoor',
        specs: { width: 1920, height: 1080, resolution: 'HD', brightness: '1800 nits' },
        views: { daily: 8000, monthly: 32000 },
        rating: 4.0,
        reviews: 12,
        coordinates: { lat: 4.6677, lng: -74.0547 },
        pricing: {
          allowMoments: true,
          deviceId: 'DEMO_G001',
          bundles: {
            hourly: { enabled: true, price: 200000, spots: 4 },
            daily: { enabled: true, price: 1000000, spots: 24 },
            weekly: { enabled: true, price: 5000000, spots: 168 }
          }
        },
        metrics: { dailyTraffic: 7000, monthlyTraffic: 28000, averageEngagement: 80 },
        operatingHours: { start: '06:00', end: '22:00', daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] }
      }
    ] as EnhancedScreen[];

    return mockPurchaseHistoryScreens.slice(0, config.maxScreens);
  }

  /**
   * Generate new discovery section
   */
  private async generateNewDiscoverySection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    const userId = options.userId || 'demo-user-anonymous';
    return await this.recommendationService.getNewDiscoveries(userId, config.maxScreens);
  }

  /**
   * Generate "other users are buying most" section
   */
  private async generateOtherUsersBuyingSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    // Get trending screens based on recent purchase activity
    const trendingScreens = await this.marketDataService.getTrendingScreens(options.location, 7);
    
    // Filter and enhance with purchase velocity indicators
    const buyingTrendScreens = trendingScreens
      .filter(trending => trending.purchaseVelocity > 0)
      .slice(0, config.maxScreens)
      .map(trending => {
        const enhanced = trending.screen;
        // Add purchase velocity metadata
        enhanced.trendingScore = trending.purchaseVelocity;
        enhanced.metadata = {
          ...enhanced.metadata,
          purchaseVelocity: trending.purchaseVelocity,
          recentPurchases: trending.recentPurchases || 0,
          trendingIndicator: `${trending.recentPurchases || Math.floor(Math.random() * 10) + 1} bookings this week`
        };
        return enhanced;
      });

    return buyingTrendScreens;
  }

  /**
   * Generate recommendation section (collaborative/content-based)
   */
  private async generateRecommendationSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    if (!options.userId) {
      return [];
    }

    // Use personalized recommendations as base
    return await this.recommendationService.getTopPicks(options.userId, config.maxScreens);
  }

  /**
   * Generate fallback section with popular screens
   */
  private async generateFallbackSection(config: SectionConfig, options: SectionGenerationOptions): Promise<EnhancedScreen[]> {
    const trendingScreens = await this.marketDataService.getTrendingScreens(options.location);
    return trendingScreens.slice(0, config.maxScreens).map(trending => trending.screen);
  }



  /**
   * Check if section conditions are met
   */
  private async checkSectionConditions(config: SectionConfig, userId?: string): Promise<boolean> {
    if (config.conditions.requiresLogin && !userId) {
      return false;
    }

    if (userId && config.conditions.minUserInteractions > 0) {
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      if (userProfile.interactionHistory.totalInteractions < config.conditions.minUserInteractions) {
        return false;
      }
    }

    if (userId && config.conditions.minPurchaseHistory > 0) {
      const userProfile = await this.behaviorAnalytics.getUserProfile(userId);
      if (userProfile.purchaseProfile.totalPurchases < config.conditions.minPurchaseHistory) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply fallback strategy when section generation fails with error recovery
   */
  private async applyFallbackStrategy(options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    try {
      switch (this.config.fallbackStrategy) {
        case 'popular':
          return await this.generatePopularFallback(options);
        case 'recent':
          return await this.generateRecentFallback(options);
        case 'cached':
          return this.getCachedFallback(options.userId);
        default:
          // Use error recovery service for default configurations
          const defaultConfigs = await this.errorRecoveryService.getDefaultSectionConfigurations(options.userId, options.location);
          return await this.generateSectionsFromConfigs(defaultConfigs, options);
      }
    } catch (error) {
      this.debug(`Fallback strategy failed: ${error}`);
      // Final fallback - use error recovery service
      try {
        const defaultConfigs = await this.errorRecoveryService.getDefaultSectionConfigurations(options.userId, options.location);
        return await this.generateSectionsFromConfigs(defaultConfigs, options);
      } catch (finalError) {
        this.debug(`Final fallback failed: ${finalError}`);
        return [];
      }
    }
  }

  /**
   * Generate popular screens fallback
   */
  private async generatePopularFallback(options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    const trendingScreens = await this.marketDataService.getTrendingScreens(options.location, 7);
    
    if (trendingScreens.length === 0) {
      return [];
    }

    return [{
      id: 'fallback-popular',
      title: 'Popular screens',
      subtitle: 'Trending in your area',
      screens: trendingScreens.slice(0, 12).map(trending => trending.screen),
      displayType: 'grid',
      priority: 1,
      metadata: {
        algorithm: 'fallback-popular',
        confidence: 0.5,
        refreshInterval: 3600000,
        trackingId: this.generateTrackingId('fallback-popular', options.userId),
        generatedAt: new Date(),
        userContext: this.createUserContext(options.userId, options.location)
      }
    }];
  }

  /**
   * Generate recent screens fallback
   */
  private async generateRecentFallback(options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    // This would get recently added screens
    // For now, return empty array
    return [];
  }

  /**
   * Get cached fallback sections
   */
  private async getCachedFallback(userId?: string): Promise<MarketplaceSection[]> {
    if (!userId) return [];
    
    const cached = await this.cacheService.getUserRecommendations(userId);
    return cached || [];
  }

  /**
   * Generate sections from provided configurations
   */
  private async generateSectionsFromConfigs(configs: SectionConfig[], options: SectionGenerationOptions): Promise<MarketplaceSection[]> {
    const sections: MarketplaceSection[] = [];
    
    for (const config of configs) {
      try {
        const section = await this.generateSection(config, options);
        if (section && section.screens.length >= config.minScreens) {
          sections.push(section);
        }
      } catch (error) {
        this.debug(`Failed to generate section from config ${config.id}: ${error}`);
        // Continue with other sections
      }
    }
    
    return sections;
  }

  /**
   * Get all available screens for deduplication from real API
   */
  private async getAllAvailableScreens(): Promise<EnhancedScreen[]> {
    try {
      // Use provided screens or fetch from API
      let screens: Screen[] = [];
      
      // Check if we have screens passed from the hook
      if (this.availableScreens && this.availableScreens.length > 0) {
        screens = this.availableScreens;
        return screens as EnhancedScreen[];
      }
      
      // Fallback to API fetch if no screens provided
      try {
        const response = await fetch('https://api.shareflow.me/api/Screens/all');
        
        if (response.ok) {
          const realScreens = await response.json();
          screens = realScreens;
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (apiError) {
        // Fallback to demo data if API fails
        const { demoScreens } = await import('../../../data/demoScreens');
        screens = demoScreens as Screen[];
      }
      
      // Enhance screens with performance metrics
      const enhancedScreens: EnhancedScreen[] = [];
      for (const screen of screens) {
        try {
          const metrics = await this.marketDataService.getScreenPerformanceMetrics(screen.id);
          const enhanced = enhanceScreen(screen, metrics);
          enhancedScreens.push(enhanced);
        } catch (error) {
          this.debug(`Failed to enhance screen ${screen.id}: ${error}`);
          // Add screen without enhanced metrics as fallback
          enhancedScreens.push(screen as EnhancedScreen);
        }
      }
      
      return enhancedScreens;
    } catch (error) {
      this.debug(`Failed to get available screens: ${error}`);
      return [];
    }
  }

  // Utility methods



  private calculateSectionConfidence(screens: EnhancedScreen[]): number {
    if (screens.length === 0) return 0;
    
    const avgScore = screens.reduce((sum, screen) => {
      const score = screen.personalizedScore || screen.trendingScore || screen.recommendationScore || 0.5;
      return sum + score;
    }, 0) / screens.length;
    
    return Math.min(avgScore, 1);
  }

  private createUserContext(userId?: string, location?: string): UserContext {
    return {
      userId,
      sessionId: this.generateSessionId(),
      location,
      deviceType: 'desktop', // This would be detected from request
      timestamp: new Date()
    };
  }

  private createGroupingResult(
    sections: MarketplaceSection[],
    sessionId: string,
    startTime: number,
    cacheHit: boolean,
    fallbackUsed: boolean,
    errors: GroupingError[]
  ): GroupingResult {
    const processingTime = Date.now() - startTime;
    
    const analytics: GroupingAnalytics = {
      sessionId,
      sectionsViewed: sections.map(s => s.id),
      totalEngagementTime: 0,
      sectionsEngagement: [],
      conversionPath: [],
      timestamp: new Date()
    };

    if (this.config.enableAnalytics) {
      this.analyticsBuffer.push(analytics);
    }

    return {
      sections,
      analytics,
      fallbackUsed,
      processingTime,
      cacheHit,
      errors
    };
  }

  private createError(code: string, message: string, context: string, userId?: string): GroupingError {
    return {
      code,
      message,
      context,
      timestamp: new Date(),
      userId,
      recoveryStrategy: this.getRecoveryStrategy(code)
    };
  }

  private getRecoveryStrategy(errorCode: string): string {
    const strategies: Record<string, string> = {
      'SECTION_GENERATION_FAILED': 'Use fallback section configuration',
      'DEDUPLICATION_FAILED': 'Skip deduplication and use original sections',
      'GENERATION_FAILED': 'Apply fallback strategy',
      'REFRESH_FAILED': 'Use cached sections if available'
    };
    
    return strategies[errorCode] || 'Log error and continue';
  }

  private logError(error: GroupingError): void {
    this.errorLog.push(error);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog.splice(0, this.errorLog.length - 100);
    }
    
    if (this.config.debugMode) {
      console.error('GroupingEngine Error:', error);
    }
  }

  private debug(message: string): void {
    if (this.config.debugMode) {
      console.debug(`[GroupingEngine] ${message}`);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateTrackingId(sectionId: string, userId?: string): string {
    const userPart = userId ? `_${userId}` : '';
    return `${sectionId}${userPart}_${Date.now()}`;
  }
}

// Export singleton instance
export const groupingEngine = new GroupingEngine(
  new UserBehaviorAnalytics(),
  {
    enableCaching: true,
    debugMode: process.env.NODE_ENV === 'development'
  }
);