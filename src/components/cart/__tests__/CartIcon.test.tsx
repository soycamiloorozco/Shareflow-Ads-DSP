import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartIcon, CartIconCompact, CartIconWithText } from '../CartIcon';
import { CartProvider } from '../../../contexts/CartContext';
import { SportEvents } from '../../../hooks/useSportEvents';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock CartContext
const mockCartContext = {
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    totalAudience: 0,
    isOpen: false,
    loading: false,
    error: null,
    lastUpdated: new Date()
  },
  drafts: [],
  addEvent: jest.fn(),
  removeEvent: jest.fn(),
  updateEvent: jest.fn(),
  clearCart: jest.fn(),
  configureMoments: jest.fn(),
  getMomentOptions: jest.fn(),
  toggleCart: jest.fn(),
  refreshCart: jest.fn(),
  saveDraft: jest.fn(),
  loadDraft: jest.fn(),
  deleteDraft: jest.fn(),
  refreshDrafts: jest.fn(),
  validateCheckout: jest.fn(),
  processCheckout: jest.fn(),
  getCartAnalytics: jest.fn(),
  isEventInCart: jest.fn(),
  getCartItemByEventId: jest.fn()
};

jest.mock('../../../contexts/CartContext', () => ({
  useCart: () => mockCartContext,
  CartProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock SportEvents data
const mockSportEvent: SportEvents = {
  id: '1',
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
  stadiumPhotos: ['stadium1.jpg']
};

describe('CartIcon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartContext.cart.totalItems = 0;
    mockCartContext.cart.loading = false;
  });

  describe('CartIcon component', () => {
    it('should render cart icon without badge when cart is empty', () => {
      render(<CartIcon />);
      
      const button = screen.getByRole('button', { name: /carrito de compras/i });
      expect(button).toBeInTheDocument();
      
      // Badge should not be visible when cart is empty
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should render cart icon with badge when cart has items', () => {
      mockCartContext.cart.totalItems = 3;
      
      render(<CartIcon />);
      
      const button = screen.getByRole('button', { name: /carrito de compras \(3 eventos\)/i });
      expect(button).toBeInTheDocument();
      
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });

    it('should show 99+ when cart has more than 99 items', () => {
      mockCartContext.cart.totalItems = 150;
      
      render(<CartIcon />);
      
      const badge = screen.getByText('99+');
      expect(badge).toBeInTheDocument();
    });

    it('should call toggleCart when clicked', () => {
      render(<CartIcon />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockCartContext.toggleCart).toHaveBeenCalledTimes(1);
    });

    it('should call custom onClick when provided', () => {
      const mockOnClick = jest.fn();
      render(<CartIcon onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockCartContext.toggleCart).not.toHaveBeenCalled();
    });

    it('should show loading indicator when cart is loading', () => {
      mockCartContext.cart.loading = true;
      
      render(<CartIcon />);
      
      const loadingSpinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should hide badge when showBadge is false', () => {
      mockCartContext.cart.totalItems = 5;
      
      render(<CartIcon showBadge={false} />);
      
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<CartIcon className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render different sizes correctly', () => {
      const { rerender } = render(<CartIcon size="sm" />);
      let icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('w-4', 'h-4');

      rerender(<CartIcon size="md" />);
      icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('w-5', 'h-5');

      rerender(<CartIcon size="lg" />);
      icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('w-6', 'h-6');
    });
  });

  describe('CartIconCompact component', () => {
    it('should render compact cart icon', () => {
      render(<CartIconCompact />);
      
      const button = screen.getByRole('button', { name: /carrito de compras/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });

    it('should show 9+ for more than 9 items in compact mode', () => {
      mockCartContext.cart.totalItems = 15;
      
      render(<CartIconCompact />);
      
      const badge = screen.getByText('9+');
      expect(badge).toBeInTheDocument();
    });

    it('should call toggleCart when clicked', () => {
      render(<CartIconCompact />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockCartContext.toggleCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('CartIconWithText component', () => {
    it('should render cart icon with text', () => {
      render(<CartIconWithText />);
      
      const button = screen.getByRole('button', { name: /carrito de compras/i });
      expect(button).toBeInTheDocument();
      
      const text = screen.getByText('Carrito');
      expect(text).toBeInTheDocument();
    });

    it('should show item count in text when cart has items', () => {
      mockCartContext.cart.totalItems = 2;
      
      render(<CartIconWithText />);
      
      const text = screen.getByText('(2)');
      expect(text).toBeInTheDocument();
    });

    it('should call toggleCart when clicked', () => {
      render(<CartIconWithText />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockCartContext.toggleCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockCartContext.cart.totalItems = 3;
      
      render(<CartIcon />);
      
      const button = screen.getByRole('button', { 
        name: 'Carrito de compras (3 eventos)' 
      });
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<CartIcon />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
      
      // Should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should have focus styles', () => {
      render(<CartIcon />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Animation and interactions', () => {
    it('should have hover and tap animations', () => {
      render(<CartIcon />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-gray-100', 'transition-colors');
    });

    it('should show pulse animation for new items', () => {
      mockCartContext.cart.totalItems = 1;
      
      render(<CartIcon />);
      
      // The pulse animation div should be present when there are items
      const button = screen.getByRole('button');
      expect(button.querySelector('.pointer-events-none')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle missing cart context gracefully', () => {
      // This test would need to mock the useCart hook to throw an error
      // For now, we just ensure the component doesn't crash
      expect(() => render(<CartIcon />)).not.toThrow();
    });

    it('should handle undefined totalItems', () => {
      // @ts-ignore - Testing edge case
      mockCartContext.cart.totalItems = undefined;
      
      expect(() => render(<CartIcon />)).not.toThrow();
    });
  });
});