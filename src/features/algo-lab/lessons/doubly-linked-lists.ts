import { cell, edge, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const W = 52;
const GAP = 34;

/** Nodes in a row with two-way arrows between neighbours; keys keep each node's identity. */
function dchain(
  values: (string | number)[],
  keys: (string | number)[],
  o: {
    x?: number;
    y?: number;
    nulls?: boolean;
    tones?: (i: number) => Tone | undefined;
  } = {},
): Item[] {
  const ns = row(values, {
    id: "n",
    keys,
    w: W,
    h: 44,
    gap: GAP,
    x: o.x ?? 320,
    y: o.y ?? 150,
    tones: o.tones,
  });
  const es = ns.slice(1).map((n, i) => edge(`e${keys[i]}`, ns[i].id, n.id, { arrow: "both" }));
  const ends: Item[] = [];
  if (o.nulls) {
    const first = ns[0];
    const last = ns[ns.length - 1];
    ends.push(
      cell("nullL", first.x - W / 2 - GAP - 14, first.y, "null", { w: 44, h: 28, tone: "ghost" }),
      edge("eL", first.id, "nullL", { dashed: true }),
      cell("nullR", last.x + W / 2 + GAP + 14, last.y, "null", { w: 44, h: 28, tone: "ghost" }),
      edge("eR", last.id, "nullR", { dashed: true }),
    );
  }
  return [...es, ...ns, ...ends];
}

const ABC = ["A", "B", "C"];

export const doublyLinkedLists: AlgoLesson = {
  id: "doubly-linked-lists",
  title: "Doubly Linked Lists",
  summary: "Each node knows both neighbours, so a node you already hold can be removed in O(1).",
  minutes: 10,
  level: "beginner",
  goals: [
    "What prev and next pointers add to a node",
    "Why a tail pointer makes append O(1)",
    "How to remove a node you already hold",
    "Which four pointers change when inserting between two nodes",
    "What the extra pointer costs in memory",
  ],
  takeaways: [
    "A doubly linked list gives every node a `prev` and a `next`, and the list keeps both a `head` and a `tail`.",
    "Given a reference to a node, you can unlink it in O(1) because it knows its own neighbours.",
    "The price is one extra pointer per node and more assignments to keep consistent, so a missed update corrupts the list.",
  ],
  hud: [
    { label: "Nodes", icon: "list" },
    { label: "Pointer writes", icon: "link" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "append(v):",
    "    node = new node(v); node.prev = tail",
    "    tail.next = node",
    "    tail = node",
    "remove(node):",
    "    node.prev.next = node.next",
    "    node.next.prev = node.prev",
    "insert_between(p, q, x):",
    "    x.prev = p; x.next = q",
    "    p.next = x; q.prev = x",
  ],
  steps: [
    {
      short: "Two-way",
      title: "Every node points both ways",
      body: [
        "A node now holds a value, a `next` pointer to the node after it and a `prev` pointer to the node before it. You can walk the list forwards or backwards.",
        "The first node's `prev` and the last node's `next` are both `null`.",
      ],
      metrics: [{ label: "Nodes", value: "3" }],
      scene: scene(dchain(ABC, [0, 1, 2], { nulls: true })),
    },
    {
      short: "Head & tail",
      title: "Hold both ends",
      body: [
        "The list keeps two entry points: `head` for the first node and `tail` for the last. Either end is reachable without walking.",
        "That already beats a singly linked list, where reaching the tail meant visiting every node.",
      ],
      metrics: [
        { label: "Nodes", value: "3" },
        { label: "Cost", value: "O(1) ends", level: "good" },
      ],
      scene: scene(
        dchain(ABC, [0, 1, 2], { nulls: true, tones: (i) => (i === 1 ? undefined : "mark") }),
        ptr("head", "n0", "head", { side: "above" }),
        ptr("tail", "n2", "tail", { side: "above" }),
      ),
    },
    {
      short: "Append",
      title: "Append links the new node in",
      body: [
        "To append `D`, point `tail.next` at it and `D.prev` back at the old tail. That is two writes, and both arrows now exist.",
        "The `tail` pointer still names `C`. The list is momentarily inconsistent until the tail moves.",
      ],
      metrics: [
        { label: "Nodes", value: "3" },
        { label: "Pointer writes", value: "2" },
      ],
      lines: [2, 3],
      scene: scene(
        dchain(ABC, [0, 1, 2], { x: 277, tones: (i) => (i === 2 ? "active" : undefined) }),
        row(["D"], { id: "n", keys: [3], x: 449, w: W, h: 44, tones: () => "found" }),
        edge("e2", "n2", "n3", { arrow: "both", tone: "found" }),
        ptr("head", "n0", "head", { side: "above" }),
        ptr("tail", "n2", "tail", { side: "above", tone: "active" }),
      ),
    },
    {
      short: "Tail moves",
      title: "Then move the tail pointer",
      body: [
        "Set `tail = D`. Three small assignments in total and no walking, so append is `O(1)` however long the list is.",
      ],
      callout: {
        kind: "insight",
        text: "A singly linked list needed a walk to find the tail. The tail pointer plus a prev link removes it.",
      },
      metrics: [
        { label: "Nodes", value: "4" },
        { label: "Pointer writes", value: "3" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [4],
      scene: scene(
        dchain([...ABC, "D"], [0, 1, 2, 3], {
          nulls: true,
          tones: (i) => (i === 3 ? "found" : undefined),
        }),
        ptr("head", "n0", "head", { side: "above" }),
        ptr("tail", "n3", "tail", { side: "above", tone: "found" }),
      ),
    },
    {
      short: "Remove",
      title: "Remove a node you already hold",
      body: [
        "Say we hold `B` and want it gone. In a singly list we would need to find `A` first. Here `B.prev` is `A` and `B.next` is `C`, so we do `B.prev.next = B.next` and `B.next.prev = B.prev`.",
        "Two writes, no search: `O(1)`. `A` and `C` now point at each other and `B` is bypassed.",
      ],
      callout: {
        kind: "warn",
        text: "If `B` is the head or tail there is no `prev` or `next` to update. Move `head` or `tail` instead, and check for null.",
      },
      metrics: [
        { label: "Nodes", value: "3" },
        { label: "Pointer writes", value: "2" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [6, 7],
      scene: scene(
        edge("skip", "n0", "n2", { arrow: "both", tone: "found" }),
        edge("e2", "n2", "n3", { arrow: "both" }),
        edge("g1", "n1", "n0", { dashed: true, tone: "muted" }),
        edge("g2", "n1", "n2", { dashed: true, tone: "muted" }),
        row(["A", "C", "D"], {
          id: "n",
          keys: [0, 2, 3],
          w: W,
          h: 44,
          gap: GAP,
          x: 320,
          tones: (i) => (i < 2 ? "found" : undefined),
        }),
        row(["B"], { id: "n", keys: [1], x: 277, y: 225, w: W, h: 44, tones: () => "muted" }),
        ptr("head", "n0", "head", { side: "above" }),
        ptr("tail", "n3", "tail", { side: "above" }),
      ),
    },
    {
      short: "Insert: aim",
      title: "Insert between two nodes: aim the new one",
      body: [
        "Insert `X` between `P` and `Q`. Four pointers change in total. First give `X` its own two: `X.prev = P` and `X.next = Q`.",
        "The old neighbours still point at each other, so the list is untouched and safe.",
      ],
      metrics: [
        { label: "Nodes", value: "2" },
        { label: "Pointer writes", value: "2" },
      ],
      lines: [9],
      scene: scene(
        dchain(["P", "Q"], ["p", "q"]),
        row(["X"], { id: "n", keys: ["x"], x: 320, y: 55, w: W, h: 44, tones: () => "active" }),
        edge("xp", "nx", "np", { tone: "active" }),
        edge("xq", "nx", "nq", { tone: "active" }),
      ),
    },
    {
      short: "Insert: link",
      title: "Then make the neighbours point at it",
      body: [
        "Now the other two: `P.next = X` and `Q.prev = X`. The direct arrow between `P` and `Q` is overwritten and the chain reads `P`, `X`, `Q` in both directions.",
        "Four writes, constant time. Keep the order in mind: copy what you need from `P.next` and `Q.prev` before you overwrite them.",
      ],
      callout: {
        kind: "tip",
        text: "Counting pointer writes is a good bug check. Insert is 4, remove is 2, and each forward link needs its back link.",
      },
      metrics: [
        { label: "Nodes", value: "3" },
        { label: "Pointer writes", value: "4" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [10],
      scene: scene(
        dchain(["P", "X", "Q"], ["p", "x", "q"], { tones: (i) => (i === 1 ? "found" : undefined) }),
      ),
    },
    {
      short: "The cost",
      title: "What two pointers cost",
      body: [
        "Every node stores an extra pointer, typically 8 bytes on a 64-bit machine. For a list of small values that can nearly double the memory.",
        "Every change must also fix both directions, so there is more code to get right. Use a doubly linked list when you remove nodes you already hold, or walk both ways. Otherwise a singly linked list is lighter.",
      ],
      metrics: [
        { label: "Nodes", value: "n" },
        { label: "Cost", value: "+1 pointer per node", level: "warn" },
      ],
      scene: scene(
        label("t1", 320, 70, "singly linked node", { size: 13, weight: 800 }),
        row(["value", "next"], { id: "s", x: 320, y: 110, w: 80, h: 36 }),
        label("t2", 320, 185, "doubly linked node", { size: 13, weight: 800 }),
        row(["prev", "value", "next"], {
          id: "d",
          x: 320,
          y: 225,
          w: 80,
          h: 36,
          tones: (i) => (i === 1 ? undefined : "warn"),
        }),
      ),
    },
  ],
};
