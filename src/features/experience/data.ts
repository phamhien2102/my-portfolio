export interface Role {
  period: string;
  title: string;
  company: string;
  /** Names of the products or projects worked on in this role (shown on the resume). */
  projects?: readonly string[];
  highlights: readonly string[];
}

export const EXPERIENCE: readonly Role[] = [
  {
    period: "Dec 2025 — Present",
    title: "UI Engineer",
    company: "Huge",
    projects: ["My Epic (Vail Resorts)"],
    highlights: [
      "Own the pass browsing, product detail, cart and checkout screens of the My Epic app (React Native, iOS and Android), from list page to order confirmation, with cart API integration and off-sale handling. 95 merged pull requests across 71 tickets so far.",
      "Moved pass content, icons and entry points to CMS and feature flags, so they can change without an app release.",
      "Restructured the app-wide Redux store and wrote the optimization strategy the team follows; audited pass API contracts and found 11 typing gaps in four root-cause patterns, with a plan to fix them.",
      "Ran technical spikes on app-startup observability and a performance-monitoring SDK, and wrote the docs that came out of them.",
    ],
  },
  {
    period: "Jun 2025 — Nov 2025",
    title: "UI Engineer",
    company: "Huge",
    projects: ["The Ring (boxing news app)"],
    highlights: [
      "Joined The Ring app (React Native) in its first months and became its most active contributor in a team of six or more: 306 merged pull requests across 133 tickets. Built the shared component library and the sign-in flows (Google, Apple, email, account linking).",
      "Delivered the news experience end to end: hero carousel, article pages with video, galleries and fight cards, and related articles, with content from Contentful.",
      "Built schedules, event listings and results, rankings, and push notifications that open the right event.",
      "Added consent management with OneTrust, remote config, image caching and iPad support, and wrote the notification, auth and analytics docs.",
    ],
  },
  {
    period: "Dec 2024 — May 2025",
    title: "Master's thesis",
    company: "University of Technology (UT)",
    highlights: [
      "Took a break from work to focus full time on the thesis for my Master of Data Science, completed in April 2025.",
    ],
  },
  {
    period: "Mar 2023 — Dec 2024",
    title: "Mobile and Web Developer",
    company: "Autonomous Company",
    projects: ["AI Chat (ChatGPT-style)"],
    highlights: [
      "Built a ChatGPT-style Flutter app so people can chat with AI agents or switch between them.",
      "Shipped the same product on the web with Next.js.",
    ],
  },
  {
    period: "Mar 2020 — Feb 2023",
    title: "Mobile & Hardware Developer",
    company: "Autonomous Company",
    projects: [
      "Autonomous Connect (formerly SmartDesk 4)",
      "Blockchain Game Store",
      "E-commerce Website",
    ],
    highlights: [
      "Built Autonomous Connect (formerly SmartDesk 4) in React Native with MQTT and Redux Saga: a phone app that sets up smart desks over Bluetooth, then controls desks, lights, thermals and frames, with scheduling, sit/stand reports, lock mode and Facebook/Google login.",
      "Wrote the Python service on Raspberry Pi 4 that shows NFTs, sent from the phone, on Smart Frames.",
      "Shipped blockchain games in Flutter (Pikachu, Block Puzzle, Jumps) for Android, iOS and web.",
      "Improved the furniture e-commerce site in React (Redux Thunk, Facebook Conversions API, Google Tag Manager).",
    ],
  },
  {
    period: "2018 — 2019",
    title: "Mobile Developer",
    company: "Saigon Technology Solutions",
    projects: ["KALMS (Singapore)", "Video selfie and eKYC chat app"],
    highlights: [
      "Built KALMS (Singapore) in React Native: voucher purchase, reporting and printing over Wi‑Fi/Bluetooth, then shipped it to the App Store and Play Store.",
      "Worked on a chat and eKYC product (video selfie, face search): 1-to-1 and group chat, Agora video calls, SignalR messages and offline mode.",
    ],
  },
];
