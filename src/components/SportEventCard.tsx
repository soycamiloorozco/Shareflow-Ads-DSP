import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { SportEvent } from '../types';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Card } from './Card';

interface SportEventCardProps {
  event: SportEvent;
  onClick: (event: SportEvent) => void;
}

export function SportEventCard({ event, onClick }: SportEventCardProps) {
  const navigate = useNavigate();
  const eventDate = new Date(event.date).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleClick = () => {
    navigate(`/event/${event.id}`);
    onClick(event);
  };

  return (
    <Card className="flex flex-col gap-3">
      <Card.Body className="space-y-4">
        <div className="flex justify-center items-center gap-[11px]">
          <div className="flex flex-col items-center gap-1">
            <div className="w-[55px] h-[55px] relative bg-green-50 rounded-2xl">
              <img 
                src={`https://api.shareflow.me/teams/${event.homeTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={event.homeTeam}
                className="w-[34px] h-[34px] absolute left-3 top-[11px]"
              />
            </div>
            <span className="text-team">
              {event.homeTeam}
            </span>
          </div>

          <div className="w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center">
            <span className="text-vs">vs</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-[55px] h-[55px] relative bg-error-50 rounded-2xl">
              <img 
                src={`https://api.shareflow.me/teams/${event.awayTeam.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={event.awayTeam}
                className="w-8 h-8 absolute left-[11px] top-3"
              />
            </div>
            <span className="text-team">
              {event.awayTeam}
            </span>
          </div>
        </div>

        <div className="w-full h-[77px] relative overflow-hidden rounded-lg">
          <img 
            src={`https://api.shareflow.me/stadiums/${event.stadium.toLowerCase().replace(/\s+/g, '-')}.jpg`}
            alt={event.stadium}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <MapPin size={18} className="text-neutral-400" />
            <span className="text-location">Medellín</span>
          </div>

          <div className="flex items-start gap-1">
            <div className="w-[18px] h-[18px] relative overflow-hidden">
              <img 
                src={`https://api.shareflow.me/stadiums/icon-${event.stadium.toLowerCase().replace(/\s+/g, '-')}.svg`}
                alt="Stadium icon"
                className="w-full h-full"
              />
            </div>
            <span className="text-heading-4">{event.stadium}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar size={18} className="text-neutral-400" />
            <span className="text-location">{eventDate}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock size={18} className="text-neutral-400" />
            <span className="text-location">8:20 PM</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-[18px] h-[18px] relative">
              <div className="w-[14.4px] h-[14.4px] absolute left-[1.8px] top-[1.8px] border-[1.5px] border-primary rounded-sm" />
            </div>
            <span className="text-xs text-neutral-600">Desde</span>
            <span className="text-price-lg">$2,252.800 COP</span>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          icon={ArrowRight}
          onClick={handleClick}
        >
          Quiero este partido
        </Button>
      </Card.Body>
    </Card>
  );
}