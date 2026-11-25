import { useSyncExternalStore } from "react";

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
 * The chosen language, kept in localStorage under `<key>-locale`. One store per course page,
 * created once so the hook is stable. The server and the first client render are always English;
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
  steps?: StepText[];
}

/** What one language adds to a course: module names, and the text of the lessons translated so far. */
export interface Translations {
  modules?: Record<string, string>;
  lessons: Record<string, LessonText>;
}

/** Puts a step's translated `labels` into a scene. Only the page knows what its scenes are made of. */
export type SceneLabeller = (scene: unknown, labels: Record<string, string>) => unknown;

/** What a page adds to offer its course in more than one language (the picker shows up with it). */
export interface CourseI18n {
  /** Loads one language's translations when the reader first picks it. */
  load: (locale: Exclude<Locale, "en">) => Promise<Translations>;
  /** Puts a step's translated scene labels into the page's own kind of scene. */
  mapScene?: SceneLabeller;
}

/**
 * The course with a language applied. A lesson, a step or a single field that the translation does
 * not have keeps its English words, so a half-translated course still works end to end.
 * `mapScene` lets a page turn a step's `labels` into changes in its own kind of scene.
 */
export function localizeModules<L extends CourseLesson>(
  modules: readonly CourseModule<L>[],
  translations: Translations | undefined,
  mapScene?: SceneLabeller,
): readonly CourseModule<L>[] {
  if (!translations) return modules;
  return modules.map((module) => ({
    ...module,
    name: translations.modules?.[module.id] ?? module.name,
    lessons: module.lessons.map((lesson) => {
      const text = translations.lessons[lesson.id];
      return text ? localizeLesson(lesson, text, mapScene) : lesson;
    }),
  }));
}

function localizeLesson<L extends CourseLesson>(
  lesson: L,
  text: LessonText,
  mapScene?: SceneLabeller,
): L {
  // Metrics point at the HUD slots by label, so a translated label has to be renamed in both.
  const renamed = new Map<string, string>();
  const hud = lesson.hud.map((slot, i) => {
    const label = text.hud?.[i] ?? slot.label;
    renamed.set(slot.label, label);
    return { ...slot, label };
  });

  return {
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

const en: CourseUi = {
  courseMenu: "Course menu",
  closeMenu: "Close menu",
  sections: "Sections",
  soon: "soon",
  comingSoon: "Coming soon",
  switchToLight: "Switch to light theme",
  switchToDark: "Switch to dark theme",
  language: "Language",
  searchTheCourse: "Search the course",
  search: "Search",
  lessonKind: "Lesson",
  stepKind: "Step",
  nothingMatches: (q) => `Nothing matches “${q}”.`,
  minutes: (n) => `${n} min`,
  stepWord: (n) => `step ${n}`,
  course: "Course",
  lessonsCount: (n) => `${n} lessons`,
  progress: "Progress",
  concept: "Concept",
  recap: "Recap",
  watchOut: "Watch out",
  walkthrough: "Walkthrough",
  problem: "Problem",
  failure: "Failure",
  technique: "Technique",
  callout: { warn: "Watch out", tip: "Good to know", insight: "Key idea" },
  calloutAlgo: { tip: "Tip", insight: "Notice" },
  lessonOf: (p, n) => `Lesson ${p} of ${n}`,
  levels: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
  stepsCount: (n) => `${n} steps`,
  aboutLesson: "About this lesson",
  inThisLesson: "In this lesson",
  toStep: "to step",
  stepOf: (i, n) => `Step ${i} of ${n}`,
  stepSlash: (i, n) => `Step ${i} / ${n}`,
  previousStep: "Previous step",
  nextStep: "Next step",
  whatChanged: "What changed",
  keyTakeaways: "Key takeaways",
  back: "Back",
  nextLabel: (short) => `Next: ${short}`,
  nextLesson: (title) => `Next lesson: ${title}`,
  finishCourse: "Finish course",
  hintStep: "step",
  hintReplay: "replay",
  hintPause: "pause",
  hintPlay: "play",
  pseudocode: "Pseudocode",
  byTheNumbers: "By the numbers",
  youllLearn: "You’ll learn",
  whatYouWillLearn: "What you will learn",
  untranslated: "This lesson has not been translated yet, so it is shown in English.",
};

const vi: CourseUi = {
  courseMenu: "Menu khóa học",
  closeMenu: "Đóng menu",
  sections: "Các mục",
  soon: "sắp có",
  comingSoon: "Sắp ra mắt",
  switchToLight: "Chuyển sang giao diện sáng",
  switchToDark: "Chuyển sang giao diện tối",
  language: "Ngôn ngữ",
  searchTheCourse: "Tìm trong khóa học",
  search: "Tìm kiếm",
  lessonKind: "Bài học",
  stepKind: "Bước",
  nothingMatches: (q) => `Không có kết quả nào cho “${q}”.`,
  minutes: (n) => `${n} phút`,
  stepWord: (n) => `bước ${n}`,
  course: "Khóa học",
  lessonsCount: (n) => `${n} bài học`,
  progress: "Tiến độ",
  concept: "Khái niệm",
  recap: "Tóm tắt",
  watchOut: "Lưu ý",
  walkthrough: "Từng bước",
  problem: "Vấn đề",
  failure: "Thất bại",
  technique: "Kỹ thuật",
  callout: { warn: "Lưu ý", tip: "Nên biết", insight: "Ý chính" },
  calloutAlgo: { tip: "Mẹo", insight: "Chú ý" },
  lessonOf: (p, n) => `Bài ${p} / ${n}`,
  levels: { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" },
  stepsCount: (n) => `${n} bước`,
  aboutLesson: "Về bài học này",
  inThisLesson: "Trong bài này",
  toStep: "để chuyển bước",
  stepOf: (i, n) => `Bước ${i} / ${n}`,
  stepSlash: (i, n) => `Bước ${i} / ${n}`,
  previousStep: "Bước trước",
  nextStep: "Bước sau",
  whatChanged: "Điều gì đã thay đổi",
  keyTakeaways: "Điểm cần nhớ",
  back: "Quay lại",
  nextLabel: (short) => `Tiếp: ${short}`,
  nextLesson: (title) => `Bài tiếp theo: ${title}`,
  finishCourse: "Hoàn thành khóa học",
  hintStep: "chuyển bước",
  hintReplay: "chạy lại",
  hintPause: "tạm dừng",
  hintPlay: "phát",
  pseudocode: "Mã giả",
  byTheNumbers: "Các con số",
  youllLearn: "Bạn sẽ học",
  whatYouWillLearn: "Bạn sẽ học được gì",
  untranslated: "Bài học này chưa được dịch nên đang hiển thị bằng tiếng Anh.",
};

const fr: CourseUi = {
  courseMenu: "Menu du cours",
  closeMenu: "Fermer le menu",
  sections: "Sections",
  soon: "bientôt",
  comingSoon: "Bientôt disponible",
  switchToLight: "Passer au thème clair",
  switchToDark: "Passer au thème sombre",
  language: "Langue",
  searchTheCourse: "Rechercher dans le cours",
  search: "Rechercher",
  lessonKind: "Leçon",
  stepKind: "Étape",
  nothingMatches: (q) => `Aucun résultat pour « ${q} ».`,
  minutes: (n) => `${n} min`,
  stepWord: (n) => `étape ${n}`,
  course: "Cours",
  lessonsCount: (n) => `${n} leçons`,
  progress: "Progression",
  concept: "Concept",
  recap: "Récapitulatif",
  watchOut: "Attention",
  walkthrough: "Pas à pas",
  problem: "Problème",
  failure: "Échec",
  technique: "Technique",
  callout: { warn: "Attention", tip: "Bon à savoir", insight: "Idée clé" },
  calloutAlgo: { tip: "Astuce", insight: "À noter" },
  lessonOf: (p, n) => `Leçon ${p} sur ${n}`,
  levels: { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" },
  stepsCount: (n) => `${n} étapes`,
  aboutLesson: "À propos de cette leçon",
  inThisLesson: "Dans cette leçon",
  toStep: "pour changer d’étape",
  stepOf: (i, n) => `Étape ${i} sur ${n}`,
  stepSlash: (i, n) => `Étape ${i} / ${n}`,
  previousStep: "Étape précédente",
  nextStep: "Étape suivante",
  whatChanged: "Ce qui a changé",
  keyTakeaways: "À retenir",
  back: "Retour",
  nextLabel: (short) => `Suivant : ${short}`,
  nextLesson: (title) => `Leçon suivante : ${title}`,
  finishCourse: "Terminer le cours",
  hintStep: "étape",
  hintReplay: "rejouer",
  hintPause: "pause",
  hintPlay: "lecture",
  pseudocode: "Pseudo-code",
  byTheNumbers: "En chiffres",
  youllLearn: "Vous allez apprendre",
  whatYouWillLearn: "Ce que vous allez apprendre",
  untranslated: "Cette leçon n’est pas encore traduite ; elle s’affiche en anglais.",
};

const de: CourseUi = {
  courseMenu: "Kursmenü",
  closeMenu: "Menü schließen",
  sections: "Bereiche",
  soon: "bald",
  comingSoon: "Demnächst verfügbar",
  switchToLight: "Zum hellen Design wechseln",
  switchToDark: "Zum dunklen Design wechseln",
  language: "Sprache",
  searchTheCourse: "Im Kurs suchen",
  search: "Suchen",
  lessonKind: "Lektion",
  stepKind: "Schritt",
  nothingMatches: (q) => `Keine Treffer für „${q}“.`,
  minutes: (n) => `${n} Min.`,
  stepWord: (n) => `Schritt ${n}`,
  course: "Kurs",
  lessonsCount: (n) => `${n} Lektionen`,
  progress: "Fortschritt",
  concept: "Konzept",
  recap: "Zusammenfassung",
  watchOut: "Achtung",
  walkthrough: "Schritt für Schritt",
  problem: "Problem",
  failure: "Fehlschlag",
  technique: "Technik",
  callout: { warn: "Achtung", tip: "Gut zu wissen", insight: "Kernidee" },
  calloutAlgo: { tip: "Tipp", insight: "Beachte" },
  lessonOf: (p, n) => `Lektion ${p} von ${n}`,
  levels: { beginner: "Einsteiger", intermediate: "Fortgeschritten", advanced: "Experte" },
  stepsCount: (n) => `${n} Schritte`,
  aboutLesson: "Über diese Lektion",
  inThisLesson: "In dieser Lektion",
  toStep: "zum Wechseln",
  stepOf: (i, n) => `Schritt ${i} von ${n}`,
  stepSlash: (i, n) => `Schritt ${i} / ${n}`,
  previousStep: "Vorheriger Schritt",
  nextStep: "Nächster Schritt",
  whatChanged: "Was sich geändert hat",
  keyTakeaways: "Das Wichtigste",
  back: "Zurück",
  nextLabel: (short) => `Weiter: ${short}`,
  nextLesson: (title) => `Nächste Lektion: ${title}`,
  finishCourse: "Kurs abschließen",
  hintStep: "Schritt",
  hintReplay: "wiederholen",
  hintPause: "Pause",
  hintPlay: "Abspielen",
  pseudocode: "Pseudocode",
  byTheNumbers: "In Zahlen",
  youllLearn: "Das lernst du",
  whatYouWillLearn: "Was du lernen wirst",
  untranslated: "Diese Lektion ist noch nicht übersetzt und wird auf Englisch angezeigt.",
};

export const COURSE_UI: Record<Locale, CourseUi> = { en, vi, fr, de };
