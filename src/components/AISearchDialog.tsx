import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bot, MapPin, Users, Star, Eye, Monitor, Clock, Calendar,
  ChevronRight, Sparkles, DollarSign, TrendingUp, Target
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Screen } from '../types';

interface AISearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScreenSelect: (screen: Screen) => void;
}

interface SearchSuggestion {
  type: 'location' | 'budget' | 'audience' | 'time';
  text: string;
  icon: typeof MapPin;
  description: string;
}

const suggestions: SearchSuggestion[] = [
  {
    type: 'location',
    text: 'Pantallas en El Poblado',
    icon: MapPin,
    description: '15 pantallas disponibles en la zona'
  },
  {
    type: 'budget',
    text: 'Presupuesto de 5 millones',
    icon: DollarSign,
    description: 'Ver opciones recomendadas para tu presupuesto'
  },
  {
    type: 'audience',
    text: 'Alto tráfico peatonal',
    icon: Users,
    description: 'Pantallas con mayor exposición a peatones'
  },
  {
    type: 'time',
    text: 'Horario prime (5-8 PM)',
    icon: Clock,
    description: 'Momentos de mayor visibilidad'
  }
];

export function AISearchDialog({ isOpen, onClose, onScreenSelect }: AISearchDialogProps) {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleSearch = () => {
    if (!query) return;
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowRecommendations(true);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Búsqueda Inteligente</h2>
                  <p className="text-neutral-600">
                    Describe lo que buscas y te ayudaré a encontrarlo
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: Busco pantallas en El Poblado con alto tráfico para un presupuesto de 5 millones"
                  className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  variant="primary"
                  size="lg"
                  icon={Search}
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </div>

              {!query && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-600">
                    Sugerencias
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors text-left"
                        onClick={() => setQuery(suggestion.text)}
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <suggestion.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{suggestion.text}</p>
                          <p className="text-sm text-neutral-600">
                            {suggestion.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-neutral-600">
                    Analizando las mejores opciones para tu búsqueda...
                  </p>
                </div>
              )}

              {showRecommendations && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <p className="text-primary">
                      Basado en tu búsqueda, aquí están las mejores opciones:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recommendation cards would go here */}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}