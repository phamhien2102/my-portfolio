import { label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const ARR = [3, 8, 2, 9, 4, 1, 7, 5];

// Subproblem ranges of an 8-item array, level-order.
const RANGES = [
  "0-7",
  "0-3",
  "4-7",
  "0-1",
  "2-3",
  "4-5",
  "6-7",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
];

/** The subproblem tree; nodes below `level` are shown, those at `done` levels and deeper are settled. */
function split(level: number, tone: Tone | undefined, doneFrom = 99) {
  const vals = RANGES.map((r, i) => (Math.floor(Math.log2(i + 1)) <= level ? r : null));
  const tones: Record<number, Tone> = {};
  RANGES.forEach((_, i) => {
    const l = Math.floor(Math.log2(i + 1));
    if (l <= level) tones[i] = l >= doneFrom ? "done" : l === level && tone ? tone : "plain";
  });
  return tree(vals, { x: 320, y: 40, width: 560, dy: 56, r: 19, tones });
}

export const divideAndConquer: AlgoLesson = {
  id: "divide-and-conquer",
  title: "Divide & Conquer",
  summary: "Split a problem into smaller copies, solve each, and combine the answers.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "The divide, conquer, combine pattern",
    "Reading a tree of subproblems",
    "The recurrence T(n) = 2T(n/2) + O(n)",
    "Max-of-array, merge sort and binary search as examples",
  ],
  takeaways: [
    "Divide and conquer splits the input, solves the pieces recursively, then merges their answers.",
    "A balanced split over log n levels with O(n) work per level gives O(n log n).",
    "Binary search is the one-sided case: it discards one half instead of solving both.",
  ],
  hud: [
    { label: "Level", icon: "layers" },
    { label: "Pieces", icon: "branch" },
    { label: "Work", icon: "timer" },
  ],
  pseudocode: [
    "max_of(a, lo, hi):",
    "    if lo == hi:                  # base case: one item",
    "        return a[lo]",
    "    mid = (lo + hi) / 2           # divide",
    "    left = max_of(a, lo, mid)     # conquer the left half",
    "    right = max_of(a, mid + 1, hi)",
    "    return larger(left, right)    # combine",
  ],
  steps: [
    {
      short: "Problem",
      title: "One big problem, eight items",
      body: [
        "Say we want the largest value in this array. Scanning works, but let us use it to see a general strategy.",
        "Divide and conquer has three moves: divide the input, conquer each part recursively, combine the part answers.",
      ],
      metrics: [
        { label: "Level", value: "0" },
        { label: "Pieces", value: "1" },
      ],
      scene: scene(
        row(ARR, { index: true, y: 120 }),
        label("cap", 320, 230, "max of 8 items", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Divide",
      title: "Divide: split into halves",
      body: [
        "Indexes `0-7` split into `0-3` and `4-7`. Each half is the same problem on half the data.",
        "We stop splitting only when a piece is trivial.",
      ],
      metrics: [
        { label: "Level", value: "1" },
        { label: "Pieces", value: "2" },
      ],
      lines: [4],
      scene: scene(
        split(1, "active"),
        label("cap", 320, 250, "two subproblems of size 4", { weight: 800 }),
      ),
    },
    {
      short: "Keep going",
      title: "Keep halving down to single items",
      body: [
        "Halves split again: size 4 becomes 2, then 1. A single item is the base case, since its maximum is itself.",
        "Eight items need 3 splitting levels, because `8 → 4 → 2 → 1`.",
      ],
      metrics: [
        { label: "Level", value: "3" },
        { label: "Pieces", value: "8" },
      ],
      lines: [2, 3, 4],
      scene: scene(
        split(3, "mark"),
        label("cap", 320, 250, "base cases: one item each", { weight: 800 }),
      ),
    },
    {
      short: "Combine",
      title: "Combine: take the larger of two answers",
      body: [
        "On the way back up each node gets two answers and keeps the bigger one. The pair `3, 8` gives 8, and `2, 9` gives 9. Then 8 versus 9 gives 9.",
        "Here the combine step costs O(1); in merge sort it costs O(n).",
      ],
      callout: {
        kind: "insight",
        text: "All the real work is in the combine step; dividing is cheap.",
      },
      metrics: [
        { label: "Level", value: "2" },
        { label: "Pieces", value: "4" },
        { label: "Work", value: "O(1) each" },
      ],
      lines: [7],
      scene: scene(
        split(3, "plain", 2),
        row(["8", "9", "4", "7"], { id: "r", y: 270, x: 320, w: 50, tones: () => "found" }),
      ),
    },
    {
      short: "Recurrence",
      title: "Writing the cost as a recurrence",
      body: [
        "Solving two halves and merging costs `T(n) = 2T(n/2) + O(n)` for merge sort: two subproblems of half size, plus linear work to combine.",
        "The max example is `T(n) = 2T(n/2) + O(1)`, which works out to O(n).",
      ],
      metrics: [
        { label: "Level", value: "—" },
        { label: "Work", value: "2T(n/2) + n" },
      ],
      lines: [5, 6, 7],
      scene: scene(
        label("r1", 320, 90, "T(n) = 2 · T(n/2) + O(n)", { size: 22, weight: 800 }),
        label("r2", 320, 150, "2 subproblems, each half the size", { tone: "muted" }),
        label("r3", 320, 190, "plus linear work to combine", { tone: "muted" }),
        label("r4", 320, 250, "→ O(n log n)", { size: 24, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Levels",
      title: "Why n log n: count the levels",
      body: [
        "At each level the pieces together still hold `n` items, so combining costs about `n` per level. There are `log n` levels, giving `n × log n`.",
        "For `n = 8` that is 8 × 3 = 24 steps.",
      ],
      metrics: [
        { label: "Level", value: "3" },
        { label: "Pieces", value: "8" },
        { label: "Work", value: "8 × 3 = 24" },
      ],
      scene: scene(
        split(3, "done", 0),
        label("n0", 560, 40, "n", { tone: "muted" }),
        label("n1", 560, 96, "n", { tone: "muted" }),
        label("n2", 560, 152, "n", { tone: "muted" }),
        label("n3", 560, 208, "n", { tone: "muted" }),
      ),
    },
    {
      short: "Merge sort",
      title: "Merge sort uses exactly this shape",
      body: [
        "Merge sort splits the array in halves, sorts each recursively, then merges two sorted halves in one linear pass. That is the recurrence above, so O(n log n) in every case.",
        "It needs O(n) extra space for the merged output.",
      ],
      callout: {
        kind: "tip",
        text: "Preview only: the sorting lesson walks through the merge itself.",
      },
      metrics: [{ label: "Work", value: "O(n log n)", level: "good" }],
      scene: scene(
        row([3, 8, 2, 9], { id: "l", x: 190, y: 110, w: 44, tones: () => "mark" }),
        row([4, 1, 7, 5], { id: "r", x: 450, y: 110, w: 44, tones: () => "mark" }),
        label("a", 320, 170, "sort each half, then merge", { weight: 800 }),
        row([1, 2, 3, 4, 5, 7, 8, 9], {
          id: "m",
          x: 320,
          y: 220,
          w: 40,
          gap: 6,
          tones: () => "done",
        }),
      ),
    },
    {
      short: "One-sided",
      title: "Binary search discards a half",
      body: [
        "Binary search divides in two but only conquers one half, because the sorted order tells it which half can hold the target. The recurrence shrinks to `T(n) = T(n/2) + O(1)`.",
        "One subproblem per level over log n levels is O(log n).",
      ],
      metrics: [
        { label: "Level", value: "3" },
        { label: "Pieces", value: "1" },
        { label: "Work", value: "O(log n)", level: "good" },
      ],
      scene: scene(
        row([1, 2, 3, 4, 5, 7, 8, 9], {
          w: 50,
          gap: 6,
          y: 120,
          tones: (i) => (i < 4 ? "muted" : i === 5 ? "found" : "active"),
        }),
        label("cap", 320, 220, "left half thrown away, only one side explored", { weight: 800 }),
      ),
    },
    {
      short: "Recap",
      title: "When to reach for it",
      body: [
        "Use divide and conquer when a problem splits into independent, smaller versions of itself and answers can be combined cheaply. Balanced splits give log n depth.",
        "Match the recurrence to the cost: two halves plus linear merge is O(n log n), one half plus constant work is O(log n).",
      ],
      metrics: [{ label: "Work", value: "depth × work per level" }],
      scene: scene(
        row(["divide", "conquer", "combine"], {
          w: 130,
          y: 130,
          tones: { 0: "active", 1: "mark", 2: "found" },
        }),
        label("cap", 320, 210, "cost = levels × work per level", { weight: 800 }),
      ),
    },
  ],
};
