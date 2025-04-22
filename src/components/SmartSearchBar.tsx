import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Calendar, Target, TrendingUp, Mic, X, 
  ChevronRight, Sparkles, Bot
} from 'lucide-react';
import { Button } from './Button';

interface SearchSuggestion {
  type: 'location' | 'event' | 'category' | 'trending';
  text: string;
  icon: typeof MapPin;
}

interface SmartSearchBarProps {
  onSearch: (query: string) => void;
}

export function SmartSearchBar({ onSearch }: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const suggestions: SearchSuggestion[] = [
    { type: 'location', text: 'El Poblado', icon: MapPin },
    { type: 'event', text: 'Nacional vs Medellín', icon: Calendar },
    { type: 'category', text: 'Pantallas LED Estadio', icon: Target },
    { type: 'trending', text: 'Centros Comerciales', icon: TrendingUp },
  ];

  const recentSearches = [
    'Pantallas en estadios',
    'Vallas digitales centro',
    'Eventos deportivos'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <div className={`
        relative flex items-center gap-3 bg-white rounded-xl border transition-all duration-200
        ${isFocused ? 'border-primary shadow-lg' : 'border-neutral-200'}
      `}>
        <Search className="w-5 h-5 text-neutral-400 ml-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="¿Dónde quieres brillar hoy?"
          className="w-full px-3 py-3 bg-transparent focus:outline-none text-neutral-800 placeholder:text-neutral-400"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-2 hover:bg-neutral-100 rounded-full"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}
        <div className="flex items-center gap-2 pr-4">
          <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Mic className="w-5 h-5 text-neutral-400" />
          </button>
          <Button
            variant="primary"
            size="sm"
            icon={Search}
            onClick={handleSearch}
          >
            Buscar
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden z-50"
          >
            <div className="p-4">
              {query ? (
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors text-left"
                      onClick={() => {
                        setQuery(suggestion.text);
                        setShowSuggestions(false);
                        handleSearch();
                      }}
                    >
                      <suggestion.icon className="w-5 h-5 text-neutral-400" />
                      <span className="flex-1">{suggestion.text}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">
                    Búsquedas recientes
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center gap-2 p-3 hover:bg-neutral-50 rounded-lg transition-colors text-left"
                        onClick={() => {
                          setQuery(search);
                          setShowSuggestions(false);
                          handleSearch();
                        }}
                      >
                        <Search className="w-4 h-4 text-neutral-400" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}