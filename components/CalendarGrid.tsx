
import React from 'react';
import { EventData } from '../types';
import { Icons } from '../constants';

interface CalendarGridProps {
  currentDate: Date;
  events: EventData[];
  onDateClick: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, events, onDateClick }) => {
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

  const getTypeStyle = (type: EventData['type']) => {
    switch (type) {
      case 'Lecture': return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', Icon: Icons.Lecture };
      case 'Workshop': return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', Icon: Icons.Workshop };
      case 'Exam': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', Icon: Icons.Exam };
      case 'Holiday': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', Icon: Icons.Holiday };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', Icon: Icons.Other };
    }
  };

  return (
    <div className="flex flex-col h-full select-none overflow-hidden">
      <div className="grid grid-cols-7 border-b border-adaptive bg-nav shrink-0">
        {dayNames.map(day => (
          <div key={day} className="py-3 md:py-4 text-center text-[9px] md:text-[11px] font-black opacity-40 tracking-[0.2em] text-adaptive">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0">
        {prevMonthDays.map(day => (
          <div key={`prev-${day}`} className="border-r border-b border-adaptive p-2 md:p-3 bg-black/[0.1] opacity-20">
            <span className="text-xs font-black text-adaptive">{day}</span>
          </div>
        ))}
        {currentMonthDays.map((day, index) => {
          const dayEvents = getEventsForDay(day, true);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          const colIndex = (firstDayOfMonth + index) % 7;
          const showLeft = colIndex > 4;

          return (
            <div 
              key={`curr-${day}`} 
              onClick={() => onDateClick(new Date(year, month, day))}
              className={`border-r border-b border-adaptive p-2 md:p-3 cursor-pointer transition-all hover:bg-white/[0.03] relative group overflow-visible min-h-0 flex flex-col`}
            >
              {dayEvents.length > 0 && (
                <div 
                  className={`quick-look-preview absolute top-0 ${showLeft ? 'right-full mr-4' : 'left-full ml-4'} w-72 glass-dark p-0 rounded-[2.5rem] shadow-pro z-[100] border border-adaptive backdrop-blur-3xl`}
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
                      const style = getTypeStyle(e.type);
                      return (
                        <div key={e.id} className={`group/item border-l-2 ${style.border} pl-4 py-1 hover:border-blue-500 transition-colors`}>
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className={style.text}><style.Icon /></span>
                              <p className="font-black text-xs leading-tight text-adaptive">{e.title}</p>
                            </div>
                            <span className="text-[8px] bg-white/10 text-adaptive px-1.5 py-0.5 rounded font-black">{e.time}</span>
                          </div>
                          <p className="text-[10px] text-muted line-clamp-2 font-medium">{e.description}</p>
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
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.map((e, i) => {
                      const dotColor = e.type === 'Exam' ? 'bg-red-500' : 
                                       e.type === 'Workshop' ? 'bg-purple-500' :
                                       e.type === 'Lecture' ? 'bg-blue-500' :
                                       'bg-gray-400';
                      return <div key={`${e.id}-${i}`} className={`${dotColor} w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shadow-sm`} />;
                    })}
                  </div>
                )}
              </div>
              
              <div className="mt-1 md:mt-2 space-y-1 z-10 relative flex-1 min-h-0 overflow-hidden">
                {dayEvents.slice(0, 2).map(event => {
                  const style = getTypeStyle(event.type);
                  return (
                    <div 
                      key={event.id} 
                      className={`text-[8px] md:text-[9px] truncate px-2 py-1 rounded-lg border ${style.border} font-black uppercase tracking-tighter transition-all group-hover:bg-white/5 flex items-center gap-1.5 ${style.bg} ${style.text}`}
                    >
                      <style.Icon />
                      <span className="truncate">{event.title}</span>
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
          <div key={`next-${day}`} className="border-r border-b border-adaptive p-2 md:p-3 bg-black/[0.1] opacity-20">
            <span className="text-xs font-black text-adaptive">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
