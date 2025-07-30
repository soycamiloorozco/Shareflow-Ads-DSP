import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../../components/Button';
import { SmartSearchInput } from './SmartSearchInput';
import { SearchHeaderProps } from '../../types';

export const SearchHeader = React.memo<SearchHeaderProps>(({
  searchQuery,
  onSearchChange,
  onInfoClick,
  filteredCount,
  suggestions = [],
  loading = false,
  className = '',
  'aria-label': ariaLabel = 'Search header for marketplace screens'
}) => {
  const handleSmartSearch = useCallback((query: string) => {
    onSearchChange(query);
  }, [onSearchChange]);

  const handleSuggestionClick = useCallback((suggestion: any) => {
    console.log('Selected suggestion:', suggestion);
    onSearchChange(suggestion.text || suggestion);
  }, [onSearchChange]);

  return (
    <div 
      className={`pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-br from-[#353FEF] via-[#4F46E5] to-[#6366F1] border-b border-blue-200 ${className}`}
      aria-label={ariaLabel}
    >
      {/* Responsive Container with Fluid Breakpoints */}
      <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block mb-3 sm:mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md border border-white/30 transition-all duration-300 hover:bg-white/30">
                  Shareflow Ads
                </span>
              </div>
              
              {/* Fluid Typography with clamp() */}
              <h1 
                className="font-bold mb-3 sm:mb-4 text-white leading-tight" 
                style={{ 
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)', 
                  lineHeight: 'clamp(1.2, 1.3, 1.4)' 
                }}
              >
                Marketplace de Pantallas Digitales
              </h1>
              
              <p 
                className="text-blue-100 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed" 
                style={{ 
                  fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                  lineHeight: 'clamp(1.5, 1.6, 1.7)' 
                }}
              >
                Explora y reserva pantallas publicitarias en toda Colombia. Encuentra oportunidades únicas para tus campañas con IA.
              </p>
            </motion.div>
          </div>
        
          {/* Search Section with Enhanced Responsive Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-6 sm:mb-8">
              <SmartSearchInput
                value={searchQuery}
                onChange={onSearchChange}
                onSearch={handleSmartSearch}
                placeholder="Buscar pantallas, ubicaciones o categorías..."
                resultCount={filteredCount}
                onSuggestionClick={handleSuggestionClick}
                suggestions={suggestions}
                loading={loading}
                className="w-full"
                aria-label="Search for screens, locations, or categories"
              />
            </div>
          
            <div className="flex justify-center">
              <Button
                variant="outline" 
                size="md"
                onClick={onInfoClick}
                className="rounded-xl bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 shadow-lg transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                aria-label="Learn how the marketplace works"
              >
                ¿Cómo funciona?
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

SearchHeader.displayName = 'SearchHeader';