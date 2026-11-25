import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt =
  "Raymond’s Products: Three hands-on courses: IELTS, system design, and algorithms.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Raymond Pham",
    title: "Raymond’s Products",
    tagline: "Three hands-on courses: IELTS, system design, and algorithms.",
    chips: ["IELTS", "Design System", "Algo Lab"],
    accent: { fill: "#bddcf6", edge: "#2b7fd6" },
    theme: "light",
  });
}
