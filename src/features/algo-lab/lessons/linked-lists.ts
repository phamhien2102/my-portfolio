import { cell, edge, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const W = 52;
const GAP = 34;

/** Nodes in a row at explicit keys (so a node keeps its identity when the row re-centres). */
function nodes(
  values: (string | number)[],
  keys: (string | number)[],
  o: { x?: number; y?: number; tones?: (i: number) => Tone | undefined } = {},
) {
  return row(values, { id: "n", keys, w: W, h: 44, gap: GAP, x: o.x ?? 320, y: o.y ?? 150, ...o });
}

/** A plain chain: arrows between neighbours, optionally "null" after the last node. */
function chain(
  values: (string | number)[],
  keys: (string | number)[],
  o: { x?: number; y?: number; tail?: boolean; tones?: (i: number) => Tone | undefined } = {},
): Item[] {
  const ns = nodes(values, keys, o);
  const es = ns.slice(1).map((n, i) => edge(`e${keys[i]}`, ns[i].id, n.id));
  const last = ns[ns.length - 1];
  const tail = o.tail
    ? [
        cell("null", last.x + W / 2 + GAP + 14, last.y, "null", { w: 44, h: 28, tone: "ghost" }),
        edge("etail", last.id, "null", { dashed: true }),
      ]
    : [];
  return [...es, ...ns, ...tail];
}

const TABLE = [
  ["operation", "array", "linked list"],
  ["get by index", "O(1)", "O(n)"],
  ["insert at front", "O(n)", "O(1)"],
  ["insert after a node", "O(n)", "O(1)"],
  ["search by value", "O(n)", "O(n)"],
];

const BASE = [7, 3, 9, 4];
const BASE_KEYS = [0, 1, 2, 3];

export const linkedLists: AlgoLesson = {
  id: "linked-lists",
  title: "Singly Linked Lists",
  summary:
    "Nodes joined by next pointers: cheap to grow at the front, slow to search, easy to rewire.",
  minutes: 11,
  level: "beginner",
  goals: [
    "What a node, a head and the null tail are",
    "Why insert at the head is O(1) but search is O(n)",
    "How to insert and delete in the middle by rewiring pointers",
    "How a linked list compares with an array",
  ],
  takeaways: [
    "A singly linked list is a chain of nodes where each one stores a value and a pointer to the next, and you only ever hold the head.",
    "Reaching anything except the head costs a walk of O(n), but once you stand at a node, inserting or deleting after it is O(1) pointer rewiring.",
    "Pick an array when you index and scan a lot, and a linked list when you add and remove at known positions without shifting everything.",
  ],
  hud: [
    { label: "Nodes", icon: "list" },
    { label: "Hops", icon: "link" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "search(head, x):",
    "    cur = head",
    "    while cur and cur.value != x:",
    "        cur = cur.next",
    "    return cur",
    "insert_front(v):",
    "    node = new node(v); node.next = head",
    "    head = node",
    "insert_after(cur, v):",
    "    node = new node(v); node.next = cur.next",
    "    cur.next = node",
    "delete_after(prev):",
    "    prev.next = prev.next.next",
  ],
  steps: [
    {
      short: "The chain",
      title: "A node is a value plus a pointer",
      body: [
        "Each node stores one value and a `next` pointer that says where the following node lives. The list itself is just a pointer to the first node, called the `head`.",
        "The last node has nothing after it, so its `next` is `null`. That `null` is how every loop knows when to stop.",
      ],
      metrics: [
        { label: "Nodes", value: "4" },
        { label: "Hops", value: "0", level: "good" },
      ],
      scene: scene(
        chain(BASE, BASE_KEYS, { tail: true }),
        ptr("head", "n0", "head", { side: "below" }),
      ),
    },
    {
      short: "Search",
      title: "Finding a value means walking",
      body: [
        "There is no index to jump to. To find `9` you start at `head`, check it, follow `next`, and repeat: `7`, then `3`, then `9`.",
        "Reaching the node at position `k` takes `k` hops, so search is `O(n)` in the worst case.",
      ],
      callout: {
        kind: "warn",
        text: "Unlike an array, `list[2]` does not exist here. Position 2 costs two hops every time.",
      },
      metrics: [
        { label: "Hops", value: "2", level: "warn" },
        { label: "Cost", value: "O(n)", level: "warn" },
      ],
      lines: [2, 3, 4],
      scene: scene(
        chain(BASE, BASE_KEYS, {
          tail: true,
          tones: (i) => (i === 2 ? "found" : i < 2 ? "done" : undefined),
        }),
        ptr("head", "n0", "head", { side: "below" }),
        ptr("cur", "n2", "cur", { side: "above", tone: "found" }),
      ),
    },
    {
      short: "Head: new",
      title: "Insert at the head, step one",
      body: [
        "To add `5` at the front, make a new node and point its `next` at the current head. At this moment the list is still unchanged: `head` has not moved.",
      ],
      metrics: [
        { label: "Nodes", value: "4" },
        { label: "Hops", value: "0", level: "good" },
      ],
      lines: [7],
      scene: scene(
        chain(BASE, BASE_KEYS, { tail: true }),
        nodes([5], ["x"], { x: 191, y: 60, tones: () => "active" }),
        edge("ex", "nx", "n0", { tone: "active" }),
        ptr("head", "n0", "head", { side: "below" }),
      ),
    },
    {
      short: "Head: move",
      title: "Insert at the head, step two",
      body: [
        "Now move `head` to the new node. Two assignments, no walking, no shifting: the cost is `O(1)` no matter how long the list is.",
        "An array would have to slide every element one slot to the right to make room at the front.",
      ],
      callout: {
        kind: "insight",
        text: "Order matters: link the new node to the old head first, then move `head`. Do it backwards and you lose the list.",
      },
      metrics: [
        { label: "Nodes", value: "5" },
        { label: "Hops", value: "0", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [8],
      scene: scene(
        chain([5, ...BASE], ["x", ...BASE_KEYS], {
          tail: true,
          tones: (i) => (i === 0 ? "found" : undefined),
        }),
        ptr("head", "nx", "head", { side: "below" }),
      ),
    },
    {
      short: "Tail insert",
      title: "Appending at the tail costs a walk",
      body: [
        "We only hold `head`, so to append `2` we must walk to the last node before we can set its `next`. That is `n - 1` hops here: three.",
        "Then `cur.next = new` is one assignment. The walk is the whole cost, so append is `O(n)`.",
      ],
      callout: {
        kind: "tip",
        text: "Keeping a second `tail` pointer makes append O(1). The next lesson goes further and adds back pointers too.",
      },
      metrics: [
        { label: "Nodes", value: "5" },
        { label: "Hops", value: "3", level: "warn" },
        { label: "Cost", value: "O(n)", level: "warn" },
      ],
      lines: [3, 4, 11],
      scene: scene(
        chain(BASE, BASE_KEYS, { x: 277, tones: (i) => (i < 3 ? "done" : "active") }),
        nodes([2], ["z"], { x: 535, tones: () => "found" }),
        edge("ez", "n3", "nz", { tone: "found" }),
        label("z0", 560, 205, "next = null", { size: 11, tone: "muted" }),
        ptr("head", "n0", "head", { side: "below" }),
        ptr("cur", "n3", "cur", { side: "above", tone: "active" }),
      ),
    },
    {
      short: "Middle: link",
      title: "Insert in the middle, link forward first",
      body: [
        "Insert `6` after `3`. We stand on the `3` node, called `cur`. First point the new node at what `cur` points to now: `new.next = cur.next`.",
        "The new node already reaches `9`, and nothing else has changed, so the list is still intact.",
      ],
      metrics: [
        { label: "Nodes", value: "4" },
        { label: "Hops", value: "1", level: "good" },
      ],
      lines: [10],
      scene: scene(
        chain(BASE, BASE_KEYS, { tail: true, tones: (i) => (i === 1 ? "active" : undefined) }),
        nodes([6], ["y"], { x: 320, y: 60, tones: () => "found" }),
        edge("ey", "ny", "n2", { tone: "found" }),
        ptr("head", "n0", "head", { side: "below" }),
        ptr("cur", "n1", "cur", { side: "below", tone: "active" }),
      ),
    },
    {
      short: "Middle: swing",
      title: "Then swing the previous pointer",
      body: [
        "Second assignment: `cur.next = new`. The old arrow from `3` to `9` is overwritten, and the chain now runs `3`, `6`, `9`.",
        "Two pointer writes, whatever the length. The only expensive part of a middle insert is the walk that got you to `cur`.",
      ],
      callout: {
        kind: "warn",
        text: "Swap the two assignments and `cur.next` is overwritten before you copy it. Everything after `cur` is lost.",
      },
      metrics: [
        { label: "Nodes", value: "5" },
        { label: "Hops", value: "1", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [11],
      scene: scene(
        chain([7, 3, 6, 9, 4], [0, 1, "y", 2, 3], {
          tail: true,
          tones: (i) => (i === 2 ? "found" : undefined),
        }),
        ptr("head", "n0", "head", { side: "below" }),
      ),
    },
    {
      short: "Delete",
      title: "Delete by skipping the node",
      body: [
        "To remove `3` we stand on the node before it and set `prev.next = prev.next.next`. The `7` node now points straight at `9`.",
        "Nothing points at `3` any more, so it is unreachable and the runtime can reclaim it. Deleting the head is even easier: `head = head.next`.",
      ],
      metrics: [
        { label: "Nodes", value: "3" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [13],
      scene: scene(
        edge("skip", "n0", "n2", { tone: "found" }),
        edge("e2", "n2", "n3"),
        edge("gone", "n1", "n2", { dashed: true, tone: "muted" }),
        nodes([7, 9, 4], [0, 2, 3], { x: 320, tones: (i) => (i === 0 ? "found" : undefined) }),
        row([3], { id: "n", keys: [1], x: 277, y: 220, w: W, h: 44, tones: () => "muted" }),
        cell("null", 480, 150, "null", { w: 44, h: 28, tone: "ghost" }),
        edge("etail", "n3", "null", { dashed: true }),
        ptr("head", "n0", "head", { side: "above" }),
      ),
    },
    {
      short: "Versus array",
      title: "Linked list or array?",
      body: [
        "An array reaches any index in `O(1)` and scans fast because its items sit side by side. A linked list reaches position `k` in `O(k)` but inserts or deletes after a known node in `O(1)` without shifting anything.",
        "Each node also pays for a pointer, and scattered nodes are slower for the CPU cache. Choose by what your program does most.",
      ],
      metrics: [{ label: "Cost", value: "see table" }],
      scene: scene(
        TABLE.map(([a, b, c], r) => [
          label(`c${r}0`, 150, 50 + r * 42, a, {
            size: 13,
            anchor: "start",
            weight: r ? 500 : 800,
          }),
          label(`c${r}1`, 400, 50 + r * 42, b, {
            size: 13,
            weight: r ? 500 : 800,
            tone: r ? "good" : "ink",
          }),
          label(`c${r}2`, 510, 50 + r * 42, c, {
            size: 13,
            weight: r ? 500 : 800,
            tone: r ? "warn" : "ink",
          }),
        ]).flat(),
      ),
    },
  ],
};
