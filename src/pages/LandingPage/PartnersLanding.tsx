import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor, Wifi, BarChart3, Settings, Globe, Zap, Shield,
  Users, Calendar, DollarSign, TrendingUp, Package2, Eye,
  Building, MapPin, Clock, Signal, Cpu, HardDrive, Camera,
  ArrowRight, CheckCircle, Star, Play, ChevronRight,
  Smartphone, Tablet, Tv, Radio, FileText, Target,
  Brain, Rocket, Award, Crown, Gem, Sparkles, ExternalLink,
  Menu, X, ChevronDown
} from 'lucide-react';
import { Button } from '../../components/Button';

export function PartnersLanding() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const features = [
    {
      id: 'cms',
      title: 'Gestión Total de tus Pantallas',
      subtitle: 'CMS Integrado',
      description: 'Administra tu red de pantallas desde un solo lugar con control total en tiempo real',
      icon: Monitor,
      details: [
        'Visualiza y edita cada pantalla: nombre, ubicación, resolución, y estado',
        'Control en tiempo real: encendido, apagado, sincronización de contenido',
        'Compatible con Shareflow Screen o importación desde CMS externos como LatinAd o Broadsign',
        'Visualiza el estatus de conectividad y rendimiento'
      ]
    },
    {
      id: 'inventory',
      title: 'Gestión de Inventario Inteligente',
      subtitle: 'Sin Confusión',
      description: 'Control completo sobre disponibilidad y ocupación de tus pantallas',
      icon: Package2,
      details: [
        'Consulta la ocupación diaria y por franja horaria',
        'Carga paquetes predefinidos con precios por frecuencia o tiempo',
        'Configura disponibilidad para campañas programáticas o momentos individuales',
        'Gestión inteligente de disponibilidad en tiempo real'
      ]
    },
    {
      id: 'content',
      title: 'Gestión de Contenidos',
      subtitle: 'Tu Espacio, Tus Reglas',
      description: 'Control total sobre qué contenido se reproduce en tus pantallas',
      icon: FileText,
      details: [
        'Sube tus propios anuncios o campañas internas',
        'Visualiza el historial de reproducciones por pantalla',
        'Organiza contenidos por campañas, formatos o clientes',
        'Gestión centralizada de todos tus contenidos'
      ]
    },
    {
      id: 'approval',
      title: 'Revisión de Contenidos',
      subtitle: 'Aprobar es Fácil',
      description: 'Mantén control sobre lo que se publica sin perder velocidad',
      icon: CheckCircle,
      details: [
        'Recibe notificaciones cuando un cliente compre espacio en tu pantalla',
        'Revisa y aprueba creatividades antes de que salgan al aire',
        'Sistema de aprobación rápida y eficiente',
        'Control de calidad automatizado'
      ]
    },
    {
      id: 'programmatic',
      title: 'Sincronización Programática',
      subtitle: 'Ad-Requests + Confirmación',
      description: 'Compatible con players que usan lógica programática avanzada',
      icon: Cpu,
      details: [
        'Recibimos solicitudes de tus pantallas (ad-requests) y respondemos solo si hay contenido válido',
        'Confirmamos exhibiciones automáticamente para trazabilidad y pagos',
        'Compatible con LatinAd, Broadsign, y otros CMS con APIs',
        'Sincronización en tiempo real con sistemas externos'
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard de Desempeño',
      subtitle: 'Datos en Tiempo Real',
      description: 'Métricas importantes cuando las necesitas, donde las necesitas',
      icon: BarChart3,
      details: [
        'Visualiza ingresos por pantalla, por campaña o por cliente',
        'Seguimiento de reproducciones, tasa de ocupación y margen',
        'Compara desempeño entre pantallas o ciudades',
        'Análisis avanzado con insights accionables'
      ]
    },
    {
      id: 'billing',
      title: 'Facturación y Pagos',
      subtitle: 'Todo Claro, Todo a Tiempo',
      description: 'Gestión financiera transparente y automatizada',
      icon: DollarSign,
      details: [
        'Consulta cuánto has ganado y cuánto está por pagarse',
        'Descarga reportes por campaña, por cliente o por pantalla',
        'Integra tu cuenta para pagos automáticos o manuales',
        'Transparencia total en todos los procesos de pago'
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace Abierto',
      subtitle: 'Vitrina Digital de Latinoamérica',
      description: 'Tus pantallas en el marketplace más accesible de la región',
      icon: Globe,
      details: [
        'Se listan automáticamente en el Marketplace de Shareflow',
        'Alcance inmediato con miles de marcas, emprendedores y creadores',
        'Tú decides qué pantallas mostrar y bajo qué condiciones',
        'Exposición máxima para maximizar ingresos'
      ]
    },
    {
      id: 'compatibility',
      title: 'Compatibilidad Extrema',
      subtitle: 'Tú Eliges Cómo',
      description: 'Múltiples opciones de integración para adaptarse a tu infraestructura',
      icon: Settings,
      details: [
        'Player nativo (Shareflow Screen) para control total',
        'Integración vía API con CMS externos (LatinAd, Broadsign, etc.)',
        'Importación de pantallas por archivo si no tienes player digital',
        'Flexibilidad total de integración'
      ]
    },
    {
      id: 'security',
      title: 'Seguridad y Transparencia',
      subtitle: 'Control 24/7',
      description: 'Máxima seguridad con monitoreo continuo y transparencia total',
      icon: Shield,
      details: [
        'Control de contenido y monitoreo 24/7',
        'Webhooks para eventos en tiempo real (en CMS compatibles)',
        'Arquitectura escalable, segura y preparada para programmatic real',
        'Transparencia total en todos los procesos'
      ]
    }
  ];

  const solutions = [
    {
      name: 'CMS Empresarial',
      description: 'Gestión avanzada de contenido con optimización potenciada por IA',
      icon: Monitor,
      features: [
        'Administración multi-inquilino de pantallas',
        'Programación inteligente de contenido',
        'Dashboards de rendimiento en tiempo real',
        'Integración DSP multiplataforma'
      ],
      badge: 'Núcleo',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Marketplace Global',
      description: 'Red publicitaria premium con alcance mundial',
      icon: Building,
      features: [
        'Exposición automatizada de inventario',
        'Configuración dinámica de paquetes',
        'Optimización de precios impulsada por IA',
        'Gestión de reservas en tiempo real'
      ],
      badge: 'Ingresos',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Análisis Avanzado',
      description: 'Insights integrales e inteligencia de rendimiento',
      icon: BarChart3,
      features: [
        'Monitoreo de rendimiento en tiempo real',
        'Análisis de comportamiento de audiencia',
        'Algoritmos de optimización de ingresos',
        'Reportes personalizados y exportaciones'
      ],
      badge: 'Inteligencia',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Prueba de Reproducción',
      description: 'Verificación automatizada y monitoreo de cumplimiento',
      icon: Shield,
      features: [
        'Certificación automatizada de reproducción',
        'Monitoreo continuo de salud de dispositivos',
        'Gestión proactiva de alertas',
        'Registros de auditoría integrales'
      ],
      badge: 'Confianza',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Suite de Ingresos',
      description: 'Gestión financiera inteligente y optimización',
      icon: DollarSign,
      features: [
        'Facturación automatizada',
        'Procesamiento de pagos multi-moneda',
        'Reportes financieros y análisis',
        'Integración con sistemas contables'
      ],
      badge: 'Finanzas',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Hub de Socios',
      description: 'Plataforma integral de gestión de socios',
      icon: Users,
      features: [
        'Dashboards personalizados para socios',
        'Herramientas de colaboración en equipo',
        'Gestión granular de permisos',
        'Soporte técnico dedicado'
      ],
      badge: 'Acceso',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const metrics = [
    { value: '180+', label: 'DSPs Conectados', icon: Signal, description: 'Socios de demanda globales' },
    { value: '99.97%', label: 'Uptime de Plataforma', icon: Shield, description: 'Confiabilidad empresarial' },
    { value: '24/7', label: 'Soporte Global', icon: Clock, description: 'Monitoreo continuo' },
    { value: '<200ms', label: 'Respuesta API', icon: Zap, description: 'Sincronización ultrarrápida' }
  ];

  const integrations = [
    { name: 'Broadsign', logo: '/integrations/broadsign.svg', type: 'CMS Empresarial', tier: 'Premium' },
    { name: 'LatinAd', logo: '/integrations/latinad.svg', type: 'Plataforma Regional', tier: 'Núcleo' }
  ];

  // Memoized navigation items with dropdowns
  const navItems = useMemo(() => [
    {
      name: 'Solutions',
      hasDropdown: true,
      items: [
        {
          title: 'For Brands & Media Agencies',
          subtitle: 'Shareflow Ads+',
          description: 'Campañas premium para marcas y agencias de medios',
          icon: '🎯'
        },
        {
          title: 'For Media Owners',
          subtitle: 'CMS, Player & Monetización',
          description: 'Gestiona tu red de pantallas y aumenta ingresos',
          icon: '🖥️'
        },
        {
          title: 'For AdTech Partners',
          subtitle: 'SSP & DSP Integration',
          description: 'Conecta con nuestros socios tecnológicos',
          icon: '🔗'
        },
        {
          title: 'For Creators',
          subtitle: 'Momentos & Time-based',
          description: 'Formato especial para creadores de contenido',
          icon: '✨'
        }
      ]
    },
    {
      name: 'Products',
      hasDropdown: true,
      items: [
        {
          title: 'Ads',
          subtitle: 'Marketplace & Campañas',
          description: 'Marketplace, eventos deportivos y Smart Campaigns',
          icon: '📱'
        },
        {
          title: 'Pixel',
          subtitle: 'Próximamente',
          description: 'Más información disponible pronto',
          icon: '🔍'
        },
        {
          title: 'Platform',
          subtitle: 'For Partners',
          description: 'Plataforma completa para socios de medios',
          icon: '⚡'
        }
      ]
    },
    { name: 'Precios', hasDropdown: false },
    { name: 'Recursos', hasDropdown: false }
  ], []);

  // Memoized event handlers
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  
  // Handle dropdown item clicks
  const handleDropdownItemClick = useCallback((itemTitle: string) => {
    setOpenDropdown(null); // Close dropdown
    
    switch (itemTitle) {
      case 'For Media Owners':
        navigate('/partners-landing');
        break;
      case 'For Brands & Media Agencies':
        navigate('/marketplace');
        break;
      case 'For Creators':
        navigate('/marketplace');
        break;
      case 'For AdTech Partners':
        navigate('/contact');
        break;
      case 'Ads':
        navigate('/marketplace');
        break;
      case 'Platform':
        navigate('/partners-landing');
        break;
      default:
        break;
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation - Rappi Style */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
        style={{ 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="Shareflow" 
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.hasDropdown ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1 text-gray-300 hover:text-cyan-400 font-medium transition-colors relative group"
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                      <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </motion.button>
                  ) : (
                    <motion.a 
                      href={`#${item.name.toLowerCase()}`}
                      whileHover={{ scale: 1.05 }}
                      className="text-gray-300 hover:text-cyan-400 font-medium transition-colors relative group"
                    >
                      {item.name}
                      <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </motion.a>
                  )}
                  
                  {/* Dropdown Menu */}
                  {item.hasDropdown && openDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50"
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="space-y-3">
                        {item.items?.map((subItem, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleDropdownItemClick(subItem.title)}
                          >
                            <div className="text-2xl">{subItem.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{subItem.title}</div>
                              <div className="text-sm font-medium text-blue-600 mb-1">{subItem.subtitle}</div>
                              <div className="text-xs text-gray-500">{subItem.description}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
            
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="md">Iniciar sesión</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="md" icon={ArrowRight}>Empezar Gratis</Button>
              </Link>
            </div>
            
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
                {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </motion.header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-16 md:hidden"
          >
            <div className="px-4 py-6 space-y-6">
              {navItems.map((item, index) => (
                <div key={item.name}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="block text-xl font-semibold text-white hover:text-orange-400 mb-2"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </motion.div>
                  {item.hasDropdown && item.items && (
                    <div className="ml-4 space-y-2">
                      {item.items.map((subItem, subIndex) => (
                        <motion.div
                          key={subIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1) + (subIndex * 0.05) }}
                          className="block text-sm text-gray-300 hover:text-white py-1 cursor-pointer"
                          onClick={() => {
                            handleDropdownItemClick(subItem.title);
                            toggleMenu();
                          }}
                        >
                          {subItem.icon} {subItem.title}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-6 space-y-4">
                  <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" size="lg" fullWidth>Iniciar sesión</Button>
                  </Link>
                  <Link to="/register" onClick={toggleMenu}>
                  <Button variant="primary" size="lg" fullWidth icon={ArrowRight}>Empezar Gratis</Button>
                  </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Compact 2 Column */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Sophisticated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <motion.div 
            style={{ y, opacity }}
            className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-900/10 to-purple-900/20"
          />
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M0%200h80v80H0z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        </div>

        {/* Elegant Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
          <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
              className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                <Sparkles className="w-4 h-4" />
                   Plataforma DOOH Empresarial
              </span>
            </motion.div>
            
                             <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-[0.95] tracking-tight">
                 <span className="block font-extralight text-slate-200">Orquesta</span>
                 <span className="block font-medium">Tu Digital</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent font-semibold">
                Out-of-Home
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
                 className="text-lg md:text-xl mb-8 text-slate-300 leading-relaxed font-light"
            >
                 Suite tecnológica avanzada para publicidad digital out-of-home. 
                 Conecta, gestiona y monetiza tu red de pantallas con automatización de nivel empresarial.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/partner/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                    className="group bg-white text-slate-900 px-6 py-3 rounded-xl font-medium text-base shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 border border-white/20"
                >
                  <Crown className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                     Acceder al Hub de Socios
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                  className="group border border-white/30 text-white px-6 py-3 rounded-xl font-medium text-base backdrop-blur-sm hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5 group-hover:text-cyan-300 transition-colors" />
                   Ver Demo
                <ExternalLink className="w-4 h-4 opacity-60" />
              </motion.button>
            </motion.div>
          </motion.div>

            {/* Right Column - Visual Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-slate-800/90 via-slate-700/90 to-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-600/50">
                {/* Dashboard Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                  <div className="ml-auto text-xs text-slate-400 font-mono">shareflow.platform</div>
        </div>

                {/* Dashboard Content */}
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                                         {[
                       { label: 'Pantallas Activas', value: '247', icon: Monitor, color: 'from-blue-500 to-cyan-500' },
                       { label: 'Ingresos', value: '$124k', icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
                       { label: 'Campañas', value: '89', icon: Target, color: 'from-purple-500 to-pink-500' },
                       { label: 'Uptime', value: '99.8%', icon: Shield, color: 'from-orange-500 to-red-500' }
                     ].map((stat, i) => (
        <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                        className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30"
                      >
                        <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20">
                                         <div className="flex items-center justify-between mb-4">
                       <div className="text-sm font-medium text-white">Análisis de Ingresos</div>
                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                     </div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-full bg-slate-600/50 rounded-full h-2 overflow-hidden">
            <motion.div 
                              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.random() * 40 + 60}%` }}
                              transition={{ delay: 1.2 + i * 0.2, duration: 1.5, ease: "easeOut" }}
            />
          </div>
                          <div className="text-xs text-slate-400 font-mono min-w-[3rem]">
                            {Math.floor(Math.random() * 40 + 60)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl" />
        </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Confiado por Líderes de la Industria
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-50 group-hover:to-cyan-50 transition-all duration-300">
                  <metric.icon className="w-7 h-7 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-4xl font-light text-slate-900 mb-2">{metric.value}</div>
                <div className="text-slate-600 font-medium mb-1">{metric.label}</div>
                <div className="text-sm text-slate-500">{metric.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Ecosistema DOOH <span className="font-medium">Completo</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              La automatización avanzada se encuentra con la optimización inteligente. 
              Todas las herramientas que necesitas para maximizar tus ingresos de digital out-of-home.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Interactive Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={`p-8 rounded-2xl cursor-pointer transition-all duration-500 ${
                    activeFeature === index
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200/50 shadow-lg'
                      : 'bg-slate-50/50 border-2 border-transparent hover:border-slate-200/50 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      activeFeature === index 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg' 
                        : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}>
                      <feature.icon className={`w-7 h-7 transition-colors ${
                        activeFeature === index ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-light text-slate-900">{feature.title}</h3>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                          activeFeature === index 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {feature.subtitle}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4 font-light leading-relaxed">{feature.description}</p>
                      
                      <AnimatePresence>
                        {activeFeature === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <ul className="space-y-3 pt-2">
                              {feature.details.map((detail, i) => (
                                <motion.li 
                                  key={i} 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-center gap-3 text-slate-700"
                                >
                                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <span className="text-sm font-light">{detail}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sophisticated Visual Demo */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl border border-slate-700/50">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <div className="ml-auto text-xs text-slate-400 font-mono">shareflow.platform</div>
                  </div>
                  <h3 className="text-2xl font-light mb-2">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-slate-400 font-light">
                    {features[activeFeature].subtitle}
                  </p>
                </div>
                
                {/* Elegant Interface Mockup */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
                  <div className="space-y-4">
                    {features[activeFeature].details.map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600/30">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                            <div className="text-xs text-slate-400 font-mono">
                              {Math.floor(Math.random() * 40 + 60)}%
                            </div>
                          </div>
                          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.random() * 30 + 70}%` }}
                              transition={{ delay: i * 0.2, duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Soluciones <span className="font-medium">Empresariales</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              Stack tecnológico integral diseñado para escala, 
              rendimiento y alcance global.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 hover:border-slate-300/50"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <solution.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                    {solution.badge}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium text-slate-900 mb-3">{solution.name}</h3>
                <p className="text-slate-600 mb-8 font-light leading-relaxed">{solution.description}</p>
                
                <ul className="space-y-3">
                  {solution.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

             {/* Pricing Section */}
       <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
         <div className="max-w-7xl mx-auto px-4">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="text-center mb-20"
           >
             <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
               Precios <span className="font-medium">Simples</span>
             </h2>
             <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
               Elige el plan que se ajuste al tamaño de tu red y ambiciones de crecimiento.
               Escala sin problemas mientras tu negocio se expande.
             </p>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* Free Plan */}
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 relative"
             >
               <div className="mb-8">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                     <Sparkles className="w-6 h-6 text-slate-600" />
                   </div>
                   <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                     Inicial
                   </span>
                 </div>
                 <h3 className="text-2xl font-medium text-slate-900 mb-2">Plan Gratuito</h3>
                 <p className="text-slate-600 font-light mb-6">Perfecto para comenzar con la gestión de señalización digital</p>
                 <div className="flex items-baseline gap-2 mb-6">
                   <span className="text-4xl font-light text-slate-900">$0</span>
                   <span className="text-slate-500 font-light">por mes</span>
                 </div>
               </div>

               <ul className="space-y-4 mb-8">
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span className="text-slate-700 font-light">Hasta 3 pantallas</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span className="text-slate-700 font-light">Gestión básica de contenido</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span className="text-slate-700 font-light">Análisis estándar</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span className="text-slate-700 font-light">Soporte por email</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span className="text-slate-700 font-light">Acceso al marketplace</span>
                 </li>
               </ul>

               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-2xl font-medium transition-all"
               >
                 Comenzar Gratis
               </motion.button>
             </motion.div>

             {/* Pro Plan */}
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.8 }}
               className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700/50 relative text-white"
             >
               <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                 <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                   Más Popular
                 </span>
               </div>

               <div className="mb-8">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                     <Crown className="w-6 h-6 text-white" />
                   </div>
                   <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                     Profesional
                   </span>
                 </div>
                 <h3 className="text-2xl font-medium mb-2">Plan Pro</h3>
                 <p className="text-slate-300 font-light mb-6">Funciones avanzadas para redes crecientes y empresas</p>
                 <div className="flex items-baseline gap-2 mb-6">
                   <span className="text-4xl font-light">$12</span>
                                        <span className="text-slate-300 font-light">por pantalla/mes</span>
                 </div>
               </div>

               <ul className="space-y-4 mb-8">
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                   <span className="text-slate-200 font-light">Pantallas ilimitadas</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                   <span className="text-slate-200 font-light">CMS avanzado y automatización</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                   <span className="text-slate-200 font-light">Análisis y reportes en tiempo real</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                   <span className="text-slate-200 font-light">Soporte prioritario y onboarding</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                   <span className="text-slate-200 font-light">Acceso a API e integraciones</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                   <span className="text-slate-200 font-light">Certificación Proof of Play</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                   <span className="text-slate-200 font-light">Optimización de ingresos</span>
                 </li>
               </ul>

               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white py-4 rounded-2xl font-medium transition-all shadow-lg"
               >
                 Start Pro Trial
               </motion.button>
             </motion.div>
           </div>

           {/* Additional Info */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4, duration: 0.8 }}
             className="text-center mt-16"
           >
             <p className="text-slate-600 font-light mb-4">
               All plans include 14-day free trial • No setup fees • Cancel anytime
             </p>
             <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
               <div className="flex items-center gap-2">
                 <Shield className="w-4 h-4" />
                 <span>Enterprise security</span>
               </div>
               <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4" />
                 <span>99.97% uptime SLA</span>
               </div>
               <div className="flex items-center gap-2">
                 <Users className="w-4 h-4" />
                 <span>24/7 support</span>
               </div>
             </div>
           </motion.div>
         </div>
       </section>

       {/* Integrations Section */}
       <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              Global <span className="font-medium">Ecosystem</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              Seamlessly integrate with industry-leading platforms 
              and demand-side partners worldwide.
            </p>
          </motion.div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-slate-200/50 hover:border-slate-300/50"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-100 transition-colors">
                  <Building className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">{integration.name}</h3>
                <p className="text-xs text-slate-500 mb-2">{integration.type}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  integration.tier === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                  integration.tier === 'Premium' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {integration.tier}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Elegant Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                <Crown className="w-4 h-4" />
                Join the Elite Network
              </span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-light mb-8 leading-tight">
              <span className="block">Transform Your</span>
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-medium">
                Digital Out-of-Home
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Join the global network of premium media owners who trust Shareflow 
              to maximize their DOOH revenue and operational efficiency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/partner/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white text-slate-900 px-8 py-4 rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
                >
                  <Crown className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group border border-white/30 text-white px-8 py-4 rounded-2xl font-medium text-lg backdrop-blur-sm hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Users className="w-5 h-5 group-hover:text-cyan-300 transition-colors" />
                Contact Sales
                <ExternalLink className="w-4 h-4 opacity-60" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 