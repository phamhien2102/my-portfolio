import { label, scene, tree } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

//            8
//        3       10
//      1   6        14        level-order: 8 3 10 1 6 null 14
const VALUES = [8, 3, 10, 1, 6, null, 14];
const IDX: Record<number, number> = { 8: 0, 3: 1, 10: 2, 1: 3, 6: 4, 14: 6 };

/** The tree with the visited values settled, the current one highlighted, and the order so far. */
function walk(order: number[], at: number | undefined, name: string) {
  const tones: Record<number, Tone> = {};
  order.forEach((v) => (tones[IDX[v]] = "done"));
  if (at !== undefined) tones[IDX[at]] = "active";
  return scene(
    tree(VALUES, { x: 320, y: 60, width: 320, tones }),
    label("name", 320, 245, name, { size: 13, weight: 800 }),
    label("order", 320, 280, order.length ? `visited: ${order.join("  ")}` : "visited: —", {
      size: 14,
      weight: 800,
      tone: "good",
    }),
  );
}

export const treeTraversals: AlgoLesson = {
  id: "tree-traversals",
  title: "Tree Traversals",
  summary: "Visit every node of a binary tree in four classic orders and see when each one helps.",
  minutes: 11,
  level: "beginner",
  goals: [
    "How preorder, inorder and postorder differ",
    "Why inorder on a search tree gives sorted output",
    "How level-order uses a queue instead of recursion",
    "What each traversal is typically used for",
  ],
  takeaways: [
    "Depth-first orders differ only in when the node itself is visited: before, between or after its children.",
    "Inorder on a binary search tree yields the values in sorted order.",
    "Level-order walks row by row with a queue, which is how you find the shortest route in a tree.",
  ],
  hud: [
    { label: "Visited", icon: "list" },
    { label: "Order", icon: "branch" },
    { label: "Extra memory", icon: "memory" },
  ],
  pseudocode: [
    "preorder(node):",
    "    if node is empty: return",
    "    visit(node)",
    "    preorder(node.left)",
    "    preorder(node.right)",
    "inorder(node): inorder(left), visit(node), inorder(right)",
    "postorder(node): postorder(left), postorder(right), visit(node)",
    "levelOrder(root):",
    "    queue = [root]",
    "    while queue is not empty:",
    "        node = queue.pop front",
    "        visit(node)",
    "        push node.left and node.right if they exist",
  ],
  steps: [
    {
      short: "The tree",
      title: "One tree, many walks",
      body: [
        "A traversal visits every node exactly once. The shape of the tree does not change, only the order in which we say 'here is a node'.",
        "Here is a small binary search tree: `8` at the top, `3` and `10` below it, and so on.",
      ],
      metrics: [{ label: "Visited", value: "0" }],
      scene: walk([], undefined, "no traversal yet"),
    },
    {
      short: "Preorder",
      title: "Preorder: node, left, right",
      body: [
        "Visit the node first, then walk its whole left subtree, then its right subtree. The root always comes out first.",
        "Preorder is how you copy a tree or write it down so it can be rebuilt: parents appear before their children.",
      ],
      metrics: [
        { label: "Visited", value: "6" },
        { label: "Order", value: "8 3 1 6 10 14" },
        { label: "Extra memory", value: "O(h)", level: "good" },
      ],
      lines: [1, 3, 4, 5],
      scene: walk([8, 3, 1, 6, 10, 14], undefined, "preorder: node → left → right"),
    },
    {
      short: "Inorder",
      title: "Inorder: left, node, right",
      body: [
        "Walk the left subtree, then visit the node, then the right subtree. On a binary search tree this visits the values in increasing order.",
        "That is why searching, listing and validating a BST so often start with an inorder walk.",
      ],
      callout: {
        kind: "insight",
        text: "Inorder on a binary search tree is a free sort: 1 3 6 8 10 14.",
      },
      metrics: [
        { label: "Visited", value: "6" },
        { label: "Order", value: "1 3 6 8 10 14", level: "good" },
        { label: "Extra memory", value: "O(h)", level: "good" },
      ],
      lines: [6],
      scene: walk([1, 3, 6, 8, 10, 14], undefined, "inorder: left → node → right"),
    },
    {
      short: "Postorder",
      title: "Postorder: left, right, node",
      body: [
        "Visit both subtrees first and the node last, so every node appears after all of its descendants. The root comes out last.",
        "Use it when a parent depends on its children: computing sizes and heights, or deleting a tree safely from the bottom up.",
      ],
      metrics: [
        { label: "Visited", value: "6" },
        { label: "Order", value: "1 6 3 14 10 8" },
        { label: "Extra memory", value: "O(h)", level: "good" },
      ],
      lines: [7],
      scene: walk([1, 6, 3, 14, 10, 8], undefined, "postorder: left → right → node"),
    },
    {
      short: "Level order",
      title: "Level-order: row by row",
      body: [
        "Visit the root, then both of its children, then all grandchildren, and so on. There is no recursion: a queue holds the nodes waiting to be visited.",
        "It finds the closest node to the root first, which makes it the tool for shortest paths and for printing a tree by depth.",
      ],
      callout: {
        kind: "tip",
        text: "Depth-first walks use memory proportional to the height; level-order uses memory proportional to the widest row.",
      },
      metrics: [
        { label: "Visited", value: "6" },
        { label: "Order", value: "8 3 10 1 6 14" },
        { label: "Extra memory", value: "O(w)", level: "warn" },
      ],
      lines: [9, 10, 11, 12, 13],
      scene: walk(
        [8, 3, 10, 1, 6, 14],
        undefined,
        "level order: top row to bottom row, using a queue",
      ),
    },
    {
      short: "Which one?",
      title: "Pick the order the problem needs",
      body: [
        "All four walks cost `O(n)` time because each node is visited once. They differ in when the node is handled and how much memory they need.",
        "Reach for inorder when sorted order matters, preorder to copy or serialise, postorder when a parent needs its children's results, and level-order when distance from the root matters.",
      ],
      metrics: [
        { label: "Visited", value: "6" },
        { label: "Order", value: "depends on the goal" },
        { label: "Extra memory", value: "O(h) or O(w)", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 60, "preorder  → copy a tree", { size: 14, weight: 800 }),
        label("t2", 320, 105, "inorder  → sorted output from a BST", { size: 14, weight: 800 }),
        label("t3", 320, 150, "postorder  → sizes, heights, safe delete", {
          size: 14,
          weight: 800,
        }),
        label("t4", 320, 195, "level order  → shortest path, rows by depth", {
          size: 14,
          weight: 800,
        }),
      ),
    },
  ],
};
