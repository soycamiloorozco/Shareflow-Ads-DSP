/**
 * API Test Utility
 * Simple test to verify API connectivity and response
 */

import MarketplaceApiService from './MarketplaceApiService';

export async function testApiConnection(): Promise<void> {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test basic connectivity
    const response = await fetch('https://api.shareflow.me/api/Screens', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Don't include auth for initial test
      },
    });

    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Data:', data);
      console.log('📊 Number of screens:', Array.isArray(data) ? data.length : 'Not an array');
    } else {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
    }
  } catch (error) {
    console.error('🚨 API Connection Error:', error);
  }

  // Test with MarketplaceApiService
  try {
    console.log('🔍 Testing MarketplaceApiService...');
    const result = await MarketplaceApiService.getScreens({});
    console.log('✅ MarketplaceApiService Result:', result);
  } catch (error) {
    console.error('❌ MarketplaceApiService Error:', error);
  }
}

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(() => {
    testApiConnection();
  }, 2000);
}