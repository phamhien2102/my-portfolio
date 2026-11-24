import { Inter, JetBrains_Mono } from "next/font/google";

import "@/components/course/course.css";
import "@/components/course/course-algo.css";
import "../algo-lab.css";
import { AlgoLabApp } from "./algo-lab-app";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/** /algo-lab: an interactive data structures and algorithms course on the shared course shell. */
export function AlgoLabCourse() {
  return <AlgoLabApp fontClassName={`${inter.variable} ${mono.variable}`} />;
}
