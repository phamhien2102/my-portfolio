import { SKILL_GROUPS, type Skill } from "../data";

/** Everything is expressed in a 0-100 square, so it scales with the container. */
export interface Star extends Skill {
  group: string;
  groupIndex: number;
  /** Position, in percent of the stage. */
  x: number;
  y: number;
  /** Which side of the star its label sits on. */
  side: "left" | "right";
  /** Dot diameter in px: stronger skills are bigger. */
  size: number;
}

export interface Ring {
  label: string;
  /** Radius, in percent of the stage. */
  r: number;
}

const MIN_LEVEL = 50;
const MAX_LEVEL = 95;
const OUTER = 42; // radius at MIN_LEVEL
const INNER = 13; // radius at MAX_LEVEL
/** Ideal angle between neighbouring stars of one group, in degrees. */
const STEP = 20;
/** How far a star may drift from its group's centre angle to dodge a neighbour, in degrees. */
const SECTOR = 40;
/** Group centres sit on the diagonals, which keeps labels away from the vertical axis. */
const FIRST_GROUP_ANGLE = -45;
/** Clearance between labels on the same side, in percent of the stage. */
const MIN_DY = 4.5;
const LABEL_W = 17;

/** Stronger skills orbit closer to the centre. */
export function radiusFor(level: number): number {
  const t = (Math.min(Math.max(level, MIN_LEVEL), MAX_LEVEL) - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL);
  return OUTER - t * (OUTER - INNER);
}

export const RINGS: readonly Ring[] = [
  { label: "Expert", r: radiusFor(90) },
  { label: "Advanced", r: radiusFor(75) },
  { label: "Growing", r: radiusFor(60) },
];

function toPoint(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

interface Point {
  x: number;
  y: number;
}

/** Two labels collide when they share a side and sit too close in both axes. */
function collides(p: Point, others: readonly Point[]): boolean {
  // Ring captions sit on the vertical axis; stars keep clear of them.
  const hitsCaption = RINGS.some(
    (ring) => Math.abs(p.x - 50) < 8 && Math.abs(p.y - (50 - ring.r)) < 3,
  );
  if (hitsCaption) return true;

  return others.some(
    (q) => p.x >= 50 === q.x >= 50 && Math.abs(p.y - q.y) < MIN_DY && Math.abs(p.x - q.x) < LABEL_W,
  );
}

/**
 * Places every skill. Each starts at its ideal angle; if its label would hit an
 * already-placed one it slides along its orbit (staying inside its group's sector)
 * to the nearest free spot. Deterministic, so server and client render the same.
 */
function layout(): Star[] {
  const placed: Star[] = [];

  SKILL_GROUPS.forEach((group, groupIndex) => {
    const centre = FIRST_GROUP_ANGLE + groupIndex * (360 / SKILL_GROUPS.length);

    group.items.forEach((skill, i) => {
      const ideal = centre + (i - (group.items.length - 1) / 2) * STEP;
      const r = radiusFor(skill.level);

      let point = toPoint(ideal, r);
      search: for (let d = 0; d <= SECTOR * 2; d += 1) {
        for (const sign of [1, -1]) {
          const angle = ideal + sign * d;
          if (Math.abs(angle - centre) > SECTOR) continue;
          const candidate = toPoint(angle, r);
          if (!collides(candidate, placed)) {
            point = candidate;
            break search;
          }
        }
      }

      placed.push({
        ...skill,
        group: group.title,
        groupIndex,
        x: point.x,
        y: point.y,
        side: point.x >= 50 ? "right" : "left",
        size: 6 + ((skill.level - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL)) * 10,
      });
    });
  });

  return placed;
}

/** Every skill placed on the stage, grouped in the same order as `SKILL_GROUPS`. */
export const STARS: readonly Star[] = layout();

/** The stars of one group, as an SVG `points` string tracing the constellation. */
export function constellationPoints(groupIndex: number): string {
  return STARS.filter((s) => s.groupIndex === groupIndex)
    .map((s) => `${s.x.toFixed(2)},${s.y.toFixed(2)}`)
    .join(" ");
}
