import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, CheckCircle, XCircle, Clock,
  Eye, ThumbsUp, ThumbsDown, AlertTriangle, FileText,
  Monitor, Calendar, DollarSign, User, Tag, ChevronDown,
  ChevronRight, FileVideo, Image as ImageIcon, Download,
  Mail, Info
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import Select from 'react-select';
import toast from 'react-hot-toast';

interface ContentReview {
  id: string;
  orderId: string;
  title: string;
  type: 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  screen: {
    id: string;
    name: string;
    isConnected: boolean;
  };
  purchaseType: 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  spots: number;
  startDate: string;
  endDate: string;
  purchaseDate: string;
  userId: string;
  userEmail: string;
  paymentRef: string;
  preview: string;
  rejectionReason?: {
    category: string;
    description: string;
  };
}

const mockReviews: ContentReview[] = [
  {
    id: 'rev_1',
    orderId: 'ORD-2024-001',
    title: 'Summer Campaign 2024',
    type: 'video',
    status: 'pending',
    screen: {
      id: 'scr_1',
      name: 'Plaza Mayor LED',
      isConnected: true
    },
    purchaseType: 'moment',
    spots: 2,
    startDate: '2024-04-05T09:40:00Z',
    endDate: '2024-04-05T10:10:00Z',
    purchaseDate: '2024-04-04T03:24:00Z',
    userId: 'usr_abc123',
    userEmail: 'client@example.com',
    paymentRef: 'pay_xyz789',
    preview: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'rev_2',
    orderId: 'ORD-2024-002',
    title: 'Spring Collection',
    type: 'image',
    status: 'approved',
    screen: {
      id: 'scr_2',
      name: 'Santafé Premium',
      isConnected: false
    },
    purchaseType: 'daily',
    spots: 24,
    startDate: '2024-04-10T00:00:00Z',
    endDate: '2024-04-10T23:59:59Z',
    purchaseDate: '2024-04-03T15:30:00Z',
    userId: 'usr_def456',
    userEmail: 'client2@example.com',
    paymentRef: 'pay_abc123',
    preview: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200'
  }
];

const rejectionCategories = [
  { value: 'inappropriate_content', label: 'Contenido inapropiado' },
  { value: 'technical_issues', label: 'Problemas técnicos' },
  { value: 'quality_standards', label: 'No cumple estándares de calidad' },
  { value: 'trademark_violation', label: 'Violación de marca registrada' },
  { value: 'misleading_content', label: 'Contenido engañoso' }
];

export function ContentReviewAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ContentReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState({
    category: '',
    description: ''
  });

  const handleApprove = async (review: ContentReview) => {
    try {
      // If screen is not connected to Shareflow Screen
      if (!review.screen.isConnected) {
        // Download the creative for manual upload
        const link = document.createElement('a');
        link.href = review.preview;
        link.download = `${review.orderId}-creative.${review.type === 'video' ? 'mp4' : 'jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Send email notification to client
        await sendApprovalEmail(review);

        toast.success('Creative descargada y notificación enviada al cliente');
      }

      // Update review status
      // In a real app, this would be an API call
      toast.success('Contenido aprobado correctamente');
    } catch (error) {
      toast.error('Error al aprobar el contenido');
      console.error('Error approving content:', error);
    }
  };

  const sendApprovalEmail = async (review: ContentReview) => {
    // In a real app, this would be an API call to send the email
    console.log('Sending approval email to:', review.userEmail, {
      subject: 'Tu campaña ha sido aprobada',
      content: `
        Hola,
        
        Tu campaña "${review.title}" ha sido aprobada y será publicada según lo programado:
        - Fecha de inicio: ${new Date(review.startDate).toLocaleDateString()}
        - Fecha de fin: ${new Date(review.endDate).toLocaleDateString()}
        - Pantalla: ${review.screen.name}
        
        Tu contenido será publicado manualmente por nuestro equipo.
        
        Gracias por confiar en nosotros.
      `
    });
  };

  const handleReject = (reason: { category: string; description: string }) => {
    if (!selectedReview) return;

    // In a real app, this would be an API call
    console.log('Rejecting review:', selectedReview.id, reason);
    
    toast.success('Contenido rechazado correctamente');
    setIsRejectModalOpen(false);
    setSelectedReview(null);
    setRejectionReason({ category: '', description: '' });
  };

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || review.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Revisión de Contenido</h1>
            <p className="text-neutral-600">
              Gestiona y modera el contenido de los anuncios
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Pendientes</p>
                <p className="text-2xl font-semibold">
                  {mockReviews.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Aprobados</p>
                <p className="text-2xl font-semibold">
                  {mockReviews.filter(r => r.status === 'approved').length}
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
                <p className="text-sm text-neutral-600">Rechazados</p>
                <p className="text-2xl font-semibold">
                  {mockReviews.filter(r => r.status === 'rejected').length}
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
                placeholder="Buscar por título u orden..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Select
            placeholder="Estado"
            options={[
              { value: 'pending', label: 'Pendiente' },
              { value: 'approved', label: 'Aprobado' },
              { value: 'rejected', label: 'Rechazado' }
            ]}
            onChange={(option) => setSelectedStatus(option?.value || null)}
            isClearable
            className="w-[150px]"
          />
        </div>

        {/* Content List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left p-4 font-medium text-neutral-600">Contenido</th>
                  <th className="text-left p-4 font-medium text-neutral-600">Estado</th>
                  <th className="text-left p-4 font-medium text-neutral-600">Pantalla</th>
                  <th className="text-left p-4 font-medium text-neutral-600">Periodo</th>
                  <th className="text-right p-4 font-medium text-neutral-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="border-b border-neutral-200">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden">
                          <img
                            src={review.preview}
                            alt={review.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{review.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <FileText className="w-4 h-4" />
                            <span>{review.orderId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <User className="w-4 h-4" />
                            <span>{review.userEmail}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                        ${review.status === 'approved'
                          ? 'bg-success-50 text-success-600'
                          : review.status === 'rejected'
                          ? 'bg-error-50 text-error-600'
                          : 'bg-warning-50 text-warning-600'
                        }
                      `}>
                        {review.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : review.status === 'rejected' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        <span className="capitalize">
                          {review.status === 'approved' ? 'Aprobado' :
                           review.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </span>
                      {!review.screen.isConnected && review.status === 'approved' && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-warning-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Pantalla manual</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-neutral-400" />
                        <span>{review.screen.name}</span>
                      </div>
                      {!review.screen.isConnected && (
                        <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-warning-50 text-warning-600 rounded-full text-xs">
                          <Info className="w-3 h-3" />
                          No conectada
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span>
                            {new Date(review.startDate).toLocaleDateString()} -
                            {new Date(review.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Tag className="w-4 h-4" />
                          <span className="capitalize">{review.purchaseType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => {/* Handle view */}}
                        />
                        {review.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={ThumbsUp}
                              className="text-success-600 hover:bg-success-50"
                              onClick={() => handleApprove(review)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={ThumbsDown}
                              className="text-error-600 hover:bg-error-50"
                              onClick={() => {
                                setSelectedReview(review);
                                setIsRejectModalOpen(true);
                              }}
                            />
                          </>
                        )}
                        {!review.screen.isConnected && review.status === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Download}
                            onClick={() => handleApprove(review)}
                            className="text-primary hover:bg-primary-50"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {isRejectModalOpen && selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsRejectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-semibold">Rechazar Contenido</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Categoría
                    </label>
                    <Select
                      options={rejectionCategories}
                      value={rejectionCategories.find(c => c.value === rejectionReason.category)}
                      onChange={(option) => setRejectionReason(prev => ({
                        ...prev,
                        category: option?.value || ''
                      }))}
                      placeholder="Selecciona una categoría"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={rejectionReason.description}
                      onChange={(e) => setRejectionReason(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Explica la razón del rechazo..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsRejectModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ChevronRight}
                    onClick={() => handleReject(rejectionReason)}
                    disabled={!rejectionReason.category || !rejectionReason.description}
                  >
                    Confirmar Rechazo
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