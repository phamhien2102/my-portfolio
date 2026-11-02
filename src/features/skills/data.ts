export interface Skill {
  name: string;
  /** Self-assessed proficiency, 0-100. */
  level: number;
}

export interface SkillGroup {
  title: string;
  items: readonly Skill[];
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    title: "Mobile",
    items: [
      { name: "React Native", level: 90 },
      { name: "Flutter", level: 82 },
      { name: "MQTT", level: 80 },
      { name: "Swift", level: 55 },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "React", level: 90 },
      { name: "TypeScript", level: 88 },
      { name: "Next.js", level: 80 },
      { name: "Redux", level: 82 },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Firebase", level: 78 },
      { name: "Python", level: 72 },
      { name: "PostgreSQL", level: 70 },
      { name: "MySQL", level: 68 },
    ],
  },
  {
    title: "Tooling",
    items: [
      { name: "Git", level: 90 },
      { name: "Docker", level: 70 },
      { name: "CI/CD", level: 70 },
      { name: "GCP / AWS", level: 62 },
    ],
  },
];

/** Human-readable label for a 0-100 proficiency level. */
export function levelLabel(level: number): string {
  if (level >= 85) return "Expert";
  if (level >= 70) return "Advanced";
  if (level >= 50) return "Intermediate";
  return "Learning";
}
