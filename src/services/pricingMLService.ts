// ML-Powered Dynamic Pricing Service
import { Screen } from '../types';

// Types for ML pricing system
export interface PurchaseHistory {
  screenId: string;
  purchaseType: 'momentos' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  price: number;
  timestamp: Date;
  userId: string;
  duration?: number; // for hourly purchases
  bundleId: string;
}

export interface DemandAnalytics {
  screenId: string;
  purchaseType: string;
  totalPurchases: number;
  uniqueUsers: number;
  averagePrice: number;
  demandScore: number; // 0-100
  priceMultiplier: number; // 1.0 to 1.5
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: Date;
}

export interface PeakHourAnalytics {
  hour: number;
  demandLevel: 'low' | 'medium' | 'high' | 'peak';
  multiplier: number; // 1.0, 1.2, 1.3, 1.5
  averagePurchases: number;
  priceElasticity: number;
}

export interface MLPricingConfig {
  // Demand-based pricing
  demandThresholds: {
    low: number; // < 5 purchases
    medium: number; // 5-15 purchases  
    high: number; // 15-30 purchases
    peak: number; // > 30 purchases
  };
  
  // Price multipliers based on demand
  demandMultipliers: {
    low: number; // 1.0 (no change)
    medium: number; // 1.05 (5% increase)
    high: number; // 1.08 (8% increase)
    peak: number; // 1.10 (10% increase)
  };
  
  // Peak hour multipliers
  peakHourMultipliers: {
    low: number; // 1.0
    medium: number; // 1.2
    high: number; // 1.3
    peak: number; // 1.5
  };
  
  // Time windows for analysis
  analysisWindow: number; // days to look back
  minimumDataPoints: number; // minimum purchases needed for ML
  
  // Price bounds
  maxPriceIncrease: number; // maximum 50% increase
  minPriceDecrease: number; // minimum 10% decrease
}

// Default ML configuration
const DEFAULT_ML_CONFIG: MLPricingConfig = {
  demandThresholds: {
    low: 5,
    medium: 15,
    high: 30,
    peak: 50
  },
  demandMultipliers: {
    low: 1.0,
    medium: 1.05,
    high: 1.08,
    peak: 1.10
  },
  peakHourMultipliers: {
    low: 1.0,
    medium: 1.2,
    high: 1.3,
    peak: 1.5
  },
  analysisWindow: 30, // 30 days
  minimumDataPoints: 3,
  maxPriceIncrease: 1.5,
  minPriceDecrease: 0.9
};

// Mock purchase history for ML training
const generateMockPurchaseHistory = (): PurchaseHistory[] => {
  const history: PurchaseHistory[] = [];
  const screenIds = ['screen-1', 'screen-2', 'screen-3', 'screen-4', 'screen-5'];
  const purchaseTypes: Array<'momentos' | 'hourly' | 'daily' | 'weekly' | 'monthly'> = 
    ['momentos', 'hourly', 'daily', 'weekly', 'monthly'];
  
  // Generate 500 mock purchases over last 30 days
  for (let i = 0; i < 500; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    
    // Peak hours have more purchases (9-11 AM, 2-4 PM, 7-9 PM)
    const peakHours = [9, 10, 11, 14, 15, 16, 19, 20, 21];
    const isWeighted = Math.random() < 0.6; // 60% chance of peak hour
    const hour = isWeighted 
      ? peakHours[Math.floor(Math.random() * peakHours.length)]
      : Math.floor(Math.random() * 24);
    
    timestamp.setHours(hour, Math.floor(Math.random() * 60));
    
    // Some screens and purchase types are more popular
    const screenWeights = [0.3, 0.25, 0.2, 0.15, 0.1]; // screen-1 is most popular
    const typeWeights = [0.35, 0.25, 0.2, 0.15, 0.05]; // momentos most popular
    
    const screenIndex = weightedRandom(screenWeights);
    const typeIndex = weightedRandom(typeWeights);
    
    history.push({
      screenId: screenIds[screenIndex],
      purchaseType: purchaseTypes[typeIndex],
      hour,
      dayOfWeek: timestamp.getDay(),
      price: Math.floor(Math.random() * 500000) + 50000, // 50K - 550K
      timestamp,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      duration: purchaseTypes[typeIndex] === 'hourly' ? Math.floor(Math.random() * 8) + 1 : undefined,
      bundleId: `bundle-${typeIndex}-${Math.floor(Math.random() * 3)}`
    });
  }
  
  return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Weighted random selection helper
const weightedRandom = (weights: number[]): number => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }
  return weights.length - 1;
};

// ML Pricing Service Class
export class MLPricingService {
  private static instance: MLPricingService;
  private purchaseHistory: PurchaseHistory[] = [];
  private demandAnalytics: Map<string, DemandAnalytics> = new Map();
  private peakHourAnalytics: Map<number, PeakHourAnalytics> = new Map();
  private config: MLPricingConfig = DEFAULT_ML_CONFIG;
  private lastAnalysisUpdate: Date = new Date();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): MLPricingService {
    if (!MLPricingService.instance) {
      MLPricingService.instance = new MLPricingService();
    }
    return MLPricingService.instance;
  }

  // Initialize service with mock data
  private initializeService(): void {
    console.log('🤖 Initializing ML Pricing Service...');
    this.purchaseHistory = generateMockPurchaseHistory();
    this.analyzeHistoricalData();
    this.analyzePeakHours();
    console.log(`✅ ML Service ready with ${this.purchaseHistory.length} data points`);
  }

  // Main ML analysis - analyze purchase patterns
  private analyzeHistoricalData(): void {
    const analysisMap = new Map<string, {
      purchases: PurchaseHistory[];
      uniqueUsers: Set<string>;
      totalRevenue: number;
    }>();

    // Group purchases by screen + purchase type
    this.purchaseHistory.forEach(purchase => {
      const key = `${purchase.screenId}-${purchase.purchaseType}`;
      
      if (!analysisMap.has(key)) {
        analysisMap.set(key, {
          purchases: [],
          uniqueUsers: new Set(),
          totalRevenue: 0
        });
      }
      
      const data = analysisMap.get(key)!;
      data.purchases.push(purchase);
      data.uniqueUsers.add(purchase.userId);
      data.totalRevenue += purchase.price;
    });

    // Generate demand analytics for each screen/type combination
    analysisMap.forEach((data, key) => {
      const [screenId, purchaseType] = key.split('-');
      const totalPurchases = data.purchases.length;
      const uniqueUsers = data.uniqueUsers.size;
      const averagePrice = data.totalRevenue / totalPurchases;

      // Calculate demand score (0-100)
      const demandScore = Math.min(100, (totalPurchases / this.config.demandThresholds.peak) * 100);
      
      // Determine price multiplier based on demand
      let priceMultiplier = this.config.demandMultipliers.low;
      if (totalPurchases >= this.config.demandThresholds.peak) {
        priceMultiplier = this.config.demandMultipliers.peak;
      } else if (totalPurchases >= this.config.demandThresholds.high) {
        priceMultiplier = this.config.demandMultipliers.high;
      } else if (totalPurchases >= this.config.demandThresholds.medium) {
        priceMultiplier = this.config.demandMultipliers.medium;
      }

      // Analyze trend (last 7 days vs previous 7 days)
      const now = new Date();
      const last7Days = data.purchases.filter(p => 
        (now.getTime() - p.timestamp.getTime()) / (1000 * 60 * 60 * 24) <= 7
      ).length;
      const previous7Days = data.purchases.filter(p => {
        const daysAgo = (now.getTime() - p.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo > 7 && daysAgo <= 14;
      }).length;

      let trendDirection: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (last7Days > previous7Days * 1.2) trendDirection = 'increasing';
      else if (last7Days < previous7Days * 0.8) trendDirection = 'decreasing';

      this.demandAnalytics.set(key, {
        screenId,
        purchaseType,
        totalPurchases,
        uniqueUsers,
        averagePrice,
        demandScore,
        priceMultiplier,
        trendDirection,
        lastUpdated: new Date()
      });
    });

    console.log(`📊 Analyzed ${analysisMap.size} screen/type combinations`);
  }

  // Analyze peak hours across all purchases
  private analyzePeakHours(): void {
    const hourlyData = new Map<number, PurchaseHistory[]>();
    
    // Group purchases by hour
    for (let hour = 0; hour < 24; hour++) {
      hourlyData.set(hour, []);
    }
    
    this.purchaseHistory.forEach(purchase => {
      hourlyData.get(purchase.hour)?.push(purchase);
    });

    // Analyze each hour
    hourlyData.forEach((purchases, hour) => {
      const averagePurchases = purchases.length / this.config.analysisWindow;
      
      // Determine demand level based on purchase volume
      let demandLevel: 'low' | 'medium' | 'high' | 'peak' = 'low';
      let multiplier = this.config.peakHourMultipliers.low;
      
      if (averagePurchases >= 3) { // Peak hours
        demandLevel = 'peak';
        multiplier = this.config.peakHourMultipliers.peak;
      } else if (averagePurchases >= 2) { // High demand
        demandLevel = 'high';
        multiplier = this.config.peakHourMultipliers.high;
      } else if (averagePurchases >= 1) { // Medium demand
        demandLevel = 'medium';
        multiplier = this.config.peakHourMultipliers.medium;
      }

      // Calculate price elasticity (simplified)
      const priceElasticity = purchases.length > 0 
        ? purchases.reduce((sum, p) => sum + p.price, 0) / purchases.length / 100000
        : 1;

      this.peakHourAnalytics.set(hour, {
        hour,
        demandLevel,
        multiplier,
        averagePurchases,
        priceElasticity: Math.min(2, Math.max(0.5, priceElasticity))
      });
    });

    console.log('⏰ Peak hour analysis completed');
  }

  // Get ML-adjusted price for a specific screen and purchase type
  public getMLPrice(
    basePrice: number,
    screenId: string,
    purchaseType: 'momentos' | 'hourly' | 'daily' | 'weekly' | 'monthly',
    hour?: number
  ): {
    finalPrice: number;
    basePriceWithMargin: number;
    demandMultiplier: number;
    peakHourMultiplier: number;
    demandLevel: string;
    peakHourLevel: string;
    savings?: number;
    priceIncrease?: number;
    mlInsights: {
      totalPurchases: number;
      demandScore: number;
      trend: string;
      recommendation: string;
    };
  } {
    const key = `${screenId}-${purchaseType}`;
    const demandData = this.demandAnalytics.get(key);
    const currentHour = hour ?? new Date().getHours();
    const peakData = this.peakHourAnalytics.get(currentHour);

    // Base price is already with partner margin
    const basePriceWithMargin = basePrice;
    
    // Apply demand-based multiplier
    const demandMultiplier = demandData?.priceMultiplier ?? 1.0;
    const priceAfterDemand = basePriceWithMargin * demandMultiplier;
    
    // Apply peak hour multiplier
    const peakHourMultiplier = peakData?.multiplier ?? 1.0;
    let finalPrice = priceAfterDemand * peakHourMultiplier;
    
    // Apply safety bounds
    finalPrice = Math.min(finalPrice, basePriceWithMargin * this.config.maxPriceIncrease);
    finalPrice = Math.max(finalPrice, basePriceWithMargin * this.config.minPriceDecrease);
    
    // Round to nearest 1000
    finalPrice = Math.round(finalPrice / 1000) * 1000;

    // Calculate savings or increase
    const priceDifference = finalPrice - basePriceWithMargin;
    const savings = priceDifference < 0 ? Math.abs(priceDifference) : undefined;
    const priceIncrease = priceDifference > 0 ? priceDifference : undefined;

    // Generate ML insights
    const mlInsights = {
      totalPurchases: demandData?.totalPurchases ?? 0,
      demandScore: demandData?.demandScore ?? 0,
      trend: demandData?.trendDirection ?? 'stable',
      recommendation: this.generateRecommendation(demandData, peakData, priceDifference)
    };

    return {
      finalPrice,
      basePriceWithMargin,
      demandMultiplier,
      peakHourMultiplier,
      demandLevel: this.getDemandLevel(demandData?.totalPurchases ?? 0),
      peakHourLevel: peakData?.demandLevel ?? 'low',
      savings,
      priceIncrease,
      mlInsights
    };
  }

  // Get demand level label
  private getDemandLevel(totalPurchases: number): string {
    if (totalPurchases >= this.config.demandThresholds.peak) return 'Muy Alta';
    if (totalPurchases >= this.config.demandThresholds.high) return 'Alta';
    if (totalPurchases >= this.config.demandThresholds.medium) return 'Media';
    return 'Baja';
  }

  // Generate AI recommendation
  private generateRecommendation(
    demandData?: DemandAnalytics,
    peakData?: PeakHourAnalytics,
    priceDifference?: number
  ): string {
    if (!demandData) return 'Precio base - sin datos suficientes';
    
    if (priceDifference && priceDifference > 0) {
      if (demandData.trendDirection === 'increasing' && peakData?.demandLevel === 'peak') {
        return '🔥 Momento perfecto - alta demanda y hora pico';
      } else if (demandData.demandScore > 80) {
        return '📈 Precio premium por alta demanda histórica';
      } else if (peakData?.demandLevel === 'peak') {
        return '⏰ Precio aumentado por hora pico';
      }
      return '💡 Precio optimizado por IA';
    } else if (priceDifference && priceDifference < 0) {
      return '💰 Precio reducido - oportunidad de compra';
    }
    
    return '✅ Precio estable basado en datos históricos';
  }

  // Get peak hours for a screen
  public getPeakHours(): PeakHourAnalytics[] {
    return Array.from(this.peakHourAnalytics.values())
      .sort((a, b) => a.hour - b.hour);
  }

  // Get demand analytics for a screen
  public getDemandAnalytics(screenId: string): DemandAnalytics[] {
    return Array.from(this.demandAnalytics.values())
      .filter(analytics => analytics.screenId === screenId);
  }

  // Simulate a purchase (for learning)
  public recordPurchase(purchase: Omit<PurchaseHistory, 'timestamp'>): void {
    const fullPurchase: PurchaseHistory = {
      ...purchase,
      timestamp: new Date()
    };
    
    this.purchaseHistory.unshift(fullPurchase);
    
    // Keep only recent data (performance optimization)
    if (this.purchaseHistory.length > 1000) {
      this.purchaseHistory = this.purchaseHistory.slice(0, 1000);
    }
    
    // Re-analyze if significant time has passed
    const hoursSinceLastUpdate = (Date.now() - this.lastAnalysisUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastUpdate >= 1) { // Re-analyze every hour
      this.analyzeHistoricalData();
      this.analyzePeakHours();
      this.lastAnalysisUpdate = new Date();
    }
  }

  // Get ML pricing summary for display
  public getPricingSummary(screenId: string): {
    totalPurchases: number;
    demandTrend: 'increasing' | 'stable' | 'decreasing';
    peakHours: number[];
    averagePriceMultiplier: number;
    lastUpdated: Date;
  } {
    const screenAnalytics = Array.from(this.demandAnalytics.values())
      .filter(analytics => analytics.screenId === screenId);
    
    const totalPurchases = screenAnalytics.reduce((sum, analytics) => sum + analytics.totalPurchases, 0);
    const avgMultiplier = screenAnalytics.length > 0 
      ? screenAnalytics.reduce((sum, analytics) => sum + analytics.priceMultiplier, 0) / screenAnalytics.length
      : 1.0;
    
    // Get peak hours (multiplier > 1.2)
    const peakHours = Array.from(this.peakHourAnalytics.entries())
      .filter(([_, data]) => data.multiplier > 1.2)
      .map(([hour, _]) => hour)
      .sort((a, b) => a - b);
    
    // Determine overall trend
    const trendCounts = screenAnalytics.reduce((counts, analytics) => {
      counts[analytics.trendDirection]++;
      return counts;
    }, { increasing: 0, stable: 0, decreasing: 0 });
    
    let demandTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (trendCounts.increasing > trendCounts.stable && trendCounts.increasing > trendCounts.decreasing) {
      demandTrend = 'increasing';
    } else if (trendCounts.decreasing > trendCounts.stable && trendCounts.decreasing > trendCounts.increasing) {
      demandTrend = 'decreasing';
    }

    return {
      totalPurchases,
      demandTrend,
      peakHours,
      averagePriceMultiplier: Math.round(avgMultiplier * 100) / 100,
      lastUpdated: this.lastAnalysisUpdate
    };
  }
}

// Export singleton instance
export const mlPricingService = MLPricingService.getInstance();

// Export utility functions
export const formatPriceChange = (originalPrice: number, newPrice: number): {
  change: number;
  percentage: number;
  isIncrease: boolean;
  label: string;
} => {
  const change = newPrice - originalPrice;
  const percentage = Math.round((Math.abs(change) / originalPrice) * 100);
  const isIncrease = change > 0;
  
  let label = '';
  if (isIncrease) {
    label = `+${percentage}% por demanda`;
  } else if (change < 0) {
    label = `-${percentage}% descuento`;
  } else {
    label = 'Precio estable';
  }
  
  return {
    change,
    percentage,
    isIncrease,
    label
  };
};

export const getDemandBadgeColor = (demandLevel: string): string => {
  switch (demandLevel) {
    case 'Muy Alta': return 'bg-red-100 text-red-800 border-red-200';
    case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-green-100 text-green-800 border-green-200';
  }
};

export const getPeakHourBadgeColor = (peakLevel: string): string => {
  switch (peakLevel) {
    case 'peak': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}; 