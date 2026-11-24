import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const A = [3, 1, 4, 1, 5, 9];
const P = [0, 3, 4, 8, 9, 14, 23];

type Tones = Record<number, Tone>;

/** The input row on top, aligned so a[i] sits above prefix[i + 1]. */
function top(tones?: Tones) {
  return row(A, { id: "a", x: 350, y: 90, index: true, tones });
}

/** The prefix row: only the first `filled` entries show, the rest are ghost slots. */
function pre(filled: number, tones?: Tones) {
  return row(P, {
    id: "p",
    x: 320,
    y: 210,
    index: true,
    empty: P.map((_, i) => i).filter((i) => i >= filled),
    tones,
  });
}

export const prefixSums: AlgoLesson = {
  id: "prefix-sums",
  title: "Prefix Sums",
  summary:
    "Precompute running totals once, then answer any range-sum question with one subtraction.",
  minutes: 10,
  level: "intermediate",
  goals: [
    "Why repeated range sums are slow",
    "How to build the running-total array",
    "The formula prefix[r + 1] - prefix[l]",
    "Why a leading 0 avoids off-by-one cases",
  ],
  takeaways: [
    "Build prefix[i + 1] = prefix[i] + a[i] once in O(n), starting from a leading 0.",
    "The sum of a[l..r] is prefix[r + 1] - prefix[l], because the shared start cancels out.",
    "After the one-time build, each range query is O(1) and the extra memory is O(n).",
  ],
  hud: [
    { label: "Build cost", icon: "gauge" },
    { label: "Query cost", icon: "timer" },
    { label: "Memory", icon: "memory" },
  ],
  pseudocode: [
    "build(a):",
    "    prefix[0] = 0",
    "    for i from 0 to n - 1:",
    "        prefix[i + 1] = prefix[i] + a[i]",
    "    return prefix",
    "rangeSum(prefix, l, r):",
    "    return prefix[r + 1] - prefix[l]",
  ],
  steps: [
    {
      short: "The problem",
      title: "Many range-sum queries",
      body: [
        "You have `3, 1, 4, 1, 5, 9` and will be asked, again and again, for the sum of some stretch `a[l..r]`.",
        "Each question could be about a different stretch, so we want answers to be fast.",
      ],
      metrics: [
        { label: "Build cost", value: "—" },
        { label: "Query cost", value: "?" },
      ],
      scene: scene(top()),
    },
    {
      short: "Naive way",
      title: "Adding it up each time",
      body: [
        "For `a[2..4]` you add `4 + 1 + 5 = 10`. That is a loop over the range.",
        "A long range costs up to `O(n)` per query, and a thousand queries repeat nearly the same additions a thousand times.",
      ],
      metrics: [{ label: "Query cost", value: "O(n)", level: "bad" }],
      scene: scene(
        top({ 2: "active", 3: "active", 4: "active" }),
        label("eq", 320, 190, "4 + 1 + 5 = 10, redone for every query", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Start at 0",
      title: "Prefix of nothing is 0",
      body: [
        "Make a second array, `prefix`, one slot longer than the input. `prefix[i]` will hold the sum of the first `i` elements.",
        "So `prefix[0]` is the sum of no elements: `0`. This leading zero is what keeps the formulas clean later.",
      ],
      callout: {
        kind: "tip",
        text: "prefix has n + 1 entries for n inputs. The extra slot is the empty prefix.",
      },
      metrics: [
        { label: "Build cost", value: "0 / 6" },
        { label: "Memory", value: "n + 1" },
      ],
      lines: [2],
      scene: scene(top(), pre(1, { 0: "found" })),
    },
    {
      short: "Keep adding",
      title: "Each entry builds on the last",
      body: [
        "`prefix[1] = prefix[0] + a[0] = 0 + 3 = 3`. Then `prefix[2] = 3 + a[1] = 3 + 1 = 4`.",
        "Every new entry is the previous entry plus one input element: one addition each.",
      ],
      metrics: [
        { label: "Build cost", value: "2 / 6" },
        { label: "Memory", value: "n + 1" },
      ],
      lines: [3, 4],
      scene: scene(top({ 0: "done", 1: "done" }), pre(3, { 2: "active" })),
    },
    {
      short: "Whole array",
      title: "One pass builds it all",
      body: [
        "Continue to the end: `8, 9, 14, 23`. The last entry, `23`, is the sum of the whole input.",
        "Six elements took six additions: the build is `O(n)`, and we pay it only once.",
      ],
      metrics: [
        { label: "Build cost", value: "O(n)", level: "good" },
        { label: "Memory", value: "n + 1" },
      ],
      lines: [3, 4, 5],
      scene: scene(
        top(),
        pre(7, { 6: "done" }),
        label("eq", 320, 280, "prefix[i + 1] = prefix[i] + a[i]", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Query",
      title: "Sum of a[2..4] in one step",
      body: [
        "For `l = 2`, `r = 4` take `prefix[r + 1] - prefix[l] = prefix[5] - prefix[2] = 14 - 4 = 10`.",
        "Two lookups and one subtraction. It matches the 10 from before, and the cost no longer depends on the range length.",
      ],
      metrics: [
        { label: "Query cost", value: "O(1)", level: "good" },
        { label: "Build cost", value: "O(n)", level: "good" },
      ],
      lines: [6, 7],
      scene: scene(
        top({ 2: "found", 3: "found", 4: "found" }),
        pre(7, { 5: "active", 2: "warn" }),
        ptr("r", "p5", "r + 1", { tone: "active" }),
        ptr("l", "p2", "l", { tone: "warn" }),
        label("eq", 320, 285, "14 - 4 = 10", { size: 15, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Why it works",
      title: "The shared start cancels",
      body: [
        "`prefix[5]` is the sum of `a[0..4]`. `prefix[2]` is the sum of `a[0..1]`. Subtracting removes the part both contain, leaving exactly `a[2..4]`.",
        "Any range is a long prefix minus a shorter one.",
      ],
      callout: {
        kind: "insight",
        text: "Subtraction undoes addition, so one stored total per position is enough to recover any slice.",
      },
      metrics: [{ label: "Query cost", value: "O(1)", level: "good" }],
      lines: [7],
      scene: scene(
        top({ 0: "muted", 1: "muted", 2: "found", 3: "found", 4: "found" }),
        pre(7, { 5: "active", 2: "warn" }),
        label("e1", 320, 285, "a[0..4] = 14, minus a[0..1] = 4, leaves a[2..4] = 10", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Off by one",
      title: "Why the leading 0 matters",
      body: [
        "Take a range that starts at the front: `a[0..2]`. The formula gives `prefix[3] - prefix[0] = 8 - 0 = 8`, which is `3 + 1 + 4`. No special case needed.",
        "Without the leading 0 you would need an `if l == 0` branch everywhere, and index mix-ups of `r` versus `r + 1` are the usual bug.",
      ],
      callout: {
        kind: "warn",
        text: "Use r + 1, not r. prefix[i] covers the first i elements, so it ends just before index i.",
      },
      metrics: [{ label: "Query cost", value: "O(1)", level: "good" }],
      lines: [6, 7],
      scene: scene(
        top({ 0: "found", 1: "found", 2: "found" }),
        pre(7, { 3: "active", 0: "warn" }),
        ptr("r", "p3", "r + 1", { tone: "active" }),
        ptr("l", "p0", "l", { tone: "warn" }),
        label("eq", 320, 285, "8 - 0 = 8", { size: 15, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Recap",
      title: "Pay once, ask many times",
      body: [
        "Build the prefix array in `O(n)` time and `O(n)` extra memory. After that, every range sum is `prefix[r + 1] - prefix[l]` in `O(1)`.",
        "It pays off whenever you ask many queries on data that does not change. If values are updated between queries, the prefix array must be rebuilt.",
      ],
      metrics: [
        { label: "Build cost", value: "O(n)", level: "good" },
        { label: "Query cost", value: "O(1)", level: "good" },
        { label: "Memory", value: "O(n)", level: "warn" },
      ],
      scene: scene(
        label("a", 320, 90, "build once: O(n)", { size: 15, weight: 800 }),
        label("b", 320, 145, "each query: prefix[r + 1] - prefix[l]", {
          size: 15,
          weight: 800,
          tone: "good",
        }),
        label("c", 320, 200, "n queries: O(n) total, not O(n²)", { size: 13, tone: "muted" }),
      ),
    },
  ],
};
