/**
 * FilterValidationService - Validates conditional filter combinations
 * Provides comprehensive validation for enhanced filter states
 */

import {
  EnhancedFilterState,
  FilterState
} from '../types/marketplace.types';
import {
  ConditionalFilterRule,
  FilterGroup,
  FilterValidationResult,
  RuleConflict
} from '../types/conditional-filter.types';
import { ConditionalFilterEngine } from './ConditionalFilterEngine';

export interface ValidationOptions {
  validateLegacyFilters: boolean;
  validateConditionalRules: boolean;
  validateFilterGroups: boolean;
  checkForConflicts: boolean;
  performanceCheck: boolean;
  strictMode: boolean;
}

export interface ComprehensiveValidationResult extends FilterValidationResult {
  legacyValidation?: FilterValidationResult;
  conditionalValidation?: FilterValidationResult;
  groupValidation?: FilterValidationResult;
  conflicts: RuleConflict[];
  performanceMetrics?: PerformanceValidationResult;
  recommendations: ValidationRecommendation[];
}

export interface PerformanceValidationResult {
  estimatedExecutionTime: number;
  complexityScore: number;
  optimizationSuggestions: string[];
  resourceUsage: {
    memory: 'low' | 'medium' | 'high';
    cpu: 'low' | 'medium' | 'high';
  };
}

export interface ValidationRecommendation {
  type: 'optimization' | 'usability' | 'performance' | 'correctness';
  priority: 'low' | 'medium' | 'high';
  message: string;
  action?: string;
  autoFixAvailable: boolean;
}

export class FilterValidationService {
  private static readonly MAX_RULES_WARNING = 15;
  private static readonly MAX_RULES_ERROR = 50;
  private static readonly MAX_GROUP_DEPTH = 3;

  /**
   * Validates an enhanced filter state comprehensively
   */
  static validateEnhancedFilterState(
    state: EnhancedFilterState,
    options: Partial<ValidationOptions> = {}
  ): ComprehensiveValidationResult {
    const validationOptions: ValidationOptions = {
      validateLegacyFilters: true,
      validateConditionalRules: true,
      validateFilterGroups: true,
      checkForConflicts: true,
      performanceCheck: true,
      strictMode: false,
      ...options
    };

    const result: ComprehensiveValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      conflicts: [],
      recommendations: []
    };

    // Validate legacy filter structure
    if (validationOptions.validateLegacyFilters) {
      result.legacyValidation = this.validateLegacyFilters(state);
      this.mergeValidationResults(result, result.legacyValidation);
    }

    // Validate conditional rules
    if (validationOptions.validateConditionalRules) {
      result.conditionalValidation = this.validateConditionalRules(state.conditionalRules);
      this.mergeValidationResults(result, result.conditionalValidation);
    }

    // Validate filter groups
    if (validationOptions.validateFilterGroups) {
      result.groupValidation = this.validateFilterGroups(state.filterGroups);
      this.mergeValidationResults(result, result.groupValidation);
    }

    // Check for conflicts
    if (validationOptions.checkForConflicts) {
      result.conflicts = ConditionalFilterEngine.detectConflicts({
        rules: state.conditionalRules,
        groups: state.filterGroups,
        globalLogic: state.globalLogic
      });
      
      // Add conflict errors to main result
      result.conflicts.forEach(conflict => {
        if (conflict.severity === 'high') {
          result.errors.push(conflict.description);
        } else if (conflict.severity === 'medium') {
          result.warnings.push(conflict.description);
        } else {
          result.suggestions.push(conflict.suggestion || conflict.description);
        }
      });
    }

    // Performance validation
    if (validationOptions.performanceCheck) {
      result.performanceMetrics = this.validatePerformance(state);
      
      if (result.performanceMetrics.complexityScore > 80) {
        result.warnings.push('High filter complexity may impact performance');
      }
    }

    // Generate recommendations
    result.recommendations = this.generateRecommendations(state, result);

    // Final validation status
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Validates legacy filter structure
   */
  private static validateLegacyFilters(state: FilterState): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate search filter
    if (state.search.query && state.search.query.length < 2) {
      warnings.push('Search query is very short and may return too many results');
    }

    // Validate location filters
    if (state.location.cities.length === 0 && state.location.regions.length === 0 && state.location.neighborhoods.length === 0) {
      suggestions.push('Consider adding location filters to narrow down results');
    }

    // Validate price filters
    if (state.price.min < 0) {
      errors.push('Minimum price cannot be negative');
    }

    if (state.price.max < state.price.min) {
      errors.push('Maximum price must be greater than minimum price');
    }

    if (state.price.max === Number.MAX_SAFE_INTEGER && state.price.min === 0) {
      suggestions.push('Consider setting price range to get more relevant results');
    }

    // Validate rating filter
    if (state.features.rating !== null && (state.features.rating < 0 || state.features.rating > 5)) {
      errors.push('Rating must be between 0 and 5');
    }

    // Check for overly restrictive filters
    const activeFilterCount = this.countActiveFilters(state);
    if (activeFilterCount > 8) {
      warnings.push('Many active filters may result in very few or no results');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validates conditional rules
   */
  private static validateConditionalRules(rules: ConditionalFilterRule[]): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check rule count
    if (rules.length > this.MAX_RULES_ERROR) {
      errors.push(`Too many rules (${rules.length}). Maximum allowed: ${this.MAX_RULES_ERROR}`);
    } else if (rules.length > this.MAX_RULES_WARNING) {
      warnings.push(`Large number of rules (${rules.length}) may impact performance`);
    }

    // Validate each rule
    rules.forEach((rule, index) => {
      const ruleValidation = this.validateSingleRule(rule, index);
      errors.push(...ruleValidation.errors);
      warnings.push(...ruleValidation.warnings);
      suggestions.push(...ruleValidation.suggestions);
    });

    // Check for duplicate rules
    const duplicates = this.findDuplicateRules(rules);
    if (duplicates.length > 0) {
      warnings.push(`Found ${duplicates.length} duplicate rules that could be consolidated`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validates filter groups
   */
  private static validateFilterGroups(groups: FilterGroup[]): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    groups.forEach((group, index) => {
      // Validate group structure
      if (!group.id) {
        errors.push(`Group ${index + 1} missing ID`);
      }

      if (!group.name || group.name.trim().length === 0) {
        errors.push(`Group ${index + 1} missing or empty name`);
      }

      if (!group.rules || !Array.isArray(group.rules)) {
        errors.push(`Group ${index + 1} missing or invalid rules array`);
      }

      // Validate group rules
      if (group.rules && group.rules.length === 0) {
        warnings.push(`Group "${group.name}" has no rules and will be ignored`);
      }

      if (group.rules && group.rules.length > 10) {
        warnings.push(`Group "${group.name}" has many rules (${group.rules.length}) which may impact performance`);
      }

      // Validate individual rules in group
      if (group.rules) {
        group.rules.forEach((rule, ruleIndex) => {
          const ruleValidation = this.validateSingleRule(rule, ruleIndex, `Group "${group.name}"`);
          errors.push(...ruleValidation.errors);
          warnings.push(...ruleValidation.warnings);
          suggestions.push(...ruleValidation.suggestions);
        });
      }
    });

    // Check for empty groups
    const emptyGroups = groups.filter(g => !g.rules || g.rules.length === 0);
    if (emptyGroups.length > 0) {
      suggestions.push(`Consider removing ${emptyGroups.length} empty groups`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validates a single rule
   */
  private static validateSingleRule(
    rule: ConditionalFilterRule,
    index: number,
    context: string = ''
  ): FilterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const prefix = context ? `${context}, Rule ${index + 1}` : `Rule ${index + 1}`;

    // Required fields
    if (!rule.id) {
      errors.push(`${prefix}: Missing ID`);
    }

    if (!rule.field) {
      errors.push(`${prefix}: Missing field`);
    }

    if (!rule.operator) {
      errors.push(`${prefix}: Missing operator`);
    }

    if (rule.value === undefined || rule.value === null) {
      warnings.push(`${prefix}: Value is null or undefined`);
    }

    // Operator-specific validation
    if (rule.operator === 'in' || rule.operator === 'not_in') {
      if (!Array.isArray(rule.value)) {
        errors.push(`${prefix}: Operator '${rule.operator}' requires array value`);
      } else if (rule.value.length === 0) {
        warnings.push(`${prefix}: Empty array for '${rule.operator}' operator`);
      }
    }

    if (rule.operator === 'range') {
      if (!rule.value || typeof rule.value !== 'object') {
        errors.push(`${prefix}: Range operator requires object with min/max properties`);
      } else {
        const { min, max } = rule.value;
        if (min !== undefined && max !== undefined && min > max) {
          errors.push(`${prefix}: Range minimum (${min}) is greater than maximum (${max})`);
        }
      }
    }

    if (rule.operator === 'contains' || rule.operator === 'not_contains') {
      if (typeof rule.value === 'string' && rule.value.length < 2) {
        warnings.push(`${prefix}: Short search term may be inefficient`);
      }
    }

    // Performance suggestions
    if (rule.field && rule.field.includes('.')) {
      const depth = rule.field.split('.').length;
      if (depth > 3) {
        suggestions.push(`${prefix}: Deep field path may impact performance`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validates performance characteristics
   */
  private static validatePerformance(state: EnhancedFilterState): PerformanceValidationResult {
    const totalRules = state.conditionalRules.length + 
                      state.filterGroups.reduce((sum, group) => sum + group.rules.length, 0);
    
    const complexityScore = this.calculateComplexityScore(state);
    const estimatedExecutionTime = this.estimateExecutionTime(state);
    
    const optimizationSuggestions: string[] = [];
    
    if (totalRules > 20) {
      optimizationSuggestions.push('Consider consolidating similar rules');
    }
    
    if (state.filterGroups.length > 5) {
      optimizationSuggestions.push('Consider reducing the number of filter groups');
    }
    
    const containsRules = state.conditionalRules.filter(r => r.operator === 'contains').length;
    if (containsRules > 3) {
      optimizationSuggestions.push('Multiple text search rules may be slow - consider combining them');
    }

    return {
      estimatedExecutionTime,
      complexityScore,
      optimizationSuggestions,
      resourceUsage: {
        memory: totalRules > 30 ? 'high' : totalRules > 15 ? 'medium' : 'low',
        cpu: complexityScore > 70 ? 'high' : complexityScore > 40 ? 'medium' : 'low'
      }
    };
  }

  /**
   * Generates recommendations based on validation results
   */
  private static generateRecommendations(
    state: EnhancedFilterState,
    validationResult: ComprehensiveValidationResult
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // Performance recommendations
    if (validationResult.performanceMetrics?.complexityScore && validationResult.performanceMetrics.complexityScore > 60) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Filter complexity is high and may impact performance',
        action: 'Consider simplifying filter rules or using filter groups',
        autoFixAvailable: false
      });
    }

    // Usability recommendations
    const totalActiveFilters = this.countActiveFilters(state) + state.conditionalRules.length;
    if (totalActiveFilters > 10) {
      recommendations.push({
        type: 'usability',
        priority: 'medium',
        message: 'Many active filters may make results too narrow',
        action: 'Consider removing some filters or saving this combination for later use',
        autoFixAvailable: false
      });
    }

    // Optimization recommendations
    const duplicateRules = this.findDuplicateRules(state.conditionalRules);
    if (duplicateRules.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'low',
        message: `Found ${duplicateRules.length} duplicate rules`,
        action: 'Remove duplicate rules to improve performance',
        autoFixAvailable: true
      });
    }

    // Correctness recommendations
    if (validationResult.conflicts.length > 0) {
      const highSeverityConflicts = validationResult.conflicts.filter(c => c.severity === 'high');
      if (highSeverityConflicts.length > 0) {
        recommendations.push({
          type: 'correctness',
          priority: 'high',
          message: `Found ${highSeverityConflicts.length} critical filter conflicts`,
          action: 'Review and resolve conflicting filter rules',
          autoFixAvailable: false
        });
      }
    }

    return recommendations;
  }

  // Helper methods

  private static countActiveFilters(state: FilterState): number {
    let count = 0;
    
    if (state.search.query.length > 0) count++;
    if (state.location.cities.length > 0) count++;
    if (state.location.regions.length > 0) count++;
    if (state.location.neighborhoods.length > 0) count++;
    if (state.category.categories.length > 0) count++;
    if (state.category.venueTypes.length > 0) count++;
    if (state.category.environments.length > 0) count++;
    if (state.price.ranges.length > 0) count++;
    if (state.price.min > 0 || state.price.max < Number.MAX_SAFE_INTEGER) count++;
    if (state.features.allowsMoments !== null) count++;
    if (state.features.rating !== null) count++;
    if (state.features.accessibility.length > 0) count++;
    if (state.features.supportedFormats.length > 0) count++;
    if (state.availability.timeSlots.length > 0) count++;
    if (state.availability.daysOfWeek.length > 0) count++;
    if (state.showFavoritesOnly) count++;
    if (!state.showCircuits) count++;
    
    return count;
  }

  private static findDuplicateRules(rules: ConditionalFilterRule[]): ConditionalFilterRule[] {
    const seen = new Map<string, ConditionalFilterRule>();
    const duplicates: ConditionalFilterRule[] = [];

    rules.forEach(rule => {
      const key = `${rule.field}-${rule.operator}-${JSON.stringify(rule.value)}`;
      if (seen.has(key)) {
        duplicates.push(rule);
      } else {
        seen.set(key, rule);
      }
    });

    return duplicates;
  }

  private static calculateComplexityScore(state: EnhancedFilterState): number {
    let score = 0;
    
    // Base score from rule count
    score += state.conditionalRules.length * 2;
    
    // Group complexity
    state.filterGroups.forEach(group => {
      score += group.rules.length * 1.5;
      if (group.logic === 'OR') score += 2; // OR logic is more complex
    });
    
    // Operator complexity
    state.conditionalRules.forEach(rule => {
      switch (rule.operator) {
        case 'contains':
        case 'not_contains':
          score += 3;
          break;
        case 'range':
          score += 2;
          break;
        case 'in':
        case 'not_in':
          score += Array.isArray(rule.value) ? rule.value.length * 0.5 : 1;
          break;
        default:
          score += 1;
      }
    });
    
    // Field depth complexity
    const allRules = [...state.conditionalRules, ...state.filterGroups.flatMap(g => g.rules)];
    allRules.forEach(rule => {
      const depth = rule.field.split('.').length;
      if (depth > 2) score += depth - 2;
    });
    
    return Math.min(score, 100); // Cap at 100
  }

  private static estimateExecutionTime(state: EnhancedFilterState): number {
    const baseTime = 1; // 1ms base
    const ruleTime = state.conditionalRules.length * 0.1;
    const groupTime = state.filterGroups.reduce((sum, group) => sum + group.rules.length * 0.15, 0);
    
    return baseTime + ruleTime + groupTime;
  }

  private static mergeValidationResults(
    target: ComprehensiveValidationResult,
    source: FilterValidationResult
  ): void {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.suggestions.push(...source.suggestions);
  }

  /**
   * Quick validation for basic use cases
   */
  static quickValidate(state: EnhancedFilterState): boolean {
    return this.validateEnhancedFilterState(state, {
      validateLegacyFilters: true,
      validateConditionalRules: true,
      validateFilterGroups: false,
      checkForConflicts: false,
      performanceCheck: false,
      strictMode: false
    }).isValid;
  }

  /**
   * Validates only the conditional logic parts
   */
  static validateConditionalLogicOnly(state: EnhancedFilterState): FilterValidationResult {
    const conditionalValidation = this.validateConditionalRules(state.conditionalRules);
    const groupValidation = this.validateFilterGroups(state.filterGroups);

    return {
      isValid: conditionalValidation.isValid && groupValidation.isValid,
      errors: [...conditionalValidation.errors, ...groupValidation.errors],
      warnings: [...conditionalValidation.warnings, ...groupValidation.warnings],
      suggestions: [...conditionalValidation.suggestions, ...groupValidation.suggestions]
    };
  }
}