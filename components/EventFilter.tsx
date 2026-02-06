import React, { useState, useRef, useEffect } from 'react';
import { EventData } from '../types';
import { Icons, EVENT_COLORS } from '../constants';

type ViewMode = 'month' | 'week' | 'day';

interface EventFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string | null;
  onFilterChange: (type: string | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (view: ViewMode) => void;
}

const EVENT_TYPES: EventData['type'][] = ['Lecture', 'Workshop', 'Exam', 'Holiday', 'Other'];

const EventFilter: React.FC<EventFilterProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleType = (type: EventData['type']) => {
    if (filterType === type) {
      onFilterChange(null);
    } else {
      onFilterChange(type);
    }
  };

  const clearFilters = () => {
    onFilterChange(null);
    onSearchChange('');
  };

  const hasActiveFilters = filterType !== null || searchQuery.length > 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-input border border-adaptive rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-accent-blue outline-none transition-all text-adaptive"
          aria-label="Search events"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <Icons.Search />
        </div>
      </div>

      {/* Filter dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:bg-white/5 ${
            filterType ? 'ring-1 ring-blue-500' : ''
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Filter events"
        >
          <Icons.Filter />
          <span>Filter</span>
          {filterType && (
            <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
              1
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 w-56 glass-dark rounded-2xl p-4 shadow-pro z-50 border border-adaptive animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-3">
              Event Types
            </div>
            <div className="space-y-2">
              {EVENT_TYPES.map(type => {
                const colors = EVENT_COLORS[type];
                const isActive = filterType === type;
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    role="checkbox"
                    aria-checked={isActive}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`}
                      style={{ backgroundColor: isActive ? colors.hex : undefined }}
                    />
                    <span className={`text-xs font-bold ${isActive ? 'text-adaptive' : 'text-muted'}`}>
                      {type}
                    </span>
                    {isActive && (
                      <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full mt-3 pt-3 border-t border-adaptive text-[10px] font-black text-red-500 uppercase tracking-wider hover:text-red-400 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View switcher */}
      <div className="flex items-center glass rounded-xl p-1">
        {(['month', 'week', 'day'] as ViewMode[]).map(view => (
          <button
            key={view}
            onClick={() => onViewModeChange(view)}
            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              viewMode === view 
                ? 'bg-white/10 text-adaptive' 
                : 'text-muted hover:text-adaptive hover:bg-white/5'
            }`}
            aria-pressed={viewMode === view}
            aria-label={`${view} view`}
          >
            {view === 'month' ? <Icons.ViewGrid /> : <Icons.ViewList />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventFilter;
