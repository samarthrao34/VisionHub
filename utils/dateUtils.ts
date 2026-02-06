import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  formatISO,
  differenceInMinutes,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
} from 'date-fns';

export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(date, formatStr);
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const parseDate = (dateStr: string): Date => {
  return parseISO(dateStr);
};

export const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

export const combineDateAndTime = (date: Date, timeStr: string): Date => {
  const { hours, minutes } = parseTime(timeStr);
  return setMinutes(setHours(date, hours), minutes);
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getCalendarDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const navigateDate = (
  date: Date,
  direction: 'prev' | 'next',
  view: 'day' | 'week' | 'month'
): Date => {
  const operations = {
    prev: { day: subDays, week: subWeeks, month: subMonths },
    next: { day: addDays, week: addWeeks, month: addMonths },
  };
  return operations[direction][view](date, 1);
};

export const checkTimeConflict = (
  date1: string,
  time1: string,
  duration1: number,
  date2: string,
  time2: string,
  duration2: number
): boolean => {
  if (date1 !== date2) return false;
  
  const start1 = combineDateAndTime(parseDate(date1), time1).getTime();
  const end1 = start1 + duration1 * 60 * 1000;
  const start2 = combineDateAndTime(parseDate(date2), time2).getTime();
  const end2 = start2 + duration2 * 60 * 1000;
  
  return start1 < end2 && start2 < end1;
};

export const getTimeSlots = (startHour: number = 0, endHour: number = 24, interval: number = 60): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
};

export { isSameDay, isSameMonth, isToday, parseISO, formatISO };
