/**
 * Unit tests for useSSPInventory hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSSPInventory, useSSPOperations, useInventoryStats } from '../useSSPInventory';
import { InventoryAggregationService } from '../../../../services/InventoryAggregationService';
import { Screen } from '../../types/screen.types';

// Mock InventoryAggregationService
jest.mock('../../../../services/InventoryAggregationService');
const mockInventoryService = InventoryAggregationService as jest.Mocked<typeof InventoryAggregationService>;

describe('useSSPInventory', () => {
  let mockServiceInstance: jest.Mocked<InventoryAggregationService>;
  let mockScreens: Screen[];

  beforeEach(() => {
    mockScreens = [
      {
        id: 'ssp-test-001',
        name: 'Test SSP Screen',
        location: 'Test Location',
        price: 100,
        availability: true,
        image: '/test.jpg',
        category: { id: 'test', name: 'Test' },
        environment: 'outdoor',
        specs: {
          width: 1920,
          height: 1080,
          resolution: 'Full HD',
          brightness: '5000 nits',
          aspectRatio: '16:9',
          orientation: 'landscape',
          pixelDensity: 72,
          colorDepth: 24,
          refreshRate: 60,
          technology: 'LED'
        },
        views: { daily: 10000, weekly: 70000, monthly: 300000 },
        rating: 4.5,
        reviews: 20,
        coordinates: { lat: 0, lng: 0 },
        pricing: {
          allowMoments: true,
          deviceId: 'test',
          bundles: {
            hourly: { enabled: true, price: 100, spots: 4 },
            daily: { enabled: true, price: 800, spots: 32 },
            weekly: { enabled: true, price: 5600, spots: 224 },
            monthly: { enabled: true, price: 24000, spots: 960 }
          }
        },
        metrics: {
          dailyTraffic: 10000,
          monthlyTraffic: 300000,
          averageEngagement: 85
        },
        locationDetails: {
          address: 'Test Address',
          city: 'Test City',
          region: 'Test Region',
          country: 'Test Country',
          coordinates: { lat: 0, lng: 0 },
          timezone: 'UTC',
          landmarks: ['Test Landmark']
        },
        operatingHours: {
          start: '06:00',
          end: '23:00',
          daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        sspMetadata: {
          sspId: 'test-ssp',
          sspName: 'Test SSP',
          originalInventoryId: 'test-inv-001',
          lastUpdated: new Date().toISOString(),
          isSSPInventory: true
        }
      }
    ];

    mockServiceInstance = {
      getAllInventory: jest.fn().mockReturnValue(mockScreens),
      getSSPInventory: jest.fn().mockReturnValue(mockScreens),
      getInventoryBySSP: jest.fn().mockReturnValue(mockScreens),
      addSSPInventory: jest.fn().mockResolvedValue(undefined),
      removeSSPInventory: jest.fn(),
      clearSSPInventory: jest.fn(),
      onInventoryUpdate: jest.fn(),
      offInventoryUpdate: jest.fn(),
      removeExpiredSSPInventory: jest.fn(),
      getInventoryStats: jest.fn().mockReturnValue({
        total: 1,
        ssp: 1,
        local: 0,
        bySSP: { 'Test SSP': 1 },
        lastUpdated: new Date().toISOString()
      }),
      validateInventory: jest.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      }),
      clearInventory: jest.fn(),
      destroy: jest.fn()
    } as any;

    mockInventoryService.getInstance.mockReturnValue(mockServiceInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('useSSPInventory', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useSSPInventory());

      expect(result.current.loading).toBe(true);
      expect(result.current.sspScreens).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.totalSSPScreens).toBe(0);
    });

    it('should load inventory on mount', async () => {
      const { result } = renderHook(() => useSSPInventory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.sspScreens).toEqual(mockScreens);
      expect(result.current.totalSSPScreens).toBe(1);
      expect(result.current.error).toBe(null);
      expect(mockServiceInstance.getAllInventory).toHaveBeenCalled();
      expect(mockServiceInstance.getInventoryStats).toHaveBeenCalled();
    });

    it('should handle loading errors', async () => {
      mockServiceInstance.getAllInventory.mockImplementation(() => {
        throw new Error('Service error');
      });

      const { result } = renderHook(() => useSSPInventory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Service error');
      expect(result.current.sspScreens).toEqual([]);
    });

    it('should subscribe to inventory updates', async () => {
      let updateCallback: (inventory: Screen[]) => void;
      mockServiceInstance.onInventoryUpdate.mockImplementation((callback) => {
        updateCallback = callback;
      });

      const { result } = renderHook(() => useSSPInventory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate inventory update
      const newScreens = [...mockScreens, { ...mockScreens[0], id: 'ssp-test-002' }];
      act(() => {
        updateCallback!(newScreens);
      });

      expect(result.current.sspScreens).toEqual(newScreens);
      expect(result.current.totalSSPScreens).toBe(2);
    });

    it('should handle update callback errors', async () => {
      let updateCallback: (inventory: Screen[]) => void;
      mockServiceInstance.onInventoryUpdate.mockImplementation((callback) => {
        updateCallback = callback;
      });

      const { result } = renderHook(() => useSSPInventory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate update with invalid data
      act(() => {
        updateCallback!(null as any);
      });

      expect(result.current.error).toBe('Failed to update inventory');
    });

    it('should refresh inventory manually', async () => {
      const { result } = renderHook(() => useSSPInventory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockServiceInstance.getAllInventory.mockClear();
      mockServiceInstance.getInventoryStats.mockClear();

      await act(async () => {
        await result.current.refreshInventory();
      });

      expect(mockServiceInstance.getAllInventory).toHaveBeenCalled();
      expect(mockServiceInstance.getInventoryStats).toHaveBeenCalled();
    });

    it('should clear error state', async () => {
      mockServiceInstance.getAllInventory.mockImplementation(() => {
        throw new Error('Service error');
      });

      const { result } = renderHook(() => useSSPInventory());

      await waitFor(() => {
        expect(result.current.error).toBe('Service error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useSSPInventory());

      unmount();

      expect(mockServiceInstance.offInventoryUpdate).toHaveBeenCalled();
    });
  });

  describe('useSSPOperations', () => {
    it('should add SSP inventory successfully', async () => {
      const { result } = renderHook(() => useSSPOperations());

      const mockInventoryData = [{ SSPId: 'test' }];
      const response = await result.current.addSSPInventory(mockInventoryData);

      expect(response.success).toBe(true);
      expect(mockServiceInstance.addSSPInventory).toHaveBeenCalledWith(mockInventoryData);
    });

    it('should handle add SSP inventory errors', async () => {
      mockServiceInstance.addSSPInventory.mockRejectedValue(new Error('Add failed'));

      const { result } = renderHook(() => useSSPOperations());

      const response = await result.current.addSSPInventory([]);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Add failed');
    });

    it('should remove SSP inventory successfully', () => {
      const { result } = renderHook(() => useSSPOperations());

      const response = result.current.removeSSPInventory('test-ssp');

      expect(response.success).toBe(true);
      expect(mockServiceInstance.removeSSPInventory).toHaveBeenCalledWith('test-ssp');
    });

    it('should handle remove SSP inventory errors', () => {
      mockServiceInstance.removeSSPInventory.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      const { result } = renderHook(() => useSSPOperations());

      const response = result.current.removeSSPInventory('test-ssp');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Remove failed');
    });

    it('should clear SSP inventory successfully', () => {
      const { result } = renderHook(() => useSSPOperations());

      const response = result.current.clearSSPInventory();

      expect(response.success).toBe(true);
      expect(mockServiceInstance.clearSSPInventory).toHaveBeenCalled();
    });

    it('should get inventory by SSP', () => {
      const { result } = renderHook(() => useSSPOperations());

      const inventory = result.current.getInventoryBySSP('test-ssp');

      expect(inventory).toEqual(mockScreens);
      expect(mockServiceInstance.getInventoryBySSP).toHaveBeenCalledWith('test-ssp');
    });

    it('should handle get inventory by SSP errors', () => {
      mockServiceInstance.getInventoryBySSP.mockImplementation(() => {
        throw new Error('Get failed');
      });

      const { result } = renderHook(() => useSSPOperations());

      const inventory = result.current.getInventoryBySSP('test-ssp');

      expect(inventory).toEqual([]);
    });
  });

  describe('useInventoryStats', () => {
    it('should initialize with stats', async () => {
      const { result } = renderHook(() => useInventoryStats());

      await waitFor(() => {
        expect(result.current.stats.total).toBe(1);
      });

      expect(result.current.stats.ssp).toBe(1);
      expect(result.current.stats.local).toBe(0);
      expect(result.current.stats.bySSP['Test SSP']).toBe(1);
    });

    it('should update stats manually', async () => {
      const { result } = renderHook(() => useInventoryStats());

      await waitFor(() => {
        expect(result.current.stats.total).toBe(1);
      });

      mockServiceInstance.getInventoryStats.mockClear();

      act(() => {
        result.current.updateStats();
      });

      expect(mockServiceInstance.getInventoryStats).toHaveBeenCalled();
    });

    it('should handle stats update errors', async () => {
      mockServiceInstance.getInventoryStats.mockImplementation(() => {
        throw new Error('Stats error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useInventoryStats());

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error updating inventory stats:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should subscribe to inventory updates for stats', async () => {
      let updateCallback: () => void;
      mockServiceInstance.onInventoryUpdate.mockImplementation((callback) => {
        updateCallback = callback;
      });

      const { result } = renderHook(() => useInventoryStats());

      await waitFor(() => {
        expect(result.current.stats.total).toBe(1);
      });

      mockServiceInstance.getInventoryStats.mockClear();

      // Simulate inventory update
      act(() => {
        updateCallback!();
      });

      expect(mockServiceInstance.getInventoryStats).toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useInventoryStats());

      unmount();

      expect(mockServiceInstance.offInventoryUpdate).toHaveBeenCalled();
    });
  });
});