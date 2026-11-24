import { cell, edge, frame, graph, label, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";
import type { Item } from "../lib/types";

const NUMS = [3, 34, 4, 12, 5, 2];

/** The subset-sum instance: pick numbers that add to 9. Chosen indexes are marked. */
function numbers(chosen: number[] = [], tone: "mark" | "found" | "warn" = "mark") {
  return row(NUMS, {
    id: "n",
    y: 110,
    index: true,
    tones: (i) => (chosen.includes(i) ? tone : undefined),
  });
}

const NODES: Record<string, [number, number]> = {
  A: [180, 100],
  B: [320, 50],
  C: [320, 160],
  D: [460, 100],
  E: [460, 210],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "C"],
  ["B", "D"],
  ["C", "E"],
  ["D", "E"],
];

/** The 5-node graph with a letter (colour) on each node, or just the names when there is no colouring. */
function coloured(colours?: Record<string, string>): Item[] {
  return graph(NODES, EDGES, {
    tones: colours ? { A: "mark", B: "mark", C: "mark", D: "mark", E: "mark" } : undefined,
    edgeTones: colours
      ? Object.fromEntries(EDGES.map(([a, b]) => [`${a}-${b}`, "found" as const]))
      : undefined,
  }).map((it) =>
    it.t === "disc" && colours ? { ...it, text: colours[it.id.slice(1)], sub: it.id.slice(1) } : it,
  );
}

export const pVsNp: AlgoLesson = {
  id: "p-vs-np",
  title: "P vs NP",
  summary:
    "Why checking an answer can be easy while finding one is hard, and what that means for you.",
  minutes: 14,
  level: "advanced",
  goals: [
    "The difference between solving and checking",
    "The classes P and NP",
    "NP-complete problems and reductions",
    "Why P versus NP is still open, and what to do about hard problems",
  ],
  takeaways: [
    "P is the set of problems solvable in polynomial time; NP is the set whose proposed answers can be checked in polynomial time.",
    "An NP-complete problem is one that every NP problem reduces to, so a fast algorithm for any one would give a fast algorithm for all.",
    "Nobody has proved P ≠ NP, so in practice you recognise a hard problem and switch to approximations, heuristics or special cases.",
  ],
  hud: [
    { label: "Instance size", icon: "list" },
    { label: "Check cost", icon: "timer" },
    { label: "Search cost", icon: "hourglass" },
    { label: "Class", icon: "layers" },
  ],
  pseudocode: [
    "verify(nums, chosen, target):",
    "    total = 0",
    "    for i in chosen:",
    "        total = total + nums[i]",
    "    return total == target",
    "solve(nums, target):",
    "    for each subset of nums:    # 2^n subsets",
    "        if verify(nums, subset, target):",
    "            return subset",
    "    return none",
  ],
  steps: [
    {
      short: "A puzzle",
      title: "Subset sum: pick numbers that add to 9",
      body: [
        "Here are six numbers and a target of `9`. Can you choose some of them so that they add up exactly to `9`?",
        "Keep this tiny puzzle in mind. It shows a pattern that appears in thousands of problems: the question is easy to state and the work is not obvious.",
      ],
      metrics: [{ label: "Instance size", value: "n = 6" }],
      scene: scene(label("t", 320, 50, "target 9", { size: 15, weight: 800 }), numbers()),
    },
    {
      short: "Check",
      title: "Checking an answer is quick",
      body: [
        "Someone hands you the answer: the numbers at positions 2 and 4, which are `4` and `5`. You add them: `4 + 5 = 9`. Correct.",
        "Checking took one pass over the proposed items, so its cost grows in step with the input. The helper that made the claim is called a certificate.",
      ],
      callout: {
        kind: "insight",
        text: "Verifying a certificate is easy even when you have no idea how it was found.",
      },
      metrics: [
        { label: "Instance size", value: "n = 6" },
        { label: "Check cost", value: "O(n)", level: "good" },
      ],
      lines: [2, 3, 4, 5],
      scene: scene(
        label("t", 320, 50, "target 9", { size: 15, weight: 800 }),
        numbers([2, 4], "found"),
        label("sum", 320, 200, "4 + 5 = 9  ✓", { size: 15, weight: 800, tone: "good" }),
      ),
    },
    {
      short: "Search",
      title: "Finding one means trying many",
      body: [
        "Without the hint you must search. `{3, 34}` gives 37, `{3, 4}` gives 7, `{3, 12}` gives 15. Each try costs little, but there are `2^6 = 64` possible subsets.",
        "Every extra number doubles that count. At 40 numbers it is about a trillion subsets, and at 60 it is far more than any computer can try.",
      ],
      callout: {
        kind: "warn",
        text: "A cleverer search helps, but no known algorithm is guaranteed to avoid this blow-up in the worst case.",
      },
      metrics: [
        { label: "Instance size", value: "n = 6" },
        { label: "Check cost", value: "O(n)", level: "good" },
        { label: "Search cost", value: "2ⁿ = 64", level: "bad" },
      ],
      lines: [7, 8, 9, 10],
      scene: scene(
        label("t", 320, 50, "target 9", { size: 15, weight: 800 }),
        numbers([0, 1], "warn"),
        label("a", 320, 190, "{3, 34} = 37   ✗", { size: 14, tone: "warn" }),
        label("b", 320, 220, "n = 40  →  about 10¹² subsets", { size: 14, weight: 800 }),
        label("c", 320, 250, "n = 60  →  about 10¹⁸ subsets", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
    {
      short: "Class P",
      title: "P: problems that can be solved fast",
      body: [
        "P is the class of decision problems that some algorithm solves in polynomial time: the cost is at most `n^k` for some fixed `k`.",
        "Sorting, searching a sorted list, shortest paths and checking if a graph is connected all live here. 'Fast' means the cost does not explode as the input grows.",
      ],
      metrics: [
        { label: "Class", value: "P", level: "good" },
        { label: "Search cost", value: "poly(n)", level: "good" },
      ],
      scene: scene(
        frame("p", 160, 50, 320, 190, "P: solvable in polynomial time", { tone: "found" }),
        label("e1", 320, 110, "sorting", { size: 14 }),
        label("e2", 320, 150, "shortest path", { size: 14 }),
        label("e3", 320, 190, "is the graph connected?", { size: 14 }),
      ),
    },
    {
      short: "Class NP",
      title: "NP: problems whose answers can be checked fast",
      body: [
        "NP (nondeterministic polynomial time) is the class of problems where a proposed answer can be verified in polynomial time. Subset sum is in NP, because adding up a given subset is quick.",
        "Everything in P is also in NP: if you can solve a problem fast, you can check an answer by solving it again. The open question is whether NP contains more than that.",
      ],
      callout: {
        kind: "tip",
        text: "NP does not mean 'not polynomial'. It means 'checkable in polynomial time'.",
      },
      metrics: [
        { label: "Class", value: "P ⊆ NP" },
        { label: "Check cost", value: "poly(n)", level: "good" },
      ],
      scene: scene(
        frame("np", 60, 40, 520, 220, "NP: answers checkable in polynomial time", { tone: "mark" }),
        frame("p", 90, 90, 190, 140, "P", { tone: "found" }),
        label("s1", 185, 160, "sorting", { size: 13 }),
        label("s2", 440, 150, "subset sum", { size: 14 }),
        label("s3", 440, 190, "graph colouring", { size: 14 }),
      ),
    },
    {
      short: "Colouring",
      title: "Another example: three-colouring a graph",
      body: [
        "Colour each node red, green or blue so that no edge joins two nodes of the same colour. Given `A=R, B=G, C=B, D=R, E=G`, you check each of the 6 edges: all differ.",
        "Checking is one pass over the edges. Finding a colouring from scratch means exploring up to `3^n` assignments, which is the same story again.",
      ],
      metrics: [
        { label: "Instance size", value: "5 nodes" },
        { label: "Check cost", value: "O(edges)", level: "good" },
        { label: "Search cost", value: "3ⁿ", level: "bad" },
      ],
      scene: scene(coloured({ A: "R", B: "G", C: "B", D: "R", E: "G" })),
    },
    {
      short: "Reductions",
      title: "NP-complete: the hardest in NP",
      body: [
        "A problem A reduces to B if a fast transformation turns any instance of A into an instance of B with the same answer. Then a fast solver for B gives a fast solver for A.",
        "An NP-complete problem is in NP and every NP problem reduces to it. Satisfiability was the first, and chains of reductions reach subset sum, clique and colouring.",
      ],
      callout: {
        kind: "insight",
        text: "If you find a fast algorithm for any one NP-complete problem, you have one for all of NP.",
      },
      metrics: [{ label: "Class", value: "NP-complete", level: "warn" }],
      scene: scene(
        cell("sat", 320, 50, "3-SAT", { w: 100, tone: "mark" }),
        cell("ss", 160, 190, "Subset sum", { w: 110 }),
        cell("cl", 320, 190, "Clique", { w: 100 }),
        cell("col", 480, 190, "3-colouring", { w: 110 }),
        edge("e1", "sat", "ss", { arrow: "end", label: "reduces" }),
        edge("e2", "sat", "cl", { arrow: "end" }),
        edge("e3", "sat", "col", { arrow: "end" }),
      ),
    },
    {
      short: "Still open",
      title: "Why nobody has settled it",
      body: [
        "Two worlds are possible. If P ≠ NP, hard problems truly exist and the picture on the left is right. If P = NP, every checkable problem would also be solvable fast.",
        "Decades of effort have produced no fast algorithm for any NP-complete problem, and no proof that none can exist. Known proof techniques are provably too weak, and the question carries a million-dollar prize.",
      ],
      callout: {
        kind: "warn",
        text: "Most experts believe P ≠ NP, but belief is not proof. Do not build anything that needs the answer.",
      },
      metrics: [{ label: "Class", value: "open", level: "warn" }],
      scene: scene(
        frame("l", 30, 50, 280, 200, "if P ≠ NP", { tone: "mark" }),
        frame("lp", 60, 100, 120, 120, "P", { tone: "found" }),
        label("lc", 245, 170, "NP-complete", { size: 13, tone: "warn" }),
        frame("r", 330, 50, 280, 200, "if P = NP", { tone: "found" }),
        label("rt", 470, 160, "P = NP", { size: 18, weight: 800 }),
      ),
    },
    {
      short: "In practice",
      title: "What to do with a hard problem",
      body: [
        "Recognise it first, usually by reducing a known NP-complete problem to yours. Then pick a strategy. Approximation settles for an answer provably near the best, such as a vertex cover at most twice the minimum.",
        "Heuristics (greedy, local search) give good answers without a guarantee. Special cases can be easy: two-colouring is fast, and subset sum with a small target is solved by dynamic programming in `O(n × target)`.",
      ],
      callout: {
        kind: "tip",
        text: "'It is NP-complete' is a reason to change the question, not a reason to stop.",
      },
      metrics: [
        { label: "Class", value: "NP-complete", level: "warn" },
        { label: "Search cost", value: "avoid 2ⁿ", level: "good" },
      ],
      scene: scene(
        cell("a", 120, 120, "Approximate", { w: 130, tone: "found" }),
        cell("h", 320, 120, "Heuristic", { w: 130, tone: "active" }),
        cell("s", 520, 120, "Special case", { w: 130, tone: "mark" }),
        label("a1", 120, 175, "bounded error", { size: 12, tone: "muted" }),
        label("h1", 320, 175, "no guarantee", { size: 12, tone: "muted" }),
        label("s1", 520, 175, "e.g. small target", { size: 12, tone: "muted" }),
        label("t", 320, 60, "three ways around the wall", { size: 14, weight: 800 }),
      ),
    },
  ],
};
