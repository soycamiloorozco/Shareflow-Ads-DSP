import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Play, ChevronRight, Calendar, Clock,
  Target, Users, DollarSign, Zap, TrendingUp,
  Menu, X, Eye, Star, Trophy, Heart
} from 'lucide-react';
import { Button } from '../../components/Button';

export function MomentosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  const [isVisible, setIsVisible] = useState({
    benefits: false,
    howItWorks: false,
    events: false,
    pricing: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = {
        benefits: document.getElementById('benefits'),
        howItWorks: document.getElementById('how-it-works'),
        events: document.getElementById('events'),
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
              <Trophy className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Shareflow Moments</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#benefits" className="text-neutral-600 hover:text-primary transition-colors">
                Beneficios
              </a>
              <a href="#how-it-works" className="text-neutral-600 hover:text-primary transition-colors">
                Cómo funciona
              </a>
              <a href="#events" className="text-neutral-600 hover:text-primary transition-colors">
                Eventos
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
                  href="#benefits"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Beneficios
                </a>
                <a
                  href="#how-it-works"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cómo funciona
                </a>
                <a
                  href="#events"
                  className="block p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Eventos
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
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=2000"
          >
            <source src="https://cdn.coverr.co/videos/coverr-soccer-stadium-during-a-match-5043/1080p.mp4" type="video/mp4" />
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
                Momentos Deportivos
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Haz brillar tu marca en los <span className="text-primary">momentos más emocionantes</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl">
                Conecta con audiencias apasionadas durante los eventos deportivos más importantes. Muestra tu marca cuando la atención está en su punto máximo.
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
                Reservar momentos
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
                Beneficios de los Momentos Deportivos
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Maximiza el impacto de tu marca con nuestra solución publicitaria premium
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Audiencia Apasionada',
                description: 'Conecta con espectadores altamente comprometidos durante momentos de máxima atención.',
                stat: '45,000+',
                statLabel: 'Espectadores en vivo'
              },
              {
                icon: Eye,
                title: 'Visibilidad Garantizada',
                description: 'Tus anuncios aparecen en momentos clave del partido cuando todos están mirando.',
                stat: '98%',
                statLabel: 'Tasa de visibilidad'
              },
              {
                icon: TrendingUp,
                title: 'Alto Engagement',
                description: 'Genera un impacto emocional duradero al asociar tu marca con momentos memorables.',
                stat: '87%',
                statLabel: 'Tasa de engagement'
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.benefits ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-neutral-600 mb-6">{benefit.description}</p>
                <div className="pt-6 border-t border-neutral-100">
                  <p className="text-3xl font-bold text-primary">{benefit.stat}</p>
                  <p className="text-sm text-neutral-600">{benefit.statLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.howItWorks ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cómo Funcionan los Momentos Deportivos
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Un proceso simple para maximizar el impacto de tu marca
              </p>
            </motion.div>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  step: 1,
                  title: 'Selecciona el Evento',
                  description: 'Elige entre una amplia variedad de eventos deportivos premium.',
                  icon: Calendar
                },
                {
                  step: 2,
                  title: 'Elige tus Momentos',
                  description: 'Selecciona los minutos específicos en los que quieres aparecer.',
                  icon: Clock
                },
                {
                  step: 3,
                  title: 'Sube tu Creativo',
                  description: 'Carga tu anuncio siguiendo nuestras especificaciones técnicas.',
                  icon: Target
                },
                {
                  step: 4,
                  title: 'Mide el Impacto',
                  description: 'Analiza el rendimiento de tu campaña con métricas detalladas.',
                  icon: TrendingUp
                }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible.howItWorks ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-sm relative"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                  <div className="pt-6">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-center">{step.title}</h3>
                    <p className="text-neutral-600 text-center">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
            >
              Comenzar ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible.events ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Próximos Eventos Destacados
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Reserva tus momentos en los eventos deportivos más importantes
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: '1',
                homeTeam: 'Atlético Nacional',
                awayTeam: 'Independiente Medellín',
                date: '2024-04-15',
                time: '19:30',
                stadium: 'Estadio Atanasio Girardot',
                city: 'Medellín',
                price: 2500000,
                image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1200'
              },
              {
                id: '2',
                homeTeam: 'Millonarios',
                awayTeam: 'América de Cali',
                date: '2024-04-20',
                time: '17:00',
                stadium: 'El Campín',
                city: 'Bogotá',
                price: 2000000,
                image: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?auto=format&fit=crop&q=80&w=1200'
              },
              {
                id: '3',
                homeTeam: 'Junior',
                awayTeam: 'Deportivo Cali',
                date: '2024-04-25',
                time: '20:00',
                stadium: 'Estadio Metropolitano',
                city: 'Barranquilla',
                price: 1800000,
                image: 'https://images.unsplash.com/photo-1590552515252-3a5a1bce7bed?auto=format&fit=crop&q=80&w=1200'
              }
            ].map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.events ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={event.image}
                    alt={`${event.homeTeam} vs ${event.awayTeam}`}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  <div className="absolute top-4 right-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                      <Heart className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <img
                          src={`https://api.shareflow.me/teams/${event.homeTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                          alt={event.homeTeam}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <span className="text-2xl font-bold text-white">VS</span>
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <img
                          src={`https://api.shareflow.me/teams/${event.awayTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                          alt={event.awayTeam}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {event.homeTeam} vs {event.awayTeam}
                      </h3>
                      <div className="flex items-center justify-center gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(event.date).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="font-medium">{event.stadium}</span>
                    </div>
                    <div className="px-3 py-1 bg-primary-50 text-primary rounded-full text-sm">
                      {event.city}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Desde</p>
                      <p className="text-xl font-bold text-primary">
                        ${(event.price / 1000000).toFixed(1)}M COP
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                    >
                      Reservar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/sports-events">
              <Button
                variant="outline"
                size="lg"
                icon={ChevronRight}
              >
                Ver todos los eventos
              </Button>
            </Link>
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
                Precios Transparentes
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Elige el plan que mejor se adapte a tus necesidades
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Momento Único',
                description: 'Perfecto para probar el formato',
                price: '1.2M',
                features: [
                  '1 momento de 15 segundos',
                  'Elección de minuto específico',
                  'Alcance de 45,000+ espectadores',
                  'Informe básico de rendimiento'
                ],
                cta: 'Comenzar',
                popular: false
              },
              {
                name: 'Pack Momentos',
                description: 'Nuestra opción más popular',
                price: '3.5M',
                features: [
                  '3 momentos de 15 segundos',
                  'Elección de minutos específicos',
                  'Alcance de 45,000+ espectadores',
                  'Informe detallado de rendimiento',
                  'Prioridad en la selección de momentos'
                ],
                cta: 'Seleccionar plan',
                popular: true
              },
              {
                name: 'Momentos Premium',
                description: 'Máximo impacto garantizado',
                price: '8M',
                features: [
                  '6 momentos de 15 segundos',
                  'Elección de minutos específicos',
                  'Alcance de 45,000+ espectadores',
                  'Informe detallado de rendimiento',
                  'Prioridad en la selección de momentos',
                  'Momentos en tiempo premium garantizados',
                  'Asesoramiento creativo personalizado'
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
                    <span className="text-neutral-600"> COP</span>
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
              ¿Listo para brillar en los mejores momentos?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Únete a las marcas que ya están impactando a millones de personas con Shareflow Moments
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
                <Trophy className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">Shareflow Moments</span>
              </div>
              <p className="text-neutral-400 mb-6">
                La solución publicitaria premium para eventos deportivos.
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