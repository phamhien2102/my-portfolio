import { label, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const bitOf = (v: number, b: number) => (v >> b) & 1;

/** One binary number as a row of single-bit cells (most significant bit on the left) plus its name and decimal value. */
function line(
  id: string,
  name: string,
  v: number,
  y: number,
  opts: { active?: number[]; idx?: boolean; n?: number; dec?: string } = {},
) {
  const { active = [], idx = false, n = 8, dec } = opts;
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
    label(`${id}dec`, 320 + half + 14, y, dec ?? String(v), {
      anchor: "start",
      size: 12,
      tone: "muted",
    }),
  ];
}

const N = 0b01101000; // 104

export const bitTricks: AlgoLesson = {
  id: "bit-tricks",
  title: "Bit Tricks",
  summary:
    "Clear the lowest set bit, spot powers of two, count bits and find the odd one out with XOR.",
  minutes: 13,
  level: "advanced",
  goals: [
    "Why n & (n - 1) clears the lowest set bit",
    "Power-of-two checks and counting set bits",
    "How XOR cancels pairs to find a single number",
    "Swapping with XOR and isolating the lowest bit with n & -n",
  ],
  takeaways: [
    "Subtracting 1 flips the lowest set bit and every zero below it, so n & (n - 1) removes exactly that one bit.",
    "XOR cancels equal values, so XORing a whole list leaves the one value that has no partner.",
    "n & -n keeps only the lowest set bit, because -n is the inversion of n plus one.",
  ],
  hud: [
    { label: "Value", icon: "sigma" },
    { label: "Bits set", icon: "grid" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "tricks(n, list):",
    "    cleared = n & (n - 1)",
    "    pow2 = n > 0 and (n & (n - 1)) == 0",
    "    count = 0",
    "    while n != 0:",
    "        n = n & (n - 1)",
    "        count = count + 1",
    "    single = 0",
    "    for x in list:",
    "        single = single ^ x",
    "    a = a ^ b; b = a ^ b; a = a ^ b",
    "    lowest = n & -n",
  ],
  steps: [
    {
      short: "n - 1",
      title: "What subtracting 1 does to bits",
      body: [
        "Take `n = 01101000`, which is 104. Subtracting 1 has to borrow: the lowest set bit (bit 3) turns off, and every zero below it turns into a `1`.",
        "The bits above bit 3 are untouched. This borrow pattern is the engine behind the next few tricks.",
      ],
      metrics: [
        { label: "Value", value: "104" },
        { label: "Bits set", value: "3" },
      ],
      lines: [2],
      scene: scene(
        line("n", "n", N, 80, { idx: true }),
        line("m", "n - 1", N - 1, 190, { idx: true, active: [3, 2, 1, 0] }),
      ),
    },
    {
      short: "Clear lowest",
      title: "n & (n - 1) clears the lowest set bit",
      body: [
        "AND the two rows. Above bit 3 they agree, so those bits survive. At bit 3 and below one row has `0` where the other has `1`, so the AND is `0` everywhere.",
        "The result `01100000` is `n` with exactly its lowest set bit removed, in one step and with no loop.",
      ],
      callout: {
        kind: "insight",
        text: "n and n - 1 always differ in the lowest set bit and everything below it, and agree above, so the AND wipes just that region.",
      },
      metrics: [
        { label: "Value", value: "96" },
        { label: "Bits set", value: "2", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [2],
      scene: scene(
        line("n", "n", N, 50),
        line("m", "n - 1", N - 1, 125),
        line("r", "n & (n-1)", N & (N - 1), 215, { active: [3] }),
      ),
    },
    {
      short: "Power of 2",
      title: "A power of two has a single set bit",
      body: [
        "`8` is `00001000`: one set bit. Clearing its lowest set bit leaves nothing, so `n & (n - 1) == 0`.",
        "That is the whole test for a power of two, as long as `n` is positive.",
      ],
      callout: {
        kind: "warn",
        text: "Zero also gives `0 & -1 == 0`, so write `n > 0 && (n & (n - 1)) == 0` or zero is wrongly accepted.",
      },
      metrics: [
        { label: "Value", value: "8" },
        { label: "Bits set", value: "1" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [3],
      scene: scene(
        line("n", "n = 8", 8, 50),
        line("m", "n - 1", 7, 125),
        line("r", "n & (n-1)", 0, 215, { dec: "0 → yes" }),
      ),
    },
    {
      short: "Not a power",
      title: "Two set bits: the AND is not zero",
      body: [
        "`12` is `00001100`. Clearing the lowest set bit leaves `00001000`, which is not zero, so 12 is not a power of two.",
        "The same idea tells you whether a number has exactly one, or more than one, set bit.",
      ],
      metrics: [
        { label: "Value", value: "12" },
        { label: "Bits set", value: "2" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [3],
      scene: scene(
        line("n", "n = 12", 12, 50),
        line("m", "n - 1", 11, 125),
        line("r", "n & (n-1)", 8, 215, { active: [2], dec: "8 → no" }),
      ),
    },
    {
      short: "Count bits",
      title: "Count set bits by clearing them",
      body: [
        "Repeat `n = n & (n - 1)` and count how many rounds it takes to reach zero. Starting from `10110100`, which has four set bits, it takes four rounds.",
        "The loop runs once per set bit, not once per bit position, so a sparse number is counted in a few steps.",
      ],
      metrics: [
        { label: "Value", value: "180" },
        { label: "Bits set", value: "4" },
        { label: "Cost", value: "O(k)", level: "good" },
      ],
      lines: [4, 5, 6, 7],
      scene: scene(
        line("c0", "start", 0b10110100, 30, { dec: "count 0" }),
        line("c1", "round 1", 0b10110000, 90, { active: [2], dec: "count 1" }),
        line("c2", "round 2", 0b10100000, 150, { active: [4], dec: "count 2" }),
        line("c3", "round 3", 0b10000000, 210, { active: [5], dec: "count 3" }),
        line("c4", "round 4", 0, 270, { active: [7], dec: "count 4" }),
      ),
    },
    {
      short: "XOR rules",
      title: "XOR cancels equal values",
      body: [
        "Two facts: `a ^ a = 0` and `a ^ 0 = a`. XOR is also order-independent, so you can regroup a long chain freely.",
        "Whenever a value appears twice in a XOR chain, the pair vanishes and leaves nothing behind.",
      ],
      metrics: [
        { label: "Value", value: "0" },
        { label: "Bits set", value: "0" },
      ],
      scene: scene(
        line("p", "5", 5, 50),
        line("q", "^ 5", 5, 125),
        line("r", "=", 0, 215, { dec: "0" }),
      ),
    },
    {
      short: "Single number",
      title: "Find the one that has no partner",
      body: [
        "Every value in `[4, 1, 2, 1, 2]` appears twice except `4`. XOR them all together: the `1`s cancel, the `2`s cancel, and `4` is left.",
        "The running values below the list show it: `4, 5, 7, 6, 4`. One pass, one variable and no extra memory.",
      ],
      callout: {
        kind: "tip",
        text: "This beats a hash set, which would need O(n) extra space to find the same value.",
      },
      metrics: [
        { label: "Value", value: "4", level: "good" },
        { label: "Cost", value: "O(n)", level: "good" },
      ],
      lines: [8, 9, 10],
      scene: scene(
        label("t1", 320, 50, "array", { size: 12, tone: "muted" }),
        row([4, 1, 2, 1, 2], {
          id: "v",
          y: 100,
          tones: (i) => (i === 0 ? "found" : "muted"),
        }),
        label("t2", 320, 170, "running XOR", { size: 12, tone: "muted" }),
        row([4, 5, 7, 6, 4], {
          id: "x",
          y: 220,
          tones: (i) => (i === 4 ? "found" : "done"),
        }),
      ),
    },
    {
      short: "XOR swap",
      title: "Swapping two values with XOR",
      body: [
        "With `a = 5` and `b = 3`: `a ^= b` gives 6, then `b ^= a` gives 5, then `a ^= b` gives 3. The values have traded places with no temporary.",
        "It works because the second XOR removes the original `b` from the mixed value, and the third removes the original `a`.",
      ],
      callout: {
        kind: "warn",
        text: "If `a` and `b` are the same variable, the first step sets it to 0. Compilers do a plain swap just as fast, so use this as a puzzle, not as an optimisation.",
      },
      metrics: [
        { label: "Value", value: "3" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [11],
      scene: scene(
        line("a0", "a", 5, 30, { n: 4, dec: "5" }),
        line("b0", "b", 3, 85, { n: 4, dec: "3" }),
        line("a1", "a ^= b", 6, 140, { n: 4, active: [2, 1, 0], dec: "6" }),
        line("b1", "b ^= a", 5, 195, { n: 4, active: [2, 1, 0], dec: "5" }),
        line("a2", "a ^= b", 3, 250, { n: 4, active: [2, 1, 0], dec: "3" }),
      ),
    },
    {
      short: "n & -n",
      title: "Isolate the lowest set bit",
      body: [
        "In two's complement, `-n` is `~n + 1`. Inverting flips every bit, and adding 1 carries back up through the trailing ones, restoring them to the lowest set bit of `n`.",
        "So `n` and `-n` agree at the lowest set bit and disagree above it. AND keeps only that bit: here `01101000 & 10011000 = 00001000`.",
      ],
      callout: {
        kind: "insight",
        text: "This trick is the heart of the Fenwick tree, which steps through indexes by adding n & -n.",
      },
      metrics: [
        { label: "Value", value: "8" },
        { label: "Bits set", value: "1" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [12],
      scene: scene(
        line("n", "n", N, 50),
        line("m", "-n", -N & 0xff, 125),
        line("r", "n & -n", N & -N & 0xff, 215, { active: [3] }),
      ),
    },
    {
      short: "Recap",
      title: "The toolbox at a glance",
      body: [
        "Every trick here comes from two ideas: subtracting 1 or negating moves a single boundary in the bit pattern, and XOR cancels equal pairs.",
        "All are constant time on one word, except counting bits, which is proportional to how many bits are set.",
      ],
      metrics: [{ label: "Cost", value: "O(1)", level: "good" }],
      scene: scene(
        label("l1", 320, 40, "clear lowest set bit   n & (n - 1)", { size: 14, weight: 800 }),
        label("l2", 320, 90, "power of two   n > 0 && (n & (n - 1)) == 0", {
          size: 14,
          weight: 800,
        }),
        label("l3", 320, 140, "count bits   repeat n &= n - 1", { size: 14, weight: 800 }),
        label("l4", 320, 190, "single number   XOR the whole list", { size: 14, weight: 800 }),
        label("l5", 320, 240, "lowest set bit   n & -n", { size: 14, weight: 800 }),
      ),
    },
  ],
};
