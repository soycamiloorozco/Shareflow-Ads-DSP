import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mic, ArrowRight, Sparkles, MapPin, Calendar, Target, TrendingUp, X, Bot
} from 'lucide-react';

interface SearchSuggestion {
  type: 'location' | 'event' | 'category' | 'trending';
  text: string;
  icon: typeof MapPin;
}

interface SmartSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearchInput({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "IA te ayuda a encontrar la pantalla perfecta...",
  className = ""
}: SmartSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const suggestions: SearchSuggestion[] = [
    { type: 'location', text: 'Estadios en Bogotá', icon: MapPin },
    { type: 'location', text: 'Centros Comerciales en Medellín', icon: MapPin },
    { type: 'event', text: 'Universidades en Cali', icon: Calendar },
    { type: 'category', text: 'Aeropuertos principales', icon: Target },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value);
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    onChange(suggestionText);
    onSearch(suggestionText);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <div ref={searchContainerRef} className={`relative w-full ${className}`}>
      {/* Main Search Bar */}
      <div className={`
        relative flex items-center bg-white/95 backdrop-blur-lg rounded-2xl border transition-all duration-300 overflow-hidden
        ${isFocused ? 'border-blue-300 shadow-2xl ring-4 ring-blue-100/50' : 'border-white/50 shadow-xl'}
        ${isFocused ? 'scale-105' : 'scale-100'}
      `}>
        {/* AI Bot Icon - Left */}
        <div className="flex items-center justify-center pl-5 pr-3">
          <motion.div
            animate={isFocused ? { 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ 
              duration: 2,
              repeat: isFocused ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* AI Icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            
            {/* AI Glow Effect */}
            {isFocused && (
              <motion.div
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 w-8 h-8 bg-cyan-400/40 rounded-lg blur-sm"
              />
            )}
          </motion.div>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300/50"></div>

        {/* Search Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (value.length === 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay to allow clicking on suggestions
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-5 bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-500 font-medium text-lg"
        />

        {/* Clear Button */}
        {value && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              onChange('');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        )}

        {/* Voice Search Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 hover:bg-gray-100/80 rounded-full transition-colors mr-3 group"
          onClick={(e) => {
            e.preventDefault();
            // Voice search functionality would go here
          }}
        >
          <Mic className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </motion.button>

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          className="flex items-center gap-3 px-8 py-3 mr-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Search className="w-5 h-5" />
          <span className="text-lg">Buscar</span>
          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden z-50"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-500" />
                <span className="font-semibold text-gray-700">Búsquedas sugeridas</span>
              </div>
              
              {/* Suggestions List */}
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-xl transition-all duration-200 text-left group"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <suggestion.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">
                        {suggestion.text}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {suggestion.type === 'location' ? 'Ubicación' : 
                         suggestion.type === 'event' ? 'Evento' : 
                         suggestion.type === 'category' ? 'Categoría' : 'Tendencia'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </motion.button>
                ))}
              </div>

              {/* Footer tip */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Bot className="w-4 h-4" />
                  <span>Tip: Usa términos específicos como "estadios", "centros comerciales" o nombres de ciudades</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 