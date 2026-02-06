
import React, { useMemo } from 'react';
import { EventData } from '../types';
import { Icons, EVENT_COLORS } from '../constants';
import { formatDate, isToday as checkIsToday } from '../utils/dateUtils';

interface CalendarGridProps {
  currentDate: Date;
  events: EventData[];
  onDateClick: (date: Date) => void;
  onEventDrop?: (eventId: string, newDate: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  events, 
  onDateClick,
  onEventDrop 
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => prevMonthLastDay - firstDayOfMonth + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const totalSlots = 42; 
  const nextMonthDays = Array.from({ length: totalSlots - (prevMonthDays.length + currentMonthDays.length) }, (_, i) => i + 1);

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getTypeStyle = (type: EventData['type'], customColor?: string) => {
    if (customColor) {
      return {
        bg: '',
        text: '',
        border: '',
        hex: customColor,
        Icon: EVENT_COLORS[type]?.Icon || Icons.Other,
      };
    }
    const colors = EVENT_COLORS[type] || EVENT_COLORS.Other;
    const IconComponent = 
      type === 'Lecture' ? Icons.Lecture :
      type === 'Workshop' ? Icons.Workshop :
      type === 'Exam' ? Icons.Exam :
      type === 'Holiday' ? Icons.Holiday :
      Icons.Other;
    return { ...colors, Icon: IconComponent };
  };

  const handleDragStart = (e: React.DragEvent, event: EventData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(event));
    e.dataTransfer.effectAllowed = 'move';
    (e.target as HTMLElement).classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    if (!onEventDrop) return;
    
    try {
      const event = JSON.parse(e.dataTransfer.getData('application/json')) as EventData;
      const newDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (event.date !== newDate) {
        onEventDrop(event.id, newDate);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  return (
    <div className="flex flex-col h-full select-none overflow-hidden">
      <div className="grid grid-cols-7 border-b border-adaptive bg-nav shrink-0" role="row">
        {dayNames.map(day => (
          <div 
            key={day} 
            className="py-3 md:py-4 text-center text-[9px] md:text-[11px] font-black opacity-40 tracking-[0.2em] text-adaptive"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0" role="grid">
        {prevMonthDays.map(day => (
          <div 
            key={`prev-${day}`} 
            className="border-r border-b border-adaptive p-2 md:p-3 bg-black/[0.1] opacity-20"
            role="gridcell"
            aria-disabled="true"
          >
            <span className="text-xs font-black text-adaptive">{day}</span>
          </div>
        ))}
        {currentMonthDays.map((day, index) => {
          const dayEvents = getEventsForDay(day, true);
          const isToday = checkIsToday(new Date(year, month, day));
          
          const colIndex = (firstDayOfMonth + index) % 7;
          const showLeft = colIndex > 4;

          return (
            <div 
              key={`curr-${day}`} 
              onClick={() => onDateClick(new Date(year, month, day))}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={`border-r border-b border-adaptive p-2 md:p-3 cursor-pointer transition-all hover:bg-white/[0.03] relative group overflow-visible min-h-0 flex flex-col focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset`}
              role="gridcell"
              tabIndex={0}
              aria-label={`${new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${dayEvents.length > 0 ? `, ${dayEvents.length} events` : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDateClick(new Date(year, month, day));
                }
              }}
            >
              {dayEvents.length > 0 && (
                <div 
                  className={`quick-look-preview absolute top-0 ${showLeft ? 'right-full mr-4' : 'left-full ml-4'} w-72 glass-dark p-0 rounded-[2.5rem] shadow-pro z-[100] border border-adaptive backdrop-blur-3xl`}
                  role="tooltip"
                >
                  <div className="h-24 w-full overflow-hidden rounded-t-[2.5rem] relative">
                    <img src={dayEvents[0].imageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-400">Day Intel</h4>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {dayEvents.map(e => {
                      const style = getTypeStyle(e.type, e.color);
                      return (
                        <div key={e.id} className={`group/item border-l-2 ${style.border} pl-4 py-1 hover:border-blue-500 transition-colors`} style={e.color ? { borderColor: e.color } : undefined}>
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className={style.text} style={e.color ? { color: e.color } : undefined}>
                                <style.Icon />
                              </span>
                              <p className="font-black text-xs leading-tight text-adaptive">{e.title}</p>
                            </div>
                            <span className="text-[8px] bg-white/10 text-adaptive px-1.5 py-0.5 rounded font-black">{e.time}</span>
                          </div>
                          <p className="text-[10px] text-muted line-clamp-2 font-medium">{e.description}</p>
                          {e.recurrence && (
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-blue-400">
                              <Icons.Repeat />
                              <span>Recurring</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start z-10 relative shrink-0">
                <span className={`text-xs md:text-sm w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all font-black ${isToday ? 'bg-today shadow-lg scale-105' : 'text-adaptive opacity-70 group-hover:opacity-100'}`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1" aria-hidden="true">
                    {dayEvents.slice(0, 4).map((e, i) => {
                      const dotColor = e.color || (
                        e.type === 'Exam' ? '#ef4444' : 
                        e.type === 'Workshop' ? '#a855f7' :
                        e.type === 'Lecture' ? '#3b82f6' :
                        e.type === 'Holiday' ? '#34d399' :
                        '#9ca3af'
                      );
                      return (
                        <div 
                          key={`${e.id}-${i}`} 
                          className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shadow-sm"
                          style={{ backgroundColor: dotColor }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="mt-1 md:mt-2 space-y-1 z-10 relative flex-1 min-h-0 overflow-hidden">
                {dayEvents.slice(0, 2).map(event => {
                  const style = getTypeStyle(event.type, event.color);
                  return (
                    <div 
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[8px] md:text-[9px] truncate px-2 py-1 rounded-lg border font-black uppercase tracking-tighter transition-all group-hover:bg-white/5 flex items-center gap-1.5 cursor-grab active:cursor-grabbing ${style.border} ${style.bg} ${style.text}`}
                      style={event.color ? { 
                        backgroundColor: `${event.color}15`, 
                        borderColor: `${event.color}30`,
                        color: event.color 
                      } : undefined}
                      role="button"
                      tabIndex={-1}
                      aria-label={`${event.title} at ${event.time}`}
                    >
                      <style.Icon />
                      <span className="truncate">{event.title}</span>
                      {event.recurrence && <Icons.Repeat />}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="text-[7px] md:text-[8px] font-black text-muted opacity-60 ml-1">
                    +{dayEvents.length - 2} MORE
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {nextMonthDays.map(day => (
          <div 
            key={`next-${day}`} 
            className="border-r border-b border-adaptive p-2 md:p-3 bg-black/[0.1] opacity-20"
            role="gridcell"
            aria-disabled="true"
          >
            <span className="text-xs font-black text-adaptive">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
