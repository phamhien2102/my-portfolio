export interface Project {
  title: string;
  summary: string;
  tags: readonly string[];
  year: string;
  href: string;
  /**
   * Optional preview image, e.g. "/projects/alpha.png" (file in `public/projects/`, ~16:10).
   * Without it the card shows a generated gradient backdrop.
   */
  image?: string;
  /** Launch date (YYYY-MM-DD). The card shows a NEW badge for 30 days after it. */
  addedAt?: string;
}

// PLACEHOLDER content: replace with your real projects and links.
export const PROJECTS: readonly Project[] = [
  {
    title: "Date Airways",
    summary:
      "A date invite told as an airport check-in: a split-flap board that cancels every flight but one, a CAPTCHA full of Raymonds, and a hold-to-take-off cockpit.",
    tags: ["Next.js", "TypeScript", "Web Audio", "SVG"],
    year: "Oct 17, 2026",
    href: "/dating",
    image: "/projects/date-airways.png",
    addedAt: "2026-10-17",
  },
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
