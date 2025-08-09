import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Play } from 'lucide-react';

interface GamePeriodInfo {
  id: string;
  name: string;
  description: string;
  maxMinutes: number;
  price: number;
  color: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
  tvAudience: boolean;
}

interface DetailedMoment {
  id: string;
  momentId: string;
  period: string;
  minute: number;
  price: number;
  creativity?: File;
  preview?: string;
}

interface MomentTimelineProps {
  period: GamePeriodInfo;
  moments: DetailedMoment[];
  onMomentClick?: (momentId: string) => void;
  showPreview?: boolean;
}

export const MomentTimeline: React.FC<MomentTimelineProps> = ({
  period,
  moments,
  onMomentClick,
  showPreview = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${period.color} flex items-center justify-center`}>
            <Timer className={`w-5 h-5 ${period.iconColor}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{period.name}</h4>
            <p className="text-sm text-gray-600">{period.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {moments.length} momento{moments.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            {formatPrice(moments.reduce((sum, m) => sum + m.price, 0))}
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        {/* Background timeline */}
        <div className="h-3 bg-gray-200 rounded-full relative overflow-hidden">
          <div 
            className={`h-full rounded-full ${period.color.replace('bg-gradient-to-br from-', 'bg-').replace(' to-primary-100', '').replace(' to-amber-100', '')}-200`}
            style={{ width: '100%' }}
          />
        </div>

        {/* Time markers */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0'</span>
          <span>{Math.floor(period.maxMinutes / 4)}'</span>
          <span>{Math.floor(period.maxMinutes / 2)}'</span>
          <span>{Math.floor(3 * period.maxMinutes / 4)}'</span>
          <span>{period.maxMinutes}'</span>
        </div>

        {/* Moment markers */}
        {moments.map((moment, index) => (
          <motion.div
            key={moment.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute top-0 transform -translate-x-1/2 cursor-pointer group"
            style={{ left: `${(moment.minute / period.maxMinutes) * 100}%` }}
            onClick={() => onMomentClick?.(moment.id)}
          >
            {/* Marker dot */}
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all group-hover:scale-110 ${
              moment.creativity ? 'bg-green-500' : 'bg-primary'
            }`}>
              {moment.creativity && (
                <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </div>

            {/* Minute label */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap">
              {moment.minute}'
            </div>

            {/* Hover tooltip */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                <div className="font-medium">Minuto {moment.minute}</div>
                <div>{formatPrice(moment.price)}</div>
                {moment.creativity && (
                  <div className="text-green-300 flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Creatividad lista
                  </div>
                )}
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gray-900 rotate-45" />
            </div>

            {/* Preview thumbnail */}
            {showPreview && moment.preview && (
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="w-24 h-16 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                  {moment.creativity?.type.startsWith('image/') ? (
                    <img
                      src={moment.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Play className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Moments list (compact) */}
      {moments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
          {moments.map((moment) => (
            <div
              key={moment.id}
              className={`p-2 rounded-lg border text-center cursor-pointer transition-all hover:shadow-md ${
                moment.creativity 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              onClick={() => onMomentClick?.(moment.id)}
            >
              <div className="text-sm font-medium text-gray-900">
                {moment.minute}'
              </div>
              <div className="text-xs text-gray-600">
                {formatPrice(moment.price)}
              </div>
              {moment.creativity && (
                <div className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Listo
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MomentTimeline;