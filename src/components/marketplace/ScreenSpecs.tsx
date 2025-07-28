import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  Play, 
  Sun, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Calendar,
  Zap,
  Eye,
  Shield,
  Settings,
  FileImage,
  Video,
  Palette,
  Activity
} from 'lucide-react';
import { Screen } from '../../types';

interface ScreenSpecsProps {
  screen: Screen;
}

const ScreenSpecs: React.FC<ScreenSpecsProps> = ({ screen }) => {
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  
  // Determinar la orientación de la pantalla
  const getOrientation = (width: number, height: number): string => {
    return width > height ? 'Landscape (Horizontal)' : 'Portrait (Vertical)';
  };

  const specs = [
    {
      icon: Monitor,
      iconBg: 'from-orange-100 to-amber-100',
      iconColor: 'text-orange-600',
      title: 'Tipo de pantalla',
      value: screen.category.name,
      description: screen.environment === 'indoor' ? 'Interior' : 'Exterior'
    },
    {
      icon: Play,
      iconBg: 'from-blue-100 to-indigo-100',
      iconColor: 'text-blue-600',
      title: 'Resolución',
      value: screen.specs.resolution,
      description: `${screen.specs.width} × ${screen.specs.height} pixels`
    },
    {
      icon: Clock,
      iconBg: 'from-rose-100 to-pink-100',
      iconColor: 'text-rose-600',
      title: 'Horario de operación',
      value: `${screen.operatingHours?.start || "00:00"} - ${screen.operatingHours?.end || "23:59"}`,
      description: 'Horario disponible'
    },
    {
      icon: Sun,
      iconBg: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600',
      title: 'Brillo',
      value: screen.specs.brightness,
      description: 'Luminosidad máxima'
    },
    {
      icon: Smartphone,
      iconBg: 'from-purple-100 to-violet-100',
      iconColor: 'text-purple-600',
      title: 'Orientación',
      value: getOrientation(screen.specs.width, screen.specs.height),
      description: 'Formato de pantalla'
    },
    {
      icon: Calendar,
      iconBg: 'from-teal-100 to-cyan-100',
      iconColor: 'text-teal-600',
      title: 'Días activos',
      value: 'Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo',
      description: '7 días a la semana'
    }
  ];

  const advancedSpecs = [
    { label: 'Dimensiones físicas', value: '480 × 270 cm', icon: Monitor },
    { label: 'Tipo de panel', value: 'LED Full Color', icon: Palette },
    { label: 'Pitch (densidad)', value: '10mm', icon: Eye },
    { label: 'Ángulo de visión', value: '160° horizontal', icon: Activity },
    { label: 'Frecuencia de actualización', value: '60Hz', icon: Zap },
    { label: 'Consumo de energía', value: '1200W máximo', icon: Zap },
    { label: 'Protección ambiental', value: 'IP65 resistente', icon: Shield },
    { label: 'Acceso para mantenimiento', value: 'Frontal y posterior', icon: Settings }
  ];

  const supportedFormats = [
    { name: 'JPG/JPEG', type: 'Imagen', icon: FileImage, color: 'bg-blue-500' },
    { name: 'PNG', type: 'Imagen', icon: FileImage, color: 'bg-green-500' },
    { name: 'MP4', type: 'Video', icon: Video, color: 'bg-red-500' },
    { name: 'MOV', type: 'Video', icon: Video, color: 'bg-purple-500' },
    { name: 'GIF', type: 'Animación', icon: Play, color: 'bg-orange-500' }
  ];

  return (
    <div className="mb-8">
      {/* Header con gradiente */}
      <div className="relative bg-gradient-to-r from-slate-50 to-gray-100 rounded-t-3xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Especificaciones Técnicas</h2>
            <p className="text-gray-600">Detalles técnicos completos de esta pantalla digital</p>
          </div>
        <button 
          onClick={() => setShowAllSpecs(!showAllSpecs)}
            className="group flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm"
        >
            <span className="text-gray-700 group-hover:text-blue-600 font-medium">
              {showAllSpecs ? 'Ver menos' : 'Ver todas'}
            </span>
          {showAllSpecs ? (
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
          ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
          )}
        </button>
        </div>
      </div>
      
      {/* Especificaciones principales */}
      <div className="bg-white border-l border-r border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                {/* Fondo con gradiente sutil */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"></div>
              
                <div className="relative">
                  {/* Icono con gradiente */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${spec.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${spec.iconColor}`} />
            </div>
            
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{spec.title}</h3>
                  <p className="text-lg font-bold text-gray-900 mb-1">{spec.value}</p>
                  <p className="text-sm text-gray-600">{spec.description}</p>
                </div>
              </motion.div>
            );
          })}
                </div>
              </div>
              
      {/* Especificaciones avanzadas */}
          <AnimatePresence>
            {showAllSpecs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
              >
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 border-l border-r border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                    </div>
                Especificaciones avanzadas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {advancedSpecs.map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                        <span className="text-gray-700 font-medium">{spec.label}</span>
                    </div>
                      <span className="text-gray-900 font-bold">{spec.value}</span>
                    </motion.div>
                  );
                })}
                    </div>
                    
              {/* Formatos compatibles */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <FileImage className="w-3 h-3 text-white" />
                  </div>
                  Formatos compatibles
                </h4>
                    
                <div className="flex flex-wrap gap-3">
                  {supportedFormats.map((format, index) => {
                    const Icon = format.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className={`w-8 h-8 rounded-lg ${format.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                    </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{format.name}</p>
                          <p className="text-xs text-gray-600">{format.type}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      
      {/* Footer con bordes redondeados */}
      <div className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-b-3xl p-1 border-l border-r border-b border-gray-200">
        <div className="h-2"></div>
      </div>
    </div>
  );
};

export default ScreenSpecs; 