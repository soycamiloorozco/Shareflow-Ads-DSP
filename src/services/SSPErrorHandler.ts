/**
 * SSP Error Handler
 * Comprehensive error handling and validation for SSP operations
 */

import { DOOHInventoryData } from '../types/openrtb-dooh';
import { Screen } from '../pages/marketplace/types/screen.types';

export interface SSPValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface SSPValidationResult {
  isValid: boolean;
  errors: SSPValidationError[];
  warnings: SSPValidationError[];
  sanitizedData?: any;
}

export class SSPErrorHandler {
  
  /**
   * Validate SSP inventory data before conversion
   */
  static validateSSPInventoryData(sspInventory: DOOHInventoryData): SSPValidationResult {
    const errors: SSPValidationError[] = [];
    const warnings: SSPValidationError[] = [];
    const sanitizedData = { ...sspInventory };

    // Required field validation
    if (!sspInventory.SSPId) {
      errors.push({
        field: 'SSPId',
        message: 'SSP ID is required',
        code: 'MISSING_REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!sspInventory.VenueInfo?.VenueId) {
      errors.push({
        field: 'VenueInfo.VenueId',
        message: 'Venue ID is required',
        code: 'MISSING_REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Venue name validation
    if (!sspInventory.VenueInfo?.VenueName) {
      warnings.push({
        field: 'VenueInfo.VenueName',
        message: 'Venue name is missing, using default',
        code: 'MISSING_OPTIONAL_FIELD',
        severity: 'warning'
      });
      sanitizedData.VenueInfo = {
        ...sanitizedData.VenueInfo,
        VenueName: 'SSP Screen'
      };
    }

    // Geographic validation
    if (!sspInventory.GeoLocation) {
      warnings.push({
        field: 'GeoLocation',
        message: 'Geographic location is missing',
        code: 'MISSING_LOCATION_DATA',
        severity: 'warning'
      });
      sanitizedData.GeoLocation = {
        Latitude: 0,
        Longitude: 0,
        City: 'Unknown',
        Country: 'Unknown'
      };
    } else {
      // Validate coordinates
      const lat = sspInventory.GeoLocation.Latitude;
      const lng = sspInventory.GeoLocation.Longitude;
      
      if (lat !== undefined && (lat < -90 || lat > 90)) {
        errors.push({
          field: 'GeoLocation.Latitude',
          message: 'Invalid latitude value',
          code: 'INVALID_COORDINATE',
          severity: 'error'
        });
      }
      
      if (lng !== undefined && (lng < -180 || lng > 180)) {
        errors.push({
          field: 'GeoLocation.Longitude',
          message: 'Invalid longitude value',
          code: 'INVALID_COORDINATE',
          severity: 'error'
        });
      }

      // Sanitize missing location fields
      if (!sspInventory.GeoLocation.City) {
        sanitizedData.GeoLocation.City = 'Unknown';
      }
      if (!sspInventory.GeoLocation.Country) {
        sanitizedData.GeoLocation.Country = 'Unknown';
      }
    }

    // Screen specifications validation
    if (!sspInventory.ScreenInfo) {
      warnings.push({
        field: 'ScreenInfo',
        message: 'Screen specifications missing, using defaults',
        code: 'MISSING_SCREEN_SPECS',
        severity: 'warning'
      });
      sanitizedData.ScreenInfo = {
        WidthPixels: 1920,
        HeightPixels: 1080,
        Brightness: 5000,
        IsFixed: true
      };
    } else {
      // Validate screen dimensions
      if (sspInventory.ScreenInfo.WidthPixels && sspInventory.ScreenInfo.WidthPixels <= 0) {
        errors.push({
          field: 'ScreenInfo.WidthPixels',
          message: 'Screen width must be positive',
          code: 'INVALID_DIMENSION',
          severity: 'error'
        });
      }
      
      if (sspInventory.ScreenInfo.HeightPixels && sspInventory.ScreenInfo.HeightPixels <= 0) {
        errors.push({
          field: 'ScreenInfo.HeightPixels',
          message: 'Screen height must be positive',
          code: 'INVALID_DIMENSION',
          severity: 'error'
        });
      }

      // Sanitize missing screen specs
      if (!sspInventory.ScreenInfo.WidthPixels) {
        sanitizedData.ScreenInfo.WidthPixels = 1920;
      }
      if (!sspInventory.ScreenInfo.HeightPixels) {
        sanitizedData.ScreenInfo.HeightPixels = 1080;
      }
      if (!sspInventory.ScreenInfo.Brightness) {
        sanitizedData.ScreenInfo.Brightness = 5000;
      }
    }

    // Pricing validation
    if (!sspInventory.PricingInfo) {
      warnings.push({
        field: 'PricingInfo',
        message: 'Pricing information missing, using default',
        code: 'MISSING_PRICING_INFO',
        severity: 'warning'
      });
      sanitizedData.PricingInfo = {
        FloorPrice: 10,
        Currency: 'USD'
      };
    } else {
      if (sspInventory.PricingInfo.FloorPrice !== undefined && sspInventory.PricingInfo.FloorPrice < 0) {
        errors.push({
          field: 'PricingInfo.FloorPrice',
          message: 'Floor price cannot be negative',
          code: 'INVALID_PRICE',
          severity: 'error'
        });
      }

      // Sanitize missing pricing fields
      if (!sspInventory.PricingInfo.FloorPrice) {
        sanitizedData.PricingInfo.FloorPrice = 10;
      }
      if (!sspInventory.PricingInfo.Currency) {
        sanitizedData.PricingInfo.Currency = 'USD';
      }
    }

    // Audience metrics validation
    if (!sspInventory.AudienceInfo) {
      warnings.push({
        field: 'AudienceInfo',
        message: 'Audience information missing, using estimates',
        code: 'MISSING_AUDIENCE_INFO',
        severity: 'warning'
      });
      sanitizedData.AudienceInfo = {
        EstimatedDailyImpressions: 10000
      };
    } else {
      if (sspInventory.AudienceInfo.EstimatedDailyImpressions !== undefined && 
          sspInventory.AudienceInfo.EstimatedDailyImpressions < 0) {
        errors.push({
          field: 'AudienceInfo.EstimatedDailyImpressions',
          message: 'Daily impressions cannot be negative',
          code: 'INVALID_IMPRESSIONS',
          severity: 'error'
        });
      }

      // Sanitize missing audience fields
      if (!sspInventory.AudienceInfo.EstimatedDailyImpressions) {
        sanitizedData.AudienceInfo.EstimatedDailyImpressions = 10000;
      }
    }

    // Availability validation
    if (!sspInventory.AvailabilityInfo) {
      warnings.push({
        field: 'AvailabilityInfo',
        message: 'Availability information missing, assuming available',
        code: 'MISSING_AVAILABILITY_INFO',
        severity: 'warning'
      });
      sanitizedData.AvailabilityInfo = {
        Status: 'Available'
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData
    };
  }

  /**
   * Validate converted screen data
   */
  static validateConvertedScreen(screen: Screen): SSPValidationResult {
    const errors: SSPValidationError[] = [];
    const warnings: SSPValidationError[] = [];

    // Required fields validation
    if (!screen.id) {
      errors.push({
        field: 'id',
        message: 'Screen ID is required',
        code: 'MISSING_SCREEN_ID',
        severity: 'error'
      });
    }

    if (!screen.name) {
      errors.push({
        field: 'name',
        message: 'Screen name is required',
        code: 'MISSING_SCREEN_NAME',
        severity: 'error'
      });
    }

    // Pricing validation
    if (!screen.pricing || !screen.pricing.bundles) {
      errors.push({
        field: 'pricing',
        message: 'Pricing information is required',
        code: 'MISSING_PRICING',
        severity: 'error'
      });
    }

    // Coordinates validation
    if (!screen.coordinates || screen.coordinates.lat === 0 && screen.coordinates.lng === 0) {
      warnings.push({
        field: 'coordinates',
        message: 'Invalid or missing coordinates',
        code: 'INVALID_COORDINATES',
        severity: 'warning'
      });
    }

    // SSP metadata validation
    if (screen.sspMetadata?.isSSPInventory) {
      if (!screen.sspMetadata.sspId) {
        errors.push({
          field: 'sspMetadata.sspId',
          message: 'SSP ID is required for SSP inventory',
          code: 'MISSING_SSP_ID',
          severity: 'error'
        });
      }

      if (!screen.sspMetadata.sspName) {
        warnings.push({
          field: 'sspMetadata.sspName',
          message: 'SSP name is missing',
          code: 'MISSING_SSP_NAME',
          severity: 'warning'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Handle SSP API errors with circuit breaker pattern
   */
  static handleSSPError(error: any, sspId: string): {
    shouldRetry: boolean;
    retryAfter?: number;
    fallbackAction: 'ignore' | 'use_cached' | 'disable_ssp';
    errorMessage: string;
  } {
    const errorMessage = error instanceof Error ? error.message : 'Unknown SSP error';
    
    // Network errors - retry with backoff
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return {
        shouldRetry: true,
        retryAfter: 30000, // 30 seconds
        fallbackAction: 'use_cached',
        errorMessage: `Network error for SSP ${sspId}: ${errorMessage}`
      };
    }

    // Authentication errors - don't retry, disable SSP
    if (error.code === 'AUTH_ERROR' || error.status === 401 || error.status === 403) {
      return {
        shouldRetry: false,
        fallbackAction: 'disable_ssp',
        errorMessage: `Authentication error for SSP ${sspId}: ${errorMessage}`
      };
    }

    // Rate limiting - retry after specified time
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'] ? 
        parseInt(error.headers['retry-after']) * 1000 : 60000;
      
      return {
        shouldRetry: true,
        retryAfter,
        fallbackAction: 'use_cached',
        errorMessage: `Rate limited by SSP ${sspId}: ${errorMessage}`
      };
    }

    // Server errors - retry with exponential backoff
    if (error.status >= 500) {
      return {
        shouldRetry: true,
        retryAfter: 60000, // 1 minute
        fallbackAction: 'use_cached',
        errorMessage: `Server error for SSP ${sspId}: ${errorMessage}`
      };
    }

    // Client errors - don't retry, ignore
    if (error.status >= 400 && error.status < 500) {
      return {
        shouldRetry: false,
        fallbackAction: 'ignore',
        errorMessage: `Client error for SSP ${sspId}: ${errorMessage}`
      };
    }

    // Unknown errors - single retry then ignore
    return {
      shouldRetry: true,
      retryAfter: 10000, // 10 seconds
      fallbackAction: 'ignore',
      errorMessage: `Unknown error for SSP ${sspId}: ${errorMessage}`
    };
  }

  /**
   * Log errors without exposing sensitive data
   */
  static logError(error: any, context: string, metadata?: Record<string, any>): void {
    const sanitizedMetadata = metadata ? this.sanitizeMetadata(metadata) : {};
    
    console.error(`[SSP Error] ${context}:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      context,
      metadata: sanitizedMetadata
    });
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  private static sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = value.substring(0, 100) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}