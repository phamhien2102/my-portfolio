import { graph, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Item, Tone } from "../lib/types";

// Tasks and their dependencies: an arrow U -> V means "U must come before V".
const NODES: Record<string, [number, number]> = {
  A: [60, 70],
  B: [60, 190],
  C: [200, 70],
  D: [200, 190],
  E: [340, 130],
  F: [470, 130],
};
const EDGES: [string, string][] = [
  ["A", "C"],
  ["B", "C"],
  ["B", "D"],
  ["C", "E"],
  ["D", "E"],
  ["E", "F"],
];

/** `out` are removed vertices (the answer so far), `queue` the ready ones; in-degrees follow `out`. */
function view(out: string[], queue: string[], note: string, showDegrees = true) {
  const indeg: Record<string, number> = {};
  Object.keys(NODES).forEach((n) => (indeg[n] = 0));
  EDGES.forEach(([u, v]) => {
    if (!out.includes(u)) indeg[v] += 1;
  });
  const tones: Record<string, Tone> = {};
  out.forEach((n) => (tones[n] = "done"));
  queue.forEach((n) => (tones[n] = "mark"));
  if (out.length) tones[out[out.length - 1]] = "active";
  const edgeTones: Record<string, EdgeTone> = {};
  EDGES.forEach(([u, v]) => {
    if (out.includes(u)) edgeTones[`${u}-${v}`] = "muted";
  });
  const items: Item[] = graph(NODES, EDGES, { directed: true, tones, edgeTones }).map((i) =>
    i.t === "disc" && showDegrees && !out.includes(i.id.slice(1))
      ? { ...i, sub: `in ${indeg[i.id.slice(1)]}` }
      : i,
  );
  const qTotal = queue.length * 52 - 8;
  const oTotal = out.length * 52 - 8;
  return scene(
    items,
    label("qcap", 70, 252, "queue", { size: 13, weight: 800 }),
    queue.length
      ? row(queue, {
          id: "q",
          keys: queue,
          x: 130 + qTotal / 2,
          y: 248,
          w: 44,
          h: 34,
          tones: () => "mark",
        })
      : label("qempty", 160, 252, "empty", { size: 13, tone: "muted" }),
    label("ocap", 70, 297, "order", { size: 13, weight: 800 }),
    out.length
      ? row(out, {
          id: "o",
          keys: out,
          x: 130 + oTotal / 2,
          y: 293,
          w: 44,
          h: 34,
          tones: () => "done",
        })
      : label("oempty", 160, 297, "—", { size: 13, tone: "muted" }),
    label("note", 270, 15, note, { size: 13, weight: 800 }),
  );
}

export const topologicalSort: AlgoLesson = {
  id: "topological-sort",
  title: "Topological Sort",
  summary:
    "Order tasks so every dependency comes first, using in-degrees and a queue (Kahn's algorithm).",
  minutes: 13,
  level: "intermediate",
  goals: [
    "What a topological order is and when one exists",
    "In-degrees and the ready queue",
    "Kahn's algorithm step by step",
    "How a cycle shows up as a leftover",
  ],
  takeaways: [
    "A topological order lists the vertices of a directed acyclic graph so that every edge points from earlier to later.",
    "Kahn's algorithm repeatedly removes a vertex with in-degree zero and lowers the in-degree of its neighbours.",
    "If fewer than V vertices come out, the rest sit on a cycle and no valid order exists; the cost is O(V + E).",
  ],
  hud: [
    { label: "Placed", icon: "check" },
    { label: "Queue size", icon: "queue" },
    { label: "Left", icon: "hourglass" },
    { label: "Work", icon: "timer" },
  ],
  pseudocode: [
    "topo_sort(graph):",
    "    indeg[v] = number of arrows into v, for every v",
    "    queue = all vertices with indeg 0",
    "    order = empty list",
    "    while queue is not empty:",
    "        u = remove the front of queue",
    "        add u to order",
    "        for each v in graph[u]:",
    "            indeg[v] = indeg[v] - 1",
    "            if indeg[v] == 0: add v to queue",
    "    if size of order < V: report a cycle",
    "    return order",
  ],
  steps: [
    {
      short: "Dependencies",
      title: "Some tasks must come first",
      body: [
        "Six tasks, and each arrow `U → V` means `U` must be done before `V`: `C` needs both `A` and `B`, `E` needs `C` and `D`, and so on.",
        "A topological order is a line-up of all tasks in which every task comes after everything it depends on. Build systems and course prerequisites need exactly this.",
      ],
      metrics: [
        { label: "Placed", value: "0" },
        { label: "Left", value: "6" },
      ],
      scene: view([], [], "arrow U → V: U before V", false),
    },
    {
      short: "In-degrees",
      title: "Count what each task waits for",
      body: [
        "The in-degree of a vertex is the number of arrows pointing into it, that is, how many tasks it still waits for. It is written under each vertex.",
        "`A` and `B` have `in 0`: nothing blocks them. `E` has `in 2`: it waits for `C` and `D`.",
      ],
      metrics: [
        { label: "Placed", value: "0" },
        { label: "Left", value: "6" },
      ],
      lines: [2],
      scene: view([], [], "in = number of unfinished prerequisites"),
    },
    {
      short: "Ready queue",
      title: "Queue every task with in-degree 0",
      body: [
        "These are the tasks that can start right now, so put `A` and `B` in a queue.",
        "Every valid order must begin with one of them, because anything else still waits on something.",
      ],
      metrics: [
        { label: "Placed", value: "0" },
        { label: "Queue size", value: "2" },
        { label: "Left", value: "6" },
      ],
      lines: [3],
      scene: view([], ["A", "B"], "ready: A and B"),
    },
    {
      short: "Remove A",
      title: "Take A out, lower its neighbours",
      body: [
        "Dequeue `A` and append it to the answer. Now delete its outgoing arrows: `C` loses one prerequisite, so its in-degree drops from `2` to `1`.",
        "`C` is not ready yet. It still waits for `B`.",
      ],
      metrics: [
        { label: "Placed", value: "1" },
        { label: "Queue size", value: "1" },
        { label: "Left", value: "5" },
      ],
      lines: [6, 7, 8, 9],
      scene: view(["A"], ["B"], "remove A: C goes from in 2 to in 1"),
    },
    {
      short: "Remove B",
      title: "Two tasks become ready at once",
      body: [
        "Dequeue `B`. Its arrows go to `C` and `D`: `C` drops from `1` to `0` and `D` from `1` to `0`.",
        "Whenever a count reaches zero, the vertex joins the queue. Both `C` and `D` do.",
      ],
      callout: {
        kind: "insight",
        text: "The in-degree hits 0 exactly when the last prerequisite has been placed, so a vertex enters the queue at the right moment and never before.",
      },
      metrics: [
        { label: "Placed", value: "2" },
        { label: "Queue size", value: "2" },
        { label: "Left", value: "4" },
      ],
      lines: [8, 9, 10],
      scene: view(["A", "B"], ["C", "D"], "remove B: C and D reach in 0"),
    },
    {
      short: "Remove C",
      title: "E still waits for D",
      body: [
        "Dequeue `C`. Its only arrow goes to `E`, which drops from `2` to `1`.",
        "`E` stays out of the queue until `D` is placed too.",
      ],
      metrics: [
        { label: "Placed", value: "3" },
        { label: "Queue size", value: "1" },
        { label: "Left", value: "3" },
      ],
      lines: [6, 7, 8, 9],
      scene: view(["A", "B", "C"], ["D"], "remove C: E goes from in 2 to in 1"),
    },
    {
      short: "Remove D",
      title: "E becomes ready",
      body: ["Dequeue `D`. `E` drops to `0` and is queued."],
      metrics: [
        { label: "Placed", value: "4" },
        { label: "Queue size", value: "1" },
        { label: "Left", value: "2" },
      ],
      lines: [8, 9, 10],
      scene: view(["A", "B", "C", "D"], ["E"], "remove D: E reaches in 0"),
    },
    {
      short: "Finish",
      title: "A complete order",
      body: [
        "`E` goes out and frees `F`, and then `F` goes out. All six vertices are placed: `A B C D E F`.",
        "Check any arrow: `B → D`, `D → E`, `E → F` all point left to right. Other orders such as `B A D C E F` would be valid too.",
      ],
      metrics: [
        { label: "Placed", value: "6", level: "good" },
        { label: "Queue size", value: "0", level: "good" },
        { label: "Left", value: "0", level: "good" },
      ],
      lines: [5, 12],
      scene: view(["A", "B", "C", "D", "E", "F"], [], "all placed: A B C D E F"),
    },
    {
      short: "A cycle",
      title: "If there is a cycle, we get stuck",
      body: [
        "Suppose the tasks were `S → X`, `X → Y`, `Y → Z` and `Z → X`. `S` has in-degree `0` and goes out; `X` drops from `2` to `1`.",
        "Now the queue is empty but `X`, `Y`, `Z` remain: each waits for another one in the loop. Only `1` of `4` vertices was placed.",
      ],
      callout: {
        kind: "warn",
        text: "Fewer than V vertices placed means a cycle: no topological order exists. Kahn's algorithm doubles as a cycle detector.",
      },
      metrics: [
        { label: "Placed", value: "1 of 4", level: "bad" },
        { label: "Queue size", value: "0", level: "warn" },
        { label: "Left", value: "3", level: "bad" },
      ],
      lines: [5, 11],
      scene: scene(
        graph(
          { S: [60, 130], X: [210, 130], Y: [340, 50], Z: [340, 190] },
          [
            ["S", "X"],
            ["X", "Y"],
            ["Y", "Z"],
            ["Z", "X"],
          ],
          {
            id: "c",
            directed: true,
            tones: { S: "done", X: "warn", Y: "warn", Z: "warn" },
            edgeTones: { "S-X": "muted", "X-Y": "warn", "Y-Z": "warn", "Z-X": "warn" },
          },
        ),
        label("n1", 270, 250, "queue empty, but X, Y, Z still wait on each other", {
          size: 13,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "Recap",
      title: "The rule and the cost",
      body: [
        "Repeat: remove a vertex with in-degree `0`, add it to the order, lower its neighbours' counts, queue any that reach `0`. Stop when the queue is empty and compare the count placed with `V`.",
        "Computing in-degrees costs `O(V + E)`, and each vertex and edge is handled once after that, so the whole algorithm is `O(V + E)` time and `O(V)` memory.",
      ],
      callout: {
        kind: "tip",
        text: "A DFS that records vertices as they finish, then reverses that list, gives a topological order too.",
      },
      metrics: [
        { label: "Placed", value: "V if acyclic", level: "good" },
        { label: "Work", value: "O(V + E)", level: "good" },
      ],
      scene: scene(
        label("r1", 280, 70, "1. count in-degrees", { size: 15, weight: 800 }),
        label("r2", 280, 115, "2. queue every vertex with in 0", { size: 15, weight: 800 }),
        label("r3", 280, 160, "3. remove one, lower neighbours, queue new zeros", {
          size: 15,
          weight: 800,
        }),
        label("r4", 280, 215, "placed < V  →  cycle  →  no order", {
          size: 15,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
  ],
};
