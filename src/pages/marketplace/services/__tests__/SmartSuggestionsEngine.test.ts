/**
 * Smart Suggestions Engine Tests
 * Comprehensive tests for filter suggestion quality and relevance
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { SmartSuggestionsEngine, FilterSuggestion, SuggestionRequest, SuggestionResponse } from '../SmartSuggestionsEngine';
import { EnhancedFilterState } from '../../types/marketplace.types';
import { UserProfile, createEmptyUserProfile } from '../../types/intelligent-grouping.types';

describe('SmartSuggestionsEngine', () => {
  let engine: SmartSuggestionsEngine;
  let mockCurrentFilters: EnhancedFilterState;
  let mockUserProfile: UserProfile;

  beforeEach(() => {
    engine = new SmartSuggestionsEngine();
    
    mockCurrentFilters = {
      search: { query: '' },
      location: { cities: [], regions: [], neighborhoods: [] },
      category: { categories: [], venueTypes: [], environments: [], dwellTimes: [] },
      price: { min: 0, max: Number.MAX_SAFE_INTEGER, ranges: [], currency: 'COP' },
      features: { allowsMoments: null, rating: null, accessibility: [], supportedFormats: [] },
      availability: { timeSlots: [], daysOfWeek: [] },
      sort: 