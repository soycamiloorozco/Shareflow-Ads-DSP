import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Calendar, Users,
  ChevronRight, 
  Target, DollarSign, 
  X,
  Settings,
  Info,
  Clock,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { TeamSelector } from '../../components/admin/TeamSelector';
import { StadiumSelector } from '../../components/admin/StadiumSelector';
import { MomentPricing } from '../../components/admin/MomentPricing';
import { useTeams, Team } from '../../hooks/useTeams';
import { useStadiums, Stadium } from '../../hooks/useStadiums';
import { useSportEvents, SportEvents } from '../../hooks/useSportEvents';
import { constants } from '../../config/constants';

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export function SportsEventsAdmin() {

  const { createTeam, teams, listTeams } = useTeams();
  const { createStadiums, stadiums, listStadiums } = useStadiums();
  const { createSportEvent, listSportEvent, sportEvents, updateEventStatus, updateEventMoments } = useSportEvents();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SportEvents | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state for new event
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    stadiumId: '',
    eventDate: '',
    eventTime: '',
    homeTeamName: '',
    awayTeamName: '',
    stadiumName: '',
    maxMoments: 0,
    momentPrices: {
      firstHalf: 2500000,
      halftime: 1800000,
      secondHalf: 2500000,
    },
    estimatedAttendance: 0,
    estimatedAttendanceTv: 0,
    broadcastChannels: "",
    status: 'Active' as 'Active' | 'Inactive' | 'Eliminated'
  });

  const handleCreateEvent = async () => {
    // Handle event creation
    const data = {
      ...formData,
      momentPrices: [
        {
          "moment": "FirstHalf",
          "price": formData.momentPrices.firstHalf
        },
        {
          "moment": "Halftime",
          "price": formData.momentPrices.halftime
        },
        {
          "moment": "SecondHalf",
          "price": formData.momentPrices.secondHalf
        }
      ]
    }
    console.log('Create event:', data);
    await createSportEvent(data);
    await listSportEvent();
    setIsCreateModalOpen(false);
  };

  const handleCreateTeam = async (data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTeam({
      name: data.name,
      city: data.city,
      logo: data.logo,
      primaryColor: data.colors.primary,
      secondaryColor: data.colors.secondary
    });
    await listTeams();
  }

  const handleCreateStedium = async (data: Omit<Stadium, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log({ data })
    await createStadiums(data)
    await listStadiums();
  }


    const handleEditEvent = (event: SportEvents) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };


  const handleUpdateEvent = async (event: SportEvents) => {
    try {
      const momentPrices = [
        {
          moment: 0, // FirstHalf
          price: event.moments.find(m => m.moment === "FirstHalf")?.price || 0
        },
        {
          moment: 1, // Halftime
          price: event.moments.find(m => m.moment === "Halftime")?.price || 0
        },
        {
          moment: 2, // SecondHalf
          price: event.moments.find(m => m.moment === "SecondHalf")?.price || 0
        }
      ];

      await updateEventMoments(event.id, {
        maxMoments: event.maxMoments,
        momentPrices,
        estimatedAttendance: event.estimatedAttendance,
        estimatedAttendanceTv: event.estimatedAttendanceTv
      });
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: 'Active' | 'Inactive' | 'Eliminated') => {
    try {
      await updateEventStatus(eventId, newStatus);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await updateEventStatus(eventId, 'Eliminated');
      } catch (error) {
        console.error('Error al eliminar el evento:', error);
      }
    }
  };

  const filteredEvents = sportEvents.filter(event => {
    const matchesSearch = 
      event.homeTeamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.awayTeamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.stadiumId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Eventos Deportivos</h1>
            <p className="text-neutral-600">
              Gestiona los eventos deportivos y sus momentos publicitarios
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuevo Evento
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Eventos Programados</p>
                <p className="text-2xl font-semibold">{sportEvents.length }</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-success-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Momentos Disponibles</p>
                <p className="text-2xl font-semibold">{ sportEvents.reduce((acc, event) => acc + event.maxMoments, 0)}</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Alcance Potencial</p>
                <p className="text-2xl font-semibold">{formatNumber(sportEvents.reduce((acc, event) => acc + event.estimatedAttendance + event.estimatedAttendanceTv, 0))}</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Precio Promedio</p>
                <p className="text-2xl font-semibold">{ formatNumber(sportEvents.reduce((acc, event) => acc + event.moments[0].price, 0))}</p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar eventos..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            icon={Filter}
            onClick={() => {/* Handle filters */}}
          >
            Filtros
          </Button>
        </div>

        {/* Events List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left p-4 font-medium text-neutral-600">Evento</th>
                  <th className="text-left p-4 font-medium text-neutral-600">Fecha</th>
                  <th className="text-left p-4 font-medium text-neutral-600">Estadio</th>
                  <th className="text-left p-4 font-medium text-neutral-600">Momentos</th>
                  <th className="text-left p-4 font-medium text-neutral-600">Estado</th>
                  <th className="text-right p-4 font-medium text-neutral-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-neutral-200">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <img 
                              src={`${constants.base_path}/${event.homeTeamImage}`}
                              alt={event.homeTeamId}
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                          <span className="text-sm">vs</span>
                          <div className="w-10 h-10 bg-error-50 rounded-lg flex items-center justify-center">
                            <img 
                               src={`${constants.base_path}/${event.awayTeamImage}`}
                              alt={event.awayTeamId}
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{event.homeTeamName} vs {event.awayTeamName}</h3>
                          <p className="text-sm text-neutral-600">{event.stadiumName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>{event.eventTime}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span>{event.stadiumName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Users className="w-4 h-4" />
                        <span>{event.estimatedAttendance?.toLocaleString() || 'N/A'} espectadores</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium">{event.maxMoments || 20} momentos</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Desde ${(event.moments && event.moments.length > 0 ? event.moments[0].price : 0 / 1000000).toFixed(1)}M</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={event.status === 'Active'}
                            onChange={(e) => handleStatusChange(event.id, e.target.checked ? 'Active' : 'Inactive')}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {event.status === 'Active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditEvent(event)}
                          children={undefined}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-error-500 hover:text-error-600 hover:bg-error-50"
                          children={undefined}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div className="absolute inset-0 overflow-y-auto">
              <div className="min-h-full p-4 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-4xl bg-white rounded-2xl shadow-xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Nuevo Evento Deportivo</h2>
                      <button
                        onClick={() => setIsCreateModalOpen(false)}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Team Selection */}
                    <TeamSelector
                      teams={teams}
                      selectedHomeTeam={formData.homeTeamId}
                      selectedAwayTeam={formData.awayTeamId}
                      onHomeTeamSelect={(teamId) => setFormData({
                        ...formData,
                        homeTeamId: teamId
                      })}
                      onAwayTeamSelect={(teamId) => setFormData({
                        ...formData,
                        awayTeamId: teamId
                      })}
                      onAddTeam={handleCreateTeam}
                    />

                    {/* Stadium Selection */}
                    <StadiumSelector
                      stadiums={stadiums}
                      selectedStadium={formData.stadiumId}
                      onStadiumSelect={(stadiumId) => setFormData({
                        ...formData,
                        stadiumId: stadiumId
                      })}
                      onAddStadium={handleCreateStedium}
                    />

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Fecha
                        </label>
                        <input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => setFormData({
                            ...formData,
                            eventDate: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Hora
                        </label>
                        <input
                          type="time"
                          value={formData.eventTime}
                          onChange={(e) => setFormData({
                            ...formData,
                            eventTime: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Moment Pricing */}
                    <MomentPricing
                      prices={formData.momentPrices}
                      onChange={(prices) => setFormData({
                        ...formData,
                        momentPrices: prices
                      })}
                    />


                    {/* Maximum Moments Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Configuración de Momentos</h3>
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Info className="w-4 h-4" />
                          <span>Establece el límite de momentos disponibles</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <Settings className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Número máximo de momentos disponibles
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={formData.maxMoments}
                              onChange={(e) => setFormData({
                                ...formData,
                                maxMoments: parseInt(e.target.value)
                              })}
                              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="mt-2 text-sm text-primary-600">
                              Limitar la disponibilidad crea sensación de escasez y aumenta el valor percibido.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    

                    {/* Additional Details */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Detalles Adicionales</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Asistencia Estimada
                          </label>
                          <input
                            type="number"
                            value={formData.estimatedAttendance}
                            onChange={(e) => setFormData({
                              ...formData,
                              estimatedAttendance: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Asistencia Estimada TV
                          </label>
                          <input
                            type="number"
                            value={formData.estimatedAttendanceTv}
                            onChange={(e) => setFormData({
                              ...formData,
                              estimatedAttendanceTv: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Canales de Transmisión
                          </label>
                          <input
                            type="text"
                            placeholder="Separados por coma"
                            onChange={(e) => setFormData({
                              ...formData,
                              broadcastChannels: e.target.value
                              //broadcastChannels: e.target.value.split(',').map(s => s.trim())
                            })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsCreateModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        icon={ChevronRight}
                        onClick={handleCreateEvent}
                      >
                        Crear Evento
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
       {/* Edit Event Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsEditModalOpen(false)}
          >
            <div className="absolute inset-0 overflow-y-auto">
              <div className="min-h-full p-4 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-4xl bg-white rounded-2xl shadow-xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Editar Evento Deportivo</h2>
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Event details form would go here */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Configuración de Momentos</h3>
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Info className="w-4 h-4" />
                          <span>Establece el límite de momentos disponibles</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <Settings className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Número máximo de momentos disponibles
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={selectedEvent.maxMoments || 20}
                              onChange={(e) => setSelectedEvent({
                                ...selectedEvent,
                                maxMoments: parseInt(e.target.value)
                              })}
                              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="mt-2 text-sm text-primary-600">
                              Limitar la disponibilidad crea sensación de escasez y aumenta el valor percibido.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Moment Pricing */}
                    <MomentPricing
                      prices={{
                        firstHalf: selectedEvent.moments.find(m => m.moment === "FirstHalf")?.price || 0,
                        halftime: selectedEvent.moments.find(m => m.moment === "Halftime")?.price || 0,
                        secondHalf: selectedEvent.moments.find(m => m.moment === "SecondHalf")?.price || 0
                      }}
                      onChange={(prices) => {
                        const updatedMoments = selectedEvent.moments.map(moment => {
                          switch(moment.moment) {
                            case "FirstHalf":
                              return { ...moment, price: prices.firstHalf };
                            case "Halftime":
                              return { ...moment, price: prices.halftime };
                            case "SecondHalf":
                              return { ...moment, price: prices.secondHalf };
                            default:
                              return moment;
                          }
                        });
                        setSelectedEvent({
                          ...selectedEvent,
                          moments: updatedMoments
                        });
                      }}
                    />

                    {/* Attendance Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Detalles de Asistencia</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Asistencia Estimada
                          </label>
                          <input
                            type="number"
                            value={selectedEvent.estimatedAttendance}
                            onChange={(e) => setSelectedEvent({
                              ...selectedEvent,
                              estimatedAttendance: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Asistencia Estimada TV
                          </label>
                          <input
                            type="number"
                            value={selectedEvent.estimatedAttendanceTv}
                            onChange={(e) => setSelectedEvent({
                              ...selectedEvent,
                              estimatedAttendanceTv: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        icon={ChevronRight}
                        onClick={() => handleUpdateEvent(selectedEvent)}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}