import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Search, Filter } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const ScreenCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="text" className="w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton className="w-16 h-10" />
      </div>
    </div>
  </div>
);

export const ScreenGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
    {[...Array(count)].map((_, index) => (
      <ScreenCardSkeleton key={index} />
    ))}
  </div>
);

export const SearchLoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center gap-3 text-gray-600">
      <LoadingSpinner size="md" className="text-[#353FEF]" />
      <span className="text-sm font-medium">Buscando pantallas...</span>
    </div>
  </div>
);

export const FilterLoadingState: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="animate-pulse">
        <Skeleton variant="text" className="w-1/4 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

interface EmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  action,
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`text-center py-16 ${className}`}
  >
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
      {description}
    </p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors"
      >
        {action.label}
      </button>
    )}
  </motion.div>
);

export const NoResultsState: React.FC<{ onClearFilters?: () => void }> = ({ 
  onClearFilters 
}) => (
  <EmptyState
    icon={Filter}
    title="No se encontraron pantallas"
    description="No hay pantallas disponibles que coincidan con tus filtros actuales. Intenta ajustar los criterios de búsqueda para encontrar más opciones."
    action={onClearFilters ? {
      label: 'Limpiar filtros',
      onClick: onClearFilters
    } : undefined}
  />
);