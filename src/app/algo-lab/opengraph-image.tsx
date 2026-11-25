import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Algo Lab: Data structures and algorithms, step by step.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Course",
    title: "Algo Lab",
    tagline: "Data structures and algorithms, step by step.",
    chips: ["14 modules", "86 lessons", "EN · VI · FR · DE"],
    accent: { fill: "#d5dcf6", edge: "#4338ca" },
    theme: "light",
  });
}
