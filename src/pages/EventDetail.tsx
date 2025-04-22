import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, Clock, ArrowRight, Share2, ChevronRight, Loader2 } from 'lucide-react';
import { sportEvents } from '../data/mockData';
import { GameMoment, SportEvent } from '../types';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const MomentSelector = React.lazy(() => import('../components/MomentSelector').then(module => ({
  default: module.MomentSelector
})));

interface MomentGroup {
  momentId: string;
  minutes: number[];
}

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMoments, setSelectedMoments] = useState<MomentGroup[]>([]);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const foundEvent = sportEvents.find(e => e.id === id);
        if (!foundEvent) {
          throw new Error('Evento no encontrado');
        }
        
        setEvent(foundEvent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const gameMoments: GameMoment[] = [
    { id: '1', name: 'Primer Tiempo (45\')', duration: '45 minutos', price: 1250000, maxMinutes: 45 },
    { id: '2', name: 'Entre Tiempo (15\')', duration: '15 minutos', price: 950000, maxMinutes: 15 },
    { id: '3', name: 'Segundo Tiempo (45\')', duration: '45 minutos', price: 1250000, maxMinutes: 45 },
  ];

  const toggleMoment = (momentId: string) => {
    setSelectedMoments(prev => {
      const isSelected = prev.some(m => m.momentId === momentId);
      if (isSelected) {
        return prev.filter(m => m.momentId !== momentId);
      }
      return [...prev, { momentId, minutes: [25] }];
    });
  };

  const addMomentInstance = (momentId: string) => {
    setSelectedMoments(prev => {
      const momentGroup = prev.find(m => m.momentId === momentId);
      if (!momentGroup) return prev;

      return prev.map(m => {
        if (m.momentId === momentId) {
          return {
            ...m,
            minutes: [...m.minutes, 25]
          };
        }
        return m;
      });
    });
  };

  const removeMomentInstance = (momentId: string, index: number) => {
    setSelectedMoments(prev => {
      return prev.map(m => {
        if (m.momentId === momentId) {
          const newMinutes = [...m.minutes];
          newMinutes.splice(index, 1);
          return {
            ...m,
            minutes: newMinutes
          };
        }
        return m;
      }).filter(m => m.minutes.length > 0);
    });
  };

  const updateMomentMinute = (momentId: string, index: number, minute: number) => {
    setSelectedMoments(prev => 
      prev.map(m => {
        if (m.momentId === momentId) {
          const newMinutes = [...m.minutes];
          newMinutes[index] = minute;
          return { ...m, minutes: newMinutes };
        }
        return m;
      })
    );
  };

  const totalPrice = selectedMoments.reduce((sum, momentGroup) => {
    const moment = gameMoments.find(m => m.id === momentGroup.momentId);
    if (!moment) return sum;
    return sum + (moment.price * momentGroup.minutes.length);
  }, 0);

  const totalMoments = selectedMoments.reduce((sum, momentGroup) => 
    sum + momentGroup.minutes.length, 0
  );

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event ? `${event.homeTeam} vs ${event.awayTeam}` : 'Partido de fútbol',
        text: event ? `Mira este partido en el ${event.stadium}` : 'Mira este partido',
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePurchase = () => {
    if (selectedMoments.length > 0) {
      navigate(`/event/${id}/creative`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-body">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-6">
          <h1 className="text-heading-3 mb-4">
            {error || 'Evento no encontrado'}
          </h1>
          <p className="text-body-sm text-neutral-600 mb-6">
            Lo sentimos, no pudimos cargar la información del evento.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center text-link hover:underline"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a la página principal
          </Link>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <nav className="hidden lg:flex items-center gap-2 px-8 py-4 bg-white border-b border-neutral-200">
        <Link to="/" className="text-body-sm text-neutral-500 hover:text-primary transition-colors">
          Inicio
        </Link>
        <ChevronRight size={16} className="text-neutral-400" />
        <Link to="/" className="text-body-sm text-neutral-500 hover:text-primary transition-colors">
          Eventos Deportivos
        </Link>
        <ChevronRight size={16} className="text-neutral-400" />
        <span className="text-body-sm text-neutral-800">
          {event.homeTeam} vs {event.awayTeam}
        </span>
      </nav>

      <header 
        className={`
          sticky top-0 z-50 bg-white border-b border-neutral-200 
          transition-shadow duration-200
          ${isHeaderSticky ? 'shadow-md' : ''}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft size={24} className="text-neutral-800" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-medium text-neutral-800">
                  Momentos seleccionados
                </span>
                <div className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full">
                  <span className="text-lg font-bold text-primary">
                    {totalMoments}
                  </span>
                  <Clock size={20} className="text-primary" />
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Compartir"
              >
                <Share2 size={20} className="text-neutral-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
          <div className="lg:sticky lg:top-24 space-y-6">
            <Card className="p-6">
              <div className="flex justify-center items-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-50 rounded-2xl p-4 mb-2">
                    <img 
                      src={`https://api.shareflow.me/teams/${event.homeTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                      alt={event.homeTeam}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-body font-medium text-center">
                    {event.homeTeam}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-neutral-800 mb-2">VS</span>
                  <span className="text-body-sm text-neutral-500">
                    {eventDate}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-error-50 rounded-2xl p-4 mb-2">
                    <img 
                      src={`https://api.shareflow.me/teams/${event.awayTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                      alt={event.awayTeam}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-body font-medium text-center">
                    {event.awayTeam}
                  </span>
                </div>
              </div>
            </Card>

            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <img
                src={`https://api.shareflow.me/stadiums/${event.stadium.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                alt={event.stadium}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <Card>
              <Card.Body className="space-y-6">
                <div>
                  <h1 className="text-heading-2 mb-2">
                    Aparece en el Partido
                  </h1>
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-yellow-400" />
                    <span className="text-body-sm text-neutral-600">4.91</span>
                    <span className="text-body-sm text-neutral-600">(35 Reviews)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-2">
                      <img
                        src={`https://api.shareflow.me/stadiums/icon-${event.stadium.toLowerCase().replace(/\s+/g, '-')}.svg`}
                        alt="Stadium icon"
                        className="w-6 h-6"
                      />
                    </div>
                    <span className="text-body-sm font-medium text-neutral-800">
                      {event.stadium}
                    </span>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-2">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <span className="text-body-sm font-medium text-neutral-800">
                      45.000 espectadores
                    </span>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-2">
                      <Clock size={20} className="text-primary" />
                    </div>
                    <span className="text-body-sm font-medium text-neutral-800">
                      15 segundos
                    </span>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-primary rounded" />
                    </div>
                    <span className="text-body-sm font-medium text-neutral-800">
                      1920 x 96px
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-heading-4">¿Por qué es clave para un Momento?</h2>
                  <p className="text-body-sm text-neutral-600">
                    Las pantallas perimetrales rodean el campo de juego y son el foco visual constante tanto para los espectadores en el estadio como para las cámaras de transmisión en vivo.
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                        <Star size={16} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-body font-semibold text-neutral-800">
                          Máxima visibilidad
                        </h3>
                        <p className="text-body-sm text-neutral-600">
                          Tu mensaje aparece justo en el campo, captando la atención de miles de aficionados y millones de televidentes.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                        <Star size={16} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-body font-semibold text-neutral-800">
                          Impacto garantizado
                        </h3>
                        <p className="text-body-sm text-neutral-600">
                          Los anuncios se muestran durante el desarrollo del juego, asegurando que sean vistos por todos los asistentes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:p-6">
            <div className="space-y-6">
              <h2 className="text-heading-3">Selecciona tus momentos</h2>
              
              <div className="space-y-4">
                {gameMoments.map((moment) => (
                  <div key={moment.id} className="space-y-4">
                    <button
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all
                        ${selectedMoments.some(m => m.momentId === moment.id)
                          ? 'bg-primary border-primary-50'
                          : 'bg-white border-neutral-200 hover:border-primary-50'
                        }
                      `}
                      onClick={() => toggleMoment(moment.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <Clock size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-body font-semibold text-neutral-800">
                            {moment.name}
                          </h3>
                          <p className="text-body-sm text-neutral-600">
                            ${moment.price.toLocaleString()} COP por momento
                          </p>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full transition-colors
                          ${selectedMoments.some(m => m.momentId === moment.id)
                            ? 'bg-primary'
                            : 'border-2 border-neutral-300'
                          }
                        `} />
                      </div>
                    </button>

                    {selectedMoments.some(m => m.momentId === moment.id) && (
                      <div className="pl-14">
                        <ErrorBoundary>
                          <Suspense fallback={
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-neutral-200 rounded w-1/3" />
                              <div className="h-2 bg-neutral-200 rounded w-full" />
                            </div>
                          }>
                            <MomentSelector
                              momentId={moment.id}
                              momentNumber={parseInt(moment.id)}
                              maxMinutes={moment.maxMinutes}
                              selectedMinutes={selectedMoments.find(m => m.momentId === moment.id)?.minutes || []}
                              onMinuteSelect={(index, minute) => updateMomentMinute(moment.id, index, minute)}
                              onAddMoment={() => addMomentInstance(moment.id)}
                              onRemoveMoment={(index) => removeMomentInstance(moment.id, index)}
                            />
                          </Suspense>
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalMoments > 0 && (
                <div className="sticky bottom-0 left-0 right-0 pt-4 bg-white border-t border-neutral-200">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={ArrowRight}
                    onClick={handlePurchase}
                  >
                    Continuar - ${totalPrice.toLocaleString()} COP
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}