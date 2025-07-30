import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ChevronRight, Monitor, Settings,
  Menu, X, BarChart3, TrendingUp, Zap,
  FileText, Users, Clock, Shield, DollarSign,
  CheckCircle, XCircle, Eye, Play, Pause
} from 'lucide-react';
import { Button } from '../../components/Button';

export function AdManagerPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  const [isVisible, setIsVisible] = useState({
    features: false,
    dashboard: false,
    benefits: false,
    pricing: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = {
        features: document.getElementById('features'),
        dashboard: document.getElementById('dashboard'),
        benefits: document.getElementById('benefits'),
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
              <Settings className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Shareflow Ad Manager</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-neutral-600 hover:text-primary transition-colors">
                Características
              </a>
              <a href="#dashboard" className="text-neutral-600 hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="#benefits" className="text-neutral-600 hover:text-primary transition-colors">
                Beneficios
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
                  href="#features"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Características
                </a>
                <a
                  href="#dashboard"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </a>
                <a
                  href="#benefits"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Beneficios
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
        <div className="absolute inset-0 z-0 bg-neutral-900">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
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
                Ad Manager
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Gestiona y optimiza tu <span className="text-primary">inventario publicitario</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl">
                Una plataforma completa para administrar, monitorear y optimizar tu inventario de pantallas digitales.
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
                Comenzar ahora
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base !text-white !border-white/20 hover:!bg-white/10"
              >
                Solicitar demo
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute top-1/2 right-8 transform -translate-y-1/2 hidden lg:block"
          >
            <div className="w-[450px] h-[300px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 overflow-hidden">
              <div className="relative h-full">
                <div className="absolute inset-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <span className="text-white font-medium">Dashboard</span>
                    </div>
                    <div className="px-2 py-1 bg-success-500/20 text-success-500 rounded-full text-xs">
                      Live
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-primary" />
                        <span className="text-white text-sm">Pantallas Activas</span>
                      </div>
                      <p className="text-2xl font-bold text-white">145</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-white text-sm">Impresiones</span>
                      </div>
                      <p className="text-2xl font-bold text-white">2.5M</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">Ocupación</span>
                        <span className="text-white font-medium">85%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%]" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">Ingresos</span>
                        <span className="text-white font-medium">$12.5M</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-success-500 w-[75%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Características Principales
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Todo lo que necesitas para gestionar tu inventario publicitario
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Monitor,
                title: 'Gestión de Pantallas',
                description: 'Administra todas tus pantallas desde un solo lugar. Configura precios, disponibilidad y especificaciones técnicas.',
                color: 'bg-primary-50',
                iconColor: 'text-primary'
              },
              {
                icon: FileText,
                title: 'Revisión de Contenido',
                description: 'Aprueba o rechaza creativos publicitarios con un sistema de moderación eficiente y herramientas de colaboración.',
                color: 'bg-success-50',
                iconColor: 'text-success-500'
              },
              {
                icon: BarChart3,
                title: 'Análisis Avanzado',
                description: 'Dashboards interactivos con métricas detalladas para monitorear el rendimiento de tu inventario.',
                color: 'bg-warning-50',
                iconColor: 'text-warning-500'
              },
              {
                icon: DollarSign,
                title: 'Gestión de Ingresos',
                description: 'Controla tus ingresos, facturación y pagos con herramientas financieras integradas.',
                color: 'bg-primary-50',
                iconColor: 'text-primary'
              },
              {
                icon: Users,
                title: 'Gestión de Usuarios',
                description: 'Administra permisos y roles para tu equipo con un sistema de control de acceso granular.',
                color: 'bg-success-50',
                iconColor: 'text-success-500'
              },
              {
                icon: Settings,
                title: 'Configuración Avanzada',
                description: 'Personaliza cada aspecto de tu plataforma según tus necesidades específicas.',
                color: 'bg-warning-50',
                iconColor: 'text-warning-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
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

      {/* Dashboard Section */}
      <section id="dashboard" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.dashboard ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Dashboard Intuitivo
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Toda la información que necesitas en un solo lugar
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.dashboard ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dashboard</h3>
                      <p className="text-sm text-neutral-600">Resumen de rendimiento</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600">Última actualización: hace 5 minutos</span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={TrendingUp}
                    >
                      Exportar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { icon: Monitor, label: 'Pantallas Activas', value: '145', change: '+12%', positive: true },
                    { icon: Eye, label: 'Impresiones', value: '2.5M', change: '+8%', positive: true },
                    { icon: DollarSign, label: 'Ingresos', value: '$12.5M', change: '+15%', positive: true },
                    { icon: TrendingUp, label: 'Ocupación', value: '85%', change: '+5%', positive: true }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-neutral-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">{stat.label}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-semibold">{stat.value}</p>
                            <span className={`text-xs ${stat.positive ? 'text-success-500' : 'text-error-500'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2 bg-white p-6 rounded-xl border border-neutral-200">
                    <h4 className="font-semibold mb-4">Ingresos por Pantalla</h4>
                    <div className="h-64 bg-neutral-50 rounded-lg"></div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <h4 className="font-semibold mb-4">Distribución de Ingresos</h4>
                    <div className="h-64 bg-neutral-50 rounded-lg"></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                  <h4 className="font-semibold mb-4">Campañas Activas</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left p-3 font-medium text-neutral-600">Campaña</th>
                          <th className="text-left p-3 font-medium text-neutral-600">Estado</th>
                          <th className="text-left p-3 font-medium text-neutral-600">Pantallas</th>
                          <th className="text-left p-3 font-medium text-neutral-600">Impresiones</th>
                          <th className="text-left p-3 font-medium text-neutral-600">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Summer Campaign 2024', status: 'active', screens: 5, impressions: '125K', revenue: '$2.5M' },
                          { name: 'Product Launch', status: 'scheduled', screens: 3, impressions: '0', revenue: '$1.8M' },
                          { name: 'Brand Awareness', status: 'active', screens: 8, impressions: '98K', revenue: '$3.2M' }
                        ].map((campaign, index) => (
                          <tr key={index} className="border-b border-neutral-200">
                            <td className="p-3">
                              <div className="font-medium">{campaign.name}</div>
                            </td>
                            <td className="p-3">
                              <span className={`
                                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                                ${campaign.status === 'active'
                                  ? 'bg-success-50 text-success-600'
                                  : campaign.status === 'scheduled'
                                  ? 'bg-primary-50 text-primary'
                                  : 'bg-neutral-100 text-neutral-600'
                                }
                              `}>
                                {campaign.status === 'active' ? (
                                  <Play className="w-3 h-3" />
                                ) : campaign.status === 'scheduled' ? (
                                  <Clock className="w-3 h-3" />
                                ) : (
                                  <Pause className="w-3 h-3" />
                                )}
                                <span className="capitalize">{campaign.status}</span>
                              </span>
                            </td>
                            <td className="p-3">{campaign.screens}</td>
                            <td className="p-3">{campaign.impressions}</td>
                            <td className="p-3">{campaign.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.benefits ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Beneficios del Ad Manager
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Optimiza la gestión de tu inventario publicitario
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isVisible.benefits ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-8">
                {[
                  {
                    title: 'Control Total',
                    description: 'Gestiona todas tus pantallas, campañas y creativos desde una única plataforma centralizada.',
                    icon: Settings
                  },
                  {
                    title: 'Optimización de Ingresos',
                    description: 'Maximiza tus ingresos con herramientas de optimización de precios y ocupación.',
                    icon: DollarSign
                  },
                  {
                    title: 'Análisis en Tiempo Real',
                    description: 'Accede a métricas detalladas y análisis en tiempo real para tomar decisiones informadas.',
                    icon: BarChart3
                  },
                  {
                    title: 'Automatización Inteligente',
                    description: 'Automatiza tareas repetitivas y procesos para aumentar la eficiencia operativa.',
                    icon: Zap
                  }
                ].map((benefit, index) => (
                  <div key={benefit.title} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-neutral-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible.benefits ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <span className="text-white font-medium">Revenue Optimization</span>
                        </div>
                        <div className="px-2 py-1 bg-success-500/20 text-success-500 rounded-full text-xs">
                          Active
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[85%]" />
                        </div>
                        <div className="flex items-center justify-between text-white/80 text-sm">
                          <span>Efficiency</span>
                          <span>85%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-success-500" />
                          <span className="text-white text-sm">Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-white">+35%</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-success-500" />
                          <span className="text-white text-sm">Time Saved</span>
                        </div>
                        <p className="text-2xl font-bold text-white">+65%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-50 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-success-500" />
                  </div>
                  <div>
                    <p className="font-bold">Eficiencia</p>
                    <p className="text-sm text-neutral-600">Automatizada</p>
                  </div>
                </div>
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
                Planes Ad Manager
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Soluciones escalables para operadores de pantallas de todos los tamaños
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Básico',
                description: 'Para operadores con hasta 10 pantallas',
                price: '500,000',
                features: [
                  'Hasta 10 pantallas',
                  'Dashboard básico',
                  'Gestión de contenido',
                  'Revisión de creativos',
                  'Soporte por email'
                ],
                cta: 'Comenzar',
                popular: false
              },
              {
                name: 'Profesional',
                description: 'Para operadores en crecimiento',
                price: '1,500,000',
                features: [
                  'Hasta 50 pantallas',
                  'Dashboard avanzado',
                  'Gestión de contenido',
                  'Revisión de creativos',
                  'Análisis avanzado',
                  'Optimización de ingresos',
                  'Soporte prioritario',
                  'API básica'
                ],
                cta: 'Seleccionar plan',
                popular: true
              },
              {
                name: 'Enterprise',
                description: 'Para grandes redes de pantallas',
                price: 'Personalizado',
                features: [
                  'Pantallas ilimitadas',
                  'Dashboard personalizado',
                  'Gestión de contenido avanzada',
                  'Revisión de creativos con IA',
                  'Análisis en tiempo real',
                  'Optimización avanzada de ingresos',
                  'Gestor de cuenta dedicado',
                  'API completa',
                  'Integraciones personalizadas',
                  'SLA garantizado'
                ],
                cta: 'Contactar ventas',
                popular: false
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
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-neutral-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-neutral-600"> COP/mes</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                    fullWidth
                  >
                    {plan.cta}
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
              Lleva la gestión de tu inventario al siguiente nivel
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Únete a los operadores de pantallas que ya están optimizando su inventario con Shareflow Ad Manager
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
                <Settings className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">Shareflow Ad Manager</span>
              </div>
              <p className="text-neutral-400 mb-6">
                La plataforma completa para gestionar tu inventario publicitario digital.
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