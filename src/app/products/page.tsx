import type { Metadata } from "next";

import { Products } from "@/features/products";

export const metadata: Metadata = {
  title: "Raymond’s Products — IELTS Practice, Design System and Algo Lab",
  description:
    "Three hands-on courses: an IELTS course reader, an interactive system design course and a step-by-step data structures and algorithms lab.",
};

export default function ProductsPage() {
  return <Products />;
}
