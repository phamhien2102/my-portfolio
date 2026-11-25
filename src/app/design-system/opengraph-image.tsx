import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Design System: System design, one request at a time, on animated diagrams.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Course",
    title: "Design System",
    tagline: "System design, one request at a time, on animated diagrams.",
    chips: ["9 modules", "40 lessons", "EN · VI · FR · DE"],
    accent: { fill: "#bddcf6", edge: "#2b7fd6" },
    theme: "light",
  });
}
