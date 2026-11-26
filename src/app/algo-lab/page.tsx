import type { Metadata } from "next";

import { AlgoLabCourse } from "@/features/algo-lab";

export const metadata: Metadata = {
  title: "Algo Lab — data structures and algorithms, step by step",
  description:
    "Short lessons on data structures and algorithms, each a step-by-step walkthrough with a diagram that moves as you go.",
};

export default function AlgoLabPage() {
  return <AlgoLabCourse />;
}
