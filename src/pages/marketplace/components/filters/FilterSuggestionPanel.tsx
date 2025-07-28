import React from 'react';
import { Zap } from 'lucide-react';
import { FilterState } from '../../types/filter.types';

interface FilterSuggestionPanelProps {
  currentFilterState: FilterState;
  onApplySuggestion: (filterState: FilterState) => void;
}

export const FilterSuggestionPanel: React.FC<FilterSuggestionPanelProps> = ({
  currentFilterState,
  onApplySuggestion
}) => {
  return (
    <div className="text-center py-12 text-gray-500">
      <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">Smart Suggestions</h3>
      <p className="text-gray-600 mb-4">
        Get intelligent filter recommendations based on your current selection
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-yellow-700">
          AI-powered filter suggestions will help you discover relevant screens 
          and optimize your search criteria for better results.
        </p>
      </div>
    </div>
  );
};