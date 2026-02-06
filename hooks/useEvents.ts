import { useState, useEffect, useCallback, useMemo } from 'react';
import { EventData, RecurrenceRule } from '../types';
import { INITIAL_EVENTS } from '../constants';
import { checkTimeConflict, formatDate, parseDate } from '../utils/dateUtils';
import { sanitizeText } from '../utils/sanitize';

interface UseEventsReturn {
  events: EventData[];
  filteredEvents: EventData[];
  addEvent: (event: Omit<EventData, 'id'>) => { success: boolean; conflict?: EventData };
  updateEvent: (id: string, updates: Partial<EventData>) => { success: boolean; conflict?: EventData };
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: Date) => EventData[];
  getEventsForDateRange: (start: Date, end: Date) => EventData[];
  getFilteredEvents: (searchQuery?: string, filterType?: string) => EventData[];
  searchEvents: (query: string) => EventData[];
  filterByType: (types: EventData['type'][]) => void;
  filterByDateRange: (start: Date | null, end: Date | null) => void;
  clearFilters: () => void;
  activeFilters: { types: EventData['type'][]; dateRange: { start: Date | null; end: Date | null } };
  importEvents: (data: EventData[] | string) => { success: boolean; count: number; error?: string };
  exportEvents: () => string;
  conflicts: EventData[][];
  eventCounts: { total: number; byType: Record<EventData['type'], number>; upcoming: number; thisMonth: number };
}

interface EventFilters {
  types: EventData['type'][];
  dateRange: { start: Date | null; end: Date | null };
  searchQuery: string;
}

const generateRecurringInstances = (event: EventData): EventData[] => {
  if (!event.recurrence) return [event];
  
  const instances: EventData[] = [];
  const { frequency, interval = 1, endDate, count } = event.recurrence;
  const startDate = parseDate(event.date);
  let currentDate = startDate;
  let instanceCount = 0;
  const maxInstances = count || 52; // Default to 1 year of weekly events
  const endDateObj = endDate ? parseDate(endDate) : null;

  while (instanceCount < maxInstances) {
    if (endDateObj && currentDate > endDateObj) break;
    
    const instance: EventData = {
      ...event,
      id: `${event.id}-${instanceCount}`,
      date: formatDate(currentDate),
      parentEventId: event.id,
    };
    instances.push(instance);
    instanceCount++;

    switch (frequency) {
      case 'daily':
        currentDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        currentDate = new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + interval));
        break;
      case 'yearly':
        currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + interval));
        break;
    }
  }
  
  return instances;
};

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<EventData[]>(() => {
    const saved = localStorage.getItem('cse_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_EVENTS;
      }
    }
    return INITIAL_EVENTS;
  });

  const [filters, setFilters] = useState<EventFilters>({
    types: [],
    dateRange: { start: null, end: null },
    searchQuery: '',
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cse_events', JSON.stringify(events));
  }, [events]);

  // Expand recurring events
  const expandedEvents = useMemo((): EventData[] => {
    return events.flatMap((event: EventData): EventData[] => {
      if (event.recurrence) {
        return generateRecurringInstances(event);
      }
      return [event];
    });
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo((): EventData[] => {
    let result = expandedEvents;

    if (filters.types.length > 0) {
      result = result.filter((e: EventData) => filters.types.includes(e.type));
    }

    if (filters.dateRange.start) {
      result = result.filter((e: EventData) => parseDate(e.date) >= filters.dateRange.start!);
    }

    if (filters.dateRange.end) {
      result = result.filter((e: EventData) => parseDate(e.date) <= filters.dateRange.end!);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter((e: EventData) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.location?.toLowerCase().includes(query) ||
        e.room?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [expandedEvents, filters]);

  // Find conflicts
  const conflicts = useMemo((): EventData[][] => {
    const conflictGroups: EventData[][] = [];
    const checked = new Set<string>();

    expandedEvents.forEach((event1: EventData, i: number) => {
      if (checked.has(event1.id)) return;
      
      const conflicting = [event1];
      expandedEvents.forEach((event2: EventData, j: number) => {
        if (i >= j || checked.has(event2.id)) return;
        
        if (checkTimeConflict(
          event1.date, event1.time, event1.durationMinutes,
          event2.date, event2.time, event2.durationMinutes
        )) {
          conflicting.push(event2);
          checked.add(event2.id);
        }
      });

      if (conflicting.length > 1) {
        checked.add(event1.id);
        conflictGroups.push(conflicting);
      }
    });

    return conflictGroups;
  }, [expandedEvents]);

  // Event counts
  const eventCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const byType: Record<EventData['type'], number> = {
      Lecture: 0,
      Workshop: 0,
      Exam: 0,
      Holiday: 0,
      Other: 0,
    };

    let upcoming = 0;
    let thisMonth = 0;
    expandedEvents.forEach((event: EventData) => {
      byType[event.type]++;
      const eventDate = parseDate(event.date);
      if (eventDate >= today) {
        upcoming++;
      }
      if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
        thisMonth++;
      }
    });

    return {
      total: expandedEvents.length,
      byType,
      upcoming,
      thisMonth,
    };
  }, [expandedEvents]);

  const addEvent = useCallback((eventData: Omit<EventData, 'id'>) => {
    // Sanitize inputs
    const sanitizedEvent: EventData = {
      ...eventData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: sanitizeText(eventData.title),
      description: sanitizeText(eventData.description),
      location: eventData.location ? sanitizeText(eventData.location) : undefined,
      room: eventData.room ? sanitizeText(eventData.room) : undefined,
    };

    // Check for conflicts
    const conflictingEvent = expandedEvents.find((existing: EventData) =>
      checkTimeConflict(
        existing.date, existing.time, existing.durationMinutes,
        sanitizedEvent.date, sanitizedEvent.time, sanitizedEvent.durationMinutes
      )
    );

    if (conflictingEvent) {
      return { success: false, conflict: conflictingEvent };
    }

    setEvents((prev: EventData[]) => [...prev, sanitizedEvent]);
    return { success: true };
  }, [expandedEvents]);

  const updateEvent = useCallback((id: string, updates: Partial<EventData>) => {
    // Find if this is a recurring instance
    const event = events.find((e: EventData) => e.id === id || e.id === id.split('-')[0]);
    if (!event) return { success: false };

    // Sanitize updates
    const sanitizedUpdates: Partial<EventData> = { ...updates };
    if (updates.title) sanitizedUpdates.title = sanitizeText(updates.title);
    if (updates.description) sanitizedUpdates.description = sanitizeText(updates.description);
    if (updates.location) sanitizedUpdates.location = sanitizeText(updates.location);
    if (updates.room) sanitizedUpdates.room = sanitizeText(updates.room);

    // Check for conflicts (excluding self)
    const newDate = sanitizedUpdates.date || event.date;
    const newTime = sanitizedUpdates.time || event.time;
    const newDuration = sanitizedUpdates.durationMinutes || event.durationMinutes;

    const conflictingEvent = expandedEvents.find((existing: EventData) =>
      existing.id !== id &&
      !existing.id.startsWith(id.split('-')[0] + '-') &&
      checkTimeConflict(
        existing.date, existing.time, existing.durationMinutes,
        newDate, newTime, newDuration
      )
    );

    if (conflictingEvent) {
      return { success: false, conflict: conflictingEvent };
    }

    setEvents((prev: EventData[]) =>
      prev.map((e: EventData) => (e.id === id || e.id === id.split('-')[0]) ? { ...e, ...sanitizedUpdates } : e)
    );
    return { success: true };
  }, [events, expandedEvents]);

  const deleteEvent = useCallback((id: string) => {
    // Handle recurring event deletion
    const baseId = id.split('-')[0];
    setEvents((prev: EventData[]) => prev.filter((e: EventData) => e.id !== id && e.id !== baseId));
  }, []);

  const getEventsForDate = useCallback((date: Date): EventData[] => {
    const dateStr = formatDate(date);
    return filteredEvents.filter((e: EventData) => e.date === dateStr);
  }, [filteredEvents]);

  const getEventsForDateRange = useCallback((start: Date, end: Date): EventData[] => {
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    return filteredEvents.filter((e: EventData) => e.date >= startStr && e.date <= endStr);
  }, [filteredEvents]);

  const searchEvents = useCallback((query: string): EventData[] => {
    const q = query.toLowerCase();
    return filteredEvents.filter((e: EventData) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }, [filteredEvents]);

  const filterByType = useCallback((types: EventData['type'][]) => {
    setFilters((prev: EventFilters) => ({ ...prev, types }));
  }, []);

  const filterByDateRange = useCallback((start: Date | null, end: Date | null) => {
    setFilters((prev: EventFilters) => ({ ...prev, dateRange: { start, end } }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ types: [], dateRange: { start: null, end: null }, searchQuery: '' });
  }, []);

  const importEvents = useCallback((data: EventData[] | string) => {
    try {
      let parsed: EventData[];
      if (typeof data === 'string') {
        // Try parsing as JSON
        parsed = JSON.parse(data);
      } else {
        parsed = data;
      }

      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Invalid format: expected array' };
      }

      // Validate and sanitize imported events
      const validEvents = parsed.filter((e: Partial<EventData>) =>
        e.title && e.date && e.time && e.type
      ).map((e: EventData) => ({
        ...e,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: sanitizeText(e.title),
        description: sanitizeText(e.description || ''),
        durationMinutes: e.durationMinutes || 60,
      }));

      setEvents((prev: EventData[]) => [...prev, ...validEvents]);
      return { success: true, count: validEvents.length };
    } catch (error) {
      return { success: false, count: 0, error: 'Failed to parse import data' };
    }
  }, []);

  const exportEvents = useCallback(() => {
    return JSON.stringify(events, null, 2);
  }, [events]);

  // Get filtered events based on search query and type
  const getFilteredEvents = useCallback((searchQuery?: string, filterType?: string): EventData[] => {
    let result = expandedEvents;
    
    if (filterType) {
      result = result.filter((e: EventData) => e.type === filterType);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e: EventData) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.room?.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [expandedEvents]);

  return {
    events: expandedEvents,
    filteredEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForDateRange,
    searchEvents,
    filterByType,
    filterByDateRange,
    clearFilters,
    activeFilters: { types: filters.types, dateRange: filters.dateRange },
    importEvents,
    exportEvents,
    conflicts,
    eventCounts,
    getFilteredEvents,
  };
};
