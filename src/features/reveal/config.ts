import { THEME } from "@/config/theme";

/** Tunable settings for the RAYMOND reveal effect. */
export const REVEAL_CONFIG = {
  word: "RAYMOND",
  /** Ink colours: each new stroke advances to the next one, wrapping around. */
  palette: THEME.palette,
  /** Seconds the pointer must rest before the next movement counts as a new stroke. */
  strokeGap: 0.5,
  /** Vertical text position: 0 = bottom, 1 = top. */
  textY: 0.5,
  /** Fraction of the viewport width the word occupies. */
  textWidth: 0.92,
  /** 0 = revealed text stays forever; ~0.004 = text fades after the blob passes. */
  revealFade: 0.0,
  /** Resolution of the trail buffer relative to the viewport. */
  revealScale: 0.5,
  /** Number of circles in the blob's tail. */
  trailLength: 24,
  /** Blob size multiplier (bigger covers the full letter height). */
  blobScale: 1.5,
  /** Text colour before the blob sweeps over it (a faint ghost on the dark background). */
  idleColor: THEME.ghost,
  /** Background colour. */
  bgColor: THEME.background,
  /** Auto-sweep once on load; stops when the user moves the pointer. */
  intro: true,
} as const;

export type RevealConfig = typeof REVEAL_CONFIG;
