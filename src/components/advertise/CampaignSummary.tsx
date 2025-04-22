import React from 'react';
import { Button } from '../Button';
import { ArrowLeft, Check } from 'lucide-react';
import type { Campaign } from '../../types/advertise';

interface CampaignSummaryProps {
  campaign: Partial<Campaign>;
  onBack: () => void;
  onLaunch: () => void;
}

export function CampaignSummary({ campaign, onBack, onLaunch }: CampaignSummaryProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        <div className="bg-success-50 border border-success-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <h3 className="font-semibold text-success-600">
                ¡Tu campaña está lista!
              </h3>
              <p className="text-sm text-success-600">
                Revisa los detalles antes de lanzar
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200">
            <div className="p-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-1">
                Nombre de la campaña
              </h4>
              <p className="text-neutral-800">{campaign.name}</p>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-1">
                Objetivo
              </h4>
              <p className="text-neutral-800 capitalize">{campaign.objective}</p>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-1">
                Fechas
              </h4>
              <p className="text-neutral-800">
                {new Date(campaign.startDate!).toLocaleDateString()} - {new Date(campaign.endDate!).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-1">
                Presupuesto
              </h4>
              <p className="text-neutral-800">
                ${campaign.budget?.toLocaleString()} COP
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-neutral-200">
        <Button
          variant="outline"
          size="lg"
          icon={ArrowLeft}
          iconPosition="left"
          onClick={onBack}
        >
          Atrás
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onLaunch}
        >
          Lanzar campaña
        </Button>
      </div>
    </div>
  );
}