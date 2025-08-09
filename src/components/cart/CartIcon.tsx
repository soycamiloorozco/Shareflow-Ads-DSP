import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import CartDrawerWithModal from './CartDrawer';

interface CartIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  onClick?: () => void;
}

export const CartIcon: React.FC<CartIconProps> = ({
  className = '',
  size = 'md',
  showBadge = true,
  onClick
}) => {
  const { cart, toggleCart } = useCart();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleCart();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        aria-label={`Carrito de compras${cart.totalItems > 0 ? ` (${cart.totalItems} eventos)` : ''}`}
        type="button"
      >
      {/* Cart Icon */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <ShoppingBag 
          className={`${sizeClasses[size]} text-gray-700 hover:text-gray-900 transition-colors`}
        />
        
        {/* Animated Badge */}
        <AnimatePresence>
          {showBadge && cart.totalItems > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
              className={`absolute -top-1 -right-1 ${badgeSizeClasses[size]} bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-sm`}
            >
              <motion.span
                key={cart.totalItems} // Re-animate when count changes
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {cart.loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.div>

      {/* Pulse animation for new items */}
      <AnimatePresence>
        {cart.totalItems > 0 && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6, repeat: 2 }}
            className="absolute inset-0 rounded-lg bg-blue-500 pointer-events-none"
          />
        )}
      </AnimatePresence>
      </button>

      {/* Cart Drawer */}
      <CartDrawerWithModal 
        isOpen={cart.isOpen} 
        onClose={() => toggleCart()} 
      />
    </>
  );
};

// Compact version for mobile
export const CartIconCompact: React.FC<Omit<CartIconProps, 'size'>> = ({
  className = '',
  showBadge = true,
  onClick
}) => {
  const { cart, toggleCart } = useCart();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleCart();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] ${className}`}
      aria-label={`Carrito de compras${cart.totalItems > 0 ? ` (${cart.totalItems} eventos)` : ''}`}
      type="button"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <ShoppingBag className="w-5 h-5 text-gray-700" />
        
        <AnimatePresence>
          {showBadge && cart.totalItems > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
            >
              <motion.span
                key={cart.totalItems}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {cart.totalItems > 9 ? '9+' : cart.totalItems}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
};

// Cart icon with text (for desktop navigation)
export const CartIconWithText: React.FC<CartIconProps> = ({
  className = '',
  size = 'md',
  showBadge = true,
  onClick
}) => {
  const { cart, toggleCart } = useCart();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleCart();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-label={`Carrito de compras${cart.totalItems > 0 ? ` (${cart.totalItems} eventos)` : ''}`}
      type="button"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <ShoppingBag className="w-5 h-5 text-gray-700" />
        
        <AnimatePresence>
          {showBadge && cart.totalItems > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
            >
              <motion.span
                key={cart.totalItems}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {cart.totalItems > 9 ? '9+' : cart.totalItems}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <span className="text-sm font-medium text-gray-700 hidden sm:inline">
        Carrito
        {cart.totalItems > 0 && (
          <span className="ml-1 text-gray-500">
            ({cart.totalItems})
          </span>
        )}
      </span>
    </button>
  );
};

export default CartIcon;