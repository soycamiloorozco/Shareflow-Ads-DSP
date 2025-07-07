import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ================================
// UNIFIED DESIGN SYSTEM
// ================================

const DESIGN_SYSTEM = {
  // Color Palette - Single source of truth
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe', 
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    
    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    
    warning: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04'
    },
    
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626'
    },
    
    // Neutral grays
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    }
  },
  
  // Consistent spacing scale
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px  
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },
  
  // Border radius system
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem'  // 24px
  },
  
  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  },
  
  // Typography scale
  text: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'   // 36px
  },
  
  // Font weights
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

// ================================
// UNIFIED COMPONENT STYLES
// ================================

const UI_CLASSES = {
  // Container styles
  container: {
    section: 'bg-white rounded-lg border border-gray-200',
    card: 'bg-white rounded-lg border border-gray-200 p-6',
    cardCompact: 'bg-white rounded-md border border-gray-200 p-4',
    cardGlass: 'bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 p-6'
  },
  
  // Spacing
  padding: {
    section: 'p-6',
    card: 'p-4',
    compact: 'p-3',
    button: 'px-4 py-2'
  },
  
  margin: {
    section: 'mb-6',
    element: 'mb-4',
    compact: 'mb-3'
  },
  
  // Typography
  heading: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-semibold text-gray-900', 
    h3: 'text-xl font-semibold text-gray-900',
    h4: 'text-lg font-medium text-gray-900',
    h5: 'text-base font-medium text-gray-900'
  },
  
  text: {
    body: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
    label: 'text-sm font-medium text-gray-700',
    muted: 'text-xs text-gray-400'
  },
  
  // Interactive states
  interactive: {
    hover: 'hover:bg-gray-50 transition-colors duration-200',
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed'
  }
};

// ================================
// UNIFIED HELPER FUNCTIONS
// ================================

// Generate consistent card classes
const getCardClasses = (variant: 'default' | 'compact' | 'glass' = 'default') => {
  const baseClasses = 'rounded-lg border';
  
  switch (variant) {
    case 'compact':
      return `${baseClasses} bg-white border-gray-200 p-4`;
    case 'glass':
      return `${baseClasses} bg-white/80 backdrop-blur-sm border-gray-200/50 p-6`;
    default:
      return `${baseClasses} bg-white border-gray-200 p-6`;
  }
};

// Generate consistent button classes
const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  switch (variant) {
    case 'secondary':
      return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500`;
    case 'ghost':
      return `${baseClasses} bg-transparent text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900 focus:ring-blue-500`;
    default:
      return `${baseClasses} bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
  }
};

// Generate consistent spacing classes
const getSpacingClasses = (size: 'sm' | 'md' | 'lg' = 'md') => {
  switch (size) {
    case 'sm':
      return 'p-4 gap-3';
    case 'lg':
      return 'p-8 gap-6';
    default:
      return 'p-6 gap-4';
  }
};
import {
  Users,
  Building,
  TrendingUp,
  Star,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Clock,
  MoreVertical,
  FileText,
  Monitor,
  BarChart3,
  Info,
  ShoppingCart,
  Zap,
  Database,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Settings,
  Layers,
  Globe,
  Server,
  Upload,
  Crown,
  Shield,
  User,
  Building2,
  Wallet,
  CreditCard,
  XCircle,
  Globe2,
  Crosshair,
  Locate,
  Navigation2,
  Compass,
  Route
} from 'lucide-react';
import toast from 'react-hot-toast';

// ================================
// INTERFACES
// ================================
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'partner_owner' | 'partner_admin' | 'partner_user' | 'partner_financial';
  status: 'active' | 'pending';
  joinedAt: string;
  permissions: {
    canViewBilling: boolean;
    canModifyBankAccount: boolean;
    canManageTeam: boolean;
    canViewAnalytics: boolean;
    canGenerateReports: boolean;
  };
}

interface PaymentMethod {
  preferredMethod: 'bank' | 'paypal' | 'payoneer';
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
    swiftCode: string;
    routingNumber: string;
    accountHolderName: string;
    verified: boolean;
  };
  paypal: {
    email: string;
    verified: boolean;
  };
  payoneer: {
    email: string;
    verified: boolean;
  };
}

interface Partner {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  lastActivity: string;
  revenue: number;
  screens: number;
  performance: number;
  avatar?: string;
  description?: string;
  contractEndDate?: string;
  commission: number;
  customMargin?: number;
  programmaticMargin?: number;
  grossMargin: number;
  // Network Performance Data
  networkInventory: {
    totalScreens: number;
    activeScreens: number;
    inactiveScreens: number;
    maintenanceScreens: number;
    fillRate: number; // Percentage of time screens are showing content
    avgCPM: number;
    totalImpressions: number;
    uptime: number; // Network uptime percentage
  };
  // Geographic Coverage
  cities: string[];
  regions: string[];
  marketplaceMargins: {
    momentos: number;
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  teamMembers: TeamMember[];
  paymentMethods: PaymentMethod;
  cmsIntegration: {
    provider: 'shareflow-screen' | 'broadsign' | 'latinad' | 'api' | 'manual';
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    screensImported: number;
    integrationHealth: 'excellent' | 'good' | 'warning' | 'critical';
    lastSync: string;
    apiVersion?: string;
    connectionDetails?: {
      endpoint?: string;
      authMethod?: string;
      capabilities?: string[];
    };
  };
  screenActivity: {
    addedThisWeek: number;
    addedThisMonth: number;
    lastScreenAdded: string;
    lastContentUpdate: string;
    lastPaymentReceived: string;
  };
  // Sports Events Configuration
  sportsEventsPermissions: {
    canCreateSportsEvents: boolean; // Permission from CreatePartnerData
    canManageEventPricing: boolean; // Can modify event pricing
    canViewEventAnalytics: boolean; // Can access event performance data
  };
  sportsEventsMargins?: SportsEventsMargin; // Only if sports events are enabled
  // Financial Metrics
  financialMetrics: {
    ltv: number; // Lifetime Value - total value generated for Shareflow
    totalTransactions: number; // Total number of user transactions
    transactionsThisMonth: number; // Transactions this month
    totalPaidToDate: number; // Total amount paid to partner
    nextPaymentDate: string; // Next scheduled payment date
    nextPaymentAmount: number; // Amount of next payment
    averageTransactionValue: number; // Average value per transaction
    monthlyRecurringRevenue: number; // MRR generated through this partner
    conversionRate: number; // Percentage of visitors that convert
    revenueGrowthRate: number; // Month over month revenue growth
    paymentFrequency: 'weekly' | 'biweekly' | 'monthly'; // How often payments are made
    lastPaymentDate: string; // Date of last payment
    pendingBalance: number; // Amount pending to be paid
  };
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface CreatePartnerData {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  permissions: {
    canManageContent: boolean; // Gestionar contenidos (CMS) - solo para shareflow screen
    canManageSSP: boolean; // Listar pantallas (SSP) y aprobar contenidos programáticos
    canCreateSportsEvents: boolean; // Eventos deportivos
    canAccessAnalytics: boolean; // Analytics avanzados
  };
}

interface EditingMargin {
  partnerId: string;
  currentMargin: number;
  newMargin: number;
  currentProgrammaticMargin: number;
  newProgrammaticMargin: number;
  marginType: 'marketplace' | 'programmatic' | 'both';
  currentMarketplaceMargins: {
    momentos: number;
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  newMarketplaceMargins: {
    momentos: number;
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// New interfaces for Sports Events
interface SportsEventsMomentPricing {
  firstHalf: number;
  halftime: number;
  secondHalf: number;
}

interface SportsEventsMargin {
  enabled: boolean;
  momentPricing: SportsEventsMomentPricing;
  generalMargin: number; // Overall margin for sports events
  eventTypes: {
    football: number;
    basketball: number;
    baseball: number;
    tennis: number;
    volleyball: number;
  };
}

// Geolocation Interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ScreenLocation {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  city: string;
  region: string;
  partnerId: string;
  isActive: boolean;
  screenType: 'digital' | 'led' | 'billboard' | 'transit';
  specifications: {
    size: string;
    resolution: string;
    brightness: number;
  };
}

interface LocationFilter {
  city?: string;
  region?: string;
  radius?: {
    center: Coordinates;
    kilometers: number;
  };
  screenTypes?: string[];
  partnerId?: string;
}

interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface RadiusTargeting {
  center: Coordinates;
  radius: number; // in kilometers
  selectedScreens: string[];
  estimatedReach: number;
  averageCPM: number;
}

// Mock Geolocation Data
const mockScreenLocations: ScreenLocation[] = [
  // MediaCorp Digital screens
  {
    id: 'scr-1',
    name: 'Centro Comercial Santafé',
    address: 'Av. 185 #45-03, Bogotá',
    coordinates: { latitude: 4.7230, longitude: -74.0430 },
    city: 'Bogotá',
    region: 'Cundinamarca',
    partnerId: '1',
    isActive: true,
    screenType: 'digital',
    specifications: { size: '3x2m', resolution: '1920x1080', brightness: 2500 }
  },
  {
    id: 'scr-2',
    name: 'Terminal de Transportes',
    address: 'Diagonal 23 #69-60, Bogotá',
    coordinates: { latitude: 4.6460, longitude: -74.1030 },
    city: 'Bogotá',
    region: 'Cundinamarca',
    partnerId: '1',
    isActive: true,
    screenType: 'led',
    specifications: { size: '4x3m', resolution: '2560x1440', brightness: 3000 }
  },
  {
    id: 'scr-3',
    name: 'Centro Histórico Cartagena',
    address: 'Plaza de los Coches, Cartagena',
    coordinates: { latitude: 10.4236, longitude: -75.5516 },
    city: 'Cartagena',
    region: 'Bolívar',
    partnerId: '1',
    isActive: true,
    screenType: 'digital',
    specifications: { size: '3x2m', resolution: '1920x1080', brightness: 2800 }
  },
  // Outdoor Solutions screens
  {
    id: 'scr-4',
    name: 'El Poblado Centro',
    address: 'Carrera 43A #11A-80, Medellín',
    coordinates: { latitude: 6.2088, longitude: -75.5646 },
    city: 'Medellín',
    region: 'Antioquia',
    partnerId: '2',
    isActive: true,
    screenType: 'led',
    specifications: { size: '5x3m', resolution: '2560x1440', brightness: 3200 }
  },
  {
    id: 'scr-5',
    name: 'Metro Envigado',
    address: 'Estación Envigado, Medellín',
    coordinates: { latitude: 6.1659, longitude: -75.5911 },
    city: 'Envigado',
    region: 'Antioquia',
    partnerId: '2',
    isActive: false,
    screenType: 'transit',
    specifications: { size: '2x1.5m', resolution: '1680x1050', brightness: 2000 }
  },
  // Digital Screens Network screens
  {
    id: 'scr-6',
    name: 'Chipichape Centro Comercial',
    address: 'Av. 6N #28N-159, Cali',
    coordinates: { latitude: 3.4872, longitude: -76.5479 },
    city: 'Cali',
    region: 'Valle del Cauca',
    partnerId: '3',
    isActive: true,
    screenType: 'digital',
    specifications: { size: '3x2m', resolution: '1920x1080', brightness: 2400 }
  },
  {
    id: 'scr-7',
    name: 'Palmira Central',
    address: 'Carrera 29 #27-50, Palmira',
    coordinates: { latitude: 3.5394, longitude: -76.3036 },
    city: 'Palmira',
    region: 'Valle del Cauca',
    partnerId: '3',
    isActive: true,
    screenType: 'billboard',
    specifications: { size: '6x3m', resolution: '2560x1440', brightness: 4000 }
  },
  // Premium Display screens
  {
    id: 'scr-8',
    name: 'Aeropuerto El Dorado',
    address: 'Terminal 1, Bogotá',
    coordinates: { latitude: 4.7016, longitude: -74.1469 },
    city: 'Bogotá',
    region: 'Cundinamarca',
    partnerId: '4',
    isActive: true,
    screenType: 'digital',
    specifications: { size: '4x2.5m', resolution: '3840x2160', brightness: 3500 }
  },
  {
    id: 'scr-9',
    name: 'Centro Barranquilla',
    address: 'Carrera 53 #75-48, Barranquilla',
    coordinates: { latitude: 10.9878, longitude: -74.7889 },
    city: 'Barranquilla',
    region: 'Atlántico',
    partnerId: '4',
    isActive: true,
    screenType: 'led',
    specifications: { size: '5x3m', resolution: '2560x1440', brightness: 3800 }
  }
];

// Default map center (Colombia)
const DEFAULT_MAP_CENTER: Coordinates = {
  latitude: 4.5709,
  longitude: -74.2973
};

// Partner color palette for map visualization
const PARTNER_COLORS = {
  '1': { // MediaCorp Digital
    primary: '#3B82F6',
    secondary: '#93C5FD',
    name: 'MediaCorp Digital'
  },
  '2': { // Outdoor Solutions
    primary: '#10B981',
    secondary: '#6EE7B7',
    name: 'Outdoor Solutions'
  },
  '3': { // Digital Screens Network
    primary: '#F59E0B',
    secondary: '#FCD34D',
    name: 'Digital Screens Network'
  },
  '4': { // Premium Display
    primary: '#EF4444',
    secondary: '#FCA5A5',
    name: 'Premium Display'
  },
  '5': { // Urban Media
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    name: 'Urban Media'
  },
  '6': { // City Screens
    primary: '#F97316',
    secondary: '#FDBA74',
    name: 'City Screens'
  },
  '7': { // Digital Vision
    primary: '#EC4899',
    secondary: '#F9A8D4',
    name: 'Digital Vision'
  },
  '8': { // Smart Displays
    primary: '#06B6D4',
    secondary: '#67E8F9',
    name: 'Smart Displays'
  },
  default: {
    primary: '#6B7280',
    secondary: '#D1D5DB',
    name: 'Sin Asignar'
  }
};

// Helper function to get partner color
const getPartnerColor = (partnerId: string): { primary: string; secondary: string; name: string } => {
  return PARTNER_COLORS[partnerId as keyof typeof PARTNER_COLORS] || PARTNER_COLORS.default;
};

// Mock Data
const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'MediaCorp Digital S.A.S',
    contactPerson: 'Juan Pérez',
    email: 'juan.perez@mediacorp.co',
    phone: '+57 300 123 4567',
    location: 'Bogotá, Colombia',
    status: 'active',
    tier: 'gold',
    joinDate: '2023-01-15',
    lastActivity: '2024-01-08',
    revenue: 85000000,
    screens: 24,
    performance: 94,
    commission: 15,
    description: 'Líder en publicidad digital exterior en Colombia',
    contractEndDate: '2024-12-31',
    customMargin: 30,
    programmaticMargin: 25,
    grossMargin: 30,
    networkInventory: {
      totalScreens: 24,
      activeScreens: 22,
      inactiveScreens: 1,
      maintenanceScreens: 1,
      fillRate: 89.5,
      avgCPM: 12500,
      totalImpressions: 2450000,
      uptime: 98.2
    },
    cities: ['Bogotá', 'Cali', 'Barranquilla', 'Cartagena'],
    regions: ['Cundinamarca', 'Valle del Cauca', 'Atlántico', 'Bolívar'],
    marketplaceMargins: {
      momentos: 30,
      hourly: 28,
      daily: 25,
      weekly: 22,
      monthly: 20
    },
    teamMembers: [
      {
        id: 'tm-1',
        name: 'Carlos Mendoza',
        email: 'carlos@mediacorp.co',
        role: 'partner_owner',
        status: 'active',
        joinedAt: '2024-01-15',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: true,
          canManageTeam: true,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      },
      {
        id: 'tm-2',
        name: 'Ana García',
        email: 'ana@mediacorp.co',
        role: 'partner_admin',
        status: 'active',
        joinedAt: '2024-02-20',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: true,
          canManageTeam: true,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      },
      {
        id: 'tm-3',
        name: 'Miguel Torres',
        email: 'miguel@mediacorp.co',
        role: 'partner_financial',
        status: 'active',
        joinedAt: '2024-03-10',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: false,
          canManageTeam: false,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      }
    ],
    paymentMethods: {
      preferredMethod: 'bank',
      bankAccount: {
        bankName: 'Banco de Bogotá',
        accountNumber: '****5678',
        accountType: 'checking',
        swiftCode: 'BOGOCOBB',
        routingNumber: '001234',
        accountHolderName: 'MediaCorp Digital S.A.S.',
        verified: true
      },
      paypal: {
        email: 'payments@mediacorp.co',
        verified: true
      },
      payoneer: {
        email: 'finance@mediacorp.co',
        verified: false
      }
    },
    cmsIntegration: {
      provider: 'broadsign',
      status: 'connected',
      screensImported: 24,
      integrationHealth: 'excellent',
      lastSync: '2024-01-06T10:30:00',
      apiVersion: 'v2.1',
      connectionDetails: {
        endpoint: 'https://api.broadsign.com',
        authMethod: 'OAuth 2.0',
        capabilities: ['content-delivery', 'real-time-metrics', 'scheduling']
      }
    },
    screenActivity: {
      addedThisWeek: 2,
      addedThisMonth: 5,
      lastScreenAdded: '2024-05-27',
      lastContentUpdate: '2024-05-29',
      lastPaymentReceived: '2024-05-14'
    },
    sportsEventsPermissions: {
      canCreateSportsEvents: true, // MediaCorp has sports events enabled
      canManageEventPricing: true,
      canViewEventAnalytics: true
    },
    sportsEventsMargins: {
      enabled: true,
      momentPricing: {
        firstHalf: 2500000,
        halftime: 1800000,
        secondHalf: 2500000
      },
      generalMargin: 25,
      eventTypes: {
        football: 28,
        basketball: 22,
        baseball: 20,
        tennis: 18,
        volleyball: 15
      }
    },
    financialMetrics: {
      ltv: 125000000, // 125M COP lifetime value
      totalTransactions: 1245,
      transactionsThisMonth: 89,
      totalPaidToDate: 38250000, // 38.25M COP paid to date
      nextPaymentDate: '2024-06-15',
      nextPaymentAmount: 12750000, // 12.75M COP next payment
      averageTransactionValue: 68200, // 68.2K COP average
      monthlyRecurringRevenue: 7100000, // 7.1M COP monthly
      conversionRate: 8.4, // 8.4% conversion rate
      revenueGrowthRate: 12.3, // 12.3% growth
      paymentFrequency: 'biweekly',
      lastPaymentDate: '2024-05-15',
      pendingBalance: 12750000 // 12.75M COP pending
    }
  },
  {
    id: '2',
    name: 'Outdoor Solutions Ltda',
    contactPerson: 'María García',
    email: 'maria.garcia@outdoorsolutions.co',
    phone: '+57 310 987 6543',
    location: 'Medellín, Colombia',
    status: 'active',
    tier: 'silver',
    joinDate: '2023-03-20',
    lastActivity: '2024-01-07',
    revenue: 42000000,
    screens: 12,
    performance: 87,
    commission: 12,
    description: 'Especialistas en pantallas LED para exteriores',
    contractEndDate: '2024-09-30',
    customMargin: 25,
    programmaticMargin: 20,
    grossMargin: 25,
    networkInventory: {
      totalScreens: 12,
      activeScreens: 11,
      inactiveScreens: 1,
      maintenanceScreens: 0,
      fillRate: 82.3,
      avgCPM: 9800,
      totalImpressions: 1350000,
      uptime: 95.5
    },
    cities: ['Medellín', 'Envigado', 'Itagüí'],
    regions: ['Antioquia'],
    marketplaceMargins: {
      momentos: 25,
      hourly: 23,
      daily: 20,
      weekly: 18,
      monthly: 15
    },
    teamMembers: [
      {
        id: 'tm-4',
        name: 'Laura Vásquez',
        email: 'laura@outdoorsolutions.co',
        role: 'partner_owner',
        status: 'active',
        joinedAt: '2023-09-15',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: true,
          canManageTeam: true,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      },
      {
        id: 'tm-5',
        name: 'Roberto Silva',
        email: 'roberto@outdoorsolutions.co',
        role: 'partner_user',
        status: 'active',
        joinedAt: '2024-01-20',
        permissions: {
          canViewBilling: false,
          canModifyBankAccount: false,
          canManageTeam: false,
          canViewAnalytics: false,
          canGenerateReports: false
        }
      }
    ],
    paymentMethods: {
      preferredMethod: 'paypal',
      bankAccount: {
        bankName: 'Bancolombia',
        accountNumber: '****1234',
        accountType: 'savings',
        swiftCode: 'COLOCOBB',
        routingNumber: '007890',
        accountHolderName: 'Outdoor Solutions Ltda.',
        verified: false
      },
      paypal: {
        email: 'payments@outdoorsolutions.co',
        verified: true
      },
      payoneer: {
        email: 'finance@outdoorsolutions.co',
        verified: false
      }
    },
    cmsIntegration: {
      provider: 'shareflow-screen',
      status: 'connected',
      screensImported: 12,
      integrationHealth: 'good',
      lastSync: '2024-01-07T08:15:00',
      apiVersion: 'v1.0',
      connectionDetails: {
        endpoint: 'https://screen.shareflow.me',
        authMethod: 'API Key',
        capabilities: ['content-management', 'scheduling', 'real-time-control']
      }
    },
    screenActivity: {
      addedThisWeek: 1,
      addedThisMonth: 3,
      lastScreenAdded: '2024-05-25',
      lastContentUpdate: '2024-05-28',
      lastPaymentReceived: '2024-05-12'
    },
    sportsEventsPermissions: {
      canCreateSportsEvents: false, // Outdoor Solutions doesn't have sports events enabled
      canManageEventPricing: false,
      canViewEventAnalytics: false
    },
    financialMetrics: {
      ltv: 58000000, // 58M COP lifetime value
      totalTransactions: 687,
      transactionsThisMonth: 52,
      totalPaidToDate: 19500000, // 19.5M COP paid to date
      nextPaymentDate: '2024-06-08',
      nextPaymentAmount: 3200000, // 3.2M COP next payment
      averageTransactionValue: 61150, // 61.15K COP average
      monthlyRecurringRevenue: 3500000, // 3.5M COP monthly
      conversionRate: 6.8, // 6.8% conversion rate
      revenueGrowthRate: 8.7, // 8.7% growth
      paymentFrequency: 'weekly',
      lastPaymentDate: '2024-05-01',
      pendingBalance: 3200000 // 3.2M COP pending
    }
  },
  {
    id: '3',
    name: 'Digital Screens Network',
    contactPerson: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@dsnetwork.co',
    phone: '+57 320 456 7890',
    location: 'Cali, Colombia',
    status: 'pending',
    tier: 'bronze',
    joinDate: '2023-11-10',
    lastActivity: '2024-01-05',
    revenue: 18000000,
    screens: 6,
    performance: 72,
    commission: 10,
    description: 'Red emergente de pantallas digitales urbanas',
    customMargin: 20,
    programmaticMargin: 15,
    grossMargin: 20,
    networkInventory: {
      totalScreens: 6,
      activeScreens: 5,
      inactiveScreens: 0,
      maintenanceScreens: 1,
      fillRate: 75.8,
      avgCPM: 8200,
      totalImpressions: 580000,
      uptime: 91.2
    },
    cities: ['Cali', 'Palmira'],
    regions: ['Valle del Cauca'],
    marketplaceMargins: {
      momentos: 20,
      hourly: 18,
      daily: 15,
      weekly: 12,
      monthly: 10
    },
    teamMembers: [
      {
        id: 'tm-6',
        name: 'Carlos Rodríguez',
        email: 'carlos@dsnetwork.co',
        role: 'partner_owner',
        status: 'active',
        joinedAt: '2023-11-10',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: true,
          canManageTeam: true,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      },
      {
        id: 'tm-7',
        name: 'Sofia Morales',
        email: 'sofia@dsnetwork.co',
        role: 'partner_financial',
        status: 'pending',
        joinedAt: '2024-05-12',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: false,
          canManageTeam: false,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      }
    ],
    paymentMethods: {
      preferredMethod: 'bank',
      bankAccount: {
        bankName: 'Banco Popular',
        accountNumber: '****9876',
        accountType: 'checking',
        swiftCode: 'BPOPCO22',
        routingNumber: '012345',
        accountHolderName: 'Digital Screens Network S.A.S.',
        verified: true
      },
      paypal: {
        email: 'payments@dsnetwork.co',
        verified: false
      },
      payoneer: {
        email: 'finance@dsnetwork.co',
        verified: false
      }
    },
    cmsIntegration: {
      provider: 'latinad',
      status: 'connected',
      screensImported: 6,
      integrationHealth: 'warning',
      lastSync: '2024-01-05T14:20:00',
      apiVersion: 'v1.2',
      connectionDetails: {
        endpoint: 'https://api.latinad.com',
        authMethod: 'Bearer Token',
        capabilities: ['content-receiving', 'metrics-reporting']
      }
    },
    screenActivity: {
      addedThisWeek: 0,
      addedThisMonth: 1,
      lastScreenAdded: '2024-05-20',
      lastContentUpdate: '2024-05-26',
      lastPaymentReceived: '2024-05-10'
    },
    sportsEventsPermissions: {
      canCreateSportsEvents: false, // Digital Screens Network doesn't have sports events enabled
      canManageEventPricing: false,
      canViewEventAnalytics: false
    },
    financialMetrics: {
      ltv: 24500000, // 24.5M COP lifetime value
      totalTransactions: 312,
      transactionsThisMonth: 18,
      totalPaidToDate: 7350000, // 7.35M COP paid to date
      nextPaymentDate: '2024-06-01',
      nextPaymentAmount: 1500000, // 1.5M COP next payment
      averageTransactionValue: 57850, // 57.85K COP average
      monthlyRecurringRevenue: 1500000, // 1.5M COP monthly
      conversionRate: 4.2, // 4.2% conversion rate
      revenueGrowthRate: 3.1, // 3.1% growth (slower growth)
      paymentFrequency: 'monthly',
      lastPaymentDate: '2024-05-01',
      pendingBalance: 1500000 // 1.5M COP pending
    }
  },
  {
    id: '4',
    name: 'Premium Display Co.',
    contactPerson: 'Ana Martínez',
    email: 'ana.martinez@premiumdisplay.co',
    phone: '+57 315 234 5678',
    location: 'Barranquilla, Colombia',
    status: 'inactive',
    tier: 'platinum',
    joinDate: '2022-08-12',
    lastActivity: '2023-12-15',
    revenue: 120000000,
    screens: 35,
    performance: 91,
    commission: 18,
    description: 'Partner premium con cobertura nacional',
    contractEndDate: '2024-08-12',
    customMargin: 35,
    programmaticMargin: 30,
    grossMargin: 35,
    networkInventory: {
      totalScreens: 35,
      activeScreens: 32,
      inactiveScreens: 2,
      maintenanceScreens: 1,
      fillRate: 94.2,
      avgCPM: 15800,
      totalImpressions: 4250000,
      uptime: 99.1
    },
    cities: ['Barranquilla', 'Santa Marta', 'Cartagena', 'Bogotá', 'Medellín', 'Cali'],
    regions: ['Atlántico', 'Magdalena', 'Bolívar', 'Cundinamarca', 'Antioquia', 'Valle del Cauca'],
    marketplaceMargins: {
      momentos: 35,
      hourly: 32,
      daily: 30,
      weekly: 28,
      monthly: 25
    },
    teamMembers: [
      {
        id: 'tm-8',
        name: 'Ana Martínez',
        email: 'ana@premiumdisplay.co',
        role: 'partner_owner',
        status: 'active',
        joinedAt: '2022-08-12',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: true,
          canManageTeam: true,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      },
      {
        id: 'tm-9',
        name: 'Javier López',
        email: 'javier@premiumdisplay.co',
        role: 'partner_admin',
        status: 'active',
        joinedAt: '2022-10-15',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: true,
          canManageTeam: true,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      },
      {
        id: 'tm-10',
        name: 'Patricia Hernández',
        email: 'patricia@premiumdisplay.co',
        role: 'partner_financial',
        status: 'active',
        joinedAt: '2023-01-20',
        permissions: {
          canViewBilling: true,
          canModifyBankAccount: false,
          canManageTeam: false,
          canViewAnalytics: true,
          canGenerateReports: true
        }
      },
      {
        id: 'tm-11',
        name: 'Luis Ramírez',
        email: 'luis@premiumdisplay.co',
        role: 'partner_user',
        status: 'active',
        joinedAt: '2023-03-10',
        permissions: {
          canViewBilling: false,
          canModifyBankAccount: false,
          canManageTeam: false,
          canViewAnalytics: false,
          canGenerateReports: false
        }
      }
    ],
    paymentMethods: {
      preferredMethod: 'payoneer',
      bankAccount: {
        bankName: 'Banco Davivienda',
        accountNumber: '****4567',
        accountType: 'checking',
        swiftCode: 'DAVICO22',
        routingNumber: '051234',
        accountHolderName: 'Premium Display Co. S.A.S.',
        verified: true
      },
      paypal: {
        email: 'payments@premiumdisplay.co',
        verified: true
      },
      payoneer: {
        email: 'finance@premiumdisplay.co',
        verified: true
      }
    },
    cmsIntegration: {
      provider: 'manual',
      status: 'connected',
      screensImported: 35,
      integrationHealth: 'good',
      lastSync: '2023-12-15T16:45:00',
      connectionDetails: {
        authMethod: 'Manual Upload',
        capabilities: ['manual-scheduling', 'basic-reporting']
      }
    },
    screenActivity: {
      addedThisWeek: 0,
      addedThisMonth: 2,
      lastScreenAdded: '2024-05-15',
      lastContentUpdate: '2024-05-20',
      lastPaymentReceived: '2024-05-08'
    },
    sportsEventsPermissions: {
      canCreateSportsEvents: true, // Premium Display has sports events enabled
      canManageEventPricing: true,
      canViewEventAnalytics: true
    },
    sportsEventsMargins: {
      enabled: true,
      momentPricing: {
        firstHalf: 3000000,
        halftime: 2200000,
        secondHalf: 3000000
      },
      generalMargin: 30,
      eventTypes: {
        football: 35,
        basketball: 30,
        baseball: 25,
        tennis: 22,
        volleyball: 20
      }
    },
    financialMetrics: {
      ltv: 185000000, // 185M COP lifetime value (highest)
      totalTransactions: 2156,
      transactionsThisMonth: 142,
      totalPaidToDate: 98500000, // 98.5M COP paid to date
      nextPaymentDate: '2024-06-10',
      nextPaymentAmount: 21000000, // 21M COP next payment
      averageTransactionValue: 85800, // 85.8K COP average (premium)
      monthlyRecurringRevenue: 10000000, // 10M COP monthly
      conversionRate: 9.7, // 9.7% conversion rate (highest)
      revenueGrowthRate: 15.2, // 15.2% growth (excellent)
      paymentFrequency: 'biweekly',
      lastPaymentDate: '2024-04-25',
      pendingBalance: 21000000 // 21M COP pending
    }
  }
];

const mockMetrics: MetricCard[] = [
  {
    title: 'Total Partners',
    value: '127',
    change: '+12%',
    changeType: 'positive',
    icon: <Users className="w-5 h-5" />,
            color: DESIGN_SYSTEM.colors.primary[500]
  },
  {
    title: 'Total Pantallas',
    value: '77',
    change: '+8%',
    changeType: 'positive',
    icon: <Monitor className="w-5 h-5" />,
          color: DESIGN_SYSTEM.colors.primary[500]
  },
  {
    title: 'Total Revenue',
    value: '$2.1M',
    change: '+18%',
    changeType: 'positive',
    icon: <DollarSign className="w-5 h-5" />,
          color: DESIGN_SYSTEM.colors.warning[500]
  },
  {
    title: 'Avg Performance',
    value: '87%',
    change: '+3%',
    changeType: 'positive',
    icon: <TrendingUp className="w-5 h-5" />,
          color: DESIGN_SYSTEM.colors.success[500]
  }
];

// Modern Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}> = ({ children, className = "", hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={`
        backdrop-blur-lg bg-white/90 border border-white/20
        rounded-2xl
        transition-all duration-300
        ${hover ? 'hover:bg-white/95' : ''}
        ${className}
      `}
      style={{ 
        backdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1rem'
      }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced MetricCard with trends
const EnhancedMetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number[];
}> = ({ title, value, change, changeType, icon, color, subtitle, trend }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <div style={{ color }}>
              {icon}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              changeType === 'positive'
                ? 'bg-green-100 text-green-700'
                : changeType === 'negative'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {change}
          </span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        
        {/* Mini trend chart */}
        {trend && (
          <div className="flex items-end space-x-0.5 h-8">
            {trend.map((value, index) => (
              <div
                key={index}
                className="w-1.5 rounded-t-sm"
                style={{
                  height: `${(value / Math.max(...trend)) * 100}%`,
                  backgroundColor: color,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

// Interactive Map Component
const InteractiveMap: React.FC<{
  screens: ScreenLocation[];
  selectedScreens?: string[];
  onScreenSelect?: (screenId: string) => void;
  viewport: MapViewport;
  onViewportChange: (viewport: MapViewport) => void;
  radiusTargeting?: RadiusTargeting;
  onRadiusChange?: (targeting: RadiusTargeting) => void;
  showRadiusTool?: boolean;
  locationFilters?: LocationFilter;
  onLocationFiltersChange?: (filters: LocationFilter) => void;
}> = ({
  screens,
  selectedScreens = [],
  onScreenSelect,
  viewport,
  onViewportChange,
  radiusTargeting,
  onRadiusChange,
  showRadiusTool = false,
  locationFilters,
  onLocationFiltersChange
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDrawingRadius, setIsDrawingRadius] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate screen position on map
  const getScreenPosition = (coordinates: Coordinates) => {
    const mapWidth = 800;
    const mapHeight = 600;
    
    // Simple coordinate transformation for Colombia bounds
    const colombiaBounds = {
      north: 12.5,
      south: -4.2,
      east: -66.9,
      west: -79.0
    };
    
    const x = ((coordinates.longitude - colombiaBounds.west) / (colombiaBounds.east - colombiaBounds.west)) * mapWidth;
    const y = ((colombiaBounds.north - coordinates.latitude) / (colombiaBounds.north - colombiaBounds.south)) * mapHeight;
    
    return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) };
  };

  const handleMapClick = (event: React.MouseEvent) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (showRadiusTool && isDrawingRadius) {
      // Convert click position back to coordinates
      const mapWidth = 800;
      const mapHeight = 600;
      const colombiaBounds = {
        north: 12.5,
        south: -4.2,
        east: -66.9,
        west: -79.0
      };
      
      const longitude = colombiaBounds.west + (x / mapWidth) * (colombiaBounds.east - colombiaBounds.west);
      const latitude = colombiaBounds.north - (y / mapHeight) * (colombiaBounds.north - colombiaBounds.south);
      
      if (onRadiusChange) {
        const newTargeting: RadiusTargeting = {
          center: { latitude, longitude },
          radius: 10, // Default 10km radius
          selectedScreens: [],
          estimatedReach: 250000,
          averageCPM: 12000
        };
        onRadiusChange(newTargeting);
      }
      setIsDrawingRadius(false);
    }
  };

  const getScreenTypeIcon = (type: string) => {
    switch (type) {
      case 'digital': return '📱';
      case 'led': return '💡';
      case 'billboard': return '🏗️';
      case 'transit': return '🚊';
      default: return '📺';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-blue-600" />
          Mapa Interactivo de Pantallas
        </h3>
        <div className="flex items-center gap-2">
          {showRadiusTool && (
            <Button
              variant={isDrawingRadius ? "primary" : "secondary"}
              size="sm"
              icon={<Crosshair className="w-4 h-4" />}
              onClick={() => setIsDrawingRadius(!isDrawingRadius)}
            >
              {isDrawingRadius ? 'Cancelar Radio' : 'Herramienta Radio'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Locate className="w-4 h-4" />}
            onClick={() => onViewportChange({
              center: DEFAULT_MAP_CENTER,
              zoom: 6
            })}
          >
            Centrar
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className={`relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-gray-200 overflow-hidden ${
          isDrawingRadius ? 'cursor-crosshair' : 'cursor-grab'
        }`}
        onClick={handleMapClick}
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)`
        }}
      >
        {/* Colombia Map Outline Simulation */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0">
            <path
              d="M200 100 L600 80 L650 200 L620 350 L580 420 L400 450 L250 400 L180 300 Z"
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Screen Markers */}
        {screens.map((screen) => {
          const position = getScreenPosition(screen.coordinates);
          const isSelected = selectedScreens.includes(screen.id);
          const partnerColor = getPartnerColor(screen.partnerId);
          
          return (
            <div
              key={screen.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
              }`}
              style={{ left: position.x, top: position.y }}
              onClick={(e) => {
                e.stopPropagation();
                onScreenSelect?.(screen.id);
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isSelected 
                    ? 'ring-4 ring-white ring-opacity-60' 
                    : ''
                } ${
                  !screen.isActive 
                    ? 'opacity-60 grayscale' 
                    : ''
                } text-white text-sm font-bold transition-all duration-200`}
                style={{ 
                  backgroundColor: partnerColor.primary,
                  borderColor: isSelected ? '#ffffff' : partnerColor.secondary
                }}
              >
                {getScreenTypeIcon(screen.screenType)}
              </div>
              
              {/* Screen Info Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                <div className="font-medium">{screen.name}</div>
                <div className="text-gray-300">{screen.city}, {screen.region}</div>
                <div className="text-gray-300">{screen.specifications.size}</div>
                <div className="text-gray-300 border-t border-gray-700 pt-1 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: partnerColor.primary }}></span>
                  {partnerColor.name}
                </div>
              </div>
            </div>
          );
        })}

        {/* Radius Targeting Visualization */}
        {radiusTargeting && (
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" className="absolute inset-0">
              {(() => {
                const centerPos = getScreenPosition(radiusTargeting.center);
                const radiusPixels = (radiusTargeting.radius / 100) * 200; // Approximate scale
                
                return (
                  <circle
                    cx={centerPos.x}
                    cy={centerPos.y}
                    r={radiusPixels}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="rgba(59, 130, 246, 0.6)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })()}
            </svg>
          </div>
        )}
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            onClick={() => onViewportChange({
              ...viewport,
              zoom: Math.min(viewport.zoom + 1, 10)
            })}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            onClick={() => onViewportChange({
              ...viewport,
              zoom: Math.max(viewport.zoom - 1, 1)
            })}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 p-3 max-w-xs">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Leyenda de Partners</h4>
          <p className="text-xs text-gray-500 mb-3">Click para filtrar por partner</p>
          <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
            {(() => {
              const partnersWithScreens = Array.from(new Set(screens.map(s => s.partnerId)));
              return partnersWithScreens.map(partnerId => {
                const partnerColor = getPartnerColor(partnerId);
                const partnerScreens = screens.filter(s => s.partnerId === partnerId);
                const activeScreens = partnerScreens.filter(s => s.isActive).length;
                
                return (
                  <div 
                    key={partnerId} 
                    className={`flex items-center justify-between gap-2 p-1 rounded cursor-pointer transition-colors ${
                      locationFilters?.partnerId === partnerId 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (onLocationFiltersChange) {
                        const newFilters = { ...locationFilters };
                        if (newFilters.partnerId === partnerId) {
                          // If already selected, deselect
                          delete newFilters.partnerId;
                        } else {
                          // Select this partner
                          newFilters.partnerId = partnerId;
                        }
                        onLocationFiltersChange(newFilters);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ 
                          backgroundColor: partnerColor.primary,
                          borderColor: partnerColor.secondary
                        }}
                      ></div>
                      <span className="font-medium text-gray-800 truncate">
                        {partnerColor.name}
                      </span>
                      {locationFilters?.partnerId === partnerId && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-gray-600 text-right">
                      <div>{activeScreens}/{partnerScreens.length}</div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          
          <div className="border-t border-gray-200 pt-2 mt-3">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                <span>Seleccionada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 opacity-60 rounded-full"></div>
                <span>Inactiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Pantallas</div>
          <div className="text-xl font-bold text-gray-900">{screens.length}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Pantallas Activas</div>
          <div className="text-xl font-bold text-green-600">
            {screens.filter(s => s.isActive).length}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Partners Mostrados</div>
          <div className="text-xl font-bold text-blue-600">
            {new Set(screens.map(s => s.partnerId)).size}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Seleccionadas</div>
          <div className="text-xl font-bold text-purple-600">{selectedScreens.length}</div>
        </div>
      </div>

      {/* Territory Analysis */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Análisis Territorial por Partner</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(() => {
            const partnersWithScreens = Array.from(new Set(screens.map(s => s.partnerId)));
            return partnersWithScreens.map(partnerId => {
              const partnerColor = getPartnerColor(partnerId);
              const partnerScreens = screens.filter(s => s.partnerId === partnerId);
              const activeScreens = partnerScreens.filter(s => s.isActive).length;
              const cities = new Set(partnerScreens.map(s => s.city));
              const selectedPartnerScreens = partnerScreens.filter(s => selectedScreens.includes(s.id)).length;
              
              return (
                <div key={partnerId} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: partnerColor.primary }}
                    ></div>
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {partnerColor.name}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Pantallas:</span>
                      <span className="font-medium">{activeScreens}/{partnerScreens.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ciudades:</span>
                      <span className="font-medium">{cities.size}</span>
                    </div>
                    {selectedPartnerScreens > 0 && (
                      <div className="flex justify-between text-purple-600">
                        <span>Seleccionadas:</span>
                        <span className="font-medium">{selectedPartnerScreens}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {Array.from(cities).slice(0, 2).join(', ')}
                      {cities.size > 2 && ` +${cities.size - 2}`}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

// Utility Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return DESIGN_SYSTEM.colors.success[500];
    case 'inactive':
      return DESIGN_SYSTEM.colors.gray[400];
    case 'pending':
      return DESIGN_SYSTEM.colors.warning[500];
    case 'suspended':
      return DESIGN_SYSTEM.colors.danger[500];
    default:
      return DESIGN_SYSTEM.colors.gray[400];
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return '#9333ea';
    case 'gold':
      return '#eab308';
    case 'silver':
      return '#6b7280';
    case 'bronze':
      return '#cd853f';
    default:
      return DESIGN_SYSTEM.colors.gray[400];
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'inactive':
      return 'Inactivo';
    case 'pending':
      return 'Pendiente';
    case 'suspended':
      return 'Suspendido';
    default:
      return status;
  }
};

const getTierText = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return 'Platinum';
    case 'gold':
      return 'Gold';
    case 'silver':
      return 'Silver';
    case 'bronze':
      return 'Bronze';
    default:
      return tier;
  }
};

const getCMSProviderInfo = (provider: string) => {
  switch (provider) {
    case 'shareflow-screen':
      return {
        name: 'Shareflow Screen',
        icon: <Monitor className="w-5 h-5" />,
        color: '#4F46E5',
        bgColor: '#EEF2FF'
      };
    case 'broadsign':
      return {
        name: 'Broadsign Enterprise',
        icon: <Server className="w-5 h-5" />,
        color: '#059669',
        bgColor: '#D1FAE5'
      };
    case 'latinad':
      return {
        name: 'LatinAd',
        icon: <Globe className="w-5 h-5" />,
        color: '#7C3AED',
        bgColor: '#F3E8FF'
      };
    case 'api':
      return {
        name: 'API Integration',
        icon: <Database className="w-5 h-5" />,
        color: '#DC2626',
        bgColor: '#FEF2F2'
      };
    case 'manual':
      return {
        name: 'Manual',
        icon: <Upload className="w-5 h-5" />,
        color: '#B45309',
        bgColor: '#FEF3C7'
      };
    default:
      return {
        name: 'Unknown',
        icon: <Settings className="w-5 h-5" />,
        color: '#6B7280',
        bgColor: '#F3F4F6'
      };
  }
};

const getIntegrationStatusInfo = (status: string) => {
  switch (status) {
    case 'connected':
      return {
        text: 'Conectado',
        color: '#10B981',
        icon: <CheckCircle className="w-4 h-4" />
      };
    case 'disconnected':
      return {
        text: 'Desconectado',
        color: '#EF4444',
        icon: <WifiOff className="w-4 h-4" />
      };
    case 'error':
      return {
        text: 'Error',
        color: '#EF4444',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    case 'pending':
      return {
        text: 'Pendiente',
        color: '#F59E0B',
        icon: <Clock className="w-4 h-4" />
      };
    default:
      return {
        text: 'Desconocido',
        color: '#6B7280',
        icon: <AlertCircle className="w-4 h-4" />
      };
  }
};

const getIntegrationHealthInfo = (health: string) => {
  switch (health) {
    case 'excellent':
      return {
        text: 'Excelente',
        color: '#10B981',
        bgColor: '#D1FAE5'
      };
    case 'good':
      return {
        text: 'Buena',
        color: '#059669',
        bgColor: '#D1FAE5'
      };
    case 'warning':
      return {
        text: 'Atención',
        color: '#F59E0B',
        bgColor: '#FEF3C7'
      };
    case 'critical':
      return {
        text: 'Crítica',
        color: '#EF4444',
        bgColor: '#FEF2F2'
      };
    default:
      return {
        text: 'Desconocida',
        color: '#6B7280',
        bgColor: '#F3F4F6'
      };
  }
};

const getRoleInfo = (role: string) => {
  switch (role) {
    case 'partner_owner':
      return {
        label: 'Propietario',
        color: '#7C3AED',
        bgColor: '#EDE9FE',
        icon: <Crown className="w-4 h-4" />,
        description: 'Control total de la cuenta'
      };
    case 'partner_admin':
      return {
        label: 'Administrador',
        color: '#2563EB',
        bgColor: '#DBEAFE',
        icon: <Shield className="w-4 h-4" />,
        description: 'Acceso administrativo completo'
      };
    case 'partner_financial':
      return {
        label: 'Financiero',
        color: '#059669',
        bgColor: '#D1FAE5',
        icon: <DollarSign className="w-4 h-4" />,
        description: 'Acceso a facturación y reportes'
      };
    case 'partner_user':
      return {
        label: 'Operador',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: <User className="w-4 h-4" />,
        description: 'Acceso básico operativo'
      };
    default:
      return {
        label: role,
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: <User className="w-4 h-4" />,
        description: 'Rol no definido'
      };
  }
};

const getPaymentMethodInfo = (method: string) => {
  switch (method) {
    case 'bank':
      return {
        label: 'Cuenta Bancaria',
        color: '#2563EB',
        bgColor: '#DBEAFE',
        icon: <Building2 className="w-4 h-4" />,
        description: 'Transferencia bancaria directa'
      };
    case 'paypal':
      return {
        label: 'PayPal',
        color: '#4F46E5',
        bgColor: '#E0E7FF',
        icon: <Wallet className="w-4 h-4" />,
        description: 'Pagos vía PayPal'
      };
    case 'payoneer':
      return {
        label: 'Payoneer',
        color: '#EA580C',
        bgColor: '#FED7AA',
        icon: <CreditCard className="w-4 h-4" />,
        description: 'Pagos internacionales'
      };
    default:
      return {
        label: method,
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icon: <CreditCard className="w-4 h-4" />,
        description: 'Método no especificado'
      };
  }
};

// Components
const MetricCard: React.FC<{ metric: MetricCard }> = ({ metric }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${metric.color}20` }}
          >
            <div style={{ color: metric.color }}>
              {metric.icon}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{metric.title}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              metric.changeType === 'positive'
                ? 'bg-green-100 text-green-800'
                : metric.changeType === 'negative'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {metric.change}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const StatusBadge: React.FC<{ 
  status: string;
  type?: 'partner' | 'screen' | 'campaign';
}> = ({ status, type = 'partner' }) => {
  const getStatusConfig = () => {
    const configs = {
      partner: {
        active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo', icon: '✓' },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactivo', icon: '○' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente', icon: '⏳' },
        suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspendido', icon: '⚠️' }
      },
      screen: {
        active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Online', icon: '●' },
        inactive: { bg: 'bg-red-100', text: 'text-red-700', label: 'Offline', icon: '○' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Mantenimiento', icon: '⚠' },
        suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspendido', icon: '✕' }
      },
      campaign: {
        active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activa', icon: '▶' },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pausada', icon: '⏸' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente', icon: '⏳' },
        suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Finalizada', icon: '⏹' }
      }
    };
    const typeConfig = configs[type as keyof typeof configs];
    return typeConfig?.[status as keyof typeof typeConfig] || configs.partner.inactive;
  };

  const config = getStatusConfig();
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { bg: 'bg-gradient-to-r from-purple-100 to-pink-100', text: 'text-purple-700', label: 'Platinum', icon: '🏆' };
      case 'gold':
        return { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-yellow-700', label: 'Gold', icon: '🥇' };
      case 'silver':
        return { bg: 'bg-gradient-to-r from-gray-100 to-slate-100', text: 'text-gray-700', label: 'Silver', icon: '🥈' };
      case 'bronze':
        return { bg: 'bg-gradient-to-r from-orange-100 to-red-100', text: 'text-orange-700', label: 'Bronze', icon: '🥉' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: tier, icon: '📊' };
    }
  };

  const config = getTierConfig(tier);
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  icon,
  className = ""
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: `bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500/50`,
    secondary: `bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 border border-gray-200 hover:border-gray-300 focus:ring-gray-500/50`,
    ghost: `bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus:ring-gray-500/50`,
    danger: `bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500/50`,
    success: `bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500/50`
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  );
};

const SearchBar: React.FC<{
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ placeholder = "Buscar partners...", value, onChange }) => {
  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
      />
    </div>
  );
};

const FilterDropdown: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        {label}
        <ChevronDown className="ml-2 w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md border border-gray-200 z-50"
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                    value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Location-based Advanced Filters
const LocationFilters: React.FC<{
  filters: LocationFilter;
  onFiltersChange: (filters: LocationFilter) => void;
  availableCities: string[];
  availableRegions: string[];
  screens: ScreenLocation[];
}> = ({ filters, onFiltersChange, availableCities, availableRegions, screens }) => {
  const [showRadiusConfig, setShowRadiusConfig] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Ubicación obtenida exitosamente');
        },
        (error) => {
          toast.error('No se pudo obtener la ubicación');
        }
      );
    } else {
      toast.error('Geolocalización no soportada');
    }
  };

  const handleRadiusChange = (radius: number) => {
    if (currentLocation) {
      onFiltersChange({
        ...filters,
        radius: {
          center: currentLocation,
          kilometers: radius
        }
      });
    }
  };

  const clearRadiusFilter = () => {
    const newFilters = { ...filters };
    delete newFilters.radius;
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Navigation2 className="w-5 h-5 text-blue-600" />
          Filtros de Ubicación
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({})}
        >
          Limpiar Filtros
        </Button>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* City Filter */}
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              city: e.target.value || undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las ciudades</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
      </div>
      
        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Región
          </label>
          <select
            value={filters.region || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              region: e.target.value || undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las regiones</option>
            {availableRegions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* Screen Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Pantalla
          </label>
          <select
            value={filters.screenTypes?.[0] || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              screenTypes: e.target.value ? [e.target.value] : undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="digital">Digital</option>
            <option value="led">LED</option>
            <option value="billboard">Valla</option>
            <option value="transit">Transporte</option>
          </select>
        </div>

        {/* Partner Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partner
          </label>
          <select
            value={filters.partnerId || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              partnerId: e.target.value || undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los partners</option>
            {Array.from(new Set(screens.map(s => s.partnerId))).map(partnerId => {
              const partnerColor = getPartnerColor(partnerId);
              return (
                <option key={partnerId} value={partnerId}>
                  {partnerColor.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Radius Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Radio de Distancia
          </label>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Locate className="w-4 h-4" />}
              onClick={() => setShowRadiusConfig(!showRadiusConfig)}
            >
              {filters.radius ? `${filters.radius.kilometers}km` : 'Configurar'}
            </Button>
            {filters.radius && (
              <Button
                variant="ghost"
                size="sm"
                icon={<X className="w-4 h-4" />}
                onClick={clearRadiusFilter}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Radius Configuration Panel */}
      <AnimatePresence>
        {showRadiusConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Configuración de Radio de Distancia
            </h4>
            
            <div className="space-y-4">
              {/* Get Current Location */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Crosshair className="w-4 h-4" />}
                  onClick={getCurrentLocation}
                >
                  Obtener Mi Ubicación
          </Button>
                {currentLocation && (
                  <span className="text-sm text-green-600">
                    ✓ Ubicación obtenida
                  </span>
                )}
        </div>

              {/* Radius Slider */}
              {currentLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radio: {filters.radius?.kilometers || 10} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.radius?.kilometers || 10}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              )}

              {/* Radius Stats */}
              {filters.radius && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-600">Pantallas en Radio</div>
                    <div className="text-xl font-bold text-blue-600">
                      {screens.filter(screen => {
                        // Simple distance calculation (approximation)
                        const distance = Math.sqrt(
                          Math.pow(screen.coordinates.latitude - filters.radius!.center.latitude, 2) +
                          Math.pow(screen.coordinates.longitude - filters.radius!.center.longitude, 2)
                        ) * 111; // Approximate km per degree
                        return distance <= filters.radius!.kilometers;
                      }).length}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-600">Alcance Estimado</div>
                    <div className="text-xl font-bold text-green-600">
                      {(filters.radius.kilometers * 15000).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
      </div>
    </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.city && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
            <MapPin className="w-3 h-3" />
            {filters.city}
            <button
              onClick={() => onFiltersChange({ ...filters, city: undefined })}
              className="hover:text-blue-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        {filters.region && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
            <Globe2 className="w-3 h-3" />
            {filters.region}
            <button
              onClick={() => onFiltersChange({ ...filters, region: undefined })}
              className="hover:text-green-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        {filters.screenTypes && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
            <Monitor className="w-3 h-3" />
            {filters.screenTypes[0]}
            <button
              onClick={() => onFiltersChange({ ...filters, screenTypes: undefined })}
              className="hover:text-purple-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        {filters.partnerId && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm">
            <Building className="w-3 h-3" />
            {getPartnerColor(filters.partnerId).name}
            <button
              onClick={() => onFiltersChange({ ...filters, partnerId: undefined })}
              className="hover:text-indigo-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        {filters.radius && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-sm">
            <Compass className="w-3 h-3" />
            {filters.radius.kilometers}km radio
            <button
              onClick={clearRadiusFilter}
              className="hover:text-orange-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

const PartnersTable: React.FC<{ partners: Partner[]; selectedPartner?: Partner | null; onPartnerSelect?: (partner: Partner) => void }> = ({ partners, selectedPartner, onPartnerSelect }) => {
  const [sortField, setSortField] = useState<keyof Partner>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Partner) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPartners = [...partners].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  return (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Partner
                {sortField === 'name' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('revenue')}
              >
                Revenue
                {sortField === 'revenue' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Red de Pantallas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cobertura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uptime / Fill Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPartners.map((partner) => (
              <motion.tr
                key={partner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                  selectedPartner?.id === partner.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => onPartnerSelect && onPartnerSelect(partner)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                      <div className="text-sm text-gray-500">{partner.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{partner.contactPerson}</div>
                  <div className="text-sm text-gray-500">{partner.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={partner.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TierBadge tier={partner.tier} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(partner.revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{partner.networkInventory.activeScreens}</span>
                      </div>
                      <span className="text-xs text-gray-500">online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">{partner.networkInventory.inactiveScreens}</span>
                      </div>
                      <span className="text-xs text-gray-500">offline</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Total: {partner.networkInventory.totalScreens} pantallas
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      {partner.cities.length} ciudades
                    </div>
                    <div className="text-xs text-gray-500">
                      {partner.cities.slice(0, 2).join(', ')}
                      {partner.cities.length > 2 && ` +${partner.cities.length - 2} más`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {partner.regions.join(', ')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Uptime</span>
                      <span className="text-sm font-medium text-gray-900">{partner.networkInventory.uptime}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          partner.networkInventory.uptime >= 95 ? 'bg-green-500' :
                          partner.networkInventory.uptime >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${partner.networkInventory.uptime}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Fill Rate</span>
                      <span className="text-sm font-medium text-gray-900">{partner.networkInventory.fillRate}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm" icon={<Edit3 className="w-4 h-4" />}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />}>
                      Más
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  };

// Partner Detail Panel Component
const PartnerDetailPanel: React.FC<{ partner: Partner; onEditMargin?: (partner: Partner) => void }> = ({ partner, onEditMargin }) => {
  return (
    <motion.div
      key={partner.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Partner Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{partner.name}</h2>
                <p className="text-gray-600 mt-1">{partner.contactPerson}</p>
                <div className="flex items-center gap-3 mt-3">
                  <StatusBadge status={partner.status} />
                  <TierBadge tier={partner.tier} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<Mail className="w-4 h-4" />}>
                  Email
                </Button>
                <Button variant="ghost" size="sm" icon={<Phone className="w-4 h-4" />}>
                  Llamar
                </Button>
                <Button variant="primary" size="sm" icon={<Edit3 className="w-4 h-4" />}>
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(partner.revenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pantallas</p>
              <p className="text-2xl font-bold text-gray-900">{partner.screens}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Performance</p>
              <p className="text-2xl font-bold text-gray-900">{partner.performance}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Comisión</p>
              <p className="text-2xl font-bold text-gray-900">{partner.commission}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* CMS Integration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Integración CMS
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
          >
            Configurar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Proveedor</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getCMSProviderInfo(partner.cmsIntegration.provider).bgColor }}
                >
                  <div style={{ color: getCMSProviderInfo(partner.cmsIntegration.provider).color }}>
                    {getCMSProviderInfo(partner.cmsIntegration.provider).icon}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {getCMSProviderInfo(partner.cmsIntegration.provider).name}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Estado</span>
              <div className="flex items-center gap-2">
                <div style={{ color: getIntegrationStatusInfo(partner.cmsIntegration.status).color }}>
                  {getIntegrationStatusInfo(partner.cmsIntegration.status).icon}
                </div>
                <span 
                  className="text-sm font-semibold"
                  style={{ color: getIntegrationStatusInfo(partner.cmsIntegration.status).color }}
                >
                  {getIntegrationStatusInfo(partner.cmsIntegration.status).text}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Pantallas importadas</span>
              <span className="text-sm font-semibold text-blue-600">
                {partner.cmsIntegration.screensImported}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Salud integración</span>
              <div className="flex items-center gap-2">
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: getIntegrationHealthInfo(partner.cmsIntegration.integrationHealth).bgColor,
                    color: getIntegrationHealthInfo(partner.cmsIntegration.integrationHealth).color
                  }}
                >
                  {getIntegrationHealthInfo(partner.cmsIntegration.integrationHealth).text}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Última sincronización</span>
              <span className="text-sm text-gray-600">
                {new Date(partner.cmsIntegration.lastSync).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {partner.cmsIntegration.apiVersion && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Versión API</span>
                <span className="text-sm text-gray-600">
                  {partner.cmsIntegration.apiVersion}
                </span>
              </div>
            )}
          </div>
        </div>

        {partner.cmsIntegration.connectionDetails?.capabilities && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Capacidades</h4>
            <div className="flex flex-wrap gap-2">
              {partner.cmsIntegration.connectionDetails.capabilities.map((capability, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Screen Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Actividad Pantallas
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Esta semana</p>
                <p className="text-xs text-orange-600">Pantallas agregadas</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">+{partner.screenActivity.addedThisWeek}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Este mes</p>
                <p className="text-xs text-orange-600">Pantallas agregadas</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">+{partner.screenActivity.addedThisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Última pantalla agregada</span>
            <span className="font-medium text-gray-900">
              {formatDate(partner.screenActivity.lastScreenAdded)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Última actualización contenido</span>
            <span className="font-medium text-gray-900">
              {formatDate(partner.screenActivity.lastContentUpdate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Último pago recibido</span>
            <span className="font-medium text-gray-900">
              {formatDate(partner.screenActivity.lastPaymentReceived)}
            </span>
          </div>
        </div>
      </div>

      {/* Markup Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Configuración de Markups</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditMargin?.(partner)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Editar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Marketplace Markups by Type */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Markups Marketplace</h4>
                  <p className="text-xs text-gray-500">Markups por tipo de compra</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Momentos */}
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-medium text-gray-700">Momentos</span>
                </div>
                <div className="text-xl font-bold text-blue-600">{partner.marketplaceMargins.momentos}%</div>
                <div className="w-full bg-blue-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.marketplaceMargins.momentos}%` }}
                  />
                </div>
              </div>

              {/* Hourly */}
              <div className="bg-white rounded-lg p-3 border border-cyan-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🕐</span>
                  <span className="text-sm font-medium text-gray-700">Por hora</span>
                </div>
                <div className="text-xl font-bold text-cyan-600">{partner.marketplaceMargins.hourly}%</div>
                <div className="w-full bg-cyan-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-cyan-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.marketplaceMargins.hourly}%` }}
                  />
                </div>
              </div>

              {/* Daily */}
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <span className="text-sm font-medium text-gray-700">Por día</span>
                </div>
                <div className="text-xl font-bold text-green-600">{partner.marketplaceMargins.daily}%</div>
                <div className="w-full bg-green-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.marketplaceMargins.daily}%` }}
                  />
                </div>
              </div>

              {/* Weekly */}
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📊</span>
                  <span className="text-sm font-medium text-gray-700">Por semana</span>
                </div>
                <div className="text-xl font-bold text-orange-600">{partner.marketplaceMargins.weekly}%</div>
                <div className="w-full bg-orange-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-orange-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.marketplaceMargins.weekly}%` }}
                  />
                </div>
              </div>

              {/* Monthly */}
              <div className="bg-white rounded-lg p-3 border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🗓️</span>
                  <span className="text-sm font-medium text-gray-700">Por mes</span>
                </div>
                <div className="text-xl font-bold text-pink-600">{partner.marketplaceMargins.monthly}%</div>
                <div className="w-full bg-pink-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-pink-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.marketplaceMargins.monthly}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Programmatic Margin */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Programático</h4>
                  <p className="text-xs text-gray-500">Markup para campañas automáticas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{partner.programmaticMargin || partner.customMargin || partner.grossMargin}%</p>
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${partner.programmaticMargin || partner.customMargin || partner.grossMargin}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>
              Los markups determinan la comisión que recibe Shareflow por cada venta. 
                                Fórmula: Precio al cliente = Costo base / (1 - Markup %)
            </span>
          </div>
        </div>
      </div>

      {/* Equipo del Partner */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-center justify-between mb-6">
          <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Equipo del Partner
          </h3>
            <p className="text-sm text-gray-500 mt-1">
              Miembros del equipo y sus permisos de acceso
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {partner.teamMembers.length} miembro{partner.teamMembers.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-4">
          {partner.teamMembers.map((member) => {
            const roleInfo = getRoleInfo(member.role);
            return (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: roleInfo.bgColor }}>
                    <div style={{ color: roleInfo.color }}>
                      {roleInfo.icon}
                    </div>
                  </div>
                  <div>
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: roleInfo.bgColor,
                        color: roleInfo.color
                      }}
                    >
                      {roleInfo.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status === 'active' ? 'Activo' : 'Pendiente'}
                    </span>
                  </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-sm text-gray-500">
                        Desde {formatDate(member.joinedAt)}
                      </div>
                    </div>
                    
                    {/* Accesos Directos de Contacto */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                        icon={<Mail className="w-4 h-4" />}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        Email
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Aquí podrías abrir un modal de chat interno o WhatsApp
                          toast.success(`Iniciando chat con ${member.name}`);
                        }}
                        icon={<Phone className="w-4 h-4" />}
                        className="hover:bg-green-50 hover:text-green-600"
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Permisos Detallados del Miembro */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Permisos de Acceso:</span>
                    <div className="flex items-center gap-4 text-xs">
                      <div className={`flex items-center gap-1 ${
                        member.permissions.canViewBilling ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <DollarSign className="w-3 h-3" />
                        <span>Facturación</span>
                        {member.permissions.canViewBilling && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <div className={`flex items-center gap-1 ${
                        member.permissions.canManageTeam ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>Gestión</span>
                        {member.permissions.canManageTeam && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <div className={`flex items-center gap-1 ${
                        member.permissions.canViewAnalytics ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <BarChart3 className="w-3 h-3" />
                        <span>Analytics</span>
                        {member.permissions.canViewAnalytics && <CheckCircle className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de Permisos del Equipo */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permisos del Equipo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Facturación</span>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  {partner.teamMembers.filter(m => m.permissions.canViewBilling).length}
              </span>
            </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Gestión</span>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  {partner.teamMembers.filter(m => m.permissions.canManageTeam).length}
              </span>
            </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Analytics</span>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  {partner.teamMembers.filter(m => m.permissions.canViewAnalytics).length}
              </span>
            </div>
          </div>
        </div>
      </div>

        {/* Acciones Rápidas del Equipo */}
        <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Acciones del Equipo</h4>
              <p className="text-sm text-gray-600">Gestiona el equipo del partner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const emails = partner.teamMembers.map(m => m.email).join(',');
                window.open(`mailto:${emails}`, '_blank');
              }}
              icon={<Mail className="w-4 h-4" />}
            >
              Email Grupal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.success('Función de videollamada próximamente');
              }}
              icon={<Phone className="w-4 h-4" />}
            >
              Reunión
            </Button>
          </div>
        </div>
      </div>

      {/* Pagos y Facturación */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Pagos y Facturación
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Resumen financiero y historial de pagos
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
          >
            Ver Historial Completo
          </Button>
        </div>

        {/* Métricas Financieras Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Revenue del Mes</span>
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-green-800">
                {formatCurrency(partner.financialMetrics.monthlyRecurringRevenue)}
              </span>
            </div>
            <div className="text-xs text-green-600">
              {partner.financialMetrics.transactionsThisMonth} plays consumidos
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Próximo Pago</span>
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-blue-800">
                {formatCurrency(partner.financialMetrics.nextPaymentAmount)}
              </span>
            </div>
            <div className="text-xs text-blue-600">
              {formatDate(partner.financialMetrics.nextPaymentDate)}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Campañas Activas</span>
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-purple-800">
                {Math.floor(partner.financialMetrics.totalTransactions / 30)}
              </span>
            </div>
            <div className="text-xs text-purple-600">
              {partner.financialMetrics.totalTransactions} total este periodo
            </div>
          </div>
        </div>

        {/* Pagos Recientes */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Pagos Recientes</h4>
          <div className="space-y-3">
            {/* Próximo Pago Programado */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(partner.financialMetrics.nextPaymentAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(partner.financialMetrics.nextPaymentDate).split(' ')[0]} • {partner.networkInventory.activeScreens} pantallas
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm font-medium rounded-full">
                  Programado
                </span>
                <div className="text-xs text-blue-600 mt-1">
                  {formatDate(partner.financialMetrics.nextPaymentDate)}
                </div>
              </div>
            </div>

            {/* Último Pago */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(partner.financialMetrics.monthlyRecurringRevenue * 0.85)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(partner.financialMetrics.lastPaymentDate).split(' ')[0]} • {Math.floor(partner.networkInventory.activeScreens * 0.8)} pantallas
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-200 text-green-800 text-sm font-medium rounded-full">
                  Pagado
                </span>
                <div className="text-xs text-green-600 mt-1">
                  {formatDate(partner.financialMetrics.lastPaymentDate)}
                </div>
              </div>
            </div>

            {/* Pago Anterior */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(partner.financialMetrics.monthlyRecurringRevenue * 0.72)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Abril 2024 • {Math.floor(partner.networkInventory.activeScreens * 0.6)} pantallas
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-200 text-green-800 text-sm font-medium rounded-full">
                  Pagado
                </span>
                <div className="text-xs text-green-600 mt-1">
                  30/4/2024
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-center justify-between mb-6">
          <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Métodos de Pago
          </h3>
            <p className="text-sm text-gray-500 mt-1">
              Información financiera para el procesamiento de pagos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Próximo Pago: {formatCurrency(partner.financialMetrics.nextPaymentAmount)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(partner.financialMetrics.nextPaymentDate)}
              </div>
            </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
          >
            Configurar
          </Button>
          </div>
        </div>
        
        {/* Payment Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Método Preferido</p>
                <p className="text-lg font-bold text-blue-800">
                  {getPaymentMethodInfo(partner.paymentMethods.preferredMethod).label}
                </p>
              </div>
              <div style={{ color: getPaymentMethodInfo(partner.paymentMethods.preferredMethod).color }}>
                {getPaymentMethodInfo(partner.paymentMethods.preferredMethod).icon}
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Balance Pendiente</p>
                <p className="text-lg font-bold text-green-800">
                  {formatCurrency(partner.financialMetrics.pendingBalance)}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Frecuencia de Pago</p>
                <p className="text-lg font-bold text-purple-800 capitalize">
                  {partner.financialMetrics.paymentFrequency === 'weekly' ? 'Semanal' : 
                   partner.financialMetrics.paymentFrequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Preferred Method Details */}
        <div className="mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg border-2"
               style={{ 
                 borderColor: getPaymentMethodInfo(partner.paymentMethods.preferredMethod).color + '40',
                 backgroundColor: getPaymentMethodInfo(partner.paymentMethods.preferredMethod).bgColor
               }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: getPaymentMethodInfo(partner.paymentMethods.preferredMethod).color + '20' }}>
              <div style={{ color: getPaymentMethodInfo(partner.paymentMethods.preferredMethod).color }}>
                {getPaymentMethodInfo(partner.paymentMethods.preferredMethod).icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {getPaymentMethodInfo(partner.paymentMethods.preferredMethod).label}
                </h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Método Principal
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {getPaymentMethodInfo(partner.paymentMethods.preferredMethod).description}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Configurado</span>
              </div>
              <p className="text-xs text-gray-500">
                Último pago: {formatDate(partner.financialMetrics.lastPaymentDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Payment Information */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              {partner.paymentMethods.preferredMethod === 'bank' && <Building2 className="w-5 h-5 text-gray-600" />}
              {partner.paymentMethods.preferredMethod === 'paypal' && <Wallet className="w-5 h-5 text-blue-600" />}
              {partner.paymentMethods.preferredMethod === 'payoneer' && <CreditCard className="w-5 h-5 text-orange-600" />}
              {partner.paymentMethods.preferredMethod === 'bank' && 'Información Bancaria Completa'}
              {partner.paymentMethods.preferredMethod === 'paypal' && 'Información de PayPal'}
              {partner.paymentMethods.preferredMethod === 'payoneer' && 'Información de Payoneer'}
            </h4>
            <div className="flex items-center gap-2">
              {(partner.paymentMethods.preferredMethod === 'bank' && partner.paymentMethods.bankAccount.verified) ||
               (partner.paymentMethods.preferredMethod === 'paypal' && partner.paymentMethods.paypal.verified) ||
               (partner.paymentMethods.preferredMethod === 'payoneer' && partner.paymentMethods.payoneer.verified) ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Verificado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-600 font-medium">Pendiente Verificación</span>
                </>
              )}
              </div>
              </div>

          {partner.paymentMethods.preferredMethod === 'bank' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Entidad Bancaria:</span>
                    <span className="font-semibold text-gray-900">{partner.paymentMethods.bankAccount.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Número de Cuenta:</span>
                    <span className="font-mono text-gray-900">{partner.paymentMethods.bankAccount.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Tipo de Cuenta:</span>
                    <span className="font-medium text-gray-900 capitalize">
                  {partner.paymentMethods.bankAccount.accountType === 'checking' ? 'Corriente' : 'Ahorros'}
                </span>
              </div>
              </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Código SWIFT:</span>
                    <span className="font-mono text-gray-900">{partner.paymentMethods.bankAccount.swiftCode}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Routing Number:</span>
                    <span className="font-mono text-gray-900">{partner.paymentMethods.bankAccount.routingNumber}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Titular de Cuenta:</span>
                <span className="font-medium text-gray-900">{partner.paymentMethods.bankAccount.accountHolderName}</span>
              </div>
            </div>
            </div>
              
              {!partner.paymentMethods.bankAccount.verified && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-amber-900 mb-1">Verificación Pendiente</h5>
                      <p className="text-sm text-amber-800">
                        La cuenta bancaria requiere verificación antes de procesar pagos. 
                        Los pagos se procesarán una vez completada la verificación.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {partner.paymentMethods.preferredMethod === 'paypal' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
              <div>
                  <span className="text-sm font-medium text-gray-600">Email de PayPal:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{partner.paymentMethods.paypal.email}</p>
              </div>
                <div className="text-right">
                {partner.paymentMethods.paypal.verified ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Cuenta Verificada</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm text-amber-600 font-medium">No Verificada</span>
                    </div>
                )}
              </div>
            </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-blue-900 mb-1">Información de PayPal</h5>
                    <p className="text-sm text-blue-800">
                      Los pagos se enviarán directamente a esta cuenta de PayPal. 
                      Asegúrate de que la cuenta esté configurada para recibir pagos comerciales.
                    </p>
                  </div>
                </div>
              </div>
          </div>
        )}

        {partner.paymentMethods.preferredMethod === 'payoneer' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
              <div>
                  <span className="text-sm font-medium text-gray-600">Email de Payoneer:</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{partner.paymentMethods.payoneer.email}</p>
              </div>
                <div className="text-right">
                {partner.paymentMethods.payoneer.verified ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Cuenta Verificada</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm text-amber-600 font-medium">No Verificada</span>
                    </div>
                )}
              </div>
            </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-orange-900 mb-1">Información de Payoneer</h5>
                    <p className="text-sm text-orange-800">
                      Los pagos se procesarán a través de Payoneer. 
                      La cuenta debe estar activada y verificada para recibir fondos internacionales.
                    </p>
                  </div>
                </div>
              </div>
          </div>
        )}
        </div>



        {/* Payment Processing Information */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
                  <h4 className="text-sm font-medium text-green-900 mb-1">Información de Pagos</h4>
                  <p className="text-xs text-green-800">
                Los pagos se procesan automáticamente cada {partner.tier === 'platinum' ? '7' : partner.tier === 'gold' ? '14' : '30'} días 
                    usando el método preferido.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Historial de Pagos</h4>
                  <p className="text-xs text-blue-800">
                    Total pagado: {formatCurrency(partner.financialMetrics.totalPaidToDate)} • 
                    Último pago: {formatDate(partner.financialMetrics.lastPaymentDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-900 mb-1">Importante</h4>
                <p className="text-xs text-amber-800">
                  Asegúrate de que la información de pago esté actualizada y verificada. 
                  Los pagos pendientes se procesarán automáticamente una vez verificada la cuenta.
                  {!((partner.paymentMethods.preferredMethod === 'bank' && partner.paymentMethods.bankAccount.verified) ||
                     (partner.paymentMethods.preferredMethod === 'paypal' && partner.paymentMethods.paypal.verified) ||
                     (partner.paymentMethods.preferredMethod === 'payoneer' && partner.paymentMethods.payoneer.verified)) && 
                    ' Los pagos están pausados hasta completar la verificación.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{partner.email}</p>
                <p className="text-xs text-gray-500">Email corporativo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{partner.phone}</p>
                <p className="text-xs text-gray-500">Teléfono principal</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{partner.location}</p>
                <p className="text-xs text-gray-500">Ubicación</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDate(partner.joinDate)}</p>
                <p className="text-xs text-gray-500">Fecha de ingreso</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {partner.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 ">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
          <p className="text-gray-600">{partner.description}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="ghost" 
            className="h-16 flex-col gap-2"
            onClick={() => window.open(`mailto:${partner.email}`)}
          >
            <Mail className="w-5 h-5" />
            <span className="text-xs">Enviar Email</span>
          </Button>
          <Button 
            variant="ghost" 
            className="h-16 flex-col gap-2"
            onClick={() => window.open(`tel:${partner.phone}`)}
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Llamar</span>
          </Button>
          <Button 
            variant="ghost" 
            className="h-16 flex-col gap-2"
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs">Ver Analytics</span>
          </Button>
          <Button 
            variant="ghost" 
            className="h-16 flex-col gap-2"
          >
            <Edit3 className="w-5 h-5" />
            <span className="text-xs">Editar Partner</span>
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gray-600" />
            </div>
            Métricas Financieras
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon={<BarChart3 className="w-4 h-4" />}
          >
            Ver Reporte Completo
          </Button>
        </div>

        {/* Key Financial Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* LTV */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor de Vida</p>
                <p className="text-xs text-gray-400">(LTV)</p>
            </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(partner.financialMetrics.ltv)}
            </div>
            <p className="text-xs text-gray-500">Valor total generado</p>
          </div>

          {/* Total Transactions */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <Activity className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Transacciones</p>
                <p className="text-xs text-gray-400">Total</p>
            </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {partner.financialMetrics.totalTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 font-medium">
              +{partner.financialMetrics.transactionsThisMonth} este mes
            </p>
          </div>

          {/* Average Transaction Value */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <DollarSign className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ticket Promedio</p>
                <p className="text-xs text-gray-400">Por transacción</p>
            </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(partner.financialMetrics.averageTransactionValue)}
            </div>
            <p className="text-xs text-gray-500">Por transacción</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <Star className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversión</p>
                <p className="text-xs text-gray-400">Tasa</p>
            </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {partner.financialMetrics.conversionRate}%
            </div>
            <p className="text-xs text-gray-500">Tasa de conversión</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Next Payment */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              Próximo Pago
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="font-medium text-gray-900">
                  {new Date(partner.financialMetrics.nextPaymentDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Monto:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(partner.financialMetrics.nextPaymentAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Frecuencia:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {partner.financialMetrics.paymentFrequency === 'weekly' ? 'Semanal' :
                   partner.financialMetrics.paymentFrequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Summary */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              Historial de Pagos
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total pagado:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(partner.financialMetrics.totalPaidToDate)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Último pago:</span>
                <span className="font-medium text-gray-900">
                  {new Date(partner.financialMetrics.lastPaymentDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Balance pendiente:</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(partner.financialMetrics.pendingBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Monthly Recurring Revenue */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                </div>
                Ingresos Recurrentes (MRR)
              </h4>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{partner.financialMetrics.revenueGrowthRate}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {formatCurrency(partner.financialMetrics.monthlyRecurringRevenue)}
            </div>
            <p className="text-sm text-gray-500">Ingresos mensuales proyectados</p>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-gray-600" />
              </div>
              Rendimiento Financiero
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">ROI Partner:</span>
                <span className="font-bold text-green-600">
                  {((partner.financialMetrics.ltv / partner.financialMetrics.totalPaidToDate - 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Crecimiento mensual:</span>
                <span className="font-bold text-green-600">
                  +{partner.financialMetrics.revenueGrowthRate}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Eficiencia de pago:</span>
                <span className="font-bold text-blue-600">
                  {((partner.financialMetrics.totalPaidToDate / partner.financialMetrics.ltv) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Info className="w-3 h-3 text-gray-500" />
            </div>
            <span>
              Las métricas financieras se actualizan en tiempo real. Los datos incluyen todas las transacciones 
              procesadas a través de las pantallas de este partner.
            </span>
          </div>
        </div>
      </div>

      {/* Sports Events Markup Configuration - Conditional */}
      {partner.sportsEventsPermissions.canCreateSportsEvents && partner.sportsEventsMargins && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚽</span>
              </div>
              Configuración de Eventos Deportivos
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Habilitado
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={<Settings className="w-4 h-4" />}
              >
                Configurar
              </Button>
            </div>
          </div>
          
          {/* Sports Events Pricing */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Precios por Momento Deportivo</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏟️</span>
                  <span className="text-sm font-medium text-gray-700">Primer Tiempo</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(partner.sportsEventsMargins.momentPricing.firstHalf)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio base por momento</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⏰</span>
                  <span className="text-sm font-medium text-gray-700">Entre Tiempo</span>
                </div>
                <div className="text-xl font-bold text-yellow-600">
                  {formatCurrency(partner.sportsEventsMargins.momentPricing.halftime)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio premium entretiempo</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm font-medium text-gray-700">Segundo Tiempo</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(partner.sportsEventsMargins.momentPricing.secondHalf)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio base por momento</p>
              </div>
            </div>
          </div>

          {/* Sports Events Margins by Type */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Markups por Tipo de Deporte</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚽</span>
                  <span className="text-sm font-medium text-gray-700">Fútbol</span>
                </div>
                <div className="text-lg font-bold text-green-600">{partner.sportsEventsMargins.eventTypes.football}%</div>
                <div className="w-full bg-green-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.sportsEventsMargins.eventTypes.football}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏀</span>
                  <span className="text-sm font-medium text-gray-700">Baloncesto</span>
                </div>
                <div className="text-lg font-bold text-orange-600">{partner.sportsEventsMargins.eventTypes.basketball}%</div>
                <div className="w-full bg-orange-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-orange-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.sportsEventsMargins.eventTypes.basketball}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚾</span>
                  <span className="text-sm font-medium text-gray-700">Béisbol</span>
                </div>
                <div className="text-lg font-bold text-blue-600">{partner.sportsEventsMargins.eventTypes.baseball}%</div>
                <div className="w-full bg-blue-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.sportsEventsMargins.eventTypes.baseball}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎾</span>
                  <span className="text-sm font-medium text-gray-700">Tenis</span>
                </div>
                <div className="text-lg font-bold text-purple-600">{partner.sportsEventsMargins.eventTypes.tennis}%</div>
                <div className="w-full bg-purple-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.sportsEventsMargins.eventTypes.tennis}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏐</span>
                  <span className="text-sm font-medium text-gray-700">Vóley</span>
                </div>
                <div className="text-lg font-bold text-pink-600">{partner.sportsEventsMargins.eventTypes.volleyball}%</div>
                <div className="w-full bg-pink-100 rounded-full h-1 mt-2">
                  <div 
                    className="bg-pink-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${partner.sportsEventsMargins.eventTypes.volleyball}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* General Sports Events Margin */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">%</span>
                </div>
                <div>
                                  <h4 className="font-medium text-gray-900">Markup General Eventos Deportivos</h4>
                <p className="text-xs text-gray-500">Markup aplicado a todos los eventos deportivos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{partner.sportsEventsMargins.generalMargin}%</p>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${partner.sportsEventsMargins.generalMargin}%` }}
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <Info className="w-4 h-4" />
              <span>
                Los markups de eventos deportivos se aplican según el tipo de deporte y momento del evento. 
                Los precios mostrados son configurados desde el módulo de Eventos Deportivos.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 ">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Última actividad: {formatDate(partner.lastActivity)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const PartnersRelations2: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  
  // Modal states
  const [isCreatePartnerModalOpen, setIsCreatePartnerModalOpen] = useState(false);
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [isEditMarginModalOpen, setIsEditMarginModalOpen] = useState(false);
  const [isSavingMargin, setIsSavingMargin] = useState(false);
  
  // Margin editing state
  const [editingMargin, setEditingMargin] = useState<EditingMargin>({
    partnerId: '',
    currentMargin: 0,
    newMargin: 0,
    currentProgrammaticMargin: 0,
    newProgrammaticMargin: 0,
    marginType: 'marketplace',
    currentMarketplaceMargins: {
      momentos: 0,
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0
    },
    newMarketplaceMargins: {
      momentos: 0,
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  });
  
  // Form data
  const [createPartnerData, setCreatePartnerData] = useState<CreatePartnerData>({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    permissions: {
      canManageContent: false, // Solo para shareflow screen
      canManageSSP: true, // Funcionalidad básica de SSP
      canCreateSportsEvents: false, // Requiere habilitación manual
      canAccessAnalytics: false // Información sensible
    }
  });

  // Geolocation states
  const [locationFilters, setLocationFilters] = useState<LocationFilter>({});
  const [showMap, setShowMap] = useState(false);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [mapViewport, setMapViewport] = useState<MapViewport>({
    center: DEFAULT_MAP_CENTER,
    zoom: 6
  });
  const [radiusTargeting, setRadiusTargeting] = useState<RadiusTargeting | undefined>(undefined);
  const [showRadiusTools, setShowRadiusTools] = useState(false);

  // Get available cities and regions for filters
  const availableCities = Array.from(new Set(mockScreenLocations.map(screen => screen.city)));
  const availableRegions = Array.from(new Set(mockScreenLocations.map(screen => screen.region)));

  // Filter screens based on location filters
  const filteredScreens = mockScreenLocations.filter(screen => {
    const matchesCity = !locationFilters.city || screen.city === locationFilters.city;
    const matchesRegion = !locationFilters.region || screen.region === locationFilters.region;
    const matchesScreenType = !locationFilters.screenTypes || locationFilters.screenTypes.includes(screen.screenType);
    const matchesPartner = !locationFilters.partnerId || screen.partnerId === locationFilters.partnerId;
    
    // Radius filter
    const matchesRadius = !locationFilters.radius || (() => {
      const distance = Math.sqrt(
        Math.pow(screen.coordinates.latitude - locationFilters.radius!.center.latitude, 2) +
        Math.pow(screen.coordinates.longitude - locationFilters.radius!.center.longitude, 2)
      ) * 111; // Approximate km per degree
      return distance <= locationFilters.radius!.kilometers;
    })();
    
    return matchesCity && matchesRegion && matchesScreenType && matchesPartner && matchesRadius;
  });

  // Filter partners based on location filters (partners with screens in filtered areas)
  const partnersWithFilteredScreens = locationFilters.city || locationFilters.region || locationFilters.screenTypes || locationFilters.partnerId || locationFilters.radius
    ? partners.filter(partner => 
        filteredScreens.some(screen => screen.partnerId === partner.id)
      )
    : partners;

  const filteredPartners = partnersWithFilteredScreens.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
    const matchesTier = tierFilter === 'all' || partner.tier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'suspended', label: 'Suspendidos' }
  ];

  const tierOptions = [
    { value: 'all', label: 'Todos los tiers' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'bronze', label: 'Bronze' }
  ];

  // Partner creation handler
  const handleCreatePartner = async () => {
    if (!createPartnerData.name || !createPartnerData.companyName || !createPartnerData.email) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createPartnerData.email)) {
      toast.error('Por favor ingrese un email válido');
      return;
    }

    setIsCreatingPartner(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPartner: Partner = {
        id: `partner-${Date.now()}`,
        name: createPartnerData.companyName,
        contactPerson: createPartnerData.name,
        email: createPartnerData.email,
        phone: createPartnerData.phone || '',
        location: 'Colombia',
        status: 'pending',
        tier: 'bronze',
        joinDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        revenue: 0,
        screens: 0,
        performance: 0,
        commission: 10,
        customMargin: 20,
        programmaticMargin: 15,
        grossMargin: 20,
        networkInventory: {
          totalScreens: 0,
          activeScreens: 0,
          inactiveScreens: 0,
          maintenanceScreens: 0,
          fillRate: 0,
          avgCPM: 0,
          totalImpressions: 0,
          uptime: 0
        },
        cities: [],
        regions: [],
        marketplaceMargins: {
          momentos: 20,
          hourly: 18,
          daily: 15,
          weekly: 12,
          monthly: 10
        },
        teamMembers: [
          {
            id: 'tm-12',
            name: createPartnerData.name,
            email: createPartnerData.email,
            role: 'partner_owner',
            status: 'pending',
            joinedAt: new Date().toISOString().split('T')[0],
            permissions: {
              canViewBilling: true,
              canModifyBankAccount: true,
              canManageTeam: true,
              canViewAnalytics: true,
              canGenerateReports: true
            }
          }
        ],
        paymentMethods: {
          preferredMethod: 'bank',
          bankAccount: {
            bankName: '',
            accountNumber: '',
            accountType: 'checking',
            swiftCode: '',
            routingNumber: '',
            accountHolderName: '',
            verified: false
          },
          paypal: {
            email: '',
            verified: false
          },
          payoneer: {
            email: '',
            verified: false
          }
        },
        cmsIntegration: {
          provider: 'manual',
          status: 'pending',
          screensImported: 0,
          integrationHealth: 'good',
          lastSync: new Date().toISOString(),
          connectionDetails: {
            authMethod: 'Manual Upload',
            capabilities: ['manual-scheduling']
          }
        },
        screenActivity: {
          addedThisWeek: 0,
          addedThisMonth: 0,
          lastScreenAdded: new Date().toISOString().split('T')[0],
          lastContentUpdate: new Date().toISOString().split('T')[0],
          lastPaymentReceived: new Date().toISOString().split('T')[0]
        },
        sportsEventsPermissions: {
          canCreateSportsEvents: createPartnerData.permissions.canCreateSportsEvents,
          canManageEventPricing: false,
          canViewEventAnalytics: false
        },
        financialMetrics: {
          ltv: 0,
          totalTransactions: 0,
          transactionsThisMonth: 0,
          totalPaidToDate: 0,
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nextPaymentAmount: 0,
          averageTransactionValue: 0,
          monthlyRecurringRevenue: 0,
          conversionRate: 0,
          revenueGrowthRate: 0,
          paymentFrequency: 'monthly',
          lastPaymentDate: new Date().toISOString().split('T')[0],
          pendingBalance: 0
        }
      };

      setPartners(prev => [newPartner, ...prev]);
      
      toast.success(
        `Partner ${createPartnerData.companyName} creado exitosamente. 
        Se ha enviado un email de activación a ${createPartnerData.email} 
        para configurar su cuenta y acceder al portal en partners.shareflow.me`
      );
      
      setIsCreatePartnerModalOpen(false);
      setCreatePartnerData({ 
        name: '', 
        companyName: '', 
        email: '', 
        phone: '',
        permissions: {
          canManageContent: false,
          canManageSSP: true,
          canCreateSportsEvents: false,
          canAccessAnalytics: false
        }
      });
    } catch (error) {
      console.error('Error creating partner:', error);
      toast.error('Error al crear el partner');
    } finally {
      setIsCreatingPartner(false);
    }
  };

  // Margin editing functions
  const handleEditMargin = (partner: Partner) => {
    setEditingMargin({
      partnerId: partner.id,
      currentMargin: partner.customMargin || partner.grossMargin,
      newMargin: partner.customMargin || partner.grossMargin,
      currentProgrammaticMargin: partner.programmaticMargin || partner.customMargin || partner.grossMargin,
      newProgrammaticMargin: partner.programmaticMargin || partner.customMargin || partner.grossMargin,
      marginType: 'marketplace',
      currentMarketplaceMargins: partner.marketplaceMargins,
      newMarketplaceMargins: { ...partner.marketplaceMargins }
    });
    setIsEditMarginModalOpen(true);
  };

  const handleSaveMargin = async () => {
    if (!editingMargin.partnerId) return;
    
    // Validation
    if (editingMargin.newMargin < 0 || editingMargin.newMargin > 100) {
      toast.error('El markup debe estar entre 0% y 100%');
      return;
    }
    
    if (editingMargin.newProgrammaticMargin < 0 || editingMargin.newProgrammaticMargin > 100) {
      toast.error('El markup programático debe estar entre 0% y 100%');
      return;
    }

    // Validate marketplace margins
    const marketplaceMargins = editingMargin.newMarketplaceMargins;
    if (marketplaceMargins.momentos < 0 || marketplaceMargins.momentos > 100 ||
        marketplaceMargins.hourly < 0 || marketplaceMargins.hourly > 100 ||
        marketplaceMargins.daily < 0 || marketplaceMargins.daily > 100 ||
        marketplaceMargins.weekly < 0 || marketplaceMargins.weekly > 100 ||
        marketplaceMargins.monthly < 0 || marketplaceMargins.monthly > 100) {
      toast.error('Todos los markups de marketplace deben estar entre 0% y 100%');
      return;
    }
    
    setIsSavingMargin(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update partner margin
      const updatedPartner = {
        ...partners.find(p => p.id === editingMargin.partnerId)!,
        customMargin: editingMargin.newMargin,
        grossMargin: editingMargin.newMargin,
        programmaticMargin: editingMargin.newProgrammaticMargin,
        marketplaceMargins: { ...editingMargin.newMarketplaceMargins }
      };

      setPartners(prev => prev.map(partner => 
        partner.id === editingMargin.partnerId ? updatedPartner : partner
      ));

      // Update selected partner if it's the one being edited
      if (selectedPartner?.id === editingMargin.partnerId) {
        setSelectedPartner(updatedPartner);
      }

      toast.success(`Markups actualizados - Programático: ${editingMargin.newProgrammaticMargin}%, Marketplace: Momentos ${editingMargin.newMarketplaceMargins.momentos}%, Mes ${editingMargin.newMarketplaceMargins.monthly}%`);
      
      setIsEditMarginModalOpen(false);
      setEditingMargin({ 
        partnerId: '', 
        currentMargin: 0, 
        newMargin: 0,
        currentProgrammaticMargin: 0,
        newProgrammaticMargin: 0,
        marginType: 'marketplace',
        currentMarketplaceMargins: {
          momentos: 0,
          hourly: 0,
          daily: 0,
          weekly: 0,
          monthly: 0
        },
        newMarketplaceMargins: {
          momentos: 0,
          hourly: 0,
          daily: 0,
          weekly: 0,
          monthly: 0
        }
      });
    } catch (error) {
      console.error('Error updating margin:', error);
      toast.error('Error al actualizar markups');
    } finally {
      setIsSavingMargin(false);
    }
  };

  // Handle partner selection
  const handlePartnerSelect = (partner: Partner) => {
    setSelectedPartner(partner);
  };

  // Geolocation handlers
  const handleScreenSelect = (screenId: string) => {
    setSelectedScreens(prev => {
      if (prev.includes(screenId)) {
        return prev.filter(id => id !== screenId);
      } else {
        return [...prev, screenId];
      }
    });
  };

  const handleRadiusTargetingChange = (targeting: RadiusTargeting) => {
    setRadiusTargeting(targeting);
    
    // Auto-select screens within radius
    const screensInRadius = filteredScreens.filter(screen => {
      const distance = Math.sqrt(
        Math.pow(screen.coordinates.latitude - targeting.center.latitude, 2) +
        Math.pow(screen.coordinates.longitude - targeting.center.longitude, 2)
      ) * 111; // Approximate km per degree
      return distance <= targeting.radius;
    });
    
    setSelectedScreens(screensInRadius.map(screen => screen.id));
  };

  const handleMapViewportChange = (viewport: MapViewport) => {
    setMapViewport(viewport);
  };

  const handleLocationFiltersChange = (filters: LocationFilter) => {
    setLocationFilters(filters);
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const toggleRadiusTools = () => {
    setShowRadiusTools(!showRadiusTools);
  };

  const clearAllFilters = () => {
    setLocationFilters({});
    setSelectedScreens([]);
    setRadiusTargeting(undefined);
    setSearchTerm('');
    setStatusFilter('all');
    setTierFilter('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Modern Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Gestión de Partners
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Administra y supervisa las relaciones con tus partners estratégicos
              </p>
              <div className="flex items-center mt-4 space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>{partners.filter(p => p.status === 'active').length} Partners Activos</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>{partners.reduce((acc, p) => acc + p.screens, 0)} Pantallas Total</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>{formatCurrency(partners.reduce((acc, p) => acc + p.revenue, 0))} Revenue</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" icon={<Download className="w-5 h-5" />}>
                Exportar
              </Button>
              <Button 
                variant="primary" 
                icon={<Plus className="w-5 h-5" />}
                onClick={() => setIsCreatePartnerModalOpen(true)}
              >
                Nuevo Partner
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {mockMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <EnhancedMetricCard 
                {...metric} 
                subtitle="Último mes"
                trend={[65, 78, 82, 95, 88, 92, 100]}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Modern Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className={`${UI_CLASSES.padding.section} ${UI_CLASSES.margin.section}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 max-w-md">
              <SearchBar
                  placeholder="Buscar partners, ciudades o ubicaciones..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="flex items-center space-x-4">
              <FilterDropdown
                label="Estado"
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              <FilterDropdown
                label="Tier"
                options={tierOptions}
                value={tierFilter}
                onChange={setTierFilter}
              />
                
                <Button
                  variant={showMap ? "primary" : "secondary"}
                  size="sm"
                  icon={<Globe2 className="w-4 h-4" />}
                  onClick={toggleMap}
                >
                  {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
                </Button>
                
                <Button
                  variant={showRadiusTools ? "primary" : "ghost"}
                  size="sm"
                  icon={<Compass className="w-4 h-4" />}
                  onClick={toggleRadiusTools}
                >
                  Herramientas
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Route className="w-4 h-4" />}
                  onClick={clearAllFilters}
                >
                  Limpiar Todo
                </Button>

              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Location Filters */}
        <LocationFilters
          filters={locationFilters}
          onFiltersChange={handleLocationFiltersChange}
          availableCities={availableCities}
          availableRegions={availableRegions}
          screens={mockScreenLocations}
        />

        {/* Interactive Map */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <InteractiveMap
                screens={filteredScreens}
                selectedScreens={selectedScreens}
                onScreenSelect={handleScreenSelect}
                viewport={mapViewport}
                onViewportChange={handleMapViewportChange}
                radiusTargeting={radiusTargeting}
                onRadiusChange={handleRadiusTargetingChange}
                showRadiusTool={showRadiusTools}
                locationFilters={locationFilters}
                onLocationFiltersChange={handleLocationFiltersChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Mostrando {filteredPartners.length} de {partners.length} partners
            {filteredScreens.length !== mockScreenLocations.length && (
              <span className="ml-2 text-blue-600">
                • {filteredScreens.length} pantallas filtradas
              </span>
            )}
            {selectedScreens.length > 0 && (
              <span className="ml-2 text-purple-600">
                • {selectedScreens.length} pantallas seleccionadas
              </span>
            )}
          </p>
        </div>

        {/* Content Layout - Two Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Partners List */}
          <div className="xl:col-span-1">
            <div className={UI_CLASSES.container.section}>
              <div className={`${UI_CLASSES.padding.card} bg-gray-50 border-b border-gray-200 rounded-t-lg`}>
                <h3 className={UI_CLASSES.heading.h5}>Partners ({filteredPartners.length})</h3>
              </div>
              
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                    >
                      <PartnersTable 
                        partners={filteredPartners} 
                        selectedPartner={selectedPartner}
                        onPartnerSelect={handlePartnerSelect}
                      />
                    </motion.div>

                {/* Empty State */}
                {filteredPartners.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 p-4"
                  >
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron partners
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Intenta ajustar los filtros o términos de búsqueda
                    </p>
                    <Button variant="primary" size="sm" onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTierFilter('all');
                    }}>
                      Limpiar filtros
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Partner Details Panel */}
          <div className="xl:col-span-3">
            {selectedPartner ? (
              <PartnerDetailPanel partner={selectedPartner} onEditMargin={handleEditMargin} />
            ) : (
              <div className={`${getCardClasses()} text-center`}>
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className={`${UI_CLASSES.heading.h3} mb-2`}>
                  Selecciona un Partner
                </h3>
                <p className="text-gray-600">
                  Elige un partner de la lista para ver detalles completos, métricas y gestionar actividades
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Partner Modal */}
        <AnimatePresence>
          {isCreatePartnerModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setIsCreatePartnerModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-2xl bg-white rounded-lg  overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white">
                  <h2 className="text-2xl font-bold">Crear Nuevo Partner</h2>
                  <p className="text-blue-100 mt-1">Registra un nuevo partner en la plataforma</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Contacto *
                      </label>
                      <input
                        type="text"
                        value={createPartnerData.name}
                        onChange={(e) => setCreatePartnerData({...createPartnerData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ej: Juan Pérez"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Empresa *
                      </label>
                      <input
                        type="text"
                        value={createPartnerData.companyName}
                        onChange={(e) => setCreatePartnerData({...createPartnerData, companyName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ej: MediaCorp Digital S.A.S"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Corporativo *
                      </label>
                      <input
                        type="email"
                        value={createPartnerData.email}
                        onChange={(e) => setCreatePartnerData({...createPartnerData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ej: contacto@mediacorp.co"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={createPartnerData.phone || ''}
                        onChange={(e) => setCreatePartnerData({...createPartnerData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ej: +57 300 123 4567"
                      />
                    </div>
                  </div>

                  {/* Partner Permissions Section */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Permisos del Partner
                      </h3>
                      <p className="text-sm text-gray-600">
                        Define qué funcionalidades tendrá habilitadas este partner en su portal
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-orange-900">Gestionar Contenidos (CMS)</h4>
                            <p className="text-xs text-orange-700">Solo para partners con Shareflow Screen</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={createPartnerData.permissions.canManageContent}
                            onChange={(e) => setCreatePartnerData({
                              ...createPartnerData,
                              permissions: {
                                ...createPartnerData.permissions,
                                canManageContent: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">Gestión SSP</h4>
                            <p className="text-xs text-green-700">Listar pantallas y aprobar contenidos programáticos</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={createPartnerData.permissions.canManageSSP}
                            onChange={(e) => setCreatePartnerData({
                              ...createPartnerData,
                              permissions: {
                                ...createPartnerData.permissions,
                                canManageSSP: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Eventos Deportivos</h4>
                            <p className="text-xs text-blue-700">Gestionar eventos y momentos publicitarios</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={createPartnerData.permissions.canCreateSportsEvents}
                            onChange={(e) => setCreatePartnerData({
                              ...createPartnerData,
                              permissions: {
                                ...createPartnerData.permissions,
                                canCreateSportsEvents: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-900">Analytics Avanzados</h4>
                            <p className="text-xs text-purple-700">Acceso a reportes y métricas detalladas</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={createPartnerData.permissions.canAccessAnalytics}
                            onChange={(e) => setCreatePartnerData({
                              ...createPartnerData,
                              permissions: {
                                ...createPartnerData.permissions,
                                canAccessAnalytics: e.target.checked
                              }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">
                          <strong>Nota:</strong> Los permisos pueden ser modificados posteriormente desde la gestión de partners. 
                          El permiso de "Gestionar Contenidos (CMS)" solo está disponible para partners con Shareflow Screen. 
                          Todos los partners pueden configurar precios y paquetes por defecto.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setIsCreatePartnerModalOpen(false)}
                      disabled={isCreatingPartner}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreatePartner}
                      disabled={!createPartnerData.name || !createPartnerData.companyName || !createPartnerData.email || isCreatingPartner}
                    >
                      {isCreatingPartner ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creando...
                        </div>
                      ) : (
                        'Crear Partner'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Margin Modal */}
        <AnimatePresence>
          {isEditMarginModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto "
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Configurar Markups
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Actualizar markups para {partners.find(p => p.id === editingMargin.partnerId)?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditMarginModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Margin Type Selector */}
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-3">
                         Configurar Markups
                       </label>
                       <div className="grid grid-cols-1 gap-6">
                         {/* Marketplace Margins by Type */}
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                           <div className="flex items-center gap-3 mb-4">
                             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                               <ShoppingCart className="w-5 h-5 text-blue-600" />
                             </div>
                             <div>
                               <h4 className="font-medium text-blue-900">Markups Marketplace</h4>
                               <p className="text-sm text-blue-700">Markups específicos por tipo de compra</p>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Momentos */}
                             <div className="bg-white rounded-lg p-3 border border-blue-100">
                               <div className="flex items-center gap-2 mb-3">
                                 <span className="text-lg">⚡</span>
                                 <div>
                                   <span className="text-sm font-medium text-gray-700">Momentos</span>
                                   <p className="text-xs text-gray-500">Spots de 15s</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3 mb-2">
                                 <input
                                   type="range"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.momentos}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       momentos: parseInt(e.target.value)
                                     }
                                   })}
                                   className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                                 />
                                 <input
                                   type="number"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.momentos}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       momentos: parseInt(e.target.value) || 0
                                     }
                                   })}
                                   className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 />
                                 <span className="text-sm text-gray-500">%</span>
                               </div>
                               <div className="text-xs text-gray-500">
                                 Actual: {editingMargin.currentMarketplaceMargins.momentos}%
                               </div>
                             </div>

                             {/* Hourly */}
                             <div className="bg-white rounded-lg p-3 border border-cyan-100">
                               <div className="flex items-center gap-2 mb-3">
                                 <span className="text-lg">🕐</span>
                                 <div>
                                   <span className="text-sm font-medium text-gray-700">Por hora</span>
                                   <p className="text-xs text-gray-500">Rotación horaria</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3 mb-2">
                                 <input
                                   type="range"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.hourly}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       hourly: parseInt(e.target.value)
                                     }
                                   })}
                                   className="flex-1 h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                                 />
                                 <input
                                   type="number"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.hourly}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       hourly: parseInt(e.target.value) || 0
                                     }
                                   })}
                                   className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                 />
                                 <span className="text-sm text-gray-500">%</span>
                               </div>
                               <div className="text-xs text-gray-500">
                                 Actual: {editingMargin.currentMarketplaceMargins.hourly}%
                               </div>
                             </div>

                             {/* Daily */}
                             <div className="bg-white rounded-lg p-3 border border-green-100">
                               <div className="flex items-center gap-2 mb-3">
                                 <span className="text-lg">📅</span>
                                 <div>
                                   <span className="text-sm font-medium text-gray-700">Por día</span>
                                   <p className="text-xs text-gray-500">24 horas completas</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3 mb-2">
                                 <input
                                   type="range"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.daily}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       daily: parseInt(e.target.value)
                                     }
                                   })}
                                   className="flex-1 h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                                 />
                                 <input
                                   type="number"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.daily}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       daily: parseInt(e.target.value) || 0
                                     }
                                   })}
                                   className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                 />
                                 <span className="text-sm text-gray-500">%</span>
                               </div>
                               <div className="text-xs text-gray-500">
                                 Actual: {editingMargin.currentMarketplaceMargins.daily}%
                               </div>
                             </div>

                             {/* Weekly */}
                             <div className="bg-white rounded-lg p-3 border border-orange-100">
                               <div className="flex items-center gap-2 mb-3">
                                 <span className="text-lg">📊</span>
                                 <div>
                                   <span className="text-sm font-medium text-gray-700">Por semana</span>
                                   <p className="text-xs text-gray-500">7 días seguidos</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3 mb-2">
                                 <input
                                   type="range"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.weekly}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       weekly: parseInt(e.target.value)
                                     }
                                   })}
                                   className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                                 />
                                 <input
                                   type="number"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.weekly}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       weekly: parseInt(e.target.value) || 0
                                     }
                                   })}
                                   className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                 />
                                 <span className="text-sm text-gray-500">%</span>
                               </div>
                               <div className="text-xs text-gray-500">
                                 Actual: {editingMargin.currentMarketplaceMargins.weekly}%
                               </div>
                             </div>

                             {/* Monthly */}
                             <div className="bg-white rounded-lg p-3 border border-pink-100">
                               <div className="flex items-center gap-2 mb-3">
                                 <span className="text-lg">🗓️</span>
                                 <div>
                                   <span className="text-sm font-medium text-gray-700">Por mes</span>
                                   <p className="text-xs text-gray-500">30 días completos</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3 mb-2">
                                 <input
                                   type="range"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.monthly}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       monthly: parseInt(e.target.value)
                                     }
                                   })}
                                   className="flex-1 h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                                 />
                                 <input
                                   type="number"
                                   min="0"
                                   max="100"
                                   value={editingMargin.newMarketplaceMargins.monthly}
                                   onChange={(e) => setEditingMargin({
                                     ...editingMargin,
                                     newMarketplaceMargins: {
                                       ...editingMargin.newMarketplaceMargins,
                                       monthly: parseInt(e.target.value) || 0
                                     }
                                   })}
                                   className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                 />
                                 <span className="text-sm text-gray-500">%</span>
                               </div>
                               <div className="text-xs text-gray-500">
                                 Actual: {editingMargin.currentMarketplaceMargins.monthly}%
                               </div>
                             </div>
                           </div>
                         </div>

                        {/* Programmatic Margin */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-900">Markup Programático</h4>
                              <p className="text-sm text-purple-700">Para campañas automáticas y smart campaigns</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <label className="text-sm font-medium text-gray-700 w-20">
                                Actual:
                              </label>
                              <span className="text-sm font-semibold text-purple-600">
                                {editingMargin.currentProgrammaticMargin}%
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <label className="text-sm font-medium text-gray-700 w-20">
                                Nuevo:
                              </label>
                              <div className="flex-1 max-w-xs">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={editingMargin.newProgrammaticMargin}
                                  onChange={(e) => setEditingMargin({
                                    ...editingMargin,
                                    newProgrammaticMargin: parseInt(e.target.value)
                                  })}
                                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-thumb-purple"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>0%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editingMargin.newProgrammaticMargin}
                                onChange={(e) => setEditingMargin({
                                  ...editingMargin,
                                  newProgrammaticMargin: parseInt(e.target.value) || 0
                                })}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formula Explanation */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Fórmula de Cálculo</h4>
                          <p className="text-sm text-gray-700 mb-3">
                            <strong>Precio Final = Costo Base ÷ (1 - Markup %)</strong>
                          </p>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>• <strong>Marketplace:</strong> Cada tipo de compra tiene un markup específico</p>
                            <div className="grid grid-cols-2 gap-2 ml-4 text-xs">
                              <div>⚡ Momentos: {editingMargin.newMarketplaceMargins.momentos}%</div>
                              <div>🕐 Por hora: {editingMargin.newMarketplaceMargins.hourly}%</div>
                              <div>📅 Por día: {editingMargin.newMarketplaceMargins.daily}%</div>
                              <div>📊 Por semana: {editingMargin.newMarketplaceMargins.weekly}%</div>
                              <div className="col-span-2">🗓️ Por mes: {editingMargin.newMarketplaceMargins.monthly}%</div>
                            </div>
                            <p>• <strong>Programático:</strong> {editingMargin.newProgrammaticMargin}% para todas las compras programáticas</p>
                            <p>• Los precios se actualizarán automáticamente según el tipo de compra</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-3">Vista Previa del Cambio</h4>
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div>
                          <p className="text-yellow-800 font-medium mb-2">Marketplace por Tipo:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-yellow-700">
                              <span className="font-medium">Momentos:</span> {editingMargin.currentMarketplaceMargins.momentos}% → {editingMargin.newMarketplaceMargins.momentos}%
                            </div>
                            <div className="text-yellow-700">
                              <span className="font-medium">Por hora:</span> {editingMargin.currentMarketplaceMargins.hourly}% → {editingMargin.newMarketplaceMargins.hourly}%
                            </div>
                            <div className="text-yellow-700">
                              <span className="font-medium">Por día:</span> {editingMargin.currentMarketplaceMargins.daily}% → {editingMargin.newMarketplaceMargins.daily}%
                            </div>
                            <div className="text-yellow-700">
                              <span className="font-medium">Por semana:</span> {editingMargin.currentMarketplaceMargins.weekly}% → {editingMargin.newMarketplaceMargins.weekly}%
                            </div>
                            <div className="text-yellow-700 col-span-2">
                              <span className="font-medium">Por mes:</span> {editingMargin.currentMarketplaceMargins.monthly}% → {editingMargin.newMarketplaceMargins.monthly}%
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-yellow-800 font-medium">Programático:</p>
                          <p className="text-yellow-700">
                            {editingMargin.currentProgrammaticMargin}% → {editingMargin.newProgrammaticMargin}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditMarginModalOpen(false)}
                      disabled={isSavingMargin}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSaveMargin}
                      disabled={isSavingMargin}
                    >
                      {isSavingMargin ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Guardando...
                        </div>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnersRelations2;

// Add custom styles for the sliders
const styles = `
  .slider-thumb-blue::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #4F46E5;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #ffffff;
  }
  
  .slider-thumb-blue::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #4F46E5;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #ffffff;
  }
  
  .slider-thumb-purple::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #7C3AED;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #ffffff;
  }
  
  .slider-thumb-purple::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #7C3AED;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #ffffff;
  }
`;

// Inject styles into the document
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
} 