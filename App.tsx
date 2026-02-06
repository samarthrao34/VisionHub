import React, { useState, useEffect } from 'react';
import CalendarGrid from './components/CalendarGrid';
import GlassCard from './components/GlassCard';
import EventDetailModal from './components/EventDetailModal';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import EventFilter from './components/EventFilter';
import ImportExport from './components/ImportExport';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Icons } from './constants';
import { EventData } from './types';
import { useEvents, useTheme, useAI, useKeyboardNavigation, useNotifications } from './hooks';

type ViewMode = 'month' | 'week' | 'day';

const AppContent: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminInitialDate, setAdminInitialDate] = useState<Date | undefined>();
  const [editingEvent, setEditingEvent] = useState<EventData | undefined>();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMobileAI, setShowMobileAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Custom hooks
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    importEvents,
    exportEvents,
    eventCounts,
    conflicts,
    getFilteredEvents
  } = useEvents();

  const { theme, toggleTheme } = useTheme();
  
  const {
    query: aiQuery,
    setQuery: setAiQuery,
    response: aiResponse,
    isLoading: isAiLoading,
    search: handleAiSearch,
    suggestedQueries,
    isListening,
    startListening,
    stopListening,
    speechSupported
  } = useAI(events);

  const { requestPermission: requestNotificationPermission } = useNotifications(events);

  // Keyboard navigation
  useKeyboardNavigation({
    onNavigate: (direction) => {
      if (viewMode === 'month') {
        if (direction === 'left') changeMonth(-1);
        else if (direction === 'right') changeMonth(1);
      } else if (viewMode === 'week') {
        if (direction === 'left') changeWeek(-1);
        else if (direction === 'right') changeWeek(1);
      } else {
        if (direction === 'left') changeDay(-1);
        else if (direction === 'right') changeDay(1);
      }
    },
    onViewChange: setViewMode,
    onUndo: () => {}, // Could integrate with useUndoRedo if needed
    onRedo: () => {},
    onShowHelp: () => setShowShortcuts(true)
  });

  // Show conflict warnings
  useEffect(() => {
    if (conflicts.length > 0) {
      setConflictWarning(`${conflicts.length} scheduling conflict${conflicts.length > 1 ? 's' : ''} detected`);
      const timer = setTimeout(() => setConflictWarning(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [conflicts]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const changeWeek = (offset: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + (offset * 7));
      return next;
    });
  };

  const changeDay = (offset: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
  };

  const handleAddEvent = (newEvent: Omit<EventData, 'id'>) => {
    addEvent(newEvent);
  };

  const handleUpdateEvent = (updatedEvent: EventData) => {
    const { id, ...updates } = updatedEvent;
    updateEvent(id, updates);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const handleEditEvent = (event: EventData) => {
    setEditingEvent(event);
    setShowAdmin(true);
  };

  const handleEventDrop = (eventId: string, newDate: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      updateEvent({ ...event, date: newDate });
    }
  };

  const filteredEvents = getFilteredEvents(searchQuery, filterType || undefined);

  const getDateTitle = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleNavigate = () => {
    if (viewMode === 'month') changeMonth(-1);
    else if (viewMode === 'week') changeWeek(-1);
    else changeDay(-1);
  };

  const handleNavigateForward = () => {
    if (viewMode === 'month') changeMonth(1);
    else if (viewMode === 'week') changeWeek(1);
    else changeDay(1);
  };

  return (
    <div className="h-screen max-h-screen p-4 md:p-6 lg:p-8 flex flex-col max-w-[1600px] mx-auto overflow-hidden">
      {conflictWarning && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce">
          {conflictWarning}
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center shadow-pro group hover:rotate-6 transition-transform duration-500 cursor-pointer border-2 border-black/5 shrink-0">
            <span className="font-black text-xl md:text-2xl">C</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-adaptive leading-none">Vision Hub</h1>
            <p className="text-[8px] md:text-[9px] opacity-40 font-black uppercase tracking-[0.4em] mt-0.5 text-adaptive">Departmental OS / CSE</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile AI Toggle */}
            <button 
              className="lg:hidden p-3 glass rounded-full hover:bg-white/5 transition-all text-adaptive"
              onClick={() => setShowMobileAI(!showMobileAI)}
              aria-label="Toggle AI Panel"
            >
              <Icons.Sparkles />
            </button>
            
            <ImportExport onImport={importEvents} onExport={exportEvents} />
            
            <button 
              className="p-3 glass rounded-full hover:bg-white/5 transition-all text-adaptive"
              onClick={() => setShowShortcuts(true)}
              aria-label="Show keyboard shortcuts"
            >
              <Icons.Keyboard />
            </button>
            
            <button 
              className="p-3 glass rounded-full hover:bg-white/5 transition-all text-adaptive"
              onClick={requestNotificationPermission}
              aria-label="Enable notifications"
            >
              <Icons.Bell />
            </button>
            
            <button onClick={toggleTheme} className="p-3 glass rounded-full hover:scale-110 transition-transform text-adaptive">
                {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            
            <button 
              onClick={() => {
                setEditingEvent(undefined);
                setAdminInitialDate(undefined);
                setShowAdmin(true);
              }}
              className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-3.5 bg-action rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:opacity-90 active:scale-95"
            >
              <Icons.Plus />
              <span className="hidden sm:inline">Add Logic</span>
            </button>
        </div>
      </header>

      {/* Mobile AI Panel */}
      {showMobileAI && (
        <div className="lg:hidden mb-4 animate-in slide-in-from-top duration-200">
          <GlassCard className="p-4 border-adaptive">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-adaptive opacity-60"><Icons.Sparkles /></span>
              <h3 className="font-black text-[9px] uppercase tracking-widest text-muted">Neural Engine</h3>
              <button 
                onClick={() => setShowMobileAI(false)} 
                className="ml-auto p-1 hover:bg-white/10 rounded-lg"
              >
                <Icons.X />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAiSearch(); }} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Query schedule..." 
                className="flex-1 bg-input border border-adaptive rounded-xl px-4 py-2 text-xs font-bold focus:ring-1 focus:ring-accent-blue outline-none text-adaptive"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                disabled={isAiLoading}
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'glass text-adaptive'}`}
                >
                  <Icons.Mic />
                </button>
              )}
            </form>
            {isAiLoading && <div className="mt-3 flex justify-center"><LoadingSpinner size="sm" /></div>}
            {aiResponse && (
              <div className="mt-3 p-3 rounded-xl bg-white/[0.03] text-[10px] leading-relaxed font-medium text-adaptive">
                {aiResponse.text}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 flex-1 min-h-0 overflow-hidden">
        {/* Desktop AI Panel */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 md:gap-8 min-h-0 overflow-hidden">
          <GlassCard className="p-6 md:p-8 border-adaptive flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <span className="text-adaptive opacity-60"><Icons.Sparkles /></span>
              <h3 className="font-black text-[9px] uppercase tracking-widest text-muted">Neural Engine</h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAiSearch(); }} className="shrink-0">
              <div className="relative flex gap-2">
                <input 
                  type="text" 
                  placeholder="Query schedule..." 
                  className="flex-1 bg-input border border-adaptive rounded-xl px-4 py-3 text-xs font-bold focus:ring-1 focus:ring-accent-blue outline-none transition-all text-adaptive shadow-inner"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  disabled={isAiLoading}
                />
                {speechSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'glass text-adaptive hover:bg-white/5'}`}
                    aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    <Icons.Mic />
                  </button>
                )}
              </div>
            </form>
            
            {/* Suggested Queries */}
            {!aiResponse && !isAiLoading && suggestedQueries.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setAiQuery(q); }}
                    className="px-3 py-1.5 text-[9px] font-bold glass rounded-full hover:bg-white/10 transition-all text-muted"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            
            {isAiLoading && (
              <div className="mt-4 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            {aiResponse && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.03] text-[10px] leading-relaxed font-medium text-adaptive animate-in fade-in slide-in-from-bottom-2 overflow-y-auto custom-scrollbar flex-1">
                {aiResponse.text}
                {aiResponse.sources && aiResponse.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-adaptive">
                    <p className="text-[8px] uppercase tracking-widest text-muted mb-2">Sources</p>
                    <ul className="space-y-1">
                      {aiResponse.sources.map((source, i) => (
                        <li key={i} className="text-[9px] text-muted">{source}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 md:p-8 flex-1 min-h-0 overflow-hidden flex flex-col border-adaptive">
            <h3 className="font-black text-[9px] uppercase tracking-widest text-muted mb-4 shrink-0">Metric Overview</h3>
            <div className="flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="p-5 glass rounded-2xl flex justify-between items-center group cursor-default shrink-0">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total</span>
                <span className="text-xl font-black text-adaptive group-hover:scale-110 transition-transform">{eventCounts.total}</span>
              </div>
              <div className="p-5 glass rounded-2xl flex justify-between items-center group cursor-default shrink-0">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">This Month</span>
                <span className="text-xl font-black text-accent-blue group-hover:scale-110 transition-transform">{eventCounts.thisMonth}</span>
              </div>
              <div className="p-5 glass rounded-2xl flex justify-between items-center group cursor-default shrink-0">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Upcoming</span>
                <span className="text-xl font-black text-accent-green group-hover:scale-110 transition-transform">{eventCounts.upcoming}</span>
              </div>
              <div className="p-5 glass rounded-2xl flex justify-between items-center group cursor-default shrink-0">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Conflicts</span>
                <span className="text-xl font-black text-red-500 group-hover:scale-110 transition-transform">{conflicts.length}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <main className="lg:col-span-9 flex flex-col h-full min-h-0 overflow-hidden">
          <GlassCard className="flex-1 flex flex-col shadow-pro border-adaptive rounded-[2rem] md:rounded-[3rem] min-h-0 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-10 py-4 md:py-6 border-b border-adaptive shrink-0 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-adaptive">{getDateTitle()}</h2>
                <div className="flex gap-1 p-1 glass rounded-full bg-nav">
                  <button onClick={handleNavigate} className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-colors text-adaptive" aria-label="Previous">
                    <Icons.ChevronLeft />
                  </button>
                  <button onClick={handleNavigateForward} className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-colors text-adaptive" aria-label="Next">
                    <Icons.ChevronRight />
                  </button>
                </div>
              </div>
              
              <EventFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterChange={setFilterType}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            <div className="flex-1 min-h-0">
              {viewMode === 'month' && (
                <CalendarGrid 
                  currentDate={currentDate} 
                  events={filteredEvents} 
                  onDateClick={(date) => setSelectedDate(date)}
                  onEventDrop={handleEventDrop}
                />
              )}
              {viewMode === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={(event) => {
                    const date = new Date(event.date);
                    setSelectedDate(date);
                  }}
                  onTimeSlotClick={(date) => {
                    setAdminInitialDate(date);
                    setEditingEvent(undefined);
                    setShowAdmin(true);
                  }}
                  onEventDrop={handleEventDrop}
                />
              )}
              {viewMode === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={(event) => handleEditEvent(event)}
                  onTimeSlotClick={(date) => {
                    setAdminInitialDate(date);
                    setEditingEvent(undefined);
                    setShowAdmin(true);
                  }}
                />
              )}
            </div>
          </GlassCard>
        </main>
      </div>

      {selectedDate && (
        <EventDetailModal 
          date={selectedDate} 
          events={filteredEvents.filter(e => e.date === selectedDate.toISOString().split('T')[0])} 
          onClose={() => setSelectedDate(null)}
          onAddEvent={(date) => {
            setAdminInitialDate(date);
            setEditingEvent(undefined);
            setShowAdmin(true);
            setSelectedDate(null);
          }}
          onEditEvent={(event) => {
            handleEditEvent(event);
            setSelectedDate(null);
          }}
          onDeleteEvent={(eventId) => {
            handleDeleteEvent(eventId);
          }}
        />
      )}

      {showAdmin && (
        <AdminPanel 
          initialDate={adminInitialDate}
          event={editingEvent}
          onClose={() => {
            setShowAdmin(false);
            setEditingEvent(undefined);
            setAdminInitialDate(undefined);
          }}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          existingEvents={events}
        />
      )}

      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
