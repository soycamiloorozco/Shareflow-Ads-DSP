import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Users, Star, Eye, Monitor, Clock, Calendar,
  ChevronRight, Sparkles, Trophy, Target, DollarSign, TrendingUp,
  Play, ArrowRight, Info, Heart, ArrowUpRight
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SmartSearchBar } from '../components/SmartSearchBar';
import { screens, sportEvents } from '../data/mockData';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Reduced height and improved spacing */}
      <div className="relative h-[85vh] flex flex-col">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0B0B16]">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(47, 128, 237, 0.1) 0%, rgba(11, 11, 22, 0) 50%)',
            }} />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-110 blur-sm"
                poster="https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=2000"
              >
                <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-a-city-at-night-2049/1080p.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B16]/50 via-[#0B0B16]/30 to-background" />
        </div>

        <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 pt-20 md:pt-28">
          <div className="h-full flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center mb-8 md:mb-12"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 md:mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white mb-6">
                  <Sparkles className="w-4 h-4 text-[#ABFAA9]" />
                  <span>Nuevo: Momentos Deportivos</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
                  Tu mensaje brillará en los <span className="text-[#ABFAA9]">mejores momentos</span>
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl mx-auto">
                  Conecta con tu audiencia en pantallas premium y momentos deportivos únicos
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => navigate('/create')}
                  className="w-full sm:w-auto"
                >
                  Crear campaña
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto !text-white !border-white/20 hover:!bg-white/10"
                  onClick={() => navigate('/marketplace')}
                >
                  Explorar pantallas
                </Button>
              </div>

              <div className="max-w-2xl mx-auto">
                <SmartSearchBar onSearch={(query) => console.log('Search:', query)} />
              </div>
            </motion.div>

            <div className="mt-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                {[
                  { icon: Monitor, label: 'Pantallas Activas', value: '150+' },
                  { icon: Users, label: 'Alcance Diario', value: '2.5M+' },
                  { icon: MapPin, label: 'Ciudades', value: '12' },
                  { icon: Trophy, label: 'Eventos Deportivos', value: '45+' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                  >
                    <Card className="bg-[#0B0B16]/80 backdrop-blur-sm border border-white/10 hover:bg-[#0B0B16]/90 transition-colors group">
                      <Card.Body className="p-4 md:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#ABFAA9]/10 rounded-xl flex items-center justify-center group-hover:bg-[#ABFAA9]/20 transition-colors">
                            <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-[#ABFAA9]" />
                          </div>
                          <div>
                            <p className="text-sm text-[#ABFAA9] tracking-[-0.03em] font-medium">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-bold text-white tracking-[-0.03em]">{stat.value}</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full h-16 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16">
        {/* Featured Events Carousel */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Próximos Eventos</h2>
              <p className="text-neutral-600">
                No te pierdas los momentos más emocionantes del deporte
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/sports-events')}
            >
              Ver todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sportEvents.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={`https://api.shareflow.me/stadiums/${event.stadium.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                      alt={event.stadium}
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
                        <img
                          src={`https://api.shareflow.me/teams/${event.homeTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                          alt={event.homeTeam}
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-2xl font-bold text-white">VS</span>
                        <img
                          src={`https://api.shareflow.me/teams/${event.awayTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                          alt={event.awayTeam}
                          className="w-12 h-12 object-contain"
                        />
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

                  <Card.Body className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600">Desde</p>
                        <p className="text-xl font-bold text-primary">
                          ${(event.price || 0).toLocaleString()} COP
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                      >
                        Ver momentos
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Screens */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Pantallas Destacadas</h2>
              <p className="text-neutral-600">
                Las mejores ubicaciones para tu marca
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/marketplace')}
            >
              Explorar más
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {screens.slice(0, 3).map((screen) => (
              <motion.div
                key={screen.id}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/screen/${screen.id}`)}
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-video">
                    <img
                      src={screen.image}
                      alt={screen.location}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <span className={`
                        px-3 py-1 rounded-full text-sm backdrop-blur-sm
                        ${screen.availability
                          ? 'bg-success-50/80 text-success-600'
                          : 'bg-error-50/80 text-error-600'
                        }
                      `}>
                        {screen.availability ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {screen.location}
                      </h3>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{screen.category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">{screen.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card.Body className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600">Desde</p>
                        <p className="text-xl font-bold text-primary">
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
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Promo Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200"
                alt="First time"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-600/90" />
            </div>
            <div className="relative p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">¿Primera vez en Shareflow?</h3>
              </div>
              <p className="text-white/90 mb-6 max-w-md">
                Descubre cómo crear tu primera campaña exitosa con nuestra guía paso a paso.
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                className="!bg-white !text-primary hover:!bg-white/90"
                onClick={() => navigate('/tutorial')}
              >
                Comenzar ahora
              </Button>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1200"
                alt="Special offers"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-success-500/90 to-success-600/90" />
            </div>
            <div className="relative p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Ofertas especiales</h3>
              </div>
              <p className="text-white/90 mb-6 max-w-md">
                Aprovecha descuentos de hasta 30% en ubicaciones premium del centro de la ciudad.
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                className="!bg-white !text-success-600 hover:!bg-white/90"
                onClick={() => navigate('/offers')}
              >
                Ver ofertas
              </Button>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <section className="mb-16">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2000"
                alt="CTA background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-primary-900/90" />
            </div>
            <div className="relative py-20 px-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                ¿Listo para brillar?
              </h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Únete a las marcas que ya están impactando a millones de personas 
                a través de nuestra red de pantallas digitales y momentos deportivos únicos.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="!bg-white !text-primary hover:!bg-white/90"
                onClick={() => navigate('/create')}
              >
                Crear campaña
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}