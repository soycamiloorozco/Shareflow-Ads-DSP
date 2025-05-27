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

interface StadiumPhoto {
  id: string;
  photoPath: string;
}

interface Stadium {
  id: string;
  name: string;
  city: string;
  location: string;
  capacity: number;
  photos: StadiumPhoto[];
}

interface PurchaseDetail {
  id: string;
  momentId: string;
  minutes: string;
}

export interface PurchasedMoment {
  id: string;
  sportEventId: string;
  filePath: string;
  createdAt: string;
  eventDate: string;
  paymentId: string;
  eventTime: string;
  homeTeam: string;
  awayTeam: string;
  rejectionCategory: string;
  rejectionReason: string;
  stadium: Stadium;
  status: number;
  type: 'image' | 'video';
  purchaseDetails: PurchaseDetail[];
}

export function useMomentPurchases() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchasedMoments, setPurchasedMoments] = useState<PurchasedMoment[]>([]);

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

  const getPurchaseMoments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request.get('/MomentPurchases/purchased-moments');
      setPurchasedMoments(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const approvePurchaseMoments = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request.post(`MomentPurchases/${id}/approve`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectPurchaseMoments = async (id: string, data: {
    rejectionCategory: string;
    rejectionReason: string
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request.post(`MomentPurchases/${id}/reject`, data);
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
    approvePurchaseMoments,
    rejectPurchaseMoments,
    getPurchaseMoments,
    purchasedMoments,
    isLoading,
    error
  };
} 