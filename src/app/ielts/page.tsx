import type { Metadata } from "next";

import { IeltsBook } from "@/features/ielts";

export const metadata: Metadata = {
  title: "IELTS Practice Course",
  description:
    "A four-week IELTS course: practice websites, weekly units with answers and transcripts, and a mock exam.",
  // Unlisted like the other private pages: not in SITE.nav, and out of search results.
  robots: { index: false, follow: false },
};

export default function IeltsPage() {
  return <IeltsBook />;
}
