import { FilterState } from '../types/filter.types';

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filterState: FilterState;
  tags: string[];
  category: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  createdBy: string;
  sharedWith?: string[];
}

export interface SavedFilterCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface SavedFilterSyncStatus {
  lastSync: Date;
  pendingChanges: number;
  syncInProgress: boolean;
  lastError?: string;
}

export class SavedFiltersService {
  private static instance: SavedFiltersService;
  private savedFilters: Map<string, SavedFilter> = new Map();
  private categories: Map<string, SavedFilterCategory> = new Map();
  private syncStatus: SavedFilterSyncStatus = {
    lastSync: new Date(),
    pendingChanges: 0,
    syncInProgress: false
  };

  private readonly STORAGE_KEY = 'marketplace_saved_filters';
  private readonly CATEGORIES_KEY = 'marketplace_filter_categories';
  private readonly SYNC_STATUS_KEY = 'marketplace_filter_sync_status';

  private constructor() {
    this.loadFromStorage();
    this.initializeDefaultCategories();
  }

  public static getInstance(): SavedFiltersService {
    if (!SavedFiltersService.instance) {
      SavedFiltersService.instance = new SavedFiltersService();
    }
    return SavedFiltersService.instance;
  }

  // Filter Management
  public async saveFilter(
    name: string,
    filterState: FilterState,
    options: {
      description?: string;
      tags?: string[];
      category?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<SavedFilter> {
    const id = this.generateId();
    const now = new Date();
    
    const savedFilter: SavedFilter = {
      id,
      name,
      description: options.description,
      filterState: { ...filterState },
      tags: options.tags || [],
      category: options.category || 'general',
      isPublic: options.isPublic || false,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      createdBy: 'current_user', // TODO: Get from auth service
      sharedWith: []
    };

    this.savedFilters.set(id, savedFilter);
    await this.saveToStorage();
    this.incrementPendingChanges();

    return savedFilter;
  }

  public async updateFilter(
    id: string,
    updates: Partial<Omit<SavedFilter, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<SavedFilter | null> {
    const filter = this.savedFilters.get(id);
    if (!filter) return null;

    const updatedFilter: SavedFilter = {
      ...filter,
      ...updates,
      updatedAt: new Date()
    };

    this.savedFilters.set(id, updatedFilter);
    await this.saveToStorage();
    this.incrementPendingChanges();

    return updatedFilter;
  }

  public async deleteFilter(id: string): Promise<boolean> {
    const deleted = this.savedFilters.delete(id);
    if (deleted) {
      await this.saveToStorage();
      this.incrementPendingChanges();
    }
    return deleted;
  }

  public getFilter(id: string): SavedFilter | null {
    return this.savedFilters.get(id) || null;
  }

  public getAllFilters(): SavedFilter[] {
    return Array.from(this.savedFilters.values());
  }

  public getFiltersByCategory(category: string): SavedFilter[] {
    return this.getAllFilters().filter(filter => filter.category === category);
  }

  public getFiltersByTags(tags: string[]): SavedFilter[] {
    return this.getAllFilters().filter(filter =>
      tags.some(tag => filter.tags.includes(tag))
    );
  }

  public searchFilters(query: string): SavedFilter[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllFilters().filter(filter =>
      filter.name.toLowerCase().includes(lowerQuery) ||
      filter.description?.toLowerCase().includes(lowerQuery) ||
      filter.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Usage Tracking
  public async incrementUsage(id: string): Promise<void> {
    const filter = this.savedFilters.get(id);
    if (filter) {
      filter.usageCount++;
      filter.updatedAt = new Date();
      await this.saveToStorage();
      this.incrementPendingChanges();
    }
  }

  public getMostUsedFilters(limit: number = 10): SavedFilter[] {
    return this.getAllFilters()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  public getRecentFilters(limit: number = 10): SavedFilter[] {
    return this.getAllFilters()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  // Category Management
  public async createCategory(
    name: string,
    options: {
      description?: string;
      color?: string;
      icon?: string;
    } = {}
  ): Promise<SavedFilterCategory> {
    const id = this.generateId();
    const category: SavedFilterCategory = {
      id,
      name,
      description: options.description,
      color: options.color || '#6B7280',
      icon: options.icon || 'folder'
    };

    this.categories.set(id, category);
    await this.saveCategoriesStorage();
    this.incrementPendingChanges();

    return category;
  }

  public async updateCategory(
    id: string,
    updates: Partial<Omit<SavedFilterCategory, 'id'>>
  ): Promise<SavedFilterCategory | null> {
    const category = this.categories.get(id);
    if (!category) return null;

    const updatedCategory: SavedFilterCategory = {
      ...category,
      ...updates
    };

    this.categories.set(id, updatedCategory);
    await this.saveCategoriesStorage();
    this.incrementPendingChanges();

    return updatedCategory;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    // Move filters in this category to 'general'
    const filtersInCategory = this.getFiltersByCategory(id);
    for (const filter of filtersInCategory) {
      await this.updateFilter(filter.id, { category: 'general' });
    }

    const deleted = this.categories.delete(id);
    if (deleted) {
      await this.saveCategoriesStorage();
      this.incrementPendingChanges();
    }
    return deleted;
  }

  public getAllCategories(): SavedFilterCategory[] {
    return Array.from(this.categories.values());
  }

  public getCategory(id: string): SavedFilterCategory | null {
    return this.categories.get(id) || null;
  }

  // Sharing and Collaboration
  public async shareFilter(id: string, userIds: string[]): Promise<boolean> {
    const filter = this.savedFilters.get(id);
    if (!filter) return false;

    filter.sharedWith = [...(filter.sharedWith || []), ...userIds];
    filter.updatedAt = new Date();
    
    await this.saveToStorage();
    this.incrementPendingChanges();
    return true;
  }

  public async unshareFilter(id: string, userIds: string[]): Promise<boolean> {
    const filter = this.savedFilters.get(id);
    if (!filter || !filter.sharedWith) return false;

    filter.sharedWith = filter.sharedWith.filter(userId => !userIds.includes(userId));
    filter.updatedAt = new Date();
    
    await this.saveToStorage();
    this.incrementPendingChanges();
    return true;
  }

  public async makeFilterPublic(id: string): Promise<boolean> {
    return await this.updateFilter(id, { isPublic: true }) !== null;
  }

  public async makeFilterPrivate(id: string): Promise<boolean> {
    return await this.updateFilter(id, { isPublic: false, sharedWith: [] }) !== null;
  }

  public getSharedFilters(): SavedFilter[] {
    return this.getAllFilters().filter(filter => 
      filter.isPublic || (filter.sharedWith && filter.sharedWith.length > 0)
    );
  }

  // Import/Export
  public exportFilters(filterIds?: string[]): string {
    const filtersToExport = filterIds 
      ? filterIds.map(id => this.savedFilters.get(id)).filter(Boolean) as SavedFilter[]
      : this.getAllFilters();

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      filters: filtersToExport,
      categories: this.getAllCategories()
    };

    return JSON.stringify(exportData, null, 2);
  }

  public async importFilters(jsonData: string): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    try {
      const importData = JSON.parse(jsonData);
      const results = { imported: 0, skipped: 0, errors: [] as string[] };

      // Import categories first
      if (importData.categories) {
        for (const category of importData.categories) {
          if (!this.categories.has(category.id)) {
            this.categories.set(category.id, category);
          }
        }
      }

      // Import filters
      if (importData.filters) {
        for (const filter of importData.filters) {
          if (this.savedFilters.has(filter.id)) {
            results.skipped++;
          } else {
            try {
              // Generate new ID to avoid conflicts
              const newFilter = {
                ...filter,
                id: this.generateId(),
                createdAt: new Date(filter.createdAt),
                updatedAt: new Date(filter.updatedAt)
              };
              this.savedFilters.set(newFilter.id, newFilter);
              results.imported++;
            } catch (error) {
              results.errors.push(`Failed to import filter "${filter.name}": ${error}`);
            }
          }
        }
      }

      await this.saveToStorage();
      await this.saveCategoriesStorage();
      this.incrementPendingChanges();

      return results;
    } catch (error) {
      throw new Error(`Failed to import filters: ${error}`);
    }
  }

  // Cloud Sync (placeholder for future implementation)
  public async syncToCloud(): Promise<void> {
    if (this.syncStatus.syncInProgress) return;

    this.syncStatus.syncInProgress = true;
    this.syncStatus.lastError = undefined;

    try {
      // TODO: Implement actual cloud sync
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;
    } catch (error) {
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
      await this.saveSyncStatusStorage();
    }
  }

  public getSyncStatus(): SavedFilterSyncStatus {
    return { ...this.syncStatus };
  }

  // Private Methods
  private generateId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private incrementPendingChanges(): void {
    this.syncStatus.pendingChanges++;
    this.saveSyncStatusStorage();
  }

  private async saveToStorage(): Promise<void> {
    try {
      const data = Array.from(this.savedFilters.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save filters to storage:', error);
    }
  }

  private async saveCategoriesStorage(): Promise<void> {
    try {
      const data = Array.from(this.categories.entries());
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save categories to storage:', error);
    }
  }

  private async saveSyncStatusStorage(): Promise<void> {
    try {
      localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));
    } catch (error) {
      console.error('Failed to save sync status to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      // Load filters
      const filtersData = localStorage.getItem(this.STORAGE_KEY);
      if (filtersData) {
        const entries = JSON.parse(filtersData);
        this.savedFilters = new Map(entries.map(([id, filter]: [string, any]) => [
          id,
          {
            ...filter,
            createdAt: new Date(filter.createdAt),
            updatedAt: new Date(filter.updatedAt)
          }
        ]));
      }

      // Load categories
      const categoriesData = localStorage.getItem(this.CATEGORIES_KEY);
      if (categoriesData) {
        const entries = JSON.parse(categoriesData);
        this.categories = new Map(entries);
      }

      // Load sync status
      const syncStatusData = localStorage.getItem(this.SYNC_STATUS_KEY);
      if (syncStatusData) {
        const status = JSON.parse(syncStatusData);
        this.syncStatus = {
          ...status,
          lastSync: new Date(status.lastSync),
          syncInProgress: false // Reset on load
        };
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  private initializeDefaultCategories(): void {
    if (this.categories.size === 0) {
      const defaultCategories: SavedFilterCategory[] = [
        {
          id: 'general',
          name: 'General',
          description: 'General purpose filters',
          color: '#6B7280',
          icon: 'folder'
        },
        {
          id: 'location',
          name: 'Location',
          description: 'Location-based filters',
          color: '#10B981',
          icon: 'map-pin'
        },
        {
          id: 'pricing',
          name: 'Pricing',
          description: 'Price and budget filters',
          color: '#F59E0B',
          icon: 'dollar-sign'
        },
        {
          id: 'technical',
          name: 'Technical',
          description: 'Technical specifications',
          color: '#8B5CF6',
          icon: 'settings'
        },
        {
          id: 'favorites',
          name: 'Favorites',
          description: 'Your favorite filter combinations',
          color: '#EF4444',
          icon: 'heart'
        }
      ];

      defaultCategories.forEach(category => {
        this.categories.set(category.id, category);
      });

      this.saveCategoriesStorage();
    }
  }
}

// Export singleton instance
export const savedFiltersService = SavedFiltersService.getInstance();