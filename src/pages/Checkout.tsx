import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, CreditCard, Wallet, Check, AlertCircle, 
  Clock, Calendar, MapPin, Users, ShoppingBag, 
  ChevronRight, Lock, Shield, Star
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/Button';
import { constants } from '../config/constants';
import WalletCheck from '../components/cart/WalletCheck';
import PaymentOptions from '../components/cart/PaymentOptions';
import ConfirmationScreen from '../components/cart/ConfirmationScreen';

type CheckoutStep = 'review' | 'payment' | 'confirmation';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/sports-events');
    }
  }, [cart.items.length, navigate]);

  // Check if all events are configured
  const allConfigured = cart.items.every(item => item.isConfigured);
  const unconfiguredCount = cart.items.filter(item => !item.isConfigured).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleBackToCart = () => {
    navigate(-1);
  };

  const handleProceedToPayment = () => {
    if (!allConfigured) {
      alert('Todos los eventos deben estar configurados antes de proceder al pago');
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (txId: string) => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactionId(txId);
      setCurrentStep('confirmation');
      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
      }, 3000);
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotalAudience = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.estimatedAttendance || 0) + (item.estimatedAttendanceTv || 0);
    }, 0);
  };

  const calculateCostPerImpression = () => {
    const totalAudience = calculateTotalAudience();
    return totalAudience > 0 ? (cart.totalPrice / totalAudience) * 1000 : 0;
  };

  if (cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-600">
                  {cart.items.length} evento{cart.items.length !== 1 ? 's' : ''} • {formatPrice(cart.totalPrice)}
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="hidden md:flex items-center space-x-4">
              <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : currentStep === 'payment' || currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'review' ? 'bg-blue-100' : currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {currentStep === 'payment' || currentStep === 'confirmation' ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Revisar</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'payment' ? 'bg-blue-100' : currentStep === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {currentStep === 'confirmation' ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Pago</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${currentStep === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'confirmation' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Confirmación</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Configuration Warning */}
                {!allConfigured && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-900 mb-1">
                          Configuración pendiente
                        </h3>
                        <p className="text-sm text-amber-700 mb-3">
                          {unconfiguredCount} evento{unconfiguredCount !== 1 ? 's' : ''} necesita{unconfiguredCount === 1 ? '' : 'n'} configuración de momentos antes de proceder al pago.
                        </p>
                        <button
                          onClick={handleBackToCart}
                          className="text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                        >
                          Volver al carrito para configurar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Events List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Eventos seleccionados
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {cart.items.map((event) => (
                      <div key={event.cartId} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                              alt={event.stadiumName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {event.homeTeamName} vs {event.awayTeamName}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(event.eventDate).toLocaleDateString('es-CO')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {event.eventTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.stadiumName}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  {formatPrice(event.finalPrice || event.estimatedPrice)}
                                </div>
                                <div className={`text-sm ${event.isConfigured ? 'text-green-600' : 'text-amber-600'}`}>
                                  {event.isConfigured ? (
                                    <span className="flex items-center gap-1">
                                      <Check className="w-4 h-4" />
                                      Configurado
                                    </span>
                                  ) : (
                                    'Pendiente configuración'
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Moments Summary */}
                            {event.selectedMoments && event.selectedMoments.length > 0 && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Momentos seleccionados:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {event.selectedMoments.map((moment, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                      {moment.moment} × {moment.quantity} - {formatPrice(moment.price * moment.quantity)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Resumen del pedido
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Eventos:</span>
                      <span className="font-medium">{cart.items.length}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Audiencia total:</span>
                      <span className="font-medium">{calculateTotalAudience().toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CPM promedio:</span>
                      <span className="font-medium">${calculateCostPerImpression().toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(cart.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Pago seguro</h4>
                      <p className="text-sm text-green-700">
                        Transacciones protegidas con encriptación SSL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleProceedToPayment}
                  disabled={!allConfigured}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={ArrowRight}
                >
                  {allConfigured ? 'Proceder al pago' : 'Configurar eventos primero'}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PaymentOptions
                totalAmount={cart.totalPrice}
                onPaymentSuccess={handlePaymentSuccess}
                onBack={() => setCurrentStep('review')}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}

          {currentStep === 'confirmation' && transactionId && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ConfirmationScreen
                transactionId={transactionId}
                purchasedEvents={cart.items}
                totalAmount={cart.totalPrice}
                onContinueShopping={() => navigate('/sports-events')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Checkout;