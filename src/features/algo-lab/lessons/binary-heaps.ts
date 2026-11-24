import { label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

/** The heap drawn twice: as a tree, and as the array that backs it. Values are keys, so swaps slide. */
function view(vals: number[], tones: Record<number, Tone> = {}, note = "", extra: Item[] = []) {
  return scene(
    tree(vals, { y: 40, width: 300, dy: 50, r: 18, keys: vals, tones }),
    row(vals, { id: "a", y: 262, w: 44, keys: vals, index: true, tones: (i) => tones[i] }),
    label("lt", 36, 40, "tree", { anchor: "start", tone: "muted", size: 12 }),
    label("la", 36, 262, "array", { anchor: "start", tone: "muted", size: 12 }),
    note && label("note", 320, 330, note, { size: 13, weight: 800 }),
    extra,
  );
}

const BASE = [3, 5, 8, 9, 6, 10, 12];

export const binaryHeaps: AlgoLesson = {
  id: "binary-heaps",
  title: "Binary Heaps",
  summary: "A tree packed into an array that always keeps its smallest value at the top.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "The min-heap property and why the minimum sits at the root",
    "How a complete tree maps onto an array",
    "How insert sifts a new value up",
    "How extract-min sifts the moved value down",
    "Why both updates cost O(log n)",
  ],
  takeaways: [
    "A min-heap only promises that every parent is no larger than its children, which is just enough to keep the smallest value at the root.",
    "Because the tree is complete, an array stores it with no pointers: the parent of `i` is `(i - 1) / 2` and its children are `2i + 1` and `2i + 2`.",
    "Insert and extract-min fix one root-to-leaf path with swaps, so they take O(log n), while peeking at the minimum is O(1).",
  ],
  hud: [
    { label: "Size", icon: "list" },
    { label: "Swaps", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "insert(a, x):",
    "    append x to a; i = last index",
    "    while i > 0 and a[i] < a[parent(i)]:",
    "        swap a[i] with a[parent(i)]",
    "        i = parent(i)",
    "extractMin(a):",
    "    min = a[0]; move last element to a[0]; shrink a",
    "    i = 0",
    "    repeat:",
    "        c = smaller child of i (stop if none)",
    "        if a[i] <= a[c]: stop",
    "        swap a[i] with a[c]; i = c",
    "    return min",
  ],
  steps: [
    {
      short: "The property",
      title: "Parents are never larger",
      body: [
        "A min-heap is a binary tree where every node is less than or equal to both of its children. Look at the tree: `3` is above `5` and `8`, and `5` is above `9` and `6`.",
        "Siblings are not ordered against each other, and a value in one branch may be bigger than something in a deeper level of another. Only parent against child matters.",
      ],
      callout: {
        kind: "insight",
        text: "Follow any path downward and the values never decrease, so the smallest of all values has to be the root.",
      },
      metrics: [
        { label: "Size", value: "7" },
        { label: "Swaps", value: "0" },
        { label: "Cost", value: "peek O(1)", level: "good" },
      ],
      scene: view(BASE, { 0: "mark" }, "min-heap: parent <= children, minimum at the root"),
    },
    {
      short: "Array",
      title: "A complete tree fits in an array",
      body: [
        "The tree is filled level by level, left to right, with no gaps. That shape is called complete, and it lets us store the nodes in a plain array in that same order.",
        "For the node at index `i`, its parent is at `(i - 1) / 2` rounded down, and its children are at `2i + 1` and `2i + 2`. Node `5` sits at index `1`, so its children are at `3` and `4`: the values `9` and `6`.",
      ],
      metrics: [
        { label: "Size", value: "7" },
        { label: "Swaps", value: "0" },
        { label: "Cost", value: "no pointers", level: "good" },
      ],
      scene: view(
        BASE,
        { 1: "mark", 3: "active", 4: "active", 0: "done" },
        "i = 1  →  children 2i+1 = 3 and 2i+2 = 4, parent (i-1)/2 = 0",
      ),
    },
    {
      short: "Append",
      title: "Insert: put it at the end",
      body: [
        "To insert `2`, first drop it into the next free slot: index `7`, the first open spot on the bottom level. This keeps the tree complete.",
        "The shape is fine, but the heap property may not be: its parent `9` is larger than `2`. So `2` has to travel up.",
      ],
      metrics: [
        { label: "Size", value: "8" },
        { label: "Swaps", value: "0" },
        { label: "Cost", value: "append O(1)" },
      ],
      lines: [1, 2],
      scene: view(
        [3, 5, 8, 9, 6, 10, 12, 2],
        { 7: "active", 3: "warn" },
        "2 < parent 9: out of order",
      ),
    },
    {
      short: "Sift up 1",
      title: "Sift up: swap with the parent",
      body: [
        "Compare the new value with its parent. If the parent is larger, swap them. Here `2` trades places with `9`, moving to index `3`.",
        "Only one path from that leaf to the root can be affected, which is why we never touch the other branches.",
      ],
      metrics: [
        { label: "Size", value: "8" },
        { label: "Swaps", value: "1" },
        { label: "Cost", value: "<= log n swaps" },
      ],
      lines: [3, 4, 5],
      scene: view(
        [3, 5, 8, 2, 6, 10, 12, 9],
        { 3: "active", 1: "warn", 7: "done" },
        "2 < parent 5: swap again",
      ),
    },
    {
      short: "Sift up 2",
      title: "Keep climbing while smaller",
      body: [
        "Now `2` is below `5`, and `5 > 2`, so they swap too. The value `5` slides down into index `3`, which is fine because it is smaller than its new child `9`.",
      ],
      metrics: [
        { label: "Size", value: "8" },
        { label: "Swaps", value: "2" },
        { label: "Cost", value: "<= log n swaps" },
      ],
      lines: [3, 4, 5],
      scene: view(
        [3, 2, 8, 5, 6, 10, 12, 9],
        { 1: "active", 0: "warn", 3: "done" },
        "2 < parent 3: one more swap",
      ),
    },
    {
      short: "Sift up 3",
      title: "Stop at the root or a smaller parent",
      body: [
        "`2` is smaller than the root `3`, so it swaps once more and becomes the new root. With no parent left, the climb ends. Had the parent been smaller, we would have stopped earlier.",
        "The tree has `log2 n` levels, so the climb needs at most that many swaps.",
      ],
      callout: {
        kind: "tip",
        text: "Insert cost depends on how far the value climbs: a large value often stops after zero or one swap.",
      },
      metrics: [
        { label: "Size", value: "8" },
        { label: "Swaps", value: "3" },
        { label: "Cost", value: "insert O(log n)", level: "good" },
      ],
      lines: [3, 4, 5],
      scene: view(
        [2, 3, 8, 5, 6, 10, 12, 9],
        { 0: "found" },
        "2 is the new root: heap property restored",
      ),
    },
    {
      short: "Extract",
      title: "Extract-min: refill the root",
      body: [
        "The minimum is the root, so removing it is easy to read but leaves a hole. We fill the hole with the last array element, `9`, so the shape stays complete.",
        "Now `9` sits at the top, and it is bigger than its children `3` and `8`. It has to travel down.",
      ],
      metrics: [
        { label: "Size", value: "7" },
        { label: "Swaps", value: "0" },
        { label: "Cost", value: "move last O(1)" },
      ],
      lines: [6, 7, 8],
      scene: view(
        [9, 3, 8, 5, 6, 10, 12],
        { 0: "warn", 1: "active", 2: "active" },
        "removed 2; 9 moved to the root",
      ),
    },
    {
      short: "Sift down 1",
      title: "Sift down: swap with the smaller child",
      body: [
        "Compare the moved value with both children and pick the smaller one, `3` here. Swapping with the smaller child is what keeps the other child valid: `3` is smaller than `8`, so it can safely become their parent.",
        "Swapping with the larger child would put a bigger value above a smaller sibling and break the property.",
      ],
      callout: {
        kind: "warn",
        text: "Always swap with the smaller child in a min-heap. The larger one would leave a parent bigger than its sibling.",
      },
      metrics: [
        { label: "Size", value: "7" },
        { label: "Swaps", value: "1" },
        { label: "Cost", value: "<= log n swaps" },
      ],
      lines: [10, 12],
      scene: view(
        [3, 9, 8, 5, 6, 10, 12],
        { 1: "active", 3: "active", 4: "active", 0: "done" },
        "9 vs children 5 and 6: swap with 5",
      ),
    },
    {
      short: "Sift down 2",
      title: "Stop when no child is smaller",
      body: [
        "`9` swaps with `5` and lands at index `3`, which has no children in this heap. The walk ends, and the heap is valid again.",
        "Each step moves one level down, so extract-min does at most `log2 n` rounds, each with two comparisons. That is `O(log n)`; peeking at the root stays `O(1)`.",
      ],
      metrics: [
        { label: "Size", value: "7" },
        { label: "Swaps", value: "2" },
        { label: "Cost", value: "extract O(log n)", level: "good" },
      ],
      lines: [11, 12, 13],
      scene: view(
        BASE,
        { 0: "found" },
        "valid again: insert and extract-min both O(log n), peek O(1)",
      ),
    },
  ],
};
