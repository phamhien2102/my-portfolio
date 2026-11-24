import { edge, label, matrix, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const X = "CART"; // rows
const Y = "CRAFT"; // columns
const COLS = Y.length + 1;
// FULL[i][j] = length of the longest common subsequence of the first i letters of X and first j of Y.
const FULL = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1],
  [0, 1, 1, 2, 2, 2],
  [0, 1, 2, 2, 2, 2],
  [0, 1, 2, 2, 2, 3],
];

const colX = (c: number) => 215 + 50 * c;
const rowY = (r: number) => 62 + 44 * r;

type Filled = (r: number, c: number) => boolean;
const border: Filled = (r, c) => r === 0 || c === 0;
/** Border plus the first k interior cells in row-major order. */
const upTo =
  (k: number): Filled =>
  (r, c) =>
    border(r, c) || (r - 1) * (COLS - 1) + (c - 1) < k;

/** The table with the letters of CART down the side and CRAFT along the top. */
function table(filled: Filled, special: Record<string, Tone> = {}) {
  const tones: Record<string, Tone> = {};
  const rows = FULL.map((rw, r) =>
    rw.map((v, c) => {
      const k = `${r},${c}`;
      tones[k] = special[k] ?? (filled(r, c) ? "done" : "ghost");
      return filled(r, c) || special[k] ? v : "";
    }),
  );
  return [
    matrix(rows, { x: 340, y: 150, tones }),
    ...Array.from({ length: COLS }, (_, c) =>
      label(`hc${c}`, colX(c), 24, c === 0 ? "∅" : Y[c - 1], {
        size: 14,
        weight: 800,
        tone: "muted",
      }),
    ),
    ...FULL.map((_, r) =>
      label(`hr${r}`, 190, rowY(r) + 5, r === 0 ? "∅" : X[r - 1], {
        anchor: "end",
        size: 14,
        weight: 800,
        tone: "muted",
      }),
    ),
  ];
}

const id = (r: number, c: number) => `m${r}-${c}`;
const link = (name: string, a: [number, number], b: [number, number], text?: string) =>
  edge(name, id(...a), id(...b), { tone: "active", label: text });
const trail = (name: string, a: [number, number], b: [number, number]) =>
  edge(name, id(...a), id(...b), { tone: "found" });

// The traceback from the last cell: each step is one move through the table.
const PATH: [number, number][] = [
  [4, 5],
  [3, 4],
  [2, 4],
  [2, 3],
  [1, 2],
  [1, 1],
  [0, 0],
];
const MATCHES = ["4,5", "2,3", "1,1"];
const pathTones = (n: number) =>
  Object.fromEntries(
    PATH.slice(0, n).map(([r, c]) => [
      `${r},${c}`,
      (MATCHES.includes(`${r},${c}`) ? "found" : "mark") as Tone,
    ]),
  );

export const sequences: AlgoLesson = {
  id: "sequences",
  title: "Sequences",
  summary:
    "Find the longest common subsequence of two strings with a 2-D table and trace the answer back.",
  minutes: 14,
  level: "advanced",
  goals: [
    "What a common subsequence is, and how it differs from a substring",
    "Defining a table over prefixes of both strings",
    "The match-or-max recurrence for each cell",
    "Tracing back through the table to recover the letters",
  ],
  takeaways: [
    "If the last letters match, the answer is the diagonal cell plus one; otherwise it is the larger of the cells above and to the left.",
    "The table has (m + 1) by (n + 1) cells and each costs constant time, so the whole thing is O(m·n).",
    "Walking back from the corner, diagonal moves on matches spell out one longest common subsequence.",
  ],
  hud: [
    { label: "Cell value", icon: "sigma" },
    { label: "Cells filled", icon: "grid" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "lcs(X, Y):",
    "    dp[0][j] = 0 and dp[i][0] = 0",
    "    for i in 1 .. m:",
    "        for j in 1 .. n:",
    "            if X[i] == Y[j]:",
    "                dp[i][j] = dp[i-1][j-1] + 1",
    "            else:",
    "                dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
    "    return dp[m][n]",
    "    trace back: diagonal on match, else step to larger cell",
  ],
  steps: [
    {
      short: "The task",
      title: "Two words, one shared thread",
      body: [
        "A subsequence picks letters in order, skipping freely. `CAT` is a subsequence of `CART` (skip R) and of `CRAFT` (skip R and F).",
        "The longest common subsequence (LCS) of `CART` and `CRAFT` is the longest sequence that is a subsequence of both. Unlike a substring, the letters need not touch.",
      ],
      metrics: [{ label: "Cells filled", value: "0 / 30" }],
      scene: scene(
        row([...X], { id: "a", y: 90, w: 52 }),
        row([...Y], { id: "b", y: 180, w: 52 }),
        label("la", 40, 95, "X", { size: 13, tone: "muted", weight: 800 }),
        label("lb", 40, 185, "Y", { size: 13, tone: "muted", weight: 800 }),
        label("q", 320, 245, "longest sequence found in both, in order", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "The table",
      title: "Prefixes of both strings",
      body: [
        "Let `dp[i][j]` be the LCS length of the first `i` letters of `CART` and the first `j` letters of `CRAFT`. The empty prefix `∅` shares nothing with anything, so row 0 and column 0 are all 0.",
        "The final answer is the bottom-right cell, `dp[4][5]`.",
      ],
      metrics: [{ label: "Cells filled", value: "10 / 30" }],
      lines: [2],
      scene: scene(
        table(border),
        label("cap", 340, 285, "dp[i][j]: LCS of X[:i] and Y[:j]", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Match",
      title: "Equal letters extend the diagonal",
      body: [
        "Cell `(1, 1)` compares `C` and `C`. They match, so that letter can end a common subsequence, built on the best answer for both strings without their last letters: the diagonal `dp[0][0] = 0`.",
        "So `dp[1][1] = 0 + 1 = 1`.",
      ],
      callout: {
        kind: "insight",
        text: "A match is always safe to take: using the shared last letter can never be worse than skipping it.",
      },
      metrics: [
        { label: "Cell value", value: "1" },
        { label: "Cells filled", value: "11 / 30" },
      ],
      lines: [5, 6],
      scene: scene(
        table(upTo(0), { "1,1": "active", "0,0": "mark" }),
        link("d", [0, 0], [1, 1], "+1"),
        label("cap", 340, 285, "C = C → dp[1][1] = dp[0][0] + 1 = 1", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Mismatch",
      title: "Different letters: keep the better side",
      body: [
        "Cell `(2, 1)` compares `A` with `C`. They differ, so at least one of them is not in the answer. Drop the `A`: look up at `dp[1][1] = 1`. Drop the `C`: look left at `dp[2][0] = 0`.",
        "Take the larger, `max(1, 0) = 1`.",
      ],
      metrics: [
        { label: "Cell value", value: "1" },
        { label: "Cells filled", value: "16 / 30" },
      ],
      lines: [7, 8],
      scene: scene(
        table(upTo(5), { "2,1": "active", "1,1": "mark", "2,0": "mark" }),
        link("u", [1, 1], [2, 1], "drop A"),
        link("l", [2, 0], [2, 1], "drop C"),
        label("cap", 340, 285, "A ≠ C → dp[2][1] = max(1, 0) = 1", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Match again",
      title: "A match later in the table",
      body: [
        "Cell `(2, 3)` compares `A` with `A`. Another match, so we go diagonal to `dp[1][2] = 1` and add one: `dp[2][3] = 2`.",
        "That 2 stands for the common subsequence `CA`: the `C` was matched earlier, and now the `A`.",
      ],
      metrics: [
        { label: "Cell value", value: "2" },
        { label: "Cells filled", value: "18 / 30" },
      ],
      lines: [5, 6],
      scene: scene(
        table(upTo(7), { "2,3": "active", "1,2": "mark" }),
        link("d", [1, 2], [2, 3], "+1"),
        label("cap", 340, 285, "A = A → dp[2][3] = dp[1][2] + 1 = 2", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Last cell",
      title: "The corner gives the length",
      body: [
        "Filling the remaining cells with the same two rules leaves the corner. It compares `T` with `T`: a match, so `dp[4][5] = dp[3][4] + 1 = 2 + 1 = 3`.",
        "The LCS length is 3. The table has 30 cells and each took one comparison: `O(m * n)` time.",
      ],
      metrics: [
        { label: "Cell value", value: "3", level: "good" },
        { label: "Cells filled", value: "30 / 30", level: "good" },
        { label: "Time", value: "O(m·n)", level: "good" },
      ],
      lines: [5, 6, 9],
      scene: scene(
        table(upTo(19), { "4,5": "found", "3,4": "mark" }),
        link("d", [3, 4], [4, 5], "+1"),
        label("cap", 340, 285, "T = T → dp[4][5] = dp[3][4] + 1 = 3", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Trace back 1",
      title: "Retrace the decisions",
      body: [
        "To get the letters, start at the corner and undo each decision. At `(4, 5)` the letters match, so `T` is in the answer; move diagonally to `(3, 4)`.",
        "At `(3, 4)` the letters `R` and `F` differ, so move to whichever neighbour holds the same value. Up and left tie at 2; going up works, giving `(2, 4)`, and there left reaches `(2, 3)`.",
      ],
      metrics: [{ label: "Cell value", value: "3", level: "good" }],
      lines: [10],
      scene: scene(
        table(() => true, pathTones(4)),
        trail("t0", PATH[0], PATH[1]),
        trail("t1", PATH[1], PATH[2]),
        trail("t2", PATH[2], PATH[3]),
        label("cap", 340, 285, "match → diagonal; mismatch → toward the equal neighbour", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Trace back 2",
      title: "Read the matches backwards",
      body: [
        "`(2, 3)` is a match on `A`, so go diagonal to `(1, 2)`. There `C` and `R` differ and the left cell has the same value, so go left to `(1, 1)`: a match on `C`, then diagonal to the corner.",
        "The diagonal moves picked `T`, `A`, `C`. Reversed, the answer is `CAT`.",
      ],
      callout: {
        kind: "tip",
        text: "When up and left tie, either choice is valid. Different choices can produce different, equally long answers (here `CRT` is another).",
      },
      metrics: [{ label: "Cell value", value: "3", level: "good" }],
      lines: [10],
      scene: scene(
        table(() => true, pathTones(7)),
        ...PATH.slice(0, -1).map((p, i) => trail(`t${i}`, p, PATH[i + 1])),
        label("cap", 340, 285, "matches T, A, C → reversed: CAT", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "Recap",
      title: "Rule, cost, space",
      body: [
        "If `X[i] == Y[j]`: `dp[i][j] = dp[i-1][j-1] + 1`. Otherwise `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`. Time is `O(m * n)`.",
        "If only the length is needed, keep two rows, because a row reads just itself and the one above: space `O(min(m, n))`. The full table is needed only to trace the letters back.",
      ],
      metrics: [
        { label: "Cell value", value: "3", level: "good" },
        { label: "Time", value: "O(m·n)", level: "good" },
      ],
      lines: [5, 6, 7, 8],
      scene: scene(
        label("a", 340, 70, "match:  dp[i][j] = dp[i-1][j-1] + 1", { size: 14, weight: 800 }),
        label("b", 340, 120, "else:  dp[i][j] = max( dp[i-1][j], dp[i][j-1] )", {
          size: 14,
          weight: 800,
        }),
        label("c", 340, 180, "time O(m·n); two rows suffice for the length", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
  ],
};
