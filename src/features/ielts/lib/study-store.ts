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

/**
 * A note on a passage, stored like a highlight (character offsets into one chapter's textContent).
 * The quoted text is kept with it, so the note still reads right in the list if the chapter changes.
 */
export interface Note {
  id: string;
  chapterId: string;
  start: number;
  end: number;
  quote: string;
  text: string;
  createdAt: number;
  /** When the text was last changed. Notes saved before this field existed, or never edited, have none. */
  updatedAt?: number;
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

export const useNotes = createListStore<Note>(
  "ielts-notes",
  (v): v is Note =>
    isObject(v) &&
    typeof v.id === "string" &&
    typeof v.chapterId === "string" &&
    typeof v.start === "number" &&
    typeof v.end === "number" &&
    typeof v.quote === "string" &&
    typeof v.text === "string" &&
    typeof v.createdAt === "number",
);

/** The longest a note's text may be. */
export const MAX_NOTE = 2000;

const dayMonthYear = (time: number) => new Date(time).toLocaleDateString("en-GB");

/** "Added 24/11/2026 · Edited 25/11/2026": the dates a note was written and last changed, day first. */
export function noteDates(note: Pick<Note, "createdAt" | "updatedAt">) {
  const added = `Added ${dayMonthYear(note.createdAt)}`;
  return note.updatedAt ? `${added} · Edited ${dayMonthYear(note.updatedAt)}` : added;
}

/** The note with new text; the edit date moves only when the text really changed. */
export function withText(note: Note, text: string): Note {
  return text === note.text ? note : { ...note, text, updatedAt: Date.now() };
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
