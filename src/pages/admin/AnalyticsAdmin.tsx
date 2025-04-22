import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, DollarSign, Clock, Calendar,
  ArrowUpRight, ArrowDownRight, Eye, Monitor,
  ChevronDown, Filter, Download, RefreshCcw
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Select from 'react-select';

// Mock data for charts
const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  revenue: Math.floor(Math.random() * 500000) + 300000,
  impressions: Math.floor(Math.random() * 50000) + 30000
}));

const performanceData = Array.from({ length: 12 }, (_, i) => ({
  name: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
  occupancy: Math.floor(Math.random() * 30) + 70,
  engagement: Math.floor(Math.random() * 20) + 60
}));

const audienceData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  traffic: Math.floor(Math.random() * 1000) + 500
}));

export function AnalyticsAdmin() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);

  const metrics = {
    revenue: {
      value: 12500000,
      change: 15.4,
      trend: 'up'
    },
    impressions: {
      value: 1250000,
      change: 8.2,
      trend: 'up'
    },
    occupancy: {
      value: 85,
      change: -2.1,
      trend: 'down'
    },
    screens: {
      value: 45,
      change: 0,
      trend: 'neutral'
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Analytics</h1>
            <p className="text-neutral-600">
              Monitorea el desempeño de tus pantallas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              icon={RefreshCcw}
              onClick={() => {/* Handle refresh */}}
            >
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={Download}
              onClick={() => {/* Handle export */}}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            placeholder="Todas las pantallas"
            isMulti
            options={[
              { value: 'screen-1', label: 'Plaza Mayor LED' },
              { value: 'screen-2', label: 'Santafé Premium' },
              { value: 'screen-3', label: 'Poblado Digital' }
            ]}
            onChange={(selected) => setSelectedScreens(
              selected ? selected.map(s => s.value) : []
            )}
            className="min-w-[250px]"
          />

          <Select
            value={{ value: dateRange, label: {
              '7d': 'Últimos 7 días',
              '30d': 'Últimos 30 días',
              '90d': 'Últimos 90 días'
            }[dateRange]}}
            options={[
              { value: '7d', label: 'Últimos 7 días' },
              { value: '30d', label: 'Últimos 30 días' },
              { value: '90d', label: 'Últimos 90 días' }
            ]}
            onChange={(option) => option && setDateRange(option.value)}
            className="w-[200px]"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { 
              title: 'Ingresos',
              value: `$${(metrics.revenue.value / 1000000).toFixed(1)}M`,
              change: metrics.revenue.change,
              icon: DollarSign
            },
            {
              title: 'Impresiones',
              value: `${(metrics.impressions.value / 1000).toFixed(1)}k`,
              change: metrics.impressions.change,
              icon: Eye
            },
            {
              title: 'Ocupación',
              value: `${metrics.occupancy.value}%`,
              change: metrics.occupancy.change,
              icon: TrendingUp
            },
            {
              title: 'Pantallas Activas',
              value: metrics.screens.value,
              change: metrics.screens.change,
              icon: Monitor
            }
          ].map((metric, index) => (
            <Card key={index}>
              <Card.Body className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className={`
                    flex items-center gap-1 text-sm
                    ${metric.change > 0 ? 'text-success-600' : 
                      metric.change < 0 ? 'text-error-600' : 
                      'text-neutral-600'}
                  `}>
                    {metric.change > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : metric.change < 0 ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : null}
                    <span>{Math.abs(metric.change)}%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-1">{metric.value}</h3>
                <p className="text-sm text-neutral-600">{metric.title}</p>
              </Card.Body>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card>
            <Card.Body>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Ingresos</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Filter}
                >
                  Filtrar
                </Button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2F80ED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2F80ED"
                      fillOpacity={1}
                      fill="url(#revenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          {/* Performance Chart */}
          <Card>
            <Card.Body>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Rendimiento</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Filter}
                >
                  Filtrar
                </Button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="occupancy" fill="#2F80ED" />
                    <Bar dataKey="engagement" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Audience Insights */}
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Insights de Audiencia</h3>
              <Button
                variant="ghost"
                size="sm"
                icon={Filter}
              >
                Filtrar
              </Button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={audienceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour"
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="traffic"
                    stroke="#2F80ED"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}