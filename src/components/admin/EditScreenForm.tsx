import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, MapPin, Users, AlertCircle, Image as ImageIcon,
  Monitor, Clock, DollarSign, Info, Settings, Bot, TrendingUp,
  Sparkles, Calendar, Target, Eye, Mail, Phone, HelpCircle,
  Plus, CalendarOff
} from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { LocationInput } from './LocationInput';
import { ConnectScreenDevice } from './ConnectScreenDevice';
import Select, { components } from 'react-select';
import { useDropzone } from 'react-dropzone';
import { Tooltip } from '../Tooltip';
import { format } from 'date-fns';

interface EditScreenFormProps {
  screen?: {
    id: string;
    name: string;
    location: string;
    category: string;
    images: string[];
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
      excludedDates?: string[];
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
    metrics: {
      dailyTraffic: number;
      monthlyTraffic: number;
      averageEngagement: number;
    };
    contactEmail?: string;
    contactWhatsapp?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
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

// Custom Menu component for Select
const Menu = (props: any) => {
  return (
    <components.Menu {...props}>
      {props.children}
      <div className="p-2 border-t border-neutral-200">
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          fullWidth
          onClick={() => props.selectProps.onCreateCategory()}
        >
          Añadir categoría
        </Button>
      </div>
    </components.Menu>
  );
};

export function EditScreenForm({ screen, onSubmit, onCancel }: EditScreenFormProps) {
  const [formData, setFormData] = useState({
    name: screen?.name || '',
    location: screen?.location || '',
    category: screen?.category || '',
    specs: {
      width: screen?.specs.width || 1920,
      height: screen?.specs.height || 1080,
      resolution: screen?.specs.resolution || '4K',
      brightness: screen?.specs.brightness || '5000 nits'
    },
    operatingHours: {
      start: screen?.operatingHours.start || '06:00',
      end: screen?.operatingHours.end || '22:00',
      daysActive: screen?.operatingHours.daysActive || [],
      excludedDates: screen?.operatingHours.excludedDates || []
    },
    pricing: {
      allowMoments: screen?.pricing.allowMoments || false,
      momentPrice: screen?.pricing.momentPrice || 8,
      allowProgrammatic: screen?.pricing.allowProgrammatic || false,
      programmaticBasePrice: screen?.pricing.programmaticBasePrice || 5,
      deviceId: screen?.pricing.deviceId || '',
      bundles: {
        hourly: screen?.pricing.bundles.hourly || { enabled: false, price: 0, spots: 0 },
        daily: screen?.pricing.bundles.daily || { enabled: false, price: 0, spots: 0 },
        weekly: screen?.pricing.bundles.weekly || { enabled: false, price: 0, spots: 0 },
        monthly: screen?.pricing.bundles.monthly || { enabled: false, price: 0, spots: 0 }
      }
    },
    metrics: {
      dailyTraffic: screen?.metrics.dailyTraffic || 0,
      monthlyTraffic: screen?.metrics.monthlyTraffic || 0,
      averageEngagement: screen?.metrics.averageEngagement || 0
    },
    contactEmail: screen?.contactEmail || '',
    contactWhatsapp: screen?.contactWhatsapp || ''
  });

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ value: '', label: '', description: '' });
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [isAddingExcludedDate, setIsAddingExcludedDate] = useState(false);
  const [newExcludedDate, setNewExcludedDate] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const newPhotos = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  });

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

  const handleCreateCategory = () => {
    setIsAddingCategory(true);
  };

  const handleSaveNewCategory = () => {
    if (newCategory.value && newCategory.label) {
      setCategoryOptions(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category: newCategory.value }));
      setIsAddingCategory(false);
      setNewCategory({ value: '', label: '', description: '' });
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <Card.Body>
          <h2 className="text-lg font-semibold mb-6">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre de la Pantalla
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Ubicación
              </label>
              <LocationInput
                value={formData.location}
                onChange={(address) => setFormData({
                  ...formData,
                  location: address
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Categoría
              </label>
              {isAddingCategory ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="ID de categoría"
                    value={newCategory.value}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Nombre de categoría"
                    value={newCategory.label}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Descripción"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingCategory(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNewCategory}
                      disabled={!newCategory.value || !newCategory.label}
                    >
                      Guardar Categoría
                    </Button>
                  </div>
                </div>
              ) : (
                <Select
                  options={categoryOptions}
                  value={categoryOptions.find(c => c.value === formData.category)}
                  onChange={(option) => setFormData({ ...formData, category: option?.value || '' })}
                  className="text-sm"
                  components={{ Menu }}
                  onCreateCategory={handleCreateCategory}
                />
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Imágenes
            </label>
            <div {...getRootProps()} className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Máximo 5 imágenes en formato JPG o PNG
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Operating Hours */}
      <Card>
        <Card.Body>
          <h2 className="text-lg font-semibold mb-6">Horario de Operación</h2>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={formData.operatingHours.start}
                onChange={(e) => setFormData({
                  ...formData,
                  operatingHours: { ...formData.operatingHours, start: e.target.value }
                })}
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
                onChange={(e) => setFormData({
                  ...formData,
                  operatingHours: { ...formData.operatingHours, end: e.target.value }
                })}
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
                  onClick={() => {
                    const days = formData.operatingHours.daysActive;
                    const dayIndex = days.indexOf(day);
                    if (dayIndex === -1) {
                      setFormData({
                        ...formData,
                        operatingHours: {
                          ...formData.operatingHours,
                          daysActive: [...days, day]
                        }
                      });
                    } else {
                      days.splice(dayIndex, 1);
                      setFormData({
                        ...formData,
                        operatingHours: {
                          ...formData.operatingHours,
                          daysActive: [...days]
                        }
                      });
                    }
                  }}
                  className={`
                    p-2 rounded-lg border-2 text-center transition-colors
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
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
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
                    <CalendarOff className="w-4 h-4 text-neutral-400" />
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
        </Card.Body>
      </Card>

      {/* Pricing Configuration */}
      <Card>
        <Card.Body>
          <h2 className="text-lg font-semibold mb-6">Configuración de Precios</h2>
          
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
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              allowMoments: e.target.checked
                            }
                          }))}
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
                        tus ingresos hasta en un 85% durante eventos premium.
                      </p>
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
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              allowProgrammatic: e.target.checked
                            }
                          }))}
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Bundles */}
            <div className="space-y-4">
              <h3 className="font-medium">Bundles de Tiempo</h3>
              
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
        </Card.Body>
      </Card>

      {/* Contact Information */}
      {!formData.pricing.deviceId && (
        <Card>
          <Card.Body>
            <h2 className="text-lg font-semibold mb-6">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </Card.Body>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="lg"
          type="submit"
        >
          Guardar Cambios
        </Button>
      </div>

      {/* Connect Screen Modal */}
      <ConnectScreenDevice
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleDeviceConnect}
      />
    </form>
  );
}