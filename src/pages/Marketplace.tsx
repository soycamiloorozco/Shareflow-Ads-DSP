import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Search, Filter, MapPin, Users, Star, ArrowRight,
  TrendingUp, Calendar, ChevronRight, Sparkles, Monitor,
  Clock, DollarSign, Eye, Info
} from 'lucide-react';
import { screens, sportEvents } from '../data/mockData';
import { Screen } from '../types';
import { Card } from '../components/Card';
import { CategoryFilter } from '../components/CategoryFilter';
import { Button } from '../components/Button';
import { AISearchDialog } from '../components/AISearchDialog';
import { SmartSearchBar } from '../components/SmartSearchBar';

type ViewMode = 'all' | 'circuits' | 'events';

export function Marketplace() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const filteredScreens = useMemo(() => {
    return screens.filter(screen => {
      const matchesCategory = !selectedCategory || screen.category.id === selectedCategory;
      const matchesSearch = !searchQuery || 
        screen.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        screen.category.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesViewMode = viewMode === 'all' || 
        (viewMode === 'circuits' && screen.isPartOfCircuit) ||
        (viewMode === 'all' && !screen.isPartOfCircuit);
      return matchesCategory && matchesSearch && matchesViewMode;
    });
  }, [selectedCategory, searchQuery, viewMode]);

  const handleScreenSelect = (screen: Screen) => {
    setIsAIDialogOpen(false);
    navigate(`/screen/${screen.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=2940"
          alt="City at night"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl font-bold text-white mb-6">
                Encuentra la pantalla perfecta para tu mensaje
              </h1>
              
              <SmartSearchBar onSearch={setSearchQuery} />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Pantallas Activas</p>
                <p className="text-2xl font-semibold">{screens.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Alcance Diario</p>
                <p className="text-2xl font-semibold">2.5M+</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Circuitos</p>
                <p className="text-2xl font-semibold">
                  {screens.filter(s => s.isPartOfCircuit).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Eventos Deportivos</p>
                <p className="text-2xl font-semibold">{sportEvents.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant={viewMode === 'all' ? 'primary' : 'outline'}
            size="lg"
            onClick={() => setViewMode('all')}
          >
            Todas las Pantallas
          </Button>
          <Button
            variant={viewMode === 'circuits' ? 'primary' : 'outline'}
            size="lg"
            onClick={() => setViewMode('circuits')}
          >
            Circuitos
          </Button>
          <Button
            variant={viewMode === 'events' ? 'primary' : 'outline'}
            size="lg"
            onClick={() => setViewMode('events')}
          >
            Eventos Deportivos
          </Button>
        </div>

        {/* Category Filter */}
        {viewMode !== 'events' && (
          <div className="mb-12">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              onSearch={setSearchQuery}
            />
          </div>
        )}

        {/* Content */}
        {viewMode === 'events' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportEvents.map((event) => (
              <Card key={event.id} className="group cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                <div className="relative aspect-[4/3]">
                  <img
                    src={`https://api.shareflow.me/stadiums/${event.stadium.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                    alt={event.stadium}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between mb-2">
                      <img
                        src={`https://api.shareflow.me/teams/${event.homeTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                        alt={event.homeTeam}
                        className="w-10 h-10"
                      />
                      <span className="text-xl font-bold text-white">VS</span>
                      <img
                        src={`https://api.shareflow.me/teams/${event.awayTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                        alt={event.awayTeam}
                        className="w-10 h-10"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white text-center">
                      {event.homeTeam} vs {event.awayTeam}
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
                          {new Date(event.date).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Hora</p>
                        <p className="font-medium">{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Estadio</p>
                        <p className="font-medium">{event.stadium}</p>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreens.map((screen) => (
              <Card key={screen.id} className="group cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                <div className="relative">
                  <img 
                    src={screen.image} 
                    alt={screen.location}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
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
                  {screen.isPartOfCircuit && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-primary-50 text-primary rounded-full text-sm flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Circuito
                      </span>
                    </div>
                  )}
                </div>

                <Card.Body className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 flex items-center justify-center bg-neutral-50 rounded-lg">
                        <span className="text-xl">{screen.category.emoji}</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-600">
                        {screen.category.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {screen.name}
                    </h3>
                    <p className="text-sm text-neutral-600">{screen.location}</p>
                  </div>

                  {screen.isPartOfCircuit ? (
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-600">Pantallas en el circuito:</p>
                      <div className="space-y-1">
                        {screen.circuitScreens?.map((circuitScreen, index) => (
                          <div key={circuitScreen.id} className="flex items-center gap-2 text-sm">
                            <Monitor className="w-4 h-4 text-neutral-400" />
                            <span>{circuitScreen.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{(screen.views.daily / 1000).toFixed(1)}k/día</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{screen.rating} ({screen.reviews})</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-neutral-600">Desde</span>
                        <p className="text-lg font-semibold text-neutral-800">
                          ${screen.price.toLocaleString()} COP
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => handleScreenSelect(screen)}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-primary to-primary-600 text-white">
            <div className="p-8 md:p-12">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">
                  ¿Necesitas ayuda para elegir?
                </h2>
                <p className="text-white/90 mb-8">
                  Nuestro asistente IA te ayudará a encontrar la pantalla perfecta 
                  para tu campaña basándose en tus objetivos y presupuesto.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Bot}
                  className="!bg-white !text-primary hover:!bg-white/90"
                  onClick={() => setIsAIDialogOpen(true)}
                >
                  Consultar con IA
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AISearchDialog
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        onScreenSelect={handleScreenSelect}
      />
    </div>
  );
}