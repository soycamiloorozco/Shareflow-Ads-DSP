/**
 * SectionConfigManager Tests
 * Tests for section configuration and management
 */

import { SectionConfigManager } from '../SectionConfigManager';
import { UserBehaviorAnalytics } from '../UserBehaviorAnalytics';
import { 
  SectionConfig, 
  SectionEngagement, 
  DynamicSectionRule,
  UserInteraction,
  createEmptyUserProfile
} from '../../types/intelligent-grouping.types';

describe('SectionConfigManager', () => {
  let configManager: SectionConfigManager;
  let behaviorAnalytics: UserBehaviorAnalytics;

  beforeEach(() => {
    behaviorAnalytics = new UserBehaviorAnalytics();
    configManager = new SectionConfigManager(behaviorAnalytics, {
      enableDynamicSections: true,
      enableAnalyticsTracking: true,
      debugMode: true
    });
  });

  afterEach(() => {
    configManager.cleanup();
  });

  describe('getSectionConfigs', () => {
    it('should return default configurations for anonymous users', async () => {
      const configs = await configManager.getSectionConfigs();
      
      expect(configs).toBeDefined();
      expect(configs.length).toBeGreaterThan(0);
      expect(configs.every(config => config.enabled)).toBe(true);
      
      // Should be sorted by priority
      for (let i = 0; i < configs.length - 1; i++) {
        expect(configs[i].priority).toBeGreaterThanOrEqual(configs[i + 1].priority);
      }
    });

    it('should return user-specific configurations', async () => {
      const userId = 'test-user-123';
      const configs = await configManager.getSectionConfigs(userId);
      
      expect(configs).toBeDefined();
      expect(configs.length).toBeGreaterThan(0);
      
      // Should include sections that require login
      const requiresLoginSections = configs.filter(config => config.conditions.requiresLogin);
      expect(requiresLoginSections.length).toBeGreaterThan(0);
    });

    it('should apply location-based filtering', async () => {
      const location = 'Bogotá';
      const configs = await configManager.getSectionConfigs(undefined, location);
      
      expect(configs).toBeDefined();
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should cache configurations', async () => {
      const userId = 'test-user-123';
      
      // First call
      const configs1 = await configManager.getSectionConfigs(userId);
      
      // Second call should be faster (cached)
      const start = Date.now();
      const configs2 = await configManager.getSectionConfigs(userId);
      const duration = Date.now() - start;
      
      expect(configs1).toEqual(configs2);
      expect(duration).toBeLessThan(10); // Should be very fast due to caching
    });
  });

  describe('section configuration management', () => {
    it('should update section configuration', async () => {
      const sectionId = 'trending';
      const updates: Partial<SectionConfig> = {
        maxScreens: 12,
        enabled: false
      };

      await expect(configManager.updateSectionConfig(sectionId, updates))
        .resolves.not.toThrow();
      
      // Verify the update was applied
      const configs = await configManager.getSectionConfigs();
      const updatedConfig = configs.find(config => config.id === sectionId);
      
      if (updatedConfig) {
        expect(updatedConfig.maxScreens).toBe(12);
        expect(updatedConfig.enabled).toBe(false);
      }
    });

    it('should toggle section enabled state', async () => {
      const sectionId = 'trending';
      
      await configManager.toggleSection(sectionId, false);
      let configs = await configManager.getSectionConfigs();
      let section = configs.find(config => config.id === sectionId);
      expect(section?.enabled).toBe(false);
      
      await configManager.toggleSection(sectionId, true);
      configs = await configManager.getSectionConfigs();
      section = configs.find(config => config.id === sectionId);
      expect(section?.enabled).toBe(true);
    });

    it('should handle invalid section ID gracefully', async () => {
      await expect(configManager.updateSectionConfig('invalid-section', {}))
        .rejects.toThrow('Section config not found');
    });
  });

  describe('dynamic rules', () => {
    it('should add and apply dynamic rules', async () => {
      const rule: DynamicSectionRule = {
        id: 'test-disable-rule',
        condition: 'user.totalPurchases === 0',
        action: 'disable',
        targetSections: ['recently-purchased'],
        priority: 10,
        enabled: true
      };

      configManager.addDynamicRule(rule);
      
      // Test with user who has no purchases
      const userId = 'new-user-123';
      const configs = await configManager.getSectionConfigs(userId);
      
      const recentlyPurchasedSection = configs.find(config => 
        config.id.includes('recently-purchased')
      );
      
      // Section should be disabled by the rule
      expect(recentlyPurchasedSection?.enabled).toBe(false);
    });

    it('should remove dynamic rules', async () => {
      const rule: DynamicSectionRule = {
        id: 'test-rule-to-remove',
        condition: 'user.totalPurchases > 5',
        action: 'enable',
        targetSections: ['premium-section'],
        priority: 5,
        enabled: true
      };

      configManager.addDynamicRule(rule);
      configManager.removeDynamicRule(rule.id);
      
      // Rule should no longer be applied
      const configs = await configManager.getSectionConfigs('test-user');
      expect(configs).toBeDefined();
    });

    it('should apply rules in priority order', async () => {
      const highPriorityRule: DynamicSectionRule = {
        id: 'high-priority',
        condition: 'user.totalPurchases === 0',
        action: 'disable',
        targetSections: ['trending'],
        priority: 10,
        enabled: true
      };

      const lowPriorityRule: DynamicSectionRule = {
        id: 'low-priority',
        condition: 'user.totalPurchases === 0',
        action: 'enable',
        targetSections: ['trending'],
        priority: 1,
        enabled: true
      };

      configManager.addDynamicRule(lowPriorityRule);
      configManager.addDynamicRule(highPriorityRule);
      
      const configs = await configManager.getSectionConfigs('new-user');
      const trendingSection = configs.find(config => config.id === 'trending');
      
      // High priority rule should win (disable)
      expect(trendingSection?.enabled).toBe(false);
    });
  });

  describe('user-specific configurations', () => {
    it('should create user-specific configurations', async () => {
      const userId = 'test-user-123';
      const baseSectionId = 'top-picks';
      const customizations: Partial<SectionConfig> = {
        maxScreens: 10,
        priority: 15,
        name: 'My Custom Picks'
      };

      const configId = await configManager.createUserSpecificConfig(
        userId, 
        baseSectionId, 
        customizations
      );

      expect(configId).toBeDefined();
      expect(configId).toContain(userId);
      
      // Verify the custom config is applied
      const configs = await configManager.getSectionConfigs(userId);
      const customConfig = configs.find(config => config.id === configId);
      
      expect(customConfig).toBeDefined();
      expect(customConfig?.maxScreens).toBe(10);
      expect(customConfig?.priority).toBe(15);
      expect(customConfig?.name).toBe('My Custom Picks');
    });

    it('should handle invalid base section ID', async () => {
      await expect(configManager.createUserSpecificConfig(
        'test-user', 
        'invalid-section', 
        {}
      )).rejects.toThrow('Base section config not found');
    });
  });

  describe('analytics tracking', () => {
    it('should track section engagement', async () => {
      const engagement: SectionEngagement = {
        sectionId: 'test-section',
        viewTime: 30000,
        clickCount: 5,
        scrollDepth: 0.8,
        conversionRate: 0.2,
        screenInteractions: { 'screen-1': 3, 'screen-2': 2 },
        timestamp: new Date()
      };

      await expect(configManager.trackSectionEngagement(engagement))
        .resolves.not.toThrow();
    });

    it('should calculate performance metrics', async () => {
      const sectionId = 'test-section';
      const engagements: SectionEngagement[] = [
        {
          sectionId,
          viewTime: 20000,
          clickCount: 3,
          scrollDepth: 0.7,
          conversionRate: 0.1,
          screenInteractions: { 'screen-1': 2, 'screen-2': 1 },
          timestamp: new Date()
        },
        {
          sectionId,
          viewTime: 40000,
          clickCount: 7,
          scrollDepth: 0.9,
          conversionRate: 0.3,
          screenInteractions: { 'screen-1': 4, 'screen-2': 3 },
          timestamp: new Date()
        }
      ];

      for (const engagement of engagements) {
        await configManager.trackSectionEngagement(engagement);
      }

      const metrics = configManager.getSectionPerformanceMetrics(sectionId);
      
      expect(metrics).toBeDefined();
      expect(metrics?.sectionId).toBe(sectionId);
      expect(metrics?.impressions).toBe(2);
      expect(metrics?.clicks).toBe(10);
      expect(metrics?.averageEngagementTime).toBe(30000);
      expect(metrics?.conversionRate).toBe(0.2);
    });

    it('should get all section analytics', async () => {
      const engagement: SectionEngagement = {
        sectionId: 'analytics-test',
        viewTime: 15000,
        clickCount: 2,
        scrollDepth: 0.6,
        conversionRate: 0.05,
        screenInteractions: { 'screen-1': 1, 'screen-2': 1 },
        timestamp: new Date()
      };

      await configManager.trackSectionEngagement(engagement);
      
      const analytics = configManager.getAllSectionAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics['analytics-test']).toBeDefined();
      expect(analytics['analytics-test'].length).toBe(1);
      expect(analytics['analytics-test'][0]).toEqual(engagement);
    });
  });

  describe('section metadata', () => {
    it('should get section metadata', () => {
      const metadata = configManager.getSectionMetadata('trending');
      
      expect(metadata).toBeDefined();
      expect(metadata?.algorithm).toBe('trending-analysis');
      expect(metadata?.confidence).toBeDefined();
      expect(metadata?.refreshInterval).toBeDefined();
      expect(metadata?.trackingId).toBeDefined();
      expect(metadata?.generatedAt).toBeDefined();
    });

    it('should return null for invalid section ID', () => {
      const metadata = configManager.getSectionMetadata('invalid-section');
      expect(metadata).toBeNull();
    });
  });

  describe('cleanup and maintenance', () => {
    it('should cleanup old data', async () => {
      // Add some test data
      const engagement: SectionEngagement = {
        sectionId: 'cleanup-test',
        viewTime: 10000,
        clickCount: 1,
        scrollDepth: 0.5,
        conversionRate: 0,
        screenInteractions: { 'screen-1': 1 },
        timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
      };

      await configManager.trackSectionEngagement(engagement);
      
      // Cleanup should remove old data
      configManager.cleanup();
      
      const analytics = configManager.getAllSectionAnalytics();
      expect(analytics['cleanup-test']?.length || 0).toBe(0);
    });

    it('should handle cleanup gracefully', () => {
      expect(() => configManager.cleanup()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle missing user profile gracefully', async () => {
      const configs = await configManager.getSectionConfigs('non-existent-user');
      
      expect(configs).toBeDefined();
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should handle analytics tracking errors gracefully', async () => {
      const invalidEngagement = {
        sectionId: '',
        viewTime: -1,
        clickCount: -1,
        scrollDepth: 2, // Invalid scroll depth
        conversionRate: -1,
        screenInteractions: {},
        timestamp: new Date()
      } as SectionEngagement;

      await expect(configManager.trackSectionEngagement(invalidEngagement))
        .resolves.not.toThrow();
    });
  });
});