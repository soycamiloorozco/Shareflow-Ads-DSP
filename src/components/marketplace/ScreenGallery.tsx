import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, Heart, Share2, Camera, Eye } from 'lucide-react';

interface ScreenGalleryProps {
  screen: {
    id: string;
    name: string;
    image: string;
    images?: string[];
  };
}

export function ScreenGallery({ screen }: ScreenGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Crear array de imágenes: la imagen principal + las imágenes adicionales
  const allImages = screen.images && screen.images.length > 0 
    ? screen.images 
    : [screen.image]; // Fallback a la imagen principal si no hay array

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <>
      {/* Galería Principal - Sin contenedor adicional */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Imagen Principal */}
        <motion.div 
          className="relative h-80 sm:h-96 md:h-[500px] cursor-pointer group"
          onClick={() => openModal(currentImageIndex)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={allImages[currentImageIndex]}
            alt={`${screen.name} - Foto ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          />
          
          {/* Overlay con efectos */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
          </div>

          {/* Overlay con zoom icon - Más visible */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomIn className="w-6 h-6 text-gray-700" />
            </motion.div>
          </div>

          {/* Controles de navegación - Más elegantes */}
          {allImages.length > 1 && (
            <>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-80 hover:opacity-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-80 hover:opacity-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </motion.button>
            </>
          )}

          {/* Indicador de número de fotos - Más elegante */}
          {allImages.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Botones de acción - Más bonitos */}
          <div className="absolute top-4 left-4 flex gap-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                // Lógica para compartir
              }}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* Thumbnails - Más visibles */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-xl p-3">
              {allImages.map((image: string, index: number) => (
                <motion.button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-white scale-110 shadow-lg' 
                      : 'hover:ring-1 hover:ring-white/50 opacity-70 hover:opacity-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Galería - Más elaborado */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            {/* Botón cerrar */}
            <motion.button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Imagen modal */}
            <motion.div 
              className="relative max-w-6xl max-h-full w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <img
                src={allImages[modalImageIndex]}
                alt={`${screen.name} - Foto ${modalImageIndex + 1}`}
                className="max-w-full max-h-full object-contain mx-auto rounded-lg shadow-2xl"
              />

              {/* Controles de navegación en modal */}
              {allImages.length > 1 && (
                <>
                  <motion.button
                    onClick={prevModalImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-7 h-7 text-white" />
                  </motion.button>

                  <motion.button
                    onClick={nextModalImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-7 h-7 text-white" />
                  </motion.button>
                </>
              )}

              {/* Indicador en modal */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {modalImageIndex + 1} / {allImages.length}
              </div>
            </motion.div>

            {/* Thumbnails en modal */}
            {allImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-2xl">
                <div className="flex gap-3 justify-center overflow-x-auto pb-2">
                  {allImages.map((image: string, index: number) => (
                    <motion.button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-200 ${
                        index === modalImageIndex 
                          ? 'ring-2 ring-white scale-110 shadow-lg' 
                          : 'hover:ring-1 hover:ring-white/50 opacity-60 hover:opacity-100'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 