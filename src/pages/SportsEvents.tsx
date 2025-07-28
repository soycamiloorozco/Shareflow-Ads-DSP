import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Calendar, MapPin, Clock, Users,
  ChevronRight, Star, ArrowRight, Target,
  Heart, X, Info, Zap, Tv, BarChart3, TrendingUp,
  Trophy, Grid3X3, List, Eye
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import Select from 'react-select';
import { useSportEvents } from '../hooks/useSportEvents';
import { constants } from '../config/constants';
import estadioImage from '../assets/estadio.png';

// Memoized Event Card Component for Better Performance
const EventCard = React.memo(({ event, index, onClick }: {
  event: any;
  index: number;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const eventData = useMemo(() => {
    const basePrice = event.moments[0]?.price || 2250000;
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    
    return {
      basePrice,
      isPopular: totalAudience > 100000,
      priceDisplay: `$${(basePrice / 1000000).toFixed(1)}M`
    };
  }, [event]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleCardClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="cursor-pointer group relative"
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        animationFillMode: 'both'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Enhanced Card with Modern Design */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full transform hover:-translate-y-1">
        
        {/* Main Image - Consistent Aspect Ratio */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
            alt={event.stadiumName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Essential badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2">
            {eventData.isPopular && (
              <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-orange-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">Popular</span>
              </span>
            )}
            <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
              Fútbol
            </span>
          </div>
          
          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md touch-manipulation min-h-[44px] min-w-[44px]"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Teams VS section */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <img 
                    src={`${constants.base_path}/${event.homeTeamImage}`}
                    alt={event.homeTeamName}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                </div>
                <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">
                  {event.homeTeamName}
                </span>
              </div>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-white">VS</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">
                  {event.awayTeamName}
                </span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <img 
                    src={`${constants.base_path}/${event.awayTeamImage}`}
                    alt={event.awayTeamName}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Content section */}
        <div className="p-3 sm:p-4 lg:p-5">
          {/* Title and rating */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2"
                  style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
                {event.homeTeamName} vs {event.awayTeamName}
              </h3>
            </div>
            
            {/* Rating placeholder */}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">4.8</span>
            </div>
          </div>

          {/* Event details */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                {new Date(event.eventDate).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">{event.eventTime || '8:00 PM'}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 line-clamp-1">{event.stadiumName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                {event.estimatedAttendance?.toLocaleString() || 'N/A'} espectadores
              </span>
            </div>
          </div>



          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-900"
                      style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                  {eventData.priceDisplay}
                </span>
                <span className="text-sm text-gray-600">COP</span>
              </div>
              <div className="text-xs text-gray-500">desde / momento</div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#353FEF] hover:bg-[#2A32C5] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
                aria-label={`Ver detalles de ${event.homeTeamName} vs ${event.awayTeamName}`}
              >
                <span>Ver detalles</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

EventCard.displayName = 'EventCard';

// Compact Event List Item Component
const EventListItem = React.memo(({ event, onClick }: {
  event: any;
  onClick: () => void;
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const eventData = useMemo(() => {
    const basePrice = event.moments[0]?.price || 2250000;
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    
    return {
      basePrice,
      isPopular: totalAudience > 100000,
      priceDisplay: `$${(basePrice / 1000000).toFixed(1)}M`,
      audienceDisplay: totalAudience > 0 ? `${(totalAudience / 1000).toFixed(0)}K` : 'N/A'
    };
  }, [event]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Event Image */}
        <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
          <img 
            src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
            alt={event.stadiumName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Teams overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                <img 
                  src={`${constants.base_path}/${event.homeTeamImage}`}
                  alt={event.homeTeamName}
                  className="w-3 h-3 object-contain"
                />
              </div>
              <span className="text-white text-xs font-bold">VS</span>
              <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                <img 
                  src={`${constants.base_path}/${event.awayTeamImage}`}
                  alt={event.awayTeamName}
                  className="w-3 h-3 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {event.homeTeamName} vs {event.awayTeamName}
            </h3>
            {eventData.isPopular && (
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                Popular
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(event.eventDate).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.eventTime || '8:00 PM'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.stadiumName}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.estimatedAttendance?.toLocaleString() || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              4.8
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {eventData.audienceDisplay} audiencia
            </span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="text-right flex-shrink-0 flex items-center gap-3">
          <div>
            <p className="font-bold text-lg text-gray-900">
              {eventData.priceDisplay}
            </p>
            <p className="text-xs text-gray-500">desde / momento</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-300 transition-colors"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
                }`} 
              />
            </button>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
});

EventListItem.displayName = 'EventListItem';

// Compact Mobile Event Card Component
const MobileEventCard = React.memo(({ event, index, onClick }: {
  event: any;
  index: number;
  onClick: () => void;
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const eventData = useMemo(() => {
    const basePrice = event.moments[0]?.price || 2250000;
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    
    return {
      basePrice,
      isPopular: totalAudience > 100000,
      priceDisplay: `$${(basePrice / 1000000).toFixed(1)}M`,
      audienceDisplay: totalAudience > 0 ? `${(totalAudience / 1000).toFixed(0)}K` : 'N/A'
    };
  }, [event]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);



  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      {/* Compact Mobile Card */}
      <div className="relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
        
        {/* Compact Image with overlay info */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
            alt={event.stadiumName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {eventData.isPopular && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                Popular
              </span>
            )}
            <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              Fútbol
            </span>
          </div>
          
          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Teams VS section - compact */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded flex items-center justify-center">
                  <img 
                    src={`${constants.base_path}/${event.homeTeamImage}`}
                    alt={event.homeTeamName}
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <span className="text-white text-xs font-medium hidden xs:block">
                  {event.homeTeamName.split(' ')[0]}
                </span>
              </div>
              
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">VS</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-medium hidden xs:block">
                  {event.awayTeamName.split(' ')[0]}
                </span>
                <div className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded flex items-center justify-center">
                  <img 
                    src={`${constants.base_path}/${event.awayTeamImage}`}
                    alt={event.awayTeamName}
                    className="w-4 h-4 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Content */}
        <div className="p-3">
          {/* Title and rating */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
                {event.homeTeamName} vs {event.awayTeamName}
              </h3>
            </div>
            <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium">4.8</span>
            </div>
          </div>

          {/* Compact Event details */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(event.eventDate).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.eventTime || '8:00 PM'}
            </span>
          </div>

          {/* Stadium and audience - very compact */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {event.stadiumName.split(' ').slice(0, 2).join(' ')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {eventData.audienceDisplay}
            </span>
          </div>

          {/* Price and CTA - compact */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-900 text-base">
                  {eventData.priceDisplay}
                </span>
                <span className="text-xs text-gray-600">COP</span>
              </div>
              <div className="text-xs text-gray-500">desde / momento</div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-2">
              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="px-3 py-1.5 bg-[#353FEF] hover:bg-[#2A32C5] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1 hover:scale-105 active:scale-95 shadow-sm"
                aria-label={`Ver detalles de ${event.homeTeamName} vs ${event.awayTeamName}`}
              >
                <span>Ver</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MobileEventCard.displayName = 'MobileEventCard';

// Mobile Sports Events Interface
const MobileSportsInterface = React.memo(({ 
  events, 
  onEventClick, 
  searchQuery, 
  onSearchChange,
  viewMode,
  onViewModeChange,
  filteredCount 
}: {
  events: any[];
  onEventClick: (eventId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filteredCount: number;
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipos, estadios..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#353FEF]/20 focus:bg-white transition-all"
            />
          </div>

          {/* View Mode and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-3 h-3" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-3 h-3" />
                <span>Lista</span>
              </button>
            </div>

            <div className="text-xs text-gray-500">
              {filteredCount} evento{filteredCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {events.map((event, index) => (
              <MobileEventCard
                key={event.id}
                event={event}
                index={index}
                onClick={() => onEventClick(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <EventListItem
                key={event.id}
                event={event}
                onClick={() => onEventClick(event.id)}
              />
            ))}
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
            <p className="text-gray-600 text-sm">
              Intenta con otros filtros o vuelve más tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

MobileSportsInterface.displayName = 'MobileSportsInterface';

export function SportsEvents() {
  const navigate = useNavigate();
  const { sportEvents } = useSportEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedStadium, setSelectedStadium] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredEvents = useMemo(() => {
    return sportEvents.filter(event => {
      const matchesSearch = 
        event.homeTeamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.awayTeamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.stadiumName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = !selectedTeam || 
        event.homeTeamName === selectedTeam || 
        event.awayTeamName === selectedTeam;
      const matchesStadium = !selectedStadium || event.stadiumName === selectedStadium;
      const matchesStatus = event.status === 'Active';
      return matchesSearch && matchesTeam && matchesStadium && matchesStatus;
    });
  }, [sportEvents, searchQuery, selectedTeam, selectedStadium]);

  const handleEventClick = useCallback((eventId: string) => {
    navigate(`/event/${eventId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 md:pb-0">
      {/* Mobile Interface (< lg breakpoint) */}
      <div className="lg:hidden">
        <MobileSportsInterface
          events={filteredEvents}
          onEventClick={handleEventClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredEvents.length}
        />
      </div>

      {/* Desktop Interface (>= lg breakpoint) */}
      <div className="hidden lg:block">
        {/* Modern Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={estadioImage}
              alt="Stadium at night"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-neutral-50" />
          </div>
          
          <div className="relative h-full flex flex-col justify-center">
            <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-0"
                  >
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                      Eventos deportivos
                    </h1>
                    <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed">
                      Conecta con millones de aficionados en los momentos más emocionantes del deporte
                    </p>
                  </motion.div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-[#353FEF] hover:bg-[#2A32C5] h-12 px-6 text-base shadow-lg"
                      onClick={() => setIsInfoModalOpen(true)}
                    >
                      ¿Cómo funciona?
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Modern Search & Filters */}
      <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="max-w-7xl mx-auto -mt-8 relative z-10">
          <Card className="shadow-xl border-0 bg-white rounded-xl sm:rounded-2xl">
            <Card.Body className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search */}
                <div className="md:col-span-5">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar equipos, estadios..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:border-transparent text-base"
                    />
                  </div>
                </div>

                {/* Team Filter */}
                <div className="md:col-span-3">
                  <Select
                    placeholder="Equipo"
                    options={[
                      { value: 'Atlético Nacional', label: 'Atlético Nacional' },
                      { value: 'Independiente Medellín', label: 'Independiente Medellín' },
                      { value: 'Millonarios', label: 'Millonarios' },
                      { value: 'América de Cali', label: 'América de Cali' }
                    ]}
                    onChange={(option) => setSelectedTeam(option?.value || null)}
                    isClearable
                    className="text-base"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '12px',
                        borderColor: '#e5e7eb',
                        '&:hover': { borderColor: '#d1d5db' }
                      })
                    }}
                  />
                </div>

                {/* Stadium Filter */}
                <div className="md:col-span-3">
                  <Select
                    placeholder="Estadio"
                    options={[
                      { value: 'Estadio Atanasio Girardot', label: 'Atanasio Girardot' },
                      { value: 'El Campín', label: 'El Campín' }
                    ]}
                    onChange={(option) => setSelectedStadium(option?.value || null)}
                    isClearable
                    className="text-base"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '12px',
                        borderColor: '#e5e7eb',
                        '&:hover': { borderColor: '#d1d5db' }
                      })
                    }}
                  />
                </div>

                {/* Filter Button */}
                <div className="md:col-span-1">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                    icon={Filter}
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <span className="hidden md:inline">Filtros</span>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 md:py-10">
          {/* Header with View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                Próximos partidos
              </h2>
              <p className="text-sm text-gray-600">
                {filteredEvents.length} eventos encontrados
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-[#353FEF] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-[#353FEF] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Events Grid/List */}
          {filteredEvents.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <EventListItem
                      event={event}
                      onClick={() => handleEventClick(event.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No hay eventos que coincidan con tu búsqueda. Intenta con otros filtros o vuelve más tarde.
              </p>
            </div>
          )}
          
          {/* Modern CTA Section */}
          <div className="mt-12 md:mt-16">
            <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-[#353FEF] to-[#2A32C5]">
              <div className="relative py-8 px-6 md:py-12 md:px-10 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0 md:max-w-md">
                  <h2 className="text-xl md:text-3xl font-bold text-white mb-3">
                    Lleva tu marca al siguiente nivel
                  </h2>
                  <p className="text-base md:text-lg text-white/90 leading-relaxed">
                    Conecta con audiencias apasionadas en los momentos más emocionantes del deporte
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="!bg-white !text-[#353FEF] hover:!bg-white/90 h-14 px-8 text-base font-semibold shadow-lg"
                  icon={ArrowRight}
                  onClick={() => navigate('/create')}
                >
                  Crear campaña
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filtros</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Equipo
                  </label>
                  <Select
                    placeholder="Seleccionar equipo"
                    options={[
                      { value: 'Atlético Nacional', label: 'Atlético Nacional' },
                      { value: 'Independiente Medellín', label: 'Independiente Medellín' },
                      { value: 'Millonarios', label: 'Millonarios' },
                      { value: 'América de Cali', label: 'América de Cali' }
                    ]}
                    onChange={(option) => setSelectedTeam(option?.value || null)}
                    isClearable
                    className="w-full text-base"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '12px'
                      })
                    }}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Estadio
                  </label>
                  <Select
                    placeholder="Seleccionar estadio"
                    options={[
                      { value: 'Estadio Atanasio Girardot', label: 'Atanasio Girardot' },
                      { value: 'El Campín', label: 'El Campín' }
                    ]}
                    onChange={(option) => setSelectedStadium(option?.value || null)}
                    isClearable
                    className="w-full text-base"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '12px'
                      })
                    }}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="h-14 text-base bg-[#353FEF] hover:bg-[#2A32C5] rounded-xl"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Aplicar filtros
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsInfoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-2xl font-semibold">¿Cómo funcionan los momentos deportivos?</h2>
                  <button
                    onClick={() => setIsInfoModalOpen(false)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#353FEF]/10 rounded-full flex-shrink-0 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#353FEF]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Momentos de alto impacto</h3>
                      <p className="text-gray-600">
                        Los momentos deportivos son espacios publicitarios de 15 segundos que aparecen en las pantallas LED del estadio durante momentos específicos del partido.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-gray-200">
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#353FEF]/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <h4 className="font-semibold">Pre-partido</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          30 minutos antes del inicio, cuando los aficionados están llegando al estadio y la expectativa está en su punto máximo.
                        </p>
                      </Card.Body>
                    </Card>
                    
                    <Card className="border border-gray-200">
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#353FEF]/10 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <h4 className="font-semibold">Primer tiempo</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Durante los primeros 45 minutos del partido, cuando la emoción está en su punto más alto.
                        </p>
                      </Card.Body>
                    </Card>

                    <Card className="border border-gray-200">
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#353FEF]/10 rounded-lg flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <h4 className="font-semibold">Entre tiempo</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          15 minutos de descanso donde los aficionados están más receptivos a los mensajes publicitarios.
                        </p>
                      </Card.Body>
                    </Card>

                    <Card className="border border-gray-200">
                      <Card.Body className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#353FEF]/10 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-[#353FEF]" />
                          </div>
                          <h4 className="font-semibold">Segundo tiempo</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Los momentos finales del partido, cuando la tensión y la emoción alcanzan su clímax.
                        </p>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}