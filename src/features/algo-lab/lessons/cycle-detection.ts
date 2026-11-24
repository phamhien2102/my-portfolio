import { graph, label, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

// Undirected: a triangle A-B-C with a tail C-D.
const U_NODES: Record<string, [number, number]> = {
  A: [90, 60],
  B: [260, 60],
  C: [175, 190],
  D: [380, 190],
};
const U_EDGES: [string, string][] = [
  ["A", "B"],
  ["B", "C"],
  ["C", "A"],
  ["C", "D"],
];

// Directed diamond: no cycle, but Z is reached twice.
const M_NODES: Record<string, [number, number]> = {
  W: [90, 120],
  X: [240, 50],
  Y: [240, 190],
  Z: [390, 120],
};
const M_EDGES: [string, string][] = [
  ["W", "X"],
  ["W", "Y"],
  ["X", "Z"],
  ["Y", "Z"],
];

// Directed with a cycle Q -> R -> S -> Q.
const D_NODES: Record<string, [number, number]> = {
  P: [70, 120],
  Q: [200, 120],
  R: [330, 50],
  S: [330, 190],
};
const D_EDGES: [string, string][] = [
  ["P", "Q"],
  ["Q", "R"],
  ["R", "S"],
  ["S", "Q"],
];

const caption = (text: string, tone?: "good" | "warn") =>
  label("note", 280, 270, text, { size: 13, weight: 800, tone });

function undirected(
  tones: Record<string, Tone>,
  edgeTones: Record<string, EdgeTone>,
  text: string,
) {
  return scene(
    graph(U_NODES, U_EDGES, { id: "u", tones, edgeTones }),
    caption(text, edgeTones["C-A"] === "warn" ? "warn" : undefined),
  );
}

function diamond(tones: Record<string, Tone>, edgeTones: Record<string, EdgeTone>, text: string) {
  return scene(
    graph(M_NODES, M_EDGES, { id: "m", directed: true, tones, edgeTones }),
    label("legend", 280, 25, "plain = white   mark = grey (on stack)   done = black (finished)", {
      size: 12,
      tone: "muted",
    }),
    caption(text),
  );
}

function directed(tones: Record<string, Tone>, edgeTones: Record<string, EdgeTone>, text: string) {
  return scene(
    graph(D_NODES, D_EDGES, { id: "d", directed: true, tones, edgeTones }),
    caption(text, edgeTones["S-Q"] === "warn" ? "warn" : undefined),
  );
}

export const cycleDetection: AlgoLesson = {
  id: "cycle-detection",
  title: "Cycle Detection",
  summary:
    "Find a loop with DFS: a non-parent visited neighbour when undirected, a back edge when directed.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "What a cycle is and why it matters",
    "The parent rule for undirected graphs",
    "Three colours for directed graphs",
    "Why 'already visited' alone is not enough",
  ],
  takeaways: [
    "A cycle is a path that returns to its starting vertex; DFS finds one when it meets a vertex it is already inside.",
    "In an undirected graph, a visited neighbour that is not the vertex you just came from means a cycle.",
    "In a directed graph, only an edge to a vertex still on the recursion stack (grey) is a cycle; an edge to a finished (black) vertex is harmless.",
  ],
  hud: [
    { label: "Visited", icon: "check" },
    { label: "Stack depth", icon: "layers" },
    { label: "Cycle", icon: "alert" },
    { label: "Work", icon: "timer" },
  ],
  pseudocode: [
    "cycle_undirected(g, u, parent):",
    "    mark u visited",
    "    for each v in g[u]:",
    "        if v is not visited:",
    "            if cycle_undirected(g, v, u): return true",
    "        else if v is not parent:",
    "            return true",
    "    return false",
    "dir_cycle(g, u):",
    "    color[u] = grey",
    "    for each v in g[u]:",
    "        if color[v] is grey: return true",
    "        if color[v] is white and dir_cycle(g, v): return true",
    "    color[u] = black, return false",
  ],
  steps: [
    {
      short: "Problem",
      title: "Is there a loop?",
      body: [
        "A cycle is a path that starts and ends at the same vertex, like `A → B → C → A`. Spotting one matters: a build system with a cycle can never finish, and a loop in dependencies is a bug.",
        "Depth-first search is the natural tool, because it walks a single path and notices when that path bites its own tail.",
      ],
      metrics: [
        { label: "Visited", value: "0" },
        { label: "Cycle", value: "unknown" },
      ],
      scene: undirected({}, {}, "undirected graph: a triangle A–B–C and a tail C–D"),
    },
    {
      short: "Visit A",
      title: "Undirected: carry the parent",
      body: [
        "Run DFS from `A`, passing along the vertex we came from, the parent. `A` is the start, so its parent is none.",
        "In an undirected graph every edge can be walked backwards, so we need the parent to avoid mistaking that return trip for a loop.",
      ],
      metrics: [
        { label: "Visited", value: "1" },
        { label: "Stack depth", value: "1" },
        { label: "Cycle", value: "no" },
      ],
      lines: [1, 2],
      scene: undirected({ A: "active" }, {}, "dfs(A, parent = none)"),
    },
    {
      short: "Go to B",
      title: "Ignore the edge we came by",
      body: [
        "From `A` we step to `B`, so `dfs(B, parent = A)`. `B`'s neighbours are `A` and `C`.",
        "`A` is already visited, but it is our parent: that edge is the one we just used, not a new loop. Skip it and move on.",
      ],
      metrics: [
        { label: "Visited", value: "2" },
        { label: "Stack depth", value: "2" },
        { label: "Cycle", value: "no" },
      ],
      lines: [3, 6],
      scene: undirected(
        { A: "mark", B: "active" },
        { "A-B": "active" },
        "dfs(B, parent = A): A is the parent, skip",
      ),
    },
    {
      short: "Go to C",
      title: "A visited vertex that is not the parent",
      body: [
        "From `B` we step to `C`, so `dfs(C, parent = B)`. `C`'s neighbours are `B`, `A` and `D`.",
        "`B` is the parent, skip. But `A` is visited and is not `C`'s parent. There is a second route between `A` and `C`, so the edge `C–A` closes a cycle.",
      ],
      callout: {
        kind: "insight",
        text: "Visited and not the parent means 'I reached this vertex by a different path': that is exactly a cycle.",
      },
      metrics: [
        { label: "Visited", value: "3" },
        { label: "Stack depth", value: "3" },
        { label: "Cycle", value: "yes", level: "bad" },
      ],
      lines: [6, 7],
      scene: undirected(
        { A: "warn", B: "mark", C: "active" },
        { "A-B": "active", "B-C": "active", "C-A": "warn" },
        "cycle found: A – B – C – A",
      ),
    },
    {
      short: "Why parent?",
      title: "Without the parent rule we would lie",
      body: [
        "Take the simplest graph: just `X – Y`. DFS goes from `X` to `Y`, and `Y` sees `X` as a visited neighbour.",
        "If we flagged every visited neighbour, this single edge would count as a cycle. Excluding the parent prevents that false alarm.",
      ],
      callout: {
        kind: "warn",
        text: "Two parallel edges between the same pair do form a cycle, so a multigraph needs the edge id as the parent, not the vertex.",
      },
      metrics: [
        { label: "Visited", value: "2" },
        { label: "Cycle", value: "no", level: "good" },
      ],
      lines: [6, 7],
      scene: scene(
        graph({ X: [220, 110], Y: [360, 110] }, [["X", "Y"]], {
          id: "p",
          tones: { X: "mark", Y: "active" },
        }),
        label("note", 290, 200, "Y sees X, but X is its parent: not a cycle", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "3 colours",
      title: "Directed graphs need three colours",
      body: [
        "With arrows, 'visited' is not enough. Give each vertex a colour: white (not seen), grey (still open, on the recursion stack), black (finished, all descendants done).",
        "A cycle exists only when an edge leads to a grey vertex, because that vertex is an ancestor of the current one.",
      ],
      metrics: [
        { label: "Visited", value: "0" },
        { label: "Cycle", value: "unknown" },
      ],
      lines: [9, 10, 12],
      scene: diamond({}, {}, "directed diamond: W → X → Z and W → Y → Z"),
    },
    {
      short: "Black is safe",
      title: "A finished vertex is not a cycle",
      body: [
        "DFS goes `W`, then `X`, then `Z`. `Z` has no outgoing edges, so it turns black, then `X` turns black. Back in `W`, we go to `Y`.",
        "`Y` points to `Z`, which is already visited, but it is black, not grey. We cannot get from `Z` back to `Y`, so there is no loop. Treating it as one would be wrong.",
      ],
      callout: {
        kind: "tip",
        text: "This is the case a plain visited set gets wrong: two paths into the same vertex are not a cycle.",
      },
      metrics: [
        { label: "Visited", value: "4" },
        { label: "Stack depth", value: "2" },
        { label: "Cycle", value: "no", level: "good" },
      ],
      lines: [12, 13, 14],
      scene: diamond(
        { W: "mark", X: "done", Y: "active", Z: "done" },
        { "W-X": "active", "X-Z": "active", "W-Y": "active", "Y-Z": "muted" },
        "Y → Z reaches a black vertex: fine",
      ),
    },
    {
      short: "Back edge",
      title: "A grey vertex means a cycle",
      body: [
        "Now a graph with arrows `Q → R → S → Q`. DFS goes `P`, `Q`, `R`, `S`, so the stack holds `P, Q, R, S`, all grey.",
        "`S` points to `Q`, which is grey: it is still open, an ancestor of `S`. That edge is a back edge, and `Q → R → S → Q` is a cycle.",
      ],
      callout: {
        kind: "insight",
        text: "A back edge points from a vertex to one of its own ancestors on the current path.",
      },
      metrics: [
        { label: "Visited", value: "4" },
        { label: "Stack depth", value: "4" },
        { label: "Cycle", value: "yes", level: "bad" },
      ],
      lines: [12],
      scene: directed(
        { P: "mark", Q: "mark", R: "mark", S: "warn" },
        { "P-Q": "active", "Q-R": "active", "R-S": "active", "S-Q": "warn" },
        "S → Q hits a grey vertex: cycle Q → R → S → Q",
      ),
    },
    {
      short: "Recap",
      title: "Two rules, one cost",
      body: [
        "Undirected: a visited neighbour that is not the parent. Directed: an edge to a grey vertex (one still on the recursion stack). Both rules ride on a single DFS.",
        "Each vertex and edge is handled once, so detection costs `O(V + E)` time and `O(V)` memory. Run it from every unvisited vertex so that every component is checked.",
      ],
      metrics: [
        { label: "Visited", value: "V" },
        { label: "Work", value: "O(V + E)", level: "good" },
      ],
      scene: scene(
        label("r1", 280, 80, "undirected: visited neighbour that is not the parent", {
          size: 14,
          weight: 800,
        }),
        label("r2", 280, 130, "directed: edge into a grey vertex on the stack", {
          size: 14,
          weight: 800,
        }),
        label("r3", 280, 190, "time O(V + E), memory O(V)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
