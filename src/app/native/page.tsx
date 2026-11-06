import type { Metadata } from "next";

import { NativeRoadmap } from "@/features/native";

export const metadata: Metadata = {
  title: "Going native",
  description: "A roadmap for learning SwiftUI and Kotlin, with the app to build at each step.",
  // A personal page, not linked from the site: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function NativePage() {
  return <NativeRoadmap />;
}
