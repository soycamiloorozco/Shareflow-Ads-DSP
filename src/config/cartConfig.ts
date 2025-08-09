// Cart System Configuration
export const cartConfig = {
  // Storage settings
  storage: {
    keyPrefix: 'shareflow_cart_',
    draftKeyPrefix: 'shareflow_draft_',
    maxStorageSize: 5 * 1024 * 1024, // 5MB
    compressionEnabled: true,
  },

  // Validation rules
  validation: {
    maxItems: 10,
    maxTotalPrice: 50000000, // 50M COP
    minConfiguredMoments: 1,
    maxConfiguredMoments: 5,
    maxDrafts: 20,
    eventDateValidationDays: 30, // Allow events from last 30 days
  },

  // UI settings
  ui: {
    animationDuration: 300,
    autoHideNotifications: true,
    notificationDuration: 5000,
    enableKeyboardNavigation: true,
    enableScreenReaderSupport: true,
    mobileBreakpoint: 768,
  },

  // Performance settings
  performance: {
    enableVirtualScrolling: false, // For large carts
    lazyLoadImages: true,
    debounceSearchMs: 300,
    throttleScrollMs: 100,
    maxConcurrentRequests: 3,
  },

  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    enableErrorReporting: process.env.NODE_ENV === 'production',
    fallbackToLocalStorage: true,
  },

  // Analytics
  analytics: {
    trackCartEvents: true,
    trackUserInteractions: true,
    trackPerformanceMetrics: true,
    batchEventsSizeLimit: 10,
    flushInterval: 30000, // 30 seconds
  },

  // Feature flags
  features: {
    enableDraftSharing: true,
    enableBulkOperations: true,
    enableAdvancedFiltering: true,
    enableTimelineView: true,
    enableAnalytics: true,
    enableOfflineMode: false,
  },

  // Security
  security: {
    enableInputSanitization: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 60,
    enableCSRFProtection: true,
    sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
  },

  // Accessibility
  accessibility: {
    enableHighContrast: false,
    enableReducedMotion: false,
    enableVoiceControl: false,
    minTouchTargetSize: 44, // pixels
    enableFocusTrapping: true,
  },
} as const;

// Type for cart configuration
export type CartConfig = typeof cartConfig;

// Environment-specific overrides
export const getCartConfig = (): CartConfig => {
  const config = { ...cartConfig };

  // Development overrides
  if (process.env.NODE_ENV === 'development') {
    config.errorHandling.enableErrorReporting = false;
    config.analytics.trackCartEvents = false;
    config.validation.maxItems = 20; // Allow more items in development
  }

  // Test environment overrides
  if (process.env.NODE_ENV === 'test') {
    config.ui.animationDuration = 0; // Disable animations in tests
    config.ui.autoHideNotifications = false;
    config.analytics.trackCartEvents = false;
    config.errorHandling.maxRetries = 1;
  }

  return config;
};

export default cartConfig;