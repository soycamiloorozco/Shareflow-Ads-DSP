import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Search, X, Loader2, MapPin, Monitor, Building2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchSuggestion } from '../../types/filter.types';

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
  'aria-label': ariaLabel = 'Smart search input for marketplace'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate smart suggestions based on input
  const smartSuggestions = useMemo(() => {
    if (!value.trim() || value.length < 2) {
      // Show popular suggestions when no input
      return [
        { id: 'bogota', text: 'Bogotá', type: 'location' as const, count: 45, icon: '📍' },
        { id: 'medellin', text: 'Medellín', type: 'location' as const, count: 32, icon: '📍' },
        { id: 'mall', text: 'Centros Comerciales', type: 'category' as const, count: 28, icon: '🏬' },
        { id: 'billboard', text: 'Vallas Publicitarias', type: 'category' as const, count: 56, icon: '📺' },
        { id: 'moments', text: 'Pantallas con Momentos', type: 'venue' as const, count: 23, icon: '⚡' }
      ];
    }

    const query = value.toLowerCase().trim();
    const filtered: SearchSuggestion[] = [];

    // Location suggestions
    const locations = [
      { name: 'Bogotá', count: 45 },
      { name: 'Medellín', count: 32 },
      { name: 'Cali', count: 28 },
      { name: 'Barranquilla', count: 18 },
      { name: 'Cartagena', count: 12 },
      { name: 'Zona Rosa', count: 15 },
      { name: 'El Dorado', count: 8 },
      { name: 'Chapinero', count: 22 }
    ];

    locations.forEach(location => {
      if (location.name.toLowerCase().includes(query)) {
        filtered.push({
          id: `location-${location.name.toLowerCase()}`,
          text: location.name,
          type: 'location',
          count: location.count,
          icon: '📍'
        });
      }
    });

    // Category suggestions
    const categories = [
      { name: 'Centros Comerciales', count: 28 },
      { name: 'Vallas Publicitarias', count: 56 },
      { name: 'Transporte', count: 34 },
      { name: 'Aeropuertos', count: 8 },
      { name: 'Estadios', count: 12 },
      { name: 'Universidades', count: 16 }
    ];

    categories.forEach(category => {
      if (category.name.toLowerCase().includes(query)) {
        filtered.push({
          id: `category-${category.name.toLowerCase()}`,
          text: category.name,
          type: 'category',
          count: category.count,
          icon: '🏢'
        });
      }
    });

    // Screen name suggestions
    const screens = [
      'Pantalla LED Perimetral',
      'Gran Pantalla Digital',
      'Valla Digital Premium',
      'Pantalla Principal',
      'Pantalla Interactiva'
    ];

    screens.forEach(screen => {
      if (screen.toLowerCase().includes(query)) {
        filtered.push({
          id: `screen-${screen.toLowerCase()}`,
          text: screen,
          type: 'screen',
          icon: '📺'
        });
      }
    });

    // Feature suggestions
    if (query.includes('momento') || query.includes('15') || query.includes('segundo')) {
      filtered.push({
        id: 'moments-feature',
        text: 'Pantallas con Momentos (15s)',
        type: 'venue',
        count: 23,
        icon: '⚡'
      });
    }

    return filtered.slice(0, 6); // Limit to 6 suggestions
  }, [value]);

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