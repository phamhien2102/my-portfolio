import { label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Item, Tone } from "../lib/types";

// a = [2, 5, 1, 4, 9, 3, 7, 6]; every internal node holds the sum of its range.
//                        37 [0-7]
//              12 [0-3]             25 [4-7]
//          7 [0-1]  5 [2-3]    12 [4-5]  13 [6-7]
//         2   5     1   4      9   3     7   6
const A = [2, 5, 1, 4, 9, 3, 7, 6];
const SUMS = [37, 12, 25, 7, 5, 12, 13, ...A];
const SUMS_AFTER = [43, 18, 25, 7, 11, 12, 13, 2, 5, 1, 10, 9, 3, 7, 6];
const RANGE = ["0-7", "0-3", "4-7", "0-1", "2-3", "4-5", "6-7"];

/** Add the range (internal nodes) or index (leaves) under each disc. */
const withSubs = (items: Item[]): Item[] =>
  items.map((it) => {
    if (it.t !== "disc") return it;
    const i = Number(it.id.slice(1));
    return { ...it, sub: i < 7 ? `[${RANGE[i]}]` : `[${i - 7}]` };
  });

function view(
  values: number[],
  tones: Record<number, Tone>,
  cap?: string,
  res?: string,
  edgeTones: Record<number, EdgeTone> = {},
) {
  return scene(
    withSubs(tree(values, { x: 320, y: 40, width: 560, dy: 66, tones, edgeTones })),
    cap && label("cap", 320, 285, cap, { size: 13, weight: 800 }),
    res && label("res", 320, 318, res, { size: 13, weight: 800, tone: "good" }),
  );
}

export const segmentTrees: AlgoLesson = {
  id: "segment-trees",
  title: "Segment Trees",
  summary: "Answer range-sum queries and point updates in O(log n) with a tree of partial sums.",
  minutes: 14,
  level: "advanced",
  goals: [
    "How leaves hold the array and internal nodes hold range sums",
    "How to build the tree bottom-up",
    "Why a range query touches only O(log n) nodes",
    "How a point update walks up to the root",
    "When to prefer it over prefix sums",
  ],
  takeaways: [
    "Each internal node stores the sum of a range, and the range of a node is the union of its two children's ranges.",
    "A range query takes whole nodes that fit inside the range, skips those outside and splits the rest, touching O(log n) nodes.",
    "Prefix sums answer queries in O(1) but updates cost O(n); a segment tree makes both queries and updates O(log n).",
  ],
  hud: [
    { label: "Nodes visited", icon: "search" },
    { label: "Partial sum", icon: "sigma" },
    { label: "Nodes changed", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "build(node, lo, hi):",
    "    if lo == hi: tree[node] = a[lo]; return",
    "    build both halves of the range",
    "    tree[node] = tree[left] + tree[right]",
    "query(node, lo, hi, l, r):",
    "    if [lo, hi] is inside [l, r]: return tree[node]",
    "    if [lo, hi] is outside [l, r]: return 0",
    "    return query(left half) + query(right half)",
    "update(node, lo, hi, i, delta):",
    "    tree[node] = tree[node] + delta",
    "    if lo == hi: return",
    "    update whichever half contains i",
  ],
  steps: [
    {
      short: "The problem",
      title: "Many range sums, and the data changes",
      body: [
        "You hold eight numbers and must answer many questions like 'what is the sum of positions 2 to 6?', while single values also get updated now and then.",
        "Adding up the range each time costs `O(n)` per question. Precomputing totals helps with queries but hurts updates. We want both to be fast.",
      ],
      metrics: [{ label: "Cost", value: "O(n) per query", level: "warn" }],
      scene: scene(
        row(A, {
          y: 150,
          index: true,
          w: 62,
          tones: (i) => (i >= 2 && i <= 6 ? "mark" : undefined),
        }),
        label("q", 320, 70, "sum of a[2..6] = ?", { size: 15, weight: 800 }),
      ),
    },
    {
      short: "The shape",
      title: "Leaves are the array, parents are sums",
      body: [
        "Put the eight values as the leaves of a complete binary tree. Each parent stores the sum of its two children, so every internal node stands for a range of the array, shown in brackets.",
        "The root covers `[0-7]` and holds the total, `37`. The next level covers `[0-3]` and `[4-7]`, then pairs, then single elements.",
      ],
      metrics: [
        { label: "Nodes visited", value: "0" },
        { label: "Cost", value: "15 nodes for 8 values" },
      ],
      scene: view(SUMS, {}, "each node = sum of its range = left child + right child"),
    },
    {
      short: "Build",
      title: "Build it from the bottom",
      body: [
        "Fill the leaves with the array, then compute each parent from its children. The pair `[0-1]` is `2 + 5 = 7`, the pair `[2-3]` is `1 + 4 = 5`, and so on up to the root.",
        "Every node is computed once from two already known values, so building the whole tree costs `O(n)`.",
      ],
      callout: {
        kind: "tip",
        text: "Stored as an array like a heap, node i has children 2i+1 and 2i+2, and the leaves of n values start at index n - 1.",
      },
      metrics: [
        { label: "Nodes visited", value: "15" },
        { label: "Cost", value: "O(n) build", level: "good" },
      ],
      lines: [2, 3, 4],
      scene: view(SUMS, { 3: "active", 7: "mark", 8: "mark" }, "[0-1]: 2 + 5 = 7", undefined, {
        7: "active",
        8: "active",
      }),
    },
    {
      short: "Query rules",
      title: "Three rules for a range query",
      body: [
        "To sum positions `2..6`, start at the root and ask each node how its range relates to the query. If its range lies completely inside `2..6`, take its stored sum and stop.",
        "If its range is completely outside, return `0` and stop. If it overlaps partly, ask both children and add their answers.",
      ],
      metrics: [
        { label: "Nodes visited", value: "0" },
        { label: "Partial sum", value: "0" },
      ],
      lines: [6, 7, 8],
      scene: view(
        SUMS,
        { 9: "mark", 10: "mark", 11: "mark", 12: "mark", 13: "mark" },
        "query 2..6:  inside → take sum,  outside → 0,  partial → split",
      ),
    },
    {
      short: "Trace",
      title: "The query only splits along two paths",
      body: [
        "The root `[0-7]` overlaps, so split. `[0-3]` overlaps, so split: its child `[0-1]` is outside (0), and `[2-3]` is inside, so take `5`. On the right, `[4-7]` overlaps: `[4-5]` is inside, take `12`, and `[6-7]` overlaps, so split into `[6]` which is inside (take `7`) and `[7]` which is outside.",
        "Nine nodes were visited out of fifteen, but only three sums were used.",
      ],
      callout: {
        kind: "insight",
        text: "At each level at most two nodes can be partial, the ones holding the query's two ends. That is why the work is O(log n).",
      },
      metrics: [
        { label: "Nodes visited", value: "9" },
        { label: "Partial sum", value: "5 + 12 + 7" },
        { label: "Cost", value: "O(log n)", level: "good" },
      ],
      lines: [6, 7, 8],
      scene: view(
        SUMS,
        {
          0: "active",
          1: "active",
          2: "active",
          6: "active",
          3: "muted",
          14: "muted",
          4: "found",
          5: "found",
          13: "found",
        },
        "green = taken whole, blue = split, grey = outside",
        undefined,
        { 4: "found", 5: "found", 13: "found", 3: "muted", 14: "muted" },
      ),
    },
    {
      short: "Answer",
      title: "Add the pieces",
      body: [
        "The range `2..6` was cut into three whole nodes: `[2-3]`, `[4-5]` and `[6]`. Their sums are `5`, `12` and `7`, and `5 + 12 + 7 = 24`.",
        "Check against the array: `1 + 4 + 9 + 3 + 7 = 24`. For `n` values a query takes at most about `2 log2(n)` pieces.",
      ],
      metrics: [
        { label: "Nodes visited", value: "9" },
        { label: "Partial sum", value: "24", level: "good" },
        { label: "Cost", value: "O(log n)", level: "good" },
      ],
      lines: [8],
      scene: view(
        SUMS,
        { 4: "found", 5: "found", 13: "found" },
        "sum of a[2..6]",
        "5 + 12 + 7 = 24",
        {
          4: "found",
          5: "found",
          13: "found",
        },
      ),
    },
    {
      short: "Update",
      title: "Point update: walk up and fix",
      body: [
        "Change `a[3]` from `4` to `10`, an increase of `6`. Update that leaf, then every ancestor, each of which must reflect the change: `[2-3]` goes `5 → 11`, `[0-3]` goes `12 → 18`, the root `37 → 43`.",
        "Only the nodes on one path from leaf to root change, so an update touches `O(log n)` nodes. The other eleven nodes are unaffected.",
      ],
      callout: {
        kind: "warn",
        text: "Remember to add the difference (or recompute from the two children) at every ancestor. Updating only the leaf leaves stale sums above it.",
      },
      metrics: [
        { label: "Nodes changed", value: "4" },
        { label: "Cost", value: "O(log n)", level: "good" },
      ],
      lines: [10, 11, 12],
      scene: view(
        SUMS_AFTER,
        { 10: "found", 4: "active", 1: "active", 0: "active" },
        "a[3]: 4 → 10, then 11, 18, 43 on the way up",
        undefined,
        {
          10: "found",
          4: "active",
          1: "active",
        },
      ),
    },
    {
      short: "Vs prefix",
      title: "Compare with prefix sums",
      body: [
        "A prefix-sum array answers any range in `O(1)` by subtracting two entries, but one changed value forces recomputing up to `n` entries.",
        "A segment tree charges `O(log n)` for both. If the data never changes, prefix sums win. If it changes between queries, the segment tree wins as `n` grows.",
      ],
      metrics: [{ label: "Cost", value: "see table", level: "good" }],
      scene: scene(
        label("h0", 320, 60, "operation", { size: 12, tone: "muted" }),
        label("h1", 150, 60, "build", { size: 13, weight: 800 }),
        label("h2", 320, 60, "query", { size: 13, weight: 800 }),
        label("h3", 490, 60, "update", { size: 13, weight: 800 }),
        label("p0", 20, 110, "prefix sums", { size: 13, weight: 800, anchor: "start" }),
        label("p1", 150, 110, "O(n)", { size: 14 }),
        label("p2", 320, 110, "O(1)", { size: 14, tone: "good" }),
        label("p3", 490, 110, "O(n)", { size: 14, tone: "warn" }),
        label("s0", 20, 165, "segment tree", { size: 13, weight: 800, anchor: "start" }),
        label("s1", 150, 165, "O(n)", { size: 14 }),
        label("s2", 320, 165, "O(log n)", { size: 14 }),
        label("s3", 490, 165, "O(log n)", { size: 14, tone: "good" }),
      ),
    },
    {
      short: "Recap",
      title: "What to remember",
      body: [
        "A segment tree is a binary tree whose leaves are the array and whose internal nodes cache a combination, here the sum, of their range. It uses about `2n` nodes and builds in `O(n)`.",
        "Queries split only along the two ends of the range and updates climb one path, both `O(log n)`. The same idea works for minimum, maximum and gcd, anything combinable.",
      ],
      metrics: [
        { label: "Nodes visited", value: "O(log n)", level: "good" },
        { label: "Cost", value: "O(log n)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 80, "leaves = array, parent = left + right", { size: 14, weight: 800 }),
        label("t2", 320, 125, "query: whole nodes inside, skip outside, split partial", {
          size: 14,
          weight: 800,
        }),
        label("t3", 320, 170, "update: change one leaf, fix its ancestors", {
          size: 14,
          weight: 800,
        }),
        label("t4", 320, 215, "build O(n), query O(log n), update O(log n)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
