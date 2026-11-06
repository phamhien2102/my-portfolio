/**
 * Every page that is not in `SITE.nav`, and how a visitor gets in. This is a hand-kept list, so
 * adding an unlisted page means adding it here too (CLAUDE.md says so next to the route table).
 *
 * Deliberately left out: the `/dating?jump=` and `?skip=` shortcuts. They bypass the passenger
 * name and booking code, and this page is a public URL.
 */

export type Group = "Personal" | "Learning" | "Play";

export interface HiddenPage {
  path: string;
  title: string;
  blurb: string;
  group: Group;
  /** How someone reaches it without being told the URL. */
  access: string;
  /** `robots: noindex` in the page metadata, so search engines are asked to skip it. */
  noindex: boolean;
  /** Extra ways in, such as a demo link that is already public elsewhere on the site. */
  alsoOpen?: readonly { label: string; href: string }[];
}

export const HIDDEN_PAGES: readonly HiddenPage[] = [
  {
    path: "/resume",
    title: "Resume",
    blurb: "The full CV as a printable sheet, in a classic and a creative layout.",
    group: "Personal",
    access: "Resume button in the navigation",
    noindex: true,
  },
  {
    path: "/dating",
    title: "Date Airways",
    blurb:
      "A date invite staged as an airport check-in: passenger, booking code, seat, boarding pass.",
    group: "Play",
    access: "Needs the passenger name and booking code, or the guest demo link",
    noindex: true,
    // The same demo link is already on the Projects section of the home page.
    alsoOpen: [{ label: "Guest demo", href: "/dating?passenger=guest&code=DEMO2026" }],
  },
  {
    path: "/bloom-pool",
    title: "Bloom Pool",
    blurb: "A light, calm page built around the Bloom Pool scene.",
    group: "Play",
    access: "Direct URL only",
    noindex: false,
  },
  {
    path: "/algorithms",
    title: "Algorithm patterns",
    blurb:
      "LeetCode patterns, each walked through step by step. Every card opens /algorithms/<pattern>.",
    group: "Learning",
    access: "Direct URL only",
    noindex: false,
  },
  {
    path: "/native",
    title: "Going native",
    blurb: "A SwiftUI and Kotlin roadmap that grows one Weather app, with progress ticks.",
    group: "Learning",
    access: "Direct URL only",
    noindex: true,
    alsoOpen: [{ label: "Weather design", href: "/native/weather-design" }],
  },
  {
    path: "/ai-workflow",
    title: "One workflow, built in layers",
    blurb: "A Claude Code roadmap: context, skills, hooks, subagents, MCP and CI.",
    group: "Learning",
    access: "Direct URL only",
    noindex: true,
    alsoOpen: [
      { label: "No-code with n8n", href: "/ai-workflow/no-code" },
      { label: "From a mobile feature", href: "/ai-workflow/mobile-feature" },
    ],
  },
];

export const GROUPS: readonly Group[] = ["Personal", "Learning", "Play"];
