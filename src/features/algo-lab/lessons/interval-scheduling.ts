import { cell, label, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

type Meeting = { name: string; s: number; e: number };

// Listed already sorted by end time.
const M: Meeting[] = [
  { name: "A", s: 1, e: 4 },
  { name: "B", s: 3, e: 5 },
  { name: "C", s: 0, e: 6 },
  { name: "D", s: 5, e: 7 },
  { name: "E", s: 3, e: 9 },
  { name: "F", s: 8, e: 11 },
];

const X0 = 60;
const UNIT = 40;
const xAt = (t: number) => X0 + t * UNIT;

/** Meetings drawn as bars on a time axis, one row each, plus the axis ticks. */
function timeline(
  meetings: Meeting[],
  tones: Record<string, Tone>,
  y0 = 50,
  step = 34,
  prefix = "m",
) {
  const maxT = Math.max(...meetings.map((m) => m.e));
  const axisY = y0 + meetings.length * step + 8;
  const ticks = Array.from({ length: Math.floor(maxT / 2) + 1 }, (_, i) =>
    label(`${prefix}tick${i}`, xAt(i * 2), axisY, String(i * 2), {
      size: 11,
      tone: "muted",
    }),
  );
  return [
    ...meetings.map((m, i) =>
      cell(`${prefix}${m.name}`, xAt((m.s + m.e) / 2), y0 + i * step, m.name, {
        w: (m.e - m.s) * UNIT - 4,
        h: 26,
        tone: tones[m.name],
        sub: `${m.s}-${m.e}`,
      }),
    ),
    ...ticks,
  ];
}

/** The main example with a decision for each meeting and a running summary. */
function view(taken: string[], skipped: string[], current?: string, note?: string) {
  const tones: Record<string, Tone> = {};
  taken.forEach((n) => (tones[n] = "found"));
  skipped.forEach((n) => (tones[n] = "muted"));
  if (current) tones[current] = "active";
  const last = taken.length ? M.find((m) => m.name === taken[taken.length - 1])!.e : 0;
  return scene(
    timeline(M, tones, 40, 36),
    label("end", 320, 292, `last taken ends at ${taken.length ? last : "-"}`, {
      size: 13,
      weight: 800,
    }),
    note && label("note", 320, 316, note, { size: 12, tone: "muted" }),
  );
}

export const intervalScheduling: AlgoLesson = {
  id: "interval-scheduling",
  title: "Interval Scheduling",
  summary:
    "Fit the most non-overlapping meetings into one room by always picking the earliest finish.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "What the interval scheduling problem asks",
    "Why sorting by end time makes the greedy choice safe",
    "How to run the scan with a single last-end variable",
    "Why earliest-start and shortest-first both fail",
  ],
  takeaways: [
    "Sort by end time, then take every meeting that starts at or after the end of the last one you took.",
    "Finishing early leaves the most room for what comes next, so the earliest finish can never hurt.",
    "A greedy rule needs a proof: earliest-start and shortest-first sound reasonable but have simple counterexamples.",
  ],
  hud: [
    { label: "Taken", icon: "check" },
    { label: "Skipped", icon: "alert" },
    { label: "Last end", icon: "hourglass" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "schedule(meetings):",
    "    sort meetings by end time",
    "    lastEnd = -infinity",
    "    chosen = []",
    "    for m in meetings:",
    "        if m.start >= lastEnd:",
    "            add m to chosen",
    "            lastEnd = m.end",
    "    return chosen",
  ],
  steps: [
    {
      short: "The problem",
      title: "One room, many requests",
      body: [
        "Six meetings want the same room. Each has a start and an end time, drawn here as a bar on the time axis. Two meetings cannot share the room if their bars overlap.",
        "The goal is to hold as many meetings as possible. Meeting `C` is the longest, `A` and `B` are short, and several of them overlap.",
      ],
      metrics: [
        { label: "Taken", value: "0" },
        { label: "Skipped", value: "0" },
        { label: "Last end", value: "-" },
      ],
      scene: view([], [], undefined, "choose a set of bars that never overlap"),
    },
    {
      short: "Sort by end",
      title: "The greedy rule: earliest end first",
      body: [
        "Sort the meetings by their end time. The meeting that finishes first is the one that blocks the room for the shortest time.",
        "Then scan once. Keep a single number, `lastEnd`, and take a meeting only if its start is at least `lastEnd`.",
      ],
      callout: {
        kind: "insight",
        text: "Ending early is what matters. Everything after the chosen meeting keeps the biggest possible window.",
      },
      metrics: [
        { label: "Taken", value: "0" },
        { label: "Cost", value: "O(n log n)", level: "good" },
      ],
      lines: [2, 3],
      scene: view([], [], undefined, "rows are already sorted by end time: 4, 5, 6, 7, 9, 11"),
    },
    {
      short: "Take A",
      title: "A ends first, so take it",
      body: [
        "`A` runs from 1 to 4 and is first in the order. Nothing has been taken yet, so `lastEnd` is empty and `A` fits.",
        "Set `lastEnd = 4`. From now on a meeting must start at 4 or later.",
      ],
      metrics: [
        { label: "Taken", value: "1", level: "good" },
        { label: "Skipped", value: "0" },
        { label: "Last end", value: "4" },
      ],
      lines: [5, 6, 7, 8],
      scene: view(["A"], []),
    },
    {
      short: "Skip B",
      title: "B starts too early",
      body: [
        "`B` runs from 3 to 5. It starts at 3, before `lastEnd = 4`, so it would overlap `A`. Skip it.",
        "Skipping costs nothing: `B` could replace `A` at best, never add to it.",
      ],
      metrics: [
        { label: "Taken", value: "1", level: "good" },
        { label: "Skipped", value: "1", level: "warn" },
        { label: "Last end", value: "4" },
      ],
      lines: [5, 6],
      scene: view(["A"], [], "B", "B starts at 3, which is before 4: overlap"),
    },
    {
      short: "Skip C",
      title: "The long meeting does not fit either",
      body: [
        "`C` starts at 0, long before `lastEnd = 4`. It is the biggest meeting, but it overlaps `A` and would hog the room until 6.",
      ],
      callout: {
        kind: "tip",
        text: "The scan never looks backwards. One comparison with `lastEnd` decides each meeting.",
      },
      metrics: [
        { label: "Taken", value: "1", level: "good" },
        { label: "Skipped", value: "2", level: "warn" },
        { label: "Last end", value: "4" },
      ],
      lines: [5, 6],
      scene: view(["A"], ["B"], "C", "C starts at 0, which is before 4: overlap"),
    },
    {
      short: "Take D",
      title: "D starts after A ended",
      body: [
        "`D` runs from 5 to 7. It starts at 5, which is at least `lastEnd = 4`, so it fits. Take it and set `lastEnd = 7`.",
        "A meeting that starts exactly when the last one ends is allowed: the room is free at that instant.",
      ],
      metrics: [
        { label: "Taken", value: "2", level: "good" },
        { label: "Skipped", value: "2", level: "warn" },
        { label: "Last end", value: "7" },
      ],
      lines: [5, 6, 7, 8],
      scene: view(["A", "D"], ["B", "C"]),
    },
    {
      short: "Skip E, take F",
      title: "Skip E, then take F",
      body: [
        "`E` starts at 3, before 7, so skip it. `F` starts at 8, which is after 7, so take it.",
        "The scan is done after one pass: `A`, `D` and `F` are three meetings that never overlap.",
      ],
      chapter: { label: "Result", tone: "green" },
      metrics: [
        { label: "Taken", value: "3", level: "good" },
        { label: "Skipped", value: "3", level: "warn" },
        { label: "Last end", value: "11" },
      ],
      lines: [5, 6, 7, 8, 9],
      scene: view(["A", "D", "F"], ["B", "C", "E"], undefined, "3 meetings: A, D, F"),
    },
    {
      short: "Earliest start",
      title: "Why not pick the earliest start?",
      body: [
        "Starting at the beginning of the day feels natural. Take `C` because it starts at 0. Now `A`, `B`, `D` and `E` all overlap it, and only `F` is left.",
        "That gives two meetings, `C` and `F`, where the end-time rule found three. One early, very long meeting wrecked the schedule.",
      ],
      callout: {
        kind: "warn",
        text: "Earliest start ignores how long a meeting blocks the room.",
      },
      metrics: [
        { label: "Taken", value: "2", level: "bad" },
        { label: "Skipped", value: "4", level: "bad" },
        { label: "Last end", value: "11" },
      ],
      scene: view(
        ["C", "F"],
        ["A", "B", "D", "E"],
        undefined,
        "earliest-start picks C then F: only 2",
      ),
    },
    {
      short: "Shortest first",
      title: "Why not pick the shortest?",
      body: [
        "Shortest-first fails too. Here `X` is the shortest bar, but it sits across the gap between `Y` and `Z`, which do not overlap each other.",
        "Taking `X` first blocks both, leaving one meeting instead of two. Only the end-time rule is safe on both examples.",
      ],
      metrics: [
        { label: "Taken", value: "1", level: "bad" },
        { label: "Skipped", value: "2", level: "bad" },
      ],
      scene: scene(
        timeline(
          [
            { name: "Y", s: 0, e: 4 },
            { name: "X", s: 3, e: 6 },
            { name: "Z", s: 5, e: 9 },
          ],
          { X: "warn", Y: "muted", Z: "muted" },
          70,
          40,
          "q",
        ),
        label("qn", 320, 250, "shortest-first takes X and loses both Y and Z", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Recap",
      title: "Why it works, and what it costs",
      body: [
        "Exchange argument: any best schedule can swap its first meeting for the one that ends earliest without causing an overlap. So taking the earliest finish is always part of some best answer, and the rest is the same problem on what remains.",
        "Sorting costs `O(n log n)` and the scan is `O(n)`. Extra space is one variable, `lastEnd`.",
      ],
      chapter: { label: "Recap", tone: "ink" },
      metrics: [
        { label: "Taken", value: "3", level: "good" },
        { label: "Cost", value: "O(n log n)", level: "good" },
      ],
      scene: view(["A", "D", "F"], ["B", "C", "E"], undefined, "sort by end, then take what fits"),
    },
  ],
};
