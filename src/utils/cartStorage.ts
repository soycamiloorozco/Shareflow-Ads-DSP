import { CartEvent, CartState } from '../types/cart';

// Storage Keys
const CART_STORAGE_KEY = 'shareflow_sports_cart';
const CART_SESSION_KEY = 'shareflow_cart_session';

// Storage Schema
interface CartStorageSchema {
  version: string;
  cart: {
    items: CartEvent[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
    };
  };
  preferences: {
    autoSave: boolean;
    notifications: boolean;
    defaultMomentTypes: string[];
  };
}

// Session Storage for Temporary Data
interface SessionCartData {
  currentConfiguring?: string;     // Event being configured
  checkoutStep?: number;           // Current checkout step
  tempSelections?: any;            // Temporary selections
}

class CartStorageService {
  private static readonly STORAGE_VERSION = '1.0.0';

  // Initialize storage with default values
  static initializeStorage(): void {
    try {
      const existingData = localStorage.getItem(CART_STORAGE_KEY);
      if (!existingData) {
        const defaultSchema: CartStorageSchema = {
          version: this.STORAGE_VERSION,
          cart: {
            items: [],
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date()
            }
          },
          preferences: {
            autoSave: true,
            notifications: true,
            defaultMomentTypes: []
          }
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(defaultSchema));
      }
    } catch (error) {
      console.error('Error initializing cart storage:', error);
    }
  }

  // Save cart items to localStorage
  static saveCartItems(items: CartEvent[]): void {
    try {
      const existingData = this.getStorageData();
      if (existingData) {
        existingData.cart.items = items;
        existingData.cart.metadata.updatedAt = new Date();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingData));
      }
    } catch (error) {
      console.error('Error saving cart items:', error);
      throw new Error('Failed to save cart items');
    }
  }

  // Load cart items from localStorage
  static loadCartItems(): CartEvent[] {
    try {
      const data = this.getStorageData();
      if (data) {
        // Convert date strings back to Date objects
        return data.cart.items.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading cart items:', error);
      return [];
    }
  }

  // Clear all cart data
  static clearCart(): void {
    try {
      const data = this.getStorageData();
      if (data) {
        data.cart.items = [];
        data.cart.metadata.updatedAt = new Date();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  // Session storage methods
  static saveSessionData(data: SessionCartData): void {
    try {
      sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  static loadSessionData(): SessionCartData | null {
    try {
      const data = sessionStorage.getItem(CART_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading session data:', error);
      return null;
    }
  }

  static clearSessionData(): void {
    try {
      sessionStorage.removeItem(CART_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }

  // Private helper methods
  private static getStorageData(): CartStorageSchema | null {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing storage data:', error);
      return null;
    }
  }

  private static clearStorage(): void {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      this.initializeStorage();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Utility methods
  static getStorageSize(): number {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  // Get cart statistics
  static getCartStatistics(): {
    totalItems: number;
    storageSize: number;
    createdAt: Date | null;
    updatedAt: Date | null;
  } {
    try {
      const data = this.getStorageData();
      if (!data) {
        return {
          totalItems: 0,
          storageSize: 0,
          createdAt: null,
          updatedAt: null
        };
      }

      return {
        totalItems: data.cart.items.length,
        storageSize: this.getStorageSize(),
        createdAt: new Date(data.cart.metadata.createdAt),
        updatedAt: new Date(data.cart.metadata.updatedAt)
      };
    } catch (error) {
      console.error('Error getting cart statistics:', error);
      return {
        totalItems: 0,
        storageSize: 0,
        createdAt: null,
        updatedAt: null
      };
    }
  }
}

export default CartStorageService;