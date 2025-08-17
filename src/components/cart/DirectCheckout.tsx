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
      <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">Saldo</span>
          <span className="font-semibold text-gray-900">
            {walletLoading ? 'Cargando...' : formatBalance()}
          </span>
        </div>
        <button
          onClick={onRechargeWallet}
          className="text-[#353FEF] hover:text-[#2A32C5] text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Recargar
        </button>
      </div>
 
      {/* Purchase Summary - compact */}
      <div className="bg-white/80 rounded-2xl p-4 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            {formatBalance(cart.totalPrice)}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-600 flex justify-between">
          <span>Eventos</span>
          <span>{cart.items.length} · {cart.items.filter(item => item.isConfigured).length}/{cart.items.length} config.</span>
        </div>
      </div>
 
      {/* Status Messages - single line chips */}
      <AnimatePresence>
        {!allConfigured && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 rounded-full bg-amber-50/80 text-amber-900 text-xs font-medium flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {cart.items.filter(item => !item.isConfigured).length} evento(s) pendientes de configuración
          </motion.div>
        )}
 
        {allConfigured && insufficientFunds && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 rounded-full bg-red-50/80 text-red-700 text-xs font-medium flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Te faltan {formatBalance(shortfall)}
          </motion.div>
        )}
 
        {canProceedWithPayment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 rounded-full bg-green-50/80 text-green-700 text-xs font-medium flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            Todo listo para pagar
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
            Configurar eventos ({cart.items.filter(item => !item.isConfigured).length})
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
            {isProcessing ? 'Procesando...' : `Pagar ${formatBalance(cart.totalPrice)}`}
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
 
      {/* Additional Info removed to reduce density */}
    </div>
  );
};

export default DirectCheckout;