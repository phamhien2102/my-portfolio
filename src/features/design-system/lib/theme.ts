import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "design-system-theme";
const EVENT = "design-system-theme-change";

function read(): Theme {
  try {
    return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Light or dark, kept in localStorage. The server and first client render are always light. */
export function useTheme() {
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
}
