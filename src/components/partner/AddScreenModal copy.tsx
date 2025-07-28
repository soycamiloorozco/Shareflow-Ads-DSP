import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, MapPin, Monitor, Clock, Calendar, DollarSign,
  Users, Star, Eye, Info, Settings, Bot, TrendingUp,
  Sparkles, Check, Loader2, Search, AlertCircle, Network,
  Plus, Wifi, Activity, Smartphone, Zap, Package, Timer,
  Shield, ChevronRight, ChevronDown, ArrowRight, Building,
  Camera, Layers, Target, BarChart3, Lightbulb, CheckCircle2,
  Package2, Signal, WifiOff, Globe, EyeOff, User, CheckCircle,
  Download, Copy, Key, RefreshCw, Laptop, Tablet, HardDrive,
  HelpCircle, ChevronLeft
} from 'lucide-react';
import { Card } from '../Card';
import LocationInput from './LocationInput';

interface AddScreenModalProps {
  onClose: () => void;
  onSave: (screenData: any) => void;
}

interface LocationSuggestion {
  id: string;
  description: string;
  coordinates: { lat: number; lng: number };
  city?: string;
  state?: string;
  businessTypes?: string[];
  averageFootTraffic?: number;
  demographicScore?: number;
}

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  priceRange: { min: number; max: number };
}

interface LocationInsights {
  audienceProfile: {
    primaryDemographic: string;
    ageRange: string;
    income: string;
    interests: string[];
  };
  businessDensity: {
    total: number;
    types: { [key: string]: number };
    highRated: number;
  };
  competitorAnalysis: {
    nearbyScreens: number;
    averagePrice: number;
    marketGap: boolean;
  };
  revenueOpportunity: {
    score: number;
    potential: string;
    reasoning: string[];
  };
}

const SMART_CATEGORIES = [
  {
    id: 'outdoor-premium',
    name: 'Premium Exterior',
    description: 'Billboards y espectaculares de alto impacto',
    icon: '🌆',
    environment: 'outdoor',
    priceRange: { min: 50000, max: 200000 },
    keywords: ['billboard', 'espectacular', 'autopista', 'avenida'],
    demographics: ['alto-trafico', 'vehicular']
  },
  {
    id: 'outdoor-urban',
    name: 'Mobiliario Urbano',
    description: 'MUPIs y elementos a nivel de calle',
    icon: '🚏',
    environment: 'outdoor',
    priceRange: { min: 15000, max: 60000 },
    keywords: ['mupi', 'parada', 'calle', 'acera'],
    demographics: ['peatonal', 'urbano']
  },
  {
    id: 'indoor-retail',
    name: 'Retail y Comercio',
    description: 'Centros comerciales, tiendas y supermercados',
    icon: '🏬',
    environment: 'indoor',
    priceRange: { min: 20000, max: 80000 },
    keywords: ['centro comercial', 'mall', 'tienda', 'supermercado'],
    demographics: ['shoppers', 'familias']
  },
  {
    id: 'indoor-transport',
    name: 'Transporte y Movilidad',
    description: 'Aeropuertos, estaciones y terminales',
    icon: '✈️',
    environment: 'indoor',
    priceRange: { min: 30000, max: 120000 },
    keywords: ['aeropuerto', 'estacion', 'terminal', 'metro'],
    demographics: ['viajeros', 'commuters']
  },
  {
    id: 'indoor-hospitality',
    name: 'Entretenimiento y Hospitalidad',
    description: 'Hoteles, restaurantes, cines y centros de entretenimiento',
    icon: '🎬',
    environment: 'indoor',
    priceRange: { min: 18000, max: 70000 },
    keywords: ['hotel', 'restaurante', 'cine', 'entretenimiento'],
    demographics: ['turistas', 'familias', 'jovenes']
  },
  {
    id: 'indoor-professional',
    name: 'Espacios Profesionales',
    description: 'Oficinas, bancos, clínicas y espacios corporativos',
    icon: '🏛️',
    environment: 'indoor',
    priceRange: { min: 25000, max: 90000 },
    keywords: ['oficina', 'banco', 'clinica', 'corporativo'],
    demographics: ['profesionales', 'ejecutivos']
  }
];

// Tooltip Component
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs ${positionClasses[position]}`}
          >
            <div className="relative z-10">{content}</div>
            <div className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
              position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -ml-1' :
              'right-full top-1/2 transform -translate-y-1/2 -mr-1'
            }`}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AddScreenModal({ onClose, onSave }: AddScreenModalProps) {
  // 🆕 Wizard state - 7 steps total
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const totalSteps = 7;
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Location and AI insights
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [locationInsights, setLocationInsights] = useState<LocationInsights | null>(null);
  const [isAnalyzingLocation, setIsAnalyzingLocation] = useState(false);
  
  // Smart category suggestions
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Shareflow Screen activation states
  const [activationCode, setActivationCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activationError, setActivationError] = useState('');

  // Broadsign CMS integration states
  const [broadsignConfig, setBroadsignConfig] = useState({
    serverUrl: '',
    apiKey: '',
    username: '',
    password: '',
    domain: '',
    isConnecting: false,
    isConnected: false,
    connectionError: '',
    availableScreens: [] as any[]
  });

  // LatinAd CMS integration states
  const [latinadConfig, setLatinadConfig] = useState({
    email: '',
    password: '',
    isConnecting: false,
    isConnected: false,
    connectionError: '',
    availableScreens: [] as any[],
    accountPlan: 'free' as 'free' | 'pro'
  });

  // 🆕 Photos state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // 🆕 Terms acceptance for final step
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Form data with ScreenConfig structure compatible with Broadsign
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    referenceName: '',
    location: '',
    category: '',
    environment: 'indoor' as 'indoor' | 'outdoor',
    coordinates: { lat: 6.2476, lng: -75.5658 },
    description: '',
    
    // 🆕 Photos array - will store File objects during creation, URLs after save
    photos: [] as (File | string)[],
    
    // 🆕 BROADSIGN COMPATIBLE - Venue Information
    venue: {
      type: '', // Will be set from selected category's venueType
      businessDensity: 0,
      nearbyPOIs: [] as string[],
      demographics: {
        age: '',
        income: '',
        primaryAudience: [] as string[]
      },
      environment: 'Indoor', // Indoor/Outdoor - matches Broadsign format
      dailyTraffic: 0
    },
    
    // Specs
    specs: {
      width: 1920,
      height: 1080,
      resolution: 'Full HD (1920x1080)',
      brightness: '5000 nits'
    },
    operatingHours: {
      start: '06:00',
      end: '22:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    },
    adConfiguration: {
      standardAdDuration: 15, // segundos por anuncio estándar
      loopDuration: 300, // duración total del loop en segundos (5 minutos)
      transitionTime: 2 // tiempo de transición entre anuncios
    },
    
    // Connection type
    connectionType: 'manual' as 'shareflow-screen' | 'manual',
    
    // 🆕 BROADSIGN ENHANCED DATA
    // Location Enhanced Data
    locationData: {
      postalCode: '',
      exactCoordinates: { lat: 0, lng: 0 },
      locationCode: '',
      timezone: 'America/Bogota',
      venue: {
        type: '',
        businessDensity: 0
      }
    },
    
    // Audience & Performance Data
    audienceData: {
      // Demographic breakdown
      demographics: {
        totalImpressions: 0,
        malePercentage: 50,
        femalePercentage: 50,
        ageBreakdown: {
          '12-17': 8,
          '18-24': 15,
          '25-34': 25,
          '35-44': 22,
          '45-54': 18,
          '55-64': 8,
          '65+': 4
        }
      },
      // Performance metrics
      performance: {
        avgFillRate: 0, // Porcentaje de ocupación promedio
        availabilityRate: 100, // Porcentaje de disponibilidad
        impressionMultiplier: 1.0, // Multiplicador de impresiones
        avgDwellTime: 30, // Tiempo promedio de visualización en segundos
        peakHours: ['12:00-14:00', '18:00-20:00'] // Horas pico
      },
      // Audience sources for tracking
      dataSources: [] as string[]
    },
    
    // Technical Enhanced Data
    technicalData: {
      displayType: 'led', // led, lcd, projection, etc.
      frameConfiguration: {
        totalFrames: 1,
        sellableFrames: 1,
        frameLayout: 'fullscreen' // fullscreen, split, multi-zone
      },
      networkStatus: 'online' as 'online' | 'offline' | 'maintenance',
      lastSyncTime: null as Date | null,
      playerInfo: {
        model: '',
        version: '',
        capabilities: [] as string[]
      }
    },
    
    // Commercial Enhanced Data
    commercialData: {
      // Dynamic pricing based on performance
      dynamicPricing: {
        enabled: false,
        basePriceMultiplier: 1.0,
        demandAdjustment: 1.0,
        seasonalAdjustment: 1.0
      },
      // Historical performance
      historicalMetrics: {
        avgMonthlyImpressions: 0,
        avgConversionRate: 0,
        topPerformingCategories: [] as string[],
        revenuePerImpression: 0
      },
      // Booking constraints
      bookingRules: {
        maxConcurrentCampaigns: 5,
        minBookingDuration: 60, // minutos
        maxBookingDuration: 43200, // 30 días en minutos
        allowOverbooking: false
      }
    },
    
    // Pricing configuration (enhanced) - Multiple package variants per duration
    automatedPricing: false,
    minPrice: 15000,
    maxPrice: 80000,
    packages: {
      moments: {
        enabled: true,
        price: 25000,
        spots: 1,
        duration: '15 segundos',
        reach: 1500,
        variants: [
          {
            id: 'moments-standard',
            name: 'Momento Estándar',
            minDuration: 10,
            maxDuration: 60,
            frequency: '1/min',
            price: 25000,
            enabled: true
          }
        ]
      },
      hourly: {
        enabled: true,
        price: 25000,
        spots: 8,
        duration: '1 hora',
        reach: 1800,
        variants: [
          {
            id: 'hourly-1min',
            name: '1 vez por minuto',
            frequency: '1/min',
            spotsPerHour: 60,
            price: 45000,
            enabled: true
          },
          {
            id: 'hourly-2min',
            name: '1 vez cada 2 minutos',
            frequency: '1/2min',
            spotsPerHour: 30,
            price: 35000,
            enabled: false
          },
          {
            id: 'hourly-5min',
            name: '1 vez cada 5 minutos',
            frequency: '1/5min',
            spotsPerHour: 12,
            price: 25000,
            enabled: false
          },
          {
            id: 'hourly-10min',
            name: '1 vez cada 10 minutos',
            frequency: '1/10min',
            spotsPerHour: 6,
            price: 18000,
            enabled: false
          }
        ]
      },
      daily: {
        enabled: true,
        price: 45000,
        spots: 180,
        duration: '1 día',
        reach: 12000,
        variants: [
          {
            id: 'daily-1min',
            name: '1 vez por minuto (todo el día)',
            frequency: '1/min',
            spotsPerDay: 960, // 16 horas * 60 minutos
            price: 180000,
            enabled: true
          },
          {
            id: 'daily-2min',
            name: '1 vez cada 2 minutos',
            frequency: '1/2min',
            spotsPerDay: 480,
            price: 120000,
            enabled: false
          },
          {
            id: 'daily-5min',
            name: '1 vez cada 5 minutos',
            frequency: '1/5min',
            spotsPerDay: 192,
            price: 80000,
            enabled: false
          },
          {
            id: 'daily-10min',
            name: '1 vez cada 10 minutos',
            frequency: '1/10min',
            spotsPerDay: 96,
            price: 45000,
            enabled: false
          },
          {
            id: 'daily-30min',
            name: '1 vez cada 30 minutos',
            frequency: '1/30min',
            spotsPerDay: 32,
            price: 25000,
            enabled: false
          }
        ]
      },
      weekly: {
        enabled: true,
        price: 280000,
        spots: 1260,
        duration: '1 semana',
        reach: 75000,
        variants: [
          {
            id: 'weekly-1min',
            name: '1 vez por minuto (toda la semana)',
            frequency: '1/min',
            spotsPerWeek: 6720, // 7 días * 16 horas * 60 minutos
            price: 980000,
            enabled: false
          },
          {
            id: 'weekly-5min',
            name: '1 vez cada 5 minutos',
            frequency: '1/5min',
            spotsPerWeek: 1344,
            price: 450000,
            enabled: true
          },
          {
            id: 'weekly-10min',
            name: '1 vez cada 10 minutos',
            frequency: '1/10min',
            spotsPerWeek: 672,
            price: 280000,
            enabled: false
          },
          {
            id: 'weekly-30min',
            name: '1 vez cada 30 minutos',
            frequency: '1/30min',
            spotsPerWeek: 224,
            price: 150000,
            enabled: false
          }
        ]
      },
      monthly: {
        enabled: true,
        price: 3200000,
        spots: 5400,
        duration: '1 mes',
        reach: 250000,
        variants: [
          {
            id: 'monthly-5min',
            name: '1 vez cada 5 minutos',
            frequency: '1/5min',
            spotsPerMonth: 5760, // 30 días * 16 horas * 12 spots/hora
            price: 1800000,
            enabled: true
          },
          {
            id: 'monthly-10min',
            name: '1 vez cada 10 minutos',
            frequency: '1/10min',
            spotsPerMonth: 2880,
            price: 1200000,
            enabled: false
          },
          {
            id: 'monthly-30min',
            name: '1 vez cada 30 minutos',
            frequency: '1/30min',
            spotsPerMonth: 960,
            price: 650000,
            enabled: false
          },
          {
            id: 'monthly-1hour',
            name: '1 vez por hora',
            frequency: '1/hour',
            spotsPerMonth: 480,
            price: 350000,
            enabled: false
          }
        ]
      }
    },
    
    // Visibility
    isListed: true,
    
    // Contact info
    contactEmail: '',
    contactPhone: '',
    contactWhatsapp: '',
    
    // Enhanced data enrichment
    audienceInsights: {
      primaryDemographic: '',
      ageRange: '',
      interests: [],
      spendingPower: ''
    },
    competitorAnalysis: {
      nearbyScreens: 0,
      averagePrice: 0,
      marketGap: false
    },
    
    // Contact information
    contactName: '',
    
    // 🆕 Additional properties for enhanced UI
    resolution: '1920x1080',
    orientation: 'landscape',
    acceptTerms: true
  });

  // 🆕 Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Información Básica
        return !!(formData.name && formData.location && selectedLocation);
      case 2: // Conexión
        return true; // Connection type is always set
      case 3: // Configuración Técnica
        return !!(formData.specs.width && formData.specs.height);
      case 4: // Paquetes y Precios
        return Object.values(formData.packages).some(pkg => pkg.enabled);
      case 5: // Datos Enriquecidos
        return true; // Optional step
      case 6: // Fotos
        return true; // Photos are optional
      case 7: // Crear Pantalla
        return acceptTerms;
      default:
        return false;
    }
  };

  // 🆕 Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  // 🆕 Step titles for wizard
  const stepTitles = [
    'Información Básica',
    'Conexión', 
    'Configuración Técnica',
    'Paquetes y Precios',
    'Datos Enriquecidos',
    'Fotos de la Pantalla',
    'Crear Pantalla'
  ];

  const updatePackage = (packageType: keyof typeof formData.packages, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          [field]: value
        }
      }
    }));
  };

  // 🆕 Function to update package variants
  const updatePackageVariant = (packageType: keyof typeof formData.packages, variantId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          variants: prev.packages[packageType].variants?.map(variant => 
            variant.id === variantId 
              ? { ...variant, [field]: value }
              : variant
          ) || []
        }
      }
    }));
  };

  // 🆕 Function to add new variant to a package
  const addPackageVariant = (packageType: keyof typeof formData.packages) => {
    const newVariant = {
      id: `${packageType}-custom-${Date.now()}`,
      name: 'Nueva variante',
      frequency: '1/5min',
      price: 25000,
      enabled: false,
      ...(packageType === 'hourly' && { spotsPerHour: 12 }),
      ...(packageType === 'daily' && { spotsPerDay: 192 }),
      ...(packageType === 'weekly' && { spotsPerWeek: 1344 }),
      ...(packageType === 'monthly' && { spotsPerMonth: 5760 }),
      ...(packageType === 'moments' && { minDuration: 10, maxDuration: 60 })
    };

    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          variants: [...(prev.packages[packageType].variants || []), newVariant]
        }
      }
    }));
  };

  // 🆕 Function to remove a variant
  const removePackageVariant = (packageType: keyof typeof formData.packages, variantId: string) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          variants: prev.packages[packageType].variants?.filter(variant => variant.id !== variantId) || []
        }
      }
    }));
  };

  // Effect to disable moments when connection type is not Shareflow Screen
  useEffect(() => {
    if (formData.connectionType !== 'shareflow-screen' && formData.packages.moments.enabled) {
      updatePackage('moments', 'enabled', false);
    }
  }, [formData.connectionType]);

  // Update package spots based on calculated inventory
  useEffect(() => {
    const inventory = calculateDailyInventory();
    
    // Update package spots based on calculated inventory
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        hourly: {
          ...prev.packages.hourly,
          spots: Math.floor(inventory.spotsPerDay / Math.floor(inventory.dailyHours)) || 12
        },
        daily: {
          ...prev.packages.daily,
          spots: inventory.spotsPerDay
        },
        weekly: {
          ...prev.packages.weekly,
          spots: inventory.spotsPerWeek
        },
        monthly: {
          ...prev.packages.monthly,
          spots: Math.round(inventory.spotsPerMonth)
        }
      }
    }));
  }, [formData.operatingHours, formData.adConfiguration]);

  // Generate activation code when Shareflow Screen is selected
  useEffect(() => {
    if (formData.connectionType === 'shareflow-screen' && !activationCode) {
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code.substring(0, 4) + '-' + code.substring(4);
      };
      setActivationCode(generateCode());
      setIsActivated(false);
      setUserInputCode('');
      setActivationError('');
    }
  }, [formData.connectionType]);

  // Handle activation code verification
  const handleActivation = async () => {
    if (userInputCode.replace('-', '').length !== 8) {
      setActivationError('El código debe tener 8 caracteres');
      return;
    }

    if (userInputCode.toUpperCase() !== activationCode.toUpperCase()) {
      setActivationError('Código incorrecto. Verifica el código en tu aplicación.');
      return;
    }

    setIsActivating(true);
    setActivationError('');

    // Simulate activation process
    setTimeout(() => {
      setIsActivating(false);
      setIsActivated(true);
    }, 3000);
  };

  // Copy activation code to clipboard
  const copyActivationCode = async () => {
    try {
      await navigator.clipboard.writeText(activationCode);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Broadsign CMS connection functions
  const connectToBroadsign = async () => {
    setBroadsignConfig(prev => ({ ...prev, isConnecting: true, connectionError: '' }));

    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection and screen discovery
      const mockScreens = [
        { id: 'BS001', name: 'Mall Principal - Entrada Norte', status: 'online', resolution: '1920x1080' },
        { id: 'BS002', name: 'Mall Principal - Food Court', status: 'online', resolution: '1920x1080' },
        { id: 'BS003', name: 'Estación Metro - Andén A', status: 'online', resolution: '1366x768' },
        { id: 'BS004', name: 'Centro Comercial - Piso 2', status: 'offline', resolution: '1920x1080' }
      ];

      setBroadsignConfig(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        availableScreens: mockScreens
      }));
    } catch (error) {
      setBroadsignConfig(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'No se pudo conectar con Broadsign. Verifica tus credenciales.'
      }));
    }
  };

  const testBroadsignConnection = async () => {
    setBroadsignConfig(prev => ({ ...prev, isConnecting: true, connectionError: '' }));

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBroadsignConfig(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: ''
      }));
      
      // Show success message briefly
      setTimeout(() => {
        setBroadsignConfig(prev => ({ ...prev, connectionError: 'Conexión exitosa' }));
        setTimeout(() => {
          setBroadsignConfig(prev => ({ ...prev, connectionError: '' }));
        }, 2000);
      }, 100);
    } catch (error) {
      setBroadsignConfig(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'Error de conexión. Verifica los datos.'
      }));
    }
  };

  // LatinAd CMS connection functions
  const connectToLatinad = async () => {
    setLatinadConfig(prev => ({ ...prev, isConnecting: true, connectionError: '' }));

    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection and screen discovery
      const mockScreens = [
        { id: 'LA001', name: 'Mall Plaza Norte - Hall Principal', status: 'online', resolution: '1920x1080', plan: 'free' },
        { id: 'LA002', name: 'Terminal Bus - Sala Espera', status: 'online', resolution: '1366x768', plan: 'free' },
        { id: 'LA003', name: 'Centro Comercial Andino - L2', status: 'online', resolution: '1920x1080', plan: 'pro' },
        { id: 'LA004', name: 'Aeropuerto El Dorado - Sala Abordaje', status: 'offline', resolution: '3840x2160', plan: 'pro' },
        { id: 'LA005', name: 'Universidad Central - Cafetería', status: 'online', resolution: '1920x1080', plan: 'free' }
      ];

      // Determine account plan based on number of screens
      const accountPlan = mockScreens.filter(s => s.plan === 'pro').length > 0 ? 'pro' : 'free';

      setLatinadConfig(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        availableScreens: mockScreens,
        accountPlan
      }));
    } catch (error) {
      setLatinadConfig(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'No se pudo conectar con LatinAd. Verifica tus credenciales.'
      }));
    }
  };

  const testLatinadConnection = async () => {
    setLatinadConfig(prev => ({ ...prev, isConnecting: true, connectionError: '' }));

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLatinadConfig(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: ''
      }));
      
      // Show success message briefly
      setTimeout(() => {
        setLatinadConfig(prev => ({ ...prev, connectionError: 'Conexión exitosa' }));
        setTimeout(() => {
          setLatinadConfig(prev => ({ ...prev, connectionError: '' }));
        }, 2000);
      }, 100);
    } catch (error) {
      setLatinadConfig(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'Error de conexión. Verifica los datos.'
      }));
    }
  };

  // Calculate daily inventory based on operating hours and ad configuration
  const calculateDailyInventory = useCallback(() => {
    const { start, end, daysActive } = formData.operatingHours;
    const { standardAdDuration, loopDuration, transitionTime } = formData.adConfiguration;
    
    // Calculate daily operating hours
    const startHour = parseInt(start.split(':')[0]) + parseInt(start.split(':')[1]) / 60;
    const endHour = parseInt(end.split(':')[0]) + parseInt(end.split(':')[1]) / 60;
    const dailyHours = endHour - startHour;
    
    // Calculate available seconds per day
    const dailySeconds = dailyHours * 3600;
    
    // Calculate how many complete loops fit in a day
    const loopsPerDay = Math.floor(dailySeconds / loopDuration);
    
    // Calculate spots per loop (excluding transition time)
    const effectiveLoopTime = loopDuration - (transitionTime * 2); // transitions at start and end
    const spotsPerLoop = Math.floor(effectiveLoopTime / (standardAdDuration + transitionTime));
    
    // Total spots available per day
    const spotsPerDay = loopsPerDay * spotsPerLoop;
    
    // Calculate weekly and monthly inventory
    const activeDaysPerWeek = daysActive.length;
    const spotsPerWeek = spotsPerDay * activeDaysPerWeek;
    const spotsPerMonth = spotsPerDay * activeDaysPerWeek * 4.33; // average weeks per month
    
    return {
      dailyHours: Math.round(dailyHours * 10) / 10,
      dailySeconds,
      loopsPerDay,
      spotsPerLoop,
      spotsPerDay,
      spotsPerWeek: Math.round(spotsPerWeek),
      spotsPerMonth: Math.round(spotsPerMonth),
      activeDaysPerWeek,
      effectiveAdTime: standardAdDuration
    };
  }, [formData.operatingHours, formData.adConfiguration]);

  // Calculate revenue potential
  const calculateRevenuePotential = useCallback(() => {
    const inventory = calculateDailyInventory();
    const { packages } = formData;
    
    // Calculate potential for each package type
    const potentials = {
      moments: {
        available: packages.moments.enabled ? inventory.spotsPerDay : 0,
        pricePerSpot: packages.moments.price,
        dailyRevenue: packages.moments.enabled ? inventory.spotsPerDay * packages.moments.price : 0
      },
      hourly: {
        available: packages.hourly.enabled ? Math.floor(inventory.dailyHours) : 0,
        pricePerHour: packages.hourly.price,
        dailyRevenue: packages.hourly.enabled ? Math.floor(inventory.dailyHours) * packages.hourly.price : 0
      },
      daily: {
        available: packages.daily.enabled ? 1 : 0,
        pricePerDay: packages.daily.price,
        dailyRevenue: packages.daily.enabled ? packages.daily.price : 0
      }
    };
    
    const totalDailyPotential = Object.values(potentials).reduce((sum, p) => sum + p.dailyRevenue, 0);
    
    return {
      ...potentials,
      totalDailyPotential,
      monthlyPotential: totalDailyPotential * inventory.activeDaysPerWeek * 4.33
    };
  }, [formData.packages, calculateDailyInventory]);

  // Smart location analysis
  const analyzeLocation = useCallback(async (location: LocationSuggestion) => {
    setIsAnalyzingLocation(true);
    try {
      // Simulate faster AI analysis for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate insights based on location
      const insights: LocationInsights = {
        audienceProfile: {
          primaryDemographic: 'Profesionales jóvenes',
          ageRange: '25-45 años',
          income: 'Medio-Alto',
          interests: ['Tecnología', 'Gastronomía', 'Entretenimiento', 'Shopping']
        },
        businessDensity: {
          total: 156,
          types: {
            'Restaurantes': 45,
            'Oficinas': 32,
            'Retail': 28,
            'Servicios': 24,
            'Entretenimiento': 27
          },
          highRated: 89
        },
        competitorAnalysis: {
          nearbyScreens: 3,
          averagePrice: 35000,
          marketGap: true
        },
        revenueOpportunity: {
          score: 8.5,
          potential: 'Alto',
          reasoning: [
            'Zona de alto tráfico peatonal y vehicular',
            'Alta concentración de oficinas y restaurantes',
            'Demografía objetivo premium con poder adquisitivo',
            'Baja saturación de pantallas digitales'
          ]
        }
      };
      
      setLocationInsights(insights);
      
      // Generate smart category suggestions
      const suggestions: CategorySuggestion[] = [
        {
          category: 'indoor-retail',
          confidence: 0.85,
          reasoning: 'Alto tráfico de shoppers y oficinistas',
          priceRange: { min: 30000, max: 75000 }
        },
        {
          category: 'indoor-professional',
          confidence: 0.72,
          reasoning: 'Zona corporativa con alto flujo de profesionales',
          priceRange: { min: 35000, max: 80000 }
        }
      ];
      
      setCategorySuggestions(suggestions);
      
    } catch (error) {
      console.error('Error analyzing location:', error);
    } finally {
      setIsAnalyzingLocation(false);
    }
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback((location: LocationSuggestion) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      location: location.description,
      coordinates: location.coordinates
    }));
    setLocationSuggestions([]);
    analyzeLocation(location);
  }, [analyzeLocation]);

  // Smart category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    const category = SMART_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;
    
    setSelectedCategory(categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      environment: category.environment as 'indoor' | 'outdoor',
      packages: {
        ...prev.packages,
        moments: {
          ...prev.packages.moments,
          price: Math.round((category.priceRange.min + category.priceRange.max) / 2)
        }
      }
    }));
  }, []);

  // Mock location search
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    
    setIsLoadingLocation(true);
    try {
      // Simulate faster API call for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockSuggestions: LocationSuggestion[] = [
        {
          id: '1',
          description: 'Centro Comercial Oviedo, Medellín, Antioquia',
          coordinates: { lat: 6.2476, lng: -75.5658 },
          city: 'Medellín',
          state: 'Antioquia',
          businessTypes: ['retail', 'food', 'entertainment'],
          averageFootTraffic: 15000,
          demographicScore: 8.5
        },
        {
          id: '2',
          description: 'El Poblado, Medellín, Antioquia',
          coordinates: { lat: 6.2088, lng: -75.5736 },
          city: 'Medellín',
          state: 'Antioquia',
          businessTypes: ['office', 'restaurant', 'retail'],
          averageFootTraffic: 12000,
          demographicScore: 9.2
        },
        {
          id: '3',
          description: 'Centro Comercial Santa Fe, Bogotá, Cundinamarca',
          coordinates: { lat: 4.6687, lng: -74.0563 },
          city: 'Bogotá',
          state: 'Cundinamarca',
          businessTypes: ['retail', 'food', 'entertainment'],
          averageFootTraffic: 25000,
          demographicScore: 9.0
        },
        {
          id: '4',
          description: 'Zona Rosa, Bogotá, Cundinamarca',
          coordinates: { lat: 4.6635, lng: -74.0654 },
          city: 'Bogotá',
          state: 'Cundinamarca',
          businessTypes: ['office', 'restaurant', 'retail'],
          averageFootTraffic: 18000,
          demographicScore: 8.8
        },
        {
          id: '5',
          description: 'Aeropuerto José María Córdova, Rionegro, Antioquia',
          coordinates: { lat: 6.1645, lng: -75.4233 },
          city: 'Rionegro',
          state: 'Antioquia',
          businessTypes: ['transport', 'retail', 'food'],
          averageFootTraffic: 30000,
          demographicScore: 9.5
        }
      ].filter(loc => 
        loc.description.toLowerCase().includes(query.toLowerCase()) ||
        loc.city?.toLowerCase().includes(query.toLowerCase())
      );
      
      setLocationSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const handleLocationChange = (address: string, coordinates?: { lat: number; lng: number }) => {
    if (coordinates) {
      // Si tenemos coordenadas, significa que se seleccionó una ubicación de la lista
      const locationSuggestion: LocationSuggestion = {
        id: coordinates.lat.toString() + coordinates.lng.toString(),
        description: address,
        coordinates: coordinates,
        city: address.split(',')[1]?.trim(),
        state: address.split(',')[2]?.trim(),
        businessTypes: [],
        averageFootTraffic: 0,
        demographicScore: 0
      };
      console.log({ locationSuggestion })
      handleLocationSelect(locationSuggestion);
    } else {
      // Si no hay coordenadas, solo actualizamos la dirección
      setFormData(prev => ({
        ...prev,
        location: address
      }));
    }
  }

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Dónde está tu pantalla?</h3>
        <p className="text-gray-600">Con IA analizaremos la ubicación para maximizar tus ingresos</p>
      </div>

      {/* Location Search */}
      <div className="relative">
        <div className="relative">
          <LocationInput
            value={formData.location}
            onChange={handleLocationChange}
            placeholder="Escribe la dirección de tu pantalla..."
          />
        </div>

        {/* Location Suggestions */}
        {locationSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
            {locationSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleLocationSelect(suggestion)}
                className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {suggestion.description.split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {suggestion.description}
                    </p>
                    {suggestion.averageFootTraffic && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          👥 {suggestion.averageFootTraffic.toLocaleString()} visitantes/día
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          ⭐ Score: {suggestion.demographicScore}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Location with AI Analysis */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Ubicación Seleccionada</h4>
              <p className="text-gray-700 mb-3">{selectedLocation.description}</p>
              
              {isAnalyzingLocation ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analizando ubicación con IA...</span>
                </div>
              ) : locationInsights ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">Análisis completado</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-gray-700">Potencial de Ingresos</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">{locationInsights.revenueOpportunity.potential}</p>
                      <p className="text-xs text-gray-600">Score: {locationInsights.revenueOpportunity.score}/10</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium text-gray-700">Densidad Comercial</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{locationInsights.businessDensity.total}</p>
                      <p className="text-xs text-gray-600">negocios cercanos</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}

      {/* Name Inputs */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Nombre público de la pantalla
                </span>
                <Tooltip content="Este es el nombre que verán los anunciantes en el marketplace. Debe ser descriptivo e incluir la ubicación para facilitar la identificación.">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Pantalla Centro Comercial Oviedo"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </label>

            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Nombre de referencia (interno)
                </span>
                <Tooltip content="Nombre corto para tu uso interno. Te ayudará a identificar rápidamente esta pantalla en tus reportes y configuraciones.">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <input
                type="text"
                value={formData.referenceName}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceName: e.target.value }))}
                placeholder="Ej: Oviedo-P1, Mall-Entrada-A"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - Solo para tu organización interna</p>
            </label>
          </div>
        </motion.div>
      )}

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-900">Completa los siguientes campos:</span>
          </div>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );

  const renderCategoryStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Qué tipo de pantalla es?</h3>
        <p className="text-gray-600">Basado en tu ubicación, estas son nuestras recomendaciones</p>
      </div>

      {/* AI Recommendations */}
      {categorySuggestions.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Recomendaciones IA</span>
          </div>
          
          <div className="space-y-3">
            {categorySuggestions.map((suggestion, index) => {
              const category = SMART_CATEGORIES.find(c => c.id === suggestion.category);
              if (!category) return null;
              
              return (
                <motion.button
                  key={suggestion.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleCategorySelect(suggestion.category)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCategory === suggestion.category
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-purple-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {Math.round(suggestion.confidence * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-600 font-medium">
                          ${suggestion.priceRange.min.toLocaleString()} - ${suggestion.priceRange.max.toLocaleString()} COP
                        </span>
                        <span className="text-gray-500">por momento</span>
                      </div>
                    </div>
                    {selectedCategory === suggestion.category && (
                      <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* All Categories */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Todas las categorías</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SMART_CATEGORIES.map((category) => {
            const isRecommended = categorySuggestions.some(s => s.category === category.id);
            
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect(category.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedCategory === category.id
                    ? 'border-purple-500 bg-purple-50'
                    : isRecommended
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      {isRecommended && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        category.environment === 'outdoor'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {category.environment === 'outdoor' ? '🌤️ Exterior' : '🏢 Interior'}
                      </span>
                      <span className="text-gray-500">
                        ${category.priceRange.min.toLocaleString()}-${category.priceRange.max.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {selectedCategory === category.id && (
                    <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderPackagesTab = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Paquetes de Publicidad</h3>
          <Tooltip content="Estos son los tipos de espacios publicitarios que puedes ofrecer. Puedes habilitar/deshabilitar cualquiera según tus necesidades y cambiar precios en cualquier momento.">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <p className="text-gray-600 mb-6">
          Configura qué tipos de paquetes publicitarios están disponibles para tu pantalla.
        </p>

        <div className="space-y-4">
          {[
            {
              key: 'moments',
              title: 'Momentos',
              description: 'Spots individuales para creadores de contenido y emprendedores',
              icon: Timer,
              color: 'purple',
              defaultPrice: 25000,
              unit: 'por spot',
              tooltip: 'Espacios de duración variable para creadores de contenido. Solo disponible con Shareflow Screen. Ideal para contenido creativo y promociones personales.'
            },
            {
              key: 'hourly',
              title: 'Por Horas',
              description: 'Espacios publicitarios por horas específicas',
              icon: Clock,
              color: 'blue',
              defaultPrice: 35000,
              unit: 'por hora',
              tooltip: 'Permite a los anunciantes reservar espacios por horas específicas. Perfecto para promociones puntuales o eventos en horarios determinados.'
            },
            {
              key: 'daily',
              title: 'Por Días',
              description: 'Paquetes de día completo',
              icon: Calendar,
              color: 'green',
              defaultPrice: 180000,
              unit: 'por día',
              tooltip: 'Paquetes de día completo con múltiples reproducciones. Ideal para campañas de mayor impacto y mejor relación costo-beneficio.'
            },
            {
              key: 'weekly',
              title: 'Por Semanas',
              description: 'Paquetes semanales con descuento',
              icon: Calendar,
              color: 'orange',
              defaultPrice: 950000,
              unit: 'por semana',
              tooltip: 'Paquetes semanales que ofrecen descuentos por volumen. Perfectos para campañas medianas con presencia constante.'
            },
            {
              key: 'monthly',
              title: 'Por Meses',
              description: 'Paquetes mensuales para campañas largas',
              icon: Package2,
              color: 'red',
              defaultPrice: 3200000,
              unit: 'por mes',
              tooltip: 'Paquetes mensuales con el mayor descuento. Ideales para campañas largas de branding y posicionamiento de marca.'
            }
          ].map((package_info) => {
            const pkg = formData.packages[package_info.key as keyof typeof formData.packages];
            const hasSpots = 'spots' in pkg && package_info.key !== 'moments';
            const pricePerSpot = hasSpots && pkg.spots > 0 ? pkg.price / pkg.spots : 0;
            const isMomentsDisabled = package_info.key === 'moments' && formData.connectionType !== 'shareflow-screen';
            
            return (
              <Card key={package_info.key} className={`${
                pkg.enabled ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              } ${isMomentsDisabled ? 'opacity-60' : ''}`}>
                <Card.Body className="p-4">
                  <div className="space-y-4">
                    {/* Header with title and toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-${package_info.color}-100 flex items-center justify-center`}>
                          <package_info.icon className={`w-6 h-6 text-${package_info.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{package_info.title}</h4>
                            <Tooltip content={package_info.tooltip}>
                              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                            </Tooltip>
                          </div>
                          <p className="text-sm text-gray-600">{package_info.description}</p>
                          {isMomentsDisabled && (
                            <div className="flex items-center gap-2 mt-2">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <p className="text-xs text-orange-600 font-medium">
                                Solo disponible con Shareflow Screen
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => !isMomentsDisabled && updatePackage(package_info.key as keyof typeof formData.packages, 'enabled', !pkg.enabled)}
                        disabled={isMomentsDisabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isMomentsDisabled 
                            ? 'bg-gray-200 cursor-not-allowed' 
                            : pkg.enabled 
                              ? 'bg-blue-600' 
                              : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pkg.enabled && !isMomentsDisabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Configuration fields when enabled */}
                    {pkg.enabled && !isMomentsDisabled && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                        {/* Package variants section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">
                              Variantes de {package_info.title}
                            </h5>
                            <button
                              onClick={() => addPackageVariant(package_info.key as keyof typeof formData.packages)}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar variante
                            </button>
                          </div>

                          <div className="space-y-3">
                            {pkg.variants?.map((variant: any) => (
                              <div key={variant.id} className={`border rounded-lg p-3 ${
                                variant.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updatePackageVariant(
                                        package_info.key as keyof typeof formData.packages, 
                                        variant.id, 
                                        'enabled', 
                                        !variant.enabled
                                      )}
                                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                        variant.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                      }`}
                                    >
                                      <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                          variant.enabled ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                      />
                                    </button>
                                    <span className="font-medium text-sm">{variant.name}</span>
                                  </div>
                                  
                                  {pkg.variants && pkg.variants.length > 1 && (
                                    <button
                                      onClick={() => removePackageVariant(
                                        package_info.key as keyof typeof formData.packages, 
                                        variant.id
                                      )}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                {variant.enabled && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Variant Name */}
                            <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Nombre de la variante
                              </label>
                                <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => updatePackageVariant(
                                          package_info.key as keyof typeof formData.packages,
                                          variant.id,
                                          'name',
                                          e.target.value
                                        )}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        placeholder="Ej: 1 vez cada 5 minutos"
                                />
                              </div>

                                    {/* Frequency for non-moments packages */}
                                    {package_info.key !== 'moments' && (
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Frecuencia
                                        </label>
                                        <select
                                          value={variant.frequency || '1/5min'}
                                          onChange={(e) => {
                                            const frequency = e.target.value;
                                            updatePackageVariant(
                                              package_info.key as keyof typeof formData.packages,
                                              variant.id,
                                              'frequency',
                                              frequency
                                            );
                                            
                                            // Auto-calculate spots based on frequency
                                            let spots = 0;
                                            const minutes = parseInt(frequency.split('/')[1].replace('min', '')) || 1;
                                            
                                            if (package_info.key === 'hourly') {
                                              spots = 60 / minutes;
                                            } else if (package_info.key === 'daily') {
                                              spots = (16 * 60) / minutes; // 16 horas activas
                                            } else if (package_info.key === 'weekly') {
                                              spots = (7 * 16 * 60) / minutes;
                                            } else if (package_info.key === 'monthly') {
                                              spots = (30 * 16 * 60) / minutes;
                                            }
                                            
                                            const spotsField = `spotsPer${package_info.key.charAt(0).toUpperCase() + package_info.key.slice(1, -2)}`;
                                            updatePackageVariant(
                                              package_info.key as keyof typeof formData.packages,
                                              variant.id,
                                              spotsField,
                                              Math.floor(spots)
                                            );
                                          }}
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        >
                                          <option value="1/min">1 vez por minuto</option>
                                          <option value="1/2min">1 vez cada 2 minutos</option>
                                          <option value="1/5min">1 vez cada 5 minutos</option>
                                          <option value="1/10min">1 vez cada 10 minutos</option>
                                          <option value="1/15min">1 vez cada 15 minutos</option>
                                          <option value="1/30min">1 vez cada 30 minutos</option>
                                          {package_info.key === 'monthly' && <option value="1/hour">1 vez por hora</option>}
                                        </select>
                            </div>
                                    )}

                            {/* Duration settings for moments */}
                            {package_info.key === 'moments' && (
                              <>
                                <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Duración mín. (seg)
                                  </label>
                                    <input
                                      type="number"
                                            value={variant.minDuration || 10}
                                            onChange={(e) => updatePackageVariant(
                                              package_info.key as keyof typeof formData.packages,
                                              variant.id,
                                              'minDuration',
                                              parseInt(e.target.value) || 10
                                            )}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                      min="5"
                                      max="300"
                                    />
                                  </div>
                                <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Duración máx. (seg)
                                  </label>
                                    <input
                                      type="number"
                                            value={variant.maxDuration || 60}
                                            onChange={(e) => updatePackageVariant(
                                              package_info.key as keyof typeof formData.packages,
                                              variant.id,
                                              'maxDuration',
                                              parseInt(e.target.value) || 60
                                            )}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                      min="5"
                                      max="300"
                                    />
                                </div>
                              </>
                            )}

                                    {/* Price */}
                              <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Precio
                                </label>
                                <div className="relative">
                                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                  <input
                                    type="number"
                                          value={variant.price}
                                          onChange={(e) => updatePackageVariant(
                                            package_info.key as keyof typeof formData.packages,
                                            variant.id,
                                            'price',
                                            parseInt(e.target.value) || 0
                                          )}
                                          className="pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 w-full"
                                          placeholder="25000"
                                  />
                                </div>
                              </div>
                              </div>
                            )}

                                {/* Spots display */}
                                {variant.enabled && package_info.key !== 'moments' && (
                                  <div className="mt-2 text-xs text-gray-600">
                                    <span className="font-medium">
                                      {variant.spotsPerHour && `${variant.spotsPerHour} spots por hora`}
                                      {variant.spotsPerDay && `${variant.spotsPerDay} spots por día`}
                                      {variant.spotsPerWeek && `${variant.spotsPerWeek} spots por semana`}
                                      {variant.spotsPerMonth && `${variant.spotsPerMonth} spots por mes`}
                            </span>
                                    {variant.price > 0 && (
                                      <span className="ml-2">
                                        • ${Math.round(variant.price / (
                                          variant.spotsPerHour || variant.spotsPerDay || variant.spotsPerWeek || variant.spotsPerMonth || 1
                                        )).toLocaleString()} por spot
                              </span>
                            )}
                                  </div>
                            )}
                              </div>
                            )) || []}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderEnhancedDataTab = () => (
    <div className="space-y-6">
      {/* Information banner for Shareflow Screen */}
      {formData.connectionType === 'shareflow-screen' && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">🚀 Shareflow Screen - Datos Automáticos</h3>
              <p className="text-sm text-blue-800 mb-3">
                Al usar Shareflow Screen, muchos datos se obtienen y actualizan automáticamente gracias al hardware integrado y la conexión permanente con nuestra plataforma.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2 rounded border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Bot className="w-3 h-3 text-green-600" />
                    <span className="font-medium text-green-700">Fill Rate</span>
                  </div>
                  <p className="text-gray-600">Calculado automáticamente en tiempo real</p>
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-green-600" />
                    <span className="font-medium text-green-700">Ubicación GPS</span>
                  </div>
                  <p className="text-gray-600">Coordenadas precisas automáticas</p>
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-green-600" />
                    <span className="font-medium text-green-700">Estado de Red</span>
                  </div>
                  <p className="text-gray-600">Monitoreo 24/7 automático</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audience Data Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Datos de Audiencia</h3>
            <p className="text-sm text-gray-600">Información demográfica y de performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demographics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Demografía</h4>
            
            <Tooltip content="Impresiones totales estimadas por día basadas en datos de tráfico y audiencia">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impresiones Diarias Estimadas
                </label>
                <input
                  type="number"
                  value={formData.audienceData.demographics.totalImpressions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    audienceData: {
                      ...prev.audienceData,
                      demographics: {
                        ...prev.audienceData.demographics,
                        totalImpressions: parseInt(e.target.value) || 0
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: 25000"
                />
              </div>
            </Tooltip>

            <div className="grid grid-cols-2 gap-3">
              <Tooltip content="Porcentaje de audiencia masculina">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">% Hombres</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.audienceData.demographics.malePercentage}
                    onChange={(e) => {
                      const malePercentage = parseInt(e.target.value) || 0;
                      setFormData(prev => ({
                        ...prev,
                        audienceData: {
                          ...prev.audienceData,
                          demographics: {
                            ...prev.audienceData.demographics,
                            malePercentage,
                            femalePercentage: 100 - malePercentage
                          }
                        }
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </Tooltip>

              <Tooltip content="Porcentaje de audiencia femenina (se calcula automáticamente)">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">% Mujeres</label>
                  <input
                    type="number"
                    value={formData.audienceData.demographics.femalePercentage}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </Tooltip>
            </div>

            {/* Age breakdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Distribución por Edad (%)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(formData.audienceData.demographics.ageBreakdown).map(([ageRange, percentage]) => (
                  <div key={ageRange} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">{ageRange} años:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        audienceData: {
                          ...prev.audienceData,
                          demographics: {
                            ...prev.audienceData.demographics,
                            ageBreakdown: {
                              ...prev.audienceData.demographics.ageBreakdown,
                              [ageRange]: parseInt(e.target.value) || 0
                            }
                          }
                        }
                      }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Métricas de Performance</h4>
            
            <Tooltip content={formData.connectionType === 'shareflow-screen' ? "Fill Rate manejado automáticamente por Shareflow Screen" : "Porcentaje promedio de ocupación de la pantalla (0-100%)"}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fill Rate Promedio (%)
                  {formData.connectionType === 'shareflow-screen' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Automático</span>
                  )}
                </label>
                {formData.connectionType === 'shareflow-screen' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>Calculado automáticamente por Shareflow Screen</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.audienceData.performance.avgFillRate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      audienceData: {
                        ...prev.audienceData,
                        performance: {
                          ...prev.audienceData.performance,
                          avgFillRate: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ej: 75"
                  />
                )}
              </div>
            </Tooltip>

            <Tooltip content="Multiplicador de impresiones por spot publicitario">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Multiplicador de Impresiones</label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={formData.audienceData.performance.impressionMultiplier}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    audienceData: {
                      ...prev.audienceData,
                      performance: {
                        ...prev.audienceData.performance,
                        impressionMultiplier: parseFloat(e.target.value) || 1.0
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: 2.5"
                />
              </div>
            </Tooltip>

            <Tooltip content="Tiempo promedio que las personas observan la pantalla (en segundos)">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dwell Time Promedio (seg)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={formData.audienceData.performance.avgDwellTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    audienceData: {
                      ...prev.audienceData,
                      performance: {
                        ...prev.audienceData.performance,
                        avgDwellTime: parseInt(e.target.value) || 30
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: 45"
                />
              </div>
            </Tooltip>

            <Tooltip content="Horarios donde la audiencia es más alta">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horas Pico</label>
                <div className="space-y-2">
                  {formData.audienceData.performance.peakHours.map((hour, index) => (
                    <input
                      key={index}
                      type="text"
                      value={hour}
                      onChange={(e) => {
                        const newPeakHours = [...formData.audienceData.performance.peakHours];
                        newPeakHours[index] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          audienceData: {
                            ...prev.audienceData,
                            performance: {
                              ...prev.audienceData.performance,
                              peakHours: newPeakHours
                            }
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="ej: 12:00-14:00"
                    />
                  ))}
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Technical Data Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Datos Técnicos Avanzados</h3>
            <p className="text-sm text-gray-600">Configuración técnica y del sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Tooltip content="Tipo de tecnología de display utilizada">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Display</label>
                <select
                  value={formData.technicalData.displayType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    technicalData: {
                      ...prev.technicalData,
                      displayType: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="led">LED</option>
                  <option value="lcd">LCD</option>
                  <option value="oled">OLED</option>
                  <option value="projection">Proyección</option>
                  <option value="e-ink">E-Ink</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </Tooltip>

            <Tooltip content="Configuración de marcos/zonas vendibles en la pantalla">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Configuración de Frames</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Total Frames</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.technicalData.frameConfiguration.totalFrames}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        technicalData: {
                          ...prev.technicalData,
                          frameConfiguration: {
                            ...prev.technicalData.frameConfiguration,
                            totalFrames: parseInt(e.target.value) || 1
                          }
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Frames Vendibles</label>
                    <input
                      type="number"
                      min="1"
                      max={formData.technicalData.frameConfiguration.totalFrames}
                      value={formData.technicalData.frameConfiguration.sellableFrames}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        technicalData: {
                          ...prev.technicalData,
                          frameConfiguration: {
                            ...prev.technicalData.frameConfiguration,
                            sellableFrames: parseInt(e.target.value) || 1
                          }
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </Tooltip>

            <Tooltip content={formData.connectionType === 'shareflow-screen' ? "Estado de red monitoreado automáticamente por Shareflow Screen" : "Estado actual de la conexión de red"}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de Red
                  {formData.connectionType === 'shareflow-screen' && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Monitoreado 24/7</span>
                  )}
                </label>
                {formData.connectionType === 'shareflow-screen' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 text-green-700 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Monitoreo automático 24/7 por Shareflow</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.technicalData.networkStatus === 'online' ? 'bg-green-500' : 
                      formData.technicalData.networkStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <select
                      value={formData.technicalData.networkStatus}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        technicalData: {
                          ...prev.technicalData,
                          networkStatus: e.target.value as 'online' | 'offline' | 'maintenance'
                        }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </div>
                )}
              </div>
            </Tooltip>
          </div>

          <div className="space-y-4">
            <Tooltip content="Información del reproductor/player asociado">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Información del Player</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Modelo del reproductor"
                    value={formData.technicalData.playerInfo.model}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      technicalData: {
                        ...prev.technicalData,
                        playerInfo: {
                          ...prev.technicalData.playerInfo,
                          model: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Versión del software"
                    value={formData.technicalData.playerInfo.version}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      technicalData: {
                        ...prev.technicalData,
                        playerInfo: {
                          ...prev.technicalData.playerInfo,
                          version: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Location Enhanced Data */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Datos de Ubicación Avanzados</h3>
            <p className="text-sm text-gray-600">Información geográfica y del entorno</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Tooltip content="Código postal de la ubicación exacta">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                <input
                  type="text"
                  value={formData.locationData.postalCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    locationData: {
                      ...prev.locationData,
                      postalCode: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: 110111"
                />
              </div>
            </Tooltip>

            <Tooltip content="Código de ubicación específico para sistemas internos">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código de Ubicación</label>
                <input
                  type="text"
                  value={formData.locationData.locationCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    locationData: {
                      ...prev.locationData,
                      locationCode: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: LOC-001-ZONA-A"
                />
              </div>
            </Tooltip>

            <Tooltip content="Zona horaria de la ubicación">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                <select
                  value={formData.locationData.timezone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    locationData: {
                      ...prev.locationData,
                      timezone: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="America/Bogota">Bogotá (GMT-5)</option>
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
            </Tooltip>
          </div>

          <div className="space-y-4">
            <Tooltip content="Tipo de venue donde se encuentra la pantalla">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Venue</label>
                <input
                  type="text"
                  value={formData.locationData.venue.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    locationData: {
                      ...prev.locationData,
                      venue: {
                        ...prev.locationData.venue,
                        type: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: Centro Comercial, Oficina, Transporte"
                />
              </div>
            </Tooltip>

            <Tooltip content="Densidad de negocios en el área (cantidad de establecimientos por km²)">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Densidad de Negocios</label>
                <input
                  type="number"
                  min="0"
                  value={formData.locationData.venue.businessDensity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    locationData: {
                      ...prev.locationData,
                      venue: {
                        ...prev.locationData.venue,
                        businessDensity: parseInt(e.target.value) || 0
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: 150"
                />
              </div>
            </Tooltip>

            <Tooltip content={formData.connectionType === 'shareflow-screen' ? "Coordenadas GPS obtenidas automáticamente por Shareflow Screen" : "Coordenadas GPS exactas de la pantalla"}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coordenadas Exactas
                  {formData.connectionType === 'shareflow-screen' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">GPS Automático</span>
                  )}
                </label>
                {formData.connectionType === 'shareflow-screen' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Ubicación GPS detectada automáticamente</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="Latitud"
                      value={formData.locationData.exactCoordinates.lat || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        locationData: {
                          ...prev.locationData,
                          exactCoordinates: {
                            ...prev.locationData.exactCoordinates,
                            lat: parseFloat(e.target.value) || 0
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="Longitud"
                      value={formData.locationData.exactCoordinates.lng || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        locationData: {
                          ...prev.locationData,
                          exactCoordinates: {
                            ...prev.locationData.exactCoordinates,
                            lng: parseFloat(e.target.value) || 0
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                )}
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventoryTab = () => {
    const inventory = calculateDailyInventory();
    const revenue = calculateRevenuePotential();
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Configuración de Inventario</h3>
          <p className="text-gray-600 mb-6">
            Configura los horarios de operación y la duración de los anuncios para calcular tu inventario disponible.
          </p>

          {/* Operating Hours */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Horarios de Operación
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={formData.operatingHours.start}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    operatingHours: { ...prev.operatingHours, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={formData.operatingHours.end}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    operatingHours: { ...prev.operatingHours, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Days Active */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días Activos
              </label>
              <div className="grid grid-cols-7 gap-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      const isActive = formData.operatingHours.daysActive.includes(day);
                      setFormData(prev => ({
                        ...prev,
                        operatingHours: {
                          ...prev.operatingHours,
                          daysActive: isActive 
                            ? prev.operatingHours.daysActive.filter(d => d !== day)
                            : [...prev.operatingHours.daysActive, day]
                        }
                      }));
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      formData.operatingHours.daysActive.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ad Configuration */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Timer className="w-5 h-5 text-purple-600" />
              Configuración de Anuncios
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración Estándar de Anuncio
                </label>
                <div className="relative">
                  <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.adConfiguration.standardAdDuration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      adConfiguration: { ...prev.adConfiguration, standardAdDuration: parseInt(e.target.value) || 15 }
                    }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    min="5"
                    max="60"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">segundos por anuncio</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración del Loop
                </label>
                <div className="relative">
                  <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.adConfiguration.loopDuration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      adConfiguration: { ...prev.adConfiguration, loopDuration: parseInt(e.target.value) || 300 }
                    }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    min="60"
                    max="1800"
                    step="30"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">segundos por ciclo completo</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Transición
                </label>
                <div className="relative">
                  <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.adConfiguration.transitionTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      adConfiguration: { ...prev.adConfiguration, transitionTime: parseInt(e.target.value) || 2 }
                    }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    min="0"
                    max="10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">segundos entre anuncios</p>
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumen de Inventario
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{inventory.dailyHours}h</div>
                <div className="text-sm text-blue-700">Horas diarias</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">{inventory.spotsPerDay}</div>
                <div className="text-sm text-purple-700">Spots por día</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{inventory.spotsPerWeek}</div>
                <div className="text-sm text-green-700">Spots por semana</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">{Math.round(inventory.spotsPerMonth)}</div>
                <div className="text-sm text-orange-700">Spots por mes</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-800">Loops por día:</span>
                  <span className="font-medium">{inventory.loopsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Spots por loop:</span>
                  <span className="font-medium">{inventory.spotsPerLoop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Días activos/semana:</span>
                  <span className="font-medium">{inventory.activeDaysPerWeek}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-800">Potencial diario máximo:</span>
                  <span className="font-medium">${revenue.totalDailyPotential.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Potencial mensual máximo:</span>
                  <span className="font-medium">${Math.round(revenue.monthlyPotential).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Ocupación objetivo:</span>
                  <span className="font-medium">70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConnectionTab = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Tipo de Conexión</h3>
          <Tooltip content="El tipo de conexión determina cómo tu pantalla se integrará con Shareflow y qué funcionalidades estarán disponibles. Puedes cambiar esto después si es necesario.">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <p className="text-gray-600 mb-6">
          Selecciona cómo se conectará tu pantalla a la plataforma Shareflow. Esto determinará qué funcionalidades estarán disponibles.
        </p>
        
        <div className="grid grid-cols-1 gap-6">
          {[
            {
              type: 'shareflow-screen',
              title: 'Shareflow Screen',
              description: 'Hardware dedicado con gestión automática y funcionalidades premium',
              icon: Wifi,
              tooltip: 'Opción más avanzada: incluye software especializado que automatiza todo el proceso. Ideal para maximizar ingresos con minimal esfuerzo.',
              features: [
                 'Momentos: spots individuales para creadores',
                 'Gestión automática de contenido',
                 'Actualizaciones en tiempo real',
                 'Monitoreo remoto 24/7',
                 'Análisis avanzado de audiencia'
               ],
              recommended: true
            },
            {
              type: 'manual',
              title: 'Gestión Manual',
              description: 'Administración manual de contenidos sin conexión automática',
              icon: WifiOff,
              tooltip: 'Opción básica: tú manejas todo manualmente. Ideal para comenzar o cuando prefieres control total sobre el contenido.',
              features: [
                'Control total manual',
                'Sin dependencias técnicas',
                'Gestión offline',
                'Configuración básica',
                'Paquetes por horas, días, semanas y meses'
              ]
            }
          ].map((option) => (
            <div
              key={option.type}
              className={`cursor-pointer transition-all p-6 rounded-xl border-2 relative ${
                formData.connectionType === option.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, connectionType: option.type as any }))}
            >
              {option.recommended && (
                <div className="absolute -top-3 left-4">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Recomendado
                  </span>
                </div>
              )}

              
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  formData.connectionType === option.type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-blue-600'
                }`}>
                  <option.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg">{option.title}</h4>
                    <Tooltip content={option.tooltip}>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                    {formData.connectionType === option.type && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-gray-700">Características incluidas:</h5>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            option.type === 'shareflow-screen' && feature.includes('Momentos') 
                              ? 'bg-purple-500' 
                              : 'bg-blue-500'
                          }`} />
                          <span className={
                            option.type === 'shareflow-screen' && feature.includes('Momentos')
                              ? 'font-medium text-purple-700'
                              : ''
                          }>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
                 {/* Shareflow Screen Activation Section */}
         {formData.connectionType === 'shareflow-screen' && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl"
           >
             <div className="space-y-6">
               {/* Download Section */}
               <div>
                 <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                   <Download className="w-5 h-5" />
                   Paso 1: Descargar Shareflow Screen
                 </h4>
                 <p className="text-blue-800 mb-4 text-sm">
                   Descarga la aplicación Shareflow Screen en el dispositivo que controlará tu pantalla.
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   {[
                     { 
                       platform: 'Windows', 
                       icon: Laptop, 
                       url: '#',
                       size: '45.2 MB',
                       version: 'v2.1.5'
                     },
                     { 
                       platform: 'Android', 
                       icon: Tablet, 
                       url: '#',
                       size: '28.7 MB',
                       version: 'v2.1.3'
                     },
                     { 
                       platform: 'Linux', 
                       icon: HardDrive, 
                       url: '#',
                       size: '52.1 MB',
                       version: 'v2.1.5'
                     }
                   ].map((download) => (
                     <button
                       key={download.platform}
                       onClick={() => {/* Handle download */}}
                       className="flex items-center gap-3 p-4 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all group"
                     >
                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                         <download.icon className="w-5 h-5 text-blue-600" />
                       </div>
                       <div className="flex-1 text-left">
                         <div className="font-medium text-gray-900">{download.platform}</div>
                         <div className="text-xs text-gray-500">{download.size} • {download.version}</div>
                       </div>
                       <Download className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                     </button>
                   ))}
                 </div>
               </div>

               {/* Activation Code Section */}
               <div>
                 <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                   <Key className="w-5 h-5" />
                   Paso 2: Código de Activación
                 </h4>
                 <p className="text-blue-800 mb-4 text-sm">
                   Una vez instalada la aplicación, introduce este código para vincular tu pantalla.
                 </p>
                 
                 <div className="flex items-center gap-3 mb-4">
                   <div className="flex-1 p-4 bg-white border-2 border-dashed border-blue-300 rounded-xl">
                     <div className="text-center">
                       <div className="text-3xl font-mono font-bold text-blue-900 tracking-widest">
                         {activationCode}
                       </div>
                       <div className="text-xs text-blue-600 mt-1">Código de activación</div>
                     </div>
                   </div>
                   <button
                     onClick={copyActivationCode}
                     className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                     title="Copiar código"
                   >
                     <Copy className="w-5 h-5" />
                   </button>
                 </div>
               </div>

               {/* Activation Input Section */}
               <div>
                 <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                   <CheckCircle2 className="w-5 h-5" />
                   Paso 3: Activar Dispositivo
                 </h4>
                 <p className="text-blue-800 mb-4 text-sm">
                   Introduce el código que aparece en la aplicación de tu dispositivo para completar la activación.
                 </p>

                 {!isActivated ? (
                   <div className="space-y-4">
                     <div className="flex gap-3">
                       <div className="flex-1">
                         <input
                           type="text"
                           value={userInputCode}
                           onChange={(e) => {
                             const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                             let formatted = value;
                             if (value.length > 4) {
                               formatted = value.substring(0, 4) + '-' + value.substring(4, 8);
                             }
                             setUserInputCode(formatted);
                             setActivationError('');
                           }}
                           placeholder="XXXX-XXXX"
                           maxLength={9}
                           className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-lg tracking-widest"
                         />
                         {activationError && (
                           <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" />
                             {activationError}
                           </p>
                         )}
                       </div>
                       <button
                         onClick={handleActivation}
                         disabled={isActivating || userInputCode.length < 9}
                         className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                       >
                         {isActivating ? (
                           <>
                             <Loader2 className="w-5 h-5 animate-spin" />
                             Activando...
                           </>
                         ) : (
                           <>
                             <Zap className="w-5 h-5" />
                             Activar
                           </>
                         )}
                       </button>
                     </div>

                     {/* Activation Animation */}
                     {isActivating && (
                       <motion.div
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="flex flex-col items-center justify-center py-8"
                       >
                         <motion.div
                           animate={{ rotate: 360 }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"
                         />
                         <h5 className="font-medium text-blue-900 mb-2">Activando dispositivo...</h5>
                         <p className="text-blue-700 text-sm text-center">
                           Estableciendo conexión segura con tu pantalla
                         </p>
                         <div className="flex items-center gap-2 mt-4">
                           {[...Array(3)].map((_, i) => (
                             <motion.div
                               key={i}
                               animate={{ opacity: [0.3, 1, 0.3] }}
                               transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                               className="w-2 h-2 bg-blue-600 rounded-full"
                             />
                           ))}
                         </div>
                       </motion.div>
                     )}
                   </div>
                 ) : (
                   /* Success State */
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="text-center py-6"
                   >
                     <motion.div
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                       className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                     >
                       <CheckCircle className="w-10 h-10 text-green-600" />
                     </motion.div>
                     <h5 className="font-semibold text-green-900 mb-2">¡Dispositivo Activado!</h5>
                     <p className="text-green-700 text-sm">
                       Tu pantalla está ahora conectada y lista para recibir contenido.
                     </p>
                   </motion.div>
                 )}
               </div>
             </div>
           </motion.div>
         )}

                 {/* Broadsign CMS Configuration Section */}
        {false && formData.connectionType === 'broadsign' && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl"
           >
             <div className="space-y-6">
               {/* Header */}
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                   <Building className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-green-900 text-lg">Conexión con Broadsign CMS</h4>
                   <p className="text-green-700 text-sm">Conecta tu sistema Broadsign existente para sincronizar automáticamente tu inventario</p>
                 </div>
               </div>

               {!broadsignConfig.isConnected ? (
                 <div className="space-y-4">
                   {/* Connection Form */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <label className="block text-sm font-medium text-green-900">
                           URL del Servidor
                         </label>
                         <Tooltip content="La dirección de tu servidor Broadsign Control (ej: https://tu-servidor.broadsign.com)">
                           <HelpCircle className="w-4 h-4 text-green-600 cursor-help" />
                         </Tooltip>
                       </div>
                       <input
                         type="url"
                         value={broadsignConfig.serverUrl}
                         onChange={(e) => setBroadsignConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                         placeholder="https://tu-servidor.broadsign.com"
                         className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       />
                     </div>

                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <label className="block text-sm font-medium text-green-900">
                           Dominio
                         </label>
                         <Tooltip content="El dominio configurado en tu instalación de Broadsign">
                           <HelpCircle className="w-4 h-4 text-green-600 cursor-help" />
                         </Tooltip>
                       </div>
                       <input
                         type="text"
                         value={broadsignConfig.domain}
                         onChange={(e) => setBroadsignConfig(prev => ({ ...prev, domain: e.target.value }))}
                         placeholder="tu-dominio"
                         className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       />
                     </div>

                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <label className="block text-sm font-medium text-green-900">
                           Usuario
                         </label>
                         <Tooltip content="Tu usuario de Broadsign con permisos de API">
                           <HelpCircle className="w-4 h-4 text-green-600 cursor-help" />
                         </Tooltip>
                       </div>
                       <input
                         type="text"
                         value={broadsignConfig.username}
                         onChange={(e) => setBroadsignConfig(prev => ({ ...prev, username: e.target.value }))}
                         placeholder="usuario"
                         className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       />
                     </div>

                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <label className="block text-sm font-medium text-green-900">
                           Contraseña / API Key
                         </label>
                         <Tooltip content="Tu contraseña o API key para acceder a Broadsign Control">
                           <HelpCircle className="w-4 h-4 text-green-600 cursor-help" />
                         </Tooltip>
                       </div>
                       <input
                         type="password"
                         value={broadsignConfig.password}
                         onChange={(e) => setBroadsignConfig(prev => ({ ...prev, password: e.target.value }))}
                         placeholder="••••••••"
                         className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       />
                     </div>
                   </div>

                   {/* Connection Error */}
                   {broadsignConfig.connectionError && broadsignConfig.connectionError !== 'Conexión exitosa' && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                       <p className="text-red-600 text-sm flex items-center gap-2">
                         <AlertCircle className="w-4 h-4" />
                         {broadsignConfig.connectionError}
                       </p>
                     </div>
                   )}

                   {/* Success Message */}
                   {broadsignConfig.connectionError === 'Conexión exitosa' && (
                     <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                       <p className="text-green-600 text-sm flex items-center gap-2">
                         <CheckCircle className="w-4 h-4" />
                         {broadsignConfig.connectionError}
                       </p>
                     </div>
                   )}

                   {/* Action Buttons */}
                   <div className="flex gap-3">
                     <button
                       onClick={testBroadsignConnection}
                       disabled={broadsignConfig.isConnecting || !broadsignConfig.serverUrl || !broadsignConfig.username}
                       className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                     >
                       {broadsignConfig.isConnecting ? (
                         <>
                           <Loader2 className="w-4 h-4 animate-spin" />
                           Probando...
                         </>
                       ) : (
                         <>
                           <Wifi className="w-4 h-4" />
                           Probar Conexión
                         </>
                       )}
                     </button>

                     <button
                       onClick={connectToBroadsign}
                       disabled={broadsignConfig.isConnecting || !broadsignConfig.serverUrl || !broadsignConfig.username || !broadsignConfig.password}
                       className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                     >
                       {broadsignConfig.isConnecting ? (
                         <>
                           <Loader2 className="w-4 h-4 animate-spin" />
                           Conectando...
                         </>
                       ) : (
                         <>
                           <Network className="w-4 h-4" />
                           Conectar y Sincronizar
                         </>
                       )}
                     </button>
                   </div>

                   {/* Connection Animation */}
                   {broadsignConfig.isConnecting && (
                     <motion.div
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="flex flex-col items-center justify-center py-6"
                     >
                       <motion.div
                         animate={{ rotate: 360 }}
                         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mb-4"
                       />
                       <h5 className="font-medium text-green-900 mb-2">Conectando con Broadsign...</h5>
                       <p className="text-green-700 text-sm text-center">
                         Verificando credenciales y descubriendo pantallas
                       </p>
                     </motion.div>
                   )}
                 </div>
               ) : (
                 /* Connected State - Screen Selection */
                 <div className="space-y-4">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="flex items-center gap-3 p-4 bg-green-100 rounded-lg"
                   >
                     <CheckCircle className="w-6 h-6 text-green-600" />
                     <div>
                       <h5 className="font-semibold text-green-900">¡Conectado exitosamente!</h5>
                       <p className="text-green-700 text-sm">Se encontraron {broadsignConfig.availableScreens.length} pantallas disponibles</p>
                     </div>
                   </motion.div>

                   {/* Screen Selection */}
                   <div>
                     <h5 className="font-medium text-green-900 mb-3">Selecciona las pantallas que quieres vender en Shareflow:</h5>
                     <div className="space-y-2 max-h-60 overflow-y-auto">
                       {broadsignConfig.availableScreens.map((screen) => (
                         <div
                           key={screen.id}
                           className="flex items-center gap-3 p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                         >
                           <input
                             type="checkbox"
                             id={screen.id}
                             className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                           />
                           <label htmlFor={screen.id} className="flex-1 cursor-pointer">
                             <div className="flex items-center justify-between">
                               <div>
                                 <div className="font-medium text-gray-900">{screen.name}</div>
                                 <div className="text-sm text-gray-500">{screen.resolution}</div>
                               </div>
                               <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                 screen.status === 'online' 
                                   ? 'bg-green-100 text-green-700' 
                                   : 'bg-red-100 text-red-700'
                               }`}>
                                 {screen.status === 'online' ? 'En línea' : 'Fuera de línea'}
                               </div>
                             </div>
                           </label>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Sync Options */}
                   <div className="p-4 bg-white border border-green-200 rounded-lg">
                     <h5 className="font-medium text-green-900 mb-3">Opciones de Sincronización</h5>
                     <div className="space-y-2">
                       <label className="flex items-center gap-2">
                         <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                         <span className="text-sm text-gray-700">Sincronización automática de inventario en tiempo real</span>
                       </label>
                       <label className="flex items-center gap-2">
                         <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                         <span className="text-sm text-gray-700">Booking automático de campañas aprobadas</span>
                       </label>
                       <label className="flex items-center gap-2">
                         <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                         <span className="text-sm text-gray-700">Notificaciones de cambios en Broadsign</span>
                       </label>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </motion.div>
                    )}

                 {/* LatinAd CMS Configuration Section */}
        {false && formData.connectionType === 'latinad' && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl"
           >
             <div className="space-y-6">
               {/* Header */}
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                   <Globe className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-purple-900 text-lg">Conexión con LatinAd CMS</h4>
                   <p className="text-purple-700 text-sm">Conecta tu cuenta LatinAd para sincronizar pantallas y acceder al ecosistema programático</p>
                 </div>
               </div>

               {!latinadConfig.isConnected ? (
                 <div className="space-y-4">
                   {/* Connection Form */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <label className="block text-sm font-medium text-purple-900">
                           Email de LatinAd
                         </label>
                         <Tooltip content="El email que usas para acceder a cms.latinad.com">
                           <HelpCircle className="w-4 h-4 text-purple-600 cursor-help" />
                         </Tooltip>
                       </div>
                       <input
                         type="email"
                         value={latinadConfig.email}
                         onChange={(e) => setLatinadConfig(prev => ({ ...prev, email: e.target.value }))}
                         placeholder="tu-email@empresa.com"
                         className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       />
                     </div>

                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <label className="block text-sm font-medium text-purple-900">
                           Contraseña
                         </label>
                         <Tooltip content="Tu contraseña de acceso a la plataforma LatinAd CMS">
                           <HelpCircle className="w-4 h-4 text-purple-600 cursor-help" />
                         </Tooltip>
                       </div>
                       <input
                         type="password"
                         value={latinadConfig.password}
                         onChange={(e) => setLatinadConfig(prev => ({ ...prev, password: e.target.value }))}
                         placeholder="••••••••"
                         className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       />
                     </div>
                   </div>

                   {/* Info Box */}
                   <div className="p-4 bg-purple-100 border border-purple-200 rounded-lg">
                     <div className="flex items-start gap-3">
                       <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                       <div>
                         <h5 className="font-medium text-purple-900 mb-1">¿No tienes cuenta en LatinAd?</h5>
                         <p className="text-sm text-purple-800 mb-2">
                           Regístrate gratis en <strong>cms.latinad.com</strong> y obtén hasta 10 pantallas sin costo.
                         </p>
                         <ul className="text-sm text-purple-700 space-y-1">
                           <li>• Plan gratuito para siempre</li>
                           <li>• Reproductores multiplataforma</li>
                           <li>• Conexión al ecosistema programático</li>
                         </ul>
                       </div>
                     </div>
                   </div>

                   {/* Connection Error */}
                   {latinadConfig.connectionError && latinadConfig.connectionError !== 'Conexión exitosa' && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                       <p className="text-red-600 text-sm flex items-center gap-2">
                         <AlertCircle className="w-4 h-4" />
                         {latinadConfig.connectionError}
                       </p>
                     </div>
                   )}

                   {/* Success Message */}
                   {latinadConfig.connectionError === 'Conexión exitosa' && (
                     <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                       <p className="text-green-600 text-sm flex items-center gap-2">
                         <CheckCircle className="w-4 h-4" />
                         {latinadConfig.connectionError}
                       </p>
                     </div>
                   )}

                   {/* Action Buttons */}
                   <div className="flex gap-3">
                     <button
                       onClick={testLatinadConnection}
                       disabled={latinadConfig.isConnecting || !latinadConfig.email}
                       className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                     >
                       {latinadConfig.isConnecting ? (
                         <>
                           <Loader2 className="w-4 h-4 animate-spin" />
                           Probando...
                         </>
                       ) : (
                         <>
                           <Wifi className="w-4 h-4" />
                           Probar Conexión
                         </>
                       )}
                     </button>

                     <button
                       onClick={connectToLatinad}
                       disabled={latinadConfig.isConnecting || !latinadConfig.email || !latinadConfig.password}
                       className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                     >
                       {latinadConfig.isConnecting ? (
                         <>
                           <Loader2 className="w-4 h-4 animate-spin" />
                           Conectando...
                         </>
                       ) : (
                         <>
                           <Network className="w-4 h-4" />
                           Conectar y Sincronizar
                         </>
                       )}
                     </button>
                   </div>

                   {/* Connection Animation */}
                   {latinadConfig.isConnecting && (
                     <motion.div
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="flex flex-col items-center justify-center py-6"
                     >
                       <motion.div
                         animate={{ rotate: 360 }}
                         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
                       />
                       <h5 className="font-medium text-purple-900 mb-2">Conectando con LatinAd...</h5>
                       <p className="text-purple-700 text-sm text-center">
                         Verificando credenciales y descubriendo pantallas
                       </p>
                     </motion.div>
                   )}
                 </div>
               ) : (
                 /* Connected State - Screen Selection */
                 <div className="space-y-4">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="flex items-center gap-3 p-4 bg-purple-100 rounded-lg"
                   >
                     <CheckCircle className="w-6 h-6 text-purple-600" />
                     <div>
                       <h5 className="font-semibold text-purple-900">¡Conectado exitosamente!</h5>
                       <p className="text-purple-700 text-sm">
                         Plan: <span className="font-medium capitalize">{latinadConfig.accountPlan}</span> • 
                         {latinadConfig.availableScreens.length} pantallas disponibles
                       </p>
                     </div>
                   </motion.div>

                   {/* Account Plan Info */}
                   {latinadConfig.accountPlan === 'free' && (
                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                       <div className="flex items-start gap-3">
                         <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                         <div>
                           <h5 className="font-medium text-blue-900 mb-1">Plan Gratuito Activo</h5>
                           <p className="text-sm text-blue-800">
                             Tienes hasta 10 pantallas gratis. Para funcionalidades premium como anuncios inteligentes 
                             y sincronización de pantallas, considera actualizar a <strong>LatinAd PRO</strong>.
                           </p>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Screen Selection */}
                   <div>
                     <h5 className="font-medium text-purple-900 mb-3">Selecciona las pantallas que quieres vender en Shareflow:</h5>
                     <div className="space-y-2 max-h-60 overflow-y-auto">
                       {latinadConfig.availableScreens.map((screen) => (
                         <div
                           key={screen.id}
                           className="flex items-center gap-3 p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                         >
                           <input
                             type="checkbox"
                             id={screen.id}
                             className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                           />
                           <label htmlFor={screen.id} className="flex-1 cursor-pointer">
                             <div className="flex items-center justify-between">
                               <div>
                                 <div className="font-medium text-gray-900">{screen.name}</div>
                                 <div className="text-sm text-gray-500">{screen.resolution}</div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                   screen.status === 'online' 
                                     ? 'bg-green-100 text-green-700' 
                                     : 'bg-red-100 text-red-700'
                                 }`}>
                                   {screen.status === 'online' ? 'En línea' : 'Fuera de línea'}
                                 </div>
                                 <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                   screen.plan === 'pro' 
                                     ? 'bg-purple-100 text-purple-700' 
                                     : 'bg-gray-100 text-gray-700'
                                 }`}>
                                   {screen.plan === 'pro' ? 'PRO' : 'FREE'}
                                 </div>
                               </div>
                             </div>
                           </label>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Sync Options */}
                   <div className="p-4 bg-white border border-purple-200 rounded-lg">
                     <h5 className="font-medium text-purple-900 mb-3">Opciones de Sincronización</h5>
                     <div className="space-y-2">
                       <label className="flex items-center gap-2">
                         <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                         <span className="text-sm text-gray-700">Sincronización automática de reproductores</span>
                       </label>
                       <label className="flex items-center gap-2">
                         <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                         <span className="text-sm text-gray-700">Integración con ecosistema programático LatinAd</span>
                       </label>
                       <label className="flex items-center gap-2">
                         <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
                         <span className="text-sm text-gray-700">Reportería automática de reproducciones</span>
                       </label>
                       <label className="flex items-center gap-2">
                         <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
                         <span className="text-sm text-gray-700">Notificaciones de cambios en LatinAd</span>
                       </label>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </motion.div>
         )}

         {formData.connectionType === 'broadsign' && (
           <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
             <div className="flex items-start gap-3">
               <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
               <div>
                 <h4 className="font-medium text-blue-900 mb-1">
                   Integración Premium con Broadsign
                 </h4>
                 <p className="text-sm text-blue-800">
                   Con Broadsign CMS tendrás acceso completo a todas las funcionalidades de Shareflow, incluyendo <strong>Momentos</strong> 
                   para creadores de contenido, sincronización automática de inventario, y booking programático. Tu operación actual 
                   no cambiará - solo agregaremos una nueva fuente de ingresos.
                 </p>
               </div>
             </div>
           </div>
         )}

         {formData.connectionType === 'latinad' && (
           <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
             <div className="flex items-start gap-3">
               <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
               <div>
                 <h4 className="font-medium text-purple-900 mb-1">
                   Ecosistema Programático LatinAd
                 </h4>
                 <p className="text-sm text-purple-800">
                   Con LatinAd CMS accedes al ecosistema programático líder en Latinoamérica, incluyendo <strong>Momentos</strong> 
                   para creadores, conexión a múltiples DSPs, y reportería certificada. Aprovecha su plan gratuito y 
                   experiencia en la región para maximizar tus ventas.
                 </p>
               </div>
             </div>
           </div>
         )}

         {formData.connectionType !== 'shareflow-screen' && formData.connectionType !== 'broadsign' && formData.connectionType !== 'latinad' && (
           <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
             <div className="flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
               <div>
                 <h4 className="font-medium text-orange-900 mb-1">
                   Funcionalidad limitada
                 </h4>
                 <p className="text-sm text-orange-800">
                   Los <strong>Momentos</strong> (spots individuales para creadores de contenido y emprendedores) solo están disponibles 
                   con <strong>Shareflow Screen</strong>, <strong>Broadsign CMS</strong> y <strong>LatinAd CMS</strong>. Con otros tipos de conexión podrás usar los demás paquetes publicitarios.
                 </p>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Estrategia de Precios</h3>
            <Tooltip content="Elige entre precios automáticos optimizados por IA o configuración manual para tener control total sobre tus tarifas.">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Precio automático</span>
            <Tooltip content="Con precios automáticos, la IA ajusta las tarifas según demanda, competencia y horarios para maximizar tus ingresos.">
              <button
                onClick={() => setFormData(prev => ({ ...prev, automatedPricing: !prev.automatedPricing }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  formData.automatedPricing ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    formData.automatedPricing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </Tooltip>
          </div>
        </div>

        {formData.automatedPricing ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Precios Inteligentes con IA</h4>
                <p className="text-blue-800 mb-4">
                  Nuestro algoritmo ajusta automáticamente los precios basándose en demanda, ubicación, 
                  horarios pico y competencia para maximizar tus ingresos.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="block text-sm font-medium text-blue-900">
                        Precio Mínimo
                      </label>
                      <Tooltip content="El precio más bajo que la IA puede asignar. Asegúrate de que cubra tus costos operativos mínimos.">
                        <HelpCircle className="w-3 h-3 text-blue-600 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.minPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, minPrice: parseInt(e.target.value) }))}
                        className="pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        placeholder="15,000"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="block text-sm font-medium text-blue-900">
                        Precio Máximo
                      </label>
                      <Tooltip content="El precio más alto que la IA puede asignar. Úsalo para evitar que los precios suban demasiado en horarios pico.">
                        <HelpCircle className="w-3 h-3 text-blue-600 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.maxPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                        className="pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        placeholder="80,000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <User className="w-6 h-6 text-gray-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">Precios Manuales</h4>
                <p className="text-gray-600">
                  Configura manualmente los precios de cada paquete según tu estrategia comercial.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderVisibilityTab = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Visibilidad en Marketplace</h3>
          <Tooltip content="Decide si tu pantalla será visible públicamente en el marketplace para recibir reservas automáticas o si prefieres manejarla privadamente.">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        
        <div className="p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-semibold">Listar en Marketplace</h4>
                <p className="text-sm text-gray-600">
                  Permite que otros usuarios vean y reserven tu pantalla
                </p>
              </div>
            </div>
            <button
              onClick={() => setFormData(prev => ({ ...prev, isListed: !prev.isListed }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isListed ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isListed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.isListed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Tu pantalla aparecerá en el Marketplace y podrá recibir reservas automáticamente
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Tu pantalla no será visible públicamente. Solo tú podrás gestionarla directamente.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSpecsStep = () => {
    const selectedCat = SMART_CATEGORIES.find(c => c.id === selectedCategory);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Especificaciones técnicas</h3>
          <p className="text-gray-600">Define las características de tu pantalla</p>
        </div>

        {/* Quick Setup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dimensions */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Dimensiones</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (px)</label>
                <input
                  type="number"
                  value={formData.specs.width}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specs: { ...prev.specs, width: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alto (px)</label>
                <input
                  type="number"
                  value={formData.specs.height}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specs: { ...prev.specs, height: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              Orientación: {formData.specs.width > formData.specs.height ? 'Horizontal' : 
                          formData.specs.height > formData.specs.width ? 'Vertical' : 'Cuadrada'}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Fotos de la pantalla</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
              <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Sube fotos de tu pantalla</p>
              <p className="text-xs text-gray-500">Máximo 5 fotos</p>
              </label>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Especificaciones adicionales</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolución</label>
              <select
                value={formData.specs.resolution}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  specs: { ...prev.specs, resolution: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="HD">HD (1280x720)</option>
                <option value="FHD">Full HD (1920x1080)</option>
                <option value="4K">4K (3840x2160)</option>
                <option value="8K">8K (7680x4320)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brillo</label>
              <input
                type="text"
                value={formData.specs.brightness}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  specs: { ...prev.specs, brightness: e.target.value }
                }))}
                placeholder="Ej: 5000 nits"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración de spot</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="15">15 segundos</option>
                <option value="10">10 segundos</option>
                <option value="20">20 segundos</option>
                <option value="30">30 segundos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Horarios de operación</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de inicio</label>
              <input
                type="time"
                value={formData.operatingHours.start}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operatingHours: { ...prev.operatingHours, start: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de fin</label>
              <input
                type="time"
                value={formData.operatingHours.end}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operatingHours: { ...prev.operatingHours, end: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Días activos</label>
            <div className="flex flex-wrap gap-2">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operatingHours.daysActive.includes(day)}
                    onChange={(e) => {
                      const updatedDays = e.target.checked
                        ? [...formData.operatingHours.daysActive, day]
                        : formData.operatingHours.daysActive.filter(d => d !== day);
                      setFormData(prev => ({
                        ...prev,
                        operatingHours: { ...prev.operatingHours, daysActive: updatedDays }
                      }));
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Información de contacto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <input
                type="tel"
                value={formData.contactWhatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, contactWhatsapp: e.target.value }))}
                placeholder="+57 300 123 4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Revenue Estimation */}
        {selectedCat && locationInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 rounded-xl p-6 border border-green-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Estimación de ingresos</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${Math.round(selectedCat.priceRange.min * 1.2).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Precio recomendado por momento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ${Math.round(selectedCat.priceRange.min * 1.2 * 100).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Ingresos diarios estimados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${Math.round(selectedCat.priceRange.min * 1.2 * 100 * 30).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Ingresos mensuales estimados</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">Recomendaciones para maximizar ingresos:</p>
                  <ul className="text-gray-600 space-y-1">
                    {locationInsights.revenueOpportunity.reasoning.map((reason, index) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      // Convert photos to base64
      const photoPromises = photos.map(file => 
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );

      const photoBase64 = await Promise.all(photoPromises);
      const packages = formData.packages;
      

       const screenData = {
        id: Math.random().toString(36).substr(2, 9),
         publicName: formData.name,
        images: photoBase64,
        referenceName: formData.referenceName,
        address: formData.location,
        latitude: formData.coordinates.lat,
        longitude: formData.coordinates.lng,
        price: formData.packages.moments.price,
        estimatedDailyImpressions: formData.audienceData.demographics.totalImpressions,
        impressionMultiplier: formData.audienceData.performance.impressionMultiplier,
        coordinates: formData.coordinates,
        availability: true,
        connectionType: formData.connectionType,
        malePercentage: formData.audienceData.demographics.malePercentage,
        femalePercentage: formData.audienceData.demographics.femalePercentage,
        ageDistribution: {
          ageGroup12To17: formData.audienceData.demographics.ageBreakdown['12-17'],
          ageGroup18To24: formData.audienceData.demographics.ageBreakdown['18-24'],
          ageGroup25To34: formData.audienceData.demographics.ageBreakdown['25-34'],
          ageGroup35To44: formData.audienceData.demographics.ageBreakdown['35-44'],
          ageGroup45To54: formData.audienceData.demographics.ageBreakdown['45-54'],
          ageGroup55To64: formData.audienceData.demographics.ageBreakdown['55-64'],
          ageGroup65Plus: formData.audienceData.demographics.ageBreakdown['65+']
        },
        averageFillRate: formData.audienceData.performance.avgFillRate,
        averageDwellTime: formData.audienceData.performance.avgDwellTime,
        peakHours: formData.audienceData.performance.peakHours.join(','),
        displayType: formData.technicalData.displayType,
        totalFrames: formData.technicalData.frameConfiguration.totalFrames,
        sellableFrames: formData.technicalData.frameConfiguration.sellableFrames,
        networkStatus: formData.technicalData.networkStatus,
        playerModel: formData.technicalData.playerInfo.model,
        softwareVersion: formData.technicalData.playerInfo.version,
        postalCode: formData.locationData.postalCode,
        locationCode: formData.locationData.locationCode,
        timeZone: formData.locationData.timezone,
        venueType: formData.locationData.venue.type,
        businessDensity: formData.locationData.venue.businessDensity,
        operationStartTime: formData.operatingHours.start,
        operationEndTime: formData.operatingHours.end,
        standardAdDuration: formData.adConfiguration.standardAdDuration,
        loopDuration: formData.adConfiguration.loopDuration,
        transitionTime: formData.adConfiguration.transitionTime,
        automaticPricing: formData.automatedPricing,
        minimumPrice: formData.minPrice,
         maximumPrice: formData.maxPrice,
        package: packages,
        activeDays: formData.operatingHours.daysActive.map(day => {
          const dayMap: { [key: string]: number } = {
            'Lunes': 1,
            'Martes': 2,
            'Miércoles': 3,
            'Jueves': 4,
            'Viernes': 5,
            'Sábado': 6,
            'Domingo': 0
          };
          return { dayOfWeek: dayMap[day] };
        })
      };

      onSave(screenData);
      onClose();
    } catch (error) {
      console.error('Error al procesar las fotos:', error);
      setErrors(prev => ({
        ...prev,
        photos: 'Error al procesar las fotos'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 Photo handling functions
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (photos.length + files.length > 5) {
      alert('Máximo 5 fotos permitidas');
      return;
    }

    setIsUploadingPhotos(true);
    
    // Create preview URLs and store files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setPhotos(prev => [...prev, ...files]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploadingPhotos(false);
    }, 1000);
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(photoPreviews[index]);
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Rename existing render functions to match wizard steps
  const renderBasicStep = () => renderBasicTab();
  const renderConnectionStep = () => renderConnectionTab();
  const renderTechnicalStep = () => renderInventoryTab();
  const renderPackagesStep = () => renderPackagesTab();
  const renderEnhancedDataStep = () => renderEnhancedDataTab();

  // 🆕 New render function for photos step
  const renderPhotosStep = () => (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Fotos de tu Pantalla</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Sube hasta 5 fotos para mostrar tu pantalla a los anunciantes
        </p>
      </div>

      {/* Photo Upload Area */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {/* Upload Zone */}
          <div className="relative">
            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className={`block border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
                photos.length >= 5
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50'
              }`}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {photos.length >= 5 ? 'Máximo alcanzado' : 'Arrastra fotos aquí'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {photos.length >= 5 
                      ? 'Ya has subido el máximo de 5 fotos'
                      : `PNG, JPG hasta 10MB • ${5 - photos.length} fotos restantes`
                    }
                  </p>
                </div>
                {photos.length < 5 && (
                  <div className="inline-flex items-center px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Seleccionar archivos
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  Fotos subidas ({photos.length}/5)
                </h4>
                {isUploadingPhotos && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {photoPreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square"
                  >
                    <img
                      src={preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover rounded-2xl shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-colors" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Tips para mejores fotos</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Toma fotos desde diferentes ángulos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Incluye el contexto del entorno
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Asegúrate de que la pantalla sea visible
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Usa buena iluminación natural
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 🆕 New render function for create screen step
  const renderCreateScreenStep = () => (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">¡Casi listo!</h3>
        <p className="text-gray-600 max-w-lg mx-auto">
          Revisa toda la información de tu pantalla antes de crearla
        </p>
      </div>

      {/* Summary Cards */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Información Básica</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-gray-900">{formData.name || 'Sin especificar'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ubicación</p>
                <p className="text-gray-900">{selectedLocation?.description || 'Sin especificar'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Categoría</p>
                <p className="text-gray-900">{formData.category || 'Sin especificar'}</p>
              </div>
            </div>
          </motion.div>

          {/* Technical Configuration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Configuración Técnica</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Resolución</p>
                <p className="text-gray-900">{formData.resolution || 'Sin especificar'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Orientación</p>
                <p className="text-gray-900">{formData.orientation || 'Sin especificar'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Conexión</p>
                <p className="text-gray-900">
                  {formData.connectionType === 'manual' ? 'Manual' : 'Shareflow Screen'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pricing Configuration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Configuración de Precios</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Paquetes Activos</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(formData.packages).filter(([_, pkg]) => pkg.enabled).map(([key, pkg]) => (
                    <span key={key} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {key === 'moments' ? 'Momentos' : 
                       key === 'hourly' ? 'Por Horas' :
                       key === 'daily' ? 'Diario' :
                       key === 'weekly' ? 'Semanal' : 'Mensual'}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rango de Precios</p>
                <p className="text-gray-900">
                  ${formData.minPrice?.toLocaleString()} - ${formData.maxPrice?.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Photos Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-pink-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Fotos</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Fotos subidas</p>
                <p className="text-gray-900">{photos.length} de 5 fotos</p>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {photoPreviews.slice(0, 4).map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-12 object-cover rounded-lg"
                    />
                  ))}
                  {photos.length > 4 && (
                    <div className="w-full h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{photos.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Terms and Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-medium">Acepto los términos y condiciones</span>
                <br />
                Al crear esta pantalla, confirmo que tengo los permisos necesarios para operar en esta ubicación 
                y acepto las políticas de Shareflow para partners.
              </label>
            </div>
          </div>
        </motion.div>

        {/* Action Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Lista para crear
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Tu pantalla estará disponible para anunciantes una vez creada
          </p>
        </motion.div>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-900">Errores encontrados</h4>
          </div>
          <ul className="space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-sm text-red-700">
                • {error}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header with Progress */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Agregar Pantalla</h2>
                    <p className="text-white/80 text-sm">Paso {currentStep} de {totalSteps}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-white/80">
                  <span>Progreso</span>
                  <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-white to-white/90 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Step Indicators */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {[
                { num: 1, title: "Básico", icon: MapPin },
                { num: 2, title: "Conexión", icon: Wifi },
                { num: 3, title: "Técnico", icon: Settings },
                { num: 4, title: "Paquetes", icon: Package },
                { num: 5, title: "Datos", icon: BarChart3 },
                { num: 6, title: "Fotos", icon: Camera },
                { num: 7, title: "Crear", icon: CheckCircle }
              ].map(({ num, title, icon: Icon }) => (
                <div key={num} className="flex flex-col items-center min-w-0 flex-1">
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 ${
                      num === currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                        : completedSteps.includes(num)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    whileHover={{ scale: num <= currentStep ? 1.1 : 1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {completedSteps.includes(num) ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </motion.div>
                  <span className={`text-xs font-medium transition-colors ${
                    num === currentStep ? 'text-blue-600' : 
                    completedSteps.includes(num) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className="flex-1 overflow-y-auto">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-6"
            >
              {currentStep === 1 && renderBasicStep()}
              {currentStep === 2 && renderConnectionStep()}
              {currentStep === 3 && renderTechnicalStep()}
              {currentStep === 4 && renderPackagesStep()}
              {currentStep === 5 && renderEnhancedDataStep()}
              {currentStep === 6 && renderPhotosStep()}
              {currentStep === 7 && renderCreateScreenStep()}
            </motion.div>
          </div>

          {/* Enhanced Footer with Mobile-Optimized Navigation */}
          <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Mobile: Stack buttons vertically */}
              <div className="flex gap-3 sm:hidden">
                {currentStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToPreviousStep}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={currentStep === totalSteps ? handleSubmit : goToNextStep}
                  //disabled={isLoading || !validateStep(currentStep)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStep === totalSteps ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Crear Pantallas
                    </>
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden sm:flex sm:justify-between sm:w-full">
                {currentStep > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToPreviousStep}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </motion.button>
                ) : (
                  <div></div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={currentStep === totalSteps ? handleSubmit : goToNextStep}
                  // disabled={isLoading || !validateStep(currentStep)}
                   disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStep === totalSteps ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Crear Pantalla
                    </>
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Step validation feedback */}
            {!validateStep(currentStep) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-700">
                  Completa todos los campos requeridos para continuar
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}