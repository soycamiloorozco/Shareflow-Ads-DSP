/**
 * Types and interfaces for conditional filtering with AND/OR logic
 */

export type FilterOperator = 'equals' | 'contains' | 'in' | 'range' | 'exists' | 'not_equals' | 'not_contains' | 'not_in';
export type LogicOperator = 'AND' | 'OR';

export interface ConditionalFilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  logic: LogicOperator;
  group?: string;
  enabled?: boolean;
}

export interface FilterGroup {
  id: string;
  name: string;
  logic: LogicOperator;
  rules: ConditionalFilterRule[];
  enabled?: boolean;
}

export interface ConditionalFilterState {
  rules: ConditionalFilterRule[];
  groups: FilterGroup[];
  globalLogic: LogicOperator;
  metadata?: {
    lastModified: Date;
    source: 'user' | 'suggestion' | 'saved';
    version: string;
  };
}

export interface FilterQuery {
  conditions: QueryCondition[];
  logic: LogicOperator;
  optimized: boolean;
}

export interface QueryCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logic: LogicOperator;
}

export interface RuleConflict {
  ruleIds: string[];
  type: 'contradiction' | 'redundancy' | 'inefficiency';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface OptimizationResult {
  originalRules: ConditionalFilterRule[];
  optimizedRules: ConditionalFilterRule[];
  conflicts: RuleConflict[];
  performanceGain: number;
}

export interface FilterEvaluationContext {
  item: any;
  rules: ConditionalFilterRule[];
  groups: FilterGroup[];
  globalLogic: LogicOperator;
}

export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Utility functions
export const createEmptyConditionalFilterState = (): ConditionalFilterState => ({
  rules: [],
  groups: [],
  globalLogic: 'AND',
  metadata: {
    lastModified: new Date(),
    source: 'user',
    version: '1.0'
  }
});

export const createFilterRule = (
  field: string,
  operator: FilterOperator,
  value: any,
  logic: LogicOperator = 'AND'
): ConditionalFilterRule => ({
  id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  field,
  operator,
  value,
  logic,
  enabled: true
});

export const createFilterGroup = (
  name: string,
  rules: ConditionalFilterRule[] = [],
  logic: LogicOperator = 'AND'
): FilterGroup => ({
  id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  logic,
  rules,
  enabled: true
});