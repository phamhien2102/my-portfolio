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
const SORTED: [string, number][] = [
  ["D-E", 1],
  ["A-C", 2],
  ["B-D", 3],
  ["A-B", 4],
  ["E-F", 4],
  ["B-C", 5],
  ["C-E", 6],
  ["D-F", 7],
];

type St = "add" | "skip" | "cur" | undefined;

interface View {
  status?: St[];
  list?: boolean;
  edgeTones?: Record<string, EdgeTone>;
  comps?: string;
  caption?: string;
  captionTone?: "ink" | "good" | "warn";
}

/** The graph, the sorted edge list underneath (accepted / rejected), and the current components. */
function view(v: View) {
  const et: Record<string, EdgeTone> = { ...v.edgeTones };
  const tones: Record<string, Tone> = {};
  v.status?.forEach((s, i) => {
    const [k] = SORTED[i];
    if (s === "add") {
      et[k] = "found";
      tones[k[0]] = "done";
      tones[k[2]] = "done";
    }
    if (s === "skip") et[k] = "warn";
    if (s === "cur") et[k] = "active";
  });
  const toneOf = (s: St): Tone | undefined =>
    s === "add" ? "done" : s === "skip" ? "warn" : s === "cur" ? "active" : undefined;
  return scene(
    graph(NODES, EDGES, { weights: W, tones, edgeTones: et }),
    v.comps && label("comps", 320, 282, v.comps, { size: 13, weight: 800 }),
    v.list &&
      row(
        SORTED.map(([k, w]) => `${k[0]}${k[2]}·${w}`),
        { id: "s", y: 325, w: 62, h: 40, tones: (i) => toneOf(v.status?.[i]) },
      ),
    v.caption && label("cap", 320, 385, v.caption, { size: 13, weight: 800, tone: v.captionTone }),
  );
}

const S = (...x: St[]): St[] => x;

export const minimumSpanningTrees: AlgoLesson = {
  id: "minimum-spanning-trees",
  title: "Minimum Spanning Trees",
  summary:
    "Connect every node with the cheapest set of edges and no cycle, built greedily with Kruskal's method.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "What a spanning tree and a minimum spanning tree are",
    "How Kruskal sorts edges and adds the cheapest safe one",
    "How union-find answers 'would this make a cycle?'",
    "Why the greedy choice is correct (cut and cycle intuition)",
  ],
  takeaways: [
    "A spanning tree uses V − 1 edges to connect all nodes without a cycle, and the minimum one has the smallest total weight.",
    "Kruskal scans edges from cheapest to dearest and keeps an edge only if its ends are in different components.",
    "Sorting dominates, so Kruskal runs in O(E log E).",
  ],
  hud: [
    { label: "Edges taken", icon: "link" },
    { label: "Components", icon: "layers" },
    { label: "Total weight", icon: "sigma" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "kruskal(nodes, edges):",
    "    sort edges by weight, cheapest first",
    "    every node starts as its own component",
    "    tree = []",
    "    for each edge (u, v, w) in sorted order:",
    "        if find(u) != find(v):",
    "            add edge to tree; union(u, v)",
    "        if tree has V - 1 edges: stop",
    "    return tree",
  ],
  steps: [
    {
      short: "The problem",
      title: "Connect everything as cheaply as possible",
      body: [
        "Six towns, eight possible cables, each with a price. We must connect all towns so any can reach any other, spending as little as possible.",
        "No cycle is ever needed: a cable that closes a loop only adds cost. So the answer is a tree on all six nodes.",
      ],
      metrics: [
        { label: "Edges taken", value: "0" },
        { label: "Components", value: "6" },
        { label: "Total weight", value: "0" },
      ],
      scene: view({}),
    },
    {
      short: "Spanning tree",
      title: "Many trees, one cheapest",
      body: [
        "A spanning tree touches every node using exactly `V − 1 = 5` edges and has no cycle. Here is one: `A-B`, `B-D`, `B-C`, `C-E`, `E-F`.",
        "It works, but costs `4 + 3 + 5 + 6 + 4 = 22`. A minimum spanning tree (MST) is the spanning tree with the smallest total; we can do far better.",
      ],
      metrics: [
        { label: "Edges taken", value: "5" },
        { label: "Components", value: "1" },
        { label: "Total weight", value: "22", level: "warn" },
      ],
      scene: view({
        edgeTones: {
          "A-B": "found",
          "B-D": "found",
          "B-C": "found",
          "C-E": "found",
          "E-F": "found",
        },
        caption: "a spanning tree, total 22: connected, but not the cheapest",
      }),
    },
    {
      short: "Sort edges",
      title: "Kruskal: sort the edges",
      body: [
        "Kruskal's idea is greedy. List all edges from cheapest to most expensive: `D-E 1`, `A-C 2`, `B-D 3`, and so on.",
        "Then walk down the list and keep an edge if it does not create a cycle. Start with every node as its own component.",
      ],
      metrics: [
        { label: "Edges taken", value: "0" },
        { label: "Components", value: "6" },
        { label: "Total weight", value: "0" },
      ],
      lines: [2, 3],
      scene: view({
        status: S(),
        list: true,
        comps: "{A} {B} {C} {D} {E} {F}",
      }),
    },
    {
      short: "Take 1 and 2",
      title: "The two cheapest edges are safe",
      body: [
        "`D-E` (1): `D` and `E` are in different components, so keep it and merge them. `A-C` (2): `A` and `C` are also separate, so keep it.",
        "Union-find answers 'same component?' in near-constant time: two nodes are connected exactly when `find` returns the same root.",
      ],
      callout: {
        kind: "insight",
        text: "The cheapest edge overall is always in some MST: it is the lightest edge crossing any cut that separates its ends.",
      },
      metrics: [
        { label: "Edges taken", value: "2" },
        { label: "Components", value: "4" },
        { label: "Total weight", value: "3" },
      ],
      lines: [5, 6, 7],
      scene: view({
        status: S("add", "add"),
        list: true,
        comps: "{A, C} {B} {D, E} {F}",
      }),
    },
    {
      short: "Take 3 and 4",
      title: "An edge that joins two groups",
      body: [
        "`B-D` (3) joins `B` to `{D, E}`. Then `A-B` (4): `A` is in `{A, C}` and `B` is in `{B, D, E}`, different components, so it is kept and merges the two groups.",
        "The total is now `1 + 2 + 3 + 4 = 10`, and only `F` is left out.",
      ],
      metrics: [
        { label: "Edges taken", value: "4" },
        { label: "Components", value: "2" },
        { label: "Total weight", value: "10" },
      ],
      lines: [5, 6, 7],
      scene: view({
        status: S("add", "add", "add", "add"),
        list: true,
        comps: "{A, B, C, D, E} {F}",
      }),
    },
    {
      short: "Take E-F",
      title: "The last node joins",
      body: [
        "`E-F` (4) connects `F` to the big component. We now have 5 edges for 6 nodes, a full spanning tree, so we could stop.",
        "The tie between `A-B` and `E-F` (both 4) does not matter: any order among equal weights gives a tree of the same total.",
      ],
      metrics: [
        { label: "Edges taken", value: "5", level: "good" },
        { label: "Components", value: "1", level: "good" },
        { label: "Total weight", value: "14", level: "good" },
      ],
      lines: [7, 8],
      scene: view({
        status: S("add", "add", "add", "add", "add"),
        list: true,
        comps: "{A, B, C, D, E, F}",
      }),
    },
    {
      short: "Reject cycles",
      title: "The rest would form cycles",
      body: [
        "If we kept scanning, `B-C` (5): both ends are already in the one component, so adding it would close the loop `B → C → A → B`. Skip it. `C-E` and `D-F` fail the same way.",
        "The rule for any rejected edge: its ends are already connected, so it can only add cost.",
      ],
      callout: {
        kind: "tip",
        text: "Once V − 1 edges are taken you can break out of the loop and skip the remaining edges.",
      },
      metrics: [
        { label: "Edges taken", value: "5" },
        { label: "Total weight", value: "14", level: "good" },
      ],
      lines: [5, 6],
      scene: view({
        status: S("add", "add", "add", "add", "add", "skip", "skip", "skip"),
        list: true,
        caption: "MST total = 1 + 2 + 3 + 4 + 4 = 14",
        captionTone: "good",
      }),
    },
    {
      short: "Why it works",
      title: "Why greedy is correct",
      body: [
        "Cut property: take any split of the nodes into two groups. The lightest edge crossing the split belongs to some MST. Kruskal's pick is always that edge for the split between its own component and the rest.",
        "Cycle property: the heaviest edge on any cycle is never needed. Kruskal rejects exactly such edges.",
      ],
      metrics: [
        { label: "Total weight", value: "14", level: "good" },
        { label: "Cost", value: "O(E log E)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 70, "cut: lightest edge across any split is safe", { size: 14 }),
        label("t2", 320, 115, "cycle: heaviest edge on a cycle is never needed", { size: 14 }),
        label("t3", 320, 175, "sort edges: O(E log E)", { size: 14 }),
        label("t4", 320, 215, "union-find per edge: almost O(1)", { size: 14 }),
        label("t5", 320, 270, "total  O(E log E)   space O(V)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
