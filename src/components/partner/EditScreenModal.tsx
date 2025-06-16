import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Monitor, MapPin, DollarSign, Eye, EyeOff, Save, 
  BarChart3, Zap, Globe, Building, Crown, Bot, Package2,
  ArrowUp, ArrowDown, Activity, Cpu, Thermometer,
  Wifi, WifiOff, PlayCircle, PauseCircle, AlertTriangle,
  Clock, CheckCircle, XCircle, 
  Target, Star, Calendar, Timer, Sparkles,
  Info, RefreshCw} from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import toast from 'react-hot-toast';
import { ScreenType } from '../../hooks/useScreen';
import { constants } from '../../config/constants';

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
  realTimeHealth?: {
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
  };
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

interface ScreenPackage {
  id: number;
  screenId: number;
  packageType: string;
  enabled: boolean;
  price: number;
  spots: number;
  duration: string;
  reach: number;
  variants: Array<{
    id: number;
    variantId: string;
    name: string;
    frequency: string;
    spotsPerHour?: number;
    spotsPerDay?: number;
    spotsPerWeek?: number;
    spotsPerMonth?: number;
    price: number;
    enabled: boolean;
  }>;
}

interface EditScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  screen: ScreenType & { screenPackages?: ScreenPackage[] } | null;
  performance?: ScreenPerformance;
  config?: ScreenConfig;
  onSave: (updates: any) => void;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  
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
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EditScreenModal({ 
  isOpen, 
  onClose, 
  screen,
  performance,
  config,
  onSave 
}: EditScreenModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'technical' | 'sales'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  const transformScreenPackagesToFormData = (screenPackages: ScreenPackage[] | undefined): ScreenConfig['packages'] => {
    if (!screenPackages) {
      return {
        moments: { enabled: true, price: 25000 },
        hourly: { enabled: true, price: 35000, spots: 12 },
        daily: { enabled: true, price: 180000, spots: 48 },
        weekly: { enabled: false, price: 950000, spots: 200 },
        monthly: { enabled: false, price: 3200000, spots: 720 }
      };
    }

    const packages: ScreenConfig['packages'] = {
      moments: { enabled: false, price: 0 },
      hourly: { enabled: false, price: 0, spots: 0 },
      daily: { enabled: false, price: 0, spots: 0 },
      weekly: { enabled: false, price: 0, spots: 0 },
      monthly: { enabled: false, price: 0, spots: 0 }
    };

    screenPackages.forEach(pkg => {
      const variant = pkg.variants.find(v => v.enabled) || pkg.variants[0];
      
      if (variant) {
        packages[pkg.packageType as keyof typeof packages] = {
          enabled: pkg.enabled,
          price: variant.price,
          spots: variant.spotsPerHour || variant.spotsPerDay || variant.spotsPerWeek || variant.spotsPerMonth || pkg.spots
        };
      }
    });

    return packages;
  };
  
  const [formData, setFormData] = useState<ScreenConfig>(
    config || {
      id: screen?.id || '',
      connectionType: 'manual',
      isListed: true,
      packages: transformScreenPackagesToFormData(screen?.screenPackages),
      automatedPricing: false,
      minPrice: 15000,
      maxPrice: 80000
    }
  );

  if (!isOpen || !screen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      toast.success('Pantalla actualizada exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar la pantalla');
    } finally {
      setIsLoading(false);
    }
  };

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

  const toggleListing = () => {
    setFormData(prev => ({ ...prev, isListed: !prev.isListed }));
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'shareflow-screen': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'broadsign': return <Globe className="w-4 h-4 text-blue-600" />;
      case 'latinad': return <Building className="w-4 h-4 text-orange-600" />;
      case 'api': return <Zap className="w-4 h-4 text-green-600" />;
      default: return <Monitor className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConnectionDisplay = (type: string) => {
    switch (type) {
      case 'shareflow-screen': return 'Shareflow Screen';
      case 'broadsign': return 'Broadsign';
      case 'latinad': return 'LatinAd';
      case 'api': return 'API Integrada';
      default: return 'Manual';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Hero Image */}
            <div className="relative h-56 bg-gradient-to-r from-blue-600 to-purple-600">
              <img
                src={`${constants.base_path}/${screen.images.length > 0 ? screen.images[0].filePath: ''}`}
                alt={screen.publicName}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {screen.publicName}
                      </h1>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                        formData.isListed 
                          ? 'bg-green-500/20 text-green-100 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-100 border border-red-500/30'
                      }`}>
                        {formData.isListed ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Activa en Marketplace
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            No listada
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-white/90">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{screen.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getConnectionIcon(formData.connectionType)}
                        <span className="text-sm">{getConnectionDisplay(formData.connectionType)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span className="text-sm">{screen.resolution || 'No especificada'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={toggleListing}
                      className={`${
                        formData.isListed 
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/30' 
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-500/30'
                      } px-4 py-2 rounded-lg font-semibold transition-all`}
                    >
                      {formData.isListed ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Activar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-2 rounded-lg font-semibold transition-all"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6">
              {[
                { id: 'overview', label: 'Vista General', icon: Monitor },
                { id: 'pricing', label: 'Precios & Paquetes', icon: DollarSign },
                { id: 'technical', label: 'Estado Técnico', icon: Activity },
                { id: 'sales', label: 'Desempeño Comercial', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Ingresos/mes</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${Math.round((performance?.revenue.monthly || 0) / 1000)}K
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Ocupación</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {performance?.occupancy.average || 0}%
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Uptime</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {performance?.realTimeHealth?.uptimeToday || 0}%
                          </p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-600" />
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Reservas/sem</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {performance?.bookings.thisWeek || 0}
                          </p>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-600" />
                      </div>
                    </Card>
                  </div>

                  {/* Screen Information */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Información de la Pantalla
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la pantalla
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-gray-900">
                          {screen.publicName}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ubicación
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-gray-900">
                          {screen.address}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de conexión
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                          {getConnectionIcon(formData.connectionType)}
                          <span className="text-gray-900">{getConnectionDisplay(formData.connectionType)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resolución
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-gray-900">
                          {screen.resolution || 'No especificada'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-gray-900 flex items-center gap-2">
                          {typeof screen.category === 'object' && (
                            <span>{screen.category}</span>
                          )}
                          <span>
                            {typeof screen.category === 'object' ? screen.category : screen.category}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado en Marketplace
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleListing}
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
                          <span className="text-sm text-gray-700">
                            {formData.isListed ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  {/* Pricing Strategy */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        Estrategia de Precios
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, automatedPricing: !prev.automatedPricing }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.automatedPricing ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.automatedPricing ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-700">
                          {formData.automatedPricing ? 'Automático' : 'Manual'}
                        </span>
                      </div>
                    </div>
                    
                    {formData.automatedPricing && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-purple-900">Precios Automáticos Activados</h4>
                            <p className="text-sm text-purple-700 mt-1">
                              Los precios se ajustarán automáticamente según la demanda, disponibilidad y horarios pico.
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-purple-900 mb-1">
                              Precio Mínimo
                            </label>
                            <input
                              type="number"
                              value={formData.minPrice}
                              onChange={(e) => setFormData(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                              className="w-full p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="15000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-purple-900 mb-1">
                              Precio Máximo
                            </label>
                            <input
                              type="number"
                              value={formData.maxPrice}
                              onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 0 }))}
                              className="w-full p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="80000"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Package Pricing */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package2 className="w-5 h-5 text-blue-600" />
                      Configuración de Paquetes y Precios
                    </h3>
                    
                    <div className="space-y-4">
                      {Object.entries(formData.packages).map(([packageType, packageData]) => {
                        const packageInfo = {
                          moments: { 
                            label: 'Momentos', 
                            description: 'Anuncios de 15 segundos en horarios específicos',
                            icon: Timer,
                            color: 'text-pink-600',
                            bgColor: 'bg-pink-50',
                            borderColor: 'border-pink-200'
                          },
                          hourly: { 
                            label: 'Por Hora', 
                            description: 'Hasta 12 reproducciones por hora',
                            icon: Clock,
                            color: 'text-blue-600',
                            bgColor: 'bg-blue-50',
                            borderColor: 'border-blue-200'
                          },
                          daily: { 
                            label: 'Diario', 
                            description: 'Hasta 48 reproducciones durante el día',
                            icon: Calendar,
                            color: 'text-green-600',
                            bgColor: 'bg-green-50',
                            borderColor: 'border-green-200'
                          },
                          weekly: { 
                            label: 'Semanal', 
                            description: 'Hasta 200 reproducciones durante la semana',
                            icon: Target,
                            color: 'text-purple-600',
                            bgColor: 'bg-purple-50',
                            borderColor: 'border-purple-200'
                          },
                          monthly: { 
                            label: 'Mensual', 
                            description: 'Hasta 720 reproducciones durante el mes',
                            icon: Star,
                            color: 'text-orange-600',
                            bgColor: 'bg-orange-50',
                            borderColor: 'border-orange-200'
                          }
                        };
                        
                        const info = packageInfo[packageType as keyof typeof packageInfo];
                        
                        return (
                          <div
                            key={packageType}
                            className={`border rounded-xl p-4 transition-all ${
                              packageData.enabled
                                ? `${info.bgColor} ${info.borderColor} border-2`
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${packageData.enabled ? info.bgColor : 'bg-gray-100'}`}>
                                  <info.icon className={`w-5 h-5 ${packageData.enabled ? info.color : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <h4 className={`font-semibold ${packageData.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {info.label}
                                  </h4>
                                  <p className={`text-sm ${packageData.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {info.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <Tooltip content={`${packageData.enabled ? 'Desactivar' : 'Activar'} paquete ${info.label.toLowerCase()}`}>
                                  <button
                                    onClick={() => updatePackage(packageType as any, 'enabled', !packageData.enabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                      packageData.enabled ? info.color.replace('text-', 'bg-') : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        packageData.enabled ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                            
                            {packageData.enabled && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio ({info.label})
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                      type="number"
                                      value={packageData.price}
                                      onChange={(e) => updatePackage(packageType as any, 'price', parseInt(e.target.value) || 0)}
                                      disabled={formData.automatedPricing}
                                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        formData.automatedPricing ? 'bg-gray-100 text-gray-500' : 'bg-white'
                                      }`}
                                      placeholder="25000"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatCurrency(packageData.price)}
                                  </p>
                                </div>
                                
                                {'spots' in packageData && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Reproducciones Incluidas
                                    </label>
                                    <input
                                      type="number"
                                      value={packageData.spots}
                                      onChange={(e) => updatePackage(packageType as any, 'spots', parseInt(e.target.value) || 0)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="12"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'technical'  && (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Estado de Conexión
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl border-2 ${
                        screen.networkStatus === 'Online' 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            screen.networkStatus === 'Online'  ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {screen.networkStatus === 'Online'  ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Pantalla</p>
                            <p className={`text-sm ${
                              screen.networkStatus === 'Online'  ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {screen.networkStatus === 'Online'  ? 'En línea' : 'Desconectada'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border-2 ${
                        screen.networkStatus === 'Online'  
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            screen.networkStatus === 'Online'  ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {screen.networkStatus === 'Online'  ? (
                              <Wifi className="w-5 h-5 text-green-600" />
                            ) : (
                              <WifiOff className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Internet</p>
                            <p className={`text-sm ${
                              screen.networkStatus === 'Online'  ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {screen.networkStatus === 'Online'  ? 'Conectado' : 'Sin conexión'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border-2 ${
                        screen.networkStatus === 'Online'  
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            screen.networkStatus === 'Online'  ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {screen.networkStatus  === 'playing' ? (
                              <PlayCircle className="w-5 h-5 text-green-600" />
                            ) : screen.networkStatus === 'paused' ? (
                              <PauseCircle className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Reproducción</p>
                            <p className={`text-sm ${
                              screen.networkStatus === 'playing' ? 'text-green-600' :
                              screen.networkStatus === 'paused' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {screen.networkStatus === 'playing' ? 'Reproduciendo' :
                               screen.networkStatus === 'paused' ? 'Pausado' :
                               screen.networkStatus === 'error' ? 'Error' : 'Inactivo'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* System Metrics */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      Métricas del Sistema
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <Cpu className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">CPU</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {Math.round(0)}%
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <Thermometer className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-600">Temp</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                          {Math.round(1)}°C
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(1 / 100) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">Uptime</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {Math.round(0)}%
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Respuesta</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {1}ms
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Última actualización: {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'sales' && performance && (
                <div className="space-y-6">
                  {/* Revenue Overview */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Desempeño de Ingresos
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-600">Hoy</span>
                          <div className={`flex items-center gap-1 text-xs ${
                            performance.revenue.trend > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {performance.revenue.trend > 0 ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )}
                            {Math.abs(performance.revenue.trend).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {formatCurrency(performance.revenue.daily)}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">Esta Semana</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatCurrency(performance.revenue.weekly)}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-600">Este Mes</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {formatCurrency(performance.revenue.monthly)}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Bookings & Occupancy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Reservas
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Hoy</span>
                          <span className="font-semibold">{performance.bookings.today}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Esta semana</span>
                          <span className="font-semibold">{performance.bookings.thisWeek}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Próxima semana</span>
                          <span className="font-semibold text-blue-600">{performance.bookings.nextWeek}</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        Ocupación
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Actual</span>
                          <span className="font-semibold">{performance.occupancy.current}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Promedio</span>
                          <span className="font-semibold">{performance.occupancy.average}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pico máximo</span>
                          <span className="font-semibold text-orange-600">{performance.occupancy.peak}%</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 