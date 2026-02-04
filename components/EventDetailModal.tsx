
import React from 'react';
import { EventData } from '../types';
import { Icons } from '../constants';

interface EventDetailModalProps {
  date: Date;
  events: EventData[];
  onClose: () => void;
  onAddEvent: (date: Date) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ date, events, onClose, onAddEvent }) => {
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative glass-dark rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-adaptive">
        <div className="flex justify-between items-center p-6 border-b border-adaptive bg-black/5">
          <h2 className="text-xl font-bold text-adaptive">Events for {formattedDate}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 text-adaptive opacity-60">
            <Icons.X />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto bg-input">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-adaptive opacity-10 inline-block p-4 rounded-full mb-4 text-adaptive">
                <Icons.Calendar />
              </div>
              <p className="text-muted">No events scheduled for this day.</p>
              <button 
                onClick={() => onAddEvent(date)}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all"
              >
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map(event => (
                <div key={event.id} className="glass rounded-2xl overflow-hidden flex flex-col md:flex-row border border-adaptive shadow-sm">
                  <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          event.type === 'Exam' ? 'bg-red-500/20 text-red-500' :
                          event.type === 'Workshop' ? 'bg-purple-500/20 text-purple-500' :
                          event.type === 'Lecture' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {event.type}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted">
                           <span className="bg-adaptive opacity-10 px-2 py-0.5 rounded-lg text-adaptive">{event.time}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-1 text-adaptive">{event.title}</h3>
                      <p className="text-muted text-sm leading-relaxed mb-4">{event.description}</p>
                      
                      {event.reminderMinutes && event.reminderMinutes > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase">
                          <Icons.Bell />
                          <span>Reminder set: {event.reminderMinutes >= 1440 ? '1 day before' : `${event.reminderMinutes} minutes before`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center pt-4">
                 <button 
                    onClick={() => onAddEvent(date)}
                    className="flex items-center gap-2 px-4 py-2 bg-adaptive opacity-5 hover:opacity-10 rounded-full font-medium border border-adaptive transition-all text-adaptive"
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
