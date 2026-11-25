import type { LocaleBundle } from "@/components/course/i18n";

import type { DesignUi } from "../types";

/** English (the language the course is written in): the Design System course's own words. The lessons themselves are the source and need no entry. */
const ui: DesignUi = {
  nav: {
    learn: "Learn",
    practice: "Practice",
    designLab: "Design Lab",
    cheatsheets: "Cheatsheets",
  },
  searchPlaceholder: "Search lessons & concepts…",
  legend: { request: "request", response: "response", handshake: "handshake", failed: "failed" },
  goesDown: (name) => `${name} goes down`,
  isBack: (name) => `${name} is back`,
  traffic: (label) => `Traffic: ${label}`,
  focusOn: (name) => `Focus on ${name}`,
};

const en: LocaleBundle<DesignUi> = { ui, translations: { lessons: {} } };

export default en;
