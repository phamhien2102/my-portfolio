import { frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

// Climbing stairs: ways(i) = ways(i - 1) + ways(i - 2), with ways(0) = ways(1) = 1.
const DP = [1, 1, 2, 3, 5, 8, 13, 21];

/** The table with cells before `filled` settled, an optional active cell and the cells it reads. */
function view(filled: number, active?: number, marks: number[] = [], caption?: string) {
  const shown = DP.map((v, i) => (i < filled || i === active ? v : ""));
  return scene(
    label("t", 320, 70, "ways to climb the stairs: dp[i]", { size: 14, weight: 800 }),
    row(shown, {
      y: 150,
      index: true,
      empty: DP.flatMap((_, i) => (i < filled || i === active ? [] : [i])),
      tones: (i): Tone | undefined =>
        i === active ? "active" : marks.includes(i) ? "mark" : i < filled ? "done" : undefined,
    }),
    active !== undefined && ptr("i", `a${active}`, `i = ${active}`),
    caption && label("cap", 320, 240, caption, { size: 14, weight: 800 }),
  );
}

export const tabulation: AlgoLesson = {
  id: "tabulation",
  title: "Tabulation",
  summary: "Fill a table from the smallest subproblem upward, with no recursion and no call stack.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "How bottom-up differs from top-down memoization",
    "Choosing the order in which to fill a table",
    "Base cases and the recurrence in a loop",
    "Shrinking the table when only a few cells are read",
  ],
  takeaways: [
    "Tabulation solves subproblems smallest first, so every cell finds its inputs already filled.",
    "The fill order must follow the dependencies: a cell may only read cells filled before it.",
    "If a cell reads only the last few cells, you can keep just those and cut memory to a constant.",
  ],
  hud: [
    { label: "Cells filled", icon: "grid" },
    { label: "Memory", icon: "memory" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "ways(n):",
    "    dp = table of n + 1 empty cells",
    "    dp[0] = 1",
    "    dp[1] = 1",
    "    for i in 2 .. n:",
    "        dp[i] = dp[i - 1] + dp[i - 2]",
    "    return dp[n]",
  ],
  steps: [
    {
      short: "The task",
      title: "Counting ways to climb",
      body: [
        "You climb 7 stairs taking 1 or 2 steps at a time. How many different sequences of steps reach the top?",
        "The last move was either a 1-step from stair `i - 1` or a 2-step from stair `i - 2`, so `dp[i] = dp[i - 1] + dp[i - 2]`. We will fill `dp` from the left instead of recursing from the right.",
      ],
      metrics: [
        { label: "Cells filled", value: "0 / 8" },
        { label: "Memory", value: "8 cells" },
      ],
      scene: view(0, undefined, [], "dp[i] = dp[i-1] + dp[i-2]"),
    },
    {
      short: "Base cases",
      title: "Start with what is obvious",
      body: [
        "`dp[0] = 1`: standing at the bottom is one way, doing nothing. `dp[1] = 1`: a single 1-step.",
        "Base cases are the cells the recurrence cannot compute because it would read before the start of the table. We write them by hand.",
      ],
      metrics: [{ label: "Cells filled", value: "2 / 8" }],
      lines: [3, 4],
      scene: view(2, undefined, [], "dp[0] = 1, dp[1] = 1"),
    },
    {
      short: "dp[2]",
      title: "The first computed cell",
      body: [
        "`dp[2] = dp[1] + dp[0] = 1 + 1 = 2`. The two ways are 1+1 and a single 2.",
        "Both inputs are to the left and already filled. That is why filling left to right works.",
      ],
      callout: {
        kind: "insight",
        text: "Tabulation never asks a question twice and never waits for a recursive call: the loop order guarantees the inputs exist.",
      },
      metrics: [{ label: "Cells filled", value: "3 / 8" }],
      lines: [5, 6],
      scene: view(2, 2, [0, 1], "dp[2] = 1 + 1 = 2"),
    },
    {
      short: "dp[3]",
      title: "Slide one cell to the right",
      body: [
        "`dp[3] = dp[2] + dp[1] = 2 + 1 = 3`. The two cells read are always the two just before the active one.",
        "The same line of code, in a loop `for i in 2..n`, produces every remaining cell.",
      ],
      metrics: [{ label: "Cells filled", value: "4 / 8" }],
      lines: [5, 6],
      scene: view(3, 3, [1, 2], "dp[3] = 2 + 1 = 3"),
    },
    {
      short: "dp[4]",
      title: "Numbers grow quickly",
      body: [
        "`dp[4] = dp[3] + dp[2] = 3 + 2 = 5`. These are the Fibonacci numbers again, which is no accident: the recurrence is identical.",
        "The difference from memoization is the direction. There the recursion started at the answer and walked down; here we start at the base and walk up.",
      ],
      metrics: [{ label: "Cells filled", value: "5 / 8" }],
      lines: [5, 6],
      scene: view(4, 4, [2, 3], "dp[4] = 3 + 2 = 5"),
    },
    {
      short: "Last cell",
      title: "The answer is the last cell",
      body: [
        "Cells 5 and 6 follow the same rule and give `8` and `13`. Then `dp[7] = dp[6] + dp[5] = 13 + 8 = 21`.",
        "There are 21 ways to climb 7 stairs. The loop ran 6 times: time `O(n)`, with no recursion depth to worry about.",
      ],
      callout: {
        kind: "tip",
        text: "Bottom-up code has no stack-overflow risk and usually runs faster than the recursive version because there is no call overhead.",
      },
      metrics: [
        { label: "Cells filled", value: "8 / 8", level: "good" },
        { label: "Time", value: "O(n)", level: "good" },
      ],
      lines: [6, 7],
      scene: scene(
        label("t", 320, 70, "ways to climb the stairs: dp[i]", { size: 14, weight: 800 }),
        row(DP, {
          y: 150,
          index: true,
          tones: (i): Tone | undefined =>
            i === 7 ? "found" : i === 5 || i === 6 ? "mark" : "done",
        }),
        ptr("i", "a7", "answer"),
        label("cap", 320, 240, "dp[7] = 13 + 8 = 21", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Two values",
      title: "Do we need the whole table?",
      body: [
        "To compute cell `i` we only read cells `i - 1` and `i - 2`. Everything older is dead weight once we have moved on.",
        "So keep two variables, `prev2` and `prev1`, and slide them: `next = prev1 + prev2`, then `prev2 = prev1` and `prev1 = next`. Memory drops from `O(n)` to `O(1)`.",
      ],
      callout: {
        kind: "warn",
        text: "This only works when each cell reads a bounded number of recent cells. If a cell can read any earlier cell, keep the table.",
      },
      metrics: [
        { label: "Memory", value: "2 numbers", level: "good" },
        { label: "Time", value: "O(n)", level: "good" },
      ],
      lines: [6],
      scene: scene(
        row(DP, {
          y: 150,
          index: true,
          tones: (i): Tone | undefined =>
            i === 7 ? "found" : i === 5 || i === 6 ? "mark" : "muted",
        }),
        frame("win", 380, 119, 124, 62, "last two"),
        label("cap", 320, 240, "keep only the window: prev2 = 8, prev1 = 13", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "Recap",
      title: "Top-down or bottom-up?",
      body: [
        "Tabulation: decide the fill order, write the base cases, then loop. Memoization: write the recursion, add a cache. Both visit each subproblem once, so they have the same time complexity.",
        "Prefer tabulation when the order is obvious and you want to trim memory; prefer memoization when only some subproblems are ever needed, because it skips the rest.",
      ],
      metrics: [
        { label: "Cells filled", value: "n + 1" },
        { label: "Memory", value: "O(n) → O(1)", level: "good" },
        { label: "Time", value: "O(n)", level: "good" },
      ],
      scene: scene(
        label("a", 320, 70, "bottom-up: base cases → loop in dependency order", {
          size: 14,
          weight: 800,
        }),
        label("b", 320, 120, "top-down: recursion + cache, only needed cells", {
          size: 14,
          weight: 800,
        }),
        label("c", 320, 190, "same recurrence, same O(n) time", { size: 13, tone: "muted" }),
      ),
    },
  ],
};
