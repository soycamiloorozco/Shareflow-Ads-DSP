/**
 * Deduplication Engine
 * Ensures screens appear only once across all marketplace sections
 * and handles screen priority assignment and backfilling
 */

import {
  MarketplaceSection,
  EnhancedScreen,
  ScreenPriority,
  DeduplicationResult,
  DeduplicationEngine as IDeduplicationEngine,
  AlgorithmType
} from '../types/intelligent-grouping.types';

export class DeduplicationEngine implements IDeduplicationEngine {
  private readonly sectionPriorityWeights: Record<string, number> = {
    'top-picks': 10,
    'recently-purchased': 9,
    'trending': 8,
    'top-in-city': 7,
    'new-discovery': 6,
    'similar-screens': 5,
    'popular': 4,
    'recommended': 3,
    'fallback': 1
  };

  private readonly algorithmPriorityWeights: Record<AlgorithmType, number> = {
    'ml-personalized': 10,
    'purchase-history': 9,
    'collaborative-filtering': 8,
    'trending-analysis': 7,
    'geographic-popularity': 6,
    'content-based': 5,
    'recent-activity': 4,
    'new-discovery': 3,
    'fallback-popular': 1
  };

  /**
   * Removes duplicate screens across sections while maintaining section integrity
   */
  async removeDuplicates(sections: MarketplaceSection[]): Promise<MarketplaceSection[]> {
    const startTime = Date.now();
    const seenScreens = new Set<string>();
    const duplicatesRemoved: string[] = [];
    const screensReassigned: string[] = [];

    // Sort sections by priority (highest first)
    const sortedSections = [...sections].sort((a, b) => b.priority - a.priority);
    
    const deduplicatedSections: MarketplaceSection[] = [];

    for (const section of sortedSections) {
      const uniqueScreens: EnhancedScreen[] = [];
      
      for (const screen of section.screens) {
        if (!seenScreens.has(screen.id)) {
          // First occurrence - assign to this section
          seenScreens.add(screen.id);
          uniqueScreens.push({
            ...screen,
            sectionAssignment: section.id
          });
        } else {
          // Duplicate found - check if this section has higher priority
          const currentAssignment = this.findScreenAssignment(screen.id, deduplicatedSections);
          if (currentAssignment) {
            const currentSectionPriority = this.getSectionPriority(currentAssignment.sectionId);
            const newSectionPriority = this.getSectionPriority(section.id);
            
            if (newSectionPriority > currentSectionPriority) {
              // Reassign to higher priority section
              this.removeScreenFromSection(screen.id, deduplicatedSections);
              uniqueScreens.push({
                ...screen,
                sectionAssignment: section.id
              });
              screensReassigned.push(screen.id);
            } else {
              duplicatesRemoved.push(screen.id);
            }
          } else {
            duplicatesRemoved.push(screen.id);
          }
        }
      }

      deduplicatedSections.push({
        ...section,
        screens: uniqueScreens
      });
    }

    const processingTime = Date.now() - startTime;

    // Log deduplication results
    console.log(`Deduplication completed in ${processingTime}ms:`, {
      duplicatesRemoved: duplicatesRemoved.length,
      screensReassigned: screensReassigned.length,
      totalSections: deduplicatedSections.length
    });

    return deduplicatedSections;
  }

  /**
   * Assigns screen to the most appropriate section based on priority scoring
   */
  async assignScreenPriority(screen: EnhancedScreen, sectionIds: string[]): Promise<string> {
    const priorities: Record<string, number> = {};
    
    for (const sectionId of sectionIds) {
      priorities[sectionId] = this.calculateScreenSectionScore(screen, sectionId);
    }

    // Find section with highest priority score
    const bestSection = Object.entries(priorities).reduce((best, [sectionId, score]) => {
      return score > best.score ? { sectionId, score } : best;
    }, { sectionId: sectionIds[0], score: priorities[sectionIds[0]] || 0 });

    return bestSection.sectionId;
  }

  /**
   * Backfills sections that fall below minimum screen requirements
   */
  async backfillSections(
    sections: MarketplaceSection[], 
    availableScreens: EnhancedScreen[]
  ): Promise<MarketplaceSection[]> {
    const backfilledSections: MarketplaceSection[] = [];
    const usedScreenIds = new Set<string>();

    // Collect all currently used screen IDs
    sections.forEach(section => {
      section.screens.forEach(screen => usedScreenIds.add(screen.id));
    });

    // Filter available screens to exclude already used ones
    let unusedScreens = availableScreens.filter(screen => !usedScreenIds.has(screen.id));

    for (const section of sections) {
      const currentScreenCount = section.screens.length;
      const minScreens = this.getMinScreensForSection(section.id);
      const maxScreens = this.getMaxScreensForSection(section.id);

      if (currentScreenCount < minScreens) {
        const screensNeeded = Math.min(minScreens - currentScreenCount, maxScreens - currentScreenCount);
        const backfillScreens = this.selectBackfillScreens(
          section,
          unusedScreens,
          screensNeeded
        );

        // Remove selected screens from unused pool to prevent reuse
        unusedScreens = unusedScreens.filter(screen => 
          !backfillScreens.some(selected => selected.id === screen.id)
        );

        backfilledSections.push({
          ...section,
          screens: [
            ...section.screens,
            ...backfillScreens.map(screen => ({
              ...screen,
              sectionAssignment: section.id
            }))
          ]
        });

        console.log(`Backfilled section ${section.id} with ${backfillScreens.length} screens`);
      } else {
        backfilledSections.push(section);
      }
    }

    return backfilledSections;
  }

  /**
   * Calculates relevance score for a screen in a specific section
   */
  private calculateScreenSectionScore(screen: EnhancedScreen, sectionId: string): number {
    let score = 0;

    // Base section priority
    score += this.getSectionPriority(sectionId) * 10;

    // Screen performance metrics
    if (screen.performanceMetrics) {
      score += screen.performanceMetrics.engagementScore * 5;
      score += screen.performanceMetrics.bookingRate * 3;
      score += screen.performanceMetrics.averageRating * 2;
    }

    // Personalization scores
    if (screen.personalizedScore) {
      score += screen.personalizedScore * 8;
    }

    if (screen.trendingScore) {
      score += screen.trendingScore * 6;
    }

    if (screen.recommendationScore) {
      score += screen.recommendationScore * 4;
    }

    // Booking frequency bonus
    const frequencyBonus = this.getBookingFrequencyScore(screen.bookingFrequency);
    score += frequencyBonus;

    // Recent activity bonus
    if (screen.lastBookingDate) {
      const daysSinceLastBooking = (Date.now() - screen.lastBookingDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastBooking < 7) {
        score += 5; // Recent booking bonus
      }
    }

    return Math.max(0, score);
  }

  /**
   * Gets priority weight for a section
   */
  private getSectionPriority(sectionId: string): number {
    // Extract section type from ID (e.g., 'top-picks-user123' -> 'top-picks')
    const sectionType = sectionId.split('-').slice(0, -1).join('-') || sectionId;
    return this.sectionPriorityWeights[sectionType] || 1;
  }

  /**
   * Gets booking frequency score
   */
  private getBookingFrequencyScore(frequency: string): number {
    const frequencyScores: Record<string, number> = {
      'very-high': 10,
      'high': 8,
      'medium': 5,
      'low': 3,
      'very-low': 1
    };
    return frequencyScores[frequency] || 0;
  }

  /**
   * Finds current section assignment for a screen
   */
  private findScreenAssignment(screenId: string, sections: MarketplaceSection[]): { sectionId: string; screen: EnhancedScreen } | null {
    for (const section of sections) {
      const screen = section.screens.find(s => s.id === screenId);
      if (screen) {
        return { sectionId: section.id, screen };
      }
    }
    return null;
  }

  /**
   * Removes screen from its current section
   */
  private removeScreenFromSection(screenId: string, sections: MarketplaceSection[]): void {
    for (const section of sections) {
      const screenIndex = section.screens.findIndex(s => s.id === screenId);
      if (screenIndex !== -1) {
        section.screens.splice(screenIndex, 1);
        break;
      }
    }
  }

  /**
   * Gets minimum screens required for a section
   */
  private getMinScreensForSection(sectionId: string): number {
    const minScreensConfig: Record<string, number> = {
      'top-picks': 3,
      'recently-purchased': 2,
      'trending': 4,
      'top-in-city': 4,
      'new-discovery': 3,
      'similar-screens': 3,
      'popular': 6,
      'recommended': 4
    };

    const sectionType = sectionId.split('-').slice(0, -1).join('-') || sectionId;
    return minScreensConfig[sectionType] || 3;
  }

  /**
   * Gets maximum screens allowed for a section
   */
  private getMaxScreensForSection(sectionId: string): number {
    const maxScreensConfig: Record<string, number> = {
      'top-picks': 6,
      'recently-purchased': 8,
      'trending': 12,
      'top-in-city': 10,
      'new-discovery': 8,
      'similar-screens': 6,
      'popular': 15,
      'recommended': 10
    };

    const sectionType = sectionId.split('-').slice(0, -1).join('-') || sectionId;
    return maxScreensConfig[sectionType] || 8;
  }

  /**
   * Selects appropriate screens for backfilling a section
   */
  private selectBackfillScreens(
    section: MarketplaceSection,
    availableScreens: EnhancedScreen[],
    count: number
  ): EnhancedScreen[] {
    // Score each available screen for this section
    const scoredScreens = availableScreens.map(screen => ({
      screen,
      score: this.calculateScreenSectionScore(screen, section.id)
    }));

    // Sort by score (highest first) and take the requested count
    return scoredScreens
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.screen);
  }

  /**
   * Creates a detailed priority assignment for a screen
   */
  async createScreenPriority(screen: EnhancedScreen, sectionIds: string[]): Promise<ScreenPriority> {
    const sectionPriorities: Record<string, number> = {};
    const reasons: string[] = [];

    for (const sectionId of sectionIds) {
      const score = this.calculateScreenSectionScore(screen, sectionId);
      sectionPriorities[sectionId] = score;
    }

    const finalAssignment = await this.assignScreenPriority(screen, sectionIds);
    const maxScore = Math.max(...Object.values(sectionPriorities));
    // Normalize confidence based on a reasonable maximum score (e.g., 300 for high-performing screens)
    const confidence = Math.min(maxScore / 300, 1);

    // Generate reasons for the assignment
    if (screen.personalizedScore && screen.personalizedScore > 0.7) {
      reasons.push('High personalization score');
    }
    if (screen.trendingScore && screen.trendingScore > 0.7) {
      reasons.push('Currently trending');
    }
    if (screen.performanceMetrics && screen.performanceMetrics.bookingRate > 0.5) {
      reasons.push('High booking rate');
    }
    if (screen.bookingFrequency === 'high' || screen.bookingFrequency === 'very-high') {
      reasons.push('Frequently booked');
    }

    return {
      screenId: screen.id,
      sectionPriorities,
      finalAssignment,
      confidence,
      reasons
    };
  }

  /**
   * Generates a comprehensive deduplication result
   */
  async processDeduplication(sections: MarketplaceSection[], availableScreens: EnhancedScreen[]): Promise<DeduplicationResult> {
    const startTime = Date.now();
    
    // Step 1: Remove duplicates
    const deduplicatedSections = await this.removeDuplicates(sections);
    
    // Step 2: Backfill sections
    const backfilledSections = await this.backfillSections(deduplicatedSections, availableScreens);
    
    const processingTime = Date.now() - startTime;
    
    // Calculate statistics
    const originalScreenCount = sections.reduce((sum, section) => sum + section.screens.length, 0);
    const finalScreenCount = backfilledSections.reduce((sum, section) => sum + section.screens.length, 0);
    const duplicatesRemoved = originalScreenCount - finalScreenCount;
    
    return {
      sections: backfilledSections,
      duplicatesRemoved: Math.max(0, duplicatesRemoved),
      screensReassigned: 0, // This would be tracked during the actual process
      backfillsApplied: finalScreenCount - (originalScreenCount - duplicatesRemoved),
      processingTime
    };
  }
}

export default DeduplicationEngine;