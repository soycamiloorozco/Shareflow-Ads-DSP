import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, DollarSign, MapPin, Monitor, Search, ChevronRight, Eye, Clock, TrendingUp, Users, Info } from 'lucide-react';
import type { Campaign, Screen, CampaignObjective } from '../../types/advertise';
import { campaignObjectives } from '../../types/advertise';

interface CampaignCreationProps {
  campaign: Partial<Campaign>;
  onUpdate: (data: Partial<Campaign>) => void;
  onNext: () => void;
}

const mockScreens: Screen[] = [
  {
    id: 'screen-1',
    name: 'El Poblado Plaza',
    location: {
      address: 'Calle 10 #43D-12',
      city: 'Medellín',
      coordinates: { lat: 6.2087, lng: -75.5745 }
    },
    dimensions: { width: 1920, height: 1080 },
    dailyViews: 50000,
    spotPrice: 0.20,
    type: 'outdoor',
    resolution: '4K',
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    id: 'screen-2',
    name: 'Santafé Mall',
    location: {
      address: 'Cra. 43A #7 Sur-170',
      city: 'Medellín',
      coordinates: { lat: 6.2006, lng: -75.5744 }
    },
    dimensions: { width: 1920, height: 1080 },
    dailyViews: 40000,
    spotPrice: 0.20,
    type: 'indoor',
    resolution: '4K',
    operatingHours: { start: '10:00', end: '21:00' }
  },
  {
    id: 'screen-3',
    name: 'Laureles Premium',
    location: {
      address: 'Cra. 76 #73-24',
      city: 'Medellín',
      coordinates: { lat: 6.2447, lng: -75.5916 }
    },
    dimensions: { width: 1920, height: 1080 },
    dailyViews: 35000,
    spotPrice: 0.20,
    type: 'outdoor',
    resolution: '4K',
    operatingHours: { start: '00:00', end: '23:59' }
  }
];

interface ImpactMetrics {
  totalSpots: number;
  spotsPerScreen: number;
  totalViews: number;
  cpm: number;
  reachPerDay: number;
  screenAllocation: {
    screenId: string;
    spots: number;
    views: number;
  }[];
}

export function CampaignCreation({ campaign, onUpdate, onNext }: CampaignCreationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreens, setSelectedScreens] = useState<string[]>(campaign.screens || []);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [showScreenDetails, setShowScreenDetails] = useState<string | null>(null);

  const filteredScreens = mockScreens.filter(screen =>
    screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (campaign.budget && selectedScreens.length > 0) {
      const budget = campaign.budget;
      const spotPrice = 0.20;
      const totalSpots = Math.floor(budget / spotPrice);
      const spotsPerScreen = Math.floor(totalSpots / selectedScreens.length);
      
      const screenAllocation = selectedScreens.map(screenId => {
        const screen = mockScreens.find(s => s.id === screenId)!;
        return {
          screenId,
          spots: spotsPerScreen,
          views: screen.dailyViews * 7 // Weekly views
        };
      });

      const totalViews = screenAllocation.reduce((sum, screen) => sum + screen.views, 0);
      const cpm = (budget / (totalViews / 1000));
      const reachPerDay = Math.floor(totalViews / 7);

      setMetrics({
        totalSpots,
        spotsPerScreen,
        totalViews,
        cpm,
        reachPerDay,
        screenAllocation
      });
    } else {
      setMetrics(null);
    }
  }, [campaign.budget, selectedScreens]);

  const handleScreenToggle = (screenId: string) => {
    setSelectedScreens(prev =>
      prev.includes(screenId)
        ? prev.filter(id => id !== screenId)
        : [...prev, screenId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ screens: selectedScreens });
    onNext();
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-8 border-r border-neutral-200">
        {/* Campaign Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaign.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Campaign Objective
            </label>
            <select
              value={campaign.objective || ''}
              onChange={(e) => onUpdate({ objective: e.target.value as CampaignObjective })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select objective</option>
              {campaignObjectives.map(objective => (
                <option key={objective} value={objective}>
                  {objective.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Campaign Budget (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="number"
                min="100"
                step="100"
                value={campaign.budget || ''}
                onChange={(e) => onUpdate({ budget: Number(e.target.value) })}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter budget"
                required
              />
            </div>
            <p className="mt-1 text-sm text-neutral-500">Minimum budget: $100</p>
          </div>
        </div>

        {/* Screen Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Screens</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search screens by name or location"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScreens.map((screen) => (
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedScreens.includes(screen.id)
                    ? 'border-primary bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => handleScreenToggle(screen.id)}
                onMouseEnter={() => setShowScreenDetails(screen.id)}
                onMouseLeave={() => setShowScreenDetails(null)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{screen.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{screen.location.address}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-neutral-600">Daily Views</p>
                        <p className="font-medium">{screen.dailyViews.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Spot Price</p>
                        <p className="font-medium">${screen.spotPrice}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showScreenDetails === screen.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-neutral-200"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-600">Resolution</p>
                          <p className="font-medium">{screen.resolution}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600">Type</p>
                          <p className="font-medium capitalize">{screen.type}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600">Operating Hours</p>
                          <p className="font-medium">
                            {screen.operatingHours.start} - {screen.operatingHours.end}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-600">Dimensions</p>
                          <p className="font-medium">
                            {screen.dimensions.width}x{screen.dimensions.height}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6 border-t border-neutral-200">
          <button
            type="submit"
            disabled={!campaign.name || !campaign.objective || !campaign.budget || selectedScreens.length === 0}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-500 disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue to Schedule
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Impact Estimation Panel */}
      <div className="w-80 p-6 bg-neutral-50 border-l border-neutral-200">
        <div className="sticky top-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Campaign Impact</h3>
            
            {metrics ? (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Total Spots</h4>
                  </div>
                  <p className="text-2xl font-semibold">{metrics.totalSpots.toLocaleString()}</p>
                  <p className="text-sm text-neutral-600">
                    {metrics.spotsPerScreen} spots per screen
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Estimated Reach</h4>
                  </div>
                  <p className="text-2xl font-semibold">
                    {metrics.reachPerDay.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-600">Daily impressions</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">CPM</h4>
                  </div>
                  <p className="text-2xl font-semibold">${metrics.cpm.toFixed(2)}</p>
                  <p className="text-sm text-neutral-600">Cost per 1,000 views</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Total Views</h4>
                  </div>
                  <p className="text-2xl font-semibold">
                    {metrics.totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-600">Weekly impressions</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-neutral-200 text-center">
                <Info className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-600">
                  Enter campaign budget and select screens to see impact estimation
                </p>
              </div>
            )}
          </div>

          {metrics && (
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">Optimal Times</p>
              </div>
              <p className="text-sm text-neutral-600">
                Based on historical data, the best times to run your campaign are:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Weekdays: 8:00 AM - 10:00 AM
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Weekdays: 4:00 PM - 7:00 PM
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Weekends: 11:00 AM - 8:00 PM
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}