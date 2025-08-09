import { renderHook, act, waitFor } from '@testing-library/react';
import { useCartManagement } from '../useCartManagement';
import { useCart } from '../../contexts/CartContext';
import CartStorageService from '../../utils/cartStorage';

// Mock dependencies
jest.mock('../../contexts/CartContext');
jest.mock('../../utils/cartStorage');

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockCartStorageService = CartStorageService as jest.Mocked<typeof CartStorageService>;

// Mock cart context
const mockCartContext = {
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    totalAudience: 0,
    isOpen: false,
    loading: false,
    error: null,
    lastUpdated: new Date()
  },
  refreshCart: jest.fn(),
  clearCart: jest.fn(),
  resolveCartConflicts: jest.fn(),
  updateItemQuantity: jest.fn()
};

describe('useCartManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue(mockCartContext as any);
    
    // Mock CartStorageService methods
    mockCartStorageService.getCartStatistics.mockReturnValue({
      totalItems: 0,
      totalDrafts: 0,
      storageSize: 1024,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      daysUntilExpiry: 7
    });
    
    mockCartStorageService.isCartNearExpiry.mockReturnValue(false);
    mockCartStorageService.cleanupExpiredCarts.mockImplementation(() => {});
    mockCartStorageService.extendCartExpiry.mockImplementation(() => {});
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCartManagement());
      
      expect(result.current.managementState.isNearExpiry).toBe(false);
      expect(result.current.managementState.daysUntilExpiry).toBe(7);
      expect(result.current.managementState.storageSize).toBe(1024);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should perform auto-cleanup when enabled', async () => {
      renderHook(() => useCartManagement({ autoCleanup: true }));
      
      await waitFor(() => {
        expect(mockCartStorageService.cleanupExpiredCarts).toHaveBeenCalled();
        expect(mockCartContext.refreshCart).toHaveBeenCalled();
      });
    });

    it('should check expiry when enabled', async () => {
      renderHook(() => useCartManagement({ checkExpiry: true }));
      
      await waitFor(() => {
        expect(mockCartStorageService.getCartStatistics).toHaveBeenCalled();
        expect(mockCartStorageService.isCartNearExpiry).toHaveBeenCalled();
      });
    });
  });

  describe('cart status checking', () => {
    it('should update management state when checking status', async () => {
      const { result } = renderHook(() => useCartManagement());
      
      await act(async () => {
        await result.current.checkCartStatus();
      });
      
      expect(result.current.managementState.daysUntilExpiry).toBe(7);
      expect(result.current.managementState.storageSize).toBe(1024);
    });

    it('should auto-extend expiry when near expiry and auto-extend is enabled', async () => {
      mockCartStorageService.isCartNearExpiry.mockReturnValue(true);
      mockCartContext.cart.items = [{ id: '1' } as any];
      
      const { result } = renderHook(() => useCartManagement({ autoExtendExpiry: true }));
      
      await act(async () => {
        await result.current.checkCartStatus();
      });
      
      expect(mockCartStorageService.extendCartExpiry).toHaveBeenCalledWith(30);
    });
  });

  describe('cleanup operations', () => {
    it('should perform cleanup successfully', async () => {
      const { result } = renderHook(() => useCartManagement());
      
      await act(async () => {
        await result.current.performCleanup();
      });
      
      expect(mockCartStorageService.cleanupExpiredCarts).toHaveBeenCalled();
      expect(mockCartContext.refreshCart).toHaveBeenCalled();
    });

    it('should not perform cleanup when already processing', async () => {
      const { result } = renderHook(() => useCartManagement());
      
      // Start first cleanup
      const cleanup1 = act(async () => {
        await result.current.performCleanup();
      });
      
      // Try to start second cleanup while first is running
      const cleanup2 = act(async () => {
        await result.current.performCleanup();
      });
      
      await Promise.all([cleanup1, cleanup2]);
      
      // Should only be called once
      expect(mockCartStorageService.cleanupExpiredCarts).toHaveBeenCalledTimes(1);
    });
  });

  describe('conflict resolution', () => {
    it('should resolve cart conflicts', async () => {
      const { result } = renderHook(() => useCartManagement());
      
      await act(async () => {
        await result.current.resolveConflicts();
      });
      
      expect(mockCartContext.resolveCartConflicts).toHaveBeenCalled();
    });
  });

  describe('expiry management', () => {
    it('should extend cart expiry', async () => {
      const { result } = renderHook(() => useCartManagement());
      
      let success;
      await act(async () => {
        success = await result.current.extendExpiry(15);
      });
      
      expect(success).toBe(true);
      expect(mockCartStorageService.extendCartExpiry).toHaveBeenCalledWith(15);
    });

    it('should handle expiry extension errors', async () => {
      mockCartStorageService.extendCartExpiry.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useCartManagement());
      
      let success;
      await act(async () => {
        success = await result.current.extendExpiry();
      });
      
      expect(success).toBe(false);
    });
  });

  describe('cart clearing', () => {
    it('should clear cart with confirmation', async () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);
      
      const { result } = renderHook(() => useCartManagement());
      
      let success;
      await act(async () => {
        success = await result.current.clearCartWithCleanup();
      });
      
      expect(success).toBe(true);
      expect(mockCartContext.clearCart).toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalled();
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });

    it('should not clear cart when confirmation is denied', async () => {
      // Mock window.confirm to return false
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);
      
      const { result } = renderHook(() => useCartManagement());
      
      let success;
      await act(async () => {
        success = await result.current.clearCartWithCleanup();
      });
      
      expect(success).toBe(false);
      expect(mockCartContext.clearCart).not.toHaveBeenCalled();
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });

    it('should clear cart without confirmation when skipConfirmation is true', async () => {
      const { result } = renderHook(() => useCartManagement());
      
      let success;
      await act(async () => {
        success = await result.current.clearCartWithCleanup(true);
      });
      
      expect(success).toBe(true);
      expect(mockCartContext.clearCart).toHaveBeenCalled();
    });
  });

  describe('bulk operations', () => {
    it('should bulk update item quantities', async () => {
      const { result } = renderHook(() => useCartManagement());
      
      const updates = [
        { cartId: 'cart1', momentType: 'pre-game', quantity: 2 },
        { cartId: 'cart2', momentType: 'half-time', quantity: 3 }
      ];
      
      let success;
      await act(async () => {
        success = await result.current.bulkUpdateQuantities(updates);
      });
      
      expect(success).toBe(true);
      expect(mockCartContext.updateItemQuantity).toHaveBeenCalledTimes(2);
      expect(mockCartContext.updateItemQuantity).toHaveBeenCalledWith('cart1', 'pre-game', 2);
      expect(mockCartContext.updateItemQuantity).toHaveBeenCalledWith('cart2', 'half-time', 3);
    });

    it('should handle bulk update errors', async () => {
      mockCartContext.updateItemQuantity.mockRejectedValue(new Error('Update failed'));
      
      const { result } = renderHook(() => useCartManagement());
      
      const updates = [
        { cartId: 'cart1', momentType: 'pre-game', quantity: 2 }
      ];
      
      let success;
      await act(async () => {
        success = await result.current.bulkUpdateQuantities(updates);
      });
      
      expect(success).toBe(false);
    });
  });

  describe('health score calculation', () => {
    it('should calculate health score correctly for healthy cart', () => {
      mockCartContext.cart.items = [
        { id: '1', isConfigured: true } as any,
        { id: '2', isConfigured: true } as any
      ];
      
      const { result } = renderHook(() => useCartManagement());
      
      expect(result.current.healthScore).toBe(100);
    });

    it('should deduct points for near expiry', () => {
      const { result, rerender } = renderHook(() => useCartManagement());
      
      // Update management state to simulate near expiry
      act(() => {
        result.current.managementState.isNearExpiry = true;
      });
      
      rerender();
      
      expect(result.current.healthScore).toBe(80); // 100 - 20 for near expiry
    });

    it('should deduct points for unconfigured items', () => {
      mockCartContext.cart.items = [
        { id: '1', isConfigured: false } as any,
        { id: '2', isConfigured: true } as any
      ];
      
      const { result } = renderHook(() => useCartManagement());
      
      // 50% unconfigured = 15 points deducted
      expect(result.current.healthScore).toBe(85);
    });

    it('should deduct points for empty cart', () => {
      mockCartContext.cart.items = [];
      
      const { result } = renderHook(() => useCartManagement());
      
      expect(result.current.healthScore).toBe(90); // 100 - 10 for empty cart
    });
  });

  describe('error handling', () => {
    it('should handle storage service errors gracefully', async () => {
      mockCartStorageService.getCartStatistics.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useCartManagement());
      
      await act(async () => {
        await result.current.checkCartStatus();
      });
      
      // Should not crash and should maintain default state
      expect(result.current.managementState.daysUntilExpiry).toBe(0);
    });

    it('should handle cart context errors gracefully', async () => {
      mockCartContext.refreshCart.mockRejectedValue(new Error('Context error'));
      
      const { result } = renderHook(() => useCartManagement());
      
      await act(async () => {
        await result.current.performCleanup();
      });
      
      // Should complete processing even with errors
      expect(result.current.isProcessing).toBe(false);
    });
  });
});