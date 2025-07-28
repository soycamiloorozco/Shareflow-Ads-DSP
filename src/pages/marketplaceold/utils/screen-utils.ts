/**
 * Utility functions for screen-related operations
 * Helper functions for screen data manipulation, calculations, and transformations
 */

import { Screen, ScreenCategory } from '../types/marketplace.types';
import { ScreenWithCircuit } from '../types/screen.types';
import { VenueParentCategory, EnvironmentType, DwellTime } from '../types/filter.types';

// =============================================================================
// PRICE CALCULATION UTILITIES
// =============================================================================

/**
 * Calculate minimum price for a screen across all available bundles
 */
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

/**
 * Calculate maximum price for a screen across all available bundles
 */
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

/**
 * Calculate price per impression for a screen
 */
export const getPricePerImpression = (screen: Screen, bundleType: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'hourly'): number => {
  const bundle = screen.pricing.bundles[bundleType];
  if (!bundle?.enabled) return 0;
  
  const impressionsPerHour = screen.views.daily / 24;
  let totalImpressions: number;
  
  switch (bundleType) {
    case 'hourly':
      totalImpressions = impressionsPerHour;
      break;
    case 'daily':
      totalImpressions = screen.views.daily;
      break;
    case 'weekly':
      totalImpressions = screen.views.daily * 7;
      break;
    case 'monthly':
      totalImpressions = screen.views.monthly;
      break;
    default:
      totalImpressions = impressionsPerHour;
  }
  
  return totalImpressions > 0 ? bundle.price / totalImpressions : 0;
};

/**
 * Format price for display with Colombian peso formatting
 */
export const formatPrice = (price: number, compact: boolean = false): string => {
  if (compact && price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  } else if (compact && price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// =============================================================================
// VENUE MAPPING UTILITIES
// =============================================================================

/**
 * Map screen category to venue taxonomy
 */
export const getScreenVenueMapping = (screen: Screen): {
  parentCategory?: VenueParentCategory;
  environment?: EnvironmentType;
  dwellTime?: DwellTime;
} => {
  const categoryId = screen.category.id.toLowerCase();
  const categoryName = screen.category.name.toLowerCase();
  
  // Map category to parent venue category
  let parentCategory: VenueParentCategory | undefined;
  
  if (categoryId.includes('mall') || categoryId.includes('retail') || categoryName.includes('comercial')) {
    parentCategory = 'retail';
  } else if (categoryId.includes('transport') || categoryId.includes('metro') || categoryId.includes('airport')) {
    parentCategory = 'transit';
  } else if (categoryId.includes('billboard') || categoryId.includes('outdoor') || categoryName.includes('valla')) {
    parentCategory = 'outdoor';
  } else if (categoryId.includes('hospital') || categoryId.includes('clinic') || categoryName.includes('salud')) {
    parentCategory = 'health_beauty';
  } else if (categoryId.includes('school') || categoryId.includes('university') || categoryName.includes('educación')) {
    parentCategory = 'education';
  } else if (categoryId.includes('office') || categoryName.includes('oficina')) {
    parentCategory = 'office_buildings';
  } else if (categoryId.includes('stadium') || categoryId.includes('cinema') || categoryName.includes('entretenimiento')) {
    parentCategory = 'leisure';
  } else if (categoryId.includes('government') || categoryName.includes('gobierno')) {
    parentCategory = 'government';
  } else if (categoryId.includes('bank') || categoryName.includes('financiero')) {
    parentCategory = 'financial';
  } else if (categoryId.includes('residential') || categoryName.includes('residencial')) {
    parentCategory = 'residential';
  }
  
  // Map environment
  let environment: EnvironmentType | undefined;
  
  if (screen.environment === 'indoor') {
    if (categoryId.includes('mall') || categoryId.includes('airport')) {
      environment = 'indoor_controlled';
    } else {
      environment = 'indoor_semi_open';
    }
  } else {
    if (categoryId.includes('billboard') || categoryId.includes('outdoor')) {
      environment = 'outdoor_exposed';
    } else {
      environment = 'outdoor_covered';
    }
  }
  
  // Map dwell time based on venue type
  let dwellTime: DwellTime | undefined;
  
  if (categoryId.includes('transport') || categoryId.includes('metro')) {
    dwellTime = 'short';
  } else if (categoryId.includes('mall') || categoryId.includes('retail')) {
    dwellTime = 'medium';
  } else if (categoryId.includes('airport')) {
    dwellTime = 'long';
  } else if (categoryId.includes('stadium') || categoryId.includes('cinema')) {
    dwellTime = 'very_long';
  } else if (categoryId.includes('billboard')) {
    dwellTime = 'very_short';
  } else {
    dwellTime = 'medium';
  }
  
  return { parentCategory, environment, dwellTime };
};

// =============================================================================
// SCREEN VALIDATION UTILITIES
// =============================================================================

/**
 * Check if screen has valid coordinates
 */
export const hasValidCoordinates = (screen: Screen): boolean => {
  return !!(
    screen.coordinates?.lat && 
    screen.coordinates?.lng &&
    screen.coordinates.lat >= -90 && 
    screen.coordinates.lat <= 90 &&
    screen.coordinates.lng >= -180 && 
    screen.coordinates.lng <= 180
  );
};

/**
 * Check if screen is available for booking
 */
export const isScreenAvailable = (screen: Screen, date?: Date): boolean => {
  if (!screen.availability) return false;
  
  // Basic availability check
  if (!date) return true;
  
  // Check operating hours if available
  if (screen.operatingHours) {
    const dayOfWeek = date.toLocaleDateString('es-CO', { weekday: 'long' });
    const isActiveDay = screen.operatingHours.daysActive.some(day => 
      day.toLowerCase().includes(dayOfWeek.toLowerCase())
    );
    
    if (!isActiveDay) return false;
  }
  
  return true;
};

/**
 * Check if screen supports a specific creative format
 */
export const supportsFormat = (screen: Screen, format: string): boolean => {
  if (!screen.media?.supportedFormats) {
    // Default supported formats if not specified
    const defaultFormats = ['image/jpeg', 'image/png', 'video/mp4'];
    return defaultFormats.includes(format);
  }
  
  return screen.media.supportedFormats.includes(format);
};

/**
 * Validate creative dimensions against screen specs
 */
export const validateCreativeDimensions = (
  screen: Screen, 
  width: number, 
  height: number
): {
  isValid: boolean;
  aspectRatioMatch: boolean;
  scaleMethod: 'fill' | 'fit' | 'stretch';
  warnings: string[];
} => {
  const screenAspectRatio = screen.specs.width / screen.specs.height;
  const creativeAspectRatio = width / height;
  const aspectRatioTolerance = 0.1;
  
  const aspectRatioMatch = Math.abs(screenAspectRatio - creativeAspectRatio) <= aspectRatioTolerance;
  
  const warnings: string[] = [];
  let scaleMethod: 'fill' | 'fit' | 'stretch' = 'fit';
  
  if (!aspectRatioMatch) {
    warnings.push('Las dimensiones no coinciden exactamente con la pantalla');
    scaleMethod = 'fill';
  }
  
  if (width < screen.specs.width || height < screen.specs.height) {
    warnings.push('La resolución es menor a la recomendada para esta pantalla');
  }
  
  if (width > screen.specs.width * 2 || height > screen.specs.height * 2) {
    warnings.push('La resolución es muy alta, se redimensionará automáticamente');
  }
  
  return {
    isValid: true, // We accept most formats with scaling
    aspectRatioMatch,
    scaleMethod,
    warnings
  };
};

// =============================================================================
// SCREEN COMPARISON UTILITIES
// =============================================================================

/**
 * Calculate similarity score between two screens
 */
export const calculateScreenSimilarity = (screen1: Screen, screen2: Screen): number => {
  let score = 0;
  
  // Category similarity (30%)
  if (screen1.category.id === screen2.category.id) {
    score += 30;
  } else if (screen1.category.name === screen2.category.name) {
    score += 20;
  }
  
  // Location similarity (25%)
  if (screen1.locationDetails.city === screen2.locationDetails.city) {
    score += 25;
  } else if (screen1.locationDetails.region === screen2.locationDetails.region) {
    score += 15;
  }
  
  // Price similarity (20%)
  const price1 = getScreenMinPrice(screen1);
  const price2 = getScreenMinPrice(screen2);
  const priceDiff = Math.abs(price1 - price2) / Math.max(price1, price2);
  score += Math.max(0, 20 - (priceDiff * 20));
  
  // Audience similarity (15%)
  const viewsDiff = Math.abs(screen1.views.daily - screen2.views.daily) / Math.max(screen1.views.daily, screen2.views.daily);
  score += Math.max(0, 15 - (viewsDiff * 15));
  
  // Rating similarity (10%)
  const ratingDiff = Math.abs(screen1.rating - screen2.rating) / 5;
  score += Math.max(0, 10 - (ratingDiff * 10));
  
  return Math.round(score);
};

/**
 * Find similar screens based on criteria
 */
export const findSimilarScreens = (
  targetScreen: Screen, 
  allScreens: Screen[], 
  limit: number = 5
): Screen[] => {
  return allScreens
    .filter(screen => screen.id !== targetScreen.id)
    .map(screen => ({
      screen,
      similarity: calculateScreenSimilarity(targetScreen, screen)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.screen);
};

// =============================================================================
// DISTANCE CALCULATION UTILITIES
// =============================================================================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Find screens within a radius of a point
 */
export const findScreensWithinRadius = (
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  screens: Screen[]
): Screen[] => {
  return screens.filter(screen => {
    if (!hasValidCoordinates(screen)) return false;
    
    const distance = calculateDistance(
      centerLat,
      centerLng,
      screen.coordinates!.lat,
      screen.coordinates!.lng
    );
    
    return distance <= radiusKm;
  });
};

// =============================================================================
// CIRCUIT UTILITIES
// =============================================================================

/**
 * Check if screen is part of a circuit
 */
export const isPartOfCircuit = (screen: Screen): screen is ScreenWithCircuit => {
  return 'isPartOfCircuit' in screen && (screen as ScreenWithCircuit).isPartOfCircuit;
};

/**
 * Group screens by circuit
 */
export const groupScreensByCircuit = (screens: ScreenWithCircuit[]): {
  circuits: Record<string, ScreenWithCircuit[]>;
  individualScreens: ScreenWithCircuit[];
} => {
  const circuits: Record<string, ScreenWithCircuit[]> = {};
  const individualScreens: ScreenWithCircuit[] = [];
  
  screens.forEach(screen => {
    if (screen.isPartOfCircuit && screen.circuitId) {
      if (!circuits[screen.circuitId]) {
        circuits[screen.circuitId] = [];
      }
      circuits[screen.circuitId].push(screen);
    } else {
      individualScreens.push(screen);
    }
  });
  
  return { circuits, individualScreens };
};

/**
 * Calculate circuit statistics
 */
export const calculateCircuitStats = (screens: ScreenWithCircuit[]): {
  totalViews: number;
  averageRating: number;
  totalPrice: number;
  cities: string[];
  priceRange: { min: number; max: number };
} => {
  const totalViews = screens.reduce((sum, screen) => sum + screen.views.daily, 0);
  const averageRating = screens.reduce((sum, screen) => sum + screen.rating, 0) / screens.length;
  const totalPrice = screens.reduce((sum, screen) => sum + getScreenMinPrice(screen), 0);
  
  const cities = [...new Set(screens.map(screen => 
    screen.locationDetails.city || screen.location.split(',').pop()?.trim() || ''
  ))].filter(Boolean);
  
  const prices = screens.map(getScreenMinPrice);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
  
  return {
    totalViews,
    averageRating,
    totalPrice,
    cities,
    priceRange
  };
};

// =============================================================================
// TYPE GUARDS
// =============================================================================

export const isScreenWithCircuit = (screen: Screen): screen is ScreenWithCircuit => {
  return 'isPartOfCircuit' in screen;
};

export const hasOperatingHours = (screen: Screen): boolean => {
  return !!(screen.operatingHours?.start && screen.operatingHours?.end);
};

export const hasMetrics = (screen: Screen): boolean => {
  return !!(screen.metrics?.dailyTraffic && screen.metrics?.averageEngagement);
};

export const hasAccessibilityInfo = (screen: Screen): boolean => {
  return !!(screen.accessibility);
};