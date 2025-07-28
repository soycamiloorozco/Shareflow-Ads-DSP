import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, 
  ArrowRight, Check, 
  CreditCard, Wallet, Flame,
  Loader2
} from 'lucide-react';
import { Button } from '../Button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentApi } from '../../api/payment';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useWallet } from '../../hooks/useWallet';

const stripePromise = loadStripe('pk_test_51OHbGYHQkntOzh4KeXpPzlQ96Qj9vofFxGAvTfBVR8yKOBsupmAmQisj1wizDfkF543hpjoIOn7UuCPVcndFw4db00BcWQwc7h');

// Componente de formulario de pago
const PaymentForm = ({ onSuccess, onError, amount }: { onSuccess: (id: any) => void, onError: (error: any) => void, amount: number }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const data = {
        amount,
        currency: 'cop'
      };
      
      const { clientSecret } = await paymentApi.createPaymentIntent(data);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: user?.username,
              email: user?.email, 
            },
          },
        }
      );

      if (stripeError) {
        onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="p-3 bg-white rounded-lg border border-[#B8B8C0]">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        icon={ArrowRight}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Procesando...' : `Pagar ${amount.toLocaleString('es-CO')} COP`}
      </Button>
    </form>
  );
};

interface RechargePackage {
  id: string;
  amount: number;
  bonus: number;
  bonusPercentage: number;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  isPopular?: boolean;
  isLimited?: boolean;
  originalPrice?: number;
  savings?: number;
  features: string[];
}

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  bonusPercentage: number;
  endDate: Date;
  icon: string;
  gradient: string;
  urgency: 'low' | 'medium' | 'high';
  isActive: boolean;
}

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (amount: number, packageId: string, campaignId?: string) => Promise<void>;
  currentBalance: number;
  campaigns?: Campaign[];
}

const rechargePackages: RechargePackage[] = [
  {
    id: 'starter',
    amount: 100000,
    bonus: 5000,
    bonusPercentage: 5,
    title: 'Starter',
    description: 'Perfecto para comenzar',
    icon: '🚀',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['5% bonus', 'Válido por 30 días', 'Soporte básico']
  },
  {
    id: 'popular',
    amount: 500000,
    bonus: 50000,
    bonusPercentage: 10,
    title: 'Popular',
    description: 'La opción más elegida',
    icon: '⭐',
    gradient: 'from-purple-500 to-pink-500',
    isPopular: true,
    originalPrice: 550000,
    savings: 50000,
    features: ['10% bonus', 'Válido por 60 días', 'Soporte prioritario', 'Analytics básicos']
  },
  {
    id: 'premium',
    amount: 1000000,
    bonus: 150000,
    bonusPercentage: 15,
    title: 'Premium',
    description: 'Máximo valor y beneficios',
    icon: '👑',
    gradient: 'from-amber-500 to-orange-500',
    originalPrice: 1100000,
    savings: 100000,
    features: ['15% bonus', 'Válido por 90 días', 'Soporte VIP', 'Analytics avanzados', 'Descuentos exclusivos']
  },
  {
    id: 'enterprise',
    amount: 2000000,
    bonus: 400000,
    bonusPercentage: 20,
    title: 'Enterprise',
    description: 'Para grandes campañas',
    icon: '💎',
    gradient: 'from-emerald-500 to-teal-500',
    isLimited: true,
    originalPrice: 2200000,
    savings: 200000,
    features: ['20% bonus', 'Sin vencimiento', 'Account Manager', 'API access', 'Reportes personalizados']
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: 'black-friday',
    title: 'BLACK FRIDAY',
    subtitle: '+30% BONUS EXTRA',
    bonusPercentage: 30,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    icon: '🔥',
    gradient: 'from-red-600 to-orange-600',
    urgency: 'high',
    isActive: true
  },
  {
    id: 'weekend-boost',
    title: 'WEEKEND BOOST',
    subtitle: '+15% BONUS',
    bonusPercentage: 15,
    endDate: new Date(Date.now() + 18 * 60 * 60 * 1000),
    icon: '⚡',
    gradient: 'from-purple-600 to-pink-600',
    urgency: 'medium',
    isActive: true
  }
];

const formatTimeRemaining = (endDate: Date) => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return { expired: true };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return { days, hours, text: `${days}d ${hours}h` };
  if (hours > 0) return { hours, minutes, text: `${hours}h ${minutes}m` };
  return { minutes, text: `${minutes}m`, urgent: true };
};

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  onRecharge,
  currentBalance,
  campaigns = mockCampaigns
}) => {
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'packages' | 'payment'>('packages');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { deposit, isLoading: isDepositLoading } = useWallet();

  // Auto-select best campaign
  useEffect(() => {
    if (campaigns.length > 0) {
      const bestCampaign = campaigns
        .filter(c => c.isActive)
        .sort((a, b) => b.bonusPercentage - a.bonusPercentage)[0];
      setSelectedCampaign(bestCampaign);
    }
  }, [campaigns]);

  const calculateTotal = (pkg: RechargePackage) => {
    const baseBonus = pkg.bonus;
    const campaignBonus = selectedCampaign 
      ? (pkg.amount * selectedCampaign.bonusPercentage) / 100 
      : 0;
    return {
      amount: pkg.amount,
      baseBonus,
      campaignBonus,
      totalBonus: baseBonus + campaignBonus,
      totalCredits: pkg.amount + baseBonus + campaignBonus
    };
  };

  const handleRecharge = async () => {
    if (!selectedPackage) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    try {
      const depositResponse = await deposit({
        amount: selectedPackage.amount,
        paymentReference: paymentId,
        description: `Recarga de ${selectedPackage.amount.toLocaleString()} COP - Paquete ${selectedPackage.title}`
      });

      if (depositResponse) {
        await onRecharge(
          selectedPackage.amount, 
          selectedPackage.id, 
          selectedCampaign?.id
        );
        setShowPaymentModal(false);
        onClose();
      } 
    } catch (error) {
      console.error('Recharge failed:', error);
      alert('Error al procesar la recarga. Por favor, intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    alert(`Error en el pago: ${error}`);
  };

  const activeCampaigns = campaigns.filter(c => c.isActive);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
              <motion.div
                animate={{ 
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0"
              />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Recargar Créditos</h2>
                    <p className="text-white/80 text-lg">
                      Saldo actual: <span className="font-semibold">${currentBalance.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-white/20 rounded-full transition-colors"
                  disabled={isProcessing}
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Active Campaigns Banner */}
            {activeCampaigns.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center"
                  >
                    <Flame className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-800 dark:text-orange-200 text-lg">
                      🔥 ¡Ofertas Activas! Aprovecha los bonos extra
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {activeCampaigns.map((campaign) => {
                        const timeLeft = formatTimeRemaining(campaign.endDate);
                        return (
                          <motion.div
                            key={campaign.id}
                            whileHover={{ scale: 1.05 }}
                            className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedCampaign?.id === campaign.id
                                ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30'
                                : 'border-orange-300 bg-white dark:bg-gray-800 hover:border-orange-400'
                            }`}
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{campaign.icon}</span>
                              <div>
                                <p className="font-semibold text-sm text-orange-800 dark:text-orange-200">
                                  {campaign.title}
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-300">
                                  +{campaign.bonusPercentage}% • {timeLeft.text}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Packages Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rechargePackages.map((pkg, index) => {
                  const totals = calculateTotal(pkg);
                  const isSelected = selectedPackage?.id === pkg.id;
                  
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 shadow-lg ${
                        isSelected
                          ? 'border-blue-500 shadow-xl shadow-blue-500/25 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:shadow-xl bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {/* Popular Badge */}
                      {pkg.isPopular && (
                        <motion.div
                          initial={{ scale: 0, rotate: -12 }}
                          animate={{ scale: 1, rotate: -12 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10"
                        >
                          MÁS POPULAR
                        </motion.div>
                      )}

                      {/* Limited Badge */}
                      {pkg.isLimited && (
                        <motion.div
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-3 -left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10"
                        >
                          LIMITADO
                        </motion.div>
                      )}

                      {/* Package Icon */}
                      <div className={`w-20 h-20 bg-gradient-to-r ${pkg.gradient} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                        <span className="text-3xl">{pkg.icon}</span>
                      </div>

                      {/* Package Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {pkg.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="text-center mb-6">
                        {pkg.originalPrice && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-through mb-1">
                            ${pkg.originalPrice.toLocaleString()}
                          </p>
                        )}
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          ${pkg.amount.toLocaleString()}
                        </p>
                        {pkg.savings && (
                          <p className="text-green-600 dark:text-green-400 text-sm font-semibold">
                            Ahorras ${pkg.savings.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Bonus Calculation */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-600">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Créditos base:</span>
                            <span className="font-bold text-gray-900 dark:text-white">${totals.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Bonus paquete:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">+${totals.baseBonus.toLocaleString()}</span>
                          </div>
                          {totals.campaignBonus > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">Bonus campaña:</span>
                              <span className="font-bold text-orange-600 dark:text-orange-400">+${totals.campaignBonus.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-300 dark:border-gray-500 pt-2 flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white text-base">Total:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                              ${totals.totalCredits.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        {pkg.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CreditCard className="w-4 h-4" />
                    <span>Pago seguro con SSL</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Wallet className="w-4 h-4" />
                    <span>Créditos instantáneos</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                  
                  <motion.div
                    whileHover={{ scale: selectedPackage ? 1.05 : 1 }}
                    whileTap={{ scale: selectedPackage ? 0.95 : 1 }}
                  >
                    <Button
                      variant="primary"
                      onClick={handleRecharge}
                      disabled={!selectedPackage || isProcessing}
                      className={`${selectedPackage ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Procesando...
                        </div>
                      ) : selectedPackage ? (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Recargar ${calculateTotal(selectedPackage).totalCredits.toLocaleString()}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      ) : (
                        'Selecciona un paquete'
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Pago con Tarjeta</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Resumen del pago</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Paquete:</span>
                      <span className="font-medium">{selectedPackage.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monto base:</span>
                      <span className="font-medium">${selectedPackage.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Bonus paquete:</span>
                      <span className="text-green-600 dark:text-green-400">+${selectedPackage.bonus.toLocaleString()}</span>
                    </div>
                    {selectedCampaign && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Bonus campaña:</span>
                        <span className="text-orange-600 dark:text-orange-400">
                          +${((selectedPackage.amount * selectedCampaign.bonusPercentage) / 100).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Total a pagar:</span>
                        <span className="font-bold text-lg">${calculateTotal(selectedPackage).amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isProcessing ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-3">
                      Procesando pago... no cierre la página
                    </p>
                  </div>
                ) : (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      amount={calculateTotal(selectedPackage).amount}
                    />
                  </Elements>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}; 