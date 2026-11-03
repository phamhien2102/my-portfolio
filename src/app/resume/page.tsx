import type { Metadata } from "next";

import { SITE } from "@/config/site";
import { Resume, ResumeCreative, ResumeViewer } from "@/features/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${SITE.name}.`,
  // Holds personal details (phone, date of birth): keep it out of search results.
  robots: { index: false, follow: false },
};

export default function ResumePage() {
  return (
    <ResumeViewer
      classic={<Resume preview />}
      creative={<ResumeCreative />}
      printable={<Resume />}
    />
  );
}
