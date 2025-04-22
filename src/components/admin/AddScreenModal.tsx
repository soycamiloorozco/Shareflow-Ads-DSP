import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, X, MapPin, Users, AlertCircle, Image as ImageIcon,
  Monitor, Clock, DollarSign, Info, Settings, Bot, TrendingUp,
  Sparkles, Calendar, Target, Eye, Mail, Phone, Plus
} from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { LocationInput } from './LocationInput';
import { ConnectScreenDevice } from './ConnectScreenDevice';
import Select from 'react-select';
import { format } from 'date-fns';

interface AddScreenModalProps {
  onClose: () => void;
  onSave: (screenData: {
    name: string;
    location: string;
    category: string;
    specs: {
      width: number;
      height: number;
      resolution: string;
      brightness: string;
    };
    operatingHours: {
      start: string;
      end: string;
      daysActive: string[];
      excludedDates: string[];
    };
    pricing: {
      allowMoments: boolean;
      momentPrice: number;
      allowProgrammatic: boolean;
      programmaticBasePrice: number;
      deviceId?: string;
      bundles: {
        hourly?: { enabled: boolean; price: number; spots: number };
        daily?: { enabled: boolean; price: number; spots: number };
        weekly?: { enabled: boolean; price: number; spots: number };
        monthly?: { enabled: boolean; price: number; spots: number };
      };
    };
    photos: string[];
    coordinates: { lat: number; lng: number };
    contactEmail?: string;
    contactWhatsapp?: string;
  }) => void;
}

interface PhotoUpload {
  id: string;
  file: File;
  preview: string;
}

const weekDays = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves',
  'Viernes', 'Sábado', 'Domingo'
];

const categories = [
  { value: 'fpc', label: 'FPC', description: 'Pantallas LED en estadios de fútbol profesional' },
  { value: 'digital-billboards', label: 'Vallas Digitales', description: 'Pantallas LED de gran formato en ubicaciones premium' },
  { value: 'malls', label: 'Centro Comercial', description: 'Pantallas digitales en los principales centros comerciales' },
  { value: 'info-points', label: 'Puntos de Información', description: 'Kioscos digitales interactivos' }
];

export function AddScreenModal({ onClose, onSave }: AddScreenModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    specs: {
      width: 1920,
      height: 1080,
      resolution: '4K',
      brightness: '5000 nits'
    },
    operatingHours: {
      start: '06:00',
      end: '22:00',
      daysActive: [] as string[],
      excludedDates: [] as string[]
    },
    pricing: {
      allowMoments: false,
      momentPrice: 8,
      allowProgrammatic: false,
      programmaticBasePrice: 5,
      deviceId: '',
      bundles: {
        hourly: { enabled: false, price: 0, spots: 0 },
        daily: { enabled: false, price: 0, spots: 0 },
        weekly: { enabled: false, price: 0, spots: 0 },
        monthly: { enabled: false, price: 0, spots: 0 }
      }
    },
    coordinates: { lat: 6.2442, lng: -75.5812 },
    contactEmail: '',
    contactWhatsapp: ''
  });

  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAddingExcludedDate, setIsAddingExcludedDate] = useState(false);
  const [newExcludedDate, setNewExcludedDate] = useState('');

  const handleMomentsOrProgrammaticToggle = (field: 'allowMoments' | 'allowProgrammatic', enabled: boolean) => {
    if (enabled && !formData.pricing.deviceId) {
      setIsConnectModalOpen(true);
    }
    setFormData(prev => ({
      ...prev,
      pricing: { 
        ...prev.pricing,
        [field]: enabled
      }
    }));
  };

  const handlePhotoUpload = (files: File[]) => {
    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    setPhotoError(null);
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const updatedPhotos = prev.filter(p => p.id !== photoId);
      const removedPhoto = prev.find(p => p.id === photoId);
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.preview);
      }
      return updatedPhotos;
    });
  };

  const handleAddExcludedDate = () => {
    if (newExcludedDate && !formData.operatingHours.excludedDates.includes(newExcludedDate)) {
      setFormData(prev => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          excludedDates: [...prev.operatingHours.excludedDates, newExcludedDate].sort()
        }
      }));
      setNewExcludedDate('');
      setIsAddingExcludedDate(false);
    }
  };

  const handleRemoveExcludedDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        excludedDates: prev.operatingHours.excludedDates.filter(d => d !== date)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      setPhotoError('Debes subir al menos una foto de la pantalla');
      return;
    }

    const photoPromises = photos.map(photo => 
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(photo.file);
      })
    );

    try {
      const photoBase64 = await Promise.all(photoPromises);
      onSave({
        ...formData,
        photos: photoBase64
      });
    } catch (error) {
      setPhotoError('Error al procesar las fotos');
    }
  };

  const handleDeviceConnect = (deviceId: string) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        deviceId
      }
    }));
    setIsConnectModalOpen(false);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        daysActive: prev.operatingHours.daysActive.includes(day)
          ? prev.operatingHours.daysActive.filter(d => d !== day)
          : [...prev.operatingHours.daysActive, day]
      }
    }));
  };

  return (
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
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Añadir Pantalla</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Información Básica
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre de la Pantalla
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Categoría
                </label>
                <Select
                  options={categories}
                  value={categories.find(c => c.value === formData.category)}
                  onChange={(option) => setFormData(prev => ({
                    ...prev,
                    category: option?.value || ''
                  }))}
                  className="text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Ubicación
              </label>
              <LocationInput
                value={formData.location}
                onChange={(address, coordinates) => setFormData(prev => ({
                  ...prev,
                  location: address,
                  coordinates: coordinates || prev.coordinates
                }))}
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Especificaciones Técnicas
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Resolución
                </label>
                <Select
                  options={[
                    { value: 'HD', label: 'HD (1280x720)' },
                    { value: 'FHD', label: 'Full HD (1920x1080)' },
                    { value: '4K', label: '4K (3840x2160)' }
                  ]}
                  value={{ value: formData.specs.resolution, label: formData.specs.resolution }}
                  onChange={(option) => setFormData(prev => ({
                    ...prev,
                    specs: { ...prev.specs, resolution: option?.value || '4K' }
                  }))}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Brillo
                </label>
                <input
                  type="text"
                  value={formData.specs.brightness}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specs: { ...prev.specs, brightness: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: 5000 nits"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ancho (px)
                </label>
                <input
                  type="number"
                  value={formData.specs.width}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specs: { ...prev.specs, width: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Alto (px)
                </label>
                <input
                  type="number"
                  value={formData.specs.height}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specs: { ...prev.specs, height: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Horario de Operación
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={formData.operatingHours.start}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    operatingHours: { ...prev.operatingHours, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={formData.operatingHours.end}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    operatingHours: { ...prev.operatingHours, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Días Activos
              </label>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`
                      p-2 rounded-lg border-2 transition-colors text-center
                      ${formData.operatingHours.daysActive.includes(day)
                        ? 'border-primary bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }
                    `}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Excluded Dates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Fechas Excluidas
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsAddingExcludedDate(true)}
                >
                  Añadir fecha
                </Button>
              </div>

              {isAddingExcludedDate && (
                <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newExcludedDate}
                      onChange={(e) => setNewExcludedDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingExcludedDate(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddExcludedDate}
                      disabled={!newExcludedDate}
                    >
                      Añadir
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {formData.operatingHours.excludedDates.map((date) => (
                  <div
                    key={date}
                    className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span>{format(new Date(date), 'dd/MM/yyyy')}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={() => handleRemoveExcludedDate(date)}
                      className="text-error-600 hover:bg-error-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Configuration */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Configuración de Precios
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Moments Option */}
                <div className="p-4 bg-white rounded-xl border-2 border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.pricing.allowMoments}
                            onChange={(e) => handleMomentsOrProgrammaticToggle('allowMoments', e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                          />
                          <span className="font-medium">Permitir Momentos</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary">Recomendado</span>
                    </div>
                  </div>

                  {formData.pricing.allowMoments && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Precio por Momento (15 segundos)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="number"
                            value={formData.pricing.momentPrice}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              pricing: {
                                ...prev.pricing,
                                momentPrice: parseFloat(e.target.value)
                              }
                            }))}
                            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="8.00"
                            step="0.01"
                            min="0"
                            required={formData.pricing.allowMoments}
                          />
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                          Precio recomendado: $8.00 USD por momento de 15 segundos
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-primary-50 rounded-lg mt-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-primary">
                          Maximiza tus ingresos con Momentos
                        </p>
                        <p className="text-sm text-primary-600 mt-1">
                          Los Momentos permiten a los anunciantes comprar espacios publicitarios 
                          específicos durante eventos importantes. Esta característica puede aumentar 
                          tus ingresos hasta en un 85% durante eventos premium y generar un 200% más 
                          de engagement que la publicidad tradicional.
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-4">
                          <div className="p-2 bg-white rounded-lg text-center">
                            <Eye className="w-4 h-4 text-primary mx-auto mb-1" />
                            <span className="text-xs font-medium text-primary">+85% Visibilidad</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg text-center">
                            <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                            <span className="text-xs font-medium text-primary">+200% Engagement</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg text-center">
                            <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                            <span className="text-xs font-medium text-primary">+65% Ingresos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Programmatic Option */}
                <div className="p-4 bg-white rounded-xl border-2 border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.pricing.allowProgrammatic}
                            onChange={(e) => handleMomentsOrProgrammaticToggle('allowProgrammatic', e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                          />
                          <span className="font-medium">Permitir Compra Programática</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.pricing.allowProgrammatic && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Precio Base por Spot (15 segundos)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="number"
                            value={formData.pricing.programmaticBasePrice}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              pricing: {
                                ...prev.pricing,
                                programmaticBasePrice: parseFloat(e.target.value)
                              }
                            }))}
                            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="5.00"
                            step="0.01"
                            min="0"
                            required={formData.pricing.allowProgrammatic}
                          />
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                          Precio base recomendado: $5.00 USD por spot de 15 segundos
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-primary-50 rounded-lg mt-4">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-primary">
                          Optimiza tus ventas con IA
                        </p>
                        <p className="text-sm text-primary-600 mt-1">
                          La compra programática utiliza inteligencia artificial para optimizar 
                          automáticamente la venta de tu inventario publicitario. Los anunciantes 
                          pueden pujar en tiempo real, maximizando tus ingresos y la ocupación 
                          de tu pantalla.
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-4">
                          <div className="p-2 bg-white rounded-lg text-center">
                            <Bot className="w-4 h-4 text-primary mx-auto mb-1" />
                            <span className="text-xs font-medium text-primary">IA Optimizada</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg text-center">
                            <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                            <span className="text-xs font-medium text-primary">+40% Ocupación</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg text-center">
                            <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                            <span className="text-xs font-medium text-primary">+35% Ingresos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.pricing.deviceId && (
                  <div className="p-4 bg-success-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-success-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-success-600">
                          Pantalla conectada correctamente
                        </p>
                        <p className="text-sm text-success-600">
                          Dispositivo: {formData.pricing.deviceId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Bundles de Tiempo</h4>
                
                {/* Hourly Bundle */}
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.pricing.bundles.hourly?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          bundles: {
                            ...prev.pricing.bundles,
                            hourly: {
                              ...prev.pricing.bundles.hourly!,
                              enabled: e.target.checked
                            }
                          }
                        }
                      }))}
                      className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium">Bundle por Hora</span>
                  </label>

                  {formData.pricing.bundles.hourly?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Precio por Hora
                        </label>
                        <input
                          type="number"
                
                          value={formData.pricing.bundles.hourly.price}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                hourly: {
                                  ...prev.pricing.bundles.hourly!,
                                  price: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.hourly.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Spots por Hora
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.bundles.hourly.spots}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                hourly: {
                                  ...prev.pricing.bundles.hourly!,
                                  spots: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.hourly.enabled}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Bundle */}
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.pricing.bundles.daily?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          bundles: {
                            ...prev.pricing.bundles,
                            daily: {
                              ...prev.pricing.bundles.daily!,
                              enabled: e.target.checked
                            }
                          }
                        }
                      }))}
                      className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium">Bundle por Día</span>
                  </label>

                  {formData.pricing.bundles.daily?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Precio por Día
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.bundles.daily.price}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                daily: {
                                  ...prev.pricing.bundles.daily!,
                                  price: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.daily.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Spots por Día
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.bundles.daily.spots}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                daily: {
                                  ...prev.pricing.bundles.daily!,
                                  spots: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.daily.enabled}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Weekly Bundle */}
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.pricing.bundles.weekly?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          bundles: {
                            ...prev.pricing.bundles,
                            weekly: {
                              ...prev.pricing.bundles.weekly!,
                              enabled: e.target.checked
                            }
                          }
                        }
                      }))}
                      className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium">Bundle Semanal</span>
                  </label>

                  {formData.pricing.bundles.weekly?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Precio por Semana
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.bundles.weekly.price}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                weekly: {
                                  ...prev.pricing.bundles.weekly!,
                                  price: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.weekly.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Spots por Semana
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.bundles.weekly.spots}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                weekly: {
                                  ...prev.pricing.bundles.weekly!,
                                  spots: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.weekly.enabled}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly Bundle */}
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.pricing.bundles.monthly?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          bundles: {
                            ...prev.pricing.bundles,
                            monthly: {
                              ...prev.pricing.bundles.monthly!,
                              enabled: e.target.checked
                            }
                          }
                        }
                      }))}
                      className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium">Bundle Mensual</span>
                  </label>

                  {formData.pricing.bundles.monthly?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Precio por Mes
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.bundles.monthly.price}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                monthly: {
                                  ...prev.pricing.bundles.monthly!,
                                  price: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.monthly.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Spots por Mes
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.bundles.monthly.spots}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              bundles: {
                                ...prev.pricing.bundles,
                                monthly: {
                                  ...prev.pricing.bundles.monthly!,
                                  spots: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required={formData.pricing.bundles.monthly.enabled}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {!formData.pricing.deviceId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Correo de contacto
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactEmail: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    WhatsApp del operador
                  </label>
                  <input
                    type="tel"
                    value={formData.contactWhatsapp}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactWhatsapp: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Fotos de la Pantalla
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden group"
                >
                  <img
                    src={photo.preview}
                    alt="Screen preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="aspect-video bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary hover:bg-primary-50 transition-colors cursor-pointer flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handlePhotoUpload(Array.from(e.target.files));
                      }
                    }}
                    multiple
                  />
                  <ImageIcon className="w-8 h-8 text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-600">
                    Añadir foto
                  </span>
                </label>
              )}
            </div>

            {photoError && (
              <p className="text-sm text-error-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {photoError}
              </p>
            )}

            <p className="text-sm text-neutral-500">
              Sube hasta 5 fotos de la pantalla. Las fotos deben mostrar claramente el dispositivo y su ubicación.
            </p>
          </div>
        </form>

        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.location || !formData.category || photos.length === 0}
            >
              Continuar
            </Button>
          </div>
        </div>
      </motion.div>

      <ConnectScreenDevice
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          if (!formData.pricing.deviceId) {
            setFormData(prev => ({
              ...prev,
              pricing: { 
                ...prev.pricing, 
                allowMoments: false,
                allowProgrammatic: false
              }
            }));
          }
        }}
        onConnect={handleDeviceConnect}
      />
    </motion.div>
  );
}