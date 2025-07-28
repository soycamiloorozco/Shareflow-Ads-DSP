import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import type { Campaign, Schedule } from '../../types/advertise';

interface TimeConfigurationProps {
  campaign: Partial<Campaign>;
  onUpdate: (data: Partial<Campaign>) => void;
  onNext: () => void;
  onBack: () => void;
}

const weekDays = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' }
];

export function TimeConfiguration({ campaign, onUpdate, onNext, onBack }: TimeConfigurationProps) {
  const [schedule, setSchedule] = useState<Schedule>({
    startTime: campaign.schedule?.startTime || '06:00',
    endTime: campaign.schedule?.endTime || '22:00',
    days: campaign.schedule?.days || [],
    exclusions: campaign.schedule?.exclusions || []
  });

  const handleDayToggle = (dayId: number) => {
    setSchedule(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(id => id !== dayId)
        : [...prev.days, dayId]
    }));
  };

  const addExclusion = () => {
    setSchedule(prev => ({
      ...prev,
      exclusions: [...prev.exclusions, { start: '12:00', end: '13:00' }]
    }));
  };

  const removeExclusion = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index)
    }));
  };

  const updateExclusion = (index: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      exclusions: prev.exclusions.map((exclusion, i) =>
        i === index ? { ...exclusion, [field]: value } : exclusion
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ schedule });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {/* Daily Schedule */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Daily Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => setSchedule(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => setSchedule(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
      </div>

      {/* Day Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Days</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleDayToggle(day.id)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                schedule.days.includes(day.id)
                  ? 'border-primary bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <p className="font-medium text-center">{day.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Exclusions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Time Exclusions</h3>
          <button
            type="button"
            onClick={addExclusion}
            className="flex items-center gap-2 text-primary hover:text-primary-500"
          >
            <Plus className="w-4 h-4" />
            Add Exclusion
          </button>
        </div>

        <div className="space-y-4">
          {schedule.exclusions.map((exclusion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg"
            >
              <Clock className="w-5 h-5 text-neutral-400" />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={exclusion.start}
                    onChange={(e) => updateExclusion(index, 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={exclusion.end}
                    onChange={(e) => updateExclusion(index, 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExclusion(index)}
                className="p-2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-neutral-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-neutral-700 hover:text-neutral-900 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={schedule.days.length === 0}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-500 disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue to Creative
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}