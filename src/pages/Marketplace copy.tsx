import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Search, Filter, MapPin, Users, Star, ChevronRight, Sparkles, 
  Monitor, Clock, DollarSign, Eye, Info, X, Check, LayoutGrid, 
  LayoutList, Sliders, Calendar, ChevronDown, Upload, 
  ArrowRight, ChevronLeft, Play, Pause, AlertTriangle, Download, FileText,
  Heart, CreditCard, Target, Store, HelpCircle, Layout, Map,
  Grid, List, SlidersHorizontal,
  Building2, Car, Plane, ShoppingBag, Stethoscope,
  GraduationCap, Banknote, TreePine, Home, Landmark,
  Trophy, Brain, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useDropzone } from 'react-dropzone';
import { Screen, ScreenCategory } from '../types';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

import { VENUE_TAXONOMY, VenueParentCategory, VenueChildCategory, EnvironmentType, DwellTime, OPENOOH_PARENT_IDS, OPENOOH_CHILD_IDS, OPENOOH_GRANDCHILD_IDS } from '../types/venue-categories';
import { SmartSearchInput } from '../components/SmartSearchInput';
import { SmartSuggestion } from '../hooks/useSmartSearch';
import { initializeSampleData } from '../data/sampleSearchData';
import { SmartSearchDemo } from '../components/SmartSearchDemo';
import favoritesService from '../services/favoritesService';

// Mock data - would be replaced with API calls in production
import { screens as mockScreens, categories as mockCategories } from '../data/mockData';

import { calculatePriceWithMargin, getPartnerMargin } from '../lib/utils';

// OpenRTB-DOOH Protocol Integration
import { 
  OpenRTBBidRequest, 
  OpenRTBBidResponse,
  DOOHCampaignRequest, 
  DOOHCampaignResponse,
  DOOHUtils, 
  DOOHVenueType, 
  DOOHVenueSubType,
  DOOHVenueLocation,
  DOOHCampaignStatus,
  DOOHScreen,
  DOOHInventoryRequest,
  DOOHInventoryResponse,
  DOOHInventoryAllocation,
  DOOHMetrics,
  DOOHVenueFilter,
  DOOHGeoTargeting,
  DOOHTargetingCriteria,
  DOOHAuctionType,
  DOOHBidStrategy,
  DOOHBudget,
  DOOHSchedule,
  DOOHPerformanceMetrics,
  DOOHScreenPerformance,
  DOOHAudienceInsights,
  DOOHBehavioralInsights,
  DOOHTimeSlot,
  DOOHFrequency,
  DOOHCreativeSpecs,
  DOOHCreativeFormat,
  DOOHTrackingUrls,
  DOOHCoordinates,
  DOOHScreenSpecs,
  DOOHAvailability,
  DOOHPricing,
  DOOHPriceModifier,
  DOOHAudienceMetrics,
  DOOHHourlyMetric,
  DOOHDemographics,
  DOOHDwellTime as DOOHDwellTimeMetric
} from '../types/openrtb-dooh';

// Type extension for circuit functionality
interface ScreenWithCircuit extends Screen {
  isPartOfCircuit: boolean;
  circuitId?: string;
  circuitName?: string;
}

// Demo data for testing the purchase flow
export const demoScreens: ScreenWithCircuit[] = [
  // Stadium screens
  {
    id: 'demo-stadium-1',
    name: 'Pantalla LED Perimetral - Estadio Atanasio Girardot',
    location: 'Estadio Atanasio Girardot, Medellín',
    price: 1200000,
    availability: true,
    image: '/screens_photos/9007-639a2c4721253.jpg',
    category: mockCategories.find(c => c.id === 'stadium')!,
    environment: 'outdoor',
    specs: {
      width: 1920,
      height: 128,
      resolution: 'HD',
      brightness: '7500 nits'
    },
    views: {
      daily: 45000,
      monthly: 180000
    },
    rating: 4.9,
    reviews: 76,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2447, lng: -75.5916 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_S001',
      bundles: {
        hourly: { enabled: true, price: 800000, spots: 4 },
        daily: { enabled: true, price: 4000000, spots: 24 },
        weekly: { enabled: true, price: 18000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 42000,
      monthlyTraffic: 168000,
      averageEngagement: 98
    },
    operatingHours: {
      start: '12:00',
      end: '23:59',
      daysActive: ['Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-stadium-2',
    name: 'Pantalla Principal - El Campín',
    location: 'Estadio El Campín, Bogotá',
    price: 1500000,
    availability: true,
    image: '/screens_photos/1711-63233b19f0faf.jpg',
    category: mockCategories.find(c => c.id === 'stadium')!,
    environment: 'outdoor',
    specs: {
      width: 2560,
      height: 1440,
      resolution: '2K',
      brightness: '8000 nits'
    },
    views: {
      daily: 55000,
      monthly: 220000
    },
    rating: 4.8,
    reviews: 92,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6451, lng: -74.0785 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_S002',
      bundles: {
        hourly: { enabled: true, price: 950000, spots: 4 },
        daily: { enabled: true, price: 4800000, spots: 24 },
        weekly: { enabled: true, price: 21000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 48000,
      monthlyTraffic: 192000,
      averageEngagement: 96
    },
    operatingHours: {
      start: '12:00',
      end: '23:59',
      daysActive: ['Viernes', 'Sábado', 'Domingo']
    }
  },
  // Billboard screens (Now part of a circuit)
  {
    id: 'demo-billboard-1',
    name: 'Gran Pantalla Digital - Zona Rosa',
    location: 'Zona Rosa, Bogotá',
    price: 1800000,
    availability: true,
    image: '/screens_photos/976-5f4a82cd6c675.jpg',
    category: mockCategories.find(c => c.id === 'billboard') || mockCategories[0],
    environment: 'outdoor',
    specs: {
      width: 7680,
      height: 4320,
      resolution: '8K',
      brightness: '9000 nits'
    },
    views: {
      daily: 95000,
      monthly: 2850000
    },
    rating: 4.9,
    reviews: 104,
    isPartOfCircuit: true,
    circuitId: 'bgt-circuit-premium',
    circuitName: 'Circuito Vallas Premium Bogotá',
    coordinates: { lat: 4.6692, lng: -74.0563 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_B001',
      bundles: {
        hourly: { enabled: true, price: 1200000, spots: 4 },
        daily: { enabled: true, price: 5500000, spots: 24 }
      }
    },
    metrics: {
      dailyTraffic: 85000,
      monthlyTraffic: 2550000,
      averageEngagement: 94
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-billboard-2',
    name: 'Valla Digital Premium - Avenida El Dorado',
    location: 'Av. El Dorado, Bogotá',
    price: 1650000,
    availability: true,
    image: '/screens_photos/1711-63233b19f0faf.jpg',
    category: mockCategories.find(c => c.id === 'billboard')!,
    environment: 'outdoor',
    specs: {
      width: 5120,
      height: 2880,
      resolution: '6K',
      brightness: '8500 nits'
    },
    views: {
      daily: 88000,
      monthly: 2640000
    },
    rating: 4.8,
    reviews: 96,
    isPartOfCircuit: true,
    circuitId: 'bgt-circuit-premium',
    circuitName: 'Circuito Vallas Premium Bogotá',
    coordinates: { lat: 4.6780, lng: -74.1236 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_B002',
      bundles: {
        hourly: { enabled: true, price: 1100000, spots: 4 },
        daily: { enabled: true, price: 5000000, spots: 24 },
        weekly: { enabled: true, price: 25000000, spots: 168 },
        monthly: { enabled: true, price: 85000000, spots: 720 }
      }
    },
    metrics: {
      dailyTraffic: 78000,
      monthlyTraffic: 2340000,
      averageEngagement: 92
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-airport-1',
    name: 'Pantalla Principal - Aeropuerto El Dorado',
    location: 'Terminal Internacional, Aeropuerto El Dorado, Bogotá',
    price: 2200000,
    availability: true,
    image: '/screens_photos/24147-6543ae2a3400f.jpg',
    category: mockCategories.find(c => c.id === 'airport') || mockCategories[0],
    environment: 'indoor',
    specs: {
      width: 4096,
      height: 2160,
      resolution: '4K',
      brightness: '6000 nits'
    },
    views: {
      daily: 120000,
      monthly: 3600000
    },
    rating: 4.9,
    reviews: 152,
    isPartOfCircuit: false,
    coordinates: { lat: 4.7016, lng: -74.1469 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_A001',
      bundles: {
        hourly: { enabled: true, price: 1500000, spots: 4 },
        daily: { enabled: true, price: 7000000, spots: 24 }
      }
    },
    metrics: {
      dailyTraffic: 110000,
      monthlyTraffic: 3300000,
      averageEngagement: 97
    },
    operatingHours: {
      start: '05:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-transport-1',
    name: 'Pantalla Estación Metro - San Antonio',
    location: 'Estación San Antonio, Metro de Medellín',
    price: 520000,
    availability: true,
    image: '/screens_photos/3592-6526fc021ea36.jpg',
    category: mockCategories.find(c => c.id === 'transport') || mockCategories[0],
    environment: 'indoor',
    specs: {
      width: 2560,
      height: 1440,
      resolution: '2K',
      brightness: '5500 nits'
    },
    views: {
      daily: 65000,
      monthly: 1950000
    },
    rating: 4.6,
    reviews: 84,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2466, lng: -75.5658 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_T001',
      bundles: {
        hourly: { enabled: true, price: 350000, spots: 4 },
        daily: { enabled: true, price: 1800000, spots: 24 }
      }
    },
    metrics: {
      dailyTraffic: 58000,
      monthlyTraffic: 1740000,
      averageEngagement: 82
    },
    operatingHours: {
      start: '05:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  
  // Shopping mall screens
  {
    id: 'demo-mall-1',
    name: 'Pantalla Interactiva - Centro Comercial Andino',
    location: 'Cra. 11 #82-71, Bogotá',
    price: 750000,
    availability: true,
    image: '/screens_photos/4258-62449ffd66411.jpg',
    category: mockCategories.find(c => c.id === 'mall')!,
    environment: 'indoor',
    specs: {
      width: 3840,
      height: 2160,
      resolution: '4K',
      brightness: '5000 nits'
    },
    views: {
      daily: 32000,
      monthly: 960000
    },
    rating: 4.7,
    reviews: 62,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6667, lng: -74.0524 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_M001',
      bundles: {
        hourly: { enabled: true, price: 450000, spots: 4 },
        daily: { enabled: true, price: 2200000, spots: 24 },
        weekly: { enabled: true, price: 9000000, spots: 168 },
        monthly: { enabled: true, price: 32000000, spots: 720 }
      }
    },
    metrics: {
      dailyTraffic: 28000,
      monthlyTraffic: 840000,
      averageEngagement: 88
    },
    operatingHours: {
      start: '10:00',
      end: '21:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-mall-2',
    name: 'Pantalla Food Court - Centro Comercial Santafé',
    location: 'Cra. 43A #7 Sur-170, Medellín',
    price: 680000,
    availability: true,
    image: '/screens_photos/60585-667efb6b32fdf.jpg',
    category: mockCategories.find(c => c.id === 'mall')!,
    environment: 'indoor',
    specs: {
      width: 1920,
      height: 1080,
      resolution: 'Full HD',
      brightness: '4500 nits'
    },
    views: {
      daily: 28000,
      monthly: 840000
    },
    rating: 4.6,
    reviews: 58,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2006, lng: -75.5744 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_M002',
      bundles: {
        hourly: { enabled: true, price: 400000, spots: 4 },
        daily: { enabled: true, price: 2000000, spots: 24 },
        weekly: { enabled: true, price: 8400000, spots: 168 },
        monthly: { enabled: true, price: 30000000, spots: 720 }
      }
    },
    metrics: {
      dailyTraffic: 25000,
      monthlyTraffic: 750000,
      averageEngagement: 85
    },
    operatingHours: {
      start: '10:00',
      end: '21:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  
  // Billboard screens - REMOVED DUPLICATES
  
  // Airport screens - REMOVED DUPLICATES
  
  // Transport screens - REMOVED DUPLICATES
];


// Types for our booking process
type BookingStep = 'browse' | 'details' | 'time-selection' | 'creative-upload' | 'summary';
type BookingType = 'moment' | 'hourly' | 'daily' | 'weekly' | 'monthly' | null;
type ViewMode = 'card' | 'compact' | 'table' | 'map';

interface VenueFilter {
  parentCategories: VenueParentCategory[];
  childCategories: VenueChildCategory[];
  environments: EnvironmentType[];
  dwellTimes: DwellTime[];
}

interface FilterOption {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  count?: number;
}

const PARENT_CATEGORY_ICONS: Record<VenueParentCategory, React.ComponentType<any>> = {
  retail: ShoppingBag,
  transit: Car,
  outdoor: TreePine,
  health_beauty: Stethoscope,
  point_of_care: Stethoscope,
  education: GraduationCap,
  office_buildings: Building2,
  leisure: Trophy,
  government: Landmark,
  financial: Banknote,
  residential: Home
};

const ENVIRONMENT_LABELS: Record<EnvironmentType, string> = {
  indoor_controlled: 'Interior Controlado',
  indoor_semi_open: 'Interior Semi-abierto',
  outdoor_covered: 'Exterior Cubierto',
  outdoor_exposed: 'Exterior Expuesto'
};

const DWELL_TIME_LABELS: Record<DwellTime, string> = {
  very_short: 'Muy Corto (< 30s)',
  short: 'Corto (30s - 2min)',
  medium: 'Medio (2 - 15min)',
  long: 'Largo (15 - 60min)',
  very_long: 'Muy Largo (> 60min)'
};

interface BookingData {
  screen: Screen | null;
  type: BookingType;
  date?: Date;
  dates?: Date[];
  time?: string;
  minute?: number;
  timeSlots?: string[];
  file?: File | null;
  filePreview?: string | null;
  uploadLater?: boolean;
  price?: number;
  fileDimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
    matchesScreen?: boolean;
    scaleMethod: 'fill' | 'expand';
  };
}

// Extract cities dynamically from screens data
const getAllCities = (screens: Screen[]) => {
  const citiesSet = new Set<string>();
  screens.forEach(screen => {
    // Extract city from location string (usually last part after comma)
    const locationParts = screen.location.split(',');
    if (locationParts.length > 1) {
      const city = locationParts[locationParts.length - 1].trim();
      citiesSet.add(city);
    } else {
      // If no comma, try to extract city from the full location
      const city = screen.location.trim();
      citiesSet.add(city);
    }
  });
  
  return Array.from(citiesSet)
    .filter(city => city.length > 0)
    .sort()
    .map(city => ({
      value: city.toLowerCase().replace(/\s+/g, '-'),
      label: city,
      count: screens.filter(screen => 
        screen.location.toLowerCase().includes(city.toLowerCase())
      ).length
    }));
};

// Optimized pricing simulation hook
const useOptimizedPricing = (screenId: string) => {
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadPricing = useCallback(async () => {
    if (priceData || loading) return;
    
    setLoading(true);
    
    // Simulate AI pricing API call
    setTimeout(() => {
      const screen = demoScreens.find(s => s.id === screenId);
      if (screen) {
        const demandLevel = Math.random() * 2; // 0-2 demand multiplier
        const basePrice = screen.price;
        const demandMultiplier = 1 + (demandLevel - 1) * 0.3;
        const timeOfDayMultiplier = new Date().getHours() > 18 ? 1.15 : 1;
        
        setPriceData({
          originalPrice: basePrice,
          optimizedPrice: Math.round(basePrice * demandMultiplier * timeOfDayMultiplier),
          savings: demandLevel < 1 ? Math.round(basePrice * 0.1) : 0,
          demandLevel: demandLevel > 1.2 ? 'high' : demandLevel > 0.8 ? 'medium' : 'low'
        });
      }
      setLoading(false);
    }, 800);
  }, [screenId, priceData, loading]);

  return { priceData, loading, loadPricing };
};

// OpenRTB-DOOH Protocol Functions for Programmatic Inventory
const convertScreenToDOOH = (screen: Screen): DOOHScreen => {
  // Get venue mapping
  const venueMapping = getScreenVenueMapping(screen);
  
  // Get OpenOOH IDs
  const parentCategory = venueMapping.parentCategory || 'outdoor';
  const openoohParentId = OPENOOH_PARENT_IDS[parentCategory] || 100; // Default to outdoor
  const openoohChildId = OPENOOH_CHILD_IDS[`${parentCategory}_${screen.category.name}` as keyof typeof OPENOOH_CHILD_IDS] || undefined;
  
  // Convert screen specs to DOOH format
  const doohSpecs: DOOHScreenSpecs = {
    width: screen.specs.width,
    height: screen.specs.height,
    resolution: screen.specs.resolution,
    aspectRatio: `${screen.specs.width}:${screen.specs.height}`,
    orientation: screen.specs.width >= screen.specs.height ? 'landscape' : 'portrait',
    pixelDensity: 72, // Default PPI
    brightness: parseInt(screen.specs.brightness?.replace(/[^0-9]/g, '') || '7500'),
    colorDepth: 24, // Standard 24-bit color
    refreshRate: 60 // Standard 60Hz
  };
  
  // Convert coordinates
  const coordinates: DOOHCoordinates = {
    lat: screen.coordinates?.lat || 4.6097,
    lon: screen.coordinates?.lng || -74.0817,
    accuracy: 10
  };
  
  // Generate operating hours as time slots
  const operatingHours = screen.operatingHours || { start: '06:00', end: '22:00' };
  const timeSlots: DOOHTimeSlot[] = [{
    startTime: operatingHours.start,
    endTime: operatingHours.end,
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // Monday to Sunday
    timeZone: 'America/Bogota'
  }];
  
  // Create availability based on time slots
  const availability: DOOHAvailability[] = [{
    timeSlot: timeSlots[0],
    availableSpots: screen.pricing.bundles.hourly?.spots || 4,
    occupancyRate: 0.75 // 75% occupancy rate
  }];
  
  // Create pricing structure
  const pricing: DOOHPricing = {
    baseCpm: screen.price / 1000, // Convert to CPM
    currency: 'COP',
    priceModifiers: [
      {
        type: 'peak_hours',
        multiplier: 1.5,
        conditions: { hours: [18, 19, 20, 21] }
      },
      {
        type: 'weekend',
        multiplier: 1.2,
        conditions: { daysOfWeek: [6, 7] }
      }
    ]
  };
  
  // Create audience metrics
  const audienceMetrics: DOOHAudienceMetrics = {
    dailyImpressions: screen.views.daily,
    hourlyBreakdown: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      impressions: Math.floor(screen.views.daily / 24),
      estimatedReach: Math.floor(screen.views.daily / 24 * 0.8)
    })),
    demographics: {
      ageGroups: {
        '18-24': 0.15,
        '25-34': 0.25,
        '35-44': 0.25,
        '45-54': 0.20,
        '55-64': 0.10,
        '65+': 0.05
      },
      gender: {
        'male': 0.52,
        'female': 0.48
      },
      income: {
        'low': 0.30,
        'medium': 0.50,
        'high': 0.20
      }
    },
    dwellTime: {
      average: 45, // seconds
      median: 30,
      distribution: {
        '0-15s': 0.30,
        '16-30s': 0.25,
        '31-60s': 0.25,
        '61-120s': 0.15,
        '120s+': 0.05
      }
    }
  };
  
  return {
    screenId: screen.id,
    venueId: `venue_${screen.id}`,
    venueName: screen.name,
    venueType: parentCategory as DOOHVenueType,
    venueSubType: screen.category.name as DOOHVenueSubType,
    openoohParentId,
    openoohChildId,
    location: coordinates,
    address: screen.location,
    specs: doohSpecs,
    availability,
    pricing,
    audienceMetrics,
    audienceTypes: venueMapping.environment ? [venueMapping.environment as any] : ['pedestrians'],
    dwellTime: venueMapping.dwellTime || 'short',
    environment: venueMapping.environment || 'outdoor_exposed'
  };
};

const createDOOHInventoryRequest = (
  requestId: string,
  targetingCriteria: DOOHTargetingCriteria,
  budget: DOOHBudget,
  timeSlots: DOOHTimeSlot[]
): DOOHInventoryRequest => {
  // Create venue filter based on targeting criteria
  const venueFilter: DOOHVenueFilter = {
    venueTypes: targetingCriteria.contextual?.venueCategories as DOOHVenueType[] || [],
    geographic: targetingCriteria.geographic,
    minImpressions: 1000,
    maxCpm: budget.totalBudget / 1000
  };
  
  return {
    requestId,
    venueFilters: venueFilter,
    timeSlots,
    budget
  };
};

const processDOOHInventoryRequest = async (
  inventoryRequest: DOOHInventoryRequest,
  availableScreens: Screen[]
): Promise<DOOHInventoryResponse> => {
  // Convert available screens to DOOH format
  const doohScreens = availableScreens.map(convertScreenToDOOH);
  
  // Filter screens based on venue filters
  let filteredScreens = doohScreens;
  
  if (inventoryRequest.venueFilters.venueTypes?.length) {
    filteredScreens = filteredScreens.filter(screen => 
      inventoryRequest.venueFilters.venueTypes!.includes(screen.venueType)
    );
  }
  
  if (inventoryRequest.venueFilters.geographic) {
    const geo = inventoryRequest.venueFilters.geographic;
    if (geo.cities?.length) {
      filteredScreens = filteredScreens.filter(screen => 
        geo.cities!.some(city => screen.address.toLowerCase().includes(city.toLowerCase()))
      );
    }
    
    if (geo.coordinates?.length && geo.radius) {
      filteredScreens = filteredScreens.filter(screen => {
        return geo.coordinates!.some(coord => {
          const distance = calculateDistance(
            screen.location.lat, screen.location.lon,
            coord.lat, coord.lon
          );
          return distance <= geo.radius!;
        });
      });
    }
  }
  
  if (inventoryRequest.venueFilters.minImpressions) {
    filteredScreens = filteredScreens.filter(screen => 
      screen.audienceMetrics.dailyImpressions >= inventoryRequest.venueFilters.minImpressions!
    );
  }
  
  if (inventoryRequest.venueFilters.maxCpm) {
    filteredScreens = filteredScreens.filter(screen => 
      screen.pricing.baseCpm <= inventoryRequest.venueFilters.maxCpm!
    );
  }
  
  // Calculate total inventory and average CPM
  const totalInventory = filteredScreens.reduce((sum, screen) => 
    sum + screen.availability.reduce((availSum, avail) => availSum + avail.availableSpots, 0), 0
  );
  
  const averageCpm = filteredScreens.length > 0 ? 
    filteredScreens.reduce((sum, screen) => sum + screen.pricing.baseCpm, 0) / filteredScreens.length : 0;
  
  return {
    requestId: inventoryRequest.requestId,
    availableScreens: filteredScreens,
    totalInventory,
    averageCpm
  };
};

const createDOOHBidRequest = (
  campaignId: string,
  screens: DOOHScreen[],
  targetingCriteria: DOOHTargetingCriteria,
  budget: DOOHBudget,
  schedule: DOOHSchedule
): OpenRTBBidRequest => {
  return DOOHUtils.createDOOHBidRequest({
    campaignId,
    advertiserId: 'shareflow-marketplace',
    bidRequest: {} as OpenRTBBidRequest, // Will be populated by DOOHUtils
    targetingCriteria,
    budget,
    schedule,
    creativeSpecs: {
      formats: screens.map(screen => ({
        width: screen.specs.width,
        height: screen.specs.height,
        aspectRatio: screen.specs.aspectRatio,
        orientation: screen.specs.orientation
      })),
      duration: 30, // 30 seconds default
      fileSize: 50 * 1024 * 1024, // 50MB max
      mimeTypes: ['video/mp4', 'image/jpeg', 'image/png']
    },
    trackingUrls: {
      impressionUrls: [`https://shareflow.me/track/impression/${campaignId}`],
      clickUrls: [`https://shareflow.me/track/click/${campaignId}`],
      completionUrls: [`https://shareflow.me/track/completion/${campaignId}`]
    }
  }, screens);
};

const processDOOHBidRequest = async (
  bidRequest: OpenRTBBidRequest,
  availableScreens: Screen[]
): Promise<OpenRTBBidResponse> => {
  // Convert screens to DOOH format
  const doohScreens = availableScreens.map(convertScreenToDOOH);
  
  // Generate winning bids based on bid request
  const winningBids = bidRequest.imp.map(imp => {
    const screen = doohScreens.find(s => s.screenId === imp.ext?.screenId);
    if (!screen) return null;
    
    const basePrice = screen.pricing.baseCpm;
    const bidPrice = Math.max(basePrice * 1.1, imp.bidfloor || 0); // 10% markup minimum
    
    return {
      impId: imp.id,
      price: bidPrice,
      adMarkup: `<div id="shareflow-ad-${imp.id}">Advertisement Content</div>`,
      dealId: imp.pmp?.deals?.[0]?.id
    };
  }).filter(bid => bid !== null);
  
  return DOOHUtils.createDOOHBidResponse(bidRequest, winningBids);
};

// Utility function to calculate distance between coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// API endpoint simulation for external SSPs
const handleExternalSSPRequest = async (
  request: DOOHInventoryRequest | OpenRTBBidRequest,
  type: 'inventory' | 'bid'
): Promise<DOOHInventoryResponse | OpenRTBBidResponse> => {
  const availableScreens = demoScreens.filter(screen => screen.availability);
  
  if (type === 'inventory') {
    const inventoryRequest = request as DOOHInventoryRequest;
    return await processDOOHInventoryRequest(inventoryRequest, availableScreens);
  } else {
    const bidRequest = request as OpenRTBBidRequest;
    return await processDOOHBidRequest(bidRequest, availableScreens);
  }
};

// Ultra-Responsive Screen Card Component with Modern Breakpoints
const ScreenCard = React.memo(({ screen, index, handleSelectScreen, onFavoriteChange }: { 
  screen: Screen; 
  index: number;
  handleSelectScreen: (screen: Screen) => void;
  onFavoriteChange?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => favoritesService.isFavorite(screen.id));
  const { priceData, loading: pricingLoading, loadPricing } = useOptimizedPricing(screen.id);

  // Update favorite state when screen changes
  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(screen.id));
  }, [screen.id]);

  // Compact data calculation with responsive considerations
  const compactData = useMemo(() => {
    const allowedTypes = [];
    if (screen.pricing.bundles.hourly?.enabled) allowedTypes.push('Hora');
    if (screen.pricing.bundles.daily?.enabled) allowedTypes.push('Día');
    if (screen.pricing.bundles.weekly?.enabled) allowedTypes.push('Semana');

    return {
      location: screen.location.split(',')[0],
      city: screen.location.split(',')[1]?.trim() || '',
      allowedTypes: allowedTypes.slice(0, 2),
      moreTypes: Math.max(0, allowedTypes.length - 2),
      dailyViews: screen.views.daily,
      engagement: screen.metrics.averageEngagement,
      isPopular: screen.rating > 4.7,
      priceDisplay: `$${(screen.price / 1000).toFixed(0)}K`
    };
  }, [screen]);
  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await favoritesService.toggleFavorite(screen.id);
      if (success) {
        setIsFavorite(favoritesService.isFavorite(screen.id));
        onFavoriteChange?.();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [screen.id, onFavoriteChange]);

  const handleCardClick = useCallback(() => {
    handleSelectScreen(screen);
  }, [screen, handleSelectScreen]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    loadPricing();
  }, [loadPricing]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div 
      className="cursor-pointer group relative"
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        animationFillMode: 'both'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Enhanced Card with Better Responsive Design */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full transform hover:-translate-y-1">
        
        {/* Main Image - Optimized for Different Screen Densities */}
        <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] xl:aspect-[3/2] overflow-hidden">
          <img
            src={screen.image}
            alt={screen.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            srcSet={`${screen.image} 1x, ${screen.image} 2x`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            style={{
              imageRendering: 'auto'
            }}
          />
          
          {/* Gradient overlay - Responsive opacity */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Essential badges with Enhanced Touch Targets */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2">
            {compactData.isPopular && (
              <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-orange-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <span className="text-xs">🔥</span>
                <span className="hidden sm:inline">Popular</span>
              </span>
            )}
            <span className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
              {screen.category.name}
            </span>
          </div>
          
          {/* Favorite button - Enhanced for Touch */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md touch-manipulation"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Screen specs on hover - Responsive Layout */}
          {isHovered && (
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 animate-slide-up">
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.specs.resolution}
                </span>
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.specs.brightness}
                </span>
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                  {screen.environment === 'indoor' ? 'Interior' : 'Exterior'}
                </span>
          </div>
        </div>
          )}
      </div>

        {/* Content section - Enhanced Responsive Design */}
        <div className="p-3 sm:p-4 lg:p-5">
          {/* Title and rating - Improved Typography */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2"
                  style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
                {screen.name}
              </h3>
              </div>
            
            {/* Compact rating - Enhanced Touch Target */}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{screen.rating}</span>
              <span className="text-xs text-gray-500 hidden sm:inline">({screen.reviews})</span>
              </div>
            </div>

          {/* Location details - Responsive Layout */}
          <div className="mb-3">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">
                  {screen.location.split(',')[0].trim()}
              </div>
                {screen.location.split(',')[1] && (
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {screen.location.split(',').slice(1).join(',').trim()}
              </div>
                )}
            </div>
            </div>
          </div>

          {/* Purchase options - Responsive Design */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">Disponible:</span>
              </div>
            <div className="flex gap-1">
              {compactData.allowedTypes.map((type) => (
                <span 
                  key={type}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                >
                  {type}
                </span>
              ))}
              {compactData.moreTypes > 0 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                  +{compactData.moreTypes}
                </span>
              )}
              </div>
            </div>

          {/* Moments badge - Enhanced */}
          {screen.pricing.allowMoments && (
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs text-purple-700 font-medium">Momentos disponibles</span>
              </div>
          )}

          {/* Price and CTA - Responsive Layout */}
          <div className="flex items-center justify-between">
              <div>
              {priceData ? (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-gray-900"
                          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                      ${(priceData.optimizedPrice / 1000).toFixed(0)}K
                    </span>
                    <span className="text-sm text-gray-600">COP</span>
                    {priceData.savings > 0 && (
                      <span className="text-xs text-green-600 font-medium ml-1">
                        -{(priceData.savings / 1000).toFixed(0)}K
                      </span>
                    )}
              </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    desde / hora
                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                      priceData.demandLevel === 'high' ? 'bg-red-100 text-red-700' :
                      priceData.demandLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {priceData.demandLevel === 'high' ? '🔥' : 
                       priceData.demandLevel === 'medium' ? '📈' : '💚'}
                    </span>
            </div>
                </div>
              ) : pricingLoading ? (
                <div>
                  <div className="flex items-baseline gap-1">
                    <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <span className="text-sm text-gray-600">COP</span>
                  </div>
                  <div className="text-xs text-gray-500">Cargando precio...</div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-gray-900"
                          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                      {compactData.priceDisplay}
                    </span>
                    <span className="text-sm text-gray-600">COP</span>
                  </div>
                  <div className="text-xs text-gray-500">desde / hora</div>
                </div>
              )}
        </div>

            {/* CTA Button - Enhanced Touch Target */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardClick();
              }}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#353FEF] hover:bg-[#2A32C5] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
              aria-label={`Ver detalles de ${screen.name}`}
            >
              <span>Ver</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// MarketplaceHeader Component - Ultra-Responsive with Modern Breakpoints
const MarketplaceHeader = React.memo(({ searchQuery, setSearchQuery, onInfoClick, filteredCount }: { 
  searchQuery: string, 
  setSearchQuery: (query: string) => void,
  onInfoClick: () => void,
  filteredCount: number
}) => {
  const handleSmartSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    // Additional logic when a suggestion is clicked
    console.log('Selected suggestion:', suggestion);
  };

  return (
    <div className="pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-br from-[#353FEF] via-[#4F46E5] to-[#6366F1] border-b border-blue-200">
      {/* Responsive Container with Fluid Breakpoints */}
      <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
              <div className="inline-block mb-3 sm:mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md border border-white/30 transition-all duration-300 hover:bg-white/30">
                Shareflow Ads
              </span>
            </div>
              
              {/* Fluid Typography with clamp() */}
              <h1 className="font-bold mb-3 sm:mb-4 text-white leading-tight" 
                  style={{ 
                    fontSize: 'clamp(1.75rem, 4vw, 3rem)', 
                    lineHeight: 'clamp(1.2, 1.3, 1.4)' 
                  }}>
              Marketplace de Pantallas Digitales
            </h1>
              
              <p className="text-blue-100 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed" 
                 style={{ 
                   fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                   lineHeight: 'clamp(1.5, 1.6, 1.7)' 
                 }}>
              Explora y reserva pantallas publicitarias en toda Colombia. Encuentra oportunidades únicas para tus campañas con IA.
            </p>
          </motion.div>
        </div>
        
          {/* Search Section with Enhanced Responsive Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-6 sm:mb-8">
          <SmartSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSmartSearch}
            placeholder="Buscar pantallas, ubicaciones o categorías..."
            resultCount={filteredCount}
            onSuggestionClick={handleSuggestionClick}
            className="w-full"
          />
            </div>
          
            <div className="flex justify-center">
          <Button
              variant="outline" 
              size="md"
              onClick={onInfoClick}
                className="rounded-xl bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 shadow-lg transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
            >
              ¿Cómo funciona?
          </Button>
        </div>
        </motion.div>
        </div>
          </div>
    </div>
  );
});

// Multi-City Filter Component
function MultiCityFilter({ 
  allScreens,
  selectedCities, 
  setSelectedCities
}: {
  allScreens: Screen[];
  selectedCities: string[];
  setSelectedCities: (cities: string[]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get available cities from screens
  const availableCities = useMemo(() => {
    return getAllCities(allScreens);
  }, [allScreens]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!searchQuery) return availableCities;
    return availableCities.filter(city => 
      city.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableCities, searchQuery]);

  const toggleCity = (cityValue: string) => {
    if (selectedCities.includes(cityValue)) {
      setSelectedCities(selectedCities.filter(city => city !== cityValue));
    } else {
      setSelectedCities([...selectedCities, cityValue]);
    }
  };

  const clearAllCities = () => {
    setSelectedCities([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <MapPin className="w-4 h-4 text-[#353FEF]" />
          <span className="font-medium text-sm">Ciudades</span>
          {selectedCities.length > 0 && (
            <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
              {selectedCities.length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {selectedCities.length > 0 && (
          <button
            onClick={clearAllCities}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Limpiar
          </button>
        )}
                    </div>

      {/* Selected Cities Chips - Always visible if there are selected cities */}
      {selectedCities.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {selectedCities.map((cityValue) => {
              const city = availableCities.find(c => c.value === cityValue);
              return (
                <motion.span
                  key={cityValue}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#353FEF] text-white text-sm rounded-full"
                >
                  <span>{city?.label || cityValue}</span>
                  <button
                    onClick={() => toggleCity(cityValue)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              );
            })}
                  </div>
                </div>
      )}

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ciudades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors text-sm"
                />
                      </div>

              {/* Cities Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {filteredCities.map((city) => {
                  const isSelected = selectedCities.includes(city.value);
                  return (
                    <button
                      key={city.value}
                      onClick={() => toggleCity(city.value)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all text-left ${
                        isSelected
                          ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : 'text-gray-400'}`} />
                      <div>
                          <div className="font-medium">{city.label}</div>
                          <div className="text-xs text-gray-500">{city.count} pantallas</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#353FEF]" />}
                    </button>
                  );
                })}
                      </div>

              {filteredCities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron ciudades</p>
                    </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Modern Venue Filter Panel Component
function VenueFilterPanel({ 
  venueFilters, 
  setVenueFilters
}: {
  venueFilters: VenueFilter;
  setVenueFilters: React.Dispatch<React.SetStateAction<VenueFilter>>;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const parentCategoryOptions = Object.entries(PARENT_CATEGORY_ICONS).map(([key, Icon]) => {
    const spanishLabels: Record<string, string> = {
      retail: 'Comercial',
      transit: 'Transporte',
      outdoor: 'Exterior',
      health_beauty: 'Salud y Belleza',
      point_of_care: 'Atención Médica',
      education: 'Educación',
      office_buildings: 'Oficinas',
      leisure: 'Entretenimiento',
      government: 'Gobierno',
      financial: 'Financiero',
      residential: 'Residencial'
    };
    
    return {
      id: key as VenueParentCategory,
      label: spanishLabels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      icon: Icon,
      count: Math.floor(Math.random() * 50) + 5 // Mock count
    };
  });

  const environmentOptions = Object.entries(ENVIRONMENT_LABELS).map(([key, label]) => ({
    id: key as EnvironmentType,
    label,
    icon: key.includes('outdoor') ? TreePine : Building2,
    count: Math.floor(Math.random() * 30) + 3
  }));

  const dwellTimeOptions = Object.entries(DWELL_TIME_LABELS).map(([key, label]) => ({
    id: key as DwellTime,
    label,
    icon: Clock,
    count: Math.floor(Math.random() * 25) + 2
  }));

  const toggleParentCategory = (category: VenueParentCategory) => {
    setVenueFilters(prev => ({
      ...prev,
      parentCategories: prev.parentCategories.includes(category)
        ? prev.parentCategories.filter(c => c !== category)
        : [...prev.parentCategories, category]
    }));
  };

  const toggleEnvironment = (environment: EnvironmentType) => {
    setVenueFilters(prev => ({
      ...prev,
      environments: prev.environments.includes(environment)
        ? prev.environments.filter(e => e !== environment)
        : [...prev.environments, environment]
    }));
  };

  const toggleDwellTime = (dwellTime: DwellTime) => {
    setVenueFilters(prev => ({
      ...prev,
      dwellTimes: prev.dwellTimes.includes(dwellTime)
        ? prev.dwellTimes.filter(d => d !== dwellTime)
        : [...prev.dwellTimes, dwellTime]
    }));
  };

  const clearAllFilters = () => {
    setVenueFilters({
      parentCategories: [],
      childCategories: [],
      environments: [],
      dwellTimes: []
    });
  };

  const activeFiltersCount = venueFilters.parentCategories.length + 
    venueFilters.environments.length + venueFilters.dwellTimes.length;

  // Show selected filters as chips
  const renderActiveFilters = () => {
    const allActiveFilters = [
      ...venueFilters.parentCategories.map(cat => ({ type: 'category', value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ') })),
      ...venueFilters.environments.map(env => ({ type: 'environment', value: env, label: ENVIRONMENT_LABELS[env] })),
      ...venueFilters.dwellTimes.map(dwell => ({ type: 'dwell', value: dwell, label: DWELL_TIME_LABELS[dwell] }))
    ];

    if (allActiveFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {allActiveFilters.map((filter, index) => (
          <motion.span
            key={`${filter.type}-${filter.value}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#353FEF] text-white text-sm rounded-full"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => {
                if (filter.type === 'category') toggleParentCategory(filter.value as VenueParentCategory);
                else if (filter.type === 'environment') toggleEnvironment(filter.value as EnvironmentType);
                else if (filter.type === 'dwell') toggleDwellTime(filter.value as DwellTime);
              }}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
                      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden"
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#353FEF]" />
          <span className="font-medium text-sm">Filtros por Venue</span>
          {activeFiltersCount > 0 && (
            <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Active Filters */}
              {renderActiveFilters()}

              {/* Categories - Horizontal scroll */}
                      <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tipos de Venue</h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {parentCategoryOptions.map(option => {
                    const isSelected = venueFilters.parentCategories.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleParentCategory(option.id)}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-[#353FEF] bg-[#353FEF] text-white'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                        <span>{option.label}</span>
                        <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {option.count}
                        </span>
                      </button>
                    );
                  })}
                      </div>
                    </div>

              {/* Environment - Compact grid */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Ambiente</h4>
                <div className="grid grid-cols-2 gap-2">
                  {environmentOptions.map(option => {
                    const isSelected = venueFilters.environments.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleEnvironment(option.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option.icon className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                        <div className="text-left flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.count}</div>
                      </div>
                        {isSelected && <Check className="w-4 h-4 text-green-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dwell Time - Compact pills */}
                      <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tiempo de Permanencia</h4>
                <div className="flex flex-wrap gap-2">
                  {dwellTimeOptions.map(option => {
                    const isSelected = venueFilters.dwellTimes.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleDwellTime(option.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{option.label}</span>
                        <span className="text-xs opacity-70">({option.count})</span>
                      </button>
                    );
                  })}
                      </div>
                    </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Smart Filters Component - Replaces all individual filter components
function SmartFilters({ 
  allScreens,
  smartFilters, 
  setSmartFilters
}: {
  allScreens: ScreenWithCircuit[];
  smartFilters: SmartFiltersState;
  setSmartFilters: React.Dispatch<React.SetStateAction<SmartFiltersState>>;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Get available cities from screens
  const availableCities = useMemo(() => {
    return getAllCities(allScreens);
  }, [allScreens]);

  // Calculate price range counts
  const priceRangeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PRICE_RANGES.forEach(range => {
      counts[range.id] = allScreens.filter(screen => {
        const minPrice = getScreenMinPrice(screen);
        return minPrice >= range.min && minPrice < range.max;
      }).length;
    });
    return counts;
  }, [allScreens]);

  // Calculate venue category counts
  const venueCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(PARENT_CATEGORY_ICONS).forEach(category => {
      counts[category] = allScreens.filter(screen => {
        const mapping = getScreenVenueMapping(screen);
        return mapping.parentCategory === category;
      }).length;
    });
    return counts;
  }, [allScreens]);

  const parentCategoryOptions = Object.entries(PARENT_CATEGORY_ICONS).map(([key, Icon]) => {
    const spanishLabels: Record<string, string> = {
      retail: 'Comercial',
      transit: 'Transporte',
      outdoor: 'Exterior',
      health_beauty: 'Salud y Belleza',
      point_of_care: 'Atención Médica',
      education: 'Educación',
      office_buildings: 'Oficinas',
      leisure: 'Entretenimiento',
      government: 'Gobierno',
      financial: 'Financiero',
      residential: 'Residencial'
    };
    
    return {
      id: key as VenueParentCategory,
      label: spanishLabels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      icon: Icon,
      count: venueCategoryCounts[key] || 0
    };
  });

  const environmentOptions = Object.entries(ENVIRONMENT_LABELS).map(([key, label]) => ({
    id: key as EnvironmentType,
    label,
    icon: key.includes('outdoor') ? TreePine : Building2,
    count: Math.floor(Math.random() * 30) + 3
  }));

  const dwellTimeOptions = Object.entries(DWELL_TIME_LABELS).map(([key, label]) => ({
    id: key as DwellTime,
    label,
    icon: Clock,
    count: Math.floor(Math.random() * 25) + 2
  }));

  // Toggle functions
  const togglePriceRange = (rangeId: string) => {
    setSmartFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(rangeId)
        ? prev.priceRanges.filter(r => r !== rangeId)
        : [...prev.priceRanges, rangeId]
    }));
  };

  const toggleParentCategory = (category: VenueParentCategory) => {
    setSmartFilters(prev => ({
      ...prev,
      parentCategories: prev.parentCategories.includes(category)
        ? prev.parentCategories.filter(c => c !== category)
        : [...prev.parentCategories, category]
    }));
  };

  const toggleEnvironment = (environment: EnvironmentType) => {
    setSmartFilters(prev => ({
      ...prev,
      environments: prev.environments.includes(environment)
        ? prev.environments.filter(e => e !== environment)
        : [...prev.environments, environment]
    }));
  };

  const toggleDwellTime = (dwellTime: DwellTime) => {
    setSmartFilters(prev => ({
      ...prev,
      dwellTimes: prev.dwellTimes.includes(dwellTime)
        ? prev.dwellTimes.filter(d => d !== dwellTime)
        : [...prev.dwellTimes, dwellTime]
    }));
  };

  const clearAllFilters = () => {
    setSmartFilters({
      parentCategories: [],
      childCategories: [],
      environments: [],
      dwellTimes: [],
      priceRanges: [],
      allowsMoments: null,
      rating: null,
    });
  };

  const activeFiltersCount = smartFilters.parentCategories.length + 
    smartFilters.environments.length + smartFilters.dwellTimes.length + 
    smartFilters.priceRanges.length +
    (smartFilters.allowsMoments !== null ? 1 : 0) +
    (smartFilters.rating !== null ? 1 : 0);

  // Show selected filters as chips
  const renderActiveFilters = () => {
    const allActiveFilters = [
      ...smartFilters.priceRanges.map(priceId => {
        const range = PRICE_RANGES.find(r => r.id === priceId);
        return { type: 'price', value: priceId, label: range?.label || priceId, emoji: range?.emoji };
      }),
      ...smartFilters.parentCategories.map(cat => ({ 
        type: 'category', 
        value: cat, 
        label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
        emoji: '🏢'
      })),
      ...smartFilters.environments.map(env => ({ 
        type: 'environment', 
        value: env, 
        label: ENVIRONMENT_LABELS[env],
        emoji: env.includes('outdoor') ? '🌤️' : '🏠'
      })),
      ...smartFilters.dwellTimes.map(dwell => ({ 
        type: 'dwell', 
        value: dwell, 
        label: DWELL_TIME_LABELS[dwell],
        emoji: '⏱️'
      }))
    ];

    if (smartFilters.allowsMoments) {
      allActiveFilters.push({ type: 'moments', value: 'true', label: 'Permite Momentos', emoji: '⚡' });
    }

    if (smartFilters.rating && smartFilters.rating > 0) {
      allActiveFilters.push({ type: 'rating', value: smartFilters.rating.toString(), label: `${smartFilters.rating}+ estrellas`, emoji: '⭐' });
    }

    if (allActiveFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {allActiveFilters.map((filter, index) => (
          <motion.span
            key={`${filter.type}-${filter.value}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#353FEF] text-white text-sm rounded-full"
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
            <button
              onClick={() => {
                if (filter.type === 'price') togglePriceRange(filter.value);
                else if (filter.type === 'category') toggleParentCategory(filter.value as VenueParentCategory);
                else if (filter.type === 'environment') toggleEnvironment(filter.value as EnvironmentType);
                else if (filter.type === 'dwell') toggleDwellTime(filter.value as DwellTime);
                else if (filter.type === 'moments') setSmartFilters(prev => ({ ...prev, allowsMoments: null }));
                else if (filter.type === 'rating') setSmartFilters(prev => ({ ...prev, rating: null }));

              }}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Brain className="w-4 h-4 text-[#353FEF]" />
          <span className="font-medium text-sm">Filtros Inteligentes</span>
          {activeFiltersCount > 0 && (
            <span className="bg-[#353FEF] text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="p-3 border-b border-gray-100">
          {renderActiveFilters()}
        </div>
      )}

      {/* Expandable Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              
              {/* Price Ranges */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Rango de Precios
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRICE_RANGES.map(range => {
                    const isSelected = smartFilters.priceRanges.includes(range.id);
                    const count = priceRangeCounts[range.id] || 0;
                    return (
                      <button
                        key={range.id}
                        onClick={() => togglePriceRange(range.id)}
                        disabled={count === 0}
                        className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : count === 0
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{range.emoji}</span>
                          <span className="font-medium">{range.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">({count})</span>
                          {isSelected && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Venue Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Tipos de Venue
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {parentCategoryOptions.map(option => {
                    const isSelected = smartFilters.parentCategories.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleParentCategory(option.id)}
                        disabled={option.count === 0}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-[#353FEF] bg-[#353FEF] text-white'
                            : option.count === 0
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                        <span>{option.label}</span>
                        <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {option.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Environment */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-green-500" />
                  Ambiente
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {environmentOptions.map(option => {
                    const isSelected = smartFilters.environments.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleEnvironment(option.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option.icon className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                        <div className="text-left flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.count}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-green-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dwell Time */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Tiempo de Permanencia
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dwellTimeOptions.map(option => {
                    const isSelected = smartFilters.dwellTimes.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleDwellTime(option.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{option.label}</span>
                        <span className="text-xs opacity-70">({option.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Filtros Adicionales
                </h4>
                
                <div className="space-y-3">
                  {/* Moments Filter */}
                  <button
                    onClick={() => setSmartFilters(prev => ({ 
                      ...prev, 
                      allowsMoments: prev.allowsMoments ? null : true 
                    }))}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                      smartFilters.allowsMoments
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${smartFilters.allowsMoments ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className="font-medium">Permite Momentos (15s)</span>
                    </div>
                    {smartFilters.allowsMoments && <Check className="w-4 h-4 text-purple-600" />}
                  </button>

                  {/* Rating Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 min-w-fit">Rating mínimo:</span>
                    <div className="flex gap-1">
                      {[4, 4.5, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setSmartFilters(prev => ({ 
                            ...prev, 
                            rating: prev.rating === rating ? null : rating 
                          }))}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                            smartFilters.rating === rating
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                          {rating}+
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note: Availability filter removed - marketplace only shows available screens by default */}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FilterBar({ 
  viewMode, 
  setViewMode,
  selectedCategory, 
  setSelectedCategory,
  selectedCities,
  setSelectedCities,
  sortBy,
  setSortBy,
  setIsFilterDrawerOpen,
  filteredCount,
  categories,
  selectedEnvironment,
  setSelectedEnvironment,
  showFavoritesOnly,
  setShowFavoritesOnly,
  showCircuits,
  setShowCircuits
}: { 
  viewMode: ViewMode, 
  setViewMode: (mode: ViewMode) => void,
  selectedCategory: string, 
  setSelectedCategory: (category: string) => void,
  selectedCities: string[],
  setSelectedCities: (cities: string[]) => void,
  sortBy: string,
  setSortBy: (sort: string) => void,
  setIsFilterDrawerOpen: (open: boolean) => void,
  filteredCount: number,
  categories: ScreenCategory[],
  selectedEnvironment: string,
  setSelectedEnvironment: (environment: string) => void,
  showFavoritesOnly: boolean,
  setShowFavoritesOnly: (show: boolean) => void,
  showCircuits: boolean,
  setShowCircuits: (show: boolean) => void
}) {
  return (
    <div className="mb-6 sm:mb-8 lg:mb-10">
      {/* Header with title and view mode selector - Ultra Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="font-bold text-gray-900" 
            style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}>
          Pantallas disponibles
        </h2>
        
        {/* View mode selector - Enhanced for all screen sizes */}
        <div className="flex items-center bg-gray-100 rounded-lg sm:rounded-xl p-1">
            <button
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition-all min-h-[44px] touch-manipulation ${
              viewMode === 'card' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
            }`}
              onClick={() => setViewMode('card')}
            aria-label="Vista en tarjetas"
            >
            <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            <button
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition-all min-h-[44px] touch-manipulation ${
              viewMode === 'compact' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
            }`}
              onClick={() => setViewMode('compact')}
            aria-label="Vista en lista compacta"
            >
            <LayoutList className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Lista</span>
            </button>
        <button
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition-all min-h-[44px] touch-manipulation ${
              viewMode === 'map' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
          }`}
            onClick={() => setViewMode('map')}
            aria-label="Vista en mapa"
        >
            <Map className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mapa</span>
        </button>
                  </div>
          </div>
        
      {/* Filters and results count - Enhanced Mobile Layout */}
      <div className="mt-3 sm:mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            {filteredCount} {filteredCount === 1 ? 'pantalla encontrada' : 'pantallas encontradas'}
          </p>
          
          {/* Filter buttons container - Responsive Layout */}
          <div className="flex items-center gap-2 order-1 sm:order-2 flex-wrap">
            {/* Circuits filter button - Enhanced Touch Target */}
            <button
              onClick={() => setShowCircuits(!showCircuits)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all duration-200 min-h-[44px] touch-manipulation ${
                showCircuits 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={showCircuits ? 'Ocultar circuitos' : 'Mostrar circuitos'}
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${showCircuits ? 'text-purple-600' : ''}`} />
              <span className="hidden sm:inline">
                {showCircuits ? 'Ocultar circuitos' : 'Mostrar circuitos'}
              </span>
              <span className="sm:hidden">
                {showCircuits ? 'Sin circuitos' : 'Con circuitos'}
              </span>
            </button>

            {/* Favorites filter button - Enhanced Touch Target */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all duration-200 min-h-[44px] touch-manipulation ${
                showFavoritesOnly 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={showFavoritesOnly ? 'Quitar filtro de favoritos' : 'Solo mostrar favoritos'}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="hidden sm:inline">
                {showFavoritesOnly ? 'Quitar filtro' : 'Solo favoritos'}
              </span>
              <span className="sm:hidden">
                {showFavoritesOnly ? 'Todos' : 'Favoritos'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Marketplace() {
  const navigate = useNavigate();
  
  // Initialize sample data for ML demo
  useEffect(() => {
    initializeSampleData();
  }, []);
  
  // Combine all screens without duplicates using useMemo
  const allScreens = useMemo(() => {
    const uniqueScreens: ScreenWithCircuit[] = [];
    const seenIds = new Set<string>();
    
    // Add mockScreens first, casting to extended type
    (mockScreens as ScreenWithCircuit[]).forEach((screen) => {
      if (!seenIds.has(screen.id)) {
        seenIds.add(screen.id);
        uniqueScreens.push({
          ...screen,
          isPartOfCircuit: screen.isPartOfCircuit || false
        });
      }
    });
    
    // Add demoScreens, skipping duplicates
    demoScreens.forEach((screen) => {
      if (!seenIds.has(screen.id)) {
        seenIds.add(screen.id);
        uniqueScreens.push({
          ...screen,
          isPartOfCircuit: screen.isPartOfCircuit || false
        });
      }
    });
    
    return uniqueScreens;
  }, []);

  const [bookingStep, setBookingStep] = useState<BookingStep>('browse');
  const [bookingData, setBookingData] = useState<BookingData>({
    screen: null,
    type: null,
    file: null,
    filePreview: null,
    uploadLater: false,
  });
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSmartSearchDemoOpen, setIsSmartSearchDemoOpen] = useState(false);
  const [selectedMapScreen, setSelectedMapScreen] = useState<Screen | null>(null);
  
  // Filter state - Updated to use Smart Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState<number>(0);
  const [allowsMoments, setAllowsMoments] = useState<boolean | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(true);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showCircuits, setShowCircuits] = useState<boolean>(true);
  
  // Smart Filters state - NEW
  const [smartFilters, setSmartFilters] = useState<SmartFiltersState>({
    parentCategories: [],
    childCategories: [],
    environments: [],
    dwellTimes: [],
    priceRanges: [],
    allowsMoments: null,
    rating: null,
  });
  
  // Venue category filtering state - DEPRECATED (keeping for compatibility)
  const [venueFilters, setVenueFilters] = useState<VenueFilter>({
    parentCategories: [],
    childCategories: [],
    environments: [],
    dwellTimes: []
  });
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  
  // Time selection state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  
  // Creative upload state
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // References
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // OpenRTB-DOOH Programmatic State
  const [isProgrammaticMode, setIsProgrammaticMode] = useState(false);
  const [doohInventoryRequests, setDoohInventoryRequests] = useState<DOOHInventoryRequest[]>([]);
  const [doohBidRequests, setDoohBidRequests] = useState<OpenRTBBidRequest[]>([]);
  const [programmaticScreens, setProgrammaticScreens] = useState<DOOHScreen[]>([]);
  const [sspConnections, setSspConnections] = useState<string[]>([]);
  
  // Debounced search
  const updateDebouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    updateDebouncedSearch(searchQuery);
  }, [searchQuery, updateDebouncedSearch]);



  // OpenRTB-DOOH Handler Functions
  const handleProgrammaticInventoryRequest = useCallback(async (request: DOOHInventoryRequest) => {
    try {
      const response = await processDOOHInventoryRequest(request, demoScreens);
      setDoohInventoryRequests(prev => [...prev, request]);
      return response;
    } catch (error) {
      console.error('Error processing inventory request:', error);
      throw error;
    }
  }, []);

  const handleProgrammaticBidRequest = useCallback(async (request: OpenRTBBidRequest) => {
    try {
      const response = await processDOOHBidRequest(request, demoScreens);
      setDoohBidRequests(prev => [...prev, request]);
      return response;
    } catch (error) {
      console.error('Error processing bid request:', error);
      throw error;
    }
  }, []);

  const toggleProgrammaticMode = useCallback(() => {
    setIsProgrammaticMode(prev => !prev);
  }, []);

  const connectToSSP = useCallback((sspName: string) => {
    setSspConnections(prev => [...prev, sspName]);
  }, []);

  const disconnectFromSSP = useCallback((sspName: string) => {
    setSspConnections(prev => prev.filter(name => name !== sspName));
  }, []);

  // Filter screens based on all criteria - UPDATED to use SmartFilters
  const filteredScreens = useMemo(() => {
    let filtered = allScreens.filter(screen => {
      const matchesSearch = !debouncedSearchQuery ||
        screen.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        screen.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || screen.category.id === selectedCategory;
      
      const matchesCity = selectedCities.length === 0 || 
        selectedCities.some(city => screen.location.toLowerCase().includes(city.toLowerCase()));
      
      const matchesEnvironment = selectedEnvironment === 'all' || 
        screen.environment === selectedEnvironment;
      
      const screenPrice = screen.price;
      const matchesPrice = screenPrice >= priceRange[0] && screenPrice <= priceRange[1];
      
      const matchesRating = screen.rating >= minRating;
      
      // Check if screen is in user's favorites
      const isFavoriteScreen = favoritesService.isFavorite(screen.id);
      const matchesFavorites = !showFavoritesOnly || isFavoriteScreen;
      
      const matchesMoments = allowsMoments === null || screen.pricing.allowMoments === allowsMoments;
      const matchesAvailability = isAvailable === null || screen.availability === isAvailable;

      // NEW: Price range filtering based on minimum bundle prices
      const screenMinPrice = getScreenMinPrice(screen);
      let matchesPriceRanges = true;
      if (smartFilters.priceRanges.length > 0) {
        matchesPriceRanges = smartFilters.priceRanges.some(rangeId => {
          const range = PRICE_RANGES.find(r => r.id === rangeId);
          if (!range) return false;
          return screenMinPrice >= range.min && screenMinPrice < range.max;
        });
      }

      // NEW: Smart Filters - venue-based filtering
      const screenVenueMapping = getScreenVenueMapping(screen);
      
      // Check venue parent categories filter
      const matchesSmartVenueCategories = smartFilters.parentCategories.length === 0 || 
        (screenVenueMapping.parentCategory && smartFilters.parentCategories.includes(screenVenueMapping.parentCategory));
      
      // Check venue environments filter
      const matchesSmartVenueEnvironments = smartFilters.environments.length === 0 || 
        (screenVenueMapping.environment && smartFilters.environments.includes(screenVenueMapping.environment));
      
      // Check venue dwell times filter
      const matchesSmartVenueDwellTimes = smartFilters.dwellTimes.length === 0 || 
        (screenVenueMapping.dwellTime && smartFilters.dwellTimes.includes(screenVenueMapping.dwellTime));

      // Check smart filters additional criteria
      const matchesSmartMoments = smartFilters.allowsMoments === null || screen.pricing.allowMoments === smartFilters.allowsMoments;
      const matchesSmartRating = smartFilters.rating === null || screen.rating >= smartFilters.rating;
      // Always filter for available screens only - marketplace shows only available screens
      const matchesAvailabilityDefault = screen.availability === true;

      // OLD: Venue-based filtering (keeping for backward compatibility)
      const matchesVenueParentCategories = venueFilters.parentCategories.length === 0 || 
        (screenVenueMapping.parentCategory && venueFilters.parentCategories.includes(screenVenueMapping.parentCategory));
      
      const matchesVenueEnvironments = venueFilters.environments.length === 0 || 
        (screenVenueMapping.environment && venueFilters.environments.includes(screenVenueMapping.environment));
      
      const matchesVenueDwellTimes = venueFilters.dwellTimes.length === 0 || 
        (screenVenueMapping.dwellTime && venueFilters.dwellTimes.includes(screenVenueMapping.dwellTime));
      
      return matchesSearch && matchesCategory && matchesCity && matchesEnvironment && 
        matchesPrice && matchesRating && matchesFavorites && matchesMoments && matchesAvailability &&
        matchesPriceRanges &&
        matchesSmartVenueCategories && matchesSmartVenueEnvironments && matchesSmartVenueDwellTimes &&
        matchesSmartMoments && matchesSmartRating && matchesAvailabilityDefault &&
        matchesVenueParentCategories && matchesVenueEnvironments && matchesVenueDwellTimes;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => getScreenMinPrice(a) - getScreenMinPrice(b));
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => getScreenMinPrice(b) - getScreenMinPrice(a));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'relevance') {
      // Implement your relevance sorting logic here
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [
    debouncedSearchQuery, 
    selectedCategory, 
    selectedCities, 
    selectedEnvironment,
    priceRange,
    minRating,
    showFavoritesOnly,
    allowsMoments, 
    isAvailable,
    sortBy,
    smartFilters, // NEW: Include smart filters in dependencies
    venueFilters, // Keep old filters for compatibility
    allScreens,
    favoritesUpdateTrigger
  ]);
  
  // Group screens into circuits
  const groupedResult = useMemo(() => {
    const circuits: Record<string, ScreenWithCircuit[]> = {};
    const singleScreens: ScreenWithCircuit[] = [];

    filteredScreens.forEach(screen => {
      const s = screen as ScreenWithCircuit;
      if (s.isPartOfCircuit && s.circuitId && showCircuits) {
        if (!circuits[s.circuitId]) {
          circuits[s.circuitId] = [];
        }
        circuits[s.circuitId].push(s);
      } else {
        singleScreens.push(s);
      }
    });

    const finalCircuits = Object.values(circuits).filter(circuitScreens => {
        // Show circuit card only if it has more than one screen after filtering
        return circuitScreens.length > 1;
    });

    // If showCircuits is false, return only individual screens
    if (!showCircuits) {
      return singleScreens;
    }

    return [...finalCircuits, ...singleScreens];
  }, [filteredScreens, showCircuits]);

  // Get distinct cities from screens for metadata
  const citiesMetadata = useMemo(() => {
    const allCities = filteredScreens.map(screen => screen.location.split(',')[0].trim());
    return [...new Set(allCities)];
  }, [filteredScreens]);

  // Initialize programmatic screens from current filtered screens
  useEffect(() => {
    if (isProgrammaticMode && filteredScreens.length > 0) {
      const doohScreens = filteredScreens.map(convertScreenToDOOH);
      setProgrammaticScreens(doohScreens);
    }
  }, [isProgrammaticMode, filteredScreens]);

  // Enhanced SEO metadata with AI optimization
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toISOString();
  
  const selectedCityNames = selectedCities.length > 0 
    ? selectedCities.map(city => city.charAt(0).toUpperCase() + city.slice(1)).join(', ')
    : undefined;
  
  const cityPath = selectedCities.length > 0 ? `/${selectedCities.join(',')}` : '';
    
  const title = selectedCityNames
    ? `Pantallas LED y Vallas Digitales en ${selectedCityNames} ${currentYear} | Shareflow.me`
    : `Marketplace de Pantallas Digitales Colombia ${currentYear} | Shareflow.me`;
  
  const description = selectedCityNames
    ? `✅ Encuentra y reserva pantallas digitales y vallas LED en ${selectedCityNames}. Publicidad exterior DOOH con alto impacto, datos en tiempo real y reserva instantánea. Desde momentos de 20 segundos hasta campañas mensuales. Precios transparentes y ubicaciones premium verificadas.`
    : `🚀 Marketplace líder de pantallas y vallas digitales en Colombia. Más de ${filteredScreens.length}+ ubicaciones premium verificadas. Publicidad exterior DOOH con IA, datos en tiempo real, reserva instantánea y precios transparentes. Desde momentos hasta campañas completas.`;

  // Generate AI-optimized keywords
  const generateKeywords = () => {
    const baseKeywords = [
      'pantallas digitales Colombia',
      'vallas publicitarias LED',
      'publicidad exterior DOOH',
      'digital out of home',
      'pantallas LED alquiler',
      'publicidad digital',
      'marketing exterior',
      'pantallas publicitarias',
      'vallas digitales',
      'advertising screens',
      'outdoor advertising',
      'digital billboard',
      'LED advertising',
      'programmatic DOOH',
      'smart advertising',
      'ubicaciones premium',
      'campañas digitales'
    ];
    
    if (selectedCities.length > 0) {
      selectedCities.forEach(city => {
        baseKeywords.push(
          `pantallas digitales ${city}`,
          `vallas LED ${city}`,
          `publicidad exterior ${city}`,
          `DOOH ${city}`
        );
      });
    }
    
    return baseKeywords.join(', ');
  };

  // Generate Schema.org structured data
  const generateSchemaMarkup = () => {
    const baseUrl = 'https://shareflow.me';
    const currentUrl = `${baseUrl}/marketplace${cityPath}`;
    
    const organizationSchema = {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "Shareflow",
      "alternateName": "Shareflow Ads",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.svg`,
        "width": 200,
        "height": 60
      },
      "sameAs": [
        "https://linkedin.com/company/shareflow",
        "https://twitter.com/shareflow_ads",
        "https://facebook.com/shareflow.ads"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+57-1-234-5678",
        "contactType": "customer service",
        "availableLanguage": ["Spanish", "English"]
      }
    };

    const webSiteSchema = {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "url": baseUrl,
      "name": "Shareflow - Marketplace de Pantallas Digitales",
      "description": "Plataforma líder para alquiler de pantallas digitales y vallas LED en Colombia",
      "publisher": { "@id": `${baseUrl}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/marketplace?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    const breadcrumbSchema = {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Marketplace",
          "item": `${baseUrl}/marketplace`
        }
      ]
    };

    if (selectedCities.length > 0) {
      selectedCities.forEach((city, index) => {
        breadcrumbSchema.itemListElement.push({
          "@type": "ListItem",
          "position": 3 + index,
          "name": city.charAt(0).toUpperCase() + city.slice(1),
          "item": `${baseUrl}/marketplace/${city}`
        });
      });
    }

    const serviceSchema = {
      "@type": "Service",
      "name": "Alquiler de Pantallas Digitales",
      "description": "Servicio de alquiler de pantallas LED y vallas digitales para publicidad exterior",
      "provider": { "@id": `${baseUrl}/#organization` },
      "areaServed": {
        "@type": "Country",
        "name": "Colombia"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Catálogo de Pantallas Digitales",
        "itemListElement": filteredScreens.slice(0, 10).map((screen, index) => ({
          "@type": "Offer",
          "name": screen.name,
          "description": `Pantalla digital en ${screen.location}`,
          "price": screen.price.toString(),
          "priceCurrency": "COP",
          "availability": screen.availability ? "InStock" : "OutOfStock",
          "category": screen.category.name,
          "url": `${baseUrl}/screens/${screen.id}`
        }))
      }
    };

    const collectionPageSchema = {
      "@type": "CollectionPage",
      "@id": currentUrl,
      "url": currentUrl,
      "name": title,
      "description": description,
      "isPartOf": { "@id": `${baseUrl}/#website` },
      "about": { "@id": `${baseUrl}/#organization` },
      "dateModified": currentDate,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": filteredScreens.length,
        "itemListElement": filteredScreens.slice(0, 20).map((screen, index) => ({
          "@type": "Product",
          "position": index + 1,
          "name": screen.name,
          "description": `Pantalla digital ${screen.specs.resolution} en ${screen.location}`,
          "image": screen.image,
          "url": `${baseUrl}/screens/${screen.id}`,
          "offers": {
            "@type": "Offer",
            "price": screen.price.toString(),
            "priceCurrency": "COP",
            "availability": screen.availability ? "InStock" : "OutOfStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": screen.rating.toString(),
            "reviewCount": screen.reviews.toString(),
            "bestRating": "5",
            "worstRating": "1"
          }
        }))
      }
    };

    return {
      "@context": "https://schema.org",
      "@graph": [
        organizationSchema,
        webSiteSchema,
        breadcrumbSchema,
        serviceSchema,
        collectionPageSchema
      ]
    };
  };
  
  // Dropzone setup for creative uploads that will be used in other booking steps
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Create an object URL for the file preview
        const filePreview = URL.createObjectURL(file);
        
        // Check if the file is an image
        const isImage = file.type.startsWith('image/');
        
        if (isImage) {
          // For images, check dimensions before accepting
          const img = new Image();
          img.onload = () => {
            const fileWidth = img.width;
            const fileHeight = img.height;
            
            // Compare with screen dimensions if a screen is selected
            if (bookingData.screen) {
              const screenWidth = bookingData.screen.specs.width;
              const screenHeight = bookingData.screen.specs.height;
              
              // Calculate aspect ratio difference
              const fileRatio = fileWidth / fileHeight;
              const screenRatio = screenWidth / screenHeight;
              const ratioDifference = Math.abs(fileRatio - screenRatio);
              
              // Store dimension information with the file
        setBookingData(prev => ({
          ...prev,
                file,
                filePreview,
                fileDimensions: {
                  width: fileWidth,
                  height: fileHeight,
                  aspectRatio: fileRatio,
                  matchesScreen: ratioDifference < 0.1, // Consider it a match if ratio difference is small
                  scaleMethod: 'fill' // Default scaling method
                }
              }));
              
              // Show warning if dimensions don't match well
              if (ratioDifference >= 0.1) {
                setError(`Advertencia: La relación de aspecto de tu imagen (${fileRatio.toFixed(2)}) no coincide con la pantalla (${screenRatio.toFixed(2)}). Tu creatividad puede verse distorsionada.`);
              } else {
        setError(null);
              }
            } else {
              // No screen selected yet, just store the file
              setBookingData(prev => ({
                ...prev,
                file,
                filePreview,
                fileDimensions: {
                  width: fileWidth,
                  height: fileHeight,
                  aspectRatio: fileWidth / fileHeight,
                  scaleMethod: 'fill'
                }
              }));
              setError(null);
            }
          };
          
          img.onerror = () => {
            setError('No se pudo cargar la imagen para verificar sus dimensiones.');
          };
          
          img.src = filePreview;
        } else {
          // For videos, we need to handle differently
          const video = document.createElement('video');
          video.preload = 'metadata';
          
          video.onloadedmetadata = () => {
            const fileWidth = video.videoWidth;
            const fileHeight = video.videoHeight;
            
            // Compare with screen dimensions if a screen is selected
            if (bookingData.screen) {
              const screenWidth = bookingData.screen.specs.width;
              const screenHeight = bookingData.screen.specs.height;
              
              // Calculate aspect ratio difference
              const fileRatio = fileWidth / fileHeight;
              const screenRatio = screenWidth / screenHeight;
              const ratioDifference = Math.abs(fileRatio - screenRatio);
              
              // Store dimension information with the file
              setBookingData(prev => ({
                ...prev,
                file,
                filePreview,
                fileDimensions: {
                  width: fileWidth,
                  height: fileHeight,
                  aspectRatio: fileRatio,
                  matchesScreen: ratioDifference < 0.1,
                  scaleMethod: 'fill'
                }
              }));
              
              // Show warning if dimensions don't match well
              if (ratioDifference >= 0.1) {
                setError(`Advertencia: La relación de aspecto de tu video (${fileRatio.toFixed(2)}) no coincide con la pantalla (${screenRatio.toFixed(2)}). Tu creatividad puede verse distorsionada.`);
              } else {
                setError(null);
              }
            } else {
              // No screen selected yet, just store the file
              setBookingData(prev => ({
                ...prev,
                file,
                filePreview,
                fileDimensions: {
                  width: fileWidth,
                  height: fileHeight, 
                  aspectRatio: fileWidth / fileHeight,
                  scaleMethod: 'fill'
                }
              }));
              setError(null);
            }
          };
          
          video.onerror = () => {
            setError('No se pudo cargar el video para verificar sus dimensiones.');
          };
          
          video.src = filePreview;
        }
      }
    },
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles[0]?.errors[0]?.code === 'file-too-large') {
        setError('El archivo es demasiado grande. El tamaño máximo es 100MB.');
      } else if (rejectedFiles[0]?.errors[0]?.code === 'file-invalid-type') {
        setError('Formato de archivo no soportado. Sube una imagen (JPG, PNG, GIF) o video (MP4).');
      } else {
        setError('Error al subir el archivo. Inténtalo de nuevo.');
      }
    }
  });
  
  // Handle scale method change
  const handleScaleMethodChange = (method: 'fill' | 'expand') => {
    setBookingData(prev => ({
      ...prev,
      fileDimensions: prev.fileDimensions ? {
        ...prev.fileDimensions,
        scaleMethod: method
      } : undefined
    }));
  };
  
  // Preview component that shows how the creative will look on the screen
  const CreativePreview = ({ screen, file, fileDimensions, filePreview }: {
    screen: Screen | null,
    file: File | null,
    fileDimensions?: {
      width: number,
      height: number,
      aspectRatio: number,
      matchesScreen?: boolean,
      scaleMethod: 'fill' | 'expand'
    },
    filePreview: string | null
  }) => {
    if (!screen || !file || !filePreview || !fileDimensions) {
      return null;
    }
    
    const screenRatio = screen.specs.width / screen.specs.height;
    const objectFit = fileDimensions.scaleMethod === 'fill' ? 'cover' : 'contain';
    
    return (
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-semibold">Vista previa en la pantalla</h4>
        <div className="relative aspect-video border border-neutral-200 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <div 
              style={{ 
                width: '100%',
                height: '100%',
                aspectRatio: screenRatio,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {file.type.startsWith('image/') ? (
                <img 
                  src={filePreview}
                  alt="Vista previa"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit
                  }}
                />
              ) : (
                <video
                  src={filePreview}
                  controls
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit
                  }}
                />
              )}
                  </div>
                    </div>
        </div>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => handleScaleMethodChange('fill')}
            className={`px-3 py-2 text-sm rounded-lg ${
              fileDimensions.scaleMethod === 'fill' 
                ? 'bg-[#353FEF] text-white' 
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Rellenar
          </button>
          <button
            type="button"
            onClick={() => handleScaleMethodChange('expand')}
            className={`px-3 py-2 text-sm rounded-lg ${
              fileDimensions.scaleMethod === 'expand'
                ? 'bg-[#353FEF] text-white' 
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Ajustar
          </button>
        </div>
        <p className="text-xs text-neutral-500 text-center">
          {fileDimensions.scaleMethod === 'fill' 
            ? 'Rellenar: La imagen/video se ajustará para cubrir toda la pantalla (puede recortarse parte del contenido).' 
            : 'Ajustar: La imagen/video se ajustará completamente dentro de la pantalla (pueden aparecer bordes).'
          }
        </p>
      </div>
    );
  };
  
  // Using these variables to prevent unused warning
  // They're used in the creative-upload step
  const dropzoneProps = { getRootProps, getInputProps };
  
  // Memoizar la función handleSelectScreen para evitar re-renders innecesarios
  const memoizedHandleSelectScreen = useCallback((screen: Screen) => {
    navigate(`/screens/${screen.id}`);
  }, [navigate]);

  // Handle favorite changes to trigger filter updates
  const handleFavoriteChange = useCallback(() => {
    setFavoritesUpdateTrigger(prev => prev + 1);
  }, []);
  
  // Navigation functions
  const handleSelectScreen = (screen: Screen) => {
    navigate(`/screens/${screen.id}`);
  };
  
  const handlePreviousStep = () => {
    if (bookingStep === 'details') {
      setBookingStep('browse');
    } else if (bookingStep === 'time-selection') {
      setBookingStep('details');
    } else if (bookingStep === 'creative-upload') {
      setBookingStep('time-selection');
    } else if (bookingStep === 'summary') {
      setBookingStep('creative-upload');
    }
    scrollToTop();
  };
  
  const handleSelectBookingType = (type: BookingType) => {
    setBookingData(prev => ({ ...prev, type }));
    
    // Initialize dates based on booking type
    if (type) {
      const today = new Date();
      
      if (type === 'moment') {
        setSelectedDate(today);
        setSelectedTime('12:00');
        setSelectedMinute(0);
      } else if (type === 'hourly') {
        setSelectedDate(today);
        setSelectedTimeSlots([]);
      } else if (type === 'daily') {
        setSelectedDates([today]);
      } else if (type === 'weekly') {
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push(date);
        }
        setSelectedDates(dates);
      } else if (type === 'monthly') {
        const dates = [];
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push(date);
        }
        setSelectedDates(dates);
      }
    }
    
    setBookingStep('time-selection');
    scrollToTop();
  };
  
  const handleTimeSelectionComplete = () => {
    // Save the time selection to booking data
    setBookingData(prev => {
      let updatedData = { ...prev };
      
      if (prev.type === 'moment' && selectedDate && selectedTime && selectedMinute !== null) {
        updatedData = {
          ...updatedData,
          date: selectedDate,
          time: selectedTime,
          minute: selectedMinute,
          price: calculatePrice()
        };
      } else if ((prev.type === 'hourly') && selectedDate && selectedTimeSlots.length > 0) {
        updatedData = {
          ...updatedData,
          date: selectedDate,
          timeSlots: selectedTimeSlots,
          price: calculatePrice()
        };
      } else if (['daily', 'weekly', 'monthly'].includes(prev.type || '') && selectedDates.length > 0) {
        updatedData = {
          ...updatedData,
          dates: selectedDates,
          price: calculatePrice()
        };
      }
      
      return updatedData;
    });
    
    setBookingStep('creative-upload');
    scrollToTop();
  };
  
  const handleCreativeUploadComplete = () => {
    setBookingData(prev => ({
      ...prev,
      uploadLater: !prev.file,
    }));
    setBookingStep('summary');
    scrollToTop();
  };
  
  const handleCompletePurchase = () => {
    setProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      // Reset and return to browse
      setBookingStep('browse');
      setBookingData({
        screen: null,
        type: null,
        file: null,
        filePreview: null,
        uploadLater: false,
      });
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedMinute(null);
      setSelectedTimeSlots([]);
      setSelectedDates([]);
      
      // Show success message
      alert('¡Compra realizada con éxito! Pronto recibirás confirmación por correo electrónico.');
    }, 2000);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedCities([]);
    setSelectedEnvironment('all');
    setPriceRange([0, 3000000]);
    setMinRating(0);
    setShowFavoritesOnly(false);
    setAllowsMoments(null);
    setIsAvailable(true);
    setSortBy('relevance');
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setShowCircuits(true);
    
    // Reset Smart Filters
    setSmartFilters({
      parentCategories: [],
      childCategories: [],
      environments: [],
      dwellTimes: [],
      priceRanges: [],
      allowsMoments: null,
      rating: null,
    });
    
    // Keep old venue filters for compatibility
    setVenueFilters({
      parentCategories: [],
      childCategories: [],
      environments: [],
      dwellTimes: []
    });
    
    if(isFilterDrawerOpen) setIsFilterDrawerOpen(false);
  };
  
  // Helper functions
  const calculatePrice = () => {
    if (!bookingData.screen) return 0;
    
    let price = 0;
    
    if (bookingData.type === 'moment') {
      price = 9500; // Base price for a moment
    } else if (bookingData.type === 'hourly') {
      price = bookingData.screen.price * (selectedTimeSlots.length || 1);
    } else if (bookingData.type === 'daily') {
      price = bookingData.screen.price * 8 * (selectedDates.length || 1); // 8 hours per day
    } else if (bookingData.type === 'weekly') {
      price = bookingData.screen.price * 8 * 7 * 0.8; // 8 hours * 7 days with 20% discount
    } else if (bookingData.type === 'monthly') {
      price = bookingData.screen.price * 8 * 30 * 0.7; // 8 hours * 30 days with 30% discount
    }
    
    return Math.round(price);
  };
  
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Debounce function
  function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  }
  
  // Update ViewMode state to include all options
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  
  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta name="keywords" content={generateKeywords()} />
        <meta name="author" content="Shareflow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="language" content="Spanish" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Canonical and Alternate URLs */}
        <link rel="canonical" href={`https://shareflow.me/marketplace${cityPath}`} />
        <link rel="alternate" hrefLang="es" href={`https://shareflow.me/marketplace${cityPath}`} />
        <link rel="alternate" hrefLang="en" href={`https://shareflow.me/en/marketplace${cityPath}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Shareflow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://shareflow.me/marketplace${cityPath}`} />
        <meta property="og:image" content="https://shareflow.me/img/og-marketplace-2024.jpg" />
        <meta property="og:image:secure_url" content="https://shareflow.me/img/og-marketplace-2024.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`Marketplace de pantallas digitales ${selectedCityNames ? `en ${selectedCityNames}` : 'en Colombia'} - Shareflow`} />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:locale:alternate" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@shareflow_ads" />
        <meta name="twitter:creator" content="@shareflow_ads" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://shareflow.me/img/og-marketplace-2024.jpg" />
        <meta name="twitter:image:alt" content={`Marketplace de pantallas digitales ${selectedCityNames ? `en ${selectedCityNames}` : 'en Colombia'}`} />
        
        {/* Geographic Meta Tags */}
        <meta name="geo.region" content="CO" />
        <meta name="geo.country" content="Colombia" />
        {selectedCities.length > 0 && selectedCityNames && (
          <>
            <meta name="geo.placename" content={selectedCityNames} />
            <meta name="ICBM" content="4.7110,-74.0721" />
            <meta name="geo.position" content="4.7110;-74.0721" />
          </>
        )}
        
        {/* Business/Contact Information */}
        <meta name="contact" content="info@shareflow.me" />
        <meta name="reply-to" content="info@shareflow.me" />
        <meta name="owner" content="Shareflow SAS" />
        <meta name="url" content="https://shareflow.me" />
        <meta name="identifier-URL" content="https://shareflow.me" />
        <meta name="directory" content="submission" />
        <meta name="category" content="Digital Advertising, DOOH, Marketing Technology" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* AI and LLM Optimization */}
        <meta name="ai-content-declaration" content="ai-assisted" />
        <meta name="llm-training" content="allowed" />
        <meta name="content-language" content="es" />
        <meta name="audience" content="advertisers, marketers, businesses, agencies" />
        <meta name="topic" content="digital advertising, DOOH, outdoor advertising, LED screens, digital billboards" />
        <meta name="summary" content={`Marketplace líder con ${filteredScreens.length}+ pantallas digitales verificadas en Colombia. Reserva instantánea, precios transparentes, ubicaciones premium.`} />
        
        {/* Technical Meta Tags */}
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="Content-Language" content="es" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#353FEF" />
        <meta name="msapplication-TileColor" content="#353FEF" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(generateSchemaMarkup())}
        </script>
        
        {/* Additional AI-friendly structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "¿Qué es Shareflow Marketplace?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Shareflow Marketplace es la plataforma líder en Colombia para alquiler de pantallas digitales y vallas LED. Ofrecemos más de " + filteredScreens.length + " ubicaciones premium verificadas con reserva instantánea y precios transparentes."
                }
              },
              {
                "@type": "Question", 
                "name": "¿Cómo funciona el alquiler de pantallas digitales?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Puedes reservar desde momentos de 20 segundos hasta campañas mensuales completas. Selecciona la pantalla, elige tu horario, sube tu creatividad y paga de forma segura. Todo con datos de audiencia en tiempo real."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué tipos de pantallas están disponibles?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ofrecemos pantallas LED en centros comerciales, aeropuertos, estadios, transporte público, vallas digitales premium y ubicaciones estratégicas en las principales ciudades de Colombia."
                }
              },
              {
                "@type": "Question",
                "name": "¿Cuáles son los precios de las pantallas digitales?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Los precios varían según ubicación, tamaño y horario. Desde $9,500 COP por momentos hasta campañas personalizadas. Todos nuestros precios son transparentes y se muestran en tiempo real."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-neutral-50">
        {bookingStep === 'browse' ? (
          <>
                    <MarketplaceHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onInfoClick={() => setIsSmartSearchDemoOpen(true)}
          filteredCount={filteredScreens.length}
        />
            
            {/* Ultra-Responsive Container with Fluid Breakpoints */}
            <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
              <div className="max-w-7xl mx-auto py-4 sm:py-6 md:py-8 lg:py-10">
              {/* New Unified Filters Component */}
              <UnifiedFilters
                allScreens={allScreens}
                selectedCities={selectedCities}
                setSelectedCities={setSelectedCities}
                smartFilters={smartFilters}
                setSmartFilters={setSmartFilters}
                showFavoritesOnly={showFavoritesOnly}
                setShowFavoritesOnly={setShowFavoritesOnly}
                showCircuits={showCircuits}
                setShowCircuits={setShowCircuits}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filteredCount={filteredScreens.length}
              />
                
                {/* Content area with Enhanced Responsive Spacing */}
                <div className="mt-6 sm:mt-8 lg:mt-10">
                {groupedResult.length > 0 ? (
                  <>
                    {viewMode === 'card' && (
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                        {groupedResult.map((item, index) => {
                          if (Array.isArray(item)) {
                            // It's a circuit
                            return (
                              <CircuitCard 
                                key={item[0].circuitId}
                                circuit={item}
                                handleSelectScreen={memoizedHandleSelectScreen}
                                navigate={navigate}
                              />
                            );
                          } else {
                            // It's a single screen
                            const screen = item as ScreenWithCircuit;
                            return (
                              <ScreenCard 
                                key={screen.id}
                                screen={screen}
                                index={index}
                                handleSelectScreen={memoizedHandleSelectScreen}
                                onFavoriteChange={handleFavoriteChange}
                              />
                            );
                          }
                        })}
                      </div>
                    )}

                    {viewMode === 'compact' && (
                      <div className="space-y-3">
                        {filteredScreens.map((screen, index) => (
                          <div 
                            key={screen.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => memoizedHandleSelectScreen(screen)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={screen.image} 
                                  alt={screen.name}
                                  className="w-full h-full object-cover"
                                />
                      </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{screen.name}</h3>
                                <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {screen.location}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {screen.views.daily.toLocaleString()}/día
                                  </span>
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {screen.rating}
                      </span>
                    </div>
                  </div>

                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-lg text-gray-900">
                                  {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0
                                  }).format(screen.price)}
                                </p>
                                <p className="text-xs text-gray-500">por hora</p>
                          </div>
                              
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                        ))}
                    </div>
                  )}

                    {viewMode === 'map' && (
                      <div className="h-[600px] lg:h-[700px] bg-gray-100 rounded-xl overflow-hidden relative">
                        <div className="flex h-full">
                          {/* Map Section */}
                          <div className="w-full lg:w-3/5 relative">
                        <LoadScript 
                          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'your-api-key'}
                        >
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={{ lat: 4.7110, lng: -74.0721 }} // Bogotá center
                            zoom={10}
                            options={{
                              zoomControl: true,
                              streetViewControl: false,
                              mapTypeControl: false,
                              fullscreenControl: false,
                            }}
                          >
                            {filteredScreens.map((screen) => (
                              screen.coordinates && (
                                <Marker
                                  key={screen.id}
                                  position={screen.coordinates}
                                  onClick={() => setSelectedMapScreen(screen)}
                                  icon={
                                    typeof window !== 'undefined' && window.google && window.google.maps
                                      ? {
                                          url: 'data:image/svg+xml,' + encodeURIComponent(`
                                                <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M20 0C8.954 0 0 8.954 0 20C0 31.046 20 50 20 50S40 31.046 40 20C40 8.954 31.046 0 20 0Z" fill="#353FEF"/>
                                                  <circle cx="20" cy="20" r="10" fill="white"/>
                                                  <text x="20" y="25" text-anchor="middle" fill="#353FEF" font-size="8" font-weight="bold">$${Math.round(getScreenMinPrice(screen) / 1000)}K</text>
                                            </svg>
                                          `),
                                              scaledSize: new window.google.maps.Size(40, 50),
                                              anchor: new window.google.maps.Point(20, 50)
                                        }
                                      : undefined
                                  }
                                />
                              )
                            ))}
                          </GoogleMap>
                        </LoadScript>
                          </div>

                          {/* Listings Panel */}
                          <div className="hidden lg:block w-2/5 bg-white border-l border-gray-200">
                            <div className="h-full flex flex-col">
                              {/* Header */}
                              <div className="p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {filteredScreens.length} {filteredScreens.length === 1 ? 'pantalla' : 'pantallas'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Haz clic en una pantalla para ver más detalles
                                </p>
                              </div>

                              {/* Listings */}
                              <div className="flex-1 overflow-y-auto">
                                <div className="space-y-3 p-4">
                                  {filteredScreens.map((screen) => (
                                    <div
                                      key={screen.id}
                                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[#353FEF]/30"
                                      onClick={() => setSelectedMapScreen(screen)}
                                    >
                                      <div className="flex gap-3">
                                        {/* Image */}
                                        <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                          <img 
                                            src={screen.image} 
                                            alt={screen.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-gray-900 text-sm truncate pr-2">
                                              {screen.name}
                                            </h4>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                              <span className="text-xs font-medium text-gray-700">
                                                {screen.rating}
                                              </span>
                                            </div>
                                          </div>

                                          <p className="text-xs text-gray-600 truncate flex items-center gap-1 mb-2">
                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                            {screen.location}
                                          </p>

                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                              <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {(screen.views.daily / 1000).toFixed(0)}K/día
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Monitor className="w-3 h-3" />
                                                {screen.specs.resolution}
                                              </span>
                                            </div>

                                            <div className="text-right">
                                              <div className="font-bold text-sm text-gray-900">
                                                ${Math.round(getScreenMinPrice(screen) / 1000)}K
                                              </div>
                                              <div className="text-xs text-gray-500">COP/hora</div>
                                            </div>
                                          </div>

                                          {/* Badges */}
                                          <div className="flex gap-1 mt-2">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                              {screen.category.name}
                                            </span>
                                            {screen.pricing.allowMoments && (
                                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                Momentos
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {filteredScreens.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                      <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">No hay pantallas en esta área</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mobile overlay (shown on smaller screens) */}
                        <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                          <div className="bg-white rounded-lg shadow-lg p-4 max-h-40 overflow-y-auto">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                            {filteredScreens.length} pantallas en el mapa
                          </h3>
                          <div className="space-y-2">
                              {filteredScreens.slice(0, 3).map((screen) => (
                              <div 
                                key={screen.id}
                                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  onClick={() => setSelectedMapScreen(screen)}
                              >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-[#353FEF] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {screen.name.charAt(0)}
                    </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {screen.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {screen.location}
                                  </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-2">
                                    <div className="font-bold text-sm text-gray-900">
                                      ${Math.round(getScreenMinPrice(screen) / 1000)}K
                                    </div>
                                    <div className="text-xs text-gray-500">COP</div>
                  </div>
                              </div>
                            ))}
                              {filteredScreens.length > 3 && (
                              <p className="text-xs text-gray-500 text-center pt-2 border-t">
                                  +{filteredScreens.length - 3} pantallas más
                              </p>
                            )}
                          </div>
                        </div>
                        </div>

                        {/* Screen Detail Modal */}
                        <AnimatePresence>
                          {selectedMapScreen && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                              onClick={() => setSelectedMapScreen(null)}
                            >
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Header */}
                                <div className="relative">
                                  <img
                                    src={selectedMapScreen.image}
                                    alt={selectedMapScreen.name}
                                    className="w-full h-48 object-cover rounded-t-xl"
                                  />
                                  <button
                                    onClick={() => setSelectedMapScreen(null)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                  >
                                    <X className="w-4 h-4 text-gray-700" />
                                  </button>
                                  <div className="absolute bottom-3 left-3">
                                    <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                                      {selectedMapScreen.category.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                  {/* Title and Rating */}
                                  <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                      {selectedMapScreen.name}
                                    </h3>
                                    <div className="flex items-center gap-1 ml-2">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="font-medium text-gray-700">
                                        {selectedMapScreen.rating}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        ({selectedMapScreen.reviews})
                                      </span>
                                    </div>
                                  </div>

                                  {/* Location */}
                                  <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">
                                      {selectedMapScreen.location}
                                    </span>
                                  </div>

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                          Vistas Diarias
                                        </span>
                                      </div>
                                      <span className="text-lg font-bold text-gray-900">
                                        {(selectedMapScreen.views.daily / 1000).toFixed(0)}K
                                      </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Monitor className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                          Resolución
                                        </span>
                                      </div>
                                      <span className="text-lg font-bold text-gray-900">
                                        {selectedMapScreen.specs.resolution}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Specs */}
                                  <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      Especificaciones
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Dimensiones:</span>
                                        <span className="font-medium">
                                          {selectedMapScreen.specs.width} x {selectedMapScreen.specs.height}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Brillo:</span>
                                        <span className="font-medium">
                                          {selectedMapScreen.specs.brightness}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Ambiente:</span>
                                        <span className="font-medium">
                                          {selectedMapScreen.environment === 'indoor' ? 'Interior' : 'Exterior'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Pricing */}
                                  <div className="mb-6">
                                    <div className="flex items-baseline justify-between mb-3">
                                      <h4 className="font-semibold text-gray-900">Precio</h4>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900">
                                          ${Math.round(getScreenMinPrice(selectedMapScreen) / 1000)}K
                                        </div>
                                        <div className="text-sm text-gray-500">COP / hora</div>
                                      </div>
                                    </div>
                                    
                                    {/* Available packages */}
                                    <div className="space-y-2">
                                      {selectedMapScreen.pricing.allowMoments && (
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="flex items-center gap-1 text-purple-700">
                                            <Sparkles className="w-3 h-3" />
                                            Momentos (15s)
                                          </span>
                                          <span className="font-medium">Desde $9.5K</span>
                                        </div>
                                      )}
                                      {selectedMapScreen.pricing.bundles.hourly?.enabled && (
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="flex items-center gap-1 text-blue-700">
                                            <Clock className="w-3 h-3" />
                                            Por hora
                                          </span>
                                          <span className="font-medium">
                                            ${Math.round(selectedMapScreen.pricing.bundles.hourly.price / 1000)}K
                                          </span>
                                        </div>
                                      )}
                                      {selectedMapScreen.pricing.bundles.daily?.enabled && (
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="flex items-center gap-1 text-green-700">
                                            <Calendar className="w-3 h-3" />
                                            Por día
                                          </span>
                                          <span className="font-medium">
                                            ${Math.round(selectedMapScreen.pricing.bundles.daily.price / 1000)}K
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => {
                                        setSelectedMapScreen(null);
                                        memoizedHandleSelectScreen(selectedMapScreen);
                                      }}
                                      className="flex-1 bg-[#353FEF] hover:bg-[#2A32C5] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      Ver Detalles
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await favoritesService.toggleFavorite(selectedMapScreen.id);
                                          handleFavoriteChange();
                                        } catch (error) {
                                          console.error('Error toggling favorite:', error);
                                        }
                                      }}
                                      className="px-4 py-3 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                      <Heart 
                                        className={`w-4 h-4 transition-colors ${
                                          favoritesService.isFavorite(selectedMapScreen.id) 
                                            ? 'text-red-500 fill-red-500' 
                                            : 'text-gray-600'
                                        }`} 
                                      />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
          </div>
        )}
                  </>
                ) : (
                  <div className="text-center py-10 sm:py-16">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Monitor className="w-8 h-8 text-neutral-400" />
                      </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No se encontraron pantallas</h3>
                    <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                      No hay pantallas disponibles que coincidan con tus filtros actuales. 
                      Intenta ajustar los criterios de búsqueda.
                </p>
                <Button
                      onClick={handleResetFilters}
                      variant="outline"
                      className="mx-auto"
                    >
                      Limpiar filtros
                </Button>
              </div>
                )}
            </div>

              {/* Bottom spacing for mobile navigation */}
              <div className="h-20 sm:h-0"></div>
              </div>
        </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Booking process steps here */}
      </div>
      )}
      
      {/* Smart Search Demo Modal */}
      <SmartSearchDemo 
        isOpen={isSmartSearchDemoOpen} 
        onClose={() => setIsSmartSearchDemoOpen(false)} 
      />
    </div>
    </>
  );
}

// Circuit Card Component
const CircuitCard = ({ circuit, handleSelectScreen, navigate }: { 
  circuit: ScreenWithCircuit[]; 
  handleSelectScreen: (screen: Screen) => void;
  navigate: (path: string) => void;
}) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  useEffect(() => {
    if (circuit.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentScreenIndex(prevIndex => (prevIndex + 1) % circuit.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [circuit.length]);

  const circuitName = circuit[0].circuitName;
  const totalViews = circuit.reduce((sum, screen) => sum + screen.views.daily, 0);
  const averageRating = circuit.reduce((sum, screen) => sum + screen.rating, 0) / circuit.length;
  const totalPrice = circuit.reduce((sum, screen) => sum + screen.price, 0);

  const handleCircuitClick = () => {
    const circuitId = circuit[0]?.circuitId;
    if (circuitId) {
      navigate(`/circuits/${circuitId}`);
    } else {
      // Fallback or error logging
      console.warn('Circuit ID not found, selecting first screen as fallback.');
      handleSelectScreen(circuit[0]);
    }
  };

  const currentScreen = circuit[currentScreenIndex];

  return (
    <div 
      className="cursor-pointer group relative col-span-1 md:col-span-2"
      onClick={handleCircuitClick}
      style={{
        animation: `fadeInUp 0.6s ease-out`
      }}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden border border-indigo-200 hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 h-full transform hover:-translate-y-1 shadow-lg flex flex-col sm:flex-row">
        {/* Image section with carousel */}
        <div className="relative sm:w-1/2 aspect-[4/3] overflow-hidden flex-shrink-0">
          <AnimatePresence>
            <motion.img
              key={currentScreen.id}
              src={currentScreen.image}
              alt={currentScreen.name}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Circuito de Pantallas
            </span>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {circuit.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentScreenIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="font-bold text-gray-900 text-xl leading-tight mb-2">
              {circuitName}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              Un conjunto de {circuit.length} pantallas premium en ubicaciones estratégicas.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="font-semibold">{circuit.length} Pantallas</div>
                  <div className="text-xs text-gray-500">en este circuito</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="font-semibold">{(totalViews / 1000).toFixed(0)}K+</div>
                  <div className="text-xs text-gray-500">vistas diarias</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <div className="font-semibold">{averageRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">rating promedio</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="font-semibold">{[...new Set(circuit.map(s => s.location.split(',').pop()?.trim()))].join(', ')}</div>
                  <div className="text-xs text-gray-500">ciudades</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalPrice / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500">COP / hora (circuito completo)</p>
            </div>
            <button
              className="px-6 py-3 bg-[#353FEF] hover:bg-[#2A32C5] text-white text-base font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Ver Circuito
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bundle interface matching PurchaseOptions
interface Bundle {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  frequency: {
    type: string;
    displayText: string;
    spotsPerHour: number;
    totalSpots: number;
  };
  isHighlighted?: boolean;
}

type AdMode = 'momentos' | 'hourly' | 'daily' | 'weekly' | 'monthly';

// Function to generate bundles (simplified version from ScreenDetail)
const generateBundles = (screen: Screen): Record<AdMode, Bundle[]> => {
  const result: Record<AdMode, Bundle[]> = {
    momentos: [],
    hourly: [],
    daily: [],
    weekly: [],
    monthly: []
  };

  // Helper function to calculate spots
  const calculateSpotCount = (packageType: string) => {
    const spotsPerHour = 4; // Default frequency
    switch (packageType) {
      case 'hourly': return spotsPerHour;
      case 'daily': return spotsPerHour * 16;
      case 'weekly': return spotsPerHour * 16 * 7;
      case 'monthly': return spotsPerHour * 16 * 30;
      default: return spotsPerHour;
    }
  };

  if (screen.pricing.allowMoments) {
    result.momentos = [
      {
        id: 'moment_basic',
        name: 'Momento Básico',
        description: 'Aparece una vez en un momento específico',
        duration: '15 segundos',
        price: 9500,
        frequency: {
          type: '15min',
          displayText: 'Se muestra una vez en momento específico',
          spotsPerHour: 1,
          totalSpots: 1
        },
        isHighlighted: false
      },
      {
        id: 'moment_premium',
        name: 'Momento Premium',
        description: 'Aparece 3 veces en momentos específicos',
        duration: '15 segundos x 3',
        price: 25000,
        frequency: {
          type: '15min',
          displayText: 'Se muestra 3 veces en momentos específicos',
          spotsPerHour: 3,
          totalSpots: 3
        },
        isHighlighted: true
      }
    ];
  }

  if (screen.pricing.bundles.hourly?.enabled) {
    result.hourly = [
      {
        id: 'hourly_standard',
        name: 'Hora Estándar',
        description: 'Tu anuncio durante una hora en rotación',
        duration: '1 hora',
        price: screen.pricing.bundles.hourly.price,
        frequency: {
          type: '15min',
          displayText: 'Se muestra cada 15 minutos',
          spotsPerHour: 4,
          totalSpots: calculateSpotCount('hourly')
        },
        isHighlighted: true
      }
    ];
  }

  if (screen.pricing.bundles.daily?.enabled) {
    result.daily = [
      {
        id: 'daily_standard',
        name: 'Día Completo',
        description: 'Tu anuncio durante todo el día',
        duration: '24 horas',
        price: screen.pricing.bundles.daily.price,
        frequency: {
          type: '15min',
          displayText: 'Se muestra cada 15 minutos',
          spotsPerHour: 4,
          totalSpots: calculateSpotCount('daily')
        },
        isHighlighted: true
      }
    ];
  }

  if (screen.pricing.bundles.weekly?.enabled) {
    result.weekly = [
      {
        id: 'weekly_standard',
        name: 'Semana Estándar',
        description: 'Tu anuncio durante una semana completa',
        duration: '7 días',
        price: screen.pricing.bundles.weekly.price,
        frequency: {
          type: '15min',
          displayText: 'Se muestra cada 15 minutos durante toda la semana',
          spotsPerHour: 4,
          totalSpots: calculateSpotCount('weekly')
        },
        isHighlighted: true
      }
    ];
  }

  if (screen.pricing.bundles.monthly?.enabled) {
    result.monthly = [
      {
        id: 'monthly_standard',
        name: 'Mes Completo',
        description: 'Tu anuncio durante un mes (30 días)',
        duration: '30 días',
        price: screen.pricing.bundles.monthly.price,
        frequency: {
          type: '15min',
          displayText: 'Se muestra cada 15 minutos durante todo el mes',
          spotsPerHour: 4,
          totalSpots: calculateSpotCount('monthly')
        },
        isHighlighted: true
      }
    ];
  }

  return result;
};

// Function to get minimum price from a screen's bundles (with margins applied)
const getScreenMinPrice = (screen: Screen): number => {
  const bundles = generateBundles(screen);
  const partnerId = screen.id.split('-')[0] + '-partner';
  const partnerMargin = getPartnerMargin(partnerId);
  
  let minPrice = Infinity;
  
  Object.values(bundles).forEach(bundleArray => {
    bundleArray.forEach(bundle => {
      const priceWithMargin = Math.round(calculatePriceWithMargin(bundle.price, partnerMargin));
      if (priceWithMargin < minPrice) {
        minPrice = priceWithMargin;
      }
    });
  });
  
  return minPrice === Infinity ? 0 : minPrice;
};

// Price range definitions
const PRICE_RANGES = [
  { id: 'under_50k', label: 'Menos de $50K', min: 0, max: 50000, emoji: '💚' },
  { id: '50k_200k', label: '$50K - $200K', min: 50000, max: 200000, emoji: '💛' },
  { id: '200k_500k', label: '$200K - $500K', min: 200000, max: 500000, emoji: '🧡' },
  { id: '500k_1m', label: '$500K - $1M', min: 500000, max: 1000000, emoji: '❤️' },
  { id: 'over_1m', label: 'Más de $1M', min: 1000000, max: Infinity, emoji: '💜' }
];

// Interface for smart filters
interface SmartFiltersState {
  // Venue filters
  parentCategories: VenueParentCategory[];
  childCategories: VenueChildCategory[];
  environments: EnvironmentType[];
  dwellTimes: DwellTime[];
  
  // Price filters
  priceRanges: string[];
  
  // Additional filters
  allowsMoments: boolean | null;
  rating: number | null;
  // Note: availability filter removed - marketplace only shows available screens by default
}

// Helper function to map screen categories to venue categories
const getScreenVenueMapping = (screen: Screen): {
  parentCategory: VenueParentCategory | null;
  environment: EnvironmentType | null;
  dwellTime: DwellTime | null;
} => {
  const categoryId = screen.category.id;
  const screenEnvironment = screen.environment;

  // Map screen categories to venue parent categories
  let parentCategory: VenueParentCategory | null = null;
  let environment: EnvironmentType | null = null;
  let dwellTime: DwellTime | null = null;

  // Map based on screen category
  switch (categoryId) {
    case 'mall':
      parentCategory = 'retail';
      dwellTime = 'medium'; // Shopping malls typically have medium dwell time
      break;
    case 'airport':
      parentCategory = 'transit';
      dwellTime = 'long'; // Airports have long dwell times
      break;
    case 'stadium':
      parentCategory = 'leisure';
      dwellTime = 'very_long'; // Stadiums have very long dwell times
      break;
    case 'billboard':
      parentCategory = 'outdoor';
      dwellTime = 'very_short'; // Billboards have very short view times
      break;
    case 'transport':
      parentCategory = 'transit';
      dwellTime = 'short'; // Transport hubs have short dwell times
      break;
    default:
      // For other categories, try to infer from location or default
      if (screen.location.toLowerCase().includes('hospital')) {
        parentCategory = 'health_beauty';
        dwellTime = 'long';
      } else if (screen.location.toLowerCase().includes('university') || screen.location.toLowerCase().includes('colegio')) {
        parentCategory = 'education';
        dwellTime = 'medium';
      } else if (screen.location.toLowerCase().includes('banco') || screen.location.toLowerCase().includes('bank')) {
        parentCategory = 'financial';
        dwellTime = 'short';
      } else if (screen.location.toLowerCase().includes('hotel') || screen.location.toLowerCase().includes('restaurant')) {
        parentCategory = 'leisure';
        dwellTime = 'medium';
      } else {
        parentCategory = 'outdoor'; // Default fallback
        dwellTime = 'short';
      }
  }

  // Map screen environment to venue environment
  if (screenEnvironment === 'indoor') {
    environment = 'indoor_controlled';
  } else if (screenEnvironment === 'outdoor') {
    environment = 'outdoor_exposed';
  }

  return { parentCategory, environment, dwellTime };
}

// Ultra-Responsive Unified Filters Component - Mobile-First Design
function UnifiedFilters({ 
  allScreens,
  selectedCities,
  setSelectedCities,
  smartFilters,
  setSmartFilters,
  showFavoritesOnly,
  setShowFavoritesOnly,
  showCircuits,
  setShowCircuits,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  filteredCount
}: {
  allScreens: ScreenWithCircuit[];
  selectedCities: string[];
  setSelectedCities: (cities: string[]) => void;
  smartFilters: SmartFiltersState;
  setSmartFilters: React.Dispatch<React.SetStateAction<SmartFiltersState>>;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  showCircuits: boolean;
  setShowCircuits: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filteredCount: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'location' | 'category' | 'features' | 'price'>('location');
  const [searchQuery, setSearchQuery] = useState('');

  // Get available cities from screens
  const availableCities = useMemo(() => {
    return getAllCities(allScreens);
  }, [allScreens]);

  // Calculate venue category counts using venue-categories.ts
  const venueCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(PARENT_CATEGORY_ICONS).forEach(category => {
      counts[category] = allScreens.filter(screen => {
        const mapping = getScreenVenueMapping(screen);
        return mapping.parentCategory === category;
      }).length;
    });
    return counts;
  }, [allScreens]);

  // Calculate price range counts
  const priceRangeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PRICE_RANGES.forEach(range => {
      counts[range.id] = allScreens.filter(screen => {
        const minPrice = getScreenMinPrice(screen);
        return minPrice >= range.min && minPrice < range.max;
      }).length;
    });
    return counts;
  }, [allScreens]);

  // Get filtered cities based on search
  const filteredCities = useMemo(() => {
    if (!searchQuery) return availableCities;
    return availableCities.filter(city => 
      city.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableCities, searchQuery]);

  // Get parent category options with Spanish labels
  const parentCategoryOptions = useMemo(() => {
    return Object.entries(PARENT_CATEGORY_ICONS).map(([key, Icon]) => {
      const spanishLabels: Record<string, string> = {
        retail: 'Comercial',
        transit: 'Transporte',
        outdoor: 'Exterior',
        health_beauty: 'Salud y Belleza',
        point_of_care: 'Atención Médica',
        education: 'Educación',
        office_buildings: 'Oficinas',
        leisure: 'Entretenimiento',
        government: 'Gobierno',
        financial: 'Financiero',
        residential: 'Residencial'
      };
      
      return {
        id: key as VenueParentCategory,
        label: spanishLabels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
        icon: Icon,
        count: venueCategoryCounts[key] || 0
      };
    });
  }, [venueCategoryCounts]);

  // Environment options
  const environmentOptions = useMemo(() => {
    return Object.entries(ENVIRONMENT_LABELS).map(([key, label]) => ({
      id: key as EnvironmentType,
      label,
      icon: key.includes('outdoor') ? TreePine : Building2,
      count: Math.floor(Math.random() * 30) + 3 // Mock count for now
    }));
  }, []);

  // Dwell time options
  const dwellTimeOptions = useMemo(() => {
    return Object.entries(DWELL_TIME_LABELS).map(([key, label]) => ({
      id: key as DwellTime,
      label,
      icon: Clock,
      count: Math.floor(Math.random() * 25) + 2 // Mock count for now
    }));
  }, []);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return selectedCities.length + 
           smartFilters.parentCategories.length + 
           smartFilters.environments.length + 
           smartFilters.dwellTimes.length + 
           smartFilters.priceRanges.length +
           (smartFilters.allowsMoments !== null ? 1 : 0) +
           (smartFilters.rating !== null ? 1 : 0) +
           (showFavoritesOnly ? 1 : 0) +
           (showCircuits ? 0 : 1); // Count as active filter when circuits are hidden
  }, [selectedCities, smartFilters, showFavoritesOnly, showCircuits]);

  // Toggle functions
  const toggleCity = (cityValue: string) => {
    if (selectedCities.includes(cityValue)) {
      setSelectedCities(selectedCities.filter(city => city !== cityValue));
    } else {
      setSelectedCities([...selectedCities, cityValue]);
    }
  };

  const togglePriceRange = (rangeId: string) => {
    setSmartFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(rangeId)
        ? prev.priceRanges.filter(r => r !== rangeId)
        : [...prev.priceRanges, rangeId]
    }));
  };

  const toggleParentCategory = (category: VenueParentCategory) => {
    setSmartFilters(prev => ({
      ...prev,
      parentCategories: prev.parentCategories.includes(category)
        ? prev.parentCategories.filter(c => c !== category)
        : [...prev.parentCategories, category]
    }));
  };

  const toggleEnvironment = (environment: EnvironmentType) => {
    setSmartFilters(prev => ({
      ...prev,
      environments: prev.environments.includes(environment)
        ? prev.environments.filter(e => e !== environment)
        : [...prev.environments, environment]
    }));
  };

  const toggleDwellTime = (dwellTime: DwellTime) => {
    setSmartFilters(prev => ({
      ...prev,
      dwellTimes: prev.dwellTimes.includes(dwellTime)
        ? prev.dwellTimes.filter(d => d !== dwellTime)
        : [...prev.dwellTimes, dwellTime]
    }));
  };

  const clearAllFilters = () => {
    setSelectedCities([]);
    setSmartFilters({
      parentCategories: [],
      childCategories: [],
      environments: [],
      dwellTimes: [],
      priceRanges: [],
      allowsMoments: null,
      rating: null,
    });
    setShowFavoritesOnly(false);
    setShowCircuits(true);
  };

  // Render active filters as chips
  const renderActiveFilters = () => {
    const allActiveFilters = [
      ...selectedCities.map(cityValue => {
        const city = availableCities.find(c => c.value === cityValue);
        return { type: 'city', value: cityValue, label: city?.label || cityValue, emoji: '📍' };
      }),
      ...smartFilters.priceRanges.map(priceId => {
        const range = PRICE_RANGES.find(r => r.id === priceId);
        return { type: 'price', value: priceId, label: range?.label || priceId, emoji: range?.emoji || '💰' };
      }),
      ...smartFilters.parentCategories.map(cat => ({ 
        type: 'category', 
        value: cat, 
        label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
        emoji: '🏢'
      })),
      ...smartFilters.environments.map(env => ({ 
        type: 'environment', 
        value: env, 
        label: ENVIRONMENT_LABELS[env],
        emoji: env.includes('outdoor') ? '🌤️' : '🏠'
      })),
      ...smartFilters.dwellTimes.map(dwell => ({ 
        type: 'dwell', 
        value: dwell, 
        label: DWELL_TIME_LABELS[dwell],
        emoji: '⏱️'
      }))
    ];

    if (smartFilters.allowsMoments) {
      allActiveFilters.push({ type: 'moments', value: 'true', label: 'Permite Momentos', emoji: '⚡' });
    }

    if (smartFilters.rating && smartFilters.rating > 0) {
      allActiveFilters.push({ type: 'rating', value: smartFilters.rating.toString(), label: `${smartFilters.rating}+ estrellas`, emoji: '⭐' });
    }

    if (showFavoritesOnly) {
      allActiveFilters.push({ type: 'favorites', value: 'true', label: 'Solo Favoritos', emoji: '❤️' });
    }

    if (!showCircuits) {
      allActiveFilters.push({ type: 'circuits', value: 'false', label: 'Sin Circuitos', emoji: '🚫' });
    }

    if (allActiveFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {allActiveFilters.map((filter, index) => (
          <motion.span
            key={`${filter.type}-${filter.value}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#353FEF] text-white text-sm rounded-full"
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
            <button
              onClick={() => {
                if (filter.type === 'city') {
                  toggleCity(filter.value);
                } else if (filter.type === 'price') {
                  togglePriceRange(filter.value);
                } else if (filter.type === 'category') {
                  toggleParentCategory(filter.value as VenueParentCategory);
                } else if (filter.type === 'environment') {
                  toggleEnvironment(filter.value as EnvironmentType);
                } else if (filter.type === 'dwell') {
                  toggleDwellTime(filter.value as DwellTime);
                } else if (filter.type === 'moments') {
                  setSmartFilters(prev => ({ ...prev, allowsMoments: null }));
                } else if (filter.type === 'rating') {
                  setSmartFilters(prev => ({ ...prev, rating: null }));
                } else if (filter.type === 'favorites') {
                  setShowFavoritesOnly(false);
                } else if (filter.type === 'circuits') {
                  setShowCircuits(true);
                }
              }}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-6">
      {/* Mobile-First Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Results count and view mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900 text-lg sm:text-xl">
              {filteredCount} {filteredCount === 1 ? 'pantalla' : 'pantallas'}
            </h2>
            
            {/* Quick Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-2 rounded-lg transition-colors ${
                  showFavoritesOnly 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-red-500' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowCircuits(!showCircuits)}
                className={`p-2 rounded-lg transition-colors ${
                  showCircuits 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all ${
                viewMode === 'card' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
              }`}
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all ${
                viewMode === 'compact' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
              }`}
              onClick={() => setViewMode('compact')}
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all ${
                viewMode === 'map' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'
              }`}
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Mapa</span>
            </button>
          </div>
        </div>

        {/* Filters Toggle Button */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF]"
          >
            <option value="relevance">Relevancia</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="rating">Mejor Valorados</option>
          </select>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isExpanded || activeFiltersCount > 0
                ? 'bg-[#353FEF] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Limpiar todos
            </button>
          </div>
          {renderActiveFilters()}
        </div>
      )}

      {/* Expandable Filters Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {[
                    { id: 'location', label: 'Ubicación', icon: MapPin },
                    { id: 'category', label: 'Categoría', icon: Building2 },
                    { id: 'features', label: 'Características', icon: Star },
                    { id: 'price', label: 'Precio', icon: DollarSign }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-[#353FEF] border-b-2 border-[#353FEF]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Location Tab */}
                    {activeTab === 'location' && (
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar ciudades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#353FEF]/20 focus:border-[#353FEF] transition-colors text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {filteredCities.map((city) => {
                            const isSelected = selectedCities.includes(city.value);
                            return (
                              <button
                                key={city.value}
                                onClick={() => toggleCity(city.value)}
                                className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all text-left ${
                                  isSelected
                                    ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : 'text-gray-400'}`} />
                                  <div>
                                    <div className="font-medium">{city.label}</div>
                                    <div className="text-xs text-gray-500">{city.count} pantallas</div>
                                  </div>
                                </div>
                                {isSelected && <CheckCircle className="w-4 h-4 text-[#353FEF]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category Tab */}
                    {activeTab === 'category' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {parentCategoryOptions.map(option => {
                            const isSelected = smartFilters.parentCategories.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                onClick={() => toggleParentCategory(option.id)}
                                disabled={option.count === 0}
                                className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all text-left ${
                                  isSelected
                                    ? 'border-[#353FEF] bg-[#353FEF]/5 text-[#353FEF]'
                                    : option.count === 0
                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <option.icon className={`w-4 h-4 ${isSelected ? 'text-[#353FEF]' : option.count === 0 ? 'text-gray-400' : 'text-gray-500'}`} />
                                  <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-gray-500">{option.count} pantallas</div>
                                  </div>
                                </div>
                                {isSelected && <CheckCircle className="w-4 h-4 text-[#353FEF]" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Ambiente</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {environmentOptions.map(option => {
                              const isSelected = smartFilters.environments.includes(option.id);
                              return (
                                <button
                                  key={option.id}
                                  onClick={() => toggleEnvironment(option.id)}
                                  className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all text-left ${
                                    isSelected
                                      ? 'border-green-500 bg-green-50 text-green-700'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <option.icon className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                                    <div>
                                      <div className="font-medium">{option.label}</div>
                                      <div className="text-xs text-gray-500">{option.count} pantallas</div>
                                    </div>
                                  </div>
                                  {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Tiempo de Permanencia</h4>
                          <div className="flex flex-wrap gap-2">
                            {dwellTimeOptions.map(option => {
                              const isSelected = smartFilters.dwellTimes.includes(option.id);
                              return (
                                <button
                                  key={option.id}
                                  onClick={() => toggleDwellTime(option.id)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                    isSelected
                                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>{option.label}</span>
                                  <span className="text-xs opacity-70">({option.count})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Características Especiales</h4>
                          <div className="space-y-3">
                            <button
                              onClick={() => setSmartFilters(prev => ({ 
                                ...prev, 
                                allowsMoments: prev.allowsMoments ? null : true 
                              }))}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                                smartFilters.allowsMoments
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className={`w-4 h-4 ${smartFilters.allowsMoments ? 'text-purple-600' : 'text-gray-500'}`} />
                                <span className="font-medium">Permite Momentos (15s)</span>
                              </div>
                              {smartFilters.allowsMoments && <CheckCircle className="w-4 h-4 text-purple-600" />}
                            </button>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Rating mínimo:</span>
                                <div className="flex gap-1">
                                  {[4, 4.5, 5].map(rating => (
                                    <button
                                      key={rating}
                                      onClick={() => setSmartFilters(prev => ({ 
                                        ...prev, 
                                        rating: prev.rating === rating ? null : rating 
                                      }))}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                                        smartFilters.rating === rating
                                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      <Star className="w-3 h-3 fill-current" />
                                      {rating}+
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Tab */}
                    {activeTab === 'price' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {PRICE_RANGES.map(range => {
                            const isSelected = smartFilters.priceRanges.includes(range.id);
                            const count = priceRangeCounts[range.id] || 0;
                            return (
                              <button
                                key={range.id}
                                onClick={() => togglePriceRange(range.id)}
                                disabled={count === 0}
                                className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all text-left ${
                                  isSelected
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : count === 0
                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{range.emoji}</span>
                                  <div>
                                    <div className="font-medium">{range.label}</div>
                                    <div className="text-xs text-gray-500">{count} pantallas</div>
                                  </div>
                                </div>
                                {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}