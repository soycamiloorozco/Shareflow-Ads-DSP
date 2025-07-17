/**
 * Demo Screens Data
 * Pantallas de demostración para testing y desarrollo
 */

import { Screen } from '../types';

// Export the categories for backward compatibility
export const mockCategories = [
  { 
    id: 'stadium',
    name: 'Estadio',
    emoji: '⚽️',
    description: 'Pantallas LED en estadios deportivos',
    count: 8
  },
  { 
    id: 'billboard',
    name: 'Valla Digital',
    emoji: '🖥️',
    description: 'Pantallas LED de gran formato',
    count: 32
  },
  { 
    id: 'mall',
    name: 'Centro Comercial',
    emoji: '🏢',
    description: 'Pantallas en centros comerciales',
    count: 45
  },
  { 
    id: 'airport',
    name: 'Aeropuerto',
    emoji: '✈️',
    description: 'Pantallas en aeropuertos',
    count: 12
  },
  { 
    id: 'transport',
    name: 'Transporte',
    emoji: '🚌',
    description: 'Pantallas en estaciones de transporte',
    count: 18
  }
];

export const demoScreens: Screen[] = [
  // Stadium screens
  {
    id: 'demo-stadium-1',
    name: 'Pantalla LED Perimetral - Estadio Atanasio Girardot',
    location: 'Estadio Atanasio Girardot, Medellín',
    price: 1200000,
    availability: true,
    image: '/screens_photos/9007-639a2c4721253.jpg',
    category: { id: 'stadium', name: 'Estadio', emoji: '⚽️', description: 'Pantallas LED en estadios deportivos', count: 8 },
    environment: 'outdoor' as const,
    specs: {
      width: 1920,
      height: 128,
      resolution: 'HD',
      brightness: '7500 nits'
    },
    views: { daily: 45000, monthly: 180000 },
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
    category: { id: 'stadium', name: 'Estadio', emoji: '⚽️', description: 'Pantallas LED en estadios deportivos', count: 8 },
    environment: 'outdoor' as const,
    specs: {
      width: 2560,
      height: 1440,
      resolution: '2K',
      brightness: '8000 nits'
    },
    views: { daily: 55000, monthly: 220000 },
    rating: 4.8,
    reviews: 92,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6473, lng: -74.0962 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_S002',
      bundles: {
        hourly: { enabled: true, price: 1000000, spots: 4 },
        daily: { enabled: true, price: 5000000, spots: 24 },
        weekly: { enabled: true, price: 22000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 52000,
      monthlyTraffic: 208000,
      averageEngagement: 95
    },
    operatingHours: {
      start: '14:00',
      end: '23:00',
      daysActive: ['Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-billboard-1',
    name: 'LED Billboard - Autopista Norte',
    location: 'Autopista Norte, Bogotá',
    price: 2200000,
    availability: true,
    image: '/screens_photos/8507-639a2ba1b1e20.jpg',
    category: { id: 'billboard', name: 'Valla Digital', emoji: '🖥️', description: 'Pantallas LED de gran formato', count: 32 },
    environment: 'outdoor' as const,
    specs: {
      width: 3840,
      height: 2160,
      resolution: '4K',
      brightness: '9000 nits'
    },
    views: { daily: 85000, monthly: 340000 },
    rating: 4.7,
    reviews: 124,
    isPartOfCircuit: false,
    coordinates: { lat: 4.7110, lng: -74.0721 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_B001',
      bundles: {
        hourly: { enabled: true, price: 1500000, spots: 6 },
        daily: { enabled: true, price: 7500000, spots: 36 },
        weekly: { enabled: true, price: 35000000, spots: 252 }
      }
    },
    metrics: {
      dailyTraffic: 82000,
      monthlyTraffic: 328000,
      averageEngagement: 87
    },
    operatingHours: {
      start: '06:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-mall-1',
    name: 'Pantalla Digital - Centro Comercial Santafé',
    location: 'CC Santafé, Medellín',
    price: 890000,
    availability: true,
    image: '/screens_photos/4807-639a2a9a7b1cd.jpg',
    category: { id: 'mall', name: 'Centro Comercial', emoji: '🏢', description: 'Pantallas en centros comerciales', count: 45 },
    environment: 'indoor' as const,
    specs: {
      width: 1920,
      height: 1080,
      resolution: 'FHD',
      brightness: '500 nits'
    },
    views: { daily: 32000, monthly: 128000 },
    rating: 4.6,
    reviews: 87,
    isPartOfCircuit: true,
    coordinates: { lat: 6.2006, lng: -75.5744 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_M001',
      bundles: {
        hourly: { enabled: true, price: 600000, spots: 6 },
        daily: { enabled: true, price: 3000000, spots: 36 },
        weekly: { enabled: true, price: 15000000, spots: 252 }
      }
    },
    metrics: {
      dailyTraffic: 30000,
      monthlyTraffic: 120000,
      averageEngagement: 92
    },
    operatingHours: {
      start: '10:00',
      end: '22:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-airport-1',
    name: 'Pantalla Arrivals - El Dorado',
    location: 'Aeropuerto El Dorado, Bogotá',
    price: 1800000,
    availability: true,
    image: '/screens_photos/6207-639a2c1c7d8e4.jpg',
    category: { id: 'airport', name: 'Aeropuerto', emoji: '✈️', description: 'Pantallas en aeropuertos', count: 12 },
    environment: 'indoor' as const,
    specs: {
      width: 2560,
      height: 1440,
      resolution: '2K',
      brightness: '700 nits'
    },
    views: { daily: 75000, monthly: 300000 },
    rating: 4.9,
    reviews: 156,
    isPartOfCircuit: false,
    coordinates: { lat: 4.7016, lng: -74.1469 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_A001',
      bundles: {
        hourly: { enabled: true, price: 1200000, spots: 4 },
        daily: { enabled: true, price: 6000000, spots: 24 },
        weekly: { enabled: true, price: 28000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 72000,
      monthlyTraffic: 288000,
      averageEngagement: 94
    },
    operatingHours: {
      start: '04:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  }
];

// Default export for compatibility
export default demoScreens; 