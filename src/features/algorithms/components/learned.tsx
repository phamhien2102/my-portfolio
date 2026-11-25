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
      className={cn("alg-btn", learned && "is-on")}
    >
      <span aria-hidden="true" className="alg-tick">
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
  return <span className="alg-learned">✓ LEARNED</span>;
}

/** "n / 5 learned" with a progress bar, for the pattern list. */
export function LearnedProgress() {
  const { count } = useLearned();
  const total = PATTERNS.length;
  return (
    <div className="alg-progress">
      <div className="alg-bar">
        <span style={{ width: `${(count / total) * 100}%` }} />
      </div>
      <output>
        {count} / {total} learned
      </output>
    </div>
  );
}
