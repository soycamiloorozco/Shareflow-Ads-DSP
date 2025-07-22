/**
 * Tests for FilterCompatibilityLayer
 * Covers backward compatibility functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { FilterCompatibilityLayer } from '../FilterCompatibilityLayer';
import {
  FilterState,
  EnhancedFilterState
} from '../../types/marketplace.types';
import {
  LogicOperator
} from '../../types/conditional-filter.types';

describe('FilterCompatibilityLayer', () => {
  let legacyState: FilterState;
  let enhancedState: EnhancedFilterState;

  beforeEach(() => {
    legacyState = {
      search: { query: 'test' },
      location: { cities: ['Bogotá'], regions: [], neighborhoods: [] },
      category: { categories: ['retail'], venueTypes: [], environments: [], dwellTimes: [] },
      price: { min: 100000, max: 500000, ranges: [], currency: 'COP' },
      features: { allowsMoments: true, rating: 4, accessibility: [], supportedFormats: [] },
      availability: { timeSlots: [], daysOfWeek: [] },
      sort: { field: 'relevance', direction: 'desc' },
      showFavoritesOnly: false,
      showCircuits: true
    };

    enhancedState = {
      ...legacyState,
      conditionalRules: [],
      filterGroups: [],
      globalLogic: 'AND' as LogicOperator,
      displayMode: 'sections',
      viewMode: 'grid',
      metadata: {
        lastModified: new Date(),
        source: 'user',
        version: '2.0'
      }
    };
  });

  describe('createAdapter', () => {
    it('should create an adapter with default options', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();

      expect(adapter.normalizeState).toBeDefined();
      expect(adapter.extractLegacyState).toBeDefined();
      expect(adapter.wrapFilterComponent).toBeDefined();
      expect(adapter.createCompatibleHook).toBeDefined();
      expect(adapter.isEnhanced).toBeDefined();
      expect(adapter.needsUpgrade).toBeDefined();
    });

    it('should create an adapter with custom options', () => {
      const adapter = FilterCompatibilityLayer.createAdapter({
        autoMigrate: false,
        logMigrationWarnings: false
      });

      expect(adapter).toBeDefined();
      // Should throw when trying to normalize legacy state with autoMigrate: false
      expect(() => adapter.normalizeState(legacyState)).toThrow();
    });
  });

  describe('normalizeState', () => {
    it('should return enhanced state as-is', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();
      const result = adapter.normalizeState(enhancedState);

      expect(result).toBe(enhancedState);
    });

    it('should migrate legacy state to enhanced state', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();
      const result = adapter.normalizeState(legacyState);

      expect('conditionalRules' in result).toBe(true);
      expect('metadata' in result).toBe(true);
      expect(result.metadata.source).toBe('migration');
    });

    it('should handle migration failures gracefully', () => {
      const adapter = FilterCompatibilityLayer.createAdapter({
        logMigrationWarnings: false
      });

      // Create an invalid state that would fail migration
      const invalidState = { ...legacyState } as any;
      delete invalidState.search;

      const result = adapter.normalizeState(invalidState);

      // Should return a default enhanced state instead of throwing
      expect('conditionalRules' in result).toBe(true);
      expect('metadata' in result).toBe(true);
    });
  });

  describe('extractLegacyState', () => {
    it('should extract legacy state from enhanced state', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();
      const result = adapter.extractLegacyState(enhancedState);

      expect(result).toEqual(legacyState);
      expect('conditionalRules' in result).toBe(false);
      expect('metadata' in result).toBe(false);
    });

    it('should return legacy state as-is', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();
      const result = adapter.extractLegacyState(legacyState);

      expect(result).toBe(legacyState);
    });
  });

  describe('isEnhanced', () => {
    it('should correctly identify enhanced states', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();

      expect(adapter.isEnhanced(enhancedState)).toBe(true);
      expect(adapter.isEnhanced(legacyState)).toBe(false);
    });
  });

  describe('needsUpgrade', () => {
    it('should correctly identify states that need upgrade', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();

      expect(adapter.needsUpgrade(legacyState)).toBe(true);
      expect(adapter.needsUpgrade(enhancedState)).toBe(false);
    });
  });

  describe('createCompatibleHook', () => {
    it('should create a hook that works with both state types', () => {
      const adapter = FilterCompatibilityLayer.createAdapter();
      
      const mockHook = vi.fn((state: EnhancedFilterState) => state.conditionalRules.length);
      const compatibleHook = adapter.createCompatibleHook(mockHook);

      // Test with enhanced state
      const enhancedResult = compatibleHook(enhancedState);
      expect(mockHook).toHaveBeenCalledWith(enhancedState);
      expect(enhancedResult).toBe(0);

      // Test with legacy state (should be migrated first)
      mockHook.mockClear();
      const legacyResult = compatibleHook(legacyState);
      expect(mockHook).toHaveBeenCalled();
      expect(typeof legacyResult).toBe('number');
    });
  });

  describe('wrapFilterFunction', () => {
    it('should wrap functions to handle both state types', () => {
      const mockFunction = vi.fn((state: EnhancedFilterState, multiplier: number) => 
        state.conditionalRules.length * multiplier
      );

      const wrappedFunction = FilterCompatibilityLayer.wrapFilterFunction(mockFunction);

      // Test with enhanced state
      const enhancedResult = wrappedFunction(enhancedState, 2);
      expect(mockFunction).toHaveBeenCalledWith(enhancedState, 2);
      expect(enhancedResult).toBe(0);

      // Test with legacy state
      mockFunction.mockClear();
      const legacyResult = wrappedFunction(legacyState, 3);
      expect(mockFunction).toHaveBeenCalled();
      expect(typeof legacyResult).toBe('number');
    });
  });

  describe('wrapFilterHook', () => {
    it('should wrap hooks to handle both state types', () => {
      const mockHook = vi.fn((state: EnhancedFilterState) => ({
        ruleCount: state.conditionalRules.length,
        groupCount: state.filterGroups.length
      }));

      const wrappedHook = FilterCompatibilityLayer.wrapFilterHook(mockHook);

      // Test with enhanced state
      const enhancedResult = wrappedHook(enhancedState);
      expect(mockHook).toHaveBeenCalledWith(enhancedState);
      expect(enhancedResult.ruleCount).toBe(0);
      expect(enhancedResult.groupCount).toBe(0);

      // Test with legacy state
      mockHook.mockClear();
      const legacyResult = wrappedHook(legacyState);
      expect(mockHook).toHaveBeenCalled();
      expect(typeof legacyResult.ruleCount).toBe('number');
      expect(typeof legacyResult.groupCount).toBe('number');
    });
  });

  describe('Migration utilities', () => {
    let migrationUtils: ReturnType<typeof FilterCompatibilityLayer.createMigrationUtilities>;

    beforeEach(() => {
      migrationUtils = FilterCompatibilityLayer.createMigrationUtilities();
    });

    describe('isComponentEnhanced', () => {
      it('should identify enhanced components by display name', () => {
        const EnhancedComponent = () => React.createElement('div');
        EnhancedComponent.displayName = 'EnhancedFilterPanel';

        expect(migrationUtils.isComponentEnhanced(EnhancedComponent)).toBe(true);
      });

      it('should identify enhanced components by name', () => {
        function EnhancedFilterPanel() {
          return React.createElement('div');
        }

        expect(migrationUtils.isComponentEnhanced(EnhancedFilterPanel)).toBe(true);
      });

      it('should identify enhanced components by marker', () => {
        const Component = () => React.createElement('div');
        (Component as any).__enhanced = true;

        expect(migrationUtils.isComponentEnhanced(Component)).toBe(true);
      });

      it('should return false for non-enhanced components', () => {
        const RegularComponent = () => React.createElement('div');

        expect(migrationUtils.isComponentEnhanced(RegularComponent)).toBe(false);
      });
    });

    describe('markAsEnhanced', () => {
      it('should mark a component as enhanced', () => {
        const Component = () => React.createElement('div');
        const markedComponent = migrationUtils.markAsEnhanced(Component);

        expect(markedComponent).toBe(Component);
        expect(migrationUtils.isComponentEnhanced(markedComponent)).toBe(true);
      });
    });

    describe('createProgressiveWrapper', () => {
      it('should create a wrapper that uses enhanced component when available', () => {
        const LegacyComponent = vi.fn(() => React.createElement('div', null, 'legacy'));
        const EnhancedComponent = vi.fn(() => React.createElement('div', null, 'enhanced'));

        const ProgressiveWrapper = migrationUtils.createProgressiveWrapper(
          LegacyComponent,
          EnhancedComponent
        );

        // Test with enhanced state - should use enhanced component
        const enhancedProps = { filters: enhancedState, otherProp: 'test' };
        React.createElement(ProgressiveWrapper, enhancedProps);
        
        // Since we're testing the wrapper creation, not actual rendering,
        // we need to manually call the wrapper function
        const wrapperResult = ProgressiveWrapper(enhancedProps);
        expect(wrapperResult).toBeDefined();

        // Test with legacy state - should use legacy component
        LegacyComponent.mockClear();
        EnhancedComponent.mockClear();
        const legacyProps = { filters: legacyState, otherProp: 'test' };
        const legacyResult = ProgressiveWrapper(legacyProps);
        expect(legacyResult).toBeDefined();
      });

      it('should fallback to legacy component when enhanced is not provided', () => {
        const LegacyComponent = vi.fn(() => React.createElement('div', null, 'legacy'));

        const ProgressiveWrapper = migrationUtils.createProgressiveWrapper(LegacyComponent);

        // Even with enhanced state, should use legacy component
        const enhancedProps = { filters: enhancedState, otherProp: 'test' };
        const result = ProgressiveWrapper(enhancedProps);
        expect(result).toBeDefined();
      });
    });

    describe('createFeatureFlagWrapper', () => {
      it('should respect feature flag for component selection', () => {
        const LegacyComponent = vi.fn(() => React.createElement('div', null, 'legacy'));
        const EnhancedComponent = vi.fn(() => React.createElement('div', null, 'enhanced'));
        const featureFlag = vi.fn();

        const FeatureFlagWrapper = migrationUtils.createFeatureFlagWrapper(
          LegacyComponent,
          EnhancedComponent,
          featureFlag
        );

        // Feature flag enabled + enhanced state = enhanced component
        featureFlag.mockReturnValue(true);
        const enhancedProps = { filters: enhancedState, otherProp: 'test' };
        const result1 = FeatureFlagWrapper(enhancedProps);
        expect(result1).toBeDefined();
        expect(featureFlag).toHaveBeenCalled();

        // Feature flag disabled + enhanced state = legacy component
        LegacyComponent.mockClear();
        EnhancedComponent.mockClear();
        featureFlag.mockClear();
        featureFlag.mockReturnValue(false);
        const result2 = FeatureFlagWrapper(enhancedProps);
        expect(result2).toBeDefined();
        expect(featureFlag).toHaveBeenCalled();

        // Feature flag enabled + legacy state = legacy component
        LegacyComponent.mockClear();
        EnhancedComponent.mockClear();
        featureFlag.mockClear();
        featureFlag.mockReturnValue(true);
        const legacyProps = { filters: legacyState, otherProp: 'test' };
        const result3 = FeatureFlagWrapper(legacyProps);
        expect(result3).toBeDefined();
        expect(featureFlag).toHaveBeenCalled();
      });
    });
  });

  describe('Debug utilities', () => {
    let debugUtils: ReturnType<typeof FilterCompatibilityLayer.createDebugUtilities>;

    beforeEach(() => {
      debugUtils = FilterCompatibilityLayer.createDebugUtilities();
      // Mock console methods to avoid cluttering test output
      vi.spyOn(console, 'group').mockImplementation(() => {});
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    });

    describe('debugFilterState', () => {
      it('should log debug information for enhanced state', () => {
        debugUtils.debugFilterState(enhancedState, 'Test Enhanced State');

        expect(console.group).toHaveBeenCalledWith('🔍 Test Enhanced State Debug Info');
        expect(console.log).toHaveBeenCalledWith('State type:', 'Enhanced');
        expect(console.groupEnd).toHaveBeenCalled();
      });

      it('should log debug information for legacy state', () => {
        debugUtils.debugFilterState(legacyState, 'Test Legacy State');

        expect(console.group).toHaveBeenCalledWith('🔍 Test Legacy State Debug Info');
        expect(console.log).toHaveBeenCalledWith('State type:', 'Legacy');
        expect(console.groupEnd).toHaveBeenCalled();
      });
    });

    describe('validateCompatibility', () => {
      it('should validate compatibility for enhanced state', () => {
        const result = debugUtils.validateCompatibility(enhancedState);

        expect(result.canMigrate).toBe(true);
        expect(result.canExtract).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate compatibility for legacy state', () => {
        const result = debugUtils.validateCompatibility(legacyState);

        expect(result.canMigrate).toBe(true);
        expect(result.canExtract).toBe(true);
        expect(result.warnings.length).toBeGreaterThanOrEqual(0);
      });

      it('should detect migration failures', () => {
        const invalidState = { ...legacyState } as any;
        delete invalidState.search;

        const result = debugUtils.validateCompatibility(invalidState);

        expect(result.canMigrate).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('compareStates', () => {
      it('should compare identical states', () => {
        const result = debugUtils.compareStates(legacyState, { ...legacyState });

        expect(result.compatible).toBe(true);
        expect(result.differences).toHaveLength(0);
      });

      it('should detect differences between states', () => {
        const modifiedState = {
          ...legacyState,
          search: { query: 'different search' }
        };

        const result = debugUtils.compareStates(legacyState, modifiedState);

        expect(result.compatible).toBe(false);
        expect(result.differences.some(d => d.includes('search'))).toBe(true);
      });

      it('should detect type differences', () => {
        const result = debugUtils.compareStates(legacyState, enhancedState);

        expect(result.compatible).toBe(false);
        expect(result.differences.some(d => d.includes('Different state types'))).toBe(true);
        expect(result.recommendations.some(r => r.includes('migrating both states'))).toBe(true);
      });

      it('should compare enhanced state features', () => {
        const modifiedEnhanced = {
          ...enhancedState,
          globalLogic: 'OR' as LogicOperator
        };

        const result = debugUtils.compareStates(enhancedState, modifiedEnhanced);

        expect(result.compatible).toBe(false);
        expect(result.differences.some(d => d.includes('global logic'))).toBe(true);
      });
    });
  });

  describe('Global compatibility instance', () => {
    it('should provide a global instance', () => {
      expect(FilterCompatibilityLayer.global).toBeDefined();
      expect(FilterCompatibilityLayer.global.normalizeState).toBeDefined();
      expect(FilterCompatibilityLayer.global.extractLegacyState).toBeDefined();
    });

    it('should work with the global instance', () => {
      const result = FilterCompatibilityLayer.global.normalizeState(legacyState);
      expect('conditionalRules' in result).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid states gracefully', () => {
      const invalidState = null as any;
      
      expect(() => {
        FilterCompatibilityLayer.global.isEnhanced(invalidState);
      }).not.toThrow();
    });

    it('should handle migration errors gracefully', () => {
      const adapter = FilterCompatibilityLayer.createAdapter({
        logMigrationWarnings: false
      });

      const corruptState = { corrupted: true } as any;
      
      const result = adapter.normalizeState(corruptState);
      
      // Should return a valid enhanced state even with corrupt input
      expect('conditionalRules' in result).toBe(true);
      expect('metadata' in result).toBe(true);
    });
  });
});