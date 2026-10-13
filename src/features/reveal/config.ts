/** Tunable settings for the RAYMOND reveal effect. */
export const REVEAL_CONFIG = {
  word: "RAYMOND",
  /** 7 ink colours: each new stroke advances to the next one, wrapping around. */
  palette: ["#e10600", "#ff7a00", "#ffc400", "#00b96b", "#1f5bff", "#7a2cff", "#ff2d95"],
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
  /** Text colour before the blob sweeps over it. */
  idleColor: "#ffffff",
  /** Background colour. */
  bgColor: "#f1f1ed",
  /** Auto-sweep once on load; stops when the user moves the pointer. */
  intro: true,
} as const;

export type RevealConfig = typeof REVEAL_CONFIG;
