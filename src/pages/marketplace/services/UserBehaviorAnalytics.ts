/**
 * User Behavior Analytics Service
 * Tracks and analyzes user interactions for personalized marketplace experience
 */

import { 
  UserInteraction, 
  UserProfile, 
  InteractionAction, 
  InteractionContext,
  InteractionMetadata,
  DeviceInfo,
  UserInteractionSummary,
  PurchaseProfile,
  CategoryPreference,
  LocationPreference,
  createEmptyUserProfile
} from '../types/intelligent-grouping.types';
import { CacheService } from './CacheService';

export interface UserSession {
  readonly sessionId: string;
  readonly userId: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly interactions: UserInteraction[];
  readonly deviceInfo: DeviceInfo;
  readonly totalDuration: number;
  readonly pageViews: number;
  readonly isActive: boolean;
}

export interface BehaviorAnalyticsConfig {
  readonly sessionTimeoutMinutes: number;
  readonly maxInteractionsPerSession: number;
  readonly enableRealTimeTracking: boolean;
  readonly batchSize: number;
  readonly flushIntervalMs: number;
}

export class UserBehaviorAnalytics {
  private interactions: Map<string, UserInteraction[]> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private config: BehaviorAnalyticsConfig;
  private flushTimer?: NodeJS.Timeout;
  private cacheService: CacheService;

  constructor(config?: Partial<BehaviorAnalyticsConfig>, cacheService?: CacheService) {
    this.config = {
      sessionTimeoutMinutes: 30,
      maxInteractionsPerSession: 1000,
      enableRealTimeTracking: true,
      batchSize: 50,
      flushIntervalMs: 30000, // 30 seconds
      ...config
    };

    this.cacheService = cacheService || new CacheService({
      enableBackgroundRefresh: true,
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      defaultTTL: 60 * 60 * 1000, // 1 hour for user profiles
      maxMemoryItems: 1000,
      enableMetrics: true
    });

    if (this.config.enableRealTimeTracking) {
      this.startFlushTimer();
    }
  }

  /**
   * Track a user interaction
   */
  async trackInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<void> {
    const fullInteraction: UserInteraction = {
      ...interaction,
      id: this.generateInteractionId(),
      timestamp: new Date()
    };

    // Add to user's interaction list
    const userInteractions = this.interactions.get(interaction.userId) || [];
    userInteractions.push(fullInteraction);
    this.interactions.set(interaction.userId, userInteractions);

    // Update or create session
    await this.updateSession(fullInteraction);

    // Update user profile in real-time
    if (this.config.enableRealTimeTracking) {
      await this.updateUserProfileFromInteraction(fullInteraction);
    }

    // Invalidate cache based on interaction
    await this.cacheService.invalidateOnUserInteraction(fullInteraction);

    // Log interaction for debugging
    console.debug('Interaction tracked:', {
      userId: interaction.userId,
      action: interaction.action,
      screenId: interaction.screenId,
      section: interaction.context.section
    });
  }

  /**
   * Get user profile with behavior analysis
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    // Check cache first
    let profile = await this.cacheService.getUserProfile(userId);
    
    if (!profile) {
      // Check memory cache
      profile = this.userProfiles.get(userId);
      
      if (!profile) {
        profile = await this.buildUserProfile(userId);
        this.userProfiles.set(userId, profile);
      }
      
      // Cache the profile
      await this.cacheService.cacheUserProfile(userId, profile);
    }

    return profile;
  }

  /**
   * Generate mock user profile for testing/demo purposes
   */
  generateMockUserProfile(userId: string): UserProfile {
    const mockCategories: CategoryPreference[] = [
      {
        categoryId: 'billboard',
        categoryName: 'Vallas',
        score: 85,
        interactionCount: 15,
        lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        conversionRate: 0.2
      },
      {
        categoryId: 'mall',
        categoryName: 'Centros Comerciales',
        score: 70,
        interactionCount: 8,
        lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        conversionRate: 0.15
      },
      {
        categoryId: 'stadium',
        categoryName: 'Estadios',
        score: 60,
        interactionCount: 5,
        lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        conversionRate: 0.4
      }
    ];

    const mockLocations: LocationPreference[] = [
      {
        city: 'Bogotá',
        region: 'Cundinamarca',
        score: 90,
        interactionCount: 20,
        purchaseCount: 3,
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        city: 'Medellín',
        region: 'Antioquia',
        score: 65,
        interactionCount: 8,
        purchaseCount: 1,
        lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockInteractionSummary: UserInteractionSummary = {
      totalInteractions: 28,
      averageSessionDuration: 180000, // 3 minutes
      mostActiveTimeOfDay: 14, // 2 PM
      preferredDeviceType: 'desktop',
      engagementRate: 3.5,
      lastInteractionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };

    const mockPurchaseProfile: PurchaseProfile = {
      totalPurchases: 4,
      totalSpent: 3200000,
      averageOrderValue: 800000,
      preferredPurchaseType: ['daily', 'weekly'],
      seasonalPatterns: {
        'spring': 1,
        'summer': 2,
        'fall': 1,
        'winter': 0
      },
      lastPurchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      purchaseFrequency: 'medium'
    };

    return {
      userId,
      preferredCategories: mockCategories,
      budgetRange: {
        min: 300000,
        max: 1500000,
        preferred: 800000,
        currency: 'COP',
        confidence: 0.8
      },
      locationPreferences: mockLocations,
      behaviorScore: 75,
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      interactionHistory: mockInteractionSummary,
      purchaseProfile: mockPurchaseProfile,
      preferences: createEmptyUserProfile(userId).preferences
    };
  }

  /**
   * Get user interactions within a time range
   */
  async getUserInteractions(
    userId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<UserInteraction[]> {
    const userInteractions = this.interactions.get(userId) || [];
    
    if (!startDate && !endDate) {
      return userInteractions;
    }

    return userInteractions.filter(interaction => {
      const timestamp = interaction.timestamp;
      const afterStart = !startDate || timestamp >= startDate;
      const beforeEnd = !endDate || timestamp <= endDate;
      return afterStart && beforeEnd;
    });
  }

  /**
   * Get current user session
   */
  async getCurrentSession(userId: string): Promise<UserSession | null> {
    const sessions = Array.from(this.sessions.values());
    const userSession = sessions.find(session => 
      session.userId === userId && session.isActive
    );

    if (userSession && this.isSessionExpired(userSession)) {
      await this.endSession(userSession.sessionId);
      return null;
    }

    return userSession || null;
  }

  /**
   * Start a new user session
   */
  async startSession(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    // End any existing active session
    const existingSession = await this.getCurrentSession(userId);
    if (existingSession) {
      await this.endSession(existingSession.sessionId);
    }

    const sessionId = this.generateSessionId();
    const session: UserSession = {
      sessionId,
      userId,
      startTime: new Date(),
      interactions: [],
      deviceInfo,
      totalDuration: 0,
      pageViews: 1,
      isActive: true
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * End a user session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const endTime = new Date();
    const totalDuration = endTime.getTime() - session.startTime.getTime();

    const updatedSession: UserSession = {
      ...session,
      endTime,
      totalDuration,
      isActive: false
    };

    this.sessions.set(sessionId, updatedSession);

    // Update user profile with session data
    await this.updateUserProfileFromSession(updatedSession);
  }

  /**
   * Get interaction summary for a user
   */
  async getInteractionSummary(userId: string, days: number = 30): Promise<UserInteractionSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const interactions = await this.getUserInteractions(userId, startDate);
    const sessions = this.getUserSessions(userId, startDate);

    const totalInteractions = interactions.length;
    const averageSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.totalDuration, 0) / sessions.length
      : 0;

    // Calculate most active time of day
    const hourCounts = new Array(24).fill(0);
    interactions.forEach(interaction => {
      const hour = interaction.timestamp.getHours();
      hourCounts[hour]++;
    });
    const mostActiveTimeOfDay = hourCounts.indexOf(Math.max(...hourCounts));

    // Calculate preferred device type
    const deviceCounts: Record<string, number> = {};
    sessions.forEach(session => {
      const deviceType = session.deviceInfo.type;
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
    });
    const preferredDeviceType = Object.keys(deviceCounts).reduce((a, b) => 
      deviceCounts[a] > deviceCounts[b] ? a : b, 'desktop'
    );

    // Calculate engagement rate (interactions per session)
    const engagementRate = sessions.length > 0 ? totalInteractions / sessions.length : 0;

    const lastInteractionDate = interactions.length > 0 
      ? new Date(Math.max(...interactions.map(i => i.timestamp.getTime())))
      : new Date();

    return {
      totalInteractions,
      averageSessionDuration,
      mostActiveTimeOfDay,
      preferredDeviceType,
      engagementRate,
      lastInteractionDate
    };
  }

  /**
   * Calculate category preferences based on interactions
   */
  async getCategoryPreferences(userId: string): Promise<CategoryPreference[]> {
    const interactions = await this.getUserInteractions(userId);
    const categoryStats: Record<string, {
      interactions: number;
      purchases: number;
      lastInteraction: Date;
    }> = {};

    interactions.forEach(interaction => {
      // Extract category from screen metadata or context
      const category = this.extractCategoryFromInteraction(interaction);
      if (!category) return;

      if (!categoryStats[category]) {
        categoryStats[category] = {
          interactions: 0,
          purchases: 0,
          lastInteraction: interaction.timestamp
        };
      }

      categoryStats[category].interactions++;
      if (interaction.action === 'purchase') {
        categoryStats[category].purchases++;
      }
      
      if (interaction.timestamp > categoryStats[category].lastInteraction) {
        categoryStats[category].lastInteraction = interaction.timestamp;
      }
    });

    return Object.entries(categoryStats).map(([categoryId, stats]) => ({
      categoryId,
      categoryName: this.getCategoryName(categoryId),
      score: this.calculateCategoryScore(stats.interactions, stats.purchases),
      interactionCount: stats.interactions,
      lastInteraction: stats.lastInteraction,
      conversionRate: stats.interactions > 0 ? stats.purchases / stats.interactions : 0
    })).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate location preferences based on interactions
   */
  async getLocationPreferences(userId: string): Promise<LocationPreference[]> {
    const interactions = await this.getUserInteractions(userId);
    const locationStats: Record<string, {
      interactions: number;
      purchases: number;
      lastActivity: Date;
    }> = {};

    interactions.forEach(interaction => {
      const location = this.extractLocationFromInteraction(interaction);
      if (!location) return;

      const key = `${location.city}-${location.region}`;
      if (!locationStats[key]) {
        locationStats[key] = {
          interactions: 0,
          purchases: 0,
          lastActivity: interaction.timestamp
        };
      }

      locationStats[key].interactions++;
      if (interaction.action === 'purchase') {
        locationStats[key].purchases++;
      }
      
      if (interaction.timestamp > locationStats[key].lastActivity) {
        locationStats[key].lastActivity = interaction.timestamp;
      }
    });

    return Object.entries(locationStats).map(([locationKey, stats]) => {
      const [city, region] = locationKey.split('-');
      return {
        city,
        region,
        score: this.calculateLocationScore(stats.interactions, stats.purchases),
        interactionCount: stats.interactions,
        purchaseCount: stats.purchases,
        lastActivity: stats.lastActivity
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Clean up expired sessions and old data
   */
  async cleanup(): Promise<void> {
    const now = new Date();
    const expiredSessions: string[] = [];

    // Find expired sessions
    this.sessions.forEach((session, sessionId) => {
      if (this.isSessionExpired(session)) {
        expiredSessions.push(sessionId);
      }
    });

    // End expired sessions
    for (const sessionId of expiredSessions) {
      await this.endSession(sessionId);
    }

    // Clean up old interaction data (keep last 90 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    this.interactions.forEach((interactions, userId) => {
      const filteredInteractions = interactions.filter(
        interaction => interaction.timestamp >= cutoffDate
      );
      this.interactions.set(userId, filteredInteractions);
    });
  }

  /**
   * Get analytics metrics for debugging
   */
  getAnalyticsMetrics(): {
    totalUsers: number;
    totalInteractions: number;
    activeSessions: number;
    averageInteractionsPerUser: number;
  } {
    const totalUsers = this.interactions.size;
    const totalInteractions = Array.from(this.interactions.values())
      .reduce((sum, interactions) => sum + interactions.length, 0);
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.isActive).length;
    const averageInteractionsPerUser = totalUsers > 0 ? totalInteractions / totalUsers : 0;

    return {
      totalUsers,
      totalInteractions,
      activeSessions,
      averageInteractionsPerUser
    };
  }

  // Private helper methods

  private async updateSession(interaction: UserInteraction): Promise<void> {
    const existingSession = await this.getCurrentSession(interaction.userId);
    
    if (existingSession) {
      // Update existing session
      existingSession.interactions.push(interaction);
      if (interaction.context.pageUrl) {
        existingSession.pageViews++;
      }
      this.sessions.set(existingSession.sessionId, existingSession);
    } else {
      // Create new session
      const deviceInfo = interaction.context.deviceInfo;
      await this.startSession(interaction.userId, deviceInfo);
      const newSession = await this.getCurrentSession(interaction.userId);
      if (newSession) {
        newSession.interactions.push(interaction);
        this.sessions.set(newSession.sessionId, newSession);
      }
    }
  }

  private async buildUserProfile(userId: string): Promise<UserProfile> {
    const interactions = await this.getUserInteractions(userId);
    
    // For demo purposes, if no interactions exist, generate mock profile
    if (interactions.length === 0) {
      // For anonymous users or users without data, generate mock profile for demo
      if (userId === 'anonymous' || userId.startsWith('demo-') || Math.random() > 0.5) {
        return this.generateMockUserProfile(userId);
      }
      return createEmptyUserProfile(userId);
    }

    const interactionSummary = await this.getInteractionSummary(userId);
    const categoryPreferences = await this.getCategoryPreferences(userId);
    const locationPreferences = await this.getLocationPreferences(userId);
    const purchaseProfile = this.calculatePurchaseProfile(interactions);
    const behaviorScore = this.calculateBehaviorScore(interactions, interactionSummary);
    const budgetRange = this.calculateBudgetRange(interactions);

    const profile: UserProfile = {
      userId,
      preferredCategories: categoryPreferences,
      budgetRange,
      locationPreferences,
      behaviorScore,
      lastActivity: interactionSummary.lastInteractionDate,
      interactionHistory: interactionSummary,
      purchaseProfile,
      preferences: createEmptyUserProfile(userId).preferences
    };

    return profile;
  }

  private async updateUserProfileFromInteraction(interaction: UserInteraction): Promise<void> {
    const profile = await this.getUserProfile(interaction.userId);
    
    // Update last activity
    const updatedProfile: UserProfile = {
      ...profile,
      lastActivity: interaction.timestamp,
      behaviorScore: this.incrementalBehaviorScoreUpdate(profile.behaviorScore, interaction)
    };

    this.userProfiles.set(interaction.userId, updatedProfile);
    
    // Update cache with new profile
    await this.cacheService.cacheUserProfile(interaction.userId, updatedProfile);
  }

  private async updateUserProfileFromSession(session: UserSession): Promise<void> {
    if (session.interactions.length === 0) return;

    const profile = await this.getUserProfile(session.userId);
    const interactionSummary = await this.getInteractionSummary(session.userId);
    
    const updatedProfile: UserProfile = {
      ...profile,
      interactionHistory: interactionSummary,
      lastActivity: session.endTime || new Date()
    };

    this.userProfiles.set(session.userId, updatedProfile);
  }

  private getUserSessions(userId: string, startDate?: Date): UserSession[] {
    return Array.from(this.sessions.values()).filter(session => {
      const matchesUser = session.userId === userId;
      const afterStartDate = !startDate || session.startTime >= startDate;
      return matchesUser && afterStartDate;
    });
  }

  private isSessionExpired(session: UserSession): boolean {
    if (!session.isActive) return true;
    
    const now = new Date();
    const sessionAge = now.getTime() - session.startTime.getTime();
    const timeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000;
    
    return sessionAge > timeoutMs;
  }

  private calculatePurchaseProfile(interactions: UserInteraction[]): PurchaseProfile {
    const purchases = interactions.filter(i => i.action === 'purchase');
    const totalPurchases = purchases.length;
    
    if (totalPurchases === 0) {
      return {
        totalPurchases: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        preferredPurchaseType: [],
        seasonalPatterns: {},
        purchaseFrequency: 'low'
      };
    }

    // Extract purchase amounts from metadata (if available)
    const purchaseAmounts = purchases
      .map(p => p.metadata.additionalData?.amount as number)
      .filter(amount => typeof amount === 'number');

    const totalSpent = purchaseAmounts.reduce((sum, amount) => sum + amount, 0);
    const averageOrderValue = purchaseAmounts.length > 0 ? totalSpent / purchaseAmounts.length : 0;

    // Calculate seasonal patterns
    const seasonalPatterns: Record<string, number> = {};
    purchases.forEach(purchase => {
      const month = purchase.timestamp.getMonth();
      const season = this.getSeasonFromMonth(month);
      seasonalPatterns[season] = (seasonalPatterns[season] || 0) + 1;
    });

    // Determine purchase frequency
    const daysSinceFirstPurchase = purchases.length > 0 
      ? (Date.now() - Math.min(...purchases.map(p => p.timestamp.getTime()))) / (1000 * 60 * 60 * 24)
      : 0;
    
    const purchaseFrequency = this.calculatePurchaseFrequency(totalPurchases, daysSinceFirstPurchase);

    return {
      totalPurchases,
      totalSpent,
      averageOrderValue,
      preferredPurchaseType: [], // Could be extracted from purchase metadata
      seasonalPatterns,
      lastPurchaseDate: purchases.length > 0 ? purchases[purchases.length - 1].timestamp : undefined,
      purchaseFrequency
    };
  }

  private calculateBehaviorScore(interactions: UserInteraction[], summary: UserInteractionSummary): number {
    if (interactions.length === 0) return 0;

    // Weight different actions
    const actionWeights: Record<InteractionAction, number> = {
      'view': 1,
      'click': 2,
      'hover': 0.5,
      'scroll': 0.5,
      'search': 3,
      'filter': 2,
      'compare': 4,
      'favorite': 5,
      'share': 6,
      'purchase': 10
    };

    const totalScore = interactions.reduce((score, interaction) => {
      return score + (actionWeights[interaction.action] || 1);
    }, 0);

    // Normalize by time and engagement
    const engagementMultiplier = Math.min(summary.engagementRate / 10, 2); // Cap at 2x
    const timeDecay = this.calculateTimeDecay(summary.lastInteractionDate);
    
    return Math.min(totalScore * engagementMultiplier * timeDecay / 100, 100);
  }

  private incrementalBehaviorScoreUpdate(currentScore: number, interaction: UserInteraction): number {
    const actionWeights: Record<InteractionAction, number> = {
      'view': 1, 'click': 2, 'hover': 0.5, 'scroll': 0.5, 'search': 3,
      'filter': 2, 'compare': 4, 'favorite': 5, 'share': 6, 'purchase': 10
    };

    const increment = actionWeights[interaction.action] || 1;
    return Math.min(currentScore + increment * 0.1, 100);
  }

  private calculateBudgetRange(interactions: UserInteraction[]): {
    min: number; max: number; preferred: number; currency: string; confidence: number;
  } {
    const purchases = interactions.filter(i => i.action === 'purchase');
    
    if (purchases.length === 0) {
      return { min: 0, max: Number.MAX_SAFE_INTEGER, preferred: 500000, currency: 'COP', confidence: 0 };
    }

    const amounts = purchases
      .map(p => p.metadata.additionalData?.amount as number)
      .filter(amount => typeof amount === 'number');

    if (amounts.length === 0) {
      return { min: 0, max: Number.MAX_SAFE_INTEGER, preferred: 500000, currency: 'COP', confidence: 0.2 };
    }

    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const preferred = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const confidence = Math.min(amounts.length / 10, 1); // Higher confidence with more purchases

    return { min, max, preferred, currency: 'COP', confidence };
  }

  private calculateCategoryScore(interactions: number, purchases: number): number {
    const baseScore = Math.log(interactions + 1) * 10;
    const purchaseBonus = purchases * 20;
    return Math.min(baseScore + purchaseBonus, 100);
  }

  private calculateLocationScore(interactions: number, purchases: number): number {
    const baseScore = Math.log(interactions + 1) * 10;
    const purchaseBonus = purchases * 15;
    return Math.min(baseScore + purchaseBonus, 100);
  }

  private calculateTimeDecay(lastActivity: Date): number {
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(1 - daysSinceActivity / 30, 0.1); // Decay over 30 days, minimum 0.1
  }

  private calculatePurchaseFrequency(totalPurchases: number, daysSinceFirst: number): 'low' | 'medium' | 'high' {
    if (daysSinceFirst === 0) return 'low';
    
    const purchasesPerMonth = (totalPurchases / daysSinceFirst) * 30;
    
    if (purchasesPerMonth >= 2) return 'high';
    if (purchasesPerMonth >= 0.5) return 'medium';
    return 'low';
  }

  private extractCategoryFromInteraction(interaction: UserInteraction): string | null {
    // This would extract category from screen data or interaction context
    // For now, return a placeholder - this would be implemented based on actual screen data structure
    return interaction.context.additionalData?.category as string || null;
  }

  private extractLocationFromInteraction(interaction: UserInteraction): { city: string; region: string } | null {
    // This would extract location from screen data or interaction context
    // For now, return a placeholder - this would be implemented based on actual screen data structure
    const location = interaction.context.additionalData?.location as any;
    return location ? { city: location.city || '', region: location.region || '' } : null;
  }

  private getCategoryName(categoryId: string): string {
    // This would map category IDs to human-readable names
    // For now, return the ID as the name
    return categoryId;
  }

  private getSeasonFromMonth(month: number): string {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private generateInteractionId(): string {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.cleanup().catch(console.error);
    }, this.config.flushIntervalMs);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }
}

// Export singleton instance with shared cache service
import { cacheService } from './CacheService';
export const userBehaviorAnalytics = new UserBehaviorAnalytics(undefined, cacheService);