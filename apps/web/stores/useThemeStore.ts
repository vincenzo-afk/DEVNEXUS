import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'midnight' | 'cyberpunk' | 'forest' | 'arctic' | 'solarized';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: string | null;
  setAccentColor: (color: string) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'midnight',
      setTheme: (theme) => {
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
      },
      accentColor: null,
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: 'devnexus-theme',
    }
  )
);
