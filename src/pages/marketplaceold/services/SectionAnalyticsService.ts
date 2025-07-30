import { UserInteraction, SectionEngagement, ConversionEvent, AnalyticsEvent } from '../types/intelligent-grouping.types';

export interface SectionAnalyticsConfig {
  trackingEnabled: boolean;
  batchSize: number;
  flushInterval: number;
  enableScrollTracking: boolean;
  enableViewTimeTracking: boolean;
}

export interface SectionViewMetrics {
  sectionId: string;
  viewStartTime: Date;
  viewEndTime?: Date;
  viewDuration: number;
  scrollDepth: number;
  maxScrollDepth: number;
  screenInteractions: ScreenInteractionMetrics[];
}

export interface ScreenInteractionMetrics {
  screenId: string;
  sectionId: string;
  clickCount: number;
  hoverTime: number;
  viewTime: number;
  position: number;
  timestamp: Date;
}

export interface ConversionMetrics {
  userId: string;
  sessionId: string;
  sectionId: string;
  screenId: string;
  conversionType: 'click' | 'purchase' | 'favorite' | 'share';
  timestamp: Date;
  value?: number;
  metadata?: Record<string, any>;
}

export class SectionAnalyticsService {
  private config: SectionAnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private sectionViewMetrics: Map<string, SectionViewMetrics> = new Map();
  private screenInteractions: Map<string, ScreenInteractionMetrics> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<SectionAnalyticsConfig> = {}) {
    this.config = {
      trackingEnabled: true,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      enableScrollTracking: true,
      enableViewTimeTracking: true,
      ...config
    };

    if (this.config.trackingEnabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Track when a user starts viewing a section
   */
  trackSectionView(sectionId: string, userId: string, sessionId: string): void {
    if (!this.config.trackingEnabled) return;

    const viewMetrics: SectionViewMetrics = {
      sectionId,
      viewStartTime: new Date(),
      viewDuration: 0,
      scrollDepth: 0,
      maxScrollDepth: 0,
      screenInteractions: []
    };

    this.sectionViewMetrics.set(sectionId, viewMetrics);

    this.queueEvent({
      type: 'section_view_start',
      userId,
      sessionId,
      sectionId,
      timestamp: new Date(),
      data: { sectionId }
    });
  }

  /**
   * Track when a user stops viewing a section
   */
  trackSectionViewEnd(sectionId: string, userId: string, sessionId: string): void {
    if (!this.config.trackingEnabled) return;

    const viewMetrics = this.sectionViewMetrics.get(sectionId);
    if (viewMetrics) {
      viewMetrics.viewEndTime = new Date();
      viewMetrics.viewDuration = viewMetrics.viewEndTime.getTime() - viewMetrics.viewStartTime.getTime();

      this.queueEvent({
        type: 'section_view_end',
        userId,
        sessionId,
        sectionId,
        timestamp: new Date(),
        data: {
          sectionId,
          viewDuration: viewMetrics.viewDuration,
          scrollDepth: viewMetrics.maxScrollDepth,
          screenInteractions: viewMetrics.screenInteractions.length
        }
      });

      this.sectionViewMetrics.delete(sectionId);
    }
  }

  /**
   * Track scroll depth within a section
   */
  trackSectionScroll(sectionId: string, scrollDepth: number, userId: string, sessionId: string): void {
    if (!this.config.trackingEnabled || !this.config.enableScrollTracking) return;

    const viewMetrics = this.sectionViewMetrics.get(sectionId);
    if (viewMetrics) {
      const previousMaxScrollDepth = viewMetrics.maxScrollDepth;
      viewMetrics.scrollDepth = scrollDepth;
      viewMetrics.maxScrollDepth = Math.max(viewMetrics.maxScrollDepth, scrollDepth);

      // Only track significant scroll milestones (25%, 50%, 75%, 100%)
      const milestones = [0.25, 0.5, 0.75, 1.0];
      const currentMilestone = milestones.find(m => scrollDepth >= m && previousMaxScrollDepth < m);
      
      if (currentMilestone) {
        this.queueEvent({
          type: 'section_scroll',
          userId,
          sessionId,
          sectionId,
          timestamp: new Date(),
          data: {
            sectionId,
            scrollDepth: currentMilestone,
            milestone: `${currentMilestone * 100}%`
          }
        });
      }
    }
  }

  /**
   * Track screen click within a section
   */
  trackScreenClick(
    screenId: string, 
    sectionId: string, 
    position: number, 
    userId: string, 
    sessionId: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.trackingEnabled) return;

    const interactionKey = `${sectionId}-${screenId}`;
    let interaction = this.screenInteractions.get(interactionKey);

    if (!interaction) {
      interaction = {
        screenId,
        sectionId,
        clickCount: 0,
        hoverTime: 0,
        viewTime: 0,
        position,
        timestamp: new Date()
      };
      this.screenInteractions.set(interactionKey, interaction);
    }

    interaction.clickCount++;

    this.queueEvent({
      type: 'screen_click',
      userId,
      sessionId,
      sectionId,
      screenId,
      timestamp: new Date(),
      data: {
        screenId,
        sectionId,
        position,
        clickCount: interaction.clickCount,
        ...metadata
      }
    });

    // Update section view metrics
    const viewMetrics = this.sectionViewMetrics.get(sectionId);
    if (viewMetrics) {
      const existingInteraction = viewMetrics.screenInteractions.find(si => si.screenId === screenId);
      if (existingInteraction) {
        existingInteraction.clickCount = interaction.clickCount;
      } else {
        viewMetrics.screenInteractions.push({ ...interaction });
      }
    }
  }

  /**
   * Track screen hover/view time within a section
   */
  trackScreenHover(
    screenId: string, 
    sectionId: string, 
    hoverDuration: number, 
    userId: string, 
    sessionId: string
  ): void {
    if (!this.config.trackingEnabled) return;

    const interactionKey = `${sectionId}-${screenId}`;
    let interaction = this.screenInteractions.get(interactionKey);

    if (!interaction) {
      interaction = {
        screenId,
        sectionId,
        clickCount: 0,
        hoverTime: 0,
        viewTime: 0,
        position: 0,
        timestamp: new Date()
      };
      this.screenInteractions.set(interactionKey, interaction);
    }

    interaction.hoverTime += hoverDuration;

    // Only track significant hover events (> 1 second)
    if (hoverDuration > 1000) {
      this.queueEvent({
        type: 'screen_hover',
        userId,
        sessionId,
        sectionId,
        screenId,
        timestamp: new Date(),
        data: {
          screenId,
          sectionId,
          hoverDuration,
          totalHoverTime: interaction.hoverTime
        }
      });
    }
  }

  /**
   * Track conversion events (purchase, favorite, share)
   */
  trackConversion(
    conversionType: ConversionMetrics['conversionType'],
    screenId: string,
    sectionId: string,
    userId: string,
    sessionId: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.trackingEnabled) return;

    const conversionEvent: ConversionMetrics = {
      userId,
      sessionId,
      sectionId,
      screenId,
      conversionType,
      timestamp: new Date(),
      value,
      metadata
    };

    this.queueEvent({
      type: 'conversion',
      userId,
      sessionId,
      sectionId,
      screenId,
      timestamp: new Date(),
      data: conversionEvent
    });
  }

  /**
   * Get current section engagement metrics
   */
  getSectionEngagement(sectionId: string): SectionEngagement | null {
    const viewMetrics = this.sectionViewMetrics.get(sectionId);
    if (!viewMetrics) return null;

    const totalClicks = viewMetrics.screenInteractions.reduce((sum, si) => sum + si.clickCount, 0);
    const totalHoverTime = viewMetrics.screenInteractions.reduce((sum, si) => sum + si.hoverTime, 0);

    return {
      sectionId,
      viewTime: viewMetrics.viewDuration,
      clickCount: totalClicks,
      scrollDepth: viewMetrics.maxScrollDepth,
      conversionRate: 0 // Will be calculated by analytics service
    };
  }

  /**
   * Get screen interaction metrics for a specific screen
   */
  getScreenInteractionMetrics(screenId: string, sectionId: string): ScreenInteractionMetrics | null {
    const interactionKey = `${sectionId}-${screenId}`;
    return this.screenInteractions.get(interactionKey) || null;
  }

  /**
   * Queue an analytics event for batch processing
   */
  private queueEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Flush queued events to analytics backend
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, this would send to your analytics backend
      // For now, we'll log to console and store in localStorage for development
      console.log('Flushing analytics events:', events);
      
      // Store in localStorage for development/testing
      const existingEvents = JSON.parse(localStorage.getItem('marketplace_analytics') || '[]');
      existingEvents.push(...events);
      localStorage.setItem('marketplace_analytics', JSON.stringify(existingEvents));

      // TODO: Replace with actual API call to analytics service
      // await this.sendToAnalyticsAPI(events);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Start the automatic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  /**
   * Stop tracking and flush remaining events
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.flushEvents();
    this.sectionViewMetrics.clear();
    this.screenInteractions.clear();
  }

  /**
   * Get all queued events (for testing)
   */
  public getQueuedEvents(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  /**
   * Clear all tracking data (for testing)
   */
  public clearTrackingData(): void {
    this.eventQueue = [];
    this.sectionViewMetrics.clear();
    this.screenInteractions.clear();
  }
}

// Singleton instance for global use
export const sectionAnalytics = new SectionAnalyticsService();