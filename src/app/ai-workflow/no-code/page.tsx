import type { Metadata } from "next";

import { AiWorkflowRoadmap, NO_CODE_PLAN } from "@/features/ai-workflow";

export const metadata: Metadata = {
  title: "One automation, no server of your own",
  description: "A roadmap for building an AI workflow in n8n, with Make, Zapier and Dify compared.",
  // Same as /ai-workflow: a personal page, kept out of search results.
  robots: { index: false, follow: false },
};

export default function AiWorkflowNoCodePage() {
  return <AiWorkflowRoadmap plan={NO_CODE_PLAN} />;
}
