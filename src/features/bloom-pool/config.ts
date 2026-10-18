export type FlowerSpecies = "hibiscus" | "brightHibiscus" | "lily" | "plumeria";
export type InteractionMode = "touch" | "lift" | "swirl";

/** Tunable settings for the Bloom Pool scene. */
export const BLOOM_CONFIG = {
  fov: 38,
  /** Downward pitch from horizontal, in degrees. */
  pitchLandscape: 53,
  pitchPortrait: 58,
  waterY: 0,
  pool: {
    landscape: { width: 7.35, depth: 4.45 },
    portrait: { width: 4.55, depth: 6.35 },
    waterDepth: 1.28,
    corner: 0.4,
    deck: 1.12,
    coping: 0.085,
    band: 0.26,
  },
  flowers: {
    initial: 5,
    max: 32,
  },
  physics: {
    gravity: -11.5,
    buoyancy: 22,
    airDrag: 0.55,
    waterDrag: 3.6,
    bob: 0.018,
    rock: 0.11,
  },
  audio: {
    startMuted: true,
  },
} as const;

export const SPECIES: readonly FlowerSpecies[] = ["hibiscus", "brightHibiscus", "lily", "plumeria"];

export const SPECIES_LABEL: Record<FlowerSpecies, string> = {
  hibiscus: "Hibiscus",
  brightHibiscus: "Bright hibiscus",
  lily: "Lily",
  plumeria: "Plumeria",
};

export const INITIAL_SPECIES: readonly FlowerSpecies[] = [
  "hibiscus",
  "lily",
  "plumeria",
  "brightHibiscus",
  "lily",
];
