import { label, ptr, row, scene, stack } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const NUMS = [2, 1, 5, 3, 6, 4];

/**
 * nums on top, the stack of indexes (text value@index) on the right, answers underneath.
 * `ans[j]` is undefined until it is known; `fresh` marks answers settled in this step.
 */
function view(i: number, stk: number[], ans: (number | undefined)[], fresh: number[] = []) {
  return scene(
    label("ln", 54, 28, "nums", { anchor: "start", size: 12, tone: "muted" }),
    row(NUMS, {
      x: 230,
      y: 105,
      index: true,
      tones: (j) => (j === i ? "active" : j < i ? "done" : undefined),
    }),
    i >= 0 && i < NUMS.length && ptr("i", `a${i}`, "i", { side: "above", tone: "active" }),
    label("la", 54, 190, "answers: next greater to the right", {
      anchor: "start",
      size: 12,
      tone: "muted",
    }),
    row(
      NUMS.map((_, j) => (ans[j] === undefined ? "?" : String(ans[j]))),
      {
        x: 230,
        y: 230,
        id: "r",
        tones: (j) => (fresh.includes(j) ? "found" : ans[j] === undefined ? "muted" : "done"),
      },
    ),
    stack(
      stk.map((k) => `${NUMS[k]}@${k}`),
      {
        x: 540,
        y: 250,
        w: 70,
        keys: stk.map((k) => `i${k}`),
        tones: (k) => (k === stk.length - 1 ? "active" : undefined),
      },
    ),
    label("ls", 540, 270, "stack of indexes", { size: 12, tone: "muted" }),
    stk.length === 0 && label("none", 540, 225, "empty", { size: 13, tone: "muted" }),
  );
}

export const monotonicStack: AlgoLesson = {
  id: "monotonic-stack",
  title: "Monotonic Stack",
  summary:
    "Find the next greater element for every position in one pass with a stack that stays sorted.",
  minutes: 13,
  level: "advanced",
  goals: [
    "The next-greater-element problem",
    "Why the stack holds indexes whose values decrease",
    "How a pop records an answer",
    "Why the whole pass is O(n) despite the inner loop",
  ],
  takeaways: [
    "Keep a stack of indexes still waiting for a greater value, with values decreasing from bottom to top.",
    "When a new value is bigger than the top, it is that element's answer: pop, record, and repeat.",
    "Every index is pushed once and popped at most once, so the total work is O(n).",
  ],
  hud: [
    { label: "Index", icon: "search" },
    { label: "Stack size", icon: "layers" },
    { label: "Answers set", icon: "check" },
    { label: "Pops", icon: "swap" },
  ],
  pseudocode: [
    "nextGreater(nums):",
    "    stack = empty; answer = [-1, -1, ..., -1]",
    "    for i in 0 .. n - 1:",
    "        while stack not empty and nums[top] < nums[i]:",
    "            answer[pop()] = nums[i]",
    "        push(i)",
    "    return answer",
  ],
  steps: [
    {
      short: "The problem",
      title: "For each number, the next greater one",
      body: [
        "For every element, find the first element to its right that is strictly larger, or -1 if none exists. For `[2, 1, 5, 3, 6, 4]` the answers are `[5, 5, 6, 6, -1, -1]`.",
        "Scanning right from each position works but costs `O(n²)` on a falling sequence. We want one pass.",
      ],
      metrics: [
        { label: "Index", value: "—" },
        { label: "Stack size", value: "0", level: "good" },
        { label: "Answers set", value: "0 of 6" },
        { label: "Pops", value: "0" },
      ],
      scene: view(-1, [], []),
    },
    {
      short: "The idea",
      title: "A waiting list of unanswered indexes",
      body: [
        "Walk left to right. Keep a stack of indexes whose next greater value has not appeared yet. They are all still waiting.",
        "A newcomer that is larger than the top answers it. So the waiting values must be decreasing: a bigger one below could never be answered by a smaller one above it.",
      ],
      callout: {
        kind: "insight",
        text: "'Monotonic' is the invariant: values on the stack decrease from bottom to top, always.",
      },
      metrics: [
        { label: "Index", value: "—" },
        { label: "Stack size", value: "0", level: "good" },
        { label: "Answers set", value: "0 of 6" },
        { label: "Pops", value: "0" },
      ],
      scene: view(-1, [], []),
    },
    {
      short: "Push 2, 1",
      title: "Smaller values just wait",
      body: [
        "`2` has no one to compare with, so its index goes on the stack. Then `1` is not greater than `2`, so it cannot answer it; `1` also waits on top.",
        "The stack holds `2@0` and `1@1`: decreasing, as required.",
      ],
      metrics: [
        { label: "Index", value: "1" },
        { label: "Stack size", value: "2", level: "good" },
        { label: "Answers set", value: "0 of 6" },
        { label: "Pops", value: "0" },
      ],
      lines: [3, 6],
      scene: view(1, [0, 1], []),
    },
    {
      short: "5 pops 1",
      title: "A bigger value answers the top",
      body: [
        "`5` arrives and is greater than the top, `1@1`. So the next greater of index 1 is `5`: pop it and write the answer.",
        "Popping is how an answer is recorded. We compare again with the new top.",
      ],
      metrics: [
        { label: "Index", value: "2" },
        { label: "Stack size", value: "1", level: "good" },
        { label: "Answers set", value: "1 of 6" },
        { label: "Pops", value: "1" },
      ],
      lines: [4, 5],
      scene: view(2, [0], [undefined, 5], [1]),
    },
    {
      short: "5 pops 2",
      title: "Keep popping while it is bigger",
      body: [
        "`5` is also greater than `2@0`, so index 0 gets the answer `5` too and is popped. The stack is empty, so `5` stops popping.",
        "Now push `5@2`. The stack is never allowed to keep a smaller value under a bigger one.",
      ],
      callout: {
        kind: "tip",
        text: "The loop is `while stack not empty and nums[top] < x`, then push. Use `<` for strictly greater, `<=` for the other variants.",
      },
      metrics: [
        { label: "Index", value: "2" },
        { label: "Stack size", value: "1", level: "good" },
        { label: "Answers set", value: "2 of 6" },
        { label: "Pops", value: "2" },
      ],
      lines: [4, 5],
      scene: view(2, [2], [5, 5], [0]),
    },
    {
      short: "Push 3",
      title: "A smaller value waits again",
      body: [
        "`3` is less than the top `5@2`, so it answers nothing and is pushed. The stack is `5@2`, `3@3`: decreasing.",
      ],
      metrics: [
        { label: "Index", value: "3" },
        { label: "Stack size", value: "2", level: "good" },
        { label: "Answers set", value: "2 of 6" },
        { label: "Pops", value: "2" },
      ],
      lines: [6],
      scene: view(3, [2, 3], [5, 5]),
    },
    {
      short: "6 clears",
      title: "A big value clears the stack",
      body: [
        "`6` beats `3@3`, then `5@2`. Both get the answer `6` and are popped, and then `6@4` is pushed.",
        "One large element resolved two waiting ones at once: the loop runs longer here, but each element it pops is gone for good.",
      ],
      metrics: [
        { label: "Index", value: "4" },
        { label: "Stack size", value: "1", level: "good" },
        { label: "Answers set", value: "4 of 6" },
        { label: "Pops", value: "4" },
      ],
      lines: [4, 5, 6],
      scene: view(4, [4], [5, 5, 6, 6], [2, 3]),
    },
    {
      short: "Push 4",
      title: "The last element waits too",
      body: [
        "`4` is smaller than `6@4`, so it is pushed. The stack is `6@4`, `4@5`.",
        "The input is finished and those two never met anything bigger.",
      ],
      metrics: [
        { label: "Index", value: "5" },
        { label: "Stack size", value: "2", level: "good" },
        { label: "Answers set", value: "4 of 6" },
        { label: "Pops", value: "4" },
      ],
      lines: [6],
      scene: view(5, [4, 5], [5, 5, 6, 6]),
    },
    {
      short: "Leftovers",
      title: "What is left gets -1",
      body: [
        "Indexes still on the stack have no greater element to their right. Give each `-1`.",
        "The final answers are `[5, 5, 6, 6, -1, -1]`, matching the brute force.",
      ],
      callout: {
        kind: "warn",
        text: "Forgetting the leftovers is a common bug. Either pre-fill the answers with -1 or drain the stack at the end.",
      },
      metrics: [
        { label: "Index", value: "end" },
        { label: "Stack size", value: "0", level: "good" },
        { label: "Answers set", value: "6 of 6", level: "good" },
        { label: "Pops", value: "4" },
      ],
      lines: [7],
      scene: view(6, [], [5, 5, 6, 6, -1, -1], [4, 5]),
    },
    {
      short: "Why O(n)",
      title: "A loop inside a loop, still linear",
      body: [
        "The inner `while` looks like it could make this quadratic, but count pushes and pops instead. Each index is pushed exactly once and popped at most once.",
        "That is at most `2n` stack operations in total, so the time is `O(n)`, and the stack uses `O(n)` space in the worst case.",
      ],
      callout: {
        kind: "insight",
        text: "This is amortised analysis: one pop can be expensive, but the total number of pops can never exceed the number of pushes.",
      },
      metrics: [
        { label: "Index", value: "n" },
        { label: "Stack size", value: "≤ n", level: "warn" },
        { label: "Answers set", value: "n of n", level: "good" },
        { label: "Pops", value: "≤ n", level: "good" },
      ],
      lines: [4, 5, 6],
      scene: scene(
        label("r1", 320, 90, "each index: pushed once, popped at most once", {
          size: 15,
          weight: 800,
        }),
        label("r2", 320, 130, "total work ≤ 2n stack operations", { size: 15, weight: 800 }),
        label("r3", 320, 190, "O(n) time, O(n) space", { size: 14, tone: "good", weight: 800 }),
      ),
    },
  ],
};
