import { graph, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const NODES: Record<string, [number, number]> = {
  A: [60, 60],
  B: [60, 180],
  C: [170, 120],
  D: [270, 60],
  E: [380, 60],
  F: [325, 180],
  G: [470, 60],
  H: [470, 180],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["D", "E"],
  ["E", "F"],
  ["D", "F"],
  ["G", "H"],
];
const PIECES: { names: string[]; tone: Tone }[] = [
  { names: ["A", "B", "C"], tone: "mark" },
  { names: ["D", "E", "F"], tone: "found" },
  { names: ["G", "H"], tone: "warn" },
];

/** `coloured` pieces (by index) are painted and numbered; `active` is the vertex the scan is on. */
function view(coloured: number, count: number, active?: string, note?: string, flood = coloured) {
  const tones: Record<string, Tone> = {};
  const num: Record<string, string> = {};
  PIECES.forEach((p, i) => {
    if (i >= Math.max(coloured, flood)) return;
    p.names.forEach((n) => {
      tones[n] = p.tone;
      num[`g${n}`] = `#${i + 1}`;
    });
  });
  if (active) tones[active] = "active";
  const items: Item[] = graph(NODES, EDGES, { tones }).map((i) =>
    i.t === "disc" && num[i.id] ? { ...i, sub: num[i.id] } : i,
  );
  return scene(
    items,
    active && ptr("scan", `g${active}`, "scan", { side: "above", tone: "active" }),
    label("count", 320, 250, `components so far: ${count}`, {
      size: 15,
      weight: 800,
      tone: "good",
    }),
    note && label("note", 320, 285, note, { size: 13, weight: 800 }),
  );
}

export const connectedComponents: AlgoLesson = {
  id: "connected-components",
  title: "Connected Components",
  summary:
    "Split a graph into its separate pieces by starting a search from every unvisited vertex.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "What a connected component is",
    "How to find them with repeated BFS or DFS",
    "Why each vertex is searched only once",
    "The O(V + E) cost and edge cases",
  ],
  takeaways: [
    "A connected component is a maximal set of vertices that can all reach one another.",
    "Loop over the vertices; each time you meet an unvisited one, start a search that marks its whole component and add one to the count.",
    "Because visited vertices are skipped, the total work stays O(V + E), however many components there are.",
  ],
  hud: [
    { label: "Components", icon: "layers" },
    { label: "Visited", icon: "check" },
    { label: "Searches", icon: "search" },
    { label: "Work", icon: "timer" },
  ],
  pseudocode: [
    "count_components(graph):",
    "    visited = empty set, count = 0",
    "    for each vertex s in graph:",
    "        if s is not in visited:",
    "            count = count + 1",
    "            search(graph, s, visited)",
    "    return count",
    "search(graph, s, visited):",
    "    mark s and all vertices reachable from it as visited",
  ],
  steps: [
    {
      short: "Pieces",
      title: "A graph in separate pieces",
      body: [
        "Not every graph is one connected blob. This one has eight vertices, but you cannot walk from `A` to `D`: the edges simply do not lead there.",
        "Each maximal group of vertices that can reach one another is a connected component. How many does this graph have?",
      ],
      metrics: [
        { label: "Components", value: "?" },
        { label: "Visited", value: "0" },
      ],
      scene: view(0, 0, undefined, "8 vertices, 6 edges, how many pieces?"),
    },
    {
      short: "Plan",
      title: "Scan, and search when unvisited",
      body: [
        "Walk through the vertices one by one. If the current vertex is unvisited, it must belong to a new component: start a BFS or DFS from it, which will mark everything reachable, and add one to the count.",
        "If the vertex was already visited, an earlier search covered it, so skip it.",
      ],
      metrics: [
        { label: "Components", value: "0" },
        { label: "Visited", value: "0" },
        { label: "Searches", value: "0" },
      ],
      lines: [3, 4],
      scene: view(0, 0, "A", "scan reaches A: not visited yet"),
    },
    {
      short: "Start A",
      title: "First unvisited vertex: count one",
      body: ["`A` is unvisited, so we start a search from it and raise the count to `1`."],
      metrics: [
        { label: "Components", value: "1" },
        { label: "Visited", value: "1" },
        { label: "Searches", value: "1" },
      ],
      lines: [4, 5, 6],
      scene: view(0, 1, "A", "new search from A: count = 1"),
    },
    {
      short: "Flood #1",
      title: "The search colours its whole piece",
      body: [
        "The search from `A` reaches `B` and `C` and nothing else, because no edge leaves that group. All three get colour `#1`.",
        "Whatever order BFS or DFS uses does not matter; only the set of reached vertices does.",
      ],
      metrics: [
        { label: "Components", value: "1" },
        { label: "Visited", value: "3" },
        { label: "Searches", value: "1" },
      ],
      lines: [6, 8, 9],
      scene: view(1, 1, undefined, "component #1 = A, B, C"),
    },
    {
      short: "Skip B, C",
      title: "Visited vertices are skipped",
      body: [
        "The scan moves on to `B` and then `C`. Both are already visited, so no search starts and the count stays at `1`.",
        "Then it reaches `D`, which no search has touched. That means a new piece.",
      ],
      callout: {
        kind: "insight",
        text: "Skipping visited vertices is why we never start two searches in the same component.",
      },
      metrics: [
        { label: "Components", value: "2" },
        { label: "Visited", value: "3" },
        { label: "Searches", value: "2" },
      ],
      lines: [3, 4, 5],
      scene: view(1, 2, "D", "D is unvisited: new search, count = 2"),
    },
    {
      short: "Flood #2",
      title: "Second component",
      body: [
        "From `D` the search reaches `E` and `F` (they are linked in a triangle). Cycles inside a piece do no harm, because the visited set stops repeats.",
        "Component `#2` is `D, E, F`.",
      ],
      metrics: [
        { label: "Components", value: "2" },
        { label: "Visited", value: "6" },
        { label: "Searches", value: "2" },
      ],
      lines: [6, 8, 9],
      scene: view(2, 2, undefined, "component #2 = D, E, F"),
    },
    {
      short: "Third piece",
      title: "Keep scanning",
      body: [
        "`E` and `F` are skipped. The scan arrives at `G`: unvisited, so the count becomes `3` and a search from `G` reaches `H`.",
      ],
      metrics: [
        { label: "Components", value: "3" },
        { label: "Visited", value: "8" },
        { label: "Searches", value: "3" },
      ],
      lines: [3, 4, 5, 6],
      scene: view(2, 3, "G", "G is unvisited: new search, count = 3", 3),
    },
    {
      short: "Answer",
      title: "Three components",
      body: [
        "`H` is already visited, the scan ends, and the count is the answer: `3` components.",
        "A vertex with no edges at all is its own component of size one, so it is counted too.",
      ],
      callout: {
        kind: "tip",
        text: "If the count is 1, the graph is connected. Many problems, like 'can everyone reach everyone?', are just this check.",
      },
      metrics: [
        { label: "Components", value: "3", level: "good" },
        { label: "Visited", value: "8", level: "good" },
        { label: "Searches", value: "3" },
      ],
      lines: [7],
      scene: view(3, 3, undefined, "every vertex belongs to exactly one component"),
    },
    {
      short: "Cost",
      title: "Total cost is still O(V + E)",
      body: [
        "The outer scan touches each vertex once: `O(V)`. Each search only walks vertices and edges of its own component, and components do not overlap, so all searches together cost `O(E)` plus the vertices.",
        "That makes the whole job `O(V + E)` time and `O(V)` memory. For graphs that grow edge by edge, a union-find structure answers the same question incrementally.",
      ],
      metrics: [
        { label: "Components", value: "3" },
        { label: "Work", value: "O(V + E)", level: "good" },
      ],
      lines: [3, 6],
      scene: view(3, 3, undefined, "time O(V + E), memory O(V)"),
    },
  ],
};
