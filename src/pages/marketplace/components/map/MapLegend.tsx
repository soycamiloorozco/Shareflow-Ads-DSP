/**
 * MapLegend Component
 * Shows the color coding legend for Indoor/Outdoor screens
 */

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-gray-700"
        aria-label="Mostrar leyenda del mapa"
      >
        <Info className="w-4 h-4" />
        <span className="hidden sm:inline">Leyenda</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Legend Panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Tipos de Pantallas
            </h3>
            
            <div className="space-y-3">
              {/* Indoor Screens */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm flex-shrink-0"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Pantallas Interior
                  </div>
                  <div className="text-xs text-gray-500">
                    Centros comerciales, aeropuertos, estaciones
                  </div>
                </div>
              </div>
              
              {/* Outdoor Screens */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm flex-shrink-0"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Pantallas Exterior
                  </div>
                  <div className="text-xs text-gray-500">
                    Vallas, estadios, espacios públicos
                  </div>
                </div>
              </div>
              
              {/* Selected Screen */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm flex-shrink-0"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Pantalla Seleccionada
                  </div>
                  <div className="text-xs text-gray-500">
                    Pantalla actualmente seleccionada
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <p className="mb-1">
                  • Haz clic en cualquier marcador para ver detalles
                </p>
                <p>
                  • Usa los filtros para refinar tu búsqueda
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapLegend;