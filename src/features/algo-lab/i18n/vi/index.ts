import type { Translations } from "@/components/course/i18n";

import { bigO } from "./big-o";
import { lessons as curriculum, modules } from "./curriculum";

/**
 * Lessons translated in full (their steps, not just the title and summary). A lesson that is not
 * listed here is shown in English under its translated title, with a note saying so.
 */
const full: Record<string, Translations["lessons"][string]> = {
  "big-o": bigO,
};

const translations: Translations = {
  modules,
  lessons: Object.fromEntries(
    Object.entries(curriculum).map(([id, head]) => [id, { ...head, ...full[id] }]),
  ),
};

export default translations;
