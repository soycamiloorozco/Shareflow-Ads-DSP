import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Calendar, MapPin, Users, 
  ChevronRight, Info, AlertTriangle, ArrowRight, 
  Trophy, Heart, BarChart3, Flame,
  ShoppingBag, Eye, Zap, Upload, X,
  CreditCard, Check, Image as ImageIcon, Lock,
  Mail, Phone, ChevronLeft,
  Loader2
} from 'lucide-react';
import { Button } from '../components/Button';
import { MomentSelector } from '../components/MomentSelector';
import { SelectedMomentDetails } from '../types';
import { useSportEvents } from '../hooks/useSportEvents';
import { constants } from '../config/constants';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentApi } from '../api/payment';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useMomentPurchases } from '../hooks/useMomentPurchases';
import estadioImage from '../assets/crowd.png';

type GamePeriod = 'FirstHalf' | 'SecondHalf' | 'Halftime';
type FlowStep = 'select-moments' | 'upload-creative' | 'payment' | 'confirmation';

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


const stripePromise = loadStripe('pk_test_51OHbGYHQkntOzh4KeXpPzlQ96Qj9vofFxGAvTfBVR8yKOBsupmAmQisj1wizDfkF543hpjoIOn7UuCPVcndFw4db00BcWQwc7h');

// Componente de formulario de pago
const PaymentForm = ({ onSuccess, onError, amount, selectedMoments }: { onSuccess: (id: any) => void, onError: (error: any) => void, amount: number, selectedMoments: any }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const grouped = Object.values(
        selectedMoments.reduce((acc: any, item: any) => {
          if (!acc[item.id]) {
            acc[item.id] = {
              momentId: item.momentId,
              minutes: [],
              price: item.price
            };
          }
          acc[item.id].minutes.push(item.minute);
          return acc;
        }, {})
      );

      const PurchaseDetails = grouped.map((item: any) => ({
        momentId: item.momentId,
        minutes: item.minutes.join(','),
        price: item.price
      }));

      const data = {
        sportEventId: id ?? "0",
        PurchaseDetails,
        amount,
        currency: 'cop'
      };
      
      const { clientSecret } = await paymentApi.createPaymentIntent(data);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: user?.username,
              email:user?.email, 
            },
          },
        }
      );

      if (stripeError) {
        onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="p-3 bg-white rounded-lg border border-[#B8B8C0]">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        icon={ArrowRight}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Procesando...' : `Pagar ${amount.toLocaleString('es-CO')} COP`}
      </Button>
    </form>
  );
};


export function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { event } = useSportEvents({ id });
    const { purchaseMoments } = useMomentPurchases();
  const [step, setStep] = useState(1);
  const [flowStep, setFlowStep] = useState<FlowStep>('select-moments');
  const [selectedMoments, setSelectedMoments] = useState<SelectedMomentDetails[]>([]);
  const [remainingMoments, setRemainingMoments] = useState(19);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<GamePeriod>('FirstHalf');
  const [recentPurchases, setRecentPurchases] = useState<{name: string, time: Date}[]>([]);
  const [countdownTime, setCountdownTime] = useState(600); // 10 minutes in seconds
  const [showPulse, setShowPulse] = useState(false);
  const [activeViewers, setActiveViewers] = useState(Math.floor(Math.random() * 20) + 30); // 30-50 viewers
  
  // Creative upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    // Update remaining moments when selectedMoments changes
    setRemainingMoments(19 - selectedMoments.length);
  }, [selectedMoments]);

  // Simulate real-time purchases
  useEffect(() => {
    const names = [
      "Juan P.", "María G.", "Carlos R.", "Ana M.", "David S.", 
      "Laura T.", "Andrés V.", "Sofía L.", "Miguel A.", "Valentina Z."
    ];
    
    // Add initial recent purchases
    setRecentPurchases([
      { name: names[Math.floor(Math.random() * names.length)], time: new Date(Date.now() - 1000 * 60 * 2) },
      { name: names[Math.floor(Math.random() * names.length)], time: new Date(Date.now() - 1000 * 60 * 5) }
    ]);
    
    // Simulate new purchases every 20-40 seconds
    const purchaseInterval = setInterval(() => {
      if (remainingMoments > 1) {
        const newPurchase = {
          name: names[Math.floor(Math.random() * names.length)],
          time: new Date()
        };
        
        setRecentPurchases(prev => [newPurchase, ...prev.slice(0, 4)]);
        setRemainingMoments(prev => prev - 1);
        
        // Show pulse animation
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 2000);
      }
    }, Math.random() * 20000 + 20000);
    
    // Update active viewers randomly
    const viewersInterval = setInterval(() => {
      setActiveViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(30, Math.min(50, prev + change));
      });
    }, 5000);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(purchaseInterval);
      clearInterval(viewersInterval);
      clearInterval(countdownInterval);
    };
  }, [remainingMoments]);


  const handlePaymentSuccess = async (paymentId: string) => {
    setLoading(true);
    const grouped = Object.values(
        selectedMoments.reduce((acc: any, item: any) => {
          if (!acc[item.id]) {
            acc[item.id] = {
              momentId: item.momentId,
              minutes: [],
              price: item.price
            };
          }
          acc[item.id].minutes.push(item.minute);
          return acc;
        }, {})
    );
    

    const PurchaseDetails = grouped.map((item: any) => ({
      momentId: item.momentId,
      minutes: item.minutes.join(',')
    }));

    
    const data = {
      sportEventId: id ?? "0",
      FilePath: preview ?? '',
      PurchaseDetails,
      paymentId
    };

    try {
      await purchaseMoments(data);
      setPaymentComplete(true);
      setFlowStep("confirmation")
      setLoading(false);
      //navigate('/success');
    } catch (error) {
      alert(error);
      setLoading(false);
     }
  };

  const handlePaymentError = (error: any) => {
    alert(`Error en el pago: ${error}`);
  };


  // Creative upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setVideoDuration(video.duration);
        resolve(video.duration <= 15);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(false);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type.startsWith('video/')) {
        const isValidDuration = await validateVideoDuration(droppedFile);
        if (!isValidDuration) {
          setUploadError('El video no debe superar los 15 segundos');
          return;
        }
      }
      
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
      setUploadError(null);
    }
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        const isValidDuration = await validateVideoDuration(selectedFile);
        if (!isValidDuration) {
          setUploadError('El video no debe superar los 15 segundos');
          return;
        }
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);


  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 2000);
  }, []);
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {visible && <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Evento no encontrado</h2>
          <p className="text-neutral-600 mb-4">El evento que buscas no existe o ha sido removido.</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Volver atrás
          </Button>
        </div>}
      </div>
    );
  }

  // Calculate CPM for first half, halftime, and second half
  const calculateCPM = (price: number, attendance: number, tvAudience: number = 0) => {
    // For halftime, only consider in-stadium attendance
    const audience = price === event.moments[0].price ? attendance : attendance + tvAudience;
    return audience > 0 ? (price / audience) * 1000 : 0;
  };

  const firstHalfCPM = calculateCPM(
    event ? event?.moments.find(item => item.moment === 'FirstHalf')?.price || 0 : 0, 
    event.estimatedAttendance, 
    event.estimatedAttendance || 0
  ).toFixed(2);
  
  const halftimeCPM = calculateCPM(
    event ? event?.moments.find(item => item.moment === 'Halftime')?.price || 0 : 0, 
    event.estimatedAttendance
  ).toFixed(2);
  
  const secondHalfCPM = calculateCPM(
    event ? event?.moments.find(item => item.moment === 'SecondHalf')?.price || 0 : 0, 
    event.estimatedAttendance, 
    event.estimatedAttendance || 0
  ).toFixed(2);

  // Define game periods
  const gamePeriods: GamePeriodInfo[] = [
    // {
    //   id: 'pre-partido',
    //   name: 'Pre Partido',
    //   description: '30 minutos antes del inicio',
    //   maxMinutes: 30,
    //   price: event ? event?.moments.find(item => item.moment === 'FirstHalf')?.price || 0 : 0 * 0.8, // 80% of first half price
    //   color: 'bg-gradient-to-br from-blue-50 to-blue-100',
    //   textColor: 'text-blue-800',
    //   borderColor: 'border-blue-200',
    //   iconColor: 'text-blue-600',
    //   tvAudience: true
    // },
    {
      id: 'FirstHalf',
      name: 'Primer Tiempo',
      description: '45 minutos de juego',
      maxMinutes: 45,
      price: event ? event?.moments.find(item => item.moment === 'FirstHalf')?.price || 0 : 0,
      color: 'bg-gradient-to-br from-primary-50 to-primary-100',
      textColor: 'text-primary-800',
      borderColor: 'border-primary-200',
      iconColor: 'text-primary',
      tvAudience: true
    },
    {
      id: 'Halftime',
      name: 'Entre Tiempo',
      description: '15 minutos de descanso',
      maxMinutes: 15,
      price: event ? event?.moments.find(item => item.moment === 'Halftime')?.price || 0 : 0,
      color: 'bg-gradient-to-br from-amber-50 to-amber-100',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      tvAudience: false
    },
    {
      id: 'SecondHalf',
      name: 'Segundo Tiempo',
      description: '45 minutos de juego',
      maxMinutes: 45,
      price: event ? event?.moments.find(item => item.moment === 'SecondHalf')?.price || 0 : 0,
      color: 'bg-gradient-to-br from-primary-50 to-primary-100',
      textColor: 'text-primary-800',
      borderColor: 'border-primary-200',
      iconColor: 'text-primary',
      tvAudience: true
    }
  ];

  const currentPeriod = gamePeriods.find(period => period.id === selectedPeriod)!;

  // Calculate CPM for the selected period
  const calculatePeriodCPM = (period: GamePeriodInfo) => {
    return calculateCPM(
      period.price,
      event.estimatedAttendance,
      period.tvAudience ? (event.estimatedAttendance || 0) : 0
    ).toFixed(2);
  };

  const handleAddMoment = () => {
    if (selectedMoments.length < 19) {
      setSelectedMoments([
        ...selectedMoments,
        { id: selectedPeriod, momentId: selectedPeriod, minute: Math.floor(currentPeriod.maxMinutes / 2), price: currentPeriod.price }
      ]);
    }
  };

  const handleRemoveMoment = (index: number) => {
    setSelectedMoments(selectedMoments.filter((_, i) => i !== index));
  };

  const handleMinuteSelect = (index: number, minute: number) => {
    setSelectedMoments(
      selectedMoments.map((moment, i) => 
        i === index ? { ...moment, minute } : moment
      )
    );
  };

  const handleContinue = () => {
    const grouped = Object.values(
      selectedMoments.reduce((acc: any, item) => {
        if (!acc[item.id]) {
          acc[item.id] = {
            momentId: item.momentId,
            minutes: [],
            price: item.price
          };
        }
        acc[item.id].minutes.push(item.minute);
        return acc;
      }, {})
    );
    
    if (grouped.length > 0) {
      setFlowStep('upload-creative');
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleBackToMoments = () => {
    setFlowStep('select-moments');
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleProceedToPayment = () => {
    if (file) {
      setFlowStep('payment');
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  // Calculate the moment price based on the selected period
  const getMomentPrice = (momentId: string) => {
    const period = gamePeriods.find(p => p.id === momentId);
    return period ? period.price : event ? event?.moments.find(item => item.moment === 'FirstHalf')?.price || 0 : 0;
  };

  // Calculate total price considering different pricing for each moment
  const totalPrice = selectedMoments.reduce((total, moment) => {
    return total + getMomentPrice(moment.momentId);
  }, 0);

  // Filter moments by selected period
  const filteredMoments = selectedMoments.filter(moment => moment.momentId === selectedPeriod);

  // Format time for countdown
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Calculate availability percentage
  const availabilityPercentage = (remainingMoments / 19) * 100;

  // Get progress bar color based on availability
  const getProgressBarColor = () => {
    if (remainingMoments <= 5) {
      return 'bg-gradient-to-r from-red-500 via-red-400 to-red-500';
    } else if (remainingMoments <= 10) {
      return 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500';
    } else {
      return 'bg-gradient-to-r from-green-500 via-green-400 to-green-500';
    }
  };

  // Get progress bar animation
  const getProgressBarAnimation = () => {
    if (remainingMoments <= 5) {
      return {
        animate: {
          width: `${availabilityPercentage}%`,
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.02, 1]
        },
        transition: {
          opacity: { repeat: Infinity, duration: 1.5 },
          scale: { repeat: Infinity, duration: 1.5 }
        }
      };
    } else if (remainingMoments <= 10) {
      return {
        animate: {
          width: `${availabilityPercentage}%`,
          opacity: [0.8, 1, 0.8]
        },
        transition: {
          opacity: { repeat: Infinity, duration: 2 }
        }
      };
    } else {
      return {
        animate: { width: `${availabilityPercentage}%` },
        transition: { duration: 0.5 }
      };
    }
  };

  const progressBarAnimation = getProgressBarAnimation();

  // Render different content based on the current flow step
  const renderContent = () => {
    switch (flowStep) {
      case 'select-moments':
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Selecciona tus momentos 
            </h2>

            {/* Enhanced Limited Availability Alert */}
            <div className={`relative overflow-hidden rounded-xl mb-8 ${
              remainingMoments <= 5 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : remainingMoments <= 10 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-primary to-primary-600'
            }`}>
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="10" style={{stroke: 'white', strokeWidth: 1}} />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
                </svg>
              </div>
              
              <div className="p-5 relative">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">¡CUPO LIMITADO!</h3>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full"
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-white" />
                          <span className="text-xs font-bold text-white">{formatTime(countdownTime)}</span>
                        </div>
                      </motion.div>
                    </div>
                    <p className="text-white/90 mb-3">
                      {remainingMoments <= 5 
                        ? `¡Solo quedan ${remainingMoments} momentos disponibles! Reserva ahora antes de que se agoten.`
                        : remainingMoments <= 10
                        ? `Quedan ${remainingMoments} momentos disponibles. La disponibilidad es limitada.`
                        : `Quedan ${remainingMoments} momentos disponibles para este partido.`
                      }
                    </p>
                    
                    <div className="relative h-3 bg-white/20 rounded-full overflow-hidden mb-3">
                      <motion.div 
                        className={`absolute top-0 left-0 h-full ${getProgressBarColor()}`}
                        initial={{ width: `${availabilityPercentage}%` }}
                        animate={progressBarAnimation.animate}
                        transition={progressBarAnimation.transition}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-white/90 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{activeViewers} personas están viendo esto ahora</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span>{19 - remainingMoments} momentos vendidos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Purchases */}
              <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-3">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <div className="flex-shrink-0 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-white" />
                      <span className="text-xs text-white whitespace-nowrap">Compras recientes:</span>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {recentPurchases.map((purchase, index) => (
                      <motion.div
                        key={`${purchase.name}-${purchase.time.getTime()}`}
                        initial={index === 0 ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex-shrink-0 px-2 py-1 rounded-full text-xs text-white whitespace-nowrap ${
                          index === 0 && showPulse ? 'bg-white/30' : 'bg-white/10'
                        }`}
                      >
                        <span>{purchase.name} • {Math.floor((Date.now() - purchase.time.getTime()) / 60000)} min</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-neutral-800">¿Cómo funciona?</h3>
              </div>
              <p className="text-neutral-600 mb-6">
                Selecciona los minutos específicos en los que quieres que aparezca tu anuncio durante el partido.
                Cada momento tiene una duración de 15 segundos y aparecerá en las pantallas LED del estadio.
              </p>
              
              {/* Game Period Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {gamePeriods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`
                      p-4 rounded-xl border transition-colors text-left
                      ${selectedPeriod === period.id
                        ? `${period.color} ${period.borderColor}`
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`w-5 h-5 ${period.iconColor}`} />
                      <h4 className={`font-semibold ${selectedPeriod === period.id ? period.textColor : 'text-neutral-800'}`}>
                        {period.name}
                      </h4>
                    </div>
                    <p className="text-xs text-neutral-600">
                      {period.description}
                    </p>
                    <div className="mt-2 pt-2 border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Precio</span>
                        <span className={`text-sm font-medium ${period.textColor}`}>
                          ${(period.price / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">CPM</span>
                        <span className={`text-xs font-medium ${period.textColor}`}>
                          ${calculatePeriodCPM(period)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Period Info */}
            <div className={`p-5 ${currentPeriod.color} rounded-xl mb-6 border ${currentPeriod.borderColor}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className={`w-5 h-5 ${currentPeriod.iconColor}`} />
                <h3 className={`font-semibold ${currentPeriod.textColor}`}>{currentPeriod.name}</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-3">
                {currentPeriod.description}. Selecciona los minutos específicos en los que quieres que aparezca tu anuncio.
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500">Precio por momento</p>
                  <p className={`font-medium ${currentPeriod.textColor}`}>
                    ${currentPeriod.price.toLocaleString()} COP
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">CPM</p>
                  <p className={`font-medium ${currentPeriod.textColor}`}>
                    ${calculatePeriodCPM(currentPeriod)}
                  </p>
                </div>
              </div>
            </div>

            {/* Moment Selector */}
            <div className="bg-neutral-50 p-6 rounded-xl">
              <MomentSelector
                momentId={selectedPeriod}
                momentNumber={1}
                maxMinutes={currentPeriod.maxMinutes}
                selectedMinutes={filteredMoments.map(m => m.minute)}
                onMinuteSelect={(index, minute) => {
                  const momentIndex = selectedMoments.findIndex(
                    m => m.momentId === selectedPeriod && 
                    m.minute === filteredMoments[index].minute
                  );
                  if (momentIndex !== -1) {
                    handleMinuteSelect(momentIndex, minute);
                  }
                }}
                onAddMoment={handleAddMoment}
                onRemoveMoment={(index) => {
                  const momentIndex = selectedMoments.findIndex(
                    m => m.momentId === selectedPeriod && 
                    m.minute === filteredMoments[index].minute
                  );
                  if (momentIndex !== -1) {
                    handleRemoveMoment(momentIndex);
                  }
                }}
              />
            </div>
          </div>
        );
      
      case 'upload-creative':
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary" />
              Sube tu pieza creativa
            </h2>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-neutral-800">Especificaciones técnicas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <h4 className="font-medium mb-2">Dimensiones</h4>
                  <p className="text-sm text-neutral-600 mb-2">1920 x 96 píxeles</p>
                  <div className="w-full h-12 bg-neutral-200 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-neutral-600">1920 x 96 px</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <h4 className="font-medium mb-2">Formatos aceptados</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm">PNG, JPG, GIF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success-500" />
                      <span className="text-sm">Máximo 10MB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success-500" />
                      <span className="text-sm">Resolución: 72 DPI</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center ${
                  isDragging
                    ? 'border-primary bg-primary-50'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!file ? (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-neutral-400 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Sube tu pieza creativa
                    </p>
                    <p className="text-sm text-neutral-500 mb-4">
                      Arrastra y suelta tu archivo aquí o haz clic para buscar
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-500"
                    >
                      Seleccionar archivo
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative w-full max-w-[1920px] mx-auto">
                      {/* Contenedor con proporción 20:1 (1920:96) */}
                      <div className="relative w-full" style={{ paddingBottom: '5%' }}>
                        <div className="absolute inset-0 bg-neutral-100 rounded-lg overflow-hidden">
                          {file.type.startsWith('video/') ? (
                            <video
                              src={preview!}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={preview!}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        {/* Indicador de dimensiones */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          1920 x 96 px
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <p className="mt-4 text-sm text-neutral-600">{file.name}</p>
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="mt-2 text-sm text-error-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {uploadError}
                </p>
              )}
            </div>
            
            {/* Creative Preview */}
            {preview && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Vista previa en estadio</h3>
                
                <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden">
                  <img
                    src={estadioImage}
                    alt="Stadium"
                    className="w-full h-full object-cover opacity-75"
                  />

                  {/* LED Board Container */}
                  <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black/80">
                    {file?.type.startsWith('video/') ? (
                      <video
                        src={preview}
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Creative Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Mockup Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-neutral-900/10" />
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary">Recomendaciones</p>
                      <ul className="mt-2 space-y-1 text-sm text-primary-600">
                        <li>• Usa colores con alto contraste para mejor visibilidad</li>
                        <li>• Mantén el texto al mínimo y usa fuentes grandes</li>
                        <li>• Evita fondos blancos en pantallas exteriores</li>
                        <li>• Incluye un llamado a la acción claro</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="lg"
                icon={ChevronLeft}
                onClick={handleBackToMoments}
              >
                Volver
              </Button>
              
              <Button
                variant="primary"
                size="lg"
                icon={ChevronRight}
                disabled={!file}
                onClick={handleProceedToPayment}
              >
                Continuar al pago
              </Button>
            </div>
          </div>
        );
      
      case 'payment':
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Detalles de pago
            </h2>
            
            {/* Order Summary */}
            <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
              <h3 className="font-semibold mb-4">Resumen del pedido</h3>
              
              <div className="flex gap-3 mb-4">
                <div className="w-[120px] h-[80px] bg-white rounded-lg overflow-hidden">
                  <img
                     src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                    alt={event.stadiumName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-800 mb-1">
                    {event.homeTeamName} vs {event.awayTeamName}
                  </h4>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">{event.stadiumName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">
                      {new Date(event.eventDate).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-neutral-200 pt-4 mb-4">
                <div className="space-y-2">
                  {gamePeriods.map(period => {
                    const periodMoments = selectedMoments.filter(m => m.momentId === period.id);
                    if (periodMoments.length === 0) return null;
                    
                    return (
                      <div key={period.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${period.color}`}></div>
                          <div>
                            <span className="text-sm">{period.name}</span>
                            <p className="text-xs text-neutral-500">
                              Minutos: {periodMoments.map(m => m.minute).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{periodMoments.length} x</span>
                          <span className="text-sm">${(period.price).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">${totalPrice.toLocaleString()} COP</span>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="mb-6">
              {/* <h3 className="font-semibold mb-4">Método de pago</h3>
              
              {paymentMethods.length > 0 && (
                <div className="mb-4">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`
                        p-4 border rounded-xl mb-3 cursor-pointer
                        ${selectedPaymentMethod === method.id ? 'border-primary bg-primary-50' : 'border-neutral-200'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-neutral-600" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {method.brand} ****{method.last4}
                            </p>
                            <p className="text-sm text-neutral-600">
                              Expira {method.expiry}
                            </p>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center">
                          {selectedPaymentMethod === method.id && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )} */}
              
              {/* Security Info */}
              <div className="p-4 bg-neutral-50 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h4 className="font-medium">Pago seguro</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  Tus datos de pago están protegidos con encriptación SSL de 256 bits.
                  No almacenamos los datos de tu tarjeta.
                </p>
              </div>
              
              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Información de contacto</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="tel"
                        placeholder="+57 300 123 4567"
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                <br/>
                {loading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <p className="text-sm text-neutral-600">Procesando pago... no cierre la página</p>
                  </div>
                ) : (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    amount={totalPrice}
                    selectedMoments={selectedMoments}
                  />
                </Elements>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  icon={ChevronLeft}
                  onClick={() => {
                    setFlowStep('upload-creative');
                    window.scrollTo(0, 0);
                  }}
                >
                  Volver
                </Button>
                
                {/* Payment Form */}
                
              </div>
            </div>
          </div>
        );
      
      case 'confirmation':
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">¡Pago completado!</h2>
              <p className="text-neutral-600">
                Hemos recibido tu pago correctamente. A continuación encontrarás los detalles de tu compra.
              </p>
            </div>
            
            <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6">
              <div className="p-4 bg-neutral-50 border-b border-neutral-200">
                <h3 className="font-semibold">Detalles de la compra</h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    {/* <span className="text-neutral-600">Número de orden</span> */}
                    {/* <span className="font-medium">ORD-{Date.now().toString().slice(-8)}</span> */}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Fecha</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Evento</span>
                    <span className="font-medium">{event.homeTeamName} vs {event.awayTeamName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Estadio</span>
                    <span className="font-medium">{event.stadiumName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Fecha del evento</span>
                    <span className="font-medium">
                      {new Date(event.eventDate).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Momentos comprados</span>
                    <span className="font-medium">{selectedMoments.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total pagado</span>
                    <span className="font-semibold text-primary">${totalPrice.toLocaleString()} COP</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-success-50 border border-success-100 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-success-800 mb-1">Tu anuncio está listo para ser mostrado</h4>
                  <p className="text-sm text-success-700">
                    Hemos recibido tu creativo y será mostrado en los momentos seleccionados durante el partido.
                    Recibirás un correo electrónico con la confirmación y los detalles de tu compra.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {/* <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/mis-campanas')}
              >
                Ver mis campañas
              </Button> */}
              
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/sports-events')}
              >
                Explorar más eventos
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                if (flowStep === 'select-moments') {
                  navigate(-1);
                } else if (flowStep === 'upload-creative') {
                  setFlowStep('select-moments');
                  setStep(1);
                } else if (flowStep === 'payment') {
                  setFlowStep('upload-creative');
                  setStep(2);
                } else {
                  navigate('/sports-events');
                }
              }}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-neutral-700" />
            </button>
            <div className="flex items-center">
              <div className="flex items-center">
                {[1, 2, 3].map((stepNumber) => (
                  <React.Fragment key={stepNumber}>
                    <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center ${
                      step >= stepNumber ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-[84px] h-[2px] ${
                        step > stepNumber ? 'bg-primary' : 'bg-neutral-100'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative"
            >
              <Heart 
                size={24} 
                className={isFavorite ? "text-red-500 fill-red-500" : "text-neutral-400"} 
              />
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-10 right-0 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                  >
                    {isFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos'}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[250px] md:h-[300px] overflow-hidden">
        <img
          src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
          alt={event.stadiumName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <img 
                    src={`${constants.base_path}/${event.homeTeamImage}`}
                    alt={event.homeTeamName}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">VS</span>
                  <span className="text-xs text-white/80">
                    {new Date(event.eventDate).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <img 
                     src={`${constants.base_path}/${event.awayTeamImage}`}
                    alt={event.awayTeamName}
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <div className="hidden md:block">
                <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
                  {event.eventTime}
                </span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {event.homeTeamName} vs {event.awayTeamName}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            {renderContent()}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-800">Resumen</h2>
                <span className="text-sm text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                  {selectedMoments.length} momentos
                </span>
              </div>

              <div className="space-y-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Fecha</p>
                    <p className="font-medium">
                      {new Date(event.eventDate).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Hora</p>
                    <p className="font-medium">{event.eventTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Estadio</p>
                    <p className="font-medium">{event.stadiumName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Asistencia estimada</p>
                    <p className="font-medium">{event.estimatedAttendance.toLocaleString()} espectadores</p>
                  </div>
                </div>

                {/* {event.estimatedTvAudience && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Tv className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Audiencia TV estimada</p>
                      <p className="font-medium">{event.estimatedTvAudience.toLocaleString()} televidentes</p>
                    </div>
                  </div>
                )} */}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">CPM</p>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="text-center">
                        <p className="text-xs text-neutral-500">1er</p>
                        <p className="font-medium text-sm">${firstHalfCPM}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-500">Entre</p>
                        <p className="font-medium text-sm">${halftimeCPM}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-500">2do</p>
                        <p className="font-medium text-sm">${secondHalfCPM}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Moments Summary */}
              {selectedMoments.length > 0 && (
                <div className="mb-6 border border-neutral-100 rounded-xl p-4">
                  <h3 className="font-medium mb-3">Momentos seleccionados</h3>
                  <div className="space-y-3">
                    {gamePeriods.map(period => {
                     
                      const periodMoments = selectedMoments.filter(m => m.momentId === period.id);
                      if (periodMoments.length === 0) return null;
                      
                      return (
                        <div key={period.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${period.color}`}></div>
                            <div>
                              <span className="text-sm">{period.name}</span>
                              <p className="text-xs text-neutral-500">
                                Minutos: {periodMoments.map(m => m.minute).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{periodMoments.length} x</span>
                            <span className="text-sm">${(period.price).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-600">Total momentos</span>
                  <span>{selectedMoments.length}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice.toLocaleString()} COP</span>
                </div>
              </div>

              {flowStep === 'select-moments' && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={ArrowRight}
                  disabled={selectedMoments.length === 0}
                  onClick={handleContinue}
                  className="mb-4"
                >
                  Continuar
                </Button>
              )}
              
              {selectedMoments.length === 0 && flowStep === 'select-moments' && (
                <p className="text-center text-sm text-neutral-500">
                  Selecciona al menos un momento para continuar
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-neutral-800">Información del partido</h3>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-2">
                    <img 
                       src={`${constants.base_path}/${event.homeTeamImage}`}
                      alt={event.homeTeamName}
                      className="w-10 h-10"
                    />
                  </div>
                  <span className="text-sm font-medium">{event.homeTeamName}</span>
                </div>

                <div className="text-center">
                  <span className="text-2xl font-bold">VS</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-error-50 rounded-2xl flex items-center justify-center mb-2">
                    <img 
                        src={`${constants.base_path}/${event.awayTeamImage}`}
                      alt={event.awayTeamName}
                      className="w-10 h-10"
                    />
                  </div>
                  <span className="text-sm font-medium">{event.awayTeamName}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Transmisión</span>
                  <span className="font-medium">{event.broadcastChannels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Categoría</span>
                  <span className="font-medium">Liga BetPlay</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Temporada</span>
                  <span className="font-medium">2024-I</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Bar */}
      {flowStep === 'select-moments' && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-neutral-200 p-4 safe-bottom">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-600">Total</span>
            <span className="font-bold text-primary">${totalPrice.toLocaleString()} COP</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={ArrowRight}
            disabled={selectedMoments.length === 0}
            onClick={handleContinue}
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
}