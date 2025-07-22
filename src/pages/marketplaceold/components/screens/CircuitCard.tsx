import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Eye, Star, MapPin, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { getScreenMinPrice } from '../../utils/screen-utils';

interface CircuitCardProps {
  circuit: any[];
  onSelect: (screen: any) => void;
  className?: string;
  'aria-label'?: string;
}

export const CircuitCard = React.memo<CircuitCardProps>(({
  circuit,
  onSelect,
  className = '',
  'aria-label': ariaLabel
}) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  useEffect(() => {
    if (circuit.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentScreenIndex(prevIndex => (prevIndex + 1) % circuit.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [circuit.length]);

  const circuitName = circuit[0]?.circuitName || 'Circuito de Pantallas';
  const circuitId = circuit[0]?.circuitId || `circuit-${circuit[0]?.id}`;
  
  const totalViews = circuit.reduce((sum, screen) => sum + (screen.views?.daily || 0), 0);
  const averageRating = circuit.reduce((sum, screen) => sum + (screen.rating || 0), 0) / circuit.length;
  const totalPrice = circuit.reduce((sum, screen) => sum + getScreenMinPrice(screen), 0);
  
  const cities = [...new Set(circuit.map(screen => {
    const locationParts = screen.location?.split(',') || [];
    return locationParts[locationParts.length - 1]?.trim() || '';
  }).filter(Boolean))];

  const handleCircuitClick = () => {
    // Navigate to circuit detail or select first screen
    onSelect(circuit[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCircuitClick();
    }
  };

  const currentScreen = circuit[currentScreenIndex];

  return (
    <div 
      className={`cursor-pointer group relative ${className}`}
      onClick={handleCircuitClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || `Circuit: ${circuitName} with ${circuit.length} screens`}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden border border-indigo-200 hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 h-full transform hover:-translate-y-1 shadow-lg">
        
        {/* Circuit Layout - Responsive */}
        <div className="flex flex-col lg:flex-row">
          
          {/* Image section with carousel */}
          <div className="relative lg:w-1/2 aspect-[16/9] lg:aspect-[4/3] overflow-hidden flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentScreen?.id}
                src={currentScreen?.image}
                alt={currentScreen?.name}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Circuit Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Circuito</span>
              </span>
            </div>

            {/* Popular Badge */}
            {totalViews > 100000 && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="hidden sm:inline">Popular</span>
                </span>
              </div>
            )}
            
            {/* Carousel indicators */}
            {circuit.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {circuit.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentScreenIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Content section */}
          <div className="p-4 lg:p-6 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="font-bold text-gray-900 text-lg lg:text-xl leading-tight mb-2">
                {circuitName}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                Un conjunto de {circuit.length} pantallas premium en ubicaciones estratégicas 
                {cities.length > 0 && ` en ${cities.slice(0, 2).join(', ')}`}.
              </p>
              
              {/* Circuit Stats Grid */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{circuit.length}</div>
                    <div className="text-xs text-gray-500">Pantallas</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Eye className="w-4 h-4 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {(totalViews / 1000).toFixed(0)}K+
                    </div>
                    <div className="text-xs text-gray-500">Vistas/día</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-100 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{averageRating.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{cities.length}</div>
                    <div className="text-xs text-gray-500">
                      {cities.length === 1 ? 'Ciudad' : 'Ciudades'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              {circuit[0]?.operatingHours && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {circuit[0].operatingHours.start} - {circuit[0].operatingHours.end}
                  </span>
                </div>
              )}
            </div>
            
            {/* Price and CTA */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl lg:text-2xl font-bold text-gray-900">
                    ${(totalPrice / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-sm text-gray-600">COP</span>
                </div>
                <p className="text-xs text-gray-500">por hora (circuito completo)</p>
                
                {/* Savings indicator */}
                <div className="text-xs text-green-600 font-medium mt-1">
                  Ahorra hasta 15% vs. individual
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCircuitClick();
                }}
                className="px-4 lg:px-6 py-2.5 lg:py-3 bg-[#353FEF] hover:bg-[#2A32C5] text-white text-sm lg:text-base font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 min-h-[44px]"
                aria-label={`Ver detalles del circuito ${circuitName}`}
              >
                <span>Ver Circuito</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CircuitCard.displayName = 'CircuitCard';