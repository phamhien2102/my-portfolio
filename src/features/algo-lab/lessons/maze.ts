import { label, matrix, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

type P = [number, number]; // [row, col]

// 1 = wall. Start is top-left, goal is the left cell of row 2.
const GRID = [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
  [1, 0, 1, 1, 1],
];
const START: P = [0, 0];
const GOAL: P = [2, 0];

/** The maze with the current path numbered, abandoned cells greyed and the head highlighted. */
function view(
  path: P[],
  o: { dead?: P[]; head?: P; done?: boolean; alt?: P[]; note?: string; foot?: string } = {},
) {
  const text: string[][] = GRID.map((r) => r.map((v) => (v ? "#" : "")));
  const tones: Record<string, Tone> = {};
  GRID.forEach((r, ri) => r.forEach((v, ci) => v && (tones[`${ri},${ci}`] = "done")));
  for (const [r, c] of o.dead ?? []) {
    text[r][c] = "x";
    tones[`${r},${c}`] = "muted";
  }
  path.forEach(([r, c], i) => {
    text[r][c] = String(i);
    tones[`${r},${c}`] = o.done ? "found" : "mark";
  });
  for (const [r, c] of o.alt ?? []) {
    text[r][c] = text[r][c] || "";
    tones[`${r},${c}`] = "found";
  }
  text[START[0]][START[1]] = "S";
  text[GOAL[0]][GOAL[1]] = "G";
  if (!path.some(([r, c]) => r === GOAL[0] && c === GOAL[1]) && !o.alt)
    tones[`${GOAL[0]},${GOAL[1]}`] = "plain";
  if (o.head) {
    const [r, c] = o.head;
    tones[`${r},${c}`] = "active";
  }
  return scene(
    matrix(text, { x: 320, y: 120, w: 52, h: 44, tones }),
    o.note && label("note", 320, 245, o.note, { size: 13, weight: 800 }),
    o.foot && label("foot", 320, 272, o.foot, { size: 12, tone: "muted" }),
  );
}

// The depth-first route, trying right, down, left, up.
const ROUTE: P[] = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 4],
  [2, 4],
  [2, 3],
  [2, 2],
  [2, 1],
  [2, 0],
];

export const maze: AlgoLesson = {
  id: "maze",
  title: "Solving a Maze",
  summary: "Find a route through a grid maze by walking forward and backing out of dead ends.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How to model a maze as a grid of walls and open cells",
    "How trying a direction, marking and backtracking finds a path",
    "Why visited marks prevent endless loops",
    "Why depth-first search is not guaranteed to be shortest and what BFS does",
  ],
  takeaways: [
    "Try each direction in a fixed order, mark the cell, recurse, and undo the move when every direction fails.",
    "Visited marks stop the search from walking in circles, so each cell is explored at most once.",
    "Depth-first backtracking finds some path; breadth-first search explores in rings and finds the shortest one.",
  ],
  hud: [
    { label: "Path length", icon: "gauge" },
    { label: "Dead ends", icon: "alert" },
    { label: "Cells visited", icon: "grid" },
  ],
  pseudocode: [
    "solve(cell):",
    "    if cell is the goal: return true",
    "    mark cell as visited and add it to the path",
    "    for step in [right, down, left, up]:",
    "        next = cell + step",
    "        if next is open and not visited:",
    "            if solve(next): return true",
    "    remove cell from path (it stays marked visited)",
    "    return false",
  ],
  steps: [
    {
      short: "The maze",
      title: "A grid with walls",
      body: [
        "The maze is a grid where `#` marks a wall and blank cells are open. We start at `S` in the top-left corner and want to reach `G`.",
        "From any cell you may step right, down, left or up into an open cell. The question: is there a route, and which one do we find?",
      ],
      metrics: [
        { label: "Path length", value: "0" },
        { label: "Dead ends", value: "0" },
        { label: "Cells visited", value: "1" },
      ],
      scene: view([START], { head: START, note: "S: start    G: goal    #: wall" }),
    },
    {
      short: "The rule",
      title: "Try directions in a fixed order",
      body: [
        "At each cell try the four neighbours in a set order: right, down, left, up. Skip walls, cells off the grid and cells already on the path.",
        "On the first open one, mark it as part of the path and move there. This is choose, explore: recurse from the new cell.",
      ],
      callout: {
        kind: "insight",
        text: "The visited mark is what prevents loops. Without it you could bounce between two cells forever.",
      },
      metrics: [
        { label: "Path length", value: "0" },
        { label: "Cells visited", value: "1" },
      ],
      lines: [4, 5, 6, 7],
      scene: view([START], {
        head: START,
        note: "order: right, down, left, up",
        foot: "down is a wall, so right comes first anyway",
      }),
    },
    {
      short: "Follow it",
      title: "Right is always open here",
      body: [
        "From `S` go right, again and again along the top row until the wall at the right edge. The cell below, `(1,4)`, is open, so turn down.",
        "Keep going down to `(2,4)`. Each cell gets the next number on the path. We are heading away from the goal, but the rule has no way to know that.",
      ],
      metrics: [
        { label: "Path length", value: "6" },
        { label: "Cells visited", value: "7" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: view(ROUTE.slice(0, 7), { head: ROUTE[6], note: "path numbers 0 to 6" }),
    },
    {
      short: "Turn back",
      title: "Along the bottom corridor",
      body: [
        "At `(2,4)` right is the edge and down is a wall, so the next try is left. Walk left along row 2 to `(2,1)`.",
        "The goal is directly below the start, yet the search is on its far side. The next move shows what a dead end looks like.",
      ],
      metrics: [
        { label: "Path length", value: "9" },
        { label: "Cells visited", value: "10" },
      ],
      lines: [4, 5, 6, 7],
      scene: view(ROUTE.slice(0, 10), { head: ROUTE[9], note: "left along row 2: now at (2,1)" }),
    },
    {
      short: "Dead end",
      title: "A side pocket with no way out",
      body: [
        "At `(2,1)` the order tries right (already on the path), then down: `(3,1)` is open, so step in. From there right is a wall, down is off the grid, left is a wall and up is the path. No move is possible.",
        "This is a dead end: every direction failed.",
      ],
      chapter: { label: "Stuck", tone: "red" },
      metrics: [
        { label: "Path length", value: "10" },
        { label: "Dead ends", value: "1", level: "warn" },
        { label: "Cells visited", value: "11" },
      ],
      lines: [4, 8, 9],
      scene: view([...ROUTE.slice(0, 10), [3, 1]], {
        head: [3, 1],
        note: "no neighbour is open: dead end",
      }),
    },
    {
      short: "Backtrack",
      title: "Undo the step and carry on",
      body: [
        "Backtrack: remove `(3,1)` from the path and mark it as a failed cell so we never enter it again. Control returns to `(2,1)`, which tries its next direction.",
        "Left is `(2,0)`: that is `G`. The goal is reached.",
      ],
      callout: {
        kind: "tip",
        text: "Failed cells stay marked as visited. Re-entering a known dead end would repeat the same failures.",
      },
      metrics: [
        { label: "Path length", value: "10" },
        { label: "Dead ends", value: "1", level: "warn" },
        { label: "Cells visited", value: "12" },
      ],
      lines: [7, 8],
      scene: view(ROUTE, { dead: [[3, 1]], head: GOAL, note: "back at (2,1), then left into G" }),
    },
    {
      short: "Found it",
      title: "A path, but a long one",
      body: [
        "Following the path numbers from `0` at `S` to `10` at `G` gives a route of ten moves. Depth-first backtracking found it, and it is valid.",
        "But the goal sits just two cells below the start. The search went the long way round because right came before down in the order.",
      ],
      chapter: { label: "Result", tone: "amber" },
      metrics: [
        { label: "Path length", value: "10", level: "warn" },
        { label: "Dead ends", value: "1", level: "warn" },
        { label: "Cells visited", value: "12" },
      ],
      scene: view(ROUTE, { dead: [[3, 1]], done: true, note: "DFS route: 10 moves" }),
    },
    {
      short: "Shortest?",
      title: "BFS finds the shortest",
      body: [
        "Breadth-first search explores in rings: every cell one move away, then two moves away, and so on, using a queue. The first time it reaches `G`, it has used the fewest moves.",
        "Here that is two moves, straight down: `S`, `(1,0)`, `G`. DFS stopped at the first path it stumbled on.",
      ],
      callout: {
        kind: "warn",
        text: "Backtracking gives you any valid path. If shortest matters, use BFS.",
      },
      metrics: [
        { label: "Path length", value: "2", level: "good" },
        { label: "Cells visited", value: "3" },
      ],
      scene: view([START, [1, 0], GOAL], { done: true, note: "BFS route: 2 moves" }),
    },
    {
      short: "Recap",
      title: "Which to use, and the cost",
      body: [
        "Both visit each open cell at most once, so time is `O(rows * cols)`. DFS keeps the current path in the recursion stack, `O(rows * cols)` in the worst case. BFS keeps a queue of frontier cells.",
        "Use backtracking when you only need a path, or must enumerate options. Use BFS when the shortest route matters.",
      ],
      chapter: { label: "Recap", tone: "ink" },
      metrics: [
        { label: "Path length", value: "10 vs 2", level: "warn" },
        { label: "Cells visited", value: "O(rc)", level: "good" },
      ],
      scene: scene(
        label("c1", 320, 70, "DFS + backtracking: any path, simple code", {
          size: 14,
          weight: 800,
        }),
        label("c2", 320, 110, "walk, mark, undo at dead ends", { size: 12, tone: "muted" }),
        label("c3", 320, 165, "BFS: shortest path in an unweighted grid", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("c4", 320, 205, "explore ring by ring with a queue", { size: 12, tone: "muted" }),
      ),
    },
  ],
};
