import type { Metadata } from "next";

import { AiWorkflowRoadmap, MOBILE_FEATURE_PLAN } from "@/features/ai-workflow";

export const metadata: Metadata = {
  title: "Build a feature, keep the workflow",
  description:
    "A roadmap that grows an AI workflow out of building one mobile feature, from ticket to pull request.",
  // Same as /ai-workflow: a personal page, kept out of search results.
  robots: { index: false, follow: false },
};

export default function AiWorkflowMobileFeaturePage() {
  return <AiWorkflowRoadmap plan={MOBILE_FEATURE_PLAN} />;
}
