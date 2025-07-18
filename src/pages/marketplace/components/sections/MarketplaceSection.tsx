import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock, MapPin } from 'lucide-react';
import { MarketplaceSection as MarketplaceSectionType } from '../../types/intelligent-grouping.types';
import { ScreenCard } from '../screens/ScreenCard';

interface MarketplaceSectionProps {
  section: MarketplaceSectionType;
  onScreenSelect: (screen: any) => void;
  onFavoriteChange?: () => void;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const MarketplaceSection = React.memo<MarketplaceSectionProps>(({
  section,
  onScreenSelect,
  onFavoriteChange,
  loading = false,
  className = '',
  'aria-label': ariaLabel
}) => {
  // ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL HOOKS!
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check scroll position and update navigation buttons
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Handle scroll navigation
  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container || isScrolling) return;

    setIsScrolling(true);
    const cardWidth = 320; // Approximate card width including gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });

    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 300);
  }, [isScrolling]);

  // Update scroll position on mount and resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => checkScrollPosition();
    const handleResize = () => checkScrollPosition();

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial check
    checkScrollPosition();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollPosition]);

  // Mobile detection effect - ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get section icon based on algorithm type
  const getSectionIcon = () => {
    switch (section.metadata?.algorithm) {
      case 'ml-personalized':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'trending-analysis':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case 'recent-activity':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'geographic-popularity':
        return <MapPin className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  // Render loading skeleton
  if (loading) {
    return (
      <section 
        className={`mb-8 sm:mb-12 ${className}`}
        aria-label={`${ariaLabel || section?.title || 'Loading section'} (loading)`}
        aria-busy="true"
      >
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-72 sm:w-80"
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                    <div className="h-10 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Don't render if no screens
  if (!section?.screens || section.screens.length === 0) {
    return null;
  }

  // On mobile, all sections should use horizontal scroll for better UX
  // On desktop, respect the original displayType
  const isHorizontalScroll = isMobile || section.displayType === 'horizontal-scroll';
  const isFeatured = section.displayType === 'featured' || section.displayType === 'hero';

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-8 sm:mb-12 ${className}`}
      aria-label={ariaLabel || section.title}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {getSectionIcon()}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {section.title}
            </h2>
            {section.metadata.confidence > 0.8 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Alta confianza
              </span>
            )}
          </div>
          {section.subtitle && (
            <p className="text-sm sm:text-base text-gray-600 line-clamp-2">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Navigation buttons for horizontal scroll */}
        {isHorizontalScroll && (
          <div className="hidden sm:flex items-center gap-2 ml-4">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft || isScrolling}
              className={`p-2 rounded-full border transition-all duration-200 ${
                canScrollLeft && !isScrolling
                  ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight || isScrolling}
              className={`p-2 rounded-full border transition-all duration-200 ${
                canScrollRight && !isScrolling
                  ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Section Content */}
      <div className="relative">
        {isHorizontalScroll ? (
          // Horizontal scrolling layout
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {section.screens.map((screen, index) => (
              <div 
                key={screen.id}
                className={`flex-shrink-0 ${
                  isMobile 
                    ? 'w-64' // Smaller width on mobile for better scrolling
                    : 'w-72 sm:w-80'
                }`}
                style={{ scrollSnapAlign: 'start' }}
              >
                <ScreenCard
                  screen={screen}
                  index={index}
                  onSelect={onScreenSelect}
                  onFavoriteChange={onFavoriteChange}
                  variant={isFeatured ? 'featured' : 'default'}
                />
              </div>
            ))}
          </div>
        ) : (
          // Grid layout
          <div className={`grid gap-4 sm:gap-6 ${
            isFeatured 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {section.screens.map((screen, index) => (
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ScreenCard
                  screen={screen}
                  index={index}
                  onSelect={onScreenSelect}
                  onFavoriteChange={onFavoriteChange}
                  variant={isFeatured ? 'featured' : 'default'}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Scroll indicators for mobile */}
        {isHorizontalScroll && (
          <div className="flex sm:hidden justify-center mt-4 gap-1">
            {Array.from({ length: Math.ceil(section.screens.length / 2) }).map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300"
              />
            ))}
          </div>
        )}
      </div>


    </motion.section>
  );
});

MarketplaceSection.displayName = 'MarketplaceSection';