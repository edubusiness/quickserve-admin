"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ThemeName, ThemeMode } from "@/types";

interface ThemeContextValue {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (t: ThemeName) => void;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  reset: () => void;
}

const DEFAULT_THEME: ThemeName = "blue";
const DEFAULT_MODE: ThemeMode = "dark";
const STORAGE_KEY = "quickserve-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function apply(theme: ThemeName, mode: ThemeMode) {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  el.setAttribute("data-mode", mode);
  el.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { theme?: ThemeName; mode?: ThemeMode };
        if (saved.theme) setThemeState(saved.theme);
        if (saved.mode) setModeState(saved.mode);
        apply(saved.theme ?? DEFAULT_THEME, saved.mode ?? DEFAULT_MODE);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const persist = useCallback((t: ThemeName, m: ThemeMode) => {
    apply(t, m);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: t, mode: m }));
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const setTheme = useCallback(
    (t: ThemeName) => {
      setThemeState(t);
      persist(t, mode);
    },
    [mode, persist],
  );

  const setMode = useCallback(
    (m: ThemeMode) => {
      setModeState(m);
      persist(theme, m);
    },
    [theme, persist],
  );

  const toggleMode = useCallback(
    () => setMode(mode === "dark" ? "light" : "dark"),
    [mode, setMode],
  );

  const reset = useCallback(() => {
    setThemeState(DEFAULT_THEME);
    setModeState(DEFAULT_MODE);
    persist(DEFAULT_THEME, DEFAULT_MODE);
  }, [persist]);

  return (
    <ThemeContext.Provider
      value={{ theme, mode, setTheme, setMode, toggleMode, reset }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Inline script injected before hydration to prevent a theme flash (FOUC). */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}');var t='${DEFAULT_THEME}',m='${DEFAULT_MODE}';if(s){var p=JSON.parse(s);t=p.theme||t;m=p.mode||m;}var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('data-mode',m);e.style.colorScheme=m;}catch(e){}})();`;
