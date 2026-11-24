import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const M = 12;

/** The bit array: stable ids a0..a11, set bits show 1. */
function bits(on: number[], tones: Record<number, Tone> = {}, y = 150) {
  return row(
    Array.from({ length: M }, (_, i) => (on.includes(i) ? 1 : 0)),
    {
      y,
      w: 38,
      gap: 8,
      index: true,
      tones: (i) => tones[i] ?? (on.includes(i) ? "done" : undefined),
    },
  );
}

const CAP = (t: string, y = 60) => label("cap", 320, y, t, { size: 14, weight: 800 });
const SUB = (t: string, y = 250, tone: "ink" | "muted" | "warn" | "good" = "muted") =>
  label("sub", 320, y, t, { size: 12, tone });

const CAT = [2, 5, 9];
const BOTH = [1, 2, 5, 9, 10];

export const bloomFilters: AlgoLesson = {
  id: "bloom-filters",
  title: "Bloom Filters",
  summary:
    "A tiny bit array that says 'definitely not' or 'probably yes', trading certainty for space.",
  minutes: 13,
  level: "advanced",
  goals: [
    "How k hash functions set and check bits",
    "Why answers are 'definitely not' or 'probably yes'",
    "Why false positives happen but false negatives never do",
    "Why you cannot delete, and how size trades against error",
  ],
  takeaways: [
    "A Bloom filter keeps only bits: adding sets k bits, and a query checks the same k bits.",
    "'No' is always correct; 'yes' may be wrong, so false positives exist but false negatives do not.",
    "More bits per item lower the false positive rate; bits cannot be cleared, so items cannot be removed.",
  ],
  hud: [
    { label: "Bits", icon: "memory" },
    { label: "Bits set", icon: "grid" },
    { label: "Items added", icon: "list" },
    { label: "Answer", icon: "shield" },
  ],
  pseudocode: [
    "add(key):",
    "    for h in hash_functions:",
    "        bits[h(key) % m] = 1",
    "might_contain(key):",
    "    for h in hash_functions:",
    "        if bits[h(key) % m] == 0:",
    "            return false",
    "    return true",
  ],
  steps: [
    {
      short: "The need",
      title: "Cheap membership for huge sets",
      body: [
        "Sometimes the set is too big to keep, say every URL a crawler has visited, and a wrong 'yes' is tolerable but a wrong 'no' is not. A Bloom filter fits that bargain.",
        "It stores no keys at all, just a row of bits. Here are `12` bits, all `0`.",
      ],
      metrics: [
        { label: "Bits", value: "12" },
        { label: "Bits set", value: "0", level: "good" },
        { label: "Items added", value: "0" },
      ],
      scene: scene(bits([]), CAP("12 bits, all zero"), SUB("no keys are stored, only bits")),
    },
    {
      short: "k hashes",
      title: "k hash functions, one bit array",
      body: [
        "The filter uses `k` independent hash functions, here `k = 3`. Each maps a key to a position in `0..11`.",
        "To add a key, you set those `k` bits to `1`. To test a key, you look at the same `k` bits.",
      ],
      callout: {
        kind: "insight",
        text: "Unlike a hash table, there is no bucket owned by a key. Several keys may share the same bits.",
      },
      metrics: [
        { label: "Bits", value: "12" },
        { label: "Bits set", value: "0", level: "good" },
      ],
      lines: [2, 3, 5, 6],
      scene: scene(
        bits([]),
        CAP("m = 12 bits, k = 3 hash functions"),
        SUB("hash1, hash2, hash3 each pick a position"),
      ),
    },
    {
      short: "Add cat",
      title: "Adding sets k bits",
      body: [
        "Add `cat`. Its three hashes give positions `2`, `5` and `9`. Set those bits to `1`.",
        "That is the entire insert: k writes, independent of how many items are already stored.",
      ],
      metrics: [
        { label: "Bits set", value: "3" },
        { label: "Items added", value: "1" },
      ],
      lines: [1, 2, 3],
      scene: scene(
        bits(CAT, { 2: "found", 5: "found", 9: "found" }),
        CAP("add cat: positions 2, 5, 9"),
        ptr("p", "a2", "h1", { tone: "found" }),
        SUB("each hash sets one bit"),
      ),
    },
    {
      short: "Add dog",
      title: "Bits get shared",
      body: [
        "Add `dog`: positions `1`, `5` and `10`. Bit `5` is already `1` from `cat`, and it simply stays `1`.",
        "Five bits are now set for two items. The array records only that 'something' set each bit, not which key did.",
      ],
      metrics: [
        { label: "Bits set", value: "5" },
        { label: "Items added", value: "2" },
      ],
      lines: [2, 3],
      scene: scene(
        bits(BOTH, { 1: "found", 5: "mark", 10: "found" }),
        CAP("add dog: positions 1, 5, 10 (5 is shared)"),
        SUB("bit 5 was set by cat, dog reuses it"),
      ),
    },
    {
      short: "Query cat",
      title: "All bits set: probably yes",
      body: [
        "Query `cat`: bits `2`, `5` and `9` are all `1`. The answer is 'probably yes'.",
        "Here it is right, because `cat` really was added. But the filter alone cannot tell this from other keys that share those bits.",
      ],
      metrics: [
        { label: "Bits set", value: "5" },
        { label: "Items added", value: "2" },
        { label: "Answer", value: "probably yes", level: "good" },
      ],
      lines: [5, 6, 8],
      scene: scene(
        bits(BOTH, { 2: "active", 5: "active", 9: "active" }),
        CAP("query cat: 2, 5, 9 all 1"),
        SUB("probably yes", 250, "good"),
      ),
    },
    {
      short: "Query emu",
      title: "One zero bit: definitely not",
      body: [
        "Query `emu`: its positions are `3`, `5` and `10`. Bit `3` is `0`. If `emu` had been added, bit `3` would be set, so it was not.",
        "This is the guarantee: a single `0` proves absence. A Bloom filter never gives a false negative.",
      ],
      callout: {
        kind: "tip",
        text: "Use it as a gatekeeper: a 'no' skips the expensive lookup, a 'yes' triggers the real check.",
      },
      metrics: [
        { label: "Answer", value: "definitely not", level: "good" },
        { label: "Bits set", value: "5" },
      ],
      lines: [5, 6, 7],
      scene: scene(
        bits(BOTH, { 3: "warn", 5: "active", 10: "active" }),
        CAP("query emu: 3, 5, 10"),
        ptr("p", "a3", "0: not here", { tone: "warn" }),
        SUB("definitely not", 250, "good"),
      ),
    },
    {
      short: "False yes",
      title: "False positives are the price",
      body: [
        "Query `owl`, which was never added. Its positions are `1`, `9` and `10`, and all three were set by `dog` and `cat`. The filter says 'probably yes'. That answer is wrong.",
        "This is a false positive. The fuller the array, the more likely a stranger's bits are all covered.",
      ],
      callout: {
        kind: "warn",
        text: "A 'yes' means 'maybe'. Never treat it as proof that the key was added.",
      },
      metrics: [
        { label: "Answer", value: "probably yes (wrong)", level: "bad" },
        { label: "Bits set", value: "5" },
      ],
      lines: [5, 6, 8],
      scene: scene(
        bits(BOTH, { 1: "warn", 9: "warn", 10: "warn" }),
        CAP("query owl: 1, 9, 10 all 1 (never added)"),
        SUB("false positive", 250, "warn"),
      ),
    },
    {
      short: "No delete",
      title: "Why you cannot remove an item",
      body: [
        "To forget `cat` you would clear bits `2`, `5` and `9`. But bit `5` also belongs to `dog`, and bit `9` helped `owl`'s false hit. Clearing bit `5` would make `dog` read as 'definitely not', a false negative.",
        "So a plain Bloom filter only grows. Variants that keep small counters per slot support deletion at higher cost.",
      ],
      metrics: [
        { label: "Bits set", value: "5" },
        { label: "Answer", value: "unsafe", level: "bad" },
      ],
      lines: [3],
      scene: scene(
        bits(BOTH, { 5: "warn" }),
        CAP("clear bit 5 to remove cat?"),
        ptr("p", "a5", "dog needs this too", { tone: "warn" }),
        SUB("removing a bit can create false negatives", 250, "warn"),
      ),
    },
    {
      short: "Sizing",
      title: "Sizing: bits versus error",
      body: [
        "With `m` bits, `n` items and `k` hashes, the false positive rate is about `(1 - e^(-kn/m))^k`. More bits per item lowers it; the best `k` is about `(m/n) * ln 2`.",
        "As a rule of thumb, `10` bits per item and `k = 7` gives roughly a `1%` false positive rate, using a fraction of the memory of storing the keys.",
      ],
      callout: {
        kind: "insight",
        text: "You choose the error rate up front. Space is the dial; correctness of 'no' never changes.",
      },
      metrics: [
        { label: "Bits", value: "10 per item" },
        { label: "Answer", value: "~1% wrong yes", level: "good" },
      ],
      scene: scene(
        label("s1", 320, 80, "false positive rate  ~ (1 - e^(-kn/m))^k", { size: 14, weight: 800 }),
        label("s2", 320, 140, "10 bits per item, k = 7  ->  about 1%", { size: 14, weight: 800 }),
        label("s3", 320, 200, "more bits: fewer false yes. 'No' is always right.", {
          size: 13,
          tone: "good",
        }),
      ),
    },
  ],
};
