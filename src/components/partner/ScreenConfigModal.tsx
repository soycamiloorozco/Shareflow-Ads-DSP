import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings, Monitor, Globe, Bot, User, Timer, Clock, 
  Calendar, Package2, DollarSign, TrendingUp, Zap, Shield,
  CheckCircle, XCircle, AlertCircle, Info, Save, ToggleLeft,
  ToggleRight, Wifi, WifiOff, Signal, PlayCircle, PauseCircle,
  Eye, EyeOff, Smartphone, Tablet, ExternalLink, RefreshCw,
  Target
} from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Screen } from '../../types';
import toast from 'react-hot-toast';
import { ScreenType } from '../../hooks/useScreen';

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

interface ScreenConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  screen: ScreenType | null;
  config: ScreenConfig | null;
  onSave: (config: ScreenConfig) => void;
}

export function ScreenConfigModal({ 
  isOpen, 
  onClose, 
  screen, 
  config, 
  onSave 
}: ScreenConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'connection' | 'pricing' | 'packages' | 'visibility'>('connection');
  const [formData, setFormData] = useState<ScreenConfig>(
    config || {
      id: screen?.id || '',
      connectionType: 'manual',
      isListed: true,
      packages: {
        moments: { enabled: true, price: 25000 },
        hourly: { enabled: true, price: 35000, spots: 12 },
        daily: { enabled: true, price: 180000, spots: 48 },
        weekly: { enabled: false, price: 950000, spots: 200 },
        monthly: { enabled: false, price: 3200000, spots: 720 }
      },
      automatedPricing: false,
      minPrice: 15000,
      maxPrice: 80000
    }
  );
  
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !screen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      toast.success('Configuración guardada exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al guardar la configuración');
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

  const getConnectionStatusColor = () => {
    switch (formData.connectionType) {
      case 'shareflow-screen': return 'text-green-600 bg-green-100';
      case 'api': return 'text-blue-600 bg-blue-100';
      case 'manual': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectionIcon = () => {
    switch (formData.connectionType) {
      case 'shareflow-screen': return <Wifi className="w-5 h-5" />;
      case 'api': return <Signal className="w-5 h-5" />;
      case 'manual': return <WifiOff className="w-5 h-5" />;
      default: return <WifiOff className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
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
          className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Configuración de Pantalla</h2>
                  <p className="text-gray-600">{screen.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusColor()}`}>
                  <div className="flex items-center gap-2">
                    {getConnectionIcon()}
                    {formData.connectionType === 'shareflow-screen' ? 'Shareflow Screen' :
                     formData.connectionType === 'api' ? 'API Conectada' : 'Manual'}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'connection', label: 'Conexión', icon: Wifi },
                { id: 'pricing', label: 'Precios', icon: DollarSign },
                { id: 'packages', label: 'Paquetes', icon: Package2 },
                { id: 'visibility', label: 'Visibilidad', icon: Eye }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`px-6 py-4 font-medium text-sm border-b-2 flex items-center gap-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab(id as any)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'connection' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tipo de Conexión</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        type: 'shareflow-screen',
                        title: 'Shareflow Screen',
                        description: 'Hardware dedicado con gestión automática',
                        icon: Wifi
                      },
                      {
                        type: 'api',
                        title: 'API Integrada',
                        description: 'Conexión mediante API personalizada',
                        icon: Signal
                      },
                      {
                        type: 'manual',
                        title: 'Gestión Manual',
                        description: 'Administración manual de contenidos',
                        icon: WifiOff
                      }
                    ].map((option) => (
                      <Card
                        key={option.type}
                        className={`cursor-pointer transition-all ${
                          formData.connectionType === option.type
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, connectionType: option.type as any }))}
                      >
                        <Card.Body className="p-4 text-center">
                          <option.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                          <h4 className="font-semibold mb-2">{option.title}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>

                {formData.connectionType === 'shareflow-screen' && (
                  <Card className="bg-blue-50 border-blue-200">
                    <Card.Body className="p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">Shareflow Screen</h4>
                          <p className="text-blue-800 mb-3">
                            Para conectar tu pantalla con Shareflow Screen, necesitarás nuestro hardware especializado.
                            Este dispositivo se conecta directamente a tu pantalla y permite gestión completa desde la plataforma.
                          </p>
                          <div className="flex gap-3">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Solicitar Hardware
                            </Button>
                            <Button size="sm" variant="outline">
                              Ver Guía de Instalación
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Estrategia de Precios</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Precio automático</span>
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
                    </div>
                  </div>

                  {formData.automatedPricing ? (
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                      <Card.Body className="p-4">
                        <div className="flex items-start gap-3">
                          <Bot className="w-6 h-6 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-2">Precios Inteligentes con IA</h4>
                            <p className="text-blue-800 mb-4">
                              Nuestro algoritmo ajusta automáticamente los precios basándose en demanda, ubicación, 
                              horarios pico y competencia para maximizar tus ingresos.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">
                                  Precio Mínimo
                                </label>
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
                                <label className="block text-sm font-medium text-blue-900 mb-1">
                                  Precio Máximo
                                </label>
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

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-green-700">+15% ingresos promedio</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-600" />
                                <span className="text-yellow-700">Ajustes en tiempo real</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Card>
                      <Card.Body className="p-4">
                        <div className="flex items-start gap-3">
                          <User className="w-6 h-6 text-gray-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">Precios Manuales</h4>
                            <p className="text-gray-600 mb-4">
                              Configura manualmente los precios de cada paquete según tu estrategia comercial.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-yellow-800">
                                  Los precios manuales pueden generar menos ingresos que la optimización automática.
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Paquetes de Publicidad</h3>
                  <p className="text-gray-600 mb-6">
                    Configura qué tipos de paquetes publicitarios están disponibles para tu pantalla.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'moments',
                        title: 'Momentos',
                        description: 'Publicaciones instantáneas de 10 segundos',
                        icon: Timer,
                        color: 'purple',
                        defaultPrice: 25000,
                        unit: 'por momento'
                      },
                      {
                        key: 'hourly',
                        title: 'Por Horas',
                        description: 'Espacios publicitarios por horas específicas',
                        icon: Clock,
                        color: 'blue',
                        defaultPrice: 35000,
                        unit: 'por hora'
                      },
                      {
                        key: 'daily',
                        title: 'Por Días',
                        description: 'Paquetes de día completo',
                        icon: Calendar,
                        color: 'green',
                        defaultPrice: 180000,
                        unit: 'por día'
                      },
                      {
                        key: 'weekly',
                        title: 'Por Semanas',
                        description: 'Paquetes semanales con descuento',
                        icon: Calendar,
                        color: 'orange',
                        defaultPrice: 950000,
                        unit: 'por semana'
                      },
                      {
                        key: 'monthly',
                        title: 'Por Meses',
                        description: 'Paquetes mensuales para campañas largas',
                        icon: Package2,
                        color: 'red',
                        defaultPrice: 3200000,
                        unit: 'por mes'
                      }
                    ].map((package_info) => {
                      const pkg = formData.packages[package_info.key as keyof typeof formData.packages];
                      const hasSpots = 'spots' in pkg && package_info.key !== 'moments';
                      const pricePerSpot = hasSpots && pkg.spots > 0 ? pkg.price / pkg.spots : 0;
                      
                      return (
                        <Card key={package_info.key} className={`${
                          pkg.enabled ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}>
                          <Card.Body className="p-4">
                            <div className="space-y-4">
                              {/* Header with title and toggle */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-lg bg-${package_info.color}-100 flex items-center justify-center`}>
                                    <package_info.icon className={`w-6 h-6 text-${package_info.color}-600`} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{package_info.title}</h4>
                                    <p className="text-sm text-gray-600">{package_info.description}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => updatePackage(package_info.key as keyof typeof formData.packages, 'enabled', !pkg.enabled)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    pkg.enabled ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      pkg.enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>

                              {/* Configuration fields when enabled */}
                              {pkg.enabled && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  {!formData.automatedPricing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {/* Price input */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Precio Total
                                        </label>
                                        <div className="relative">
                                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                          <input
                                            type="number"
                                            value={pkg.price}
                                            onChange={(e) => updatePackage(package_info.key as keyof typeof formData.packages, 'price', parseInt(e.target.value) || 0)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                            placeholder={package_info.defaultPrice.toString()}
                                          />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{package_info.unit}</p>
                                      </div>

                                      {/* Spots input (only for packages that have spots) */}
                                      {hasSpots && (
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Spots Disponibles
                                          </label>
                                          <div className="relative">
                                            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                              type="number"
                                              value={(pkg as any).spots}
                                              onChange={(e) => updatePackage(package_info.key as keyof typeof formData.packages, 'spots', parseInt(e.target.value) || 0)}
                                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                              placeholder="12"
                                            />
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">espacios publicitarios</p>
                                        </div>
                                      )}

                                      {/* Price per spot display */}
                                      {hasSpots && (
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Precio por Spot
                                          </label>
                                          <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800 font-medium">
                                            ${pricePerSpot.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">precio por espacio</p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    /* Automated pricing display */
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Precio Estimado
                                        </label>
                                        <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-sm text-blue-800 font-medium">
                                          ${pkg.price.toLocaleString('es-CO')}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{package_info.unit}</p>
                                      </div>

                                      {hasSpots && (
                                        <>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Spots Optimizados
                                            </label>
                                            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-sm text-blue-800 font-medium">
                                              {(pkg as any).spots} spots
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">espacios publicitarios</p>
                                          </div>

                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Precio por Spot
                                            </label>
                                            <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800 font-medium">
                                              ${pricePerSpot.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">precio por espacio</p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  {/* Package insights */}
                                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">
                                        {package_info.key === 'moments' ? 'Duración: 10 segundos por momento' :
                                         package_info.key === 'hourly' ? `Duración: 1 hora (${hasSpots ? (pkg as any).spots : 0} spots de 5 min)` :
                                         package_info.key === 'daily' ? `Duración: 24 horas (${hasSpots ? (pkg as any).spots : 0} spots de 30 min)` :
                                         package_info.key === 'weekly' ? `Duración: 7 días (${hasSpots ? (pkg as any).spots : 0} spots distribuidos)` :
                                         `Duración: 30 días (${hasSpots ? (pkg as any).spots : 0} spots distribuidos)`}
                                      </span>
                                      {hasSpots && pricePerSpot > 0 && (
                                        <span className="font-medium text-blue-600">
                                          {package_info.key === 'hourly' ? `${(pricePerSpot * 12).toLocaleString('es-CO')} $/hora` :
                                           package_info.key === 'daily' ? `${(pricePerSpot * 48).toLocaleString('es-CO')} $/día` :
                                           package_info.key === 'weekly' ? `${(pricePerSpot * (pkg as any).spots).toLocaleString('es-CO')} $/semana` :
                                           `${(pricePerSpot * (pkg as any).spots).toLocaleString('es-CO')} $/mes`}
                                        </span>
                                      )}
                                      {!hasSpots && package_info.key === 'moments' && (
                                        <span className="font-medium text-purple-600">
                                          ${(pkg.price / 10).toFixed(0)} por segundo
                                        </span>
                                      )}
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
            )}

            {activeTab === 'visibility' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Visibilidad en Marketplace</h3>
                  
                  <Card>
                    <Card.Body className="p-4">
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
                    </Card.Body>
                  </Card>

                  {formData.isListed && (
                    <Card>
                      <Card.Body className="p-4">
                        <h4 className="font-semibold mb-3">Información Adicional</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción para el Marketplace
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe las características principales de tu pantalla, ubicación estratégica, audiencia, etc."
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Horario de Operación
                              </label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option>24 horas</option>
                                <option>Horario comercial (8am - 8pm)</option>
                                <option>Horario extendido (6am - 10pm)</option>
                                <option>Personalizado</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Días Activos
                              </label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option>Todos los días</option>
                                <option>Lunes a Viernes</option>
                                <option>Lunes a Sábado</option>
                                <option>Fines de semana</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Los cambios se aplicarán inmediatamente después de guardar
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 