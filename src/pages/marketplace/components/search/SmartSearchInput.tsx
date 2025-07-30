import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchSuggestion } from '../../types/filter.types';
import { Screen } from '../../types';

interface SmartSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  resultCount?: number;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
  availableScreens?: Screen[]; // Nueva prop para los datos de pantallas de la API
}

export const SmartSearchInput = React.memo<SmartSearchInputProps>(({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar pantallas, ubicaciones o categorías...",
  resultCount = 0,
  onSuggestionClick,
  suggestions = [],
  loading = false,
  className = '',
  'aria-label': ariaLabel = 'Smart search input for marketplace',
  availableScreens = [] // Nueva prop con default vacío
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate smart suggestions based on API data
  const smartSuggestions = useMemo(() => {
    if (!value.trim() || value.length < 2) {
      // Generar sugerencias populares basadas en datos reales de pantallas
      if (availableScreens.length === 0) {
        return []; // Retornar array vacío si no hay pantallas disponibles
      }

      // Obtener ciudades más populares de los datos reales
      const cityCount = new Map<string, number>();
      const categoryCount = new Map<string, { name: string; count: number }>();
      
      availableScreens.forEach(screen => {
        // Extraer ciudad de la ubicación
        const locationParts = screen.location.split(',');
        const city = locationParts[locationParts.length - 1]?.trim();
        if (city && city !== 'Colombia') {
          cityCount.set(city, (cityCount.get(city) || 0) + 1);
        }
        
        // Contar categorías
        if (screen.category?.id && screen.category?.name) {
          const existing = categoryCount.get(screen.category.id);
          if (existing) {
            existing.count++;
          } else {
            categoryCount.set(screen.category.id, { 
              name: screen.category.name, 
              count: 1 
            });
          }
        }
      });

      const popularSuggestions: SearchSuggestion[] = [];

      // Top 3 ciudades
      const topCities = Array.from(cityCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      topCities.forEach(([city, count]) => {
        popularSuggestions.push({
          id: `city-${city.toLowerCase()}`,
          text: city,
          type: 'location',
          count,
          icon: '📍'
        });
      });

      // Top 2 categorías
      const topCategories = Array.from(categoryCount.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 2);
      
      topCategories.forEach(([categoryId, { name, count }]) => {
        popularSuggestions.push({
          id: `category-${categoryId}`,
          text: name,
          type: 'category',
          count,
          icon: '🏢'
        });
      });

      // Pantallas con momentos si están disponibles
      const screensWithMoments = availableScreens.filter(screen => screen.pricing?.allowMoments);
      if (screensWithMoments.length > 0) {
        popularSuggestions.push({
          id: 'moments-feature',
          text: 'Pantallas con Momentos (15s)',
          type: 'venue',
          count: screensWithMoments.length,
          icon: '⚡'
        });
      }

      return popularSuggestions.slice(0, 5);
    }

    const query = value.toLowerCase().trim();
    const filtered: SearchSuggestion[] = [];

    // Buscar ubicaciones reales
    const locationMatches = new Map<string, number>();
    availableScreens.forEach(screen => {
      const locationParts = screen.location.split(',');
      locationParts.forEach(part => {
        const location = part.trim();
        if (location.toLowerCase().includes(query) && location !== 'Colombia') {
          locationMatches.set(location, (locationMatches.get(location) || 0) + 1);
        }
      });
    });

    // Agregar ubicaciones que coincidan
    Array.from(locationMatches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([location, count]) => {
        filtered.push({
          id: `location-${location.toLowerCase().replace(/\s+/g, '-')}`,
          text: location,
          type: 'location',
          count,
          icon: '📍'
        });
      });

    // Buscar categorías reales
    const categoryMatches = new Map<string, { name: string; count: number }>();
    availableScreens.forEach(screen => {
      if (screen.category?.name?.toLowerCase().includes(query)) {
        const existing = categoryMatches.get(screen.category.id);
        if (existing) {
          existing.count++;
        } else {
          categoryMatches.set(screen.category.id, {
            name: screen.category.name,
            count: 1
          });
        }
      }
    });

    // Agregar categorías que coincidan
    Array.from(categoryMatches.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 2)
      .forEach(([categoryId, { name, count }]) => {
        filtered.push({
          id: `category-${categoryId}`,
          text: name,
          type: 'category',
          count,
          icon: '🏢'
        });
      });

    // Buscar nombres de pantallas reales
    const screenMatches = availableScreens
      .filter(screen => screen.name.toLowerCase().includes(query))
      .slice(0, 2);

    screenMatches.forEach(screen => {
      filtered.push({
        id: `screen-${screen.id}`,
        text: screen.name,
        type: 'screen',
        icon: '📺'
      });
    });

    // Sugerencias de características especiales
    if (query.includes('momento') || query.includes('15') || query.includes('segundo')) {
      const screensWithMoments = availableScreens.filter(screen => screen.pricing?.allowMoments);
      if (screensWithMoments.length > 0) {
        filtered.push({
          id: 'moments-feature',
          text: 'Pantallas con Momentos (15s)',
          type: 'venue',
          count: screensWithMoments.length,
          icon: '⚡'
        });
      }
    }

    // Sugerencias de precio si buscan términos relacionados
    if (query.includes('precio') || query.includes('barato') || query.includes('económico') || query.includes('accesible')) {
      const budgetScreens = availableScreens.filter(screen => {
        const price = typeof screen.price === 'number' ? screen.price : 
                     screen.pricing?.bundles?.hourly?.price || 0;
        return price > 0 && price <= 800000; // Menos de 800K COP
      });

      if (budgetScreens.length > 0) {
        filtered.push({
          id: 'budget-friendly',
          text: 'Precios Accesibles',
          type: 'category',
          count: budgetScreens.length,
          icon: '💰'
        });
      }
    }

    return filtered.slice(0, 6); // Limitar a 6 sugerencias
  }, [value, availableScreens]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleSearch = useCallback((searchQuery?: string) => {
    const query = searchQuery || value;
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  }, [value, onSearch]);

  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSuggestionClick?.(suggestion);
    handleSearch(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }, [onChange, onSuggestionClick, handleSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || smartSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < smartSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : smartSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(smartSuggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, smartSuggestions, selectedSuggestionIndex, handleSuggestionSelect, handleSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div 
          className={`relative flex items-center bg-white rounded-2xl shadow-lg transition-all duration-300 ${
            isFocused ? 'ring-4 ring-white/30 shadow-2xl' : 'hover:shadow-xl'
          }`}
        >
          <div className="flex items-center pl-4 sm:pl-6">
            <Search 
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                isFocused ? 'text-[#353FEF]' : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-4 sm:py-5 text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none text-base sm:text-lg font-medium"
            aria-label={ariaLabel}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          
          <div className="flex items-center pr-4 sm:pr-6 gap-2">
            {loading && (
              <Loader2 className="w-5 h-5 text-[#353FEF] animate-spin" aria-hidden="true" />
            )}
            
            {value && !loading && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            
            <button
              onClick={() => handleSearch()}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-[#353FEF] hover:bg-[#2A32C5] text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
              aria-label="Search"
            >
              <span className="hidden sm:inline">Buscar</span>
              <Search className="w-4 h-4 sm:hidden" />
            </button>
          </div>
        </div>
        
        {/* Result count indicator */}
        {value && resultCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-0 text-white/80 text-sm"
          >
            {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'} encontrados
          </motion.div>
        )}
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && smartSuggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <SearchSuggestions
              suggestions={smartSuggestions}
              onSuggestionClick={handleSuggestionSelect}
              selectedIndex={selectedSuggestionIndex}
              query={value}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SmartSearchInput.displayName = 'SmartSearchInput';