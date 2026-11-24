import { graph, label, scene, stack } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

// Same graph as the BFS lesson so the two orders can be compared.
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

const withEntry = (items: Item[], order: string[]): Item[] =>
  items.map((i) =>
    i.t === "disc" && order.includes(i.id.slice(1))
      ? { ...i, sub: `#${order.indexOf(i.id.slice(1)) + 1}` }
      : i,
  );

/**
 * `order` is the entry order so far, `stk` the vertices still open (bottom to top). Open ones are
 * marked, the top is active, entered-and-closed ones are done.
 */
function view(order: string[], stk: string[], note: string) {
  const tones: Record<string, Tone> = {};
  order.forEach((n) => (tones[n] = "done"));
  stk.forEach((n) => (tones[n] = "mark"));
  if (stk.length) tones[stk[stk.length - 1]] = "active";
  return scene(
    withEntry(graph(NODES, EDGES, { tones }), order),
    stack(stk, {
      keys: stk,
      x: 560,
      y: 235,
      w: 60,
      h: 30,
      gap: 4,
      tones: (i) => (i === stk.length - 1 ? "active" : "mark"),
    }),
    label("scap", 560, 255, "open calls", { size: 12, weight: 800 }),
    stk.length === 0 && label("sempty", 560, 215, "empty", { size: 12, tone: "muted" }),
    label("ord", 250, 275, `entry order: ${order.length ? order.join(" ") : "—"}`, {
      size: 13,
      weight: 800,
      tone: "good",
    }),
    label("note", 250, 20, note, { size: 13, weight: 800 }),
  );
}

export const depthFirstSearch: AlgoLesson = {
  id: "depth-first-search",
  title: "Depth-First Search",
  summary:
    "Dive down one path as far as it goes, then back up to try the next, using recursion or a stack.",
  minutes: 13,
  level: "beginner",
  goals: [
    "How DFS goes deep and then backtracks",
    "The role of the visited set and the call stack",
    "The entry order on a real graph",
    "How DFS differs from BFS, and its cost",
  ],
  takeaways: [
    "DFS follows one path until it hits a dead end, then backtracks to the most recent vertex that still has unexplored neighbours.",
    "Recursion gives you the stack for free; an explicit stack gives the same walk without risking a deep call stack.",
    "DFS visits each vertex and edge once, so it costs O(V + E) time and O(V) memory, but it does not find shortest paths.",
  ],
  hud: [
    { label: "Entered", icon: "check" },
    { label: "Stack depth", icon: "layers" },
    { label: "Backtracks", icon: "swap" },
    { label: "Work", icon: "timer" },
  ],
  pseudocode: [
    "dfs(graph, u, visited):",
    "    add u to visited",
    "    record u in the entry order",
    "    for each v in graph[u]:",
    "        if v is not in visited:",
    "            dfs(graph, v, visited)",
    "    return to the caller",
  ],
  steps: [
    {
      short: "The idea",
      title: "Go deep before going wide",
      body: [
        "Think of exploring a maze: at every junction take a corridor and keep going. Only when you hit a dead end do you walk back to the last junction that had another way.",
        "That 'last junction first' behaviour is a stack. In code it is the recursion call stack, shown on the right.",
      ],
      metrics: [
        { label: "Entered", value: "0" },
        { label: "Stack depth", value: "0" },
        { label: "Backtracks", value: "0" },
      ],
      scene: view([], [], "start at A, try neighbours in alphabetical order"),
    },
    {
      short: "Enter A",
      title: "Visit the start",
      body: [
        "Call `dfs(A)`. Mark `A` visited and note it as entry `#1`. It stays open on the stack while we explore its neighbours.",
      ],
      metrics: [
        { label: "Entered", value: "1" },
        { label: "Stack depth", value: "1" },
        { label: "Backtracks", value: "0" },
      ],
      lines: [2, 3],
      scene: view(["A"], ["A"], "dfs(A)"),
    },
    {
      short: "Down to B",
      title: "Take the first unvisited neighbour",
      body: [
        "`A` has neighbours `B` and `C`. We take `B` first and call `dfs(B)` immediately, without looking at `C` yet.",
        "`A` waits on the stack with `C` still untried.",
      ],
      metrics: [
        { label: "Entered", value: "2" },
        { label: "Stack depth", value: "2" },
        { label: "Backtracks", value: "0" },
      ],
      lines: [4, 5, 6],
      scene: view(["A", "B"], ["A", "B"], "dfs(B): A is still open, C is waiting"),
    },
    {
      short: "Down to D",
      title: "Keep going deeper",
      body: [
        "`B`'s other neighbour is `D`, so we call `dfs(D)`. The stack is now three deep: `A`, `B`, `D`.",
        "Notice we are heading away from `C`, which BFS would have visited already.",
      ],
      metrics: [
        { label: "Entered", value: "3" },
        { label: "Stack depth", value: "3" },
        { label: "Backtracks", value: "0" },
      ],
      lines: [4, 5, 6],
      scene: view(["A", "B", "D"], ["A", "B", "D"], "dfs(D)"),
    },
    {
      short: "Down to E",
      title: "Cross the D–E link",
      body: [
        "`D` has neighbours `B` (visited), `E` and `F`. We try `E` first because it comes first, and call `dfs(E)`.",
        "`F` is left for later.",
      ],
      metrics: [
        { label: "Entered", value: "4" },
        { label: "Stack depth", value: "4" },
        { label: "Backtracks", value: "0" },
      ],
      lines: [4, 5, 6],
      scene: view(["A", "B", "D", "E"], ["A", "B", "D", "E"], "dfs(E): F is waiting at D"),
    },
    {
      short: "Down to C",
      title: "Reach C from the far side",
      body: [
        "`E`'s neighbours are `C`, `D` and `G`. `C` is unvisited, so `dfs(C)` runs. We arrived at `C` through `E`, not directly from `A`.",
        "`C`'s own neighbours `A` and `E` are both visited, so there is nothing left to explore from it.",
      ],
      callout: {
        kind: "insight",
        text: "DFS reaches C after five steps; BFS reached it in two. DFS order says nothing about distance.",
      },
      metrics: [
        { label: "Entered", value: "5" },
        { label: "Stack depth", value: "5" },
        { label: "Backtracks", value: "0" },
      ],
      lines: [4, 5, 6],
      scene: view(["A", "B", "D", "E", "C"], ["A", "B", "D", "E", "C"], "dfs(C): dead end"),
    },
    {
      short: "Backtrack",
      title: "A dead end: pop and resume",
      body: [
        "`C` has no unvisited neighbours, so `dfs(C)` returns. The stack pops back to `E`, which resumes where it left off.",
        "Backtracking is just a function returning. `C` is now finished and stays coloured as done.",
      ],
      metrics: [
        { label: "Entered", value: "5" },
        { label: "Stack depth", value: "4" },
        { label: "Backtracks", value: "1", level: "warn" },
      ],
      lines: [7],
      scene: view(["A", "B", "D", "E", "C"], ["A", "B", "D", "E"], "dfs(C) returns, back in E"),
    },
    {
      short: "Down to G",
      title: "Resume E's next neighbour",
      body: [
        "`E` still has `G` to try, so `dfs(G)` is called and `G` becomes entry `#6`. It has no unvisited neighbours and returns straight away.",
      ],
      metrics: [
        { label: "Entered", value: "6" },
        { label: "Stack depth", value: "5" },
        { label: "Backtracks", value: "1" },
      ],
      lines: [4, 5, 6],
      scene: view(["A", "B", "D", "E", "C", "G"], ["A", "B", "D", "E", "G"], "dfs(G): dead end"),
    },
    {
      short: "Unwind",
      title: "Finish F and unwind everything",
      body: [
        "After `G` returns and `E` finishes, `D` resumes and visits `F` as entry `#7`. Then `F`, `D`, `B` and `A` return in turn and the stack empties.",
        "Entry order: `A B D E C G F`. BFS gave `A B C D E F G` on the same graph.",
      ],
      metrics: [
        { label: "Entered", value: "7", level: "good" },
        { label: "Stack depth", value: "0", level: "good" },
        { label: "Backtracks", value: "6" },
      ],
      lines: [4, 7],
      scene: view(
        ["A", "B", "D", "E", "C", "G", "F"],
        [],
        "stack empty: every vertex entered once",
      ),
    },
    {
      short: "Compare",
      title: "DFS against BFS, and the cost",
      body: [
        "Each vertex is entered once and each edge looked at a constant number of times, so DFS is `O(V + E)`. Memory is the stack depth, up to `O(V)` on a long path.",
        "Pick DFS to explore everything, find cycles, order tasks or solve mazes; pick BFS for fewest steps. A very long path can overflow the recursion limit, so use an explicit stack there.",
      ],
      callout: {
        kind: "tip",
        text: "Replace the call stack with your own stack: push the start, then repeatedly pop a vertex and push its unvisited neighbours.",
      },
      metrics: [
        { label: "Entered", value: "V" },
        { label: "Work", value: "O(V + E)", level: "good" },
      ],
      scene: view(
        ["A", "B", "D", "E", "C", "G", "F"],
        [],
        "DFS: A B D E C G F   |   BFS: A B C D E F G",
      ),
    },
  ],
};
