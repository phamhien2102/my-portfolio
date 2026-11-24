import { label, ptr, row, scene, stack } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";

type Tone = "active" | "warn" | "found";

/** The string as cells (processed ones settled), a pointer on the current character, the stack beside it. */
function view(
  text: string,
  i: number,
  stk: string[],
  o: { tone?: Tone; msg?: string; msgTone?: "good" | "warn" | "ink" } = {},
) {
  const chars = text.split("");
  const tone = o.tone ?? "active";
  return scene(
    row(chars, {
      x: 200,
      y: 130,
      index: true,
      tones: (j) => (j < i ? "done" : j === i ? tone : undefined),
    }),
    i >= 0 && i < chars.length && ptr("i", `a${i}`, "i", { side: "above", tone }),
    stack(stk, {
      x: 520,
      y: 250,
      w: 70,
      keys: stk.map((s, k) => `${k}${s}`),
      tones: (k) => (k === stk.length - 1 ? tone : undefined),
    }),
    label("stk", 520, 270, "stack", { tone: "muted", size: 12 }),
    stk.length === 0 && label("none", 520, 225, "empty", { tone: "muted", size: 13 }),
    o.msg && label("msg", 320, 40, o.msg, { size: 14, weight: 800, tone: o.msgTone ?? "ink" }),
  );
}

export const balancedBrackets: AlgoLesson = {
  id: "balanced-brackets",
  title: "Balanced Brackets",
  summary:
    "Check that every (, [ and { is closed in the right order by keeping a stack of open ones.",
  minutes: 10,
  level: "beginner",
  goals: [
    "What makes a bracket string balanced",
    "Why the most recent opener must be the first to close",
    "The three ways a string can fail",
    "The O(n) time and O(n) space cost",
  ],
  takeaways: [
    "Push every opener and, at each closer, pop and compare: the innermost open bracket must be the one that closes.",
    "A string is balanced only if no pop fails, no closer meets an empty stack, and the stack is empty at the end.",
    "One pass with a stack costs O(n) time and, in the worst case, O(n) space.",
  ],
  hud: [
    { label: "Position", icon: "search" },
    { label: "Stack depth", icon: "layers" },
    { label: "Verdict", icon: "check" },
  ],
  pseudocode: [
    "isBalanced(s):",
    "    stack = empty",
    "    for ch in s:",
    "        if ch is an opener: push(ch)",
    "        else:",
    "            if stack is empty: return false",
    "            if pop() does not pair with ch: return false",
    "    return stack is empty",
  ],
  steps: [
    {
      short: "The problem",
      title: "Is every bracket closed correctly?",
      body: [
        "Given a string made of `()`, `[]` and `{}`, decide whether each opener has a matching closer of the same kind, closed in the right order.",
        "`{[()]}` is fine. `([)]` is not: the `[` is still open when the `)` tries to close the `(` inside it.",
      ],
      callout: {
        kind: "insight",
        text: "Counting brackets is not enough. `([)]` has two of each kind and still fails, because order matters.",
      },
      metrics: [
        { label: "Position", value: "0 of 6" },
        { label: "Stack depth", value: "0", level: "good" },
        { label: "Verdict", value: "?" },
      ],
      scene: view("{[()]}", -1, [], { msg: "is {[()]} balanced?" }),
    },
    {
      short: "Openers",
      title: "An opener waits on the stack",
      body: [
        "Scan left to right. `{` is an opener, so we cannot judge it yet: its closer lies somewhere ahead. Push it onto the stack.",
        "The stack is our list of brackets that are still waiting to be closed, newest on top.",
      ],
      metrics: [
        { label: "Position", value: "1 of 6" },
        { label: "Stack depth", value: "1", level: "good" },
        { label: "Verdict", value: "?" },
      ],
      lines: [3, 4],
      scene: view("{[()]}", 0, ["{"], { msg: "opener: push" }),
    },
    {
      short: "Nesting",
      title: "Nested openers pile up",
      body: [
        "`[` and then `(` are openers too, so both are pushed. The stack now reads `{`, `[`, `(` from bottom to top.",
        "The top is the innermost bracket, the one that has to be closed first.",
      ],
      metrics: [
        { label: "Position", value: "3 of 6" },
        { label: "Stack depth", value: "3", level: "warn" },
        { label: "Verdict", value: "?" },
      ],
      lines: [3, 4],
      scene: view("{[()]}", 2, ["{", "[", "("], { msg: "push [ then (" }),
    },
    {
      short: "A closer",
      title: "A closer must match the top",
      body: [
        "`)` is a closer. Pop the stack and compare: the top is `(`, which pairs with `)`, so this pair is fine and `(` is gone.",
        "Now `[` is on top, ready to be matched next.",
      ],
      callout: {
        kind: "tip",
        text: "Store the openers, then look up the expected closer when you pop: `(` expects `)`, `[` expects `]`, `{` expects `}`.",
      },
      metrics: [
        { label: "Position", value: "4 of 6" },
        { label: "Stack depth", value: "2", level: "good" },
        { label: "Verdict", value: "?" },
      ],
      lines: [5, 6, 7],
      scene: view("{[()]}", 3, ["{", "["], { tone: "found", msg: "( matches ): pop" }),
    },
    {
      short: "All matched",
      title: "The stack ends empty",
      body: [
        "`]` pops `[` and `}` pops `{`, both correct. We have read the whole string.",
        "The stack is empty, so nothing was left open and nothing was closed too early: the string is balanced.",
      ],
      metrics: [
        { label: "Position", value: "6 of 6" },
        { label: "Stack depth", value: "0", level: "good" },
        { label: "Verdict", value: "balanced", level: "good" },
      ],
      lines: [8],
      scene: view("{[()]}", 6, [], { tone: "found", msg: "balanced", msgTone: "good" }),
    },
    {
      short: "Wrong kind",
      title: "Failure 1: the wrong kind",
      body: [
        "In `([)]` the stack holds `(` and `[` when `)` arrives. The top is `[`, but `)` needs `(`.",
        "The kinds do not match, so we stop at once and answer false. Nothing after this character can repair it.",
      ],
      callout: {
        kind: "warn",
        text: "Comparing only the count of openers and closers would wrongly accept this string.",
      },
      metrics: [
        { label: "Position", value: "3 of 4" },
        { label: "Stack depth", value: "2", level: "warn" },
        { label: "Verdict", value: "false", level: "bad" },
      ],
      lines: [7],
      scene: view("([)]", 2, ["(", "["], {
        tone: "warn",
        msg: "top is [ but ) needs (",
        msgTone: "warn",
      }),
    },
    {
      short: "Extra closer",
      title: "Failure 2: a closer with nothing open",
      body: [
        "In `())` the first `)` pops the `(` correctly. The second `)` finds the stack empty: there is no opener for it to close.",
        "Popping an empty stack is the signal. Check for emptiness before every pop.",
      ],
      metrics: [
        { label: "Position", value: "3 of 3" },
        { label: "Stack depth", value: "0", level: "warn" },
        { label: "Verdict", value: "false", level: "bad" },
      ],
      lines: [6],
      scene: view("())", 2, [], {
        tone: "warn",
        msg: "closer, but the stack is empty",
        msgTone: "warn",
      }),
    },
    {
      short: "Leftover",
      title: "Failure 3: openers never closed",
      body: [
        "In `(()` every closer matches, yet when the string ends one `(` is still on the stack.",
        "So the last check is not optional: after the scan, the string is balanced only if the stack is empty.",
      ],
      callout: {
        kind: "tip",
        text: "An odd length can be rejected immediately, since brackets come in pairs.",
      },
      metrics: [
        { label: "Position", value: "3 of 3" },
        { label: "Stack depth", value: "1", level: "warn" },
        { label: "Verdict", value: "false", level: "bad" },
      ],
      lines: [8],
      scene: view("(()", 3, ["("], {
        tone: "warn",
        msg: "end of string, but ( is still open",
        msgTone: "warn",
      }),
    },
    {
      short: "Cost",
      title: "One pass, one stack",
      body: [
        "Each character is read once, and each push or pop is constant time, so the whole check is `O(n)`.",
        "The stack can hold up to `n` openers, as in `((((`, so the extra space is `O(n)` in the worst case.",
      ],
      metrics: [
        { label: "Position", value: "n of n" },
        { label: "Stack depth", value: "≤ n", level: "warn" },
        { label: "Verdict", value: "O(n)", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 90, "opener: push", { size: 15, weight: 800 }),
        label("r2", 320, 130, "closer: stack empty or wrong top → false", {
          size: 15,
          weight: 800,
        }),
        label("r3", 320, 170, "end: stack empty → true, else false", { size: 15, weight: 800 }),
        label("r4", 320, 230, "O(n) time, O(n) space", { size: 14, tone: "good", weight: 800 }),
      ),
    },
  ],
};
