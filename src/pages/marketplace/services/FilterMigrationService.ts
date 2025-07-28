/**
 * FilterMigrationService - Handles migration between filter state versions
 * Provides utilities to convert legacy FilterState to EnhancedFilterState
 */

import {
  FilterState,
  EnhancedFilterState,
  FilterStateMetadata,
  MigrationInfo
} from '../types/marketplace.types';
import {
  ConditionalFilterRule,
  FilterGroup,
  LogicOperator,
  createFilterRule,
  createFilterGroup
} from '../types/conditional-filter.types';

export interface MigrationResult {
  success: boolean;
  migratedState?: EnhancedFilterState;
  warnings: string[];
  errors: string[];
  dataLoss: boolean;
}

export interface MigrationOptions {
  strategy: 'automatic' | 'manual' | 'hybrid';
  preserveLegacyFields: boolean;
  validateAfterMigration: boolean;
  generateConditionalRules: boolean;
}

export class FilterMigrationService {
  private static readonly CURRENT_VERSION = '2.0';
  private static readonly LEGACY_VERSION = '1.0';

  /**
   * Migrates a legacy FilterState to EnhancedFilterState
   */
  static migrateFilterState(
    legacyState: FilterState,
    options: Partial<MigrationOptions> = {}
  ): MigrationResult {
    const migrationOptions: MigrationOptions = {
      strategy: 'automatic',
      preserveLegacyFields: true,
      validateAfterMigration: true,
      generateConditionalRules: true,
      ...options
    };

    const warnings: string[] = [];
    const errors: string[] = [];
    let dataLoss = false;

    try {
      // Create base enhanced state
      const enhancedState: EnhancedFilterState = {
        ...legacyState,
        conditionalRules: [],
        filterGroups: [],
        globalLogic: 'AND' as LogicOperator,
        displayMode: 'sections',
        viewMode: 'grid',
        metadata: this.createMigrationMetadata(migrationOptions.strategy, warnings, dataLoss)
      };

      // Generate conditional rules from legacy filters if requested
      if (migrationOptions.generateConditionalRules) {
        const { rules, groups, migrationWarnings } = this.generateConditionalRules(legacyState);
        enhancedState.conditionalRules = rules;
        enhancedState.filterGroups = groups;
        warnings.push(...migrationWarnings);
      }

      // Validate migrated state if requested
      if (migrationOptions.validateAfterMigration) {
        const validationResult = this.validateMigratedState(enhancedState);
        if (!validationResult.isValid) {
          errors.push(...validationResult.errors);
          warnings.push(...validationResult.warnings);
        }
      }

      return {
        success: errors.length === 0,
        migratedState: enhancedState,
        warnings,
        errors,
        dataLoss
      };

    } catch (error) {
      errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        warnings,
        errors,
        dataLoss: true
      };
    }
  }

  /**
   * Converts legacy filter state to conditional rules
   */
  private static generateConditionalRules(legacyState: FilterState): {
    rules: ConditionalFilterRule[];
    groups: FilterGroup[];
    migrationWarnings: string[];
  } {
    const rules: ConditionalFilterRule[] = [];
    const groups: FilterGroup[] = [];
    const migrationWarnings: string[] = [];

    // Convert search filter
    if (legacyState.search.query) {
      rules.push(createFilterRule('name', 'contains', legacyState.search.query, 'AND'));
    }

    // Convert location filters
    if (legacyState.location.cities.length > 0) {
      rules.push(createFilterRule('locationDetails.city', 'in', legacyState.location.cities, 'AND'));
    }

    if (legacyState.location.regions.length > 0) {
      rules.push(createFilterRule('locationDetails.region', 'in', legacyState.location.regions, 'AND'));
    }

    if (legacyState.location.neighborhoods.length > 0) {
      rules.push(createFilterRule('locationDetails.neighborhood', 'in', legacyState.location.neighborhoods, 'AND'));
    }

    // Convert category filters
    if (legacyState.category.categories.length > 0) {
      rules.push(createFilterRule('category.name', 'in', legacyState.category.categories, 'AND'));
    }

    if (legacyState.category.venueTypes.length > 0) {
      rules.push(createFilterRule('venue.type', 'in', legacyState.category.venueTypes, 'AND'));
    }

    if (legacyState.category.environments.length > 0) {
      rules.push(createFilterRule('environment', 'in', legacyState.category.environments, 'AND'));
    }

    // Convert price filters
    if (legacyState.price.min > 0 || legacyState.price.max < Number.MAX_SAFE_INTEGER) {
      rules.push(createFilterRule('price', 'range', {
        min: legacyState.price.min,
        max: legacyState.price.max === Number.MAX_SAFE_INTEGER ? undefined : legacyState.price.max
      }, 'AND'));
    }

    if (legacyState.price.ranges.length > 0) {
      // Create a group for price ranges since they represent OR logic
      const priceRangeRules = legacyState.price.ranges.map(range =>
        createFilterRule('price', 'in', [range], 'OR')
      );
      
      if (priceRangeRules.length > 0) {
        groups.push(createFilterGroup('Price Ranges', priceRangeRules, 'OR'));
      }
    }

    // Convert feature filters
    if (legacyState.features.allowsMoments !== null) {
      rules.push(createFilterRule('pricing.allowMoments', 'equals', legacyState.features.allowsMoments, 'AND'));
    }

    if (legacyState.features.rating !== null) {
      rules.push(createFilterRule('rating', 'range', { min: legacyState.features.rating }, 'AND'));
    }

    if (legacyState.features.accessibility.length > 0) {
      rules.push(createFilterRule('accessibility', 'in', legacyState.features.accessibility, 'AND'));
    }

    if (legacyState.features.supportedFormats.length > 0) {
      rules.push(createFilterRule('media.supportedFormats', 'in', legacyState.features.supportedFormats, 'AND'));
    }

    // Convert availability filters
    if (legacyState.availability.timeSlots.length > 0) {
      rules.push(createFilterRule('operatingHours', 'in', legacyState.availability.timeSlots, 'AND'));
    }

    if (legacyState.availability.daysOfWeek.length > 0) {
      rules.push(createFilterRule('operatingHours.daysActive', 'in', legacyState.availability.daysOfWeek, 'AND'));
    }

    // Convert boolean filters
    if (legacyState.showFavoritesOnly) {
      rules.push(createFilterRule('isFavorite', 'equals', true, 'AND'));
      migrationWarnings.push('Favorites filter converted - requires user context to function properly');
    }

    if (!legacyState.showCircuits) {
      rules.push(createFilterRule('isCircuit', 'equals', false, 'AND'));
    }

    return {
      rules,
      groups,
      migrationWarnings
    };
  }

  /**
   * Creates metadata for the migration
   */
  private static createMigrationMetadata(
    strategy: MigrationOptions['strategy'],
    warnings: string[],
    dataLoss: boolean
  ): FilterStateMetadata {
    const migrationInfo: MigrationInfo = {
      fromVersion: this.LEGACY_VERSION,
      toVersion: this.CURRENT_VERSION,
      migratedAt: new Date(),
      migrationStrategy: strategy,
      warnings: [...warnings],
      dataLoss
    };

    return {
      lastModified: new Date(),
      source: 'migration',
      version: this.CURRENT_VERSION,
      migrationInfo
    };
  }

  /**
   * Validates the migrated state
   */
  private static validateMigratedState(state: EnhancedFilterState): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!state.metadata) {
      errors.push('Missing metadata in migrated state');
    }

    if (!state.conditionalRules) {
      errors.push('Missing conditionalRules array');
    }

    if (!state.filterGroups) {
      errors.push('Missing filterGroups array');
    }

    if (!state.globalLogic) {
      errors.push('Missing globalLogic');
    }

    // Validate conditional rules
    state.conditionalRules?.forEach((rule, index) => {
      if (!rule.id) {
        errors.push(`Rule ${index + 1} missing ID`);
      }
      if (!rule.field) {
        errors.push(`Rule ${index + 1} missing field`);
      }
      if (!rule.operator) {
        errors.push(`Rule ${index + 1} missing operator`);
      }
    });

    // Validate filter groups
    state.filterGroups?.forEach((group, index) => {
      if (!group.id) {
        errors.push(`Group ${index + 1} missing ID`);
      }
      if (!group.name) {
        errors.push(`Group ${index + 1} missing name`);
      }
      if (!group.rules) {
        errors.push(`Group ${index + 1} missing rules array`);
      }
    });

    // Performance warnings
    const totalRules = (state.conditionalRules?.length || 0) + 
                      (state.filterGroups?.reduce((sum, group) => sum + (group.rules?.length || 0), 0) || 0);
    
    if (totalRules > 20) {
      warnings.push('Large number of filter rules may impact performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Converts EnhancedFilterState back to legacy FilterState for backward compatibility
   */
  static convertToLegacyState(enhancedState: EnhancedFilterState): FilterState {
    // Extract the base FilterState properties
    const {
      conditionalRules,
      filterGroups,
      globalLogic,
      displayMode,
      viewMode,
      metadata,
      ...legacyState
    } = enhancedState;

    return legacyState;
  }

  /**
   * Checks if a filter state needs migration
   */
  static needsMigration(state: FilterState | EnhancedFilterState): boolean {
    return !('conditionalRules' in state) || !('metadata' in state);
  }

  /**
   * Gets the version of a filter state
   */
  static getFilterStateVersion(state: FilterState | EnhancedFilterState): string {
    if ('metadata' in state && state.metadata?.version) {
      return state.metadata.version;
    }
    return this.LEGACY_VERSION;
  }

  /**
   * Batch migrates multiple filter states
   */
  static batchMigrate(
    states: FilterState[],
    options: Partial<MigrationOptions> = {}
  ): {
    successful: EnhancedFilterState[];
    failed: Array<{ index: number; state: FilterState; errors: string[] }>;
    warnings: string[];
  } {
    const successful: EnhancedFilterState[] = [];
    const failed: Array<{ index: number; state: FilterState; errors: string[] }> = [];
    const allWarnings: string[] = [];

    states.forEach((state, index) => {
      const result = this.migrateFilterState(state, options);
      
      if (result.success && result.migratedState) {
        successful.push(result.migratedState);
      } else {
        failed.push({
          index,
          state,
          errors: result.errors
        });
      }
      
      allWarnings.push(...result.warnings);
    });

    return {
      successful,
      failed,
      warnings: allWarnings
    };
  }

  /**
   * Creates a backward compatibility adapter
   */
  static createBackwardCompatibilityAdapter() {
    return {
      /**
       * Wraps a function that expects EnhancedFilterState to work with legacy FilterState
       */
      wrapFunction<T extends any[], R>(
        fn: (state: EnhancedFilterState, ...args: T) => R
      ): (state: FilterState | EnhancedFilterState, ...args: T) => R {
        return (state: FilterState | EnhancedFilterState, ...args: T): R => {
          if (FilterMigrationService.needsMigration(state)) {
            const migrationResult = FilterMigrationService.migrateFilterState(state as FilterState);
            if (migrationResult.success && migrationResult.migratedState) {
              return fn(migrationResult.migratedState, ...args);
            } else {
              throw new Error(`Migration failed: ${migrationResult.errors.join(', ')}`);
            }
          }
          return fn(state as EnhancedFilterState, ...args);
        };
      },

      /**
       * Creates a hook that automatically migrates state
       */
      createMigrationHook(state: FilterState | EnhancedFilterState): EnhancedFilterState {
        if (FilterMigrationService.needsMigration(state)) {
          const migrationResult = FilterMigrationService.migrateFilterState(state as FilterState);
          if (migrationResult.success && migrationResult.migratedState) {
            return migrationResult.migratedState;
          } else {
            console.warn('Filter migration failed, using default state');
            return FilterMigrationService.createDefaultEnhancedState();
          }
        }
        return state as EnhancedFilterState;
      }
    };
  }

  /**
   * Creates a default enhanced filter state
   */
  static createDefaultEnhancedState(): EnhancedFilterState {
    const legacyState: FilterState = {
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

    const migrationResult = this.migrateFilterState(legacyState);
    return migrationResult.migratedState || {
      ...legacyState,
      conditionalRules: [],
      filterGroups: [],
      globalLogic: 'AND' as LogicOperator,
      displayMode: 'sections',
      viewMode: 'grid',
      metadata: {
        lastModified: new Date(),
        source: 'user',
        version: this.CURRENT_VERSION
      }
    };
  }
}