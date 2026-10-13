import { SKILL_GROUPS, type Skill } from "../data";

/** One skill as a planet. Pure data; the scene turns it into a mesh. */
export interface Planet extends Skill {
  /** Position in `PLANETS`, which is also the index of its label. */
  index: number;
  group: string;
  groupIndex: number;
  /** Distance from the sun, in world units. */
  orbit: number;
  /** Planet radius, in world units: stronger skills are bigger. */
  radius: number;
  /** Where on its orbit it starts, in radians. */
  phase: number;
  /** Angular speed, in radians per second. */
  speed: number;
  /** Strong skills get a ring. */
  ringed: boolean;
}

const MIN_LEVEL = 50;
const MAX_LEVEL = 95;
const MIN_RADIUS = 0.16;
const MAX_RADIUS = 0.36;
/** Strong enough to wear a ring (matches "Expert" in `levelLabel`). */
const RINGED_FROM = 85;

/** Radius of the innermost orbit, and the gap between orbits. */
const FIRST_ORBIT = 2.7;
const ORBIT_GAP = 1.4;

export const SUN_RADIUS = 0.85;

/** Distance from the sun of group `i`'s orbit. */
export function orbitRadius(groupIndex: number): number {
  return FIRST_ORBIT + groupIndex * ORBIT_GAP;
}

export function planetRadius(level: number): number {
  const t = (Math.min(Math.max(level, MIN_LEVEL), MAX_LEVEL) - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL);
  return MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS);
}

function layout(): Planet[] {
  const planets: Planet[] = [];

  SKILL_GROUPS.forEach((group, groupIndex) => {
    const orbit = orbitRadius(groupIndex);
    // Inner planets are quicker (as in the real thing); every orbit turns the same way.
    const speed = 0.2 * Math.pow(FIRST_ORBIT / orbit, 1.1);
    // Each group starts at its own angle so the planets of different orbits don't line up.
    const offset = groupIndex * 1.7;

    group.items.forEach((skill, i) => {
      planets.push({
        ...skill,
        index: planets.length,
        group: group.title,
        groupIndex,
        orbit,
        radius: planetRadius(skill.level),
        phase: offset + (i / group.items.length) * Math.PI * 2,
        speed,
        ringed: skill.level >= RINGED_FROM,
      });
    });
  });

  return planets;
}

/** Every skill as a planet, grouped in the same order as `SKILL_GROUPS`. */
export const PLANETS: readonly Planet[] = layout();
