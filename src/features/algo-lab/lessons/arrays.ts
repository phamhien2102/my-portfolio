import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

type Slot = number | null;

/** Six slots (capacity 6); `null` is an unused slot. Keys follow the values, so shifted cells slide. */
function arr(vals: Slot[], tones?: Record<number, Tone>, showAddr = false): Item[] {
  return [
    ...row(
      vals.map((v) => v ?? ""),
      {
        y: 150,
        index: true,
        keys: vals.map((v) => (v === null ? "g" : String(v))),
        empty: vals.flatMap((v, i) => (v === null ? [i] : [])),
        tones,
      },
    ),
    ...(showAddr
      ? vals.map((_, i) =>
          label(`addr${i}`, 170 + i * 60, 228, String(1000 + i * 4), { size: 11, tone: "muted" }),
        )
      : []),
  ];
}

const START: Slot[] = [10, 20, 30, 40, 50, null];

export const arrays: AlgoLesson = {
  id: "arrays",
  title: "Arrays",
  summary:
    "A row of equal slots side by side in memory: instant reads, costly inserts in the middle.",
  minutes: 10,
  level: "beginner",
  goals: [
    "What contiguous memory means",
    "How an index turns into an address",
    "Why reading and writing by index is O(1)",
    "Why inserting or deleting in the middle is O(n)",
    "What a fixed size costs you",
  ],
  takeaways: [
    "Slots sit side by side, so the address of slot i is base + i * size and any element is one jump away.",
    "Changing the middle means sliding everything after it over by one place, which costs O(n).",
    "A plain array has a fixed capacity: it cannot grow without making a new, bigger array.",
  ],
  hud: [
    { label: "Length", icon: "list" },
    { label: "Shifts", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "address(a, i):",
    "    return base + i * size",
    "read(a, i):",
    "    return memory[address(a, i)]",
    "write(a, i, x):",
    "    memory[address(a, i)] = x",
    "insert(a, i, x):",
    "    for k from n - 1 down to i:",
    "        a[k + 1] = a[k]",
    "    a[i] = x",
  ],
  steps: [
    {
      short: "Side by side",
      title: "Slots in a row",
      body: [
        "An array reserves one block of memory and cuts it into equal slots. Here there are six slots, five filled and one still free.",
        "Because the slots are neighbours with no gaps, the block is called contiguous. Each slot has an index, counting from `0`.",
      ],
      metrics: [{ label: "Length", value: "5" }],
      scene: scene(arr(START)),
    },
    {
      short: "Address math",
      title: "An index is just arithmetic",
      body: [
        "Say the block starts at address `1000` and each slot takes 4 bytes. Slot `i` then lives at `1000 + i * 4`.",
        "The computer does one multiplication and one addition. It never has to walk past the earlier slots.",
      ],
      callout: {
        kind: "insight",
        text: "Equal-sized slots are the trick: size is known, so position is a formula instead of a search.",
      },
      metrics: [{ label: "Length", value: "5" }],
      lines: [1, 2],
      scene: scene(
        label("base", 320, 70, "base 1000, 4 bytes per slot", { size: 13, weight: 800 }),
        arr(START, undefined, true),
      ),
    },
    {
      short: "Read a[3]",
      title: "Reading is one jump",
      body: [
        "`a[3]` computes `1000 + 3 * 4 = 1012` and reads the value there, `40`. It takes the same time for slot 3 as for slot 3,000,000.",
        "That is constant time, written `O(1)`, and it is the array's main selling point.",
      ],
      metrics: [
        { label: "Length", value: "5" },
        { label: "Shifts", value: "0", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [3, 4],
      scene: scene(
        label("eq", 320, 70, "1000 + 3 × 4 = 1012", { size: 14, weight: 800 }),
        arr(START, { 3: "found" }),
        ptr("r", "a40", "a[3]", { side: "above", tone: "found" }),
      ),
    },
    {
      short: "Write a[3]",
      title: "Writing is also one jump",
      body: [
        "`a[3] = 45` finds the same address and overwrites what is there. No other slot is touched.",
        "Reads and writes by index are both `O(1)`.",
      ],
      callout: {
        kind: "tip",
        text: "If you know the index, an array is the fastest place to look. If you only know the value, you still have to scan.",
      },
      metrics: [
        { label: "Length", value: "5" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [5, 6],
      scene: scene(
        label("eq", 320, 70, "a[3] = 45", { size: 14, weight: 800 }),
        row([10, 20, 30, 45, 50, ""], {
          y: 150,
          index: true,
          keys: ["10", "20", "30", "40", "50", "g"],
          empty: [5],
          tones: { 3: "found" },
        }),
      ),
    },
    {
      short: "Insert plan",
      title: "Inserting in the middle",
      body: [
        "Now insert `15` at index 1 so the order stays `10, 15, 20, ...`. Slot 1 is taken by `20`, and there are no gaps to borrow.",
        "The only way to make room is to move `20`, `30`, `40` and `50` one place to the right, starting from the end.",
      ],
      metrics: [
        { label: "Length", value: "5" },
        { label: "Shifts", value: "0", level: "good" },
      ],
      lines: [7],
      scene: scene(
        label("eq", 320, 70, "insert 15 at index 1", { size: 14, weight: 800 }),
        arr(START, { 1: "warn", 2: "warn", 3: "warn", 4: "warn" }),
        ptr("ins", "a20", "here", { side: "above", tone: "warn" }),
      ),
    },
    {
      short: "Shift 50",
      title: "Move the last element first",
      body: [
        "`50` slides into the free slot at index 5. Going from the right keeps us from overwriting anything we still need.",
        "That left a hole at index 4, ready for `40`.",
      ],
      callout: {
        kind: "warn",
        text: "Shifting from the left would overwrite: copying 20 into slot 2 destroys 30 before it has moved.",
      },
      metrics: [
        { label: "Shifts", value: "1", level: "warn" },
        { label: "Cost", value: "O(n)", level: "warn" },
      ],
      lines: [8, 9],
      scene: scene(
        label("eq", 320, 70, "insert 15 at index 1", { size: 14, weight: 800 }),
        arr([10, 20, 30, 40, null, 50], { 1: "warn", 2: "warn", 3: "warn", 5: "done" }),
      ),
    },
    {
      short: "Shift rest",
      title: "Each one steps right",
      body: [
        "`40`, then `30`, then `20` each move one slot right. That is four shifts in total, and the hole has travelled to index 1.",
        "Inserting near the front moves almost every element, so the work grows with the array's length: `O(n)`.",
      ],
      metrics: [
        { label: "Shifts", value: "4", level: "bad" },
        { label: "Cost", value: "O(n)", level: "warn" },
      ],
      lines: [8, 9],
      scene: scene(
        label("eq", 320, 70, "insert 15 at index 1", { size: 14, weight: 800 }),
        arr([10, null, 20, 30, 40, 50], { 2: "done", 3: "done", 4: "done", 5: "done" }),
      ),
    },
    {
      short: "Drop it in",
      title: "Write the new value",
      body: [
        "With the hole open at index 1, `15` is written in, one `O(1)` write. The array is now full.",
        "Deleting is the mirror image: remove the value, then slide everything after it one place left to close the hole.",
      ],
      metrics: [
        { label: "Length", value: "6" },
        { label: "Shifts", value: "4", level: "bad" },
      ],
      lines: [10],
      scene: scene(
        label("eq", 320, 70, "10, 15, 20, 30, 40, 50", { size: 14, weight: 800 }),
        arr([10, 15, 20, 30, 40, 50], { 1: "found" }),
      ),
    },
    {
      short: "Fixed size",
      title: "No room for a seventh",
      body: [
        "All six slots are used. A plain array cannot grow, because the memory right after it may belong to something else.",
        "To add more you would allocate a larger block and copy everything over. Dynamic arrays automate that, which is the next lesson.",
      ],
      callout: {
        kind: "insight",
        text: "Fast reads cost you flexible size and cheap middle edits. Appending at the end, when there is room, is still O(1).",
      },
      metrics: [
        { label: "Length", value: "6", level: "warn" },
        { label: "Cost", value: "O(1) read", level: "good" },
      ],
      scene: scene(
        label("eq", 320, 70, "length 6, capacity 6: full", { size: 14, weight: 800 }),
        arr([10, 15, 20, 30, 40, 50], {
          0: "done",
          1: "done",
          2: "done",
          3: "done",
          4: "done",
          5: "done",
        }),
        ptr("nx", { x: 560, y: 150 }, "a[6]?", { side: "left", tone: "warn" }),
      ),
    },
  ],
};
