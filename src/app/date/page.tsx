import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import { FlightCheckIn } from "@/features/date";

const vietnamese = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: "Date Airways · Flight HH143",
  description: "The only flight still boarding this weekend.",
  robots: { index: false, follow: false },
};

export default function DatePage() {
  return (
    <div className={vietnamese.className}>
      <FlightCheckIn />
    </div>
  );
}
