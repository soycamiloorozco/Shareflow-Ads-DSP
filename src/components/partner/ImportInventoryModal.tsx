import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Building, Globe, Signal, RefreshCw, Upload, Download,
  CheckCircle, AlertCircle, Loader2, HelpCircle, Info,
  Wifi, Network, Copy, Key, FileText, Search, Settings,
  Database, Zap, Eye, Check, ExternalLink, ChevronRight,
  Package, Shield, Bot, TrendingUp, Sparkles, Crown,
  Activity, Monitor, MapPin, Calendar, DollarSign, WifiOff,
  AlertTriangle, Clock, Radio, Users, Star
} from 'lucide-react';

interface ImportInventoryModalProps {
  onClose: () => void;
  onImport: (importData: any) => void;
}

// Tooltip Component
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs ${positionClasses[position]}`}
          >
            <div className="relative z-10">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ImportInventoryModal({ onClose, onImport }: ImportInventoryModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<'broadsign' | 'latinad' | 'api' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState<{[key: string]: any}>({});
  const [healthCheckInterval, setHealthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Broadsign specific states
  const [broadsignConfig, setBroadsignConfig] = useState({
    serverUrl: '',
    apiKey: '',
    username: '',
    password: '',
    domain: '',
    availableScreens: [] as any[]
  });

  // LatinAd specific states
  const [latinadConfig, setLatinadConfig] = useState({
    email: '',
    password: '',
    availableScreens: [] as any[],
    accountPlan: 'free' as 'free' | 'pro'
  });

  // API specific states
  const [apiConfig, setApiConfig] = useState({
    endpoint: '',
    apiKey: '',
    format: 'json' as 'json' | 'csv' | 'xml',
    availableScreens: [] as any[]
  });

  const providers = [
    {
      id: 'broadsign',
      name: 'Broadsign CMS',
      description: 'Importa pantallas desde tu red Broadsign Enterprise existente',
      icon: Building,
      badge: 'Enterprise',
      badgeColor: 'bg-blue-600',
      features: [
        'APIs REST y SOAP nativas',
        'Inventario y monitoreo en tiempo real',
        'Paquetes por horas/días/semanas',
        'Share of Voice & Frequency buys'
      ],
      color: 'blue'
    },
    {
      id: 'latinad',
      name: 'LatinAd CMS',
      description: 'Importa pantallas desde tu red LatinAd CMS existente',
      icon: Globe,
      badge: 'Regional',
      badgeColor: 'bg-purple-600',
      features: [
        'Plan gratuito hasta 10 pantallas',
        'Ecosistema programático DOOH',
        'Paquetes tradicionales',
        'Certificaciones automáticas'
      ],
      color: 'purple'
    },
    {
      id: 'api',
      name: 'API Personalizada',
      description: 'Integra cualquier sistema mediante API REST o archivos',
      icon: Signal,
      badge: 'Flexible',
      badgeColor: 'bg-gray-600',
      features: [
        'Múltiples formatos (JSON, CSV, XML)',
        'Configuración personalizada',
        'Mapeo de campos flexible',
        'Depende del CMS subyacente'
      ],
      color: 'gray'
    }
  ];

  const handleProviderSelect = (providerId: 'broadsign' | 'latinad' | 'api') => {
    // Stop monitoring from previous provider
    stopRealTimeMonitoring();
    
    setSelectedProvider(providerId);
    setIsConnected(false);
    setConnectionError('');
    setShowPreview(false);
    setSelectedScreens([]);
  };

  // Enhanced Broadsign API integration function
  const generateEnrichedBroadsignData = async (screen: any, config: any) => {
    // Simulate actual Broadsign Control API calls
    // Based on: https://docs.broadsign.com/broadsign-control/latest/for-developers.html
    
    try {
      // 1. Display information from Display entity
      const displayInfo = await simulateBroadsignAPI(`${config.serverUrl}/displays/${screen.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // 2. Player status from Player API
      const playerStatus = await simulateBroadsignAPI(`${config.serverUrl}/players/${screen.id}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 3. Current loop information from Loop API
      const currentLoop = await simulateBroadsignAPI(`${config.serverUrl}/loops/current/${screen.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 4. Inventory availability from Inventory API
      const inventoryData = await simulateBroadsignAPI(`${config.serverUrl}/inventory/${screen.id}/availability`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 5. Booking information from Booking API
      const bookingData = await simulateBroadsignAPI(`${config.serverUrl}/bookings/${screen.id}/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 6. Performance metrics from Analytics API
      const performanceMetrics = await simulateBroadsignAPI(`${config.serverUrl}/analytics/displays/${screen.id}/performance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        },
        params: {
          period: '30d',
          metrics: 'impressions,plays,uptime,fill_rate'
        }
      });

      // 7. Hardware status from Control Player API
      const hardwareStatus = await simulateBroadsignAPI(`${config.serverUrl}/players/${screen.id}/hardware`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 8. Network connectivity from Control Player API
      const networkStatus = await simulateBroadsignAPI(`${config.serverUrl}/players/${screen.id}/network`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 9. Content information from Content API
      const contentInfo = await simulateBroadsignAPI(`${config.serverUrl}/content/${screen.id}/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 10. Location and venue data from Venue API
      const venueData = await simulateBroadsignAPI(`${config.serverUrl}/venues/${displayInfo.venueId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 11. Bundle/Package configurations from Bundle API
      const bundleConfig = await simulateBroadsignAPI(`${config.serverUrl}/bundles/${screen.id}/available`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // 12. Real-time audience data (if integrated with audience measurement)
      const audienceData = await simulateBroadsignAPI(`${config.serverUrl}/audience/${screen.id}/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      // Combine all API responses into enriched data structure
      return {
        // Basic Display Information (from Display API)
        id: screen.id,
        name: displayInfo.name,
        description: displayInfo.description,
        status: playerStatus.isOnline ? 'online' : 'offline',
        
        // Physical Display Properties
        displayProperties: {
          width: displayInfo.width,
          height: displayInfo.height,
          resolution: displayInfo.resolution,
          diagonal: displayInfo.diagonal,
          pixelPitch: displayInfo.pixelPitch,
          brightness: displayInfo.brightness,
          contrast: displayInfo.contrast,
          viewingAngle: displayInfo.viewingAngle,
          orientation: displayInfo.orientation,
          touchScreen: displayInfo.hasTouchScreen,
          audioEnabled: displayInfo.hasAudio
        },

        // Player/Hardware Information
        playerInfo: {
          playerId: playerStatus.playerId,
          playerType: playerStatus.playerType,
          operatingSystem: playerStatus.operatingSystem,
          playerVersion: playerStatus.softwareVersion,
          lastHeartbeat: playerStatus.lastHeartbeat,
          uptime: hardwareStatus.uptime,
          
                     // Hardware Status
           hardware: {
             cpuUsage: hardwareStatus?.cpu?.usage || 0,
             cpuTemperature: hardwareStatus?.cpu?.temperature || 0,
             memoryUsage: hardwareStatus?.memory?.usage || 0,
             memoryTotal: hardwareStatus?.memory?.total || 0,
             diskUsage: hardwareStatus?.disk?.usage || 0,
             diskTotal: hardwareStatus?.disk?.total || 0,
             powerStatus: hardwareStatus?.power?.status || 'unknown',
             fanSpeed: hardwareStatus?.cooling?.fanSpeed || 0,
             internalTemperature: hardwareStatus?.temperature?.internal || 0
           },

          // Network Information
          network: {
            connectionType: networkStatus.connectionType,
            ipAddress: networkStatus.ipAddress,
            macAddress: networkStatus.macAddress,
            bandwidth: networkStatus.bandwidth,
            latency: networkStatus.latency,
            signalStrength: networkStatus.signalStrength,
            dataUsage: networkStatus.dataUsage,
            vpnStatus: networkStatus.vpnConnected
          }
        },

        // Content & Loop Information
        contentData: {
          currentLoop: {
            loopId: currentLoop.loopId,
            loopName: currentLoop.name,
            duration: currentLoop.duration,
            totalSlots: currentLoop.totalSlots,
            currentPosition: currentLoop.currentPosition,
            nextRefresh: currentLoop.nextRefresh
          },
          
          currentContent: {
            contentId: contentInfo.currentContentId,
            contentName: contentInfo.currentContentName,
            contentType: contentInfo.currentContentType,
            startTime: contentInfo.startTime,
            endTime: contentInfo.endTime,
            remainingTime: contentInfo.remainingTime
          },

          // Recent content history
          recentContent: contentInfo.recentContent,
          
          // Content validation status
          contentValidation: {
            lastValidation: contentInfo.lastValidation,
            validationStatus: contentInfo.validationStatus,
            issues: contentInfo.validationIssues
          }
        },

        // Real Inventory Data (from Broadsign Inventory API)
        inventoryData: {
          // Current availability
          availability: {
            current: inventoryData.currentAvailability,
            next7Days: inventoryData.next7DaysAvailability,
            next30Days: inventoryData.next30DaysAvailability
          },
          
          // Loop configuration
          loopStructure: {
            loopDuration: inventoryData.loopDuration,
            slotDuration: inventoryData.defaultSlotDuration,
            totalSlotsPerLoop: inventoryData.totalSlotsPerLoop,
            availableSlots: inventoryData.availableSlots,
            bookedSlots: inventoryData.bookedSlots,
            loopsPerHour: inventoryData.loopsPerHour,
            loopsPerDay: inventoryData.loopsPerDay
          },

          // Play frequency data
          frequency: {
            playsPerLoop: inventoryData.availableSlots,
            playsPerHour: inventoryData.playsPerHour,
            playsPerDay: inventoryData.playsPerDay,
            maxFrequency: inventoryData.maxFrequency
          },

          // Share of Voice calculations
          shareOfVoice: {
            available: inventoryData.availableSOV,
            booked: inventoryData.bookedSOV,
            maximum: inventoryData.maximumSOV
          },

          // Saturation metrics
          saturation: {
            current: inventoryData.currentSaturation,
            average: inventoryData.averageSaturation,
            peak: inventoryData.peakSaturation
          },

          // Booking constraints
          constraints: {
            minBookingDuration: inventoryData.minBookingDuration,
            maxBookingDuration: inventoryData.maxBookingDuration,
            bookingLeadTime: inventoryData.bookingLeadTime,
            cancellationPolicy: inventoryData.cancellationPolicy
          }
        },

        // Current Bookings (from Booking API)
        bookingData: {
          currentBookings: bookingData.current,
          upcomingBookings: bookingData.upcoming,
          totalRevenue: bookingData.totalRevenue,
          averageBookingValue: bookingData.averageBookingValue,
          topClients: bookingData.topClients,
          bookingTrends: bookingData.trends
        },

        // Venue & Location Data (from Venue API)
        locationData: {
          venue: {
            venueId: venueData.id,
            venueName: venueData.name,
            venueType: venueData.type,
            venueCategory: venueData.category,
            operatingHours: venueData.operatingHours,
            footTraffic: venueData.footTraffic,
            demographics: venueData.demographics
          },
          
                     coordinates: {
             latitude: venueData?.coordinates?.lat || 0,
             longitude: venueData?.coordinates?.lng || 0,
             altitude: venueData?.coordinates?.alt || 0,
             accuracy: venueData?.coordinates?.accuracy || 0
           },
           
           address: {
             street: venueData?.address?.street || '',
             city: venueData?.address?.city || '',
             state: venueData?.address?.state || '',
             country: venueData?.address?.country || '',
             postalCode: venueData?.address?.postalCode || '',
             timezone: venueData?.address?.timezone || ''
           },

                     environment: {
             indoor: venueData?.environment?.isIndoor || false,
             weatherProtected: venueData?.environment?.weatherProtected || false,
             lightingConditions: venueData?.environment?.lightingConditions || 'unknown',
             noiseLevel: venueData?.environment?.noiseLevel || 'unknown',
             accessibilityFeatures: venueData?.environment?.accessibility || []
           },

          // Nearby POIs and businesses
          pointsOfInterest: venueData.nearbyPOIs,
          businessDensity: venueData.businessDensity,
          competitorScreens: venueData.competitorScreens
        },

        // Performance Metrics (from Analytics API)
        performanceMetrics: {
          // Impression data
          impressions: {
            daily: performanceMetrics.impressions.daily,
            weekly: performanceMetrics.impressions.weekly,
            monthly: performanceMetrics.impressions.monthly,
            trends: performanceMetrics.impressions.trends
          },

          // Play statistics
          plays: {
            successful: performanceMetrics.plays.successful,
            failed: performanceMetrics.plays.failed,
            skipped: performanceMetrics.plays.skipped,
            averageDuration: performanceMetrics.plays.averageDuration
          },

          // Technical performance
          technical: {
            uptime: performanceMetrics.uptime.percentage,
            responseTime: performanceMetrics.responseTime.average,
            errorRate: performanceMetrics.errors.rate,
            lastMaintenance: performanceMetrics.maintenance.lastDate
          },

          // Content delivery performance
          contentDelivery: {
            downloadSpeed: performanceMetrics.content.downloadSpeed,
            cacheHitRate: performanceMetrics.content.cacheHitRate,
            contentErrors: performanceMetrics.content.errors
          }
        },

        // Real-time Audience Data (if available)
        audienceData: {
          current: {
            viewerCount: audienceData.current.viewers,
            demographics: audienceData.current.demographics,
            attentionTime: audienceData.current.attentionTime,
            engagementScore: audienceData.current.engagement
          },
          
          historical: {
            averageViewers: audienceData.historical.averageViewers,
            peakViewers: audienceData.historical.peakViewers,
            peakHours: audienceData.historical.peakHours,
            demographicBreakdown: audienceData.historical.demographics
          },

          // Audience insights
          insights: {
            primaryAudience: audienceData.insights.primaryAudience,
            secondaryAudience: audienceData.insights.secondaryAudience,
            viewingPatterns: audienceData.insights.patterns,
            recommendedContent: audienceData.insights.contentRecommendations
          }
        },

        // Available Packages & Bundles (from Bundle API)
        commercialData: {
          packages: bundleConfig.availablePackages,
          pricing: bundleConfig.pricing,
          discounts: bundleConfig.discounts,
          seasonalRates: bundleConfig.seasonalRates,
          minimumSpend: bundleConfig.minimumSpend,
          
          // Revenue optimization
          revenueOptimization: {
            suggestedPricing: bundleConfig.suggestedPricing,
            demandForecast: bundleConfig.demandForecast,
            competitorPricing: bundleConfig.competitorPricing
          }
        },

        // Integration capabilities
        integrationCapabilities: {
          realTimeUpdates: true,
          dynamicContent: playerStatus.supportsDynamicContent,
          interactiveContent: displayInfo.hasTouchScreen,
          audienceTracking: audienceData.available,
          weatherTriggers: playerStatus.supportsWeatherTriggers,
          dataFeeds: playerStatus.supportsDataFeeds,
          apiAccess: true,
          webhooks: true
        },

        // Data freshness and reliability
        dataMetadata: {
          lastUpdated: new Date().toISOString(),
          dataSource: 'Broadsign Control API',
          reliability: 'high',
          updateFrequency: 'real-time',
          apiVersion: playerStatus.apiVersion
        }
      };

    } catch (error) {
      console.error('Error fetching enriched Broadsign data:', error);
      // Fallback to basic enriched data if API calls fail
      return generateEnrichedData(screen, 'broadsign');
    }
  };

  // Simulate Broadsign API calls (replace with actual API calls in production)
  const simulateBroadsignAPI = async (url: string, options: any = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Generate realistic mock data based on the endpoint
    const endpoint = url.split('/').pop();
    
    if (url.includes('/displays/')) {
      return {
        id: options.screenId || 'BS001',
        name: 'Mall Principal - Entrada Norte',
        description: 'Pantalla principal en entrada norte del centro comercial',
        width: 1920,
        height: 1080,
        resolution: 'Full HD (1920x1080)',
        diagonal: 55,
        pixelPitch: 1.2,
        brightness: 3000,
        contrast: 3000,
        viewingAngle: 178,
        orientation: 'landscape',
        hasTouchScreen: false,
        hasAudio: true,
        venueId: 'venue_001'
      };
    }
    
    if (url.includes('/players/') && url.includes('/status')) {
      return {
        playerId: 'player_001',
        playerType: 'Broadsign Player',
        operatingSystem: 'Windows 10 IoT',
        softwareVersion: '15.10.2',
        isOnline: Math.random() > 0.1,
        lastHeartbeat: new Date().toISOString(),
        supportsDynamicContent: true,
        supportsWeatherTriggers: true,
        supportsDataFeeds: true,
        apiVersion: 'v2.1'
      };
    }
    
    if (url.includes('/loops/current/')) {
      return {
        loopId: 'loop_001',
        name: 'Mall Principal - Mix Comercial',
        duration: 90,
        totalSlots: 6,
        currentPosition: Math.floor(Math.random() * 6),
        nextRefresh: new Date(Date.now() + 300000).toISOString()
      };
    }
    
    if (url.includes('/inventory/') && url.includes('/availability')) {
      const totalSlots = 6;
      const availableSlots = Math.floor(Math.random() * totalSlots) + 1;
      const bookedSlots = totalSlots - availableSlots;
      
      return {
        currentAvailability: (availableSlots / totalSlots) * 100,
        next7DaysAvailability: Math.random() * 40 + 30,
        next30DaysAvailability: Math.random() * 60 + 20,
        loopDuration: 90,
        defaultSlotDuration: 15,
        totalSlotsPerLoop: totalSlots,
        availableSlots: availableSlots,
        bookedSlots: bookedSlots,
        loopsPerHour: 40,
        loopsPerDay: availableSlots * 40 * 24,
        playsPerHour: availableSlots * 40,
        playsPerDay: availableSlots * 40 * 24,
        maxFrequency: totalSlots * 40,
        availableSOV: (availableSlots / totalSlots) * 100,
        bookedSOV: (bookedSlots / totalSlots) * 100,
        maximumSOV: 100,
        currentSaturation: bookedSlots / totalSlots,
        averageSaturation: Math.random() * 0.4 + 0.3,
        peakSaturation: Math.random() * 0.3 + 0.7,
        minBookingDuration: 1,
        maxBookingDuration: 365,
        bookingLeadTime: 2,
        cancellationPolicy: '24h notice required'
      };
    }
    
    if (url.includes('/bookings/') && url.includes('/current')) {
      return {
        current: [
          { client: 'Coca-Cola', campaign: 'Summer 2024', slots: 2, value: 2500000 },
          { client: 'Nike', campaign: 'Air Max', slots: 1, value: 1800000 }
        ],
        upcoming: [
          { client: 'Samsung', campaign: 'Galaxy S24', startDate: '2024-01-15', slots: 3, value: 4500000 }
        ],
        totalRevenue: 15800000,
        averageBookingValue: 2500000,
        topClients: ['Coca-Cola', 'Nike', 'Samsung'],
        trends: { growth: 15.2, seasonality: 'high' }
      };
    }
    
    if (url.includes('/players/') && url.includes('/hardware')) {
      return {
        cpu: {
          usage: Math.floor(Math.random() * 40) + 10,
          temperature: Math.floor(Math.random() * 20) + 35
        },
        memory: {
          usage: Math.floor(Math.random() * 60) + 20,
          total: 8192
        },
        disk: {
          usage: Math.floor(Math.random() * 50) + 30,
          total: 512
        },
        power: {
          status: 'stable',
          voltage: 220
        },
        cooling: {
          fanSpeed: Math.floor(Math.random() * 2000) + 1000
        },
        temperature: {
          internal: Math.floor(Math.random() * 25) + 35
        },
        uptime: Math.floor(Math.random() * 48) + 120
      };
    }
    
    if (url.includes('/players/') && url.includes('/network')) {
      return {
        connectionType: 'Ethernet',
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 100 + 100),
        macAddress: '00:1B:44:11:3A:B7',
        bandwidth: Math.floor(Math.random() * 500) + 100,
        latency: Math.floor(Math.random() * 50) + 10,
        signalStrength: Math.floor(Math.random() * 20) + 80,
        dataUsage: Math.floor(Math.random() * 50) + 10,
        vpnConnected: Math.random() > 0.5
      };
    }
    
    if (url.includes('/content/') && url.includes('/current')) {
      return {
        currentContentId: 'content_' + Math.floor(Math.random() * 1000),
        currentContentName: 'Anuncio Coca-Cola Summer',
        currentContentType: 'video',
        startTime: new Date(Date.now() - 5000).toISOString(),
        endTime: new Date(Date.now() + 10000).toISOString(),
        remainingTime: 10,
        recentContent: [
          { name: 'Nike Air Max', duration: 15, playTime: new Date(Date.now() - 60000).toISOString() },
          { name: 'Samsung Galaxy', duration: 20, playTime: new Date(Date.now() - 120000).toISOString() }
        ],
        lastValidation: new Date().toISOString(),
        validationStatus: 'passed',
        validationIssues: []
      };
    }
    
    if (url.includes('/venues/')) {
      return {
        id: 'venue_001',
        name: 'Centro Comercial Santa Fe',
        type: 'Shopping Mall',
        category: 'Retail',
        operatingHours: { open: '10:00', close: '22:00' },
        footTraffic: 45000,
        demographics: {
          age: { '18-24': 25, '25-34': 35, '35-44': 25, '45+': 15 },
          gender: { male: 45, female: 55 },
          income: { low: 20, medium: 50, high: 30 }
        },
        coordinates: {
          lat: 6.2442,
          lng: -75.5812,
          alt: 1495,
          accuracy: 5
        },
        address: {
          street: 'Calle 185 # 45-03',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'Colombia',
          postalCode: '110001',
          timezone: 'America/Bogota'
        },
        environment: {
          isIndoor: true,
          weatherProtected: true,
          lightingConditions: 'artificial',
          noiseLevel: 'moderate',
          accessibility: ['wheelchair', 'elevators', 'parking']
        },
        nearbyPOIs: ['Starbucks', 'McDonald\'s', 'Zara', 'Falabella', 'Cine Colombia'],
        businessDensity: 'high',
        competitorScreens: 3
      };
    }
    
    if (url.includes('/analytics/displays/') && url.includes('/performance')) {
      return {
        impressions: {
          daily: Math.floor(Math.random() * 30000) + 20000,
          weekly: Math.floor(Math.random() * 200000) + 150000,
          monthly: Math.floor(Math.random() * 800000) + 600000,
          trends: { growth: 12.5, seasonal: 'stable' }
        },
        plays: {
          successful: Math.floor(Math.random() * 2000) + 1500,
          failed: Math.floor(Math.random() * 50) + 10,
          skipped: Math.floor(Math.random() * 20) + 5,
          averageDuration: 15.2
        },
        uptime: {
          percentage: Math.floor(Math.random() * 5) + 95
        },
        responseTime: {
          average: Math.floor(Math.random() * 100) + 50
        },
        errors: {
          rate: Math.random() * 2 + 0.5
        },
        maintenance: {
          lastDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        },
        content: {
          downloadSpeed: Math.floor(Math.random() * 50) + 20,
          cacheHitRate: Math.floor(Math.random() * 20) + 80,
          errors: Math.floor(Math.random() * 10) + 2
        }
      };
    }
    
    if (url.includes('/bundles/') && url.includes('/available')) {
      return {
        availablePackages: [
          'Plays per Loop (1-6 spots/loop)',
          'Share of Voice (16.7-100%)',
          'Hourly Packages',
          'Daily Packages',
          'Weekly Packages',
          'Goal-Based (Impressions)',
          'Goal-Based (Budget)'
        ],
        pricing: {
          perPlay: 3500,
          hourly: 85000,
          daily: 450000,
          weekly: 2800000,
          monthly: 9500000
        },
        discounts: {
          volume: { threshold: 1000000, discount: 0.15 },
          longTerm: { threshold: 30, discount: 0.10 }
        },
        seasonalRates: {
          high: 1.3,
          medium: 1.0,
          low: 0.8
        },
        minimumSpend: 500000,
        suggestedPricing: 4200,
        demandForecast: 'high',
        competitorPricing: { min: 3000, max: 5000, avg: 3800 }
      };
    }
    
    if (url.includes('/audience/') && url.includes('/current')) {
      return {
        available: Math.random() > 0.3, // 70% chance of having audience data
        current: {
          viewers: Math.floor(Math.random() * 50) + 10,
          demographics: {
            age: { '18-24': 30, '25-34': 40, '35-44': 20, '45+': 10 },
            gender: { male: 48, female: 52 }
          },
          attentionTime: Math.floor(Math.random() * 10) + 5,
          engagement: Math.floor(Math.random() * 30) + 70
        },
        historical: {
          averageViewers: Math.floor(Math.random() * 40) + 25,
          peakViewers: Math.floor(Math.random() * 80) + 60,
          peakHours: ['12:00-14:00', '18:00-20:00'],
          demographics: {
            primary: 'Adults 25-34',
            secondary: 'Adults 18-24'
          }
        },
        insights: {
          primaryAudience: 'Young professionals',
          secondaryAudience: 'Students',
          patterns: 'High traffic during lunch and evening hours',
          contentRecommendations: ['Fashion', 'Technology', 'Food & Beverage']
        }
      };
    }
    
    // Default return for unknown endpoints
    return {
      success: true,
      timestamp: new Date().toISOString(),
      endpoint: endpoint
    };
  };

  // Function to generate enriched data for screens
  const generateEnrichedData = (screen: any, provider: string) => {
    // Calculate real Broadsign-style inventory data
    const loopDuration = 90; // seconds - typical Broadsign loop
    const slotDuration = 15; // seconds per spot
    const totalSlotsPerLoop = Math.floor(loopDuration / slotDuration); // 6 slots
    const loopsPerHour = 3600 / loopDuration; // 40 loops per hour
    
    // Real inventory calculations based on Broadsign API
    const availableSlots = Math.floor(Math.random() * totalSlotsPerLoop) + 1; // 1-6 slots available
    const bookedSlots = totalSlotsPerLoop - availableSlots;
    const currentSaturation = bookedSlots / totalSlotsPerLoop; // Current saturation (0-1)
    const availableSaturation = 1 - currentSaturation; // Available saturation
    
    // Spots and frequency data (como lo trae la API de Broadsign)
    const playsPerLoop = availableSlots; // Exact spots available per loop
    const playsPerHour = playsPerLoop * loopsPerHour; // Total plays per hour
    const dailyPlays = playsPerHour * 24; // Total daily plays available
    
    // Share of Voice calculations
    const availableSOV = (availableSlots * slotDuration / loopDuration) * 100; // % of loop available
    const bookedSOV = (bookedSlots * slotDuration / loopDuration) * 100; // % already booked
    
    // Audience calculations based on inventory
    const dailyImpressions = Math.floor(Math.random() * 50000) + 10000;
    const impressionsPerPlay = Math.floor(dailyImpressions / dailyPlays);
    
    const baseData = {
      // Basic Screen Info
      name: screen.name,
      id: screen.id,
      status: screen.status,
      resolution: screen.resolution,
      location: screen.location,
      
      // REAL BROADSIGN INVENTORY DATA (from API)
      inventoryData: {
        loopDuration: loopDuration, // seconds
        slotDuration: slotDuration, // seconds per spot
        totalSlotsPerLoop: totalSlotsPerLoop,
        availableSlots: availableSlots, // Exact slots available
        bookedSlots: bookedSlots,
        loopsPerHour: loopsPerHour,
        
        // Frequency & Spots (exactos de Broadsign API)
        playsPerLoop: playsPerLoop, // SPOTS exactos por loop
        playsPerHour: playsPerHour, // SPOTS por hora
        dailyPlays: dailyPlays, // SPOTS diarios disponibles
        
        // Share of Voice (% del loop)
        availableSOV: parseFloat(availableSOV.toFixed(1)), // % disponible del loop
        bookedSOV: parseFloat(bookedSOV.toFixed(1)), // % ya ocupado
        maxSOV: 100, // Máximo posible
        
        // Saturation (factor 0-1)
        currentSaturation: parseFloat(currentSaturation.toFixed(2)),
        availableSaturation: parseFloat(availableSaturation.toFixed(2)),
        maxSaturation: 1.0,
        
        // Availability percentage (como en Broadsign Direct)
        availabilityPercent: parseFloat((availableSaturation * 100).toFixed(1))
      },
      
      // Audience Data (calculada basada en inventory)
      audienceData: {
        dailyImpressions: dailyImpressions,
        impressionsPerPlay: impressionsPerPlay,
        estimatedCPM: Math.floor(Math.random() * 5000) + 2000,
        peakHours: ['12:00-14:00', '18:00-20:00']
      },
      
      // Technical Configuration
      orientation: screen.resolution.includes('1920x1080') ? 'Horizontal' : 'Vertical',
      brightness: Math.floor(Math.random() * 300) + 200 + ' nits',
      refreshRate: '60 Hz',
      connectivityType: provider === 'broadsign' ? '4G/WiFi/Ethernet' : '4G/WiFi',
      operatingSystem: provider === 'broadsign' ? 'Windows 10 IoT' : 'Android',
      storage: Math.floor(Math.random() * 256) + 64 + ' GB',
      
      // Enhanced Location Data
      coordinates: {
        lat: 6.2442 + Math.random() * 0.1,
        lng: -75.5812 + Math.random() * 0.1
      },
      venue: screen.name.includes('Mall') ? 'Centro Comercial' : 
             screen.name.includes('Metro') ? 'Transporte Público' :
             screen.name.includes('Aeropuerto') ? 'Aeropuerto' : 'Comercial',
      floor: Math.floor(Math.random() * 3) + 1,
      nearbyBusinesses: ['Starbucks', 'McDonald\'s', 'Zara', 'Bancolombia'].slice(0, Math.floor(Math.random() * 3) + 1),
      
      // Commercial Data (basado en inventory real)
      rateCard: {
        // Precios basados en disponibilidad real
        costPerPlay: Math.floor(Math.random() * 5000) + 2000, // Por spot individual
        hourlyRate: Math.floor(playsPerHour * (Math.random() * 3000 + 1500)), // Por hora basado en spots
        dailyRate: Math.floor(dailyPlays * (Math.random() * 1500 + 800)), // Por día basado en spots
        weeklyRate: Math.floor(dailyPlays * 7 * (Math.random() * 1200 + 600)), // Semanal
        currency: 'COP'
      },
      
      // Available Package Types (Broadsign real types)
      availablePackages: provider === 'broadsign' || provider === 'latinad' ? [
        `Plays per Loop (${playsPerLoop} spots/loop máx.)`,
        `Share of Voice (${availableSOV.toFixed(1)}% disponible)`,
        'Paquetes por Horas',
        'Paquetes Diarios',
        'Campañas Goal-Based (impresiones)',
        'Campañas Goal-Based (presupuesto)'
      ] : [
        'Depende del CMS',
        'Configuración personalizada'
      ],
      
      // Performance Metrics
      uptime: Math.floor(Math.random() * 5) + 95 + '%',
      fillRate: parseFloat((currentSaturation * 100).toFixed(1)) + '%', // Fill rate real basado en inventory
      lastMaintenance: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
    
    return baseData;
  };

  // Real-time monitoring functions
  const performHealthCheck = async (screen: any) => {
    // Simulate API call to Broadsign Control for health check
    const healthData = {
      isOnline: Math.random() > 0.1, // 90% uptime simulation
      lastPing: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      internetConnectivity: Math.random() > 0.05, // 95% internet uptime
      contentPlaying: Math.random() > 0.02, // 98% content success rate
      diskSpace: Math.floor(Math.random() * 50) + 50, // 50-100% free space
      cpuUsage: Math.floor(Math.random() * 40) + 10, // 10-50% CPU usage
      temperature: Math.floor(Math.random() * 20) + 35, // 35-55°C
      lastContentUpdate: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
    };

    setRealTimeMonitoring(prev => ({
      ...prev,
      [screen.id]: {
        ...healthData,
        uptimeToday: calculateUptimeToday(screen.id, healthData.isOnline),
        alertStatus: getAlertStatus(healthData)
      }
    }));

    return healthData;
  };

  const calculateUptimeToday = (screenId: string, isCurrentlyOnline: boolean) => {
    // In a real implementation, this would calculate from historical data
    const currentHour = new Date().getHours();
    const baseUptime = 95 + Math.random() * 4; // 95-99%
    return isCurrentlyOnline ? baseUptime : Math.max(baseUptime - 10, 80);
  };

  const getAlertStatus = (healthData: any) => {
    if (!healthData.isOnline) return { level: 'critical', message: 'Pantalla desconectada' };
    if (!healthData.internetConnectivity) return { level: 'warning', message: 'Sin conexión a internet' };
    if (!healthData.contentPlaying) return { level: 'warning', message: 'Contenido no reproduciéndose' };
    if (healthData.diskSpace < 20) return { level: 'warning', message: 'Poco espacio en disco' };
    if (healthData.temperature > 50) return { level: 'warning', message: 'Temperatura alta' };
    return { level: 'healthy', message: 'Funcionando correctamente' };
  };

  const startRealTimeMonitoring = (screens: any[]) => {
    // Clear existing interval
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }

    // Perform initial health check for all screens
    screens.forEach(screen => {
      performHealthCheck(screen);
    });

    // Set up periodic health checks every 30 seconds
    const interval = setInterval(() => {
      screens.forEach(screen => {
        performHealthCheck(screen);
      });
    }, 30000);

    setHealthCheckInterval(interval);
  };

  const stopRealTimeMonitoring = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      setHealthCheckInterval(null);
    }
    setRealTimeMonitoring({});
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealTimeMonitoring();
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (selectedProvider === 'broadsign') {
        // Enhanced Broadsign connection with comprehensive API data
        const baseScreens = [
          { id: 'BS001', name: 'Mall Principal - Entrada Norte', status: 'online', resolution: '1920x1080', location: 'Medellín' },
          { id: 'BS002', name: 'Mall Principal - Food Court', status: 'online', resolution: '1920x1080', location: 'Medellín' },
          { id: 'BS003', name: 'Estación Metro - Andén A', status: 'online', resolution: '1366x768', location: 'Medellín' },
          { id: 'BS004', name: 'Centro Comercial - Piso 2', status: 'offline', resolution: '1920x1080', location: 'Bogotá' },
          { id: 'BS005', name: 'Aeropuerto - Terminal Nacional', status: 'online', resolution: '3840x2160', location: 'Bogotá' }
        ];

        // Get enriched data using comprehensive Broadsign API integration
        const enrichedScreens = await Promise.all(
          baseScreens.map(async screen => {
            const enrichedData = await generateEnrichedBroadsignData(screen, broadsignConfig);
            return { ...screen, enrichedData };
          })
        );

        setBroadsignConfig(prev => ({ ...prev, availableScreens: enrichedScreens }));
        setSelectedScreens(enrichedScreens.map(s => s.id));
        
        // Start real-time monitoring for Broadsign screens
        startRealTimeMonitoring(enrichedScreens);
      } else if (selectedProvider === 'latinad') {
        // Mock LatinAd connection with enriched data
        const mockScreens = [
          { id: 'LA001', name: 'Mall Plaza - Hall Principal', status: 'online', resolution: '1920x1080', plan: 'free' },
          { id: 'LA002', name: 'Terminal Bus - Sala Espera', status: 'online', resolution: '1366x768', plan: 'free' },
          { id: 'LA003', name: 'Universidad - Cafetería', status: 'online', resolution: '1920x1080', plan: 'pro' }
        ].map(screen => ({ ...screen, enrichedData: generateEnrichedData(screen, 'latinad') }));
        setLatinadConfig(prev => ({ ...prev, availableScreens: mockScreens }));
        setSelectedScreens(mockScreens.map(s => s.id));
      } else if (selectedProvider === 'api') {
        // Mock API connection with enriched data
        const mockScreens = [
          { id: 'API001', name: 'Pantalla Personalizada 1', status: 'active', resolution: '1920x1080' },
          { id: 'API002', name: 'Pantalla Personalizada 2', status: 'active', resolution: '1366x768' }
        ].map(screen => ({ ...screen, enrichedData: generateEnrichedData(screen, 'api') }));
        setApiConfig(prev => ({ ...prev, availableScreens: mockScreens }));
        setSelectedScreens(mockScreens.map(s => s.id));
      }

      setIsConnected(true);
    } catch (error) {
      setConnectionError('Error de conexión. Verifica tus credenciales.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleScreenSelection = (screenId: string, checked: boolean) => {
    if (checked) {
      setSelectedScreens(prev => [...prev, screenId]);
    } else {
      setSelectedScreens(prev => prev.filter(id => id !== screenId));
    }
  };

  const handleShowPreview = () => {
    setShowPreview(true);
  };

  const handleBackToSelection = () => {
    setShowPreview(false);
  };

  const getSelectedScreensData = () => {
    const allScreens = selectedProvider === 'broadsign' ? broadsignConfig.availableScreens :
                      selectedProvider === 'latinad' ? latinadConfig.availableScreens :
                      apiConfig.availableScreens;
    return allScreens
      .filter(screen => selectedScreens.includes(screen.id))
      .map(screen => {
        // Always generate fresh enriched data to avoid undefined errors
        const enrichedData = generateEnrichedData(screen, selectedProvider || 'api');
        return { 
          ...screen, 
          ...enrichedData,
          // Ensure all required data is present
          inventoryData: enrichedData.inventoryData || {},
          audienceData: enrichedData.audienceData || {},
          rateCard: enrichedData.rateCard || {}
        };
      });
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const importData = {
        provider: selectedProvider,
        screens: selectedProvider === 'broadsign' ? broadsignConfig.availableScreens :
                selectedProvider === 'latinad' ? latinadConfig.availableScreens :
                apiConfig.availableScreens,
        config: selectedProvider === 'broadsign' ? broadsignConfig :
               selectedProvider === 'latinad' ? latinadConfig :
               apiConfig
      };

      onImport(importData);
    } catch (error) {
      setConnectionError('Error durante la importación.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Importar Inventario</h2>
            <p className="text-gray-600 mt-1">
              Conecta tu CMS existente para importar pantallas masivamente
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!selectedProvider ? (
            /* Provider Selection */
            <div className="space-y-6">


              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selecciona tu plataforma CMS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {providers.map((provider) => (
                    <motion.div
                      key={provider.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleProviderSelect(provider.id as any)}
                      className="cursor-pointer border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-4 right-4">
                        <span className={`${provider.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                          {provider.badge}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className={`w-12 h-12 bg-${provider.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                          <provider.icon className={`w-6 h-6 text-${provider.color}-600`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{provider.name}</h4>
                        <p className="text-gray-600 text-sm mb-4">{provider.description}</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-gray-700">Características principales:</h5>
                        <ul className="space-y-1">
                          {provider.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                              <div className={`w-1.5 h-1.5 rounded-full bg-${provider.color}-500 mt-1.5 flex-shrink-0`} />
                              <span className="leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                          <span>Configurar</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Provider Configuration */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500 rotate-180" />
                </button>
                <div className="flex items-center gap-3">
                  {selectedProvider === 'broadsign' && <Building className="w-6 h-6 text-blue-600" />}
                  {selectedProvider === 'latinad' && <Globe className="w-6 h-6 text-purple-600" />}
                  {selectedProvider === 'api' && <Signal className="w-6 h-6 text-gray-600" />}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {providers.find(p => p.id === selectedProvider)?.name}
                  </h3>
                </div>
              </div>

              {/* Connection Configuration */}
              {!isConnected ? (
                <div className="space-y-4">
                  {selectedProvider === 'broadsign' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-blue-900 mb-1">Conexión Broadsign Enterprise</h5>
                            <p className="text-sm text-blue-800 mb-3">
                              Conecta con tu servidor Broadsign Control para acceder hasta 10,000 pantallas. 
                              Requiere permisos de API habilitados.
                            </p>
                            
                            {/* Beneficios Clave */}
                            <div className="bg-white rounded-lg border border-blue-200 p-3 mb-3">
                              <h6 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Beneficios Clave
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <ul className="text-blue-700 space-y-0.5">
                                    <li>✅ <strong>Datos en Tiempo Real:</strong> Inventario, estado de hardware, audiencia</li>
                                    <li>✅ <strong>Precisión Comercial:</strong> Precios basados en disponibilidad real</li>
                                    <li>✅ <strong>Monitoreo Completo:</strong> Estado técnico y de rendimiento</li>
                                  </ul>
                                </div>
                                <div>
                                  <ul className="text-blue-700 space-y-0.5">
                                    <li>✅ <strong>Optimización de Ingresos:</strong> Sugerencias de precios y demanda</li>
                                    <li>✅ <strong>Integración Nativa:</strong> Compatible con toda la suite Broadsign</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Tipos de Datos Disponibles */}
                            <div className="bg-white rounded-lg border border-blue-200 p-3 mb-3">
                              <h6 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Tipos de Datos Disponibles
                              </h6>
                              <div className="grid grid-cols-1 md:grid-2 gap-3 text-xs">
                                <div>
                                  <ul className="text-blue-700 space-y-0.5">
                                    <li><strong>Inventario Real:</strong> Slots exactos, SOV, saturación</li>
                                    <li><strong>Hardware:</strong> CPU, memoria, temperatura, red</li>
                                    <li><strong>Contenido:</strong> Qué se reproduce, validación, historial</li>
                                  </ul>
                                </div>
                                <div>
                                  <ul className="text-blue-700 space-y-0.5">
                                    <li><strong>Audiencia:</strong> Demográficos, engagement, patrones</li>
                                    <li><strong>Comercial:</strong> Precios dinámicos, descuentos, competencia</li>
                                    <li><strong>Ubicación:</strong> Venue, POIs, tráfico, ambiente</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Capacidades específicas de Broadsign */}
                            <div className="bg-white rounded-lg border border-blue-200 p-3">
                              <h6 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                Capacidades de Venta Broadsign
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-green-700 font-medium mb-1">✅ SÍ puedes vender:</p>
                                  <ul className="text-green-600 space-y-0.5">
                                    <li>• Paquetes por Horas (mín. 1-2h)</li>
                                    <li>• Paquetes Diarios</li>
                                    <li>• Paquetes Semanales/Mensuales</li>
                                    <li>• Campañas corporativas tradicionales</li>
                                    <li>• Share of Voice & Frequency buys</li>
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-red-700 font-medium mb-1">❌ NO puedes vender:</p>
                                  <ul className="text-red-600 space-y-0.5">
                                    <li>• "Momentos" individuales (15-30s)</li>
                                    <li>• Spots únicos de $25,000</li>
                                    <li>• Inserción dinámica en tiempo real</li>
                                    <li>• Micro-transacciones</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                                <p className="text-xs text-amber-700">
                                  <strong>💡 Para "Momentos":</strong> Considera integrar Shareflow Screen que permite micro-transacciones en tiempo real.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            URL del Servidor Broadsign
                          </label>
                          <input
                            type="url"
                            value={broadsignConfig.serverUrl}
                            onChange={(e) => setBroadsignConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                            placeholder="https://your-server.broadsign.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Dominio
                          </label>
                          <input
                            type="text"
                            value={broadsignConfig.domain}
                            onChange={(e) => setBroadsignConfig(prev => ({ ...prev, domain: e.target.value }))}
                            placeholder="your-domain"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Usuario API
                          </label>
                          <input
                            type="text"
                            value={broadsignConfig.username}
                            onChange={(e) => setBroadsignConfig(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="usuario@empresa.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            API Key / Contraseña
                          </label>
                          <input
                            type="password"
                            value={broadsignConfig.password}
                            onChange={(e) => setBroadsignConfig(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProvider === 'latinad' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-purple-900 mb-1">Ecosistema LatinAd</h5>
                            <p className="text-sm text-purple-800 mb-3">
                              Conecta tu cuenta LatinAd CMS. Plan gratuito incluye hasta 10 pantallas.
                            </p>
                            
                            {/* Capacidades específicas de LatinAd */}
                            <div className="bg-white rounded-lg border border-purple-200 p-3">
                              <h6 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Capacidades de Venta LatinAd
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-green-700 font-medium mb-1">✅ SÍ puedes vender:</p>
                                  <ul className="text-green-600 space-y-0.5">
                                    <li>• Paquetes por Horas</li>
                                    <li>• Paquetes Diarios/Semanales</li>
                                    <li>• Campañas programáticas</li>
                                    <li>• Integración ecosistema DOOH</li>
                                    <li>• Gestión multi-red</li>
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-red-700 font-medium mb-1">❌ NO puedes vender:</p>
                                  <ul className="text-red-600 space-y-0.5">
                                    <li>• "Momentos" individuales</li>
                                    <li>• Micro-transacciones</li>
                                    <li>• Spots de corta duración</li>
                                    <li>• Inserción dinámica inmediata</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                                <p className="text-xs text-amber-700">
                                  <strong>💡 Para "Momentos":</strong> Considera integrar Shareflow Screen para micro-transacciones en tiempo real.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Email LatinAd
                          </label>
                          <input
                            type="email"
                            value={latinadConfig.email}
                            onChange={(e) => setLatinadConfig(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="tu-email@empresa.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Contraseña
                          </label>
                          <input
                            type="password"
                            value={latinadConfig.password}
                            onChange={(e) => setLatinadConfig(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProvider === 'api' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">API Personalizada</h5>
                            <p className="text-sm text-gray-700 mb-3">
                              Conecta cualquier sistema que exponga datos de pantallas mediante API REST o archivos.
                            </p>
                            
                            {/* Capacidades específicas de API */}
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                              <h6 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <Signal className="w-4 h-4" />
                                Capacidades de Venta API
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-green-700 font-medium mb-1">✅ SÍ puedes vender:</p>
                                  <ul className="text-green-600 space-y-0.5">
                                    <li>• Paquetes tradicionales</li>
                                    <li>• Integración flexible</li>
                                    <li>• Control programático</li>
                                    <li>• Configuración personalizada</li>
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-orange-700 font-medium mb-1">⚠️ Limitaciones:</p>
                                  <ul className="text-orange-600 space-y-0.5">
                                    <li>• Depende del CMS subyacente</li>
                                    <li>• Requiere desarrollo custom</li>
                                    <li>• Sin garantías de funcionalidad</li>
                                    <li>• Soporte limitado</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-xs text-blue-700">
                                  <strong>💡 Recomendación:</strong> Para funcionalidades avanzadas, usa Shareflow Screen nativo o integra un CMS empresarial.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Endpoint API
                          </label>
                          <input
                            type="url"
                            value={apiConfig.endpoint}
                            onChange={(e) => setApiConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                            placeholder="https://api.ejemplo.com/screens"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={apiConfig.apiKey}
                            onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="tu-api-key"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Connection Error */}
                  {connectionError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {connectionError}
                      </p>
                    </div>
                  )}

                  {/* Connect Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Network className="w-5 h-5" />
                          Conectar y Sincronizar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Connected - Show Available Screens */
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h5 className="font-semibold text-green-900">¡Conexión Exitosa!</h5>
                          <p className="text-green-700 text-sm">
                            Se encontraron {
                              selectedProvider === 'broadsign' ? broadsignConfig.availableScreens.length :
                              selectedProvider === 'latinad' ? latinadConfig.availableScreens.length :
                              apiConfig.availableScreens.length
                            } pantallas disponibles para importar
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Real-time monitoring info for Broadsign */}
                    {selectedProvider === 'broadsign' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-blue-900 flex items-center gap-2">
                              Monitoreo en Tiempo Real
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                              <span className="text-sm text-green-700">Conectado</span>
                            </h5>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Screens List */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Pantallas Disponibles</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(selectedProvider === 'broadsign' ? broadsignConfig.availableScreens :
                        selectedProvider === 'latinad' ? latinadConfig.availableScreens :
                        apiConfig.availableScreens).map((screen, index) => {
                          const monitoringData = realTimeMonitoring[screen.id];
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedScreens.includes(screen.id)}
                                onChange={(e) => handleScreenSelection(screen.id, e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              
                              {/* Real-time status indicator */}
                              <div className="relative">
                                <Monitor className="w-5 h-5 text-gray-400" />
                                {selectedProvider === 'broadsign' && monitoringData && (
                                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                    monitoringData.alertStatus?.level === 'critical' ? 'bg-red-500' :
                                    monitoringData.alertStatus?.level === 'warning' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}>
                                    {monitoringData.isOnline && (
                                      <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{screen.name}</div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {screen.location || 'Ubicación no especificada'}
                                  </span>
                                  <span>{screen.resolution}</span>
                                  
                                  {/* Real-time status */}
                                  {selectedProvider === 'broadsign' && monitoringData ? (
                                    <div className="flex items-center gap-2">
                                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        monitoringData.alertStatus?.level === 'critical' ? 'bg-red-100 text-red-700' :
                                        monitoringData.alertStatus?.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {monitoringData.isOnline ? 'En línea' : 'Desconectada'}
                                      </div>
                                      
                                      {monitoringData.internetConnectivity ? (
                                        <Tooltip content="Conexión a internet estable">
                                          <Wifi className="w-3 h-3 text-green-600" />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip content="Sin conexión a internet">
                                          <WifiOff className="w-3 h-3 text-red-600" />
                                        </Tooltip>
                                      )}
                                      
                                      {monitoringData.contentPlaying ? (
                                        <Tooltip content="Contenido reproduciéndose">
                                          <Radio className="w-3 h-3 text-blue-600" />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip content="Contenido no reproduce">
                                          <AlertTriangle className="w-3 h-3 text-yellow-600" />
                                        </Tooltip>
                                      )}
                                      
                                      <Tooltip content={`Respuesta: ${monitoringData.responseTime}ms`}>
                                        <Clock className="w-3 h-3 text-gray-500" />
                                      </Tooltip>
                                    </div>
                                  ) : (
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      screen.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {screen.status === 'online' ? 'En línea' : 'Fuera de línea'}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-xs mt-1 flex items-center gap-3">
                                  <span className="text-blue-600">
                                    {screen.enrichedData?.inventoryData?.dailyPlays?.toLocaleString()} spots/día
                                  </span>
                                  <span className="text-green-600">
                                    SoV: {screen.enrichedData?.inventoryData?.availableSOV}%
                                  </span>
                                  <span className="text-purple-600">
                                    {screen.enrichedData?.audienceData?.dailyImpressions?.toLocaleString()} imp/día
                                  </span>
                                  <span className="text-gray-500">
                                    {screen.enrichedData?.venue}
                                  </span>
                                  
                                  {/* Real-time uptime */}
                                  {selectedProvider === 'broadsign' && monitoringData && (
                                    <span className={`font-medium ${
                                      monitoringData.uptimeToday >= 95 ? 'text-green-600' :
                                      monitoringData.uptimeToday >= 90 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      Uptime hoy: {monitoringData.uptimeToday.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* Alert indicator */}
                                {selectedProvider === 'broadsign' && monitoringData?.alertStatus?.level !== 'healthy' && (
                                  <Tooltip content={monitoringData.alertStatus.message}>
                                    <AlertCircle className={`w-4 h-4 ${
                                      monitoringData.alertStatus.level === 'critical' ? 'text-red-500' : 'text-yellow-500'
                                    }`} />
                                  </Tooltip>
                                )}
                                
                                <Tooltip content="Ver datos enriquecidos en vista previa">
                                  <Eye className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer" />
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Import Progress */}
                  {isImporting && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Importando inventario...</span>
                        <span className="text-sm text-gray-500">{importProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-600">
                      {selectedScreens.length} de {
                        (selectedProvider === 'broadsign' ? broadsignConfig.availableScreens :
                         selectedProvider === 'latinad' ? latinadConfig.availableScreens :
                         apiConfig.availableScreens).length
                      } pantallas seleccionadas
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsConnected(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Reconectar
                      </button>
                      <button
                        onClick={handleShowPreview}
                        disabled={selectedScreens.length === 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        Vista Previa ({selectedScreens.length})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Screen - Show detailed data */}
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToSelection}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-500 rotate-180" />
                    </button>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Vista Previa de Importación</h4>
                      <p className="text-sm text-gray-600">
                        Revisa todos los datos que se importarán para {selectedScreens.length} pantalla(s)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {getSelectedScreensData().map((screen) => (
                      <div key={screen.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        {/* Screen Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-6 h-6 text-blue-600" />
                            <div>
                              <h5 className="font-semibold text-gray-900 text-lg">{screen.name}</h5>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span>ID: {screen.id}</span>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  screen.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {screen.status === 'online' ? 'En línea' : 'Fuera de línea'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              ${screen.rateCard?.dailyRate?.toLocaleString() || screen.enrichedData?.rateCard?.dailyRate?.toLocaleString() || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">COP / día</div>
                          </div>
                        </div>

                        {/* Audience and Performance Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Audience Analytics */}
                          <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-indigo-100 rounded-lg">
                                <Users className="w-6 h-6 text-indigo-600" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900">Perfil de Audiencia</h4>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">Impresiones diarias:</span>
                                  <span className="text-lg font-bold text-indigo-600">
                                    {screen.audienceData?.dailyImpressions?.toLocaleString() || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Impresiones por spot:</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {screen.audienceData?.impressionsPerPlay?.toLocaleString() || 'N/A'}
                                </span>
                              </div>
                              
                              <div className="bg-indigo-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-indigo-800">CPM estimado:</span>
                                  <span className="text-xl font-bold text-indigo-700">
                                    ${screen.audienceData?.estimatedCPM?.toLocaleString() || 'N/A'} COP
                                  </span>
                                </div>
                                <div className="w-full h-1 bg-indigo-200 rounded-full mt-2">
                                  <div className="h-1 bg-indigo-500 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                              </div>
                              
                              <div className="pt-4">
                                <span className="text-sm font-medium text-gray-700 block mb-3">Horas pico:</span>
                                <div className="flex flex-wrap gap-2">
                                  {screen.audienceData?.peakHours?.map((hour: string, index: number) => (
                                    <span 
                                      key={index}
                                      className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full"
                                    >
                                      {hour}
                                    </span>
                                  )) || <span className="text-sm text-gray-500 italic">No disponible</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Broadsign Inventory Data */}
                          <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                <Activity className="w-6 h-6 text-emerald-600" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900">Datos de Inventario</h4>
                            </div>
                            
                            <div className="space-y-4">
                              {/* Loop Configuration */}
                              <div className="bg-gray-900 rounded-lg p-4">
                                <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                  Configuración de Loop:
                                </h5>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-400">
                                      {screen.inventoryData?.loopDuration || 'N/A'}s
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                                      Duración Loop
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-400">
                                      {screen.inventoryData?.slotDuration || 'N/A'}s
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                                      Duración Slot
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-white">
                                      {screen.inventoryData?.totalSlotsPerLoop || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                                      Slots Totales
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-white">
                                      {screen.inventoryData?.loopsPerHour || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                                      Loops/Hora
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Disponibilidad de Spots */}
                              <div className="bg-emerald-50 rounded-lg p-4">
                                <h5 className="font-bold text-emerald-800 mb-3">Spots Disponibles:</h5>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-emerald-700">Por loop:</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                      {screen.inventoryData?.playsPerLoop || 'N/A'} spots
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-emerald-700">Por hora:</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                      {screen.inventoryData?.playsPerHour || 'N/A'} spots
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-emerald-700">Por día:</span>
                                    <span className="text-xl font-bold text-emerald-600">
                                      {screen.inventoryData?.dailyPlays?.toLocaleString() || 'N/A'} spots
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Share of Voice */}
                              <div className="bg-gray-900 rounded-lg p-4">
                                <h5 className="font-bold text-white mb-3">Share of Voice:</h5>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-300">Disponible:</span>
                                    <span className="text-lg font-bold text-emerald-400">
                                      {screen.inventoryData?.availableSOV || 0}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-300">Ocupado:</span>
                                    <span className="text-lg font-bold text-orange-400">
                                      {screen.inventoryData?.bookedSOV || 0}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div 
                                      className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
                                      style={{ width: `${screen.inventoryData?.availableSOV || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {/* Availability Percentage */}
                              <div className="bg-emerald-600 rounded-lg p-4 text-center">
                                <div className="text-sm font-medium text-emerald-100 mb-1">
                                  Disponibilidad total
                                </div>
                                <div className="text-3xl font-bold text-white">
                                  {screen.inventoryData?.availabilityPercent || 0}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Extended Broadsign API Data - Only show for Broadsign screens */}
                        {selectedProvider === 'broadsign' && screen.enrichedData && (
                          <div className="mt-8 space-y-6">
                            <div className="text-center border-t border-gray-300 pt-6">
                              <h4 className="text-xl font-bold text-gray-900 mb-2">📡 Datos Completos del API Broadsign</h4>
                              <p className="text-sm text-gray-600">Información técnica y comercial en tiempo real</p>
                            </div>

                            {/* Hardware Status Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Hardware Metrics */}
                              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Monitor className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">Estado del Hardware</h4>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">CPU:</span>
                                      <span className="font-bold">{screen.enrichedData.hardwareStatus?.cpu?.usage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${screen.enrichedData.hardwareStatus?.cpu?.usage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">Memoria:</span>
                                      <span className="font-bold">{screen.enrichedData.hardwareStatus?.memory?.usage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${screen.enrichedData.hardwareStatus?.memory?.usage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">Disco:</span>
                                      <span className="font-bold">{screen.enrichedData.hardwareStatus?.disk?.usage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-yellow-600 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${screen.enrichedData.hardwareStatus?.disk?.usage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium text-blue-800">Temperatura:</span>
                                      <span className="font-bold text-blue-600">{screen.enrichedData.hardwareStatus?.temperature}°C</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Network Status */}
                              <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <Wifi className="w-6 h-6 text-purple-600" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">Estado de Red</h4>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Conexión:</span>
                                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                                      screen.enrichedData.networkStatus?.isConnected 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {screen.enrichedData.networkStatus?.isConnected ? 'Conectado' : 'Desconectado'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Velocidad:</span>
                                    <span className="font-bold text-purple-600">{screen.enrichedData.networkStatus?.downloadSpeed} Mbps</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Latencia:</span>
                                    <span className="font-bold">{screen.enrichedData.networkStatus?.latency}ms</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Señal:</span>
                                    <span className="font-bold text-purple-600">{screen.enrichedData.networkStatus?.signalStrength}%</span>
                                  </div>
                                  
                                  <div className="bg-purple-50 rounded-lg p-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium text-purple-800">Ancho de banda:</span>
                                      <span className="font-bold text-purple-600">{screen.enrichedData.networkStatus?.bandwidth} Mbps</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Performance and Player Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Performance Metrics */}
                              <div className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-orange-100 rounded-lg">
                                    <Zap className="w-6 h-6 text-orange-600" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">Rendimiento</h4>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-green-800">Plays exitosos:</span>
                                      <span className="font-bold text-green-600">
                                        {screen.enrichedData.performanceMetrics?.plays?.successful?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-red-50 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-red-800">Plays fallidos:</span>
                                      <span className="font-bold text-red-600">
                                        {screen.enrichedData.performanceMetrics?.plays?.failed}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-blue-800">Uptime:</span>
                                      <span className="font-bold text-blue-600">
                                        {screen.enrichedData.performanceMetrics?.technical?.uptime}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium text-gray-700">Tiempo respuesta:</span>
                                      <span className="font-bold">{screen.enrichedData.performanceMetrics?.technical?.responseTime}ms</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Player Information */}
                              <div className="bg-white border-2 border-teal-200 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-teal-100 rounded-lg">
                                    <Settings className="w-6 h-6 text-teal-600" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">Player Info</h4>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Sistema:</span>
                                    <span className="font-bold text-teal-600">{screen.enrichedData.playerStatus?.operatingSystem}</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Versión:</span>
                                    <span className="font-bold">{screen.enrichedData.playerStatus?.softwareVersion}</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Tipo:</span>
                                    <span className="font-bold">{screen.enrichedData.playerStatus?.playerType}</span>
                                  </div>
                                  
                                  <div className="bg-teal-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-teal-800 mb-1">Último heartbeat:</div>
                                    <div className="font-bold text-teal-600 text-xs">
                                      {new Date(screen.enrichedData.playerStatus?.lastHeartbeat).toLocaleString()}
                                    </div>
                                  </div>
                                  
                                  <div className={`rounded-lg p-3 ${
                                    screen.enrichedData.playerStatus?.isOnline 
                                      ? 'bg-green-100' 
                                      : 'bg-red-100'
                                  }`}>
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Estado:</span>
                                      <span className={`font-bold ${
                                        screen.enrichedData.playerStatus?.isOnline 
                                          ? 'text-green-600' 
                                          : 'text-red-600'
                                      }`}>
                                        {screen.enrichedData.playerStatus?.isOnline ? 'Online' : 'Offline'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Commercial and Venue Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Commercial Data */}
                              <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">Datos Comerciales</h4>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium text-green-800">Precio sugerido:</span>
                                      <span className="font-bold text-green-600">
                                        ${screen.enrichedData.commercialData?.revenueOptimization?.suggestedPricing?.toLocaleString()} COP
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Demanda:</span>
                                    <span className="font-bold">{screen.enrichedData.commercialData?.revenueOptimization?.demandForecast}</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Gasto mínimo:</span>
                                    <span className="font-bold text-green-600">
                                      ${screen.enrichedData.commercialData?.minimumSpend?.toLocaleString()} COP
                                    </span>
                                  </div>
                                  
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Paquetes disponibles:</div>
                                    <div className="text-xs text-gray-600">
                                      {screen.enrichedData.commercialData?.packages?.length || 0} opciones comerciales
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Venue Data */}
                              <div className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-red-100 rounded-lg">
                                    <MapPin className="w-6 h-6 text-red-600" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">Información del Venue</h4>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Tipo:</span>
                                    <span className="font-bold text-red-600">{screen.enrichedData.venue}</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Tráfico diario:</span>
                                    <span className="font-bold">{screen.enrichedData.venueData?.dailyTraffic?.toLocaleString()} personas</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Ambiente:</span>
                                    <span className="font-bold">{screen.enrichedData.venueData?.environment}</span>
                                  </div>
                                  
                                  <div className="bg-red-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-red-800 mb-2">Loop actual:</div>
                                    <div className="font-bold text-red-600">{screen.enrichedData.currentLoop?.name}</div>
                                    <div className="text-xs text-red-500 mt-1">
                                      Posición: {screen.enrichedData.currentLoop?.currentPosition + 1} de {screen.enrichedData.currentLoop?.totalSlots}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm font-medium text-gray-700">Próximo refresh:</div>
                                    <div className="text-xs text-gray-600">
                                      {new Date(screen.enrichedData.currentLoop?.nextRefresh).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Import Progress */}
                  {isImporting && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Importando inventario...</span>
                        <span className="text-sm text-gray-500">{importProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Final Import Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Se importarán <strong>{selectedScreens.length} pantallas</strong> con todos sus datos enriquecidos
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleBackToSelection}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Modificar Selección
                      </button>
                      <button
                        onClick={handleImport}
                        disabled={isImporting || selectedScreens.length === 0}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            Confirmar Importación
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 