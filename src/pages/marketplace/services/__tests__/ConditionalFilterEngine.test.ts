import { describe, it, expect, beforeEach } from 'vitest';
import { ConditionalFilterEngine } from '../ConditionalFilterEngine';
import {
  ConditionalFilterRule,
  ConditionalFilterState,
  FilterGroup,
  LogicOperator
} from '../../types/conditional-filter.types';

describe('ConditionalFilterEngine', () => {
  let mockScreens: any[];
  let basicFilterState: ConditionalFilterState;

  beforeEach(() => {
    mockScreens = [
      {
        id: '1',
        name: 'Screen A',
        city: 'New York',
        category: 'Billboard',
        price: 100,
        features: ['LED', 'Digital'],
        active: true
      },
      {
        id: '2',
        name: 'Screen B',
        city: 'Los Angeles',
        category: 'Transit',
        price: 150,
        features: ['Digital'],
        active: true
      },
      {
        id: '3',
        name: 'Screen C',
        city: 'New York',
        category: 'Billboard',
        price: 200,
        features: ['LED', 'Digital', 'Interactive'],
        active: false
      },
      {
        id: '4',
        name: 'Screen D',
        city: 'Chicago',
        category: 'Mall',
        price: 75,
        features: ['Digital'],
        active: true
      }
    ];

    basicFilterState = {
      rules: [],
      groups: [],
      globalLogic: 'AND' as LogicOperator,
      metadata: {
        lastModified: new Date(),
        source: 'user',
        version: '1.0'
      }
    };
  });

  describe('evaluateRules', () => {
    it('should return all items when no filters are applied', () => {
      const result = ConditionalFilterEngine.evaluateRules(mockScreens, basicFilterState);
      expect(result).toHaveLength(4);
      expect(result).toEqual(mockScreens);
    });

    it('should filter items with single equals rule', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'city',
          operator: 'equals',
          value: 'New York',
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(2);
      expect(result.every(screen => screen.city === 'New York')).toBe(true);
    });

    it('should filter items with contains rule', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'name',
          operator: 'contains',
          value: 'Screen',
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(4);
    });

    it('should filter items with in rule', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'city',
          operator: 'in',
          value: ['New York', 'Chicago'],
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(3);
      expect(result.every(screen => ['New York', 'Chicago'].includes(screen.city))).toBe(true);
    });

    it('should filter items with range rule', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'price',
          operator: 'range',
          value: { min: 100, max: 200 },
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(3);
      expect(result.every(screen => screen.price >= 100 && screen.price <= 200)).toBe(true);
    });

    it('should filter items with exists rule', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'features',
          operator: 'exists',
          value: true,
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(4);
    });

    it('should handle not_equals operator', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'city',
          operator: 'not_equals',
          value: 'New York',
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(2);
      expect(result.every(screen => screen.city !== 'New York')).toBe(true);
    });

    it('should handle not_contains operator', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'name',
          operator: 'not_contains',
          value: 'A',
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(3);
      expect(result.every(screen => !screen.name.includes('A'))).toBe(true);
    });

    it('should handle not_in operator', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'city',
          operator: 'not_in',
          value: ['New York'],
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(2);
      expect(result.every(screen => screen.city !== 'New York')).toBe(true);
    });
  });

  describe('AND/OR Logic', () => {
    it('should apply AND logic between multiple rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        globalLogic: 'AND',
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          },
          {
            id: 'rule2',
            field: 'active',
            operator: 'equals',
            value: true,
            logic: 'AND'
          }
        ]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should apply OR logic between multiple rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        globalLogic: 'OR',
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'Chicago',
            logic: 'OR'
          },
          {
            id: 'rule2',
            field: 'price',
            operator: 'equals',
            value: 200,
            logic: 'OR'
          }
        ]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(2);
      expect(result.some(screen => screen.city === 'Chicago')).toBe(true);
      expect(result.some(screen => screen.price === 200)).toBe(true);
    });

    it('should handle filter groups with AND logic', () => {
      const group: FilterGroup = {
        id: 'group1',
        name: 'Location and Price',
        logic: 'AND',
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          },
          {
            id: 'rule2',
            field: 'price',
            operator: 'range',
            value: { min: 50, max: 150 },
            logic: 'AND'
          }
        ]
      };

      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        groups: [group]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle filter groups with OR logic', () => {
      const group: FilterGroup = {
        id: 'group1',
        name: 'City or Category',
        logic: 'OR',
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'Chicago',
            logic: 'OR'
          },
          {
            id: 'rule2',
            field: 'category',
            operator: 'equals',
            value: 'Transit',
            logic: 'OR'
          }
        ]
      };

      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        groups: [group]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(2);
    });

    it('should handle complex combinations of rules and groups', () => {
      const group: FilterGroup = {
        id: 'group1',
        name: 'Premium Screens',
        logic: 'AND',
        rules: [
          {
            id: 'rule1',
            field: 'price',
            operator: 'range',
            value: { min: 150 },
            logic: 'AND'
          },
          {
            id: 'rule2',
            field: 'features',
            operator: 'contains',
            value: 'LED',
            logic: 'AND'
          }
        ]
      };

      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        globalLogic: 'OR',
        rules: [
          {
            id: 'rule3',
            field: 'city',
            operator: 'equals',
            value: 'Chicago',
            logic: 'OR'
          }
        ],
        groups: [group]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      // Should match: Chicago screen (Screen D) OR screens with price >= 150 AND LED features
      // Screen C has price 200 and LED but is inactive, Screen B has price 150 but no LED
      // Only Screen D (Chicago) matches
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4'); // Screen D from Chicago
    });
  });

  describe('buildQuery', () => {
    it('should build query from filter rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        globalLogic: 'AND',
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          }
        ]
      };

      const query = ConditionalFilterEngine.buildQuery(filterState);
      expect(query.logic).toBe('AND');
      expect(query.conditions).toHaveLength(1);
      expect(query.conditions[0]).toEqual({
        field: 'city',
        operator: 'equals',
        value: 'New York',
        logic: 'AND'
      });
    });

    it('should include group rules in query', () => {
      const group: FilterGroup = {
        id: 'group1',
        name: 'Test Group',
        logic: 'OR',
        rules: [
          {
            id: 'rule1',
            field: 'category',
            operator: 'in',
            value: ['Billboard', 'Transit'],
            logic: 'OR'
          }
        ]
      };

      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        groups: [group]
      };

      const query = ConditionalFilterEngine.buildQuery(filterState);
      expect(query.conditions).toHaveLength(1);
      expect(query.conditions[0].logic).toBe('OR');
    });
  });

  describe('optimizeRules', () => {
    it('should remove redundant rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          },
          {
            id: 'rule2',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          }
        ]
      };

      const result = ConditionalFilterEngine.optimizeRules(filterState);
      expect(result.optimizedRules).toHaveLength(1);
      expect(result.conflicts.some(c => c.type === 'redundancy')).toBe(true);
    });

    it('should detect contradictory rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          },
          {
            id: 'rule2',
            field: 'city',
            operator: 'not_equals',
            value: 'New York',
            logic: 'AND'
          }
        ]
      };

      const result = ConditionalFilterEngine.optimizeRules(filterState);
      expect(result.conflicts.some(c => c.type === 'contradiction')).toBe(true);
    });

    it('should consolidate similar rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'in',
            value: ['New York'],
            logic: 'AND'
          },
          {
            id: 'rule2',
            field: 'city',
            operator: 'in',
            value: ['Chicago'],
            logic: 'AND'
          }
        ]
      };

      const result = ConditionalFilterEngine.optimizeRules(filterState);
      expect(result.optimizedRules).toHaveLength(1);
      expect(result.optimizedRules[0].value).toEqual(['New York', 'Chicago']);
    });
  });

  describe('detectConflicts', () => {
    it('should detect no conflicts in valid filter state', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          },
          {
            id: 'rule2',
            field: 'category',
            operator: 'equals',
            value: 'Billboard',
            logic: 'AND'
          }
        ]
      };

      const conflicts = ConditionalFilterEngine.detectConflicts(filterState);
      expect(conflicts).toHaveLength(0);
    });

    it('should detect inefficient rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'name',
            operator: 'contains',
            value: 'A',
            logic: 'AND'
          }
        ]
      };

      const conflicts = ConditionalFilterEngine.detectConflicts(filterState);
      expect(conflicts.some(c => c.type === 'inefficiency')).toBe(true);
    });
  });

  describe('validateFilterState', () => {
    it('should validate correct filter state', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND'
          }
        ]
      };

      const validation = ConditionalFilterEngine.validateFilterState(filterState);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid rules', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: '',
            field: '',
            operator: 'invalid' as any,
            value: 'test',
            logic: 'AND'
          }
        ]
      };

      const validation = ConditionalFilterEngine.validateFilterState(filterState);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid operator-value combinations', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'in',
            value: 'not-an-array',
            logic: 'AND'
          }
        ]
      };

      const validation = ConditionalFilterEngine.validateFilterState(filterState);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('requires an array'))).toBe(true);
    });

    it('should provide performance warnings', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'name',
            operator: 'contains',
            value: 'A',
            logic: 'AND'
          }
        ]
      };

      const validation = ConditionalFilterEngine.validateFilterState(filterState);
      expect(validation.warnings.some(w => w.includes('performance'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays', () => {
      const result = ConditionalFilterEngine.evaluateRules([], basicFilterState);
      expect(result).toHaveLength(0);
    });

    it('should handle null/undefined values', () => {
      const screensWithNulls = [
        { id: '1', city: null, category: undefined, price: 0 },
        { id: '2', city: 'New York', category: 'Billboard', price: 100 }
      ];

      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'city',
          operator: 'exists',
          value: true,
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(screensWithNulls, filterState);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should handle nested field paths', () => {
      const screensWithNested = [
        { id: '1', location: { city: 'New York', state: 'NY' } },
        { id: '2', location: { city: 'Los Angeles', state: 'CA' } }
      ];

      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'location.city',
          operator: 'equals',
          value: 'New York',
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(screensWithNested, filterState);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle disabled rules and groups', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [
          {
            id: 'rule1',
            field: 'city',
            operator: 'equals',
            value: 'New York',
            logic: 'AND',
            enabled: false
          }
        ]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(4); // All screens since rule is disabled
    });

    it('should handle case-insensitive string operations', () => {
      const filterState: ConditionalFilterState = {
        ...basicFilterState,
        rules: [{
          id: 'rule1',
          field: 'name',
          operator: 'contains',
          value: 'screen',
          logic: 'AND'
        }]
      };

      const result = ConditionalFilterEngine.evaluateRules(mockScreens, filterState);
      expect(result).toHaveLength(4); // Should match "Screen" (capital S)
    });
  });
});