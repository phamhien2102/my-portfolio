"use client";

import { useSyncExternalStore } from "react";

import { sampleDoc } from "../data";
import type { ResumeDoc } from "../types";
import { parseDoc } from "./serialize";

/**
 * The CV being edited, kept in memory and mirrored to localStorage as a draft. The server and the
 * first client render show the sample; a saved draft appears right after (same pattern as
 * features/settings). It also keeps a short undo history.
 */

const KEY = "custom-resume.draft.v1";
const SAVE_DELAY = 400;
const MERGE_WINDOW = 700;
const HISTORY = 60;

const SERVER_DOC: ResumeDoc = sampleDoc();

let current: ResumeDoc = SERVER_DOC;
let loaded = false;
const past: ResumeDoc[] = [];
let future: ResumeDoc[] = [];
let lastPush = 0;
let savedAt: number | null = null;
let saveFailed = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((l) => l());
}

/**
 * Early drafts were saved with earlier samples. If one is still untouched, swap it for the current
 * English sample (keeping the look the person chose). Anything edited is left alone.
 */
function upgradeOldSample(doc: ResumeDoc): ResumeDoc {
  const b = doc.data.basics;
  const e = doc.data.experience[0];
  const untouched =
    (b.name === "Trần Minh Anh" || b.name === "Minh Anh Tran") &&
    e?.company === "Lumen Commerce" &&
    (b.title === "Senior Software Engineer" || b.title === "Kỹ sư phần mềm cao cấp");
  if (!untouched) return doc;
  const fresh = sampleDoc();
  return {
    data: { ...fresh.data, basics: { ...fresh.data.basics, avatar: b.avatar } },
    settings: { ...doc.settings, titles: fresh.settings.titles },
  };
}

function load(): ResumeDoc {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "doc" in parsed) {
        const saved = (parsed as { doc: unknown; savedAt?: unknown }).doc;
        const at = (parsed as { savedAt?: unknown }).savedAt;
        if (typeof at === "number") savedAt = at;
        return upgradeOldSample(parseDoc(saved));
      }
    }
  } catch {
    // Storage blocked or corrupt: start from the sample.
  }
  return SERVER_DOC;
}

function scheduleSave() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      const at = Date.now();
      window.localStorage.setItem(KEY, JSON.stringify({ v: 1, savedAt: at, doc: current }));
      savedAt = at;
      saveFailed = false;
    } catch {
      saveFailed = true;
    }
    emit();
  }, SAVE_DELAY);
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    current = load();
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getDoc(): ResumeDoc {
  ensureLoaded();
  return current;
}

export function useResumeDoc(): ResumeDoc {
  return useSyncExternalStore(subscribe, getDoc, () => SERVER_DOC);
}

export interface SaveStatus {
  savedAt: number | null;
  failed: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

let statusCache: { key: string; value: SaveStatus } | null = null;
function getStatus(): SaveStatus {
  ensureLoaded();
  const key = `${version}`;
  if (!statusCache || statusCache.key !== key) {
    statusCache = {
      key,
      value: { savedAt, failed: saveFailed, canUndo: past.length > 0, canRedo: future.length > 0 },
    };
  }
  return statusCache.value;
}
const SERVER_STATUS: SaveStatus = { savedAt: null, failed: false, canUndo: false, canRedo: false };

export function useSaveStatus(): SaveStatus {
  return useSyncExternalStore(subscribe, getStatus, () => SERVER_STATUS);
}

/** Replace the document. Rapid edits (typing) share one undo step. */
export function updateDoc(fn: (d: ResumeDoc) => ResumeDoc, opts: { merge?: boolean } = {}) {
  ensureLoaded();
  const next = fn(current);
  if (next === current) return;
  const now = Date.now();
  if (!(opts.merge !== false && now - lastPush < MERGE_WINDOW && past.length)) {
    past.push(current);
    if (past.length > HISTORY) past.shift();
  }
  lastPush = now;
  future = [];
  current = next;
  scheduleSave();
  emit();
}

/** Replace the whole document (import, reset) as its own undo step. */
export function replaceDoc(doc: ResumeDoc) {
  lastPush = 0;
  updateDoc(() => doc, { merge: false });
}

export function undo() {
  const prev = past.pop();
  if (!prev) return;
  future.push(current);
  current = prev;
  lastPush = 0;
  scheduleSave();
  emit();
}

export function redo() {
  const next = future.pop();
  if (!next) return;
  past.push(current);
  current = next;
  lastPush = 0;
  scheduleSave();
  emit();
}

export function resetDraft() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  savedAt = null;
  replaceDoc(sampleDoc());
}
