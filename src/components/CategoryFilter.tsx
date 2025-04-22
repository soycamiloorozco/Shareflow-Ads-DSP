import React, { useState } from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { categories } from '../data/mockData';
import { ScreenCategory } from '../types';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  onSearch: (query: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategorySelect, onSearch }: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ubicación o tipo de pantalla"
            className="w-full pl-12 pr-12 py-3 bg-white rounded-[100px] border border-[#E8E8EB] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-[0px_1px_2px_0px_rgba(31,41,55,0.08)]"
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <SlidersHorizontal className="w-5 h-5 text-neutral-400" />
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center justify-center w-12 h-12 rounded-[100px] border border-[#E8E8EB] bg-[#FEFEFE]
            shadow-[0px_1px_2px_0px_rgba(31,41,55,0.08)] transition-colors duration-200
            ${isExpanded 
              ? 'bg-primary border-primary text-white'
              : 'hover:border-primary hover:text-primary'
            }
          `}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Categories Grid */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`
              px-4 py-2 rounded-[100px] border transition-all
              ${category.id === selectedCategory
                ? 'border-primary bg-primary text-white'
                : 'border-[#E8E8EB] bg-[#FEFEFE] hover:border-primary text-neutral-800'
              }
              shadow-[0px_1px_2px_0px_rgba(31,41,55,0.08)]
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{category.emoji}</span>
              <span className="font-medium">{category.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}