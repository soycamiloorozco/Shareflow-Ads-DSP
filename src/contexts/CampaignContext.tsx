import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { IntelligentCampaignConfig } from '../types/advertise';

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled';
  screens: string[];
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  spotsDelivered: number;
  totalSpots: number;
  type: 'marketplace' | 'programmatic' | 'event';
  image?: string;
  createdAt: string;
  updatedAt: string;
  // Datos específicos del AdSetManager
  selectedCities?: string[];
  selectedEvents?: string[];
  selectedDates?: string[];
  selectedTimeSlots?: Record<string, number[]>;
  selectionMode?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'range' | 'timeSlots';
  budgetType?: 'daily' | 'lifetime';
  // Intelligent bidding configuration
  intelligentConfig?: IntelligentCampaignConfig;
  // Cost estimations from intelligent bidding
  estimatedCost?: number;
  estimatedImpressions?: number;
  estimatedCPM?: number;
  // Datos de creatividades
  creatives?: {
    fileUrl: string;
    fileType: 'image/jpeg' | 'image/png' | 'video/mp4';
    dimensions: { width: number; height: number };
    duration?: number;
  }[];
  // Datos de progreso y estado del flujo
  completionPercentage: number;
  lastStep: 'create' | 'adsets' | 'creative' | 'summary';
  isDraft: boolean;
  // Estado de completitud de pasos
  stepsCompleted: {
    create: boolean;
    adsets: boolean;
    creative: boolean;
    summary: boolean;
  };
  // Datos específicos del marketplace
  marketplaceData?: {
    screenId: string;
    screenName: string;
    screenLocation: string;
    bundleId: string;
    bundleName: string;
    bundlePrice: number;
    bundleDescription: string;
    bundleDuration: string;
    bundleFrequency: {
      type: string;
      displayText: string;
      spotsPerHour: number;
      totalSpots: number;
    };
  };
  location?: string; // Para facilitar el filtrado y búsqueda
  
  // Real-time tracking fields
  hasRealTimeTracking?: boolean;
  currentlyDisplaying?: boolean;
  lastDisplayTime?: string;
  todayImpressions?: number;
  todaySpots?: number;
  
  // Creative rejection tracking for multi-owner Smart Campaigns
  creativeRejections?: {
    hasRejections: boolean;
    totalScreens: number;
    approvedScreens: number;
    rejectedScreens: number;
    rejectionDetails: Array<{
      mediaOwner: string;
      ssp: string;
      screenCount: number;
      locations: string[];
      rejectionReason: string;
      rejectionDate: string;
      suggestedActions: string[];
      alternativeContent?: string;
    }>;
    approvedOwners: Array<{
      mediaOwner: string;
      ssp: string;
      screenCount: number;
      locations: string[];
    }>;
  };
}

export interface DraftCampaign extends Partial<Campaign> {
  id: string;
  isDraft: boolean;
  completionPercentage: number;
  lastStep: 'create' | 'adsets' | 'creative' | 'summary';
  createdAt: string;
  updatedAt: string;
  stepsCompleted: {
    create: boolean;
    adsets: boolean;
    creative: boolean;
    summary: boolean;
  };
}

interface CampaignContextType {
  campaigns: Campaign[];
  drafts: DraftCampaign[];
  currentCampaign: Partial<Campaign> | null;
  
  // Campaign management
  createCampaign: (campaign: Partial<Campaign>) => string;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaign: (id: string) => Campaign | undefined;
  
  // Draft management
  saveDraft: (draft: Partial<Campaign>) => string;
  updateDraft: (id: string, updates: Partial<Campaign>) => void;
  deleteDraft: (id: string) => void;
  getDraft: (id: string) => DraftCampaign | undefined;
  convertDraftToCampaign: (draftId: string) => string;
  
  // Current campaign state
  setCurrentCampaign: (campaign: Partial<Campaign> | null) => void;
  updateCurrentCampaign: (updates: Partial<Campaign>) => void;
  clearCurrentCampaign: () => void;
  
  // Step management
  canAccessStep: (step: 'create' | 'adsets' | 'creative' | 'summary') => boolean;
  markStepCompleted: (step: 'create' | 'adsets' | 'creative' | 'summary') => void;
  getNextAvailableStep: () => 'create' | 'adsets' | 'creative' | 'summary';
  
  // Analytics
  getTotalSpent: () => number;
  getActiveCampaigns: () => Campaign[];
  getDraftCount: () => number;
  getUrgencyMetrics: () => {
    expiringSoon: number;
    highDemandScreens: number;
    competitorActivity: number;
  };
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
}

interface CampaignProviderProps {
  children: ReactNode;
}

export function CampaignProvider({ children }: CampaignProviderProps) {
  // Mock active marketplace campaign with real-time tracking - Based on realistic screen data
  const mockMarketplaceCampaign: Campaign = {
    id: 'marketplace_active_001',
    name: 'Campaña Santafé Mall - Día Completo',
    status: 'active',
    screens: ['screen-mall-2'], // Using existing Santafé Mall screen
    startDate: '2024-01-15',
    endDate: '2024-01-16', // Single day campaign
    budget: 1200000, // Price from daily bundle
    spent: 950000,
    impressions: 45000, // Realistic for one day
    spotsDelivered: 58, // Based on 4 spots/hour for 16 hours (64 total, 58 delivered so far)
    totalSpots: 64, // 4 spots/hour * 16 operating hours
    type: 'marketplace',
    createdAt: '2024-01-15T06:00:00Z',
    updatedAt: new Date().toISOString(),
    selectedDates: ['2024-01-15'],
    selectedTimeSlots: {
      '2024-01-15': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] // Mall hours
    },
    completionPercentage: 100,
    lastStep: 'summary',
    isDraft: false,
    stepsCompleted: {
      create: true,
      adsets: true,
      creative: true,
      summary: true
    },
    marketplaceData: {
      screenId: 'screen-mall-2',
      screenName: 'Santafé Mall Circuit',
      screenLocation: 'Cra. 43A #7 Sur-170, Medellín',
      bundleId: 'daily_standard',
      bundleName: 'Día Completo',
      bundlePrice: 1200000,
      bundleDescription: 'Tu anuncio durante todo el día',
      bundleDuration: '24 horas',
      bundleFrequency: {
        type: '15min',
        displayText: 'Se muestra cada 15 minutos',
        spotsPerHour: 4,
        totalSpots: 64 // 4 spots/hour * 16 hours
      }
    },
    location: 'Medellín, Antioquia',
    creatives: [{
      fileUrl: '/screens_photos/60585-667efb6b32fdf.jpg',
      fileType: 'image/jpeg',
      dimensions: { width: 1920, height: 1080 }
    }],
    // Real-time tracking data
    hasRealTimeTracking: true,
    currentlyDisplaying: true,
    lastDisplayTime: new Date().toISOString(),
    todayImpressions: 45000, // Same as total impressions since it's a one-day campaign
    todaySpots: 58 // Current spots delivered today
  };

  // Mock Smart Campaigns (Programmatic/OpenRTB)
  const mockSmartCampaigns: Campaign[] = [
    {
      id: 'smart_campaign_001',
      name: 'Smart Display - Bebidas Energéticas',
      status: 'active',
      screens: ['screen-1', 'screen-5', 'screen-8', 'screen-12'], // Multiple screens for programmatic
      startDate: '2024-01-10',
      endDate: '2024-01-25',
      budget: 5000000, // Higher budget for programmatic
      spent: 2800000,
      impressions: 850000, // High impressions for programmatic reach
      spotsDelivered: 1240,
      totalSpots: 2000,
      type: 'programmatic',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: new Date().toISOString(),
      selectedCities: ['Medellín', 'Bogotá'],
      selectedDates: ['2024-01-10', '2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15'],
      selectionMode: 'range',
      budgetType: 'lifetime',
      completionPercentage: 100,
      lastStep: 'summary',
      isDraft: false,
      stepsCompleted: {
        create: true,
        adsets: true,
        creative: true,
        summary: true
      },
      location: 'Medellín, Bogotá',
      creatives: [{
        fileUrl: '/screens_photos/1165-5f4a8a6115516.jpg',
        fileType: 'image/jpeg',
        dimensions: { width: 1920, height: 1080 }
      }],
      hasRealTimeTracking: true,
      currentlyDisplaying: false,
      lastDisplayTime: '2024-01-15T14:30:00Z',
      todayImpressions: 32000,
      todaySpots: 45,
      // Smart campaign specific data
      intelligentConfig: {
        totalBudget: 5000000,
        maxBidPerPlay: 850,
        strategy: 'target_reach' as any,
        dayPartingRules: [],
        targetCities: ['Medellín', 'Bogotá'],
        budgetPacing: 'standard',
        enableAutoBidding: true,
        targetCPM: 65
      },
      estimatedCPM: 65,
      // Multi-owner creative rejection scenario
      creativeRejections: {
        hasRejections: true,
        totalScreens: 14,
        approvedScreens: 12,
        rejectedScreens: 2,
        rejectionDetails: [
          {
            mediaOwner: 'Partner Centro Medellín',
            ssp: 'LatinAd',
            screenCount: 2,
            locations: ['Centro Comercial Premium', 'Centro Comercial Elite'],
            rejectionReason: 'Contenido de bebidas energéticas no permitido en ubicaciones familiares',
            rejectionDate: '2024-01-11T09:30:00Z',
            suggestedActions: ['modify_creative', 'remove_screens', 'contact_support'],
            alternativeContent: 'Contenido sin referencia a bebidas energéticas'
          }
        ],
        approvedOwners: [
          {
            mediaOwner: 'JCDecaux Bogotá',
            ssp: 'VIOOH',
            screenCount: 6,
            locations: ['Zona Rosa', 'Chapinero', 'Centro Internacional']
          },
          {
            mediaOwner: 'Clear Channel Medellín',
            ssp: 'Broadsign',
            screenCount: 4,
            locations: ['El Poblado', 'Laureles']
          },
          {
            mediaOwner: 'Partner Norte Bogotá',
            ssp: 'LatinAd',
            screenCount: 2,
            locations: ['Zona Norte', 'Usaquén']
          }
        ]
      }
    },
    {
      id: 'smart_campaign_002',
      name: 'Smart Reach - Tecnología',
      status: 'active',
      screens: ['screen-3', 'screen-7', 'screen-11', 'screen-15', 'screen-18'], 
      startDate: '2024-01-12',
      endDate: '2024-01-30',
      budget: 8500000,
      spent: 4200000,
      impressions: 1200000,
      spotsDelivered: 980,
      totalSpots: 1800,
      type: 'programmatic',
      createdAt: '2024-01-12T10:15:00Z',
      updatedAt: new Date().toISOString(),
      selectedCities: ['Medellín', 'Bogotá', 'Cali'],
      selectedDates: ['2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16'],
      selectionMode: 'range',
      budgetType: 'lifetime',
      completionPercentage: 100,
      lastStep: 'summary',
      isDraft: false,
      stepsCompleted: {
        create: true,
        adsets: true,
        creative: true,
        summary: true
      },
      location: 'Medellín, Bogotá, Cali',
      creatives: [{
        fileUrl: '/screens_photos/14373-6123414240662.jpg',
        fileType: 'image/jpeg',
        dimensions: { width: 1920, height: 1080 }
      }],
      hasRealTimeTracking: true,
      currentlyDisplaying: true,
      lastDisplayTime: new Date().toISOString(),
      todayImpressions: 55000,
      todaySpots: 62,
      intelligentConfig: {
        totalBudget: 8500000,
        maxBidPerPlay: 950,
        strategy: 'target_impressions' as any,
        dayPartingRules: [],
        targetCities: ['Medellín', 'Bogotá', 'Cali'],
        budgetPacing: 'accelerated',
        enableAutoBidding: true,
        targetCPM: 72
      },
      estimatedCPM: 72,
      // Multiple rejection scenario
      creativeRejections: {
        hasRejections: true,
        totalScreens: 18,
        approvedScreens: 13,
        rejectedScreens: 5,
        rejectionDetails: [
          {
            mediaOwner: 'Mall Outlets Cali',
            ssp: 'Broadsign',
            screenCount: 3,
            locations: ['Chipichape', 'Palmetto Plaza', 'Jardín Plaza'],
            rejectionReason: 'Marcas de tecnología competidoras no permitidas en espacios comerciales',
            rejectionDate: '2024-01-13T11:45:00Z',
            suggestedActions: ['modify_creative', 'remove_screens'],
            alternativeContent: 'Usar creative genérico sin logos de marcas específicas'
          },
          {
            mediaOwner: 'Transport Medellín',
            ssp: 'VIOOH',
            screenCount: 2,
            locations: ['Metro Poblado', 'Metro Industriales'],
            rejectionReason: 'Resolución de creative no compatible con pantallas de transporte',
            rejectionDate: '2024-01-13T14:20:00Z',
            suggestedActions: ['modify_creative', 'contact_support'],
            alternativeContent: 'Adaptar creative a resolución 1080x1920 (vertical)'
          }
        ],
        approvedOwners: [
          {
            mediaOwner: 'JCDecaux Bogotá',
            ssp: 'VIOOH',
            screenCount: 8,
            locations: ['Zona Rosa', 'Chapinero', 'Centro Internacional', 'Salitre']
          },
          {
            mediaOwner: 'Clear Channel Nacional',
            ssp: 'Broadsign',
            screenCount: 5,
            locations: ['Medellín Centro', 'Cali Norte', 'Bogotá Sur']
          }
        ]
      }
    },
    {
      id: 'smart_campaign_003',
      name: 'Smart Campaign - Moda Urbana',
      status: 'paused',
      screens: ['screen-2', 'screen-6', 'screen-9'], 
      startDate: '2024-01-08',
      endDate: '2024-01-22',
      budget: 3200000,
      spent: 1800000,
      impressions: 620000,
      spotsDelivered: 720,
      totalSpots: 1200,
      type: 'programmatic',
      createdAt: '2024-01-08T16:30:00Z',
      updatedAt: new Date().toISOString(),
      selectedCities: ['Medellín'],
      selectedDates: ['2024-01-08', '2024-01-09', '2024-01-10', '2024-01-11'],
      selectionMode: 'daily',
      budgetType: 'daily',
      completionPercentage: 100,
      lastStep: 'summary',
      isDraft: false,
      stepsCompleted: {
        create: true,
        adsets: true,
        creative: true,
        summary: true
      },
      location: 'Medellín',
      creatives: [{
        fileUrl: '/screens_photos/1711-63233b19f0faf.jpg',
        fileType: 'image/jpeg',
        dimensions: { width: 1920, height: 1080 }
      }],
      hasRealTimeTracking: true,
      currentlyDisplaying: false,
      lastDisplayTime: '2024-01-14T11:20:00Z',
      todayImpressions: 0,
      todaySpots: 0,
      intelligentConfig: {
        totalBudget: 3200000,
        maxBidPerPlay: 700,
        strategy: 'target_cost' as any,
        dayPartingRules: [],
        targetCities: ['Medellín'],
        budgetPacing: 'standard',
        enableAutoBidding: true,
        targetCPM: 58
      },
      estimatedCPM: 58
    },
    {
      id: 'smart_campaign_004',
      name: 'Smart Boost - Servicios Financieros',
      status: 'completed',
      screens: ['screen-4', 'screen-10', 'screen-13', 'screen-16', 'screen-19', 'screen-22'], 
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      budget: 4500000,
      spent: 4500000,
      impressions: 980000,
      spotsDelivered: 1500,
      totalSpots: 1500,
      type: 'programmatic',
      createdAt: '2024-01-01T09:00:00Z',
      updatedAt: '2024-01-07T23:59:00Z',
      selectedCities: ['Bogotá', 'Cali'],
      selectedDates: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
      selectionMode: 'weekly',
      budgetType: 'lifetime',
      completionPercentage: 100,
      lastStep: 'summary',
      isDraft: false,
      stepsCompleted: {
        create: true,
        adsets: true,
        creative: true,
        summary: true
      },
      location: 'Bogotá, Cali',
      creatives: [{
        fileUrl: '/screens_photos/60585-667efb6b32fdf.jpg',
        fileType: 'image/jpeg',
        dimensions: { width: 1920, height: 1080 }
      }],
      hasRealTimeTracking: false,
      currentlyDisplaying: false,
      lastDisplayTime: '2024-01-07T23:45:00Z',
      todayImpressions: 0,
      todaySpots: 0,
      intelligentConfig: {
        totalBudget: 4500000,
        maxBidPerPlay: 1100,
        strategy: 'maximize_conversions' as any,
        dayPartingRules: [],
        targetCities: ['Bogotá', 'Cali'],
        budgetPacing: 'accelerated',
        enableAutoBidding: true,
        targetCPM: 85
      },
      estimatedCPM: 85
    }
  ];

  const [campaigns, setCampaigns] = useState<Campaign[]>([mockMarketplaceCampaign, ...mockSmartCampaigns]);
  const [drafts, setDrafts] = useState<DraftCampaign[]>([]);
  const [currentCampaign, setCurrentCampaignState] = useState<Partial<Campaign> | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('shareflow_campaigns');
    const savedDrafts = localStorage.getItem('shareflow_drafts');
    const savedCurrentCampaign = localStorage.getItem('shareflow_current_campaign');

    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns));
    }
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
    if (savedCurrentCampaign) {
      setCurrentCampaignState(JSON.parse(savedCurrentCampaign));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('shareflow_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('shareflow_drafts', JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    if (currentCampaign) {
      localStorage.setItem('shareflow_current_campaign', JSON.stringify(currentCampaign));
    } else {
      localStorage.removeItem('shareflow_current_campaign');
    }
  }, [currentCampaign]);

  const generateId = () => {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const calculateCompletionPercentage = (campaign: Partial<Campaign>): number => {
    let percentage = 0;
    
    // Si es del marketplace, usar lógica específica
    if (campaign.type === 'marketplace' && campaign.marketplaceData) {
      // Pantalla y precio seleccionados (40%)
      if (campaign.marketplaceData.screenId && campaign.budget && campaign.budget > 0) percentage += 40;
      
      // Fechas programadas (30%)
      if (campaign.selectedDates && campaign.selectedDates.length > 0) percentage += 30;
      
      // Creatividad subida (20%)
      if (campaign.creatives && campaign.creatives.length > 0) percentage += 20;
      
      // Confirmación final (10%)
      if (campaign.status && campaign.status !== 'draft') percentage += 10;
    } else {
      // Lógica original para otros tipos
      // Budget step (25%)
      if (campaign.budget && campaign.budget > 0) percentage += 25;
      
      // Schedule step (25%)
      if (campaign.selectedDates && campaign.selectedDates.length > 0) percentage += 25;
      
      // Location step (25%)
      if (campaign.selectedCities && campaign.screens && campaign.screens.length > 0) percentage += 25;
      
      // Summary/completion step (25%)
      if (campaign.status && campaign.status !== 'draft') percentage += 25;
    }
    
    return percentage;
  };

  const getLastStep = (campaign: Partial<Campaign>): 'create' | 'adsets' | 'creative' | 'summary' => {
    // Si es del marketplace, usar lógica específica
    if (campaign.type === 'marketplace' && campaign.marketplaceData) {
      if (!campaign.marketplaceData.screenId || !campaign.budget || campaign.budget <= 0) return 'create';
      if (!campaign.selectedDates || campaign.selectedDates.length === 0) return 'adsets';
      if (!campaign.creatives || campaign.creatives.length === 0) return 'creative';
      return 'summary';
    } else {
      // Lógica original para otros tipos
      if (!campaign.budget || campaign.budget <= 0) return 'create';
      if (!campaign.selectedDates || campaign.selectedDates.length === 0) return 'adsets';
      if (!campaign.selectedCities || !campaign.screens || campaign.screens.length === 0) return 'creative';
      return 'summary';
    }
  };

  // Campaign management
  const createCampaign = (campaign: Partial<Campaign>): string => {
    const id = generateId();
    const now = new Date().toISOString();
    
    const newCampaign: Campaign = {
      id,
      name: campaign.name || 'Nueva Campaña',
      status: 'active',
      screens: campaign.screens || [],
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
      budget: campaign.budget || 0,
      spent: 0,
      impressions: 0,
      spotsDelivered: 0,
      totalSpots: campaign.totalSpots || 0,
      type: campaign.type || 'marketplace',
      image: campaign.image,
      createdAt: now,
      updatedAt: now,
      selectedCities: campaign.selectedCities,
      selectedEvents: campaign.selectedEvents,
      selectedDates: campaign.selectedDates,
      selectedTimeSlots: campaign.selectedTimeSlots,
      selectionMode: campaign.selectionMode,
      budgetType: campaign.budgetType,
      completionPercentage: 100,
      lastStep: 'summary',
      isDraft: false,
      stepsCompleted: {
        create: true,
        adsets: true,
        creative: true,
        summary: true
      },
      ...campaign
    };

    setCampaigns(prev => [...prev, newCampaign]);
    return id;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id 
        ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
        : campaign
    ));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const getCampaign = (id: string): Campaign | undefined => {
    return campaigns.find(campaign => campaign.id === id);
  };

  // Draft management
  const saveDraft = (draft: Partial<Campaign>): string => {
    const id = draft.id || generateId();
    const now = new Date().toISOString();
    
    const newDraft: DraftCampaign = {
      id,
      isDraft: true,
      completionPercentage: calculateCompletionPercentage(draft),
      lastStep: getLastStep(draft),
      createdAt: draft.createdAt || now,
      updatedAt: now,
      name: draft.name || 'Borrador sin nombre',
      stepsCompleted: draft.stepsCompleted || {
        create: false,
        adsets: false,
        creative: false,
        summary: false
      },
      ...draft
    };

    setDrafts(prev => {
      const existingIndex = prev.findIndex(d => d.id === id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newDraft;
        return updated;
      }
      return [...prev, newDraft];
    });

    return id;
  };

  const updateDraft = (id: string, updates: Partial<Campaign>) => {
    setDrafts(prev => prev.map(draft => 
      draft.id === id 
        ? { 
            ...draft, 
            ...updates, 
            isDraft: true,
            updatedAt: new Date().toISOString(),
            completionPercentage: calculateCompletionPercentage({ ...draft, ...updates }),
            lastStep: getLastStep({ ...draft, ...updates }),
            stepsCompleted: updates.stepsCompleted || draft.stepsCompleted || {
              create: false,
              adsets: false,
              creative: false,
              summary: false
            }
          }
        : draft
    ));
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(draft => draft.id !== id));
  };

  const getDraft = (id: string): DraftCampaign | undefined => {
    return drafts.find(draft => draft.id === id);
  };

  const convertDraftToCampaign = (draftId: string): string => {
    const draft = getDraft(draftId);
    if (!draft) throw new Error('Draft not found');

    const campaignId = createCampaign({
      ...draft,
      status: 'active',
      isDraft: false
    });

    deleteDraft(draftId);
    return campaignId;
  };

  // Current campaign state
  const setCurrentCampaign = (campaign: Partial<Campaign> | null) => {
    setCurrentCampaignState(campaign);
  };

  const updateCurrentCampaign = (updates: Partial<Campaign>) => {
    setCurrentCampaignState(prev => prev ? { ...prev, ...updates } : updates);
  };

  const clearCurrentCampaign = () => {
    setCurrentCampaignState(null);
  };

  // Step management
  const canAccessStep = (step: 'create' | 'adsets' | 'creative' | 'summary'): boolean => {
    if (!currentCampaign) return step === 'create';
    
    const stepsCompleted = currentCampaign.stepsCompleted || {
      create: false,
      adsets: false,
      creative: false,
      summary: false
    };
    
    // Always allow access to create step
    if (step === 'create') return true;
    
    // For adsets step, create must be completed
    if (step === 'adsets') return stepsCompleted.create;
    
    // For creative step, both create and adsets must be completed
    if (step === 'creative') return stepsCompleted.create && stepsCompleted.adsets;
    
    // For summary step, create, adsets, and creative must be completed
    if (step === 'summary') return stepsCompleted.create && stepsCompleted.adsets && stepsCompleted.creative;
    
    return false;
  };

  const markStepCompleted = (step: 'create' | 'adsets' | 'creative' | 'summary'): void => {
    if (!currentCampaign) return;
    
    setCurrentCampaignState(prev => {
      if (!prev) return null;
      
      const currentStepsCompleted = prev.stepsCompleted || {
        create: false,
        adsets: false,
        creative: false,
        summary: false
      };
      
      return {
        ...prev,
        stepsCompleted: {
          ...currentStepsCompleted,
          [step]: true
        }
      };
    });
  };

  const getNextAvailableStep = (): 'create' | 'adsets' | 'creative' | 'summary' => {
    if (!currentCampaign) return 'create';
    
    const currentStep = getLastStep(currentCampaign);
    const steps: ('create' | 'adsets' | 'creative' | 'summary')[] = ['create', 'adsets', 'creative', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    return steps[nextIndex];
  };

  // Analytics
  const getTotalSpent = (): number => {
    return campaigns.reduce((total, campaign) => total + campaign.spent, 0);
  };

  const getActiveCampaigns = (): Campaign[] => {
    return campaigns.filter(campaign => campaign.status === 'active');
  };

  const getDraftCount = (): number => {
    return drafts.length;
  };

  const getUrgencyMetrics = () => {
    // Simulated urgency metrics for psychological pressure
    const now = new Date();
    const expiringSoon = campaigns.filter(campaign => {
      const endDate = new Date(campaign.endDate);
      const daysUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilEnd <= 7 && campaign.status === 'active';
    }).length;

    return {
      expiringSoon,
      highDemandScreens: Math.floor(Math.random() * 15) + 5, // 5-20 screens in high demand
      competitorActivity: Math.floor(Math.random() * 8) + 3   // 3-10 competitor campaigns
    };
  };

  const value: CampaignContextType = {
    campaigns,
    drafts,
    currentCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaign,
    saveDraft,
    updateDraft,
    deleteDraft,
    getDraft,
    convertDraftToCampaign,
    setCurrentCampaign,
    updateCurrentCampaign,
    clearCurrentCampaign,
    canAccessStep,
    markStepCompleted,
    getNextAvailableStep,
    getTotalSpent,
    getActiveCampaigns,
    getDraftCount,
    getUrgencyMetrics
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
} 