import type { Metadata } from "next";

import { HiddenPages } from "@/features/hide-pages";

export const metadata: Metadata = {
  title: "Unlisted pages",
  description: "The entry points of the pages that the navigation does not show.",
  // Unlisted like the pages it lists: not in SITE.nav, and out of search results.
  robots: { index: false, follow: false },
};

export default function HidePagesPage() {
  return <HiddenPages />;
}
