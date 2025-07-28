/**
 * useDynamicFilterOptions Hook
 * 
 * React hook for managing dynamic filter options with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Screen, FilterState } from '../types/marketplace.types';
import { DynamicFilterOptionsService, DynamicFilterOptions } from '../services/DynamicFilterOptionsService';

// =============================================================================
// TYPES
// =============================================================================

export interface UseDynamicFilterOptionsConfig {
  /** Debounce delay for filter updates in milliseconds */
  debounceDelay?: number;
  /** Whether to exclude active filters from options */
  excludeActiveFilters?: boolean;
  /** Whether to enable automatic updates */
  enableAutoUpdate?: boolean;
  /** Update interval for automatic updates in milliseconds */
  updateInterval?: number;
}

export interface UseDynamicFilterOptionsReturn {
  /** Current dynamic filter options */
  options: DynamicFilterOptions | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Last update timestamp */
  lastUpdated: Date | null;
  /** Computation time for last calculation */
  computationTime: number;
  /** Manually refresh options */
  refresh: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useDynamicFilterOptions(
  screens: Screen[],
  filters: FilterState,
  config: UseDynamicFilterOptionsConfig = {}
): UseDynamicFilterOptionsReturn {
  const {
    debounceDelay = 300,
    excludeActiveFilters = true,
    enableAutoUpdate = false,
    updateInterval = 30000 // 30 seconds
  } = config;

  // State
  const [options, setOptions] = useState<DynamicFilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [computationTime, setComputationTime] = useState(0);

  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout>();
  const serviceRef = useRef<DynamicFilterOptionsService>();
  const abortControllerRef = useRef<AbortController>();

  // Initialize service
  useEffect(() => {
    serviceRef.current = DynamicFilterOptionsService.getInstance();
  }, []);

  // Calculate options
  const calculateOptions = useCallback(async (immediate = false) => {
    if (!serviceRef.current || screens.length === 0) {
      setOptions(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const executeCalculation = async () => {
      try {
        setLoading(true);
        setError(null);

        const startTime = performance.now();
        const result = await serviceRef.current!.calculateDynamicOptions(
          screens,
          filters,
          excludeActiveFilters
        );
        const endTime = performance.now();

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setOptions(result);
        setLastUpdated(new Date());
        setComputationTime(endTime - startTime);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          console.error('Failed to calculate dynamic filter options:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (immediate) {
      await executeCalculation();
    } else {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(executeCalculation, debounceDelay);
    }
  }, [screens, filters, excludeActiveFilters, debounceDelay]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await calculateOptions(true);
  }, [calculateOptions]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect for filter/screen changes
  useEffect(() => {
    calculateOptions();

    // Cleanup
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [calculateOptions]);

  // Effect for auto-update
  useEffect(() => {
    if (enableAutoUpdate && updateInterval > 0) {
      autoUpdateIntervalRef.current = setInterval(() => {
        calculateOptions(true);
      }, updateInterval);

      return () => {
        if (autoUpdateIntervalRef.current) {
          clearInterval(autoUpdateIntervalRef.current);
        }
      };
    }
  }, [enableAutoUpdate, updateInterval, calculateOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (autoUpdateIntervalRef.current) {
        clearInterval(autoUpdateIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    options,
    loading,
    error,
    lastUpdated,
    computationTime,
    refresh,
    clearError
  };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook for getting specific filter option type
 */
export function useFilterOptionType(
  options: DynamicFilterOptions | null,
  type: keyof DynamicFilterOptions
) {
  return options?.[type] || [];
}

/**
 * Hook for getting filter option statistics
 */
export function useFilterOptionStats(options: DynamicFilterOptions | null) {
  if (!options) {
    return {
      totalOptions: 0,
      totalResults: 0,
      averagePercentage: 0,
      recommendedCount: 0,
      trendingUpCount: 0,
      trendingDownCount: 0
    };
  }

  const allOptions = [
    ...options.cities,
    ...options.categories,
    ...options.priceRanges,
    ...options.venueTypes,
    ...options.environments,
    ...options.dwellTimes,
    ...options.features
  ];

  const totalOptions = allOptions.length;
  const totalResults = options.totalResults;
  const averagePercentage = totalOptions > 0 
    ? allOptions.reduce((sum, opt) => sum + opt.percentage, 0) / totalOptions 
    : 0;
  const recommendedCount = allOptions.filter(opt => opt.isRecommended).length;
  const trendingUpCount = allOptions.filter(opt => opt.trend === 'up').length;
  const trendingDownCount = allOptions.filter(opt => opt.trend === 'down').length;

  return {
    totalOptions,
    totalResults,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    recommendedCount,
    trendingUpCount,
    trendingDownCount
  };
}

/**
 * Hook for getting top performing filter options
 */
export function useTopFilterOptions(
  options: DynamicFilterOptions | null,
  limit: number = 5
) {
  if (!options) {
    return {
      topByCount: [],
      topByPercentage: [],
      topRecommended: [],
      topTrending: []
    };
  }

  const allOptions = [
    ...options.cities,
    ...options.categories,
    ...options.priceRanges,
    ...options.venueTypes,
    ...options.environments,
    ...options.dwellTimes,
    ...options.features
  ];

  const topByCount = [...allOptions]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const topByPercentage = [...allOptions]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit);

  const topRecommended = allOptions
    .filter(opt => opt.isRecommended)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const topTrending = allOptions
    .filter(opt => opt.trend === 'up')
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return {
    topByCount,
    topByPercentage,
    topRecommended,
    topTrending
  };
}

export default useDynamicFilterOptions;