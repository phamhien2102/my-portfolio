import { bars, frame, label, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

/** Bars keyed by value so partition swaps slide; `tones` is by index. */
function view(
  vals: number[],
  msg: string,
  tones: Record<number, Tone> = {},
  tone: "ink" | "good" = "ink",
): Item[] {
  return [
    label("msg", 320, 50, msg, { size: 13, weight: 800, tone }),
    ...bars(vals, { keys: vals, index: true, y: 205, tones }),
  ];
}

const START = [7, 2, 9, 4, 1, 8, 5];
const P1 = [2, 4, 1, 5, 9, 8, 7]; // after partitioning around 5

export const quickselect: AlgoLesson = {
  id: "quickselect",
  title: "Quickselect",
  summary: "Find the k-th smallest by partitioning and recursing into only the side that holds it.",
  minutes: 12,
  level: "advanced",
  goals: [
    "How to find the k-th smallest without sorting everything",
    "Why only one side needs to be explored",
    "Why the average cost is O(n)",
    "How the median is just another k",
  ],
  takeaways: [
    "After a partition the pivot sits at its final index, so comparing that index with k tells you which side holds the answer.",
    "Quickselect recurses into one side only, so the sizes shrink geometrically and the average cost is n + n/2 + n/4 + ... = O(n).",
    "Sorting everything costs O(n log n); when you need just one rank, such as the median, quickselect is faster, though its worst case is O(n²).",
  ],
  hud: [
    { label: "Items left", icon: "list" },
    { label: "Pivot index", icon: "search" },
    { label: "Scans", icon: "timer" },
    { label: "Full sort", icon: "gauge" },
  ],
  pseudocode: [
    "quickselect(a, lo, hi, k):",
    "    if lo == hi: return a[lo]",
    "    p = partition(a, lo, hi)",
    "    if p == k: return a[p]",
    "    if k < p: return quickselect(a, lo, p - 1, k)",
    "    return quickselect(a, p + 1, hi, k)",
    "partition(a, lo, hi):  # as in quick sort, pivot = a[hi]",
  ],
  steps: [
    {
      short: "The problem",
      title: "Only the 2nd smallest, please",
      body: [
        "In `7 2 9 4 1 8 5`, which value is the 2nd smallest? Sorting would answer it, but that orders every bar when we only care about one rank.",
        "With zero-based indexes, the 2nd smallest ends up at index `k - 1 = 1` of the sorted array. Quick sort's partition lets us find it without sorting the rest.",
      ],
      metrics: [
        { label: "Items left", value: "7", level: "warn" },
        { label: "Full sort", value: "O(n log n)", level: "warn" },
      ],
      scene: scene(view(START, "target: index 1 of the sorted order (2nd smallest)")),
    },
    {
      short: "Partition",
      title: "Partition around a pivot",
      body: [
        "Partition exactly as in quick sort, using the last value `5` as pivot: smaller values go left, larger go right. The result is `2 4 1 | 5 | 9 8 7`.",
        "The `5` now sits at index 3, its final sorted position, after one scan of 6 comparisons.",
      ],
      metrics: [
        { label: "Items left", value: "7", level: "warn" },
        { label: "Pivot index", value: "3" },
        { label: "Scans", value: "6", level: "good" },
      ],
      lines: [3, 7],
      scene: scene(view(P1, "pivot 5 lands at index 3", { 3: "done" })),
    },
    {
      short: "Pick a side",
      title: "Is the answer left or right?",
      body: [
        "We want index 1 and the pivot is at index 3. Index 1 is smaller than 3, so the 2nd smallest is among the three values on the left.",
        "Everything right of the pivot is larger than it, so those four values cannot be the answer. They are discarded for good.",
      ],
      callout: {
        kind: "insight",
        text: "This is the difference from quick sort: it recurses on both sides, quickselect on one.",
      },
      metrics: [
        { label: "Items left", value: "3", level: "good" },
        { label: "Pivot index", value: "3" },
        { label: "Scans", value: "6", level: "good" },
      ],
      lines: [4, 5],
      scene: scene(
        view(P1, "target index 1 < 3: keep the left side", {
          3: "done",
          4: "muted",
          5: "muted",
          6: "muted",
        }),
        frame("f", 164, 62, 136, 172, "still possible"),
      ),
    },
    {
      short: "Partition 2",
      title: "Partition the left side",
      body: [
        "Repeat on `2 4 1` with pivot `1`. Nothing is smaller, so the pivot swaps to the front: `1 4 2`, pivot at index 0.",
        "That scan cost only 2 comparisons, because the part is much shorter.",
      ],
      metrics: [
        { label: "Items left", value: "3", level: "good" },
        { label: "Pivot index", value: "0" },
        { label: "Scans", value: "8", level: "good" },
      ],
      lines: [3],
      scene: scene(
        view([1, 4, 2, 5, 9, 8, 7], "pivot 1 lands at index 0", {
          0: "done",
          3: "done",
          4: "muted",
          5: "muted",
          6: "muted",
        }),
      ),
    },
    {
      short: "Go right",
      title: "This time the answer is to the right",
      body: [
        "The target index is 1 and the pivot is at 0. Index 1 is larger than 0, so the answer is among the values right of the pivot but inside the live part: `4 2`.",
        "The `1` is the smallest, so it cannot be the 2nd smallest. We discard it and keep only two bars.",
      ],
      metrics: [
        { label: "Items left", value: "2", level: "good" },
        { label: "Pivot index", value: "0" },
        { label: "Scans", value: "8", level: "good" },
      ],
      lines: [4, 6],
      scene: scene(
        view([1, 4, 2, 5, 9, 8, 7], "target index 1 > 0: keep the right side", {
          0: "muted",
          3: "done",
          4: "muted",
          5: "muted",
          6: "muted",
        }),
        frame("f", 208, 62, 92, 172, "still possible"),
      ),
    },
    {
      short: "Found it",
      title: "The pivot lands on k - 1",
      body: [
        "Partition `4 2` with pivot `2`: `4` is larger, so the pivot swaps in front. It lands at index 1, which is exactly the index we wanted.",
        "So the 2nd smallest value is `2`. We never sorted the rest of the array, and `9 8 7` was never touched again.",
      ],
      metrics: [
        { label: "Items left", value: "1", level: "good" },
        { label: "Pivot index", value: "1", level: "good" },
        { label: "Scans", value: "9", level: "good" },
      ],
      lines: [4],
      scene: scene(
        view(
          [1, 2, 4, 5, 9, 8, 7],
          "index 1 holds 2: the answer",
          {
            0: "muted",
            1: "found",
            4: "muted",
            5: "muted",
            6: "muted",
          },
          "good",
        ),
      ),
    },
    {
      short: "Cost",
      title: "Why the average is O(n)",
      body: [
        "The live part shrank 7, 3, 2: we scanned 6, then 2, then 1 comparisons. With reasonably balanced pivots each round halves the live part, so the total is about n + n/2 + n/4 + ... which is less than 2n.",
        "Sorting the whole array would cost about n log n; for a million items that is roughly 20 times more.",
      ],
      callout: {
        kind: "warn",
        text: "A consistently bad pivot (always the smallest or largest) shrinks the part by one each time: O(n²). Random pivots avoid it in practice.",
      },
      metrics: [
        { label: "Scans", value: "n + n/2 + ...", level: "good" },
        { label: "Full sort", value: "n log n", level: "warn" },
      ],
      scene: scene(
        label("c1", 320, 75, "live part: 7 -> 3 -> 2 -> 1", { size: 14, weight: 800 }),
        label("c2", 320, 125, "work: n + n/2 + n/4 + ... < 2n", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("c3", 320, 185, "full sort of a million items: about 20 million steps", {
          size: 13,
          tone: "muted",
        }),
        label("c4", 320, 220, "quickselect on a million: about 2 million", {
          size: 13,
          tone: "good",
        }),
      ),
    },
    {
      short: "The median",
      title: "The median is just k = 4",
      body: [
        "The median of 7 values is the 4th smallest, so `k - 1 = 3`. The very first partition above put the pivot `5` at index 3, so the median is `5` after one scan and no recursion.",
        "That is why quickselect is the standard tool for medians and percentiles: change `k`, keep the code.",
      ],
      callout: {
        kind: "tip",
        text: "The same idea answers 'the top k items' without a full sort, because everything left of the final pivot is smaller.",
      },
      metrics: [
        { label: "Pivot index", value: "3", level: "good" },
        { label: "Scans", value: "6", level: "good" },
      ],
      lines: [3, 4],
      scene: scene(view(P1, "median (k = 4): index 3 holds 5", { 3: "found" }, "good")),
    },
  ],
};
