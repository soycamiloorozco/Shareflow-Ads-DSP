/**
 * DisplayModeController - Service to manage section/individual view switching
 * 
 * This service determines when to show sections vs individual screens based on filter state
 * and provides smooth transitions between display modes with animations.
 */

import { FilterState, Screen, EnhancedFilterState } from '../types/marketplace.types';
import { MarketplaceSection } from '../types/intelligent-grouping.types';
import { getActiveFilterCount, isFilterActive } from '../types/filter.types';

export type DisplayMode = 'sections' | 'individual';

export interface DisplayModeConfig {
  mode: DisplayMode;
  reason: DisplayModeReason;
  transitionDuration: number;
  animationType: AnimationType;
}

export type DisplayModeReason = 
  | 'no_filters_applied'
  | 'filters_applied'
  | 'user_preference'
  | 'performance_optimization'
  | 'search_query_active'
  | 'conditional_filters_active';

export type AnimationType = 
  | 'fade'
  | 'slide_left'
  | 'slide_right'
  | 'scale'
  | 'none';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  easing: string;
  stagger?: number;
}

export interface DisplayModeChangeEvent {
  from: DisplayMode;
  to: DisplayMode;
  reason: DisplayModeReason;
  timestamp: Date;
  animationConfig: AnimationConfig;
}

export interface DisplayModeState {
  currentMode: DisplayMode;
  previousMode: DisplayMode | null;
  isTransitioning: boolean;
  transitionStartTime: Date | null;
  lastChangeReason: DisplayModeReason | null;
}

export interface DisplayModeOptions {
  forceMode?: DisplayMode;
  animationType?: AnimationType;
  transitionDuration?: number;
  skipAnimation?: boolean;
  userPreference?: DisplayMode;
}

/**
 * DisplayModeController manages the switching between sectioned and individual screen views
 */
export class DisplayModeController {
  private state: DisplayModeState;
  private listeners: Array<(event: DisplayModeChangeEvent) => void> = [];
  private transitionTimeout: NodeJS.Timeout | null = null;

  constructor(initialMode: DisplayMode = 'sections') {
    this.state = {
      currentMode: initialMode,
      previousMode: null,
      isTransitioning: false,
      transitionStartTime: null,
      lastChangeReason: null
    };
  }

  /**
   * Get current display mode state
   */
  public getState(): DisplayModeState {
    return { ...this.state };
  }

  /**
   * Get current display mode
   */
  public getCurrentMode(): DisplayMode {
    return this.state.currentMode;
  }

  /**
   * Determine if sections should be shown based on filter state
   */
  public shouldShowSections(filters: FilterState | EnhancedFilterState): boolean {
    // If no filters are active, show sections
    if (!isFilterActive(filters)) {
      return true;
    }

    // Check for enhanced filter state with conditional logic
    if ('conditionalRules' in filters) {
      const enhancedFilters = filters as EnhancedFilterState;
      
      // If conditional rules or groups are active, show individual screens
      if (enhancedFilters.conditionalRules.length > 0 || enhancedFilters.filterGroups.length > 0) {
        return false;
      }

      // Check display mode preference in enhanced filters
      if (enhancedFilters.displayMode) {
        return enhancedFilters.displayMode === 'sections';
      }
    }

    // If search query is active, show individual screens for better search experience
    if (filters.search.query.trim().length > 0) {
      return false;
    }

    // If multiple filter types are active, show individual screens
    const activeFilterCount = getActiveFilterCount(filters);
    if (activeFilterCount > 2) {
      return false;
    }

    // If only location or category filters are active (1-2 filters), sections can still be useful
    const hasLocationFilters = filters.location.cities.length > 0 || filters.location.regions.length > 0;
    const hasCategoryFilters = filters.category.categories.length > 0;
    const hasOnlyLocationOrCategory = (hasLocationFilters || hasCategoryFilters) && activeFilterCount <= 2;

    if (hasOnlyLocationOrCategory) {
      return true;
    }

    // Default to individual screens when filters are active
    return false;
  }

  /**
   * Switch to individual view with filtered screens
   */
  public async switchToIndividualView(
    screens: Screen[],
    options: DisplayModeOptions = {}
  ): Promise<Screen[]> {
    const config = this.createDisplayModeConfig('individual', 'filters_applied', options);
    await this.performModeSwitch(config);
    return screens;
  }

  /**
   * Switch to sectioned view with marketplace sections
   */
  public async switchToSectionedView(
    sections: MarketplaceSection[],
    options: DisplayModeOptions = {}
  ): Promise<MarketplaceSection[]> {
    const config = this.createDisplayModeConfig('sections', 'no_filters_applied', options);
    await this.performModeSwitch(config);
    return sections;
  }

  /**
   * Automatically determine and switch to the appropriate display mode
   */
  public async autoSwitchMode(
    filters: FilterState | EnhancedFilterState,
    options: DisplayModeOptions = {}
  ): Promise<DisplayMode> {
    const shouldShowSections = this.shouldShowSections(filters);
    const targetMode: DisplayMode = options.forceMode || (shouldShowSections ? 'sections' : 'individual');
    
    // Don't switch if already in the correct mode
    if (this.state.currentMode === targetMode && !this.state.isTransitioning) {
      return targetMode;
    }

    const reason = this.determineChangeReason(filters, targetMode, options);
    const config = this.createDisplayModeConfig(targetMode, reason, options);
    
    await this.performModeSwitch(config);
    return targetMode;
  }

  /**
   * Get transition animation configuration
   */
  public getTransitionAnimation(
    fromMode: DisplayMode,
    toMode: DisplayMode,
    options: DisplayModeOptions = {}
  ): AnimationConfig {
    const animationType = options.animationType || this.getDefaultAnimationType(fromMode, toMode);
    const duration = options.transitionDuration || this.getDefaultTransitionDuration(animationType);

    return {
      type: animationType,
      duration,
      easing: this.getEasingForAnimation(animationType),
      stagger: animationType === 'scale' ? 50 : undefined
    };
  }

  /**
   * Add listener for display mode changes
   */
  public addListener(listener: (event: DisplayModeChangeEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if currently transitioning between modes
   */
  public isTransitioning(): boolean {
    return this.state.isTransitioning;
  }

  /**
   * Force complete any ongoing transition
   */
  public completeTransition(): void {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }

    if (this.state.isTransitioning) {
      this.state.isTransitioning = false;
      this.state.transitionStartTime = null;
    }
  }

  /**
   * Reset to initial state
   */
  public reset(initialMode: DisplayMode = 'sections'): void {
    this.completeTransition();
    this.state = {
      currentMode: initialMode,
      previousMode: null,
      isTransitioning: false,
      transitionStartTime: null,
      lastChangeReason: null
    };
  }

  // Private methods

  private createDisplayModeConfig(
    mode: DisplayMode,
    reason: DisplayModeReason,
    options: DisplayModeOptions
  ): DisplayModeConfig {
    const animationType = options.animationType || this.getDefaultAnimationType(this.state.currentMode, mode);
    const duration = options.transitionDuration || this.getDefaultTransitionDuration(animationType);

    return {
      mode,
      reason,
      transitionDuration: options.skipAnimation ? 0 : duration,
      animationType: options.skipAnimation ? 'none' : animationType
    };
  }

  private async performModeSwitch(config: DisplayModeConfig): Promise<void> {
    const fromMode = this.state.currentMode;
    const toMode = config.mode;

    // Don't switch if already in target mode and not transitioning
    if (fromMode === toMode && !this.state.isTransitioning) {
      return;
    }

    // Complete any ongoing transition
    this.completeTransition();

    // Update state to transitioning
    this.state.previousMode = fromMode;
    this.state.currentMode = toMode;
    this.state.isTransitioning = config.transitionDuration > 0;
    this.state.transitionStartTime = new Date();
    this.state.lastChangeReason = config.reason;

    // Create animation config
    const animationConfig = this.getTransitionAnimation(fromMode, toMode, {
      animationType: config.animationType,
      transitionDuration: config.transitionDuration
    });

    // Notify listeners
    const event: DisplayModeChangeEvent = {
      from: fromMode,
      to: toMode,
      reason: config.reason,
      timestamp: new Date(),
      animationConfig
    };

    this.notifyListeners(event);

    // Handle transition completion
    if (config.transitionDuration > 0) {
      this.transitionTimeout = setTimeout(() => {
        this.state.isTransitioning = false;
        this.state.transitionStartTime = null;
        this.transitionTimeout = null;
      }, config.transitionDuration);
    }
  }

  private determineChangeReason(
    filters: FilterState | EnhancedFilterState,
    targetMode: DisplayMode,
    options: DisplayModeOptions
  ): DisplayModeReason {
    if (options.forceMode) {
      return 'user_preference';
    }

    if ('conditionalRules' in filters) {
      const enhancedFilters = filters as EnhancedFilterState;
      if (enhancedFilters.conditionalRules.length > 0 || enhancedFilters.filterGroups.length > 0) {
        return 'conditional_filters_active';
      }
    }

    if (filters.search.query.trim().length > 0) {
      return 'search_query_active';
    }

    if (isFilterActive(filters)) {
      return 'filters_applied';
    }

    return 'no_filters_applied';
  }

  private getDefaultAnimationType(fromMode: DisplayMode, toMode: DisplayMode): AnimationType {
    if (fromMode === toMode) {
      return 'none';
    }

    // Sections to individual: slide left (showing more detailed view)
    if (fromMode === 'sections' && toMode === 'individual') {
      return 'slide_left';
    }

    // Individual to sections: slide right (showing broader view)
    if (fromMode === 'individual' && toMode === 'sections') {
      return 'slide_right';
    }

    return 'fade';
  }

  private getDefaultTransitionDuration(animationType: AnimationType): number {
    switch (animationType) {
      case 'none':
        return 0;
      case 'fade':
        return 300;
      case 'slide_left':
      case 'slide_right':
        return 400;
      case 'scale':
        return 350;
      default:
        return 300;
    }
  }

  private getEasingForAnimation(animationType: AnimationType): string {
    switch (animationType) {
      case 'fade':
        return 'ease-in-out';
      case 'slide_left':
      case 'slide_right':
        return 'cubic-bezier(0.4, 0, 0.2, 1)';
      case 'scale':
        return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
      default:
        return 'ease-in-out';
    }
  }

  private notifyListeners(event: DisplayModeChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in display mode change listener:', error);
      }
    });
  }
}

// Singleton instance for global use
export const displayModeController = new DisplayModeController();

// Utility functions for external use
export const createDisplayModeController = (initialMode?: DisplayMode): DisplayModeController => {
  return new DisplayModeController(initialMode);
};

export const getDisplayModeForFilters = (filters: FilterState | EnhancedFilterState): DisplayMode => {
  const controller = new DisplayModeController();
  return controller.shouldShowSections(filters) ? 'sections' : 'individual';
};