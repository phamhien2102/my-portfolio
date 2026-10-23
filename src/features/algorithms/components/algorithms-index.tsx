import Link from "next/link";

import { THEME } from "@/config/theme";

import { LearnedProgress } from "./learned";
import { PatternList } from "./pattern-list";

/** /algorithms: the list of patterns, each card opening its own walkthrough page. */
export function AlgorithmsIndex() {
  return (
    <main
      className="min-h-svh px-5 py-16 text-zinc-100 sm:px-8"
      style={{ background: THEME.background }}
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.25em] text-zinc-500 hover:text-zinc-300"
        >
          ← RAYMOND PHAM
        </Link>
        <p className="mt-10 font-mono text-xs tracking-[0.3em] text-zinc-500">
          LEETCODE · PATTERNS
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Algorithm patterns.</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Most interview problems are a handful of ideas wearing different clothes. Pick a pattern,
          watch it solve a real LeetCode problem step by step, then try the practice list.
        </p>

        <LearnedProgress />

        <PatternList />
      </div>
    </main>
  );
}
