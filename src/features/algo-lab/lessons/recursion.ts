import { label, ptr, row, scene, stack } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

/** Frames of factorial(4) stacked bottom-up; `depth` frames exist and `returned` shows the unwound value. */
function frames(depth: number, o: { base?: boolean; value?: string; resolved?: number } = {}) {
  const names = ["fact(4)", "fact(3)", "fact(2)", "fact(1)"].slice(0, depth);
  const results = ["4 × ?", "3 × ?", "2 × ?", "1"];
  const text = names.map((n, i) =>
    o.resolved !== undefined && i >= o.resolved
      ? `${n} = ${["24", "6", "2", "1"][i]}`
      : `${n}  ${results[i]}`,
  );
  return scene(
    stack(text, {
      keys: names,
      x: 250,
      y: 262,
      w: 170,
      tones: (i): Tone | undefined =>
        i === depth - 1
          ? o.base
            ? "found"
            : "active"
          : o.resolved !== undefined && i >= o.resolved
            ? "done"
            : undefined,
    }),
    depth > 0 && ptr("top", `s${names[depth - 1]}`, "running", { side: "right", tone: "active" }),
    o.value && label("ret", 500, 140, o.value, { size: 15, weight: 800, tone: "good" }),
  );
}

export const recursion: AlgoLesson = {
  id: "recursion",
  title: "Recursion",
  summary: "A function that solves a problem by calling itself on a smaller piece of it.",
  minutes: 12,
  level: "beginner",
  goals: [
    "What a recursive function is",
    "Base case versus recursive case",
    "How the call stack grows and unwinds",
    "Why a missing base case overflows the stack",
  ],
  takeaways: [
    "A recursive function needs a base case that stops and a recursive case that moves toward it.",
    "Each call gets its own stack frame, so depth costs memory: factorial(n) uses O(n) stack space.",
    "Without a reachable base case the calls never stop and the stack overflows.",
  ],
  hud: [
    { label: "Depth", icon: "layers" },
    { label: "Calls", icon: "swap" },
    { label: "Result", icon: "check" },
  ],
  pseudocode: [
    "fact(n):",
    "    if n <= 1:                    # base case",
    "        return 1",
    "    else:                         # recursive case",
    "        smaller = fact(n - 1)",
    "        return n * smaller",
  ],
  steps: [
    {
      short: "Idea",
      title: "Solve it by shrinking it",
      body: [
        "`factorial(4)` means `4 × 3 × 2 × 1`. Notice that it equals `4 × factorial(3)`, and `factorial(3)` is the same kind of problem, just smaller.",
        "Recursion is that observation turned into code: a function that calls itself on a smaller input.",
      ],
      metrics: [
        { label: "Depth", value: "0" },
        { label: "Calls", value: "0" },
      ],
      scene: scene(
        label("l1", 320, 90, "4! = 4 × 3!", { size: 20, weight: 800 }),
        label("l2", 320, 140, "3! = 3 × 2!", { size: 20, weight: 800 }),
        label("l3", 320, 190, "2! = 2 × 1!", { size: 20, weight: 800 }),
        label("l4", 320, 240, "1! = 1", { size: 20, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Two cases",
      title: "The base case and the recursive case",
      body: [
        "Every recursive function has two parts. The base case answers the smallest input directly: `factorial(1)` is `1`. The recursive case reduces the problem: `n * factorial(n - 1)`.",
        "The base case is what makes the chain end.",
      ],
      callout: {
        kind: "tip",
        text: "Write the base case first, then ask 'does each call get closer to it?'",
      },
      metrics: [
        { label: "Depth", value: "0" },
        { label: "Calls", value: "0" },
      ],
      lines: [2, 3, 4, 5, 6],
      scene: scene(
        row(["n ≤ 1", "return 1"], { id: "b", x: 320, y: 100, w: 120, tones: () => "found" }),
        label("lb", 320, 150, "base case: stop", { tone: "good", weight: 800 }),
        row(["else", "n × fact(n−1)"], { id: "r", x: 320, y: 200, w: 140, tones: () => "active" }),
        label("lr", 320, 250, "recursive case: shrink and call again", { weight: 800 }),
      ),
    },
    {
      short: "Call 4",
      title: "fact(4) starts, then waits",
      body: [
        "The first call gets a stack frame holding `n = 4`. It cannot finish until it knows `fact(3)`, so it pauses and makes that call.",
        "The paused frame stays on the stack, remembering that it still has to multiply by 4.",
      ],
      metrics: [
        { label: "Depth", value: "1" },
        { label: "Calls", value: "1" },
      ],
      lines: [5],
      scene: frames(1),
    },
    {
      short: "Growing",
      title: "The stack grows with each call",
      body: [
        "`fact(3)` calls `fact(2)`, which calls `fact(1)`. Each call is pushed on top; the older ones sit waiting underneath, each with a multiplication pending.",
        "We are four frames deep and nothing has returned yet.",
      ],
      metrics: [
        { label: "Depth", value: "4", level: "warn" },
        { label: "Calls", value: "4" },
      ],
      lines: [5],
      scene: frames(4),
    },
    {
      short: "Base case",
      title: "fact(1) hits the base case",
      body: [
        "`n` is 1, so the base case fires: return `1` immediately, with no further call. This is the first frame to finish.",
      ],
      callout: {
        kind: "insight",
        text: "Until now no multiplication has happened. All the work happens on the way back.",
      },
      metrics: [
        { label: "Depth", value: "4", level: "warn" },
        { label: "Calls", value: "4" },
        { label: "Result", value: "1" },
      ],
      lines: [2, 3],
      scene: frames(4, { base: true, value: "returns 1" }),
    },
    {
      short: "Unwinding",
      title: "The stack unwinds",
      body: [
        "Popping `fact(1)` hands `1` to `fact(2)`, which computes `2 × 1 = 2` and returns. That gives `fact(3)` its `2`, so it computes `3 × 2 = 6`.",
        "Each frame resumes exactly where it paused, using the value it was waiting for.",
      ],
      metrics: [
        { label: "Depth", value: "2", level: "good" },
        { label: "Calls", value: "4" },
        { label: "Result", value: "6" },
      ],
      lines: [6],
      scene: frames(2, { value: "fact(3) returned 6" }),
    },
    {
      short: "Answer",
      title: "The last frame finishes",
      body: [
        "`fact(4)` receives `6` and computes `4 × 6 = 24`. The stack is empty and `24` goes back to whoever called.",
        "Four calls, four frames at the peak: time O(n) and stack space O(n).",
      ],
      metrics: [
        { label: "Depth", value: "0", level: "good" },
        { label: "Calls", value: "4" },
        { label: "Result", value: "24", level: "good" },
      ],
      lines: [6],
      scene: scene(
        label("done", 320, 140, "fact(4) = 24", { size: 28, weight: 800, tone: "good" }),
        label("cost", 320, 200, "4 calls, 4 frames deep at most", { tone: "muted" }),
      ),
    },
    {
      short: "No base",
      title: "Forget the base case and it never ends",
      body: [
        "If the base case is missing, or the argument never moves toward it (`fact(n)` calling `fact(n)`), calls keep stacking up.",
        "Memory for the call stack is limited, so eventually the program dies with a stack overflow.",
      ],
      callout: {
        kind: "warn",
        text: "Check every recursive path: does it shrink the input, and does it reach the base case?",
      },
      metrics: [
        { label: "Depth", value: "∞", level: "bad" },
        { label: "Result", value: "overflow", level: "bad" },
      ],
      lines: [2, 3],
      scene: scene(
        stack(["fact(n)", "fact(n)", "fact(n)", "fact(n)", "fact(n)"], {
          keys: ["a", "b", "c", "d", "e"],
          x: 250,
          y: 262,
          w: 150,
          h: 30,
          tones: (i): Tone => (i === 4 ? "warn" : "muted"),
        }),
        label("so", 480, 140, "STACK OVERFLOW", { size: 16, weight: 800, tone: "warn" }),
      ),
    },
    {
      short: "Recap",
      title: "Recursion in one rule",
      body: [
        "Trust the smaller call: assume `fact(n - 1)` is correct, and combine its result with the work for `n`. Stop at a base case that is always reached.",
        "Cost is roughly (number of calls) × (work per call) in time, and the maximum depth in stack space.",
      ],
      metrics: [
        { label: "Depth", value: "n" },
        { label: "Calls", value: "n" },
        { label: "Result", value: "O(n) time and space" },
      ],
      scene: scene(
        row(["base case", "shrink", "combine"], {
          w: 130,
          y: 130,
          tones: { 0: "found", 1: "active", 2: "done" },
        }),
        label("cap", 320, 210, "every recursive function needs all three", { weight: 800 }),
      ),
    },
  ],
};
