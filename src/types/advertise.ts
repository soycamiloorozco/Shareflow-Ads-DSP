export type CampaignObjective = 'brand_awareness' | 'reach' | 'traffic' | 'engagement' | 'conversions';

export const campaignObjectives: CampaignObjective[] = [
  'brand_awareness',
  'reach',
  'traffic',
  'engagement',
  'conversions'
];

export interface TimeExclusion {
  start: string;
  end: string;
}

export interface Schedule {
  startTime: string;
  endTime: string;
  days: number[];
  exclusions: TimeExclusion[];
}

export interface CreativeFile {
  format: 'horizontal' | 'vertical' | 'square';
  file: File;
  preview: string;
  dimensions?: { width: number; height: number };
}

export interface Creative {
  fileUrl: string;
  fileType: 'image/jpeg' | 'image/png' | 'video/mp4';
  dimensions: { width: number; height: number };
}

export interface Screen {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  dimensions: { width: number; height: number };
  dailyViews: number;
  spotPrice: number;
  type: 'indoor' | 'outdoor';
  resolution: string;
  operatingHours: { start: string; end: string };
}

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  budget: number;
  startDate: string;
  endDate: string;
  screens: string[];
  schedule?: Schedule;
  creative?: Creative;
  targetAudience?: {
    age: [number, number];
    locations: string[];
    interests: string[];
  };
  status: 'draft' | 'pending' | 'active' | 'completed' | 'rejected';
}