import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletCheck, WalletCheckCompact } from '../WalletCheck';
import { useCart } from '../../../contexts/CartContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock cart context
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
  validateCheckout: jest.fn()
};

jest.mock('../../../contexts/CartContext', () => ({
  useCart: () => mockCartContext
}));

describe('WalletCheck', () => {
  const mockOnRecharge = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCartContext.cart.items = [];
    mockCartContext.cart.totalPrice = 0;
  });

  describe('when cart is empty', () => {
    it('should not render when cart is empty', () => {
      render(<WalletCheck walletBalance={1000000} />);
      
      expect(screen.queryByText('Verificación de balance')).not.toBeInTheDocument();
    });
  });

  describe('when cart has items', () => {
    beforeEach(() => {
      mockCartContext.cart.items = [{ id: '1' }] as any;
      mockCartContext.cart.totalPrice = 500000;
    });

    it('should show loading state initially', () => {
      render(<WalletCheck walletBalance={1000000} />);
      
      expect(screen.getByText('Validando balance...')).toBeInTheDocument();
    });

    it('should show sufficient funds when balance is enough', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(<WalletCheck walletBalance={1000000} />);
      
      await waitFor(() => {
        expect(screen.getByText('Balance suficiente')).toBeInTheDocument();
        expect(screen.getByText('Puedes proceder con la compra')).toBeInTheDocument();
      });
    });

    it('should show insufficient funds when balance is not enough', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: false,
        errors: ['Fondos insuficientes'],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 300000,
        shortfall: 200000
      });

      render(<WalletCheck walletBalance={300000} onRecharge={mockOnRecharge} />);
      
      await waitFor(() => {
        expect(screen.getByText('Fondos insuficientes')).toBeInTheDocument();
        expect(screen.getByText('Necesitas recargar tu wallet para continuar')).toBeInTheDocument();
        expect(screen.getByText('Faltante: $200.000')).toBeInTheDocument();
      });
    });

    it('should show recharge button when funds are insufficient', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: false,
        errors: ['Fondos insuficientes'],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 300000,
        shortfall: 200000
      });

      render(<WalletCheck walletBalance={300000} onRecharge={mockOnRecharge} />);
      
      await waitFor(() => {
        const rechargeButton = screen.getByText('Recargar Wallet');
        expect(rechargeButton).toBeInTheDocument();
        
        fireEvent.click(rechargeButton);
        expect(mockOnRecharge).toHaveBeenCalledTimes(1);
      });
    });

    it('should display balance comparison correctly', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(<WalletCheck walletBalance={1000000} showDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('$1.000.000')).toBeInTheDocument(); // Current balance
        expect(screen.getByText('$500.000')).toBeInTheDocument(); // Required balance
        expect(screen.getByText('Balance actual')).toBeInTheDocument();
        expect(screen.getByText('Total requerido')).toBeInTheDocument();
      });
    });

    it('should show warnings when present', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: ['Esta es una compra grande'],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(<WalletCheck walletBalance={1000000} showDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Advertencias')).toBeInTheDocument();
        expect(screen.getByText('• Esta es una compra grande')).toBeInTheDocument();
      });
    });

    it('should show errors when present', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: false,
        errors: ['Error de validación'],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(<WalletCheck walletBalance={1000000} showDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Errores de validación')).toBeInTheDocument();
        expect(screen.getByText('• Error de validación')).toBeInTheDocument();
      });
    });

    it('should handle validation errors gracefully', async () => {
      mockCartContext.validateCheckout.mockRejectedValue(new Error('Validation failed'));

      render(<WalletCheck walletBalance={1000000} />);
      
      await waitFor(() => {
        expect(screen.getByText('Fondos insuficientes')).toBeInTheDocument();
      });
    });
  });

  describe('without details', () => {
    beforeEach(() => {
      mockCartContext.cart.items = [{ id: '1' }] as any;
      mockCartContext.cart.totalPrice = 500000;
    });

    it('should not show detailed information when showDetails is false', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(<WalletCheck walletBalance={1000000} showDetails={false} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Balance actual')).not.toBeInTheDocument();
        expect(screen.queryByText('Total requerido')).not.toBeInTheDocument();
      });
    });
  });
});

describe('WalletCheckCompact', () => {
  const mockOnRecharge = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCartContext.cart.items = [];
    mockCartContext.cart.totalPrice = 0;
  });

  describe('when cart is empty', () => {
    it('should not render when cart is empty', () => {
      render(<WalletCheckCompact walletBalance={1000000} />);
      
      expect(screen.queryByText('Balance suficiente')).not.toBeInTheDocument();
    });
  });

  describe('when cart has items', () => {
    beforeEach(() => {
      mockCartContext.cart.items = [{ id: '1' }] as any;
      mockCartContext.cart.totalPrice = 500000;
    });

    it('should show sufficient funds when balance is enough', () => {
      render(<WalletCheckCompact walletBalance={1000000} />);
      
      expect(screen.getByText('Balance suficiente')).toBeInTheDocument();
      expect(screen.getByText('$1.000.000 disponible')).toBeInTheDocument();
    });

    it('should show insufficient funds when balance is not enough', () => {
      render(<WalletCheckCompact walletBalance={300000} onRecharge={mockOnRecharge} />);
      
      expect(screen.getByText('Faltan $200.000')).toBeInTheDocument();
      expect(screen.getByText('$300.000 disponible')).toBeInTheDocument();
    });

    it('should show recharge button when funds are insufficient', () => {
      render(<WalletCheckCompact walletBalance={300000} onRecharge={mockOnRecharge} />);
      
      const rechargeButton = screen.getByText('Recargar');
      expect(rechargeButton).toBeInTheDocument();
      
      fireEvent.click(rechargeButton);
      expect(mockOnRecharge).toHaveBeenCalledTimes(1);
    });

    it('should not show recharge button when onRecharge is not provided', () => {
      render(<WalletCheckCompact walletBalance={300000} />);
      
      expect(screen.queryByText('Recargar')).not.toBeInTheDocument();
    });
  });
});