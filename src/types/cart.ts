import { SportEvents } from '../hooks/useSportEvents';

// Enhanced Event Model for Cart (extending existing SportEvents)
export interface CartEvent extends SportEvents {
  cartId: string;                    // Unique cart identifier
  addedAt: Date;                     // When added to cart
  selectedMoments?: SelectedCartMoment[];
  isConfigured: boolean;             // Whether moments are configured
  estimatedPrice: number;            // Base price from moments[0]?.price
  finalPrice?: number;               // Total price after moment selection
}

// Selected Moment Model (using existing moment structure)
export interface SelectedCartMoment {
  moment: string;                    // From existing moments array
  price: number;                     // From existing momentPrices
  quantity: number;                  // How many of this moment type
  period?: 'FirstHalf' | 'SecondHalf' | 'Halftime';
  creativities?: File[];             // Uploaded creative files
  creativeSpecs?: {
    format: 'image' | 'video';
    dimensions: string;
    duration?: number;
  };
}

// Cart State Model
export interface CartState {
  items: CartEvent[];
  totalItems: number;
  totalPrice: number;
  totalAudience: number;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}



// Cart Analytics Model
export interface CartAnalytics {
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

// Checkout Models
export interface CheckoutValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredBalance: number;
  currentBalance: number;
  shortfall?: number;
}

export interface CheckoutResult {
  success: boolean;
  transactionId?: string;
  message: string;
  updatedBalance?: number;
}

// API Integration Models
export interface CartMomentSelection {
  eventId: string;
  selectedMoments: {
    moment: string;                  // From SportEvents.moments
    quantity: number;
    period?: 'FirstHalf' | 'SecondHalf' | 'Halftime';
  }[];
}

export interface CartPriceCalculation {
  eventId: string;
  moments: SelectedCartMoment[];
  totalPrice: number;
  totalAudience: number;             // From estimatedAttendance + estimatedAttendanceTv
}

export interface CartCheckoutRequest {
  cartItems: CartEvent[];
  paymentMethod: 'wallet';
  totalAmount: number;
}

export interface CartCheckoutResponse {
  success: boolean;
  transactionId?: string;
  remainingBalance?: number;
  purchasedEvents: {
    eventId: string;
    moments: SelectedCartMoment[];
    totalPrice: number;
  }[];
  errors?: string[];
}

// Error Types
export enum CartErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  EVENT_UNAVAILABLE = 'EVENT_UNAVAILABLE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

export interface CartError {
  type: CartErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
  retryAction?: () => void;
}