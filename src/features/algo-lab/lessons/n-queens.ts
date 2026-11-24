import { label, matrix, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

type Q = [number, number]; // [row, col]

const N = 4;

const attacks = (q: Q, r: number, c: number) =>
  q[1] === c || Math.abs(q[0] - r) === Math.abs(q[1] - c);

/**
 * The board. Queens are marked; cells in rows below the last queen that an earlier queen attacks
 * are greyed out; `dead` rows are outlined in warn tone because no safe cell is left.
 */
function view(
  queens: Q[],
  o: { dead?: number; mark?: Q; note?: string; done?: boolean; count?: string } = {},
) {
  const tones: Record<string, Tone> = {};
  const text: string[][] = Array.from({ length: N }, () => Array(N).fill(""));
  const next = queens.length;
  for (let r = next; r < N; r++)
    for (let c = 0; c < N; c++)
      if (queens.some((q) => attacks(q, r, c))) {
        tones[`${r},${c}`] = r === o.dead ? "warn" : "muted";
        text[r][c] = "x";
      }
  if (o.dead !== undefined) for (let c = 0; c < N; c++) tones[`${o.dead},${c}`] = "warn";
  for (const [r, c] of queens) {
    text[r][c] = "Q";
    tones[`${r},${c}`] = o.done ? "found" : "mark";
  }
  if (o.mark) {
    text[o.mark[0]][o.mark[1]] = "Q";
    tones[`${o.mark[0]},${o.mark[1]}`] = "active";
  }
  return scene(
    matrix(text, { x: 320, y: 125, w: 56, h: 46, tones }),
    o.note && label("note", 320, 265, o.note, { size: 13, weight: 800 }),
    o.count && label("cnt", 320, 292, o.count, { size: 12, tone: "muted" }),
  );
}

export const nQueens: AlgoLesson = {
  id: "n-queens",
  title: "N-Queens",
  summary: "Place four queens on a 4x4 board so none attack each other, backing up from dead ends.",
  minutes: 14,
  level: "advanced",
  goals: [
    "What makes two queens attack each other",
    "Why placing one queen per row shrinks the search",
    "How a dead end triggers backtracking",
    "How early pruning saves work",
  ],
  takeaways: [
    "Place one queen per row and only try columns that no earlier queen attacks by column or diagonal.",
    "When a row has no safe cell, undo the previous queen and move it to its next column.",
    "Pruning abandons a whole branch as soon as it is doomed, so far fewer than all 256 layouts are examined.",
  ],
  hud: [
    { label: "Queens on board", icon: "grid" },
    { label: "Backtracks", icon: "swap" },
    { label: "Queens placed", icon: "check" },
  ],
  pseudocode: [
    "solve(row):",
    "    if row == n:",
    "        return true",
    "    for col in 0 .. n-1:",
    "        if (row, col) shares a column or diagonal: skip",
    "        place a queen at (row, col)",
    "        if solve(row + 1): return true",
    "        remove the queen from (row, col)",
    "    return false",
  ],
  steps: [
    {
      short: "The puzzle",
      title: "Four queens, no attacks",
      body: [
        "A queen attacks along her row, her column and both diagonals. Put four queens on a 4x4 board so that no queen can capture another.",
        "Two queens never share a row, so exactly one queen goes in each row. That turns the search into: for each row, pick a column.",
      ],
      metrics: [
        { label: "Queens on board", value: "0" },
        { label: "Backtracks", value: "0" },
        { label: "Queens placed", value: "0" },
      ],
      scene: view([], { note: "one queen per row, four rows" }),
    },
    {
      short: "Row 0",
      title: "Place the first queen",
      body: [
        "In row 0 try column 0 first. The queen at `(0,0)` attacks its whole column and the long diagonal down to `(3,3)`.",
        "Those attacked cells are marked `x` in the rows below. Only unmarked cells are safe.",
      ],
      metrics: [
        { label: "Queens on board", value: "1" },
        { label: "Queens placed", value: "1" },
      ],
      lines: [4, 5, 6, 7],
      scene: view([[0, 0]], { note: "row 0: column 0" }),
    },
    {
      short: "Row 1",
      title: "Find a safe cell in row 1",
      body: [
        "In row 1, column 0 is attacked by the column and column 1 by the diagonal. Column 2 is free, so place the queen at `(1,2)`.",
        "The check for a candidate `(r, c)` is: same column, or `abs(r - r0) == abs(c - c0)` for any queen `(r0, c0)`.",
      ],
      callout: {
        kind: "tip",
        text: "Rows are handled by construction, so only columns and the two diagonals need a check.",
      },
      metrics: [
        { label: "Queens on board", value: "2" },
        { label: "Queens placed", value: "2" },
      ],
      lines: [4, 5, 6, 7],
      scene: view(
        [
          [0, 0],
          [1, 2],
        ],
        { note: "row 1: columns 0 and 1 attacked, column 2 is safe" },
      ),
    },
    {
      short: "Dead end",
      title: "Row 2 has no safe cell",
      body: [
        "Check row 2: column 0 shares a column with the first queen, column 1 and column 3 are on diagonals of the queen at `(1,2)`, and column 2 shares its column.",
        "Every cell is attacked. No queen can go in row 2, so this arrangement cannot be completed, however rows 3 might look.",
      ],
      chapter: { label: "Stuck", tone: "red" },
      metrics: [
        { label: "Queens on board", value: "2" },
        { label: "Queens placed", value: "2" },
      ],
      lines: [4, 5, 9],
      scene: view(
        [
          [0, 0],
          [1, 2],
        ],
        { dead: 2, note: "row 2: all four cells are attacked" },
      ),
    },
    {
      short: "Backtrack",
      title: "Undo the queen in row 1",
      body: [
        "Backtrack: remove the queen from `(1,2)` and move on to the next column in row 1, which is column 3.",
        "The earlier queen at `(0,0)` stays put. Only the most recent choice is revised first.",
      ],
      metrics: [
        { label: "Queens on board", value: "2" },
        { label: "Backtracks", value: "1", level: "warn" },
        { label: "Queens placed", value: "3" },
      ],
      lines: [8, 4],
      scene: view(
        [
          [0, 0],
          [1, 3],
        ],
        { note: "row 1 retried at column 3" },
      ),
    },
    {
      short: "Dead end 2",
      title: "Row 2 works, row 3 does not",
      body: [
        "Row 2 now has one safe cell, column 1, so place a queen at `(2,1)`. But in row 3, column 0 and column 1 share columns, column 2 is diagonal to `(2,1)`, and column 3 shares a column with `(1,3)`.",
        "Another dead end. Row 2 has no other column to try, and row 1 has no column after 3, so both are exhausted.",
      ],
      chapter: { label: "Stuck", tone: "red" },
      metrics: [
        { label: "Queens on board", value: "3" },
        { label: "Backtracks", value: "1", level: "warn" },
        { label: "Queens placed", value: "4" },
      ],
      lines: [5, 9],
      scene: view(
        [
          [0, 0],
          [1, 3],
          [2, 1],
        ],
        { dead: 3, note: "row 3: nothing is safe" },
      ),
    },
    {
      short: "Move row 0",
      title: "Backtrack all the way to row 0",
      body: [
        "Undo the queens in rows 2 and 1, then the whole subtree under `(0,0)` has failed: no solution starts with a queen in the corner.",
        "Move the first queen to column 1 and rebuild from there. Pruning let us discard that entire corner after checking only a few cells.",
      ],
      callout: {
        kind: "insight",
        text: "Failing early prunes everything below. Row 3 never needed a second look at any of those layouts.",
      },
      metrics: [
        { label: "Queens on board", value: "1" },
        { label: "Backtracks", value: "3", level: "warn" },
        { label: "Queens placed", value: "5" },
      ],
      lines: [8, 9],
      scene: view([[0, 1]], { note: "corner abandoned: first queen moves to column 1" }),
    },
    {
      short: "Solution",
      title: "A full board",
      body: [
        "From `(0,1)`, row 1 has only column 3 safe, row 2 only column 0, and row 3 only column 2. All four queens fit: `(0,1)`, `(1,3)`, `(2,0)`, `(3,2)`.",
        "Reaching row 4 with every queen placed means a solution. To list every solution, record it and keep backtracking.",
      ],
      chapter: { label: "Solved", tone: "green" },
      metrics: [
        { label: "Queens on board", value: "4", level: "good" },
        { label: "Backtracks", value: "3", level: "warn" },
        { label: "Queens placed", value: "8" },
      ],
      lines: [2, 3],
      scene: view(
        [
          [0, 1],
          [1, 3],
          [2, 0],
          [3, 2],
        ],
        { done: true, note: "solution: columns 1, 3, 0, 2" },
      ),
    },
    {
      short: "Pruning",
      title: "Why pruning matters",
      body: [
        "Trying every full layout, one column per row, would be `4^4 = 256` boards. Finding this solution took only eight queen placements and three backtracks.",
        "On an `n x n` board the saving is enormous. Brute force grows like `n^n`, but checking conflicts as you go cuts off hopeless branches early. Worst-case time is still exponential.",
      ],
      chapter: { label: "Recap", tone: "ink" },
      metrics: [
        { label: "Queens on board", value: "4", level: "good" },
        { label: "Backtracks", value: "3", level: "warn" },
        { label: "Queens placed", value: "8", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 70, "all full layouts:  4^4 = 256", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        label("r2", 320, 115, "queens placed for the first solution: 8", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("r3", 320, 175, "check column and diagonals before placing", {
          size: 13,
          tone: "muted",
        }),
        label("r4", 320, 205, "no safe cell: undo the last queen, try its next column", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
  ],
};
