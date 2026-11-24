import { edge, label, matrix, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const WEIGHT = [2, 3, 4, 5];
const VALUE = [3, 4, 5, 6];
const COLS = 6; // capacity 0..5
// FULL[i][c] = best value using the first i items with capacity c.
const FULL = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 3, 3, 3, 3],
  [0, 0, 3, 4, 4, 7],
  [0, 0, 3, 4, 5, 7],
  [0, 0, 3, 4, 5, 7],
];

const colX = (c: number) => 215 + 50 * c;

type Filled = (r: number, c: number) => boolean;
const border: Filled = (r, c) => r === 0 || c === 0;
const upTo =
  (k: number): Filled =>
  (r, c) =>
    border(r, c) || r * COLS + c < k;

/** The DP table with headers: rows are "first i items", columns are the capacity. */
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
    label("hcap", 340, 2, "capacity", { size: 11, tone: "muted" }),
    ...Array.from({ length: COLS }, (_, c) =>
      label(`hc${c}`, colX(c), 24, String(c), { size: 12, tone: "muted", weight: 800 }),
    ),
    ...FULL.map((_, r) =>
      label(
        `hr${r}`,
        187,
        62 + 44 * r + 4,
        r === 0 ? "no items" : `item ${r} (w${WEIGHT[r - 1]} v${VALUE[r - 1]})`,
        { anchor: "end", size: 11, tone: "muted" },
      ),
    ),
  ];
}

const id = (r: number, c: number) => `m${r}-${c}`;
const link = (
  name: string,
  a: [number, number],
  b: [number, number],
  text: string,
  dashed = false,
) => edge(name, id(...a), id(...b), { tone: "active", label: text, dashed });
const trail = (name: string, a: [number, number], b: [number, number]) =>
  edge(name, id(...a), id(...b), { tone: "found" });

export const knapsack: AlgoLesson = {
  id: "knapsack",
  title: "Knapsack",
  summary:
    "Choose items to maximise value under a weight limit, deciding take or skip with a 2-D table.",
  minutes: 14,
  level: "advanced",
  goals: [
    "The 0/1 knapsack problem and why greedy choices are not safe",
    "Defining a table of items by capacity",
    "The take-or-skip recurrence for each cell",
    "Reading the chosen items back out of the table",
  ],
  takeaways: [
    "Each cell is the better of two options: skip the item, or take it and use the leftover capacity.",
    "Rows count the items considered so far and columns count the capacity, so the table has n times W cells.",
    "The table gives the best value; walking back from the last cell tells you which items produced it.",
  ],
  hud: [
    { label: "Best value", icon: "sigma" },
    { label: "Cells filled", icon: "grid" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "knapsack(items, W):",
    "    dp[0][c] = 0 and dp[i][0] = 0 for all i, c",
    "    for i in 1 .. n:",
    "        for c in 1 .. W:",
    "            dp[i][c] = dp[i-1][c]",
    "            if weight[i] <= c:",
    "                take = value[i] + dp[i-1][c - weight[i]]",
    "                dp[i][c] = max(dp[i][c], take)",
    "    return dp[n][W]",
    "    walk back from (n, W): item i taken if dp[i][c] != above",
  ],
  steps: [
    {
      short: "The items",
      title: "A bag that holds weight 5",
      body: [
        "Four items each have a weight and a value, and the bag holds total weight at most 5. Every item is used once or not at all, which is the 0/1 in the name.",
        "We want the largest total value. Taking the most valuable item first does not obviously work, because it may crowd out two smaller ones.",
      ],
      metrics: [{ label: "Cells filled", value: "0 / 30" }],
      scene: scene(
        label("t", 320, 60, "capacity = 5, each item once", { size: 14, weight: 800 }),
        row(
          WEIGHT.map((w, i) => `w${w} v${VALUE[i]}`),
          { y: 140, w: 88, index: 1 },
        ),
        label("n", 320, 215, "items 1..4", { size: 12, tone: "muted" }),
      ),
    },
    {
      short: "The table",
      title: "Items by capacity",
      body: [
        "Let `dp[i][c]` be the best value using only the first `i` items with capacity `c`. Row 0 means no items, so every value is 0; column 0 means no room, so it is 0 as well.",
        "The answer we want is `dp[4][5]`: all items available, full capacity.",
      ],
      metrics: [
        { label: "Best value", value: "0" },
        { label: "Cells filled", value: "10 / 30" },
      ],
      lines: [2],
      scene: scene(table(border)),
    },
    {
      short: "Take or skip",
      title: "Item 1 at capacity 2",
      body: [
        "Cell `(1, 2)` asks: with item 1 (weight 2, value 3) and room 2, what is best? Skipping gives `dp[0][2] = 0`. Taking gives its value plus the best with the leftover room, `3 + dp[0][0] = 3`.",
        "Take the larger: `max(0, 3) = 3`. Both options read cells from the row above, which is already complete.",
      ],
      callout: {
        kind: "insight",
        text: "Skip = same capacity, previous row. Take = capacity minus weight, previous row, plus the item's value.",
      },
      metrics: [
        { label: "Best value", value: "3" },
        { label: "Cells filled", value: "12 / 30" },
      ],
      lines: [5, 6, 7, 8],
      scene: scene(
        table(upTo(8), { "1,2": "active", "0,2": "mark", "0,0": "mark" }),
        link("skip", [0, 2], [1, 2], "skip 0"),
        link("take", [0, 0], [1, 2], "take 3 + 0", true),
        label("cap", 340, 285, "dp[1][2] = max(0, 3 + 0) = 3", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Row 1",
      title: "The first row settles",
      body: [
        "Item 1 weighs 2, so with capacity 0 or 1 it does not fit and the cell just copies the row above. From capacity 2 on it fits once, giving 3 everywhere.",
        "If the weight is bigger than the capacity, taking is not allowed: that cell is only the skip value.",
      ],
      callout: {
        kind: "warn",
        text: "Guard the take option with `weight <= c`. Reading a negative column is the classic bug here.",
      },
      metrics: [
        { label: "Best value", value: "3" },
        { label: "Cells filled", value: "15 / 30" },
      ],
      lines: [5, 6],
      scene: scene(
        table(upTo(12)),
        label("cap", 340, 285, "item 1 fits from capacity 2: value 3", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "A real choice",
      title: "Item 2 at capacity 5",
      body: [
        "Cell `(2, 5)` is where the choice matters. Skip item 2 and we keep `dp[1][5] = 3`. Take it (weight 3, value 4) and the leftover room is 2, worth `dp[1][2] = 3`, so the total is `4 + 3 = 7`.",
        "`max(3, 7) = 7`: items 1 and 2 together fit exactly and beat either alone.",
      ],
      metrics: [
        { label: "Best value", value: "7", level: "good" },
        { label: "Cells filled", value: "20 / 30" },
      ],
      lines: [5, 7, 8],
      scene: scene(
        table(upTo(17), { "2,5": "active", "1,5": "mark", "1,2": "mark" }),
        link("skip", [1, 5], [2, 5], "skip 3"),
        link("take", [1, 2], [2, 5], "take 4 + 3", true),
        label("cap", 340, 285, "dp[2][5] = max(3, 4 + 3) = 7", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Last cell",
      title: "The final cell",
      body: [
        "Rows 3 and 4 follow the same rule and add nothing better. For `(4, 5)`: skipping item 4 gives `dp[3][5] = 7`; taking it (weight 5, value 6) uses all the room and gives `6 + dp[3][0] = 6`.",
        "`max(7, 6) = 7`, so the best total value is 7. The table cost one comparison per cell: `O(n * W)` time and space.",
      ],
      metrics: [
        { label: "Best value", value: "7", level: "good" },
        { label: "Cells filled", value: "30 / 30", level: "good" },
        { label: "Time", value: "O(n·W)", level: "good" },
      ],
      lines: [7, 8, 9],
      scene: scene(
        table(upTo(29), { "4,5": "found", "3,5": "mark", "3,0": "mark" }),
        link("skip", [3, 5], [4, 5], "skip 7"),
        link("take", [3, 0], [4, 5], "take 6 + 0", true),
        label("cap", 340, 285, "dp[4][5] = max(7, 6 + 0) = 7", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Walk back 1",
      title: "Which items made 7?",
      body: [
        "Start at `(4, 5)`. Its value equals the cell directly above, `dp[3][5] = 7`, so item 4 was not needed: skip it and move up.",
        "Again `dp[3][5] = dp[2][5] = 7`, so item 3 was not needed either. Equal to the cell above means skipped.",
      ],
      metrics: [{ label: "Best value", value: "7", level: "good" }],
      lines: [10],
      scene: scene(
        table(() => true, { "4,5": "found", "3,5": "found", "2,5": "found" }),
        trail("w1", [4, 5], [3, 5]),
        trail("w2", [3, 5], [2, 5]),
        label("cap", 340, 285, "same as above → item 4 skipped, item 3 skipped", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Walk back 2",
      title: "Differences mean taken",
      body: [
        "At `(2, 5)` the value 7 differs from the cell above (3), so item 2 was taken. Subtract its weight 3 and move up to column 2: cell `(1, 2)`.",
        "There `3` differs from `dp[0][2] = 0`, so item 1 was taken and the capacity reaches 0. The bag holds items 1 and 2: weight 5, value 7.",
      ],
      callout: {
        kind: "tip",
        text: "To recover the choices you need the full table, or a separate record of each decision, which is one reason the table is kept in 2-D.",
      },
      metrics: [{ label: "Best value", value: "7", level: "good" }],
      lines: [10],
      scene: scene(
        table(() => true, {
          "4,5": "found",
          "3,5": "found",
          "2,5": "found",
          "1,2": "found",
          "0,0": "found",
        }),
        trail("w1", [4, 5], [3, 5]),
        trail("w2", [3, 5], [2, 5]),
        trail("w3", [2, 5], [1, 2]),
        trail("w4", [1, 2], [0, 0]),
        label("cap", 340, 285, "taken: item 2 (w3 v4) and item 1 (w2 v3) → 7", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "Recap",
      title: "The shape of the solution",
      body: [
        "For each item, for each capacity, take the better of skip and take. Time and space are `O(n * W)`, where `W` is the capacity.",
        "That is called pseudo-polynomial: `W` is a number, not a count of inputs, so doubling the number of digits in `W` squares the work. If only the best value matters, keep one row and loop capacity downward to save space.",
      ],
      metrics: [
        { label: "Best value", value: "7", level: "good" },
        { label: "Time", value: "O(n·W)", level: "good" },
      ],
      lines: [3, 4],
      scene: scene(
        label("a", 340, 70, "dp[i][c] = max( dp[i-1][c], value + dp[i-1][c-weight] )", {
          size: 14,
          weight: 800,
        }),
        label("b", 340, 125, "take only if weight ≤ c", { size: 13, tone: "muted" }),
        label("c", 340, 185, "walk back: equal to above → skipped, else taken", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
