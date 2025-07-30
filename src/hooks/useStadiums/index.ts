import { useEffect, useState } from 'react';
import request  from '../../helpers/request';

export interface Stadium {
    id: string;
    name: string;
    city: string;
    capacity: number;
    photos: string[];
    location: string;
    createdAt: string;
    updatedAt: string;
}

interface UseDataReturn {
  stadiums: Stadium[];
  loading: boolean;
  error: string | null;
  listStadiums: () => Promise<void>;
  createStadiums: (data: Omit<Stadium, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function useStadiums(): UseDataReturn {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listStadiums = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request.get('/stadiums');
      setStadiums(response.data);
    } catch (err) {
      setError('Error al cargar los equipos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createStadiums = async (data: Omit<Stadium, 'id' | 'createdAt' | 'updatedAt'| 'colors'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await request.post('/stadiums', data);
      setStadiums(prev => [...prev, response.data]);
    } catch (err) {
      setError('Error al crear el equipo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listStadiums();
  }, []);

  return {
    stadiums,
    loading,
    error,
    listStadiums,
    createStadiums
  };
}
