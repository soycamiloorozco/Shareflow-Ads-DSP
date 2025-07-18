/**
 * FilterCompatibilityLayer - Provides backward compatibility for existing components
 * Allows existing components to work with both legacy and enhanced filter states
 */

import React from 'react';
import {
  FilterState,
  EnhancedFilterState,
  FilterOptions
} from '../types/marketplace.types';
import { FilterMigrationService } from './FilterMigrationService';
import { FilterValidationService } from './FilterValidationService';

export type CompatibleFilterState = FilterState | EnhancedFilterState;

export interface CompatibilityOptions {
  autoMigrate: boolean;
  validateOnMigration: boolean;
  preserveLegacyBehavior: boolean;
  logMigrationWarnings: boolean;
}

export interface CompatibilityAdapter {
  // State management
  normalizeState(state: CompatibleFilterState): EnhancedFilterState;
  extractLegacyState(state: CompatibleFilterState): FilterState;
  
  // Component adapters
  wrapFilterComponent<P extends { filters: FilterState }>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P & { filters: CompatibleFilterState }>;
  
  // Hook adapters
  createCompatibleHook<T>(
    hook: (state: EnhancedFilterState) => T
  ): (state: CompatibleFilterState) => T;
  
  // Utility functions
  isEnhanced(state: CompatibleFilterState): state is EnhancedFilterState;
  needsUpgrade(state: CompatibleFilterState): boolean;
}

export class FilterCompatibilityLayer {
  private static defaultOptions: CompatibilityOptions = {
    autoMigrate: true,
    validateOnMigration: true,
    preserveLegacyBehavior: false,
    logMigrationWarnings: true
  };

  /**
   * Creates a compatibility adapter with specified options
   */
  static createAdapter(options: Partial<CompatibilityOptions> = {}): CompatibilityAdapter {
    const adapterOptions = { ...this.defaultOptions, ...options };

    return {
      normalizeState: (state: CompatibleFilterState): EnhancedFilterState => {
        return this.normalizeState(state, adapterOptions);
      },

      extractLegacyState: (state: CompatibleFilterState): FilterState => {
        return this.extractLegacyState(state);
      },

      wrapFilterComponent: <P extends { filters: FilterState }>(
        Component: React.ComponentType<P>
      ) => {
        return this.wrapFilterComponent(Component, adapterOptions);
      },

      createCompatibleHook: <T>(hook: (state: EnhancedFilterState) => T) => {
        return (state: CompatibleFilterState): T => {
          const normalizedState = this.normalizeState(state, adapterOptions);
          return hook(normalizedState);
        };
      },

      isEnhanced: (state: CompatibleFilterState): state is EnhancedFilterState => {
        return this.isEnhancedState(state);
      },

      needsUpgrade: (state: CompatibleFilterState): boolean => {
        return FilterMigrationService.needsMigration(state);
      }
    };
  }

  /**
   * Normalizes any filter state to EnhancedFilterState
   */
  private static normalizeState(
    state: CompatibleFilterState,
    options: CompatibilityOptions
  ): EnhancedFilterState {
    if (this.isEnhancedState(state)) {
      return state;
    }

    if (!options.autoMigrate) {
      throw new Error('Legacy filter state provided but auto-migration is disabled');
    }

    const migrationResult = FilterMigrationService.migrateFilterState(state, {
      strategy: 'automatic',
      preserveLegacyFields: true,
      validateAfterMigration: options.validateOnMigration,
      generateConditionalRules: !options.preserveLegacyBehavior
    });

    if (!migrationResult.success || !migrationResult.migratedState) {
      if (options.logMigrationWarnings) {
        console.warn('Filter migration failed:', migrationResult.errors);
      }
      return FilterMigrationService.createDefaultEnhancedState();
    }

    if (options.logMigrationWarnings && migrationResult.warnings.length > 0) {
      console.warn('Filter migration warnings:', migrationResult.warnings);
    }

    return migrationResult.migratedState;
  }

  /**
   * Extracts legacy FilterState from any compatible state
   */
  private static extractLegacyState(state: CompatibleFilterState): FilterState {
    if (this.isEnhancedState(state)) {
      return FilterMigrationService.convertToLegacyState(state);
    }
    return state;
  }

  /**
   * Wraps a React component to handle both legacy and enhanced filter states
   */
  private static wrapFilterComponent<P extends { filters: FilterState }>(
    Component: React.ComponentType<P>,
    options: CompatibilityOptions
  ): React.ComponentType<P & { filters: CompatibleFilterState }> {
    return (props: P & { filters: CompatibleFilterState }) => {
      const legacyFilters = this.extractLegacyState(props.filters);
      const componentProps = {
        ...props,
        filters: legacyFilters
      } as P;

      return React.createElement(Component, componentProps);
    };
  }

  /**
   * Type guard to check if state is enhanced
   */
  private static isEnhancedState(state: CompatibleFilterState): state is EnhancedFilterState {
    return state !== null && typeof state === 'object' && 'conditionalRules' in state && 'metadata' in state;
  }

  /**
   * Creates a compatibility wrapper for filter-related functions
   */
  static wrapFilterFunction<TArgs extends any[], TReturn>(
    fn: (state: EnhancedFilterState, ...args: TArgs) => TReturn,
    options: Partial<CompatibilityOptions> = {}
  ): (state: CompatibleFilterState, ...args: TArgs) => TReturn {
    const adapterOptions = { ...this.defaultOptions, ...options };

    return (state: CompatibleFilterState, ...args: TArgs): TReturn => {
      const normalizedState = this.normalizeState(state, adapterOptions);
      return fn(normalizedState, ...args);
    };
  }

  /**
   * Creates a compatibility wrapper for React hooks
   */
  static wrapFilterHook<TReturn>(
    hook: (state: EnhancedFilterState) => TReturn,
    options: Partial<CompatibilityOptions> = {}
  ): (state: CompatibleFilterState) => TReturn {
    const adapterOptions = { ...this.defaultOptions, ...options };

    return (state: CompatibleFilterState): TReturn => {
      const normalizedState = this.normalizeState(state, adapterOptions);
      return hook(normalizedState);
    };
  }

  /**
   * Provides utilities for gradual migration
   */
  static createMigrationUtilities() {
    return {
      /**
       * Checks if a component can handle enhanced filters
       */
      isComponentEnhanced(component: any): boolean {
        return component.displayName?.includes('Enhanced') || 
               component.name?.includes('Enhanced') ||
               component.__enhanced === true;
      },

      /**
       * Marks a component as enhanced-capable
       */
      markAsEnhanced<T extends React.ComponentType<any>>(component: T): T {
        (component as any).__enhanced = true;
        return component;
      },

      /**
       * Creates a progressive enhancement wrapper
       */
      createProgressiveWrapper<P extends { filters: FilterState }>(
        LegacyComponent: React.ComponentType<P>,
        EnhancedComponent?: React.ComponentType<P & { filters: EnhancedFilterState }>
      ): React.ComponentType<P & { filters: CompatibleFilterState }> {
        return (props: P & { filters: CompatibleFilterState }) => {
          const isEnhanced = FilterCompatibilityLayer.isEnhancedState(props.filters);
          
          if (isEnhanced && EnhancedComponent) {
            return React.createElement(EnhancedComponent, {
              ...props,
              filters: props.filters
            });
          }

          const legacyFilters = FilterCompatibilityLayer.extractLegacyState(props.filters);
          return React.createElement(LegacyComponent, {
            ...props,
            filters: legacyFilters
          } as P);
        };
      },

      /**
       * Creates a feature flag wrapper for gradual rollout
       */
      createFeatureFlagWrapper<P extends { filters: FilterState }>(
        LegacyComponent: React.ComponentType<P>,
        EnhancedComponent: React.ComponentType<P & { filters: EnhancedFilterState }>,
        featureFlag: () => boolean
      ): React.ComponentType<P & { filters: CompatibleFilterState }> {
        return (props: P & { filters: CompatibleFilterState }) => {
          const useEnhanced = featureFlag() && FilterCompatibilityLayer.isEnhancedState(props.filters);
          
          if (useEnhanced) {
            return React.createElement(EnhancedComponent, {
              ...props,
              filters: props.filters as EnhancedFilterState
            });
          }

          const legacyFilters = FilterCompatibilityLayer.extractLegacyState(props.filters);
          return React.createElement(LegacyComponent, {
            ...props,
            filters: legacyFilters
          } as P);
        };
      }
    };
  }

  /**
   * Provides debugging utilities for compatibility issues
   */
  static createDebugUtilities() {
    const self = FilterCompatibilityLayer;
    
    return {
      /**
       * Logs detailed information about filter state compatibility
       */
      debugFilterState(state: CompatibleFilterState, label: string = 'FilterState'): void {
        console.group(`🔍 ${label} Debug Info`);
        
        console.log('State type:', self.isEnhancedState(state) ? 'Enhanced' : 'Legacy');
        console.log('Needs migration:', FilterMigrationService.needsMigration(state));
        console.log('Version:', FilterMigrationService.getFilterStateVersion(state));
        
        if (self.isEnhancedState(state)) {
          console.log('Conditional rules:', state.conditionalRules.length);
          console.log('Filter groups:', state.filterGroups.length);
          console.log('Global logic:', state.globalLogic);
          console.log('Display mode:', state.displayMode);
          
          const validation = FilterValidationService.quickValidate(state);
          console.log('Validation status:', validation ? '✅ Valid' : '❌ Invalid');
        }
        
        console.log('Raw state:', state);
        console.groupEnd();
      },

      /**
       * Validates compatibility across different scenarios
       */
      validateCompatibility(state: CompatibleFilterState): {
        canMigrate: boolean;
        canExtract: boolean;
        warnings: string[];
        errors: string[];
      } {
        const warnings: string[] = [];
        const errors: string[] = [];
        let canMigrate = true;
        let canExtract = true;

        try {
          if (!self.isEnhancedState(state)) {
            const migrationResult = FilterMigrationService.migrateFilterState(state);
            if (!migrationResult.success) {
              canMigrate = false;
              errors.push(...migrationResult.errors);
            }
            warnings.push(...migrationResult.warnings);
          }
        } catch (error) {
          canMigrate = false;
          errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        try {
          self.extractLegacyState(state);
        } catch (error) {
          canExtract = false;
          errors.push(`Legacy extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return {
          canMigrate,
          canExtract,
          warnings,
          errors
        };
      },

      /**
       * Compares two filter states for compatibility
       */
      compareStates(state1: CompatibleFilterState, state2: CompatibleFilterState): {
        compatible: boolean;
        differences: string[];
        recommendations: string[];
      } {
        const differences: string[] = [];
        const recommendations: string[] = [];

        const isState1Enhanced = self.isEnhancedState(state1);
        const isState2Enhanced = self.isEnhancedState(state2);

        if (isState1Enhanced !== isState2Enhanced) {
          differences.push('Different state types (one enhanced, one legacy)');
          recommendations.push('Consider migrating both states to the same format');
        }

        const legacy1 = self.extractLegacyState(state1);
        const legacy2 = self.extractLegacyState(state2);

        // Compare legacy parts
        const legacyDiffs = self.compareLegacyStates(legacy1, legacy2);
        differences.push(...legacyDiffs);

        // Compare enhanced parts if both are enhanced
        if (isState1Enhanced && isState2Enhanced) {
          const enhancedDiffs = self.compareEnhancedParts(state1, state2);
          differences.push(...enhancedDiffs);
        }

        return {
          compatible: differences.length === 0,
          differences,
          recommendations
        };
      }
    };
  }

  // Helper methods for debugging utilities

  private static compareLegacyStates(state1: FilterState, state2: FilterState): string[] {
    const differences: string[] = [];

    if (state1.search.query !== state2.search.query) {
      differences.push('Different search queries');
    }

    if (JSON.stringify(state1.location) !== JSON.stringify(state2.location)) {
      differences.push('Different location filters');
    }

    if (JSON.stringify(state1.category) !== JSON.stringify(state2.category)) {
      differences.push('Different category filters');
    }

    if (JSON.stringify(state1.price) !== JSON.stringify(state2.price)) {
      differences.push('Different price filters');
    }

    if (JSON.stringify(state1.features) !== JSON.stringify(state2.features)) {
      differences.push('Different feature filters');
    }

    return differences;
  }

  private static compareEnhancedParts(state1: EnhancedFilterState, state2: EnhancedFilterState): string[] {
    const differences: string[] = [];

    if (state1.conditionalRules.length !== state2.conditionalRules.length) {
      differences.push('Different number of conditional rules');
    }

    if (state1.filterGroups.length !== state2.filterGroups.length) {
      differences.push('Different number of filter groups');
    }

    if (state1.globalLogic !== state2.globalLogic) {
      differences.push('Different global logic');
    }

    if (state1.displayMode !== state2.displayMode) {
      differences.push('Different display modes');
    }

    return differences;
  }

  /**
   * Global compatibility instance for easy access
   */
  static readonly global = this.createAdapter();
}

// Export convenience functions
export const normalizeFilterState = FilterCompatibilityLayer.global.normalizeState;
export const extractLegacyState = FilterCompatibilityLayer.global.extractLegacyState;
export const isEnhancedFilterState = FilterCompatibilityLayer.global.isEnhanced;
export const wrapFilterComponent = FilterCompatibilityLayer.global.wrapFilterComponent;
export const createCompatibleHook = FilterCompatibilityLayer.global.createCompatibleHook;

// Export debugging utilities
export const debugFilterState = FilterCompatibilityLayer.createDebugUtilities().debugFilterState;
export const validateCompatibility = FilterCompatibilityLayer.createDebugUtilities().validateCompatibility;

// Export migration utilities
export const migrationUtilities = FilterCompatibilityLayer.createMigrationUtilities();