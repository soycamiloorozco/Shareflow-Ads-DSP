import { useEffect, useState } from 'react';
import request  from '../../helpers/request';

export interface SportEvents {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    stadiumId: string;
    eventDate: string;
    eventTime: string;
    estimatedAttendance: number;
    maxMoments: number;
    broadcastChannels: string;
    createdAt: string;
    updatedAt: string;
    homeTeamName?: string;
    awayTeamName?: string;
    homeTeamImage?: string;
    homeAwayImage?: string;
    stadiumName: string;
    momentPrices: {
        moment: string;
        price: number;
    }[]
  moments: {
        moment: string;
        price: number;
    }[]
}

interface useSportEventsReturn {
  sportEvents: SportEvents[];
  loading: boolean;
  error: string | null;
  listSportEvent: () => Promise<void>;
  createSportEvent: (data: Omit<SportEvents, 'id' | 'createdAt' | 'updatedAt' | 'moments'>) => Promise<void>;
}

export function useSportEvents(): useSportEventsReturn {
  const [sportEvents, setSportEvents] = useState<SportEvents[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listSportEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request.get('/SportEvents');
      setSportEvents(response.data);
    } catch (err) {
      setError('Error al cargar los equipos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSportEvent = async (data: Omit<SportEvents, 'id' | 'createdAt' | 'updatedAt' | 'moments'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await request.post('/SportEvents', data);
      setSportEvents(prev => [...prev, response.data]);
    } catch (err) {
      setError('Error al crear el equipo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listSportEvent();
  }, []);

  return {
    sportEvents,
    loading,
    error,
    listSportEvent,
    createSportEvent
  };
}
