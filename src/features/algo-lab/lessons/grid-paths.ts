import { edge, label, matrix, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const COLS = 5;
// ways(r, c) = ways(r - 1, c) + ways(r, c - 1); the first row and column are all 1.
const FULL = [
  [1, 1, 1, 1, 1],
  [1, 2, 3, 4, 5],
  [1, 3, 6, 10, 15],
  [1, 4, 10, 20, 35],
];
// Same grid with two blocked cells (value 0): (1, 3) and (2, 1).
const BLOCKED = [
  [1, 1, 1, 1, 1],
  [1, 2, 3, 0, 1],
  [1, 0, 3, 3, 4],
  [1, 1, 4, 7, 11],
];
const OBSTACLES = ["1,3", "2,1"];

type Filled = (r: number, c: number) => boolean;
const border: Filled = (r, c) => r === 0 || c === 0;
const upTo =
  (k: number): Filled =>
  (r, c) =>
    r * COLS + c < k;

/** The grid: filled cells show their value, the rest are empty slots; `special` overrides tones. */
function grid(full: number[][], filled: Filled, special: Record<string, Tone> = {}) {
  const tones: Record<string, Tone> = {};
  const rows = full.map((rw, r) =>
    rw.map((v, c) => {
      const k = `${r},${c}`;
      tones[k] = special[k] ?? (filled(r, c) ? "done" : "ghost");
      return filled(r, c) || special[k] ? v : "";
    }),
  );
  return matrix(rows, { x: 320, y: 140, w: 56, h: 44, tones });
}

const id = (r: number, c: number) => `m${r}-${c}`;
const from = (r: number, c: number, to: [number, number], text: string) =>
  edge(`e${r}-${c}`, id(r, c), id(...to), { tone: "active", label: text });

export const gridPaths: AlgoLesson = {
  id: "grid-paths",
  title: "Grid Paths",
  summary: "Count the routes across a grid moving only right or down, one cell at a time.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "Turning a counting problem into a recurrence on a 2-D table",
    "Why each cell is the sum of the cell above and the cell to its left",
    "Filling a matrix in row-major order",
    "How obstacles change the table without changing the rule",
  ],
  takeaways: [
    "Every path to a cell arrives from above or from the left, so ways(cell) is the sum of those two cells.",
    "Fill the grid row by row: the two cells a value needs are always done before it.",
    "A blocked cell simply holds 0, and the same rule carries the zeros forward.",
  ],
  hud: [
    { label: "Cell value", icon: "sigma" },
    { label: "Cells filled", icon: "grid" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "countPaths(grid):",
    "    for each cell in the first row and first column:",
    "        ways = 1, or 0 once a wall appears",
    "    for r in 1 .. rows - 1:",
    "        for c in 1 .. cols - 1:",
    "            if grid[r][c] is a wall:",
    "                ways[r][c] = 0",
    "            else:",
    "                ways[r][c] = ways[r-1][c] + ways[r][c-1]",
    "    return ways[rows-1][cols-1]",
  ],
  steps: [
    {
      short: "The robot",
      title: "Right or down, nothing else",
      body: [
        "A robot starts at the top-left of a 4 by 5 grid and must reach the bottom-right. Each move goes one cell right or one cell down.",
        "How many different routes are there? Listing them is hopeless as the grid grows, so we count them cell by cell.",
      ],
      metrics: [{ label: "Cells filled", value: "0 / 20" }],
      scene: scene(
        grid(FULL, () => false),
        ptr("s", "m0-0", "start", { side: "left" }),
        ptr("g", "m3-4", "goal", { side: "right" }),
        label("cap", 320, 285, "moves: right or down", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Edges",
      title: "The border has one route",
      body: [
        "Let `ways(r, c)` be the number of routes from the start to cell `(r, c)`. Along the top row the robot can only have moved right, so there is exactly 1 route. The same holds for the left column.",
        "These are the base cases. Everything else will be built from them.",
      ],
      metrics: [{ label: "Cells filled", value: "8 / 20" }],
      lines: [2, 3],
      scene: scene(
        grid(FULL, border),
        label("cap", 320, 285, "first row and first column: 1 way each", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Cell (1,1)",
      title: "Two ways in, so add them",
      body: [
        "Any route into `(1, 1)` made its last move either down from `(0, 1)` or right from `(1, 0)`. Those groups of routes do not overlap, so we add them.",
        "`ways(1, 1) = 1 + 1 = 2`: right-then-down and down-then-right.",
      ],
      callout: {
        kind: "insight",
        text: "The last move splits the routes into two disjoint groups, and counting each group is a smaller copy of the same problem.",
      },
      metrics: [
        { label: "Cell value", value: "2" },
        { label: "Cells filled", value: "9 / 20" },
      ],
      lines: [4, 5, 9],
      scene: scene(
        grid(FULL, border, { "1,1": "active", "0,1": "mark", "1,0": "mark" }),
        from(0, 1, [1, 1], "down"),
        from(1, 0, [1, 1], "right"),
        label("cap", 320, 285, "ways(1,1) = above + left = 1 + 1 = 2", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Cell (1,2)",
      title: "The same rule, one step right",
      body: [
        "For `(1, 2)` the cell above holds 1 and the cell on the left holds the 2 we just computed. So `ways(1, 2) = 1 + 2 = 3`.",
        "Reading the cell to the left is what makes row-major order necessary: it must be finished first.",
      ],
      metrics: [
        { label: "Cell value", value: "3" },
        { label: "Cells filled", value: "10 / 20" },
      ],
      lines: [4, 5, 9],
      scene: scene(
        grid(FULL, (r, c) => border(r, c) || (r === 1 && c === 1), {
          "1,2": "active",
          "0,2": "mark",
          "1,1": "mark",
        }),
        from(0, 2, [1, 2], "down"),
        from(1, 1, [1, 2], "right"),
        label("cap", 320, 285, "ways(1,2) = 1 + 2 = 3", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Cell (2,2)",
      title: "Both neighbours are real numbers now",
      body: [
        "With rows 0 and 1 complete, `(2, 2)` has `3` above it and `3` to its left: `ways(2, 2) = 3 + 3 = 6`.",
        "Each number is the count of all routes to that cell, no matter how winding. Nothing is ever recounted, which is the whole saving over brute force.",
      ],
      metrics: [
        { label: "Cell value", value: "6" },
        { label: "Cells filled", value: "13 / 20" },
      ],
      lines: [4, 5, 9],
      scene: scene(
        grid(FULL, upTo(12), { "2,2": "active", "1,2": "mark", "2,1": "mark" }),
        from(1, 2, [2, 2], "down"),
        from(2, 1, [2, 2], "right"),
        label("cap", 320, 285, "ways(2,2) = 3 + 3 = 6", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Last cell",
      title: "The goal cell",
      body: [
        "Continuing the same way fills the rest. The goal `(3, 4)` has `15` above and `20` to its left, so the answer is `15 + 20 = 35`.",
        "The table has 20 cells and each costs one addition: time `O(rows * cols)`, instead of walking every route.",
      ],
      callout: {
        kind: "tip",
        text: "35 is also the number of ways to choose which 3 of the 7 moves go down: C(7, 3). The DP computes that without factorials.",
      },
      metrics: [
        { label: "Cell value", value: "35", level: "good" },
        { label: "Cells filled", value: "20 / 20", level: "good" },
        { label: "Time", value: "O(r·c)", level: "good" },
      ],
      lines: [9, 10],
      scene: scene(
        grid(FULL, upTo(19), { "3,4": "found", "2,4": "mark", "3,3": "mark" }),
        from(2, 4, [3, 4], "down"),
        from(3, 3, [3, 4], "right"),
        label("cap", 320, 285, "ways(3,4) = 15 + 20 = 35", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Obstacles",
      title: "Blocked cells",
      body: [
        "Now two cells are walls: `(1, 3)` and `(2, 1)`. A route cannot enter a wall, so a wall cell has 0 routes through it.",
        "The recurrence does not change. A cell that is not a wall still adds above and left; a wall is simply set to 0, and the border stops being all 1s only once a wall appears on it.",
      ],
      callout: {
        kind: "warn",
        text: "If a wall sits on the first row or column, every border cell after it is 0, not 1. Fill the border with the same rule, not blindly.",
      },
      metrics: [{ label: "Cells filled", value: "8 / 20" }],
      lines: [2, 3, 6, 7],
      scene: scene(
        grid(BLOCKED, border, Object.fromEntries(OBSTACLES.map((k) => [k, "warn" as Tone]))),
        label("cap", 320, 285, "wall cell = 0 ways; every other cell: above + left", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "Blocked cell",
      title: "A zero carries forward",
      body: [
        "Take `(2, 3)`. The cell above, `(1, 3)`, is a wall holding 0, and the cell to the left holds 3. So `ways(2, 3) = 0 + 3 = 3`.",
        "The zero does the right thing without any special case: no routes arrive from a wall.",
      ],
      metrics: [
        { label: "Cell value", value: "3" },
        { label: "Cells filled", value: "14 / 20" },
      ],
      lines: [6, 7, 9],
      scene: scene(
        grid(
          BLOCKED,
          upTo(13),
          Object.fromEntries([
            ...OBSTACLES.map((k) => [k, "warn" as Tone]),
            ["2,3", "active" as Tone],
            ["2,2", "mark" as Tone],
          ]),
        ),
        from(1, 3, [2, 3], "down"),
        from(2, 2, [2, 3], "right"),
        label("cap", 320, 285, "ways(2,3) = 0 + 3 = 3", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Recap",
      title: "With walls, 11 routes",
      body: [
        "Finishing the table gives `11` routes to the goal instead of 35. The whole fill is still one pass over the grid: `O(rows * cols)` time.",
        "Because row `r` only reads row `r - 1` and itself, you can keep a single row and update it in place, cutting memory to `O(cols)`.",
      ],
      metrics: [
        { label: "Cell value", value: "11", level: "good" },
        { label: "Cells filled", value: "20 / 20", level: "good" },
        { label: "Time", value: "O(r·c)", level: "good" },
      ],
      lines: [10],
      scene: scene(
        grid(
          BLOCKED,
          () => true,
          Object.fromEntries([
            ...OBSTACLES.map((k) => [k, "warn" as Tone]),
            ["3,4", "found" as Tone],
          ]),
        ),
        label("cap", 320, 285, "answer: 11 routes", { size: 14, weight: 800, tone: "good" }),
      ),
    },
  ],
};
