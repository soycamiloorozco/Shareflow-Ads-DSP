import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search, Filter, Calendar, MapPin, Clock, Users,
  ChevronRight, Star, ArrowRight, Target,
  Heart, X, Info, Zap, Tv, BarChart3, TrendingUp,
  Trophy, Grid3X3, List, Eye, LayoutList
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import Select from 'react-select';
import { useSportEvents } from '../hooks/useSportEvents';
import { constants } from '../config/constants';
import { SportsSearchHeader } from '../components/sports/SportsSearchHeader';
import { useCart } from '../contexts/CartContext';
import { CartFloatingButton } from '../components/cart/CartFloatingButton';
import { CartIcon } from '../components/cart/CartIcon';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import estadioImage from '../assets/estadio.png';

// Helpers to compute week ranges (Mon-Sun)
const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day + 6) % 7; // Mon=0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (date: Date) => {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
};

// Format price in short notation: <1M -> K, >=1M -> M with 1 decimal
const formatShortCOP = (value: number): string => {
  if (value < 1_000_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return `${(value / 1_000_000).toFixed(1)}M`;
};

// Memoized Event Card Component for Better Performance
const EventCard = React.memo(({ event, index, onClick, onAddToCart, onRemoveFromCart, isInCart }: {
  event: any;
  index: number;
  onClick: () => void;
  onAddToCart?: (event: any) => void;
  onRemoveFromCart?: (event: any) => void;
  isInCart?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const eventData = useMemo(() => {
    const basePrice = event.moments[0]?.price || 2250000;
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    
    return {
      basePrice,
      isPopular: totalAudience > 100000,
      priceDisplay: formatShortCOP(basePrice)
    };
  }, [event]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleCardClick = useCallback(() => {
    onClick();
  }, [onClick]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && !isAddingToCart) {
      setIsAddingToCart(true);
      try {
        await onAddToCart(event);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    }
  }, [onAddToCart, event, isAddingToCart]);

  const handleRemoveFromCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromCart) {
      try {
        await onRemoveFromCart(event);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  }, [onRemoveFromCart, event]);

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

          {/* Teams VS section - prominent shields */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center">
                  <img 
                    src={`${constants.base_path}/${event.homeTeamImage}`}
                    alt={event.homeTeamName}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                  />
                </div>
                <span className="hidden" aria-hidden="true">{event.homeTeamName}</span>
              </div>
              
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm sm:text-base font-bold">VS</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="hidden" aria-hidden="true">{event.awayTeamName}</span>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center">
                  <img 
                    src={`${constants.base_path}/${event.awayTeamImage}`}
                    alt={event.awayTeamName}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="p-3 sm:p-4 lg:p-5">
          {/* Title and rating */}
          <div className="flex items-start justify-between mb-2.5">
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
          <div className="space-y-2 mb-4">
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
               {/* Cart Button */}
               {isInCart ? (
                 <button
                   onClick={handleRemoveFromCart}
                   className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all duration-200 flex items-center justify-center touch-manipulation min-h-[44px]"
                   aria-label={`Quitar ${event.homeTeamName} vs ${event.awayTeamName} del carrito`}
                 >
                   <Check className="w-5 h-5" />
                 </button>
               ) : (
                 <button
                   onClick={handleAddToCart}
                   disabled={isAddingToCart}
                   className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                   aria-label={`Agregar ${event.homeTeamName} vs ${event.awayTeamName} al carrito`}
                 >
                   {isAddingToCart ? (
                     <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <Plus className="w-5 h-5" />
                   )}
                 </button>
               )}
 
               {/* View Details Button */}
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   onClick();
                 }}
                 className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#353FEF] hover:bg-[#2A32C5] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
                 aria-label={`Ver ${event.homeTeamName} vs ${event.awayTeamName}`}
               >
                 <span>Ver</span>
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
const EventListItem = React.memo(({ event, onClick, onAddToCart, onRemoveFromCart, isInCart }: {
  event: any;
  onClick: () => void;
  onAddToCart?: (event: any) => void;
  onRemoveFromCart?: (event: any) => void;
  isInCart?: boolean;
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const eventData = useMemo(() => {
    const basePrice = event.moments[0]?.price || 2250000;
    const totalAudience = (event.estimatedAttendance || 0) + (event.estimatedAttendanceTv || 0);
    
    return {
      basePrice,
      isPopular: totalAudience > 100000,
      priceDisplay: formatShortCOP(basePrice),
      audienceDisplay: totalAudience > 0 ? `${(totalAudience / 1000).toFixed(0)}K` : 'N/A'
    };
  }, [event]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && !isAddingToCart) {
      setIsAddingToCart(true);
      try {
        await onAddToCart(event);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    }
  }, [onAddToCart, event, isAddingToCart]);

  const handleRemoveFromCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromCart) {
      try {
        await onRemoveFromCart(event);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  }, [onRemoveFromCart, event]);

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Event Image */}
        <div className="w-16 h-12 sm:w-20 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
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
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-1 pr-2">
              {event.homeTeamName} vs {event.awayTeamName}
            </h3>
            {eventData.isPopular && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">Popular</span>
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {new Date(event.eventDate).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {event.eventTime || '12:10'}
            </span>
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {event.stadiumName.length > 15 
                  ? `${event.stadiumName.substring(0, 15)}...` 
                  : event.stadiumName
                }
              </span>
            </span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {(event.estimatedAttendance / 1000).toFixed(0)}K
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
        <div className="flex flex-col items-end justify-between flex-shrink-0 min-h-[60px]">
          {/* Precio */}
          <div className="text-right mb-1.5">
            <p className="font-bold text-base sm:text-lg text-gray-900 leading-none">
              ${formatShortCOP(eventData.basePrice)}
            </p>
            <p className="text-xs text-gray-500 leading-none">desde / momento</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            {isInCart ? (
              <button
                onClick={handleRemoveFromCart}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition-colors touch-manipulation"
                aria-label={`Quitar ${event.homeTeamName} vs ${event.awayTeamName} del carrito`}
              >
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                aria-label={`Agregar ${event.homeTeamName} vs ${event.awayTeamName} al carrito`}
              >
                {isAddingToCart ? (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-300 transition-colors touch-manipulation"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
                }`} 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

EventListItem.displayName = 'EventListItem';

// Mobile Sports Events Interface
const MobileSportsInterface = React.memo(({ 
  events, 
  onEventClick, 
  searchQuery, 
  onSearchChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  onAddToCart,
  onRemoveFromCart,
  isEventInCart,
  loading,
  grouped
}: {
  events: any[];
  onEventClick: (eventId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filteredCount: number;
  onAddToCart: (event: any) => void;
  onRemoveFromCart: (event: any) => void;
  isEventInCart: (eventId: string) => boolean;
  loading: boolean;
  grouped?: { title: string; events: any[] }[];
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

          {/* View Mode, Stats and Cart */}
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

            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">
                {filteredCount} evento{filteredCount !== 1 ? 's' : ''}
              </div>
              <CartIcon size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {grouped && grouped.length > 0 ? (
          <div className="space-y-5">
            {grouped.map((group, gIdx) => (
              group.events.length > 0 && (
                <div key={gIdx}>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 px-1">{group.title}</h4>
                  {viewMode === 'grid' ? (
                    <div className="-mx-4 px-4 overflow-x-auto flex gap-3 snap-x snap-mandatory scroll-pb-2">
                      {group.events.map((event, index) => (
                        <div key={event.id} className="snap-start shrink-0 w-[300px]">
                          <EventCard
                            event={event}
                            index={index}
                            onClick={() => onEventClick(event.id)}
                            onAddToCart={onAddToCart}
                            onRemoveFromCart={onRemoveFromCart}
                            isInCart={isEventInCart(event.id)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.events.map((event, index) => (
                        <EventListItem
                          key={event.id}
                          event={event}
                          onClick={() => onEventClick(event.id)}
                          onAddToCart={onAddToCart}
                          onRemoveFromCart={onRemoveFromCart}
                          isInCart={isEventInCart(event.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="-mx-4 px-4 overflow-x-auto flex gap-3 snap-x snap-mandatory">
                {events.map((event, index) => (
                  <div key={event.id} className="snap-start shrink-0 w-[300px]">
                    <EventCard
                      event={event}
                      index={index}
                      onClick={() => onEventClick(event.id)}
                      onAddToCart={onAddToCart}
                      onRemoveFromCart={onRemoveFromCart}
                      isInCart={isEventInCart(event.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event, index) => (
                  <EventListItem
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event.id)}
                    onAddToCart={onAddToCart}
                    onRemoveFromCart={onRemoveFromCart}
                    isInCart={isEventInCart(event.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {events.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
            <p className="text-gray-600 text-sm">
              {searchQuery 
                ? `No hay eventos que coincidan con "${searchQuery}". Intenta con otros términos de búsqueda.`
                : 'Intenta con otros filtros o vuelve más tarde.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="mt-3 text-[#353FEF] hover:text-[#2A32C5] text-sm font-medium"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MobileSportsInterface.displayName = 'MobileSportsInterface';

export function SportsEvents() {
  const navigate = useNavigate();
  const { sportEvents, loading, error } = useSportEvents();
  const { addEvent, removeEvent, isEventInCart, getCartItemByEventId } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedStadium, setSelectedStadium] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredEvents = useMemo(() => {
    if (!sportEvents || sportEvents.length === 0) {
      return [];
    }

    const filtered = sportEvents.filter(event => {
      // Normalize search query - use debounced version
      const normalizedQuery = debouncedSearchQuery?.trim().toLowerCase() || '';
      
      // Search matching - more robust
      const matchesSearch = !normalizedQuery || [
        event.homeTeamName,
        event.awayTeamName,
        event.stadiumName,
        `${event.homeTeamName} vs ${event.awayTeamName}`,
        `${event.awayTeamName} vs ${event.homeTeamName}`
      ].some(field => 
        field?.toLowerCase().includes(normalizedQuery)
      );
      
      const matchesTeam = !selectedTeam || 
        event.homeTeamName === selectedTeam || 
        event.awayTeamName === selectedTeam;
      const matchesStadium = !selectedStadium || event.stadiumName === selectedStadium;
      // Handle different status formats (string vs number)
      const matchesStatus = event.status === 'Active' || Number(event.status) === 1;
      

      
      return matchesSearch && matchesTeam && matchesStadium && matchesStatus;
    });

    
    return filtered;
  }, [sportEvents, debouncedSearchQuery, selectedTeam, selectedStadium]);

  // Group by week
  const groupedByWeek = useMemo(() => {
    const now = new Date();
    const thisStart = startOfWeek(now);
    const thisEnd = endOfWeek(now);
    const nextStart = new Date(thisStart);
    nextStart.setDate(thisStart.getDate() + 7);
    const nextEnd = endOfWeek(nextStart);

    const thisWeek = filteredEvents.filter(e => {
      const d = new Date(e.eventDate);
      return d >= thisStart && d <= thisEnd;
    });
    const nextWeek = filteredEvents.filter(e => {
      const d = new Date(e.eventDate);
      return d >= nextStart && d <= nextEnd;
    });
    const later = filteredEvents.filter(e => {
      const d = new Date(e.eventDate);
      return d > nextEnd;
    });
    const groups: { title: string; events: any[] }[] = [];
    groups.push({ title: 'Esta semana', events: thisWeek });
    groups.push({ title: 'Próxima semana', events: nextWeek });
    if (later.length > 0) groups.push({ title: 'Más adelante', events: later });
    return groups;
  }, [filteredEvents]);

  const handleEventClick = useCallback((eventId: string) => {
    navigate(`/event/${eventId}`);
  }, [navigate]);

  const handleInfoClick = useCallback(() => {
    setIsInfoModalOpen(true);
  }, []);

  const handleAddToCart = useCallback(async (event: any) => {
    try {
      console.log('Attempting to add event to cart:', event);
      await addEvent(event);
      console.log('Event added successfully to cart');
    } catch (error) {
      console.error('Error adding event to cart:', error);
      // Aquí podrías mostrar un toast de error
    }
  }, [addEvent]);

  const handleRemoveFromCart = useCallback(async (event: any) => {
    try {
      const cartItem = getCartItemByEventId(event.id);
      if (cartItem) {
        await removeEvent(cartItem.cartId);
      }
    } catch (error) {
      console.error('Error removing event from cart:', error);
      // Aquí podrías mostrar un toast de error
    }
  }, [removeEvent, getCartItemByEventId]);

  // SEO metadata
  const title = `Eventos Deportivos Colombia 2025 | Momentos Publicitarios | Shareflow.me`;
  const description = `🏆 Descubre eventos deportivos en vivo en Colombia. Más de ${filteredEvents.length}+ eventos disponibles. Momentos publicitarios en tiempo real con audiencias masivas y precios transparentes.`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* SEO */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="eventos deportivos Colombia, momentos publicitarios, fútbol en vivo, publicidad deportiva" />
        <link rel="canonical" href="https://shareflow.me/sports-events" />
      </Helmet>

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
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          isEventInCart={isEventInCart}
          loading={loading}
          grouped={groupedByWeek}
        />
      </div>

      {/* Desktop Interface - Professional Header Similar to Marketplace */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        {/* Sports Search Header */}
        <SportsSearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onInfoClick={handleInfoClick}
          filteredCount={filteredEvents.length}
          loading={false}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#353FEF] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Cargando eventos...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="text-red-700 font-medium">Error al cargar eventos</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Results Header */}
          {!loading && !error && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Eventos disponibles
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
                  {(selectedTeam || selectedStadium) && (
                    <span className="text-blue-600">
                      {' '}con filtros aplicados
                    </span>
                  )}
                  {searchQuery && (
                    <span className="text-blue-600">
                      {' '}para "{searchQuery}"
                    </span>
                  )}
                </p>

              </div>
            
              {/* View Mode Selector */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-1.5 transition-all min-h-[44px] ${
                  viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
                }`}
                onClick={() => setViewMode('grid')}
                aria-label="Vista en tarjetas"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-1.5 transition-all min-h-[44px] ${
                  viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
                }`}
                onClick={() => setViewMode('list')}
                aria-label="Vista en lista"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
              </div>
            </div>
          )}

          {/* Events Grid/List */}
          {filteredEvents.length > 0 ? (
            <div className="space-y-8">
              {groupedByWeek.map((group, gi) => (
                group.events.length > 0 && (
                  <div key={gi}>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">{group.title}</h3>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                        {group.events.map((event, index) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            index={index}
                            onClick={() => handleEventClick(event.id)}
                            onAddToCart={handleAddToCart}
                            onRemoveFromCart={handleRemoveFromCart}
                            isInCart={isEventInCart(event.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.events.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <EventListItem
                              event={event}
                              onClick={() => handleEventClick(event.id)}
                              onAddToCart={handleAddToCart}
                              onRemoveFromCart={handleRemoveFromCart}
                              isInCart={isEventInCart(event.id)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                {searchQuery 
                  ? `No hay eventos que coincidan con "${searchQuery}". Intenta con otros términos de búsqueda.`
                  : 'No hay eventos que coincidan con tu búsqueda. Intenta con otros filtros o vuelve más tarde.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#353FEF] hover:text-[#2A32C5] font-medium transition-colors"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">¿Cómo funcionan los eventos deportivos?</h2>
                  <button
                    onClick={() => setIsInfoModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Eventos en vivo</h3>
                        <p className="text-sm text-gray-600">
                          Accede a momentos publicitarios durante eventos deportivos reales con audiencias masivas.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Audiencia garantizada</h3>
                        <p className="text-sm text-gray-600">
                          Cada evento tiene datos reales de asistencia y audiencia televisiva verificada.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Momentos precisos</h3>
                        <p className="text-sm text-gray-600">
                          Compra espacios publicitarios en momentos específicos como descansos, goles o celebraciones.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Métricas en tiempo real</h3>
                        <p className="text-sm text-gray-600">
                          Recibe reportes detallados del impacto y alcance de tu publicidad durante el evento.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">¿Cómo empezar?</h4>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Selecciona un evento deportivo de tu interés</li>
                    <li>2. Elige los momentos publicitarios disponibles</li>
                    <li>3. Configura tu campaña y audiencia objetivo</li>
                    <li>4. Confirma tu compra y recibe métricas en vivo</li>
                  </ol>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-[#353FEF] hover:bg-[#2A32C5]"
                  onClick={() => setIsInfoModalOpen(false)}
                >
                  Entendido
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <CartFloatingButton />
    </div>
  );
}