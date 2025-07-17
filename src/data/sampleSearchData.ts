// Sample data to demonstrate the smart search system
// This would be populated from real user interactions in production

export const sampleSearchHistory = [
  {
    query: "pantallas estadios",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    category: "stadium",
    resultCount: 12,
    clickedResults: ["demo-stadium-1", "demo-stadium-2"],
    sessionId: "session_demo_1",
    contextualData: {
      timeOfDay: 'afternoon' as const,
      dayOfWeek: 'viernes',
      deviceType: 'desktop' as const,
    }
  },
  {
    query: "centros comerciales bogota",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    category: "mall",
    resultCount: 8,
    clickedResults: ["demo-mall-1"],
    sessionId: "session_demo_2",
    contextualData: {
      timeOfDay: 'morning' as const,
      dayOfWeek: 'viernes',
      deviceType: 'desktop' as const,
    }
  },
  {
    query: "vallas digitales centro",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    category: "billboard",
    resultCount: 15,
    clickedResults: [],
    sessionId: "session_demo_3",
    contextualData: {
      timeOfDay: 'evening' as const,
      dayOfWeek: 'jueves',
      deviceType: 'mobile' as const,
    }
  },
  {
    query: "pantallas aeropuerto",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    category: "airport",
    resultCount: 5,
    clickedResults: ["demo-airport-1"],
    sessionId: "session_demo_4",
    contextualData: {
      timeOfDay: 'morning' as const,
      dayOfWeek: 'viernes',
      deviceType: 'tablet' as const,
    }
  },
  {
    query: "estadios medellin",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    category: "stadium",
    resultCount: 6,
    clickedResults: ["demo-stadium-1"],
    sessionId: "session_demo_5",
    contextualData: {
      timeOfDay: 'afternoon' as const,
      dayOfWeek: 'viernes',
      deviceType: 'desktop' as const,
    }
  },
  {
    query: "pantallas interactivas",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    resultCount: 22,
    clickedResults: ["demo-mall-1", "demo-mall-2"],
    sessionId: "session_demo_6",
    contextualData: {
      timeOfDay: 'morning' as const,
      dayOfWeek: 'viernes',
      deviceType: 'desktop' as const,
    }
  }
];

export const initializeSampleData = () => {
  // Only initialize if there's no existing data
  const existingHistory = localStorage.getItem('shareflow_search_history');
  if (!existingHistory) {
    localStorage.setItem('shareflow_search_history', JSON.stringify(sampleSearchHistory));
    console.log('🤖 Initialized sample search history for ML demo');
  }
};

// Trending searches that would be computed from analytics
export const trendingSearches = [
  "pantallas estadios",
  "centros comerciales",
  "vallas digitales",
  "aeropuerto bogota",
  "pantallas led"
];

// Contextual suggestions based on user behavior patterns
export const contextualSuggestionMappings = {
  morning: [
    "centros comerciales desayuno",
    "oficinas corporativas",
    "universidades clases"
  ],
  afternoon: [
    "centros comerciales almuerzo",
    "estadios entrenamientos",
    "hospitales consultas"
  ],
  evening: [
    "restaurantes cena",
    "estadios partidos",
    "centros entretenimiento"
  ],
  night: [
    "bares nocturnos",
    "discotecas eventos",
    "cines funciones"
  ]
};

// Category affinity mappings for personalized recommendations
export const categoryAffinityMappings = {
  stadium: ["deportes", "eventos", "entretenimiento", "fin de semana"],
  mall: ["compras", "familia", "restaurantes", "entretenimiento"],
  airport: ["viajes", "negocios", "turismo", "internacional"],
  billboard: ["tráfico", "exterior", "masivo", "autopistas"],
  transport: ["movilidad", "usuarios", "diario", "rutas"]
}; 