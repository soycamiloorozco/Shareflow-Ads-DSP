import { SportEvents } from '../hooks/useSportEvents';
import { CartEvent, SelectedCartMoment, CartState, CartErrorType } from '../types/cart';

// Validation Result Interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Cart Validation Rules Configuration
export const CartValidationRules = {
  maxItems: 10,                    // Maximum events in cart
  maxTotalPrice: 50000000,         // Maximum total price (50M COP)
  minConfiguredMoments: 1,         // Minimum moments per event
  maxConfiguredMoments: 5,         // Maximum moments per event
  maxDrafts: 20,                   // Maximum saved drafts
  
  // Validate individual event for cart addition
  validateEvent: (event: SportEvents): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if event is active
    if (event.status !== 'Active') {
      errors.push('El evento no está activo y no se puede agregar al carrito');
    }

    // Check if event has moments available (warning instead of error to allow adding unconfigured events)
    if (!event.moments || event.moments.length === 0) {
      warnings.push('El evento necesita configuración de momentos antes del checkout');
    }

    // Check if event has pricing (warning instead of error to allow adding unconfigured events)
    if (!event.momentPrices || event.momentPrices.length === 0) {
      warnings.push('El evento necesita configuración de precios antes del checkout');
    }

    // Check if event date is not too far in the past (allow events from last 365 days for analysis)
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
    
    if (eventDate < oneYearAgo) {
      errors.push('El evento es demasiado antiguo para ser agregado al carrito');
    } else if (eventDate <= now) {
      warnings.push('Este evento ya ha pasado, pero puede ser útil para análisis');
    }

    // Warning for events happening soon (within 12 hours)
    const twelveHours = 12 * 60 * 60 * 1000;
    if (eventDate.getTime() - now.getTime() < twelveHours && eventDate > now) {
      warnings.push('El evento es muy pronto, asegúrate de configurar los momentos rápidamente');
    }

    // Warning for low attendance events
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    if (totalAudience < 10000) {
      warnings.push('Este evento tiene una audiencia estimada baja');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Validate moment configuration for an event
  validateMoments: (moments: SelectedCartMoment[], event: SportEvents): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check minimum moments
    if (moments.length < CartValidationRules.minConfiguredMoments) {
      errors.push(`Debes seleccionar al menos ${CartValidationRules.minConfiguredMoments} momento(s)`);
    }

    // Check maximum moments
    if (moments.length > CartValidationRules.maxConfiguredMoments) {
      errors.push(`No puedes seleccionar más de ${CartValidationRules.maxConfiguredMoments} momentos`);
    }

    // Check against event's max moments
    const totalQuantity = moments.reduce((sum, moment) => sum + moment.quantity, 0);
    if (totalQuantity > event.maxMoments) {
      errors.push(`El evento solo permite ${event.maxMoments} momentos máximo`);
    }

    // Validate each moment
    moments.forEach((moment, index) => {
      // Check if moment exists in event (only if event has moments array)
      if (event.moments && Array.isArray(event.moments)) {
        const eventMoment = event.moments.find(m => m.moment === moment.moment);
        if (!eventMoment) {
          errors.push(`El momento "${moment.moment}" no está disponible para este evento`);
        }
      }

      // Check if price matches (only if event has momentPrices array)
      if (event.momentPrices && Array.isArray(event.momentPrices)) {
        const eventPrice = event.momentPrices.find(p => p.moment === moment.moment);
        if (!eventPrice || eventPrice.price !== moment.price) {
          errors.push(`El precio del momento "${moment.moment}" no coincide con el precio actual`);
        }
      }

      // Check quantity
      if (moment.quantity <= 0) {
        errors.push(`La cantidad del momento "${moment.moment}" debe ser mayor a 0`);
      }

      // Warning for expensive moments
      if (moment.price > 1000000) { // 1M COP
        warnings.push(`El momento "${moment.moment}" es costoso (${moment.price.toLocaleString('es-CO')} COP)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Validate entire cart before checkout
  validateCheckout: (cart: CartState, walletBalance: number): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if cart is empty
    if (cart.items.length === 0) {
      errors.push('El carrito está vacío');
      return { isValid: false, errors, warnings };
    }

    // Check if all events are configured
    const unconfiguredEvents = cart.items.filter(item => !item.isConfigured);
    if (unconfiguredEvents.length > 0) {
      errors.push(`${unconfiguredEvents.length} evento(s) no tienen momentos configurados`);
    }

    // Check total price limits
    if (cart.totalPrice > CartValidationRules.maxTotalPrice) {
      errors.push(`El total del carrito (${cart.totalPrice.toLocaleString('es-CO')} COP) excede el límite máximo`);
    }

    // Check wallet balance
    if (cart.totalPrice > walletBalance) {
      const shortfall = cart.totalPrice - walletBalance;
      errors.push(`Saldo insuficiente. Necesitas ${shortfall.toLocaleString('es-CO')} COP adicionales`);
    }

    // Warning for large purchases
    if (cart.totalPrice > 10000000) { // 10M COP
      warnings.push('Esta es una compra grande. Revisa cuidadosamente antes de proceder');
    }

    // Warning for many events
    if (cart.items.length > 5) {
      warnings.push('Tienes muchos eventos en el carrito. Considera dividir en múltiples compras');
    }

    // Validate each cart item
    cart.items.forEach((item, index) => {
      const itemValidation = CartValidationRules.validateEvent(item);
      errors.push(...itemValidation.errors.map(error => `Evento ${index + 1}: ${error}`));
      warnings.push(...itemValidation.warnings.map(warning => `Evento ${index + 1}: ${warning}`));

      if (item.selectedMoments && item.selectedMoments.length > 0) {
        const momentsValidation = CartValidationRules.validateMoments(item.selectedMoments, item);
        errors.push(...momentsValidation.errors.map(error => `Evento ${index + 1}: ${error}`));
        warnings.push(...momentsValidation.warnings.map(warning => `Evento ${index + 1}: ${warning}`));
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Validate cart size and limits
  validateCartLimits: (currentItems: CartEvent[], newEvent?: SportEvents): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check maximum items
    if (newEvent && currentItems.length >= CartValidationRules.maxItems) {
      errors.push(`No puedes agregar más de ${CartValidationRules.maxItems} eventos al carrito`);
    }

    // Check for duplicate events
    if (newEvent) {
      const duplicate = currentItems.find(item => item.id === newEvent.id);
      if (duplicate) {
        errors.push('Este evento ya está en tu carrito');
      }
    }

    // Warning for approaching limits
    if (currentItems.length >= CartValidationRules.maxItems - 2) {
      warnings.push(`Te acercas al límite de ${CartValidationRules.maxItems} eventos por carrito`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};

// Cart Error Handler Class
export class CartErrorHandler {
  static handle(error: any, context: string = 'cart'): { type: CartErrorType; message: string; recoverable: boolean } {
    console.error(`Cart error in ${context}:`, error);

    // Network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return {
        type: CartErrorType.NETWORK_ERROR,
        message: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
        recoverable: true
      };
    }

    // Storage errors
    if (error.name === 'QuotaExceededError' || error.message?.includes('storage')) {
      return {
        type: CartErrorType.STORAGE_ERROR,
        message: 'Error de almacenamiento. Libera espacio en tu navegador.',
        recoverable: true
      };
    }

    // Validation errors
    if (error.type === 'validation' || error.message?.includes('validation')) {
      return {
        type: CartErrorType.VALIDATION_ERROR,
        message: error.message || 'Error de validación en el carrito.',
        recoverable: true
      };
    }

    // Event unavailable
    if (error.message?.includes('unavailable') || error.message?.includes('not found')) {
      return {
        type: CartErrorType.EVENT_UNAVAILABLE,
        message: 'El evento ya no está disponible.',
        recoverable: false
      };
    }

    // Configuration errors
    if (error.message?.includes('configuration') || error.message?.includes('moments')) {
      return {
        type: CartErrorType.CONFIGURATION_ERROR,
        message: 'Error al configurar los momentos del evento.',
        recoverable: true
      };
    }

    // Insufficient funds
    if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
      return {
        type: CartErrorType.INSUFFICIENT_FUNDS,
        message: 'Saldo insuficiente para completar la compra.',
        recoverable: true
      };
    }

    // Generic error
    return {
      type: CartErrorType.NETWORK_ERROR,
      message: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
      recoverable: true
    };
  }

  static getRecoveryAction(errorType: CartErrorType): string {
    switch (errorType) {
      case CartErrorType.NETWORK_ERROR:
        return 'Verifica tu conexión a internet y vuelve a intentar';
      case CartErrorType.INSUFFICIENT_FUNDS:
        return 'Recarga tu billetera o guarda como borrador';
      case CartErrorType.EVENT_UNAVAILABLE:
        return 'Busca eventos similares disponibles';
      case CartErrorType.CONFIGURATION_ERROR:
        return 'Revisa la configuración de momentos';
      case CartErrorType.STORAGE_ERROR:
        return 'Libera espacio en tu navegador';
      case CartErrorType.VALIDATION_ERROR:
        return 'Revisa los datos ingresados';
      default:
        return 'Contacta al soporte si el problema persiste';
    }
  }
}

// Utility functions for cart calculations
export const CartCalculations = {
  // Calculate total price for cart
  calculateTotalPrice: (items: CartEvent[]): number => {
    return items.reduce((total, item) => {
      if (item.selectedMoments && item.selectedMoments.length > 0) {
        const itemTotal = item.selectedMoments.reduce((sum, moment) => 
          sum + (moment.price * moment.quantity), 0
        );
        return total + itemTotal;
      }
      return total + (item.estimatedPrice || 0);
    }, 0);
  },

  // Calculate total audience for cart
  calculateTotalAudience: (items: CartEvent[]): number => {
    return items.reduce((total, item) => {
      const eventAudience = (item.estimatedAttendance || 0) + (item.estimatedAttendanceTv || 0);
      return total + eventAudience;
    }, 0);
  },

  // Calculate cost per impression
  calculateCostPerImpression: (totalPrice: number, totalAudience: number): number => {
    return totalAudience > 0 ? totalPrice / totalAudience : 0;
  },

  // Generate cart analytics
  generateAnalytics: (items: CartEvent[]): { totalEvents: number; totalPrice: number; totalAudience: number; costPerImpression: number; averagePricePerEvent: number } => {
    const totalPrice = CartCalculations.calculateTotalPrice(items);
    const totalAudience = CartCalculations.calculateTotalAudience(items);
    const averagePricePerEvent = items.length > 0 ? totalPrice / items.length : 0;
    
    return {
      totalEvents: items.length,
      totalPrice,
      totalAudience,
      costPerImpression: CartCalculations.calculateCostPerImpression(totalPrice, totalAudience),
      averagePricePerEvent
    };
  }
};