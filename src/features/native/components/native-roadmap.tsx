import { JetBrains_Mono } from "next/font/google";

import "../native.css";
import { NativeApp } from "./native-app";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/**
 * /native: a learning roadmap for SwiftUI and Kotlin, with a link and an app at every step. Laid out
 * like /ielts: a top bar, a tree of phases and one sheet with Back and Next.
 */
export function NativeRoadmap() {
  return <NativeApp fontClassName={mono.variable} />;
}
