import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Monitor, Building2, Sparkles, TrendingUp } from 'lucide-react';
import { SearchSuggestion } from '../../types/filter.types';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  selectedIndex: number;
  query: string;
  className?: string;
}

// Constants
const SUGGESTION_ANIMATION_DELAY = 0.05;
const POPULAR_THRESHOLD = 30;

const ICON_MAP = {
  location: MapPin,
  screen: Monitor,
  category: Building2,
  venue: Sparkles,
  recent: TrendingUp,
  personalized: Sparkles,
} as const;

const TYPE_LABELS = {
  location: 'Ubicación',
  screen: 'Pantalla',
  category: 'Categoría',
  venue: 'Característica',
  recent: 'Reciente',
  personalized: 'Para ti',
} as const;

export const SearchSuggestions = React.memo<SearchSuggestionsProps>(({
  suggestions,
  onSuggestionClick,
  selectedIndex,
  query,
  className = ''
}) => {
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    onSuggestionClick(suggestion);
  }, [onSuggestionClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, suggestion: SearchSuggestion) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSuggestionClick(suggestion);
    }
  }, [handleSuggestionClick]);

  // Memoized utility functions
  const getIconForType = useMemo(() => (type: SearchSuggestion['type']) => {
    return ICON_MAP[type] || TrendingUp;
  }, []);

  const getTypeLabel = useMemo(() => (type: SearchSuggestion['type']) => {
    return TYPE_LABELS[type] || 'Sugerencia';
  }, []);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  if (suggestions.length === 0) return null;

  // Group suggestions for a richer, sectioned UI (para ti / recientes / otros)
  const personalized = suggestions.filter(s => s.type === 'personalized');
  const recent = suggestions.filter(s => s.type === 'recent');
  const others = suggestions.filter(s => s.type !== 'personalized' && s.type !== 'recent');

  return (
    <div 
      className={`bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ${className}`}
      role="listbox"
      aria-label="Search suggestions"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="max-h-80 overflow-y-auto">
        {/* Personalized section */}
        {personalized.length > 0 && (
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Para ti</div>
            {personalized.map((suggestion, pIndex) => {
              const index = suggestions.findIndex(s => s.id === suggestion.id);
              const Icon = getIconForType(suggestion.type);
              const isSelected = index === selectedIndex;
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: pIndex * SUGGESTION_ANIMATION_DELAY }}
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'bg-[#353FEF]/10 border-l-4 border-[#353FEF]' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onKeyDown={(e) => handleKeyDown(e, suggestion)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                >
                  <div className={`flex-shrink-0 p-3 rounded-xl ${
                    isSelected ? 'bg-[#353FEF] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {suggestion.icon ? (
                      <span className="text-base" aria-hidden="true">{suggestion.icon}</span>
                    ) : (
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-base ${isSelected ? 'text-[#353FEF]' : 'text-gray-900'}`}>{highlightText(suggestion.text, query)}</span>
                      {suggestion.count && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{suggestion.count}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{getTypeLabel(suggestion.type)}</div>
                  </div>
                </motion.div>
              );
            })}
            <div className="h-px bg-gray-100" />
          </div>
        )}

        {/* Recent section */}
        {recent.length > 0 && (
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Recientes</div>
            {recent.map((suggestion, rIndex) => {
              const index = suggestions.findIndex(s => s.id === suggestion.id);
              const Icon = getIconForType(suggestion.type);
              const isSelected = index === selectedIndex;
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rIndex * SUGGESTION_ANIMATION_DELAY }}
                  className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'bg-[#353FEF]/10 border-l-4 border-[#353FEF]' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onKeyDown={(e) => handleKeyDown(e, suggestion)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                >
                  <div className={`flex-shrink-0 p-3 rounded-xl ${
                    isSelected ? 'bg-[#353FEF] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {suggestion.icon ? (
                      <span className="text-base" aria-hidden="true">{suggestion.icon}</span>
                    ) : (
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-base ${isSelected ? 'text-[#353FEF]' : 'text-gray-900'}`}>{highlightText(suggestion.text, query)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{getTypeLabel(suggestion.type)}</div>
                  </div>
                </motion.div>
              );
            })}
            <div className="h-px bg-gray-100" />
          </div>
        )}

        {/* Other suggestions (popular/precise) */}
        {(others.length > 0) && (
          <div className="py-2">
            {(query.trim().length < 2) && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Populares</div>
            )}
          </div>
        )}
        {others.map((suggestion, index) => {
          const Icon = getIconForType(suggestion.type);
          const isSelected = suggestions.findIndex(s => s.id === suggestion.id) === selectedIndex;
          
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * SUGGESTION_ANIMATION_DELAY }}
              className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? 'bg-[#353FEF]/10 border-l-4 border-[#353FEF]' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onKeyDown={(e) => handleKeyDown(e, suggestion)}
              role="option"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 p-3 rounded-xl ${
                isSelected ? 'bg-[#353FEF] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {suggestion.icon ? (
                  <span className="text-base" aria-hidden="true">
                    {suggestion.icon}
                  </span>
                ) : (
                  <Icon className="w-4 h-4" aria-hidden="true" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-base ${
                    isSelected ? 'text-[#353FEF]' : 'text-gray-900'
                  }`}>
                    {highlightText(suggestion.text, query)}
                  </span>
                  
                  {suggestion.count && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {suggestion.count}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-0.5">
                  {getTypeLabel(suggestion.type)}
                  {suggestion.metadata?.description && (
                    <span> • {String(suggestion.metadata.description)}</span>
                  )}
                </div>
              </div>
              
              {/* Trending indicator for popular suggestions */}
              {suggestion.count && suggestion.count > POPULAR_THRESHOLD && (
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Footer with search tip */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Usa ↑↓ para navegar, Enter para seleccionar</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">
              Esc
            </kbd>
            para cerrar
          </span>
        </div>
      </div>
    </div>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';