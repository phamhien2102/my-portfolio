import { label, ptr, row, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

/** The seven-node tree used by the vocabulary steps, with tones by level-order index. */
const main = (tones: Record<number, Tone> = {}) =>
  tree(LETTERS, { x: 320, y: 50, width: 320, tones });

/** A sparse level-order list: place `values` at the given indexes and leave gaps elsewhere. */
function sparse(len: number, at: Record<number, string>) {
  const out: (string | null)[] = Array(len).fill(null);
  Object.entries(at).forEach(([i, v]) => (out[Number(i)] = v));
  return out;
}

export const binaryTrees: AlgoLesson = {
  id: "binary-trees",
  title: "Binary Trees",
  summary: "Learn the vocabulary of trees and why a binary tree can live inside a plain array.",
  minutes: 11,
  level: "beginner",
  goals: [
    "What root, parent, child and leaf mean",
    "How depth, level and height are counted",
    "How full, complete and skewed trees differ",
    "How a complete tree maps onto an array",
  ],
  takeaways: [
    "A binary tree is a root plus at most two subtrees, and every node except the root has exactly one parent.",
    "Height decides the cost of almost every tree operation: a full tree is short, a skewed tree is as tall as a list.",
    "A complete tree needs no pointers at all: the children of index i sit at 2i + 1 and 2i + 2.",
  ],
  hud: [
    { label: "Nodes", icon: "branch" },
    { label: "Height", icon: "layers" },
    { label: "Leaves", icon: "list" },
    { label: "Array slots", icon: "grid" },
  ],
  pseudocode: [
    "describe(tree):",
    "    root = the node with no parent",
    "    leaf = a node with no children",
    "    depth(x) = edges on the path from the root down to x",
    "    height(tree) = the largest depth of any node",
    "    for each node i of a complete tree stored in an array:",
    "        left = 2*i + 1",
    "        right = 2*i + 2",
    "        parent = floor((i - 1) / 2)",
  ],
  steps: [
    {
      short: "The tree",
      title: "Data that branches",
      body: [
        "A list has one next item. A tree lets every item lead to several, which is how folders, family charts and the HTML of a page are organised.",
        "This tree has seven nodes joined by six edges. In a tree there is exactly one way to walk from the top to any node.",
      ],
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Height", value: "2" },
        { label: "Leaves", value: "4" },
      ],
      scene: scene(main(), label("cap", 320, 250, "7 nodes, 6 edges, no cycles", { size: 13 })),
    },
    {
      short: "Root, parent",
      title: "Root, parent and child",
      body: [
        "The node at the very top is the root; it is the only node with no parent. Every other node hangs below exactly one node, its parent.",
        "The nodes directly under a parent are its children. Here `B` is the parent of `D` and `E`, and `B` is itself a child of the root `A`.",
      ],
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Height", value: "2" },
        { label: "Leaves", value: "4" },
      ],
      lines: [2],
      scene: scene(
        main({ 0: "mark", 1: "active", 3: "found", 4: "found" }),
        ptr("root", "t0", "root", { side: "above", tone: "mark" }),
        ptr("par", "t1", "parent of D, E", { side: "left", tone: "active" }),
        ptr("ch1", "t3", "child", { side: "below", tone: "found" }),
        ptr("ch2", "t4", "child", { side: "below", tone: "found" }),
      ),
    },
    {
      short: "Leaves",
      title: "Leaves have no children",
      body: [
        "A node with no children is a leaf. In this tree the four bottom nodes `D`, `E`, `F` and `G` are leaves, and every other node is an internal node.",
        "Leaves are where recursion stops, so they are the base case of nearly every tree algorithm.",
      ],
      callout: {
        kind: "insight",
        text: "A full binary tree always has one more leaf than it has internal nodes: here 4 leaves and 3 internal nodes.",
      },
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Height", value: "2" },
        { label: "Leaves", value: "4", level: "good" },
      ],
      lines: [3],
      scene: scene(
        main({ 3: "found", 4: "found", 5: "found", 6: "found" }),
        ptr("l3", "t3", "leaf", { side: "below", tone: "found" }),
        ptr("l4", "t4", "leaf", { side: "below", tone: "found" }),
        ptr("l5", "t5", "leaf", { side: "below", tone: "found" }),
        ptr("l6", "t6", "leaf", { side: "below", tone: "found" }),
      ),
    },
    {
      short: "Depth, height",
      title: "Depth, level and height",
      body: [
        "The depth of a node is the number of edges from the root down to it, and a level is the set of nodes sharing one depth. `E` is at depth 2, on level 2.",
        "The height of the tree is the depth of its deepest node. This tree has height 2. Height, not node count, is what operations pay for.",
      ],
      callout: {
        kind: "warn",
        text: "Books disagree on whether a single node has height 0 or 1. Pick one convention and state it; this lesson counts edges.",
      },
      metrics: [
        { label: "Nodes", value: "7" },
        { label: "Height", value: "2" },
        { label: "Leaves", value: "4" },
      ],
      lines: [4, 5],
      scene: scene(
        main({ 4: "active" }),
        label("lv0", 520, 55, "level 0, depth 0", { size: 12, anchor: "start" }),
        label("lv1", 520, 117, "level 1, depth 1", { size: 12, anchor: "start" }),
        label("lv2", 520, 179, "level 2, depth 2", { size: 12, anchor: "start" }),
        label("h", 320, 250, "height of the tree = 2 edges", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Two children",
      title: "At most two children, ordered",
      body: [
        "In a binary tree no node may have more than two children, and they are told apart: one is the left child and one is the right child.",
        "A node may have zero, one or two children. Swapping left and right gives a different tree, which matters as soon as the values carry meaning.",
      ],
      metrics: [
        { label: "Nodes", value: "4" },
        { label: "Height", value: "1" },
        { label: "Leaves", value: "2" },
      ],
      scene: scene(
        tree(["A", "B", "C"], { x: 320, y: 60, width: 320, tones: { 0: "mark" } }),
        ptr("left", "t1", "left child", { side: "left", tone: "found" }),
        ptr("right", "t2", "right child", { side: "right", tone: "found" }),
        label("no", 320, 200, "a third child is not allowed", { size: 13, tone: "warn" }),
      ),
    },
    {
      short: "Shapes",
      title: "Full, complete and skewed",
      body: [
        "A full tree gives every node 0 or 2 children. A complete tree fills every level except possibly the last, and the last fills from the left.",
        "A skewed tree gives each node one child, so it is really a linked list. All three hold their nodes, but their heights are very different.",
      ],
      callout: {
        kind: "insight",
        text: "n nodes can make a tree of height about log2(n) or of height n - 1. Most of data structures is about steering towards the first.",
      },
      metrics: [
        { label: "Nodes", value: "7 / 6 / 4" },
        { label: "Height", value: "2 / 2 / 3", level: "warn" },
        { label: "Leaves", value: "4 / 3 / 1" },
      ],
      scene: scene(
        tree(LETTERS, { id: "f", x: 110, y: 60, width: 150, dy: 50, r: 15 }),
        tree(["A", "B", "C", "D", "E", "F"], { id: "c", x: 320, y: 60, width: 150, dy: 50, r: 15 }),
        tree(sparse(15, { 0: "A", 2: "B", 6: "C", 14: "D" }), {
          id: "s",
          x: 530,
          y: 60,
          width: 150,
          dy: 50,
          r: 15,
        }),
        label("n1", 110, 250, "full", { size: 14, weight: 800 }),
        label("n2", 320, 250, "complete", { size: 14, weight: 800 }),
        label("n3", 530, 250, "skewed", { size: 14, weight: 800, tone: "warn" }),
      ),
    },
    {
      short: "As an array",
      title: "A complete tree fits in an array",
      body: [
        "Number the nodes level by level, left to right, starting at 0. That numbering is the array: slot `i` stores node `i`, and no pointers are stored anywhere.",
        "Here the six nodes `A` to `F` sit in slots 0 to 5. The tree is still there, it is just implied by the positions.",
      ],
      metrics: [
        { label: "Nodes", value: "6" },
        { label: "Height", value: "2" },
        { label: "Array slots", value: "6" },
      ],
      lines: [6],
      scene: scene(
        tree(["A", "B", "C", "D", "E", "F"], { x: 320, y: 40, width: 280, dy: 56 }),
        row(["A", "B", "C", "D", "E", "F"], { y: 230, index: true }),
        label("cap", 320, 300, "level order = array order", { size: 13 }),
      ),
    },
    {
      short: "Index math",
      title: "Finding a child by arithmetic",
      body: [
        "For the node in slot `i`, its children are in slots `2i + 1` and `2i + 2`, and its parent is in slot `floor((i - 1) / 2)`.",
        "Take `B` in slot 1: its children are slots 3 and 4, which hold `D` and `E`. Its parent is slot 0, which holds `A`.",
      ],
      callout: {
        kind: "warn",
        text: "This only works without gaps. A skewed tree stored this way would need 2^h slots for h + 1 nodes, mostly empty.",
      },
      metrics: [
        { label: "Nodes", value: "6" },
        { label: "Height", value: "2" },
        { label: "Array slots", value: "6" },
      ],
      lines: [7, 8, 9],
      scene: scene(
        tree(["A", "B", "C", "D", "E", "F"], {
          x: 320,
          y: 40,
          width: 280,
          dy: 56,
          tones: { 1: "active", 3: "found", 4: "found", 0: "mark" },
        }),
        row(["A", "B", "C", "D", "E", "F"], {
          y: 230,
          index: true,
          tones: { 1: "active", 3: "found", 4: "found", 0: "mark" },
        }),
        label("f1", 320, 300, "children of 1: 2(1)+1 = 3 and 2(1)+2 = 4", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Recap",
      title: "What to remember",
      body: [
        "Root on top, parents above children, leaves at the bottom. Depth counts edges down from the root and height is the deepest depth.",
        "A binary tree has at most two ordered children per node. Keep its height small and every later structure in this course stays fast.",
      ],
      metrics: [
        { label: "Nodes", value: "n" },
        { label: "Height", value: "log n to n - 1" },
        { label: "Array slots", value: "n if complete", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 70, "at most 2 children per node", { size: 14, weight: 800 }),
        label("r2", 320, 115, "height: between log2(n) and n - 1", { size: 14, weight: 800 }),
        label("r3", 320, 160, "complete tree: children of i at 2i+1, 2i+2", {
          size: 14,
          weight: 800,
        }),
        label("r4", 320, 205, "skewed tree: behaves like a linked list", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
      ),
    },
  ],
};
