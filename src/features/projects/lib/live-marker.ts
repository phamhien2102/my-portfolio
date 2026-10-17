/** Colours of the "Just launched" marker: a live green dot on a dark glass pill. */
export const LIVE = {
  dot: "#3ddc84",
  ring: "61, 220, 132",
  /** Tint over the blurred picture: light enough to read as frosted glass. */
  pill: "rgba(10, 10, 16, 0.4)",
  border: "rgba(255, 255, 255, 0.22)",
  text: "#f4f4f5",
} as const;

/** One pulse of the dot's ring, in seconds. */
export const PULSE_S = 1.6;

/** Where the ring is in its pulse, 0 → 1. */
export function pulsePhase(seconds: number) {
  return (seconds % PULSE_S) / PULSE_S;
}
