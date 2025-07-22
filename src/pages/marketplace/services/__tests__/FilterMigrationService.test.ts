/**
 * Tests for FilterMigrationService
 * Covers migration utilities and state transitions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FilterMigrationService } from '../FilterMigrationService';
import {
  FilterState,
  EnhancedFilterState
} from '../../types/marketplace.types';
import {
  ConditionalFilterRule,
  FilterGroup,
  LogicOperator
} from '../../types/conditional-filter.types';

describe('FilterMigrationService', () => {
  let legacyFilterState: FilterState;
  let enhancedFilterState: EnhancedFilterState;

  beforeEach(() => {
    legacyFilterState = {
      search: { query: 'test search' },
      location: { 
        cities: ['Bogotá', 'Medellín'], 
        regions: ['Cundinamarca'], 
        neighborhoods: ['Zona Rosa'] 
      },
      category: { 
        categories: ['retail'], 
        venueTypes: ['mall'], 
        environments: ['indoor'], 
        dwellTimes: ['medium'] 
      },
      price: { 
        min: 100000, 
        max: 500000, 
        ranges: ['budget'], 
        currency: 'COP' 
      },
      features: { 
        allowsMoments: true, 
        rating: 4, 
        accessibility: ['wheelchair'], 
        supportedFormats: ['jpg', 'mp4'] 
      },
      availability: { 
        timeSlots: ['morning'], 
        daysOfWeek: [1, 2, 3] 
      },
      sort: { field: 'price', direction: 'asc' },
      showFavoritesOnly: false,
      showCircuits: true
    };

    enhancedFilterState = {
      ...legacyFilterState,
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

  describe('migrateFilterState', () => {
    it('should successfully migrate a legacy filter state', () => {
      const result = FilterMigrationService.migrateFilterState(legacyFilterState);

      expect(result.success).toBe(true);
      expect(result.migratedState).toBeDefined();
      expect(result.errors).toHaveLength(0);
      expect(result.dataLoss).toBe(false);
    });

    it('should preserve all legacy filter properties', () => {
      const result = FilterMigrationService.migrateFilterState(legacyFilterState);

      expect(result.migratedState?.search).toEqual(legacyFilterState.search);
      expect(result.migratedState?.location).toEqual(legacyFilterState.location);
      expect(result.migratedState?.category).toEqual(legacyFilterState.category);
      expect(result.migratedState?.price).toEqual(legacyFilterState.price);
      expect(result.migratedState?.features).toEqual(legacyFilterState.features);
      expect(result.migratedState?.availability).toEqual(legacyFilterState.availability);
      expect(result.migratedState?.sort).toEqual(legacyFilterState.sort);
      expect(result.migratedState?.showFavoritesOnly).toBe(legacyFilterState.showFavoritesOnly);
      expect(result.migratedState?.showCircuits).toBe(legacyFilterState.showCircuits);
    });

    it('should generate conditional rules from legacy filters', () => {
      const result = FilterMigrationService.migrateFilterState(legacyFilterState, {
        generateConditionalRules: true
      });

      expect(result.migratedState?.conditionalRules).toBeDefined();
      expect(result.migratedState?.conditionalRules.length).toBeGreaterThan(0);

      // Check for search rule
      const searchRule = result.migratedState?.conditionalRules.find(
        rule => rule.field === 'name' && rule.operator === 'contains'
      );
      expect(searchRule).toBeDefined();
      expect(searchRule?.value).toBe('test search');

      // Check for location rules
      const cityRule = result.migratedState?.conditionalRules.find(
        rule => rule.field === 'locationDetails.city' && rule.operator === 'in'
      );
      expect(cityRule).toBeDefined();
      expect(cityRule?.value).toEqual(['Bogotá', 'Medellín']);
    });

    it('should create filter groups for OR logic scenarios', () => {
      const stateWithPriceRanges = {
        ...legacyFilterState,
        price: {
          ...legacyFilterState.price,
          ranges: ['budget', 'mid-range', 'premium']
        }
      };

      const result = FilterMigrationService.migrateFilterState(stateWithPriceRanges);

      expect(result.migratedState?.filterGroups).toBeDefined();
      const priceGroup = result.migratedState?.filterGroups.find(
        group => group.name === 'Price Ranges'
      );
      expect(priceGroup).toBeDefined();
      expect(priceGroup?.logic).toBe('OR');
      expect(priceGroup?.rules.length).toBe(3);
    });

    it('should add migration metadata', () => {
      const result = FilterMigrationService.migrateFilterState(legacyFilterState);

      expect(result.migratedState?.metadata).toBeDefined();
      expect(result.migratedState?.metadata.source).toBe('migration');
      expect(result.migratedState?.metadata.version).toBe('2.0');
      expect(result.migratedState?.metadata.migrationInfo).toBeDefined();
      expect(result.migratedState?.metadata.migrationInfo?.fromVersion).toBe('1.0');
      expect(result.migratedState?.metadata.migrationInfo?.toVersion).toBe('2.0');
    });

    it('should handle empty legacy state', () => {
      const emptyState: FilterState = {
        search: { query: '' },
        location: { cities: [], regions: [], neighborhoods: [] },
        category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
        price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
        features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
        availability: { timeSlots: [], daysOfWeek: [] },
        sort: { field: 'relevance', direction: 'desc' },
        showFavoritesOnly: false,
        showCircuits: true
      };

      const result = FilterMigrationService.migrateFilterState(emptyState);

      expect(result.success).toBe(true);
      expect(result.migratedState?.conditionalRules).toHaveLength(0);
      expect(result.migratedState?.filterGroups).toHaveLength(0);
    });

    it('should generate warnings for complex migrations', () => {
      const complexState = {
        ...legacyFilterState,
        showFavoritesOnly: true
      };

      const result = FilterMigrationService.migrateFilterState(complexState);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Favorites filter'))).toBe(true);
    });

    it('should validate migrated state when requested', () => {
      const result = FilterMigrationService.migrateFilterState(legacyFilterState, {
        validateAfterMigration: true
      });

      expect(result.success).toBe(true);
      // Should not have validation errors for a properly migrated state
      expect(result.errors.filter(e => e.includes('validation')).length).toBe(0);
    });
  });

  describe('convertToLegacyState', () => {
    it('should extract legacy state from enhanced state', () => {
      const legacyState = FilterMigrationService.convertToLegacyState(enhancedFilterState);

      expect(legacyState).toEqual(legacyFilterState);
      expect('conditionalRules' in legacyState).toBe(false);
      expect('metadata' in legacyState).toBe(false);
    });
  });

  describe('needsMigration', () => {
    it('should return true for legacy state', () => {
      expect(FilterMigrationService.needsMigration(legacyFilterState)).toBe(true);
    });

    it('should return false for enhanced state', () => {
      expect(FilterMigrationService.needsMigration(enhancedFilterState)).toBe(false);
    });
  });

  describe('getFilterStateVersion', () => {
    it('should return 1.0 for legacy state', () => {
      expect(FilterMigrationService.getFilterStateVersion(legacyFilterState)).toBe('1.0');
    });

    it('should return correct version for enhanced state', () => {
      expect(FilterMigrationService.getFilterStateVersion(enhancedFilterState)).toBe('2.0');
    });
  });

  describe('batchMigrate', () => {
    it('should migrate multiple states successfully', () => {
      const states = [legacyFilterState, { ...legacyFilterState, search: { query: 'another search' } }];
      
      const result = FilterMigrationService.batchMigrate(states);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.successful[0].search.query).toBe('test search');
      expect(result.successful[1].search.query).toBe('another search');
    });

    it('should handle mixed success and failure scenarios', () => {
      const invalidState = { ...legacyFilterState } as any;
      delete invalidState.search; // Make it invalid

      const states = [legacyFilterState, invalidState];
      
      const result = FilterMigrationService.batchMigrate(states);

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].index).toBe(1);
    });
  });

  describe('createBackwardCompatibilityAdapter', () => {
    it('should create a working adapter', () => {
      const adapter = FilterMigrationService.createBackwardCompatibilityAdapter();

      expect(adapter.wrapFunction).toBeDefined();
      expect(adapter.createMigrationHook).toBeDefined();
    });

    it('should wrap functions to handle legacy states', () => {
      const adapter = FilterMigrationService.createBackwardCompatibilityAdapter();
      
      const testFunction = (state: EnhancedFilterState) => state.conditionalRules.length;
      const wrappedFunction = adapter.wrapFunction(testFunction);

      const result = wrappedFunction(legacyFilterState);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should create migration hooks', () => {
      const adapter = FilterMigrationService.createBackwardCompatibilityAdapter();
      
      const enhancedState = adapter.createMigrationHook(legacyFilterState);
      
      expect('conditionalRules' in enhancedState).toBe(true);
      expect('metadata' in enhancedState).toBe(true);
      expect(enhancedState.metadata.source).toBe('migration');
    });
  });

  describe('createDefaultEnhancedState', () => {
    it('should create a valid default enhanced state', () => {
      const defaultState = FilterMigrationService.createDefaultEnhancedState();

      expect(defaultState.conditionalRules).toBeDefined();
      expect(defaultState.filterGroups).toBeDefined();
      expect(defaultState.globalLogic).toBe('AND');
      expect(defaultState.displayMode).toBe('sections');
      expect(defaultState.viewMode).toBe('grid');
      expect(defaultState.metadata).toBeDefined();
      expect(defaultState.metadata.version).toBe('2.0');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null values gracefully', () => {
      const stateWithNulls = {
        ...legacyFilterState,
        features: {
          ...legacyFilterState.features,
          allowsMoments: null,
          rating: null
        }
      };

      const result = FilterMigrationService.migrateFilterState(stateWithNulls);
      expect(result.success).toBe(true);
    });

    it('should handle undefined arrays gracefully', () => {
      const stateWithUndefined = {
        ...legacyFilterState,
        location: {
          cities: [],
          regions: [],
          neighborhoods: []
        }
      };

      const result = FilterMigrationService.migrateFilterState(stateWithUndefined);
      expect(result.success).toBe(true);
    });

    it('should handle extreme price values', () => {
      const stateWithExtremePrices = {
        ...legacyFilterState,
        price: {
          min: 0,
          max: Number.MAX_SAFE_INTEGER,
          ranges: [],
          currency: 'COP'
        }
      };

      const result = FilterMigrationService.migrateFilterState(stateWithExtremePrices);
      expect(result.success).toBe(true);
    });

    it('should handle migration with disabled auto-generation', () => {
      const result = FilterMigrationService.migrateFilterState(legacyFilterState, {
        generateConditionalRules: false
      });

      expect(result.success).toBe(true);
      expect(result.migratedState?.conditionalRules).toHaveLength(0);
      expect(result.migratedState?.filterGroups).toHaveLength(0);
    });
  });

  describe('Performance considerations', () => {
    it('should handle large filter states efficiently', () => {
      const largeState = {
        ...legacyFilterState,
        location: {
          cities: Array.from({ length: 100 }, (_, i) => `City${i}`),
          regions: Array.from({ length: 50 }, (_, i) => `Region${i}`),
          neighborhoods: Array.from({ length: 200 }, (_, i) => `Neighborhood${i}`)
        },
        category: {
          categories: Array.from({ length: 50 }, (_, i) => `Category${i}`),
          venueTypes: Array.from({ length: 30 }, (_, i) => `VenueType${i}`),
          environments: ['indoor', 'outdoor'],
          dwellTimes: ['short', 'medium', 'long']
        }
      };

      const startTime = performance.now();
      const result = FilterMigrationService.migrateFilterState(largeState);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});