import { THEME } from "@/config/theme";

/**
 * What the blob does once the pointer comes to rest:
 * - `splatter`: bursts into droplets that fly apart, shrink and vanish
 * - `dissolve`: melts away slowly in place
 * - `none`: stays put
 */
export type IdleEffect = "splatter" | "dissolve" | "none";

/** Tunable settings for the RAYMOND reveal effect. */
export const REVEAL_CONFIG = {
  word: "RAYMOND",
  /** Ink colours: timed mode steps through these; touch mode picks one per stroke. */
  palette: THEME.palette,
  /** Seconds between ink changes when the setting is "By time". */
  inkInterval: 5,
  /** Seconds the pointer must rest before the next movement counts as a new stroke. */
  strokeGap: 0.5,
  /** Effect played when the pointer stops (reduced-motion users always get `dissolve`). */
  idleEffect: "splatter" as IdleEffect,
  /** Seconds the pointer must rest before the blob leaves. */
  idleDelay: 0.7,
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
  /** Colour of letters the blob never reached once the word has shrunk into the header. */
  dockedIdleColor: "#8b8b97",
  /** Background colour. */
  bgColor: THEME.background,
  /** Auto-sweep once on load; stops when the user moves the pointer. */
  intro: true,
} as const;

export type RevealConfig = typeof REVEAL_CONFIG;
