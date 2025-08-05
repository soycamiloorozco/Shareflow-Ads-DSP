import { CartValidationRules, CartErrorHandler, CartCalculations } from '../cartValidation';
import { SportEvents } from '../../hooks/useSportEvents';
import { CartEvent, SelectedCartMoment, CartState, CartErrorType } from '../../types/cart';

// Mock SportEvents data
const mockSportEvent: SportEvents = {
  id: '1',
  homeTeamId: 'team1',
  awayTeamId: 'team2',
  stadiumId: 'stadium1',
  eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  eventTime: '20:00',
  estimatedAttendance: 50000,
  estimatedAttendanceTv: 100000,
  maxMoments: 3,
  broadcastChannels: 'ESPN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  homeTeamName: 'Team A',
  awayTeamName: 'Team B',
  homeTeamImage: 'team-a.png',
  awayTeamImage: 'team-b.png',
  stadiumName: 'Stadium Test',
  status: 'Active',
  momentPrices: [
    { moment: 'pre-game', price: 500000 },
    { moment: 'half-time', price: 750000 },
    { moment: 'post-goal', price: 1000000 }
  ],
  moments: [
    { moment: 'pre-game', price: 500000 },
    { moment: 'half-time', price: 750000 },
    { moment: 'post-goal', price: 1000000 }
  ],
  stadiumPhotos: ['stadium1.jpg']
};

const mockSelectedMoments: SelectedCartMoment[] = [
  {
    moment: 'pre-game',
    price: 500000,
    quantity: 1,
    period: 'FirstHalf'
  },
  {
    moment: 'half-time',
    price: 750000,
    quantity: 1,
    period: 'Halftime'
  }
];

const mockCartEvent: CartEvent = {
  ...mockSportEvent,
  cartId: 'cart-1',
  addedAt: new Date(),
  selectedMoments: mockSelectedMoments,
  isConfigured: true,
  estimatedPrice: 500000,
  finalPrice: 1250000
};

describe('CartValidationRules', () => {
  describe('validateEvent', () => {
    it('should validate active event with moments and pricing', () => {
      const result = CartValidationRules.validateEvent(mockSportEvent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject inactive event', () => {
      const inactiveEvent = { ...mockSportEvent, status: 'Inactive' as const };
      const result = CartValidationRules.validateEvent(inactiveEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El evento no está activo y no se puede agregar al carrito');
    });

    it('should reject event without moments', () => {
      const eventWithoutMoments = { ...mockSportEvent, moments: [] };
      const result = CartValidationRules.validateEvent(eventWithoutMoments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El evento no tiene momentos disponibles');
    });

    it('should reject past event', () => {
      const pastEvent = { 
        ...mockSportEvent, 
        eventDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
      };
      const result = CartValidationRules.validateEvent(pastEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El evento ya ha pasado o está en curso');
    });

    it('should warn about events happening soon', () => {
      const soonEvent = { 
        ...mockSportEvent, 
        eventDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours from now
      };
      const result = CartValidationRules.validateEvent(soonEvent);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('El evento es muy pronto, asegúrate de configurar los momentos rápidamente');
    });

    it('should warn about low attendance events', () => {
      const lowAttendanceEvent = { 
        ...mockSportEvent, 
        estimatedAttendance: 5000,
        estimatedAttendanceTv: 2000
      };
      const result = CartValidationRules.validateEvent(lowAttendanceEvent);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Este evento tiene una audiencia estimada baja');
    });
  });

  describe('validateMoments', () => {
    it('should validate correct moment configuration', () => {
      const result = CartValidationRules.validateMoments(mockSelectedMoments, mockSportEvent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject too few moments', () => {
      const result = CartValidationRules.validateMoments([], mockSportEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debes seleccionar al menos 1 momento(s)');
    });

    it('should reject too many moments', () => {
      const tooManyMoments = Array(6).fill(mockSelectedMoments[0]);
      const result = CartValidationRules.validateMoments(tooManyMoments, mockSportEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No puedes seleccionar más de 5 momentos');
    });

    it('should reject moments exceeding event max', () => {
      const exceedingMoments = [
        { ...mockSelectedMoments[0], quantity: 2 },
        { ...mockSelectedMoments[1], quantity: 2 }
      ];
      const result = CartValidationRules.validateMoments(exceedingMoments, mockSportEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El evento solo permite 3 momentos máximo');
    });

    it('should reject invalid moment type', () => {
      const invalidMoments = [
        { ...mockSelectedMoments[0], moment: 'invalid-moment' }
      ];
      const result = CartValidationRules.validateMoments(invalidMoments, mockSportEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El momento "invalid-moment" no está disponible para este evento');
    });

    it('should reject incorrect pricing', () => {
      const wrongPriceMoments = [
        { ...mockSelectedMoments[0], price: 999999 }
      ];
      const result = CartValidationRules.validateMoments(wrongPriceMoments, mockSportEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El precio del momento "pre-game" no coincide con el precio actual');
    });

    it('should warn about expensive moments', () => {
      const expensiveMoments = [
        { ...mockSelectedMoments[0], moment: 'post-goal', price: 1000000 }
      ];
      const result = CartValidationRules.validateMoments(expensiveMoments, mockSportEvent);
      expect(result.warnings).toContain('El momento "post-goal" es costoso (1.000.000 COP)');
    });
  });

  describe('validateCheckout', () => {
    const mockCartState: CartState = {
      items: [mockCartEvent],
      totalItems: 1,
      totalPrice: 1250000,
      totalAudience: 150000,
      isOpen: false,
      loading: false,
      error: null,
      lastUpdated: new Date()
    };

    it('should validate cart with sufficient balance', () => {
      const result = CartValidationRules.validateCheckout(mockCartState, 2000000);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty cart', () => {
      const emptyCart = { ...mockCartState, items: [] };
      const result = CartValidationRules.validateCheckout(emptyCart, 2000000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El carrito está vacío');
    });

    it('should reject cart with unconfigured events', () => {
      const unconfiguredEvent = { ...mockCartEvent, isConfigured: false };
      const cartWithUnconfigured = { ...mockCartState, items: [unconfiguredEvent] };
      const result = CartValidationRules.validateCheckout(cartWithUnconfigured, 2000000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('1 evento(s) no tienen momentos configurados');
    });

    it('should reject cart with insufficient balance', () => {
      const result = CartValidationRules.validateCheckout(mockCartState, 1000000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Saldo insuficiente. Necesitas 250.000 COP adicionales');
    });

    it('should warn about large purchases', () => {
      const expensiveCart = { ...mockCartState, totalPrice: 15000000 };
      const result = CartValidationRules.validateCheckout(expensiveCart, 20000000);
      expect(result.warnings).toContain('Esta es una compra grande. Revisa cuidadosamente antes de proceder');
    });
  });

  describe('validateCartLimits', () => {
    it('should allow adding event to empty cart', () => {
      const result = CartValidationRules.validateCartLimits([], mockSportEvent);
      expect(result.isValid).toBe(true);
    });

    it('should reject adding duplicate event', () => {
      const result = CartValidationRules.validateCartLimits([mockCartEvent], mockSportEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Este evento ya está en tu carrito');
    });

    it('should reject adding event when cart is full', () => {
      const fullCart = Array(10).fill(mockCartEvent).map((item, index) => ({
        ...item,
        id: `event-${index}`,
        cartId: `cart-${index}`
      }));
      const newEvent = { ...mockSportEvent, id: 'new-event' };
      const result = CartValidationRules.validateCartLimits(fullCart, newEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No puedes agregar más de 10 eventos al carrito');
    });

    it('should warn when approaching cart limit', () => {
      const nearFullCart = Array(8).fill(mockCartEvent).map((item, index) => ({
        ...item,
        id: `event-${index}`,
        cartId: `cart-${index}`
      }));
      const result = CartValidationRules.validateCartLimits(nearFullCart);
      expect(result.warnings).toContain('Te acercas al límite de 10 eventos por carrito');
    });
  });
});

describe('CartErrorHandler', () => {
  it('should handle network errors', () => {
    const networkError = { name: 'NetworkError' };
    const result = CartErrorHandler.handle(networkError);
    expect(result.type).toBe(CartErrorType.NETWORK_ERROR);
    expect(result.recoverable).toBe(true);
  });

  it('should handle storage errors', () => {
    const storageError = { name: 'QuotaExceededError' };
    const result = CartErrorHandler.handle(storageError);
    expect(result.type).toBe(CartErrorType.STORAGE_ERROR);
    expect(result.recoverable).toBe(true);
  });

  it('should handle validation errors', () => {
    const validationError = { type: 'validation', message: 'Invalid data' };
    const result = CartErrorHandler.handle(validationError);
    expect(result.type).toBe(CartErrorType.VALIDATION_ERROR);
    expect(result.recoverable).toBe(true);
  });

  it('should handle insufficient funds errors', () => {
    const fundsError = { message: 'insufficient balance' };
    const result = CartErrorHandler.handle(fundsError);
    expect(result.type).toBe(CartErrorType.INSUFFICIENT_FUNDS);
    expect(result.recoverable).toBe(true);
  });

  it('should provide recovery actions', () => {
    expect(CartErrorHandler.getRecoveryAction(CartErrorType.NETWORK_ERROR))
      .toBe('Verifica tu conexión a internet y vuelve a intentar');
    expect(CartErrorHandler.getRecoveryAction(CartErrorType.INSUFFICIENT_FUNDS))
      .toBe('Recarga tu billetera o guarda como borrador');
  });
});

describe('CartCalculations', () => {
  it('should calculate total price correctly', () => {
    const total = CartCalculations.calculateTotalPrice([mockCartEvent]);
    expect(total).toBe(1250000); // 500000 + 750000
  });

  it('should calculate total audience correctly', () => {
    const total = CartCalculations.calculateTotalAudience([mockCartEvent]);
    expect(total).toBe(150000); // 50000 + 100000
  });

  it('should calculate cost per impression', () => {
    const cost = CartCalculations.calculateCostPerImpression(1250000, 150000);
    expect(cost).toBeCloseTo(8.33, 2);
  });

  it('should generate analytics correctly', () => {
    const analytics = CartCalculations.generateAnalytics([mockCartEvent]);
    expect(analytics.totalEvents).toBe(1);
    expect(analytics.totalPrice).toBe(1250000);
    expect(analytics.totalAudience).toBe(150000);
    expect(analytics.costPerImpression).toBeCloseTo(8.33, 2);
  });

  it('should handle empty cart', () => {
    const analytics = CartCalculations.generateAnalytics([]);
    expect(analytics.totalEvents).toBe(0);
    expect(analytics.totalPrice).toBe(0);
    expect(analytics.totalAudience).toBe(0);
    expect(analytics.costPerImpression).toBe(0);
  });
});