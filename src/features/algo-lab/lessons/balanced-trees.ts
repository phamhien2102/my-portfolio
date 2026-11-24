import { label, ptr, scene, tree } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Item, Tone } from "../lib/types";

/** Add a small caption (the balance factor) under the discs listed by id. */
function withSubs(items: Item[], subs: Record<string, string>): Item[] {
  return items.map((it) => (it.t === "disc" && subs[it.id] ? { ...it, sub: subs[it.id] } : it));
}

// Nodes are keyed by name so they slide when the tree is rotated.
//   before:  10            after:    20
//              \                    /  \
//               20                10    30
//              /  \                  \
//            15    30                 15
const BEFORE_VALUES = [10, null, 20, null, null, 15, 30];
const BEFORE_KEYS = ["a", "x1", "b", "x3", "x4", "d", "c"];
const AFTER_VALUES = [20, 10, 30, null, 15];
const AFTER_KEYS = ["b", "a", "c", "x3", "d"];

const before = (
  tones: Record<number, Tone>,
  subs: Record<string, string>,
  edges: Record<number, EdgeTone> = {},
) =>
  withSubs(
    tree(BEFORE_VALUES, {
      x: 320,
      y: 50,
      width: 240,
      dy: 62,
      tones,
      keys: BEFORE_KEYS,
      edgeTones: edges,
    }),
    subs,
  );
const after = (
  tones: Record<number, Tone>,
  subs: Record<string, string>,
  edges: Record<number, EdgeTone> = {},
) =>
  withSubs(
    tree(AFTER_VALUES, {
      x: 320,
      y: 50,
      width: 240,
      dy: 62,
      tones,
      keys: AFTER_KEYS,
      edgeTones: edges,
    }),
    subs,
  );

const BF_BEFORE = { ta: "bf -2", tb: "bf 0", td: "bf 0", tc: "bf 0" };
const BF_AFTER = { tb: "bf +1", ta: "bf -1", td: "bf 0", tc: "bf 0" };

export const balancedTrees: AlgoLesson = {
  id: "balanced-trees",
  title: "Balanced Trees",
  summary: "Keep a search tree short with rotations so every operation stays O(log n).",
  minutes: 13,
  level: "advanced",
  goals: [
    "Why the height of a search tree is what matters",
    "How the balance factor detects trouble",
    "How a left rotation repairs a right-heavy node",
    "How AVL and red-black trees differ at a high level",
  ],
  takeaways: [
    "Search, insert and delete cost O(h), so a tree that guarantees h = O(log n) guarantees fast operations.",
    "A rotation changes a few links, keeps the in-order sequence unchanged and lowers the height of a heavy side.",
    "AVL trees balance more strictly and read faster; red-black trees rotate less and write faster.",
  ],
  hud: [
    { label: "Height", icon: "layers" },
    { label: "Balance factor", icon: "gauge" },
    { label: "Rotations", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "balance(node):",
    "    factor = height(node.left) - height(node.right)",
    "    if factor is -1, 0 or +1: return node",
    "    if factor > 1:",
    "        if left child leans right: rotateLeft(node.left)",
    "        return rotateRight(node)",
    "    else if factor < -1:",
    "        if right child leans left: rotateRight(node.right)",
    "        return rotateLeft(node)",
    "rotateLeft(x):",
    "    pivot = x.right",
    "    x.right = pivot.left",
    "    pivot.left = x",
    "    return pivot",
  ],
  steps: [
    {
      short: "Why height",
      title: "The shape decides the speed",
      body: [
        "Every search-tree operation walks from the root down, so it costs `O(h)`. Five values can form a tree of height 2 or a chain of height 4, depending on insertion order.",
        "We want the tree to keep itself short no matter what order values arrive in. That is what a self-balancing tree does.",
      ],
      metrics: [
        { label: "Height", value: "2 vs 4", level: "warn" },
        { label: "Cost", value: "O(log n) vs O(n)", level: "warn" },
      ],
      scene: scene(
        tree([3, 2, 4, 1, null, null, 5], {
          id: "b",
          x: 160,
          y: 50,
          width: 200,
          dy: 50,
          r: 17,
          tones: { 0: "found" },
        }),
        tree(
          Array.from({ length: 31 }, (_, i) =>
            i === 0 ? 1 : i === 2 ? 2 : i === 6 ? 3 : i === 14 ? 4 : i === 30 ? 5 : null,
          ),
          {
            id: "s",
            x: 470,
            y: 50,
            width: 200,
            dy: 50,
            r: 17,
            tones: { 0: "warn", 2: "warn", 6: "warn", 14: "warn", 30: "warn" },
          },
        ),
        label("l1", 160, 270, "balanced: height 2", { size: 12, tone: "good", weight: 800 }),
        label("l2", 470, 270, "chain: height 4", { size: 12, tone: "warn", weight: 800 }),
      ),
    },
    {
      short: "Balance factor",
      title: "Measuring lopsidedness",
      body: [
        "For each node, the balance factor is the height of its left subtree minus the height of its right subtree, where an empty subtree has height 0.",
        "Here `10` has nothing on the left and a subtree of height 2 on the right, so its balance factor is `0 - 2 = -2`. Every other node has a factor of 0.",
      ],
      metrics: [
        { label: "Height", value: "3" },
        { label: "Balance factor", value: "-2", level: "bad" },
        { label: "Rotations", value: "0" },
      ],
      lines: [2],
      scene: scene(
        before({}, BF_BEFORE),
        label("cap", 320, 262, "balance factor = height(left) - height(right)", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Too heavy",
      title: "The rule: stay within one",
      body: [
        "An AVL tree demands that every balance factor is `-1`, `0` or `+1`. A factor of `-2` or `+2` means that node is too lopsided and must be repaired right away, right after the insert or delete that caused it.",
        "`10` is right-heavy. Fixing it means lifting its taller right child, `20`, above it.",
      ],
      callout: {
        kind: "insight",
        text: "Only nodes on the path from the changed spot up to the root can go out of balance, so checking them costs O(log n).",
      },
      metrics: [
        { label: "Height", value: "3" },
        { label: "Balance factor", value: "-2", level: "bad" },
        { label: "Rotations", value: "0" },
      ],
      lines: [3, 7],
      scene: scene(
        before({ 0: "warn", 2: "mark" }, BF_BEFORE, { 2: "warn" }),
        ptr("heavy", "ta", "right-heavy", { side: "left", tone: "warn" }),
        label("cap", 320, 262, "10 breaks the rule: |-2| > 1", {
          size: 13,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "Pick pivot",
      title: "Left rotation: choose the pivot",
      body: [
        "A left rotation at `10` uses its right child `20` as the pivot. The pivot is going to become the new top of this small subtree.",
        "`15`, the left child of `20`, is the awkward one: it is larger than `10` and smaller than `20`, so it sits between them in order and needs a new home.",
      ],
      metrics: [
        { label: "Height", value: "3" },
        { label: "Balance factor", value: "-2", level: "bad" },
        { label: "Rotations", value: "0" },
      ],
      lines: [10, 11],
      scene: scene(
        before({ 0: "warn", 2: "active", 5: "mark" }, BF_BEFORE),
        ptr("piv", "tb", "pivot", { side: "right", tone: "active" }),
        ptr("mid", "td", "between 10 and 20", { side: "below", tone: "mark" }),
      ),
    },
    {
      short: "Rotate",
      title: "Rotate: pivot up, old root down",
      body: [
        "Three links change. `20` becomes the new root of the subtree. `10` becomes the left child of `20`. And `15` is detached from `20` and becomes the right child of `10`.",
        "The values read `10 15 20 30` left to right both before and after, so it is still a valid search tree.",
      ],
      callout: {
        kind: "tip",
        text: "A rotation touches a constant number of pointers, so it is O(1). The work is in deciding when to do it.",
      },
      metrics: [
        { label: "Height", value: "2", level: "good" },
        { label: "Balance factor", value: "+1" },
        { label: "Rotations", value: "1" },
      ],
      lines: [12, 13, 14],
      scene: scene(
        after({ 0: "found", 1: "mark", 4: "mark" }, BF_AFTER, { 1: "found", 4: "found" }),
        label("cap", 320, 262, "in-order is still 10 15 20 30", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Check result",
      title: "Height dropped, order kept",
      body: [
        "The subtree's height went from 3 to 2. Now `20` has factor `+1` and `10` has `-1`; both are within one, so the tree is balanced again.",
        "Only one rotation was needed here. A rotation is local: nothing outside this subtree had to change.",
      ],
      metrics: [
        { label: "Height", value: "2", level: "good" },
        { label: "Balance factor", value: "+1", level: "good" },
        { label: "Rotations", value: "1" },
      ],
      lines: [2, 3],
      scene: scene(
        after({ 0: "done", 1: "done", 2: "done", 4: "done" }, BF_AFTER),
        label("cap", 320, 262, "every factor is -1, 0 or +1", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "Four cases",
      title: "Four shapes, four repairs",
      body: [
        "A heavy node can be heavy in four ways. Left-left needs one right rotation. Right-right needs one left rotation, as just shown.",
        "Left-right and right-left have a zigzag: first rotate the child to straighten it into a line, then rotate the node itself. That is a double rotation.",
      ],
      callout: {
        kind: "warn",
        text: "Applying a single rotation to a zigzag does nothing useful: it only flips the zigzag the other way. Look at the child's balance factor first.",
      },
      metrics: [{ label: "Rotations", value: "1 or 2" }],
      lines: [4, 5, 6, 7, 8, 9],
      scene: scene(
        label("c1", 320, 70, "left-left  →  rotate right", { size: 14, weight: 800 }),
        label("c2", 320, 115, "right-right  →  rotate left", { size: 14, weight: 800 }),
        label("c3", 320, 160, "left-right  →  rotate left at the child, then right", {
          size: 14,
          weight: 800,
        }),
        label("c4", 320, 205, "right-left  →  rotate right at the child, then left", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "AVL vs RB",
      title: "Two famous ways to stay balanced",
      body: [
        "An AVL tree enforces the strict factor rule above. Its height is at most about `1.44 log2(n)`, so lookups are fast, but inserts and deletes may rotate more often.",
        "A red-black tree colours each node red or black with a few rules that keep the longest path at most twice the shortest. It is looser (height up to `2 log2(n)`) but needs fewer rotations per update.",
      ],
      metrics: [
        { label: "Height", value: "1.44 vs 2 log n" },
        { label: "Rotations", value: "more vs fewer" },
        { label: "Cost", value: "O(log n)", level: "good" },
      ],
      scene: scene(
        label("h1", 190, 70, "AVL", { size: 16, weight: 800 }),
        label("a1", 190, 110, "balance factor in -1..+1", { size: 12 }),
        label("a2", 190, 140, "stricter, faster reads", { size: 12, tone: "good" }),
        label("a3", 190, 170, "more rotations on update", { size: 12, tone: "warn" }),
        label("h2", 450, 70, "Red-black", { size: 16, weight: 800 }),
        label("b1", 450, 110, "colour rules, longest ≤ 2 × shortest", { size: 12 }),
        label("b2", 450, 140, "looser, cheaper updates", { size: 12, tone: "good" }),
        label("b3", 450, 170, "slightly taller tree", { size: 12, tone: "warn" }),
      ),
    },
    {
      short: "Recap",
      title: "The guarantee",
      body: [
        "Without balancing, a search tree is `O(n)` in the worst case. With rotations after each update, the height stays `O(log n)`, so search, insert and delete are all `O(log n)` guaranteed, not just on average.",
        "Standard libraries ship these trees: ordered maps and sets are usually red-black trees, and databases use related balanced structures.",
      ],
      metrics: [
        { label: "Height", value: "O(log n)", level: "good" },
        { label: "Rotations", value: "O(1) each" },
        { label: "Cost", value: "O(log n)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 80, "height stays O(log n) after every update", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("t2", 320, 125, "rotation: O(1) pointer changes, order preserved", {
          size: 14,
          weight: 800,
        }),
        label("t3", 320, 170, "search, insert, delete: O(log n) guaranteed", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("t4", 320, 215, "price: extra bookkeeping per node", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
  ],
};
