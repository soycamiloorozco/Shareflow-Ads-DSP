import React from 'react';
import { History } from 'lucide-react';
import { FilterState } from '../../types/filter.types';

interface SavedFiltersManagerProps {
  onLoadFilter: (savedFilter: any) => void;
  currentFilterState: FilterState;
}

export const SavedFiltersManager: React.FC<SavedFiltersManagerProps> = ({
  onLoadFilter,
  currentFilterState
}) => {
  return (
    <div className="text-center py-12 text-gray-500">
      <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">Saved Filters</h3>
      <p className="text-gray-600 mb-4">
        Manage your saved filter combinations and quick access presets
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-green-700">
          Save your favorite filter combinations for quick access. 
          Share filters with team members and organize them by categories.
        </p>
      </div>
    </div>
  );
};