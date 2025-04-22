import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Monitor, MapPin, Users, Star,
  Eye, Edit, Trash2, Calendar, ChevronRight, Settings,
  ArrowUpRight, TrendingUp, CheckCircle, XCircle, LayoutGrid,
  LayoutList, Clock, DollarSign, AlertCircle, Bot
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  screens: string[];
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  spotsDelivered: number;
  totalSpots: number;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Campaign 2024',
    status: 'active',
    screens: ['Screen 1', 'Screen 2'],
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    budget: 5000000,
    spent: 2500000,
    impressions: 150000,
    spotsDelivered: 2100,
    totalSpots: 4500
  },
  {
    id: '2',
    name: 'Product Launch',
    status: 'scheduled',
    screens: ['Screen 3'],
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    budget: 3000000,
    spent: 0,
    impressions: 0,
    spotsDelivered: 0,
    totalSpots: 2000
  }
];

export function MisCampanas() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || campaign.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Mis Campañas</h1>
            <p className="text-neutral-600">
              Gestiona y monitorea tus campañas publicitarias
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={() => navigate('/create')}
          >
            Nueva Campaña
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Campañas Activas</p>
                <p className="text-2xl font-semibold">
                  {mockCampaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-success-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Impresiones</p>
                <p className="text-2xl font-semibold">
                  {(mockCampaigns.reduce((sum, c) => sum + c.impressions, 0) / 1000).toFixed(1)}k
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Presupuesto Total</p>
                <p className="text-2xl font-semibold">
                  ${(mockCampaigns.reduce((sum, c) => sum + c.budget, 0) / 1000000).toFixed(1)}M
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
                <p className="text-sm text-neutral-600">Spots Entregados</p>
                <p className="text-2xl font-semibold">
                  {mockCampaigns.reduce((sum, c) => sum + c.spotsDelivered, 0).toLocaleString()}
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar campañas..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Select
            placeholder="Estado"
            options={[
              { value: 'active', label: 'Activa' },
              { value: 'paused', label: 'Pausada' },
              { value: 'completed', label: 'Completada' },
              { value: 'scheduled', label: 'Programada' }
            ]}
            onChange={(option) => setSelectedStatus(option?.value || null)}
            isClearable
            className="w-[150px]"
          />

          <Button
            variant="outline"
            size="lg"
            icon={viewMode === 'grid' ? LayoutList : LayoutGrid}
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          >
            Vista {viewMode === 'grid' ? 'Lista' : 'Grid'}
          </Button>
        </div>

        {/* Campaigns List */}
        {viewMode === 'list' ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium text-neutral-600">Campaña</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Periodo</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Presupuesto</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Spots</th>
                    <th className="text-right p-4 font-medium text-neutral-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-neutral-200">
                      <td className="p-4">
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-neutral-600">
                            {campaign.screens.join(', ')}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                          ${campaign.status === 'active'
                            ? 'bg-success-50 text-success-600'
                            : campaign.status === 'paused'
                            ? 'bg-warning-50 text-warning-600'
                            : campaign.status === 'scheduled'
                            ? 'bg-primary-50 text-primary'
                            : 'bg-neutral-100 text-neutral-600'
                          }
                        `}>
                          {campaign.status === 'active' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : campaign.status === 'paused' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : campaign.status === 'scheduled' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="capitalize">{campaign.status}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            <span>
                              {new Date(campaign.startDate).toLocaleDateString()} -
                              {new Date(campaign.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                          </p>
                          <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {campaign.spotsDelivered.toLocaleString()} / {campaign.totalSpots.toLocaleString()}
                          </p>
                          <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success-500 rounded-full"
                              style={{ width: `${(campaign.spotsDelivered / campaign.totalSpots) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Bot}
                            onClick={() => {/* Handle AI insights */}}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => {/* Handle view */}}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => {/* Handle edit */}}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <Card.Body className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                      ${campaign.status === 'active'
                        ? 'bg-success-50 text-success-600'
                        : campaign.status === 'paused'
                        ? 'bg-warning-50 text-warning-600'
                        : campaign.status === 'scheduled'
                        ? 'bg-primary-50 text-primary'
                        : 'bg-neutral-100 text-neutral-600'
                      }
                    `}>
                      {campaign.status === 'active' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : campaign.status === 'paused' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : campaign.status === 'scheduled' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="capitalize">{campaign.status}</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Pantallas</p>
                      <div className="flex flex-wrap gap-2">
                        {campaign.screens.map((screen) => (
                          <span
                            key={screen}
                            className="px-2 py-1 bg-neutral-100 rounded-lg text-sm"
                          >
                            {screen}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Periodo</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm">
                          {new Date(campaign.startDate).toLocaleDateString()} -
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Presupuesto</p>
                      <div className="space-y-2">
                        <p className="font-medium">
                          ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                        </p>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Spots</p>
                      <div className="space-y-2">
                        <p className="font-medium">
                          {campaign.spotsDelivered.toLocaleString()} / {campaign.totalSpots.toLocaleString()}
                        </p>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success-500 rounded-full"
                            style={{ width: `${(campaign.spotsDelivered / campaign.totalSpots) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Bot}
                      onClick={() => {/* Handle AI insights */}}
                    >
                      Insights
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => {/* Handle view */}}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => {/* Handle edit */}}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}