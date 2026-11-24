import { label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

function view(vals: number[], tones: Record<number, Tone> = {}, note = "", extra: Item[] = []) {
  return scene(
    tree(vals, { y: 40, width: 300, dy: 54, r: 18, keys: vals, tones }),
    row(vals, { id: "a", y: 250, w: 44, keys: vals, index: true, tones: (i) => tones[i] }),
    label("lt", 36, 40, "tree", { anchor: "start", tone: "muted", size: 12 }),
    label("la", 36, 250, "array", { anchor: "start", tone: "muted", size: 12 }),
    note && label("note", 320, 318, note, { size: 13, weight: 800 }),
    extra,
  );
}

const START = [9, 4, 7, 1, 6, 2, 8];

export const buildingAHeap: AlgoLesson = {
  id: "building-a-heap",
  title: "Building a Heap",
  summary:
    "Turn any array into a heap in linear time by sifting down from the last parent to the root.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How heapify works bottom-up",
    "Why the leaves need no work",
    "Why the total cost is O(n) and not O(n log n)",
    "How it compares with inserting n items one by one",
  ],
  takeaways: [
    "Heapify walks from the last parent down to index 0 and sifts each value down, so every subtree is a heap before its parent is processed.",
    "Most nodes are near the bottom and sift down only a step or two, so the total work sums to O(n).",
    "Inserting n items one at a time costs O(n log n) in the worst case, so heapify is the better way to start from a full array.",
  ],
  hud: [
    { label: "Swaps", icon: "swap" },
    { label: "Nodes fixed", icon: "check" },
    { label: "Total cost", icon: "timer" },
  ],
  pseudocode: [
    "heapify(a):",
    "    n = length of a",
    "    for i from n / 2 - 1 down to 0:",
    "        siftDown(a, i, n)",
    "siftDown(a, i, n):",
    "    repeat:",
    "        c = smaller child of i (stop if none)",
    "        if a[i] <= a[c]: stop",
    "        swap a[i] with a[c]; i = c",
  ],
  steps: [
    {
      short: "The array",
      title: "An array that is not a heap",
      body: [
        "We are given seven numbers in no particular order and want a min-heap. Read as a tree, `9` is at the root but larger than both children, and `7` sits above a smaller `2`.",
        "The obvious plan is to insert the values one at a time. There is a faster way that works on the array in place.",
      ],
      metrics: [
        { label: "Swaps", value: "0" },
        { label: "Nodes fixed", value: "0" },
        { label: "Total cost", value: "?", level: "warn" },
      ],
      scene: view(START, {}, "7 values, arbitrary order"),
    },
    {
      short: "Leaves",
      title: "Leaves are already heaps",
      body: [
        "A node with no children trivially satisfies the property. In a complete tree of `n` nodes, the leaves are the last `n / 2`: here indexes `3` to `6`.",
        "So we only need to repair the parents. The last one is at index `n / 2 - 1`, which is `2`.",
      ],
      callout: {
        kind: "insight",
        text: "About half of all nodes are leaves, and they cost nothing.",
      },
      metrics: [
        { label: "Swaps", value: "0" },
        { label: "Nodes fixed", value: "4 of 7" },
        { label: "Total cost", value: "0 so far", level: "good" },
      ],
      lines: [3],
      scene: view(
        START,
        { 3: "done", 4: "done", 5: "done", 6: "done", 2: "active" },
        "start at the last parent: index n/2 - 1 = 2",
      ),
    },
    {
      short: "Index 2",
      title: "Sift down the last parent",
      body: [
        "Index `2` holds `7` with children `2` and `8`. The smaller child is `2`, and `2 < 7`, so `7` swaps down with it.",
        "The subtree rooted at index `2` is now a valid heap, and `7` has landed on a leaf.",
      ],
      metrics: [
        { label: "Swaps", value: "1" },
        { label: "Nodes fixed", value: "5 of 7" },
        { label: "Total cost", value: "1 swap" },
      ],
      lines: [3, 4, 7, 9],
      scene: view(
        [9, 4, 2, 1, 6, 7, 8],
        { 2: "active", 5: "active", 3: "done", 4: "done", 6: "done" },
        "swap 7 with the smaller child 2",
      ),
    },
    {
      short: "Index 1",
      title: "Move one step left in the array",
      body: [
        "Index `1` holds `4` with children `1` and `6`. We swap `4` with the smaller child `1`.",
        "Now `4` is at index `3`, a leaf, so it can go no further. Its two subtrees were already heaps, which is the reason one downward walk is enough.",
      ],
      metrics: [
        { label: "Swaps", value: "2" },
        { label: "Nodes fixed", value: "6 of 7" },
        { label: "Total cost", value: "2 swaps" },
      ],
      lines: [3, 4, 7, 9],
      scene: view(
        [9, 1, 2, 4, 6, 7, 8],
        { 1: "active", 3: "active", 2: "done", 4: "done", 5: "done", 6: "done" },
        "swap 4 with the smaller child 1",
      ),
    },
    {
      short: "Root: step 1",
      title: "The root sinks the furthest",
      body: [
        "Finally index `0` holds `9`. Both subtrees are heaps, so the only problem is `9` itself. Its children are `1` and `2`, and `1` is smaller, so `9` swaps with `1`.",
      ],
      callout: {
        kind: "tip",
        text: "Going from the end to the start guarantees that both subtrees under a node are heaps by the time we reach it.",
      },
      metrics: [
        { label: "Swaps", value: "3" },
        { label: "Nodes fixed", value: "6 of 7" },
        { label: "Total cost", value: "3 swaps" },
      ],
      lines: [3, 4, 7, 9],
      scene: view(
        [1, 9, 2, 4, 6, 7, 8],
        { 0: "done", 1: "active", 3: "warn", 4: "warn" },
        "9 is now at index 1 and still above 4 and 6",
      ),
    },
    {
      short: "Root: step 2",
      title: "Keep sifting until it settles",
      body: [
        "`9` now has children `4` and `6`. Swap with the smaller one, `4`, and `9` reaches index `3`, a leaf. The walk stops and the whole array is a min-heap.",
        "The root, which could have sunk the full height of the tree, needed two swaps: the height here.",
      ],
      metrics: [
        { label: "Swaps", value: "4" },
        { label: "Nodes fixed", value: "7 of 7", level: "good" },
        { label: "Total cost", value: "4 swaps" },
      ],
      lines: [7, 9],
      scene: view([1, 4, 2, 9, 6, 7, 8], { 0: "found" }, "a valid min-heap, built in place"),
    },
    {
      short: "Why O(n)",
      title: "Why it is linear",
      body: [
        "A sift down can move a value at most as far as the height of its node. Half the nodes have height `0` (no work), a quarter have height `1`, an eighth have height `2`, and so on, up to one root of height `log n`.",
        "Adding it up gives `n/2 * 0 + n/4 * 1 + n/8 * 2 + ...`. That series converges to about `n`, so the total is `O(n)`, not `n` nodes times `log n` each.",
      ],
      callout: {
        kind: "insight",
        text: "The cheap nodes are many and the expensive ones are few. The sum is dominated by the bottom of the tree.",
      },
      metrics: [
        { label: "Swaps", value: "<= n" },
        { label: "Total cost", value: "O(n)", level: "good" },
      ],
      scene: view([1, 4, 2, 9, 6, 7, 8], {}, "", [
        label("h0", 500, 40, "height 2: 1 node, <= 2 swaps", { anchor: "start", size: 12 }),
        label("h1", 500, 94, "height 1: 2 nodes, <= 1 swap", { anchor: "start", size: 12 }),
        label("h2", 500, 148, "height 0: 4 nodes, 0 swaps", { anchor: "start", size: 12 }),
        label("sum", 320, 318, "2 + 2 + 0 = 4 swaps at most, linear in n", {
          size: 13,
          weight: 800,
        }),
      ]),
    },
    {
      short: "vs inserts",
      title: "Compared with n inserts",
      body: [
        "Inserting n items one by one sifts each new value up. A value at the bottom level can climb the whole height, and half the values land on the bottom level, so the worst case is about `n/2 * log n`, which is `O(n log n)`.",
        "Sifting down from the parents instead of up from the leaves flips the cost: most nodes are near the bottom and travel very little. Use heapify when you already have all the data.",
      ],
      callout: {
        kind: "warn",
        text: "Heapify is O(n), but it needs the whole array up front. For a stream, insert one at a time.",
      },
      metrics: [
        { label: "Swaps", value: "n inserts: n log n" },
        { label: "Total cost", value: "heapify: O(n)", level: "good" },
      ],
      scene: scene(
        label("c1", 320, 90, "n inserts (sift up)", { size: 14, weight: 800 }),
        label("c1b", 320, 120, "O(n log n) worst case", { size: 13, tone: "warn" }),
        label("c2", 320, 190, "heapify (sift down from the last parent)", {
          size: 14,
          weight: 800,
        }),
        label("c2b", 320, 220, "O(n)", { size: 13, tone: "good" }),
      ),
    },
  ],
};
