import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Calendar, Users,
  ChevronRight, 
  Target, DollarSign, 
  X} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { TeamSelector } from '../../components/admin/TeamSelector';
import { StadiumSelector } from '../../components/admin/StadiumSelector';
import { MomentPricing } from '../../components/admin/MomentPricing';
import { useTeams, Team } from '../../hooks/useTeams';
import { useStadiums, Stadium } from '../../hooks/useStadiums';
import { useSportEvents } from '../../hooks/useSportEvents';



export function SportsEventsAdmin() {

  const { createTeam, teams, listTeams } = useTeams();
  const { createStadiums, stadiums, listStadiums } = useStadiums();
  const { createSportEvent } = useSportEvents();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for new event
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    stadiumId: '',
    eventDate: '',
    eventTime: '',
    momentPrices: {
      firstHalf: 2500000,
      halftime: 1800000,
      secondHalf: 2500000,
    },
    estimatedAttendance: 0,
    broadcastChannels: ""
  });

  const handleCreateEvent = () => {
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
    createSportEvent(data);
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
                <p className="text-2xl font-semibold">12</p>
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
                <p className="text-2xl font-semibold">150+</p>
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
                <p className="text-2xl font-semibold">450k</p>
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
                <p className="text-2xl font-semibold">$2.2M</p>
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
                  <th className="text-right p-4 font-medium text-neutral-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Event rows would go here */}
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
    </div>
  );
}