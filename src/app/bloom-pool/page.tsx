import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

import { BloomPool } from "@/features/bloom-pool";

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Bloom Pool",
  description: "A sunlit Mediterranean pool kept for floating flowers.",
};

export default function BloomPoolPage() {
  return (
    <div className={serif.className}>
      <BloomPool />
    </div>
  );
}
