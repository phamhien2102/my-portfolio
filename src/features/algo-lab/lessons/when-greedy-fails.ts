import { disc, edge, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

// Coins {1, 3, 4}, amount 6.
const BEST = [0, 1, 2, 1, 1, 2, 2]; // fewest coins for amounts 0..6

/** The coin set, a row of chosen coins, and the amount still to pay. */
function pay(
  chosen: number[],
  note: string,
  tone: Tone = "found",
  opts: { hideSet?: boolean } = {},
) {
  const left = 6 - chosen.reduce((a, b) => a + b, 0);
  return scene(
    label("amt", 320, 40, "pay 6 using coins 1, 3, 4", { size: 15, weight: 800 }),
    !opts.hideSet &&
      label("setl", 320, 85, "coins available (any number of each)", { size: 11, tone: "muted" }),
    !opts.hideSet &&
      row([1, 3, 4], {
        y: 120,
        w: 44,
        gap: 10,
        id: "c",
        tones: { 0: "mark", 1: "mark", 2: "mark" },
      }),
    label("pl", 320, 185, "chosen so far", { size: 11, tone: "muted" }),
    chosen.length
      ? row(chosen, {
          y: 220,
          w: 44,
          gap: 10,
          id: "p",
          keys: chosen.map((c, i) => `${c}-${i}`),
          tones: () => tone,
        })
      : label("none", 320, 220, "nothing yet", { size: 13, tone: "muted" }),
    label("left", 320, 275, `${left} left   |   ${chosen.length} coins used`, {
      size: 13,
      weight: 800,
    }),
    label("note", 320, 305, note, { size: 12, tone: "muted" }),
  );
}

export const whenGreedyFails: AlgoLesson = {
  id: "when-greedy-fails",
  title: "When Greedy Fails",
  summary:
    "A locally best choice is not always globally best: coin change shows how to spot the trap.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "How a greedy rule can return a wrong answer",
    "What the greedy-choice property says",
    "What optimal substructure means",
    "How to test a greedy idea before trusting it",
    "Why this problem points toward dynamic programming",
  ],
  takeaways: [
    "Greedy is correct only when some best answer always contains the greedy choice, so test small counterexamples first.",
    "Optimal substructure means the rest of a best solution is itself a best solution of a smaller problem.",
    "When greedy fails but the substructure holds, try every choice and remember smaller answers: that is dynamic programming.",
  ],
  hud: [
    { label: "Coins used", icon: "database" },
    { label: "Amount left", icon: "sigma" },
    { label: "Best known", icon: "check" },
  ],
  pseudocode: [
    "greedy(coins, amount):",
    "    count = 0",
    "    while amount > 0:",
    "        c = largest coin that is <= amount",
    "        amount = amount - c",
    "        count = count + 1",
    "    return count",
    "best(amount):",
    "    if amount == 0: return 0",
    "    return 1 + min(best(amount - c) for each coin c <= amount)",
  ],
  steps: [
    {
      short: "The problem",
      title: "Make 6 with the fewest coins",
      body: [
        "You have coins worth `1`, `3` and `4`, as many of each as you like, and you must pay exactly `6` using as few coins as possible.",
        "A natural plan: always grab the biggest coin that still fits. That is a greedy rule, and for many currencies it works. Let us watch it here.",
      ],
      metrics: [
        { label: "Coins used", value: "0" },
        { label: "Amount left", value: "6", level: "warn" },
      ],
      scene: pay([], "goal: reach exactly 6 with the fewest coins", "found"),
    },
    {
      short: "Take the 4",
      title: "Greedy grabs the biggest coin",
      body: ["The biggest coin that fits into 6 is `4`. Take it. That leaves `2` to pay."],
      metrics: [
        { label: "Coins used", value: "1" },
        { label: "Amount left", value: "2", level: "warn" },
      ],
      lines: [3, 4, 5, 6],
      scene: pay([4], "4 is the largest coin that fits"),
    },
    {
      short: "Then 1 and 1",
      title: "Only 1s fit now",
      body: [
        "With `2` left, neither `4` nor `3` fits, so greedy takes `1` and then another `1`.",
        "Total: `4 + 1 + 1`, three coins. The sum is right, but is three really the fewest?",
      ],
      metrics: [
        { label: "Coins used", value: "3", level: "warn" },
        { label: "Amount left", value: "0", level: "good" },
        { label: "Best known", value: "3", level: "warn" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: pay([4, 1, 1], "greedy answer: 3 coins", "active"),
    },
    {
      short: "Better way",
      title: "Two 3s beat it",
      body: [
        "Skip the `4` entirely: `3 + 3` is also 6, and it takes only two coins.",
        "Greedy never considered it, because at the very first step it looked at the biggest coin and never came back.",
      ],
      chapter: { label: "Counterexample", tone: "red" },
      metrics: [
        { label: "Coins used", value: "2", level: "good" },
        { label: "Amount left", value: "0", level: "good" },
        { label: "Best known", value: "2", level: "good" },
      ],
      scene: pay([3, 3], "optimal answer: 2 coins", "found"),
    },
    {
      short: "Why it fails",
      title: "The greedy choice was a mistake",
      body: [
        "Every best answer to 6 avoids the `4`. Once a `4` is taken, the best you can finish with is `4 + 1 + 1`, three coins.",
        "A greedy rule is only correct if some best answer always contains the greedy choice. This is the greedy-choice property, and here it does not hold.",
      ],
      callout: {
        kind: "warn",
        text: "A rule that is optimal on a few examples can still fail. One counterexample is enough to disprove it.",
      },
      metrics: [
        { label: "Coins used", value: "3" },
        { label: "Best known", value: "2", level: "good" },
      ],
      lines: [4],
      scene: scene(
        label("w1", 320, 80, "best answer that uses a 4:  4 + 1 + 1", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        label("w2", 320, 115, "= 3 coins", { size: 13, tone: "warn" }),
        label("w3", 320, 175, "best answer with no 4:  3 + 3", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("w4", 320, 210, "= 2 coins", { size: 13, tone: "good" }),
      ),
    },
    {
      short: "It can work",
      title: "The same rule is fine for 1, 5, 10, 25",
      body: [
        "For coins `1, 5, 10, 25` greedy is always optimal: paying 41 takes `25 + 10 + 5 + 1`, four coins, and no shorter set exists.",
        "The coins are chosen so that each is a multiple-friendly step above the last. That structure is what makes the greedy-choice property true there.",
      ],
      metrics: [
        { label: "Coins used", value: "4" },
        { label: "Best known", value: "4", level: "good" },
      ],
      scene: scene(
        label("g1", 320, 60, "pay 41 with coins 1, 5, 10, 25", { size: 14, weight: 800 }),
        row([25, 10, 5, 1], { y: 150, w: 52, gap: 10, tones: () => "found" }),
        label("g2", 320, 220, "greedy picks 25, 10, 5, 1: optimal", {
          size: 13,
          tone: "good",
          weight: 800,
        }),
      ),
    },
    {
      short: "Substructure",
      title: "What does hold: optimal substructure",
      body: [
        "After paying one coin `c`, what is left is the same problem with a smaller amount. A best answer for 6 is one coin plus a best answer for what remains.",
        "So `best(6) = 1 + min(best(5), best(3), best(2))`: try every coin as the first one and keep the cheapest.",
      ],
      callout: {
        kind: "insight",
        text: "Greedy commits to one first coin. A safer plan tries all of them and reuses answers to the smaller amounts.",
      },
      metrics: [{ label: "Best known", value: "2", level: "good" }],
      lines: [8, 9, 10],
      scene: scene(
        edge("t1", "r6", "r5", { arrow: "end", label: "1" }),
        edge("t2", "r6", "r3", { arrow: "end", label: "3" }),
        edge("t3", "r6", "r2", { arrow: "end", label: "4" }),
        disc("r6", 320, 60, "6", { r: 22, tone: "active" }),
        disc("r5", 180, 160, "5", { r: 22, sub: "best 2" }),
        disc("r3", 320, 160, "3", { r: 22, sub: "best 1", tone: "found" }),
        disc("r2", 460, 160, "2", { r: 22, sub: "best 2" }),
        label("tn", 320, 250, "best(6) = 1 + min(2, 1, 2) = 2", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Table",
      title: "Fill answers for small amounts first",
      body: [
        "Compute `best(0), best(1), ...` up to 6, each from the earlier ones. Row below: amount on top, fewest coins in the cell.",
        "`best(6) = 2` comes from the `3` branch. The table tries every first coin and so cannot be fooled. This is dynamic programming.",
      ],
      metrics: [
        { label: "Best known", value: "2", level: "good" },
        { label: "Amount left", value: "0", level: "good" },
      ],
      lines: [9, 10],
      scene: scene(
        label("hd", 320, 80, "amount 0..6  ->  fewest coins", { size: 13, weight: 800 }),
        row(BEST, { y: 140, index: true, tones: (i) => (i === 6 ? "found" : "done") }),
        label("tb", 320, 215, "best(6) = 1 + best(3) = 2", { size: 14, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "How to tell",
      title: "Test before you trust a greedy rule",
      body: [
        "Try the rule on tiny inputs and compare with brute force. Look for a case where taking the locally best item blocks a better combination.",
        "If you cannot find a counterexample, argue it: show that any best answer can swap in the greedy choice without getting worse (an exchange argument), then that what is left is a smaller version of the same problem.",
      ],
      chapter: { label: "Recap", tone: "ink" },
      metrics: [{ label: "Best known", value: "2", level: "good" }],
      scene: scene(
        label("h1", 320, 70, "1. greedy-choice property", { size: 14, weight: 800 }),
        label("h2", 320, 98, "some best answer contains the greedy pick", {
          size: 12,
          tone: "muted",
        }),
        label("h3", 320, 150, "2. optimal substructure", { size: 14, weight: 800 }),
        label("h4", 320, 178, "the rest is a best answer to a smaller problem", {
          size: 12,
          tone: "muted",
        }),
        label("h5", 320, 230, "both hold: greedy.  only the second: dynamic programming", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
      ),
    },
  ],
};
