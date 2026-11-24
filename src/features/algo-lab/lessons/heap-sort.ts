import { frame, label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const N = 7;

/** The heap part as a tree, the whole array as a row; the sorted suffix is settled and framed. */
function view(vals: number[], size: number, tones: Record<number, Tone> = {}, note = "") {
  const sortedFrame: Item[] =
    size < N
      ? [frame("sf", 144 + 50 * size, 228, 352 - 50 * size, 66, "sorted", { tone: "done" })]
      : [];
  return scene(
    size > 0 &&
      tree(vals.slice(0, size), {
        y: 40,
        width: 280,
        dy: 54,
        r: 18,
        keys: vals.slice(0, size),
        tones,
      }),
    row(vals, {
      id: "a",
      y: 250,
      w: 44,
      keys: vals,
      index: true,
      tones: (i) => (i >= size ? "done" : tones[i]),
    }),
    sortedFrame,
    label("lt", 36, 40, "heap", { anchor: "start", tone: "muted", size: 12 }),
    label("la", 36, 250, "array", { anchor: "start", tone: "muted", size: 12 }),
    note && label("note", 320, 325, note, { size: 13, weight: 800 }),
  );
}

export const heapSort: AlgoLesson = {
  id: "heap-sort",
  title: "Heap Sort",
  summary:
    "Sort in place by building a max-heap and repeatedly parking its root at the end of the array.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "How a max-heap sorts an array",
    "The swap, shrink and sift down loop",
    "How the sorted suffix grows from the right",
    "Why it is in place, O(n log n) and not stable",
  ],
  takeaways: [
    "Build a max-heap, then repeatedly swap the root with the last unsorted item, shrink the heap by one and sift down.",
    "The sorted part grows from the right end of the same array, so no extra memory is needed.",
    "Heap sort is O(n log n) in every case and in place, but it is not stable because the swaps jump over equal values.",
  ],
  hud: [
    { label: "Heap size", icon: "layers" },
    { label: "Sorted", icon: "check" },
    { label: "Swaps", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "heapSort(a):",
    "    build a max-heap from a",
    "    size = length of a",
    "    while size > 1:",
    "        swap a[0] with a[size - 1]",
    "        size = size - 1",
    "        siftDown(a, 0, size)",
    "siftDown(a, i, size):",
    "    repeat:",
    "        c = larger child of i (stop if none)",
    "        if a[i] >= a[c]: stop",
    "        swap a[i] with a[c]; i = c",
  ],
  steps: [
    {
      short: "The plan",
      title: "Use a heap to pull out the maximum",
      body: [
        "A max-heap keeps its largest value at the root. If we repeatedly take the largest value and park it at the end of the array, the array fills with the sorted order from right to left.",
        "The trick is that the heap and the sorted part share the same array: as the heap shrinks, its freed slots at the end hold the sorted values.",
      ],
      metrics: [
        { label: "Heap size", value: "7" },
        { label: "Sorted", value: "0" },
        { label: "Swaps", value: "0" },
      ],
      scene: view([6, 3, 8, 2, 5, 1, 7], 7, {}, "unsorted array: 6 3 8 2 5 1 7"),
    },
    {
      short: "Build",
      title: "Phase 1: build a max-heap",
      body: [
        "First rearrange the array into a max-heap with heapify: sift down from the last parent to the root, taking the larger child each time. This costs `O(n)`.",
        "The array `6 3 8 2 5 1 7` becomes `8 5 7 2 3 1 6`. Each parent is at least as large as its children, and the largest value `8` is at the root.",
      ],
      metrics: [
        { label: "Heap size", value: "7" },
        { label: "Sorted", value: "0" },
        { label: "Swaps", value: "3" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [2],
      scene: view([8, 5, 7, 2, 3, 1, 6], 7, { 0: "mark" }, "max-heap built in place"),
    },
    {
      short: "Swap",
      title: "Phase 2: swap the root to the end",
      body: [
        "The root `8` is the largest, so its final position is the last slot. Swap it with the last item of the heap, `6`.",
        "Now `8` is in its final place. We shrink the heap by one so it never touches that slot again. The new root `6` is probably too small for the top.",
      ],
      metrics: [
        { label: "Heap size", value: "6" },
        { label: "Sorted", value: "1" },
        { label: "Swaps", value: "4" },
      ],
      lines: [5, 6],
      scene: view(
        [6, 5, 7, 2, 3, 1, 8],
        6,
        { 0: "warn", 2: "active" },
        "8 is in its final slot; heap shrinks to 6",
      ),
    },
    {
      short: "Sift down",
      title: "Sift the new root down",
      body: [
        "Compare `6` with its children `5` and `7`, swap with the larger child, `7`, and continue. Here `6` lands at index `2`, whose only remaining child `1` is smaller, so it stops.",
        "The heap `7 5 6 2 3 1` is valid again, with its maximum `7` at the root. That repair costs `O(log n)`.",
      ],
      callout: {
        kind: "tip",
        text: "Sift down only inside the shrunken heap. Indexes at or past the heap size belong to the sorted part.",
      },
      metrics: [
        { label: "Heap size", value: "6" },
        { label: "Sorted", value: "1" },
        { label: "Swaps", value: "5" },
        { label: "Cost", value: "O(log n)" },
      ],
      lines: [7, 10, 11, 12],
      scene: view([7, 5, 6, 2, 3, 1, 8], 6, { 0: "found" }, "valid max-heap of size 6"),
    },
    {
      short: "Round 2",
      title: "Repeat: swap, shrink, sift",
      body: [
        "Swap the root `7` with the last heap item `1`, so `7` takes the second-to-last slot. Shrink the heap to five items, then sift `1` down: it swaps with the larger child `6`, and the heap becomes `6 5 1 2 3`.",
        "Every round puts one more value into its final place and leaves a smaller heap to repair.",
      ],
      metrics: [
        { label: "Heap size", value: "5" },
        { label: "Sorted", value: "2" },
        { label: "Swaps", value: "7" },
      ],
      lines: [4, 5, 6, 7],
      scene: view([6, 5, 1, 2, 3, 7, 8], 5, { 0: "found" }, "sorted suffix: 7 8"),
    },
    {
      short: "Round 4",
      title: "The heap gets smaller",
      body: [
        "Two more rounds later, `6` and `5` have joined the suffix, and the heap is `3 2 1` with `3` at the root. Each round does one swap and one sift down that walks fewer levels as the heap shrinks.",
        "The sorted suffix is already `5 6 7 8`: the four largest values in order, built without any extra array.",
      ],
      metrics: [
        { label: "Heap size", value: "3" },
        { label: "Sorted", value: "4" },
        { label: "Swaps", value: "11" },
      ],
      lines: [4, 5, 6, 7],
      scene: view([3, 2, 1, 5, 6, 7, 8], 3, { 0: "found" }, "sorted suffix: 5 6 7 8"),
    },
    {
      short: "Finish",
      title: "A heap of one is already sorted",
      body: [
        "Swap `3` with `1`, then `2` with `1` after the sift. When the heap has a single item, that item is the smallest and is already in place.",
        "The array reads `1 2 3 5 6 7 8`, fully sorted, using the same seven slots we started with.",
      ],
      metrics: [
        { label: "Heap size", value: "0" },
        { label: "Sorted", value: "7", level: "good" },
        { label: "Swaps", value: "14" },
      ],
      lines: [4, 5, 6, 7],
      scene: view([1, 2, 3, 5, 6, 7, 8], 0, {}, "sorted: 1 2 3 5 6 7 8"),
    },
    {
      short: "Cost",
      title: "Cost and trade-offs",
      body: [
        "Building the heap costs `O(n)`, and then `n - 1` rounds each cost `O(log n)`, so the total is `O(n log n)` in the best, average and worst case. Extra memory is `O(1)`: it is in place.",
        "It is not stable: swapping the root with the far end can move equal values past each other. It also jumps around memory, so quicksort is usually faster in practice, but heap sort's worst case is guaranteed.",
      ],
      callout: {
        kind: "warn",
        text: "Not stable: two equal keys can end up in the opposite order from the input.",
      },
      metrics: [{ label: "Cost", value: "O(n log n)", level: "good" }],
      scene: scene(
        label("c1", 320, 80, "build heap: O(n)", { size: 14, weight: 800 }),
        label("c2", 320, 125, "n rounds of swap + sift down: O(n log n)", {
          size: 14,
          weight: 800,
        }),
        label("c3", 320, 170, "in place: O(1) extra memory", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("c4", 320, 215, "not stable", { size: 14, weight: 800, tone: "warn" }),
      ),
    },
  ],
};
