import { bars, cell, frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const bitOf = (v: number, b: number) => (v >> b) & 1;

/** A set of the integers 0..7 stored as one bit each; cell i is element i, so the high element is on the left. */
function line(
  id: string,
  name: string,
  v: number,
  y: number,
  opts: { active?: number[]; idx?: boolean } = {},
) {
  const { active = [], idx = true } = opts;
  const n = 8;
  const half = (n * 40 + (n - 1) * 8) / 2;
  const bitAt = (i: number) => n - 1 - i;
  const members = Array.from({ length: n }, (_, b) => b)
    .filter((b) => bitOf(v, b))
    .join(", ");
  return [
    ...row(
      Array.from({ length: n }, (_, i) => bitOf(v, bitAt(i))),
      {
        id,
        y,
        w: 40,
        tones: (i) =>
          active.includes(bitAt(i)) ? "active" : bitOf(v, bitAt(i)) ? "mark" : undefined,
      },
    ).map((c, i) => ({ ...c, sub: idx ? String(bitAt(i)) : undefined })),
    label(`${id}name`, 320 - half - 14, y, name, { anchor: "end", size: 13, weight: 800 }),
    label(`${id}set`, 320 + half + 14, y, `{${members}}`, {
      anchor: "start",
      size: 12,
      tone: "muted",
    }),
  ];
}

const S = 0b01011010; // {1, 3, 4, 6}
const A = S;
const B = 0b11001001; // {0, 3, 6, 7}

export const bitsets: AlgoLesson = {
  id: "bitsets",
  title: "Bitsets",
  summary:
    "Store a set of small integers with one bit per possible member and use bit operations on it.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "How one bit per value represents a set",
    "Add, remove and contains as single operations",
    "Union and intersection of whole sets in one instruction",
    "Memory savings and subsets as masks",
  ],
  takeaways: [
    "A bitset gives bit i the meaning 'i is in the set', so add, remove and contains are O(1) bit operations.",
    "Union is OR and intersection is AND, and one machine word handles 64 elements at once.",
    "It uses one bit per possible value instead of a byte or more, which is the saving that makes it worth it.",
  ],
  hud: [
    { label: "Set size", icon: "list" },
    { label: "Operation", icon: "swap" },
    { label: "Memory", icon: "memory" },
  ],
  pseudocode: [
    "bitset(S, A, B, i):",
    "    add:      S = S | (1 << i)",
    "    remove:   S = S & ~(1 << i)",
    "    contains: return (S & (1 << i)) != 0",
    "    union:        return A | B",
    "    intersection: return A & B",
    "    difference:   return A & ~B",
    "    word = i / 64, bit = i % 64",
    "    for mask in 0 .. 2^n - 1:",
    "        subset = items whose bit is set in mask",
  ],
  steps: [
    {
      short: "A set",
      title: "One bit per possible member",
      body: [
        "Suppose the elements are small integers from 0 to 7. Give each one its own bit: bit `i` is `1` when `i` is in the set and `0` when it is not.",
        "The set `{1, 3, 4, 6}` becomes `01011010`. The whole set is just one number, 90.",
      ],
      metrics: [
        { label: "Set size", value: "4" },
        { label: "Memory", value: "1 byte", level: "good" },
      ],
      scene: scene(line("s", "S", S, 140)),
    },
    {
      short: "Add",
      title: "Add an element: OR with its mask",
      body: [
        "To add `5`, build the mask `1 << 5` and OR it in. Bit 5 becomes `1`, and every other bit keeps its value.",
        "Adding an element that is already there changes nothing, which matches how a set should behave.",
      ],
      metrics: [
        { label: "Set size", value: "5" },
        { label: "Operation", value: "S | 1<<5" },
      ],
      lines: [2],
      scene: scene(
        line("s", "S", S, 50),
        line("m", "| 1 << 5", 1 << 5, 130, { active: [5] }),
        line("r", "=", S | (1 << 5), 220, { active: [5] }),
      ),
    },
    {
      short: "Remove",
      title: "Remove an element: AND with the inverse",
      body: [
        "Now take `3` out. AND with `~(1 << 3)`, a mask that is all ones except bit 3. Every other element survives; bit 3 is forced to `0`.",
        "Removing an absent element is harmless: the bit was already `0`.",
      ],
      metrics: [
        { label: "Set size", value: "4" },
        { label: "Operation", value: "S & ~(1<<3)" },
      ],
      lines: [3],
      scene: scene(
        line("s", "S", S | (1 << 5), 50),
        line("m", "& ~(1 << 3)", ~(1 << 3) & 0xff, 130),
        line("r", "=", (S | (1 << 5)) & ~(1 << 3), 220, { active: [3] }),
      ),
    },
    {
      short: "Contains",
      title: "Membership: AND and compare with zero",
      body: [
        "Is `4` in the set? Compute `S & (1 << 4)`. A non-zero result means yes; zero means no.",
        "Only one position can survive the AND, so the answer is exactly the state of that single bit.",
      ],
      metrics: [
        { label: "Set size", value: "4" },
        { label: "Operation", value: "S & 1<<4" },
      ],
      lines: [4],
      scene: scene(
        line("s", "S", S, 60),
        line("m", "& 1 << 4", 1 << 4, 140, { active: [4] }),
        line("r", "=", S & (1 << 4), 230, { active: [4] }),
        label("ans", 320, 275, "non-zero, so 4 is in the set", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
    {
      short: "Union",
      title: "Union is a single OR",
      body: [
        "Take `A = {1, 3, 4, 6}` and `B = {0, 3, 6, 7}`. The union holds everything that is in either set, and that is exactly what bitwise OR computes.",
        "Eight membership decisions happen in one instruction. The result is `{0, 1, 3, 4, 6, 7}`.",
      ],
      callout: {
        kind: "insight",
        text: "A bitset operation acts on a whole word at once, so it does the work of up to 64 element-by-element steps.",
      },
      metrics: [
        { label: "Set size", value: "6" },
        { label: "Operation", value: "A | B" },
      ],
      lines: [5],
      scene: scene(
        line("a", "A", A, 50),
        line("b", "| B", B, 130),
        line("r", "A ∪ B", A | B, 220, { active: [0, 7] }),
      ),
    },
    {
      short: "Intersection",
      title: "Intersection is a single AND",
      body: [
        "The same two sets, but now keep only the elements that are in both. AND gives `01001000`, the set `{3, 6}`.",
        "Difference works too: `A & ~B` keeps what is in A and not in B, here `{1, 4}`.",
      ],
      metrics: [
        { label: "Set size", value: "2" },
        { label: "Operation", value: "A & B" },
      ],
      lines: [6, 7],
      scene: scene(
        line("a", "A", A, 50),
        line("b", "& B", B, 130),
        line("r", "A ∩ B", A & B, 220, { active: [3, 6] }),
      ),
    },
    {
      short: "64 flags",
      title: "64 flags in one word",
      body: [
        "A 64-bit word holds 64 flags. The element `i` lives in word `i / 64` at bit `i % 64`; a bigger universe just uses an array of words.",
        "Below, eight bytes make up one word. Element 37, for example, is in byte 4, at bit 5 of that byte.",
      ],
      metrics: [
        { label: "Memory", value: "8 bytes", level: "good" },
        { label: "Operation", value: "i / 64, i % 64" },
      ],
      lines: [8],
      scene: scene(
        frame("w", 28, 85, 584, 110, "one 64-bit word"),
        row(["0-7", "8-15", "16-23", "24-31", "32-39", "40-47", "48-55", "56-63"], {
          id: "by",
          y: 140,
          w: 64,
          tones: (i) => (i === 4 ? "active" : undefined),
        }),
        ptr("el", "by4", "element 37", { side: "below", tone: "active" }),
      ),
    },
    {
      short: "Memory",
      title: "Memory: bits against bytes",
      body: [
        "A boolean array spends at least a byte per flag, so 64 flags cost 64 bytes. The bitset packs the same 64 into 8 bytes, an 8-times saving.",
        "For a million flags that is about 1 MB against 125 KB, and the smaller table also fits better in the CPU cache.",
      ],
      callout: {
        kind: "warn",
        text: "A bitset reserves a bit for every possible value, not every present one. A few huge values make it wasteful; use a hash set instead.",
      },
      metrics: [{ label: "Memory", value: "8 vs 64 B", level: "good" }],
      scene: scene(
        bars([64, 8], {
          id: "m",
          y: 215,
          w: 90,
          gap: 60,
          tones: (i) => (i === 0 ? "warn" : "found"),
        }),
        label("l0", 245, 245, "bool array: 64 bytes", { size: 12, weight: 800 }),
        label("l1", 395, 245, "bitset: 8 bytes", { size: 12, weight: 800 }),
      ),
    },
    {
      short: "Subsets",
      title: "A mask is a subset",
      body: [
        "For a small set of `n` items, every number from `0` to `2^n - 1` is a mask that picks one subset: bit `i` set means item `i` is chosen.",
        "With items `a, b, c`, mask `5` is `101`, so it picks `a` and `c`. Looping over every mask visits all 8 subsets.",
      ],
      metrics: [
        { label: "Set size", value: "8 subsets" },
        { label: "Operation", value: "mask 0..7" },
      ],
      lines: [9, 10],
      scene: scene(
        ["", "a", "b", "ab", "c", "ac", "bc", "abc"].map((t, m) =>
          cell(`ss${m}`, 56 + m * 76, 140, t || "∅", {
            w: 64,
            sub: m.toString(2).padStart(3, "0"),
            tone: m === 5 ? "active" : undefined,
          }),
        ),
        label("c", 320, 70, "items a = bit 0, b = bit 1, c = bit 2", { size: 13, tone: "muted" }),
      ),
    },
    {
      short: "Recap",
      title: "When to reach for a bitset",
      body: [
        "Use one when the possible values are small integers in a known range: flags, visited marks, small-universe sets and subset enumeration.",
        "Every single-element operation is `O(1)`, whole-set operations cost one step per word, and memory is one bit per possible value.",
      ],
      metrics: [
        { label: "Operation", value: "O(1)", level: "good" },
        { label: "Memory", value: "1 bit / value", level: "good" },
      ],
      scene: scene(
        label("l1", 320, 55, "add / remove / contains   O(1)", { size: 14, weight: 800 }),
        label("l2", 320, 105, "union / intersection   O(words)", { size: 14, weight: 800 }),
        label("l3", 320, 155, "memory   n bits for n possible values", { size: 14, weight: 800 }),
        label("l4", 320, 205, "subsets of n items   masks 0 .. 2^n - 1", { size: 14, weight: 800 }),
      ),
    },
  ],
};
