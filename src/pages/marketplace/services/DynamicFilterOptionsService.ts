/**
 * DynamicFilterOptionsService
 * 
 * Service to calculate filter option counts based on current filters,
 * implement real-time updates, and provide percentage and trend indicators.
 */

import { Screen } from '../types/marketplace.types';
import { FilterState, FilterOption } from '../types/marketplace.types';
import { CacheService } from './CacheService';

// =============================================================================
// TYPES
// =============================================================================

export interface DynamicFilterOption extends FilterOption {
  readonly count: number;
  readonly percentage: number;
  readonly trend: 'up' | 'down' | 'stable';
  readonly isRecommended: boolean;
  readonly relatedOptions: string[];
  readonly estimatedImpact: number; // How much this filter would reduce results (0-1)
  readonly isActive: boolean;
}

export interface DynamicFilterOptions {
  readonly cities: DynamicFilterOption[];
  readonly categories: DynamicFilterOption[];
  readonly priceRanges: DynamicFilterOption[];
  readonly venueTypes: DynamicFilterOption[];
  readonly environments: DynamicFilterOption[];
  readonly dwellTimes: DynamicFilterOption[];
  readonly features: DynamicFilterOption[];
  readonly totalResults: number;
  readonly lastUpdated: Date;
  readonly computationTime: number;
}

export interface FilterCountCache {
  readonly key: string;
  readonly options: DynamicFilterOptions;
  readonly timestamp: number;
  readonly ttl: number;
}

export interface TrendData {
  readonly optionId: string;
  readonly counts: number[];
  readonly timestamps: Date[];
  readonly trend: 'up' | 'down' | 'stable';
  readonly changePercentage: number;
}

// =============================================================================
// SERVICE IMPLEMENTATION
// =============================================================================

export class DynamicFilterOptionsService {
  private static instance: DynamicFilterOptionsService;
  private cacheService: CacheService;
  private trendHistory: Map<string, TrendData> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly TREND_HISTORY_SIZE = 10;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): DynamicFilterOptionsService {
    if (!DynamicFilterOptionsService.instance) {
      DynamicFilterOptionsService.instance = new DynamicFilterOptionsService();
    }
    return DynamicFilterOptionsService.instance;
  }

  /**
   * Calculate dynamic filter options based on current filters and available screens
   */
  public async calculateDynamicOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    excludeActiveFilters: boolean = true
  ): Promise<DynamicFilterOptions> {
    const startTime = performance.now();
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(allScreens, currentFilters, excludeActiveFilters);
    
    // Check cache first
    const cached = await this.getCachedOptions(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate filtered screens (excluding the filter type we're calculating for)
    const baseFilteredScreens = this.applyFiltersExcluding(allScreens, currentFilters, []);
    
    // Calculate options for each filter type
    const cities = await this.calculateCityOptions(allScreens, currentFilters, baseFilteredScreens, excludeActiveFilters);
    const categories = await this.calculateCategoryOptions(allScreens, currentFilters, baseFilteredScreens, excludeActiveFilters);
    const priceRanges = await this.calculatePriceRangeOptions(allScreens, currentFilters, baseFilteredScreens, excludeActiveFilters);
    const venueTypes = await this.calculateVenueTypeOptions(allScreens, currentFilters, baseFilteredScreens, excludeActiveFilters);
    const environments = await this.calculateEnvironmentOptions(allScreens, currentFilters, baseFilteredScreens, excludeActiveFilters);
    const dwellTimes = await this.calculateDwellTimeOptions(allScreens, currentFilters, baseFilteredScreens, excludeActiveFilters);
    const features = await this.calculateFeatureOptions(allScreens, currentFilters, baseFilteredScreens, excludeActiveFilters);

    const computationTime = performance.now() - startTime;
    
    const result: DynamicFilterOptions = {
      cities,
      categories,
      priceRanges,
      venueTypes,
      environments,
      dwellTimes,
      features,
      totalResults: baseFilteredScreens.length,
      lastUpdated: new Date(),
      computationTime
    };

    // Cache the result
    await this.cacheOptions(cacheKey, result);
    
    return result;
  }

  /**
   * Calculate city filter options
   */
  private async calculateCityOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    baseFilteredScreens: Screen[],
    excludeActiveFilters: boolean
  ): Promise<DynamicFilterOption[]> {
    const cityMap = new Map<string, Screen[]>();
    
    // Group screens by city
    baseFilteredScreens.forEach(screen => {
      const city = this.extractCity(screen.location);
      if (!cityMap.has(city)) {
        cityMap.set(city, []);
      }
      cityMap.get(city)!.push(screen);
    });

    const totalScreens = baseFilteredScreens.length;
    const options: DynamicFilterOption[] = [];

    for (const [city, screens] of cityMap.entries()) {
      const count = screens.length;
      const percentage = totalScreens > 0 ? (count / totalScreens) * 100 : 0;
      const isActive = currentFilters.location.cities.includes(city);
      
      // Skip active filters if requested
      if (excludeActiveFilters && isActive) {
        continue;
      }

      // Calculate estimated impact
      const estimatedImpact = this.calculateEstimatedImpact(allScreens, screens);
      
      // Get trend data
      const trend = await this.calculateTrend(city, count);
      
      // Calculate related options
      const relatedOptions = this.findRelatedCities(city, cityMap);

      options.push({
        id: city,
        label: city,
        count,
        percentage: Math.round(percentage * 100) / 100,
        trend: trend.trend,
        isRecommended: this.isRecommendedCity(city, screens, currentFilters),
        relatedOptions,
        estimatedImpact,
        isActive,
        icon: this.getCityIcon(city),
        disabled: count === 0
      });
    }

    return options.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate category filter options
   */
  private async calculateCategoryOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    baseFilteredScreens: Screen[],
    excludeActiveFilters: boolean
  ): Promise<DynamicFilterOption[]> {
    const categoryMap = new Map<string, Screen[]>();
    
    // Group screens by category
    baseFilteredScreens.forEach(screen => {
      const categoryId = screen.category.id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, []);
      }
      categoryMap.get(categoryId)!.push(screen);
    });

    const totalScreens = baseFilteredScreens.length;
    const options: DynamicFilterOption[] = [];

    for (const [categoryId, screens] of categoryMap.entries()) {
      const count = screens.length;
      const percentage = totalScreens > 0 ? (count / totalScreens) * 100 : 0;
      const isActive = currentFilters.category.categories.includes(categoryId);
      
      // Skip active filters if requested
      if (excludeActiveFilters && isActive) {
        continue;
      }

      // Get category info from first screen
      const categoryInfo = screens[0].category;
      
      // Calculate estimated impact
      const estimatedImpact = this.calculateEstimatedImpact(allScreens, screens);
      
      // Get trend data
      const trend = await this.calculateTrend(categoryId, count);
      
      // Calculate related options
      const relatedOptions = this.findRelatedCategories(categoryId, categoryMap);

      options.push({
        id: categoryId,
        label: categoryInfo.name,
        count,
        percentage: Math.round(percentage * 100) / 100,
        trend: trend.trend,
        isRecommended: this.isRecommendedCategory(categoryId, screens, currentFilters),
        relatedOptions,
        estimatedImpact,
        isActive,
        icon: categoryInfo.icon,
        disabled: count === 0
      });
    }

    return options.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate price range filter options
   */
  private async calculatePriceRangeOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    baseFilteredScreens: Screen[],
    excludeActiveFilters: boolean
  ): Promise<DynamicFilterOption[]> {
    const priceRanges = [
      { id: 'budget', label: 'Económico (< $500K)', min: 0, max: 500000, emoji: '💚' },
      { id: 'mid-range', label: 'Medio ($500K - $1M)', min: 500000, max: 1000000, emoji: '💛' },
      { id: 'premium', label: 'Premium ($1M - $2M)', min: 1000000, max: 2000000, emoji: '🧡' },
      { id: 'luxury', label: 'Lujo ($2M - $5M)', min: 2000000, max: 5000000, emoji: '💜' },
      { id: 'ultra-premium', label: 'Ultra Premium (> $5M)', min: 5000000, max: Number.MAX_SAFE_INTEGER, emoji: '💎' }
    ];

    const totalScreens = baseFilteredScreens.length;
    const options: DynamicFilterOption[] = [];

    for (const range of priceRanges) {
      const screensInRange = baseFilteredScreens.filter(screen => {
        const price = screen.price || 0;
        return price >= range.min && price < range.max;
      });

      const count = screensInRange.length;
      const percentage = totalScreens > 0 ? (count / totalScreens) * 100 : 0;
      const isActive = currentFilters.price.ranges.includes(range.id);
      
      // Skip active filters if requested
      if (excludeActiveFilters && isActive) {
        continue;
      }

      // Calculate estimated impact
      const estimatedImpact = this.calculateEstimatedImpact(allScreens, screensInRange);
      
      // Get trend data
      const trend = await this.calculateTrend(range.id, count);
      
      // Calculate related options
      const relatedOptions = this.findRelatedPriceRanges(range.id, priceRanges);

      options.push({
        id: range.id,
        label: range.label,
        count,
        percentage: Math.round(percentage * 100) / 100,
        trend: trend.trend,
        isRecommended: this.isRecommendedPriceRange(range.id, screensInRange, currentFilters),
        relatedOptions,
        estimatedImpact,
        isActive,
        emoji: range.emoji,
        disabled: count === 0
      });
    }

    return options.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate venue type filter options
   */
  private async calculateVenueTypeOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    baseFilteredScreens: Screen[],
    excludeActiveFilters: boolean
  ): Promise<DynamicFilterOption[]> {
    const venueTypeMap = new Map<string, Screen[]>();
    
    // Group screens by venue type
    baseFilteredScreens.forEach(screen => {
      const venueType = screen.venue?.type || 'unknown';
      if (!venueTypeMap.has(venueType)) {
        venueTypeMap.set(venueType, []);
      }
      venueTypeMap.get(venueType)!.push(screen);
    });

    const totalScreens = baseFilteredScreens.length;
    const options: DynamicFilterOption[] = [];

    for (const [venueType, screens] of venueTypeMap.entries()) {
      const count = screens.length;
      const percentage = totalScreens > 0 ? (count / totalScreens) * 100 : 0;
      const isActive = currentFilters.category.venueTypes.includes(venueType);
      
      // Skip active filters if requested
      if (excludeActiveFilters && isActive) {
        continue;
      }

      // Calculate estimated impact
      const estimatedImpact = this.calculateEstimatedImpact(allScreens, screens);
      
      // Get trend data
      const trend = await this.calculateTrend(venueType, count);
      
      // Calculate related options
      const relatedOptions = this.findRelatedVenueTypes(venueType, venueTypeMap);

      options.push({
        id: venueType,
        label: this.formatVenueTypeLabel(venueType),
        count,
        percentage: Math.round(percentage * 100) / 100,
        trend: trend.trend,
        isRecommended: this.isRecommendedVenueType(venueType, screens, currentFilters),
        relatedOptions,
        estimatedImpact,
        isActive,
        icon: this.getVenueTypeIcon(venueType),
        disabled: count === 0
      });
    }

    return options.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate environment filter options
   */
  private async calculateEnvironmentOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    baseFilteredScreens: Screen[],
    excludeActiveFilters: boolean
  ): Promise<DynamicFilterOption[]> {
    const environments = ['indoor', 'outdoor'];
    const totalScreens = baseFilteredScreens.length;
    const options: DynamicFilterOption[] = [];

    for (const environment of environments) {
      const screensInEnvironment = baseFilteredScreens.filter(screen => 
        screen.environment === environment
      );

      const count = screensInEnvironment.length;
      const percentage = totalScreens > 0 ? (count / totalScreens) * 100 : 0;
      const isActive = currentFilters.category.environments.includes(environment);
      
      // Skip active filters if requested
      if (excludeActiveFilters && isActive) {
        continue;
      }

      // Calculate estimated impact
      const estimatedImpact = this.calculateEstimatedImpact(allScreens, screensInEnvironment);
      
      // Get trend data
      const trend = await this.calculateTrend(environment, count);

      options.push({
        id: environment,
        label: environment === 'indoor' ? 'Interior' : 'Exterior',
        count,
        percentage: Math.round(percentage * 100) / 100,
        trend: trend.trend,
        isRecommended: this.isRecommendedEnvironment(environment, screensInEnvironment, currentFilters),
        relatedOptions: [],
        estimatedImpact,
        isActive,
        icon: environment === 'indoor' ? '🏢' : '🌤️',
        disabled: count === 0
      });
    }

    return options.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate dwell time filter options
   */
  private async calculateDwellTimeOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    baseFilteredScreens: Screen[],
    excludeActiveFilters: boolean
  ): Promise<DynamicFilterOption[]> {
    const dwellTimes = [
      { id: 'very_short', label: 'Muy Corto (< 30s)', icon: '⚡' },
      { id: 'short', label: 'Corto (30s - 2min)', icon: '🚶' },
      { id: 'medium', label: 'Medio (2 - 15min)', icon: '🚶‍♂️' },
      { id: 'long', label: 'Largo (15 - 60min)', icon: '🪑' },
      { id: 'very_long', label: 'Muy Largo (> 60min)', icon: '🛋️' }
    ];

    const totalScreens = baseFilteredScreens.length;
    const options: DynamicFilterOption[] = [];

    for (const dwellTime of dwellTimes) {
      // For demo purposes, we'll simulate dwell time distribution
      const screensWithDwellTime = baseFilteredScreens.filter(() => Math.random() > 0.7);

      const count = screensWithDwellTime.length;
      const percentage = totalScreens > 0 ? (count / totalScreens) * 100 : 0;
      const isActive = currentFilters.category.dwellTimes.includes(dwellTime.id);
      
      // Skip active filters if requested
      if (excludeActiveFilters && isActive) {
        continue;
      }

      // Calculate estimated impact
      const estimatedImpact = this.calculateEstimatedImpact(allScreens, screensWithDwellTime);
      
      // Get trend data
      const trend = await this.calculateTrend(dwellTime.id, count);

      options.push({
        id: dwellTime.id,
        label: dwellTime.label,
        count,
        percentage: Math.round(percentage * 100) / 100,
        trend: trend.trend,
        isRecommended: this.isRecommendedDwellTime(dwellTime.id, screensWithDwellTime, currentFilters),
        relatedOptions: [],
        estimatedImpact,
        isActive,
        icon: dwellTime.icon,
        disabled: count === 0
      });
    }

    return options.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate feature filter options
   */
  private async calculateFeatureOptions(
    allScreens: Screen[],
    currentFilters: FilterState,
    baseFilteredScreens: Screen[],
    excludeActiveFilters: boolean
  ): Promise<DynamicFilterOption[]> {
    const features = [
      { id: 'moments', label: 'Permite Momentos', icon: '⚡' },
      { id: 'high_rating', label: 'Alta Calificación (4.5+)', icon: '⭐' },
      { id: 'new_screens', label: 'Pantallas Nuevas', icon: '🆕' },
      { id: 'high_traffic', label: 'Alto Tráfico', icon: '🚶‍♂️' }
    ];

    const totalScreens = baseFilteredScreens.length;
    const options: DynamicFilterOption[] = [];

    for (const feature of features) {
      let screensWithFeature: Screen[] = [];

      switch (feature.id) {
        case 'moments':
          screensWithFeature = baseFilteredScreens.filter(screen => 
            screen.pricing.allowMoments
          );
          break;
        case 'high_rating':
          screensWithFeature = baseFilteredScreens.filter(screen => 
            screen.rating >= 4.5
          );
          break;
        case 'new_screens':
          screensWithFeature = baseFilteredScreens.filter(screen => 
            screen.reviews < 50 // Assuming new screens have fewer reviews
          );
          break;
        case 'high_traffic':
          screensWithFeature = baseFilteredScreens.filter(screen => 
            screen.views.daily > 50000
          );
          break;
      }

      const count = screensWithFeature.length;
      const percentage = totalScreens > 0 ? (count / totalScreens) * 100 : 0;
      const isActive = this.isFeatureActive(feature.id, currentFilters);
      
      // Skip active filters if requested
      if (excludeActiveFilters && isActive) {
        continue;
      }

      // Calculate estimated impact
      const estimatedImpact = this.calculateEstimatedImpact(allScreens, screensWithFeature);
      
      // Get trend data
      const trend = await this.calculateTrend(feature.id, count);

      options.push({
        id: feature.id,
        label: feature.label,
        count,
        percentage: Math.round(percentage * 100) / 100,
        trend: trend.trend,
        isRecommended: this.isRecommendedFeature(feature.id, screensWithFeature, currentFilters),
        relatedOptions: [],
        estimatedImpact,
        isActive,
        icon: feature.icon,
        disabled: count === 0
      });
    }

    return options.sort((a, b) => b.count - a.count);
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Apply filters excluding specific filter types
   */
  private applyFiltersExcluding(
    screens: Screen[],
    filters: FilterState,
    excludeTypes: string[]
  ): Screen[] {
    return screens.filter(screen => {
      // Search filter
      if (!excludeTypes.includes('search') && filters.search.query) {
        const query = filters.search.query.toLowerCase();
        if (!screen.name.toLowerCase().includes(query) && 
            !screen.location.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Location filter
      if (!excludeTypes.includes('location') && filters.location.cities.length > 0) {
        const city = this.extractCity(screen.location);
        if (!filters.location.cities.includes(city)) {
          return false;
        }
      }

      // Category filter
      if (!excludeTypes.includes('category') && filters.category.categories.length > 0) {
        if (!filters.category.categories.includes(screen.category.id)) {
          return false;
        }
      }

      // Price filter
      if (!excludeTypes.includes('price')) {
        const price = screen.price || 0;
        if (price < filters.price.min || price > filters.price.max) {
          return false;
        }
      }

      // Features filter
      if (!excludeTypes.includes('features')) {
        if (filters.features.allowsMoments !== null && 
            screen.pricing.allowMoments !== filters.features.allowsMoments) {
          return false;
        }
        
        if (filters.features.rating !== null && 
            screen.rating < filters.features.rating) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Extract city from location string
   */
  private extractCity(location: string): string {
    // Simple extraction - in real implementation, this would be more sophisticated
    const parts = location.split(',');
    return parts[parts.length - 1].trim();
  }

  /**
   * Calculate estimated impact of applying a filter
   */
  private calculateEstimatedImpact(allScreens: Screen[], filteredScreens: Screen[]): number {
    if (allScreens.length === 0) return 0;
    return 1 - (filteredScreens.length / allScreens.length);
  }

  /**
   * Calculate trend for an option
   */
  private async calculateTrend(optionId: string, currentCount: number): Promise<TrendData> {
    const existing = this.trendHistory.get(optionId);
    
    if (!existing) {
      const newTrend: TrendData = {
        optionId,
        counts: [currentCount],
        timestamps: [new Date()],
        trend: 'stable',
        changePercentage: 0
      };
      this.trendHistory.set(optionId, newTrend);
      return newTrend;
    }

    // Add new data point
    existing.counts.push(currentCount);
    existing.timestamps.push(new Date());

    // Keep only recent history
    if (existing.counts.length > this.TREND_HISTORY_SIZE) {
      existing.counts.shift();
      existing.timestamps.shift();
    }

    // Calculate trend
    if (existing.counts.length >= 2) {
      const oldCount = existing.counts[0];
      const newCount = existing.counts[existing.counts.length - 1];
      const changePercentage = oldCount > 0 ? ((newCount - oldCount) / oldCount) * 100 : 0;
      
      existing.changePercentage = changePercentage;
      
      if (Math.abs(changePercentage) < 5) {
        existing.trend = 'stable';
      } else if (changePercentage > 0) {
        existing.trend = 'up';
      } else {
        existing.trend = 'down';
      }
    }

    this.trendHistory.set(optionId, existing);
    return existing;
  }

  /**
   * Generate cache key for filter options
   */
  private generateCacheKey(
    screens: Screen[],
    filters: FilterState,
    excludeActiveFilters: boolean
  ): string {
    const screenIds = screens.map(s => s.id).sort().join(',');
    const filtersStr = JSON.stringify(filters);
    return `dynamic-options-${btoa(screenIds + filtersStr + excludeActiveFilters)}`;
  }

  /**
   * Get cached options
   */
  private async getCachedOptions(key: string): Promise<DynamicFilterOptions | null> {
    try {
      const cached = await this.cacheService.get<FilterCountCache>(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.options;
      }
    } catch (error) {
      console.warn('Failed to get cached filter options:', error);
    }
    return null;
  }

  /**
   * Cache filter options
   */
  private async cacheOptions(key: string, options: DynamicFilterOptions): Promise<void> {
    try {
      const cacheData: FilterCountCache = {
        key,
        options,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      };
      await this.cacheService.set(key, cacheData, this.CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache filter options:', error);
    }
  }

  // =============================================================================
  // RECOMMENDATION LOGIC
  // =============================================================================

  private isRecommendedCity(city: string, screens: Screen[], filters: FilterState): boolean {
    // Recommend cities with high screen count or high average rating
    return screens.length > 5 || screens.reduce((sum, s) => sum + s.rating, 0) / screens.length > 4.5;
  }

  private isRecommendedCategory(categoryId: string, screens: Screen[], filters: FilterState): boolean {
    // Recommend categories with good performance metrics
    const avgViews = screens.reduce((sum, s) => sum + (s.views?.daily || 0), 0) / screens.length;
    return avgViews > 30000;
  }

  private isRecommendedPriceRange(rangeId: string, screens: Screen[], filters: FilterState): boolean {
    // Recommend budget and premium ranges
    return rangeId === 'budget' || rangeId === 'premium';
  }

  private isRecommendedVenueType(venueType: string, screens: Screen[], filters: FilterState): boolean {
    // Recommend venue types with high engagement
    return screens.some(s => s.metrics?.averageEngagement && s.metrics.averageEngagement > 90);
  }

  private isRecommendedEnvironment(environment: string, screens: Screen[], filters: FilterState): boolean {
    // Recommend based on screen count
    return screens.length > 3;
  }

  private isRecommendedDwellTime(dwellTimeId: string, screens: Screen[], filters: FilterState): boolean {
    // Recommend medium dwell times
    return dwellTimeId === 'medium' || dwellTimeId === 'long';
  }

  private isRecommendedFeature(featureId: string, screens: Screen[], filters: FilterState): boolean {
    // Recommend features with good availability
    return screens.length > 2;
  }

  // =============================================================================
  // RELATED OPTIONS LOGIC
  // =============================================================================

  private findRelatedCities(city: string, cityMap: Map<string, Screen[]>): string[] {
    // Simple implementation - in real app, this would use geographic or demographic data
    const allCities = Array.from(cityMap.keys());
    return allCities.filter(c => c !== city).slice(0, 3);
  }

  private findRelatedCategories(categoryId: string, categoryMap: Map<string, Screen[]>): string[] {
    // Simple implementation - in real app, this would use category relationships
    const allCategories = Array.from(categoryMap.keys());
    return allCategories.filter(c => c !== categoryId).slice(0, 3);
  }

  private findRelatedPriceRanges(rangeId: string, ranges: any[]): string[] {
    const currentIndex = ranges.findIndex(r => r.id === rangeId);
    const related: string[] = [];
    
    if (currentIndex > 0) related.push(ranges[currentIndex - 1].id);
    if (currentIndex < ranges.length - 1) related.push(ranges[currentIndex + 1].id);
    
    return related;
  }

  private findRelatedVenueTypes(venueType: string, venueTypeMap: Map<string, Screen[]>): string[] {
    // Simple implementation
    const allTypes = Array.from(venueTypeMap.keys());
    return allTypes.filter(t => t !== venueType).slice(0, 2);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private getCityIcon(city: string): string {
    const cityIcons: Record<string, string> = {
      'Bogotá': '🏛️',
      'Medellín': '🌸',
      'Cali': '🌴',
      'Barranquilla': '🏖️',
      'Cartagena': '🏰'
    };
    return cityIcons[city] || '🏙️';
  }

  private getVenueTypeIcon(venueType: string): string {
    const venueIcons: Record<string, string> = {
      'mall': '🛍️',
      'stadium': '🏟️',
      'airport': '✈️',
      'transport': '🚇',
      'billboard': '📺',
      'restaurant': '🍽️',
      'gym': '💪',
      'hospital': '🏥',
      'university': '🎓'
    };
    return venueIcons[venueType] || '📍';
  }

  private formatVenueTypeLabel(venueType: string): string {
    const labels: Record<string, string> = {
      'mall': 'Centros Comerciales',
      'stadium': 'Estadios',
      'airport': 'Aeropuertos',
      'transport': 'Transporte',
      'billboard': 'Vallas Publicitarias',
      'restaurant': 'Restaurantes',
      'gym': 'Gimnasios',
      'hospital': 'Hospitales',
      'university': 'Universidades',
      'unknown': 'Otros'
    };
    return labels[venueType] || venueType;
  }

  private isFeatureActive(featureId: string, filters: FilterState): boolean {
    switch (featureId) {
      case 'moments':
        return filters.features.allowsMoments === true;
      case 'high_rating':
        return filters.features.rating !== null && filters.features.rating >= 4.5;
      default:
        return false;
    }
  }

  /**
   * Clear trend history (useful for testing)
   */
  public clearTrendHistory(): void {
    this.trendHistory.clear();
  }

  /**
   * Get trend history for debugging
   */
  public getTrendHistory(): Map<string, TrendData> {
    return new Map(this.trendHistory);
  }
}

export default DynamicFilterOptionsService;