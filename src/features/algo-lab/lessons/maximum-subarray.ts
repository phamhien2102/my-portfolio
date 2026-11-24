import { frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const A = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

/** Kadane's state after looking at indexes 0..i: the running run, and the best run seen so far. */
function state(i: number) {
  let cur = 0;
  let s = 0;
  let best = -Infinity;
  let bs = 0;
  let be = 0;
  for (let j = 0; j <= i; j++) {
    if (j === 0 || cur < 0) {
      cur = A[j];
      s = j;
    } else {
      cur += A[j];
    }
    if (cur > best) {
      best = cur;
      bs = j === 0 ? 0 : s;
      be = j;
    }
  }
  return { cur, s, best, bs, be };
}

/** The array with the current run framed; `final` instead frames the best run in green. */
function view(i: number, final = false) {
  const { cur, s, best, bs, be } = state(i);
  const from = final ? bs : s;
  const to = final ? be : i;
  return scene(
    label("cur", 170, 55, `best sum ending here: ${cur}`, { size: 13, weight: 800 }),
    label("best", 470, 55, `best overall: ${best}`, { size: 13, weight: 800, tone: "good" }),
    row(A, {
      y: 150,
      index: true,
      tones: (j) =>
        final
          ? j >= bs && j <= be
            ? "found"
            : "muted"
          : j > i
            ? undefined
            : j >= s
              ? "active"
              : "muted",
    }),
    frame("run", 54 + 60 * from - 4, 118, (to - from + 1) * 60, 64, undefined, {
      tone: final ? "found" : "mark",
    }),
    !final && ptr("i", `a${i}`, "i"),
  );
}

export const maximumSubarray: AlgoLesson = {
  id: "maximum-subarray",
  title: "Maximum Subarray",
  summary:
    "Kadane's algorithm finds the best contiguous run in one pass by tracking the best run ending here.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "What a contiguous subarray is and why brute force is slow",
    "The two numbers Kadane's algorithm carries",
    "When to extend the current run and when to restart",
    "Why one pass and O(1) memory are enough",
  ],
  takeaways: [
    "At each index the best run ending there is either the element alone or the element added to the best run ending just before it.",
    "A running sum that has gone negative can only hurt whatever comes next, so drop it and restart.",
    "Keeping a separate best-so-far makes the answer correct even when the best run is not at the end.",
  ],
  hud: [
    { label: "Run sum", icon: "sigma" },
    { label: "Best so far", icon: "check" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "maxSubarray(a):",
    "    cur = best = a[0]",
    "    for x in a[1:]:",
    "        if cur < 0:",
    "            cur = x",
    "        else:",
    "            cur = cur + x",
    "        best = max(best, cur)",
    "    return best",
  ],
  steps: [
    {
      short: "Problem",
      title: "Find the richest stretch",
      body: [
        "Given nine numbers, some negative, pick a run of neighbouring elements (no gaps) whose sum is as large as possible.",
        "Trying every start and end pair costs `O(n²)` pairs, or worse if each sum is recomputed. One careful left-to-right pass can do it in `O(n)`.",
      ],
      metrics: [{ label: "Cost", value: "O(n²) naive", level: "warn" }],
      scene: scene(
        label("t", 320, 60, "largest sum of a contiguous run?", { size: 14, weight: 800 }),
        row(A, { y: 150, index: true }),
      ),
    },
    {
      short: "Two numbers",
      title: "Carry two numbers",
      body: [
        "Walk the array once and keep `cur`, the best sum of a run that ends at the current index, and `best`, the largest `cur` seen anywhere so far.",
        "At index `0` the only run ending there is the element itself, so `cur = -2` and `best = -2`.",
      ],
      callout: {
        kind: "insight",
        text: "Asking 'best run ending here' turns a global question into a tiny local one.",
      },
      metrics: [
        { label: "Run sum", value: "-2", level: "bad" },
        { label: "Best so far", value: "-2", level: "bad" },
      ],
      lines: [2],
      scene: view(0),
    },
    {
      short: "Restart",
      title: "A negative run is dead weight",
      body: [
        "Next is `1`. The previous run sums to `-2`, and adding `-2` to anything only makes it smaller. So we restart: `cur = max(1, -2 + 1)` is just `1`.",
        "The old run is dropped (faded) and `best` becomes `1`.",
      ],
      callout: {
        kind: "tip",
        text: "Restart exactly when the sum before this element is below zero.",
      },
      metrics: [
        { label: "Run sum", value: "1", level: "good" },
        { label: "Best so far", value: "1", level: "good" },
      ],
      lines: [3, 4, 5, 8],
      scene: view(1),
    },
    {
      short: "Extend",
      title: "Extending can shrink the sum",
      body: [
        "The previous run sums to `1`, which is not negative, so we extend: `cur = 1 + (-3) = -2`.",
        "That is worse than before, but `best` stays `1` because it remembers the peak. This is why we keep two numbers.",
      ],
      metrics: [
        { label: "Run sum", value: "-2", level: "bad" },
        { label: "Best so far", value: "1", level: "good" },
      ],
      lines: [3, 6, 7, 8],
      scene: view(2),
    },
    {
      short: "Restart 2",
      title: "Restart on the 4",
      body: [
        "The run ending at index 2 is `-2`, negative again, so it is thrown away. `cur = 4` starts a fresh run at index `3`.",
        "`4` beats the old best of `1`, so `best = 4`.",
      ],
      metrics: [
        { label: "Run sum", value: "4", level: "good" },
        { label: "Best so far", value: "4", level: "good" },
      ],
      lines: [3, 4, 5, 8],
      scene: view(3),
    },
    {
      short: "Grow",
      title: "Positive runs keep growing",
      body: [
        "Indexes `4`, `5` and `6` add `-1`, `2` and `1`, giving running sums `3`, `5` and `6`. Each time the previous sum was positive, so we extend.",
        "At index `6` the run `4, -1, 2, 1` sums to `6`, a new best. A small dip (`-1`) was worth paying for the `2` and `1` behind it.",
      ],
      callout: {
        kind: "insight",
        text: "A negative element does not end a run; only a negative running sum does.",
      },
      metrics: [
        { label: "Run sum", value: "6", level: "good" },
        { label: "Best so far", value: "6", level: "good" },
      ],
      lines: [3, 6, 7, 8],
      scene: view(6),
    },
    {
      short: "The tail",
      title: "Late values cannot beat 6",
      body: [
        "Index `7` adds `-5`, dropping the run to `1`. Index `8` adds `4`, giving `5`. Both are below `best = 6`, so `best` does not change.",
        "The current run ends at the last element, but the best run does not. Returning `cur` would be a bug; return `best`.",
      ],
      callout: {
        kind: "warn",
        text: "Never return the final `cur`. The winner may be in the middle.",
      },
      metrics: [
        { label: "Run sum", value: "5", level: "warn" },
        { label: "Best so far", value: "6", level: "good" },
      ],
      lines: [8, 9],
      scene: view(8),
    },
    {
      short: "Answer",
      title: "The best run is 4, -1, 2, 1",
      body: [
        "To report the run itself, remember where the current run started and copy that start and the current index whenever `best` improves. Here that gives indexes `3` to `6`, sum `6`.",
        "If every number is negative the best run is the single largest element, and the algorithm handles it because a restart always takes the element alone.",
      ],
      metrics: [
        { label: "Run sum", value: "5" },
        { label: "Best so far", value: "6", level: "good" },
      ],
      lines: [9],
      scene: view(8, true),
    },
    {
      short: "Cost",
      title: "One pass, constant memory",
      body: [
        "Each element is visited once and updates two variables, so the time is `O(n)` and the extra space is `O(1)`.",
        "The rule per element is `cur = max(x, cur + x)`, then `best = max(best, cur)`.",
      ],
      callout: {
        kind: "tip",
        text: "Dynamic programming in disguise: `cur` is the table entry, and only the previous one is ever needed.",
      },
      metrics: [
        { label: "Run sum", value: "O(1) space" },
        { label: "Best so far", value: "6", level: "good" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [3, 4, 5, 6, 7, 8],
      scene: scene(
        label("r1", 320, 100, "cur = max(x, cur + x)", { size: 16, weight: 800 }),
        label("r2", 320, 145, "best = max(best, cur)", { size: 16, weight: 800, tone: "good" }),
        label("r3", 320, 200, "O(n) time, O(1) extra space", { size: 13, tone: "muted" }),
      ),
    },
  ],
};
