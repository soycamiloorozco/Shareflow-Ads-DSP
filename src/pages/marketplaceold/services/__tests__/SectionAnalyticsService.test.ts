import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { SectionAnalyticsService } from '../SectionAnalyticsService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.log to avoid noise in tests
const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('SectionAnalyticsService', () => {
  let analyticsService: SectionAnalyticsService;
  const mockUserId = 'user-123';
  const mockSessionId = 'session-456';
  const mockSectionId = 'section-trending';
  const mockScreenId = 'screen-789';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
    
    analyticsService = new SectionAnalyticsService({
      trackingEnabled: true,
      batchSize: 5,
      flushInterval: 1000,
      enableScrollTracking: true,
      enableViewTimeTracking: true
    });
  });

  afterEach(() => {
    analyticsService.destroy();
    vi.clearAllTimers();
  });

  describe('Section View Tracking', () => {
    it('should track section view start', () => {
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);

      const queuedEvents = analyticsService.getQueuedEvents();
      expect(queuedEvents).toHaveLength(1);
      expect(queuedEvents[0]).toMatchObject({
        type: 'section_view_start',
        userId: mockUserId,
        sessionId: mockSessionId,
        sectionId: mockSectionId,
        data: { sectionId: mockSectionId }
      });
    });

    it('should track section view end with duration', () => {
      vi.useFakeTimers();
      
      // Start tracking
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      
      // Wait a bit and end tracking
      vi.advanceTimersByTime(1000);
      analyticsService.trackSectionViewEnd(mockSectionId, mockUserId, mockSessionId);

      const queuedEvents = analyticsService.getQueuedEvents();
      expect(queuedEvents).toHaveLength(2);
      
      const endEvent = queuedEvents[1];
      expect(endEvent.type).toBe('section_view_end');
      expect(endEvent.data.viewDuration).toBeGreaterThan(0);
      
      vi.useRealTimers();
    });

    it('should return section engagement metrics', () => {
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      
      const engagement = analyticsService.getSectionEngagement(mockSectionId);
      expect(engagement).toBeTruthy();
      expect(engagement?.sectionId).toBe(mockSectionId);
      expect(engagement?.viewTime).toBe(0); // No end time yet
    });
  });

  describe('Scroll Tracking', () => {
    it('should track scroll milestones', () => {
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      
      // Track 25% scroll
      analyticsService.trackSectionScroll(mockSectionId, 0.25, mockUserId, mockSessionId);
      
      const queuedEvents = analyticsService.getQueuedEvents();
      const scrollEvent = queuedEvents.find(e => e.type === 'section_scroll');
      
      expect(scrollEvent).toBeTruthy();
      expect(scrollEvent?.data.scrollDepth).toBe(0.25);
      expect(scrollEvent?.data.milestone).toBe('25%');
    });

    it('should not track duplicate scroll milestones', () => {
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      
      // Track 25% scroll twice
      analyticsService.trackSectionScroll(mockSectionId, 0.25, mockUserId, mockSessionId);
      analyticsService.trackSectionScroll(mockSectionId, 0.26, mockUserId, mockSessionId);
      
      const queuedEvents = analyticsService.getQueuedEvents();
      const scrollEvents = queuedEvents.filter(e => e.type === 'section_scroll');
      
      expect(scrollEvents).toHaveLength(1); // Should only track once for 25% milestone
    });

    it('should track multiple scroll milestones', () => {
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      
      // Track different milestones
      analyticsService.trackSectionScroll(mockSectionId, 0.25, mockUserId, mockSessionId);
      analyticsService.trackSectionScroll(mockSectionId, 0.5, mockUserId, mockSessionId);
      analyticsService.trackSectionScroll(mockSectionId, 0.75, mockUserId, mockSessionId);
      
      const queuedEvents = analyticsService.getQueuedEvents();
      const scrollEvents = queuedEvents.filter(e => e.type === 'section_scroll');
      
      expect(scrollEvents).toHaveLength(3);
    });
  });

  describe('Screen Interaction Tracking', () => {
    it('should track screen clicks', () => {
      const position = 2;
      const metadata = { category: 'outdoor', price: 500000 };
      
      analyticsService.trackScreenClick(
        mockScreenId, 
        mockSectionId, 
        position, 
        mockUserId, 
        mockSessionId,
        metadata
      );

      const queuedEvents = analyticsService.getQueuedEvents();
      const clickEvent = queuedEvents.find(e => e.type === 'screen_click');
      
      expect(clickEvent).toBeTruthy();
      expect(clickEvent?.data).toMatchObject({
        screenId: mockScreenId,
        sectionId: mockSectionId,
        position,
        clickCount: 1,
        ...metadata
      });
    });

    it('should accumulate multiple clicks on same screen', () => {
      analyticsService.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      analyticsService.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      
      const queuedEvents = analyticsService.getQueuedEvents();
      const clickEvents = queuedEvents.filter(e => e.type === 'screen_click');
      
      expect(clickEvents).toHaveLength(2);
      expect(clickEvents[1].data.clickCount).toBe(2);
    });

    it('should track screen hover for significant durations', () => {
      const hoverDuration = 1500; // 1.5 seconds
      
      analyticsService.trackScreenHover(
        mockScreenId, 
        mockSectionId, 
        hoverDuration, 
        mockUserId, 
        mockSessionId
      );

      const queuedEvents = analyticsService.getQueuedEvents();
      const hoverEvent = queuedEvents.find(e => e.type === 'screen_hover');
      
      expect(hoverEvent).toBeTruthy();
      expect(hoverEvent?.data.hoverDuration).toBe(hoverDuration);
    });

    it('should not track short hover durations', () => {
      const shortHoverDuration = 500; // 0.5 seconds
      
      analyticsService.trackScreenHover(
        mockScreenId, 
        mockSectionId, 
        shortHoverDuration, 
        mockUserId, 
        mockSessionId
      );

      const queuedEvents = analyticsService.getQueuedEvents();
      const hoverEvent = queuedEvents.find(e => e.type === 'screen_hover');
      
      expect(hoverEvent).toBeFalsy();
    });

    it('should get screen interaction metrics', () => {
      analyticsService.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      analyticsService.trackScreenHover(mockScreenId, mockSectionId, 2000, mockUserId, mockSessionId);
      
      const metrics = analyticsService.getScreenInteractionMetrics(mockScreenId, mockSectionId);
      
      expect(metrics).toBeTruthy();
      expect(metrics?.clickCount).toBe(1);
      expect(metrics?.hoverTime).toBe(2000);
    });
  });

  describe('Conversion Tracking', () => {
    it('should track purchase conversions', () => {
      const value = 750000;
      const metadata = { campaign: 'summer-sale', duration: 7 };
      
      analyticsService.trackConversion(
        'purchase',
        mockScreenId,
        mockSectionId,
        mockUserId,
        mockSessionId,
        value,
        metadata
      );

      const queuedEvents = analyticsService.getQueuedEvents();
      const conversionEvent = queuedEvents.find(e => e.type === 'conversion');
      
      expect(conversionEvent).toBeTruthy();
      expect(conversionEvent?.data).toMatchObject({
        conversionType: 'purchase',
        screenId: mockScreenId,
        sectionId: mockSectionId,
        value,
        metadata
      });
    });

    it('should track different conversion types', () => {
      analyticsService.trackConversion('favorite', mockScreenId, mockSectionId, mockUserId, mockSessionId);
      analyticsService.trackConversion('share', mockScreenId, mockSectionId, mockUserId, mockSessionId);
      
      const queuedEvents = analyticsService.getQueuedEvents();
      const conversionEvents = queuedEvents.filter(e => e.type === 'conversion');
      
      expect(conversionEvents).toHaveLength(2);
      expect(conversionEvents[0].data.conversionType).toBe('favorite');
      expect(conversionEvents[1].data.conversionType).toBe('share');
    });
  });

  describe('Event Batching and Flushing', () => {
    it('should flush events when batch size is reached', () => {
      const batchSize = 3;
      const service = new SectionAnalyticsService({ batchSize, flushInterval: 10000 });
      
      // Add events up to batch size
      for (let i = 0; i < batchSize; i++) {
        service.trackScreenClick(`screen-${i}`, mockSectionId, i, mockUserId, mockSessionId);
      }

      // Should have flushed automatically
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(service.getQueuedEvents()).toHaveLength(0);
      
      service.destroy();
    });

    it('should flush events on timer interval', async () => {
      vi.useFakeTimers();
      
      const flushInterval = 2000;
      const service = new SectionAnalyticsService({ 
        batchSize: 10, 
        flushInterval 
      });
      
      service.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      
      // Advance timer to trigger flush
      vi.advanceTimersByTime(flushInterval);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      service.destroy();
      vi.useRealTimers();
    });

    it('should store events in localStorage', () => {
      analyticsService.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      
      // Manually flush
      analyticsService.destroy();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketplace_analytics',
        expect.stringContaining('screen_click')
      );
    });
  });

  describe('Configuration', () => {
    it('should not track when disabled', () => {
      const disabledService = new SectionAnalyticsService({ trackingEnabled: false });
      
      disabledService.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      
      expect(disabledService.getQueuedEvents()).toHaveLength(0);
      
      disabledService.destroy();
    });

    it('should not track scroll when scroll tracking is disabled', () => {
      const service = new SectionAnalyticsService({ enableScrollTracking: false });
      
      service.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      service.trackSectionScroll(mockSectionId, 0.5, mockUserId, mockSessionId);
      
      const queuedEvents = service.getQueuedEvents();
      const scrollEvents = queuedEvents.filter(e => e.type === 'section_scroll');
      
      expect(scrollEvents).toHaveLength(0);
      
      service.destroy();
    });
  });

  describe('Data Management', () => {
    it('should clear tracking data', () => {
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      analyticsService.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      
      expect(analyticsService.getQueuedEvents().length).toBeGreaterThan(0);
      expect(analyticsService.getSectionEngagement(mockSectionId)).toBeTruthy();
      
      analyticsService.clearTrackingData();
      
      expect(analyticsService.getQueuedEvents()).toHaveLength(0);
      expect(analyticsService.getSectionEngagement(mockSectionId)).toBeFalsy();
    });

    it('should handle destroy gracefully', () => {
      analyticsService.trackSectionView(mockSectionId, mockUserId, mockSessionId);
      analyticsService.trackScreenClick(mockScreenId, mockSectionId, 1, mockUserId, mockSessionId);
      
      expect(() => analyticsService.destroy()).not.toThrow();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});