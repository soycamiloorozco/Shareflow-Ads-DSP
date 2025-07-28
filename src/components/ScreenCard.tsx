import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Eye, ChevronRight } from 'lucide-react';
import { Screen } from '../types';
import { Button } from './Button';
import { Card } from './Card';

interface ScreenCardProps {
  screen: Screen;
  onClick: () => void;
}

export function ScreenCard({ screen, onClick }: ScreenCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card>
        <div className="relative aspect-video">
          <img
            src={screen.image}
            alt={screen.location}
            className="w-full h-full object-cover rounded-t-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-4 right-4">
            <span className={`
              px-3 py-1 rounded-full text-sm
              ${screen.availability
                ? 'bg-success-50 text-success-600'
                : 'bg-error-50 text-error-600'
              }
            `}>
              {screen.availability ? 'Disponible' : 'No disponible'}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-semibold text-white mb-1">
              {screen.location}
            </h3>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{screen.category.name}</span>
            </div>
          </div>
        </div>

        <Card.Body>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-medium">{screen.rating}</span>
              <span className="text-neutral-600">
                ({screen.reviews} reseñas)
              </span>
            </div>
            <div className="text-sm text-neutral-600">
              {(screen.views.daily / 1000).toFixed(1)}k vistas/día
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Desde</p>
              <p className="text-lg font-semibold">
                ${screen.price.toLocaleString()} COP
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={ChevronRight}
            >
              Ver detalles
            </Button>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}