import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, Clock, 
  Eye, FileText,
  X, AlertCircle, FileImage,
  FileVideo, Image as ImageIcon, 
  CheckCircle, XCircle,  
  Tag, Download
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import toast from 'react-hot-toast';
import { useMomentPurchases } from '../../hooks/useMomentPurchases';
import { PurchasedSportMomentCard } from '../../components/admin/PurchasedSportMomentCard';

export function ContentReviewAdmin() {
  const { getPurchaseMoments, purchasedMoments, approvePurchaseMoments, rejectPurchaseMoments } = useMomentPurchases();
  
  // State management simplificado
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    getPurchaseMoments()
  }, []);

  // Filter submissions para eventos deportivos
  const filteredSubmissionsSportEvents = purchasedMoments
    .filter(submission => {
      const matchesSearch = !searchQuery || 
        submission.stadium.name.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'pending' && submission.status === 0) ||
        (activeTab === 'approved' && submission.status === 1) ||
        (activeTab === 'rejected' && submission.status === 2);
        
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  const aprovedSportEvent = (id: string) => {
    approvePurchaseMoments(id);
    getPurchaseMoments();
  }

  const rejectSportEvent = async (id: string, data: {
    rejectionCategory: string;
    rejectionReason: string
  }) => {
    await rejectPurchaseMoments(id, data);
    await getPurchaseMoments();
  }

  // Count submissions by status
  const submissionCounts = {
    pending: purchasedMoments.filter(s => s.status === 0).length,
    approved: purchasedMoments.filter(s => s.status === 1).length,
    rejected: purchasedMoments.filter(s => s.status === 2).length,
    total: purchasedMoments.length
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header simplificado */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#353FEF]/10 rounded-xl flex items-center justify-center">
                <FileImage className="w-6 h-6 text-[#353FEF]" />
                </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Revisión de Contenido
                </h1>
                <p className="text-neutral-600 text-sm">
                  Gestiona y revisa el contenido de eventos deportivos
                </p>
            </div>
                </div>
            
            {/* Stats cards simplificadas */}
            <div className="flex gap-4">
              <div className="bg-orange-50 px-4 py-3 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                <div>
                    <p className="text-sm font-semibold text-orange-900">{submissionCounts.pending}</p>
                    <p className="text-xs text-orange-600">Pendientes</p>
                </div>
              </div>
            </div>
            
              <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100">
              <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                    <p className="text-sm font-semibold text-green-900">{submissionCounts.approved}</p>
                    <p className="text-xs text-green-600">Aprobados</p>
                </div>
              </div>
            </div>
            </div>
                </div>
              </div>
            </div>
            
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Barra de filtros simplificada */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por estadio o evento..."
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
        </div>
      </div>

            {/* Status tabs simplificados */}
            <div className="flex gap-2">
              <button
              onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all' 
                    ? 'bg-[#353FEF] text-white' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
                Todos ({submissionCounts.total})
              </button>
            
              <button
              onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pending' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
                Pendientes ({submissionCounts.pending})
              </button>
            
              <button
              onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'approved' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
                Aprobados ({submissionCounts.approved})
              </button>
            
              <button
              onClick={() => setActiveTab('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'rejected' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
                Rechazados ({submissionCounts.rejected})
              </button>
          </div>
                </div>
              </div>

        {/* Content Grid simplificado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissionsSportEvents.length > 0 ? (
              filteredSubmissionsSportEvents.map((submission, key) => (
                <PurchasedSportMomentCard
                  key={key}
                  submission={submission}
                  aprovedSportEvent={() => aprovedSportEvent(submission.id)}
                  rejectSportEvent={rejectSportEvent}
                />
              ))
            ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-neutral-100">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-neutral-400" />
                </div>
              <h3 className="text-lg font-semibold mb-2 text-neutral-900">No hay contenido para revisar</h3>
              <p className="text-neutral-500 text-center max-w-md">
                {searchQuery 
                  ? `No se encontraron resultados para "${searchQuery}"`
                  : activeTab === 'all' 
                    ? 'No hay contenido disponible en este momento.'
                    : `No hay contenido ${activeTab === 'pending' ? 'pendiente' : activeTab === 'approved' ? 'aprobado' : 'rechazado'}.`
                }
              </p>
              {searchQuery && (
                            <Button
                              variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                            >
                  Limpiar búsqueda
                            </Button>
              )}
                            </div>
                          )}
                        </div>
                      </div>
    </div>
  );
} 