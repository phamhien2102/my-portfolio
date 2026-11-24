import { label, ptr, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const STREAM = [5, 12, 3, 9, 14, 7, 1, 10];
const SKIPPED = [7, 1];

/** The stream on top (done / skipped / current) and the size-3 min-heap below it. */
function view(
  seen: number,
  heap: number[],
  opts: { cur?: number; tones?: Record<number, Tone>; note?: string } = {},
) {
  const { cur, tones = {}, note } = opts;
  return scene(
    row(STREAM, {
      id: "s",
      y: 50,
      w: 38,
      gap: 6,
      tones: (i) =>
        i === cur
          ? "active"
          : i < seen
            ? SKIPPED.includes(STREAM[i])
              ? "muted"
              : "done"
            : undefined,
    }),
    label("ls", 320, 14, "stream, k = 3", { tone: "muted", size: 12 }),
    heap.length
      ? [
          ...tree(heap, { y: 125, width: 130, dy: 56, r: 20, keys: heap, tones }),
          ptr("gate", `t${heap[0]}`, "root", { side: "left" }),
        ]
      : label("empty", 320, 150, "empty heap", { tone: "muted" }),
    label("arr", 320, 255, `heap array: [${heap.join(", ")}]`, { size: 13, weight: 800 }),
    note && label("note", 320, 290, note, { size: 13, weight: 800, tone: "good" }),
  );
}

export const topK: AlgoLesson = {
  id: "top-k",
  title: "Top-K Problems",
  summary:
    "Keep the k largest items of a stream with a small min-heap instead of sorting everything.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "Why a min-heap finds the k largest items",
    "How the root acts as a gate for new items",
    "The cost: O(n log k) time and O(k) memory",
    "When this beats sorting the whole input",
  ],
  takeaways: [
    "To keep the k largest items, use a min-heap of size k: its root is the smallest of the current best, so it is the first to be replaced.",
    "A new item either loses to the root and is skipped in O(1), or replaces it and sifts down in O(log k).",
    "That gives O(n log k) time and O(k) memory, which beats sorting everything when k is much smaller than n.",
  ],
  hud: [
    { label: "Seen", icon: "list" },
    { label: "Heap size", icon: "layers" },
    { label: "Gate", icon: "shield" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "topK(stream, k):",
    "    heap = empty min-heap",
    "    for x in stream:",
    "        if size(heap) < k:",
    "            push x onto heap",
    "        else if x > root(heap):",
    "            replace root with x and sift it down",
    "        else: skip x",
    "    return the items in heap",
  ],
  steps: [
    {
      short: "The task",
      title: "The 3 largest of a stream",
      body: [
        "Numbers arrive one at a time, and we want the three largest seen so far. We cannot afford to store and sort millions of values.",
        "Here the stream is `5, 12, 3, 9, 14, 7, 1, 10` and `k = 3`. The expected answer at the end is `14, 12, 10`.",
      ],
      metrics: [
        { label: "Seen", value: "0" },
        { label: "Heap size", value: "0" },
        { label: "Gate", value: "—" },
      ],
      scene: view(0, []),
    },
    {
      short: "Fill",
      title: "Use a min-heap of size k",
      body: [
        "Our candidates live in a min-heap capped at `k = 3` items. The first three values, `5`, `12` and `3`, go straight in. The smallest, `3`, ends up at the root.",
        "A min-heap sounds backwards for finding the largest, but it is exactly right: the root is the weakest of the current best three, so it is the one to beat.",
      ],
      callout: {
        kind: "insight",
        text: "The root is a gate. Any new value smaller than it cannot be among the top k.",
      },
      metrics: [
        { label: "Seen", value: "3" },
        { label: "Heap size", value: "3" },
        { label: "Gate", value: "3" },
      ],
      lines: [4, 5],
      scene: view(3, [3, 12, 5]),
    },
    {
      short: "9 arrives",
      title: "Compare with the root",
      body: [
        "The next value is `9`. Compare it with the root `3`: `9 > 3`, so `9` belongs among the top three and `3` does not.",
        "The comparison is one `O(1)` check against the gate.",
      ],
      metrics: [
        { label: "Seen", value: "4" },
        { label: "Heap size", value: "3" },
        { label: "Gate", value: "3" },
      ],
      lines: [6],
      scene: view(4, [3, 12, 5], {
        cur: 3,
        tones: { 0: "active" },
        note: "9 > 3: it beats the root",
      }),
    },
    {
      short: "Replace",
      title: "Overwrite the root",
      body: [
        "Drop `3` and put `9` at the root. The size stays at `3`.",
        "But `9` is now above `5`, a smaller child, so the heap property is broken at the top and `9` must sift down.",
      ],
      metrics: [
        { label: "Seen", value: "4" },
        { label: "Heap size", value: "3" },
        { label: "Gate", value: "9?", level: "warn" },
      ],
      lines: [7],
      scene: view(4, [9, 12, 5], {
        cur: 3,
        tones: { 0: "warn", 2: "active" },
        note: "root replaced; 9 > child 5",
      }),
    },
    {
      short: "Sift down",
      title: "Restore the heap",
      body: [
        "Swap `9` with its smaller child `5`. Now the root is `5`, the smallest of `5, 12, 9`, and the gate is correct again.",
        "A sift down on a heap of size `k` walks at most `log2 k` levels, so replacing the root costs `O(log k)`.",
      ],
      metrics: [
        { label: "Seen", value: "4" },
        { label: "Heap size", value: "3" },
        { label: "Gate", value: "5" },
      ],
      lines: [7],
      scene: view(4, [5, 12, 9], { tones: { 0: "found" }, note: "top 3 so far: 5, 9, 12" }),
    },
    {
      short: "14 arrives",
      title: "Another winner",
      body: [
        "`14 > 5`, so it also beats the gate. It replaces the root and sifts down past the smaller child `9`: the heap becomes `9, 12, 14`.",
        "The gate rises from `5` to `9`. Each accepted value raises or keeps the gate, so it gets harder and harder to get in.",
      ],
      metrics: [
        { label: "Seen", value: "5" },
        { label: "Heap size", value: "3" },
        { label: "Gate", value: "9" },
      ],
      lines: [6, 7],
      scene: view(5, [9, 12, 14], { cur: 4, tones: { 0: "found" }, note: "gate is now 9" }),
    },
    {
      short: "Skips",
      title: "Most items cost almost nothing",
      body: [
        "Next come `7` and `1`. Both are smaller than the gate `9`, so they are skipped after one comparison. The heap is not touched.",
        "On a long stream most values are rejected like this, which is part of why the method is fast in practice.",
      ],
      callout: {
        kind: "tip",
        text: "A rejected item costs O(1). Only accepted items pay O(log k).",
      },
      metrics: [
        { label: "Seen", value: "7" },
        { label: "Heap size", value: "3" },
        { label: "Gate", value: "9" },
        { label: "Cost", value: "2 × O(1)", level: "good" },
      ],
      lines: [6, 8],
      scene: view(7, [9, 12, 14], { tones: { 0: "found" }, note: "7 < 9 and 1 < 9: skipped" }),
    },
    {
      short: "10 arrives",
      title: "The final answer",
      body: [
        "The last value `10` beats the gate `9`, replaces it, and settles at the root without sifting, because `10` is already smaller than `12` and `14`.",
        "The heap now holds `10, 12, 14`, exactly the three largest values. Read them out in any order, or sort just these three.",
      ],
      metrics: [
        { label: "Seen", value: "8" },
        { label: "Heap size", value: "3" },
        { label: "Gate", value: "10" },
      ],
      lines: [6, 7],
      scene: view(8, [10, 12, 14], {
        cur: 7,
        tones: { 0: "found", 1: "found", 2: "found" },
        note: "top 3: 14, 12, 10",
      }),
    },
    {
      short: "Cost",
      title: "O(n log k) versus sorting",
      body: [
        "Each of the `n` items costs one comparison, plus at most one `O(log k)` heap update, so the total is `O(n log k)` time with only `O(k)` memory.",
        "Sorting everything costs `O(n log n)` time and needs all `n` items in memory, and it cannot work on an endless stream. For `k = 10` out of a billion items, `log k` is about 3 and `log n` is about 30.",
      ],
      callout: {
        kind: "warn",
        text: "For the k smallest, flip it: use a max-heap of size k and compare with its root.",
      },
      metrics: [
        { label: "Seen", value: "n" },
        { label: "Heap size", value: "k" },
        { label: "Cost", value: "O(n log k)", level: "good" },
      ],
      scene: scene(
        label("c1", 320, 80, "min-heap of size k:  O(n log k) time, O(k) memory", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("c2", 320, 140, "sort everything:  O(n log n) time, O(n) memory", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        label("c3", 320, 200, "the gap grows as k gets small compared with n", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
  ],
};
