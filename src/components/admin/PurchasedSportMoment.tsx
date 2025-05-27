import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileVideo, Image as ImageIcon, RadioTower, Tag, Download } from 'lucide-react';
import { Card } from '../Card';
import { PurchasedMoment } from '../../hooks/useMomentPurchases';


interface Screen {
  id: string;
  name: string;
  isConnected: boolean;
  resolution: string;
  aspectRatio: string;
  location?: string;
}

interface ContentSubmission {
  id: string;
  orderId: string;
  title: string;
  type: 'image' | 'video';
  status: number;
  screen: Screen;
  purchaseType: 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  spots: number;
  startDate: string;
  endDate: string;
  purchaseDate: string;
  reference: string; // Anonymous reference code instead of user details
  preview: string;
  format: string;
  size: string;
  duration?: string;
  isDownloaded: boolean;
  aiAnalysis?: {
    isCompliant: boolean;
    confidence: number;
    issues: string[];
    recommendations: string[];
    textPercentage?: number; // Add text percentage field
  };
  rejectionReason?: {
    category: string;
    description: string;
  };
}

interface PurchasedMomentCardProps {
  submission: ContentSubmission;
}


export function PurchasedMomentCard({ submission }: PurchasedMomentCardProps) {
  return (
    <motion.div
                  key={submission.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden h-full bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200">
                    <div className="relative aspect-video">
                      <img 
                        src={submission.preview}
                        alt={submission.title}
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
                          ${submission.screen.isConnected
                            ? 'bg-[#353FEF]/90 text-white'
                            : 'bg-[#8C52FF]/90 text-white'
                          }``
                        `}>
                          {submission.screen.isConnected ? (
                            <RadioTower className="w-3 h-3" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>
                            {submission.screen.isConnected ? 'Conectada' : 'Manual'}
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
                        <h3 className="font-bold text-lg text-white line-clamp-1">{submission.title}</h3>
                        <p className="text-sm text-white/80 line-clamp-1">{submission.screen.name}</p>
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
                              {new Date(submission.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {new Date(submission.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400 mb-1">Referencia</p>
                          <div className="flex items-center text-sm">
                            <Tag className="w-4 h-4 text-[#353FEF] mr-1.5" />
                            <span className="text-neutral-700 font-medium">{submission.reference}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {submission.purchaseType}
                          </p>
                        </div>
                      </div>

                      {/* AI analysis badge if available - more subtle */}
                      {submission.aiAnalysis && (
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
                      )}

                      {/* Download status for manual screens - cleaner */}
                      {!submission.screen.isConnected && submission.status === 1 && (
                        <div className={`mb-4 p-3 rounded-xl text-xs ${submission.isDownloaded ? 'bg-[#F1FFE2] text-[#2C652B]' : 'bg-[#F5F1FF] text-[#8C52FF]'}`}>
                          <div className="flex items-center">
                            {submission.isDownloaded ? (
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
                      )}

                      {/* Rejection reason if rejected - cleaner */}
                      {submission.status === 2 && submission.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
                          <div className="flex items-start">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium mb-0.5">Rechazo: {submission.rejectionReason.category}</p>
                              <p className="line-clamp-2">{submission.rejectionReason.description}</p>
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
                              onClick={() => handleOpenPreviewModal(submission)}
                            >
                              Detalles
                            </Button>
                          </motion.div>
                          
                          {/* Download button for manual screens that are approved */}
                          {!submission.screen.isConnected && submission.status === 1 && !submission.isDownloaded && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Download}
                                className="h-8 rounded-xl text-[#8C52FF] border-[#8C52FF]/20 hover:bg-[#F5F1FF]"
                                onClick={() => handleOpenDownloadModal(submission)}
                              >
                                Descargar
                              </Button>
                            </motion.div>
                          )}
                          
                          {/* Quick approve/reject for pending submissions */}
                          {submission.status === 0 && (
                            <div className="flex gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#F44336] border border-neutral-200 hover:border-[#F44336] hover:bg-[#F44336]/5"
                                onClick={() => handleOpenRejectModal(submission)}
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
  );
} 