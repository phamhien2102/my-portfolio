import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

/** A 6-slot ring: slots hold text ("" = never written), head = oldest, tail = next write. */
function view(
  slots: string[],
  head: number,
  tail: number,
  o: {
    stale?: number[];
    warn?: boolean;
    note?: string;
    extra?: string;
    tone?: "active" | "warn";
  } = {},
) {
  const same = head === tail;
  return scene(
    row(slots, {
      y: 150,
      index: true,
      empty: slots.map((s, i) => (s === "" ? i : -1)).filter((i) => i >= 0),
      tones: (i) =>
        o.stale?.includes(i)
          ? "muted"
          : o.warn
            ? "warn"
            : i === head && slots[i] !== ""
              ? "mark"
              : undefined,
    }),
    same
      ? ptr("head", `a${head}`, "head = tail", { side: "below", tone: o.warn ? "warn" : "mark" })
      : [
          ptr("head", `a${head}`, "head", { side: "below", tone: "mark" }),
          ptr("tail", `a${tail}`, "tail", { side: "above", tone: "active" }),
        ],
    o.note &&
      label("note", 320, 60, o.note, { size: 14, weight: 800, tone: o.warn ? "warn" : "ink" }),
    o.extra &&
      label("extra", 320, 255, o.extra, { size: 14, weight: 800, tone: o.warn ? "warn" : "good" }),
  );
}

export const circularBuffer: AlgoLesson = {
  id: "circular-buffer",
  title: "Circular Buffer",
  summary: "A fixed array used as a queue whose head and tail indexes wrap around with modulo.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "How head and tail wrap around a fixed array",
    "Why index + 1 is taken modulo the capacity",
    "The full-versus-empty ambiguity and two fixes",
    "Overwrite-oldest mode for streams and logs",
  ],
  takeaways: [
    "A circular buffer is a queue in a fixed array: head reads the oldest item, tail writes the next, and both advance with (i + 1) % capacity.",
    "When head equals tail the buffer may be empty or full, so keep a count or leave one slot spare.",
    "Overwrite-oldest mode drops the oldest item when full, which keeps the latest `capacity` items in constant memory.",
  ],
  hud: [
    { label: "Head", icon: "queue" },
    { label: "Tail", icon: "queue" },
    { label: "Count", icon: "list" },
    { label: "State", icon: "memory" },
  ],
  pseudocode: [
    "enqueue(x):",
    '    if count == capacity: error "full"',
    "    items[tail] = x",
    "    tail = (tail + 1) % capacity",
    "    count = count + 1",
    "dequeue():",
    "    x = items[head]",
    "    head = (head + 1) % capacity",
    "    count = count - 1",
    "    return x",
  ],
  steps: [
    {
      short: "Fixed array",
      title: "A queue in a fixed array",
      body: [
        "Allocate an array of `capacity = 6` slots once. Two indexes describe the queue: `head` is where the oldest item sits, `tail` is where the next one will be written.",
        "Both start at 0 and the buffer is empty.",
      ],
      metrics: [
        { label: "Head", value: "0" },
        { label: "Tail", value: "0" },
        { label: "Count", value: "0", level: "good" },
        { label: "State", value: "empty" },
      ],
      scene: view(["", "", "", "", "", ""], 0, 0, { note: "capacity 6, nothing stored" }),
    },
    {
      short: "Write A B C",
      title: "Writes advance the tail",
      body: [
        "`enqueue(A)` writes at `tail` and then moves it forward by one. Three writes put `A`, `B` and `C` in slots 0 to 2 and leave `tail` at 3.",
        "Reading works the same way at `head`. No item ever moves.",
      ],
      metrics: [
        { label: "Head", value: "0" },
        { label: "Tail", value: "3" },
        { label: "Count", value: "3", level: "good" },
        { label: "State", value: "partial" },
      ],
      lines: [3, 4, 5],
      scene: view(["A", "B", "C", "", "", ""], 0, 3),
    },
    {
      short: "Read A",
      title: "Reads advance the head",
      body: [
        "`dequeue()` returns the value at `head`, which is `A`, and moves `head` to 1. The old `A` stays in memory but is dead: it is outside the live range.",
        "The live items are the slots from `head` up to, but not including, `tail`.",
      ],
      metrics: [
        { label: "Head", value: "1" },
        { label: "Tail", value: "3" },
        { label: "Count", value: "2", level: "good" },
        { label: "State", value: "partial" },
      ],
      lines: [7, 8, 9, 10],
      scene: view(["A", "B", "C", "", "", ""], 1, 3, {
        stale: [0],
        note: "A is read, slot 0 is free again",
      }),
    },
    {
      short: "Wrap around",
      title: "The tail wraps to the start",
      body: [
        "Write `D`, `E` and `F` into slots 3, 4 and 5. Now `tail` would become 6, past the end, so we compute `(5 + 1) % 6 = 0` and it wraps back to slot 0.",
        "That free slot at the front is reused, which is why the array is called circular.",
      ],
      callout: {
        kind: "tip",
        text: "Advance with `i = (i + 1) % capacity`. Skipping the modulo and testing `i == capacity` also works, but the modulo form is shorter.",
      },
      metrics: [
        { label: "Head", value: "1" },
        { label: "Tail", value: "0" },
        { label: "Count", value: "5", level: "warn" },
        { label: "State", value: "wrapped" },
      ],
      lines: [4],
      scene: view(["A", "B", "C", "D", "E", "F"], 1, 0, { stale: [0], note: "(5 + 1) % 6 = 0" }),
    },
    {
      short: "Full?",
      title: "Head equals tail: empty or full?",
      body: [
        "Write `G` into slot 0 and advance: `tail` becomes 1, the same as `head`. Every slot is occupied, yet the indexes look exactly like the empty buffer at the start.",
        "From `head` and `tail` alone we cannot tell the two states apart.",
      ],
      callout: {
        kind: "warn",
        text: "This is the classic bug: a full buffer that reports itself empty and loses six items.",
      },
      metrics: [
        { label: "Head", value: "1" },
        { label: "Tail", value: "1" },
        { label: "Count", value: "?", level: "bad" },
        { label: "State", value: "ambiguous", level: "bad" },
      ],
      lines: [2, 5],
      scene: view(["G", "B", "C", "D", "E", "F"], 1, 1, { warn: true, note: "full, or empty?" }),
    },
    {
      short: "Fix it",
      title: "Two fixes: a count or a spare slot",
      body: [
        "Option one: keep a `count`. Empty means `count == 0` and full means `count == capacity`, so the indexes never need to disambiguate.",
        "Option two: never fill the last slot, so a buffer of 6 slots holds at most 5 items. Then `head == tail` always means empty and `(tail + 1) % cap == head` means full.",
      ],
      callout: {
        kind: "insight",
        text: "A count costs one integer; the spare slot costs one array cell. Both are cheap, pick either and use it consistently.",
      },
      metrics: [
        { label: "Head", value: "1" },
        { label: "Tail", value: "1" },
        { label: "Count", value: "6", level: "warn" },
        { label: "State", value: "full", level: "warn" },
      ],
      lines: [2, 5, 9],
      scene: view(["G", "B", "C", "D", "E", "F"], 1, 1, {
        note: "count = 6 = capacity: full",
        extra: "oldest to newest: B C D E F G",
      }),
    },
    {
      short: "Overwrite",
      title: "Overwrite-oldest mode",
      body: [
        "For logs, audio and sensor streams you would rather lose the oldest sample than block. When the buffer is full, `enqueue(H)` writes over the oldest slot and moves `head` forward too.",
        "`B` is gone, `head` is now 2 and `tail` is 2. The buffer always holds the latest 6 items.",
      ],
      callout: {
        kind: "tip",
        text: "Decide the full policy on purpose: reject the write, block, or overwrite. They suit different jobs.",
      },
      metrics: [
        { label: "Head", value: "2" },
        { label: "Tail", value: "2" },
        { label: "Count", value: "6", level: "warn" },
        { label: "State", value: "overwriting" },
      ],
      lines: [2],
      scene: view(["G", "H", "C", "D", "E", "F"], 2, 2, {
        note: "H overwrote B",
        extra: "oldest to newest: C D E F G H",
      }),
    },
    {
      short: "Recap",
      title: "Constant time, constant memory",
      body: [
        "Every operation updates one index and one slot, so enqueue and dequeue are `O(1)` and nothing is copied or resized.",
        "Memory is fixed at `capacity`. The price of that guarantee is deciding what to do when the buffer fills.",
      ],
      metrics: [
        { label: "Head", value: "mod n" },
        { label: "Tail", value: "mod n" },
        { label: "Count", value: "≤ cap", level: "good" },
        { label: "State", value: "O(1)", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 100, "next(i) = (i + 1) % capacity", { size: 15, weight: 800 }),
        label("r2", 320, 140, "empty: count == 0    full: count == capacity", {
          size: 14,
          weight: 800,
        }),
        label("r3", 320, 200, "O(1) per operation, fixed memory", {
          size: 14,
          tone: "good",
          weight: 800,
        }),
      ),
    },
  ],
};
