import React from 'react';
import { Clock, DollarSign, Info } from 'lucide-react';
import { Card } from '../Card';

interface MomentPricingProps {
  prices: {
    firstHalf: number;
    halftime: number;
    secondHalf: number;
  };
  onChange: (prices: { firstHalf: number; halftime: number; secondHalf: number }) => void;
}

export function MomentPricing({ prices, onChange }: MomentPricingProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Precios por Momento</h3>
        <div className="bg-primary-50 text-primary px-4 py-2 rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span className="text-sm">Los precios son por cada momento de 15 segundos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Primer Tiempo</h4>
                <p className="text-sm text-neutral-600">45 minutos • Alta visibilidad</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  value={prices.firstHalf}
                  onChange={(e) => onChange({
                    ...prices,
                    firstHalf: Number(e.target.value)
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Precio por momento"
                />
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  Momentos disponibles: 0-45'
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-500" />
              </div>
              <div>
                <h4 className="font-medium">Entre Tiempo</h4>
                <p className="text-sm text-neutral-600">15 minutos • Máxima atención</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  value={prices.halftime}
                  onChange={(e) => onChange({
                    ...prices,
                    halftime: Number(e.target.value)
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Precio por momento"
                />
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  Momento especial de 15 minutos
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Segundo Tiempo</h4>
                <p className="text-sm text-neutral-600">45 minutos • Alta visibilidad</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  value={prices.secondHalf}
                  onChange={(e) => onChange({
                    ...prices,
                    secondHalf: Number(e.target.value)
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Precio por momento"
                />
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  Momentos disponibles: 45-90'
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="p-4 bg-neutral-50 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">
            Los precios se establecen por cada momento de 15 segundos. Recomendamos:
          </p>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Primer y segundo tiempo: Precios similares</li>
            <li>• Entre tiempo: Precio premium por mayor atención</li>
            <li>• Considerar horarios y tipo de partido para ajustar precios</li>
          </ul>
        </div>
      </div>
    </div>
  );
}