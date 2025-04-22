import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Team } from '../../types';
import { Button } from '../Button';
import { Card } from '../Card';
import { AddTeamModal } from './AddTeamModal';

interface TeamSelectorProps {
  teams: Team[];
  selectedHomeTeam?: string;
  selectedAwayTeam?: string;
  onHomeTeamSelect: (teamId: string) => void;
  onAwayTeamSelect: (teamId: string) => void;
  onAddTeam: (teamData: { name: string; city: string; logo: string }) => void;
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

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Equipo Local</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {teams.map((team) => (
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
                      src={team.logo}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {teams.map((team) => (
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
                      src={team.logo}
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
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddTeamModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={(teamData) => {
              onAddTeam(teamData);
              setIsAddModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}