import { disc, edge, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const LETTERS = ["A", "B", "C"];
const LEAVES = ["ABC", "ACB", "BAC", "BCA", "CAB", "CBA"];

const rest = (p: string) => LETTERS.filter((l) => !p.includes(l));

// Every prefix of every permutation, with its position in the tree.
function position(p: string): [number, number] {
  if (p.length === 3) return [70 + LEAVES.indexOf(p) * 100, 235];
  if (p.length === 2) return [position(p + rest(p)[0])[0], 170];
  if (p.length === 1) {
    const xs = rest(p).map((l) => position(p + l)[0]);
    return [(xs[0] + xs[1]) / 2, 105];
  }
  return [320, 40];
}
const idOf = (p: string) => (p ? `p${p}` : "proot");

/** Draw the revealed prefixes of the permutation tree, and the used flags for the current path. */
function view(
  revealed: string[],
  tones: Record<string, Tone>,
  current: string,
  note?: string,
  found: string[] = [],
) {
  const shown = new Set(["", ...revealed]);
  const items: Item[] = [];
  for (const p of shown) {
    if (p === "") continue;
    const parent = p.slice(0, -1);
    items.push(edge(`e${p}`, idOf(parent), idOf(p), { arrow: "none" }));
  }
  for (const p of shown) {
    const [x, y] = position(p);
    items.push(disc(idOf(p), x, y, p || "∅", { r: 19, tone: tones[p] }));
  }
  return scene(
    items,
    label("ul", 40, 295, "used", { size: 11, tone: "muted", anchor: "start" }),
    row(LETTERS, {
      id: "u",
      x: 190,
      y: 295,
      w: 40,
      h: 32,
      gap: 6,
      tones: (i) => (current.includes(LETTERS[i]) ? "muted" : undefined),
    }),
    label("cur", 440, 295, `path: ${current || "empty"}`, { size: 13, weight: 800 }),
    note && label("note", 320, 335, note, { size: 12, tone: "muted" }),
    found.length > 0 &&
      label("fnd", 320, 360, `found: ${found.join(" ")}`, { size: 13, weight: 800, tone: "good" }),
  );
}

export const permutations: AlgoLesson = {
  id: "permutations",
  title: "Permutations",
  summary:
    "Generate every ordering of a set by extending a prefix, trying each unused item and undoing.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How a growing prefix produces every ordering",
    "How used flags avoid repeating an element",
    "How the tree of choices narrows by one option per level",
    "Why there are n! results and what that costs",
  ],
  takeaways: [
    "Build the ordering one position at a time: try every unused element, recurse, then undo the choice.",
    "The options shrink by one at each level (3, then 2, then 1), so the tree has n! leaves.",
    "A used-flags array makes the check O(1), and the work grows factorially, so it suits only small n.",
  ],
  hud: [
    { label: "Found", icon: "list" },
    { label: "Prefix length", icon: "layers" },
    { label: "Total possible", icon: "sigma" },
  ],
  pseudocode: [
    "permute():",
    "    if len(prefix) == n:",
    "        record a copy of prefix",
    "        return",
    "    for i in 0 .. n-1:",
    "        if used[i]: continue",
    "        used[i] = true",
    "        add items[i] to prefix",
    "        permute()",
    "        remove items[i] from prefix",
    "        used[i] = false",
  ],
  steps: [
    {
      short: "The goal",
      title: "All orderings of A, B, C",
      body: [
        "A permutation uses every item exactly once, in some order. For `A`, `B`, `C` these are `ABC`, `ACB`, `BAC`, `BCA`, `CAB` and `CBA`.",
        "Count them: 3 choices for the first position, then 2 for the second, then 1 for the last, so `3 * 2 * 1 = 6`.",
      ],
      metrics: [
        { label: "Found", value: "0" },
        { label: "Total possible", value: "6" },
      ],
      scene: scene(
        row(LETTERS, { y: 120, index: true }),
        label("g", 320, 200, "3 x 2 x 1 = 3! = 6 orderings", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "First pick",
      title: "Choose the first letter",
      body: [
        "Start with an empty prefix. Any of the three letters can come first, so the root has three children: `A`, `B`, `C`.",
        "Each branch is a different future. Nothing is used yet, so all three flags are free.",
      ],
      metrics: [
        { label: "Found", value: "0" },
        { label: "Prefix length", value: "0" },
      ],
      lines: [5, 6],
      scene: view(["A", "B", "C"], { "": "active" }, "", "three options for position 1"),
    },
    {
      short: "Extend A",
      title: "Pick A, then the rest",
      body: [
        "Take `A`. It is now marked used, so only `B` and `C` can follow. The node `A` has two children: `AB` and `AC`.",
        "Marking `A` used is what keeps `AA` from ever appearing.",
      ],
      callout: {
        kind: "insight",
        text: "The options per level are 3, 2, 1. Each used element removes one choice from every level below.",
      },
      metrics: [
        { label: "Found", value: "0" },
        { label: "Prefix length", value: "1" },
      ],
      lines: [5, 6, 7, 8, 9],
      scene: view(
        ["A", "B", "C", "AB", "AC"],
        { A: "active" },
        "A",
        "A is used: only B or C can follow",
      ),
    },
    {
      short: "Reach ABC",
      title: "Fill every position",
      body: [
        "Take `B` after `A`, and only `C` is left, so the prefix grows to `ABC`. The length equals the number of items, so this is a full permutation: record it.",
        "Notice the last position had no real choice. The final level always has exactly one child.",
      ],
      chapter: { label: "Path", tone: "blue" },
      metrics: [
        { label: "Found", value: "1", level: "good" },
        { label: "Prefix length", value: "3" },
      ],
      lines: [2, 3, 4],
      scene: view(
        ["A", "B", "C", "AB", "AC", "ABC"],
        { A: "done", AB: "done", ABC: "found" },
        "ABC",
        "all three used: record ABC",
        ["ABC"],
      ),
    },
    {
      short: "Undo",
      title: "Undo to try something else",
      body: [
        "Backtrack: un-choose `C`, then un-choose `B`. The prefix is back to `A` and `B` and `C` are free again.",
        "Un-choosing means clearing the used flag as well as shortening the prefix. Skip it and the later branches cannot reuse that letter.",
      ],
      callout: {
        kind: "warn",
        text: "Every choose needs a matching un-choose, including the flag. Otherwise later branches see stale state.",
      },
      metrics: [
        { label: "Found", value: "1", level: "good" },
        { label: "Prefix length", value: "1" },
      ],
      lines: [10, 11],
      scene: view(
        ["A", "B", "C", "AB", "AC", "ABC"],
        { A: "active", AB: "done", ABC: "done" },
        "A",
        "back at A: B was tried, now try C",
        ["ABC"],
      ),
    },
    {
      short: "Try AC",
      title: "The next option: C second",
      body: [
        "Choose `C` after `A`, which leaves only `B`, giving the second result `ACB`.",
        "Because `A` has no other options, the search now backs out to the root and starts again with `B` as the first letter.",
      ],
      metrics: [
        { label: "Found", value: "2", level: "good" },
        { label: "Prefix length", value: "3" },
      ],
      lines: [5, 6, 7, 8, 9],
      scene: view(
        ["A", "B", "C", "AB", "AC", "ABC", "ACB"],
        { A: "done", AB: "done", ABC: "done", AC: "done", ACB: "found" },
        "ACB",
        "record ACB",
        ["ABC", "ACB"],
      ),
    },
    {
      short: "Full tree",
      title: "Six leaves: every ordering",
      body: [
        "Repeat for `B` and `C` as first letter and the tree is complete. Its six leaves, left to right, are `ABC`, `ACB`, `BAC`, `BCA`, `CAB`, `CBA`.",
        "Each path from the root to a leaf is one permutation. No leaf repeats, and none is missing.",
      ],
      chapter: { label: "Result", tone: "green" },
      metrics: [
        { label: "Found", value: "6", level: "good" },
        { label: "Total possible", value: "6", level: "good" },
      ],
      scene: view(
        ["A", "B", "C", "AB", "AC", "BA", "BC", "CA", "CB", ...LEAVES],
        Object.fromEntries(LEAVES.map((l) => [l, "found" as Tone])),
        "",
        "6 leaves = 3! permutations",
        LEAVES,
      ),
    },
    {
      short: "The pattern",
      title: "Choose, explore, un-choose",
      body: [
        "In code: loop over the items. If `used[i]`, skip it. Otherwise set `used[i] = true` and push the item onto the path, recurse, then pop it and set `used[i] = false`.",
        "When the path length equals `n`, copy it into the results. Copying matters because the same list is reused and keeps changing.",
      ],
      metrics: [
        { label: "Found", value: "6", level: "good" },
        { label: "Prefix length", value: "n" },
      ],
      lines: [5, 6, 7, 8, 9, 10, 11],
      scene: scene(
        label("p1", 320, 70, "for each unused item:", { size: 14, weight: 800 }),
        label("p2", 320, 105, "mark used, push to path", { size: 13, tone: "muted" }),
        label("p3", 320, 140, "recurse", { size: 13, tone: "muted" }),
        label("p4", 320, 175, "pop from path, mark unused", { size: 13, tone: "muted" }),
        label("p5", 320, 225, "path.length == n  ->  save a copy", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "Cost",
      title: "Factorial growth",
      body: [
        "There are `n!` permutations and each costs `O(n)` to copy, so the total is `O(n * n!)`. At `n = 10` that is 3,628,800 orderings, and at `n = 15` over a trillion.",
        "Extra memory beyond the results is `O(n)` for the path, the used flags and the recursion stack. Compare subsets, which grow as `2^n`: permutations grow far faster.",
      ],
      chapter: { label: "Recap", tone: "ink" },
      metrics: [
        { label: "Found", value: "n!", level: "warn" },
        { label: "Total possible", value: "n!", level: "warn" },
      ],
      scene: scene(
        label("c1", 320, 70, "n = 3  ->  6", { size: 14, weight: 800 }),
        label("c2", 320, 110, "n = 5  ->  120", { size: 14, weight: 800 }),
        label("c3", 320, 150, "n = 10  ->  3,628,800", { size: 14, weight: 800, tone: "warn" }),
        label("c4", 320, 205, "time O(n * n!)   |   memory O(n)", { size: 13, tone: "muted" }),
      ),
    },
  ],
};
