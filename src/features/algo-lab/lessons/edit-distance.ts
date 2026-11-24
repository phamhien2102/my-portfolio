import { cell, edge, label, matrix, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const X = "HORSE"; // rows: the word we start from
const Y = "ROS"; // columns: the word we want
const COLS = Y.length + 1;
// FULL[i][j] = fewest edits that turn the first i letters of X into the first j letters of Y.
const FULL = [
  [0, 1, 2, 3],
  [1, 1, 2, 3],
  [2, 2, 1, 2],
  [3, 2, 2, 2],
  [4, 3, 3, 2],
  [5, 4, 4, 3],
];

const colX = (c: number) => 245 + 50 * c;
const rowY = (r: number) => 60 + 44 * r;

type Filled = (r: number, c: number) => boolean;
const border: Filled = (r, c) => r === 0 || c === 0;
/** Border plus the first k interior cells in row-major order. */
const upTo =
  (k: number): Filled =>
  (r, c) =>
    border(r, c) || (r - 1) * (COLS - 1) + (c - 1) < k;

/** The table with HORSE down the side and ROS along the top. */
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
    matrix(rows, { x: 320, y: 170, tones }),
    ...Array.from({ length: COLS }, (_, c) =>
      label(`hc${c}`, colX(c), 20, c === 0 ? "∅" : Y[c - 1], {
        size: 14,
        weight: 800,
        tone: "muted",
      }),
    ),
    ...FULL.map((_, r) =>
      label(`hr${r}`, 215, rowY(r) + 5, r === 0 ? "∅" : X[r - 1], {
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

// The traceback: up = delete, left = insert, diagonal = replace (or keep when the letters match).
const PATH: [number, number][] = [
  [5, 3],
  [4, 3],
  [3, 2],
  [2, 2],
  [1, 1],
  [0, 0],
];

const CAP_Y = 335;

export const editDistance: AlgoLesson = {
  id: "edit-distance",
  title: "Edit Distance",
  summary: "Count the fewest inserts, deletes and replaces that turn one word into another.",
  minutes: 14,
  level: "advanced",
  goals: [
    "What the three edit operations are",
    "Defining a table over prefixes of both words",
    "How each cell is one more than the cheapest of three neighbours",
    "Reading the actual edits out of the table",
  ],
  takeaways: [
    "Each cell is 1 plus the minimum of the cells up, left and diagonal; if the letters match, copy the diagonal for free.",
    "Up means delete, left means insert, and diagonal means replace or keep.",
    "The table costs O(m·n) time, and walking back from the corner lists one cheapest set of edits.",
  ],
  hud: [
    { label: "Cell value", icon: "sigma" },
    { label: "Cells filled", icon: "grid" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "editDistance(a, b):",
    "    dp[i][0] = i and dp[0][j] = j",
    "    for i in 1 .. m:",
    "        for j in 1 .. n:",
    "            if a[i] == b[j]:",
    "                dp[i][j] = dp[i-1][j-1]",
    "            else:",
    "                dp[i][j] = 1 + min(diag, up, left)",
    "    return dp[m][n]",
    "    trace back from the corner to list the edits",
  ],
  steps: [
    {
      short: "The task",
      title: "How far apart are two words?",
      body: [
        "Edit distance counts the fewest single-letter changes that turn one word into another. The allowed changes are insert a letter, delete a letter, or replace a letter.",
        "`CAT` to `CUT` takes one edit: replace `A` with `U`. We want the same answer for any pair, such as `HORSE` to `ROS`, without trying every sequence of edits.",
      ],
      metrics: [{ label: "Cell value", value: "1" }],
      scene: scene(
        row([..."CAT"], { id: "a", y: 90, tones: { 1: "warn" } }),
        row([..."CUT"], { id: "b", y: 180, tones: { 1: "found" } }),
        label("cap", 320, 245, "replace A with U: 1 edit", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Three moves",
      title: "A cell looks at three neighbours",
      body: [
        "Let `dp[i][j]` be the fewest edits to turn the first `i` letters of the start word into the first `j` letters of the goal. To reach it, the last edit came from one of three cells.",
        "From the diagonal `dp[i-1][j-1]` by replacing a letter; from above `dp[i-1][j]` by deleting one; from the left `dp[i][j-1]` by inserting one. Each costs 1.",
      ],
      callout: {
        kind: "insight",
        text: "Take the cheapest of the three. If the two letters are already equal, the diagonal move costs 0 instead of 1.",
      },
      metrics: [{ label: "Cell value", value: "1 + min" }],
      lines: [8],
      scene: scene(
        cell("d", 230, 100, "i-1, j-1", { w: 100 }),
        cell("u", 410, 100, "i-1, j", { w: 100 }),
        cell("l", 230, 190, "i, j-1", { w: 100 }),
        cell("c", 410, 190, "i, j", { w: 100, tone: "active" }),
        edge("e1", "d", "c", { label: "replace +1" }),
        edge("e2", "u", "c", { label: "delete +1" }),
        edge("e3", "l", "c", { label: "insert +1" }),
      ),
    },
    {
      short: "The table",
      title: "HORSE to ROS",
      body: [
        "Now the real example. Rows are prefixes of `HORSE`, columns are prefixes of `ROS`. The first column says turning `i` letters into nothing takes `i` deletions; the first row says building `j` letters from nothing takes `j` insertions.",
        "The answer will be the bottom-right cell.",
      ],
      metrics: [{ label: "Cells filled", value: "9 / 24" }],
      lines: [2],
      scene: scene(
        table(border),
        label("cap", 320, CAP_Y, "column 0: i deletes · row 0: j inserts", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Mismatch",
      title: "H versus R",
      body: [
        "Cell `(1, 1)` compares `H` with `R`. They differ, so all three moves cost 1 on top of their source: diagonal `0 + 1`, up `1 + 1`, left `1 + 1`.",
        "The cheapest is the diagonal, `dp[1][1] = 1`: replace `H` with `R`.",
      ],
      metrics: [
        { label: "Cell value", value: "1" },
        { label: "Cells filled", value: "10 / 24" },
      ],
      lines: [7, 8],
      scene: scene(
        table(upTo(0), { "1,1": "active", "0,0": "mark", "0,1": "mark", "1,0": "mark" }),
        link("d", [0, 0], [1, 1], "0 + 1"),
        link("u", [0, 1], [1, 1], "1 + 1"),
        link("l", [1, 0], [1, 1], "1 + 1"),
        label("cap", 320, CAP_Y, "H ≠ R → 1 + min(0, 1, 1) = 1", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Match",
      title: "Equal letters are free",
      body: [
        "Cell `(2, 2)` compares `O` with `O`. They match, so no edit is needed for this pair: copy the diagonal `dp[1][1] = 1`.",
        "Copying is always at least as good as the other moves, which cost at least the diagonal value too.",
      ],
      callout: {
        kind: "tip",
        text: "On a match you do not need to compare the other two neighbours: the diagonal can never be beaten by more than it.",
      },
      metrics: [
        { label: "Cell value", value: "1" },
        { label: "Cells filled", value: "14 / 24" },
      ],
      lines: [5, 6],
      scene: scene(
        table(upTo(4), { "2,2": "active", "1,1": "mark" }),
        link("d", [1, 1], [2, 2], "keep, +0"),
        label("cap", 320, CAP_Y, "O = O → dp[2][2] = dp[1][1] = 1", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Delete wins",
      title: "R versus O",
      body: [
        "Cell `(3, 2)` compares `R` with `O`: a mismatch. The costs are replace `2 + 1 = 3`, delete `1 + 1 = 2` and insert `2 + 1 = 3`.",
        "Deleting `R` is cheapest: `dp[3][2] = 2`. The move is the one coming down from above.",
      ],
      metrics: [
        { label: "Cell value", value: "2" },
        { label: "Cells filled", value: "17 / 24" },
      ],
      lines: [7, 8],
      scene: scene(
        table(upTo(7), { "3,2": "active", "2,1": "mark", "2,2": "mark", "3,1": "mark" }),
        link("d", [2, 1], [3, 2], "replace 3"),
        link("u", [2, 2], [3, 2], "delete 2"),
        link("l", [3, 1], [3, 2], "insert 3"),
        label("cap", 320, CAP_Y, "R ≠ O → 1 + min(2, 1, 2) = 2", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Last cell",
      title: "E versus S: the answer",
      body: [
        "The rest of the table follows the same rule. The corner compares `E` with `S`, a mismatch: replace `3 + 1 = 4`, delete `2 + 1 = 3`, insert `4 + 1 = 5`.",
        "The minimum is 3, so `HORSE` becomes `ROS` in 3 edits. The table has 24 cells and `O(m * n)` time.",
      ],
      metrics: [
        { label: "Cell value", value: "3", level: "good" },
        { label: "Cells filled", value: "24 / 24", level: "good" },
        { label: "Time", value: "O(m·n)", level: "good" },
      ],
      lines: [7, 8, 9],
      scene: scene(
        table(upTo(14), { "5,3": "found", "4,2": "mark", "4,3": "mark", "5,2": "mark" }),
        link("d", [4, 2], [5, 3], "replace 4"),
        link("u", [4, 3], [5, 3], "delete 3"),
        link("l", [5, 2], [5, 3], "insert 5"),
        label("cap", 320, CAP_Y, "E ≠ S → 1 + min(3, 2, 4) = 3", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Trace back",
      title: "Which edits were they?",
      body: [
        "From the corner, follow the move that produced each value. Up from `(5, 3)` is a deletion of `E`. The match at `(4, 3)` keeps `S` and steps diagonally.",
        "Then up from `(3, 2)` deletes `R`, the match at `(2, 2)` keeps `O`, and the diagonal from `(1, 1)` is the replacement of `H` by `R`.",
      ],
      callout: {
        kind: "insight",
        text: "Up = delete, left = insert, diagonal = replace (or keep on a match). The path is one cheapest edit script, not the only one.",
      },
      metrics: [{ label: "Cell value", value: "3", level: "good" }],
      lines: [10],
      scene: scene(
        table(() => true, {
          "5,3": "found",
          "4,3": "found",
          "3,2": "found",
          "2,2": "found",
          "1,1": "found",
          "0,0": "found",
        }),
        ...PATH.slice(0, -1).map((p, i) => trail(`t${i}`, p, PATH[i + 1])),
        label("cap", 320, CAP_Y, "replace H→R · keep O · delete R · keep S · delete E", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "Recap",
      title: "Rule and cost",
      body: [
        "If the letters match, `dp[i][j] = dp[i-1][j-1]`; otherwise `dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])`. Time is `O(m * n)`.",
        "Keeping two rows gives `O(min(m, n))` memory for the distance alone. Spell checkers, diff tools and DNA alignment all use variants of this table.",
      ],
      metrics: [
        { label: "Cell value", value: "3", level: "good" },
        { label: "Time", value: "O(m·n)", level: "good" },
      ],
      lines: [5, 6, 7, 8],
      scene: scene(
        label("a", 320, 70, "match:  dp[i][j] = dp[i-1][j-1]", { size: 14, weight: 800 }),
        label("b", 320, 120, "else:  1 + min( diagonal, up, left )", { size: 14, weight: 800 }),
        label("c", 320, 180, "diagonal = replace · up = delete · left = insert", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
  ],
};
