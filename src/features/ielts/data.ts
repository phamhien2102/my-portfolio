import content from "./content.json";

export interface Chapter {
  id: string;
  /** Label in the contents list, e.g. "Overview" or "Band 5–6". */
  label: string;
  /** Sanitised markup: only tags the build script whitelists, no styles, scripts or iframes. */
  html: string;
}

export interface Part {
  id: string;
  /** Roman numeral, "I", "II"… */
  number: string;
  name: string;
  chapters: readonly Chapter[];
}

export interface Book {
  title: string;
  subtitle: string;
  parts: readonly Part[];
}

/**
 * The whole course. `content.json` and `public/ielts/files/` are generated from the course export
 * by `ielts-classic/build.py --next <this repo>`, so edit that script, not the JSON.
 */
export const BOOK: Book = content;
