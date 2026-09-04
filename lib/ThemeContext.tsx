import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { Palette, ThemeMode, paletteFor } from './theme';

const STORAGE_KEY = 'jm.theme';

interface ThemeContextValue {
  mode: ThemeMode;
  palette: Palette;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
        } else {
          setMode(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setTheme = (next: ThemeMode) => {
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const toggleTheme = () => setTheme(mode === 'dark' ? 'light' : 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, palette: paletteFor(mode), toggleTheme, setTheme, ready }),
    [mode, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
