import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, ChevronLeft, ChevronRight, X, Monitor, Info, AlertCircle, Image as ImageIcon } from 'lucide-react';
import type { Campaign, CreativeFile } from '../../types/advertise';
import { CreativeMockup } from './CreativeMockup';

interface CreativeUploadProps {
  campaign: Partial<Campaign>;
  onUpdate: (data: Partial<Campaign>) => void;
  onNext: () => void;
  onBack: () => void;
}

const allowedTypes = ['video/mp4', 'image/jpeg', 'image/png'];
const maxFileSize = 100 * 1024 * 1024; // 100MB

const formatSpecs = {
  horizontal: { width: 1920, height: 1080, label: 'Horizontal (16:9)' },
  vertical: { width: 1080, height: 1920, label: 'Vertical (9:16)' },
  square: { width: 1080, height: 1080, label: 'Square (1:1)' }
} as const;

export function CreativeUpload({ campaign, onUpdate, onNext, onBack }: CreativeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatives, setCreatives] = useState<Record<string, CreativeFile>>({});
  const [selectedFormat, setSelectedFormat] = useState<keyof typeof formatSpecs>('horizontal');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload MP4, JPEG, or PNG files.');
      return false;
    }

    if (file.size > maxFileSize) {
      setError('File size exceeds 100MB limit.');
      return false;
    }

    return true;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file || !validateFile(file)) return;

    handleFileUpload(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const preview = URL.createObjectURL(file);
      setCreatives(prev => ({
        ...prev,
        [selectedFormat]: {
          format: selectedFormat,
          file,
          preview,
          dimensions: formatSpecs[selectedFormat]
        }
      }));
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    }
  };

  const removeCreative = (format: string) => {
    setCreatives(prev => {
      const { [format]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(creatives).length === 0) {
      setError('Please upload at least one creative.');
      return;
    }

    // Use the first creative as the main one
    const mainCreative = Object.values(creatives)[0];
    onUpdate({
      creative: {
        fileUrl: mainCreative.preview,
        fileType: mainCreative.file.type as Campaign['creative']['fileType'],
        dimensions: mainCreative.dimensions
      }
    });
    onNext();
  };

  return (
    <div className="flex gap-8">
      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-8">
        {/* Format Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(formatSpecs).map(([format, spec]) => (
              <button
                key={format}
                type="button"
                onClick={() => setSelectedFormat(format as keyof typeof formatSpecs)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedFormat === format
                    ? 'border-primary bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Monitor className={`w-5 h-5 ${
                    selectedFormat === format ? 'text-primary' : 'text-neutral-400'
                  }`} />
                  <span className="font-medium">{spec.label}</span>
                </div>
                <p className="text-sm text-neutral-600">
                  {spec.width}x{spec.height}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        {!creatives[selectedFormat] && (
          <div>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging
                  ? 'border-primary bg-primary-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-neutral-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Upload Creative for {formatSpecs[selectedFormat].label}
                </p>
                <p className="text-sm text-neutral-500 mb-4">
                  Drag and drop your file here or click to browse
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-500"
                >
                  Select File
                </button>
              </div>

              <div className="mt-4 text-sm text-neutral-500">
                <p>Supported formats: MP4, JPEG, PNG</p>
                <p>Maximum file size: 100MB</p>
                <p>Recommended dimensions: {formatSpecs[selectedFormat].width}x{formatSpecs[selectedFormat].height}</p>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-error-600 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </div>
        )}

        {/* Creative Previews */}
        {Object.entries(creatives).length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Uploaded Creatives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(creatives).map(([format, creative]) => (
                <div key={format} className="bg-neutral-50 rounded-lg overflow-hidden">
                  <div className="aspect-video relative">
                    {creative.file.type.startsWith('video/') ? (
                      <video
                        src={creative.preview}
                        controls
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={creative.preview}
                        alt={`Creative for ${format}`}
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{formatSpecs[format as keyof typeof formatSpecs].label}</h4>
                      <button
                        type="button"
                        onClick={() => removeCreative(format)}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {creative.dimensions?.width}x{creative.dimensions?.height}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <p className="font-medium">Creative Guidelines</p>
          </div>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>• Use high-contrast visuals for better visibility</li>
            <li>• Keep text minimal and font size large</li>
            <li>• Avoid white backgrounds in outdoor displays</li>
            <li>• Include clear call-to-action</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-neutral-700 hover:text-neutral-900 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={Object.keys(creatives).length === 0}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-500 disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue to Summary
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Preview Panel */}
      <div className="hidden lg:block w-[400px] p-6 bg-neutral-50 border-l border-neutral-200">
        <div className="sticky top-6">
          <h3 className="text-lg font-semibold mb-6">Vista Previa</h3>
          <CreativeMockup
            preview={Object.values(creatives)[0]?.preview || null}
            format={selectedFormat}
            fileType={Object.values(creatives)[0]?.file.type || ''}
          />
        </div>
      </div>
    </div>
  );
}