import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt =
  "Raymond’s Products: hands-on courses and tools: IELTS, system design, algorithms and a CV builder.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Raymond Pham",
    title: "Raymond’s Products",
    tagline: "Hands-on courses and tools: IELTS, system design, algorithms and a CV builder.",
    chips: ["IELTS", "Design System", "Algo Lab", "Custom Resume"],
    art: "cubes",
    theme: "light",
  });
}
