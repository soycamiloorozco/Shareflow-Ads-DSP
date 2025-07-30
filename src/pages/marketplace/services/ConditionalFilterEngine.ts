import {
  ConditionalFilterRule,
  ConditionalFilterState,
  FilterGroup,
  FilterQuery,
  QueryCondition,
  RuleConflict,
  OptimizationResult,
  FilterEvaluationContext,
  FilterValidationResult,
  FilterOperator,
  LogicOperator
} from '../types/conditional-filter.types';

/**
 * ConditionalFilterEngine - Handles complex AND/OR filter logic processing
 * Supports rule evaluation, optimization, and conflict detection
 */
export class ConditionalFilterEngine {
  private static readonly SUPPORTED_OPERATORS: FilterOperator[] = [
    'equals', 'contains', 'in', 'range', 'exists', 'not_equals', 'not_contains', 'not_in'
  ];

  /**
   * Evaluates filter rules against a collection of items
   */
  static evaluateRules<T>(items: T[], filterState: ConditionalFilterState): T[] {
    if (!items || items.length === 0) return [];
    if (!filterState || (!filterState.rules.length && !filterState.groups.length)) return items;

    return items.filter(item => this.evaluateItemAgainstRules(item, filterState));
  }

  /**
   * Evaluates a single item against all filter rules
   */
  private static evaluateItemAgainstRules(item: any, filterState: ConditionalFilterState): boolean {
    const context: FilterEvaluationContext = {
      item,
      rules: filterState.rules.filter(rule => rule.enabled !== false),
      groups: filterState.groups.filter(group => group.enabled !== false),
      globalLogic: filterState.globalLogic
    };

    // If no active rules or groups, item passes
    if (context.rules.length === 0 && context.groups.length === 0) return true;

    const ruleResults = context.rules.map(rule => this.evaluateRule(item, rule));
    const groupResults = context.groups.map(group => this.evaluateGroup(item, group));

    const allResults = [...ruleResults, ...groupResults];
    
    if (allResults.length === 0) return true;

    return context.globalLogic === 'AND' 
      ? allResults.every(result => result)
      : allResults.some(result => result);
  }

  /**
   * Evaluates a single rule against an item
   */
  private static evaluateRule(item: any, rule: ConditionalFilterRule): boolean {
    const fieldValue = this.getFieldValue(item, rule.field);
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      
      case 'not_equals':
        return fieldValue !== rule.value;
      
      case 'contains':
        return this.stringContains(fieldValue, rule.value);
      
      case 'not_contains':
        return !this.stringContains(fieldValue, rule.value);
      
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(fieldValue);
      
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
      
      case 'range':
        return this.evaluateRange(fieldValue, rule.value);
      
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      
      default:
        console.warn(`Unsupported operator: ${rule.operator}`);
        return true;
    }
  }

  /**
   * Evaluates a filter group against an item
   */
  private static evaluateGroup(item: any, group: FilterGroup): boolean {
    const activeRules = group.rules.filter(rule => rule.enabled !== false);
    if (activeRules.length === 0) return true;

    const results = activeRules.map(rule => this.evaluateRule(item, rule));
    
    return group.logic === 'AND'
      ? results.every(result => result)
      : results.some(result => result);
  }

  /**
   * Builds a query object from filter rules (for API integration)
   */
  static buildQuery(filterState: ConditionalFilterState): FilterQuery {
    const conditions: QueryCondition[] = [];

    // Add individual rules
    filterState.rules
      .filter(rule => rule.enabled !== false)
      .forEach(rule => {
        conditions.push({
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          logic: rule.logic
        });
      });

    // Add group rules
    filterState.groups
      .filter(group => group.enabled !== false)
      .forEach(group => {
        group.rules
          .filter(rule => rule.enabled !== false)
          .forEach(rule => {
            conditions.push({
              field: rule.field,
              operator: rule.operator,
              value: rule.value,
              logic: group.logic
            });
          });
      });

    return {
      conditions,
      logic: filterState.globalLogic,
      optimized: false
    };
  }

  /**
   * Optimizes filter rules by removing redundancies and conflicts
   */
  static optimizeRules(filterState: ConditionalFilterState): OptimizationResult {
    const originalRules = [...filterState.rules];
    const conflicts = this.detectConflicts(filterState);
    
    let optimizedRules = this.removeRedundantRules(originalRules);
    optimizedRules = this.consolidateSimilarRules(optimizedRules);
    optimizedRules = this.reorderRulesForPerformance(optimizedRules);

    const performanceGain = this.calculatePerformanceGain(originalRules, optimizedRules);

    return {
      originalRules,
      optimizedRules,
      conflicts,
      performanceGain
    };
  }

  /**
   * Detects conflicts between filter rules
   */
  static detectConflicts(filterState: ConditionalFilterState): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    const allRules = this.getAllActiveRules(filterState);

    // Check for contradictions
    conflicts.push(...this.detectContradictions(allRules));
    
    // Check for redundancies
    conflicts.push(...this.detectRedundancies(allRules));
    
    // Check for inefficiencies
    conflicts.push(...this.detectInefficiencies(allRules));

    return conflicts;
  }

  /**
   * Validates filter state for correctness
   */
  static validateFilterState(filterState: ConditionalFilterState): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate rules
    filterState.rules.forEach((rule, index) => {
      const ruleValidation = this.validateRule(rule);
      if (!ruleValidation.isValid) {
        errors.push(`Rule ${index + 1}: ${ruleValidation.errors.join(', ')}`);
      }
      warnings.push(...ruleValidation.warnings.map(w => `Rule ${index + 1}: ${w}`));
    });

    // Validate groups
    filterState.groups.forEach((group, index) => {
      if (group.rules.length === 0) {
        warnings.push(`Group ${index + 1} (${group.name}) has no rules`);
      }
      
      group.rules.forEach((rule, ruleIndex) => {
        const ruleValidation = this.validateRule(rule);
        if (!ruleValidation.isValid) {
          errors.push(`Group ${index + 1}, Rule ${ruleIndex + 1}: ${ruleValidation.errors.join(', ')}`);
        }
      });
    });

    // Performance suggestions
    if (filterState.rules.length + filterState.groups.reduce((sum, g) => sum + g.rules.length, 0) > 10) {
      suggestions.push('Consider grouping related rules for better performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // Private helper methods

  private static getFieldValue(item: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], item);
  }

  private static stringContains(haystack: any, needle: any): boolean {
    if (typeof haystack !== 'string' || typeof needle !== 'string') return false;
    return haystack.toLowerCase().includes(needle.toLowerCase());
  }

  private static evaluateRange(value: any, range: any): boolean {
    if (!range || typeof range !== 'object') return false;
    
    const numValue = Number(value);
    if (isNaN(numValue)) return false;

    const { min, max } = range;
    const minCheck = min !== undefined ? numValue >= min : true;
    const maxCheck = max !== undefined ? numValue <= max : true;
    
    return minCheck && maxCheck;
  }

  private static getAllActiveRules(filterState: ConditionalFilterState): ConditionalFilterRule[] {
    const rules = [...filterState.rules.filter(rule => rule.enabled !== false)];
    
    filterState.groups
      .filter(group => group.enabled !== false)
      .forEach(group => {
        rules.push(...group.rules.filter(rule => rule.enabled !== false));
      });

    return rules;
  }

  private static detectContradictions(rules: ConditionalFilterRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];
        
        if (this.areRulesContradictory(rule1, rule2)) {
          conflicts.push({
            ruleIds: [rule1.id, rule2.id],
            type: 'contradiction',
            description: `Rules for field '${rule1.field}' contradict each other`,
            severity: 'high',
            suggestion: 'Review and resolve conflicting conditions'
          });
        }
      }
    }
    
    return conflicts;
  }

  private static detectRedundancies(rules: ConditionalFilterRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];
        
        if (this.areRulesRedundant(rule1, rule2)) {
          conflicts.push({
            ruleIds: [rule1.id, rule2.id],
            type: 'redundancy',
            description: `Duplicate rules for field '${rule1.field}'`,
            severity: 'medium',
            suggestion: 'Remove duplicate rule to improve performance'
          });
        }
      }
    }
    
    return conflicts;
  }

  private static detectInefficiencies(rules: ConditionalFilterRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    // Check for inefficient operator usage
    rules.forEach(rule => {
      if (rule.operator === 'contains' && typeof rule.value === 'string' && rule.value.length < 2) {
        conflicts.push({
          ruleIds: [rule.id],
          type: 'inefficiency',
          description: `Short search term in 'contains' filter may be inefficient`,
          severity: 'low',
          suggestion: 'Consider using longer search terms for better performance'
        });
      }
    });
    
    return conflicts;
  }

  private static areRulesContradictory(rule1: ConditionalFilterRule, rule2: ConditionalFilterRule): boolean {
    if (rule1.field !== rule2.field) return false;
    
    // Check for direct contradictions
    if (rule1.operator === 'equals' && rule2.operator === 'not_equals') {
      return rule1.value === rule2.value;
    }
    
    if (rule1.operator === 'in' && rule2.operator === 'not_in') {
      return JSON.stringify(rule1.value) === JSON.stringify(rule2.value);
    }
    
    return false;
  }

  private static areRulesRedundant(rule1: ConditionalFilterRule, rule2: ConditionalFilterRule): boolean {
    return rule1.field === rule2.field &&
           rule1.operator === rule2.operator &&
           JSON.stringify(rule1.value) === JSON.stringify(rule2.value);
  }

  private static removeRedundantRules(rules: ConditionalFilterRule[]): ConditionalFilterRule[] {
    const seen = new Set<string>();
    return rules.filter(rule => {
      const key = `${rule.field}-${rule.operator}-${JSON.stringify(rule.value)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private static consolidateSimilarRules(rules: ConditionalFilterRule[]): ConditionalFilterRule[] {
    // Group rules by field and operator
    const grouped = new Map<string, ConditionalFilterRule[]>();
    
    rules.forEach(rule => {
      const key = `${rule.field}-${rule.operator}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(rule);
    });

    const consolidated: ConditionalFilterRule[] = [];
    
    grouped.forEach((groupRules, key) => {
      if (groupRules.length === 1) {
        consolidated.push(groupRules[0]);
      } else {
        // Try to consolidate multiple rules into one
        const consolidatedRule = this.tryConsolidateRules(groupRules);
        if (consolidatedRule) {
          consolidated.push(consolidatedRule);
        } else {
          consolidated.push(...groupRules);
        }
      }
    });

    return consolidated;
  }

  private static tryConsolidateRules(rules: ConditionalFilterRule[]): ConditionalFilterRule | null {
    if (rules.length < 2) return null;
    
    const firstRule = rules[0];
    
    // Consolidate 'in' operations
    if (firstRule.operator === 'in' && rules.every(r => r.operator === 'in')) {
      const allValues = rules.flatMap(r => Array.isArray(r.value) ? r.value : [r.value]);
      const uniqueValues = [...new Set(allValues)];
      
      return {
        ...firstRule,
        value: uniqueValues,
        id: `consolidated-${firstRule.id}`
      };
    }
    
    return null;
  }

  private static reorderRulesForPerformance(rules: ConditionalFilterRule[]): ConditionalFilterRule[] {
    // Sort rules by performance impact (most selective first)
    return [...rules].sort((a, b) => {
      const scoreA = this.getRulePerformanceScore(a);
      const scoreB = this.getRulePerformanceScore(b);
      return scoreB - scoreA; // Higher score first
    });
  }

  private static getRulePerformanceScore(rule: ConditionalFilterRule): number {
    // Simple scoring based on operator efficiency
    const operatorScores: Record<FilterOperator, number> = {
      'equals': 10,
      'not_equals': 9,
      'in': 8,
      'not_in': 7,
      'exists': 6,
      'range': 5,
      'contains': 3,
      'not_contains': 2
    };
    
    return operatorScores[rule.operator] || 1;
  }

  private static calculatePerformanceGain(original: ConditionalFilterRule[], optimized: ConditionalFilterRule[]): number {
    const originalComplexity = original.length;
    const optimizedComplexity = optimized.length;
    
    if (originalComplexity === 0) return 0;
    
    return Math.round(((originalComplexity - optimizedComplexity) / originalComplexity) * 100);
  }

  private static validateRule(rule: ConditionalFilterRule): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate required fields
    if (!rule.id) errors.push('Rule ID is required');
    if (!rule.field) errors.push('Field is required');
    if (!this.SUPPORTED_OPERATORS.includes(rule.operator)) {
      errors.push(`Unsupported operator: ${rule.operator}`);
    }

    // Validate operator-specific requirements
    if (['in', 'not_in'].includes(rule.operator) && !Array.isArray(rule.value)) {
      errors.push(`Operator '${rule.operator}' requires an array value`);
    }

    if (rule.operator === 'range' && (!rule.value || typeof rule.value !== 'object')) {
      errors.push(`Operator 'range' requires an object with min/max properties`);
    }

    // Performance warnings
    if (rule.operator === 'contains' && typeof rule.value === 'string' && rule.value.length < 3) {
      warnings.push('Short search terms may impact performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}