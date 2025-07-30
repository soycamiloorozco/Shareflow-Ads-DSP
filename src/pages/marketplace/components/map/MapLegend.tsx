/**
 * MapLegend Component
 * Displays legend and information about the map
 */

import React from 'react';
import { Navigation } from 'lucide-react';

interface MapLegendProps {
  totalScreens: number;
  className?: string;
}

export function MapLegend({ totalScreens, className = '' }: MapLegendProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-3 ${className}`}>
      {/* Map info */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Navigation className="w-4 h-4" />
        <span>{totalScreens} pantallas disponibles</span>
      </div>

      {/* Legend */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Leyenda</h4>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div>
            <span className="text-gray-600">Pantallas interiores</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></div>
            <span className="text-gray-600">Pantallas exteriores</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapLegend;