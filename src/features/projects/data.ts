export interface Project {
  title: string;
  summary: string;
  tags: readonly string[];
  year: string;
  href: string;
  /** Extra places to see the project (store pages, ...), listed on the creative resume. */
  links?: readonly { label: string; href: string }[];
  /**
   * Optional preview image, e.g. "/projects/alpha.png" (file in `public/projects/`, ~16:10).
   * Without it the card shows a generated gradient backdrop.
   */
  image?: string;
  /** Launch date (YYYY-MM-DD). The card shows a NEW badge for 30 days after it. */
  addedAt?: string;
}

export const PROJECTS: readonly Project[] = [
  {
    title: "Date Airways",
    summary:
      "A date invite told as an airport check-in: a split-flap board that cancels every flight but one, a CAPTCHA full of Raymonds, and a hold-to-take-off cockpit. Try it: name guest, code DEMO2026.",
    tags: ["Next.js", "TypeScript", "Web Audio", "SVG"],
    year: "Oct 17, 2026",
    // Demo link for portfolio visitors: the check-in hints reveal this name and code.
    href: "/dating?passenger=guest&code=DEMO2026",
    image: "/projects/date-airways.png",
    addedAt: "2026-10-17",
  },
  {
    title: "My Epic (Vail Resorts)",
    summary:
      "Commerce and passes in the My Epic mobile app: pass and lift-ticket browsing, product pages, cart and checkout, driven by CMS content and feature flags.",
    tags: ["React Native", "TypeScript", "iOS", "Android"],
    year: "2025 — Present",
    href: "https://www.vailresorts.com/",
    links: [
      { label: "Website", href: "https://www.vailresorts.com/" },
      {
        label: "App Store",
        href: "https://apps.apple.com/vn/app/my-epic-skiing-snowboarding/id395375487",
      },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.vailresorts.epicmix&hl=en",
      },
    ],
  },
  {
    title: "The Ring (boxing news app)",
    summary:
      "A boxing app with news and articles, fight schedules, rankings and fighter profiles, plus push notifications, consent management and iPad support.",
    tags: ["React Native", "TypeScript", "Contentful", "iOS", "Android"],
    year: "2025",
    href: "https://www.ringmagazine.com/",
    links: [
      { label: "Website", href: "https://www.ringmagazine.com/" },
      { label: "App Store", href: "https://apps.apple.com/us/app/ring-magazine/id1261206136" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.zeen101.ringtv.app.android",
      },
    ],
  },
  {
    title: "AI Chat (ChatGPT-style)",
    summary:
      "A Flutter mobile app and a Next.js website where people chat with AI agents or switch between them.",
    tags: ["Flutter", "Next.js", "AI"],
    year: "2023 — 2024",
    href: "#",
  },
  {
    title: "Blockchain Game Store",
    summary:
      "A game store plus Pikachu, Block Puzzle and Jumps, built in Flutter for Android, iOS and web.",
    tags: ["Flutter", "Blockchain"],
    year: "2022",
    href: "#",
  },
  {
    title: "Autonomous Connect",
    summary:
      "A React Native app, SmartDesk 4 included, that sets up and controls smart desks, lights and thermals over Bluetooth and MQTT, and sends NFTs to a Raspberry Pi Smart Frame.",
    tags: ["React Native", "MQTT", "Redux Saga", "Python"],
    year: "2020 — 2022",
    href: "#",
  },
];
