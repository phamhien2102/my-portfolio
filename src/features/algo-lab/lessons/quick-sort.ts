import { bars, frame, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const LAST = 7;

interface View {
  vals: number[];
  /** Next slot for a value smaller than the pivot. */
  s: number;
  /** Scan position (undefined before the scan starts). */
  j?: number;
  /** True when j is the element being decided right now. */
  cur?: boolean;
  msg: string;
}

/** Partition snapshot: smaller values green on the left, larger ones faded, pivot marked. */
function view({ vals, s, j, cur, msg }: View) {
  const tone = (i: number): Tone | undefined => {
    if (i === LAST) return "mark";
    if (i < s) return "found";
    if (j !== undefined && i <= j) return cur && i === j ? "active" : "muted";
    return undefined;
  };
  return scene(
    label("msg", 320, 50, msg, { size: 13, weight: 800 }),
    bars(vals, { keys: vals, index: true, y: 205, tones: tone }),
    j !== undefined && ptr("j", `b${vals[j]}`, "j", { side: "above", tone: "active" }),
    ptr("s", `b${vals[s]}`, "s", { tone: "found" }),
  );
}

export const quickSort: AlgoLesson = {
  id: "quick-sort",
  title: "Quick Sort",
  summary:
    "Pick a pivot, partition smaller values left and larger right, then sort each side the same way.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "What a pivot and a partition are",
    "How two pointers partition an array in one scan",
    "Why the pivot lands in its final place",
    "Why the average is O(n log n) but the worst case is O(n²)",
  ],
  takeaways: [
    "Partitioning puts every smaller value left of the pivot and every larger value right, which fixes the pivot's final position.",
    "Sort the left and right parts recursively; no merging is needed and it works in place with O(log n) average stack.",
    "Balanced splits give O(n log n); a pivot that is always the smallest or largest gives O(n²), so choose pivots carefully.",
  ],
  hud: [
    { label: "Scanned", icon: "search" },
    { label: "Pivot at", icon: "gauge" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "quick_sort(a, lo, hi):",
    "    if lo >= hi: return",
    "    pivot = a[hi], s = lo",
    "    for j in lo .. hi - 1:",
    "        if a[j] < pivot:",
    "            swap a[j] and a[s], s = s + 1",
    "    swap a[s] and a[hi]",
    "    quick_sort(a, lo, s - 1)",
    "    quick_sort(a, s + 1, hi)",
  ],
  steps: [
    {
      short: "The problem",
      title: "Sort by splitting around a value",
      body: [
        "Take `5 2 8 1 7 3 6 4`. Quick sort does not merge. Instead it picks one value, the pivot, and rearranges the array so everything smaller is on its left and everything larger on its right.",
        "After that single rearrangement the pivot is already where it belongs.",
      ],
      metrics: [{ label: "Scanned", value: "0", level: "good" }],
      scene: scene(
        label("msg", 320, 50, "unsorted", { size: 13, weight: 800 }),
        bars([5, 2, 8, 1, 7, 3, 6, 4], { keys: [5, 2, 8, 1, 7, 3, 6, 4], index: true, y: 205 }),
      ),
    },
    {
      short: "Pick pivot",
      title: "Choose the pivot",
      body: [
        "Use the last value, `4`, as the pivot. Two markers do the work: `j` scans left to right, and `s` marks the next slot where a smaller value should go.",
        "Everything left of `s` will be smaller than the pivot.",
      ],
      callout: {
        kind: "tip",
        text: "The last element is the simplest pivot to explain; real implementations often choose a random or median-of-three one.",
      },
      metrics: [
        { label: "Scanned", value: "0", level: "good" },
        { label: "Pivot at", value: "last" },
      ],
      lines: [3],
      scene: view({ vals: [5, 2, 8, 1, 7, 3, 6, 4], s: 0, msg: "pivot = 4" }),
    },
    {
      short: "5 stays",
      title: "A larger value is skipped",
      body: [
        "`j` looks at `5`. It is not smaller than the pivot, so it stays where it is, and `s` stays at index 0 too: the slot waits for a smaller value.",
      ],
      metrics: [{ label: "Scanned", value: "1", level: "good" }],
      lines: [4, 5],
      scene: view({
        vals: [5, 2, 8, 1, 7, 3, 6, 4],
        s: 0,
        j: 0,
        cur: true,
        msg: "5 >= 4: leave it",
      }),
    },
    {
      short: "2 moves",
      title: "A smaller value jumps to s",
      body: [
        "`j` reaches `2`, which is smaller than `4`. Swap it with the bar at `s` (the `5`), and advance `s` to index 1.",
        "The `5` is pushed into the larger zone, and the smaller zone grew by one.",
      ],
      metrics: [{ label: "Scanned", value: "2", level: "good" }],
      lines: [5, 6],
      scene: view({
        vals: [2, 5, 8, 1, 7, 3, 6, 4],
        s: 1,
        j: 1,
        msg: "2 < 4: swap with the slot, s moves on",
      }),
    },
    {
      short: "1 moves",
      title: "Keep scanning",
      body: [
        "`8` is larger and is skipped. `1` is smaller, so swap it with the bar at `s` (the `5`) and advance `s` to index 2.",
      ],
      metrics: [{ label: "Scanned", value: "4", level: "good" }],
      lines: [5, 6],
      scene: view({ vals: [2, 1, 8, 5, 7, 3, 6, 4], s: 2, j: 3, msg: "1 < 4: swap with the slot" }),
    },
    {
      short: "3 moves",
      title: "The last small value",
      body: [
        "`7` is skipped, `3` is smaller and swaps with the bar at `s` (the `8`); `s` becomes 3. The final `6` is larger, so it stays.",
        "The scan ends with all values smaller than `4` packed in front: `2 1 3`.",
      ],
      metrics: [{ label: "Scanned", value: "7", level: "good" }],
      lines: [5, 6],
      scene: view({
        vals: [2, 1, 3, 5, 7, 8, 6, 4],
        s: 3,
        j: 6,
        msg: "scan finished: 2 1 3 are smaller than 4",
      }),
    },
    {
      short: "Pivot lands",
      title: "Drop the pivot into place",
      body: [
        "Swap the pivot with the bar at `s`, index 3. Now `2 1 3` are to its left, `7 8 6 5` to its right.",
        "The `4` is in its final sorted position: nothing left of it is bigger and nothing right of it is smaller, so it never moves again.",
      ],
      callout: {
        kind: "insight",
        text: "One scan of n items places one value permanently and splits the rest into two independent problems.",
      },
      metrics: [
        { label: "Scanned", value: "7", level: "good" },
        { label: "Pivot at", value: "index 3", level: "good" },
      ],
      lines: [7],
      scene: scene(
        label("msg", 320, 50, "4 is in its final place", { size: 13, weight: 800, tone: "good" }),
        bars([2, 1, 3, 4, 7, 8, 6, 5], {
          keys: [2, 1, 3, 4, 7, 8, 6, 5],
          index: true,
          y: 205,
          tones: (i) => (i === 3 ? "done" : undefined),
        }),
      ),
    },
    {
      short: "Recurse",
      title: "Sort each side the same way",
      body: [
        "Repeat on `2 1 3` and on `7 8 6 5`: pick a pivot, partition, recurse. A part of length 0 or 1 is already sorted and stops the recursion.",
        "The two sides never need to be merged, because everything on the left is already smaller than everything on the right.",
      ],
      metrics: [{ label: "Pivot at", value: "index 3", level: "good" }],
      lines: [2, 8, 9],
      scene: scene(
        label("msg", 320, 50, "sort the left part, then the right part", { size: 13, weight: 800 }),
        bars([2, 1, 3, 4, 7, 8, 6, 5], {
          keys: [2, 1, 3, 4, 7, 8, 6, 5],
          index: true,
          y: 205,
          tones: (i) => (i === 3 ? "done" : undefined),
        }),
        frame("fl", 142, 62, 136, 172, "left"),
        frame("fr", 318, 62, 180, 172, "right"),
      ),
    },
    {
      short: "Worst case",
      title: "When the pivot is bad",
      body: [
        "On an already sorted array like `1 2 3 4 5` with the last value as pivot, everything is smaller: the split is 4 and 0. The next call splits 3 and 0, and so on.",
        "That makes n levels of O(n) scans, so `O(n²)`. With balanced splits there are about log2(n) levels, giving the average `O(n log n)`. Random or median-of-three pivots make the bad case very unlikely.",
      ],
      callout: {
        kind: "warn",
        text: "Quick sort is not stable, and a naive pivot on sorted input is its famous trap.",
      },
      metrics: [
        { label: "Scanned", value: "4+3+2+1", level: "bad" },
        { label: "Cost", value: "O(n²)", level: "bad" },
      ],
      scene: scene(
        label("msg", 320, 50, "pivot 5 is the largest: split is 4 | 0", {
          size: 13,
          weight: 800,
          tone: "warn",
        }),
        bars([1, 2, 3, 4, 5], {
          keys: [1, 2, 3, 4, 5],
          index: true,
          y: 205,
          tones: (i) => (i === 4 ? "mark" : "found"),
        }),
      ),
    },
  ],
};
