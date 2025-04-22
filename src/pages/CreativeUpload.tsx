import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, X, Eye, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { CreativeMockup } from '../components/CreativeMockup';

export function CreativeUpload() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const handleContinue = () => {
    if (file) {
      navigate(`/event/${id}/payment`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:ml-64">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2">
              <ArrowLeft size={24} className="text-primary-400" />
            </button>
            <h1 className="text-xl font-bold text-primary-400">Subir Pieza Creativa</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Upload Section */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold text-primary-400 mb-4">
                Sube tu pieza creativa
              </h2>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center ${
                  isDragging ? 'border-primary bg-primary-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Arrastra tu archivo aquí o{' '}
                          <span className="text-primary">búscalo en tu computador</span>
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG hasta 10MB
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    <img
                      src={preview!}
                      alt="Preview"
                      className="max-h-48 mx-auto object-contain"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute top-0 right-0 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X size={20} />
                    </button>
                    <p className="mt-2 text-sm text-gray-600">{file.name}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-400 mb-2">
                    Especificaciones técnicas
                  </h3>
                  <ul className="text-sm text-primary-300 space-y-2">
                    <li>• Dimensiones: 1920 x 96 píxeles</li>
                    <li>• Formato: PNG o JPG</li>
                    <li>• Peso máximo: 10MB</li>
                    <li>• Resolución: 72 DPI</li>
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={Eye}
                  disabled={!file}
                >
                  Vista previa
                </Button>
              </div>
            </div>
          </div>

          {/* Mockup Preview */}
          <div className="sticky top-24">
            <CreativeMockup imageUrl={preview} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:relative md:border-0 md:p-0 md:mt-6">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={ArrowRight}
          disabled={!file}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}