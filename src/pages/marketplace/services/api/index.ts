/**
 * API Services Index
 * Centralized exports for all marketplace API services
 */

export { MarketplaceApiService, marketplaceApiService } from './MarketplaceApiService';
export { CacheManager } from './CacheManager';
export { ErrorRecoveryService, errorRecoveryService } from './ErrorRecoveryService';
export { RequestDeduplicator, requestDeduplicator } from './RequestDeduplicator';

// Re-export types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  Screen,
  FilterState,
  MarketplaceSection
} from '../../types/marketplace.types';