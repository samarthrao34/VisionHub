import { useEffect, useCallback } from 'react';
import { ViewType } from '../types';

interface UseKeyboardNavigationOptions {
  onNavigate: (direction: 'prev' | 'next') => void;
  onViewChange?: (view: ViewType) => void;
  onToday?: () => void;
  onAddEvent?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSearch?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  onNavigate,
  onViewChange,
  onToday,
  onAddEvent,
  onUndo,
  onRedo,
  onSearch,
  enabled = true,
}: UseKeyboardNavigationOptions): void => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Navigation
    if (e.key === 'ArrowLeft' || e.key === 'h') {
      e.preventDefault();
      onNavigate('prev');
    } else if (e.key === 'ArrowRight' || e.key === 'l') {
      e.preventDefault();
      onNavigate('next');
    }

    // View shortcuts
    if (onViewChange) {
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onViewChange('month');
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onViewChange('week');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        onViewChange('day');
      }
    }

    // Today shortcut
    if ((e.key === 't' || e.key === 'T') && onToday) {
      e.preventDefault();
      onToday();
    }

    // Add event shortcut
    if ((e.key === 'n' || e.key === 'N') && onAddEvent) {
      e.preventDefault();
      onAddEvent();
    }

    // Undo/Redo
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey && onUndo) {
        e.preventDefault();
        onUndo();
      } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey)) && onRedo) {
        e.preventDefault();
        onRedo();
      } else if (e.key === 'k' && onSearch) {
        e.preventDefault();
        onSearch();
      }
    }

    // Search shortcut
    if (e.key === '/' && onSearch) {
      e.preventDefault();
      onSearch();
    }
  }, [enabled, onNavigate, onViewChange, onToday, onAddEvent, onUndo, onRedo, onSearch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export const KEYBOARD_SHORTCUTS = [
  { key: '←/h', description: 'Previous period' },
  { key: '→/l', description: 'Next period' },
  { key: 't', description: 'Go to today' },
  { key: 'm', description: 'Month view' },
  { key: 'w', description: 'Week view' },
  { key: 'd', description: 'Day view' },
  { key: 'n', description: 'New event' },
  { key: 'Ctrl+Z', description: 'Undo' },
  { key: 'Ctrl+Y', description: 'Redo' },
  { key: '/', description: 'Search' },
];
