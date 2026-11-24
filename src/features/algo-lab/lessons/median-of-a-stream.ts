import { label, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

/** Two heaps side by side: the lower half (max-heap) on the left, the upper half (min-heap) on the right. */
function view(
  lo: number[],
  hi: number[],
  median: string,
  tones: { lo?: Record<number, Tone>; hi?: Record<number, Tone> } = {},
) {
  const sorted = [...lo, ...hi].sort((a, b) => a - b);
  return scene(
    label("tl", 170, 24, "lower half: max-heap", { size: 12, tone: "muted" }),
    label("th", 470, 24, "upper half: min-heap", { size: 12, tone: "muted" }),
    lo.length
      ? tree(lo, { id: "l", x: 170, y: 70, width: 150, dy: 50, r: 18, keys: lo, tones: tones.lo })
      : label("el", 170, 75, "empty", { tone: "muted", size: 12 }),
    hi.length
      ? tree(hi, { id: "h", x: 470, y: 70, width: 150, dy: 50, r: 18, keys: hi, tones: tones.hi })
      : label("eh", 470, 75, "empty", { tone: "muted", size: 12 }),
    label("median", 320, 215, median, { size: 15, weight: 800, tone: "good" }),
    label("sorted", 320, 255, sorted.length ? `all values: ${sorted.join(" ")}` : "all values: —", {
      size: 12,
      tone: "muted",
    }),
  );
}

export const medianOfAStream: AlgoLesson = {
  id: "median-of-a-stream",
  title: "Median of a Stream",
  summary:
    "Track the running median with two heaps that split the data into a lower and an upper half.",
  minutes: 14,
  level: "advanced",
  goals: [
    "Why re-sorting after every insert is too slow",
    "How a max-heap and a min-heap split the data in half",
    "The insert-then-rebalance rule",
    "How to read the median in O(1) and the cost of an insert",
  ],
  takeaways: [
    "Keep the smaller half in a max-heap and the larger half in a min-heap, so the two roots are the two middle values.",
    "After each insert, move one root across if the sizes differ by more than one, which keeps the halves balanced.",
    "The median is the root of the bigger heap, or the average of both roots when the sizes are equal: O(1) to read, O(log n) to update.",
  ],
  hud: [
    { label: "Lower size", icon: "layers" },
    { label: "Upper size", icon: "layers" },
    { label: "Median", icon: "gauge" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "add(x):",
    "    if lower is empty or x <= root(lower): push x to lower",
    "    else: push x to upper",
    "    if size(lower) > size(upper) + 1:",
    "        move root(lower) to upper",
    "    else if size(upper) > size(lower):",
    "        move root(upper) to lower",
    "median():",
    "    if sizes are equal: return average of the two roots",
    "    return root(lower)",
  ],
  steps: [
    {
      short: "The task",
      title: "A median that keeps changing",
      body: [
        "Numbers arrive one by one: `5, 2, 8, 1, 9, 4`. After each, we want the median: the middle value, or the average of the two middle values when the count is even.",
        "Sorting after every arrival costs `O(n log n)` each time. Keeping a sorted array costs `O(n)` per insert. We want something faster and with an instant answer.",
      ],
      metrics: [
        { label: "Lower size", value: "0" },
        { label: "Upper size", value: "0" },
        { label: "Median", value: "—" },
        { label: "Cost", value: "naive: O(n)", level: "bad" },
      ],
      scene: view([], [], "median: not defined yet"),
    },
    {
      short: "Two halves",
      title: "Split the data into two halves",
      body: [
        "Think of the sorted values as a line. Cut it in the middle: the smaller half on the left and the larger half on the right.",
        "We only ever need the largest value of the left half and the smallest of the right half, because those two sit at the cut. So the left half lives in a max-heap and the right half in a min-heap.",
      ],
      callout: {
        kind: "insight",
        text: "A heap hands back its extreme value instantly. The extremes we need are exactly the two middle values.",
      },
      metrics: [
        { label: "Lower size", value: "0" },
        { label: "Upper size", value: "0" },
        { label: "Median", value: "—" },
      ],
      scene: view([], [], "max-heap root  <=  min-heap root"),
    },
    {
      short: "Insert 5",
      title: "The first value",
      body: [
        "The rule: a new value goes into the lower heap if it is at most that heap's root (or the heap is empty), otherwise into the upper heap. Then we rebalance.",
        "`5` goes into the lower heap. Sizes are `1` and `0`, which is allowed, so the median is just `5`.",
      ],
      metrics: [
        { label: "Lower size", value: "1" },
        { label: "Upper size", value: "0" },
        { label: "Median", value: "5", level: "good" },
        { label: "Cost", value: "O(log n)" },
      ],
      lines: [2, 9, 10],
      scene: view([5], [], "median = 5 (root of the bigger heap)", { lo: { 0: "mark" } }),
    },
    {
      short: "Insert 2",
      title: "A value for the lower half",
      body: [
        "`2 <= 5`, so it joins the lower heap. Now the sizes are `2` and `0`: the halves differ by two, which breaks our balance rule.",
        "The lower heap may be at most one item larger than the upper heap, so we must move one item across.",
      ],
      metrics: [
        { label: "Lower size", value: "2", level: "warn" },
        { label: "Upper size", value: "0" },
        { label: "Median", value: "?" },
      ],
      lines: [2, 4],
      scene: view([5, 2], [], "sizes 2 and 0: out of balance", { lo: { 1: "active", 0: "warn" } }),
    },
    {
      short: "Rebalance",
      title: "Move the top across",
      body: [
        "Take the root of the lower heap, `5`, the largest value of that half, and push it into the upper heap. Now each half has one value: `2` on the left and `5` on the right.",
        "With equal sizes, the median is the average of the two roots: `(2 + 5) / 2 = 3.5`.",
      ],
      metrics: [
        { label: "Lower size", value: "1" },
        { label: "Upper size", value: "1" },
        { label: "Median", value: "3.5", level: "good" },
        { label: "Cost", value: "2 × O(log n)" },
      ],
      lines: [4, 5, 9],
      scene: view([2], [5], "median = (2 + 5) / 2 = 3.5", { lo: { 0: "mark" }, hi: { 0: "mark" } }),
    },
    {
      short: "Insert 8",
      title: "A value for the upper half",
      body: [
        "`8 > 2`, the lower root, so it goes into the upper heap, which then holds `5` and `8`. Sizes `1` and `2` are unbalanced the other way, so the smaller root `5` moves back to the lower heap.",
        "Now the lower heap is `5, 2` and the upper heap is `8`. The lower heap is one larger, so the median is its root: `5`.",
      ],
      callout: {
        kind: "tip",
        text: "The invariant is simple: the lower heap has the same size as the upper one, or one more.",
      },
      metrics: [
        { label: "Lower size", value: "2" },
        { label: "Upper size", value: "1" },
        { label: "Median", value: "5", level: "good" },
      ],
      lines: [3, 6, 7, 10],
      scene: view([5, 2], [8], "median = 5 (root of the bigger heap)", {
        lo: { 0: "mark" },
        hi: { 0: "mark" },
      }),
    },
    {
      short: "Insert 1",
      title: "Going back to the lower half",
      body: [
        "`1 <= 5`, so it joins the lower heap, making it size `3` against `1`. We move the lower root `5` across, which gives lower `2, 1` and upper `5, 8`.",
        "Sizes are equal, so the median is `(2 + 5) / 2 = 3.5`. Sorted, the four values are `1 2 5 8`, and the middle two are indeed `2` and `5`.",
      ],
      metrics: [
        { label: "Lower size", value: "2" },
        { label: "Upper size", value: "2" },
        { label: "Median", value: "3.5", level: "good" },
      ],
      lines: [2, 4, 5, 9],
      scene: view([2, 1], [5, 8], "median = (2 + 5) / 2 = 3.5", {
        lo: { 0: "mark" },
        hi: { 0: "mark" },
      }),
    },
    {
      short: "9 and 4",
      title: "The rest of the stream",
      body: [
        "`9` goes up and `5` shifts down to rebalance; then `4` goes into the lower heap and the lower root, now `5`, moves up again. The final state is lower `4, 1, 2` and upper `5, 8, 9`.",
        "The two roots are `4` and `5`, so the median is `4.5`, which matches the sorted values `1 2 4 5 8 9`.",
      ],
      metrics: [
        { label: "Lower size", value: "3" },
        { label: "Upper size", value: "3" },
        { label: "Median", value: "4.5", level: "good" },
      ],
      lines: [2, 3, 4, 5, 6, 7, 9],
      scene: view([4, 1, 2], [5, 8, 9], "median = (4 + 5) / 2 = 4.5", {
        lo: { 0: "mark" },
        hi: { 0: "mark" },
      }),
    },
    {
      short: "Cost",
      title: "Cheap updates, instant reads",
      body: [
        "Each insert does one heap push and at most one pop and push to rebalance, so it costs `O(log n)`. Reading the median looks at one or two roots, so it is `O(1)`.",
        "Over `n` values that is `O(n log n)` total, instead of `O(n^2)` for re-sorting, with `O(n)` memory for the stored values.",
      ],
      callout: {
        kind: "warn",
        text: "Use a max-heap for the lower half. If both halves were min-heaps, you could not reach the largest value of the lower half.",
      },
      metrics: [
        { label: "Lower size", value: "ceil(n/2)" },
        { label: "Upper size", value: "floor(n/2)" },
        { label: "Median", value: "O(1)", level: "good" },
        { label: "Cost", value: "O(log n)", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 80, "insert: O(log n)", { size: 15, weight: 800, tone: "good" }),
        label("r2", 320, 125, "read median: O(1)", { size: 15, weight: 800, tone: "good" }),
        label("r3", 320, 170, "odd count: root of the bigger heap", { size: 13 }),
        label("r4", 320, 205, "even count: average of the two roots", { size: 13 }),
      ),
    },
  ],
};
