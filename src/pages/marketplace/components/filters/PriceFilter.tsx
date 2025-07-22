import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Check, X } from 'lucide-react';
import { FilterOption } from '../../types';

interface PriceFilterProps {
  selectedRanges: string[];
  onRangesChange: (ranges: string[]) => void;
  availableRanges: FilterOption[];
  className?: string;
  'aria-label'?: string;
}

export const PriceFilter = React.memo<PriceFilterProps>(({
  selectedRanges,
  onRangesChange,
  availableRanges,
  className = '',
  'aria-label': ariaLabel = 'Price filter'
}) => {
  const handleRangeToggle = useCallback((rangeId: string) => {
    if (selectedRanges.includes(rangeId)) {
      onRangesChange(selectedRanges.filter(id => id !== rangeId));
    } else {
      onRangesChange([...selectedRanges, rangeId]);
    }
  }, [selectedRanges, onRangesChange]);

  const handleClearAll = useCallback(() => {
    onRangesChange([]);
  }, [onRangesChange]);

  const handleSelectAll = useCallback(() => {
    const allRangeIds = availableRanges.filter(range => range.count > 0).map(range => range.id);
    onRangesChange(allRangeIds);
  }, [availableRanges, onRangesChange]);

  const availableRangesWithScreens = availableRanges.filter(range => range.count > 0);

  return (
    <div className={`space-y-4 ${className}`} aria-label={ariaLabel}>
      {/* Selected Ranges Display */}
      {selectedRanges.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Rangos seleccionados ({selectedRanges.length})
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedRanges.map((rangeId) => {
                const range = availableRanges.find(r => r.id === rangeId);
                if (!range) return null;
                
                return (
                  <motion.span
                    key={rangeId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-full"
                  >
                    <span className="text-sm">{range.emoji || '💰'}</span>
                    <span>{range.label}</span>
                    <button
                      onClick={() => handleRangeToggle(rangeId)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${range.label} from selection`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {availableRangesWithScreens.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {availableRangesWithScreens.length} rangos de precio disponibles
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-[#353FEF] hover:text-[#2A32C5] font-medium"
              disabled={selectedRanges.length === availableRangesWithScreens.length}
            >
              Seleccionar todos
            </button>
          </div>
        </div>
      )}

      {/* Price Ranges Grid */}
      <div className="space-y-2">
        {availableRangesWithScreens.length > 0 ? (
          availableRangesWithScreens.map((range, index) => {
            const isSelected = selectedRanges.includes(range.id);
            
            return (
              <motion.button
                key={range.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleRangeToggle(range.id)}
                disabled={range.count === 0}
                className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                  range.count === 0
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : isSelected
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
                aria-pressed={isSelected}
                aria-disabled={range.count === 0}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    range.count === 0
                      ? 'bg-gray-200'
                      : isSelected 
                      ? 'bg-green-100' 
                      : 'bg-gray-100'
                  }`}>
                    <span className="text-lg" aria-hidden="true">
                      {range.emoji || '💰'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{range.label}</div>
                    <div className="text-sm opacity-75">
                      {range.count} {range.count === 1 ? 'pantalla' : 'pantallas'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Popular badge for ranges with many screens */}
                  {range.count > 20 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                  
                  {/* Best value badge for mid-range options */}
                  {range.id === 'mid-range' && range.count > 10 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      Mejor valor
                    </span>
                  )}
                  
                  {/* Selection indicator */}
                  {isSelected && range.count > 0 && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay rangos de precio disponibles</p>
          </div>
        )}
      </div>

      {/* Price Range Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Sobre los precios
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Los precios mostrados son por hora y pueden variar según la demanda, 
              horario y duración de la campaña. Los rangos incluyen descuentos por volumen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PriceFilter.displayName = 'PriceFilter';