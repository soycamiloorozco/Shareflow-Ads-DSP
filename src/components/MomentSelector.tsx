import React, { memo } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface MomentSelectorProps {
  momentId: string;
  momentNumber: number;
  maxMinutes: number;
  selectedMinutes: number[];
  onMinuteSelect: (index: number, minute: number) => void;
  onAddMoment: () => void;
  onRemoveMoment: (index: number) => void;
}

export const MomentSelector = memo(function MomentSelector({ 
  momentId,
  momentNumber,
  maxMinutes,
  selectedMinutes,
  onMinuteSelect,
  onAddMoment,
  onRemoveMoment
}: MomentSelectorProps) {
  const minuteMarkers = Array.from({ length: Math.floor(maxMinutes / 5) + 1 }, (_, i) => i * 5);

  return (
    <div className="space-y-4">
      {selectedMinutes.map((minute, index) => (
        <div key={`${momentId}-${index}`} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="w-[42px] h-[42px] bg-[#353FEF] rounded-[10.5px] flex items-center justify-center">
                              <span className="text-[14px] font-bold text-white leading-[18.9px]">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 w-0.5 bg-neutral-200" />
          </div>

          <div className="flex-1 pt-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock size={18} className="text-primary" />
                <span className="text-[14px] font-bold text-neutral-800 leading-[18.9px]">
                  Momento {index + 1}
                </span>
              </div>
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => onRemoveMoment(index)}
                  className="text-error-600 hover:bg-error-50"
                >
                  Eliminar
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[14px] font-semibold text-neutral-600 leading-[19.19px]">
                Minuto en el que deseas aparecer
              </span>

              <div className="relative h-7">
                <input
                  type="range"
                  min="0"
                  max={maxMinutes}
                  value={minute}
                  onChange={(e) => onMinuteSelect(index, parseInt(e.target.value))}
                  className="absolute w-full h-0.5 bg-neutral-200 appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-[#353FEF]"
                />
                <div className="absolute top-3 w-full flex justify-between">
                  {minuteMarkers.map((marker) => (
                    <span
                      key={marker}
                      className={`text-[10px] leading-[13.71px] ${
                        marker === minute 
                          ? 'text-[#353FEF] font-normal' 
                          : 'text-neutral-400 font-normal'
                      }`}
                    >
                      {marker.toString().padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="h-6 bg-[#353FEF]/10 rounded px-4 flex items-center">
                <span className="text-[12px] leading-[15px] text-neutral-800">
                  Tu momento saldrá en el minuto:{' '}
                  <strong className="font-semibold">{minute}'</strong>
                </span>
              </div>

              <div className="flex items-center gap-1 text-[12px] leading-[15px] text-neutral-500">
                <Clock size={18} />
                <span>Duración del momento: 15 segundos</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="pl-[58px]">
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          onClick={onAddMoment}
          className="text-primary hover:bg-primary-50"
        >
          Agregar momento
        </Button>
      </div>
    </div>
  );
});