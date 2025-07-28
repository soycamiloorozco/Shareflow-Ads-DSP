import { useEffect, useState } from 'react';
import request  from '../../helpers/request';

export interface Team {
    id: string;
    name: string;
    city: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    createdAt: string;
    updatedAt: string;
    colors: {
        primary: string;
        secondary: string;
    }
}

interface UseTeamsReturn {
  teams: Team[];
  loading: boolean;
  error: string | null;
  listTeams: () => Promise<void>;
  createTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'colors'>) => Promise<void>;
}

export function useTeams(): UseTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request.get('/teams');
      setTeams(response.data);
    } catch (err) {
      setError('Error al cargar los equipos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'| 'colors'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await request.post('/teams', teamData);
      setTeams(prev => [...prev, response.data]);
    } catch (err) {
      setError('Error al crear el equipo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    listTeams,
    createTeam
  };
}
