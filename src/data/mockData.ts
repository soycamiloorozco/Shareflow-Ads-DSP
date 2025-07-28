import { Screen, SportEvent, ScreenCategory, CircuitScreen } from '../types';

// Update categories to match the ones used in Marketplace
export const categories: ScreenCategory[] = [
  { id: 'all', name: 'Todas', emoji: '🌍', description: 'Todos los tipos', count: 0 },
  { id: 'billboard', name: 'Vallas Digitales', emoji: '🖥️', description: 'Pantallas en exteriores', count: 0 },
  { id: 'mall', name: 'Centros Comerciales', emoji: '🏢', description: 'Pantallas en centros comerciales', count: 0 },
  { id: 'airport', name: 'Aeropuertos', emoji: '✈️', description: 'Pantallas en aeropuertos', count: 0 },
  { id: 'transport', name: 'Transporte', emoji: '🚌', description: 'Pantallas en sistemas de transporte', count: 0 },
  { id: 'stadium', name: 'Estadios', emoji: '🏟️', description: 'Pantallas en estadios', count: 0 },
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
  // Billboard screens
  {
    id: 'screen-billboard-1',
    name: 'Gran Valla Digital Av. Poblado',
    location: 'Av. El Poblado, Medellín',
    price: 350000,
    availability: true,
    image: '/screens_photos/975-5f4a89759e479.jpg',
    images: [
      '/screens_photos/975-5f4a89759e479.jpg',
      '/screens_photos/976-5f4a82cd6c675.jpg',
      '/screens_photos/1165-5f4a8a6115516.jpg'
    ],
    category: categories.find(c => c.id === 'billboard')!,
    environment: 'outdoor',
    specs: {
      width: 1280,
      height: 720,
      resolution: '2K',
      brightness: '7000 nits'
    },
    views: {
      daily: 85000,
      monthly: 2550000
    },
    rating: 4.7,
    reviews: 118,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2105, lng: -75.5725 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEV_B001',
      bundles: {
        hourly: { enabled: true, price: 200000, spots: 4 },
        daily: { enabled: true, price: 800000, spots: 24 },
        weekly: { enabled: true, price: 3500000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 35000,
      monthlyTraffic: 1050000,
      averageEngagement: 78
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'screen-billboard-2',
    name: 'Valla Premium Av. Libertadores',
    location: 'Av. Libertadores, Bogotá',
    price: 450000,
    availability: true,
    image: '/screens_photos/1711-63233b19f0faf.jpg',
    images: [
      '/screens_photos/1711-63233b19f0faf.jpg',
      '/screens_photos/3592-6526fc021ea36.jpg',
      '/screens_photos/4258-62449ffd66411.jpg',
      '/screens_photos/4259-6244acaed1384.jpg'
    ],
    category: categories.find(c => c.id === 'billboard')!,
    environment: 'outdoor',
    specs: {
      width: 1920,
      height: 1080,
      resolution: '4K',
      brightness: '8000 nits'
    },
    views: {
      daily: 120000,
      monthly: 3600000
    },
    rating: 4.9,
    reviews: 135,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6097, lng: -74.0817 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEV_B002',
      bundles: {
        hourly: { enabled: true, price: 250000, spots: 4 },
        daily: { enabled: true, price: 1000000, spots: 24 },
        weekly: { enabled: true, price: 4200000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 45000,
      monthlyTraffic: 1350000,
      averageEngagement: 82
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  
  // Mall screens
  {
    id: 'screen-mall-1',
    name: 'El Poblado Plaza',
    location: 'Calle 10 #43D-12, Medellín',
    price: 250000,
    availability: true,
    image: '/screens_photos/9007-639a2c4721253.jpg',
    images: [
      '/screens_photos/9007-639a2c4721253.jpg',
      '/screens_photos/14373-6123414240662.jpg',
      '/screens_photos/24147-6543ae2a3400f.jpg'
    ],
    category: categories.find(c => c.id === 'mall')!,
    environment: 'indoor',
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
      allowMoments: false,
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
    id: 'screen-mall-2',
    name: 'Santafé Mall Circuit',
    location: 'Cra. 43A #7 Sur-170, Medellín',
    price: 450000,
    availability: true,
    image: '/screens_photos/60585-667efb6b32fdf.jpg',
    images: [
      '/screens_photos/60585-667efb6b32fdf.jpg',
      '/screens_photos/60604-667f135013727.jpg',
      '/screens_photos/975-5f4a89759e479.jpg',
      '/screens_photos/976-5f4a82cd6c675.jpg',
      '/screens_photos/1165-5f4a8a6115516.jpg'
    ],
    category: categories.find(c => c.id === 'mall')!,
    environment: 'indoor',
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
      allowMoments: false,
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
  
  // Airport screens
  {
    id: 'screen-airport-1',
    name: 'Aeropuerto El Dorado Terminal 1',
    location: 'Terminal 1, Aeropuerto El Dorado, Bogotá',
    price: 550000,
    availability: true,
    image: '/screens_photos/14373-6123414240662.jpg',
    category: categories.find(c => c.id === 'airport')!,
    environment: 'indoor',
    specs: {
      width: 3840,
      height: 2160,
      resolution: '8K',
      brightness: '6000 nits'
    },
    views: {
      daily: 95000,
      monthly: 2850000
    },
    rating: 4.9,
    reviews: 189,
    isPartOfCircuit: false,
    coordinates: { lat: 4.7016, lng: -74.1469 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEV_A001',
      bundles: {
        hourly: { enabled: true, price: 300000, spots: 4 },
        daily: { enabled: true, price: 1500000, spots: 24 },
        weekly: { enabled: true, price: 6500000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 42000,
      monthlyTraffic: 1260000,
      averageEngagement: 90
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'screen-airport-2',
    name: 'Aeropuerto JMC Zona Internacional',
    location: 'Zona Internacional, Aeropuerto José María Córdova, Rionegro',
    price: 480000,
    availability: false,
    image: '/screens_photos/24147-6543ae2a3400f.jpg',
    category: categories.find(c => c.id === 'airport')!,
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
    rating: 4.7,
    reviews: 142,
    isPartOfCircuit: false,
    coordinates: { lat: 6.1642, lng: -75.4233 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEV_A002',
      bundles: {
        hourly: { enabled: true, price: 280000, spots: 4 },
        daily: { enabled: true, price: 1300000, spots: 24 },
        weekly: { enabled: true, price: 5800000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 32000,
      monthlyTraffic: 960000,
      averageEngagement: 88
    },
    operatingHours: {
      start: '05:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  
  // Transport screens
  {
    id: 'screen-transport-1',
    name: 'Estación Transmilenio Calle 100',
    location: 'Calle 100 con Autopista Norte, Bogotá',
    price: 180000,
    availability: true,
    image: '/screens_photos/3592-6526fc021ea36.jpg',
    category: categories.find(c => c.id === 'transport')!,
    environment: 'outdoor',
    specs: {
      width: 1920,
      height: 1080,
      resolution: '4K',
      brightness: '5000 nits'
    },
    views: {
      daily: 85000,
      monthly: 2550000
    },
    rating: 4.5,
    reviews: 98,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6021, lng: -74.0721 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEV_T001',
      bundles: {
        hourly: { enabled: true, price: 120000, spots: 4 },
        daily: { enabled: true, price: 400000, spots: 24 },
        weekly: { enabled: true, price: 2000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 65000,
      monthlyTraffic: 1950000,
      averageEngagement: 75
    },
    operatingHours: {
      start: '05:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'screen-transport-2',
    name: 'Estación Metro Poblado',
    location: 'Estación Metro El Poblado, Medellín',
    price: 160000,
    availability: true,
    image: '/screens_photos/4259-6244acaed1384.jpg',
    category: categories.find(c => c.id === 'transport')!,
    environment: 'indoor',
    specs: {
      width: 1280,
      height: 720,
      resolution: '2K',
      brightness: '4500 nits'
    },
    views: {
      daily: 70000,
      monthly: 2100000
    },
    rating: 4.6,
    reviews: 87,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2109, lng: -75.5689 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEV_T002',
      bundles: {
        hourly: { enabled: true, price: 100000, spots: 4 },
        daily: { enabled: true, price: 350000, spots: 24 },
        weekly: { enabled: true, price: 1800000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 55000,
      monthlyTraffic: 1650000,
      averageEngagement: 72
    },
    operatingHours: {
      start: '04:30',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  
  // Stadium screens
  {
    id: 'screen-stadium-1',
    name: 'Estadio Atanasio Girardot',
    location: 'Cra. 74 #48010, Medellín',
    price: 350000,
    availability: true,
    image: '/screens_photos/60604-667f135013727.jpg',
    category: categories.find(c => c.id === 'stadium')!,
    environment: 'outdoor',
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
  },
  {
    id: 'screen-stadium-2',
    name: 'Estadio El Campín',
    location: 'Cra. 30 entre Calles 57 y 53, Bogotá',
    price: 380000,
    availability: true,
    image: '/screens_photos/1165-5f4a8a6115516.jpg',
    category: categories.find(c => c.id === 'stadium')!,
    environment: 'outdoor',
    specs: {
      width: 2048,
      height: 128,
      resolution: 'HD+',
      brightness: '7000 nits'
    },
    views: {
      daily: 50000,
      monthly: 200000
    },
    rating: 4.8,
    reviews: 95,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6451, lng: -74.0785 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEV_S001',
      bundles: {
        hourly: { enabled: true, price: 220000, spots: 4 }
      }
    },
    metrics: {
      dailyTraffic: 40000,
      monthlyTraffic: 160000,
      averageEngagement: 93
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'screen-stadium-3',
    name: 'Estadio Metropolitano',
    location: 'Cra. 46 #40-02, Barranquilla',
    price: 320000,
    availability: true,
    image: '/screens_photos/4258-62449ffd66411.jpg',
    category: categories.find(c => c.id === 'stadium')!,
    environment: 'outdoor',
    specs: {
      width: 1792,
      height: 112,
      resolution: 'HD',
      brightness: '6500 nits'
    },
    views: {
      daily: 42000,
      monthly: 168000
    },
    rating: 4.7,
    reviews: 82,
    isPartOfCircuit: false,
    coordinates: { lat: 11.0007, lng: -74.7873 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEV_S002',
      bundles: {
        hourly: { enabled: true, price: 180000, spots: 4 }
      }
    },
    metrics: {
      dailyTraffic: 32000,
      monthlyTraffic: 128000,
      averageEngagement: 91
    },
    operatingHours: {
      start: '00:00',
      end: '23:59',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  }
];

// Update category counts based on screens
categories.forEach(category => {
  if (category.id !== 'all') {
    category.count = screens.filter(screen => screen.category.id === category.id).length;
  } else {
    category.count = screens.length;
  }
});

export const sportEvents: SportEvent[] = [
  {
    id: '1',
    homeTeam: 'Atlético Nacional',
    awayTeam: 'Independiente Medellín',
    date: '2024-04-15',
    stadium: 'Estadio Atanasio Girardot',
    screens: screens.filter(screen => screen.name === 'Estadio Atanasio Girardot'),
    price: 2500000,
    time: '19:30',
    city: 'Medellín',
    momentPricing: {
      firstHalf: 2500000,
      halftime: 1800000,
      secondHalf: 2500000
    },
    status: 'scheduled',
    capacity: 45000,
    estimatedAttendance: 40000,
    estimatedTvAudience: 1200000,
    broadcastChannels: ['Win Sports+', 'RCN'],
    maxMoments: 20,
    active: true,
    soldMoments: 8,
    league: 'Liga Colombiana'
  },
  {
    id: '2',
    homeTeam: 'Millonarios',
    awayTeam: 'América de Cali',
    date: '2024-04-20',
    stadium: 'El Campín',
    screens: screens.filter(screen => screen.name === 'Estadio El Campín'),
    price: 2000000,
    time: '17:00',
    city: 'Bogotá',
    momentPricing: {
      firstHalf: 2000000,
      halftime: 1500000,
      secondHalf: 2000000
    },
    status: 'scheduled',
    capacity: 36000,
    estimatedAttendance: 30000,
    estimatedTvAudience: 950000,
    broadcastChannels: ['Win Sports+'],
    maxMoments: 15,
    active: true,
    soldMoments: 12,
    league: 'Liga Colombiana'
  },
  {
    id: '3',
    homeTeam: 'Junior',
    awayTeam: 'Deportivo Cali',
    date: '2024-04-25',
    stadium: 'Estadio Metropolitano',
    screens: screens.filter(screen => screen.name === 'Estadio Metropolitano'),
    price: 1800000,
    time: '20:00',
    city: 'Barranquilla',
    momentPricing: {
      firstHalf: 1800000,
      halftime: 1200000,
      secondHalf: 1800000
    },
    status: 'scheduled',
    capacity: 38000,
    estimatedAttendance: 32000,
    estimatedTvAudience: 850000,
    broadcastChannels: ['Win Sports+'],
    maxMoments: 18,
    active: true,
    soldMoments: 5,
    league: 'Liga Colombiana'
  },
  {
    id: '4',
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    date: '2024-04-18',
    stadium: 'Camp Nou',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 5000000,
    time: '20:45',
    city: 'Barcelona',
    momentPricing: {
      firstHalf: 5000000,
      halftime: 3800000,
      secondHalf: 5000000
    },
    status: 'scheduled',
    capacity: 99000,
    estimatedAttendance: 95000,
    estimatedTvAudience: 100000000,
    broadcastChannels: ['ESPN', 'DAZN', 'Movistar+'],
    maxMoments: 30,
    active: true,
    soldMoments: 27,
    league: 'LaLiga'
  },
  {
    id: '5',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    date: '2024-04-22',
    stadium: 'Etihad Stadium',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 4800000,
    time: '16:30',
    city: 'Manchester',
    momentPricing: {
      firstHalf: 4800000,
      halftime: 3500000,
      secondHalf: 4800000
    },
    status: 'scheduled',
    capacity: 55000,
    estimatedAttendance: 54000,
    estimatedTvAudience: 75000000,
    broadcastChannels: ['Sky Sports', 'BT Sport'],
    maxMoments: 25,
    active: true,
    soldMoments: 20,
    league: 'Premier'
  },
  {
    id: '6',
    homeTeam: 'Bayern Munich',
    awayTeam: 'PSG',
    date: '2024-04-16',
    stadium: 'Allianz Arena',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 5500000,
    time: '21:00',
    city: 'Munich',
    momentPricing: {
      firstHalf: 5500000,
      halftime: 4200000,
      secondHalf: 5500000
    },
    status: 'scheduled',
    capacity: 75000,
    estimatedAttendance: 72000,
    estimatedTvAudience: 120000000,
    broadcastChannels: ['UEFA TV', 'beIN Sports'],
    maxMoments: 35,
    active: true,
    soldMoments: 30,
    league: 'Champions'
  },
  {
    id: '7',
    homeTeam: 'Santa Fe',
    awayTeam: 'Millonarios',
    date: '2024-04-28',
    stadium: 'El Campín',
    screens: screens.filter(screen => screen.name === 'Estadio El Campín'),
    price: 2200000,
    time: '19:00',
    city: 'Bogotá',
    momentPricing: {
      firstHalf: 2200000,
      halftime: 1700000,
      secondHalf: 2200000
    },
    status: 'scheduled',
    capacity: 36000,
    estimatedAttendance: 35000,
    estimatedTvAudience: 1000000,
    broadcastChannels: ['Win Sports+'],
    maxMoments: 18,
    active: true,
    soldMoments: 15,
    league: 'Liga Colombiana'
  },
  {
    id: '8',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    date: '2024-04-30',
    stadium: 'Santiago Bernabéu',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 6000000,
    time: '21:00',
    city: 'Madrid',
    momentPricing: {
      firstHalf: 6000000,
      halftime: 4500000,
      secondHalf: 6000000
    },
    status: 'scheduled',
    capacity: 81000,
    estimatedAttendance: 80000,
    estimatedTvAudience: 150000000,
    broadcastChannels: ['UEFA TV', 'Movistar+', 'BT Sport'],
    maxMoments: 40,
    active: true,
    soldMoments: 38,
    league: 'Champions'
  },
  {
    id: '9',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    date: '2024-05-02',
    stadium: 'Emirates Stadium',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 4200000,
    time: '17:30',
    city: 'London',
    momentPricing: {
      firstHalf: 4200000,
      halftime: 3000000,
      secondHalf: 4200000
    },
    status: 'scheduled',
    capacity: 60000,
    estimatedAttendance: 58000,
    estimatedTvAudience: 65000000,
    broadcastChannels: ['Sky Sports', 'BBC'],
    maxMoments: 22,
    active: true,
    soldMoments: 18,
    league: 'Premier'
  },
  {
    id: '10',
    homeTeam: 'Atlético Madrid',
    awayTeam: 'Sevilla',
    date: '2024-05-05',
    stadium: 'Wanda Metropolitano',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 3800000,
    time: '18:30',
    city: 'Madrid',
    momentPricing: {
      firstHalf: 3800000,
      halftime: 2500000,
      secondHalf: 3800000
    },
    status: 'scheduled',
    capacity: 68000,
    estimatedAttendance: 62000,
    estimatedTvAudience: 45000000,
    broadcastChannels: ['LaLiga TV', 'Movistar+'],
    maxMoments: 20,
    active: true,
    soldMoments: 12,
    league: 'LaLiga'
  },
  {
    id: '11',
    homeTeam: 'Once Caldas',
    awayTeam: 'Atlético Nacional',
    date: '2024-05-08',
    stadium: 'Estadio Palogrande',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 1700000,
    time: '20:15',
    city: 'Manizales',
    momentPricing: {
      firstHalf: 1700000,
      halftime: 1200000,
      secondHalf: 1700000
    },
    status: 'scheduled',
    capacity: 30000,
    estimatedAttendance: 25000,
    estimatedTvAudience: 800000,
    broadcastChannels: ['Win Sports+'],
    maxMoments: 16,
    active: true,
    soldMoments: 9,
    league: 'Liga Colombiana'
  },
  {
    id: '12',
    homeTeam: 'Juventus',
    awayTeam: 'Inter Milan',
    date: '2024-05-12',
    stadium: 'Allianz Stadium',
    screens: screens.filter(screen => screen.category.id === 'stadium'),
    price: 4500000,
    time: '20:45',
    city: 'Turin',
    momentPricing: {
      firstHalf: 4500000,
      halftime: 3200000,
      secondHalf: 4500000
    },
    status: 'scheduled',
    capacity: 41000,
    estimatedAttendance: 40000,
    estimatedTvAudience: 60000000,
    broadcastChannels: ['Sky Italia', 'DAZN'],
    maxMoments: 24,
    active: true,
    soldMoments: 19,
    league: 'Champions'
  }
];