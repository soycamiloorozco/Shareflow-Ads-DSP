import { useCallback, useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import CartStorageService from '../utils/cartStorage';

interface CartManagementOptions {
  autoCleanup?: boolean;
  checkExpiry?: boolean;
  autoExtendExpiry?: boolean;
}

interface CartManagementState {
  isNearExpiry: boolean;
  daysUntilExpiry: number;
  storageSize: number;
  lastCleanup: Date | null;
}

export const useCartManagement = (options: CartManagementOptions = {}) => {
  const { 
    cart, 
    refreshCart, 
    clearCart, 
    resolveCartConflicts,
    updateItemQuantity 
  } = useCart();
  
  const [managementState, setManagementState] = useState<CartManagementState>({
    isNearExpiry: false,
    daysUntilExpiry: 0,
    storageSize: 0,
    lastCleanup: null
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Check cart status and update management state
  const checkCartStatus = useCallback(async () => {
    try {
      const stats = CartStorageService.getCartStatistics();
      const isNearExpiry = CartStorageService.isCartNearExpiry();

      setManagementState({
        isNearExpiry,
        daysUntilExpiry: stats.daysUntilExpiry,
        storageSize: stats.storageSize,
        lastCleanup: new Date()
      });

      // Auto-extend expiry if enabled and near expiry
      if (options.autoExtendExpiry && isNearExpiry && cart.items.length > 0) {
        CartStorageService.extendCartExpiry(30);
        console.log('Cart expiry automatically extended');
      }

    } catch (error) {
      console.error('Error checking cart status:', error);
    }
  }, [cart.items.length, options.autoExtendExpiry]);

  // Cleanup expired carts and old data
  const performCleanup = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      CartStorageService.cleanupExpiredCarts();
      await refreshCart();
      await checkCartStatus();
    } catch (error) {
      console.error('Error during cart cleanup:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, refreshCart, checkCartStatus]);

  // Resolve cart conflicts between storage and memory
  const resolveConflicts = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await resolveCartConflicts();
      await checkCartStatus();
    } catch (error) {
      console.error('Error resolving cart conflicts:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, resolveCartConflicts, checkCartStatus]);

  // Extend cart expiry manually
  const extendExpiry = useCallback(async (days: number = 30) => {
    try {
      CartStorageService.extendCartExpiry(days);
      await checkCartStatus();
      return true;
    } catch (error) {
      console.error('Error extending cart expiry:', error);
      return false;
    }
  }, [checkCartStatus]);

  // Clear cart with confirmation and cleanup
  const clearCartWithCleanup = useCallback(async (skipConfirmation: boolean = false) => {
    if (!skipConfirmation) {
      const confirmed = window.confirm(
        '¿Estás seguro de que quieres vaciar el carrito? Esta acción no se puede deshacer.'
      );
      if (!confirmed) return false;
    }

    try {
      setIsProcessing(true);
      await clearCart();
      await performCleanup();
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [clearCart, performCleanup]);

  // Bulk update item quantities
  const bulkUpdateQuantities = useCallback(async (updates: Array<{
    cartId: string;
    momentType: string;
    quantity: number;
  }>) => {
    if (isProcessing) return false;

    try {
      setIsProcessing(true);
      
      for (const update of updates) {
        await updateItemQuantity(update.cartId, update.momentType, update.quantity);
      }
      
      return true;
    } catch (error) {
      console.error('Error bulk updating quantities:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, updateItemQuantity]);

  // Get cart health score (0-100)
  const getCartHealthScore = useCallback(() => {
    let score = 100;
    
    // Deduct points for near expiry
    if (managementState.isNearExpiry) {
      score -= 20;
    }
    
    // Deduct points for large storage size (>1MB)
    if (managementState.storageSize > 1024 * 1024) {
      score -= 15;
    }
    
    // Deduct points for unconfigured items
    const unconfiguredCount = cart.items.filter(item => !item.isConfigured).length;
    const unconfiguredPercentage = cart.items.length > 0 ? unconfiguredCount / cart.items.length : 0;
    score -= Math.floor(unconfiguredPercentage * 30);
    
    // Deduct points for empty cart
    if (cart.items.length === 0) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }, [managementState, cart.items]);

  // Auto-cleanup on mount and interval
  useEffect(() => {
    if (options.autoCleanup) {
      performCleanup();
      
      // Set up periodic cleanup (every 30 minutes)
      const cleanupInterval = setInterval(performCleanup, 30 * 60 * 1000);
      return () => clearInterval(cleanupInterval);
    }
  }, [options.autoCleanup, performCleanup]);

  // Check expiry on mount and interval
  useEffect(() => {
    if (options.checkExpiry) {
      checkCartStatus();
      
      // Check expiry every 5 minutes
      const expiryInterval = setInterval(checkCartStatus, 5 * 60 * 1000);
      return () => clearInterval(expiryInterval);
    }
  }, [options.checkExpiry, checkCartStatus]);

  // Check status when cart changes
  useEffect(() => {
    checkCartStatus();
  }, [cart.items.length, cart.totalPrice, checkCartStatus]);

  return {
    // State
    managementState,
    isProcessing,
    healthScore: getCartHealthScore(),
    
    // Actions
    performCleanup,
    resolveConflicts,
    extendExpiry,
    clearCartWithCleanup,
    bulkUpdateQuantities,
    checkCartStatus,
    
    // Utilities
    getCartHealthScore
  };
};

export default useCartManagement;