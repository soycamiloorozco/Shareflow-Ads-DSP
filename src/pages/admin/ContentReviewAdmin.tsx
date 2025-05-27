import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Search, Calendar, Clock, 
  Eye, FileText,
  Monitor, X, AlertCircle, FileImage, Info, 
  FileVideo, Image as ImageIcon, 
  Bot, Sparkles, ArrowRight,
  CheckCircle, XCircle,  
  Tag, Download, Play, 
  Menu,
  CalendarClock, RadioTower,
  LayoutGrid
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { useMomentPurchases } from '../../hooks/useMomentPurchases';
import { PurchasedSportMomentCard } from '../../components/admin/PurchasedSportMomentCard';

// Defining interfaces
interface Screen {
  id: string;
  name: string;
  isConnected: boolean;
  resolution: string;
  aspectRatio: string;
  location?: string;
}

interface ContentSubmission {
  id: string;
  orderId: string;
  title: string;
  type: 'image' | 'video';
  status: number;
  screen: Screen;
  purchaseType: 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  spots: number;
  startDate: string;
  endDate: string;
  purchaseDate: string;
  reference: string; // Anonymous reference code instead of user details
  preview: string;
  format: string;
  size: string;
  duration?: string;
  isDownloaded: boolean;
  aiAnalysis?: {
    isCompliant: boolean;
    confidence: number;
    issues: string[];
    recommendations: string[];
    textPercentage?: number; // Add text percentage field
  };
  rejectionReason?: {
    category: string;
    description: string;
  };
}

// Mock data for content submissions
const mockSubmissions: ContentSubmission[] = [
  {
    id: 'sub_1',
    orderId: 'ORD-2024-001',
    title: 'Verano 2024 - Coca Cola',
    type: 'video',
    status: 0,
    screen: {
      id: 'scr_1',
      name: 'Plaza Mayor LED',
      isConnected: true,
      resolution: '1920x1080',
      aspectRatio: '16:9',
      location: 'Medellín Centro'
    },
    purchaseType: 'moment',
    spots: 2,
    startDate: '2024-04-05T09:40:00Z',
    endDate: '2024-04-05T10:10:00Z',
    purchaseDate: '2024-04-04T03:24:00Z',
    reference: 'ADV58793',
    preview: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=1200',
    format: 'MP4',
    size: '12.4 MB',
    duration: '15 segundos',
    isDownloaded: false,
    aiAnalysis: {
      isCompliant: true,
      confidence: 95,
      textPercentage: 12,
      issues: [],
      recommendations: [
        "El contenido cumple con todas las políticas de la plataforma",
        "Excelente contraste y legibilidad",
        "El texto ocupa solo un 12% del área, ideal para visualización"
      ]
    }
  },
  {
    id: 'sub_2',
    orderId: 'ORD-2024-002',
    title: 'Spring Collection - Zara',
    type: 'image',
    status: 0,
    screen: {
      id: 'scr_2',
      name: 'Santafé Premium',
      isConnected: false,
      resolution: '1080x1920',
      aspectRatio: '9:16',
      location: 'Medellín Poblado'
    },
    purchaseType: 'daily',
    spots: 24,
    startDate: '2024-04-10T00:00:00Z',
    endDate: '2024-04-10T23:59:59Z',
    purchaseDate: '2024-04-03T15:30:00Z',
    reference: 'ADV24567',
    preview: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200',
    format: 'JPG',
    size: '3.2 MB',
    isDownloaded: false,
    aiAnalysis: {
      isCompliant: false,
      confidence: 85,
      textPercentage: 42,
      issues: [
        "Texto demasiado pequeño para visualización en pantalla",
        "Contraste insuficiente entre texto y fondo",
        "El texto ocupa un 42% del área (recomendado menos del 30%)"
      ],
      recommendations: [
        "Aumentar el tamaño del texto principal al menos un 30%",
        "Mejorar el contraste entre el texto y el fondo",
        "Reducir la cantidad de texto para que ocupe menos del 30% del área total"
      ]
    }
  },
  {
    id: 'sub_3',
    orderId: 'ORD-2024-005',
    title: 'Lanzamiento Nuevo Smartphone',
    type: 'video',
    status: 1,
    screen: {
      id: 'scr_5',
      name: 'Valla Digital Laureles',
      isConnected: true,
      resolution: '1920x1080',
      aspectRatio: '16:9',
      location: 'Medellín Laureles'
    },
    purchaseType: 'moment',
    spots: 3,
    startDate: '2024-04-08T18:30:00Z',
    endDate: '2024-04-08T20:00:00Z',
    purchaseDate: '2024-03-30T09:45:00Z',
    reference: 'ADV78321',
    preview: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1200',
    format: 'MP4',
    size: '18.7 MB',
    duration: '20 segundos',
    isDownloaded: true,
    aiAnalysis: {
      isCompliant: true,
      confidence: 98,
      textPercentage: 18,
      issues: [],
      recommendations: [
        "El contenido cumple con todas las políticas de la plataforma",
        "Excelente calidad visual y mensaje claro",
        "Buen balance entre texto (18%) e imagen (82%)"
      ]
    }
  },
  {
    id: 'sub_4',
    orderId: 'ORD-2024-006',
    title: 'Oferta Especial - Bancolombia',
    type: 'image',
    status: 2,
    screen: {
      id: 'scr_6',
      name: 'Centro Comercial Santafé',
      isConnected: false,
      resolution: '1080x1920',
      aspectRatio: '9:16',
      location: 'Medellín Centro'
    },
    purchaseType: 'weekly',
    spots: 168,
    startDate: '2024-04-01T00:00:00Z',
    endDate: '2024-04-08T23:59:59Z',
    purchaseDate: '2024-03-25T11:30:00Z',
    reference: 'ADV98532',
    preview: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200',
    format: 'PNG',
    size: '5.4 MB',
    isDownloaded: false,
    aiAnalysis: {
      isCompliant: false,
      confidence: 90,
      textPercentage: 56,
      issues: [
        "Texto demasiado pequeño para visualización en pantalla",
        "Demasiada información en una sola imagen",
        "El texto ocupa un 56% del área (recomendado menos del 30%)"
      ],
      recommendations: [
        "Aumentar el tamaño del texto principal",
        "Simplificar el mensaje a comunicar",
        "Reducir la cantidad de texto para dar más protagonismo a la imagen"
      ]
    },
    rejectionReason: {
      category: "legibility",
      description: "El texto es demasiado pequeño y hay exceso de información, lo que dificulta la legibilidad en la pantalla digital. El texto ocupa más del 50% del área."
    }
  },
  {
    id: 'sub_5',
    orderId: 'ORD-2024-007',
    title: 'Gran Inauguración - Nike',
    type: 'video',
    status: 0,
    screen: {
      id: 'scr_3',
      name: 'Boulevard El Hueco',
      isConnected: true,
      resolution: '3840x2160',
      aspectRatio: '16:9',
      location: 'Medellín Centro'
    },
    purchaseType: 'hourly',
    spots: 3,
    startDate: '2024-04-12T14:00:00Z',
    endDate: '2024-04-12T17:00:00Z',
    purchaseDate: '2024-04-05T18:22:00Z',
    reference: 'ADV34567',
    preview: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    format: 'MP4',
    size: '24.1 MB',
    duration: '30 segundos',
    isDownloaded: false,
    aiAnalysis: {
      isCompliant: true,
      confidence: 97,
      issues: [],
      recommendations: [
        "El contenido cumple con todas las políticas de la plataforma",
        "Buen uso de color y contraste"
      ]
    }
  },
  {
    id: 'sub_6',
    orderId: 'ORD-2024-008',
    title: 'Festival de música - Concierto en vivo',
    type: 'image',
    status: 1,
    screen: {
      id: 'scr_4',
      name: 'Terminal del Norte',
      isConnected: false,
      resolution: '1920x1080',
      aspectRatio: '16:9',
      location: 'Medellín Norte'
    },
    purchaseType: 'daily',
    spots: 12,
    startDate: '2024-04-18T08:00:00Z',
    endDate: '2024-04-18T20:00:00Z',
    purchaseDate: '2024-04-02T10:15:00Z',
    reference: 'ADV45678',
    preview: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200',
    format: 'JPG',
    size: '4.8 MB',
    isDownloaded: true,
    aiAnalysis: {
      isCompliant: true,
      confidence: 92,
      issues: [],
      recommendations: [
        "El contenido cumple con todas las políticas de la plataforma"
      ]
    }
  }
];

// Animation variants for UI elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15 
    }
  }
};

export function ContentReviewAdmin() {

  const { getPurchaseMoments, purchasedMoments, approvePurchaseMoments, rejectPurchaseMoments } = useMomentPurchases();
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [screenFilter, setScreenFilter] = useState<string | null>(null);
  const [connectivityFilter, setConnectivityFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [rejectReason, setRejectReason] = useState({
    category: '',
    description: ''
  });
  
  // Animation controls
  const controls = useAnimation();
  
  useEffect(() => {
    getPurchaseMoments()
  }, []);
  useEffect(() => {
    controls.start('visible');
  }, [controls, activeTab, statusFilter, screenFilter, connectivityFilter, typeFilter]);


  // Filter submissions for events sport based on search and filters
  const filteredSubmissionsSportEvents = purchasedMoments
    .filter(submission => {
      const matchesSearch = !searchQuery || 
        submission.stadium.name.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = !statusFilter || submission.status === statusFilter;
      
      
      const matchesType = !typeFilter || submission.type === typeFilter;
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'pending' && submission.status === 0) ||
        (activeTab === 'approved' && submission.status === 1) ||
        (activeTab === 'rejected' && submission.status === 2);
        
      return matchesSearch && matchesStatus && matchesType && matchesTab;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
 
  
  // Filter submissions based on search and filters
  const filteredSubmissions = mockSubmissions
    .filter(submission => {
      const matchesSearch = !searchQuery || 
        submission.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        submission.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.reference.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = !statusFilter || submission.status === statusFilter;
      const matchesScreen = !screenFilter || submission.screen.id === screenFilter;
      const matchesConnectivity = !connectivityFilter || 
        (connectivityFilter === 'connected' && submission.screen.isConnected) ||
        (connectivityFilter === 'manual' && !submission.screen.isConnected);
      const matchesType = !typeFilter || submission.type === typeFilter;
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'pending' && submission.status === 0) ||
        (activeTab === 'approved' && submission.status === 1) ||
        (activeTab === 'rejected' && submission.status === 2);
        
      return matchesSearch && matchesStatus && matchesScreen && matchesConnectivity && matchesType && matchesTab;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      } else {
        return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
      }
    });
  
  
  const aprovedSportEvent = (id: string) => {
    approvePurchaseMoments(id);
    getPurchaseMoments();
  }


  const rejectSportEvent = async (id: string, data: {
    rejectionCategory: string;
    rejectionReason: string
  }) => {
    await rejectPurchaseMoments(id, data);
    await getPurchaseMoments();
  }
  // Action handlers
  const handleOpenPreviewModal = (submission: ContentSubmission) => {
    setSelectedSubmission(submission);
    setIsPreviewModalOpen(true);
  };


  const handleOpenAIAnalysisModal = (submission: ContentSubmission) => {
    setSelectedSubmission(submission);
    setIsAIAnalysisModalOpen(true);
  };

  const handleOpenRejectModal = (submission: ContentSubmission) => {
    setSelectedSubmission(submission);
    setIsRejectModalOpen(true);
  };
  
  const handleOpenDownloadModal = (submission: ContentSubmission) => {
    // Asegurarse que no sea una pantalla tipo "moment" para manuales
    if (!submission.screen.isConnected && submission.purchaseType === 'moment') {
      toast.error('Los momentos no están disponibles para pantallas manuales.');
      return;
    }
    
    setSelectedSubmission(submission);
    setIsDownloadModalOpen(true);
  };

  const handleApproveSubmission = (submission: ContentSubmission) => {
    // Simulating API call to approve submission
    toast.success(`Contenido "${submission.title}" aprobado correctamente`);
    
    // Always close preview modal when approving
    setIsPreviewModalOpen(false);
    
    if (!submission.screen.isConnected) {
      // Verificar que no sea tipo "moments" para pantallas manuales
      if (submission.purchaseType === 'moment') {
        toast.error('Los momentos no están disponibles para pantallas manuales.');
        return;
      }
      
      // For non-connected screens, prompt for download immediately
      handleOpenDownloadModal(submission);
    }
  };
  
  const handleRejectSubmission = () => {
    if (!selectedSubmission || !rejectReason.category || !rejectReason.description) return;
    
    // Simulating API call to reject submission
    toast.success(`Contenido "${selectedSubmission.title}" rechazado correctamente`);
    setIsRejectModalOpen(false);
    setRejectReason({ category: '', description: '' });
  };
  
  const handleDownloadContent = (submission: ContentSubmission) => {
    // Simulating download
    toast.success('Descargando contenido...');
    
    // In real implementation, this would trigger an actual download
    setTimeout(() => {
      toast.success('Contenido descargado correctamente');
      setIsDownloadModalOpen(false);
    }, 1500);
  };

  // Nueva función para descargar el resumen de la orden en PDF
  const handleDownloadOrderSummary = (submission: ContentSubmission) => {
    // Simulating PDF download
    toast.success('Generando resumen de orden de compra...');
    
    // In a real implementation, this would generate and trigger a PDF download
    // For example, using a library like jsPDF, pdfmake, or react-pdf
    setTimeout(() => {
      toast.success('Resumen de orden de compra descargado correctamente');
    }, 1500);
  };

  // Options for Select components
  const screenOptions = Array.from(new Set(mockSubmissions.map(submission => submission.screen.id)))
    .map(screenId => {
      const screen = mockSubmissions.find(s => s.screen.id === screenId)?.screen;
      return {
        value: screenId,
        label: screen?.name || 'Unknown'
      };
    });

  // Count submissions by status
  const submissionCounts = {
    pending: mockSubmissions.filter(s => s.status === 0).length + purchasedMoments.filter(s => s.status === 0).length,
    approved: mockSubmissions.filter(s => s.status === 1).length + purchasedMoments.filter(s => s.status === 1).length,
    rejected: mockSubmissions.filter(s => s.status === 2).length + purchasedMoments.filter(s => s.status === 2).length,
    total: mockSubmissions.length
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 md:pb-0">
      {/* Vibrant Header with Shareflow-inspired gradient */}
      <div className="bg-gradient-to-r from-[#353FEF] via-[#4B54FF] to-[#6366FF] text-white relative overflow-hidden">
        {/* Background pattern for visual interest */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwYzUwIDAgNTAgNTAgMTAwIDUwUzE1MCAwIDIwMCAwdjEwMGMtNTAgMC01MCA1MC0xMDAgNTBTMCAxMDAgMCAxMDB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileImage className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Revisión de Contenido
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, 0, -10, 0],
                      scale: [1, 1.1, 1, 1.1, 1] 
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    ✨
                  </motion.div>
                </h1>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-white/80 max-w-xl"
              >
                Revisa y gestiona el contenido enviado para tus pantallas. Las aprobaciones se publican automáticamente en pantallas conectadas.
              </motion.p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-lg"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/70">Pendientes</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{submissionCounts.pending}</span>
                    <span className="text-sm text-white/70 ml-1">contenidos</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Sub stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-white/70" />
                <div>
                  <p className="text-xs text-white/70">Total</p>
                  <p className="text-lg font-semibold">{submissionCounts.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <RadioTower className="w-4 h-4 text-white/70" />
                <div>
                  <p className="text-xs text-white/70">Conectadas</p>
                  <p className="text-lg font-semibold">{mockSubmissions.filter(s => s.screen.isConnected).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-white/70" />
                <div>
                  <p className="text-xs text-white/70">Manuales</p>
                  <p className="text-lg font-semibold">{mockSubmissions.filter(s => !s.screen.isConnected).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-white/70" />
                <div>
                  <p className="text-xs text-white/70">Hoy</p>
                  <p className="text-lg font-semibold">
                    {mockSubmissions.filter(s => {
                      const today = new Date();
                      const startDate = new Date(s.startDate);
                      return startDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab filters with animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          {/* Status Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-6">
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(53, 63, 239, 0.3)" }}
              whileTap={{ y: 0, boxShadow: "0 5px 15px -3px rgba(53, 63, 239, 0.2)" }}
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'bg-[#353FEF] text-white font-medium shadow-lg' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-800 hover:shadow-sm'
              }`}
            >
              <Tag className="w-5 h-5" />
              <span>Todos</span>
              <span className={`ml-1 ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-[#353FEF]/10 text-[#353FEF]'} px-2 py-0.5 rounded-full text-xs font-medium`}>
                {submissionCounts.total}
              </span>
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(255, 152, 0, 0.3)" }}
              whileTap={{ y: 0, boxShadow: "0 5px 15px -3px rgba(255, 152, 0, 0.2)" }}
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200 ${
                activeTab === 'pending' 
                  ? 'bg-[#FF9800] text-white font-medium shadow-lg' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-800 hover:shadow-sm'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Pendientes</span>
              <span className={`ml-1 ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-[#FF9800]/10 text-[#FF9800]'} px-2 py-0.5 rounded-full text-xs font-medium`}>
                {submissionCounts.pending}
              </span>
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(171, 250, 169, 0.3)" }}
              whileTap={{ y: 0, boxShadow: "0 5px 15px -3px rgba(171, 250, 169, 0.2)" }}
              onClick={() => setActiveTab('approved')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200 ${
                activeTab === 'approved' 
                  ? 'bg-[#ABFAA9] text-[#2C652B] font-medium shadow-lg' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-800 hover:shadow-sm'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Aprobados</span>
              <span className={`ml-1 ${activeTab === 'approved' ? 'bg-[#2C652B]/20 text-[#2C652B]' : 'bg-[#ABFAA9]/30 text-[#2C652B]'} px-2 py-0.5 rounded-full text-xs font-medium`}>
                {submissionCounts.approved}
              </span>
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(244, 67, 54, 0.3)" }}
              whileTap={{ y: 0, boxShadow: "0 5px 15px -3px rgba(244, 67, 54, 0.2)" }}
              onClick={() => setActiveTab('rejected')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200 ${
                activeTab === 'rejected' 
                  ? 'bg-[#F44336] text-white font-medium shadow-lg' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-800 hover:shadow-sm'
              }`}
            >
              <XCircle className="w-5 h-5" />
              <span>Rechazados</span>
              <span className={`ml-1 ${activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-[#F44336]/10 text-[#F44336]'} px-2 py-0.5 rounded-full text-xs font-medium`}>
                {submissionCounts.rejected}
              </span>
            </motion.button>
          </div>

          {/* Search and Filters */}
          <motion.div 
            variants={itemVariants}
            className="p-5 bg-white rounded-2xl shadow-sm mb-8 border border-neutral-100"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-[#353FEF] transition-colors duration-200" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título, orden o referencia..."
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent text-sm transition-all duration-200 hover:border-[#353FEF]/50"
                  />
                  {searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#F44336] transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Select
                  placeholder="Estado"
                  options={[
                    { value: 0, label: 'Pendiente' },
                    { value: 0, label: 'Aprobado' },
                    { value: 0, label: 'Rechazado' }
                  ]}
                  onChange={(option) => setStatusFilter(option?.value ?? 0)}
                  isClearable
                  className="w-[150px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      padding: '0.25rem',
                      borderColor: '#e5e7eb',
                      '&:hover': {
                        borderColor: '#353FEF'
                      },
                      boxShadow: 'none',
                      cursor: 'pointer'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected 
                        ? 'rgba(53, 63, 239, 0.1)'
                        : state.isFocused
                          ? 'rgba(53, 63, 239, 0.05)'
                          : 'white',
                      color: state.isSelected 
                        ? '#353FEF'
                        : 'inherit',
                      cursor: 'pointer'
                    })
                  }}
                />

                <Select
                  placeholder="Pantalla"
                  options={screenOptions}
                  onChange={(option) => setScreenFilter(option?.value || null)}
                  isClearable
                  className="w-[200px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      padding: '0.25rem',
                      borderColor: '#e5e7eb',
                      '&:hover': {
                        borderColor: '#353FEF'
                      },
                      boxShadow: 'none',
                      cursor: 'pointer'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected 
                        ? 'rgba(53, 63, 239, 0.1)'
                        : state.isFocused
                          ? 'rgba(53, 63, 239, 0.05)'
                          : 'white',
                      color: state.isSelected 
                        ? '#353FEF'
                        : 'inherit',
                      cursor: 'pointer'
                    })
                  }}
                />
                
                <Select
                  placeholder="Conectividad"
                  options={[
                    { value: 'connected', label: 'Conectadas' },
                    { value: 'manual', label: 'Manuales' }
                  ]}
                  onChange={(option) => setConnectivityFilter(option?.value || null)}
                  isClearable
                  className="w-[160px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      padding: '0.25rem',
                      borderColor: '#e5e7eb',
                      '&:hover': {
                        borderColor: '#353FEF'
                      },
                      boxShadow: 'none',
                      cursor: 'pointer'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected 
                        ? 'rgba(53, 63, 239, 0.1)'
                        : state.isFocused
                          ? 'rgba(53, 63, 239, 0.05)'
                          : 'white',
                      color: state.isSelected 
                        ? '#353FEF'
                        : 'inherit',
                      cursor: 'pointer'
                    })
                  }}
                />
                
                <Select
                  placeholder="Tipo"
                  options={[
                    { value: 'image', label: 'Imagen' },
                    { value: 'video', label: 'Video' }
                  ]}
                  onChange={(option) => setTypeFilter(option?.value || null)}
                  isClearable
                  className="w-[140px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      padding: '0.25rem',
                      borderColor: '#e5e7eb',
                      '&:hover': {
                        borderColor: '#353FEF'
                      },
                      boxShadow: 'none',
                      cursor: 'pointer'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected 
                        ? 'rgba(53, 63, 239, 0.1)'
                        : state.isFocused
                          ? 'rgba(53, 63, 239, 0.05)'
                          : 'white',
                      color: state.isSelected 
                        ? '#353FEF'
                        : 'inherit',
                      cursor: 'pointer'
                    })
                  }}
                />
              </div>
            </div>
            
            {/* Additional view options */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-500">Mostrar:</span>
                <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
                  <motion.button
                    whileHover={{ backgroundColor: currentView === 'grid' ? '' : '#f3f4f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView('grid')}
                    className={`p-2 rounded-md ${currentView === 'grid' ? 'bg-white shadow-sm text-[#353FEF]' : 'text-neutral-500'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: currentView === 'list' ? '' : '#f3f4f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView('list')}
                    className={`p-2 rounded-md ${currentView === 'list' ? 'bg-white shadow-sm text-[#353FEF]' : 'text-neutral-500'}`}
                  >
                    <Menu className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">Ordenar:</span>
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className="flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-neutral-100 text-sm"
                >
                  {sortOrder === 'newest' ? (
                    <>
                      Más recientes
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    </>
                  ) : (
                    <>
                      Más antiguos
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content Grid View */}
        {currentView === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

            {filteredSubmissionsSportEvents.length > 0 ? (
              filteredSubmissionsSportEvents.map((submission, key) => (
                <PurchasedSportMomentCard
                  key={key}
                  submission={submission}
                  aprovedSportEvent={() => aprovedSportEvent(submission.id)}
                  rejectSportEvent={rejectSportEvent}
                
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No hay contenido para revisar</h3>
                <p className="text-neutral-500 mb-6 max-w-md text-center">No se encontraron revisiones con los filtros seleccionados. Intenta con otros criterios o limpia los filtros.</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="primary" 
                    icon={X}
                    className="bg-[#FF2B67] hover:bg-[#E0195A]"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter(0);
                      setScreenFilter(null);
                      setConnectivityFilter(null);
                      setTypeFilter(null);
                      setActiveTab('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </motion.div>
              </div>
            )}


            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden h-full bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200">
                    <div className="relative aspect-video">
                      <img 
                        src={submission.preview}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Combined top-right status indicator */}
                      <div className="absolute top-3 right-3">
                        <div className="flex flex-col gap-2 items-end">
                          {/* Status badge - simplified */}
                          <span className={`
                            px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm
                            ${submission.status === 1
                              ? 'bg-[#ABFAA9]/90 text-[#2C652B]'
                              : submission.status === 2
                              ? 'bg-[#F44336]/90 text-white'
                              : 'bg-[#FF9800]/90 text-white'
                            }
                          `}>
                            {submission.status === 1 ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : submission.status === 2 ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {submission.status === 1 ? 'Aprobado' :
                               submission.status === 2 ? 'Rechazado' : 'Pendiente'}
                            </span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Connectivity status - moved to bottom left */}
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className={`
                          px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 backdrop-blur-sm
                          ${submission.screen.isConnected
                            ? 'bg-[#353FEF]/90 text-white'
                            : 'bg-[#8C52FF]/90 text-white'
                          }
                        `}>
                          {submission.screen.isConnected ? (
                            <RadioTower className="w-3 h-3" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>
                            {submission.screen.isConnected ? 'Conectada' : 'Manual'}
                          </span>
                        </span>
                        
                        {/* Content type - simplified */}
                        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs flex items-center gap-1">
                          {submission.type === 'video' ? (
                            <FileVideo className="w-3 h-3" />
                          ) : (
                            <ImageIcon className="w-3 h-3" />
                          )}
                          <span>{submission.type}</span>
                        </span>
                      </div>
                      
                      {/* Title at bottom - improved readability */}
                      <div className="absolute bottom-12 left-0 right-0 p-4">
                        <h3 className="font-bold text-lg text-white line-clamp-1">{submission.title}</h3>
                        <p className="text-sm text-white/80 line-clamp-1">{submission.screen.name}</p>
                      </div>
                    </div>

                    <Card.Body className="p-5">
                      {/* Essential information in a cleaner layout */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-neutral-400 mb-1">Fecha</p>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-[#353FEF] mr-1.5" />
                            <span className="text-neutral-700 font-medium">
                              {new Date(submission.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {new Date(submission.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400 mb-1">Referencia</p>
                          <div className="flex items-center text-sm">
                            <Tag className="w-4 h-4 text-[#353FEF] mr-1.5" />
                            <span className="text-neutral-700 font-medium">{submission.reference}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {submission.purchaseType}
                          </p>
                        </div>
                      </div>

                      {/* AI analysis badge if available - more subtle */}
                      {submission.aiAnalysis && (
                        <motion.button 
                          className={`w-full mb-4 p-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm
                            ${submission.aiAnalysis.isCompliant
                              ? 'bg-[#F1FFE2] text-[#2C652B]'
                              : 'bg-amber-50 text-amber-700'
                            }
                          `}
                          onClick={() => handleOpenAIAnalysisModal(submission)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <div className="flex-1 text-left">
                            <span className="font-medium">Análisis IA: </span>
                            <span>{submission.aiAnalysis.confidence}% Match</span>
                          </div>
                          {submission.type === 'image' && submission.aiAnalysis.textPercentage && (
                            <div className="flex items-center gap-1">
                              <span>Texto: </span>
                              <span className={submission.aiAnalysis.textPercentage > 30 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                                {submission.aiAnalysis.textPercentage}%
                              </span>
                            </div>
                          )}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                      )}

                      {/* Download status for manual screens - cleaner */}
                      {!submission.screen.isConnected && submission.status === 1 && (
                        <div className={`mb-4 p-3 rounded-xl text-xs ${submission.isDownloaded ? 'bg-[#F1FFE2] text-[#2C652B]' : 'bg-[#F5F1FF] text-[#8C52FF]'}`}>
                          <div className="flex items-center">
                            {submission.isDownloaded ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span>Contenido descargado</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span className="font-medium">Requiere descarga</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rejection reason if rejected - cleaner */}
                      {submission.status === 2 && submission.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
                          <div className="flex items-start">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium mb-0.5">Rechazo: {submission.rejectionReason.category}</p>
                              <p className="line-clamp-2">{submission.rejectionReason.description}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-neutral-100">
                        <div className="flex items-center justify-end gap-2">
                          {/* Action buttons based on status and connection - simplified */}
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Eye}
                              className="h-8 rounded-xl border-neutral-200 hover:border-[#353FEF] hover:text-[#353FEF]"
                              onClick={() => handleOpenPreviewModal(submission)}
                            >
                              Detalles
                            </Button>
                          </motion.div>
                          
                          {/* Download button for manual screens that are approved */}
                          {!submission.screen.isConnected && submission.status === 1 && !submission.isDownloaded && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Download}
                                className="h-8 rounded-xl text-[#8C52FF] border-[#8C52FF]/20 hover:bg-[#F5F1FF]"
                                onClick={() => handleOpenDownloadModal(submission)}
                              >
                                Descargar
                              </Button>
                            </motion.div>
                          )}
                          
                          {/* Quick approve/reject for pending submissions */}
                          {submission.status === 0 && (
                            <div className="flex gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#F44336] border border-neutral-200 hover:border-[#F44336] hover:bg-[#F44336]/5"
                                onClick={() => handleOpenRejectModal(submission)}
                              >
                                <XCircle className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#2C652B] border border-neutral-200 hover:border-[#ABFAA9] hover:bg-[#F1FFE2]"
                                onClick={() => handleApproveSubmission(submission)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No hay contenido para revisar</h3>
                <p className="text-neutral-500 mb-6 max-w-md text-center">No se encontraron revisiones con los filtros seleccionados. Intenta con otros criterios o limpia los filtros.</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="primary" 
                    icon={X}
                    className="bg-[#FF2B67] hover:bg-[#E0195A]"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter(0);
                      setScreenFilter(null);
                      setConnectivityFilter(null);
                      setTypeFilter(null);
                      setActiveTab('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {currentView === 'list' && (
          <div className="mb-8">
            {filteredSubmissions.length > 0 ? (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left p-4 font-medium text-neutral-600 text-xs">Contenido</th>
                        <th className="text-left p-4 font-medium text-neutral-600 text-xs">Pantalla</th>
                        <th className="text-left p-4 font-medium text-neutral-600 text-xs">Conexión</th>
                        <th className="text-left p-4 font-medium text-neutral-600 text-xs">Fecha</th>
                        <th className="text-left p-4 font-medium text-neutral-600 text-xs">Estado</th>
                        <th className="text-right p-4 font-medium text-neutral-600 text-xs">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <motion.tr 
                          key={submission.id} 
                          className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={submission.preview} alt={submission.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm line-clamp-1">{submission.title}</h4>
                                <div className="flex items-center gap-1 text-xs text-neutral-500">
                                  <span>#{submission.reference}</span>
                                  <span className="px-1">•</span>
                                  {submission.type === 'video' ? (
                                    <span className="flex items-center gap-1">
                                      <FileVideo className="w-3 h-3" /> {submission.duration}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <ImageIcon className="w-3 h-3" /> Imagen
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">{submission.screen.name}</div>
                            <div className="text-xs text-neutral-500">{submission.screen.location}</div>
                          </td>
                          <td className="p-4">
                            <span className={`
                              px-2 py-1 rounded-lg text-xs flex items-center gap-1 w-fit
                              ${submission.screen.isConnected
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                              }
                            `}>
                              {submission.screen.isConnected ? (
                                <>
                                  <RadioTower className="w-3 h-3" />
                                  <span>Conectada</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  <span>Manual</span>
                                </>
                              )}
                            </span>
                            
                            {/* Show download status for approved manual content */}
                            {!submission.screen.isConnected && submission.status === 1 && (
                              <div className="mt-1 text-xs">
                                {submission.isDownloaded ? (
                                  <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Descargado
                                  </span>
                                ) : (
                                  <span className="text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Pendiente
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {new Date(submission.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {new Date(submission.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`
                              px-2 py-1 rounded-lg text-xs flex items-center gap-1 w-fit font-medium
                              ${submission.status === 1
                                ? 'bg-green-100 text-green-700'
                                : submission.status === 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                              }
                            `}>
                              {submission.status === 1 ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : submission.status === 0 ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span className="capitalize">
                                {submission.status === 1 ? 'Aprobado' :
                                 submission.status === 0 ? 'Rechazado' : 'Pendiente'}
                              </span>
                            </span>
                            
                            {/* AI analysis indicator */}
                            {submission.aiAnalysis && (
                              <div className="mt-1 text-xs">
                                <button 
                                  className={`flex items-center gap-1 ${
                                    submission.aiAnalysis.isCompliant
                                      ? 'text-green-600'
                                      : 'text-amber-600'
                                  }`}
                                  onClick={() => handleOpenAIAnalysisModal(submission)}
                                >
                                  <Bot className="w-3 h-3" />
                                  <span>{submission.aiAnalysis.confidence}% match</span>
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg hover:bg-neutral-100"
                                onClick={() => handleOpenPreviewModal(submission)}
                              >
                                <Eye className="w-4 h-4 text-neutral-600" />
                              </motion.button>
                              
                              {/* Manual download button */}
                              {!submission.screen.isConnected && submission.status === 1 && !submission.isDownloaded && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 rounded-lg hover:bg-purple-50 text-purple-600"
                                  onClick={() => handleOpenDownloadModal(submission)}
                                >
                                  <Download className="w-4 h-4" />
                                </motion.button>
                              )}
                              
                              {/* Quick approve/reject for pending */}
                              {submission.status === 0 && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                    onClick={() => handleOpenRejectModal(submission)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                                    onClick={() => handleApproveSubmission(submission)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No hay contenido para revisar</h3>
                <p className="text-neutral-500 mb-6 max-w-md text-center">No se encontraron revisiones con los filtros seleccionados. Intenta con otros criterios o limpia los filtros.</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="primary" 
                    icon={X}
                    className="bg-[#FF2B67] hover:bg-[#E0195A]"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter(0);
                      setScreenFilter(null);
                      setConnectivityFilter(null);
                      setTypeFilter(null);
                      setActiveTab('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS for hiding scrollbar */}
      <style className="hide-scrollbar-style">
        {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        `}
      </style>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsPreviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={selectedSubmission.preview}
                  alt={selectedSubmission.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  {selectedSubmission.type === 'video' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-5 text-white shadow-lg"
                    >
                      <Play className="w-8 h-8" />
                    </motion.button>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="rounded-full h-10 w-10 flex items-center justify-center bg-black/40 border-none text-white hover:bg-black/60"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`
                    px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm
                    ${selectedSubmission.status === 1
                      ? 'bg-[#00C853]/90 text-white'
                      : selectedSubmission.status === 2
                      ? 'bg-[#F44336]/90 text-white'
                      : 'bg-[#FF9800]/90 text-white'
                    }
                  `}>
                    {selectedSubmission.status === 1 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : selectedSubmission.status === 2 ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="capitalize">
                      {selectedSubmission.status === 1 ? 'Aprobado' :
                       selectedSubmission.status === 2 ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </span>
                  
                  <span className={`
                    px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm
                    ${selectedSubmission.screen.isConnected
                      ? 'bg-blue-500/90 text-white'
                      : 'bg-purple-500/90 text-white'
                    }
                  `}>
                    {selectedSubmission.screen.isConnected ? (
                      <RadioTower className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>
                      {selectedSubmission.screen.isConnected ? 'Conectada' : 'Manual'}
                    </span>
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedSubmission.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      {selectedSubmission.type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-[#FF2B67]" />
                      ) : (
                        <FileVideo className="w-4 h-4 text-[#FF2B67]" />
                      )}
                      <span>
                        {selectedSubmission.type === 'image' ? 
                          `Imagen · ${selectedSubmission.format} · ${selectedSubmission.size}` : 
                          `Video · ${selectedSubmission.format} · ${selectedSubmission.duration} · ${selectedSubmission.size}`}
                      </span>
                      <span className="px-1.5 text-neutral-400">•</span>
                      <span>{selectedSubmission.orderId}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-neutral-700">Detalles del contenido</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#FF2B67]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Monitor className="w-5 h-5 text-[#FF2B67]" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Pantalla</p>
                          <p className="text-sm font-medium">{selectedSubmission.screen.name}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {selectedSubmission.screen.resolution} ({selectedSubmission.screen.aspectRatio})
                          </p>
                          <p className="text-xs text-neutral-500">
                            {selectedSubmission.screen.location}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#FF2B67]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-[#FF2B67]" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Fecha de publicación</p>
                          <p className="text-sm font-medium">{new Date(selectedSubmission.startDate).toLocaleDateString()}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(selectedSubmission.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(selectedSubmission.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#FF2B67]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Tag className="w-5 h-5 text-[#FF2B67]" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Referencia</p>
                          <p className="text-sm font-medium">{selectedSubmission.reference}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Comprado: {new Date(selectedSubmission.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {selectedSubmission.rejectionReason ? (
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-neutral-700">Motivo de rechazo</h3>
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                          <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium mb-1">Categoría: {selectedSubmission.rejectionReason.category}</p>
                              <p className="text-sm">{selectedSubmission.rejectionReason.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : selectedSubmission.aiAnalysis ? (
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-neutral-700 flex items-center gap-2">
                          Análisis de IA
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs flex items-center gap-1 font-medium
                            ${selectedSubmission.aiAnalysis.isCompliant 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                            }
                          `}>
                            {selectedSubmission.aiAnalysis.isCompliant ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            <span>
                              {selectedSubmission.aiAnalysis.isCompliant ? 'Compatible' : 'Revisión sugerida'}
                            </span>
                          </span>
                        </h3>
                        <div className="p-4 border border-[#FF2B67]/20 bg-[#FF2B67]/5 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Confianza del análisis</span>
                            <span className="text-sm font-semibold">
                              {selectedSubmission.aiAnalysis.confidence}%
                            </span>
                          </div>
                          
                          <div className="h-2 bg-neutral-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                selectedSubmission.aiAnalysis.confidence > 90 ? 'bg-green-500' :
                                selectedSubmission.aiAnalysis.confidence > 70 ? 'bg-[#FF2B67]' :
                                'bg-amber-500'
                              }`}
                              style={{ width: `${selectedSubmission.aiAnalysis.confidence}%` }}
                            ></div>
                          </div>

                          {selectedSubmission.aiAnalysis.issues.length > 0 ? (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-neutral-700 mb-2">Problemas detectados:</p>
                              <ul className="text-xs text-neutral-700 list-disc pl-4 space-y-1">
                                {selectedSubmission.aiAnalysis.issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="mt-4 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <p className="text-xs text-green-700 font-medium">No se detectaron problemas</p>
                            </div>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setIsPreviewModalOpen(false);
                              setIsAIAnalysisModalOpen(true);
                            }}
                            className="mt-3 text-xs text-[#FF2B67] flex items-center gap-1 hover:underline"
                          >
                            <Info className="w-3 h-3" /> 
                            Ver análisis completo
                          </motion.button>
                        </div>
                        
                        {/* Download reminder for manual screens */}
                        {!selectedSubmission.screen.isConnected && selectedSubmission.status === 1 && !selectedSubmission.isDownloaded && (
                          <div className="mt-4 p-4 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                            <div className="flex items-start">
                              <Download className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium mb-1">Contenido para implementación manual</p>
                                <p className="text-sm">Este contenido debe descargarse e implementarse manualmente en su CMS o sistema de pantallas.</p>
                                <motion.div 
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="mt-3"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={Download}
                                    className="text-purple-600 border-purple-300 hover:bg-purple-100"
                                    onClick={() => {
                                      setIsPreviewModalOpen(false);
                                      handleOpenDownloadModal(selectedSubmission);
                                    }}
                                  >
                                    Descargar ahora
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-neutral-700">Análisis de IA</h3>
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col items-center justify-center h-40">
                          <Bot className="w-10 h-10 text-neutral-300 mb-3" />
                          <p className="text-neutral-400 text-sm text-center">
                            No hay análisis de IA disponible para este contenido
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex gap-3 justify-end">
                    {selectedSubmission.status === 0 && (
                      <>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                            icon={XCircle}
                            onClick={() => {
                              setIsPreviewModalOpen(false);
                              setIsRejectModalOpen(true);
                            }}
                          >
                            Rechazar
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50 rounded-xl"
                            icon={CheckCircle}
                            onClick={() => {
                              handleApproveSubmission(selectedSubmission);
                            }}
                          >
                            Aprobar
                          </Button>
                        </motion.div>
                      </>
                    )}
                    
                    {/* Manual download button for approved content */}
                    {!selectedSubmission.screen.isConnected && selectedSubmission.status === 1 && !selectedSubmission.isDownloaded && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                          icon={Download}
                          onClick={() => {
                            setIsPreviewModalOpen(false);
                            handleOpenDownloadModal(selectedSubmission);
                          }}
                        >
                          Descargar
                        </Button>
                      </motion.div>
                    )}
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="primary"
                        className="bg-[#FF2B67] hover:bg-[#E0195A] rounded-xl"
                        onClick={() => setIsPreviewModalOpen(false)}
                      >
                        Cerrar
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsDownloadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Descargar Contenido</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDownloadModalOpen(false)}
                    className="rounded-full h-8 w-8 flex items-center justify-center bg-neutral-100 border-none text-neutral-600 hover:bg-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-[#8C52FF]/10 rounded-full flex items-center justify-center">
                      <Download className="w-8 h-8 text-[#8C52FF]" />
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Pantalla Manual Detectada</h3>
                    <p className="text-neutral-600">
                      Has aprobado contenido para una pantalla no conectada. Es necesario descargar 
                      el archivo para su implementación manual en tu sistema de pantallas.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[#F5F1FF] rounded-xl mb-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-[#8C52FF] mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#8C52FF] font-medium mb-1">Sobre pantallas manuales</p>
                        <p className="text-xs text-[#8C52FF]/80">
                          Las pantallas no conectadas requieren que descargues el contenido e 
                          implementes manualmente en tu sistema. Asegúrate de publicar el contenido 
                          en la fecha y hora programadas.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resaltar información de compra */}
                  <div className="bg-[#353FEF]/5 p-4 rounded-xl mb-4 border border-[#353FEF]/20">
                    <h4 className="text-sm font-medium mb-2 text-[#353FEF]">Información de Compra</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-neutral-500 mb-1">Tipo de compra</p>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#353FEF]/10 rounded-full">
                            <Calendar className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <p className="font-medium text-lg">
                            {selectedSubmission.purchaseType === 'hourly' ? 'Por hora' : 
                             selectedSubmission.purchaseType === 'daily' ? 'Diario' : 
                             selectedSubmission.purchaseType === 'weekly' ? 'Semanal' : 'Mensual'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-neutral-500 mb-1">Spots adquiridos</p>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#353FEF]/10 rounded-full">
                            <RadioTower className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <p className="font-medium text-lg">{selectedSubmission.spots}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        <img src={selectedSubmission.preview} alt={selectedSubmission.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{selectedSubmission.title}</h4>
                        <p className="text-xs text-neutral-500">{selectedSubmission.format} · {selectedSubmission.size}</p>
                      </div>
                    </div>

                    {/* Detalles de la orden */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <h5 className="text-sm font-medium mb-2">Detalles de la orden</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-neutral-500">Orden ID:</p>
                          <p className="font-medium">{selectedSubmission.orderId}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Referencia:</p>
                          <p className="font-medium">{selectedSubmission.reference}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Pantalla:</p>
                          <p className="font-medium">{selectedSubmission.screen.name}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Resolución:</p>
                          <p className="font-medium">{selectedSubmission.screen.resolution}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Fecha inicio:</p>
                          <p className="font-medium">{new Date(selectedSubmission.startDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Fecha fin:</p>
                          <p className="font-medium">{new Date(selectedSubmission.endDate).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl"
                      onClick={() => setIsDownloadModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      className="bg-[#8C52FF] hover:bg-[#7542E5] rounded-xl"
                      icon={Download}
                      onClick={() => handleDownloadContent(selectedSubmission)}
                    >
                      Descargar Archivo
                    </Button>
                  </motion.div>
                </div>

                {/* Botón para descargar el resumen de la orden */}
                <div className="mt-4 pt-4 border-t border-neutral-200 text-center">
                  <p className="text-sm text-neutral-600 mb-3">¿Necesitas un resumen para tu implementación?</p>
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#8C52FF]/30 text-[#8C52FF] hover:bg-[#8C52FF]/5 rounded-xl"
                      onClick={() => handleDownloadOrderSummary(selectedSubmission)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Descargar resumen de orden en PDF
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {isAIAnalysisModalOpen && selectedSubmission && selectedSubmission.aiAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsAIAnalysisModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={selectedSubmission.preview}
                  alt={selectedSubmission.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAIAnalysisModalOpen(false)}
                    className="rounded-full h-10 w-10 flex items-center justify-center bg-black/40 border-none text-white hover:bg-black/60"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {selectedSubmission.type === 'image' && selectedSubmission.aiAnalysis.textPercentage && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium">Porcentaje de texto</span>
                      <span className={`text-sm font-bold ${selectedSubmission.aiAnalysis.textPercentage <= 30 ? 'text-green-400' : 'text-amber-400'}`}>
                        {selectedSubmission.aiAnalysis.textPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${selectedSubmission.aiAnalysis.textPercentage <= 30 ? 'bg-green-400' : 'bg-amber-400'}`}
                        style={{ width: `${selectedSubmission.aiAnalysis.textPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-white/70">0%</span>
                      <span className="text-xs text-white/70">Óptimo: 30%</span>
                      <span className="text-xs text-white/70">100%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Análisis de IA</h2>
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2 py-1 rounded-lg text-xs flex items-center gap-1 font-medium
                        ${selectedSubmission.aiAnalysis.isCompliant 
                          ? 'bg-[#F1FFE2] text-[#2C652B]'
                          : 'bg-amber-100 text-amber-700'
                        }
                      `}>
                        {selectedSubmission.aiAnalysis.isCompliant ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>
                          {selectedSubmission.aiAnalysis.isCompliant ? 'Recomendado para aprobación' : 'Revisión sugerida'}
                        </span>
                      </span>
                      
                      <span className="text-xs text-neutral-500">
                        Confianza del análisis: {selectedSubmission.aiAnalysis.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {selectedSubmission.aiAnalysis.issues.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-neutral-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Problemas detectados
                      </h3>
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <ul className="space-y-2">
                          {selectedSubmission.aiAnalysis.issues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                              <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.aiAnalysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-neutral-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#353FEF]" />
                        Recomendaciones
                      </h3>
                      <div className="p-4 bg-[#353FEF]/5 rounded-xl">
                        <ul className="space-y-2">
                          {selectedSubmission.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-[#353FEF]">
                              <span className="w-5 h-5 bg-[#353FEF]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.type === 'image' && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium mb-3 text-neutral-700">Guía de buenas prácticas</h3>
                      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-neutral-700 font-medium mb-2">Recomendaciones para contenido visual</p>
                            <ul className="text-sm text-neutral-600 space-y-1 list-disc pl-4">
                              <li>El texto no debe superar el 30% del área total de la imagen</li>
                              <li>Usar tipografías claras y legibles, con tamaño adecuado</li>
                              <li>Mantener buen contraste entre texto y fondo</li>
                              <li>Priorizar imágenes de alta calidad y resolución</li>
                              <li>Comunicar un mensaje claro y conciso</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  {selectedSubmission.status === 0&& (
                    <>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="border-[#F44336] text-[#F44336] hover:bg-red-50 rounded-xl"
                          icon={XCircle}
                          onClick={() => {
                            setIsAIAnalysisModalOpen(false);
                            setIsRejectModalOpen(true);
                          }}
                        >
                          Rechazar
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="border-[#ABFAA9] text-[#2C652B] hover:bg-[#F1FFE2] rounded-xl"
                          icon={CheckCircle}
                          onClick={() => {
                            handleApproveSubmission(selectedSubmission);
                            setIsAIAnalysisModalOpen(false);
                          }}
                        >
                          Aprobar
                        </Button>
                      </motion.div>
                    </>
                  )}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      className="bg-[#353FEF] hover:bg-[#232BD4] rounded-xl"
                      onClick={() => setIsAIAnalysisModalOpen(false)}
                    >
                      Cerrar
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {isRejectModalOpen && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsRejectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Rechazar Contenido</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRejectModalOpen(false)}
                    className="rounded-full h-8 w-8 flex items-center justify-center bg-neutral-100 border-none text-neutral-600 hover:bg-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img src={selectedSubmission.preview} alt={selectedSubmission.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{selectedSubmission.title}</h4>
                      <p className="text-xs text-neutral-500">{selectedSubmission.screen.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">
                        Categoría del rechazo
                      </label>
                      <select
                        value={rejectReason.category}
                        onChange={(e) => setRejectReason(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent text-sm"
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="inappropriate">Contenido inapropiado</option>
                        <option value="legibility">Problemas de legibilidad</option>
                        <option value="quality">Baja calidad visual</option>
                        <option value="text-percentage">Exceso de texto (&gt;30%)</option>
                        <option value="other">Otro motivo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">
                        Descripción detallada
                      </label>
                      <textarea
                        value={rejectReason.description}
                        onChange={(e) => setRejectReason(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Explica por qué rechazas este contenido para que el usuario pueda corregirlo..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent text-sm resize-none h-32"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl"
                      onClick={() => setIsRejectModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      className="bg-[#F44336] hover:bg-[#D32F2F] rounded-xl"
                      icon={XCircle}
                      disabled={!rejectReason.category || !rejectReason.description}
                      onClick={handleRejectSubmission}
                    >
                      Confirmar Rechazo
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 