/**
 * SHAREFLOW VENUE TAXONOMY & AI CLASSIFICATION SYSTEM
 * Sistema completo de categorización de venues para LATAM
 * Compatible con OpenOOH Standard v1.2.0, Broadsign, LatinAd y otros sistemas CMS
 */

// ==========================================
// 1. TIPOS BASE - OpenOOH Standard v1.2.0
// ==========================================

// Parent Categories según OpenOOH Standard
export type VenueParentCategory = 
  | 'transit'          // ID: 1 - Transporte y movilidad
  | 'retail'           // ID: 2 - Comercio y retail  
  | 'outdoor'          // ID: 3 - Espacios exteriores
  | 'health_beauty'    // ID: 4 - Salud y belleza
  | 'point_of_care'    // ID: 5 - Punto de atención médica
  | 'education'        // ID: 6 - Educación
  | 'office_buildings' // ID: 7 - Edificios de oficinas
  | 'leisure'          // ID: 8 - Entretenimiento y ocio
  | 'government'       // ID: 9 - Espacios gubernamentales
  | 'financial'        // ID: 10 - Servicios financieros
  | 'residential';     // ID: 11 - Espacios residenciales

// Child Categories según OpenOOH Standard
export type VenueChildCategory = 
  // Transit (1xx)
  | 'airports'             // 101
  | 'buses'                // 102
  | 'taxi_rideshare_tv'    // 103
  | 'taxi_rideshare_top'   // 104
  | 'subway'               // 105
  | 'train_stations'       // 106
  | 'ferry'                // 107
  
  // Retail (2xx)
  | 'fueling_stations'     // 201
  | 'convenience_stores'   // 202
  | 'grocery'              // 203
  | 'liquor_stores'        // 204
  | 'mall'                 // 205
  | 'cannabis_dispensaries'// 206
  | 'pharmacies'           // 207
  | 'parking_garages'      // 208
  
  // Outdoor (3xx)
  | 'billboards'           // 301
  | 'urban_panels'         // 302
  | 'bus_shelters'         // 303
  
  // Health & Beauty (4xx)
  | 'gyms'                 // 401
  | 'salons'               // 402
  | 'spas'                 // 403
  
  // Point of Care (5xx)
  | 'doctors_offices'      // 501
  | 'veterinary_offices'   // 502
  
  // Education (6xx)
  | 'schools'              // 601
  | 'colleges_universities'// 602
  
  // Office Buildings (7xx)
  | 'office_buildings'     // 701
  
  // Leisure (8xx)
  | 'recreational_locations' // 801
  | 'movie_theaters'       // 802
  | 'sports_entertainment' // 803
  | 'bars'                 // 804
  | 'casual_dining'        // 805
  | 'qsr'                  // 806
  | 'hotels'               // 807
  | 'golf_carts'           // 808
  | 'night_clubs'          // 809
  | 'high_end_dining'      // 810
  
  // Government (9xx)
  | 'dmvs'                 // 901
  | 'military_bases'       // 902
  | 'post_offices'         // 903
  
  // Financial (10xx)
  | 'banks'                // 1001
  
  // Residential (11xx)
  | 'apartment_buildings_condominiums'; // 1101

export type AudienceType = 
  | 'families' | 'young_adults' | 'professionals' | 'students' | 'tourists'
  | 'commuters' | 'shoppers' | 'patients' | 'travelers' | 'residents'
  | 'drivers' | 'pedestrians' | 'athletes' | 'seniors' | 'children';

export type DwellTime = 
  | 'very_short'    // < 30 segundos (semáforos, escaleras)
  | 'short'         // 30 segundos - 2 minutos (pasillos, entradas)
  | 'medium'        // 2 - 15 minutos (salas de espera, food courts)
  | 'long'          // 15 - 60 minutos (restaurantes, clínicas)
  | 'very_long';    // > 60 minutos (hoteles, hospitales)

export type EnvironmentType = 
  | 'indoor_controlled'     // Interior con clima controlado
  | 'indoor_semi_open'      // Interior semi-abierto (centros comerciales abiertos)
  | 'outdoor_covered'       // Exterior cubierto (paradas de bus)
  | 'outdoor_exposed';      // Exterior completamente expuesto

// ==========================================
// 2. INTERFACES PRINCIPALES
// ==========================================

export interface VenueCategory {
  parent: VenueParentCategory;
  child: VenueChildCategory;
  
  // OpenOOH Standard IDs
  openoohParentId: number;
  openoohChildId: number;
  
  // Características de audiencia
  audienceTypes: AudienceType[];
  dwellTime: DwellTime;
  environment: EnvironmentType;
  
  // Características técnicas
  recommendedSizes: string[];
  typicalBrightness: string;
  weatherResistance?: 'none' | 'partial' | 'full';
  
  // Machine Learning Features
  mlFeatures: MLFeatures;
  
  // Metadatos
  confidence: number; // 0.0 - 1.0
  lastUpdated: string;
}

export interface MLFeatures {
  // Keywords en español e inglés
  primaryKeywords: string[];
  secondaryKeywords: string[];
  contextKeywords: string[];
  
  // Patrones de texto
  namePatterns: RegExp[];
  descriptionPatterns: RegExp[];
  
  // Características numéricas
  avgFootTraffic: number;
  peakHours: string[];
  seasonalVariation: number; // 0.0 - 1.0
  
  // Características de negocio
  businessTypes: string[];
  nearbyPOIs: string[];
}

// ==========================================
// 3. TAXONOMÍA SIMPLIFICADA PARA UI
// ==========================================

export const VENUE_CATEGORIES: Record<string, VenueCategory> = {
  // RETAIL
  'retail_mall': {
    parent: 'retail',
    child: 'mall',
    openoohParentId: 2,
    openoohChildId: 205,
    audienceTypes: ['families', 'shoppers', 'young_adults'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"', '85"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['centro comercial', 'mall', 'shopping center', 'plaza comercial'],
      secondaryKeywords: ['tiendas', 'stores', 'retail', 'comercio', 'shopping'],
      contextKeywords: ['food court', 'escaleras', 'entrada principal', 'parqueadero'],
      namePatterns: [
        /centro\s+comercial/i,
        /shopping\s+center/i,
        /mall/i,
        /plaza\s+comercial/i
      ],
      descriptionPatterns: [
        /tiendas/i,
        /retail/i,
        /comercio/i,
        /shopping/i
      ],
      avgFootTraffic: 15000,
      peakHours: ['11:00-13:00', '18:00-21:00'],
      seasonalVariation: 0.3,
      businessTypes: ['retail', 'food', 'entertainment', 'services'],
      nearbyPOIs: ['parking', 'restaurants', 'cinema', 'banks']
    },
    confidence: 0.95,
    lastUpdated: '2024-01-15'
  },

  'retail_grocery': {
    parent: 'retail',
    child: 'grocery',
    openoohParentId: 2,
    openoohChildId: 203,
    audienceTypes: ['families', 'residents', 'shoppers'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['supermercado', 'grocery', 'supermarket', 'alimentación'],
      secondaryKeywords: ['comida', 'food', 'fresh', 'fresco', 'market'],
      contextKeywords: ['checkout', 'caja', 'aisles', 'pasillos', 'produce'],
      namePatterns: [
        /supermercado/i,
        /supermarket/i,
        /grocery/i,
        /market/i
      ],
      descriptionPatterns: [
        /food/i,
        /comida/i,
        /fresh/i,
        /fresco/i
      ],
      avgFootTraffic: 5000,
      peakHours: ['10:00-12:00', '17:00-19:00'],
      seasonalVariation: 0.15,
      businessTypes: ['retail', 'food'],
      nearbyPOIs: ['residential', 'parking', 'pharmacy']
    },
    confidence: 0.92,
    lastUpdated: '2024-01-15'
  },

  // TRANSIT
  'transit_airports': {
    parent: 'transit',
    child: 'airports',
    openoohParentId: 1,
    openoohChildId: 101,
    audienceTypes: ['travelers', 'tourists', 'professionals'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"', '85"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['aeropuerto', 'airport', 'terminal', 'vuelo', 'flight'],
      secondaryKeywords: ['departure', 'arrival', 'gate', 'baggage', 'equipaje'],
      contextKeywords: ['check-in', 'security', 'boarding', 'customs', 'duty-free'],
      namePatterns: [
        /aeropuerto/i,
        /airport/i,
        /terminal/i,
        /internacional/i
      ],
      descriptionPatterns: [
        /vuelo/i,
        /flight/i,
        /departure/i,
        /arrival/i
      ],
      avgFootTraffic: 25000,
      peakHours: ['06:00-09:00', '17:00-20:00'],
      seasonalVariation: 0.4,
      businessTypes: ['transportation', 'retail', 'food', 'services'],
      nearbyPOIs: ['hotels', 'car_rental', 'parking', 'public_transport']
    },
    confidence: 0.95,
    lastUpdated: '2024-01-15'
  },

  'transit_buses': {
    parent: 'transit',
    child: 'buses',
    openoohParentId: 1,
    openoohChildId: 102,
    audienceTypes: ['commuters', 'students', 'residents'],
    dwellTime: 'medium',
    environment: 'indoor_semi_open',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '800-1200 nits',
    weatherResistance: 'partial',
    mlFeatures: {
      primaryKeywords: ['bus', 'autobús', 'transporte público', 'public transport'],
      secondaryKeywords: ['terminal', 'station', 'route', 'ruta'],
      contextKeywords: ['passengers', 'pasajeros', 'schedule', 'horario'],
      namePatterns: [
        /bus/i,
        /autobús/i,
        /terminal/i,
        /transporte/i
      ],
      descriptionPatterns: [
        /público/i,
        /transport/i,
        /route/i,
        /ruta/i
      ],
      avgFootTraffic: 8000,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.2,
      businessTypes: ['transportation'],
      nearbyPOIs: ['metro_stations', 'commercial_areas', 'residential']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  // OUTDOOR
  'outdoor_billboards': {
    parent: 'outdoor',
    child: 'billboards',
    openoohParentId: 3,
    openoohChildId: 301,
    audienceTypes: ['drivers', 'pedestrians', 'commuters'],
    dwellTime: 'very_short',
    environment: 'outdoor_exposed',
    recommendedSizes: ['14x48ft', '20x60ft', '30x90ft'],
    typicalBrightness: '5000-8000 nits',
    weatherResistance: 'full',
    mlFeatures: {
      primaryKeywords: ['billboard', 'valla', 'publicidad exterior', 'outdoor advertising'],
      secondaryKeywords: ['highway', 'carretera', 'road', 'street', 'calle'],
      contextKeywords: ['traffic', 'tráfico', 'visibility', 'visibilidad'],
      namePatterns: [
        /billboard/i,
        /valla/i,
        /outdoor/i,
        /exterior/i
      ],
      descriptionPatterns: [
        /highway/i,
        /carretera/i,
        /road/i,
        /street/i
      ],
      avgFootTraffic: 50000,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.1,
      businessTypes: ['advertising'],
      nearbyPOIs: ['highways', 'major_roads', 'intersections']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  },

  // LEISURE
  'leisure_hotels': {
    parent: 'leisure',
    child: 'hotels',
    openoohParentId: 8,
    openoohChildId: 807,
    audienceTypes: ['tourists', 'travelers', 'professionals'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['hotel', 'resort', 'accommodation', 'hospedaje'],
      secondaryKeywords: ['lobby', 'reception', 'guests', 'huéspedes'],
      contextKeywords: ['check-in', 'elevator', 'rooms', 'habitaciones'],
      namePatterns: [
        /hotel/i,
        /resort/i,
        /inn/i,
        /lodge/i
      ],
      descriptionPatterns: [
        /accommodation/i,
        /hospedaje/i,
        /guests/i,
        /huéspedes/i
      ],
      avgFootTraffic: 2000,
      peakHours: ['08:00-10:00', '18:00-22:00'],
      seasonalVariation: 0.5,
      businessTypes: ['hospitality', 'tourism'],
      nearbyPOIs: ['restaurants', 'attractions', 'transportation']
    },
    confidence: 0.93,
    lastUpdated: '2024-01-15'
  },

  'leisure_movie_theaters': {
    parent: 'leisure',
    child: 'movie_theaters',
    openoohParentId: 8,
    openoohChildId: 802,
    audienceTypes: ['families', 'young_adults', 'families'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '300-500 nits',
    mlFeatures: {
      primaryKeywords: ['cine', 'cinema', 'movie theater', 'películas'],
      secondaryKeywords: ['movies', 'films', 'screening', 'proyección'],
      contextKeywords: ['lobby', 'concessions', 'tickets', 'boletos'],
      namePatterns: [/cine/i, /cinema/i, /movie/i],
      descriptionPatterns: [/movies/i, /films/i, /screening/i],
      avgFootTraffic: 3000,
      peakHours: ['18:00-22:00'],
      seasonalVariation: 0.3,
      businessTypes: ['entertainment'],
      nearbyPOIs: ['malls', 'restaurants', 'parking']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  // EDUCATION
  'education_colleges_universities': {
    parent: 'education',
    child: 'colleges_universities',
    openoohParentId: 6,
    openoohChildId: 602,
    audienceTypes: ['students', 'young_adults', 'professionals'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['universidad', 'university', 'college', 'campus'],
      secondaryKeywords: ['students', 'estudiantes', 'faculty', 'profesores'],
      contextKeywords: ['research', 'investigación', 'library', 'biblioteca'],
      namePatterns: [/universidad/i, /university/i, /college/i],
      descriptionPatterns: [/campus/i, /students/i, /faculty/i],
      avgFootTraffic: 5000,
      peakHours: ['08:00-10:00', '14:00-16:00'],
      seasonalVariation: 0.7,
      businessTypes: ['education'],
      nearbyPOIs: ['libraries', 'cafeterias', 'dormitories']
    },
    confidence: 0.93,
    lastUpdated: '2024-01-15'
  }
};

// ==========================================
// 4. UTILIDADES PARA UI
// ==========================================

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'retail_mall': 'Centros Comerciales',
  'retail_grocery': 'Supermercados',
  'transit_airports': 'Aeropuertos',
  'transit_buses': 'Terminales de Bus',
  'outdoor_billboards': 'Vallas Publicitarias',
  'leisure_hotels': 'Hoteles',
  'leisure_movie_theaters': 'Cines',
  'education_colleges_universities': 'Universidades'
};

export const CATEGORY_ICONS: Record<string, string> = {
  'retail_mall': '🏬',
  'retail_grocery': '🛒',
  'transit_airports': '✈️',
  'transit_buses': '🚌',
  'outdoor_billboards': '📺',
  'leisure_hotels': '🏨',
  'leisure_movie_theaters': '🎬',
  'education_colleges_universities': '🎓'
};

export const CITIES = [
  { id: 'bogota', name: 'Bogotá', count: 45 },
  { id: 'medellin', name: 'Medellín', count: 32 },
  { id: 'cali', name: 'Cali', count: 28 },
  { id: 'barranquilla', name: 'Barranquilla', count: 18 },
  { id: 'cartagena', name: 'Cartagena', count: 15 }
];

export const PRICE_RANGES = [
  { id: 'budget', label: 'Económico', min: 0, max: 500000, count: 0 },
  { id: 'mid-range', label: 'Medio', min: 500000, max: 1000000, count: 0 },
  { id: 'premium', label: 'Premium', min: 1000000, max: 2000000, count: 0 },
  { id: 'luxury', label: 'Lujo', min: 2000000, max: Infinity, count: 0 }
];

export const ENVIRONMENTS = [
  { id: 'indoor_controlled', label: 'Interior', icon: '🏢' },
  { id: 'indoor_semi_open', label: 'Semi-abierto', icon: '🏬' },
  { id: 'outdoor_covered', label: 'Exterior cubierto', icon: '🏛️' },
  { id: 'outdoor_exposed', label: 'Exterior', icon: '🌤️' }
];

export const AUDIENCE_TYPES = [
  { id: 'families', label: 'Familias', icon: '👨‍👩‍👧‍👦' },
  { id: 'young_adults', label: 'Jóvenes', icon: '👥' },
  { id: 'professionals', label: 'Profesionales', icon: '💼' },
  { id: 'students', label: 'Estudiantes', icon: '🎓' },
  { id: 'tourists', label: 'Turistas', icon: '🧳' },
  { id: 'commuters', label: 'Viajeros', icon: '🚇' },
  { id: 'shoppers', label: 'Compradores', icon: '🛍️' }
];

// Alias para compatibilidad con código existente
export const VENUE_TAXONOMY = VENUE_CATEGORIES;

// OpenOOH IDs para compatibilidad
export const OPENOOH_PARENT_IDS: Record<VenueParentCategory, number> = {
  'transit': 1,
  'retail': 2,
  'outdoor': 3,
  'health_beauty': 4,
  'point_of_care': 5,
  'education': 6,
  'office_buildings': 7,
  'leisure': 8,
  'government': 9,
  'financial': 10,
  'residential': 11
};

export const OPENOOH_CHILD_IDS: Record<string, number> = {
  // Transit
  'airports': 101,
  'buses': 102,
  'taxi_rideshare_tv': 103,
  'taxi_rideshare_top': 104,
  'subway': 105,
  'train_stations': 106,
  'ferry': 107,
  // Retail
  'fueling_stations': 201,
  'convenience_stores': 202,
  'grocery': 203,
  'liquor_stores': 204,
  'mall': 205,
  'cannabis_dispensaries': 206,
  'pharmacies': 207,
  'parking_garages': 208,
  // Outdoor
  'billboards': 301,
  'urban_panels': 302,
  'bus_shelters': 303,
  // Health & Beauty
  'gyms': 401,
  'salons': 402,
  'spas': 403,
  // Point of Care
  'doctors_offices': 501,
  'veterinary_offices': 502,
  // Education
  'schools': 601,
  'colleges_universities': 602,
  // Office Buildings
  'office_buildings': 701,
  // Leisure
  'recreational_locations': 801,
  'movie_theaters': 802,
  'sports_entertainment': 803,
  'bars': 804,
  'casual_dining': 805,
  'qsr': 806,
  'hotels': 807,
  'golf_carts': 808,
  'night_clubs': 809,
  'high_end_dining': 810,
  // Government
  'dmvs': 901,
  'military_bases': 902,
  'post_offices': 903,
  // Financial
  'banks': 1001,
  // Residential
  'apartment_buildings_condominiums': 1101
};

export const OPENOOH_GRANDCHILD_IDS: Record<string, number> = {};

// Tipos adicionales para compatibilidad
export type DwellTime = 
  | 'very_short'    // < 30 segundos
  | 'short'         // 30 segundos - 2 minutos
  | 'medium'        // 2 - 15 minutos
  | 'long'          // 15 - 60 minutos
  | 'very_long';    // > 60 minutos

// ==========================================
// 4. UTILIDADES
// ==========================================

export class VenueUtils {
  /**
   * Obtiene todas las categorías disponibles para UI
   */
  static getAllCategories() {
    return Object.entries(VENUE_CATEGORIES).map(([key, category]) => ({
      key: key,
      id: key,
      name: CATEGORY_DISPLAY_NAMES[key] || key,
      description: category.mlFeatures.primaryKeywords.join(', '),
      icon: CATEGORY_ICONS[key] || '📍',
      environment: category.environment,
      audienceTypes: category.audienceTypes,
      dwellTime: category.dwellTime,
      confidence: category.confidence,
      avgFootTraffic: category.mlFeatures.avgFootTraffic
    }));
  }
  
  /**
   * Filtra categorías por tipo de ambiente
   */
  static getCategoriesByEnvironment(environment: EnvironmentType) {
    return this.getAllCategories().filter(cat => cat.environment === environment);
  }
  
  /**
   * Filtra categorías por tipo de audiencia
   */
  static getCategoriesByAudience(audienceType: AudienceType) {
    return this.getAllCategories().filter(cat => 
      cat.audienceTypes.includes(audienceType)
    );
  }
  
  /**
   * Obtiene categorías recomendadas basadas en keywords
   */
  static getRecommendedCategories(keywords: string[], limit: number = 5) {
    const scores: Array<{ category: any; score: number }> = [];
    
    for (const category of this.getAllCategories()) {
      let score = 0;
      const categoryData = VENUE_CATEGORIES[category.id];
      
      for (const keyword of keywords) {
        if (categoryData.mlFeatures.primaryKeywords.some(k => 
          k.toLowerCase().includes(keyword.toLowerCase())
        )) {
          score += 3;
        }
        if (categoryData.mlFeatures.secondaryKeywords.some(k => 
          k.toLowerCase().includes(keyword.toLowerCase())
        )) {
          score += 2;
        }
      }
      
      if (score > 0) {
        scores.push({ category, score });
      }
    }
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.category);
  }
}

// ==========================================
// 5. CLASIFICADOR IA (Simplificado)
// ==========================================

export interface VenueClassificationRequest {
  name: string;
  description?: string;
  address?: string;
  type?: string;
  keywords?: string[];
  coordinates?: { lat: number; lng: number };
}

export interface VenueClassificationResult {
  category: {
    parent: VenueParentCategory;
    child: VenueChildCategory;
    grandChild?: string;
  };
  confidence: number;
  reasoning: string;
  extractedFeatures: string[];
  alternativeCategories: Array<{
    category: VenueCategory;
    confidence: number;
  }>;
}

export class VenueAIClassifier {
  /**
   * Clasifica un venue usando IA basada en características textuales
   */
  async classifyVenue(request: VenueClassificationRequest): Promise<VenueClassificationResult> {
    const text = `${request.name} ${request.description || ''} ${request.address || ''} ${request.type || ''}`.toLowerCase();
    const keywords = request.keywords || [];
    
    const scores: Array<{ category: VenueCategory; score: number; matches: string[] }> = [];
    
    // Evaluar cada categoría en la taxonomía
    for (const [key, category] of Object.entries(VENUE_CATEGORIES)) {
      let score = 0;
      const matches: string[] = [];
      
      // Evaluar keywords primarias (peso 3)
      for (const keyword of category.mlFeatures.primaryKeywords) {
        if (text.includes(keyword.toLowerCase()) || keywords.includes(keyword)) {
          score += 3;
          matches.push(keyword);
        }
      }
      
      // Evaluar keywords secundarias (peso 2)
      for (const keyword of category.mlFeatures.secondaryKeywords) {
        if (text.includes(keyword.toLowerCase()) || keywords.includes(keyword)) {
          score += 2;
          matches.push(keyword);
        }
      }
      
      if (score > 0) {
        scores.push({ category, score, matches });
      }
    }
    
    // Ordenar por score descendente
    scores.sort((a, b) => b.score - a.score);
    
    if (scores.length === 0) {
      // Fallback a retail_mall
      const fallbackCategory = VENUE_CATEGORIES['retail_mall'];
      return {
        category: {
          parent: fallbackCategory.parent,
          child: fallbackCategory.child
        },
        confidence: 0.5,
        reasoning: 'Clasificación por defecto - no se encontraron coincidencias específicas',
        extractedFeatures: [],
        alternativeCategories: []
      };
    }
    
    const bestMatch = scores[0];
    const maxPossibleScore = 10;
    const confidence = Math.min(bestMatch.score / maxPossibleScore, 1.0);
    
    return {
      category: {
        parent: bestMatch.category.parent,
        child: bestMatch.category.child
      },
      confidence,
      reasoning: `Clasificación basada en ${bestMatch.matches.length} coincidencias de keywords`,
      extractedFeatures: bestMatch.matches,
      alternativeCategories: scores.slice(1, 4).map(s => ({
        category: s.category,
        confidence: Math.min(s.score / maxPossibleScore, 1.0)
      }))
    };
  }
}