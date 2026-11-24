import { frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

/** A table drawn with stable ids `${id}0..`; `null` slots are empty. */
function table(
  id: string,
  slots: (string | null)[],
  y: number,
  tones: Record<number, Tone> = {},
  w = 52,
) {
  return row(
    slots.map((v) => v ?? ""),
    { id, y, w, index: true, tones, empty: slots.flatMap((v, i) => (v === null ? [i] : [])) },
  );
}

const CAP = (t: string, y = 40) => label("cap", 320, y, t, { size: 14, weight: 800 });

export const resizing: AlgoLesson = {
  id: "resizing",
  title: "Resizing & Rehashing",
  summary: "Keep the load factor low by doubling the table and re-inserting every key.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "What the load factor measures",
    "Why a fuller table has longer chains and probes",
    "Why every key must be rehashed after growing",
    "Why resizing is still amortised O(1)",
  ],
  takeaways: [
    "Load factor is items divided by buckets; as it rises, collisions and probe lengths rise with it.",
    "Growing the table changes `hash % size`, so every key is re-inserted, not copied to the same index.",
    "Doubling makes the occasional O(n) rebuild average out to O(1) per insert.",
  ],
  hud: [
    { label: "Buckets", icon: "grid" },
    { label: "Items", icon: "list" },
    { label: "Load", icon: "gauge" },
    { label: "Probes", icon: "search" },
  ],
  pseudocode: [
    "put(key):",
    "    if items / buckets > 0.75:",
    "        grow()",
    "    insert key by probing from hash % buckets",
    "grow():",
    "    new = array of 2 * buckets empty slots",
    "    for key in old table:",
    "        insert key into new at hash(key) % new size",
    "    table = new",
  ],
  steps: [
    {
      short: "Small table",
      title: "A table that is filling up",
      body: [
        "Here is a table with `4` buckets, using linear probing, holding `A`, `B` and `C`. Their hashes are `5`, `10` and `7`, so they sit at `5 % 4 = 1`, `10 % 4 = 2` and `7 % 4 = 3`.",
        "There is one free slot left. Watch what happens as we use it.",
      ],
      metrics: [
        { label: "Buckets", value: "4" },
        { label: "Items", value: "3" },
        { label: "Load", value: "0.75", level: "warn" },
      ],
      scene: scene(
        table("a", [null, "A", "B", "C"], 150, { 1: "done", 2: "done", 3: "done" }),
        CAP("4 buckets, 3 items"),
      ),
    },
    {
      short: "Load factor",
      title: "Load factor: how full is it",
      body: [
        "The load factor is `items / buckets`. For `3` items in `4` buckets it is `3 / 4 = 0.75`.",
        "It is the single number that predicts performance. Low load means most buckets hold at most one key; high load means collisions everywhere.",
      ],
      callout: {
        kind: "insight",
        text: "Most libraries resize somewhere between a load of 0.5 and 1, depending on the collision strategy.",
      },
      metrics: [
        { label: "Buckets", value: "4" },
        { label: "Items", value: "3" },
        { label: "Load", value: "0.75", level: "warn" },
      ],
      lines: [2],
      scene: scene(
        table("a", [null, "A", "B", "C"], 150, { 1: "done", 2: "done", 3: "done" }),
        CAP("load factor = 3 items / 4 buckets = 0.75"),
      ),
    },
    {
      short: "Insert D",
      title: "The next key hits a wall",
      body: [
        "Insert `D`, which hashes to `9`. `9 % 4 = 1`, but slot `1` holds `A`. Probing moves to slot `2`, then `3`, both taken.",
        "Every taken slot is a wasted comparison, and they all sit in one run.",
      ],
      metrics: [
        { label: "Load", value: "0.75", level: "warn" },
        { label: "Probes", value: "3", level: "warn" },
      ],
      lines: [4],
      scene: scene(
        table("a", [null, "A", "B", "C"], 150, { 1: "warn", 2: "warn", 3: "warn" }),
        CAP("D: 9 % 4 = 1, taken; 2, taken; 3, taken..."),
        ptr("p", "a3", "still full", { tone: "warn" }),
      ),
    },
    {
      short: "Full",
      title: "Probing wraps around to the last slot",
      body: [
        "The probe wraps past the end to slot `0`, which is free. `D` needed `4` probes to be placed, and finding it later costs the same.",
        "The table is now full: load `1.0`. With nothing free, the next insert could not terminate, and lookups of missing keys would loop through every slot.",
      ],
      callout: {
        kind: "warn",
        text: "At load 1.0 a failed lookup in open addressing scans the whole table.",
      },
      metrics: [
        { label: "Items", value: "4" },
        { label: "Load", value: "1.00", level: "bad" },
        { label: "Probes", value: "4", level: "bad" },
      ],
      lines: [4],
      scene: scene(
        table("a", ["D", "A", "B", "C"], 150, { 0: "found", 1: "done", 2: "done", 3: "done" }),
        CAP("D took 4 probes; load = 4 / 4 = 1.00"),
      ),
    },
    {
      short: "Grow",
      title: "Allocate a bigger table",
      body: [
        "The fix is to grow before it gets this bad: allocate a new array twice the size, here `8` buckets. A common trigger is a load above `0.75`.",
        "The old table is still intact. The question is how to fill the new one.",
      ],
      metrics: [
        { label: "Buckets", value: "8", level: "good" },
        { label: "Items", value: "4" },
        { label: "Load", value: "0.50", level: "good" },
      ],
      lines: [5, 6],
      scene: scene(
        table("a", ["D", "A", "B", "C"], 70, { 0: "muted", 1: "muted", 2: "muted", 3: "muted" }),
        table("b", [null, null, null, null, null, null, null, null], 200),
        label("o", 320, 30, "old table, 4 buckets", { size: 12, tone: "muted" }),
        label("n", 320, 262, "new table, 8 buckets", { size: 12, tone: "muted" }),
      ),
    },
    {
      short: "Rehash",
      title: "Every key is re-inserted",
      body: [
        "You cannot copy slot `i` to slot `i`. The index is `hash % size`, and the size changed. `A` was at `5 % 4 = 1`; now `5 % 8 = 5`.",
        "So each key is hashed again and placed by the new size: `A` goes to `5`, `B` to `10 % 8 = 2`, `C` to `7 % 8 = 7`, `D` to `9 % 8 = 1`.",
      ],
      callout: {
        kind: "tip",
        text: "Store each key's full hash if hashing is expensive, so rehashing only needs the modulo.",
      },
      metrics: [
        { label: "Buckets", value: "8" },
        { label: "Items", value: "4" },
        { label: "Load", value: "0.50", level: "good" },
        { label: "Probes", value: "1", level: "good" },
      ],
      lines: [7, 8, 9],
      scene: scene(
        table("a", ["D", "A", "B", "C"], 70, { 0: "muted", 1: "muted", 2: "muted", 3: "muted" }),
        table("b", [null, "D", "B", null, null, "A", null, "C"], 200, {
          1: "found",
          2: "found",
          5: "found",
          7: "found",
        }),
        label("n", 320, 262, "A: 5 % 8 = 5   B: 10 % 8 = 2   C: 7 % 8 = 7   D: 9 % 8 = 1", {
          size: 12,
          weight: 800,
        }),
      ),
    },
    {
      short: "Cost",
      title: "One rebuild, many cheap inserts",
      body: [
        "A rebuild touches every key, so that one insert costs O(n). But after doubling, there is room for `n` more inserts before the next rebuild.",
        "Rebuilds at sizes `4, 8, 16, 32...` copy `4 + 8 + 16 + ...` keys, a total below twice the final size. Spread over all inserts, that is a constant per insert: amortised O(1).",
      ],
      callout: {
        kind: "insight",
        text: "Growing by a fixed amount instead of a factor would make the total cost quadratic.",
      },
      metrics: [
        { label: "Buckets", value: "8" },
        { label: "Load", value: "0.50", level: "good" },
      ],
      lines: [3, 7, 8],
      scene: scene(
        row([4, 8, 16, 32], { y: 120, w: 70, id: "g" }),
        label("t", 320, 70, "keys copied by each rebuild", { size: 13, weight: 800 }),
        frame("f", 150, 90, 340, 62, undefined, { dashed: true }),
        label("s", 320, 200, "4 + 8 + 16 = 28 < 2 x 32, so about 2 copies per insert", {
          size: 13,
          tone: "good",
        }),
      ),
    },
    {
      short: "Recap",
      title: "The rule to remember",
      body: [
        "Track `load = items / buckets`. When it passes a threshold, double the buckets and rehash every key into the new array.",
        "That keeps chains and probe runs short, so lookups stay O(1) on average and inserts are amortised O(1), at the cost of up to twice the memory.",
      ],
      metrics: [{ label: "Load", value: "< 0.75", level: "good" }],
      scene: scene(
        label("r1", 320, 90, "load = items / buckets", { size: 16, weight: 800 }),
        label("r2", 320, 140, "too high: double the table, rehash every key", {
          size: 14,
          weight: 800,
        }),
        label("r3", 320, 190, "lookup O(1) average, insert O(1) amortised", {
          size: 13,
          tone: "good",
        }),
      ),
    },
  ],
};
