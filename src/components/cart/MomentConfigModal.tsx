import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, DollarSign, Users, Tv, Calendar, MapPin, Info, Check, AlertCircle } from 'lucide-react';
import { CartEvent, SelectedCartMoment } from '../../types/cart';
import { constants } from '../../config/constants';

interface MomentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CartEvent;
  onSave: (selectedMoments: SelectedCartMoment[]) => void;
  initialMoments?: SelectedCartMoment[];
}

export const MomentConfigModal: React.FC<MomentConfigModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  initialMoments = []
}) => {
  const [selectedMoments, setSelectedMoments] = useState<SelectedCartMoment[]>(initialMoments);
  const [errors, setErrors] = useState<string[]>([]);

  // Reset state when modal opens/closes or event changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMoments(initialMoments);
      setErrors([]);
    }
  }, [isOpen, initialMoments, event.id]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Calculate totals and validation
  const calculations = useMemo(() => {
    const totalMoments = selectedMoments.reduce((sum, moment) => sum + moment.quantity, 0);
    const totalPrice = selectedMoments.reduce((sum, moment) => sum + (moment.price * moment.quantity), 0);
    const isValid = totalMoments > 0 && totalMoments <= event.maxMoments;
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    const costPerImpression = totalAudience > 0 ? (totalPrice / totalAudience) * 1000 : 0;

    return {
      totalMoments,
      totalPrice,
      isValid,
      totalAudience,
      costPerImpression,
      remainingMoments: event.maxMoments - totalMoments
    };
  }, [selectedMoments, event]);

  const handleMomentToggle = (momentType: string, price: number) => {
    setSelectedMoments(prev => {
      const existingIndex = prev.findIndex(m => m.moment === momentType);
      
      if (existingIndex >= 0) {
        // Remove moment if it exists
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add moment if we haven't reached the limit
        if (calculations.totalMoments < event.maxMoments) {
          return [...prev, {
            moment: momentType,
            price,
            quantity: 1,
            period: 'FirstHalf' // Default period
          }];
        }
        return prev;
      }
    });
  };

  const handleQuantityChange = (momentType: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setSelectedMoments(prev => {
      return prev.map(moment => {
        if (moment.moment === momentType) {
          const otherMomentsTotal = prev
            .filter(m => m.moment !== momentType)
            .reduce((sum, m) => sum + m.quantity, 0);
          
          const maxAllowed = event.maxMoments - otherMomentsTotal;
          const finalQuantity = Math.min(newQuantity, maxAllowed);
          
          return { ...moment, quantity: finalQuantity };
        }
        return moment;
      });
    });
  };

  const handlePeriodChange = (momentType: string, period: 'FirstHalf' | 'SecondHalf' | 'FullTime') => {
    setSelectedMoments(prev => {
      return prev.map(moment => {
        if (moment.moment === momentType) {
          return { ...moment, period };
        }
        return moment;
      });
    });
  };

  const validateAndSave = () => {
    const newErrors: string[] = [];

    if (selectedMoments.length === 0) {
      newErrors.push('Debes seleccionar al menos un momento publicitario');
    }

    if (calculations.totalMoments > event.maxMoments) {
      newErrors.push(`No puedes seleccionar más de ${event.maxMoments} momentos para este evento`);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(selectedMoments);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                      alt={event.stadiumName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {event.homeTeamName} vs {event.awayTeamName}
                    </h2>
                    <div className="flex items-center gap-4 text-blue-100 text-sm mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.eventDate).toLocaleDateString('es-CO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.eventTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.stadiumName}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Event Stats */}
                <div className="flex items-center gap-6 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.estimatedAttendance?.toLocaleString()} asistentes
                  </span>
                  <span className="flex items-center gap-1">
                    <Tv className="w-4 h-4" />
                    {event.estimatedAttendanceTv?.toLocaleString()} audiencia TV
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Máximo {event.maxMoments} momentos
                  </span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Cerrar configuración"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-200px)]">
            {/* Moment Selection */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecciona momentos publicitarios
                </h3>
                <p className="text-gray-600 text-sm">
                  Elige los momentos específicos donde quieres mostrar tu publicidad durante el evento.
                </p>
              </div>

              {/* Available Moments */}
              <div className="space-y-4">
                {event.moments.map((moment, index) => {
                  const isSelected = selectedMoments.some(m => m.moment === moment.moment);
                  const selectedMoment = selectedMoments.find(m => m.moment === moment.moment);
                  const canAdd = calculations.remainingMoments > 0 || isSelected;

                  return (
                    <MomentCard
                      key={`${moment.moment}-${index}`}
                      moment={moment}
                      isSelected={isSelected}
                      selectedMoment={selectedMoment}
                      canAdd={canAdd}
                      onToggle={() => handleMomentToggle(moment.moment, moment.price)}
                      onQuantityChange={(quantity) => handleQuantityChange(moment.moment, quantity)}
                      onPeriodChange={(period) => handlePeriodChange(moment.moment, period)}
                      formatPrice={formatPrice}
                    />
                  );
                })}
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Errores de configuración:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200">
              <ConfigSummary
                selectedMoments={selectedMoments}
                calculations={calculations}
                event={event}
                formatPrice={formatPrice}
                onSave={validateAndSave}
                onCancel={onClose}
                isValid={calculations.isValid && selectedMoments.length > 0}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Moment Card Component
interface MomentCardProps {
  moment: { moment: string; price: number };
  isSelected: boolean;
  selectedMoment?: SelectedCartMoment;
  canAdd: boolean;
  onToggle: () => void;
  onQuantityChange: (quantity: number) => void;
  onPeriodChange: (period: 'FirstHalf' | 'SecondHalf' | 'FullTime') => void;
  formatPrice: (price: number) => string;
}

const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  isSelected,
  selectedMoment,
  canAdd,
  onToggle,
  onQuantityChange,
  onPeriodChange,
  formatPrice
}) => {
  const getMomentInfo = (momentType: string) => {
    const momentMap: Record<string, { name: string; description: string; icon: React.ReactNode }> = {
      'pre-game': {
        name: 'Pre-partido',
        description: 'Antes del inicio del partido, máxima expectativa',
        icon: <Clock className="w-5 h-5" />
      },
      'first-half': {
        name: 'Primer tiempo',
        description: 'Durante los primeros 45 minutos de juego',
        icon: <Users className="w-5 h-5" />
      },
      'half-time': {
        name: 'Medio tiempo',
        description: 'Descanso entre tiempos, momento de análisis',
        icon: <Clock className="w-5 h-5" />
      },
      'second-half': {
        name: 'Segundo tiempo',
        description: 'Durante los últimos 45 minutos de juego',
        icon: <Users className="w-5 h-5" />
      },
      'post-game': {
        name: 'Post-partido',
        description: 'Después del partido, análisis y celebración',
        icon: <Check className="w-5 h-5" />
      }
    };

    return momentMap[momentType] || {
      name: momentType,
      description: 'Momento publicitario durante el evento',
      icon: <Clock className="w-5 h-5" />
    };
  };

  const momentInfo = getMomentInfo(moment.moment);

  return (
    <div className={`border rounded-xl p-4 transition-all duration-200 ${
      isSelected 
        ? 'border-blue-300 bg-blue-50 shadow-md' 
        : canAdd 
          ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm' 
          : 'border-gray-200 bg-gray-50 opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {momentInfo.icon}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{momentInfo.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{momentInfo.description}</p>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(moment.price)}
              </span>
              <span className="text-sm text-gray-500">por momento</span>
            </div>
          </div>
        </div>

        <button
          onClick={onToggle}
          disabled={!canAdd && !isSelected}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'border-blue-500 bg-blue-500 text-white'
              : canAdd
                ? 'border-gray-300 hover:border-blue-500'
                : 'border-gray-200 cursor-not-allowed'
          }`}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </button>
      </div>

      {/* Configuration Options */}
      {isSelected && selectedMoment && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-blue-200 pt-3 mt-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange(selectedMoment.quantity - 1)}
                  disabled={selectedMoment.quantity <= 1}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{selectedMoment.quantity}</span>
                <button
                  onClick={() => onQuantityChange(selectedMoment.quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={selectedMoment.period}
                onChange={(e) => onPeriodChange(e.target.value as 'FirstHalf' | 'SecondHalf' | 'FullTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="FirstHalf">Primer tiempo</option>
                <option value="SecondHalf">Segundo tiempo</option>
                <option value="FullTime">Tiempo completo</option>
              </select>
            </div>
          </div>

          {/* Subtotal */}
          <div className="mt-3 p-2 bg-blue-100 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-700">Subtotal:</span>
              <span className="font-semibold text-blue-900">
                {formatPrice(selectedMoment.price * selectedMoment.quantity)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Config Summary Component
interface ConfigSummaryProps {
  selectedMoments: SelectedCartMoment[];
  calculations: {
    totalMoments: number;
    totalPrice: number;
    isValid: boolean;
    totalAudience: number;
    costPerImpression: number;
    remainingMoments: number;
  };
  event: CartEvent;
  formatPrice: (price: number) => string;
  onSave: () => void;
  onCancel: () => void;
  isValid: boolean;
}

const ConfigSummary: React.FC<ConfigSummaryProps> = ({
  selectedMoments,
  calculations,
  event,
  formatPrice,
  onSave,
  onCancel,
  isValid
}) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de configuración</h3>
      
      {/* Selected Moments */}
      <div className="flex-1 overflow-y-auto">
        {selectedMoments.length > 0 ? (
          <div className="space-y-3 mb-6">
            {selectedMoments.map((moment, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{moment.moment}</h4>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(moment.price * moment.quantity)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Cantidad: {moment.quantity}</div>
                  <div>Período: {moment.period}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Selecciona momentos para ver el resumen</p>
          </div>
        )}

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Momentos seleccionados:</span>
            <span className="font-medium">
              {calculations.totalMoments} / {event.maxMoments}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Audiencia total:</span>
            <span className="font-medium">
              {calculations.totalAudience.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">CPM estimado:</span>
            <span className="font-medium">
              ${calculations.costPerImpression.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-lg text-gray-900">
              {formatPrice(calculations.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <button
          onClick={onSave}
          disabled={!isValid}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {isValid ? 'Guardar configuración' : 'Selecciona al menos un momento'}
        </button>
        
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default MomentConfigModal;