import type { HeroFont } from "@/features/settings";

import type { WordFont } from "./draw-text";

interface HeroFontSpec {
  /** CSS variable (set on <html> by next/font) holding the family list. None = a system font. */
  cssVar?: string;
  /** Used when there is no variable, or while the font file is still loading. */
  fallback: string;
  weight: number;
}

/** The typefaces the word can be drawn in. Only the ones with a `cssVar` are downloaded. */
const SPECS: Record<HeroFont, HeroFontSpec> = {
  classic: { fallback: '"Arial Black", "Helvetica Neue", Arial, sans-serif', weight: 900 },
  neon: { cssVar: "--font-hero-neon", fallback: "Impact, sans-serif", weight: 400 },
  drip: { cssVar: "--font-hero-drip", fallback: "Impact, sans-serif", weight: 400 },
  // The droplets are sampled from a heavy, simple face, so the letters come out solid.
  droplets: { fallback: '"Arial Black", "Helvetica Neue", Arial, sans-serif', weight: 900 },
  block: { cssVar: "--font-hero-block", fallback: "Impact, sans-serif", weight: 400 },
};

/** The font to draw with for `id`, as canvas needs it. */
export function resolveFont(id: HeroFont): WordFont {
  const spec = SPECS[id];
  const family = spec.cssVar
    ? getComputedStyle(document.documentElement).getPropertyValue(spec.cssVar).trim()
    : "";
  return { family: family ? `${family}, ${spec.fallback}` : spec.fallback, weight: spec.weight };
}

/** Resolves once the font's file is ready to draw with (a system font is ready at once). */
export async function loadFont(font: WordFont): Promise<void> {
  try {
    await document.fonts.load(`${font.weight} 100px ${font.family}`, "RAYMOND");
  } catch {
    // Offline or blocked: the fallback face is drawn instead.
  }
}
