import React, { useState, useEffect, createContext, useContext, memo, useMemo, useCallback } from 'react';
import { 
  Wallet, BarChart2, ArrowUpRight, DollarSign, Package2, 
  Zap, TrendingUp, Gift, Bell, Crown, 
  Target, AlertTriangle, Sparkles,
  Timer, Percent, Trophy, Activity, 
  ChevronRight, Info,
  CreditCard, Check, X, 
  Shield, 
  RefreshCw, HelpCircle, Key,
  Loader2,
  ArrowRight, Search, Filter,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '../api/payment';
import { Button } from '../components/Button';
import { useWallet } from '../hooks/useWallet/index';
import { Transaction } from '../hooks/useWallet/types';
import { Bonus, useBonus } from '../hooks/useBonus';
import RechargeModal from '../components/wallet/RechargeModal';

const stripePromise = loadStripe('pk_test_51OHbGYHQkntOzh4KeXpPzlQ96Qj9vofFxGAvTfBVR8yKOBsupmAmQisj1wizDfkF543hpjoIOn7UuCPVcndFw4db00BcWQwc7h');

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
      <div className="p-3 bg-white border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '13px',
                color: '#374151',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '400',
                lineHeight: '1.5',
                '::placeholder': {
                  color: '#9CA3AF',
                  fontSize: '13px'
                },
              },
              invalid: {
                color: '#DC2626',
              },
              complete: {
                color: '#059669',
              }
            },
            hidePostalCode: true
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            Pagar {amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

// Mobile-optimized Tooltip Component (simplified, no hover on mobile)
interface CreditTooltipProps {
  children: React.ReactNode;
  content: string;
  subContent?: string;
}

const CreditTooltip: React.FC<CreditTooltipProps> = memo(({ children, content, subContent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // On mobile, use tap instead of hover
  const handleInteraction = () => {
    if (isMobile) {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => !isMobile && setIsVisible(true)}
        onMouseLeave={() => !isMobile && setIsVisible(false)}
        onClick={handleInteraction}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${
          isMobile 
            ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-3' 
            : 'bottom-full left-1/2 transform -translate-x-1/2 mb-3'
        }`}>
          <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm rounded-2xl px-5 py-4 shadow-2xl border border-neutral-700 dark:border-neutral-300 max-w-xs backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold">💰</span>
              </div>
              <span className="font-semibold text-base">{content}</span>
            </div>
            {subContent && (
              <p className="text-neutral-300 dark:text-neutral-600 text-xs leading-relaxed pl-10">{subContent}</p>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Mobile-optimized Credit Display Component
interface CreditDisplayProps {
  amount: number;
  showConversion?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const CreditDisplay: React.FC<CreditDisplayProps> = memo(({ 
  amount, 
  showConversion = true, 
  size = 'md',
  animated = false 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base md:text-lg', // Mobile-first responsive
    lg: 'text-lg md:text-2xl',
    xl: 'text-2xl md:text-4xl'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5 md:w-6 md:h-6',
    xl: 'w-6 h-6 md:w-8 md:h-8'
  };

  return (
    <div className="flex items-center gap-2">
      <CreditTooltip 
        content="Conversión directa 1:1"
        subContent="$1 peso = 1 Shareflow Credit. No hay comisiones ocultas ni conversiones complicadas."
      >
        <div className="flex items-center gap-1">
          <div className="text-yellow-500">
            <span className={`${iconSizes[size]}`}>💰</span>
          </div>
          <span className={`font-bold text-blue-600 ${sizeClasses[size]}`}>
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(amount)}
          </span>
        </div>
      </CreditTooltip>
      
      {showConversion && (
        <CreditTooltip 
          content="Equivalencia en dólares"
          subContent="Cada peso colombiano equivale a 1 Shareflow Credit. Es así de simple y transparente."
        >
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-xs">≈</span>
            <span className="text-xs">💰</span>
            <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              ${new Intl.NumberFormat('es-CO').format(amount)}
            </span>
          </div>
        </CreditTooltip>
      )}
    </div>
  );
});

// Simplified Motivational Banner (no complex animations)
const MotivationalBanner: React.FC<{ userType: string; bonusPercentage: number }> = memo(({ 
  userType, 
  bonusPercentage 
}) => {
  const messages = [
    "🚀 ¡Tu momento de brillar ha llegado!",
    "✨ Convierte tus ideas en realidad urbana",
    "🎯 Cada crédito es una oportunidad de impacto",
    "💡 Tu creatividad merece las mejores ubicaciones"
  ];
  
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 4000); // Slower rotation for better mobile UX
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎉</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm md:text-base">
              {messages[currentMessage]}
            </h4>
            <p className="text-gray-600 text-xs md:text-sm">
              Usuario {userType} • +{bonusPercentage}% bonus especial
            </p>
          </div>
        </div>
        
        <CreditTooltip 
          content="Bonus exclusivo"
          subContent={`Como usuario ${userType.toLowerCase()}, obtienes ${bonusPercentage}% adicional en tu primera recarga durante esta campaña especial.`}
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-2 rounded-lg font-bold text-sm text-center sm:text-left">
            +{bonusPercentage}%
          </div>
        </CreditTooltip>
      </div>
    </div>
  );
});

// Enhanced User Level Interface with blue tones only
interface UserLevel {
  id: number;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  minSpent: number;
  maxSpent?: number;
  benefits: string[];
  requirements: string[];
  description: string;
  howToMaintain: string[];
  exclusiveFeatures: string[];
  bonusPercentage: number;
  supportLevel: string;
  reportsAccess: string[];
  // Nuevos campos para beneficios de status y financieros avanzados
  statusBenefits: string[];
  advancedFinancialBenefits: string[];
  merchandising: string[];
  exclusiveAccess: string[];
}

// User levels data with aspirational color progression
const userLevels: UserLevel[] = [
  {
    id: 1,
    name: 'Creador',
    icon: '✨',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    minSpent: 0,
    maxSpent: 2000000,
    description: 'Tu chispa creativa comienza a brillar en la ciudad',
    bonusPercentage: 2,
    supportLevel: 'Chat básico',
    benefits: [
      'Acceso a todas las pantallas básicas',
      'Soporte vía chat estándar',
      'Guías creativas incluidas',
      '2% bonus en recargas',
      'Plantillas de diseño gratuitas'
    ],
    requirements: [
      'Registrarse en la plataforma',
      'Realizar primera campaña',
      'Completar perfil creativo'
    ],
    howToMaintain: [
      'Mantén actividad mensual',
      'Realiza al menos 1 campaña cada 2 meses',
      'Explora diferentes formatos creativos'
    ],
    exclusiveFeatures: [
      'Biblioteca de recursos creativos',
      'Plantillas prediseñadas',
      'Asistente de primera campaña',
      'Workshop creativo mensual'
    ],
    reportsAccess: [],
    statusBenefits: [
      'Badge "Creador Shareflow" en el perfil',
      'Bienvenida personalizada del equipo'
    ],
    advancedFinancialBenefits: [
      'Acceso a promociones de bienvenida especiales',
      'Descuentos del 2% en la primera recarga grande'
    ],
    merchandising: [
      'Stickers de bienvenida Shareflow'
    ],
    exclusiveAccess: [
      'Acceso a la comunidad general de creadores'
    ]
  },
  {
    id: 2,
    name: 'Visionario',
    icon: '🚀',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    minSpent: 2000000,
    maxSpent: 8000000,
    description: 'Tu visión creativa trasciende lo ordinario y conecta con las masas',
    bonusPercentage: 5,
    supportLevel: 'Soporte prioritario',
    benefits: [
      'Acceso a pantallas premium',
      'Soporte prioritario multicanal',
      'Descuentos en ubicaciones estratégicas',
      '5% bonus en recargas',
      'Herramientas de segmentación avanzada',
      'Consulta creativa trimestral'
    ],
    requirements: [
      'Invertir mínimo $2M en campañas',
      'Mantener campañas activas 3+ meses',
      'Completar certificación creativa'
    ],
    howToMaintain: [
      'Gasto trimestral mínimo de $500K',
      'Utilizar mínimo 3 pantallas diferentes',
      'Participar en feedback de campañas',
      'Mantener ROI positivo'
    ],
    exclusiveFeatures: [
      'A/B testing avanzado',
      'Programador de campañas inteligente',
      'Insights de tendencias urbanas',
      'Acceso a ubicaciones VIP',
      'Design thinking workshops'
    ],
    reportsAccess: [],
    statusBenefits: [
      'Badge "Visionario" en el perfil público',
      'Acceso a webinars exclusivos de la industria'
    ],
    advancedFinancialBenefits: [
      'Descuentos preferenciales del 5% en promociones especiales',
      'Acceso temprano a nuevas ubicaciones premium'
    ],
    merchandising: [
      'Kit de bienvenida Shareflow con stickers y guía creativa'
    ],
    exclusiveAccess: [
      'Grupo privado de Telegram para Visionarios y niveles superiores'
    ]
  },
  {
    id: 3,
    name: 'Maestro Creativo',
    icon: '👑',
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
    borderColor: 'border-purple-300',
    minSpent: 8000000,
    maxSpent: 25000000,
    description: 'Dominas el arte de hacer brillar marcas en el ecosistema urbano',
    bonusPercentage: 8,
    supportLevel: 'Account Manager dedicado',
    benefits: [
      'Acceso completo al inventario premium',
      'Account Manager dedicado',
      'Estrategias personalizadas mensuales',
      '8% bonus en recargas',
      'Acceso beta a nuevas tecnologías',
      'Networking exclusivo con otros Maestros',
      'Co-creación de campañas innovadoras'
    ],
    requirements: [
      'Invertir mínimo $8M en campañas',
      'Liderar campañas multi-ubicación',
      'Certificación en estrategia digital urbana'
    ],
    howToMaintain: [
      'Inversión semestral mínima de $2M',
      'Utilizar mínimo 8 pantallas premium',
      'Mentorear a usuarios Visionarios',
      'Mantener score de innovación >4.5',
      'Participar en comité creativo'
    ],
    exclusiveFeatures: [
      'AI-powered audience targeting',
      'Gestión multi-campaña avanzada',
      'Acceso prioritario a nuevas ubicaciones',
      'Custom creative development',
      'Dashboards personalizados',
      'Eventos exclusivos de networking'
    ],
    reportsAccess: [],
    statusBenefits: [
      'Certificado de "Maestro Creativo Shareflow" (PDF descargable + badge premium)',
      'Invitación a cocktails trimestrales de networking exclusivo',
      'Destacar sus mejores campañas en el blog y redes sociales de Shareflow',
      'Mention especial en newsletter mensual de la plataforma'
    ],
    advancedFinancialBenefits: [
      'Descuentos preferenciales del 10% en Black Friday y promociones grandes',
      'Prioridad de ocupación en fechas premium (Navidad, eventos deportivos top)',
      'Acceso a promociones flash exclusivas antes que otros niveles',
      'Tarifas preferenciales en ubicaciones de alta demanda'
    ],
    merchandising: [
      'Gorra premium Shareflow Maestro Creativo',
      'Kit de merchandising con camiseta, botella térmica y cuaderno de estrategia',
      'Placa conmemorativa personalizada con su nombre'
    ],
    exclusiveAccess: [
      'Acceso al Club Creativo: eventos presenciales exclusivos',
      'Invitación a Beta testing de nuevas funcionalidades',
      'Comunidad privada con otros Maestros para intercambio de insights'
    ]
  },
  {
    id: 4,
    name: 'Gran Estratega',
    icon: '💎',
    color: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
    borderColor: 'border-yellow-400',
    minSpent: 25000000,
    description: 'Eres el arquitecto de brillantez que transforma ciudades y culturas',
    bonusPercentage: 10,
    supportLevel: 'Equipo estratégico 24/7',
    benefits: [
      'Acceso ilimitado a todo el ecosistema Shareflow',
      'Equipo estratégico dedicado 24/7',
      'Co-creación de productos y servicios',
      '10% bonus en recargas',
      'Partnership estratégico con Shareflow',
      'Influencia en roadmap de producto',
      'Laboratorio de innovación exclusivo'
    ],
    requirements: [
      'Invertir mínimo $25M en el ecosistema',
      'Liderar transformación urbana digital',
      'Ser embajador de la cultura Shareflow'
    ],
    howToMaintain: [
      'Inversión anual mínima de $15M',
      'Participar en consejo estratégico',
      'Mantener NPS score >9',
      'Liderar iniciativas de innovación',
      'Colaborar en case studies globales'
    ],
    exclusiveFeatures: [
      'Soluciones white-label personalizadas',
      'API access completo y prioritario',
      'Desarrollo de campañas experimentales',
      'Integraciones enterprise exclusivas',
      'Infraestructura dedicada',
      'Beta testing de tecnologías emergentes',
      'Consultoría estratégica ilimitada'
    ],
    reportsAccess: [],
    statusBenefits: [
      'Certificado de "Gran Estratega" (PDF descargable + badge premium)',
      'Invitación a eventos VIP y cocktails de networking exclusivo',
      'Showcasing de sus campañas como case studies en conferencias internacionales',
      'Entrevista exclusiva en el podcast oficial de Shareflow',
      'Reconocimiento anual como "Gran Estratega del Año" en evento presencial',
      'Invitación al "Club Legendario" - membresía solo por invitación especial'
    ],
    advancedFinancialBenefits: [
      'Descuentos preferenciales del 15% en todas las promociones grandes',
      'Máxima prioridad de ocupación en fechas premium y eventos exclusivos',
      'Acceso a ubicaciones ultra-premium antes de su lanzamiento público',
      'Tarifas especiales negociadas individualmente',
      'Bonos anuales por lealtad',
      'Acceso al "Nivel Secreto Legendario" - beneficios ocultos desbloqueables'
    ],
    merchandising: [
      'Chaqueta premium exclusiva Gran Estratega (edición limitada)',
      'Kit VIP completo: merchandising dorado, tech accessories y libro de estrategia firmado',
      'Trofeo personalizado de cristal con grabado de sus logros',
      'Acceso a colección exclusiva de artículos de Gran Estratega'
    ],
    exclusiveAccess: [
      'Membresía al "Club Legendario" - eventos ultra-exclusivos con otros Gran Estratega',
      'Acceso directo a CEO y equipo ejecutivo',
      'Participación en consejo asesor de producto',
      'Acceso a experiencias VIP (viajes, eventos internacionales)',
      'Red privada de contactos de alto nivel en la industria'
    ]
  }
];

// Interfaces simplificadas
interface WalletState {
  balance: number;
  monthlySpent: number;
  totalLifetimeSpent: number; // Added for level calculation
  lastTransaction: {
    amount: number;
    type: 'recharge' | 'spend';
    date: Date;
    description: string;
  };
}



interface Campaign {
  id: string;
  title: string;
  description: string;
  bonusPercentage: number;
  minAmount: number;
  endDate: Date;
  icon: string;
  isActive: boolean;
}

// Context simplificado
interface WalletContextType {
  wallet: WalletState;
  transactions: Transaction[];
  currentCampaign: Campaign | null;
  loading: boolean;
  recharge: (amount: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const useWallets = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

// Tipo específico para el estado de datos
interface WalletData {
  wallet: WalletState;
  transactions: Transaction[];
  currentCampaign: Campaign | null;
}

// Mock data simplificado
const generateMockData = (): WalletData => ({
  wallet: {
    balance: 2450000,
    monthlySpent: 1200000,
    totalLifetimeSpent: 6500000, // User is now in level 2 (Visionario) - between 2M and 8M
    lastTransaction: {
      amount: 500000,
      type: 'recharge' as const,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: 'Recarga manual - Paquete Creciendo 500K'
    }
  },
  transactions: [],
  currentCampaign: {
    id: 'relaunch-2024',
    title: 'RE LANZAMIENTO',
    description: '¡Volvimos y queremos hacerte brillar más que nunca!',
    bonusPercentage: 8, // Para usuarios anteriores
    minAmount: 100000,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    icon: '🚀',
    isActive: true
  }
});

// Helper functions for level system
const getCurrentLevel = (totalSpent: number): UserLevel => {
  return userLevels.find(level => 
    totalSpent >= level.minSpent && (!level.maxSpent || totalSpent < level.maxSpent)
  ) || userLevels[0];
};

const getNextLevel = (currentLevel: UserLevel): UserLevel | null => {
  const currentIndex = userLevels.findIndex(level => level.id === currentLevel.id);
  return currentIndex < userLevels.length - 1 ? userLevels[currentIndex + 1] : null;
};

const getLevelProgress = (totalSpent: number, currentLevel: UserLevel, nextLevel: UserLevel | null): number => {
  if (!nextLevel) return 100;
  const progress = ((totalSpent - currentLevel.minSpent) / (nextLevel.minSpent - currentLevel.minSpent)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

// Helper function to format credits with TikTok-inspired display (instead of currency)
const formatCredits = (amount: number, options?: { showConversion?: boolean; size?: 'sm' | 'md' | 'lg' | 'xl'; animated?: boolean }) => {
  return (
    <CreditDisplay 
      amount={amount} 
      showConversion={options?.showConversion ?? false}
      size={options?.size ?? 'md'}
      animated={options?.animated ?? false}
    />
  );
};

// Helper function to format currency for recharge amounts (when showing real money)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

// TikTok-inspired simple credits text for when we need just text
const formatCreditsText = (amount: number) => {
  return '$' + new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0
  }).format(amount);
};

// Simple balance display function for main balance
const formatBalance = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

// New elegant recharge modal component is imported from components/wallet/RechargeModal

// Helper functions for the new RechargeModal component
const calculateBonus = (amount: number, currentCampaign: any, currentLevel: any, userBonusPercentage: number) => {
  // Only calculate campaign bonus, level bonus is disabled for now
  if (!currentCampaign || amount < (currentCampaign.minRecharge || 100000)) return 0;
  const campaignBonus = Math.floor((amount * currentCampaign.value) / 100);
  return campaignBonus;
  };

const calculateLevelBonus = (amount: number, currentLevel: any) => {
  // Level bonus is disabled for now
  return 0;
  };

const calculateCampaignBonus = (amount: number, currentCampaign: any) => {
  if (!currentCampaign || amount < (currentCampaign.minRecharge || 100000)) return 0;
    return Math.floor((amount * currentCampaign.value) / 100);
  };

const calculateFinancialCommission = (amount: number, paymentMethod: string) => {
  const rate = paymentMethod === 'pse' ? 0.02 : 0.05; // 2% PSE, 5% card
  return Math.floor(amount * rate);
  };

// TODO: Old modal code completely removed - using new RechargeModal component

// Provider simplificado
const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WalletData>(() => generateMockData());
  const [loading, setLoading] = useState(false);

  const recharge = async (amount: number) => {
    // NO activar loading - la actualización debe ser silenciosa en background
    // setLoading(true); // REMOVED
    
    // Simular API call sin bloquear UI
    await new Promise(resolve => setTimeout(resolve, 100)); // Reducido para ser más rápido
    
    // Calcular el nivel actual basado en el gasto total
    const currentUserLevel = getCurrentLevel(data.wallet.totalLifetimeSpent);
    
    // Calcular bonus del nivel del usuario
    const levelBonus = Math.floor((amount * currentUserLevel.bonusPercentage) / 100);
    
    // Calcular bonus de la campaña
    const campaignBonus = data.currentCampaign && amount >= data.currentCampaign.minAmount
      ? Math.floor((amount * data.currentCampaign.bonusPercentage) / 100)
      : 0;
    
    const totalBonus = levelBonus + campaignBonus;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: amount + totalBonus,
      type: 'Deposit',
      createdAt: new Date(),
      description: `Recarga de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)}${totalBonus > 0 ? ` + ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalBonus)} bonus` : ''}`,
      status: 'Completed',
      paymentReference: ''
    };

    setData(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        balance: prev.wallet.balance + amount + totalBonus,
        totalLifetimeSpent: prev.wallet.totalLifetimeSpent + amount, // Update for level calculation
        lastTransaction: {
          amount: amount + totalBonus,
          type: 'recharge' as const,
          date: new Date(),
          description: newTransaction.description
        }
      },
      transactions: [newTransaction, ...prev.transactions]
    }));
    
    // setLoading(false); // REMOVED - no loading state
  };

  const refreshData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(generateMockData());
    setLoading(false);
  };

  const value: WalletContextType = {
    wallet: data.wallet,
    transactions: data.transactions,
    currentCampaign: data.currentCampaign,
    loading,
    recharge,
    refreshData
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Mobile-optimized Levels Modal Component
interface LevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: UserLevel;
  totalSpent: number;
}

const LevelsModalComponent: React.FC<LevelsModalProps> = memo(({ isOpen, onClose, currentLevel, totalSpent }) => {
  const nextLevel = getNextLevel(currentLevel);
  const progress = getLevelProgress(totalSpent, currentLevel, nextLevel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:w-auto sm:max-w-2xl max-h-screen sm:max-h-[85vh] sm:rounded-xl shadow-2xl border-0 sm:border border-gray-200 overflow-hidden flex flex-col">
        {/* Header - Compact */}
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Niveles de usuario</h2>
                <p className="text-xs text-gray-600">Beneficios por fidelidad</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Coming Soon Block */}
          <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 mb-6 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
            
            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-purple-900 mb-2">Próximamente disponible</h3>
              <p className="text-purple-700 text-sm leading-relaxed mb-4">
                Estamos preparando un sistema de niveles revolucionario basado en tu fidelidad y actividad.
              </p>
              
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Tu fidelidad será recompensada
              </div>
            </div>
          </div>

          {/* Current Level Preview - Disabled */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-lg opacity-50">{currentLevel.icon}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Nivel actual: {currentLevel.name}</h4>
                <p className="text-xs text-gray-500">Sistema en desarrollo</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Bonus potencial</span>
                <span className="text-sm text-gray-400">{currentLevel.bonusPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-300 h-2 rounded-full w-0"></div>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Funcionalidad próximamente
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm mb-3">Características que incluirá:</h4>
            
            {[
              { icon: "🎯", title: "Bonus escalonados", desc: "Recompensas por fidelidad" },
              { icon: "👑", title: "Beneficios exclusivos", desc: "Acceso a funciones premium" },
              { icon: "🚀", title: "Soporte prioritario", desc: "Atención personalizada" },
              { icon: "💎", title: "Descuentos especiales", desc: "Precios preferenciales" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg opacity-60">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm opacity-50">{feature.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-700 text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-500">{feature.desc}</div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Te notificaremos cuando esté disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Mobile-optimized Activity Detail Modal
interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = memo(({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  // Parse detailed transaction info for spending transactions
  const parseTransactionDetails = (description: string, type: string) => {
    if (type !== 'spend') return { description };
    
    // Try to parse the structured description
    const parts = description.split(' | ');
    if (parts.length >= 2) {
      const locationPart = parts[0];
      const eventOrDurationPart = parts[1];
      const durationOrPackagePart = parts[2] || '';
      
      // Check if it's a sports event (contains "Partido" or "Estadio")
      const isSportsEvent = locationPart.includes('Estadio') || eventOrDurationPart.includes('Partido');
      
      if (isSportsEvent) {
        // Sports event parsing
        let location = locationPart;
        
        // Remove screen type prefix if present
        if (locationPart.includes('Pantalla Gigante')) {
          location = locationPart.replace('Pantalla Gigante ', '');
        } else if (locationPart.includes('Pantalla LED')) {
          location = locationPart.replace('Pantalla LED ', '');
        } else if (locationPart.includes('Pantalla Digital')) {
          location = locationPart.replace('Pantalla Digital ', '');
        } else if (locationPart.includes('Pantalla Premium')) {
          location = locationPart.replace('Pantalla Premium ', '');
        }
        
        return {
          screenType: 'Evento Deportivo',
          location: location,
          eventName: eventOrDurationPart, // This should be the event name
          duration: durationOrPackagePart, // This should be the duration
          isSportsEvent: true,
          isStructured: true
        };
      } else {
        // Regular campaign parsing
        let screenType = '';
        let location = locationPart;
        
        if (locationPart.includes('Pantalla LED')) {
          screenType = 'LED';
          location = locationPart.replace('Pantalla LED ', '');
        } else if (locationPart.includes('Pantalla Digital')) {
          screenType = 'Digital';
          location = locationPart.replace('Pantalla Digital ', '');
        } else if (locationPart.includes('Pantalla Gigante')) {
          screenType = 'Gigante';
          location = locationPart.replace('Pantalla Gigante ', '');
        } else if (locationPart.includes('Pantalla Premium')) {
          screenType = 'Premium';
          location = locationPart.replace('Pantalla Premium ', '');
        }
        
        return {
          screenType,
          location,
          duration: eventOrDurationPart,
          package: durationOrPackagePart,
          isSportsEvent: false,
          isStructured: true
        };
      }
    }
    
    return { description, isStructured: false };
  };

  const details = parseTransactionDetails(transaction.description, transaction.type);

  // Determine transaction type for display (TikTok style)
  const getTransactionType = () => {
    if (transaction.type === 'Deposit') return { 
      label: 'Add Credits', 
      color: 'emerald', 
      icon: ArrowUpRight,
      subtext: 'Cash'
    };
    if (transaction.type === 'bonus') return { 
      label: 'Bonus', 
      color: 'blue', 
      icon: Gift,
      subtext: 'Bonus'
    };
    return { 
      label: 'Ad Spend', 
      color: 'red', 
      icon: Package2,
      subtext: 'Campaign'
    };
  };

  const transactionType = getTransactionType();
  const IconComponent = transactionType.icon;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Clean Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Transaction Details</h3>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Amount Display - TikTok Style */}
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-3 ${
              transaction.amount > 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {transaction.amount > 0 ? '+' : '-'}{formatCreditsText(Math.abs(transaction.amount))}
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              transactionType.color === 'emerald' 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' :
              transactionType.color === 'blue' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              <IconComponent className="w-4 h-4" />
              {transactionType.label}
            </div>
          </div>

          {/* Clean Details */}
          <div className="space-y-4">
          <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">Description:</span>
                <span className="text-neutral-900 dark:text-neutral-100 text-sm text-right max-w-56 font-medium">
                  {transaction.description}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">Date:</span>
                <span className="text-neutral-900 dark:text-neutral-100 text-sm font-medium">
                  {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                  day: 'numeric',
                    year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  transaction.status === 'Completed' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    transaction.status === 'Completed' ? 'bg-emerald-500' : 'bg-yellow-500'
                  }`} />
                  {transaction.status === 'Completed' ? 'Success' : 'Pending'}
              </span>
            </div>

              <div className="flex justify-between items-start">
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">ID:</span>
                <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 text-right max-w-48 break-all">
                  {transaction.id}
                </span>
            </div>
          </div>

            {/* Transaction Breakdown - TikTok Style (only for purchases) */}
            {transaction.type === 'Deposit' && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Transaction breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Purchase amount</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">{formatCreditsText(Math.abs(transaction.amount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Processing fee</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">$0.00</span>
                  </div>
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-neutral-900 dark:text-neutral-100">Total amount</span>
                      <span className="text-neutral-900 dark:text-neutral-100">{formatCreditsText(Math.abs(transaction.amount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Close Button */}
          <button
            onClick={onClose}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors"
          >
              Close
          </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Mobile-optimized Main Dashboard Component
const WalletDashboard: React.FC = memo(() => {
  console.log('🔄 WalletDashboard: Component rendering');
  const { wallet, currentCampaign, loading, recharge, refreshData } = useWallets();
    const { getActiveBonus } = useBonus();
  const walletHook = useWallet();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [activeBonus, setActiveBonus] = useState<Bonus | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  
  // Filter states for transactions
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Credits banner state
  const [showCreditsBanner, setShowCreditsBanner] = useState(true);
  

  // NUEVO: Estado para la página de celebración independiente
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState({
    amount: 0,
    totalCredits: 0,
    transactionId: '',
    bonus: 0,
    levelBonus: 0,
    campaignBonus: 0,
    levelName: '',
    campaignName: ''
  });

  useEffect(() => {
    getActiveBonus().then((response) => {
      setActiveBonus(response);
    })
  }, []);
  useEffect(() => {
    console.log('🔄 WalletDashboard: Loading wallet data (should only run once)');
    const loadWalletData = async () => {
      try {
        const [transactionsData, balanceData] = await Promise.all([
          walletHook.transactions(),
          walletHook.getBalance()
        ]);
        setTransactions(transactionsData.transactions);
        setBalance(balanceData.balance);
        console.log('✅ WalletDashboard: Wallet data loaded successfully');
      } catch (error) {
        console.error('❌ WalletDashboard: Error loading wallet data:', error);
      }
    };
    
    loadWalletData();
  }, []); // Empty dependencies array to prevent infinite loop


  

  // Calcular el total recargado este mes
  const monthlyRecharged = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => 
        t.type === 'Deposit' && 
        t.status === 'Completed' &&
        new Date(t.createdAt) >= startOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Calculate user level and next level based on total lifetime spent
  const currentLevel = getCurrentLevel(wallet.totalLifetimeSpent);
  const nextLevel = getNextLevel(currentLevel);
  const levelProgress = getLevelProgress(wallet.totalLifetimeSpent, currentLevel, nextLevel);

  // Determine user type for campaign bonus
  const isReturningUser = wallet.totalLifetimeSpent > 0;
  const userType = isReturningUser ? 'Anterior' : 'Nuevo';
  const userBonusPercentage = isReturningUser ? 8 : 5;

  // Campaign countdown
const timeLeft = activeBonus ? Math.ceil((new Date(activeBonus.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  
  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType) {
      if (selectedType === 'Add Credits') {
        filtered = filtered.filter(t => t.type === 'Deposit');
      } else if (selectedType === 'Bonus') {
        filtered = filtered.filter(t => t.type === 'bonus');
      } else if (selectedType === 'Ad Spend') {
        filtered = filtered.filter(t => t.type !== 'Deposit' && t.type !== 'bonus');
      }
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(t => new Date(t.createdAt) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter(t => new Date(t.createdAt) <= endDate);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, searchTerm, selectedType, selectedStatus, dateRange]);
  
  // Calculate totals for compact view
  const totalCredits = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebits = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Quick date filter functions
  const setQuickDateFilter = useCallback((days: number | 'month' | 'quarter') => {
    const end = new Date();
    let start = new Date();
    
    if (days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (days === 'quarter') {
      const quarter = Math.floor(end.getMonth() / 3);
      start = new Date(end.getFullYear(), quarter * 3, 1);
    } else {
      start.setDate(end.getDate() - days);
    }
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setDateRange({ start: '', end: '' });
  }, []);

  // Función deposit para el nuevo modal
  const deposit = async (depositData: { amount: number; paymentReference: string; description: string }) => {
    console.log('💳 Deposit function called:', depositData);
    // Simula el procesamiento del pago
    return { success: true, transactionId: depositData.paymentReference };
  };

  const handleRecharge = useCallback(async (amount: number) => {
    console.log('🎯 handleRecharge called with amount:', amount);
    
    // Calcular datos para la celebración ANTES de procesar usando los nuevos cálculos
    const levelBonus = Math.floor((amount * currentLevel.bonusPercentage) / 100);
    const campaignBonus = currentCampaign && amount >= currentCampaign.minAmount
      ? Math.floor((amount * userBonusPercentage) / 100)
      : 0;
    const totalBonus = levelBonus + campaignBonus;
    const totalCredits = amount + totalBonus;
    const txId = `TX${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    console.log('🎉 Preparando celebración:', { amount, levelBonus, campaignBonus, totalBonus, totalCredits, txId });
    
    // Configurar datos de celebración
    setCelebrationData({
      amount,
      totalCredits,
      transactionId: txId,
      bonus: totalBonus,
      levelBonus,
      campaignBonus,
      levelName: currentLevel.name,
      campaignName: currentCampaign?.title || ''
    });
    
    // Cerrar modal de recarga
    setIsRechargeModalOpen(false);
    
    // ABRIR página de celebración inmediatamente
    setIsCelebrationOpen(true);
    
    // Procesar recarga en background
    setTimeout(async () => {
      try {
        await recharge(amount);
        console.log('💫 Wallet updated successfully in background');
      } catch (error) {
        console.error('❌ Error updating wallet:', error);
      }
    }, 100);
  }, [currentLevel, currentCampaign, userBonusPercentage, recharge]);

  const handleTransactionClick = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseCelebration = useCallback(() => {
    console.log('🔄 Closing celebration page');
    setIsCelebrationOpen(false);
    setCelebrationData({
      amount: 0,
      totalCredits: 0,
      transactionId: '',
      bonus: 0,
      levelBonus: 0,
      campaignBonus: 0,
      levelName: '',
      campaignName: ''
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 wallet-dashboard">
      {/* Professional container with clean spacing */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header Section - Clean and minimal */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Mi Wallet</h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Gestiona tus créditos y campañas publicitarias
            </p>
          </div>
          <button
            onClick={() => setIsRechargeModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center gap-2"
          >
              <Zap className="w-4 h-4" />
              Recargar Saldo
          </button>
          </div>
        </div>

        {/* Professional Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'dashboard'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'transactions'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Transacciones
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Campaign Banner - Professional and elegant */}
        {activeBonus && (
          <div className="mb-8">
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-2xl p-6 overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">
                    {activeBonus.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                        {activeBonus.name}
                      </h3>
                    <p className="text-blue-100 text-sm mb-3 max-w-md">
                      {activeBonus.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {timeLeft} días restantes
                        </span>
                      <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-lg text-xs font-semibold">
                        Hasta +{activeBonus.value}% bonus
                      </span>
                      </div>
                    </div>
                  </div>
                <button
                  onClick={() => setIsRechargeModalOpen(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Aprovechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid - Professional layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column - Balance and Info */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Balance Card - Clean design */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium mb-2">Saldo Disponible</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {formatBalance(balance)}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                    💰 {formatCreditsText(balance)}
                  </p>
                  </div>
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              {/* Monthly Stats - Professional cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-600">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                    <span className="text-neutral-700 dark:text-neutral-300 text-sm font-medium">Recargado este mes</span>
                  </div>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatBalance(monthlyRecharged)}
                  </p>
                  </div>
                
                <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-600">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                    <span className="text-neutral-700 dark:text-neutral-300 text-sm font-medium">Gastado este mes</span>
                  </div>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatBalance(totalDebits)}
                  </p>
                </div>
              </div>
            </div>

            {/* Credits Info Banner - Dismissible */}
            {showCreditsBanner && (
              <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                      Shareflow Credits
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                      Tu moneda digital para publicidad. <strong>Conversión 1:1</strong> ($1 COP = 1 Credit), 
                      sin vencimiento y disponible en 150+ pantallas a nivel nacional.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreditsBanner(false)}
                    className="w-6 h-6 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Professional sidebar */}
          <div className="space-y-6">
            {/* User Level Card - Clean and professional */}
            <div 
              onClick={() => setIsLevelsModalOpen(true)}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Nivel actual</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-xl">
                  {currentLevel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{currentLevel.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Nivel creativo activo</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Progreso al siguiente nivel</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{Math.round(levelProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                    </div>
              
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Bonus por fidelidad
                  </div>
                  <div className="text-purple-900 dark:text-purple-100 font-bold text-sm">
                    Próximamente disponible
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-2 leading-relaxed">
                    Tu fidelidad te hará brillar más. Estamos preparando recompensas especiales basadas en tu actividad.
                  </div>
                </div>
          </div>
        </div>


          </div>
        </div>
          </>
        )}

        {/* Transactions Tab Content - TikTok Style Professional Table */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters and Search Bar - TikTok Style */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  {/* Filter by Type */}
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All types</option>
                    <option value="Add Credits">Add Credits</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Ad Spend">Ad Spend</option>
                  </select>
                  
                  {/* Filter by Status */}
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All statuses</option>
                    <option value="Completed">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
            <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' : ''
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
            </button>

                </div>
          </div>
          
              {/* Advanced Filters Panel - TikTok Style */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date Range</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                </div>
                </div>

                    {/* Quick Date Filters */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Quick Filters</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setQuickDateFilter(7)}
                          className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          Last 7 days
                        </button>
                        <button
                          onClick={() => setQuickDateFilter(30)}
                          className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          Last 30 days
                        </button>
                        <button
                          onClick={() => setQuickDateFilter('month')}
                          className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          This month
                        </button>
              </div>
            </div>

                    {/* Filter Actions */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Actions</label>
                      <div className="flex gap-2">
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Apply
                        </button>
                </div>
                </div>
              </div>
                </div>
              )}
            </div>

            {/* Professional Table - TikTok Style */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Transactions
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span>
                        Showing <strong className="text-neutral-900 dark:text-neutral-100">{filteredTransactions.length}</strong> of <strong className="text-neutral-900 dark:text-neutral-100">{transactions.length}</strong> transactions
                      </span>
                      <button
                        onClick={refreshData}
                        className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-all duration-200"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-neutral-400" />
            </div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    {transactions.length === 0 ? 'No transactions found' : 'No results match your filters'}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {transactions.length === 0 
                      ? 'When you make your first purchase or expense, it will appear here.'
                      : 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    }
                  </p>
                  {transactions.length > 0 && filteredTransactions.length === 0 && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
          </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 px-6 py-3 border-b border-neutral-200 dark:border-neutral-600">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-3">Transaction ID</div>
                      <div className="col-span-3">Description</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1 text-right">Amount</div>
                    </div>
            </div>
            
                  {/* Table Body */}
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-600">
                    {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group"
                      >
                        {/* Date */}
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm text-neutral-900 dark:text-neutral-100">
                            <p className="font-medium">
                              {new Date(transaction.createdAt).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(transaction.createdAt).toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Transaction Type - TikTok Style */}
                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                              transaction.type === 'Deposit' 
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' :
                              transaction.type === 'bonus' 
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                                : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'Deposit' ? (
                                <ArrowUpRight className="w-3 h-3" />
                    ) : transaction.type === 'bonus' ? (
                                <Gift className="w-3 h-3" />
                              ) : (
                                <Package2 className="w-3 h-3" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {transaction.type === 'Deposit' ? 'Add Credits' : 
                               transaction.type === 'bonus' ? 'Bonus' : 'Ad Spend'}
                            </span>
                          </div>
                  </div>
                  
                        {/* Transaction ID */}
                        <div className="col-span-3 flex items-center">
                          <div className="min-w-0">
                            <p className="text-sm font-mono text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {transaction.id.slice(0, 16)}...
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Shareflow LLC0916
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="col-span-3 flex items-center">
                          <p className="text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {transaction.description}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="col-span-1 flex items-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'Completed' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              transaction.status === 'Completed' 
                                ? 'bg-emerald-500' 
                                : 'bg-yellow-500'
                            }`} />
                            {transaction.status === 'Completed' ? 'Success' : 'Pending'}
                      </span>
                </div>
                
                        {/* Amount */}
                        <div className="col-span-1 flex items-center justify-end">
                  <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              transaction.amount > 0 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.amount > 0 ? '+' : '-'}{formatCreditsText(Math.abs(transaction.amount))}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {transaction.type === 'Deposit' ? 'Cash' : 
                               transaction.type === 'bonus' ? 'Bonus' : 'Credits'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
                  </div>

                  {/* Pagination - TikTok Style */}
                  <div className="bg-neutral-50 dark:bg-neutral-700/50 px-6 py-3 border-t border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> transactions
                        {(searchTerm || selectedType || selectedStatus || dateRange.start || dateRange.end) && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">(filtered)</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-600 rounded text-sm transition-colors">
                          Previous
                        </button>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">1</span>
                        <button className="px-3 py-1 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-600 rounded text-sm transition-colors">
                          Next
                </button>
              </div>
                    </div>
                  </div>
                </>
            )}
          </div>
        </div>
        )}




        {/* Modals */}
        <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => setIsRechargeModalOpen(false)}
          onRecharge={handleRecharge}
          currentBalance={wallet.balance}
          currentCampaign={activeBonus}
          currentLevel={currentLevel}
          userType={userType}
          timeLeft={timeLeft}
          calculateBonus={(amount) => calculateBonus(amount, activeBonus, currentLevel, userBonusPercentage)}
          calculateLevelBonus={(amount) => calculateLevelBonus(amount, currentLevel)}
          calculateCampaignBonus={(amount) => calculateCampaignBonus(amount, activeBonus)}
          calculateFinancialCommission={calculateFinancialCommission}
          formatBalance={formatBalance}
          formatCurrency={formatCurrency}
          formatCreditsText={formatCreditsText}
          deposit={deposit}
          PaymentForm={PaymentForm}
        />

        <LevelsModalComponent
          isOpen={isLevelsModalOpen}
          onClose={() => setIsLevelsModalOpen(false)}
          currentLevel={currentLevel}
          totalSpent={wallet.totalLifetimeSpent}
        />

        <ActivityDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          transaction={selectedTransaction}
        />

        {/* NUEVO: Página de celebración independiente */}
        <CelebrationPage
          isOpen={isCelebrationOpen}
          onClose={handleCloseCelebration}
          transactionData={celebrationData}
        />
      </div>
    </div>
  );
});

// Celebration Page Component - Independent thank you page for payment success
interface CelebrationPageProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: {
    amount: number;
    totalCredits: number;
    transactionId: string;
    bonus: number;
    levelBonus: number;
    campaignBonus: number;
    levelName: string;
    campaignName: string;
  };
}

const CelebrationPage: React.FC<CelebrationPageProps> = memo(({ isOpen, onClose, transactionData }) => {
  if (!isOpen) return null;

  const { amount, totalCredits, transactionId, bonus, levelBonus, campaignBonus, levelName, campaignName } = transactionData;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Animation - Around the modal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
              left: `${Math.random() * 100}%`,
              top: `-10px`
            }}
            animate={{
              y: [0, window.innerHeight + 50],
              x: [0, (Math.random() - 0.5) * 100],
              rotate: [0, 360],
              opacity: [1, 0.8, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Celebration Modal */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center border border-gray-200"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          
          {/* Small confetti explosion from center */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`center-${i}`}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                style={{
                  left: '50%',
                  top: '45%'
                }}
                animate={{
                  x: [0, (Math.cos(i * 45 * Math.PI / 180) * 60)],
                  y: [0, (Math.sin(i * 45 * Math.PI / 180) * 60)],
                  opacity: [1, 0],
                  scale: [1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Recarga Exitosa! 🎉
          </h2>
          <p className="text-gray-600">
            Tu saldo ya está listo para brillar en la ciudad
          </p>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Recarga:</span>
            <span className="font-bold text-lg">{formatCurrency(amount)}</span>
          </div>
          
          {/* Level Bonus */}
          {levelBonus > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Crown className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-blue-600 text-xs truncate">
                  Bonus Nivel {levelName}:
                </span>
              </div>
              <span className="font-bold text-blue-600 text-sm ml-2">
                +{formatCreditsText(levelBonus)}
              </span>
            </div>
          )}
          
          {/* Campaign Bonus */}
          {campaignBonus > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Gift className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-600 text-xs truncate">
                  Bonus {campaignName}:
                </span>
              </div>
              <span className="font-bold text-green-600 text-sm ml-2">
                +{formatCreditsText(campaignBonus)}
              </span>
            </div>
          )}
          
          <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total:</span>
            <div className="text-right">
              <div className="font-bold text-2xl text-blue-600">
                💰 {formatCreditsText(totalCredits)}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            ID: {transactionId}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={() => {
              console.log('🚀 User clicked: Go to Marketplace! Closing celebration...');
              onClose(); // Cerrar página de celebración
              // Navegar al marketplace después de cerrar
              setTimeout(() => {
                window.location.href = '/marketplace';
              }, 300);
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Package2 className="w-5 h-5" />
            Ir al Marketplace
          </button>
          
          <button
            onClick={() => {
              console.log('📊 User clicked: View Dashboard! Closing celebration...');
              onClose(); // Cerrar página de celebración
              // Hacer scroll al dashboard después de cerrar
              setTimeout(() => {
                const dashboardElement = document.querySelector('.wallet-dashboard');
                if (dashboardElement) {
                  dashboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300);
            }}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-5 h-5" />
            Ver Dashboard
          </button>
        </motion.div>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Transacción procesada de forma segura
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
});

// Export principal
const WalletPageWithProvider: React.FC = () => {
  return (
    <WalletProvider>
      <WalletDashboard />
    </WalletProvider>
  );
};

export { WalletPageWithProvider as WalletPage }; 