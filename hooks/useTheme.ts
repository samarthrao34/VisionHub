import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme') as Theme;
    if (saved === 'dark' || saved === 'light') return saved;
    
    // Check system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark'; // Default to dark
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#eef2f7');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('app_theme');
      if (!saved) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev: Theme) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
  };
};
