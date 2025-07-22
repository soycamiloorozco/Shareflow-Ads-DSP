/**
 * Sectioned Marketplace UI Integration Tests
 * Tests for UI component rendering with different section configurations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarketplaceSection } from '../sections/MarketplaceSection';
import { SectionedScreenGrid } from '../sections/SectionedScreenGrid';
import { SectionScreenCard } from '../screens/SectionScreenCard';
import { 
  EnhancedScreen, 
  MarketplaceSection as MarketplaceSectionType,
  SectionEngagement
} from '../../types/intelligent-grouping.types';

// Mock the hooks and services
vi.mock('../../hooks/useMarketplaceData', () => ({
  useMarketplaceData: () => ({
    sections: [],
    loading: false,
    error: null,
    refreshSections: vi.fn()
  })
}));

vi.mock('../../hooks/useSectionAnalytics', () => ({
  useSectionAnalytics: () => ({
    trackSectionView: vi.fn(),
    trackScreenClick: vi.fn(),
    trackSectionEngagement: vi.fn()
  })
}));

describe('Sectioned Marketplace UI Integration Tests', () => {
  let mockScreens: EnhancedScreen[];
  let mockSections: MarketplaceSectionType[];

  beforeEach(() => {
    // Create comprehensive mock screens
    mockScreens = [
      {
        id: 'ui-test-screen-1',
        name: 'Premium Downtown Billboard',
        location: 'Bogotá Centro',
        price: 600000,
        category: 'Billboard',
        performanceMetrics: {
          screenId: 'ui-test-screen-1',
          bookingRate: 0.8,
          averageRating: 4.5,
          engagementScore: 0.85,
          revenueGenerated: 2000000,
          impressionCount: 500,
          conversionRate: 0.35,
          lastUpdated: new Date(),
          trendDirection: 'up'
        },
        bookingFrequency: 'high',
        personalizedScore: 0.9,
        trendingScore: 0.8,
        recommendationScore: 0.88,
        sectionAssignment: 'top-picks-user123',
        engagementMetrics: {
          viewTime: 150,
          interactionRate: 0.2,
          completionRate: 0.85,
          shareRate: 0.06,
          favoriteRate: 0.12,
          clickThroughRate: 0.15,
          bounceRate: 0.15
        },
        audienceInsights: {
          primaryDemographic: 'business-professionals',
          ageDistribution: { '25-34': 0.4, '35-44': 0.4, '45-54': 0.2 },
          genderDistribution: { 'male': 0.6, 'female': 0.4 },
          interestCategories: ['business', 'technology'],
          peakEngagementHours: [9, 12, 17],
          seasonalTrends: { 'Q1': 1.0, 'Q2': 1.2, 'Q3': 0.9, 'Q4': 1.1 }
        }
      } as EnhancedScreen,
      {
        id: 'ui-test-screen-2',
        name: 'Shopping Mall LED Display',
        location: 'Bogotá Norte',
        price: 400000,
        category: 'LED Display',
        performanceMetrics: {
          screenId: 'ui-test-screen-2',
          bookingRate: 0.6,
          averageRating: 4.2,
          engagementScore: 0.7,
          revenueGenerated: 1200000,
          impressionCount: 300,
          conversionRate: 0.28,
          lastUpdated: new Date(),
          trendDirection: 'stable'
        },
        bookingFrequency: 'medium',
        personalizedScore: 0.7,
        trendingScore: 0.75,
        recommendationScore: 0.72,
        sectionAssignment: 'trending-general',
        engagementMetrics: {
          viewTime: 120,
          interactionRate: 0.15,
          completionRate: 0.75,
          shareRate: 0.04,
          favoriteRate: 0.08,
          clickThroughRate: 0.12,
          bounceRate: 0.2
        },
        audienceInsights: {
          primaryDemographic: 'families',
          ageDistribution: { '25-34': 0.3, '35-44': 0.4, '45-54': 0.3 },
          genderDistribution: { 'male': 0.4, 'female': 0.6 },
          interestCategories: ['shopping', 'family'],
          peakEngagementHours: [14, 19],
          seasonalTrends: { 'Q1': 0.8, 'Q2': 1.0, 'Q3': 0.9, 'Q4': 1.4 }
        }
      } as EnhancedScreen,
      {
        id: 'ui-test-screen-3',
        name: 'New Transit Digital Screen',
        location: 'Bogotá Sur',
        price: 250000,
        category: 'Digital Display',
        performanceMetrics: {
          screenId: 'ui-test-screen-3',
          bookingRate: 0.4,
          averageRating: 4.0,
          engagementScore: 0.6,
          revenueGenerated: 600000,
          impressionCount: 200,
          conversionRate: 0.2,
          lastUpdated: new Date(),
          trendDirection: 'up'
        },
        bookingFrequency: 'low',
        personalizedScore: 0.5,
        trendingScore: 0.9,
        recommendationScore: 0.65,
        sectionAssignment: 'new-discoveries',
        engagementMetrics: {
          viewTime: 90,
          interactionRate: 0.12,
          completionRate: 0.8,
          shareRate: 0.05,
          favoriteRate: 0.1,
          clickThroughRate: 0.14,
          bounceRate: 0.18
        },
        audienceInsights: {
          primaryDemographic: 'commuters',
          ageDistribution: { '18-24': 0.3, '25-34': 0.5, '35-44': 0.2 },
          genderDistribution: { 'male': 0.6, 'female': 0.4 },
          interestCategories: ['transportation', 'news'],
          peakEngagementHours: [8, 18],
          seasonalTrends: { 'Q1': 1.0, 'Q2': 1.0, 'Q3': 0.9, 'Q4': 1.1 }
        }
      } as EnhancedScreen
    ];

    // Create mock sections with different display types
    mockSections = [
      {
        id: 'top-picks-user123',
        title: 'Top picks for you',
        subtitle: 'Personalized recommendations based on your preferences',
        screens: [mockScreens[0]],
        displayType: 'featured',
        priority: 10,
        metadata: {
          algorithm: 'ml-personalized',
          confidence: 0.9,
          refreshInterval: 1800,
          trackingId: 'track-top-picks',
          generatedAt: new Date()
        }
      },
      {
        id: 'trending-general',
        title: 'Trending now',
        subtitle: 'Popular screens this week',
        screens: [mockScreens[1]],
        displayType: 'horizontal-scroll',
        priority: 8,
        metadata: {
          algorithm: 'trending-analysis',
          confidence: 0.8,
          refreshInterval: 900,
          trackingId: 'track-trending',
          generatedAt: new Date()
        }
      },
      {
        id: 'new-discoveries',
        title: 'New to discover',
        subtitle: 'Fresh screens matching your interests',
        screens: [mockScreens[2]],
        displayType: 'grid',
        priority: 7,
        metadata: {
          algorithm: 'new-discovery',
          confidence: 0.7,
          refreshInterval: 3600,
          trackingId: 'track-discoveries',
          generatedAt: new Date()
        }
      }
    ];
  });

  describe('MarketplaceSection Component', () => {
    it('should render section with featured display type correctly', () => {
      const featuredSection = mockSections[0];
      
      render(
        <MarketplaceSection
          section={featuredSection}
          onScreenClick={vi.fn()}
          onSectionView={vi.fn()}
        />
      );

      // Check section title and subtitle
      expect(screen.getByText('Top picks for you')).toBeInTheDocument();
      expect(screen.getByText('Personalized recommendations based on your preferences')).toBeInTheDocument();

      // Check screen is rendered
      expect(screen.getByText('Premium Downtown Billboard')).toBeInTheDocument();
      expect(screen.getByText('Bogotá Centro')).toBeInTheDocument();
      expect(screen.getByText('$600,000')).toBeInTheDocument();
    });

    it('should render section with horizontal scroll display type', () => {
      const horizontalSection = mockSections[1];
      
      render(
        <MarketplaceSection
          section={horizontalSection}
          onScreenClick={vi.fn()}
          onSectionView={vi.fn()}
        />
      );

      // Check section content
      expect(screen.getByText('Trending now')).toBeInTheDocument();
      expect(screen.getByText('Popular screens this week')).toBeInTheDocument();
      expect(screen.getByText('Shopping Mall LED Display')).toBeInTheDocument();

      // Check for horizontal scroll container
      const scrollContainer = screen.getByTestId('horizontal-scroll-container');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('overflow-x-auto');
    });

    it('should render section with grid display type', () => {
      const gridSection = mockSections[2];
      
      render(
        <MarketplaceSection
          section={gridSection}
          onScreenClick={vi.fn()}
          onSectionView={vi.fn()}
        />
      );

      // Check section content
      expect(screen.getByText('New to discover')).toBeInTheDocument();
      expect(screen.getByText('Fresh screens matching your interests')).toBeInTheDocument();
      expect(screen.getByText('New Transit Digital Screen')).toBeInTheDocument();

      // Check for grid layout
      const gridContainer = screen.getByTestId('grid-container');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid');
    });

    it('should handle screen click events', async () => {
      const onScreenClick = vi.fn();
      const section = mockSections[0];
      
      render(
        <MarketplaceSection
          section={section}
          onScreenClick={onScreenClick}
          onSectionView={vi.fn()}
        />
      );

      // Click on screen card
      const screenCard = screen.getByTestId('screen-card-ui-test-screen-1');
      fireEvent.click(screenCard);

      await waitFor(() => {
        expect(onScreenClick).toHaveBeenCalledWith(
          mockScreens[0],
          section.id
        );
      });
    });

    it('should track section view events', async () => {
      const onSectionView = vi.fn();
      const section = mockSections[0];
      
      render(
        <MarketplaceSection
          section={section}
          onScreenClick={vi.fn()}
          onSectionView={onSectionView}
        />
      );

      // Section should be viewed on mount
      await waitFor(() => {
        expect(onSectionView).toHaveBeenCalledWith(section.id);
      });
    });
  });

  describe('SectionedScreenGrid Component', () => {
    it('should render multiple sections with different display types', () => {
      render(
        <SectionedScreenGrid
          sections={mockSections}
          loading={false}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check all sections are rendered
      expect(screen.getByText('Top picks for you')).toBeInTheDocument();
      expect(screen.getByText('Trending now')).toBeInTheDocument();
      expect(screen.getByText('New to discover')).toBeInTheDocument();

      // Check all screens are rendered
      expect(screen.getByText('Premium Downtown Billboard')).toBeInTheDocument();
      expect(screen.getByText('Shopping Mall LED Display')).toBeInTheDocument();
      expect(screen.getByText('New Transit Digital Screen')).toBeInTheDocument();
    });

    it('should handle loading state correctly', () => {
      render(
        <SectionedScreenGrid
          sections={[]}
          loading={true}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check loading skeleton is displayed
      expect(screen.getByTestId('sections-loading-skeleton')).toBeInTheDocument();
      expect(screen.getAllByTestId('section-skeleton')).toHaveLength(3); // Default skeleton count
    });

    it('should handle error state correctly', () => {
      const error = new Error('Failed to load sections');
      
      render(
        <SectionedScreenGrid
          sections={[]}
          loading={false}
          error={error}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check error message is displayed
      expect(screen.getByText('Failed to load sections')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('should handle empty sections state', () => {
      render(
        <SectionedScreenGrid
          sections={[]}
          loading={false}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check empty state message
      expect(screen.getByText('No sections available')).toBeInTheDocument();
      expect(screen.getByText('Check back later for personalized recommendations')).toBeInTheDocument();
    });

    it('should handle section refresh', async () => {
      const onSectionRefresh = vi.fn();
      
      render(
        <SectionedScreenGrid
          sections={mockSections}
          loading={false}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={onSectionRefresh}
        />
      );

      // Find and click refresh button
      const refreshButton = screen.getByTestId('refresh-sections-button');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(onSectionRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('SectionScreenCard Component', () => {
    it('should render screen card with section-specific metadata', () => {
      const screen = mockScreens[0];
      
      render(
        <SectionScreenCard
          screen={screen}
          sectionId="top-picks-user123"
          onClick={vi.fn()}
          showSectionIndicator={true}
        />
      );

      // Check basic screen information
      expect(screen.getByText('Premium Downtown Billboard')).toBeInTheDocument();
      expect(screen.getByText('Bogotá Centro')).toBeInTheDocument();
      expect(screen.getByText('$600,000')).toBeInTheDocument();

      // Check section-specific indicators
      expect(screen.getByTestId('section-indicator')).toBeInTheDocument();
      expect(screen.getByText('Top Pick')).toBeInTheDocument(); // Section-specific label
    });

    it('should display trending indicators for trending screens', () => {
      const trendingScreen = {
        ...mockScreens[2],
        sectionAssignment: 'trending-general'
      };
      
      render(
        <SectionScreenCard
          screen={trendingScreen}
          sectionId="trending-general"
          onClick={vi.fn()}
          showSectionIndicator={true}
        />
      );

      // Check trending indicator
      expect(screen.getByTestId('trending-indicator')).toBeInTheDocument();
      expect(screen.getByText('Trending')).toBeInTheDocument();
    });

    it('should display new screen indicators', () => {
      const newScreen = {
        ...mockScreens[2],
        sectionAssignment: 'new-discoveries'
      };
      
      render(
        <SectionScreenCard
          screen={newScreen}
          sectionId="new-discoveries"
          onClick={vi.fn()}
          showSectionIndicator={true}
        />
      );

      // Check new indicator
      expect(screen.getByTestId('new-indicator')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should handle click events with section context', async () => {
      const onClick = vi.fn();
      const screen = mockScreens[0];
      
      render(
        <SectionScreenCard
          screen={screen}
          sectionId="top-picks-user123"
          onClick={onClick}
          showSectionIndicator={true}
        />
      );

      // Click on card
      const card = screen.getByTestId('section-screen-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(onClick).toHaveBeenCalledWith(screen, 'top-picks-user123');
      });
    });

    it('should display performance metrics when available', () => {
      const screenWithMetrics = mockScreens[0];
      
      render(
        <SectionScreenCard
          screen={screenWithMetrics}
          sectionId="top-picks-user123"
          onClick={vi.fn()}
          showPerformanceMetrics={true}
        />
      );

      // Check performance indicators
      expect(screen.getByText('4.5')).toBeInTheDocument(); // Rating
      expect(screen.getByText('High booking rate')).toBeInTheDocument();
      expect(screen.getByTestId('performance-indicator')).toBeInTheDocument();
    });
  });

  describe('Responsive Design and Mobile Layout', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <SectionedScreenGrid
          sections={mockSections}
          loading={false}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check mobile-specific classes are applied
      const mobileContainer = screen.getByTestId('mobile-sections-container');
      expect(mobileContainer).toBeInTheDocument();
      expect(mobileContainer).toHaveClass('mobile-layout');
    });

    it('should handle horizontal scrolling on mobile', () => {
      const horizontalSection = mockSections[1];
      
      render(
        <MarketplaceSection
          section={horizontalSection}
          onScreenClick={vi.fn()}
          onSectionView={vi.fn()}
          isMobile={true}
        />
      );

      // Check mobile scroll indicators
      expect(screen.getByTestId('scroll-indicator-left')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-indicator-right')).toBeInTheDocument();
    });

    it('should show appropriate number of cards per row on different screen sizes', () => {
      const gridSection = mockSections[2];
      
      // Desktop
      render(
        <MarketplaceSection
          section={gridSection}
          onScreenClick={vi.fn()}
          onSectionView={vi.fn()}
          screenSize="desktop"
        />
      );

      const desktopGrid = screen.getByTestId('grid-container');
      expect(desktopGrid).toHaveClass('grid-cols-4'); // 4 columns on desktop

      // Tablet
      render(
        <MarketplaceSection
          section={gridSection}
          onScreenClick={vi.fn()}
          onSectionView={vi.fn()}
          screenSize="tablet"
        />
      );

      const tabletGrid = screen.getByTestId('grid-container');
      expect(tabletGrid).toHaveClass('grid-cols-2'); // 2 columns on tablet

      // Mobile
      render(
        <MarketplaceSection
          section={gridSection}
          onScreenClick={vi.fn()}
          onSectionView={vi.fn()}
          screenSize="mobile"
        />
      );

      const mobileGrid = screen.getByTestId('grid-container');
      expect(mobileGrid).toHaveClass('grid-cols-1'); // 1 column on mobile
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should provide proper ARIA labels and roles', () => {
      render(
        <SectionedScreenGrid
          sections={mockSections}
          loading={false}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check ARIA labels
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText('Marketplace sections')).toBeInTheDocument();
      
      // Check section headings
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings).toHaveLength(3);
    });

    it('should support keyboard navigation', async () => {
      render(
        <SectionedScreenGrid
          sections={mockSections}
          loading={false}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check focusable elements
      const focusableElements = screen.getAllByRole('button');
      expect(focusableElements.length).toBeGreaterThan(0);

      // Test tab navigation
      const firstCard = screen.getByTestId('screen-card-ui-test-screen-1');
      firstCard.focus();
      expect(document.activeElement).toBe(firstCard);

      // Test Enter key activation
      fireEvent.keyDown(firstCard, { key: 'Enter', code: 'Enter' });
      // Should trigger click event
    });

    it('should provide screen reader friendly content', () => {
      const screen = mockScreens[0];
      
      render(
        <SectionScreenCard
          screen={screen}
          sectionId="top-picks-user123"
          onClick={vi.fn()}
          showSectionIndicator={true}
        />
      );

      // Check screen reader content
      expect(screen.getByLabelText(/Premium Downtown Billboard/)).toBeInTheDocument();
      expect(screen.getByText('Located in Bogotá Centro')).toBeInTheDocument();
      expect(screen.getByText('Price: $600,000')).toBeInTheDocument();
    });

    it('should handle reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <SectionedScreenGrid
          sections={mockSections}
          loading={false}
          error={null}
          onScreenClick={vi.fn()}
          onSectionRefresh={vi.fn()}
        />
      );

      // Check that animations are disabled
      const animatedElements = screen.getAllByTestId(/animated-/);
      animatedElements.forEach(element => {
        expect(element).toHaveClass('motion-reduce');
      });
    });
  });
});