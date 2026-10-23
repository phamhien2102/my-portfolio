import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findPattern, PATTERNS, PatternPage } from "@/features/algorithms";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PATTERNS.map((pattern) => ({ slug: pattern.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pattern = findPattern(slug);
  return pattern
    ? { title: `${pattern.name} · Algorithm patterns`, description: pattern.tagline }
    : {};
}

export default async function AlgorithmPatternPage({ params }: Props) {
  const { slug } = await params;
  const pattern = findPattern(slug);
  if (!pattern) notFound();
  return <PatternPage pattern={pattern} />;
}
