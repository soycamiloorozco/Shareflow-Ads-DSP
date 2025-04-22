import React from 'react';
import { ImageIcon } from 'lucide-react';

interface CreativeMockupProps {
  imageUrl: string | null;
}

export function CreativeMockup({ imageUrl }: CreativeMockupProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold text-primary-400 mb-4">
        Vista previa en pantalla
      </h2>

      <div className="relative aspect-video bg-[#181830] rounded-lg overflow-hidden">
        {/* Stadium Background */}
        <img
          src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1200"
          alt="Stadium"
          className="w-full h-full object-cover opacity-75"
        />

        {/* LED Board Container */}
        <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black/80">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Creative Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={24} />
              <span className="ml-2 text-sm">Tu pieza creativa aparecerá aquí</span>
            </div>
          )}
        </div>

        {/* Mockup Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[#181830]/10" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="p-4 bg-primary-50 rounded-lg">
          <h3 className="font-semibold text-primary-400 mb-2">
            Visualización en tiempo real
          </h3>
          <p className="text-sm text-primary-300">
            Esta vista previa te muestra cómo se verá tu pieza creativa en las pantallas LED
            del estadio durante el partido.
          </p>
        </div>
      </div>
    </div>
  );
}