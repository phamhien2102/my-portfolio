export interface Role {
  period: string;
  title: string;
  company: string;
  highlights: readonly string[];
}

// PLACEHOLDER content: replace with your real experience.
export const EXPERIENCE: readonly Role[] = [
  {
    period: "2024 — Present",
    title: "Senior Mobile Developer",
    company: "Company Name",
    highlights: [
      "Led the rebuild of a flagship React Native app used by 500k+ people.",
      "Cut cold-start time by 40% and introduced an automated release pipeline.",
    ],
  },
  {
    period: "2022 — 2024",
    title: "Fullstack Developer",
    company: "Another Company",
    highlights: [
      "Shipped Next.js and Node.js features across web and mobile clients.",
      "Designed a GraphQL API that unified three legacy services.",
    ],
  },
  {
    period: "2020 — 2022",
    title: "Junior Developer",
    company: "First Company",
    highlights: [
      "Built and maintained customer-facing features in React.",
      "Grew test coverage from 20% to 70% on the core codebase.",
    ],
  },
];
