import { useSyncExternalStore } from "react";

/**
 * A tick-list kept in localStorage for one page. Same pattern as the algorithms and native
 * roadmaps: the server renders an empty list, the ticks appear once the page hydrates, a custom
 * event updates this tab and `storage` updates the others.
 */
export function createChecklist(key: string) {
  const event = `${key}-change`;

  function read(): string {
    try {
      return window.localStorage.getItem(key) ?? "[]";
    } catch {
      return "[]";
    }
  }

  function subscribe(onChange: () => void) {
    window.addEventListener(event, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(event, onChange);
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
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      return;
    }
    window.dispatchEvent(new Event(event));
  }

  return function useChecklist() {
    const done = parse(useSyncExternalStore(subscribe, read, () => "[]"));
    return {
      isDone: (id: string) => done.includes(id),
      countOf: (ids: readonly string[]) => ids.filter((id) => done.includes(id)).length,
      toggle: (id: string) =>
        write(done.includes(id) ? done.filter((item) => item !== id) : [...done, id]),
      clear: () => write([]),
    };
  };
}
