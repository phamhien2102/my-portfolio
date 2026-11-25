import { bars, cell, frame, label, matrix, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const EIGHT = [4, 9, 2, 7, 5, 1, 8, 6];

/** Eight items with the first `n` of them lit up as "touched", plus a caption. */
function touched(n: number, caption: string, tone: Tone = "active") {
  return scene(
    row(EIGHT, { index: true, tones: (i) => (i < n ? tone : undefined) }),
    label("cap", 320, 245, caption, { size: 14, weight: 800 }),
  );
}

export const bigO: AlgoLesson = {
  id: "big-o",
  title: "Big-O Notation",
  summary: "Describe how an algorithm's cost grows with its input, and ignore everything else.",
  minutes: 11,
  level: "beginner",
  goals: [
    "What Big-O measures and why it ignores constants",
    "The six growth rates you meet most often",
    "Best, average and worst case",
    "Time complexity versus space complexity",
  ],
  takeaways: [
    "Big-O describes how the number of steps grows as the input grows, not how many seconds a run takes.",
    "Drop constants and lower-order terms: 3n + 5 and 100n are both O(n).",
    "Always say which case and which resource you mean: worst-case time and extra space can differ.",
  ],
  hud: [
    { label: "n", icon: "list" },
    { label: "Steps", icon: "timer" },
    { label: "Growth", icon: "gauge" },
    { label: "Extra space", icon: "memory" },
  ],
  pseudocode: [
    "analyze(items):",
    "    x = items[3]                  # O(1): one step",
    "    for each item in items:       # O(n): touch every item",
    "        total = total + item",
    "    while size > 1:               # O(log n): halve each time",
    "        size = size / 2",
    "    for each a in items:          # O(n^2): loop inside a loop",
    "        for each b in items:",
    "            compare(a, b)",
    "    return total",
  ],
  steps: [
    {
      short: "Why",
      title: "Counting steps, not seconds",
      body: [
        "A stopwatch tells you how fast one program ran on one machine. It says nothing about what happens when the input is ten times bigger.",
        "Big-O counts basic steps as a function of the input size `n`. Here `n = 8`, and every cell is one item an algorithm might have to look at.",
      ],
      metrics: [
        { label: "n", value: "8" },
        { label: "Steps", value: "—" },
      ],
      scene: touched(0, "n = 8 items"),
    },
    {
      short: "O(1)",
      title: "O(1): constant time",
      body: [
        "Reading `a[3]` takes one step whether the array holds 8 items or 8 million. The cost does not depend on `n` at all.",
        "Constant does not mean 'fast', it means 'flat'.",
      ],
      callout: {
        kind: "tip",
        text: "Array indexing, push onto a stack and hash lookups are O(1).",
      },
      metrics: [
        { label: "n", value: "8" },
        { label: "Steps", value: "1", level: "good" },
        { label: "Growth", value: "O(1)", level: "good" },
      ],
      lines: [2],
      scene: scene(
        row(EIGHT, { index: true, tones: { 3: "found" } }),
        ptr("p", "a3", "a[3]"),
        label("cap", 320, 245, "one step, any n", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "O(n)",
      title: "O(n): linear time",
      body: [
        "Summing the array visits every item once: 8 items, 8 steps. Double the input and the work doubles.",
        "Linear search, finding the maximum and copying a list are all O(n).",
      ],
      metrics: [
        { label: "n", value: "8" },
        { label: "Steps", value: "8", level: "warn" },
        { label: "Growth", value: "O(n)", level: "warn" },
      ],
      lines: [3, 4],
      scene: touched(8, "touch every item once: 8 steps", "done"),
    },
    {
      short: "O(log n)",
      title: "O(log n): halving the problem",
      body: [
        "If each step throws away half of what is left, 8 items shrink to 4, then 2, then 1: just 3 steps. A thousand items need only about 10, a billion about 30.",
        "That is why binary search on sorted data feels instant.",
      ],
      callout: {
        kind: "insight",
        text: "log n is 'how many times can I halve n before reaching 1'.",
      },
      metrics: [
        { label: "n", value: "8" },
        { label: "Steps", value: "3", level: "good" },
        { label: "Growth", value: "O(log n)", level: "good" },
      ],
      lines: [5, 6],
      scene: scene(
        row(EIGHT, {
          index: true,
          tones: (i) => (i < 4 ? "muted" : i < 6 ? "muted" : i === 6 ? "muted" : "found"),
        }),
        label("cap", 320, 245, "8 → 4 → 2 → 1: three halvings", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "O(n²)",
      title: "O(n²): a loop inside a loop",
      body: [
        "Comparing every item with every other item takes `n × n` steps. With `n = 6` that is already 36 cells of work, and doubling `n` quadruples it.",
        "Nested loops over the same data are the usual source of O(n²).",
      ],
      callout: { kind: "warn", text: "Fine for hundreds of items, painful for millions." },
      metrics: [
        { label: "n", value: "6" },
        { label: "Steps", value: "36", level: "bad" },
        { label: "Growth", value: "O(n²)", level: "bad" },
      ],
      lines: [7, 8, 9],
      scene: scene(
        matrix(
          Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => "·")),
          {
            w: 38,
            h: 30,
            gap: 5,
            y: 140,
            tones: Object.fromEntries(
              Array.from({ length: 36 }, (_, k) => [
                `${Math.floor(k / 6)},${k % 6}`,
                "warn" as Tone,
              ]),
            ),
          },
        ),
        label("cap", 320, 270, "6 × 6 = 36 pairs", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Compare",
      title: "Side by side at n = 8",
      body: [
        "Here are the step counts for the same `n = 8`: 1, 3, 8, 24 (`n log n`), 64 and 256 (`2ⁿ`).",
        "The last two explode. O(2ⁿ) shows up when you try every subset; at `n = 40` it is already over a trillion steps.",
      ],
      metrics: [
        { label: "n", value: "8" },
        { label: "Steps", value: "1 to 256" },
        { label: "Growth", value: "2ⁿ", level: "bad" },
      ],
      scene: scene(
        bars([1, 3, 8, 24, 64, 256], {
          w: 50,
          gap: 12,
          y: 205,
          tones: (i) => (["done", "done", "active", "active", "warn", "warn"] as Tone[])[i],
        }),
        ...["1", "log n", "n", "n log n", "n²", "2ⁿ"].map((t, i) =>
          label(`n${i}`, 320 + (i - 2.5) * 62, 228, t, { size: 11, anchor: "middle" }),
        ),
      ),
    },
    {
      short: "Constants",
      title: "Drop constants and small terms",
      body: [
        "A loop that does 3 things per item plus 5 setup steps costs `3n + 5`. For huge `n` the `5` is noise and the `3` is just a unit of measure, so we write O(n).",
        "Big-O keeps only the fastest-growing term. `n² + n` is O(n²), because at `n = 1000` the `n` adds 0.1%.",
      ],
      callout: {
        kind: "insight",
        text: "Constants matter for real speed, Big-O just answers 'how does it scale'.",
      },
      metrics: [{ label: "Growth", value: "3n + 5 → O(n)", level: "good" }],
      scene: scene(
        label("l1", 320, 80, "3n + 5", { size: 22, weight: 800 }),
        label("l2", 320, 130, "↓ drop the 5", { tone: "muted" }),
        label("l3", 320, 175, "3n", { size: 22, weight: 800 }),
        label("l4", 320, 220, "↓ drop the 3", { tone: "muted" }),
        label("l5", 320, 265, "O(n)", { size: 26, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Cases",
      title: "Best, average and worst case",
      body: [
        "Linear search for a target in 6 items might hit it first (1 step, the best case), in the middle (about 3, average) or last or not at all (6 steps, the worst case).",
        "Unless told otherwise, Big-O quotes the worst case, because it is a promise you can rely on.",
      ],
      metrics: [
        { label: "n", value: "6" },
        { label: "Steps", value: "1 / 3 / 6" },
        { label: "Growth", value: "O(n) worst", level: "warn" },
      ],
      scene: scene(
        row([7, 3, 9, 4, 1, 8], { index: true, tones: { 0: "found", 5: "warn" } }),
        ptr("best", "a0", "best: 1"),
        ptr("worst", "a5", "worst: 6"),
        label("cap", 320, 245, "same code, three different inputs", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Space",
      title: "Time is not the only cost",
      body: [
        "Space complexity counts the extra memory an algorithm needs beyond its input. Reversing an array in place uses O(1) extra space; copying it into a new array uses O(n).",
        "Often you can trade one for the other, such as storing results in a table to avoid recomputing them.",
      ],
      callout: { kind: "tip", text: "Say both: 'O(n log n) time, O(n) extra space'." },
      metrics: [
        { label: "Steps", value: "O(n)" },
        { label: "Extra space", value: "O(1) vs O(n)" },
      ],
      scene: scene(
        // Memory is drawn as solid slabs: the input already owns its slab, the copy needs a new one.
        frame("inmem", 78, 65, 224, 70, "input", { solid: true }),
        frame("outmem", 338, 65, 224, 70, "extra memory", { solid: true, tone: "warn" }),
        row([1, 2, 3, 4], { id: "in", y: 100, x: 190, w: 44, index: true }),
        row([4, 3, 2, 1], { id: "out", y: 100, x: 450, w: 44, tones: () => "mark" }),
        cell("ghostnote", 190, 190, "in place: O(1)", { w: 130, h: 30, tone: "done" }),
        cell("copynote", 450, 190, "copy: O(n)", { w: 130, h: 30, tone: "warn" }),
        label("cap", 320, 272, "same answer, different memory bill", { size: 14, weight: 800 }),
      ),
    },
  ],
};
