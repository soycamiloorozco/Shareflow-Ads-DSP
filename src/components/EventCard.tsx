import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { SportEvent } from '../types';
import { Button } from './Button';
import { Card } from './Card';

interface EventCardProps {
  event: SportEvent;
  onClick: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card>
        <div className="relative aspect-video">
          <img
            src={`https://api.shareflow.me/stadiums/${event.stadium.toLowerCase().replace(/\s+/g, '-')}.jpg`}
            alt={event.stadium}
            className="w-full h-full object-cover rounded-t-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between mb-2">
              <img
                src={`https://api.shareflow.me/teams/${event.homeTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={event.homeTeam}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-white">VS</span>
              <img
                src={`https://api.shareflow.me/teams/${event.awayTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={event.awayTeam}
                className="w-10 h-10"
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">
                {event.homeTeam} vs {event.awayTeam}
              </h3>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(event.date).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Card.Body>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center">
              <img
                src={`https://api.shareflow.me/stadiums/icon-${event.stadium.toLowerCase().replace(/\s+/g, '-')}.svg`}
                alt="Stadium icon"
                className="w-6 h-6"
              />
            </div>
            <div>
              <h4 className="font-medium">{event.stadium}</h4>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Users className="w-4 h-4" />
                <span>45.000 espectadores</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Desde</p>
              <p className="text-lg font-semibold">$2,252,800 COP</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={ChevronRight}
            >
              Ver momentos
            </Button>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}