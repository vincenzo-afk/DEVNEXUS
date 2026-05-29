'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

// ─── Theme Context ───────────────────────────────────────────────────────────

type Theme = 'midnight' | 'aurora' | 'neon' | 'ocean' | 'ember';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'midnight',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('midnight');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('devnexus-theme') as Theme | null;
      const resolved: Theme = stored ?? 'midnight';
      setThemeState(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
    } catch {
      document.documentElement.setAttribute('data-theme', 'midnight');
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('devnexus-theme', t);
    } catch {}
    document.documentElement.setAttribute('data-theme', t);
  };

  // Avoid hydration mismatch: render children with a neutral wrapper until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Combined Providers ───────────────────────────────────────────────────────

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster
          position="bottom-right"
          gutter={12}
          containerStyle={{ zIndex: 9999 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--surface-2))',
              color: 'hsl(var(--text-primary))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: 'var(--font-inter), sans-serif',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'hsl(var(--surface-2))',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'hsl(var(--surface-2))',
              },
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
