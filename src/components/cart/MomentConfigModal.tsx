import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, Calendar, MapPin, Check, AlertCircle, ArrowLeft,
  Plus, Minus, Play, Pause, Upload, Image as ImageIcon,
  Video, Trash2, Eye, Timer, Target, Zap, Users, Sparkles
} from 'lucide-react';
import { CartEvent, SelectedCartMoment } from '../../types/cart';
import { constants } from '../../config/constants';
import { MomentSelector } from '../MomentSelector';
import CreativityUpload from './CreativityUpload';
import MomentTimeline from './MomentTimeline';
import CreativityPreview from './CreativityPreview';

type GamePeriod = 'FirstHalf' | 'SecondHalf' | 'Halftime';

interface GamePeriodInfo {
  id: GamePeriod;
  name: string;
  description: string;
  maxMinutes: number;
  price: number;
  color: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
  tvAudience: boolean;
}

interface DetailedMoment {
  id: string;
  momentId: string;
  period: GamePeriod;
  minute: number;
  price: number;
  creativity?: File;
  preview?: string;
}

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
  const [detailedMoments, setDetailedMoments] = useState<DetailedMoment[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<GamePeriod>('FirstHalf');
  const [errors, setErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'moments' | 'creativities'>('moments');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define game periods based on event moments
  const gamePeriods: GamePeriodInfo[] = useMemo(() => {
    const periods: GamePeriodInfo[] = [];

    event.moments.forEach(moment => {
      if (moment.moment === 'FirstHalf') {
        periods.push({
          id: 'FirstHalf',
          name: 'Primer Tiempo',
          description: '45 minutos de juego',
          maxMinutes: 45,
          price: moment.price,
          color: 'bg-gradient-to-br from-primary-50 to-primary-100',
          textColor: 'text-primary-800',
          borderColor: 'border-primary-200',
          iconColor: 'text-primary',
          tvAudience: true
        });
      } else if (moment.moment === 'Halftime') {
        periods.push({
          id: 'Halftime',
          name: 'Entre Tiempo',
          description: '15 minutos de descanso',
          maxMinutes: 15,
          price: moment.price,
          color: 'bg-gradient-to-br from-amber-50 to-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          tvAudience: false
        });
      } else if (moment.moment === 'SecondHalf') {
        periods.push({
          id: 'SecondHalf',
          name: 'Segundo Tiempo',
          description: '45 minutos de juego',
          maxMinutes: 45,
          price: moment.price,
          color: 'bg-gradient-to-br from-primary-50 to-primary-100',
          textColor: 'text-primary-800',
          borderColor: 'border-primary-200',
          iconColor: 'text-primary',
          tvAudience: true
        });
      }
    });

    return periods;
  }, [event.moments]);

  // Reset state when modal opens/closes or event changes
  useEffect(() => {
    if (isOpen) {
      // Convert initial moments to detailed moments
      const detailed: DetailedMoment[] = [];
      initialMoments.forEach((moment, index) => {
        // Determine the period based on the moment name if period is not set
        let period: GamePeriod = 'FirstHalf'; // default
        if (moment.period) {
          period = moment.period as GamePeriod;
        } else if (moment.moment.includes('FirstHalf') || moment.moment.includes('Primer')) {
          period = 'FirstHalf';
        } else if (moment.moment.includes('Halftime') || moment.moment.includes('Entre')) {
          period = 'Halftime';
        } else if (moment.moment.includes('SecondHalf') || moment.moment.includes('Segundo')) {
          period = 'SecondHalf';
        }

        // Find the corresponding game period to get max minutes
        const gamePeriod = gamePeriods.find(p => p.id === period);
        const maxMinutes = gamePeriod?.maxMinutes || 45;

        for (let i = 0; i < moment.quantity; i++) {
          detailed.push({
            id: `${moment.moment}-${index}-${i}`,
            momentId: moment.moment,
            period: period,
            minute: Math.floor(Math.random() * maxMinutes) + 1,
            price: moment.price
          });
        }
      });
      setDetailedMoments(detailed);
      setErrors([]);
    }
  }, [isOpen, initialMoments, event.id, gamePeriods]);

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

  // Get current period info
  const currentPeriod = gamePeriods.find(period => period.id === selectedPeriod) || gamePeriods[0];

  // Calculate totals and validation
  const calculations = useMemo(() => {
    const totalMoments = detailedMoments.length;
    const totalPrice = detailedMoments.reduce((sum, moment) => sum + moment.price, 0);
    const isValid = totalMoments > 0 && totalMoments <= event.maxMoments;
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    const costPerImpression = totalAudience > 0 ? totalPrice / totalAudience : 0;

    return {
      totalMoments,
      totalPrice,
      isValid,
      totalAudience,
      costPerImpression,
      remainingMoments: event.maxMoments - totalMoments
    };
  }, [detailedMoments, event]);

  // Add new moment
  const handleAddMoment = useCallback(() => {
    if (calculations.remainingMoments > 0 && currentPeriod) {
      const newMoment: DetailedMoment = {
        id: `${selectedPeriod}-${Date.now()}-${Math.random()}`,
        momentId: selectedPeriod,
        period: selectedPeriod,
        minute: Math.floor(currentPeriod.maxMinutes / 2),
        price: currentPeriod.price
      };
      setDetailedMoments(prev => [...prev, newMoment]);
    }
  }, [calculations.remainingMoments, currentPeriod, selectedPeriod]);

  // Remove moment
  const handleRemoveMoment = useCallback((momentId: string) => {
    setDetailedMoments(prev => prev.filter(moment => moment.id !== momentId));
  }, []);

  // Update moment minute
  const handleMinuteChange = useCallback((momentId: string, minute: number) => {
    setDetailedMoments(prev =>
      prev.map(moment =>
        moment.id === momentId ? { ...moment, minute } : moment
      )
    );
  }, []);

  // Handle file upload for specific moment
  const handleFileUpload = useCallback((momentId: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setDetailedMoments(prev =>
      prev.map(moment =>
        moment.id === momentId
          ? { ...moment, creativity: file, preview }
          : moment
      )
    );
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, momentId?: string) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFile && momentId) {
      handleFileUpload(momentId, validFile);
    }
  }, [handleFileUpload]);

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Calculate CPM for period
  const calculatePeriodCPM = (period: GamePeriodInfo) => {
    const totalAudience = event.estimatedAttendance + (period.tvAudience ? (event.estimatedAttendanceTv || 0) : 0);
    const cpm = totalAudience > 0 ? (period.price / totalAudience) * 1000 : 0;
    return cpm >= 1000 ? `${(cpm / 1000).toFixed(1)}K` : cpm.toFixed(0);
  };



  const validateAndSave = () => {
    if (currentStep === 'moments') {
      const newErrors: string[] = [];

      if (detailedMoments.length === 0) {
        newErrors.push('Debes seleccionar al menos un momento publicitario');
      }

      if (calculations.totalMoments > event.maxMoments) {
        newErrors.push(`No puedes seleccionar más de ${event.maxMoments} momentos para este evento`);
      }

      // Validate that all moments have valid periods and minutes
      detailedMoments.forEach((moment, index) => {
        const period = gamePeriods.find(p => p.id === moment.period);
        if (!period) {
          newErrors.push(`Momento ${index + 1}: Período inválido`);
        } else if (moment.minute < 1 || moment.minute > period.maxMinutes) {
          newErrors.push(`Momento ${index + 1}: Minuto debe estar entre 1 y ${period.maxMinutes}`);
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        return;
      }

      // Move to creativities step
      setCurrentStep('creativities');
      setErrors([]);
    } else {
      // Validate creativities
      const newErrors: string[] = [];

      detailedMoments.forEach(moment => {
        if (!moment.creativity) {
          newErrors.push(`Debes subir una creatividad para el momento en minuto ${moment.minute} del ${gamePeriods.find(p => p.id === moment.period)?.name}`);
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        return;
      }

      // Convert detailed moments back to cart format
      const groupedMoments = detailedMoments.reduce((acc, moment) => {
        const key = moment.period;
        if (!acc[key]) {
          acc[key] = {
            moment: moment.momentId,
            price: moment.price,
            quantity: 0,
            period: moment.period as 'FirstHalf' | 'SecondHalf' | 'Halftime',
            creativities: []
          };
        }
        acc[key].quantity += 1;
        if (moment.creativity) {
          acc[key].creativities!.push(moment.creativity);
        }
        return acc;
      }, {} as { [key: string]: SelectedCartMoment });

      const finalMoments = Object.values(groupedMoments);
      
      // Debug logging
      console.log('Saving moments configuration:', {
        detailedMoments,
        groupedMoments,
        finalMoments,
        event: {
          id: event.id,
          moments: event.moments,
          momentPrices: event.momentPrices
        }
      });
      
      // Ensure we have valid data before saving
      if (finalMoments.length > 0) {
        onSave(finalMoments);
      } else {
        setErrors(['No se pudieron procesar los momentos seleccionados']);
        return;
      }
      onClose();
    }
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
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
                      {new Date(event.eventDate).toLocaleDateString('es-CO')}
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
            {/* Step Indicator */}
            <div className="px-6 py-4 border-b border-gray-200 lg:hidden">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${currentStep === 'moments' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'moments' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Momentos</span>
                </div>
                <div className="w-8 h-px bg-gray-300"></div>
                <div className={`flex items-center ${currentStep === 'creativities' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'creativities' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Creatividades</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              {currentStep === 'moments' ? (
                <div className="h-full flex flex-col">
                  {/* Period Selector */}
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Selecciona momentos específicos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {gamePeriods.map((period) => {
                        const isSelected = selectedPeriod === period.id;
                        const momentsInPeriod = detailedMoments.filter(m => m.period === period.id).length;

                        return (
                          <button
                            key={period.id}
                            onClick={() => setSelectedPeriod(period.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
                                ? `${period.borderColor} ${period.color}`
                                : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-semibold ${isSelected ? period.textColor : 'text-gray-900'}`}>
                                {period.name}
                              </h4>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-white text-primary' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {momentsInPeriod}
                              </div>
                            </div>
                            <p className={`text-sm ${isSelected ? period.textColor : 'text-gray-600'} mb-2`}>
                              {period.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isSelected ? period.textColor : 'text-gray-900'}`}>
                                {formatPrice(period.price)}
                              </span>
                              <span className={`text-xs ${isSelected ? period.textColor : 'text-gray-500'}`}>
                                CPM: ${calculatePeriodCPM(period)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Moment Timeline */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {currentPeriod.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Momentos restantes: {calculations.remainingMoments}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Selecciona los minutos exactos donde quieres mostrar tu publicidad durante {currentPeriod.name.toLowerCase()}
                      </p>
                    </div>

                    {/* Enhanced Timeline */}
                    <div className="mb-8">
                      <MomentTimeline
                        period={currentPeriod}
                        moments={detailedMoments.filter(moment => moment.period === selectedPeriod)}
                        onMomentClick={(momentId) => {
                          // Scroll to moment in list or highlight it
                          const element = document.getElementById(`moment-${momentId}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      />
                    </div>

                    {/* Enhanced Moment Selector - Same UX as EventDetail */}
                    <div className="bg-white border-2 border-primary-200 rounded-2xl shadow-lg overflow-hidden">
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${
                        selectedPeriod === 'FirstHalf' || selectedPeriod === 'SecondHalf' 
                          ? 'from-primary-500 to-primary-600' 
                          : selectedPeriod === 'Halftime' 
                            ? 'from-amber-500 to-amber-600'
                            : 'from-primary-500 to-primary-600'
                      } p-6`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{currentPeriod.name}</h3>
                              <p className="text-white/80 text-sm">{currentPeriod.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/80 text-sm">Precio por momento</p>
                            <p className="text-white font-bold text-lg">
                              {formatPrice(currentPeriod.price)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Moment Selector Content */}
                      <div className="p-6">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">Selecciona los minutos</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {detailedMoments.filter(moment => moment.period === selectedPeriod).length} seleccionados
                              </span>
                              {calculations.remainingMoments <= 3 && calculations.remainingMoments > 0 && (
                                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full font-medium">
                                  {calculations.remainingMoments} restantes
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Haz clic en los minutos donde quieres que aparezca tu anuncio durante {currentPeriod.name.toLowerCase()}.
                          </p>
                        </div>

                        {/* Use the same MomentSelector component */}
                        <MomentSelector
                          momentId={selectedPeriod}
                          momentNumber={1}
                          maxMinutes={currentPeriod.maxMinutes}
                          selectedMinutes={detailedMoments
                            .filter(moment => moment.period === selectedPeriod)
                            .sort((a, b) => a.minute - b.minute)
                            .map(moment => moment.minute)
                          }
                          onMinuteSelect={(index, minute) => {
                            const filteredMoments = detailedMoments
                              .filter(moment => moment.period === selectedPeriod)
                              .sort((a, b) => a.minute - b.minute);
                            if (filteredMoments[index]) {
                              handleMinuteChange(filteredMoments[index].id, minute);
                            }
                          }}
                          onAddMoment={() => {
                            if (calculations.remainingMoments > 0) {
                              handleAddMoment();
                            }
                          }}
                          onRemoveMoment={(index) => {
                            const filteredMoments = detailedMoments
                              .filter(moment => moment.period === selectedPeriod)
                              .sort((a, b) => a.minute - b.minute);
                            if (filteredMoments[index]) {
                              handleRemoveMoment(filteredMoments[index].id);
                            }
                          }}
                        />

                        {/* Summary */}
                        {detailedMoments.filter(moment => moment.period === selectedPeriod).length > 0 && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Momentos seleccionados en {currentPeriod.name}</p>
                                <p className="font-semibold text-gray-800">
                                  Minutos: {detailedMoments
                                    .filter(moment => moment.period === selectedPeriod)
                                    .map(m => m.minute)
                                    .sort((a, b) => a - b)
                                    .join(', ')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Subtotal</p>
                                <p className="font-bold text-primary text-lg">
                                  {formatPrice(detailedMoments
                                    .filter(moment => moment.period === selectedPeriod)
                                    .reduce((sum, m) => sum + m.price, 0)
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {detailedMoments.filter(moment => moment.period === selectedPeriod).length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center"
                      >
                        <div className={`w-16 h-16 rounded-full ${currentPeriod.color} flex items-center justify-center mx-auto mb-4`}>
                          <Timer className={`w-8 h-8 ${currentPeriod.iconColor}`} />
                        </div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          No hay momentos seleccionados para {currentPeriod.name}
                        </h5>
                        <p className="text-sm text-gray-500 mb-6">
                          Agrega momentos específicos donde quieres mostrar tu publicidad durante este período
                        </p>
                        <button
                          onClick={handleAddMoment}
                          disabled={calculations.remainingMoments <= 0}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          <Plus className="w-5 h-5" />
                          Agregar primer momento
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full p-6 overflow-y-auto">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sube tus creatividades
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Arrastra y suelta archivos o haz clic para subir una creatividad para cada momento.
                    </p>
                  </div>

                  {/* Creativities by Period */}
                  <div className="space-y-8">
                    {gamePeriods.map((period) => {
                      const momentsInPeriod = detailedMoments.filter(m => m.period === period.id);
                      if (momentsInPeriod.length === 0) return null;

                      return (
                        <div key={period.id} className="space-y-4">
                          {/* Period Header */}
                          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                            <div className={`w-10 h-10 rounded-lg ${period.color} flex items-center justify-center`}>
                              <Timer className={`w-5 h-5 ${period.iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{period.name}</h4>
                              <p className="text-sm text-gray-600">
                                {momentsInPeriod.length} momento{momentsInPeriod.length !== 1 ? 's' : ''} • {formatPrice(momentsInPeriod.reduce((sum, m) => sum + m.price, 0))}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Sparkles className="w-4 h-4" />
                              <span>
                                {momentsInPeriod.filter(m => m.creativity).length}/{momentsInPeriod.length} listos
                              </span>
                            </div>
                          </div>

                          {/* Timeline Preview */}
                          <MomentTimeline
                            period={period}
                            moments={momentsInPeriod}
                            showPreview={true}
                          />

                          {/* Creativities Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {momentsInPeriod.map((moment) => (
                              <div
                                key={moment.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, moment.id)}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded ${period.color} flex items-center justify-center`}>
                                      <span className="text-xs font-bold text-primary">
                                        {moment.minute}
                                      </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      Minuto {moment.minute}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatPrice(moment.price)}
                                  </span>
                                </div>

                                {/* File Upload/Preview Area */}
                                {moment.creativity && moment.preview ? (
                                  <CreativityPreview
                                    file={moment.creativity}
                                    preview={moment.preview}
                                    momentMinute={moment.minute}
                                    periodName={period.name}
                                    onRemove={() => {
                                      setDetailedMoments(prev =>
                                        prev.map(m =>
                                          m.id === moment.id
                                            ? { ...m, creativity: undefined, preview: undefined }
                                            : m
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  <div
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${isDragging
                                        ? 'border-primary bg-primary-50'
                                        : 'border-gray-300 hover:border-primary hover:bg-primary-50'
                                      }`}
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*,video/*';
                                      input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                          handleFileUpload(moment.id, file);
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">
                                      Arrastra o selecciona
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      PNG, JPG, MP4 (50MB max)
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
            <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>

              <div className="space-y-4">
                {/* Moments by Period */}
                {gamePeriods.map((period) => {
                  const momentsInPeriod = detailedMoments.filter(m => m.period === period.id);
                  if (momentsInPeriod.length === 0) return null;

                  return (
                    <div key={period.id} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-4 h-4 rounded ${period.color}`} />
                        <span className="font-medium text-sm">{period.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {momentsInPeriod.map((moment) => (
                          <div key={moment.id} className="flex justify-between">
                            <span>Minuto {moment.minute}</span>
                            <span>{formatPrice(moment.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Momentos totales:</span>
                    <span className="font-medium">
                      {calculations.totalMoments} / {event.maxMoments}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Audiencia estimada:</span>
                    <span className="font-medium text-sm">
                      {(calculations.totalAudience).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(calculations.totalPrice)}
                    </span>
                  </div>

                  {calculations.totalAudience > 0 && (
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          CPM: ${(calculations.costPerImpression * 1000).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {currentStep === 'creativities' && (
                  <button
                    onClick={() => setCurrentStep('moments')}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a momentos
                  </button>
                )}

                <button
                  onClick={validateAndSave}
                  disabled={!calculations.isValid || detailedMoments.length === 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {currentStep === 'moments' ? 'Continuar a creatividades' : 'Guardar configuración'}
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && draggedFile) {
              // Handle file upload logic here if needed
            }
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default MomentConfigModal;