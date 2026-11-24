import { label, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Tone } from "../lib/types";

// Level-order values of the full decision tree for {1,2,3}.
// Left child = skip the item, right child = take it.
const FULL: string[] = [
  "∅",
  "∅",
  "1",
  "∅",
  "2",
  "1",
  "12",
  "∅",
  "3",
  "2",
  "23",
  "1",
  "13",
  "12",
  "123",
];

/** The decision tree with only the first `shown` nodes (level-order) revealed. */
function view(
  shown: number,
  tones: Record<number, Tone> = {},
  edgeTones: Record<number, EdgeTone> = {},
  note?: string,
  extra: string[] = [],
) {
  const values = FULL.map((v, i) => (i < shown ? v : null));
  const levels = shown > 7 ? 4 : shown > 3 ? 3 : shown > 1 ? 2 : 1;
  return scene(
    tree(values, { x: 320, y: 40, width: 480, dy: 58, r: 18, tones, edgeTones }),
    ["item 1", "item 2", "item 3"]
      .slice(0, levels - 1)
      .map((t, i) =>
        label(`lv${i}`, -60, 69 + i * 58, t, { size: 11, tone: "muted", anchor: "start" }),
      ),
    note && label("note", 320, 270, note, { size: 13, weight: 800 }),
    ...extra.map((t, i) => label(`x${i}`, 320, 300 + i * 22, t, { size: 12, tone: "muted" })),
  );
}

const LEAVES = [7, 8, 9, 10, 11, 12, 13, 14];
const allFound: Record<number, Tone> = Object.fromEntries(LEAVES.map((i) => [i, "found"]));

export const subsets: AlgoLesson = {
  id: "subsets",
  title: "Subsets",
  summary: "List every subset of a set by deciding include or exclude for each element.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How include or exclude choices form a decision tree",
    "Why a set of n items has 2^n subsets",
    "The choose, explore, un-choose pattern of backtracking",
    "What time and memory the search needs",
  ],
  takeaways: [
    "Each element is either in or out, so n elements give 2^n leaves in the decision tree: 2^n subsets.",
    "Backtracking is choose, explore, un-choose: change the shared state, recurse, then restore it exactly.",
    "Time is O(n * 2^n) because each result is copied, and the recursion stack is only O(n) deep.",
  ],
  hud: [
    { label: "Subsets found", icon: "list" },
    { label: "Depth", icon: "branch" },
    { label: "Total possible", icon: "sigma" },
  ],
  pseudocode: [
    "explore(i):",
    "    if i == n:",
    "        record a copy of chosen",
    "        return",
    "    explore(i + 1)",
    "    add items[i] to chosen",
    "    explore(i + 1)",
    "    remove items[i] from chosen",
  ],
  steps: [
    {
      short: "The goal",
      title: "All subsets of {1, 2, 3}",
      body: [
        "A subset keeps some of the items and drops the rest, in any combination: `{}`, `{1}`, `{1,2}`, `{1,2,3}` and so on, including the empty set and the full set.",
        "How many are there? Each of the three items is independently in or out, so `2 * 2 * 2 = 8`.",
      ],
      metrics: [
        { label: "Subsets found", value: "0" },
        { label: "Total possible", value: "8" },
      ],
      scene: scene(
        row([1, 2, 3], { y: 130, index: true }),
        label("q", 320, 220, "how many subsets? every item is in or out: 2 x 2 x 2", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Decide",
      title: "One yes-or-no per element",
      body: [
        "Walk through the items in order and decide for each: skip it or take it. Start with an empty subset at the root, shown here as `∅`.",
        "The tree below grows one level per item. A left branch means skip, a right branch means take.",
      ],
      callout: {
        kind: "insight",
        text: "Instead of generating subsets, we generate decisions. Each full list of decisions is exactly one subset.",
      },
      metrics: [
        { label: "Subsets found", value: "0" },
        { label: "Depth", value: "0" },
      ],
      lines: [5, 6, 7],
      scene: view(1, { 0: "active" }, {}, "empty so far: undecided on 1, 2 and 3"),
    },
    {
      short: "Item 1",
      title: "Decide item 1",
      body: [
        "Two children: skipping `1` keeps `∅`, taking `1` gives `{1}`. Both are still partial, because items 2 and 3 are undecided.",
      ],
      metrics: [
        { label: "Subsets found", value: "0" },
        { label: "Depth", value: "1" },
      ],
      lines: [5, 6, 7],
      scene: view(3, { 0: "done", 2: "active" }, {}, "left: skip 1    right: take 1"),
    },
    {
      short: "Item 2",
      title: "Decide item 2 in both branches",
      body: [
        "Every node now splits again. After deciding 1 and 2 there are four partial sets: `∅`, `{2}`, `{1}` and `{1,2}`.",
        "The tree doubles at each level: 1, 2, 4, and next 8.",
      ],
      metrics: [
        { label: "Subsets found", value: "0" },
        { label: "Depth", value: "2" },
      ],
      lines: [5, 6, 7],
      scene: view(7, { 6: "active" }, {}, "four partial subsets after two decisions"),
    },
    {
      short: "First leaf",
      title: "Going all the way down",
      body: [
        "Follow take, take, take: the path ends at a leaf holding `{1,2,3}`. All three decisions are made, so this is a finished subset. Record it.",
        "Depth-first search goes straight to a leaf before trying anything else, so the choices so far are held in one shared list.",
      ],
      chapter: { label: "Path", tone: "blue" },
      metrics: [
        { label: "Subsets found", value: "1", level: "good" },
        { label: "Depth", value: "3" },
      ],
      lines: [2, 3, 4],
      scene: view(
        15,
        { 0: "done", 2: "done", 6: "done", 14: "found" },
        { 2: "found", 6: "found", 14: "found" },
        "recorded: {1, 2, 3}",
      ),
    },
    {
      short: "Un-choose",
      title: "Back up and try the other choice",
      body: [
        "To explore the other branch of item 3, undo the last decision: remove `3` from the shared list and return to the node for `{1,2}`.",
        "Now take the skip branch: the leaf `{1,2}`. Restoring state before trying the next option is the heart of backtracking.",
      ],
      callout: {
        kind: "tip",
        text: "If you forget to un-choose, the leftover `3` leaks into every later branch and you get wrong subsets.",
      },
      metrics: [
        { label: "Subsets found", value: "2", level: "good" },
        { label: "Depth", value: "3" },
      ],
      lines: [8, 5],
      scene: view(
        15,
        { 0: "done", 2: "done", 6: "active", 14: "done", 13: "found" },
        { 6: "found", 13: "found" },
        "undo 3, then record {1, 2}",
      ),
    },
    {
      short: "All eight",
      title: "Eight leaves, eight subsets",
      body: [
        "Keep going the same way and every leaf is visited once. Reading the leaves left to right gives `{}`, `{3}`, `{2}`, `{2,3}`, `{1}`, `{1,3}`, `{1,2}` and `{1,2,3}`.",
        "Eight leaves, matching `2^3`. Each subset appears exactly once, with no duplicates and none missing.",
      ],
      chapter: { label: "Result", tone: "green" },
      metrics: [
        { label: "Subsets found", value: "8", level: "good" },
        { label: "Total possible", value: "8", level: "good" },
      ],
      scene: view(15, allFound, {}, "8 leaves = 8 subsets"),
    },
    {
      short: "The pattern",
      title: "Choose, explore, un-choose",
      body: [
        "Every backtracking solution has this shape. Choose: change the shared state (add an item). Explore: recurse into the next decision. Un-choose: undo the change so the next option starts clean.",
        "For subsets the recursion is `explore(i)`: if `i == n`, record a copy of the list; otherwise explore without item `i`, then add it, explore, and remove it again.",
      ],
      metrics: [
        { label: "Subsets found", value: "8", level: "good" },
        { label: "Depth", value: "n" },
      ],
      lines: [5, 6, 7, 8],
      scene: scene(
        label("p1", 320, 80, "choose:     path.push(item)", { size: 14, weight: 800 }),
        label("p2", 320, 125, "explore:    recurse(i + 1)", { size: 14, weight: 800 }),
        label("p3", 320, 170, "un-choose:  path.pop()", { size: 14, weight: 800 }),
        label("p4", 320, 225, "the list is shared, so it must be restored", {
          size: 12,
          tone: "muted",
        }),
      ),
    },
    {
      short: "Cost",
      title: "How much work and memory",
      body: [
        "There are `2^n` leaves and each stores up to `n` items, so time is `O(n * 2^n)`. That doubles with every extra element, so this is only practical for about 20 items or fewer.",
        "Memory beyond the output is just the recursion stack and the shared list: `O(n)`.",
      ],
      chapter: { label: "Recap", tone: "ink" },
      metrics: [
        { label: "Subsets found", value: "2^n", level: "warn" },
        { label: "Depth", value: "n", level: "good" },
        { label: "Total possible", value: "2^n", level: "warn" },
      ],
      scene: scene(
        label("c1", 320, 70, "n = 3  ->  8 subsets", { size: 14, weight: 800 }),
        label("c2", 320, 110, "n = 10  ->  1,024 subsets", { size: 14, weight: 800 }),
        label("c3", 320, 150, "n = 20  ->  1,048,576 subsets", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        label("c4", 320, 205, "time O(n * 2^n)   |   stack O(n)", { size: 13, tone: "muted" }),
      ),
    },
  ],
};
