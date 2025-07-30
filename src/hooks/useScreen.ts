import { useState } from 'react';
import request from '../helpers/request';

interface ActiveDay {
  dayOfWeek: number;
}

interface AgeDistribution {
  ageGroup12To17: number;
  ageGroup18To24: number;
  ageGroup25To34: number;
  ageGroup35To44: number;
  ageGroup45To54: number;
  ageGroup55To64: number;
  ageGroup65Plus: number;
}

export interface ScreenVariant {
  id: number;
  screenPackageId: number;
  packageType: 'moments' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  variantId: string;
  name: string;
  frequency: string;
  minDuration?: number;
  maxDuration?: number;
  spotsPerHour?: number;
  spotsPerDay?: number;
  spotsPerWeek?: number;
  spotsPerMonth?: number;
  price: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenPackage {
  id: number;
  screenId: number;
  packageType: 'moments' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  price: number;
  spots: number;
  duration: string;
  reach: number;
  createdAt: string;
  updatedAt: string;
  variants: ScreenVariant[];
}

export interface ScreenType {
  id: string;
  publicName: string;
  referenceName: string;
  connectionType: 'shareflowScreen' | 'manual' | 'broadsign' | 'latinad';
  latitude: number;
  longitude: number;
  address: string;
  resolution: string;
  screenPackages: ScreenPackage[],
  category: string;
  images: {filePath: string}[];
  estimatedDailyImpressions: number;
  impressionMultiplier: number;
  malePercentage: number;
  femalePercentage: number;
  averageFillRate: number;
  averageOccupancyRate: number;
  averageDwellTime: number;
  peakHours: string;
  displayType: string;
  totalFrames: number;
  sellableFrames: number;
  networkStatus: string;
  playerModel: string;
  softwareVersion: string;
  postalCode: string;
  locationCode: string;
  timeZone: string;
  venueType: string;
  businessDensity: string;
  operationStartTime: string;
  operationEndTime: string;
  standardAdDuration: number;
  loopDuration: number;
  transitionTime: number;
  automaticPricing: boolean;
  minimumPrice: number;
  maximumPrice: number;
  activeDays: ActiveDay[];
  ageDistribution: AgeDistribution;
}

interface UseScreenReturn {
  createScreen: (screenData: ScreenType) => Promise<void>;
  get: () => Promise<void>;
  screens: ScreenType[];
  isLoading: boolean;
  error: string | null;
}

export const useScreen = (): UseScreenReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screens, setScreens] = useState<ScreenType[]>([]);

  const createScreen = async (screenData: ScreenType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await request.post('/Screens', screenData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la pantalla');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const get = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await request.get('/Screens');
      setScreens(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la pantalla');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  return {
    createScreen,
    get,
    screens,
    isLoading,
    error
  };
}; 