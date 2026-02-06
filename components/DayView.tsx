import React, { useMemo } from 'react';
import { EventData } from '../types';
import { Icons, EVENT_COLORS } from '../constants';
import { formatDate, formatDisplayDate, isToday } from '../utils/dateUtils';

interface DayViewProps {
  currentDate: Date;
  events: EventData[];
  onEventClick: (event: EventData) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
  onEventDrop?: (eventId: string, newDate: string, newTime?: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayView: React.FC<DayViewProps> = ({ 
  currentDate, 
  events, 
  onEventClick, 
  onTimeSlotClick,
  onEventDrop 
}) => {
  const dateStr = formatDate(currentDate);
  
  const dayEvents = useMemo(() => {
    return events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  }, [events, dateStr]);

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(e => {
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

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (!onEventDrop) return;
    
    try {
      const event = JSON.parse(e.dataTransfer.getData('application/json')) as EventData;
      const newTime = `${hour.toString().padStart(2, '0')}:00`;
      onEventDrop(event.id, dateStr, newTime);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const currentHour = new Date().getHours();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div className="p-6 border-b border-adaptive shrink-0 bg-nav">
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-black ${isToday(currentDate) ? 'bg-today w-16 h-16 rounded-full flex items-center justify-center' : 'text-adaptive'}`}>
            {currentDate.getDate()}
          </div>
          <div>
            <div className="text-lg font-black text-adaptive uppercase tracking-tight">
              {formatDisplayDate(currentDate)}
            </div>
            <div className="text-xs text-muted font-medium">
              {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Icons.Calendar />
            </div>
            <h3 className="font-black text-lg text-adaptive mb-2">No Events</h3>
            <p className="text-muted text-sm">Click on a time slot to add an event</p>
          </div>
        ) : (
          <div className="flex">
            {/* Time labels */}
            <div className="w-20 shrink-0">
              {HOURS.map(hour => (
                <div 
                  key={hour} 
                  className={`h-20 border-b border-adaptive flex items-start justify-end pr-3 pt-2 ${
                    hour === currentHour && isToday(currentDate) ? 'text-blue-500' : 'text-muted'
                  }`}
                >
                  <span className="text-[11px] font-bold">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Events area */}
            <div className="flex-1 relative">
              {HOURS.map(hour => {
                const hourEvents = getEventsForHour(hour);
                const isCurrentHour = hour === currentHour && isToday(currentDate);
                
                return (
                  <div
                    key={hour}
                    className={`h-20 border-b border-l border-adaptive relative hover:bg-white/[0.02] transition-colors cursor-pointer ${
                      isCurrentHour ? 'bg-blue-500/5' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, hour)}
                    onClick={() => onTimeSlotClick(currentDate, `${hour.toString().padStart(2, '0')}:00`)}
                  >
                    {/* Current time indicator */}
                    {isCurrentHour && (
                      <div 
                        className="absolute left-0 right-0 border-t-2 border-blue-500 z-20"
                        style={{ top: `${(new Date().getMinutes() / 60) * 100}%` }}
                      >
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-blue-500 rounded-full" />
                      </div>
                    )}

                    {/* Events */}
                    {hourEvents.map((event, idx) => {
                      const style = getEventStyle(event);
                      const heightMultiplier = Math.min(event.durationMinutes / 60, 4);
                      const width = hourEvents.length > 1 ? `${100 / hourEvents.length - 2}%` : '95%';
                      const left = hourEvents.length > 1 ? `${(idx * 100) / hourEvents.length + 1}%` : '2%';
                      
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className={`absolute rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all overflow-hidden ${style.bg} border ${style.border}`}
                          style={{ 
                            height: `${heightMultiplier * 80 - 8}px`,
                            width,
                            left,
                            top: '4px',
                            zIndex: 10,
                            backgroundColor: event.color ? `${event.color}15` : undefined,
                            borderColor: event.color ? `${event.color}30` : undefined,
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${event.title} at ${event.time}`}
                        >
                          <div className={`font-black text-sm ${style.text}`} style={{ color: event.color }}>
                            {event.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-muted text-xs">
                            <Icons.Clock />
                            <span>{event.time}</span>
                            {event.durationMinutes && (
                              <span className="opacity-60">({event.durationMinutes}min)</span>
                            )}
                          </div>
                          {event.room && (
                            <div className="flex items-center gap-2 mt-1 text-muted text-xs">
                              <Icons.Location />
                              <span>{event.room}</span>
                            </div>
                          )}
                          {event.recurrence && (
                            <div className="absolute top-2 right-2">
                              <Icons.Repeat />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
