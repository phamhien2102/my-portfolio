import { useSyncExternalStore } from "react";

import { de } from "./locales/de";
import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { vi } from "./locales/vi";
import type { CalloutKind, CourseLesson, CourseModule, Level } from "./types";

/** The languages a course page can offer. English is the original; the others are translations. */
export type Locale = "en" | "vi" | "fr" | "de";

export const LOCALES: ReadonlyArray<{ code: Locale; short: string; name: string }> = [
  { code: "en", short: "EN", name: "English" },
  { code: "vi", short: "VI", name: "Tiếng Việt" },
  { code: "fr", short: "FR", name: "Français" },
  { code: "de", short: "DE", name: "Deutsch" },
];

export const isLocale = (value: unknown): value is Locale =>
  LOCALES.some((locale) => locale.code === value);

interface LocaleStore {
  useLocale: () => { locale: Locale; setLocale: (next: Locale) => void };
}

const stores = new Map<string, LocaleStore>();

/**
 * The chosen language, kept in localStorage under `<key>-locale`. The course pages all use the
 * same key, so a language picked on one applies to the others; a page with no translations stays
 * in English. One store per key, created once so the hook is stable. The server and the first client render are always English;
 * a saved choice applies right after hydration, so the markup matches.
 */
export function localeStore(key: string): LocaleStore {
  const existing = stores.get(key);
  if (existing) return existing;

  const KEY = `${key}-locale`;
  const EVENT = `${key}-locale-change`;
  const read = (): Locale => {
    try {
      const saved = window.localStorage.getItem(KEY);
      return isLocale(saved) ? saved : "en";
    } catch {
      return "en";
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
  const store: LocaleStore = {
    useLocale() {
      const locale = useSyncExternalStore(subscribe, read, () => "en" as Locale);
      const setLocale = (next: Locale) => {
        try {
          window.localStorage.setItem(KEY, next);
        } catch {
          return;
        }
        window.dispatchEvent(new Event(EVENT));
      };
      return { locale, setLocale };
    },
  };
  stores.set(key, store);
  return store;
}

// ---- translations of a course's own content ----------------------------------------------

/**
 * The translated words of one step. Every field is optional: whatever is missing stays in English.
 * `metrics` and `changes` are lists in the same order as the step's own, and `labels` is keyed by
 * the id of an item in the step's scene (see the page's `mapScene`).
 */
export interface StepText {
  short?: string;
  title?: string;
  body?: string[];
  callout?: string;
  chapter?: string;
  metrics?: Array<string | null>;
  changes?: string[];
  labels?: Record<string, string>;
}

/** The translated words of one lesson. `hud` lists the labels in the order of the lesson's own. */
export interface LessonText {
  title?: string;
  summary?: string;
  goals?: string[];
  takeaways?: string[];
  hud?: string[];
  pseudocode?: string[];
  /** Words that belong to the lesson as a whole, keyed by the page's own ids (see `mapLesson`). */
  labels?: Record<string, string>;
  steps?: StepText[];
}

/** What one language adds to a course: module names, and the text of the lessons translated so far. */
export interface Translations {
  modules?: Record<string, string>;
  lessons: Record<string, LessonText>;
}

/** Puts a step's translated `labels` into a scene. Only the page knows what its scenes are made of. */
export type SceneLabeller = (scene: unknown, labels: Record<string, string>) => unknown;

/** Puts a lesson's translated `labels` into the lesson itself, such as the names on a diagram. */
export type LessonLabeller = (lesson: unknown, labels: Record<string, string>) => unknown;

/**
 * Everything one language adds to a page, kept in one file per language: the page's own words
 * (`ui`, whatever shape the page gives them) and the translated course.
 */
export interface LocaleBundle<U = unknown> {
  ui: U;
  translations: Translations;
}

/** What a page adds to offer its course in more than one language (the picker shows up with it). */
export interface CourseI18n<U = unknown> {
  /** The page's own words in English, the language the course is written in. */
  english: U;
  /** Loads one language when the reader first picks it. The shell switches to it all at once. */
  load: (locale: Exclude<Locale, "en">) => Promise<LocaleBundle<U>>;
  /** Puts a step's translated scene labels into the page's own kind of scene. */
  mapScene?: SceneLabeller;
  /** Puts a lesson's translated `labels` into the lesson (for words that are not in a step). */
  mapLesson?: LessonLabeller;
}

/**
 * The course with a language applied. A lesson, a step or a single field that the translation does
 * not have keeps its English words, so a half-translated course still works end to end.
 * `mapScene` lets a page turn a step's `labels` into changes in its own kind of scene.
 */
export function localizeModules<L extends CourseLesson>(
  modules: readonly CourseModule<L>[],
  translations: Translations | undefined,
  mappers: Pick<CourseI18n, "mapScene" | "mapLesson"> = {},
): readonly CourseModule<L>[] {
  if (!translations) return modules;
  return modules.map((module) => ({
    ...module,
    name: translations.modules?.[module.id] ?? module.name,
    lessons: module.lessons.map((lesson) => {
      const text = translations.lessons[lesson.id];
      return text ? localizeLesson(lesson, text, mappers) : lesson;
    }),
  }));
}

function localizeLesson<L extends CourseLesson>(
  lesson: L,
  text: LessonText,
  { mapScene, mapLesson }: Pick<CourseI18n, "mapScene" | "mapLesson">,
): L {
  // Metrics point at the HUD slots by label, so a translated label has to be renamed in both.
  const renamed = new Map<string, string>();
  const hud = lesson.hud.map((slot, i) => {
    const label = text.hud?.[i] ?? slot.label;
    renamed.set(slot.label, label);
    return { ...slot, label };
  });

  const localized = {
    ...lesson,
    title: text.title ?? lesson.title,
    summary: text.summary ?? lesson.summary,
    goals: text.goals ?? lesson.goals,
    takeaways: text.takeaways ?? lesson.takeaways,
    pseudocode: text.pseudocode ?? lesson.pseudocode,
    hud,
    steps: lesson.steps.map((step, i) => {
      const t = text.steps?.[i];
      return {
        ...step,
        short: t?.short ?? step.short,
        title: t?.title ?? step.title,
        body: t?.body ?? step.body,
        callout: step.callout && t?.callout ? { ...step.callout, text: t.callout } : step.callout,
        chapter: step.chapter && t?.chapter ? { ...step.chapter, label: t.chapter } : step.chapter,
        metrics: step.metrics?.map((m, j) => ({
          ...m,
          label: renamed.get(m.label) ?? m.label,
          value: t?.metrics?.[j] ?? m.value,
        })),
        changes: step.changes?.map((c, j) => ({ ...c, text: t?.changes?.[j] ?? c.text })),
        scene: t?.labels && mapScene ? mapScene(step.scene, t.labels) : step.scene,
      };
    }),
  } as L;
  return text.labels && mapLesson ? (mapLesson(localized, text.labels) as L) : localized;
}

// ---- the words of the course shell -----------------------------------------------------------

/** Every word the shared course shell shows. English is the default; a page supplies the rest. */
export interface CourseUi {
  courseMenu: string;
  closeMenu: string;
  sections: string;
  soon: string;
  comingSoon: string;
  switchToLight: string;
  switchToDark: string;
  /** The classic course page only: the chips above the stage and its play controls. */
  numbersForStep: string;
  replay: string;
  play: string;
  pause: string;
  language: string;
  searchTheCourse: string;
  search: string;
  lessonKind: string;
  stepKind: string;
  nothingMatches: (query: string) => string;
  minutes: (n: number) => string;
  stepWord: (n: number) => string;
  course: string;
  lessonsCount: (n: number) => string;
  progress: string;
  // what kind of step it is
  concept: string;
  recap: string;
  watchOut: string;
  walkthrough: string;
  problem: string;
  failure: string;
  technique: string;
  // the box under a step
  callout: Record<CalloutKind, string>;
  /** Algo Lab names two of the boxes differently. */
  calloutAlgo: Pick<Record<CalloutKind, string>, "tip" | "insight">;
  lessonOf: (position: number, total: number) => string;
  levels: Record<Level, string>;
  stepsCount: (n: number) => string;
  aboutLesson: string;
  inThisLesson: string;
  toStep: string;
  stepOf: (index: number, total: number) => string;
  stepSlash: (index: number, total: number) => string;
  previousStep: string;
  nextStep: string;
  whatChanged: string;
  keyTakeaways: string;
  back: string;
  nextLabel: (short: string) => string;
  nextLesson: (title: string) => string;
  finishCourse: string;
  hintStep: string;
  hintReplay: string;
  hintPause: string;
  hintPlay: string;
  pseudocode: string;
  byTheNumbers: string;
  youllLearn: string;
  whatYouWillLearn: string;
  /** Shown on a lesson that has no translation yet, which is why it is in English. */
  untranslated: string;
}

/** The shell's words in every language, one file each in ./locales. */
export const COURSE_UI: Record<Locale, CourseUi> = { en, vi, fr, de };
