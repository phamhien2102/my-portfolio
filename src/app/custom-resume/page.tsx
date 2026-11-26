import type { Metadata } from "next";

import { CustomResume } from "@/features/custom-resume";

export const metadata: Metadata = {
  title: "Custom Resume",
  description:
    "Build a CV from three templates, preview it live and export a PDF you can re-import.",
  // A personal tool that stores CV details in the browser: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function CustomResumePage() {
  return <CustomResume />;
}
