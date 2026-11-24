import { cell, label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

type Task = [name: string, priority: number];

/** Tasks as blocks: the number is the priority (lower = more urgent), the caption is the name. */
function tasks(list: Task[], tones: Record<string, Tone> = {}, y = 140) {
  const w = 64;
  const gap = 12;
  const start = 320 - (list.length * w + (list.length - 1) * gap) / 2 + w / 2;
  return list.map(([name, p], i) =>
    cell(`q${name}`, start + i * (w + gap), y, p, { w, h: 52, sub: name, tone: tones[name] }),
  );
}

const TODO: Task[] = [
  ["mail", 3],
  ["bug", 1],
  ["docs", 4],
  ["lunch", 2],
];

export const priorityQueues: AlgoLesson = {
  id: "priority-queues",
  title: "Priority Queues",
  summary: "A collection that always hands back its most urgent item, and the ways to build one.",
  minutes: 10,
  level: "beginner",
  goals: [
    "What a priority queue promises",
    "The add and take operations",
    "How sorted array, unsorted array and heap compare",
    "Where priority queues appear in real programs",
  ],
  takeaways: [
    "A priority queue is an interface: add items with a priority and always take the most urgent one, no matter the order they arrived in.",
    "A sorted array makes take cheap and add expensive, an unsorted array does the reverse, and a heap keeps both at O(log n).",
    "Schedulers, Dijkstra's shortest paths and top-k problems all reduce to repeatedly taking the best item from a priority queue.",
  ],
  hud: [
    { label: "Add", icon: "download" },
    { label: "Take", icon: "bolt" },
    { label: "Items", icon: "list" },
  ],
  pseudocode: [
    "add(q, item, priority):",
    "    append (priority, item) to q",
    "    sift the new entry up while it beats its parent",
    "take(q):",
    "    best = q[0]",
    "    move the last entry to q[0] and shrink q",
    "    sift it down, swapping with the smaller child",
    "    return best",
    "peek(q):",
    "    return q[0]",
  ],
  steps: [
    {
      short: "The idea",
      title: "Always take the most urgent",
      body: [
        "Imagine a to-do list where every task has a number: a smaller number means more urgent. Here `bug` is `1`, `lunch` is `2`, `mail` is `3` and `docs` is `4`.",
        "An ordinary queue gives you items in arrival order. A priority queue gives you the most urgent item first, whatever the arrival order was.",
      ],
      metrics: [{ label: "Items", value: "4" }],
      scene: scene(
        label("hint", 320, 70, "lower number = more urgent", { size: 14, weight: 800 }),
        tasks(TODO),
      ),
    },
    {
      short: "take()",
      title: "Take removes the best item",
      body: [
        "`take()` removes and returns the item with the highest priority. Here that is `bug`, the lowest number.",
        "A related operation, `peek()`, only looks at the best item without removing it. Both are about the single best item, never about a full ordering.",
      ],
      metrics: [
        { label: "Take", value: "→ bug" },
        { label: "Items", value: "3" },
      ],
      lines: [4, 5, 8],
      scene: scene(
        label("hint", 320, 70, "take()  →  bug (1)", { size: 14, weight: 800, tone: "good" }),
        tasks(TODO, { bug: "found" }),
      ),
    },
    {
      short: "add()",
      title: "Add can jump the line",
      body: [
        "`add(item, priority)` puts a new task in. After `bug` left, we add `call` with priority `0`. It arrives last, but it is the most urgent.",
        "So the next `take()` returns `call`, not `mail`. Arrival order does not matter, only priority does.",
      ],
      callout: {
        kind: "insight",
        text: "The queue never promises a full sorted order. It only promises that take returns the current best.",
      },
      metrics: [
        { label: "Add", value: "call (0)" },
        { label: "Items", value: "4" },
      ],
      lines: [1, 2, 3],
      scene: scene(
        label("hint", 320, 70, "add(call, 0)  →  next take() returns call", {
          size: 14,
          weight: 800,
        }),
        tasks(
          [
            ["mail", 3],
            ["docs", 4],
            ["lunch", 2],
            ["call", 0],
          ],
          { call: "active" },
        ),
      ),
    },
    {
      short: "Sorted array",
      title: "Option 1: keep an array sorted",
      body: [
        "Store the items sorted by priority. The best one is always at the front, so `take()` just removes it: `O(1)` if you track the front, though removing from the front of a plain array shifts everything.",
        "But `add` must find the right slot and shift the items after it to make room, which is `O(n)`.",
      ],
      metrics: [
        { label: "Add", value: "O(n)", level: "bad" },
        { label: "Take", value: "O(1)", level: "good" },
        { label: "Items", value: "4" },
      ],
      scene: scene(
        label("hint", 320, 70, "sorted: add shifts items, take reads the front", {
          size: 14,
          weight: 800,
        }),
        tasks(
          [
            ["call", 0],
            ["lunch", 2],
            ["mail", 3],
            ["docs", 4],
          ],
          { call: "found" },
        ),
      ),
    },
    {
      short: "Unsorted array",
      title: "Option 2: leave the array unsorted",
      body: [
        "Append new items at the end: `add` is `O(1)`. The cost moves to `take()`, which has to scan every item to find the smallest priority, so it is `O(n)`.",
        "With a handful of items this is fine. With a million, scanning for every take becomes the bottleneck.",
      ],
      metrics: [
        { label: "Add", value: "O(1)", level: "good" },
        { label: "Take", value: "O(n)", level: "bad" },
        { label: "Items", value: "4" },
      ],
      scene: scene(
        label("hint", 320, 70, "unsorted: add appends, take scans everything", {
          size: 14,
          weight: 800,
        }),
        tasks(
          [
            ["mail", 3],
            ["docs", 4],
            ["lunch", 2],
            ["call", 0],
          ],
          { mail: "active", docs: "active", lunch: "active", call: "found" },
        ),
      ),
    },
    {
      short: "Heap",
      title: "Option 3: a binary heap",
      body: [
        "A heap keeps just enough order: the best item is at the root, and `add` and `take` each fix one path of the tree. Both cost `O(log n)`, and `peek()` costs `O(1)`.",
        "It gives up the full sorted order, which the queue never needed, and in return neither operation is ever slow.",
      ],
      callout: {
        kind: "tip",
        text: "A heap lets you pay a little on each operation instead of a lot on one of them.",
      },
      metrics: [
        { label: "Add", value: "O(log n)", level: "good" },
        { label: "Take", value: "O(log n)", level: "good" },
        { label: "Items", value: "4" },
      ],
      lines: [2, 3, 6, 7],
      scene: scene(
        tree([0, 2, 3, 4], {
          y: 50,
          width: 200,
          dy: 56,
          r: 20,
          keys: [0, 2, 3, 4],
          tones: { 0: "mark" },
        }),
        row([0, 2, 3, 4], { id: "a", keys: [0, 2, 3, 4], y: 230, w: 44, index: true }),
        label("hint", 320, 300, "min-heap of priorities: best item at the root", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Compare",
      title: "Cost at a glance",
      body: [
        "For `n` items: a sorted array adds in `O(n)` and takes in `O(1)`, an unsorted array adds in `O(1)` and takes in `O(n)`, and a heap does both in `O(log n)`.",
        "If you do n adds and n takes, the array options cost `O(n^2)` overall, and the heap costs `O(n log n)`. That gap is why the heap is the standard choice.",
      ],
      metrics: [
        { label: "Add", value: "heap O(log n)", level: "good" },
        { label: "Take", value: "heap O(log n)", level: "good" },
        { label: "Items", value: "n" },
      ],
      scene: scene(
        label("h0", 130, 60, "structure", { size: 12, tone: "muted" }),
        label("h1", 330, 60, "add", { size: 12, tone: "muted" }),
        label("h2", 480, 60, "take", { size: 12, tone: "muted" }),
        label("r1", 130, 110, "sorted array", { size: 14, weight: 800 }),
        label("r1a", 330, 110, "O(n)", { size: 14, tone: "warn" }),
        label("r1b", 480, 110, "O(1)", { size: 14, tone: "good" }),
        label("r2", 130, 160, "unsorted array", { size: 14, weight: 800 }),
        label("r2a", 330, 160, "O(1)", { size: 14, tone: "good" }),
        label("r2b", 480, 160, "O(n)", { size: 14, tone: "warn" }),
        label("r3", 130, 210, "binary heap", { size: 14, weight: 800 }),
        label("r3a", 330, 210, "O(log n)", { size: 14, tone: "good" }),
        label("r3b", 480, 210, "O(log n)", { size: 14, tone: "good" }),
      ),
    },
    {
      short: "Uses",
      title: "Where you will meet it",
      body: [
        "Operating-system schedulers pick the next process by priority. Event simulations pop the earliest event. Dijkstra's algorithm repeatedly takes the closest unvisited node, and merging sorted lists takes the smallest head each time.",
        "Whenever a problem says 'repeatedly get the smallest (or largest)', think of a priority queue backed by a heap.",
      ],
      metrics: [
        { label: "Add", value: "O(log n)", level: "good" },
        { label: "Take", value: "O(log n)", level: "good" },
      ],
      scene: scene(
        label("u1", 320, 70, "process scheduler: next process to run", { size: 14, weight: 800 }),
        label("u2", 320, 115, "Dijkstra: closest unvisited node", { size: 14, weight: 800 }),
        label("u3", 320, 160, "event simulation: earliest event", { size: 14, weight: 800 }),
        label("u4", 320, 205, "merge sorted lists: smallest head", { size: 14, weight: 800 }),
        label("u5", 320, 250, "top-k: keep the k best so far", { size: 14, weight: 800 }),
      ),
    },
  ],
};
