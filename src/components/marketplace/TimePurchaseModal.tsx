import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, ArrowRight, Upload, Check,
  Info, AlertTriangle, ChevronLeft, ChevronRight,
  Play, Pause, DollarSign, Wallet, Sparkles,
  Maximize, Minimize, RotateCw, Crop, Move, Scissors, Monitor,
  Brain, TrendingUp, Edit3, CheckCircle, ArrowLeft, Trash2, Palette, Sliders, Image
} from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Screen } from '../../types/index';
import { useDropzone } from 'react-dropzone';
import { mlPricingService, getPeakHourBadgeColor } from '../../services/pricingMLService';
// Removed ImageEditor import - now integrated inline

// Mobile-optimized spacing system
const spacing = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4', 
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
  xl: 'p-6 sm:p-10'
};

const gaps = {
  xs: 'gap-2 sm:gap-3',
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8'
};

// Mobile-first custom styles
const customStyles = `
  /* Mobile-first slider styles */
  .mobile-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    outline: none;
    border-radius: 9999px;
    height: 6px;
    touch-action: manipulation;
  }
  
  .mobile-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    cursor: pointer;
    border: 3px solid #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
  }
  
  .mobile-slider::-webkit-slider-thumb:active {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
  }
  
  @media (min-width: 640px) {
    .mobile-slider {
      height: 8px;
    }
    
    .mobile-slider::-webkit-slider-thumb {
      width: 22px;
      height: 22px;
    }
  }
  
  /* Mobile calendar optimizations */
  .mobile-calendar-day {
    min-height: 44px;
    min-width: 44px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
  }
  
  @media (min-width: 640px) {
    .mobile-calendar-day {
      min-height: 48px;
      min-width: 48px;
      border-radius: 16px;
      font-size: 16px;
    }
  }
  
  /* Mobile time slot grid - similar to calendar */
  .mobile-time-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  
  @media (min-width: 480px) {
    .mobile-time-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }
  }
  
  @media (min-width: 640px) {
    .mobile-time-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
    }
  }
  
  @media (min-width: 768px) {
    .mobile-time-grid {
      grid-template-columns: repeat(7, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .mobile-time-grid {
      grid-template-columns: repeat(8, 1fr);
    }
  }
  
  /* Time slot buttons - similar to calendar days */
  .mobile-time-slot {
    aspect-ratio: 1;
    min-height: 44px;
    min-width: 44px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  @media (min-width: 640px) {
    .mobile-time-slot {
      min-height: 48px;
      min-width: 48px;
      border-radius: 16px;
      font-size: 14px;
    }
  }
  
  /* Mobile touch targets */
  .mobile-touch-target {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Mobile modal adjustments */
  @media (max-width: 640px) {
    .mobile-modal {
      margin: 8px;
      border-radius: 24px;
      max-height: calc(100vh - 16px);
    }
    
    .mobile-modal-header {
      padding: 16px 20px;
    }
    
    .mobile-modal-content {
      padding: 8px 20px 16px;
    }
    
    .mobile-modal-footer {
      padding: 16px 20px;
    }
  }
  
  /* Canvas touch optimization */
  .mobile-canvas {
    touch-action: pan-x pan-y;
    user-select: none;
    -webkit-user-select: none;
  }
  
  /* Mobile filter preset grid */
  .mobile-filter-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  @media (min-width: 480px) {
    .mobile-filter-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
  }
  
  /* Mobile video controls */
  .mobile-video-controls {
    padding: 12px;
  }
  
  @media (min-width: 640px) {
    .mobile-video-controls {
      padding: 20px;
    }
  }
  
  /* Smooth transitions optimized for mobile */
  .mobile-transition {
    transition: all 0.2s ease;
    will-change: transform;
  }
  
  /* Mobile-specific hover states (disabled on touch devices) */
  @media (hover: hover) {
    .mobile-hover:hover {
      transform: translateY(-2px);
    }
  }
  
  /* Legacy slider support for desktop */
  .modern-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    outline: none;
    border-radius: 9999px;
    height: 8px;
  }
  
  .modern-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    cursor: pointer;
    border: 3px solid #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  .modern-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: #6366f1;
  }
  
  .modern-slider::-webkit-slider-thumb:active {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);
  }
  
  .modern-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    cursor: pointer;
    border: 3px solid #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .modern-slider::-webkit-slider-track {
    height: 8px;
    border-radius: 4px;
    background: transparent;
  }
  
  .modern-slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: transparent;
    border: none;
  }
  
  /* Smooth transitions for interactive elements */
  .filter-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .filter-card:hover {
    transform: translateY(-2px);
  }
  
  /* Upload area effects */
  .upload-area-glow {
    position: relative;
    overflow: hidden;
  }
  
  .upload-area-glow::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  .upload-area-glow:hover::before {
    opacity: 0.1;
  }
  
  .glass-effect {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .gradient-border {
    background: linear-gradient(white, white) padding-box,
                linear-gradient(45deg, #3b82f6, #8b5cf6) border-box;
    border: 2px solid transparent;
  }
  
  /* Loading shimmer effect for lazy loading */
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  /* Pulse animation for dynamic elements */
  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
    }
    50% { 
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
    }
  }
  
  .pulse-glow {
    animation: pulse-glow 2s infinite;
  }
`;

// Bundle type definition (matching PurchaseOptions)
interface Bundle {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  frequency: {
    type: string; // '1min', '2min', '5min', '10min', '15min', '30min', '1hour'
    displayText: string; // 'Se muestra cada 2 minutos'
    spotsPerHour: number;
    totalSpots: number; // Calculated based on package type
  };
  isHighlighted?: boolean;
}

// Animation variants
const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const contentVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    } 
  },
  exit: { 
    scale: 0.95, 
    opacity: 0, 
    transition: { 
      duration: 0.2 
    } 
  }
};

const stepVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      delay: 0.1 
    } 
  },
  exit: { 
    x: -20, 
    opacity: 0, 
    transition: { 
      duration: 0.2 
    } 
  }
};

const calendarItemVariants = {
  hover: { 
    scale: 1.1, 
    backgroundColor: "#DBEAFE", 
    transition: { duration: 0.2 } 
  },
  selected: {
    scale: [1, 1.15, 1],
    backgroundColor: "#DBEAFE",
    color: "#000000",
    transition: { duration: 0.5 }
  }
};

const timeSlotVariants = {
  hover: { 
    y: -2, 
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: { duration: 0.2 } 
  },
  selected: {
    scale: [1, 1.05, 1],
    borderColor: "#3B82F6",
    backgroundColor: "#EBF8FF",
    transition: { duration: 0.3 }
  }
};

// Estilos para el calendario y días
const dayNameVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.3 } 
  }
};

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageValidation {
  isValid: boolean;
  hasCorrectDimensions: boolean;
  hasCorrectAspectRatio: boolean;
  message: string;
  recommendation: string;
}

// Image Editor interfaces integrated
interface ImageTransformations {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  vintage: number;
}

interface VideoTrimSettings {
  startTime: number;
  endTime: number;
  targetDuration: number;
}

interface VideoValidation {
  isValid: boolean;
  hasCorrectDuration: boolean;
  hasCorrectResolution: boolean;
  message: string;
  recommendation: string;
}

// Mobile-optimized LazyFilterPreset component
const MobileLazyFilterPreset = React.memo(({ preset, index, selectedPreset, onApply }: {
  preset: any;
  index: number;
  selectedPreset: string;
  onApply: (preset: any) => void;
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), index * 20);
    return () => clearTimeout(timer);
  }, [index]);
  
  const handleApply = React.useCallback(() => {
    onApply(preset);
  }, [preset, onApply]);
  
  if (!isLoaded) {
    return (
      <div className="p-2 sm:p-3 rounded-lg border border-gray-200 bg-white">
        <div className="w-full h-3 sm:h-4 rounded bg-gray-200 shimmer mb-2" />
        <div className="text-center space-y-1">
          <div className="w-4 h-4 bg-gray-200 shimmer rounded mx-auto" />
          <div className="w-8 h-2 bg-gray-200 shimmer rounded mx-auto" />
        </div>
      </div>
    );
  }
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleApply}
      className={`mobile-touch-target p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
        selectedPreset === preset.id
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : 'border-gray-200 hover:border-purple-300 bg-white'
      }`}
    >
      {/* Filter Preview - smaller on mobile */}
      <div className={`w-full h-3 sm:h-4 rounded bg-gradient-to-r ${preset.gradient} mb-2 transition-transform`} />
      
      {/* Filter Info - compact on mobile */}
      <div className="text-center">
        <div className="text-sm sm:text-base mb-0.5">{preset.emoji}</div>
        <div className="text-xs sm:text-sm font-medium text-gray-700">{preset.name}</div>
      </div>
      
      {/* Selection Indicator */}
      {selectedPreset === preset.id && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-2.5 h-2.5 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
});

// Filter presets for integrated editor
const FILTER_PRESETS = [
  { 
    id: 'none', 
    name: 'Original', 
    emoji: '📷',
    values: {},
    gradient: 'from-gray-400 to-gray-500'
  },
  { 
    id: 'vivid', 
    name: 'Vibrante', 
    emoji: '🌈',
    values: { saturation: 1.4, contrast: 1.15, brightness: 1.05 },
    gradient: 'from-pink-400 to-purple-500'
  },
  { 
    id: 'warm', 
    name: 'Cálido', 
    emoji: '🌅',
    values: { brightness: 1.1, saturation: 1.2, hue: 10 },
    gradient: 'from-orange-400 to-red-500'
  },
  { 
    id: 'cool', 
    name: 'Fresco', 
    emoji: '❄️',
    values: { brightness: 0.95, saturation: 1.1, hue: -15 },
    gradient: 'from-blue-400 to-cyan-500'
  },
  { 
    id: 'dramatic', 
    name: 'Dramático', 
    emoji: '🎭',
    values: { contrast: 1.3, brightness: 0.9, saturation: 1.1 },
    gradient: 'from-gray-800 to-black'
  },
  { 
    id: 'soft', 
    name: 'Suave', 
    emoji: '☁️',
    values: { brightness: 1.05, contrast: 0.9, blur: 0.5 },
    gradient: 'from-pink-200 to-purple-300'
  }
];

interface TimePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  screen: Screen | null;
  purchaseType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'momentos' | null;
  selectedBundle?: Bundle | null;
  onComplete: (data: any) => void;
}

export function TimePurchaseModal({ 
  isOpen, 
  onClose, 
  screen,
  purchaseType,
  selectedBundle,
  onComplete
}: TimePurchaseModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadLater, setUploadLater] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for moments (minute selection)
  const [selectedMoments, setSelectedMoments] = useState<{
    date: Date | null;
    time: string | null;
    minute: number | null;
  }[]>([{ date: null, time: null, minute: null }]);
  const [activeMomentIndex, setActiveMomentIndex] = useState(0);
  
  // Image validation states
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [imageValidation, setImageValidation] = useState<ImageValidation | null>(null);
  
  // Integrated Image Editor states
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImageBlob, setEditedImageBlob] = useState<Blob | null>(null);
  const [editedImagePreview, setEditedImagePreview] = useState<string | null>(null);
  const [isImageEdited, setIsImageEdited] = useState(false);
  
  // Image transformation states
  const [imageTransformations, setImageTransformations] = useState<ImageTransformations>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    brightness: 1,
    contrast: 1,
    saturation: 1,
    hue: 0,
    blur: 0,
    sharpen: 0,
    vintage: 0
  });
  const [selectedPreset, setSelectedPreset] = useState('none');
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  
  // Touch gesture states for mobile optimization
  const [touches, setTouches] = useState<React.TouchList | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const [isGesturing, setIsGesturing] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [initialTransform, setInitialTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isMobileEditor, setIsMobileEditor] = useState(false);
  
  // Canvas and image refs for integrated editor
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  // Video validation states
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isVideoValid, setIsVideoValid] = useState(false);
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number } | null>(null);
  const [videoValidation, setVideoValidation] = useState<VideoValidation | null>(null);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoTrimSettings, setVideoTrimSettings] = useState<VideoTrimSettings>({ startTime: 0, endTime: 0, targetDuration: 0 });
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [trimmedVideoBlob, setTrimmedVideoBlob] = useState<Blob | null>(null);
  const [trimmedVideoPreview, setTrimmedVideoPreview] = useState<string | null>(null);
  const [isVideoTrimmed, setIsVideoTrimmed] = useState(false);
  
  // Animation states
  const [animatingDate, setAnimatingDate] = useState<Date | null>(null);
  const [animatingTime, setAnimatingTime] = useState<string | null>(null);

  // Helper function to get image dimensions
  const getImageDimensions = (file: File): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve({ width: 0, height: 0 }); // For videos, we'll skip dimension validation
        return;
      }

      const img = document.createElement('img');
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to get video duration and validate
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('video/')) {
        resolve(0);
        return;
      }

      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  };

  const getVideoResolution = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('video/')) {
        resolve({ width: 0, height: 0 });
        return;
      }

      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight });
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  };

  // Validate video against screen specifications
  const validateVideo = (duration: number, resolution: { width: number; height: number } | null, screen: Screen): VideoValidation => {
    if (!screen) {
      return {
        isValid: false,
        hasCorrectDuration: false,
        hasCorrectResolution: false,
        message: 'No se pudo validar el video',
        recommendation: 'Intenta subir el video nuevamente'
      };
    }

    // Check duration
    const videoSpotDuration = screen?.specs?.videoSpotDuration;
    const targetDuration = videoSpotDuration || 30; // Default to 30 seconds if not specified
    const hasCorrectDuration = Math.abs(duration - targetDuration) <= 0.5; // 0.5 second tolerance

    // Check resolution
    const screenWidth = screen.specs.width;
    const screenHeight = screen.specs.height;
    const hasCorrectResolution = resolution ? 
      (resolution.width === screenWidth && resolution.height === screenHeight) : false;

    const isValid = hasCorrectDuration && hasCorrectResolution;

    let message = '';
    let recommendation = '';

    if (isValid) {
      message = '¡Perfecto! Tu video está listo para la pantalla';
      recommendation = 'El video cumple con todos los requisitos técnicos';
    } else if (!hasCorrectDuration && !hasCorrectResolution) {
      message = `Tu video necesita ajustes de duración y resolución`;
      recommendation = `Debe durar exactamente ${targetDuration}s y tener resolución ${screenWidth}x${screenHeight}px`;
    } else if (!hasCorrectDuration) {
      message = `Tu video debe durar exactamente ${targetDuration} segundos`;
      recommendation = `Actualmente dura ${duration.toFixed(1)}s. Usa el editor para recortarlo`;
    } else if (!hasCorrectResolution) {
      message = `Tu video debe tener resolución ${screenWidth}x${screenHeight}px`;
      recommendation = `Actualmente tiene ${resolution?.width}x${resolution?.height}px. Sube un video con la resolución correcta`;
    }

    return {
      isValid,
      hasCorrectDuration,
      hasCorrectResolution,
      message,
      recommendation
    };
  };

  // Check if screen supports videos
  const screenSupportsVideo = (screen: Screen): boolean => {
    // If supportsVideo is explicitly set to false, don't allow videos
    if (screen?.specs?.supportsVideo === false) return false;
    
    // If supportsVideo is not set or is true, allow videos
    // This makes it more permissive - most screens should support videos unless explicitly disabled
    return true;
  };

  // Validate image against screen specifications
  const validateImage = (dimensions: ImageDimensions, screen: Screen): ImageValidation => {
    if (!screen || dimensions.width === 0 || dimensions.height === 0) {
      return {
        isValid: true,
        hasCorrectDimensions: true,
        hasCorrectAspectRatio: true,
        message: '',
        recommendation: ''
      };
    }

    const screenWidth = screen.specs.width;
    const screenHeight = screen.specs.height;
    const screenAspectRatio = screenWidth / screenHeight;
    const imageAspectRatio = dimensions.width / dimensions.height;

    const hasCorrectDimensions = dimensions.width === screenWidth && dimensions.height === screenHeight;
    const hasCorrectAspectRatio = Math.abs(screenAspectRatio - imageAspectRatio) < 0.1; // Allow 10% tolerance

    if (hasCorrectDimensions) {
      return {
        isValid: true,
        hasCorrectDimensions: true,
        hasCorrectAspectRatio: true,
        message: '¡Perfecto! Tu creatividad está lista para brillar en grande',
        recommendation: 'La imagen ha sido optimizada y se ajusta perfectamente a la pantalla'
      };
    }

    if (hasCorrectAspectRatio) {
      return {
        isValid: true,
        hasCorrectDimensions: false,
        hasCorrectAspectRatio: true,
        message: 'Tu imagen tiene la proporción correcta pero diferente resolución.',
        recommendation: `Recomendamos subir una imagen de ${screenWidth}x${screenHeight}px para mejor calidad.`
      };
    }

    return {
      isValid: false,
      hasCorrectDimensions: false,
      hasCorrectAspectRatio: false,
      message: 'Tu imagen no coincide con las dimensiones de la pantalla.',
      recommendation: `Para mejor resultado, sube una imagen de ${screenWidth}x${screenHeight}px. Puedes adaptar esta imagen, pero podría verse distorsionada.`
    };
  };



  // Calculate minimum scale to prevent white spaces
  const getMinimumScale = React.useCallback(() => {
    if (!image || !screen) return 1;
    
    const scaleX = screen.specs.width / image.width;
    const scaleY = screen.specs.height / image.height;
    const minBaseScale = Math.max(scaleX, scaleY);
    
    return Math.max(1, minBaseScale);
  }, [image, screen]);

  // Update transformations with validation
  const updateTransformations = React.useCallback((updates: Partial<ImageTransformations>) => {
    let newTransformations = { ...imageTransformations, ...updates };
    
    // Validate scale to prevent white spaces
    if (updates.scale !== undefined) {
      const minScale = getMinimumScale();
      newTransformations.scale = Math.max(minScale, updates.scale);
    }
    
    // Validate position to keep image within bounds
    if (image && screen && canvasSize.width > 0 && canvasSize.height > 0) {
      const frameScale = Math.min(canvasSize.width / screen.specs.width, canvasSize.height / screen.specs.height) * 0.9;
      const frameWidth = screen.specs.width * frameScale;
      const frameHeight = screen.specs.height * frameScale;
      
      const scaleX = frameWidth / image.width;
      const scaleY = frameHeight / image.height;
      const scale = Math.max(scaleX, scaleY);
      
      const scaledWidth = image.width * scale * newTransformations.scale;
      const scaledHeight = image.height * scale * newTransformations.scale;
      
      // Calculate maximum allowed movement
      const maxX = Math.max(0, (scaledWidth - frameWidth) / 2);
      const maxY = Math.max(0, (scaledHeight - frameHeight) / 2);
      
      // Clamp position values
      if (updates.x !== undefined) {
        newTransformations.x = Math.max(-maxX, Math.min(maxX, updates.x));
      }
      if (updates.y !== undefined) {
        newTransformations.y = Math.max(-maxY, Math.min(maxY, updates.y));
      }
    }
    
    setImageTransformations(newTransformations);
  }, [imageTransformations, getMinimumScale, image, screen, canvasSize]);

  // Apply canvas filters
  const applyCanvasFilters = (ctx: CanvasRenderingContext2D, t: ImageTransformations) => {
    const filters = [];
    
    if (t.brightness !== 1) filters.push(`brightness(${t.brightness})`);
    if (t.contrast !== 1) filters.push(`contrast(${t.contrast})`);
    if (t.saturation !== 1) filters.push(`saturate(${t.saturation})`);
    if (t.hue !== 0) filters.push(`hue-rotate(${t.hue}deg)`);
    if (t.blur > 0) filters.push(`blur(${t.blur}px)`);
    
    ctx.filter = filters.join(' ') || 'none';
  };

  // Draw image on canvas
  const drawImageOnCanvas = React.useCallback(() => {
    if (!canvasRef.current || !image || !screen) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    
    // Calculate frame dimensions
    const frameScale = Math.min(canvas.width / screen.specs.width, canvas.height / screen.specs.height) * 0.9;
    const frameWidth = screen.specs.width * frameScale;
    const frameHeight = screen.specs.height * frameScale;
    const frameX = (canvas.width - frameWidth) / 2;
    const frameY = (canvas.height - frameHeight) / 2;
    
    // Translate to frame center
    ctx.translate(frameX + frameWidth / 2, frameY + frameHeight / 2);
    ctx.rotate((imageTransformations.rotation * Math.PI) / 180);
    ctx.scale(
      imageTransformations.flipX ? -imageTransformations.scale : imageTransformations.scale,
      imageTransformations.flipY ? -imageTransformations.scale : imageTransformations.scale
    );
    
    // Apply filters
    applyCanvasFilters(ctx, imageTransformations);
    
    // Calculate dimensions to fill completely
    const scaleX = frameWidth / image.width;
    const scaleY = frameHeight / image.height;
    const scale = Math.max(scaleX, scaleY);
    
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    
    // Apply user positioning
    const offsetX = imageTransformations.x;
    const offsetY = imageTransformations.y;
    
    // Draw image
    ctx.drawImage(
      image,
      -scaledWidth / 2 + offsetX,
      -scaledHeight / 2 + offsetY,
      scaledWidth,
      scaledHeight
    );
    
    ctx.restore();
    
    // Draw frame border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
  }, [image, imageTransformations, screen]);

  // Generate final image
  const generateFinalImage = React.useCallback(async (): Promise<Blob> => {
    if (!image || !screen) throw new Error('No image or screen available');
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = screen.specs.width;
    outputCanvas.height = screen.specs.height;
    
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) throw new Error('Could not get output context');
    
    // Fill with white background
    outputCtx.fillStyle = '#ffffff';
    outputCtx.fillRect(0, 0, screen.specs.width, screen.specs.height);
    
    // Apply transformations
    outputCtx.save();
    outputCtx.translate(screen.specs.width / 2, screen.specs.height / 2);
    outputCtx.rotate((imageTransformations.rotation * Math.PI) / 180);
    
    const finalScale = imageTransformations.scale;
    outputCtx.scale(
      imageTransformations.flipX ? -finalScale : finalScale,
      imageTransformations.flipY ? -finalScale : finalScale
    );
    
    applyCanvasFilters(outputCtx, imageTransformations);
    
    // Calculate base scaling
    const baseScaleX = screen.specs.width / image.width;
    const baseScaleY = screen.specs.height / image.height;
    const baseScale = Math.max(baseScaleX, baseScaleY);
    
    const finalWidth = image.width * baseScale;
    const finalHeight = image.height * baseScale;
    
    // Calculate coordinate scale
    const previewFrameScale = Math.min(canvasSize.width / screen.specs.width, canvasSize.height / screen.specs.height) * 0.9;
    const coordinateScale = screen.specs.width / (screen.specs.width * previewFrameScale);
    
    const offsetX = imageTransformations.x * coordinateScale;
    const offsetY = imageTransformations.y * coordinateScale;
    
    outputCtx.drawImage(
      image,
      -finalWidth / 2 + offsetX,
      -finalHeight / 2 + offsetY,
      finalWidth,
      finalHeight
    );
    
    outputCtx.restore();
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      }, 'image/jpeg', 0.95);
    });
  }, [image, imageTransformations, screen, canvasSize]);

  // Handle integrated image editing
  const handleStartImageEdit = () => {
    if (file && file.type.startsWith('image/') && screen) {
      setIsEditingImage(true);
      
      // Load image for editing
      const img = document.createElement('img');
      img.onload = () => {
        setImage(img);
        
        // Calculate canvas size
        const aspectRatio = screen.specs.width / screen.specs.height;
        let width = 600;
        let height = width / aspectRatio;
        
        if (height > 400) {
          height = 400;
          width = height * aspectRatio;
        }
        
        setCanvasSize({ width, height });
        
        // Reset transformations with minimum scale starting from 1
        setImageTransformations({
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          flipX: false,
          flipY: false,
          brightness: 1,
          contrast: 1,
          saturation: 1,
          hue: 0,
          blur: 0,
          sharpen: 0,
          vintage: 0
        });
      };
      img.src = filePreview!;
    }
  };

  // Handle apply edits
  const handleApplyEdits = async () => {
    try {
      const blob = await generateFinalImage();
      setEditedImageBlob(blob);
      setEditedImagePreview(URL.createObjectURL(blob));
    setIsImageEdited(true);
      setIsEditingImage(false);
    
    // Update validation to success
    setImageValidation({
      isValid: true,
      hasCorrectDimensions: true,
      hasCorrectAspectRatio: true,
      message: '¡Perfecto! Tu creatividad está lista para brillar en grande',
      recommendation: 'La imagen ha sido optimizada y se ajusta perfectamente a la pantalla'
    });
    } catch (error) {
      console.error('Error generating final image:', error);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setIsEditingImage(false);
    setImage(null);
  };

  // Reset edited image
  const resetEditedImage = () => {
    setEditedImageBlob(null);
    setEditedImagePreview(null);
    setIsImageEdited(false);
    setIsEditingImage(false);
    setImage(null);
    
    // Re-validate original image
    if (file && file.type.startsWith('image/') && screen && imageDimensions) {
      const validation = validateImage(imageDimensions, screen);
      setImageValidation(validation);
    }
  };

  // Video trimming functions
  const handleStartVideoEdit = () => {
    if (!file || !screen) return;
    
    const targetDuration = screen.specs.videoSpotDuration || 30;
    setVideoTrimSettings({
      startTime: 0,
      endTime: Math.min(videoDuration || 0, targetDuration),
      targetDuration: targetDuration
    });
    setIsEditingVideo(true);
  };

  const handleVideoTrimChange = (startTime: number, endTime: number) => {
    setVideoTrimSettings(prev => ({
      ...prev,
      startTime,
      endTime
    }));
  };

  const trimVideo = async (videoFile: File, startTime: number, endTime: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.muted = true;
      video.crossOrigin = 'anonymous';
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Error de canvas'));
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const stream = canvas.captureStream(25); // Optimized FPS
        const recorder = new MediaRecorder(stream, { 
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }));
        
        video.currentTime = startTime;
        video.onseeked = () => {
          recorder.start();
          video.play();
          
          const renderFrame = () => {
            if (video.currentTime >= endTime || video.paused) {
              video.pause();
              recorder.stop();
              return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(renderFrame);
          };
          
          renderFrame();
          
          // Auto-stop after duration
          setTimeout(() => {
            video.pause();
            recorder.stop();
          }, (endTime - startTime) * 1000 + 100); // Small buffer
        };
      };
      
      video.onerror = () => reject(new Error('Error cargando video'));
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const handleApplyVideoTrim = async () => {
    if (!file || !screen) return;
    
    try {
      setIsProcessingVideo(true);
      const trimmedBlob = await trimVideo(file, videoTrimSettings.startTime, videoTrimSettings.endTime);
      
      // Clean up previous preview
      if (trimmedVideoPreview) {
        URL.revokeObjectURL(trimmedVideoPreview);
      }
      
      const trimmedPreview = URL.createObjectURL(trimmedBlob);
      
      setTrimmedVideoBlob(trimmedBlob);
      setTrimmedVideoPreview(trimmedPreview);
      setIsVideoTrimmed(true);
      setIsEditingVideo(false);
      setIsProcessingVideo(false);
      
      // Validate trimmed video
      const trimmedDuration = videoTrimSettings.endTime - videoTrimSettings.startTime;
      const validation = validateVideo(trimmedDuration, videoResolution, screen);
      setVideoValidation(validation);
      setIsVideoValid(validation.isValid);
      setError(validation.isValid ? null : validation.message);
      
    } catch (error) {
      setIsProcessingVideo(false);
      console.error('Error trimming video:', error);
      setError('Error procesando video. Inténtalo de nuevo.');
    }
  };

  const handleCancelVideoEdit = () => {
    setIsEditingVideo(false);
    setVideoTrimSettings({ startTime: 0, endTime: 0, targetDuration: 0 });
  };

  // Cleanup function for memory management
  const cleanupResources = React.useCallback(() => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    if (editedImagePreview) URL.revokeObjectURL(editedImagePreview);
    if (trimmedVideoPreview) URL.revokeObjectURL(trimmedVideoPreview);
  }, [filePreview, editedImagePreview, trimmedVideoPreview]);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanupResources;
  }, [cleanupResources]);

  // Canvas drawing effect
  React.useEffect(() => {
    if (isEditingImage && image) {
      drawImageOnCanvas();
    }
  }, [isEditingImage, image, imageTransformations, drawImageOnCanvas]);

  // Mouse/touch handlers for canvas
  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    if (!isEditingImage) return;
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setLastPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [isEditingImage]);

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging || !isEditingImage) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      const deltaX = currentPos.x - lastPos.x;
      const deltaY = currentPos.y - lastPos.y;
      
      updateTransformations({
        x: imageTransformations.x + deltaX,
        y: imageTransformations.y + deltaY
      });
      
      setLastPos(currentPos);
    }
  }, [isDragging, lastPos, imageTransformations.x, imageTransformations.y, updateTransformations, isEditingImage]);

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Apply preset function
  const applyPreset = React.useCallback((preset: typeof FILTER_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    updateTransformations(preset.values);
  }, [updateTransformations]);

  // Touch gesture functions for mobile optimization
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!isEditingImage) return;
    e.preventDefault();
    
    const touches = e.touches;
    setTouches(touches);
    setIsGesturing(true);
    
    if (touches.length === 1) {
      // Single touch - pan
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setPanStart({
          x: touches[0].clientX - rect.left,
          y: touches[0].clientY - rect.top
        });
        setInitialTransform({
          x: imageTransformations.x,
          y: imageTransformations.y,
          scale: imageTransformations.scale
        });
      }
    } else if (touches.length === 2) {
      // Multi-touch - pinch to zoom
      const distance = getTouchDistance(touches);
      setLastTouchDistance(distance);
      setInitialScale(imageTransformations.scale);
      setInitialTransform({
        x: imageTransformations.x,
        y: imageTransformations.y,
        scale: imageTransformations.scale
      });
    }
  }, [isEditingImage, imageTransformations]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isGesturing || !isEditingImage) return;
    e.preventDefault();
    
    const touches = e.touches;
    
    if (touches.length === 1 && panStart) {
      // Single touch - pan
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const currentPos = {
          x: touches[0].clientX - rect.left,
          y: touches[0].clientY - rect.top
        };
        
        const deltaX = currentPos.x - panStart.x;
        const deltaY = currentPos.y - panStart.y;
        
        updateTransformations({
          x: initialTransform.x + deltaX,
          y: initialTransform.y + deltaY
        });
      }
    } else if (touches.length === 2) {
      // Multi-touch - pinch to zoom
      const currentDistance = getTouchDistance(touches);
      const scaleFactor = currentDistance / lastTouchDistance;
      const newScale = Math.max(getMinimumScale(), initialScale * scaleFactor);
      
      updateTransformations({
        scale: newScale
      });
    }
  }, [isGesturing, panStart, lastTouchDistance, initialScale, initialTransform, updateTransformations, getMinimumScale, isEditingImage]);

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (!isEditingImage) return;
    e.preventDefault();
    
    setIsGesturing(false);
    setTouches(null);
    setLastTouchDistance(0);
    setPanStart({ x: 0, y: 0 });
  }, [isEditingImage]);

  // Detect mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileEditor(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Haptic feedback function for mobile devices
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator && isMobileEditor) {
      const patterns = {
        light: [10],
        medium: [30],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/mp4': ['.mp4']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
        setError(null);
        
        // Reset editor states
        setEditedImageBlob(null);
        setEditedImagePreview(null);
        setIsImageEdited(false);

        // Validate image dimensions if it's an image
        if (selectedFile.type.startsWith('image/') && screen) {
          try {
            const dimensions = await getImageDimensions(selectedFile);
            setImageDimensions(dimensions);
            
            const validation = validateImage(dimensions, screen);
            setImageValidation(validation);
          } catch (error) {
            console.error('Error getting image dimensions:', error);
            setImageDimensions(null);
            setImageValidation(null);
          }
        } 
        // Validate video if it's a video
        else if (selectedFile.type.startsWith('video/') && screen) {
          // Check if screen supports videos
          if (!screenSupportsVideo(screen)) {
            setError('Esta pantalla no soporta videos. Por favor sube una imagen.');
            setFile(null);
            setFilePreview(null);
            return;
          }
          
          try {
            const duration = await getVideoDuration(selectedFile);
            const resolution = await getVideoResolution(selectedFile);
            
            setVideoDuration(duration);
            setVideoResolution(resolution);
            
            const validation = validateVideo(duration, resolution, screen);
            setVideoValidation(validation);
            setIsVideoValid(validation.isValid);
            
            if (!validation.isValid) {
              setError(validation.message);
            }
          } catch (error) {
            console.error('Error getting video metadata:', error);
            setVideoDuration(null);
            setVideoResolution(null);
            setVideoValidation(null);
            setIsVideoValid(false);
          }
          
          setImageDimensions(null);
          setImageValidation(null);
        } else {
          setImageDimensions(null);
          setImageValidation(null);
          setVideoDuration(null);
          setVideoResolution(null);
          setVideoValidation(null);
          setIsVideoValid(false);
          setTrimmedVideoBlob(null);
          setTrimmedVideoPreview(null);
          setIsVideoTrimmed(false);
        }
      }
    },
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles[0]?.errors[0]?.code === 'file-too-large') {
        setError('El archivo es demasiado grande. El tamaño máximo es 100MB.');
      } else if (rejectedFiles[0]?.errors[0]?.code === 'file-invalid-type') {
        setError('Formato de archivo no soportado. Sube una imagen (JPG, PNG) o video (MP4).');
      } else {
        setError('Error al subir el archivo. Inténtalo de nuevo.');
      }
    }
  });

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate based on purchase type
      if (purchaseType === 'hourly') {
        // For standard hourly (1 hour only), require exactly 1 time slot
        if (isHourlyStandard() && selectedTimeSlots.length !== 1) {
          setError('Para este paquete específico, selecciona exactamente 1 franja horaria');
          return;
        }
        
        // For extended hourly (3 hours block), require exactly 3 time slots
        if (isHourlyExtended() && selectedTimeSlots.length !== 3) {
          setError('Para este paquete específico, selecciona exactamente 3 franjas horarias');
          return;
        }
        
        // For general hourly purchases (flexible), require at least one time slot
        if (!isHourlyStandard() && !isHourlyExtended() && selectedTimeSlots.length === 0) {
          setError('Por favor selecciona al menos una franja horaria. Puedes elegir tantas como necesites.');
          return;
        }
      }
      
      if (isMomentsPurchase()) {
        // Verify all moments have date, time and minute
        const hasIncompleteSelections = selectedMoments.some(moment => 
          !moment.date || !moment.time || moment.minute === null
        );
        
        if (hasIncompleteSelections) {
          setError(`Por favor completa ${isPremiumMoments() ? 'los 3 momentos' : 'el momento'} con fecha, hora y minuto.`);
          return;
        }
      }
      
      if (purchaseType === 'daily' && selectedDates.length === 0) {
        setError('Por favor selecciona al menos un día');
        return;
      }
      
      if ((purchaseType === 'weekly' || purchaseType === 'monthly') && selectedDates.length === 0) {
        setError('Por favor selecciona al menos una fecha');
        return;
      }
    }
    
    if (step === 2 && !file && !uploadLater) {
      setError('Por favor sube un archivo o selecciona "Subir más tarde"');
      return;
    }
    
    // Validate video if uploaded
    if (step === 2 && file && file.type.startsWith('video/') && !isVideoValid && !uploadLater) {
      setError('El video no cumple con la duración requerida para esta pantalla');
      return;
    }
    
    // Validate image if uploaded - must have correct dimensions or be edited
    if (step === 2 && file && file.type.startsWith('image/') && !uploadLater) {
      // If image has been edited, allow it (edited images are always valid)
      if (!isImageEdited) {
        // Check if original image is valid
        if (!imageValidation || !imageValidation.isValid) {
          setError('Tu imagen no tiene las dimensiones correctas. Por favor edítala para ajustarla a la pantalla antes de continuar.');
          return;
        }
      }
    }
    
    if (step < 2) {
      setStep(step + 1);
      setError(null);
    } else {
      // Complete step 2 and go to BookingSummaryModal
      let finalFile = file;
      let base64Data = '';
      
      // Use edited image if available
      if (editedImageBlob && isImageEdited) {
        finalFile = new File([editedImageBlob], file?.name || 'edited-image.jpg', { 
          type: editedImageBlob.type || 'image/jpeg' 
        });
      }
      
      // Use trimmed video if available
      if (trimmedVideoBlob && isVideoTrimmed) {
        finalFile = new File([trimmedVideoBlob], file?.name || 'trimmed-video.mp4', { 
          type: 'video/mp4' 
        });
      }
      
      // Convert file to base64 if it exists and not uploadLater
      if (finalFile && !uploadLater) {
        try {
          base64Data = await convertFileToBase64(finalFile);
        } catch (error) {
          console.error('Error converting file to base64:', error);
          setError('Error procesando el archivo. Inténtalo de nuevo.');
          return;
        }
      }
      
      onComplete({
        screen,
        type: purchaseType,
        dates: isMomentsPurchase() ? [] : selectedDates,
        timeSlots: isMomentsPurchase() ? [] : selectedTimeSlots,
        moments: isMomentsPurchase() ? selectedMoments : undefined,
        file: finalFile,
        uploadLater: uploadLater,
        imageDimensions: imageDimensions,
        price: totalPrice,
        creative: finalFile && !uploadLater ? {
          base64: base64Data,
          fileName: finalFile.name,
          fileType: finalFile.type,
          fileSize: finalFile.size
        } : undefined
      });
    }
  };

  // Helper function to determine if it's a standard hourly booking (1 hour)
  const isHourlyStandard = () => {
    if (purchaseType !== 'hourly') return false;
    // Only restrict to 1 hour for very specific bundle types - be extremely conservative
    // Only apply restriction if the bundle explicitly mentions "1 hora" or "una hora"
    return selectedBundle?.name && 
           (selectedBundle.name.toLowerCase().includes('solo 1 hora') || 
            selectedBundle.name.toLowerCase().includes('una hora solamente') ||
            selectedBundle.name.toLowerCase().includes('1 hora únicamente'));
  };

  // Helper function to determine if it's an extended hourly booking (3-hour block)
  const isHourlyExtended = () => {
    if (purchaseType !== 'hourly') return false;
    // Only restrict to 3 hours for very specific bundle types - be extremely conservative
    // Only apply restriction if the bundle explicitly mentions "3 horas" or "bloque de 3"
    return selectedBundle?.name && 
           (selectedBundle.name.toLowerCase().includes('bloque de 3 horas') || 
            selectedBundle.name.toLowerCase().includes('3 horas exactas') ||
            selectedBundle.name.toLowerCase().includes('paquete 3 horas'));
  };

  // Helper function to check if it's moments purchase
  const isMomentsPurchase = () => {
    return purchaseType === 'momentos';
  };

  // Helper function to check if it's premium moments package (3 moments)
  const isPremiumMoments = () => {
    return isMomentsPurchase() && selectedBundle?.id === 'moment_premium';
  };

  // Helper function to get the number of moments allowed
  const getMaxMoments = () => {
    return isPremiumMoments() ? 3 : 1;
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    } else {
      onClose();
    }
  };

  // Initialize dates based on purchase type - REMOVED AUTO-SELECTION
  React.useEffect(() => {
    if (isOpen && screen && purchaseType) {
      // Reset selections when modal opens
      setSelectedDates([]);
      setSelectedTimeSlots([]);
      setStep(1);
      setError(null);
      // Reset image validation states
      setFile(null);
      setFilePreview(null);
      setImageDimensions(null);
      setImageValidation(null);
      setUploadLater(false);
      
      // Reset editor states
      setEditedImageBlob(null);
      setEditedImagePreview(null);
      setIsImageEdited(false);
        setIsEditingImage(false);
        setImage(null);
      
      // Reset video states
      setVideoDuration(null);
      setVideoResolution(null);
      setVideoValidation(null);
      setIsVideoValid(false);
      setTrimmedVideoBlob(null);
      setTrimmedVideoPreview(null);
      setIsVideoTrimmed(false);
      setIsEditingVideo(false);
      
      // Initialize moments for moments purchase
      if (isMomentsPurchase()) {
        if (isPremiumMoments()) {
          setSelectedMoments([
            { date: null, time: null, minute: null },
            { date: null, time: null, minute: null },
            { date: null, time: null, minute: null }
          ]);
        } else {
          setSelectedMoments([{ date: null, time: null, minute: null }]);
        }
        setActiveMomentIndex(0);
      }
    }
  }, [isOpen, screen, purchaseType, selectedBundle]);

  // Memoize time slots generation to avoid recalculation on every render
  const timeSlots = React.useMemo(() => {
    if (!screen) return [];
    
    // Safely access operatingHours with fallback defaults
    const operatingHours = screen.operatingHours || { start: '06:00', end: '22:00' };
    const startHour = parseInt(operatingHours.start?.split(':')[0] || '6');
    const endHour = parseInt(operatingHours.end?.split(':')[0] || '22');
    
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      // Get ML pricing for this hour
      const mlPricing = mlPricingService.getMLPrice(
        selectedBundle?.price || 100000, // Base price
        screen.id,
        purchaseType as any,
        hour
      );
      
      const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        time: timeSlot,
        hour: hour,
        isPeakHour: mlPricing.peakHourLevel !== 'low',
        peakLevel: mlPricing.peakHourLevel,
        priceMultiplier: mlPricing.peakHourMultiplier,
        finalPrice: mlPricing.finalPrice,
        priceIncrease: mlPricing.priceIncrease,
        mlInsights: mlPricing.mlInsights
      });
    }
    
    return slots;
  }, [screen, selectedBundle?.price, purchaseType]);

  // Memoize calendar days generation
  const calendarDays = React.useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Generate array of dates to display
    const dates: Date[] = [];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      dates.push(date);
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      dates.push(date);
    }
    
    // Add days from next month to complete the grid (6 rows x 7 columns = 42 cells)
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      dates.push(date);
    }
    
    return dates;
  }, []); // Empty dependency array since we only generate current month
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Memoize date helper functions
  const isPastDate = React.useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  const isToday = React.useCallback((date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }, []);

  const isCurrentMonth = React.useCallback((date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }, []);

  // Memoize date selection check
  const isDateSelected = React.useCallback((date: Date) => {
    if (isMomentsPurchase()) {
      const currentMoment = selectedMoments[activeMomentIndex];
      return currentMoment.date && 
        currentMoment.date.getDate() === date.getDate() &&
        currentMoment.date.getMonth() === date.getMonth() &&
        currentMoment.date.getFullYear() === date.getFullYear();
    }
    
    return selectedDates.some(selectedDate => 
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    );
  }, [selectedMoments, activeMomentIndex, selectedDates, purchaseType]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) return;
    
    // Animation for date selection
    setAnimatingDate(date);
    setTimeout(() => setAnimatingDate(null), 500);
    
    if (isMomentsPurchase()) {
      // For moments, update the current active moment
      const updatedMoments = [...selectedMoments];
      updatedMoments[activeMomentIndex] = {
        ...updatedMoments[activeMomentIndex],
        date: new Date(date)
      };
      setSelectedMoments(updatedMoments);
      return;
    }
    
    if (purchaseType === 'daily') {
      // For daily, allow selecting multiple individual days
      const dateToToggle = new Date(date);
      const isAlreadySelected = selectedDates.some(selectedDate => 
        selectedDate.getDate() === dateToToggle.getDate() &&
        selectedDate.getMonth() === dateToToggle.getMonth() &&
        selectedDate.getFullYear() === dateToToggle.getFullYear()
      );
      
      if (isAlreadySelected) {
        // Remove the date if already selected
        setSelectedDates(selectedDates.filter(selectedDate => 
          !(selectedDate.getDate() === dateToToggle.getDate() &&
            selectedDate.getMonth() === dateToToggle.getMonth() &&
            selectedDate.getFullYear() === dateToToggle.getFullYear())
        ));
      } else {
        // Add the date if not selected
        setSelectedDates([...selectedDates, dateToToggle]);
      }
    } else if (purchaseType === 'weekly') {
      // For weekly, select 7 consecutive days starting from the selected date
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + i);
        dates.push(newDate);
      }
      setSelectedDates(dates);
    } else if (purchaseType === 'monthly') {
      // For monthly, select 30 consecutive days starting from the selected date
      const dates = [];
      for (let i = 0; i < 30; i++) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + i);
        dates.push(newDate);
      }
      setSelectedDates(dates);
    } else if (purchaseType === 'hourly') {
      // For hourly reservations, select just the single date
      setSelectedDates([new Date(date)]);
    }
  };

  // Handle time slot selection with animation and business rules
  const handleTimeSlotSelect = (slot: string) => {
    // Clear any existing error
    setError(null);
    
    if (isMomentsPurchase()) {
      // For moments, update the current active moment
      const updatedMoments = [...selectedMoments];
      updatedMoments[activeMomentIndex] = {
        ...updatedMoments[activeMomentIndex],
        time: slot
      };
      setSelectedMoments(updatedMoments);
      
      // Animation
      setAnimatingTime(slot);
      setTimeout(() => setAnimatingTime(null), 300);
      return;
    }
    
    if (selectedTimeSlots.includes(slot)) {
      // Remove the slot (toggle off)
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot));
      
      // Animation
      setAnimatingTime(slot);
      setTimeout(() => setAnimatingTime(null), 300);
      return;
    }
    
    // For hourly purchases, allow selecting multiple individual hours
    if (purchaseType === 'hourly') {
      // Special case: For 1-hour only packages, restrict to 1 slot
      if (isHourlyStandard()) {
        setSelectedTimeSlots([slot]);
      } 
      // Special case: For 3-hour block packages, limit to exactly 3 slots
      else if (isHourlyExtended()) {
        if (selectedTimeSlots.length >= 3) {
          setSelectedTimeSlots([...selectedTimeSlots.slice(1), slot]);
        } else {
          setSelectedTimeSlots([...selectedTimeSlots, slot]);
        }
      }
      // Default case: Allow multiple individual hours (flexible hourly purchase)
      // This is now the primary use case - users can select as many hours as they want
      else {
        setSelectedTimeSlots([...selectedTimeSlots, slot]);
      }
    }
    // For other types, add the slot
    else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
    
    // Animation
    setAnimatingTime(slot);
    setTimeout(() => setAnimatingTime(null), 300);
  };

  // Handle minute selection for moments
  const handleMinuteSelect = (minute: number) => {
    if (!isMomentsPurchase()) return;
    
    // Update the currently active moment
    const updatedMoments = [...selectedMoments];
    updatedMoments[activeMomentIndex] = {
      ...updatedMoments[activeMomentIndex],
      minute
    };
    setSelectedMoments(updatedMoments);
  };

  // Memoize total price calculation
  const totalPrice = React.useMemo(() => {
    if (!screen || !purchaseType) return 0;
    
    switch (purchaseType) {
      case 'hourly':
        // For hourly purchases, sum the individual prices of each selected time slot
        if (selectedTimeSlots.length === 0) return 0;
        
        const basePrice = selectedBundle?.price || screen.pricing.bundles.hourly?.price || 0;
        let calculatedPrice = 0;
        
        selectedTimeSlots.forEach(selectedSlot => {
          // Find the corresponding timeSlot with pricing info
          const timeSlot = timeSlots.find(slot => slot.time === selectedSlot);
          if (timeSlot) {
            // Use the individual slot price (base price + any price increase)
            const slotPrice = basePrice + (timeSlot.priceIncrease || 0);
            calculatedPrice += slotPrice;
          } else {
            // Fallback to base price if slot not found
            calculatedPrice += basePrice;
          }
        });
        
        return calculatedPrice;
      case 'daily':
        // For daily purchases, multiply base price by number of selected days
        return (screen.pricing.bundles.daily?.price || 0) * selectedDates.length;
      case 'weekly':
        // Weekly is a fixed package price
        return screen.pricing.bundles.weekly?.price || 0;
      case 'monthly':
        // Monthly is a fixed package price
        return screen.pricing.bundles.monthly?.price || 0;
      case 'momentos':
        // Fixed price for moments
        return 8000;
      default:
        return 0;
    }
  }, [screen, purchaseType, selectedTimeSlots, selectedDates, selectedBundle?.price, timeSlots]);

  // Get purchase type label
  const getPurchaseTypeLabel = () => {
    switch (purchaseType) {
      case 'hourly':
        return 'Por Hora';
      case 'daily':
        return 'Por Día';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      case 'momentos':
        return isPremiumMoments() ? 'Momentos Premium' : 'Momentos';
      default:
        return '';
    }
  };

  if (!screen || !purchaseType) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mobile-modal w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden max-h-screen sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile-optimized header */}
            <motion.div 
              className="mobile-modal-header relative bg-gradient-to-r from-[#353FEF] to-[#4F46E5] text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                {/* Mobile header - more compact */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {step === 1 ? 
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : 
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      }
                    </motion.div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">
                        {step === 1 ? 
                          `Reserva ${getPurchaseTypeLabel()}` : 
                          'Subir Creatividad'
                        }
                      </h2>
                      <p className="text-blue-100 text-xs sm:text-sm">
                        {step === 1 ? 
                          'Selecciona fecha y horarios' : 
                          'Sube tu creatividad'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={onClose}
                    className="mobile-touch-target bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Mobile-optimized progress steps */}
                <motion.div 
                  className="flex items-center justify-center gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <motion.div 
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    />
                    <span className="text-blue-100">Selección</span>
                  </div>
                  <div className="w-6 sm:w-8 h-px bg-blue-300"></div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <motion.div 
                      className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-400' : 'bg-blue-300'}`}
                      animate={{ 
                        backgroundColor: step >= 2 ? '#60a5fa' : '#93c5fd'
                      }}
                      transition={{ backgroundColor: { duration: 0.3 } }}
                    />
                    <span className={step >= 2 ? 'text-white' : 'text-blue-200'}>Creatividad</span>
                  </div>
                  <div className="w-6 sm:w-8 h-px bg-blue-300"></div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-blue-300"
                    />
                    <span className="text-blue-200">Confirmación</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Mobile-optimized content */}
            <div className="mobile-modal-content flex-1 overflow-y-auto bg-white">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-2 sm:space-y-4"
                  >
                    {/* Mobile-optimized calendar section */}
                    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-blue-100/50 p-3 sm:p-8">
                      <div className="flex items-center justify-between mb-2 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base sm:text-xl text-darkText">
                              {isMomentsPurchase() ? 
                                `Fecha ${isPremiumMoments() ? `- Momento ${activeMomentIndex + 1}` : ''}` :
                                'Selecciona tu fecha'
                              }
                            </h4>
                            <p className="text-xs sm:text-sm text-neutral-600 hidden sm:block">
                              {isMomentsPurchase() ? 
                                'Elige el día para tu momento' :
                                'Elige el día para tu campaña'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-100 rounded-lg">
                          <span className="text-xs sm:text-sm font-medium text-blue-700">
                            {selectedDates.length > 0 ? `${selectedDates.length} día${selectedDates.length > 1 ? 's' : ''}` : 'Sin selección'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Mobile month header */}
                      <div className="flex items-center justify-between mb-2 sm:mb-6">
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 sm:gap-3"
                        >
                          <div className="text-lg sm:text-2xl font-bold text-darkText capitalize">
                            {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </div>
                          <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                            HOY
                          </div>
                        </motion.div>
                        <div className="flex items-center gap-1">
                          <motion.button 
                            className="mobile-touch-target hover:bg-blue-100 rounded-lg transition-colors"
                            whileHover={{ x: -2, backgroundColor: "#DBEAFE" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </motion.button>
                          <motion.button 
                            className="mobile-touch-target hover:bg-blue-100 rounded-lg transition-colors"
                            whileHover={{ x: 2, backgroundColor: "#DBEAFE" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </motion.button>
                        </div>
                      </div>
                        
                      {/* Mobile day names */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-6">
                        {dayNames.map((day) => (
                          <div 
                            key={day} 
                            className="text-center font-semibold text-blue-600 py-1 sm:py-3 text-xs sm:text-sm uppercase tracking-wider"
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                            
                      {/* Mobile-optimized calendar grid */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-6">
                        {calendarDays.map((date, index) => {
                          const isSelected = isDateSelected(date);
                          const isPast = isPastDate(date);
                          const isCurrentDay = isToday(date);
                          const isCurrentMonthDate = isCurrentMonth(date);
                          
                          return (
                            <motion.button
                              key={index}
                              disabled={isPast}
                              onClick={() => handleDateSelect(date)}
                              className={`
                                mobile-calendar-day mobile-touch-target flex items-center justify-center text-sm sm:text-base font-semibold relative overflow-hidden transition-all duration-200
                                ${isPast ? 'text-neutral-300 cursor-not-allowed bg-neutral-50' : 
                                  isSelected ? 'text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg' :
                                  isCurrentDay ? 'text-blue-600 bg-blue-100 border-2 border-blue-400' :
                                  isCurrentMonthDate ? 'text-darkText bg-white hover:bg-blue-50 shadow-sm border border-neutral-200' :
                                  'text-neutral-400 bg-neutral-50'
                                }
                              `}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ 
                                opacity: isPast ? 0.4 : 1, 
                                scale: 1
                              }}
                              transition={{ duration: 0.2 }}
                              whileHover={
                                !isPast 
                                  ? { 
                                      scale: 1.05, 
                                      transition: { duration: 0.2 } 
                                    } 
                                  : {}
                              }
                              whileTap={!isPast ? { scale: 0.95 } : {}}
                            >
                              <span className="relative z-10">
                                {date.getDate()}
                              </span>
                              
                              {/* Selected indicator */}
                              {isSelected && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3, type: "spring" }}
                                  style={{ zIndex: -1 }}
                                />
                              )}
                              
                              {/* Today indicator */}
                              {isCurrentDay && !isSelected && (
                                <motion.div
                                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 }}
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Time Selection */}
                    <AnimatePresence>
                      {selectedDates.length > 0 && purchaseType === 'hourly' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-lg border border-indigo-100/50 p-8"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xl text-darkText">
                                  {isHourlyStandard() ? 
                                    "Selecciona tu horario" : 
                                    isHourlyExtended() ? 
                                      "Selecciona tus 3 horarios" : 
                                      "Selecciona tus horarios"
                                  }
                                </h4>
                                <p className="text-sm text-neutral-600">
                                  {isHourlyStandard() ? 
                                    "Elige la franja horaria perfecta para tu audiencia" : 
                                    isHourlyExtended() ? 
                                      "Selecciona exactamente 3 franjas para el paquete extendido" :
                                      "Haz clic para seleccionar/deseleccionar las horas que desees. Puedes elegir 1, 2, 3 o más franjas horarias según tus necesidades."
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="px-4 py-2 bg-indigo-100 rounded-lg">
                              <span className="text-sm font-medium text-indigo-700">
                                {selectedTimeSlots.length > 0 ? `${selectedTimeSlots.length} franja${selectedTimeSlots.length > 1 ? 's' : ''} seleccionada${selectedTimeSlots.length > 1 ? 's' : ''}` : 'Sin selección'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Error message for invalid selection */}
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                              <p className="text-sm text-red-700 font-medium">{error}</p>
                            </motion.div>
                          )}
                          
                          {/* Info messages for packages */}
                          {(isHourlyStandard() || isHourlyExtended()) ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-blue-700">
                                  {isHourlyStandard() ? (
                                    <>
                                      <strong>Paquete específico:</strong> Este paquete permite seleccionar únicamente 1 franja horaria. Al seleccionar una nueva franja, se reemplazará la anterior automáticamente.
                                    </>
                                  ) : (
                                    <>
                                      <strong>Paquete específico:</strong> Este paquete requiere seleccionar exactamente 3 franjas horarias.
                                    </>
                                  )}
                                </p>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-green-700">
                                  <strong>Compra flexible:</strong> Puedes seleccionar tantas franjas horarias como necesites. Ideal para crear campañas personalizadas con múltiples horarios de máximo impacto.
                                </p>
                              </div>
                            </motion.div>
                          )}
                          
                                                    {/* Mobile time slots grid */}
                          <div className="mobile-time-grid grid">
                            {timeSlots.map((timeSlot, index) => {
                              const isSelected = selectedTimeSlots.includes(timeSlot.time);
                              
                              return (
                                <motion.button
                                  key={timeSlot.time}
                                  onClick={() => handleTimeSlotSelect(timeSlot.time)}
                                  className={`
                                    mobile-time-slot mobile-touch-target transition-all duration-200 overflow-hidden relative
                                    ${isSelected 
                                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
                                      : 'bg-white text-darkText hover:bg-blue-50 shadow-sm border border-neutral-200'
                                    }
                                  `}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ 
                                    opacity: 1, 
                                    scale: 1
                                  }}
                                  transition={{ duration: 0.2, type: "spring" }}
                                  whileHover={{ 
                                    scale: 1.05,
                                    transition: { duration: 0.2 }
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <div className="relative z-10 flex flex-col items-center">
                                    <div className="text-xs font-bold leading-tight">
                                      {timeSlot.time.split(' - ')[0]}
                                      {timeSlot.isPeakHour && (
                                        <span className="text-xs ml-1">
                                          {timeSlot.peakLevel === 'peak' ? '🔥' : '📈'}
                                        </span>
                                      )}
                                    </div>
                                    {/* Price increase indicator - compact for small squares */}
                                    {timeSlot.priceIncrease && timeSlot.priceIncrease > 0 && (
                                      <div className="text-xs font-bold text-orange-300 mt-0.5">
                                        +{Math.round((timeSlot.priceIncrease / (selectedBundle?.price || 100000)) * 100)}%
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Selected indicator */}
                                  {isSelected && (
                                    <motion.div
                                      className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl"
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ duration: 0.3, type: "spring" }}
                                      style={{ zIndex: -1 }}
                                    />
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                          
                          {/* Selected time slots summary */}
                          {/* Mobile-optimized time slots summary */}
                          {selectedTimeSlots.length > 0 && (
                            <motion.div 
                              className="mt-4 sm:mt-8 bg-blue-50 rounded-lg px-3 sm:px-6 py-3 sm:py-5 border-2 border-blue-200"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <div className="space-y-2 sm:space-y-3">
                                <motion.div 
                                  className="flex justify-between items-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <span className="text-sm sm:text-base text-darkText font-medium">Franjas seleccionadas:</span>
                                  <span className="text-base sm:text-lg font-bold text-blue-600">
                                    {selectedTimeSlots.length} hora{selectedTimeSlots.length > 1 ? 's' : ''}
                                  </span>
                                </motion.div>
                                
                                {/* Mobile-optimized pricing breakdown */}
                                <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-none overflow-y-auto">
                                  {selectedTimeSlots.slice(0, 3).map((slot, index) => {
                                    const timeSlot = timeSlots.find(ts => ts.time === slot);
                                    const basePrice = selectedBundle?.price || screen?.pricing.bundles.hourly?.price || 0;
                                    const slotPrice = basePrice + (timeSlot?.priceIncrease || 0);
                                    const isPeakHour = timeSlot?.isPeakHour || false;
                                    
                                    return (
                                      <motion.div
                                        key={slot}
                                        className="flex justify-between items-center text-xs sm:text-sm"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (index * 0.1) }}
                                      >
                                        <div className="flex items-center gap-1 sm:gap-2">
                                          <span className="text-gray-600">{slot.split(' - ')[0]}</span>
                                          {isPeakHour && (
                                            <span className="text-xs bg-orange-100 text-orange-700 px-1 sm:px-2 py-0.5 rounded-full font-medium">
                                              {timeSlot?.peakLevel === 'peak' ? '🔥' : '📈'}
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-medium text-gray-800">
                                          ${slotPrice.toLocaleString('es-ES')}
                                        </span>
                                      </motion.div>
                                    );
                                  })}
                                  {selectedTimeSlots.length > 3 && (
                                    <div className="text-xs text-gray-500 text-center">
                                      +{selectedTimeSlots.length - 3} más...
                                    </div>
                                  )}
                                </div>
                                
                                <motion.div 
                                  className="flex justify-between items-center pt-2 border-t border-blue-200"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.7 }}
                                >
                                  <span className="text-sm sm:text-base text-darkText font-medium">Total:</span>
                                  <span className="text-lg sm:text-xl font-bold text-blue-600">
                                    ${totalPrice.toLocaleString('es-ES')}
                                  </span>
                                </motion.div>
                                
                                {/* Mobile-optimized selected time chips */}
                                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                                  {selectedTimeSlots.slice(0, 4).map((slot) => (
                                    <span 
                                      key={slot}
                                      className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium"
                                    >
                                      {slot.split(' - ')[0]}
                                    </span>
                                  ))}
                                  {selectedTimeSlots.length > 4 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                      +{selectedTimeSlots.length - 4}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <motion.div 
                                className="mt-2 text-sm sm:text-base text-darkText"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                              >
                                para el <strong className="font-bold">{selectedDates[0]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</strong>
                              </motion.div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Moments Selection Section */}
                    <AnimatePresence>
                      {isMomentsPurchase() && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="space-y-6"
                        >
                          {/* Moment Tabs for Premium Package */}
                          {isPremiumMoments() && (
                            <div className="bg-white rounded-xl shadow-md border border-neutral-100 p-5">
                              <h4 className="font-bold text-lg text-darkText mb-3">Selecciona 3 momentos diferentes</h4>
                              <div className="flex gap-2 border-b border-neutral-200 pb-3 mb-4">
                                {selectedMoments.map((moment, index) => (
                                  <motion.button
                                    key={index}
                                    onClick={() => setActiveMomentIndex(index)}
                                    className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all 
                                      ${activeMomentIndex === index 
                                        ? 'bg-blue-500 text-white shadow-md' 
                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                      }
                                      ${moment.date && moment.time && moment.minute !== null 
                                        ? 'border-l-4 border-blue-600' 
                                        : ''
                                      }`}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 0 }}
                                  >
                                    Momento {index + 1}
                                    {moment.date && moment.time && moment.minute !== null && (
                                      <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-white rounded-full"
                                      >
                                        <Check className={`w-3 h-3 ${activeMomentIndex === index ? 'text-blue-500' : 'text-blue-600'}`} />
                                      </motion.span>
                                    )}
                                  </motion.button>
                                ))}
                              </div>
                              
                              <div className="text-sm text-neutral-600 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-3">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <p>
                                    Con el paquete Premium puedes seleccionar 3 momentos diferentes. 
                                    Completa la información para cada uno usando las pestañas de arriba.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Time Selection for Moments - Modern Style */}
                          {selectedMoments[activeMomentIndex].date && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-8"
                            >
                              <div className="flex items-center justify-between mb-2 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-base sm:text-xl text-darkText">
                                      Selecciona horarios
                                    </h4>
                                    <p className="text-xs sm:text-sm text-neutral-600 hidden sm:block">
                                      Elige las horas que necesites
                                    </p>
                                  </div>
                                </div>
                                <div className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-100 rounded-lg">
                                  <span className="text-xs sm:text-sm font-medium text-blue-700">
                                    {selectedTimeSlots.length > 0 ? `${selectedTimeSlots.length} hora${selectedTimeSlots.length > 1 ? 's' : ''}` : 'Sin selección'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mobile-time-grid grid">
                                {timeSlots.map((timeSlot, index) => {
                                  const isSelected = selectedMoments[activeMomentIndex].time === timeSlot.time;
                                  const isAnimating = isSelected && animatingTime === timeSlot.time;
                                  
                                  return (
                                    <motion.button
                                      key={timeSlot.time}
                                      onClick={() => handleTimeSlotSelect(timeSlot.time)}
                                      className={`
                                        mobile-time-slot mobile-touch-target transition-all duration-200 overflow-hidden relative
                                        ${isSelected 
                                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
                                          : 'bg-white text-darkText hover:bg-blue-50 shadow-sm border border-neutral-200'
                                        }
                                      `}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ 
                                        opacity: 1, 
                                        scale: 1
                                      }}
                                      transition={{ duration: 0.2, type: "spring" }}
                                      whileHover={{ 
                                        scale: 1.05,
                                        transition: { duration: 0.2 }
                                      }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <div className="relative z-10 flex flex-col items-center">
                                        <div className="text-xs font-bold leading-tight">
                                          {timeSlot.time.split(' - ')[0]}
                                        </div>
                                        {timeSlot.isPeakHour && (
                                          <div className="text-xs mt-0.5">
                                            {timeSlot.peakLevel === 'peak' ? '🔥' : '📈'}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Selected indicator */}
                                      {isSelected && (
                                        <motion.div
                                          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl"
                                          initial={{ scale: 0, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ duration: 0.3, type: "spring" }}
                                          style={{ zIndex: -1 }}
                                        />
                                      )}
                                      
                                      {/* Hover effect */}
                                      <motion.div
                                        className="absolute inset-0 bg-blue-50"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: isSelected ? 0 : 1 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ zIndex: -2 }}
                                      />
                                    </motion.button>
                                  );
                                })}
                              </div>
                              
                              {/* Selected time slot summary */}
                              {selectedMoments[activeMomentIndex].time && (
                                <motion.div 
                                  className="h-auto mt-8 bg-blue-50 rounded-lg px-6 py-5 border-2 border-blue-200"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <motion.span 
                                      className="text-base text-darkText font-medium"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      Franja horaria seleccionada:
                                    </motion.span>
                                    <motion.span 
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      {selectedMoments[activeMomentIndex].time}
                                    </motion.span>
                                  </div>
                                  <motion.div 
                                    className="mt-2 text-base text-darkText"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                  >
                                    para el día <strong className="font-bold">{selectedMoments[activeMomentIndex].date?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</strong>
                                  </motion.div>
                                </motion.div>
                              )}
                            </motion.div>
                          )}

                          {/* Minute Selection for Moments */}
                          {selectedMoments[activeMomentIndex].time && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              className="bg-white rounded-xl shadow-md border border-neutral-100 p-6"
                            >
                              <h4 className="font-bold text-lg text-darkText mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                Selecciona el minuto exacto
                              </h4>
                              <div className="space-y-6">
                                <div className="relative h-24">
                                  <motion.input
                                    type="range"
                                    min="0"
                                    max="59"
                                    value={selectedMoments[activeMomentIndex].minute || 0}
                                    onChange={(e) => handleMinuteSelect(parseInt(e.target.value))}
                                    className="absolute w-full h-4 bg-neutral-200 appearance-none cursor-pointer rounded-full
                                      [&::-webkit-slider-thumb]:appearance-none 
                                      [&::-webkit-slider-thumb]:w-8 
                                      [&::-webkit-slider-thumb]:h-8 
                                      [&::-webkit-slider-thumb]:rounded-full 
                                      [&::-webkit-slider-thumb]:bg-blue-500 
                                      [&::-webkit-slider-thumb]:shadow-md
                                      bottom-9"
                                    whileFocus={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                  />

                                  {/* Track marks and labels */}
                                  {[0, 15, 30, 45, 59].map((marker, i) => (
                                    <React.Fragment key={marker}>
                                      <motion.div 
                                        className="absolute bottom-9 h-6 w-1 bg-neutral-300"
                                        style={{ left: `${(marker / 59) * 100}%` }}
                                        initial={{ height: 0 }}
                                        animate={{ height: 16 }}
                                        transition={{ delay: i * 0.1, duration: 0.3 }}
                                      />
                                      <motion.span
                                        className={`absolute -bottom-1 transform -translate-x-1/2 text-base font-bold ${
                                          selectedMoments[activeMomentIndex].minute === marker 
                                            ? 'text-blue-600' 
                                            : 'text-neutral-700'
                                        }`}
                                        style={{ left: `${(marker / 59) * 100}%` }}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
                                      >
                                        {marker.toString().padStart(2, '0')}
                                      </motion.span>
                                    </React.Fragment>
                                  ))}

                                  {/* Current minute display */}
                                  {selectedMoments[activeMomentIndex].minute !== null && (
                                    <motion.div
                                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 bg-blue-500 text-white rounded-full px-4 py-1.5 font-bold text-lg shadow-md"
                                      initial={{ y: 10, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      key={selectedMoments[activeMomentIndex].minute}
                                    >
                                      {selectedMoments[activeMomentIndex].minute.toString().padStart(2, '0')}
                                    </motion.div>
                                  )}
                                </div>

                                {selectedMoments[activeMomentIndex].minute !== null && (
                                  <motion.div 
                                    className="h-auto mt-8 bg-blue-50 rounded-lg px-6 py-5 border-2 border-blue-200"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <motion.span 
                                        className="text-base text-darkText font-medium"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                      >
                                        Tu momento saldrá a las
                                      </motion.span>
                                      <motion.span 
                                        className="text-2xl font-bold text-blue-600"
                                        initial={{ scale: 0.7, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                      >
                                        {selectedMoments[activeMomentIndex].time}:{selectedMoments[activeMomentIndex].minute?.toString().padStart(2, '0')} hrs
                                      </motion.span>
                                    </div>
                                    <motion.div 
                                      className="mt-2 text-base text-darkText"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.7 }}
                                    >
                                      el día <strong className="font-bold">{selectedMoments[activeMomentIndex].date?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</strong>
                                    </motion.div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Selected date range summary for non-hourly reservations */}
                    <AnimatePresence>
                      {selectedDates.length > 0 && purchaseType !== 'hourly' && purchaseType !== 'momentos' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="bg-white rounded-xl shadow-md border border-neutral-100 p-6"
                        >
                          <h4 className="font-bold text-lg text-darkText mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            {purchaseType === 'daily' ? 'Días seleccionados' : 'Resumen de fechas seleccionadas'}
                          </h4>
                          
                          <div className="h-auto bg-blue-50 rounded-lg px-6 py-5 border-2 border-blue-200">
                            {purchaseType === 'daily' ? (
                              <div className="flex flex-col gap-2">
                                <motion.div 
                                  className="flex justify-between items-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <span className="text-base text-darkText font-medium">Días seleccionados:</span>
                                  <span className="text-lg font-bold text-blue-600">
                                    {selectedDates.length} día{selectedDates.length > 1 ? 's' : ''}
                                  </span>
                                </motion.div>
                                
                                <motion.div 
                                  className="flex justify-between items-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <span className="text-base text-darkText font-medium">Precio por día:</span>
                                  <span className="text-lg font-bold text-blue-600">
                                    ${screen?.pricing.bundles.daily?.price?.toLocaleString('es-ES') || 0}
                                  </span>
                                </motion.div>
                                
                                <motion.div 
                                  className="flex justify-between items-center pt-2 border-t border-blue-200"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.7 }}
                                >
                                  <span className="text-base text-darkText font-medium">Total:</span>
                                  <span className="text-xl font-bold text-blue-600">
                                    ${totalPrice.toLocaleString('es-ES')}
                                  </span>
                                </motion.div>
                              </div>
                            ) : (
                            <div className="flex flex-col gap-2">
                              <motion.div 
                                className="flex justify-between items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                <span className="text-base text-darkText font-medium">Fecha de inicio:</span>
                                <span className="text-lg font-bold text-blue-600">
                                  {selectedDates[0]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                              </motion.div>
                              
                              <motion.div 
                                className="flex justify-between items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <span className="text-base text-darkText font-medium">Fecha de finalización:</span>
                                <span className="text-lg font-bold text-blue-600">
                                  {selectedDates[selectedDates.length - 1]?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                              </motion.div>
                              
                              <motion.div 
                                className="flex justify-between items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                              >
                                <span className="text-base text-darkText font-medium">Duración:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {purchaseType === 'weekly' ? '7 días' : '30 días'}
                                </span>
                              </motion.div>
                            </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  
                  {/* Error Message */}
                    <AnimatePresence>
                  {error && (
                        <motion.div 
                          className="p-4 bg-error-50 rounded-lg flex items-start gap-3 border border-error-200"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <AlertTriangle className="w-6 h-6 text-error-500 flex-shrink-0" />
                          <p className="text-base font-medium text-error-600">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
              )}
              
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Sube tu creatividad</h3>
                      <p className="text-gray-600">Personaliza tu contenido para que se vea perfecto en pantalla</p>
                    </div>
                  </div>

                  {/* Main Content Area */}
                {!file && !uploadLater ? (
                    /* Upload Area */
                    <div className="space-y-6">
                    <div 
                      {...getRootProps()} 
                        className="relative group border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
                    >
                      <input {...getInputProps()} />
                        <div className="relative z-10">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-10 h-10 text-blue-600" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            Arrastra tu archivo aquí
                          </h4>
                          <p className="text-gray-600 mb-4">
                            o haz clic para seleccionar desde tu dispositivo
                          </p>
                          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
                            <Upload className="w-4 h-4" />
                            Seleccionar archivo
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                      <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setUploadLater(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 hover:underline"
                      >
                          <Clock className="w-4 h-4" />
                        Subir creatividad más tarde
                      </button>
                    </div>
                  </div>
                ) : file ? (
                    /* File Uploaded - Main Editor Interface */
                    <div className="space-y-6">
                      {/* File Preview and Quick Actions */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                      {file.type.startsWith('video/') ? (
                          /* Video Preview - Full Width */
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">Vista Previa del Video</h4>
                                <p className="text-sm text-gray-600">Revisa tu contenido antes de continuar</p>
                              </div>
                            </div>
                            
                            {/* Video Player */}
                            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                        <video
                          src={isVideoTrimmed && trimmedVideoPreview ? trimmedVideoPreview : filePreview!}
                                className="w-full h-auto max-h-96 object-contain"
                          controls
                                preload="metadata"
                                style={{ aspectRatio: '16/9' }}
                              >
                                Tu navegador no soporta la reproducción de video.
                              </video>
                              
                              {/* Trimmed indicator */}
                              {isVideoTrimmed && (
                                <div className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2 text-white text-sm">
                                    <Scissors className="w-4 h-4" />
                                    <span className="font-medium">Video recortado</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Video Info Overlay */}
                              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2 text-white text-sm">
                                  <Play className="w-4 h-4" />
                                  <span className="font-medium">{file.name}</span>
                                </div>
                                <div className="text-xs text-gray-300 mt-1">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                  {videoDuration && (
                                    <span> • {videoDuration.toFixed(1)}s</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Video Validation Status */}
                              <div className="absolute top-4 right-4">
                                {isVideoValid ? (
                                  <div className="bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-white" />
                                    <span className="text-white text-sm font-medium">Válido</span>
                                  </div>
                                ) : (
                                  <div className="bg-amber-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                    <span className="text-white text-sm font-medium">Revisar</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Video Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium text-gray-700">Duración</span>
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                  {videoDuration ? `${videoDuration.toFixed(1)}s` : 'Calculando...'}
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <Monitor className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium text-gray-700">Formato</span>
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                  {file.name.split('.').pop()?.toUpperCase() || 'VIDEO'}
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-medium text-gray-700">Estado</span>
                                </div>
                                <div className={`text-lg font-bold ${isVideoValid ? 'text-green-600' : 'text-amber-600'}`}>
                                  {isVideoValid ? 'Listo' : 'Pendiente'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-3">
                                {!isVideoValid && (
                                  <button
                                    onClick={handleStartVideoEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                  >
                                    <Scissors className="w-4 h-4" />
                                    Recortar video
                                  </button>
                                )}
                                <div className="text-sm text-gray-600">
                                  {isVideoValid ? (
                                    <span className="text-green-600 font-medium">✓ Tu video cumple con los requisitos</span>
                                  ) : (
                                    <span className="text-amber-600 font-medium">⚠ Recorta el video a {screen?.specs?.videoSpotDuration || 30}s</span>
                                  )}
                                </div>
                              </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                          setImageDimensions(null);
                          setImageValidation(null);
                          setEditedImageBlob(null);
                          setEditedImagePreview(null);
                          setIsImageEdited(false);
                          setVideoDuration(null);
                          setVideoResolution(null);
                          setVideoValidation(null);
                          setIsVideoValid(false);
                          setTrimmedVideoBlob(null);
                          setTrimmedVideoPreview(null);
                          setIsVideoTrimmed(false);
                        }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                      >
                                <Trash2 className="w-4 h-4" />
                                Eliminar video
                      </button>
                            </div>
                          </div>
                        ) : (
                          /* Image Preview - Original Layout */
                          <div className="flex items-start gap-6">
                            {/* Preview */}
                            <div className="relative">
                              <div className="w-32 h-24 bg-black rounded-xl overflow-hidden shadow-lg">
                                <img
                                  src={isImageEdited && editedImagePreview ? editedImagePreview : filePreview!}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {isImageEdited && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          
                            {/* File Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Image className="w-5 h-5 text-gray-600" />
                                <h4 className="font-bold text-gray-900 text-lg">{file.name}</h4>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                {imageDimensions && (
                                  <span>{imageDimensions.width} × {imageDimensions.height}px</span>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-3">
                        <button
                                  onClick={handleStartImageEdit}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                                    isImageEdited 
                                      ? 'bg-green-500 text-white hover:bg-green-600' 
                                      : imageValidation && !imageValidation.isValid
                                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }`}
                        >
                          <Edit3 className="w-4 h-4" />
                                  {isImageEdited 
                                    ? 'Editar de nuevo' 
                                    : imageValidation && !imageValidation.isValid
                                      ? '⚠️ Ajustar imagen (Requerido)'
                                      : 'Editar imagen'
                                  }
                        </button>
                        <button
                                  onClick={() => {
                                    setFile(null);
                                    setFilePreview(null);
                                    setImageDimensions(null);
                                    setImageValidation(null);
                                    setEditedImageBlob(null);
                                    setEditedImagePreview(null);
                                    setIsImageEdited(false);
                                    setVideoDuration(null);
                                    setVideoResolution(null);
                                    setVideoValidation(null);
                                    setIsVideoValid(false);
                                    setTrimmedVideoBlob(null);
                                    setTrimmedVideoPreview(null);
                                    setIsVideoTrimmed(false);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                        </button>
                              </div>
                            </div>
                          </div>
                      )}
                    </div>

                    {/* Video Validation Results */}
                      {videoValidation && file && file.type.startsWith('video/') && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-2xl border-2 ${
                            videoValidation.isValid 
                              ? 'bg-emerald-50 border-emerald-200' 
                              : videoValidation.hasCorrectDuration
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              videoValidation.isValid 
                                ? 'bg-emerald-500' 
                                : videoValidation.hasCorrectDuration
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}>
                              {videoValidation.isValid ? (
                                <Check className="w-6 h-6 text-white" />
                              ) : videoValidation.hasCorrectDuration ? (
                                <Info className="w-6 h-6 text-white" />
                              ) : (
                                <AlertTriangle className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-bold text-lg mb-2 ${
                                videoValidation.isValid 
                                  ? 'text-emerald-800' 
                                  : videoValidation.hasCorrectDuration
                                    ? 'text-amber-800'
                                    : 'text-red-800'
                              }`}>
                                {videoValidation.message}
                              </h4>
                              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div className="bg-white/70 rounded-lg p-3">
                                  <div className="font-medium text-gray-700 mb-1">Tu video</div>
                                  <div className="text-gray-900 font-bold">
                                    {videoDuration?.toFixed(1)}s • {videoResolution?.width}x{videoResolution?.height}px
                                  </div>
                                </div>
                                <div className="bg-white/70 rounded-lg p-3">
                                  <div className="font-medium text-gray-700 mb-1">Requerido</div>
                                  <div className="text-gray-900 font-bold">
                                    {screen?.specs?.videoSpotDuration || 30}s • {screen?.specs.width}x{screen?.specs.height}px
                                  </div>
                                </div>
                              </div>
                              {videoValidation.recommendation && (
                                <p className={`text-sm font-medium ${
                                  videoValidation.isValid 
                                    ? 'text-emerald-700' 
                                    : videoValidation.hasCorrectDuration
                                      ? 'text-amber-700'
                                      : 'text-red-700'
                                }`}>
                                  {videoValidation.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Image Validation Results */}
                      {imageValidation && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-2xl border-2 ${
                            imageValidation.hasCorrectDimensions 
                              ? 'bg-emerald-50 border-emerald-200' 
                              : imageValidation.hasCorrectAspectRatio
                                ? 'bg-amber-50 border-amber-200'
                              : 'bg-orange-50 border-orange-200'
                        }`}
                      >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              imageValidation.hasCorrectDimensions 
                                ? 'bg-emerald-500' 
                                : imageValidation.hasCorrectAspectRatio
                                  ? 'bg-amber-500'
                                  : 'bg-orange-500'
                            }`}>
                              {imageValidation.hasCorrectDimensions ? (
                                <Check className="w-6 h-6 text-white" />
                              ) : imageValidation.hasCorrectAspectRatio ? (
                                <Info className="w-6 h-6 text-white" />
                              ) : (
                                <AlertTriangle className="w-6 h-6 text-white" />
                              )}
                            </div>
                          <div className="flex-1">
                              <h4 className={`font-bold text-lg mb-2 ${
                                imageValidation.hasCorrectDimensions 
                                  ? 'text-emerald-800' 
                                  : imageValidation.hasCorrectAspectRatio
                                    ? 'text-amber-800'
                                  : 'text-orange-800'
                            }`}>
                                {imageValidation.message}
                            </h4>
                              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div className="bg-white/70 rounded-lg p-3">
                                  <div className="font-medium text-gray-700 mb-1">Tu imagen</div>
                                  <div className="text-gray-900 font-bold">
                                    {imageDimensions?.width} × {imageDimensions?.height}px
                            </div>
                                </div>
                                <div className="bg-white/70 rounded-lg p-3">
                                  <div className="font-medium text-gray-700 mb-1">Pantalla requerida</div>
                                  <div className="text-gray-900 font-bold">
                                    {screen?.specs.width} × {screen?.specs.height}px
                                  </div>
                                </div>
                              </div>
                              {imageValidation.recommendation && (
                                <p className={`text-sm font-medium ${
                                  imageValidation.hasCorrectDimensions 
                                    ? 'text-emerald-700' 
                                    : imageValidation.hasCorrectAspectRatio
                                      ? 'text-amber-700'
                                    : 'text-orange-700'
                              }`}>
                                {imageValidation.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                      {/* Mobile-Optimized Touch Image Editor */}
                      {isEditingImage && file && file.type.startsWith('image/') && screen && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
                        >
                          {/* Mobile-optimized editor header */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-8 py-4 sm:py-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                  <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg sm:text-2xl font-bold text-white">Editor Touch</h4>
                                  <p className="text-blue-100 text-xs sm:text-sm">
                                    {isMobileEditor ? "Pellizca para zoom, toca y arrastra" : `${screen.specs.width} × ${screen.specs.height}px • ${file.name}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                  onClick={handleCancelEdit}
                                  className="mobile-touch-target bg-white/20 text-white rounded-lg sm:rounded-xl font-medium hover:bg-white/30 transition-colors text-sm sm:text-base"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={handleApplyEdits}
                                  className="mobile-touch-target bg-white text-blue-600 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                >
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                  Aplicar
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Editor content optimized for mobile */}
                          <div className="p-3 sm:p-8">
                            {/* Mobile instructions */}
                            {isMobileEditor && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Info className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-blue-800 text-sm mb-1">Gestos Touch</h5>
                                    <div className="text-blue-700 text-xs space-y-1">
                                      <p>• <strong>Pellizcar:</strong> Hacer zoom in/out</p>
                                      <p>• <strong>Arrastrar:</strong> Mover imagen</p>
                                      <p>• <strong>Tocar botones:</strong> Aplicar filtros</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Touch-optimized canvas area */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-4 sm:mb-8">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <h5 className="font-bold text-gray-900 text-sm sm:text-lg">Vista Previa</h5>
                                  <motion.div
                                    animate={{ 
                                      scale: imageTransformations.scale !== 1 || 
                                             imageTransformations.brightness !== 1 || 
                                             imageTransformations.contrast !== 1 || 
                                             imageTransformations.saturation !== 1 ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                    className="w-2 h-2 bg-green-500 rounded-full"
                                    style={{
                                      opacity: imageTransformations.scale !== 1 || 
                                              imageTransformations.brightness !== 1 || 
                                              imageTransformations.contrast !== 1 || 
                                              imageTransformations.saturation !== 1 ? 1 : 0.3
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                  <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>{screen.specs.width}×{screen.specs.height}</span>
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-inner">
                                <canvas
                                  ref={canvasRef}
                                  width={canvasSize.width}
                                  height={canvasSize.height}
                                  className="mobile-canvas border border-gray-300 rounded-lg sm:rounded-xl cursor-move mx-auto block shadow-lg max-w-full h-auto"
                                  onPointerDown={handlePointerDown}
                                  onPointerMove={handlePointerMove}
                                  onPointerUp={handlePointerUp}
                                  onTouchStart={handleTouchStart}
                                  onTouchMove={handleTouchMove}
                                  onTouchEnd={handleTouchEnd}
                                  style={{ 
                                    maxWidth: '100%',
                                    height: 'auto',
                                    touchAction: 'none'
                                  }}
                                />
                                <div className="flex flex-col sm:flex-row items-center justify-between mt-2 sm:mt-3 gap-2">
                                  <p className="text-center text-xs text-gray-500">
                                    {isMobileEditor ? "Pellizca para zoom, arrastra para mover" : "Arrastra la imagen para reposicionarla"}
                                  </p>
                                  
                                  {/* Mobile quick transform buttons */}
                                  {isMobileEditor && (
                                    <div className="flex gap-1">
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => updateTransformations({ rotation: imageTransformations.rotation + 90 })}
                                        className="mobile-touch-target bg-blue-500 text-white rounded-lg text-xs font-medium"
                                      >
                                        <RotateCw className="w-3 h-3" />
                                      </motion.button>
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => updateTransformations({ flipX: !imageTransformations.flipX })}
                                        className="mobile-touch-target bg-purple-500 text-white rounded-lg text-xs font-medium"
                                      >
                                        <Move className="w-3 h-3" />
                                      </motion.button>
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => updateTransformations({ 
                                          brightness: 1, 
                                          contrast: 1, 
                                          saturation: 1, 
                                          scale: getMinimumScale(),
                                          rotation: 0,
                                          flipX: false,
                                          flipY: false,
                                          x: 0,
                                          y: 0
                                        })}
                                        className="mobile-touch-target bg-gray-500 text-white rounded-lg text-xs font-medium"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mobile-optimized controls */}
                            <div className="space-y-3 sm:space-y-6">
                              
                              {/* Scale control - always visible and touch-optimized */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-blue-100"
                              >
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                      <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <h6 className="font-bold text-gray-900 text-sm sm:text-lg">Zoom</h6>
                                  </div>
                                  <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md"
                                  >
                                    {imageTransformations.scale.toFixed(1)}x
                                  </motion.div>
                                </div>
                                
                                <div className="relative">
                                  <input
                                    type="range"
                                    min={getMinimumScale()}
                                    max={3}
                                    step={0.05}
                                    value={imageTransformations.scale}
                                    onChange={(e) => updateTransformations({ scale: parseFloat(e.target.value) })}
                                    className="w-full mobile-slider bg-gradient-to-r from-blue-200 via-blue-300 to-indigo-400 rounded-full cursor-pointer"
                                    style={{
                                      background: `linear-gradient(to right, #3b82f6 0%, #6366f1 ${((imageTransformations.scale - getMinimumScale()) / (3 - getMinimumScale())) * 100}%, #e2e8f0 ${((imageTransformations.scale - getMinimumScale()) / (3 - getMinimumScale())) * 100}%, #e2e8f0 100%)`
                                    }}
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1 sm:mt-2">
                                    <span>{getMinimumScale().toFixed(1)}x</span>
                                    <span>3.0x</span>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Mobile filter presets - simplified grid */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-purple-100"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <h6 className="font-bold text-gray-900 text-sm sm:text-lg">Filtros</h6>
                                </div>
                                
                                <div className="mobile-filter-grid grid">
                                  {FILTER_PRESETS.map((preset, index) => (
                                    <MobileLazyFilterPreset
                                      key={preset.id}
                                      preset={preset}
                                      index={index}
                                      selectedPreset={selectedPreset}
                                      onApply={applyPreset}
                                    />
                                  ))}
                                </div>
                              </motion.div>

                              {/* Mobile manual adjustments - collapsible */}
                              {!isMobileEditor && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-xl sm:rounded-2xl shadow-lg border border-green-100"
                                >
                                  <div className="p-3 sm:p-6">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                        <Sliders className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                      </div>
                                      <h6 className="font-bold text-gray-900 text-sm sm:text-lg">Ajustes Avanzados</h6>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                                      {/* Brightness */}
                                      <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between">
                                          <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1 sm:gap-2">
                                            ☀️ Brillo
                                          </label>
                                          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-xs font-bold shadow-sm">
                                            {imageTransformations.brightness.toFixed(1)}
                                          </div>
                                        </div>
                                        <input
                                          type="range"
                                          min={0.5}
                                          max={2}
                                          step={0.05}
                                          value={imageTransformations.brightness}
                                          onChange={(e) => updateTransformations({ brightness: parseFloat(e.target.value) })}
                                          className="w-full mobile-slider bg-gradient-to-r from-yellow-200 to-orange-300 rounded-full cursor-pointer"
                                        />
                                      </div>

                                      {/* Contrast */}
                                      <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between">
                                          <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1 sm:gap-2">
                                            ⚫ Contraste
                                          </label>
                                          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg text-xs font-bold shadow-sm">
                                            {imageTransformations.contrast.toFixed(1)}
                                          </div>
                                        </div>
                                        <input
                                          type="range"
                                          min={0.5}
                                          max={2}
                                          step={0.05}
                                          value={imageTransformations.contrast}
                                          onChange={(e) => updateTransformations({ contrast: parseFloat(e.target.value) })}
                                          className="w-full mobile-slider bg-gradient-to-r from-gray-300 to-gray-600 rounded-full cursor-pointer"
                                        />
                                      </div>

                                      {/* Saturation */}
                                      <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between">
                                          <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1 sm:gap-2">
                                            🌈 Saturación
                                          </label>
                                          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg text-xs font-bold shadow-sm">
                                            {imageTransformations.saturation.toFixed(1)}
                                          </div>
                                        </div>
                                        <input
                                          type="range"
                                          min={0}
                                          max={2}
                                          step={0.05}
                                          value={imageTransformations.saturation}
                                          onChange={(e) => updateTransformations({ saturation: parseFloat(e.target.value) })}
                                          className="w-full mobile-slider bg-gradient-to-r from-gray-300 via-pink-300 to-rose-400 rounded-full cursor-pointer"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Mobile-Optimized Video Editor with Touch Enhancements */}
                      {isEditingVideo && file && file.type.startsWith('video/') && screen && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                        >
                          {/* Mobile-optimized header */}
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-3 sm:px-4 py-3 sm:py-4">
                            <div className="text-center">
                              <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                                ✂️ {isMobileEditor ? "Editor de Video" : "Recortar Video"}
                              </h4>
                              <p className="text-blue-100 text-xs sm:text-sm">
                                {isMobileEditor ? 
                                  `Ajusta a ${videoTrimSettings.targetDuration}s • Toca para seleccionar` :
                                  `Tu video necesita durar exactamente ${videoTrimSettings.targetDuration} segundos`
                                }
                              </p>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            {/* Video Preview */}
                            <div className="bg-black rounded-xl overflow-hidden mb-6">
                              <video
                                ref={setVideoRef}
                                src={filePreview!}
                                className="w-full h-48 object-contain"
                                controls={true}
                                preload="metadata"
                              />
                            </div>

                            {/* Simple Visual Explanation */}
                            <div className="text-center mb-6">
                              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-700">
                                  Elige qué parte del video usar
                                </span>
                              </div>
                            </div>

                            {/* Touch-optimized action buttons with haptic feedback */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                              <motion.button
                                onClick={() => {
                                  triggerHapticFeedback('light');
                                  handleVideoTrimChange(0, videoTrimSettings.targetDuration);
                                }}
                                className="mobile-touch-target w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all"
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: isMobileEditor ? 1 : 1.02 }}
                              >
                                <div className="flex items-center justify-center gap-2 sm:gap-3">
                                  <span className="text-lg sm:text-xl">🎬</span>
                                  <div className="text-left">
                                    <div className="font-bold">Desde el inicio</div>
                                    <div className="text-xs sm:text-sm opacity-90">
                                      Los primeros {videoTrimSettings.targetDuration}s
                                    </div>
                                  </div>
                                </div>
                              </motion.button>
                              
                              <motion.button
                                onClick={() => {
                                  triggerHapticFeedback('light');
                                  const center = (videoDuration || 0) / 2;
                                  const half = videoTrimSettings.targetDuration / 2;
                                  handleVideoTrimChange(
                                    Math.max(0, center - half),
                                    Math.min(videoDuration || 0, center + half)
                                  );
                                }}
                                className="mobile-touch-target w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all"
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: isMobileEditor ? 1 : 1.02 }}
                              >
                                <div className="flex items-center justify-center gap-2 sm:gap-3">
                                  <span className="text-lg sm:text-xl">🎯</span>
                                  <div className="text-left">
                                    <div className="font-bold">Parte del centro</div>
                                    <div className="text-xs sm:text-sm opacity-90">
                                      {videoTrimSettings.targetDuration}s del medio
                                    </div>
                                  </div>
                                </div>
                              </motion.button>
                              
                              <motion.button
                                onClick={() => {
                                  triggerHapticFeedback('light');
                                  handleVideoTrimChange(
                                    Math.max(0, (videoDuration || 0) - videoTrimSettings.targetDuration),
                                    videoDuration || 0
                                  );
                                }}
                                className="mobile-touch-target w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all"
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: isMobileEditor ? 1 : 1.02 }}
                              >
                                <div className="flex items-center justify-center gap-2 sm:gap-3">
                                  <span className="text-lg sm:text-xl">🏁</span>
                                  <div className="text-left">
                                    <div className="font-bold">Desde el final</div>
                                    <div className="text-xs sm:text-sm opacity-90">
                                      Los últimos {videoTrimSettings.targetDuration}s
                                    </div>
                                  </div>
                                </div>
                              </motion.button>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="mb-6">
                              <div className="text-center mb-3">
                                <span className="text-2xl font-bold text-gray-800">
                                  {(videoTrimSettings.endTime - videoTrimSettings.startTime).toFixed(1)}s
                                </span>
                                <span className="text-gray-500 ml-2">
                                  de {videoTrimSettings.targetDuration}s necesarios
                      </span>
                    </div>
                              
                              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                  style={{
                                    width: `${Math.min(100, ((videoTrimSettings.endTime - videoTrimSettings.startTime) / videoTrimSettings.targetDuration) * 100)}%`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Status with Emoji */}
                            <div className={`p-4 rounded-xl text-center font-medium text-lg ${
                              Math.abs((videoTrimSettings.endTime - videoTrimSettings.startTime) - videoTrimSettings.targetDuration) <= 0.5
                                ? 'bg-green-50 text-green-700 border-2 border-green-200'
                                : 'bg-orange-50 text-orange-700 border-2 border-orange-200'
                            }`}>
                              {Math.abs((videoTrimSettings.endTime - videoTrimSettings.startTime) - videoTrimSettings.targetDuration) <= 0.5 ? (
                                <div>
                                  <div className="text-3xl mb-2">✅</div>
                                  <div className="font-bold">¡Perfecto!</div>
                                  <div className="text-sm opacity-80">Tu video está listo</div>
                  </div>
                ) : (
                      <div>
                                  <div className="text-3xl mb-2">⏱️</div>
                                  <div className="font-bold">Elige una opción arriba</div>
                                  <div className="text-sm opacity-80">Para ajustar la duración</div>
                                </div>
                              )}
                            </div>

                            {/* Mobile-optimized action buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                              <motion.button
                                onClick={() => {
                                  triggerHapticFeedback('medium');
                                  handleCancelVideoEdit();
                                }}
                                className="mobile-touch-target order-2 sm:order-1 flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg sm:rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"
                                whileTap={{ scale: 0.98 }}
                              >
                                Cancelar
                              </motion.button>
                              <motion.button
                                onClick={() => {
                                  if (!isProcessingVideo && Math.abs((videoTrimSettings.endTime - videoTrimSettings.startTime) - videoTrimSettings.targetDuration) <= 0.5) {
                                    triggerHapticFeedback('heavy');
                                    handleApplyVideoTrim();
                                  }
                                }}
                                disabled={isProcessingVideo || Math.abs((videoTrimSettings.endTime - videoTrimSettings.startTime) - videoTrimSettings.targetDuration) > 0.5}
                                className="mobile-touch-target order-1 sm:order-2 flex-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: isMobileEditor ? 1 : 1.02 }}
                              >
                                {isProcessingVideo ? (
                                  <>
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Procesando...</span>
                                    <span className="sm:hidden">Procesando</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm sm:text-base">✨</span>
                                    <span className="hidden sm:inline">Aplicar Recorte</span>
                                    <span className="sm:hidden">Aplicar</span>
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                  </div>
                ) : (
                    /* Upload Later Option */
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 text-xl mb-3">Subir creatividad más tarde</h4>
                          <p className="text-blue-700 mb-6 leading-relaxed">
                          Has elegido subir tu creatividad más tarde. Podrás hacerlo desde tu panel de control después de completar la compra.
                            Te enviaremos un recordatorio por email con las instrucciones.
                        </p>
                          <button
                          onClick={() => setUploadLater(false)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                          Subir ahora
                          </button>
                      </div>
                    </div>
                  </div>
                )}
                
                  {/* Technical Specifications */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Especificaciones técnicas</h4>
                        <p className="text-gray-600 text-sm">Requisitos para tu contenido</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Screen Resolution Highlight */}
                      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-white" />
                        </div>
                          <span className="font-bold text-blue-800 text-base">Resolución de pantalla</span>
                        </div>
                        <p className="text-2xl font-black text-blue-900 mb-2">
                          {screen?.specs.width} × {screen?.specs.height}
                        </p>
                        <p className="text-xs text-blue-700 font-medium">
                          Para mejor calidad, sube tu imagen en estas dimensiones exactas
                        </p>
                      </div>
                      
                      {/* Other Specs */}
                      <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <h5 className="font-bold text-gray-900 mb-3 text-base">Formatos y límites</h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span><strong>Formatos aceptados:</strong> JPG, PNG, MP4</span>
                      </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span><strong>Duración de video:</strong> {screen?.specs?.videoSpotDuration || 30} segundos exactos</span>
                    </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span><strong>Tamaño máximo:</strong> 100MB</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span><strong>Aspecto ratio:</strong> {screen ? (screen.specs.width / screen.specs.height).toFixed(2) : 'N/A'}:1</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span>No incluir contenido ofensivo o inapropiado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                
                {/* Error Message */}
                  <AnimatePresence>
                {error && (
                      <motion.div 
                        className="p-6 bg-red-50 rounded-2xl flex items-start gap-4 border-2 border-red-200"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-red-800 text-lg mb-1">Error de validación</h4>
                          <p className="text-red-700 font-medium">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              </AnimatePresence>
            </div>

            {/* Mobile-optimized footer */}
            <div className="mobile-modal-footer border-t border-neutral-200 bg-neutral-50 flex justify-between">
              <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="px-4 sm:px-6 py-3 text-sm sm:text-base font-bold"
                >
                  {step === 1 ? 'Cancelar' : 'Atrás'}
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ x: 3 }} 
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0.7 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.5 }
                }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  icon={step === 2 ? DollarSign : ArrowRight}
                  onClick={handleNext}
                  className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 px-4 sm:px-7 py-3 text-sm sm:text-base font-bold"
                >
                  {step === 2 ? 'Finalizar Compra' : 'Continuar'}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}