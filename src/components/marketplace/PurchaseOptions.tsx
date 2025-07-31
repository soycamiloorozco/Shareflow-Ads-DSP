import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, DollarSign, Calendar, TrendingUp, Clock, Users, Star, Wallet, Zap, ArrowRight, CheckCircle, Timer, Target, Award, AlertTriangle, Info, Brain, Sparkles, TrendingDown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../types';
import { Button } from '../Button';
import { Card } from '../Card';
import { TimePurchaseModal } from './TimePurchaseModal';
import { calculatePriceWithMargin, getPartnerMargin } from '../../lib/utils';
import { mlPricingService, formatPriceChange, getDemandBadgeColor, getPeakHourBadgeColor } from '../../services/pricingMLService';
import { useWallet } from '../../hooks/useWallet';

// Bundle type definition
interface Bundle {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  frequency: {
    type: string; // '1min', '2min', '5min', '10min', '15min', '30min', '1hour'
    displayText: string; // 'Se muestra cada 2 minutos'
    spotsPerHour: number;
    totalSpots: number; // Calculated based on package type
  };
  isHighlighted?: boolean;
  savings?: string;
  // ML Pricing fields
  mlInsights?: {
    totalPurchases: number;
    demandScore: number;
    trend: string;
    recommendation: string;
  };
  demandLevel?: string;
  peakHourLevel?: string;
  priceIncrease?: number;
  originalPrice?: number;
  demandMultiplier?: number;
  peakHourMultiplier?: number;
  reach?: number; // Added for variants
  isVariant?: boolean; // Added for variants
  originalPackageId?: string; // Added for variants
}

type AdMode = 'momentos' | 'hourly' | 'daily' | 'weekly' | 'monthly';

interface PurchaseOptionsProps {
  screen: Screen;
  selectedMode: AdMode;
  selectedBundle: Bundle | null;
  setSelectedMode: (mode: AdMode) => void;
  setSelectedBundle: (bundle: Bundle) => void;
  bundles?: Record<AdMode, Bundle[]>; // Made optional since bundles are now generated internally
  onContinue: () => void;
  onSaveAsDraft?: () => void; // Nueva función para guardar como borrador
  isModalMode?: boolean; // Nueva prop para modo modal
  isEditingDraft?: boolean; // Nueva prop para indicar si estamos editando un borrador
}

// Simple balance display function for main balance
const formatBalance = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

// Enhanced Wallet Balance Component
const WalletBalanceIndicator: React.FC<{ requiredAmount?: number; compact?: boolean }> = ({ 
  requiredAmount = 0, 
  compact = false 
}) => {
  try {
    const { wallet } = useWallet();
    const balance = wallet.balance;
    console.log('🔍 WalletBalanceIndicator: Balance obtenido:', balance);
  const hasEnoughBalance = balance >= requiredAmount;

  if (compact) {
    return (
      <motion.div 
        className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Wallet className="w-4 h-4 text-green-600" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Tus créditos disponibles</span>
          <span className="font-semibold text-gray-800">{formatBalance(balance)}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`p-4 rounded-xl border transition-all duration-300 ${
      hasEnoughBalance 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
          : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
            hasEnoughBalance ? 'bg-green-100' : 'bg-red-100'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Wallet className={`w-5 h-5 ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`} />
        </motion.div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tus créditos disponibles</p>
          <p className="text-lg font-bold text-gray-800">
            ${balance.toLocaleString()}
          </p>
          {requiredAmount > 0 && (
            <motion.p 
              className={`text-sm font-medium mt-1 ${
                hasEnoughBalance ? 'text-green-600' : 'text-red-600'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {hasEnoughBalance 
                ? `✓ Suficiente para esta compra` 
                : `⚠️ Necesitas $${(requiredAmount - balance).toLocaleString()} más`
              }
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
  } catch (error) {
    // Fallback when WalletProvider is not available
    return (
      <motion.div 
        className="flex items-center gap-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg border border-gray-200"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Wallet className="w-4 h-4 text-gray-600" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Wallet no disponible</span>
          <span className="font-semibold text-gray-800">Cargando...</span>
        </div>
      </motion.div>
    );
  }
};

const PurchaseOptions: React.FC<PurchaseOptionsProps> = ({
  screen,
  selectedMode,
  selectedBundle,
  setSelectedMode,
  setSelectedBundle,
  bundles,
  onContinue,
  onSaveAsDraft,
  isModalMode = false,
  isEditingDraft = false
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [animatingMode, setAnimatingMode] = useState<AdMode | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // NUEVO: Acceso al wallet para verificar saldo
  let walletBalance = 0;
  let walletAvailable = false;
  
  try {
    const { wallet } = useWallet();
    walletBalance = wallet.balance;
    walletAvailable = true;
    console.log('🔍 PurchaseOptions: Balance obtenido:', walletBalance);
  } catch (error) {
    // Wallet no disponible, usar valores por defecto
    walletBalance = 0;
    walletAvailable = false;
    console.warn('Wallet no disponible en PurchaseOptions:', error);
  }

  // Generate bundles from real API data (screenPackages)
  const generateBundlesFromAPI = useMemo(() => {
    const result: Record<AdMode, Bundle[]> = {
      momentos: [],
      hourly: [],
      daily: [],
      weekly: [],
      monthly: []
    };

    // Helper functions for package display - MOVED HERE TO AVOID HOISTING ISSUES
    const getPackageDisplayName = (packageType: string, isOnlyPackage: boolean = false): string => {
      if (isOnlyPackage) {
        switch (packageType) {
          case 'moments':
            return 'Regular';
          case 'hourly':
            return 'Regular';
          case 'daily':
            return 'Regular';
          case 'weekly':
            return 'Regular';
          case 'monthly':
            return 'Regular';
          default:
            return 'Regular';
        }
      }
      
      switch (packageType) {
        case 'moments':
          return 'Momento Básico';
        case 'hourly':
          return 'Hora Estándar';
        case 'daily':
          return 'Día Completo';
        case 'weekly':
          return 'Semana Estándar';
        case 'monthly':
          return 'Mes Completo';
        default:
          return 'Paquete';
      }
    };

    const getPackageDescription = (packageType: string): string => {
      switch (packageType) {
        case 'moments':
          return 'Aparece una vez en un momento específico';
        case 'hourly':
          return 'Tu anuncio durante una hora en rotación';
        case 'daily':
          return 'Tu anuncio durante todo el día';
        case 'weekly':
          return 'Tu anuncio durante una semana completa';
        case 'monthly':
          return 'Tu anuncio durante un mes (30 días)';
        default:
          return 'Paquete de publicidad';
      }
    };

    const getFrequencyDisplayText = (packageType: string, frequency: string): string => {
      switch (packageType) {
        case 'moments':
          return 'Se muestra una vez en momento específico';
        case 'hourly':
          return `Se muestra cada ${frequency}`;
        case 'daily':
          return `Se muestra cada ${frequency} durante todo el día`;
        case 'weekly':
          return `Se muestra cada ${frequency} durante toda la semana`;
        case 'monthly':
          return `Se muestra cada ${frequency} durante todo el mes`;
        default:
          return `Se muestra cada ${frequency}`;
      }
    };

    // Get screenPackages from API data
    const screenPackages = (screen as any).screenPackages || [];
    
    // DEBUG: Log the screen data to see what we're working with
    console.log('🔍 DEBUG: Screen data:', {
      screenId: screen.id,
      screenPackages: screenPackages,
      totalPackages: screenPackages.length
    });
    
    // TEMPORARY: Add test variants if no real data exists
    let testScreenPackages = screenPackages;
    if (screenPackages.length === 0) {
      testScreenPackages = [
        {
          id: 1,
          screenId: parseInt(screen.id),
          packageType: 'hourly',
          enabled: true,
          price: 25000,
          spots: 4,
          duration: '1 hora',
          reach: 1800,
          variants: [
            {
              id: 1,
              variantId: 'hourly-1min',
              name: '1 vez por minuto',
              frequency: '1/min',
              spotsPerHour: 60,
              price: 45000,
              enabled: true
            },
            {
              id: 2,
              variantId: 'hourly-2min',
              name: '1 vez cada 2 minutos',
              frequency: '1/2min',
              spotsPerHour: 30,
              price: 35000,
              enabled: true
            }
          ]
        },
        {
          id: 2,
          screenId: parseInt(screen.id),
          packageType: 'daily',
          enabled: true,
          price: 150000,
          spots: 96,
          duration: '24 horas',
          reach: 5000,
          variants: [
            {
              id: 3,
              variantId: 'daily-premium',
              name: 'Día Premium',
              frequency: '1/5min',
              spotsPerDay: 288,
              price: 200000,
              enabled: true
            }
          ]
        }
      ];
      console.log('🧪 DEBUG: Using test data with variants:', testScreenPackages);
    }
    
    // Helper function to get frequency options
    const getFrequencyOptions = () => [
      { value: '1min', label: '1 vez por minuto', spotsPerHour: 60 },
      { value: '2min', label: '1 vez cada 2 minutos', spotsPerHour: 30 },
      { value: '5min', label: '1 vez cada 5 minutos', spotsPerHour: 12 },
      { value: '10min', label: '1 vez cada 10 minutos', spotsPerHour: 6 },
      { value: '15min', label: '1 vez cada 15 minutos', spotsPerHour: 4 },
      { value: '30min', label: '1 vez cada 30 minutos', spotsPerHour: 2 },
      { value: '1hour', label: '1 vez por hora', spotsPerHour: 1 }
    ];

    // Helper function to calculate spots based on frequency and package type
    const calculateSpotCount = (frequencyType: string, packageType: string) => {
      const option = getFrequencyOptions().find(opt => opt.value === frequencyType);
      if (!option) return 0;

      const spotsPerHour = option.spotsPerHour;

      switch (packageType) {
        case 'hourly':
          return spotsPerHour;
        case 'daily':
          return spotsPerHour * 16; // 16 horas operativas
        case 'weekly':
          return spotsPerHour * 16 * 7;
        case 'monthly':
          return spotsPerHour * 16 * 30;
        default:
          return spotsPerHour;
      }
    };

    // Get partner's configured frequency (default to 15min if not configured)
    const partnerFrequency = '15min'; // This should come from partner configuration in the future
    const frequencyOption = getFrequencyOptions().find(opt => opt.value === partnerFrequency);
    const frequencyLabel = frequencyOption?.label || 'Se muestra cada 15 minutos';

    // Process each screen package from API
    testScreenPackages.forEach((pkg: any, index: number) => {
      if (!pkg.enabled) return;

      const packageType = pkg.packageType;
      const basePrice = pkg.price || 0;
      const spots = pkg.spots || 0;
      const duration = pkg.duration || '';
      const reach = pkg.reach || 0;
      const variants = pkg.variants || [];

      // DEBUG: Log each package being processed
      console.log(`🔍 DEBUG: Processing package ${index + 1}:`, {
        packageType,
        basePrice,
        spots,
        duration,
        reach,
        variantsCount: variants.length,
        hasVariants: variants.length > 0 && variants.some((v: any) => v.enabled),
        variants: variants
      });

      // Check if this package has variants
      const hasVariants = variants.length > 0 && variants.some((v: any) => v.enabled);
      
      // Only create main bundle if there are NO variants
      if (!hasVariants) {
        // Check if this will be the only package for this type
        const isOnlyPackage = testScreenPackages.filter(p => p.packageType === packageType && p.enabled).length === 1;
        
        const mainBundle = {
          id: `${packageType}_${pkg.id}`,
          name: getPackageDisplayName(packageType, isOnlyPackage),
          description: getPackageDescription(packageType),
          duration: duration,
          price: basePrice,
          frequency: {
            type: partnerFrequency,
            displayText: getFrequencyDisplayText(packageType, partnerFrequency),
            spotsPerHour: frequencyOption?.spotsPerHour || 4,
            totalSpots: spots
          },
          isHighlighted: index === 0, // First enabled package is highlighted
          reach: reach
        };

        // Add main bundle to result only if no variants exist
        switch (packageType) {
          case 'moments':
            result.momentos.push(mainBundle);
            break;
          case 'hourly':
            result.hourly.push(mainBundle);
            break;
          case 'daily':
            result.daily.push(mainBundle);
            break;
          case 'weekly':
            result.weekly.push(mainBundle);
            break;
          case 'monthly':
            result.monthly.push(mainBundle);
            break;
        }
        
        console.log(`✅ DEBUG: Added main bundle: ${mainBundle.name} for ${packageType} (no variants found)`);
      }

      // Process variants for this package
      variants.forEach((variant: any, variantIndex: number) => {
        if (!variant.enabled) return;

        // DEBUG: Log each variant being processed
        console.log(`🔍 DEBUG: Processing variant ${variantIndex + 1} for package ${packageType}:`, {
          variantId: variant.id,
          variantName: variant.name,
          variantPrice: variant.price,
          variantFrequency: variant.frequency,
          variantEnabled: variant.enabled
        });

        const variantBundle = {
          id: `${packageType}_variant_${variant.id}`,
          name: variant.name || getPackageDisplayName(packageType, false),
          description: getPackageDescription(packageType),
          duration: duration,
          price: variant.price || basePrice,
          frequency: {
            type: variant.frequency || partnerFrequency,
            displayText: `Frecuencia: ${variant.frequency}`,
            spotsPerHour: variant.spotsPerHour || frequencyOption?.spotsPerHour || 4,
            totalSpots: variant.spotsPerDay || variant.spotsPerHour || spots
          },
          isHighlighted: false, // Variants are not highlighted by default
          reach: reach,
          isVariant: true,
          originalPackageId: pkg.id
        };

        // Add variant bundle to result
        switch (packageType) {
          case 'moments':
            result.momentos.push(variantBundle);
            break;
          case 'hourly':
            result.hourly.push(variantBundle);
            break;
          case 'daily':
            result.daily.push(variantBundle);
            break;
          case 'weekly':
            result.weekly.push(variantBundle);
            break;
          case 'monthly':
            result.monthly.push(variantBundle);
            break;
        }
        
        console.log(`✅ DEBUG: Added variant bundle: ${variantBundle.name} for ${packageType}`);
      });
    });

    // DEBUG: Log final result
    console.log('🔍 DEBUG: Final bundles generated:', {
      momentos: result.momentos.length,
      hourly: result.hourly.length,
      daily: result.daily.length,
      weekly: result.weekly.length,
      monthly: result.monthly.length,
      totalBundles: Object.values(result).flat().length
    });

    // If no packages from API, fallback to legacy pricing structure
    if (screenPackages.length === 0) {
      const safePricing = screen.pricing || {
        allowMoments: false,
        bundles: {
          hourly: { enabled: false, price: 0 },
          daily: { enabled: false, price: 0 },
          weekly: { enabled: false, price: 0 },
          monthly: { enabled: false, price: 0 }
        }
      };

      if (safePricing.allowMoments) {
        result.momentos = [
          {
            id: 'moment_basic',
            name: 'Momento Básico',
            description: 'Aparece una vez en un momento específico',
            duration: '15 segundos',
            price: 9500,
            frequency: {
              type: '15min',
              displayText: 'Se muestra una vez en momento específico',
              spotsPerHour: 1,
              totalSpots: 1
            },
            isHighlighted: false
          },
          {
            id: 'moment_premium',
            name: 'Momento Premium',
            description: 'Aparece 3 veces en momentos específicos',
            duration: '15 segundos x 3',
            price: 25000,
            frequency: {
              type: '15min',
              displayText: 'Se muestra 3 veces en momentos específicos',
              spotsPerHour: 3,
              totalSpots: 3
            },
            isHighlighted: true
          }
        ];
      }

      if (safePricing.bundles.hourly?.enabled) {
        result.hourly = [
          {
            id: 'hourly_standard',
            name: 'Hora Estándar',
            description: 'Tu anuncio durante una hora en rotación',
            duration: '1 hora',
            price: safePricing.bundles.hourly.price,
            frequency: {
              type: partnerFrequency,
              displayText: frequencyLabel,
              spotsPerHour: frequencyOption?.spotsPerHour || 4,
              totalSpots: calculateSpotCount(partnerFrequency, 'hourly')
            },
            isHighlighted: true
          }
        ];
      }

      if (safePricing.bundles.daily?.enabled) {
        result.daily = [
          {
            id: 'daily_standard',
            name: 'Día Completo',
            description: 'Tu anuncio durante todo el día',
            duration: '24 horas',
            price: safePricing.bundles.daily.price,
            frequency: {
              type: partnerFrequency,
              displayText: frequencyLabel,
              spotsPerHour: frequencyOption?.spotsPerHour || 4,
              totalSpots: calculateSpotCount(partnerFrequency, 'daily')
            },
            isHighlighted: true
          }
        ];
      }

      if (safePricing.bundles.weekly?.enabled) {
        result.weekly = [
          {
            id: 'weekly_standard',
            name: 'Semana Estándar',
            description: 'Tu anuncio durante una semana completa',
            duration: '7 días',
            price: safePricing.bundles.weekly.price,
            frequency: {
              type: partnerFrequency,
              displayText: `${frequencyLabel} durante toda la semana`,
              spotsPerHour: frequencyOption?.spotsPerHour || 4,
              totalSpots: calculateSpotCount(partnerFrequency, 'weekly')
            },
            isHighlighted: true
          }
        ];
      }

      if (safePricing.bundles.monthly?.enabled) {
        result.monthly = [
          {
            id: 'monthly_standard',
            name: 'Mes Completo',
            description: 'Tu anuncio durante un mes (30 días)',
            duration: '30 días',
            price: safePricing.bundles.monthly.price,
            frequency: {
              type: partnerFrequency,
              displayText: `${frequencyLabel} durante todo el mes`,
              spotsPerHour: frequencyOption?.spotsPerHour || 4,
              totalSpots: calculateSpotCount(partnerFrequency, 'monthly')
            },
            isHighlighted: true
          }
        ];
      }
    }

    return result;
  }, [screen]);

  // Apply margin to bundle prices - SHOW EXACT API PRICES
  const applyMarginToBundles = (originalBundles: Record<AdMode, Bundle[]>): Record<AdMode, Bundle[]> => {
    // Return bundles with exact API prices - no ML pricing applied
    const processedBundles: Record<AdMode, Bundle[]> = {} as Record<AdMode, Bundle[]>;

    Object.entries(originalBundles).forEach(([mode, bundleList]) => {
      processedBundles[mode as AdMode] = bundleList.map(bundle => {
        return {
          ...bundle,
          // Use exact API price without any modifications
          price: bundle.price,
          // No ML insights or multipliers
          mlInsights: undefined,
          demandLevel: undefined,
          peakHourLevel: undefined,
          priceIncrease: undefined,
          savings: undefined,
          originalPrice: bundle.price,
          demandMultiplier: 1.0,
          peakHourMultiplier: 1.0
        };
      });
    });

    return processedBundles;
  };

  // Apply margin to bundles - use API-generated bundles instead of props
  const bundlesWithMargin = applyMarginToBundles(generateBundlesFromAPI);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    const handleScroll = () => {
      if (isModalMode) return; // No mostrar en modo modal
      
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Mostrar el botón flotante si el usuario ha scrolleado más de 300px
      // y no está cerca del final de la página
      const shouldShow = scrolled > 300 && (scrolled + windowHeight < documentHeight - 200);
      setShowFloatingButton(shouldShow);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isModalMode]);

  const handleModeSelect = (mode: AdMode) => {
    setAnimatingMode(mode);
    setSelectedMode(mode);
    setTimeout(() => setAnimatingMode(null), 300);
  };

  // State for modal
  const [showModal, setShowModal] = useState(false);

  const handleContinueClick = () => {
    if (!selectedBundle) return;
    
    // Verificar saldo antes de continuar
    if (walletAvailable && walletBalance < (selectedBundle.price || 0)) {
      // Redirigir a wallet para recargar si no hay suficiente saldo
      navigate('/wallet');
      return;
    }
    
    // Si el saldo es suficiente, continuar con la compra
    if (selectedMode === 'momentos') {
      // Open TimePurchaseModal for moments
      setShowModal(true);
    } else {
      onContinue();
    }
  };

  const handleModalComplete = (data: any) => {
    setShowModal(false);
    // Pass the data to the parent component
    onContinue();
  };

  const modeOptions = [
    { 
      id: 'momentos', 
      label: 'Momentos', 
      icon: Timer, 
      description: 'Spots de 15s',
      color: 'from-purple-500 to-pink-500',
      emoji: '⚡'
    },
    { 
      id: 'hourly', 
      label: 'Por hora', 
      icon: Clock, 
      description: 'Rotación horaria',
      color: 'from-blue-500 to-cyan-500',
      emoji: '🕐'
    },
    { 
      id: 'daily', 
      label: 'Por día', 
      icon: Calendar, 
      description: '24 horas completas',
      color: 'from-green-500 to-emerald-500',
      emoji: '📅'
    },
    { 
      id: 'weekly', 
      label: 'Por semana', 
      icon: TrendingUp, 
      description: '7 días seguidos',
      color: 'from-orange-500 to-yellow-500',
      emoji: '📊'
    },
    { 
      id: 'monthly', 
      label: 'Por mes', 
      icon: Star, 
      description: '30 días completos',
      color: 'from-red-500 to-pink-500',
      emoji: '🗓️'
    }
  ];

  return (
    <div className={`${isMobile ? "mb-3" : isModalMode ? "mb-4" : "my-6 scroll-mt-24"} relative`}>
      <Card className={isMobile ? "shadow-sm border border-gray-200 bg-white rounded-lg mx-3" : isModalMode ? "shadow-none border border-gray-200 bg-white rounded-lg" : "shadow-lg border-0 bg-gradient-to-br from-white to-gray-50"}>
        <div className={isMobile ? "p-3 pb-4" : isModalMode ? "p-4 pb-6" : "p-6 pb-8"}>
          
          {/* Mobile Header */}
          {isMobile && (
            <div className="mb-3 text-center">
              <h2 className="text-base font-bold text-gray-900 flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4 text-[#353FEF]" />
                <span>Compra esta pantalla</span>
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Precios desde ${Math.min(...Object.values(bundlesWithMargin).flatMap(b => b.map(item => item.price))).toLocaleString()}
              </p>
            </div>
          )}
          
          {/* Enhanced Header */}
          {!isMobile && !isModalMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Opciones de Publicidad
                </h2>
                <p className="text-base text-gray-600">
                    Selecciona el tipo de compra que prefieres para esta pantalla
                  </p>
                </div>
            </motion.div>
          )}
          
          {/* Modal Header - Más compacto */}
          {!isMobile && isModalMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-3"
            >
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Opciones de Compra
                </h2>
                <p className="text-sm text-gray-600">
                  Selecciona tu paquete preferido
                </p>
              </div>
            </motion.div>
          )}
          
                     {/* Enhanced Mode Selection - Mobile Optimized */}
           <div className={`${isMobile ? "mb-3" : isModalMode ? "mb-3" : "mb-6"}`}>
             {!isMobile && !isModalMode && (
               <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                 <Target className="w-4 h-4 text-[#353FEF]" />
                 Tipo de Compra
               </h3>
             )}
             {!isMobile && isModalMode && (
               <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                 <Target className="w-3 h-3 text-[#353FEF]" />
                 Tipo de Compra
               </h3>
             )}
             {isMobile && (
               <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                 TIPO DE COMPRA
               </h3>
             )}
             
             {/* Mobile Layout - Grid más compacto */}
             {isMobile ? (
               <div className="grid grid-cols-5 gap-1.5">
                 {modeOptions.map((option) => (
                   <motion.button
                     key={option.id}
                     onClick={() => handleModeSelect(option.id as AdMode)}
                     className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-300 ${
                       selectedMode === option.id 
                         ? 'border-[#353FEF] bg-gradient-to-br from-[#353FEF]/10 to-[#4F46E5]/5 shadow-md' 
                         : 'border-gray-200 bg-white'
                     }`}
                     whileTap={{ scale: 0.95 }}
                     animate={animatingMode === option.id ? { scale: [1, 1.05, 1] } : {}}
                     transition={{ duration: 0.2 }}
                   >
                     <div className={`text-sm mb-0.5 transition-all duration-300 ${
                       selectedMode === option.id ? 'scale-110' : ''
                     }`}>
                       {option.emoji}
                     </div>
                     <span className={`text-xs font-semibold text-center leading-tight ${
                       selectedMode === option.id ? 'text-[#353FEF]' : 'text-gray-700'
                     }`}>
                       {option.label}
                     </span>
                     
                     {/* Selection indicator */}
                     {selectedMode === option.id && (
                       <motion.div 
                         className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#353FEF] rounded-full"
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ type: "spring", stiffness: 400, damping: 10 }}
                       />
                     )}
                   </motion.button>
                 ))}
               </div>
                          ) : (
               /* Desktop Layout - Horizontal with better spacing */
               <div className={`${isModalMode ? 'flex overflow-x-auto gap-1 pb-2 px-2 hide-scrollbar' : 'flex justify-center gap-4 max-w-4xl mx-auto'}`}>
                 {modeOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => handleModeSelect(option.id as AdMode)}
                     className={`group relative overflow-hidden flex flex-col items-center justify-center ${isModalMode ? 'p-2 flex-shrink-0' : 'p-6'} rounded-2xl border-2 transition-all duration-300 ${isModalMode ? 'min-w-[85px] w-[85px]' : 'min-w-[140px]'} ${
                       selectedMode === option.id 
                         ? 'border-[#353FEF] bg-gradient-to-br from-[#353FEF]/10 to-[#4F46E5]/5 shadow-xl' + (isModalMode ? '' : ' transform scale-105')
                         : 'border-gray-200 hover:border-[#353FEF]/50 hover:bg-gray-50 hover:shadow-lg'
                     }`}
                     whileHover={{ y: -3, scale: selectedMode === option.id ? 1.05 : 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     animate={animatingMode === option.id ? { scale: [1, 1.08, 1.05] } : {}}
                     transition={{ duration: 0.3 }}
                   >
                     <div className={`${isModalMode ? 'text-sm mb-0.5' : 'text-3xl mb-3'} transition-all duration-300 ${
                       selectedMode === option.id ? 'scale-110 filter drop-shadow-md' : 'group-hover:scale-110'
                     }`}>
                       {option.emoji}
                     </div>
                     <span className={`${isModalMode ? 'text-xs leading-tight' : 'text-sm'} font-bold text-center ${isModalMode ? 'mb-0' : 'mb-2'} ${
                       selectedMode === option.id ? 'text-[#353FEF]' : 'text-gray-700'
                     }`}>
                       {option.label}
                     </span>
                     {!isModalMode && (
                       <span className="text-xs text-gray-500 text-center leading-tight">
                         {option.description}
                       </span>
                     )}
                     
                     {/* Selection indicator */}
                     {selectedMode === option.id && (
                <motion.div
                         className={`absolute ${isModalMode ? 'top-0.5 right-0.5 w-3 h-3' : '-top-2 -right-2 w-6 h-6'} bg-[#353FEF] rounded-full shadow-lg flex items-center justify-center`}
                         initial={{ scale: 0, rotate: -180 }}
                         animate={{ scale: 1, rotate: 0 }}
                         transition={{ type: "spring", stiffness: 400, damping: 10 }}
                       >
                         <Check className={`${isModalMode ? 'w-1.5 h-1.5' : 'w-3 h-3'} text-white`} />
                </motion.div>
                     )}
              </motion.button>
            ))}
               </div>
             )}
          </div>
          
                     {/* Enhanced Bundle Cards - Mobile Optimized */}
           <div className={`${isMobile ? "mb-3" : isModalMode ? "mb-4" : "mb-8"}`}>
             {!isMobile && !isModalMode && (
               <div className="text-center mb-6">
                 <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                   <Award className="w-6 h-6 text-[#353FEF]" />
                   Paquetes Disponibles
                 </h3>
                 <p className="text-gray-600">Elige el paquete que mejor se adapte a tus necesidades</p>
               </div>
             )}
             {!isMobile && isModalMode && (
               <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                 <Award className="w-3 h-3 text-[#353FEF]" />
                 Paquetes Disponibles
               </h3>
             )}
             {isMobile && (
               <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                 PAQUETES DISPONIBLES
               </h3>
             )}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedMode}
                 className={isMobile ? "space-y-2" : isModalMode ? "space-y-2" : "space-y-4"}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {bundlesWithMargin[selectedMode].length === 0 ? (
                // Beautiful "No packages available" message
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`text-center ${isMobile ? 'py-8 px-6' : isModalMode ? 'py-8 px-8' : 'py-12 px-10'} bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-100 shadow-lg`}
                >
                  {/* Animated icon with gradient background */}
                  <motion.div 
                    className={`${isMobile ? 'w-16 h-16' : isModalMode ? 'w-20 h-20' : 'w-24 h-24'} mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-md`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    >
                      <Info className={`${isMobile ? 'w-8 h-8' : isModalMode ? 'w-10 h-10' : 'w-12 h-12'} text-blue-600`} />
                    </motion.div>
                  </motion.div>

                  {/* Title with gradient text */}
                  <motion.h3 
                    className={`${isMobile ? 'text-xl' : isModalMode ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    ¡Ups! No disponible
                  </motion.h3>

                  {/* Main message */}
                  <motion.p 
                    className={`${isMobile ? 'text-base' : isModalMode ? 'text-lg' : 'text-xl'} text-gray-700 mb-4 leading-relaxed`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Esta pantalla no tiene <span className="font-bold text-indigo-600 px-2 py-1 bg-indigo-100 rounded-lg">
                      {selectedMode === 'momentos' ? 'momentos' : 
                       selectedMode === 'hourly' ? 'compra por hora' :
                       selectedMode === 'daily' ? 'compra por día' :
                       selectedMode === 'weekly' ? 'compra por semana' :
                       'compra por mes'}
                    </span> disponible
                  </motion.p>

                  {/* Suggestion with icon */}
                  <motion.div
                    className={`flex items-center justify-center gap-2 ${isMobile ? 'text-sm' : isModalMode ? 'text-base' : 'text-lg'} text-blue-600 bg-blue-100 rounded-xl px-4 py-3 mx-auto max-w-fit`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                    <span className="font-medium">Prueba otro tipo de compra</span>
                  </motion.div>


                </motion.div>
              ) : (
                // Enhanced scrollable container for bundles
                <div className={`${isMobile ? 'max-h-[400px]' : isModalMode ? 'max-h-[500px]' : 'max-h-[600px]'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 pt-4`}>
                  <div className={`${isMobile ? 'space-y-2' : isModalMode ? 'space-y-3' : 'space-y-4'}`}>
                    {bundlesWithMargin[selectedMode].map((bundle, index) => {
                  // Permitir seleccionar cualquier paquete independientemente del saldo
                  const canSelect = true;
                  
                  return (
                <motion.div
                  key={bundle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={isMobile ? {} : { y: -3, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedBundle(bundle)}
                     className={`group relative cursor-pointer transition-all duration-300 ${
                       isMobile ? 'p-3 min-h-[110px] flex flex-col' : isModalMode ? 'p-4 min-h-[180px] flex flex-col' : 'p-8 min-h-[320px] flex flex-col'
                     } rounded-xl border-2 ${
                       selectedBundle?.id === bundle.id 
                         ? 'border-[#353FEF] shadow-lg bg-gradient-to-br from-[#353FEF]/8 to-white' + (isMobile || isModalMode ? '' : ' transform scale-[1.02] ring-4 ring-[#353FEF]/10')
                         : 'border-gray-200 hover:border-[#353FEF]/50 ' + (isMobile ? 'shadow-sm' : isModalMode ? 'hover:shadow-lg' : 'hover:shadow-xl hover:scale-[1.01]')
                         } ${bundle.isHighlighted ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-300' : bundle.isVariant ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-white border-purple-300' : 'bg-white'}`}
                  >
                                         {/* Enhanced Badges - Show different badges for variants and main packages */}
                        {bundle.isHighlighted ? (
                       <motion.div 
                             className={`absolute ${isMobile ? '-top-2 left-3 px-3 py-1 text-xs' : '-top-3 left-4 px-4 py-2 text-xs'} bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-full shadow-lg`}
                             initial={{ scale: 0, rotate: -10 }}
                             animate={{ scale: 1, rotate: 0 }}
                             transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 10 }}
                           >
                             {isMobile ? '⭐ POPULAR' : '⭐ MÁS POPULAR'}
                       </motion.div>
                     ) : null}
                     
                     {/* Header */}
                     <div className={`flex items-start justify-between ${isMobile ? 'mb-2' : isModalMode ? 'mb-3' : 'mb-6'}`}>
                       <div className="flex-1 pr-4">
                         <h3 className={`${isMobile ? 'text-base' : isModalMode ? 'text-lg' : 'text-xl'} font-bold text-gray-900 ${isMobile ? 'mb-0.5' : isModalMode ? 'mb-1' : 'mb-3'}`}>{bundle.name}</h3>
                         <p className={`${isMobile ? 'text-xs' : isModalMode ? 'text-sm' : 'text-base'} text-gray-600 ${isMobile ? 'leading-snug' : isModalMode ? 'leading-snug' : 'leading-relaxed'}`}>{bundle.description}</p>
                       </div>
                      
                      {/* Enhanced Selection Indicator */}
                      <motion.div 
                        className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                          selectedBundle?.id === bundle.id 
                            ? 'border-[#353FEF] bg-[#353FEF] shadow-lg' 
                            : 'border-gray-300 group-hover:border-[#353FEF]/50'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {selectedBundle?.id === bundle.id && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Check className="w-4 h-4 text-white" />
                        </motion.div>
                        )}
                      </motion.div>
                    </div>
                      
                                         {/* Enhanced Bundle Details */}
                     <div className={`${isMobile ? 'space-y-1.5 mb-2' : isModalMode ? 'space-y-1.5 mb-2 flex-1' : 'space-y-3 mb-4 flex-1'}`}>
                      <motion.div 
                         className={`flex items-center gap-3 text-sm text-gray-700 ${isMobile ? 'gap-2' : isModalMode ? 'gap-2' : 'gap-3'}`}
                         whileHover={isMobile || isModalMode ? {} : { x: 3 }}
                         transition={{ duration: 0.2 }}
                       >
                         <div className={`${isMobile ? 'w-6 h-6' : isModalMode ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-br from-[#353FEF]/10 to-[#4F46E5]/10 rounded-xl flex items-center justify-center`}>
                           <Clock className={`${isMobile ? 'w-2.5 h-2.5' : isModalMode ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-[#353FEF]`} />
                         </div>
                         <span className={`${isMobile ? 'text-xs' : isModalMode ? 'text-xs' : 'text-sm'} flex-1 font-medium`}>Duración: <span className="font-bold text-gray-900">{bundle.duration}</span></span>
                      </motion.div>
                      
                        <motion.div 
                         className={`flex items-center gap-3 text-sm text-gray-700 ${isMobile ? 'gap-2' : isModalMode ? 'gap-2' : 'gap-3'}`}
                         whileHover={isMobile || isModalMode ? {} : { x: 3 }}
                         transition={{ duration: 0.2 }}
                       >
                         <div className={`${isMobile ? 'w-6 h-6' : isModalMode ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center`}>
                           <Users className={`${isMobile ? 'w-2.5 h-2.5' : isModalMode ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-blue-600`} />
                         </div>
                         <span className={`${isMobile ? 'text-xs' : isModalMode ? 'text-xs' : 'text-sm'} flex-1 font-medium`}>Total spots: <span className="font-bold text-gray-900">{bundle.frequency.totalSpots}</span></span>
                      </motion.div>

                

                      {/* ML Insights Section - Hidden for user, only for internal use */}
                      {false && bundle.mlInsights && !isMobile && (
                        <motion.div 
                          className={`flex items-center gap-3 text-sm text-gray-700 ${isModalMode ? 'gap-2' : 'gap-4'}`}
                          whileHover={isModalMode ? {} : { x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`${isModalMode ? 'w-8 h-8' : 'w-12 h-12'} bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center`}>
                            <Sparkles className={`${isModalMode ? 'w-4 h-4' : 'w-6 h-6'} text-purple-600`} />
                          </div>
                          <div className="flex-1">
                            <div className={`${isModalMode ? 'text-xs' : 'text-base'} font-medium`}>
                              IA: <span className="font-bold text-purple-600">{bundle.mlInsights?.totalPurchases || 0} compras</span>
                            </div>
                            <div className={`${isModalMode ? 'text-xs' : 'text-sm'} text-gray-500 font-light`}>
                              {bundle.mlInsights?.recommendation || 'Datos no disponibles'}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                                         {/* Enhanced Price Section */}
                     <div className={`flex items-end justify-between mt-auto ${isModalMode ? 'pt-2 border-t border-gray-100' : 'pt-4 border-t border-gray-100'}`}>
                       <div className="flex-1">
                         <div className={`${isMobile ? 'text-2xl' : isModalMode ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 ${isModalMode ? 'mb-1' : 'mb-2'} break-words`}>
                           ${bundle.price.toLocaleString()}
                         </div>
                        
                              {/* Price is now exact from API - no ML modifications */}
                         {!isMobile && !isModalMode && (
                           <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span>Precio directo de la API</span>
                           </div>
                         )}
                       </div>
                      
                       {selectedBundle?.id === bundle.id && (
                        <motion.div 
                           className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white ${isMobile ? 'px-3 py-1' : 'px-4 py-2'} rounded-full text-xs font-semibold shadow-lg`}
                           initial={{ scale: 0, x: 20 }}
                           animate={{ scale: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                           ✓ {isMobile ? 'OK' : 'Seleccionado'}
                        </motion.div>
                      )}
                  </div>
                </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          </div>
          
          
          {/* Enhanced Continue Button - Solo mostrar si hay paquetes disponibles */}
          {bundlesWithMargin[selectedMode].length > 0 && (
            <motion.div
              data-purchase-section
              className={isMobile ? "mt-3 mb-4" : isModalMode ? "mt-4 mb-6" : "mt-8 mb-8"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: selectedBundle ? 1.02 : 1 }}
                whileTap={{ scale: selectedBundle ? 0.98 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size={isMobile ? "md" : "lg"}
                  className={`w-full transition-all duration-300 font-semibold ${isMobile ? 'h-12 text-sm' : isModalMode ? 'h-14 text-base' : 'h-16 text-lg'} ${
                    selectedBundle 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl border-0' 
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  }`}
                  onClick={handleContinueClick}
                  disabled={!selectedBundle}
                >
                  <div className="flex items-center justify-center gap-3">
                    {!selectedBundle 
                      ? "Selecciona un paquete" 
                      : (walletAvailable && walletBalance < (selectedBundle.price || 0))
                        ? <>
                            <Wallet className={`${isMobile ? 'w-4 h-4' : isModalMode ? 'w-5 h-5' : 'w-6 h-6'}`} />
                            <span>{isMobile ? 'Recargar saldo' : 'Recargar saldo'}</span>
                          </>
                        : <>
                            <ArrowRight className={`${isMobile ? 'w-4 h-4' : isModalMode ? 'w-5 h-5' : 'w-6 h-6'}`} />
                            <span>{isMobile ? 'Continuar' : 'Continuar con la compra'}</span>
                          </>
                    }
                  </div>
                </Button>
              </motion.div>
              
              {/* Save as Draft Button - Only show if bundle is selected and onSaveAsDraft is provided */}
              {selectedBundle && onSaveAsDraft && (
                                  <motion.div
                    className={isMobile ? "mt-3" : "mt-4"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      variant="outline"
                      size={isMobile || isModalMode ? "md" : "lg"}
                      className={`w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 ${
                        isMobile ? 'h-10 text-sm' : isModalMode ? 'h-12 text-sm' : 'h-14'
                      }`}
                      onClick={onSaveAsDraft}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className={`${isMobile ? 'w-4 h-4' : isModalMode ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {isEditingDraft ? (isMobile ? 'Actualizar' : 'Actualizar borrador') : (isMobile ? 'Guardar' : 'Guardar como borrador')}
                      </div>
                    </Button>
                  </motion.div>
              )}

              {/* Wallet Balance Indicator */}
              <motion.div
                className={isMobile ? "mt-3" : "mt-4"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <WalletBalanceIndicator 
                  requiredAmount={selectedBundle?.price || 0}
                  compact={isMobile || isModalMode}
                />
              </motion.div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* TimePurchaseModal for moments */}
      <TimePurchaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        screen={screen}
        purchaseType="momentos"
        selectedBundle={selectedBundle}
        onComplete={handleModalComplete}
      />

      {/* Floating Action Button - Solo visible cuando hay scroll y bundle seleccionado */}
      <AnimatePresence>
        {showFloatingButton && selectedBundle && bundlesWithMargin[selectedMode].length > 0 && !isModalMode && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 shadow-2xl"
          >
            <motion.button
              onClick={() => {
                // Scroll suave al botón de compra principal
                const purchaseSection = document.querySelector('[data-purchase-section]');
                if (purchaseSection) {
                  purchaseSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  handleContinueClick();
                }
              }}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 min-w-[200px]"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex flex-col items-start">
                  <span className="text-xs opacity-90">
                    {selectedBundle.name}
                  </span>
                  <span className="text-lg font-bold">
                    ${selectedBundle.price.toLocaleString()}
                  </span>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {(walletAvailable && walletBalance < (selectedBundle.price || 0)) ? (
                    <Wallet className="w-5 h-5" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseOptions; 