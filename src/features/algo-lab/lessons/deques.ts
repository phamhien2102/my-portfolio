import { label, linked, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

/** A deque as a keyed row: items slide as ends change. `front` is on the left, `back` on the right. */
function view(items: string[], o: { hot?: string; note?: string; out?: string } = {}) {
  const n = items.length;
  return scene(
    row(items, { keys: items, y: 150, tones: (i) => (items[i] === o.hot ? "active" : undefined) }),
    n > 1 && ptr("front", `a${items[0]}`, "front", { side: "below", tone: "mark" }),
    n > 1 && ptr("back", `a${items[n - 1]}`, "back", { side: "above", tone: "active" }),
    n === 1 && ptr("front", `a${items[0]}`, "front = back", { side: "below", tone: "mark" }),
    o.out && label("out", 320, 235, `${o.out}`, { size: 14, weight: 800, tone: "good" }),
    o.note && label("note", 320, 60, o.note, { size: 14, weight: 800 }),
  );
}

export const deques: AlgoLesson = {
  id: "deques",
  title: "Deques",
  summary:
    "A double-ended queue: push and pop at both ends in O(1), so it can act as a stack or a queue.",
  minutes: 10,
  level: "intermediate",
  goals: [
    "The four deque operations and their cost",
    "How one deque replaces a stack or a queue",
    "A palindrome check using both ends",
    "How a deque is built, and where sliding windows use it",
  ],
  takeaways: [
    "A deque lets you push and pop at both the front and the back, each in O(1).",
    "Using only one end gives a stack, and using opposite ends gives a queue.",
    "Problems that look at both ends, like palindromes and sliding windows, are natural deque problems.",
  ],
  hud: [
    { label: "Size", icon: "list" },
    { label: "Last op", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "pushFront(x): link x before the front node",
    "pushBack(x): link x after the back node",
    "popFront(): unlink and return the front node",
    "popBack(): unlink and return the back node",
    "isPalindrome(word):",
    "    d = deque of the letters of word",
    "    while size(d) > 1:",
    "        if popFront(d) != popBack(d): return false",
    "    return true",
  ],
  steps: [
    {
      short: "Two ends",
      title: "A queue you can use from both ends",
      body: [
        "A deque (say 'deck') is short for double-ended queue. It keeps items in order and gives access to both the front and the back.",
        "Four operations do all the work: `pushFront`, `pushBack`, `popFront` and `popBack`.",
      ],
      metrics: [
        { label: "Size", value: "3", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [1, 2, 3, 4],
      scene: view(["B", "C", "D"], { note: "pushes and pops at either end" }),
    },
    {
      short: "pushBack",
      title: "pushBack adds at the back",
      body: ["`pushBack(E)` places `E` after `D`. This is what a queue's enqueue does."],
      metrics: [
        { label: "Size", value: "4", level: "good" },
        { label: "Last op", value: "pushBack E" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [2],
      scene: view(["B", "C", "D", "E"], { hot: "E" }),
    },
    {
      short: "pushFront",
      title: "pushFront adds at the front",
      body: [
        "`pushFront(A)` places `A` before `B`, which a plain queue cannot do. The front marker moves to `A`.",
        "An array would have to shift everything to make room, so a deque is built differently, as the later step shows.",
      ],
      metrics: [
        { label: "Size", value: "5", level: "good" },
        { label: "Last op", value: "pushFront A" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [1],
      scene: view(["A", "B", "C", "D", "E"], { hot: "A" }),
    },
    {
      short: "popBack",
      title: "popBack removes the newest",
      body: [
        "`popBack()` returns `E` and shrinks the deque from the right.",
        "Together with `pushBack`, this is exactly a stack: last in, first out.",
      ],
      metrics: [
        { label: "Size", value: "4", level: "good" },
        { label: "Last op", value: "popBack → E" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [4],
      scene: view(["A", "B", "C", "D"], { out: "popBack returned E" }),
    },
    {
      short: "popFront",
      title: "popFront removes the oldest",
      body: [
        "`popFront()` returns `A`. Pair it with `pushBack` and you have a queue: first in, first out.",
      ],
      callout: {
        kind: "insight",
        text: "One structure, three behaviours: both ends is a deque, one end is a stack, opposite ends is a queue.",
      },
      metrics: [
        { label: "Size", value: "3", level: "good" },
        { label: "Last op", value: "popFront → A" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [3],
      scene: view(["B", "C", "D"], { out: "popFront returned A" }),
    },
    {
      short: "Palindrome",
      title: "Use: check a palindrome",
      body: [
        "Load `level` into a deque. Pop the front and the back and compare them: `l` and `l` match, so they are removed and we compare the next pair.",
        "If any pair differs the word is not a palindrome. If we reach zero or one letters left, it is.",
      ],
      metrics: [
        { label: "Size", value: "5", level: "good" },
        { label: "Last op", value: "compare ends" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [6, 7, 8],
      scene: scene(
        row(["l", "e", "v", "e", "l"], {
          y: 150,
          tones: (i) => (i === 0 || i === 4 ? "found" : undefined),
        }),
        ptr("front", "a0", "front", { side: "below", tone: "mark" }),
        ptr("back", "a4", "back", { side: "above", tone: "active" }),
        label("t", 320, 60, "front l = back l: match, pop both", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "Middle",
      title: "Down to the middle",
      body: [
        "After `e` and `e` match too, only `v` is left. A single letter is its own mirror image, so the answer is true.",
        "Each letter was popped once, so the check is `O(n)`.",
      ],
      metrics: [
        { label: "Size", value: "1", level: "good" },
        { label: "Last op", value: "one left" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [7, 9],
      scene: view(["v"], { hot: "v", note: "one letter left: palindrome" }),
    },
    {
      short: "Under hood",
      title: "How a deque stays O(1)",
      body: [
        "A doubly linked list has a pointer in both directions, so adding or removing at either end changes just a few links.",
        "A circular array works too: the head and tail wrap around, so there is room at both ends without shifting.",
      ],
      callout: {
        kind: "warn",
        text: "A plain array only makes the back cheap. Inserting or removing at the front shifts every element and costs O(n).",
      },
      metrics: [
        { label: "Size", value: "3", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [1, 2, 3, 4],
      scene: scene(
        linked(["B", "C", "D"], { x: 300, doubly: true }),
        ptr("head", "n0", "front", { side: "below", tone: "mark" }),
        ptr("tail", "n2", "back", { side: "above", tone: "active" }),
        label("t", 320, 60, "doubly linked list", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Recap",
      title: "When to reach for a deque",
      body: [
        "Use a deque when you need the ends, both of them. All four operations cost `O(1)` and the structure uses `O(n)` space.",
        "Its most famous use is the sliding window: a deque of candidates whose front is the answer, which the monotonic queue lesson builds step by step.",
      ],
      metrics: [
        { label: "Size", value: "n" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 100, "stack: one end", { size: 15, weight: 800 }),
        label("r2", 320, 140, "queue: opposite ends", { size: 15, weight: 800 }),
        label("r3", 320, 180, "deque: any end, any time", { size: 15, weight: 800 }),
        label("r4", 320, 240, "push / pop front and back: O(1)", {
          size: 14,
          tone: "good",
          weight: 800,
        }),
      ),
    },
  ],
};
