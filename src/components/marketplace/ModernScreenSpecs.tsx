import React from 'react';
import { 
  Monitor, 
  Smartphone, 
  Clock, 
  Cpu
} from 'lucide-react';
import { Screen } from '../../types';

interface ScreenSpecsProps {
  screen: Screen;
}

export function ModernScreenSpecs({ screen }: ScreenSpecsProps) {
  // Determinar la orientación de la pantalla
  const getOrientation = (specs: Screen["specs"]): string => {
    if (specs.orientation) {
      // Normalizar posibles valores del API
      if (typeof specs.orientation === 'string') {
        if (specs.orientation.toLowerCase() === 'portrait' || specs.orientation.toLowerCase() === 'vertical') {
          return 'Vertical';
        }
        if (specs.orientation.toLowerCase() === 'landscape' || specs.orientation.toLowerCase() === 'horizontal') {
          return 'Horizontal';
        }
        // Si viene otro valor, mostrarlo capitalizado
        return specs.orientation.charAt(0).toUpperCase() + specs.orientation.slice(1);
      }
    }
    // Fallback: inferir por dimensiones
    return specs.width > specs.height ? 'Horizontal' : 'Vertical';
  };

  // Calcular resolución en píxeles (estimación basada en dimensiones y calidad)
  const getResolutionPixels = (width: number, height: number, resolution: string): string => {
    // Mapeo aproximado basado en resolución estándar
    if (resolution.includes('4K')) return '3840 × 2160 pixels';
    if (resolution.includes('2K') || resolution.includes('QHD')) return '2560 × 1440 pixels';
    if (resolution.includes('Full HD') || resolution.includes('1080')) return '1920 × 1080 pixels';
    if (resolution.includes('HD')) return '1280 × 720 pixels';
    
    // Fallback basado en dimensiones (aproximación)
    const aspectRatio = width / height;
    if (aspectRatio > 1.5) {
      // Horizontal
      if (width >= 300) return '3840 × 2160 pixels';
      if (width >= 200) return '1920 × 1080 pixels';
      return '1280 × 720 pixels';
    } else {
      // Vertical
      if (height >= 300) return '2160 × 3840 pixels';
      if (height >= 200) return '1080 × 1920 pixels';
      return '720 × 1280 pixels';
    }
  };

  // Especificaciones técnicas esenciales
  const essentialSpecs = [
    {
      icon: Cpu,
      title: 'Resolución',
      //value: getResolutionPixels(screen.specs.width, screen.specs.height, screen.specs.resolution),
      value: '',
      description: `Calidad ${screen.specs.resolution}`
    },
    {
      icon: Clock,
      title: 'Horario',
      value: `${screen.operatingHours?.start || "00:00"} - ${screen.operatingHours?.end || "23:59"}`,
      description: 'Disponibilidad diaria'
    },
    {
      icon: Smartphone,
      title: 'Orientación',
      value: getOrientation(screen.specs),
      description: '' // Removido el texto de dimensiones
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-6">
      {/* Header simple */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Especificaciones</h2>
      </div>
      
      {/* Especificaciones - Layout más simple */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-4 sm:space-y-6">
          {essentialSpecs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div key={index} className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{spec.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{spec.value}</p>
                  <p className="text-xs text-gray-500">{spec.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 