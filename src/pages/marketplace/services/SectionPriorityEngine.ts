/**
 * Section Priority Engine
 * Handles complex section priority scoring and screen-to-section assignment logic
 * Manages edge cases and maintains section balance
 */

import {
  MarketplaceSection,
  EnhancedScreen,
  ScreenPriority,
  AlgorithmType,
  UserProfile,
  SectionConfig
} from '../types/intelligent-grouping.types';

export interface SectionAssignmentResult {
  readonly assignments: Record<string, string>; // screenId -> sectionId
  readonly scores: Record<string, Record<string, number>>; // screenId -> sectionId -> score
  readonly conflicts: SectionConflict[];
  readonly balanceMetrics: SectionBalanceMetrics;
}

export interface SectionConflict {
  readonly screenId: string;
  readonly competingSections: string[];
  readonly resolution: 'priority' | 'relevance' | 'balance';
  readonly finalAssignment: string;
}

export interface SectionBalanceMetrics {
  readonly totalScreens: number;
  readonly sectionDistribution: Record<string, number>;
  readonly balanceScore: number; // 0-1, higher is more balanced
  readonly underfilledSections: string[];
  readonly overfilledSections: string[];
}

export interface SectionRelevanceFactors {
  readonly userPersonalization: number;
  readonly contentSimilarity: number;
  readonly performanceMetrics: number;
  readonly trendingSignals: number;
  readonly geographicRelevance: number;
  readonly temporalRelevance: number;
  readonly diversityBonus: number;
}

export class SectionPriorityEngine {
  private readonly sectionConfigs: Map<string, SectionConfig> = new Map();
  private readonly algorithmWeights: Record<AlgorithmType, number> = {
    'ml-personalized': 1.0,
    'purchase-history': 0.95,
    'collaborative-filtering': 0.9,
    'trending-analysis': 0.85,
    'geographic-popularity': 0.8,
    'content-based': 0.75,
    'recent-activity': 0.7,
    'new-discovery': 0.65,
    'fallback-popular': 0.5
  };

  constructor(sectionConfigs?: SectionConfig[]) {
    if (sectionConfigs) {
      sectionConfigs.forEach(config => {
        this.sectionConfigs.set(config.id, config);
      });
    }
  }

  /**
   * Creates comprehensive priority scoring system for section placement decisions
   */
  async calculateSectionPriorities(
    screen: EnhancedScreen,
    sections: MarketplaceSection[],
    userProfile?: UserProfile
  ): Promise<Record<string, number>> {
    const priorities: Record<string, number> = {};

    for (const section of sections) {
      const relevanceFactors = await this.calculateRelevanceFactors(screen, section, userProfile);
      const sectionWeight = this.getSectionWeight(section);
      const algorithmWeight = this.algorithmWeights[section.metadata.algorithm] || 0.5;
      
      // Combine all factors into final priority score
      priorities[section.id] = this.combinePriorityFactors(
        relevanceFactors,
        sectionWeight,
        algorithmWeight,
        section.metadata.confidence
      );
    }

    return priorities;
  }

  /**
   * Implements screen-to-section assignment based on relevance scores
   */
  async assignScreensToSections(
    screens: EnhancedScreen[],
    sections: MarketplaceSection[],
    userProfile?: UserProfile
  ): Promise<SectionAssignmentResult> {
    const assignments: Record<string, string> = {};
    const scores: Record<string, Record<string, number>> = {};
    const conflicts: SectionConflict[] = [];

    // Calculate scores for all screen-section combinations
    for (const screen of screens) {
      const sectionScores = await this.calculateSectionPriorities(screen, sections, userProfile);
      scores[screen.id] = sectionScores;
    }

    // Assign screens using priority-based algorithm with conflict resolution
    const assignmentResult = await this.resolveAssignments(screens, sections, scores);
    
    // Calculate balance metrics
    const balanceMetrics = this.calculateBalanceMetrics(assignmentResult.assignments, sections);

    return {
      assignments: assignmentResult.assignments,
      scores,
      conflicts: assignmentResult.conflicts,
      balanceMetrics
    };
  }

  /**
   * Handles edge cases and maintains section balance
   */
  async handleEdgeCases(
    assignmentResult: SectionAssignmentResult,
    screens: EnhancedScreen[],
    sections: MarketplaceSection[]
  ): Promise<SectionAssignmentResult> {
    let { assignments, scores, conflicts, balanceMetrics } = assignmentResult;

    // Handle underfilled sections
    if (balanceMetrics.underfilledSections.length > 0) {
      const rebalancedAssignments = await this.rebalanceUnderfilledSections(
        assignments,
        scores,
        screens,
        sections,
        balanceMetrics.underfilledSections
      );
      assignments = rebalancedAssignments.assignments;
      conflicts = [...conflicts, ...rebalancedAssignments.conflicts];
    }

    // Handle overfilled sections
    if (balanceMetrics.overfilledSections.length > 0) {
      const redistributedAssignments = await this.redistributeOverfilledSections(
        assignments,
        scores,
        screens,
        sections,
        balanceMetrics.overfilledSections
      );
      assignments = redistributedAssignments.assignments;
      conflicts = [...conflicts, ...redistributedAssignments.conflicts];
    }

    // Recalculate balance metrics after adjustments
    const finalBalanceMetrics = this.calculateBalanceMetrics(assignments, sections);

    return {
      assignments,
      scores,
      conflicts,
      balanceMetrics: finalBalanceMetrics
    };
  }

  /**
   * Calculates relevance factors for a screen in a specific section
   */
  private async calculateRelevanceFactors(
    screen: EnhancedScreen,
    section: MarketplaceSection,
    userProfile?: UserProfile
  ): Promise<SectionRelevanceFactors> {
    const factors: SectionRelevanceFactors = {
      userPersonalization: this.calculateUserPersonalizationScore(screen, section, userProfile),
      contentSimilarity: this.calculateContentSimilarityScore(screen, section),
      performanceMetrics: this.calculatePerformanceScore(screen, section),
      trendingSignals: this.calculateTrendingScore(screen, section),
      geographicRelevance: this.calculateGeographicRelevance(screen, section, userProfile),
      temporalRelevance: this.calculateTemporalRelevance(screen, section),
      diversityBonus: this.calculateDiversityBonus(screen, section)
    };

    return factors;
  }

  /**
   * Calculates user personalization score
   */
  private calculateUserPersonalizationScore(
    screen: EnhancedScreen,
    section: MarketplaceSection,
    userProfile?: UserProfile
  ): number {
    if (!userProfile || !screen.personalizedScore) {
      return 0.5; // Neutral score for anonymous users
    }

    let score = screen.personalizedScore;

    // Boost score for sections that match user preferences
    if (section.metadata.algorithm === 'ml-personalized') {
      score *= 1.2;
    }

    // Consider user's preferred categories
    if (userProfile.preferredCategories.length > 0) {
      const categoryMatch = userProfile.preferredCategories.some(
        pref => pref.categoryName.toLowerCase() === screen.category?.toLowerCase()
      );
      if (categoryMatch) {
        score *= 1.1;
      }
    }

    // Consider user's budget range
    if (userProfile.budgetRange) {
      const priceInRange = screen.price >= userProfile.budgetRange.min && 
                          screen.price <= userProfile.budgetRange.max;
      if (priceInRange) {
        score *= 1.05;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculates content similarity score
   */
  private calculateContentSimilarityScore(screen: EnhancedScreen, section: MarketplaceSection): number {
    let score = 0.5; // Base score

    // Check if screen matches section's algorithm intent
    switch (section.metadata.algorithm) {
      case 'content-based':
        // Higher score for screens with similar characteristics to section's existing screens
        if (section.screens.length > 0) {
          const avgPrice = section.screens.reduce((sum, s) => sum + s.price, 0) / section.screens.length;
          const priceSimilarity = 1 - Math.abs(screen.price - avgPrice) / Math.max(screen.price, avgPrice);
          score = priceSimilarity * 0.8 + 0.2;
        }
        break;
      
      case 'geographic-popularity':
        // Higher score for screens in popular locations
        if (screen.performanceMetrics && screen.performanceMetrics.engagementScore > 0.7) {
          score = 0.8;
        }
        break;
      
      case 'new-discovery':
        // Higher score for recently added screens
        const daysSinceAdded = screen.lastBookingDate ? 
          (Date.now() - screen.lastBookingDate.getTime()) / (1000 * 60 * 60 * 24) : 30;
        score = Math.max(0.2, 1 - (daysSinceAdded / 30));
        break;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculates performance-based score
   */
  private calculatePerformanceScore(screen: EnhancedScreen, section: MarketplaceSection): number {
    const metrics = screen.performanceMetrics;
    if (!metrics) return 0.5;

    // Weight different performance metrics based on section type
    let score = 0;
    
    switch (section.metadata.algorithm) {
      case 'trending-analysis':
        score = metrics.engagementScore * 0.4 + 
                metrics.bookingRate * 0.4 + 
                metrics.conversionRate * 0.2;
        break;
      
      case 'ml-personalized':
        score = metrics.averageRating * 0.2 + 
                metrics.engagementScore * 0.3 + 
                metrics.conversionRate * 0.3 + 
                metrics.bookingRate * 0.2;
        break;
      
      default:
        score = (metrics.bookingRate + metrics.engagementScore + metrics.conversionRate) / 3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculates trending signals score
   */
  private calculateTrendingScore(screen: EnhancedScreen, section: MarketplaceSection): number {
    if (!screen.trendingScore) return 0.5;

    let score = screen.trendingScore;

    // Boost for trending-focused sections
    if (section.metadata.algorithm === 'trending-analysis') {
      score *= 1.3;
    }

    // Consider recent booking activity
    if (screen.lastBookingDate) {
      const daysSinceBooking = (Date.now() - screen.lastBookingDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceBooking < 7) {
        score *= 1.1; // Recent activity bonus
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculates geographic relevance
   */
  private calculateGeographicRelevance(
    screen: EnhancedScreen,
    section: MarketplaceSection,
    userProfile?: UserProfile
  ): number {
    let score = 0.5; // Base score

    // Check if section is location-specific
    if (section.id.includes('city') || section.metadata.algorithm === 'geographic-popularity') {
      // Higher score for screens in user's preferred locations
      if (userProfile?.locationPreferences.length) {
        const locationMatch = userProfile.locationPreferences.some(
          pref => screen.location.toLowerCase().includes(pref.city.toLowerCase())
        );
        if (locationMatch) {
          score = 0.9;
        }
      }
    }

    return score;
  }

  /**
   * Calculates temporal relevance
   */
  private calculateTemporalRelevance(screen: EnhancedScreen, section: MarketplaceSection): number {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if screen has peak engagement hours that match current time
    if (screen.audienceInsights.peakEngagementHours.includes(currentHour)) {
      return 0.8;
    }

    return 0.5;
  }

  /**
   * Calculates diversity bonus to prevent homogeneous sections
   */
  private calculateDiversityBonus(screen: EnhancedScreen, section: MarketplaceSection): number {
    if (section.screens.length === 0) return 0.5;

    // Check category diversity
    const existingCategories = new Set(section.screens.map(s => s.category));
    if (!existingCategories.has(screen.category)) {
      return 0.7; // Bonus for adding category diversity
    }

    // Check price range diversity
    const existingPrices = section.screens.map(s => s.price);
    const avgPrice = existingPrices.reduce((sum, p) => sum + p, 0) / existingPrices.length;
    const priceDifference = Math.abs(screen.price - avgPrice) / avgPrice;
    
    if (priceDifference > 0.3) {
      return 0.6; // Bonus for price diversity
    }

    return 0.4; // Penalty for too much similarity
  }

  /**
   * Gets section weight based on priority and configuration
   */
  private getSectionWeight(section: MarketplaceSection): number {
    const config = this.sectionConfigs.get(section.id);
    if (config) {
      return config.priority / 10; // Normalize to 0-1 range
    }
    
    return section.priority / 10;
  }

  /**
   * Combines all priority factors into final score
   */
  private combinePriorityFactors(
    factors: SectionRelevanceFactors,
    sectionWeight: number,
    algorithmWeight: number,
    confidence: number
  ): number {
    const weightedScore = 
      factors.userPersonalization * 0.25 +
      factors.contentSimilarity * 0.20 +
      factors.performanceMetrics * 0.20 +
      factors.trendingSignals * 0.15 +
      factors.geographicRelevance * 0.10 +
      factors.temporalRelevance * 0.05 +
      factors.diversityBonus * 0.05;

    return weightedScore * sectionWeight * algorithmWeight * confidence;
  }

  /**
   * Resolves screen assignments with conflict handling
   */
  private async resolveAssignments(
    screens: EnhancedScreen[],
    sections: MarketplaceSection[],
    scores: Record<string, Record<string, number>>
  ): Promise<{ assignments: Record<string, string>; conflicts: SectionConflict[] }> {
    const assignments: Record<string, string> = {};
    const conflicts: SectionConflict[] = [];
    const sectionCapacities = this.calculateSectionCapacities(sections);

    // Sort screens by their highest section score (most confident assignments first)
    const sortedScreens = screens.sort((a, b) => {
      const maxScoreA = Math.max(...Object.values(scores[a.id] || {}));
      const maxScoreB = Math.max(...Object.values(scores[b.id] || {}));
      return maxScoreB - maxScoreA;
    });

    for (const screen of sortedScreens) {
      const screenScores = scores[screen.id] || {};
      const sortedSections = Object.entries(screenScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

      let assigned = false;
      const competingSections: string[] = [];

      for (const [sectionId, score] of sortedSections) {
        competingSections.push(sectionId);
        
        if (sectionCapacities[sectionId] > 0) {
          assignments[screen.id] = sectionId;
          sectionCapacities[sectionId]--;
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        // Check if this creates a conflict (screen wanted by multiple sections but couldn't fit)
        if (competingSections.length > 1) {
          conflicts.push({
            screenId: screen.id,
            competingSections,
            resolution: 'priority',
            finalAssignment: competingSections[0] // Assign to highest scoring section anyway
          });
        }
        
        // Assign to highest scoring section regardless of capacity for now
        assignments[screen.id] = competingSections[0] || sections[0].id;
      }
    }

    return { assignments, conflicts };
  }

  /**
   * Calculates section capacities based on configuration
   */
  private calculateSectionCapacities(sections: MarketplaceSection[]): Record<string, number> {
    const capacities: Record<string, number> = {};
    
    sections.forEach(section => {
      const config = this.sectionConfigs.get(section.id);
      const maxScreens = config?.maxScreens || this.getDefaultMaxScreens(section.id);
      const currentCount = section.screens.length;
      capacities[section.id] = Math.max(0, maxScreens - currentCount);
    });

    return capacities;
  }

  /**
   * Gets default maximum screens for a section
   */
  private getDefaultMaxScreens(sectionId: string): number {
    const sectionType = sectionId.split('-')[0];
    const defaults: Record<string, number> = {
      'top': 6,
      'trending': 12,
      'popular': 15,
      'new': 8,
      'recommended': 10
    };
    return defaults[sectionType] || 8;
  }

  /**
   * Calculates balance metrics for current assignments
   */
  private calculateBalanceMetrics(
    assignments: Record<string, string>,
    sections: MarketplaceSection[]
  ): SectionBalanceMetrics {
    const sectionDistribution: Record<string, number> = {};
    const totalScreens = Object.keys(assignments).length;

    // Initialize distribution
    sections.forEach(section => {
      sectionDistribution[section.id] = 0;
    });

    // Count assignments per section
    Object.values(assignments).forEach(sectionId => {
      sectionDistribution[sectionId] = (sectionDistribution[sectionId] || 0) + 1;
    });

    // Calculate balance score (lower variance = higher balance)
    const counts = Object.values(sectionDistribution);
    const avgCount = totalScreens / sections.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / counts.length;
    const balanceScore = Math.max(0, 1 - (variance / (avgCount * avgCount)));

    // Identify problematic sections
    const underfilledSections: string[] = [];
    const overfilledSections: string[] = [];

    sections.forEach(section => {
      const config = this.sectionConfigs.get(section.id);
      const minScreens = config?.minScreens || 3;
      const maxScreens = config?.maxScreens || this.getDefaultMaxScreens(section.id);
      const currentCount = sectionDistribution[section.id] || 0;

      if (currentCount < minScreens) {
        underfilledSections.push(section.id);
      } else if (currentCount > maxScreens) {
        overfilledSections.push(section.id);
      }
    });

    return {
      totalScreens,
      sectionDistribution,
      balanceScore,
      underfilledSections,
      overfilledSections
    };
  }

  /**
   * Rebalances underfilled sections
   */
  private async rebalanceUnderfilledSections(
    assignments: Record<string, string>,
    scores: Record<string, Record<string, number>>,
    screens: EnhancedScreen[],
    sections: MarketplaceSection[],
    underfilledSections: string[]
  ): Promise<{ assignments: Record<string, string>; conflicts: SectionConflict[] }> {
    const newAssignments = { ...assignments };
    const conflicts: SectionConflict[] = [];

    // For each underfilled section, try to reassign screens from overfilled sections
    for (const sectionId of underfilledSections) {
      const config = this.sectionConfigs.get(sectionId);
      const minScreens = config?.minScreens || 3;
      const currentCount = Object.values(newAssignments).filter(id => id === sectionId).length;
      const needed = minScreens - currentCount;

      if (needed > 0) {
        // Find screens that could be reassigned to this section
        const candidates = screens.filter(screen => {
          const currentAssignment = newAssignments[screen.id];
          const currentScore = scores[screen.id]?.[currentAssignment] || 0;
          const targetScore = scores[screen.id]?.[sectionId] || 0;
          
          // Only consider if target section score is reasonably close
          return targetScore >= currentScore * 0.8;
        });

        // Sort by score difference (prefer screens that fit well in target section)
        candidates.sort((a, b) => {
          const scoreA = scores[a.id]?.[sectionId] || 0;
          const scoreB = scores[b.id]?.[sectionId] || 0;
          return scoreB - scoreA;
        });

        // Reassign up to needed count
        for (let i = 0; i < Math.min(needed, candidates.length); i++) {
          const screen = candidates[i];
          const oldAssignment = newAssignments[screen.id];
          newAssignments[screen.id] = sectionId;

          conflicts.push({
            screenId: screen.id,
            competingSections: [oldAssignment, sectionId],
            resolution: 'balance',
            finalAssignment: sectionId
          });
        }
      }
    }

    return { assignments: newAssignments, conflicts };
  }

  /**
   * Redistributes overfilled sections
   */
  private async redistributeOverfilledSections(
    assignments: Record<string, string>,
    scores: Record<string, Record<string, number>>,
    screens: EnhancedScreen[],
    sections: MarketplaceSection[],
    overfilledSections: string[]
  ): Promise<{ assignments: Record<string, string>; conflicts: SectionConflict[] }> {
    const newAssignments = { ...assignments };
    const conflicts: SectionConflict[] = [];

    // For each overfilled section, move lowest-scoring screens to better-fitting sections
    for (const sectionId of overfilledSections) {
      const config = this.sectionConfigs.get(sectionId);
      const maxScreens = config?.maxScreens || this.getDefaultMaxScreens(sectionId);
      const currentScreens = screens.filter(screen => newAssignments[screen.id] === sectionId);
      const excess = currentScreens.length - maxScreens;

      if (excess > 0) {
        // Sort screens by their score in current section (lowest first)
        currentScreens.sort((a, b) => {
          const scoreA = scores[a.id]?.[sectionId] || 0;
          const scoreB = scores[b.id]?.[sectionId] || 0;
          return scoreA - scoreB;
        });

        // Move excess screens to better sections
        for (let i = 0; i < excess; i++) {
          const screen = currentScreens[i];
          const screenScores = scores[screen.id] || {};
          
          // Find best alternative section
          const alternatives = Object.entries(screenScores)
            .filter(([altSectionId]) => altSectionId !== sectionId)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

          if (alternatives.length > 0) {
            const [bestAltSection] = alternatives[0];
            newAssignments[screen.id] = bestAltSection;

            conflicts.push({
              screenId: screen.id,
              competingSections: [sectionId, bestAltSection],
              resolution: 'balance',
              finalAssignment: bestAltSection
            });
          }
        }
      }
    }

    return { assignments: newAssignments, conflicts };
  }
}

export default SectionPriorityEngine;