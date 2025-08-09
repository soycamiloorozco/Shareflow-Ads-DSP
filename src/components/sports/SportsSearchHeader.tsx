import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Info, Trophy } from 'lucide-react';
import { CartIcon } from '../cart/CartIcon';

interface SportsSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInfoClick?: () => void;
  filteredCount: number;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const SportsSearchHeader = React.memo<SportsSearchHeaderProps>(({
  searchQuery,
  onSearchChange,
  onInfoClick,
  filteredCount,
  loading = false,
  className = '',
  'aria-label': ariaLabel = 'Search header for sports events'
}) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
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
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                      Eventos Deportivos
                    </h1>
                    <p className="text-sm text-gray-600 hidden sm:block">
                      Momentos publicitarios en vivo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Buscar equipos, estadios o eventos..."
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                  aria-label="Buscar eventos deportivos"
                />
                {loading && (
                  <div className="absolute inset-y-0 right-12 flex items-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#353FEF] rounded-full animate-spin"></div>
                  </div>
                )}
                {filteredCount > 0 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-sm text-gray-500">
                      {filteredCount} evento{filteredCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Cart and Info */}
            <div className="flex-shrink-0 hidden lg:flex items-center gap-3">
              {/* Cart Icon */}
              <CartIcon 
                size="md" 
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200"
              />

              {/* Info Button */}
              <motion.button
                onClick={onInfoClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-[#353FEF] to-[#4F46E5] text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 border border-[#353FEF]/20"
                aria-label="Información sobre eventos deportivos"
              >
                {/* Background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#353FEF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon with animation */}
                <div className="relative z-10 w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                  <Info className="w-3.5 h-3.5 text-white" />
                </div>
                
                {/* Text */}
                <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300">
                  ¿Cómo funciona?
                </span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out skew-x-12" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

SportsSearchHeader.displayName = 'SportsSearchHeader';