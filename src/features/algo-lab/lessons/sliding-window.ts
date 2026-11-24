import { frame, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const A = [2, 1, 5, 1, 3, 2];
const K = 3;

/** Dashed frame around cells l..r of a default row of n cells (centred on x = 320, y = 150). */
function win(n: number, l: number, r: number, text: string, tone: Tone = "active"): Item {
  const left = 320 - (60 * n - 8) / 2 + 60 * l - 4;
  return frame("win", left, 118, (r - l + 1) * 60, 64, text, { tone });
}

/** Fixed window of K cells starting at `l`; `added`/`dropped` are the cells that just changed. */
function fixed(
  l: number,
  sum: number,
  best: number,
  note: string,
  added?: number,
  dropped?: number,
) {
  return scene(
    label("t", 320, 60, `best window of ${K} so far: ${best || "none"}`, { size: 14, weight: 800 }),
    row(A, {
      y: 150,
      index: true,
      tones: (i) =>
        i === added
          ? "found"
          : i === dropped
            ? "muted"
            : i >= l && i < l + K
              ? "active"
              : undefined,
    }),
    win(A.length, l, l + K - 1, `sum ${sum}`, sum === best && best > 8 ? "found" : "active"),
    label("note", 320, 250, note, { size: 14, weight: 800 }),
  );
}

const S = ["a", "b", "c", "b", "d"];

export const slidingWindow: AlgoLesson = {
  id: "sliding-window",
  title: "Sliding Window",
  summary:
    "Keep a frame over part of an array and update it by one element at a time instead of redoing it.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "What a window is and why it saves work",
    "Fixed-size window with a running total",
    "Variable-size window that grows and shrinks",
    "The cost compared with checking every subarray",
  ],
  takeaways: [
    "Moving a window by one means add the new element on the right and drop the old one on the left; no need to re-add the middle.",
    "A fixed window keeps a running total, a variable window grows on the right and shrinks from the left while a rule is broken.",
    "Both right and left edges only move forward, so the whole scan is O(n).",
  ],
  hud: [
    { label: "Window sum", icon: "sigma" },
    { label: "Best", icon: "check" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "maxWindowSum(a, k):",
    "    sum = a[0] + ... + a[k - 1]",
    "    best = sum",
    "    for r from k to n - 1:",
    "        sum = sum + a[r] - a[r - k]",
    "        best = max(best, sum)",
    "    return best",
    "longestUnique(s):",
    "    l = 0, best = 0",
    "    for r from 0 to n - 1:",
    "        while s[r] is already in window:",
    "            remove s[l] from window, l = l + 1",
    "        add s[r], best = max(best, r - l + 1)",
    "    return best",
  ],
  steps: [
    {
      short: "The problem",
      title: "Best 3 in a row",
      body: [
        "Given `2, 1, 5, 1, 3, 2`, find the largest sum of any 3 consecutive numbers.",
        "The direct way adds up each group of three from scratch. With window size k and n numbers that is about `n * k` additions, and most of them repeat work done a moment ago.",
      ],
      metrics: [{ label: "Cost", value: "O(n·k) naive", level: "warn" }],
      scene: scene(
        label("t", 320, 60, "largest sum of 3 consecutive numbers", { size: 14, weight: 800 }),
        row(A, { y: 150, index: true }),
      ),
    },
    {
      short: "First window",
      title: "Sum the first window once",
      body: [
        "Add the first three numbers: `2 + 1 + 5 = 8`. This is the only time we add from scratch.",
        "The dashed frame is the window. Record 8 as the best so far.",
      ],
      metrics: [
        { label: "Window sum", value: "8" },
        { label: "Best", value: "8", level: "good" },
      ],
      lines: [2, 3],
      scene: fixed(0, 8, 8, "2 + 1 + 5 = 8"),
    },
    {
      short: "Slide once",
      title: "Slide: add one, drop one",
      body: [
        "Move the window one step right. `1` at index 3 enters on the right and `2` at index 0 leaves on the left.",
        "Instead of re-adding, update the total: `8 + 1 - 2 = 7`. Two operations, however big the window is.",
      ],
      callout: {
        kind: "insight",
        text: "The two windows share all but one element, so only the difference needs computing.",
      },
      metrics: [
        { label: "Window sum", value: "7" },
        { label: "Best", value: "8", level: "good" },
      ],
      lines: [4, 5],
      scene: fixed(1, 7, 8, "8 + 1 - 2 = 7", 3, 0),
    },
    {
      short: "Slide again",
      title: "A new best",
      body: [
        "Slide again: `3` enters, `1` leaves. The sum is `7 + 3 - 1 = 9`.",
        "That beats 8, so the best becomes 9.",
      ],
      metrics: [
        { label: "Window sum", value: "9" },
        { label: "Best", value: "9", level: "good" },
      ],
      lines: [4, 5, 6],
      scene: fixed(2, 9, 9, "7 + 3 - 1 = 9: new best", 4, 1),
    },
    {
      short: "Last slide",
      title: "Reach the end",
      body: [
        "One more slide: `2` enters, `5` leaves, giving `9 + 2 - 5 = 6`. The window cannot go further, so the scan is over.",
        "The answer is 9, the window `5, 1, 3`. Each element entered once and left once.",
      ],
      callout: {
        kind: "warn",
        text: "Check the size: n numbers have only n - k + 1 windows. Sliding past the end is a classic off-by-one.",
      },
      metrics: [
        { label: "Window sum", value: "6" },
        { label: "Best", value: "9", level: "good" },
      ],
      lines: [4, 5, 6, 7],
      scene: fixed(3, 6, 9, "9 + 2 - 5 = 6", 5, 2),
    },
    {
      short: "The cost",
      title: "O(n) instead of O(n·k)",
      body: [
        "The first window costs k additions and every slide costs two operations, so the total is about `n` steps regardless of k.",
        "Space is `O(1)`: just the running total and the best. The idea works whenever you can update the answer by adding one element and removing one.",
      ],
      metrics: [
        { label: "Window sum", value: "6" },
        { label: "Best", value: "9", level: "good" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      scene: scene(
        label("a", 320, 90, "from scratch: n × k additions", {
          size: 14,
          tone: "warn",
          weight: 800,
        }),
        label("b", 320, 145, "sliding: about n updates", { size: 14, tone: "good", weight: 800 }),
        label("c", 320, 200, "add the entering value, subtract the leaving one", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
    {
      short: "Variable size",
      title: "A window that changes size",
      body: [
        "Now the window size is not fixed. Find the longest stretch of `abcbd` with no repeated letter.",
        "Keep a left and right edge. Extend the right edge one letter at a time while all letters in the window are distinct: `a`, `ab`, `abc`.",
      ],
      metrics: [
        { label: "Window sum", value: "len 3" },
        { label: "Best", value: "3", level: "good" },
      ],
      lines: [9, 10, 13],
      scene: scene(
        label("t", 320, 60, "longest substring without a repeat", { size: 14, weight: 800 }),
        row(S, {
          y: 150,
          index: true,
          tones: (i) => (i <= 2 ? "active" : undefined),
        }),
        win(S.length, 0, 2, "abc"),
        label("note", 320, 250, "grow right while all letters are different", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "Rule broken",
      title: "The next letter repeats",
      body: [
        "The right edge reaches index 3, a `b`. The window `abc` already holds a `b`, so including it breaks the rule.",
        "Time to shrink from the left until the earlier `b` is no longer inside.",
      ],
      callout: {
        kind: "tip",
        text: "A set or a count map of what is in the window answers 'is this a repeat?' in O(1).",
      },
      metrics: [
        { label: "Window sum", value: "len 4", level: "bad" },
        { label: "Best", value: "3", level: "good" },
      ],
      lines: [10, 11],
      scene: scene(
        label("t", 320, 60, "longest substring without a repeat", { size: 14, weight: 800 }),
        row(S, {
          y: 150,
          index: true,
          tones: (i) => (i === 3 ? "warn" : i === 1 ? "warn" : i <= 2 ? "active" : undefined),
        }),
        win(S.length, 0, 3, "b repeats", "warn"),
        label("note", 320, 250, "two b's inside: shrink from the left", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "Shrink, grow",
      title: "Drop from the left, then continue",
      body: [
        "Drop `a`, then drop `b`. The left edge is now at index 2 and the window `cb` is valid again. Then `d` at index 4 joins to make `cbd`.",
        "The best length stays 3. Each letter entered once and left at most once, so the whole scan is `O(n)` even though the window size varied.",
      ],
      callout: {
        kind: "insight",
        text: "Both edges only move right. That is why a loop inside a loop still costs O(n) in total.",
      },
      metrics: [
        { label: "Window sum", value: "len 3" },
        { label: "Best", value: "3", level: "good" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [11, 12, 13],
      scene: scene(
        label("t", 320, 60, "longest substring without a repeat", { size: 14, weight: 800 }),
        row(S, {
          y: 150,
          index: true,
          tones: (i) => (i >= 2 ? "active" : i < 2 ? "muted" : undefined),
        }),
        win(S.length, 2, 4, "cbd", "found"),
        label("note", 320, 250, "left moved 0 → 2, right moved to 4: length 3", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
