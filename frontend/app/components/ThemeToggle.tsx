'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Cycle dark -> light -> system -> dark
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getIcon = () => {
    // When using 'system', detect effective theme for correct icon
    if (theme === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return <Moon className="h-4 w-4" />;
      }
      return <Sun className="h-4 w-4" />;
    }
    return theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'Using system (dark) — switch to dark/light/system' : 'Using system (light) — switch to dark/light/system';
    }
    return theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
        title="Loading theme..."
        aria-label="Loading theme..."
      >
        <Sun className="h-4 w-4 opacity-50" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
}