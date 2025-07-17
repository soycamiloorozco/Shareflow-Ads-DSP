import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Users, Star, Clock, ArrowLeft, ChevronRight,
  TrendingUp, Eye, Calendar, DollarSign, Monitor, Share2
} from 'lucide-react';
import { screens } from '../data/mockData';
import { demoScreens } from '../data/demoScreens';
import { Screen } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

type AdMode = 'momentos' | 'hourly' | 'daily' | 'weekly' | 'monthly';

interface Bundle {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  spots: number;
  reach: number;
}

const bundles: Record<AdMode, Bundle[]> = {
  momentos: [
    {
      id: 'momento-1',
      name: 'Momento Único',
      description: 'Un spot de 15 segundos en horario premium',
      duration: '15 segundos',
      price: 250000,
      spots: 1,
      reach: 5000
    }
  ],
  hourly: [
    {
      id: 'hour-1',
      name: '1 Hora Premium',
      description: '4 spots por hora en horario premium',
      duration: '1 hora',
      price: 800000,
      spots: 4,
      reach: 20000
    }
  ],
  daily: [
    {
      id: 'day-1',
      name: 'Día Completo',
      description: '24 spots distribuidos durante todo el día',
      duration: '24 horas',
      price: 1500000,
      spots: 24,
      reach: 50000
    }
  ],
  weekly: [
    {
      id: 'week-1',
      name: 'Semana Completa',
      description: '168 spots distribuidos durante 7 días',
      duration: '7 días',
      price: 8000000,
      spots: 168,
      reach: 350000
    }
  ],
  monthly: [
    {
      id: 'month-1',
      name: 'Mes Completo',
      description: '720 spots distribuidos durante 30 días',
      duration: '30 días',
      price: 30000000,
      spots: 720,
      reach: 1500000
    }
  ]
};

export function ScreenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [selectedMode, setSelectedMode] = useState<AdMode>('momentos');
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Combine both screen sources
    const allScreens = [...screens, ...demoScreens];
    const foundScreen = allScreens.find(s => s.id === id);
    if (foundScreen) {
      setScreen(foundScreen);
    }
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: screen?.location,
        text: `Mira esta pantalla digital en ${screen?.location}`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!screen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pantalla no encontrada</h2>
          <p className="text-gray-600 mb-6">La pantalla que buscas no existe o ha sido eliminada.</p>
          <Button 
            onClick={() => navigate('/marketplace')}
            variant="primary"
          >
            Volver al Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const calculateCPM = (bundle: Bundle) => {
    return ((bundle.price / bundle.reach) * 1000).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header 
        className={`
          sticky top-0 z-50 bg-white border-b border-neutral-200 
          transition-shadow duration-200
          ${isHeaderSticky ? 'shadow-md' : ''}
        `}
      >
        <div className="px-4 lg:px-8 xl:px-12 py-4 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`
                  px-3 py-1 rounded-full text-sm
                  ${screen.availability
                    ? 'bg-success-50 text-success-600'
                    : 'bg-error-50 text-error-600'
                  }
                `}>
                  {screen.availability ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <Share2 size={20} className="text-neutral-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <img
          src={screen.image}
          alt={screen.location}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <div className="px-4 lg:px-8">
            <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-4">
              {screen.location}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                <span>{screen.category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <span>{screen.rating} ({screen.reviews} reseñas)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 xl:px-12 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 max-w-[1600px] mx-auto">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Screen Metrics */}
            <Card>
              <Card.Body>
                <h2 className="text-2xl font-semibold mb-6">
                  Métricas de la Pantalla
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">
                      {(screen.views.daily / 1000).toFixed(1)}k
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Impresiones diarias
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">
                      {(screen.views.monthly / 1000000).toFixed(1)}M
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Alcance mensual
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">
                      {screen.specs.width}x{screen.specs.height}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Resolución
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">
                      {screen.specs.brightness}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Brillo
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Ad Mode Selector */}
            <Card>
              <Card.Body>
                <h2 className="text-2xl font-semibold mb-6">
                  Selecciona tu Plan
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  {(['momentos', 'hourly', 'daily', 'weekly', 'monthly'] as AdMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setSelectedMode(mode);
                        setSelectedBundle(null);
                      }}
                      className={`
                        p-4 rounded-xl border-2 transition-all text-center
                        ${selectedMode === mode
                          ? 'border-primary bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                        }
                      `}
                    >
                      <h3 className="font-medium capitalize">
                        {mode === 'momentos' ? 'Momentos' :
                         mode === 'hourly' ? 'Por Hora' :
                         mode === 'daily' ? 'Por Día' :
                         mode === 'weekly' ? 'Semanal' : 'Mensual'}
                      </h3>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {bundles[selectedMode].map((bundle) => (
                    <motion.div
                      key={bundle.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={() => setSelectedBundle(bundle)}
                        className={`
                          w-full p-6 rounded-xl border-2 transition-all text-left
                          ${selectedBundle?.id === bundle.id
                            ? 'border-primary bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {bundle.name}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              {bundle.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-neutral-600">Desde</p>
                            <p className="text-xl font-semibold">
                              ${bundle.price.toLocaleString()} COP
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                              <Clock className="w-4 h-4" />
                              <span>Duración</span>
                            </div>
                            <p className="font-medium">{bundle.duration}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                              <Monitor className="w-4 h-4" />
                              <span>Spots</span>
                            </div>
                            <p className="font-medium">{bundle.spots}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                              <Users className="w-4 h-4" />
                              <span>Alcance</span>
                            </div>
                            <p className="font-medium">
                              {(bundle.reach / 1000).toFixed(1)}k
                            </p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2 xl:sticky xl:top-24 space-y-6">
            {selectedBundle ? (
              <Card>
                <Card.Body className="space-y-6">
                  <h3 className="text-xl font-semibold">Resumen de Compra</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Plan</span>
                      <span className="font-medium">{selectedBundle.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Duración</span>
                      <span className="font-medium">{selectedBundle.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Spots</span>
                      <span className="font-medium">{selectedBundle.spots}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">CPM</span>
                      <span className="font-medium">
                        ${calculateCPM(selectedBundle)} COP
                      </span>
                    </div>
                    <div className="pt-4 border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-xl font-semibold">
                          ${selectedBundle.price.toLocaleString()} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={ChevronRight}
                    onClick={() => navigate('/create')}
                  >
                    Continuar
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Card>
                <Card.Body className="text-center p-8">
                  <Monitor className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">
                    Selecciona un plan para ver el resumen
                  </p>
                </Card.Body>
              </Card>
            )}

            <Card>
              <Card.Body className="space-y-4">
                <h3 className="text-lg font-semibold">Información Técnica</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Resolución</p>
                    <p className="font-medium">
                      {screen.specs.width}x{screen.specs.height} px
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Brillo</p>
                    <p className="font-medium">{screen.specs.brightness}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Tipo</p>
                    <p className="font-medium capitalize">{screen.category.name}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}