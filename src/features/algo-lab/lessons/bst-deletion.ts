import { label, ptr, scene, tree } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

//              8
//         3         10
//       1   6          14        4 and 7 hang under 6, 12 under 14
//          4 7        12
const START = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, null, null, 12, null];
/** after deleting leaf 7 */
const NO_7 = START.map((v, i) => (i === 10 ? null : v));
/** after splicing out 14: 12 takes its place (slot 6) */
const NO_14 = NO_7.map((v, i) => (i === 6 ? 12 : i === 13 ? null : v));
/** while 3 is being replaced: its slot already shows 4, the old 4 is still there */
const COPY_4 = NO_14.map((v, i) => (i === 1 ? 4 : v));
/** after the old 4 is removed */
const FINAL = COPY_4.map((v, i) => (i === 9 ? null : v));

// Node identity by level-order slot: 12 keeps its id when it slides up into slot 6.
const KEYS = Array.from({ length: 15 }, (_, i) => i);
const KEYS_MOVED = KEYS.map((k, i) => (i === 6 ? 13 : k));

function view(
  values: (number | null)[],
  tones: Record<number, Tone>,
  cap: string,
  o: { edges?: Record<number, EdgeTone>; keys?: number[]; res?: string } = {},
) {
  return scene(
    tree(values, {
      x: 320,
      y: 40,
      width: 400,
      dy: 58,
      tones,
      edgeTones: o.edges,
      keys: o.keys ?? KEYS,
    }),
    label("cap", 320, 262, cap, { size: 13, weight: 800 }),
    o.res && label("res", 320, 296, o.res, { size: 13, weight: 800, tone: "good" }),
  );
}

export const bstDeletion: AlgoLesson = {
  id: "bst-deletion",
  title: "BST Deletion",
  summary: "Remove a node from a binary search tree in three cases without breaking the ordering.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "Why deletion needs three cases",
    "How to remove a leaf or a node with one child",
    "How the inorder successor replaces a node with two children",
    "How each case keeps the search tree ordered",
  ],
  takeaways: [
    "Removing a leaf deletes it, and removing a node with one child splices that child into its place.",
    "A node with two children takes the value of its inorder successor, then that successor is removed instead.",
    "Every case keeps left < node < right, and the whole deletion costs O(h).",
  ],
  hud: [
    { label: "Nodes", icon: "branch" },
    { label: "Children", icon: "list" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "delete(node, x):",
    "    find the node holding x by searching down from the root",
    "    if node has no children:",
    "        remove node",
    "    else if node has one child:",
    "        replace node by its child",
    "    else:",
    "        s = smallest node in node.right",
    "        node.key = s.key",
    "        delete(node.right, s.key)",
  ],
  steps: [
    {
      short: "The problem",
      title: "Deleting is harder than inserting",
      body: [
        "Insertion always adds a leaf, so nothing else moves. Deletion removes a node that may sit in the middle of the tree, with whole subtrees hanging from it.",
        "What happens depends on how many children the node has: none, one or two. We will remove `7`, then `14`, then `3` from this tree.",
      ],
      metrics: [
        { label: "Nodes", value: "9" },
        { label: "Cost", value: "O(h)", level: "good" },
      ],
      scene: view(
        START,
        { 10: "warn", 6: "mark", 1: "active" },
        "7 is a leaf, 14 has one child, 3 has two children",
      ),
    },
    {
      short: "Leaf: find",
      title: "Case 1: a leaf, find it first",
      body: [
        "To delete `7` we first search for it like any value: `7 < 8` go left, `7 > 3` go right, `7 > 6` go right, and we reach `7`.",
        "It has no children, so nothing hangs below it that we could lose.",
      ],
      metrics: [
        { label: "Nodes", value: "9" },
        { label: "Children", value: "0" },
      ],
      lines: [2, 3],
      scene: view(
        START,
        { 0: "done", 1: "done", 4: "done", 10: "warn" },
        "search: 8 → 3 → 6 → 7, found, no children",
        {
          edges: { 1: "active", 4: "active", 10: "active" },
        },
      ),
    },
    {
      short: "Leaf: remove",
      title: "Cut the leaf off",
      body: [
        "Simply detach it: set the right link of `6` to empty. The ordering of everything else is untouched.",
      ],
      callout: {
        kind: "tip",
        text: "Remember to update the parent's pointer. Freeing the node without clearing the link leaves a dangling reference.",
      },
      metrics: [
        { label: "Nodes", value: "8" },
        { label: "Children", value: "0" },
      ],
      lines: [4],
      scene: view(NO_7, { 4: "active" }, "leaf 7 removed: 6 keeps only its left child 4", {
        res: "case 1 done: just clear the parent's link",
      }),
    },
    {
      short: "One child",
      title: "Case 2: one child, find 14",
      body: [
        "Next delete `14`. It has a single child, `12`, on its left and nothing on the right.",
        "We cannot just cut it off, or `12` would be lost. But `12` is larger than `10` and smaller than `14`, so it also fits where `14` is.",
      ],
      metrics: [
        { label: "Nodes", value: "8" },
        { label: "Children", value: "1" },
      ],
      lines: [2, 5],
      scene: view(
        NO_7,
        { 0: "done", 2: "done", 6: "warn", 13: "mark" },
        "search: 8 → 10 → 14, found, one child (12)",
        {
          edges: { 6: "active", 13: "warn" },
        },
      ),
    },
    {
      short: "Splice",
      title: "Let the child take its parent's place",
      body: [
        "Point the right link of `10` at `12` instead of `14`, then drop `14`. The child's whole subtree rides along with it.",
        "Ordering still holds: `12` is in the right subtree of `8` and the right subtree of `10`, exactly like `14` was.",
      ],
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Children", value: "1" },
      ],
      lines: [6],
      scene: view(NO_14, { 6: "found" }, "12 moved up into the place of 14", {
        keys: KEYS_MOVED,
        edges: { 6: "found" },
        res: "case 2 done: link the parent to its only child",
      }),
    },
    {
      short: "Two children",
      title: "Case 3: two children, find 3",
      body: [
        "Now delete `3`. It has two children, `1` and `6`, each with their own subtrees. We cannot hang both from the single link that came from `8`.",
        "Instead of moving the node, we will keep its position and replace its value with another value that keeps the ordering valid.",
      ],
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Children", value: "2", level: "warn" },
      ],
      lines: [2, 7],
      scene: view(
        NO_14,
        { 0: "done", 1: "warn", 3: "mark", 4: "mark" },
        "3 has two children: 1 and 6",
        {
          keys: KEYS_MOVED,
          edges: { 3: "warn", 4: "warn" },
        },
      ),
    },
    {
      short: "Successor",
      title: "Find the inorder successor",
      body: [
        "The replacement must be larger than everything on the left and smaller than everything on the right. The inorder successor, the smallest value in the right subtree, is exactly that.",
        "Find it by going right once, to `6`, then left as far as possible: `6`, then `4`. `4` has no left child, so `4` is the successor.",
      ],
      callout: {
        kind: "insight",
        text: "The largest value of the left subtree (the predecessor) works just as well. Pick one and stay consistent.",
      },
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Children", value: "2", level: "warn" },
      ],
      lines: [8],
      scene: scene(
        view(
          NO_14,
          { 1: "warn", 4: "active", 9: "found" },
          "right once to 6, then left to 4: the successor",
          {
            keys: KEYS_MOVED,
            edges: { 4: "active", 9: "found" },
          },
        ),
        ptr("succ", "t9", "successor", { side: "below", tone: "found" }),
      ),
    },
    {
      short: "Copy value",
      title: "Overwrite 3 with 4",
      body: [
        "Copy the successor's value into the node being deleted. The node in that slot now holds `4`, so the order `1 < 4 < 6 ...` is still valid.",
        "But `4` now appears twice, so the original `4` at the bottom has to go.",
      ],
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Children", value: "2" },
      ],
      lines: [9],
      scene: view(
        COPY_4,
        { 1: "found", 9: "warn" },
        "slot of 3 now holds 4; the old 4 is a duplicate",
        {
          keys: KEYS_MOVED,
        },
      ),
    },
    {
      short: "Remove dup",
      title: "Delete the successor leaf",
      body: [
        "The successor never has a left child, since it is the leftmost node of its subtree. So it has at most a right child and falls under case 1 or case 2.",
        "Here `4` is a leaf, so it is simply removed. The tree is a valid search tree again with six values.",
      ],
      metrics: [
        { label: "Nodes", value: "6" },
        { label: "Children", value: "2" },
        { label: "Cost", value: "O(h)", level: "good" },
      ],
      lines: [10],
      scene: view(FINAL, { 1: "found" }, "old 4 removed with the leaf case", {
        keys: KEYS_MOVED,
        res: "case 3 done: copy the successor, then delete the successor",
      }),
    },
    {
      short: "Recap",
      title: "Three cases, one path down",
      body: [
        "No children: remove. One child: replace the node with that child. Two children: copy the inorder successor, then delete that successor, which falls back into the first two cases.",
        "Finding the node and the successor walks down one path, so the whole deletion costs `O(h)`.",
      ],
      metrics: [
        { label: "Children", value: "0, 1 or 2" },
        { label: "Cost", value: "O(h)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 80, "0 children: remove the node", { size: 14, weight: 800 }),
        label("t2", 320, 125, "1 child: link the parent to that child", { size: 14, weight: 800 }),
        label("t3", 320, 170, "2 children: copy the successor, delete it", {
          size: 14,
          weight: 800,
        }),
        label("t4", 320, 215, "cost O(h)", { size: 14, weight: 800, tone: "good" }),
      ),
    },
  ],
};
