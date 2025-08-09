import { useState, useEffect } from 'react';

interface WalletData {
  balance: number;
  currency: string;
  lastUpdated: Date;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletData>({
    balance: 5000000, // Demo balance - en producción vendría de la API
    currency: 'COP',
    lastUpdated: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular carga del saldo desde la API
  useEffect(() => {
    const fetchWalletBalance = async () => {
      setIsLoading(true);
      try {
        // En producción, aquí haríamos una llamada a la API
        // const response = await api.getWalletBalance();
        // setWallet(response.data);
        
        // Por ahora, simulamos una respuesta
        await new Promise(resolve => setTimeout(resolve, 500));
        setWallet(prev => ({ ...prev, lastUpdated: new Date() }));
      } catch (err) {
        setError('Error al cargar el saldo de la wallet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletBalance();
  }, []);

  const formatBalance = (amount: number = wallet.balance) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: wallet.currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const hasInsufficientFunds = (requiredAmount: number) => {
    return wallet.balance < requiredAmount;
  };

  const getShortfall = (requiredAmount: number) => {
    return Math.max(0, requiredAmount - wallet.balance);
  };

  const canAfford = (amount: number) => {
    return wallet.balance >= amount;
  };

  const refreshBalance = async () => {
    setIsLoading(true);
    try {
      // Simular actualización del saldo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWallet(prev => ({ ...prev, lastUpdated: new Date() }));
    } catch (err) {
      setError('Error al actualizar el saldo');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    wallet,
    isLoading,
    error,
    formatBalance,
    hasInsufficientFunds,
    getShortfall,
    canAfford,
    refreshBalance
  };
};

export default useWallet;