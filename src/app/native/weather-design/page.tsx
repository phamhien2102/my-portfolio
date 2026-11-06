import type { Metadata } from "next";

import { WeatherDesign } from "@/features/native";

export const metadata: Metadata = {
  title: "Weather, drawn once",
  description: "The design of the Weather app built across the going-native roadmap.",
  // Same as /native: a personal page, kept out of search results.
  robots: { index: false, follow: false },
};

export default function WeatherDesignPage() {
  return <WeatherDesign />;
}
