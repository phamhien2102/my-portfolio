import { cell, label, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const CW = 34;
const GAP = 22;
const ALL = [6, 3, 8, 2, 7, 1, 5, 4];

/** Lay groups of values out as separate rows on one line; each value keeps its id so it slides. */
function place(
  groups: number[][],
  y: number,
  tone: (v: number) => Tone | undefined = () => undefined,
) {
  const gw = (n: number) => n * CW + (n - 1) * 4;
  const total = groups.reduce((s, g) => s + gw(g.length), 0) + (groups.length - 1) * GAP;
  let x = 320 - total / 2;
  return groups.flatMap((g) => {
    const out = g.map((v, i) =>
      cell(`v${v}`, x + CW / 2 + i * (CW + 4), y, v, { w: CW, h: 40, tone: tone(v) }),
    );
    x += gw(g.length) + GAP;
    return out;
  });
}

const title = (t: string) => label("title", 320, 60, t, { size: 14, weight: 800 });
const note = (t: string, y = 235) => label("note", 320, y, t, { size: 13, tone: "muted" });

export const mergeSort: AlgoLesson = {
  id: "merge-sort",
  title: "Merge Sort",
  summary: "Split the list in halves down to single items, then merge sorted halves back together.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "How divide and conquer turns sorting into merging",
    "How two sorted runs merge by comparing their fronts",
    "Why the total work is O(n log n)",
    "What the extra O(n) memory is for, and why merge sort is stable",
  ],
  takeaways: [
    "Merge sort splits until each piece is one item, then merges neighbouring sorted pieces; merging is linear in the pieces' size.",
    "There are about log2(n) levels and each level does O(n) work, giving O(n log n) in the best, average and worst case.",
    "Merging needs an output buffer of O(n) extra memory, and taking the left item on ties keeps equal items in order (stable).",
  ],
  hud: [
    { label: "Runs", icon: "list" },
    { label: "Run size", icon: "grid" },
    { label: "Items placed", icon: "timer" },
    { label: "Extra memory", icon: "memory" },
  ],
  pseudocode: [
    "merge_sort(a):",
    "    if len(a) <= 1: return a",
    "    mid = len(a) / 2",
    "    left = merge_sort(first half)",
    "    right = merge_sort(second half)",
    "    return merge(left, right)",
    "merge(left, right):",
    "    out = []",
    "    while left and right are not empty:",
    "        move the smaller front into out (left wins ties)",
    "    append whatever remains",
    "    return out",
  ],
  steps: [
    {
      short: "The problem",
      title: "Eight numbers in a mess",
      body: [
        "We want `6 3 8 2 7 1 5 4` in increasing order. Merge sort rests on one observation: two lists that are already sorted are easy to combine into one sorted list.",
        "So the plan is to make the pieces so small that they are trivially sorted, then combine them.",
      ],
      metrics: [
        { label: "Runs", value: "1" },
        { label: "Run size", value: "8" },
      ],
      scene: scene(title("unsorted"), place([ALL], 150)),
    },
    {
      short: "Split",
      title: "Cut it in half",
      body: [
        "Split the list in the middle: `6 3 8 2` and `7 1 5 4`. We do not sort anything yet; we just plan to sort each half separately.",
      ],
      metrics: [
        { label: "Runs", value: "2" },
        { label: "Run size", value: "4" },
      ],
      lines: [3, 4, 5],
      scene: scene(title("two halves"), place([ALL.slice(0, 4), ALL.slice(4)], 150)),
    },
    {
      short: "Split again",
      title: "Keep halving",
      body: [
        "Each half splits in half again: pairs `6 3`, `8 2`, `7 1` and `5 4`.",
        "Each split is a recursive call on a smaller list, and the recursion goes about log2(n) levels deep.",
      ],
      metrics: [
        { label: "Runs", value: "4" },
        { label: "Run size", value: "2" },
      ],
      lines: [4, 5],
      scene: scene(
        title("four pairs"),
        place(
          [
            [6, 3],
            [8, 2],
            [7, 1],
            [5, 4],
          ],
          150,
        ),
      ),
    },
    {
      short: "Singletons",
      title: "A single item is sorted",
      body: [
        "One more split leaves eight pieces of one item. A list of one item cannot be out of order, so this is the base case and the splitting stops.",
        "All the real work happens on the way back up, in the merges.",
      ],
      callout: {
        kind: "insight",
        text: "Sorting 8 items became 8 trivial problems plus a plan for combining them.",
      },
      metrics: [
        { label: "Runs", value: "8" },
        { label: "Run size", value: "1" },
        { label: "Items placed", value: "0", level: "good" },
      ],
      lines: [2],
      scene: scene(
        title("eight single items"),
        place(
          ALL.map((v) => [v]),
          150,
        ),
        note("each one is a sorted run of length 1"),
      ),
    },
    {
      short: "First merge",
      title: "Merge two runs by their fronts",
      body: [
        "To merge two sorted runs, look only at the front of each and take the smaller. The runs `6` and `3` have fronts `6` and `3`, so `3` goes first and then `6`.",
        "Because each run is sorted, the smaller front is the smallest remaining item overall; we never need to look deeper.",
      ],
      metrics: [
        { label: "Runs", value: "8" },
        { label: "Items placed", value: "0", level: "good" },
      ],
      lines: [9, 10],
      scene: scene(
        title("merge 6 and 3: compare the fronts"),
        place(
          ALL.map((v) => [v]),
          150,
          (v) => (v === 6 || v === 3 ? "active" : undefined),
        ),
        note("3 < 6, so 3 is taken first"),
      ),
    },
    {
      short: "Pairs merged",
      title: "Every pair merged",
      body: [
        "Merging each neighbouring pair gives four sorted runs of two: `3 6`, `2 8`, `1 7` and `4 5`.",
        "This level touched all 8 items exactly once, so it cost about 8 steps of work.",
      ],
      metrics: [
        { label: "Runs", value: "4" },
        { label: "Run size", value: "2" },
        { label: "Items placed", value: "8", level: "good" },
      ],
      lines: [6],
      scene: scene(
        title("sorted runs of 2"),
        place(
          [
            [3, 6],
            [2, 8],
            [1, 7],
            [4, 5],
          ],
          150,
          () => "mark",
        ),
      ),
    },
    {
      short: "Merge runs",
      title: "Merging longer runs",
      body: [
        "Merge `3 6` with `2 8`. The fronts are `3` and `2`: take `2`; then `3` and `8`: take `3`. Now the output holds `2 3`, and the fronts left are `6` and `8`, so `6` is next.",
        "Each comparison places one item, so merging two runs of total size m costs at most m - 1 comparisons.",
      ],
      callout: {
        kind: "tip",
        text: "Ties: when the two fronts are equal, take the left one. That one rule makes merge sort stable.",
      },
      metrics: [
        { label: "Runs", value: "4" },
        { label: "Items placed", value: "10", level: "good" },
      ],
      lines: [9, 10],
      scene: scene(
        title("merging 3 6 with 2 8: output so far"),
        place([[6], [8]], 85, () => "active"),
        place([[2, 3]], 190, () => "mark"),
        place(
          [
            [1, 7],
            [4, 5],
          ],
          260,
          () => "muted",
        ),
        note("6 vs 8: take 6", 130),
      ),
    },
    {
      short: "Runs of four",
      title: "The next level up",
      body: [
        "Finishing those merges (and merging `1 7` with `4 5`) gives two sorted runs of four: `2 3 6 8` and `1 4 5 7`.",
        "Again every item was handled once, so this level also cost about 8 steps. The cost per level stays the same because runs get longer exactly as fast as they get fewer.",
      ],
      metrics: [
        { label: "Runs", value: "2" },
        { label: "Run size", value: "4" },
        { label: "Items placed", value: "16", level: "good" },
      ],
      lines: [6],
      scene: scene(
        title("sorted runs of 4"),
        place(
          [
            [2, 3, 6, 8],
            [1, 4, 5, 7],
          ],
          150,
          () => "mark",
        ),
      ),
    },
    {
      short: "Sorted",
      title: "One last merge",
      body: [
        "The fronts `2` and `1` start the final merge: take `1`, then `2`, `3`, `4` and so on, always the smaller front.",
        "The result is `1 2 3 4 5 6 7 8`. Three levels of merging, each placing 8 items, is 24 steps in total.",
      ],
      metrics: [
        { label: "Runs", value: "1" },
        { label: "Run size", value: "8" },
        { label: "Items placed", value: "24", level: "good" },
      ],
      lines: [9, 10, 11],
      scene: scene(
        title("sorted"),
        place([[1, 2, 3, 4, 5, 6, 7, 8]], 150, () => "done"),
      ),
    },
    {
      short: "The cost",
      title: "O(n log n) time, O(n) memory",
      body: [
        "There are log2(n) levels (3 for 8 items) and each level does O(n) work, so the time is O(n log n) in every case, even on already sorted input.",
        "The price is the output buffer: merging needs space for the merged run, so merge sort uses O(n) extra memory. In exchange it is stable and its speed never degrades.",
      ],
      callout: {
        kind: "warn",
        text: "Unlike insertion sort, merge sort does not get faster on nearly sorted data unless you add a shortcut.",
      },
      metrics: [
        { label: "Items placed", value: "n log n", level: "good" },
        { label: "Extra memory", value: "O(n)", level: "warn" },
      ],
      scene: scene(
        label("c1", 320, 75, "8 items -> 3 levels of merging", { size: 14, weight: 800 }),
        label("c2", 320, 120, "each level handles all n items", { size: 13, tone: "muted" }),
        label("c3", 320, 170, "n x log2(n) = 8 x 3 = 24", { size: 15, weight: 800, tone: "good" }),
        label("c4", 320, 225, "1,000,000 items: about 20 levels, 20 million steps", { size: 13 }),
      ),
    },
  ],
};
