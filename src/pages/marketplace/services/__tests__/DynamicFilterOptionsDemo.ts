/**
 * Demo script for DynamicFilterOptionsService
 * 
 * This script demonstrates the functionality of the DynamicFilterOptionsService
 * with real data and shows the performance characteristics.
 */

import { DynamicFilterOptionsService } from '../DynamicFilterOptionsService';
import { Screen, FilterState } from '../../types/marketplace.types';
import { demoScreens } from '../../../../data/demoScreens';

// Mock CacheService for demo
class MockCacheService {
  private cache = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) || null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// Replace the CacheService import with our mock
(global as any).CacheService = {
  getInstance: () => new MockCacheService()
};

async function runDemo() {
  console.log('🚀 DynamicFilterOptionsService Demo');
  console.log('=====================================\n');

  const service = DynamicFilterOptionsService.getInstance();
  
  // Create empty filters
  const emptyFilters: FilterState = {
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

  try {
    console.log(`📊 Analyzing ${demoScreens.length} demo screens...`);
    
    const startTime = performance.now();
    const options = await service.calculateDynamicOptions(demoScreens, emptyFilters);
    const endTime = performance.now();

    console.log(`⚡ Calculation completed in ${(endTime - startTime).toFixed(2)}ms\n`);

    // Display results
    console.log('🏙️ CITIES:');
    options.cities.forEach(city => {
      const trend = city.trend === 'up' ? '📈' : city.trend === 'down' ? '📉' : '➡️';
      const recommended = city.isRecommended ? '⭐' : '  ';
      console.log(`  ${recommended} ${city.icon || '🏙️'} ${city.label}: ${city.count} (${city.percentage.toFixed(1)}%) ${trend}`);
    });

    console.log('\n📺 CATEGORIES:');
    options.categories.forEach(category => {
      const trend = category.trend === 'up' ? '📈' : category.trend === 'down' ? '📉' : '➡️';
      const recommended = category.isRecommended ? '⭐' : '  ';
      console.log(`  ${recommended} ${category.icon || '📺'} ${category.label}: ${category.count} (${category.percentage.toFixed(1)}%) ${trend}`);
    });

    console.log('\n💰 PRICE RANGES:');
    options.priceRanges.forEach(range => {
      const trend = range.trend === 'up' ? '📈' : range.trend === 'down' ? '📉' : '➡️';
      const recommended = range.isRecommended ? '⭐' : '  ';
      const disabled = range.disabled ? '❌' : '✅';
      console.log(`  ${recommended} ${range.emoji || '💰'} ${range.label}: ${range.count} (${range.percentage.toFixed(1)}%) ${trend} ${disabled}`);
    });

    console.log('\n🏢 ENVIRONMENTS:');
    options.environments.forEach(env => {
      const trend = env.trend === 'up' ? '📈' : env.trend === 'down' ? '📉' : '➡️';
      const recommended = env.isRecommended ? '⭐' : '  ';
      console.log(`  ${recommended} ${env.icon || '🏢'} ${env.label}: ${env.count} (${env.percentage.toFixed(1)}%) ${trend}`);
    });

    console.log('\n⚡ FEATURES:');
    options.features.forEach(feature => {
      const trend = feature.trend === 'up' ? '📈' : feature.trend === 'down' ? '📉' : '➡️';
      const recommended = feature.isRecommended ? '⭐' : '  ';
      const disabled = feature.disabled ? '❌' : '✅';
      console.log(`  ${recommended} ${feature.icon || '⚡'} ${feature.label}: ${feature.count} (${feature.percentage.toFixed(1)}%) ${trend} ${disabled}`);
    });

    console.log('\n📈 SUMMARY:');
    console.log(`  Total Results: ${options.totalResults}`);
    console.log(`  Computation Time: ${options.computationTime.toFixed(2)}ms`);
    console.log(`  Last Updated: ${options.lastUpdated.toLocaleTimeString()}`);

    // Test with filters applied
    console.log('\n🔍 TESTING WITH FILTERS...');
    const filtersWithCity: FilterState = {
      ...emptyFilters,
      location: { ...emptyFilters.location, cities: ['Bogotá'] }
    };

    const filteredOptions = await service.calculateDynamicOptions(demoScreens, filtersWithCity);
    console.log(`  Filtered to Bogotá: ${filteredOptions.totalResults} results`);
    console.log(`  Available categories in Bogotá:`);
    filteredOptions.categories.forEach(cat => {
      console.log(`    ${cat.icon || '📺'} ${cat.label}: ${cat.count} screens`);
    });

    // Test performance with multiple calls
    console.log('\n⚡ PERFORMANCE TEST...');
    const performanceTests = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await service.calculateDynamicOptions(demoScreens, emptyFilters);
      const end = performance.now();
      performanceTests.push(end - start);
    }

    const avgTime = performanceTests.reduce((sum, time) => sum + time, 0) / performanceTests.length;
    console.log(`  Average calculation time over 5 runs: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${Math.min(...performanceTests).toFixed(2)}ms`);
    console.log(`  Max: ${Math.max(...performanceTests).toFixed(2)}ms`);

    // Test trend calculation
    console.log('\n📊 TREND CALCULATION TEST...');
    const trendHistory = service.getTrendHistory();
    console.log(`  Trend history entries: ${trendHistory.size}`);
    
    // Add more data to see trend changes
    const moreScreens = [...demoScreens, ...demoScreens.slice(0, 3).map(s => ({
      ...s,
      id: s.id + '-duplicate',
      name: s.name + ' (Duplicate)'
    }))];

    await service.calculateDynamicOptions(moreScreens, emptyFilters);
    const updatedHistory = service.getTrendHistory();
    console.log(`  Updated trend history entries: ${updatedHistory.size}`);

    console.log('\n✅ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for potential use in other contexts
export { runDemo };

// Run demo if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runDemo().catch(console.error);
}