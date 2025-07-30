/**
 * SSP Inventory Adapter Service
 * Converts SSP inventory data to marketplace Screen format
 */

import { Screen } from '../pages/marketplace/types/screen.types';
import { DOOHInventoryData } from '../types/openrtb-dooh';
import { SSPErrorHandler, SSPValidationResult } from './SSPErrorHandler';

export class SSPInventoryAdapter {
  
  /**
   * Convert SSP inventory to marketplace screen format with validation
   */
  static convertSSPToMarketplaceScreen(sspInventory: DOOHInventoryData): Screen {
    try {
      // Validate and sanitize input data
      const validation = SSPErrorHandler.validateSSPInventoryData(sspInventory);
      
      if (!validation.isValid) {
        SSPErrorHandler.logError(
          new Error('SSP inventory validation failed'),
          'SSPInventoryAdapter.convertSSPToMarketplaceScreen',
          { 
            sspId: sspInventory.SSPId,
            venueId: sspInventory.VenueInfo?.VenueId,
            errors: validation.errors 
          }
        );
        
        // Use sanitized data if available, otherwise throw
        if (!validation.sanitizedData) {
          throw new Error('Invalid SSP inventory data cannot be sanitized');
        }
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('SSP inventory validation warnings:', validation.warnings);
      }

      // Use sanitized data for conversion
      const sanitizedInventory = validation.sanitizedData || sspInventory;

      const convertedScreen: Screen = {
        // Generate unique ID to avoid conflicts
        id: `ssp-${sanitizedInventory.SSPId}-${sanitizedInventory.VenueInfo.VenueId}`,
        
        // Basic information (using sanitized data)
        name: SSPErrorHandler.sanitizeString(sanitizedInventory.VenueInfo.VenueName || 'SSP Screen'),
        location: `${sanitizedInventory.GeoLocation.City || 'Unknown'}, ${sanitizedInventory.GeoLocation.Country || 'Unknown'}`,
        price: sanitizedInventory.PricingInfo.FloorPrice || 10,
        availability: sanitizedInventory.AvailabilityInfo.Status === 'Available',
        
        // Image with fallback
        image: sanitizedInventory.ScreenInfo.ImageUrl || '/screens_photos/ssp-default.jpg',
        
        // Category mapping
        category: {
          id: this.mapVenueTypeToCategory(sanitizedInventory.VenueInfo.VenueTypes),
          name: this.getVenueCategoryName(sanitizedInventory.VenueInfo.VenueTypes)
        },
        
        // Environment based on screen characteristics
        environment: sanitizedInventory.ScreenInfo.IsFixed ? 'outdoor' : 'indoor' as const,
        
        // Technical specifications
        specs: {
          width: sanitizedInventory.ScreenInfo.WidthPixels || 1920,
          height: sanitizedInventory.ScreenInfo.HeightPixels || 1080,
          resolution: this.formatResolution(sanitizedInventory.ScreenInfo),
          brightness: `${sanitizedInventory.ScreenInfo.Brightness || 5000} nits`,
          aspectRatio: this.calculateAspectRatio(
            sanitizedInventory.ScreenInfo.WidthPixels,
            sanitizedInventory.ScreenInfo.HeightPixels
          ),
          orientation: (sanitizedInventory.ScreenInfo.WidthPixels > sanitizedInventory.ScreenInfo.HeightPixels)
            ? 'landscape' : 'portrait' as const,
          pixelDensity: sanitizedInventory.ScreenInfo.PixelsPerInch || 72,
          colorDepth: 24,
          refreshRate: 60,
          technology: 'LED'
        },
        
        // Audience metrics
        views: {
          daily: sanitizedInventory.AudienceInfo.EstimatedDailyImpressions || 10000,
          weekly: (sanitizedInventory.AudienceInfo.EstimatedDailyImpressions || 10000) * 7,
          monthly: (sanitizedInventory.AudienceInfo.EstimatedDailyImpressions || 10000) * 30
        },
        
        // Quality rating based on SSP metrics
        rating: this.calculateQualityRating(sanitizedInventory),
        reviews: Math.floor(Math.random() * 50) + 10,
        
        // Geographic coordinates
        coordinates: {
          lat: sanitizedInventory.GeoLocation.Latitude || 0,
          lng: sanitizedInventory.GeoLocation.Longitude || 0
        },
        
        // Adapted pricing system
        pricing: this.adaptSSPPricingToTimeBased(sanitizedInventory.PricingInfo),
        
        // Additional metrics
        metrics: {
          dailyTraffic: sanitizedInventory.AudienceInfo.EstimatedDailyImpressions || 10000,
          monthlyTraffic: (sanitizedInventory.AudienceInfo.EstimatedDailyImpressions || 10000) * 30,
          averageEngagement: 85
        },
        
        // Location details
        locationDetails: {
          address: SSPErrorHandler.sanitizeString(
            sanitizedInventory.GeoLocation.Address || 
            sanitizedInventory.VenueInfo.VenueName || 
            'SSP Location'
          ),
          city: sanitizedInventory.GeoLocation.City || 'Unknown',
          region: sanitizedInventory.GeoLocation.Region || 'Unknown',
          country: sanitizedInventory.GeoLocation.Country || 'Unknown',
          coordinates: {
            lat: sanitizedInventory.GeoLocation.Latitude || 0,
            lng: sanitizedInventory.GeoLocation.Longitude || 0
          },
          timezone: sanitizedInventory.GeoLocation.Timezone || 'America/Bogota',
          landmarks: [SSPErrorHandler.sanitizeString(sanitizedInventory.VenueInfo.VenueName || 'SSP Location')]
        },
        
        // Operating hours
        operatingHours: {
          start: '06:00',
          end: '23:00',
          daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        },
        
        // SSP metadata for tracking
        sspMetadata: {
          sspId: sanitizedInventory.SSPId,
          sspName: SSPErrorHandler.sanitizeString(sanitizedInventory.SSPName || 'Unknown SSP'),
          originalInventoryId: sanitizedInventory.RequestId,
          lastUpdated: sanitizedInventory.Timestamp,
          isSSPInventory: true
        }
      };

      // Validate the converted screen
      const screenValidation = SSPErrorHandler.validateConvertedScreen(convertedScreen);
      if (!screenValidation.isValid) {
        SSPErrorHandler.logError(
          new Error('Converted screen validation failed'),
          'SSPInventoryAdapter.convertSSPToMarketplaceScreen',
          { 
            screenId: convertedScreen.id,
            errors: screenValidation.errors 
          }
        );
      }

      if (screenValidation.warnings.length > 0) {
        console.warn('Converted screen validation warnings:', screenValidation.warnings);
      }

      return convertedScreen;

    } catch (error) {
      SSPErrorHandler.logError(
        error,
        'SSPInventoryAdapter.convertSSPToMarketplaceScreen',
        { 
          sspId: sspInventory.SSPId,
          venueId: sspInventory.VenueInfo?.VenueId 
        }
      );
      throw error;
    }
  }
  
  /**
   * Adapt SSP CPM pricing to marketplace time-based bundles
   */
  private static adaptSSPPricingToTimeBased(sspPricing: any) {
    const baseCPM = sspPricing?.FloorPrice || 10;
    const currency = sspPricing?.Currency || 'USD';
    
    // Calculate prices for different durations
    const hourlyPrice = baseCPM * 4; // 4 spots per hour
    const dailyPrice = hourlyPrice * 16; // 16 hours operational
    const weeklyPrice = dailyPrice * 7;
    const monthlyPrice = dailyPrice * 30;
    
    return {
      allowMoments: true,
      deviceId: `SSP_${Date.now()}`,
      bundles: {
        hourly: {
          enabled: true,
          price: hourlyPrice,
          spots: 4
        },
        daily: {
          enabled: true,
          price: dailyPrice,
          spots: 64
        },
        weekly: {
          enabled: true,
          price: weeklyPrice,
          spots: 448
        },
        monthly: {
          enabled: true,
          price: monthlyPrice,
          spots: 1920
        }
      }
    };
  }
  
  /**
   * Map SSP venue types to marketplace categories
   */
  private static mapVenueTypeToCategory(venueTypes: any[]): string {
    if (!venueTypes || venueTypes.length === 0) return 'general';
    
    const venueType = venueTypes[0];
    const mappings: Record<string, string> = {
      'retail': 'mall',
      'transit': 'transport',
      'outdoor': 'billboard',
      'leisure': 'entertainment',
      'office': 'corporate',
      'education': 'university',
      'healthcare': 'hospital',
      'government': 'government'
    };
    
    return mappings[venueType] || 'general';
  }
  
  /**
   * Get venue category display name
   */
  private static getVenueCategoryName(venueTypes: any[]): string {
    const categoryNames: Record<string, string> = {
      'mall': 'Centro Comercial',
      'transport': 'Transporte',
      'billboard': 'Valla Exterior',
      'entertainment': 'Entretenimiento',
      'corporate': 'Corporativo',
      'university': 'Universidad',
      'hospital': 'Hospital',
      'government': 'Gubernamental',
      'general': 'General'
    };
    
    const category = this.mapVenueTypeToCategory(venueTypes);
    return categoryNames[category] || 'General';
  }
  
  /**
   * Calculate quality rating based on SSP metrics
   */
  private static calculateQualityRating(inventory: DOOHInventoryData): number {
    let rating = 3.5; // Base rating
    
    // Bonus for high traffic
    if (inventory.AudienceInfo.EstimatedDailyImpressions > 50000) rating += 0.5;
    if (inventory.AudienceInfo.EstimatedDailyImpressions > 100000) rating += 0.3;
    
    // Bonus for premium location (higher floor price)
    if (inventory.PricingInfo.FloorPrice > 50) rating += 0.2;
    
    // Bonus for technical specifications
    if (inventory.ScreenInfo.WidthPixels >= 1920) rating += 0.2;
    if (inventory.ScreenInfo.Brightness >= 5000) rating += 0.1;
    
    return Math.min(5.0, Math.max(1.0, rating));
  }
  
  /**
   * Format screen resolution
   */
  private static formatResolution(screenInfo: any): string {
    const width = screenInfo?.WidthPixels || 1920;
    const height = screenInfo?.HeightPixels || 1080;
    
    if (width >= 3840) return '4K';
    if (width >= 1920) return 'Full HD';
    if (width >= 1280) return 'HD';
    return 'SD';
  }
  
  /**
   * Calculate aspect ratio
   */
  private static calculateAspectRatio(width?: number, height?: number): string {
    if (!width || !height) return '16:9';
    
    const ratio = width / height;
    if (ratio > 1.7) return '16:9';
    if (ratio > 1.4) return '3:2';
    if (ratio > 1.2) return '4:3';
    return '1:1';
  }
}