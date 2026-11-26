import type { Metadata } from "next";

import { Products } from "@/features/products";

export const metadata: Metadata = {
  title: "Raymond’s Products — IELTS Practice, Design System, Algo Lab and Custom Resume",
  description:
    "Hands-on courses and tools: an IELTS course reader, an interactive system design course, a step-by-step data structures and algorithms lab and a CV builder.",
};

export default function ProductsPage() {
  return <Products />;
}
