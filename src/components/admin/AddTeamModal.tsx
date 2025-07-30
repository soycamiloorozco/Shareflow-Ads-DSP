import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Info, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { useDropzone } from 'react-dropzone';
import { Team } from '../../hooks/useTeams';

interface AddTeamModalProps {
  onClose: () => void;
  onSave: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddTeamModal({ onClose, onSave }: AddTeamModalProps) {
  const [formData, setFormData] = useState<Team>({
    name: '',
    city: '',
    id: "",
    logo: '',
    primaryColor: "",
    secondaryColor: "",
    createdAt: "",
    updatedAt: "",
    colors: {
      primary: '#000000',
      secondary: '#ffffff'
    }
  });

  const [logoError, setLogoError] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    minSize: 0,
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file || !(file instanceof File)) {
        setLogoError('Archivo inválido');
        return;
      }
      
      // Create object URL
      const objectUrl = URL.createObjectURL(file);
      
      // Check image dimensions
      const img = new Image();
      img.src = objectUrl;
      
      img.onload = () => {
        if (img.width < 500 || img.height < 500) {
          setLogoError('La imagen debe ser al menos de 500x500 píxeles');
          URL.revokeObjectURL(objectUrl);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            logo: reader.result as string
          }));
          setLogoError(null);
          // Clean up object URL after we're done with it
          URL.revokeObjectURL(objectUrl);
        };
        reader.readAsDataURL(file);
      };

      img.onerror = () => {
        setLogoError('Error al cargar la imagen');
        URL.revokeObjectURL(objectUrl);
      };
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (logoError) return;
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Añadir Equipo</h2>
              <p className="text-neutral-600">Ingresa la información del equipo</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    city: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Logo del Equipo
            </h3>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${logoError 
                  ? 'border-error-300 bg-error-50' 
                  : 'border-neutral-300 hover:border-primary hover:bg-primary-50'
                }
              `}
            >
              <input {...getInputProps()} />
              {formData.logo ? (
                <div className="relative">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="w-[500px] h-[500px] mx-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, logo: '' }));
                      setLogoError(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-error-100 text-error-600 rounded-full hover:bg-error-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">
                    Arrastra el logo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    PNG o JPG • Mínimo 500x500px • Máximo 2MB
                  </p>
                </>
              )}
            </div>

            {logoError && (
              <p className="text-sm text-error-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {logoError}
              </p>
            )}
          </div>

          {/* Team Colors */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Colores del Equipo
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Color Principal
                </label>
                <input
                  type="color"
                  value={formData.colors.primary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    colors: {
                      ...prev.colors,
                      primary: e.target.value
                    }
                  }))}
                  className="w-full h-10 px-1 py-1 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Color Secundario
                </label>
                <input
                  type="color"
                  value={formData.colors.secondary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    colors: {
                      ...prev.colors,
                      secondary: e.target.value
                    }
                  }))}
                  className="w-full h-10 px-1 py-1 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.city || !formData.logo || logoError !== null}
            >
              Guardar Equipo
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}