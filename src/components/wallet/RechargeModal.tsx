import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, CreditCard, Gift, Crown, AlertTriangle, 
  Loader2, Sparkles, Zap, Star, Shield, Info, ArrowRight, Lock
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51OHbGYHQkntOzh4KeXpPzlQ96Qj9vofFxGAvTfBVR8yKOBsupmAmQisj1wizDfkF543hpjoIOn7UuCPVcndFw4db00BcWQwc7h');

// Stripe appearance configuration for professional look
const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#3b82f6',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '2px',
    borderRadius: '6px',
    fontSizeBase: '13px',
    colorTextSecondary: '#6b7280',
    colorTextPlaceholder: '#9ca3af'
  },
  rules: {
    '.Input': {
      padding: '8px 10px',
      fontSize: '13px',
      border: '1px solid #e5e7eb',
      boxShadow: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    '.Input:focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1)'
    },
    '.Input--invalid': {
      borderColor: '#ef4444'
    },
    '.Label': {
      fontSize: '11px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '3px',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    '.Tab': {
      padding: '6px 10px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    '.Tab:hover': {
      borderColor: '#d1d5db'
    },
    '.Tab--selected': {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff'
    }
  }
};

interface RechargePackage {
  amount: number;
  label: string;
  title: string;
  description: string;
  icon: string;
  popular?: boolean;
  savings?: string;
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
    description: "Ideal para empezar",
    icon: "🎯"
  },
  {
    amount: 500000,
    label: "500K", 
    title: "Creciendo",
    description: "Más contenido",
    icon: "⚡",
    popular: true
  },
  {
    amount: 1500000,
    label: "1.5M",
    title: "Expandiendo", 
    description: "Máximo alcance",
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
  const [selectedAmount, setSelectedAmount] = useState<number>(500000); // Default to popular option
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAmount(500000);
      setCustomAmount('');
      setIsProcessing(false);
      setShowPaymentForm(false);
    }
  }, [isOpen]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
    setShowPaymentForm(true);
  };

  const handleCustomAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue) {
      const amount = parseInt(numericValue);
      if (amount >= 100000) {
        setCustomAmount(numericValue);
        setSelectedAmount(amount);
        setShowPaymentForm(true);
      } else {
        setCustomAmount(numericValue);
        setSelectedAmount(0);
        setShowPaymentForm(false);
      }
    } else {
      setCustomAmount('');
      setSelectedAmount(0);
      setShowPaymentForm(false);
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
    setSelectedAmount(500000);
    setCustomAmount('');
    setIsProcessing(false);
    setShowPaymentForm(false);
    onClose();
  };

  const finalAmount = selectedAmount || 0;
  const bonus = calculateBonus(finalAmount);
  const levelBonus = 0; // Always 0 since it's disabled
  const campaignBonus = calculateCampaignBonus(finalAmount);
  const commission = calculateFinancialCommission(finalAmount, 'card');
  const total = finalAmount + campaignBonus; // Only campaign bonus
  const totalWithCommission = finalAmount + commission;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: "100%", scale: 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: "100%", scale: 1 }}
        className="bg-white w-full sm:w-auto sm:max-w-5xl max-h-screen sm:max-h-[85vh] sm:rounded-xl shadow-2xl border-0 sm:border border-gray-200 overflow-hidden flex flex-col"
      >
        {/* Header - Compact */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recargar Wallet</h2>
                <p className="text-xs text-gray-600">Saldo: {formatBalance(currentBalance)}</p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Campaign Alert - Compact */}
          {currentCampaign && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{currentCampaign.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{currentCampaign.name}</h3>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      {timeLeft} días
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{currentCampaign.description}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="bg-orange-500 text-white rounded-lg px-2 py-1">
                    <p className="font-bold text-sm leading-none">+{currentCampaign.value}%</p>
                    <p className="text-xs opacity-90">bonus</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content - Horizontal layout for desktop */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Side - Amount Selection */}
            <div className="flex-1 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="text-base font-bold text-gray-900">Selecciona el monto</h3>
              </div>
              
              {/* Custom Amount Input */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-gray-700 block">
                  Monto a recargar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customAmount ? parseInt(customAmount).toLocaleString('es-CO') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleCustomAmountChange(value);
                    }}
                    placeholder="Ingresa el monto"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors bg-white"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                    $ COP
                  </div>
                </div>
                {customAmount && selectedAmount < 100000 && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    El monto mínimo es $100,000 COP
                  </p>
                )}
              </div>

              {/* Quick Amount Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block">
                  Opciones rápidas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[100000, 500000, 1000000, 2500000, 5000000, 10000000].map((amount) => {
                    const isSelected = selectedAmount === amount;
                    
                    return (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <div className="font-medium text-sm">
                          ${amount.toLocaleString('es-CO')}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">COP</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campaign bonus info when amount is selected */}
              {selectedAmount >= 100000 && campaignBonus > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <Star className="w-4 h-4" />
                    Bonus de campaña activa
                  </div>
                  <div className="text-green-600 font-bold text-lg mt-1">
                    +{formatCreditsText(campaignBonus)}
                  </div>
                  <div className="text-green-600 text-xs">
                    {currentCampaign?.value}% adicional por tiempo limitado
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Summary and Payment */}
            <div className="flex-1 p-4 sm:p-5">
              <AnimatePresence>
                {selectedAmount >= 100000 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                                         {/* Bonus Breakdown - Simplified */}
                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                       <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                         <Gift className="w-4 h-4 text-gray-600" />
                         Resumen de tu recarga
                       </h4>
                       
                       <div className="space-y-3">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">Monto a recargar</span>
                           <span className="font-semibold text-gray-900">{formatCurrency(finalAmount)}</span>
                         </div>
                         
                         {campaignBonus > 0 && (
                           <div className="flex justify-between items-center">
                             <span className="flex items-center gap-1 text-sm text-gray-600">
                               <Star className="w-3 h-3 text-green-500" />
                               Bonus campaña ({currentCampaign?.value}%)
                             </span>
                             <span className="font-semibold text-green-600">+{formatCreditsText(campaignBonus)}</span>
                           </div>
                         )}
                         
                         <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                           <span className="font-bold text-gray-900">Total a recibir</span>
                           <div className="text-right">
                             <div className="text-xl font-bold text-blue-600">
                               {formatCreditsText(total)}
                             </div>
                             <div className="text-xs text-gray-500">Shareflow Credits</div>
                           </div>
                         </div>
                       </div>
                     </div>

                    {/* Payment Section - Simplified */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          Método de pago
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Shield className="w-3 h-3" />
                          Seguro con Stripe
                        </div>
                      </div>
                      
                      {/* Payment total */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total a pagar</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(totalWithCommission)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Incluye comisión {formatCurrency(commission)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Banking Commission Notice */}
                      <div className="mb-4 text-xs text-gray-500 bg-gray-100 rounded-lg p-3 border border-gray-200">
                        <p className="leading-relaxed">
                          <span className="font-medium">Aviso:</span> Se aplica una comisión bancaria del 5% por pagos con tarjeta de crédito/débito, según regulaciones financieras vigentes.
                        </p>
                      </div>

                      {/* Stripe Payment Form */}
                      {showPaymentForm && (
                        <div className="space-y-3">
                          {isProcessing ? (
                            <div className="flex justify-center items-center py-6">
                              <div className="text-center">
                                <Loader2 className="w-5 h-5 text-gray-500 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-gray-600 font-medium">
                                  Procesando pago seguro...
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  No cierres esta ventana
                                </p>
                              </div>
                            </div>
                          ) : (
                            <Elements 
                              stripe={stripePromise}
                              options={{
                                appearance: stripeAppearance,
                                clientSecret: undefined
                              }}
                            >
                              <PaymentForm
                                onSuccess={handlePayment}
                                onError={handlePaymentError}
                                amount={totalWithCommission}
                              />
                            </Elements>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Los credits se acreditan inmediatamente después del pago</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RechargeModal; 