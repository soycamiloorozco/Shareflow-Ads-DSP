export type CampaignObjective = 'max_reach' | 'brand_awareness' | 'drive_traffic';

export const campaignObjectives: CampaignObjective[] = [
  'max_reach',
  'brand_awareness',
  'drive_traffic'
];

export interface TimeExclusion {
  start: string;
  end: string;
}

export interface Schedule {
  startTime: string;
  endTime: string;
  days: number[];
  exclusions: TimeExclusion[];
  timezone?: string;
  // Legacy field for backward compatibility
  timeSlots?: CalendarTimeSlot[];
  startDate?: string;
  endDate?: string;
}

export interface CalendarTimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price?: number;
  screenId: string;
  campaign?: string;
}

export interface CreativeFile {
  format: 'horizontal' | 'vertical' | 'square';
  file: File;
  preview: string;
  dimensions?: { width: number; height: number };
}

export interface Creative {
  id: string;
  name: string;
  fileUrl: string;
  fileType: 'image/jpeg' | 'image/png' | 'video/mp4';
  dimensions: { width: number; height: number };
  duration?: number;
  adSetId: string;
  status: 'active' | 'paused' | 'rejected' | 'pending_review';
  createdAt: string;
}

export interface Ad {
  id: string;
  name: string;
  adSetId: string;
  creative: Creative;
  status: 'active' | 'paused' | 'rejected' | 'pending_review';
  performance?: {
    impressions: number;
    reach: number;
    ctr: number;
    cpm: number;
    spend: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdSet {
  id: string;
  name: string;
  campaignId: string;
  budget: number;
  budgetType: 'daily' | 'lifetime';
  status: 'draft' | 'active' | 'paused';
  screens: string[];
  audienceTargeting: AudienceTargeting;
  schedule: Schedule;
  ads: Ad[];
  createdAt: string;
  updatedAt: string;
  bidConfig?: {
    strategy: BidStrategy;
    maxBidPerPlay: number;
    dayPartingRules: DayPartingRule[];
    enableAutoBidding: boolean;
    targetCPM?: number;
  };
  // Smart Expansion settings
  smartExpansion?: SmartExpansionSettings;
}

export interface Screen {
  id: string;
  name: string;
  image?: string;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  dimensions: { width: number; height: number };
  dailyViews: number;
  spotPrice: number;
  type: 'indoor' | 'outdoor';
  resolution: string;
  operatingHours: { start: string; end: string };
  coordinates: { lat: number; lng: number };
  venueType?: 'mall' | 'airport' | 'stadium' | 'street' | 'office' | 'hospital' | 'university' | 'restaurant';
  priceRange?: 'budget' | 'mid' | 'premium';
  audienceData?: BroadsignAudienceData;
  availability?: CalendarTimeSlot[];
  // Partner information for margin calculation
  partnerId?: string;
  partnerName?: string;
}

export interface BroadsignAudienceData {
  demographics: {
    ageGroups: {
      '18-24': number;
      '25-34': number;
      '35-44': number;
      '45-54': number;
      '55-64': number;
      '65+': number;
    };
    gender: {
      male: number;
      female: number;
    };
    income: {
      low: number;
      middle: number;
      high: number;
    };
    interests: string[];
    behaviors: string[];
  };
  traffic: {
    peakHours: string[];
    averageDwellTime: number;
    footTraffic: number;
    vehicleTraffic?: number;
  };
  location: {
    poi: string[];
    businessTypes: string[];
    residentialDensity: 'low' | 'medium' | 'high';
  };
}

export interface CampaignFilters {
  cities: string[];
  venueTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  screenTypes: ('indoor' | 'outdoor')[];
  audienceTargeting: AudienceTargeting;
}

export interface AudienceTargeting {
  ageGroups: string[];
  gender: 'all' | 'male' | 'female';
  interests: string[];
  behaviors: string[];
  incomeLevel: string[];
  locationTargeting: {
    nearPOI: string[];
    businessTypes: string[];
  };
}

export interface SportEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
  city: string;
  estimatedAttendance: number;
  estimatedTvAudience?: number;
  momentPricing: {
    firstHalf: number;
    halftime: number;
    secondHalf: number;
  };
  availableScreens: string[];
}

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  budgetType: 'daily' | 'lifetime';
  startDate: string;
  endDate: string;
  adSets: AdSet[];
  createdAt: string;
  updatedAt: string;
  bidConfig?: IntelligentCampaignConfig;
  intelligentConfig?: IntelligentCampaignConfig;
  performance?: {
    totalSpend: number;
    totalImpressions: number;
    totalReach: number;
    averageCPM: number;
  };
  // Legacy fields for backward compatibility
  screens?: string[];
  schedule?: {
    startDate: string;
    endDate: string;
    timeSlots: string[];
  };
  creative?: {
    url: string;
    type: 'image' | 'video';
    duration?: number;
  };
  filters?: CampaignFilters;
  audienceTargeting?: AudienceTargeting;
  sportEvents?: string[];
  estimatedReach?: number;
  estimatedImpressions?: number;
}

export const VENUE_TYPES = [
  { id: 'mall', name: 'Centros Comerciales', icon: '🏬' },
  { id: 'airport', name: 'Aeropuertos', icon: '✈️' },
  { id: 'stadium', name: 'Estadios', icon: '🏟️' },
  { id: 'street', name: 'Vía Pública', icon: '🛣️' },
  { id: 'office', name: 'Oficinas', icon: '🏢' },
  { id: 'hospital', name: 'Hospitales', icon: '🏥' },
  { id: 'university', name: 'Universidades', icon: '🎓' },
  { id: 'restaurant', name: 'Restaurantes', icon: '🍽️' }
];

export const AGE_GROUPS = [
  { id: '18-24', name: '18-24 años' },
  { id: '25-34', name: '25-34 años' },
  { id: '35-44', name: '35-44 años' },
  { id: '45-54', name: '45-54 años' },
  { id: '55-64', name: '55-64 años' },
  { id: '65+', name: '65+ años' }
];

export const INTERESTS = [
  'Deportes', 'Tecnología', 'Moda', 'Viajes', 'Comida', 'Música', 
  'Fitness', 'Automóviles', 'Finanzas', 'Educación', 'Salud', 'Arte'
];

export const BEHAVIORS = [
  'Comprador frecuente', 'Early adopter', 'Viajero frecuente', 
  'Deportista activo', 'Foodie', 'Tech enthusiast', 'Eco-conscious'
];

export const CITIES = [
  'Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena', 
  'Bucaramanga', 'Pereira', 'Manizales', 'Ibagué', 'Santa Marta'
];

export type BidStrategy = 'lowest_cost' | 'target_cost' | 'maximize_reach' | 'highest_value';

export interface DayPartingRule {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  bidMultiplier: number; // e.g., 1.5 for 50% increase during rush hour
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  name: string; // e.g., "Rush Hour", "Weekend Premium"
}

export interface IntelligentCampaignConfig {
  totalBudget: number;
  maxBidPerPlay: number; // Maximum we're willing to pay per single play
  strategy: BidStrategy;
  dayPartingRules: DayPartingRule[];
  targetCities: string[];
  budgetPacing: 'standard' | 'accelerated'; // How fast to spend budget
  enableAutoBidding: boolean;
  targetCostPerPlay?: number; // For target_cost strategy - target cost per play
  guaranteedPlaysPerDay?: number; // For marketplace compatibility
  // Legacy support for existing components
  targetCPM?: number; // Will be migrated to targetCostPerPlay
}

export interface BidCalculation {
  baseCostPerPlay: number; // What media owner charges per play
  dayPartingMultiplier: number;
  budgetPacingMultiplier: number;
  qualityMultiplier: number;
  optimalBidPerPlay: number; // Our calculated bid per play
  finalBidPerPlay: number; // Final bid after all adjustments
  actualCostPerPlay: number; // What we'll actually pay to media owner
  breakdown: {
    basePrice: number;
    dayPartingAdjustment: number;
    budgetPacingAdjustment: number;
    qualityAdjustment: number;
    strategyAdjustment: number;
  };
}

export interface PlayEstimation {
  estimatedPlaysPerDay: number;
  estimatedTotalPlays: number;
  estimatedCostPerPlay: number;
  estimatedTotalCost: number;
  estimatedReach: number; // Based on display metrics
}

// Smart Expansion Interfaces
export interface SmartExpansionSettings {
  enableExpansion: boolean;
  referenceLocation: string; // "Centro Comercial Santafé"
  maxDistanceKm: number; // 2.0
  maxAdditionalBudgetPercent: number; // 20% más presupuesto
  allowedVenueTypes: string[]; // Solo centros comerciales, etc.
}

export interface ScoredDisplay {
  displayId: string;
  screen: Screen;
  score: number; // 0-1
  distance: number; // km
  reasoning: string;
  additionalCost: number;
}

export interface SmartExpansionResult {
  suggestedScreens: ScoredDisplay[];
  totalAdditionalCost: number;
  budgetIncrease: number; // percentage
  reasoning: string;
}