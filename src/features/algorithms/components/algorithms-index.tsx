import { AlgShell } from "./alg-shell";
import { LearnedProgress } from "./learned";
import { PatternList } from "./pattern-list";

/** /algorithms: the list of patterns, each card opening its own walkthrough page. */
export function AlgorithmsIndex() {
  return (
    <AlgShell>
      <div className="alg-banner">
        <p className="alg-eyebrow">LeetCode · Patterns</p>
        <h1>Algorithm patterns.</h1>
        <p className="alg-sub">
          Most interview problems are a handful of ideas wearing different clothes. Pick a pattern,
          watch it solve a real LeetCode problem step by step, then try the practice list.
        </p>
        <LearnedProgress />
      </div>

      <PatternList />
    </AlgShell>
  );
}
