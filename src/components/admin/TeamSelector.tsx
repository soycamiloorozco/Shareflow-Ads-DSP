import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';

import { AddTeamModal } from './AddTeamModal';
import { Team } from '../../hooks/useTeams';
import { constants } from '../../config/constants';

interface TeamSelectorProps {
  teams: Team[];
  selectedHomeTeam?: string;
  selectedAwayTeam?: string;
  onHomeTeamSelect: (teamId: string) => void;
  onAwayTeamSelect: (teamId: string) => void;
  onAddTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function TeamSelector({
  teams,
  selectedHomeTeam,
  selectedAwayTeam,
  onHomeTeamSelect,
  onAwayTeamSelect,
  onAddTeam
}: TeamSelectorProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [awaySearchQuery, setAwaySearchQuery] = useState('');
  const [showAllHomeTeams, setShowAllHomeTeams] = useState(false);
  const [showAllAwayTeams, setShowAllAwayTeams] = useState(false);

  // Filtrar equipos locales basado en la búsqueda
  const filteredHomeTeams = useMemo(() => {
    return teams.filter(
      team => team.name.toLowerCase().includes(homeSearchQuery.toLowerCase()) || 
              team.city.toLowerCase().includes(homeSearchQuery.toLowerCase())
    );
  }, [teams, homeSearchQuery]);

  // Filtrar equipos visitantes basado en la búsqueda
  const filteredAwayTeams = useMemo(() => {
    return teams.filter(
      team => team.name.toLowerCase().includes(awaySearchQuery.toLowerCase()) || 
              team.city.toLowerCase().includes(awaySearchQuery.toLowerCase())
    );
  }, [teams, awaySearchQuery]);

  // Limitar la visualización a 2 equipos inicialmente
  const displayedHomeTeams = showAllHomeTeams 
    ? filteredHomeTeams 
    : filteredHomeTeams.slice(0, 2);

  const displayedAwayTeams = showAllAwayTeams 
    ? filteredAwayTeams 
    : filteredAwayTeams.slice(0, 2);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Equipo Local</h3>
          <div className="flex items-center px-4 py-2 border rounded-xl mb-4">
            <Search className="w-5 h-5 text-neutral-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar equipo local..."
              className="flex-1 outline-none"
              value={homeSearchQuery}
              onChange={(e) => setHomeSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayedHomeTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => onHomeTeamSelect(team.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${selectedHomeTeam === team.id
                    ? 'border-primary bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <img
                      src={`${constants.base_path}/${team.logo}`}
                      alt={team.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">{team.name}</h4>
                    <p className="text-sm text-neutral-600">{team.city}</p>
                  </div>
                </div>
              </button>
            ))}
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-4 border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary hover:bg-primary-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-neutral-400" />
                </div>
                <span className="text-sm text-neutral-600">Añadir Equipo</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Equipo Visitante</h3>
          <div className="flex items-center px-4 py-2 border rounded-xl mb-4">
            <Search className="w-5 h-5 text-neutral-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar equipo visitante..."
              className="flex-1 outline-none"
              value={awaySearchQuery}
              onChange={(e) => setAwaySearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayedAwayTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => onAwayTeamSelect(team.id)}
                disabled={selectedHomeTeam === team.id}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${selectedAwayTeam === team.id
                    ? 'border-primary bg-primary-50'
                    : selectedHomeTeam === team.id
                    ? 'opacity-50 cursor-not-allowed'
                    : 'border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <img
                     src={`${constants.base_path}/${team.logo}`}
                      alt={team.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">{team.name}</h4>
                    <p className="text-sm text-neutral-600">{team.city}</p>
                  </div>
                </div>
              </button>
            ))}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-4 border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary hover:bg-primary-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-neutral-400" />
                </div>
                <span className="text-sm text-neutral-600">Añadir Equipo</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddTeamModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={(teamData) => {
              console.log({teamData})
              onAddTeam(teamData);
              setIsAddModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}