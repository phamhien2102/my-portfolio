import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

// dp[a] = fewest coins that make amount a, using coins 1, 3 and 4.
const DP = [0, 1, 2, 1, 1, 2, 2, 2, 2];

interface View {
  /** Cells below this index are settled. */
  filled: number;
  active?: number;
  /** Cells the active one reads, with the coin that leads there. */
  reads?: Record<number, number>;
  found?: number[];
  caption?: string;
}

/** The amounts 0..8 with the settled prefix, the cell being computed, and the cells it reads. */
function view({ filled, active, reads = {}, found = [], caption }: View) {
  return scene(
    row(
      DP.map((v, i) => (i < filled || i === active ? v : "")),
      {
        y: 140,
        index: true,
        empty: DP.flatMap((_, i) => (i < filled || i === active ? [] : [i])),
        tones: (i): Tone | undefined =>
          found.includes(i)
            ? "found"
            : i === active
              ? "active"
              : i in reads
                ? "mark"
                : i < filled
                  ? "done"
                  : undefined,
      },
    ),
    label("t", 320, 205, "amount a → fewest coins dp[a]", { size: 13, tone: "muted" }),
    active !== undefined && ptr("act", `a${active}`, `a = ${active}`, { side: "above" }),
    ...Object.entries(reads).map(([i, coin]) =>
      ptr(`r${coin}`, `a${i}`, `−${coin} coin`, { side: "below", tone: "mark" }),
    ),
    caption && label("cap", 320, 250, caption, { size: 14, weight: 800 }),
  );
}

export const coinChange: AlgoLesson = {
  id: "coin-change",
  title: "Coin Change",
  summary: "Find the fewest coins that add up to an amount, and see why greedy picking can fail.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "Why taking the biggest coin first is not always optimal",
    "Defining dp[a] as the fewest coins for amount a",
    "The recurrence over every coin that fits",
    "Rebuilding which coins were used",
  ],
  takeaways: [
    "Greedy can be wrong when coin values are not nicely related; trying every last coin is always right.",
    "dp[a] is 1 plus the smallest dp[a - coin] over all coins that do not exceed a.",
    "Cost is amount times number of coins, and a table of one number per amount is enough.",
  ],
  hud: [
    { label: "Amount", icon: "list" },
    { label: "Fewest coins", icon: "sigma" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "fewestCoins(coins, amount):",
    "    dp[0] = 0",
    "    for a in 1 .. amount:",
    "        dp[a] = infinity",
    "        for each coin in coins:",
    "            if coin <= a:",
    "                dp[a] = min(dp[a], 1 + dp[a - coin])",
    "    return dp[amount]",
  ],
  steps: [
    {
      short: "The task",
      title: "Making change with coins 1, 3, 4",
      body: [
        "You have unlimited coins of value `1`, `3` and `4`. What is the fewest coins that sum to exactly `6`?",
        "We will build the answer for every amount from 0 up to 8, because the answer for 6 will be assembled from smaller amounts.",
      ],
      metrics: [{ label: "Amount", value: "6" }],
      scene: {
        items: [
          ...scene(
            row(["1", "3", "4"], { id: "c", y: 60, tones: { 0: "mark", 1: "mark", 2: "mark" } }),
            label("cl", 320, 22, "coins", { size: 12, tone: "muted" }),
          ).items,
          ...view({ filled: 0 }).items,
        ],
      },
    },
    {
      short: "Greedy fails",
      title: "The biggest coin first is a trap",
      body: [
        "Greedy takes the largest coin that fits: `4`, then there is `2` left, which needs `1 + 1`. That is three coins for 6.",
        "But `3 + 3` makes 6 with only two coins. Greedy committed to the 4 and could never take it back.",
      ],
      callout: {
        kind: "warn",
        text: "Greedy works for some coin systems (like real currency) but fails for others. When in doubt, use DP: it checks every option.",
      },
      metrics: [{ label: "Amount", value: "6" }],
      scene: scene(
        label("gl", 320, 35, "greedy: 4 + 1 + 1 = 3 coins", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        row(["4", "1", "1"], { id: "g", y: 85, tones: () => "warn" }),
        label("bl", 320, 160, "best: 3 + 3 = 2 coins", { size: 14, weight: 800, tone: "good" }),
        row(["3", "3"], { id: "b", y: 210, tones: () => "found" }),
      ),
    },
    {
      short: "Recurrence",
      title: "Try every coin as the last one",
      body: [
        "Whatever the best answer for amount `a` is, it ends with some coin `k`. Removing that coin leaves amount `a - k`, which should itself use the fewest coins.",
        "So `dp[a] = 1 + min(dp[a - k])` over every coin `k <= a`. The base is `dp[0] = 0`: zero coins make zero.",
      ],
      metrics: [
        { label: "Amount", value: "0" },
        { label: "Fewest coins", value: "0" },
      ],
      lines: [2, 5, 6, 7],
      scene: view({
        filled: 1,
        caption: "dp[a] = 1 + min( dp[a − 1], dp[a − 3], dp[a − 4] )",
      }),
    },
    {
      short: "dp[1]",
      title: "Only the 1 coin fits",
      body: [
        "For `a = 1`, the coins `3` and `4` are too big, so only `1` is allowed: `dp[1] = 1 + dp[0] = 1`.",
        "Ignoring coins larger than `a` keeps the lookup from going below index 0.",
      ],
      metrics: [
        { label: "Amount", value: "1" },
        { label: "Fewest coins", value: "1" },
      ],
      lines: [5, 6, 7],
      scene: view({
        filled: 1,
        active: 1,
        reads: { 0: 1 },
        caption: "dp[1] = 1 + dp[0] = 1",
      }),
    },
    {
      short: "dp[3]",
      title: "Two options, pick the smaller",
      body: [
        "Amount 3 can end in a `1` coin, costing `1 + dp[2] = 1 + 2 = 3`, or in a `3` coin, costing `1 + dp[0] = 1`.",
        "The minimum is `1`: a single coin of value 3. The arrows below show which earlier cells were read.",
      ],
      callout: {
        kind: "insight",
        text: "Each cell scans all coins, so it reads up to as many cells as there are coin types.",
      },
      metrics: [
        { label: "Amount", value: "3" },
        { label: "Fewest coins", value: "1", level: "good" },
      ],
      lines: [5, 6, 7],
      scene: view({
        filled: 3,
        active: 3,
        reads: { 2: 1, 0: 3 },
        caption: "dp[3] = min(1 + 2, 1 + 0) = 1",
      }),
    },
    {
      short: "dp[4]",
      title: "Three coins fit",
      body: [
        "Amount 4 can end in `1`, `3` or `4`: costs `1 + dp[3] = 2`, `1 + dp[1] = 2` and `1 + dp[0] = 1`.",
        "The smallest is 1, the single 4 coin. Notice that `dp[3]` and `dp[1]` were computed before, so they are plain lookups.",
      ],
      metrics: [
        { label: "Amount", value: "4" },
        { label: "Fewest coins", value: "1", level: "good" },
      ],
      lines: [5, 6, 7],
      scene: view({
        filled: 4,
        active: 4,
        reads: { 3: 1, 1: 3, 0: 4 },
        caption: "dp[4] = min(1 + 1, 1 + 1, 1 + 0) = 1",
      }),
    },
    {
      short: "dp[6]",
      title: "Where greedy goes wrong",
      body: [
        "With `dp[5] = 2` settled, amount 6 considers `1 + dp[5] = 3`, `1 + dp[3] = 2` and `1 + dp[2] = 3`.",
        "The winner is the `3` coin on top of `dp[3]`: two coins in total. DP found `3 + 3` because it looked at every last coin, not only the biggest.",
      ],
      metrics: [
        { label: "Amount", value: "6" },
        { label: "Fewest coins", value: "2", level: "good" },
      ],
      lines: [5, 6, 7],
      scene: view({
        filled: 6,
        active: 6,
        reads: { 5: 1, 3: 3, 2: 4 },
        caption: "dp[6] = min(1 + 2, 1 + 1, 1 + 2) = 2",
      }),
    },
    {
      short: "Which coins",
      title: "Reading the coins back",
      body: [
        "The table gives the count; to get the coins, remember which coin gave each minimum, or re-check from the end. At 6 the best came from coin `3`, leaving `3`.",
        "At 3 the best came from coin `3` again, leaving `0`. The coins are `3` and `3`.",
      ],
      callout: {
        kind: "tip",
        text: "Store `choice[a]` (the coin that won) while filling and the reconstruction is a simple loop.",
      },
      metrics: [
        { label: "Amount", value: "6" },
        { label: "Fewest coins", value: "2", level: "good" },
      ],
      lines: [7, 8],
      scene: view({
        filled: 9,
        found: [6, 3, 0],
        caption: "6 → (coin 3) → 3 → (coin 3) → 0: coins 3 + 3",
      }),
    },
    {
      short: "Recap",
      title: "Cost and edge cases",
      body: [
        "There are `amount + 1` cells and each tries every coin: time `O(amount * coins)`, memory `O(amount)`.",
        "If some amount cannot be made (for coins `{4}` and amount 3), start the table with infinity and report 'impossible' when the answer is still infinity. Do not add 1 to infinity and call it a count.",
      ],
      metrics: [
        { label: "Amount", value: "A" },
        { label: "Time", value: "O(A·k)", level: "good" },
      ],
      lines: [4, 8],
      scene: scene(
        label("a", 320, 70, "dp[a] = 1 + min over coins of dp[a − coin]", {
          size: 14,
          weight: 800,
        }),
        label("b", 320, 120, "time O(amount × coins), memory O(amount)", {
          size: 13,
          tone: "muted",
        }),
        label("c", 320, 175, "unreachable amounts stay at infinity", { size: 13, tone: "warn" }),
      ),
    },
  ],
};
