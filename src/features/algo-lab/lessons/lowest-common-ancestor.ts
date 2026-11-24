import { label, scene, tree } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

//              6
//         2         8
//       0   4     7   9        level-order: 6 2 8 0 4 7 9 null null 3 5
//          3 5
const VALUES = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5];
// level-order index of each value, so scenes can speak in values
const IDX: Record<number, number> = { 6: 0, 2: 1, 8: 2, 0: 3, 4: 4, 7: 5, 9: 6, 3: 9, 5: 10 };

type Mark = Record<number, Tone>;

/** The tree with tones given by VALUE, plus an optional caption and a result line. */
function view(marks: Mark, cap?: string, res?: string, edges: Record<number, EdgeTone> = {}) {
  const tones: Record<number, Tone> = {};
  Object.entries(marks).forEach(([v, t]) => (tones[IDX[Number(v)]] = t));
  const edgeTones: Record<number, EdgeTone> = {};
  Object.entries(edges).forEach(([v, t]) => (edgeTones[IDX[Number(v)]] = t));
  return scene(
    tree(VALUES, { x: 320, y: 40, width: 400, dy: 58, tones, edgeTones }),
    cap && label("cap", 320, 262, cap, { size: 13, weight: 800 }),
    res && label("res", 320, 296, res, { size: 13, weight: 800, tone: "good" }),
  );
}

export const lowestCommonAncestor: AlgoLesson = {
  id: "lowest-common-ancestor",
  title: "Lowest Common Ancestor",
  summary:
    "Find the deepest node that sits above two given nodes, in general trees and in search trees.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "What the lowest common ancestor is",
    "How a recursive search returns found-flags",
    "Why a node can be its own ancestor",
    "How a search tree shortens the work to a single path",
  ],
  takeaways: [
    "The lowest common ancestor is the first node, walking up from both targets, that they share.",
    "Recurse into both sides: the node where the two answers come from different children is the answer.",
    "In a binary search tree the values alone say which way to go, so one root-to-node path is enough.",
  ],
  hud: [
    { label: "Nodes visited", icon: "search" },
    { label: "Left answer", icon: "branch" },
    { label: "Right answer", icon: "branch" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "find(node, p, q):",
    "    if node is empty or node is p or node is q:",
    "        return node",
    "    left = find(node.left, p, q)",
    "    right = find(node.right, p, q)",
    "    if left and right are both non-null: return node",
    "    return whichever of left, right is non-null",
    "lcaBST(root, p, q):",
    "    node = root",
    "    while node is not empty:",
    "        if p and q are both < node: node = node.left",
    "        else if p and q are both > node: node = node.right",
    "        else: return node",
  ],
  steps: [
    {
      short: "The problem",
      title: "Two nodes, one meeting point",
      body: [
        "Given two nodes `p` and `q` in a tree, the **lowest common ancestor** (LCA) is the deepest node that has both of them somewhere below it.",
        "Take `p = 3` and `q = 5`. Both live under `4`, under `2`, under `6`. Which of those is the lowest one?",
      ],
      metrics: [{ label: "Nodes visited", value: "0" }],
      scene: view({ 3: "mark", 5: "mark" }, "p = 3, q = 5: who is their lowest common ancestor?"),
    },
    {
      short: "Ancestors",
      title: "Walk up from both",
      body: [
        "The ancestors of `3` are `4`, `2`, `6`. The ancestors of `5` are `4`, `2`, `6`. They share all three, and the first shared one, `4`, is the lowest.",
        "Every node above `4` is a common ancestor too, but only `4` is the lowest. Notice `4` is as deep as a shared node can be.",
      ],
      callout: {
        kind: "insight",
        text: "A node counts as its own ancestor. For p = 2 and q = 4 the answer is 2 itself.",
      },
      metrics: [{ label: "Nodes visited", value: "0" }],
      scene: view(
        { 6: "done", 2: "done", 4: "found", 3: "mark", 5: "mark" },
        "common ancestors: 6, 2, 4  →  lowest: 4",
        undefined,
        { 4: "found", 3: "active", 5: "active", 2: "active" },
      ),
    },
    {
      short: "The idea",
      title: "Let the recursion report back",
      body: [
        "Write `find(node)` so it returns the node itself when it is `p` or `q`, `null` for an empty spot, and otherwise combines the answers of its two sides.",
        "If both the left and the right call return something non-null, then `p` and `q` are in different subtrees and this node is the split point. If only one side answers, pass that answer up.",
      ],
      metrics: [{ label: "Nodes visited", value: "0" }],
      lines: [2, 3, 4, 5, 6, 7],
      scene: view(
        { 6: "active" },
        "find(node): left = find(left), right = find(right)",
        "both non-null  →  this node is the LCA",
      ),
    },
    {
      short: "Start at 6",
      title: "At the root: ask both sides",
      body: [
        "`6` is neither `3` nor `5`, so it recurses into `2` on the left and `8` on the right and waits.",
        "The right call will fully explore `8`, `7` and `9`, find neither target and return `null`. The interesting work is on the left.",
      ],
      metrics: [
        { label: "Nodes visited", value: "1" },
        { label: "Left answer", value: "?" },
        { label: "Right answer", value: "?" },
      ],
      lines: [4, 5],
      scene: view({ 6: "active" }, "visit 6: not p or q, ask 2 and 8"),
    },
    {
      short: "Down to 4",
      title: "Left of 2 reaches 4",
      body: [
        "`2` also is neither target, so it asks `0` and `4`. The call on `0` is a leaf that is not a target, so it returns `null` at once.",
        "The call on `4` is the one that matters: it asks its children `3` and `5`.",
      ],
      metrics: [
        { label: "Nodes visited", value: "4" },
        { label: "Left answer", value: "?" },
        { label: "Right answer", value: "?" },
      ],
      lines: [2, 3, 4, 5],
      scene: view(
        { 6: "done", 2: "done", 0: "muted", 4: "active", 3: "mark", 5: "mark" },
        "visit 2, then 0 (null), then 4",
      ),
    },
    {
      short: "Both found",
      title: "4 hears from both children",
      body: [
        "`find(3)` returns `3` because it is the target `p`, and `find(5)` returns `5` because it is the target `q`. Both answers are non-null.",
        "That means `p` and `q` are in two different subtrees of `4`, so `4` is the LCA. No deeper node can be above both.",
      ],
      metrics: [
        { label: "Nodes visited", value: "6" },
        { label: "Left answer", value: "3", level: "good" },
        { label: "Right answer", value: "5", level: "good" },
      ],
      lines: [2, 3, 6],
      scene: view(
        { 6: "done", 2: "done", 0: "muted", 4: "found", 3: "mark", 5: "mark" },
        "left = 3, right = 5  →  LCA = 4",
        undefined,
        { 4: "found", 3: "found", 5: "found" },
      ),
    },
    {
      short: "Bubble up",
      title: "The answer travels back up",
      body: [
        "`2` gets `null` from `0` and `4` from its right side, so exactly one side answered and it returns `4`. The root gets `4` from the left and `null` from `8`, so it returns `4` too.",
        "A returned node is only an LCA at the first place where two sides answered. Above that it is simply passed along.",
      ],
      callout: {
        kind: "tip",
        text: "If p is an ancestor of q, find reaches p first and returns it without looking further down. That is correct: p is the answer.",
      },
      metrics: [
        { label: "Nodes visited", value: "9" },
        { label: "Left answer", value: "4", level: "good" },
        { label: "Right answer", value: "null" },
        { label: "Cost", value: "O(n)", level: "warn" },
      ],
      lines: [7],
      scene: view(
        {
          6: "done",
          2: "done",
          4: "found",
          3: "mark",
          5: "mark",
          0: "muted",
          8: "muted",
          7: "muted",
          9: "muted",
        },
        "6 ← 2 ← 4: the answer 4 is returned all the way up",
        "LCA(3, 5) = 4",
        { 4: "found", 2: "found" },
      ),
    },
    {
      short: "BST shortcut",
      title: "With a search tree, use the values",
      body: [
        "This particular tree is also a binary search tree: left is smaller, right is larger. Then no recursion over both sides is needed. At each node compare it with `p` and `q`.",
        "If both are smaller, go left. If both are larger, go right. Otherwise the targets split here, or one of them equals the node, and the node is the answer.",
      ],
      metrics: [
        { label: "Nodes visited", value: "3" },
        { label: "Cost", value: "O(h)", level: "good" },
      ],
      lines: [9, 10, 11, 12, 13],
      scene: view(
        { 6: "done", 2: "done", 4: "found", 3: "mark", 5: "mark" },
        "6: both smaller, left. 2: both larger, right. 4: split",
        "LCA(3, 5) = 4 after visiting only 3 nodes",
        { 2: "active", 4: "found" },
      ),
    },
    {
      short: "Recap",
      title: "Cost and when to use which",
      body: [
        "The general recursive search visits each node at most once, so it costs `O(n)` time and `O(h)` stack space for a tree of height `h`.",
        "On a binary search tree the loop follows one path, costing `O(h)` time and `O(1)` extra space. Use the shortcut only when the ordering is guaranteed.",
      ],
      metrics: [
        { label: "Nodes visited", value: "n or h" },
        { label: "Cost", value: "O(n) / O(h)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 80, "any binary tree: recurse both sides, O(n)", {
          size: 14,
          weight: 800,
        }),
        label("t2", 320, 125, "split point = both sides answered", { size: 14, weight: 800 }),
        label("t3", 320, 170, "binary search tree: follow values, O(h)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("t4", 320, 215, "a node is its own ancestor", { size: 14, weight: 800 }),
      ),
    },
  ],
};
