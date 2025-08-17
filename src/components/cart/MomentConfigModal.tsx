import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, Timer, Target, Users, Calendar, MapPin,
  ArrowLeft, AlertCircle, Upload, ChevronRight, ChevronLeft,
  Check, Plus, Minus, Image as ImageIcon, Video, FileText,
  Play, Pause, RotateCcw, Download, Eye, AlertTriangle, Sparkles, Settings
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
  
  // Video upload state - matching EventDetail.tsx exactly
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStepMessage, setCurrentStepMessage] = useState('');
  const [fileReceived, setFileReceived] = useState(false);
  const [processingSteps] = useState([
    'Analizando video...',
    'Verificando duración...',
    'Cortando video a 15 segundos...',
    'Ajustando dimensiones...',
    'Optimizando calidad...',
    'Finalizando procesamiento...'
  ]);

  // Video processing functions - copied exactly from EventDetail.tsx
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
    setCurrentStepMessage(message);
  };

  const processAndAdjustVideo = async (file: File) => {
    try {
      setLoading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Paso 1: Analizar video (más rápido)
      updateProgress(20, processingSteps[0]);
      await new Promise(resolve => setTimeout(resolve, 100)); // Reducido de 300ms a 100ms

      // Paso 2: Obtener duración del video
      updateProgress(35, processingSteps[1]);
      const duration = await getVideoDuration(file);

      // Paso 3: Procesar según duración
      if (duration > 15) {
        updateProgress(50, processingSteps[2]);
        const trimmedFile = await trimVideoTo15Seconds(file);
        await processVideoWithFFmpeg(trimmedFile, true);
      } else {
        updateProgress(60, processingSteps[3]);
        await processVideoWithFFmpeg(file, false);
      }

    } catch (error) {
      console.error('Error procesando video:', error);
      setUploadError('Error al procesar el video. Por favor, intenta con otro archivo.');
      setLoading(false);
      setUploadProgress(0);
      setCurrentStepMessage('');
      setFileReceived(false);
      // Animación de error más rápida
      setUploadProgress(100);
      setCurrentStepMessage('Error en el procesamiento');
      setTimeout(() => {
        setUploadProgress(0);
        setCurrentStepMessage('');
      }, 1000); // Reducido de 2000ms a 1000ms
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
        const stream = canvas.captureStream(60); // Aumentado de 30 FPS a 60 FPS para más fluidez
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8', // Cambiado de vp9 a vp8 para mejor compatibilidad y velocidad
          videoBitsPerSecond: 2500000 // Añadido bitrate específico para mejor calidad/velocidad
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          updateProgress(75, 'Video cortado exitosamente');
          setTimeout(() => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const trimmedFile = new File([blob], `trimmed_${file.name}`, {
              type: 'video/mp4',
              lastModified: Date.now()
            });
            resolve(trimmedFile);
          }, 100); // Reducido de 300ms a 100ms
        };

        // Comenzar grabación
        mediaRecorder.start();
        video.currentTime = 0;
        video.play();

        let startTime = Date.now();
        let lastProgressUpdate = 0;

        const drawFrame = () => {
          const elapsed = (Date.now() - startTime) / 1000;

          // Actualizar progreso del recorte más frecuentemente
          const trimProgress = Math.min((elapsed / 15) * 25, 25); // 25% del progreso total
          const currentProgress = 50 + trimProgress;

          if (currentProgress - lastProgressUpdate >= 1) { // Reducido de 2 a 1 para actualizaciones más frecuentes
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
          updateProgress(75, processingSteps[3]);
        } else {
          updateProgress(80, processingSteps[3]);
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
            setCurrentStepMessage('');
            resolve();
          }).catch(error => {
            console.error('Error convirtiendo a base64:', error);
            setLoading(false);
            setUploadProgress(0);
            setCurrentStepMessage('');
            resolve(); // Continuar aunque falle la conversión
          });
          return;
        }

        // Paso 5: Optimizar calidad
        updateProgress(85, processingSteps[4]);

        // Crear MediaRecorder para el video ajustado
        const stream = canvas.captureStream(60); // Aumentado de 30 a 60 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8', // Cambiado de vp9 a vp8 para mejor velocidad
          videoBitsPerSecond: 2000000 // Bitrate optimizado para velocidad
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

              // Limpiar estados de progreso más rápido
              setTimeout(() => {
                setLoading(false);
                setUploadProgress(0);
                setCurrentStepMessage('');
              }, 200); // Reducido de 500ms a 200ms

              resolve();
            }).catch(error => {
              console.error('Error convirtiendo a base64:', error);

              // Limpiar estados de progreso aunque falle la conversión
              setTimeout(() => {
                setLoading(false);
                setUploadProgress(0);
                setCurrentStepMessage('');
              }, 200); // Reducido de 500ms a 200ms

              resolve(); // Continuar aunque falle la conversión
            });

          }, 200); // Reducido de 500ms a 200ms
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

          // Actualizar progreso de renderizado más frecuentemente
          const renderProgress = Math.min((elapsed / maxDuration) * 10, 10); // 10% del progreso total para renderizado
          const currentProgress = 85 + renderProgress;

          if (currentProgress - lastProgressUpdate >= 0.5) { // Actualizaciones más frecuentes
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
      setCurrentStepMessage('Archivo recibido, validando...');

      // Pequeña pausa para mostrar el feedback (reducida)
      await new Promise(resolve => setTimeout(resolve, 50)); // Reducido de 300ms a 50ms

      // Validar que sea MP4
      if (droppedFile.type !== 'video/mp4') {
        setUploadError('Solo se permiten archivos de video MP4');
        setFileReceived(false);
        setCurrentStepMessage('');
        return;
      }

      // Validar tamaño (100MB máximo para permitir videos más largos)
      if (droppedFile.size > 100 * 1024 * 1024) {
        setUploadError('El archivo no debe superar los 100MB');
        setFileReceived(false);
        setCurrentStepMessage('');
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
      setCurrentStepMessage('Archivo seleccionado, validando...');

      // Pequeña pausa para mostrar el feedback (reducida)
      await new Promise(resolve => setTimeout(resolve, 50)); // Reducido de 300ms a 50ms

      // Validar que sea MP4
      if (selectedFile.type !== 'video/mp4') {
        setUploadError('Solo se permiten archivos de video MP4');
        setFileReceived(false);
        setCurrentStepMessage('');
        return;
      }

      // Validar tamaño (100MB máximo para permitir videos más largos)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setUploadError('El archivo no debe superar los 100MB');
        setFileReceived(false);
        setCurrentStepMessage('');
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
    setCurrentStepMessage('');
    setLoading(false);
    setUploadError(null);
    setFileReceived(false);
  }, []);

  // Define game periods based on event moments in correct order
  const gamePeriods: GamePeriodInfo[] = useMemo(() => {
    const periodMap: { [key: string]: GamePeriodInfo } = {};

    event.moments.forEach(moment => {
      if (moment.moment === 'FirstHalf') {
        periodMap['FirstHalf'] = {
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
        };
      } else if (moment.moment === 'Halftime') {
        periodMap['Halftime'] = {
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
        };
      } else if (moment.moment === 'SecondHalf') {
        periodMap['SecondHalf'] = {
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
        };
      }
    });

    // Return in correct order: FirstHalf, Halftime, SecondHalf
    const orderedPeriods: GamePeriodInfo[] = [];
    if (periodMap['FirstHalf']) orderedPeriods.push(periodMap['FirstHalf']);
    if (periodMap['Halftime']) orderedPeriods.push(periodMap['Halftime']);
    if (periodMap['SecondHalf']) orderedPeriods.push(periodMap['SecondHalf']);

    return orderedPeriods;
  }, [event.moments]);

  // Reset state when modal opens/closes or event changes
  useEffect(() => {
    if (isOpen) {
      // Convert initial moments to detailed moments
      const detailed: DetailedMoment[] = [];
      let hasExistingCreativities = false;
      let existingFile: File | null = null;
      
      initialMoments.forEach((moment, index) => {
        // Check if there are existing creativities
        if (moment.creativities && moment.creativities.length > 0) {
          hasExistingCreativities = true;
          if (!existingFile) {
            existingFile = moment.creativities[0]; // Use first creativity as the main file
          }
        }

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

      // If editing with existing moments and creativities, go to creativities step
      if (detailed.length > 0 && hasExistingCreativities) {
        setCurrentStep('creativities');
      } else {
        setCurrentStep('moments');
      }

      // Load existing creativity if available
      if (hasExistingCreativities && existingFile) {
        loadExistingCreativity(existingFile);
      } else {
        // Clear creativity state if no existing file
        setFile(null);
        setPreview(null);
        setFileBase64(null);
        setFileReceived(false);
      }
    }
  }, [isOpen, initialMoments, event.id, gamePeriods]);

  // Function to load existing creativity for editing
  const loadExistingCreativity = async (existingFile: File) => {
    try {
      console.log('Loading existing creativity for editing:', existingFile.name);
      
      // Set the file state
      setFile(existingFile);
      setFileReceived(true);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(existingFile);
      setPreview(previewUrl);
      
      // Get video duration if it's a video file
      if (existingFile.type.startsWith('video/')) {
        try {
          const duration = await getVideoDuration(existingFile);
          setVideoDuration(Math.min(duration, 15));
        } catch (error) {
          console.warn('Error getting video duration for existing file:', error);
          setVideoDuration(15); // Default to 15 seconds
        }
      }
      
      // Convert to base64
      try {
        const base64 = await convertFileToBase64(existingFile);
        setFileBase64(base64);
        console.log('Existing creativity loaded successfully');
      } catch (error) {
        console.warn('Error converting existing file to base64:', error);
        // Continue without base64 if conversion fails
      }
      
    } catch (error) {
      console.error('Error loading existing creativity:', error);
      setUploadError('Error al cargar el creativo existente');
    }
  };

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

  // Drag and drop handlers - matching EventDetail.tsx exactly
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
      // Validate video upload
      if (!file || !fileBase64) {
        setErrors(['Debes subir un video MP4 de máximo 15 segundos']);
        return;
      }

      // Convert detailed moments back to cart format
      // All moments use the same video file
      const groupedMoments = detailedMoments.reduce((acc, moment) => {
        const key = moment.period;
        if (!acc[key]) {
          acc[key] = {
            moment: moment.momentId,
            price: moment.price,
            quantity: 0,
            period: moment.period as 'FirstHalf' | 'SecondHalf' | 'Halftime',
            creativities: [file] // Same video for all moments
          };
        }
        acc[key].quantity += 1;
        return acc;
      }, {} as { [key: string]: SelectedCartMoment });

      const finalMoments = Object.values(groupedMoments);
      
      // Debug logging
      console.log('Saving moments configuration:', {
        detailedMoments,
        groupedMoments,
        finalMoments,
        videoFile: file,
        videoBase64: fileBase64 ? 'presente' : 'ausente',
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
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] w-full max-w-6xl max-h-[90vh] overflow-hidden border-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#353FEF] via-[#4C5EF7] to-[#2A32C5] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                  <img
                    src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                    alt={event.stadiumName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">
                    {event.homeTeamName} vs {event.awayTeamName}
                  </h2>
                    {initialMoments && initialMoments.length > 0 && (
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Editando</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
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
                className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                aria-label="Cerrar configuración"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-200px)]">
            {/* Step Indicator */}
            <div className="px-6 py-4 bg-white/50 backdrop-blur-sm lg:hidden">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${currentStep === 'moments' ? 'text-[#353FEF]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm ${currentStep === 'moments' ? 'bg-[#353FEF]/10' : 'bg-gray-100'
                    }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Momentos</span>
                </div>
                <div className="w-8 h-px bg-gray-200"></div>
                <div className={`flex items-center ${currentStep === 'creativities' ? 'text-[#353FEF]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm ${currentStep === 'creativities' ? 'bg-[#353FEF]/10' : 'bg-gray-100'
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
                  <div className="p-4 bg-white/50 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Selecciona momentos específicos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {gamePeriods.map((period) => {
                        const isSelected = selectedPeriod === period.id;
                        const momentsInPeriod = detailedMoments.filter(m => m.period === period.id).length;

                        return (
                          <button
                            key={period.id}
                            onClick={() => setSelectedPeriod(period.id)}
                            className={`p-4 rounded-2xl transition-all text-left backdrop-blur-sm ${isSelected
                                ? `bg-[#353FEF]/10 shadow-[0_4px_16px_rgba(53,63,239,0.08)]`
                                : 'bg-white/80 hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`font-semibold ${isSelected ? 'text-[#353FEF]' : 'text-gray-900'}`}>
                                {period.name}
                              </h4>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-[#353FEF] text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {momentsInPeriod}
                              </div>
                            </div>
                            <p className={`text-sm ${isSelected ? 'text-[#353FEF]/80' : 'text-gray-600'} mb-3`}>
                              {period.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isSelected ? 'text-[#353FEF]' : 'text-gray-900'}`}>
                                {formatPrice(period.price)}
                              </span>
                              <span className={`text-xs ${isSelected ? 'text-[#353FEF]/80' : 'text-gray-500'}`}>
                                CPM: ${calculatePeriodCPM(period)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Moment Timeline */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          {currentPeriod.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#353FEF] bg-[#353FEF]/10 px-2 py-1 rounded-lg">
                          <span>Momentos restantes: {calculations.remainingMoments}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        Selecciona los minutos exactos donde quieres mostrar tu publicidad durante {currentPeriod.name.toLowerCase()}
                      </p>
                    </div>

                    {/* Enhanced Moment Selector - Same UX as EventDetail */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(53,63,239,0.08)] overflow-hidden">
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${
                        selectedPeriod === 'FirstHalf' || selectedPeriod === 'SecondHalf' 
                          ? 'from-[#353FEF] to-[#2A32C5]' 
                          : selectedPeriod === 'Halftime' 
                            ? 'from-amber-500 to-amber-600'
                            : 'from-[#353FEF] to-[#2A32C5]'
                      } p-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{currentPeriod.name}</h3>
                              <p className="text-white/90 text-xs">{currentPeriod.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/90 text-xs">Precio por momento</p>
                            <p className="text-white font-bold text-lg">
                              {formatPrice(currentPeriod.price)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Moment Selector Content */}
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-800">Selecciona los minutos</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                                {detailedMoments.filter(moment => moment.period === selectedPeriod).length} seleccionados
                              </span>
                              {calculations.remainingMoments <= 3 && calculations.remainingMoments > 0 && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium">
                                  {calculations.remainingMoments} restantes
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">
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
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-600">Momentos seleccionados en {currentPeriod.name}</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  Minutos: {detailedMoments
                                    .filter(moment => moment.period === selectedPeriod)
                                    .map(m => m.minute)
                                    .sort((a, b) => a - b)
                                    .join(', ')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">Subtotal</p>
                                <p className="font-bold text-[#353FEF] text-sm">
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


                  </div>
                </div>
              ) : (
                <div className="h-full p-4 overflow-y-auto">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {initialMoments && initialMoments.length > 0 
                        ? 'Edita tu pieza creativa' 
                        : 'Sube tu pieza creativa'
                      }
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {initialMoments && initialMoments.length > 0 
                        ? 'Puedes mantener el video actual o subir uno nuevo. El video se reproducirá en todos los momentos seleccionados.'
                        : 'El mismo video se reproducirá en todos los momentos seleccionados.'
                      }
                    </p>
                  </div>

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
                              {currentStepMessage || 'Preparando para procesar...'}
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
                          <div className="flex flex-col items-center justify-center py-8 px-6"> {/* Reducido padding de py-12 a py-8 */}
                            {/* Progress Circle - Más compacto */}
                            <div className="relative w-16 h-16 mb-4"> {/* Reducido de w-20 h-20 mb-6 */}
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  stroke="currentColor"
                                  strokeWidth="6" 
                                  fill="none"
                                  className="text-neutral-200"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 45}`}
                                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - uploadProgress / 100)}`}
                                  className="text-[#353FEF] transition-all duration-200 ease-out" 
                                  strokeLinecap="round"
                                />
                              </svg>
                              {/* Percentage text */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-base font-bold text-[#353FEF]"> 
                                  {Math.round(uploadProgress)}%
                              </span>
                            </div>
                          </div>

                            {/* Current step */}
                            <div className="text-center mb-3"> {/* Reducido mb-4 a mb-3 */}
                              <p className="text-sm font-medium text-neutral-800 mb-1"> {/* Reducido text-base a text-sm y mb-2 a mb-1 */}
                                {currentStepMessage || 'Iniciando procesamiento...'}
                              </p>
                              <p className="text-xs text-neutral-500"> {/* Reducido text-sm a text-xs */}
                                Procesando video, casi terminamos...
                              </p>
                            </div>

                            {/* Progress bar - Más compacto */}
                            <div className="w-full max-w-xs"> {/* Reducido de max-w-md a max-w-xs */}
                              <div className="w-full bg-neutral-200 rounded-full h-1.5 mb-3"> {/* Reducido h-2 a h-1.5 y mb-4 a mb-3 */}
                                <div
                                  className="bg-gradient-to-r from-[#353FEF] to-[#2A32C5] h-1.5 rounded-full transition-all duration-200 ease-out" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                                    </div>

                              {/* Steps indicator - Más compacto */}
                              <div className="flex justify-between text-xs text-neutral-500"> {/* Reducido de text-xs */}
                                <span className={uploadProgress >= 20 ? 'text-[#353FEF] font-medium' : ''}> 
                                  Análisis
                                    </span>
                                <span className={uploadProgress >= 50 ? 'text-[#353FEF] font-medium' : ''}> 
                                  {videoDuration > 15 ? 'Recorte' : 'Validación'}
                                </span>
                                <span className={uploadProgress >= 80 ? 'text-[#353FEF] font-medium' : ''}> 
                                  Ajuste
                                </span>
                                <span className={uploadProgress >= 95 ? 'text-[#353FEF] font-medium' : ''}> 
                                  Finalización
                                  </span>
                              </div>
                                </div>

                            {/* Animated dots - Más rápidos */}
                            <div className="flex space-x-1 mt-4"> {/* Reducido mt-6 a mt-4 */}
                              <div className="w-1.5 h-1.5 bg-[#353FEF] rounded-full animate-bounce"></div> {/* Reducido w-2 h-2 a w-1.5 h-1.5 */}
                              <div className="w-1.5 h-1.5 bg-[#353FEF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-[#353FEF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="relative w-full max-w-[400px] mx-auto">
                              {/* Vista previa mejorada con altura fija */}
                              <div className="relative w-full bg-neutral-900 rounded-lg overflow-hidden" style={{ height: '120px' }}>
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
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <p className="text-sm text-neutral-800 font-medium">{file.name}</p>
                                {initialMoments && initialMoments.length > 0 && (
                                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                                    <Settings className="w-3 h-3" />
                                    <span>Video existente</span>
                                  </div>
                                )}
                              </div>
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
                                {initialMoments && initialMoments.length > 0 && (
                                  <span className="block text-blue-600 mt-1">
                                    📝 Editando configuración existente - Puedes cambiar el video si lo deseas
                                  </span>
                                )}
                              </div>
                              {initialMoments && initialMoments.length > 0 && (
                                <div className="mt-3">
                                  <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors text-sm"
                                  >
                                    Cambiar video
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="mt-2 text-sm text-error-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {uploadError}
                    </div>
                  )}

                  {/* Resumen de momentos seleccionados */}
                  {detailedMoments.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50/50 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-3">Momentos donde se reproducirá:</h4>
                      <div className="space-y-2">
                        {gamePeriods.map((period) => {
                          const momentsInPeriod = detailedMoments.filter(m => m.period === period.id);
                          if (momentsInPeriod.length === 0) return null;

                          return (
                            <div key={period.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${period.id === 'Halftime' ? 'bg-amber-500' : 'bg-[#353FEF]'}`}></div>
                                <span className="text-sm font-medium">{period.name}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                Minutos: {momentsInPeriod.map(m => m.minute).sort((a, b) => a - b).join(', ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    </div>
                  )}
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
            <div className="w-full lg:w-80 bg-white/50 backdrop-blur-sm p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen</h3>

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

                <div className="bg-gray-50/50 rounded-xl p-3 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Momentos totales:</span>
                    <span className="font-medium text-sm">
                      {calculations.totalMoments} / {event.maxMoments}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Audiencia estimada:</span>
                    <span className="font-medium text-xs">
                      {(calculations.totalAudience).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-bold text-lg text-[#353FEF]">
                      {formatPrice(calculations.totalPrice)}
                    </span>
                  </div>

                  {calculations.totalAudience > 0 && (
                    <div className="p-2 bg-[#353FEF]/10 rounded-lg">
                      <div className="flex items-center gap-2 text-[#353FEF]">
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          CPM: ${(calculations.costPerImpression * 1000).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {currentStep === 'creativities' && (
                  <button
                    onClick={() => setCurrentStep('moments')}
                    className="w-full px-4 py-2 text-gray-700 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a momentos
                  </button>
                )}

                <button
                  onClick={validateAndSave}
                  disabled={currentStep === 'moments' ? (!calculations.isValid || detailedMoments.length === 0) : (!file || !fileBase64)}
                  className="w-full px-4 py-2 bg-[#353FEF] text-white rounded-lg hover:bg-[#2A32C5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                >
                  {currentStep === 'moments' ? 'Continuar a creatividades' : 'Guardar configuración'}
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50/50 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </motion.div>


      </motion.div>
    </AnimatePresence>
  );
};

export default MomentConfigModal;