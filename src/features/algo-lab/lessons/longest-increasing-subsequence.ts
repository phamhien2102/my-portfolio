import { label, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const ARR = [5, 2, 8, 6, 3, 6, 9, 7];
// dp[i] = length of the longest strictly increasing subsequence that ends at index i.
const DP = [1, 1, 2, 2, 2, 3, 4, 4];

interface View {
  /** dp cells below this index hold their final value; later ones still show the starting 1. */
  upTo: number;
  active?: number;
  /** Earlier elements that extend the run (highlighted as inputs). */
  marks?: number[];
  /** Earlier elements that cannot extend it (too big or equal). */
  warns?: number[];
  /** Elements that form the rebuilt answer. */
  found?: number[];
  caption?: string;
  hideDp?: boolean;
}

/** The input array above, the dp row below, and the comparison in progress. */
function view({ upTo, active, marks = [], warns = [], found = [], caption, hideDp }: View) {
  return scene(
    label("la", 62, 90, "value", { anchor: "end", size: 12, tone: "muted" }),
    row(ARR, {
      id: "a",
      y: 90,
      index: true,
      tones: (i): Tone | undefined =>
        found.includes(i)
          ? "found"
          : i === active
            ? "active"
            : marks.includes(i)
              ? "mark"
              : warns.includes(i)
                ? "warn"
                : undefined,
    }),
    label("ld", 62, 200, "dp", { anchor: "end", size: 12, tone: "muted" }),
    row(
      DP.map((v, i) => (hideDp ? "" : i < upTo || i === active ? v : 1)),
      {
        id: "d",
        y: 200,
        empty: hideDp ? DP.map((_, i) => i) : [],
        tones: (i): Tone | undefined =>
          found.includes(i) ? "found" : i === active ? "active" : i < upTo ? "done" : undefined,
      },
    ),
    caption && label("cap", 320, 275, caption, { size: 14, weight: 800 }),
  );
}

export const longestIncreasingSubsequence: AlgoLesson = {
  id: "longest-increasing-subsequence",
  title: "Longest Increasing Subsequence",
  summary:
    "Find the longest strictly rising sequence you can pick in order, using a table of best run lengths.",
  minutes: 13,
  level: "advanced",
  goals: [
    "What a subsequence is and why the problem is hard to brute-force",
    "Defining dp[i] as the best run ending exactly at i",
    "The O(n²) fill that looks back at every smaller element",
    "Rebuilding one longest subsequence, and the O(n log n) idea",
  ],
  takeaways: [
    "dp[i] is 1 plus the best dp[j] over earlier, strictly smaller values; the answer is the maximum dp, not the last one.",
    "Comparing each element to all earlier ones costs O(n²) time and O(n) memory.",
    "Keeping only the smallest possible tail for each length lets a binary search do the job in O(n log n).",
  ],
  hud: [
    { label: "Comparisons", icon: "swap" },
    { label: "dp value", icon: "sigma" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "lis(arr):",
    "    dp[i] = 1 for every i",
    "    for i in 1 .. n - 1:",
    "        for j in 0 .. i - 1:",
    "            if arr[j] < arr[i]:",
    "                dp[i] = max(dp[i], dp[j] + 1)",
    "    return max(dp)",
  ],
  steps: [
    {
      short: "The task",
      title: "Pick values in order, always rising",
      body: [
        "A subsequence keeps the original order but may skip elements. In `5 2 8 6 3 6 9 7`, the picks `2 3 6 9` rise strictly and use indexes 1, 4, 5 and 6.",
        "We want the longest such rising subsequence. There are `2ⁿ` subsets, so we need a smarter way than trying them all.",
      ],
      metrics: [{ label: "Time", value: "2ⁿ subsets", level: "bad" }],
      scene: view({ upTo: 0, hideDp: true, caption: "longest strictly increasing subsequence" }),
    },
    {
      short: "Define dp",
      title: "Best run that ends here",
      body: [
        "Let `dp[i]` be the length of the longest rising subsequence whose last element is `ARR[i]`. Every element alone is a run of length 1, so the table starts as all ones.",
        "Fixing where the run ends is the trick: it lets us extend runs that ended earlier.",
      ],
      callout: {
        kind: "insight",
        text: "Asking for the best run 'ending at i' rather than 'inside the first i' is what makes the subproblems chain together.",
      },
      metrics: [{ label: "dp value", value: "1" }],
      lines: [2],
      scene: view({ upTo: 0, caption: "start: dp[i] = 1 for every i" }),
    },
    {
      short: "i = 2",
      title: "Value 8 can follow 5 or 2",
      body: [
        "Look at every earlier element. `5` and `2` are both smaller than `8`, and each has `dp = 1`, so appending 8 gives `1 + 1 = 2`.",
        "Among all smaller earlier values we take the one with the largest `dp`. Here it is a tie.",
      ],
      metrics: [
        { label: "Comparisons", value: "3" },
        { label: "dp value", value: "2" },
      ],
      lines: [4, 5, 6],
      scene: view({
        upTo: 2,
        active: 2,
        marks: [0, 1],
        caption: "dp[2] = 1 + max(dp[0], dp[1]) = 2",
      }),
    },
    {
      short: "i = 4",
      title: "Bigger earlier values are useless",
      body: [
        "For `3` at index 4, the values `5`, `8` and `6` are larger, so 3 can never come after them. The red cells are skipped.",
        "Only `2` is smaller, with `dp = 1`, so `dp[4] = 2`.",
      ],
      callout: {
        kind: "tip",
        text: "Only look at j < i with ARR[j] < ARR[i]. Everything else cannot be the previous element of the run.",
      },
      metrics: [
        { label: "Comparisons", value: "10" },
        { label: "dp value", value: "2" },
      ],
      lines: [5],
      scene: view({
        upTo: 4,
        active: 4,
        marks: [1],
        warns: [0, 2, 3],
        caption: "dp[4] = 1 + dp[1] = 2",
      }),
    },
    {
      short: "Equal values",
      title: "Strictly means equal does not count",
      body: [
        "The second `6` at index 5 sees the first `6` at index 3. They are equal, not rising, so index 3 is red: a run cannot repeat a value.",
        "The best predecessor is `3` at index 4, whose `dp` is 2, so `dp[5] = 3` (for example `2 3 6`).",
      ],
      callout: {
        kind: "warn",
        text: "Use `<` for a strictly increasing run. Using `<=` would quietly solve a different problem (non-decreasing).",
      },
      metrics: [
        { label: "Comparisons", value: "15" },
        { label: "dp value", value: "3" },
      ],
      lines: [5],
      scene: view({
        upTo: 5,
        active: 5,
        marks: [4],
        warns: [2, 3],
        caption: "dp[5] = 1 + dp[4] = 3",
      }),
    },
    {
      short: "i = 6",
      title: "9 beats everyone before it",
      body: [
        "Every earlier value is smaller than `9`, so every `dp` is a candidate. The largest is `dp[5] = 3`, so `dp[6] = 3 + 1 = 4`.",
        "This is the longest run so far: `2 3 6 9`.",
      ],
      metrics: [
        { label: "Comparisons", value: "21" },
        { label: "dp value", value: "4", level: "good" },
      ],
      lines: [4, 5, 6],
      scene: view({
        upTo: 6,
        active: 6,
        marks: [5],
        caption: "dp[6] = 1 + max(dp[0..5]) = 1 + 3 = 4",
      }),
    },
    {
      short: "i = 7",
      title: "7 cannot follow 9",
      body: [
        "For `7`, the value `9` is larger, so it is out. Among the smaller ones, `6` at index 5 has the best `dp` of 3, giving `dp[7] = 4`.",
        "Two different runs of length 4 now exist: one ending at 9 and one ending at 7.",
      ],
      metrics: [
        { label: "Comparisons", value: "28" },
        { label: "dp value", value: "4", level: "good" },
      ],
      lines: [4, 5, 6],
      scene: view({
        upTo: 7,
        active: 7,
        marks: [5],
        warns: [6],
        caption: "dp[7] = 1 + dp[5] = 4",
      }),
    },
    {
      short: "The answer",
      title: "Take the maximum, not the last",
      body: [
        "The longest run may end anywhere, so the answer is `max(dp)`, which is 4. It first appears at index 6.",
        "The whole fill compared each element with all earlier ones: about `n²/2` comparisons, so `O(n²)` time and `O(n)` memory.",
      ],
      metrics: [
        { label: "dp value", value: "4", level: "good" },
        { label: "Time", value: "O(n²)", level: "warn" },
      ],
      lines: [7],
      scene: view({
        upTo: 8,
        found: [6],
        caption: "LIS length = max(dp) = 4",
      }),
    },
    {
      short: "Rebuild",
      title: "Walk back to get the numbers",
      body: [
        "Remember for each `i` which `j` gave its best value. From index 6 the chain goes to 5, then to 4, then to 1: the values are `9`, `6`, `3`, `2`.",
        "Reading them in reverse gives one longest subsequence, `2 3 6 9`. Other answers of length 4 exist, such as `2 3 6 7`.",
      ],
      metrics: [{ label: "dp value", value: "4", level: "good" }],
      scene: view({
        upTo: 8,
        found: [1, 4, 5, 6],
        caption: "indexes 1, 4, 5, 6 → 2 3 6 9",
      }),
    },
    {
      short: "Faster",
      title: "The patience idea in O(n log n)",
      body: [
        "Keep `tails[k]`, the smallest value that can end a rising run of length `k + 1`. This list is always sorted. For each new value, binary-search the first tail that is at least as large and overwrite it; if none is, append.",
        "For our array it ends as `2 3 6 7`: length 4. Each element costs one binary search, so the total is `O(n log n)`. It gives the length directly; rebuilding the sequence needs extra bookkeeping.",
      ],
      callout: {
        kind: "insight",
        text: "A smaller tail is always at least as good as a larger one for the same length, so only the best tail per length needs to be remembered.",
      },
      metrics: [
        { label: "dp value", value: "4", level: "good" },
        { label: "Time", value: "O(n log n)", level: "good" },
      ],
      scene: scene(
        label("t", 320, 70, "tails after reading 5 2 8 6 3 6 9 7", { size: 14, weight: 800 }),
        row([2, 3, 6, 7], { id: "t", y: 140, index: 1, tones: () => "found" }),
        label("n", 320, 205, "tails[k] = smallest end of a run of length k", {
          size: 13,
          tone: "muted",
        }),
        label("r", 320, 245, "new value: replace the first tail ≥ it, or append", {
          size: 13,
          weight: 800,
        }),
      ),
    },
  ],
};
