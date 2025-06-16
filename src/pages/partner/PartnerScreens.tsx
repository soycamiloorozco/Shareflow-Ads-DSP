import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Monitor, MapPin, 
  Calendar, Settings,
  ArrowUpRight, TrendingUp, CheckCircle, XCircle, LayoutGrid,
  LayoutList, Clock, DollarSign, Bot, Wifi,
  ArrowUp, ArrowDown, 
  Signal, BarChart2, Percent, 
  
  Package2,
  PlayCircle, PauseCircle, 
  Globe, WifiOff
  
  
  } from 'lucide-react';
import { Button } from '../../components/Button';
// import { screens } from '../../data/mockData';
import toast from 'react-hot-toast';
// Charts temporarily disabled - recharts not installed
// import {
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend, LineChart, Line, Bar, BarChart,
// } from 'recharts';
import { AddScreenModal } from '../../components/partner/AddScreenModal';
import { ScreenConfigModal } from '../../components/partner/ScreenConfigModal';
import { ImportInventoryModal } from '../../components/partner/ImportInventoryModal';
import { ScreenDetailModal } from '../../components/partner/ScreenDetailModal';
import {ScreenType, useScreen} from '../../hooks/useScreen';
import { constants } from '../../config/constants';
import { EditScreenModal } from '../../components/partner/EditScreenModal';

// Enhanced type definitions
interface ScreenHealthData {
  isOnline: boolean;
  internetConnectivity: boolean;
  contentPlayback: boolean;
  responseTime: number;
  cpuUsage: number;
  diskSpace: number;
  temperature: number;
  lastHeartbeat: string;
  uptimeToday: number;
  totalUptime: number;
  alertLevel: 'healthy' | 'warning' | 'critical';
  currentContent: string | null;
  playbackStatus: 'playing' | 'paused' | 'error' | 'idle';
}

interface ScreenPerformance {
  screenId: string;
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: number;
  };
  occupancy: {
    current: number;
    average: number;
    peak: number;
    trend: number;
  };
  health: {
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
    uptime: number;
    lastCheck: string;
    connectivity: 'connected' | 'disconnected' | 'limited';
  };
  bookings: {
    today: number;
    thisWeek: number;
    nextWeek: number;
  };
  realTimeHealth?: ScreenHealthData;
}

interface ScreenConfig {
  id: string;
  connectionType: 'shareflow-screen' | 'broadsign' | 'latinad' | 'manual' | 'api';
  isListed: boolean;
  packages: {
    moments: { enabled: boolean; price: number };
    hourly: { enabled: boolean; price: number; spots: number };
    daily: { enabled: boolean; price: number; spots: number };
    weekly: { enabled: boolean; price: number; spots: number };
    monthly: { enabled: boolean; price: number; spots: number };
  };
  automatedPricing: boolean;
  minPrice: number;
  maxPrice: number;
}

// Mock data generators
const generateRealTimeHealthData = (screenId: string): ScreenHealthData => {
  const seed = parseInt(screenId.slice(-1)) || 1;
  const isOnline = seed > 1; // Most screens online
  const hasInternet = isOnline && seed > 1; // Most have internet
  const isPlayingContent = hasInternet && seed > 2; // Most are playing content
  
  return {
    isOnline,
    internetConnectivity: hasInternet,
    contentPlayback: isPlayingContent,
    responseTime: isOnline ? 50 + Math.random() * 200 : 0,
    cpuUsage: isOnline ? 15 + Math.random() * 60 : 0,
    diskSpace: isOnline ? 25 + Math.random() * 50 : 0,
    temperature: isOnline ? 35 + Math.random() * 25 : 0,
    lastHeartbeat: isOnline ? new Date().toISOString() : new Date(Date.now() - 300000).toISOString(),
    uptimeToday: isOnline ? 85 + Math.random() * 14 : 0,
    totalUptime: isOnline ? 92 + Math.random() * 7 : 0,
    alertLevel: !isOnline ? 'critical' : 
                seed > 3 ? 'healthy' : 
                seed > 1 ? 'warning' : 'critical',
    currentContent: isPlayingContent ? `Campaign_${Math.floor(Math.random() * 100).toString().padStart(3, '0')}.mp4` : null,
    playbackStatus: !isOnline ? 'idle' : 
                    !hasInternet ? 'idle' :
                    !isPlayingContent ? 'idle' : 
                    Math.random() > 0.8 ? 'paused' : 'playing'
  };
};

const generateScreenPerformance = (screenId: string): ScreenPerformance => {
  const seed = parseInt(screenId.slice(-1)) || 1;
  const baseRevenue = 50000 + (seed * 15000);
  const healthMultiplier = seed > 7 ? 1 : seed > 5 ? 0.8 : seed > 3 ? 0.6 : 0.3;
  
  return {
    screenId,
    revenue: {
      daily: Math.floor(baseRevenue * healthMultiplier),
      weekly: Math.floor(baseRevenue * 7 * healthMultiplier),
      monthly: Math.floor(baseRevenue * 30 * healthMultiplier),
      trend: seed > 5 ? Math.random() * 20 + 5 : -(Math.random() * 15 + 2)
    },
    occupancy: {
      current: Math.floor(Math.random() * 100),
      average: 65 + (seed * 3),
      peak: 85 + (seed * 2),
      trend: seed > 5 ? Math.random() * 15 + 2 : -(Math.random() * 10 + 1)
    },
    health: {
      status: seed > 5 ? 'excellent' : seed > 3 ? 'good' : seed > 1 ? 'fair' : 'offline',
      uptime: seed > 5 ? 99.8 : seed > 3 ? 96.5 : seed > 1 ? 85.2 : 0,
      lastCheck: new Date(Date.now() - (Math.random() * 300000)).toISOString(),
      connectivity: seed > 3 ? 'connected' : seed > 1 ? 'limited' : 'disconnected'
    },
    bookings: {
      today: Math.floor(Math.random() * 12),
      thisWeek: Math.floor(Math.random() * 45),
      nextWeek: Math.floor(Math.random() * 35)
    },
    realTimeHealth: generateRealTimeHealthData(screenId)
  };
};

const generateScreenConfig = (screenId: string): ScreenConfig => {
  const seed = parseInt(screenId.slice(-1)) || 1;
  
  return {
    id: screenId,
    connectionType: seed > 6 ? 'shareflow-screen' : seed > 3 ? 'api' : 'manual',
    isListed: seed > 2,
    packages: {
      moments: { enabled: seed > 4, price: 25000 + (seed * 2000) },
      hourly: { enabled: seed > 3, price: 35000 + (seed * 3000), spots: 12 },
      daily: { enabled: true, price: 180000 + (seed * 15000), spots: 48 },
      weekly: { enabled: seed > 5, price: 950000 + (seed * 50000), spots: 200 },
      monthly: { enabled: seed > 6, price: 3200000 + (seed * 200000), spots: 720 }
    },
    automatedPricing: seed > 5,
    minPrice: 15000 + (seed * 2000),
    maxPrice: 80000 + (seed * 10000)
  };
};

// Filter and sort options
const statusOptions = [
  { value: 'all', label: 'Todas las pantallas' },
  { value: 'connected', label: 'Conectadas' },
  { value: 'disconnected', label: 'Desconectadas' },
  { value: 'listed', label: 'Listadas en Marketplace' },
  { value: 'unlisted', label: 'No listadas' }
];

const sortOptions = [
  { value: 'revenue', label: 'Mayor ingreso' },
  { value: 'occupancy', label: 'Mayor ocupación' },
  { value: 'health', label: 'Mejor estado' },
  { value: 'bookings', label: 'Más reservas' },
  { value: 'newest', label: 'Más recientes' }
];

// Performance data for charts
const performanceData = [
  { month: 'Ene', revenue: 12500000, occupancy: 68, bookings: 145 },
  { month: 'Feb', revenue: 13800000, occupancy: 72, bookings: 162 },
  { month: 'Mar', revenue: 15200000, occupancy: 75, bookings: 178 },
  { month: 'Abr', revenue: 16900000, occupancy: 78, bookings: 194 },
  { month: 'May', revenue: 18400000, occupancy: 82, bookings: 210 },
  { month: 'Jun', revenue: 20100000, occupancy: 85, bookings: 227 }
];

const categoryData = [
  { name: 'Conectadas', value: 24, color: '#10B981' },
  { name: 'API', value: 8, color: '#3B82F6' },
  { name: 'Manuales', value: 3, color: '#F59E0B' }
];

export function PartnerScreens() {
  const { createScreen, get, screens } = useScreen();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<ScreenType | null>(null);
  const [viewMode, setViewMode] = useState<'performance' | 'config'>('performance');
  const [displayMode, setDisplayMode] = useState<'grid' | 'compact'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [selectedScreenConfig, setSelectedScreenConfig] = useState<ScreenConfig | null>(null);
  const [selectedScreenPerformance, setSelectedScreenPerformance] = useState<ScreenPerformance | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Performance data
  const [screenPerformances, setScreenPerformances] = useState(() => 
    screens.map(screen => generateScreenPerformance(screen.id))
  );
  const [screenConfigs] = useState(() => 
    screens.map(screen => generateScreenConfig(screen.id))
  );
  
  // Real-time monitoring
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    get();
  },[]);
  // Update real-time health data
  const updateHealthData = () => {
    setScreenPerformances(prev => 
      prev.map(performance => ({
        ...performance,
        realTimeHealth: generateRealTimeHealthData(performance.screenId)
      }))
    );
  };

  // Real-time monitoring effect
  useEffect(() => {
    if (isMonitoringActive) {
      monitoringIntervalRef.current = setInterval(updateHealthData, 10000); // Update every 10 seconds
      return () => {
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current);
        }
      };
    } else {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    }
  }, [isMonitoringActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  // Calculate summary metrics
  const summaryMetrics = {
    totalRevenue: screenPerformances.reduce((sum, perf) => sum + perf.revenue.monthly, 0),
    averageOccupancy: Math.round(screenPerformances.reduce((sum, perf) => sum + perf.occupancy.average, 0) / screenPerformances.length),
    totalBookings: screenPerformances.reduce((sum, perf) => sum + perf.bookings.thisWeek, 0),
    connectedScreens: screenPerformances.filter(perf => perf.health.connectivity === 'connected').length
  };

  // Filter screens based on selected criteria
  const filteredScreens = screens.filter(screen => {
    const config = screenConfigs.find(c => c.id === screen.id);
    const performance = screenPerformances.find(p => p.screenId === screen.id);
    
    const matchesSearch = !searchQuery || 
      screen.publicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'connected' && performance?.health.connectivity === 'connected') ||
      (activeFilter === 'disconnected' && performance?.health.connectivity === 'disconnected') ||
      (activeFilter === 'listed' && config?.isListed) ||
      (activeFilter === 'unlisted' && !config?.isListed);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const perfA = screenPerformances.find(p => p.screenId === a.id);
    const perfB = screenPerformances.find(p => p.screenId === b.id);
    
    switch (sortBy) {
      case 'revenue':
        return (perfB?.revenue.monthly || 0) - (perfA?.revenue.monthly || 0);
      case 'occupancy':
        return (perfB?.occupancy.average || 0) - (perfA?.occupancy.average || 0);
      case 'health':
        const healthOrder = { excellent: 5, good: 4, fair: 3, poor: 2, offline: 1 };
        return (healthOrder[perfB?.health.status || 'offline']) - (healthOrder[perfA?.health.status || 'offline']);
      case 'bookings':
        return (perfB?.bookings.thisWeek || 0) - (perfA?.bookings.thisWeek || 0);
      default:
        return 0;
    }
  });


  
  const saveScreen = (screenData: ScreenType) => {
    createScreen(screenData).then(() => {
       toast.success('Pantalla agregada exitosamente');
      setIsAddModalOpen(false);
    });
  }

  const handleScreenConfig = (screen: ScreenType) => {
    const config = screenConfigs.find(c => c.id === screen.id);
    setSelectedScreen(screen);
    setSelectedScreenConfig(config || null);
    setIsConfigModalOpen(true);
  };

  const handleConfigSave = (config: ScreenConfig) => {
    toast.success('Configuración guardada exitosamente');
    setIsConfigModalOpen(false);
  };

  const handleScreenDetails = (screen: ScreenType) => {
    const config = screenConfigs.find(c => c.id === screen.id);
    const performance = screenPerformances.find(p => p.screenId === screen.id);
    setSelectedScreen(screen);
    setSelectedScreenConfig(config || null);
    setSelectedScreenPerformance(performance || null);
    setIsDetailModalOpen(true);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-green-600 bg-green-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectivityIcon = (connectivity: string) => {
    switch (connectivity) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-600" />;
      case 'limited': return <Signal className="w-4 h-4 text-yellow-600" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-600" />;
      default: return <WifiOff className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'shareflow-screen': return <Wifi className="w-4 h-4 text-blue-600" />;
      case 'api': return <Signal className="w-4 h-4 text-purple-600" />;
      case 'manual': return <Settings className="w-4 h-4 text-gray-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlaybackStatusIcon = (status: string) => {
    switch (status) {
      case 'playing': return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <PauseCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'idle': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertStatusColor = (alertLevel: string) => {
    switch (alertLevel) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms === 0) return 'N/A';
    if (ms < 100) return `${Math.round(ms)}ms`;
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatUptime = (percentage: number) => {
    if (percentage === 0) return '0%';
    if (percentage >= 99.5) return `${percentage.toFixed(1)}%`;
    return `${percentage.toFixed(1)}%`;
  };

  const getUptimeColor = (percentage: number) => {
    if (percentage >= 99) return 'text-green-600';
    if (percentage >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };


  const handleScreenEdit = (screen: ScreenType) => {
    const config = screenConfigs.find(c => c.id === screen.id);
    const performance = screenPerformances.find(p => p.screenId === screen.id);
    setSelectedScreen(screen);
    setSelectedScreenConfig(config || null);
    setSelectedScreenPerformance(performance || null);
    setIsEditModalOpen(true);
  };

    const handleEditSave = (updates: any) => {
    toast.success('Pantalla actualizada exitosamente');
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Gestión de Pantallas
                </h1>
                <p className="text-gray-600 mt-1">
                  Administra el desempeño y configuración de tus {screens.length} pantallas
                  </p>
                </div>
              </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Real-time monitoring toggle */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isMonitoringActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium text-green-700">
                    {isMonitoringActive ? 'Monitoreo Activo' : 'Monitoreo Pausado'}
                  </span>
                </div>
                <button
                  onClick={() => setIsMonitoringActive(!isMonitoringActive)}
                  className="text-green-600 hover:text-green-700"
                >
                  {isMonitoringActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </button>
              </div>

              <Button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="hidden sm:inline">Importar Inventario</span>
                <span className="sm:hidden">Importar</span>
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="hidden sm:inline">Agregar Pantalla</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </div>
          </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Ingresos del Mes</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ${summaryMetrics.totalRevenue.toLocaleString('es-CO')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-green-600 text-xs font-medium">+12% vs semana anterior</span>
                    </div>
                  </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Ocupación Promedio</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {summaryMetrics.averageOccupancy}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-600 text-xs font-medium">+5% vs semana anterior</span>
                    </div>
                  </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Reservas/Semana</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {summaryMetrics.totalBookings}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-600 text-xs font-medium">+8% vs semana anterior</span>
                    </div>
                  </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pantallas Conectadas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summaryMetrics.connectedScreens}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">{screens.length - summaryMetrics.connectedScreens} desconectadas</span>
                    </div>
                  </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>
      </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 mb-4">
          <div className="flex flex-col lg:flex-row gap-3 justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar pantallas..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todas', icon: Monitor },
                { value: 'connected', label: 'Conectadas', icon: Wifi },
                { value: 'disconnected', label: 'Desconectadas', icon: WifiOff },
                { value: 'listed', label: 'En Marketplace', icon: Globe },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    activeFilter === value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
              </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('performance')}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'performance'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rendimiento</span>
              </button>
              <button
                onClick={() => setViewMode('config')}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'config'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Configuración</span>
              </button>
            </div>

            {/* Display Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`px-2.5 py-1.5 text-sm rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  displayMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                onClick={() => setDisplayMode('compact')}
                className={`px-2.5 py-1.5 text-sm rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  displayMode === 'compact'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compacta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Screens Content */}
        {displayMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredScreens.map((screen, index) => {
              const performance = screenPerformances.find(p => p.screenId === screen.id);
              const config = screenConfigs.find(c => c.id === screen.id);
              
              return (
                <motion.div 
                  key={screen.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                {/* Screen Image */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={`${constants.base_path}/${screen.images.length > 0 ? screen.images[0].filePath: ''}`}
                        alt={screen.publicName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthColor(performance?.health.status || 'offline')}`}>
                      {screen.networkStatus === 'online' ? 'Excelente' :
                       performance?.health.status === 'good' ? 'Buena' :
                       performance?.health.status === 'fair' ? 'Regular' : 'Desconectada'}
                  </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getConnectivityIcon(performance?.health.connectivity || 'disconnected')}
                      </div>
                    </div>
                            
                {/* Screen Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {screen.publicName}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-gray-600">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs truncate">{screen.address}</span>
                    </div>
                  </div>
                </div>

                  {/* Simplified Card Content */}
                  <div className="space-y-3">
                    {/* Key Metrics - Only the most important */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getConnectionTypeIcon(config?.connectionType || 'manual')}
                        <span className="text-sm text-gray-600">
                          {config?.connectionType === 'shareflow-screen' ? 'Shareflow Screen' :
                           config?.connectionType === 'broadsign' ? 'Broadsign' :
                           config?.connectionType === 'latinad' ? 'LatinAd' :
                           config?.connectionType === 'api' ? 'API' : 'Manual'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">
                          ${((performance?.revenue.monthly || 0)/1000000).toFixed(1)}M/mes
                        </div>
                      </div>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estado</span>
                      <div className="flex items-center gap-2">
                        {getPlaybackStatusIcon(performance?.realTimeHealth?.playbackStatus || 'idle')}
                        <span className="text-sm font-medium">
                          {performance?.realTimeHealth?.playbackStatus === 'playing' ? 'Reproduciendo' :
                           performance?.realTimeHealth?.playbackStatus === 'paused' ? 'Pausado' :
                           performance?.realTimeHealth?.playbackStatus === 'error' ? 'Error' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
          </div>
        ) : (
            <div className="space-y-4">
                      {/* Connection Type */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getConnectionTypeIcon(config?.connectionType || 'manual')}
                          <span className="text-sm text-gray-600">Tipo de conexión</span>
                  </div>
                        <div className="text-sm font-medium text-gray-900">
                          {config?.connectionType === 'shareflow-screen' ? 'Shareflow Screen' :
                           config?.connectionType === 'api' ? 'API Integrada' : 'Manual'}
                        </div>
                      </div>
                      
                      {/* Marketplace Status */}
                      <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Marketplace</span>
                        </div>
                        <div className={`text-sm font-medium ${config?.isListed ? 'text-green-600' : 'text-gray-500'}`}>
                          {config?.isListed ? 'Listada' : 'No listada'}
                      </div>
                    </div>
                    
                      {/* Pricing Strategy */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">Precios</span>
                      </div>
                        <div className={`text-sm font-medium ${config?.automatedPricing ? 'text-purple-600' : 'text-gray-600'}`}>
                          {config?.automatedPricing ? 'Automático' : 'Manual'}
                      </div>
                      </div>

                      {/* Active Packages */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package2 className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600">Paquetes activos</span>
                      </div>
                        <div className="text-sm font-medium text-gray-900">
                          {Object.values(config?.packages || {}).filter(pkg => pkg.enabled).length}/5
                    </div>
                      </div>
                    </div>
                    
                  {/* Actions */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                      <Button
                                              onClick={() => handleScreenEdit(screen)}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center py-3 rounded-lg font-semibold shadow-sm hover:shadow-md"
                      >
                        Editar Pantalla
                      </Button>
                    </div>
                  </div>
                </motion.div>
            );
          })}
          </div>
        ) : (
          /* Compact View */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                <div className="col-span-2">Pantalla</div>
                <div className="col-span-1">Estado</div>
                <div className="col-span-1">Uptime</div>
                <div className="col-span-1">Reproducción</div>
                <div className="col-span-1">Respuesta</div>
                {viewMode === 'performance' ? (
                  <>
                    <div className="col-span-2">Ingresos/mes</div>
                    <div className="col-span-1">Ocupación</div>
                    <div className="col-span-1">CPU</div>
                    <div className="col-span-1">Temp</div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2">Marketplace</div>
                    <div className="col-span-1">Paquetes</div>
                    <div className="col-span-1">Precios</div>
                    <div className="col-span-1">---</div>
                  </>
                )}
                <div className="col-span-1">Acciones</div>
              </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100">
              {filteredScreens.map((screen, index) => {
                const performance = screenPerformances.find(p => p.screenId === screen.id);
                const config = screenConfigs.find(c => c.id === screen.id);
                
                return (
            <motion.div
                    key={screen.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Screen Info */}
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-10 h-6 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img
                            src={screen.images[0].filePath}
                            alt={screen.publicName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate text-sm">{screen.publicName}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{screen.address.split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                  
                      {/* Status */}
                      <div className="col-span-1">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAlertStatusColor(performance?.realTimeHealth?.alertLevel || 'critical')}`}>
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                          {performance?.realTimeHealth?.alertLevel === 'healthy' ? 'OK' :
                           performance?.realTimeHealth?.alertLevel === 'warning' ? '⚠️' : '❌'}
                        </div>
                      </div>
                    
                      {/* Uptime */}
                      <div className="col-span-1">
                        <div className={`text-sm font-bold ${getUptimeColor(performance?.realTimeHealth?.uptimeToday || 0)}`}>
                          {formatUptime(performance?.realTimeHealth?.uptimeToday || 0)}
                        </div>
                      </div>

                      {/* Playback Status */}
                      <div className="col-span-1 flex items-center gap-1">
                        {getPlaybackStatusIcon(performance?.realTimeHealth?.playbackStatus || 'error')}
                        <span className="text-xs text-gray-600">
                          {performance?.realTimeHealth?.playbackStatus === 'playing' ? 'Play' :
                           performance?.realTimeHealth?.playbackStatus === 'paused' ? 'Pause' :
                           performance?.realTimeHealth?.playbackStatus === 'error' ? 'Error' : 'Idle'}
                        </span>
                      </div>

                      {/* Response Time */}
                      <div className="col-span-1">
                        <div className="text-sm font-medium text-gray-900">
                          {formatResponseTime(performance?.realTimeHealth?.responseTime || 0)}
                        </div>
                      </div>
                  
                      {viewMode === 'performance' ? (
                        <>
                          {/* Revenue */}
                          <div className="col-span-2">
                            <div className="font-semibold text-green-600">
                              ${Math.round((performance?.revenue.monthly || 0) / 1000)}K
                            </div>
                            <div className={`text-xs flex items-center gap-1 ${
                              (performance?.revenue.trend || 0) > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(performance?.revenue.trend || 0) > 0 ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )}
                              {Math.abs(performance?.revenue.trend || 0).toFixed(1)}%
                            </div>
                          </div>
                  
                          {/* Occupancy */}
                          <div className="col-span-1">
                            <div className="font-semibold text-blue-600">
                              {performance?.occupancy.average}%
                            </div>
                            <div className={`text-xs flex items-center gap-1 ${
                              (performance?.occupancy.trend || 0) > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(performance?.occupancy.trend || 0) > 0 ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )}
                              {Math.abs(performance?.occupancy.trend || 0).toFixed(1)}%
                            </div>
                          </div>

                          {/* CPU Usage */}
                          <div className="col-span-1">
                            <div className="font-semibold text-purple-600">
                              {Math.round(performance?.realTimeHealth?.cpuUsage || 0)}%
                            </div>
                            <div className="text-xs text-gray-500">CPU</div>
                          </div>

                          {/* Temperature */}
                          <div className="col-span-1">
                            <div className="font-semibold text-orange-600">
                              {Math.round(performance?.realTimeHealth?.temperature || 0)}°C
                            </div>
                            <div className="text-xs text-gray-500">temp</div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Marketplace */}
                          <div className="col-span-2">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              config?.isListed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Globe className="w-3 h-3" />
                              {config?.isListed ? 'Listada' : 'No listada'}
                            </div>
                          </div>
                  
                          {/* Packages */}
                          <div className="col-span-1">
                            <div className="font-semibold text-orange-600">
                              {Object.values(config?.packages || {}).filter(pkg => pkg.enabled).length}/5
                            </div>
                            <div className="text-xs text-gray-500">activos</div>
                          </div>

                          {/* Pricing */}
                          <div className="col-span-1">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              config?.automatedPricing 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Bot className="w-3 h-3" />
                              {config?.automatedPricing ? 'Auto' : 'Manual'}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleScreenConfig(screen)}
                            className="px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                            title="Configurar"
                          >
                            Config
                          </button>
                          <button
                            onClick={() => handleScreenDetails(screen)}
                            className="px-2 py-1 bg-gray-600 text-white hover:bg-gray-700 rounded text-xs font-medium transition-colors"
                            title="Ver detalles"
                          >
                            Ver
                          </button>
                        </div>
                      </div>
                </div>
              </motion.div>
                )
              })}
            </div>
          </div>
          )}

        {/* Empty State */}
        {filteredScreens.length === 0 && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Monitor className="w-10 h-10 text-gray-400" />
                    </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No se encontraron pantallas
            </h3>
            <p className="text-gray-600 mb-6">
              Ajusta los filtros o agrega una nueva pantalla para comenzar
            </p>
                    <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    >
              Agregar Primera Pantalla
                    </Button>
            </motion.div>
          )}
      </div>

      {/* Modals */}
      <AnimatePresence>
          {isAddModalOpen && (
          <AddScreenModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={(screenData) => {
              console.log('Nueva pantalla:', screenData);
              saveScreen(screenData);
              
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedScreen && (
          <EditScreenModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            screen={selectedScreen}
            performance={selectedScreenPerformance || undefined}
            config={selectedScreenConfig || undefined}
            onSave={handleEditSave}
          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isConfigModalOpen && selectedScreen && (
          <ScreenConfigModal
            isOpen={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            screen={selectedScreen}
            config={selectedScreenConfig}
            onSave={handleConfigSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImportModalOpen && (
          <ImportInventoryModal
            onClose={() => setIsImportModalOpen(false)}
            onImport={(importData: any) => {
              console.log('Inventario importado:', importData);
              toast.success(`${importData.screens.length} pantallas importadas exitosamente desde ${importData.provider}`);
              setIsImportModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailModalOpen && selectedScreen && (
          <ScreenDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            screen={selectedScreen}
            performance={selectedScreenPerformance || undefined}
            config={selectedScreenConfig || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}