import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Wallet,
  Save,
  AlertTriangle,
  Clock,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import WalletCheck from './WalletCheck';
import PaymentOptions from './PaymentOptions';
import ConfirmationScreen from './ConfirmationScreen';
import { useTransactionProcessing } from '../../hooks/useTransactionProcessing';
import { constants } from '../../config/constants';

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onRecharge?: () => void;
  onSuccess?: (result: any) => void;
}

type CheckoutStep = 'review' | 'payment' | 'confirmation';

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onRecharge,
  onSuccess
}) => {
  const { cart, saveDraft, clearCart } = useCart();
  const { 
    processWalletPayment, 
    processDraftSaving, 
    validateTransaction,
    isProcessing,
    error: transactionError,
    resetState
  } = useTransactionProcessing();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'draft'>('wallet');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('review');
      setCheckoutResult(null);
      resetState();
      setPaymentMethod(walletBalance >= cart.totalPrice ? 'wallet' : 'draft');
    }
  }, [isOpen, walletBalance, cart.totalPrice, resetState]);

  // Prevent body scroll when modal is open
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

  const handleNext = () => {
    if (currentStep === 'review') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      handleProcessCheckout();
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('review');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('review');
    }
  };

  const handleProcessCheckout = async () => {
    try {
      // Validate transaction first
      const validation = validateTransaction(
        cart.items,
        cart.totalPrice,
        paymentMethod,
        walletBalance
      );

      if (!validation.isValid) {
        setCheckoutResult({
          success: false,
          error: validation.errors.join(', ')
        });
        return;
      }

      let result;

      if (paymentMethod === 'wallet') {
        result = await processWalletPayment(
          cart.totalPrice,
          walletBalance,
          cart.items
        );
        
        if (result.success) {
          await clearCart();
        }
      } else {
        // Generate draft name
        const draftName = `Borrador ${new Date().toLocaleDateString('es-CO')}`;
        
        result = await processDraftSaving(
          draftName,
          cart.items,
          cart.totalPrice
        );
      }
      
      setCheckoutResult(result);
      setCurrentStep('confirmation');
      onSuccess?.(result);

    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error en el checkout'
      });
      setCurrentStep('confirmation');
    }
  };

  const getStepTitle = (step: CheckoutStep) => {
    switch (step) {
      case 'review': return 'Revisar Pedido';
      case 'payment': return 'Método de Pago';
      case 'confirmation': return 'Confirmación';
      default: return '';
    }
  };

  const getStepIcon = (step: CheckoutStep) => {
    switch (step) {
      case 'review': return <ShoppingCart className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'confirmation': return <CheckCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with Steps */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Checkout</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between">
              {(['review', 'payment', 'confirmation'] as CheckoutStep[]).map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep === step
                      ? 'bg-white text-blue-600 border-white'
                      : index < (['review', 'payment', 'confirmation'] as CheckoutStep[]).indexOf(currentStep)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-transparent text-white border-white/50'
                  }`}>
                    {getStepIcon(step)}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      currentStep === step ? 'text-white' : 'text-blue-100'
                    }`}>
                      {getStepTitle(step)}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      index < (['review', 'payment', 'confirmation'] as CheckoutStep[]).indexOf(currentStep)
                        ? 'bg-white'
                        : 'bg-white/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentStep === 'review' && (
                <ReviewStep 
                  key="review"
                  cart={cart}
                  formatPrice={formatPrice}
                />
              )}
              
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <PaymentOptions
                    walletBalance={walletBalance}
                    onPaymentMethodChange={setPaymentMethod}
                    selectedMethod={paymentMethod}
                    onRecharge={onRecharge}
                  />
                </motion.div>
              )}
              
              {currentStep === 'confirmation' && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6"
                >
                  <ConfirmationScreen
                    result={checkoutResult}
                    onClose={onClose}
                    onRetry={() => setCurrentStep('payment')}
                    onGoHome={() => window.location.href = '/'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {currentStep !== 'review' && currentStep !== 'confirmation' && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep === 'confirmation' ? (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Cerrar
                  </button>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total:</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(cart.totalPrice)}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleNext}
                      disabled={isProcessing || (currentStep === 'payment' && paymentMethod === 'wallet' && walletBalance < cart.totalPrice)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Procesando...
                        </>
                      ) : currentStep === 'review' ? (
                        <>
                          Continuar
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          {paymentMethod === 'wallet' ? 'Pagar Ahora' : 'Guardar Borrador'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Review Step Component
const ReviewStep: React.FC<{
  cart: any;
  formatPrice: (price: number) => string;
}> = ({ cart, formatPrice }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revisar tu pedido
      </h3>

      <div className="space-y-4">
        {cart.items.map((item: any, index: number) => (
          <div key={item.cartId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={`${constants.base_path}/${item.stadiumPhotos[0]}`}
                  alt={item.stadiumName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {item.homeTeamName} vs {item.awayTeamName}
                </h4>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.eventDate).toLocaleDateString('es-CO')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.eventTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.stadiumName}
                  </span>
                </div>

                {item.isConfigured && item.selectedMoments ? (
                  <div className="space-y-1">
                    {item.selectedMoments.map((moment: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600">
                        • {moment.moment} x{moment.quantity} - {formatPrice(moment.price * moment.quantity)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600 text-sm">
                    <AlertTriangle className="w-3 h-3" />
                    Sin configurar
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatPrice(item.finalPrice || item.estimatedPrice)}
                </div>
                {!item.isConfigured && (
                  <div className="text-xs text-gray-500">estimado</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">{formatPrice(cart.totalPrice)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Audiencia total:</span>
          <span className="font-semibold">{cart.totalAudience.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-lg text-gray-900">{formatPrice(cart.totalPrice)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Payment Step Component
const PaymentStep: React.FC<{
  cart: any;
  walletBalance: number;
  paymentMethod: 'wallet' | 'draft';
  onPaymentMethodChange: (method: 'wallet' | 'draft') => void;
  onRecharge?: () => void;
  formatPrice: (price: number) => string;
}> = ({ cart, walletBalance, paymentMethod, onPaymentMethodChange, onRecharge, formatPrice }) => {
  const hasInsufficientFunds = walletBalance < cart.totalPrice;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Método de pago
      </h3>

      {/* Wallet Check */}
      <WalletCheck
        walletBalance={walletBalance}
        onRecharge={onRecharge}
        className="mb-6"
      />

      {/* Payment Options */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          Selecciona cómo quieres proceder:
        </div>

        {/* Wallet Payment Option */}
        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${
          paymentMethod === 'wallet' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={(e) => onPaymentMethodChange(e.target.value as 'wallet')}
              disabled={hasInsufficientFunds}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className={`font-medium ${hasInsufficientFunds ? 'text-gray-400' : 'text-gray-900'}`}>
                  Pagar con Wallet
                </span>
                {hasInsufficientFunds && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Fondos insuficientes
                  </span>
                )}
              </div>
              <p className={`text-sm ${hasInsufficientFunds ? 'text-gray-400' : 'text-gray-600'}`}>
                Paga inmediatamente con el balance de tu wallet
              </p>
              <div className={`text-sm mt-1 ${hasInsufficientFunds ? 'text-gray-400' : 'text-gray-700'}`}>
                Balance disponible: {formatPrice(walletBalance)}
              </div>
            </div>
          </div>
        </label>

        {/* Draft Option */}
        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${
          paymentMethod === 'draft' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value="draft"
              checked={paymentMethod === 'draft'}
              onChange={(e) => onPaymentMethodChange(e.target.value as 'draft')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Save className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">Guardar como Borrador</span>
              </div>
              <p className="text-sm text-gray-600">
                Guarda tu selección y completa la compra más tarde
              </p>
              <div className="text-sm text-gray-700 mt-1">
                Podrás pagar cuando tengas fondos suficientes
              </div>
            </div>
          </div>
        </label>
      </div>
    </motion.div>
  );
};

// Confirmation Step Component
const ConfirmationStep: React.FC<{
  result: any;
  formatPrice: (price: number) => string;
}> = ({ result, formatPrice }) => {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 text-center"
    >
      {result.success ? (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {result.type === 'draft' ? '¡Borrador Guardado!' : '¡Compra Exitosa!'}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {result.type === 'draft' 
              ? 'Tu selección ha sido guardada como borrador. Podrás completar la compra cuando tengas fondos suficientes.'
              : 'Tu compra ha sido procesada exitosamente. Recibirás un email de confirmación en breve.'
            }
          </p>

          {result.transactionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-1">ID de Transacción:</div>
              <div className="font-mono text-sm text-gray-900">{result.transactionId}</div>
            </div>
          )}

          {result.draftId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-1">ID de Borrador:</div>
              <div className="font-mono text-sm text-gray-900">{result.draftId}</div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error en el Checkout
          </h3>
          
          <p className="text-gray-600 mb-6">
            {result.error || 'Ocurrió un error inesperado. Por favor intenta nuevamente.'}
          </p>
        </>
      )}
    </motion.div>
  );
};

export default CheckoutFlow;