import { graph, label, matrix, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

const NODES: Record<string, [number, number]> = {
  A: [60, 60],
  B: [240, 60],
  C: [240, 210],
  D: [60, 210],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["B", "C"],
  ["C", "D"],
  ["D", "A"],
  ["A", "C"],
];
const W = { "A-B": 3, "B-C": 2, "C-D": 1, "D-A": 2, "A-C": 9 };
const NAMES = ["A", "B", "C", "D"];
const INF = "∞";

const M0 = [
  [0, 3, 9, INF],
  [INF, 0, 2, INF],
  [INF, INF, 0, 1],
  [2, INF, INF, 0],
];
const M1 = [
  [0, 3, 9, INF],
  [INF, 0, 2, INF],
  [INF, INF, 0, 1],
  [2, 5, 11, 0],
];
const M2 = [
  [0, 3, 5, INF],
  [INF, 0, 2, INF],
  [INF, INF, 0, 1],
  [2, 5, 7, 0],
];
const M3 = [
  [0, 3, 5, 6],
  [INF, 0, 2, 3],
  [INF, INF, 0, 1],
  [2, 5, 7, 0],
];
const M4 = [
  [0, 3, 5, 6],
  [5, 0, 2, 3],
  [3, 6, 0, 1],
  [2, 5, 7, 0],
];

const MX = 450;
const MY = 150;

interface View {
  m?: (number | string)[][];
  prev?: (number | string)[][];
  k?: number;
  tones?: Record<string, Tone>;
  edgeTones?: Record<string, EdgeTone>;
  caption?: string;
}

/** The graph on the left, the distance matrix on the right; cells changed since `prev` glow. */
function view(v: View) {
  const tones: Record<string, Tone> = { ...v.tones };
  if (v.m && v.prev)
    v.m.forEach((r, i) =>
      r.forEach((c, j) => {
        if (c !== v.prev![i][j]) tones[`${i},${j}`] = "mark";
      }),
    );
  return scene(
    graph(NODES, EDGES, {
      directed: true,
      weights: W,
      tones: v.k === undefined ? {} : { [NAMES[v.k]]: "mark" },
      edgeTones: v.edgeTones,
    }),
    v.m && matrix(v.m, { x: MX, y: MY, tones }),
    v.m &&
      NAMES.flatMap((n, i) => [
        label(`ch${i}`, MX - 75 + 50 * i, MY - 100, n, { size: 12, tone: "muted" }),
        label(`rh${i}`, MX - 110, MY - 66 + 44 * i + 5, n, {
          size: 12,
          tone: "muted",
          anchor: "end",
        }),
      ]),
    v.caption && label("cap", 320, 300, v.caption, { size: 13, weight: 800 }),
  );
}

export const floydWarshall: AlgoLesson = {
  id: "floyd-warshall",
  title: "Floyd–Warshall",
  summary:
    "Fill a distance matrix for every pair of nodes by trying each node as a stop-over in turn.",
  minutes: 14,
  level: "advanced",
  goals: [
    "What an all-pairs distance matrix holds",
    "The update rule d[i][j] = min(d[i][j], d[i][k] + d[k][j])",
    "Why the loop over k must be the outer one",
    "How the three nested loops give O(V³)",
  ],
  takeaways: [
    "Floyd-Warshall keeps a V by V matrix of best-known distances between every pair of nodes.",
    "For each node k in turn, it checks whether going i to k to j beats the current i to j.",
    "Three nested loops make it O(V³) time and O(V²) space, and it copes with negative edges.",
  ],
  hud: [
    { label: "k so far", icon: "layers" },
    { label: "Cells improved", icon: "swap" },
    { label: "Pairs known", icon: "grid" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "floyd_warshall(w, V):",
    "    d = copy of w  (0 on diagonal, infinity if no edge)",
    "    for k in 0 .. V-1:",
    "        for i in 0 .. V-1:",
    "            for j in 0 .. V-1:",
    "                if d[i][k] + d[k][j] < d[i][j]:",
    "                    d[i][j] = d[i][k] + d[k][j]",
    "    return d",
  ],
  steps: [
    {
      short: "The problem",
      title: "Distances between every pair",
      body: [
        "Dijkstra answers 'how far from one source'. Sometimes we want the distance between every pair of nodes: a whole route table at once.",
        "Here is a directed graph with four nodes. We want 16 answers, one per ordered pair.",
      ],
      metrics: [{ label: "Pairs known", value: "0 / 16" }],
      scene: view({}),
    },
    {
      short: "Start matrix",
      title: "Seed the matrix with direct edges",
      body: [
        "Row `i`, column `j` holds the best known distance from `i` to `j`. The diagonal is `0`, a direct edge gives its weight, and anything else is `∞`.",
        "These numbers use paths of zero intermediate stops. Each round will allow one more node as a stop.",
      ],
      metrics: [
        { label: "k so far", value: "none" },
        { label: "Pairs known", value: "9 / 16", level: "warn" },
      ],
      lines: [2],
      scene: view({ m: M0 }),
    },
    {
      short: "One update",
      title: "Try going through k",
      body: [
        "Fix an intermediate node `k = A`. For a pair `i = D`, `j = B`, compare the current `d[D][B] = ∞` with the detour `d[D][A] + d[A][B] = 2 + 3 = 5`.",
        "The detour wins, so `d[D][B]` becomes `5`. The rule is `d[i][j] = min(d[i][j], d[i][k] + d[k][j])`.",
      ],
      callout: {
        kind: "insight",
        text: "After round k, the matrix is exact for every path whose stops are only among the first k nodes.",
      },
      metrics: [
        { label: "k so far", value: "A (in progress)" },
        { label: "Cells improved", value: "1" },
        { label: "Pairs known", value: "10 / 16" },
      ],
      lines: [6, 7],
      scene: view({
        m: M0,
        k: 0,
        tones: { "3,0": "active", "0,1": "active", "3,1": "mark" },
        edgeTones: { "D-A": "active", "A-B": "active" },
        caption: "d[D][B] = min(∞, d[D][A] + d[A][B]) = 2 + 3 = 5",
      }),
    },
    {
      short: "k = A",
      title: "Round k = A done",
      body: [
        "The same check ran for all 16 pairs. Only paths through `A` improved: `D → B` became `5` and `D → C` became `2 + 9 = 11`.",
        "Highlighted cells are the ones that changed this round.",
      ],
      metrics: [
        { label: "k so far", value: "A" },
        { label: "Cells improved", value: "2" },
        { label: "Pairs known", value: "11 / 16" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: view({ m: M1, prev: M0, k: 0 }),
    },
    {
      short: "k = B",
      title: "Round k = B: a better way to C",
      body: [
        "Now `B` is allowed as a stop. `A → B → C` costs `3 + 2 = 5`, which beats the direct edge's `9`. Likewise `D → B → C` is `5 + 2 = 7`, beating `11`.",
        "A detour through a new node can replace an older, longer route.",
      ],
      metrics: [
        { label: "k so far", value: "A, B" },
        { label: "Cells improved", value: "2" },
        { label: "Pairs known", value: "11 / 16" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: view({ m: M2, prev: M1, k: 1 }),
    },
    {
      short: "k = C",
      title: "Round k = C: distances to D appear",
      body: [
        "With `C` as a stop, `A → C → D` is `5 + 1 = 6` and `B → C → D` is `2 + 1 = 3`. Two cells that were `∞` now have answers.",
        "Because `A` and `B` already knew their cheapest way to `C`, one addition is enough.",
      ],
      metrics: [
        { label: "k so far", value: "A, B, C" },
        { label: "Cells improved", value: "2" },
        { label: "Pairs known", value: "13 / 16" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: view({ m: M3, prev: M2, k: 2 }),
    },
    {
      short: "k = D",
      title: "Round k = D completes the table",
      body: [
        "Finally `D` may be a stop. `B → D → A` is `3 + 2 = 5`, `C → D → A` is `1 + 2 = 3` and `C → D → B` is `1 + 5 = 6`.",
        "All 16 entries are now exact. The matrix is the answer; no later round can lower anything.",
      ],
      callout: {
        kind: "tip",
        text: "Keep a second matrix of 'next hop' (or 'via k') values to rebuild the actual route between a pair.",
      },
      metrics: [
        { label: "k so far", value: "A, B, C, D" },
        { label: "Cells improved", value: "3" },
        { label: "Pairs known", value: "16 / 16", level: "good" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: view({ m: M4, prev: M3, k: 3 }),
    },
    {
      short: "Three loops",
      title: "Three nested loops, O(V³)",
      body: [
        "The whole algorithm is three loops. The outer one over `k` must stay outermost, otherwise a round would use stops that are not yet allowed.",
        "That gives `V × V × V` constant-time updates: `O(V³)` time, `O(V²)` space. Fine for a few hundred nodes, too slow for millions.",
      ],
      callout: {
        kind: "warn",
        text: "Swapping the loop order is the classic bug: k has to be the outermost loop.",
      },
      metrics: [
        { label: "Cells improved", value: "V³ checks" },
        { label: "Cost", value: "O(V³)", level: "warn" },
      ],
      lines: [3, 4, 5],
      scene: scene(
        label("c1", 100, 70, "for k in nodes:", { size: 15, weight: 800, anchor: "start" }),
        label("c2", 130, 115, "for i in nodes:", { size: 15, weight: 800, anchor: "start" }),
        label("c3", 160, 160, "for j in nodes:", { size: 15, weight: 800, anchor: "start" }),
        label("c4", 190, 205, "d[i][j] = min(d[i][j], d[i][k] + d[k][j])", {
          size: 14,
          anchor: "start",
        }),
        label("c5", 320, 265, "time O(V³)   space O(V²)", { size: 14, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Recap",
      title: "When to reach for it",
      body: [
        "Use Floyd-Warshall for small, dense graphs, or when you need every pair. It handles negative edges, and a negative number on the diagonal afterwards means a negative cycle.",
        "For one source on a sparse graph, run Dijkstra (or Bellman-Ford with negatives) instead; for every pair on a big sparse graph, run Dijkstra from each node.",
      ],
      metrics: [
        { label: "Pairs known", value: "16 / 16", level: "good" },
        { label: "Cost", value: "O(V³)", level: "warn" },
      ],
      scene: view({ m: M4, caption: "d[i][i] < 0 after the run  means a negative cycle" }),
    },
  ],
};
