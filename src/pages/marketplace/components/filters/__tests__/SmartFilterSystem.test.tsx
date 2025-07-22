import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartFilterSystem } from '../SmartFilterSystem';
import { FilterState } from '../../../types/filter.types';

// Mock the services
jest.mock('../../../services/ConditionalFilterEngine', () => ({
  conditionalFilterEngine: {
    processFilters: jest.fn().mockReturnValue({}),
  }
}));

jest.mock('../../../services/DynamicFilterOptionsService', () => ({
  dynamicFilterOptionsService: {
    getEstimatedResultCount: jest.fn().mockResolvedValue(150),
  }
}));

jest.mock('../../../services/SmartSuggestionsEngine', () => ({
  smartSuggestionsEngine: {
    generateSuggestions: jest.fn().mockResolvedValue([]),
  }
}));

jest.mock('../../../services/SavedFiltersService', () => ({
  savedFiltersService: {
    saveFilter: jest.fn().mockResolvedValue({ id: 'test-id', name: 'Test Filter' }),
  }
}));

describe('SmartFilterSystem', () => {
  const mockFilterState: FilterState = {
    searchQuery: '',
    location: {},
    priceRange: {},
    categories: [],
    tags: [],
    availability: {},
    sortBy: 'relevance',
    sortOrder: 'desc'
  };

  const mockProps = {
    filterState: mockFilterState,
    onFilterChange: jest.fn(),
    onApplyFilters: jest.fn(),
    isLoading: false,
    resultCount: 100
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with header', () => {
      render(<SmartFilterSystem {...mockProps} />);
      
      expect(screen.getByText('Smart Filters')).toBeInTheDocument();
      expect(screen.getByText('No filters applied')).toBeInTheDocument();
    });

    it('should show filter complexity when filters are active', () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test',
        location: { city: 'New York' }
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      expect(screen.getByText('2 active criteria')).toBeInTheDocument();
    });

    it('should show result count when provided', () => {
      render(<SmartFilterSystem {...mockProps} resultCount={150} />);
      
      // Need to expand first to see the result count
      fireEvent.click(screen.getByRole('button', { name: /expand/i }));
      
      expect(screen.getByText('150 results found')).toBeInTheDocument();
    });
  });

  describe('Expansion and Tabs', () => {
    it('should expand and collapse when clicking the expand button', async () => {
      render(<SmartFilterSystem {...mockProps} />);
      
      const expandButton = screen.getByRole('button', { name: /expand/i });
      
      // Initially collapsed
      expect(screen.queryByText('Basic')).not.toBeInTheDocument();
      
      // Expand
      fireEvent.click(expandButton);
      await waitFor(() => {
        expect(screen.getByText('Basic')).toBeInTheDocument();
      });
      
      // Collapse
      fireEvent.click(expandButton);
      await waitFor(() => {
        expect(screen.queryByText('Basic')).not.toBeInTheDocument();
      });
    });

    it('should switch between tabs', async () => {
      render(<SmartFilterSystem {...mockProps} />);
      
      // Expand first
      fireEvent.click(screen.getByRole('button', { name: /expand/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Basic')).toBeInTheDocument();
      });

      // Switch to Advanced tab
      fireEvent.click(screen.getByText('Advanced'));
      expect(screen.getByText('Advanced conditional filter builder coming soon...')).toBeInTheDocument();

      // Switch to Saved tab
      fireEvent.click(screen.getByText('Saved'));
      expect(screen.getByText('Saved filters manager coming soon...')).toBeInTheDocument();

      // Switch to Suggestions tab
      fireEvent.click(screen.getByText('Suggestions'));
      expect(screen.getByText('Smart suggestions panel coming soon...')).toBeInTheDocument();
    });
  });

  describe('Basic Filter Controls', () => {
    beforeEach(async () => {
      render(<SmartFilterSystem {...mockProps} />);
      fireEvent.click(screen.getByRole('button', { name: /expand/i }));
      await waitFor(() => {
        expect(screen.getByText('Basic')).toBeInTheDocument();
      });
    });

    it('should handle search query changes', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search screens, locations, or keywords...');
      
      await user.type(searchInput, 'test search');
      
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilterState,
        searchQuery: 'test search'
      });
    });

    it('should handle location changes', async () => {
      const user = userEvent.setup();
      const cityInput = screen.getByPlaceholderText('City');
      const stateInput = screen.getByPlaceholderText('State');
      
      await user.type(cityInput, 'New York');
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilterState,
        location: { city: 'New York' }
      });

      await user.type(stateInput, 'NY');
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilterState,
        location: { state: 'NY' }
      });
    });

    it('should handle price range changes', async () => {
      const user = userEvent.setup();
      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');
      
      await user.type(minInput, '100');
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilterState,
        priceRange: { min: 100 }
      });

      await user.type(maxInput, '500');
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilterState,
        priceRange: { max: 500 }
      });
    });
  });

  describe('Filter Actions', () => {
    it('should show action buttons when filters are active', () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test'
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      expect(screen.getByTitle('Save Filter')).toBeInTheDocument();
      expect(screen.getByTitle('Share Filter')).toBeInTheDocument();
      expect(screen.getByTitle('Clear All Filters')).toBeInTheDocument();
    });

    it('should clear all filters when clear button is clicked', () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test',
        location: { city: 'New York' }
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      fireEvent.click(screen.getByTitle('Clear All Filters'));
      
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        searchQuery: '',
        location: {},
        priceRange: {},
        categories: [],
        tags: [],
        availability: {},
        sortBy: 'relevance',
        sortOrder: 'desc'
      });
    });

    it('should call onApplyFilters when apply button is clicked', async () => {
      render(<SmartFilterSystem {...mockProps} />);
      
      // Expand to see the apply button
      fireEvent.click(screen.getByRole('button', { name: /expand/i }));
      
      await waitFor(() => {
        const applyButton = screen.getByText('Apply Filters');
        fireEvent.click(applyButton);
        expect(mockProps.onApplyFilters).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Preview', () => {
    it('should show filter preview when filters are active', async () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test'
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      // Expand to see the preview
      fireEvent.click(screen.getByRole('button', { name: /expand/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Filter Preview')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument(); // Estimated results
      });
    });

    it('should hide preview when hide button is clicked', async () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test'
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      // Expand to see the preview
      fireEvent.click(screen.getByRole('button', { name: /expand/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Filter Preview')).toBeInTheDocument();
      });

      // Hide preview
      const hideButton = screen.getByRole('button', { name: /hide preview/i });
      fireEvent.click(hideButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Filter Preview')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state on apply button', async () => {
      render(<SmartFilterSystem {...mockProps} isLoading={true} />);
      
      // Expand to see the apply button
      fireEvent.click(screen.getByRole('button', { name: /expand/i }));
      
      await waitFor(() => {
        const applyButton = screen.getByText('Apply Filters');
        expect(applyButton).toBeDisabled();
        expect(applyButton.querySelector('.animate-spin')).toBeInTheDocument();
      });
    });
  });

  describe('Save Filter Dialog', () => {
    it('should open save dialog when save button is clicked', async () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test'
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      fireEvent.click(screen.getByTitle('Save Filter'));
      
      await waitFor(() => {
        expect(screen.getByText('Save Filter')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('My Custom Filter')).toBeInTheDocument();
      });
    });

    it('should close save dialog when cancel is clicked', async () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test'
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      fireEvent.click(screen.getByTitle('Save Filter'));
      
      await waitFor(() => {
        expect(screen.getByText('Save Filter')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.queryByText('Save Filter')).not.toBeInTheDocument();
      });
    });
  });

  describe('Share Filter Dialog', () => {
    it('should open share dialog when share button is clicked', async () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test'
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      fireEvent.click(screen.getByTitle('Share Filter'));
      
      await waitFor(() => {
        expect(screen.getByText('Share Filter')).toBeInTheDocument();
        expect(screen.getByText('Shareable URL')).toBeInTheDocument();
      });
    });

    it('should generate shareable URL', async () => {
      const activeFilterState = {
        ...mockFilterState,
        searchQuery: 'test',
        location: { city: 'New York' }
      };

      render(<SmartFilterSystem {...mockProps} filterState={activeFilterState} />);
      
      fireEvent.click(screen.getByTitle('Share Filter'));
      
      await waitFor(() => {
        const urlInput = screen.getByDisplayValue(/marketplace\?/);
        expect(urlInput).toBeInTheDocument();
        expect(urlInput.value).toContain('searchQuery');
        expect(urlInput.value).toContain('location');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<SmartFilterSystem {...mockProps} />);
      
      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
      expect(screen.getByText('Smart Filters')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SmartFilterSystem {...mockProps} />);
      
      // Tab to expand button
      await user.tab();
      expect(screen.getByRole('button', { name: /expand/i })).toHaveFocus();
      
      // Press Enter to expand
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Basic')).toBeInTheDocument();
      });
    });
  });
});