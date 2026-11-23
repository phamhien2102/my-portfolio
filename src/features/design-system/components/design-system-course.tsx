import { JetBrains_Mono } from "next/font/google";

import "../design-system.css";
import { DesignSystemApp } from "./design-system-app";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbm",
  display: "swap",
});

/**
 * /design-system: an interactive system design course. A light page in the same warm-paper style
 * as /ielts, so it opts out of the dark shell. The lessons are plain data in `data.ts`.
 */
export function DesignSystemCourse() {
  return <DesignSystemApp fontClassName={mono.variable} />;
}
