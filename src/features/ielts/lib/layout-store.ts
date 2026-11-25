import { useSyncExternalStore } from "react";

const KEY = "ielts-side-collapsed";
const EVENT = `${KEY}-change`;

const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const read = () => {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Whether the reader folded the course menu away on a wide screen, kept in this browser. The
 * server and the first client render show the menu open; a saved choice applies right after.
 */
export function useSideCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const toggle = () => {
    try {
      window.localStorage.setItem(KEY, collapsed ? "0" : "1");
    } catch {
      return;
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return { collapsed, toggle };
}

const Y_KEY = "ielts-side-float-y";
const Y_EVENT = `${Y_KEY}-change`;
const DEFAULT_Y = 0.5;

const subscribeY = (onChange: () => void) => {
  window.addEventListener(Y_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(Y_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const readY = () => {
  try {
    return window.localStorage.getItem(Y_KEY) ?? "";
  } catch {
    return "";
  }
};

/** Keep a vertical position (a share of the window height) inside the range the tab can reach. */
export const clampY = (y: number) => Math.min(Math.max(y, 0.12), 0.9);

/**
 * Where the reader dragged the floating menu tab to: a share of the window height, so it stays in
 * the same place when the window is resized. Kept in this browser; the first render is the middle.
 */
export function useFloatY() {
  const raw = useSyncExternalStore(subscribeY, readY, () => "");
  const parsed = Number.parseFloat(raw);
  const y = Number.isFinite(parsed) ? clampY(parsed) : DEFAULT_Y;
  const set = (next: number) => {
    try {
      window.localStorage.setItem(Y_KEY, String(clampY(next)));
    } catch {
      return;
    }
    window.dispatchEvent(new Event(Y_EVENT));
  };
  return { y, set };
}
