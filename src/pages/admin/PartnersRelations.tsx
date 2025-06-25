// =============================================================================
// MODERN HIGH-PERFORMANCE PARTNERS CRM
// Optimized for speed, scalability, and enterprise-grade performance
// Enhanced with CRM functionality, AI recommendations, screen inventory management
// =============================================================================

import React, { 
  useState, useEffect, useMemo, useCallback, memo, 
  Suspense, lazy, useTransition, useDeferredValue,
  startTransition, useRef
} from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Users, Calculator, Calendar, 
  Building, BarChart3, Eye, Settings, ChevronRight,
  Phone, Mail, MapPin, Star, Search, Edit3, Save, X, AlertCircle, CheckCircle,
  Wallet, CreditCard, Target, Heart, Zap, FileText, PiggyBank, Clock, Globe, 
  Signal, Network, Copy, Download, Filter, Receipt, User, Play, Monitor, 
  CalendarDays, Activity, Shield, Award, Sparkles, TrendingDown, Plus,
  MessageSquare, Archive, RefreshCw, ExternalLink, Users2, Crown, 
  AlertTriangle, Info, Trash2, Edit, UserPlus, PhoneCall, Video,
  Send, ChevronDown, ChevronUp, MoreHorizontal, Brain, ArrowUp, ArrowDown,
  HelpCircle, Wifi, WifiOff, Cpu, Database, Cloud, Server
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

// =============================================================================
// PERFORMANCE OPTIMIZATIONS & MODERN PATTERNS
// =============================================================================

// 1. DEBOUNCED SEARCH HOOK
const useDebounce = function<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// 2. MODERN STATE MANAGEMENT WITH ZUSTAND-LIKE PATTERN
interface PartnerStoreState {
  partners: Partner[];
  selectedPartnerId: string | null;
  searchTerm: string;
  deferredSearchTerm: string;
  viewMode: 'cards' | 'table' | 'compact';
  isLoading: boolean;
  filters: AdvancedPartnerFilters;
}

// 3. OPTIMIZED FILTERING ALGORITHMS
const filterPartnersOptimized = (
  partners: Partner[], 
  filters: AdvancedPartnerFilters, 
  searchTerm: string
): Partner[] => {
  if (!partners.length) return [];
  
  let filtered = partners;
  
  // Search optimization - only if search term exists
  if (searchTerm?.trim()) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(partner => 
      partner.name.toLowerCase().includes(normalizedSearch) ||
      partner.email.toLowerCase().includes(normalizedSearch) ||
      partner.accountManager.toLowerCase().includes(normalizedSearch) ||
      partner.address.toLowerCase().includes(normalizedSearch)
    );
  }
  
  // Tier filter
  if (filters.tiers.length > 0) {
    filtered = filtered.filter(p => filters.tiers.includes(p.tier));
  }
  
  // CMS types filter
  if (filters.cmsTypes.length > 0) {
    filtered = filtered.filter(p => filters.cmsTypes.includes(p.cmsType));
  }
  
  // Churn risk filter
  if (filters.churnRiskLevels.length > 0) {
    filtered = filtered.filter(p => filters.churnRiskLevels.includes(p.churnRisk));
  }
  
  // Range filters - only if defined
  if (filters.healthScoreRange) {
    const { min, max } = filters.healthScoreRange;
    filtered = filtered.filter(p => p.healthScore >= min && p.healthScore <= max);
  }
  
  if (filters.mrrRange) {
    const { min, max } = filters.mrrRange;
    filtered = filtered.filter(p => p.mrr >= min && p.mrr <= max);
  }
  
  // Date range filters
  if (filters.joinDateRange) {
    const start = new Date(filters.joinDateRange.start);
    const end = new Date(filters.joinDateRange.end);
    filtered = filtered.filter(p => p.joinDate >= start && p.joinDate <= end);
  }
  
  if (filters.lastActivityRange) {
    const start = new Date(filters.lastActivityRange.start);
    const end = new Date(filters.lastActivityRange.end);
    filtered = filtered.filter(p => p.lastActivity >= start && p.lastActivity <= end);
  }
  
  // Contract types filter
  if (filters.contractTypes.length > 0) {
    filtered = filtered.filter(p => filters.contractTypes.includes(p.contractType));
  }
  
  return filtered;
};

// 4. OPTIMIZED METRICS CALCULATION
const calculateDashboardMetrics = (partners: Partner[]): DashboardMetrics => {
  if (!partners.length) {
    return {
      totalPartners: 0,
      mrr: 0,
      averageHealthScore: 0,
      pipelineValue: 0,
      churnRisk: { low: 0, medium: 0, high: 0, critical: 0 },
      conversionRates: { marketplaceToSale: 0, programmaticEfficiency: 0 },
      supportMetrics: { activeTickets: 0, avgSatisfaction: 0, avgResponseTime: 0 }
    };
  }
  
  const totalMRR = partners.reduce((sum, p) => sum + p.mrr, 0);
  const averageHealthScore = partners.reduce((sum, p) => sum + p.healthScore, 0) / partners.length;
  const pipelineValue = partners.reduce((sum, p) => sum + p.ltv, 0);
  
  const churnRisk = partners.reduce((acc, p) => {
    acc[p.churnRisk]++;
    return acc;
  }, { low: 0, medium: 0, high: 0, critical: 0 });
  
  const totalViews = partners.reduce((sum, p) => sum + p.conversionMetrics.marketplaceViews, 0);
  const totalPurchases = partners.reduce((sum, p) => sum + p.conversionMetrics.marketplacePurchases, 0);
  const totalImpressions = partners.reduce((sum, p) => sum + p.conversionMetrics.programmaticImpressions, 0);
  const totalProgrammaticRevenue = partners.reduce((sum, p) => sum + p.conversionMetrics.programmaticRevenue, 0);
  
  const marketplaceToSale = totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0;
  const programmaticEfficiency = totalImpressions > 0 ? (totalProgrammaticRevenue / totalImpressions) * 1000 : 0;
  
  const activeTickets = partners.reduce((sum, p) => sum + p.engagementMetrics.supportTickets, 0);
  const avgSatisfaction = partners.reduce((sum, p) => sum + p.engagementMetrics.satisfactionScore, 0) / partners.length;
  
  return {
    totalPartners: partners.length,
    mrr: totalMRR,
    averageHealthScore: Math.round(averageHealthScore),
    pipelineValue,
    churnRisk,
    conversionRates: {
      marketplaceToSale,
      programmaticEfficiency
    },
    supportMetrics: {
      activeTickets,
      avgSatisfaction,
      avgResponseTime: 24 // Mock average response time in hours
    }
  };
};

// Enhanced Interfaces for CRM
interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  logo?: string;
  totalScreens: number;
  totalRevenue: number;
  netRevenue: number;
  grossMargin: number;
  customMargin?: number;
  programmaticMargin?: number; // Margen específico para Programmatic/SmartCampaigns
  lastPayout: Date;
  nextPayout: Date;
  pendingPayout: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: Date;
  lastActivity: Date;
  cmsType: 'shareflow' | 'broadsign' | 'latinad' | 'api' | 'hybrid';
  
  // Financial Configuration
  currency: 'COP' | 'USD' | 'EUR' | 'MXN' | 'PEN' | 'CLP' | 'BRL';
  currencySymbol: string;
  
  // CRM Enhanced Fields
  mrr: number; // Monthly Recurring Revenue (lo que les hemos generado)
  ltv: number; // Lifetime Value
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  healthScore: number; // 0-100
  accountManager: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  contractType: 'revenue_share' | 'fixed_fee' | 'hybrid';
  contractStart: Date;
  contractEnd: Date;
  
  // Metrics
  conversionMetrics: {
    marketplaceViews: number;
    marketplacePurchases: number;
    programmaticImpressions: number;
    programmaticRevenue: number;
    conversionRate: number;
    aov: number; // Average Order Value
  };
  
  // Engagement
  engagementMetrics: {
    loginFrequency: number;
    lastLogin: Date;
    supportTickets: number;
    satisfactionScore: number;
    onboardingComplete: boolean;
    screenUtilization: number;
  };
  
  // Financial Performance
  financialMetrics: {
    monthlyGrowth: number;
    revenueContribution: number; // % of total platform revenue
    marginTrend: number;
    paymentCompliance: number;
    earlyPaymentDiscount: boolean;
  };

  // Recent Activity
  recentActivity: {
    newScreensThisWeek: number;
    newScreensThisMonth: number;
    lastScreenAdded: Date | null;
    lastContentUpdate: Date | null;
    lastPaymentReceived: Date | null;
  };

  // Team/Contacts
  contacts: PartnerContact[];
  
  // CMS Integration
  cmsConfig?: {
    provider: string;
    connectionStatus: 'connected' | 'disconnected' | 'error';
    lastSync?: Date;
    apiEndpoint?: string;
    screensImported?: number;
    integrationHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
  
  relationshipHealth: {
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    factors: {
      paymentCompliance: number;
      responseTime: number;
      contentQuality: number;
      technicalIssues: number;
      growthTrend: number;
    };
  };
  
  earlyPaymentDiscount: {
    enabled: boolean;
    percentage: number;
    daysEarly: number;
    totalSavings: number;
  };
  
  valueMetrics: {
    totalLifetimeValue: number;
    monthlyGrowthRate: number;
    avgMarginContribution: number;
    reliabilityScore: number;
  };

  // Notes and Comments
  notes: PartnerNote[];
  tags: string[];
}

interface PartnerContact {
  id: string;
  partnerId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'partner_owner' | 'partner_admin' | 'partner_user' | 'partner_financial';
  department: string;
  isPrimary: boolean;
  communicationPreference: 'email' | 'phone' | 'whatsapp' | 'teams';
  status: 'active' | 'inactive';
  joinedAt: Date;
  lastContact: Date | null;
}

interface PartnerNote {
  id: string;
  partnerId: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'note' | 'call' | 'meeting' | 'email' | 'task';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  dueDate?: Date;
  tags: string[];
}

interface PartnerScreen {
  id: string;
  partnerId: string;
  name: string;
  location: string;
  category: string;
  environment: 'indoor' | 'outdoor';
  size: string;
  resolution: string;
  connectionType: 'shareflow-screen' | 'broadsign' | 'latinad' | 'api' | 'manual';
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: Date | null;
  healthScore: number; // 0-100
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  uptime: number; // percentage
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  audience: number;
  peakHours: string;
  specs: {
    brightness: string;
    refreshRate: string;
    powerConsumption: string;
    operatingHours: string;
  };
  telemetry: {
    isOnline: boolean;
    lastHeartbeat: Date | null;
    temperature?: number;
    powerStatus: 'on' | 'off' | 'standby';
    errorCount: number;
    warningCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Payment and Billing Interfaces from PartnerBilling.tsx
interface PaymentSchedule {
  id: string;
  amount: number;
  scheduledDate: string;
  status: 'scheduled' | 'processing' | 'paid' | 'failed';
  period: string;
  screens: string[];
  paymentMethod: 'bank_transfer' | 'digital_wallet' | 'check';
}

interface CampaignPurchase {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userEmail: string;
  dateOfPurchase: Date;
  costOfPurchase: number;
  partnerRevenue: number;
  spotsOrPlays: number;
  screenId: string;
  screenName: string;
  packageType: string;
  variantName: string;
  startDate: Date;
  finishDate: Date;
  status: 'active' | 'completed' | 'cancelled';
}

interface ScreenRevenue {
  id: string;
  screenName: string;
  screenType: 'shareflow' | 'broadsign' | 'latinad' | 'api';
  location: string;
  totalRevenue: number;
  packageBreakdown: PackageRevenue[];
  playsConsumed: number;
  spotsConsumed: number;
  status: 'active' | 'paused' | 'maintenance';
  lastUpdate: string;
}

interface PackageRevenue {
  packageType: 'moments' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  variantId: string;
  variantName: string;
  pricePerUnit: number;
  unitsConsumed: number; // plays or time units
  totalRevenue: number;
  revenueShare: number; // Partner's share after Shareflow commission
}

interface Activity {
  id: string;
  partnerId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'payment' | 'screen_added' | 'content_update';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled';
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  metadata?: any;
}

interface CreatePartnerData {
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

// Smart Search Interfaces
interface SmartSearchResult {
  partnerId: string;
  relevanceScore: number;
  matchType: 'name' | 'email' | 'company' | 'phone' | 'location' | 'tier' | 'cms_type' | 'behavior' | 'financial' | 'health_score';
  matchedText: string;
  context: string;
}

interface AdvancedPartnerFilters {
  tiers: string[];
  cmsTypes: string[];
  healthScoreRange: { min: number; max: number } | null;
  mrrRange: { min: number; max: number } | null;
  churnRiskLevels: string[];
  joinDateRange: { start: string; end: string } | null;
  lastActivityRange: { start: string; end: string } | null;
  contractTypes: string[];
}

interface DashboardMetrics {
  totalPartners: number;
  mrr: number;
  averageHealthScore: number;
  pipelineValue: number;
  churnRisk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  conversionRates: {
    marketplaceToSale: number;
    programmaticEfficiency: number;
  };
  supportMetrics: {
    activeTickets: number;
    avgSatisfaction: number;
    avgResponseTime: number;
  };
}

// =============================================================================
// 5. MEMOIZED COMPONENTS WITH PERFECT OPTIMIZATION
// =============================================================================

// Optimized Partner Card Component
const OptimizedPartnerCard = memo(({ 
  partner, 
  isSelected, 
  onClick 
}: { 
  partner: Partner;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const getTierIcon = useCallback((tier: string) => {
    switch (tier) {
      case 'platinum': return <Sparkles className="w-3 h-3 text-purple-600" />;
      case 'gold': return <Crown className="w-3 h-3 text-yellow-600" />;
      case 'silver': return <Award className="w-3 h-3 text-gray-600" />;
      case 'bronze': return <Award className="w-3 h-3 text-orange-600" />;
      default: return <Award className="w-3 h-3 text-gray-400" />;
    }
  }, []);

  const getHealthScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }, []);

  return (
    <motion.div
      className={`group p-4 bg-white rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-200 ${
        isSelected ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'
      }`}
      onClick={onClick}
      whileHover={{ y: -1 }}
      layout="position"
      layoutId={`partner-${partner.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {partner.logo ? (
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              {getTierIcon(partner.tier)}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
              {partner.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{partner.accountManager}</p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreColor(partner.healthScore)}`}>
          {partner.healthScore}
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-green-50 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 font-medium">MRR</span>
          </div>
          <div className="text-sm font-bold text-green-700">
            {formatCurrency(partner.mrr)}
          </div>
        </div>
      
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Monitor className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Pantallas</span>
          </div>
          <div className="text-sm font-bold text-blue-700">{partner.totalScreens}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            partner.status === 'active' ? 'bg-green-100 text-green-800' :
            partner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {partner.status}
          </div>
          
          {partner.cmsType && (
            <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {partner.cmsType}
            </div>
          )}
        </div>
        
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for perfect memoization
  return (
    prevProps.partner.id === nextProps.partner.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.partner.healthScore === nextProps.partner.healthScore &&
    prevProps.partner.mrr === nextProps.partner.mrr &&
    prevProps.partner.totalScreens === nextProps.partner.totalScreens &&
    prevProps.partner.status === nextProps.partner.status
  );
});

// Smart Search Component with AI-like behavior
const SmartSearchBar = memo(({ 
  searchTerm, 
  onSearchChange, 
  onSearch,
  isPending = false 
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: (query: string) => void;
  isPending?: boolean;
}) => {
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-500" />
            {isPending && <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />}
          </div>
          <input
            type="text"
            placeholder="Búsqueda inteligente: nombre, email, 'partners alto valor', 'crecimiento', 'tier gold'..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          />
        </div>
      </div>
    </div>
  );
});

// Dashboard Metrics with smooth animations
const EnhancedDashboardMetrics = memo(({ metrics }: { metrics: DashboardMetrics }) => {
  const MetricCard = memo(({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    format = 'number' 
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color: string;
    trend?: number;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const formattedValue = useMemo(() => {
      switch (format) {
        case 'currency':
          return `$${(value / 1000000).toFixed(1)}M`;
        case 'percentage':
          return `${value.toFixed(1)}%`;
        default:
          return value.toString();
      }
    }, [value, format]);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{formattedValue}</h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </motion.div>
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Partners"
        value={metrics.totalPartners}
        icon={Users}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        trend={8.2}
      />
      
      <MetricCard
        title="MRR Total"
        value={metrics.mrr}
        icon={DollarSign}
        color="bg-gradient-to-br from-green-500 to-green-600"
        trend={12.5}
        format="currency"
      />
      
      <MetricCard
        title="Health Score Promedio"
        value={metrics.averageHealthScore}
        icon={Heart}
        color="bg-gradient-to-br from-pink-500 to-pink-600"
        trend={3.1}
      />
      
      <MetricCard
        title="Pipeline Value"
        value={metrics.pipelineValue}
        icon={Target}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        trend={15.8}
        format="currency"
      />
    </div>
  );
});

// =============================================================================
// 6. LOADING SKELETONS FOR PERFECT UX
// =============================================================================

const MetricsSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
          <div className="h-8 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
));

const PartnerListSkeleton = memo(() => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-1" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

const DetailsSkeleton = memo(() => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  </div>
));

// =============================================================================
// MODERN PERFORMANCE ENHANCEMENTS INTEGRATION STATUS:
// ✅ React 18 Concurrent Features (useTransition, useDeferredValue)
// ✅ Optimized filtering algorithms with memoization
// ✅ Enhanced dashboard metrics calculation
// ✅ Modern memoized components (OptimizedPartnerCard, SmartSearchBar, EnhancedDashboardMetrics)
// ✅ Loading skeletons for better UX (MetricsSkeleton, PartnerListSkeleton, DetailsSkeleton)
// ✅ Debounced search functionality with useDebounce hook
// ✅ Performance optimization patterns and modern TypeScript
// ✅ Enhanced state management patterns ready for integration
// =============================================================================

// Mock Data Enhanced for CRM
const generateEnhancedMockPartners = (): Partner[] => [
  {
    id: 'partner-1',
    name: 'MediaCorp Solutions',
    email: 'contact@mediacorp.co',
    phone: '+57 310 123 4567',
    address: 'Calle 50 #12-34, Medellín',
    rating: 4.8,
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
    totalScreens: 24,
    totalRevenue: 45600000,
    netRevenue: 32200000,
    grossMargin: 29.4,
    customMargin: 30,
    programmaticMargin: 25, // Margen preferencial para Programmatic
    lastPayout: new Date('2024-05-15'),
    nextPayout: new Date('2024-06-15'),
    pendingPayout: 8400000,
    status: 'active',
    joinDate: new Date('2023-08-15'),
    lastActivity: new Date('2024-06-01'),
    cmsType: 'broadsign',
    
    // Financial Configuration
    currency: 'COP',
    currencySymbol: '$',
    
    // Enhanced CRM fields
    mrr: 3800000, // $3.8M COP monthly
    ltv: 142800000,
    churnRisk: 'low',
    healthScore: 92,
    accountManager: 'Ana García',
    tier: 'gold',
    contractType: 'revenue_share',
    contractStart: new Date('2023-08-15'),
    contractEnd: new Date('2025-08-15'),
    
    conversionMetrics: {
      marketplaceViews: 15420,
      marketplacePurchases: 847,
      programmaticImpressions: 2800000,
      programmaticRevenue: 12400000,
      conversionRate: 5.49,
      aov: 180000
    },
    
    engagementMetrics: {
      loginFrequency: 18, // days per month
      lastLogin: new Date('2024-06-01'),
      supportTickets: 3,
      satisfactionScore: 4.8,
      onboardingComplete: true,
      screenUtilization: 87
    },
    
    financialMetrics: {
      monthlyGrowth: 8.5,
      revenueContribution: 18.2,
      marginTrend: 2.1,
      paymentCompliance: 98,
      earlyPaymentDiscount: true
    },

    recentActivity: {
      newScreensThisWeek: 2,
      newScreensThisMonth: 5,
      lastScreenAdded: new Date('2024-05-28'),
      lastContentUpdate: new Date('2024-05-30'),
      lastPaymentReceived: new Date('2024-05-15')
    },

    contacts: [
      {
        id: 'contact-1',
        partnerId: 'partner-1',
        name: 'Juan Pérez',
        email: 'juan@mediacorp.co',
        phone: '+57 310 123 4567',
        role: 'partner_owner',
        department: 'General Management',
        isPrimary: true,
        communicationPreference: 'email',
        status: 'active',
        joinedAt: new Date('2023-08-15'),
        lastContact: new Date('2024-05-28')
      },
      {
        id: 'contact-2',
        partnerId: 'partner-1',
        name: 'María García',
        email: 'maria@mediacorp.co',
        phone: '+57 310 123 4568',
        role: 'partner_admin',
        department: 'Operations',
        isPrimary: false,
        communicationPreference: 'phone',
        status: 'active',
        joinedAt: new Date('2023-09-01'),
        lastContact: new Date('2024-05-25')
      }
    ],

    cmsConfig: {
      provider: 'Broadsign Enterprise',
      connectionStatus: 'connected',
      lastSync: new Date('2024-06-01T10:30:00'),
      apiEndpoint: 'https://mediacorp.broadsign.com/api/v1',
      screensImported: 24,
      integrationHealth: 'excellent'
    },
    
    relationshipHealth: {
      score: 92,
      status: 'excellent',
      factors: {
        paymentCompliance: 98,
        responseTime: 95,
        contentQuality: 88,
        technicalIssues: 92,
        growthTrend: 85
      }
    },
    
    earlyPaymentDiscount: {
      enabled: true,
      percentage: 0.5,
      daysEarly: 2,
      totalSavings: 126000
    },
    
    valueMetrics: {
      totalLifetimeValue: 142800000,
      monthlyGrowthRate: 8.5,
      avgMarginContribution: 29.4,
      reliabilityScore: 96
    },

    notes: [
      {
        id: 'note-1',
        partnerId: 'partner-1',
        authorId: 'admin-1',
        authorName: 'Ana García',
        content: 'Excelente reunión trimestral. Planean expandir 8 pantallas más en Q3.',
        type: 'meeting',
        priority: 'medium',
        status: 'completed',
        createdAt: new Date('2024-05-28'),
        tags: ['expansion', 'meeting', 'q3']
      }
    ],
    tags: ['high-value', 'expanding', 'broadsign']
  },
  
  {
    id: 'partner-2',
    name: 'Digital Screens Network',
    email: 'admin@dsn.com.co',
    phone: '+57 320 987 6543',
    address: 'Carrera 43A #15-67, Bogotá',
    rating: 4.6,
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop&crop=center',
    totalScreens: 18,
    totalRevenue: 32800000,
    netRevenue: 22960000,
    grossMargin: 30.1,
    customMargin: 28,
    programmaticMargin: 23, // Margen preferencial para Programmatic
    lastPayout: new Date('2024-05-15'),
    nextPayout: new Date('2024-06-15'),
    pendingPayout: 6200000,
    status: 'active',
    joinDate: new Date('2023-11-20'),
    lastActivity: new Date('2024-05-30'),
    cmsType: 'shareflow',
    
    // Financial Configuration
    currency: 'COP',
    currencySymbol: '$',
    
    mrr: 2730000,
    ltv: 88600000,
    churnRisk: 'medium',
    healthScore: 78,
    accountManager: 'Carlos Ruiz',
    tier: 'silver',
    contractType: 'revenue_share',
    contractStart: new Date('2023-11-20'),
    contractEnd: new Date('2025-11-20'),
    
    conversionMetrics: {
      marketplaceViews: 9830,
      marketplacePurchases: 421,
      programmaticImpressions: 1200000,
      programmaticRevenue: 8200000,
      conversionRate: 4.28,
      aov: 195000
    },
    
    engagementMetrics: {
      loginFrequency: 12,
      lastLogin: new Date('2024-05-30'),
      supportTickets: 8,
      satisfactionScore: 4.2,
      onboardingComplete: true,
      screenUtilization: 73
    },
    
    financialMetrics: {
      monthlyGrowth: 5.2,
      revenueContribution: 12.8,
      marginTrend: -1.2,
      paymentCompliance: 85,
      earlyPaymentDiscount: false
    },

    recentActivity: {
      newScreensThisWeek: 0,
      newScreensThisMonth: 2,
      lastScreenAdded: new Date('2024-05-10'),
      lastContentUpdate: new Date('2024-05-29'),
      lastPaymentReceived: new Date('2024-05-15')
    },

    contacts: [
      {
        id: 'contact-3',
        partnerId: 'partner-2',
        name: 'Roberto Silva',
        email: 'roberto@dsn.com.co',
        phone: '+57 320 987 6543',
        role: 'partner_owner',
        department: 'Management',
        isPrimary: true,
        communicationPreference: 'whatsapp',
        status: 'active',
        joinedAt: new Date('2023-11-20'),
        lastContact: new Date('2024-05-20')
      }
    ],

    cmsConfig: {
      provider: 'Shareflow Screen CMS',
      connectionStatus: 'connected',
      lastSync: new Date('2024-06-01T11:15:00'),
      screensImported: 18,
      integrationHealth: 'excellent'
    },
    
    relationshipHealth: {
      score: 78,
      status: 'good',
      factors: {
        paymentCompliance: 85,
        responseTime: 82,
        contentQuality: 90,
        technicalIssues: 75,
        growthTrend: 70
      }
    },
    
    earlyPaymentDiscount: {
      enabled: true,
      percentage: 0.5,
      daysEarly: 1,
      totalSavings: 62000
    },
    
    valueMetrics: {
      totalLifetimeValue: 88600000,
      monthlyGrowthRate: 5.2,
      avgMarginContribution: 30.1,
      reliabilityScore: 84
    },

    notes: [
      {
        id: 'note-2',
        partnerId: 'partner-2',
        authorId: 'admin-2',
        authorName: 'Carlos Ruiz',
        content: 'Reportan problemas con algunas pantallas. Solicitar soporte técnico.',
        type: 'note',
        priority: 'high',
        status: 'pending',
        createdAt: new Date('2024-05-29'),
        dueDate: new Date('2024-06-05'),
        tags: ['soporte', 'técnico']
      }
    ],
    tags: ['shareflow', 'needs-attention']
  }
];

// Custom Tooltip Component
const CustomTooltip = ({ children, content, position = 'top' }: { 
  children: React.ReactNode; 
  content: string; 
  position?: 'top' | 'bottom' | 'left' | 'right' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs whitespace-nowrap shadow-lg">
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data for screens
const generateMockScreens = (partnerId: string): PartnerScreen[] => {
  const baseScreens = [
    {
      id: `screen-${partnerId}-1`,
      partnerId,
      name: 'LED Principal Centro Comercial',
      location: 'Centro Comercial Plaza Mayor, Entrada Principal',
      category: 'retail_malls',
      environment: 'indoor' as const,
      size: '6x4m',
      resolution: '1920x1080',
      connectionType: 'shareflow-screen' as const,
      connectionStatus: 'connected' as const,
      lastSync: new Date(),
      healthScore: 95,
      status: 'active' as const,
      uptime: 99.2,
      dailyRate: 480000,
      weeklyRate: 3200000,
      monthlyRate: 12000000,
      audience: 85000,
      peakHours: '10:00-22:00',
      specs: {
        brightness: '5000 nits',
        refreshRate: '60 Hz',
        powerConsumption: '850W',
        operatingHours: '14h/día'
      },
      telemetry: {
        isOnline: true,
        lastHeartbeat: new Date(),
        temperature: 42,
        powerStatus: 'on' as const,
        errorCount: 0,
        warningCount: 1
      },
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date()
    },
    {
      id: `screen-${partnerId}-2`,
      partnerId,
      name: 'Pantalla Digital Zona Food Court',
      location: 'Centro Comercial Plaza Mayor, Zona de Comidas',
      category: 'food_courts',
      environment: 'indoor' as const,
      size: '4x3m',
      resolution: '1280x960',
      connectionType: 'broadsign' as const,
      connectionStatus: 'connected' as const,
      lastSync: new Date(Date.now() - 30000), // 30 seconds ago
      healthScore: 87,
      status: 'active' as const,
      uptime: 97.8,
      dailyRate: 320000,
      weeklyRate: 2200000,
      monthlyRate: 8500000,
      audience: 45000,
      peakHours: '12:00-15:00, 19:00-21:00',
      specs: {
        brightness: '4000 nits',
        refreshRate: '60 Hz',
        powerConsumption: '650W',
        operatingHours: '16h/día'
      },
      telemetry: {
        isOnline: true,
        lastHeartbeat: new Date(Date.now() - 45000),
        temperature: 38,
        powerStatus: 'on' as const,
        errorCount: 2,
        warningCount: 0
      },
      createdAt: new Date('2023-09-10'),
      updatedAt: new Date()
    },
    {
      id: `screen-${partnerId}-3`,
      partnerId,
      name: 'LED Exterior Fachada',
      location: 'Avenida El Poblado #45-67',
      category: 'billboards',
      environment: 'outdoor' as const,
      size: '8x6m',
      resolution: '2560x1920',
      connectionType: 'api' as const,
      connectionStatus: 'error' as const,
      lastSync: new Date(Date.now() - 3600000), // 1 hour ago
      healthScore: 65,
      status: 'maintenance' as const,
      uptime: 94.5,
      dailyRate: 680000,
      weeklyRate: 4500000,
      monthlyRate: 17000000,
      audience: 120000,
      peakHours: '7:00-9:00, 17:00-20:00',
      specs: {
        brightness: '8000 nits',
        refreshRate: '60 Hz',
        powerConsumption: '1200W',
        operatingHours: '24h/día'
      },
      telemetry: {
        isOnline: false,
        lastHeartbeat: new Date(Date.now() - 3600000),
        temperature: undefined,
        powerStatus: 'off' as const,
        errorCount: 5,
        warningCount: 3
      },
      createdAt: new Date('2023-10-05'),
      updatedAt: new Date()
    }
  ];

  return baseScreens;
};

// Mock data for payments from PartnerBilling.tsx
const generateMockPaymentSchedule = (partnerId: string): PaymentSchedule[] => [
  {
    id: `payment-${partnerId}-1`,
    amount: 15250000,
    scheduledDate: '2024-07-01',
    status: 'scheduled',
    period: 'Junio 2024',
    screens: ['Plaza Mayor LED', 'Santafé Premium', 'Terminal Norte'],
    paymentMethod: 'bank_transfer'
  },
  {
    id: `payment-${partnerId}-2`,
    amount: 12800000,
    scheduledDate: '2024-06-01',
    status: 'paid',
    period: 'Mayo 2024',
    screens: ['Plaza Mayor LED', 'Santafé Premium'],
    paymentMethod: 'bank_transfer'
  },
  {
    id: `payment-${partnerId}-3`,
    amount: 9600000,
    scheduledDate: '2024-05-01',
    status: 'paid',
    period: 'Abril 2024',
    screens: ['Plaza Mayor LED'],
    paymentMethod: 'bank_transfer'
  }
];

const generateMockCampaignPurchases = (partnerId: string): CampaignPurchase[] => [
  {
    id: `camp-${partnerId}-001`,
    campaignId: 'SF-2024-001',
    userId: 'user-001',
    userName: 'María González',
    userEmail: 'maria.gonzalez@empresa.com',
    dateOfPurchase: new Date('2024-05-15T10:30:00'),
    costOfPurchase: 850000,
    partnerRevenue: 595000, // Solo lo que recibe el partner
    spotsOrPlays: 120,
    screenId: 'screen-001',
    screenName: 'Plaza Mayor LED',
    packageType: 'weekly',
    variantName: 'Paquete Semanal Premium',
    startDate: new Date('2024-05-20T09:00:00'),
    finishDate: new Date('2024-05-27T18:00:00'),
    status: 'completed'
  },
  {
    id: `camp-${partnerId}-002`,
    campaignId: 'SF-2024-002',
    userId: 'user-002',
    userName: 'Carlos Ramírez',
    userEmail: 'carlos.ramirez@startup.co',
    dateOfPurchase: new Date('2024-05-18T14:15:00'),
    costOfPurchase: 1200000,
    partnerRevenue: 840000,
    spotsOrPlays: 200,
    screenId: 'screen-002',
    screenName: 'Santafé Premium',
    packageType: 'weekly',
    variantName: 'Paquete Semanal Estándar',
    startDate: new Date('2024-05-25T06:00:00'),
    finishDate: new Date('2024-06-01T22:00:00'),
    status: 'completed'
  },
  {
    id: `camp-${partnerId}-003`,
    campaignId: 'SF-2024-003',
    userId: 'user-003',
    userName: 'Ana Sofía Herrera',
    userEmail: 'ana.herrera@agencia.com',
    dateOfPurchase: new Date('2024-06-01T11:45:00'),
    costOfPurchase: 2400000,
    partnerRevenue: 1680000,
    spotsOrPlays: 480,
    screenId: 'screen-003',
    screenName: 'Terminal Norte',
    packageType: 'monthly',
    variantName: 'Paquete Mensual Ejecutivo',
    startDate: new Date('2024-06-05T08:00:00'),
    finishDate: new Date('2024-06-30T20:00:00'),
    status: 'active'
  }
];

const generateMockScreenRevenue = (partnerId: string): ScreenRevenue[] => [
  {
    id: `revenue-${partnerId}-1`,
    screenName: 'Plaza Mayor LED',
    screenType: 'shareflow',
    location: 'Centro Comercial Plaza Mayor',
    totalRevenue: 5250000,
    packageBreakdown: [
      {
        packageType: 'weekly',
        variantId: 'weekly-premium',
        variantName: 'Paquete Semanal Premium',
        pricePerUnit: 850000,
        unitsConsumed: 3,
        totalRevenue: 2550000,
        revenueShare: 1785000
      },
      {
        packageType: 'monthly',
        variantId: 'monthly-standard',
        variantName: 'Paquete Mensual Estándar',
        pricePerUnit: 2700000,
        unitsConsumed: 1,
        totalRevenue: 2700000,
        revenueShare: 1890000
      }
    ],
    playsConsumed: 1420,
    spotsConsumed: 285,
    status: 'active',
    lastUpdate: '2024-06-01T10:30:00'
  },
  {
    id: `revenue-${partnerId}-2`,
    screenName: 'Santafé Premium',
    screenType: 'broadsign',
    location: 'Centro Comercial Santafé',
    totalRevenue: 6800000,
    packageBreakdown: [
      {
        packageType: 'weekly',
        variantId: 'weekly-standard',
        variantName: 'Paquete Semanal Estándar',
        pricePerUnit: 1200000,
        unitsConsumed: 4,
        totalRevenue: 4800000,
        revenueShare: 3360000
      },
      {
        packageType: 'daily',
        variantId: 'daily-express',
        variantName: 'Paquete Diario Express',
        pricePerUnit: 400000,
        unitsConsumed: 5,
        totalRevenue: 2000000,
        revenueShare: 1400000
      }
    ],
    playsConsumed: 1890,
    spotsConsumed: 378,
    status: 'active',
    lastUpdate: '2024-06-01T11:15:00'
  }
];

// Mock data for activities
const generateMockActivities = (): Activity[] => [
  {
    id: 'activity-1',
    partnerId: 'partner-1',
    type: 'call',
    title: 'Llamada de seguimiento Q2',
    description: 'Revisión de métricas del segundo trimestre y planificación Q3',
    priority: 'high',
    status: 'completed',
    assignedTo: 'Ana García',
    createdBy: 'Admin',
    createdAt: new Date('2024-05-28'),
    completedAt: new Date('2024-05-28'),
    dueDate: new Date('2024-05-28')
  },
  {
    id: 'activity-2',
    partnerId: 'partner-1',
    type: 'screen_added',
    title: 'Nueva pantalla agregada',
    description: 'MediaCorp agregó pantalla LED en Centro Comercial Santafé',
    priority: 'medium',
    status: 'completed',
    assignedTo: 'Sistema',
    createdBy: 'Sistema',
    createdAt: new Date('2024-05-28'),
    completedAt: new Date('2024-05-28'),
    metadata: { screenId: 'screen-125', location: 'Centro Comercial Santafé' }
  },
  {
    id: 'activity-3',
    partnerId: 'partner-2',
    type: 'task',
    title: 'Revisar soporte técnico',
    description: 'Pantallas con problemas de conectividad reportadas por DSN',
    priority: 'urgent',
    status: 'pending',
    assignedTo: 'Carlos Ruiz',
    createdBy: 'Ana García',
    createdAt: new Date('2024-05-29'),
    dueDate: new Date('2024-06-05')
  },
  {
    id: 'activity-4',
    partnerId: 'partner-2',
    type: 'payment',
    title: 'Pago recibido',
    description: 'Pago mensual procesado correctamente',
    priority: 'low',
    status: 'completed',
    assignedTo: 'Sistema',
    createdBy: 'Sistema',
    createdAt: new Date('2024-05-15'),
    completedAt: new Date('2024-05-15'),
    metadata: { amount: 6200000, method: 'bank_transfer' }
  }
];

// Enhanced filter options
const statusOptions = [
  { value: 'all', label: 'Todos los estados', count: 0 },
  { value: 'active', label: 'Activos', count: 0 },
  { value: 'inactive', label: 'Inactivos', count: 0 },
  { value: 'pending', label: 'Pendientes', count: 0 },
  { value: 'suspended', label: 'Suspendidos', count: 0 }
];

const licenseOptions = [
  { value: 'all', label: 'Todas las licencias' },
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' }
];

const churnRiskOptions = [
  { value: 'all', label: 'Todos los riesgos' },
  { value: 'low', label: 'Bajo riesgo', color: 'green' },
  { value: 'medium', label: 'Riesgo medio', color: 'yellow' },
  { value: 'high', label: 'Alto riesgo', color: 'orange' },
  { value: 'critical', label: 'Riesgo crítico', color: 'red' }
];

const tierOptions = [
  { value: 'all', label: 'Todos los niveles' },
  { value: 'bronze', label: 'Bronze', icon: Award },
  { value: 'silver', label: 'Silver', icon: Award },
  { value: 'gold', label: 'Gold', icon: Crown },
  { value: 'platinum', label: 'Platinum', icon: Sparkles }
];

const sortOptions = [
  { value: 'revenue', label: 'Mayor MRR' },
  { value: 'health_score', label: 'Health Score' },
  { value: 'churn_risk', label: 'Riesgo de Churn' },
  { value: 'activity', label: 'Última actividad' },
  { value: 'screens', label: 'Más pantallas' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'ltv', label: 'Mayor LTV' },
  { value: 'growth', label: 'Mayor crecimiento' }
];

const viewModeOptions = [
  { value: 'cards', label: 'Tarjetas', icon: BarChart3 },
  { value: 'compact', label: 'Compacto', icon: Users },
  { value: 'detailed', label: 'Detallado', icon: FileText }
];

// Performance data for charts
const mrrEvolutionData = [
  { month: 'Ene', mrr: 45200000, growth: 8.2 },
  { month: 'Feb', mrr: 48900000, growth: 8.1 },
  { month: 'Mar', mrr: 52800000, growth: 8.0 },
  { month: 'Abr', mrr: 57100000, growth: 8.1 },
  { month: 'May', mrr: 61600000, growth: 7.9 },
  { month: 'Jun', mrr: 66500000, growth: 8.0 }
];

const churnRiskData = [
  { name: 'Bajo', value: 18, color: '#10B981' },
  { name: 'Medio', value: 8, color: '#F59E0B' },
  { name: 'Alto', value: 4, color: '#EF4444' },
  { name: 'Crítico', value: 2, color: '#DC2626' }
];

const tierDistributionData = [
  { name: 'Bronze', value: 12, color: '#CD7F32' },
  { name: 'Silver', value: 8, color: '#C0C0C0' },
  { name: 'Gold', value: 6, color: '#FFD700' },
  { name: 'Platinum', value: 2, color: '#E5E4E2' }
];

// Optimized Enhanced Partner Card Component
const EnhancedPartnerCard = memo(({ 
  partner, 
  isSelected, 
  onClick,
  viewMode = 'cards'
}: { 
  partner: Partner; 
  isSelected: boolean; 
  onClick: () => void;
  viewMode?: 'cards' | 'compact' | 'detailed';
}) => {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'gold': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'silver': return <Award className="w-4 h-4 text-gray-600" />;
      case 'bronze': return <Award className="w-4 h-4 text-orange-600" />;
      default: return <Award className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  if (viewMode === 'compact') {
  return (
    <motion.div
        className={`group p-4 border-b border-gray-200 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
        onClick={onClick}
        whileHover={{ x: 4 }}
        layout
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Partner Info */}
          <div className="col-span-3 flex items-center gap-3">
            <div className="relative">
              {partner.logo ? (
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} logo`}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1">
                {getTierIcon(partner.tier)}
            </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 truncate">{partner.name}</h4>
              <p className="text-sm text-gray-500 truncate">{partner.accountManager}</p>
            </div>
          </div>

          {/* Health Score */}
          <div className="col-span-1">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreColor(partner.healthScore)}`}>
              {partner.healthScore}
            </div>
          </div>

          {/* MRR */}
          <div className="col-span-1">
            <div className="text-sm font-bold text-green-600">
              {formatCurrency(partner.mrr)}
            </div>
            <div className="text-xs text-gray-500">MRR</div>
          </div>

          {/* Churn Risk */}
          <div className="col-span-1">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(partner.churnRisk)}`}>
              {partner.churnRisk}
            </div>
          </div>

          {/* Screens */}
          <div className="col-span-1">
            <div className="text-sm font-bold text-blue-600">{partner.totalScreens}</div>
            <div className="text-xs text-gray-500">pantallas</div>
          </div>

          {/* Last Activity */}
          <div className="col-span-2">
            <div className="text-sm text-gray-900">
              {partner.lastActivity.toLocaleDateString('es-ES')}
            </div>
            <div className="text-xs text-gray-500">
              {partner.recentActivity.newScreensThisWeek > 0 && (
                <span className="text-green-600">+{partner.recentActivity.newScreensThisWeek} pantallas</span>
          )}
        </div>
          </div>

          {/* Conversion Rate */}
          <div className="col-span-1">
            <div className="text-sm font-bold text-purple-600">
              {partner.conversionMetrics.conversionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">conv.</div>
          </div>

          {/* Status */}
          <div className="col-span-1">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              partner.status === 'active' ? 'bg-green-100 text-green-800' :
              partner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {partner.status}
            </div>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex justify-end">
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
  }

  // Cards view (default)
  return (
    <motion.div
      className={`group p-6 bg-white rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-200 ${
        isSelected ? 'border-blue-500 shadow-lg bg-blue-50' : 'border-gray-200'
      }`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {partner.logo ? (
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`}
                className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              {getTierIcon(partner.tier)}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {partner.name}
            </h3>
            <p className="text-sm text-gray-500">{partner.accountManager}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreColor(partner.healthScore)}`}>
            {partner.healthScore}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(partner.churnRisk)}`}>
            {partner.churnRisk === 'low' ? '✓' : 
             partner.churnRisk === 'medium' ? '⚠' :
             partner.churnRisk === 'high' ? '⚠⚠' : '🚨'}
          </div>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">MRR</span>
        </div>
          <div className="text-lg font-bold text-green-700">
            {formatCurrency(partner.mrr)}
          </div>
          <div className="text-xs text-green-600">
            {partner.financialMetrics.monthlyGrowth > 0 ? '+' : ''}{partner.financialMetrics.monthlyGrowth.toFixed(1)}%
        </div>
      </div>
      
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Monitor className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Pantallas</span>
          </div>
          <div className="text-lg font-bold text-blue-700">{partner.totalScreens}</div>
          <div className="text-xs text-blue-600">
            {partner.recentActivity.newScreensThisWeek > 0 && (
              <span>+{partner.recentActivity.newScreensThisWeek} esta semana</span>
            )}
          </div>
      </div>
      
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Conversión</span>
          </div>
          <div className="text-lg font-bold text-purple-700">
            {partner.conversionMetrics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-purple-600">
            AOV: {formatCurrency(partner.conversionMetrics.aov)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">Actividad</span>
          </div>
          <div className="text-lg font-bold text-orange-700">
            {partner.engagementMetrics.loginFrequency}d
          </div>
          <div className="text-xs text-orange-600">este mes</div>
        </div>
      </div>

      {/* Status and Tags */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            partner.status === 'active' ? 'bg-green-100 text-green-800' :
            partner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {partner.status}
        </div>
          
          {partner.cmsType && (
            <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {partner.cmsType}
            </div>
          )}
      </div>
      
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </motion.div>
  );
});

// Tabs State Interface
interface TabsState {
  activeTab: 'overview' | 'analytics';
}

// Dashboard Metrics Component (Simplified)
const DashboardMetrics = memo(({ partners }: { partners: Partner[] }) => {
  const metrics = useMemo(() => {
    const totalMRR = partners.reduce((sum, p) => sum + p.mrr, 0);
    const avgHealthScore = Math.round(partners.reduce((sum, p) => sum + p.healthScore, 0) / partners.length);
    const totalScreens = partners.reduce((sum, p) => sum + p.totalScreens, 0);
    const avgConversion = partners.reduce((sum, p) => sum + p.conversionMetrics.conversionRate, 0) / partners.length;

    return {
    totalPartners: partners.length,
      mrr: totalMRR,
      averageHealthScore: avgHealthScore,
      totalScreens,
      avgConversion
    };
  }, [partners]);

  const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle, format = 'number' }: any) => {
    const formattedValue = useMemo(() => {
      switch (format) {
        case 'currency':
          return `$${(value / 1000000).toFixed(1)}M`;
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'decimal':
          return value.toFixed(1);
        default:
          return value.toString();
      }
    }, [value, format]);

    return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
            </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
          </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{formattedValue}</h3>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Partners"
        value={metrics.totalPartners}
              icon={Users}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend={8.2}
        subtitle="Activos en plataforma"
            />
      
            <MetricCard
        title="MRR Total"
        value={metrics.mrr}
              icon={DollarSign}
        color="bg-gradient-to-br from-green-500 to-green-600"
              trend={12.5}
              format="currency"
        subtitle="Ingresos mensuales generados"
            />
      
            <MetricCard
        title="Health Score Promedio"
        value={metrics.averageHealthScore}
        icon={Heart}
        color="bg-gradient-to-br from-pink-500 to-pink-600"
        trend={3.1}
        subtitle="Salud de relaciones"
      />
      
            <MetricCard
        title="Total Pantallas"
        value={metrics.totalScreens}
        icon={Monitor}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        trend={15.8}
        subtitle="Inventario total"
      />
    </div>
  );
});

// Analytics Dashboard Component
const AnalyticsDashboard = memo(({ partners }: { partners: Partner[] }) => {
  const analyticsData = useMemo(() => {
    // Calculate comprehensive analytics
    const totalRevenue = partners.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalMRR = partners.reduce((sum, p) => sum + p.mrr, 0);
    const totalScreens = partners.reduce((sum, p) => sum + p.totalScreens, 0);
    const avgHealthScore = partners.reduce((sum, p) => sum + p.healthScore, 0) / partners.length;
    const avgConversionRate = partners.reduce((sum, p) => sum + p.conversionMetrics.conversionRate, 0) / partners.length;
    const totalLTV = partners.reduce((sum, p) => sum + p.ltv, 0);
    const avgSatisfaction = partners.reduce((sum, p) => sum + p.engagementMetrics.satisfactionScore, 0) / partners.length;

    // Top Partners by different metrics
    const topPartnersByMRR = [...partners].sort((a, b) => b.mrr - a.mrr).slice(0, 10);
    const topPartnersByScreens = [...partners].sort((a, b) => b.totalScreens - a.totalScreens).slice(0, 10);
    const topPartnersByGrowth = [...partners].sort((a, b) => b.financialMetrics.monthlyGrowth - a.financialMetrics.monthlyGrowth).slice(0, 8);

    // Distribution analyses
    const tierDistribution = partners.reduce((acc, p) => {
      acc[p.tier] = (acc[p.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const churnRiskDistribution = partners.reduce((acc, p) => {
      acc[p.churnRisk] = (acc[p.churnRisk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const cmsDistribution = partners.reduce((acc, p) => {
      acc[p.cmsType] = (acc[p.cmsType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const contractTypeDistribution = partners.reduce((acc, p) => {
      acc[p.contractType] = (acc[p.contractType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Health Score Distribution
    const healthScoreRanges = {
      '90-100': partners.filter(p => p.healthScore >= 90).length,
      '80-89': partners.filter(p => p.healthScore >= 80 && p.healthScore < 90).length,
      '70-79': partners.filter(p => p.healthScore >= 70 && p.healthScore < 80).length,
      '<70': partners.filter(p => p.healthScore < 70).length
    };

    // Growth trend simulation (last 6 months)
    const growthTrend = [
      { month: 'Ene', partners: Math.round(partners.length * 0.6), mrr: totalMRR * 0.6, screens: Math.round(totalScreens * 0.6), revenue: totalRevenue * 0.6 },
      { month: 'Feb', partners: Math.round(partners.length * 0.7), mrr: totalMRR * 0.7, screens: Math.round(totalScreens * 0.7), revenue: totalRevenue * 0.7 },
      { month: 'Mar', partners: Math.round(partners.length * 0.8), mrr: totalMRR * 0.8, screens: Math.round(totalScreens * 0.8), revenue: totalRevenue * 0.8 },
      { month: 'Abr', partners: Math.round(partners.length * 0.85), mrr: totalMRR * 0.85, screens: Math.round(totalScreens * 0.85), revenue: totalRevenue * 0.85 },
      { month: 'May', partners: Math.round(partners.length * 0.95), mrr: totalMRR * 0.95, screens: Math.round(totalScreens * 0.95), revenue: totalRevenue * 0.95 },
      { month: 'Jun', partners: partners.length, mrr: totalMRR, screens: totalScreens, revenue: totalRevenue }
    ];

    // Engagement Analytics
    const engagementData = partners.map(p => ({
      name: p.name.split(' ')[0],
      loginFreq: p.engagementMetrics.loginFrequency,
      satisfaction: p.engagementMetrics.satisfactionScore,
      utilization: p.engagementMetrics.screenUtilization,
      conversionRate: p.conversionMetrics.conversionRate
    })).slice(0, 10);

    // Financial Performance
    const financialPerformance = partners.map(p => ({
      name: p.name.split(' ')[0],
      mrr: p.mrr / 1000000,
      growth: p.financialMetrics.monthlyGrowth,
      margin: p.grossMargin,
      ltv: p.ltv / 1000000
    })).sort((a, b) => b.mrr - a.mrr).slice(0, 10);

    // Relationship Health Matrix
    const relationshipHealth = partners.map(p => ({
      name: p.name.split(' ')[0],
      paymentCompliance: p.relationshipHealth.factors.paymentCompliance,
      responseTime: p.relationshipHealth.factors.responseTime,
      contentQuality: p.relationshipHealth.factors.contentQuality,
      techHealth: 100 - p.relationshipHealth.factors.technicalIssues,
      growth: p.relationshipHealth.factors.growthTrend
    })).slice(0, 8);

    return {
      kpis: {
        totalPartners: partners.length,
        totalRevenue,
        totalMRR,
        totalScreens,
        avgHealthScore,
        avgConversionRate,
        totalLTV,
        avgSatisfaction
      },
      topPartnersByMRR,
      topPartnersByScreens,
      topPartnersByGrowth,
      tierDistribution,
      churnRiskDistribution,
      cmsDistribution,
      contractTypeDistribution,
      healthScoreRanges,
      growthTrend,
      engagementData,
      financialPerformance,
      relationshipHealth
    };
  }, [partners]);

  // Nueva función para mostrar cifras completas con información de moneda
  const formatCurrencyComplete = (amount: number, partner?: Partner) => {
    const currency = partner?.currency || 'COP';
    const symbol = partner?.currencySymbol || '$';
    const formattedAmount = Math.round(amount).toLocaleString('es-CO') || Math.round(amount).toString();
    return `${symbol}${formattedAmount} ${currency}`;
  };

  // Función original para compatibilidad (usada en gráficos)
  const formatCurrency = (amount: number) => `$${(amount / 1000000).toFixed(1)}M`;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return { bg: 'bg-purple-100', text: 'text-purple-800', color: '#8B5CF6' };
      case 'gold': return { bg: 'bg-yellow-100', text: 'text-yellow-800', color: '#F59E0B' };
      case 'silver': return { bg: 'bg-gray-100', text: 'text-gray-800', color: '#6B7280' };
      case 'bronze': return { bg: 'bg-orange-100', text: 'text-orange-800', color: '#D97706' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', color: '#9CA3AF' };
    }
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#9CA3AF';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Partners</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{analyticsData.kpis.totalPartners}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Revenue Total</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(analyticsData.kpis.totalRevenue)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Total Pantallas</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{analyticsData.kpis.totalScreens}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Health Score</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{analyticsData.kpis.avgHealthScore.toFixed(0)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-teal-700">Conversión Avg</span>
          </div>
          <p className="text-2xl font-bold text-teal-900">{analyticsData.kpis.avgConversionRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">LTV Total</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">{formatCurrency(analyticsData.kpis.totalLTV)}</p>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Crecimiento Multi-Métrica
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.growthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'partners' ? `${value} partners` :
                name === 'screens' ? `${value} pantallas` :
                name === 'mrr' || name === 'revenue' ? `$${(Number(value)/1000000).toFixed(1)}M` : value,
                name === 'mrr' ? 'MRR' :
                name === 'revenue' ? 'Revenue' :
                name === 'screens' ? 'Pantallas' : 'Partners'
              ]} />
              <Line yAxisId="left" type="monotone" dataKey="partners" stroke="#3B82F6" strokeWidth={2} name="partners" />
              <Line yAxisId="left" type="monotone" dataKey="screens" stroke="#8B5CF6" strokeWidth={2} name="screens" />
              <Line yAxisId="right" type="monotone" dataKey="mrr" stroke="#10B981" strokeWidth={2} name="mrr" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} name="revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Top Partners por MRR
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {analyticsData.topPartnersByMRR.slice(0, 8).map((partner, index) => (
              <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{partner.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(partner.tier).bg} ${getTierColor(partner.tier).text}`}>
                        {partner.tier}
                      </span>
                      <span>•</span>
                      <span>{partner.totalScreens} pantallas</span>
                      <span>•</span>
                      <span className={`${getHealthScoreColor(partner.healthScore)} font-medium`}>
                        {partner.healthScore}% health
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(partner.mrr)}</p>
                  <p className="text-sm text-gray-500">
                    {partner.financialMetrics.monthlyGrowth > 0 ? '+' : ''}{partner.financialMetrics.monthlyGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Distribución por Tier
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={Object.entries(analyticsData.tierDistribution).map(([tier, count]) => ({
                  name: tier.charAt(0).toUpperCase() + tier.slice(1),
                  value: count,
                  color: getTierColor(tier).color
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(analyticsData.tierDistribution).map(([tier], index) => (
                  <Cell key={`cell-${index}`} fill={getTierColor(tier).color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Distribución por CMS
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={Object.entries(analyticsData.cmsDistribution).map(([cms, count]) => ({
                  name: cms.charAt(0).toUpperCase() + cms.slice(1),
                  value: count,
                  color: cms === 'shareflow' ? '#3B82F6' :
                         cms === 'broadsign' ? '#10B981' :
                         cms === 'latinad' ? '#F59E0B' :
                         cms === 'api' ? '#EF4444' : '#8B5CF6'
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(analyticsData.cmsDistribution).map(([cms], index) => (
                  <Cell key={`cell-${index}`} fill={
                    cms === 'shareflow' ? '#3B82F6' :
                    cms === 'broadsign' ? '#10B981' :
                    cms === 'latinad' ? '#F59E0B' :
                    cms === 'api' ? '#EF4444' : '#8B5CF6'
                  } />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Análisis de Churn Risk
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(analyticsData.churnRiskDistribution).map(([risk, count]) => ({
              risk: risk.charAt(0).toUpperCase() + risk.slice(1),
              count,
              color: getChurnRiskColor(risk)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="risk" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {Object.entries(analyticsData.churnRiskDistribution).map(([risk], index) => (
                  <Cell key={`cell-${index}`} fill={getChurnRiskColor(risk)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Engagement & Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'loginFreq' ? `${value} logins/mes` :
                name === 'satisfaction' ? `${value}/10` :
                name === 'utilization' ? `${value}%` :
                name === 'conversionRate' ? `${value}%` : value,
                name === 'loginFreq' ? 'Login Frequency' :
                name === 'satisfaction' ? 'Satisfaction' :
                name === 'utilization' ? 'Screen Utilization' : 'Conversion Rate'
              ]} />
              <Bar dataKey="loginFreq" fill="#3B82F6" />
              <Bar dataKey="satisfaction" fill="#10B981" />
              <Bar dataKey="utilization" fill="#F59E0B" />
              <Bar dataKey="conversionRate" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Performance Financiero
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.financialPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'mrr' || name === 'ltv' ? `$${value}M` :
                name === 'growth' || name === 'margin' ? `${value}%` : value,
                name === 'mrr' ? 'MRR' :
                name === 'growth' ? 'Growth' :
                name === 'margin' ? 'Margin' : 'LTV'
              ]} />
              <Bar dataKey="mrr" fill="#10B981" />
              <Bar dataKey="growth" fill="#3B82F6" />
              <Bar dataKey="margin" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Relationship Health Matrix */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Matriz de Salud de Relaciones
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Partner</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Payment</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Response</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Content</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Tech Health</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Growth</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.relationshipHealth.map((partner, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-900">{partner.name}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      partner.paymentCompliance >= 90 ? 'bg-green-500' :
                      partner.paymentCompliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className="ml-2 text-sm">{partner.paymentCompliance}%</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      partner.responseTime >= 90 ? 'bg-green-500' :
                      partner.responseTime >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className="ml-2 text-sm">{partner.responseTime}%</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      partner.contentQuality >= 90 ? 'bg-green-500' :
                      partner.contentQuality >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className="ml-2 text-sm">{partner.contentQuality}%</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      partner.techHealth >= 90 ? 'bg-green-500' :
                      partner.techHealth >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className="ml-2 text-sm">{partner.techHealth}%</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      partner.growth >= 90 ? 'bg-green-500' :
                      partner.growth >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className="ml-2 text-sm">{partner.growth}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Top Partners por Crecimiento
          </h3>
          <div className="space-y-3">
            {analyticsData.topPartnersByGrowth.map((partner, index) => (
              <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{partner.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(partner.mrr)} MRR</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{partner.financialMetrics.monthlyGrowth.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">crecimiento</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Distribución por Tipo de Contrato
          </h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.contractTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900 capitalize">
                  {type.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600">{count}</span>
                  <span className="text-sm text-gray-500">
                    ({((count / partners.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// 7. MODERN CRM COMPONENT WITH ENHANCED STATE MANAGEMENT
// =============================================================================

// Main CRM Component starts here
export function PartnersRelations() {
  // Modern React 18 Concurrent Features
  const [isPending, startTransition] = useTransition();
  
  // State management
  const [partners, setPartners] = useState<Partner[]>(() => generateEnhancedMockPartners());
  const [activities, setActivities] = useState<Activity[]>(() => generateMockActivities());
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerScreens, setPartnerScreens] = useState<Record<string, PartnerScreen[]>>({});
  
  // Payment and Billing State
  const [partnerPayments, setPartnerPayments] = useState<Record<string, PaymentSchedule[]>>({});
  const [partnerCampaigns, setPartnerCampaigns] = useState<Record<string, CampaignPurchase[]>>({});
  const [partnerRevenue, setPartnerRevenue] = useState<Record<string, ScreenRevenue[]>>({});
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [churnRiskFilter, setChurnRiskFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [viewMode, setViewMode] = useState<'cards' | 'compact' | 'detailed'>('cards');
  
  // Modal states
  const [isCreatePartnerModalOpen, setIsCreatePartnerModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [isEditMarginModalOpen, setIsEditMarginModalOpen] = useState(false);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  
  // Margin editing state
  const [editingMargin, setEditingMargin] = useState({
    partnerId: '',
    currentMargin: 0,
    newMargin: 0,
    currentProgrammaticMargin: 0,
    newProgrammaticMargin: 0,
    marginType: 'marketplace' as 'marketplace' | 'programmatic' | 'both'
  });
  
  // Form data
  const [createPartnerData, setCreatePartnerData] = useState<CreatePartnerData>({
    name: '',
    companyName: '',
    email: '',
    phone: ''
  });

  // Activity management state
  const [newActivity, setNewActivity] = useState({
    type: 'note' as Activity['type'],
    title: '',
    description: '',
    priority: 'medium' as Activity['priority'],
    dueDate: '',
    assignedTo: ''
  });

  // Smart Search States
  const [smartSearchResults, setSmartSearchResults] = useState<SmartSearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSmartSearchActive, setIsSmartSearchActive] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedPartnerFilters>({
    tiers: [],
    cmsTypes: [],
    healthScoreRange: null,
    mrrRange: null,
    churnRiskLevels: [],
    joinDateRange: null,
    lastActivityRange: null,
    contractTypes: []
  });

  // Deferred values for performance
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredPartners = useDeferredValue(partners);

  // Enhanced filtering logic with modern optimization  
  const filteredPartners = useMemo(() => {
    // Use optimized filtering algorithm
    const optimizedFiltered = filterPartnersOptimized(
      deferredPartners, 
      advancedFilters, 
      deferredSearchTerm
    );
    
    // Fallback to existing filtering logic for compatibility
    return optimizedFiltered.length > 0 ? optimizedFiltered : partners.filter(partner => {
      const matchesSearch = !searchTerm || 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.accountManager.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
      const matchesChurnRisk = churnRiskFilter === 'all' || partner.churnRisk === churnRiskFilter;
      const matchesTier = tierFilter === 'all' || partner.tier === tierFilter;
      
      // Advanced filters
      const matchesHealthScore = !advancedFilters.healthScoreRange || 
        (partner.healthScore >= advancedFilters.healthScoreRange.min && 
         partner.healthScore <= advancedFilters.healthScoreRange.max);
      
      const matchesMRR = !advancedFilters.mrrRange || 
        (partner.mrr >= advancedFilters.mrrRange.min && 
         partner.mrr <= advancedFilters.mrrRange.max);
      
      const matchesTiers = advancedFilters.tiers.length === 0 || 
        advancedFilters.tiers.includes(partner.tier);
      
      const matchesCmsTypes = advancedFilters.cmsTypes.length === 0 || 
        advancedFilters.cmsTypes.includes(partner.cmsType);
      
      const matchesChurnRiskLevels = advancedFilters.churnRiskLevels.length === 0 || 
        advancedFilters.churnRiskLevels.includes(partner.churnRisk);
      
      const matchesContractTypes = advancedFilters.contractTypes.length === 0 || 
        advancedFilters.contractTypes.includes(partner.contractType);
      
      // Date range filters
      let matchesJoinDate = true;
      if (advancedFilters.joinDateRange) {
        const joinDate = partner.joinDate;
        const startDate = new Date(advancedFilters.joinDateRange.start);
        const endDate = new Date(advancedFilters.joinDateRange.end);
        matchesJoinDate = joinDate >= startDate && joinDate <= endDate;
      }
      
      let matchesLastActivity = true;
      if (advancedFilters.lastActivityRange) {
        const lastActivity = partner.lastActivity;
        const startDate = new Date(advancedFilters.lastActivityRange.start);
        const endDate = new Date(advancedFilters.lastActivityRange.end);
        matchesLastActivity = lastActivity >= startDate && lastActivity <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesChurnRisk && matchesTier &&
             matchesHealthScore && matchesMRR && matchesTiers && matchesCmsTypes &&
             matchesChurnRiskLevels && matchesContractTypes && matchesJoinDate && matchesLastActivity;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.mrr - a.mrr;
        case 'health_score':
          return b.healthScore - a.healthScore;
        case 'churn_risk':
          const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return riskOrder[a.churnRisk] - riskOrder[b.churnRisk];
        case 'activity':
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        case 'screens':
          return b.totalScreens - a.totalScreens;
        case 'ltv':
          return b.ltv - a.ltv;
        case 'growth':
          return b.financialMetrics.monthlyGrowth - a.financialMetrics.monthlyGrowth;
        case 'newest':
          return b.joinDate.getTime() - a.joinDate.getTime();
        default:
          return 0;
      }
    });
  }, [partners, searchTerm, statusFilter, churnRiskFilter, tierFilter, sortBy, advancedFilters]);

  // Enhanced dashboard metrics with memoization (after filteredPartners is defined)
  const dashboardMetrics = useMemo(() => {
    return calculateDashboardMetrics(filteredPartners);
  }, [filteredPartners]);

  // Get recent activities for selected partner
  const partnerActivities = useMemo(() => {
    if (!selectedPartner) return [];
    return activities
      .filter(activity => activity.partnerId === selectedPartner.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }, [activities, selectedPartner]);

  // Enhanced search handlers with React 18 features
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleViewModeChange = useCallback((mode: 'cards' | 'compact' | 'detailed') => {
    startTransition(() => {
      setViewMode(mode);
    });
  }, []);

  // Event handlers
  const handlePartnerSelect = useCallback((partner: Partner) => {
    setSelectedPartner(partner);
    
    // Load screens for this partner if not already loaded
    if (!partnerScreens[partner.id]) {
      setPartnerScreens(prev => ({
        ...prev,
        [partner.id]: generateMockScreens(partner.id)
      }));
    }
    
    // Load payment data for this partner if not already loaded
    if (!partnerPayments[partner.id]) {
      setPartnerPayments(prev => ({
        ...prev,
        [partner.id]: generateMockPaymentSchedule(partner.id)
      }));
    }
    
    // Load campaign data for this partner if not already loaded
    if (!partnerCampaigns[partner.id]) {
      setPartnerCampaigns(prev => ({
        ...prev,
        [partner.id]: generateMockCampaignPurchases(partner.id)
      }));
    }
    
    // Load revenue data for this partner if not already loaded
    if (!partnerRevenue[partner.id]) {
      setPartnerRevenue(prev => ({
        ...prev,
        [partner.id]: generateMockScreenRevenue(partner.id)
      }));
    }
  }, [partnerScreens, partnerPayments, partnerCampaigns, partnerRevenue]);

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
      const response = await fetch('/api/partners/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          contactName: createPartnerData.name,
          companyName: createPartnerData.companyName,
          email: createPartnerData.email,
          phone: createPartnerData.phone,
          licenseType: 'free'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el partner');
      }

      const newPartner = await response.json();
      
      toast.success(
        `Partner ${createPartnerData.companyName} creado exitosamente. 
        Se ha enviado un email de activación a ${createPartnerData.email} 
        para configurar su cuenta y acceder al portal en partners.shareflow.me`
      );
      
      setIsCreatePartnerModalOpen(false);
      setCreatePartnerData({ name: '', companyName: '', email: '', phone: '' });
      
      // Reload partners (in real app, this would be handled differently)
      window.location.reload();
    } catch (error) {
      console.error('Error creating partner:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el partner');
    } finally {
      setIsCreatingPartner(false);
    }
  };

  const handleAddActivity = () => {
    if (!selectedPartner || !newActivity.title || !newActivity.description) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const activity: Activity = {
      id: `activity-${Date.now()}`,
      partnerId: selectedPartner.id,
      type: newActivity.type,
      title: newActivity.title,
      description: newActivity.description,
      priority: newActivity.priority,
      status: 'pending',
      assignedTo: newActivity.assignedTo || 'Admin',
      createdBy: 'Admin',
      createdAt: new Date(),
      dueDate: newActivity.dueDate ? new Date(newActivity.dueDate) : undefined
    };

    setActivities(prev => [activity, ...prev]);
    setNewActivity({
      type: 'note',
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: ''
    });
    setIsActivityModalOpen(false);
    toast.success('Actividad agregada exitosamente');
  };

  // Margin Management Functions
  const handleEditMargin = (partner: Partner) => {
    setEditingMargin({
      partnerId: partner.id,
      currentMargin: partner.customMargin || partner.grossMargin,
      newMargin: partner.customMargin || partner.grossMargin,
      currentProgrammaticMargin: partner.programmaticMargin || partner.customMargin || partner.grossMargin,
      newProgrammaticMargin: partner.programmaticMargin || partner.customMargin || partner.grossMargin,
      marginType: 'marketplace'
    });
    setIsEditMarginModalOpen(true);
  };

  const handleSaveMargin = () => {
    if (!editingMargin.partnerId) return;

    // Update partner margin
    const updatedPartner = {
      ...partners.find(p => p.id === editingMargin.partnerId)!,
      customMargin: editingMargin.newMargin,
      grossMargin: editingMargin.newMargin,
      programmaticMargin: editingMargin.newProgrammaticMargin
    };

    setPartners(prev => prev.map(partner => 
      partner.id === editingMargin.partnerId ? updatedPartner : partner
    ));

    // Update selected partner if it's the one being edited
    if (selectedPartner?.id === editingMargin.partnerId) {
      setSelectedPartner(updatedPartner);
    }

    // Update all screens for this partner with new pricing based on margin
    const partnerScreensData = partnerScreens[editingMargin.partnerId];
    if (partnerScreensData) {
      const updatedScreens = partnerScreensData.map(screen => {
        // Apply margin formula: costo/(1-(margen %))
        const marginDecimal = editingMargin.newMargin / 100;
        const currentMarginDecimal = editingMargin.currentMargin / 100;
        
        // Reverse engineer base cost from current price
        const baseCost = screen.dailyRate * (1 - currentMarginDecimal);
        
        // Apply new margin
        const newDailyRate = baseCost / (1 - marginDecimal);
        const newWeeklyRate = newDailyRate * 7;
        const newMonthlyRate = newDailyRate * 30;

        return {
          ...screen,
          dailyRate: Math.round(newDailyRate),
          weeklyRate: Math.round(newWeeklyRate),
          monthlyRate: Math.round(newMonthlyRate)
        };
      });

      setPartnerScreens(prev => ({
        ...prev,
        [editingMargin.partnerId]: updatedScreens
      }));
    }

    // Create activity log for margin change
    const marginActivity: Activity = {
      id: `activity-${Date.now()}`,
      partnerId: editingMargin.partnerId,
      type: 'note',
      title: 'Margen actualizado',
      description: `Márgenes actualizados - Marketplace: ${editingMargin.currentMargin}% → ${editingMargin.newMargin}%, Programmatic: ${editingMargin.currentProgrammaticMargin}% → ${editingMargin.newProgrammaticMargin}%. Precios de ${partnerScreensData?.length || 0} pantallas actualizados automáticamente usando la fórmula: costo/(1-margen%).`,
      priority: 'medium',
      status: 'completed',
      assignedTo: 'Admin',
      createdBy: 'Admin',
      createdAt: new Date()
    };

    setActivities(prev => [marginActivity, ...prev]);

    setIsEditMarginModalOpen(false);
    setEditingMargin({ 
      partnerId: '', 
      currentMargin: 0, 
      newMargin: 0,
      currentProgrammaticMargin: 0,
      newProgrammaticMargin: 0,
      marginType: 'marketplace'
    });
    
    toast.success(`Márgenes actualizados - Marketplace: ${editingMargin.newMargin}%, Programmatic: ${editingMargin.newProgrammaticMargin}%. Precios de ${partnerScreensData?.length || 0} pantallas actualizados.`);
  };

  const calculatePriceWithMargin = (baseCost: number, marginPercent: number) => {
    const marginDecimal = marginPercent / 100;
    return baseCost / (1 - marginDecimal);
  };

  // Helper functions
  const formatCurrencyComplete = (amount: number, partner?: Partner) => {
    const currency = partner?.currency || 'COP';
    const symbol = partner?.currencySymbol || '$';
    const formattedAmount = Math.round(amount).toLocaleString('es-CO') || Math.round(amount).toString();
    return `${symbol}${formattedAmount} ${currency}`;
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return { text: 'Excelente', color: 'text-green-600 bg-green-100' };
    if (score >= 60) return { text: 'Bueno', color: 'text-yellow-600 bg-yellow-100' };
    if (score >= 40) return { text: 'Regular', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Crítico', color: 'text-red-600 bg-red-100' };
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'gold': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'silver': return <Award className="w-4 h-4 text-gray-600" />;
      case 'bronze': return <Award className="w-4 h-4 text-orange-600" />;
      default: return <Award className="w-4 h-4 text-gray-400" />;
    }
  };

  // Smart Search Functions
  const performSmartSearch = (query: string): SmartSearchResult[] => {
    if (!query || query.length < 2) {
      setIsSmartSearchActive(false);
      return [];
    }

    setIsSmartSearchActive(true);
    const results: SmartSearchResult[] = [];
    const queryLower = query.toLowerCase();

    partners.forEach(partner => {
      let relevanceScore = 0;
      const matches: SmartSearchResult[] = [];

      // Name matching (highest priority)
      if (partner.name.toLowerCase().includes(queryLower)) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 100,
          matchType: 'name',
          matchedText: partner.name,
          context: `Partner: ${partner.name}`
        });
        relevanceScore += 100;
      }

      // Email matching
      if (partner.email.toLowerCase().includes(queryLower)) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 90,
          matchType: 'email',
          matchedText: partner.email,
          context: `Email: ${partner.email}`
        });
        relevanceScore += 90;
      }

      // Company matching
      if (partner.accountManager.toLowerCase().includes(queryLower)) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 85,
          matchType: 'company',
          matchedText: partner.accountManager,
          context: `Account Manager: ${partner.accountManager}`
        });
        relevanceScore += 85;
      }

      // Phone matching
      if (partner.phone.includes(query)) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 80,
          matchType: 'phone',
          matchedText: partner.phone,
          context: `Teléfono: ${partner.phone}`
        });
        relevanceScore += 80;
      }

      // Location matching
      if (partner.address.toLowerCase().includes(queryLower)) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 70,
          matchType: 'location',
          matchedText: partner.address,
          context: `Ubicación: ${partner.address}`
        });
        relevanceScore += 70;
      }

      // Tier matching
      if (partner.tier.toLowerCase().includes(queryLower)) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 75,
          matchType: 'tier',
          matchedText: partner.tier,
          context: `Tier: ${partner.tier.toUpperCase()}`
        });
        relevanceScore += 75;
      }

      // CMS Type matching
      if (partner.cmsType.toLowerCase().includes(queryLower)) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 65,
          matchType: 'cms_type',
          matchedText: partner.cmsType,
          context: `CMS: ${partner.cmsType}`
        });
        relevanceScore += 65;
      }

      // Behavioral pattern matching (ML-like)
      const behaviorKeywords = {
        'alto_valor': ['alto', 'valor', 'premium', 'gold', 'platinum'],
        'crecimiento': ['crecimiento', 'expansión', 'escalando', 'growing'],
        'riesgo': ['riesgo', 'churn', 'crítico', 'problema'],
        'nuevo': ['nuevo', 'reciente', 'onboarding'],
        'estable': ['estable', 'consolidado', 'maduro', 'establecido'],
        'revenue': ['revenue', 'ingresos', 'mrr', 'facturación']
      };

      Object.entries(behaviorKeywords).forEach(([pattern, keywords]) => {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
          let behaviorMatch = false;
          let behaviorContext = '';

          switch (pattern) {
            case 'alto_valor':
              if (partner.mrr > 2000000 || partner.tier === 'gold' || partner.tier === 'platinum') {
                behaviorMatch = true;
                behaviorContext = `Alto valor - MRR: ${formatCurrency(partner.mrr)}`;
              }
              break;
            case 'crecimiento':
              if (partner.financialMetrics.monthlyGrowth > 10) {
                behaviorMatch = true;
                behaviorContext = `Crecimiento alto - ${partner.financialMetrics.monthlyGrowth}% mensual`;
              }
              break;
            case 'riesgo':
              if (partner.churnRisk === 'high' || partner.churnRisk === 'critical') {
                behaviorMatch = true;
                behaviorContext = `Riesgo ${partner.churnRisk} - Health Score: ${partner.healthScore}`;
              }
              break;
            case 'nuevo':
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              if (partner.joinDate > threeMonthsAgo) {
                behaviorMatch = true;
                behaviorContext = `Partner nuevo - Registro: ${partner.joinDate.toLocaleDateString('es-CO')}`;
              }
              break;
            case 'estable':
              if (partner.healthScore > 80 && partner.churnRisk === 'low') {
                behaviorMatch = true;
                behaviorContext = `Partner estable - Health Score: ${partner.healthScore}`;
              }
              break;
            case 'revenue':
              if (partner.mrr > 1000000) {
                behaviorMatch = true;
                behaviorContext = `Revenue - MRR: ${formatCurrency(partner.mrr)}`;
              }
              break;
          }

          if (behaviorMatch) {
            matches.push({
              partnerId: partner.id,
              relevanceScore: 75,
              matchType: 'behavior',
              matchedText: pattern.replace('_', ' '),
              context: behaviorContext
            });
            relevanceScore += 75;
          }
        }
      });

      // Health Score range matching
      if (query.includes('health') || query.includes('score')) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 60,
          matchType: 'health_score',
          matchedText: `Health Score: ${partner.healthScore}`,
          context: `Health Score: ${partner.healthScore} - ${getHealthScoreColor(partner.healthScore).text}`
        });
        relevanceScore += 60;
      }

      // Financial metrics matching
      if (query.includes('mrr') || query.includes('revenue') || query.includes('ingresos')) {
        matches.push({
          partnerId: partner.id,
          relevanceScore: 70,
          matchType: 'financial',
          matchedText: `MRR: ${formatCurrency(partner.mrr)}`,
          context: `MRR mensual: ${formatCurrency(partner.mrr)} - LTV: ${formatCurrency(partner.ltv)}`
        });
        relevanceScore += 70;
      }

      // Add matches if any found
      if (matches.length > 0) {
        results.push(...matches);
      }
    });

    // Sort by relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const generateSearchSuggestions = (query: string): string[] => {
    if (!query || query.length < 1) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Add partner names
    partners.forEach(partner => {
      if (partner.name.toLowerCase().includes(queryLower)) {
        suggestions.add(partner.name);
      }
      if (partner.accountManager.toLowerCase().includes(queryLower)) {
        suggestions.add(partner.accountManager);
      }
    });

    // Add behavioral suggestions
    const behaviorSuggestions = [
      'partners alto valor',
      'partners crecimiento',
      'partners riesgo crítico',
      'partners nuevos',
      'partners estables',
      'alto MRR',
      'broadsign partners',
      'shareflow partners',
      'tier gold',
      'tier platinum',
      'health score alto',
      'health score bajo'
    ];

    behaviorSuggestions.forEach(suggestion => {
      if (suggestion.toLowerCase().includes(queryLower)) {
        suggestions.add(suggestion);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  };

  const handleSmartSearch = useCallback((query: string) => {
    startTransition(() => {
    setSearchTerm(query);
    const results = performSmartSearch(query);
    setSmartSearchResults(results);
    
    const suggestions = generateSearchSuggestions(query);
    setSearchSuggestions(suggestions);
    });
  }, []);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setChurnRiskFilter('all');
    setTierFilter('all');
    setSortBy('revenue');
    setSmartSearchResults([]);
    setSearchSuggestions([]);
    setIsSmartSearchActive(false);
    setShowAdvancedFilters(false);
    setAdvancedFilters({
      tiers: [],
      cmsTypes: [],
      healthScoreRange: null,
      mrrRange: null,
      churnRiskLevels: [],
      joinDateRange: null,
      lastActivityRange: null,
      contractTypes: []
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (churnRiskFilter !== 'all') count++;
    if (tierFilter !== 'all') count++;
    if (sortBy !== 'revenue') count++; // Count sort as active filter if not default
    if (advancedFilters.tiers.length > 0) count++;
    if (advancedFilters.cmsTypes.length > 0) count++;
    if (advancedFilters.healthScoreRange) count++;
    if (advancedFilters.mrrRange) count++;
    if (advancedFilters.churnRiskLevels.length > 0) count++;
    if (advancedFilters.joinDateRange) count++;
    if (advancedFilters.lastActivityRange) count++;
    if (advancedFilters.contractTypes.length > 0) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Redesigned Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden"
        >
          {/* Top Section - Title & Actions */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">CRM Partners</h1>
                  <p className="text-gray-600">Gestión completa de relaciones con partners</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreatePartnerModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Crear Partner</span>
                  <span className="sm:hidden">Crear</span>
                </button>
                
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  disabled={!selectedPartner}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 font-medium ${
                    selectedPartner
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva Actividad</span>
                  <span className="sm:hidden">Actividad</span>
                </button>
                
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">{partners.length} Partners Activos</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Sync: hace 2 min</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    ${((partners.reduce((sum, p) => sum + p.mrr, 0)) / 1000000).toFixed(1)}M MRR
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-gray-600">
                    Health: {Math.round(partners.reduce((sum, p) => sum + p.healthScore, 0) / partners.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Vista General
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </div>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Metrics */}
        {activeTab === 'overview' && <DashboardMetrics partners={partners} />}
        
        {/* Analytics Dashboard */}
        {activeTab === 'analytics' && <AnalyticsDashboard partners={partners} />}

        {/* Enhanced Smart Search & Filters - Only in Overview */}
        {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8"
        >
          {/* Smart Search Bar */}
          <div className="relative mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  {isSmartSearchActive && <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />}
                </div>
                <input
                  type="text"
                  placeholder="Búsqueda inteligente: nombre, email, 'partners alto valor', 'crecimiento', 'tier gold'..."
                  value={searchTerm}
                  onChange={(e) => handleSmartSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-sm">Filtros Avanzados</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
                <motion.div
                  animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
              {(searchTerm || getActiveFiltersCount() > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors px-3 py-2 hover:bg-red-50 rounded-lg"
                >
                  Limpiar Todo
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && searchTerm && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                <div className="p-2">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Sugerencias inteligentes
                  </p>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSmartSearch(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Mode Only (moved filters to advanced section) */}
          <div className="flex justify-end">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {viewModeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setViewMode(option.value as any)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                    viewMode === option.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Filtros Avanzados</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
                  </div>

                  {/* Churn Risk Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Riesgo de Churn</label>
            <select
              value={churnRiskFilter}
              onChange={(e) => setChurnRiskFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {churnRiskOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
                  </div>

                  {/* Tier Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Partner</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {tierOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
                  </div>
                </div>

                {/* Health Score Range */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de Health Score
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Min"
                        value={advancedFilters.healthScoreRange?.min || ''}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          healthScoreRange: {
                            min: Number(e.target.value) || 0,
                            max: advancedFilters.healthScoreRange?.max || 100
                          }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Max"
                        value={advancedFilters.healthScoreRange?.max || ''}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          healthScoreRange: {
                            min: advancedFilters.healthScoreRange?.min || 0,
                            max: Number(e.target.value) || 100
                          }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de MRR (millones COP)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Min"
                        value={advancedFilters.mrrRange?.min ? (advancedFilters.mrrRange.min / 1000000).toFixed(1) : ''}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          mrrRange: {
                            min: (Number(e.target.value) || 0) * 1000000,
                            max: advancedFilters.mrrRange?.max || 10000000
                          }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Max"
                        value={advancedFilters.mrrRange?.max ? (advancedFilters.mrrRange.max / 1000000).toFixed(1) : ''}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          mrrRange: {
                            min: advancedFilters.mrrRange?.min || 0,
                            max: (Number(e.target.value) || 10) * 1000000
                          }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Filter Actions */}
                <div className="mt-6 flex flex-wrap gap-2">
                <button
                    onClick={() => {
                      setChurnRiskFilter('high');
                      setTierFilter('all');
                      setSortBy('churn_risk');
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Partners en Riesgo Alto
                </button>
                  <button
                    onClick={() => {
                      setTierFilter('gold');
                      setChurnRiskFilter('all');
                      setSortBy('revenue');
                    }}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                  >
                    Partners Gold/Platinum
                  </button>
                  <button
                    onClick={() => {
                      const threeMonthsAgo = new Date();
                      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                      setSortBy('newest');
                      setStatusFilter('active');
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    Partners Nuevos
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('growth');
                      setStatusFilter('active');
                      setChurnRiskFilter('all');
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Mayor Crecimiento
                  </button>
            </div>

                {/* Clear Filters */}
                <div className="mt-6 pt-4 border-t border-blue-200 flex justify-between items-center">
                  <div className="text-sm text-blue-600">
                    Mostrando {filteredPartners.length} de {partners.length} partners
          </div>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart Search Results */}
          {isSmartSearchActive && smartSearchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Resultados inteligentes ({smartSearchResults.length})
                </span>
                <Sparkles className="w-3 h-3 text-yellow-500" />
              </div>
              <div className="space-y-2">
                {smartSearchResults.slice(0, 5).map((result, index) => {
                  const partner = partners.find(p => p.id === result.partnerId);
                  if (!partner) return null;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handlePartnerSelect(partner)}
                      className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border border-blue-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          {partner.logo ? (
                            <img src={partner.logo} alt={partner.name} className="w-6 h-6 rounded object-cover" />
                          ) : (
                            <Building className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{partner.name}</div>
                          <div className="text-xs text-gray-600">{result.context}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          result.matchType === 'name' ? 'bg-green-100 text-green-700' :
                          result.matchType === 'email' ? 'bg-blue-100 text-blue-700' :
                          result.matchType === 'behavior' ? 'bg-purple-100 text-purple-700' :
                          result.matchType === 'financial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {result.matchType}
                        </span>
                        <span className="text-xs text-gray-500">{result.relevanceScore}%</span>
                      </div>
                    </div>
                  );
                })}
                {smartSearchResults.length > 5 && (
                  <div className="text-center">
                    <span className="text-xs text-blue-600">
                      +{smartSearchResults.length - 5} resultados más
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
        )}

        {/* Main Content - Only in Overview */}
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Partners List - Now smaller */}
                <div className="xl:col-span-1">
            {viewMode === 'compact' ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900">Partners ({filteredPartners.length})</h3>
                    </div>
                <div className="divide-y divide-gray-100 max-h-[calc(100vh-400px)] overflow-y-auto">
                      {filteredPartners.map((partner) => (
                    <div
                          key={partner.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                        selectedPartner?.id === partner.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                          onClick={() => handlePartnerSelect(partner)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {partner.logo ? (
                            <img 
                              src={partner.logo} 
                              alt={`${partner.name} logo`}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <Building className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1">
                            {partner.tier === 'platinum' && <Sparkles className="w-2 h-2 text-purple-600" />}
                            {partner.tier === 'gold' && <Crown className="w-2 h-2 text-yellow-600" />}
                            {(partner.tier === 'silver' || partner.tier === 'bronze') && <Award className="w-2 h-2 text-gray-600" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{partner.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-green-600">
                              ${(partner.mrr / 1000000).toFixed(1)}M
                            </span>
                            <div className={`w-2 h-2 rounded-full ${
                              partner.churnRisk === 'low' ? 'bg-green-500' :
                              partner.churnRisk === 'medium' ? 'bg-yellow-500' :
                              partner.churnRisk === 'high' ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-blue-600">{partner.totalScreens}</div>
                          <div className="text-xs text-gray-500">screens</div>
                        </div>
                      </div>
                    </div>
                      ))}
                    </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-4">Partners ({filteredPartners.length})</h3>
                </div>
                {filteredPartners.map((partner) => (
                  <motion.div
                    key={partner.id}
                    className={`group p-4 bg-white rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-200 ${
                      selectedPartner?.id === partner.id ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handlePartnerSelect(partner)}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    {/* Compact Partner Card */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {partner.logo ? (
                          <img 
                            src={partner.logo} 
                            alt={`${partner.name} logo`}
                            className="w-10 h-10 rounded-xl object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                            <Building className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1">
                          {partner.tier === 'platinum' && <Sparkles className="w-3 h-3 text-purple-600" />}
                          {partner.tier === 'gold' && <Crown className="w-3 h-3 text-yellow-600" />}
                          {(partner.tier === 'silver' || partner.tier === 'bronze') && <Award className="w-3 h-3 text-gray-600" />}
                  </div>
                </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                          {partner.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-green-600">
                            ${(partner.mrr / 1000000).toFixed(1)}M MRR
                          </span>
                          <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            partner.churnRisk === 'low' ? 'bg-green-100 text-green-700' :
                            partner.churnRisk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            partner.churnRisk === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {partner.healthScore}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{partner.totalScreens} pantallas</span>
                          <span>{partner.conversionMetrics.conversionRate.toFixed(1)}% conv.</span>
                          {partner.recentActivity.newScreensThisWeek > 0 && (
                            <span className="text-green-600 font-medium">+{partner.recentActivity.newScreensThisWeek} new</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {filteredPartners.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200"
              >
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No se encontraron partners
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Ajusta los filtros o crea un nuevo partner
                </p>
                <Button
                  onClick={() => setIsCreatePartnerModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Crear Partner
                </Button>
              </motion.div>
            )}
          </div>

          {/* Partner Details Panel - Now much larger */}
          <div className="xl:col-span-3">
                  {selectedPartner ? (
                    <motion.div
                      key={selectedPartner.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                {/* Partner Header Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-4 mb-6">
                              {selectedPartner.logo ? (
                                <img 
                                  src={selectedPartner.logo} 
                                  alt={`${selectedPartner.name} logo`}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-200"
                                />
                              ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                                  <Building className="w-8 h-8 text-gray-500" />
                                </div>
                              )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{selectedPartner.name}</h3>
                      <p className="text-gray-600">{selectedPartner.accountManager}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedPartner.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedPartner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedPartner.status}
                        </div>
                        <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{selectedPartner.rating}</span>
                                </div>
                        {selectedPartner.tier && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            selectedPartner.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                            selectedPartner.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            selectedPartner.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {selectedPartner.tier === 'platinum' && <Sparkles className="w-3 h-3" />}
                            {selectedPartner.tier === 'gold' && <Crown className="w-3 h-3" />}
                            {(selectedPartner.tier === 'silver' || selectedPartner.tier === 'bronze') && <Award className="w-3 h-3" />}
                            {selectedPartner.tier.toUpperCase()}
                              </div>
                        )}
                            </div>
                    </div>
                    
                    {/* Quick Contact Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => window.open(`mailto:${selectedPartner.email}?subject=Contacto desde Shareflow CRM`)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                          title="Enviar correo"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${selectedPartner.phone}`)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                          title="Llamar"
                        >
                          <Phone className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const whatsappNumber = selectedPartner.phone.replace(/\D/g, '');
                            const message = encodeURIComponent(`Hola, soy del equipo de Shareflow. Te contacto por el tema de tu cuenta de partner.`);
                            window.open(`https://wa.me/${whatsappNumber}?text=${message}`);
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-gray-500">Contacto rápido</span>
                            </div>
                            </div>
                          </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CustomTooltip content="Monthly Recurring Revenue - Ingresos mensuales generados por este partner">
                      <div className="text-2xl font-bold text-green-700">
                        ${(selectedPartner.mrr / 1000000).toFixed(1)}M
                              </div>
                      </CustomTooltip>
                      <div className="text-xs text-green-600">MRR</div>
                      <CustomTooltip content={`Crecimiento mensual: ${selectedPartner.financialMetrics.monthlyGrowth > 0 ? '+' : ''}${selectedPartner.financialMetrics.monthlyGrowth.toFixed(1)}%`}>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedPartner.financialMetrics.monthlyGrowth > 0 ? '+' : ''}{selectedPartner.financialMetrics.monthlyGrowth.toFixed(1)}%
                              </div>
                      </CustomTooltip>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <CustomTooltip content="Puntuación de salud basada en compliance, respuesta, calidad y crecimiento">
                      <div className="text-2xl font-bold text-blue-700">
                        {selectedPartner.healthScore}
                      </div>
                      </CustomTooltip>
                      <div className="text-xs text-blue-600">Health Score</div>
                      <CustomTooltip content={`Nivel de riesgo de churn: ${selectedPartner.churnRisk}`}>
                      <div className={`text-xs mt-1 ${
                        selectedPartner.churnRisk === 'low' ? 'text-green-600' :
                        selectedPartner.churnRisk === 'medium' ? 'text-yellow-600' :
                        selectedPartner.churnRisk === 'high' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {selectedPartner.churnRisk} risk
                      </div>
                      </CustomTooltip>
                              </div>
                            </div>
                            
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-700">{selectedPartner.totalScreens}</div>
                      <div className="text-xs text-purple-600">Pantallas</div>
                              </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-700">
                        {selectedPartner.conversionMetrics.conversionRate.toFixed(1)}%
                              </div>
                      <div className="text-xs text-orange-600">Conversión</div>
                              </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <div className="text-lg font-bold text-emerald-700">
                        ${(selectedPartner.ltv / 1000000).toFixed(1)}M
                            </div>
                      <div className="text-xs text-emerald-600">LTV</div>
                          </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedPartner.email}</span>
                        </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => window.open(`mailto:${selectedPartner.email}?subject=Contacto desde Shareflow CRM`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Enviar correo"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedPartner.phone}</span>
                    </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => window.open(`tel:${selectedPartner.phone}`)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Llamar"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const whatsappNumber = selectedPartner.phone.replace(/\D/g, '');
                            const message = encodeURIComponent(`Hola, soy del equipo de Shareflow. Te contacto por el tema de tu cuenta de partner.`);
                            window.open(`https://wa.me/${whatsappNumber}?text=${message}`);
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedPartner.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Cliente desde {selectedPartner.joinDate.toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Evolución MRR
                  </h4>
                  <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { mes: 'Ene', mrr: selectedPartner.mrr * 0.7, screens: selectedPartner.totalScreens - 8 },
                        { mes: 'Feb', mrr: selectedPartner.mrr * 0.8, screens: selectedPartner.totalScreens - 6 },
                        { mes: 'Mar', mrr: selectedPartner.mrr * 0.85, screens: selectedPartner.totalScreens - 4 },
                        { mes: 'Abr', mrr: selectedPartner.mrr * 0.92, screens: selectedPartner.totalScreens - 2 },
                        { mes: 'May', mrr: selectedPartner.mrr * 0.96, screens: selectedPartner.totalScreens - 1 },
                        { mes: 'Jun', mrr: selectedPartner.mrr, screens: selectedPartner.totalScreens }
                      ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="mes" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                                <Tooltip 
                          formatter={(value, name) => [
                            name === 'mrr' ? `$${(Number(value)/1000000).toFixed(2)}M` : value,
                            name === 'mrr' ? 'MRR' : 'Pantallas'
                          ]}
                        />
                        <Area 
                                  type="monotone" 
                          dataKey="mrr" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                            </ResponsiveContainer>
                  </div>
                          </div>
                          
                {/* Health Score Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Análisis Health Score
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(selectedPartner.relationshipHealth.factors).map(([factor, score]) => (
                      <div key={factor} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{score}</span>
                            </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              score >= 90 ? 'bg-green-500' :
                              score >= 75 ? 'bg-blue-500' :
                              score >= 60 ? 'bg-yellow-500' :
                              score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                            </div>
                            </div>
                    ))}
                          </div>
                        </div>

                {/* Financial Metrics */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Métricas Financieras
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">LTV Total</span>
                          <CustomTooltip 
                            content="Lifetime Value - Valor total estimado que generará este partner durante toda su relación comercial con Shareflow"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrencyComplete(selectedPartner.ltv, selectedPartner)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Net Revenue Shareflow</span>
                          <CustomTooltip 
                            content="Ingresos netos que retiene Shareflow después de pagar la comisión al partner según el margen acordado"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-blue-600">
                          {formatCurrencyComplete((selectedPartner.mrr * (selectedPartner.customMargin || selectedPartner.grossMargin)) / 100, selectedPartner)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Margen Marketplace</span>
                          <CustomTooltip 
                            content="Porcentaje de ganancia de Shareflow para compras tradicionales en Marketplace y SportsEvents"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-600">
                            {(selectedPartner.customMargin || selectedPartner.grossMargin).toFixed(1)}%
                        </span>
                          <button
                            onClick={() => handleEditMargin(selectedPartner)}
                            className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Editar márgenes y actualizar precios de pantallas"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Margen Programmatic</span>
                          <CustomTooltip 
                            content="Porcentaje de ganancia preferencial para SmartCampaigns y Programmatic Advertising"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-green-600">
                          {(selectedPartner.programmaticMargin || selectedPartner.customMargin || selectedPartner.grossMargin).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Crecimiento</span>
                          <CustomTooltip 
                            content="Porcentaje de crecimiento mensual en revenue generado por este partner"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className={`font-bold ${
                          selectedPartner.financialMetrics.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedPartner.financialMetrics.monthlyGrowth > 0 ? '+' : ''}
                          {selectedPartner.financialMetrics.monthlyGrowth.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Compliance</span>
                          <CustomTooltip 
                            content="Porcentaje de cumplimiento en pagos y términos contractuales por parte del partner"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-indigo-600">
                          {selectedPartner.financialMetrics.paymentCompliance}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Early Payment</span>
                          <CustomTooltip 
                            content="Indica si el partner está inscrito en el programa de descuento por pago anticipado"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className={`font-bold ${
                          selectedPartner.financialMetrics.earlyPaymentDiscount ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {selectedPartner.financialMetrics.earlyPaymentDiscount ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Net Revenue Breakdown for Shareflow */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Análisis de Revenue para Shareflow
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-gray-600">Revenue Total Generado:</span>
                          <CustomTooltip 
                            content="Ingresos brutos totales generados por este partner en el período"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <div className="font-bold text-blue-800">{formatCurrencyComplete(selectedPartner.mrr, selectedPartner)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-gray-600">Costo Pagado al Partner:</span>
                          <CustomTooltip 
                            content="Monto que se paga al partner después de aplicar el margen de Shareflow"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <div className="font-bold text-gray-700">
                          {formatCurrencyComplete((selectedPartner.mrr * (100 - (selectedPartner.customMargin || selectedPartner.grossMargin))) / 100, selectedPartner)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-gray-600">Net Revenue Shareflow:</span>
                          <CustomTooltip 
                            content="Ganancia neta de Shareflow después de todos los costos y comisiones"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <div className="font-bold text-green-700">
                          {formatCurrencyComplete((selectedPartner.mrr * (selectedPartner.customMargin || selectedPartner.grossMargin)) / 100, selectedPartner)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-gray-600">Margen Efectivo:</span>
                          <CustomTooltip 
                            content="Porcentaje de margen aplicado actualmente a este partner"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <div className="font-bold text-purple-700">
                          {(selectedPartner.customMargin || selectedPartner.grossMargin).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedPartner.earlyPaymentDiscount.enabled && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-800">
                        <strong>Descuento por pago anticipado:</strong> {selectedPartner.earlyPaymentDiscount.percentage}%
                        <br />
                        <span className="text-green-600">
                          Ahorro total: {formatCurrencyComplete(selectedPartner.earlyPaymentDiscount.totalSavings, selectedPartner)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conversion & Engagement */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Conversión & Engagement
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-700">
                          {selectedPartner.conversionMetrics.marketplaceViews.toLocaleString()}
                        </div>
                        <div className="text-xs text-purple-600">Vistas Marketplace</div>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-xl font-bold text-indigo-700">
                          {selectedPartner.conversionMetrics.marketplacePurchases}
                        </div>
                        <div className="text-xs text-indigo-600">Compras</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Tasa de conversión</span>
                          <CustomTooltip 
                            content="Porcentaje de visitantes que realizan una compra en las pantallas de este partner"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-purple-600">
                          {selectedPartner.conversionMetrics.conversionRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">AOV (Valor promedio)</span>
                          <CustomTooltip 
                            content="Average Order Value - Valor promedio de cada compra realizada en las pantallas de este partner"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrencyComplete(selectedPartner.conversionMetrics.aov, selectedPartner)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Login frecuencia</span>
                          <CustomTooltip 
                            content="Promedio de días por mes que el partner accede a la plataforma"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-blue-600">
                          {selectedPartner.engagementMetrics.loginFrequency} días/mes
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Utilización pantallas</span>
                          <CustomTooltip 
                            content="Porcentaje de tiempo que las pantallas del partner están mostrando contenido pagado"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <span className="font-bold text-orange-600">
                          {selectedPartner.engagementMetrics.screenUtilization}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Satisfacción</span>
                          <CustomTooltip 
                            content="Calificación promedio de satisfacción del partner basada en encuestas y feedback"
                            position="top"
                          >
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          </CustomTooltip>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-yellow-600">
                            {selectedPartner.engagementMetrics.satisfactionScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CMS Integration Status */}
                {selectedPartner.cmsConfig && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      Integración CMS
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Proveedor</span>
                        <span className="font-bold text-gray-900">{selectedPartner.cmsConfig.provider}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estado</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedPartner.cmsConfig.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                          selectedPartner.cmsConfig.connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedPartner.cmsConfig.connectionStatus}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pantallas importadas</span>
                        <span className="font-bold text-blue-600">{selectedPartner.cmsConfig.screensImported}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Salud integración</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedPartner.cmsConfig.integrationHealth === 'excellent' ? 'bg-green-100 text-green-800' :
                          selectedPartner.cmsConfig.integrationHealth === 'good' ? 'bg-blue-100 text-blue-800' :
                          selectedPartner.cmsConfig.integrationHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedPartner.cmsConfig.integrationHealth}
                        </div>
                      </div>
                      {selectedPartner.cmsConfig.lastSync && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Última sincronización</span>
                          <span className="text-sm text-gray-900">
                            {selectedPartner.cmsConfig.lastSync.toLocaleString('es-ES')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Screen Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    Actividad Pantallas
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-700">
                        +{selectedPartner.recentActivity.newScreensThisWeek}
                      </div>
                      <div className="text-xs text-orange-600">Esta semana</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-700">
                        +{selectedPartner.recentActivity.newScreensThisMonth}
                      </div>
                      <div className="text-xs text-amber-600">Este mes</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    {selectedPartner.recentActivity.lastScreenAdded && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Última pantalla agregada</span>
                        <span className="font-medium text-gray-900">
                          {selectedPartner.recentActivity.lastScreenAdded.toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {selectedPartner.recentActivity.lastContentUpdate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Última actualización contenido</span>
                        <span className="font-medium text-gray-900">
                          {selectedPartner.recentActivity.lastContentUpdate.toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {selectedPartner.recentActivity.lastPaymentReceived && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Último pago recibido</span>
                        <span className="font-medium text-gray-900">
                          {selectedPartner.recentActivity.lastPaymentReceived.toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Actividades Recientes</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Plus}
                      onClick={() => setIsActivityModalOpen(true)}
                    >
                      Agregar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {partnerActivities.length > 0 ? (
                      partnerActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'call' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                            activity.type === 'email' ? 'bg-green-100 text-green-600' :
                            activity.type === 'screen_added' ? 'bg-orange-100 text-orange-600' :
                            activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type === 'call' && <PhoneCall className="w-4 h-4" />}
                            {activity.type === 'meeting' && <Users className="w-4 h-4" />}
                            {activity.type === 'email' && <Mail className="w-4 h-4" />}
                            {activity.type === 'screen_added' && <Monitor className="w-4 h-4" />}
                            {activity.type === 'payment' && <DollarSign className="w-4 h-4" />}
                            {activity.type === 'note' && <FileText className="w-4 h-4" />}
                            {activity.type === 'task' && <CheckCircle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm">{activity.title}</h5>
                            <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {activity.createdAt.toLocaleDateString('es-ES')}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                activity.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                activity.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {activity.priority}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                                activity.status === 'pending' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No hay actividades recientes</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsActivityModalOpen(true)}
                          className="mt-3"
                        >
                          Crear primera actividad
                        </Button>
                      </div>
                    )}
                    </div>
                </div>

                {/* Payments & Billing Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-green-600" />
                      Pagos y Facturación
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        {showPaymentHistory ? 'Ocultar' : 'Ver'} Historial Completo
                      </button>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <CustomTooltip content="Total de ingresos generados para este partner este mes">
                          <span className="text-sm font-medium text-green-700">Revenue del Mes</span>
                        </CustomTooltip>
                      </div>
                      <div className="text-2xl font-bold text-green-800">
                        ${((partnerRevenue[selectedPartner.id]?.reduce((sum, r) => sum + r.totalRevenue, 0) || 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-green-600">
                        {partnerRevenue[selectedPartner.id]?.reduce((sum, r) => sum + r.playsConsumed, 0) || 0} plays consumidos
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <CustomTooltip content="Próximo pago programado para este partner">
                          <span className="text-sm font-medium text-blue-700">Próximo Pago</span>
                        </CustomTooltip>
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        ${((partnerPayments[selectedPartner.id]?.find(p => p.status === 'scheduled')?.amount || 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-blue-600">
                        {partnerPayments[selectedPartner.id]?.find(p => p.status === 'scheduled')?.scheduledDate && 
                         new Date(partnerPayments[selectedPartner.id]?.find(p => p.status === 'scheduled')?.scheduledDate || '').toLocaleDateString('es-ES')}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="w-4 h-4 text-purple-600" />
                        <CustomTooltip content="Número de campañas que han generado revenue este mes">
                          <span className="text-sm font-medium text-purple-700">Campañas Activas</span>
                        </CustomTooltip>
                      </div>
                      <div className="text-2xl font-bold text-purple-800">
                        {partnerCampaigns[selectedPartner.id]?.filter(c => c.status === 'active').length || 0}
                      </div>
                      <div className="text-xs text-purple-600">
                        {partnerCampaigns[selectedPartner.id]?.length || 0} total este período
                      </div>
                    </div>
                  </div>

                  {/* Recent Payments */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900">Pagos Recientes</h5>
                    {(partnerPayments[selectedPartner.id] || []).slice(0, showPaymentHistory ? 10 : 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            payment.status === 'paid' ? 'bg-green-100' :
                            payment.status === 'scheduled' ? 'bg-blue-100' :
                            payment.status === 'processing' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            {payment.status === 'paid' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {payment.status === 'scheduled' && <Calendar className="w-5 h-5 text-blue-600" />}
                            {payment.status === 'processing' && <Clock className="w-5 h-5 text-yellow-600" />}
                            {payment.status === 'failed' && <X className="w-5 h-5 text-red-600" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              ${(payment.amount / 1000000).toFixed(1)}M COP
                            </div>
                            <div className="text-sm text-gray-600">{payment.period}</div>
                            <div className="text-xs text-gray-500">
                              {payment.screens.length} pantalla{payment.screens.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            payment.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status === 'paid' ? 'Pagado' :
                             payment.status === 'scheduled' ? 'Programado' :
                             payment.status === 'processing' ? 'Procesando' :
                             'Fallido'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(payment.scheduledDate).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                    ))}

                    {showPaymentHistory && (
                      <div className="mt-6">
                        <h5 className="font-semibold text-gray-900 mb-4">Historial de Campañas que Generaron Revenue</h5>
                        <div className="space-y-3">
                          {(partnerCampaigns[selectedPartner.id] || []).map((campaign) => (
                            <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Play className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{campaign.campaignId}</div>
                                  <div className="text-gray-600">{campaign.userName}</div>
                                  <div className="text-xs text-gray-500">{campaign.screenName}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-green-600">
                                  ${campaign.partnerRevenue.toLocaleString()} COP
                                </div>
                                <div className="text-xs text-gray-500">
                                  {campaign.spotsOrPlays} {campaign.packageType === 'moments' ? 'plays' : 'spots'}
                                </div>
                                <div className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                                  campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                  campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {campaign.status === 'active' ? 'Activa' :
                                   campaign.status === 'completed' ? 'Completada' : 'Cancelada'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!partnerPayments[selectedPartner.id] || partnerPayments[selectedPartner.id].length === 0) && (
                      <div className="text-center py-8">
                        <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No hay pagos registrados para este partner</p>
                      </div>
                    )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Contactos del Equipo</h4>
                  <div className="space-y-3">
                    {selectedPartner.contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{contact.name}</h5>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-xs text-gray-500">{contact.phone}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              contact.role === 'partner_owner' ? 'bg-purple-100 text-purple-600' :
                              contact.role === 'partner_admin' ? 'bg-blue-100 text-blue-600' :
                              contact.role === 'partner_financial' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {contact.role === 'partner_owner' ? 'Owner' :
                               contact.role === 'partner_admin' ? 'Admin' :
                               contact.role === 'partner_financial' ? 'Financial' : 'User'}
                            </span>
                            {contact.isPrimary && (
                              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                                Primario
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Contact Actions */}
                        <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            {/* Email Contact */}
                            <button
                              onClick={() => window.open(`mailto:${contact.email}?subject=Contacto desde Shareflow CRM - ${selectedPartner.name}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Enviar correo"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            
                            {/* Phone Contact */}
                            {contact.phone && (
                              <>
                                <button
                                  onClick={() => window.open(`tel:${contact.phone}`)}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Llamar"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                                
                                {/* WhatsApp Contact */}
                                <button
                                  onClick={() => {
                                    const whatsappNumber = contact.phone?.replace(/\D/g, '') || '';
                                    const message = encodeURIComponent(`Hola ${contact.name}, soy del equipo de Shareflow. Te contacto respecto a la cuenta de ${selectedPartner.name}.`);
                                    window.open(`https://wa.me/${whatsappNumber}?text=${message}`);
                                  }}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                          
                          {/* Communication Preference Indicator */}
                          <div className="flex justify-center">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              contact.communicationPreference === 'email' ? 'bg-blue-400' :
                              contact.communicationPreference === 'phone' ? 'bg-green-400' :
                              contact.communicationPreference === 'whatsapp' ? 'bg-green-500' :
                              contact.communicationPreference === 'teams' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`} title={`Prefiere: ${contact.communicationPreference}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Screen Inventory & Health */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      Inventario de Pantallas ({selectedPartner.totalScreens})
                    </h4>
                    <div className="flex items-center gap-2">
                      <CustomTooltip content="Estado general de conectividad del inventario">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-blue-700 font-medium">
                            {Math.round((partnerScreens[selectedPartner.id]?.filter(s => s.connectionStatus === 'connected').length || 0) / selectedPartner.totalScreens * 100)}% Online
                          </span>
                        </div>
                      </CustomTooltip>
                    </div>
                  </div>

                  {/* Inventory Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi className="w-4 h-4 text-green-600" />
                        <CustomTooltip content="Pantallas conectadas y funcionando correctamente">
                          <span className="text-sm font-medium text-green-700">Conectadas</span>
                        </CustomTooltip>
                      </div>
                      <div className="text-2xl font-bold text-green-800">
                        {partnerScreens[selectedPartner.id]?.filter(s => s.connectionStatus === 'connected').length || 0}
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <WifiOff className="w-4 h-4 text-red-600" />
                        <CustomTooltip content="Pantallas con problemas de conexión o errores">
                          <span className="text-sm font-medium text-red-700">Con Errores</span>
                        </CustomTooltip>
                      </div>
                      <div className="text-2xl font-bold text-red-800">
                        {partnerScreens[selectedPartner.id]?.filter(s => s.connectionStatus === 'error').length || 0}
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <CustomTooltip content="Pantallas en mantenimiento o configuración">
                          <span className="text-sm font-medium text-yellow-700">Mantenimiento</span>
                        </CustomTooltip>
                      </div>
                      <div className="text-2xl font-bold text-yellow-800">
                        {partnerScreens[selectedPartner.id]?.filter(s => s.status === 'maintenance').length || 0}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <CustomTooltip content="Promedio de uptime de todas las pantallas">
                          <span className="text-sm font-medium text-blue-700">Uptime Promedio</span>
                        </CustomTooltip>
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        {partnerScreens[selectedPartner.id] ? 
                          Math.round(partnerScreens[selectedPartner.id].reduce((sum, s) => sum + s.uptime, 0) / partnerScreens[selectedPartner.id].length) 
                          : 0}%
                      </div>
                    </div>
                  </div>

                  {/* Screens List */}
                  <div className="space-y-4">
                    {(partnerScreens[selectedPartner.id] || []).map((screen) => (
                      <div key={screen.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {/* Screen Icon & Status */}
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              screen.environment === 'outdoor' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              <Monitor className={`w-6 h-6 ${
                                screen.environment === 'outdoor' ? 'text-blue-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              screen.connectionStatus === 'connected' ? 'bg-green-500' :
                              screen.connectionStatus === 'error' ? 'bg-red-500' :
                              screen.connectionStatus === 'disconnected' ? 'bg-gray-500' :
                              'bg-yellow-500'
                            }`} />
                          </div>

                          {/* Screen Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-semibold text-gray-900">{screen.name}</h5>
                                <p className="text-sm text-gray-600">{screen.location}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <CustomTooltip content={`Pantalla ${screen.environment === 'outdoor' ? 'exterior' : 'interior'}`}>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      screen.environment === 'outdoor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                      {screen.environment === 'outdoor' ? 'Exterior' : 'Interior'}
                                    </span>
                                  </CustomTooltip>
                                  
                                  <CustomTooltip content={`Tipo de conexión: ${
                                    screen.connectionType === 'shareflow-screen' ? 'Shareflow Screen' :
                                    screen.connectionType === 'broadsign' ? 'Broadsign' :
                                    screen.connectionType === 'latinad' ? 'Latinad' :
                                    screen.connectionType === 'api' ? 'API Custom' : 'Manual'
                                  }`}>
                                    <div className="flex items-center gap-1">
                                      {screen.connectionType === 'shareflow-screen' && <Database className="w-3 h-3 text-blue-500" />}
                                      {screen.connectionType === 'broadsign' && <Cloud className="w-3 h-3 text-purple-500" />}
                                      {screen.connectionType === 'latinad' && <Server className="w-3 h-3 text-orange-500" />}
                                      {screen.connectionType === 'api' && <Cpu className="w-3 h-3 text-green-500" />}
                                      {screen.connectionType === 'manual' && <Settings className="w-3 h-3 text-gray-500" />}
                                      <span className="text-xs text-gray-600">
                                        {screen.connectionType === 'shareflow-screen' ? 'Shareflow' :
                                         screen.connectionType === 'broadsign' ? 'Broadsign' :
                                         screen.connectionType === 'latinad' ? 'Latinad' :
                                         screen.connectionType === 'api' ? 'API' : 'Manual'}
                                      </span>
                                    </div>
                                  </CustomTooltip>

                                  <span className="text-xs text-gray-500">{screen.size}</span>
                                </div>
                              </div>

                              {/* Health Score & Metrics */}
                              <div className="text-right">
                                <CustomTooltip content={`Health Score basado en uptime, errores y última sincronización`}>
                                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                    screen.healthScore >= 90 ? 'bg-green-100 text-green-800' :
                                    screen.healthScore >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                    screen.healthScore >= 50 ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    <Heart className="w-3 h-3" />
                                    {screen.healthScore}
                                  </div>
                                </CustomTooltip>
                                
                                <div className="mt-2 space-y-1">
                                  <CustomTooltip content={`Tiempo activo: ${screen.uptime}%`}>
                                    <div className="text-xs text-gray-600">
                                      Uptime: {screen.uptime}%
                                    </div>
                                  </CustomTooltip>
                                  
                                  {screen.lastSync && (
                                    <CustomTooltip content={`Última sincronización: ${screen.lastSync.toLocaleString('es-ES')}`}>
                                      <div className="text-xs text-gray-500">
                                        Sync: {screen.lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </CustomTooltip>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Technical Details */}
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                              <CustomTooltip content={`Resolución de pantalla: ${screen.resolution}`}>
                                <div>
                                  <div className="text-xs text-gray-500">Resolución</div>
                                  <div className="text-sm font-medium text-gray-900">{screen.resolution}</div>
                                </div>
                              </CustomTooltip>

                              <CustomTooltip content={`Brillo máximo: ${screen.specs.brightness}`}>
                                <div>
                                  <div className="text-xs text-gray-500">Brillo</div>
                                  <div className="text-sm font-medium text-gray-900">{screen.specs.brightness}</div>
                                </div>
                              </CustomTooltip>

                              <CustomTooltip content={`Audiencia estimada diaria: ${screen.audience.toLocaleString()} personas`}>
                                <div>
                                  <div className="text-xs text-gray-500">Audiencia</div>
                                  <div className="text-sm font-medium text-gray-900">{(screen.audience / 1000).toFixed(0)}K</div>
                                </div>
                              </CustomTooltip>

                              <CustomTooltip content={`Tarifa mensual: $${(screen.monthlyRate / 1000000).toFixed(1)}M COP`}>
                                <div>
                                  <div className="text-xs text-gray-500">Tarifa/mes</div>
                                  <div className="text-sm font-medium text-green-600">${(screen.monthlyRate / 1000000).toFixed(1)}M</div>
                                </div>
                              </CustomTooltip>
                            </div>

                            {/* Status Indicators */}
                            {(screen.telemetry.errorCount > 0 || screen.telemetry.warningCount > 0) && (
                              <div className="mt-3 flex items-center gap-2">
                                {screen.telemetry.errorCount > 0 && (
                                  <CustomTooltip content={`${screen.telemetry.errorCount} errores detectados`}>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                                      <AlertCircle className="w-3 h-3" />
                                      {screen.telemetry.errorCount} errores
                                    </div>
                                  </CustomTooltip>
                                )}
                                
                                {screen.telemetry.warningCount > 0 && (
                                  <CustomTooltip content={`${screen.telemetry.warningCount} advertencias`}>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs">
                                      <AlertTriangle className="w-3 h-3" />
                                      {screen.telemetry.warningCount} advertencias
                                    </div>
                                  </CustomTooltip>
                                )}

                                {screen.telemetry.temperature && (
                                  <CustomTooltip content={`Temperatura actual: ${screen.telemetry.temperature}°C`}>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                                      screen.telemetry.temperature > 50 ? 'bg-red-100 text-red-700' :
                                      screen.telemetry.temperature > 40 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      <Zap className="w-3 h-3" />
                                      {screen.telemetry.temperature}°C
                                    </div>
                                  </CustomTooltip>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(!partnerScreens[selectedPartner.id] || partnerScreens[selectedPartner.id].length === 0) && (
                    <div className="text-center py-8">
                      <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No hay pantallas registradas para este partner</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Selecciona un Partner
                </h3>
                <p className="text-gray-600">
                  Elige un partner de la lista para ver detalles completos, métricas y gestionar actividades
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {/* Create Partner Modal */}
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
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <h2 className="text-2xl font-bold">Crear Nuevo Partner</h2>
                  <p className="text-blue-100">Registra un nuevo partner en la plataforma</p>
              </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Contacto *
                      </label>
                      <input
                        type="text"
                        value={createPartnerData.name}
                        onChange={(e) => setCreatePartnerData({...createPartnerData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: +57 300 123 4567"
                      />
                    </div>

                  </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
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
                      {isCreatingPartner ? 'Creando...' : 'Crear Partner'}
                    </Button>
                  </div>
              </div>
              </motion.div>
            </motion.div>
          )}

          {/* Activity Modal */}
          {isActivityModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setIsActivityModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                  <h2 className="text-2xl font-bold">Nueva Actividad</h2>
                  <p className="text-purple-100">
                    Agregar actividad para {selectedPartner?.name}
                  </p>
              </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Actividad
                      </label>
                      <select
                        value={newActivity.type}
                        onChange={(e) => setNewActivity({...newActivity, type: e.target.value as Activity['type']})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="note">Nota</option>
                        <option value="call">Llamada</option>
                        <option value="meeting">Reunión</option>
                        <option value="email">Email</option>
                        <option value="task">Tarea</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título *
                      </label>
                      <input
                        type="text"
                        value={newActivity.title}
                        onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej: Reunión de seguimiento Q2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción *
                      </label>
                      <textarea
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Describe los detalles de la actividad..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prioridad
                        </label>
                        <select
                          value={newActivity.priority}
                          onChange={(e) => setNewActivity({...newActivity, priority: e.target.value as Activity['priority']})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha límite
                        </label>
                        <input
                          type="date"
                          value={newActivity.dueDate}
                          onChange={(e) => setNewActivity({...newActivity, dueDate: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asignado a
                      </label>
                      <input
                        type="text"
                        value={newActivity.assignedTo}
                        onChange={(e) => setNewActivity({...newActivity, assignedTo: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Nombre del responsable"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsActivityModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAddActivity}
                      disabled={!newActivity.title || !newActivity.description}
                    >
                      Crear Actividad
                    </Button>
                  </div>
              </div>
              </motion.div>
            </motion.div>
          )}

          {/* Edit Margin Modal */}
          {isEditMarginModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setIsEditMarginModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                  <h2 className="text-2xl font-bold">Editar Márgenes del Partner</h2>
                  <p className="text-green-100">
                    Configurar márgenes diferenciados para Marketplace y Programmatic
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {/* Current Margins Display */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <div className="text-sm text-purple-600 mb-1">Margen Marketplace</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {editingMargin.currentMargin.toFixed(1)}%
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                          Compras tradicionales
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="text-sm text-green-600 mb-1">Margen Programmatic</div>
                        <div className="text-2xl font-bold text-green-900">
                          {editingMargin.currentProgrammaticMargin.toFixed(1)}%
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          SmartCampaigns
                        </div>
                      </div>
                    </div>

                    {/* New Margin Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nuevo Margen Marketplace (%) *
                        </label>
                        <input
                          type="number"
                          value={editingMargin.newMargin}
                          onChange={(e) => setEditingMargin({
                            ...editingMargin,
                            newMargin: parseFloat(e.target.value) || 0
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ej: 30.0"
                          step="0.1"
                          min="0"
                          max="99"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Para compras directas en Marketplace
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nuevo Margen Programmatic (%) *
                        </label>
                        <input
                          type="number"
                          value={editingMargin.newProgrammaticMargin}
                          onChange={(e) => setEditingMargin({
                            ...editingMargin,
                            newProgrammaticMargin: parseFloat(e.target.value) || 0
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ej: 25.0"
                          step="0.1"
                          min="0"
                          max="99"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Para SmartCampaigns (preferencial)
                        </p>
                      </div>
                    </div>

                    {/* Formula Explanation */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-blue-900 mb-1">
                            Cómo Funciona el Margen
                          </div>
                          <div className="text-sm text-blue-700 space-y-1">
                            <div><strong>• Partner recibe:</strong> Su costo base configurado</div>
                            <div><strong>• Shareflow cobra:</strong> Precio con margen aplicado</div>
                            <div><strong>• Fórmula:</strong> Precio Final = Costo Base ÷ (1 - Margen%)</div>
                          </div>
                          <div className="text-xs text-blue-600 mt-2">
                            El partner siempre recibe su costo fijo, Shareflow se queda con la diferencia
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Preview Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-start gap-3 mb-4">
                        <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-blue-900 mb-1">
                            Vista Previa de Precios
                          </div>
                          <div className="text-xs text-blue-700">
                            Ejemplo con pantalla de referencia
                          </div>
                        </div>
                      </div>
                      
                      {/* Sample Screen Price Calculation */}
                      {(() => {
                        const sampleScreen = partnerScreens[editingMargin.partnerId]?.[0];
                        if (!sampleScreen) return null;
                        
                        // Calculate base cost from current price
                        const currentMarginDecimal = editingMargin.currentMargin / 100;
                        const baseCost = sampleScreen.dailyRate * (1 - currentMarginDecimal);
                        
                        // Calculate new price with new margin
                        const newMarginDecimal = editingMargin.newMargin / 100;
                        const newPrice = baseCost / (1 - newMarginDecimal);
                        
                        return (
                          <div className="space-y-3">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              {sampleScreen.name} - Precio Diario
                            </div>
                            
                            {/* Current vs New Comparison */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Current Price */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Actual</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Costo partner:</span>
                                    <span className="font-medium">${Math.round(baseCost).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Margen Shareflow ({editingMargin.currentMargin}%):</span>
                                    <span className="font-medium text-blue-600">+${Math.round(sampleScreen.dailyRate - baseCost).toLocaleString()}</span>
                                  </div>
                                  <div className="border-t pt-1 flex justify-between text-sm font-bold">
                                    <span>Precio al cliente:</span>
                                    <span className="text-gray-900">${sampleScreen.dailyRate.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* New Price */}
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <div className="text-xs text-green-700 mb-1 font-medium">Nuevo</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Costo partner:</span>
                                    <span className="font-medium">${Math.round(baseCost).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Margen Shareflow ({editingMargin.newMargin}%):</span>
                                    <span className="font-medium text-green-600">+${Math.round(newPrice - baseCost).toLocaleString()}</span>
                                  </div>
                                  <div className="border-t pt-1 flex justify-between text-sm font-bold">
                                    <span>Precio al cliente:</span>
                                    <span className="text-green-800">${Math.round(newPrice).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Price Change Indicator */}
                            {editingMargin.newMargin !== editingMargin.currentMargin && (
                              <div className="text-center">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                  newPrice > sampleScreen.dailyRate 
                                    ? 'bg-red-100 text-red-700' 
                                    : newPrice < sampleScreen.dailyRate 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {newPrice > sampleScreen.dailyRate ? (
                                    <>
                                      <TrendingUp className="w-3 h-3" />
                                      +${Math.round(newPrice - sampleScreen.dailyRate).toLocaleString()} 
                                      (+{(((newPrice - sampleScreen.dailyRate) / sampleScreen.dailyRate) * 100).toFixed(1)}%)
                                    </>
                                  ) : newPrice < sampleScreen.dailyRate ? (
                                    <>
                                      <TrendingDown className="w-3 h-3" />
                                      -${Math.round(sampleScreen.dailyRate - newPrice).toLocaleString()} 
                                      (-{(((sampleScreen.dailyRate - newPrice) / sampleScreen.dailyRate) * 100).toFixed(1)}%)
                                    </>
                                  ) : (
                                    <>Sin cambios</>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Screen Count Info */}
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <div className="text-lg font-bold text-purple-700">
                        {partnerScreens[editingMargin.partnerId]?.length || 0}
                      </div>
                      <div className="text-sm text-purple-600">
                        Pantallas que se actualizarán
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditMarginModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSaveMargin}
                      disabled={
                        editingMargin.newMargin < 0 || editingMargin.newMargin >= 100 ||
                        editingMargin.newProgrammaticMargin < 0 || editingMargin.newProgrammaticMargin >= 100 ||
                        (editingMargin.newMargin === editingMargin.currentMargin && 
                         editingMargin.newProgrammaticMargin === editingMargin.currentProgrammaticMargin)
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Actualizar Márgenes
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
} 