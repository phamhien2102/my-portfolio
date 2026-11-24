import { bars, graph, label, matrix, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const NODES: Record<string, [number, number]> = {
  A: [60, 120],
  B: [190, 50],
  C: [190, 190],
  D: [330, 120],
  E: [460, 120],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["C", "D"],
  ["D", "E"],
];
const DIRECTED: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["D", "C"],
  ["D", "E"],
];
const NAMES = ["A", "B", "C", "D", "E"];
const ADJ: Record<string, string[]> = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D"],
  D: ["B", "C", "E"],
  E: ["D"],
};

const MATRIX = NAMES.map((a) => NAMES.map((b) => (ADJ[a].includes(b) ? 1 : 0)));

/** The adjacency matrix with its row and column headers. */
function matrixScene(tones: Record<string, "active" | "found"> = {}, note?: string) {
  return scene(
    matrix(MATRIX, { x: 320, y: 140, tones }),
    NAMES.map((n, i) => label(`col${n}`, 220 + i * 50, 24, n, { size: 13, weight: 800 })),
    NAMES.map((n, i) => label(`row${n}`, 172, 62 + i * 44 + 5, n, { size: 13, weight: 800 })),
    note && label("note", 320, 275, note, { size: 13, weight: 800, tone: "good" }),
  );
}

/** The adjacency list: one row of neighbours per vertex. */
function listScene(note?: string) {
  const parts = NAMES.map((n, r) => {
    const y = 40 + r * 48;
    const nb = ADJ[n];
    const total = nb.length * 46 - 6;
    return [
      row([n], { id: `v${r}`, x: 120, y, w: 44, h: 36, tones: () => "mark" }),
      row(nb, { id: `l${r}`, x: 180 + total / 2, y, w: 40, h: 36, gap: 6 }),
    ];
  });
  return scene(
    parts.flat(2),
    note && label("note", 320, 285, note, { size: 13, weight: 800, tone: "good" }),
  );
}

export const graphRepresentation: AlgoLesson = {
  id: "graph-representation",
  title: "Graph Representation",
  summary: "Store vertices and edges in a matrix or an adjacency list, and learn which one fits.",
  minutes: 11,
  level: "beginner",
  goals: [
    "What vertices and edges are",
    "Directed, undirected and weighted graphs",
    "How an adjacency matrix and an adjacency list store the same graph",
    "Space and lookup costs, and when to pick each",
  ],
  takeaways: [
    "A graph is a set of vertices joined by edges, and edges may be directed or carry weights.",
    "An adjacency matrix costs O(V²) space but answers 'is there an edge?' in O(1); an adjacency list costs O(V+E).",
    "Most real graphs are sparse, so the adjacency list is the default and the matrix is for dense graphs.",
  ],
  hud: [
    { label: "Vertices", icon: "grid" },
    { label: "Edges", icon: "link" },
    { label: "Memory", icon: "memory" },
    { label: "Edge lookup", icon: "search" },
  ],
  pseudocode: [
    "build_list(V, edges):",
    "    adj = an empty list for each vertex",
    "    for each (u, v) in edges:",
    "        add v to adj[u]",
    "        add u to adj[v]",
    "    return adj",
    "has_edge(M, u, v):",
    "    return M[u][v] == 1",
    "neighbours(adj, v):",
    "    return adj[v]",
  ],
  steps: [
    {
      short: "Graph",
      title: "Things and the links between them",
      body: [
        "A graph has vertices (the things) and edges (the links). Cities and roads, people and friendships, web pages and hyperlinks all fit.",
        "This one has five vertices `A` to `E` and five edges. Before we can search it, we must decide how to store it in memory.",
      ],
      metrics: [
        { label: "Vertices", value: "5" },
        { label: "Edges", value: "5" },
      ],
      scene: scene(
        graph(NODES, EDGES),
        label("cap", 320, 255, "V = 5 vertices, E = 5 edges", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Directed",
      title: "Edges can have a direction",
      body: [
        "In an undirected graph an edge works both ways: if `A` is linked to `B`, then `B` is linked to `A`. A friendship is like that.",
        "In a directed graph each edge is an arrow. `D → C` does not give you `C → D`. Following a Twitter account or a 'depends on' rule is directed.",
      ],
      callout: {
        kind: "insight",
        text: "An undirected edge is just two directed edges, one each way. That is why storage counts it twice.",
      },
      metrics: [
        { label: "Vertices", value: "5" },
        { label: "Edges", value: "5" },
      ],
      scene: scene(
        graph(NODES, DIRECTED, { directed: true }),
        label("cap", 320, 255, "directed: D → C is not C → D", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Weighted",
      title: "Edges can carry a weight",
      body: [
        "A weighted graph attaches a number to each edge: a distance, a price, a travel time. Shortest-path algorithms such as Dijkstra's use those numbers.",
        "The weight is extra data stored with the edge, whatever representation you choose.",
      ],
      metrics: [
        { label: "Vertices", value: "5" },
        { label: "Edges", value: "5" },
      ],
      scene: scene(
        graph(NODES, EDGES, { weights: { "A-B": 4, "A-C": 2, "B-D": 5, "C-D": 1, "D-E": 3 } }),
        label("cap", 320, 255, "weights: distance, cost or time", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Matrix",
      title: "Adjacency matrix: a V by V table",
      body: [
        "Make a grid with one row and one column per vertex. Cell `[i][j]` is `1` when there is an edge from `i` to `j`, otherwise `0`.",
        "The edge `A–B` shows up twice, at `[A][B]` and `[B][A]`, so an undirected matrix is symmetric.",
      ],
      metrics: [
        { label: "Vertices", value: "5" },
        { label: "Edges", value: "5" },
        { label: "Memory", value: "25 cells", level: "warn" },
        { label: "Edge lookup", value: "O(1)", level: "good" },
      ],
      lines: [7, 8],
      scene: matrixScene({ "0,1": "active", "1,0": "active" }, "A–B appears at [A][B] and [B][A]"),
    },
    {
      short: "Matrix cost",
      title: "Instant lookup, expensive storage",
      body: [
        "To ask 'is `D` linked to `E`?' you read one cell: `O(1)`. There is no searching.",
        "But the table always has `V × V` cells, even when almost all are `0`. A graph of a million vertices would need a trillion cells.",
        "Listing a vertex's neighbours means scanning its whole row, which is `O(V)` even for a vertex with two neighbours.",
      ],
      callout: {
        kind: "warn",
        text: "Space is O(V²) no matter how few edges there are. Sparse graphs waste almost all of it.",
      },
      metrics: [
        { label: "Memory", value: "O(V²)", level: "bad" },
        { label: "Edge lookup", value: "O(1)", level: "good" },
      ],
      lines: [7, 8],
      scene: matrixScene({ "3,4": "found" }, "is D linked to E? read one cell: 1"),
    },
    {
      short: "List",
      title: "Adjacency list: neighbours only",
      body: [
        "Keep, for every vertex, a list of just its neighbours. `D` stores `B, C, E`; `E` stores only `D`.",
        "Nothing is stored for missing edges. The lists hold `V` headers plus `2E` entries for an undirected graph.",
      ],
      metrics: [
        { label: "Vertices", value: "5" },
        { label: "Edges", value: "5" },
        { label: "Memory", value: "15 slots", level: "good" },
        { label: "Edge lookup", value: "O(deg)", level: "warn" },
      ],
      lines: [1, 2, 3, 4, 5, 6],
      scene: listScene("each list holds only the real neighbours"),
    },
    {
      short: "Space",
      title: "Space: V² against V + E",
      body: [
        "For this tiny graph the matrix needs `25` cells and the list about `15` slots. The gap is small now, but it widens fast.",
        "With `V` vertices the matrix grows with `V²`, while the list grows with `V + E`. A road map with a million junctions has only a few million roads, not a trillion.",
      ],
      metrics: [
        { label: "Memory", value: "25 vs 15", level: "warn" },
        { label: "Edge lookup", value: "O(1) vs O(deg)" },
      ],
      scene: scene(
        bars([25, 15], { x: 320, y: 190, w: 70, gap: 90, tones: { 0: "warn", 1: "found" } }),
        label("l0", 245, 220, "matrix", { size: 13, weight: 800 }),
        label("l0b", 245, 242, "V² = 25", { size: 12, tone: "muted" }),
        label("l1", 395, 220, "list", { size: 13, weight: 800 }),
        label("l1b", 395, 242, "V + 2E = 15", { size: 12, tone: "muted" }),
      ),
    },
    {
      short: "Trade-offs",
      title: "What each shape is good at",
      body: [
        "Searches such as BFS and DFS spend their time asking 'what are this vertex's neighbours?'. A list answers that by reading exactly those neighbours, so a full search costs `O(V + E)`.",
        "A matrix answers 'is there an edge between these two?' fastest, but walking neighbours costs a whole row.",
      ],
      callout: {
        kind: "tip",
        text: "In code, a list is usually a map from vertex to an array of neighbours: graph[u].push(v).",
      },
      metrics: [
        { label: "Memory", value: "list O(V+E)", level: "good" },
        { label: "Edge lookup", value: "matrix O(1)" },
      ],
      lines: [8, 10],
      scene: scene(
        label("h1", 170, 50, "adjacency list", { size: 15, weight: 800, tone: "good" }),
        label("a1", 170, 90, "neighbours of v: deg(v)", { size: 13 }),
        label("a2", 170, 120, "space O(V + E)", { size: 13 }),
        label("a3", 170, 150, "BFS / DFS in O(V + E)", { size: 13 }),
        label("h2", 470, 50, "adjacency matrix", { size: 15, weight: 800, tone: "warn" }),
        label("b1", 470, 90, "edge u–v test: O(1)", { size: 13 }),
        label("b2", 470, 120, "space O(V²)", { size: 13 }),
        label("b3", 470, 150, "neighbours of v: O(V)", { size: 13 }),
      ),
    },
    {
      short: "Choose",
      title: "Pick by density",
      body: [
        "Count the edges. A sparse graph has `E` near `V`, like roads or social links: use an adjacency list. A dense graph has `E` near `V²`, or you need constant-time edge tests: the matrix earns its space.",
        "When in doubt, use the list. Every algorithm in the rest of this unit assumes one.",
      ],
      metrics: [
        { label: "Memory", value: "sparse: list", level: "good" },
        { label: "Edge lookup", value: "dense: matrix" },
      ],
      scene: scene(
        label("r1", 320, 80, "E close to V  →  sparse  →  adjacency list", {
          size: 15,
          weight: 800,
          tone: "good",
        }),
        label("r2", 320, 140, "E close to V²  →  dense  →  adjacency matrix", {
          size: 15,
          weight: 800,
          tone: "warn",
        }),
        label("r3", 320, 200, "default choice: the list", { size: 14, tone: "muted" }),
      ),
    },
  ],
};
