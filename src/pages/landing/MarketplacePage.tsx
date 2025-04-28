import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ChevronRight, Monitor, MapPin,
  Users, Star, Eye, Menu, X, Search,
  Filter, Target, TrendingUp, Clock, DollarSign
} from 'lucide-react';
import { Button } from '../../components/Button';

export function MarketplacePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  const [isVisible, setIsVisible] = useState({
    screens: false,
    features: false,
    locations: false,
    pricing: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = {
        screens: document.getElementById('screens'),
        features: document.getElementById('features'),
        locations: document.getElementById('locations'),
        pricing: document.getElementById('pricing')
      };

      Object.entries(sections).forEach(([key, section]) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight * 0.75;
          setIsVisible(prev => ({ ...prev, [key]: isVisible }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Monitor className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Shareflow Marketplace</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#screens" className="text-neutral-600 hover:text-primary transition-colors">
                Pantallas
              </a>
              <a href="#features" className="text-neutral-600 hover:text-primary transition-colors">
                Características
              </a>
              <a href="#locations" className="text-neutral-600 hover:text-primary transition-colors">
                Ubicaciones
              </a>
              <a href="#pricing" className="text-neutral-600 hover:text-primary transition-colors">
                Precios
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Registrarse
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-neutral-200"
            >
              <div className="px-4 py-6 space-y-4">
                <a
                  href="#screens"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pantallas
                </a>
                <a
                  href="#features"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Características
                </a>
                <a
                  href="#locations"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ubicaciones
                </a>
                <a
                  href="#pricing"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Precios
                </a>
                <div className="pt-4 border-t border-neutral-200">
                  <Link to="/login">
                    <Button variant="outline" size="lg" fullWidth className="mb-3">
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="lg" fullWidth>
                      Registrarse
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=2000"
            alt="Digital billboard in city"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50" />
        </div>

        <motion.div
          style={{ opacity, y }}
          className="relative z-10 max-w-7xl mx-auto px-4 w-full"
        >
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-4 py-2 bg-primary/10 backdrop-blur-sm text-primary rounded-full text-sm font-medium mb-6">
                Marketplace de Pantallas
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Las <span className="text-primary">mejores ubicaciones</span> para tu marca
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl">
                Accede a nuestra red de pantallas digitales premium en ubicaciones estratégicas. Selecciona la pantalla perfecta para tu marca.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                className="text-base"
              >
                Explorar pantallas
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={Search}
                className="text-base !text-white !border-white/20 hover:!bg-white/10"
              >
                Buscar por ubicación
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <ChevronRight className="w-10 h-10 text-white transform rotate-90" />
          </motion.div>
        </div>
      </section>

      {/* Screens Section */}
      <section id="screens" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.screens ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pantallas Premium en Ubicaciones Estratégicas
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Encuentra la pantalla perfecta para tu marca entre nuestra amplia red
              </p>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por ubicación o tipo de pantalla"
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-[100px] border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
                <button
                  className="flex items-center justify-center w-12 h-12 rounded-[100px] border border-neutral-200 bg-white shadow-sm hover:border-primary hover:text-primary transition-colors duration-200"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Screen Categories */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { id: 'fpc', name: 'FPC', emoji: '⚽️', description: 'Pantallas LED en estadios de fútbol profesional', count: 12 },
              { id: 'digital-billboards', name: 'Vallas Digitales', emoji: '🖥️', description: 'Pantallas LED de gran formato en ubicaciones premium', count: 45 },
              { id: 'malls', name: 'Centro Comercial', emoji: '🏢', description: 'Pantallas digitales en los principales centros comerciales', count: 78 },
              { id: 'info-points', name: 'Puntos de Información', emoji: '📣', description: 'Kioscos digitales interactivos', count: 34 }
            ].map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.screens ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                    {category.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold">{category.name}</h3>
                    <p className="text-sm text-neutral-600">{category.count} pantallas</p>
                  </div>
                </div>
                <p className="text-neutral-600 text-sm">{category.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Featured Screens */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 'screen-1',
                name: 'El Poblado Plaza',
                location: 'Calle 10 #43D-12, Medellín',
                price: 250000,
                availability: true,
                image: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200',
                category: 'Centro Comercial',
                views: 50000,
                rating: 4.8,
                reviews: 124
              },
              {
                id: 'screen-2',
                name: 'Santafé Mall Circuit',
                location: 'Cra. 43A #7 Sur-170, Medellín',
                price: 450000,
                availability: true,
                image: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200',
                category: 'Centro Comercial',
                views: 75000,
                rating: 4.9,
                reviews: 156
              },
              {
                id: 'screen-3',
                name: 'Laureles Premium',
                location: 'Cra. 76 #73-24, Medellín',
                price: 350000,
                availability: true,
                image: 'https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?auto=format&fit=crop&q=80&w=1200',
                category: 'Vallas Digitales',
                views: 35000,
                rating: 4.7,
                reviews: 89
              }
            ].map((screen, index) => (
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.screens ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="relative aspect-video">
                  <img
                    src={screen.image}
                    alt={screen.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 right-4">
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
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {screen.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{screen.category}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium">{screen.rating}</span>
                      <span className="text-neutral-600">
                        ({screen.reviews} reseñas)
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600">
                      {(screen.views / 1000).toFixed(1)}k vistas/día
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Desde</p>
                      <p className="text-lg font-semibold">
                        ${screen.price.toLocaleString()} COP
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/marketplace">
              <Button
                variant="outline"
                size="lg"
                icon={ChevronRight}
              >
                Ver todas las pantallas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Características del Marketplace
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Todo lo que necesitas para encontrar y reservar las mejores pantallas
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Búsqueda Avanzada',
                description: 'Filtra por ubicación, tipo de pantalla, presupuesto y más para encontrar la pantalla perfecta.',
                color: 'bg-primary-50',
                iconColor: 'text-primary'
              },
              {
                icon: Clock,
                title: 'Reserva Flexible',
                description: 'Reserva por hora, día, semana o mes según tus necesidades y presupuesto.',
                color: 'bg-success-50',
                iconColor: 'text-success-500'
              },
              {
                icon: Target,
                title: 'Segmentación Precisa',
                description: 'Selecciona pantallas según datos demográficos y patrones de tráfico.',
                color: 'bg-warning-50',
                iconColor: 'text-warning-500'
              },
              {
                icon: Eye,
                title: 'Métricas en Tiempo Real',
                description: 'Accede a datos de impresiones y engagement para optimizar tus campañas.',
                color: 'bg-primary-50',
                iconColor: 'text-primary'
              },
              {
                icon: DollarSign,
                title: 'Precios Transparentes',
                description: 'Sin sorpresas ni costos ocultos. Paga solo por lo que necesitas.',
                color: 'bg-success-50',
                iconColor: 'text-success-500'
              },
              {
                icon: TrendingUp,
                title: 'Análisis de Rendimiento',
                description: 'Informes detallados para medir el impacto de tus campañas.',
                color: 'bg-warning-50',
                iconColor: 'text-warning-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Map Section */}
      <section id="locations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.locations ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cobertura Nacional
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Pantallas digitales en las principales ciudades de Colombia
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isVisible.locations ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="relative aspect-square md:aspect-auto"
            >
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&q=80&w=1200"
                alt="Colombia map"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl" />
              
              {/* City Markers */}
              <div className="absolute top-[30%] left-[45%] w-6 h-6 bg-primary rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                  <span className="px-2 py-1 bg-white rounded-full text-xs font-medium shadow-md">
                    Bogotá (45)
                  </span>
                </div>
              </div>
              
              <div className="absolute top-[40%] left-[35%] w-5 h-5 bg-primary rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-3 h-3 text-white" />
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                  <span className="px-2 py-1 bg-white rounded-full text-xs font-medium shadow-md">
                    Medellín (38)
                  </span>
                </div>
              </div>
              
              <div className="absolute top-[60%] left-[40%] w-5 h-5 bg-primary rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-3 h-3 text-white" />
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                  <span className="px-2 py-1 bg-white rounded-full text-xs font-medium shadow-md">
                    Cali (25)
                  </span>
                </div>
              </div>
              
              <div className="absolute top-[20%] left-[30%] w-5 h-5 bg-primary rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-3 h-3 text-white" />
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                  <span className="px-2 py-1 bg-white rounded-full text-xs font-medium shadow-md">
                    Barranquilla (18)
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible.locations ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold mb-6">Presencia en todo el país</h3>
              <p className="text-lg text-neutral-600 mb-8">
                Nuestra red de pantallas digitales cubre las principales ciudades de Colombia, permitiéndote llegar a tu audiencia ideal sin importar dónde se encuentre.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">12 Ciudades</h4>
                    <p className="text-neutral-600">Cobertura en las principales ciudades del país</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">150+ Pantallas</h4>
                    <p className="text-neutral-600">Red en constante crecimiento</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">2.5M+ Alcance Diario</h4>
                    <p className="text-neutral-600">Impacta a millones de personas cada día</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                >
                  Explorar por ubicación
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.pricing ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Opciones de Reserva Flexibles
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Elige el plan que mejor se adapte a tus necesidades y presupuesto
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                name: 'Por Hora',
                icon: Clock,
                description: 'Ideal para eventos o promociones puntuales',
                priceFrom: '150,000',
                features: [
                  '4 spots por hora',
                  'Elección de horario específico',
                  'Ideal para eventos puntuales',
                  'Disponibilidad inmediata'
                ]
              },
              {
                name: 'Por Día',
                icon: Calendar,
                description: 'Perfecto para campañas de un día',
                priceFrom: '500,000',
                features: [
                  '24 spots distribuidos en el día',
                  'Mayor visibilidad',
                  'Informe de rendimiento',
                  'Soporte prioritario'
                ],
                popular: true
              },
              {
                name: 'Semanal',
                icon: Calendar,
                description: 'Maximiza el impacto con presencia continua',
                priceFrom: '2,500,000',
                features: [
                  '168 spots durante 7 días',
                  'Distribución optimizada',
                  'Informe detallado de rendimiento',
                  'Soporte dedicado'
                ]
              },
              {
                name: 'Mensual',
                icon: Calendar,
                description: 'La mejor opción para campañas sostenidas',
                priceFrom: '8,000,000',
                features: [
                  '720 spots durante 30 días',
                  'Máxima exposición',
                  'Análisis de rendimiento avanzado',
                  'Gestor de cuenta personal',
                  'Descuentos en renovaciones'
                ]
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.pricing ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`
                  bg-white rounded-2xl shadow-sm overflow-hidden border-2
                  ${plan.popular ? 'border-primary' : 'border-neutral-200'}
                  ${plan.popular ? 'scale-105' : 'scale-100'}
                  hover:shadow-md transition-all
                `}
              >
                {plan.popular && (
                  <div className="bg-primary text-white py-2 text-center text-sm font-medium">
                    Más popular
                  </div>
                )}
                <div className="p-6">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-neutral-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <p className="text-sm text-neutral-600">Desde</p>
                    <p className="text-2xl font-bold">${plan.priceFrom} <span className="text-sm font-normal text-neutral-600">COP</span></p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                    fullWidth
                  >
                    Seleccionar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para destacar en las mejores ubicaciones?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Únete a las marcas que ya están impactando a millones de personas con Shareflow Marketplace
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                className="!bg-white !text-primary hover:!bg-white/90"
              >
                Comenzar ahora
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="!text-white !border-white/20 hover:!bg-white/10"
              >
                Solicitar demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Monitor className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">Shareflow Marketplace</span>
              </div>
              <p className="text-neutral-400 mb-6">
                La red de pantallas digitales premium más grande de Colombia.
              </p>
              <div className="flex gap-4">
                {/* Social Media Icons */}
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Productos</h3>
              <ul className="space-y-3">
                <li><Link to="/moments" className="text-neutral-400 hover:text-white transition-colors">Momentos Deportivos</Link></li>
                <li><Link to="/marketplace" className="text-neutral-400 hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/programmatic" className="text-neutral-400 hover:text-white transition-colors">Programmatic</Link></li>
                <li><Link to="/ad-manager" className="text-neutral-400 hover:text-white transition-colors">Ad Manager</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Guía de especificaciones</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Casos de éxito</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Soporte</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Ventas</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Prensa</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Trabaja con nosotros</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-400">
            <p>© {new Date().getFullYear()} Shareflow. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper components
const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const Check = ({ className }: { className: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
};