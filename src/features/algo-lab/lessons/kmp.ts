import { frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const PAT = "ABABAC".split("");
const LPS = [0, 0, 1, 2, 3, 0];
const TEXT = "ABABABAC".split("");

/** Building the table: pattern on top, table below with slots filled up to `filled`. */
function build(i: number, len: number, filled: number, note: string) {
  return scene(
    row(PAT, {
      y: 80,
      index: true,
      tones: (j) => (j === i ? "active" : j < len ? "mark" : undefined),
    }),
    row(
      LPS.map((v, j) => (j < filled ? v : "")),
      {
        id: "t",
        y: 200,
        tones: (j) => (j < filled ? "done" : undefined),
        empty: LPS.map((_, j) => j).filter((j) => j >= filled),
      },
    ),
    ptr("i", `a${i}`, "i", { side: "below" }),
    ptr("len", `a${Math.max(len - 1, 0)}`, `len = ${len}`, { side: "above", tone: "mark" }),
    label("lps", 320, 250, note, { size: 13, weight: 800 }),
  );
}

/** Searching: text on top, pattern lined up at `shift`, table at the bottom. */
function search(
  shift: number,
  j: number,
  i: number,
  o: { miss?: boolean; done?: boolean; note: string },
) {
  const hit = o.done ? "found" : "done";
  return scene(
    row(TEXT, {
      y: 90,
      index: true,
      tones: (t) => (t >= shift && t < shift + j ? hit : o.miss && t === i ? "warn" : undefined),
    }),
    row(PAT, {
      id: "p",
      x: 110 + 60 * shift + 150,
      y: 170,
      tones: (p) => (p < j ? hit : o.miss && p === j ? "warn" : undefined),
    }),
    row(LPS, { id: "t", y: 250, tones: () => "ghost" }),
    ptr("i", `a${i}`, "i", { side: "above" }),
    label("cap", 320, 300, o.note, { size: 13, weight: 800 }),
  );
}

export const kmp: AlgoLesson = {
  id: "kmp",
  title: "KMP Search",
  summary: "Knuth-Morris-Pratt reuses what a partial match tells us, so the text is never re-read.",
  minutes: 14,
  level: "advanced",
  goals: [
    "What the failure (prefix) table stores",
    "How to build the table in one pass over the pattern",
    "How a mismatch jumps the pattern without moving the text pointer back",
    "Why the whole search is O(n + m)",
  ],
  takeaways: [
    "The table entry for position j is the length of the longest proper prefix of the pattern that is also a suffix of its first j + 1 characters.",
    "After a mismatch the text pointer stays put and the pattern pointer falls back to the table value, keeping all the work already done.",
    "Each pointer only moves forward or falls back by an amount already earned, so the total work is O(n + m).",
  ],
  hud: [
    { label: "Table value", icon: "database" },
    { label: "Text moves back", icon: "alert" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "buildTable(p):",
    "    table[0] = 0; len = 0",
    "    for i in 1 .. m - 1:",
    "        while len > 0 and p[i] != p[len]: len = table[len - 1]",
    "        if p[i] == p[len]: len = len + 1",
    "        table[i] = len",
    "search(text, p):",
    "    j = 0",
    "    for i in 0 .. n - 1:",
    "        while j > 0 and text[i] != p[j]: j = table[j - 1]",
    "        if text[i] == p[j]: j = j + 1",
    "        if j == m: return i - m + 1",
  ],
  steps: [
    {
      short: "Problem",
      title: "Do not forget what you matched",
      body: [
        "Naive search, after matching `ABABA` and failing on the next letter, slides the pattern by one and re-reads text it has already seen. Searching `ABABAC` inside `ABABABAC` is exactly that situation.",
        "KMP asks: the matched part is `ABABA` itself, so what does it tell us about where the pattern can still fit?",
      ],
      metrics: [{ label: "Text moves back", value: "naive: yes", level: "warn" }],
      scene: search(0, 5, 5, { miss: true, note: "ABABA matched, then B ≠ C: now what?" }),
    },
    {
      short: "Border",
      title: "A prefix that is also a suffix",
      body: [
        "Look at the matched part `ABABA`. Its first three letters `ABA` (a prefix) are the same as its last three letters (a suffix). A prefix may not be the whole string, hence 'proper'.",
        "So the end of what we matched already looks like the start of the pattern. We can slide the pattern to line those up and keep three letters matched for free.",
      ],
      callout: {
        kind: "insight",
        text: "The failure table answers one question per position: how much of the pattern's start does the end of this prefix already match?",
      },
      metrics: [{ label: "Table value", value: "3", level: "good" }],
      lines: [6],
      scene: scene(
        row("ABABA".split(""), {
          y: 80,
          tones: (j) => (j <= 2 ? "mark" : undefined),
        }),
        frame("pre", 140, 50, 180, 60, "prefix ABA", { tone: "mark" }),
        row("ABABA".split(""), {
          id: "b",
          y: 190,
          tones: (j) => (j >= 2 ? "found" : undefined),
        }),
        frame("suf", 260, 160, 180, 60, "suffix ABA", { tone: "found" }),
        label("len", 320, 140, "longest proper prefix that is also a suffix = 3", {
          size: 12,
          weight: 800,
        }),
      ),
    },
    {
      short: "Build 1",
      title: "Building the table: start",
      body: [
        "`table[0]` is always `0`: a single letter has no proper prefix. We then walk `i` over the pattern with `len`, the length of the current prefix-equals-suffix, starting at `0`.",
        "At `i = 1` we compare `B` with the pattern letter at `len`, which is `A`. They differ and `len` is already `0`, so `table[1] = 0`.",
      ],
      metrics: [{ label: "Table value", value: "0" }],
      lines: [2, 3, 6],
      scene: build(1, 0, 2, "i = 1: B ≠ A, table[1] = 0"),
    },
    {
      short: "Build 2",
      title: "Matches grow the length",
      body: [
        "At `i = 2` the letter `A` equals the pattern letter at `len = 0`, so `len` becomes `1` and `table[2] = 1`.",
        "Then `B` matches `B` (`len = 2`), then `A` matches `A` (`len = 3`). By `i = 4` the table reads `0 0 1 2 3`: each match extends the border by one.",
      ],
      callout: {
        kind: "tip",
        text: "Each match is `len += 1; table[i] = len`. The table fills in one pass.",
      },
      metrics: [{ label: "Table value", value: "3", level: "good" }],
      lines: [3, 5, 6],
      scene: build(4, 3, 5, "i = 4: A = A, len = 3, table[4] = 3"),
    },
    {
      short: "Build 3",
      title: "A mismatch falls back",
      body: [
        "At `i = 5` the letter is `C` but the pattern wants `B` at `len = 3`. Instead of resetting to zero, fall back: `len = table[len - 1] = table[2] = 1`.",
        "`C` against the letter at `1` is `B` again, so fall back once more to `table[0] = 0`. `C` against `A` fails with `len = 0`, so `table[5] = 0`.",
      ],
      callout: {
        kind: "insight",
        text: "The table is built with the same fall-back trick the search will use.",
      },
      metrics: [{ label: "Table value", value: "0" }],
      lines: [3, 4, 6],
      scene: build(5, 0, 6, "i = 5: C never matches, table[5] = 0"),
    },
    {
      short: "Mismatch",
      title: "Search: the mismatch",
      body: [
        "Search the text `ABABABAC`. The pattern matches five letters (`j = 5`) and then `B` meets `C` at text index `i = 5`.",
        "Naive search would restart from text index `1`. KMP looks up `table[j - 1] = table[4] = 3`: the last three matched text letters equal the pattern's first three.",
      ],
      metrics: [
        { label: "Table value", value: "3", level: "good" },
        { label: "Text moves back", value: "no", level: "good" },
      ],
      lines: [9, 10],
      scene: search(0, 5, 5, { miss: true, note: "mismatch at text 5, pattern 5: table[4] = 3" }),
    },
    {
      short: "Jump",
      title: "Slide the pattern, keep i",
      body: [
        "Set `j = 3` and leave `i` at `5`. The pattern jumps right by `j - table[j - 1] = 2`, and its first three letters `ABA` already sit on text indexes `2` to `4`.",
        "We did not compare those three again, and the text pointer never moved backward.",
      ],
      callout: { kind: "warn", text: "Never decrement `i` on a mismatch. Only `j` falls back." },
      metrics: [
        { label: "Table value", value: "3" },
        { label: "Text moves back", value: "no", level: "good" },
      ],
      lines: [10],
      scene: search(2, 3, 5, { note: "j = 3, i stays 5: ABA is already matched" }),
    },
    {
      short: "Found",
      title: "Finish the match",
      body: [
        "Continue from `i = 5`: `B=B`, `A=A`, `C=C`. All six pattern letters are matched, so the pattern starts at text index `i - m + 1 = 2`.",
        "To find every occurrence, after a full match set `j = table[m - 1]` and keep scanning.",
      ],
      metrics: [
        { label: "Table value", value: "0" },
        { label: "Text moves back", value: "never", level: "good" },
      ],
      lines: [11, 12],
      scene: search(2, 6, 7, { done: true, note: "match at index 2" }),
    },
    {
      short: "Cost",
      title: "Why it is O(n + m)",
      body: [
        "The text pointer `i` only moves forward, so it moves at most `n` times. The pattern pointer `j` rises by one per step and each fall-back lowers it, so it cannot fall more than it has risen: at most `n` falls in total.",
        "Building the table costs `O(m)` by the same argument. The total is `O(n + m)`, with `O(m)` extra memory for the table.",
      ],
      callout: {
        kind: "tip",
        text: "This amortised counting argument is the key idea; code is short once you see it.",
      },
      metrics: [
        { label: "Table value", value: "O(m) memory" },
        { label: "Text moves back", value: "never", level: "good" },
        { label: "Cost", value: "O(n + m)", level: "good" },
      ],
      lines: [4, 10],
      scene: scene(
        label("a", 320, 90, "build the table: O(m)", { size: 15, weight: 800 }),
        label("b", 320, 135, "scan the text: O(n)", { size: 15, weight: 800 }),
        label("c", 320, 190, "total O(n + m), never re-reading the text", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
