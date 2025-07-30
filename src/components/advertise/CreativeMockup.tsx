import React from 'react';
import { Info } from 'lucide-react';

interface CreativeMockupProps {
  preview: string | null;
  format: string;
  fileType: string;
}

export function CreativeMockup({ preview, format, fileType }: CreativeMockupProps) {
  return (
    <div className="space-y-6">
      {/* Stadium Preview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Vista previa en estadio
        </h3>
        <div className="relative aspect-video bg-[#181830] rounded-lg overflow-hidden">
          {/* Stadium Background */}
          <img
            src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1200"
            alt="Stadium"
            className="w-full h-full object-cover opacity-75"
          />

          {/* LED Board Container */}
          <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black/80">
            {preview ? (
              fileType.startsWith('video/') ? (
                <video
                  src={preview}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={preview}
                  alt="Creative Preview"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <span className="text-sm">Tu pieza creativa aparecerá aquí</span>
              </div>
            )}
          </div>

          {/* Mockup Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute inset-0 bg-[#181830]/10" />
          </div>
        </div>
      </div>

      {/* Mall Preview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Vista previa en centro comercial
        </h3>
        <div className="relative aspect-[4/3] bg-[#181830] rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200"
            alt="Shopping Mall"
            className="w-full h-full object-cover opacity-90"
          />

          <div className="absolute top-1/4 right-[10%] w-1/3 aspect-[9/16] bg-black/80 rounded-lg overflow-hidden transform rotate-3 shadow-2xl">
            {preview ? (
              fileType.startsWith('video/') ? (
                <video
                  src={preview}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={preview}
                  alt="Creative Preview"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <span className="text-sm">Preview</span>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>

      {/* Street Preview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Vista previa en la calle
        </h3>
        <div className="relative aspect-video bg-[#181830] rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?auto=format&fit=crop&q=80&w=1200"
            alt="Street Billboard"
            className="w-full h-full object-cover opacity-90"
          />

          <div className="absolute top-[15%] left-[20%] w-[60%] aspect-[16/9] bg-black/80 rounded-sm overflow-hidden shadow-2xl">
            {preview ? (
              fileType.startsWith('video/') ? (
                <video
                  src={preview}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={preview}
                  alt="Creative Preview"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <span className="text-sm">Preview</span>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-primary-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <p className="font-medium">Recomendaciones</p>
        </div>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• Verifica que tu contenido sea legible en diferentes tamaños</li>
          <li>• Asegúrate que los colores contrasten adecuadamente</li>
          <li>• Mantén los elementos importantes centrados</li>
          <li>• Evita textos demasiado pequeños</li>
        </ul>
      </div>
    </div>
  );
}