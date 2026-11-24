import { cell, label, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

type Iv = { id: string; s: number; e: number };
const IV: Record<string, Iv> = {
  A: { id: "A", s: 1, e: 3 },
  B: { id: "B", s: 8, e: 10 },
  C: { id: "C", s: 2, e: 6 },
  D: { id: "D", s: 15, e: 18 },
  E: { id: "E", s: 17, e: 20 },
};
const GIVEN = ["A", "B", "C", "D", "E"];
const SORTED = ["A", "C", "B", "D", "E"];

const X0 = 40;
const UNIT = 28;
const px = (v: number) => X0 + v * UNIT;
const interval = (id: string, s: number, e: number, y: number, tone?: Tone): Item =>
  cell(id, (px(s) + px(e)) / 2, y, `${s}–${e}`, { w: (e - s) * UNIT, h: 30, tone });

const axis = (): Item[] =>
  [0, 5, 10, 15, 20].map((v) =>
    label(`tick${v}`, px(v), 246, String(v), { size: 11, tone: "muted" }),
  );

/** Input intervals in the given order, the number line, and the merged result so far. */
function view(
  order: string[],
  tones: Record<string, Tone>,
  merged: [number, number][],
  note?: string,
) {
  return scene(
    note && label("note", 320, 20, note, { size: 13, weight: 800 }),
    order.map((k, i) => interval(k, IV[k].s, IV[k].e, 55 + i * 36, tones[k])),
    axis(),
    merged.map(([s, e], i) => interval(`r${i}`, s, e, 285, "done")),
  );
}

export const mergeIntervals: AlgoLesson = {
  id: "merge-intervals",
  title: "Merge Intervals",
  summary:
    "Sort ranges by start, then sweep once and fold every overlapping range into the previous one.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "Why sorting by start makes overlaps easy to see",
    "The one-line overlap test against the last merged range",
    "How the merged end is extended with a maximum",
    "The cost: O(n log n) for the sort, O(n) for the sweep",
  ],
  takeaways: [
    "After sorting by start, a range can only overlap the one merged range just before it, never anything further back.",
    "Two ranges overlap exactly when the next start is at most the current end; the merged end is the larger of the two ends.",
    "The sort dominates the cost, so the whole algorithm is O(n log n).",
  ],
  hud: [
    { label: "Input ranges", icon: "list" },
    { label: "Merged so far", icon: "layers" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "merge(ranges):",
    "    sort ranges by start",
    "    result = [ranges[0]]",
    "    for r in ranges[1:]:",
    "        last = result[-1]",
    "        if r.start <= last.end:",
    "            last.end = max(last.end, r.end)",
    "        else:",
    "            append r to result",
    "    return result",
  ],
  steps: [
    {
      short: "Problem",
      title: "Ranges that overlap",
      body: [
        "Five ranges sit on a number line, listed in no particular order. Merge every group that overlaps into a single range.",
        "Comparing each range with every other one is `O(n²)`. Sorting first lets us look at neighbours only.",
      ],
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Cost", value: "O(n²) naive", level: "warn" },
      ],
      scene: view(GIVEN, {}, [], "5 ranges, unsorted"),
    },
    {
      short: "Sort",
      title: "Sort by start",
      body: [
        "Reorder the ranges by their start value: `1–3`, `2–6`, `8–10`, `15–18`, `17–20`.",
        "Now any range that could overlap an earlier one starts no earlier than it does, so a left-to-right sweep sees overlaps as they appear.",
      ],
      callout: {
        kind: "insight",
        text: "Sorting turns 'does it overlap anything?' into 'does it overlap the last one?'.",
      },
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Cost", value: "O(n log n)", level: "good" },
      ],
      lines: [2],
      scene: view(SORTED, {}, [], "sorted by start"),
    },
    {
      short: "Start",
      title: "Seed the result",
      body: [
        "The first range, `1–3`, goes into the result list as it is. From here we compare every new range with the last one in that list.",
      ],
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Merged so far", value: "1", level: "good" },
      ],
      lines: [3],
      scene: view(SORTED, { A: "done" }, [[1, 3]], "result starts with 1–3"),
    },
    {
      short: "Overlap",
      title: "2–6 overlaps 1–3",
      body: [
        "The overlap test is `next.start <= last.end`. Here `2 <= 3` is true, so the ranges overlap.",
        "Merge by keeping the start and setting `last.end = max(last.end, next.end)`, which is `max(3, 6) = 6`. The result grows to `1–6`; nothing new is added.",
      ],
      callout: {
        kind: "warn",
        text: "Use `max` for the end. A range fully inside the last one (like 2–4 inside 1–6) must not shrink it.",
      },
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Merged so far", value: "1", level: "good" },
      ],
      lines: [4, 5, 6, 7],
      scene: view(SORTED, { A: "done", C: "active" }, [[1, 6]], "2 ≤ 3, so merge: end = max(3, 6)"),
    },
    {
      short: "Gap",
      title: "8–10 starts after 6",
      body: [
        "Test `8 <= 6`: false. There is a gap on the number line, and because everything left of `8` is already settled, nothing later can reach back across it.",
        "Append `8–10` as a new range in the result.",
      ],
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Merged so far", value: "2", level: "good" },
      ],
      lines: [6, 8, 9],
      scene: view(
        SORTED,
        { A: "done", C: "done", B: "active" },
        [
          [1, 6],
          [8, 10],
        ],
        "8 > 6, a gap: start a new range",
      ),
    },
    {
      short: "Gap again",
      title: "15–18 also starts a new range",
      body: [
        "`15 <= 10` is false, so `15–18` is appended. The sweep never goes back; it only ever looks at the last range in the result.",
      ],
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Merged so far", value: "3", level: "good" },
      ],
      lines: [6, 8, 9],
      scene: view(
        SORTED,
        { A: "done", C: "done", B: "done", D: "active" },
        [
          [1, 6],
          [8, 10],
          [15, 18],
        ],
        "15 > 10, start another",
      ),
    },
    {
      short: "Merge last",
      title: "17–20 stretches 15–18",
      body: [
        "`17 <= 18` is true, so the last two ranges overlap. The merged end is `max(18, 20) = 20`, turning `15–18` into `15–20`.",
        "The sweep is finished after one pass: three merged ranges from five inputs.",
      ],
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Merged so far", value: "3", level: "good" },
      ],
      lines: [6, 7],
      scene: view(
        SORTED,
        { A: "done", C: "done", B: "done", D: "done", E: "active" },
        [
          [1, 6],
          [8, 10],
          [15, 20],
        ],
        "17 ≤ 18, so merge: end = max(18, 20)",
      ),
    },
    {
      short: "Edge cases",
      title: "Touching ranges and nesting",
      body: [
        "Do `1–3` and `3–5` overlap? With `<=` they merge into `1–5`; with `<` they stay apart. Read the problem: whether a shared endpoint counts is a requirement, not a detail.",
        "Nesting is why the end uses `max`: `1–10` followed by `2–4` must stay `1–10`.",
      ],
      callout: {
        kind: "tip",
        text: "Always test empty input, one range, identical ranges and fully nested ranges.",
      },
      metrics: [
        { label: "Input ranges", value: "2" },
        { label: "Merged so far", value: "1", level: "good" },
      ],
      lines: [6, 7],
      scene: scene(
        label("t", 320, 20, "nested: 2–4 sits inside 1–10", { size: 13, weight: 800 }),
        interval("n1", 1, 10, 70, "active"),
        interval("n2", 2, 4, 110, "warn"),
        axis().map((l) => ({ ...l, y: 150 })),
        interval("n3", 1, 10, 195, "done"),
        label("n4", 320, 235, "result stays 1–10: max(10, 4) = 10", { size: 12, tone: "muted" }),
      ),
    },
    {
      short: "Recap",
      title: "Sort, then sweep",
      body: [
        "Sort by start in `O(n log n)`, then one pass in `O(n)` that compares each range with the last result entry. Extra space is `O(n)` for the output.",
        "The same sort-then-sweep shape solves meeting-room counting and inserting a new range into a sorted list.",
      ],
      metrics: [
        { label: "Input ranges", value: "5" },
        { label: "Merged so far", value: "3", level: "good" },
        { label: "Cost", value: "O(n log n)", level: "good" },
      ],
      scene: view(
        SORTED,
        { A: "done", C: "done", B: "done", D: "done", E: "done" },
        [
          [1, 6],
          [8, 10],
          [15, 20],
        ],
        "5 ranges became 3",
      ),
    },
  ],
};
