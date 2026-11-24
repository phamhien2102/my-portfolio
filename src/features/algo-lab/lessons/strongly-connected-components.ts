import { graph, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Item, Tone } from "../lib/types";

const NODES: Record<string, [number, number]> = {
  A: [70, 90],
  B: [210, 90],
  C: [140, 210],
  D: [350, 90],
  E: [490, 90],
  F: [420, 210],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["B", "C"],
  ["C", "A"],
  ["B", "D"],
  ["D", "E"],
  ["E", "F"],
  ["F", "D"],
];
const REV: [string, string][] = EDGES.map(([a, b]) => [b, a]);

interface View {
  rev?: boolean;
  tones?: Record<string, Tone>;
  edgeTones?: Record<string, EdgeTone>;
  subs?: Record<string, string>;
  finish?: string[];
  finishTones?: Record<string, Tone>;
  note: string;
}

/** The graph (or its reverse), the finish-order strip underneath, and a one-line note on top. */
function view(v: View) {
  const items: Item[] = graph(NODES, v.rev ? REV : EDGES, {
    directed: true,
    tones: v.tones,
    edgeTones: v.edgeTones,
  }).map((it) =>
    it.t === "disc" && v.subs?.[it.id.slice(1)] ? { ...it, sub: v.subs[it.id.slice(1)] } : it,
  );
  const fin = v.finish ?? [];
  return scene(
    label("note", 280, 28, v.note, { size: 13, weight: 800 }),
    items,
    fin.length > 0 &&
      label("fl", 90, 285, "finish order", { size: 11, tone: "muted", anchor: "end" }),
    row(fin, {
      id: "o",
      x: 290,
      y: 285,
      w: 44,
      h: 40,
      tones: (i) => v.finishTones?.[fin[i]] ?? "done",
    }),
  );
}

const ALL_FINISH = ["C", "F", "E", "D", "B", "A"];
const NUMS = { C: "1", F: "2", E: "3", D: "4", B: "5", A: "6" };

export const stronglyConnectedComponents: AlgoLesson = {
  id: "strongly-connected-components",
  title: "Strongly Connected Components",
  summary:
    "Split a directed graph into groups whose nodes can all reach each other, using two DFS passes.",
  minutes: 14,
  level: "advanced",
  goals: [
    "What a strongly connected component is",
    "Why DFS finish order is the key to Kosaraju's algorithm",
    "Why reversing every edge keeps components but traps the search",
    "How to colour each component in linear time",
  ],
  takeaways: [
    "A strongly connected component is a largest group of nodes in which every node can reach every other.",
    "Kosaraju runs DFS to record finish order, reverses all edges, then runs DFS again starting from the latest finisher.",
    "Both passes are plain DFS, so the whole algorithm costs O(V + E) time.",
  ],
  hud: [
    { label: "Pass", icon: "layers" },
    { label: "Components", icon: "branch" },
    { label: "Nodes placed", icon: "check" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "kosaraju(graph):",
    "    order = []",
    "    for each unvisited v: dfs(v), push v to order when done",
    "    reverse every edge of the graph",
    "    clear all visited marks",
    "    for v in order, from last to first:",
    "        if v is unvisited:",
    "            start a new component",
    "            dfs(v) on reversed graph, label every node reached",
    "    return the component labels",
  ],
  steps: [
    {
      short: "The goal",
      title: "Who can reach whom?",
      body: [
        "In a directed graph an edge only goes one way. Two nodes are in the same strongly connected component when each can reach the other by following arrows.",
        "Look at `A`, `B`, `C`: you can loop around them forever. `D`, `E`, `F` form a second loop. You can leave the first loop for the second, but never come back.",
      ],
      callout: {
        kind: "insight",
        text: "Collapse each component to one node and what is left has no cycles: components are the cycles of a graph.",
      },
      metrics: [
        { label: "Pass", value: "—" },
        { label: "Components", value: "?" },
        { label: "Nodes placed", value: "0 / 6" },
      ],
      scene: view({ note: "two loops joined by a one-way bridge B → D" }),
    },
    {
      short: "DFS from A",
      title: "Pass 1: run DFS and watch for finishing",
      body: [
        "Start a normal depth-first search at `A`. It goes `A → B → C`. From `C` the only edge points back to `A`, which is already visited, so `C` is the first node to finish.",
        "A node finishes when all of its outgoing edges have been explored. We will write the nodes down in that order.",
      ],
      metrics: [
        { label: "Pass", value: "1 (DFS)" },
        { label: "Components", value: "?" },
        { label: "Nodes placed", value: "0 / 6" },
      ],
      lines: [3],
      scene: view({
        note: "DFS: A → B → C, stuck at C",
        tones: { A: "mark", B: "mark", C: "active" },
      }),
    },
    {
      short: "Back up",
      title: "Backtrack and explore the rest",
      body: [
        "`C` finishes first. Back at `B` there is another edge, `B → D`, so the search continues `D → E → F`. `F` points to `D`, already visited, so `F` finishes second.",
        "Notice the pattern: the node that finishes first sits at the very end of the graph, in a part nothing else escapes to.",
      ],
      metrics: [
        { label: "Pass", value: "1 (DFS)" },
        { label: "Nodes placed", value: "1 / 6" },
      ],
      lines: [3],
      scene: view({
        note: "DFS continues B → D → E → F",
        tones: { A: "mark", B: "mark", C: "done", D: "mark", E: "mark", F: "active" },
        finish: ["C"],
        subs: { C: "1" },
      }),
    },
    {
      short: "Finish order",
      title: "The finish order",
      body: [
        "Unwinding the recursion finishes `F`, `E`, `D`, then `B`, then `A`. The strip below is the finish order: `C F E D B A`.",
        "The key fact: the node that finishes last, `A`, lies in a component that has an edge into the later ones but receives none from them. Its component is a source in the condensed graph.",
      ],
      callout: {
        kind: "tip",
        text: "Keep the order in a list and read it from the end: the last finisher always belongs to a source component.",
      },
      metrics: [
        { label: "Pass", value: "1 done" },
        { label: "Nodes placed", value: "6 / 6" },
      ],
      lines: [3],
      scene: view({
        note: "finish order recorded: C F E D B A",
        tones: Object.fromEntries(ALL_FINISH.map((n) => [n, "done" as Tone])),
        subs: NUMS,
        finish: ALL_FINISH,
      }),
    },
    {
      short: "Reverse",
      title: "Reverse every edge",
      body: [
        "Flip each arrow. Reachability inside a component is unchanged, because any loop is still a loop when run backwards, so the components stay the same.",
        "But the bridge now points the other way: `D → B`. A search that starts inside the first component can no longer leak into the second one.",
      ],
      callout: {
        kind: "insight",
        text: "Reversing turns the source component into a sink, so a DFS started there visits exactly that component and nothing else.",
      },
      metrics: [
        { label: "Pass", value: "2 setup" },
        { label: "Nodes placed", value: "0 / 6" },
      ],
      lines: [4, 5],
      scene: view({
        rev: true,
        note: "reversed graph: the bridge is now D → B",
        edgeTones: { "D-B": "warn" },
        subs: NUMS,
        finish: ALL_FINISH,
        finishTones: Object.fromEntries(ALL_FINISH.map((n) => [n, "plain" as Tone])),
      }),
    },
    {
      short: "First comp.",
      title: "Pass 2: start at the latest finisher",
      body: [
        "Take nodes in reverse finish order. The first is `A`. DFS on the reversed graph from `A` reaches `C`, then `B`, and every other edge points back into the set.",
        "Everything visited in this single search is one component: `{A, B, C}`. Paint it one colour.",
      ],
      metrics: [
        { label: "Pass", value: "2 (reversed)" },
        { label: "Components", value: "1", level: "good" },
        { label: "Nodes placed", value: "3 / 6" },
      ],
      lines: [6, 7, 8, 9],
      scene: view({
        rev: true,
        note: "DFS from A reaches C and B only: component 1",
        tones: { A: "found", B: "found", C: "found" },
        edgeTones: { "B-A": "found", "C-B": "found", "A-C": "found", "D-B": "warn" },
        subs: NUMS,
        finish: ALL_FINISH,
        finishTones: { A: "found", B: "found", C: "found" },
      }),
    },
    {
      short: "Second comp.",
      title: "Next unvisited node: D",
      body: [
        "Walk down the order, skipping nodes that already have a colour. `B` and `A` are taken, so the next free node is `D`.",
        "DFS from `D` in the reversed graph reaches `F` and `E`, then stops. That is the second component, `{D, E, F}`, in a second colour.",
      ],
      callout: {
        kind: "warn",
        text: "Never restart from a node that already has a component. Only the unvisited ones begin a new search.",
      },
      metrics: [
        { label: "Components", value: "2", level: "good" },
        { label: "Nodes placed", value: "6 / 6" },
      ],
      lines: [6, 7, 8, 9],
      scene: view({
        rev: true,
        note: "DFS from D reaches F and E: component 2",
        tones: { A: "found", B: "found", C: "found", D: "mark", E: "mark", F: "mark" },
        edgeTones: {
          "B-A": "found",
          "C-B": "found",
          "A-C": "found",
          "D-F": "active",
          "F-E": "active",
          "E-D": "active",
        },
        subs: NUMS,
        finish: ALL_FINISH,
        finishTones: { A: "found", B: "found", C: "found", D: "mark", E: "mark", F: "mark" },
      }),
    },
    {
      short: "Recap",
      title: "Two passes, linear time",
      body: [
        "Pass 1 produced a finish order; pass 2 swept the reversed graph in that order, and each fresh search painted one whole component. Every node and edge is touched a constant number of times.",
        "The cost is `O(V + E)` time and `O(V)` extra space for the visited marks, the order and the component labels.",
      ],
      callout: {
        kind: "tip",
        text: "Tarjan's algorithm finds the same components in a single DFS using low-link values; Kosaraju is easier to explain.",
      },
      metrics: [
        { label: "Pass", value: "2 DFS" },
        { label: "Components", value: "2", level: "good" },
        { label: "Nodes placed", value: "6 / 6" },
        { label: "Cost", value: "O(V + E)", level: "good" },
      ],
      scene: view({
        note: "{A, B, C}   and   {D, E, F}",
        tones: { A: "found", B: "found", C: "found", D: "mark", E: "mark", F: "mark" },
        edgeTones: {
          "A-B": "found",
          "B-C": "found",
          "C-A": "found",
          "D-E": "active",
          "E-F": "active",
          "F-D": "active",
        },
      }),
    },
  ],
};
