import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartFloatingButtonProps {
  className?: string;
}

export const CartFloatingButton: React.FC<CartFloatingButtonProps> = ({
  className = ''
}) => {
  const { cart, toggleCart } = useCart();

  // Don't show if cart is empty
  if (cart.totalItems === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed bottom-6 right-6 z-40 ${className}`}
      >
        <motion.button
          onClick={toggleCart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-4 flex items-center gap-3 min-w-[200px]"
          aria-label={`Abrir carrito (${cart.totalItems} eventos)`}
        >
          {/* Cart Icon with Badge */}
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <motion.div
              key={cart.totalItems}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
            >
              {cart.totalItems > 9 ? '9+' : cart.totalItems}
            </motion.div>
          </div>

          {/* Cart Summary */}
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {cart.totalItems} evento{cart.totalItems !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-blue-100">
              {formatPrice(cart.totalPrice)}
            </span>
          </div>

          {/* Loading indicator */}
          {cart.loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-auto" />
          )}
        </motion.button>

        {/* Configuration Status Indicator */}
        {cart.items.some(item => !item.isConfigured) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"
            title="Eventos pendientes de configuración"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CartFloatingButton;