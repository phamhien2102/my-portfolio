import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt =
  "IELTS Practice: A course reader for Band 6–8, in English with Vietnamese beside it.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Course",
    title: "IELTS Practice",
    tagline: "A course reader for Band 6–8, in English with Vietnamese beside it.",
    chips: ["16 chapters", "Notes", "Flashcards"],
    art: "book",
    theme: "light",
  });
}
