import { frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const NUMS = [1, 3, -1, -3, 5, 3, 6, 7];
const K = 3;
const W = 44;
const GAP = 6;
/** Centre x of cell j in the 8-cell array row (centred on x = 320). */
const cx = (j: number) =>
  320 - (NUMS.length * W + (NUMS.length - 1) * GAP) / 2 + W / 2 + j * (W + GAP);

/**
 * The array with the current window framed, the deque of indexes (value@index) below it, and the
 * maxima found so far. `i` is the newest index; the window is the K items ending there.
 */
function view(i: number, dq: number[], out: number[], note?: string) {
  const ws = Math.max(0, i - K + 1);
  return scene(
    i >= 0 &&
      frame("win", cx(ws) - W / 2 - 5, 38, (i - ws) * (W + GAP) + W + 10, 88, "window", {
        tone: "mark",
      }),
    row(NUMS, {
      x: 320,
      y: 84,
      w: W,
      gap: GAP,
      index: true,
      tones: (j) => (j === i ? "active" : j > i ? "muted" : undefined),
    }),
    label("ld", 20, 200, "deque", { anchor: "start", size: 12, tone: "muted" }),
    row(
      dq.map((k) => `${NUMS[k]}@${k}`),
      {
        x: 320,
        y: 200,
        w: 66,
        id: "d",
        keys: dq,
        tones: (j) => (j === 0 ? "found" : undefined),
      },
    ),
    dq.length > 0 && ptr("front", `d${dq[0]}`, "front", { side: "above", tone: "mark" }),
    dq.length > 0 &&
      ptr("back", `d${dq[dq.length - 1]}`, "back", { side: "below", tone: "active" }),
    label("out", 320, 285, out.length ? `max so far: ${out.join("  ")}` : "max so far: none", {
      size: 14,
      weight: 800,
      tone: out.length ? "good" : "muted",
    }),
    note && label("note", 320, 20, note, { size: 13, weight: 800 }),
  );
}

export const monotonicQueue: AlgoLesson = {
  id: "monotonic-queue",
  title: "Monotonic Queue",
  summary:
    "Sliding window maximum in O(n): a deque of indexes whose values stay in decreasing order.",
  minutes: 13,
  level: "advanced",
  goals: [
    "The sliding window maximum problem",
    "Why smaller earlier values can be thrown away",
    "The two removals: from the back and from the front",
    "Why each element costs O(1) overall",
  ],
  takeaways: [
    "Keep a deque of indexes whose values decrease, so the front is always the maximum of the window.",
    "A new value removes smaller ones from the back, and the front is dropped when its index leaves the window.",
    "Each index enters and leaves the deque once, so the whole scan is O(n).",
  ],
  hud: [
    { label: "Window", icon: "grid" },
    { label: "Deque size", icon: "layers" },
    { label: "Maxima found", icon: "check" },
    { label: "Work", icon: "timer" },
  ],
  pseudocode: [
    "windowMax(nums, k):",
    "    deque = empty",
    "    for i in 0 .. n - 1:",
    "        while deque not empty and nums[back] <= nums[i]:",
    "            popBack()",
    "        pushBack(i)",
    "        if front <= i - k: popFront()",
    "        if i >= k - 1: output nums[front]",
  ],
  steps: [
    {
      short: "The problem",
      title: "The maximum of every window",
      body: [
        "Slide a window of `k = 3` across `[1, 3, -1, -3, 5, 3, 6, 7]` and report the maximum of each position. The answers are `[3, 3, 5, 5, 6, 7]`.",
        "Scanning each window costs `O(n·k)`. We want to reuse the work from one window to the next.",
      ],
      metrics: [
        { label: "Window", value: "k = 3" },
        { label: "Deque size", value: "0", level: "good" },
        { label: "Maxima found", value: "0 of 6" },
        { label: "Work", value: "O(nk) naive", level: "warn" },
      ],
      scene: view(-1, [], []),
    },
    {
      short: "The idea",
      title: "Keep only candidates for the maximum",
      body: [
        "If a newer value is at least as big as an older one, the older value can never be a window maximum again: it leaves the window sooner and is smaller. So we can forget it.",
        "What remains is a deque of indexes whose values decrease from front to back. The front is the current maximum.",
      ],
      callout: {
        kind: "insight",
        text: "This is the monotonic stack idea with a second exit: old indexes also fall off the front when the window moves past them.",
      },
      metrics: [
        { label: "Window", value: "k = 3" },
        { label: "Deque size", value: "0", level: "good" },
        { label: "Maxima found", value: "0 of 6" },
        { label: "Work", value: "0" },
      ],
      scene: view(-1, [], [], "front = max of the window"),
    },
    {
      short: "Push 1",
      title: "The first value enters",
      body: [
        "`1` at index 0 goes into the empty deque. The window is not full yet, so there is no answer to report.",
      ],
      metrics: [
        { label: "Window", value: "0..0" },
        { label: "Deque size", value: "1", level: "good" },
        { label: "Maxima found", value: "0 of 6" },
        { label: "Work", value: "1 push" },
      ],
      lines: [3, 6],
      scene: view(0, [0], []),
    },
    {
      short: "3 beats 1",
      title: "A bigger value drops smaller ones",
      body: [
        "`3` arrives. The back of the deque is `1`, which is smaller, so it can never be a maximum while `3` is in the window: pop it from the back.",
        "Then push `3@1`. The values stay decreasing, and the front is the largest.",
      ],
      metrics: [
        { label: "Window", value: "0..1" },
        { label: "Deque size", value: "1", level: "good" },
        { label: "Maxima found", value: "0 of 6" },
        { label: "Work", value: "1 pop, 2 pushes" },
      ],
      lines: [4, 5, 6],
      scene: view(1, [1], []),
    },
    {
      short: "First max",
      title: "The window is full: read the front",
      body: [
        "`-1` is smaller than the back `3`, so it just joins behind it and may matter later. The window now covers indexes 0 to 2.",
        "The maximum is the front, `3`. Reading it costs one step.",
      ],
      metrics: [
        { label: "Window", value: "0..2" },
        { label: "Deque size", value: "2", level: "good" },
        { label: "Maxima found", value: "1 of 6" },
        { label: "Work", value: "O(1)" },
      ],
      lines: [8],
      scene: view(2, [1, 2], [3]),
    },
    {
      short: "Slide",
      title: "The window moves, the front stays",
      body: [
        "Index 3 holds `-3`, smaller than `-1`, so it is pushed. The window is now 1..3, and the front index 1 is still inside it.",
        "So the maximum is again `3`, with no scanning at all.",
      ],
      metrics: [
        { label: "Window", value: "1..3" },
        { label: "Deque size", value: "3", level: "warn" },
        { label: "Maxima found", value: "2 of 6" },
        { label: "Work", value: "O(1)" },
      ],
      lines: [6, 8],
      scene: view(3, [1, 2, 3], [3, 3]),
    },
    {
      short: "Expire",
      title: "Drop the front when it leaves",
      body: [
        "Next the window is 2..4, so index 1 is no longer inside. Its value `3` is still at the front and must not be reported: pop it from the front.",
        "Always check the front's index against the window's left edge before reading the maximum.",
      ],
      callout: {
        kind: "warn",
        text: "Store indexes, not values. Without the index you cannot tell when the front has expired.",
      },
      metrics: [
        { label: "Window", value: "2..4" },
        { label: "Deque size", value: "2", level: "good" },
        { label: "Maxima found", value: "2 of 6" },
        { label: "Work", value: "1 front pop" },
      ],
      lines: [7],
      scene: view(3, [2, 3], [3, 3], "index 1 left the window: drop the front"),
    },
    {
      short: "5 sweeps",
      title: "A new maximum clears the back",
      body: [
        "Index 4 holds `5`, bigger than `-3` and `-1`. Pop both from the back, then push `5@4`; it is alone in the deque.",
        "The window 2..4 has maximum `5`.",
      ],
      metrics: [
        { label: "Window", value: "2..4" },
        { label: "Deque size", value: "1", level: "good" },
        { label: "Maxima found", value: "3 of 6" },
        { label: "Work", value: "2 back pops" },
      ],
      lines: [4, 5, 6],
      scene: view(4, [4], [3, 3, 5]),
    },
    {
      short: "Finish",
      title: "Repeat to the end",
      body: [
        "`3` joins behind `5` (answer `5`), then `6` sweeps both out (answer `6`), then `7` sweeps `6` out (answer `7`). The deque ends as just `7@7`.",
        "All six answers are `[3, 3, 5, 5, 6, 7]`.",
      ],
      metrics: [
        { label: "Window", value: "5..7" },
        { label: "Deque size", value: "1", level: "good" },
        { label: "Maxima found", value: "6 of 6", level: "good" },
        { label: "Work", value: "≤ 2n" },
      ],
      lines: [4, 5, 6, 7, 8],
      scene: view(7, [7], [3, 3, 5, 5, 6, 7]),
    },
    {
      short: "Why O(n)",
      title: "Each index enters and leaves once",
      body: [
        "Every index is pushed once, and it leaves exactly once, either from the back by a bigger value or from the front by expiring. So total pops never exceed `n`.",
        "That makes the scan `O(n)` time, independent of `k`, with `O(k)` extra space since the deque never holds more than one window.",
      ],
      callout: {
        kind: "tip",
        text: "The same recipe handles a sliding window minimum: flip the comparison so values increase instead.",
      },
      metrics: [
        { label: "Window", value: "k" },
        { label: "Deque size", value: "≤ k", level: "good" },
        { label: "Maxima found", value: "n - k + 1", level: "good" },
        { label: "Work", value: "O(n)", level: "good" },
      ],
      lines: [5, 7],
      scene: scene(
        label("r1", 320, 90, "back: drop smaller values", { size: 15, weight: 800 }),
        label("r2", 320, 130, "front: drop an index that left the window", {
          size: 15,
          weight: 800,
        }),
        label("r3", 320, 170, "answer = value at the front", { size: 15, weight: 800 }),
        label("r4", 320, 230, "O(n) time, O(k) space", { size: 14, tone: "good", weight: 800 }),
      ),
    },
  ],
};
