import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScreenGridProps } from '../../types';
import { ScreenCard } from './ScreenCard';
import { CircuitCard } from './CircuitCard';

export const ScreenGrid = React.memo<ScreenGridProps>(({
  screens,
  circuits,
  onScreenSelect,
  onFavoriteChange,
  loading = false,
  viewMode = 'grid',
  className = '',
  'aria-label': ariaLabel = 'Grid of available screens'
}) => {
  const handleScreenSelect = useCallback((screen: any) => {
    onScreenSelect(screen);
  }, [onScreenSelect]);

  const handleFavoriteChange = useCallback(() => {
    onFavoriteChange?.();
  }, [onFavoriteChange]);

  if (loading) {
    return (
      <div 
        className={`grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${className}`}
        aria-label={`${ariaLabel} (loading)`}
        aria-busy="true"
      >
        {[...Array(8)].map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
          >
            <div className="aspect-[4/3] bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (screens.length === 0 && circuits.length === 0) {
    return (
      <div 
        className={`text-center py-16 sm:py-20 ${className}`}
        aria-label={`${ariaLabel} (no results)`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No se encontraron pantallas</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            No hay pantallas disponibles que coincidan con tus filtros actuales. 
            Intenta ajustar los criterios de búsqueda para encontrar más opciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors"
            >
              Recargar página
            </button>
            <button 
              onClick={() => onFavoriteChange?.()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${className}`}
      aria-label={ariaLabel}
    >
      {/* Render circuits first */}
      {circuits.map((circuit, index) => (
        <motion.div
          key={`circuit-${circuit[0]?.id}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="md:col-span-2 lg:col-span-2 xl:col-span-2"
        >
          <CircuitCard 
            circuit={circuit}
            onSelect={handleScreenSelect}
          />
        </motion.div>
      ))}
      
      {/* Then render individual screens */}
      {screens.map((screen, index) => (
        <motion.div
          key={screen.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: (circuits.length + index) * 0.05 }}
        >
          <ScreenCard 
            screen={screen}
            index={index}
            onSelect={handleScreenSelect}
            onFavoriteChange={handleFavoriteChange}
          />
        </motion.div>
      ))}
    </div>
  );
});

ScreenGrid.displayName = 'ScreenGrid';