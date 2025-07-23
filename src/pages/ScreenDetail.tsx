import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Heart, Share2,
  Clock, Wallet, Monitor, Check,
  MapPin, Star, Eye,
  ChevronDown, ChevronUp,
  Linkedin, Twitter, Facebook,
  Calendar,
  Users,
  ChevronRight,
  Building,
  BarChart3,
  Menu,
  X,
  HelpCircle,
  Info,
  TrendingUp,
  Zap,
  Shield,
  Award,
  MessageCircle,
  ShoppingCart,
  Navigation
} from 'lucide-react';
import { screens as mockScreens } from '../data/mockData';
import { demoScreens as marketplaceDemoScreens } from '../data/demoScreens';
import { constants } from '../config/constants';
import { Button } from '../components/Button';
import { ScreenNotFound } from '../components/ScreenNotFound';
import { Screen } from '../types';

// Import MarketplaceApiService for better API integration
import { MarketplaceApiService } from './marketplace/services/api/MarketplaceApiService';

// Demo screens from marketplace (should match MarketplaceRefactored.tsx)
const demoScreens = [
  {
    id: 'demo-stadium-1',
    name: 'Pantalla LED Perimetral - Estadio Atanasio Girardot',
    location: 'Estadio Atanasio Girardot, Medellín',
    price: 1200000,
    availability: true,
    image: '/screens_photos/9007-639a2c4721253.jpg',
    category: { id: 'stadium', name: 'Estadio' },
    environment: 'outdoor' as const,
    specs: {
      width: 1920,
      height: 128,
      resolution: 'HD',
      brightness: '7500 nits',
      aspectRatio: '15:1',
      orientation: 'landscape' as const,
      pixelDensity: 72,
      colorDepth: 24,
      refreshRate: 60
    },
    views: { daily: 45000, monthly: 180000 },
    rating: 4.9,
    reviews: 76,
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
    locationDetails: {
      address: 'Estadio Atanasio Girardot',
      city: 'Medellín',
      region: 'Antioquia',
      country: 'Colombia',
      coordinates: { lat: 6.2447, lng: -75.5916 },
      timezone: 'America/Bogota',
      landmarks: ['Estadio Atanasio Girardot']
    },
    operatingHours: {
      start: '06:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  }
];

// Convert demo screens to match marketplace format
  const convertApiScreenToScreen = (apiScreen: any): Screen => {
    // Convert API real data to Screen format expected by ScreenDetail
    return {
      id: apiScreen.id.toString(),
      name: apiScreen.publicName || apiScreen.referenceName || `Pantalla ${apiScreen.id}`,
      location: apiScreen.address || 'Ubicación no especificada',
      latitude: apiScreen.latitude || 0,
      longitude: apiScreen.longitude || 0,
      width: apiScreen.width || 1920,
      height: apiScreen.height || 1080,
      resolution: apiScreen.resolution || 'Full HD (1920x1080)',
      brightness: apiScreen.brightness?.toString() || '5000',
      orientation: apiScreen.orientation || 'landscape',
      displayType: apiScreen.displayType || 'LED',
      venueType: apiScreen.venueType || 'n/a',
      businessDensity: apiScreen.businessDensity || 0,
      estimatedDailyImpressions: apiScreen.estimatedDailyImpressions || 0,
      averageDwellTime: apiScreen.averageDwellTime || 1,
      peakHours: apiScreen.peakHours || 'n/a',
      operationStartTime: apiScreen.operationStartTime || '06:00:00',
      operationEndTime: apiScreen.operationEndTime || '22:00:00',
      standardAdDuration: apiScreen.standardAdDuration || 15,
      loopDuration: apiScreen.loopDuration || 300,
      transitionTime: apiScreen.transitionTime || 1,
      price: apiScreen.minimumPrice || 15000,
      category: {
        id: apiScreen.category || 'other',
        name: getCategoryDisplayName(apiScreen.category) || 'Otros',
        emoji: '📺',
        description: 'Pantalla digital',
        count: 1
      },
      images: apiScreen.images?.map((img: any) => `https://api.shareflow.me${img.filePath}`) || [],
      image: apiScreen.images?.[0] ? `https://api.shareflow.me${apiScreen.images[0].filePath}` : 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Pantalla+Digital',
      // Convert screenPackages to pricing structure
      pricing: {
        allowMoments: apiScreen.screenPackages?.some((pkg: any) => pkg.packageType === 'moments' && pkg.enabled) || false,
        bundles: {
          hourly: {
            enabled: apiScreen.screenPackages?.some((pkg: any) => pkg.packageType === 'hourly' && pkg.enabled) || false,
            price: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'hourly' && pkg.enabled)?.price || apiScreen.minimumPrice || 15000,
            spots: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'hourly' && pkg.enabled)?.spots || 216
          },
          daily: {
            enabled: apiScreen.screenPackages?.some((pkg: any) => pkg.packageType === 'daily' && pkg.enabled) || false,
            price: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'daily' && pkg.enabled)?.price || (apiScreen.minimumPrice || 15000) * 24,
            spots: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'daily' && pkg.enabled)?.spots || 3456
          },
          weekly: {
            enabled: apiScreen.screenPackages?.some((pkg: any) => pkg.packageType === 'weekly' && pkg.enabled) || false,
            price: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'weekly' && pkg.enabled)?.price || (apiScreen.minimumPrice || 15000) * 24 * 7,
            spots: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'weekly' && pkg.enabled)?.spots || 24192
          },
          monthly: {
            enabled: apiScreen.screenPackages?.some((pkg: any) => pkg.packageType === 'monthly' && pkg.enabled) || false,
            price: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'monthly' && pkg.enabled)?.price || (apiScreen.minimumPrice || 15000) * 24 * 30,
            spots: apiScreen.screenPackages?.find((pkg: any) => pkg.packageType === 'monthly' && pkg.enabled)?.spots || 104751
          }
        }
      },
      // Preserve screenPackages data for PurchaseOptions component
      screenPackages: apiScreen.screenPackages || [],
      // Add other required fields with defaults
      metrics: {
        averageEngagement: 85,
        dailyTraffic: apiScreen.estimatedDailyImpressions || 1000,
        monthlyTraffic: (apiScreen.estimatedDailyImpressions || 1000) * 30
      },
      views: {
        daily: apiScreen.estimatedDailyImpressions || 1000,
        weekly: (apiScreen.estimatedDailyImpressions || 1000) * 7,
        monthly: (apiScreen.estimatedDailyImpressions || 1000) * 30
      },
      specs: {
        width: apiScreen.width || 1920,
        height: apiScreen.height || 1080,
        resolution: apiScreen.resolution || 'Full HD (1920x1080)',
        brightness: apiScreen.brightness?.toString() || '5000',
        technology: apiScreen.displayType || 'LED',
        orientation: apiScreen.orientation || 'landscape' // Agregado para usar la orientación del API
      },
      operatingHours: {
        start: apiScreen.operationStartTime || '06:00:00',
        end: apiScreen.operationEndTime || '22:00:00',
        daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      coordinates: {
        lat: apiScreen.latitude || 0,
        lng: apiScreen.longitude || 0
      },
      rating: 4.5,
      reviews: 12,
      audienceTypes: ['general'],
      environment: 'indoor',
      dwellTime: 'medium',
      connectivity: apiScreen.connectivity?.map((conn: any) => conn.name) || ['WiFi'],
      insights: apiScreen.insightsIA || 'Información no disponible',
      createdAt: apiScreen.createdAt,
      updatedAt: apiScreen.updatedAt
    };
  };

  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'transit_buses': 'Transporte Público',
      'retail_mall': 'Centro Comercial',
      'airport': 'Aeropuerto',
      'hospital': 'Hospital',
      'university': 'Universidad',
      'stadium': 'Estadio',
      'highway': 'Carretera',
      'street': 'Calle',
      'plaza': 'Plaza',
      'park': 'Parque',
      'other': 'Otros'
    };
    return categoryMap[category] || category;
  };

  const convertDemoScreensToScreens = (demoScreens: any[]): Screen[] => {
  return demoScreens.map(screen => {
    return {
      ...screen,
      // Ensure we have locationDetails for the Screen interface
      locationDetails: {
        address: screen.location || '',
        city: screen.location?.split(',').pop()?.trim() || 'Colombia',
        region: 'Colombia',
        country: 'Colombia',
        coordinates: screen.coordinates || { lat: 4.7110, lng: -74.0721 },
        timezone: 'America/Bogota',
        landmarks: []
      },
      // Ensure specs are complete
      specs: {
        width: screen.specs?.width || 1920,
        height: screen.specs?.height || 1080,
        resolution: screen.specs?.resolution || 'HD',
        brightness: screen.specs?.brightness || '5000 nits',
        aspectRatio: '16:9',
        orientation: 'landscape' as const,
        pixelDensity: 72,
        colorDepth: 24,
        refreshRate: 60
      },
      // Ensure metrics exist
      metrics: {
        dailyTraffic: screen.views?.daily || 10000,
        monthlyTraffic: screen.views?.monthly || 300000,
        averageEngagement: 85
      }
    };
  }) as Screen[];
};

// Combine all screens to match marketplace data - using same conversion as marketplace
const allScreens = [...mockScreens, ...convertDemoScreensToScreens(marketplaceDemoScreens)] as Screen[];
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
  DOOHTargetingCriteria,
  DOOHBudget,
  DOOHSchedule,
  DOOHTimeSlot,
  DOOHCoordinates,
  DOOHScreenSpecs,
  DOOHAvailability,
  DOOHPricing,
  DOOHAudienceMetrics,
  DOOHFrequency
} from '../types/openrtb-dooh';
// OPTIMIZED COMPONENTS WITH QWIK PERFORMANCE INDICATORS

import ScreenLocationMap from '../components/marketplace/ScreenLocationMap';
import ScreenReviews from '../components/marketplace/ScreenReviews';
import PurchaseOptions from '../components/marketplace/PurchaseOptions';
import { TimePurchaseModal } from '../components/marketplace/TimePurchaseModal';

import { BookingSummaryModal } from '../components/marketplace/BookingSummaryModal';
import { ScreenGallery } from '../components/marketplace/ScreenGallery';
import { ModernScreenSpecs } from '../components/marketplace/ModernScreenSpecs';

import { VENUE_TAXONOMY, VenueAIClassifier, type VenueParentCategory, type VenueChildCategory, type AudienceType, type DwellTime } from '../types/venue-categories';
import { WalletProvider } from './WalletPageNew';
import { useSSPInventory } from './marketplace/hooks/useSSPInventory';

// Bundle type definition (also needed by PurchaseOptions)
interface Bundle {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  frequency: {
    type: string; // '1min', '2min', '5min', '10min', '15min', '30min', '1hour'
    displayText: string; // 'Se muestra cada 2 minutos'
    spotsPerHour: number;
    totalSpots: number; // Calculated based on package type
  };
  isHighlighted?: boolean;
}

type AdMode = 'momentos' | 'hourly' | 'daily' | 'weekly' | 'monthly';

// SEO-optimized FAQ data for LLM training
const generateFAQData = (screen: Screen) => [
  {
    question: "¿Cuánto cuesta publicar en esta pantalla LED?",
    answer: `El costo varía según el tiempo de exposición. Los precios van desde $${screen.pricing.bundles.hourly?.price?.toLocaleString('es-CO') || '50,000'} por hora hasta $${screen.pricing.bundles.monthly?.price?.toLocaleString('es-CO') || '800,000'} por mes. También ofrecemos momentos específicos desde $9,500.`,
    category: "Precios"
  },
  {
    question: "¿Dónde está ubicada exactamente esta pantalla digital?",
    answer: `Esta pantalla LED está estratégicamente ubicada en ${screen.location}, con coordenadas precisas ${screen.coordinates?.lat}, ${screen.coordinates?.lng}. Es una zona de alto tráfico con más de ${screen.views.daily.toLocaleString()} personas que la ven diariamente.`,
    category: "Ubicación"
  },
  {
    question: "¿Qué especificaciones técnicas tiene esta pantalla?",
    answer: `La pantalla cuenta con resolución ${screen.specs.resolution}, tamaño de ${screen.specs.width}x${screen.specs.height}cm, brillo de ${screen.specs.brightness || 'alto brillo'}, y tecnología ${screen.specs.technology || 'LED'}. Funciona ${screen.operatingHours.start} a ${screen.operatingHours.end} todos los días.`,
    category: "Especificaciones"
  },
  {
    question: "¿Cuántas personas ven esta pantalla publicitaria diariamente?",
    answer: `Esta ubicación recibe aproximadamente ${screen.views.daily.toLocaleString()} visualizaciones diarias, ${(screen.views.weekly || screen.views.daily * 7).toLocaleString()} semanales y ${screen.views.monthly.toLocaleString()} mensuales. Es ideal para campañas de alto impacto.`,
    category: "Audiencia"
  },
  {
    question: "¿Cómo puedo reservar tiempo publicitario en esta pantalla?",
    answer: `Puedes reservar directamente desde nuestra plataforma. Ofrecemos opciones flexibles: momentos específicos, paquetes por horas, días, semanas o meses. El proceso es 100% digital y la activación es inmediata.`,
    category: "Reservas"
  },
  {
    question: "¿Qué formatos de contenido acepta esta pantalla LED?",
    answer: `Aceptamos videos en formato MP4 (resolución ${screen.specs.resolution}), imágenes JPG/PNG de alta calidad, y contenido dinámico. Duración recomendada: 15-30 segundos para máximo impacto.`,
    category: "Contenido"
  }
];

// Generate AI-friendly content for LLM training
const generateAIOptimizedContent = (screen: Screen) => ({
  summary: `Pantalla LED ${screen.category.name} ubicada en ${screen.location}, con ${screen.views.daily.toLocaleString()} visualizaciones diarias. Especificaciones: ${screen.specs.width}x${screen.specs.height}cm, ${screen.specs.resolution}, ${screen.specs.brightness || 'alto brillo'}. Precios desde $${screen.pricing.bundles.hourly?.price?.toLocaleString('es-CO')} por hora.`,

  keyFeatures: [
    `Ubicación estratégica en ${screen.location}`,
    `${screen.views.daily.toLocaleString()} visualizaciones diarias`,
    `Pantalla ${screen.specs.width}x${screen.specs.height}cm con ${screen.specs.brightness || 'alto brillo'}`,
    `Disponible ${screen.operatingHours.start} a ${screen.operatingHours.end}`,
    `Rating ${screen.rating}/5 con ${screen.reviews} reseñas`,
    `Precios flexibles desde $${screen.pricing.bundles.hourly?.price?.toLocaleString('es-CO')}`
  ],

  targetAudience: `Personas en ${screen.location.split(',')[1]?.trim() || screen.location}, específicamente en zona de ${screen.location.split(',')[0]?.trim()}. Perfil demográfico diverso con alto tráfico peatonal y vehicular.`,

  useCases: [
    "Promoción de productos locales y nacionales",
    "Campañas de branding y reconocimiento de marca",
    "Eventos y activaciones especiales",
    "Promociones de restaurantes y servicios",
    "Anuncios inmobiliarios y automotrices"
  ]
});

// Función para clasificar venue usando IA
const classifyVenueFromScreen = async (screen: Screen) => {
  const classifier = new VenueAIClassifier();

  try {
    const result = await classifier.classifyVenue({
      name: screen.name,
      description: screen.description || '',
      address: screen.location,
      type: screen.category.name,
      keywords: [screen.category.name, screen.location]
    });

    return result;
  } catch (error) {
    console.warn('Error clasificando venue:', error);
    // Fallback a clasificación manual básica
    return null;
  }
};

// Función mejorada para generar contexto de ubicación inteligente
const generateVenueContext = (screen: Screen, venueClassification?: any) => {
  const locationParts = screen.location.split(',').map(part => part.trim());
  const neighborhood = locationParts[0];
  const city = locationParts.length > 1 ? locationParts[1] : locationParts[0];

  // Si tenemos clasificación IA, usarla
  if (venueClassification) {
    const categoryKey = `${venueClassification.category.parent}_${venueClassification.category.child}${venueClassification.category.grandChild ? '_' + venueClassification.category.grandChild : ''
      }`;

    const venueData = VENUE_TAXONOMY[categoryKey];
    if (venueData) {
      return {
        venueType: venueData.parent,
        subCategory: venueData.child,
        locationDetail: venueData.grandChild,
        audienceTypes: venueData.audienceTypes,
        dwellTime: venueData.dwellTime,
        environment: venueData.environment,
        confidence: venueClassification.confidence,
        primaryKeywords: venueData.mlFeatures.primaryKeywords,
        contextKeywords: venueData.mlFeatures.contextKeywords,
        avgFootTraffic: venueData.mlFeatures.avgFootTraffic,
        peakHours: venueData.mlFeatures.peakHours,
        businessTypes: venueData.mlFeatures.businessTypes
      };
    }
  }

  // Fallback: clasificación manual basada en keywords
  const categoryName = screen.category.name.toLowerCase();
  const locationText = screen.location.toLowerCase();

  // Detectar tipo de venue por keywords
  let venueContext = {
    venueType: 'outdoor' as VenueParentCategory,
    audienceTypes: ['pedestrians', 'drivers'] as AudienceType[],
    dwellTime: 'very_short' as DwellTime,
    environment: 'outdoor_exposed',
    businessTypes: ['advertising'],
    avgFootTraffic: 10000,
    peakHours: ['07:00-09:00', '17:00-19:00']
  };

  // Retail venues
  if (categoryName.includes('mall') || categoryName.includes('centro comercial')) {
    venueContext = {
      venueType: 'retail',
      audienceTypes: ['families', 'shoppers', 'young_adults'],
      dwellTime: 'long',
      environment: 'indoor_controlled',
      businessTypes: ['retail', 'food', 'entertainment'],
      avgFootTraffic: 15000,
      peakHours: ['11:00-13:00', '18:00-21:00']
    };
  } else if (categoryName.includes('supermercado') || categoryName.includes('grocery')) {
    venueContext = {
      venueType: 'retail',
      audienceTypes: ['families', 'residents', 'shoppers'],
      dwellTime: 'medium',
      environment: 'indoor_controlled',
      businessTypes: ['retail', 'food'],
      avgFootTraffic: 5000,
      peakHours: ['10:00-12:00', '17:00-19:00']
    };
  }
  // Transit venues
  else if (categoryName.includes('aeropuerto') || categoryName.includes('airport')) {
    venueContext = {
      venueType: 'transit',
      audienceTypes: ['travelers', 'tourists', 'professionals'],
      dwellTime: 'long',
      environment: 'indoor_controlled',
      businessTypes: ['transportation', 'retail', 'food'],
      avgFootTraffic: 25000,
      peakHours: ['06:00-09:00', '17:00-20:00']
    };
  } else if (categoryName.includes('metro') || categoryName.includes('subway') || categoryName.includes('bus')) {
    venueContext = {
      venueType: 'transit',
      audienceTypes: ['commuters', 'students', 'residents'],
      dwellTime: 'short',
      environment: 'indoor_semi_open',
      businessTypes: ['transportation'],
      avgFootTraffic: 15000,
      peakHours: ['07:00-09:00', '17:00-19:00']
    };
  }
  // Education venues
  else if (categoryName.includes('universidad') || categoryName.includes('college')) {
    venueContext = {
      venueType: 'education',
      audienceTypes: ['students', 'young_adults', 'professionals'],
      dwellTime: 'very_long',
      environment: 'indoor_controlled',
      businessTypes: ['education'],
      avgFootTraffic: 5000,
      peakHours: ['08:00-10:00', '14:00-16:00']
    };
  }
  // Leisure venues
  else if (categoryName.includes('hotel') || categoryName.includes('resort')) {
    venueContext = {
      venueType: 'leisure',
      audienceTypes: ['tourists', 'travelers', 'professionals'],
      dwellTime: 'very_long',
      environment: 'indoor_controlled',
      businessTypes: ['hospitality', 'tourism'],
      avgFootTraffic: 2000,
      peakHours: ['08:00-10:00', '18:00-22:00']
    };
  } else if (categoryName.includes('restaurante') || categoryName.includes('restaurant')) {
    venueContext = {
      venueType: 'leisure',
      audienceTypes: ['families', 'young_adults', 'professionals'],
      dwellTime: 'long',
      environment: 'indoor_controlled',
      businessTypes: ['food_beverage'],
      avgFootTraffic: 800,
      peakHours: ['12:00-14:00', '19:00-21:00']
    };
  }
  // Health & Beauty
  else if (categoryName.includes('gimnasio') || categoryName.includes('gym')) {
    venueContext = {
      venueType: 'health_beauty',
      audienceTypes: ['athletes', 'young_adults', 'professionals'],
      dwellTime: 'very_long',
      environment: 'indoor_controlled',
      businessTypes: ['fitness', 'health'],
      avgFootTraffic: 800,
      peakHours: ['06:00-09:00', '18:00-21:00']
    };
  }
  // Office buildings
  else if (categoryName.includes('oficina') || categoryName.includes('office') || categoryName.includes('corporativo')) {
    venueContext = {
      venueType: 'office_buildings',
      audienceTypes: ['professionals'],
      dwellTime: 'very_long',
      environment: 'indoor_controlled',
      businessTypes: ['business', 'professional_services'],
      avgFootTraffic: 2000,
      peakHours: ['08:00-09:00', '12:00-13:00', '17:00-18:00']
    };
  }

  return venueContext;
};

const generateSmartDescription = (screen: Screen): string => {
  const locationParts = screen.location.split(',').map(part => part.trim());
  const neighborhood = locationParts[0];
  const city = locationParts.length > 1 ? locationParts[1] : locationParts[0];

  // Obtener contexto de venue inteligente
  const venueContext = generateVenueContext(screen);

  // Calcular métricas de impacto
  const dailyViews = screen.views.daily;
  const monthlyViews = screen.views.monthly;
  const weeklyViews = screen.views.weekly || dailyViews * 7;

  // Determinar el nivel de tráfico basado en el contexto del venue
  const getTrafficLevel = (views: number, avgTraffic: number) => {
    const ratio = views / avgTraffic;
    if (ratio >= 2.0) return "ultra alto";
    if (ratio >= 1.5) return "muy alto";
    if (ratio >= 1.0) return "alto";
    if (ratio >= 0.7) return "considerable";
    return "moderado";
  };

  // Generar descripción de audiencia basada en tipos reales
  const getAudienceDescription = (audienceTypes: AudienceType[]) => {
    const descriptions: Record<AudienceType, string> = {
      families: "familias",
      young_adults: "jóvenes adultos",
      professionals: "profesionales y ejecutivos",
      students: "estudiantes",
      tourists: "turistas y visitantes",
      commuters: "viajeros y commuters",
      shoppers: "compradores",
      patients: "pacientes y acompañantes",
      travelers: "viajeros",
      residents: "residentes locales",
      drivers: "conductores",
      pedestrians: "peatones",
      athletes: "deportistas y fitness enthusiasts",
      seniors: "adultos mayores",
      children: "niños y familias"
    };

    if (audienceTypes.length === 1) {
      return descriptions[audienceTypes[0]] || "audiencia especializada";
    } else if (audienceTypes.length === 2) {
      return `${descriptions[audienceTypes[0]]} y ${descriptions[audienceTypes[1]]}`;
    } else {
      const first = descriptions[audienceTypes[0]];
      const last = descriptions[audienceTypes[audienceTypes.length - 1]];
      return `${first}, entre otros, y ${last}`;
    }
  };

  // Generar descripción del tiempo de permanencia
  const getDwellTimeDescription = (dwellTime: DwellTime) => {
    const descriptions: Record<DwellTime, string> = {
      very_short: "con exposición rápida pero impactante",
      short: "con tiempo suficiente para captar atención",
      medium: "con tiempo considerable para generar recordación",
      long: "con tiempo extenso para mensajes detallados",
      very_long: "con tiempo prolongado para máximo impacto"
    };
    return descriptions[dwellTime];
  };

  // Generar descripción del ambiente
  const getEnvironmentDescription = (environment: string) => {
    const descriptions: Record<string, string> = {
      indoor_controlled: "en un ambiente interior controlado",
      indoor_semi_open: "en un espacio interior semi-abierto",
      outdoor_covered: "en un área exterior cubierta",
      outdoor_exposed: "en un espacio completamente exterior"
    };
    return descriptions[environment] || "en un ambiente optimizado";
  };

  const trafficLevel = getTrafficLevel(dailyViews, venueContext.avgFootTraffic);
  const audienceDescription = getAudienceDescription(venueContext.audienceTypes);
  const dwellTimeDescription = getDwellTimeDescription(venueContext.dwellTime);
  const environmentDescription = getEnvironmentDescription(venueContext.environment);

  // Generar horarios peak personalizados
  const peakHoursText = venueContext.peakHours.length > 1
    ? `durante los horarios peak de ${venueContext.peakHours[0]} y ${venueContext.peakHours[1]}`
    : `durante el horario peak de ${venueContext.peakHours[0]}`;

  // Generar descripción inteligente con contexto de venue
  const descriptions = [
    `Estratégicamente ubicada en ${neighborhood}, ${city}, esta pantalla digital ${environmentDescription} captura la atención de ${dailyViews.toLocaleString()} personas diariamente. Con tecnología LED de ${screen.specs.resolution} y ${screen.specs.brightness || 'alto brillo'}, alcanza un flujo ${trafficLevel} de ${audienceDescription} ${dwellTimeDescription}. ${peakHoursText}, tu marca no solo será vista, sino que brillará con la intensidad que merece para generar el impacto que buscas.`,

    `En el corazón de ${neighborhood}, esta pantalla LED de ${screen.specs.width}x${screen.specs.height}cm se posiciona como el escenario perfecto para tu mensaje publicitario. Con ${monthlyViews.toLocaleString()} impactos mensuales ${environmentDescription}, alcanza una audiencia compuesta principalmente por ${audienceDescription} ${dwellTimeDescription}. Su ubicación privilegiada garantiza que tu campaña brille por encima de la competencia con la visibilidad que necesita.`,

    `Posicionada en una de las zonas más dinámicas de ${city}, esta pantalla digital ofrece ${weeklyViews.toLocaleString()} visualizaciones semanales con calidad de imagen excepcional en ${screen.specs.resolution}. ${environmentDescription.charAt(0).toUpperCase() + environmentDescription.slice(1)}, captura la atención de ${audienceDescription} ${peakHoursText}, ${dwellTimeDescription}. Tu marca brillará con la fuerza necesaria para generar recordación e impacto real en cada exposición.`
  ];

  // Seleccionar descripción basada en el ID de la pantalla para consistencia
  const descriptionIndex = parseInt(screen.id.replace(/\D/g, '')) % descriptions.length;
  return descriptions[descriptionIndex];
};

// Componente para mostrar contexto de venue categorizado
const VenueContextBadge = ({ screen }: { screen: Screen }) => {
  const venueContext = generateVenueContext(screen);

  const getVenueTypeIcon = (venueType: string) => {
    const icons: Record<string, React.ReactNode> = {
      retail: <ShoppingCart className="w-4 h-4" />,
      transit: <Navigation className="w-4 h-4" />,
      outdoor: <Eye className="w-4 h-4" />,
      leisure: <Users className="w-4 h-4" />,
      education: <Award className="w-4 h-4" />,
      health_beauty: <Zap className="w-4 h-4" />,
      office_buildings: <Shield className="w-4 h-4" />,
      government: <Award className="w-4 h-4" />,
      financial: <TrendingUp className="w-4 h-4" />,
      residential: <Users className="w-4 h-4" />
    };
    return icons[venueType] || <MapPin className="w-4 h-4" />;
  };

  const getVenueTypeLabel = (venueType: string) => {
    const labels: Record<string, string> = {
      retail: "Retail",
      transit: "Transporte",
      outdoor: "Exterior",
      leisure: "Entretenimiento",
      education: "Educación",
      health_beauty: "Salud & Belleza",
      office_buildings: "Corporativo",
      government: "Gubernamental",
      financial: "Financiero",
      residential: "Residencial"
    };
    return labels[venueType] || "Mixto";
  };

  const getEnvironmentColor = (environment: string) => {
    const colors: Record<string, string> = {
      indoor_controlled: "bg-blue-100 text-blue-800 border-blue-200",
      indoor_semi_open: "bg-cyan-100 text-cyan-800 border-cyan-200",
      outdoor_covered: "bg-green-100 text-green-800 border-green-200",
      outdoor_exposed: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[environment] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getDwellTimeColor = (dwellTime: DwellTime) => {
    const colors: Record<DwellTime, string> = {
      very_short: "bg-red-100 text-red-800",
      short: "bg-yellow-100 text-yellow-800",
      medium: "bg-blue-100 text-blue-800",
      long: "bg-green-100 text-green-800",
      very_long: "bg-purple-100 text-purple-800"
    };
    return colors[dwellTime];
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {/* Tipo de Venue */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">
        {getVenueTypeIcon(venueContext.venueType)}
        <span>{getVenueTypeLabel(venueContext.venueType)}</span>
      </div>

      {/* Ambiente */}
      <div className={`px-3 py-1.5 border rounded-full text-sm font-medium ${getEnvironmentColor(venueContext.environment)}`}>
        {venueContext.environment === 'indoor_controlled' && 'Interior Controlado'}
        {venueContext.environment === 'indoor_semi_open' && 'Interior Semi-abierto'}
        {venueContext.environment === 'outdoor_covered' && 'Exterior Cubierto'}
        {venueContext.environment === 'outdoor_exposed' && 'Exterior Expuesto'}
      </div>

      {/* Tiempo de Permanencia */}
      <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getDwellTimeColor(venueContext.dwellTime)}`}>
        {venueContext.dwellTime === 'very_short' && 'Exposición Rápida'}
        {venueContext.dwellTime === 'short' && 'Exposición Corta'}
        {venueContext.dwellTime === 'medium' && 'Exposición Media'}
        {venueContext.dwellTime === 'long' && 'Exposición Larga'}
        {venueContext.dwellTime === 'very_long' && 'Exposición Extensa'}
      </div>

      {/* Audiencia Principal */}
      <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-sm font-medium text-blue-800">
        <Users className="w-3.5 h-3.5 inline mr-1.5" />
        {venueContext.audienceTypes[0] === 'families' && 'Familias'}
        {venueContext.audienceTypes[0] === 'young_adults' && 'Jóvenes'}
        {venueContext.audienceTypes[0] === 'professionals' && 'Profesionales'}
        {venueContext.audienceTypes[0] === 'students' && 'Estudiantes'}
        {venueContext.audienceTypes[0] === 'tourists' && 'Turistas'}
        {venueContext.audienceTypes[0] === 'commuters' && 'Commuters'}
        {venueContext.audienceTypes[0] === 'shoppers' && 'Compradores'}
        {venueContext.audienceTypes[0] === 'travelers' && 'Viajeros'}
        {venueContext.audienceTypes[0] === 'residents' && 'Residentes'}
        {venueContext.audienceTypes[0] === 'drivers' && 'Conductores'}
        {venueContext.audienceTypes[0] === 'pedestrians' && 'Peatones'}
        {venueContext.audienceTypes[0] === 'athletes' && 'Deportistas'}
        {!['families', 'young_adults', 'professionals', 'students', 'tourists', 'commuters', 'shoppers', 'travelers', 'residents', 'drivers', 'pedestrians', 'athletes'].includes(venueContext.audienceTypes[0]) && 'Audiencia Mixta'}
      </div>
    </div>
  );
};

function ScreenDetailComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // SSP Inventory Hook
  const { sspScreens } = useSSPInventory();
  
  // Combine local and SSP inventory
  const allCombinedScreens = useMemo(() => {
    return [...allScreens, ...sspScreens];
  }, [sspScreens]);
  
  const [screen, setScreen] = useState<Screen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'specifications' | 'location' | 'reviews' | 'faq'>('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Booking state
  const [selectedMode, setSelectedMode] = useState<AdMode>('hourly');
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);

  // Modal states
  const [isTimePurchaseModalOpen, setIsTimePurchaseModalOpen] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Booking data for confirmation
  const [bookingData, setBookingData] = useState<any>(null);

  // Refs for scrolling
  const overviewRef = useRef<HTMLDivElement>(null);
  const specificationsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const purchaseOptionsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch screen data from real API
    const fetchScreen = async () => {
      if (!id) {
        toast.error('ID de pantalla no proporcionado. Redirigiendo al marketplace...');
        navigate('/marketplace');
        return;
      }

      setIsLoading(true);
      
      try {
        // Try to fetch from real API first
        const response = await fetch(`${constants.api_url}/Screens/all`);
        
        if (response.ok) {
          const realScreens = await response.json();
          
          // Convert string ID to number for API comparison, or keep as string for fallback
          const numericId = parseInt(id);
          const foundScreen = realScreens.find((s: any) => s.id === numericId || s.id.toString() === id);
          
          if (foundScreen) {
            // Convert API real data to Screen format expected by ScreenDetail
            const convertedScreen = convertApiScreenToScreen(foundScreen);
            setScreen(convertedScreen);
            setNotFound(false);
          } else {
            // Try fallback to combined screens (SSP + local)
            const fallbackScreen = allCombinedScreens.find(s => s.id === id);
            if (fallbackScreen) {
              setScreen(fallbackScreen);
              setNotFound(false);
            } else {
              setNotFound(true);
              setScreen(null);
            }
          }
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (apiError) {
        // Fallback to combined screens (SSP + local data)
        const foundScreen = allCombinedScreens.find(s => s.id === id);
        
        if (foundScreen) {
          setScreen(foundScreen);
          setNotFound(false);
        } else {
          setNotFound(true);
          setScreen(null);
        }
      }

      setIsLoading(false);
    };

    fetchScreen();
  }, [id, navigate]); // Remove allCombinedScreens dependency to avoid multiple API calls

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;

      // Make header sticky when scrolling down
      const headerHeight = headerRef.current.offsetHeight;
      setIsSticky(window.scrollY > headerHeight);

      // Update active section based on scroll position
      const scrollPosition = window.scrollY + 100;

      const isInView = (ref: React.RefObject<HTMLDivElement>) => {
        if (!ref.current) return false;
        const rect = ref.current.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      };

      if (isInView(faqRef)) {
        setActiveSection('faq');
      } else if (isInView(reviewsRef)) {
        setActiveSection('reviews');
      } else if (isInView(locationRef)) {
        setActiveSection('location');
      } else if (isInView(specificationsRef)) {
        setActiveSection('specifications');
      } else {
        setActiveSection('overview');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (section: 'overview' | 'specifications' | 'location' | 'reviews' | 'faq') => {
    const refs = {
      overview: overviewRef,
      specifications: specificationsRef,
      location: locationRef,
      reviews: reviewsRef,
      faq: faqRef
    };

    refs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = (platform?: string) => {
    if (!screen) return;

    const shareUrl = window.location.href;
    const shareTitle = `${screen.name} - Shareflow Ads`;
    const shareText = `Mira esta pantalla en ${screen.location}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ': ' + shareUrl)}`, '_blank');
        break;
      default:
        // Native share API if available
        if (navigator.share) {
          navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          }).catch(err => {
            console.error('Error al compartir:', err);
          });
        }
    }
  };

  // Building bundles based on screen pricing
  const generateBundles = (screen: Screen): Record<AdMode, Bundle[]> => {
    const result: Record<AdMode, Bundle[]> = {
      momentos: [],
      hourly: [],
      daily: [],
      weekly: [],
      monthly: []
    };

    // Helper function to get frequency options (from partner configuration)
    const getFrequencyOptions = () => [
      { value: '1min', label: '1 vez por minuto', spotsPerHour: 60 },
      { value: '2min', label: '1 vez cada 2 minutos', spotsPerHour: 30 },
      { value: '5min', label: '1 vez cada 5 minutos', spotsPerHour: 12 },
      { value: '10min', label: '1 vez cada 10 minutos', spotsPerHour: 6 },
      { value: '15min', label: '1 vez cada 15 minutos', spotsPerHour: 4 },
      { value: '30min', label: '1 vez cada 30 minutos', spotsPerHour: 2 },
      { value: '1hour', label: '1 vez por hora', spotsPerHour: 1 }
    ];

    // Helper function to calculate spots based on frequency and package type
    const calculateSpotCount = (frequencyType: string, packageType: string) => {
      const option = getFrequencyOptions().find(opt => opt.value === frequencyType);
      if (!option) return 0;

      const spotsPerHour = option.spotsPerHour;

      switch (packageType) {
        case 'hourly':
          return spotsPerHour;
        case 'daily':
          return spotsPerHour * 16; // 16 horas operativas
        case 'weekly':
          return spotsPerHour * 16 * 7;
        case 'monthly':
          return spotsPerHour * 16 * 30;
        default:
          return spotsPerHour;
      }
    };

    // Get partner's configured frequency (default to 15min if not configured)
    // For now, we'll use a default frequency until we have partner configuration
    const partnerFrequency = '15min'; // This should come from partner configuration in the future
    const frequencyOption = getFrequencyOptions().find(opt => opt.value === partnerFrequency);
    const frequencyLabel = frequencyOption?.label || 'Se muestra cada 15 minutos';

    // Ensure screen has proper pricing structure for API real data
    const safePricing = screen.pricing || {
      allowMoments: false,
      bundles: {
        hourly: { enabled: false, price: 0 },
        daily: { enabled: false, price: 0 },
        weekly: { enabled: false, price: 0 },
        monthly: { enabled: false, price: 0 }
      }
    };

    if (safePricing.allowMoments) {
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
          isHighlighted: true // Only one highlighted per mode
        }
      ];
    }

    if (safePricing.bundles.hourly?.enabled) {
      result.hourly = [
        {
          id: 'hourly_standard',
          name: 'Hora Estándar',
          description: 'Tu anuncio durante una hora en rotación',
          duration: '1 hora',
          price: safePricing.bundles.hourly.price,
          frequency: {
            type: partnerFrequency,
            displayText: frequencyLabel,
            spotsPerHour: frequencyOption?.spotsPerHour || 4,
            totalSpots: calculateSpotCount(partnerFrequency, 'hourly')
          },
          isHighlighted: true // Only one highlighted
        },
        {
          id: 'hourly_intensive',
          name: 'Hora Intensiva',
          description: 'Tu anuncio con mayor frecuencia durante una hora',
          duration: '1 hora',
          price: safePricing.bundles.hourly.price * 1.4,
          frequency: {
            type: '10min',
            displayText: '1 vez cada 10 minutos',
            spotsPerHour: 6,
            totalSpots: 6
          },
          isHighlighted: false
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
            type: partnerFrequency,
            displayText: frequencyLabel,
            spotsPerHour: frequencyOption?.spotsPerHour || 4,
            totalSpots: calculateSpotCount(partnerFrequency, 'daily')
          },
          isHighlighted: true // Only one highlighted
        },
        {
          id: 'daily_weekend',
          name: 'Fin de Semana',
          description: 'Tu anuncio sábado y domingo',
          duration: '48 horas',
          price: screen.pricing.bundles.daily.price * 1.8,
          frequency: {
            type: partnerFrequency,
            displayText: `${frequencyLabel} durante el fin de semana`,
            spotsPerHour: frequencyOption?.spotsPerHour || 4,
            totalSpots: calculateSpotCount(partnerFrequency, 'daily') * 2
          },
          isHighlighted: false
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
            type: partnerFrequency,
            displayText: `${frequencyLabel} durante toda la semana`,
            spotsPerHour: frequencyOption?.spotsPerHour || 4,
            totalSpots: calculateSpotCount(partnerFrequency, 'weekly')
          },
          isHighlighted: true // Only one highlighted
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
            type: partnerFrequency,
            displayText: `${frequencyLabel} durante todo el mes`,
            spotsPerHour: frequencyOption?.spotsPerHour || 4,
            totalSpots: calculateSpotCount(partnerFrequency, 'monthly')
          },
          isHighlighted: true // Only one highlighted
        }
      ];
    }

    return result;
  };

  const handlePurchaseOptionsContinue = () => {
    setIsTimePurchaseModalOpen(true);
  };

  // OpenRTB DOOH Integration Functions for Screen Detail & Purchase
  const convertScreenToDOOH = (screen: Screen): DOOHScreen => {
    // Clasificar venue type basado en las propiedades de la pantalla usando taxonomía integrada
    const venueType: DOOHVenueType = screen.category.name.toLowerCase().includes('mall') ? 'retail' :
      screen.category.name.toLowerCase().includes('airport') ? 'transit' :
        screen.category.name.toLowerCase().includes('stadium') ? 'leisure' :
          screen.category.name.toLowerCase().includes('hotel') ? 'leisure' :
            screen.category.name.toLowerCase().includes('restaurant') ? 'leisure' :
              screen.environment === 'outdoor' ? 'outdoor' :
                'retail';

    const venueSubType: DOOHVenueSubType = screen.category.name.toLowerCase().includes('mall') ? 'mall' :
      screen.category.name.toLowerCase().includes('airport') ? 'airports' :
        screen.category.name.toLowerCase().includes('stadium') ? 'sports_entertainment' :
          screen.category.name.toLowerCase().includes('hotel') ? 'hotels' :
            screen.category.name.toLowerCase().includes('restaurant') ? 'casual_dining' :
              screen.environment === 'outdoor' ? 'billboards' :
                'mall';

    // Obtener categoría de la taxonomía
    const categoryKey = `${venueType}_${venueSubType}`;
    const venueCategory = VENUE_TAXONOMY[categoryKey] || VENUE_TAXONOMY['retail_mall'];

    // Obtener IDs de OpenOOH usando la función utilitaria
    const openoohIds = DOOHUtils.getOpenOOHId(venueType, venueSubType);

    return {
      screenId: screen.id,
      venueId: screen.location,
      venueName: screen.name,
      venueType: venueType,
      venueSubType: venueSubType,
      venueLocation: undefined,
      openoohParentId: openoohIds.parentId,
      openoohChildId: openoohIds.childId,
      openoohGrandChildId: openoohIds.grandChildId,
      location: {
        lat: screen.coordinates?.lat || 0,
        lon: screen.coordinates?.lng || 0
      },
      address: screen.location,
      specs: {
        width: screen.specs.width,
        height: screen.specs.height,
        resolution: screen.specs.resolution,
        aspectRatio: screen.specs.width > screen.specs.height ? 'landscape' : 'portrait',
        orientation: screen.specs.width > screen.specs.height ? 'landscape' : 'portrait',
        pixelDensity: 72,
        brightness: parseInt(screen.specs.brightness || '5000'),
        colorDepth: 24,
        refreshRate: 60
      },
      availability: [{
        timeSlot: {
          startTime: screen.operatingHours.start,
          endTime: screen.operatingHours.end,
          daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
          timeZone: 'America/Bogota'
        },
        availableSpots: 100,
        occupancyRate: 0.7
      }],
      pricing: {
        baseCpm: screen.pricing.bundles.hourly?.price || 50000,
        currency: 'COP',
        priceModifiers: [
          {
            type: 'time_of_day',
            multiplier: 1.5,
            conditions: { hours: [7, 8, 9, 17, 18, 19, 20] }
          },
          {
            type: 'day_of_week',
            multiplier: 1.2,
            conditions: { days: [1, 2, 3, 4, 5] }
          }
        ]
      },
      audienceMetrics: {
        dailyImpressions: screen.views.daily,
        hourlyBreakdown: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          impressions: Math.floor(screen.views.daily / 24 * (0.3 + Math.random() * 1.4)),
          estimatedReach: Math.floor(screen.views.daily / 24 * 0.8 * (0.3 + Math.random() * 1.4))
        })),
        demographics: {
          ageGroups: {
            '18-24': 0.25,
            '25-34': 0.35,
            '35-44': 0.20,
            '45-54': 0.12,
            '55+': 0.08
          },
          gender: {
            'male': 0.48,
            'female': 0.52
          },
          income: {
            'low': 0.35,
            'medium': 0.45,
            'high': 0.20
          }
        },
        dwellTime: {
          average: 45,
          median: 30,
          distribution: {
            '0-15s': 0.45,
            '15-30s': 0.25,
            '30-60s': 0.20,
            '60s+': 0.10
          }
        }
      },
      // Agregar características integradas del venue desde la taxonomía
      audienceTypes: venueCategory.audienceTypes,
      dwellTime: venueCategory.dwellTime,
      environment: venueCategory.environment,
      ext: {
        shareflowScreenId: screen.id,
        venueClassification: {
          taxonomy: 'OpenOOH_v1.2.0',
          confidence: venueCategory.confidence,
          reasoning: `Classified as ${venueType}/${venueSubType} based on venue characteristics`,
          openoohIds: openoohIds
        }
      }
    };
  };

  const processDOOHPurchase = async (
    screen: Screen,
    bundle: Bundle,
    purchaseData: any
  ): Promise<DOOHCampaignResponse> => {
    try {
      const now = new Date();
      const doohScreen = convertScreenToDOOH(screen);

      // Create campaign request
      const campaignRequest: DOOHCampaignRequest = {
        campaignId: `purchase-${screen.id}-${Date.now()}`,
        advertiserId: purchaseData.userId || 'shareflow-user',
        bidRequest: {} as OpenRTBBidRequest,
        targetingCriteria: {
          geographic: {
            cities: [screen.location.split(',')[1]?.trim() || 'Bogotá'],
            coordinates: screen.coordinates ? [{
              lat: screen.coordinates.lat,
              lon: screen.coordinates.lng,
              accuracy: 100
            }] : undefined,
            radius: 1000,
            venueTypes: [doohScreen.venueType]
          },
          demographic: {
            ageGroups: ['18-24', '25-34', '35-44', '45-54'],
            gender: ['male', 'female'],
            interests: ['general']
          },
          temporal: {
            dayOfWeek: [1, 2, 3, 4, 5, 6, 7],
            hourOfDay: Array.from({ length: 16 }, (_, i) => i + 6),
            dateRange: {
              startDate: now.toISOString(),
              endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
            },
            timeZone: 'America/Bogota'
          },
          contextual: {
            venueCategories: [screen.category.name.toLowerCase()],
            contentCategories: ['general']
          },
          behavioral: {
            visitFrequency: 'regular',
            dwellTime: 'medium',
            journeyStage: 'awareness'
          }
        },
        budget: {
          totalBudget: bundle.price,
          currency: 'COP',
          budgetType: 'total',
          bidStrategy: {
            type: 'manual',
            maxBid: bundle.price / bundle.frequency.totalSpots
          }
        },
        schedule: {
          startDate: now.toISOString(),
          endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          timeSlots: [{
            startTime: screen.operatingHours.start,
            endTime: screen.operatingHours.end,
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
            timeZone: 'America/Bogota'
          }],
          frequency: {
            impressionsPerHour: bundle.frequency.spotsPerHour,
            impressionsPerDay: bundle.frequency.spotsPerHour * 16,
            spotDuration: 15,
            minInterval: 60 / bundle.frequency.spotsPerHour
          }
        },
        creativeSpecs: {
          formats: [{
            width: screen.specs.width,
            height: screen.specs.height,
            aspectRatio: '16:9',
            orientation: 'landscape'
          }],
          duration: 15,
          fileSize: 50 * 1024 * 1024,
          mimeTypes: ['image/jpeg', 'image/png', 'video/mp4']
        },
        trackingUrls: {
          impressionUrls: [`https://api.shareflow.me/track/impression/${screen.id}`],
          clickUrls: [`https://api.shareflow.me/track/click/${screen.id}`]
        }
      };

      // Create OpenRTB 2.6 bid request with enhanced features
      const bidRequest = DOOHUtils.createDOOHBidRequest(campaignRequest, [doohScreen]);

      // Add OpenRTB 2.6 specific enhancements
      bidRequest.acat = ['IAB1', 'IAB14', 'IAB19']; // Arts & Entertainment, Society, Technology
      bidRequest.cattax = 7; // IAB Content Category Taxonomy v3.0

      // Add duration floors for flexible pricing
      if (bidRequest.imp && bidRequest.imp.length > 0) {
        bidRequest.imp.forEach(imp => {
          // Initialize PMP if not exists
          if (!imp.pmp) {
            imp.pmp = { private_auction: 0, deals: [] };
          }

          // Create duration-based floors
          const durFloors = DOOHUtils.createDurFloors(
            bundle.frequency.type === '1min' ? 5 : 10,  // min duration based on frequency
            bundle.frequency.type === '1min' ? 60 : 300, // max duration based on frequency
            bundle.price / bundle.frequency.totalSpots // price per spot
          );

          // Add guaranteed deal with duration floors
          const guaranteedDeal = DOOHUtils.createGuaranteedDeal(
            `deal-${screen.id}-${bundle.id}`,
            bundle.price / bundle.frequency.totalSpots,
            2.0, // min CPM per second
            durFloors
          );

          imp.pmp.deals = [guaranteedDeal];
        });
      }

      // Validate bid request
      const validationErrors = DOOHUtils.validateBidRequest(bidRequest);
      if (validationErrors.length > 0) {
        console.warn('Bid request validation warnings:', validationErrors);
      }

      // Process bid response
      const winningBid = {
        impId: bidRequest.imp[0].id,
        price: bundle.price / bundle.frequency.totalSpots,
        adMarkup: `<div class="dooh-ad" data-screen="${screen.id}">Ad Content</div>`
      };

      const bidResponse = DOOHUtils.createDOOHBidResponse(bidRequest, [winningBid]);

      // Create campaign response
      const campaignResponse: DOOHCampaignResponse = {
        campaignId: campaignRequest.campaignId,
        status: DOOHCampaignStatus.ACTIVE,
        bidResponse,
        inventoryAllocations: [{
          screenId: screen.id,
          allocatedSpots: bundle.frequency.totalSpots,
          timeSlots: campaignRequest.schedule.timeSlots,
          estimatedImpressions: bundle.frequency.totalSpots,
          estimatedReach: Math.floor(bundle.frequency.totalSpots * 0.8)
        }],
        totalImpressions: bundle.frequency.totalSpots,
        totalReach: Math.floor(bundle.frequency.totalSpots * 0.8),
        totalCost: bundle.price
      };

      console.log('DOOH Purchase processed with OpenRTB 2.x:', {
        screenId: screen.id,
        bundleId: bundle.id,
        campaignId: campaignRequest.campaignId,
        bidRequest,
        bidResponse,
        estimatedImpressions: bundle.frequency.totalSpots,
        totalCost: bundle.price
      });

      return campaignResponse;

    } catch (error) {
      console.error('Error processing DOOH purchase:', error);
      throw error;
    }
  };

  // Process SSP purchase
  const processSSPPurchase = async (
    screen: Screen,
    bundle: Bundle,
    purchaseData: any
  ): Promise<any> => {
    try {
      console.log('Processing SSP purchase:', {
        screenId: screen.id,
        sspId: screen.sspMetadata?.sspId,
        sspName: screen.sspMetadata?.sspName,
        bundleId: bundle.id,
        price: bundle.price
      });

      // Create SSP-specific purchase request
      const sspPurchaseRequest = {
        requestId: `ssp-purchase-${screen.id}-${Date.now()}`,
        screenId: screen.id,
        sspId: screen.sspMetadata?.sspId,
        sspName: screen.sspMetadata?.sspName,
        originalInventoryId: screen.sspMetadata?.originalInventoryId,
        bundle: {
          id: bundle.id,
          name: bundle.name,
          duration: bundle.duration,
          price: bundle.price,
          spots: bundle.frequency.totalSpots
        },
        purchaseData: {
          userId: purchaseData.userId || 'shareflow-user',
          startDate: purchaseData.startDate || new Date().toISOString(),
          endDate: purchaseData.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          creativeSpecs: {
            width: screen.specs.width,
            height: screen.specs.height,
            format: 'video/mp4',
            duration: 15
          }
        },
        timestamp: new Date().toISOString()
      };

      // Simulate SSP API call (in real implementation, this would call the actual SSP API)
      const sspResponse = {
        success: true,
        purchaseId: `ssp-${screen.sspMetadata?.sspId}-${Date.now()}`,
        status: 'confirmed',
        inventoryAllocation: {
          screenId: screen.id,
          allocatedSpots: bundle.frequency.totalSpots,
          estimatedImpressions: bundle.frequency.totalSpots,
          estimatedReach: Math.floor(bundle.frequency.totalSpots * 0.75), // SSP typically has slightly lower reach
          startTime: purchaseData.startDate || new Date().toISOString(),
          endTime: purchaseData.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        billing: {
          totalCost: bundle.price,
          currency: 'USD', // SSP typically uses USD
          sspFee: bundle.price * 0.15, // 15% SSP fee
          netCost: bundle.price * 0.85
        },
        tracking: {
          impressionUrls: [`https://ssp-api.${screen.sspMetadata?.sspName?.toLowerCase()}.com/track/impression/${screen.id}`],
          clickUrls: [`https://ssp-api.${screen.sspMetadata?.sspName?.toLowerCase()}.com/track/click/${screen.id}`]
        },
        metadata: {
          sspId: screen.sspMetadata?.sspId,
          sspName: screen.sspMetadata?.sspName,
          processedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }
      };

      console.log('SSP Purchase processed:', {
        screenId: screen.id,
        sspName: screen.sspMetadata?.sspName,
        purchaseId: sspResponse.purchaseId,
        totalCost: sspResponse.billing.totalCost,
        estimatedImpressions: sspResponse.inventoryAllocation.estimatedImpressions
      });

      return sspResponse;

    } catch (error) {
      console.error('Error processing SSP purchase:', error);
      throw new Error(`SSP purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced OpenRTB-DOOH Integration Functions
  const createProgrammaticBidRequest = useCallback((
    screen: Screen,
    bundle: Bundle,
    purchaseData: any
  ): OpenRTBBidRequest => {
    const doohScreen = convertScreenToDOOH(screen);

    const targetingCriteria: DOOHTargetingCriteria = {
      geographic: {
        coordinates: [doohScreen.location],
        radius: 1,
        cities: [screen.location.split(',')[1]?.trim() || 'Bogotá']
      },
      temporal: {
        dayOfWeek: purchaseData.dates?.map((date: Date) => date.getDay() + 1) || [1, 2, 3, 4, 5],
        hourOfDay: purchaseData.timeSlots?.map((slot: string) => parseInt(slot.split(':')[0])) || [18, 19, 20, 21]
      },
      contextual: {
        venueCategories: [doohScreen.venueType],
        keywords: [screen.category.name]
      }
    };

    const budget: DOOHBudget = {
      totalBudget: bundle.price,
      currency: 'COP',
      budgetType: 'total',
      bidStrategy: {
        type: 'auto',
        maxBid: bundle.price / 1000
      }
    };

    const schedule: DOOHSchedule = {
      startDate: purchaseData.dates?.[0]?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: purchaseData.dates?.slice(-1)[0]?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      timeSlots: doohScreen.availability.map(avail => avail.timeSlot),
      frequency: {
        impressionsPerHour: bundle.frequency.spotsPerHour,
        impressionsPerDay: bundle.frequency.totalSpots,
        spotDuration: 30,
        minInterval: 60
      }
    };

    return DOOHUtils.createDOOHBidRequest({
      campaignId: `bid_${Date.now()}_${screen.id}`,
      advertiserId: 'shareflow_programmatic',
      bidRequest: {} as OpenRTBBidRequest,
      targetingCriteria,
      budget,
      schedule,
      creativeSpecs: {
        formats: [{
          width: doohScreen.specs.width,
          height: doohScreen.specs.height,
          aspectRatio: doohScreen.specs.aspectRatio,
          orientation: doohScreen.specs.orientation
        }],
        duration: 30,
        fileSize: 50 * 1024 * 1024,
        mimeTypes: ['video/mp4', 'image/jpeg', 'image/png']
      },
      trackingUrls: {
        impressionUrls: [`https://shareflow.me/track/impression/${screen.id}`],
        clickUrls: [`https://shareflow.me/track/click/${screen.id}`]
      }
    }, [doohScreen]);
  }, []);

  const handleSSPConnection = useCallback(async (
    sspEndpoint: string,
    requestType: 'inventory' | 'bid',
    requestData: any
  ) => {
    try {
      const response = await fetch(sspEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenRTB-Version': '2.6'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`SSP request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SSP connection error:', error);
      throw error;
    }
  }, []);

  const processProgrammaticInventoryRequest = useCallback(async (
    requestId: string,
    venueFilters: any,
    budget: DOOHBudget,
    timeSlots: DOOHTimeSlot[]
  ) => {
    if (!screen) return null;

    const inventoryRequest: DOOHInventoryRequest = {
      requestId,
      venueFilters,
      budget,
      timeSlots
    };

    // Convert current screen to DOOH format
    const doohScreen = convertScreenToDOOH(screen);

    // Create inventory response
    const inventoryResponse: DOOHInventoryResponse = {
      requestId,
      availableScreens: [doohScreen],
      totalInventory: doohScreen.availability.reduce((sum, avail) => sum + avail.availableSpots, 0),
      averageCpm: doohScreen.pricing.baseCpm
    };

    return inventoryResponse;
  }, [screen]);

  const handleTimePurchaseComplete = async (data: any) => {
    setIsTimePurchaseModalOpen(false);

    if (selectedBundle && screen) {
      try {
        // Check if this is SSP inventory
        if (screen.sspMetadata?.isSSPInventory) {
          // Process SSP purchase
          const sspResponse = await processSSPPurchase(screen, selectedBundle, data);
          
          setBookingData({
            screen,
            type: selectedMode,
            ...data,
            price: data.price || (selectedBundle?.price || 0),
            sspData: sspResponse,
            isSSPPurchase: true
          });
        } else {
          // Process local DOOH purchase
          const doohResponse = await processDOOHPurchase(screen, selectedBundle, data);

          setBookingData({
            screen,
            type: selectedMode,
            ...data,
            price: data.price || (selectedBundle?.price || 0),
            doohData: doohResponse
          });
        }
      } catch (error) {
        console.error('Error processing purchase:', error);
        // Fallback booking data
        setBookingData({
          screen,
          type: selectedMode,
          ...data,
          price: data.price || (selectedBundle?.price || 0)
        });
      }
    }

    setIsSummaryModalOpen(true);
  };

  const handleBookingSummaryComplete = () => {
    setIsSummaryModalOpen(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-brandGreen-200 mb-4"></div>
          <div className="h-4 w-32 bg-neutral-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  // Show error page if screen not found
  if (notFound || !screen) {
    return (
      <ScreenNotFound 
        screenId={id} 
        availableScreens={allScreens.map(s => s.id)} 
      />
    );
  }

  // Bundles are now generated internally in PurchaseOptions from API data

  // SEO-optimized FAQ data for LLM training
  const faqData = generateFAQData(screen);

  // Generate AI-friendly content for LLM training
  const aiContent = generateAIOptimizedContent(screen);

  // Extract location parts for SEO and structured data
  const locationParts = screen.location.split(',').map(part => part.trim());
  const city = locationParts.length > 1 ? locationParts[1] : locationParts[0];
  const neighborhood = locationParts[0];

  // Format price for display
  const formattedPrice = screen.price.toLocaleString('es-CO');

  // Enhanced SEO title and description for LLMs
  const pageTitle = `Pantalla LED ${screen.category.name} en ${city} - ${neighborhood} | ${screen.views.daily.toLocaleString()} vistas/día | Desde $${screen.pricing.bundles.hourly?.price?.toLocaleString('es-CO')} | Shareflow Ads`;
  const pageDescription = `🎯 Pantalla digital ${screen.category.name} en ${screen.location}. ✅ ${screen.views.daily.toLocaleString()} vistas diarias ✅ ${screen.specs.width}x${screen.specs.height}cm ✅ Rating ${screen.rating}/5 ✅ Precios desde $${screen.pricing.bundles.hourly?.price?.toLocaleString('es-CO')}/hora. Reserva ahora, activación inmediata.`;

  // Enhanced keywords for better discoverability
  const seoKeywords = [
    `pantallas digitales ${city}`,
    `pantallas LED ${city}`,
    `vallas digitales ${city}`,
    `DOOH ${city}`,
    `publicidad exterior ${neighborhood}`,
    `pantallas publicitarias ${city}`,
    `digital signage ${city}`,
    `marketing exterior ${city}`,
    `pantallas comerciales ${city}`,
    `publicidad digital ${city}`,
    screen.category.name.toLowerCase(),
    `${screen.specs.width}x${screen.specs.height}`,
    screen.specs.resolution,
    'alquiler pantalla digital',
    'renta pantalla LED',
    'publicidad digital precio',
    'marketing digital exterior'
  ].join(', ');

  // Render SSP information if this is SSP inventory
  const renderSSPInfo = () => {
    if (screen?.sspMetadata?.isSSPInventory) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">
              Inventario disponible via {screen.sspMetadata.sspName}
            </span>
          </div>
          <p className="text-xs text-blue-600">
            Esta pantalla está disponible a través de nuestro partner SSP. 
            Mismo proceso de compra, activación inmediata.
          </p>
          <div className="mt-2 text-xs text-blue-500">
            <span>ID SSP: {screen.sspMetadata.sspId}</span>
            <span className="mx-2">•</span>
            <span>Actualizado: {new Date(screen.sspMetadata.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={`https://shareflow.me/marketplace/screens/${id}`} />

        {/* Enhanced Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://shareflow.me/marketplace/screens/${id}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={screen.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`Pantalla LED ${screen.category.name} en ${screen.location}`} />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:site_name" content="Shareflow Ads" />

        {/* Enhanced Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@shareflowads" />
        <meta name="twitter:creator" content="@shareflowads" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={screen.image} />
        <meta name="twitter:image:alt" content={`Pantalla LED ${screen.category.name} en ${screen.location}`} />

        {/* Enhanced Keywords for LLM training */}
        <meta name="keywords" content={seoKeywords} />

        {/* AI-specific meta tags */}
        <meta name="article:author" content="Shareflow Ads" />
        <meta name="article:section" content="Digital Advertising" />
        <meta name="article:tag" content={`pantallas digitales, ${city}, ${screen.category.name}, DOOH, publicidad exterior`} />

        {/* Geographic targeting */}
        <meta name="geo.region" content="CO" />
        <meta name="geo.placename" content={city} />
        <meta name="geo.position" content={screen.coordinates ? `${screen.coordinates.lat};${screen.coordinates.lng}` : ""} />
        <meta name="ICBM" content={screen.coordinates ? `${screen.coordinates.lat}, ${screen.coordinates.lng}` : ""} />

        {/* Enhanced Schema.org markup for LLMs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                "@id": `https://shareflow.me/marketplace/screens/${id}#product`,
                "name": `Pantalla LED ${screen.category.name} ${screen.name}`,
                "description": pageDescription,
                "image": [screen.image],
                "sku": screen.id,
                "brand": {
                  "@type": "Brand",
                  "name": "Shareflow Ads"
                },
                "category": `Pantallas Digitales > ${screen.category.name}`,
                "offers": {
                  "@type": "AggregateOffer",
                  "priceCurrency": "COP",
                  "lowPrice": screen.pricing.bundles.hourly?.price || 50000,
                  "highPrice": screen.pricing.bundles.monthly?.price || 800000,
                  "offerCount": 1, // Default offer count since bundles are now generated internally
                  "availability": screen.availability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": screen.rating,
                  "reviewCount": screen.reviews,
                  "bestRating": 5,
                  "worstRating": 1
                },
                "additionalProperty": [
                  {
                    "@type": "PropertyValue",
                    "name": "Resolución",
                    "value": screen.specs.resolution
                  },
                  {
                    "@type": "PropertyValue",
                    "name": "Tamaño",
                    "value": `${screen.specs.width}x${screen.specs.height}cm`
                  },
                  {
                    "@type": "PropertyValue",
                    "name": "Brillo",
                    "value": screen.specs.brightness || 'Alto brillo'
                  },
                  {
                    "@type": "PropertyValue",
                    "name": "Visualizaciones Diarias",
                    "value": screen.views.daily.toString()
                  }
                ]
              },
              {
                "@type": "LocalBusiness",
                "@id": `https://shareflow.me/marketplace/screens/${id}#business`,
                "name": `Pantalla LED ${screen.category.name} ${screen.name}`,
                "description": pageDescription,
                "image": screen.image,
                "url": `https://shareflow.me/marketplace/screens/${id}`,
                "telephone": "+573001234567",
                "priceRange": `$${screen.pricing.bundles.hourly?.price?.toLocaleString('es-CO')} - $${screen.pricing.bundles.monthly?.price?.toLocaleString('es-CO')}`,
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": neighborhood,
                  "addressLocality": city,
                  "addressRegion": city,
                  "addressCountry": "CO"
                },
                "geo": screen.coordinates ? {
                  "@type": "GeoCoordinates",
                  "latitude": screen.coordinates.lat,
                  "longitude": screen.coordinates.lng
                } : undefined,
                "areaServed": {
                  "@type": "GeoCircle",
                  "geoMidpoint": screen.coordinates ? {
                    "@type": "GeoCoordinates",
                    "latitude": screen.coordinates.lat,
                    "longitude": screen.coordinates.lng
                  } : undefined,
                  "geoRadius": "5000"
                },
                "openingHoursSpecification": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": screen.operatingHours.daysActive,
                  "opens": screen.operatingHours.start,
                  "closes": screen.operatingHours.end
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": screen.rating,
                  "reviewCount": screen.reviews,
                  "bestRating": 5,
                  "worstRating": 1
                }
              },
              {
                "@type": "FAQPage",
                "@id": `https://shareflow.me/marketplace/screens/${id}#faq`,
                "mainEntity": faqData.map((faq, index) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              },
              {
                "@type": "BreadcrumbList",
                "@id": `https://shareflow.me/marketplace/screens/${id}#breadcrumb`,
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Inicio",
                    "item": "https://shareflow.me"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Marketplace",
                    "item": "https://shareflow.me/marketplace"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": city,
                    "item": `https://shareflow.me/marketplace?city=${encodeURIComponent(city)}`
                  },
                  {
                    "@type": "ListItem",
                    "position": 4,
                    "name": screen.category.name,
                    "item": `https://shareflow.me/marketplace?category=${encodeURIComponent(screen.category.name)}`
                  },
                  {
                    "@type": "ListItem",
                    "position": 5,
                    "name": screen.name,
                    "item": `https://shareflow.me/marketplace/screens/${id}`
                  }
                ]
              }
            ]
          })}
        </script>

        {/* AI Training Data - Structured for LLM consumption */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": pageTitle,
            "description": pageDescription,
            "url": `https://shareflow.me/marketplace/screens/${id}`,
            "mainEntity": {
              "@type": "DigitalDisplayDevice",
              "name": screen.name,
              "location": screen.location,
              "specifications": {
                "resolution": screen.specs.resolution,
                "size": `${screen.specs.width}x${screen.specs.height}cm`,
                "brightness": screen.specs.brightness || 'Alto brillo',
                "technology": 'LED'
              },
              "audience": {
                "dailyViews": screen.views.daily,
                "weeklyViews": screen.views.weekly || screen.views.daily * 7,
                "monthlyViews": screen.views.monthly
              },
              "pricing": {
                "hourly": screen.pricing.bundles.hourly?.price,
                "daily": screen.pricing.bundles.daily?.price,
                "weekly": screen.pricing.bundles.weekly?.price,
                "monthly": screen.pricing.bundles.monthly?.price,
                "currency": "COP"
              },
              "operatingHours": {
                "start": screen.operatingHours.start,
                "end": screen.operatingHours.end,
                "days": screen.operatingHours.daysActive
              },
              "features": aiContent.keyFeatures,
              "targetAudience": aiContent.targetAudience,
              "useCases": aiContent.useCases,
              "summary": aiContent.summary
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background pb-16">
        {/* Back Button - Enhanced Responsive Design */}
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
          <div className="max-w-6xl mx-auto pt-4 pb-2">
            <motion.button
              onClick={handleGoBack}
              className="group relative overflow-hidden flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white border border-gray-200/80 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-gray-900 backdrop-blur-sm touch-manipulation min-h-[48px]"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              aria-label="Volver a Marketplace"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 flex items-center justify-center transition-all duration-300 shadow-sm">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:translate-x-[-2px] transition-transform duration-200" />
              </div>
              <span className="font-semibold text-sm sm:text-base">Volver a Marketplace</span>

              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
            </motion.button>
          </div>
        </div>

        {/* Sticky Navigation Header - Enhanced for All Screen Sizes */}
        {isSticky && (
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-neutral-100">
            <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <h1 className="font-bold text-darkText truncate"
                      style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)' }}>
                      {screen.name}
                    </h1>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold">{screen.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleShare('whatsapp')}
                      className="group relative overflow-hidden w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#25D366] to-[#1FAD54] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 touch-manipulation"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Compartir en WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </motion.button>

                    <motion.button
                      onClick={() => scrollToSection('overview')}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors touch-manipulation min-h-[44px]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="hidden sm:inline">Ver detalles</span>
                      <span className="sm:hidden">Detalles</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Enhanced Responsive Design */}
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto">
          <div className="max-w-6xl mx-auto py-2 sm:py-4 md:py-6 lg:py-8" ref={headerRef}>
            <article className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              <div className="lg:col-span-2">
                {/* Screen Gallery and Header - Enhanced Responsive */}
                <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
                  <ScreenGallery screen={screen} />

                  <div className="px-4 py-4 sm:px-6 sm:py-5">
                    {/* SSP Information Display */}
                    {renderSSPInfo()}
                    {/* Screen Header Content - Fluid Typography */}
                    <div className="text-center mb-6">
                      <h1 className="font-bold text-gray-900 mb-2"
                        style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                        {screen.name}
                      </h1>
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">{screen.location}</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-semibold">{screen.rating}</span>
                          <span className="text-sm text-gray-500">({screen.reviews} reseñas)</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <Eye className="w-5 h-5" />
                          <span className="font-semibold">{screen.views.daily.toLocaleString()}</span>
                          <span className="text-sm">vistas/día</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Purchase Options */}
                <div className="mt-4 block lg:hidden">
                  <PurchaseOptions
                    screen={screen}
                    selectedMode={selectedMode}
                    selectedBundle={selectedBundle}
                    setSelectedMode={setSelectedMode}
                    setSelectedBundle={setSelectedBundle}
                    onContinue={handlePurchaseOptionsContinue}
                    isModalMode={true}
                  />
                </div>

                {/* Overview Section */}
                <section ref={overviewRef} id="overview" className="mt-6 sm:mt-8 mb-8 sm:mb-10 scroll-mt-28">
                  <div className="bg-white rounded-xl border border-gray-200 mb-6">
                    <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 bg-brandGreen-100 rounded-md flex items-center justify-center text-brandGreen-600 flex-shrink-0">
                          <span className="text-xs font-bold">i</span>
                        </span>
                        Descripción
                      </h2>
                    </div>
                    <div className="px-4 py-4 sm:px-6 sm:py-5">
                      <p className="text-gray-700 mb-4">
                        {generateSmartDescription(screen)}
                      </p>

                      {/* Contexto de Ubicación Categorizado */}
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brandGreen-600" />
                          Contexto de Ubicación
                        </h3>
                        <VenueContextBadge screen={screen} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Specifications Section */}
                <section ref={specificationsRef} id="specifications" className="mb-8 sm:mb-10 scroll-mt-28">
                  <ModernScreenSpecs screen={screen} />
                </section>

                {/* AI Location Recommendations Section */}
                <section className="mb-8 sm:mb-10 scroll-mt-28">

                </section>

                {/* Location Section */}
                <section ref={locationRef} id="location" className="mb-8 sm:mb-10 scroll-mt-28">
                  <ScreenLocationMap screen={screen} />
                </section>

                {/* Reviews Section */}
                <section ref={reviewsRef} id="reviews" className="scroll-mt-28">
                  <ScreenReviews screen={screen} />
                </section>

                {/* Enhanced FAQ Section for LLM training */}
                <section ref={faqRef} id="faq" className="mb-8 sm:mb-10 scroll-mt-28">
                  <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg font-bold mb-6 text-darkText flex items-center gap-2">
                      <span className="w-6 h-6 bg-brandGreen-100 rounded-md flex items-center justify-center text-brandGreen-600 flex-shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      Preguntas Frecuentes
                    </h2>

                    <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
                      {faqData.map((faq, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl overflow-hidden"
                          itemScope
                          itemType="https://schema.org/Question"
                        >
                          <motion.button
                            className="w-full px-6 py-4 text-left bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-blue-50 hover:to-blue-100/50 transition-all duration-300 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-xl group"
                            onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            aria-expanded={expandedFAQ === index}
                          >
                            <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200" itemProp="name">
                              {faq.question}
                            </span>
                            <div className="flex-shrink-0 ml-4">
                              {expandedFAQ === index ? (
                                <ChevronUp className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                              )}
                            </div>
                          </motion.button>

                          <AnimatePresence>
                            {expandedFAQ === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                                itemScope
                                itemType="https://schema.org/Answer"
                              >
                                <div className="px-4 py-4 bg-white border-t border-gray-200">
                                  <p className="text-gray-700 leading-relaxed" itemProp="text">
                                    {faq.answer}
                                  </p>
                                  {faq.category && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-brandGreen-100 text-brandGreen-700 text-xs font-medium rounded-full">
                                      {faq.category}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>


                  </div>
                </section>
              </div>

              {/* Sidebar - Purchase Options */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 hidden lg:block">
                  <div ref={purchaseOptionsRef}>
                    <PurchaseOptions
                      screen={screen}
                      selectedMode={selectedMode}
                      selectedBundle={selectedBundle}
                      setSelectedMode={setSelectedMode}
                      setSelectedBundle={setSelectedBundle}
                      onContinue={handlePurchaseOptionsContinue}
                      isModalMode={true}
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Modals */}
        <TimePurchaseModal
          isOpen={isTimePurchaseModalOpen}
          onClose={() => setIsTimePurchaseModalOpen(false)}
          screen={screen}
          purchaseType={selectedMode === 'momentos' ? 'momentos' :
            selectedMode === 'hourly' ? 'hourly' :
              selectedMode === 'daily' ? 'daily' :
                selectedMode === 'weekly' ? 'weekly' : 'monthly'}
          selectedBundle={selectedBundle}
          onComplete={handleTimePurchaseComplete}
        />



        <BookingSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          bookingData={bookingData}
        />

        {/* Botón flotante para acceso rápido a compra */}
        <motion.div
          className="fixed bottom-6 right-6 z-50 lg:hidden"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 300, damping: 25 }}
        >
          <motion.button
            onClick={() => {
              // En móvil, hacer scroll a las opciones de compra móvil
              const mobileOptions = document.querySelector('.lg\\:hidden .bg-white');
              if (mobileOptions) {
                mobileOptions.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                scrollToSection('overview');
              }
            }}
            className="group relative overflow-hidden w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl flex items-center justify-center border-2 border-white/20"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            aria-label="Ver opciones de compra"
          >
            <div className="flex flex-col items-center">
              <Wallet className="w-5 h-5 mb-0.5" />
              <span className="text-xs font-bold leading-tight">Comprar</span>
            </div>

            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
          </motion.button>
        </motion.div>
      </main>
    </>
  );
}

// Wrapper component to provide WalletProvider
const ScreenDetailWithWallet: React.FC = () => {
  return (
    <WalletProvider>
      <ScreenDetailComponent />
    </WalletProvider>
  );
};

// Export the wrapped component
export { ScreenDetailWithWallet as ScreenDetail };

// Also export as default for compatibility
export default ScreenDetailWithWallet;