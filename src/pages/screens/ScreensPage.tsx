import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Monitor, MapPin, Users, Star,
  Eye, Edit, Trash2, Calendar, ChevronRight, Settings,
  ArrowUpRight, TrendingUp, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { screens } from '../../data/mockData';
import { Screen } from '../../types';

export function ScreensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Mis Pantallas</h1>
            <p className="text-neutral-600">
              Gestiona tus pantallas digitales
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              icon={Settings}
              onClick={() => {/* Handle settings */}}
            >
              Configuración
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={Plus}
              onClick={() => {/* Handle new screen */}}
            >
              Nueva Pantalla
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Pantallas</p>
                <p className="text-2xl font-semibold">{filteredScreens.length}</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Activas</p>
                <p className="text-2xl font-semibold">
                  {filteredScreens.filter(s => s.availability).length}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-error-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-error-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Inactivas</p>
                <p className="text-2xl font-semibold">
                  {filteredScreens.filter(s => !s.availability).length}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Ocupación Media</p>
                <p className="text-2xl font-semibold">85%</p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
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

          <Button
            variant="outline"
            size="lg"
            icon={Filter}
            onClick={() => {/* Handle filters */}}
          >
            Filtros
          </Button>

          <Button
            variant="outline"
            size="lg"
            icon={viewMode === 'grid' ? Monitor : List}
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          >
            Vista {viewMode === 'grid' ? 'Lista' : 'Grid'}
          </Button>
        </div>

        {/* Screens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <Card key={screen.id}>
              <div className="relative aspect-video">
                <img
                  src={screen.image}
                  alt={screen.location}
                  className="w-full h-full object-cover rounded-t-xl"
                />
                <div className="absolute top-4 right-4">
                  <span className={`
                    px-3 py-1 rounded-full text-sm
                    ${screen.availability
                      ? 'bg-success-50 text-success-600'
                      : 'bg-error-50 text-error-600'
                    }
                  `}>
                    {screen.availability ? 'Activa' : 'Inactiva'}
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
                        onClick={() => {/* Handle edit */}}
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
      </div>
    </div>
  );
}