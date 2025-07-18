/**
 * Tests for useDynamicFilterOptions hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDynamicFilterOptions, useFilterOptionStats, useTopFilterOptions } from '../useDynamicFilterOptions';
import { Screen, FilterState } from '../../types/marketplace.types';
import { DynamicFilterOptionsService, DynamicFilterOptions } from '../../services/DynamicFilterOptionsService';

// Mock the service
vi.mock('../../services/DynamicFilterOptionsService', () => ({
  DynamicFilterOptionsService: {
    getInstance: vi.fn(() => ({
      calculateDynamicOptions: vi.fn()
    }))
  }
}));

describe('useDynamicFilterOptions', () => {
  let mockService: any;
  let mockScreens: Screen[];
  let emptyFilters: FilterState;
  let mockOptions: DynamicFilterOptions;

  beforeEach(() => {
    mockService = {
      calculateDynamicOptions: vi.fn()
    };
    
    (DynamicFilterOptionsService.getInstance as any).mockReturnValue(mockService);

    mockScreens = [
      {
        id: 'screen-1',
        name: 'Test Screen 1',
        location: 'Mall, Bogotá',
        price: 750000,
        category: { id: 'mall', name: 'Centro Comercial' },
        environment: 'indoor',
        rating: 4.5,
        pricing: { allowMoments: true }
      } as Screen
    ];

    emptyFilters = {
      search: { query: '' },
      location: { cities: [], regions: [], neighborhoods: [] },
      category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
      price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
      features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
      availability: { timeSlots: [], daysOfWeek: [] },
      sort: { field: 'relevance', direction: 'desc' },
      showFavoritesOnly: false,
      showCircuits: true
    };

    mockOptions = {
      cities: [
        {
          id: 'bogota',
          label: 'Bogotá',
          count: 5,
          percentage: 50,
          trend: 'up',
          isRecommended: true,
          relatedOptions: [],
          estimatedImpact: 0.5,
          isActive: false,
          disabled: false
        }
      ],
      categories: [
        {
          id: 'mall',
          label: 'Centro Comercial',
          count: 3,
          percentage: 30,
          trend: 'stable',
          isRecommended: false,
          relatedOptions: [],
          estimatedImpact: 0.3,
          isActive: false,
          disabled: false
        }
      ],
      priceRanges: [],
      venueTypes: [],
      environments: [],
      dwellTimes: [],
      features: [],
      totalResults: 10,
      lastUpdated: new Date(),
      computationTime: 50
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default state', () => {
      mockService.calculateDynamicOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters)
      );

      expect(result.current.options).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeNull();
      expect(result.current.computationTime).toBe(0);
    });

    it('should calculate options on mount', async () => {
      mockService.calculateDynamicOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters)
      );

      await waitFor(() => {
        expect(result.current.options).toEqual(mockOptions);
      });

      expect(mockService.calculateDynamicOptions).toHaveBeenCalledWith(
        mockScreens,
        emptyFilters,
        true
      );
    });

    it('should set loading state during calculation', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockService.calculateDynamicOptions.mockReturnValue(promise);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters)
      );

      // Should be loading initially
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve the promise
      act(() => {
        resolvePromise!(mockOptions);
      });

      // Should not be loading after resolution
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Calculation failed');
      mockService.calculateDynamicOptions.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters)
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Debouncing', () => {
    it('should debounce filter changes', async () => {
      mockService.calculateDynamicOptions.mockResolvedValue(mockOptions);

      const { result, rerender } = renderHook(
        ({ filters }) => useDynamicFilterOptions(mockScreens, filters, { debounceDelay: 100 }),
        { initialProps: { filters: emptyFilters } }
      );

      // Change filters multiple times quickly
      const newFilters1 = { ...emptyFilters, search: { query: 'test1' } };
      const newFilters2 = { ...emptyFilters, search: { query: 'test2' } };
      const newFilters3 = { ...emptyFilters, search: { query: 'test3' } };

      rerender({ filters: newFilters1 });
      rerender({ filters: newFilters2 });
      rerender({ filters: newFilters3 });

      // Wait for debounce
      await waitFor(() => {
        expect(result.current.options).toEqual(mockOptions);
      }, { timeout: 200 });

      // Should only call once after debounce
      expect(mockService.calculateDynamicOptions).toHaveBeenCalledTimes(1);
      expect(mockService.calculateDynamicOptions).toHaveBeenCalledWith(
        mockScreens,
        newFilters3,
        true
      );
    });
  });

  describe('Manual Refresh', () => {
    it('should refresh options immediately when called', async () => {
      mockService.calculateDynamicOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters)
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.options).toEqual(mockOptions);
      });

      // Clear mock calls
      mockService.calculateDynamicOptions.mockClear();

      // Call refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(mockService.calculateDynamicOptions).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', async () => {
      const error = new Error('Test error');
      mockService.calculateDynamicOptions.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters)
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Configuration Options', () => {
    it('should respect excludeActiveFilters config', async () => {
      mockService.calculateDynamicOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters, { excludeActiveFilters: false })
      );

      await waitFor(() => {
        expect(result.current.options).toEqual(mockOptions);
      });

      expect(mockService.calculateDynamicOptions).toHaveBeenCalledWith(
        mockScreens,
        emptyFilters,
        false
      );
    });

    it('should handle empty screens array', async () => {
      const { result } = renderHook(() =>
        useDynamicFilterOptions([], emptyFilters)
      );

      expect(result.current.options).toBeNull();
      expect(mockService.calculateDynamicOptions).not.toHaveBeenCalled();
    });
  });

  describe('Auto Update', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto-update when enabled', async () => {
      mockService.calculateDynamicOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters, {
          enableAutoUpdate: true,
          updateInterval: 1000
        })
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.options).toEqual(mockOptions);
      });

      // Clear mock calls
      mockService.calculateDynamicOptions.mockClear();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should have called again
      await waitFor(() => {
        expect(mockService.calculateDynamicOptions).toHaveBeenCalledTimes(1);
      });
    });

    it('should not auto-update when disabled', async () => {
      mockService.calculateDynamicOptions.mockResolvedValue(mockOptions);

      const { result } = renderHook(() =>
        useDynamicFilterOptions(mockScreens, emptyFilters, {
          enableAutoUpdate: false
        })
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.options).toEqual(mockOptions);
      });

      // Clear mock calls
      mockService.calculateDynamicOptions.mockClear();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should not have called again
      expect(mockService.calculateDynamicOptions).not.toHaveBeenCalled();
    });
  });
});

describe('useFilterOptionStats', () => {
  it('should return correct stats for options', () => {
    const options: DynamicFilterOptions = {
      cities: [
        { id: '1', label: 'City 1', count: 5, percentage: 50, trend: 'up', isRecommended: true, relatedOptions: [], estimatedImpact: 0.5, isActive: false, disabled: false },
        { id: '2', label: 'City 2', count: 3, percentage: 30, trend: 'down', isRecommended: false, relatedOptions: [], estimatedImpact: 0.3, isActive: false, disabled: false }
      ],
      categories: [
        { id: '1', label: 'Cat 1', count: 2, percentage: 20, trend: 'stable', isRecommended: true, relatedOptions: [], estimatedImpact: 0.2, isActive: false, disabled: false }
      ],
      priceRanges: [],
      venueTypes: [],
      environments: [],
      dwellTimes: [],
      features: [],
      totalResults: 10,
      lastUpdated: new Date(),
      computationTime: 50
    };

    const { result } = renderHook(() => useFilterOptionStats(options));

    expect(result.current.totalOptions).toBe(3);
    expect(result.current.totalResults).toBe(10);
    expect(result.current.averagePercentage).toBeCloseTo(33.33, 1);
    expect(result.current.recommendedCount).toBe(2);
    expect(result.current.trendingUpCount).toBe(1);
    expect(result.current.trendingDownCount).toBe(1);
  });

  it('should handle null options', () => {
    const { result } = renderHook(() => useFilterOptionStats(null));

    expect(result.current.totalOptions).toBe(0);
    expect(result.current.totalResults).toBe(0);
    expect(result.current.averagePercentage).toBe(0);
    expect(result.current.recommendedCount).toBe(0);
    expect(result.current.trendingUpCount).toBe(0);
    expect(result.current.trendingDownCount).toBe(0);
  });
});

describe('useTopFilterOptions', () => {
  it('should return top options correctly', () => {
    const options: DynamicFilterOptions = {
      cities: [
        { id: '1', label: 'City 1', count: 10, percentage: 50, trend: 'up', isRecommended: true, relatedOptions: [], estimatedImpact: 0.5, isActive: false, disabled: false },
        { id: '2', label: 'City 2', count: 5, percentage: 25, trend: 'down', isRecommended: false, relatedOptions: [], estimatedImpact: 0.25, isActive: false, disabled: false }
      ],
      categories: [
        { id: '1', label: 'Cat 1', count: 8, percentage: 40, trend: 'stable', isRecommended: true, relatedOptions: [], estimatedImpact: 0.4, isActive: false, disabled: false }
      ],
      priceRanges: [],
      venueTypes: [],
      environments: [],
      dwellTimes: [],
      features: [],
      totalResults: 20,
      lastUpdated: new Date(),
      computationTime: 50
    };

    const { result } = renderHook(() => useTopFilterOptions(options, 2));

    expect(result.current.topByCount).toHaveLength(2);
    expect(result.current.topByCount[0].count).toBe(10); // City 1
    expect(result.current.topByCount[1].count).toBe(8);  // Cat 1

    expect(result.current.topByPercentage).toHaveLength(2);
    expect(result.current.topByPercentage[0].percentage).toBe(50); // City 1
    expect(result.current.topByPercentage[1].percentage).toBe(40); // Cat 1

    expect(result.current.topRecommended).toHaveLength(2);
    expect(result.current.topRecommended.every(opt => opt.isRecommended)).toBe(true);

    expect(result.current.topTrending).toHaveLength(1);
    expect(result.current.topTrending[0].trend).toBe('up');
  });

  it('should handle null options', () => {
    const { result } = renderHook(() => useTopFilterOptions(null));

    expect(result.current.topByCount).toHaveLength(0);
    expect(result.current.topByPercentage).toHaveLength(0);
    expect(result.current.topRecommended).toHaveLength(0);
    expect(result.current.topTrending).toHaveLength(0);
  });
});