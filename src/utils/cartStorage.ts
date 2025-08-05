import { CartEvent, CartDraft, CartState } from '../types/cart';

// Storage Keys
const CART_STORAGE_KEY = 'shareflow_sports_cart';
const DRAFTS_STORAGE_KEY = 'shareflow_sports_drafts';
const CART_SESSION_KEY = 'shareflow_cart_session';

// Storage Schema
interface CartStorageSchema {
  version: string;
  cart: {
    items: CartEvent[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      expiresAt: Date;
    };
  };
  drafts: CartDraft[];
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
  private static readonly CART_EXPIRY_DAYS = 30;

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
              updatedAt: new Date(),
              expiresAt: new Date(Date.now() + this.CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
            }
          },
          drafts: [],
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
      if (data && this.isDataValid(data)) {
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

  // Save draft to localStorage
  static saveDraft(draft: CartDraft): void {
    try {
      const data = this.getStorageData();
      if (data) {
        const existingIndex = data.drafts.findIndex(d => d.id === draft.id);
        if (existingIndex >= 0) {
          data.drafts[existingIndex] = draft;
        } else {
          data.drafts.push(draft);
        }
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  // Load all drafts
  static loadDrafts(): CartDraft[] {
    try {
      const data = this.getStorageData();
      if (data) {
        return data.drafts.map(draft => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt),
          items: draft.items.map(item => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading drafts:', error);
      return [];
    }
  }

  // Delete draft
  static deleteDraft(draftId: string): void {
    try {
      const data = this.getStorageData();
      if (data) {
        data.drafts = data.drafts.filter(d => d.id !== draftId);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw new Error('Failed to delete draft');
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

  private static isDataValid(data: CartStorageSchema): boolean {
    try {
      // Check version compatibility
      if (data.version !== this.STORAGE_VERSION) {
        console.warn('Storage version mismatch, clearing data');
        this.clearStorage();
        return false;
      }

      // Check expiry
      const expiryDate = new Date(data.cart.metadata.expiresAt);
      if (expiryDate < new Date()) {
        console.warn('Cart data expired, clearing');
        this.clearStorage();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating storage data:', error);
      return false;
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

  static optimizeStorage(): void {
    try {
      const data = this.getStorageData();
      if (data) {
        // Remove expired drafts (older than 90 days)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        data.drafts = data.drafts.filter(draft => 
          new Date(draft.updatedAt) > ninetyDaysAgo
        );
        
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error optimizing storage:', error);
    }
  }
}

export default CartStorageService;