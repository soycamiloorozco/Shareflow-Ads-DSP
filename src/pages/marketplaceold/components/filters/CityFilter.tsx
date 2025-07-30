import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Check, X } from 'lucide-react';
import { FilterOption } from '../../types';

interface CityFilterProps {
  selectedCities: string[];
  onCitiesChange: (cities: string[]) => void;
  availableCities: FilterOption[];
  className?: string;
  'aria-label'?: string;
}

export const CityFilter = React.memo<CityFilterProps>(({
  selectedCities,
  onCitiesChange,
  availableCities,
  className = '',
  'aria-label': ariaLabel = 'City filter'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return availableCities;
    
    return availableCities.filter(city => 
      city.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableCities, searchQuery]);

  const handleCityToggle = useCallback((cityId: string) => {
    if (selectedCities.includes(cityId)) {
      onCitiesChange(selectedCities.filter(id => id !== cityId));
    } else {
      onCitiesChange([...selectedCities, cityId]);
    }
  }, [selectedCities, onCitiesChange]);

  const handleClearAll = useCallback(() => {
    onCitiesChange([]);
  }, [onCitiesChange]);

  const handleSelectAll = useCallback(() => {
    const allCityIds = filteredCities.map(city => city.id);
    onCitiesChange(allCityIds);
  }, [filteredCities, onCitiesChange]);

  return (
    <div className={`space-y-4 ${className}`} aria-label={ariaLabel}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar ciudades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors text-sm"
          aria-label="Search cities"
        />
      </div>

      {/* Selected Cities Display */}
      {selectedCities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Ciudades seleccionadas ({selectedCities.length})
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedCities.map((cityId) => {
                const city = availableCities.find(c => c.id === cityId);
                if (!city) return null;
                
                return (
                  <motion.span
                    key={cityId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#353FEF] text-white text-sm rounded-full"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{city.label}</span>
                    <button
                      onClick={() => handleCityToggle(cityId)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${city.label} from selection`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {filteredCities.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {filteredCities.length} {filteredCities.length === 1 ? 'ciudad' : 'ciudades'} disponibles
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-[#353FEF] hover:text-[#2A32C5] font-medium"
              disabled={selectedCities.length === filteredCities.length}
            >
              Seleccionar todas
            </button>
          </div>
        </div>
      )}

      {/* Cities Grid */}
      <div className="max-h-60 overflow-y-auto">
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredCities.map((city) => {
              const isSelected = selectedCities.includes(city.id);
              
              return (
                <motion.button
                  key={city.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleCityToggle(city.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      isSelected ? 'bg-[#353FEF]/10' : 'bg-gray-100'
                    }`}>
                      <MapPin className={`w-4 h-4 ${
                        isSelected ? 'text-[#353FEF]' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{city.label}</div>
                      <div className="text-xs text-gray-500">
                        {city.count} {city.count === 1 ? 'pantalla' : 'pantallas'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {city.count > 20 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 bg-[#353FEF] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No se encontraron ciudades' : 'No hay ciudades disponibles'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#353FEF] hover:text-[#2A32C5] mt-1"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

CityFilter.displayName = 'CityFilter';