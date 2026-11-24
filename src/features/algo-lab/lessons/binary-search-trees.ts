import { label, scene, tree } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

//              8
//         3         10
//       1   6          14        level-order below; 4 and 7 hang under 6
//          4 7        12
const BASE = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, null, null, 12, null];
const WITH_12 = BASE;
const WITHOUT_12 = BASE.map((v, i) => (i === 13 ? null : v));

/** The search tree with tones/edges by level-order index and a one-line caption. */
function view(
  values: (number | null)[],
  tones: Record<number, Tone>,
  cap: string,
  edgeTones: Record<number, EdgeTone> = {},
  res?: string,
) {
  return scene(
    tree(values, { x: 320, y: 40, width: 400, dy: 58, tones, edgeTones }),
    label("cap", 320, 262, cap, { size: 13, weight: 800 }),
    res && label("res", 320, 296, res, { size: 13, weight: 800, tone: "good" }),
  );
}

export const binarySearchTrees: AlgoLesson = {
  id: "binary-search-trees",
  title: "Binary Search Trees",
  summary: "A tree that keeps its values ordered so search and insert follow a single path.",
  minutes: 12,
  level: "beginner",
  goals: [
    "The left-smaller, right-larger rule",
    "How search and insert walk down one path",
    "Why the cost is the height of the tree",
    "How sorted input breaks the structure",
  ],
  takeaways: [
    "In a binary search tree every value in the left subtree is smaller and every value in the right subtree is larger.",
    "Search and insert compare once per level and go left or right, so both cost O(h).",
    "Inserting already sorted keys produces a skewed tree and turns the O(log n) promise into O(n).",
  ],
  hud: [
    { label: "Comparisons", icon: "swap" },
    { label: "Height", icon: "layers" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "search(node, x):",
    "    while node is not empty:",
    "        if x == node.key: return node",
    "        if x < node.key: node = node.left",
    "        else: node = node.right",
    "    return not found",
    "insert(node, x):",
    "    walk down as in search until an empty spot is reached",
    "    attach a new leaf holding x at that spot",
  ],
  steps: [
    {
      short: "The rule",
      title: "Order built into the shape",
      body: [
        "A binary search tree (BST) is a binary tree with one extra rule: for every node, everything in its left subtree is smaller and everything in its right subtree is larger.",
        "Look at the root `8`. The values `3, 1, 6, 4, 7` are all smaller and sit left; `10, 14` are all larger and sit right. The same holds again at every node below.",
      ],
      callout: {
        kind: "insight",
        text: "The rule applies to whole subtrees, not just to the two children. 7 is under 3 and is larger than 6, but it is still smaller than 8.",
      },
      metrics: [
        { label: "Comparisons", value: "0" },
        { label: "Height", value: "3" },
      ],
      scene: view(WITHOUT_12, { 0: "mark" }, "left subtree < node < right subtree"),
    },
    {
      short: "Search: 8",
      title: "Search for 7: compare with the root",
      body: [
        "We want `7`. Start at the root: `7 < 8`, so if `7` exists at all it must be in the left subtree. The whole right side, three nodes, is ruled out with one comparison.",
      ],
      metrics: [
        { label: "Comparisons", value: "1" },
        { label: "Height", value: "3" },
      ],
      lines: [2, 4],
      scene: view(
        WITHOUT_12,
        { 0: "active", 2: "muted", 6: "muted", 13: "muted" },
        "looking for 7: 7 < 8, go left",
        { 1: "active", 2: "muted" },
      ),
    },
    {
      short: "Search: 3",
      title: "Compare with 3, go right",
      body: [
        "At `3`: `7 > 3`, so `7` must be to the right. The node `1` and everything below it can be skipped.",
        "Each step throws away a whole subtree without looking inside it. That is the same trick as binary search on an array.",
      ],
      metrics: [
        { label: "Comparisons", value: "2" },
        { label: "Height", value: "3" },
      ],
      lines: [2, 5],
      scene: view(
        WITHOUT_12,
        { 0: "done", 1: "active", 3: "muted", 2: "muted", 6: "muted" },
        "looking for 7: 7 > 3, go right",
        { 4: "active", 3: "muted", 2: "muted" },
      ),
    },
    {
      short: "Search: 6",
      title: "Compare with 6, go right again",
      body: ["At `6`: `7 > 6`, so we go right once more. The left child `4` is skipped."],
      metrics: [
        { label: "Comparisons", value: "3" },
        { label: "Height", value: "3" },
      ],
      lines: [2, 5],
      scene: view(
        WITHOUT_12,
        { 0: "done", 1: "done", 4: "active", 9: "muted", 3: "muted", 2: "muted", 6: "muted" },
        "looking for 7: 7 > 6, go right",
        { 10: "active", 9: "muted" },
      ),
    },
    {
      short: "Found 7",
      title: "Found after 4 comparisons",
      body: [
        "The node reached is `7`, equal to the target, so the search stops. Four comparisons found it among eight values.",
        "Had we reached an empty spot instead, the answer would be 'not present', and that empty spot is exactly where the value would be inserted.",
      ],
      metrics: [
        { label: "Comparisons", value: "4" },
        { label: "Height", value: "3" },
        { label: "Cost", value: "one per level", level: "good" },
      ],
      lines: [3],
      scene: view(
        WITHOUT_12,
        { 0: "done", 1: "done", 4: "done", 10: "found" },
        "7 found",
        { 10: "found" },
        "path: 8 → 3 → 6 → 7",
      ),
    },
    {
      short: "Insert 12",
      title: "Insert 12: search, then attach a leaf",
      body: [
        "Insertion is a failed search. `12 > 8`, go right; `12 > 10`, go right; `12 < 14`, go left. The left child of `14` is empty, so the new node goes there.",
        "The new value always becomes a leaf. No existing node moves, which keeps insertion simple.",
      ],
      callout: {
        kind: "tip",
        text: "Inserting a value that is already present needs a rule (ignore it, count it, or put it consistently on one side). Decide before you write the code.",
      },
      metrics: [
        { label: "Comparisons", value: "3" },
        { label: "Height", value: "3" },
      ],
      lines: [7, 8, 9],
      scene: view(
        WITH_12,
        { 0: "done", 2: "done", 6: "done", 13: "found" },
        "12 > 8, 12 > 10, 12 < 14: attach as left child of 14",
        { 2: "active", 6: "active", 13: "found" },
      ),
    },
    {
      short: "Cost = height",
      title: "Every operation walks one path",
      body: [
        "Search and insert do one comparison per level and never go back up, so they cost `O(h)` where `h` is the height. Balanced, that is about `log2(n)`: a million values need around 20 steps.",
        "The tree's shape depends on the order the values were inserted, and that decides how tall it gets.",
      ],
      metrics: [
        { label: "Comparisons", value: "h + 1" },
        { label: "Height", value: "3" },
        { label: "Cost", value: "O(h)", level: "good" },
      ],
      lines: [2, 4, 5],
      scene: view(
        WITH_12,
        { 0: "mark", 2: "mark", 6: "mark", 13: "mark" },
        "9 values, height 3: at most 4 comparisons",
        { 2: "active", 6: "active", 13: "active" },
      ),
    },
    {
      short: "Sorted input",
      title: "Sorted input builds a chain",
      body: [
        "Insert `1, 2, 3, 4, 5` in that order. Each new value is larger than everything so far, so it always goes right of the last node. The tree becomes a chain of height 4.",
        "Insert the same five values as `3, 2, 4, 1, 5` and the height is only 2. Same data, different order, very different cost.",
      ],
      callout: {
        kind: "warn",
        text: "Data that arrives already sorted, or nearly so, is common in real life (timestamps, ids). A plain BST degrades to a linked list on it.",
      },
      metrics: [
        { label: "Height", value: "4 vs 2", level: "bad" },
        { label: "Cost", value: "O(n) vs O(log n)", level: "bad" },
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
        label("l1", 160, 270, "order 3 2 4 1 5: height 2", { size: 12, tone: "good", weight: 800 }),
        label("l2", 470, 270, "order 1 2 3 4 5: height 4", { size: 12, tone: "warn", weight: 800 }),
      ),
    },
    {
      short: "Recap",
      title: "The BST bargain",
      body: [
        "You pay for keeping order: each node costs a little extra memory, and the tree must be kept short. In return search, insert and finding the minimum or maximum all take `O(h)`.",
        "An inorder walk lists the values sorted. To stop sorted input from wrecking the shape, trees can rebalance themselves, which is a later lesson.",
      ],
      metrics: [
        { label: "Height", value: "log n to n" },
        { label: "Cost", value: "O(h)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 80, "left < node < right, at every node", { size: 14, weight: 800 }),
        label("t2", 320, 125, "search / insert: one comparison per level", {
          size: 14,
          weight: 800,
        }),
        label("t3", 320, 170, "cost O(h): about log n if balanced", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("t4", 320, 215, "sorted insert order: O(n)", { size: 14, weight: 800, tone: "warn" }),
      ),
    },
  ],
};
