import { useState, useCallback } from 'react';
import { CheckoutResult } from '../types/cart';

interface TransactionOptions {
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

interface TransactionState {
  isProcessing: boolean;
  currentAttempt: number;
  error: string | null;
  result: CheckoutResult | null;
}

export const useTransactionProcessing = (options: TransactionOptions = {}) => {
  const {
    retryAttempts = 3,
    retryDelay = 1000,
    timeout = 30000
  } = options;

  const [state, setState] = useState<TransactionState>({
    isProcessing: false,
    currentAttempt: 0,
    error: null,
    result: null
  });

  // Process wallet payment
  const processWalletPayment = useCallback(async (
    cartTotal: number,
    walletBalance: number,
    cartItems: any[]
  ): Promise<CheckoutResult> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null, currentAttempt: 1 }));

    try {
      // Validate sufficient funds
      if (walletBalance < cartTotal) {
        throw new Error(`Fondos insuficientes. Faltan ${(cartTotal - walletBalance).toLocaleString()} COP`);
      }

      // Simulate API call with timeout
      const result = await Promise.race([
        simulatePaymentProcessing(cartTotal, cartItems),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La transacción tardó demasiado')), timeout)
        )
      ]);

      setState(prev => ({ ...prev, isProcessing: false, result }));
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el pago';
      setState(prev => ({ ...prev, isProcessing: false, error: errorMessage }));
      throw error;
    }
  }, [timeout]);

  // Process draft saving
  const processDraftSaving = useCallback(async (
    draftName: string,
    cartItems: any[],
    cartTotal: number
  ): Promise<CheckoutResult> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null, currentAttempt: 1 }));

    try {
      const result = await simulateDraftSaving(draftName, cartItems, cartTotal);
      setState(prev => ({ ...prev, isProcessing: false, result }));
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar borrador';
      setState(prev => ({ ...prev, isProcessing: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Retry failed transaction
  const retryTransaction = useCallback(async (
    originalFunction: () => Promise<CheckoutResult>
  ): Promise<CheckoutResult> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      setState(prev => ({ ...prev, currentAttempt: attempt, error: null }));

      try {
        const result = await originalFunction();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        
        if (attempt < retryAttempts) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    // All attempts failed
    setState(prev => ({ 
      ...prev, 
      isProcessing: false, 
      error: `Falló después de ${retryAttempts} intentos: ${lastError?.message}` 
    }));
    
    throw lastError;
  }, [retryAttempts, retryDelay]);

  // Validate transaction before processing
  const validateTransaction = useCallback((
    cartItems: any[],
    cartTotal: number,
    paymentMethod: 'wallet' | 'draft',
    walletBalance?: number
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Basic validations
    if (!cartItems || cartItems.length === 0) {
      errors.push('El carrito está vacío');
    }

    if (cartTotal <= 0) {
      errors.push('El total del carrito debe ser mayor a cero');
    }

    // Check for unconfigured items
    const unconfiguredItems = cartItems.filter(item => !item.isConfigured);
    if (unconfiguredItems.length > 0) {
      errors.push(`${unconfiguredItems.length} evento(s) sin configurar`);
    }

    // Wallet-specific validations
    if (paymentMethod === 'wallet') {
      if (walletBalance === undefined) {
        errors.push('Balance de wallet no disponible');
      } else if (walletBalance < cartTotal) {
        errors.push('Fondos insuficientes en wallet');
      }
    }

    // Business rules
    if (cartTotal > 50000000) { // 50M COP limit
      errors.push('El monto excede el límite máximo por transacción');
    }

    if (cartItems.length > 20) {
      errors.push('Demasiados eventos en una sola transacción');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Get transaction receipt
  const generateReceipt = useCallback((result: CheckoutResult, cartItems: any[]) => {
    if (!result.success) return null;

    return {
      transactionId: result.transactionId,
      draftId: result.draftId,
      type: result.type,
      timestamp: result.timestamp || new Date(),
      items: cartItems.map(item => ({
        eventName: `${item.homeTeamName} vs ${item.awayTeamName}`,
        stadium: item.stadiumName,
        date: item.eventDate,
        moments: item.selectedMoments?.length || 0,
        price: item.finalPrice || item.estimatedPrice
      })),
      summary: {
        totalEvents: cartItems.length,
        totalMoments: cartItems.reduce((sum, item) => 
          sum + (item.selectedMoments?.reduce((momentSum: number, moment: any) => 
            momentSum + moment.quantity, 0) || 0), 0),
        totalAudience: cartItems.reduce((sum, item) => 
          sum + (item.estimatedAttendance || 0) + (item.estimatedAttendanceTv || 0), 0),
        totalPrice: cartItems.reduce((sum, item) => 
          sum + (item.finalPrice || item.estimatedPrice), 0)
      }
    };
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setState({
      isProcessing: false,
      currentAttempt: 0,
      error: null,
      result: null
    });
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    processWalletPayment,
    processDraftSaving,
    retryTransaction,
    validateTransaction,
    generateReceipt,
    resetState
  };
};

// Simulate payment processing (replace with actual API calls)
async function simulatePaymentProcessing(
  amount: number, 
  items: any[]
): Promise<CheckoutResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

  // Simulate occasional failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Error de conexión con el procesador de pagos');
  }

  // Generate transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return {
    success: true,
    transactionId,
    type: 'purchase',
    message: 'Pago procesado exitosamente',
    timestamp: new Date()
  };
}

// Simulate draft saving
async function simulateDraftSaving(
  name: string,
  items: any[],
  total: number
): Promise<CheckoutResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate draft ID
  const draftId = `DRAFT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return {
    success: true,
    draftId,
    type: 'draft',
    message: 'Borrador guardado exitosamente',
    timestamp: new Date()
  };
}

export default useTransactionProcessing;