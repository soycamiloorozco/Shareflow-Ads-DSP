import { CartEvent, SelectedCartMoment } from '../types/cart';
import { SportEvents } from '../hooks/useSportEvents';
import { cartConfig } from '../config/cartConfig';

// Utility functions for cart operations
export const CartUtils = {
  // Generate unique cart ID
  generateCartId: (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `cart-${timestamp}-${random}`;
  },

  // Generate unique draft ID
  generateDraftId: (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `draft-${timestamp}-${random}`;
  },

  // Convert SportEvents to CartEvent
  convertToCartEvent: (event: SportEvents): CartEvent => {
    return {
      ...event,
      cartId: CartUtils.generateCartId(),
      addedAt: new Date(),
      selectedMoments: [],
      isConfigured: false,
      estimatedPrice: event.moments?.[0]?.price || event.momentPrices?.[0]?.price || 0,
      finalPrice: undefined
    };
  },

  // Calculate final price for configured event
  calculateEventPrice: (event: CartEvent): number => {
    if (event.selectedMoments && event.selectedMoments.length > 0) {
      return event.selectedMoments.reduce((total, moment) => {
        return total + (moment.price * moment.quantity);
      }, 0);
    }
    return event.estimatedPrice;
  },

  // Calculate total audience for event
  calculateEventAudience: (event: CartEvent): number => {
    return (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
  },

  // Format price for display
  formatPrice: (price: number, locale: string = 'es-CO'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  },

  // Format number for display (audience, etc.)
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  },

  // Format date for display
  formatDate: (dateString: string, locale: string = 'es-CO'): string => {
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  },

  // Format date for timeline
  formatTimelineDate: (dateString: string, locale: string = 'es-CO'): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  },

  // Check if event is happening soon
  isEventSoon: (eventDate: string, hoursThreshold: number = 24): boolean => {
    const event = new Date(eventDate);
    const now = new Date();
    const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= hoursThreshold;
  },

  // Check if event is in the past
  isEventPast: (eventDate: string): boolean => {
    const event = new Date(eventDate);
    const now = new Date();
    return event.getTime() < now.getTime();
  },

  // Group events by date
  groupEventsByDate: (events: CartEvent[]): Record<string, CartEvent[]> => {
    const groups: Record<string, CartEvent[]> = {};
    
    events.forEach(event => {
      const eventDate = new Date(event.eventDate);
      const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    // Sort events within each date by time
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => {
        const timeA = a.eventTime || '00:00';
        const timeB = b.eventTime || '00:00';
        return timeA.localeCompare(timeB);
      });
    });

    return groups;
  },

  // Validate cart size
  isCartFull: (currentItems: CartEvent[]): boolean => {
    return currentItems.length >= cartConfig.validation.maxItems;
  },

  // Check if event is already in cart
  isEventInCart: (eventId: string, cartItems: CartEvent[]): boolean => {
    return cartItems.some(item => item.id === eventId);
  },

  // Get cart item by event ID
  getCartItemByEventId: (eventId: string, cartItems: CartEvent[]): CartEvent | undefined => {
    return cartItems.find(item => item.id === eventId);
  },

  // Calculate cart statistics
  calculateCartStats: (items: CartEvent[]) => {
    const totalPrice = items.reduce((sum, item) => sum + CartUtils.calculateEventPrice(item), 0);
    const totalAudience = items.reduce((sum, item) => sum + CartUtils.calculateEventAudience(item), 0);
    const configuredItems = items.filter(item => item.isConfigured).length;
    const averagePrice = items.length > 0 ? totalPrice / items.length : 0;
    const costPerImpression = totalAudience > 0 ? totalPrice / totalAudience : 0;

    return {
      totalItems: items.length,
      totalPrice,
      totalAudience,
      configuredItems,
      unconfiguredItems: items.length - configuredItems,
      averagePrice,
      costPerImpression,
      completionPercentage: items.length > 0 ? (configuredItems / items.length) * 100 : 0
    };
  },

  // Sanitize input for security
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim()
      .substring(0, 1000); // Limit length
  },

  // Debounce function for search
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

export default CartUtils;