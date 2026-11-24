import { cell, edge, label, ptr, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

/** Key to value pairs stacked vertically; ids k${key} / v${key} so counts update in place. */
function pairs(entries: [string, string | number][], x: number, tones: Record<string, Tone> = {}) {
  return entries.flatMap(([k, v], i) => [
    edge(`e${k}`, `k${k}`, `v${k}`, { arrow: "end" }),
    cell(`k${k}`, x, 90 + i * 56, k, { w: 56, tone: "plain" }),
    cell(`v${k}`, x + 110, 90 + i * 56, v, { w: 56, tone: tones[k] ?? "done" }),
  ]);
}

const CAP = (t: string, y = 40) => label("cap", 320, y, t, { size: 14, weight: 800 });

export const setsAndMaps: AlgoLesson = {
  id: "sets-and-maps",
  title: "Sets & Maps",
  summary: "Hash tables as a friendly API: a map pairs keys with values, a set keeps only keys.",
  minutes: 10,
  level: "beginner",
  goals: [
    "The difference between a set and a map",
    "Membership tests and removing duplicates",
    "Counting and lookups with a map",
    "Hash-based versus sorted implementations",
  ],
  takeaways: [
    "A map stores key to value; a set is the same table with only keys, answering one question: is this present?",
    "Sets remove duplicates, maps count and index things, and both turn many O(n) scans into O(1) lookups.",
    "Hash-based versions are fastest on average but unordered; tree-based versions are O(log n) and keep keys sorted.",
  ],
  hud: [
    { label: "Items", icon: "list" },
    { label: "Lookups", icon: "search" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "contains(set, x):",
    "    return set has x",
    "dedupe(list):",
    "    seen = empty set",
    "    for x in list: add x to seen",
    "count_words(words):",
    "    counts = empty map",
    "    for w in words:",
    "        counts[w] = counts.get(w, 0) + 1",
    "two_sum(nums, target):",
    "    seen = empty map",
    "    for i, x in nums:",
    "        if target - x in seen: return seen[target - x], i",
    "        seen[x] = i",
  ],
  steps: [
    {
      short: "Two shapes",
      title: "Same engine, two interfaces",
      body: [
        "A hash table can be used in two ways. A map associates each key with a value, like a dictionary: `a` maps to `1`. A set stores only keys, with no values.",
        "Underneath, a set is a map whose values you ignore. Both give O(1) average insert, lookup and delete.",
      ],
      metrics: [{ label: "Cost", value: "O(1) avg", level: "good" }],
      scene: scene(
        label("sl", 150, 50, "set", { size: 14, weight: 800 }),
        row([3, 7, 9], { id: "s", x: 150, y: 130, w: 44, gap: 8 }),
        label("ml", 450, 50, "map", { size: 14, weight: 800 }),
        pairs(
          [
            ["a", 1],
            ["b", 2],
          ],
          400,
        ),
      ),
    },
    {
      short: "Membership",
      title: "Is it in the set?",
      body: [
        "`contains(7)` hashes `7`, checks one bucket and answers true. The set `{3, 7, 9}` could hold a million numbers and the check would cost the same.",
        "Scanning a list for the same answer is O(n). That is why a set is the first tool for 'have I seen this?'.",
      ],
      metrics: [
        { label: "Items", value: "3" },
        { label: "Lookups", value: "1" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [1, 2],
      scene: scene(
        row([3, 7, 9], { id: "s", y: 140, tones: { 1: "found" } }),
        ptr("p", "s1", "contains(7) = true", { tone: "found" }),
        CAP("set { 3, 7, 9 }"),
      ),
    },
    {
      short: "Dedupe",
      title: "Removing duplicates",
      body: [
        "Feed `3, 7, 3, 9, 7` into a set. Adding a key that is already there changes nothing, so the second `3` and second `7` vanish.",
        "The result `{3, 7, 9}` took one pass, O(n) overall, with no sorting. Order of the output is not guaranteed in a hash set.",
      ],
      callout: {
        kind: "tip",
        text: "Need to keep the first-seen order? Check the set before keeping each item, instead of printing the set itself.",
      },
      metrics: [
        { label: "Items", value: "3", level: "good" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [3, 4, 5],
      scene: scene(
        row([3, 7, 3, 9, 7], { id: "i", y: 90, tones: { 2: "muted", 4: "muted" } }),
        row([3, 7, 9], { id: "s", y: 210, tones: { 0: "done", 1: "done", 2: "done" } }),
        label("a", 320, 40, "input: duplicates fade", { size: 12, tone: "muted" }),
        label("b", 320, 262, "set: each value once", { size: 12, tone: "muted" }),
      ),
    },
    {
      short: "Count words",
      title: "Counting with a map",
      body: [
        "Walk the words `to be or to be`, keeping a map from word to count. Seeing `to` again finds its entry and bumps the value from `1` to `2`.",
        "Each word costs one lookup and one update, so counting `n` words is O(n). The same pattern builds frequency tables and groups.",
      ],
      metrics: [
        { label: "Items", value: "3" },
        { label: "Lookups", value: "4" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [6, 7, 8, 9],
      scene: scene(
        row(["to", "be", "or", "to", "be"], {
          id: "w",
          x: 200,
          y: 70,
          w: 40,
          gap: 6,
          tones: { 3: "active" },
        }),
        ptr("p", "w3", "word 4", { tone: "active", side: "below" }),
        pairs(
          [
            ["to", 2],
            ["be", 1],
            ["or", 1],
          ],
          460,
          { to: "active" },
        ).map((it) => ({
          ...it,
          ...(it.t !== "edge" ? { y: (it as { y: number }).y + 60 } : {}),
        })),
      ),
    },
    {
      short: "Two-sum 1",
      title: "Two-sum: remember what you saw",
      body: [
        "Find two numbers in `2, 7, 11, 15` that add to `9`. For each number, the partner you need is `9 - x`. Store every number you have passed in a map from value to index.",
        "At `2` the partner is `7`, not seen yet, so store `2 -> 0` and move on.",
      ],
      metrics: [
        { label: "Items", value: "1" },
        { label: "Lookups", value: "1" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [11, 12, 14],
      scene: scene(
        row([2, 7, 11, 15], { id: "n", x: 200, y: 90, w: 50, tones: { 0: "active" } }),
        ptr("p", "n0", "need 7", { tone: "active", side: "below" }),
        pairs([["2", 0]], 460).map((it) => ({
          ...it,
          ...(it.t !== "edge" ? { y: (it as { y: number }).y + 20 } : {}),
        })),
        CAP("target 9: partner of 2 is 7, not seen"),
      ),
    },
    {
      short: "Two-sum 2",
      title: "Two-sum: the partner is in the map",
      body: [
        "At `7` the partner is `9 - 7 = 2`. One lookup shows `2` is in the map at index `0`. The answer is indexes `0` and `1`.",
        "One pass with O(1) lookups gives O(n) time and O(n) space, instead of checking every pair in O(n squared).",
      ],
      callout: {
        kind: "insight",
        text: "Trading memory for time: the map is the memory that removes the inner loop.",
      },
      metrics: [
        { label: "Items", value: "1" },
        { label: "Lookups", value: "2" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [12, 13],
      scene: scene(
        row([2, 7, 11, 15], { id: "n", x: 200, y: 90, w: 50, tones: { 0: "found", 1: "found" } }),
        ptr("p", "n1", "need 2", { tone: "found", side: "below" }),
        pairs([["2", 0]], 460, { "2": "found" }).map((it) => ({
          ...it,
          ...(it.t !== "edge" ? { y: (it as { y: number }).y + 20 } : {}),
        })),
        CAP("2 is in the map: answer is indexes 0 and 1"),
      ),
    },
    {
      short: "Sorted",
      title: "Hash-based or sorted",
      body: [
        "Hash sets and maps are fastest on average but keep no useful order. A tree-based set or map keeps keys sorted, at O(log n) per operation.",
        "Choose the tree when you need the smallest key, a range of keys or sorted iteration. Choose the hash otherwise.",
      ],
      callout: {
        kind: "warn",
        text: "Hash keys must be hashable and stable. Keys that mutate after insertion get lost.",
      },
      metrics: [{ label: "Cost", value: "O(1) vs O(log n)" }],
      scene: scene(
        label("hl", 160, 50, "hash: O(1), unordered", { size: 13, weight: 800 }),
        row([7, 3, 9], { id: "h", x: 160, y: 140, w: 44, gap: 8 }),
        label("tl", 480, 50, "tree: O(log n), sorted", { size: 13, weight: 800 }),
        tree([7, 3, 9], { x: 480, y: 100, width: 140, id: "t" }),
      ),
    },
    {
      short: "Recap",
      title: "When to reach for each",
      body: [
        "Ask a yes/no question about presence or duplicates: use a set. Need to attach information to each key, such as a count or an index: use a map.",
        "Both cost O(1) on average. Reach for the sorted variants only when order matters.",
      ],
      metrics: [{ label: "Cost", value: "O(1) avg", level: "good" }],
      scene: scene(
        label("r1", 320, 90, "set: is it here? remove duplicates", { size: 15, weight: 800 }),
        label("r2", 320, 140, "map: count, index, look up a value", { size: 15, weight: 800 }),
        label("r3", 320, 200, "sorted versions only when order matters", {
          size: 13,
          tone: "good",
        }),
      ),
    },
  ],
};
