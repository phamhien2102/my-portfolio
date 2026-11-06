import { useSyncExternalStore } from "react";

const KEY = "native-roadmap-done";
const EVENT = "native-roadmap-change";

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  // Same tab: our own event. Other tabs: the storage event.
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function parse(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function write(next: readonly string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * The boxes ticked on the roadmap, kept in this browser only. The server renders an empty
 * roadmap, so the ticks appear once the page hydrates.
 */
export function useProgress() {
  const done = parse(useSyncExternalStore(subscribe, read, () => "[]"));

  return {
    isDone: (id: string) => done.includes(id),
    /** How many of these ids are ticked, so each section can show its own count. */
    countOf: (ids: readonly string[]) => ids.filter((id) => done.includes(id)).length,
    toggle: (id: string) =>
      write(done.includes(id) ? done.filter((item) => item !== id) : [...done, id]),
    clear: () => write([]),
  };
}
