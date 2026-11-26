import { JetBrains_Mono } from "next/font/google";

import "../ielts.css";
import "./mock.css";
import { MockExamApp } from "./mock-exam";
import { BANDS, type Band } from "./types";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

export const MOCK_BANDS: readonly Band[] = BANDS.map((b) => b.id);

/** /ielts/mock/<band>: the three mock tests as something you take, not just read about. */
export function MockExam({ band }: { band: Band }) {
  return <MockExamApp band={band} fontClassName={mono.variable} />;
}
