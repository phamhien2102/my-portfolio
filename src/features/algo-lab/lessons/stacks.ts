import { label, ptr, scene, stack } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

/** A stack of the given entries (keys keep each entry's identity), with the top marked. */
function view(entries: string[], opts: { popped?: string; topTone?: "active" | "found" } = {}) {
  const keys = entries;
  return scene(
    stack(entries, {
      keys,
      x: 250,
      y: 250,
      tones: (i) => (i === entries.length - 1 ? (opts.topTone ?? "active") : undefined),
    }),
    entries.length > 0 &&
      ptr("top", `s${entries[entries.length - 1]}`, "top", { side: "right", tone: "active" }),
    entries.length === 0 && label("empty", 250, 215, "empty stack", { tone: "muted", size: 14 }),
    opts.popped &&
      label("out", 470, 150, `popped ${opts.popped}`, { size: 14, weight: 800, tone: "good" }),
  );
}

export const stacks: AlgoLesson = {
  id: "stacks",
  title: "Stacks",
  summary: "Last in, first out: the structure behind undo, the call stack and bracket matching.",
  minutes: 9,
  level: "beginner",
  goals: [
    "What last-in, first-out means",
    "How push, pop and peek work, and what they cost",
    "How an array or linked list can back a stack",
    "Where stacks show up in real programs",
  ],
  takeaways: [
    "A stack only touches one end, the top, so push, pop and peek are all O(1).",
    "Last in, first out fits anything that must be undone in reverse order: undo, backtracking, nested calls.",
    "Popping an empty stack is an error you must check for, not a value.",
  ],
  hud: [
    { label: "Size", icon: "list" },
    { label: "Last op", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "push(x):",
    "    items[count] = x",
    "    count = count + 1",
    "pop():",
    '    if count == 0: error "empty stack"',
    "    count = count - 1",
    "    return items[count]",
    "peek():",
    "    return items[count - 1]",
  ],
  steps: [
    {
      short: "A pile",
      title: "Think of a pile of plates",
      body: [
        "You add a plate to the top of a pile and you take one from the top. You never pull one out of the middle.",
        "A stack works exactly like that. The most recently added item is always the next to come out: last in, first out, or LIFO.",
      ],
      metrics: [{ label: "Size", value: "0", level: "good" }],
      scene: view([]),
    },
    {
      short: "Push A",
      title: "Push puts an item on top",
      body: ["`push(A)` places `A` on the stack. It is the only item, so it is also the top."],
      metrics: [
        { label: "Size", value: "1", level: "good" },
        { label: "Last op", value: "push A" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [1, 2, 3],
      scene: view(["A"]),
    },
    {
      short: "Push B, C",
      title: "More pushes stack up",
      body: [
        "`push(B)` and `push(C)` each go on top of what is there. The top marker follows the newest item.",
        "`A` is now buried: it can only come out after `C` and `B` have left.",
      ],
      metrics: [
        { label: "Size", value: "3", level: "good" },
        { label: "Last op", value: "push C" },
      ],
      lines: [1, 2, 3],
      scene: view(["A", "B", "C"]),
    },
    {
      short: "Peek",
      title: "Peek looks without removing",
      body: [
        "`peek()` returns the top item, `C`, and leaves the stack untouched. It is how you ask 'what would pop give me?'",
      ],
      metrics: [
        { label: "Size", value: "3", level: "good" },
        { label: "Last op", value: "peek → C" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [8, 9],
      scene: view(["A", "B", "C"], { topTone: "found" }),
    },
    {
      short: "Pop",
      title: "Pop takes the top item off",
      body: [
        "`pop()` removes and returns `C`. `B` becomes the new top.",
        "Items leave in the reverse of the order they arrived, which is exactly what you want for undoing things.",
      ],
      callout: {
        kind: "warn",
        text: "Popping an empty stack has no item to return. Check for emptiness first, or handle the error.",
      },
      metrics: [
        { label: "Size", value: "2", level: "good" },
        { label: "Last op", value: "pop → C" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [4, 5, 6, 7],
      scene: view(["A", "B"], { popped: "C" }),
    },
    {
      short: "Under the hood",
      title: "An array makes a fine stack",
      body: [
        "Keep a list and a count. `push` writes at the count and adds one; `pop` subtracts one and reads. Nothing ever shifts, so each operation takes constant time.",
        "A linked list works too, adding and removing at the head. Either way only one end is ever touched.",
      ],
      metrics: [
        { label: "Size", value: "2", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [2, 3, 6, 7],
      scene: scene(
        label("t", 320, 70, "array-backed stack, count = 2", { size: 13, weight: 800 }),
        [
          ...["A", "B", "·", "·", "·"].map((v, i) => ({
            t: "cell" as const,
            id: `u${i}`,
            x: 160 + i * 60,
            y: 150,
            text: v,
            sub: String(i),
            tone: (v === "·" ? "ghost" : i === 1 ? "active" : undefined) as
              "ghost" | "active" | undefined,
          })),
        ],
        ptr("count", "u2", "next write", { tone: "mark" }),
      ),
    },
    {
      short: "In the wild",
      title: "Where stacks hide",
      body: [
        "The call stack: each function call is pushed with its variables and popped when it returns. A browser's back button, an editor's undo and the brackets in an expression all rely on the same last-in, first-out rule.",
        "Whenever you must finish the most recent thing before returning to an earlier one, a stack is the natural fit.",
      ],
      callout: {
        kind: "tip",
        text: "If a problem says 'most recent' or 'innermost', think stack.",
      },
      metrics: [{ label: "Cost", value: "O(1)", level: "good" }],
      scene: scene(
        stack(["main()", "load()", "parse()"], {
          keys: ["m", "l", "p"],
          x: 320,
          y: 250,
          w: 130,
          tones: (i) => (i === 2 ? "active" : undefined),
        }),
        label("cs", 320, 70, "the call stack while parse() runs", { size: 13, weight: 800 }),
      ),
    },
  ],
};
