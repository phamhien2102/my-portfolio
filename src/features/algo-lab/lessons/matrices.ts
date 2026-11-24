import { cell, label, matrix, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const G = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
];
const FLAT = G.flat();

/** A square grid whose cells are keyed by value, so a transpose or rotation slides the numbers. */
function moving(g: number[][], tones: Record<number, Tone> = {}, y = 140): Item[] {
  const w = 44;
  const h = 38;
  const gap = 6;
  const left = 320 - (g[0].length * (w + gap) - gap) / 2 + w / 2;
  return g.flatMap((r, ri) =>
    r.map((v, ci) =>
      cell(`v${v}`, left + ci * (w + gap), y + (ri - 1) * (h + gap), v, { w, h, tone: tones[v] }),
    ),
  );
}

export const matrices: AlgoLesson = {
  id: "matrices",
  title: "2D Arrays",
  summary:
    "Grids of rows and columns: how they sit in memory, how to walk them and how to transform them.",
  minutes: 10,
  level: "beginner",
  goals: [
    "How rows, columns and grid[r][c] indexing fit together",
    "How a grid is laid out in memory (row-major)",
    "Why walking by row is faster than by column",
    "Neighbour offsets and bounds checks",
    "Transpose and rotation as a worked example",
  ],
  takeaways: [
    "A cell is addressed by row then column, and in row-major memory its flat index is r * cols + c.",
    "Walk row by row to stay in memory order; column walks jump by a whole row each step.",
    "Neighbour loops use a small table of (dr, dc) offsets, and every step needs a bounds check.",
  ],
  hud: [
    { label: "Cell", icon: "grid" },
    { label: "Flat index", icon: "memory" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "flatIndex(r, c, cols):",
    "    return r * cols + c",
    "walkByRow(grid):",
    "    for r in 0 .. rows - 1:",
    "        for c in 0 .. cols - 1: visit grid[r][c]",
    "neighbours(grid, r, c):",
    "    for (dr, dc) in [(-1,0), (1,0), (0,-1), (0,1)]:",
    "        nr = r + dr; nc = c + dc",
    "        if 0 <= nr < rows and 0 <= nc < cols:",
    "            visit grid[nr][nc]",
    "transpose(grid):",
    "    for r in 0 .. n - 1:",
    "        for c in r + 1 .. n - 1:",
    "            swap grid[r][c], grid[c][r]",
  ],
  steps: [
    {
      short: "A grid",
      title: "Rows and columns",
      body: [
        "A 2D array is a table: here 3 rows and 4 columns, holding the numbers `1` to `12`. Think of it as an array whose every element is itself an array, one per row.",
        "Grids model boards, images, maps and anything laid out in a plane.",
      ],
      metrics: [{ label: "Cost", value: "3 × 4 = 12 cells" }],
      scene: scene(
        matrix(G, { y: 130 }),
        label("t", 320, 40, "3 rows × 4 columns", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Index",
      title: "Row first, then column",
      body: [
        "`grid[1][2]` means row `1`, column `2`, counting from zero, so it is the value `7`. The first index picks a row; the second picks a cell inside it.",
        "Mixing the order up is the most common grid bug; a good habit is to name them `r` and `c` and never `x` and `y`.",
      ],
      callout: {
        kind: "warn",
        text: "In `grid[r][c]`, `r` is the vertical position. It is not x then y.",
      },
      metrics: [{ label: "Cell", value: "[1][2] = 7", level: "good" }],
      lines: [2],
      scene: scene(
        matrix(G, { y: 130, tones: { "1,2": "found" } }),
        label("t", 320, 40, "grid[1][2] = 7", { size: 14, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Memory",
      title: "Memory is one long line",
      body: [
        "RAM has no rows. A grid is stored row after row in one flat run, called row-major order. Row `0` comes first, then row `1`, then row `2`.",
        "So the cell `[r][c]` lives at flat index `r * cols + c`. For `[1][2]` that is `1 * 4 + 2 = 6`, the seventh slot, holding `7`.",
      ],
      callout: {
        kind: "insight",
        text: "Many images and game boards store a grid as a flat array and compute `r * cols + c` by hand.",
      },
      metrics: [
        { label: "Cell", value: "[1][2]" },
        { label: "Flat index", value: "6", level: "good" },
      ],
      lines: [1, 2],
      scene: scene(
        matrix(G, { y: 80, tones: { "1,2": "found" } }),
        row(FLAT, {
          id: "f",
          y: 230,
          w: 38,
          index: true,
          tones: (i) => (i === 6 ? "found" : i >= 4 && i < 8 ? "active" : undefined),
        }),
        label("t", 320, 285, "flat index = 1 × 4 + 2 = 6", { size: 12, weight: 800 }),
      ),
    },
    {
      short: "By row",
      title: "Walk by row",
      body: [
        "The usual nested loop runs `r` on the outside and `c` on the inside. The visits go `1, 2, 3, 4, 5, ...`, which is exactly the memory order.",
        "Reading neighbouring memory is fast because the processor loads whole chunks at a time and the next cells are already there.",
      ],
      metrics: [
        { label: "Cell", value: "[1][1]" },
        { label: "Cost", value: "O(rows · cols)", level: "good" },
      ],
      lines: [3, 4, 5],
      scene: scene(
        matrix(G, {
          y: 130,
          tones: {
            "0,0": "done",
            "0,1": "done",
            "0,2": "done",
            "0,3": "done",
            "1,0": "done",
            "1,1": "active",
          },
        }),
        label("t", 320, 40, "row by row: 1, 2, 3, 4, 5, 6 ...", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "By column",
      title: "Walk by column",
      body: [
        "Swapping the loops visits `1, 5, 9, 2, 6, 10, ...`. Each step jumps a whole row ahead in memory, `4` slots here.",
        "The answer is the same and the cost is still `O(rows · cols)`, but on a big grid the jumping is noticeably slower. Prefer row order unless the problem needs columns.",
      ],
      callout: {
        kind: "tip",
        text: "Same Big-O, different speed: access pattern matters as much as the count of steps.",
      },
      metrics: [
        { label: "Cell", value: "[1][1]" },
        { label: "Flat index", value: "stride 4", level: "warn" },
      ],
      lines: [3, 4, 5],
      scene: scene(
        matrix(G, {
          y: 130,
          tones: { "0,0": "done", "1,0": "done", "2,0": "done", "0,1": "done", "1,1": "active" },
        }),
        label("t", 320, 40, "column by column: 1, 5, 9, 2, 6 ...", {
          size: 13,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "Neighbours",
      title: "Four neighbours, four offsets",
      body: [
        "From `[1][1]` (value `6`) the neighbours are up, down, left and right. Store them as offset pairs: `(-1,0)`, `(1,0)`, `(0,-1)`, `(0,1)`, then loop over them and add to `r` and `c`.",
        "Adding four more pairs such as `(-1,-1)` gives the diagonals. One loop replaces a pile of copy-pasted `if`s.",
      ],
      metrics: [{ label: "Cell", value: "[1][1] = 6" }],
      lines: [6, 7, 8],
      scene: scene(
        matrix(G, {
          y: 130,
          tones: { "1,1": "active", "0,1": "mark", "2,1": "mark", "1,0": "mark", "1,2": "mark" },
        }),
        label("t", 320, 40, "dirs = [(-1,0), (1,0), (0,-1), (0,1)]", { size: 12, weight: 800 }),
      ),
    },
    {
      short: "Bounds",
      title: "Check before you step",
      body: [
        "From the corner `[0][0]`, the offsets `(-1,0)` and `(0,-1)` land on row `-1` or column `-1`, which do not exist. Reading them is an error or, in some languages, silent garbage.",
        "Before touching a neighbour, test `0 <= nr < rows` and `0 <= nc < cols`. Only the two in-range neighbours, `2` and `5`, are used.",
      ],
      callout: {
        kind: "warn",
        text: "Forgetting bounds checks is the number one source of grid crashes.",
      },
      metrics: [{ label: "Cell", value: "[0][0] = 1", level: "warn" }],
      lines: [9, 10],
      scene: scene(
        matrix(G, { y: 130, tones: { "0,0": "active", "0,1": "mark", "1,0": "mark" } }),
        ptr("up", "m0-0", "row -1: out", { side: "above", tone: "warn" }),
        label("t", 320, 215, "row −1 and column −1 do not exist", {
          size: 12,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "Transpose",
      title: "Transpose: swap across the diagonal",
      body: [
        "On a square grid, transposing swaps `grid[r][c]` with `grid[c][r]`. The diagonal cells stay put; every other pair trades places, such as `2` and `4`.",
        "Loop only over cells with `c > r` so each pair is swapped once, not twice (which would undo itself).",
      ],
      callout: { kind: "tip", text: "Swap each pair once: iterate the upper triangle only." },
      metrics: [
        { label: "Cell", value: "[0][1] ↔ [1][0]" },
        { label: "Cost", value: "O(n²)", level: "good" },
      ],
      lines: [11, 12, 13, 14],
      scene: scene(
        moving(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
          { 2: "active", 4: "active", 1: "done", 5: "done", 9: "done" },
        ),
        label("t", 320, 40, "swap [0][1] with [1][0]", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Rotate",
      title: "Rotation = transpose + mirror",
      body: [
        "Transposing the whole grid gives `1 4 7 / 2 5 8 / 3 6 9`. Now reverse each row and you get `7 4 1 / 8 5 2 / 9 6 3`: the original turned 90 degrees clockwise, with no extra grid needed.",
        "Both passes touch each cell a constant number of times, so the rotation runs in `O(n²)` time and `O(1)` extra space.",
      ],
      callout: {
        kind: "insight",
        text: "Hard moves often split into two easy ones: transpose, then reverse every row.",
      },
      metrics: [
        { label: "Cell", value: "rotated 90°", level: "good" },
        { label: "Cost", value: "O(n²) time, O(1) space", level: "good" },
      ],
      lines: [11, 12, 13, 14],
      scene: scene(
        moving(
          [
            [7, 4, 1],
            [8, 5, 2],
            [9, 6, 3],
          ],
          { 1: "found", 4: "found", 7: "found" },
        ),
        label("t", 320, 40, "transpose, then reverse each row", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
