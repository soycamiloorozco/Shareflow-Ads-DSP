import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Target, Clock, Upload, ChevronRight } from 'lucide-react';
import { CampaignCreation } from './CampaignCreation';
import { TimeConfiguration } from './TimeConfiguration';
import { CreativeUpload } from './CreativeUpload';
import { CampaignSummary } from './CampaignSummary';
import type { Campaign } from '../../types/advertise';

const steps = [
  { id: 'create', title: 'Campaign Creation', icon: Megaphone },
  { id: 'time', title: 'Time Configuration', icon: Clock },
  { id: 'creative', title: 'Upload Creative', icon: Upload },
  { id: 'summary', title: 'Campaign Summary', icon: Target }
] as const;

export function AdvertiseModule() {
  const [currentStep, setCurrentStep] = useState<typeof steps[number]['id']>('create');
  const [campaign, setCampaign] = useState<Partial<Campaign>>({});

  const updateCampaign = (data: Partial<Campaign>) => {
    setCampaign(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'create':
        return (
          <CampaignCreation
            campaign={campaign}
            onUpdate={updateCampaign}
            onNext={handleNext}
          />
        );
      case 'time':
        return (
          <TimeConfiguration
            campaign={campaign}
            onUpdate={updateCampaign}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'creative':
        return (
          <CreativeUpload
            campaign={campaign}
            onUpdate={updateCampaign}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'summary':
        return (
          <CampaignSummary
            campaign={campaign}
            onBack={handleBack}
            onLaunch={() => console.log('Launch campaign:', campaign)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary-500 rounded-[17.86px] p-8 mb-[18px] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDUwMHY1MDBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwbDUwMCA1MDBNNTAwIDBMMCAzMDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] opacity-10"/>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em]">
                Create Campaign
              </h1>
              <p className="text-white/80">
                Launch your message on premium digital displays
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-success-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep === step.id ? 'text-primary' : 'text-neutral-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-24 h-0.5 mx-4 ${
                  steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-success-500'
                    : 'bg-neutral-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {renderStep()}
      </div>
    </div>
  );
}