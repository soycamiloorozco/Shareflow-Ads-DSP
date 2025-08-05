import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { SportEvents } from '../../hooks/useSportEvents';
import { SelectedCartMoment } from '../../types/cart';
import CartStorageService from '../../utils/cartStorage';

// Mock CartStorageService
jest.mock('../../utils/cartStorage', () => ({
  __esModule: true,
  default: {
    initializeStorage: jest.fn(),
    saveCartItems: jest.fn(),
    loadCartItems: jest.fn(() => []),
    saveDraft: jest.fn(),
    loadDrafts: jest.fn(() => []),
    deleteDraft: jest.fn(),
    clearCart: jest.fn()
  }
}));

const mockCartStorageService = CartStorageService as jest.Mocked<typeof CartStorageService>;

// Mock SportEvents data
const mockSportEvent: SportEvents = {
  id: '1',
  homeTeamId: 'team1',
  awayTeamId: 'team2',
  stadiumId: 'stadium1',
  eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
    { moment: 'half-time', price: 750000 }
  ],
  moments: [
    { moment: 'pre-game', price: 500000 },
    { moment: 'half-time', price: 750000 }
  ],
  stadiumPhotos: ['stadium1.jpg']
};

const mockSelectedMoments: SelectedCartMoment[] = [
  {
    moment: 'pre-game',
    price: 500000,
    quantity: 1,
    period: 'FirstHalf'
  }
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartStorageService.loadCartItems.mockReturnValue([]);
    mockCartStorageService.loadDrafts.mockReturnValue([]);
  });

  describe('useCart hook', () => {
    it('should throw error when used outside CartProvider', () => {
      const TestComponent = () => {
        useCart();
        return null;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<TestComponent />)).toThrow('useCart must be used within a CartProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide cart context when used within CartProvider', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      expect(result.current).toBeDefined();
      expect(result.current.cart).toBeDefined();
      expect(result.current.addEvent).toBeDefined();
      expect(result.current.removeEvent).toBeDefined();
    });
  });

  describe('Cart initialization', () => {
    it('should initialize storage and load cart data on mount', async () => {
      renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(mockCartStorageService.initializeStorage).toHaveBeenCalled();
        expect(mockCartStorageService.loadCartItems).toHaveBeenCalled();
        expect(mockCartStorageService.loadDrafts).toHaveBeenCalled();
      });
    });

    it('should handle initialization errors gracefully', async () => {
      mockCartStorageService.initializeStorage.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result.current.cart.error).toBeTruthy();
        expect(result.current.cart.loading).toBe(false);
      });
    });
  });

  describe('addEvent', () => {
    it('should add event to cart successfully', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      expect(result.current.cart.items).toHaveLength(1);
      expect(result.current.cart.items[0].id).toBe(mockSportEvent.id);
      expect(result.current.cart.items[0].isConfigured).toBe(false);
      expect(result.current.cart.totalItems).toBe(1);
    });

    it('should not add duplicate events', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      expect(result.current.cart.items).toHaveLength(1);
    });

    it('should handle inactive events', async () => {
      const inactiveEvent = { ...mockSportEvent, status: 'Inactive' as const };
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        try {
          await result.current.addEvent(inactiveEvent);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.cart.items).toHaveLength(0);
      expect(result.current.cart.error).toBeTruthy();
    });

    it('should save cart items to storage after adding', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      await waitFor(() => {
        expect(mockCartStorageService.saveCartItems).toHaveBeenCalled();
      });
    });
  });

  describe('removeEvent', () => {
    it('should remove event from cart', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add event first
      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      const cartId = result.current.cart.items[0].cartId;

      // Remove event
      await act(async () => {
        await result.current.removeEvent(cartId);
      });

      expect(result.current.cart.items).toHaveLength(0);
      expect(result.current.cart.totalItems).toBe(0);
    });
  });

  describe('configureMoments', () => {
    it('should configure moments for an event', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add event first
      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      const cartId = result.current.cart.items[0].cartId;

      // Configure moments
      await act(async () => {
        await result.current.configureMoments(cartId, mockSelectedMoments);
      });

      const updatedItem = result.current.cart.items[0];
      expect(updatedItem.isConfigured).toBe(true);
      expect(updatedItem.selectedMoments).toEqual(mockSelectedMoments);
      expect(updatedItem.finalPrice).toBe(500000);
    });

    it('should handle invalid moment configuration', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add event first
      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      const cartId = result.current.cart.items[0].cartId;
      const invalidMoments = [
        { ...mockSelectedMoments[0], moment: 'invalid-moment' }
      ];

      // Try to configure invalid moments
      await act(async () => {
        try {
          await result.current.configureMoments(cartId, invalidMoments);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.cart.error).toBeTruthy();
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add event first
      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      expect(result.current.cart.items).toHaveLength(1);

      // Clear cart
      await act(async () => {
        await result.current.clearCart();
      });

      expect(result.current.cart.items).toHaveLength(0);
      expect(result.current.cart.totalItems).toBe(0);
      expect(result.current.cart.totalPrice).toBe(0);
      expect(mockCartStorageService.clearCart).toHaveBeenCalled();
    });
  });

  describe('draft operations', () => {
    it('should save cart as draft', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add event first
      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      // Save as draft
      let draftId: string;
      await act(async () => {
        draftId = await result.current.saveDraft('Test Draft', 'Test description');
      });

      expect(draftId).toBeDefined();
      expect(mockCartStorageService.saveDraft).toHaveBeenCalled();
      expect(result.current.drafts).toHaveLength(1);
    });

    it('should not save empty cart as draft', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        try {
          await result.current.saveDraft('Empty Draft');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.cart.error).toBeTruthy();
    });

    it('should load draft into cart', async () => {
      const mockDraft = {
        id: 'draft-1',
        name: 'Test Draft',
        items: [{
          ...mockSportEvent,
          cartId: 'cart-1',
          addedAt: new Date(),
          isConfigured: true,
          estimatedPrice: 500000,
          finalPrice: 500000
        }],
        totalPrice: 500000,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: []
      };

      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Manually set drafts
      act(() => {
        result.current.drafts.push(mockDraft);
      });

      // Load draft
      await act(async () => {
        await result.current.loadDraft('draft-1');
      });

      expect(result.current.cart.items).toHaveLength(1);
      expect(result.current.cart.items[0].id).toBe(mockSportEvent.id);
    });
  });

  describe('checkout validation', () => {
    it('should validate checkout with sufficient balance', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add and configure event
      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      const cartId = result.current.cart.items[0].cartId;
      await act(async () => {
        await result.current.configureMoments(cartId, mockSelectedMoments);
      });

      // Validate checkout
      let validation;
      await act(async () => {
        validation = await result.current.validateCheckout(1000000);
      });

      expect(validation.isValid).toBe(true);
      expect(validation.shortfall).toBeUndefined();
    });

    it('should detect insufficient balance', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      // Add and configure event
      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      const cartId = result.current.cart.items[0].cartId;
      await act(async () => {
        await result.current.configureMoments(cartId, mockSelectedMoments);
      });

      // Validate checkout with insufficient balance
      let validation;
      await act(async () => {
        validation = await result.current.validateCheckout(100000);
      });

      expect(validation.isValid).toBe(false);
      expect(validation.shortfall).toBe(400000); // 500000 - 100000
    });
  });

  describe('utility functions', () => {
    it('should check if event is in cart', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      expect(result.current.isEventInCart(mockSportEvent.id)).toBe(false);

      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      expect(result.current.isEventInCart(mockSportEvent.id)).toBe(true);
    });

    it('should get cart item by event ID', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      expect(result.current.getCartItemByEventId(mockSportEvent.id)).toBeUndefined();

      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      const cartItem = result.current.getCartItemByEventId(mockSportEvent.id);
      expect(cartItem).toBeDefined();
      expect(cartItem?.id).toBe(mockSportEvent.id);
    });

    it('should generate cart analytics', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      await act(async () => {
        await result.current.addEvent(mockSportEvent);
      });

      const analytics = result.current.getCartAnalytics();
      expect(analytics.totalEvents).toBe(1);
      expect(analytics.totalAudience).toBe(150000); // 50000 + 100000
      expect(analytics.recommendations).toBeDefined();
    });
  });

  describe('toggleCart', () => {
    it('should toggle cart open/closed state', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: TestWrapper
      });

      expect(result.current.cart.isOpen).toBe(false);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.cart.isOpen).toBe(true);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.cart.isOpen).toBe(false);
    });
  });
});