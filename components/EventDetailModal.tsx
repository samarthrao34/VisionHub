
import React from 'react';
import { EventData } from '../types';
import { Icons, EVENT_COLORS } from '../constants';
import { formatDisplayDate } from '../utils/dateUtils';

interface EventDetailModalProps {
  date: Date;
  events: EventData[];
  onClose: () => void;
  onAddEvent: (date: Date) => void;
  onEditEvent?: (event: EventData) => void;
  onDeleteEvent?: (id: string) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
  date, 
  events, 
  onClose, 
  onAddEvent,
  onEditEvent,
  onDeleteEvent 
}) => {
  const formattedDate = formatDisplayDate(date);

  const getTypeStyle = (type: EventData['type']) => {
    return EVENT_COLORS[type] || EVENT_COLORS.Other;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative glass-dark rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-adaptive">
        <div className="flex justify-between items-center p-6 border-b border-adaptive bg-black/5">
          <h2 id="modal-title" className="text-xl font-bold text-adaptive">
            Events for {formattedDate}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-black/10 text-adaptive opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <Icons.X />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-input">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/5 inline-block p-4 rounded-full mb-4">
                <Icons.Calendar />
              </div>
              <p className="text-muted mb-4">No events scheduled for this day.</p>
              <button 
                onClick={() => onAddEvent(date)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => {
                const style = getTypeStyle(event.type);
                return (
                  <div 
                    key={event.id} 
                    className="glass rounded-2xl overflow-hidden flex flex-col md:flex-row border border-adaptive shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-full md:w-1/3 h-40 md:h-auto overflow-hidden relative">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {event.recurrence && (
                        <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-[9px] font-bold uppercase flex items-center gap-1">
                          <Icons.Repeat />
                          Recurring
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                          <span 
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}
                            style={event.color ? { 
                              backgroundColor: `${event.color}20`, 
                              color: event.color, 
                              borderColor: `${event.color}40` 
                            } : undefined}
                          >
                            {event.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted bg-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Icons.Clock />
                              {event.time}
                            </span>
                            {event.durationMinutes && (
                              <span className="text-[10px] text-muted">
                                ({event.durationMinutes}min)
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-adaptive">{event.title}</h3>
                        <p className="text-muted text-sm leading-relaxed mb-3">{event.description}</p>
                        
                        <div className="flex flex-wrap gap-3 text-[10px] text-muted">
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <Icons.Location />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.room && (
                            <div className="flex items-center gap-1">
                              <span className="opacity-50">|</span>
                              <span>{event.room}</span>
                            </div>
                          )}
                        </div>
                        
                        {event.reminderMinutes && event.reminderMinutes > 0 && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase mt-3">
                            <Icons.Bell />
                            <span>
                              Reminder: {event.reminderMinutes >= 1440 
                                ? `${Math.floor(event.reminderMinutes / 1440)} day(s) before` 
                                : `${event.reminderMinutes} min before`}
                            </span>
                          </div>
                        )}

                        {event.resourcesUrl && (
                          <a 
                            href={event.resourcesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400 mt-2"
                          >
                            <Icons.ExternalLink />
                            Resources
                          </a>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-adaptive">
                        {onEditEvent && (
                          <button
                            onClick={() => onEditEvent(event)}
                            className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all text-adaptive"
                            aria-label={`Edit ${event.title}`}
                          >
                            <Icons.Edit />
                            Edit
                          </button>
                        )}
                        {onDeleteEvent && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${event.title}"?`)) {
                                onDeleteEvent(event.id);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all"
                            aria-label={`Delete ${event.title}`}
                          >
                            <Icons.Trash />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => onAddEvent(date)}
                  className="flex items-center gap-2 px-5 py-3 glass rounded-full font-bold text-xs uppercase tracking-wider border border-adaptive hover:bg-white/5 transition-all text-adaptive focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Icons.Plus />
                  <span>Add Another Event</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
