import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Check, X, ShoppingBag, Car, TreePine, Stethoscope, GraduationCap, Banknote, Home, Landmark, Trophy } from 'lucide-react';
import { FilterOption } from '../../types';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  availableCategories: FilterOption[];
  className?: string;
  'aria-label'?: string;
}

const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    retail: ShoppingBag,
    mall: ShoppingBag,
    transport: Car,
    transit: Car,
    outdoor: TreePine,
    billboard: TreePine,
    health: Stethoscope,
    education: GraduationCap,
    office: Building2,
    leisure: Trophy,
    stadium: Trophy,
    cinema: Trophy,
    government: Landmark,
    financial: Banknote,
    residential: Home,
    airport: Car
  };

  const key = Object.keys(iconMap).find(k => categoryId.toLowerCase().includes(k));
  return key ? iconMap[key] : Building2;
};

export const CategoryFilter = React.memo<CategoryFilterProps>(({
  selectedCategories,
  onCategoriesChange,
  availableCategories,
  className = '',
  'aria-label': ariaLabel = 'Category filter'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return availableCategories;
    
    return availableCategories.filter(category => 
      category.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableCategories, searchQuery]);

  // Group categories by type for better organization
  const groupedCategories = useMemo(() => {
    const groups: Record<string, FilterOption[]> = {
      'Comercial': [],
      'Transporte': [],
      'Entretenimiento': [],
      'Otros': []
    };

    filteredCategories.forEach(category => {
      const categoryId = category.id.toLowerCase();
      const categoryLabel = category.label.toLowerCase();
      
      if (categoryId.includes('mall') || categoryId.includes('retail') || categoryLabel.includes('comercial')) {
        groups['Comercial'].push(category);
      } else if (categoryId.includes('transport') || categoryId.includes('airport') || categoryId.includes('metro')) {
        groups['Transporte'].push(category);
      } else if (categoryId.includes('stadium') || categoryId.includes('cinema') || categoryId.includes('leisure')) {
        groups['Entretenimiento'].push(category);
      } else {
        groups['Otros'].push(category);
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, categories]) => categories.length > 0)
    );
  }, [filteredCategories]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  }, [selectedCategories, onCategoriesChange]);

  const handleClearAll = useCallback(() => {
    onCategoriesChange([]);
  }, [onCategoriesChange]);

  const handleSelectGroup = useCallback((groupCategories: FilterOption[]) => {
    const groupIds = groupCategories.map(cat => cat.id);
    const allSelected = groupIds.every(id => selectedCategories.includes(id));
    
    if (allSelected) {
      // Deselect all in group
      onCategoriesChange(selectedCategories.filter(id => !groupIds.includes(id)));
    } else {
      // Select all in group
      const newSelection = [...new Set([...selectedCategories, ...groupIds])];
      onCategoriesChange(newSelection);
    }
  }, [selectedCategories, onCategoriesChange]);

  return (
    <div className={`space-y-4 ${className}`} aria-label={ariaLabel}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors text-sm"
          aria-label="Search categories"
        />
      </div>

      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Categorías seleccionadas ({selectedCategories.length})
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedCategories.map((categoryId) => {
                const category = availableCategories.find(c => c.id === categoryId);
                if (!category) return null;
                
                const Icon = getCategoryIcon(category.id);
                
                return (
                  <motion.span
                    key={categoryId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#353FEF] text-white text-sm rounded-full"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{category.label}</span>
                    <button
                      onClick={() => handleCategoryToggle(categoryId)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${category.label} from selection`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Categories by Groups */}
      <div className="max-h-80 overflow-y-auto space-y-4">
        {Object.keys(groupedCategories).length > 0 ? (
          Object.entries(groupedCategories).map(([groupName, categories]) => (
            <div key={groupName} className="space-y-2">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-base">
                    {groupName === 'Comercial' ? '🏬' : 
                     groupName === 'Transporte' ? '🚗' : 
                     groupName === 'Entretenimiento' ? '🎭' : '🏢'}
                  </span>
                  {groupName}
                </h4>
                <button
                  onClick={() => handleSelectGroup(categories)}
                  className="text-xs text-[#353FEF] hover:text-[#2A32C5] font-medium"
                >
                  {categories.every(cat => selectedCategories.includes(cat.id)) ? 'Deseleccionar' : 'Seleccionar'} grupo
                </button>
              </div>

              {/* Group Categories */}
              <div className="grid grid-cols-1 gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  const Icon = getCategoryIcon(category.id);
                  
                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-[#353FEF]/10' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            isSelected ? 'text-[#353FEF]' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-gray-500">
                            {category.count} {category.count === 1 ? 'pantalla' : 'pantallas'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {category.count > 15 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 bg-[#353FEF] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#353FEF] hover:text-[#2A32C5] mt-1"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';