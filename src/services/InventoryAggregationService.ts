/**
 * Inventory Aggregation Service
 * Manages combined inventory from local and SSP sources
 */

import { SSPInventoryAdapter } from './SSPInventoryAdapter';
import { Screen } from '../pages/marketplace/types/screen.types';
import { DOOHInventoryData } from '../types/openrtb-dooh';
import { SSPErrorHandler } from './SSPErrorHandler';

export class InventoryAggregationService {
  private static instance: InventoryAggregationService;
  private aggregatedInventory: Screen[] = [];
  private updateCallbacks: Array<(inventory: Screen[]) => void> = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start cleanup interval when service is created
    this.startCleanupInterval();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): InventoryAggregationService {
    if (!this.instance) {
      this.instance = new InventoryAggregationService();
    }
    return this.instance;
  }

  /**
   * Add SSP inventory to aggregated inventory with comprehensive error handling
   */
  async addSSPInventory(sspInventory: DOOHInventoryData[]): Promise<void> {
    try {
      if (!Array.isArray(sspInventory) || sspInventory.length === 0) {
        console.warn('Empty or invalid SSP inventory provided');
        return;
      }

      const convertedScreens: Screen[] = [];
      const conversionErrors: Array<{ inventory: DOOHInventoryData; error: any }> = [];

      // Convert each inventory item with individual error handling
      for (const inventory of sspInventory) {
        try {
          const convertedScreen = SSPInventoryAdapter.convertSSPToMarketplaceScreen(inventory);
          convertedScreens.push(convertedScreen);
        } catch (error) {
          conversionErrors.push({ inventory, error });
          SSPErrorHandler.logError(
            error,
            'InventoryAggregationService.addSSPInventory.conversion',
            { 
              sspId: inventory.SSPId,
              venueId: inventory.VenueInfo?.VenueId 
            }
          );
        }
      }

      // Log conversion statistics
      console.log(`SSP inventory conversion: ${convertedScreens.length} successful, ${conversionErrors.length} failed`);

      if (convertedScreens.length === 0) {
        throw new Error('No SSP inventory could be converted successfully');
      }

      // Remove existing SSP inventory with same IDs to prevent duplicates
      this.aggregatedInventory = this.aggregatedInventory.filter(screen =>
        !convertedScreens.some(newScreen => newScreen.id === screen.id)
      );

      // Add new SSP inventory
      this.aggregatedInventory = [
        ...this.aggregatedInventory,
        ...convertedScreens
      ];

      // Validate inventory integrity after addition
      const validation = this.validateInventory();
      if (!validation.isValid) {
        SSPErrorHandler.logError(
          new Error('Inventory integrity validation failed after SSP addition'),
          'InventoryAggregationService.addSSPInventory.validation',
          { errors: validation.errors }
        );
      }

      // Notify subscribers of inventory update
      this.notifyUpdateCallbacks();

      console.log(`Successfully added ${convertedScreens.length} SSP screens to inventory`);

      // Report conversion errors if any
      if (conversionErrors.length > 0) {
        console.warn(`${conversionErrors.length} SSP inventory items failed conversion:`, 
          conversionErrors.map(e => ({ sspId: e.inventory.SSPId, error: e.error.message }))
        );
      }

    } catch (error) {
      SSPErrorHandler.logError(
        error,
        'InventoryAggregationService.addSSPInventory',
        { inventoryCount: sspInventory?.length }
      );
      throw error;
    }
  }

  /**
   * Get all inventory (local + SSP)
   */
  getAllInventory(): Screen[] {
    return [...this.aggregatedInventory];
  }

  /**
   * Get only SSP inventory
   */
  getSSPInventory(): Screen[] {
    return this.aggregatedInventory.filter(screen =>
      screen.sspMetadata?.isSSPInventory === true
    );
  }

  /**
   * Get inventory by SSP ID
   */
  getInventoryBySSP(sspId: string): Screen[] {
    return this.aggregatedInventory.filter(screen =>
      screen.sspMetadata?.sspId === sspId
    );
  }

  /**
   * Subscribe to inventory updates
   */
  onInventoryUpdate(callback: (inventory: Screen[]) => void): void {
    this.updateCallbacks.push(callback);
  }

  /**
   * Unsubscribe from inventory updates
   */
  offInventoryUpdate(callback: (inventory: Screen[]) => void): void {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Remove expired SSP inventory
   */
  removeExpiredSSPInventory(): void {
    const now = Date.now();
    const thirtyMinutesAgo = now - (30 * 60 * 1000);
    
    const initialCount = this.aggregatedInventory.length;
    
    this.aggregatedInventory = this.aggregatedInventory.filter(screen => {
      // Keep non-SSP inventory
      if (!screen.sspMetadata?.isSSPInventory) return true;
      
      // Check if SSP inventory is still fresh
      const lastUpdated = new Date(screen.sspMetadata.lastUpdated).getTime();
      return lastUpdated > thirtyMinutesAgo;
    });

    const removedCount = initialCount - this.aggregatedInventory.length;
    
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} expired SSP screens from inventory`);
      this.notifyUpdateCallbacks();
    }
  }

  /**
   * Remove inventory from specific SSP
   */
  removeSSPInventory(sspId: string): void {
    const initialCount = this.aggregatedInventory.length;
    
    this.aggregatedInventory = this.aggregatedInventory.filter(screen =>
      screen.sspMetadata?.sspId !== sspId
    );

    const removedCount = initialCount - this.aggregatedInventory.length;
    
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} screens from SSP ${sspId}`);
      this.notifyUpdateCallbacks();
    }
  }

  /**
   * Get inventory statistics
   */
  getInventoryStats(): {
    total: number;
    ssp: number;
    local: number;
    bySSP: Record<string, number>;
    lastUpdated: string;
  } {
    const sspInventory = this.getSSPInventory();
    const bySSP: Record<string, number> = {};
    
    sspInventory.forEach(screen => {
      if (screen.sspMetadata?.sspName) {
        bySSP[screen.sspMetadata.sspName] = (bySSP[screen.sspMetadata.sspName] || 0) + 1;
      }
    });

    return {
      total: this.aggregatedInventory.length,
      ssp: sspInventory.length,
      local: this.aggregatedInventory.length - sspInventory.length,
      bySSP,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear all inventory
   */
  clearInventory(): void {
    this.aggregatedInventory = [];
    this.notifyUpdateCallbacks();
  }

  /**
   * Clear only SSP inventory
   */
  clearSSPInventory(): void {
    this.aggregatedInventory = this.aggregatedInventory.filter(screen =>
      !screen.sspMetadata?.isSSPInventory
    );
    this.notifyUpdateCallbacks();
  }

  /**
   * Validate inventory integrity
   */
  validateInventory(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const seenIds = new Set<string>();

    this.aggregatedInventory.forEach((screen, index) => {
      // Check for duplicate IDs
      if (seenIds.has(screen.id)) {
        errors.push(`Duplicate screen ID found: ${screen.id}`);
      } else {
        seenIds.add(screen.id);
      }

      // Check required fields
      if (!screen.name) {
        errors.push(`Screen at index ${index} missing name`);
      }
      if (!screen.location) {
        warnings.push(`Screen ${screen.id} missing location`);
      }
      if (!screen.coordinates?.lat || !screen.coordinates?.lng) {
        warnings.push(`Screen ${screen.id} missing valid coordinates`);
      }

      // Check SSP metadata consistency
      if (screen.sspMetadata?.isSSPInventory) {
        if (!screen.sspMetadata.sspId) {
          errors.push(`SSP screen ${screen.id} missing sspId`);
        }
        if (!screen.sspMetadata.sspName) {
          warnings.push(`SSP screen ${screen.id} missing sspName`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Notify all update callbacks
   */
  private notifyUpdateCallbacks(): void {
    const inventory = this.getAllInventory();
    this.updateCallbacks.forEach(callback => {
      try {
        callback(inventory);
      } catch (error) {
        console.error('Error in inventory update callback:', error);
      }
    });
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Clean up expired inventory every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.removeExpiredSSPInventory();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopCleanupInterval();
    this.updateCallbacks = [];
    this.aggregatedInventory = [];
  }
}