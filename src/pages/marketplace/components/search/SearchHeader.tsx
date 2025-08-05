import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../../components/Button';
import { SmartSearchInput } from './SmartSearchInput';
import { SearchHeaderProps } from '../../types';
import { Screen } from '../../types';

export const SearchHeader = React.memo<SearchHeaderProps & { availableScreens?: Screen[] }>(({
  searchQuery,
  onSearchChange,
  onInfoClick,
  filteredCount,
  suggestions = [],
  loading = false,
  className = '',
  'aria-label': ariaLabel = 'Search header for marketplace screens',
  availableScreens = [] // Nueva prop para los datos de pantallas de la API
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
      className={`bg-white border-b border-gray-200 shadow-sm ${className}`}
      aria-label={ariaLabel}
    >
      {/* Compact Header Design */}
      <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8"
          >
            {/* Left Side - Branding & Title */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 mb-2 lg:mb-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#353FEF] to-[#6366F1] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                      Marketplace
                    </h1>
                    <p className="text-sm text-gray-600 hidden sm:block">
                      Pantallas digitales en Colombia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Search */}
            <div className="flex-1 max-w-2xl">
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
                availableScreens={availableScreens}
              />
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 hidden lg:block">
              <Button
                variant="outline" 
                size="md"
                onClick={onInfoClick}
                className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
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