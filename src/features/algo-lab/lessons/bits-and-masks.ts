import { label, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const bitOf = (v: number, b: number) => (v >> b) & 1;

/** One binary number as a row of single-bit cells (most significant bit on the left) plus its name and decimal value. */
function line(
  id: string,
  name: string,
  v: number,
  y: number,
  opts: { active?: number[]; idx?: boolean; n?: number } = {},
) {
  const { active = [], idx = true, n = 8 } = opts;
  const half = (n * 40 + (n - 1) * 8) / 2;
  const bitAt = (i: number) => n - 1 - i;
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
    label(`${id}dec`, 320 + half + 14, y, String(v), { anchor: "start", size: 12, tone: "muted" }),
  ];
}

const X = 0b00101101; // 45

export const bitsAndMasks: AlgoLesson = {
  id: "bits-and-masks",
  title: "Bits & Masks",
  summary:
    "Read numbers as rows of bits, combine them with AND, OR, XOR and shifts, and aim at one bit.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How an integer is a row of bits",
    "What AND, OR, XOR, NOT and the shifts do",
    "How 1 << k builds a mask for bit k",
    "How to test, set, clear and toggle one bit",
  ],
  takeaways: [
    "A mask is a number whose set bits mark the positions you care about; AND reads them, OR sets them, XOR flips them.",
    "1 << k is the mask for bit k, and ~(1 << k) is the mask that protects every bit except k.",
    "Test, set, clear and toggle are one operation each, so touching a single bit costs O(1).",
  ],
  hud: [
    { label: "Value", icon: "sigma" },
    { label: "Operation", icon: "swap" },
    { label: "Bits set", icon: "grid" },
  ],
  pseudocode: [
    "bitOps(x, k):",
    "    mask = 1 << k",
    "    test:   return (x & mask) != 0",
    "    set:    x = x | mask",
    "    clear:  x = x & ~mask",
    "    toggle: x = x ^ mask",
    "    low4 = x & 0b00001111",
    "    double = x << 1",
    "    half = x >> 1",
    "    return x",
  ],
  steps: [
    {
      short: "Bits",
      title: "A number is a row of bits",
      body: [
        "Inside the machine an integer is a row of cells that each hold `0` or `1`. Bit `k` is worth `2^k`, and we count positions from the right, starting at 0.",
        "Here the bits that are set are 5, 3, 2 and 0, so the value is `32 + 8 + 4 + 1 = 45`.",
      ],
      callout: {
        kind: "insight",
        text: "Eight bits can hold 256 different values, from 0 to 255. Every extra bit doubles the count.",
      },
      metrics: [
        { label: "Value", value: "45" },
        { label: "Bits set", value: "4" },
      ],
      scene: scene(line("x", "x", X, 140)),
    },
    {
      short: "AND",
      title: "AND keeps bits both have",
      body: [
        "`a & b` looks at each position and gives `1` only when both inputs have a `1` there. Everything else becomes `0`.",
        "Using `00001111` as the second operand keeps the low four bits of `x` and wipes the rest. That second number is the mask.",
      ],
      metrics: [
        { label: "Value", value: "13" },
        { label: "Operation", value: "AND" },
        { label: "Bits set", value: "3" },
      ],
      lines: [7],
      scene: scene(
        line("x", "x", X, 60),
        line("m", "& mask", 0b00001111, 140),
        line("r", "=", X & 0b00001111, 230, { active: [3, 2, 1, 0] }),
      ),
    },
    {
      short: "OR",
      title: "OR collects bits from either",
      body: [
        "`a | b` gives `1` when at least one input has a `1`. Nothing a bit already had is ever lost.",
        "That makes OR the tool for switching bits on: every bit that is set in either number is set in the result.",
      ],
      metrics: [
        { label: "Value", value: "109" },
        { label: "Operation", value: "OR" },
        { label: "Bits set", value: "5" },
      ],
      lines: [4],
      scene: scene(
        line("x", "x", X, 60),
        line("y", "| y", 0b01001001, 140),
        line("r", "=", X | 0b01001001, 230, { active: [6, 5, 3, 2, 0] }),
      ),
    },
    {
      short: "XOR",
      title: "XOR flags the differences",
      body: [
        "`a ^ b` gives `1` where the two inputs disagree and `0` where they match. A bit XORed with `1` flips; XORed with `0` it stays.",
        "Doing it twice with the same operand brings you back, because every flip is undone by the second one.",
      ],
      callout: {
        kind: "tip",
        text: "`x ^ x` is always `0` and `x ^ 0` is always `x`. Those two facts power many tricks.",
      },
      metrics: [
        { label: "Value", value: "100" },
        { label: "Operation", value: "XOR" },
        { label: "Bits set", value: "3" },
      ],
      lines: [6],
      scene: scene(
        line("x", "x", X, 60),
        line("y", "^ y", 0b01001001, 140),
        line("r", "=", X ^ 0b01001001, 230, { active: [6, 5, 2] }),
      ),
    },
    {
      short: "NOT",
      title: "NOT flips every bit",
      body: [
        "`~x` turns each `0` into `1` and each `1` into `0`. In eight bits, `~00101101` is `11010010`.",
        "NOT mostly appears inside another expression, to build a mask that selects everything except a few bits.",
      ],
      callout: {
        kind: "warn",
        text: "In most languages `~x` flips all 32 or 64 bits, not just the eight you drew, and it can show up as a negative number.",
      },
      metrics: [
        { label: "Value", value: "210" },
        { label: "Operation", value: "NOT" },
        { label: "Bits set", value: "4" },
      ],
      lines: [5],
      scene: scene(
        line("x", "x", X, 80),
        line("r", "~x", ~X & 0xff, 190, { active: [7, 6, 5, 4, 3, 2, 1, 0] }),
      ),
    },
    {
      short: "Shifts",
      title: "Shifts slide the whole row",
      body: [
        "`x << 1` moves every bit one place left and fills the right with `0`. `x >> 1` moves them right and the lowest bit falls off.",
        "A left shift multiplies by 2 and a right shift divides by 2, rounding down. `45` becomes `90` and `22`.",
      ],
      metrics: [
        { label: "Value", value: "90" },
        { label: "Operation", value: "shift" },
        { label: "Bits set", value: "4" },
      ],
      lines: [8, 9],
      scene: scene(
        line("x", "x", X, 50, { idx: false }),
        line("l", "x << 1", (X << 1) & 0xff, 125, { idx: false, active: [0] }),
        line("s", "x >> 1", X >> 1, 200, { idx: false, active: [7] }),
      ),
    },
    {
      short: "Mask 1<<k",
      title: "1 << k is the mask for bit k",
      body: [
        "Start from `1`, which has only bit 0 set, and shift it left `k` times. The result has a single `1`, exactly at position `k`.",
        "Here `k = 3`, so `1 << 3` is `00001000`, which is 8. Every operation that follows pairs `x` with this mask.",
      ],
      metrics: [
        { label: "Value", value: "8" },
        { label: "Operation", value: "1 << 3" },
        { label: "Bits set", value: "1" },
      ],
      lines: [2],
      scene: scene(line("one", "1", 1, 80), line("mk", "1 << 3", 1 << 3, 190, { active: [3] })),
    },
    {
      short: "Test, set",
      title: "Test a bit, set a bit",
      body: [
        "To test bit 3, compute `x & (1 << 3)`. Any non-zero result means the bit is set; here we get `00001000`, so it is.",
        "To set bit 4, compute `x | (1 << 4)`. OR can only add bits, so the others stay as they were and `45` becomes `61`.",
      ],
      metrics: [
        { label: "Value", value: "61" },
        { label: "Operation", value: "x | 1<<4" },
        { label: "Bits set", value: "5" },
      ],
      lines: [3, 4],
      scene: scene(
        line("x", "x", X, 50),
        line("m", "| 1 << 4", 1 << 4, 130),
        line("r", "=", X | (1 << 4), 220, { active: [4] }),
      ),
    },
    {
      short: "Clear, flip",
      title: "Clear a bit, toggle a bit",
      body: [
        "To clear bit 3, AND with the inverted mask: `x & ~(1 << 3)`. The mask is `11110111`, so every bit survives except bit 3. Now `45` becomes `37`.",
        "To toggle bit 2, XOR with its mask: `x ^ (1 << 2)`. A set bit turns off and a clear bit turns on.",
      ],
      callout: {
        kind: "warn",
        text: "Clearing needs `& ~mask`, not `& mask`. Plain AND with `1 << k` would keep only bit k and wipe the rest.",
      },
      metrics: [
        { label: "Value", value: "37" },
        { label: "Operation", value: "x & ~(1<<3)" },
        { label: "Bits set", value: "3" },
      ],
      lines: [5, 6],
      scene: scene(
        line("x", "x", X, 50),
        line("m", "& ~(1 << 3)", ~(1 << 3) & 0xff, 130),
        line("r", "=", X & ~(1 << 3), 220, { active: [3] }),
      ),
    },
    {
      short: "Recap",
      title: "Four one-liners for one bit",
      body: [
        "Build the mask with `1 << k`, then pick the operator: AND tests, OR sets, AND with NOT clears, XOR toggles.",
        "Each of these touches a single machine word, so working on one bit is `O(1)` no matter which bit it is.",
      ],
      metrics: [
        { label: "Operation", value: "O(1)", level: "good" },
        { label: "Bits set", value: "—" },
      ],
      lines: [2, 3, 4, 5, 6],
      scene: scene(
        label("l1", 320, 60, "test      x & (1 << k)", { size: 15, weight: 800 }),
        label("l2", 320, 110, "set       x | (1 << k)", { size: 15, weight: 800 }),
        label("l3", 320, 160, "clear     x & ~(1 << k)", { size: 15, weight: 800 }),
        label("l4", 320, 210, "toggle    x ^ (1 << k)", { size: 15, weight: 800 }),
      ),
    },
  ],
};
