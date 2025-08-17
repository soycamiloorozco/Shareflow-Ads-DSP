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
  
  // Cart management hooks
  const { getExpiringEvents } = useCartExpiration();

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
              if (drawerRef.current !== node) {
                Object.defineProperty(drawerRef, 'current', {
                  value: node,
                  writable: true
                });
              }
              if (containerRef.current !== node) {
                Object.defineProperty(containerRef, 'current', {
                  value: node,
                  writable: true
                });
              }
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white/95 backdrop-blur-xl shadow-[0_16px_64px_rgba(0,0,0,0.15)] z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            aria-describedby="cart-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
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
                className="p-2 hover:bg-white/70 rounded-xl transition-colors backdrop-blur-sm"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cart.loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-2 border-[#353FEF] border-t-transparent rounded-full animate-spin" />
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
                        <div className="p-3 bg-gradient-to-r from-amber-50/80 to-amber-100/60 backdrop-blur-sm rounded-xl mx-4 mt-4 shadow-[0_2px_8px_rgba(245,158,11,0.08)]">
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
                    <CartItemList items={cart.items} onRemoveItem={removeEvent} onConfigureMoments={onConfigureMoments} />
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
              <div className="p-4 bg-gradient-to-r from-red-50/80 to-red-100/60 backdrop-blur-sm rounded-xl mx-4 mb-4 shadow-[0_2px_8px_rgba(239,68,68,0.08)]">
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
    <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
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
      className="px-6 py-3 bg-[#353FEF] text-white rounded-lg hover:bg-[#2A32C5] transition-colors font-medium shadow-sm"
    >
      Explorar Eventos
    </button>
  </div>
);

// Cart Item List Component
interface CartItemListProps {
  items: CartEvent[];
  onRemoveItem: (cartId: string) => void;
  onConfigureMoments?: (event: CartEvent) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ items, onRemoveItem, onConfigureMoments }) => (
  <div className="p-3 space-y-3">
    {items.map((item, index) => (
      <CartItemCard 
        key={item.cartId} 
        item={item} 
        index={index}
        onRemove={() => onRemoveItem(item.cartId)}
        onConfigureMoments={onConfigureMoments}
      />
    ))}
  </div>
);

// Individual Cart Item Component
interface CartItemCardProps {
  item: CartEvent;
  index: number;
  onRemove: () => void;
  onConfigureMoments?: (event: CartEvent) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, index, onRemove, onConfigureMoments }) => {
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

  const handleConfigureOrEdit = () => {
    if (onConfigureMoments) {
      onConfigureMoments(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-3 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Event Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
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
          className="p-1.5 hover:bg-red-50/80 rounded-lg transition-colors group backdrop-blur-sm"
          aria-label={`Eliminar ${item.homeTeamName} vs ${item.awayTeamName} del carrito`}
        >
          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
        </button>
      </div>

      {/* Configuration Status and Moments Summary */}
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
          {/* Always show configure/edit button */}
          <button 
            onClick={handleConfigureOrEdit}
            className="text-xs text-[#353FEF] hover:text-[#2A32C5] flex items-center gap-1 mt-1 transition-colors"
          >
            <Settings className="w-3 h-3" />
            {item.isConfigured ? 'Editar' : 'Configurar'}
          </button>
        </div>
      </div>

      {/* Detailed Moments Display for Configured Events */}
      {item.isConfigured && item.selectedMoments && item.selectedMoments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100/50">
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Momentos seleccionados:</h5>
            <div className="grid grid-cols-1 gap-2">
              {item.selectedMoments.map((moment, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50/80 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      moment.period === 'FirstHalf' ? 'bg-blue-500' :
                      moment.period === 'Halftime' ? 'bg-amber-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-xs font-medium text-gray-700">
                      {moment.period === 'FirstHalf' ? 'Primer Tiempo' :
                       moment.period === 'Halftime' ? 'Entre Tiempo' : 'Segundo Tiempo'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {moment.quantity > 1 ? `${moment.quantity} momentos` : '1 momento'}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    {formatPrice(moment.price * moment.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audience Info */}
      <div className="mt-3 pt-3 border-t border-gray-100/50">
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
    <div className="bg-white/70 backdrop-blur-sm p-4 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
      {/* Compact summary */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Carrito</span>
        <span className="font-semibold text-gray-900">{totalItems} · {formatPrice(totalPrice)}</span>
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
          className="w-full px-4 py-2 text-gray-600 hover:text-red-600 transition-colors text-sm rounded-lg hover:bg-red-50/50 backdrop-blur-sm"
        >
          Vaciar carrito
        </button>
      </div>

      {/* Note */}
      <p className="text-[10px] text-gray-500 text-center mt-1">
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