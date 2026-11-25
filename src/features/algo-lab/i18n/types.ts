/** The words that belong to Algo Lab itself, on top of the ones every course page shares. */
export interface AlgoUi {
  nav: {
    learn: string;
    practice: string;
    cheatsheets: string;
    challenges: string;
    progress: string;
  };
  searchPlaceholder: string;
  /** The colour key under the stage. */
  legend: { active: string; found: string; settled: string; problem: string };
  /** How a block's state is named in "What changed", by its tone. */
  tones: Record<
    "plain" | "active" | "found" | "done" | "warn" | "mark" | "muted" | "ghost",
    string
  >;
  isNow: (name: string, tone: string) => string;
  moved: (name: string) => string;
  pointer: (text: string) => string;
}
