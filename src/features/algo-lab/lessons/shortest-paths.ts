import { cell, graph, label, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

const NODES: Record<string, [number, number]> = {
  A: [80, 150],
  B: [210, 60],
  C: [210, 240],
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
const W: Record<string, number> = {
  "A-B": 4,
  "A-C": 2,
  "B-C": 1,
  "B-D": 5,
  "C-E": 10,
  "D-E": 2,
  "D-F": 6,
  "E-F": 3,
};
const NAMES = ["A", "B", "C", "D", "E", "F"];
const INF = "∞";

interface View {
  dist: (number | string)[];
  settled?: string[];
  active?: string;
  edgeTones?: Record<string, EdgeTone>;
  note?: string;
  noteTone?: "ink" | "muted" | "warn" | "good";
}

/** The weighted graph with the distance table underneath; settled nodes are done, the current one is active. */
function view(v: View) {
  const tones: Record<string, Tone> = {};
  v.settled?.forEach((n) => (tones[n] = "done"));
  if (v.active) tones[v.active] = "active";
  return scene(
    graph(NODES, EDGES, { weights: W, tones, edgeTones: v.edgeTones }),
    label("dl", 320, 292, "distance from A", { size: 11, tone: "muted" }),
    NAMES.map((n, i) =>
      cell(`d${n}`, 136 + i * 64, 330, v.dist[i], { w: 56, h: 40, sub: n, tone: tones[n] }),
    ),
    v.note && label("note", 320, 395, v.note, { size: 13, weight: 800, tone: v.noteTone }),
  );
}

const ST = ["A", "C", "B", "D", "E", "F"];

export const shortestPaths: AlgoLesson = {
  id: "shortest-paths",
  title: "Shortest Paths",
  summary:
    "Dijkstra's algorithm: settle the closest node, relax its edges, repeat, then trace the route back.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "What a distance table and a parent array record",
    "How relaxing an edge improves a distance",
    "Why the closest unsettled node is already final",
    "How a priority queue makes the choice fast",
    "How to rebuild the actual path from parents",
  ],
  takeaways: [
    "Dijkstra keeps a tentative distance for every node and always settles the unsettled node with the smallest one.",
    "Relaxing an edge u to v means trying dist[u] + w as a better distance for v and remembering u as its parent.",
    "It needs non-negative weights, and with a binary heap it runs in O((V + E) log V).",
  ],
  hud: [
    { label: "Settled", icon: "check" },
    { label: "Dist to F", icon: "gauge" },
    { label: "Relaxations", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "dijkstra(graph, source):",
    "    dist[every node] = infinity; dist[source] = 0",
    "    heap = [(0, source)]",
    "    while heap is not empty:",
    "        (d, u) = pop the smallest entry from heap",
    "        if u is already settled: continue",
    "        mark u settled",
    "        for each edge (u, v, w):",
    "            if d + w < dist[v]:",
    "                dist[v] = d + w; parent[v] = u",
    "                push (dist[v], v) onto heap",
    "    return dist, parent",
  ],
  steps: [
    {
      short: "The problem",
      title: "Cheapest route, not fewest hops",
      body: [
        "Each road has a cost. We want the cheapest way from `A` to every other node. Counting edges is not enough: `A → B` costs 4, but `A → C → B` costs only 3.",
        "Dijkstra's algorithm solves this when no weight is negative.",
      ],
      metrics: [{ label: "Settled", value: "0 / 6" }],
      scene: view({ dist: ["?", "?", "?", "?", "?", "?"] }),
    },
    {
      short: "Start table",
      title: "A table of best-known distances",
      body: [
        "Keep one number per node: the cheapest cost found so far. `A` is `0` because we start there; everything else is `∞` because we have found no route yet.",
        "A second array, `parent`, will remember which node each improvement came from.",
      ],
      metrics: [
        { label: "Settled", value: "0 / 6" },
        { label: "Dist to F", value: "∞", level: "warn" },
        { label: "Relaxations", value: "0" },
      ],
      lines: [2, 3],
      scene: view({ dist: [0, INF, INF, INF, INF, INF], active: "A" }),
    },
    {
      short: "Settle A",
      title: "Settle the closest node, relax its edges",
      body: [
        "Pick the unsettled node with the smallest distance: `A` at `0`. It can never get better, so it is settled.",
        "Relax its edges: `A → B` offers `0 + 4 = 4` and `A → C` offers `0 + 2 = 2`. Both beat `∞`, so we record them.",
      ],
      callout: {
        kind: "insight",
        text: "Why is the smallest one final? Any other route to it must leave the settled area through a node at least as far away, and weights cannot be negative.",
      },
      metrics: [
        { label: "Settled", value: "1 / 6" },
        { label: "Dist to F", value: "∞", level: "warn" },
        { label: "Relaxations", value: "2" },
      ],
      lines: [5, 7, 8, 9, 10, 11],
      scene: view({
        dist: [0, 4, 2, INF, INF, INF],
        settled: ["A"],
        edgeTones: { "A-B": "active", "A-C": "active" },
      }),
    },
    {
      short: "Settle C",
      title: "Next closest: C at 2",
      body: [
        "`C` has the smallest tentative distance, `2`, so it is next. Relax `C → B`: `2 + 1 = 3` beats the old `4`, so `B` improves and its parent becomes `C`.",
        "Relax `C → E`: `2 + 10 = 12`, a first value for `E`.",
      ],
      callout: {
        kind: "tip",
        text: "An improvement overwrites the old number. That is the whole reason distances are only 'tentative' until a node is settled.",
      },
      metrics: [
        { label: "Settled", value: "2 / 6" },
        { label: "Dist to F", value: "∞", level: "warn" },
        { label: "Relaxations", value: "4" },
      ],
      lines: [5, 7, 8, 9, 10, 11],
      scene: view({
        dist: [0, 3, 2, INF, 12, INF],
        settled: ["A", "C"],
        edgeTones: { "A-C": "found", "A-B": "muted", "B-C": "active", "C-E": "active" },
      }),
    },
    {
      short: "Settle B",
      title: "B is settled at 3",
      body: [
        "The smallest unsettled value is now `B = 3`. Its edge to `D` costs `5`, so `D` gets `3 + 5 = 8`.",
        "The edge `B → C` goes back to a settled node and can only offer `3 + 1 = 4`, worse than `2`, so we ignore it.",
      ],
      metrics: [
        { label: "Settled", value: "3 / 6" },
        { label: "Dist to F", value: "∞", level: "warn" },
        { label: "Relaxations", value: "5" },
      ],
      lines: [5, 7, 8, 9],
      scene: view({
        dist: [0, 3, 2, 8, 12, INF],
        settled: ["A", "C", "B"],
        edgeTones: { "A-C": "found", "B-C": "found", "B-D": "active", "C-E": "muted" },
      }),
    },
    {
      short: "Settle D",
      title: "D at 8 shortens E and reaches F",
      body: [
        "`D` is next at `8`. Relaxing `D → E` gives `8 + 2 = 10`, which beats the earlier `12`, so `E` now hangs off `D`.",
        "Relaxing `D → F` gives `8 + 6 = 14`, our first route to `F`.",
      ],
      metrics: [
        { label: "Settled", value: "4 / 6" },
        { label: "Dist to F", value: "14", level: "warn" },
        { label: "Relaxations", value: "7" },
      ],
      lines: [5, 7, 8, 9, 10, 11],
      scene: view({
        dist: [0, 3, 2, 8, 10, 14],
        settled: ["A", "C", "B", "D"],
        edgeTones: {
          "A-C": "found",
          "B-C": "found",
          "B-D": "found",
          "D-E": "active",
          "D-F": "active",
          "C-E": "muted",
        },
      }),
    },
    {
      short: "Settle E, F",
      title: "E settles and improves F",
      body: [
        "`E` is settled at `10`. Its edge `E → F` offers `10 + 3 = 13`, better than `14`, so `F`'s parent switches from `D` to `E`.",
        "`F` is the last node; settling it at `13` completes the table.",
      ],
      metrics: [
        { label: "Settled", value: "6 / 6", level: "good" },
        { label: "Dist to F", value: "13", level: "good" },
        { label: "Relaxations", value: "8" },
      ],
      lines: [5, 7, 8, 9, 10, 11],
      scene: view({
        dist: [0, 3, 2, 8, 10, 13],
        settled: ST,
        edgeTones: {
          "A-C": "found",
          "B-C": "found",
          "B-D": "found",
          "D-E": "found",
          "E-F": "found",
          "D-F": "muted",
        },
      }),
    },
    {
      short: "The path",
      title: "Read the route from the parents",
      body: [
        "Distances say how far; parents say which way. Start at `F` and follow parents back: `F ← E ← D ← B ← C ← A`. Reverse that list to get the route.",
        "The cheapest path from `A` to `F` is `A → C → B → D → E → F`, total `13`.",
      ],
      callout: {
        kind: "tip",
        text: "Stop the loop as soon as the target is settled if you only need one destination.",
      },
      metrics: [
        { label: "Settled", value: "6 / 6", level: "good" },
        { label: "Dist to F", value: "13", level: "good" },
      ],
      lines: [12],
      scene: view({
        dist: [0, 3, 2, 8, 10, 13],
        settled: ST,
        edgeTones: {
          "A-C": "found",
          "B-C": "found",
          "B-D": "found",
          "D-E": "found",
          "E-F": "found",
        },
        note: "A → C → B → D → E → F  =  13",
        noteTone: "good",
      }),
    },
    {
      short: "Heap + cost",
      title: "The priority queue and the cost",
      body: [
        "Scanning the whole table for the minimum each time costs `O(V)` per pick. A priority queue (a binary heap) keeps the candidates ordered, so each pick and each improvement costs `O(log V)`.",
        "Total time is `O((V + E) log V)`. Never use it with a negative edge: a settled node could later be undercut, and the guarantee breaks. That case needs Bellman-Ford.",
      ],
      callout: {
        kind: "warn",
        text: "Negative weights break the 'closest is final' argument. Use Bellman-Ford instead.",
      },
      metrics: [
        { label: "Settled", value: "6 / 6", level: "good" },
        { label: "Cost", value: "O((V+E) log V)", level: "good" },
      ],
      lines: [3, 5, 6, 11],
      scene: scene(
        label("t1", 320, 70, "repeat:", { size: 14, weight: 800 }),
        label("t2", 320, 110, "1. pop the smallest (node, distance) from the heap", { size: 14 }),
        label("t3", 320, 150, "2. skip it if the node is already settled", { size: 14 }),
        label("t4", 320, 190, "3. relax each edge and push improved distances", { size: 14 }),
        label("t5", 320, 245, "time O((V + E) log V)   space O(V)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
