import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Monitor, MapPin, Calendar, DollarSign, Users, Star,
  Eye, Clock, Zap, Target, CheckCircle, XCircle, Wifi,
  WifiOff, Activity, Cpu, HardDrive, Thermometer, Signal,
  Globe, Bot, Package2, PlayCircle, PauseCircle, AlertTriangle,
  BarChart2, TrendingUp, Building, Crown, Sparkles
} from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import type { Screen } from '../../types';

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

interface PartnerScreenConfig {
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

interface ScreenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  screen: Screen | null;
  performance?: ScreenPerformance;
  config?: PartnerScreenConfig;
}

export function ScreenDetailModal({ 
  isOpen, 
  onClose, 
  screen,
  performance,
  config
}: ScreenDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'commercial' | 'enriched'>('overview');

  if (!screen) return null;

  const getConnectionTypeDisplay = (type: string) => {
    switch (type) {
      case 'shareflow-screen': return 'Shareflow Screen';
      case 'broadsign': return 'Broadsign';
      case 'latinad': return 'LatinAd';
      case 'api': return 'API Integrada';
      default: return 'Manual';
    }
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

  const getConnectivityIcon = (connectivity: string) => {
    switch (connectivity) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-600" />;
      case 'limited': return <Signal className="w-4 h-4 text-yellow-600" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-600" />;
      default: return <WifiOff className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlaybackIcon = (status: string) => {
    switch (status) {
      case 'playing': return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <PauseCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
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
            className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
              <img
                src={screen.image}
                alt={screen.name}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {screen.name}
                    </h2>
                    <div className="flex items-center gap-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{screen.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getConnectionIcon(config?.connectionType || 'manual')}
                        <span>{getConnectionTypeDisplay(config?.connectionType || 'manual')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {performance && (
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${getHealthColor(performance.health.status)}`}>
                      {performance.health.status === 'excellent' ? 'Excelente' :
                       performance.health.status === 'good' ? 'Bueno' :
                       performance.health.status === 'fair' ? 'Regular' :
                       performance.health.status === 'poor' ? 'Pobre' : 'Desconectado'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Resumen General
                </button>
                <button
                  className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === 'technical'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('technical')}
                >
                  Estado Técnico
                </button>
                <button
                  className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === 'commercial'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('commercial')}
                >
                  Datos Comerciales
                </button>
                {(screen as any).enrichedData && (
                  <button
                    className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                      activeTab === 'enriched'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab('enriched')}
                  >
                    Datos Enriquecidos API
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <Card.Body className="text-center p-4">
                        <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                          {(screen.views.daily / 1000).toFixed(1)}k
                        </div>
                        <div className="text-sm text-gray-600">Vistas/día</div>
                      </Card.Body>
                    </Card>
                    
                    <Card>
                      <Card.Body className="text-center p-4">
                        <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                          {screen.rating}
                        </div>
                        <div className="text-sm text-gray-600">{screen.reviews} reseñas</div>
                      </Card.Body>
                    </Card>
                    
                    {performance && (
                      <>
                        <Card>
                          <Card.Body className="text-center p-4">
                            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">
                              ${(performance.revenue.monthly / 1000000).toFixed(1)}M
                            </div>
                            <div className="text-sm text-gray-600">Ingresos/mes</div>
                          </Card.Body>
                        </Card>
                        
                        <Card>
                          <Card.Body className="text-center p-4">
                            <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">
                              {performance.health.uptime.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Uptime</div>
                          </Card.Body>
                        </Card>
                      </>
                    )}
                  </div>

                  {/* Basic Info */}
                  <Card>
                    <Card.Body>
                      <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Tipo de Pantalla</label>
                            <div className="text-base text-gray-900">{screen.category.name}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Resolución</label>
                            <div className="text-base text-gray-900">{screen.specs.width}x{screen.specs.height}px ({screen.specs.resolution})</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Brillo</label>
                            <div className="text-base text-gray-900">{screen.specs.brightness}</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Disponibilidad</label>
                            <div className={`text-base font-medium ${screen.availability ? 'text-green-600' : 'text-red-600'}`}>
                              {screen.availability ? 'Disponible' : 'No disponible'}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Ambiente</label>
                            <div className="text-base text-gray-900 capitalize">{screen.environment}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Horario</label>
                            <div className="text-base text-gray-900">
                              {screen.operatingHours.start} - {screen.operatingHours.end}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {activeTab === 'technical' && performance && (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <Card>
                    <Card.Body>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Estado de Conexión
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          {getConnectivityIcon(performance.health.connectivity)}
                          <div>
                            <div className="text-sm text-gray-600">Internet</div>
                            <div className="font-medium capitalize">{performance.health.connectivity}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getPlaybackIcon(performance.realTimeHealth?.playbackStatus || 'idle')}
                          <div>
                            <div className="text-sm text-gray-600">Reproducción</div>
                            <div className="font-medium">
                              {performance.realTimeHealth?.playbackStatus === 'playing' ? 'Activa' :
                               performance.realTimeHealth?.playbackStatus === 'paused' ? 'Pausada' :
                               performance.realTimeHealth?.playbackStatus === 'error' ? 'Error' : 'Inactiva'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Último heartbeat</div>
                          <div className="font-medium text-xs">
                            {performance.realTimeHealth?.lastHeartbeat 
                              ? new Date(performance.realTimeHealth.lastHeartbeat).toLocaleString()
                              : 'No disponible'}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* System Metrics */}
                  {performance.realTimeHealth && (
                    <Card>
                      <Card.Body>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Cpu className="w-5 h-5" />
                          Métricas del Sistema
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">CPU</span>
                                <span className="text-sm font-medium">{performance.realTimeHealth.cpuUsage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${performance.realTimeHealth.cpuUsage}%` }}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Disco</span>
                                <span className="text-sm font-medium">{performance.realTimeHealth.diskSpace.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${performance.realTimeHealth.diskSpace}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Temperatura</span>
                              <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">{performance.realTimeHealth.temperature.toFixed(1)}°C</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Tiempo de respuesta</span>
                              <span className="font-medium">{performance.realTimeHealth.responseTime.toFixed(0)}ms</span>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Uptime Stats */}
                  <Card>
                    <Card.Body>
                      <h3 className="text-lg font-semibold mb-4">Estadísticas de Disponibilidad</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {performance.realTimeHealth?.uptimeToday?.toFixed(1) || '0'}%
                          </div>
                          <div className="text-sm text-gray-600">Uptime Hoy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {performance.realTimeHealth?.totalUptime?.toFixed(1) || '0'}%
                          </div>
                          <div className="text-sm text-gray-600">Uptime Total</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            performance.realTimeHealth?.alertLevel === 'healthy' ? 'text-green-600' :
                            performance.realTimeHealth?.alertLevel === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {performance.realTimeHealth?.alertLevel === 'healthy' ? '✓' :
                             performance.realTimeHealth?.alertLevel === 'warning' ? '⚠️' : '❌'}
                          </div>
                          <div className="text-sm text-gray-600">Estado</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {activeTab === 'commercial' && (
                <div className="space-y-6">
                  {/* Revenue Performance */}
                  {performance && (
                    <Card>
                      <Card.Body>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          Rendimiento de Ingresos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              ${(performance.revenue.daily / 1000).toFixed(1)}K
                            </div>
                            <div className="text-sm text-gray-600">Diario</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              ${(performance.revenue.weekly / 1000).toFixed(1)}K
                            </div>
                            <div className="text-sm text-gray-600">Semanal</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              ${(performance.revenue.monthly / 1000000).toFixed(1)}M
                            </div>
                            <div className="text-sm text-gray-600">Mensual</div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Pricing Configuration */}
                  {config && (
                    <Card>
                      <Card.Body>
                        <h3 className="text-lg font-semibold mb-4">Configuración de Precios</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Precios automáticos</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              config.automatedPricing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {config.automatedPricing ? 'Activado' : 'Desactivado'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-600">Precio mínimo</label>
                              <div className="text-lg font-semibold">${config.minPrice.toLocaleString()} COP</div>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Precio máximo</label>
                              <div className="text-lg font-semibold">${config.maxPrice.toLocaleString()} COP</div>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Available Packages */}
                  {config && (
                    <Card>
                      <Card.Body>
                        <h3 className="text-lg font-semibold mb-4">Paquetes Disponibles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(config.packages).map(([key, pkg]: [string, any]) => (
                            <div 
                              key={key}
                              className={`p-4 rounded-lg border-2 ${
                                pkg.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium capitalize">{key}</h4>
                                {pkg.enabled ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${pkg.price.toLocaleString()} COP
                                {'spots' in pkg && ` • ${pkg.spots} spots`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'enriched' && (screen as any).enrichedData && (
                <div className="space-y-6">
                  {/* API Data Overview */}
                  <Card>
                    <Card.Body>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Datos API Enriquecidos
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800">
                          Esta pantalla cuenta con integración API que proporciona datos en tiempo real
                          desde el sistema {getConnectionTypeDisplay(config?.connectionType || 'api')}.
                        </p>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Render enriched data if available */}
                  {(screen as any).enrichedData && (
                    <>
                      {/* Inventory Data */}
                      <Card>
                        <Card.Body>
                          <h3 className="text-lg font-semibold mb-4">Datos de Inventario</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Disponibilidad</div>
                              <div className="text-2xl font-bold text-green-600">
                                {(screen as any).enrichedData.inventoryData?.currentAvailability?.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Slots disponibles</div>
                              <div className="text-2xl font-bold text-blue-600">
                                {(screen as any).enrichedData.inventoryData?.availableSlots}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Share of Voice</div>
                              <div className="text-2xl font-bold text-purple-600">
                                {(screen as any).enrichedData.inventoryData?.availableSOV?.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>

                      {/* Audience Data */}
                      <Card>
                        <Card.Body>
                          <h3 className="text-lg font-semibold mb-4">Datos de Audiencia</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Audiencia Actual</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Espectadores:</span>
                                  <span className="font-medium">{(screen as any).enrichedData.audienceData?.current?.viewerCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tiempo atención:</span>
                                  <span className="font-medium">{(screen as any).enrichedData.audienceData?.current?.attentionTime}s</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Engagement:</span>
                                  <span className="font-medium text-green-600">
                                    {(screen as any).enrichedData.audienceData?.current?.engagementScore}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Datos Históricos</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Promedio espectadores:</span>
                                  <span className="font-medium">{(screen as any).enrichedData.audienceData?.historical?.averageViewers}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pico espectadores:</span>
                                  <span className="font-medium">{(screen as any).enrichedData.audienceData?.historical?.peakViewers}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Horas pico:</span>
                                  <span className="font-medium">{(screen as any).enrichedData.audienceData?.historical?.peakHours}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Última actualización: {new Date().toLocaleString()}
                </div>
                <Button
                  onClick={onClose}
                  variant="primary"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 