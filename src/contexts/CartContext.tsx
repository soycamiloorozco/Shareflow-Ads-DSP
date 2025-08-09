import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { SportEvents } from '../hooks/useSportEvents';
import { 
  CartState, 
  CartEvent, 
  SelectedCartMoment, 
  CartAnalytics,
  CheckoutValidation,
  CheckoutResult
} from '../types/cart';
import { cartReducer, initialCartState, cartActions } from './cartReducer';
import CartStorageService from '../utils/cartStorage';
import { CartValidationRules, CartErrorHandler, CartCalculations } from '../utils/cartValidation';
import useRetry from '../hooks/useRetry';

// Cart Context Interface
interface CartContextType {
  // State
  cart: CartState;
  
  // Cart Operations
  addEvent: (event: SportEvents) => Promise<void>;
  removeEvent: (cartId: string) => Promise<void>;
  updateEvent: (cartId: string, updates: Partial<CartEvent>) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Moment Configuration
  configureMoments: (cartId: string, moments: SelectedCartMoment[]) => Promise<void>;
  getMomentOptions: (eventId: string) => Promise<SportEvents['moments']>;
  
  // Cart Management
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
  updateItemQuantity: (cartId: string, momentType: string, newQuantity: number) => Promise<void>;
  resolveCartConflicts: () => Promise<void>;
  
  // Checkout
  validateCheckout: (walletBalance: number) => Promise<CheckoutValidation>;
  processCheckout: (walletBalance: number) => Promise<CheckoutResult>;
  
  // Analytics
  getCartAnalytics: () => CartAnalytics;
  
  // Utility
  isEventInCart: (eventId: string) => boolean;
  getCartItemByEventId: (eventId: string) => CartEvent | undefined;
}

// Create Context
const CartContext = createContext<CartContextType | null>(null);

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Provider Props
interface CartProviderProps {
  children: ReactNode;
}

// Cart Provider Component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  
  // Retry functionality for failed operations
  const { executeWithRetry } = useRetry({
    maxRetries: 3,
    retryDelay: 1000,
    onRetry: (attempt) => {
      console.log(`Retrying cart operation, attempt ${attempt}`);
    }
  });

  // Initialize storage and load cart data on mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        dispatch(cartActions.setLoading(true));
        
        // Initialize storage
        CartStorageService.initializeStorage();
        
        // Load cart items
        const savedItems = CartStorageService.loadCartItems();
        dispatch(cartActions.loadCart(savedItems));
        
      } catch (error) {
        console.error('Error initializing cart:', error);
        const handledError = CartErrorHandler.handle(error, 'initialization');
        dispatch(cartActions.setError(handledError.message));
      } finally {
        dispatch(cartActions.setLoading(false));
      }
    };

    initializeCart();
  }, []);

  // Save cart items to storage whenever cart items change
  useEffect(() => {
    if (cart.items.length > 0 || cart.lastUpdated > initialCartState.lastUpdated) {
      try {
        CartStorageService.saveCartItems(cart.items);
      } catch (error) {
        console.error('Error saving cart items:', error);
        const handledError = CartErrorHandler.handle(error, 'save');
        dispatch(cartActions.setError(handledError.message));
      }
    }
  }, [cart.items, cart.lastUpdated]);

  // Add event to cart
  const addEvent = useCallback(async (event: SportEvents): Promise<void> => {
    return executeWithRetry(async () => {
      try {
        dispatch(cartActions.setLoading(true));
        dispatch(cartActions.clearError());

        // Validate event
        const eventValidation = CartValidationRules.validateEvent(event);
        if (!eventValidation.isValid) {
          throw new Error(eventValidation.errors[0]);
        }

        // Validate cart limits
        const limitsValidation = CartValidationRules.validateCartLimits(cart.items, event);
        if (!limitsValidation.isValid) {
          throw new Error(limitsValidation.errors[0]);
        }

        // Create cart event
        const cartEvent: CartEvent = {
          ...event,
          cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          addedAt: new Date(),
          selectedMoments: [],
          isConfigured: false,
          estimatedPrice: event.moments?.[0]?.price || event.momentPrices?.[0]?.price || 0,
          finalPrice: undefined
        };

        dispatch(cartActions.addEvent(cartEvent));

      } catch (error) {
        console.error('Error adding event to cart:', error);
        const handledError = CartErrorHandler.handle(error, 'addEvent');
        dispatch(cartActions.setError(handledError.message));
        throw error;
      } finally {
        dispatch(cartActions.setLoading(false));
      }
    });
  }, [cart.items, executeWithRetry]);

  // Remove event from cart
  const removeEvent = useCallback(async (cartId: string): Promise<void> => {
    try {
      dispatch(cartActions.setLoading(true));
      dispatch(cartActions.clearError());

      dispatch(cartActions.removeEvent(cartId));

    } catch (error) {
      console.error('Error removing event from cart:', error);
      const handledError = CartErrorHandler.handle(error, 'removeEvent');
      dispatch(cartActions.setError(handledError.message));
      throw error;
    } finally {
      dispatch(cartActions.setLoading(false));
    }
  }, []);

  // Update event in cart
  const updateEvent = useCallback(async (cartId: string, updates: Partial<CartEvent>): Promise<void> => {
    try {
      dispatch(cartActions.setLoading(true));
      dispatch(cartActions.clearError());

      dispatch(cartActions.updateEvent(cartId, updates));

    } catch (error) {
      console.error('Error updating event in cart:', error);
      const handledError = CartErrorHandler.handle(error, 'updateEvent');
      dispatch(cartActions.setError(handledError.message));
      throw error;
    } finally {
      dispatch(cartActions.setLoading(false));
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<void> => {
    try {
      dispatch(cartActions.setLoading(true));
      dispatch(cartActions.clearError());

      dispatch(cartActions.clearCart());
      CartStorageService.clearCart();

    } catch (error) {
      console.error('Error clearing cart:', error);
      const handledError = CartErrorHandler.handle(error, 'clearCart');
      dispatch(cartActions.setError(handledError.message));
      throw error;
    } finally {
      dispatch(cartActions.setLoading(false));
    }
  }, []);

  // Configure moments for an event
  const configureMoments = useCallback(async (cartId: string, moments: SelectedCartMoment[]): Promise<void> => {
    try {
      dispatch(cartActions.setLoading(true));
      dispatch(cartActions.clearError());

      // Find the event in cart
      const cartEvent = cart.items.find(item => item.cartId === cartId);
      if (!cartEvent) {
        throw new Error('Evento no encontrado en el carrito');
      }

      // Validate moments
      const momentsValidation = CartValidationRules.validateMoments(moments, cartEvent);
      if (!momentsValidation.isValid) {
        throw new Error(momentsValidation.errors[0]);
      }

      dispatch(cartActions.configureMoments(cartId, moments));

    } catch (error) {
      console.error('Error configuring moments:', error);
      const handledError = CartErrorHandler.handle(error, 'configureMoments');
      dispatch(cartActions.setError(handledError.message));
      throw error;
    } finally {
      dispatch(cartActions.setLoading(false));
    }
  }, [cart.items]);

  // Get moment options for an event (using existing SportEvents structure)
  const getMomentOptions = useCallback(async (eventId: string): Promise<SportEvents['moments']> => {
    try {
      // Find event in cart
      const cartEvent = cart.items.find(item => item.id === eventId);
      if (cartEvent) {
        return cartEvent.moments;
      }
      
      // If not in cart, this would typically fetch from API
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting moment options:', error);
      throw error;
    }
  }, [cart.items]);

  // Toggle cart open/closed
  const toggleCart = useCallback(() => {
    dispatch(cartActions.toggleCart());
  }, []);

  // Refresh cart data
  const refreshCart = useCallback(async (): Promise<void> => {
    try {
      dispatch(cartActions.setLoading(true));
      dispatch(cartActions.clearError());

      const savedItems = CartStorageService.loadCartItems();
      dispatch(cartActions.loadCart(savedItems));

    } catch (error) {
      console.error('Error refreshing cart:', error);
      const handledError = CartErrorHandler.handle(error, 'refreshCart');
      dispatch(cartActions.setError(handledError.message));
      throw error;
    } finally {
      dispatch(cartActions.setLoading(false));
    }
  }, []);



  // Validate checkout
  const validateCheckout = useCallback(async (walletBalance: number): Promise<CheckoutValidation> => {
    try {
      const validation = CartValidationRules.validateCheckout(cart, walletBalance);
      
      return {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        requiredBalance: cart.totalPrice,
        currentBalance: walletBalance,
        shortfall: cart.totalPrice > walletBalance ? cart.totalPrice - walletBalance : undefined
      };
    } catch (error) {
      console.error('Error validating checkout:', error);
      return {
        isValid: false,
        errors: ['Error al validar el checkout'],
        warnings: [],
        requiredBalance: cart.totalPrice,
        currentBalance: walletBalance
      };
    }
  }, [cart]);

  // Update item quantity in cart
  const updateItemQuantity = useCallback(async (cartId: string, momentType: string, newQuantity: number): Promise<void> => {
    try {
      dispatch(cartActions.setLoading(true));
      dispatch(cartActions.clearError());

      const cartItem = cart.items.find(item => item.cartId === cartId);
      if (!cartItem) {
        throw new Error('Item not found in cart');
      }

      const updatedMoments = cartItem.selectedMoments?.map(moment => 
        moment.moment === momentType 
          ? { ...moment, quantity: Math.max(1, newQuantity) }
          : moment
      ) || [];

      const finalPrice = updatedMoments.reduce((sum, moment) => sum + (moment.price * moment.quantity), 0);

      dispatch(cartActions.updateEvent(cartId, { 
        selectedMoments: updatedMoments,
        finalPrice
      }));

    } catch (error) {
      console.error('Error updating item quantity:', error);
      const handledError = CartErrorHandler.handle(error, 'updateQuantity');
      dispatch(cartActions.setError(handledError.message));
      throw error;
    } finally {
      dispatch(cartActions.setLoading(false));
    }
  }, [cart.items]);

  // Check for cart conflicts and resolve them
  const resolveCartConflicts = useCallback(async (): Promise<void> => {
    try {
      const storedItems = CartStorageService.loadCartItems();
      const currentItems = cart.items;

      // Simple conflict resolution: merge and keep most recent
      const mergedItems = [...currentItems];
      
      storedItems.forEach(storedItem => {
        const existingIndex = mergedItems.findIndex(item => item.id === storedItem.id);
        if (existingIndex >= 0) {
          // Keep the most recently updated item
          if (new Date(storedItem.addedAt) > new Date(mergedItems[existingIndex].addedAt)) {
            mergedItems[existingIndex] = storedItem;
          }
        } else {
          mergedItems.push(storedItem);
        }
      });

      dispatch(cartActions.loadCart(mergedItems));
      await CartStorageService.saveCartItems(mergedItems);

    } catch (error) {
      console.error('Error resolving cart conflicts:', error);
    }
  }, [cart.items]);

  // Process checkout (placeholder - would integrate with actual payment system)
  const processCheckout = useCallback(async (walletBalance: number): Promise<CheckoutResult> => {
    try {
      dispatch(cartActions.setLoading(true));
      dispatch(cartActions.clearError());

      const validation = await validateCheckout(walletBalance);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // This would integrate with actual payment/wallet system
      // For now, just simulate success
      const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Clear cart after successful purchase
      await clearCart();

      return {
        success: true,
        transactionId,
        message: 'Compra realizada exitosamente',
        updatedBalance: walletBalance - cart.totalPrice
      };

    } catch (error) {
      console.error('Error processing checkout:', error);
      const handledError = CartErrorHandler.handle(error, 'processCheckout');
      dispatch(cartActions.setError(handledError.message));
      
      return {
        success: false,
        message: handledError.message
      };
    } finally {
      dispatch(cartActions.setLoading(false));
    }
  }, [cart, validateCheckout, clearCart]);

  // Get cart analytics
  const getCartAnalytics = useCallback((): CartAnalytics => {
    const analytics = CartCalculations.generateAnalytics(cart.items);
    
    return {
      ...analytics,
      audienceReach: {
        unique: analytics.totalAudience,
        overlap: 0, // Would calculate actual overlap
        demographics: {} // Would include demographic data
      },
      recommendations: [
        // Would generate actual recommendations based on cart contents
        'Considera agregar eventos en diferentes fechas para mayor alcance',
        'Los eventos de fin de semana suelen tener mayor audiencia'
      ]
    };
  }, [cart.items]);

  // Check if event is in cart
  const isEventInCart = useCallback((eventId: string): boolean => {
    return cart.items.some(item => item.id === eventId);
  }, [cart.items]);

  // Get cart item by event ID
  const getCartItemByEventId = useCallback((eventId: string): CartEvent | undefined => {
    return cart.items.find(item => item.id === eventId);
  }, [cart.items]);

  // Context value
  const contextValue: CartContextType = {
    // State
    cart,
    
    // Cart Operations
    addEvent,
    removeEvent,
    updateEvent,
    clearCart,
    
    // Moment Configuration
    configureMoments,
    getMomentOptions,
    
    // Cart Management
    toggleCart,
    refreshCart,
    updateItemQuantity,
    resolveCartConflicts,
    
    // Checkout
    validateCheckout,
    processCheckout,
    
    // Analytics
    getCartAnalytics,
    
    // Utility
    isEventInCart,
    getCartItemByEventId
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};