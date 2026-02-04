
export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format: YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number; // e.g. 60
  location?: string; // e.g. "Main Building"
  room?: string; // e.g. "Lab 402"
  resourcesUrl?: string; // Link to syllabus or notes
  imageUrl: string;
  type: 'Lecture' | 'Workshop' | 'Exam' | 'Holiday' | 'Other';
  reminderMinutes?: number; 
  notified?: boolean; 
}

export type ViewType = 'month' | 'week' | 'day';

export interface CalendarState {
  currentDate: Date;
  view: ViewType;
  events: EventData[];
}
