import { disc, edge, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Item, Tone } from "../lib/types";

interface View {
  parent: number[];
  tones?: Record<number, Tone>;
  edgeTones?: Record<number, EdgeTone>;
  subs?: Record<number, string>;
  cells?: Record<number, Tone>;
  caption?: string;
}

/** Lay the forest out (children under their parent), draw child → parent arrows, and show the parent[] array. */
function view(v: View) {
  const { parent } = v;
  const kids: number[][] = parent.map(() => []);
  const roots: number[] = [];
  parent.forEach((p, i) => (p === i ? roots.push(i) : kids[p].push(i)));
  const pos: Record<number, { x: number; y: number }> = {};
  let leaf = 0;
  const W = 64;
  const place = (n: number, depth: number): number => {
    if (kids[n].length === 0) {
      pos[n] = { x: leaf++ * W, y: depth * 62 };
      return pos[n].x;
    }
    const xs = kids[n].map((c) => place(c, depth + 1));
    pos[n] = { x: (xs[0] + xs[xs.length - 1]) / 2, y: depth * 62 };
    return pos[n].x;
  };
  roots.forEach((r) => place(r, 0));
  const left = 320 - ((leaf - 1) * W) / 2;
  const items: Item[] = [];
  parent.forEach((p, i) => {
    if (p !== i)
      items.push(edge(`ue${i}`, `u${i}`, `u${p}`, { arrow: "end", tone: v.edgeTones?.[i] }));
  });
  parent.forEach((_, i) =>
    items.push(
      disc(`u${i}`, left + pos[i].x, 45 + pos[i].y, i, {
        r: 19,
        tone: v.tones?.[i],
        sub: v.subs?.[i],
      }),
    ),
  );
  return scene(
    items,
    label("pl", 320, 285, "parent[ ]", { size: 11, tone: "muted" }),
    row(parent, { id: "p", y: 322, w: 38, h: 40, index: true, tones: (i) => v.cells?.[i] }),
    v.caption && label("cap", 320, 392, v.caption, { size: 13, weight: 800 }),
  );
}

const P0 = [0, 1, 2, 3, 4, 5, 6, 7];
const P1 = [0, 0, 2, 3, 4, 5, 6, 7];
const P2 = [0, 0, 0, 2, 4, 5, 6, 7];
const P3 = [0, 0, 0, 2, 5, 6, 7, 7];
const P4 = [0, 0, 0, 2, 7, 7, 7, 7];
const P5 = [0, 0, 0, 2, 7, 7, 7, 0];

export const unionFind: AlgoLesson = {
  id: "union-find",
  title: "Union-Find",
  summary:
    "Track which items are grouped together with a forest in an array, merging sets in near-constant time.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "How disjoint sets are stored as a forest in a parent array",
    "What find and union do",
    "Why long chains are slow",
    "How path compression and union by rank flatten the trees",
  ],
  takeaways: [
    "Every set is a tree whose root is its representative, stored as a single parent array.",
    "find walks up to the root, and union links one root under the other.",
    "Path compression plus union by rank make each operation almost constant time, O(α(n)).",
  ],
  hud: [
    { label: "Sets", icon: "layers" },
    { label: "Hops in find", icon: "link" },
    { label: "Tallest tree", icon: "branch" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "find(x):",
    "    if parent[x] != x:",
    "        parent[x] = find(parent[x])",
    "    return parent[x]",
    "union(a, b):",
    "    ra = find(a); rb = find(b)",
    "    if ra == rb: return",
    "    if rank[ra] < rank[rb]: swap(ra, rb)",
    "    parent[rb] = ra",
    "    if rank[ra] == rank[rb]: rank[ra] += 1",
  ],
  steps: [
    {
      short: "The problem",
      title: "Keeping groups of friends",
      body: [
        "We have 8 items, each alone in its own set. Over time we are told 'these two belong together', and must be able to ask 'are these two in the same set?'",
        "Store a `parent` array. `parent[i] = i` means `i` is a root: the leader of its set. At the start everyone leads themselves.",
      ],
      metrics: [
        { label: "Sets", value: "8" },
        { label: "Tallest tree", value: "0" },
      ],
      scene: view({ parent: P0, caption: "8 items, 8 sets" }),
    },
    {
      short: "Union",
      title: "union links two roots",
      body: [
        "`union(0, 1)` first finds the root of each: `0` and `1`. They differ, so make one root point to the other: `parent[1] = 0`.",
        "Notice that only one array cell changed, no matter how big the sets are.",
      ],
      metrics: [
        { label: "Sets", value: "7" },
        { label: "Tallest tree", value: "1" },
      ],
      lines: [6, 7, 9],
      scene: view({
        parent: P1,
        tones: { 0: "found", 1: "active" },
        cells: { 1: "active" },
        edgeTones: { 1: "active" },
        caption: "union(0, 1): parent[1] = 0",
      }),
    },
    {
      short: "More unions",
      title: "Merging bigger sets",
      body: [
        "`union(2, 3)` sets `parent[3] = 2`. Then `union(1, 3)`: `find(1)` is `0`, `find(3)` is `2`, different roots, so link root `2` under root `0`.",
        "We link roots, not the items passed in. Items `1` and `3` are now connected through the shared root `0`.",
      ],
      callout: {
        kind: "tip",
        text: "Always call find on both arguments first; linking non-roots would split a set apart.",
      },
      metrics: [
        { label: "Sets", value: "5" },
        { label: "Tallest tree", value: "2" },
      ],
      lines: [6, 7, 9],
      scene: view({
        parent: P2,
        tones: { 0: "found", 2: "active" },
        cells: { 2: "active", 3: "active" },
        caption: "union(2, 3) then union(1, 3): root 2 goes under root 0",
      }),
    },
    {
      short: "Find",
      title: "find walks up to the root",
      body: [
        "`find(3)` follows parents: `3 → 2 → 0`. At `0`, `parent[0] == 0`, so `0` is the root and the representative of the set.",
        "Two items are in the same set exactly when their `find` results match. Cost: one hop per level of the tree.",
      ],
      metrics: [
        { label: "Sets", value: "5" },
        { label: "Hops in find", value: "2" },
        { label: "Tallest tree", value: "2" },
      ],
      lines: [2, 4],
      scene: view({
        parent: P2,
        tones: { 3: "active", 2: "active", 0: "found" },
        edgeTones: { 3: "active", 2: "active" },
        caption: "find(3): 3 → 2 → 0, root = 0",
      }),
    },
    {
      short: "Long chain",
      title: "Chains make find slow",
      body: [
        "Suppose unions arrive in an unlucky order and build the chain `4 → 5 → 6 → 7`. Now `find(4)` needs three hops, and with `n` items a chain costs `O(n)` per call.",
        "Both fixes below attack the height of the trees.",
      ],
      callout: {
        kind: "warn",
        text: "A plain union that always attaches the first root under the second can degenerate into a linked list.",
      },
      metrics: [
        { label: "Sets", value: "2" },
        { label: "Hops in find", value: "3", level: "bad" },
        { label: "Tallest tree", value: "3", level: "bad" },
      ],
      lines: [2, 4],
      scene: view({
        parent: P3,
        tones: { 4: "warn", 5: "warn", 6: "warn", 7: "found" },
        edgeTones: { 4: "warn", 5: "warn", 6: "warn" },
        caption: "find(4): 4 → 5 → 6 → 7 takes 3 hops",
      }),
    },
    {
      short: "Compression",
      title: "Path compression: flatten on the way",
      body: [
        "While `find(4)` walks to the root, remember every node it passes, then point each one straight at the root: `parent[4] = parent[5] = parent[6] = 7`.",
        "The first call still costs 3 hops, but now `4`, `5` and `6` are one hop from the root. Later calls are almost free.",
      ],
      callout: {
        kind: "insight",
        text: "The work of one slow find is spent once and pays back on every later find through those nodes.",
      },
      metrics: [
        { label: "Sets", value: "2" },
        { label: "Hops in find", value: "1", level: "good" },
        { label: "Tallest tree", value: "1", level: "good" },
      ],
      lines: [2, 3],
      scene: view({
        parent: P4,
        tones: { 4: "active", 5: "active", 6: "active", 7: "found" },
        cells: { 4: "active", 5: "active", 6: "active" },
        caption: "after compression: 4, 5, 6 all point at 7",
      }),
    },
    {
      short: "By rank",
      title: "Union by rank: short under tall",
      body: [
        "Rank is an upper bound on a tree's height. When merging, hang the lower-rank root under the higher one. Root `0` has rank 2, root `7` has rank 1, so `parent[7] = 0`.",
        "Equal ranks: pick either and increase the winner's rank by one. Hanging the short tree under the tall one keeps the overall height from growing.",
      ],
      metrics: [
        { label: "Sets", value: "1" },
        { label: "Hops in find", value: "2" },
        { label: "Tallest tree", value: "2" },
      ],
      lines: [8, 9, 10],
      scene: view({
        parent: P5,
        tones: { 0: "found", 7: "mark" },
        subs: { 0: "r2", 7: "r1" },
        cells: { 7: "active" },
        edgeTones: { 7: "active" },
        caption: "union(0, 4): rank 1 under rank 2, so parent[7] = 0",
      }),
    },
    {
      short: "Cost",
      title: "Nearly constant time",
      body: [
        "With both tricks, a sequence of `m` operations on `n` items costs `O(m · α(n))`, where `α` is the inverse Ackermann function. It is below 5 for any input that fits in the universe.",
        "Space is just the `parent` array (plus a rank array): `O(n)`. This is why union-find powers Kruskal's algorithm and connected-component counting.",
      ],
      metrics: [
        { label: "Hops in find", value: "~O(α(n))", level: "good" },
        { label: "Cost", value: "≈ O(1) each", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 70, "find(x): climb to the root, point everyone passed at it", {
          size: 14,
        }),
        label("t2", 320, 115, "union(a, b): link the lower-rank root under the other", {
          size: 14,
        }),
        label("t3", 320, 160, "same set?  find(a) == find(b)", { size: 14 }),
        label("t4", 320, 220, "amortised O(α(n))   space O(n)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
