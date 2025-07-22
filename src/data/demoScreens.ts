import { Screen } from '../types';
import { screens as mockScreens, categories as mockCategories } from './mockData';

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

  // Additional screens for better section variety
  {
    id: 'demo-street-1',
    name: 'Pantalla LED - Avenida Caracas',
    location: 'Av. Caracas con Calle 72, Bogotá',
    price: 950000,
    availability: true,
    image: '/screens_photos/14373-6123414240662.jpg',
    category: mockCategories.find(c => c.id === 'billboard') || mockCategories[0],
    environment: 'outdoor',
    specs: {
      width: 3840,
      height: 2160,
      resolution: '4K',
      brightness: '7000 nits'
    },
    views: {
      daily: 72000,
      monthly: 2160000
    },
    rating: 4.7,
    reviews: 89,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6533, lng: -74.0653 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_ST001',
      bundles: {
        hourly: { enabled: true, price: 650000, spots: 4 },
        daily: { enabled: true, price: 3200000, spots: 24 },
        weekly: { enabled: true, price: 15000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 68000,
      monthlyTraffic: 2040000,
      averageEngagement: 91
    },
    operatingHours: {
      start: '06:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-university-1',
    name: 'Pantalla Campus - Universidad Nacional',
    location: 'Ciudad Universitaria, Bogotá',
    price: 420000,
    availability: true,
    image: '/screens_photos/4259-6244acaed1384.jpg',
    category: mockCategories.find(c => c.id === 'university') || mockCategories[0],
    environment: 'outdoor',
    specs: {
      width: 2560,
      height: 1440,
      resolution: '2K',
      brightness: '6500 nits'
    },
    views: {
      daily: 35000,
      monthly: 1050000
    },
    rating: 4.5,
    reviews: 67,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6356, lng: -74.0834 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_U001',
      bundles: {
        hourly: { enabled: true, price: 280000, spots: 4 },
        daily: { enabled: true, price: 1400000, spots: 24 },
        weekly: { enabled: true, price: 6500000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 32000,
      monthlyTraffic: 960000,
      averageEngagement: 87
    },
    operatingHours: {
      start: '07:00',
      end: '20:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    }
  },
  {
    id: 'demo-restaurant-1',
    name: 'Pantalla Digital - Zona T',
    location: 'Zona T, Bogotá',
    price: 850000,
    availability: true,
    image: '/screens_photos/60604-667f135013727.jpg',
    category: mockCategories.find(c => c.id === 'restaurant') || mockCategories[0],
    environment: 'outdoor',
    specs: {
      width: 1920,
      height: 1080,
      resolution: 'Full HD',
      brightness: '5500 nits'
    },
    views: {
      daily: 45000,
      monthly: 1350000
    },
    rating: 4.8,
    reviews: 73,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6698, lng: -74.0563 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_R001',
      bundles: {
        hourly: { enabled: true, price: 550000, spots: 4 },
        daily: { enabled: true, price: 2800000, spots: 24 },
        weekly: { enabled: true, price: 12000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 42000,
      monthlyTraffic: 1260000,
      averageEngagement: 89
    },
    operatingHours: {
      start: '11:00',
      end: '02:00',
      daysActive: ['Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-gym-1',
    name: 'Pantalla Fitness - Smart Fit Chapinero',
    location: 'Chapinero, Bogotá',
    price: 320000,
    availability: true,
    image: '/screens_photos/975-5f4a89759e479.jpg',
    category: mockCategories.find(c => c.id === 'gym') || mockCategories[0],
    environment: 'indoor',
    specs: {
      width: 1920,
      height: 1080,
      resolution: 'Full HD',
      brightness: '4000 nits'
    },
    views: {
      daily: 18000,
      monthly: 540000
    },
    rating: 4.4,
    reviews: 45,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6533, lng: -74.0653 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_G001',
      bundles: {
        hourly: { enabled: true, price: 200000, spots: 4 },
        daily: { enabled: true, price: 1000000, spots: 24 },
        weekly: { enabled: true, price: 4500000, spots: 168 },
        monthly: { enabled: true, price: 16000000, spots: 720 }
      }
    },
    metrics: {
      dailyTraffic: 16000,
      monthlyTraffic: 480000,
      averageEngagement: 83
    },
    operatingHours: {
      start: '05:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-hospital-1',
    name: 'Pantalla Informativa - Hospital San Ignacio',
    location: 'Cra. 7 #40-62, Bogotá',
    price: 280000,
    availability: true,
    image: '/screens_photos/1165-5f4a8a6115516.jpg',
    category: mockCategories.find(c => c.id === 'hospital') || mockCategories[0],
    environment: 'indoor',
    specs: {
      width: 1920,
      height: 1080,
      resolution: 'Full HD',
      brightness: '3500 nits'
    },
    views: {
      daily: 12000,
      monthly: 360000
    },
    rating: 4.3,
    reviews: 38,
    isPartOfCircuit: false,
    coordinates: { lat: 4.6285, lng: -74.0665 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_H001',
      bundles: {
        hourly: { enabled: true, price: 180000, spots: 4 },
        daily: { enabled: true, price: 900000, spots: 24 },
        weekly: { enabled: true, price: 4000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 11000,
      monthlyTraffic: 330000,
      averageEngagement: 78
    },
    operatingHours: {
      start: '06:00',
      end: '22:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-new-1',
    name: 'Pantalla Ultra HD - Nuevo Centro Comercial Titán Plaza',
    location: 'Av. Boyacá con Calle 80, Bogotá',
    price: 1100000,
    availability: true,
    image: '/screens_photos/24147-6543ae2a3400f.jpg',
    category: mockCategories.find(c => c.id === 'mall')!,
    environment: 'indoor',
    specs: {
      width: 7680,
      height: 4320,
      resolution: '8K',
      brightness: '6000 nits'
    },
    views: {
      daily: 38000,
      monthly: 1140000
    },
    rating: 4.9,
    reviews: 12, // New screen, fewer reviews
    isPartOfCircuit: false,
    coordinates: { lat: 4.6892, lng: -74.1236 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_NEW001',
      bundles: {
        hourly: { enabled: true, price: 750000, spots: 4 },
        daily: { enabled: true, price: 3800000, spots: 24 },
        weekly: { enabled: true, price: 17000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 35000,
      monthlyTraffic: 1050000,
      averageEngagement: 95
    },
    operatingHours: {
      start: '10:00',
      end: '22:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-new-2',
    name: 'Pantalla Interactiva - Nueva Plaza de Bolívar',
    location: 'Plaza de Bolívar, Bogotá',
    price: 1800000,
    availability: true,
    image: '/screens_photos/3592-6526fc021ea36.jpg',
    category: mockCategories.find(c => c.id === 'public') || mockCategories[0],
    environment: 'outdoor',
    specs: {
      width: 5120,
      height: 2880,
      resolution: '5K',
      brightness: '9500 nits'
    },
    views: {
      daily: 85000,
      monthly: 2550000
    },
    rating: 5.0,
    reviews: 8, // Very new screen
    isPartOfCircuit: false,
    coordinates: { lat: 4.5981, lng: -74.0758 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_NEW002',
      bundles: {
        hourly: { enabled: true, price: 1200000, spots: 4 },
        daily: { enabled: true, price: 6000000, spots: 24 }
      }
    },
    metrics: {
      dailyTraffic: 80000,
      monthlyTraffic: 2400000,
      averageEngagement: 98
    },
    operatingHours: {
      start: '06:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  // Medellín screens for geographic variety
  {
    id: 'demo-medellin-1',
    name: 'Pantalla Premium - Parque Lleras',
    location: 'Parque Lleras, El Poblado, Medellín',
    price: 1350000,
    availability: true,
    image: '/screens_photos/976-5f4a82cd6c675.jpg',
    category: mockCategories.find(c => c.id === 'entertainment') || mockCategories[0],
    environment: 'outdoor',
    specs: {
      width: 4096,
      height: 2304,
      resolution: '4K+',
      brightness: '8000 nits'
    },
    views: {
      daily: 65000,
      monthly: 1950000
    },
    rating: 4.8,
    reviews: 94,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2092, lng: -75.5665 },
    pricing: {
      allowMoments: true,
      deviceId: 'DEMO_MED001',
      bundles: {
        hourly: { enabled: true, price: 900000, spots: 4 },
        daily: { enabled: true, price: 4500000, spots: 24 },
        weekly: { enabled: true, price: 20000000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 60000,
      monthlyTraffic: 1800000,
      averageEngagement: 93
    },
    operatingHours: {
      start: '12:00',
      end: '03:00',
      daysActive: ['Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  {
    id: 'demo-medellin-2',
    name: 'Pantalla Metro - Estación Poblado',
    location: 'Estación Poblado, Metro de Medellín',
    price: 580000,
    availability: true,
    image: '/screens_photos/60604-667f135013727.jpg',
    category: mockCategories.find(c => c.id === 'transport')!,
    environment: 'indoor',
    specs: {
      width: 2560,
      height: 1440,
      resolution: '2K',
      brightness: '5000 nits'
    },
    views: {
      daily: 48000,
      monthly: 1440000
    },
    rating: 4.6,
    reviews: 71,
    isPartOfCircuit: false,
    coordinates: { lat: 6.2092, lng: -75.5665 },
    pricing: {
      allowMoments: false,
      deviceId: 'DEMO_MED002',
      bundles: {
        hourly: { enabled: true, price: 380000, spots: 4 },
        daily: { enabled: true, price: 1900000, spots: 24 },
        weekly: { enabled: true, price: 8500000, spots: 168 }
      }
    },
    metrics: {
      dailyTraffic: 45000,
      monthlyTraffic: 1350000,
      averageEngagement: 86
    },
    operatingHours: {
      start: '05:00',
      end: '23:00',
      daysActive: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  }
];

export default demoScreens;