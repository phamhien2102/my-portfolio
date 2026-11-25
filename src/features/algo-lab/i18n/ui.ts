import type { Locale } from "@/components/course/i18n";

/** The words that belong to Algo Lab itself, on top of the ones every course page shares. */
export interface AlgoUi {
  nav: {
    learn: string;
    practice: string;
    cheatsheets: string;
    challenges: string;
    progress: string;
  };
  searchPlaceholder: string;
  /** The colour key under the stage. */
  legend: { active: string; found: string; settled: string; problem: string };
  /** How a block's state is named in "What changed", by its tone. */
  tones: Record<
    "plain" | "active" | "found" | "done" | "warn" | "mark" | "muted" | "ghost",
    string
  >;
  isNow: (name: string, tone: string) => string;
  moved: (name: string) => string;
  pointer: (text: string) => string;
}

const en: AlgoUi = {
  nav: {
    learn: "Learn",
    practice: "Practice",
    cheatsheets: "Cheatsheets",
    challenges: "Challenges",
    progress: "Progress",
  },
  searchPlaceholder: "Search lessons & concepts…",
  legend: { active: "checking", found: "found", settled: "settled", problem: "problem" },
  tones: {
    plain: "plain",
    active: "active",
    found: "found",
    done: "done",
    warn: "warn",
    mark: "mark",
    muted: "muted",
    ghost: "empty",
  },
  isNow: (name, tone) => `${name} is now ${tone}`,
  moved: (name) => `${name} moved`,
  pointer: (text) => `Pointer ${text}`,
};

const vi: AlgoUi = {
  nav: {
    learn: "Học",
    practice: "Luyện tập",
    cheatsheets: "Tóm tắt nhanh",
    challenges: "Thử thách",
    progress: "Tiến độ",
  },
  searchPlaceholder: "Tìm bài học và khái niệm…",
  legend: { active: "đang xét", found: "đã tìm thấy", settled: "đã xong", problem: "có lỗi" },
  tones: {
    plain: "bình thường",
    active: "đang xét",
    found: "đã tìm thấy",
    done: "đã xong",
    warn: "có lỗi",
    mark: "được đánh dấu",
    muted: "bị mờ đi",
    ghost: "trống",
  },
  isNow: (name, tone) => `${name} giờ ${tone}`,
  moved: (name) => `${name} đã di chuyển`,
  pointer: (text) => `Con trỏ ${text}`,
};

const fr: AlgoUi = {
  nav: {
    learn: "Apprendre",
    practice: "S’entraîner",
    cheatsheets: "Antisèches",
    challenges: "Défis",
    progress: "Progression",
  },
  searchPlaceholder: "Rechercher leçons et notions…",
  legend: { active: "en cours", found: "trouvé", settled: "réglé", problem: "problème" },
  tones: {
    plain: "normal",
    active: "actif",
    found: "trouvé",
    done: "terminé",
    warn: "en alerte",
    mark: "marqué",
    muted: "estompé",
    ghost: "vide",
  },
  isNow: (name, tone) => `${name} est maintenant ${tone}`,
  moved: (name) => `${name} a bougé`,
  pointer: (text) => `Pointeur ${text}`,
};

const de: AlgoUi = {
  nav: {
    learn: "Lernen",
    practice: "Üben",
    cheatsheets: "Spickzettel",
    challenges: "Aufgaben",
    progress: "Fortschritt",
  },
  searchPlaceholder: "Lektionen & Konzepte suchen…",
  legend: { active: "wird geprüft", found: "gefunden", settled: "erledigt", problem: "Problem" },
  tones: {
    plain: "normal",
    active: "aktiv",
    found: "gefunden",
    done: "erledigt",
    warn: "auffällig",
    mark: "markiert",
    muted: "abgeblendet",
    ghost: "leer",
  },
  isNow: (name, tone) => `${name} ist jetzt ${tone}`,
  moved: (name) => `${name} wurde verschoben`,
  pointer: (text) => `Zeiger ${text}`,
};

export const ALGO_UI: Record<Locale, AlgoUi> = { en, vi, fr, de };
