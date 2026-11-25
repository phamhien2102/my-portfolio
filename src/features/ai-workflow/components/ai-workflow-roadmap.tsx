import { JetBrains_Mono } from "next/font/google";

import type { Plan } from "../data";
import "../ai-workflow.css";
import { AiWorkflowApp } from "./ai-workflow-app";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/**
 * /ai-workflow and its siblings: a roadmap for building one AI workflow, a layer per phase. Laid
 * out like /ielts: a top bar, a tree of phases and one sheet with Back and Next.
 */
export function AiWorkflowRoadmap({ plan }: { plan: Plan }) {
  return <AiWorkflowApp plan={plan} fontClassName={mono.variable} />;
}
