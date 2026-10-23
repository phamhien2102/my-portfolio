import { useSyncExternalStore } from "react";

import type { PatternSlug } from "../data";

const KEY = "algorithms-learned";
const EVENT = "algorithms-learned-change";

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

/**
 * Patterns the visitor marked as learned, kept in this browser. The server knows nothing about
 * them, so it renders "none learned" and the marks appear once the page hydrates.
 */
export function useLearned() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  let learned: string[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) learned = parsed.filter((item) => typeof item === "string");
  } catch {
    learned = [];
  }

  const toggle = (slug: PatternSlug) => {
    const next = learned.includes(slug) ? learned.filter((s) => s !== slug) : [...learned, slug];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      return;
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return {
    isLearned: (slug: PatternSlug) => learned.includes(slug),
    count: learned.length,
    toggle,
  };
}
