import { cell, edge, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const VALUES = [1, 2, 3, 4];
const nx = (i: number) => 191 + i * 86;
const Y = 150;

interface State {
  /** How many nodes already have their arrow flipped (always a prefix). */
  flipped: number;
  /** Index of prev, or null for the null on the left. */
  prev: number | null;
  /** Index of curr, or null once we have walked off the end. */
  curr: number | null;
  /** Index of the saved next pointer, if one is shown. */
  next?: number;
  head?: number;
}

/** The list with arrows flipped for the first `flipped` nodes, plus the three working pointers. */
function view(s: State) {
  const tones = (i: number): Tone | undefined =>
    i === s.curr ? "active" : i < s.flipped ? "done" : undefined;
  return scene(
    VALUES.map((_, i) => {
      if (i < s.flipped) {
        return edge(`f${i}`, `n${i}`, i === 0 ? "nullL" : `n${i - 1}`, {
          tone: "found",
          dashed: i === 0,
        });
      }
      return i < 3
        ? edge(`f${i}`, `n${i}`, `n${i + 1}`)
        : edge(`f${i}`, `n${i}`, "nullR", { dashed: true });
    }),
    VALUES.map((v, i) => cell(`n${i}`, nx(i), Y, v, { w: 52, h: 44, tone: tones(i) })),
    cell("nullL", nx(0) - 26 - 34 - 14, Y, "null", { w: 44, h: 28, tone: "ghost" }),
    cell("nullR", nx(3) + 26 + 34 + 14, Y, "null", { w: 44, h: 28, tone: "ghost" }),
    s.head === undefined &&
      ptr("prev", s.prev === null ? "nullL" : `n${s.prev}`, "prev", {
        side: "below",
        tone: "mark",
      }),
    ptr("curr", s.curr === null ? "nullR" : `n${s.curr}`, "curr", {
      side: "above",
      tone: "active",
    }),
    s.next !== undefined && ptr("next", `n${s.next}`, "next", { side: "above", tone: "found" }),
    s.head !== undefined &&
      ptr("head", `n${s.head}`, "head = prev", { side: "below", tone: "found" }),
  );
}

export const reversingAList: AlgoLesson = {
  id: "reversing-a-list",
  title: "Reversing a List",
  summary:
    "Flip every next arrow with three pointers, saving the rest of the list before each change.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "What prev, curr and next each hold",
    "The three moves of one round: save, flip, advance",
    "How to find the new head",
    "Why overwriting next too early loses the list",
  ],
  takeaways: [
    "Reversing a list means flipping each node's next pointer to aim at its predecessor, and the loop is: save next, flip, advance.",
    "When curr falls off the end, prev is the old tail and the new head.",
    "It runs in O(n) time and O(1) extra space because the same nodes are rewired in place.",
  ],
  hud: [
    { label: "Flipped", icon: "swap" },
    { label: "Rounds", icon: "timer" },
    { label: "Extra memory", icon: "memory" },
  ],
  pseudocode: [
    "reverse(head):",
    "    prev = null; curr = head",
    "    while curr is not null:",
    "        next = curr.next",
    "        curr.next = prev",
    "        prev = curr",
    "        curr = next",
    "    return prev",
  ],
  steps: [
    {
      short: "The goal",
      title: "Turn 1, 2, 3, 4 into 4, 3, 2, 1",
      body: [
        "We do not copy values into a new list. We rewire the existing nodes so that every `next` arrow points the other way.",
        "Each node must learn who came before it, so we walk the list with a trailing pointer.",
      ],
      metrics: [
        { label: "Flipped", value: "0 of 4" },
        { label: "Extra memory", value: "O(1)", level: "good" },
      ],
      scene: scene(
        VALUES.slice(1).map((_, i) => edge(`o${i}`, `n${i}`, `n${i + 1}`)),
        VALUES.map((v, i) => cell(`n${i}`, nx(i), Y, v, { w: 52, h: 44 })),
        cell("nullR", nx(3) + 26 + 34 + 14, Y, "null", { w: 44, h: 28, tone: "ghost" }),
        edge("o3", "n3", "nullR", { dashed: true }),
        ptr("head", "n0", "head", { side: "below" }),
      ),
    },
    {
      short: "Set up",
      title: "Three pointers: prev, curr, next",
      body: [
        "`prev` starts as `null`, because the new last node must point at nothing. `curr` starts at the head: it is the node we will flip.",
        "`next` is a temporary note of where the rest of the list begins. It is filled in each round.",
      ],
      metrics: [
        { label: "Flipped", value: "0 of 4" },
        { label: "Rounds", value: "0" },
        { label: "Extra memory", value: "O(1)", level: "good" },
      ],
      lines: [2],
      scene: view({ flipped: 0, prev: null, curr: 0 }),
    },
    {
      short: "Save next",
      title: "First save what comes next",
      body: [
        "Before touching anything, set `next = curr.next`. Now we hold a reference to `2` and the rest of the list.",
      ],
      callout: {
        kind: "warn",
        text: "This is the step people skip. Once `curr.next` is overwritten, nothing else points at the rest of the list.",
      },
      metrics: [
        { label: "Flipped", value: "0 of 4" },
        { label: "Rounds", value: "1" },
      ],
      lines: [4],
      scene: view({ flipped: 0, prev: null, curr: 0, next: 1 }),
    },
    {
      short: "Flip",
      title: "Flip one arrow",
      body: [
        "Now it is safe: `curr.next = prev`. Node `1` stops pointing at `2` and points at `null`, and it becomes the end of the new list.",
        "Exactly one arrow changed this step.",
      ],
      metrics: [
        { label: "Flipped", value: "1 of 4" },
        { label: "Rounds", value: "1" },
      ],
      lines: [5],
      scene: view({ flipped: 1, prev: null, curr: 0, next: 1 }),
    },
    {
      short: "Advance",
      title: "Slide the window forward",
      body: [
        "`prev = curr` and `curr = next`. Node `1` is now behind us, flipped, and `2` is the node we will handle next.",
        "The three pointers have moved one node along and the cycle repeats: save, flip, advance.",
      ],
      metrics: [
        { label: "Flipped", value: "1 of 4" },
        { label: "Rounds", value: "1" },
      ],
      lines: [6, 7],
      scene: view({ flipped: 1, prev: 0, curr: 1 }),
    },
    {
      short: "Keep going",
      title: "Two more rounds, same moves",
      body: [
        "Round two flips `2` to point at `1`. Round three flips `3` to point at `2`. After each round `prev` trails `curr` by one node.",
        "Now `curr` is on `4`, the last node, with the first three arrows already reversed.",
      ],
      metrics: [
        { label: "Flipped", value: "3 of 4" },
        { label: "Rounds", value: "3" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: view({ flipped: 3, prev: 2, curr: 3 }),
    },
    {
      short: "New head",
      title: "curr runs off the end: prev is the head",
      body: [
        "Flip `4` to point at `3`, then advance. `curr` becomes `null`, which ends the loop, and `prev` is sitting on `4`.",
        "Return `prev`. It is the old tail and the head of the reversed list. Each node was visited once, so the cost is `O(n)` time and `O(1)` space.",
      ],
      callout: {
        kind: "tip",
        text: "Remember to return `prev`, not `curr`. At the end `curr` is null.",
      },
      metrics: [
        { label: "Flipped", value: "4 of 4", level: "good" },
        { label: "Rounds", value: "4" },
        { label: "Extra memory", value: "O(1)", level: "good" },
      ],
      lines: [3, 8],
      scene: view({ flipped: 4, prev: 3, curr: null, head: 3 }),
    },
    {
      short: "The bug",
      title: "The classic mistake: losing the rest",
      body: [
        "Skip the save step and write `curr.next = prev` straight away. Node `1` now points at `null`, and the only link to `2`, `3`, `4` is gone.",
        "Nothing references them any more. The list silently shrinks to one node.",
      ],
      callout: {
        kind: "warn",
        text: "Always read `curr.next` into a variable before you assign to it.",
      },
      metrics: [
        { label: "Flipped", value: "1 of 4", level: "bad" },
        { label: "Rounds", value: "1" },
      ],
      scene: scene(
        edge("b0", "n0", "nullL", { dashed: true, tone: "warn" }),
        edge("b1", "n1", "n2", { tone: "muted" }),
        edge("b2", "n2", "n3", { tone: "muted" }),
        VALUES.map((v, i) =>
          cell(`n${i}`, nx(i), Y, v, { w: 52, h: 44, tone: i === 0 ? "active" : "warn" }),
        ),
        cell("nullL", nx(0) - 26 - 34 - 14, Y, "null", { w: 44, h: 28, tone: "ghost" }),
        ptr("curr", "n0", "curr", { side: "above", tone: "active" }),
        label("lost", nx(2), 225, "nothing points to 2 → 3 → 4 now", {
          size: 13,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "Recap",
      title: "Save, flip, advance",
      body: [
        "Every round does the same three things in the same order: `next = curr.next`, `curr.next = prev`, then `prev = curr` and `curr = next`.",
        "`O(n)` time, `O(1)` space, and the order of the first two lines is what keeps the list alive.",
      ],
      metrics: [
        { label: "Rounds", value: "n" },
        { label: "Extra memory", value: "O(1)", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 90, "1.  next = curr.next", { size: 15, weight: 800 }),
        label("r2", 320, 140, "2.  curr.next = prev", { size: 15, weight: 800 }),
        label("r3", 320, 190, "3.  prev = curr;  curr = next", { size: 15, weight: 800 }),
        label("r4", 320, 245, "return prev", { size: 14, weight: 800, tone: "good" }),
      ),
    },
  ],
};
