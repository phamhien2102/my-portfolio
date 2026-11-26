import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MOCK_BANDS, MockExam } from "@/features/ielts";

interface Props {
  params: Promise<{ band: string }>;
}

export function generateStaticParams() {
  return MOCK_BANDS.map((band) => ({ band }));
}

export const metadata: Metadata = {
  title: "IELTS Mock Exam",
  description:
    "Take a full IELTS Academic mock test: timed Reading and Writing with marking, a Listening answer sheet, and Speaking practice.",
};

export default async function MockExamPage({ params }: Props) {
  const { band } = await params;
  if (!(MOCK_BANDS as readonly string[]).includes(band)) notFound();
  return <MockExam band={band as (typeof MOCK_BANDS)[number]} />;
}
