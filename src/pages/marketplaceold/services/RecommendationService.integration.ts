/**
 * RecommendationService Integration Test
 * Verifies the service can be instantiated and basic methods work
 */

import { createRecommendationService } from './RecommendationService';
import { UserBehaviorAnalytics } from './UserBehaviorAnalytics';
import { createUserPreferenceAnalyzer } from './UserPreferenceAnalyzer';

// Integration test to verify the service works
export const testRecommendationServiceIntegration = async () => {
  console.log('🧪 Testing RecommendationService integration...');

  try {
    // Create service instances
    const behaviorAnalytics = new UserBehaviorAnalytics();
    const preferenceAnalyzer = createUserPreferenceAnalyzer(behaviorAnalytics);
    const recommendationService = createRecommendationService(behaviorAnalytics, preferenceAnalyzer);

    console.log('✅ Service instances created successfully');

    // Test basic method calls (they will return empty arrays due to no data, but should not error)
    const userId = 'test-user-integration';
    
    const topPicks = await recommendationService.getTopPicks(userId, 3);
    console.log('✅ getTopPicks method executed:', topPicks.length, 'results');

    const discoveries = await recommendationService.getNewDiscoveries(userId, 3);
    console.log('✅ getNewDiscoveries method executed:', discoveries.length, 'results');

    const trending = await recommendationService.getTrendingScreens('Medellín', 3);
    console.log('✅ getTrendingScreens method executed:', trending.length, 'results');

    const sections = await recommendationService.generatePersonalizedSections(userId);
    console.log('✅ generatePersonalizedSections method executed:', sections.length, 'sections');

    // Test user preference updates
    await recommendationService.updateUserPreferences(userId, []);
    console.log('✅ updateUserPreferences method executed');

    console.log('🎉 All RecommendationService integration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ RecommendationService integration test failed:', error);
    return false;
  }
};

// Export for potential use in other files
export default testRecommendationServiceIntegration;