import fontkit from "@pdf-lib/fontkit";
import type { Font } from "@pdf-lib/fontkit";

import type { FontId } from "../types";

/**
 * The TTF files behind each font choice. The same bytes are used three ways: fontkit measures text
 * for the layout, `@font-face` draws the preview, and pdf-lib embeds them in the exported PDF. One
 * source of widths is what keeps the preview and the PDF line-for-line identical.
 */

export type FontStyle = "r" | "b" | "i";

export interface Face {
  font: Font;
  bytes: Uint8Array;
  /** Ascent and descent as fractions of the em. */
  asc: number;
  desc: number;
}

export interface Family {
  id: FontId;
  /** CSS `font-family` used by the preview (see custom-resume.css). */
  css: string;
  faces: Record<FontStyle, Face>;
}

const FILES: Record<FontId, { css: string; files: Record<FontStyle, string> }> = {
  sans: {
    css: "CV Be Vietnam Pro",
    files: {
      r: "BeVietnamPro-Regular",
      b: "BeVietnamPro-Bold",
      i: "BeVietnamPro-Italic",
    },
  },
  serif: {
    css: "CV IBM Plex Serif",
    files: {
      r: "IBMPlexSerif-Regular",
      b: "IBMPlexSerif-Bold",
      i: "IBMPlexSerif-Italic",
    },
  },
  times: {
    css: "CV Tinos",
    files: { r: "Tinos-Regular", b: "Tinos-Bold", i: "Tinos-Italic" },
  },
  mono: {
    css: "CV IBM Plex Mono",
    files: {
      r: "IBMPlexMono-Regular",
      b: "IBMPlexMono-Bold",
      i: "IBMPlexMono-Italic",
    },
  },
};

const loaded = new Map<FontId, Family>();
const pending = new Map<FontId, Promise<Family>>();
const failed = new Set<FontId>();
const listeners = new Set<() => void>();

async function fetchFace(file: string): Promise<Face> {
  const res = await fetch(`/fonts/resume/${file}.ttf`);
  if (!res.ok) throw new Error(`Could not load font ${file}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const font = fontkit.create(bytes as unknown as Buffer) as Font;
  return {
    font,
    bytes,
    asc: font.ascent / font.unitsPerEm,
    desc: -font.descent / font.unitsPerEm,
  };
}

/** Start loading a family (once). Resolves with it, or rejects if a file is missing. */
export function loadFamily(id: FontId): Promise<Family> {
  const done = loaded.get(id);
  if (done) return Promise.resolve(done);
  let p = pending.get(id);
  if (!p) {
    const spec = FILES[id];
    p = Promise.all([
      fetchFace(spec.files.r),
      fetchFace(spec.files.b),
      fetchFace(spec.files.i),
    ]).then(([r, b, i]) => {
      const family: Family = { id, css: spec.css, faces: { r, b, i } };
      loaded.set(id, family);
      pending.delete(id);
      listeners.forEach((l) => l());
      return family;
    });
    p.catch(() => {
      pending.delete(id);
      failed.add(id);
      listeners.forEach((l) => l());
    });
    pending.set(id, p);
  }
  return p;
}

export function getFamily(id: FontId): Family | null {
  return loaded.get(id) ?? null;
}

export type FontStatus = "ready" | "loading" | "failed";

export function fontStatus(id: FontId): FontStatus {
  if (loaded.has(id)) return "ready";
  return failed.has(id) ? "failed" : "loading";
}

export function subscribeFonts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface Measurer {
  family: Family;
  /** Advance width in pt, without kerning (the PDF has none either). */
  width(s: string, f: FontStyle, size: number, track?: number): number;
}

export function makeMeasurer(family: Family): Measurer {
  const cache = new Map<string, number>();
  return {
    family,
    width(s, f, size, track = 0) {
      if (!s) return 0;
      const key = f + s;
      let em = cache.get(key);
      if (em === undefined) {
        const face = family.faces[f];
        let units = 0;
        for (const g of face.font.layout(s).glyphs) units += g.advanceWidth;
        em = units / face.font.unitsPerEm;
        cache.set(key, em);
      }
      return em * size + track * [...s].length;
    },
  };
}

const measurers = new WeakMap<Family, Measurer>();

/** One measurer per family, so its width cache survives between edits. */
export function measurerFor(family: Family): Measurer {
  let m = measurers.get(family);
  if (!m) {
    m = makeMeasurer(family);
    measurers.set(family, m);
  }
  return m;
}
