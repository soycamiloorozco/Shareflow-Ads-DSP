import { Role } from '../lib/permissions';

export interface Screen {
  id: string;
  name: string;
  location: string;
  price: number;
  availability: boolean;
  image: string;
  category: ScreenCategory;
  specs: {
    width: number;
    height: number;
    resolution: string;
    brightness: string;
  };
  views: {
    daily: number;
    monthly: number;
  };
  rating: number;
  reviews: number;
  isPartOfCircuit?: boolean;
  circuitId?: string;
  circuitScreens?: CircuitScreen[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  pricing: {
    allowMoments: boolean;
    deviceId?: string;
    bundles: {
      hourly?: { enabled: boolean; price: number; spots: number };
      daily?: { enabled: boolean; price: number; spots: number };
      weekly?: { enabled: boolean; price: number; spots: number };
      monthly?: { enabled: boolean; price: number; spots: number };
    };
  };
  metrics: {
    dailyTraffic: number;
    monthlyTraffic: number;
    averageEngagement: number;
  };
  operatingHours: {
    start: string;
    end: string;
    daysActive: string[];
  };
}

export interface CircuitScreen {
  id: string;
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
}

export interface ScreenCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  count: number;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  city: string;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: number;
  location: string;
  coordinates: { lat: number; lng: number };
  screens: Screen[];
}

export interface GameMoment {
  id: string;
  name: string;
  duration: string;
  price: number;
  maxMinutes: number;
  isSelected?: boolean;
}

export interface SportEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
  city: string;
  screens: Screen[];
  price?: number;
  homeTeamName: string;
  awayTeamName: string;
  stadiumName: string;
  homeTeamImage: string;
  homeAwayImage: string;
  momentPricing: {
    firstHalf: number;
    halftime: number;
    secondHalf: number;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  capacity: number;
  estimatedAttendance: number;
  broadcastChannels?: string[];
}

export interface SelectedMomentDetails {
  id: string;
  momentId: string;
  minute: number;
}

export interface CreativeAsset {
  id: string;
  url: string;
  filename: string;
  filesize: number;
  dimensions: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
}