import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, MapPin, Users, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { LocationInput } from './LocationInput';

interface AddStadiumModalProps {
  onClose: () => void;
  onSave: (stadiumData: {
    name: string;
    city: string;
    capacity: number;
    location: string;
    coordinates: { lat: number; lng: number };
    photos: string[];
  }) => void;
}

interface PhotoUpload {
  id: string;
  file: File;
  preview: string;
}

export function AddStadiumModal({ onClose, onSave }: AddStadiumModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    capacity: 0,
    location: '',
    coordinates: { lat: 6.2442, lng: -75.5812 }
  });

  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhotoUpload = (files: File[]) => {
    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    setPhotoError(null);
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const updatedPhotos = prev.filter(p => p.id !== photoId);
      const removedPhoto = prev.find(p => p.id === photoId);
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.preview);
      }
      return updatedPhotos;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      setPhotoError('Debes subir al menos una foto del estadio');
      return;
    }

    // Convert photos to base64 strings
    const photoPromises = photos.map(photo => 
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(photo.file);
      })
    );

    try {
      const photoBase64 = await Promise.all(photoPromises);
      onSave({
        ...formData,
        photos: photoBase64
      });
    } catch (error) {
      setPhotoError('Error al procesar las fotos');
    }
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
            <h2 className="text-2xl font-semibold">Añadir Estadio</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nombre del Estadio
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Capacidad
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  capacity: parseInt(e.target.value)
                }))}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Ubicación
            </label>
            <LocationInput
              value={formData.location}
              onChange={(address, coordinates) => setFormData(prev => ({
                ...prev,
                location: address,
                coordinates: coordinates || prev.coordinates
              }))}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700">
                Fotos del Estadio
              </label>
              <span className="text-sm text-neutral-500">
                {photos.length} de 5 fotos
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden group"
                >
                  <img
                    src={photo.preview}
                    alt="Stadium preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="aspect-video bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary hover:bg-primary-50 transition-colors cursor-pointer flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handlePhotoUpload(Array.from(e.target.files));
                      }
                    }}
                    multiple
                  />
                  <ImageIcon className="w-8 h-8 text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-600">
                    Añadir foto
                  </span>
                </label>
              )}
            </div>

            {photoError && (
              <p className="text-sm text-error-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {photoError}
              </p>
            )}

            <p className="text-sm text-neutral-500">
              Sube hasta 5 fotos del estadio. Las fotos deben mostrar claramente las áreas donde se ubicarán las pantallas.
            </p>
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
              disabled={!formData.name || !formData.city || !formData.capacity || !formData.location || photos.length === 0}
            >
              Guardar Estadio
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}