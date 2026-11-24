import { bars, label, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

/** One row of slots; `cap` slots, the first `vals.length` filled, the rest drawn as ghosts. */
function slots(vals: number[], cap: number, o: { id?: string; y?: number; done?: number } = {}) {
  const { id = "a", y = 150, done = -1 } = o;
  return row(
    Array.from({ length: cap }, (_, i) => (i < vals.length ? vals[i] : "")),
    {
      id,
      y,
      index: true,
      empty: Array.from({ length: cap - vals.length }, (_, i) => vals.length + i),
      tones: (i) => (i <= done ? "done" : undefined),
    },
  );
}

export const dynamicArrays: AlgoLesson = {
  id: "dynamic-arrays",
  title: "Dynamic Arrays",
  summary: "An array that grows by doubling its capacity, so appending is cheap on average.",
  minutes: 11,
  level: "beginner",
  goals: [
    "The difference between length and capacity",
    "How append works and when it must resize",
    "Why doubling makes append amortised O(1)",
    "Cost of one resize versus the average cost",
    "When and how to shrink",
  ],
  takeaways: [
    "A dynamic array keeps spare capacity so most appends just write into the next free slot.",
    "When full it allocates double the space and copies everything over: one expensive append, rarely.",
    "Spread out, the copies total less than 2n, so append is O(1) amortised even though one append can cost O(n).",
  ],
  hud: [
    { label: "Length", icon: "list" },
    { label: "Capacity", icon: "memory" },
    { label: "Op cost", icon: "timer" },
  ],
  pseudocode: [
    "append(a, x):",
    "    if length == capacity:",
    "        bigger = new block of 2 * capacity",
    "        copy a[0 .. length - 1] into bigger",
    "        a = bigger",
    "    a[length] = x",
    "    length = length + 1",
    "pop(a):",
    "    length = length - 1",
    "    if length <= capacity / 4:",
    "        copy into a block of half the capacity",
  ],
  steps: [
    {
      short: "Len and cap",
      title: "Two numbers, not one",
      body: [
        "A plain array has a fixed size. A dynamic array wraps one and tracks two numbers: `length`, how many slots hold real values, and `capacity`, how many slots exist.",
        "Here length is 3 and capacity is 4. The dashed slot is spare room that is allocated but unused.",
      ],
      metrics: [
        { label: "Length", value: "3" },
        { label: "Capacity", value: "4" },
      ],
      scene: scene(
        label("t", 320, 70, "length 3 · capacity 4", { size: 14, weight: 800 }),
        slots([7, 2, 9], 4),
      ),
    },
    {
      short: "Append 5",
      title: "Append into spare room",
      body: [
        "`append(5)` writes into index `length`, which is 3, then adds one to the length. Nothing else moves.",
        "That is one write: `O(1)`. Most appends look like this one.",
      ],
      metrics: [
        { label: "Length", value: "4" },
        { label: "Capacity", value: "4", level: "warn" },
        { label: "Op cost", value: "1", level: "good" },
      ],
      lines: [1, 6, 7],
      scene: scene(
        label("t", 320, 70, "length 4 · capacity 4", { size: 14, weight: 800 }),
        row([7, 2, 9, 5], { index: true, tones: { 3: "found" } }),
      ),
    },
    {
      short: "Full",
      title: "Out of room",
      body: [
        "Now `append(8)` has nowhere to go: length equals capacity. The neighbouring memory is not ours to use.",
        "The array has to move to a bigger home.",
      ],
      callout: {
        kind: "warn",
        text: "Growing by one slot each time would copy every element on every append and cost O(n) per append.",
      },
      metrics: [
        { label: "Length", value: "4" },
        { label: "Capacity", value: "4", level: "bad" },
      ],
      lines: [1, 2],
      scene: scene(
        label("t", 320, 70, "append(8): no free slot", { size: 14, weight: 800, tone: "warn" }),
        row([7, 2, 9, 5], { index: true, tones: (i) => (i < 4 ? "warn" : undefined) }),
      ),
    },
    {
      short: "Allocate 2x",
      title: "Allocate double the space",
      body: [
        "A new block is allocated with capacity 8, twice the old one. It starts out empty, all spare room.",
        "Allocation by itself is cheap; the real work comes next.",
      ],
      metrics: [
        { label: "Length", value: "4" },
        { label: "Capacity", value: "8", level: "good" },
      ],
      lines: [3],
      scene: scene(
        label("o", 100, 70, "old, capacity 4", { size: 12, tone: "muted", anchor: "start" }),
        slots([7, 2, 9, 5], 4, { id: "o", y: 110 }),
        label("n", 100, 200, "new, capacity 8", { size: 12, tone: "muted", anchor: "start" }),
        slots([], 8, { id: "n", y: 240 }),
      ),
    },
    {
      short: "Copy over",
      title: "Copy every element",
      body: [
        "All four values are copied into the new block, in order. That is 4 copies, a cost proportional to the length: `O(n)`.",
        "This is the expensive append, and there is no way around it. The old block can now be released.",
      ],
      metrics: [
        { label: "Length", value: "4" },
        { label: "Capacity", value: "8" },
        { label: "Op cost", value: "4 copies", level: "bad" },
      ],
      lines: [4, 5],
      scene: scene(
        label("o", 100, 70, "old, capacity 4", { size: 12, tone: "muted", anchor: "start" }),
        row([7, 2, 9, 5], { id: "o", y: 110, tones: () => "muted" }),
        label("n", 100, 200, "new, capacity 8", { size: 12, tone: "muted", anchor: "start" }),
        slots([7, 2, 9, 5], 8, { id: "n", y: 240, done: 3 }),
      ),
    },
    {
      short: "Then append",
      title: "Now the append fits",
      body: [
        "`8` is written into index 4 of the new block. Length is 5 and four slots are spare again.",
        "The next three appends will be plain `O(1)` writes, until capacity 8 fills and we double to 16.",
      ],
      metrics: [
        { label: "Length", value: "5" },
        { label: "Capacity", value: "8" },
        { label: "Op cost", value: "1", level: "good" },
      ],
      lines: [6, 7],
      scene: scene(
        label("t", 320, 70, "length 5 · capacity 8", { size: 14, weight: 800 }),
        row([7, 2, 9, 5, 8, "", "", ""], {
          id: "n",
          y: 150,
          index: true,
          empty: [5, 6, 7],
          tones: { 4: "found" },
        }),
      ),
    },
    {
      short: "Cost per op",
      title: "One big bill, many cheap ones",
      body: [
        "Start with capacity 1 and append eight times. Each bar is that append's cost (writes plus copies). Most cost 1; the rare resizes cost 2, 3 and 5.",
        "The total is 15 for 8 appends, under 2 per append. A single resize is `O(n)`, but the average stays small.",
      ],
      callout: {
        kind: "insight",
        text: "Amortised cost is the total over a sequence divided by its length, not the worst single operation.",
      },
      metrics: [{ label: "Op cost", value: "avg < 2", level: "good" }],
      scene: scene(
        label("t", 320, 60, "cost of appends 1 to 8: total 15", { size: 13, weight: 800 }),
        bars([1, 2, 3, 1, 5, 1, 1, 1], {
          y: 220,
          index: 1,
          scale: 22,
          tones: (i) => ([1, 2, 4].includes(i) ? "warn" : "done"),
        }),
      ),
    },
    {
      short: "Why doubling",
      title: "Doubling keeps copies bounded",
      body: [
        "To reach n items we resize at sizes 1, 2, 4, 8, ... up to about n. Those copies add up to `1 + 2 + 4 + ... < 2n`.",
        "So n appends cost under 3n steps overall, and each is `O(1)` amortised. Doubling is what makes this work: adding a fixed amount each time would give `O(n)` per append on average.",
      ],
      callout: {
        kind: "tip",
        text: "Real libraries often grow by 1.5x or 2x. The exact factor is a memory versus speed trade-off; any constant above 1 keeps append O(1) amortised.",
      },
      metrics: [{ label: "Op cost", value: "O(1) amortised", level: "good" }],
      scene: scene(
        label("a", 320, 90, "copies at each resize: 1 + 2 + 4 + 8 + ...", {
          size: 14,
          weight: 800,
        }),
        label("b", 320, 150, "always less than 2n in total", {
          size: 14,
          tone: "good",
          weight: 800,
        }),
        label("c", 320, 205, "so n appends cost O(n), about O(1) each", {
          size: 13,
          tone: "muted",
        }),
      ),
    },
    {
      short: "Shrinking",
      title: "Giving memory back",
      body: [
        "After many removals the array may hold far less than it reserves: here length 2 in capacity 8. A shrink halves the capacity and copies the values into the smaller block.",
        "Do it when length falls to a quarter of capacity, not a half. Shrinking at exactly half would let an add-remove-add pattern resize on every call.",
      ],
      callout: {
        kind: "warn",
        text: "Shrink and grow thresholds must differ, or alternating append and pop at the boundary resizes every time.",
      },
      metrics: [
        { label: "Length", value: "2" },
        { label: "Capacity", value: "8 → 4", level: "warn" },
      ],
      lines: [8, 9, 10, 11],
      scene: scene(
        label("t", 320, 70, "length 2 ≤ capacity 8 / 4: shrink to 4", { size: 13, weight: 800 }),
        slots([7, 2], 8),
      ),
    },
  ],
};
