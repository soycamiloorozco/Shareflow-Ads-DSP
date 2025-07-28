import { useState } from 'react';
import request from '../../helpers/request';

export interface Bonus {
  id: number;
  name: string;
  description: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  status: 'Active' | 'Inactive' | 'Expired';
  startDate: string;
  endDate: string;
  targetUsers: 'All' | 'New' | 'Returning' | 'VIP';
  minRecharge: number;
  usageCount: number;
  termsAndConditions: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface UseBonusReturn {
  bonus: Bonus[];
  isLoading: boolean;
  error: string | null;
  createBonus: (bonusData: Omit<Bonus, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<void>;
  updateBonus: (id: number, bonusData: Partial<Bonus>) => Promise<void>;
  deleteBonus: (id: number) => Promise<void>;
  deactivateBonus: (id: number) => Promise<void>;
  activateBonus: (id: number) => Promise<void>;
  getActiveBonus: () => Promise<Bonus>;
  getBonus: () => Promise<void>;
  handleDuplicateCampaign: (id: number) => Promise<void>;
}

export const useBonus = (): UseBonusReturn => {
  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createBonus = async (bonusData: Omit<Bonus, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {

    try {
        setIsLoading(true);
      const response = await request.post('/bonus', bonusData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la pantalla');
      throw err;
    } finally {
      setIsLoading(false);
    }

 
  };

  const updateBonus = async (id: number, bonusData: Partial<Bonus>) => {
    
    try {
        setIsLoading(true);
      const response = await request.put(`/bonus/${id}`, bonusData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la pantalla');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBonus = async (id: number) => {
    try {
      setIsLoading(true);
      await request.delete(`/bonus/${id}`);
      await getBonus(); // Recargar la lista después de eliminar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el bono');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateBonus = async (id: number) => {
    try {
      setIsLoading(true);
      await request.post(`/bonus/${id}/deactivate`);
      await getBonus(); // Recargar la lista después de eliminar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el bono');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const activateBonus = async (id: number) => {
    try {
      setIsLoading(true);
      await request.post(`/bonus/${id}/activate`);
      await getBonus(); // Recargar la lista después de eliminar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el bono');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBonus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await request.get('/bonus');
      setBonus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener el bono');
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveBonus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await request.get('/bonus/active');
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener el bono');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateCampaign = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await request.post(`/bonus/${id}/duplicate`);
      await getBonus(); // Recargar la lista después de duplicar
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al duplicar la campaña');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bonus,
    isLoading,
    error,
    createBonus,
    updateBonus,
    deleteBonus,
    getBonus,
    handleDuplicateCampaign,
    deactivateBonus,
    activateBonus,
    getActiveBonus
  };
}; 