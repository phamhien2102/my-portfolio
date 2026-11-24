import { cell, edge, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

// ---- the straight list used for "find the middle" ----------------------------------------

const LINE = ["A", "B", "C", "D", "E"];
const lx = (i: number) => 122 + i * 86;

function straight(slow: number, fast: number | "end", tones: Record<number, Tone> = {}) {
  return scene(
    LINE.slice(1).map((_, i) => edge(`le${i}`, `l${i}`, `l${i + 1}`)),
    LINE.map((v, i) => cell(`l${i}`, lx(i), 150, v, { w: 52, h: 44, tone: tones[i] })),
    cell("lnull", lx(4) + 26 + 34 + 14, 150, "null", { w: 44, h: 28, tone: "ghost" }),
    edge("lend", "l4", "lnull", { dashed: true }),
    ptr("slow", `l${slow}`, "slow", { side: "below", tone: "active" }),
    fast === "end"
      ? ptr("fast", "lnull", "fast", { side: "above", tone: "mark" })
      : ptr("fast", `l${fast}`, "fast", { side: "above", tone: "mark" }),
  );
}

// ---- the list with a loop: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> back to 2 -------------------------

const POS: [number, number][] = [
  [70, 150],
  [160, 150],
  [260, 150],
  [350, 70],
  [450, 150],
  [350, 230],
];
const NAMES = ["a", "b", "c", "d", "e", "f"];

function looped(
  slow: number,
  fast: number,
  o: { tones?: Record<number, Tone>; slowSide?: "below" | "above" } = {},
) {
  const tones = o.tones ?? {};
  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 2],
  ];
  return scene(
    links.map(([a, b]) =>
      edge(`ce${a}${b}`, `c${a}`, `c${b}`, { tone: a === 5 ? "warn" : undefined }),
    ),
    POS.map(([x, y], i) =>
      cell(`c${i}`, x, y, NAMES[i].toUpperCase(), { w: 52, h: 44, tone: tones[i] }),
    ),
    ptr("slow", `c${slow}`, "slow", { side: o.slowSide ?? "below", tone: "active" }),
    ptr("fast", `c${fast}`, "fast", { side: "above", tone: "mark" }),
  );
}

export const fastSlow: AlgoLesson = {
  id: "fast-slow",
  title: "Fast & Slow Pointers",
  summary: "Two pointers at different speeds find a list's middle and detect a cycle in one pass.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How the tortoise and hare find the middle node",
    "How meeting inside a loop proves a cycle exists",
    "Why the two pointers must meet",
    "The idea behind finding where a cycle starts",
  ],
  takeaways: [
    "Moving one pointer two nodes for every one node of the other makes the slow pointer land in the middle when the fast one runs out.",
    "In a list with a cycle the fast pointer laps the slow one and they meet, while in a list without one the fast pointer reaches null.",
    "Both tricks run in O(n) time and O(1) extra space, with no hash set of visited nodes.",
  ],
  hud: [
    { label: "Slow at", icon: "hourglass" },
    { label: "Fast at", icon: "bolt" },
    { label: "Rounds", icon: "swap" },
  ],
  pseudocode: [
    "hasCycle(head):",
    "    slow = head; fast = head",
    "    while fast and fast.next:",
    "        slow = slow.next",
    "        fast = fast.next.next",
    "        if slow == fast:",
    "            return true",
    "    return false     # fast hit null; slow is the middle",
  ],
  steps: [
    {
      short: "Middle?",
      title: "Find the middle without counting",
      body: [
        "We want the middle node of a linked list. We cannot index, and we do not know the length. Counting first and walking again would take two passes.",
        "Instead start two pointers at the head: `slow` and `fast`. They will move at different speeds in a single pass.",
      ],
      metrics: [
        { label: "Slow at", value: "A" },
        { label: "Fast at", value: "A" },
        { label: "Rounds", value: "0", level: "good" },
      ],
      lines: [2],
      scene: straight(0, 0),
    },
    {
      short: "Step & leap",
      title: "Slow takes one step, fast takes two",
      body: [
        "Each round, `slow = slow.next` and `fast = fast.next.next`. After round one `slow` is on `B` and `fast` is on `C`.",
        "Fast covers twice the ground, so when it has travelled the whole list slow has covered exactly half.",
      ],
      metrics: [
        { label: "Slow at", value: "B" },
        { label: "Fast at", value: "C" },
        { label: "Rounds", value: "1" },
      ],
      lines: [3, 4, 5],
      scene: straight(1, 2, { 0: "done", 1: "active", 2: "mark" }),
    },
    {
      short: "Fast ends",
      title: "When fast runs out, slow is in the middle",
      body: [
        "Round two: `slow` moves to `C`, `fast` moves to `E`. Now `fast.next` is `null`, so the loop stops.",
        "`slow` sits on `C`, the middle of five nodes. With an even count, the same loop stops with `slow` on the second of the two middle nodes.",
      ],
      callout: {
        kind: "warn",
        text: "Guard both `fast` and `fast.next` before leaping. Checking only `fast` crashes on an even-length list.",
      },
      metrics: [
        { label: "Slow at", value: "C", level: "good" },
        { label: "Fast at", value: "E" },
        { label: "Rounds", value: "2" },
      ],
      lines: [3, 8],
      scene: straight(2, 4, { 0: "done", 1: "done", 2: "found", 3: "done", 4: "mark" }),
    },
    {
      short: "A cycle?",
      title: "Now a list that loops",
      body: [
        "Suppose the last node `F` points back to `C` instead of `null`. Walking with a single pointer would circle forever, and nothing in the data says so.",
        "The same two pointers detect this. Start both at `A`.",
      ],
      callout: {
        kind: "tip",
        text: "Storing every visited node in a set also works, but costs O(n) memory. Two pointers need O(1).",
      },
      metrics: [
        { label: "Slow at", value: "A" },
        { label: "Fast at", value: "A" },
        { label: "Rounds", value: "0", level: "good" },
      ],
      lines: [2],
      scene: looped(0, 0),
    },
    {
      short: "Into loop",
      title: "Fast enters the loop first",
      body: [
        "After two rounds `slow` is on `C`, the loop entrance, and `fast` is on `E`. Fast arrived earlier and is now ahead of slow inside the loop.",
        "From here both circle the loop, and the question is whether the quicker one ever catches the slower one.",
      ],
      metrics: [
        { label: "Slow at", value: "C" },
        { label: "Fast at", value: "E" },
        { label: "Rounds", value: "2" },
      ],
      lines: [3, 4, 5],
      scene: looped(2, 4, { tones: { 0: "done", 1: "done", 2: "active", 4: "mark" } }),
    },
    {
      short: "Closing in",
      title: "Fast gains one node per round",
      body: [
        "Round three: `slow` moves to `D`, `fast` goes `F` then `C`. Fast has wrapped around and now sits just behind slow.",
        "Fast moves two and slow moves one, so the gap between them shrinks by exactly one each round.",
      ],
      metrics: [
        { label: "Slow at", value: "D" },
        { label: "Fast at", value: "C" },
        { label: "Rounds", value: "3" },
      ],
      lines: [4, 5],
      scene: looped(3, 2, { tones: { 0: "done", 1: "done", 3: "active", 2: "mark" } }),
    },
    {
      short: "They meet",
      title: "Both land on the same node",
      body: [
        "Round four: `slow` moves to `E`, `fast` goes `D` then `E`. They are on the same node, so `slow == fast` and we report a cycle.",
        "If the list had ended, `fast` would have hit `null` first and we would return false.",
      ],
      metrics: [
        { label: "Slow at", value: "E", level: "warn" },
        { label: "Fast at", value: "E", level: "warn" },
        { label: "Rounds", value: "4" },
      ],
      lines: [6, 7],
      scene: scene(
        looped(4, 4, { tones: { 4: "found" } }).items.filter(
          (it) => it.id !== "slow" && it.id !== "fast",
        ),
        ptr("both", "c4", "slow = fast", { side: "above", tone: "found" }),
        label("cyc", 320, 285, "cycle found", { size: 13, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Why meet",
      title: "Why they cannot miss each other",
      body: [
        "Inside a loop, count the distance from `fast` forward to `slow`. Each round it drops by one: `2 → 1 → 0`. Because it falls in steps of one, it cannot jump over zero.",
        "That is the key. Fast gains one node per round, so it can never skip past slow, and the meeting happens within one lap.",
      ],
      callout: {
        kind: "insight",
        text: "If fast moved three while slow moved one, the gap would fall by two and could step over zero. Speeds 2 and 1 are the safe choice.",
      },
      metrics: [{ label: "Rounds", value: "≤ loop length" }],
      scene: scene(
        looped(4, 4, { tones: { 4: "found" } }).items.filter(
          (it) => it.id !== "slow" && it.id !== "fast",
        ),
        label("gap", 320, 280, "gap from fast to slow inside the loop:  2  →  1  →  0", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Cycle start",
      title: "Finding where the loop begins",
      body: [
        "A neat result: leave `slow` at the meeting node, put a second pointer at the head, and move both one node per round. They meet exactly at the first node of the loop, `C`.",
        "The reason is arithmetic about distances: the walk from the head to the entrance equals the walk from the meeting point round to the entrance. Detecting a cycle, or finding its start, is `O(n)` time and `O(1)` space.",
      ],
      metrics: [{ label: "Rounds", value: "2 more" }],
      scene: scene(
        looped(4, 4, { tones: { 2: "mark", 4: "done" } }).items.filter(
          (it) => it.id !== "slow" && it.id !== "fast",
        ),
        ptr("start", "c2", "start of loop", { side: "below", tone: "mark" }),
      ),
    },
  ],
};
