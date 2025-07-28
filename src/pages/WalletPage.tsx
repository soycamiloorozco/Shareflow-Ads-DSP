import React, { useState, useEffect, createContext, useContext, memo, useMemo } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '../api/payment';
import { Button } from '../components/Button';
import { useWallet } from '../hooks/useWallet';
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
            ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' 
            : 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
        }`}>
          <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3 shadow-2xl border border-gray-700 max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">💰</span>
              </div>
              <span className="font-semibold">{content}</span>
            </div>
            {subContent && (
              <p className="text-gray-300 text-xs leading-relaxed">{subContent}</p>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-900"></div>
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
    if (!currentCampaign || amount < currentCampaign.minRecharge) return 0;
    const levelBonus = Math.floor((amount * currentLevel.bonusPercentage) / 100);
    const campaignBonus = Math.floor((amount * userBonusPercentage) / 100);
    return levelBonus + campaignBonus;
  };

const calculateLevelBonus = (amount: number, currentLevel: any) => {
    return Math.floor((amount * currentLevel.bonusPercentage) / 100);
  };

const calculateCampaignBonus = (amount: number, currentCampaign: any) => {
    if (!currentCampaign || amount < currentCampaign.minRecharge) return 0;
    return Math.floor((amount * currentCampaign.value) / 100);
  };

const calculateFinancialCommission = (amount: number, paymentMethod: string) => {
    if (paymentMethod === 'card') {
    return Math.floor((amount * 5) / 100);
    }
  return 0;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-4xl sm:w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl rounded-t-3xl overflow-y-auto">
        {/* Header - Mobile optimized */}
        <div className={`sticky top-0 p-4 sm:p-6 ${currentLevel.bgColor} ${currentLevel.borderColor} border-b sm:rounded-t-3xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-3xl sm:text-4xl">{currentLevel.icon}</div>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold ${currentLevel.color}`}>
                  Nivel {currentLevel.name}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">{currentLevel.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors min-h-[44px] min-w-[44px]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Current Progress - Simplified for mobile */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Mi progreso
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Gasto total:</span>
                <span className="font-bold text-lg">{formatCreditsText(totalSpent)}</span>
              </div>
              {nextLevel && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Siguiente nivel:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{nextLevel.icon}</span>
                      <span className="font-semibold text-gray-900">{nextLevel.name}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full rounded-full h-3 overflow-hidden shadow-inner bg-gray-200">
                      <motion.div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ 
                          duration: 1.5,
                          ease: "easeInOut",
                          delay: 0.3
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs">
                      <span className="text-gray-500">{Math.round(progress)}% completado</span>
                      <span className="text-blue-600 font-medium">
                        Faltan {formatCreditsText(nextLevel.minSpent - totalSpent)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Next level preview */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Al llegar a {nextLevel.name}:
                        </span>
                    </div>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        +{nextLevel.bonusPercentage}% bonus
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All Levels - Mobile optimized grid */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Todos los niveles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userLevels.map((level) => {
                const isCurrentLevel = level.id === currentLevel.id;
                const isUnlocked = totalSpent >= level.minSpent;
                const isGranEstrategaLevel = level.id === 4; // Gran Estratega level
                
                return (
                  <div
                    key={level.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrentLevel 
                        ? `${level.bgColor} ${level.borderColor} shadow-lg`
                        : isUnlocked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    } ${isGranEstrategaLevel && isCurrentLevel ? 'relative overflow-hidden' : ''}`}
                  >
                    {/* Special gold accent for Gran Estratega when current */}
                    {isGranEstrategaLevel && isCurrentLevel && (
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-600/20 pointer-events-none" />
                    )}
                    
                    <div className="relative z-10 flex items-center gap-3 mb-3">
                      <div className="text-2xl">{level.icon}</div>
                      <div>
                        <h4 className={`font-bold ${
                          isGranEstrategaLevel && isCurrentLevel 
                            ? 'text-yellow-400' 
                            : isCurrentLevel 
                            ? level.color 
                            : isUnlocked 
                            ? 'text-green-700' 
                            : 'text-gray-500'
                        }`}>
                          {level.name}
                          {isCurrentLevel && <span className="ml-2 text-sm">(Actual)</span>}
                        </h4>
                        <p className={`text-xs ${
                          isGranEstrategaLevel && isCurrentLevel 
                            ? 'text-yellow-100' 
                            : 'text-gray-600'
                        }`}>
                          Desde {formatCreditsText(level.minSpent)}
                          {level.maxSpent && ` hasta ${formatCreditsText(level.maxSpent)}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Simplified key benefits */}
                    <div className="relative z-10 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Percent className={`w-3 h-3 ${
                          isGranEstrategaLevel && isCurrentLevel ? 'text-yellow-400' : 'text-green-600'
                        }`} />
                        <span className={isGranEstrategaLevel && isCurrentLevel ? 'text-yellow-100' : ''}>
                          {level.bonusPercentage}% bonus en recargas
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className={`w-3 h-3 ${
                          isGranEstrategaLevel && isCurrentLevel ? 'text-yellow-400' : 'text-blue-600'
                        }`} />
                        <span className={isGranEstrategaLevel && isCurrentLevel ? 'text-yellow-100' : ''}>
                          {level.supportLevel}
                        </span>
                      </div>
                      
                      {/* Visual benefit indicators instead of long text */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {level.statusBenefits.length > 0 && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            isGranEstrategaLevel && isCurrentLevel 
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            <Crown className="w-3 h-3" />
                            Status
                      </div>
                        )}
                        
                        {level.advancedFinancialBenefits.length > 0 && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            isGranEstrategaLevel && isCurrentLevel 
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <DollarSign className="w-3 h-3" />
                            Financieros
                          </div>
                        )}
                        
                        {level.merchandising.length > 0 && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            isGranEstrategaLevel && isCurrentLevel 
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            <Gift className="w-3 h-3" />
                            Gifts
                          </div>
                        )}
                        
                        {level.exclusiveAccess.length > 0 && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            isGranEstrategaLevel && isCurrentLevel 
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            <Key className="w-3 h-3" />
                            Exclusivo
                          </div>
                        )}
                      </div>
                      
                      {/* Single highlight benefit instead of full list */}
                      {level.statusBenefits.length > 0 && (
                        <div className={`mt-2 p-2 rounded-lg text-xs ${
                          isGranEstrategaLevel && isCurrentLevel 
                            ? 'bg-black/20 border border-yellow-400/30 text-yellow-100'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          ✨ {level.statusBenefits[0]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Simple info footer */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm">¿Cómo subir de nivel?</span>
              </div>
              <p className="text-blue-700 text-xs">
                Tu nivel se calcula automáticamente según tu gasto total acumulado. Mientras más inviertas en tus campañas, más beneficios exclusivos desbloqueas.
              </p>
            </div>
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:w-full sm:rounded-2xl rounded-t-2xl shadow-2xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Detalle de transacción</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Details */}
        <div className="space-y-4">
          {/* Amount */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className={`text-2xl sm:text-3xl font-bold mb-2 ${
              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.amount > 0 ? '+' : ''}{formatCreditsText(Math.abs(transaction.amount))}
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              transaction.type === 'Deposit' ? 'bg-green-100 text-green-800' :
              transaction.type === 'bonus' ? 'bg-blue-100 text-blue-800' : 
              details.isSportsEvent ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
            }`}>
              {transaction.type === 'Deposit' ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Recarga
                </>
              ) : transaction.type === 'bonus' ? (
                <>
                  <Gift className="w-4 h-4" />
                  Bonus
                </>
              ) : (
                <>
                  <Package2 className="w-4 h-4" />
                  Campaña
                </>
              )}
            </div>
          </div>

          {/* Structured Details for Spending */}
          {details.isStructured && transaction.type === 'Deposit' && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Detalles de la campaña
              </h4>
              <div className="space-y-3 text-sm">
                {details.screenType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de pantalla:</span>
                    <span className="font-medium text-gray-900">{details.screenType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Ubicación:</span>
                  <span className="font-medium text-gray-900 text-right max-w-48">{details.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium text-gray-900">{details.duration}</span>
                </div>
                {details.package && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paquete:</span>
                    <span className="font-medium text-gray-900">{details.package}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standard Details */}
          <div className="space-y-3">
            {!details.isStructured && (
              <div className="flex justify-between">
                <span className="text-gray-600">Descripción:</span>
                <span className="font-medium text-gray-900 text-right max-w-48">{details.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-900">
                {new Date(transaction.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className={`font-medium ${
                transaction.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {transaction.status === 'Completed' ? 'Completado' : 'Pendiente'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-mono text-sm text-gray-500">{transaction.id}</span>
            </div>
          </div>

          {/* Close Button - Touch Friendly */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium min-h-[48px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
});

// Mobile-optimized Main Dashboard Component
const WalletDashboard: React.FC = memo(() => {
  const { wallet, currentCampaign, loading, recharge, refreshData } = useWallets();
    const { getActiveBonus } = useBonus();

  const { transactions: getTransactions, getBalance } = useWallet();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [activeBonus, setActiveBonus] = useState<Bonus | null>(null);
  

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
    getTransactions().then((data) => {
      setTransactions(data.transactions)
    });
    getBalance().then((data) => {
      console.log({data})
      setBalance(data.balance)
    });
  }, []);


  

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

  
  // Calculate totals for compact view
  const totalCredits = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebits = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Función deposit para el nuevo modal
  const deposit = async (depositData: { amount: number; paymentReference: string; description: string }) => {
    console.log('💳 Deposit function called:', depositData);
    // Simula el procesamiento del pago
    return { success: true, transactionId: depositData.paymentReference };
  };

  const handleRecharge = async (amount: number) => {
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
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleCloseCelebration = () => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 wallet-dashboard">
      {/* Mobile-first container with proper padding */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Wallet</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Potencia tu creatividad e ilumina la ciudad
            </p>
          </div>
          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto"
          >
            <Zap className="w-5 h-5" />
            Recargar
          </button>
        </div>

        {/* Campaign Banner - Moved to top */}
        {activeBonus && (
          <div className="relative mb-6 sm:mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 relative overflow-hidden">
              {/* Main content - Mobile first */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-6">
                  {/* Icon */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border border-white/30">
                    {activeBonus.icon}
                  </div>

                  {/* Campaign info */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-2xl font-bold text-white">
                        {activeBonus.name}
                      </h3>
                    </div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-3 max-w-lg">
                      {activeBonus.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30 w-fit">
                        <Timer className="w-4 h-4 text-yellow-300" />
                        <span className="text-white font-semibold text-sm">
                          ¡Solo {timeLeft} días!
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-3 sm:px-4 py-2 rounded-lg font-bold text-sm w-fit">
                        Hasta +{activeBonus.value}% bonus
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button - Mobile optimized */}
                <button
                  onClick={() => setIsRechargeModalOpen(true)}
                  className="bg-white text-blue-700 hover:text-blue-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 min-h-[48px] w-full sm:w-auto"
                >
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  ¡Aprovechar oferta!
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid Layout - Mobile first */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Balance Card - Full width on mobile */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Saldo disponible</h2>
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {formatBalance(balance)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    💰 {formatCreditsText(balance)}
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              {/* Stats Grid - Mobile optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Este mes recargado</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    {formatBalance(monthlyRecharged)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-600">Este mes gastado</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    {formatBalance(totalDebits)}
                  </div>
                </div>
              </div>
            </div>

            {/* How Credits Work - Mobile optimized */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    ¿Cómo funcionan los Shareflow Credits?
                    <CreditTooltip 
                      content="Sistema de moneda virtual"
                      subContent="Inspirado en las mejores plataformas globales, nuestro sistema te da control total."
                    >
                      <HelpCircle className="w-4 h-4 text-blue-600 cursor-help" />
                    </CreditTooltip>
                  </h3>
                  <div className="space-y-2 text-blue-800">
                    <p className="text-sm flex items-start gap-2">
                      <span className="text-yellow-500">💰</span>
                      <span>
                        <strong>Conversión simple:</strong> $1 peso = 1 Shareflow Credit
                      </span>
                    </p>
                    <p className="text-sm flex items-start gap-2">
                      <span className="text-blue-500">🎯</span>
                      <span><strong>Alcance ilimitado:</strong> Más de 150 pantallas estratégicas</span>
                    </p>
                    <p className="text-sm flex items-start gap-2">
                      <span className="text-green-500">♾️</span>
                      <span><strong>Sin vencimiento:</strong> Tu saldo nunca expira</span>
                    </p>
                    <p className="text-sm flex items-start gap-2">
                      <span className="text-red-500">🚀</span>
                      <span><strong>Tú decides:</strong> Fotos, videos, proyectos o campañas épicas</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Level Card - Mobile optimized */}
          <div className="lg:col-span-1">
            <div 
              className={`${currentLevel.bgColor} border-2 ${currentLevel.borderColor} rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all h-fit relative overflow-hidden`}
              onClick={() => setIsLevelsModalOpen(true)}
            >
              {/* Special gold accent for Gran Estratega */}
              {currentLevel.id === 4 && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/10 pointer-events-none" />
              )}
              
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="text-2xl sm:text-3xl">{currentLevel.icon}</div>
                <div className="text-right">
                  <p className={`text-xs ${currentLevel.id === 4 ? 'text-yellow-200' : 'text-gray-500'}`}>
                    Nivel actual
                  </p>
                </div>
              </div>
              
              <h3 className={`text-base sm:text-lg font-semibold mb-1 ${
                currentLevel.id === 4 ? 'text-yellow-400' : currentLevel.color
              }`}>
                Nivel {currentLevel.name}
              </h3>
              <p className={`text-sm mb-4 ${
                currentLevel.id === 4 ? 'text-yellow-100' : 'text-gray-600'
              }`}>
                {currentLevel.description}
              </p>
              
              <div className={`${
                currentLevel.id === 4 
                  ? 'bg-black/20 border border-yellow-400/30' 
                  : 'bg-white/50'
              } rounded-lg p-3 mb-4`}>
                <p className={`text-lg sm:text-xl font-bold mb-1 ${
                  currentLevel.id === 4 ? 'text-yellow-400' : currentLevel.color
                }`}>
                  {currentLevel.bonusPercentage}% bonus
                </p>
                <p className={`text-xs ${
                  currentLevel.id === 4 ? 'text-yellow-200' : 'text-gray-500'
                }`}>
                  en recargas
                </p>
                    </div>
              
              <div className="mt-4 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-500 text-center">
                  👆 Toca para ver todos los niveles
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Compact Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Actividad reciente
            </h3>
            <button
              onClick={refreshData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Summary Cards - Mobile first grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Total Credits */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium mb-1">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    +{formatCreditsText(totalCredits)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Debits */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium mb-1">Total Gastos</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-700">
                    -{formatCreditsText(totalDebits)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Package2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Net Balance */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">Balance Neto</p>
                  <p className={`text-xl sm:text-2xl font-bold ${
                    totalCredits - totalDebits >= 0 ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    {totalCredits - totalDebits >= 0 ? '+' : ''}{formatCreditsText(totalCredits - totalDebits)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Transactions List - Mobile optimized */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Últimas transacciones</h4>
              <span className="text-sm text-gray-500">{transactions.length} transacciones</span>
            </div>
            
            {transactions.slice(0, 4).map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all group min-h-[60px]"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    transaction.type === 'Deposit' ? 'bg-green-100' :
                    transaction.type === 'bonus' ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'Deposit' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : transaction.type === 'bonus' ? (
                      <Gift className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Package2 className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('es-CO', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-sm font-medium ${
                        transaction.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'Completed' ? '✓' : '⏳'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCreditsText(Math.abs(transaction.amount))}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
            
            {transactions.length > 4 && (
              <div className="text-center pt-3">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors min-h-[44px] px-4">
                  Ver todas las transacciones ({transactions.length - 4} más)
                </button>
              </div>
            )}
          </div>
        </div>

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