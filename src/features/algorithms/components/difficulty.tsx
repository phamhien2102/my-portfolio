import { cn } from "@/lib/cn";

import type { Difficulty } from "../data";

const TONE: Record<Difficulty, string> = {
  Easy: "border-[#00b96b]/40 bg-[#00b96b]/10 text-[#5cf0a8]",
  Medium: "border-[#ffb020]/40 bg-[#ffb020]/10 text-[#ffd27a]",
  Hard: "border-[#ff4d6d]/40 bg-[#ff4d6d]/10 text-[#ff99ab]",
};

/** LeetCode-style difficulty pill. */
export function DifficultyPill({ level, className }: { level: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        TONE[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
