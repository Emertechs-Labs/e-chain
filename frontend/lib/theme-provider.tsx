'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  // Use a consistent storage key across the app
  storageKey = 'echain-theme',
  ...props
}: ThemeProviderProps) {
  // Initialize theme synchronously from localStorage when possible to
  // avoid a brief mismatch between the UI and the saved user preference.
  const [theme, setTheme] = useState<Theme>(() => {
    // During SSR we don't know the user's preference. Use 'system' so
    // the server doesn't render a concrete theme class (light/dark).
    // The client-side script in `app/layout.tsx` runs before hydration
    // and will set the correct class from localStorage or system prefs.
    if (typeof window === 'undefined') return 'system';
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) return stored;
    } catch (e) {
      // ignore
    }
    return defaultTheme;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, mounted]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        // ignore storage errors
      }
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};