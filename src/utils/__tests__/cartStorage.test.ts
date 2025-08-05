import CartStorageService from '../cartStorage';
import { CartEvent, CartDraft } from '../../types/cart';

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

// Mock sessionStorage
const sessionStorageMock = (() => {
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

// Replace global localStorage and sessionStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock data
const mockCartEvent: CartEvent = {
  id: '1',
  cartId: 'cart-1',
  homeTeamId: 'team1',
  awayTeamId: 'team2',
  stadiumId: 'stadium1',
  eventDate: new Date().toISOString(),
  eventTime: '20:00',
  estimatedAttendance: 50000,
  estimatedAttendanceTv: 100000,
  maxMoments: 3,
  broadcastChannels: 'ESPN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  homeTeamName: 'Team A',
  awayTeamName: 'Team B',
  homeTeamImage: 'team-a.png',
  awayTeamImage: 'team-b.png',
  stadiumName: 'Stadium Test',
  status: 'Active',
  momentPrices: [{ moment: 'pre-game', price: 500000 }],
  moments: [{ moment: 'pre-game', price: 500000 }],
  stadiumPhotos: ['stadium1.jpg'],
  addedAt: new Date(),
  isConfigured: true,
  estimatedPrice: 500000,
  finalPrice: 500000
};

const mockDraft: CartDraft = {
  id: 'draft-1',
  name: 'Test Draft',
  description: 'Test draft description',
  items: [mockCartEvent],
  totalPrice: 500000,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ['test']
};

describe('CartStorageService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  describe('initializeStorage', () => {
    it('should initialize storage with default schema', () => {
      CartStorageService.initializeStorage();
      const data = localStorageMock.getItem('shareflow_sports_cart');
      expect(data).toBeTruthy();
      
      const parsedData = JSON.parse(data!);
      expect(parsedData.version).toBe('1.0.0');
      expect(parsedData.cart.items).toEqual([]);
      expect(parsedData.drafts).toEqual([]);
    });

    it('should not overwrite existing data', () => {
      const existingData = {
        version: '1.0.0',
        cart: { items: [mockCartEvent], metadata: { createdAt: new Date(), updatedAt: new Date(), expiresAt: new Date() } },
        drafts: [],
        preferences: { autoSave: true, notifications: true, defaultMomentTypes: [] }
      };
      localStorageMock.setItem('shareflow_sports_cart', JSON.stringify(existingData));
      
      CartStorageService.initializeStorage();
      const data = JSON.parse(localStorageMock.getItem('shareflow_sports_cart')!);
      expect(data.cart.items).toHaveLength(1);
    });
  });

  describe('saveCartItems and loadCartItems', () => {
    beforeEach(() => {
      CartStorageService.initializeStorage();
    });

    it('should save and load cart items correctly', () => {
      const items = [mockCartEvent];
      CartStorageService.saveCartItems(items);
      
      const loadedItems = CartStorageService.loadCartItems();
      expect(loadedItems).toHaveLength(1);
      expect(loadedItems[0].id).toBe(mockCartEvent.id);
      expect(loadedItems[0].cartId).toBe(mockCartEvent.cartId);
    });

    it('should handle date conversion correctly', () => {
      const items = [mockCartEvent];
      CartStorageService.saveCartItems(items);
      
      const loadedItems = CartStorageService.loadCartItems();
      expect(loadedItems[0].addedAt).toBeInstanceOf(Date);
    });

    it('should return empty array when no data exists', () => {
      localStorageMock.clear();
      const items = CartStorageService.loadCartItems();
      expect(items).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.setItem('shareflow_sports_cart', 'invalid json');
      const items = CartStorageService.loadCartItems();
      expect(items).toEqual([]);
    });
  });

  describe('saveDraft and loadDrafts', () => {
    beforeEach(() => {
      CartStorageService.initializeStorage();
    });

    it('should save and load drafts correctly', () => {
      CartStorageService.saveDraft(mockDraft);
      
      const drafts = CartStorageService.loadDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].id).toBe(mockDraft.id);
      expect(drafts[0].name).toBe(mockDraft.name);
    });

    it('should update existing draft', () => {
      CartStorageService.saveDraft(mockDraft);
      
      const updatedDraft = { ...mockDraft, name: 'Updated Draft' };
      CartStorageService.saveDraft(updatedDraft);
      
      const drafts = CartStorageService.loadDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].name).toBe('Updated Draft');
    });

    it('should handle date conversion for drafts', () => {
      CartStorageService.saveDraft(mockDraft);
      
      const drafts = CartStorageService.loadDrafts();
      expect(drafts[0].createdAt).toBeInstanceOf(Date);
      expect(drafts[0].updatedAt).toBeInstanceOf(Date);
      expect(drafts[0].items[0].addedAt).toBeInstanceOf(Date);
    });
  });

  describe('deleteDraft', () => {
    beforeEach(() => {
      CartStorageService.initializeStorage();
      CartStorageService.saveDraft(mockDraft);
    });

    it('should delete draft correctly', () => {
      CartStorageService.deleteDraft(mockDraft.id);
      
      const drafts = CartStorageService.loadDrafts();
      expect(drafts).toHaveLength(0);
    });

    it('should not affect other drafts', () => {
      const secondDraft = { ...mockDraft, id: 'draft-2', name: 'Second Draft' };
      CartStorageService.saveDraft(secondDraft);
      
      CartStorageService.deleteDraft(mockDraft.id);
      
      const drafts = CartStorageService.loadDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].id).toBe('draft-2');
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      CartStorageService.initializeStorage();
      CartStorageService.saveCartItems([mockCartEvent]);
    });

    it('should clear cart items', () => {
      CartStorageService.clearCart();
      
      const items = CartStorageService.loadCartItems();
      expect(items).toHaveLength(0);
    });

    it('should not affect drafts', () => {
      CartStorageService.saveDraft(mockDraft);
      CartStorageService.clearCart();
      
      const drafts = CartStorageService.loadDrafts();
      expect(drafts).toHaveLength(1);
    });
  });

  describe('session storage methods', () => {
    const sessionData = {
      currentConfiguring: 'event-1',
      checkoutStep: 2,
      tempSelections: { test: 'data' }
    };

    it('should save and load session data', () => {
      CartStorageService.saveSessionData(sessionData);
      
      const loaded = CartStorageService.loadSessionData();
      expect(loaded).toEqual(sessionData);
    });

    it('should return null when no session data exists', () => {
      const loaded = CartStorageService.loadSessionData();
      expect(loaded).toBeNull();
    });

    it('should clear session data', () => {
      CartStorageService.saveSessionData(sessionData);
      CartStorageService.clearSessionData();
      
      const loaded = CartStorageService.loadSessionData();
      expect(loaded).toBeNull();
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      CartStorageService.initializeStorage();
    });

    it('should calculate storage size', () => {
      const size = CartStorageService.getStorageSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });

    it('should optimize storage by removing old drafts', () => {
      // Create old draft (91 days ago)
      const oldDate = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
      const oldDraft = { ...mockDraft, id: 'old-draft', updatedAt: oldDate };
      
      // Create recent draft
      const recentDraft = { ...mockDraft, id: 'recent-draft' };
      
      CartStorageService.saveDraft(oldDraft);
      CartStorageService.saveDraft(recentDraft);
      
      CartStorageService.optimizeStorage();
      
      const drafts = CartStorageService.loadDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].id).toBe('recent-draft');
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('Storage error');
      };

      expect(() => {
        CartStorageService.saveCartItems([mockCartEvent]);
      }).toThrow('Failed to save cart items');

      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });

    it('should handle sessionStorage errors gracefully', () => {
      // Mock sessionStorage to throw error
      const originalSetItem = sessionStorageMock.setItem;
      sessionStorageMock.setItem = () => {
        throw new Error('Storage error');
      };

      // Should not throw error
      expect(() => {
        CartStorageService.saveSessionData({ test: 'data' });
      }).not.toThrow();

      // Restore original method
      sessionStorageMock.setItem = originalSetItem;
    });
  });
});