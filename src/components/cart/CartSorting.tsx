import React from 'react';
import { ArrowUpDown, Calendar, DollarSign, Users, Clock } from 'lucide-react';

export type SortOption = 'date' | 'price' | 'audience' | 'name' | 'added';
export type SortDirection = 'asc' | 'desc';

interface CartSortingProps {
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void;
  className?: string;
}

export const CartSorting: React.FC<CartSortingProps> = ({
  sortBy,
  sortDirection,
  onSortChange,
  className = ''
}) => {
  const sortOptions = [
    { value: 'date' as SortOption, label: 'Fecha', icon: Calendar },
    { value: 'price' as SortOption, label: 'Precio', icon: DollarSign },
    { value: 'audience' as SortOption, label: 'Audiencia', icon: Users },
    { value: 'name' as SortOption, label: 'Nombre', icon: ArrowUpDown },
    { value: 'added' as SortOption, label: 'Agregado', icon: Clock },
  ];

  const handleSortClick = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle direction if same option
      onSortChange(option, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new option with default direction
      const defaultDirection = option === 'date' || option === 'added' ? 'asc' : 'desc';
      onSortChange(option, defaultDirection);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-gray-600 font-medium">Ordenar por:</span>
      <div className="flex items-center gap-1">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = sortBy === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleSortClick(option.value)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{option.label}</span>
              {isActive && (
                <span className="text-xs">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CartSorting;