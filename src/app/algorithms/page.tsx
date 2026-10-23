import type { Metadata } from "next";

import { AlgorithmsIndex } from "@/features/algorithms";

export const metadata: Metadata = {
  title: "Algorithm patterns",
  description: "Common LeetCode patterns, each walked through step by step on a real problem.",
};

export default function AlgorithmsPage() {
  return <AlgorithmsIndex />;
}
