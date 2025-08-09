import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowRight, 
  AlertTriangle, 
  Check, 
  Loader2,
  Plus,
  CreditCard
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { CartEvent } from '../../types/cart';
import { Button } from '../Button';
import { useWallet } from '../../hooks/useWallet';

interface DirectCheckoutProps {
  onClose: () => void;
  onConfigureMoments?: (event: CartEvent) => void;
  onRechargeWallet: () => void;
}

export const DirectCheckout: React.FC<DirectCheckoutProps> = ({
  onClose,
  onConfigureMoments,
  onRechargeWallet
}) => {
  const { cart, clearCart } = useCart();
  const { wallet, formatBalance, hasInsufficientFunds, getShortfall, isLoading: walletLoading } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Find first unconfigured event
  const unconfiguredEvent = cart.items.find(item => !item.isConfigured);
  const allConfigured = cart.items.length > 0 && cart.items.every(item => item.isConfigured);
  const insufficientFunds = hasInsufficientFunds(cart.totalPrice);
  const shortfall = getShortfall(cart.totalPrice);
  const canProceedWithPayment = allConfigured && !insufficientFunds;

  const handleDirectPayment = async () => {
    if (!canProceedWithPayment) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setTransactionId(txId);
      setShowConfirmation(true);
      
      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfigureEvents = () => {
    if (unconfiguredEvent && onConfigureMoments) {
      onConfigureMoments(unconfiguredEvent);
    }
  };

  if (showConfirmation && transactionId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Pago exitoso!
        </h3>
        <p className="text-gray-600 mb-4">
          Tu compra ha sido procesada correctamente
        </p>
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">ID de transacción:</p>
          <p className="font-mono text-sm font-medium">{transactionId}</p>
        </div>
        <p className="text-xs text-gray-500">
          Cerrando automáticamente...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Balance Display - Subtle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">Saldo disponible</span>
          <span className="font-semibold text-gray-900">
            {walletLoading ? 'Cargando...' : formatBalance()}
          </span>
        </div>
        <button
          onClick={onRechargeWallet}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Recargar
        </button>
      </div>

      {/* Purchase Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-gray-900">Total de la compra:</span>
          <span className="text-xl font-bold text-gray-900">
            {formatBalance(cart.totalPrice)}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Eventos:</span>
            <span>{cart.items.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Configurados:</span>
            <span>{cart.items.filter(item => item.isConfigured).length}/{cart.items.length}</span>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {!allConfigured && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Configuración pendiente</p>
                <p className="text-amber-700">
                  {cart.items.filter(item => !item.isConfigured).length} evento(s) necesitan configuración de momentos
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {allConfigured && insufficientFunds && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-900">Fondos insuficientes</p>
                <p className="text-red-700">
                  Te faltan {formatBalance(shortfall)} para completar la compra
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {canProceedWithPayment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Todo listo para procesar el pago
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!allConfigured ? (
          <Button
            onClick={handleConfigureEvents}
            variant="primary"
            size="lg"
            fullWidth
            icon={ArrowRight}
          >
            Configurar eventos ({cart.items.filter(item => !item.isConfigured).length} pendientes)
          </Button>
        ) : canProceedWithPayment ? (
          <Button
            onClick={handleDirectPayment}
            variant="primary"
            size="lg"
            fullWidth
            icon={isProcessing ? Loader2 : Wallet}
            disabled={isProcessing}
            className={isProcessing ? 'animate-pulse' : ''}
          >
            {isProcessing ? 'Procesando pago...' : `Pagar ${formatBalance(cart.totalPrice)}`}
          </Button>
        ) : (
          <Button
            onClick={onRechargeWallet}
            variant="primary"
            size="lg"
            fullWidth
            icon={CreditCard}
          >
            Recargar wallet para continuar
          </Button>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {canProceedWithPayment 
            ? 'El pago se procesará inmediatamente desde tu wallet'
            : insufficientFunds 
              ? 'Recarga tu wallet para completar la compra'
              : 'Configura todos los eventos para continuar'
          }
        </p>
      </div>
    </div>
  );
};

export default DirectCheckout;