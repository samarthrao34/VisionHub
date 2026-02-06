import React, { useMemo } from 'react';
import { EventData } from '../types';
import { Icons, EVENT_COLORS } from '../constants';
import { getWeekDays, formatDate, isToday, isSameDay } from '../utils/dateUtils';
import { format } from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  events: EventData[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: EventData) => void;
  onEventDrop?: (eventId: string, newDate: string, newTime?: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  events, 
  onDateClick, 
  onEventClick,
  onEventDrop 
}) => {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    const dateStr = formatDate(date);
    return events.filter(e => {
      if (e.date !== dateStr) return false;
      const [eventHour] = e.time.split(':').map(Number);
      return eventHour === hour;
    });
  };

  const getEventStyle = (event: EventData) => {
    const colors = event.color 
      ? { bg: '', text: '', border: '', hex: event.color }
      : EVENT_COLORS[event.type];
    return colors;
  };

  const handleDragStart = (e: React.DragEvent, event: EventData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(event));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    if (!onEventDrop) return;
    
    try {
      const event = JSON.parse(e.dataTransfer.getData('application/json')) as EventData;
      const newDate = formatDate(date);
      const newTime = `${hour.toString().padStart(2, '0')}:00`;
      onEventDrop(event.id, newDate, newTime);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with day names */}
      <div className="grid grid-cols-8 border-b border-adaptive shrink-0">
        <div className="p-2 text-center text-[10px] font-black text-muted uppercase tracking-widest border-r border-adaptive">
          Time
        </div>
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={`p-3 text-center cursor-pointer hover:bg-white/5 transition-colors border-r border-adaptive last:border-r-0 ${
              isToday(day) ? 'bg-white/5' : ''
            }`}
            onClick={() => onDateClick(day)}
          >
            <div className="text-[10px] font-black text-muted uppercase tracking-widest">
              {format(day, 'EEE')}
            </div>
            <div className={`text-lg font-black mt-1 ${
              isToday(day) ? 'bg-today w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-adaptive'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-8">
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div className="p-2 text-[10px] font-bold text-muted border-r border-b border-adaptive h-16 sticky left-0 bg-nav">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* Day cells for this hour */}
              {weekDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDayAndHour(day, hour);
                return (
                  <div
                    key={`${hour}-${dayIdx}`}
                    className="border-r border-b border-adaptive h-16 p-1 relative hover:bg-white/[0.02] transition-colors last:border-r-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, hour)}
                    onClick={() => onDateClick(day)}
                  >
                    {dayEvents.map(event => {
                      const style = getEventStyle(event);
                      const heightMultiplier = Math.min(event.durationMinutes / 60, 4);
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className={`absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer hover:opacity-80 transition-all overflow-hidden ${style.bg} ${style.text} border ${style.border}`}
                          style={{ 
                            height: `${heightMultiplier * 64 - 8}px`,
                            zIndex: 10,
                            backgroundColor: event.color ? `${event.color}20` : undefined,
                            borderColor: event.color ? `${event.color}40` : undefined,
                            color: event.color || undefined,
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${event.title} at ${event.time}`}
                        >
                          <div className="text-[9px] font-black truncate">{event.title}</div>
                          <div className="text-[8px] opacity-70">{event.time}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
