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

// Grandchild Categories según OpenOOH Standard
export type VenueGrandChildCategory = 
  // Transit: Airports (101xx)
  | 'arrival_hall'         // 10101
  | 'baggage_claim'        // 10102
  | 'departures_hall'      // 10103
  | 'food_court_airport'   // 10104
  | 'gates'                // 10105
  | 'lounges'              // 10106
  | 'shopping_area_airport'// 10107
  
  // Transit: Buses (102xx)
  | 'bus_inside'           // 10201
  | 'bus_terminal'         // 10202
  | 'bus_outside'          // 10203
  
  // Transit: Subway (105xx)
  | 'subway_train'         // 10501
  | 'subway_platform'      // 10502
  
  // Transit: Train Stations (106xx)
  | 'train'                // 10601
  | 'train_platform'       // 10602
  
  // Retail: Fueling Stations (201xx)
  | 'fuel_dispenser'       // 20101
  | 'fueling_shop'         // 20102
  
  // Retail: Grocery (203xx)
  | 'shop_entrance'        // 20301
  | 'check_out'            // 20302
  | 'aisles'               // 20303
  
  // Retail: Malls (205xx)
  | 'concourse'            // 20501
  | 'food_court_mall'      // 20502
  | 'spectacular_mall'     // 20503
  
  // Outdoor: Billboards (301xx)
  | 'roadside'             // 30101
  | 'highway'              // 30102
  | 'spectacular_outdoor'  // 30103
  
  // Health & Beauty: Gyms (401xx)
  | 'gym_lobby'            // 40101
  | 'fitness_equipment'    // 40102
  
  // Health & Beauty: Salons (402xx)
  | 'unisex_salon'         // 40201
  | 'mens_salon'           // 40202
  | 'womens_salon'         // 40203
  
  // Education: Colleges and Universities (602xx)
  | 'residences'           // 60201
  | 'common_areas_edu'     // 60202
  | 'athletic_facilities'  // 60203
  
  // Office Buildings (701xx)
  | 'elevator_office'      // 70101
  | 'lobby_office'         // 70102
  
  // Leisure: Recreational Locations (801xx)
  | 'theme_parks'          // 80101
  | 'museums_galleries'    // 80102
  | 'concert_venues'       // 80103
  
  // Leisure: Movie Theaters (802xx)
  | 'theater_lobby'        // 80201
  | 'theater_food_court'   // 80202
  
  // Leisure: Sports Entertainment (803xx)
  | 'sport_arena'          // 80301
  | 'club_house'           // 80302
  
  // Leisure: Hotels (807xx)
  | 'hotel_lobby'          // 80701
  | 'hotel_elevator'       // 80702
  | 'hotel_room'           // 80703
  
  // Residential (1101xx)
  | 'residential_lobby'    // 110101
  | 'residential_elevator';// 110102

// OpenOOH Enumeration IDs
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

export const OPENOOH_CHILD_IDS: Record<VenueChildCategory, number> = {
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

export const OPENOOH_GRANDCHILD_IDS: Record<VenueGrandChildCategory, number> = {
  // Transit: Airports
  'arrival_hall': 10101,
  'baggage_claim': 10102,
  'departures_hall': 10103,
  'food_court_airport': 10104,
  'gates': 10105,
  'lounges': 10106,
  'shopping_area_airport': 10107,
  // Transit: Buses
  'bus_inside': 10201,
  'bus_terminal': 10202,
  'bus_outside': 10203,
  // Transit: Subway
  'subway_train': 10501,
  'subway_platform': 10502,
  // Transit: Train Stations
  'train': 10601,
  'train_platform': 10602,
  // Retail: Fueling Stations
  'fuel_dispenser': 20101,
  'fueling_shop': 20102,
  // Retail: Grocery
  'shop_entrance': 20301,
  'check_out': 20302,
  'aisles': 20303,
  // Retail: Malls
  'concourse': 20501,
  'food_court_mall': 20502,
  'spectacular_mall': 20503,
  // Outdoor: Billboards
  'roadside': 30101,
  'highway': 30102,
  'spectacular_outdoor': 30103,
  // Health & Beauty: Gyms
  'gym_lobby': 40101,
  'fitness_equipment': 40102,
  // Health & Beauty: Salons
  'unisex_salon': 40201,
  'mens_salon': 40202,
  'womens_salon': 40203,
  // Education: Colleges and Universities
  'residences': 60201,
  'common_areas_edu': 60202,
  'athletic_facilities': 60203,
  // Office Buildings
  'elevator_office': 70101,
  'lobby_office': 70102,
  // Leisure: Recreational Locations
  'theme_parks': 80101,
  'museums_galleries': 80102,
  'concert_venues': 80103,
  // Leisure: Movie Theaters
  'theater_lobby': 80201,
  'theater_food_court': 80202,
  // Leisure: Sports Entertainment
  'sport_arena': 80301,
  'club_house': 80302,
  // Leisure: Hotels
  'hotel_lobby': 80701,
  'hotel_elevator': 80702,
  'hotel_room': 80703,
  // Residential
  'residential_lobby': 110101,
  'residential_elevator': 110102
};

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
  grandChild?: VenueGrandChildCategory;
  
  // OpenOOH Standard IDs
  openoohParentId: number;
  openoohChildId: number;
  openoohGrandChildId?: number;
  
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
  
  // Mapeos externos
  broadsign?: BroadsignMapping;
  latinad?: LatinadMapping;
  
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
  
  // Geolocalización
  typicalCoordinates?: {
    lat: number;
    lng: number;
    radius: number; // metros
  };
  
  // Características de negocio
  businessTypes: string[];
  nearbyPOIs: string[];
}

export interface BroadsignMapping {
  venue_id: number;
  enumeration_id: string;
  category_name: string;
  venue_type: string;
}

export interface LatinadMapping {
  category_id: string;
  subcategory_id?: string;
  environment_type: 'indoor' | 'outdoor';
  audience_segment: string;
}

// ==========================================
// 3. TAXONOMÍA COMPLETA - OpenOOH Compatible
// ==========================================

export const VENUE_TAXONOMY: Record<string, VenueCategory> = {
  // ========== TRANSIT ==========
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

  // Airport Grandchild Categories
  'transit_airports_arrival_hall': {
    parent: 'transit',
    child: 'airports',
    grandChild: 'arrival_hall',
    openoohParentId: 1,
    openoohChildId: 101,
    openoohGrandChildId: 10101,
    audienceTypes: ['travelers', 'tourists', 'families'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['arrival hall', 'sala de llegadas', 'arrivals', 'llegadas'],
      secondaryKeywords: ['baggage', 'equipaje', 'customs', 'aduana', 'exit', 'salida'],
      contextKeywords: ['international', 'internacional', 'domestic', 'nacional'],
      namePatterns: [/arrival/i, /llegadas/i, /arrivals/i],
      descriptionPatterns: [/hall/i, /sala/i, /baggage/i, /equipaje/i],
      avgFootTraffic: 15000,
      peakHours: ['08:00-12:00', '18:00-22:00'],
      seasonalVariation: 0.4,
      businessTypes: ['transportation', 'services'],
      nearbyPOIs: ['baggage_claim', 'customs', 'ground_transport']
    },
    confidence: 0.92,
    lastUpdated: '2024-01-15'
  },

  'transit_airports_baggage_claim': {
    parent: 'transit',
    child: 'airports',
    grandChild: 'baggage_claim',
    openoohParentId: 1,
    openoohChildId: 101,
    openoohGrandChildId: 10102,
    audienceTypes: ['travelers', 'tourists', 'families'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['baggage claim', 'reclamo de equipaje', 'carousel', 'carrusel'],
      secondaryKeywords: ['luggage', 'equipaje', 'suitcase', 'maleta'],
      contextKeywords: ['belt', 'cinta', 'waiting', 'espera'],
      namePatterns: [/baggage/i, /equipaje/i, /carousel/i, /carrusel/i],
      descriptionPatterns: [/claim/i, /reclamo/i, /luggage/i, /maleta/i],
      avgFootTraffic: 12000,
      peakHours: ['09:00-13:00', '19:00-23:00'],
      seasonalVariation: 0.4,
      businessTypes: ['transportation'],
      nearbyPOIs: ['arrival_hall', 'customs', 'ground_transport']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  'transit_airports_departures_hall': {
    parent: 'transit',
    child: 'airports',
    grandChild: 'departures_hall',
    openoohParentId: 1,
    openoohChildId: 101,
    openoohGrandChildId: 10103,
    audienceTypes: ['travelers', 'tourists', 'professionals'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"', '85"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['departures hall', 'sala de salidas', 'departures', 'salidas'],
      secondaryKeywords: ['check-in', 'security', 'seguridad', 'gates', 'puertas'],
      contextKeywords: ['boarding', 'embarque', 'flight', 'vuelo'],
      namePatterns: [/departures/i, /salidas/i, /departure/i],
      descriptionPatterns: [/hall/i, /sala/i, /check-in/i, /security/i],
      avgFootTraffic: 20000,
      peakHours: ['05:00-09:00', '16:00-20:00'],
      seasonalVariation: 0.4,
      businessTypes: ['transportation', 'retail', 'food'],
      nearbyPOIs: ['check-in', 'security', 'gates', 'shops']
    },
    confidence: 0.95,
    lastUpdated: '2024-01-15'
  },

  'transit_airports_food_court_airport': {
    parent: 'transit',
    child: 'airports',
    grandChild: 'food_court_airport',
    openoohParentId: 1,
    openoohChildId: 101,
    openoohGrandChildId: 10104,
    audienceTypes: ['travelers', 'tourists', 'families'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['food court', 'patio de comidas', 'restaurants', 'restaurantes'],
      secondaryKeywords: ['dining', 'comida', 'cafe', 'coffee', 'café'],
      contextKeywords: ['terminal', 'waiting', 'espera', 'seating', 'asientos'],
      namePatterns: [/food\s+court/i, /patio.*comidas/i, /restaurants/i],
      descriptionPatterns: [/dining/i, /comida/i, /cafe/i, /coffee/i],
      avgFootTraffic: 8000,
      peakHours: ['07:00-10:00', '12:00-14:00', '18:00-21:00'],
      seasonalVariation: 0.3,
      businessTypes: ['food', 'retail'],
      nearbyPOIs: ['gates', 'shops', 'lounges']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  },

  'transit_airports_gates': {
    parent: 'transit',
    child: 'airports',
    grandChild: 'gates',
    openoohParentId: 1,
    openoohChildId: 101,
    openoohGrandChildId: 10105,
    audienceTypes: ['travelers', 'tourists', 'professionals'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['gate', 'puerta', 'boarding', 'embarque'],
      secondaryKeywords: ['waiting area', 'área de espera', 'seating', 'asientos'],
      contextKeywords: ['flight', 'vuelo', 'departure', 'salida', 'boarding pass'],
      namePatterns: [/gate/i, /puerta/i, /boarding/i, /embarque/i],
      descriptionPatterns: [/waiting/i, /espera/i, /seating/i, /asientos/i],
      avgFootTraffic: 5000,
      peakHours: ['05:00-09:00', '16:00-20:00'],
      seasonalVariation: 0.4,
      businessTypes: ['transportation'],
      nearbyPOIs: ['shops', 'food_court', 'lounges']
    },
    confidence: 0.93,
    lastUpdated: '2024-01-15'
  },

  'transit_airports_lounges': {
    parent: 'transit',
    child: 'airports',
    grandChild: 'lounges',
    openoohParentId: 1,
    openoohChildId: 101,
    openoohGrandChildId: 10106,
    audienceTypes: ['professionals', 'travelers', 'tourists'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['lounge', 'sala vip', 'vip', 'premium'],
      secondaryKeywords: ['business', 'first class', 'primera clase', 'executive'],
      contextKeywords: ['comfort', 'comodidad', 'quiet', 'silencioso', 'relaxation'],
      namePatterns: [/lounge/i, /vip/i, /premium/i, /business/i],
      descriptionPatterns: [/comfort/i, /comodidad/i, /executive/i, /first\s+class/i],
      avgFootTraffic: 2000,
      peakHours: ['06:00-10:00', '17:00-21:00'],
      seasonalVariation: 0.3,
      businessTypes: ['services', 'hospitality'],
      nearbyPOIs: ['gates', 'shops', 'restaurants']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'transit_airports_shopping_area_airport': {
    parent: 'transit',
    child: 'airports',
    grandChild: 'shopping_area_airport',
    openoohParentId: 1,
    openoohChildId: 101,
    openoohGrandChildId: 10107,
    audienceTypes: ['travelers', 'tourists', 'shoppers'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['duty free', 'shops', 'tiendas', 'shopping'],
      secondaryKeywords: ['retail', 'comercio', 'stores', 'boutique'],
      contextKeywords: ['terminal', 'concourse', 'corridor', 'pasillo'],
      namePatterns: [/duty\s+free/i, /shops/i, /tiendas/i, /shopping/i],
      descriptionPatterns: [/retail/i, /comercio/i, /stores/i, /boutique/i],
      avgFootTraffic: 10000,
      peakHours: ['08:00-12:00', '16:00-20:00'],
      seasonalVariation: 0.4,
      businessTypes: ['retail'],
      nearbyPOIs: ['gates', 'food_court', 'lounges']
    },
    confidence: 0.87,
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

  // Bus Grandchild Categories
  'transit_buses_bus_inside': {
    parent: 'transit',
    child: 'buses',
    grandChild: 'bus_inside',
    openoohParentId: 1,
    openoohChildId: 102,
    openoohGrandChildId: 10201,
    audienceTypes: ['commuters', 'students', 'residents'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['15"', '19"', '22"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['bus interior', 'interior del bus', 'inside bus', 'dentro del bus'],
      secondaryKeywords: ['passenger', 'pasajero', 'seat', 'asiento', 'screen', 'pantalla'],
      contextKeywords: ['route', 'ruta', 'journey', 'viaje', 'transport', 'transporte'],
      namePatterns: [/bus.*interior/i, /inside.*bus/i, /dentro.*bus/i],
      descriptionPatterns: [/passenger/i, /pasajero/i, /seat/i, /asiento/i],
      avgFootTraffic: 50,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.1,
      businessTypes: ['transportation'],
      nearbyPOIs: ['bus_stops', 'routes']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'transit_buses_bus_terminal': {
    parent: 'transit',
    child: 'buses',
    grandChild: 'bus_terminal',
    openoohParentId: 1,
    openoohChildId: 102,
    openoohGrandChildId: 10202,
    audienceTypes: ['commuters', 'travelers', 'students'],
    dwellTime: 'medium',
    environment: 'indoor_semi_open',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '600-1000 nits',
    mlFeatures: {
      primaryKeywords: ['bus terminal', 'terminal de buses', 'bus station', 'estación de buses'],
      secondaryKeywords: ['platform', 'andén', 'waiting area', 'área de espera'],
      contextKeywords: ['departure', 'salida', 'arrival', 'llegada', 'schedule', 'horario'],
      namePatterns: [/bus.*terminal/i, /terminal.*bus/i, /bus.*station/i],
      descriptionPatterns: [/platform/i, /andén/i, /waiting/i, /espera/i],
      avgFootTraffic: 5000,
      peakHours: ['06:00-09:00', '17:00-20:00'],
      seasonalVariation: 0.2,
      businessTypes: ['transportation'],
      nearbyPOIs: ['ticket_office', 'shops', 'food_court']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  'transit_buses_bus_outside': {
    parent: 'transit',
    child: 'buses',
    grandChild: 'bus_outside',
    openoohParentId: 1,
    openoohChildId: 102,
    openoohGrandChildId: 10203,
    audienceTypes: ['pedestrians', 'commuters', 'drivers'],
    dwellTime: 'very_short',
    environment: 'outdoor_exposed',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '2000-3000 nits',
    weatherResistance: 'full',
    mlFeatures: {
      primaryKeywords: ['bus exterior', 'exterior del bus', 'outside bus', 'fuera del bus'],
      secondaryKeywords: ['advertising', 'publicidad', 'mobile', 'móvil', 'transit'],
      contextKeywords: ['street', 'calle', 'traffic', 'tráfico', 'route', 'ruta'],
      namePatterns: [/bus.*exterior/i, /outside.*bus/i, /fuera.*bus/i],
      descriptionPatterns: [/advertising/i, /publicidad/i, /mobile/i, /móvil/i],
      avgFootTraffic: 10000,
      peakHours: ['07:00-09:00', '12:00-14:00', '17:00-19:00'],
      seasonalVariation: 0.1,
      businessTypes: ['advertising', 'transportation'],
      nearbyPOIs: ['streets', 'commercial_areas', 'residential']
    },
    confidence: 0.80,
    lastUpdated: '2024-01-15'
  },

  'transit_taxi_rideshare_tv': {
    parent: 'transit',
    child: 'taxi_rideshare_tv',
    openoohParentId: 1,
    openoohChildId: 103,
    audienceTypes: ['commuters', 'professionals', 'tourists'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['10"', '12"', '15"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['taxi', 'uber', 'rideshare', 'transporte privado'],
      secondaryKeywords: ['tv', 'pantalla', 'screen', 'interior'],
      contextKeywords: ['passenger', 'pasajero', 'ride', 'viaje'],
      namePatterns: [/taxi/i, /uber/i, /rideshare/i],
      descriptionPatterns: [/tv/i, /screen/i, /interior/i],
      avgFootTraffic: 500,
      peakHours: ['07:00-09:00', '17:00-19:00', '22:00-02:00'],
      seasonalVariation: 0.1,
      businessTypes: ['transportation'],
      nearbyPOIs: ['business_districts', 'airports', 'hotels']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'transit_subway': {
    parent: 'transit',
    child: 'subway',
    openoohParentId: 1,
    openoohChildId: 105,
    audienceTypes: ['commuters', 'students', 'residents'],
    dwellTime: 'short',
    environment: 'indoor_semi_open',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '600-1000 nits',
    mlFeatures: {
      primaryKeywords: ['metro', 'subway', 'subterráneo', 'estación'],
      secondaryKeywords: ['platform', 'andén', 'train', 'tren'],
      contextKeywords: ['underground', 'subterráneo', 'rail', 'ferrocarril'],
      namePatterns: [/metro/i, /subway/i, /estación/i],
      descriptionPatterns: [/platform/i, /andén/i, /underground/i],
      avgFootTraffic: 15000,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.15,
      businessTypes: ['transportation'],
      nearbyPOIs: ['commercial_areas', 'residential', 'business_districts']
    },
    confidence: 0.92,
    lastUpdated: '2024-01-15'
  },

  // Subway Grandchild Categories
  'transit_subway_subway_train': {
    parent: 'transit',
    child: 'subway',
    grandChild: 'subway_train',
    openoohParentId: 1,
    openoohChildId: 105,
    openoohGrandChildId: 10501,
    audienceTypes: ['commuters', 'students', 'residents'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['19"', '22"', '32"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['subway train', 'tren del metro', 'metro car', 'vagón del metro'],
      secondaryKeywords: ['interior', 'passenger', 'pasajero', 'seat', 'asiento'],
      contextKeywords: ['underground', 'subterráneo', 'route', 'ruta', 'journey', 'viaje'],
      namePatterns: [/subway.*train/i, /tren.*metro/i, /metro.*car/i],
      descriptionPatterns: [/interior/i, /passenger/i, /pasajero/i, /seat/i],
      avgFootTraffic: 200,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.1,
      businessTypes: ['transportation'],
      nearbyPOIs: ['subway_stations', 'routes']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'transit_subway_subway_platform': {
    parent: 'transit',
    child: 'subway',
    grandChild: 'subway_platform',
    openoohParentId: 1,
    openoohChildId: 105,
    openoohGrandChildId: 10502,
    audienceTypes: ['commuters', 'students', 'residents'],
    dwellTime: 'short',
    environment: 'indoor_semi_open',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '600-1000 nits',
    mlFeatures: {
      primaryKeywords: ['subway platform', 'andén del metro', 'metro platform', 'plataforma del metro'],
      secondaryKeywords: ['waiting', 'espera', 'tracks', 'vías', 'station', 'estación'],
      contextKeywords: ['underground', 'subterráneo', 'departure', 'salida', 'arrival', 'llegada'],
      namePatterns: [/subway.*platform/i, /andén.*metro/i, /metro.*platform/i],
      descriptionPatterns: [/waiting/i, /espera/i, /tracks/i, /vías/i],
      avgFootTraffic: 8000,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.15,
      businessTypes: ['transportation'],
      nearbyPOIs: ['ticket_machines', 'exits', 'commercial_areas']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  'transit_train_stations': {
    parent: 'transit',
    child: 'train_stations',
    openoohParentId: 1,
    openoohChildId: 106,
    audienceTypes: ['commuters', 'travelers', 'tourists'],
    dwellTime: 'medium',
    environment: 'indoor_semi_open',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '600-1000 nits',
    mlFeatures: {
      primaryKeywords: ['estación de tren', 'train station', 'ferrocarril'],
      secondaryKeywords: ['platform', 'andén', 'railway', 'tracks'],
      contextKeywords: ['departure', 'arrival', 'schedule', 'horario'],
      namePatterns: [/estación/i, /train/i, /ferrocarril/i],
      descriptionPatterns: [/railway/i, /tracks/i, /platform/i],
      avgFootTraffic: 12000,
      peakHours: ['06:00-09:00', '17:00-20:00'],
      seasonalVariation: 0.3,
      businessTypes: ['transportation'],
      nearbyPOIs: ['hotels', 'commercial_areas', 'parking']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  // Train Station Grandchild Categories
  'transit_train_stations_train': {
    parent: 'transit',
    child: 'train_stations',
    grandChild: 'train',
    openoohParentId: 1,
    openoohChildId: 106,
    openoohGrandChildId: 10601,
    audienceTypes: ['commuters', 'travelers', 'tourists'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['19"', '22"', '32"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['train interior', 'interior del tren', 'inside train', 'dentro del tren'],
      secondaryKeywords: ['passenger', 'pasajero', 'seat', 'asiento', 'car', 'vagón'],
      contextKeywords: ['journey', 'viaje', 'route', 'ruta', 'railway', 'ferrocarril'],
      namePatterns: [/train.*interior/i, /inside.*train/i, /dentro.*tren/i],
      descriptionPatterns: [/passenger/i, /pasajero/i, /seat/i, /asiento/i],
      avgFootTraffic: 150,
      peakHours: ['06:00-09:00', '17:00-20:00'],
      seasonalVariation: 0.3,
      businessTypes: ['transportation'],
      nearbyPOIs: ['train_stations', 'routes']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'transit_train_stations_train_platform': {
    parent: 'transit',
    child: 'train_stations',
    grandChild: 'train_platform',
    openoohParentId: 1,
    openoohChildId: 106,
    openoohGrandChildId: 10602,
    audienceTypes: ['commuters', 'travelers', 'tourists'],
    dwellTime: 'medium',
    environment: 'indoor_semi_open',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '600-1000 nits',
    mlFeatures: {
      primaryKeywords: ['train platform', 'andén del tren', 'railway platform', 'plataforma del tren'],
      secondaryKeywords: ['waiting', 'espera', 'tracks', 'vías', 'departure', 'salida'],
      contextKeywords: ['station', 'estación', 'schedule', 'horario', 'arrival', 'llegada'],
      namePatterns: [/train.*platform/i, /andén.*tren/i, /railway.*platform/i],
      descriptionPatterns: [/waiting/i, /espera/i, /tracks/i, /vías/i],
      avgFootTraffic: 6000,
      peakHours: ['06:00-09:00', '17:00-20:00'],
      seasonalVariation: 0.3,
      businessTypes: ['transportation'],
      nearbyPOIs: ['ticket_office', 'shops', 'waiting_areas']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  },

  // ========== RETAIL ==========
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
    broadsign: {
      venue_id: 205,
      enumeration_id: 'MALL_GENERAL',
      category_name: 'Shopping Mall',
      venue_type: 'Indoor Retail'
    },
    latinad: {
      category_id: 'retail_mall',
      environment_type: 'indoor',
      audience_segment: 'shoppers'
    },
    confidence: 0.95,
    lastUpdated: '2024-01-15'
  },

  // Mall Grandchild Categories
  'retail_mall_concourse': {
    parent: 'retail',
    child: 'mall',
    grandChild: 'concourse',
    openoohParentId: 2,
    openoohChildId: 205,
    openoohGrandChildId: 20501,
    audienceTypes: ['families', 'shoppers', 'young_adults'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"', '85"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['concourse', 'pasillo principal', 'main corridor', 'corredor central'],
      secondaryKeywords: ['walkway', 'pasillo', 'central area', 'área central'],
      contextKeywords: ['shopping', 'compras', 'stores', 'tiendas', 'traffic', 'tráfico'],
      namePatterns: [/concourse/i, /pasillo.*principal/i, /main.*corridor/i],
      descriptionPatterns: [/walkway/i, /pasillo/i, /central/i, /área.*central/i],
      avgFootTraffic: 12000,
      peakHours: ['11:00-13:00', '18:00-21:00'],
      seasonalVariation: 0.3,
      businessTypes: ['retail'],
      nearbyPOIs: ['stores', 'food_court', 'escalators', 'elevators']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  'retail_mall_food_court_mall': {
    parent: 'retail',
    child: 'mall',
    grandChild: 'food_court_mall',
    openoohParentId: 2,
    openoohChildId: 205,
    openoohGrandChildId: 20502,
    audienceTypes: ['families', 'young_adults', 'shoppers'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['food court', 'patio de comidas', 'área de restaurantes', 'zona gastronómica'],
      secondaryKeywords: ['restaurants', 'restaurantes', 'dining', 'comida', 'seating', 'asientos'],
      contextKeywords: ['mall', 'centro comercial', 'eating', 'comiendo', 'tables', 'mesas'],
      namePatterns: [/food.*court/i, /patio.*comidas/i, /área.*restaurantes/i],
      descriptionPatterns: [/dining/i, /comida/i, /seating/i, /asientos/i],
      avgFootTraffic: 8000,
      peakHours: ['12:00-14:00', '19:00-21:00'],
      seasonalVariation: 0.2,
      businessTypes: ['food', 'retail'],
      nearbyPOIs: ['restaurants', 'stores', 'restrooms', 'seating_areas']
    },
    confidence: 0.92,
    lastUpdated: '2024-01-15'
  },

  'retail_mall_spectacular_mall': {
    parent: 'retail',
    child: 'mall',
    grandChild: 'spectacular_mall',
    openoohParentId: 2,
    openoohChildId: 205,
    openoohGrandChildId: 20503,
    audienceTypes: ['families', 'shoppers', 'young_adults'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['75"', '85"', '98"', '110"'],
    typicalBrightness: '800-1200 nits',
    mlFeatures: {
      primaryKeywords: ['spectacular', 'espectacular', 'large screen', 'pantalla grande'],
      secondaryKeywords: ['digital billboard', 'valla digital', 'main entrance', 'entrada principal'],
      contextKeywords: ['high impact', 'alto impacto', 'premium', 'visibility', 'visibilidad'],
      namePatterns: [/spectacular/i, /espectacular/i, /large.*screen/i],
      descriptionPatterns: [/digital.*billboard/i, /valla.*digital/i, /high.*impact/i],
      avgFootTraffic: 20000,
      peakHours: ['11:00-13:00', '18:00-21:00'],
      seasonalVariation: 0.3,
      businessTypes: ['advertising', 'retail'],
      nearbyPOIs: ['main_entrance', 'escalators', 'information_desk']
    },
    confidence: 0.85,
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

  // Grocery Grandchild Categories
  'retail_grocery_shop_entrance': {
    parent: 'retail',
    child: 'grocery',
    grandChild: 'shop_entrance',
    openoohParentId: 2,
    openoohChildId: 203,
    openoohGrandChildId: 20301,
    audienceTypes: ['families', 'residents', 'shoppers'],
    dwellTime: 'short',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '500-800 nits',
    mlFeatures: {
      primaryKeywords: ['shop entrance', 'entrada de tienda', 'store entrance', 'entrada del supermercado'],
      secondaryKeywords: ['welcome', 'bienvenida', 'entry', 'entrada', 'doors', 'puertas'],
      contextKeywords: ['first impression', 'primera impresión', 'greeting', 'saludo'],
      namePatterns: [/shop.*entrance/i, /entrada.*tienda/i, /store.*entrance/i],
      descriptionPatterns: [/welcome/i, /bienvenida/i, /entry/i, /entrada/i],
      avgFootTraffic: 4000,
      peakHours: ['10:00-12:00', '17:00-19:00'],
      seasonalVariation: 0.15,
      businessTypes: ['retail'],
      nearbyPOIs: ['parking', 'shopping_carts', 'customer_service']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  },

  'retail_grocery_check_out': {
    parent: 'retail',
    child: 'grocery',
    grandChild: 'check_out',
    openoohParentId: 2,
    openoohChildId: 203,
    openoohGrandChildId: 20302,
    audienceTypes: ['families', 'residents', 'shoppers'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['checkout', 'caja', 'cashier', 'cajero', 'payment', 'pago'],
      secondaryKeywords: ['queue', 'cola', 'waiting', 'espera', 'register', 'registradora'],
      contextKeywords: ['purchase', 'compra', 'transaction', 'transacción', 'receipt', 'recibo'],
      namePatterns: [/checkout/i, /caja/i, /cashier/i, /cajero/i],
      descriptionPatterns: [/queue/i, /cola/i, /waiting/i, /espera/i],
      avgFootTraffic: 3000,
      peakHours: ['10:00-12:00', '17:00-19:00'],
      seasonalVariation: 0.15,
      businessTypes: ['retail'],
      nearbyPOIs: ['customer_service', 'exit', 'bagging_area']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  'retail_grocery_aisles': {
    parent: 'retail',
    child: 'grocery',
    grandChild: 'aisles',
    openoohParentId: 2,
    openoohChildId: 203,
    openoohGrandChildId: 20303,
    audienceTypes: ['families', 'residents', 'shoppers'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['aisles', 'pasillos', 'shelves', 'estantes', 'products', 'productos'],
      secondaryKeywords: ['shopping', 'compras', 'browsing', 'navegando', 'selection', 'selección'],
      contextKeywords: ['grocery', 'supermercado', 'food', 'comida', 'brands', 'marcas'],
      namePatterns: [/aisles/i, /pasillos/i, /shelves/i, /estantes/i],
      descriptionPatterns: [/shopping/i, /compras/i, /browsing/i, /navegando/i],
      avgFootTraffic: 2000,
      peakHours: ['10:00-12:00', '17:00-19:00'],
      seasonalVariation: 0.15,
      businessTypes: ['retail'],
      nearbyPOIs: ['product_displays', 'price_scanners', 'shopping_carts']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'retail_fueling_stations': {
    parent: 'retail',
    child: 'fueling_stations',
    openoohParentId: 2,
    openoohChildId: 201,
    audienceTypes: ['drivers', 'commuters', 'travelers'],
    dwellTime: 'short',
    environment: 'outdoor_covered',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '1000-1500 nits',
    weatherResistance: 'full',
    mlFeatures: {
      primaryKeywords: ['gasolinera', 'gas station', 'fuel', 'combustible'],
      secondaryKeywords: ['pump', 'bomba', 'diesel', 'gasoline'],
      contextKeywords: ['convenience store', 'tienda', 'car wash', 'lavado'],
      namePatterns: [/gasolinera/i, /gas\s+station/i, /fuel/i],
      descriptionPatterns: [/pump/i, /bomba/i, /combustible/i],
      avgFootTraffic: 3000,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.1,
      businessTypes: ['fuel', 'retail'],
      nearbyPOIs: ['highways', 'commercial_areas', 'car_services']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  },

  // Fueling Station Grandchild Categories
  'retail_fueling_stations_fuel_dispenser': {
    parent: 'retail',
    child: 'fueling_stations',
    grandChild: 'fuel_dispenser',
    openoohParentId: 2,
    openoohChildId: 201,
    openoohGrandChildId: 20101,
    audienceTypes: ['drivers', 'commuters', 'travelers'],
    dwellTime: 'short',
    environment: 'outdoor_covered',
    recommendedSizes: ['19"', '22"', '32"'],
    typicalBrightness: '1500-2000 nits',
    weatherResistance: 'full',
    mlFeatures: {
      primaryKeywords: ['fuel dispenser', 'dispensador de combustible', 'gas pump', 'bomba de gasolina'],
      secondaryKeywords: ['pump', 'bomba', 'nozzle', 'manguera', 'fuel', 'combustible'],
      contextKeywords: ['refueling', 'repostaje', 'gasoline', 'gasolina', 'diesel'],
      namePatterns: [/fuel.*dispenser/i, /dispensador.*combustible/i, /gas.*pump/i],
      descriptionPatterns: [/pump/i, /bomba/i, /nozzle/i, /manguera/i],
      avgFootTraffic: 1500,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.1,
      businessTypes: ['fuel'],
      nearbyPOIs: ['convenience_store', 'car_wash', 'air_pump']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'retail_fueling_stations_fueling_shop': {
    parent: 'retail',
    child: 'fueling_stations',
    grandChild: 'fueling_shop',
    openoohParentId: 2,
    openoohChildId: 201,
    openoohGrandChildId: 20102,
    audienceTypes: ['drivers', 'commuters', 'travelers'],
    dwellTime: 'short',
    environment: 'indoor_controlled',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['convenience store', 'tienda de conveniencia', 'gas station shop', 'tienda de gasolinera'],
      secondaryKeywords: ['snacks', 'bebidas', 'drinks', 'coffee', 'café'],
      contextKeywords: ['quick purchase', 'compra rápida', 'fuel payment', 'pago de combustible'],
      namePatterns: [/convenience.*store/i, /tienda.*conveniencia/i, /gas.*station.*shop/i],
      descriptionPatterns: [/snacks/i, /bebidas/i, /drinks/i, /coffee/i],
      avgFootTraffic: 2000,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.1,
      businessTypes: ['retail', 'fuel'],
      nearbyPOIs: ['fuel_dispensers', 'restrooms', 'atm']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  },

  // ========== OUTDOOR ==========
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

  'outdoor_urban_panels': {
    parent: 'outdoor',
    child: 'urban_panels',
    openoohParentId: 3,
    openoohChildId: 302,
    audienceTypes: ['pedestrians', 'commuters', 'residents'],
    dwellTime: 'short',
    environment: 'outdoor_exposed',
    recommendedSizes: ['55"', '65"', '75"'],
    typicalBrightness: '3000-5000 nits',
    weatherResistance: 'full',
    mlFeatures: {
      primaryKeywords: ['panel urbano', 'urban panel', 'street furniture'],
      secondaryKeywords: ['sidewalk', 'acera', 'pedestrian', 'peatonal'],
      contextKeywords: ['city', 'ciudad', 'downtown', 'centro'],
      namePatterns: [/panel/i, /urban/i, /street/i],
      descriptionPatterns: [/sidewalk/i, /acera/i, /pedestrian/i],
      avgFootTraffic: 8000,
      peakHours: ['08:00-10:00', '12:00-14:00', '17:00-19:00'],
      seasonalVariation: 0.2,
      businessTypes: ['advertising'],
      nearbyPOIs: ['commercial_areas', 'offices', 'restaurants']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'outdoor_bus_shelters': {
    parent: 'outdoor',
    child: 'bus_shelters',
    openoohParentId: 3,
    openoohChildId: 303,
    audienceTypes: ['commuters', 'students', 'residents'],
    dwellTime: 'medium',
    environment: 'outdoor_covered',
    recommendedSizes: ['43"', '55"'],
    typicalBrightness: '2000-3000 nits',
    weatherResistance: 'partial',
    mlFeatures: {
      primaryKeywords: ['parada de bus', 'bus shelter', 'bus stop'],
      secondaryKeywords: ['waiting', 'espera', 'public transport', 'transporte público'],
      contextKeywords: ['schedule', 'horario', 'route', 'ruta'],
      namePatterns: [/parada/i, /bus\s+shelter/i, /bus\s+stop/i],
      descriptionPatterns: [/waiting/i, /espera/i, /transport/i],
      avgFootTraffic: 2000,
      peakHours: ['07:00-09:00', '17:00-19:00'],
      seasonalVariation: 0.15,
      businessTypes: ['transportation', 'advertising'],
      nearbyPOIs: ['residential', 'commercial_areas', 'schools']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  // ========== HEALTH & BEAUTY ==========
  'health_beauty_gyms': {
    parent: 'health_beauty',
    child: 'gyms',
    openoohParentId: 4,
    openoohChildId: 401,
    audienceTypes: ['athletes', 'young_adults', 'professionals'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['gimnasio', 'gym', 'fitness', 'ejercicio'],
      secondaryKeywords: ['workout', 'entrenamiento', 'weights', 'pesas'],
      contextKeywords: ['cardio', 'strength', 'fuerza', 'health', 'salud'],
      namePatterns: [/gimnasio/i, /gym/i, /fitness/i],
      descriptionPatterns: [/workout/i, /entrenamiento/i, /exercise/i],
      avgFootTraffic: 800,
      peakHours: ['06:00-09:00', '18:00-21:00'],
      seasonalVariation: 0.3,
      businessTypes: ['fitness', 'health'],
      nearbyPOIs: ['residential', 'commercial_areas', 'parking']
    },
    confidence: 0.92,
    lastUpdated: '2024-01-15'
  },

  'health_beauty_salons': {
    parent: 'health_beauty',
    child: 'salons',
    openoohParentId: 4,
    openoohChildId: 402,
    audienceTypes: ['young_adults', 'professionals', 'families'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['32"', '43"'],
    typicalBrightness: '300-500 nits',
    mlFeatures: {
      primaryKeywords: ['salón de belleza', 'beauty salon', 'peluquería'],
      secondaryKeywords: ['hair', 'cabello', 'nails', 'uñas', 'beauty'],
      contextKeywords: ['styling', 'peinado', 'manicure', 'pedicure'],
      namePatterns: [/salón/i, /salon/i, /peluquería/i],
      descriptionPatterns: [/hair/i, /cabello/i, /beauty/i],
      avgFootTraffic: 300,
      peakHours: ['10:00-12:00', '14:00-18:00'],
      seasonalVariation: 0.2,
      businessTypes: ['beauty', 'personal_care'],
      nearbyPOIs: ['commercial_areas', 'residential', 'shopping']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  },

  // ========== LEISURE ==========
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

  'leisure_bars': {
    parent: 'leisure',
    child: 'bars',
    openoohParentId: 8,
    openoohChildId: 804,
    audienceTypes: ['young_adults', 'professionals'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '300-500 nits',
    mlFeatures: {
      primaryKeywords: ['bar', 'pub', 'cantina', 'drinks'],
      secondaryKeywords: ['alcohol', 'beer', 'cerveza', 'cocktails'],
      contextKeywords: ['nightlife', 'vida nocturna', 'entertainment'],
      namePatterns: [/bar/i, /pub/i, /cantina/i],
      descriptionPatterns: [/drinks/i, /alcohol/i, /nightlife/i],
      avgFootTraffic: 500,
      peakHours: ['19:00-02:00'],
      seasonalVariation: 0.2,
      businessTypes: ['entertainment', 'food_beverage'],
      nearbyPOIs: ['restaurants', 'entertainment_districts', 'hotels']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  'leisure_casual_dining': {
    parent: 'leisure',
    child: 'casual_dining',
    openoohParentId: 8,
    openoohChildId: 805,
    audienceTypes: ['families', 'young_adults', 'professionals'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '300-500 nits',
    mlFeatures: {
      primaryKeywords: ['restaurante', 'restaurant', 'dining', 'comida'],
      secondaryKeywords: ['food', 'menu', 'casual', 'family'],
      contextKeywords: ['lunch', 'dinner', 'almuerzo', 'cena'],
      namePatterns: [/restaurante/i, /restaurant/i, /dining/i],
      descriptionPatterns: [/food/i, /menu/i, /casual/i],
      avgFootTraffic: 800,
      peakHours: ['12:00-14:00', '19:00-21:00'],
      seasonalVariation: 0.2,
      businessTypes: ['food_beverage'],
      nearbyPOIs: ['commercial_areas', 'malls', 'offices']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  // ========== EDUCATION ==========
  'education_schools': {
    parent: 'education',
    child: 'schools',
    openoohParentId: 6,
    openoohChildId: 601,
    audienceTypes: ['students', 'families', 'children'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['colegio', 'school', 'escuela', 'educación'],
      secondaryKeywords: ['students', 'estudiantes', 'classes', 'clases'],
      contextKeywords: ['learning', 'aprendizaje', 'teachers', 'profesores'],
      namePatterns: [/colegio/i, /school/i, /escuela/i],
      descriptionPatterns: [/students/i, /estudiantes/i, /education/i],
      avgFootTraffic: 1500,
      peakHours: ['07:00-08:00', '12:00-13:00', '16:00-17:00'],
      seasonalVariation: 0.6,
      businessTypes: ['education'],
      nearbyPOIs: ['residential', 'parks', 'commercial_areas']
    },
    confidence: 0.95,
    lastUpdated: '2024-01-15'
  },

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
  },

  // ========== FINANCIAL ==========
  'financial_banks': {
    parent: 'financial',
    child: 'banks',
    openoohParentId: 10,
    openoohChildId: 1001,
    audienceTypes: ['professionals', 'residents', 'seniors'],
    dwellTime: 'medium',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['banco', 'bank', 'financial', 'financiero'],
      secondaryKeywords: ['atm', 'cajero', 'services', 'servicios'],
      contextKeywords: ['money', 'dinero', 'transactions', 'transacciones'],
      namePatterns: [/banco/i, /bank/i, /financial/i],
      descriptionPatterns: [/atm/i, /cajero/i, /services/i],
      avgFootTraffic: 1000,
      peakHours: ['09:00-11:00', '14:00-16:00'],
      seasonalVariation: 0.1,
      businessTypes: ['financial'],
      nearbyPOIs: ['commercial_areas', 'offices', 'shopping']
    },
    confidence: 0.92,
    lastUpdated: '2024-01-15'
  },

  // ========== OFFICE BUILDINGS ==========
  'office_buildings_office_buildings': {
    parent: 'office_buildings',
    child: 'office_buildings',
    openoohParentId: 7,
    openoohChildId: 701,
    audienceTypes: ['professionals', 'professionals'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"', '65"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['oficina', 'office', 'building', 'edificio'],
      secondaryKeywords: ['business', 'negocio', 'corporate', 'corporativo'],
      contextKeywords: ['lobby', 'elevator', 'ascensor', 'reception'],
      namePatterns: [/oficina/i, /office/i, /building/i],
      descriptionPatterns: [/business/i, /corporate/i, /professional/i],
      avgFootTraffic: 2000,
      peakHours: ['08:00-09:00', '12:00-13:00', '17:00-18:00'],
      seasonalVariation: 0.1,
      businessTypes: ['business', 'professional_services'],
      nearbyPOIs: ['restaurants', 'banks', 'parking']
    },
    confidence: 0.90,
    lastUpdated: '2024-01-15'
  },

  // ========== GOVERNMENT ==========
  'government_dmvs': {
    parent: 'government',
    child: 'dmvs',
    openoohParentId: 9,
    openoohChildId: 901,
    audienceTypes: ['residents', 'drivers'],
    dwellTime: 'long',
    environment: 'indoor_controlled',
    recommendedSizes: ['43"', '55"'],
    typicalBrightness: '400-600 nits',
    mlFeatures: {
      primaryKeywords: ['dmv', 'tránsito', 'traffic', 'licencias'],
      secondaryKeywords: ['license', 'licencia', 'registration', 'registro'],
      contextKeywords: ['government', 'gobierno', 'official', 'oficial'],
      namePatterns: [/dmv/i, /tránsito/i, /traffic/i],
      descriptionPatterns: [/license/i, /licencia/i, /registration/i],
      avgFootTraffic: 800,
      peakHours: ['09:00-11:00', '14:00-16:00'],
      seasonalVariation: 0.1,
      businessTypes: ['government'],
      nearbyPOIs: ['government_buildings', 'parking', 'commercial_areas']
    },
    confidence: 0.85,
    lastUpdated: '2024-01-15'
  },

  // ========== RESIDENTIAL ==========
  'residential_apartment_buildings_condominiums': {
    parent: 'residential',
    child: 'apartment_buildings_condominiums',
    openoohParentId: 11,
    openoohChildId: 1101,
    audienceTypes: ['residents', 'families'],
    dwellTime: 'very_long',
    environment: 'indoor_controlled',
    recommendedSizes: ['32"', '43"', '55"'],
    typicalBrightness: '300-500 nits',
    mlFeatures: {
      primaryKeywords: ['apartamento', 'apartment', 'condominio', 'residential'],
      secondaryKeywords: ['building', 'edificio', 'complex', 'complejo'],
      contextKeywords: ['lobby', 'elevator', 'ascensor', 'residents'],
      namePatterns: [/apartamento/i, /apartment/i, /condominio/i],
      descriptionPatterns: [/residential/i, /building/i, /complex/i],
      avgFootTraffic: 500,
      peakHours: ['07:00-09:00', '18:00-20:00'],
      seasonalVariation: 0.1,
      businessTypes: ['residential'],
      nearbyPOIs: ['commercial_areas', 'schools', 'parks']
    },
    confidence: 0.88,
    lastUpdated: '2024-01-15'
  }
};

// ==========================================
// 4. CLASIFICADOR IA
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
    grandChild?: VenueGrandChildCategory;
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
    for (const [key, category] of Object.entries(VENUE_TAXONOMY)) {
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
      
      // Evaluar keywords de contexto (peso 1)
      for (const keyword of category.mlFeatures.contextKeywords) {
        if (text.includes(keyword.toLowerCase()) || keywords.includes(keyword)) {
          score += 1;
          matches.push(keyword);
        }
      }
      
      // Evaluar patrones de nombre
      for (const pattern of category.mlFeatures.namePatterns) {
        if (pattern.test(request.name)) {
          score += 4;
          matches.push(`pattern: ${pattern.source}`);
        }
      }
      
      // Evaluar patrones de descripción
      if (request.description) {
        for (const pattern of category.mlFeatures.descriptionPatterns) {
          if (pattern.test(request.description)) {
            score += 2;
            matches.push(`desc_pattern: ${pattern.source}`);
          }
        }
      }
      
      if (score > 0) {
        scores.push({ category, score, matches });
      }
    }
    
    // Ordenar por score descendente
    scores.sort((a, b) => b.score - a.score);
    
    if (scores.length === 0) {
      throw new Error('No se pudo clasificar el venue. Proporcione más información.');
    }
    
    const bestMatch = scores[0];
    const maxPossibleScore = 10; // Ajustar según el sistema de scoring
    const confidence = Math.min(bestMatch.score / maxPossibleScore, 1.0);
    
    // Generar reasoning
    const reasoning = this.generateReasoning(bestMatch.matches, confidence);
    
    // Categorías alternativas (top 3)
    const alternativeCategories = scores.slice(1, 4).map(s => ({
      category: s.category,
      confidence: Math.min(s.score / maxPossibleScore, 1.0)
    }));
    
    return {
      category: {
        parent: bestMatch.category.parent,
        child: bestMatch.category.child,
        grandChild: bestMatch.category.grandChild
      },
      confidence,
      reasoning,
      extractedFeatures: bestMatch.matches,
      alternativeCategories
    };
  }
  
  private generateReasoning(matches: string[], confidence: number): string {
    const keywordCount = matches.filter(m => !m.startsWith('pattern:')).length;
    const patternCount = matches.filter(m => m.startsWith('pattern:')).length;
    
    let reasoning = `Clasificación basada en ${keywordCount} keywords coincidentes`;
    if (patternCount > 0) {
      reasoning += ` y ${patternCount} patrones de nombre`;
    }
    reasoning += `. Confianza: ${(confidence * 100).toFixed(1)}%`;
    
    if (confidence > 0.9) {
      reasoning += ' - Clasificación muy confiable';
    } else if (confidence > 0.7) {
      reasoning += ' - Clasificación confiable';
    } else if (confidence > 0.5) {
      reasoning += ' - Clasificación moderada, revisar manualmente';
    } else {
      reasoning += ' - Clasificación incierta, requiere revisión manual';
    }
    
    return reasoning;
  }
}

// ==========================================
// 5. MAPEO DE APIS
// ==========================================

export interface ShareflowVenueData {
  name: string;
  description?: string;
  category: VenueParentCategory;
  subcategory: VenueChildCategory;
  location_type?: VenueGrandChildCategory;
  
  // Geografía
  geography: {
    country: string;
    state?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Características
  audience_types: AudienceType[];
  dwell_time: DwellTime;
  environment: EnvironmentType;
  
  // Metadatos IA
  ai_metadata: {
    confidence_score: number;
    classification_reasoning: string;
    extracted_features: string[];
    manual_override: boolean;
    tags: string[];
  };
  
  // Mapeos externos
  external_mappings?: {
    broadsign?: BroadsignMapping;
    latinad?: LatinadMapping;
  };
  
  // Auditoría
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export class VenueAPIMapper {
  /**
   * Convierte resultado de clasificación a formato Shareflow
   */
  static toShareflowVenue(
    venueData: { name: string; description?: string },
    classification: VenueClassificationResult,
    additionalData: Partial<ShareflowVenueData> = {}
  ): ShareflowVenueData {
    const categoryKey = `${classification.category.parent}_${classification.category.child}${
      classification.category.grandChild ? '_' + classification.category.grandChild : ''
    }`;
    
    const venueCategory = VENUE_TAXONOMY[categoryKey];
    if (!venueCategory) {
      throw new Error(`Category not found in taxonomy: ${categoryKey}`);
    }
    
    return {
      name: venueData.name,
      description: venueData.description,
      category: classification.category.parent,
      subcategory: classification.category.child,
      location_type: classification.category.grandChild,
      
      geography: {
        country: 'COL', // Default para Colombia
        ...additionalData.geography
      },
      
      audience_types: venueCategory.audienceTypes,
      dwell_time: venueCategory.dwellTime,
      environment: venueCategory.environment,
      
      ai_metadata: {
        confidence_score: classification.confidence,
        classification_reasoning: classification.reasoning,
        extracted_features: classification.extractedFeatures,
        manual_override: false,
        tags: ['ai_classified']
      },
      
      external_mappings: {
        broadsign: venueCategory.broadsign,
        latinad: venueCategory.latinad
      },
      
      created_by: 'system',
      created_at: new Date(),
      
      ...additionalData
    };
  }
  
  /**
   * Convierte venue de Shareflow a formato para UI
   */
  static toUIFormat(venue: ShareflowVenueData) {
    const categoryKey = `${venue.category}_${venue.subcategory}${
      venue.location_type ? '_' + venue.location_type : ''
    }`;
    
    const venueCategory = VENUE_TAXONOMY[categoryKey];
    
    return {
      id: categoryKey,
      name: this.getCategoryDisplayName(venue.category, venue.subcategory),
      description: venue.description || venueCategory?.mlFeatures.primaryKeywords.join(', '),
      icon: this.getCategoryIcon(venue.category, venue.subcategory),
      environment: venue.environment,
      audienceTypes: venue.audience_types,
      dwellTime: venue.dwell_time,
      confidence: venue.ai_metadata.confidence_score,
      reasoning: venue.ai_metadata.classification_reasoning
    };
  }
  
  private static getCategoryDisplayName(parent: VenueParentCategory, child: VenueChildCategory): string {
    const displayNames: Record<string, string> = {
      'retail_mall': 'Centro Comercial',
      'retail_grocery': 'Supermercado',
      'outdoor_billboards': 'Valla Publicitaria',
      'leisure_hotels': 'Hotel',
      'transit_airports': 'Aeropuerto',
      'transit_buses': 'Terminal de Buses'
    };
    
    return displayNames[`${parent}_${child}`] || `${parent} - ${child}`;
  }
  
  private static getCategoryIcon(parent: VenueParentCategory, child: VenueChildCategory): string {
    const icons: Record<string, string> = {
      'retail_mall': '🏬',
      'retail_grocery': '🛒',
      'outdoor_billboards': '📺',
      'leisure_hotels': '🏨',
      'transit_airports': '✈️',
      'transit_buses': '🚌'
    };
    
    return icons[`${parent}_${child}`] || '📍';
  }
}

// ==========================================
// 6. UTILIDADES
// ==========================================

export class VenueUtils {
  /**
   * Obtiene todas las categorías disponibles para UI
   */
  static getAllCategories() {
    return Object.entries(VENUE_TAXONOMY).map(([key, category]) => ({
      key: key,
      ...VenueAPIMapper.toUIFormat({
        name: key,
        category: category.parent,
        subcategory: category.child,
        location_type: category.grandChild,
        geography: { country: 'COL' },
        audience_types: category.audienceTypes,
        dwell_time: category.dwellTime,
        environment: category.environment,
        ai_metadata: {
          confidence_score: category.confidence,
          classification_reasoning: '',
          extracted_features: [],
          manual_override: false,
          tags: []
        },
        created_by: 'system'
      })
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
      const categoryData = VENUE_TAXONOMY[category.id];
      
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
// 7. EXPORTACIONES
// ==========================================

export default {
  VENUE_TAXONOMY,
  VenueAIClassifier,
  VenueAPIMapper,
  VenueUtils
}; 