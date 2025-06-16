import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Minus, MapPin, Building2, Monitor, Camera, 
  Clock, Users, DollarSign, Zap, Settings, ChevronDown,
  Car, ShoppingBag, Utensils, GraduationCap, Heart,
  Briefcase, Plane, Train, Bus, Fuel, Coffee, 
  Banknote, TreePine, Home, Landmark, Trophy, Search,
  Loader2, Building, HelpCircle, CheckCircle, Package,
  ChevronLeft, ChevronRight, AlertTriangle, Download, Smartphone, Globe,
  Copy, Check, Stethoscope, Sparkles, TrendingUp, AlertCircle, 
  Lightbulb, Upload, Target, Star, Wifi, Calendar, Info,
  Eye, Tag
} from 'lucide-react';
import { 
  VENUE_TAXONOMY, 
  VenueParentCategory, 
  VenueChildCategory, 
  VenueGrandChildCategory,
  VenueCategory,
  EnvironmentType, 
  DwellTime,
  VenueAIClassifier,
  VenueClassificationResult,
  VenueClassificationRequest
} from '../../types/venue-categories';
import { Card } from '../Card';
import LocationInput from './LocationInput';

// Local constants for missing exports
const PARENT_CATEGORY_ICONS: Record<VenueParentCategory, React.ComponentType<any>> = {
  transit: Car,
  retail: ShoppingBag,
  outdoor: TreePine,
  health_beauty: Heart,
  point_of_care: Stethoscope,
  education: GraduationCap,
  office_buildings: Building2,
  leisure: Trophy,
  government: Landmark,
  financial: Banknote,
  residential: Home
};

// Enhanced category display names in Spanish
const PARENT_CATEGORY_NAMES: Record<VenueParentCategory, string> = {
  transit: 'Transporte',
  retail: 'Comercio y Retail',
  outdoor: 'Publicidad Exterior',
  health_beauty: 'Salud y Belleza',
  point_of_care: 'Atención Médica',
  education: 'Educación',
  office_buildings: 'Edificios de Oficinas',
  leisure: 'Entretenimiento y Ocio',
  government: 'Instituciones Públicas',
  financial: 'Servicios Financieros',
  residential: 'Zonas Residenciales'
};

const CHILD_CATEGORY_NAMES: Record<VenueChildCategory, string> = {
  // Transit
  airports: 'Aeropuertos',
  buses: 'Transporte Público - Autobuses',
  taxi_rideshare_tv: 'Taxi/Uber - Pantalla Interior',
  taxi_rideshare_top: 'Taxi/Uber - Pantalla Superior',
  subway: 'Metro/Subterráneo',
  train_stations: 'Estaciones de Tren',
  
  // Retail
  mall: 'Centros Comerciales',
  convenience_stores: 'Tiendas de Conveniencia',
  fueling_stations: 'Estaciones de Combustible',
  pharmacies: 'Farmacias',
  
  // Outdoor
  billboards: 'Vallas Publicitarias',
  street_furniture: 'Mobiliario Urbano',
  transit_outdoor: 'Transporte - Exterior',
  
  // Health & Beauty
  gyms: 'Gimnasios',
  salons: 'Salones de Belleza',
  spas: 'Spas y Centros de Bienestar',
  
  // Point of Care
  hospitals: 'Hospitales',
  clinics: 'Clínicas Médicas',
  dental_offices: 'Consultorios Dentales',
  veterinary: 'Clínicas Veterinarias',
  
  // Education
  universities: 'Universidades',
  schools: 'Colegios y Escuelas',
  libraries: 'Bibliotecas',
  
  // Office Buildings
  corporate: 'Edificios Corporativos',
  coworking: 'Espacios de Coworking',
  
  // Leisure
  restaurants: 'Restaurantes',
  bars: 'Bares y Discotecas',
  casual_dining: 'Restaurantes Casuales',
  quick_service: 'Comida Rápida',
  
  // Government
  dmv: 'Oficinas de Tránsito',
  post_offices: 'Oficinas Postales',
  
  // Financial
  banks: 'Bancos',
  
  // Residential
  apartment_buildings: 'Edificios Residenciales',
  elevators: 'Ascensores'
};

// Audience types translations
const AUDIENCE_TYPE_LABELS: Record<string, string> = {
  families: 'Familias',
  shoppers: 'Compradores',
  young_adults: 'Jóvenes Adultos',
  professionals: 'Profesionales',
  commuters: 'Viajeros',
  travelers: 'Turistas',
  students: 'Estudiantes',
  patients: 'Pacientes',
  fitness_enthusiasts: 'Entusiastas del Fitness',
  beauty_conscious: 'Conscientes de la Belleza',
  health_focused: 'Enfocados en la Salud',
  diners: 'Comensales',
  nightlife: 'Vida Nocturna',
  business_people: 'Empresarios',
  residents: 'Residentes',
  general_public: 'Público General'
};

const GRANDCHILD_CATEGORY_NAMES: Record<VenueGrandChildCategory, string> = {
  // Transit: Airports
  arrival_hall: 'Sala de Llegadas',
  baggage_claim: 'Recogida de Equipaje',
  departures_hall: 'Sala de Salidas',
  food_court_airport: 'Patio de Comidas',
  gates: 'Puertas de Embarque',
  lounges: 'Salas VIP',
  shopping_area_airport: 'Zona Comercial',
  
  // Transit: Buses
  bus_inside: 'Interior del Autobús',
  bus_terminal: 'Terminal de Autobuses',
  bus_outside: 'Exterior del Autobús',
  
  // Transit: Subway
  subway_train: 'Interior del Metro',
  subway_platform: 'Andén del Metro',
  
  // Transit: Train Stations
  train: 'Interior del Tren',
  train_platform: 'Andén de la Estación',
  
  // Retail: Fueling Stations
  fuel_dispenser: 'Surtidores de Combustible',
  fueling_shop: 'Tienda de la Estación',
  
  // Retail: Grocery
  shop_entrance: 'Entrada de la Tienda',
  check_out: 'Área de Cajas',
  aisles: 'Pasillos de Productos',
  
  // Retail: Malls
  concourse: 'Pasillos o Corredor',
  food_court_mall: 'Patio de Comidas',
  spectacular_mall: 'Pantalla Espectacular',
  
  // Outdoor: Billboards
  roadside: 'Vía Principal',
  highway: 'Autopista',
  spectacular_outdoor: 'Pantalla Espectacular',
  
  // Health & Beauty: Gyms
  gym_lobby: 'Recepción del Gimnasio',
  fitness_equipment: 'Área de Equipos',
  
  // Health & Beauty: Salons
  unisex_salon: 'Salón Mixto',
  mens_salon: 'Barbería',
  womens_salon: 'Salón Femenino',
  
  // Education: Colleges and Universities
  residences: 'Residencias Estudiantiles',
  common_areas_edu: 'Áreas Comunes',
  athletic_facilities: 'Instalaciones Deportivas',
  
  // Office Buildings
  elevator_office: 'Ascensores',
  lobby_office: 'Lobby Principal',
  
  // Leisure: Recreational Locations
  theme_parks: 'Parques de Diversiones',
  museums_galleries: 'Museos y Galerías',
  concert_venues: 'Salas de Conciertos',
  
  // Leisure: Movie Theaters
  theater_lobby: 'Lobby del Cine',
  theater_food_court: 'Confitería',
  
  // Leisure: Sports Entertainment
  sport_arena: 'Estadios Deportivos',
  club_house: 'Casa Club',
  
  // Leisure: Hotels
  hotel_lobby: 'Lobby del Hotel',
  hotel_elevator: 'Ascensores del Hotel',
  hotel_room: 'Habitaciones',
  
  // Residential
  residential_lobby: 'Lobby del Edificio',
  residential_elevator: 'Ascensores del Edificio'
};

const ENVIRONMENT_LABELS = {
  'indoor_controlled': 'Interior Controlado',
  'indoor_semi_open': 'Interior Semi-Abierto',
  'outdoor_covered': 'Exterior Cubierto',
  'outdoor_exposed': 'Exterior Expuesto'
};

const DWELL_TIME_LABELS = {
  'very_short': 'Muy Corto (< 30 seg)',
  'short': 'Corto (30 seg - 2 min)',
  'medium': 'Medio (2 - 15 min)',
  'long': 'Largo (15 - 60 min)',
  'very_long': 'Muy Largo (> 60 min)'
};

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

// 🆕 Enhanced Category Suggestion with price range
interface EnhancedCategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  environment: 'indoor' | 'outdoor';
}

// 🆕 Venue Categories from new taxonomy system with enhanced data
const VENUE_CATEGORIES = Object.entries(VENUE_TAXONOMY).map(([key, category]) => {
  // Add price range based on venue type and environment
  const getPriceRange = (environment: string, dwellTime: string) => {
    const basePrice = environment.includes('outdoor') ? 40000 : 25000;
    const dwellMultiplier: Record<string, number> = {
      'very_short': 0.5,
      'short': 0.8,
      'medium': 1.0,
      'long': 1.3,
      'very_long': 1.6
    };
    const multiplier = dwellMultiplier[dwellTime] || 1.0;
    
    const min = Math.round(basePrice * multiplier * 0.7);
    const max = Math.round(basePrice * multiplier * 2.5);
    
    return { min, max };
  };

  // Generate display name from category data
  const generateDisplayName = (parent: string, child: string) => {
    const displayNames: Record<string, string> = {
      'retail_mall': 'Centro Comercial',
      'retail_supermarket': 'Supermercado',
      'retail_pharmacy': 'Farmacia',
      'retail_gas_station': 'Estación de Gasolina',
      'transit_airport': 'Aeropuerto',
      'transit_metro_station': 'Estación de Metro',
      'transit_bus_station': 'Terminal de Buses',
      'hospitality_hotel': 'Hotel',
      'hospitality_restaurant': 'Restaurante',
      'hospitality_cinema': 'Cine',
      'healthcare_hospital': 'Hospital',
      'healthcare_clinic': 'Clínica',
      'education_university': 'Universidad',
      'education_school': 'Colegio',
      'finance_bank': 'Banco',
      'outdoor_billboard': 'Valla Publicitaria',
      'outdoor_bus_stop': 'Parada de Bus'
    };
    return displayNames[key] || `${parent} - ${child}`;
  };

  return {
    id: key,
    name: generateDisplayName(category.parent, category.child),
    ...category,
    priceRange: getPriceRange(category.environment, category.dwellTime),
    environment: category.environment.includes('outdoor') ? 'outdoor' : 'indoor'
  };
});

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
  // 🆕 Enhanced state management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<'shareflow-screen' | 'manual' | null>(null);
  const [shareflowScreenData, setShareflowScreenData] = useState<any>(null);
  const [showManualCategorySelection, setShowManualCategorySelection] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Location and AI insights
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [locationInsights, setLocationInsights] = useState<LocationInsights | null>(null);
  const [isAnalyzingLocation, setIsAnalyzingLocation] = useState(false);
  
  // 🆕 AI Venue Classification
  const [venueClassifier] = useState(new VenueAIClassifier());
  const [isClassifyingVenue, setIsClassifyingVenue] = useState(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<VenueClassificationResult | null>(null);
  const [manualCategoryOverride, setManualCategoryOverride] = useState(false);
  
  // Smart category suggestions
  const [categorySuggestions, setCategorySuggestions] = useState<EnhancedCategorySuggestion[]>([]);
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
    name: '',
    internalName: '',
    referenceName: '',
    location: '',
    category: '',
    environment: 'indoor' as 'indoor' | 'outdoor',
    coordinates: { lat: 0, lng: 0 },
    description: '',
    photos: [] as (File | string)[],
    
    // Technical specifications
      width: 1920,
      height: 1080,
    resolution: '',
    brightness: 5000,
    screenType: '',
    orientation: '',
    connectivity: [] as string[],
    
    // Ad Configuration - ADDED TO FIX RUNTIME ERROR
    adConfiguration: {
      standardAdDuration: 15, // seconds
      loopDuration: 300, // 5 minutes
      transitionTime: 1 // seconds
    },
    
    // 🆕 Spot Duration Configuration - CRITICAL FOR PACKAGE CALCULATIONS
    spotDurationOptions: [10, 15, 20, 30, 45, 60], // Available durations in seconds
    selectedSpotDuration: 15, // Default selected duration
    
    // Location Data - ADDED TO FIX TYPESCRIPT ERRORS
    locationData: {
      exactCoordinates: { lat: 0, lng: 0 },
      locationCode: '',
      postalCode: '',
      venue: {
        type: '',
        environment: '',
        dailyTraffic: 0,
        demographics: {
          primaryAudience: [] as string[]
        }
      }
    },
    
    // Venue Data - ADDED TO FIX TYPESCRIPT ERRORS
    venue: {
      type: '',
      environment: '',
      dailyTraffic: 0,
      demographics: {
        primaryAudience: [] as string[]
      }
    },
    
    // Audience Data - ADDED TO FIX TYPESCRIPT ERRORS
    audienceData: {
      primaryDemographic: '',
      ageRange: '',
      income: '',
      interests: [] as string[]
    },
    
    // Technical Data - ADDED TO FIX TYPESCRIPT ERRORS
    technicalData: {
      systemSpecs: {
        cpu: '',
        ram: '',
        storage: '',
        temperature: '',
        uptime: ''
      },
      networkSpecs: {
        bandwidth: '',
        latency: '',
        packetLoss: '',
        ipAddress: '',
        isp: ''
      },
      displaySpecs: {
        status: '',
        temperature: '',
        refreshRate: '',
        maxFps: '',
        frameDropRate: '',
        maxBitrate: '',
        videoQuality: ''
      }
    },
    
    // Commercial Data - ADDED TO FIX TYPESCRIPT ERRORS
    commercialData: {
      pricing: {
        automatedPricing: true,
        minPrice: 15000,
        maxPrice: 80000
      },
      packages: {
        moments: { enabled: false },
        hourly: { enabled: false },
        daily: { enabled: false },
        weekly: { enabled: false },
        monthly: { enabled: false }
      }
    },
    
    // Pricing Configuration - ADDED TO FIX TYPESCRIPT ERRORS
    automatedPricing: false,
    minPrice: 15000,
    maxPrice: 80000,
    
    // Visibility - ADDED TO FIX TYPESCRIPT ERRORS
    isListed: true,
    
    // Contact Information - ADDED TO FIX TYPESCRIPT ERRORS
    contactPhone: '',
    contactWhatsapp: '',
    
    // System specifications for Shareflow Screen
    systemSpecs: {
      cpu: '',
      ram: '',
      storage: '',
      temperature: '',
      uptime: '',
      bandwidth: '',
      latency: '',
      packetLoss: '',
      ipAddress: '',
      isp: '',
      displayStatus: '',
      displayTemp: '',
      refreshRate: '',
      maxFps: '',
      frameDropRate: '',
      maxBitrate: '',
      videoQuality: ''
    },
    
    // Proof of Play capabilities
    proofOfPlay: {
      basic: {
        contentTracking: false,
        timestampAccuracy: '',
        durationTracking: false
      },
      advanced: {
        audienceEstimation: false,
        interactionTracking: false,
        geolocationVerification: false
      },
      quality: {
        bitrateMonitoring: false,
        resolutionVerification: false,
        errorReporting: false
      },
      custom: {
        customFields: false,
        campaignSpecificData: false,
        realTimeReporting: false
      }
    },
    
    // System events monitoring
    systemEvents: {
      powerManagement: {
        bootTracking: false,
        shutdownLogging: false,
        reasonTracking: false
      },
      errorHandling: {
        stackTraces: false,
        contextCapture: false,
        frequencyAnalysis: false
      },
      networkEvents: {
        ipChangeDetection: false,
        connectivityMonitoring: false,
        ispDetection: false
      },
      updates: {
        versionTracking: false,
        successFailureLogging: false,
        rollbackCapability: false
      }
    },

    // Existing properties
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
    contactEmail: '',
    connectionType: null as 'shareflow-screen' | 'manual' | null,
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
            price: 25000,
            enabled: true,
             frequency: '1/min',
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
            frequencyType: '1min', // 🆕 Frequency type for dropdown
            calculatedFrequency: '60 spots/hora', // 🆕 Auto-calculated display
            spotsPerHour: 60,
            price: 45000,
            enabled: true,
             frequency: '1/min',
          },
          {
            id: 'hourly-2min',
            name: '1 vez cada 2 minutos',
            frequencyType: '2min',
            calculatedFrequency: '30 spots/hora',
            spotsPerHour: 30,
            price: 35000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'hourly-5min',
            name: '1 vez cada 5 minutos',
            frequencyType: '5min',
            calculatedFrequency: '12 spots/hora',
            spotsPerHour: 12,
            price: 25000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'hourly-10min',
            name: '1 vez cada 10 minutos',
            frequencyType: '10min',
            calculatedFrequency: '6 spots/hora',
            spotsPerHour: 6,
            price: 18000,
            enabled: false,
             frequency: '1/min',
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
            frequencyType: '1min',
            calculatedFrequency: '960 spots/día',
            spotsPerDay: 960, // 16 horas * 60 minutos
            price: 180000,
            enabled: true,
             frequency: '1/min',
          },
          {
            id: 'daily-2min',
            name: '1 vez cada 2 minutos',
            frequencyType: '2min',
            calculatedFrequency: '480 spots/día',
            spotsPerDay: 480,
            price: 120000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'daily-5min',
            name: '1 vez cada 5 minutos',
            frequencyType: '5min',
            calculatedFrequency: '192 spots/día',
            spotsPerDay: 192,
            price: 80000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'daily-10min',
            name: '1 vez cada 10 minutos',
            frequencyType: '10min',
            calculatedFrequency: '96 spots/día',
            spotsPerDay: 96,
            price: 45000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'daily-30min',
            name: '1 vez cada 30 minutos',
            frequencyType: '30min',
            calculatedFrequency: '32 spots/día',
            spotsPerDay: 32,
            price: 25000,
            enabled: false,
             frequency: '1/min',
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
            frequencyType: '1min',
            calculatedFrequency: '6720 spots/semana',
            spotsPerWeek: 6720, // 7 días * 16 horas * 60 minutos
            price: 980000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'weekly-5min',
            name: '1 vez cada 5 minutos',
            frequencyType: '5min',
            calculatedFrequency: '1344 spots/semana',
            spotsPerWeek: 1344,
            price: 450000,
            enabled: true,
             frequency: '1/min',
          },
          {
            id: 'weekly-10min',
            name: '1 vez cada 10 minutos',
            frequencyType: '10min',
            calculatedFrequency: '672 spots/semana',
            spotsPerWeek: 672,
            price: 280000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'weekly-30min',
            name: '1 vez cada 30 minutos',
            frequencyType: '30min',
            calculatedFrequency: '224 spots/semana',
            spotsPerWeek: 224,
            price: 150000,
            enabled: false,
             frequency: '1/min',
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
            frequencyType: '5min',
            calculatedFrequency: '5760 spots/mes',
            spotsPerMonth: 5760, // 30 días * 16 horas * 12 spots/hora
            price: 1800000,
            enabled: true,
             frequency: '1/min',
          },
          {
            id: 'monthly-10min',
            name: '1 vez cada 10 minutos',
            frequencyType: '10min',
            calculatedFrequency: '2880 spots/mes',
            spotsPerMonth: 2880,
            price: 1200000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'monthly-30min',
            name: '1 vez cada 30 minutos',
            frequencyType: '30min',
            calculatedFrequency: '960 spots/mes',
            spotsPerMonth: 960,
            price: 650000,
            enabled: false,
             frequency: '1/min',
          },
          {
            id: 'monthly-1hour',
            name: '1 vez por hora',
            frequencyType: '1hour',
            calculatedFrequency: '480 spots/mes',
            spotsPerMonth: 480,
            price: 350000,
            enabled: false,
             frequency: '1/min',
          }
        ]
      }
    },
    acceptTerms: false
  });

  // 🆕 Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Connection
        if (connectionType === 'shareflow-screen') {
          // Para Shareflow Screen, necesita estar activado Y tener nombre de pantalla
          return isActivated && formData.name.trim() !== '' && formData.internalName.trim() !== '';
        }
        return connectionType !== null;
      case 2: // Location (only for manual) / Category for Shareflow Screen
        if (connectionType === 'shareflow-screen') {
          // Para Shareflow Screen, validar que tenga categoría
          return formData.category.trim() !== '';
        }
        return selectedLocation !== null && formData.location.trim() !== '';
      case 3: // Category for manual / Technical specs for Shareflow Screen
        if (connectionType === 'shareflow-screen') {
          // Para Shareflow Screen, las specs técnicas se obtienen automáticamente
          return true;
        }
        return formData.category.trim() !== '';
      case 4: // Technical specs for manual / Packages for Shareflow Screen
        if (connectionType === 'shareflow-screen') {
          return Object.values(formData.packages).some(pkg => pkg.enabled);
        }
        return formData.width > 0 && formData.height > 0;
      case 5: // Packages for manual / Photos for Shareflow Screen
        if (connectionType === 'shareflow-screen') {
          return photos.length > 0;
        }
        return Object.values(formData.packages).some(pkg => pkg.enabled);
      case 6: // Photos for manual / Create for Shareflow Screen
        if (connectionType === 'shareflow-screen') {
          return formData.acceptTerms;
        }
        return photos.length > 0;
      case 7: // Create for manual only
        return connectionType === 'manual' && formData.name.trim() !== '' && formData.acceptTerms;
      default:
        return false;
    }
  };

  // 🆕 Frequency calculation functions
  const getFrequencyOptions = () => [
    { value: '1min', label: '1 vez por minuto', spotsPerHour: 60 },
    { value: '2min', label: '1 vez cada 2 minutos', spotsPerHour: 30 },
    { value: '5min', label: '1 vez cada 5 minutos', spotsPerHour: 12 },
    { value: '10min', label: '1 vez cada 10 minutos', spotsPerHour: 6 },
    { value: '15min', label: '1 vez cada 15 minutos', spotsPerHour: 4 },
    { value: '30min', label: '1 vez cada 30 minutos', spotsPerHour: 2 },
    { value: '1hour', label: '1 vez por hora', spotsPerHour: 1 }
  ];

  const calculateFrequencyDisplay = (frequencyType: string, packageType: string) => {
    const option = getFrequencyOptions().find(opt => opt.value === frequencyType);
    if (!option) return '';

    const spotsPerHour = option.spotsPerHour;
    
    switch (packageType) {
      case 'hourly':
        return `${spotsPerHour} spots/hora`;
      case 'daily':
        return `${spotsPerHour * 16} spots/día`; // 16 horas operativas
      case 'weekly':
        return `${spotsPerHour * 16 * 7} spots/semana`;
      case 'monthly':
        return `${spotsPerHour * 16 * 30} spots/mes`;
      default:
        return `${spotsPerHour} spots/hora`;
    }
  };

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

  const updateSpotDuration = (duration: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSpotDuration: duration,
      adConfiguration: {
        ...prev.adConfiguration,
        standardAdDuration: duration
      }
    }));
  };

  // 🆕 Navigation functions
  const goToNextStep = () => {
    const maxSteps = connectionType === 'shareflow-screen' ? 6 : 7;
    
    if (currentStep < maxSteps) {
      if (validateStep(currentStep)) {
        setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
        setCurrentStep(prev => prev + 1);
      } else {
        // Mostrar mensaje de error específico según el paso
        let errorMessage = '';
        
        if (connectionType === 'shareflow-screen') {
          switch (currentStep) {
            case 1:
              if (!isActivated) {
                errorMessage = 'Debes conectar tu dispositivo Shareflow Screen antes de continuar';
              } else if (!formData.name.trim()) {
                errorMessage = 'Debes ingresar el nombre de la pantalla';
              } else if (!formData.internalName.trim()) {
                errorMessage = 'Debes ingresar el nombre interno de la pantalla';
              }
              break;
            case 2:
              errorMessage = 'Debes seleccionar una categoría para tu pantalla';
              break;
            case 4:
              errorMessage = 'Debes habilitar al menos un paquete de precios';
              break;
            case 5:
              errorMessage = 'Debes subir al menos una foto de la pantalla';
              break;
            case 6:
              errorMessage = 'Debes aceptar los términos y condiciones';
              break;
          }
        } else {
          switch (currentStep) {
            case 1:
              errorMessage = 'Debes seleccionar un tipo de conexión';
              break;
            case 2:
              errorMessage = 'Debes seleccionar una ubicación válida';
              break;
            case 3:
              errorMessage = 'Debes seleccionar una categoría para tu pantalla';
              break;
            case 4:
              errorMessage = 'Debes ingresar las dimensiones de la pantalla (ancho y alto)';
              break;
            case 5:
              errorMessage = 'Debes habilitar al menos un paquete de precios';
              break;
            case 6:
              errorMessage = 'Debes subir al menos una foto de la pantalla';
              break;
            case 7:
              if (!formData.name.trim()) {
                errorMessage = 'Debes ingresar el nombre de la pantalla';
              } else if (!formData.acceptTerms) {
                errorMessage = 'Debes aceptar los términos y condiciones';
              }
              break;
          }
        }
        
        // Mostrar el mensaje de error (puedes usar un toast o alert)
        alert(errorMessage);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    const maxSteps = connectionType === 'shareflow-screen' ? 6 : 7;
    if (step >= 1 && step <= maxSteps) {
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
          variants: prev.packages[packageType].variants.map(variant => {
            if (variant.id === variantId) {
              const updatedVariant = { ...variant, [field]: value };
              
              // 🆕 Auto-calculate frequency and spots when frequencyType changes
              if (field === 'frequencyType') {
                const calculatedFrequency = calculateFrequencyDisplay(value, packageType);
                const spotCount = calculateSpotCount(value, packageType);
                
                return {
                  ...updatedVariant,
                  calculatedFrequency,
                  // Update the appropriate spot count field based on package type
                  ...(packageType === 'hourly' && { spotsPerHour: spotCount }),
                  ...(packageType === 'daily' && { spotsPerDay: spotCount }),
                  ...(packageType === 'weekly' && { spotsPerWeek: spotCount }),
                  ...(packageType === 'monthly' && { spotsPerMonth: spotCount })
                };
              }
              
              return updatedVariant;
            }
            return variant;
          })
        }
      }
    }));
  };

  // 🆕 Function to add new variant to a package
  const addPackageVariant = (packageType: keyof typeof formData.packages) => {
    const newVariantId = `${packageType}-variant-${Date.now()}`;
    const newVariant: any = {
      id: newVariantId,
      name: 'Nueva Variante',
      price: formData.packages[packageType].price,
      enabled: false
    };

    // Add package-specific fields based on type
    switch (packageType) {
      case 'moments':
        newVariant.minDuration = 10;
        newVariant.maxDuration = 60;
        break;
      case 'hourly':
        newVariant.frequencyType = '5min';
        newVariant.calculatedFrequency = calculateFrequencyDisplay('5min', packageType);
        newVariant.spotsPerHour = calculateSpotCount('5min', packageType);
        break;
      case 'daily':
        newVariant.frequencyType = '10min';
        newVariant.calculatedFrequency = calculateFrequencyDisplay('10min', packageType);
        newVariant.spotsPerDay = calculateSpotCount('10min', packageType);
        break;
      case 'weekly':
        newVariant.frequencyType = '30min';
        newVariant.calculatedFrequency = calculateFrequencyDisplay('30min', packageType);
        newVariant.spotsPerWeek = calculateSpotCount('30min', packageType);
        break;
      case 'monthly':
        newVariant.frequencyType = '1hour';
        newVariant.calculatedFrequency = calculateFrequencyDisplay('1hour', packageType);
        newVariant.spotsPerMonth = calculateSpotCount('1hour', packageType);
        break;
    }

    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType],
          variants: [...prev.packages[packageType].variants, newVariant]
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

  // Effect to auto-advance step when Shareflow Screen is activated
  useEffect(() => {
    if (connectionType === 'shareflow-screen' && isActivated && shareflowScreenData && currentStep === 1) {
      // Small delay to ensure all states are updated
      setTimeout(() => {
        if (validateStep(1)) {
          setCompletedSteps(prev => {
            const newCompleted = [...prev.filter(s => s !== 1), 1];
            return newCompleted;
          });
          console.log('✅ Paso 1 validado automáticamente tras activación');
        }
      }, 100);
    }
  }, [isActivated, shareflowScreenData, connectionType, currentStep]);

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

  // Auto-classify when shareflow screen data is available
  useEffect(() => {
    if (connectionType === 'shareflow-screen' && shareflowScreenData && !showManualCategorySelection && !aiClassificationResult) {
      const classifyVenueWithEnhancedAI = async (locationData: any) => {
        setIsClassifyingVenue(true);
        try {
          // Enhanced AI classification with multiple data sources
          const result = await performEnhancedVenueClassification(locationData);
          setAiClassificationResult(result);
        } catch (error) {
          console.error('Error in AI venue classification:', error);
          // Fallback to basic classification
          const basicResult = await basicLocationClassification(locationData);
          setAiClassificationResult(basicResult);
        } finally {
          setIsClassifyingVenue(false);
        }
      };

      classifyVenueWithEnhancedAI(shareflowScreenData);
    }
  }, [shareflowScreenData, showManualCategorySelection, connectionType, aiClassificationResult]);

  // Enhanced AI classification function
  const performEnhancedVenueClassification = async (locationData: any): Promise<VenueClassificationResult> => {
    // Simulate enhanced AI processing with multiple data sources
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const location = locationData.location?.toLowerCase() || '';
    const coordinates = locationData.coordinates;
    
    // Enhanced keyword matching with context
    const enhancedKeywords = {
      // Transit locations
      'aeropuerto|airport|terminal aéreo': { parent: 'transit', child: 'airports', grandChild: 'arrival_hall', confidence: 0.95 },
      'estación de bus|terminal de buses|bus station': { parent: 'transit', child: 'buses', grandChild: 'bus_terminal', confidence: 0.92 },
      'metro|subway|estación del metro': { parent: 'transit', child: 'subway', grandChild: 'subway_platform', confidence: 0.90 },
      'estación de tren|train station|ferrocarril': { parent: 'transit', child: 'train_stations', grandChild: 'train_platform', confidence: 0.90 },
      
      // Retail locations
      'centro comercial|mall|shopping center': { parent: 'retail', child: 'mall', grandChild: 'concourse', confidence: 0.88 },
      'supermercado|grocery|market|tienda': { parent: 'retail', child: 'grocery', grandChild: 'shop_entrance', confidence: 0.85 },
      'gasolinera|gas station|fuel|combustible': { parent: 'retail', child: 'fueling_stations', grandChild: 'fuel_dispenser', confidence: 0.87 },
      
      // Health & Beauty
      'hospital|clínica|medical center|centro médico': { parent: 'health_beauty', child: 'gyms', grandChild: 'gym_lobby', confidence: 0.90 },
      'farmacia|pharmacy|drugstore': { parent: 'retail', child: 'pharmacies', grandChild: 'shop_entrance', confidence: 0.88 },
      
      // Education
      'universidad|university|college|instituto': { parent: 'education', child: 'colleges_universities', grandChild: 'common_areas_edu', confidence: 0.85 },
      'escuela|school|colegio': { parent: 'education', child: 'schools', grandChild: 'common_areas_edu', confidence: 0.83 },
      
      // Office Buildings
      'oficina|office|building|edificio corporativo': { parent: 'office_buildings', child: 'office_buildings', grandChild: 'lobby_office', confidence: 0.80 },
      
      // Leisure
      'cine|cinema|movie theater': { parent: 'leisure', child: 'movie_theaters', grandChild: 'theater_lobby', confidence: 0.88 },
      'restaurante|restaurant|food court': { parent: 'leisure', child: 'casual_dining', grandChild: undefined, confidence: 0.85 },
      
      // Government
      'gobierno|government|municipal|ayuntamiento': { parent: 'government', child: 'dmvs', grandChild: undefined, confidence: 0.87 },
      
      // Financial
      'banco|bank|financial|financiero': { parent: 'financial', child: 'banks', grandChild: undefined, confidence: 0.90 },
      
      // Outdoor
      'parque|park|plaza|outdoor': { parent: 'outdoor', child: 'urban_panels', grandChild: undefined, confidence: 0.82 }
    };

    // Find best match
    let bestMatch = null;
    let highestConfidence = 0;

    for (const [keywords, categoryInfo] of Object.entries(enhancedKeywords)) {
      const keywordList = keywords.split('|');
      for (const keyword of keywordList) {
        if (location.includes(keyword)) {
          if (categoryInfo.confidence > highestConfidence) {
            highestConfidence = categoryInfo.confidence;
            bestMatch = categoryInfo;
          }
        }
      }
    }

    if (bestMatch) {
      // Generate alternative suggestions using actual VENUE_TAXONOMY entries
      const alternatives: Array<{ category: VenueCategory; confidence: number }> = [];
      
      // Find matching categories from VENUE_TAXONOMY
      const matchingCategories = Object.values(VENUE_TAXONOMY).filter(cat => 
        cat.parent === bestMatch.parent || 
        (cat.parent !== bestMatch.parent && Math.random() > 0.7) // Add some variety
      ).slice(0, 3);

      matchingCategories.forEach(cat => {
        alternatives.push({
          category: cat,
          confidence: bestMatch.confidence * 0.8 // Reduce confidence for alternatives
        });
      });

      return {
        category: {
          parent: bestMatch.parent as VenueParentCategory,
          child: bestMatch.child as VenueChildCategory,
          grandChild: bestMatch.grandChild as VenueGrandChildCategory
        },
        confidence: bestMatch.confidence,
        reasoning: `Clasificación basada en análisis de ubicación "${location}" con IA mejorada. Detectamos características específicas que indican este tipo de venue.`,
        extractedFeatures: [location, coordinates ? `Coordenadas: ${coordinates.lat}, ${coordinates.lng}` : ''].filter(Boolean),
        alternativeCategories: alternatives
      };
    }

    // Fallback to basic classification
    return basicLocationClassification(locationData);
  };

  const calculateDistance = (coord1: {lat: number, lng: number}, coord2: {lat: number, lng: number}) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const basicLocationClassification = async (locationData: any): Promise<VenueClassificationResult> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const location = locationData.location?.toLowerCase() || '';
    
    // Get a default category from VENUE_TAXONOMY
    const defaultCategory = Object.values(VENUE_TAXONOMY)[0]; // Get first available category
    
    // Basic keyword matching
    if (location.includes('aeropuerto') || location.includes('airport')) {
      const airportCategory = Object.values(VENUE_TAXONOMY).find(cat => 
        cat.parent === 'transit' && cat.child === 'airports'
      ) || defaultCategory;
      
      return {
        category: { parent: 'transit', child: 'airports', grandChild: 'arrival_hall' },
        confidence: 0.85,
        reasoning: 'Ubicación identificada como aeropuerto basado en el nombre',
        extractedFeatures: [location],
        alternativeCategories: [
          { category: airportCategory, confidence: 0.75 }
        ]
      };
    }
    
    if (location.includes('centro comercial') || location.includes('mall')) {
      const mallCategory = Object.values(VENUE_TAXONOMY).find(cat => 
        cat.parent === 'retail' && cat.child === 'mall'
      ) || defaultCategory;
      
      return {
        category: { parent: 'retail', child: 'mall', grandChild: 'concourse' },
        confidence: 0.80,
        reasoning: 'Ubicación identificada como centro comercial',
        extractedFeatures: [location],
        alternativeCategories: [
          { category: mallCategory, confidence: 0.70 }
        ]
      };
    }

    // Default fallback
    return {
      category: { parent: 'retail', child: 'mall', grandChild: 'concourse' },
      confidence: 0.60,
      reasoning: 'Clasificación por defecto - se requiere más información para una clasificación precisa',
      extractedFeatures: [],
      alternativeCategories: [
        { category: defaultCategory, confidence: 0.50 }
      ]
    };
  };

  // Enhanced activation function for Shareflow Screen
  const handleActivation = async () => {
    if (!userInputCode || userInputCode.length < 3) {
      setActivationError('Por favor ingresa un código de activación válido');
      return;
    }

    setIsActivating(true);
    setActivationError('');

    try {
      // Simulate API call to Shareflow Screen service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection with location data and complete telemetry
      const mockScreenData = {
        deviceId: userInputCode,
        location: 'Centro Comercial Santafé, Medellín, Colombia',
        coordinates: { lat: 6.2476, lng: -75.5658 },
        specs: {
          width: 1920,
          height: 1080,
          resolution: 'Full HD (1920x1080)',
          brightness: '5000 nits'
        },
        environment: 'indoor_controlled' as EnvironmentType,
        // Complete telemetry data from Shareflow Screen
        telemetry: {
          system: {
            cpu: '45%',
            ram: '2.1GB / 4GB',
            disk: '128GB / 256GB',
            temperature: '42°C',
            uptime: '15 días, 8 horas'
          },
          network: {
            bandwidth: '100 Mbps',
            latency: '12ms',
            packetLoss: '0.1%',
            ip: '192.168.1.45',
            isp: 'Claro Colombia'
          },
          display: {
            status: 'Activo',
            resolution: '1920x1080',
            brightness: '5000 nits',
            temperature: '38°C',
            refreshRate: '60Hz'
          },
          playback: {
            fps: '60',
            frameDrops: '0.02%',
            videoQuality: 'HD',
            bitrate: '8 Mbps'
          }
        },
        // Generate AI suggestions using real venue taxonomy
        aiSuggestions: [
          {
            category: 'retail_mall',
            confidence: 92,
            reasoning: 'Detectado en centro comercial con alto tráfico peatonal y ambiente controlado. Ideal para publicidad retail y promociones.',
            environment: 'indoor' as const
          },
          {
            category: 'retail_convenience_stores',
            confidence: 78,
            reasoning: 'Ubicación estratégica cerca de tiendas de conveniencia. Perfecto para productos de consumo rápido.',
            environment: 'indoor' as const
          },
          {
            category: 'leisure_casual_dining',
            confidence: 65,
            reasoning: 'Proximidad a área de comidas. Excelente para promociones gastronómicas y bebidas.',
            environment: 'indoor' as const
          }
        ]
      };

      // Set Shareflow Screen data first
      setShareflowScreenData(mockScreenData);
      
      // Single comprehensive formData update
      setFormData(prev => ({
        ...prev,
        // Basic info from device
        name: `Pantalla ${userInputCode}`,
        location: mockScreenData.location,
        coordinates: mockScreenData.coordinates,
        environment: 'indoor',
        connectionType: 'shareflow-screen',
        
        // Technical specifications from telemetry
        width: mockScreenData.specs.width,
        height: mockScreenData.specs.height,
        resolution: mockScreenData.specs.resolution,
        brightness: parseInt(mockScreenData.specs.brightness),
        
        // Advanced telemetry data
        systemSpecs: {
          cpu: mockScreenData.telemetry.system.cpu,
          ram: mockScreenData.telemetry.system.ram,
          storage: mockScreenData.telemetry.system.disk,
          temperature: mockScreenData.telemetry.system.temperature,
          uptime: mockScreenData.telemetry.system.uptime,
          
          // Network specifications
          bandwidth: mockScreenData.telemetry.network.bandwidth,
          latency: mockScreenData.telemetry.network.latency,
          packetLoss: mockScreenData.telemetry.network.packetLoss,
          ipAddress: mockScreenData.telemetry.network.ip,
          isp: mockScreenData.telemetry.network.isp,
          
          // Display specifications
          displayStatus: mockScreenData.telemetry.display.status,
          displayTemp: mockScreenData.telemetry.display.temperature,
          refreshRate: mockScreenData.telemetry.display.refreshRate,
          
          // Playback capabilities
          maxFps: mockScreenData.telemetry.playback.fps,
          frameDropRate: mockScreenData.telemetry.playback.frameDrops,
          maxBitrate: mockScreenData.telemetry.playback.bitrate,
          videoQuality: mockScreenData.telemetry.playback.videoQuality
        },
        
        // Enhanced location data
        locationData: {
          ...prev.locationData,
          exactCoordinates: mockScreenData.coordinates,
          locationCode: userInputCode,
          venue: {
            type: 'shopping_mall',
            environment: 'indoor',
            dailyTraffic: 15000,
            demographics: {
              primaryAudience: ['families', 'young_adults', 'professionals']
            }
          }
        },
        
        // Proof of Play capabilities
        proofOfPlay: {
          basic: {
            contentTracking: true,
            timestampAccuracy: '±1s',
            durationTracking: true
          },
          advanced: {
            audienceEstimation: true,
            interactionTracking: true,
            geolocationVerification: true
          },
          quality: {
            bitrateMonitoring: true,
            resolutionVerification: true,
            errorReporting: true
          },
          custom: {
            customFields: true,
            campaignSpecificData: true,
            realTimeReporting: true
          }
        },
        
        // System events monitoring
        systemEvents: {
          powerManagement: {
            bootTracking: true,
            shutdownLogging: true,
            reasonTracking: true
          },
          errorHandling: {
            stackTraces: true,
            contextCapture: true,
            frequencyAnalysis: true
          },
          networkEvents: {
            ipChangeDetection: true,
            connectivityMonitoring: true,
            ispDetection: true
          },
          updates: {
            versionTracking: true,
            successFailureLogging: true,
            rollbackCapability: true
          }
        }
      }));

      // Set activation state
      setIsActivated(true);
      
      // Mark technical step as completed since telemetry is auto-filled
      setCompletedSteps(prev => {
        const newCompleted = [...prev.filter(s => s !== 1 && s !== 3), 1, 3];
        return newCompleted;
      });

      // Start real-time telemetry updates
      const interval = setInterval(() => {
        setRealTimeTelemetry(generateDynamicTelemetry());
      }, 10000); // Every 10 seconds
      
      setTelemetryInterval(interval);

      console.log('✅ Pantalla Shareflow Screen conectada con telemetría completa');
      console.log('📊 Especificaciones técnicas auto-completadas');
      console.log('🔄 Telemetría en tiempo real cada 10s activada');
      console.log('📝 Proof of Play configurado para cada reproducción');
      console.log('⚡ Eventos de sistema monitoreados automáticamente');
      
      // Auto-advance to next step after successful connection
    setTimeout(() => {
        if (currentStep === 1) {
          setCurrentStep(2); // Move to category step
        }
      }, 500);

    } catch (error) {
      console.error('Error connecting to Shareflow Screen:', error);
      setActivationError('Error al conectar con el dispositivo. Verifica el código e intenta nuevamente.');
    } finally {
      setIsActivating(false);
    }
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

  // 🆕 AI-powered venue classification
  const classifyVenueFromLocation = useCallback(async (location: LocationSuggestion) => {
    if (!location.description) return;
    
    setIsClassifyingVenue(true);
    try {
      const classification = await venueClassifier.classifyVenue({
        name: location.description.split(',')[0],
        description: location.description,
        keywords: location.businessTypes || []
      });
      
      setAiClassificationResult(classification);
      
      // Generate category suggestions based on AI classification
      const suggestions: EnhancedCategorySuggestion[] = [
        {
          category: `${classification.category.parent}_${classification.category.child}${
            classification.category.grandChild ? '_' + classification.category.grandChild : ''
          }`,
          confidence: classification.confidence,
          reasoning: classification.reasoning,
          environment: (classification.category.parent === 'outdoor' ? 'outdoor' : 'indoor') as 'indoor' | 'outdoor'
        },
        // Add alternative categories
        ...classification.alternativeCategories.slice(0, 2).map(alt => ({
          category: `${alt.category.parent}_${alt.category.child}${
            alt.category.grandChild ? '_' + alt.category.grandChild : ''
          }`,
          confidence: alt.confidence,
          reasoning: `Opción alternativa recomendada: ${PARENT_CATEGORY_NAMES[alt.category.parent as VenueParentCategory] || alt.category.parent} - ${CHILD_CATEGORY_NAMES[alt.category.child as VenueChildCategory] || alt.category.child}. Esta categoría también podría ser adecuada para tu ubicación.`,
          environment: (alt.category.parent === 'outdoor' ? 'outdoor' : 'indoor') as 'indoor' | 'outdoor'
        }))
      ];
      
      setCategorySuggestions(suggestions);
      
      // Auto-select the best match if confidence is high
      if (classification.confidence > 0.8) {
        handleCategorySelect(suggestions[0].category);
      }
      
    } catch (error) {
      console.error('Error classifying venue:', error);
    } finally {
      setIsClassifyingVenue(false);
    }
  }, [venueClassifier]);

  // Location analysis with AI venue classification
  const analyzeLocation = useCallback(async (location: LocationSuggestion) => {
    setIsAnalyzingLocation(true);
    
    try {
      // Simulate API call for location insights
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights: LocationInsights = {
        audienceProfile: {
          primaryDemographic: location.businessTypes?.includes('retail') ? 'Shoppers y familias' : 'Profesionales y commuters',
          ageRange: '25-45 años',
          income: location.demographicScore && location.demographicScore > 8 ? 'Medio-Alto' : 'Medio',
          interests: location.businessTypes || ['general']
        },
        businessDensity: {
          total: Math.floor(Math.random() * 50) + 20,
          types: {
            'retail': Math.floor(Math.random() * 15) + 5,
            'food': Math.floor(Math.random() * 10) + 3,
            'services': Math.floor(Math.random() * 8) + 2
          }
        },
        competitorAnalysis: {
          nearbyScreens: Math.floor(Math.random() * 5) + 1,
          averagePrice: Math.floor(Math.random() * 30000) + 20000,
          marketGap: Math.random() > 0.6
        },
        revenueOpportunity: {
          score: location.demographicScore || Math.random() * 3 + 7,
          potential: location.demographicScore && location.demographicScore > 8.5 ? 'Alto' : 'Medio-Alto',
          reasoning: [
            'Alto tráfico peatonal en la zona',
            'Demografía objetivo alineada',
            'Competencia moderada'
          ]
        }
      };
      
      setLocationInsights(insights);
      
      // Trigger AI venue classification
      await classifyVenueFromLocation(location);
      
    } catch (error) {
      console.error('Error analyzing location:', error);
    } finally {
      setIsAnalyzingLocation(false);
    }
  }, [classifyVenueFromLocation]);

  // Smart category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    const category = VENUE_CATEGORIES.find((c: any) => c.id === categoryId);
    if (!category) return;
    
    setSelectedCategory(categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      environment: category.environment as 'indoor' | 'outdoor',
      venue: {
        ...prev.venue,
        type: category.name,
        environment: category.environment.includes('outdoor') ? 'Outdoor' : 'Indoor'
      },
      packages: {
        ...prev.packages,
        moments: {
          ...prev.packages.moments,
          price: Math.round((category.priceRange.min + category.priceRange.max) / 2)
        }
      }
    }));
    
    // Mark manual override if user selects different from AI suggestion
    if (aiClassificationResult && !manualCategoryOverride) {
      const aiSuggestion = `${aiClassificationResult.category.parent}_${aiClassificationResult.category.child}${
        aiClassificationResult.category.grandChild ? '_' + aiClassificationResult.category.grandChild : ''
      }`;
      if (categoryId !== aiSuggestion) {
        setManualCategoryOverride(true);
      }
    }
  }, [aiClassificationResult, manualCategoryOverride]);

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

  // Handle location selection
  const handleLocationSelect = useCallback((location: LocationSuggestion) => {
    setSelectedLocation(location);
    setLocationSearch(location.description);
    setFormData(prev => ({
      ...prev,
      location: location.description,
      coordinates: location.coordinates,
      locationData: {
        ...prev.locationData,
        exactCoordinates: location.coordinates,
        postalCode: location.city || '',
        venue: {
          type: location.businessTypes?.[0] || '',
          environment: 'indoor',
          dailyTraffic: location.averageFootTraffic || 0,
          demographics: {
            primaryAudience: location.businessTypes || []
          }
        }
      },
      venue: {
        ...prev.venue,
        dailyTraffic: location.averageFootTraffic || 0,
        demographics: {
          ...prev.venue.demographics,
          primaryAudience: location.businessTypes || []
        }
      }
    }));
    setLocationSuggestions([]);
    analyzeLocation(location);
  }, [analyzeLocation]);

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">¿Dónde está tu pantalla?</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Con IA analizaremos la ubicación para maximizar tus ingresos
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <LocationInput
            value={formData.location}
            onChange={handleLocationChange}
            placeholder="Escribe la dirección de tu pantalla..."
          />
        </div>

        {/* Location Suggestions Dropdown */}
        {locationSuggestions.length > 0 && (
          <div className="mt-4 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Ubicaciones sugeridas
              </h4>
            </div>
            
            <div className="divide-y divide-gray-100">
              {locationSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleLocationSelect(suggestion)}
                  className="w-full p-6 text-left hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Main Address */}
                      <div>
                        <h5 className="font-semibold text-gray-900 text-lg leading-tight">
                      {suggestion.description.split(',')[0]}
                        </h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">
                      {suggestion.description}
                    </p>
                      </div>
                      
                      {/* Metrics */}
                      {(suggestion.averageFootTraffic || suggestion.demographicScore) && (
                        <div className="flex flex-wrap gap-3 pt-2">
                    {suggestion.averageFootTraffic && (
                            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                              <Users className="w-4 h-4" />
                              {suggestion.averageFootTraffic.toLocaleString()} visitantes/día
                      </div>
                    )}
                          {suggestion.demographicScore && (
                            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                              <Star className="w-4 h-4" />
                              Score: {suggestion.demographicScore}/10
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Analysis */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
            {/* Location Header */}
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
            </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-gray-900">Ubicación Seleccionada</h4>
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Confirmada
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {selectedLocation.description}
                </p>
              </div>
            </div>

            {/* AI Analysis Section */}
              {isAnalyzingLocation ? (
              <div className="bg-white rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-center gap-4 text-blue-600">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <Sparkles className="w-4 h-4 absolute top-0 right-0 text-yellow-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">Analizando ubicación con IA...</p>
                    <p className="text-sm text-gray-600 mt-1">Evaluando potencial de ingresos y audiencia</p>
                  </div>
                </div>
                </div>
              ) : locationInsights ? (
              <div className="space-y-6">
                {/* Analysis Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-900">Análisis IA Completado</span>
                  </div>
                  </div>
                  
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Potencial</p>
                        <p className="text-xs text-gray-500">de Ingresos</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-1">
                      {locationInsights.revenueOpportunity.potential}
                    </p>
                    <p className="text-sm text-gray-600">
                      Score: {locationInsights.revenueOpportunity.score}/10
                    </p>
                    </div>
                    
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Densidad</p>
                        <p className="text-xs text-gray-500">Comercial</p>
                    </div>
                  </div>
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                      {locationInsights.businessDensity.total}
                    </p>
                    <p className="text-sm text-gray-600">negocios cercanos</p>
                </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
            </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Audiencia</p>
                        <p className="text-xs text-gray-500">Principal</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-purple-600 mb-1">
                      {locationInsights.audienceProfile.primaryDemographic}
                    </p>
                    <p className="text-sm text-gray-600">
                      {locationInsights.audienceProfile.ageRange}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Competencia</p>
                        <p className="text-xs text-gray-500">Cercana</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 mb-1">
                      {locationInsights.competitorAnalysis.nearbyScreens}
                    </p>
                    <p className="text-sm text-gray-600">pantallas cerca</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}

      {/* Screen Name Configuration */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Configura tu pantalla</h4>
              <p className="text-gray-600">Define cómo se mostrará en el marketplace</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Public Name */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-lg font-semibold text-gray-900">
                      Nombre público
                    </label>
                    <p className="text-sm text-gray-600">Visible para anunciantes</p>
                  </div>
                <Tooltip content="Este es el nombre que verán los anunciantes en el marketplace. Debe ser descriptivo e incluir la ubicación para facilitar la identificación.">
                    <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
                
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Pantalla Centro Comercial Oviedo - Entrada Principal"
                  className={`w-full px-4 py-4 border-2 rounded-xl text-lg focus:ring-4 focus:ring-blue-100 transition-all ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
                
              {errors.name && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.name}</p>
                  </div>
                )}
                
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Consejos para un buen nombre:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Incluye la ubicación específica</li>
                        <li>• Menciona puntos de referencia</li>
                        <li>• Sé descriptivo pero conciso</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Name */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <label className="text-lg font-semibold text-gray-900">
                      Nombre de referencia
                    </label>
                    <p className="text-sm text-gray-600">Solo para tu organización</p>
                  </div>
                <Tooltip content="Nombre corto para tu uso interno. Te ayudará a identificar rápidamente esta pantalla en tus reportes y configuraciones.">
                    <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
                
              <input
                type="text"
                value={formData.referenceName}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceName: e.target.value }))}
                  placeholder="Ej: OVIEDO-P1, MALL-ENT-A, CC-PRINCIPAL"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all"
                />
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Campo opcional</p>
                      <p className="text-sm text-gray-600">
                        Útil para códigos internos, numeración de pantallas o referencias de inventario.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Completa los campos requeridos</h4>
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="text-sm text-red-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {message}
                  </li>
            ))}
          </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderCategoryStep = () => {
    // Parse current category selection
    const [selectedParent, selectedChild, selectedGrandChild] = formData.category.split('_');
    
    // Get all available parent categories from VENUE_TAXONOMY
    const availableParents = Array.from(new Set(
      Object.values(VENUE_TAXONOMY).map(category => category.parent)
    ));
    
    // Get child categories for selected parent
    const availableChildren = selectedParent ? 
      Array.from(new Set(
        Object.values(VENUE_TAXONOMY)
          .filter(category => category.parent === selectedParent)
          .map(category => category.child)
      )) : [];
    
    // Get grandchild categories for selected parent and child - FIXED LOGIC
    const availableGrandChildren = selectedParent && selectedChild ? 
      Object.values(VENUE_TAXONOMY)
        .filter(category => 
          category.parent === selectedParent && 
          category.child === selectedChild && 
          category.grandChild !== undefined
        )
        .map(category => category.grandChild!)
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      : [];

    // Debug logging for mall grandchildren
    if (selectedParent === 'retail' && selectedChild === 'mall') {
      console.log('🔍 DEBUG: Mall grandchildren selection');
      console.log('Selected parent:', selectedParent);
      console.log('Selected child:', selectedChild);
      console.log('Available grandchildren:', availableGrandChildren);
      console.log('Current category:', formData.category);
      console.log('Selected grandchild:', selectedGrandChild);
      
      // Check what's in VENUE_TAXONOMY for mall
      const mallCategories = Object.values(VENUE_TAXONOMY).filter(cat => 
        cat.parent === 'retail' && cat.child === 'mall'
      );
      console.log('Mall categories in VENUE_TAXONOMY:', mallCategories);
    }

    return (
      <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
        </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Seleccionar Categoría de Venue
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Navega por las categorías para encontrar la clasificación más específica para tu ubicación
          </p>
      </div>

        {/* Breadcrumb Navigation */}
        {formData.category && (
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-purple-600">
                {PARENT_CATEGORY_NAMES[selectedParent as VenueParentCategory] || selectedParent}
              </span>
              {selectedChild && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-purple-600">
                    {CHILD_CATEGORY_NAMES[selectedChild as VenueChildCategory] || selectedChild}
                  </span>
                </>
              )}
              {selectedGrandChild && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-purple-600">
                    {GRANDCHILD_CATEGORY_NAMES[selectedGrandChild as VenueGrandChildCategory] || selectedGrandChild}
                  </span>
                </>
              )}
          </div>
            <button
              onClick={() => setFormData(prev => ({ ...prev, category: '' }))}
              className="ml-auto text-xs text-gray-500 hover:text-gray-700"
            >
              Limpiar selección
            </button>
          </div>
        )}

        {/* Location Analysis for Shareflow Screen */}
        {connectionType === 'shareflow-screen' && shareflowScreenData && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Ubicación Detectada</h4>
                <p className="text-sm text-blue-700 mb-2">{shareflowScreenData.location}</p>
                {isClassifyingVenue && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Analizando ubicación con IA mejorada...
                  </div>
                )}
              </div>
            </div>
            
            {/* Back to Auto Categorization Button */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <button
                onClick={() => setShowManualCategorySelection(false)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Volver a categorización automática
              </button>
            </div>
          </div>
        )}

        {/* AI Category Suggestions */}
        {aiClassificationResult && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Recomendación IA basada en ubicación
            </h4>
            
            {/* Primary AI Recommendation */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                    <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-purple-900">
                      {PARENT_CATEGORY_NAMES[aiClassificationResult.category.parent] || aiClassificationResult.category.parent} → {
                       CHILD_CATEGORY_NAMES[aiClassificationResult.category.child] || aiClassificationResult.category.child
                      }
                      {aiClassificationResult.category.grandChild && (
                        <> → {GRANDCHILD_CATEGORY_NAMES[aiClassificationResult.category.grandChild] || aiClassificationResult.category.grandChild}</>
                      )}
                    </h5>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {Math.round(aiClassificationResult.confidence * 100)}% confianza
                        </span>
                      </div>
                  <p className="text-sm text-purple-700 mb-3">{aiClassificationResult.reasoning}</p>
                  <button
                    onClick={() => {
                      const categoryString = [
                        aiClassificationResult.category.parent,
                        aiClassificationResult.category.child,
                        aiClassificationResult.category.grandChild
                      ].filter(Boolean).join('_');
                      setFormData(prev => ({ ...prev, category: categoryString }));
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    Usar esta recomendación
                  </button>
                      </div>
                    </div>
                  </div>

            {/* Alternative Suggestions */}
            {aiClassificationResult.alternativeCategories.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-sm font-medium text-gray-700">Otras opciones sugeridas:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aiClassificationResult.alternativeCategories.slice(0, 4).map((alt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const categoryString = [
                          alt.category.parent,
                          alt.category.child,
                          alt.category.grandChild
                        ].filter(Boolean).join('_');
                        setFormData(prev => ({ ...prev, category: categoryString }));
                      }}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-25 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {PARENT_CATEGORY_NAMES[alt.category.parent] || alt.category.parent} → {
                         CHILD_CATEGORY_NAMES[alt.category.child] || alt.category.child
                        }
          </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(alt.confidence * 100)}% confianza
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

        {/* Hierarchical Category Selection */}
        <div className="space-y-6">
          {/* Step 1: Parent Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              1. Selecciona la categoría principal
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableParents.map((parentCategory) => {
                const Icon = PARENT_CATEGORY_ICONS[parentCategory] || Building2;
                const isSelected = selectedParent === parentCategory;
                const childCount = Object.values(VENUE_TAXONOMY).filter(v => v.parent === parentCategory).length;
            
            return (
              <motion.button
                    key={parentCategory}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: parentCategory }));
                    }}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      isSelected ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                    <div className={`text-sm font-medium ${
                      isSelected ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {PARENT_CATEGORY_NAMES[parentCategory] || parentCategory}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {childCount} subcategorías
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

          {/* Step 2: Child Categories */}
          {selectedParent && availableChildren.length > 0 && (
        <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-gray-600" />
                2. Selecciona el tipo específico
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableChildren.map((childCategory) => {
                  const isSelected = selectedChild === childCategory;
                  const categoryData = Object.values(VENUE_TAXONOMY)
                    .find(v => v.parent === selectedParent && v.child === childCategory);
                  const grandChildOptions = Object.values(VENUE_TAXONOMY)
                    .filter(v => v.parent === selectedParent && v.child === childCategory && v.grandChild)
                    .length;
            
            return (
                    <motion.button
                      key={childCategory}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          category: `${selectedParent}_${childCategory}` 
                        }));
                      }}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-gray-900 text-sm mb-2">
                        {CHILD_CATEGORY_NAMES[childCategory] || childCategory}
                    </div>

                      {/* Audience Types */}
                      {categoryData && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {categoryData.audienceTypes.slice(0, 2).map((audience, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                              {audience.charAt(0).toUpperCase() + audience.slice(1).replace('_', ' ')}
                            </span>
                          ))}
                          {categoryData.audienceTypes.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                              +{categoryData.audienceTypes.length - 2}
                            </span>
                          )}
                              </div>
                      )}
                      
                      {/* Environment and Dwell Time */}
                      {categoryData && (
                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Ambiente:</span>
                            <span>{ENVIRONMENT_LABELS[categoryData.environment] || categoryData.environment}</span>
                                  </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Permanencia:</span>
                            <span>{DWELL_TIME_LABELS[categoryData.dwellTime] || categoryData.dwellTime}</span>
                                </div>
                                  </div>
                      )}
                      
                      {/* Grandchild indicator */}
                      {grandChildOptions > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-purple-600 font-medium">
                            {grandChildOptions} ubicaciones específicas disponibles
                                </div>
                              </div>
                            )}
                    </motion.button>
                  );
                })}
                                </div>
                              </div>
                            )}

          {/* Step 3: Grandchild Categories - FIXED */}
          {selectedParent && selectedChild && availableGrandChildren.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-gray-600" />
                3. Selecciona la ubicación específica (opcional)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Option to keep just parent_child */}
                <motion.button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      category: `${selectedParent}_${selectedChild}` 
                    }));
                  }}
                  className={`p-4 rounded-lg border-2 border-dashed text-left transition-all ${
                    formData.category === `${selectedParent}_${selectedChild}`
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium text-gray-900 text-sm mb-2">
                    General - Sin especificar
                          </div>
                  <div className="text-xs text-gray-500">
                    Usar solo la categoría principal sin ubicación específica
                              </div>
                </motion.button>

                {/* Grandchild options */}
                {availableGrandChildren.map((grandChildCategory) => {
                  const isSelected = selectedGrandChild === grandChildCategory;
                  const categoryData = Object.values(VENUE_TAXONOMY)
                    .find(v => v.parent === selectedParent && v.child === selectedChild && v.grandChild === grandChildCategory);
                  
                  // Debug for each grandchild option
                  if (selectedParent === 'retail' && selectedChild === 'mall') {
                    console.log(`🔍 Rendering grandchild option: ${grandChildCategory}`);
                    console.log(`Display name: ${GRANDCHILD_CATEGORY_NAMES[grandChildCategory] || grandChildCategory}`);
                    console.log(`Is selected: ${isSelected}`);
                    console.log(`Category data found:`, categoryData);
                  }
                  
                  return (
                    <motion.button
                      key={grandChildCategory}
                      type="button"
                      onClick={() => {
                        console.log('🔘 Grandchild button clicked:', grandChildCategory);
                        console.log('Setting category to:', `${selectedParent}_${selectedChild}_${grandChildCategory}`);
                        setFormData(prev => ({ 
                          ...prev, 
                          category: `${selectedParent}_${selectedChild}_${grandChildCategory}` 
                        }));
                      }}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-gray-900 text-sm mb-2">
                        {GRANDCHILD_CATEGORY_NAMES[grandChildCategory] || grandChildCategory}
                                </div>
                      
                      {/* Additional details for grandchild */}
                      <div className="text-xs text-gray-500 mb-2">
                        Ubicación específica dentro de {CHILD_CATEGORY_NAMES[selectedChild as VenueChildCategory] || selectedChild}
                                </div>

                      {/* Environment and Audience info */}
                      {categoryData && (
                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Ambiente:</span>
                            <span>{ENVIRONMENT_LABELS[categoryData.environment] || categoryData.environment}</span>
                                  </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Audiencia:</span>
                            <span>{categoryData.audienceTypes.slice(0, 2).join(', ')}</span>
                                </div>
                        </div>
                            )}
                    </motion.button>
                  );
                })}
              </div>
                          </div>
                        )}
        </div>

        {/* Category Selection Status */}
        {formData.category && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Categoría Seleccionada</h4>
                <p className="text-sm text-green-700">
                  {selectedParent && PARENT_CATEGORY_NAMES[selectedParent as VenueParentCategory]}
                  {selectedChild && ` → ${CHILD_CATEGORY_NAMES[selectedChild as VenueChildCategory]}`}
                  {selectedGrandChild && ` → ${GRANDCHILD_CATEGORY_NAMES[selectedGrandChild as VenueGrandChildCategory]}`}
                </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
    );
  };

  const renderSpecsStep = () => {
    // If it's a Shareflow Screen, show complete telemetry
    if (connectionType === 'shareflow-screen' && (realTimeTelemetry || shareflowScreenData?.telemetry)) {
      // Use real-time telemetry if available, otherwise fall back to initial data
      const telemetry = realTimeTelemetry || shareflowScreenData.telemetry;
      
      return (
    <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Telemetría en Tiempo Real Activa (cada 10s)
              {realTimeTelemetry && (
                <span className="text-xs text-green-600 ml-2">
                  Última actualización: {new Date(realTimeTelemetry.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
                  </div>

          {/* System Telemetry */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Monitor className="w-5 h-5 text-white" />
                </div>
              <h3 className="text-lg font-semibold text-blue-900">Sistema</h3>
              {realTimeTelemetry && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
              )}
                </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">CPU</div>
                <div className="text-xl font-bold text-blue-900">{telemetry.system.cpu}</div>
                  </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">RAM</div>
                <div className="text-xl font-bold text-blue-900">{telemetry.system.ram}</div>
                </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Disco</div>
                <div className="text-xl font-bold text-blue-900">{telemetry.system.disk}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Temperatura</div>
                <div className="text-xl font-bold text-blue-900">{telemetry.system.temperature}</div>
            </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200 md:col-span-2">
                <div className="text-sm text-blue-600 font-medium">Uptime</div>
                <div className="text-xl font-bold text-blue-900">{telemetry.system.uptime}</div>
          </div>
        </div>
                            </div>

          {/* Network Telemetry */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Wifi className="w-5 h-5 text-white" />
          </div>
              <h3 className="text-lg font-semibold text-green-900">Red</h3>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Ancho de Banda</div>
                <div className="text-xl font-bold text-green-900">{telemetry.network.bandwidth}</div>
        </div>
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Latencia</div>
                <div className="text-xl font-bold text-green-900">{telemetry.network.latency}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Pérdida de Paquetes</div>
                <div className="text-xl font-bold text-green-900">{telemetry.network.packetLoss}</div>
                </div>
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">IP</div>
                <div className="text-lg font-bold text-green-900">{telemetry.network.ip}</div>
                </div>
              <div className="bg-white rounded-xl p-4 border border-green-200 md:col-span-2">
                <div className="text-sm text-green-600 font-medium">ISP</div>
                <div className="text-lg font-bold text-green-900">{telemetry.network.isp}</div>
            </div>
            </div>
          </div>

          {/* Display Telemetry */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Monitor className="w-5 h-5 text-white" />
                  </div>
              <h3 className="text-lg font-semibold text-purple-900">Display</h3>
              </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Estado</div>
                <div className="text-xl font-bold text-purple-900">{telemetry.display.status}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Resolución</div>
                <div className="text-xl font-bold text-purple-900">{telemetry.display.resolution}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Brillo</div>
                <div className="text-xl font-bold text-purple-900">{telemetry.display.brightness}</div>
                </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Temperatura</div>
                <div className="text-xl font-bold text-purple-900">{telemetry.display.temperature}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200 md:col-span-2">
                <div className="text-sm text-purple-600 font-medium">Refresh Rate</div>
                <div className="text-xl font-bold text-purple-900">{telemetry.display.refreshRate}</div>
          </div>
        </div>
      </div>

          {/* Playback Telemetry */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Camera className="w-5 h-5 text-white" />
          </div>
              <h3 className="text-lg font-semibold text-orange-900">Reproducción</h3>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="text-sm text-orange-600 font-medium">FPS</div>
                <div className="text-xl font-bold text-orange-900">{telemetry.playback.fps}</div>
        </div>
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="text-sm text-orange-600 font-medium">Frame Drops</div>
                <div className="text-xl font-bold text-orange-900">{telemetry.playback.frameDrops}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="text-sm text-orange-600 font-medium">Calidad</div>
                <div className="text-xl font-bold text-orange-900">{telemetry.playback.videoQuality}</div>
                  </div>
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="text-sm text-orange-600 font-medium">Bitrate</div>
                <div className="text-xl font-bold text-orange-900">{telemetry.playback.bitrate}</div>
                  </div>
                </div>
              </div>

          {/* Proof of Play & System Events */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Proof of Play */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                <h3 className="text-lg font-semibold text-teal-900">Proof of Play</h3>
                  </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-700">Content Tracking</span>
                  <Check className="w-4 h-4 text-teal-600" />
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-700">Audiencia Estimada</span>
                  <Check className="w-4 h-4 text-teal-600" />
          </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-700">Geolocalización</span>
                  <Check className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-700">Campos Custom</span>
                  <Check className="w-4 h-4 text-teal-600" />
          </div>
        </div>
      </div>

            {/* System Events */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-500 rounded-lg">
                  <Settings className="w-5 h-5 text-white" />
          </div>
                <h3 className="text-lg font-semibold text-gray-900">Eventos de Sistema</h3>
          </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Arranque/Apagado</span>
                  <Check className="w-4 h-4 text-gray-600" />
        </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Stack Traces</span>
                  <Check className="w-4 h-4 text-gray-600" />
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Cambios de Red</span>
                  <Check className="w-4 h-4 text-gray-600" />
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Actualizaciones</span>
                  <Check className="w-4 h-4 text-gray-600" />
              </div>
          </div>
              </div>
              </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Telemetría Automática</h4>
                <p className="text-sm text-blue-700">
                  Todas las especificaciones técnicas se han completado automáticamente con datos en tiempo real 
                  del dispositivo Shareflow Screen. La telemetría se actualiza cada 10 segundos y el Proof of Play 
                  se registra en cada reproducción.
                </p>
                  </div>
                  </div>
      </div>
    </div>
  );
    }

    // Original manual specs form for non-Shareflow screens
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Especificaciones Técnicas</h3>
          <p className="text-gray-600">Ingresa los detalles técnicos de tu pantalla</p>
        </div>

        {/* Rest of the original manual form... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Specifications */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Especificaciones de Pantalla
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ancho (px)
                </label>
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1920"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alto (px)
                </label>
                <input
                    type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1080"
                />
              </div>
            </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolución
              </label>
              <select
                value={formData.resolution}
                onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar resolución</option>
                <option value="HD (1280x720)">HD (1280x720)</option>
                <option value="Full HD (1920x1080)">Full HD (1920x1080)</option>
                <option value="2K (2560x1440)">2K (2560x1440)</option>
                <option value="4K (3840x2160)">4K (3840x2160)</option>
                <option value="8K (7680x4320)">8K (7680x4320)</option>
              </select>
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Brillo (nits)
                </label>
                  <input
                    type="number"
                value={formData.brightness}
                onChange={(e) => setFormData(prev => ({ ...prev, brightness: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5000"
                  />
                </div>
              </div>

          {/* Additional Technical Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Detalles Adicionales
            </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Pantalla
                </label>
              <select
                value={formData.screenType}
                onChange={(e) => setFormData(prev => ({ ...prev, screenType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar tipo</option>
                <option value="LED">LED</option>
                <option value="OLED">OLED</option>
                <option value="LCD">LCD</option>
                <option value="E-Paper">E-Paper</option>
                <option value="Projection">Proyección</option>
              </select>
                </div>

              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientación
              </label>
              <select
                value={formData.orientation}
                onChange={(e) => setFormData(prev => ({ ...prev, orientation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar orientación</option>
                <option value="landscape">Horizontal (Landscape)</option>
                <option value="portrait">Vertical (Portrait)</option>
                <option value="square">Cuadrada</option>
              </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Conectividad
                </label>
                <div className="space-y-2">
                {['WiFi', 'Ethernet', '4G/5G', 'Bluetooth'].map((connectivity) => (
                  <label key={connectivity} className="flex items-center">
                  <input
                      type="checkbox"
                      checked={formData.connectivity?.includes(connectivity) || false}
                      onChange={(e) => {
                        const current = formData.connectivity || [];
                        if (e.target.checked) {
                        setFormData(prev => ({
                      ...prev,
                            connectivity: [...current, connectivity] 
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            connectivity: current.filter(c => c !== connectivity) 
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{connectivity}</span>
                  </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      // Convert photos to URLs (in real app, upload to server first)
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
        estimatedDailyImpressions: 1,
        impressionMultiplier: 1,
        coordinates: formData.coordinates,
        availability: true,
        connectionType: connectionType,
        category: formData.category,
        malePercentage: 1,
        femalePercentage: 1,
        ageDistribution: {
          ageGroup12To17: 1,
          ageGroup18To24: 1,
          ageGroup25To34: 1,
          ageGroup35To44: 1,
          ageGroup45To54: 1,
          ageGroup55To64: 1,
          ageGroup65Plus: 1
        },
        averageFillRate: 1,
        averageDwellTime: 1,
        peakHours: 'n/a',
        displayType: formData.screenType,
        width: formData.width,
        height: formData.height,
        resolution: formData.resolution,
        brightness: formData.brightness,
        orientation: formData.orientation,
        connectivity: formData.connectivity,
        totalFrames: 1,
        sellableFrames: 1,
        networkStatus: 'Online',
        playerModel: 'n/a',
        softwareVersion: 'n/a',
        postalCode: formData.locationData.postalCode,
        locationCode: 'n/a',
        timeZone: 'n/a',
        venueType: 'n/a',
        businessDensity: 1,
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
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setPhotos(prev => [...prev, ...files]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploadingPhotos(false);
    }, 1000);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 🆕 New render function for automatic categorization step (when using Shareflow Screen)
  const renderAutoCategoryStep = () => (
    <div className="space-y-6">
      {/* Step Header */}
              <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-green-600" />
              </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Categorización Automática</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Basado en la ubicación detectada, hemos identificado las mejores categorías para tu pantalla
        </p>
            </div>

      {/* Loading State */}
      {isClassifyingVenue && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-700 font-medium">Analizando ubicación con IA...</span>
                </div>
                </div>
              )}

      {/* AI Suggestions */}
      {!isClassifyingVenue && shareflowScreenData?.aiSuggestions && shareflowScreenData.aiSuggestions.length > 0 && (
          <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Categorías Sugeridas por IA</h4>
        </div>
                
          {shareflowScreenData.aiSuggestions.map((suggestion: EnhancedCategorySuggestion, index: number) => {
            // Get category data from taxonomy
            const categoryData = VENUE_TAXONOMY[suggestion.category];
            const parentCategory = categoryData?.parent || 'retail';
            const childCategory = categoryData?.child || 'mall';
            const Icon = PARENT_CATEGORY_ICONS[parentCategory] || Building2;
            
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                formData.category === suggestion.category
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, category: suggestion.category }))}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                      <h5 className="font-semibold text-gray-900">
                        {categoryData ? 
                          `${PARENT_CATEGORY_NAMES[parentCategory] || parentCategory} - ${CHILD_CATEGORY_NAMES[childCategory] || childCategory}` :
                          generateSpanishCategoryName(suggestion.category)
                        }
                      </h5>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-gray-600">
                            {suggestion.confidence}% confianza
                  </span>
                </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-gray-500">
                          {suggestion.environment === 'indoor' ? 'Interior' : 'Exterior'}
                        </span>
                        {categoryData && (
                          <>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span className="text-xs text-gray-500">
                              {DWELL_TIME_LABELS[categoryData.dwellTime] || categoryData.dwellTime}
                            </span>
                          </>
                        )}
                </div>
                  </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.reasoning}</p>
                  
                  {/* Additional category info */}
                  {categoryData && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {categoryData.audienceTypes.slice(0, 3).map((audience, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {AUDIENCE_TYPE_LABELS[audience] || audience.charAt(0).toUpperCase() + audience.slice(1).replace('_', ' ')}
                          </span>
                      ))}
                      {categoryData.audienceTypes.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{categoryData.audienceTypes.length - 3} más
                        </span>
                      )}
                  </div>
                  )}
                </div>
        
                {formData.category === suggestion.category && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Confidence Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Precisión de la IA</span>
                  <span>{suggestion.confidence}%</span>
            </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${suggestion.confidence}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
        </div>
              </div>
            </motion.div>
            );
          })}

          {/* Manual Override Option */}
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <h5 className="font-medium text-gray-900">¿No estás de acuerdo?</h5>
          </div>
            <p className="text-sm text-gray-600 mb-3">
              Si ninguna de las categorías sugeridas se ajusta a tu pantalla, puedes elegir manualmente.
            </p>
                     <button
              onClick={() => setShowManualCategorySelection(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                   >
              <Search className="w-4 h-4" />
              Seleccionar categoría manualmente
                     </button>
                 </div>
               </div>
      )}

      {/* Fallback when no AI suggestions are available */}
      {!isClassifyingVenue && (!shareflowScreenData?.aiSuggestions || shareflowScreenData.aiSuggestions.length === 0) && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
                       </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No se pudieron generar sugerencias</h4>
          <p className="text-gray-600 mb-4">
            No se pudo analizar automáticamente la ubicación. Puedes seleccionar una categoría manualmente.
          </p>
                   <button
            onClick={() => setShowManualCategorySelection(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                   >
            <Search className="w-4 h-4" />
            Seleccionar categoría manualmente
                   </button>
                 </div>
                     )}
               </div>
  );

  // Modified render functions to handle different flows
  const renderBasicStep = () => {
    // If using Shareflow Screen, skip location input since we already have coordinates
    if (connectionType === 'shareflow-screen') {
      // If manual category selection is requested, show category step
      if (showManualCategorySelection) {
        return renderCategoryStep();
      }
      // Otherwise show auto categorization
      return renderAutoCategoryStep();
    }
    // If manual, show the original basic step with location input
    return renderBasicTab();
  };

  const renderConnectionStep = (): JSX.Element => renderConnectionTypeStep();
  const renderTechnicalStep = (): JSX.Element => renderSpecsStep();
  const renderPackagesStep = (): JSX.Element => {
    const packageTypes = Object.keys(formData.packages) as (keyof typeof formData.packages)[];
    
    const getPackageIcon = (type: string) => {
      switch (type) {
        case 'moments': return Clock;
        case 'hourly': return Clock;
        case 'daily': return Calendar;
        case 'weekly': return Calendar;
        case 'monthly': return Calendar;
        default: return DollarSign;
      }
    };

    const getPackageColor = (type: string) => {
      switch (type) {
        case 'moments': return 'from-purple-100 to-pink-100';
        case 'hourly': return 'from-blue-100 to-cyan-100';
        case 'daily': return 'from-green-100 to-emerald-100';
        case 'weekly': return 'from-orange-100 to-yellow-100';
        case 'monthly': return 'from-red-100 to-rose-100';
        default: return 'from-gray-100 to-slate-100';
      }
    };

    const getPackageTitle = (type: string) => {
      switch (type) {
        case 'moments': return 'Momentos';
        case 'hourly': return 'Por Hora';
        case 'daily': return 'Diario';
        case 'weekly': return 'Semanal';
        case 'monthly': return 'Mensual';
        default: return type;
      }
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // 🆕 Filter packages based on connection type
    const availablePackageTypes = packageTypes.filter(packageType => {
      // Momentos solo disponible con Shareflow Screen
      if (packageType === 'moments') {
        return connectionType === 'shareflow-screen';
      }
      return true;
    });
    
    return (
      <div className="space-y-6">
        {/* Step Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Paquetes Comerciales</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Configure los precios y opciones de sus paquetes publicitarios
          </p>
                       </div>
              
        {/* 🆕 Spot Duration Configuration */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Duración de Spots</h4>
                <p className="text-sm text-gray-600">Selecciona la duración estándar para los anuncios</p>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {formData.spotDurationOptions.map((duration) => (
                       <button
                  key={duration}
                  onClick={() => updateSpotDuration(duration)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    formData.selectedSpotDuration === duration
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{duration}s</div>
                  <div className="text-xs opacity-75">
                    {duration === 15 ? 'Estándar' : duration < 15 ? 'Corto' : 'Largo'}
                  </div>
                       </button>
              ))}
                     </div>

            <div className="mt-4 p-3 bg-white rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4 text-purple-500" />
                <span>
                  Duración seleccionada: <strong>{formData.selectedSpotDuration} segundos</strong>
                  {formData.selectedSpotDuration === 15 && ' (Recomendado para mejor engagement)'}
                </span>
                         </div>
                   </div>
          </div>

          {/* 🆕 Momentos Notice - Solo con Shareflow Screen */}
          {connectionType !== 'shareflow-screen' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Paquete "Momentos" No Disponible</h4>
                  <p className="text-sm text-gray-600">
                    El paquete "Momentos" con precios dinámicos solo está disponible con conexión Shareflow Screen
                  </p>
               </div>
             </div>
            </div>
          )}

          {/* Package Types */}
          <div className="space-y-6">
            {availablePackageTypes.map((packageType) => {
              const packageData = formData.packages[packageType];
              const Icon = getPackageIcon(packageType);
              const isMomentsPackage = packageType === 'moments';
    
              return (
           <motion.div
                  key={packageType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-3xl overflow-hidden"
                >
                  {/* Package Header */}
                  <div className={`bg-gradient-to-r ${getPackageColor(packageType)} p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Icon className="w-6 h-6 text-gray-700" />
                 </div>
                 <div>
                          <h4 className="text-xl font-bold text-gray-900">{getPackageTitle(packageType)}</h4>
                          <p className="text-gray-600">
                            {isMomentsPackage ? (
                              <>Precios dinámicos según demanda • Tiempo real</>
                            ) : (
                              <>Configuración basada en variantes</>
                            )}
                          </p>
                 </div>
               </div>
                      <div className="flex items-center gap-4">
                        {isMomentsPackage && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">Dinámico</p>
                            <p className="text-sm text-gray-600">Según demanda</p>
                       </div>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                       <input
                            type="checkbox"
                            checked={packageData.enabled}
                            onChange={(e) => updatePackage(packageType, 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                     </div>

                  {/* Package Content */}
                  {packageData.enabled && (
                    <div className="p-6">
                      {isMomentsPackage ? (
                        /* 🆕 Momentos - Solo información, sin configuración */
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                              <Zap className="w-5 h-5 text-purple-600" />
                            </div>
                     <div>
                              <h5 className="font-semibold text-gray-900">Precios Dinámicos Activados</h5>
                              <p className="text-sm text-gray-600">Los precios se ajustan automáticamente según la demanda en tiempo real</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-purple-200">
                       <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Alta Demanda</span>
                       </div>
                              <p className="text-lg font-bold text-gray-900">+150% precio base</p>
                              <p className="text-xs text-gray-500">Eventos especiales, horas pico</p>
                     </div>

                            <div className="bg-white rounded-xl p-4 border border-purple-200">
                       <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Demanda Normal</span>
                       </div>
                              <p className="text-lg font-bold text-gray-900">Precio base</p>
                              <p className="text-xs text-gray-500">Horarios regulares</p>
                     </div>

                            <div className="bg-white rounded-xl p-4 border border-purple-200">
                       <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-gray-700">Baja Demanda</span>
                       </div>
                              <p className="text-lg font-bold text-gray-900">-30% precio base</p>
                              <p className="text-xs text-gray-500">Horarios de menor tráfico</p>
                     </div>
                   </div>

                          <div className="mt-4 p-3 bg-white rounded-xl border border-purple-200">
                            <div className="flex items-center gap-2 text-sm text-purple-700">
                              <Lightbulb className="w-4 h-4" />
                              <span>
                                <strong>Ventaja:</strong> Maximiza tus ingresos automáticamente sin intervención manual
                              </span>
                     </div>
                     </div>
                        </div>
                      ) : (
                        /* Paquetes normales - Solo configuración de variantes */
                        <>
                          {/* Package Variants */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-semibold text-gray-900">Variantes del Paquete</h5>
                     <button
                                onClick={() => addPackageVariant(packageType)}
                                className="inline-flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition-colors"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Variante
                     </button>
                   </div>

                            <div className="space-y-3">
                              {packageData.variants.map((variant, index) => (
                                <div key={variant.id} className="bg-gray-50 rounded-2xl p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={variant.enabled}
                                          onChange={(e) => updatePackageVariant(packageType, variant.id, 'enabled', e.target.checked)}
                                          className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                      </label>
                                      <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => updatePackageVariant(packageType, variant.id, 'name', e.target.value)}
                                        className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                        placeholder="Nombre de la variante"
                                      />
                 </div>
                                    <button
                                      onClick={() => removePackageVariant(packageType, variant.id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                     </div>

                                  {variant.enabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {/* 🆕 Precio - Input editable normal */}
                   <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
                                        <div className="relative">
                                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                           <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => updatePackageVariant(packageType, variant.id, 'price', parseInt(e.target.value) || 0)}
                                            className="w-full pl-7 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                               </div>
                               </div>
        
                                      {/* 🆕 Frecuencia - Dropdown no editable */}
                                      {(variant as any).frequencyType && (
                                        <div>
                                          <label className="block text-xs font-medium text-gray-600 mb-1">Frecuencia</label>
                                          <select
                                            value={(variant as any).frequencyType}
                                            onChange={(e) => updatePackageVariant(packageType, variant.id, 'frequencyType', e.target.value)}
                                            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                          >
                                            {getFrequencyOptions().map(option => (
                                              <option key={option.value} value={option.value}>
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                             </div>
                                      )}

                                      {/* 🆕 Frecuencia calculada - Solo lectura */}
                                      {(variant as any).calculatedFrequency && (
                                        <div>
                                          <label className="block text-xs font-medium text-gray-600 mb-1">Spots Calculados</label>
                                          <div className="px-2 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-700">
                                            {(variant as any).calculatedFrequency}
                         </div>
                     </div>
                                      )}

                                      {(variant as any).minDuration && (
                                        <div>
                                          <label className="block text-xs font-medium text-gray-600 mb-1">Duración Min (seg)</label>
                                          <input
                                            type="number"
                                            value={(variant as any).minDuration}
                                            onChange={(e) => updatePackageVariant(packageType, variant.id, 'minDuration', parseInt(e.target.value) || 0)}
                                            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                   </div>
                                      )}

                                      {(variant as any).maxDuration && (
                                        <div>
                                          <label className="block text-xs font-medium text-gray-600 mb-1">Duración Max (seg)</label>
                                          <input
                                            type="number"
                                            value={(variant as any).maxDuration}
                                            onChange={(e) => updatePackageVariant(packageType, variant.id, 'maxDuration', parseInt(e.target.value) || 0)}
                                            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                     </div>
                                      )}
                   </div>
                                  )}
                 </div>
                              ))}
                            </div>
                          </div>
                        </>
               )}
             </div>
                  )}
                </motion.div>
              );
            })}
          </div>
              
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 mt-6">
               <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                 </div>
              <h4 className="font-semibold text-gray-900">Resumen de Configuración</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div>
                <p className="text-sm text-gray-600">Duración Spot</p>
                <p className="text-lg font-bold text-gray-900">{formData.selectedSpotDuration}s</p>
                 </div>
                     <div>
                <p className="text-sm text-gray-600">Paquetes Activos</p>
                <p className="text-lg font-bold text-gray-900">
                  {availablePackageTypes.filter(type => formData.packages[type].enabled).length}
                </p>
                       </div>
                     <div>
                <p className="text-sm text-gray-600">Incluye Momentos</p>
                <p className="text-lg font-bold text-gray-900">
                  {connectionType === 'shareflow-screen' && formData.packages.moments?.enabled ? 'Sí' : 'No'}
                </p>
                       </div>
                       <div>
                <p className="text-sm text-gray-600">Tipo Conexión</p>
                <p className="text-lg font-bold text-gray-900">
                  {connectionType === 'shareflow-screen' ? 'Shareflow' : 'Manual'}
                </p>
                       </div>
                     </div>
                   </div>
        </div>
      </div>
    );
  };

  const renderEnhancedDataStep = (): JSX.Element => {
    // Return enhanced data step content  
    return <div>Enhanced Data Step Content</div>;
  };

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
                <p className="text-gray-900">
                  {formData.resolution || 
                   (formData.width && formData.height ? `${formData.width}x${formData.height}` : 'Sin especificar')}
                 </p>
               </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Orientación</p>
                <p className="text-gray-900">{formData.orientation || 'Sin especificar'}</p>
             </div>
               <div>
                <p className="text-sm font-medium text-gray-500">Conexión</p>
                <p className="text-gray-900">
                  {formData.connectionType === 'manual' ? 'Manual' : 
                   formData.connectionType === 'shareflow-screen' ? 'Shareflow Screen' :
                   formData.connectionType === 'broadsign' ? 'Broadsign' :
                   formData.connectionType === 'latinad' ? 'Latinad' : 'Sin especificar'}
                 </p>
               </div>
              {/* Mostrar datos adicionales si están disponibles */}
              {formData.brightness && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Brillo</p>
                  <p className="text-gray-900">{formData.brightness} nits</p>
           </div>
         )}
              {/* Para Shareflow Screen, mostrar estado de telemetría */}
              {connectionType === 'shareflow-screen' && (
               <div>
                  <p className="text-sm font-medium text-gray-500">Estado del Sistema</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-green-700 font-medium">Telemetría Activa</p>
             </div>
           </div>
         )}
              {(formData.connectionType === 'broadsign' || formData.connectionType === 'latinad') && (
      <div>
                  <p className="text-sm font-medium text-gray-500">Estado de Conexión</p>
          <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-blue-700 font-medium">Conectado</p>
      </div>
    </div>
              )}
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

  // 🆕 New render function for connection type selection (Step 1)
  const renderConnectionTypeStep = () => (
    <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Conectar Pantalla
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Elige cómo quieres configurar tu pantalla digital
                </p>
              </div>

      {/* Connection Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shareflow Screen Option */}
        <div 
          className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
            connectionType === 'shareflow-screen' 
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
          onClick={() => setConnectionType('shareflow-screen')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              connectionType === 'shareflow-screen' ? 'bg-blue-500' : 'bg-gray-100'
            }`}>
              <Zap className={`w-6 h-6 ${
                connectionType === 'shareflow-screen' ? 'text-white' : 'text-gray-600'
              }`} />
          </div>

              <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Shareflow Screen
                 </h4>
              <p className="text-sm text-gray-600 mb-4">
                Conecta automáticamente con tu dispositivo Shareflow Screen
                 </p>
              </div>
            
            <div className="space-y-2 text-xs text-left w-full">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Detección automática de ubicación</span>
            </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Configuración técnica automática</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Recomendaciones IA de categoría</span>
            </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Sincronización en tiempo real</span>
        </div>
      </div>
            
            {connectionType === 'shareflow-screen' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
          </div>
        </div>
            )}
              </div>
            </div>
            
        {/* Manual Configuration Option */}
        <div 
          className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
            connectionType === 'manual' 
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
          }`}
          onClick={() => setConnectionType('manual')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              connectionType === 'manual' ? 'bg-purple-500' : 'bg-gray-100'
            }`}>
              <Settings className={`w-6 h-6 ${
                connectionType === 'manual' ? 'text-white' : 'text-gray-600'
              }`} />
              </div>
            
              <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración Manual
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Configura manualmente todos los detalles de tu pantalla
              </p>
            </div>
            
            <div className="space-y-2 text-xs text-left w-full">
              <div className="flex items-center gap-2 text-blue-600">
                <Settings className="w-4 h-4" />
                <span>Control total de configuración</span>
            </div>
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin className="w-4 h-4" />
                <span>Ubicación personalizada</span>
          </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Building2 className="w-4 h-4" />
                <span>Selección manual de categoría</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Monitor className="w-4 h-4" />
                <span>Especificaciones técnicas custom</span>
            </div>
            </div>
            
            {connectionType === 'manual' && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                  </div>
              </div>
            )}
          </div>
          </div>
        </div>

      {/* Activation Code Section - Only show for Shareflow Screen */}
      {connectionType === 'shareflow-screen' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h5 className="text-lg font-semibold text-purple-900">Código de Activación</h5>
            </div>
            
          <p className="text-purple-800 mb-4">
            Ingresa el código que aparece en la pantalla de tu dispositivo Shareflow Screen para conectarlo.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Código de Activación del Dispositivo
              </label>
              <div className="relative">
              <input
                type="text"
                  value={userInputCode}
                  onChange={(e) => setUserInputCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC-123-XYZ"
                  className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                  maxLength={11}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
            </div>
            </div>
              <p className="text-xs text-purple-600 mt-1">
                El código aparece en la pantalla del dispositivo después de abrir el player
              </p>
            </div>
            
            {/* Activation Button */}
            <button
              onClick={handleActivation}
              disabled={!userInputCode || isActivating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Conectar Dispositivo
                </>
              )}
            </button>

            {/* Error Message */}
            {activationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{activationError}</span>
            </div>
            )}

            {/* Success Message */}
            {isActivated && shareflowScreenData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">¡Dispositivo Conectado!</span>
          </div>
          
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    Tu dispositivo se ha conectado exitosamente.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
                        <p className="text-sm font-medium text-green-900">Ubicación detectada:</p>
                        <p className="text-sm text-green-700">{shareflowScreenData.location}</p>
            </div>
            </div>
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">Coordenadas:</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-green-700 font-mono">
                            {shareflowScreenData.coordinates.lat.toFixed(6)}, {shareflowScreenData.coordinates.lng.toFixed(6)}
                          </p>
                          <button
                            onClick={() => {
                              const coords = `${shareflowScreenData.coordinates.lat.toFixed(6)}, ${shareflowScreenData.coordinates.lng.toFixed(6)}`;
                              navigator.clipboard.writeText(coords);
                            }}
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                            title="Copiar coordenadas"
                          >
                            <Copy className="w-3 h-3 text-green-600" />
                          </button>
            </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <Check className="w-3 h-3" />
                    <span>Datos del dispositivo sincronizados automáticamente</span>
          </div>
        </div>

                {/* Campos de nombre de pantalla */}
                <div className="bg-white rounded-lg p-4 border border-green-200 space-y-4">
                  <h6 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Configuración de Pantalla
                  </h6>
                  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Pantalla *
                      </label>
              <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Pantalla Centro Comercial"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Nombre público que verán los anunciantes
                      </p>
            </div>
                    
            <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Interno *
                      </label>
              <input
                        type="text"
                        value={formData.internalName}
                        onChange={(e) => setFormData(prev => ({ ...prev, internalName: e.target.value }))}
                        placeholder="Ej: SCREEN_CC_001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Identificador interno para gestión
                      </p>
              </div>
              </div>
              </div>
            </div>
            )}
                </div>
              </div>
        )}
      </div>
    );

  // State for real-time telemetry
  const [realTimeTelemetry, setRealTimeTelemetry] = useState<any>(null);
  const [telemetryInterval, setTelemetryInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to generate dynamic telemetry data
  const generateDynamicTelemetry = () => {
    const baseTime = Date.now();
    const variation = Math.random() * 0.2 - 0.1; // ±10% variation
    
    return {
      timestamp: new Date().toISOString(),
      system: {
        cpu: `${Math.round(45 + (Math.random() * 20 - 10))}%`, // 35-55%
        ram: `${(2.1 + variation).toFixed(1)}GB / 4GB`,
        disk: `${Math.round(128 + (Math.random() * 10 - 5))}GB / 256GB`,
        temperature: `${Math.round(42 + (Math.random() * 6 - 3))}°C`, // 39-45°C
        uptime: `15 días, ${Math.floor(8 + (baseTime % 3600000) / 150000)} horas`
      },
      network: {
        bandwidth: `${Math.round(100 + (Math.random() * 20 - 10))} Mbps`, // 90-110 Mbps
        latency: `${Math.round(12 + (Math.random() * 8 - 4))}ms`, // 8-16ms
        packetLoss: `${(0.1 + (Math.random() * 0.2 - 0.1)).toFixed(2)}%`, // 0.0-0.2%
        ip: '192.168.1.45',
        isp: 'Claro Colombia'
      },
      display: {
        status: 'Activo',
        resolution: '1920x1080',
        brightness: `${Math.round(5000 + (Math.random() * 200 - 100))} nits`, // 4900-5100 nits
        temperature: `${Math.round(38 + (Math.random() * 4 - 2))}°C`, // 36-40°C
        refreshRate: '60Hz'
      },
      playback: {
        fps: `${Math.round(60 + (Math.random() * 2 - 1))}`, // 59-61 fps
        frameDrops: `${(0.02 + (Math.random() * 0.03 - 0.015)).toFixed(3)}%`, // 0.005-0.035%
        videoQuality: 'HD',
        bitrate: `${(8 + (Math.random() * 2 - 1)).toFixed(1)} Mbps` // 7-9 Mbps
      }
    };
  };

  // Effect to handle real-time telemetry updates
  useEffect(() => {
    if (isActivated && shareflowScreenData && connectionType === 'shareflow-screen') {
      // Initialize telemetry
      const initialTelemetry = generateDynamicTelemetry();
      setRealTimeTelemetry(initialTelemetry);
      
      // Set up interval for updates every 10 seconds
      const interval = setInterval(() => {
        const newTelemetry = generateDynamicTelemetry();
        setRealTimeTelemetry(newTelemetry);
        
        // Update formData with new telemetry
    setFormData(prev => ({
      ...prev,
          systemSpecs: {
            ...prev.systemSpecs,
            cpu: newTelemetry.system.cpu,
            ram: newTelemetry.system.ram,
            storage: newTelemetry.system.disk,
            temperature: newTelemetry.system.temperature,
            uptime: newTelemetry.system.uptime,
            bandwidth: newTelemetry.network.bandwidth,
            latency: newTelemetry.network.latency,
            packetLoss: newTelemetry.network.packetLoss,
            displayTemp: newTelemetry.display.temperature,
            maxFps: newTelemetry.playback.fps,
            frameDropRate: newTelemetry.playback.frameDrops,
            maxBitrate: newTelemetry.playback.bitrate
          }
        }));
        
        console.log('🔄 Telemetría actualizada:', newTelemetry.timestamp);
      }, 10000); // 10 seconds
      
      setTelemetryInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Clear telemetry when not connected to Shareflow Screen
      if (telemetryInterval) {
        clearInterval(telemetryInterval);
        setTelemetryInterval(null);
      }
      setRealTimeTelemetry(null);
    }
  }, [isActivated, shareflowScreenData, connectionType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (telemetryInterval) {
        clearInterval(telemetryInterval);
      }
    };
  }, [telemetryInterval]);

  // Function to generate Spanish category names from category strings
  const generateSpanishCategoryName = (categoryString: string): string => {
    // Handle compound category strings like "retail_convenience_stores"
    const parts = categoryString.split('_');
    
    if (parts.length >= 2) {
      const parentKey = parts[0] as VenueParentCategory;
      const childKey = parts.slice(1).join('_') as VenueChildCategory;
      
      const parentName = PARENT_CATEGORY_NAMES[parentKey];
      const childName = CHILD_CATEGORY_NAMES[childKey];
      
      if (parentName && childName) {
        return `${parentName} - ${childName}`;
      }
    }
    
    // Fallback: capitalize and replace underscores
    return categoryString
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
                    <p className="text-white/80 text-sm">Paso {currentStep} de {connectionType === 'shareflow-screen' ? 6 : 7}</p>
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
                  <span>{Math.round((currentStep / (connectionType === 'shareflow-screen' ? 6 : 7)) * 100)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-white to-white/90 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (connectionType === 'shareflow-screen' ? 6 : 7)) * 100}%` }}
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
                { num: 1, title: "Conexión", icon: Wifi },
                { num: 2, title: connectionType === 'shareflow-screen' ? "Categoría" : "Ubicación", icon: connectionType === 'shareflow-screen' ? Target : MapPin },
                { num: 3, title: connectionType === 'shareflow-screen' ? "Técnico" : "Categoría", icon: connectionType === 'shareflow-screen' ? Settings : Target },
                { num: 4, title: connectionType === 'shareflow-screen' ? "Paquetes" : "Técnico", icon: connectionType === 'shareflow-screen' ? DollarSign : Settings },
                { num: 5, title: connectionType === 'shareflow-screen' ? "Fotos" : "Paquetes", icon: connectionType === 'shareflow-screen' ? Camera : DollarSign },
                { num: 6, title: connectionType === 'shareflow-screen' ? "Crear" : "Fotos", icon: connectionType === 'shareflow-screen' ? CheckCircle : Camera },
                { num: 7, title: "Crear", icon: CheckCircle }
              ].filter((step, index) => {
                // For Shareflow Screen, we have 6 steps total (skip step 7)
                // For Manual, we have 7 steps total
                if (connectionType === 'shareflow-screen' && step.num === 7) {
                  return false;
                }
                return true;
              }).map(({ num, title, icon: Icon }) => (
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
              {currentStep === 1 && renderConnectionStep()}
              {currentStep === 2 && renderBasicStep()}
              {currentStep === 3 && (connectionType === 'shareflow-screen' ? renderTechnicalStep() : renderCategoryStep())}
              {currentStep === 4 && (connectionType === 'shareflow-screen' ? renderPackagesStep() : renderTechnicalStep())}
              {currentStep === 5 && (connectionType === 'shareflow-screen' ? renderPhotosStep() : renderPackagesStep())}
              {currentStep === 6 && (connectionType === 'shareflow-screen' ? renderCreateScreenStep() : renderPhotosStep())}
              {currentStep === 7 && connectionType === 'manual' && renderCreateScreenStep()}
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
                  onClick={currentStep === (connectionType === 'shareflow-screen' ? 6 : 7) ? handleSubmit : goToNextStep}
                  disabled={isLoading || !validateStep(currentStep)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStep === (connectionType === 'shareflow-screen' ? 6 : 7) ? (
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
                  onClick={currentStep === (connectionType === 'shareflow-screen' ? 6 : 7) ? handleSubmit : goToNextStep}
                  disabled={isLoading || !validateStep(currentStep)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStep === (connectionType === 'shareflow-screen' ? 6 : 7) ? (
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