// Simple import test to debug the issue
import { RecommendationService } from '../RecommendationService';
import { UserBehaviorAnalytics } from '../UserBehaviorAnalytics';
import { UserPreferenceAnalyzer } from '../UserPreferenceAnalyzer';

console.log('RecommendationService:', RecommendationService);
console.log('UserBehaviorAnalytics:', UserBehaviorAnalytics);
console.log('UserPreferenceAnalyzer:', UserPreferenceAnalyzer);

// Try to create instances
const behaviorAnalytics = new UserBehaviorAnalytics();
const preferenceAnalyzer = new UserPreferenceAnalyzer(behaviorAnalytics);
const recommendationService = new RecommendationService(behaviorAnalytics, preferenceAnalyzer);

console.log('All imports successful!');