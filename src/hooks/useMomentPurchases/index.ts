import { useState } from 'react';
import request from '../../helpers/request';

interface SelectedMoment {
  momentId: string;
  minutes: string;
}

interface PurchaseData {
  sportEventId: string;
  PurchaseDetails: SelectedMoment[];
  FilePath: string;
}

export function useMomentPurchases() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseMoments = async (data: PurchaseData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request.post('/MomentPurchases', data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    purchaseMoments,
    isLoading,
    error
  };
} 