/**
 * Pure maths for the experience fly-through (no Three.js, no DOM).
 *
 * Two parameters are in play:
 * - `p`: scroll progress through the runway, 0 (top) to 1 (bottom)
 * - `t`: distance along the 3D path, 0 (start) to 1 (end)
 * The camera sits at `t = progressToT(p)`; each role owns a gate at `waypointT` and a stretch of
 * scroll where the camera hovers just before it so its card can be read.
 */

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const k = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return k * k * (3 - 2 * k);
};

/** Where along the path (0-1) the gate of role `i` of `n` sits. */
export function waypointT(i: number, n: number): number {
  return n <= 1 ? 0.5 : 0.14 + (i / (n - 1)) * 0.72;
}

/** How far before its gate the camera hovers, as a fraction of the path (about 15 units). */
const HOVER_BEFORE_GATE = 0.045;

/** Scroll progress at which role `i` of `n` is the current one. Evenly spaced, inset from the ends. */
export function waypointP(i: number, n: number): number {
  return n <= 1 ? 0.5 : 0.18 + (i / (n - 1)) * 0.64;
}

/** Scroll distance between neighbouring roles. */
function spacing(n: number): number {
  return n <= 1 ? 0.64 : 0.64 / (n - 1);
}

/**
 * Maps scroll progress to a position on the path. Between roles the camera glides (slow-fast-slow);
 * around each role it nearly stops, hovering in front of that role's gate.
 */
export function progressToT(p: number, n: number): number {
  const hold = spacing(n) * 0.3; // half-width of the hover zone, in scroll progress
  const drift = 0.008; // the camera still creeps a little while hovering
  const keys: [number, number][] = [[0, 0]];
  for (let i = 0; i < n; i++) {
    const t = waypointT(i, n) - HOVER_BEFORE_GATE;
    keys.push([waypointP(i, n) - hold, t - drift], [waypointP(i, n) + hold, t + drift]);
  }
  keys.push([1, 1]);

  const clamped = Math.min(Math.max(p, 0), 1);
  for (let k = 0; k < keys.length - 1; k++) {
    const [p0, t0] = keys[k];
    const [p1, t1] = keys[k + 1];
    if (clamped <= p1) {
      const u = p1 === p0 ? 1 : (clamped - p0) / (p1 - p0);
      return t0 + (t1 - t0) * smoothstep(0, 1, u);
    }
  }
  return 1;
}

/** Opacity and vertical drift (px) of role `i`'s card at scroll progress `p`. */
export function cardState(p: number, i: number, n: number): { opacity: number; shift: number } {
  // -1 / +1 = halfway to the neighbouring role.
  const s = (p - waypointP(i, n)) / (spacing(n) * 0.5);
  return {
    opacity: 1 - smoothstep(0.55, 0.95, Math.abs(s)),
    // Cards drift upwards as you scroll past them.
    shift: -Math.max(-1.4, Math.min(1.4, s)) * 48,
  };
}

/** Index of the role nearest to scroll progress `p`. */
export function nearestRole(p: number, n: number): number {
  let best = 0;
  for (let i = 1; i < n; i++) {
    if (Math.abs(p - waypointP(i, n)) < Math.abs(p - waypointP(best, n))) best = i;
  }
  return best;
}
