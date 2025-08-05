import { CartState, CartEvent, SelectedCartMoment, CartDraft } from '../types/cart';
import { CartCalculations } from '../utils/cartValidation';

// Cart Action Types
export enum CartActionType {
  // Cart Management
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  TOGGLE_CART = 'TOGGLE_CART',
  
  // Item Management
  ADD_EVENT = 'ADD_EVENT',
  REMOVE_EVENT = 'REMOVE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  CLEAR_CART = 'CLEAR_CART',
  
  // Moment Configuration
  CONFIGURE_MOMENTS = 'CONFIGURE_MOMENTS',
  UPDATE_MOMENTS = 'UPDATE_MOMENTS',
  
  // Cart State
  LOAD_CART = 'LOAD_CART',
  REFRESH_TOTALS = 'REFRESH_TOTALS',
  
  // Draft Management
  LOAD_DRAFT = 'LOAD_DRAFT',
  SAVE_DRAFT_SUCCESS = 'SAVE_DRAFT_SUCCESS'
}

// Cart Actions
export type CartAction =
  | { type: CartActionType.SET_LOADING; payload: boolean }
  | { type: CartActionType.SET_ERROR; payload: string }
  | { type: CartActionType.CLEAR_ERROR }
  | { type: CartActionType.TOGGLE_CART }
  | { type: CartActionType.ADD_EVENT; payload: CartEvent }
  | { type: CartActionType.REMOVE_EVENT; payload: string } // cartId
  | { type: CartActionType.UPDATE_EVENT; payload: { cartId: string; updates: Partial<CartEvent> } }
  | { type: CartActionType.CLEAR_CART }
  | { type: CartActionType.CONFIGURE_MOMENTS; payload: { cartId: string; moments: SelectedCartMoment[] } }
  | { type: CartActionType.UPDATE_MOMENTS; payload: { cartId: string; moments: SelectedCartMoment[] } }
  | { type: CartActionType.LOAD_CART; payload: CartEvent[] }
  | { type: CartActionType.REFRESH_TOTALS }
  | { type: CartActionType.LOAD_DRAFT; payload: CartEvent[] }
  | { type: CartActionType.SAVE_DRAFT_SUCCESS; payload: string }; // draftId

// Initial Cart State
export const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  totalAudience: 0,
  isOpen: false,
  loading: false,
  error: null,
  lastUpdated: new Date()
};

// Helper function to calculate totals
const calculateTotals = (items: CartEvent[]): Pick<CartState, 'totalItems' | 'totalPrice' | 'totalAudience'> => {
  const totalItems = items.length;
  const totalPrice = CartCalculations.calculateTotalPrice(items);
  const totalAudience = CartCalculations.calculateTotalAudience(items);
  
  return {
    totalItems,
    totalPrice,
    totalAudience
  };
};

// Cart Reducer
export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case CartActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case CartActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case CartActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case CartActionType.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen
      };

    case CartActionType.ADD_EVENT: {
      const newEvent = action.payload;
      
      // Check if event already exists
      const existingIndex = state.items.findIndex(item => item.id === newEvent.id);
      if (existingIndex >= 0) {
        return state; // Don't add duplicate
      }

      const newItems = [...state.items, newEvent];
      const totals = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastUpdated: new Date(),
        error: null
      };
    }

    case CartActionType.REMOVE_EVENT: {
      const cartId = action.payload;
      const newItems = state.items.filter(item => item.cartId !== cartId);
      const totals = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastUpdated: new Date(),
        error: null
      };
    }

    case CartActionType.UPDATE_EVENT: {
      const { cartId, updates } = action.payload;
      const newItems = state.items.map(item =>
        item.cartId === cartId ? { ...item, ...updates } : item
      );
      const totals = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastUpdated: new Date(),
        error: null
      };
    }

    case CartActionType.CLEAR_CART: {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        totalAudience: 0,
        lastUpdated: new Date(),
        error: null
      };
    }

    case CartActionType.CONFIGURE_MOMENTS: {
      const { cartId, moments } = action.payload;
      const newItems = state.items.map(item => {
        if (item.cartId === cartId) {
          const finalPrice = moments.reduce((sum, moment) => 
            sum + (moment.price * moment.quantity), 0
          );
          
          return {
            ...item,
            selectedMoments: moments,
            isConfigured: true,
            finalPrice
          };
        }
        return item;
      });
      
      const totals = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastUpdated: new Date(),
        error: null
      };
    }

    case CartActionType.UPDATE_MOMENTS: {
      const { cartId, moments } = action.payload;
      const newItems = state.items.map(item => {
        if (item.cartId === cartId) {
          const finalPrice = moments.reduce((sum, moment) => 
            sum + (moment.price * moment.quantity), 0
          );
          
          return {
            ...item,
            selectedMoments: moments,
            finalPrice
          };
        }
        return item;
      });
      
      const totals = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastUpdated: new Date(),
        error: null
      };
    }

    case CartActionType.LOAD_CART: {
      const items = action.payload;
      const totals = calculateTotals(items);

      return {
        ...state,
        items,
        ...totals,
        lastUpdated: new Date(),
        loading: false,
        error: null
      };
    }

    case CartActionType.REFRESH_TOTALS: {
      const totals = calculateTotals(state.items);

      return {
        ...state,
        ...totals,
        lastUpdated: new Date()
      };
    }

    case CartActionType.LOAD_DRAFT: {
      const draftItems = action.payload;
      const totals = calculateTotals(draftItems);

      return {
        ...state,
        items: draftItems,
        ...totals,
        lastUpdated: new Date(),
        loading: false,
        error: null
      };
    }

    case CartActionType.SAVE_DRAFT_SUCCESS: {
      return {
        ...state,
        loading: false,
        error: null
      };
    }

    default:
      return state;
  }
};

// Action Creators
export const cartActions = {
  setLoading: (loading: boolean): CartAction => ({
    type: CartActionType.SET_LOADING,
    payload: loading
  }),

  setError: (error: string): CartAction => ({
    type: CartActionType.SET_ERROR,
    payload: error
  }),

  clearError: (): CartAction => ({
    type: CartActionType.CLEAR_ERROR
  }),

  toggleCart: (): CartAction => ({
    type: CartActionType.TOGGLE_CART
  }),

  addEvent: (event: CartEvent): CartAction => ({
    type: CartActionType.ADD_EVENT,
    payload: event
  }),

  removeEvent: (cartId: string): CartAction => ({
    type: CartActionType.REMOVE_EVENT,
    payload: cartId
  }),

  updateEvent: (cartId: string, updates: Partial<CartEvent>): CartAction => ({
    type: CartActionType.UPDATE_EVENT,
    payload: { cartId, updates }
  }),

  clearCart: (): CartAction => ({
    type: CartActionType.CLEAR_CART
  }),

  configureMoments: (cartId: string, moments: SelectedCartMoment[]): CartAction => ({
    type: CartActionType.CONFIGURE_MOMENTS,
    payload: { cartId, moments }
  }),

  updateMoments: (cartId: string, moments: SelectedCartMoment[]): CartAction => ({
    type: CartActionType.UPDATE_MOMENTS,
    payload: { cartId, moments }
  }),

  loadCart: (items: CartEvent[]): CartAction => ({
    type: CartActionType.LOAD_CART,
    payload: items
  }),

  refreshTotals: (): CartAction => ({
    type: CartActionType.REFRESH_TOTALS
  }),

  loadDraft: (items: CartEvent[]): CartAction => ({
    type: CartActionType.LOAD_DRAFT,
    payload: items
  }),

  saveDraftSuccess: (draftId: string): CartAction => ({
    type: CartActionType.SAVE_DRAFT_SUCCESS,
    payload: draftId
  })
};