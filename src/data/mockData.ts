import { Screen, SportEvent, ScreenCategory, CircuitScreen } from '../types';

export const categories: ScreenCategory[] = [
  { 
    id: 'fpc',
    name: 'FPC',
    emoji: '⚽️',
    description: 'Pantallas LED en estadios de fútbol profesional',
    count: 12
  },
  { 
    id: 'digital-billboards',
    name: 'Vallas Digitales',
    emoji: '🖥️',
    description: 'Pantallas LED de gran formato en ubicaciones premium',
    count: 45
  },
  { 
    id: 'malls',
    name: 'Centro Comercial',
    emoji: '🏢',
    description: 'Pantallas digitales en los principales centros comerciales',
    count: 78
  },
  { 
    id: 'info-points',
    name: 'Puntos de Información',
    emoji: '📣',
    description: 'Kioscos digitales interactivos',
    count: 34
  }
];

// Mock data for a circuit
const santafeCircuitScreens: CircuitScreen[] = [
  {
    id: 'scr_sf_1',
    name: 'Santafé Entrada Principal',
    location: 'Primer Piso - Entrada Principal',
    coordinates: { lat: 6.2006, lng: -75.5744 }
  },
  {
    id: 'scr_sf_2',
    name: 'Santafé Plazoleta Central',
    location: 'Segundo Piso - Plazoleta Central',
    coordinates: { lat: 6.2007, lng: -75.5745 }
  },
  {
    id: 'scr_sf_3',
    name: 'Santafé Zona Premium',
    location: 'Tercer Piso - Zona Premium',
    coordinates: { lat: 6.2008, lng: -75.5746 }
  }
];

export const screens: Screen[] = [
  {
    id: 'screen-1',
    name: 'El Poblado Plaza',
    location: 'Calle 10 #43D-12',
    price: 250000,
    availability: true,
    image: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200',
    category: categories.find(c => c.id === 'malls')!,
    specs: {
      width: 1920,
      height: 1080,
      resolution: '4K',
      brightness: '5000 nits'
    },
    views: {
      daily: 50000,
      monthly: 1500000
    },
    rating: 4.8,
    reviews: 124,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2087, lng: -75.5745 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEV_001',
      bundles: {
        hourly: { enabled: true, price: 150000, spots: 4 },
        daily: { enabled: true, price: 500000, spots: 24 },
        weekly: { enabled: true, price: 2500000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 15000,
      monthlyTraffic: 450000,
      averageEngagement: 85
    },
    operatingHours: {
      start: '06:00',
      end: '22:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    }
  },
  {
    id: 'screen-2',
    name: 'Santafé Mall Circuit',
    location: 'Cra. 43A #7 Sur-170',
    price: 450000,
    availability: true,
    image: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?auto=format&fit=crop&q=80&w=1200',
    category: categories.find(c => c.id === 'malls')!,
    specs: {
      width: 1920,
      height: 1080,
      resolution: '4K',
      brightness: '4000 nits'
    },
    views: {
      daily: 75000,
      monthly: 2250000
    },
    rating: 4.9,
    reviews: 156,
    isPartOfCircuit: true,
    circuitId: 'SANTAFE_CIRCUIT',
    circuitScreens: santafeCircuitScreens,
    coordinates: { lat: 6.2006, lng: -75.5744 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEV_002',
      bundles: {
        daily: { enabled: true, price: 1200000, spots: 72 },
        weekly: { enabled: true, price: 5000000, spots: 504 }
      }
    },
    metrics: {
      dailyTraffic: 25000,
      monthlyTraffic: 750000,
      averageEngagement: 92
    },
    operatingHours: {
      start: '10:00',
      end: '21:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'screen-3',
    name: 'Estadio Atanasio Girardot',
    location: 'Cra. 74 #48010',
    price: 350000,
    availability: true,
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1200',
    category: categories.find(c => c.id === 'fpc')!,
    specs: {
      width: 1920,
      height: 96,
      resolution: 'HD',
      brightness: '6000 nits'
    },
    views: {
      daily: 45000,
      monthly: 180000
    },
    rating: 4.9,
    reviews: 89,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2447, lng: -75.5916 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEV_003',
      bundles: {
        hourly: { enabled: true, price: 200000, spots: 4 }
      }
    },
    metrics: {
      dailyTraffic: 35000,
      monthlyTraffic: 140000,
      averageEngagement: 95
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  }
];

export const sportEvents: SportEvent[] = [
  {
    id: '1',
    homeTeam: 'Atlético Nacional',
    awayTeam: 'Independiente Medellín',
    date: '2024-04-15',
    stadium: 'Estadio Atanasio Girardot',
    screens: screens.filter(screen => screen.id === '3'),
    price: 2500000,
    time: '19:30',
    city: 'Medellín'
  },
  {
    id: '2',
    homeTeam: 'Millonarios',
    awayTeam: 'América de Cali',
    date: '2024-04-20',
    stadium: 'El Campín',
    screens: screens.filter(screen => screen.id === '1'),
    price: 2000000,
    time: '17:00',
    city: 'Bogotá'
  }
];