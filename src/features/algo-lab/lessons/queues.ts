import { label, linked, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

/** A queue as a row of items (keyed by name so they slide); front on the left, back on the right. */
function view(items: string[], o: { out?: string; inn?: string; note?: string } = {}) {
  const n = items.length;
  const last = items[n - 1];
  return scene(
    row(items, {
      keys: items,
      y: 150,
      tones: (i) => (items[i] === o.inn ? "active" : undefined),
    }),
    n > 1 && ptr("front", `a${items[0]}`, "front", { side: "below", tone: "mark" }),
    n > 1 && ptr("back", `a${last}`, "back", { side: "above", tone: "active" }),
    n === 1 && ptr("front", `a${items[0]}`, "front = back", { side: "below", tone: "mark" }),
    n === 0 && label("empty", 320, 150, "empty queue", { tone: "muted", size: 14 }),
    o.out && label("out", 80, 150, `${o.out} left`, { size: 14, weight: 800, tone: "good" }),
    o.note && label("note", 320, 60, o.note, { size: 14, weight: 800 }),
  );
}

export const queues: AlgoLesson = {
  id: "queues",
  title: "Queues",
  summary: "First in, first out: add at the back, remove from the front, and keep both ends cheap.",
  minutes: 10,
  level: "beginner",
  goals: [
    "What first-in, first-out means",
    "How enqueue and dequeue use the back and the front",
    "Why shifting an array makes a slow queue",
    "How two indexes or a linked list make it O(1)",
    "Where queues appear: scheduling and BFS",
  ],
  takeaways: [
    "A queue serves items in the order they arrived: enqueue at the back, dequeue at the front.",
    "Shifting every element on each dequeue costs O(n), while a head index or a linked list makes both operations O(1).",
    "Whenever work must be handled fairly in arrival order, such as jobs or breadth-first search, a queue is the tool.",
  ],
  hud: [
    { label: "Size", icon: "list" },
    { label: "Last op", icon: "swap" },
    { label: "Moves", icon: "gauge" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "enqueue(x):",
    "    items[tail] = x",
    "    tail = tail + 1",
    "dequeue():",
    '    if head == tail: error "empty queue"',
    "    x = items[head]",
    "    head = head + 1",
    "    return x",
  ],
  steps: [
    {
      short: "The line",
      title: "A queue is a line of people",
      body: [
        "The person who joined the line first is served first, and newcomers join at the back. That rule is first in, first out, or FIFO.",
        "Contrast it with a stack, which serves the newest item. Here nobody cuts in.",
      ],
      metrics: [
        { label: "Size", value: "3", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      scene: view(["A", "B", "C"], { note: "A arrived first, C last" }),
    },
    {
      short: "Enqueue",
      title: "Enqueue adds at the back",
      body: [
        "`enqueue(D)` places `D` behind `C`. The `back` marker moves to the newest item and the front does not change.",
      ],
      metrics: [
        { label: "Size", value: "4", level: "good" },
        { label: "Last op", value: "enqueue D" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [1, 2, 3],
      scene: view(["A", "B", "C", "D"], { inn: "D" }),
    },
    {
      short: "Dequeue",
      title: "Dequeue removes from the front",
      body: [
        "`dequeue()` returns `A`, the oldest item, and `B` becomes the new front.",
        "`peek()` would return `A` without removing it. As with a stack, dequeuing an empty queue needs a check.",
      ],
      callout: {
        kind: "warn",
        text: "Decide up front what dequeue does on an empty queue: return null, or throw. Do not return garbage.",
      },
      metrics: [
        { label: "Size", value: "3", level: "good" },
        { label: "Last op", value: "dequeue → A" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [4, 5, 6, 7, 8],
      scene: view(["B", "C", "D"], { out: "A" }),
    },
    {
      short: "Naive array",
      title: "The naive array: shifting is slow",
      body: [
        "If the front must always sit at index 0, removing it forces every other item one slot to the left: `shift()` copies `n - 1` items.",
        "Here that is 4 copies for one dequeue. Draining a queue of `n` items this way costs `O(n²)`.",
      ],
      callout: {
        kind: "insight",
        text: "The work is not in removing A, it is in repairing the gap A leaves behind.",
      },
      metrics: [
        { label: "Size", value: "5", level: "warn" },
        { label: "Last op", value: "shift" },
        { label: "Moves", value: "4", level: "bad" },
        { label: "Cost", value: "O(n)", level: "bad" },
      ],
      scene: scene(
        row(["A", "B", "C", "D", "E"], {
          y: 150,
          index: true,
          tones: (i) => (i === 0 ? "warn" : "active"),
        }),
        label("t", 320, 70, "remove A, then copy B, C, D, E left", { size: 14, weight: 800 }),
        label("c", 320, 240, "4 moves for 1 dequeue", { size: 14, tone: "warn", weight: 800 }),
      ),
    },
    {
      short: "Two indexes",
      title: "Keep a head index instead",
      body: [
        "Leave the items where they are and remember where the front is. `dequeue` reads at `head` and adds one to it; `enqueue` writes at `tail` and adds one to it.",
        "Nothing moves, so both operations are `O(1)`. The cost is that the freed slots on the left are wasted until we reuse them.",
      ],
      callout: {
        kind: "tip",
        text: "Wrapping the indexes around the array ends that waste. That is the circular buffer, up next in this course.",
      },
      metrics: [
        { label: "Size", value: "4", level: "good" },
        { label: "Last op", value: "head + 1" },
        { label: "Moves", value: "0", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [2, 3, 6, 7],
      scene: scene(
        row(["A", "B", "C", "D", "E", "", "", ""], {
          w: 48,
          y: 150,
          index: true,
          empty: [5, 6, 7],
          tones: (i) => (i === 0 ? "muted" : undefined),
        }),
        ptr("head", "a1", "head", { side: "below", tone: "mark" }),
        ptr("tail", "a5", "tail", { side: "above", tone: "active" }),
        label("t", 320, 60, "A was dequeued: head moved, nothing copied", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "Linked list",
      title: "A linked list does it naturally",
      body: [
        "Keep a pointer to the first node and one to the last. Enqueue links a new node after the last; dequeue drops the first and moves `head` along.",
        "Each operation touches one node, so it is `O(1)`, and the queue never runs out of room.",
      ],
      metrics: [
        { label: "Size", value: "4", level: "good" },
        { label: "Last op", value: "enqueue" },
        { label: "Moves", value: "0", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [3, 7],
      scene: scene(
        linked(["B", "C", "D", "E"], { x: 300 }),
        ptr("head", "n0", "head", { side: "below", tone: "mark" }),
        ptr("tail", "n3", "tail", { side: "above", tone: "active" }),
      ),
    },
    {
      short: "In the wild",
      title: "Where queues are used",
      body: [
        "Operating systems queue tasks for the processor, printers queue documents, and servers queue requests so that earlier ones are answered first.",
        "Breadth-first search uses a queue to visit nearer nodes before farther ones: take a node from the front, add its neighbours at the back.",
      ],
      callout: {
        kind: "insight",
        text: "A queue turns 'handle them fairly' into code. The order of arrival is the order of service.",
      },
      metrics: [{ label: "Cost", value: "O(1)", level: "good" }],
      scene: scene(
        row(["J1", "J2", "J3", "J4"], {
          y: 160,
          tones: (i) => (i === 0 ? "active" : undefined),
        }),
        ptr("run", "a0", "running", { side: "below", tone: "active" }),
        label("t", 320, 70, "a job queue: J1 runs now, J4 waits longest", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "Recap",
      title: "Remember the rule and the cost",
      body: [
        "FIFO: enqueue at the back, dequeue at the front. Back it with two indexes or a linked list so neither end ever moves the rest.",
        "Each operation is `O(1)`; a queue of `n` items uses `O(n)` space.",
      ],
      metrics: [
        { label: "Size", value: "n" },
        { label: "Moves", value: "0", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 100, "enqueue: write at tail", { size: 15, weight: 800 }),
        label("r2", 320, 140, "dequeue: read at head", { size: 15, weight: 800 }),
        label("r3", 320, 200, "both O(1), never shift the array", {
          size: 14,
          tone: "good",
          weight: 800,
        }),
      ),
    },
  ],
};
