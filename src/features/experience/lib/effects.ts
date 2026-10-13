export type PathEffect = "flythrough" | "helix" | "tunnel" | "runner";

type Vec3 = readonly [number, number, number];

/** Everything that makes one 3D effect look different from another. */
export interface PathStyle {
  /** Control points of the route the camera follows (roughly 330-360 units long). */
  points: readonly Vec3[];
  /** Exponential fog density: higher fades the distance sooner. */
  fog: number;
  /** "ride": the camera is the traveller. "chase": it follows a character running the route. */
  camera: "ride" | "chase";
  /** Draw the glowing tube along the route. Off when the effect draws its own road. */
  tubes: boolean;
  /** Lift the gates off the ground by this much (for effects with a floor). */
  gateLift: number;
  /** Largest roll of the camera when the route bends, in radians. */
  bank: number;
  /** If set, drifting specks are kept above this height. */
  floor?: number;
  /** How far above the route the camera rides. 0 puts it right on the line. */
  lift: number;
  /** How far the pointer can pull the camera sideways, in world units. */
  parallax: number;
  /** Drifting specks: how many, how close they may sit to the route, and how far they spread. */
  dust: { count: number; min: number; spread: number };
  /** Number of floating wireframe shapes. */
  shapes: number;
  /** Size of the role gates relative to the default. */
  gate: number;
  /** Hint shown at the start of the scroll. */
  hint: string;
}

/** What most effects share: a camera riding the route, with the glowing tube drawn. */
const RIDE = { camera: "ride", tubes: true, gateLift: 0, bank: 0.25 } as const;

/** A path that drifts forward (-z), swaying and climbing. */
const flythrough: PathStyle = {
  ...RIDE,
  points: Array.from(
    { length: 12 },
    (_, i) => [Math.sin(i * 0.85) * 16, Math.sin(i * 0.55 + 1.2) * 6 + i * 0.8, -i * 26] as const,
  ),
  fog: 0.022,
  lift: 1.1,
  parallax: 1.2,
  dust: { count: 2200, min: 3, spread: 38 },
  shapes: 50,
  gate: 1,
  hint: "Scroll to fly",
};

/** Steps along the helix, and the angle each one advances. 40 * 0.6 rad is a bit under 4 turns. */
const HELIX_STEPS = 40;
const HELIX_STEP_ANGLE = 0.6;
export const HELIX_RADIUS = 15;
export const HELIX_RISE = 1.4;

/** A spiral staircase going up. The decoration adds the second strand and the rungs. */
const helix: PathStyle = {
  ...RIDE,
  points: Array.from({ length: HELIX_STEPS }, (_, i) => {
    const angle = i * HELIX_STEP_ANGLE;
    return [
      Math.cos(angle) * HELIX_RADIUS,
      i * HELIX_RISE,
      Math.sin(angle) * HELIX_RADIUS,
    ] as const;
  }),
  fog: 0.018,
  lift: 1.4,
  parallax: 0.8,
  dust: { count: 1800, min: 2, spread: 30 },
  shapes: 0,
  gate: 1,
  hint: "Scroll to climb",
};

/** Nearly straight, with a slow sway, so the rings read as one long tunnel. */
const tunnel: PathStyle = {
  ...RIDE,
  points: Array.from(
    { length: 12 },
    (_, i) => [Math.sin(i * 0.7) * 3.5, Math.cos(i * 0.5) * 2.5, -i * 30] as const,
  ),
  fog: 0.03,
  lift: 0,
  parallax: 2.2,
  dust: { count: 500, min: 2.5, spread: 12 },
  shapes: 0,
  gate: 1.6,
  hint: "Scroll to warp",
};

const RUNNER_GATE = 1.15;

/** A road across a flat neon city, with a small astronaut running down it. */
const runner: PathStyle = {
  camera: "chase",
  tubes: false,
  gateLift: 3.5 * RUNNER_GATE,
  bank: 0,
  floor: 0.1,
  points: Array.from({ length: 12 }, (_, i) => [Math.sin(i * 0.9) * 14, 0, -i * 28] as const),
  fog: 0.017,
  lift: 0,
  parallax: 1.6,
  dust: { count: 900, min: 2, spread: 26 },
  shapes: 0,
  gate: RUNNER_GATE,
  hint: "Scroll to run",
};

export const PATH_STYLES: Record<PathEffect, PathStyle> = { flythrough, helix, tunnel, runner };

export function isPathEffect(effect: string): effect is PathEffect {
  return effect in PATH_STYLES;
}
