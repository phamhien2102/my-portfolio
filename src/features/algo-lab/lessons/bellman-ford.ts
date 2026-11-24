import { cell, graph, label, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

const INF = "∞";

const N1: Record<string, [number, number]> = {
  S: [70, 150],
  A: [230, 70],
  B: [230, 230],
  C: [390, 70],
  D: [520, 150],
};
// Listed in the order the algorithm scans them, chosen so that every pass improves something.
const E1: [string, string][] = [
  ["C", "D"],
  ["A", "C"],
  ["B", "A"],
  ["S", "B"],
  ["S", "A"],
];
const W1 = { "C-D": 2, "A-C": 6, "B-A": -3, "S-B": 5, "S-A": 4 };

const N2: Record<string, [number, number]> = {
  S: [70, 150],
  X: [230, 70],
  Y: [420, 70],
  Z: [330, 230],
};
const E2: [string, string][] = [
  ["S", "X"],
  ["X", "Y"],
  ["Y", "Z"],
  ["Z", "X"],
];
const W2 = { "S-X": 2, "X-Y": 1, "Y-Z": -4, "Z-X": 2 };

interface View {
  cycle?: boolean;
  dist?: (number | string)[];
  changed?: string[];
  edgeTones?: Record<string, EdgeTone>;
  caption?: string;
  top?: string;
  tone?: Tone;
}

/** The directed graph, the distance table below it, and a caption naming the pass. */
function view(v: View) {
  const names = Object.keys(v.cycle ? N2 : N1);
  const tones: Record<string, Tone> = {};
  v.changed?.forEach((n) => (tones[n] = v.tone ?? "active"));
  const cw = 56;
  const x0 = 320 - (names.length * cw + (names.length - 1) * 8) / 2 + cw / 2;
  return scene(
    v.top && label("top", 320, 18, v.top, { size: 12, tone: "muted" }),
    graph(v.cycle ? N2 : N1, v.cycle ? E2 : E1, {
      directed: true,
      weights: v.cycle ? W2 : W1,
      tones,
      edgeTones: v.edgeTones,
    }),
    v.dist && label("dl", 320, 285, "distance from S", { size: 11, tone: "muted" }),
    v.dist &&
      names.map((n, i) =>
        cell(`d${n}`, x0 + i * (cw + 8), 322, v.dist![i], { w: cw, h: 40, sub: n, tone: tones[n] }),
      ),
    v.caption && label("cap", 320, 388, v.caption, { size: 13, weight: 800 }),
  );
}

const ORDER = "scan order: C→D, A→C, B→A, S→B, S→A";

export const bellmanFord: AlgoLesson = {
  id: "bellman-ford",
  title: "Bellman–Ford",
  summary:
    "Relax every edge V − 1 times to get shortest paths even with negative weights, and spot negative cycles.",
  minutes: 13,
  level: "advanced",
  goals: [
    "Why Dijkstra fails on negative edges",
    "What one pass of relaxing every edge does",
    "Why V − 1 passes are enough",
    "How one extra pass detects a negative cycle",
  ],
  takeaways: [
    "Bellman-Ford relaxes every edge in the graph, and repeats that V − 1 times.",
    "After k passes every shortest path using at most k edges is correct, and shortest paths never need more than V − 1 edges.",
    "If a pass number V still improves some distance, there is a negative cycle reachable from the source.",
  ],
  hud: [
    { label: "Pass", icon: "layers" },
    { label: "Improved", icon: "swap" },
    { label: "Dist to D", icon: "gauge" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "bellman_ford(graph, source):",
    "    dist[every node] = infinity; dist[source] = 0",
    "    repeat V - 1 times:",
    "        for each edge (u, v, w):",
    "            if dist[u] + w < dist[v]:",
    "                dist[v] = dist[u] + w",
    "    for each edge (u, v, w):",
    "        if dist[u] + w < dist[v]:",
    '            return "negative cycle"',
    "    return dist",
  ],
  steps: [
    {
      short: "The problem",
      title: "When an edge has a negative weight",
      body: [
        "Edge `B → A` has weight `-3`: taking it refunds cost. Think of a discount or a rebate along a route.",
        "Dijkstra settles the closest node and trusts it forever; a negative edge can still undercut it later. We need a method that never makes that assumption.",
      ],
      metrics: [{ label: "Pass", value: "—" }],
      scene: view({ edgeTones: { "B-A": "warn" } }),
    },
    {
      short: "The idea",
      title: "Relax everything, repeatedly",
      body: [
        "Start with `S = 0` and `∞` elsewhere. One pass looks at every edge `u → v` once and applies the relax rule: if `dist[u] + w < dist[v]`, update `dist[v]`.",
        "Do that pass `V − 1` times; with 5 nodes, 4 passes. The edges are scanned in the order shown, which happens to be an unlucky one, so we can watch the slow convergence.",
      ],
      metrics: [
        { label: "Pass", value: "0 / 4" },
        { label: "Dist to D", value: "∞", level: "warn" },
      ],
      lines: [2, 3, 4, 5, 6],
      scene: view({ dist: [0, INF, INF, INF, INF], top: ORDER, changed: ["S"], tone: "done" }),
    },
    {
      short: "Pass 1",
      title: "Pass 1: only the edges from S can fire",
      body: [
        "`C → D`, `A → C` and `B → A` start from nodes still at `∞`, so nothing happens. Then `S → B` sets `B = 5` and `S → A` sets `A = 4`.",
        "After one pass we know every shortest path that uses a single edge.",
      ],
      metrics: [
        { label: "Pass", value: "1 / 4" },
        { label: "Improved", value: "2" },
        { label: "Dist to D", value: "∞", level: "warn" },
      ],
      lines: [3, 4, 5, 6],
      scene: view({
        dist: [0, 4, 5, INF, INF],
        top: ORDER,
        changed: ["A", "B"],
        edgeTones: { "S-B": "active", "S-A": "active" },
      }),
    },
    {
      short: "Pass 2",
      title: "Pass 2: the negative edge pays off",
      body: [
        "`A → C` runs first, using `A = 4`, so `C = 10`. Then `B → A` offers `5 + (-3) = 2`, better than `4`, so `A = 2`.",
        "`C` is already stale: it was computed from the old `A`. That is fine; the next pass will repair it.",
      ],
      callout: {
        kind: "insight",
        text: "An improvement at one node needs a later pass to ripple onward, which is why we repeat the whole sweep.",
      },
      metrics: [
        { label: "Pass", value: "2 / 4" },
        { label: "Improved", value: "2" },
        { label: "Dist to D", value: "∞", level: "warn" },
      ],
      lines: [3, 4, 5, 6],
      scene: view({
        dist: [0, 2, 5, 10, INF],
        top: ORDER,
        changed: ["A", "C"],
        edgeTones: { "A-C": "active", "B-A": "active" },
      }),
    },
    {
      short: "Pass 3",
      title: "Pass 3: D appears, C improves",
      body: [
        "`C → D` is scanned first and sees `C = 10`, so `D = 12`. Then `A → C` uses the corrected `A = 2` and lowers `C` to `8`.",
        "Again the new `C` has not yet reached `D`.",
      ],
      metrics: [
        { label: "Pass", value: "3 / 4" },
        { label: "Improved", value: "2" },
        { label: "Dist to D", value: "12", level: "warn" },
      ],
      lines: [3, 4, 5, 6],
      scene: view({
        dist: [0, 2, 5, 8, 12],
        top: ORDER,
        changed: ["C", "D"],
        edgeTones: { "C-D": "active", "A-C": "active" },
      }),
    },
    {
      short: "Pass 4",
      title: "Pass 4: the last fix reaches D",
      body: [
        "`C → D` now sees `C = 8` and lowers `D` to `10`. Nothing else changes.",
        "The longest shortest path here is `S → B → A → C → D`, four edges. That is why `V − 1` passes are enough: a shortest path with no repeated node has at most `V − 1` edges.",
      ],
      callout: {
        kind: "tip",
        text: "If a whole pass changes nothing, stop early: the table can never change again.",
      },
      metrics: [
        { label: "Pass", value: "4 / 4" },
        { label: "Improved", value: "1" },
        { label: "Dist to D", value: "10", level: "good" },
      ],
      lines: [3, 4, 5, 6],
      scene: view({
        dist: [0, 2, 5, 8, 10],
        top: ORDER,
        changed: ["D"],
        edgeTones: { "C-D": "active" },
        caption: "best route: S → B → A → C → D = 10",
      }),
    },
    {
      short: "Neg. cycle",
      title: "A negative cycle has no answer",
      body: [
        "Now a different graph: `X → Y → Z → X` costs `1 + (-4) + 2 = -1`. Going around once makes the total smaller, so you can loop forever and the 'shortest' distance is minus infinity.",
        "Here are the distances after 3 passes. They are still dropping, by 1 at `X` each lap: `-1`, `1`, `-3`.",
      ],
      callout: {
        kind: "warn",
        text: "Shortest paths are only defined when no negative cycle is reachable from the source.",
      },
      metrics: [
        { label: "Pass", value: "3 / 3" },
        { label: "Improved", value: "3" },
      ],
      lines: [3],
      scene: view({
        cycle: true,
        dist: [0, -1, 1, -3],
        top: "scan order: S→X, X→Y, Y→Z, Z→X",
        changed: ["X", "Y", "Z"],
        tone: "warn",
        edgeTones: { "X-Y": "warn", "Y-Z": "warn", "Z-X": "warn" },
      }),
    },
    {
      short: "Extra pass",
      title: "The V-th pass is the alarm",
      body: [
        "With no negative cycle, pass `V − 1` would be the last that changes anything. So run one more. If any edge still relaxes, a negative cycle is reachable.",
        "Pass 4 here lowers `X`, `Y` and `Z` again, to `-2`, `0` and `-4`. Report the cycle; do not trust the distances.",
      ],
      metrics: [
        { label: "Pass", value: "4 (extra)", level: "bad" },
        { label: "Improved", value: "3", level: "bad" },
      ],
      lines: [7, 8, 9],
      scene: view({
        cycle: true,
        dist: [0, -2, 0, -4],
        top: "scan order: S→X, X→Y, Y→Z, Z→X",
        changed: ["X", "Y", "Z"],
        tone: "warn",
        edgeTones: { "X-Y": "warn", "Y-Z": "warn", "Z-X": "warn" },
        caption: "still improving on pass V: negative cycle!",
      }),
    },
    {
      short: "Recap",
      title: "Cost and when to use it",
      body: [
        "Each pass scans `E` edges and there are `V − 1` passes (plus one check), so the time is `O(V · E)`. Space is `O(V)` for the distances.",
        "That is slower than Dijkstra's `O((V + E) log V)`. Use Bellman-Ford when negative weights are possible, or when you must detect negative cycles, such as currency-arbitrage loops.",
      ],
      metrics: [
        { label: "Pass", value: "V − 1" },
        { label: "Cost", value: "O(V · E)", level: "warn" },
      ],
      scene: scene(
        label("t1", 320, 70, "repeat V − 1 times:", { size: 14, weight: 800 }),
        label("t2", 320, 110, "for every edge u → v with weight w:", { size: 14 }),
        label("t3", 320, 150, "if dist[u] + w < dist[v]: dist[v] = dist[u] + w", { size: 14 }),
        label("t4", 320, 205, "one more pass still improves?  negative cycle", {
          size: 14,
          tone: "warn",
        }),
        label("t5", 320, 255, "time O(V · E)   space O(V)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
