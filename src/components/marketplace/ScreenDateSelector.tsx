import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Screen } from '../../types';
import { Button } from '../Button';
import { Card } from '../Card';

// Helper to generate dates for calendar
const getDatesForCalendar = (month: number, year: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayIndex = firstDay.getDay();
  
  const dates: Array<Date | null> = [];
  
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    dates.push(null);
  }
  
  // Add dates for the month
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day));
  }
  
  return dates;
};

interface ScreenDateSelectorProps {
  screen: Screen;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  selectedHour: number;
  setSelectedHour: (hour: number) => void;
  selectedMinute: number;
  setSelectedMinute: (minute: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

const ScreenDateSelector: React.FC<ScreenDateSelectorProps> = ({
  screen,
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  selectedMinute,
  setSelectedMinute,
  onBack,
  onContinue
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Get all dates for the current month view
  const dates = getDatesForCalendar(currentMonth, currentYear);
  
  // Format the month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long' });
  
  // Go to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Go to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is selected
  const isSelected = (date: Date) => {
    return selectedDate !== null && 
           date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  // Check if a date is in the past
  const isPastDate = (date: Date) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < currentDate;
  };
  
  return (
    <div className="my-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>
        <h1 className="text-2xl font-bold text-neutral-900 ml-8">Selecciona fecha y hora</h1>
      </div>
      
      <Card className="overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="grid gap-6 md:grid-cols-12">
            {/* Calendario */}
            <div className="md:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900">
                  <Calendar className="w-5 h-5 inline-block mr-2 text-primary" />
                  Fecha
                </h3>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-neutral-900 font-medium capitalize">
                    {monthName} {currentYear}
                  </span>
                  
                  <button 
                    onClick={goToNextMonth}
                    className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-1">
                {/* Days of week */}
                <div className="grid grid-cols-7 mb-2">
                  {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-neutral-600 text-sm font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar dates */}
                <div className="grid grid-cols-7 gap-1">
                  {dates.map((date, index) => (
                    <div key={index} className="aspect-square">
                      {date ? (
                        <button
                          disabled={isPastDate(new Date(date))}
                          onClick={() => setSelectedDate(date)}
                          className={`w-full h-full flex items-center justify-center rounded-md text-sm transition
                            ${isSelected(date) 
                              ? 'bg-primary text-white font-bold' 
                              : isToday(date)
                                ? 'bg-primary-50 text-primary font-medium'
                                : isPastDate(new Date(date))
                                  ? 'text-neutral-300 cursor-not-allowed'
                                  : 'hover:bg-neutral-100 text-neutral-900'
                            }`}
                        >
                          {date.getDate()}
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Selector de hora */}
            <div className="md:col-span-5 md:border-l md:pl-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                <Clock className="w-5 h-5 inline-block mr-2 text-primary" /> 
                Hora
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Selecciona la hora
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[6, 9, 12, 15, 18, 21].map((hour) => (
                      <button
                        key={hour}
                        onClick={() => setSelectedHour(hour)}
                        className={`py-2 px-1 text-center border rounded-md text-sm transition
                          ${selectedHour === hour 
                            ? 'bg-primary text-white border-primary' 
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-900'}`}
                      >
                        {hour}:00
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Selecciona los minutos
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 15, 30, 45].map((minute) => (
                      <button
                        key={minute}
                        onClick={() => setSelectedMinute(minute)}
                        className={`py-2 px-1 text-center border rounded-md text-sm transition
                          ${selectedMinute === minute 
                            ? 'bg-primary text-white border-primary' 
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-900'}`}
                      >
                        {minute.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-md"
                >
                  <p className="text-sm font-medium text-neutral-900">
                    Tu selección:
                  </p>
                  <p className="text-neutral-600 mt-1">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                    <br />
                    {selectedHour}:{selectedMinute.toString().padStart(2, '0')} horas
                  </p>
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Button>
            
            <Button 
              onClick={onContinue}
              disabled={!selectedDate}
              className="flex items-center gap-2"
            >
              <span>Continuar</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScreenDateSelector; 