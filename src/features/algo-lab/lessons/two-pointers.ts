import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const A = [1, 3, 4, 6, 8, 11, 15];
const TARGET = 14;

/** Opposite-ends search: l and r on the sorted array, with the current sum. */
function pair(l: number, r: number, note: string, found = false) {
  const tone = found ? "found" : "active";
  return scene(
    label("target", 320, 60, `find two numbers that add to ${TARGET}`, { size: 14, weight: 800 }),
    row(A, {
      y: 150,
      index: true,
      tones: (i) => (i === l || i === r ? tone : i < l || i > r ? "muted" : undefined),
    }),
    ptr("l", `a${l}`, "l", { tone }),
    ptr("r", `a${r}`, "r", { tone }),
    label("sum", 320, 250, note, { size: 15, weight: 800, tone: found ? "good" : "ink" }),
  );
}

const D = [1, 1, 2, 2, 3];

/** Same-direction dedupe: `slow` is the write spot, `fast` the read spot. */
function dedupe(vals: number[], slow: number, fast: number, note: string, fastTone = "active") {
  return scene(
    label("t", 320, 60, "remove duplicates in place", { size: 14, weight: 800 }),
    row(vals, {
      y: 150,
      index: true,
      tones: (i) =>
        i === fast ? (fastTone as "active") : i === slow ? "mark" : i < slow ? "done" : undefined,
    }),
    ptr("slow", `a${slow}`, "slow", { side: "below", tone: "mark" }),
    ptr("fast", `a${fast}`, "fast", { side: "above", tone: "active" }),
    label("note", 320, 250, note, { size: 14, weight: 800 }),
  );
}

export const twoPointers: AlgoLesson = {
  id: "two-pointers",
  title: "Two Pointers",
  summary: "Walk two indexes through an array so one pass replaces a nested loop.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "Opposite-end pointers on a sorted array",
    "How the sum tells you which pointer to move",
    "Same-direction pointers to rewrite an array in place",
    "Why this beats checking every pair",
  ],
  takeaways: [
    "On a sorted array, a too-big sum means move the right pointer left, a too-small sum means move the left one right.",
    "A slow write pointer and a fast read pointer can compact an array in place with O(1) extra space.",
    "Each pointer only moves one way, so the pass is O(n) instead of the O(n squared) of trying every pair.",
  ],
  hud: [
    { label: "Pairs checked", icon: "search" },
    { label: "Sum", icon: "sigma" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "pairSum(a, target):",
    "    l = 0, r = n - 1",
    "    while l < r:",
    "        s = a[l] + a[r]",
    "        if s == target: return l, r",
    "        if s > target: r = r - 1",
    "        else: l = l + 1",
    "dedupe(a):",
    "    slow = 0",
    "    for fast from 1 to n - 1:",
    "        if a[fast] != a[slow]:",
    "            slow = slow + 1",
    "            a[slow] = a[fast]",
    "    return slow + 1",
  ],
  steps: [
    {
      short: "The problem",
      title: "Find a pair that adds to 14",
      body: [
        "The array is sorted: `1, 3, 4, 6, 8, 11, 15`. We want two different elements whose sum is `14`.",
        "The obvious way tries every pair with two nested loops: for 7 numbers that is 21 pairs, and the count grows with the square of the length.",
      ],
      metrics: [{ label: "Cost", value: "O(n²) naive", level: "warn" }],
      scene: scene(
        label("target", 320, 60, `find two numbers that add to ${TARGET}`, {
          size: 14,
          weight: 800,
        }),
        row(A, { y: 150, index: true }),
      ),
    },
    {
      short: "Both ends",
      title: "Start at the two ends",
      body: [
        "Put `l` at index 0 and `r` at the last index. These hold the smallest and the largest value.",
        "Their sum is `1 + 15 = 16`. That is more than 14.",
      ],
      metrics: [
        { label: "Pairs checked", value: "1" },
        { label: "Sum", value: "16", level: "warn" },
      ],
      lines: [2, 3, 4],
      scene: pair(0, 6, "1 + 15 = 16 (too big)"),
    },
    {
      short: "Too big",
      title: "Too big: move r left",
      body: [
        "`15` is the largest number, and even with the smallest partner `1` it overshoots. So `15` can never be part of the answer and we can discard it.",
        "Move `r` one step left, to `11`. The sorted order is what guarantees this.",
      ],
      callout: {
        kind: "insight",
        text: "One comparison rules out an entire element, here 15 with every possible partner.",
      },
      metrics: [
        { label: "Pairs checked", value: "2" },
        { label: "Sum", value: "12", level: "good" },
      ],
      lines: [6],
      scene: pair(0, 5, "1 + 11 = 12 (too small)"),
    },
    {
      short: "Too small",
      title: "Too small: move l right",
      body: [
        "`12` is below 14. Now `1` is the problem: even paired with the largest remaining value `11` it falls short, so `1` is out.",
        "Move `l` one step right, to `3`.",
      ],
      metrics: [
        { label: "Pairs checked", value: "3" },
        { label: "Sum", value: "14", level: "good" },
      ],
      lines: [7],
      scene: pair(1, 5, "3 + 11 = 14"),
    },
    {
      short: "Found",
      title: "The sum matches",
      body: [
        "`3 + 11 = 14`, the target. We stop and return indexes 1 and 5.",
        "Only three pairs were examined. If `l` and `r` ever meet, no pair exists.",
      ],
      callout: {
        kind: "warn",
        text: "This relies on sorted input. On unsorted data a sum no longer says which side to move, so sort first or use a hash set.",
      },
      metrics: [
        { label: "Pairs checked", value: "3" },
        { label: "Sum", value: "14", level: "good" },
      ],
      lines: [5],
      scene: pair(1, 5, "3 + 11 = 14: found", true),
    },
    {
      short: "Why faster",
      title: "Why it beats nested loops",
      body: [
        "Every step moves `l` right or `r` left and neither ever goes back. Together they travel at most n steps before meeting, so the cost is `O(n)`.",
        "The nested loops need about n²/2 pairs. The pointers skip pairs they have proved useless, and the extra memory is just two integers.",
      ],
      metrics: [
        { label: "Pairs checked", value: "≤ n" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      scene: scene(
        label("a", 320, 90, "nested loops: n × n / 2 pairs", {
          size: 14,
          tone: "warn",
          weight: 800,
        }),
        label("b", 320, 145, "two pointers: at most n moves", {
          size: 14,
          tone: "good",
          weight: 800,
        }),
        label("c", 320, 200, "7 numbers: 21 pairs versus 6 moves", { size: 13, tone: "muted" }),
      ),
    },
    {
      short: "Same direction",
      title: "Pointers that both go right",
      body: [
        "A second pattern: remove duplicates from a sorted array in place. `fast` reads every element; `slow` marks where the next unique value will be written.",
        "Start with `slow = 0` and `fast = 1`. Everything up to `slow` is the unique prefix built so far.",
      ],
      metrics: [{ label: "Cost", value: "O(n)", level: "good" }],
      lines: [9, 10, 11],
      scene: dedupe(D, 0, 1, "a[fast] = 1 equals a[slow]: skip"),
    },
    {
      short: "Copy new",
      title: "A new value: write it",
      body: [
        "`fast` moves on to index 2, the value `2`, which differs from `a[slow] = 1`. So it is new.",
        "Advance `slow` to index 1 and copy `2` there. The unique prefix is now `1, 2`.",
      ],
      metrics: [{ label: "Cost", value: "O(n)", level: "good" }],
      lines: [11, 12, 13],
      scene: dedupe([1, 2, 2, 2, 3], 1, 2, "new value 2: slow = 1, write 2", "found"),
    },
    {
      short: "Finish",
      title: "Skip the repeat, take the last",
      body: [
        "`fast` skips the second `2` since it equals `a[slow]`. At the `3` it differs, so `slow` becomes 2 and `3` is written.",
        "The answer is the first `slow + 1 = 3` elements: `1, 2, 3`. One pass, no extra array: `O(n)` time and `O(1)` space.",
      ],
      callout: {
        kind: "tip",
        text: "Slow is the write head, fast is the read head. The same shape solves removing a value, moving zeros and partitioning.",
      },
      metrics: [
        { label: "Sum", value: "unique = 3" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [11, 12, 13, 14],
      scene: scene(
        label("t", 320, 60, "remove duplicates in place", { size: 14, weight: 800 }),
        row([1, 2, 3, 2, 3], {
          y: 150,
          index: true,
          tones: (i) => (i < 3 ? "done" : "muted"),
        }),
        ptr("slow", "a2", "slow", { side: "below", tone: "mark" }),
        label("note", 320, 250, "unique length = slow + 1 = 3", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
