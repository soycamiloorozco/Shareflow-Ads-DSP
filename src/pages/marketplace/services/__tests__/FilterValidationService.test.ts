/**
 * Tests for FilterValidationService
 * Covers validation of conditional filter combinations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FilterValidationService } from '../FilterValidationService';
import {
  EnhancedFilterState,
  FilterState
} from '../../types/marketplace.types';
import {
  ConditionalFilterRule,
  FilterGroup,
  LogicOperator,
  createFilterRule,
  createFilterGroup
} from '../../types/conditional-filter.types';

describe('FilterValidationService', () => {
  let validEnhancedState: EnhancedFilterState;
  let validLegacyState: FilterState;

  beforeEach(() => {
    validLegacyState = {
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

    validEnhancedState = {
      ...validLegacyState,
      conditionalRules: [
        createFilterRule('name', 'contains', 'test', 'AND'),
        createFilterRule('locationDetails.city', 'equals', 'Bogotá', 'AND'),
        createFilterRule('price', 'range', { min: 100000, max: 500000 }, 'AND')
      ],
      filterGroups: [
        createFilterGroup('Test Group', [
          createFilterRule('category.name', 'in', ['retail', 'commercial'], 'OR')
        ], 'OR')
      ],
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

  describe('validateEnhancedFilterState', () => {
    it('should validate a correct enhanced filter state', () => {
      const result = FilterValidationService.validateEnhancedFilterState(validEnhancedState);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.legacyValidation?.isValid).toBe(true);
      expect(result.conditionalValidation?.isValid).toBe(true);
      expect(result.groupValidation?.isValid).toBe(true);
    });

    it('should detect invalid legacy filters', () => {
      const invalidState = {
        ...validEnhancedState,
        price: {
          ...validEnhancedState.price,
          min: -100, // Invalid negative price
          max: 50000 // Max less than min
        }
      };

      const result = FilterValidationService.validateEnhancedFilterState(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('negative'))).toBe(true);
    });

    it('should detect invalid conditional rules', () => {
      const invalidState = {
        ...validEnhancedState,
        conditionalRules: [
          {
            id: '',
            field: '',
            operator: 'equals' as any,
            value: null,
            logic: 'AND' as LogicOperator
          }
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing ID'))).toBe(true);
      expect(result.errors.some(e => e.includes('Missing field'))).toBe(true);
    });

    it('should detect invalid filter groups', () => {
      const invalidState = {
        ...validEnhancedState,
        filterGroups: [
          {
            id: '',
            name: '',
            logic: 'AND' as LogicOperator,
            rules: []
          }
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('missing ID'))).toBe(true);
      expect(result.errors.some(e => e.includes('missing or empty name'))).toBe(true);
    });

    it('should generate performance warnings for complex states', () => {
      const complexState = {
        ...validEnhancedState,
        conditionalRules: Array.from({ length: 20 }, (_, i) => 
          createFilterRule(`field${i}`, 'equals', `value${i}`, 'AND')
        )
      };

      const result = FilterValidationService.validateEnhancedFilterState(complexState);

      expect(result.warnings.some(w => w.includes('performance'))).toBe(true);
      expect(result.performanceMetrics?.complexityScore).toBeGreaterThan(0);
    });

    it('should detect rule conflicts', () => {
      const conflictingState = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('price', 'equals', 100000, 'AND'),
          createFilterRule('price', 'not_equals', 100000, 'AND') // Conflicting rules
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(conflictingState);

      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.conflicts.some(c => c.type === 'contradiction')).toBe(true);
    });

    it('should generate recommendations', () => {
      const result = FilterValidationService.validateEnhancedFilterState(validEnhancedState);

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle validation options correctly', () => {
      const result = FilterValidationService.validateEnhancedFilterState(validEnhancedState, {
        validateLegacyFilters: false,
        validateConditionalRules: true,
        validateFilterGroups: false,
        checkForConflicts: false,
        performanceCheck: false
      });

      expect(result.legacyValidation).toBeUndefined();
      expect(result.conditionalValidation).toBeDefined();
      expect(result.groupValidation).toBeUndefined();
      expect(result.conflicts).toHaveLength(0);
      expect(result.performanceMetrics).toBeUndefined();
    });
  });

  describe('Rule validation', () => {
    it('should validate operator-specific requirements', () => {
      const stateWithInvalidInOperator = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('categories', 'in', 'not-an-array', 'AND') // Should be array
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithInvalidInOperator);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('requires array value'))).toBe(true);
    });

    it('should validate range operator requirements', () => {
      const stateWithInvalidRange = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('price', 'range', 'not-an-object', 'AND') // Should be object
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithInvalidRange);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('requires object'))).toBe(true);
    });

    it('should validate range min/max logic', () => {
      const stateWithInvalidRange = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('price', 'range', { min: 500000, max: 100000 }, 'AND') // Min > Max
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithInvalidRange);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('greater than maximum'))).toBe(true);
    });

    it('should warn about short search terms', () => {
      const stateWithShortSearch = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('name', 'contains', 'a', 'AND') // Very short search
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithShortSearch);

      expect(result.warnings.some(w => w.includes('Short search term'))).toBe(true);
    });

    it('should suggest optimization for deep field paths', () => {
      const stateWithDeepPath = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('venue.location.address.street.number', 'equals', '123', 'AND')
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithDeepPath);

      expect(result.suggestions.some(s => s.includes('Deep field path'))).toBe(true);
    });
  });

  describe('Group validation', () => {
    it('should warn about empty groups', () => {
      const stateWithEmptyGroup = {
        ...validEnhancedState,
        filterGroups: [
          createFilterGroup('Empty Group', [], 'AND')
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithEmptyGroup);

      expect(result.warnings.some(w => w.includes('no rules'))).toBe(true);
    });

    it('should warn about groups with many rules', () => {
      const largeGroup = createFilterGroup('Large Group', 
        Array.from({ length: 15 }, (_, i) => 
          createFilterRule(`field${i}`, 'equals', `value${i}`, 'OR')
        ), 
        'OR'
      );

      const stateWithLargeGroup = {
        ...validEnhancedState,
        filterGroups: [largeGroup]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithLargeGroup);

      expect(result.warnings.some(w => w.includes('many rules'))).toBe(true);
    });

    it('should validate rules within groups', () => {
      const groupWithInvalidRule = createFilterGroup('Invalid Group', [
        {
          id: '',
          field: '',
          operator: 'equals' as any,
          value: null,
          logic: 'AND' as LogicOperator
        }
      ], 'AND');

      const stateWithInvalidGroup = {
        ...validEnhancedState,
        filterGroups: [groupWithInvalidRule]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithInvalidGroup);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid Group'))).toBe(true);
    });
  });

  describe('Performance validation', () => {
    it('should calculate complexity scores', () => {
      const result = FilterValidationService.validateEnhancedFilterState(validEnhancedState);

      expect(result.performanceMetrics?.complexityScore).toBeDefined();
      expect(result.performanceMetrics?.complexityScore).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics?.complexityScore).toBeLessThanOrEqual(100);
    });

    it('should estimate execution time', () => {
      const result = FilterValidationService.validateEnhancedFilterState(validEnhancedState);

      expect(result.performanceMetrics?.estimatedExecutionTime).toBeDefined();
      expect(result.performanceMetrics?.estimatedExecutionTime).toBeGreaterThan(0);
    });

    it('should provide resource usage estimates', () => {
      const result = FilterValidationService.validateEnhancedFilterState(validEnhancedState);

      expect(result.performanceMetrics?.resourceUsage).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(result.performanceMetrics?.resourceUsage.memory);
      expect(['low', 'medium', 'high']).toContain(result.performanceMetrics?.resourceUsage.cpu);
    });

    it('should suggest optimizations for complex filters', () => {
      const complexState = {
        ...validEnhancedState,
        conditionalRules: Array.from({ length: 25 }, (_, i) => 
          createFilterRule(`field${i}`, 'equals', `value${i}`, 'AND')
        )
      };

      const result = FilterValidationService.validateEnhancedFilterState(complexState);

      expect(result.performanceMetrics?.optimizationSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Recommendations', () => {
    it('should generate performance recommendations for high complexity', () => {
      const complexState = {
        ...validEnhancedState,
        conditionalRules: Array.from({ length: 30 }, (_, i) => 
          createFilterRule(`field${i}`, 'contains', `value${i}`, 'AND')
        )
      };

      const result = FilterValidationService.validateEnhancedFilterState(complexState);

      const performanceRecs = result.recommendations.filter(r => r.type === 'performance');
      expect(performanceRecs.length).toBeGreaterThan(0);
      expect(performanceRecs[0].priority).toBe('medium');
    });

    it('should generate usability recommendations for many filters', () => {
      const stateWithManyFilters = {
        ...validEnhancedState,
        location: {
          cities: Array.from({ length: 10 }, (_, i) => `City${i}`),
          regions: Array.from({ length: 5 }, (_, i) => `Region${i}`),
          neighborhoods: []
        },
        conditionalRules: Array.from({ length: 15 }, (_, i) => 
          createFilterRule(`field${i}`, 'equals', `value${i}`, 'AND')
        )
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithManyFilters);

      const usabilityRecs = result.recommendations.filter(r => r.type === 'usability');
      expect(usabilityRecs.length).toBeGreaterThan(0);
    });

    it('should generate optimization recommendations for duplicates', () => {
      const stateWithDuplicates = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('name', 'equals', 'test', 'AND'),
          createFilterRule('name', 'equals', 'test', 'AND') // Duplicate
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithDuplicates);

      const optimizationRecs = result.recommendations.filter(r => r.type === 'optimization');
      expect(optimizationRecs.length).toBeGreaterThan(0);
      expect(optimizationRecs.some(r => r.autoFixAvailable)).toBe(true);
    });

    it('should generate correctness recommendations for conflicts', () => {
      const stateWithConflicts = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('price', 'equals', 100000, 'AND'),
          createFilterRule('price', 'not_equals', 100000, 'AND')
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithConflicts);

      const correctnessRecs = result.recommendations.filter(r => r.type === 'correctness');
      expect(correctnessRecs.length).toBeGreaterThan(0);
      expect(correctnessRecs[0].priority).toBe('high');
    });
  });

  describe('Utility methods', () => {
    it('should provide quick validation', () => {
      const isValid = FilterValidationService.quickValidate(validEnhancedState);
      expect(typeof isValid).toBe('boolean');
      expect(isValid).toBe(true);
    });

    it('should validate conditional logic only', () => {
      const result = FilterValidationService.validateConditionalLogicOnly(validEnhancedState);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should handle states with no conditional logic', () => {
      const stateWithoutConditional = {
        ...validEnhancedState,
        conditionalRules: [],
        filterGroups: []
      };

      const result = FilterValidationService.validateConditionalLogicOnly(stateWithoutConditional);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle null/undefined values gracefully', () => {
      const stateWithNulls = {
        ...validEnhancedState,
        conditionalRules: [
          {
            id: 'test',
            field: 'test',
            operator: 'equals' as any,
            value: null,
            logic: 'AND' as LogicOperator
          }
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithNulls);
      
      // Should not crash, but may have warnings
      expect(result).toBeDefined();
      expect(result.warnings.some(w => w.includes('null or undefined'))).toBe(true);
    });

    it('should handle empty arrays in "in" operators', () => {
      const stateWithEmptyArray = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('categories', 'in', [], 'AND')
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithEmptyArray);
      
      expect(result.warnings.some(w => w.includes('Empty array'))).toBe(true);
    });

    it('should handle very large numbers in ranges', () => {
      const stateWithLargeNumbers = {
        ...validEnhancedState,
        conditionalRules: [
          createFilterRule('price', 'range', { 
            min: Number.MAX_SAFE_INTEGER - 1, 
            max: Number.MAX_SAFE_INTEGER 
          }, 'AND')
        ]
      };

      const result = FilterValidationService.validateEnhancedFilterState(stateWithLargeNumbers);
      
      // Should handle without errors
      expect(result.isValid).toBe(true);
    });
  });
});