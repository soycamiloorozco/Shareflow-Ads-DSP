// OpenRTB 2.6-202505 DOOH (Digital Out-of-Home) Types and Interfaces
// Based on official OpenRTB 2.6 specification from IAB Tech Lab
// Integrated with existing Shareflow venue taxonomy

// Import venue taxonomy from existing comprehensive system
import { 
  VenueParentCategory, 
  VenueChildCategory, 
  VenueGrandChildCategory,
  OPENOOH_PARENT_IDS,
  OPENOOH_CHILD_IDS, 
  OPENOOH_GRANDCHILD_IDS,
  VENUE_TAXONOMY,
  VenueAIClassifier,
  AudienceType,
  DwellTime,
  EnvironmentType
} from './venue-categories';

// Use existing venue taxonomy instead of custom enum
export type DOOHVenueType = VenueParentCategory;
export type DOOHVenueSubType = VenueChildCategory;
export type DOOHVenueLocation = VenueGrandChildCategory;

// OpenRTB 2.6 Core Interfaces
export interface OpenRTBBidRequest {
  id: string;
  imp: OpenRTBImp[];
  site?: OpenRTBSite;
  app?: OpenRTBApp;
  device?: OpenRTBDevice;
  user?: OpenRTBUser;
  test?: number;
  at: number; // Auction type
  tmax?: number;
  wseat?: string[];
  bseat?: string[];
  allimps?: number;
  cur?: string[];
  wlang?: string[];
  wlangb?: string[];
  bcat?: string[];
  badv?: string[];
  bapp?: string[];
  source?: OpenRTBSource;
  regs?: OpenRTBRegs;
  dooh?: OpenRTBDOOH;
  // OpenRTB 2.6 new features
  acat?: string[]; // New attribute for advertiser categories
  cattax?: number; // Category taxonomy version
  ext?: Record<string, any>;
}

// OpenRTB 2.6+ Enhanced Bid Request with full DOOH compliance
export interface OpenRTBBidRequestV26 extends OpenRTBBidRequest {
  // Supply chain transparency
  source?: OpenRTBSourceEnhanced;
  
  // Enhanced DOOH support
  dooh?: OpenRTBDOOHEnhanced;
  
  // Advanced privacy support
  regs?: OpenRTBRegsEnhanced;
  
  // Extension for Shareflow-specific data
  ext?: {
    shareflow?: {
      venueInsights?: DOOHVenueInsights;
      audienceMetrics?: DOOHAudienceMetrics;
      inventoryMetadata?: DOOHInventoryMetadata;
      complianceVersion?: string;
      integrationVersion?: string;
    };
    [key: string]: any;
  };
}

// Enhanced Source object with supply chain
export interface OpenRTBSourceEnhanced extends OpenRTBSource {
  schain?: OpenRTBSupplyChain;
}

export interface OpenRTBImp {
  id: string;
  metric?: OpenRTBMetric[];
  banner?: OpenRTBBanner;
  video?: OpenRTBVideo;
  audio?: OpenRTBAudio;
  native?: OpenRTBNative;
  pmp?: OpenRTBPMP;
  displaymanager?: string;
  displaymanagerver?: string;
  instl?: number;
  tagid?: string;
  bidfloor?: number;
  bidfloorcur?: string;
  clickbrowser?: number;
  secure?: number;
  iframebuster?: string[];
  rwdd?: number;
  ssai?: number;
  exp?: number;
  qty?: OpenRTBQty;
  dt?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBBanner {
  format?: OpenRTBFormat[];
  w?: number;
  h?: number;
  wmax?: number;
  hmax?: number;
  wmin?: number;
  hmin?: number;
  btype?: number[];
  battr?: number[];
  pos?: number;
  mimes?: string[];
  topframe?: number;
  expdir?: number[];
  api?: number[];
  id?: string;
  vcm?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBVideo {
  mimes: string[];
  minduration?: number;
  maxduration?: number;
  protocols?: number[];
  w?: number;
  h?: number;
  startdelay?: number;
  placement?: number;
  linearity?: number;
  skip?: number;
  skipmin?: number;
  skipafter?: number;
  sequence?: number;
  battr?: number[];
  maxextended?: number;
  minbitrate?: number;
  maxbitrate?: number;
  boxingallowed?: number;
  playbackmethod?: number[];
  playbackend?: number;
  delivery?: number[];
  pos?: number;
  companionad?: OpenRTBBanner[];
  api?: number[];
  companiontype?: number[];
  ext?: Record<string, any>;
}

export interface OpenRTBAudio {
  mimes: string[];
  minduration?: number;
  maxduration?: number;
  protocols?: number[];
  startdelay?: number;
  sequence?: number;
  battr?: number[];
  maxextended?: number;
  minbitrate?: number;
  maxbitrate?: number;
  delivery?: number[];
  companionad?: OpenRTBBanner[];
  api?: number[];
  companiontype?: number[];
  maxseq?: number;
  feed?: number;
  stitched?: number;
  nvol?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBNative {
  request: string;
  ver?: string;
  api?: number[];
  battr?: number[];
  ext?: Record<string, any>;
}

// OpenRTB 2.6 New DurFloor Object
export interface OpenRTBDurFloor {
  mindur?: number;
  maxdur?: number;
  bidfloor: number;
  bidfloorcur?: string;
  ext?: Record<string, any>;
}

export interface OpenRTBPMP {
  private_auction?: number;
  deals?: OpenRTBDeal[];
  ext?: Record<string, any>;
}

// OpenRTB 2.6 Updated Deal Object
export interface OpenRTBDeal {
  id: string;
  bidfloor?: number;
  bidfloorcur?: string;
  at?: number;
  wseat?: string[];
  wadomain?: string[];
  wcat?: string[];
  wattr?: number[];
  // OpenRTB 2.6 new attributes
  guaranteed?: number; // Guaranteed deal indicator
  mincpmpersec?: number; // Minimum CPM per second
  durfloors?: OpenRTBDurFloor[]; // Duration-based floors
  ext?: Record<string, any>;
}

export interface OpenRTBFormat {
  w?: number;
  h?: number;
  wratio?: number;
  hratio?: number;
  wmin?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBMetric {
  type: string;
  value: number;
  vendor?: string;
  ext?: Record<string, any>;
}

export interface OpenRTBQty {
  multiplier?: number;
  sourcetype?: number;
  vendor?: string;
  ext?: Record<string, any>;
}

export interface OpenRTBSite {
  id?: string;
  name?: string;
  domain?: string;
  cat?: string[];
  sectioncat?: string[];
  pagecat?: string[];
  page?: string;
  ref?: string;
  search?: string;
  mobile?: number;
  privacypolicy?: number;
  publisher?: OpenRTBPublisher;
  content?: OpenRTBContent;
  keywords?: string;
  kwarray?: string[];
  cattax?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBApp {
  id?: string;
  name?: string;
  bundle?: string;
  domain?: string;
  storeurl?: string;
  cat?: string[];
  sectioncat?: string[];
  pagecat?: string[];
  ver?: string;
  privacypolicy?: number;
  paid?: number;
  publisher?: OpenRTBPublisher;
  content?: OpenRTBContent;
  keywords?: string;
  kwarray?: string[];
  cattax?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBPublisher {
  id?: string;
  name?: string;
  cat?: string[];
  domain?: string;
  cattax?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBContent {
  id?: string;
  episode?: number;
  title?: string;
  series?: string;
  season?: string;
  artist?: string;
  genre?: string;
  album?: string;
  isrc?: string;
  producer?: OpenRTBProducer;
  url?: string;
  cat?: string[];
  prodq?: number;
  videoquality?: number;
  context?: number;
  contentrating?: string;
  userrating?: string;
  qagmediarating?: number;
  keywords?: string;
  kwarray?: string[];
  livestream?: number;
  sourcerelationship?: number;
  len?: number;
  language?: string;
  langb?: string;
  embeddable?: number;
  data?: OpenRTBData[];
  cattax?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBProducer {
  id?: string;
  name?: string;
  cat?: string[];
  domain?: string;
  cattax?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBData {
  id?: string;
  name?: string;
  segment?: OpenRTBSegment[];
  ext?: Record<string, any>;
}

export interface OpenRTBSegment {
  id?: string;
  name?: string;
  value?: string;
  ext?: Record<string, any>;
}

export interface OpenRTBDevice {
  ua?: string;
  geo?: OpenRTBGeo;
  dnt?: number;
  lmt?: number;
  ip?: string;
  ipv6?: string;
  devicetype?: number;
  make?: string;
  model?: string;
  os?: string;
  osv?: string;
  hwv?: string;
  h?: number;
  w?: number;
  ppi?: number;
  pxratio?: number;
  js?: number;
  geofetch?: number;
  flashver?: string;
  language?: string;
  langb?: string;
  carrier?: string;
  mccmnc?: string;
  connectiontype?: number;
  ifa?: string;
  didsha1?: string;
  didmd5?: string;
  dpidsha1?: string;
  dpidmd5?: string;
  macsha1?: string;
  macmd5?: string;
  sua?: OpenRTBUserAgent;
  ext?: Record<string, any>;
}

export interface OpenRTBUserAgent {
  browsers?: OpenRTBBrandVersion[];
  platform?: OpenRTBBrandVersion;
  mobile?: number;
  architecture?: string;
  bitness?: string;
  model?: string;
  source?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBBrandVersion {
  brand?: string;
  version?: string[];
  ext?: Record<string, any>;
}

export interface OpenRTBGeo {
  lat?: number;
  lon?: number;
  type?: number;
  accuracy?: number;
  lastfix?: number;
  ipservice?: number;
  country?: string;
  region?: string;
  regionfips104?: string;
  metro?: string;
  city?: string;
  zip?: string;
  utcoffset?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBUser {
  id?: string;
  buyeruid?: string;
  yob?: number;
  gender?: string;
  keywords?: string;
  kwarray?: string[];
  customdata?: string;
  geo?: OpenRTBGeo;
  data?: OpenRTBData[];
  consent?: string;
  eids?: OpenRTBEID[];
  ext?: Record<string, any>;
}

export interface OpenRTBEID {
  source?: string;
  uids?: OpenRTBUID[];
  ext?: Record<string, any>;
}

export interface OpenRTBUID {
  id?: string;
  atype?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBSource {
  fd?: number;
  tid?: string;
  pchain?: string;
  schain?: OpenRTBSupplyChain;
  ext?: Record<string, any>;
}

// OpenRTB 2.6+ Supply Chain Transparency
export interface OpenRTBSupplyChain {
  complete: number; // 1 = complete, 0 = incomplete
  nodes: OpenRTBSupplyChainNode[];
  ver: string; // Supply chain specification version
  ext?: Record<string, any>;
}

export interface OpenRTBSupplyChainNode {
  asi?: string; // Advertising system identifier
  sid?: string; // Seller identifier
  hp?: number; // 1 = upstream node is a header bidder, 0 = not
  rid?: string; // Request identifier
  name?: string; // Business name of the entity
  domain?: string; // Domain of the entity
  ext?: Record<string, any>;
}

export interface OpenRTBRegs {
  coppa?: number;
  gdpr?: number;
  us_privacy?: string;
  gpp?: string;
  gpp_sid?: number[];
  ext?: Record<string, any>;
}

// OpenRTB 2.6+ Enhanced Privacy Regulation Types
export interface OpenRTBRegsEnhanced extends OpenRTBRegs {
  ext?: {
    lgpd?: number; // Brazil LGPD compliance (1 = applies, 0 = does not apply)
    pdpa?: number; // Singapore PDPA compliance
    pipeda?: number; // Canada PIPEDA compliance
    dpa?: number; // UK Data Protection Act compliance
    privacy_frameworks?: string[]; // Array of applicable privacy frameworks
    consent_required?: number; // 1 = consent required, 0 = not required
    data_retention_days?: number; // Maximum data retention period in days
    [key: string]: any;
  };
}

export interface OpenRTBDOOH {
  id?: string;
  name?: string;
  venuetype?: string[];
  venuetax?: number;
  pub?: OpenRTBPublisher;
  domain?: string;
  keywords?: string;
  kwarray?: string[];
  content?: OpenRTBContent;
  ext?: Record<string, any>;
}

// OpenRTB 2.6+ Enhanced DOOH Object
export interface OpenRTBDOOHEnhanced extends OpenRTBDOOH {
  // Enhanced venue categorization
  venuecat?: string[]; // Venue categories using OpenOOH Standard
  venuecattax?: number; // Venue category taxonomy version
  
  // Venue-specific content context
  venuecontext?: DOOHVenueContext;
  
  // Audience and engagement metrics
  audiencemetrics?: DOOHAudienceMetrics;
  
  // Inventory availability and pricing
  inventory?: DOOHInventoryInfo;
  
  // Location and geographic data
  geo?: OpenRTBGeo;
  
  // Screen specifications and capabilities
  screenspecs?: DOOHScreenSpecs;
  
  // Dwell time and behavioral data
  dwelltime?: DOOHDwellTimeMetrics;
  
  // Environmental context
  environment?: DOOHEnvironmentContext;
  
  ext?: {
    shareflow?: {
      venueInsights?: DOOHVenueInsights;
      audienceMetrics?: DOOHAudienceMetrics;
      inventoryMetadata?: DOOHInventoryMetadata;
    };
    [key: string]: any;
  };
}

// Enhanced DOOH-specific types for OpenRTB 2.6+ compliance
export interface DOOHVenueContext {
  category: string; // Primary venue category
  subcategory?: string; // Venue subcategory
  environment: 'indoor' | 'outdoor' | 'transit' | 'retail' | 'office';
  accessibility: 'public' | 'private' | 'restricted';
  footTraffic: 'low' | 'medium' | 'high' | 'variable';
  dwellTimeCategory: 'short' | 'medium' | 'long' | 'extended';
  audienceType: string[]; // Types of audience typically present
  contextualRelevance: number; // 0-1 score for contextual advertising relevance
  ext?: Record<string, any>;
}

export interface DOOHInventoryInfo {
  totalSlots: number; // Total available advertising slots
  availableSlots: number; // Currently available slots
  slotDuration: number; // Duration of each slot in seconds
  loopDuration: number; // Total loop duration in seconds
  occupancyRate: number; // Current occupancy rate (0-1)
  priceFloor: number; // Minimum price floor
  currency: string; // Currency for pricing
  guaranteedDeals: boolean; // Whether guaranteed deals are available
  programmaticAvailable: boolean; // Whether programmatic buying is available
  ext?: Record<string, any>;
}

export interface DOOHDwellTimeMetrics {
  average: number; // Average dwell time in seconds
  median: number; // Median dwell time in seconds
  distribution: Record<string, number>; // Distribution of dwell times
  peakHours: string[]; // Hours with highest dwell times
  confidence: number; // Confidence level of dwell time data (0-1)
  ext?: Record<string, any>;
}

export interface DOOHEnvironmentContext {
  lighting: 'bright' | 'dim' | 'variable' | 'outdoor';
  noise: 'quiet' | 'moderate' | 'loud' | 'variable';
  weather: 'indoor' | 'covered' | 'exposed';
  viewingDistance: number; // Typical viewing distance in meters
  viewingAngle: number; // Optimal viewing angle in degrees
  distractionLevel: 'low' | 'medium' | 'high';
  ext?: Record<string, any>;
}

export interface DOOHVenueInsights {
  popularTimes: Record<string, number>; // Hour -> traffic level
  demographicProfile: DOOHDemographics;
  behavioralPatterns: DOOHBehavioralPatterns;
  seasonalTrends: DOOHSeasonalTrends;
  competitiveContext: DOOHCompetitiveContext;
  ext?: Record<string, any>;
}

export interface DOOHBehavioralPatterns {
  visitFrequency: Record<string, number>; // Frequency distribution
  journeyStage: Record<string, number>; // Customer journey stages
  intentLevel: Record<string, number>; // Purchase intent levels
  attentionSpan: number; // Average attention span in seconds
  interactionRate: number; // Rate of audience interaction
  ext?: Record<string, any>;
}

export interface DOOHSeasonalTrends {
  monthlyVariation: Record<string, number>; // Monthly traffic variation
  weeklyPattern: Record<string, number>; // Weekly pattern
  holidayImpact: Record<string, number>; // Holiday impact on traffic
  weatherSensitivity: number; // Weather impact factor (0-1)
  ext?: Record<string, any>;
}

export interface DOOHCompetitiveContext {
  nearbyScreens: number; // Number of nearby advertising screens
  competitorPresence: string[]; // List of competitor brands/categories
  marketShare: number; // Estimated market share in area (0-1)
  differentiationFactors: string[]; // Key differentiation factors
  ext?: Record<string, any>;
}

export interface DOOHInventoryMetadata {
  screenId: string;
  networkId: string;
  operatorId: string;
  installationDate: string;
  lastMaintenanceDate: string;
  technicalSpecs: DOOHTechnicalSpecs;
  contentCapabilities: DOOHContentCapabilities;
  measurementCapabilities: DOOHMeasurementCapabilities;
  ext?: Record<string, any>;
}

export interface DOOHTechnicalSpecs {
  displayTechnology: 'LED' | 'LCD' | 'OLED' | 'Projection' | 'E-ink';
  brightness: number; // Nits
  contrast: string; // Contrast ratio
  colorGamut: string; // Color space coverage
  refreshRate: number; // Hz
  powerConsumption: number; // Watts
  operatingTemperature: string; // Temperature range
  weatherResistance: string; // IP rating
  ext?: Record<string, any>;
}

export interface DOOHContentCapabilities {
  supportedFormats: string[]; // Supported creative formats
  maxFileSize: number; // Maximum file size in bytes
  animationSupport: boolean; // Whether animations are supported
  interactivitySupport: boolean; // Whether interactive content is supported
  audioSupport: boolean; // Whether audio is supported
  realTimeContent: boolean; // Whether real-time content updates are supported
  dynamicContent: boolean; // Whether dynamic content insertion is supported
  ext?: Record<string, any>;
}

export interface DOOHMeasurementCapabilities {
  impressionMeasurement: boolean; // Whether impression measurement is available
  attentionMeasurement: boolean; // Whether attention measurement is available
  demographicDetection: boolean; // Whether demographic detection is available
  emotionDetection: boolean; // Whether emotion detection is available
  dwellTimeMeasurement: boolean; // Whether dwell time measurement is available
  interactionTracking: boolean; // Whether interaction tracking is available
  privacyCompliant: boolean; // Whether measurement is privacy compliant
  certifications: string[]; // Measurement certifications
  ext?: Record<string, any>;
}

export interface OpenRTBBidResponse {
  id: string;
  seatbid?: OpenRTBSeatBid[];
  bidid?: string;
  cur?: string;
  customdata?: string;
  nbr?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBSeatBid {
  bid: OpenRTBBid[];
  seat?: string;
  group?: number;
  ext?: Record<string, any>;
}

export interface OpenRTBBid {
  id: string;
  impid: string;
  price: number;
  adid?: string;
  nurl?: string;
  burl?: string;
  lurl?: string;
  adm?: string;
  adomain?: string[];
  bundle?: string;
  iurl?: string;
  cid?: string;
  crid?: string;
  tactic?: string;
  cat?: string[];
  attr?: number[];
  api?: number;
  protocol?: number;
  qagmediarating?: number;
  language?: string;
  langb?: string;
  dealid?: string;
  w?: number;
  h?: number;
  wratio?: number;
  hratio?: number;
  exp?: number;
  btype?: number;
  cattax?: number;
  ext?: Record<string, any>;
}

// DOOH-specific enumeration values
export enum DOOHContentContext {
  TRANSIT = 1,
  RETAIL = 2,
  OFFICE = 3,
  HOSPITALITY = 4,
  OUTDOOR = 5,
  HEALTHCARE = 6,
  EDUCATION = 7,
  ENTERTAINMENT = 8,
  GOVERNMENT = 9,
  RESIDENTIAL = 10
}

export enum DOOHCampaignStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum DOOHAuctionType {
  FIRST_PRICE = 1,
  SECOND_PRICE = 2,
  FIXED_PRICE = 3
}

export enum DOOHDeviceType {
  DESKTOP = 1,
  MOBILE = 2,
  TABLET = 3,
  PHONE = 4,
  TV = 5,
  GAME_CONSOLE = 6,
  DIGITAL_SIGNAGE = 8
}

// DOOH-specific interfaces
export interface DOOHCoordinates {
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface DOOHScreenSpecs {
  width: number;
  height: number;
  resolution: string;
  aspectRatio: string;
  orientation: 'landscape' | 'portrait';
  pixelDensity: number;
  brightness: number;
  colorDepth: number;
  refreshRate: number;
}

export interface DOOHTimeSlot {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  timeZone: string;
}

export interface DOOHAvailability {
  timeSlot: DOOHTimeSlot;
  availableSpots: number;
  occupancyRate: number;
}

export interface DOOHPriceModifier {
  type: string;
  multiplier: number;
  conditions: Record<string, any>;
}

export interface DOOHPricing {
  baseCpm: number;
  currency: string;
  priceModifiers: DOOHPriceModifier[];
}

export interface DOOHHourlyMetric {
  hour: number;
  impressions: number;
  estimatedReach: number;
}

export interface DOOHDemographics {
  ageGroups: Record<string, number>;
  gender: Record<string, number>;
  income: Record<string, number>;
}

export interface DOOHDwellTime {
  average: number;
  median: number;
  distribution: Record<string, number>;
}

export interface DOOHAudienceMetrics {
  dailyImpressions: number;
  hourlyBreakdown: DOOHHourlyMetric[];
  demographics: DOOHDemographics;
  dwellTime: DOOHDwellTime;
}

export interface DOOHScreen {
  screenId: string;
  venueId: string;
  venueName: string;
  venueType: DOOHVenueType;
  venueSubType?: DOOHVenueSubType;
  venueLocation?: DOOHVenueLocation;
  // OpenOOH Standard IDs
  openoohParentId: number;
  openoohChildId?: number;
  openoohGrandChildId?: number;
  location: DOOHCoordinates;
  address: string;
  specs: DOOHScreenSpecs;
  availability: DOOHAvailability[];
  pricing: DOOHPricing;
  audienceMetrics: DOOHAudienceMetrics;
  // Integrated venue characteristics
  audienceTypes: AudienceType[];
  dwellTime: DwellTime;
  environment: EnvironmentType;
  ext?: Record<string, any>;
}

export interface DOOHGeoTargeting {
  countries?: string[];
  regions?: string[];
  cities?: string[];
  postalCodes?: string[];
  coordinates?: DOOHCoordinates[];
  radius?: number;
  venueTypes?: DOOHVenueType[];
  venueSubTypes?: DOOHVenueSubType[];
  venueLocations?: DOOHVenueLocation[];
  ext?: Record<string, any>;
}

export interface DOOHDemographicTargeting {
  ageGroups?: string[];
  gender?: string[];
  income?: string[];
  interests?: string[];
  ext?: Record<string, any>;
}

export interface DOOHDateRange {
  startDate: string;
  endDate: string;
}

export interface DOOHTemporalTargeting {
  dayOfWeek?: number[];
  hourOfDay?: number[];
  dateRange?: DOOHDateRange;
  timeZone?: string;
  ext?: Record<string, any>;
}

export interface DOOHContextualTargeting {
  venueCategories?: string[];
  contentCategories?: string[];
  keywords?: string[];
  ext?: Record<string, any>;
}

export interface DOOHBehavioralTargeting {
  visitFrequency?: string;
  dwellTime?: string;
  journeyStage?: string;
  ext?: Record<string, any>;
}

export interface DOOHTargetingCriteria {
  geographic?: DOOHGeoTargeting;
  demographic?: DOOHDemographicTargeting;
  temporal?: DOOHTemporalTargeting;
  contextual?: DOOHContextualTargeting;
  behavioral?: DOOHBehavioralTargeting;
  ext?: Record<string, any>;
}

export interface DOOHBidStrategy {
  type: 'manual' | 'auto';
  maxBid?: number;
  targetMetric?: number;
  ext?: Record<string, any>;
}

export interface DOOHBudget {
  totalBudget: number;
  currency: string;
  budgetType: 'total' | 'daily' | 'weekly' | 'monthly';
  bidStrategy?: DOOHBidStrategy;
  ext?: Record<string, any>;
}

export interface DOOHFrequency {
  impressionsPerHour: number;
  impressionsPerDay: number;
  spotDuration: number;
  minInterval: number;
  ext?: Record<string, any>;
}

export interface DOOHSchedule {
  startDate: string;
  endDate: string;
  timeSlots: DOOHTimeSlot[];
  frequency: DOOHFrequency;
  ext?: Record<string, any>;
}

export interface DOOHCreativeFormat {
  width: number;
  height: number;
  aspectRatio: string;
  orientation: 'landscape' | 'portrait';
  ext?: Record<string, any>;
}

export interface DOOHCreativeSpecs {
  formats: DOOHCreativeFormat[];
  duration: number;
  fileSize: number;
  mimeTypes: string[];
  ext?: Record<string, any>;
}

export interface DOOHTrackingUrls {
  impressionUrls: string[];
  clickUrls: string[];
  completionUrls?: string[];
  ext?: Record<string, any>;
}

export interface DOOHCampaignRequest {
  campaignId: string;
  advertiserId: string;
  bidRequest: OpenRTBBidRequest;
  targetingCriteria: DOOHTargetingCriteria;
  budget: DOOHBudget;
  schedule: DOOHSchedule;
  creativeSpecs: DOOHCreativeSpecs;
  trackingUrls: DOOHTrackingUrls;
  ext?: Record<string, any>;
}

export interface DOOHInventoryAllocation {
  screenId: string;
  allocatedSpots: number;
  timeSlots: DOOHTimeSlot[];
  estimatedImpressions: number;
  estimatedReach: number;
  ext?: Record<string, any>;
}

export interface DOOHCampaignResponse {
  campaignId: string;
  status: DOOHCampaignStatus;
  bidResponse: OpenRTBBidResponse;
  inventoryAllocations: DOOHInventoryAllocation[];
  totalImpressions: number;
  totalReach: number;
  totalCost: number;
  ext?: Record<string, any>;
}

export interface DOOHInventoryRequest {
  requestId: string;
  venueFilters: DOOHVenueFilter;
  timeSlots: DOOHTimeSlot[];
  budget: DOOHBudget;
  ext?: Record<string, any>;
}

export interface DOOHInventoryResponse {
  requestId: string;
  availableScreens: DOOHScreen[];
  totalInventory: number;
  averageCpm: number;
  ext?: Record<string, any>;
}

export interface DOOHVenueFilter {
  venueTypes?: DOOHVenueType[];
  venueSubTypes?: DOOHVenueSubType[];
  venueLocations?: DOOHVenueLocation[];
  audienceTypes?: AudienceType[];
  dwellTime?: DwellTime[];
  environment?: EnvironmentType[];
  geographic?: DOOHGeoTargeting;
  minImpressions?: number;
  maxCpm?: number;
  ext?: Record<string, any>;
}

export interface DOOHPerformanceMetrics {
  impressions: number;
  reach: number;
  frequency: number;
  cpm: number;
  ctr: number;
  cost: number;
  ext?: Record<string, any>;
}

export interface DOOHScreenPerformance {
  screenId: string;
  impressions: number;
  reach: number;
  cost: number;
  cpm: number;
  performanceScore: number;
  ext?: Record<string, any>;
}

export interface DOOHAudienceInsights {
  demographicBreakdown: DOOHDemographics;
  dwellTimeAnalysis: DOOHDwellTime;
  peakHours: string[];
  ext?: Record<string, any>;
}

export interface DOOHBehavioralInsights {
  peakHours: string[];
  interactionRate: number;
  attentionTime: number;
  ext?: Record<string, any>;
}

export interface DOOHMetrics {
  performance: DOOHPerformanceMetrics;
  screenPerformance: DOOHScreenPerformance[];
  audienceInsights: DOOHAudienceInsights;
  behavioralInsights: DOOHBehavioralInsights;
  ext?: Record<string, any>;
}

export interface DOOHCampaignAnalytics {
  campaignId: string;
  status: DOOHCampaignStatus;
  metrics: DOOHMetrics;
  reportingPeriod: DOOHDateRange;
  ext?: Record<string, any>;
}

// Error interfaces
export interface DOOHValidationError {
  field: string;
  message: string;
  code: string;
}

// Enhanced validation interfaces for OpenRTB 2.6+ compliance
export interface DOOHValidationResult {
  isValid: boolean;
  errors: DOOHValidationError[];
  warnings: DOOHValidationWarning[];
  complianceLevel: 'basic' | 'enhanced' | 'full';
  openRTBVersion: string;
}

export interface DOOHValidationWarning {
  field: string;
  message: string;
  code: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SupplyChainValidationResult {
  isValid: boolean;
  isComplete: boolean;
  nodeCount: number;
  errors: DOOHValidationError[];
  warnings: DOOHValidationWarning[];
}

export interface PrivacyComplianceValidationResult {
  isValid: boolean;
  frameworks: string[];
  consentRequired: boolean;
  restrictions: string[];
  errors: DOOHValidationError[];
}

// Utility class for DOOH operations
export class DOOHUtils {
  // Enhanced OpenRTB 2.6+ bid request validation
  static validateBidRequestV26(bidRequest: OpenRTBBidRequestV26): DOOHValidationResult {
    const errors: DOOHValidationError[] = [];
    const warnings: DOOHValidationWarning[] = [];
    
    // Basic OpenRTB validation
    if (!bidRequest.id) {
      errors.push({
        field: 'id',
        message: 'Bid request ID is required',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }
    
    if (!bidRequest.imp || bidRequest.imp.length === 0) {
      errors.push({
        field: 'imp',
        message: 'At least one impression is required',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }
    
    // OpenRTB 2.6+ specific validation
    if (bidRequest.acat && bidRequest.acat.length > 0 && !bidRequest.cattax) {
      errors.push({
        field: 'cattax',
        message: 'Category taxonomy version required when acat is specified',
        code: 'MISSING_DEPENDENT_FIELD'
      });
    }
    
    // Supply chain validation
    if (bidRequest.source?.schain) {
      const schainValidation = this.validateSupplyChain(bidRequest.source.schain);
      errors.push(...schainValidation.errors);
      warnings.push(...schainValidation.warnings);
    } else {
      warnings.push({
        field: 'source.schain',
        message: 'Supply chain transparency not provided - recommended for OpenRTB 2.6+',
        code: 'MISSING_RECOMMENDED_FIELD',
        severity: 'medium'
      });
    }
    
    // Enhanced privacy validation
    if (bidRequest.regs) {
      const privacyValidation = this.validatePrivacyCompliance(bidRequest.regs);
      errors.push(...privacyValidation.errors);
    }
    
    // DOOH-specific validation
    if (bidRequest.dooh) {
      const doohValidation = this.validateDOOHObject(bidRequest.dooh);
      errors.push(...doohValidation.errors);
      warnings.push(...doohValidation.warnings);
    }
    
    // Determine compliance level
    let complianceLevel: 'basic' | 'enhanced' | 'full' = 'basic';
    if (bidRequest.source?.schain && bidRequest.dooh && warnings.length < 3) {
      complianceLevel = errors.length === 0 ? 'full' : 'enhanced';
    } else if (bidRequest.acat || bidRequest.dooh) {
      complianceLevel = 'enhanced';
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceLevel,
      openRTBVersion: '2.6+'
    };
  }
  
  // Legacy validation method for backward compatibility
  static validateBidRequest(bidRequest: OpenRTBBidRequest): DOOHValidationError[] {
    const result = this.validateBidRequestV26(bidRequest as OpenRTBBidRequestV26);
    return result.errors;
  }
  
  // Supply chain validation
  static validateSupplyChain(schain: OpenRTBSupplyChain): SupplyChainValidationResult {
    const errors: DOOHValidationError[] = [];
    const warnings: DOOHValidationWarning[] = [];
    
    if (!schain.nodes || schain.nodes.length === 0) {
      errors.push({
        field: 'schain.nodes',
        message: 'Supply chain must contain at least one node',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }
    
    if (!schain.ver) {
      errors.push({
        field: 'schain.ver',
        message: 'Supply chain version is required',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }
    
    // Validate each node
    schain.nodes?.forEach((node, index) => {
      if (!node.asi && !node.sid) {
        errors.push({
          field: `schain.nodes[${index}]`,
          message: 'Supply chain node must have either asi or sid',
          code: 'MISSING_REQUIRED_FIELD'
        });
      }
      
      if (node.hp !== 0 && node.hp !== 1) {
        warnings.push({
          field: `schain.nodes[${index}].hp`,
          message: 'Header bidder flag should be 0 or 1',
          code: 'INVALID_VALUE',
          severity: 'low'
        });
      }
    });
    
    // Check for completeness
    const isComplete = schain.complete === 1;
    if (!isComplete && schain.nodes && schain.nodes.length > 0) {
      warnings.push({
        field: 'schain.complete',
        message: 'Supply chain marked as incomplete - may affect bid eligibility',
        code: 'INCOMPLETE_CHAIN',
        severity: 'medium'
      });
    }
    
    return {
      isValid: errors.length === 0,
      isComplete,
      nodeCount: schain.nodes?.length || 0,
      errors,
      warnings
    };
  }
  
  // Privacy compliance validation
  static validatePrivacyCompliance(regs: OpenRTBRegsEnhanced): PrivacyComplianceValidationResult {
    const errors: DOOHValidationError[] = [];
    const frameworks: string[] = [];
    let consentRequired = false;
    const restrictions: string[] = [];
    
    // GDPR validation
    if (regs.gdpr === 1) {
      frameworks.push('GDPR');
      consentRequired = true;
      if (!regs.ext?.consent_required) {
        restrictions.push('data_processing');
      }
    }
    
    // CCPA validation
    if (regs.us_privacy) {
      frameworks.push('CCPA');
      const ccpaString = regs.us_privacy;
      if (ccpaString.length !== 4) {
        errors.push({
          field: 'regs.us_privacy',
          message: 'CCPA privacy string must be 4 characters',
          code: 'INVALID_FORMAT'
        });
      }
    }
    
    // GPP validation
    if (regs.gpp) {
      frameworks.push('GPP');
      if (!regs.gpp_sid || regs.gpp_sid.length === 0) {
        errors.push({
          field: 'regs.gpp_sid',
          message: 'GPP section IDs required when GPP string is present',
          code: 'MISSING_DEPENDENT_FIELD'
        });
      }
    }
    
    // Enhanced privacy frameworks
    if (regs.ext?.lgpd === 1) {
      frameworks.push('LGPD');
      consentRequired = true;
    }
    
    if (regs.ext?.pdpa === 1) {
      frameworks.push('PDPA');
      consentRequired = true;
    }
    
    return {
      isValid: errors.length === 0,
      frameworks,
      consentRequired,
      restrictions,
      errors
    };
  }
  
  // DOOH object validation
  static validateDOOHObject(dooh: OpenRTBDOOHEnhanced): DOOHValidationResult {
    const errors: DOOHValidationError[] = [];
    const warnings: DOOHValidationWarning[] = [];
    
    if (!dooh.id) {
      warnings.push({
        field: 'dooh.id',
        message: 'DOOH ID recommended for tracking',
        code: 'MISSING_RECOMMENDED_FIELD',
        severity: 'low'
      });
    }
    
    if (!dooh.venuetype || dooh.venuetype.length === 0) {
      errors.push({
        field: 'dooh.venuetype',
        message: 'Venue type is required for DOOH',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }
    
    if (dooh.venuetype && !dooh.venuetax) {
      warnings.push({
        field: 'dooh.venuetax',
        message: 'Venue taxonomy version recommended when venue types are specified',
        code: 'MISSING_RECOMMENDED_FIELD',
        severity: 'medium'
      });
    }
    
    // Enhanced DOOH validation
    if (dooh.venuecat && !dooh.venuecattax) {
      warnings.push({
        field: 'dooh.venuecattax',
        message: 'Venue category taxonomy version recommended',
        code: 'MISSING_RECOMMENDED_FIELD',
        severity: 'medium'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceLevel: errors.length === 0 && warnings.length < 2 ? 'full' : 'enhanced',
      openRTBVersion: '2.6+'
    };
  }
  
  // Create supply chain for Shareflow
  static createShareflowSupplyChain(publisherId?: string): OpenRTBSupplyChain {
    return {
      complete: 1,
      ver: '1.0',
      nodes: [
        {
          asi: 'shareflow.me',
          sid: publisherId || 'shareflow-publisher',
          hp: 0,
          name: 'Shareflow',
          domain: 'shareflow.me'
        }
      ]
    };
  }
  
  // Create enhanced privacy regulations object
  static createEnhancedPrivacyRegs(
    gdprApplies: boolean = false,
    ccpaApplies: boolean = false,
    lgpdApplies: boolean = false
  ): OpenRTBRegsEnhanced {
    const regs: OpenRTBRegsEnhanced = {
      ext: {}
    };
    
    if (gdprApplies) {
      regs.gdpr = 1;
      regs.ext!.consent_required = 1;
    }
    
    if (ccpaApplies) {
      regs.us_privacy = '1YNN'; // Default CCPA string
    }
    
    if (lgpdApplies) {
      regs.ext!.lgpd = 1;
      regs.ext!.consent_required = 1;
    }
    
    return regs;
  }
  
  static createDOOHBidRequest(
    campaignRequest: DOOHCampaignRequest,
    screens: DOOHScreen[]
  ): OpenRTBBidRequest {
    const impressions: OpenRTBImp[] = screens.map((screen, index) => ({
      id: `${campaignRequest.campaignId}-${screen.screenId}-${index}`,
      banner: {
        format: [{
          w: screen.specs.width,
          h: screen.specs.height
        }],
        pos: 1, // Above the fold
        api: [5, 6], // MRAID 2.0, MRAID 3.0
        ext: {
          screenId: screen.screenId,
          venueId: screen.venueId
        }
      },
      bidfloor: screen.pricing.baseCpm,
      bidfloorcur: screen.pricing.currency,
      secure: 1,
      qty: {
        multiplier: 1,
        sourcetype: 1,
        vendor: 'shareflow'
      },
      ext: {
        screenSpecs: screen.specs,
        audienceMetrics: screen.audienceMetrics
      }
    }));
    
    return {
      id: campaignRequest.campaignId,
      imp: impressions,
      dooh: {
        id: 'shareflow-dooh',
        name: 'Shareflow DOOH Network',
        venuetype: screens.map(s => s.openoohParentId.toString()),
        venuetax: 1, // OpenOOH Standard v1.2.0
        pub: {
          id: 'shareflow',
          name: 'Shareflow',
          domain: 'shareflow.me'
        }
      },
      device: {
        devicetype: DOOHDeviceType.DIGITAL_SIGNAGE,
        w: screens[0]?.specs.width || 1920,
        h: screens[0]?.specs.height || 1080,
        geo: {
          lat: screens[0]?.location.lat || 4.6097,
          lon: screens[0]?.location.lon || -74.0817,
          country: 'CO',
          city: 'Bogotá'
        }
      },
      at: DOOHAuctionType.FIRST_PRICE,
      tmax: 5000,
      cur: ['COP', 'USD'],
      // OpenRTB 2.6 features
      acat: campaignRequest.targetingCriteria.contextual?.contentCategories || [],
      cattax: 7, // IAB Content Category Taxonomy v3.0
      source: {
        fd: 1,
        tid: campaignRequest.campaignId
      },
      ext: {
        campaignData: {
          id: campaignRequest.campaignId,
          advertiserId: campaignRequest.advertiserId,
          budget: campaignRequest.budget,
          schedule: campaignRequest.schedule
        }
      }
    };
  }
  
  static createDOOHBidResponse(
    bidRequest: OpenRTBBidRequest,
    winningBids: Array<{
      impId: string;
      price: number;
      adMarkup: string;
      dealId?: string;
    }>
  ): OpenRTBBidResponse {
    const bids: OpenRTBBid[] = winningBids.map(bid => ({
      id: `bid-${bid.impId}`,
      impid: bid.impId,
      price: bid.price,
      adm: bid.adMarkup,
      cid: 'shareflow-campaign',
      crid: 'shareflow-creative',
      dealid: bid.dealId,
      cat: ['IAB1'], // Arts & Entertainment
      cattax: 7,
      ext: {
        doohMetrics: {
          estimatedImpressions: 1000,
          estimatedReach: 800
        }
      }
    }));
    
    return {
      id: bidRequest.id,
      seatbid: [{
        bid: bids,
        seat: 'shareflow-dooh'
      }],
      bidid: `response-${bidRequest.id}`,
      cur: 'COP'
    };
  }

  // Utility methods for venue taxonomy integration
  static getVenueCategory(venueType: string, venueSubType?: string, venueLocation?: string) {
    const categoryKey = `${venueType}_${venueSubType}${venueLocation ? '_' + venueLocation : ''}`;
    return VENUE_TAXONOMY[categoryKey];
  }

  static async classifyVenueByName(venueName: string, venueDescription?: string): Promise<DOOHVenueType> {
    const classifier = new VenueAIClassifier();
    const result = await classifier.classifyVenue({
      name: venueName,
      description: venueDescription || '',
      address: '',
      type: '',
      keywords: []
    });
    
    return result.category.parent as DOOHVenueType;
  }

  static getOpenOOHId(venueType: DOOHVenueType, venueSubType?: DOOHVenueSubType) {
    const parentId = OPENOOH_PARENT_IDS[venueType] || 100;
    const childId = venueSubType ? OPENOOH_CHILD_IDS[`${venueType}_${venueSubType}`] : undefined;
    
    return {
      parentId,
      childId,
      grandChildId: undefined
    };
  }

  static createDurFloors(minDuration: number, maxDuration: number, baseCpm: number): OpenRTBDurFloor[] {
    return [
      {
        mindur: minDuration,
        maxdur: maxDuration,
        bidfloor: baseCpm,
        bidfloorcur: 'COP'
      }
    ];
  }

  static createGuaranteedDeal(
    dealId: string,
    bidfloor: number,
    mincpmpersec: number,
    durfloors: OpenRTBDurFloor[]
  ): OpenRTBDeal {
    return {
      id: dealId,
      bidfloor,
      bidfloorcur: 'COP',
      guaranteed: 1,
      mincpmpersec,
      durfloors
    };
  }
} 