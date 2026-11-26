import type { Metadata } from "next";

import { CustomResume } from "@/features/custom-resume";

export const metadata: Metadata = {
  title: "Custom Resume",
  description:
    "Build a CV from six templates with a live A4 preview, then export a PDF with selectable text or a Word file. A PDF exported here can be imported back to keep editing.",
};

export default function CustomResumePage() {
  return <CustomResume />;
}
