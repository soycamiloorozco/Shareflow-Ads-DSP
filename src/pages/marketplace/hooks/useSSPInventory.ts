/**
 * useSSPInventory Hook
 * React hook for SSP inventory integration
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { InventoryAggregationService } from '../../../services/InventoryAggregationService';
import { Screen } from '../types/screen.types';
import { SSPErrorHandler } from '../../../services/SSPErrorHandler';

interface UseSSPInventoryReturn {
  sspScreens: Screen[];
  loading: boolean;
  error: string | null;
  totalSSPScreens: number;
  inventoryStats: {
    total: number;
    ssp: number;
    local: number;
    bySSP: Record<string, number>;
    lastUpdated: string;
  };
  refreshInventory: () => Promise<void>;
  clearError: () => void;
}

export const useSSPInventory = (): UseSSPInventoryReturn => {
  const [sspScreens, setSSPScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryStats, setInventoryStats] = useState({
    total: 0,
    ssp: 0,
    local: 0,
    bySSP: {},
    lastUpdated: new Date().toISOString()
  });

  const inventoryServiceRef = useRef<InventoryAggregationService>();
  const callbackRef = useRef<((inventory: Screen[]) => void) | null>(null);

  /**
   * Handle inventory updates from the service with error handling
   */
  const handleInventoryUpdate = useCallback((newInventory: Screen[]) => {
    try {
      // Validate inventory before setting
      if (!Array.isArray(newInventory)) {
        throw new Error('Invalid inventory data received');
      }

      setSSPScreens(newInventory);
      
      // Update inventory statistics
      const service = inventoryServiceRef.current;
      if (service) {
        const stats = service.getInventoryStats();
        setInventoryStats(stats);
      }
      
      setError(null);
    } catch (err) {
      SSPErrorHandler.logError(
        err,
        'useSSPInventory.handleInventoryUpdate',
        { inventoryLength: newInventory?.length }
      );
      setError('Failed to update inventory');
    }
  }, []);

  /**
   * Load initial inventory
   */
  const loadInitialInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const service = inventoryServiceRef.current;
      if (!service) {
        throw new Error('Inventory service not initialized');
      }

      // Get current inventory
      const inventory = service.getAllInventory();
      setSSPScreens(inventory);

      // Get statistics
      const stats = service.getInventoryStats();
      setInventoryStats(stats);

      // Validate inventory integrity
      const validation = service.validateInventory();
      if (!validation.isValid) {
        console.warn('Inventory validation warnings:', validation.warnings);
        if (validation.errors.length > 0) {
          console.error('Inventory validation errors:', validation.errors);
        }
      }

    } catch (err) {
      console.error('Error loading initial inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh inventory manually
   */
  const refreshInventory = useCallback(async () => {
    await loadInitialInventory();
  }, [loadInitialInventory]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initialize service and subscriptions
   */
  useEffect(() => {
    // Initialize inventory service
    inventoryServiceRef.current = InventoryAggregationService.getInstance();
    
    // Create callback reference
    callbackRef.current = handleInventoryUpdate;
    
    // Subscribe to inventory updates
    inventoryServiceRef.current.onInventoryUpdate(handleInventoryUpdate);
    
    // Load initial inventory
    loadInitialInventory();

    // Cleanup function
    return () => {
      if (inventoryServiceRef.current && callbackRef.current) {
        inventoryServiceRef.current.offInventoryUpdate(callbackRef.current);
      }
    };
  }, [handleInventoryUpdate, loadInitialInventory]);

  /**
   * Periodic inventory refresh
   */
  useEffect(() => {
    // Refresh inventory every 10 minutes to ensure freshness
    const refreshInterval = setInterval(() => {
      if (!loading) {
        refreshInventory();
      }
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [loading, refreshInventory]);

  /**
   * Error recovery
   */
  useEffect(() => {
    if (error) {
      // Auto-retry after 30 seconds if there's an error
      const retryTimeout = setTimeout(() => {
        console.log('Auto-retrying inventory load after error...');
        refreshInventory();
      }, 30 * 1000);

      return () => {
        clearTimeout(retryTimeout);
      };
    }
  }, [error, refreshInventory]);

  return {
    sspScreens,
    loading,
    error,
    totalSSPScreens: sspScreens.filter(s => s.sspMetadata?.isSSPInventory).length,
    inventoryStats,
    refreshInventory,
    clearError
  };
};

/**
 * Hook for SSP-specific operations
 */
export const useSSPOperations = () => {
  const inventoryService = InventoryAggregationService.getInstance();

  const addSSPInventory = useCallback(async (sspInventory: any[]) => {
    try {
      await inventoryService.addSSPInventory(sspInventory);
      return { success: true };
    } catch (error) {
      console.error('Error adding SSP inventory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add SSP inventory' 
      };
    }
  }, [inventoryService]);

  const removeSSPInventory = useCallback((sspId: string) => {
    try {
      inventoryService.removeSSPInventory(sspId);
      return { success: true };
    } catch (error) {
      console.error('Error removing SSP inventory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove SSP inventory' 
      };
    }
  }, [inventoryService]);

  const clearSSPInventory = useCallback(() => {
    try {
      inventoryService.clearSSPInventory();
      return { success: true };
    } catch (error) {
      console.error('Error clearing SSP inventory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear SSP inventory' 
      };
    }
  }, [inventoryService]);

  const getInventoryBySSP = useCallback((sspId: string) => {
    try {
      return inventoryService.getInventoryBySSP(sspId);
    } catch (error) {
      console.error('Error getting inventory by SSP:', error);
      return [];
    }
  }, [inventoryService]);

  return {
    addSSPInventory,
    removeSSPInventory,
    clearSSPInventory,
    getInventoryBySSP
  };
};

/**
 * Hook for inventory statistics and monitoring
 */
export const useInventoryStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    ssp: 0,
    local: 0,
    bySSP: {},
    lastUpdated: new Date().toISOString()
  });

  const inventoryService = InventoryAggregationService.getInstance();

  const updateStats = useCallback(() => {
    try {
      const newStats = inventoryService.getInventoryStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error updating inventory stats:', error);
    }
  }, [inventoryService]);

  useEffect(() => {
    // Update stats initially
    updateStats();

    // Subscribe to inventory updates
    const handleUpdate = () => {
      updateStats();
    };

    inventoryService.onInventoryUpdate(handleUpdate);

    // Update stats every minute
    const statsInterval = setInterval(updateStats, 60 * 1000);

    return () => {
      inventoryService.offInventoryUpdate(handleUpdate);
      clearInterval(statsInterval);
    };
  }, [inventoryService, updateStats]);

  return {
    stats,
    updateStats
  };
};