import { useCallback, useEffect, useRef } from 'react';
import { sectionAnalytics } from '../services/SectionAnalyticsService';
import { ConversionMetrics } from '../types/intelligent-grouping.types';

export interface UseSectionAnalyticsProps {
  userId: string;
  sessionId: string;
  enabled?: boolean;
}

export interface SectionAnalyticsHook {
  trackSectionView: (sectionId: string) => void;
  trackSectionViewEnd: (sectionId: string) => void;
  trackSectionScroll: (sectionId: string, scrollDepth: number) => void;
  trackScreenClick: (screenId: string, sectionId: string, position: number, metadata?: Record<string, any>) => void;
  trackScreenHover: (screenId: string, sectionId: string, hoverDuration: number) => void;
  trackConversion: (
    conversionType: ConversionMetrics['conversionType'],
    screenId: string,
    sectionId: string,
    value?: number,
    metadata?: Record<string, any>
  ) => void;
}

export const useSectionAnalytics = ({
  userId,
  sessionId,
  enabled = true
}: UseSectionAnalyticsProps): SectionAnalyticsHook => {
  const sectionViewTimers = useRef<Map<string, Date>>(new Map());
  const hoverTimers = useRef<Map<string, Date>>(new Map());

  const trackSectionView = useCallback((sectionId: string) => {
    if (!enabled) return;
    
    sectionViewTimers.current.set(sectionId, new Date());
    sectionAnalytics.trackSectionView(sectionId, userId, sessionId);
  }, [userId, sessionId, enabled]);

  const trackSectionViewEnd = useCallback((sectionId: string) => {
    if (!enabled) return;
    
    sectionViewTimers.current.delete(sectionId);
    sectionAnalytics.trackSectionViewEnd(sectionId, userId, sessionId);
  }, [userId, sessionId, enabled]);

  const trackSectionScroll = useCallback((sectionId: string, scrollDepth: number) => {
    if (!enabled) return;
    
    sectionAnalytics.trackSectionScroll(sectionId, scrollDepth, userId, sessionId);
  }, [userId, sessionId, enabled]);

  const trackScreenClick = useCallback((
    screenId: string, 
    sectionId: string, 
    position: number, 
    metadata?: Record<string, any>
  ) => {
    if (!enabled) return;
    
    sectionAnalytics.trackScreenClick(screenId, sectionId, position, userId, sessionId, metadata);
  }, [userId, sessionId, enabled]);

  const trackScreenHover = useCallback((
    screenId: string, 
    sectionId: string, 
    hoverDuration: number
  ) => {
    if (!enabled) return;
    
    sectionAnalytics.trackScreenHover(screenId, sectionId, hoverDuration, userId, sessionId);
  }, [userId, sessionId, enabled]);

  const trackConversion = useCallback((
    conversionType: ConversionMetrics['conversionType'],
    screenId: string,
    sectionId: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    if (!enabled) return;
    
    sectionAnalytics.trackConversion(conversionType, screenId, sectionId, userId, sessionId, value, metadata);
  }, [userId, sessionId, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // End all active section views
      sectionViewTimers.current.forEach((_, sectionId) => {
        sectionAnalytics.trackSectionViewEnd(sectionId, userId, sessionId);
      });
      sectionViewTimers.current.clear();
      hoverTimers.current.clear();
    };
  }, [userId, sessionId]);

  return {
    trackSectionView,
    trackSectionViewEnd,
    trackSectionScroll,
    trackScreenClick,
    trackScreenHover,
    trackConversion
  };
};

// Hook for tracking screen hover events with automatic timing
export const useScreenHoverTracking = (
  screenId: string,
  sectionId: string,
  analytics: SectionAnalyticsHook
) => {
  const hoverStartTime = useRef<Date | null>(null);

  const handleMouseEnter = useCallback(() => {
    hoverStartTime.current = new Date();
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverStartTime.current) {
      const hoverDuration = new Date().getTime() - hoverStartTime.current.getTime();
      analytics.trackScreenHover(screenId, sectionId, hoverDuration);
      hoverStartTime.current = null;
    }
  }, [screenId, sectionId, analytics]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  };
};

// Hook for tracking section scroll depth
export const useSectionScrollTracking = (
  sectionId: string,
  analytics: SectionAnalyticsHook,
  threshold: number = 0.1 // Track every 10% scroll
) => {
  const lastScrollDepth = useRef<number>(0);

  const handleScroll = useCallback((element: HTMLElement) => {
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const scrollDepth = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    // Only track if scroll depth increased by threshold amount
    if (scrollDepth - lastScrollDepth.current >= threshold) {
      analytics.trackSectionScroll(sectionId, scrollDepth);
      lastScrollDepth.current = scrollDepth;
    }
  }, [sectionId, analytics, threshold]);

  return { handleScroll };
};

// Hook for tracking section visibility using Intersection Observer
export const useSectionVisibilityTracking = (
  sectionId: string,
  analytics: SectionAnalyticsHook,
  threshold: number = 0.5 // 50% visibility threshold
) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const isVisible = useRef<boolean>(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible.current) {
            isVisible.current = true;
            analytics.trackSectionView(sectionId);
          } else if (!entry.isIntersecting && isVisible.current) {
            isVisible.current = false;
            analytics.trackSectionViewEnd(sectionId);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (isVisible.current) {
        analytics.trackSectionViewEnd(sectionId);
      }
    };
  }, [sectionId, analytics, threshold]);

  return { elementRef };
};