import { useEffect, useCallback, useRef, useState } from 'react';
import { EventData } from '../types';
import { parseDate, combineDateAndTime } from '../utils/dateUtils';

interface UseNotificationsReturn {
  permission: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (event: EventData) => void;
  cancelNotification: (eventId: string) => void;
  notifiedEvents: Set<string>;
}

export const useNotifications = (events: EventData[]): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const notifiedRef = useRef<Set<string>>(new Set());
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const showNotification = useCallback((event: EventData) => {
    if (permission !== 'granted') return;
    if (notifiedRef.current.has(event.id)) return;

    const notification = new Notification(`Upcoming: ${event.title}`, {
      body: `${event.type} at ${event.time}${event.room ? ` in ${event.room}` : ''}`,
      icon: '/favicon.ico',
      tag: event.id,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    notifiedRef.current.add(event.id);
    setNotifiedEvents(new Set(notifiedRef.current));
  }, [permission]);

  const scheduleNotification = useCallback((event: EventData) => {
    if (permission !== 'granted' || !event.reminderMinutes) return;
    
    const eventTime = combineDateAndTime(parseDate(event.date), event.time);
    const notificationTime = new Date(eventTime.getTime() - event.reminderMinutes * 60 * 1000);
    const now = new Date();
    const delay = notificationTime.getTime() - now.getTime();

    if (delay <= 0) return; // Already passed

    // Clear existing timeout for this event
    const existingTimeout = timeoutsRef.current.get(event.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      showNotification(event);
      timeoutsRef.current.delete(event.id);
    }, delay);

    timeoutsRef.current.set(event.id, timeout);
  }, [permission, showNotification]);

  const cancelNotification = useCallback((eventId: string) => {
    const timeout = timeoutsRef.current.get(eventId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(eventId);
    }
  }, []);

  // Schedule notifications for all events with reminders
  useEffect(() => {
    if (permission !== 'granted') return;

    events.forEach(event => {
      if (event.reminderMinutes && !event.notified) {
        scheduleNotification(event);
      }
    });

    return () => {
      // Cleanup timeouts on unmount
      timeoutsRef.current.forEach((timeout: ReturnType<typeof setTimeout>) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, [events, permission, scheduleNotification]);

  return {
    permission,
    requestPermission,
    scheduleNotification,
    cancelNotification,
    notifiedEvents,
  };
};
