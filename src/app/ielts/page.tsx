import type { Metadata } from "next";

import { IeltsBook } from "@/features/ielts";

export const metadata: Metadata = {
  title: "IELTS Practice Course",
  description:
    "A four-week IELTS course: practice websites, weekly units with answers and transcripts, and a mock exam.",
};

export default function IeltsPage() {
  return <IeltsBook />;
}
