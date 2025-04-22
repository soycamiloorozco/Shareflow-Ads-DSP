import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Monitor, MapPin, Users, Star,
  Eye, Edit, Trash2, Calendar, ChevronRight, Settings,
  ArrowUpRight, TrendingUp, CheckCircle, XCircle, LayoutGrid,
  LayoutList, Clock, DollarSign, AlertCircle, Bot, Wifi,
  Sparkles, Target, Zap, Info, ArrowUp, ArrowDown
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { screens } from '../../data/mockData';
import { Screen } from '../../types';
import { AddScreenModal } from '../../components/admin/AddScreenModal';
import { EditScreenForm } from '../../components/admin/EditScreenForm';
import Select from 'react-select';
import toast from 'react-hot-toast';

// Define select options with proper format
const statusOptions = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' }
];

const typeOptions = [
  { value: 'fpc', label: 'FPC' },
  { value: 'digital-billboards', label: 'Vallas Digitales' },
  { value: 'malls', label: 'Centro Comercial' },
  { value: 'info-points', label: 'Puntos de Información' }
];

export function ScreensAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: null as string | null,
    type: null as string | null
  });

  const filteredScreens = screens.filter(screen => {
    const matchesSearch = screen.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filters.status || screen.availability === (filters.status === 'active');
    const matchesType = !filters.type || screen.category.id === filters.type;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEditScreen = (screen: Screen) => {
    setSelectedScreen(screen);
    setIsEditModalOpen(true);
  };

  const handleSaveScreen = (data: any) => {
    // Handle saving screen data
    console.log('Saving screen:', data);
    toast.success('Pantalla actualizada correctamente');
    setIsEditModalOpen(false);
    setSelectedScreen(null);
  };

  // Get the current value for status select
  const getCurrentStatusValue = () => {
    if (!filters.status) return null;
    return statusOptions.find(option => option.value === filters.status) || null;
  };

  // Get the current value for type select
  const getCurrentTypeValue = () => {
    if (!filters.type) return null;
    return typeOptions.find(option => option.value === filters.type) || null;
  };

  // Calculate insights
  const insights = {
    totalScreens: filteredScreens.length,
    connectedScreens: filteredScreens.filter(s => s.pricing.deviceId).length,
    totalViews: filteredScreens.reduce((sum, s) => sum + s.views.daily, 0),
    averageEngagement: Math.round(
      filteredScreens.reduce((sum, s) => sum + s.metrics.averageEngagement, 0) / filteredScreens.length
    ),
    topPerforming: filteredScreens.sort((a, b) => b.metrics.averageEngagement - a.metrics.averageEngagement)[0],
    viewsGrowth: 15.4, // Mock data
    engagementGrowth: 8.2 // Mock data
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-primary-600 text-white overflow-hidden">
          <div className="p-6 md:p-8 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDUwMHY1MDBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwbDUwMCA1MDBNNTAwIDBMMCAzMDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] opacity-10"/>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Mis Pantallas</h1>
                  <p className="text-white/80">
                    Gestiona y optimiza tu red de pantallas digitales
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-sm text-white/80">Total Pantallas</p>
                      <p className="text-2xl font-semibold">{insights.totalScreens}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-sm text-white/80">Conectadas</p>
                      <p className="text-2xl font-semibold">{insights.connectedScreens}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-sm text-white/80">Impresiones/Día</p>
                      <p className="text-2xl font-semibold">
                        {(insights.totalViews / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-sm text-white/80">Engagement</p>
                      <p className="text-2xl font-semibold">{insights.averageEngagement}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Performance Card */}
          <Card className="col-span-2">
            <Card.Body>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Performance</h3>
                    <p className="text-sm text-neutral-600">Últimos 30 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-success-600">
                    <ArrowUp className="w-4 h-4" />
                    <span>{insights.viewsGrowth}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Vistas</p>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-neutral-600" />
                    <span className="text-2xl font-semibold">
                      {(insights.totalViews / 1000).toFixed(1)}k
                    </span>
                    <span className="text-sm text-success-600 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      {insights.viewsGrowth}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-neutral-600 mb-2">Engagement</p>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-neutral-600" />
                    <span className="text-2xl font-semibold">
                      {insights.averageEngagement}%
                    </span>
                    <span className="text-sm text-success-600 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      {insights.engagementGrowth}%
                    </span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Top Performing Screen */}
          {insights.topPerforming && (
            <Card>
              <Card.Body>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Mejor Rendimiento</h3>
                    <p className="text-sm text-neutral-600">Pantalla destacada</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={insights.topPerforming.image}
                      alt={insights.topPerforming.location}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium">{insights.topPerforming.location}</h4>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <MapPin className="w-4 h-4" />
                      <span>{insights.topPerforming.category.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-neutral-600" />
                      <span className="font-medium">
                        {(insights.topPerforming.views.daily / 1000).toFixed(1)}k
                      </span>
                      <span className="text-sm text-neutral-600">vistas/día</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ChevronRight}
                      onClick={() => handleEditScreen(insights.topPerforming)}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o ubicación..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Select
                placeholder="Estado"
                isClearable
                options={statusOptions}
                value={getCurrentStatusValue()}
                onChange={(option) => setFilters(prev => ({ ...prev, status: option?.value || null }))}
                className="w-[150px]"
              />
              <Select
                placeholder="Tipo"
                isClearable
                options={typeOptions}
                value={getCurrentTypeValue()}
                onChange={(option) => setFilters(prev => ({ ...prev, type: option?.value || null }))}
                className="w-[200px]"
              />
            </div>

            <Button
              variant="outline"
              size="lg"
              icon={viewMode === 'grid' ? LayoutList : LayoutGrid}
              onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            >
              Vista {viewMode === 'grid' ? 'Lista' : 'Grid'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Nueva Pantalla
            </Button>
          </div>
        </div>

        {/* Screens Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreens.map((screen) => (
              <Card key={screen.id} className="group hover:-translate-y-1 transition-transform duration-200">
                <div className="relative aspect-video">
                  <img
                    src={screen.image}
                    alt={screen.location}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm flex items-center gap-2
                      ${screen.pricing.deviceId
                        ? 'bg-success-50 text-success-600'
                        : 'bg-neutral-100 text-neutral-600'
                      }
                    `}>
                      <Wifi className="w-4 h-4" />
                      {screen.pricing.deviceId ? 'Conectada' : 'No Conectada'}
                    </span>
                  </div>
                </div>

                <Card.Body className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{screen.location}</h3>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <MapPin className="w-4 h-4" />
                      <span>{screen.category.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Vistas/día</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neutral-600" />
                        <span className="font-medium">
                          {(screen.views.daily / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Rating</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">{screen.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {screen.pricing.allowMoments && (
                      <span className="px-2 py-1 bg-primary-50 text-primary rounded-full text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Momentos
                      </span>
                    )}
                    {screen.pricing.allowProgrammatic && (
                      <span className="px-2 py-1 bg-primary-50 text-primary rounded-full text-xs flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        Programática
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Calendar}
                        onClick={() => {/* Handle calendar */}}
                      >
                        Calendario
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedScreen(screen)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditScreen(screen)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          className="text-error-600 hover:bg-error-50"
                          onClick={() => {/* Handle delete */}}
                        />
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium text-neutral-600">Pantalla</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Vistas/día</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Rating</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Características</th>
                    <th className="text-right p-4 font-medium text-neutral-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScreens.map((screen) => (
                    <tr key={screen.id} className="border-b border-neutral-200">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden">
                            <img
                              src={screen.image}
                              alt={screen.location}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{screen.location}</h3>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <MapPin className="w-4 h-4" />
                              <span>{screen.category.name}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`
                          px-3 py-1 rounded-full text-sm flex items-center gap-2 w-fit
                          ${screen.pricing.deviceId
                            ? 'bg-success-50 text-success-600'
                            : 'bg-neutral-100 text-neutral-600'
                          }
                        `}>
                          <Wifi className="w-4 h-4" />
                          {screen.pricing.deviceId ? 'Conectada' : 'No Conectada'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-neutral-600" />
                          <span className="font-medium">
                            {(screen.views.daily / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium">{screen.rating}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {screen.pricing.allowMoments && (
                            <span className="px-2 py-1 bg-primary-50 text-primary rounded-full text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Momentos
                            </span>
                          )}
                          {screen.pricing.allowProgrammatic && (
                            <span className="px-2 py-1 bg-primary-50 text-primary rounded-full text-xs flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              Programática
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => setSelectedScreen(screen)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEditScreen(screen)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="text-error-600 hover:bg-error-50"
                            onClick={() => {/* Handle delete */}}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Add Screen Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddScreenModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={(screenData) => {
              console.log('New screen:', screenData);
              toast.success('Pantalla añadida correctamente');
              setIsAddModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Screen Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedScreen && (
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
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-4xl bg-white rounded-2xl shadow-xl"
                >
                  <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-2xl font-semibold">Editar Pantalla</h2>
                  </div>

                  <div className="p-6">
                    <EditScreenForm
                      screen={selectedScreen}
                      onSubmit={handleSaveScreen}
                      onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedScreen(null);
                      }}
                    />
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