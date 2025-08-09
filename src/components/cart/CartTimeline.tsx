import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { CartEvent } from '../../types/cart';
import { constants } from '../../config/constants';

interface CartTimelineProps {
  className?: string;
}

interface GroupedEvents {
  [date: string]: CartEvent[];
}

export const CartTimeline: React.FC<CartTimelineProps> = ({ className = '' }) => {
  const { cart } = useCart();

  const groupedEvents = useMemo(() => {
    const groups: GroupedEvents = {};
    
    cart.items.forEach(event => {
      const eventDate = new Date(event.eventDate);
      const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    // Sort events within each date by time
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => {
        const timeA = a.eventTime || '00:00';
        const timeB = b.eventTime || '00:00';
        return timeA.localeCompare(timeB);
      });
    });

    return groups;
  }, [cart.items]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents).sort();
  }, [groupedEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">Cronograma de Eventos</h3>
      </div>

      {sortedDates.map((date, dateIndex) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: dateIndex * 0.1 }}
          className="relative"
        >
          {/* Date Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 mb-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 capitalize">
                {formatDate(date)}
              </h4>
              <span className="text-sm text-gray-500">
                {groupedEvents[date].length} evento{groupedEvents[date].length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Events for this date */}
          <div className="space-y-3 px-4">
            {groupedEvents[date].map((event, eventIndex) => (
              <motion.div
                key={event.cartId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (dateIndex * 0.1) + (eventIndex * 0.05) }}
                className="relative pl-6 border-l-2 border-gray-200 last:border-l-0"
              >
                {/* Timeline dot */}
                <div className="absolute -left-1.5 top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                
                {/* Event Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {/* Event Image */}
                    <div className="w-12 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                        alt={event.stadiumName}
                        className="w-full h-full object-cover"
                      />
                      {/* Teams overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-center gap-0.5">
                          <div className="w-2 h-2 bg-white/20 rounded flex items-center justify-center">
                            <img 
                              src={`${constants.base_path}/${event.homeTeamImage}`}
                              alt={event.homeTeamName}
                              className="w-1.5 h-1.5 object-contain"
                            />
                          </div>
                          <span className="text-white text-xs font-bold">VS</span>
                          <div className="w-2 h-2 bg-white/20 rounded flex items-center justify-center">
                            <img 
                              src={`${constants.base_path}/${event.awayTeamImage}`}
                              alt={event.awayTeamName}
                              className="w-1.5 h-1.5 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm leading-tight line-clamp-1">
                        {event.homeTeamName} vs {event.awayTeamName}
                      </h5>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.eventTime || '12:00'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-20">{event.stadiumName}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {((event.estimatedAttendance || 0) / 1000).toFixed(0)}K
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            event.isConfigured ? 'bg-green-500' : 'bg-orange-500'
                          }`} />
                          <span className={event.isConfigured ? 'text-green-600' : 'text-orange-600'}>
                            {event.isConfigured ? 'Configurado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm text-gray-900">
                        {formatPrice(event.finalPrice || event.estimatedPrice)}
                      </div>
                      {event.selectedMoments && event.selectedMoments.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {event.selectedMoments.length} momento{event.selectedMoments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CartTimeline;