import { graph, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

//   B ── D ── F
//  /     |
// A      |        D–E is a cross link: both ends are found by other routes first
//  \     |
//   C ── E ── G
const NODES: Record<string, [number, number]> = {
  A: [50, 120],
  B: [170, 50],
  C: [170, 190],
  D: [310, 50],
  E: [310, 190],
  F: [450, 50],
  G: [450, 190],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["C", "E"],
  ["D", "E"],
  ["D", "F"],
  ["E", "G"],
];
const DIST: Record<string, number> = { A: 0, B: 1, C: 1, D: 2, E: 2, F: 3, G: 3 };
const ORDER = ["A", "B", "C", "D", "E", "F", "G"];

const withDist = (items: Item[], known: string[]): Item[] =>
  items.map((i) =>
    i.t === "disc" && known.includes(i.id.slice(1)) ? { ...i, sub: `d=${DIST[i.id.slice(1)]}` } : i,
  );

/** The graph and the queue at one moment: `done` finished, `active` being processed, `queue` waiting. */
function view(done: string[], active: string | undefined, queue: string[], note: string) {
  const known = ORDER.filter((n) => done.includes(n) || n === active || queue.includes(n));
  const tones: Record<string, Tone> = {};
  done.forEach((n) => (tones[n] = "done"));
  queue.forEach((n) => (tones[n] = "mark"));
  if (active) tones[active] = "active";
  const total = queue.length * 52 - 8;
  return scene(
    withDist(graph(NODES, EDGES, { tones }), known),
    label("qcap", 70, 262, "queue", { size: 13, weight: 800, anchor: "middle" }),
    queue.length
      ? row(queue, {
          id: "q",
          keys: queue,
          x: 130 + total / 2,
          y: 258,
          w: 44,
          h: 38,
          tones: (i) => (i === 0 ? "mark" : undefined),
        })
      : label("qempty", 160, 262, "empty", { size: 13, tone: "muted" }),
    label("vis", 320, 305, `visited: ${known.length ? known.join(" ") : "—"}`, {
      size: 13,
      weight: 800,
      tone: "good",
    }),
    label("note", 320, 20, note, { size: 13, weight: 800 }),
  );
}

export const breadthFirstSearch: AlgoLesson = {
  id: "breadth-first-search",
  title: "Breadth-First Search",
  summary: "Explore a graph one ring at a time with a queue, and get shortest distances for free.",
  minutes: 13,
  level: "beginner",
  goals: [
    "How a queue makes the search go level by level",
    "Why a visited set is needed",
    "How BFS gives distances in an unweighted graph",
    "Why the cost is O(V + E)",
  ],
  takeaways: [
    "BFS keeps a queue of discovered vertices and always processes the oldest one, so it moves outward one ring at a time.",
    "Mark a vertex visited when you add it to the queue, not when you remove it, so it is never queued twice.",
    "In an unweighted graph the level at which BFS first reaches a vertex is its shortest distance, and the whole search costs O(V + E).",
  ],
  hud: [
    { label: "Visited", icon: "check" },
    { label: "Queue size", icon: "queue" },
    { label: "Level", icon: "layers" },
    { label: "Work", icon: "timer" },
  ],
  pseudocode: [
    "bfs(graph, start):",
    "    visited = {start}, queue = [start], dist[start] = 0",
    "    while queue is not empty:",
    "        u = remove the front of queue",
    "        for each v in graph[u]:",
    "            if v is not in visited:",
    "                add v to visited",
    "                dist[v] = dist[u] + 1",
    "                add v to the back of queue",
    "    return dist",
  ],
  steps: [
    {
      short: "The goal",
      title: "Visit everything, nearest first",
      body: [
        "We want to walk a graph from a starting vertex `A` so that closer vertices are handled before farther ones. Think of a ripple spreading from a stone dropped in water.",
        "Two tools make that work: a queue (first in, first out) of vertices waiting their turn, and a visited set so no vertex is handled twice.",
      ],
      metrics: [
        { label: "Visited", value: "0" },
        { label: "Queue size", value: "0" },
      ],
      scene: view([], undefined, [], "start at A"),
    },
    {
      short: "Start at A",
      title: "Discover the start",
      body: [
        "Put `A` in the queue and mark it visited. Its distance from itself is `d=0`.",
        "The loop is now: take the front vertex out, look at each neighbour, and queue the ones we have not seen.",
      ],
      metrics: [
        { label: "Visited", value: "1" },
        { label: "Queue size", value: "1" },
        { label: "Level", value: "0" },
      ],
      lines: [2],
      scene: view([], undefined, ["A"], "enqueue A, mark it visited"),
    },
    {
      short: "Process A",
      title: "Level 1: A's neighbours",
      body: [
        "Dequeue `A`. Its neighbours `B` and `C` are new, so mark both and enqueue them with distance `d=1`.",
        "Both sit behind each other in the queue, in the order we found them.",
      ],
      metrics: [
        { label: "Visited", value: "3" },
        { label: "Queue size", value: "2" },
        { label: "Level", value: "1" },
      ],
      lines: [4, 5, 6, 7, 8, 9],
      scene: view(["A"], undefined, ["B", "C"], "A done: B and C discovered at distance 1"),
    },
    {
      short: "Process B",
      title: "B leads to D",
      body: [
        "Dequeue `B`. Its neighbours are `A` (already visited, skip) and `D` (new). `D` is two edges from `A`, so it gets `d=2` and goes to the back.",
        "Because `C` was queued before `D`, `C` will still be processed first.",
      ],
      callout: {
        kind: "insight",
        text: "The queue keeps all of level 1 ahead of anything in level 2. That ordering is the whole algorithm.",
      },
      metrics: [
        { label: "Visited", value: "4" },
        { label: "Queue size", value: "2" },
        { label: "Level", value: "2" },
      ],
      lines: [4, 5, 6, 7, 8, 9],
      scene: view(["A", "B"], undefined, ["C", "D"], "B done: D discovered at distance 2"),
    },
    {
      short: "Process C",
      title: "C leads to E",
      body: [
        "Dequeue `C`. Neighbour `A` is visited; `E` is new and gets `d=2`.",
        "Now every vertex at distance 1 is finished, and the queue holds exactly the vertices at distance 2.",
      ],
      metrics: [
        { label: "Visited", value: "5" },
        { label: "Queue size", value: "2" },
        { label: "Level", value: "2" },
      ],
      lines: [4, 5, 6, 7, 8, 9],
      scene: view(["A", "B", "C"], undefined, ["D", "E"], "C done: E discovered at distance 2"),
    },
    {
      short: "Process D",
      title: "Skip what is already seen",
      body: [
        "Dequeue `D`. Its neighbours are `B` (visited), `E` (visited: it is already in the queue) and `F` (new, `d=3`).",
        "The link `D–E` changes nothing. Checking the visited set is what stops `E` from being queued a second time.",
      ],
      callout: {
        kind: "warn",
        text: "Without a visited set, a graph with a cycle makes the search run forever.",
      },
      metrics: [
        { label: "Visited", value: "6" },
        { label: "Queue size", value: "2" },
        { label: "Level", value: "3" },
      ],
      lines: [5, 6],
      scene: view(
        ["A", "B", "C", "D"],
        undefined,
        ["E", "F"],
        "D done: F discovered, E already seen",
      ),
    },
    {
      short: "Process E",
      title: "The last new vertex",
      body: [
        "Dequeue `E`. Neighbours `C` and `D` are visited; `G` is new with `d=3`.",
        "All seven vertices have now been discovered. The queue just needs to drain.",
      ],
      metrics: [
        { label: "Visited", value: "7" },
        { label: "Queue size", value: "2" },
        { label: "Level", value: "3" },
      ],
      lines: [5, 6, 7, 8, 9],
      scene: view(
        ["A", "B", "C", "D", "E"],
        undefined,
        ["F", "G"],
        "E done: G discovered at distance 3",
      ),
    },
    {
      short: "Finish",
      title: "Drain the queue",
      body: [
        "`F` and `G` come out and find no new neighbours. The queue is empty, so the search ends.",
        "The order of discovery was `A B C D E F G`, and each `d` is the fewest edges from `A`.",
      ],
      metrics: [
        { label: "Visited", value: "7", level: "good" },
        { label: "Queue size", value: "0", level: "good" },
        { label: "Level", value: "3" },
      ],
      lines: [3, 10],
      scene: view(ORDER, undefined, [], "queue empty: search complete"),
    },
    {
      short: "Cost",
      title: "Why it is O(V + E)",
      body: [
        "Each vertex is enqueued and dequeued once: `O(V)`. Each edge is examined once from each end while its vertex is processed: `O(E)`. Together that is `O(V + E)` with an adjacency list.",
        "The queue and visited set add `O(V)` memory. Use BFS when you want fewest steps in an unweighted graph; with weights you need Dijkstra instead.",
      ],
      callout: {
        kind: "tip",
        text: "To rebuild the actual shortest path, store each vertex's parent when you discover it and walk back from the target.",
      },
      metrics: [
        { label: "Visited", value: "V" },
        { label: "Work", value: "O(V + E)", level: "good" },
      ],
      lines: [3, 4, 5],
      scene: view(ORDER, undefined, [], "time O(V + E), memory O(V)"),
    },
  ],
};
