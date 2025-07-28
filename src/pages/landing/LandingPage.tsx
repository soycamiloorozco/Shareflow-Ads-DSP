import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Play, ChevronRight, Monitor, Calendar,
  Target, Users, DollarSign, Bot, Zap, TrendingUp,
  Menu, X, Shield, Eye, Clock, Star, MapPin
} from 'lucide-react';
import { Button } from '../../components/Button';

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  const [isVisible, setIsVisible] = useState({
    stats: false,
    features: false,
    products: false,
    testimonials: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = {
        stats: document.getElementById('stats'),
        features: document.getElementById('features'),
        products: document.getElementById('products'),
        testimonials: document.getElementById('testimonials')
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
              <span className="text-xl font-bold">Shareflow</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/moments" className="text-neutral-600 hover:text-primary transition-colors">
                Momentos Deportivos
              </Link>
              <Link to="/marketplace" className="text-neutral-600 hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link to="/programmatic" className="text-neutral-600 hover:text-primary transition-colors">
                Programmatic
              </Link>
              <Link to="/ad-manager" className="text-neutral-600 hover:text-primary transition-colors">
                Ad Manager
              </Link>
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
                <Link
                  to="/moments"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Momentos Deportivos
                </Link>
                <Link
                  to="/marketplace"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Marketplace
                </Link>
                <Link
                  to="/programmatic"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Programmatic
                </Link>
                <Link
                  to="/ad-manager"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Ad Manager
                </Link>
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
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=2000"
          >
            <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-2049/1080p.mp4" type="video/mp4" />
          </video>
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
                La revolución de la publicidad digital
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Haz brillar tu marca en los <span className="text-primary">mejores momentos</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl">
                Conecta con audiencias apasionadas en pantallas premium y momentos deportivos únicos con la plataforma líder en publicidad digital out-of-home.
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
                icon={Play}
                className="text-base !text-white !border-white/20 hover:!bg-white/10"
              >
                Ver demo
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

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.stats ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Monitor, label: 'Pantallas Activas', value: '150+' },
              { icon: Users, label: 'Alcance Diario', value: '2.5M+' },
              { icon: Calendar, label: 'Eventos Deportivos', value: '45+' },
              { icon: Target, label: 'Ciudades', value: '12' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.stats ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                <p className="text-neutral-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
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
                Una plataforma completa para tu publicidad digital
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Shareflow te ofrece todas las herramientas que necesitas para crear, gestionar y optimizar tus campañas publicitarias.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Momentos Deportivos',
                description: 'Conecta con audiencias apasionadas durante los momentos más emocionantes de los eventos deportivos.',
                color: 'bg-primary-50',
                iconColor: 'text-primary'
              },
              {
                icon: Monitor,
                title: 'Marketplace de Pantallas',
                description: 'Accede a una amplia red de pantallas digitales premium en ubicaciones estratégicas.',
                color: 'bg-success-50',
                iconColor: 'text-success-500'
              },
              {
                icon: Bot,
                title: 'Compra Programática',
                description: 'Optimiza tus campañas con inteligencia artificial y alcanza a tu audiencia ideal.',
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
                <p className="text-neutral-600 mb-6">{feature.description}</p>
                <Link to={`/${feature.title.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center text-primary font-medium">
                  Saber más <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.products ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nuestros Productos
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Soluciones innovadoras para cada necesidad publicitaria
              </p>
            </motion.div>
          </div>

          {/* Momentos Deportivos */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isVisible.products ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-2 bg-primary-50 text-primary rounded-full text-sm font-medium mb-4">
                  Destacado
                </span>
                <h3 className="text-3xl font-bold mb-4">Momentos Deportivos</h3>
                <p className="text-lg text-neutral-600 mb-6">
                  Conecta con audiencias apasionadas durante los momentos más emocionantes de los eventos deportivos. Muestra tu marca cuando la atención está en su punto máximo.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Users, text: 'Alcanza a más de 45,000 espectadores en vivo' },
                    { icon: Eye, text: 'Visibilidad garantizada en momentos clave' },
                    { icon: TrendingUp, text: '87% de tasa de engagement' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <Link to="/moments">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Explorar Momentos
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isVisible.products ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1200"
                    alt="Stadium with LED screens"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black/80">
                    <div className="h-full flex items-center justify-center">
                      <span className="text-white font-bold">TU MARCA AQUÍ</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success-50 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-success-500" />
                    </div>
                    <div>
                      <p className="font-bold">+200%</p>
                      <p className="text-sm text-neutral-600">Engagement</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Marketplace */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isVisible.products ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="order-2 md:order-1 relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=800"
                      alt="Digital billboard in mall"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mt-8">
                    <img
                      src="https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?auto=format&fit=crop&q=80&w=800"
                      alt="Street digital billboard"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">150+</p>
                      <p className="text-sm text-neutral-600">Pantallas</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isVisible.products ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="order-1 md:order-2"
              >
                <h3 className="text-3xl font-bold mb-4">Marketplace de Pantallas</h3>
                <p className="text-lg text-neutral-600 mb-6">
                  Accede a nuestra amplia red de pantallas digitales premium en ubicaciones estratégicas. Selecciona la pantalla perfecta para tu marca y llega a tu audiencia ideal.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: MapPin, text: 'Ubicaciones premium en 12 ciudades' },
                    { icon: Clock, text: 'Reserva por hora, día, semana o mes' },
                    { icon: Star, text: 'Pantallas con alto tráfico garantizado' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <Link to="/marketplace">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Explorar Pantallas
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Programmatic */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isVisible.products ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-3xl font-bold mb-4">Compra Programática</h3>
                <p className="text-lg text-neutral-600 mb-6">
                  Optimiza tus campañas con inteligencia artificial. Nuestra plataforma programática utiliza algoritmos avanzados para maximizar el impacto de tu presupuesto.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Bot, text: 'IA que optimiza tus campañas en tiempo real' },
                    { icon: DollarSign, text: 'Mejor retorno de inversión publicitaria' },
                    { icon: Shield, text: 'Control total sobre tu presupuesto' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <Link to="/programmatic">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Descubrir Programmatic
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isVisible.products ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4">
                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            <span className="text-white font-medium">AI Optimization</span>
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
                            <span>Budget Optimization</span>
                            <span>85%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-success-500" />
                            <span className="text-white text-sm">Performance</span>
                          </div>
                          <p className="text-2xl font-bold text-white">+42%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-success-500" />
                            <span className="text-white text-sm">CPM</span>
                          </div>
                          <p className="text-2xl font-bold text-white">-18%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.testimonials ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Empresas de todos los tamaños confían en Shareflow para sus campañas publicitarias
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'María González',
                role: 'Marketing Director',
                company: 'Retail Corp',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                quote: 'Los momentos deportivos de Shareflow nos permitieron conectar con nuestra audiencia en los momentos más emocionantes. El ROI superó todas nuestras expectativas.'
              },
              {
                name: 'Carlos Rodríguez',
                role: 'CEO',
                company: 'Tech Innovators',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
                quote: 'La plataforma programática de Shareflow optimizó nuestro presupuesto publicitario como nunca antes. Logramos un 42% más de conversiones con el mismo gasto.'
              },
              {
                name: 'Ana Martínez',
                role: 'Brand Manager',
                company: 'Consumer Goods',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
                quote: 'El marketplace de pantallas nos dio acceso a ubicaciones premium que antes eran inalcanzables para nosotros. La visibilidad de nuestra marca aumentó significativamente.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.testimonials ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <p className="text-sm text-neutral-600">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-neutral-700 italic">"{testimonial.quote}"</p>
                <div className="mt-6 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400" fill="#FBBF24" />
                  ))}
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
              ¿Listo para brillar en los mejores momentos?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Únete a las marcas que ya están impactando a millones de personas con Shareflow
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
                <span className="text-xl font-bold">Shareflow</span>
              </div>
              <p className="text-neutral-400 mb-6">
                La plataforma líder en publicidad digital out-of-home en Colombia.
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
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Clientes</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Testimonios</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Términos de servicio</a></li>
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

// Helper component for animations
const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};