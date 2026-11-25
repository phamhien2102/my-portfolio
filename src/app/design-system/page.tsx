import type { Metadata } from "next";

import { DesignSystemCourse } from "@/features/design-system";

export const metadata: Metadata = {
  title: "Design System — an interactive course",
  description:
    "An interactive system design course: each idea is an animated diagram you step through, from one server to millions of users.",
  // Unlisted like the other learning pages: not in SITE.nav, and out of search results.
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemCourse />;
}
