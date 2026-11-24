import { cell, frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

/** Sixteen numbered slots (two rows of eight) with optional values and tones. */
function slots(values: Record<number, string>, tones: Record<number, Tone> = {}) {
  return Array.from({ length: 16 }, (_, i) =>
    cell(`m${i}`, 100 + (i % 8) * 62, i < 8 ? 110 : 190, values[i] ?? "", {
      w: 54,
      h: 46,
      sub: String(100 + i),
      tone: tones[i] ?? (values[i] === undefined ? "ghost" : "plain"),
    }),
  );
}

export const memory: AlgoLesson = {
  id: "memory",
  title: "Memory & Pointers",
  summary:
    "RAM is a long row of numbered slots; pointers are just slot numbers stored in other slots.",
  minutes: 10,
  level: "beginner",
  goals: [
    "Memory as numbered slots with addresses",
    "Variables, values and references",
    "Contiguous versus scattered storage",
    "Stack versus heap at a high level",
  ],
  takeaways: [
    "Memory is a huge numbered row of slots; an address is just a slot's number.",
    "A pointer or reference is a value that holds another slot's address.",
    "Arrays sit side by side, so `a[i]` is computed straight from the start address, in O(1).",
  ],
  hud: [
    { label: "Address", icon: "memory" },
    { label: "Value", icon: "database" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "memory_ops():",
    "    x = 42                        # store 42 in a free slot",
    "    p = address_of(x)             # p holds x's address, 103",
    "    value = memory[p]             # follow the pointer",
    "    addr = start + i * size       # address of a[i]",
    "    value = memory[addr]          # one read: O(1)",
    "    node = head",
    "    repeat i times:               # linked list: O(n) to reach",
    "        node = memory[node.next]",
    "    return node.value",
  ],
  steps: [
    {
      short: "Slots",
      title: "Memory is numbered slots",
      body: [
        "Picture RAM as a very long row of identical boxes, each with a number: its address. Each box holds one small value.",
        "The machine can open any box in one step if it knows the number. That is all memory is.",
      ],
      metrics: [{ label: "Address", value: "100 to 115" }],
      scene: scene(
        slots({}),
        label("cap", 320, 260, "addresses 100 to 115, all empty", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Variable",
      title: "A variable names a slot",
      body: [
        "When you write `x = 42`, the program picks a free slot, say address 103, stores `42` there and remembers that `x` means 103.",
        "The name is for you. The hardware only ever sees the address.",
      ],
      metrics: [
        { label: "Address", value: "103" },
        { label: "Value", value: "42" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [2],
      scene: scene(slots({ 3: "42" }, { 3: "active" }), ptr("x", "m3", "x", { side: "above" })),
    },
    {
      short: "Pointer",
      title: "A pointer stores an address",
      body: [
        "Now `p = &x`. The slot for `p` (address 108) holds the number `103`, which is where `x` lives.",
        "Following the pointer means: read 108, get 103, then read slot 103 and find `42`. Many languages hide this and call it a reference.",
      ],
      callout: {
        kind: "insight",
        text: "A pointer is an ordinary value; what it holds happens to be an address.",
      },
      metrics: [
        { label: "Address", value: "108 → 103" },
        { label: "Value", value: "42" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [3, 4],
      scene: scene(
        slots({ 3: "42", 8: "103" }, { 3: "found", 8: "active" }),
        ptr("p", "m8", "p", { side: "below" }),
        label("cap", 320, 260, "p holds 103, so p points at x", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Contiguous",
      title: "Arrays sit side by side",
      body: [
        "An array of 4 numbers claims 4 neighbouring slots, here 104 to 107. This is contiguous storage.",
        "Because they are neighbours, the program only needs to remember the first address.",
      ],
      metrics: [
        { label: "Address", value: "104 to 107" },
        { label: "Value", value: "4 items" },
      ],
      scene: scene(
        slots({ 4: "7", 5: "3", 6: "9", 7: "1" }, { 4: "mark", 5: "mark", 6: "mark", 7: "mark" }),
        frame("arr", 215, 82, 240, 62, "array a, start = 104"),
      ),
    },
    {
      short: "Indexing",
      title: "Why a[i] is instant",
      body: [
        "To read `a[2]` the machine computes `104 + 2 = 106` and opens that slot. One addition, one read, no searching.",
        "That is why array indexing is O(1), however large the array is.",
      ],
      callout: { kind: "tip", text: "address of a[i] = start + i × size of one item" },
      metrics: [
        { label: "Address", value: "104 + 2 = 106" },
        { label: "Value", value: "9" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [5, 6],
      scene: scene(
        slots({ 4: "7", 5: "3", 6: "9", 7: "1" }, { 4: "done", 5: "done", 6: "found", 7: "done" }),
        ptr("i", "m6", "a[2]", { side: "below" }),
      ),
    },
    {
      short: "Scattered",
      title: "Scattered nodes, linked by pointers",
      body: [
        "A linked list puts each item wherever there is room, and each node stores the address of the next one. Here `7` at 101 points to 105, which points to 110.",
        "Reaching the third item means following two pointers, so indexing is O(n), but inserting needs no shifting.",
      ],
      metrics: [
        { label: "Address", value: "101 → 105 → 110" },
        { label: "Cost", value: "O(n) to reach", level: "warn" },
      ],
      lines: [7, 8, 9],
      scene: scene(
        slots({ 1: "7→105", 5: "3→110", 10: "9→∅" }, { 1: "mark", 5: "mark", 10: "mark" }),
        ptr("head", "m1", "head", { side: "above" }),
      ),
    },
    {
      short: "Stack/heap",
      title: "Two regions: stack and heap",
      body: [
        "Local variables and function calls live on the call stack: fast, automatic, freed when the function returns.",
        "Objects whose size or lifetime is not known in advance go on the heap. A stack variable then holds a reference to the heap object.",
      ],
      callout: {
        kind: "warn",
        text: "Keep a reference after the object is freed and you have a dangling pointer.",
      },
      metrics: [
        { label: "Address", value: "ref → heap" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      scene: scene(
        frame("fs", 80, 70, 190, 150, "stack", { tone: "active" }),
        frame("fh", 370, 70, 190, 150, "heap", { tone: "mark" }),
        cell("sv", 175, 150, "ref 7f2", { w: 120, h: 40, tone: "active" }),
        cell("hv", 465, 150, "[7, 3, 9]", { w: 120, h: 40, tone: "mark" }),
        ptr("sv-hv", "hv", "7f2", { side: "left", tone: "mark" }),
      ),
    },
    {
      short: "Recap",
      title: "Contiguous is fast to index, linked is flexible",
      body: [
        "Everything is slots and addresses. Contiguous blocks give O(1) indexing but are costly to grow or insert into; scattered nodes joined by pointers are easy to rearrange but slow to reach.",
        "Most data-structure trade-offs come back to this choice.",
      ],
      metrics: [{ label: "Cost", value: "O(1) vs O(n)" }],
      scene: scene(
        row(["7", "3", "9"], { id: "c", x: 180, y: 120, w: 48, tones: () => "mark" }),
        label("lc", 180, 175, "array: O(1) index", { size: 13, weight: 800 }),
        row(["7", "3", "9"], { id: "l", x: 460, y: 120, w: 48, gap: 26, tones: () => "done" }),
        label("ll", 460, 175, "linked: O(n) index", { size: 13, weight: 800 }),
      ),
    },
  ],
};
