import React, { useState, useMemo, useCallback, memo, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Calendar, Clock, DollarSign, Upload,
  ArrowRight, Download, Wallet, FileText, AlertTriangle, Loader,
  CreditCard, Shield, Zap, Star, TrendingUp, Users, Eye, CheckCircle, Monitor,
  Mail, RefreshCw, Package2, BarChart2
} from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Screen } from '../../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/**
 * BookingSummaryModal - Modal para confirmar compras de pantallas
 * 
 * VALIDACIÓN DE SALDO:
 * - Intenta usar el contexto real de wallet (WalletPageNew)
 * - Si no está disponible, usa datos mock como fallback
 * - Valida si el usuario tiene saldo suficiente antes de permitir la compra
 * - Muestra diferentes estados: wallet no disponible, saldo insuficiente, saldo suficiente
 * - Incluye manejo de errores para casos donde la API no responde
 */

// Mobile-first responsive breakpoints hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

interface BookingData {
  screen: {
    id: string;
    location: string;
    name?: string;
    category?: { name: string };
    views?: { daily: number };
    rating?: number;
  };
  type: 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  price: number;
  date?: Date;
  dates?: Date[];
  time?: string;
  minute?: number;
  timeSlots?: string[];
  spots?: number;
  uploadLater?: boolean;
  selectedBundle?: {
    id: string;
    name: string;
    description: string;
    duration: string;
    spots: number;
    reach: number;
  };
  creative?: {
    file: File;
    base64: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any;
}

// Memoized formatter functions to prevent recreation on every render
const formatters = {
  date: (date: Date) => date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }),
  currency: new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
};

// Memoized type labels constant
const TYPE_LABELS = {
  moment: 'Momento',
  hourly: 'Por Hora',
  daily: 'Por Día',
  weekly: 'Semanal',
  monthly: 'Mensual'
} as const;

// Enhanced wallet hook using real API endpoint
const useWalletBalance = () => {
  const [balance, setBalance] = useState(0);
  const [walletAvailable, setWalletAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch balance from real API
  const fetchBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://api.shareflow.me/api/wallet/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if token is available
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
        setWalletAvailable(true);
      } else {
        console.warn('Failed to fetch balance:', response.status);
        setBalance(0);
        setWalletAvailable(false);
      }
    } catch (error) {
      console.warn('Error fetching balance:', error);
      setBalance(0);
      setWalletAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);
  
  const consumeCredits = useCallback(async (amount: number, description: string, bookingData?: any) => {
    if (balance >= amount) {
      try {
        // Extract screen ID - try to get numeric ID from screen object
        let screenId = 1; // Default fallback
        if (bookingData?.screen?.id) {
          // Try to extract numeric ID from screen.id
          const numericId = parseInt(bookingData.screen.id.toString());
          if (!isNaN(numericId)) {
            screenId = numericId;
          }
        }

        // Prepare the request body for /api/PublicityPurchases
        const requestBody: any = {
          amount,
          description,
          screenId
        };

        // Debug: Log bookingData to see what's available
        console.log('🔍 bookingData.creative available:', !!bookingData?.creative);
        if (bookingData?.creative) {
          console.log('🔍 Creative data structure:', {
            hasBase64: !!bookingData.creative.base64,
            fileName: bookingData.creative.fileName,
            fileType: bookingData.creative.fileType,
            fileSize: bookingData.creative.fileSize
          });
        }

        // Add creative data if available - ensure it's always present
        if (bookingData?.creative) {
          requestBody.creative = {
            base64: bookingData.creative.base64,
            fileName: bookingData.creative.fileName,
            fileType: bookingData.creative.fileType,
            fileSize: bookingData.creative.fileSize
          };
        } else if (bookingData?.file && !bookingData?.uploadLater) {
          // Convert file to base64 synchronously for this request
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Failed to convert file to base64'));
              }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(bookingData.file);
          });
          
          requestBody.creative = {
            base64: base64Data,
            fileName: bookingData.file.name,
            fileType: bookingData.file.type,
            fileSize: bookingData.file.size
          };
        } else {
          // If no creative data, send a placeholder to satisfy the required field
          requestBody.creative = {
            base64: "",
            fileName: "placeholder.png",
            fileType: "image/png",
            fileSize: 0
          };
        }

        // Log the request body for debugging
        console.log('📤 Sending to /api/PublicityPurchases:', {
          ...requestBody,
          creative: {
            ...requestBody.creative,
            base64: requestBody.creative.base64 ? `${requestBody.creative.base64.substring(0, 50)}...` : 'empty'
          }
        });

        // Call the new PublicityPurchases endpoint
        const response = await fetch('https://api.shareflow.me/api/PublicityPurchases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('auth_token') && {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            })
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('PublicityPurchases API error:', response.status, errorText);
          throw new Error('Error al procesar la compra publicitaria');
        }
        
        const result = await response.json();
        return {
          id: result.transactionId || result.id || `tx-${Date.now()}`,
          amount: -amount,
          description,
          success: true
        };
      } catch (apiError) {
        console.error('PublicityPurchases API call failed:', apiError);
        throw new Error('Error al procesar la compra publicitaria');
      }
    } else {
      throw new Error('Saldo insuficiente');
    }
  }, [balance]);

  return { balance, consumeCredits, walletAvailable, isLoading, fetchBalance };
};

// Memoized status classes and icons
const STATUS_CONFIG = {
  success: {
    className: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200",
    icon: <CheckCircle className="w-5 h-5 text-green-600" />
  },
  warning: {
    className: "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200",
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />
  },
  danger: {
    className: "bg-gradient-to-r from-red-50 to-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />
  },
  info: {
    className: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200",
    icon: <Shield className="w-5 h-5 text-blue-600" />
  }
};

// Mobile-first animation variants (reduced motion for better performance)
const ANIMATION_VARIANTS = {
  modal: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  content: {
    initial: { scale: 0.98, opacity: 0, y: 20 },
    exit: { scale: 0.98, opacity: 0, y: 20 }
  },
  header: {
    initial: { y: -10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: 0.05, duration: 0.3 }
  },
  mobileColumn: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: 0.1, duration: 0.4 }
  },
  desktopColumns: {
    left: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { delay: 0.2, duration: 0.4 }
    },
    right: {
      initial: { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { delay: 0.3, duration: 0.4 }
    }
  }
};

// Memoized StatusBadge Component
const StatusBadge = memo<{
  status: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}>(({ status, children }) => {
  const config = STATUS_CONFIG[status];

  return (
    <motion.div 
      className={`px-4 py-3 rounded-xl border ${config.className} flex items-center gap-3`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {config.icon}
      <div className="flex-1">{children}</div>
    </motion.div>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Memoized TimeSlots Component
const TimeSlots = memo<{ timeSlots: string[] }>(({ timeSlots }) => (
  <div className="py-3">
    <div className="flex items-center gap-3 mb-3">
      <Clock className="w-5 h-5 text-gray-400" />
      <span className="text-gray-600">Franjas horarias ({timeSlots.length})</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {timeSlots.map((slot: string, index: number) => (
        <motion.span
          key={slot}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          whileHover={{ scale: 1.05, backgroundColor: '#dbeafe' }}
        >
          {slot}
        </motion.span>
      ))}
    </div>
  </div>
));

TimeSlots.displayName = 'TimeSlots';

// Memoized BundleInfo Component
const BundleInfo = memo<{ bundle: any }>(({ bundle }) => (
  <motion.div 
    className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <div className="flex items-center gap-3 mb-2">
      <Star className="w-5 h-5 text-purple-600" />
      <span className="font-semibold text-purple-900">{bundle.name}</span>
    </div>
    <p className="text-sm text-purple-700 mb-3">{bundle.description}</p>
    <div className="grid grid-cols-3 gap-3 text-sm">
      <motion.div 
        className="text-center"
        whileHover={{ scale: 1.05 }}
      >
        <div className="font-semibold text-purple-900">{bundle.spots}</div>
        <div className="text-purple-600">Spots</div>
      </motion.div>
      <motion.div 
        className="text-center"
        whileHover={{ scale: 1.05 }}
      >
        <div className="font-semibold text-purple-900">{bundle.reach?.toLocaleString()}</div>
        <div className="text-purple-600">Alcance</div>
      </motion.div>
      <motion.div 
        className="text-center"
        whileHover={{ scale: 1.05 }}
      >
        <div className="font-semibold text-purple-900">{bundle.duration}</div>
        <div className="text-purple-600">Duración</div>
      </motion.div>
    </div>
  </motion.div>
));

BundleInfo.displayName = 'BundleInfo';

// Purchase Celebration Modal Component - Inspired by WalletPageNew celebration
interface PurchaseCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseData: {
    transactionId: string;
    campaignId: string;
    screenName: string;
    bookingType: string;
    totalAmount: number;
    newBalance: number;
  };
}

// Optimized confetti animation with reduced particles for better performance
const OptimizedConfetti = memo<{ isMobile: boolean }>(({ isMobile }) => {
  const particleCount = isMobile ? 20 : 30; // Reduced for mobile performance
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full`}
          style={{
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
            left: `${Math.random() * 100}%`,
            top: `-10px`
          }}
          animate={{
            y: [0, (typeof window !== 'undefined' ? window.innerHeight : 800) + 50],
            x: [0, (Math.random() - 0.5) * (isMobile ? 50 : 100)],
            rotate: [0, 360],
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: isMobile ? 2.5 : 3,
            repeat: Infinity,
            delay: Math.random() * 1.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
});

OptimizedConfetti.displayName = 'OptimizedConfetti';

// Mobile-first purchase details component
const PurchaseDetails = memo<{
  screenName: string;
  bookingType: string;
  totalAmount: number;
  newBalance: number;
  transactionId: string;
  isMobile: boolean;
}>(({ screenName, bookingType, totalAmount, newBalance, transactionId, isMobile }) => (
  <motion.div
    initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.4 }}
    className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 ${
      isMobile ? 'rounded-2xl p-4 mb-6 space-y-3' : 'rounded-2xl p-6 mb-8 space-y-4'
    }`}
  >
    {/* Screen Name */}
    <div className="flex justify-between items-center">
      <span className={`text-gray-600 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
        Pantalla:
      </span>
      <span className={`font-bold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'} max-w-[60%] text-right truncate`}>
        {screenName}
      </span>
    </div>
    
    {/* Booking Type */}
    <div className="flex justify-between items-center">
      <span className={`text-gray-600 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
        Tipo:
      </span>
      <span className={`font-bold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
        {bookingType}
      </span>
    </div>
    
    {/* Total Amount */}
    <div className="flex justify-between items-center">
      <span className={`text-gray-600 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
        Total pagado:
      </span>
      <span className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} text-[#353FEF]`}>
        {formatters.currency.format(totalAmount)}
      </span>
    </div>
    
    {/* New Balance */}
    <div className={`border-t border-blue-200 ${isMobile ? 'pt-3' : 'pt-4'} flex justify-between items-center`}>
      <span className={`text-gray-600 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
        Nuevo saldo:
      </span>
      <span className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} text-green-600`}>
        {formatters.currency.format(newBalance)}
      </span>
    </div>
    
    {/* Transaction ID */}
    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 flex items-center justify-center gap-2 ${isMobile ? 'mt-3' : 'mt-4'}`}>
      <Shield className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
      <span className="truncate">ID: {transactionId}</span>
    </div>
  </motion.div>
));

PurchaseDetails.displayName = 'PurchaseDetails';

// Campaign Review Notice Component
const CampaignReviewNotice = memo<{ isMobile: boolean }>(({ isMobile }) => (
  <motion.div
    initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.4 }}
    className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 ${
      isMobile ? 'rounded-2xl p-4 mb-6' : 'rounded-2xl p-6 mb-8'
    }`}
  >
    <div className={`flex items-start ${isMobile ? 'gap-3' : 'gap-4'}`}>
             <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
        <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-amber-600`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-amber-900 ${isMobile ? 'mb-2 text-sm' : 'mb-2 text-base'}`}>
          🔍 Revisión de Campaña
        </h4>
        <p className={`text-amber-800 ${isMobile ? 'text-xs leading-relaxed mb-3' : 'text-sm leading-relaxed mb-4'}`}>
          Tu campaña será revisada por nuestro equipo para garantizar la mejor calidad. 
          Si no es aprobada, recibirás tus créditos de regreso automáticamente.
        </p>
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} text-amber-700`}>
          <Mail className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
          <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
            Recibirás una notificación por correo
          </span>
        </div>
      </div>
    </div>
  </motion.div>
));

CampaignReviewNotice.displayName = 'CampaignReviewNotice';

// Action Buttons Component
const ActionButtons = memo<{
  onClose: () => void;
  navigate: (path: string) => void;
  isMobile: boolean;
}>(({ onClose, navigate, isMobile }) => (
  <motion.div
    initial={{ y: isMobile ? 10 : 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.4 }}
    className={isMobile ? "space-y-3" : "space-y-4"}
  >
    <button
      onClick={() => {
        onClose();
        setTimeout(() => navigate('/mis-campanas'), 200);
      }}
      className={`w-full ${
        isMobile ? 'px-4 py-3' : 'px-6 py-4'
      } bg-gradient-to-r from-[#353FEF] to-[#4F46E5] text-white ${
        isMobile ? 'rounded-xl' : 'rounded-2xl'
      } hover:from-[#2D37E5] hover:to-[#4338CA] transition-all duration-200 font-bold ${
        isMobile ? 'shadow-md' : 'shadow-lg'
      } flex items-center justify-center gap-3 ${
        isMobile ? 'text-base' : 'text-lg'
      } active:scale-95`}
    >
      <BarChart2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
      Ver Mis Campañas
    </button>
    
    <button
      onClick={() => {
        onClose();
        setTimeout(() => navigate('/marketplace'), 200);
      }}
      className={`w-full ${
        isMobile ? 'px-4 py-3' : 'px-6 py-4'
      } border-2 border-gray-300 text-gray-700 ${
        isMobile ? 'rounded-xl' : 'rounded-2xl'
      } hover:bg-gray-50 transition-colors duration-200 font-semibold flex items-center justify-center gap-3 active:scale-95`}
    >
      <Package2 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
      Explorar Marketplace
    </button>
  </motion.div>
));

ActionButtons.displayName = 'ActionButtons';

const PurchaseCelebrationModalComponent: React.FC<PurchaseCelebrationModalProps> = memo(({ 
  isOpen, 
  onClose, 
  purchaseData 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { transactionId, campaignId, screenName, bookingType, totalAmount, newBalance } = purchaseData;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      {/* Optimized Confetti */}
      <OptimizedConfetti isMobile={isMobile} />

      {/* Mobile-First Celebration Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`relative bg-white ${
          isMobile 
            ? 'rounded-3xl max-w-sm w-full mx-4 max-h-[95vh] overflow-y-auto' 
            : 'rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto'
        } shadow-2xl ${isMobile ? 'p-6' : 'p-8'} text-center border border-gray-200`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute ${
            isMobile ? 'top-4 right-4 p-2' : 'top-6 right-6 p-2'
          } text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10`}
        >
          <X className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
        </button>

        {/* Success Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          className={isMobile ? "mb-6" : "mb-8"}
        >
          <div className={`${
            isMobile ? 'w-20 h-20' : 'w-24 h-24'
          } bg-gradient-to-r from-[#353FEF] to-[#4F46E5] rounded-full flex items-center justify-center mx-auto ${
            isMobile ? 'mb-4' : 'mb-6'
          } shadow-xl`}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Check className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} text-white`} />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={isMobile ? "mb-6" : "mb-8"}
        >
          <h2 className={`${
            isMobile ? 'text-2xl' : 'text-3xl'
          } font-bold text-gray-900 ${isMobile ? 'mb-2' : 'mb-3'}`}>
            ¡Compra Exitosa! 🎉
          </h2>
          <p className={`text-gray-600 ${
            isMobile ? 'text-sm leading-relaxed' : 'text-lg leading-relaxed'
          }`}>
            Tu campaña publicitaria ha sido creada y está lista para brillar en grande
          </p>
        </motion.div>

        {/* Purchase Details */}
        <PurchaseDetails
          screenName={screenName}
          bookingType={bookingType}
          totalAmount={totalAmount}
          newBalance={newBalance}
          transactionId={transactionId}
          isMobile={isMobile}
        />

        {/* Campaign Review Notice */}
        <CampaignReviewNotice isMobile={isMobile} />

        {/* Action Buttons */}
        <ActionButtons onClose={onClose} navigate={navigate} isMobile={isMobile} />

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className={`${isMobile ? 'mt-6 pt-4' : 'mt-8 pt-6'} border-t border-gray-200`}
        >
          <p className={`${
            isMobile ? 'text-xs' : 'text-sm'
          } text-gray-500 flex items-center justify-center gap-2`}>
            <Shield className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            Transacción procesada de forma segura
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
});

PurchaseCelebrationModalComponent.displayName = 'PurchaseCelebrationModal';

// Optimized Loading Component for lazy-loaded modals
const ModalLoadingFallback = memo(() => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-[#353FEF] border-t-transparent rounded-full mx-auto mb-4"
      />
      <p className="text-gray-600 text-sm">Cargando...</p>
    </div>
  </div>
));

ModalLoadingFallback.displayName = 'ModalLoadingFallback';

// Lazy load celebration modal for better performance with optimized chunk splitting
const LazyPurchaseCelebrationModal = lazy(() => 
  Promise.resolve({
    default: PurchaseCelebrationModalComponent
  })
);

export const BookingSummaryModal = memo<BookingSummaryModalProps>(({ 
  isOpen, 
  onClose, 
  bookingData
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { balance, consumeCredits, walletAvailable, isLoading, fetchBalance } = useWalletBalance();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  // Memoized calculations
  const calculations = useMemo(() => {
  if (!bookingData) return null;

  const { screen, type, price } = bookingData;
  const hasEnoughBalance = walletAvailable && balance >= price;
  const newBalance = walletAvailable ? balance - price : 0;
    const typeLabel = TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type;
    
    return {
      screen,
      type,
      price,
      hasEnoughBalance,
      newBalance,
      typeLabel,
      walletAvailable
    };
  }, [bookingData, balance, walletAvailable]);

  // Memoized handlers
  const handleConfirmBooking = useCallback(async () => {
    if (!calculations?.walletAvailable) {
      setError('Wallet no disponible. Por favor recarga la página e intenta nuevamente.');
      return;
    }
    
    if (!calculations?.hasEnoughBalance) {
      setError('Saldo insuficiente. Por favor recarga tu wallet para continuar.');
      return;
    }
    
    setIsProcessing(true);
    setAnimationState('processing');
    setError(null);
    
    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const campaignId = `camp-${Math.random().toString(36).substring(2, 10)}`;
      const description = `Compra: ${calculations.screen.location} (${calculations.typeLabel})`;
      
      const transaction = await consumeCredits(calculations.price, description, bookingData);
      
      setAnimationState('success');
      toast.success('¡Compra realizada con éxito!');
      
      // Prepare celebration data
      const successData = {
        transactionId: transaction.id,
        campaignId,
        screenName: calculations.screen.location,
        bookingType: calculations.typeLabel,
        totalAmount: calculations.price,
        newBalance: balance - calculations.price
      };
      
      // Show celebration modal after success animation
      setTimeout(() => {
        setCelebrationData(successData);
        setShowCelebration(true);
        onClose(); // Close the booking modal
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      setAnimationState('idle');
    } finally {
      setIsProcessing(false);
    }
  }, [calculations, consumeCredits, onClose, balance]);

  const handleGoToWallet = useCallback(() => {
    navigate('/wallet');
    onClose();
  }, [navigate, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleCloseCelebration = useCallback(() => {
    setShowCelebration(false);
    setCelebrationData(null);
  }, []);

  // Memoized content scale animation - must be before early return
  const contentScale = useMemo(() => {
    return animationState === 'processing' ? 1.02 : animationState === 'success' ? 1.05 : 1;
  }, [animationState]);

  // Early return if no data
  if (!bookingData || !calculations) return null;

  const { screen, type, price, hasEnoughBalance, newBalance, typeLabel } = calculations;

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
            {...ANIMATION_VARIANTS.modal}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
          <motion.div
            initial={ANIMATION_VARIANTS.content.initial}
            animate={{ 
              scale: contentScale, 
              opacity: 1, 
              y: 0 
            }}
            exit={ANIMATION_VARIANTS.content.exit}
            transition={{ 
              type: "spring", 
              damping: isMobile ? 30 : 25, 
              stiffness: isMobile ? 400 : 300,
              duration: isMobile ? 0.3 : 0.4
            }}
            className={`w-full ${isMobile ? 'max-w-sm mx-4 max-h-[95vh] overflow-y-auto' : 'max-w-4xl'} bg-white ${isMobile ? 'rounded-2xl' : 'rounded-3xl'} shadow-2xl overflow-hidden`}
            onClick={handleModalClick}
          >
            {/* Mobile-First Header */}
            <motion.div 
              className={`relative bg-gradient-to-r from-[#353FEF] to-[#4F46E5] text-white ${isMobile ? 'p-4' : 'p-6'}`}
              {...ANIMATION_VARIANTS.header}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                  <motion.div 
                    className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} bg-white/20 ${isMobile ? 'rounded-xl' : 'rounded-2xl'} flex items-center justify-center backdrop-blur-sm`}
                    whileHover={{ scale: isMobile ? 1.05 : 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Wallet className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} text-white`} />
                  </motion.div>
                  <div>
                    <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Confirmar Compra</h2>
                    <p className={`text-blue-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>Revisa los detalles antes de proceder</p>
                  </div>
                </div>
                
                {!isProcessing && (
                  <motion.button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                )}
              </div>

              {/* Progress Steps */}
              <motion.div 
                className="flex items-center gap-2 mt-6"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <motion.div 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  />
                  <span className="text-blue-100">Selección</span>
            </div>
                <div className="w-8 h-px bg-blue-300"></div>
                <div className="flex items-center gap-2 text-sm">
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${animationState !== 'idle' ? 'bg-green-400' : 'bg-blue-300'}`}
                    animate={{ 
                      scale: animationState === 'processing' ? [1, 1.2, 1] : 1,
                      backgroundColor: animationState !== 'idle' ? '#34d399' : '#93c5fd'
                    }}
                    transition={{ 
                      scale: { repeat: animationState === 'processing' ? Infinity : 0, duration: 1 },
                      backgroundColor: { duration: 0.3 }
                    }}
                  />
                  <span className={animationState !== 'idle' ? 'text-white' : 'text-blue-200'}>Pago</span>
                    </div>
                <div className="w-8 h-px bg-blue-300"></div>
                <div className="flex items-center gap-2 text-sm">
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${animationState === 'success' ? 'bg-green-400' : 'bg-blue-300'}`}
                    animate={{ 
                      scale: animationState === 'success' ? [1, 1.3, 1] : 1,
                      backgroundColor: animationState === 'success' ? '#34d399' : '#93c5fd'
                    }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className={animationState === 'success' ? 'text-white' : 'text-blue-200'}>Confirmación</span>
                    </div>
              </motion.div>
            </motion.div>

            <div className={`${isMobile ? 'p-4' : 'p-6 lg:p-8'}`}>
              {/* Mobile-First Content Layout */}
              <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
                
                {/* Purchase Details Section */}
                <motion.div 
                  className="space-y-6"
                  {...(isMobile ? ANIMATION_VARIANTS.mobileColumn : ANIMATION_VARIANTS.desktopColumns.left)}
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-[#353FEF]" />
                      Detalles de la Compra
                    </h3>
                    
                    <Card className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 border-0 ${isMobile ? 'shadow-md' : 'shadow-lg'}`}>
                      {/* Screen Info */}
                      <motion.div 
                        className={`flex items-start ${isMobile ? 'gap-3' : 'gap-4'} pb-4 border-b border-gray-100`}
                        whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center`}>
                          <Monitor className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-[#353FEF]`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">{screen.location}</h4>
                          <p className="text-gray-600 text-sm">{screen.category?.name || 'Pantalla Digital'}</p>
                          {screen.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{screen.rating}</span>
                              <span className="text-xs text-gray-500">• Verificada</span>
                      </div>
                    )}
                        </div>
                      </motion.div>

                      {/* Purchase Type */}
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">Tipo de compra</span>
                      </div>
                          <span className="font-semibold text-gray-900">{typeLabel}</span>
                </div>
                
                      {/* Bundle Info */}
                      {bookingData.selectedBundle && (
                          <BundleInfo bundle={bookingData.selectedBundle} />
                      )}

                      {/* Date/Time Info */}
                      {type === 'moment' && bookingData.date && (
                        <>
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-600">Fecha</span>
                      </div>
                              <span className="font-semibold text-gray-900">{formatters.date(bookingData.date)}</span>
                      </div>
                          {bookingData.time !== undefined && bookingData.minute !== undefined && (
                            <div className="flex items-center justify-between py-3">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-600">Hora</span>
                      </div>
                              <span className="font-semibold text-gray-900">
                                {bookingData.time}:{bookingData.minute.toString().padStart(2, '0')}
                              </span>
                      </div>
                          )}
                        </>
                      )}

                      {/* Time Slots for hourly */}
                      {type === 'hourly' && bookingData.timeSlots && (
                          <TimeSlots timeSlots={bookingData.timeSlots} />
                      )}

                      {/* Price */}
                      <motion.div 
                        className="pt-4 border-t border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                  <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-700">Total a pagar</span>
                          <motion.span 
                            className="text-2xl font-bold text-[#353FEF]"
                            animate={{ 
                              scale: animationState === 'processing' ? [1, 1.05, 1] : 1 
                            }}
                            transition={{ 
                              repeat: animationState === 'processing' ? Infinity : 0, 
                              duration: 2 
                            }}
                          >
                              {formatters.currency.format(price)}
                          </motion.span>
                        </div>
                      </motion.div>
                    </Card>
                  </div>
                </motion.div>

                {/* Wallet & Payment Section */}
                <motion.div 
                  className="space-y-6"
                  {...(isMobile ? ANIMATION_VARIANTS.mobileColumn : ANIMATION_VARIANTS.desktopColumns.right)}
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-[#353FEF]" />
                      Estado del Wallet
                    </h3>

                    <Card className={`${isMobile ? 'p-4' : 'p-6'} ${isMobile ? 'space-y-4' : 'space-y-6'} border-0 ${isMobile ? 'shadow-md' : 'shadow-lg'}`}>
                      {/* Current Balance */}
                      <motion.div 
                        className="text-center"
                        whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} ${walletAvailable ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-gray-50 to-gray-100'} rounded-full flex items-center justify-center mx-auto ${isMobile ? 'mb-3' : 'mb-4'}`}
                          whileHover={{ rotate: isMobile ? 180 : 360 }}
                          transition={{ duration: isMobile ? 0.5 : 0.8 }}
                        >
                          <Wallet className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} ${walletAvailable ? 'text-green-600' : 'text-gray-400'}`} />
                        </motion.div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-500 block">
                            {isLoading ? 'Cargando saldo...' : walletAvailable ? 'Saldo actual' : 'Saldo no disponible'}
                          </span>
                          <span className={`text-3xl font-bold ${isLoading ? 'text-gray-400' : walletAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                            {isLoading ? '...' : walletAvailable ? formatters.currency.format(balance) : 'No disponible'}
                          </span>
                        </div>
                      </motion.div>

                      {/* Transaction Preview */}
                      <motion.div 
                        className="bg-gray-50 rounded-xl p-4 space-y-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Costo de compra:</span>
                            <span className="font-semibold text-red-600">-{formatters.currency.format(price)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">Nuevo saldo:</span>
                            <motion.span 
                              className={`text-xl font-bold ${
                                !walletAvailable 
                                  ? 'text-gray-400'
                                  : hasEnoughBalance 
                                    ? newBalance > 100000 
                                      ? 'text-green-600' 
                                      : 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                              animate={{ 
                                scale: animationState === 'processing' ? [1, 1.1, 1] : 1 
                              }}
                              transition={{ 
                                repeat: animationState === 'processing' ? Infinity : 0, 
                                duration: 1.5 
                              }}
                            >
                                {!walletAvailable 
                                  ? 'No disponible' 
                                  : hasEnoughBalance 
                                    ? formatters.currency.format(newBalance) 
                                    : formatters.currency.format(balance)
                                }
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Status Messages */}
                      <AnimatePresence>
                        {isLoading && (
                          <StatusBadge status="info">
                            <div>
                              <div className="font-semibold mb-1">Verificando saldo...</div>
                              <div className="text-sm">Consultando saldo disponible en el servidor</div>
                            </div>
                          </StatusBadge>
                        )}

                        {!isLoading && !walletAvailable && (
                          <StatusBadge status="danger">
                            <div>
                              <div className="font-semibold mb-1">Wallet no disponible</div>
                              <div className="text-sm">No se puede verificar el saldo. Intenta recargar la página.</div>
                            </div>
                          </StatusBadge>
                        )}

                        {!isLoading && walletAvailable && !hasEnoughBalance && (
                          <StatusBadge status="danger">
                            <div>
                              <div className="font-semibold mb-1">Saldo insuficiente</div>
                                <div className="text-sm">Necesitas {formatters.currency.format(price - balance)} adicionales</div>
                            </div>
                          </StatusBadge>
                        )}

                        {!isLoading && walletAvailable && hasEnoughBalance && newBalance <= 100000 && (
                          <StatusBadge status="warning">
                            <div>
                              <div className="font-semibold mb-1">Saldo bajo después de compra</div>
                              <div className="text-sm">Considera recargar para futuras compras</div>
                            </div>
                          </StatusBadge>
                        )}

                        {!isLoading && walletAvailable && hasEnoughBalance && newBalance > 100000 && (
                          <StatusBadge status="success">
                            <div>
                              <div className="font-semibold mb-1">¡Perfecto!</div>
                              <div className="text-sm">Tienes saldo suficiente para esta compra</div>
                    </div>
                          </StatusBadge>
                        )}
                      </AnimatePresence>
                    </Card>

                    {/* Security Notice */}
                    <motion.div 
                      className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Transacción 100% segura y encriptada</span>
                    </motion.div>
                  </div>
                </motion.div>
                </div>
                
              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <StatusBadge status="danger">
                      <div className="font-semibold">{error}</div>
                    </StatusBadge>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile-First Action Buttons */}
              <motion.div 
                className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-3 ${isMobile ? 'mt-6 pt-4' : 'mt-8 pt-6'} border-t border-gray-100`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isMobile ? 0.4 : 0.7, duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: isProcessing ? 1 : (isMobile ? 1.01 : 1.02) }}
                  whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                >
                <Button
                  variant="outline"
                  size={isMobile ? "md" : "lg"}
                  className={isMobile ? "w-full" : "sm:w-40"}
                  disabled={isProcessing}
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                </motion.div>
                
                {isLoading ? (
                  <motion.div
                    whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                  <Button
                    variant="primary"
                    size={isMobile ? "md" : "lg"}
                    className={`w-full bg-gradient-to-r from-gray-400 to-gray-500 ${isMobile ? 'shadow-md py-3' : 'shadow-lg'}`}
                    disabled
                  >
                      <div className="flex items-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Verificando saldo...
                      </div>
                  </Button>
                  </motion.div>
                ) : !walletAvailable ? (
                  <motion.div
                    whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                  <Button
                    variant="primary"
                    size={isMobile ? "md" : "lg"}
                    className={`w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 ${isMobile ? 'shadow-md hover:shadow-lg py-3' : 'shadow-lg hover:shadow-xl'}`}
                    onClick={() => fetchBalance()}
                  >
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Reintentar
                        <ArrowRight className="w-4 h-4" />
                      </div>
                  </Button>
                  </motion.div>
                ) : hasEnoughBalance ? (
                  <motion.div
                    whileHover={{ scale: isProcessing ? 1 : (isMobile ? 1.01 : 1.02) }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                    className="flex-1"
                  >
                  <Button
                    variant="primary"
                    size={isMobile ? "md" : "lg"}
                    className={`w-full text-white ${
                      animationState === 'success' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                        : 'bg-gradient-to-r from-[#353FEF] to-[#4F46E5] hover:from-[#2D37E5] hover:to-[#4338CA]'
                    } ${isMobile ? 'shadow-md hover:shadow-lg' : 'shadow-lg hover:shadow-xl'} ${isProcessing ? "animate-pulse" : ""} ${isMobile ? 'py-3' : ''}`}
                    onClick={handleConfirmBooking}
                    disabled={isProcessing}
                  >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Procesando compra...
                        </div>
                      ) : animationState === 'success' ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          ¡Compra Exitosa!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          Confirmar Compra
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                  </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                  <Button
                    variant="primary"
                    size={isMobile ? "md" : "lg"}
                    className={`w-full bg-gradient-to-r from-[#353FEF] to-[#4F46E5] hover:from-[#2D37E5] hover:to-[#4338CA] text-white ${isMobile ? 'shadow-md hover:shadow-lg py-3' : 'shadow-lg hover:shadow-xl'}`}
                    onClick={handleGoToWallet}
                  >
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Recargar Saldo
                        <ArrowRight className="w-4 h-4" />
                      </div>
                  </Button>
                  </motion.div>
                )}

              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Purchase Celebration Modal with Lazy Loading */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <Suspense fallback={<ModalLoadingFallback />}>
            <LazyPurchaseCelebrationModal
              isOpen={showCelebration}
              onClose={handleCloseCelebration}
              purchaseData={celebrationData}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
});

BookingSummaryModal.displayName = 'BookingSummaryModal';