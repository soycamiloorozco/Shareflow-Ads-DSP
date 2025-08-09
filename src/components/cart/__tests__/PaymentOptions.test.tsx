import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentOptions } from '../PaymentOptions';
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
    items: [{ id: '1', isConfigured: true }] as any,
    totalItems: 1,
    totalPrice: 500000,
    totalAudience: 150000,
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

describe('PaymentOptions', () => {
  const mockOnPaymentMethodChange = jest.fn();
  const mockOnRecharge = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should render payment method selection', () => {
      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      expect(screen.getByText('Método de pago')).toBeInTheDocument();
      expect(screen.getByText('Pagar con Wallet')).toBeInTheDocument();
      expect(screen.getByText('Guardar como Borrador')).toBeInTheDocument();
    });

    it('should validate checkout on mount', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      await waitFor(() => {
        expect(mockCartContext.validateCheckout).toHaveBeenCalledWith(1000000);
      });
    });
  });

  describe('wallet payment option', () => {
    it('should show available badge when funds are sufficient', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Disponible')).toBeInTheDocument();
      });
    });

    it('should show insufficient funds badge when balance is low', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: false,
        errors: ['Fondos insuficientes'],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 300000,
        shortfall: 200000
      });

      render(
        <PaymentOptions
          walletBalance={300000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Fondos insuficientes')).toBeInTheDocument();
      });
    });

    it('should disable wallet option when funds are insufficient', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: false,
        errors: ['Fondos insuficientes'],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 300000,
        shortfall: 200000
      });

      render(
        <PaymentOptions
          walletBalance={300000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      await waitFor(() => {
        const walletRadio = screen.getByDisplayValue('wallet');
        expect(walletRadio).toBeDisabled();
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

      render(
        <PaymentOptions
          walletBalance={300000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
          onRecharge={mockOnRecharge}
        />
      );
      
      await waitFor(() => {
        const rechargeButton = screen.getByText('Recargar Wallet');
        expect(rechargeButton).toBeInTheDocument();
        
        fireEvent.click(rechargeButton);
        expect(mockOnRecharge).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('draft payment option', () => {
    it('should always show draft option as available', () => {
      render(
        <PaymentOptions
          walletBalance={300000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="draft"
        />
      );
      
      expect(screen.getByText('Siempre disponible')).toBeInTheDocument();
    });

    it('should show draft benefits when selected', () => {
      render(
        <PaymentOptions
          walletBalance={300000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="draft"
        />
      );
      
      expect(screen.getByText('Guarda tu selección sin compromiso')).toBeInTheDocument();
      expect(screen.getByText('Completa la compra cuando tengas fondos')).toBeInTheDocument();
      expect(screen.getByText('Comparte con otros usuarios')).toBeInTheDocument();
    });
  });

  describe('payment method selection', () => {
    it('should call onPaymentMethodChange when wallet is selected', () => {
      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="draft"
        />
      );
      
      const walletRadio = screen.getByDisplayValue('wallet');
      fireEvent.click(walletRadio);
      
      expect(mockOnPaymentMethodChange).toHaveBeenCalledWith('wallet');
    });

    it('should call onPaymentMethodChange when draft is selected', () => {
      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      const draftRadio = screen.getByDisplayValue('draft');
      fireEvent.click(draftRadio);
      
      expect(mockOnPaymentMethodChange).toHaveBeenCalledWith('draft');
    });
  });

  describe('payment summary', () => {
    it('should show payment summary when validation is available', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 1000000
      });

      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Resumen de pago')).toBeInTheDocument();
        expect(screen.getByText('$500.000')).toBeInTheDocument();
        expect(screen.getByText('Wallet')).toBeInTheDocument();
      });
    });

    it('should show shortfall in summary when funds are insufficient', async () => {
      mockCartContext.validateCheckout.mockResolvedValue({
        isValid: false,
        errors: ['Fondos insuficientes'],
        warnings: [],
        requiredBalance: 500000,
        currentBalance: 300000,
        shortfall: 200000
      });

      render(
        <PaymentOptions
          walletBalance={300000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Faltante:')).toBeInTheDocument();
        expect(screen.getByText('$200.000')).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    it('should show validation loading state', () => {
      mockCartContext.validateCheckout.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      expect(screen.getByText('Validando opciones de pago...')).toBeInTheDocument();
    });
  });

  describe('security notice', () => {
    it('should show security information', () => {
      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      expect(screen.getByText('Transacciones seguras')).toBeInTheDocument();
      expect(screen.getByText(/Todas las transacciones están protegidas/)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle validation errors gracefully', async () => {
      mockCartContext.validateCheckout.mockRejectedValue(new Error('Validation failed'));

      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      // Should not crash and should not show validation loading indefinitely
      await waitFor(() => {
        expect(screen.queryByText('Validando opciones de pago...')).not.toBeInTheDocument();
      });
    });
  });

  describe('empty cart', () => {
    it('should not validate when cart is empty', () => {
      mockCartContext.cart.items = [];
      mockCartContext.cart.totalItems = 0;

      render(
        <PaymentOptions
          walletBalance={1000000}
          onPaymentMethodChange={mockOnPaymentMethodChange}
          selectedMethod="wallet"
        />
      );
      
      expect(mockCartContext.validateCheckout).not.toHaveBeenCalled();
    });
  });
});