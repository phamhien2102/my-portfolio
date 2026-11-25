import { SITE } from "@/config/site";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = SITE.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Portfolio",
    title: SITE.name,
    tagline: SITE.role,
    chips: ["React Native", "ReactJS", "iOS · Android"],
    art: "stack",
    theme: "dark",
  });
}
