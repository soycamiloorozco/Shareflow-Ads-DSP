/**
 * useScreensApi Hook
 * Custom hook for fetching screens from the official Shareflow API
 */

import { useState, useEffect, useCallback } from 'react';
import { Screen } from '../types/marketplace.types';
import ScreensApiService, { ScreensApiError } from '../../../services/api/screensApi';

interface UseScreensApiState {
  screens: Screen[];
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

interface UseScreensApiOptions {
  autoFetch?: boolean;
  cacheTimeout?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
}

interface FilterOptions {
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  environment?: 'indoor' | 'outdoor';
  availability?: boolean;
}

export const useScreensApi = (options: UseScreensApiOptions = {}) => {
  const {
    autoFetch = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes default
    retryAttempts = 3,
    retryDelay = 1000 // 1 second default
  } = options;

  const [state, setState] = useState<UseScreensApiState>({
    screens: [],
    loading: false,
    error: null,
    lastFetch: null
  });

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    if (!state.lastFetch) return false;
    const cacheAge = Date.now() - state.lastFetch.getTime();
    return cacheAge < cacheTimeout;
  }, [state.lastFetch, cacheTimeout]);

  // Retry logic with exponential backoff
  const retryWithBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= retryAttempts) {
        throw error;
      }
      
      // Exponential backoff: delay * 2^(attempt-1)
      const delay = retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retryWithBackoff(operation, attempt + 1);
    }
  }, [retryAttempts, retryDelay]);

  // Fetch all screens
  const fetchScreens = useCallback(async (forceRefresh: boolean = false) => {
    // Check cache validity
    if (!forceRefresh && isCacheValid() && state.screens.length > 0) {
      return state.screens;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const screens = await retryWithBackoff(() => ScreensApiService.getAllScreens());
      
      setState(prev => ({
        ...prev,
        screens,
        loading: false,
        error: null,
        lastFetch: new Date()
      }));

      return screens;
    } catch (error) {
      const errorMessage = error instanceof ScreensApiError 
        ? error.message 
        : 'Failed to fetch screens from API';
      
      console.error('Error fetching screens:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      throw error;
    }
  }, [isCacheValid, state.screens.length, retryWithBackoff]);

  // Fetch screens with filters
  const fetchScreensWithFilters = useCallback(async (filters: FilterOptions) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const screens = await retryWithBackoff(() => 
        ScreensApiService.getScreensWithFilters(filters)
      );
      
      setState(prev => ({
        ...prev,
        screens,
        loading: false,
        error: null,
        lastFetch: new Date()
      }));

      return screens;
    } catch (error) {
      const errorMessage = error instanceof ScreensApiError 
        ? error.message 
        : 'Failed to fetch filtered screens from API';
      
      console.error('Error fetching filtered screens:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      throw error;
    }
  }, [retryWithBackoff]);

  // Fetch single screen by ID
  const fetchScreenById = useCallback(async (screenId: string): Promise<Screen> => {
    try {
      return await retryWithBackoff(() => ScreensApiService.getScreenById(screenId));
    } catch (error) {
      const errorMessage = error instanceof ScreensApiError 
        ? error.message 
        : `Failed to fetch screen ${screenId} from API`;
      
      console.error('Error fetching screen by ID:', error);
      throw new Error(errorMessage);
    }
  }, [retryWithBackoff]);

  // Refresh screens (force fetch)
  const refreshScreens = useCallback(async () => {
    return await fetchScreens(true);
  }, [fetchScreens]);

  // Clear cache
  const clearCache = useCallback(() => {
    setState(prev => ({
      ...prev,
      screens: [],
      lastFetch: null,
      error: null
    }));
  }, []);

  // Check API health
  const checkApiHealth = useCallback(async (): Promise<boolean> => {
    try {
      return await ScreensApiService.checkHealth();
    } catch {
      return false;
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchScreens().catch(error => {
        console.warn('Auto-fetch failed:', error);
        // Don't throw here as it's an automatic operation
      });
    }
  }, [autoFetch, fetchScreens]);

  // Set auth token (if available)
  useEffect(() => {
    // Try to get auth token from localStorage or your auth system
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    if (token) {
      ScreensApiService.setAuthToken(token);
    }
  }, []);

  return {
    // State
    screens: state.screens,
    loading: state.loading,
    error: state.error,
    lastFetch: state.lastFetch,
    
    // Computed
    isCacheValid: isCacheValid(),
    hasScreens: state.screens.length > 0,
    screenCount: state.screens.length,
    
    // Actions
    fetchScreens,
    fetchScreensWithFilters,
    fetchScreenById,
    refreshScreens,
    clearCache,
    checkApiHealth,
    
    // Utilities
    retry: retryWithBackoff
  };
};