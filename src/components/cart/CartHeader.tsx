import React from 'react';
import { X, ShoppingBag, MoreVertical, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartHeaderProps {
  totalItems: number;
  onClose: () => void;
  onClearCart?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const CartHeader: React.FC<CartHeaderProps> = ({
  totalItems,
  onClose,
  onClearCart,
  onRefresh,
  loading = false
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const handleClearCart = async () => {
    if (onClearCart && window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      await onClearCart();
      setShowActions(false);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
      setShowActions(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      {/* Left side - Icon and title */}
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingBag className="w-5 h-5 text-blue-600" />
        </motion.div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Carrito de Eventos
          </h2>
          <p className="text-sm text-gray-600">
            {totalItems} evento{totalItems !== 1 ? 's' : ''} seleccionado{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Actions Menu */}
        {totalItems > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              aria-label="Más opciones"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
              >
                {onRefresh && (
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar carrito
                  </button>
                )}
                
                {onClearCart && (
                  <button
                    onClick={handleClearCart}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Vaciar carrito
                  </button>
                )}
              </motion.div>
            )}

            {/* Backdrop to close dropdown */}
            {showActions && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowActions(false)}
              />
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          aria-label="Cerrar carrito"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default CartHeader;