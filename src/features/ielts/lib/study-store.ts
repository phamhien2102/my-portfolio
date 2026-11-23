import { useMemo, useSyncExternalStore } from "react";

export const HIGHLIGHT_COLORS = ["red", "yellow", "green"] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

/** A text highlight, stored as character offsets into one chapter's textContent. */
export interface Highlight {
  id: string;
  chapterId: string;
  start: number;
  end: number;
  /** Highlights saved before colours existed have none; they read as yellow. */
  color?: HighlightColor;
}

export interface Flashcard {
  id: string;
  word: string;
  meaning: string;
  chapterId: string;
  createdAt: number;
}

/**
 * A small JSON list kept in localStorage. Same pattern as `createChecklist`: the server renders
 * an empty list, saved items appear after hydration, a custom event updates this tab and
 * `storage` updates the others. The raw string is the snapshot so it stays referentially stable.
 */
function createListStore<T>(key: string, isItem: (value: unknown) => value is T) {
  const event = `${key}-change`;

  const read = () => {
    try {
      return window.localStorage.getItem(key) ?? "[]";
    } catch {
      return "[]";
    }
  };

  const subscribe = (onChange: () => void) => {
    window.addEventListener(event, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(event, onChange);
      window.removeEventListener("storage", onChange);
    };
  };

  const parse = (raw: string): T[] => {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isItem) : [];
    } catch {
      return [];
    }
  };

  // Read fresh from storage so two quick writes in one tick don't clobber each other.
  const update = (change: (items: T[]) => T[]) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(change(parse(read()))));
    } catch {
      return;
    }
    window.dispatchEvent(new Event(event));
  };

  return function useList() {
    const raw = useSyncExternalStore(subscribe, read, () => "[]");
    const items = useMemo(() => parse(raw), [raw]);
    return { items, update };
  };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const useHighlights = createListStore<Highlight>(
  "ielts-highlights",
  (v): v is Highlight =>
    isObject(v) &&
    typeof v.id === "string" &&
    typeof v.chapterId === "string" &&
    typeof v.start === "number" &&
    typeof v.end === "number",
);

export const useFlashcards = createListStore<Flashcard>(
  "ielts-flashcards",
  (v): v is Flashcard =>
    isObject(v) &&
    typeof v.id === "string" &&
    typeof v.word === "string" &&
    typeof v.meaning === "string" &&
    typeof v.chapterId === "string" &&
    typeof v.createdAt === "number",
);

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
