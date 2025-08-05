# Design Document

## Overview

This design outlines a comprehensive shopping cart system specifically for sports events that enables users to create multi-event advertising strategies. The system integrates seamlessly with the existing wallet functionality and provides both immediate purchase and draft-saving capabilities. The design emphasizes mobile-first responsive design, real-time updates, and intuitive user experience patterns.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Sports Events Cart System                │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ├── SportsEvents.tsx (Enhanced with cart features)        │
│  ├── CartDrawer/Modal Components                           │
│  ├── MomentConfiguration Components                        │
│  └── CheckoutFlow Components                               │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                     │
│  ├── CartContext (React Context + useReducer)              │
│  ├── Cart Persistence (localStorage + sessionStorage)      │
│  └── Real-time Updates (event listeners)                   │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├── Cart Operations (add, remove, update)                 │
│  ├── Moment Configuration Logic                            │
│  ├── Pricing Calculations                                  │
│  └── Wallet Integration                                     │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── Cart Storage Service                                   │
│  ├── Draft Management Service                              │
│  └── Analytics Service                                      │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The cart system will be built using a modular component architecture:

```typescript
// Core Cart Components
CartProvider                    // Context provider for cart state
├── CartIcon                   // Navigation cart indicator
├── CartDrawer                 // Main cart interface
│   ├── CartHeader            // Cart title and actions
│   ├── CartItemList          // List of cart items
│   │   └── CartItem          // Individual event in cart
│   ├── CartSummary           // Totals and analytics
│   └── CartActions           // Checkout/save buttons
├── MomentConfigModal         // Moment selection interface
│   ├── MomentSelector        // Time slot selection
│   ├── PricingDisplay        // Real-time pricing
│   └── ConfigSummary         // Selected moments summary
└── CheckoutFlow              // Purchase/draft flow
    ├── WalletCheck           // Balance verification
    ├── PaymentOptions        // Purchase or save options
    └── ConfirmationScreen    // Success/draft saved
```

## Components and Interfaces

### Core Data Models

```typescript
// Enhanced Event Model for Cart (using existing SportEvents interface)
interface CartEvent extends SportEvents {
  cartId: string;                    // Unique cart identifier
  addedAt: Date;                     // When added to cart
  selectedMoments?: SelectedCartMoment[];
  isConfigured: boolean;             // Whether moments are configured
  estimatedPrice: number;            // Base price from moments[0]?.price
  finalPrice?: number;               // Total price after moment selection
}

// Selected Moment Model (using existing moment structure)
interface SelectedCartMoment {
  moment: string;                    // From existing moments array
  price: number;                     // From existing momentPrices
  quantity: number;                  // How many of this moment type
  period?: 'FirstHalf' | 'SecondHalf' | 'Halftime';
  creativeSpecs?: {
    format: 'image' | 'video';
    dimensions: string;
    duration?: number;
  };
}

// Cart State Model
interface CartState {
  items: CartEvent[];
  totalItems: number;
  totalPrice: number;
  totalAudience: number;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}

// Draft Model
interface CartDraft {
  id: string;
  name: string;
  description?: string;
  items: CartEvent[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}
```

### Cart Context and State Management

```typescript
// Cart Context Interface
interface CartContextType {
  // State
  cart: CartState;
  drafts: CartDraft[];
  
  // Cart Operations
  addEvent: (event: SportEvent) => Promise<void>;
  removeEvent: (cartId: string) => Promise<void>;
  updateEvent: (cartId: string, updates: Partial<CartEvent>) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Moment Configuration (using existing API)
  configureMoments: (cartId: string, moments: SelectedCartMoment[]) => Promise<void>;
  getMomentOptions: (eventId: string) => Promise<SportEvents['moments']>;
  
  // Cart Management
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
  
  // Draft Operations
  saveDraft: (name: string, description?: string) => Promise<string>;
  loadDraft: (draftId: string) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  
  // Checkout
  validateCheckout: () => Promise<CheckoutValidation>;
  processCheckout: () => Promise<CheckoutResult>;
  
  // Analytics
  getCartAnalytics: () => CartAnalytics;
}

// Supporting Types (using existing SportEvents structure)
interface MomentOption {
  moment: string;                    // From SportEvents.moments
  price: number;                     // From SportEvents.momentPrices
  availability: 'available' | 'limited' | 'unavailable';
  maxQuantity: number;               // Based on SportEvents.maxMoments
}

interface CheckoutValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredBalance: number;
  currentBalance: number;
  shortfall?: number;
}

interface CheckoutResult {
  success: boolean;
  transactionId?: string;
  draftId?: string;
  message: string;
  updatedBalance?: number;
}

interface CartAnalytics {
  totalEvents: number;
  totalPrice: number;
  totalAudience: number;
  averagePricePerEvent: number;
  costPerImpression: number;
  audienceReach: {
    unique: number;
    overlap: number;
    demographics: Record<string, number>;
  };
  recommendations: string[];
}
```

### Enhanced SportsEvents Component

```typescript
// Enhanced EventCard with Cart Integration
interface EventCardProps {
  event: SportEvent;
  index: number;
  onClick: () => void;
  isInCart?: boolean;
  onAddToCart?: (event: SportEvent) => void;
  onRemoveFromCart?: (event: SportEvent) => void;
  cartQuantity?: number;
}

// Cart Integration in SportsEvents
const SportsEvents: React.FC = () => {
  const { cart, addEvent, removeEvent } = useCart();
  
  // Enhanced event handling
  const handleAddToCart = useCallback(async (event: SportEvent) => {
    try {
      await addEvent(event);
      // Show success notification
    } catch (error) {
      // Handle error
    }
  }, [addEvent]);
  
  // Cart indicator logic
  const isEventInCart = useCallback((eventId: string) => {
    return cart.items.some(item => item.id === eventId);
  }, [cart.items]);
  
  return (
    // Enhanced component with cart features
  );
};
```

## Data Models

### Cart Storage Schema

```typescript
// LocalStorage Schema
interface CartStorageSchema {
  version: string;
  cart: {
    items: CartEvent[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      expiresAt: Date;
    };
  };
  drafts: CartDraft[];
  preferences: {
    autoSave: boolean;
    notifications: boolean;
    defaultMomentTypes: string[];
  };
}

// Session Storage for Temporary Data
interface SessionCartData {
  currentConfiguring?: string;     // Event being configured
  checkoutStep?: number;           // Current checkout step
  tempSelections?: any;            // Temporary selections
}
```

### API Integration Models

```typescript
// Using existing SportEvents API structure
interface CartMomentSelection {
  eventId: string;
  selectedMoments: {
    moment: string;                  // From SportEvents.moments
    quantity: number;
    period?: 'FirstHalf' | 'SecondHalf' | 'Halftime';
  }[];
}

interface CartPriceCalculation {
  eventId: string;
  moments: SelectedCartMoment[];
  totalPrice: number;
  totalAudience: number;             // From estimatedAttendance + estimatedAttendanceTv
}

// Checkout API (integrating with existing wallet system)
interface CartCheckoutRequest {
  cartItems: CartEvent[];
  paymentMethod: 'wallet' | 'draft';
  draftName?: string;
  draftDescription?: string;
  totalAmount: number;
}

interface CartCheckoutResponse {
  success: boolean;
  transactionId?: string;
  draftId?: string;
  remainingBalance?: number;
  purchasedEvents: {
    eventId: string;
    moments: SelectedCartMoment[];
    totalPrice: number;
  }[];
  errors?: string[];
}
```

## Error Handling

### Cart Error Management

```typescript
// Error Types
enum CartErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  EVENT_UNAVAILABLE = 'EVENT_UNAVAILABLE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

interface CartError {
  type: CartErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
  retryAction?: () => void;
}

// Error Handling Strategy
class CartErrorHandler {
  static handle(error: CartError): void {
    switch (error.type) {
      case CartErrorType.NETWORK_ERROR:
        // Show retry option
        break;
      case CartErrorType.INSUFFICIENT_FUNDS:
        // Redirect to wallet recharge
        break;
      case CartErrorType.EVENT_UNAVAILABLE:
        // Remove from cart and notify
        break;
      // ... other cases
    }
  }
}
```

### Validation Rules

```typescript
// Cart Validation Rules
const CartValidationRules = {
  maxItems: 10,                    // Maximum events in cart
  maxTotalPrice: 50000000,         // Maximum total price (50M COP)
  minConfiguredMoments: 1,         // Minimum moments per event
  maxConfiguredMoments: 5,         // Maximum moments per event
  
  validateEvent: (event: SportEvent): ValidationResult => {
    // Event validation logic
  },
  
  validateMoments: (moments: ConfiguredMoment[]): ValidationResult => {
    // Moment validation logic
  },
  
  validateCheckout: (cart: CartState, walletBalance: number): ValidationResult => {
    // Checkout validation logic
  }
};
```

## Testing Strategy

### Unit Testing

```typescript
// Cart Context Tests
describe('CartContext', () => {
  test('should add event to cart', async () => {
    // Test event addition
  });
  
  test('should calculate totals correctly', () => {
    // Test price calculations
  });
  
  test('should handle moment configuration', async () => {
    // Test moment configuration
  });
  
  test('should validate checkout requirements', () => {
    // Test checkout validation
  });
});

// Component Tests
describe('CartDrawer', () => {
  test('should display cart items correctly', () => {
    // Test cart display
  });
  
  test('should handle item removal', () => {
    // Test item removal
  });
  
  test('should show correct totals', () => {
    // Test total calculations
  });
});
```

### Integration Testing

```typescript
// Cart Integration Tests
describe('Cart Integration', () => {
  test('should persist cart across sessions', () => {
    // Test persistence
  });
  
  test('should integrate with wallet system', () => {
    // Test wallet integration
  });
  
  test('should handle checkout flow', () => {
    // Test complete checkout
  });
  
  test('should manage drafts correctly', () => {
    // Test draft functionality
  });
});
```

### E2E Testing Scenarios

```typescript
// End-to-End Test Scenarios
const E2EScenarios = [
  {
    name: 'Complete Multi-Event Purchase',
    steps: [
      'Navigate to SportsEvents',
      'Add multiple events to cart',
      'Configure moments for each event',
      'Proceed to checkout',
      'Complete purchase with wallet',
      'Verify transaction in wallet history'
    ]
  },
  {
    name: 'Save Draft with Insufficient Funds',
    steps: [
      'Add events to cart',
      'Configure moments',
      'Attempt checkout with insufficient funds',
      'Save as draft',
      'Verify draft is saved',
      'Load draft later'
    ]
  },
  {
    name: 'Mobile Cart Experience',
    steps: [
      'Use mobile device',
      'Add events to cart',
      'Open cart drawer',
      'Configure moments on mobile',
      'Complete mobile checkout'
    ]
  }
];
```

## Performance Considerations

### Optimization Strategies

```typescript
// Performance Optimizations
const PerformanceOptimizations = {
  // Lazy Loading
  lazyLoadMomentOptions: true,
  
  // Memoization
  memoizeCartCalculations: true,
  memoizeEventFiltering: true,
  
  // Debouncing
  debounceCartUpdates: 300,        // ms
  debounceSearch: 500,             // ms
  
  // Virtual Scrolling
  virtualizeCartItems: true,       // For large carts
  itemHeight: 120,                 // px
  
  // Caching
  cacheEventData: true,
  cacheDuration: 300000,           // 5 minutes
  
  // Bundle Splitting
  splitCartComponents: true,       // Code splitting for cart
  preloadCartOnHover: true,        // Preload cart components
};

// Memory Management
class CartMemoryManager {
  static cleanup(): void {
    // Clean up event listeners
    // Clear temporary data
    // Optimize storage usage
  }
  
  static optimizeStorage(): void {
    // Compress cart data
    // Remove expired items
    // Optimize draft storage
  }
}
```

### Mobile Performance

```typescript
// Mobile-Specific Optimizations
const MobileOptimizations = {
  // Touch Interactions
  touchFeedback: true,
  hapticFeedback: true,
  
  // Gesture Support
  swipeToRemove: true,
  pullToRefresh: true,
  
  // Loading States
  skeletonLoading: true,
  progressiveLoading: true,
  
  // Offline Support
  offlineCartAccess: true,
  syncOnReconnect: true,
  
  // Battery Optimization
  reduceAnimations: 'auto',        // Based on battery level
  optimizePolling: true,           // Reduce background updates
};
```

## Security Considerations

### Data Protection

```typescript
// Security Measures
const SecurityMeasures = {
  // Data Encryption
  encryptSensitiveData: true,
  encryptionKey: 'user-specific-key',
  
  // Input Validation
  validateAllInputs: true,
  sanitizeUserData: true,
  
  // Session Management
  sessionTimeout: 3600000,         // 1 hour
  autoLogoutOnInactivity: true,
  
  // API Security
  rateLimiting: true,
  requestSigning: true,
  
  // Storage Security
  secureLocalStorage: true,
  dataExpiration: true,
};

// Privacy Protection
class PrivacyManager {
  static anonymizeAnalytics(data: any): any {
    // Remove personally identifiable information
    // Hash sensitive data
    return anonymizedData;
  }
  
  static clearSensitiveData(): void {
    // Clear payment information
    // Remove personal preferences
    // Clean tracking data
  }
}
```

## Accessibility Features

### WCAG Compliance

```typescript
// Accessibility Features
const AccessibilityFeatures = {
  // Keyboard Navigation
  keyboardNavigation: true,
  focusManagement: true,
  tabOrder: 'logical',
  
  // Screen Reader Support
  ariaLabels: true,
  ariaDescriptions: true,
  liveRegions: true,
  
  // Visual Accessibility
  highContrast: true,
  focusIndicators: true,
  colorBlindSupport: true,
  
  // Motor Accessibility
  largeClickTargets: true,         // Minimum 44px
  reducedMotion: 'respect-preference',
  voiceControl: true,
  
  // Cognitive Accessibility
  clearInstructions: true,
  errorPrevention: true,
  undoActions: true,
};

// Accessibility Testing
const AccessibilityTests = [
  'Keyboard-only navigation',
  'Screen reader compatibility',
  'Color contrast validation',
  'Focus management testing',
  'Voice control testing'
];
```

## Internationalization

### Multi-language Support

```typescript
// i18n Configuration
const i18nConfig = {
  defaultLanguage: 'es-CO',
  supportedLanguages: ['es-CO', 'en-US'],
  
  // Cart-specific translations
  translations: {
    'es-CO': {
      cart: {
        title: 'Carrito de Eventos',
        addToCart: 'Agregar al Carrito',
        removeFromCart: 'Quitar del Carrito',
        configureMoments: 'Configurar Momentos',
        checkout: 'Finalizar Compra',
        saveDraft: 'Guardar Borrador',
        // ... more translations
      }
    },
    'en-US': {
      cart: {
        title: 'Events Cart',
        addToCart: 'Add to Cart',
        removeFromCart: 'Remove from Cart',
        configureMoments: 'Configure Moments',
        checkout: 'Checkout',
        saveDraft: 'Save Draft',
        // ... more translations
      }
    }
  },
  
  // Currency and number formatting
  formatting: {
    currency: 'COP',
    numberFormat: 'es-CO',
    dateFormat: 'es-CO'
  }
};
```

## Analytics and Monitoring

### Cart Analytics

```typescript
// Analytics Events
const CartAnalyticsEvents = {
  // Cart Actions
  CART_EVENT_ADDED: 'cart_event_added',
  CART_EVENT_REMOVED: 'cart_event_removed',
  CART_OPENED: 'cart_opened',
  CART_CLOSED: 'cart_closed',
  
  // Moment Configuration
  MOMENTS_CONFIGURED: 'moments_configured',
  MOMENT_SELECTED: 'moment_selected',
  CONFIGURATION_COMPLETED: 'configuration_completed',
  
  // Checkout Flow
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CHECKOUT_ABANDONED: 'checkout_abandoned',
  DRAFT_SAVED: 'draft_saved',
  DRAFT_LOADED: 'draft_loaded',
  
  // Errors
  CART_ERROR: 'cart_error',
  CHECKOUT_ERROR: 'checkout_error',
  CONFIGURATION_ERROR: 'configuration_error'
};

// Performance Monitoring
const PerformanceMetrics = {
  cartLoadTime: 'cart_load_time',
  checkoutDuration: 'checkout_duration',
  configurationTime: 'configuration_time',
  apiResponseTime: 'api_response_time'
};
```

This comprehensive design provides a robust foundation for implementing the sports events shopping cart functionality with all the required features, performance optimizations, and user experience considerations.