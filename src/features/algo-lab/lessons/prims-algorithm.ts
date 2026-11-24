import { graph, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

const NODES: Record<string, [number, number]> = {
  A: [70, 150],
  B: [200, 60],
  C: [200, 240],
  D: [360, 60],
  E: [360, 240],
  F: [500, 150],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "C"],
  ["B", "D"],
  ["C", "E"],
  ["D", "E"],
  ["D", "F"],
  ["E", "F"],
];
const W = {
  "A-B": 4,
  "A-C": 2,
  "B-C": 5,
  "B-D": 3,
  "C-E": 6,
  "D-E": 1,
  "D-F": 7,
  "E-F": 4,
};

type Entry = [edge: string, state: "live" | "dead"];

interface View {
  tree: string[];
  newest?: string;
  taken: string[];
  frontier: Entry[];
  caption?: string;
  captionTone?: "ink" | "good";
}

/** Tree nodes are done, tree edges found, live frontier edges active, stale ones muted; the heap shows below. */
function view(v: View) {
  const tones: Record<string, Tone> = {};
  v.tree.forEach((n) => (tones[n] = "done"));
  if (v.newest) tones[v.newest] = "active";
  const et: Record<string, EdgeTone> = {};
  v.frontier.forEach(([k, s]) => (et[k] = s === "live" ? "active" : "muted"));
  v.taken.forEach((k) => (et[k] = "found"));
  const first = v.frontier.findIndex(([, s]) => s === "live");
  return scene(
    graph(NODES, EDGES, { weights: W, tones, edgeTones: et }),
    v.frontier.length > 0 &&
      label("hl", 320, 285, "frontier (priority queue, cheapest first)", {
        size: 11,
        tone: "muted",
      }),
    row(
      v.frontier.map(([k]) => `${k[0]}${k[2]}·${W[k as keyof typeof W]}`),
      {
        id: "f",
        y: 325,
        w: 62,
        h: 40,
        tones: (i) => (v.frontier[i][1] === "dead" ? "muted" : i === first ? "active" : undefined),
      },
    ),
    v.caption && label("cap", 320, 385, v.caption, { size: 13, weight: 800, tone: v.captionTone }),
  );
}

export const primsAlgorithm: AlgoLesson = {
  id: "prims-algorithm",
  title: "Prim's Algorithm",
  summary:
    "Grow one tree from a start node by always adding the cheapest edge that leaves the tree.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How a single tree grows from a start node",
    "What the frontier is and why a priority queue fits it",
    "How to skip stale edges that point back into the tree",
    "How Prim differs from Kruskal",
  ],
  takeaways: [
    "Prim grows one tree, always adding the cheapest edge that connects the tree to a node outside it.",
    "The frontier of candidate edges lives in a priority queue, and edges whose far end is already in the tree are skipped.",
    "With a binary heap it runs in O(E log V), and it finds the same minimum total as Kruskal.",
  ],
  hud: [
    { label: "Tree edges", icon: "link" },
    { label: "Frontier", icon: "queue" },
    { label: "Total weight", icon: "sigma" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "prim(graph, start):",
    "    tree = {start}; total = 0",
    "    heap = all edges leaving start",
    "    while tree has fewer than V nodes:",
    "        (w, u, v) = pop the cheapest edge from heap",
    "        if v is already in tree: continue",
    "        add v to tree; total += w",
    "        for each edge (v, x, c) with x not in tree:",
    "            push (c, v, x) onto heap",
    "    return tree",
  ],
  steps: [
    {
      short: "The idea",
      title: "Grow a tree from one node",
      body: [
        "Same problem as before: connect all six nodes for the least total cost. Kruskal sorts every edge first. Prim works locally instead: pick a start, and keep one tree that grows outward.",
        "At each step look at all edges that go from the tree to a node outside, and take the cheapest. It is like expanding a blob, always paying the smallest toll to absorb a neighbour.",
      ],
      metrics: [
        { label: "Tree edges", value: "0" },
        { label: "Total weight", value: "0" },
      ],
      scene: view({ tree: [], taken: [], frontier: [], newest: "A", caption: "start at A" }),
    },
    {
      short: "Start at A",
      title: "The frontier of A",
      body: [
        "The tree is just `{A}`. The edges leaving it are `A-C (2)` and `A-B (4)`. Those two are the frontier, kept in a priority queue ordered by weight.",
        "Any node could be the start; the final tree has the same total.",
      ],
      metrics: [
        { label: "Tree edges", value: "0" },
        { label: "Frontier", value: "2" },
        { label: "Total weight", value: "0" },
      ],
      lines: [2, 3],
      scene: view({
        tree: ["A"],
        taken: [],
        frontier: [
          ["A-C", "live"],
          ["A-B", "live"],
        ],
      }),
    },
    {
      short: "Take A-C",
      title: "Pop the cheapest: A-C (2)",
      body: [
        "The cheapest frontier edge is `A-C` at `2`. Add it, and `C` joins the tree. Total `2`.",
        "`C` brings new edges to the frontier: `B-C (5)` and `C-E (6)`. The queue is now `A-B 4`, `B-C 5`, `C-E 6`.",
      ],
      callout: {
        kind: "insight",
        text: "Why is it safe? The tree and the rest of the graph form a cut, and the cheapest edge across a cut is in some minimum spanning tree.",
      },
      metrics: [
        { label: "Tree edges", value: "1" },
        { label: "Frontier", value: "3" },
        { label: "Total weight", value: "2" },
      ],
      lines: [5, 7, 8, 9],
      scene: view({
        tree: ["A"],
        newest: "C",
        taken: ["A-C"],
        frontier: [
          ["A-B", "live"],
          ["B-C", "live"],
          ["C-E", "live"],
        ],
      }),
    },
    {
      short: "Take A-B",
      title: "Pop A-B (4); B-C goes stale",
      body: [
        "Next cheapest is `A-B` at `4`, so `B` joins. Total `6`. Its new edge is `B-D (3)`.",
        "`B-C (5)` is still in the queue, but now both ends are in the tree. Taking it would make a cycle, so when it reaches the front it will simply be skipped (shown faded).",
      ],
      callout: {
        kind: "warn",
        text: "Always check that the far end of a popped edge is outside the tree; otherwise you create a cycle.",
      },
      metrics: [
        { label: "Tree edges", value: "2" },
        { label: "Frontier", value: "2" },
        { label: "Total weight", value: "6" },
      ],
      lines: [5, 6, 7, 8, 9],
      scene: view({
        tree: ["A", "C"],
        newest: "B",
        taken: ["A-C", "A-B"],
        frontier: [
          ["B-D", "live"],
          ["B-C", "dead"],
          ["C-E", "live"],
        ],
      }),
    },
    {
      short: "Take B-D",
      title: "Pop B-D (3)",
      body: [
        "`B-D` at `3` is the cheapest live edge, so `D` joins. Total `9`.",
        "`D` adds `D-E (1)` and `D-F (7)` to the frontier. A big weight on a frontier edge is not wasted work; it may become stale or be beaten later.",
      ],
      metrics: [
        { label: "Tree edges", value: "3" },
        { label: "Frontier", value: "3" },
        { label: "Total weight", value: "9" },
      ],
      lines: [5, 7, 8, 9],
      scene: view({
        tree: ["A", "C", "B"],
        newest: "D",
        taken: ["A-C", "A-B", "B-D"],
        frontier: [
          ["D-E", "live"],
          ["B-C", "dead"],
          ["C-E", "live"],
          ["D-F", "live"],
        ],
      }),
    },
    {
      short: "Take D-E",
      title: "Pop D-E (1)",
      body: [
        "`D-E` costs only `1`, the cheapest live edge, so `E` joins. Total `10`.",
        "Now `C-E (6)` is stale because both of its ends are in the tree. The new edge `E-F (4)` appears and jumps ahead of `D-F (7)`.",
      ],
      metrics: [
        { label: "Tree edges", value: "4" },
        { label: "Frontier", value: "2" },
        { label: "Total weight", value: "10" },
      ],
      lines: [5, 6, 7, 8, 9],
      scene: view({
        tree: ["A", "C", "B", "D"],
        newest: "E",
        taken: ["A-C", "A-B", "B-D", "D-E"],
        frontier: [
          ["E-F", "live"],
          ["B-C", "dead"],
          ["C-E", "dead"],
          ["D-F", "live"],
        ],
      }),
    },
    {
      short: "Take E-F",
      title: "Pop E-F (4): done",
      body: [
        "`E-F` at `4` is cheaper than `D-F` at `7`, so `F` joins and the tree has all 6 nodes. Total `2 + 4 + 3 + 1 + 4 = 14`.",
        "The leftover queue entries all have both ends inside the tree; we stop after `V − 1 = 5` edges.",
      ],
      metrics: [
        { label: "Tree edges", value: "5", level: "good" },
        { label: "Frontier", value: "0" },
        { label: "Total weight", value: "14", level: "good" },
      ],
      lines: [4, 5, 7],
      scene: view({
        tree: ["A", "C", "B", "D", "E"],
        newest: "F",
        taken: ["A-C", "A-B", "B-D", "D-E", "E-F"],
        frontier: [
          ["B-C", "dead"],
          ["C-E", "dead"],
          ["D-F", "dead"],
        ],
        caption: "MST total = 14, the same as Kruskal",
        captionTone: "good",
      }),
    },
    {
      short: "Vs Kruskal",
      title: "Prim or Kruskal?",
      body: [
        "Both produce a minimum spanning tree of weight `14`. Prim keeps one connected tree the whole time and needs a heap of frontier edges: `O(E log V)` with a binary heap. Kruskal sorts edges and uses union-find: `O(E log E)`.",
        "Prim tends to suit dense graphs and adjacency-list data; Kruskal is simpler when you already have a sorted edge list or a sparse graph.",
      ],
      callout: {
        kind: "tip",
        text: "Prim and Dijkstra look alike: Dijkstra orders by distance from the source, Prim orders by the single edge weight.",
      },
      metrics: [
        { label: "Total weight", value: "14", level: "good" },
        { label: "Cost", value: "O(E log V)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 60, "Prim: one growing tree, priority queue of edges", {
          size: 14,
          weight: 800,
        }),
        label("t2", 320, 100, "time O(E log V) with a binary heap", { size: 14 }),
        label("t3", 320, 165, "Kruskal: many components that merge, sorted edges", {
          size: 14,
          weight: 800,
        }),
        label("t4", 320, 205, "time O(E log E) with union-find", { size: 14 }),
        label("t5", 320, 265, "same minimum total weight", { size: 14, weight: 800, tone: "good" }),
      ),
    },
  ],
};
