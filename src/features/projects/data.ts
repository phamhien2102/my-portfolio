export interface Project {
  title: string;
  summary: string;
  tags: readonly string[];
  year: string;
  href: string;
}

// PLACEHOLDER content: replace with your real projects and links.
export const PROJECTS: readonly Project[] = [
  {
    title: "Project Alpha",
    summary: "Cross-platform fitness app with offline-first sync and real-time coaching.",
    tags: ["React Native", "TypeScript", "Firebase"],
    year: "2026",
    href: "#",
  },
  {
    title: "Project Beta",
    summary: "Marketplace platform with a Next.js storefront and a Node.js order pipeline.",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    year: "2025",
    href: "#",
  },
  {
    title: "Project Gamma",
    summary: "Native iOS and Android companion app for a smart-home device line.",
    tags: ["Swift", "Kotlin", "Bluetooth"],
    year: "2025",
    href: "#",
  },
  {
    title: "Project Delta",
    summary: "Internal analytics dashboard with a GraphQL API and live charts.",
    tags: ["React", "GraphQL", "AWS"],
    year: "2024",
    href: "#",
  },
];
