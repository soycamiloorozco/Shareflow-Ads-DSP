import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Calendar, MapPin, Users,
  ChevronRight, Info, AlertTriangle, ArrowRight,
  Trophy, Heart, BarChart3, Flame,
  ShoppingBag, Eye, Zap, Upload, X,
  CreditCard, Check, Image as ImageIcon, Lock,
  ChevronLeft, Loader2, Star, Shield, Timer,
  TrendingUp, Wallet, CheckCircle, PlayCircle,
  Target, Award, Sparkles, ChevronDown
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
              email: user?.email,
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

// Helper: format COP in short form (<1M -> K, >=1M -> M)
const formatShortCOP = (value: number): string => {
  if (value < 1_000_000) return `${Math.round(value / 1_000)}K`;
  return `${(value / 1_000_000).toFixed(1)}M`;
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
  const [recentPurchases, setRecentPurchases] = useState<{ name: string, time: Date }[]>([]);
  const [countdownTime, setCountdownTime] = useState(600); // 10 minutes in seconds
  const [showPulse, setShowPulse] = useState(false);
  const [activeViewers, setActiveViewers] = useState(Math.floor(Math.random() * 20) + 30); // 30-50 viewers

  // Creative upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const [paymentComplete, setPaymentComplete] = useState(false);

  // Progress tracking state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [fileReceived, setFileReceived] = useState(false); // Feedback inmediato
  const [processingSteps] = useState([
    'Analizando video...',
    'Verificando duración...',
    'Cortando video a 15 segundos...',
    'Ajustando dimensiones...',
    'Optimizando calidad...',
    'Finalizando procesamiento...'
  ]);

  // UI state similar to ScreenDetail
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Collapsible sections state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);

  useEffect(() => {
    // Update remaining moments when selectedMoments changes
    setRemainingMoments(19 - selectedMoments.length);
  }, [selectedMoments]);

  // Sticky header effect similar to ScreenDetail
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const headerHeight = headerRef.current.offsetHeight;
      setIsSticky(window.scrollY > headerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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


  const handlePaymentSuccess = async () => {
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
      FilePath: fileBase64 ?? '',
      PurchaseDetails,
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


  // Creative upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Solo quitar el estado de dragging si realmente salimos del área
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const duration = video.duration;
        window.URL.revokeObjectURL(video.src);
        setVideoDuration(Math.min(duration, 15)); // Mostrar máximo 15 segundos
        resolve(duration);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Error al cargar el video'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Error al convertir archivo a base64'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(file);
    });
  };

  const updateProgress = (step: number, message: string) => {
    setUploadProgress(step);
    setCurrentStep(message);
  };

  const processAndAdjustVideo = async (file: File) => {
    try {
      setLoading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Paso 1: Analizar video
      updateProgress(15, processingSteps[0]);
      await new Promise(resolve => setTimeout(resolve, 300)); // Pequeña pausa para mostrar el progreso

      // Paso 2: Obtener duración del video
      updateProgress(25, processingSteps[1]);
      const duration = await getVideoDuration(file);

      // Paso 3: Procesar según duración
      if (duration > 15) {
        updateProgress(40, processingSteps[2]);
        const trimmedFile = await trimVideoTo15Seconds(file);
        await processVideoWithFFmpeg(trimmedFile, true);
      } else {
        updateProgress(50, processingSteps[3]);
        await processVideoWithFFmpeg(file, false);
      }

    } catch (error) {
      console.error('Error procesando video:', error);
      setUploadError('Error al procesar el video. Por favor, intenta con otro archivo.');
      setLoading(false);
      setUploadProgress(0);
      setCurrentStep('');
      setFileReceived(false);
      // Pequeña animación de error
      setUploadProgress(100);
      setCurrentStep('Error en el procesamiento');
      setTimeout(() => {
        setUploadProgress(0);
        setCurrentStep('');
      }, 2000);
    }
  };

  const trimVideoTo15Seconds = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Crear MediaRecorder para grabar el video cortado
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          updateProgress(60, 'Video cortado exitosamente');
          setTimeout(() => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const trimmedFile = new File([blob], `trimmed_${file.name}`, {
              type: 'video/mp4',
              lastModified: Date.now()
            });
            resolve(trimmedFile);
          }, 300);
        };

        // Comenzar grabación
        mediaRecorder.start();
        video.currentTime = 0;
        video.play();

        let startTime = Date.now();
        let lastProgressUpdate = 0;

        const drawFrame = () => {
          const elapsed = (Date.now() - startTime) / 1000;

          // Actualizar progreso del recorte (del 40% al 60%)
          const trimProgress = Math.min((elapsed / 15) * 20, 20); // 20% del progreso total
          const currentProgress = 40 + trimProgress;

          if (currentProgress - lastProgressUpdate >= 2) {
            updateProgress(currentProgress, `${processingSteps[2]} (${elapsed.toFixed(1)}s/15s)`);
            lastProgressUpdate = currentProgress;
          }

          if (elapsed >= 15) {
            video.pause();
            mediaRecorder.stop();
            return;
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        };

        video.onplay = () => {
          drawFrame();
        };
      };

      video.onerror = () => {
        reject(new Error('Error al cargar el video para recortar'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const processVideoWithFFmpeg = async (file: File, wasTrimmed: boolean) => {
    return new Promise<void>((resolve, reject) => {
      const video = document.createElement('video');

      video.onloadedmetadata = () => {
        // Paso 4: Ajustar dimensiones
        if (!wasTrimmed) {
          updateProgress(60, processingSteps[3]);
        } else {
          updateProgress(70, processingSteps[3]);
        }

        // Crear un canvas con las dimensiones objetivo (1920x96)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }

        canvas.width = 1920;
        canvas.height = 96;

        // Verificar si ya tiene las dimensiones correctas
        const aspectRatio = video.videoWidth / video.videoHeight;
        const targetAspectRatio = 1920 / 96; // 20:1

        if (Math.abs(aspectRatio - targetAspectRatio) < 0.1 &&
          video.videoWidth === 1920 && video.videoHeight === 96 &&
          video.duration <= 15) {
          // El video ya cumple con todos los requisitos
          updateProgress(100, 'Completado');
          setFile(file);
          setPreview(URL.createObjectURL(file));

          // Convertir a base64
          convertFileToBase64(file).then(base64 => {
            setFileBase64(base64);
            setLoading(false);
            setUploadProgress(0);
            setCurrentStep('');
            resolve();
          }).catch(error => {
            console.error('Error convirtiendo a base64:', error);
            setLoading(false);
            setUploadProgress(0);
            setCurrentStep('');
            resolve(); // Continuar aunque falle la conversión
          });
          return;
        }

        // Paso 5: Optimizar calidad
        updateProgress(80, processingSteps[4]);

        // Crear MediaRecorder para el video ajustado
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          // Paso 6: Finalizar
          updateProgress(95, processingSteps[5]);

          setTimeout(() => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const adjustedFile = new File([blob], `adjusted_${file.name}`, {
              type: 'video/mp4',
              lastModified: Date.now()
            });

            updateProgress(100, 'Completado');
            setFile(adjustedFile);
            setPreview(URL.createObjectURL(adjustedFile));

            // Convertir a base64
            convertFileToBase64(adjustedFile).then(base64 => {
              setFileBase64(base64);

              // Limpiar estados de progreso después de un momento
              setTimeout(() => {
                setLoading(false);
                setUploadProgress(0);
                setCurrentStep('');
              }, 500);

              resolve();
            }).catch(error => {
              console.error('Error convirtiendo a base64:', error);

              // Limpiar estados de progreso aunque falle la conversión
              setTimeout(() => {
                setLoading(false);
                setUploadProgress(0);
                setCurrentStep('');
              }, 500);

              resolve(); // Continuar aunque falle la conversión
            });

          }, 500);
        };

        // Comenzar grabación
        mediaRecorder.start();
        video.currentTime = 0;
        video.play();

        let startTime = Date.now();
        let lastProgressUpdate = 0;

        const drawFrame = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const maxDuration = Math.min(video.duration, 15);

          // Actualizar progreso de renderizado
          const renderProgress = Math.min((elapsed / maxDuration) * 15, 15); // 15% del progreso total para renderizado
          const currentProgress = 80 + renderProgress;

          if (currentProgress - lastProgressUpdate >= 1) {
            updateProgress(Math.min(currentProgress, 95), processingSteps[4]);
            lastProgressUpdate = currentProgress;
          }

          // Limitar a 15 segundos máximo
          if (elapsed >= maxDuration) {
            video.pause();
            mediaRecorder.stop();
            return;
          }

          // Limpiar canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calcular dimensiones para mantener aspect ratio y centrar
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          const videoAspectRatio = video.videoWidth / video.videoHeight;
          const canvasAspectRatio = canvas.width / canvas.height;

          if (videoAspectRatio > canvasAspectRatio) {
            // Video es más ancho, ajustar por altura
            drawHeight = canvas.height;
            drawWidth = drawHeight * videoAspectRatio;
            offsetX = (canvas.width - drawWidth) / 2;
          } else {
            // Video es más alto, ajustar por ancho
            drawWidth = canvas.width;
            drawHeight = drawWidth / videoAspectRatio;
            offsetY = (canvas.height - drawHeight) / 2;
          }

          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
          requestAnimationFrame(drawFrame);
        };

        video.onplay = () => {
          drawFrame();
        };

        video.onerror = () => {
          reject(new Error('Error al procesar el video'));
        };
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Mostrar feedback inmediato
      setFileReceived(true);
      setUploadError(null);
      setCurrentStep('Archivo recibido, validando...');

      // Pequeña pausa para mostrar el feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      // Validar que sea MP4
      if (droppedFile.type !== 'video/mp4') {
        setUploadError('Solo se permiten archivos de video MP4');
        setFileReceived(false);
        setCurrentStep('');
        return;
      }

      // Validar tamaño (100MB máximo para permitir videos más largos)
      if (droppedFile.size > 100 * 1024 * 1024) {
        setUploadError('El archivo no debe superar los 100MB');
        setFileReceived(false);
        setCurrentStep('');
        return;
      }

      // Procesar y ajustar el video (se cortará automáticamente si es necesario)
      await processAndAdjustVideo(droppedFile);
    }
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Mostrar feedback inmediato
      setFileReceived(true);
      setUploadError(null);
      setCurrentStep('Archivo seleccionado, validando...');

      // Pequeña pausa para mostrar el feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      // Validar que sea MP4
      if (selectedFile.type !== 'video/mp4') {
        setUploadError('Solo se permiten archivos de video MP4');
        setFileReceived(false);
        setCurrentStep('');
        return;
      }

      // Validar tamaño (100MB máximo para permitir videos más largos)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setUploadError('El archivo no debe superar los 100MB');
        setFileReceived(false);
        setCurrentStep('');
        return;
      }

      // Procesar y ajustar el video (se cortará automáticamente si es necesario)
      await processAndAdjustVideo(selectedFile);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setFileBase64(null);
    setUploadProgress(0);
    setCurrentStep('');
    setLoading(false);
    setUploadError(null);
    setFileReceived(false);
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

  // Función para formatear números de manera compacta
  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(0)}`;
    }
  };

  const firstHalfCPM = formatCompactNumber(calculateCPM(
    event ? event?.moments.find(item => item.moment === 'FirstHalf')?.price || 0 : 0,
    event.estimatedAttendance,
    event.estimatedAttendance || 0
  ));

  const halftimeCPM = formatCompactNumber(calculateCPM(
    event ? event?.moments.find(item => item.moment === 'Halftime')?.price || 0 : 0,
    event.estimatedAttendance
  ));

  const secondHalfCPM = formatCompactNumber(calculateCPM(
    event ? event?.moments.find(item => item.moment === 'SecondHalf')?.price || 0 : 0,
    event.estimatedAttendance,
    event.estimatedAttendance || 0
  ));

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
      color: 'bg-gradient-to-br from-[#353FEF]/10 to-[#353FEF]/20',
      textColor: 'text-[#353FEF]',
      borderColor: 'border-[#353FEF]/30',
      iconColor: 'text-[#353FEF]',
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
      color: 'bg-gradient-to-br from-[#353FEF]/10 to-[#353FEF]/20',
      textColor: 'text-[#353FEF]',
      borderColor: 'border-[#353FEF]/30',
      iconColor: 'text-[#353FEF]',
      tvAudience: true
    }
  ];

  const currentPeriod = gamePeriods.find(period => period.id === selectedPeriod)!;

  // Calculate CPM for the selected period
  const calculatePeriodCPM = (period: GamePeriodInfo) => {
    const cpm = calculateCPM(
      period.price,
      event.estimatedAttendance,
      period.tvAudience ? (event.estimatedAttendance || 0) : 0
    );
    return formatCompactNumber(cpm);
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
    if (file && fileBase64) {
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

  const handleShare = (platform?: string) => {
    if (!event) return;

    const shareUrl = window.location.href;
    const shareTitle = `${event.homeTeamName} vs ${event.awayTeamName} - Shareflow Ads`;
    const shareText = `Mira este evento en ${event.stadiumName}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ': ' + shareUrl)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          }).catch(err => {
            console.error('Error al compartir:', err);
          });
        }
    }
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
      return 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500';
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
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl mb-6 border-0 shadow-[0_4px_16px_rgba(53,63,239,0.04)] hover:shadow-[0_8px_24px_rgba(53,63,239,0.06)] transition-all duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#353FEF] to-[#2A32C5] rounded-xl flex items-center justify-center shadow-sm">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              Selecciona tus momentos
            </h2>

            {/* Subtle Availability Alert */}
            <div className="bg-gradient-to-r from-white via-gray-50/50 to-white backdrop-blur-sm rounded-xl p-3 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${remainingMoments <= 5 ? 'bg-red-500' :
                    remainingMoments <= 10 ? 'bg-amber-500' : 'bg-[#353FEF]'
                    }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {remainingMoments} momentos disponibles
                    </p>
                    <p className="text-xs text-gray-600">
                      {activeViewers} personas viendo • {19 - remainingMoments} vendidos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(countdownTime)}</span>
                </div>
              </div>

              {/* Modern progress bar */}
              <div className="mt-4 h-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full rounded-full shadow-sm ${remainingMoments <= 5 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                    remainingMoments <= 10 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-[#353FEF] to-[#2A32C5]'
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${availabilityPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Professional Instructions */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-[#353FEF]/5 via-white to-[#353FEF]/3 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-[0_2px_12px_rgba(53,63,239,0.04)] border-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#353FEF] to-[#2A32C5] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <div>
                                      <h3 className="font-semibold text-[#353FEF] mb-2">Selección de momentos publicitarios</h3>
                  <p className="text-[#353FEF]/80 text-sm leading-relaxed">
                      Elige los minutos específicos durante el partido donde aparecerá tu anuncio.
                      Cada momento dura 15 segundos y se reproduce en las pantallas LED del estadio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modern Game Period Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {gamePeriods.map((period) => (
                  <motion.button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className={`
                      p-3 rounded-xl border-0 transition-all duration-200 text-left relative overflow-hidden backdrop-blur-xl
                      ${selectedPeriod === period.id
                        ? period.id === 'Halftime' 
                          ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-[0_4px_16px_rgba(245,158,11,0.08)]'
                          : 'bg-gradient-to-br from-[#353FEF]/10 via-white to-[#353FEF]/5 shadow-[0_4px_16px_rgba(53,63,239,0.08)]'
                        : period.id === 'Halftime'
                          ? 'bg-amber-50/50 hover:bg-amber-50/80 hover:shadow-[0_2px_12px_rgba(245,158,11,0.04)]'
                          : 'bg-white/70 hover:bg-white/90 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                      }
                    `}
                  >
                    {selectedPeriod === period.id && (
                      <div className="absolute top-2 right-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                          period.id === 'Halftime' 
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                            : 'bg-gradient-to-br from-[#353FEF] to-[#2A32C5]'
                        }`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                        selectedPeriod === period.id 
                          ? period.id === 'Halftime' 
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                            : 'bg-gradient-to-br from-[#353FEF] to-[#2A32C5]'
                          : period.id === 'Halftime'
                            ? 'bg-gradient-to-br from-amber-100 to-amber-200'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100'
                        }`}>
                        <Clock className={`w-4 h-4 ${
                          selectedPeriod === period.id 
                            ? 'text-white'
                            : period.id === 'Halftime' 
                              ? 'text-amber-700'
                              : 'text-gray-600'
                          }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${
                          selectedPeriod === period.id 
                            ? period.id === 'Halftime' 
                              ? 'text-amber-700'
                              : 'text-[#353FEF]'
                            : period.id === 'Halftime'
                              ? 'text-amber-600'
                              : 'text-gray-800'
                          }`}>
                          {period.name}
                        </h4>
                        <p className={`text-xs ${
                          period.id === 'Halftime' 
                            ? 'text-amber-600/80'
                            : 'text-gray-600'
                          }`}>
                          {period.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-gray-100/50">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Precio por momento</p>
                        <p className={`font-semibold text-sm ${
                          period.id === 'Halftime' ? 'text-amber-700' : 'text-gray-800'
                        }`}>
                          ${formatShortCOP(period.price)} COP
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-0.5">CPM estimado</p>
                        <p className={`font-semibold text-sm ${
                          period.id === 'Halftime' ? 'text-amber-700' : 'text-gray-800'
                        }`}>
                          {calculatePeriodCPM(period)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Modern Moment Selector - Main Focus */}
            <div className="bg-white/80 backdrop-blur-xl border-0 rounded-2xl shadow-[0_4px_24px_rgba(53,63,239,0.06)] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#353FEF] via-[#4C5EF7] to-[#2A32C5] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentPeriod.name}</h3>
                      <p className="text-white/90 text-sm">{currentPeriod.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/90 text-sm">Precio por momento</p>
                    <p className="text-white font-bold text-lg">
                      ${formatShortCOP(currentPeriod.price)} COP
                    </p>
                  </div>
                </div>
              </div>

              {/* Moment Selector Content */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Selecciona los minutos</h4>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {filteredMoments.length} seleccionados
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Haz clic en los minutos donde quieres que aparezca tu anuncio durante {currentPeriod.name.toLowerCase()}.
                  </p>
                </div>

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

                {/* Summary */}
                {filteredMoments.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 backdrop-blur-sm rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Momentos seleccionados en {currentPeriod.name}</p>
                        <p className="font-semibold text-gray-800">
                          Minutos: {filteredMoments.map(m => m.minute).sort((a, b) => a - b).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="font-bold text-primary text-lg">
                          ${(filteredMoments.length * currentPeriod.price).toLocaleString()} COP
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'upload-creative':
        return (
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-[0_4px_16px_rgba(53,63,239,0.04)] mb-6 border-0">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#353FEF] to-[#2A32C5] rounded-xl flex items-center justify-center shadow-sm">
                <Upload className="w-4 h-4 text-white" />
              </div>
              Sube tu pieza creativa
            </h2>

            {/* Upload Area */}
            <div
              className={`relative rounded-xl p-8 text-center transition-all duration-300 backdrop-blur-sm ${isDragging
                ? 'bg-[#353FEF]/10 scale-105 shadow-lg'
                : loading || fileReceived
                  ? 'bg-[#353FEF]/5'
                  : 'bg-gray-50/50 hover:bg-gray-50/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
                {/* Overlay especial para drag */}
                {isDragging && (
                  <div className="absolute inset-0 bg-[#353FEF]/10 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#353FEF] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-lg font-bold text-[#353FEF]">
                        ¡Suelta tu video aquí!
                      </p>
                      <p className="text-sm text-[#353FEF]/80 mt-1">
                        Archivo MP4 • Máximo 100MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!file ? (
                  <>
                    {/* Estado inicial o feedback inmediato */}
                    {!fileReceived && !loading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-[#353FEF]/10 rounded-lg flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-[#353FEF]" />
                        </div>
                        <p className="text-base font-medium text-gray-900 mb-2">
                          Sube tu video MP4
                        </p>
                        <p className="text-sm text-neutral-500 mb-4">
                          Arrastra y suelta tu video MP4 aquí o haz clic para buscar<br />
                          <span className="text-xs text-neutral-400">Videos largos se cortarán automáticamente a 15 segundos • Se ajustará a 1920x96px</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-[#353FEF] hover:bg-[#2A32C5] text-white rounded-lg font-medium transition-colors touch-manipulation min-h-[40px] text-sm"
                        >
                          Seleccionar archivo
                        </button>
                      </div>
                    ) : (
                      /* Feedback inmediato cuando se recibe el archivo */
                      <div className="flex flex-col items-center py-8">
                        <div className="relative mb-4">
                          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary" />
                          </div>
                          {/* Animación de pulso */}
                          <div className="absolute inset-0 w-16 h-16 bg-primary-200 rounded-full animate-ping opacity-30"></div>
                        </div>
                        <p className="text-lg font-medium text-primary mb-2">
                          ¡Archivo recibido!
                        </p>
                        <p className="text-sm text-neutral-600 mb-4">
                          {currentStep || 'Preparando para procesar...'}
                        </p>
                        {/* Mini progress bar para feedback inmediato */}
                        <div className="w-48 h-1 bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6">
                        {/* Progress Circle */}
                        <div className="relative w-20 h-20 mb-6">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-neutral-200"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 45}`}
                              strokeDashoffset={`${2 * Math.PI * 45 * (1 - uploadProgress / 100)}`}
                              className="text-primary transition-all duration-500 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Percentage text */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {Math.round(uploadProgress)}%
                            </span>
                          </div>
                        </div>

                        {/* Current step */}
                        <div className="text-center mb-4">
                          <p className="text-base font-medium text-neutral-800 mb-2">
                            {currentStep || 'Iniciando procesamiento...'}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Esto puede tomar unos momentos, por favor no cierres esta ventana
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full max-w-md">
                          <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
                            <div
                              className="bg-gradient-to-r from-primary to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>

                          {/* Steps indicator */}
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span className={uploadProgress >= 15 ? 'text-primary font-medium' : ''}>
                              Análisis
                            </span>
                            <span className={uploadProgress >= 40 ? 'text-primary font-medium' : ''}>
                              {videoDuration > 15 ? 'Recorte' : 'Validación'}
                            </span>
                            <span className={uploadProgress >= 70 ? 'text-primary font-medium' : ''}>
                              Ajuste
                            </span>
                            <span className={uploadProgress >= 95 ? 'text-primary font-medium' : ''}>
                              Finalización
                            </span>
                          </div>
                        </div>

                        {/* Animated dots */}
                        <div className="flex space-x-1 mt-6">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="relative w-full max-w-[800px] mx-auto">
                          {/* Vista previa mejorada con altura fija */}
                          <div className="relative w-full bg-neutral-900 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                            <video
                              src={preview!}
                              controls
                              loop
                              muted
                              autoPlay
                              className="w-full h-full object-contain bg-black rounded-lg"
                              style={{ objectFit: 'contain' }}
                            />
                            {/* Indicador de dimensiones */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              1920 x 96 px
                            </div>
                            {/* Indicador de duración */}
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {videoDuration.toFixed(1)}s
                            </div>
                            {/* Overlay con información de formato */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-gradient-to-r from-black/80 to-black/60 text-white text-xs px-3 py-2 rounded-lg text-center backdrop-blur-sm">
                                <div className="font-medium">Vista previa del video procesado</div>
                                <div className="text-white/80 mt-0.5">Se mostrará en formato panorámico 1920x96px en la pantalla LED</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-all duration-200 z-20 hover:scale-110"
                          title="Eliminar video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-neutral-800 font-medium mb-2">{file.name}</p>
                          <div className="flex justify-center items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                                                  <div className="w-2 h-2 bg-[#353FEF] rounded-full"></div>
                    <span>Tamaño: {(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#353FEF] rounded-full"></div>
                              <span>Duración: {videoDuration.toFixed(1)}s</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Formato: MP4</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-[#353FEF] font-medium">
                            ✓ Video procesado y listo para usar
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="mt-2 text-sm text-error-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {uploadError}
                </p>
              )}

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
                  <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-black/90 border-t-2 border-white/20">
                    <video
                      src={preview}
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                    {/* LED Board Frame */}
                    <div className="absolute inset-0 border border-gray-600/50 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
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
                        <li>• Usa colores vibrantes y alto contraste para mejor visibilidad</li>
                        <li>• Mantén el texto grande y legible (mínimo 48px)</li>
                        <li>• Evita transiciones muy rápidas o efectos estroboscópicos</li>
                        <li>• Incluye tu logo y llamado a la acción claro</li>
                        <li>• El video se reproducirá en loop durante tu momento</li>
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
                disabled={!file || !fileBase64}
                onClick={handleProceedToPayment}
              >
              Continuar al pago
            </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-[0_4px_16px_rgba(53,63,239,0.04)] mb-6 border-0">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#353FEF] to-[#2A32C5] rounded-xl flex items-center justify-center shadow-sm">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              Detalles de pago
            </h2>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 backdrop-blur-sm rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border-0">
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
                <span className="text-[#353FEF]">${totalPrice.toLocaleString()} COP</span>
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
                        <div className="w-5 h-5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center">
                          {selectedPaymentMethod === method.id && (
                            <div className="w-3 h-3 rounded-full bg-[#353FEF]" />
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

              {/* Payment Actions */}
              <div className="mb-6">
                {loading ? (
                  <div className="flex justify-center items-center gap-3 p-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-sm text-neutral-600">Procesando pago... no cierre la página</p>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handlePaymentSuccess}
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={ArrowRight}
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : `Pagar ${totalPrice.toLocaleString('es-CO')} COP`}
                  </Button>
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
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-[0_4px_16px_rgba(53,63,239,0.04)] mb-6 border-0">
            <div className="text-center mb-6 sm:mb-8">
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
    <main className="min-h-screen bg-background pb-20 sm:pb-16">
      {/* Back Button - Optimizado para móvil */}
      <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="max-w-6xl mx-auto pt-2 sm:pt-4 pb-1 sm:pb-2">
          <motion.button
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
            className="group relative overflow-hidden flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 bg-white/80 hover:bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300 text-gray-700 hover:text-gray-900 backdrop-blur-sm touch-manipulation min-h-[40px] sm:min-h-[48px]"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            aria-label="Volver atrás"
          >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-[#353FEF]/10 to-[#353FEF]/20 group-hover:from-[#353FEF]/20 group-hover:to-[#353FEF]/30 flex items-center justify-center transition-all duration-300 shadow-sm">
                              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#353FEF] group-hover:translate-x-[-2px] transition-transform duration-200" />
            </div>
            <span className="font-semibold text-xs sm:text-sm md:text-base">Volver</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
          </motion.button>
        </div>
      </div>

      {/* Sticky Navigation Header - Enhanced for All Screen Sizes */}
      {isSticky && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-neutral-100">
          <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <h1 className="font-bold text-darkText truncate"
                    style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)' }}>
                    {event?.homeTeamName} vs {event?.awayTeamName}
                  </h1>
                  <div className="flex items-center gap-1 text-sm">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{event?.eventTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleShare('whatsapp')}
                    className="group relative overflow-hidden w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#25D366] to-[#1FAD54] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 touch-manipulation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Compartir en WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Enhanced Responsive Design - Optimizado para móvil */}
      <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="max-w-6xl mx-auto py-1 sm:py-2 md:py-4 lg:py-6" ref={headerRef}>
          <article className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 lg:gap-10">
            <div className="lg:col-span-2">
              {/* Modern Event Header - Optimizado para móvil */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border-0 mb-6 overflow-hidden shadow-[0_4px_16px_rgba(53,63,239,0.04)]">
                <div className="relative h-[200px] sm:h-[250px] md:h-[300px] overflow-hidden">
                  <img
                    src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                    alt={event.stadiumName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />



                  {/* Clean Teams Display - Más compacto */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
                    <div className="flex items-center justify-center mb-2 sm:mb-4">
                      <div className="flex items-center gap-4 sm:gap-8">
                        {/* Home Team */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center mb-1 sm:mb-2 shadow-lg">
                            <img
                              src={`${constants.base_path}/${event.homeTeamImage}`}
                              alt={event.homeTeamName}
                              className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                            />
                          </div>
                          <span className="text-white font-medium text-xs sm:text-sm text-center max-w-[60px] sm:max-w-none truncate">
                            {event.homeTeamName}
                          </span>
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center">
                          <div className="bg-white/10 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg mb-1 sm:mb-2">
                            <span className="text-white font-bold text-xs sm:text-sm">VS</span>
                          </div>
                          <span className="text-white/80 text-xs">
                            {new Date(event.eventDate).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center mb-1 sm:mb-2 shadow-lg">
                            <img
                              src={`${constants.base_path}/${event.awayTeamImage}`}
                              alt={event.awayTeamName}
                              className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                            />
                          </div>
                          <span className="text-white font-medium text-xs sm:text-sm text-center max-w-[60px] sm:max-w-none truncate">
                            {event.awayTeamName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Event Title - Más pequeño en móvil */}
                    <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-white text-center mb-1">
                      {event.homeTeamName} vs {event.awayTeamName}
                    </h1>

                    {/* Stadium Name - Más compacto */}
                    <div className="flex items-center justify-center gap-1 sm:gap-2 text-white/90">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">{event.stadiumName}</span>
                    </div>
                  </div>
                </div>


              </div>

              {/* Event Description and Context Section - Colapsable */}
              <section className="mb-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border-0 mb-6 shadow-[0_2px_12px_rgba(53,63,239,0.03)]">
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="w-full px-4 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#353FEF] to-[#2A32C5] rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        Descripción del evento
                      </h2>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : ''
                          }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isDescriptionExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3">
                          <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                            El <span className="font-bold text-[#353FEF]">{new Date(event.eventDate).toLocaleDateString('es-CO', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} a las {event.eventTime}</span>, aprovecha la emoción del fútbol para conectar con tu audiencia en <span className="font-bold text-[#353FEF]">{event.stadiumName}</span>.
                            Durante el emocionante encuentro entre <span className="font-bold text-[#353FEF]">{event.homeTeamName} y {event.awayTeamName}</span>, tu anuncio cobrará vida en las
                            pantallas LED perimetrales del estadio, capturando la atención de <span className="font-bold text-[#353FEF]">{event.estimatedAttendance.toLocaleString()}
                              espectadores apasionados</span> en las gradas y miles más a través de la transmisión televisiva nacional.
                            Cada momento publicitario tiene una duración de <span className="font-bold text-[#353FEF]">15 segundos</span> y se reproduce en formato panorámico de alta definición,
                            garantizando máxima visibilidad y recordación durante los momentos más intensos e inolvidables del partido.
                          </p>

                          {/* Event Context - Compacto */}
                          <div className="mt-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-[#353FEF]" />
                              Contexto del evento
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                                <Users className="w-3 h-3" />
                                <span>Evento Deportivo</span>
                              </div>
                              <div className="px-2 py-1 bg-[#353FEF]/10 rounded-full text-xs font-medium text-[#353FEF]">
                                Audiencia en Vivo
                              </div>
                              <div className="px-2 py-1 bg-[#353FEF]/10 rounded-full text-xs font-medium text-[#353FEF]">
                                Transmisión TV
                              </div>
                              <div className="px-2 py-1 bg-orange-100 rounded-full text-xs font-medium text-orange-700">
                                Fútbol
                              </div>
                              <div className="px-2 py-1 bg-gradient-to-r from-[#353FEF]/5 to-[#353FEF]/10 rounded-full text-xs font-medium text-[#353FEF]">
                                <Users className="w-3 h-3 inline mr-1" />
                                Familias y Aficionados
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Technical Specifications Section - Colapsable */}
              <section className="mb-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border-0 shadow-[0_2px_12px_rgba(53,63,239,0.03)]">
                  <button
                    onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
                    className="w-full px-4 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#353FEF] to-[#2A32C5] rounded-xl flex items-center justify-center shadow-sm">
                          <Info className="w-4 h-4 text-white" />
                        </div>
                        Especificaciones técnicas
                      </h2>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isSpecsExpanded ? 'rotate-180' : ''
                          }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isSpecsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3">
                          {/* Especificaciones técnicas completas */}
                          <div className="space-y-4">
                            {/* Dimensiones y Formato */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 backdrop-blur-sm p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-[#353FEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  </svg>
                                  Dimensiones
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-600">Resolución:</span>
                                    <span className="text-xs font-medium">1920 x 96 píxeles</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-600">Aspecto:</span>
                                    <span className="text-xs font-medium">20:1 (Panorámico)</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-600">Orientación:</span>
                                    <span className="text-xs font-medium">Horizontal</span>
                                  </div>
                                </div>
                                <div className="mt-2 w-full h-6 bg-gray-200 rounded-lg relative overflow-hidden">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs text-gray-600 font-medium">1920 x 96 px</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-[#353FEF]/5 via-white to-[#353FEF]/3 backdrop-blur-sm p-3 rounded-xl shadow-[0_2px_8px_rgba(53,63,239,0.04)]">
                                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                  <PlayCircle className="w-4 h-4 text-[#353FEF]" />
                                  Formato de Video
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-600">Formato:</span>
                                    <span className="text-xs font-medium">MP4</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-600">Duración:</span>
                                    <span className="text-xs font-medium">Máximo 15 segundos</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-600">Tamaño:</span>
                                    <span className="text-xs font-medium">Máximo 100MB</span>
                                  </div>
                                </div>
                              </div>
                            </div>



                            {/* Recomendaciones de Diseño */}
                            <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 backdrop-blur-sm p-3 rounded-xl shadow-[0_2px_8px_rgba(245,158,11,0.04)]">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Recomendaciones de Diseño
                              </h4>
                              <ul className="space-y-1 text-xs text-gray-700">
                                <li className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <span>Usa colores vibrantes y alto contraste para mejor visibilidad</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <span>Mantén el texto grande y legible (mínimo 48px de altura)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <span>Evita transiciones muy rápidas o efectos estroboscópicos</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <span>Incluye tu logo y llamado a la acción claro</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <span>El video se reproducirá en loop durante tu momento</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          {/* Link a plantillas de Canva - Compacto */}
                          <div className="mt-3 p-2 bg-gradient-to-r from-[#353FEF]/5 to-purple-50/50 backdrop-blur-sm rounded-xl shadow-[0_2px_8px_rgba(53,63,239,0.04)]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-[#353FEF]" />
                                <span className="font-medium text-gray-800 text-xs">¿Necesitas plantillas?</span>
                              </div>
                              <a
                                href="https://www.canva.com/design/DAGXqVhwzQs/view?utm_content=DAGXqVhwzQs&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#353FEF] to-[#2A32C5] text-white rounded-lg hover:from-[#2A32C5] hover:to-[#1E2499] transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                              >
                                Ver en Canva
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Main Content Sections */}
              {renderContent()}
            </div>

            {/* Sidebar - Purchase Options - Optimizado para móvil */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border-0 shadow-[0_4px_16px_rgba(53,63,239,0.04)] mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Resumen de compra</h2>
                    {selectedMoments.length > 0 && (
                      <span className="text-sm text-[#353FEF] bg-[#353FEF]/10 px-3 py-1 rounded-md font-medium">
                        {selectedMoments.length} momento{selectedMoments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                                     {/* Match Header with Teams */}
                   <div className="bg-gradient-to-r from-[#353FEF]/5 to-[#353FEF]/10 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-[0_2px_12px_rgba(53,63,239,0.04)] border-0">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 text-sm">{event.homeTeamName}</div>
                          <div className="text-xs text-gray-600">Local</div>
                        </div>
                        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm flex items-center justify-center">
                          <img 
                            src={`${constants.base_path}/${event.homeTeamImage}`}
                            alt={event.homeTeamName}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-gray-600">VS</span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm flex items-center justify-center">
                          <img 
                            src={`${constants.base_path}/${event.awayTeamImage}`}
                            alt={event.awayTeamName}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 text-sm">{event.awayTeamName}</div>
                          <div className="text-xs text-gray-600">Visitante</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha
                      </span>
                      <span className="font-medium text-gray-900 text-sm">
                        {new Date(event.eventDate).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short'
                        })} • {event.eventTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Estadio
                      </span>
                      <span className="font-medium text-gray-900 text-sm">
                        {event.stadiumName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Audiencia
                      </span>
                      <span className="font-medium text-gray-900 text-sm">
                        {(event.estimatedAttendance / 1000).toFixed(0)}K personas
                      </span>
                    </div>
                  </div>

                  {totalPrice > 0 && (
                    <div className="border-t pt-3 sm:pt-4 mb-3 sm:mb-4">
                      <div className="flex items-center justify-between text-base sm:text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-primary">${totalPrice.toLocaleString()} COP</span>
                      </div>
                    </div>
                  )}

                  {/* Continue Button - Desktop */}
                  {flowStep === 'select-moments' && (
                    <div className="hidden md:block">
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

                      {selectedMoments.length === 0 && (
                        <p className="text-center text-sm text-neutral-500">
                          Selecciona al menos un momento para continuar
                        </p>
                      )}
                    </div>
                  )}

                  {flowStep === 'upload-creative' && (
                    <div className="hidden md:block space-y-3">
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        icon={ChevronLeft}
                        onClick={handleBackToMoments}
                      >
                        Volver
                      </Button>

                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon={ChevronRight}
                        disabled={!file || !fileBase64}
                        onClick={handleProceedToPayment}
                      >
                        Continuar al pago
                      </Button>
                    </div>
                  )}
                </div>

                {/* Selected Moments Summary */}
                {selectedMoments.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border-0 shadow-[0_4px_16px_rgba(53,63,239,0.04)]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-[#353FEF]/10 rounded-md flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-[#353FEF]" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Momentos seleccionados</h3>
                      <div className="px-2 py-1 bg-[#353FEF]/10 rounded-md ml-auto">
                        <span className="text-xs font-medium text-[#353FEF]">
                          {selectedMoments.length} momento{selectedMoments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Moments by Period */}
                    <div className="space-y-3 mb-4">
                      {gamePeriods.map(period => {
                        const periodMoments = selectedMoments.filter(m => m.momentId === period.id);
                        if (periodMoments.length === 0) return null;

                        return (
                          <div key={period.id} className="rounded-xl p-3 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/30 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${period.id === 'FirstHalf' ? 'bg-[#353FEF]' :
                                  period.id === 'Halftime' ? 'bg-amber-500' : 'bg-[#353FEF]'
                                  }`}></div>
                                <span className="font-medium text-gray-900 text-sm">{period.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-600">
                                  {periodMoments.length} momento{periodMoments.length !== 1 ? 's' : ''}
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  ${(periodMoments.length * period.price).toLocaleString()} COP
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {periodMoments
                                .sort((a, b) => a.minute - b.minute)
                                .map((moment, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-1 bg-[#353FEF]/10 text-[#353FEF] rounded-md text-xs font-medium"
                                  >
                                    Min {moment.minute}
                                  </span>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline Visualization */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-600" />
                        Cronología del partido
                      </h4>
                      <div className="relative bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 backdrop-blur-sm rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        {/* Timeline line */}
                        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300"></div>

                        {/* Timeline periods */}
                        <div className="flex justify-between relative">
                          {gamePeriods.map((period, index) => {
                            const periodMoments = selectedMoments.filter(m => m.momentId === period.id);
                            const hasSelection = periodMoments.length > 0;

                            return (
                              <div key={period.id} className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm ${hasSelection
                                  ? 'bg-[#353FEF] text-white'
                                  : 'bg-white/80 backdrop-blur-sm text-gray-500'
                                  }`}>
                                  {periodMoments.length || '0'}
                                </div>
                                <div className="mt-1.5 text-center">
                                  <div className="text-xs font-medium text-gray-800">
                                    {period.name.split(' ')[0]}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {period.name.split(' ')[1] || 'Tiempo'}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 backdrop-blur-sm rounded-xl p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="text-base font-bold text-gray-900">
                            {selectedMoments.length * 15}s
                          </div>
                          <div className="text-xs text-gray-600">Tiempo total</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-[#353FEF]/10 via-white to-[#353FEF]/5 backdrop-blur-sm rounded-xl p-2 shadow-[0_2px_12px_rgba(53,63,239,0.04)]">
                          <div className="text-base font-bold text-[#353FEF]">
                            ${totalPrice.toLocaleString()}
                          </div>
                          <div className="text-xs text-[#353FEF]">Total COP</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {selectedMoments.length === 0 && (
                  <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border-0 shadow-[0_4px_16px_rgba(53,63,239,0.04)]">
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-800 mb-1">Selecciona tus momentos</h3>
                      <p className="text-sm text-gray-500">
                        Elige los minutos donde aparecerá tu anuncio
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Modern Mobile Bottom Bar - Optimizado con mejor espaciado */}
      {flowStep === 'select-moments' && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-xl border-t border-white/20 safe-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="p-3 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm">Total</span>
                              <span className="font-semibold text-[#353FEF] text-sm">${totalPrice.toLocaleString()} COP</span>
            </div>
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={ArrowRight}
              disabled={selectedMoments.length === 0}
              onClick={handleContinue}
              className="h-9 text-sm font-medium"
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}