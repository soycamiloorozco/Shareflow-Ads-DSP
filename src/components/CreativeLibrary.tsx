import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon,
  FileVideo,
  Upload,
  X,
  Info,
  Eye,
  Clock,
  Calendar,
  Monitor,
  AlertTriangle,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { Button } from './Button';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';

interface ScreenFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'horizontal' | 'vertical' | 'square';
  description: string;
}

const screenFormats: ScreenFormat[] = [
  { 
    id: '1', 
    name: 'Pantalla LED Estadio',
    width: 1920, 
    height: 1080,
    type: 'horizontal',
    description: 'Formato ideal para pantallas LED perimetrales en estadios'
  },
  { 
    id: '2', 
    name: 'Valla Digital Vertical',
    width: 1080, 
    height: 1920,
    type: 'vertical',
    description: 'Formato para vallas digitales verticales en centros comerciales'
  },
  { 
    id: '3', 
    name: 'Pantalla Centro Comercial',
    width: 1280, 
    height: 720,
    type: 'horizontal',
    description: 'Formato estándar para pantallas en centros comerciales'
  },
  { 
    id: '4', 
    name: 'Valla Digital Premium',
    width: 3840, 
    height: 2160,
    type: 'horizontal',
    description: 'Formato 4K para vallas digitales de alta resolución'
  }
];

export function CreativeLibrary() {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const onDrop = useCallback((acceptedFiles: File[], formatId: string) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [formatId]: file }));
      setPreviews(prev => ({ 
        ...prev, 
        [formatId]: URL.createObjectURL(file) 
      }));
    }
  }, []);

  const removeFile = (formatId: string) => {
    setUploadedFiles(prev => {
      const { [formatId]: removed, ...rest } = prev;
      return rest;
    });
    setPreviews(prev => {
      const { [formatId]: removed, ...rest } = prev;
      if (removed) URL.revokeObjectURL(removed);
      return rest;
    });
  };

  const filteredFormats = screenFormats.filter(format => {
    const matchesSearch = format.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || format.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Subir Creativos</h2>
            <p className="text-neutral-600">
              Sube tus creativos para diferentes formatos de pantalla
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            icon={Filter}
            onClick={() => {/* Handle filters */}}
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-neutral-200 bg-neutral-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar formatos..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Select
            placeholder="Tipo"
            options={[
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
              { value: 'square', label: 'Cuadrado' }
            ]}
            onChange={(option) => setSelectedType(option?.value || null)}
            isClearable
            className="w-[150px]"
          />
        </div>
      </div>

      <div className="p-6">
        {/* Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFormats.map((format) => {
            const { getRootProps, getInputProps } = useDropzone({
              accept: {
                'image/*': ['.jpeg', '.jpg', '.png'],
                'video/*': ['.mp4']
              },
              maxFiles: 1,
              onDrop: (files) => onDrop(files, format.id)
            });

            return (
              <div 
                key={format.id}
                className={`
                  rounded-xl border-2 transition-colors
                  ${selectedFormat === format.id
                    ? 'border-primary bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{format.name}</h3>
                      <p className="text-sm text-neutral-600">
                        {format.width} x {format.height}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-neutral-100 rounded-full text-sm">
                      {format.type}
                    </span>
                  </div>

                  {uploadedFiles[format.id] ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      {uploadedFiles[format.id].type.startsWith('video/') ? (
                        <video
                          src={previews[format.id]}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={previews[format.id]}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        onClick={() => removeFile(format.id)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/75"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className="aspect-video bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary transition-colors cursor-pointer p-4 flex flex-col items-center justify-center"
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                      <p className="text-sm text-neutral-600 text-center">
                        Arrastra tu archivo aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        JPG, PNG o MP4 hasta 10MB
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-sm text-neutral-600">{format.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guidelines */}
        <div className="mt-6 p-4 bg-warning-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-warning-700 mb-2">
                Recomendaciones importantes
              </h4>
              <ul className="space-y-1 text-sm text-warning-600">
                <li>• Asegúrate de que el contenido sea legible en el tamaño final</li>
                <li>• Usa colores con buen contraste para mejor visibilidad</li>
                <li>• Los videos no deben exceder los 10 segundos</li>
                <li>• Tamaño máximo por archivo: 10MB</li>
                <li>• Formatos soportados: JPG, PNG, MP4</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-200 bg-neutral-50">
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {/* Handle cancel */}}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={ChevronRight}
            onClick={() => {/* Handle save */}}
          >
            Subir Creativos
          </Button>
        </div>
      </div>
    </div>
  );
}