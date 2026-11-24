import { cell, edge, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const A = [1, 4, 7];
const B = [2, 3, 9];
/** The order in which nodes are appended to the result. */
const MOVES = ["a0", "b0", "b1", "a1", "a2", "b2"];
const VAL: Record<string, number> = { a0: 1, a1: 4, a2: 7, b0: 2, b1: 3, b2: 9 };

const X = (i: number) => 104 + i * 72;
const YA = 60;
const YB = 135;
const YR = 235;

/** State after `k` nodes have been moved onto the result list. */
function view(k: number, note?: string, opts: { dummyOnly?: boolean; leftover?: boolean } = {}) {
  const moved = MOVES.slice(0, k);
  const pos = (id: string): { x: number; y: number } => {
    const at = moved.indexOf(id);
    if (at >= 0) return { x: X(at + 1), y: YR };
    return { x: X(Number(id[1])), y: id[0] === "a" ? YA : YB };
  };
  const items: Item[] = [];
  // source-list arrows between nodes that have not moved yet
  for (const [p, list] of [
    ["a", A],
    ["b", B],
  ] as const) {
    for (let i = 0; i < list.length - 1; i++) {
      if (!moved.includes(`${p}${i}`)) items.push(edge(`${p}e${i}`, `${p}${i}`, `${p}${i + 1}`));
    }
  }
  // result chain: dummy, then each moved node
  const chain = ["d", ...moved];
  for (let j = 1; j < chain.length; j++)
    items.push(edge(`re${j}`, chain[j - 1], chain[j], { tone: "found" }));
  // nodes
  items.push(cell("d", X(0), YR, "∅", { w: 44, h: 44, tone: "mark" }));
  for (const id of Object.keys(VAL)) {
    const { x, y } = pos(id);
    const isMoved = moved.includes(id);
    const justMoved = isMoved && moved[moved.length - 1] === id;
    const tone: Tone | undefined = justMoved ? "found" : isMoved ? "done" : undefined;
    items.push(cell(id, x, y, VAL[id], { w: 44, h: 44, tone }));
  }
  // heads of the source lists
  const aHead = A.findIndex((_, i) => !moved.includes(`a${i}`));
  const bHead = B.findIndex((_, i) => !moved.includes(`b${i}`));
  if (aHead >= 0)
    items.push(
      ptr("pa", `a${aHead}`, "a", { side: "left", tone: opts.leftover ? "plain" : "active" }),
    );
  if (bHead >= 0)
    items.push(
      ptr("pb", `b${bHead}`, "b", { side: "left", tone: opts.leftover ? "plain" : "active" }),
    );
  items.push(ptr("tail", chain[chain.length - 1], "tail", { side: "below", tone: "mark" }));
  if (note) items.push(label("note", 320, 14, note, { size: 13, weight: 800 }));
  items.push(label("ra", 30, YA + 24, "A", { size: 12, tone: "muted" }));
  items.push(label("rb", 30, YB + 24, "B", { size: 12, tone: "muted" }));
  items.push(label("rr", 30, YR + 28, "result", { size: 12, tone: "muted" }));
  return scene(items);
}

export const mergeSortedLists: AlgoLesson = {
  id: "merge-sorted-lists",
  title: "Merging Sorted Lists",
  summary: "Weave two sorted linked lists into one by repeatedly taking the smaller head.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "Why only the two heads ever need comparing",
    "How a dummy head node removes the empty-result special case",
    "What to do when one list runs out first",
    "Why the cost is O(n + m)",
  ],
  takeaways: [
    "Because both lists are sorted, the smallest remaining value is always one of the two heads.",
    "A dummy node in front of the result lets every append use the same tail.next assignment, including the first.",
    "When one list is empty, the other already is the sorted rest, so you attach it in one step, and the whole merge costs O(n + m).",
  ],
  hud: [
    { label: "Comparisons", icon: "swap" },
    { label: "Appended", icon: "list" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "merge(a, b):",
    "    dummy = new node; tail = dummy",
    "    while a and b:",
    "        if a.value <= b.value:",
    "            tail.next = a; a = a.next",
    "        else:",
    "            tail.next = b; b = b.next",
    "        tail = tail.next",
    "    tail.next = a or b     # attach whatever is left",
    "    return dummy.next",
  ],
  steps: [
    {
      short: "The task",
      title: "Two sorted lists, one sorted result",
      body: [
        "List `A` holds `1, 4, 7` and list `B` holds `2, 3, 9`. We want a single sorted list containing all six values, built by relinking the existing nodes.",
        "Both inputs are already in order, which is a big gift: we never have to look past the front of either list.",
      ],
      metrics: [
        { label: "Comparisons", value: "0", level: "good" },
        { label: "Appended", value: "0 of 6" },
      ],
      scene: view(0, "A = 1 4 7    B = 2 3 9"),
    },
    {
      short: "Dummy head",
      title: "Start from a dummy node",
      body: [
        "The result's first node depends on which list wins the first comparison. To avoid a special case, we make a placeholder node, the `dummy`, and keep a `tail` pointer on it.",
        "Every append is then the same line: `tail.next = smaller; tail = smaller`. At the end the real list is `dummy.next`.",
      ],
      callout: {
        kind: "tip",
        text: "The dummy's value is never used. It only exists so the result is never empty while you build it.",
      },
      metrics: [
        { label: "Comparisons", value: "0", level: "good" },
        { label: "Appended", value: "0 of 6" },
      ],
      lines: [2],
      scene: view(0, "tail starts on the dummy node"),
    },
    {
      short: "1 vs 2",
      title: "Compare the heads: 1 beats 2",
      body: [
        "`a` points at `1` and `b` at `2`. Since `1 <= 2`, node `1` is the smaller, so we append it: `tail.next = a`, move `tail` onto it, and advance `a` to `4`.",
      ],
      metrics: [
        { label: "Comparisons", value: "1" },
        { label: "Appended", value: "1 of 6" },
      ],
      lines: [4, 5, 8],
      scene: view(1, "1 ≤ 2: take from A"),
    },
    {
      short: "4 vs 2",
      title: "Now 2 is smaller",
      body: [
        "The heads are `4` and `2`. This time `B` wins, so `2` is appended and `b` advances to `3`.",
        "The unchosen head stays put. We never compare against nodes deeper in the lists.",
      ],
      metrics: [
        { label: "Comparisons", value: "2" },
        { label: "Appended", value: "2 of 6" },
      ],
      lines: [6, 7, 8],
      scene: view(2, "4 vs 2: take from B"),
    },
    {
      short: "4 vs 3",
      title: "B wins again",
      body: [
        "`4` against `3`: take `3`. `B` has now given two nodes in a row, and that is fine. Winners are decided one comparison at a time, not in alternation.",
      ],
      metrics: [
        { label: "Comparisons", value: "3" },
        { label: "Appended", value: "3 of 6" },
      ],
      lines: [6, 7, 8],
      scene: view(3, "4 vs 3: take from B"),
    },
    {
      short: "4 vs 9",
      title: "Back to A",
      body: [
        "`4` against `9`: take `4`, advance `a` to `7`. Notice the result so far, `1, 2, 3, 4`, is already in order. Each append keeps it that way.",
      ],
      callout: {
        kind: "insight",
        text: "Each step either appends the smaller head or stops. That is why the result is guaranteed sorted.",
      },
      metrics: [
        { label: "Comparisons", value: "4" },
        { label: "Appended", value: "4 of 6" },
      ],
      lines: [4, 5, 8],
      scene: view(4, "4 vs 9: take from A"),
    },
    {
      short: "7 vs 9",
      title: "A is about to run out",
      body: [
        "`7` against `9`: take `7`. List `A` is now empty, so its pointer `a` is `null` and there is nothing left to compare against.",
        "`B` still holds `9`.",
      ],
      metrics: [
        { label: "Comparisons", value: "5" },
        { label: "Appended", value: "5 of 6" },
      ],
      lines: [4, 5, 8],
      scene: view(5, "7 vs 9: take from A, then A is empty"),
    },
    {
      short: "Leftovers",
      title: "Attach what is left in one move",
      body: [
        "When one list is empty, the other is already sorted and every value in it is at least as large as what we have built. So we skip comparing and write `tail.next = b`.",
        "That single pointer assignment attaches all remaining nodes, however many there are. Return `dummy.next`: `1, 2, 3, 4, 7, 9`.",
      ],
      callout: {
        kind: "warn",
        text: "Forgetting the leftovers drops the tail of one list. Test with lists of different lengths and with an empty list.",
      },
      metrics: [
        { label: "Comparisons", value: "5" },
        { label: "Appended", value: "6 of 6", level: "good" },
      ],
      lines: [9, 10],
      scene: view(6, "append the rest of B, return dummy.next", { leftover: true }),
    },
    {
      short: "Cost",
      title: "One pass, O(n + m)",
      body: [
        "Each comparison appends one node and advances one pointer, and no pointer moves backwards. With `n` and `m` nodes the loop runs at most `n + m` times, so the time is `O(n + m)`.",
        "Only a handful of pointers are used, so the extra space is `O(1)`: the nodes are relinked, not copied.",
      ],
      metrics: [
        { label: "Comparisons", value: "≤ n + m − 1" },
        { label: "Cost", value: "O(n + m)", level: "good" },
      ],
      scene: scene(
        label("c1", 320, 90, "compare the two heads", { size: 15, weight: 800 }),
        label("c2", 320, 135, "append the smaller, advance its list", { size: 15, weight: 800 }),
        label("c3", 320, 180, "attach the leftover list", { size: 15, weight: 800 }),
        label("c4", 320, 235, "time O(n + m)    extra space O(1)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
