/**
 * Mock Data Fallback
 * Provides fallback data when API is not available
 */

import { Screen, PaginatedResponse } from '../../types/marketplace.types';

// Mock screens data for fallback
const mockScreensData: Screen[] = [
  {
    id: 'mock-screen-1',
    name: 'Centro Comercial Andino - Pantalla Principal',
    location: 'Bogotá, Colombia',
    price: 850000,
    availability: true,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    category: { id: 'shopping-mall', name: 'Centro Comercial' },
    environment: 'indoor' as const,
    specs: {
      width: 1920,
      height: 1080,
      resolution: '1920x1080',
      brightness: '5000 nits',
      aspectRatio: '16:9',
      orientation: 'landscape' as const,
      pixelDensity: 72,
      colorDepth: 24,
      refreshRate: 60,
    },
    views: {
      daily: 25000,
      monthly: 750000,
    },
    rating: 4.8,
    reviews: 156,
    coordinates: { lat: 4.6097, lng: -74.0817 },
    pricing: {
      allowMoments: true,
      deviceId: 'mock-device-1',
      bundles: {
        hourly: { enabled: true, price: 85000, spots: 12 },
        daily: { enabled: true, price: 850000, spots: 288 },
        weekly: { enabled: true, price: 5100000, spots: 2016 },
        monthly: { enabled: true, price: 18700000, spots: 8640 },
      },
    },
    metrics: {
      dailyTraffic: 25000,
      monthlyTraffic: 750000,
      averageEngagement: 92,
    },
    locationDetails: {
      address: 'Carrera 11 # 82-71',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'Colombia',
      coordinates: { lat: 4.6097, lng: -74.0817 },
      timezone: 'America/Bogota',
      landmarks: ['Centro Comercial Andino', 'Zona Rosa'],
    },
    operatingHours: {
      start: '10:00',
      end: '22:00',
      daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
  {
    id: 'mock-screen-2',
    name: 'Aeropuerto El Dorado - Terminal 1',
    location: 'Bogotá, Colombia',
    price: 1200000,
    availability: true,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop',
    category: { id: 'airport', name: 'Aeropuerto' },
    environment: 'indoor' as const,
    specs: {
      width: 3840,
      height: 2160,
      resolution: '3840x2160',
      brightness: '4000 nits',
      aspectRatio: '16:9',
      orientation: 'landscape' as const,
      pixelDensity: 96,
      colorDepth: 32,
      refreshRate: 60,
    },
    views: {
      daily: 45000,
      monthly: 1350000,
    },
    rating: 4.9,
    reviews: 203,
    coordinates: { lat: 4.7016, lng: -74.1469 },
    pricing: {
      allowMoments: true,
      deviceId: 'mock-device-2',
      bundles: {
        hourly: { enabled: true, price: 120000, spots: 12 },
        daily: { enabled: true, price: 1200000, spots: 288 },
        weekly: { enabled: true, price: 7200000, spots: 2016 },
        monthly: { enabled: true, price: 26400000, spots: 8640 },
      },
    },
    metrics: {
      dailyTraffic: 45000,
      monthlyTraffic: 1350000,
      averageEngagement: 88,
    },
    locationDetails: {
      address: 'Aeropuerto Internacional El Dorado',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'Colombia',
      coordinates: { lat: 4.7016, lng: -74.1469 },
      timezone: 'America/Bogota',
      landmarks: ['Aeropuerto El Dorado', 'Terminal 1'],
    },
    operatingHours: {
      start: '05:00',
      end: '23:00',
      daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
  {
    id: 'mock-screen-3',
    name: 'TransMilenio Estación Universidades',
    location: 'Bogotá, Colombia',
    price: 450000,
    availability: true,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
    category: { id: 'transport', name: 'Transporte' },
    environment: 'outdoor' as const,
    specs: {
      width: 1920,
      height: 1080,
      resolution: '1920x1080',
      brightness: '6000 nits',
      aspectRatio: '16:9',
      orientation: 'landscape' as const,
      pixelDensity: 72,
      colorDepth: 24,
      refreshRate: 60,
    },
    views: {
      daily: 18000,
      monthly: 540000,
    },
    rating: 4.5,
    reviews: 89,
    coordinates: { lat: 4.6282, lng: -74.0776 },
    pricing: {
      allowMoments: true,
      deviceId: 'mock-device-3',
      bundles: {
        hourly: { enabled: true, price: 45000, spots: 12 },
        daily: { enabled: true, price: 450000, spots: 288 },
        weekly: { enabled: true, price: 2700000, spots: 2016 },
        monthly: { enabled: true, price: 9900000, spots: 8640 },
      },
    },
    metrics: {
      dailyTraffic: 18000,
      monthlyTraffic: 540000,
      averageEngagement: 75,
    },
    locationDetails: {
      address: 'Estación Universidades',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'Colombia',
      coordinates: { lat: 4.6282, lng: -74.0776 },
      timezone: 'America/Bogota',
      landmarks: ['TransMilenio', 'Universidad Nacional'],
    },
    operatingHours: {
      start: '05:00',
      end: '23:00',
      daysActive: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
];

/**
 * Get mock screens data as a paginated response
 */
export function getMockScreensResponse(): PaginatedResponse<Screen> {
  return {
    data: mockScreensData,
    meta: {
      total: mockScreensData.length,
      page: 1,
      limit: 20,
      hasMore: false,
      timestamp: new Date().toISOString(),
      requestId: 'mock-request-' + Date.now(),
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      totalItems: mockScreensData.length,
    },
  };
}

/**
 * Get a single mock screen by ID
 */
export function getMockScreen(id: string): Screen | null {
  return mockScreensData.find(screen => screen.id === id) || null;
}

export default {
  getMockScreensResponse,
  getMockScreen,
  mockScreensData,
};