import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Screen } from '../../types';

interface ScreenReviewsProps {
  screen: Screen;
}

// Datos de ejemplo para reseñas
const mockReviews = [
  {
    id: 'rev1',
    author: 'Alejandro Martínez',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: '2023-10-15',
    rating: 5,
    text: 'Excelente pantalla con alta visibilidad. Nuestra campaña tuvo un gran impacto y recibimos muchos comentarios positivos. La ubicación es perfecta para nuestro público objetivo.',
    likes: 12
  },
  {
    id: 'rev2',
    author: 'Carolina Gómez',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    date: '2023-09-28',
    rating: 4,
    text: 'Buena opción para publicidad. El proceso de reserva fue sencillo y el equipo de atención al cliente muy profesional. Los resultados fueron positivos aunque esperaba un poco más de engagement.',
    likes: 8
  },
  {
    id: 'rev3',
    author: 'Marcos Pérez',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    date: '2023-08-12',
    rating: 5,
    text: 'Pantalla en una ubicación estratégica. Altamente recomendable para campañas que requieren alta visibilidad. El ROI ha sido excelente y definitivamente volveremos a utilizarla.',
    likes: 15
  }
];

const ScreenReviews: React.FC<ScreenReviewsProps> = ({ screen }) => {
  const [reviews] = useState(mockReviews);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const reviewInputRef = useRef<HTMLTextAreaElement>(null);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', {
      text: reviewText,
      rating: userRating,
      screenId: screen.id
    });
    
    setIsReviewModalOpen(false);
    setReviewText('');
    setUserRating(5);
  };

  const handleStarClick = (rating: number) => {
    setUserRating(rating);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-6">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Reseñas</h2>
          <button 
            onClick={() => setIsReviewModalOpen(true)} 
            className="text-sm font-medium text-gray-900 underline hover:text-gray-700 transition-colors"
          >
            Escribir reseña
          </button>
        </div>
      </div>
      
      {/* Resumen de calificaciones - Simplificado */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </motion.div>
            <span className="text-lg font-semibold text-gray-900">{screen.rating}</span>
          </div>
          <span className="text-sm text-gray-600">·</span>
          <span className="text-sm text-gray-600">{screen.reviews} reseñas</span>
        </div>
      </div>
      
      {/* Lista de reseñas - Más simple */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-3">
                <img 
                  src={review.avatar} 
                  alt={review.author} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{review.author}</h3>
                    <span className="text-sm text-gray-500">·</span>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <Star 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ver más reseñas - Más simple */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-t border-gray-200">
        <button className="text-sm font-medium text-gray-900 underline hover:text-gray-700 transition-colors">
          Mostrar las {screen.reviews} reseñas
        </button>
      </div>
      
      {/* Modal para escribir reseña - Más simple */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Escribir reseña</h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">Tu calificación</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => handleStarClick(i + 1)}
                      className="p-1 hover:scale-110 transition-transform"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <Star 
                          className={`w-6 h-6 ${i < userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="reviewText" className="block text-sm font-medium text-gray-900 mb-3">
                  Tu reseña
                </label>
                <textarea
                  id="reviewText"
                  ref={reviewInputRef}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Comparte tu experiencia..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!reviewText.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScreenReviews; 