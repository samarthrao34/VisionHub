
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CalendarGrid from './components/CalendarGrid';
import GlassCard from './components/GlassCard';
import EventDetailModal from './components/EventDetailModal';
import AdminPanel from './components/AdminPanel';
import { Icons, INITIAL_EVENTS } from './constants';
import { EventData } from './types';
import { queryAIAboutEvents, AIResponse } from './services/geminiService';

type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>(() => {
    const saved = localStorage.getItem('cse_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS.map(e => ({ ...e, durationMinutes: 60 }));
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme') as Theme;
    return saved || 'dark';
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminInitialDate, setAdminInitialDate] = useState<Date | undefined>();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('cse_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      return next;
    });
  };

  const handleAddEvent = (newEvent: Omit<EventData, 'id'>) => {
    const eventWithId = { ...newEvent, id: Date.now().toString() };
    setEvents([...events, eventWithId]);
  };

  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "cse_schedule.json");
    anchor.click();
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    const result = await queryAIAboutEvents(aiQuery, events);
    setAiResponse(result);
    setIsAiLoading(false);
  };

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col max-w-7xl mx-auto">
      {conflictWarning && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce">
          {conflictWarning}
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-pro group hover:rotate-6 transition-transform duration-500 cursor-pointer border-4 border-black/5">
            <span className="font-black text-3xl">C</span>
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-adaptive">Vision Hub</h1>
            <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.5em] mt-1 text-adaptive">Departmental OS / CSE</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <button className="p-4 glass rounded-full hover:bg-white/5 transition-all text-adaptive" onClick={exportToJSON}>
                <Icons.Calendar />
            </button>
            <button onClick={toggleTheme} className="p-4 glass rounded-full hover:scale-110 transition-transform text-adaptive">
                {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-3 px-8 py-5 bg-action rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:opacity-90 active:scale-95"
            >
              <Icons.Plus />
              <span>Add Logic</span>
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
        <div className="lg:col-span-3 space-y-10">
          <GlassCard className="p-10 border-adaptive">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-adaptive opacity-60"><Icons.Sparkles /></span>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-muted">Neural Engine</h3>
            </div>
            <form onSubmit={handleAiSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Query schedule..." 
                  className="w-full bg-input border border-adaptive rounded-2xl px-6 py-5 text-sm font-bold focus:ring-1 focus:ring-accent-blue outline-none transition-all pr-12 text-adaptive shadow-inner"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  disabled={isAiLoading}
                />
              </div>
            </form>
            
            {aiResponse && (
              <div className="mt-8 p-5 rounded-2xl bg-white/[0.03] text-[11px] leading-relaxed font-medium text-adaptive animate-in fade-in slide-in-from-bottom-2">
                {aiResponse.text}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-10">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-muted mb-8">Metric Overview</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 glass rounded-2xl flex justify-between items-center group cursor-default">
                <span className="text-[11px] font-black text-muted uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-adaptive group-hover:scale-110 transition-transform">0</span>
              </div>
              <div className="p-6 glass rounded-2xl flex justify-between items-center group cursor-default">
                <span className="text-[11px] font-black text-muted uppercase tracking-widest">Alerts</span>
                <span className="text-2xl font-black text-red-500 group-hover:scale-110 transition-transform">0</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <main className="lg:col-span-9 flex flex-col h-full">
          <GlassCard className="flex-1 flex flex-col shadow-pro border-adaptive rounded-[3rem]">
            <div className="flex items-center justify-between px-12 py-10 border-b border-adaptive">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-adaptive">{currentMonthName}</h2>
              <div className="flex gap-1 p-1 glass rounded-full bg-nav">
                  <button onClick={() => changeMonth(-1)} className="p-4 hover:bg-white/5 rounded-full transition-colors text-adaptive"><Icons.ChevronLeft /></button>
                  <button onClick={() => changeMonth(1)} className="p-4 hover:bg-white/5 rounded-full transition-colors text-adaptive"><Icons.ChevronRight /></button>
              </div>
            </div>

            <CalendarGrid 
              currentDate={currentDate} 
              events={events} 
              onDateClick={(date) => setSelectedDate(date)}
            />
          </GlassCard>
        </main>
      </div>

      {selectedDate && (
        <EventDetailModal 
          date={selectedDate} 
          events={events.filter(e => e.date === selectedDate.toISOString().split('T')[0])} 
          onClose={() => setSelectedDate(null)}
          onAddEvent={(date) => {
            setAdminInitialDate(date);
            setShowAdmin(true);
            setSelectedDate(null);
          }}
        />
      )}

      {showAdmin && (
        <AdminPanel 
          initialDate={adminInitialDate}
          onClose={() => setShowAdmin(false)}
          onAddEvent={handleAddEvent}
        />
      )}
    </div>
  );
};

export default App;
