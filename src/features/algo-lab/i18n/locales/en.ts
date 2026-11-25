import type { LocaleBundle } from "@/components/course/i18n";

import type { AlgoUi } from "../types";

/** English (the language the course is written in): Algo Lab's own words. The lessons themselves are the source and need no entry. */
const ui: AlgoUi = {
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

const en: LocaleBundle<AlgoUi> = { ui, translations: { lessons: {} } };

export default en;
