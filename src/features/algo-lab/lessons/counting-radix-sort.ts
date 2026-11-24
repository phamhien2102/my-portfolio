import { cell, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const IN = [3, 1, 4, 1, 0, 3, 1, 4];
const COUNTS = [1, 3, 0, 2, 2];
const OUT = [0, 1, 1, 1, 3, 3, 4, 4];
const NUMS = [170, 45, 75, 90, 802, 24, 2, 66];

const inRow = (tones?: (i: number) => Tone | undefined) =>
  row(IN, { id: "a", y: 60, w: 46, gap: 6, tones });

/** Numbers keyed by value (so passes slide them), each captioned with the digit being sorted on. */
function nums(vals: number[], div: number, tone?: Tone) {
  const w = 52;
  const gap = 8;
  const start = 320 - (vals.length * (w + gap) - gap) / 2 + w / 2;
  return vals.map((v, i) =>
    cell(`r${v}`, start + i * (w + gap), 150, v, {
      w,
      h: 46,
      sub: String(Math.floor(v / div) % 10),
      tone,
    }),
  );
}

export const countingRadixSort: AlgoLesson = {
  id: "counting-radix-sort",
  title: "Counting & Radix Sort",
  summary: "Sort without comparing items: count small integers, then sort digit by digit.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "How counting sort rebuilds an array from tallies",
    "Why it can beat the O(n log n) comparison limit",
    "How radix sort chains stable counting passes over the digits",
    "When these sorts are a good or a bad idea",
  ],
  takeaways: [
    "Counting sort tallies how often each value in 0..k-1 occurs and rewrites the array from the tallies: O(n + k) time and O(k) extra space.",
    "Radix sort runs a stable counting pass for each digit from least to most significant: O(d(n + k)) for d digits in base k.",
    "These sorts use the values' structure instead of comparisons, so they need small integer keys and stability in every pass.",
  ],
  hud: [
    { label: "Comparisons", icon: "swap" },
    { label: "Count slots", icon: "grid" },
    { label: "Passes", icon: "layers" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "counting_sort(a, k):",
    "    count = array of k zeros",
    "    for x in a: count[x] = count[x] + 1",
    "    out = []",
    "    for v in 0 .. k - 1:",
    "        append v to out count[v] times",
    "    return out",
    "radix_sort(a, d):",
    "    for digit in 1 .. d (least significant first):",
    "        a = stable_counting_sort(a, by this digit)",
    "    return a",
  ],
  steps: [
    {
      short: "The problem",
      title: "Small whole numbers",
      body: [
        "Sort `3 1 4 1 0 3 1 4`. Every value is an integer between 0 and 4. That is extra information a comparison sort ignores.",
        "Counting sort uses it: instead of asking who is bigger, it asks how many times each value occurs.",
      ],
      metrics: [
        { label: "Comparisons", value: "0", level: "good" },
        { label: "Count slots", value: "5" },
      ],
      scene: scene(inRow()),
    },
    {
      short: "Tally",
      title: "Count as you read",
      body: [
        "Make a count array with one slot for each possible value, `0` to `4`, all zero. Read the input once and add one to the slot of each value you see.",
        "After the first three items `3 1 4`, slots 1, 3 and 4 each hold 1.",
      ],
      metrics: [
        { label: "Comparisons", value: "0", level: "good" },
        { label: "Count slots", value: "5" },
      ],
      lines: [2, 3],
      scene: scene(
        inRow((i) => (i < 3 ? "active" : undefined)),
        row([0, 1, 0, 1, 1], { id: "c", y: 160, w: 46, gap: 6, index: true }),
        label("lc", 320, 215, "count of each value 0..4", { size: 12, tone: "muted" }),
        ptr("rd", "a2", "reading", { side: "above", tone: "active" }),
      ),
    },
    {
      short: "Tally done",
      title: "The full tally",
      body: [
        "One pass over all 8 items gives the counts: one `0`, three `1`s, no `2`, two `3`s, two `4`s.",
        "That is n steps with no comparison between input values at all.",
      ],
      metrics: [
        { label: "Comparisons", value: "0", level: "good" },
        { label: "Cost", value: "n", level: "good" },
      ],
      lines: [3],
      scene: scene(
        inRow(),
        row(COUNTS, {
          id: "c",
          y: 160,
          w: 46,
          gap: 6,
          index: true,
          tones: (i) => (COUNTS[i] === 0 ? "ghost" : "active"),
        }),
        label("lc", 320, 215, "count of each value 0..4", { size: 12, tone: "muted" }),
      ),
    },
    {
      short: "Rebuild",
      title: "Write the values back out",
      body: [
        "Walk the count array in order and write each value as many times as its count: one `0`, three `1`s, none of `2`, two `3`s, two `4`s.",
        "The output `0 1 1 1 3 3 4 4` is sorted, because the slots themselves are already in increasing order.",
      ],
      callout: {
        kind: "insight",
        text: "The index of the count array does the sorting. Position in memory is the comparison.",
      },
      metrics: [
        { label: "Comparisons", value: "0", level: "good" },
        { label: "Cost", value: "n + k", level: "good" },
      ],
      lines: [5, 6],
      scene: scene(
        inRow(() => "muted"),
        row(COUNTS, { id: "c", y: 150, w: 46, gap: 6, index: true, tones: () => "muted" }),
        row(OUT, { id: "o", y: 245, w: 46, gap: 6, tones: () => "done" }),
      ),
    },
    {
      short: "The catch",
      title: "O(n + k), and k matters",
      body: [
        "Counting sort takes `O(n + k)` time and `O(k)` extra space, where `k` is the number of possible values. For ages or exam scores that is tiny, and it beats `n log n`.",
        "For arbitrary 32-bit integers, k is about four billion, and the count array alone would be far larger than the data.",
      ],
      callout: {
        kind: "warn",
        text: "Counting sort only suits integer-like keys in a small range. Keeping equal records in order also needs prefix sums, so each value knows where its block starts.",
      },
      metrics: [
        { label: "Count slots", value: "k", level: "warn" },
        { label: "Cost", value: "O(n + k)", level: "good" },
      ],
      scene: scene(
        label("c1", 320, 80, "values 0..4: 5 slots, fine", { size: 14, weight: 800, tone: "good" }),
        label("c2", 320, 135, "values 0..4,000,000,000: 4 billion slots", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        label("c3", 320, 195, "radix sort fixes this by sorting one digit at a time", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
    {
      short: "Digits",
      title: "Radix: sort digit by digit",
      body: [
        "Now take big numbers: `170 45 75 90 802 24 2 66`. Sort them by the last digit, then by the tens digit, then by the hundreds digit, always starting from the least significant one.",
        "Each pass has only 10 possible digits, so each is a cheap counting sort. The small caption under each number is its ones digit.",
      ],
      metrics: [
        { label: "Passes", value: "0 of 3" },
        { label: "Count slots", value: "10" },
      ],
      lines: [9],
      scene: scene(
        label("l", 320, 70, "sorting on the ones digit first", { size: 13, weight: 800 }),
        nums(NUMS, 1),
      ),
    },
    {
      short: "Ones pass",
      title: "Pass 1: the ones digit",
      body: [
        "Counting sort by the ones digit gives `170 90 802 2 24 45 75 66`. The digits underneath read `0 0 2 2 4 5 5 6`.",
        "Equal digits keep their previous order (`170` before `90`, `45` before `75`). This stability is not optional; the later passes rely on it.",
      ],
      callout: {
        kind: "tip",
        text: "Stable means 'ties keep their earlier order'. Without it, a pass would scramble the work done by the passes before it.",
      },
      metrics: [
        { label: "Passes", value: "1 of 3" },
        { label: "Comparisons", value: "0", level: "good" },
      ],
      lines: [10],
      scene: scene(
        label("l", 320, 70, "sorted by the ones digit", { size: 13, weight: 800 }),
        nums([170, 90, 802, 2, 24, 45, 75, 66], 1),
      ),
    },
    {
      short: "Tens pass",
      title: "Pass 2: the tens digit",
      body: [
        "Now sort by the tens digit, keeping ties in their current order: `802 2 24 45 66 170 75 90`.",
        "Look at `170` and `75`: both have tens digit 7, and `170` stays first because its ones digit (0) was already smaller. The earlier pass is preserved.",
      ],
      metrics: [
        { label: "Passes", value: "2 of 3" },
        { label: "Comparisons", value: "0", level: "good" },
      ],
      lines: [10],
      scene: scene(
        label("l", 320, 70, "sorted by the tens digit", { size: 13, weight: 800 }),
        nums([802, 2, 24, 45, 66, 170, 75, 90], 10),
      ),
    },
    {
      short: "Hundreds",
      title: "Pass 3: the hundreds digit",
      body: [
        "The last pass, on the hundreds digit, gives `2 24 45 66 75 90 170 802`. All eight numbers are in order.",
        "Each pass ordered the numbers by one more digit of significance, and stability kept the lower digits' order inside ties.",
      ],
      metrics: [
        { label: "Passes", value: "3 of 3", level: "good" },
        { label: "Comparisons", value: "0", level: "good" },
      ],
      lines: [10, 11],
      scene: scene(
        label("l", 320, 70, "sorted by the hundreds digit: sorted", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
        nums([2, 24, 45, 66, 75, 90, 170, 802], 100, "done"),
      ),
    },
    {
      short: "The cost",
      title: "O(d(n + k))",
      body: [
        "Each of the d passes is a counting sort over n items with k = 10 digit values, so radix sort costs `O(d(n + k))`. For 32-bit integers in base 256 that is 4 passes, close to linear in n.",
        "It is not a general replacement: it needs fixed-width integer-like keys, extra memory, and no way to sort by a custom comparison.",
      ],
      callout: {
        kind: "insight",
        text: "Counting and radix sort never compare two elements, so the n log n comparison limit does not apply to them.",
      },
      metrics: [
        { label: "Cost", value: "O(d(n + k))", level: "good" },
        { label: "Passes", value: "d" },
      ],
      scene: scene(
        label("c1", 320, 80, "counting sort: O(n + k)", { size: 15, weight: 800 }),
        label("c2", 320, 130, "radix sort: d passes of counting sort", { size: 14 }),
        label("c3", 320, 180, "O(d(n + k))", { size: 16, weight: 800, tone: "good" }),
        label("c4", 320, 230, "needs small keys and a stable pass", { size: 12, tone: "muted" }),
      ),
    },
  ],
};
