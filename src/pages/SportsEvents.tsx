import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, MapPin, Clock, Users,
  ChevronRight, Trophy, Sparkles,
  ArrowRight, Target, DollarSign
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import Select from 'react-select';
import { useSportEvents } from '../hooks/useSportEvents';
import { constants } from '../config/constants';

export function SportsEvents() {
  const navigate = useNavigate();
  const { sportEvents } = useSportEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedStadium, setSelectedStadium] = useState<string | null>(null);

  const filteredEvents = sportEvents.filter(event => {
    const matchesSearch = 
      event.homeTeamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.awayTeamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.stadiumId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = !selectedTeam || 
      event.homeTeamId === selectedTeam || 
      event.awayTeamId === selectedTeam;
    const matchesStadium = !selectedStadium || event.stadiumId === selectedStadium;
    return matchesSearch && matchesTeam && matchesStadium;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=2000"
            alt="Stadium at night"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm text-white mb-6">
              <Sparkles className="w-4 h-4" />
              <span>¡NUEVO!</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">
              Momentos Deportivos Exclusivos
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Sé parte de los momentos más emocionantes del fútbol colombiano. 
              Muestra tu marca en las pantallas LED durante los partidos en vivo.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Próximos Partidos</p>
                <p className="text-2xl font-semibold">{sportEvents.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Alcance Promedio</p>
                <p className="text-2xl font-semibold">45k+</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white p-6 rounded-2xl">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Momentos Disponibles</p>
              <p className="text-2xl font-semibold">150+</p>
            </div>
          </Card>

          <Card className="bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Desde</p>
                <p className="text-2xl font-semibold">$2.2M</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por equipo o estadio..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Select
            placeholder="Equipo"
            options={[
              { value: 'Atlético Nacional', label: 'Atlético Nacional' },
              { value: 'Independiente Medellín', label: 'Independiente Medellín' },
              { value: 'Millonarios', label: 'Millonarios' }
            ]}
            onChange={(option) => setSelectedTeam(option?.value || null)}
            isClearable
            className="w-[200px]"
          />

          <Select
            placeholder="Estadio"
            options={[
              { value: 'Estadio Atanasio Girardot', label: 'Atanasio Girardot' },
              { value: 'El Campín', label: 'El Campín' }
            ]}
            onChange={(option) => setSelectedStadium(option?.value || null)}
            isClearable
            className="w-[200px]"
          />
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="group cursor-pointer hover:-translate-y-1 transition-transform duration-200">
              <div className="relative aspect-[4/3]">
                <img
                 src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                  alt={event.stadiumName}
                  className="w-full h-full object-cover rounded-t-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between mb-2">
                    <img
                      src={`${constants.base_path}/${event.homeTeamImage}`}
                      alt={event.homeTeamName}
                      className="w-10 h-10"
                    />
                    <span className="text-xl font-bold text-white">VS</span>
                    <img
                       src={`${constants.base_path}/${event.awayTeamImage}`}
                      alt={event.awayTeamName}
                      className="w-10 h-10"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white text-center mb-2">
                    {event.homeTeamName} vs {event.awayTeamName}
                  </h3>
                </div>
              </div>

              <Card.Body className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Fecha</p>
                      <p className="font-medium">
                        {new Date(event.eventDate).toLocaleDateString('es-CO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Estadio</p>
                      <p className="font-medium">{event.stadiumName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Momentos Disponibles</p>
                      <p className="font-medium">15 momentos</p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={ChevronRight}
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    Ver momentos disponibles
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-primary to-primary-600 text-white">
            <div className="p-8 md:p-12">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">
                  ¿Listo para brillar en el deporte?
                </h2>
                <p className="text-white/90 mb-8">
                  Sé parte de los momentos más emocionantes del fútbol colombiano. 
                  Conecta con una audiencia apasionada y comprometida.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  className="!bg-white !text-primary hover:!bg-white/90"
                  onClick={() => navigate('/create')}
                >
                  Crear campaña
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}