import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Monitor, ArrowLeft, X, Image, AlertCircle, Check } from 'lucide-react';
import { Screen } from '../../types';
import { Button } from '../Button';
import { Card } from '../Card';

interface ScreenCreativeUploadProps {
  screen: Screen;
  selectedCreative: File | null;
  setSelectedCreative: (file: File | null) => void;
  onBack: () => void;
  onContinue: () => void;
}

const ScreenCreativeUpload: React.FC<ScreenCreativeUploadProps> = ({
  screen,
  selectedCreative,
  setSelectedCreative,
  onBack,
  onContinue
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'validating' | 'success' | 'error'>('pending');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };
  
  // Process the selected file
  const handleFiles = (file: File) => {
    // Reset
    setUploadError(null);
    
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setUploadError('El tipo de archivo no es válido. Formatos permitidos: JPG, PNG, GIF, MP4, PDF');
      return;
    }
    
    // Validate file size
    if (file.size > maxFileSize) {
      setUploadError('El archivo es demasiado grande. El tamaño máximo permitido es 50MB');
      return;
    }
    
    // Set the file
    setSelectedCreative(file);
    
    // Simulate validation
    simulateValidation();
  };
  
  // Simulate file validation
  const simulateValidation = () => {
    setValidationStatus('validating');
    setIsValidating(true);
    
    // Simulate validation delay
    setTimeout(() => {
      setIsValidating(false);
      setValidationStatus('success');
    }, 2000);
  };
  
  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return <Image className="w-6 h-6" />;
    } else if (type.includes('video')) {
      return <Monitor className="w-6 h-6" />;
    } else {
      return <FileText className="w-6 h-6" />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
  };
  
  // Handle file remove
  const handleRemoveFile = () => {
    setSelectedCreative(null);
    setValidationStatus('pending');
    setUploadError(null);
    
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="my-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>
        <h1 className="text-2xl font-bold text-neutral-900 ml-8">Cargar creatividad</h1>
      </div>
      
      <Card className="overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="grid gap-8 md:grid-cols-12">
            {/* Instrucciones */}
            <div className="md:col-span-5">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Especificaciones técnicas
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <h4 className="font-medium text-neutral-900">Formatos aceptados:</h4>
                  <ul className="mt-2 text-sm text-neutral-600 space-y-1">
                    <li>• JPG, PNG, GIF (imágenes)</li>
                    <li>• MP4 (video)</li>
                    <li>• PDF (documentos)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <h4 className="font-medium text-neutral-900">Dimensiones:</h4>
                  <ul className="mt-2 text-sm text-neutral-600 space-y-1">
                    <li>• {screen.specs.resolution} píxeles</li>
                    <li>• Relación de aspecto: {screen.specs.width / screen.specs.height}:1</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <h4 className="font-medium text-neutral-900">Duración:</h4>
                  <ul className="mt-2 text-sm text-neutral-600 space-y-1">
                    <li>• Máximo 30 segundos para videos</li>
                    <li>• 15 segundos recomendado</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <h4 className="font-medium text-neutral-900">Tamaño máximo:</h4>
                  <p className="mt-2 text-sm text-neutral-600">
                    50MB por archivo
                  </p>
                </div>
              </div>
            </div>
            
            {/* Carga de archivo */}
            <div className="md:col-span-7">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Tu creatividad
              </h3>
              
              {selectedCreative ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-neutral-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4 bg-neutral-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedCreative.type)}
                      <div>
                        <p className="font-medium text-neutral-900 truncate max-w-[200px]">{selectedCreative.name}</p>
                        <p className="text-xs text-neutral-500">{formatFileSize(selectedCreative.size)}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleRemoveFile}
                      className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4 border-t border-neutral-200">
                    {validationStatus === 'validating' ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                        <span className="text-sm text-neutral-600">Validando archivo...</span>
                      </div>
                    ) : validationStatus === 'success' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Archivo validado correctamente</span>
                      </div>
                    ) : validationStatus === 'error' ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Error al validar el archivo</span>
                      </div>
                    ) : null}
                    
                    {selectedCreative.type.includes('image') && (
                      <div className="mt-4">
                        <img 
                          src={URL.createObjectURL(selectedCreative)} 
                          alt="Preview" 
                          className="max-h-64 max-w-full rounded border border-neutral-200"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition
                    ${dragActive 
                      ? 'border-primary bg-primary-50' 
                      : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="mx-auto w-12 h-12 flex items-center justify-center bg-neutral-200 text-neutral-600 rounded-full mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-medium text-neutral-900">
                    {dragActive ? 'Suelta para cargar' : 'Arrastra tu archivo aquí'}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    O <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary font-medium hover:underline"
                    >
                      selecciona un archivo
                    </button> desde tu equipo
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    JPG, PNG, GIF, MP4, PDF • Máximo 50MB
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.mp4,.pdf"
                    className="hidden"
                    onChange={handleChange}
                  />
                </div>
              )}
              
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700">{uploadError}</p>
                </motion.div>
              )}
              
              <div className="mt-8">
                <p className="text-sm text-neutral-600 mb-1">
                  ¿No tienes una creatividad? No te preocupes.
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Ver plantillas disponibles</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center border-t border-neutral-200 pt-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Button>
            
            <Button 
              onClick={onContinue}
              disabled={!selectedCreative || validationStatus !== 'success'}
              className="flex items-center gap-2"
            >
              <span>Continuar</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScreenCreativeUpload; 