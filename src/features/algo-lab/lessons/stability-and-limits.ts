import { label, ptr, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

/** Records keyed by their text so a re-sort slides each one to its new place. */
const recs = (vals: string[], tones?: (i: number) => Tone | undefined, y = 150, id = "r") =>
  row(vals, { id, keys: vals, y, tones });

const START = ["3a", "1b", "3c", "2d", "1e"];

// Decision tree for sorting a, b, c: internal nodes are comparisons, leaves are final orders.
const TREE = [
  "a:b",
  "b:c",
  "a:c",
  "abc",
  "a:c",
  "bac",
  "b:c",
  null,
  null,
  "acb",
  "cab",
  null,
  null,
  "bca",
  "cba",
];
const LEAVES = [3, 5, 9, 10, 13, 14];
const leafTones = Object.fromEntries(LEAVES.map((i) => [i, "found" as Tone]));

export const stabilityAndLimits: AlgoLesson = {
  id: "stability-and-limits",
  title: "Stability & the Sorting Limit",
  summary: "Why equal keys keeping their order matters, and why no comparison sort beats n log n.",
  minutes: 12,
  level: "advanced",
  goals: [
    "What a stable sort guarantees for equal keys",
    "Why stability matters when sorting by two fields",
    "How a comparison sort is a decision tree of outcomes",
    "Why log2(n!) comparisons are needed, about n log n",
  ],
  takeaways: [
    "A stable sort keeps items with equal keys in their original relative order; an unstable sort may swap them.",
    "To order by two fields, sort by the less important field first, then by the main one with a stable sort.",
    "A comparison sort must tell n! orderings apart, each comparison has two answers, so it needs at least log2(n!) which is about n log n comparisons.",
  ],
  hud: [
    { label: "Orderings", icon: "layers" },
    { label: "Comparisons", icon: "swap" },
    { label: "Tree depth", icon: "branch" },
    { label: "Stable?", icon: "shield" },
  ],
  pseudocode: [
    "insertion_sort(a):",
    "    for k in 1 .. n - 1:",
    "        x = a[k], j = k - 1",
    "        while j >= 0 and a[j].key > x.key:",
    "            a[j+1] = a[j], j = j - 1",
    "        a[j+1] = x",
    "selection_step(a, k):",
    "    m = index of smallest key in a[k..]",
    "    swap a[k] and a[m]  # may jump over equal keys",
  ],
  steps: [
    {
      short: "Equal keys",
      title: "Two items, same key",
      body: [
        "Each record has a number to sort by and a letter that just rides along: `3a 1b 3c 2d 1e`. Two records share key 3 (`3a`, `3c`) and two share key 1 (`1b`, `1e`).",
        "After sorting by number, what should happen to `3a` and `3c`? The numbers say nothing, so the order between them is up to the algorithm.",
      ],
      metrics: [{ label: "Stable?", value: "?", level: "warn" }],
      scene: scene(
        label("t", 320, 70, "sort by the number only", { size: 13, weight: 800 }),
        recs(START),
      ),
    },
    {
      short: "Stable",
      title: "A stable sort keeps ties in order",
      body: [
        "A stable sort guarantees that equal keys keep their original relative order: `1b` before `1e`, and `3a` before `3c`, exactly as they started.",
        "Result: `1b 1e 2d 3a 3c`. Merge sort, insertion sort and bubble sort are stable.",
      ],
      metrics: [{ label: "Stable?", value: "yes", level: "good" }],
      lines: [4, 5],
      scene: scene(
        label("t", 320, 70, "stable result", { size: 13, weight: 800, tone: "good" }),
        recs(["1b", "1e", "2d", "3a", "3c"], () => "found"),
      ),
    },
    {
      short: "A bad swap",
      title: "How a sort loses the order",
      body: [
        "Selection sort first swaps `1b` to the front: `1b 3a 3c 2d 1e`. Next it wants the smallest of the rest, `1e`, and swaps it with the bar at index 1, the `3a`.",
        "That swap carries `3a` all the way to the end, jumping over `3c`.",
      ],
      callout: {
        kind: "warn",
        text: "A swap between distant positions can leap an item over equal ones. That is the usual way a sort becomes unstable.",
      },
      metrics: [{ label: "Stable?", value: "at risk", level: "warn" }],
      lines: [8, 9],
      scene: scene(
        label("t", 320, 70, "selection sort: swap index 1 with the minimum 1e", {
          size: 13,
          weight: 800,
        }),
        recs(["1b", "3a", "3c", "2d", "1e"], (i) => (i === 1 || i === 4 ? "active" : undefined)),
        ptr("p", "r3a", "will jump past 3c", { side: "above", tone: "warn" }),
      ),
    },
    {
      short: "Unstable",
      title: "Equal keys now reversed",
      body: [
        "Finishing the sort gives `1b 1e 2d 3c 3a`. The numbers are in order, but `3c` now comes before `3a`: ties were reordered.",
        "Quick sort and heap sort behave the same way, and so does selection sort. They are unstable, though each can be made stable by extra work.",
      ],
      metrics: [{ label: "Stable?", value: "no", level: "bad" }],
      lines: [8, 9],
      scene: scene(
        label("t", 320, 70, "unstable result: 3c before 3a", {
          size: 13,
          weight: 800,
          tone: "warn",
        }),
        recs(["1b", "1e", "2d", "3c", "3a"], (i) => (i >= 3 ? "warn" : undefined)),
      ),
    },
    {
      short: "Two fields",
      title: "Why it matters: two sort keys",
      body: [
        "Say a list of people is sorted by name, and you now want to sort by grade but keep names alphabetical inside each grade. Each record shows grade and name: `2-Ann 1-Bob 2-Cy 1-Di 2-Ed`.",
        "The trick: sort by the secondary field first (name, already done), then by the primary field (grade) with a stable sort.",
      ],
      metrics: [{ label: "Stable?", value: "needed", level: "warn" }],
      scene: scene(
        label("t", 320, 70, "alphabetical by name; now sort by grade", { size: 13, weight: 800 }),
        row(["2-Ann", "1-Bob", "2-Cy", "1-Di", "2-Ed"], { id: "p", y: 150, w: 82, gap: 6 }),
      ),
    },
    {
      short: "Stable wins",
      title: "Stable keeps the names in order",
      body: [
        "A stable sort by grade gives `1-Bob 1-Di 2-Ann 2-Cy 2-Ed`: inside each grade the names are still alphabetical, with no extra code.",
        "An unstable sort may return `1-Di 1-Bob 2-Ed 2-Ann 2-Cy`: grades right, names shuffled, and you would need a combined key to repair it.",
      ],
      callout: {
        kind: "tip",
        text: "This is also why radix sort works: each digit pass must be stable so earlier digits are not undone.",
      },
      metrics: [{ label: "Stable?", value: "yes / no" }],
      lines: [4],
      scene: scene(
        label("t1", 320, 70, "stable by grade: names stay in order", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
        row(["1-Bob", "1-Di", "2-Ann", "2-Cy", "2-Ed"], {
          id: "s",
          y: 110,
          w: 82,
          gap: 6,
          tones: () => "found",
        }),
        label("t2", 320, 190, "an unstable sort may scramble them", {
          size: 13,
          weight: 800,
          tone: "warn",
        }),
        row(["1-Di", "1-Bob", "2-Ed", "2-Ann", "2-Cy"], {
          id: "u",
          y: 230,
          w: 82,
          gap: 6,
          tones: () => "warn",
        }),
      ),
    },
    {
      short: "Decision tree",
      title: "Every comparison sort is a tree",
      body: [
        "Sort three values `a b c` using only comparisons. Each comparison has two answers, so the algorithm walks a binary tree: ask `a:b`, go left if `a < b`, right otherwise, and so on.",
        "Each leaf is one final order. Three items can be ordered in 6 ways, so the tree needs at least 6 leaves.",
      ],
      metrics: [
        { label: "Orderings", value: "6" },
        { label: "Tree depth", value: "3" },
      ],
      scene: scene(
        tree(TREE, { width: 520, y: 40, dy: 56, tones: leafTones }),
        label("t", 320, 250, "6 leaves = 3! possible orders", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "A path",
      title: "Depth is the number of comparisons",
      body: [
        "Following one path from the root to a leaf (`a:b`, then `b:c`, then `a:c`, ending in `acb`) uses 3 comparisons. The longest path in the tree is the worst case for that algorithm.",
        "A binary tree with L leaves has depth at least `log2(L)`, so a tree with 6 leaves cannot be shallower than 3 levels.",
      ],
      metrics: [
        { label: "Comparisons", value: "3", level: "warn" },
        { label: "Tree depth", value: "3" },
      ],
      scene: scene(
        tree(TREE, {
          width: 520,
          y: 40,
          dy: 56,
          tones: { ...leafTones, 0: "active", 1: "active", 4: "active", 9: "found" },
          edgeTones: { 1: "active", 4: "active", 9: "active" },
        }),
        label("t", 320, 250, "path a:b, b:c, a:c -> acb: 3 comparisons", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "The limit",
      title: "log2(n!) is about n log n",
      body: [
        "For n items there are `n!` orderings, so any comparison sort needs at least `log2(n!)` comparisons in the worst case. For 10 items that is at least 22; for 1,000 it is about 8,530, close to `n log2 n` (about 9,970).",
        "Mathematically `log2(n!)` grows like `n log n`, so no comparison sort can be faster than `O(n log n)`. Merge sort reaches it.",
      ],
      callout: {
        kind: "insight",
        text: "Counting and radix sort escape the limit because they do not compare elements; they look at key structure instead.",
      },
      metrics: [
        { label: "Orderings", value: "n!", level: "warn" },
        { label: "Comparisons", value: "≥ log₂(n!)", level: "warn" },
      ],
      scene: scene(
        label("e1", 320, 70, "n items -> n! orderings -> depth >= log2(n!)", {
          size: 14,
          weight: 800,
        }),
        label("e2", 320, 130, "n = 3: 6 orders -> at least 3 comparisons", { size: 13 }),
        label("e3", 320, 165, "n = 10: 3,628,800 orders -> at least 22", { size: 13 }),
        label("e4", 320, 200, "n = 1,000: about 8,530 vs n log2 n = 9,970", { size: 13 }),
        label("e5", 320, 245, "so comparison sorts cannot beat O(n log n)", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
