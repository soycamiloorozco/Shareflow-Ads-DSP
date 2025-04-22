import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Monitor, Eye, Edit, Trash2,
  Calendar, ChevronRight, Settings, ArrowUpRight,
  TrendingUp, CheckCircle, XCircle, LayoutGrid,
  LayoutList, Clock, DollarSign, AlertCircle, Bot,
  FileVideo, Image as ImageIcon, Star, BarChart3,
  Users, Sparkles
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CreativeLibrary } from '../components/CreativeLibrary';
import Select from 'react-select';

interface Creative {
  id: string;
  name: string;
  type: 'image' | 'video';
  format: string;
  preview: string;
  uploadedAt: string;
  usageCount: number;
  performance: {
    impressions: number;
    engagement: number;
    reusageRate: number;
  };
  campaigns: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }[];
}

const mockCreatives: Creative[] = [
  {
    id: '1',
    name: 'Summer Campaign Hero',
    type: 'video',
    format: '1920x1080',
    preview: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=1200',
    uploadedAt: '2024-03-01',
    usageCount: 5,
    performance: {
      impressions: 250000,
      engagement: 85,
      reusageRate: 75
    },
    campaigns: [
      {
        id: 'camp_1',
        name: 'Summer 2024',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      }
    ]
  },
  {
    id: '2',
    name: 'Product Launch Visual',
    type: 'image',
    format: '1080x1920',
    preview: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200',
    uploadedAt: '2024-02-15',
    usageCount: 3,
    performance: {
      impressions: 180000,
      engagement: 92,
      reusageRate: 60
    },
    campaigns: [
      {
        id: 'camp_2',
        name: 'Spring Collection',
        startDate: '2024-02-15',
        endDate: '2024-04-15'
      }
    ]
  }
];

export function Biblioteca() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  const filteredCreatives = mockCreatives.filter(creative => {
    const matchesSearch = creative.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || creative.type === selectedType;
    return matchesSearch && matchesType;
  });

  const metrics = {
    totalCreatives: mockCreatives.length,
    totalImpressions: mockCreatives.reduce((sum, c) => sum + c.performance.impressions, 0),
    averageEngagement: Math.round(
      mockCreatives.reduce((sum, c) => sum + c.performance.engagement, 0) / mockCreatives.length
    ),
    mostReused: mockCreatives.reduce((max, c) => c.usageCount > max ? c.usageCount : max, 0)
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Biblioteca de Creativos</h1>
            <p className="text-neutral-600">
              Gestiona y analiza el rendimiento de tus creativos
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Subir Creativo
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Creativos</p>
                <p className="text-2xl font-semibold">{metrics.totalCreatives}</p>
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
                  {(metrics.totalImpressions / 1000).toFixed(1)}k
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Engagement Medio</p>
                <p className="text-2xl font-semibold">{metrics.averageEngagement}%</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Más Reutilizado</p>
                <p className="text-2xl font-semibold">{metrics.mostReused}x</p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar creativos..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Select
            placeholder="Tipo"
            options={[
              { value: 'image', label: 'Imágenes' },
              { value: 'video', label: 'Videos' }
            ]}
            onChange={(option) => setSelectedType(option?.value || null)}
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

        {/* Creatives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreatives.map((creative) => (
            <Card key={creative.id}>
              <div className="relative aspect-video">
                <img
                  src={creative.preview}
                  alt={creative.name}
                  className="w-full h-full object-cover rounded-t-xl"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-black/50 text-white rounded-full text-sm flex items-center gap-2">
                    {creative.type === 'video' ? (
                      <FileVideo className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    {creative.format}
                  </span>
                </div>
              </div>

              <Card.Body className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{creative.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(creative.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Monitor className="w-4 h-4" />
                      <span>{creative.campaigns.length} campañas</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Vistas</p>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-neutral-600" />
                      <span className="font-medium">
                        {(creative.performance.impressions / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Engagement</p>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-neutral-600" />
                      <span className="font-medium">
                        {creative.performance.engagement}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Reuso</p>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-neutral-600" />
                      <span className="font-medium">
                        {creative.performance.reusageRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
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
                        onClick={() => setSelectedCreative(creative)}
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

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <div className="absolute inset-0 overflow-y-auto">
              <div className="min-h-full p-4 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-5xl"
                >
                  <CreativeLibrary />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedCreative && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCreative(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <img
                  src={selectedCreative.preview}
                  alt={selectedCreative.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold">{selectedCreative.name}</h2>
                    <div className="flex items-center gap-4 text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedCreative.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>{selectedCreative.format}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm flex items-center gap-2">
                    {selectedCreative.type === 'video' ? (
                      <FileVideo className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    {selectedCreative.type === 'video' ? 'Video' : 'Imagen'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Métricas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Vistas</p>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-neutral-600" />
                          <span className="font-medium">
                            {(selectedCreative.performance.impressions / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Engagement</p>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-neutral-600" />
                          <span className="font-medium">
                            {selectedCreative.performance.engagement}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Reuso</p>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-neutral-600" />
                          <span className="font-medium">
                            {selectedCreative.performance.reusageRate}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Usos</p>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-neutral-600" />
                          <span className="font-medium">
                            {selectedCreative.usageCount}x
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Campañas</h3>
                    <div className="space-y-2">
                      {selectedCreative.campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            <span>{campaign.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => {/* Handle view campaign */}}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSelectedCreative(null)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Edit}
                    onClick={() => {/* Handle edit */}}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}