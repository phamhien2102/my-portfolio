import type { Metadata } from "next";

import { AiWorkflowRoadmap, CLAUDE_CODE_PLAN } from "@/features/ai-workflow";

export const metadata: Metadata = {
  title: "One workflow, built in layers",
  description:
    "A roadmap for building a Claude Code workflow: context, skills, hooks, subagents, MCP and CI.",
  // A personal page, not linked from the site: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function AiWorkflowPage() {
  return <AiWorkflowRoadmap plan={CLAUDE_CODE_PLAN} />;
}
