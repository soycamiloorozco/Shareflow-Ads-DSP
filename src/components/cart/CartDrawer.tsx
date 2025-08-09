import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Calendar, Clock, MapPin, Users, Trash2, Settings, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { CartEvent } from '../../types/cart';
import { constants } from '../../config/constants';
import MomentConfigModal from './MomentConfigModal';
import DirectCheckout from './DirectCheckout';

import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';
import useScreenReader from '../../hooks/useScreenReader';
import useCartExpiration from '../../hooks/useCartExpiration';
import useCartTracking from '../../hooks/useCartTracking';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigureMoments?: (event: CartEvent) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onConfigureMoments
}) => {
  const { cart, removeEvent, clearCart } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Accessibility hooks
  const { containerRef } = useKeyboardNavigation({
    isOpen,
    onClose,
    trapFocus: true,
    autoFocus: true
  });
  const { announceCartAction, announceLoading } = useScreenReader();
  
  // Cart management hooks
  const { getExpiringEvents, getTimeUntilExpiration } = useCartExpiration();
  const { scheduleEmailNotifications } = useCartTracking();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);



  // Focus management
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={(node) => {
              drawerRef.current = node;
              if (containerRef.current !== node) {
                containerRef.current = node;
              }
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            aria-describedby="cart-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 id="cart-title" className="text-lg font-semibold text-gray-900">
                    Carrito de Eventos
                  </h2>
                  <p id="cart-description" className="text-sm text-gray-600">
                    {cart.totalItems} evento{cart.totalItems !== 1 ? 's' : ''} seleccionado{cart.totalItems !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cart.loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cart.items.length === 0 ? (
                <EmptyCartState onClose={onClose} />
              ) : (
                <div>
                  {/* Expiring Events Warning */}
                  {(() => {
                    const expiringEvents = getExpiringEvents();
                    if (expiringEvents.length > 0) {
                      return (
                        <div className="p-3 bg-amber-50 border-b border-amber-200">
                          <div className="flex items-center gap-2 text-amber-800">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {expiringEvents.length} evento{expiringEvents.length !== 1 ? 's' : ''} expira{expiringEvents.length === 1 ? '' : 'n'} pronto
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Events Display */}
                  <div className="flex-1">
                    <CartItemList items={cart.items} onRemoveItem={removeEvent} />
                  </div>


                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <CartFooter 
                totalPrice={cart.totalPrice}
                totalItems={cart.totalItems}
                onClearCart={clearCart}
                onClose={onClose}
                onConfigureMoments={onConfigureMoments}
              />
            )}

            {/* Error Display */}
            {cart.error && (
              <div className="p-4 bg-red-50 border-t border-red-200">
                <p className="text-sm text-red-600">{cart.error}</p>
              </div>
            )}
          </motion.div>


        </>
      )}
    </AnimatePresence>
  );
};

// Empty Cart State Component
const EmptyCartState: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <ShoppingBag className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Tu carrito está vacío
    </h3>
    <p className="text-gray-600 mb-6 max-w-sm">
      Explora nuestros eventos deportivos y agrega los que más te interesen para crear tu estrategia publicitaria.
    </p>
    <button
      onClick={onClose}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Explorar Eventos
    </button>
  </div>
);

// Cart Item List Component
interface CartItemListProps {
  items: CartEvent[];
  onRemoveItem: (cartId: string) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ items, onRemoveItem }) => (
  <div className="p-4 space-y-4">
    {items.map((item, index) => (
      <CartItemCard 
        key={item.cartId} 
        item={item} 
        index={index}
        onRemove={() => onRemoveItem(item.cartId)} 
      />
    ))}
  </div>
);

// Individual Cart Item Component
interface CartItemCardProps {
  item: CartEvent;
  index: number;
  onRemove: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, index, onRemove }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      {/* Event Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
          <img 
            src={`${constants.base_path}/${item.stadiumPhotos[0]}`}
            alt={item.stadiumName}
            className="w-full h-full object-cover"
          />
          {/* Teams overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-white/20 rounded flex items-center justify-center">
                <img 
                  src={`${constants.base_path}/${item.homeTeamImage}`}
                  alt={item.homeTeamName}
                  className="w-2 h-2 object-contain"
                />
              </div>
              <span className="text-white text-xs font-bold">VS</span>
              <div className="w-3 h-3 bg-white/20 rounded flex items-center justify-center">
                <img 
                  src={`${constants.base_path}/${item.awayTeamImage}`}
                  alt={item.awayTeamName}
                  className="w-2 h-2 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {item.homeTeamName} vs {item.awayTeamName}
          </h4>
          
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(item.eventDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.eventTime}
            </span>
          </div>
          
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{item.stadiumName}</span>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
          aria-label={`Eliminar ${item.homeTeamName} vs ${item.awayTeamName} del carrito`}
        >
          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
        </button>
      </div>

      {/* Configuration Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {item.isConfigured ? (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">Configurado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-medium">Pendiente</span>
            </div>
          )}
          
          {item.selectedMoments && item.selectedMoments.length > 0 && (
            <span className="text-xs text-gray-500">
              {item.selectedMoments.length} momento{item.selectedMoments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="text-right">
          <p className="font-bold text-gray-900">
            {formatPrice(item.finalPrice || item.estimatedPrice)}
          </p>
          {!item.isConfigured && (
            <button 
              onClick={() => onConfigureMoments?.(item)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Configurar
            </button>
          )}
        </div>
      </div>

      {/* Audience Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {((item.estimatedAttendance || 0) / 1000).toFixed(0)}K espectadores
          </span>
          <span>
            +{((item.estimatedAttendanceTv || 0) / 1000).toFixed(0)}K TV
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Direct checkout component is now imported from separate file

// Cart Footer Component
interface CartFooterProps {
  totalPrice: number;
  totalItems: number;
  onClearCart: () => void;
  onClose: () => void;
  onConfigureMoments?: (event: CartEvent) => void;
}

const CartFooter: React.FC<CartFooterProps> = ({ 
  totalPrice, 
  totalItems, 
  onClearCart, 
  onClose,
  onConfigureMoments
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      try {
        onClearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total eventos:</span>
          <span className="font-medium">{totalItems}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total estimado:</span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <DirectCheckout 
          onClose={onClose}
          onConfigureMoments={onConfigureMoments}
          onRechargeWallet={() => {
            // Navegar a la página de recarga de wallet
            onClose();
            window.open('/wallet', '_blank');
          }}
        />
        
        <button
          onClick={handleClearCart}
          className="w-full px-4 py-2 text-gray-600 hover:text-red-600 transition-colors text-sm"
        >
          Vaciar carrito
        </button>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 text-center">
        Los eventos permanecen en tu carrito hasta que los compres o los elimines
      </p>
    </div>
  );
};

// Add MomentConfigModal to the CartDrawer component
const CartDrawerWithModal: React.FC<CartDrawerProps> = (props) => {
  const { configureMoments } = useCart();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedEventForConfig, setSelectedEventForConfig] = useState<CartEvent | null>(null);

  const handleConfigureMoments = (event: CartEvent) => {
    setSelectedEventForConfig(event);
    setConfigModalOpen(true);
  };

  const handleSaveMomentConfig = async (moments: any[]) => {
    if (selectedEventForConfig) {
      try {
        await configureMoments(selectedEventForConfig.cartId, moments);
        setConfigModalOpen(false);
        setSelectedEventForConfig(null);
      } catch (error) {
        console.error('Error saving moment configuration:', error);
      }
    }
  };

  const handleCloseConfigModal = () => {
    setConfigModalOpen(false);
    setSelectedEventForConfig(null);
  };

  return (
    <>
      <CartDrawer 
        {...props} 
        onConfigureMoments={handleConfigureMoments}
      />
      
      {/* Moment Configuration Modal */}
      {selectedEventForConfig && (
        <MomentConfigModal
          isOpen={configModalOpen}
          onClose={handleCloseConfigModal}
          event={selectedEventForConfig}
          onSave={handleSaveMomentConfig}
          initialMoments={selectedEventForConfig.selectedMoments || []}
        />
      )}
    </>
  );
};

export default CartDrawerWithModal;