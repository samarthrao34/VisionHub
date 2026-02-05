
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

        <div className="flex items-center gap-3">
            <button className="p-3 glass rounded-full hover:bg-white/5 transition-all text-adaptive" onClick={exportToJSON}>
                <Icons.Calendar />
            </button>
            <button onClick={toggleTheme} className="p-3 glass rounded-full hover:scale-110 transition-transform text-adaptive">
                {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-action rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:opacity-90 active:scale-95"
            >
              <Icons.Plus />
              <span>Add Logic</span>
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 flex-1 min-h-0 overflow-hidden">
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 md:gap-8 min-h-0 overflow-hidden">
          <GlassCard className="p-6 md:p-8 border-adaptive flex flex-col min-h-0 overflow-hidden shrink-0">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <span className="text-adaptive opacity-60"><Icons.Sparkles /></span>
              <h3 className="font-black text-[9px] uppercase tracking-widest text-muted">Neural Engine</h3>
            </div>
            <form onSubmit={handleAiSearch} className="shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Query schedule..." 
                  className="w-full bg-input border border-adaptive rounded-xl px-4 py-3 text-xs font-bold focus:ring-1 focus:ring-accent-blue outline-none transition-all pr-10 text-adaptive shadow-inner"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  disabled={isAiLoading}
                />
              </div>
            </form>
            
            {aiResponse && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.03] text-[10px] leading-relaxed font-medium text-adaptive animate-in fade-in slide-in-from-bottom-2 overflow-y-auto custom-scrollbar">
                {aiResponse.text}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 md:p-8 flex-1 min-h-0 overflow-hidden flex flex-col border-adaptive">
            <h3 className="font-black text-[9px] uppercase tracking-widest text-muted mb-4 shrink-0">Metric Overview</h3>
            <div className="flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="p-5 glass rounded-2xl flex justify-between items-center group cursor-default shrink-0">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total</span>
                <span className="text-xl font-black text-adaptive group-hover:scale-110 transition-transform">0</span>
              </div>
              <div className="p-5 glass rounded-2xl flex justify-between items-center group cursor-default shrink-0">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Alerts</span>
                <span className="text-xl font-black text-red-500 group-hover:scale-110 transition-transform">0</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <main className="lg:col-span-9 flex flex-col h-full min-h-0 overflow-hidden">
          <GlassCard className="flex-1 flex flex-col shadow-pro border-adaptive rounded-[2rem] md:rounded-[3rem] min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 md:px-10 py-4 md:py-6 border-b border-adaptive shrink-0">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-adaptive">{currentMonthName}</h2>
              <div className="flex gap-1 p-1 glass rounded-full bg-nav">
                  <button onClick={() => changeMonth(-1)} className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-colors text-adaptive"><Icons.ChevronLeft /></button>
                  <button onClick={() => changeMonth(1)} className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-colors text-adaptive"><Icons.ChevronRight /></button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <CalendarGrid 
                currentDate={currentDate} 
                events={events} 
                onDateClick={(date) => setSelectedDate(date)}
              />
            </div>
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
