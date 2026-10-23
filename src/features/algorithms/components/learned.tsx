"use client";

import { cn } from "@/lib/cn";

import { PATTERNS, type PatternSlug } from "../data";
import { useLearned } from "../lib/progress";

/** "Mark as learned" toggle for a pattern page. */
export function LearnedToggle({ slug }: { slug: PatternSlug }) {
  const { isLearned, toggle } = useLearned();
  const learned = isLearned(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={learned}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
        learned
          ? "border-[#5cff9d] bg-[#5cff9d]/15 text-[#b8ffd6]"
          : "border-white/20 text-zinc-200 hover:border-white/50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-4 items-center justify-center rounded border text-[11px] leading-none",
          learned ? "border-[#5cff9d] bg-[#5cff9d] text-black" : "border-white/40",
        )}
      >
        {learned ? "✓" : ""}
      </span>
      {learned ? "Learned" : "Mark as learned"}
    </button>
  );
}

/** Small green check on a pattern card once it is learned. */
export function LearnedCheck({ slug }: { slug: PatternSlug }) {
  const { isLearned } = useLearned();
  if (!isLearned(slug)) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#5cff9d]/50 bg-[#5cff9d]/15 px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#b8ffd6]">
      ✓ LEARNED
    </span>
  );
}

/** "n / 5 learned" with a progress bar, for the pattern list. */
export function LearnedProgress() {
  const { count } = useLearned();
  const total = PATTERNS.length;
  return (
    <div className="mt-8 flex max-w-sm items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#5cff9d] transition-[width] duration-500"
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
      <span className="font-mono text-xs text-zinc-400 tabular-nums">
        {count} / {total} learned
      </span>
    </div>
  );
}
