/**
 * API Initializer
 * Handles initialization and configuration of API services
 */

import MarketplaceApiService from './MarketplaceApiService';

/**
 * Initialize API services with authentication and configuration
 */
export function initializeApiServices(): void {
  // Get authentication token from localStorage
  const authToken = localStorage.getItem('authToken');
  
  if (authToken) {
    MarketplaceApiService.setAuthToken(authToken);
  }

  // Listen for auth token changes
  window.addEventListener('storage', (event) => {
    if (event.key === 'authToken') {
      if (event.newValue) {
        MarketplaceApiService.setAuthToken(event.newValue);
      } else {
        // Token was removed, clear cache and redirect if needed
        MarketplaceApiService.clearCache();
      }
    }
  });

  // Set up periodic token refresh check
  setInterval(() => {
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      MarketplaceApiService.setAuthToken(currentToken);
    }
  }, 60000); // Check every minute
}

/**
 * Update authentication token for all API services
 */
export function updateAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
  MarketplaceApiService.setAuthToken(token);
}

/**
 * Clear authentication and reset API services
 */
export function clearAuth(): void {
  localStorage.removeItem('authToken');
  MarketplaceApiService.clearCache();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken');
}

export default {
  initializeApiServices,
  updateAuthToken,
  clearAuth,
  isAuthenticated,
};