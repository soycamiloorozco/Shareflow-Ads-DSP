import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, ChevronUp } from 'lucide-react';
import { MarketplaceSection as MarketplaceSectionType } from '../../types/intelligent-grouping.types';
import { MarketplaceSection } from './MarketplaceSection';

interface SectionedScreenGridProps {
  sections: MarketplaceSectionType[];
  onScreenSelect: (screen: any) => void;
  onFavoriteChange?: () => void;
  onRefreshSections?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  className?: string;
  'aria-label'?: string;
}

interface LazyLoadedSection {
  section: MarketplaceSectionType;
  isVisible: boolean;
  hasLoaded: boolean;
}

export const SectionedScreenGrid = React.memo<SectionedScreenGridProps>(({
  sections,
  onScreenSelect,
  onFavoriteChange,
  onRefreshSections,
  loading = false,
  error = null,
  className = '',
  'aria-label': ariaLabel = 'Sectioned marketplace grid'
}) => {
  const [lazyLoadedSections, setLazyLoadedSections] = useState<LazyLoadedSection[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Initialize lazy loaded sections
  useEffect(() => {
    const initialSections = sections.map((section, index) => ({
      section,
      isVisible: index < 2, // Load first 2 sections immediately
      hasLoaded: index < 2
    }));
    setLazyLoadedSections(initialSections);
  }, [sections]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) {
              setLazyLoadedSections(prev => 
                prev.map(item => 
                  item.section.id === sectionId 
                    ? { ...item, isVisible: true, hasLoaded: true }
                    : item
                )
              );
            }
          }
        });
      },
      {
        rootMargin: '200px 0px', // Start loading 200px before the section comes into view
        threshold: 0.1
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe section elements
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      sectionRefs.current.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [lazyLoadedSections]);

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle section refresh
  const handleRefresh = useCallback(async () => {
    if (!onRefreshSections || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefreshSections();
    } catch (error) {
      console.error('Error refreshing sections:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshSections, isRefreshing]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Set section ref
  const setSectionRef = useCallback((sectionId: string, element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current.set(sectionId, element);
    } else {
      sectionRefs.current.delete(sectionId);
    }
  }, []);

  // Render error state
  if (error && !loading) {
    return (
      <div className={`text-center py-16 sm:py-20 ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Error al cargar las secciones
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            {error}
          </p>
          {onRefreshSections && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Recargando...' : 'Intentar de nuevo'}
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // Render loading state
  if (loading && sections.length === 0) {
    return (
      <div className={`space-y-8 sm:space-y-12 ${className}`} aria-label={`${ariaLabel} (loading)`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="mb-8 sm:mb-12">
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
              {[...Array(4)].map((_, cardIndex) => (
                <div key={cardIndex} className="flex-shrink-0 w-72 sm:w-80">
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
          </div>
        ))}
      </div>
    );
  }

  // Render empty state
  if (sections.length === 0 && !loading) {
    return (
      <div className={`text-center py-16 sm:py-20 ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No hay secciones disponibles
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            No se pudieron generar secciones personalizadas en este momento. 
            Intenta recargar la página o ajustar tus filtros.
          </p>
          {onRefreshSections && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-6 py-3 bg-[#353FEF] text-white rounded-lg font-medium hover:bg-[#2A32C5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Recargando...' : 'Recargar secciones'}
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} aria-label={ariaLabel}>
      {/* Auto-refresh indicator (only show when refreshing) */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Actualizando secciones...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections container */}
      <div className="space-y-8 sm:space-y-12">
        <AnimatePresence mode="wait">
          {lazyLoadedSections.map((item, index) => (
            <div
              key={item.section.id}
              ref={(el) => setSectionRef(item.section.id, el)}
              data-section-id={item.section.id}
              className={`transition-opacity duration-300 ${
                item.isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {item.hasLoaded ? (
                <MarketplaceSection
                  section={item.section}
                  onScreenSelect={onScreenSelect}
                  onFavoriteChange={onFavoriteChange}
                  loading={loading && index === 0} // Only show loading for first section
                  aria-label={`Section ${index + 1}: ${item.section.title}`}
                />
              ) : (
                // Placeholder for lazy loading
                <div className="h-96 flex items-center justify-center">
                  <div className="flex items-center gap-3 text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Cargando sección...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-[#353FEF] text-white rounded-full shadow-lg hover:bg-[#2A32C5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#353FEF] focus:ring-offset-2"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>


    </div>
  );
});

SectionedScreenGrid.displayName = 'SectionedScreenGrid';