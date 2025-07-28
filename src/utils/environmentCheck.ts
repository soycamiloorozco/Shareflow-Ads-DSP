/**
 * Environment Check Utilities
 * Validates critical environment variables
 */

interface EnvironmentCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function checkEnvironment(): EnvironmentCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Google Maps API Key
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!googleMapsApiKey) {
    errors.push('VITE_GOOGLE_MAPS_API_KEY is not defined');
  } else if (googleMapsApiKey.length < 30) {
    warnings.push('VITE_GOOGLE_MAPS_API_KEY seems too short (possible invalid key)');
  } else if (!googleMapsApiKey.startsWith('AIza')) {
    warnings.push('VITE_GOOGLE_MAPS_API_KEY does not start with "AIza" (unusual for Google Maps API keys)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function logEnvironmentStatus(): void {
  const check = checkEnvironment();
  
  if (process.env.NODE_ENV === 'development') {
    console.group('🔧 Environment Check');
    
    if (check.isValid) {
      console.log('✅ All required environment variables are set');
    } else {
      console.error('❌ Missing required environment variables:');
      check.errors.forEach(error => console.error(`  - ${error}`));
    }
    
    if (check.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:');
      check.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    // Log Google Maps API Key info (masked for security)
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      console.log(`🗝️ Google Maps API Key: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)} (${apiKey.length} chars)`);
    }
    
    console.groupEnd();
  }
}

export function getGoogleMapsApiKey(): string {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env.local file');
  }
  return apiKey;
} 