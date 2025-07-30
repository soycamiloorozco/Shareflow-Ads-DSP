import { useEffect, useState } from 'react';
import request  from '../../helpers/request';
import { Trash2 } from 'lucide-react';


export interface SportEvents {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    stadiumId: string;
    eventDate: string;
    eventTime: string;
    estimatedAttendance: number;
    estimatedAttendanceTv: number;
    maxMoments: number;
    broadcastChannels: string;
    createdAt: string;
    updatedAt: string;
    homeTeamName?: string;
    awayTeamName?: string;
    homeTeamImage?: string;
    awayTeamImage?: string;
    stadiumName: string;
    status?: 'Inactive' | 'Active' | 'Eliminated';
    momentPrices: {
        moment: string;
        price: number;
    }[]
    moments: {
        moment: string;
        price: number;
    }[],
  stadiumPhotos: string[]
}

interface useSportEventsReturn {
  sportEvents: SportEvents[];
  event?: SportEvents;
  loading: boolean;
  error: string | null;
  listSportEvent: () => Promise<void>;
  sportEventById: (id: string) => Promise<void>;
  createSportEvent: (data: Omit<SportEvents, 'id' | 'createdAt' | 'updatedAt' | 'moments' | 'stadiumPhotos'>) => Promise<void>;
  updateEventStatus: (id: string, status: 'Active' | 'Inactive' | 'Eliminated') => Promise<void>;
  updateEventMoments: (id: string, data: { 
    maxMoments: number, 
    momentPrices: { moment: number, price: number }[],
    estimatedAttendance: number,
    estimatedAttendanceTv: number 
  }) => Promise<void>;
}

export function useSportEvents(
  { id }: { id?: string } = {}
): useSportEventsReturn {
  const [sportEvents, setSportEvents] = useState<SportEvents[]>([]);
  const [event, setEvent] = useState<SportEvents>();
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

  const sportEventById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await request.get(`/SportEvents/${id}`);
      setEvent(response.data);
    } catch (err) {
      setError('Error al cargar los equipos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSportEvent = async (data: Omit<SportEvents, 'id' | 'createdAt' | 'updatedAt' | 'moments'| 'stadiumPhotos'>) => {
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

  const updateEventStatus = async (id: string, status: 'Active' | 'Inactive' | 'Eliminated') => {
    try {
      setLoading(true);
      setError(null);
      const statusMap = {
        'Active': 1,
        'Inactive': 0,
        'Eliminated': 2
      };
      await request.patch(`/SportEvents/${id}/status`, {
        status: statusMap[status]
      });
      await listSportEvent(); // Recargar la lista para reflejar los cambios
    } catch (err) {
      setError('Error al actualizar el estado del evento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateEventMoments = async (id: string, data: { 
    maxMoments: number, 
    momentPrices: { moment: number, price: number }[],
    estimatedAttendance: number,
    estimatedAttendanceTv: number 
  }) => {
    try {
      setLoading(true);
      setError(null);
      await request.patch(`/SportEvents/${id}/moments`, data);
      await listSportEvent(); // Recargar la lista para reflejar los cambios
    } catch (err) {
      setError('Error al actualizar los momentos del evento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
       sportEventById(id);
    } else {
      listSportEvent();
    }
    
  }, []);

  return {
    sportEvents,
    loading,
    error,
    listSportEvent,
    createSportEvent,
    sportEventById,
    event,
    updateEventStatus,
    updateEventMoments
  };
}
