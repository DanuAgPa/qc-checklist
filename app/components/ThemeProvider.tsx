'use client';

import { createContext, useContext, useEffect, useCallback, ReactNode, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'qc-theme';

const themeListeners = new Set<() => void>();

function notifyThemeListeners() {
  for (const listener of themeListeners) {
    listener();
  }
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) {
      callback();
    }
  };

  let mediaQuery: MediaQueryList | null = null;
  const handleMediaChange = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      // Jika belum ada pilihan eksplisit (atau "system"), ikuti perubahan tema perangkat
      if (stored !== 'light' && stored !== 'dark') {
        callback();
      }
    } catch {
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleMediaChange);
  }

  return () => {
    themeListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      mediaQuery?.removeEventListener('change', handleMediaChange);
    }
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Jika belum ada nilai tersimpan atau nilai lama "system", ikuti prefers-color-scheme perangkat
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function getThemeServerSnapshot(): Theme {
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // abaikan jika localStorage tidak tersedia
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    notifyThemeListeners();
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // abaikan jika localStorage tidak tersedia
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    notifyThemeListeners();
  }, []);

  // Sinkronkan atribut data-theme ke <html> jika theme berubah (misal dari perubahan tema perangkat)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
