import React from 'react';
import { CartProvider } from '../../contexts/CartContext';
import CartErrorBoundary from './CartErrorBoundary';
import CartErrorNotification from './CartErrorNotification';
import { useCart } from '../../contexts/CartContext';
import { CartErrorType } from '../../types/cart';

interface CartSystemProps {
  children: React.ReactNode;
}

// Internal component that uses the cart context
const CartSystemInternal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, clearCart } = useCart();

  const handleErrorDismiss = () => {
    // Clear the error from the cart state
    // This would typically be handled by a clearError action
  };

  const handleErrorRetry = () => {
    // Implement retry logic based on error type
    // This could trigger a refresh of cart data or retry the last failed operation
  };

  return (
    <>
      {children}
      
      {/* Global error notification for cart operations */}
      <CartErrorNotification
        error={cart.error}
        errorType={CartErrorType.NETWORK_ERROR} // This would be determined based on the actual error
        onDismiss={handleErrorDismiss}
        onRetry={handleErrorRetry}
        autoHide={true}
        autoHideDelay={5000}
      />
    </>
  );
};

// Main cart system component
export const CartSystem: React.FC<CartSystemProps> = ({ children }) => {
  const handleCartError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to monitoring service
    console.error('Cart System Error:', error, errorInfo);
    
    // Here you could send error to analytics/monitoring service
    // analytics.track('cart_error', { error: error.message, stack: error.stack });
  };

  return (
    <CartErrorBoundary onError={handleCartError}>
      <CartProvider>
        <CartSystemInternal>
          {children}
        </CartSystemInternal>
      </CartProvider>
    </CartErrorBoundary>
  );
};

export default CartSystem;