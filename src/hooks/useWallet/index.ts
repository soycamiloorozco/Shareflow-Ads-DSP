import { useState } from 'react';
import { DepositPayload, DepositResponse, UseWalletReturn, TransactionsResponse} from './types';
import request  from '../../helpers/request';

export const useWallet = (): UseWalletReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deposit = async (payload: DepositPayload): Promise<DepositResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request.post<DepositResponse>('/wallet/deposit', payload);
      return response.data;
    } catch (err) {
        console.log(err, "ERRR PAY")
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el depósito';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };
    
    
    const transactions = async (): Promise<TransactionsResponse> => {
        setIsLoading(true);
        setError(null);

        try {
        const response = await request.get<TransactionsResponse>('/wallet/transactions');
        return response.data;
        } catch (err) {
            console.log(err, "ERRR PAY")
        const errorMessage = err instanceof Error ? err.message : 'Error al procesar el depósito';
        setError(errorMessage);
        return {
            transactions: [],
            totalTransactions: 0,
            currentPage: 1,
            totalPages: 1
        };
        } finally {
        setIsLoading(false);
        }
    };


    const getBalance = async (): Promise<{balance: number}> => {
        setIsLoading(true);
        setError(null);

        try {
        const response = await request.get<{balance: number}>('/wallet/balance');
        return response.data;
        } catch (err) {
            console.log(err, "ERRR PAY")
        const errorMessage = err instanceof Error ? err.message : 'Error al procesar el depósito';
        setError(errorMessage);
        return {
            balance: 0,
        };
        } finally {
        setIsLoading(false);
        }
    };
    
  return {
    deposit,
    transactions,
    getBalance,
    isLoading,
    error
  };
}; 