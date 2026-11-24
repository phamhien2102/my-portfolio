import { label, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

const TEXT = "ABABABABC".split("");
const PAT = "ABABC".split("");

/**
 * The pattern laid under the text at `shift`. `k` characters matched; `miss` marks the character
 * after them as the mismatch; `done` paints every match green.
 */
function view(
  shift: number,
  k: number,
  o: { miss?: boolean; done?: boolean; text?: string[]; pat?: string[]; note?: string } = {},
) {
  const text = o.text ?? TEXT;
  const pat = o.pat ?? PAT;
  const hit = o.done ? "found" : "done";
  return scene(
    row(text, {
      y: 100,
      index: true,
      tones: (i) =>
        i >= shift && i < shift + k
          ? hit
          : o.miss && i === shift + k
            ? "warn"
            : i >= shift && i < shift + pat.length
              ? "active"
              : undefined,
    }),
    row(pat, {
      id: "p",
      x: 80 + 60 * shift + ((pat.length - 1) * 60) / 2,
      y: 190,
      tones: (j) => (j < k ? hit : o.miss && j === k ? "warn" : undefined),
    }),
    label("shift", 320, 250, o.note ?? `shift = ${shift}`, { size: 13, weight: 800 }),
  );
}

export const patternMatching: AlgoLesson = {
  id: "pattern-matching",
  title: "Pattern Matching",
  summary:
    "The naive way to find a pattern in a text: try every starting spot and compare letter by letter.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "What substring search asks for",
    "How the naive method slides a window along the text",
    "Why a mismatch only moves the pattern by one",
    "The O(n·m) worst case and what it wastes",
  ],
  takeaways: [
    "Naive search tries every alignment of the pattern and stops each attempt at its first mismatch.",
    "Its worst case is O(n·m), reached when long partial matches keep failing at the last character.",
    "It forgets everything it learned about the text after each shift, and that is the waste better algorithms remove.",
  ],
  hud: [
    { label: "Shift", icon: "search" },
    { label: "Comparisons", icon: "swap" },
    { label: "Worst case", icon: "timer" },
  ],
  pseudocode: [
    "search(text, pat):",
    "    for shift in 0 .. n - m:",
    "        k = 0",
    "        while k < m and text[shift + k] == pat[k]:",
    "            k = k + 1",
    "        if k == m:",
    "            return shift",
    "    return -1",
  ],
  steps: [
    {
      short: "Problem",
      title: "Find a word inside a text",
      body: [
        "We have a text of `n = 9` characters and a pattern of `m = 5` characters, `ABABC`. Where does the pattern first occur in the text, if at all?",
        "The simplest plan: place the pattern at the start of the text, check it, and if it fails, slide it one step to the right.",
      ],
      metrics: [{ label: "Shift", value: "0" }],
      scene: view(0, 0, { note: "text n = 9, pattern m = 5" }),
    },
    {
      short: "Compare",
      title: "Match letter by letter",
      body: [
        "At shift `0` we compare text and pattern from the left: `A=A`, `B=B`, `A=A`, `B=B`. Four matches in a row.",
        "Each green pair cost one comparison, so we are at four so far.",
      ],
      metrics: [
        { label: "Shift", value: "0" },
        { label: "Comparisons", value: "4" },
      ],
      lines: [3, 4, 5],
      scene: view(0, 4, { note: "4 characters match" }),
    },
    {
      short: "Mismatch",
      title: "The fifth letter fails",
      body: [
        "The text has `A` where the pattern wants `C`. One mismatch is enough to rule this alignment out, so we stop comparing and give up on shift `0`.",
        "That attempt cost 5 comparisons in total.",
      ],
      metrics: [
        { label: "Shift", value: "0" },
        { label: "Comparisons", value: "5", level: "warn" },
      ],
      lines: [4, 6],
      scene: view(0, 4, { miss: true, note: "A ≠ C: shift 0 fails" }),
    },
    {
      short: "Slide",
      title: "Slide by exactly one",
      body: [
        "We do not know where a match might start, so the safe move is one position to the right. At shift `1` the pattern's `A` meets the text's `B`: a mismatch on the very first comparison.",
        "That attempt was cheap, a single comparison.",
      ],
      callout: {
        kind: "insight",
        text: "A mismatch costs less the earlier it happens. A failure at the first letter is nearly free.",
      },
      metrics: [
        { label: "Shift", value: "1" },
        { label: "Comparisons", value: "6" },
      ],
      lines: [2, 3],
      scene: view(1, 0, { miss: true, note: "B ≠ A: shift 1 fails at once" }),
    },
    {
      short: "Again",
      title: "Shift 2 repeats the work",
      body: [
        "At shift `2` we match `A B A B` again and fail on `A` vs `C`. These are the same four text characters we already compared a moment ago, just lined up differently.",
        "Total so far: 11 comparisons.",
      ],
      callout: {
        kind: "warn",
        text: "The algorithm learned that these letters are `ABAB` and then threw that knowledge away.",
      },
      metrics: [
        { label: "Shift", value: "2" },
        { label: "Comparisons", value: "11", level: "warn" },
      ],
      lines: [2, 3, 4, 5],
      scene: view(2, 4, { miss: true, note: "A ≠ C: shift 2 fails" }),
    },
    {
      short: "Shift 3",
      title: "Shift 3 fails immediately",
      body: [
        "The text has `B` where the pattern starts with `A`, a one-comparison failure. We are at 12 comparisons and still have one alignment to try.",
      ],
      metrics: [
        { label: "Shift", value: "3" },
        { label: "Comparisons", value: "12" },
      ],
      lines: [2, 3, 4],
      scene: view(3, 0, { miss: true, note: "B ≠ A: shift 3 fails" }),
    },
    {
      short: "Found",
      title: "Shift 4 matches",
      body: [
        "All five letters agree at shift `4`, so the pattern occurs at index `4`. The search used 17 comparisons for a 9-letter text.",
        "The last possible shift is `n - m = 4`; there is no point trying a window that would run off the end.",
      ],
      metrics: [
        { label: "Shift", value: "4", level: "good" },
        { label: "Comparisons", value: "17" },
      ],
      lines: [6, 7],
      scene: view(4, 5, { done: true, note: "match at index 4" }),
    },
    {
      short: "Worst case",
      title: "When it goes badly",
      body: [
        "Try the text `AAAAAAAAA` and the pattern `AAAB`. Every shift matches three letters and then fails on `B`, so every shift costs 4 comparisons.",
        "There are `n - m + 1 = 6` shifts, so 24 comparisons in total: roughly `n · m`, written `O(n·m)`. For a text of a million characters and a pattern of a thousand that is about a billion steps.",
      ],
      callout: {
        kind: "warn",
        text: "Repetitive text, like DNA or logs, makes this worst case realistic.",
      },
      metrics: [
        { label: "Shift", value: "0" },
        { label: "Comparisons", value: "4", level: "warn" },
        { label: "Worst case", value: "O(n·m)", level: "bad" },
      ],
      lines: [2, 4, 5],
      scene: view(0, 3, {
        miss: true,
        text: "AAAAAAAAA".split(""),
        pat: "AAAB".split(""),
        note: "6 shifts × 4 comparisons = 24",
      }),
    },
    {
      short: "Why better",
      title: "We can do better",
      body: [
        "The waste is clear: after a failure at shift `s` we already know what the text looks like there, yet we restart the comparison from scratch at `s + 1`.",
        "The next lesson, KMP, studies the pattern ahead of time so the text pointer never moves backward and the cost drops to `O(n + m)`.",
      ],
      metrics: [
        { label: "Comparisons", value: "O(n·m)", level: "bad" },
        { label: "Worst case", value: "O(n + m) goal", level: "good" },
      ],
      scene: scene(
        label("a", 320, 100, "naive: slide by 1, forget everything", {
          size: 15,
          weight: 800,
          tone: "warn",
        }),
        label("b", 320, 150, "better: slide by what the pattern itself tells us", {
          size: 15,
          weight: 800,
          tone: "good",
        }),
        label("c", 320, 205, "O(n·m)  →  O(n + m)", { size: 13, tone: "muted" }),
      ),
    },
  ],
};
