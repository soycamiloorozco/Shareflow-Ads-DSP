import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  CreditCard, 
  ArrowLeft,
  Check, 
  AlertTriangle, 
  Shield,
  Loader2
} from 'lucide-react';
import { Button } from '../Button';

interface PaymentOptionsProps {
  totalAmount: number;
  onPaymentSuccess: (transactionId: string) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  totalAmount,
  onPaymentSuccess,
  onBack,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [walletBalance] = useState(5000000); // Demo wallet balance
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const hasInsufficientFunds = totalAmount > walletBalance;

  const handlePayment = async () => {
    if (paymentMethod === 'wallet' && hasInsufficientFunds) {
      alert('Fondos insuficientes en la wallet');
      return;
    }

    // Simulate payment processing
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPaymentSuccess(transactionId);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Método de pago</h2>
          <p className="text-gray-600">Total a pagar: {formatPrice(totalAmount)}</p>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona tu método de pago
        </h3>

        <div className="space-y-4">
          {/* Wallet Option */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'wallet'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('wallet')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'wallet' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Wallet className={`w-5 h-5 ${
                    paymentMethod === 'wallet' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Wallet Shareflow</h4>
                  <p className="text-sm text-gray-600">
                    Balance disponible: {formatPrice(walletBalance)}
                  </p>
                </div>
              </div>
              {paymentMethod === 'wallet' && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>

            {hasInsufficientFunds && paymentMethod === 'wallet' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    Fondos insuficientes. Necesitas {formatPrice(totalAmount - walletBalance)} adicionales.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card Option */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('card')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'card' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <CreditCard className={`w-5 h-5 ${
                    paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tarjeta de Crédito/Débito</h4>
                  <p className="text-sm text-gray-600">
                    Visa, Mastercard, American Express
                  </p>
                </div>
              </div>
              {paymentMethod === 'card' && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Details Form */}
      {paymentMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información de la tarjeta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de tarjeta
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de vencimiento
              </label>
              <input
                type="text"
                placeholder="MM/AA"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del titular
              </label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-600" />
          <div>
            <h4 className="font-medium text-green-900">Pago 100% seguro</h4>
            <p className="text-sm text-green-700">
              Tus datos están protegidos con encriptación SSL de 256 bits
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || (paymentMethod === 'wallet' && hasInsufficientFunds)}
        variant="primary"
        size="lg"
        fullWidth
        icon={isProcessing ? Loader2 : undefined}
        className={isProcessing ? 'animate-spin' : ''}
      >
        {isProcessing 
          ? 'Procesando pago...' 
          : `Pagar ${formatPrice(totalAmount)}`
        }
      </Button>
    </div>
  );
};

export default PaymentOptions;