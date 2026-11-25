import type { Difficulty } from "../data";

/** LeetCode-style difficulty chip: green, yellow or red, each with a dark edge. */
export function DifficultyPill({ level }: { level: Difficulty }) {
  return (
    <span className="alg-diff" data-level={level}>
      {level}
    </span>
  );
}
