import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Upload, RefreshCcw, FileSpreadsheet,
  Monitor, MapPin, Wifi, Clock, DollarSign, BarChart3,
  Eye, Edit, Trash2, Calendar, Image as ImageIcon, X,
  AlertCircle, Info, TrendingUp, Users, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { RequireAuth } from '../../components/RequireAuth';
import Select from 'react-select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DOOHScreen {
  id: string;
  name: string;
  location: string;
  type: string;
  resolution: string;
  status: 'active' | 'maintenance' | 'reserved';
  spotPrice: number;
  availability: number;
  deviceId: string;
  lastPing: string;
  photos: string[];
  timeConfig: {
    startHour: string;
    endHour: string;
    disabledDays: string[];
  };
  revenue: {
    total: number;
    breakdown: {
      momentos: number;
      bundles: number;
      programmatic: number;
      external: number;
      direct: number;
    };
    history: Array<{
      date: string;
      value: number;
    }>;
  };
  performance: {
    fillRate: number;
    averageCPM: number;
    impressions: number;
  };
}

const mockScreens: DOOHScreen[] = [
  {
    id: 'SCR001',
    name: 'Plaza Mayor LED',
    location: 'Calle 50 #53-23, Medellín',
    type: 'urban',
    resolution: '4K',
    status: 'active',
    spotPrice: 250000,
    availability: 85,
    deviceId: 'DEVICE_001',
    lastPing: '2024-03-19T15:30:00Z',
    photos: [
      'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200'
    ],
    timeConfig: {
      startHour: '06:00',
      endHour: '22:00',
      disabledDays: []
    },
    revenue: {
      total: 15000000,
      breakdown: {
        momentos: 5000000,
        bundles: 4000000,
        programmatic: 3000000,
        external: 2000000,
        direct: 1000000
      },
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 500000) + 300000
      }))
    },
    performance: {
      fillRate: 75,
      averageCPM: 12000,
      impressions: 50000
    }
  },
  {
    id: 'SCR002',
    name: 'Santafé Premium',
    location: 'Cra. 43A #7 Sur-170, Medellín',
    type: 'retail',
    resolution: '4K',
    status: 'maintenance',
    spotPrice: 180000,
    availability: 95,
    deviceId: 'DEVICE_003',
    lastPing: '2024-03-19T15:29:00Z',
    photos: [
      'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200'
    ],
    timeConfig: {
      startHour: '10:00',
      endHour: '21:00',
      disabledDays: []
    },
    revenue: {
      total: 12000000,
      breakdown: {
        momentos: 4000000,
        bundles: 3000000,
        programmatic: 2500000,
        external: 1500000,
        direct: 1000000
      },
      history: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 400000) + 200000
      }))
    },
    performance: {
      fillRate: 85,
      averageCPM: 10000,
      impressions: 35000
    }
  }
];

const metrics = {
  totalScreens: mockScreens.length,
  totalImpressions: mockScreens.reduce((sum, screen) => sum + screen.performance.impressions, 0),
  projectedRevenue: mockScreens.reduce((sum, screen) => sum + screen.revenue.total, 0),
  screensByType: {
    urban: mockScreens.filter(s => s.type === 'urban').length,
    retail: mockScreens.filter(s => s.type === 'retail').length,
    stadium: mockScreens.filter(s => s.type === 'stadium').length
  }
};

export function InventoryAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<DOOHScreen | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: null as string | null,
    type: null as string | null,
    performance: null as 'high' | 'medium' | 'low' | null
  });

  const handleExportCSV = () => {
    const csv = filteredScreens
      .map(screen => [
        screen.id,
        screen.name,
        screen.location,
        screen.type,
        screen.status,
        screen.revenue.total,
        screen.performance.fillRate,
        screen.performance.averageCPM
      ].join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSyncDevices = async () => {
    // Implement device sync
    console.log('Syncing with device network...');
  };

  const filteredScreens = mockScreens.filter(screen => {
    const matchesSearch = screen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         screen.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filters.status || screen.status === filters.status;
    const matchesType = !filters.type || screen.type === filters.type;
    
    let matchesPerformance = true;
    if (filters.performance) {
      const fillRate = screen.performance.fillRate;
      switch (filters.performance) {
        case 'high':
          matchesPerformance = fillRate >= 80;
          break;
        case 'medium':
          matchesPerformance = fillRate >= 50 && fillRate < 80;
          break;
        case 'low':
          matchesPerformance = fillRate < 50;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesPerformance;
  });

  return (
    <RequireAuth allowedRoles={['super_admin', 'ads_admin']}>
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Inventario DOOH</h1>
              <p className="text-neutral-600">
                Gestión de pantallas conectadas a Shareflow Screen
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                icon={RefreshCcw}
                onClick={handleSyncDevices}
              >
                Sincronizar
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={FileSpreadsheet}
                onClick={handleExportCSV}
              >
                Exportar
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <Card.Body className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Pantallas Conectadas</p>
                  <p className="text-2xl font-semibold">{metrics.totalScreens}</p>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Impresiones/Día</p>
                  <p className="text-2xl font-semibold">
                    {(metrics.totalImpressions / 1000).toFixed(1)}k
                  </p>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Ingresos (30d)</p>
                  <p className="text-2xl font-semibold">
                    ${(metrics.projectedRevenue / 1000000).toFixed(1)}M
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
                  <p className="text-sm text-neutral-600">Fill Rate Promedio</p>
                  <p className="text-2xl font-semibold">
                    {Math.round(
                      mockScreens.reduce((sum, s) => sum + s.performance.fillRate, 0) / mockScreens.length
                    )}%
                  </p>
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

            <div className="w-48">
              <Select
                placeholder="Estado"
                options={[
                  { value: 'active', label: 'Activa' },
                  { value: 'maintenance', label: 'Mantenimiento' },
                  { value: 'reserved', label: 'Reservada' }
                ]}
                onChange={(option) => setFilters(prev => ({
                  ...prev,
                  status: option?.value || null
                }))}
                isClearable
                className="text-sm"
              />
            </div>

            <div className="w-48">
              <Select
                placeholder="Tipo"
                options={[
                  { value: 'urban', label: 'Urbana' },
                  { value: 'retail', label: 'Retail' },
                  { value: 'stadium', label: 'Estadio' }
                ]}
                onChange={(option) => setFilters(prev => ({
                  ...prev,
                  type: option?.value || null
                }))}
                isClearable
                className="text-sm"
              />
            </div>

            <div className="w-48">
              <Select
                placeholder="Performance"
                options={[
                  { value: 'high', label: 'Alto (>80%)' },
                  { value: 'medium', label: 'Medio (50-80%)' },
                  { value: 'low', label: 'Bajo (<50%)' }
                ]}
                onChange={(option) => setFilters(prev => ({
                  ...prev,
                  performance: option?.value as typeof filters.performance || null
                }))}
                isClearable
                className="text-sm"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium text-neutral-600">Pantalla</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Ubicación</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Fill Rate</th>
                    <th className="text-left p-4 font-medium text-neutral-600">CPM Promedio</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Ingresos (30d)</th>
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
                              src={screen.photos[0]}
                              alt={screen.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{screen.name}</h3>
                            <div className="flex items-center gap-2">
                              <Wifi className={`w-4 h-4 ${
                                screen.status === 'active'
                                  ? 'text-success-500'
                                  : 'text-neutral-300'
                              }`} />
                              <span className="text-sm text-neutral-600">
                                {screen.deviceId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          <span>{screen.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${screen.performance.fillRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {screen.performance.fillRate}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          ${screen.performance.averageCPM.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          ${(screen.revenue.total / 1000000).toFixed(1)}M
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => {
                              setSelectedScreen(screen);
                              setIsDetailOpen(true);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Calendar}
                            onClick={() => {
                              // Navigate to calendar view
                            }}
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

        {/* Detail Panel */}
        <AnimatePresence>
          {isDetailOpen && selectedScreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsDetailOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Detalles de Pantalla
                      </h2>
                      <button
                        onClick={() => setIsDetailOpen(false)}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">
                      {/* Revenue Chart */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Ingresos (Últimos 30 días)
                        </h3>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedScreen.revenue.history}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tickFormatter={(value) => value.split('-')[2]}
                              />
                              <YAxis
                                tickFormatter={(value) => 
                                  `$${(value / 1000000).toFixed(1)}M`
                                }
                              />
                              <Tooltip
                                formatter={(value: number) => 
                                  `$${value.toLocaleString()}`
                                }
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#353FEF"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Revenue Breakdown */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Desglose de Ingresos
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(selectedScreen.revenue.breakdown).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="capitalize">{key}</span>
                                  <span className="font-medium">
                                    ${(value / 1000000).toFixed(1)}M
                                  </span>
                                </div>
                                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{
                                      width: `${(value / selectedScreen.revenue.total) * 100}%`
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Métricas de Performance
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <Card.Body>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="font-medium">Fill Rate</span>
                              </div>
                              <p className="text-2xl font-semibold">
                                {selectedScreen.performance.fillRate}%
                              </p>
                            </Card.Body>
                          </Card>
                          <Card>
                            <Card.Body>
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <span className="font-medium">CPM</span>
                              </div>
                              <p className="text-2xl font-semibold">
                                ${selectedScreen.performance.averageCPM.toLocaleString()}
                              </p>
                            </Card.Body>
                          </Card>
                          <Card>
                            <Card.Body>
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="font-medium">Impresiones</span>
                              </div>
                              <p className="text-2xl font-semibold">
                                {selectedScreen.performance.impressions.toLocaleString()}
                              </p>
                            </Card.Body>
                          </Card>
                        </div>
                      </div>

                      {/* Technical Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Información Técnica
                        </h3>
                        <Card>
                          <Card.Body>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-neutral-600">Device ID</p>
                                <p className="font-mono">{selectedScreen.deviceId}</p>
                              </div>
                              <div>
                                <p className="text-sm text-neutral-600">Último Ping</p>
                                <p className="font-medium">
                                  {new Date(selectedScreen.lastPing).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-neutral-600">Resolución</p>
                                <p className="font-medium">{selectedScreen.resolution}</p>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsDetailOpen(false)}
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RequireAuth>
  );
}