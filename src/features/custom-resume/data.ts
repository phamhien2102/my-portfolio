import type {
  FontId,
  ResumeData,
  ResumeDoc,
  ResumeSettings,
  SectionKey,
  TemplateId,
  TitleKey,
} from "./types";

export const TEMPLATES: readonly {
  id: TemplateId;
  name: string;
  blurb: string;
  defaultAccent: string;
}[] = [
  {
    id: "classic",
    name: "Classic",
    blurb: "One column, minimal, plain text: reads cleanly in applicant tracking systems.",
    defaultAccent: "#1f3a5f",
  },
  {
    id: "modern",
    name: "Modern",
    blurb: "Two columns: a sidebar for contact and skills, the story on the right.",
    defaultAccent: "#0f766e",
  },
  {
    id: "executive",
    name: "Executive",
    blurb: "Elegant, with experience and achievements laid out as a timeline.",
    defaultAccent: "#7c2d12",
  },
  {
    id: "compact",
    name: "Compact",
    blurb: "Dense and tidy: name on the left, contact on the right. Good for long CVs.",
    defaultAccent: "#2563eb",
  },
  {
    id: "creative",
    name: "Creative",
    blurb: "A colour band with your photo on top, then a wide and a narrow column.",
    defaultAccent: "#6d28d9",
  },
  {
    id: "minimal",
    name: "Minimal",
    blurb: "Airy, editorial: section titles hang in the left margin, content to their right.",
    defaultAccent: "#111827",
  },
];

export const FONTS: readonly { id: FontId; name: string; blurb: string }[] = [
  { id: "sans", name: "Be Vietnam Pro", blurb: "Modern sans" },
  { id: "serif", name: "IBM Plex Serif", blurb: "Refined serif" },
  { id: "times", name: "Tinos", blurb: "Times New Roman look" },
  { id: "mono", name: "IBM Plex Mono", blurb: "Monospaced, technical" },
];

export const ACCENTS = [
  "#1f3a5f",
  "#0f766e",
  "#7c2d12",
  "#6d28d9",
  "#be123c",
  "#334155",
  "#15803d",
  "#b45309",
] as const;

export const SECTION_LABEL: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

export const TITLES_EN: Record<TitleKey, string> = {
  contact: "Contact",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

export const TITLES_VI: Record<TitleKey, string> = {
  contact: "Liên hệ",
  summary: "Giới thiệu",
  experience: "Kinh nghiệm làm việc",
  education: "Học vấn",
  skills: "Kỹ năng",
  projects: "Dự án",
  certifications: "Chứng chỉ",
  languages: "Ngôn ngữ",
};

export const DEFAULT_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "projects",
  "skills",
  "education",
  "certifications",
  "languages",
];

export const DEFAULT_SETTINGS: ResumeSettings = {
  template: "classic",
  accent: "#1f3a5f",
  font: "sans",
  contactIcons: false,
  pageNumbers: "center",
  watermark: { text: "", mode: "diagonal", opacity: 0.1, scale: 1 },
  avatarShape: "circle",
  avatarScale: 1,
  fontSize: 9.5,
  spacing: 1,
  order: DEFAULT_ORDER,
  hidden: [],
  titles: TITLES_EN,
};

export const EMPTY_DATA: ResumeData = {
  basics: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    avatar: "",
    extras: [],
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  custom: [],
};

/** A software engineer, so every template has realistic content to show. */
export const SAMPLE_DATA: ResumeData = {
  basics: {
    name: "Raymond Pham",
    title: "Senior Software Engineer",
    email: "raymond.pham@example.com",
    phone: "+84 90 123 4567",
    location: "Ho Chi Minh City, Vietnam",
    website: "raymondpham.dev",
    linkedin: "linkedin.com/in/raymond-pham",
    github: "github.com/raymond-pham",
    avatar: "",
    extras: [],
  },
  summary:
    "Software engineer with 8+ years building and scaling web platforms, from payments APIs to design systems. I like turning slow, tangled services into small, observable ones, and I mentor engineers on code review, testing and system design. Most recently led a team of six that cut checkout latency by 45%.",
  experience: [
    {
      id: "exp-1",
      role: "Senior Software Engineer",
      company: "Lumen Commerce",
      location: "Ho Chi Minh City",
      start: "Mar 2022",
      end: "Present",
      bullets: [
        "Led a six-person team that rebuilt the checkout service in Go and TypeScript, cutting p95 latency from 820 ms to 450 ms and lifting conversion by 3.2%.",
        "Designed an event-driven order pipeline on Kafka processing 4M events a day with exactly-once semantics and a replayable audit trail.",
        "Introduced contract testing and a canary release process, reducing production incidents by 38% over two quarters.",
        "Mentored five engineers, two of whom were promoted to mid-level within a year.",
      ].join("\n"),
    },
    {
      id: "exp-2",
      role: "Software Engineer",
      company: "Northwind Labs",
      location: "Hanoi",
      start: "Jun 2018",
      end: "Feb 2022",
      bullets: [
        "Built a React and Node.js analytics dashboard used by 1,200 merchants, with sub-second queries over 300M rows in PostgreSQL.",
        "Migrated a monolithic Rails app to services on AWS ECS with Terraform, saving $14k per month in infrastructure costs.",
        "Wrote the internal component library adopted by four product teams, shortening new-screen delivery from two weeks to three days.",
      ].join("\n"),
    },
    {
      id: "exp-3",
      role: "Junior Developer",
      company: "Pixel Foundry",
      location: "Da Nang",
      start: "Aug 2016",
      end: "May 2018",
      bullets: [
        "Shipped features for a ride-sharing web app serving 60k monthly users.",
        "Automated release notes and regression tests, saving the team about six hours a week.",
      ].join("\n"),
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "Ho Chi Minh City University of Technology",
      degree: "B.Eng. in Computer Science",
      location: "Ho Chi Minh City",
      start: "2012",
      end: "2016",
      details: "GPA 3.7/4.0. Graduation thesis on distributed caching, graded excellent.",
    },
  ],
  skills: [
    { id: "sk-1", name: "Languages", items: "TypeScript, Go, Python, SQL, Kotlin" },
    { id: "sk-2", name: "Frontend", items: "React, Next.js, Tailwind CSS, Three.js, Playwright" },
    { id: "sk-3", name: "Backend", items: "Node.js, gRPC, PostgreSQL, Redis, Kafka" },
    {
      id: "sk-4",
      name: "Cloud and tools",
      items: "AWS, Docker, Kubernetes, Terraform, GitHub Actions, OpenTelemetry",
    },
  ],
  projects: [
    {
      id: "pr-1",
      name: "Tracewell",
      link: "github.com/raymond-pham/tracewell",
      tech: "Go, OpenTelemetry, ClickHouse",
      bullets: [
        "Open-source tracing viewer with 1.8k GitHub stars; ingests 50k spans per second on a single node.",
        "Adopted by three companies as a lightweight alternative to hosted APM.",
      ].join("\n"),
    },
    {
      id: "pr-2",
      name: "Flowboard",
      link: "flowboard.example.com",
      tech: "Next.js, WebSockets, Postgres",
      bullets: "Real-time kanban for small teams with offline edits and conflict-free merges.",
    },
  ],
  certifications: [
    {
      id: "ce-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023",
    },
    {
      id: "ce-2",
      name: "Certified Kubernetes Application Developer",
      issuer: "CNCF",
      date: "2022",
    },
  ],
  languages: [
    { id: "la-1", name: "Vietnamese", level: "Native" },
    { id: "la-2", name: "English", level: "Fluent (IELTS 8.0)" },
    { id: "la-3", name: "Japanese", level: "Basic" },
  ],
  custom: [],
};

export function sampleDoc(): ResumeDoc {
  return { data: structuredClone(SAMPLE_DATA), settings: structuredClone(DEFAULT_SETTINGS) };
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
