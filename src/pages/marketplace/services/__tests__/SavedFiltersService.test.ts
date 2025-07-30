import { SavedFiltersService, SavedFilter, SavedFilterCategory } from '../SavedFiltersService';
import { FilterState } from '../../types/filter.types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SavedFiltersService', () => {
  let service: SavedFiltersService;
  let mockFilterState: FilterState;

  beforeEach(() => {
    localStorageMock.clear();
    // Reset singleton instance
    (SavedFiltersService as any).instance = undefined;
    service = SavedFiltersService.getInstance();
    
    mockFilterState = {
      searchQuery: 'test',
      location: { city: 'New York', state: 'NY' },
      priceRange: { min: 100, max: 500 },
      categories: ['retail'],
      tags: ['premium'],
      availability: { startDate: new Date(), endDate: new Date() },
      sortBy: 'price',
      sortOrder: 'asc' as const
    };
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SavedFiltersService.getInstance();
      const instance2 = SavedFiltersService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Filter Management', () => {
    it('should save a filter successfully', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState, {
        description: 'A test filter',
        tags: ['test', 'demo'],
        category: 'general',
        isPublic: false
      });

      expect(savedFilter).toBeDefined();
      expect(savedFilter.name).toBe('Test Filter');
      expect(savedFilter.description).toBe('A test filter');
      expect(savedFilter.tags).toEqual(['test', 'demo']);
      expect(savedFilter.category).toBe('general');
      expect(savedFilter.isPublic).toBe(false);
      expect(savedFilter.usageCount).toBe(0);
      expect(savedFilter.filterState).toEqual(mockFilterState);
    });

    it('should retrieve a saved filter', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState);
      const retrieved = service.getFilter(savedFilter.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(savedFilter.id);
      expect(retrieved?.name).toBe('Test Filter');
    });

    it('should return null for non-existent filter', () => {
      const retrieved = service.getFilter('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should update a filter successfully', async () => {
      const savedFilter = await service.saveFilter('Original Name', mockFilterState);
      const updated = await service.updateFilter(savedFilter.id, {
        name: 'Updated Name',
        description: 'Updated description'
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(savedFilter.updatedAt.getTime());
    });

    it('should return null when updating non-existent filter', async () => {
      const result = await service.updateFilter('non-existent-id', { name: 'New Name' });
      expect(result).toBeNull();
    });

    it('should delete a filter successfully', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState);
      const deleted = await service.deleteFilter(savedFilter.id);

      expect(deleted).toBe(true);
      expect(service.getFilter(savedFilter.id)).toBeNull();
    });

    it('should return false when deleting non-existent filter', async () => {
      const deleted = await service.deleteFilter('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should get all filters', async () => {
      await service.saveFilter('Filter 1', mockFilterState);
      await service.saveFilter('Filter 2', mockFilterState);
      await service.saveFilter('Filter 3', mockFilterState);

      const allFilters = service.getAllFilters();
      expect(allFilters).toHaveLength(3);
    });
  });

  describe('Filter Querying', () => {
    beforeEach(async () => {
      await service.saveFilter('Location Filter', mockFilterState, {
        category: 'location',
        tags: ['city', 'urban']
      });
      await service.saveFilter('Price Filter', mockFilterState, {
        category: 'pricing',
        tags: ['budget', 'affordable']
      });
      await service.saveFilter('Premium Location', mockFilterState, {
        category: 'location',
        tags: ['premium', 'urban']
      });
    });

    it('should get filters by category', () => {
      const locationFilters = service.getFiltersByCategory('location');
      expect(locationFilters).toHaveLength(2);
      expect(locationFilters.every(f => f.category === 'location')).toBe(true);
    });

    it('should get filters by tags', () => {
      const urbanFilters = service.getFiltersByTags(['urban']);
      expect(urbanFilters).toHaveLength(2);
      expect(urbanFilters.every(f => f.tags.includes('urban'))).toBe(true);
    });

    it('should search filters by name and description', () => {
      const searchResults = service.searchFilters('location');
      expect(searchResults).toHaveLength(2);
      expect(searchResults.every(f => 
        f.name.toLowerCase().includes('location') || 
        f.description?.toLowerCase().includes('location')
      )).toBe(true);
    });

    it('should search filters by tags', () => {
      const searchResults = service.searchFilters('premium');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Premium Location');
    });
  });

  describe('Usage Tracking', () => {
    it('should increment usage count', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState);
      expect(savedFilter.usageCount).toBe(0);

      await service.incrementUsage(savedFilter.id);
      const updated = service.getFilter(savedFilter.id);
      expect(updated?.usageCount).toBe(1);

      await service.incrementUsage(savedFilter.id);
      const updated2 = service.getFilter(savedFilter.id);
      expect(updated2?.usageCount).toBe(2);
    });

    it('should get most used filters', async () => {
      const filter1 = await service.saveFilter('Filter 1', mockFilterState);
      const filter2 = await service.saveFilter('Filter 2', mockFilterState);
      const filter3 = await service.saveFilter('Filter 3', mockFilterState);

      // Use filters different amounts
      await service.incrementUsage(filter2.id);
      await service.incrementUsage(filter2.id);
      await service.incrementUsage(filter2.id);
      await service.incrementUsage(filter3.id);
      await service.incrementUsage(filter3.id);
      await service.incrementUsage(filter1.id);

      const mostUsed = service.getMostUsedFilters(3);
      expect(mostUsed).toHaveLength(3);
      expect(mostUsed[0].id).toBe(filter2.id); // 3 uses
      expect(mostUsed[1].id).toBe(filter3.id); // 2 uses
      expect(mostUsed[2].id).toBe(filter1.id); // 1 use
    });

    it('should get recent filters', async () => {
      const filter1 = await service.saveFilter('Filter 1', mockFilterState);
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const filter2 = await service.saveFilter('Filter 2', mockFilterState);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      const filter3 = await service.saveFilter('Filter 3', mockFilterState);

      const recent = service.getRecentFilters(3);
      expect(recent).toHaveLength(3);
      expect(recent[0].id).toBe(filter3.id); // Most recent
      expect(recent[1].id).toBe(filter2.id);
      expect(recent[2].id).toBe(filter1.id); // Oldest
    });
  });

  describe('Category Management', () => {
    it('should create a category', async () => {
      const category = await service.createCategory('Test Category', {
        description: 'A test category',
        color: '#FF0000',
        icon: 'test-icon'
      });

      expect(category).toBeDefined();
      expect(category.name).toBe('Test Category');
      expect(category.description).toBe('A test category');
      expect(category.color).toBe('#FF0000');
      expect(category.icon).toBe('test-icon');
    });

    it('should update a category', async () => {
      const category = await service.createCategory('Original Category');
      const updated = await service.updateCategory(category.id, {
        name: 'Updated Category',
        color: '#00FF00'
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Category');
      expect(updated?.color).toBe('#00FF00');
    });

    it('should delete a category and move filters to general', async () => {
      const category = await service.createCategory('Test Category');
      await service.saveFilter('Test Filter', mockFilterState, {
        category: category.id
      });

      const deleted = await service.deleteCategory(category.id);
      expect(deleted).toBe(true);

      const filters = service.getFiltersByCategory('general');
      expect(filters).toHaveLength(1);
      expect(filters[0].name).toBe('Test Filter');
    });

    it('should have default categories', () => {
      const categories = service.getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      const generalCategory = categories.find(c => c.id === 'general');
      expect(generalCategory).toBeDefined();
      expect(generalCategory?.name).toBe('General');
    });
  });

  describe('Sharing and Collaboration', () => {
    it('should share a filter with users', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState);
      const shared = await service.shareFilter(savedFilter.id, ['user1', 'user2']);

      expect(shared).toBe(true);
      const updated = service.getFilter(savedFilter.id);
      expect(updated?.sharedWith).toEqual(['user1', 'user2']);
    });

    it('should unshare a filter', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState);
      await service.shareFilter(savedFilter.id, ['user1', 'user2', 'user3']);
      
      const unshared = await service.unshareFilter(savedFilter.id, ['user2']);
      expect(unshared).toBe(true);
      
      const updated = service.getFilter(savedFilter.id);
      expect(updated?.sharedWith).toEqual(['user1', 'user3']);
    });

    it('should make filter public', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState);
      const result = await service.makeFilterPublic(savedFilter.id);

      expect(result).toBe(true);
      const updated = service.getFilter(savedFilter.id);
      expect(updated?.isPublic).toBe(true);
    });

    it('should make filter private', async () => {
      const savedFilter = await service.saveFilter('Test Filter', mockFilterState, {
        isPublic: true
      });
      await service.shareFilter(savedFilter.id, ['user1']);
      
      const result = await service.makeFilterPrivate(savedFilter.id);
      expect(result).toBe(true);
      
      const updated = service.getFilter(savedFilter.id);
      expect(updated?.isPublic).toBe(false);
      expect(updated?.sharedWith).toEqual([]);
    });

    it('should get shared filters', async () => {
      await service.saveFilter('Private Filter', mockFilterState);
      await service.saveFilter('Public Filter', mockFilterState, { isPublic: true });
      
      const sharedFilter = await service.saveFilter('Shared Filter', mockFilterState);
      await service.shareFilter(sharedFilter.id, ['user1']);

      const sharedFilters = service.getSharedFilters();
      expect(sharedFilters).toHaveLength(2);
      expect(sharedFilters.some(f => f.name === 'Public Filter')).toBe(true);
      expect(sharedFilters.some(f => f.name === 'Shared Filter')).toBe(true);
    });
  });

  describe('Import/Export', () => {
    beforeEach(async () => {
      await service.saveFilter('Filter 1', mockFilterState, {
        category: 'location',
        tags: ['test']
      });
      await service.saveFilter('Filter 2', mockFilterState, {
        category: 'pricing'
      });
    });

    it('should export all filters', () => {
      const exported = service.exportFilters();
      const data = JSON.parse(exported);

      expect(data.version).toBe('1.0');
      expect(data.exportDate).toBeDefined();
      expect(data.filters).toHaveLength(2);
      expect(data.categories).toBeDefined();
    });

    it('should export specific filters', () => {
      const allFilters = service.getAllFilters();
      const exported = service.exportFilters([allFilters[0].id]);
      const data = JSON.parse(exported);

      expect(data.filters).toHaveLength(1);
      expect(data.filters[0].name).toBe(allFilters[0].name);
    });

    it('should import filters successfully', async () => {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        filters: [
          {
            id: 'imported-filter-1',
            name: 'Imported Filter',
            filterState: mockFilterState,
            tags: ['imported'],
            category: 'general',
            isPublic: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
            createdBy: 'test-user',
            sharedWith: []
          }
        ],
        categories: []
      };

      const result = await service.importFilters(JSON.stringify(exportData));
      
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);

      const allFilters = service.getAllFilters();
      expect(allFilters).toHaveLength(3); // 2 existing + 1 imported
      expect(allFilters.some(f => f.name === 'Imported Filter')).toBe(true);
    });

    it('should handle import errors gracefully', async () => {
      const invalidData = '{ invalid json }';
      
      await expect(service.importFilters(invalidData)).rejects.toThrow();
    });
  });

  describe('Storage Persistence', () => {
    it('should persist filters to localStorage', async () => {
      await service.saveFilter('Persistent Filter', mockFilterState);
      
      // Check that data was saved to localStorage
      const storageData = localStorage.getItem('marketplace_saved_filters');
      expect(storageData).toBeDefined();
      
      const data = JSON.parse(storageData!);
      expect(data).toHaveLength(1);
      expect(data[0][1].name).toBe('Persistent Filter');
    });

    it('should load filters from localStorage on initialization', async () => {
      // Save a filter
      await service.saveFilter('Test Filter', mockFilterState);
      
      // Create new instance (simulating app restart)
      (SavedFiltersService as any).instance = undefined;
      const newService = SavedFiltersService.getInstance();
      
      // Check that filter was loaded
      const filters = newService.getAllFilters();
      expect(filters).toHaveLength(1);
      expect(filters[0].name).toBe('Test Filter');
    });
  });

  describe('Sync Status', () => {
    it('should track sync status', () => {
      const status = service.getSyncStatus();
      expect(status).toBeDefined();
      expect(status.lastSync).toBeInstanceOf(Date);
      expect(status.pendingChanges).toBe(0);
      expect(status.syncInProgress).toBe(false);
    });

    it('should increment pending changes when saving filters', async () => {
      const initialStatus = service.getSyncStatus();
      await service.saveFilter('Test Filter', mockFilterState);
      
      const updatedStatus = service.getSyncStatus();
      expect(updatedStatus.pendingChanges).toBe(initialStatus.pendingChanges + 1);
    });

    it('should simulate cloud sync', async () => {
      await service.saveFilter('Test Filter', mockFilterState);
      const beforeSync = service.getSyncStatus();
      expect(beforeSync.pendingChanges).toBeGreaterThan(0);

      await service.syncToCloud();
      
      const afterSync = service.getSyncStatus();
      expect(afterSync.pendingChanges).toBe(0);
      expect(afterSync.lastSync.getTime()).toBeGreaterThan(beforeSync.lastSync.getTime());
    });
  });
});