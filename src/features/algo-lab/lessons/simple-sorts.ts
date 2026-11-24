import { bars, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

/** Bars keyed by their value so every swap slides the two bars to their new places. */
function view(vals: number[], tones: Record<number, Tone>, msg: string, extra: Item[] = []) {
  return scene(
    label("msg", 320, 50, msg, { size: 13, weight: 800 }),
    bars(vals, { keys: vals, index: true, tones, y: 205 }),
    extra,
  );
}

const START = [5, 2, 4, 1, 3];

export const simpleSorts: AlgoLesson = {
  id: "simple-sorts",
  title: "Simple Sorts",
  summary: "Bubble, selection and insertion sort on one small array, with the cost counted.",
  minutes: 13,
  level: "beginner",
  goals: [
    "How bubble, selection and insertion sort each build a sorted array",
    "What a comparison and a swap cost",
    "Why all three take O(n²) time in general",
    "Why insertion sort shines on nearly sorted data",
  ],
  takeaways: [
    "All three simple sorts compare many pairs, so they take O(n²) time on a random array of n items.",
    "Selection sort does the fewest swaps; bubble sort the most; insertion sort moves items only as far as needed.",
    "Insertion sort needs about n comparisons on nearly sorted data, which is why real libraries use it for small or almost-ordered pieces.",
  ],
  hud: [
    { label: "Compares", icon: "search" },
    { label: "Moves", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "bubble_pass(a):",
    "    for i in 0 .. n - 2:",
    "        if a[i] > a[i+1]: swap them",
    "selection_step(a, k):",
    "    m = index of smallest value in a[k..]",
    "    swap a[k] and a[m]",
    "insertion_step(a, k):",
    "    x = a[k], j = k - 1",
    "    while j >= 0 and a[j] > x:",
    "        a[j+1] = a[j], j = j - 1",
    "    a[j+1] = x",
  ],
  steps: [
    {
      short: "Same array",
      title: "Three ways to sort five bars",
      body: [
        "We will sort `5, 2, 4, 1, 3` into increasing order three different ways, and count two kinds of work: comparisons (is one bar bigger than another?) and moves (a swap or a shift).",
        "These are the sorts you can write without thinking. They are slow on big inputs but they teach how every sort is built.",
      ],
      metrics: [
        { label: "Compares", value: "0", level: "good" },
        { label: "Moves", value: "0", level: "good" },
      ],
      scene: view(START, {}, "unsorted: 5 2 4 1 3"),
    },
    {
      short: "Bubble: look",
      title: "Bubble sort compares neighbours",
      body: [
        "Walk left to right and compare each adjacent pair. The first pair is `5` and `2`, and `5 > 2`, so they are out of order.",
      ],
      metrics: [
        { label: "Compares", value: "1", level: "good" },
        { label: "Moves", value: "0", level: "good" },
      ],
      lines: [2, 3],
      scene: view(START, { 0: "active", 1: "active" }, "5 > 2: swap them"),
    },
    {
      short: "Bubble: swap",
      title: "Swap and keep going",
      body: [
        "Swapping puts `2` first. The big `5` now sits one step to the right, and it will be compared with `4` next and keep travelling right while it is the larger one.",
      ],
      callout: {
        kind: "insight",
        text: "Big values bubble to the right like bubbles rising; that is where the name comes from.",
      },
      metrics: [
        { label: "Compares", value: "1", level: "good" },
        { label: "Moves", value: "1", level: "good" },
      ],
      lines: [3],
      scene: view([2, 5, 4, 1, 3], { 0: "plain", 1: "active", 2: "active" }, "next pair: 5 vs 4"),
    },
    {
      short: "Bubble: pass 1",
      title: "One pass fixes the largest",
      body: [
        "After the whole pass (4 comparisons, 4 swaps) the `5` has travelled all the way to the end, its final place.",
        "Each pass settles one more bar on the right, so n bars need up to n - 1 passes of up to n - 1 comparisons.",
      ],
      metrics: [
        { label: "Compares", value: "4", level: "good" },
        { label: "Moves", value: "4", level: "warn" },
      ],
      lines: [2, 3],
      scene: view([2, 4, 1, 3, 5], { 4: "done" }, "5 is in its final place"),
    },
    {
      short: "Selection",
      title: "Selection sort picks the minimum",
      body: [
        "Scan the unsorted part for its smallest bar: the `1` at index 3 (4 comparisons). Swap it with the bar at index 0.",
        "That is just one swap, and `1` is now in its final place. Repeat for the next position. Selection sort never does more than n - 1 swaps.",
      ],
      callout: {
        kind: "warn",
        text: "It always scans the whole rest of the array, so even a sorted input costs n(n - 1) / 2 comparisons.",
      },
      metrics: [
        { label: "Compares", value: "4", level: "good" },
        { label: "Moves", value: "1", level: "good" },
      ],
      lines: [5, 6],
      scene: view([1, 2, 4, 5, 3], { 0: "done", 3: "mark" }, "swap(0, 3): the minimum lands first"),
    },
    {
      short: "Insertion",
      title: "Insertion sort grows a sorted prefix",
      body: [
        "Keep the left part sorted, like cards in your hand. After taking in `5, 2, 4` the prefix is `2, 4, 5`, and the next card is `1`.",
        "Compare `1` with the prefix from the right: it is smaller than `5`, so `5` shifts right, and so on until it finds its spot.",
      ],
      metrics: [
        { label: "Compares", value: "3", level: "good" },
        { label: "Moves", value: "2", level: "good" },
      ],
      lines: [7, 8],
      scene: view(
        [2, 4, 5, 1, 3],
        { 0: "mark", 1: "mark", 2: "mark", 3: "active" },
        "insert 1 into 2 4 5",
      ),
    },
    {
      short: "Slide left",
      title: "The new card slides into place",
      body: [
        "`1` is smaller than `5`, `4` and `2`, so all three shift one step right and `1` drops in front. That took 3 more comparisons and 3 more shifts.",
        "The shifts are why a reversed array is the worst case: every new item travels the full prefix.",
      ],
      metrics: [
        { label: "Compares", value: "6", level: "good" },
        { label: "Moves", value: "5", level: "warn" },
      ],
      lines: [9, 10, 11],
      scene: view(
        [1, 2, 4, 5, 3],
        { 0: "mark", 1: "mark", 2: "mark", 3: "mark", 4: "active" },
        "prefix 1 2 4 5, next card: 3",
      ),
    },
    {
      short: "Nearly sorted",
      title: "Where insertion sort wins",
      body: [
        "Take `1, 2, 3, 5, 4`: only the last pair is swapped. Insertion sort checks each item against its left neighbour, finds it already in place, and moves on.",
        "The whole array costs about 5 comparisons and a single shift. Bubble sort and selection sort would still spend about 10 comparisons.",
      ],
      callout: {
        kind: "tip",
        text: "On nearly sorted data insertion sort runs in close to O(n), which is why hybrid sorts use it on small pieces.",
      },
      metrics: [
        { label: "Compares", value: "5", level: "good" },
        { label: "Moves", value: "1", level: "good" },
        { label: "Cost", value: "≈ n", level: "good" },
      ],
      lines: [9],
      scene: view([1, 2, 3, 5, 4], { 3: "active", 4: "active" }, "only 5 and 4 are out of order", [
        ptr("p", "b4", "one shift fixes it", { tone: "found" }),
      ]),
    },
    {
      short: "The cost",
      title: "Why they are all O(n²)",
      body: [
        "In the bad cases all three do on the order of `n(n - 1) / 2` comparisons: for `n = 5` that is 10, for `n = 1000` about half a million.",
        "Doubling the input quadruples the work. That is fine for a few dozen items and painful for millions, which is what the faster sorts in the next lessons fix.",
      ],
      callout: {
        kind: "insight",
        text: "Bubble and insertion sort are stable and use O(1) extra memory; selection sort is not stable.",
      },
      metrics: [
        { label: "Compares", value: "n²/2", level: "bad" },
        { label: "Cost", value: "O(n²)", level: "bad" },
      ],
      scene: scene(
        label("n1", 320, 70, "n = 5: 10 comparisons", { size: 14, weight: 800 }),
        label("n2", 320, 115, "n = 1,000: about 500,000", { size: 14, weight: 800 }),
        label("n3", 320, 160, "n = 1,000,000: about 500,000,000,000", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        label("n4", 320, 220, "double the input, quadruple the work", { size: 13, tone: "muted" }),
      ),
    },
  ],
};
