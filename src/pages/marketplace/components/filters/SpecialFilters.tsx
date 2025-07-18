import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Grid3X3 } from 'lucide-react';

interface SpecialFiltersProps {
  showFavoritesOnly: boolean;
  showCircuits: boolean;
  onShowFavoritesChange: (show: boolean) => void;
  onShowCircuitsChange: (show: boolean) => void;
  className?: string;
}

export const SpecialFilters = React.memo<SpecialFiltersProps>(({
  showFavoritesOnly,
  showCircuits,
  onShowFavoritesChange,
  onShowCircuitsChange,
  className = ''
}) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Ocultar circuitos */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onShowCircuitsChange(!showCircuits)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all min-h-[44px] ${
          !showCircuits
            ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
        <span>Ocultar circuitos</span>
      </motion.button>

      {/* Solo favoritos */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onShowFavoritesChange(!showFavoritesOnly)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all min-h-[44px] ${
          showFavoritesOnly
            ? 'bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
        }`}
      >
        <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
        <span>Solo favoritos</span>
      </motion.button>
    </div>
  );
});

SpecialFilters.displayName = 'SpecialFilters';