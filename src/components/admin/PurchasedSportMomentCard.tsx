import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileVideo, Image as ImageIcon, Download, Eye, X, Castle, Shield, Info, RadioTower } from 'lucide-react';
import { Card } from '../Card';
import { PurchasedMoment } from '../../hooks/useMomentPurchases';
import { constants } from '../../config/constants';
import { Button } from '../Button';
import { useState } from 'react';
import estadioImage from '../../assets/crowd.png';
import toast from 'react-hot-toast';

interface PurchasedMomentCardProps {
  submission: PurchasedMoment;
  aprovedSportEvent: () => void;
  rejectSportEvent: (id: string, data: {
    rejectionCategory: string;
    rejectionReason: string
  }) => void;
}

export function PurchasedSportMomentCard({ submission, aprovedSportEvent, rejectSportEvent}: PurchasedMomentCardProps) {

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PurchasedMoment | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

   const [rejectReason, setRejectReason] = useState({
    category: '',
    description: ''
  });

  const handleOpenPreviewSportModal = (submission: PurchasedMoment) => {
    setSelectedSubmission(submission);
    setIsPreviewModalOpen(true);
  };

  const handleApproveSubmission = (submission: PurchasedMoment) => { 
    aprovedSportEvent();
    toast.success(`Contenido "${submission.stadium.name}" aprobado correctamente`);
    setIsPreviewModalOpen(false);
     handleOpenDownloadModal(submission);
  }

  const handleOpenDownloadModal = (submission: PurchasedMoment) => {
    setSelectedSubmission(submission);
    setIsDownloadModalOpen(true);
  };

  const handleOpenRejectModal = (submission: PurchasedMoment) => {
   
    setSelectedSubmission(submission);
    setIsRejectModalOpen(true);
    };
  
    const handleRejectSubmission = () => {
    if (!selectedSubmission || !rejectReason.category || !rejectReason.description) return;
    
      // Simulating API call to reject submission
       rejectSportEvent(submission.id, {
         rejectionCategory: rejectReason.category,
         rejectionReason: rejectReason.description
       });
    toast.success(`Contenido "${submission.stadium.name}" rechazado correctamente`);
    setIsRejectModalOpen(false);
    setRejectReason({ category: '', description: '' });
    };
  

  return (
    <>
     <motion.div
      key={submission.id}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200">
        <div className="relative aspect-video">
          <img 
            src={`${constants.base_path}${submission.stadium.photos[0].photoPath}`}
            alt={submission.stadium.name}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Combined top-right status indicator */}
          <div className="absolute top-3 right-3">
            <div className="flex flex-col gap-2 items-end">
              {/* Status badge - simplified */}
              <span className={`
                px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm
                ${submission.status === 1
                  ? 'bg-[#ABFAA9]/90 text-[#2C652B]'
                  : submission.status === 2
                  ? 'bg-[#F44336]/90 text-white'
                  : 'bg-[#FF9800]/90 text-white'
                }
              `}>
                {submission.status === 1 ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : submission.status === 2 ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                <span>
                  {submission.status === 1 ? 'Aprobado' :
                    submission.status === 2 ? 'Rechazado' : 'Pendiente'}
                </span>
              </span>
            </div>
          </div>
          
          {/* Connectivity status - moved to bottom left */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className={`
              px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 backdrop-blur-sm
             bg-[#353FEF]/90 text-white
            `}>
               <Download className="w-3 h-3" />
              <span>
                Manual
              </span>
            </span>
            
            {/* Content type - simplified */}
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs flex items-center gap-1">
              {submission.type === 'video' ? (
                <FileVideo className="w-3 h-3" />
              ) : (
                <ImageIcon className="w-3 h-3" />
              )}
              <span>{submission.type}</span>
            </span>
          </div>
          
          {/* Title at bottom - improved readability */}
          <div className="absolute bottom-12 left-0 right-0 p-4">
            <h3 className="font-bold text-lg text-white line-clamp-1">{submission.stadium.name}</h3>
            <p className="text-sm text-white/80 line-clamp-1">{submission.homeTeam} vs { submission.awayTeam}</p>
          </div>
        </div>

        <Card.Body className="p-5">
          {/* Essential information in a cleaner layout */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-neutral-400 mb-1">Fecha</p>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 text-[#353FEF] mr-1.5" />
                <span className="text-neutral-700 font-medium">
                  {new Date(submission.eventDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {new Date(submission.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Referencia</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                moment
              </p>
            </div>
          </div>

          {/* AI analysis badge if available - more subtle */}
          {/* {submission.aiAnalysis && (
            <motion.button 
              className={`w-full mb-4 p-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm
                ${submission.aiAnalysis.isCompliant
                  ? 'bg-[#F1FFE2] text-[#2C652B]'
                  : 'bg-amber-50 text-amber-700'
                }
              `}
              onClick={() => handleOpenAIAnalysisModal(submission)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bot className="w-3.5 h-3.5" />
              <div className="flex-1 text-left">
                <span className="font-medium">Análisis IA: </span>
                <span>{submission.aiAnalysis.confidence}% Match</span>
              </div>
              {submission.type === 'image' && submission.aiAnalysis.textPercentage && (
                <div className="flex items-center gap-1">
                  <span>Texto: </span>
                  <span className={submission.aiAnalysis.textPercentage > 30 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                    {submission.aiAnalysis.textPercentage}%
                  </span>
                </div>
              )}
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )} */}

          {/* Download status for manual screens - cleaner */}
          
            <div className={`mb-4 p-3 rounded-xl text-xs ${submission.status === 1 ? 'bg-[#F1FFE2] text-[#2C652B]' : 'bg-[#F5F1FF] text-[#8C52FF]'}`}>
              <div className="flex items-center">
                {submission.status === 1 ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span>Contenido descargado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span className="font-medium">Requiere descarga</span>
                  </>
                )}
              </div>
            </div>
          

          {/* Rejection reason if rejected - cleaner */}
          {submission.status === 2 && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
              <div className="flex items-start">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-medium mb-0.5">Rechazo: { submission.rejectionCategory}</p>
                  <p className="line-clamp-2">{ submission.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-end gap-2">
              {/* Action buttons based on status and connection - simplified */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  className="h-8 rounded-xl border-neutral-200 hover:border-[#353FEF] hover:text-[#353FEF]"
                  onClick={() => handleOpenPreviewSportModal(submission)}
                >
                  Detalles
                </Button>
              </motion.div>
              
              
              {/* Quick approve/reject for pending submissions */}
              {submission.status === 0 && (
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#F44336] border border-neutral-200 hover:border-[#F44336] hover:bg-[#F44336]/5"
                      onClick={() => {
                      handleOpenRejectModal(submission)
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#2C652B] border border-neutral-200 hover:border-[#ABFAA9] hover:bg-[#F1FFE2]"
                      onClick={() => handleApproveSubmission(submission)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      </motion.div>
      
       {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsPreviewModalOpen(false)}
          >

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden">
                
                <div className="absolute top-4 right-4 z-20">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="rounded-full h-10 w-10 flex items-center justify-center bg-black/40 border-none text-white hover:bg-black/60"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                  <img
                    src={estadioImage}
                    alt="Stadium"
                    className="w-full h-full object-cover opacity-75"
                  />

                  {/* LED Board Container */}
                  <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black/80">
                    {submission.type === 'video' ? (
                      <video
                        src={`${constants.base_path}${submission.filePath}`}
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                       src={`${constants.base_path}${submission.filePath}`}
                        alt="Creative Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Mockup Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-neutral-900/10" />
                </div>
                

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`
                    px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm
                    ${selectedSubmission.status === 1
                      ? 'bg-[#00C853]/90 text-white'
                      : selectedSubmission.status === 2
                      ? 'bg-[#F44336]/90 text-white'
                      : 'bg-[#FF9800]/90 text-white'
                    }
                  `}>
                    {selectedSubmission.status === 1 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : selectedSubmission.status === 2 ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="capitalize">
                      {selectedSubmission.status === 1 ? 'Aprobado' :
                       selectedSubmission.status === 2 ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </span>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      window.open(`${constants.base_path}${selectedSubmission.filePath}`, '_blank');
                    }}
                    className={`
                      px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm
                      bg-blue-500/90 text-white cursor-pointer
                    `}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                     Manual
                    </span>
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedSubmission.stadium.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      {selectedSubmission.type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-[#FF2B67]" />
                      ) : (
                        <FileVideo className="w-4 h-4 text-[#FF2B67]" />
                      )}
                      <span>
                       
                      </span>
                      <span className="px-1.5 text-neutral-400">{ selectedSubmission.homeTeam} VS { selectedSubmission.awayTeam}</span>
                     
                    </div>
                    
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-neutral-700">Detalles del contenido</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#FF2B67]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Castle className="w-5 h-5 text-[#FF2B67]" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Estadio</p>
                          <p className="text-sm font-medium">{submission.stadium.name}</p>
                          
                         
                        </div>
                      </div>
                       <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#FF2B67]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-[#FF2B67]" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Fecha de publicación</p>
                          <p className="text-sm font-medium">{new Date(submission.eventDate).toLocaleDateString()}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(submission.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           
                           
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#FF2B67]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-[#FF2B67]" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Equipos</p>
                          <p className="text-sm font-medium">{submission.homeTeam} vs { submission.awayTeam}</p>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {submission.status === 2 &&
                     <div>
                        <h3 className="text-sm font-medium mb-3 text-neutral-700">Motivo de rechazo</h3>
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                          <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium mb-1">Categoría: { submission.rejectionCategory}</p>
                              <p className="text-sm">{ submission.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
                 <div className="pt-4 border-t border-neutral-200">
                  <div className="flex gap-3 justify-end">
                    {selectedSubmission.status === 0 && (
                      <>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                            icon={XCircle}
                            onClick={() => {
                              setIsPreviewModalOpen(false);
                             setIsRejectModalOpen(true);
                            }}
                          >
                            Rechazar
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50 rounded-xl"
                            icon={CheckCircle}
                            onClick={() => handleApproveSubmission(submission)}
                          >
                            Aprobar
                          </Button>
                        </motion.div>
                      </>
                    )}
                    
                    {/* Manual download button for approved content */}
                    
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                          icon={Download}
                        onClick={() => {
                             window.open(`${constants.base_path}${selectedSubmission.filePath}`, '_blank');
                            // setIsPreviewModalOpen(false);
                            // handleOpenDownloadModal(selectedSubmission);
                          }}
                        >
                          Descargar
                        </Button>
                      </motion.div>
                  
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="primary"
                        className="bg-[#FF2B67] hover:bg-[#E0195A] rounded-xl"
                        onClick={() => setIsPreviewModalOpen(false)}
                      >
                        Cerrar
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              
              
            </motion.div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsDownloadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Descargar Contenido</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDownloadModalOpen(false)}
                    className="rounded-full h-8 w-8 flex items-center justify-center bg-neutral-100 border-none text-neutral-600 hover:bg-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-[#8C52FF]/10 rounded-full flex items-center justify-center">
                      <Download className="w-8 h-8 text-[#8C52FF]" />
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Pantalla Manual Detectada</h3>
                    <p className="text-neutral-600">
                      Has aprobado contenido para una pantalla no conectada. Es necesario descargar 
                      el archivo para su implementación manual en tu sistema de pantallas.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[#F5F1FF] rounded-xl mb-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-[#8C52FF] mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#8C52FF] font-medium mb-1">Sobre pantallas manuales</p>
                        <p className="text-xs text-[#8C52FF]/80">
                          Las pantallas no conectadas requieren que descargues el contenido e 
                          implementes manualmente en tu sistema. Asegúrate de publicar el contenido 
                          en la fecha y hora programadas.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resaltar información de compra */}
                  <div className="bg-[#353FEF]/5 p-4 rounded-xl mb-4 border border-[#353FEF]/20">
                    <h4 className="text-sm font-medium mb-2 text-[#353FEF]">Información de Compra</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-neutral-500 mb-1">Tipo de compra</p>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#353FEF]/10 rounded-full">
                            <Calendar className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <p className="font-medium text-lg">
                            Minutos
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-neutral-500 mb-1">Momentos adquiridos</p>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#353FEF]/10 rounded-full">
                            <RadioTower className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <p className="font-medium text-lg">{submission.purchaseDetails.length}</p>
                          <br/>
                          <p>
                            {submission.purchaseDetails.map((item) => {
                              return `${item.momentId} - ${item.minutes}\n`
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <h4 className="font-medium text-sm">{submission.stadium.name}</h4>
                        <p className="text-xs text-neutral-500">{submission.homeTeam} vs {submission.awayTeam}</p>
                      </div>
                    </div>

                    {/* Detalles de la orden */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <h5 className="text-sm font-medium mb-2">Detalles de la orden</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                       
                        <div>
                          <p className="text-neutral-500">Referencia:</p>
                          <p className="font-medium">{submission.paymentId}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Estadio:</p>
                          <p className="font-medium">{submission.stadium.name}</p>
                        </div>
                       
                        <div>
                          <p className="text-neutral-500">Fecha:</p>
                          <p className="font-medium">{new Date(submission.eventDate).toLocaleString()}</p>
                        </div>
                       
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl"
                      onClick={() => setIsDownloadModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      className="bg-[#8C52FF] hover:bg-[#7542E5] rounded-xl"
                      icon={Download}
                      onClick={() =>  window.open(`${constants.base_path}${selectedSubmission.filePath}`, '_blank')}
                    >
                      Descargar Archivo
                    </Button>
                  </motion.div>
                </div>

                {/* Botón para descargar el resumen de la orden */}
                <div className="mt-4 pt-4 border-t border-neutral-200 text-center">
                  <p className="text-sm text-neutral-600 mb-3">¿Necesitas un resumen para tu implementación?</p>
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {isRejectModalOpen && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsRejectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Rechazar Contenido</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRejectModalOpen(false)}
                    className="rounded-full h-8 w-8 flex items-center justify-center bg-neutral-100 border-none text-neutral-600 hover:bg-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img src={`${constants.base_path}${submission.filePath}`}  className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{submission.stadium.name}</h4>
                      <p className="text-xs text-neutral-500">{submission.homeTeam} vs {submission.awayTeam}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">
                        Categoría del rechazo
                      </label>
                      <select
                        value={rejectReason.category}
                        onChange={(e) => setRejectReason(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent text-sm"
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="inappropriate">Contenido inapropiado</option>
                        <option value="legibility">Problemas de legibilidad</option>
                        <option value="quality">Baja calidad visual</option>
                        <option value="text-percentage">Exceso de texto (&gt;30%)</option>
                        <option value="other">Otro motivo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">
                        Descripción detallada
                      </label>
                      <textarea
                        value={rejectReason.description}
                        onChange={(e) => setRejectReason(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Explica por qué rechazas este contenido para que el usuario pueda corregirlo..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent text-sm resize-none h-32"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl"
                      onClick={() => setIsRejectModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="primary"
                      className="bg-[#F44336] hover:bg-[#D32F2F] rounded-xl"
                      icon={XCircle}
                      disabled={!rejectReason.category || !rejectReason.description}
                      onClick={handleRejectSubmission}
                    >
                      Confirmar Rechazo
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 