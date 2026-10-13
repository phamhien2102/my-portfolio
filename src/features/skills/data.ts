export interface Skill {
  name: string;
  /** Self-assessed proficiency, 0-100. */
  level: number;
}

export interface SkillGroup {
  title: string;
  items: readonly Skill[];
}

// PLACEHOLDER content: replace with your real stack and an honest self-assessment.
export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    title: "Mobile",
    items: [
      { name: "React Native", level: 90 },
      { name: "Expo", level: 85 },
      { name: "Swift", level: 65 },
      { name: "Kotlin", level: 60 },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "React", level: 92 },
      { name: "Next.js", level: 88 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 85 },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Node.js", level: 85 },
      { name: "NestJS", level: 75 },
      { name: "PostgreSQL", level: 75 },
      { name: "GraphQL", level: 70 },
    ],
  },
  {
    title: "Tooling",
    items: [
      { name: "Git", level: 90 },
      { name: "Docker", level: 70 },
      { name: "CI/CD", level: 72 },
      { name: "Figma", level: 55 },
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
