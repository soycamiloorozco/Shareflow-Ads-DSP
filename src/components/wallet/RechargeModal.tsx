import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, CreditCard, Gift, Crown, AlertTriangle, ChevronRight, 
  ChevronLeft, Loader2, Sparkles, Zap, Star
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51OHbGYHQkntOzh4KeXpPzlQ96Qj9vofFxGAvTfBVR8yKOBsupmAmQisj1wizDfkF543hpjoIOn7UuCPVcndFw4db00BcWQwc7h');

interface RechargePackage {
  amount: number;
  label: string;
  title: string;
  description: string;
  icon: string;
  popular?: boolean;
}

interface PaymentData {
  cardNumber: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvv: string;
  documentType: 'CC' | 'CE' | 'TI' | 'PAS';
  documentNumber: string;
  email: string;
  phone: string;
}

interface Campaign {
  name: string;
  description: string;
  value: number;
  icon: string;
  minAmount: number;
  bonusPercentage: number;
}

interface UserLevel {
  name: string;
  bonusPercentage: number;
}

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (amount: number) => Promise<void>;
  currentBalance: number;
  currentCampaign?: Campaign | null;
  currentLevel: UserLevel;
  userType: string;
  timeLeft: number;
  calculateBonus: (amount: number) => number;
  calculateLevelBonus: (amount: number) => number;
  calculateCampaignBonus: (amount: number) => number;
  calculateFinancialCommission: (amount: number, method: string) => number;
  formatBalance: (amount: number) => string;
  formatCurrency: (amount: number) => string;
  formatCreditsText: (amount: number) => string;
  deposit: any;
  PaymentForm: React.ComponentType<any>;
}

const rechargePackages: RechargePackage[] = [
  {
    amount: 100000,
    label: "100K",
    title: "Explorando",
    description: "Perfecto para comenzar",
    icon: "🎯"
  },
  {
    amount: 500000,
    label: "500K", 
    title: "Creciendo",
    description: "El más popular",
    icon: "⚡",
    popular: true
  },
  {
    amount: 1500000,
    label: "1.5M",
    title: "Expandiendo", 
    description: "Para marcas serias",
    icon: "🔥"
  },
  {
    amount: 4000000,
    label: "4M",
    title: "Dominando",
    description: "Presencia total",
    icon: "👑"
  }
];

const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  onRecharge,
  currentBalance,
  currentCampaign,
  currentLevel,
  userType,
  timeLeft,
  calculateBonus,
  calculateLevelBonus,
  calculateCampaignBonus,
  calculateFinancialCommission,
  formatBalance,
  formatCurrency,
  formatCreditsText,
  deposit,
  PaymentForm
}) => {
  const [step, setStep] = useState<'packages' | 'payment'>('packages');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'pse' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: '',
    documentType: 'CC',
    documentNumber: '',
    email: '',
    phone: ''
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue) {
      const amount = parseInt(numericValue);
      setCustomAmount(numericValue);
      setSelectedAmount(amount);
    } else {
      setCustomAmount('');
      setSelectedAmount(0);
    }
  };

  const handleContinueToPayment = () => {
    if (selectedAmount >= 100000) {
      setSelectedPaymentMethod('card');
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      await deposit(selectedAmount);
      await onRecharge(selectedAmount);
      handleCloseModal();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
  };

  const handleCloseModal = () => {
    setStep('packages');
    setSelectedAmount(0);
    setCustomAmount('');
    setIsProcessing(false);
    setPaymentData({
      cardNumber: '',
      cardHolder: '',
      cardExpiry: '',
      cardCvv: '',
      documentType: 'CC',
      documentNumber: '',
      email: '',
      phone: ''
    });
    setSelectedPaymentMethod(null);
    onClose();
  };

  const finalAmount = selectedAmount || 0;
  const bonus = calculateBonus(finalAmount);
  const total = finalAmount + bonus;
  const getTotalWithCommission = () => finalAmount + calculateFinancialCommission(finalAmount, 'card');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white backdrop-blur-xl w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
      >
        {/* HEADER FIJO */}
        <div className="flex-shrink-0 bg-blue-50 border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recargar Wallet</h2>
                <p className="text-xs sm:text-sm text-gray-600">Saldo actual: {formatBalance(currentBalance)}</p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Campaign Badge */}
          {currentCampaign && step === 'packages' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{currentCampaign.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{currentCampaign.name}</h3>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      ¡{timeLeft} DÍAS!
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">{currentCampaign.description}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="font-bold text-orange-600">+{currentCampaign.value}%</p>
                  <p className="text-xs text-gray-500">{userType}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'packages' && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 sm:p-6 space-y-6"
              >
                {/* Packages Grid */}
                <div>
                  <h3 className="text-md sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    Elige tu paquete
                  </h3>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    {rechargePackages.map((pkg) => {
                      const totalBonus = calculateBonus(pkg.amount);
                      const finalTotal = pkg.amount + totalBonus;
                      
                      return (
                        <motion.button
                          key={pkg.amount}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAmountSelect(pkg.amount)}
                          className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                            selectedAmount === pkg.amount
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/50'
                          }`}
                        >
                          {/* Popular Badge */}
                          {pkg.popular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                              POPULAR
                            </div>
                          )}
                          
                          {/* Selected Indicator */}
                          {selectedAmount === pkg.amount && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg sm:text-xl">{pkg.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-gray-900 text-sm truncate">{pkg.label}</div>
                                <div className="text-xs text-gray-600 truncate">{pkg.title}</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-md sm:text-lg font-bold text-gray-800">
                                {formatCurrency(pkg.amount)}
                              </div>
                              <p className="text-xs text-gray-600 leading-tight line-clamp-2">{pkg.description}</p>
                            </div>
                            
                            {/* Simplified Bonus Display */}
                            {totalBonus > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                <div className="text-xs font-semibold text-blue-900 mb-1">
                                  🎁 Compras {formatCurrency(pkg.amount)}
                                </div>
                                <div className="text-xs font-bold text-blue-700">
                                  Recibes {formatCreditsText(finalTotal)}
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  Bonus: +{formatCreditsText(totalBonus)}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-500">✏️</span>
                    Monto personalizado
                  </h4>
                  <div className="max-w-full sm:max-w-sm">
                    <div className="relative">
                      <input
                        type="text"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        placeholder="Mínimo $100.000"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm font-medium bg-gray-50 focus:bg-white transition-all"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                        COP
                      </div>
                    </div>
                    {customAmount && parseInt(customAmount.replace(/\D/g, '')) < 100000 && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        El monto mínimo es $100.000
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {finalAmount >= 100000 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                  >
                    <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-blue-500">📋</span>
                      Resumen de tu recarga
                    </h4>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 mb-2">
                          Compras {formatCurrency(finalAmount)}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          Recibes {formatCreditsText(total)}
                        </div>
                        {bonus > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            🎁 Bonus adicional: +{formatCreditsText(bonus)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 sm:p-6 space-y-6"
              >
                {/* Payment Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-500">💳</span>
                    Resumen del pago
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Monto:</span>
                      <span className="font-bold">{formatCurrency(finalAmount)}</span>
                    </div>

                    {calculateLevelBonus(finalAmount) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Bonus Nivel ({currentLevel.bonusPercentage}%):
                        </span>
                        <span className="font-bold text-blue-600">
                          +{formatCreditsText(calculateLevelBonus(finalAmount))}
                        </span>
                      </div>
                    )}
                    
                    {calculateCampaignBonus(finalAmount) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Bonus Campaña ({currentCampaign?.value}%):
                        </span>
                        <span className="font-bold text-green-600">
                          +{formatCreditsText(calculateCampaignBonus(finalAmount))}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-orange-600 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Comisión (5%):
                      </span>
                      <span className="font-bold text-orange-600">
                        +{formatCurrency(calculateFinancialCommission(finalAmount, 'card'))}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total a pagar:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(getTotalWithCommission())}
                        </div>
                        <div className="text-xs text-gray-500">
                          = {formatCreditsText(total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-4">Información de pago</h4>
                  
                  {isProcessing ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      <p className="text-sm text-gray-600 ml-3">
                        Procesando pago... no cierre la página
                      </p>
                    </div>
                  ) : (
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        onSuccess={handlePayment}
                        onError={handlePaymentError}
                        amount={getTotalWithCommission()}
                      />
                    </Elements>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER FIJO CON BOTONES */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          {step === 'packages' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinueToPayment}
              disabled={!selectedAmount || selectedAmount < 100000}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Continuar al Pago
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('packages')}
              className="w-full px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a Paquetes
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RechargeModal; 