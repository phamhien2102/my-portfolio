"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed state for the mock tests, so an answer sheet or an essay survives a
 * reload and a running clock keeps its end time. Server renders and the first client render use
 * `initial`; the saved value appears right after (same pattern as the course's other stores).
 * `initial` must be a stable object (a module constant).
 */

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function read<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = initial;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    // storage blocked or corrupt: start fresh
  }
  cache.set(key, value);
  return value;
}

function subscribeKey(key: string, listener: () => void) {
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

export function usePersisted<T>(key: string, initial: T): [T, (update: (prev: T) => T) => void] {
  const value = useSyncExternalStore(
    (l) => subscribeKey(key, l),
    () => read(key, initial),
    () => initial,
  );
  const set = useCallback(
    (update: (prev: T) => T) => {
      const next = update(read(key, initial));
      cache.set(key, next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage blocked: the value lives for this visit only
      }
      listeners.get(key)?.forEach((l) => l());
    },
    [key, initial],
  );
  return [value, set];
}

/* ---- a shared one-second clock ---- */

let tickNow = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const tickers = new Set<() => void>();

function subscribeClock(l: () => void) {
  tickers.add(l);
  if (tickers.size === 1) {
    tickNow = Date.now();
    timer = setInterval(() => {
      tickNow = Date.now();
      tickers.forEach((f) => f());
    }, 1000);
  }
  return () => {
    tickers.delete(l);
    if (!tickers.size) clearInterval(timer);
  };
}

/** The current time in ms, ticking once a second. 0 on the server. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribeClock,
    () => (tickNow ||= Date.now()),
    () => 0,
  );
}

export function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h ? `${h}:${String(m).padStart(2, "0")}` : m}:${String(s % 60).padStart(2, "0")}`;
}

export const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
