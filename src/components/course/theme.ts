import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

interface ThemeStore {
  useTheme: () => { theme: Theme; toggle: () => void };
}

const stores = new Map<string, ThemeStore>();

/**
 * Light or dark, kept in localStorage under `<key>-theme`. One store per course page, created once
 * so the hook is stable. The server and first client render are always light.
 */
export function themeStore(key: string): ThemeStore {
  const existing = stores.get(key);
  if (existing) return existing;

  const KEY = `${key}-theme`;
  const EVENT = `${key}-theme-change`;
  const read = (): Theme => {
    try {
      return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  };
  const subscribe = (onChange: () => void) => {
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  };
  const store: ThemeStore = {
    useTheme() {
      const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
      const toggle = () => {
        try {
          window.localStorage.setItem(KEY, theme === "dark" ? "light" : "dark");
        } catch {
          return;
        }
        window.dispatchEvent(new Event(EVENT));
      };
      return { theme, toggle };
    },
  };
  stores.set(key, store);
  return store;
}
