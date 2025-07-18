/**
 * Marketplace Types - Main Export File
 * Centralized exports for all marketplace-related types and utilities
 */

// Core marketplace types
export * from './marketplace.types';

// Screen-specific types
export * from './screen.types';

// Filter-specific types
export * from './filter.types';

// Conditional filter types
export * from './conditional-filter.types';

// API-specific types
export * from './api.types';

// Intelligent grouping types
export * from './intelligent-grouping.types';

// Re-export commonly used utility functions
export {
  getScreenMinPrice,
  getScreenMaxPrice,
  getPricePerImpression,
  formatPrice,
  getScreenVenueMapping,
  hasValidCoordinates,
  isScreenAvailable,
  supportsFormat,
  validateCreativeDimensions,
  calculateScreenSimilarity,
  findSimilarScreens,
  calculateDistance,
  findScreensWithinRadius,
  isPartOfCircuit,
  groupScreensByCircuit,
  calculateCircuitStats,
  isScreenWithCircuit,
  hasOperatingHours,
  hasMetrics,
  hasAccessibilityInfo
} from '../utils/screen-utils';

// Type guard utilities
export {
  isScreen,
  isApiError,
  isFilterState
} from './marketplace.types';

export {
  isValidVenueParentCategory,
  isValidEnvironmentType,
  isValidDwellTime,
  createEmptyFilterState,
  isFilterActive,
  getActiveFilterCount,
  serializeFilters,
  deserializeFilters,
  validateFilters
} from './filter.types';

export {
  transformScreenDTOToScreen,
  createCacheKey,
  isStale
} from './api.types';

export {
  isEnhancedScreen,
  isValidAlgorithmType,
  isValidSectionDisplayType,
  isValidInteractionAction,
  createEmptyUserProfile,
  calculateConfidenceLevel,
  getBookingFrequency,
  enhanceScreen
} from './intelligent-grouping.types';

// Constants
export {
  PRICE_RANGES,
  SORT_OPTIONS,
  FILTER_PRESETS
} from './filter.types';