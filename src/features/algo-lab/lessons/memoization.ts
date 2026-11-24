import { label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

// The call tree of fib(4), level order. Index 2 and 3 are both fib(2); 4, 5, 7 are all fib(1).
const NAIVE = ["f4", "f3", "f2", "f2", "f1", "f1", "f0", "f1", "f0"];
// The same walk with a cache: once a value is stored, asking for it again ends the branch.
const MEMO = ["f4", "f3", "f2", "f2", "f1", null, null, "f1", "f0"];

interface View {
  shape: (string | null)[];
  tones?: Record<number, Tone>;
  /** Cache contents for n = 0..4; null is an empty slot. */
  memo?: (number | null)[];
  memoTones?: Record<number, Tone>;
  caption?: string;
}

/** The call tree on top, the cache row underneath, one sentence at the bottom. */
function view({ shape, tones, memo, memoTones, caption }: View) {
  return scene(
    tree(shape, { x: 320, y: 40, width: 440, dy: 54, r: 19, tones }),
    memo && [
      label("cache", 150, 270, "cache", { anchor: "end", size: 13, tone: "muted", weight: 800 }),
      row(
        memo.map((v) => v ?? ""),
        {
          y: 270,
          index: true,
          tones: memoTones,
          empty: memo.flatMap((v, i) => (v === null ? [i] : [])),
        },
      ),
    ],
    caption && label("cap", 320, 335, caption, { size: 13, weight: 800 }),
  );
}

export const memoization: AlgoLesson = {
  id: "memoization",
  title: "Memoization",
  summary:
    "Remember the answer to every subproblem so a recursive function never solves one twice.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "Why naive recursion can repeat the same work",
    "How a call tree exposes overlapping subproblems",
    "How a cache turns exponential time into linear time",
    "What state a memoized function needs",
  ],
  takeaways: [
    "When the same subproblem is asked many times, store its answer the first time and reuse it.",
    "Memoization keeps the recursive shape of the solution and only adds a lookup before and a store after.",
    "Naive Fibonacci makes an exponential number of calls; with a cache it makes about one real computation per n.",
  ],
  hud: [
    { label: "Calls", icon: "branch" },
    { label: "Cache hits", icon: "check" },
    { label: "Time", icon: "timer" },
  ],
  pseudocode: [
    "fib(n):",
    "    if n <= 1:",
    "        return n",
    "    if memo[n] is filled:",
    "        return memo[n]",
    "    result = fib(n - 1) + fib(n - 2)",
    "    memo[n] = result",
    "    return result",
  ],
  steps: [
    {
      short: "The problem",
      title: "Fibonacci as a recursion",
      body: [
        "`fib(n)` is `n` when `n` is 0 or 1, and otherwise `fib(n - 1) + fib(n - 2)`. Writing that down as a function is a few lines.",
        "To see what the computer actually does, draw every call as a node and every recursive call as a child. This is the call tree of `fib(4)`.",
      ],
      metrics: [{ label: "Calls", value: "9", level: "warn" }],
      scene: view({
        shape: NAIVE,
        caption: "fib(n) = fib(n-1) + fib(n-2)",
      }),
    },
    {
      short: "Repeats",
      title: "The same subproblem, again",
      body: [
        "`f2` appears twice in this tree: once under `f3` and once directly under `f4`. Each copy re-does exactly the same work below it.",
        "`f1` shows up three times and `f0` twice. The tree is mostly copies of smaller trees we already built.",
      ],
      callout: {
        kind: "insight",
        text: "Overlapping subproblems are the signal. If a recursion asks the same question repeatedly, its answer can be stored.",
      },
      metrics: [
        { label: "Calls", value: "9", level: "warn" },
        { label: "Cache hits", value: "0", level: "bad" },
      ],
      lines: [6],
      scene: view({
        shape: NAIVE,
        tones: { 2: "warn", 3: "warn" },
        caption: "fib(2) is solved twice",
      }),
    },
    {
      short: "Blow-up",
      title: "Repeats multiply",
      body: [
        "Each call makes two more, so the number of calls grows almost like doubling. For `n = 0..6` the counts are 1, 1, 3, 5, 9, 15, 25.",
        "That is exponential: `fib(30)` makes about 2.7 million calls even though the answer needs only 31 distinct values.",
      ],
      callout: {
        kind: "warn",
        text: "Adding 1 to n multiplies the work by about 1.6. A slow recursion like this stops being usable around n = 45.",
      },
      metrics: [
        { label: "Calls", value: "2.7 million", level: "bad" },
        { label: "Time", value: "O(1.6ⁿ)", level: "bad" },
      ],
      lines: [6],
      scene: scene(
        label("t", 320, 60, "calls made by naive fib(n)", { size: 14, weight: 800 }),
        row([1, 1, 3, 5, 9, 15, 25], { y: 130, index: true, tones: { 6: "warn" } }),
        label("n", 320, 190, "index = n", { size: 12, tone: "muted" }),
        label("big", 320, 240, "fib(30) → 2,692,537 calls", {
          size: 15,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "The cache",
      title: "Look first, store last",
      body: [
        "Give the function a table, called a cache or memo, indexed by `n`. Before computing `fib(n)`, check whether the slot is filled and return it if so.",
        "If it is empty, compute the answer the normal way, write it into the slot, and then return it. Nothing else about the recursion changes.",
      ],
      callout: {
        kind: "tip",
        text: "The cache key must capture everything the answer depends on. Here that is just `n`.",
      },
      metrics: [
        { label: "Calls", value: "0" },
        { label: "Cache hits", value: "0" },
      ],
      lines: [4, 5, 6, 7],
      scene: scene(
        label("l1", 320, 60, "1. if memo[n] is filled → return it", { size: 14, weight: 800 }),
        row(["", "", "", "", ""], { y: 150, index: true, empty: [0, 1, 2, 3, 4] }),
        label("l2", 320, 235, "2. otherwise compute, store in memo[n], return", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "Leaves first",
      title: "The first answers come from the bottom",
      body: [
        "The recursion still dives down the left side first. `f1` and `f0` are base cases, so they return `1` and `0` immediately, and we store both.",
        "Nothing below them has to be computed, and nothing was in the cache yet, so these are ordinary calls.",
      ],
      metrics: [
        { label: "Calls", value: "5", level: "good" },
        { label: "Cache hits", value: "0" },
      ],
      lines: [2, 3],
      scene: view({
        shape: MEMO,
        tones: { 7: "active", 8: "active" },
        memo: [0, 1, null, null, null],
        memoTones: { 0: "done", 1: "done" },
        caption: "base cases: memo[0] = 0, memo[1] = 1",
      }),
    },
    {
      short: "First store",
      title: "Finish fib(2) and store it",
      body: [
        "Back in `f2`, the two children gave `1` and `0`, so `fib(2) = 1`. Before returning, write it to `memo[2]`.",
        "Later calls for `fib(2)` will not need to look at its children at all.",
      ],
      metrics: [
        { label: "Calls", value: "5", level: "good" },
        { label: "Cache hits", value: "0" },
      ],
      lines: [6, 7],
      scene: view({
        shape: MEMO,
        tones: { 3: "active", 7: "done", 8: "done" },
        memo: [0, 1, 1, null, null],
        memoTones: { 0: "done", 1: "done", 2: "active" },
        caption: "fib(2) = 1 + 0 = 1, stored",
      }),
    },
    {
      short: "First hit",
      title: "A cache hit ends a branch",
      body: [
        "`f3` still needs `fib(1)`. This time the slot `memo[1]` is filled, so the call returns `1` at once and creates no children.",
        "Then `fib(3) = 1 + 1 = 2` is stored. The green node is a hit: one cheap lookup in place of a whole subtree.",
      ],
      callout: {
        kind: "insight",
        text: "A hit costs O(1). Every hit removes a subtree that the naive version would have walked in full.",
      },
      metrics: [
        { label: "Calls", value: "6", level: "good" },
        { label: "Cache hits", value: "1", level: "good" },
      ],
      lines: [4, 5, 7],
      scene: view({
        shape: MEMO,
        tones: { 1: "active", 3: "done", 4: "found", 7: "done", 8: "done" },
        memo: [0, 1, 1, 2, null],
        memoTones: { 1: "mark", 3: "active" },
        caption: "fib(3) = fib(2) + fib(1) = 1 + 1 = 2",
      }),
    },
    {
      short: "Second hit",
      title: "The big saving",
      body: [
        "`f4` needs `fib(2)` next. It is in the cache, so the whole second subtree that used to hang under that node is simply gone.",
        "`fib(4) = 2 + 1 = 3` is stored. Five real computations, plus two lookups, replaced nine calls.",
      ],
      metrics: [
        { label: "Calls", value: "7", level: "good" },
        { label: "Cache hits", value: "2", level: "good" },
      ],
      lines: [4, 5, 7],
      scene: view({
        shape: MEMO,
        tones: { 0: "active", 1: "done", 2: "found", 3: "done", 4: "found", 7: "done", 8: "done" },
        memo: [0, 1, 1, 2, 3],
        memoTones: { 2: "mark", 3: "mark", 4: "active" },
        caption: "fib(4) = fib(3) + fib(2) = 2 + 1 = 3",
      }),
    },
    {
      short: "Recap",
      title: "From exponential to linear",
      body: [
        "Every value `fib(0)..fib(n)` is computed once and then only looked up, so the time is `O(n)`. The cache needs `O(n)` space, and the recursion is up to `n` frames deep.",
        "The recipe works for any recursion with overlapping subproblems: find what the answer depends on, use it as the cache key, look up first, store last.",
      ],
      callout: {
        kind: "warn",
        text: "If the inputs never repeat, a cache only costs memory. Memoize when the call tree has repeated nodes.",
      },
      metrics: [
        { label: "Calls", value: "n + 1" },
        { label: "Time", value: "O(n)", level: "good" },
      ],
      scene: scene(
        label("a", 320, 80, "without cache: calls ≈ 1.6ⁿ", { size: 15, weight: 800, tone: "warn" }),
        label("b", 320, 130, "with cache: one computation per n", {
          size: 15,
          weight: 800,
          tone: "good",
        }),
        label("c", 320, 190, "fib(30): 2,692,537 calls → 31 computations", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
  ],
};
