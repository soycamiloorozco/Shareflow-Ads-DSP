/**
 * DynamicFilterOptionsDisplay Component
 * 
 * Component to display dynamic filter options with real-time counts,
 * percentages, and trend indicators.
 */

import React from 'react';
import { DynamicFilterOption } from '../../services/DynamicFilterOptionsService';

// =============================================================================
// TYPES
// =============================================================================

export interface DynamicFilterOptionsDisplayProps {
  /** Filter options to display */
  options: DynamicFilterOption[];
  /** Title for the filter section */
  title: string;
  /** Whether to show trend indicators */
  showTrends?: boolean;
  /** Whether to show percentages */
  showPercentages?: boolean;
  /** Whether to show recommendations */
  showRecommendations?: boolean;
  /** Maximum number of options to display */
  maxOptions?: number;
  /** Callback when an option is selected */
  onOptionSelect?: (option: DynamicFilterOption) => void;
  /** Currently selected option IDs */
  selectedOptions?: string[];
  /** Loading state */
  loading?: boolean;
  /** Custom CSS classes */
  className?: string;
}

export interface FilterOptionItemProps {
  /** The filter option to display */
  option: DynamicFilterOption;
  /** Whether the option is selected */
  isSelected: boolean;
  /** Whether to show trend indicator */
  showTrend: boolean;
  /** Whether to show percentage */
  showPercentage: boolean;
  /** Whether to show recommendation badge */
  showRecommendation: boolean;
  /** Click handler */
  onClick: () => void;
}

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Individual filter option item
 */
const FilterOptionItem: React.FC<FilterOptionItemProps> = ({
  option,
  isSelected,
  showTrend,
  showPercentage,
  showRecommendation,
  onClick
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
      default:
        return 'text-gray-600';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={option.disabled}
      className={`
        w-full p-3 rounded-lg border transition-all duration-200 text-left
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
        ${option.disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
        }
        ${option.isRecommended && showRecommendation 
          ? 'ring-2 ring-yellow-200' 
          : ''
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          {/* Icon/Emoji */}
          {(option.icon || option.emoji) && (
            <span className="text-lg">
              {option.icon || option.emoji}
            </span>
          )}
          
          {/* Label */}
          <span className={`font-medium ${option.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {option.label}
          </span>
          
          {/* Recommendation badge */}
          {option.isRecommended && showRecommendation && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⭐ Recomendado
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Trend indicator */}
          {showTrend && (
            <div className={`flex items-center space-x-1 ${getTrendColor(option.trend)}`}>
              <span className="text-sm">{getTrendIcon(option.trend)}</span>
            </div>
          )}
          
          {/* Count and percentage */}
          <div className="text-right">
            <div className={`font-semibold ${option.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {option.count.toLocaleString()}
            </div>
            {showPercentage && (
              <div className={`text-xs ${option.disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                {option.percentage.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Impact indicator */}
      {option.estimatedImpact > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Impacto estimado</span>
            <span>{(option.estimatedImpact * 100).toFixed(0)}% reducción</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${option.estimatedImpact * 100}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
};

/**
 * Loading skeleton for filter options
 */
const FilterOptionSkeleton: React.FC = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="p-3 rounded-lg border border-gray-200 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-24 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="text-right">
            <div className="w-8 h-4 bg-gray-300 rounded mb-1"></div>
            <div className="w-12 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Main component for displaying dynamic filter options
 */
export const DynamicFilterOptionsDisplay: React.FC<DynamicFilterOptionsDisplayProps> = ({
  options,
  title,
  showTrends = true,
  showPercentages = true,
  showRecommendations = true,
  maxOptions,
  onOptionSelect,
  selectedOptions = [],
  loading = false,
  className = ''
}) => {
  // Filter and limit options
  const displayOptions = React.useMemo(() => {
    let filtered = options.filter(option => !option.disabled || option.count > 0);
    
    if (maxOptions && maxOptions > 0) {
      filtered = filtered.slice(0, maxOptions);
    }
    
    return filtered;
  }, [options, maxOptions]);

  // Calculate summary stats
  const stats = React.useMemo(() => {
    const totalCount = displayOptions.reduce((sum, opt) => sum + opt.count, 0);
    const recommendedCount = displayOptions.filter(opt => opt.isRecommended).length;
    const trendingUpCount = displayOptions.filter(opt => opt.trend === 'up').length;
    
    return { totalCount, recommendedCount, trendingUpCount };
  }, [displayOptions]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <FilterOptionSkeleton />
      </div>
    );
  }

  if (displayOptions.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No hay opciones disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          {stats.totalCount.toLocaleString()} resultados
        </div>
      </div>
      
      {/* Summary stats */}
      {(stats.recommendedCount > 0 || stats.trendingUpCount > 0) && (
        <div className="flex items-center space-x-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
          {stats.recommendedCount > 0 && (
            <div className="flex items-center space-x-1">
              <span>⭐</span>
              <span>{stats.recommendedCount} recomendadas</span>
            </div>
          )}
          {stats.trendingUpCount > 0 && (
            <div className="flex items-center space-x-1">
              <span>📈</span>
              <span>{stats.trendingUpCount} en tendencia</span>
            </div>
          )}
        </div>
      )}
      
      {/* Options list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayOptions.map((option) => (
          <FilterOptionItem
            key={option.id}
            option={option}
            isSelected={selectedOptions.includes(option.id)}
            showTrend={showTrends}
            showPercentage={showPercentages}
            showRecommendation={showRecommendations}
            onClick={() => onOptionSelect?.(option)}
          />
        ))}
      </div>
      
      {/* Show more indicator */}
      {maxOptions && options.length > maxOptions && (
        <div className="text-center text-sm text-gray-500 pt-2 border-t">
          Mostrando {maxOptions} de {options.length} opciones
        </div>
      )}
    </div>
  );
};

export default DynamicFilterOptionsDisplay;