import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Monitor, MapPin, Users, Star,
  Eye, Edit, Trash2, Calendar, ChevronRight, Settings,
  ArrowUpRight, TrendingUp, CheckCircle, XCircle, Play,
  Pause, StopCircle, FileVideo, Image as ImageIcon,
  BarChart3, Clock, DollarSign, RefreshCcw, FileSpreadsheet,
  LayoutGrid, LayoutList, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface Ad {
  id: string;
  title: string;
  type: 'image' | 'video';
  status: 'active' | 'paused' | 'completed';
  screens: string[];
  startDate: string;
  endDate: string;
  views: number;
  engagement: number;
  preview: string;
  duration: string;
}

const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Summer Campaign 2024',
    type: 'video',
    status: 'active',
    screens: ['screen-1', 'screen-2'],
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    views: 125000,
    engagement: 85,
    preview: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=1200',
    duration: '15s'
  },
  {
    id: '2',
    title: 'Spring Collection',
    type: 'image',
    status: 'paused',
    screens: ['screen-3'],
    startDate: '2024-02-15',
    endDate: '2024-04-15',
    views: 98000,
    engagement: 72,
    preview: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200',
    duration: '10s'
  }
];

export function CmsAdmin() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const filteredAds = mockAds.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || ad.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const metrics = {
    totalAds: filteredAds.length,
    activeAds: filteredAds.filter(ad => ad.status === 'active').length,
    totalViews: filteredAds.reduce((sum, ad) => sum + ad.views, 0),
    averageEngagement: Math.round(
      filteredAds.reduce((sum, ad) => sum + ad.engagement, 0) / filteredAds.length
    )
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Gestor de Contenido</h1>
            <p className="text-neutral-600">
              Administra el contenido de tus pantallas digitales
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              icon={RefreshCcw}
              onClick={() => {/* Handle sync */}}
            >
              Sincronizar
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={FileSpreadsheet}
              onClick={() => {/* Handle export */}}
            >
              Exportar
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Nuevo Contenido
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
                <p className="text-sm text-neutral-600">Total Anuncios</p>
                <p className="text-2xl font-semibold">{metrics.totalAds}</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-success-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Activos</p>
                <p className="text-2xl font-semibold">{metrics.activeAds}</p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Vistas</p>
                <p className="text-2xl font-semibold">
                  {(metrics.totalViews / 1000).toFixed(1)}k
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
                placeholder="Buscar contenido..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Select
            placeholder="Estado"
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'paused', label: 'Pausado' },
              { value: 'completed', label: 'Completado' }
            ]}
            onChange={(option) => setSelectedStatus(option?.value || null)}
            isClearable
            className="w-[200px]"
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

        {/* Content Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <Card key={ad.id}>
                <div className="relative aspect-video">
                  <img
                    src={ad.preview}
                    alt={ad.title}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm flex items-center gap-2
                      ${ad.status === 'active'
                        ? 'bg-success-50 text-success-600'
                        : ad.status === 'paused'
                        ? 'bg-warning-50 text-warning-600'
                        : 'bg-error-50 text-error-600'
                      }
                    `}>
                      {ad.status === 'active' ? (
                        <Play className="w-4 h-4" />
                      ) : ad.status === 'paused' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <StopCircle className="w-4 h-4" />
                      )}
                      <span className="capitalize">{ad.status}</span>
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/50 text-white rounded-full text-sm flex items-center gap-2">
                      {ad.type === 'video' ? (
                        <FileVideo className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      {ad.duration}
                    </span>
                  </div>
                </div>

                <Card.Body className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{ad.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ad.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Monitor className="w-4 h-4" />
                        <span>{ad.screens.length} pantallas</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Vistas</p>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-neutral-600" />
                        <span className="font-medium">
                          {(ad.views / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Engagement</p>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-neutral-600" />
                        <span className="font-medium">{ad.engagement}%</span>
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
                          onClick={() => setSelectedAd(ad)}
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
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium text-neutral-600">Contenido</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Pantallas</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Vistas</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Engagement</th>
                    <th className="text-right p-4 font-medium text-neutral-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.map((ad) => (
                    <tr key={ad.id} className="border-b border-neutral-200">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden">
                            <img
                              src={ad.preview}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{ad.title}</h3>
                            <p className="text-sm text-neutral-600">
                              {new Date(ad.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                          ${ad.status === 'active'
                            ? 'bg-success-50 text-success-600'
                            : ad.status === 'paused'
                            ? 'bg-warning-50 text-warning-600'
                            : 'bg-error-50 text-error-600'
                          }
                        `}>
                          {ad.status === 'active' ? (
                            <Play className="w-4 h-4" />
                          ) : ad.status === 'paused' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <StopCircle className="w-4 h-4" />
                          )}
                          <span className="capitalize">{ad.status}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-neutral-400" />
                          <span>{ad.screens.length} pantallas</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-neutral-400" />
                          <span>{(ad.views / 1000).toFixed(1)}k</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-neutral-400" />
                          <span>{ad.engagement}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => setSelectedAd(ad)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Create Content Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateContentModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={(data) => {
              console.log('New content:', data);
              setIsCreateModalOpen(false);
              toast.success('Contenido creado correctamente');
            }}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedAd && (
          <PreviewModal
            ad={selectedAd}
            onClose={() => setSelectedAd(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface CreateContentModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function CreateContentModal({ onClose, onSubmit }: CreateContentModalProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      // Handle file upload
      console.log('Uploaded files:', acceptedFiles);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-semibold">Nuevo Contenido</h2>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Título
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa un título para tu contenido"
              />
            </div>

            <div {...getRootProps()} className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <p className="text-neutral-600">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Formatos soportados: JPG, PNG, MP4
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Pantallas
              </label>
              <Select
                isMulti
                placeholder="Selecciona las pantallas"
                options={[
                  { value: 'screen-1', label: 'Plaza Mayor LED' },
                  { value: 'screen-2', label: 'Santafé Premium' },
                  { value: 'screen-3', label: 'Poblado Digital' }
                ]}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de fin
                </label>
                <input
                  type="date"
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
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={ChevronRight}
              onClick={() => onSubmit({})}
            >
              Crear Contenido
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface PreviewModalProps {
  ad: Ad;
  onClose: () => void;
}

function PreviewModal({ ad, onClose }: PreviewModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
            src={ad.preview}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">{ad.title}</h2>
              <div className="flex items-center gap-4 text-neutral-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(ad.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{ad.duration}</span>
                </div>
              </div>
            </div>
            <span className={`
              px-3 py-1 rounded-full text-sm flex items-center gap-2
              ${ad.status === 'active'
                ? 'bg-success-50 text-success-600'
                : ad.status === 'paused'
                ? 'bg-warning-50 text-warning-600'
                : 'bg-error-50 text-error-600'
              }
            `}>
              {ad.status === 'active' ? (
                <Play className="w-4 h-4" />
              ) : ad.status === 'paused' ? (
                <Pause className="w-4 h-4" />
              ) : (
                <StopCircle className="w-4 h-4" />
              )}
              <span className="capitalize">{ad.status}</span>
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
                      {(ad.views / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Engagement</p>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-neutral-600" />
                    <span className="font-medium">{ad.engagement}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Pantallas</h3>
              <div className="space-y-2">
                {ad.screens.map((screenId) => (
                  <div
                    key={screenId}
                    className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-neutral-400" />
                      <span>Screen {screenId}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => {/* Handle view screen */}}
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
              onClick={onClose}
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
  );
}