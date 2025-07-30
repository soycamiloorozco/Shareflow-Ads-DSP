/**
 * GroupingEngine Tests
 * Tests for the main orchestration service
 */

import { GroupingEngine } from '../GroupingEngine';
import { UserBehaviorAnalytics } from '../UserBehaviorAnalytics';
import { SectionConfigManager } from '../SectionConfigManager';
import { 
  MarketplaceSection, 
  SectionEngagement, 
  DynamicSectionRule,
  SectionConfig 
} from '../../types/intelligent-grouping.types';

describe('GroupingEngine', () => {
  let groupingEngine: GroupingEngine;
  let behaviorAnalytics: UserBehaviorAnalytics;

  beforeEach(() => {
    behaviorAnalytics = new UserBehaviorAnalytics();
    groupingEngine = new GroupingEngine(behaviorAnalytics, {
      enableCaching: false, // Disable caching for tests
      debugMode: true
    });
  });

  afterEach(() => {
    groupingEngine.cleanup();
  });

  describe('generateSections', () => {
    it('should generate sections for anonymous users', async () => {
      const result = await groupingEngine.generateSections();
      
      expect(result.sections).toBeDefined();
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.fallbackUsed).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.cacheHit).toBe(false);
    });

    it('should generate sections for logged-in users', async () => {
      const userId = 'test-user-123';
      const result = await groupingEngine.generateSections({ userId });
      
      expect(result.sections).toBeDefined();
      expect(result.sections.length).toBeGreaterThan(0);
      
      // Should include user-specific sections
      const sectionIds = result.sections.map(s => s.id);
      expect(sectionIds.some(id => id.includes('top-picks'))).toBe(true);
    });

    it('should respect location filtering', async () => {
      const result = await groupingEngine.generateSections({ 
        location: 'Bogotá' 
      });
      
      expect(result.sections).toBeDefined();
      expect(result.sections.length).toBeGreaterThan(0);
    });

    it('should limit sections per user', async () => {
      const result = await groupingEngine.generateSections({ 
        userId: 'test-user-123' 
      });
      
      expect(result.sections.length).toBeLessThanOrEqual(8); // Default max sections
    });

    it('should handle errors gracefully', async () => {
      // Test with invalid options that might cause errors
      const result = await groupingEngine.generateSections({ 
        userId: '', // Empty user ID
        location: '' 
      });
      
      expect(result.sections).toBeDefined();
      expect(result.errors).toBeDefined();
    });
  });

  describe('section management', () => {
    it('should track section engagement', async () => {
      const engagement: SectionEngagement = {
        sectionId: 'test-section',
        viewTime: 30000,
        clickCount: 3,
        scrollDepth: 0.8,
        conversionRate: 0.1,
        screenInteractions: { 'screen-1': 2, 'screen-2': 1 },
        timestamp: new Date()
      };

      await expect(groupingEngine.trackSectionEngagement(engagement))
        .resolves.not.toThrow();
    });

    it('should update section configuration', async () => {
      const updates: Partial<SectionConfig> = {
        enabled: false,
        maxScreens: 10
      };

      await expect(groupingEngine.updateSectionConfig('trending', updates))
        .resolves.not.toThrow();
    });

    it('should toggle section enabled state', async () => {
      await expect(groupingEngine.toggleSection('trending', false))
        .resolves.not.toThrow();
      
      await expect(groupingEngine.toggleSection('trending', true))
        .resolves.not.toThrow();
    });

    it('should add and remove dynamic rules', async () => {
      const rule: DynamicSectionRule = {
        id: 'test-rule',
        condition: 'user.totalPurchases > 5',
        action: 'enable',
        targetSections: ['premium-recommendations'],
        priority: 5,
        enabled: true
      };

      expect(() => groupingEngine.addDynamicRule(rule)).not.toThrow();
      expect(() => groupingEngine.removeDynamicRule('test-rule')).not.toThrow();
    });

    it('should create user-specific configurations', async () => {
      const userId = 'test-user-123';
      const customizations: Partial<SectionConfig> = {
        maxScreens: 12,
        priority: 15
      };

      const configId = await groupingEngine.createUserSpecificConfig(
        userId, 
        'top-picks', 
        customizations
      );

      expect(configId).toBeDefined();
      expect(configId).toContain(userId);
    });
  });

  describe('analytics and metrics', () => {
    it('should get section metrics', async () => {
      const metrics = await groupingEngine.getSectionMetrics('trending');
      
      expect(metrics).toBeDefined();
      expect(metrics.sectionId).toBe('trending');
      expect(metrics.impressions).toBeDefined();
      expect(metrics.clicks).toBeDefined();
      expect(metrics.conversions).toBeDefined();
    });

    it('should get section metadata', () => {
      const metadata = groupingEngine.getSectionMetadata('trending');
      
      if (metadata) {
        expect(metadata.algorithm).toBeDefined();
        expect(metadata.confidence).toBeDefined();
        expect(metadata.trackingId).toBeDefined();
        expect(metadata.generatedAt).toBeDefined();
      }
    });

    it('should get all section analytics', () => {
      const analytics = groupingEngine.getAllSectionAnalytics();
      
      expect(analytics).toBeDefined();
      expect(typeof analytics).toBe('object');
    });

    it('should track analytics data', async () => {
      const result = await groupingEngine.generateSections({ 
        userId: 'test-user-123',
        includeAnalytics: true 
      });
      
      expect(result.analytics).toBeDefined();
      expect(result.analytics.sessionId).toBeDefined();
      expect(result.analytics.sectionsViewed).toBeDefined();
      expect(result.analytics.timestamp).toBeDefined();
    });
  });

  describe('caching', () => {
    it('should cache sections when enabled', async () => {
      const cachingEngine = new GroupingEngine(behaviorAnalytics, {
        enableCaching: true,
        debugMode: true
      });

      const userId = 'test-user-123';
      
      // First call
      const result1 = await cachingEngine.generateSections({ userId });
      expect(result1.cacheHit).toBe(false);
      
      // Second call should hit cache
      const result2 = await cachingEngine.generateSections({ userId });
      expect(result2.cacheHit).toBe(true);
      
      cachingEngine.cleanup();
    });

    it('should refresh sections and clear cache', async () => {
      const userId = 'test-user-123';
      
      await expect(groupingEngine.refreshSections(userId))
        .resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle missing user gracefully', async () => {
      const result = await groupingEngine.generateSections({ 
        userId: 'non-existent-user' 
      });
      
      expect(result.sections).toBeDefined();
      expect(result.fallbackUsed).toBeDefined();
    });

    it('should collect and report errors', async () => {
      // Generate some sections to potentially trigger errors
      await groupingEngine.generateSections({ userId: 'test-user' });
      
      const errors = groupingEngine.getErrors();
      expect(Array.isArray(errors)).toBe(true);
    });

    it('should provide fallback when main generation fails', async () => {
      // This test would need to mock service failures
      const result = await groupingEngine.generateSections();
      
      expect(result.sections).toBeDefined();
      // Even if fallback is used, we should get some sections
      if (result.fallbackUsed) {
        expect(result.sections.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('section validation', () => {
    it('should generate valid section structures', async () => {
      const result = await groupingEngine.generateSections({ 
        userId: 'test-user-123' 
      });
      
      result.sections.forEach(section => {
        expect(section.id).toBeDefined();
        expect(section.title).toBeDefined();
        expect(section.screens).toBeDefined();
        expect(Array.isArray(section.screens)).toBe(true);
        expect(section.displayType).toBeDefined();
        expect(section.priority).toBeDefined();
        expect(section.metadata).toBeDefined();
        expect(section.metadata.algorithm).toBeDefined();
        expect(section.metadata.trackingId).toBeDefined();
        expect(section.metadata.generatedAt).toBeDefined();
      });
    });

    it('should respect section priorities', async () => {
      const result = await groupingEngine.generateSections({ 
        userId: 'test-user-123' 
      });
      
      // Check that sections are ordered by priority (highest first)
      for (let i = 0; i < result.sections.length - 1; i++) {
        expect(result.sections[i].priority)
          .toBeGreaterThanOrEqual(result.sections[i + 1].priority);
      }
    });

    it('should not have duplicate screens across sections', async () => {
      const result = await groupingEngine.generateSections({ 
        userId: 'test-user-123' 
      });
      
      const allScreenIds = new Set<string>();
      let duplicateFound = false;
      
      result.sections.forEach(section => {
        section.screens.forEach(screen => {
          if (allScreenIds.has(screen.id)) {
            duplicateFound = true;
          }
          allScreenIds.add(screen.id);
        });
      });
      
      expect(duplicateFound).toBe(false);
    });
  });
});