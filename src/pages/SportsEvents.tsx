import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Calendar, MapPin, Clock, Users,
  ChevronRight, Star, ArrowRight, Target,
  Heart, X, Info, Zap, Tv, BarChart3
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import Select from 'react-select';
import { useSportEvents } from '../hooks/useSportEvents';
import { constants } from '../config/constants';
import estadioImage from '../assets/estadio.png';

export function SportsEvents() {
  const navigate = useNavigate();
  const { sportEvents } = useSportEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedStadium, setSelectedStadium] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredEvents = sportEvents.filter(event => {
    const matchesSearch = 
      event.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.stadiumName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = !selectedTeam || 
      event.homeTeamName === selectedTeam || 
      event.awayTeamName === selectedTeam;
    const matchesStadium = !selectedStadium || event.stadiumName === selectedStadium;
    return matchesSearch && matchesTeam && matchesStadium;
  });


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={estadioImage}
            alt="Stadium at night"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 md:mb-0"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                Eventos deportivos
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                Conecta con millones de aficionados en los momentos más emocionantes
              </p>
            </motion.div>
            
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                className="md:hidden h-12 px-6 text-base"
                onClick={() => setIsInfoModalOpen(true)}
              >
                Info
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="hidden md:flex"
                onClick={() => setIsInfoModalOpen(true)}
              >
                ¿Cómo funciona?
              </Button>
              {/* <Button
                variant="outline"
                size="lg"
                className="md:hidden h-12 px-6 text-base !text-white !border-white/20 hover:!bg-white/10"
                onClick={() => navigate('/create')}
              >
                Crear
              </Button> */}
              {/* <Button
                variant="outline"
                size="lg"
                className="hidden md:flex !text-white !border-white/20 hover:!bg-white/10"
                onClick={() => navigate('/create')}
              >
                Crear campaña
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-10 relative z-10">
        <Card className="p-3 md:p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por equipo o estadio..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-base"
              />
            </div>
            
            {/* <div className="hidden md:flex gap-3">
              <Select
                placeholder="Equipo"
                options={[
                  { value: 'Atlético Nacional', label: 'Atlético Nacional' },
                  { value: 'Independiente Medellín', label: 'Independiente Medellín' },
                  { value: 'Millonarios', label: 'Millonarios' },
                  { value: 'América de Cali', label: 'América de Cali' }
                ]}
                onChange={(option) => setSelectedTeam(option?.value || null)}
                isClearable
                className="w-[180px]"
              />
              
              <Select
                placeholder="Estadio"
                options={[
                  { value: 'Estadio Atanasio Girardot', label: 'Atanasio Girardot' },
                  { value: 'El Campín', label: 'El Campín' }
                ]}
                onChange={(option) => setSelectedStadium(option?.value || null)}
                isClearable
                className="w-[180px]"
              />
            </div> */}
            
            <Button
              variant="outline"
              size="lg"
              className="md:hidden h-12 text-base"
              icon={Filter}
              onClick={() => setIsFilterOpen(true)}
            >
              Filtros
            </Button>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Próximos partidos</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 hidden md:inline-block">
              {filteredEvents.length} eventos encontrados
            </span>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredEvents.map((event) => {
            // Calculate CPM for this event
            const firstHalfCPM = event.moments.length  > 0 ? ((event.moments[0].price / (event.estimatedAttendance + (event.estimatedAttendance || 0))) * 1000).toFixed(2): 0;
            
            return (
              <motion.div
                key={event.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="relative aspect-[16/9]">
                    <img
                       src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                      alt={event.stadiumName}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <div className="absolute top-3 right-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle favorite
                        }}
                      >
                        <Heart className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <img 
                            src={`${constants.base_path}/${event.homeTeamImage}`}
                            alt={event.homeTeamName}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-base font-bold text-white">VS</span>
                        </div>
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <img 
                              src={`${constants.base_path}/${event.awayTeamImage}`}
                            alt={event.awayTeamName}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card.Body className="p-4">
                    <h3 className="text-base font-bold mb-2 line-clamp-1">
                      {event.homeTeamName} vs {event.awayTeamName}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>
                          {new Date(event.eventDate).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span>{event.eventTime || '8:00 PM'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span className="line-clamp-1">{event.stadiumName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Users className="w-4 h-4 text-neutral-400" />
                        <span>{event.estimatedAttendance?.toLocaleString() || 'N/A'} espectadores</span>
                      </div>

                      {event.estimatedAttendance && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Tv className="w-4 h-4 text-neutral-400" />
                          <span>{event.estimatedAttendance.toLocaleString()} televidentes</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <BarChart3 className="w-4 h-4 text-neutral-400" />
                        <span>CPM: ${firstHalfCPM}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                      <div>
                        <p className="text-xs text-neutral-500">Desde</p>
                        <p className="text-base font-bold text-primary">
                          ${(event.moments[0].price || 2250000).toLocaleString()} COP
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="lg"
                        className="h-10 px-4 text-base"
                        icon={ChevronRight}
                      >
                        Ver
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
            <p className="text-neutral-600 max-w-md mx-auto">
              No hay eventos que coincidan con tu búsqueda. Intenta con otros filtros o vuelve más tarde.
            </p>
          </div>
        )}
        
        {/* CTA Section */}
        <div className="mt-12 md:mt-16">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
            <div className="absolute inset-0">
              
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-600/90" />
            </div>
            <div className="relative py-8 px-6 md:py-12 md:px-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0 md:max-w-md">
                <h2 className="text-xl md:text-3xl font-bold text-white mb-2">
                  Lleva tu marca al siguiente nivel
                </h2>
                <p className="text-sm md:text-base text-white/90">
                  Conecta con audiencias apasionadas en los momentos más emocionantes del deporte
                </p>
              </div>
              {/* <Button
                variant="primary"
                size="lg"
                className="!bg-white !text-primary hover:!bg-white/90 h-14 px-6 text-base"
                icon={ArrowRight}
                onClick={() => navigate('/create')}
              >
                Crear campaña
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filtros</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-3 hover:bg-neutral-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-base font-medium text-neutral-700 mb-2">
                    Equipo
                  </label>
                  <Select
                    placeholder="Seleccionar equipo"
                    options={[
                      { value: 'Atlético Nacional', label: 'Atlético Nacional' },
                      { value: 'Independiente Medellín', label: 'Independiente Medellín' },
                      { value: 'Millonarios', label: 'Millonarios' },
                      { value: 'América de Cali', label: 'América de Cali' }
                    ]}
                    onChange={(option) => setSelectedTeam(option?.value || null)}
                    isClearable
                    className="w-full text-base"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px'
                      })
                    }}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-neutral-700 mb-2">
                    Estadio
                  </label>
                  <Select
                    placeholder="Seleccionar estadio"
                    options={[
                      { value: 'Estadio Atanasio Girardot', label: 'Atanasio Girardot' },
                      { value: 'El Campín', label: 'El Campín' }
                    ]}
                    onChange={(option) => setSelectedStadium(option?.value || null)}
                    isClearable
                    className="w-full text-base"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px'
                      })
                    }}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-neutral-200">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="h-14 text-base"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Aplicar filtros
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsInfoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 md:p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-2xl font-semibold">¿Cómo funcionan los momentos deportivos?</h2>
                  <button
                    onClick={() => setIsInfoModalOpen(false)}
                    className="p-3 hover:bg-neutral-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex-shrink-0 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Momentos de alto impacto</h3>
                      <p className="text-neutral-600">
                        Los momentos deportivos son espacios publicitarios de 15 segundos que aparecen en las pantallas LED del estadio durante momentos específicos del partido.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="font-semibold">Pre-partido</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          30 minutos antes del inicio, cuando los aficionados están llegando al estadio y la expectativa está en su punto máximo.
                        </p>
                      </Card.Body>
                    </Card>
                    
                    <Card>
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="font-semibold">Primer tiempo</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Durante los primeros 45 minutos del partido, cuando la atención está centrada en el juego.
                        </p>
                      </Card.Body>
                    </Card>
                    
                    <Card>
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="font-semibold">Medio tiempo</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          15 minutos de descanso donde los espectadores están más receptivos a mensajes publicitarios.
                        </p>
                      </Card.Body>
                    </Card>
                    
                    <Card>
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="font-semibold">Segundo tiempo</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Los últimos 45 minutos del partido, cuando la tensión y emoción están en su punto más alto.
                        </p>
                      </Card.Body>
                    </Card>
                  </div>

                  <div className="bg-primary-50 p-4 rounded-xl">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center">
                        <Info className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary">¿Por qué elegir momentos deportivos?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="font-medium">45,000+</span>
                            </div>
                            <p className="text-xs text-neutral-600">Espectadores en vivo</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Tv className="w-4 h-4 text-primary" />
                              <span className="font-medium">3.2M+</span>
                            </div>
                            <p className="text-xs text-neutral-600">Audiencia televisiva</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="font-medium">87%</span>
                            </div>
                            <p className="text-xs text-neutral-600">Tasa de engagement</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    className="h-14 px-8 text-base"
                    onClick={() => setIsInfoModalOpen(false)}
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}