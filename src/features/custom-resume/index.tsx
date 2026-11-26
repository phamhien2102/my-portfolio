import { JetBrains_Mono } from "next/font/google";

import { CustomResumeApp } from "./components/custom-resume-app";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/** /custom-resume: a CV builder in the same warm-paper style as /ielts. */
export function CustomResume() {
  return <CustomResumeApp fontClassName={mono.variable} />;
}
