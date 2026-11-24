import { bars, disc, edge, label, row, scene } from "../lib/scenes";
import type { AlgoLesson, EdgeTone, Item, Tone } from "../lib/types";

// Message: aaaaabbcd  (a x5, b x2, c x1, d x1).  Codes: a=0, b=10, c=110, d=111.
type Pos = Record<string, [number, number]>;

// Where each node sits at each stage of the build. Same id keeps sliding between stages.
const S0: Pos = { c: [160, 150], d: [260, 150], b: [360, 150], a: [480, 150] };
const S1: Pos = { ...S0, n2: [210, 80] };
const S2: Pos = {
  n4: [300, 50],
  n2: [230, 115],
  c: [180, 180],
  d: [280, 180],
  b: [380, 115],
  a: [520, 115],
};
const S3: Pos = {
  r: [320, 50],
  a: [200, 115],
  n4: [440, 115],
  b: [370, 180],
  n2: [510, 180],
  c: [460, 245],
  d: [560, 245],
};

const WEIGHT: Record<string, string> = { a: "5", b: "2", c: "1", d: "1", n2: "2", n4: "4", r: "9" };
const LEAVES = ["a", "b", "c", "d"];
const CODE: Record<string, string> = { a: "0", b: "10", c: "110", d: "111" };

type Link = [string, string, string];
const L1: Link[] = [
  ["n2", "c", "0"],
  ["n2", "d", "1"],
];
const L2: Link[] = [...L1, ["n4", "n2", "1"], ["n4", "b", "0"]];
const L3: Link[] = [...L2, ["r", "a", "0"], ["r", "n4", "1"]];

function forest(
  pos: Pos,
  links: Link[],
  o: { bits?: boolean; codes?: boolean; tones?: Record<string, Tone>; edgeTone?: EdgeTone } = {},
): Item[] {
  const items: Item[] = [];
  for (const [p, c, bit] of links)
    items.push(
      edge(`e${p}${c}`, p, c, {
        arrow: "none",
        label: o.bits ? bit : undefined,
        tone: o.edgeTone,
      }),
    );
  for (const [id, [x, y]] of Object.entries(pos)) {
    const leaf = LEAVES.includes(id);
    items.push(
      disc(id, x, y, leaf ? id : WEIGHT[id], {
        r: 20,
        sub: leaf ? (o.codes ? CODE[id] : `x${WEIGHT[id]}`) : undefined,
        tone: o.tones?.[id] ?? (leaf ? "mark" : undefined),
      }),
    );
  }
  return items;
}

export const huffmanCoding: AlgoLesson = {
  id: "huffman-coding",
  title: "Huffman Coding",
  summary:
    "Give frequent symbols short bit codes by repeatedly merging the two lightest nodes into a tree.",
  minutes: 14,
  level: "advanced",
  goals: [
    "Why variable-length codes can beat fixed-width codes",
    "How merging the two lightest nodes builds the tree",
    "How to read each symbol's code off the 0 and 1 edges",
    "Why a prefix-free code can be decoded without separators",
    "How much space the result saves",
  ],
  takeaways: [
    "Huffman coding repeatedly merges the two lowest-weight nodes, so rare symbols end up deep and get long codes.",
    "A code read from the leaves of a tree is prefix-free: no code starts another, so the bit stream decodes without gaps.",
    "With a heap the build costs O(n log n) for n distinct symbols, and the result is the shortest possible prefix code.",
  ],
  hud: [
    { label: "Trees left", icon: "layers" },
    { label: "Total bits", icon: "database" },
    { label: "Bits per symbol", icon: "gauge" },
  ],
  pseudocode: [
    "huffman(counts):",
    "    make a one-node tree per symbol, weighted by its count",
    "    repeat while more than one tree is left:",
    "        a, b = the two lightest trees",
    "        merge a and b under a new parent",
    "        parent weight = a.weight + b.weight",
    "        put the parent back among the trees",
    "    label left edges 0 and right edges 1",
    "    code of a symbol = edge labels from the root to its leaf",
    "    return the code table",
  ],
  steps: [
    {
      short: "The message",
      title: "Nine symbols, two bits each",
      body: [
        "Take the message `aaaaabbcd`. It has four distinct symbols, so a fixed-width code needs 2 bits for each: `a=00`, `b=01`, `c=10`, `d=11`.",
        "Nine symbols at 2 bits is 18 bits. But `a` appears five times and `c` and `d` only once. Spending the same 2 bits on all of them wastes space.",
      ],
      metrics: [
        { label: "Total bits", value: "18", level: "warn" },
        { label: "Bits per symbol", value: "2.0", level: "warn" },
      ],
      scene: scene(
        row(["a", "a", "a", "a", "a", "b", "b", "c", "d"], { y: 130, w: 44, gap: 6 }),
        label("fixed", 320, 200, "fixed width: 9 symbols x 2 bits = 18 bits", {
          size: 14,
          weight: 800,
        }),
      ),
    },
    {
      short: "Weights",
      title: "Start with one tiny tree per symbol",
      body: [
        "Count each symbol and make a one-node tree out of it, labelled with its count: `c` and `d` weigh 1, `b` weighs 2, `a` weighs 5.",
        "The rule is always the same: take the two lightest trees and merge them. Rare symbols get merged first, so they end up deepest.",
      ],
      callout: {
        kind: "insight",
        text: "A deeper leaf means a longer code. Frequent symbols should stay close to the root.",
      },
      metrics: [
        { label: "Trees left", value: "4" },
        { label: "Total bits", value: "18", level: "warn" },
      ],
      lines: [2],
      scene: scene(forest(S0, [])),
    },
    {
      short: "Merge c, d",
      title: "Merge the two lightest: c and d",
      body: [
        "`c` and `d` both weigh 1. Join them under a new parent whose weight is their sum, 2. Label the left edge `0` and the right edge `1`.",
        "Three trees are left: the new node (2), `b` (2) and `a` (5).",
      ],
      metrics: [
        { label: "Trees left", value: "3" },
        { label: "Total bits", value: "18", level: "warn" },
      ],
      lines: [3, 4, 5, 6, 7, 8],
      scene: scene(forest(S1, L1, { bits: true })),
    },
    {
      short: "Merge b",
      title: "Merge again: b with the new node",
      body: [
        "The two lightest are now `b` (2) and the node for `c`+`d` (2). A tie can be broken either way; both choices give an optimal code. Their parent weighs 4.",
        "Two trees remain: the node of weight 4 and `a` with 5.",
      ],
      metrics: [
        { label: "Trees left", value: "2" },
        { label: "Total bits", value: "18", level: "warn" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: scene(forest(S2, L2, { bits: true })),
    },
    {
      short: "Merge last",
      title: "Merge the final two",
      body: [
        "Only `a` (5) and the node of weight 4 are left. Join them under a root of weight 9, which is the total number of symbols.",
        "One tree remains, so we are done. The heavy symbol `a` hangs right under the root, one step away.",
      ],
      metrics: [
        { label: "Trees left", value: "1", level: "good" },
        { label: "Total bits", value: "18", level: "warn" },
      ],
      lines: [3, 4, 5, 6, 7],
      scene: scene(forest(S3, L3, { bits: true })),
    },
    {
      short: "Read codes",
      title: "Read the codes off the edges",
      body: [
        "Walk from the root to each leaf and write down the 0s and 1s you pass. That is the code for that symbol: `a=0`, `b=10`, `c=110`, `d=111`.",
        "The frequent `a` costs one bit, the rare `c` and `d` cost three. The code lengths follow the frequencies.",
      ],
      chapter: { label: "Codes", tone: "green" },
      metrics: [
        { label: "Trees left", value: "1", level: "good" },
        { label: "Total bits", value: "15", level: "good" },
      ],
      lines: [8, 9, 10],
      scene: scene(
        forest(S3, L3, {
          bits: true,
          codes: true,
          tones: { a: "found", b: "found", c: "found", d: "found" },
          edgeTone: "found",
        }),
      ),
    },
    {
      short: "Prefix-free",
      title: "Why no separators are needed",
      body: [
        "Symbols are only at the leaves, so no code can be the beginning of another. After reading `110` there is nowhere further to go, so it must be `c`.",
        "Compare a bad code such as `a=0`, `b=1`, `c=01`. The bits `01` could mean `ab` or `c`, and the decoder cannot tell.",
      ],
      callout: {
        kind: "warn",
        text: "A code that is not prefix-free needs separators or lookahead. A tree with symbols only at the leaves never has that problem.",
      },
      metrics: [{ label: "Total bits", value: "15", level: "good" }],
      scene: scene(
        label("p1", 320, 70, "good:  a=0   b=10   c=110   d=111", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("p2", 320, 105, "no code starts another one", { size: 12, tone: "muted" }),
        label("p3", 320, 175, "bad:  a=0   b=1   c=01", { size: 14, weight: 800, tone: "warn" }),
        label("p4", 320, 210, "01 could be a then b, or c", { size: 12, tone: "muted" }),
      ),
    },
    {
      short: "Encoded",
      title: "The message, encoded",
      body: [
        "Replace each symbol by its code: five `a` at 1 bit, two `b` at 2 bits, one `c` and one `d` at 3 bits each. That is 5 + 4 + 3 + 3 = 15 bits.",
        "The decoder starts at the root, follows 0 or 1 for each bit, and emits a symbol every time it reaches a leaf, then restarts at the root.",
      ],
      metrics: [
        { label: "Total bits", value: "15", level: "good" },
        { label: "Bits per symbol", value: "1.67", level: "good" },
      ],
      scene: scene(
        row(["0", "0", "0", "0", "0", "10", "10", "110", "111"], {
          y: 120,
          w: 52,
          gap: 6,
          tones: (i) => (i < 5 ? "found" : i < 7 ? "mark" : "done"),
        }),
        label("enc", 320, 190, "a a a a a b b c d  ->  15 bits", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Savings",
      title: "18 bits down to 15",
      body: [
        "The fixed code spent 18 bits, Huffman spends 15: about 17% less, and the gap grows when the frequencies are more uneven.",
        "No other prefix code for these counts can do better. Huffman's rule of merging the two lightest nodes gives the minimum total.",
      ],
      metrics: [
        { label: "Total bits", value: "15", level: "good" },
        { label: "Bits per symbol", value: "1.67", level: "good" },
      ],
      scene: scene(
        bars([18, 15], { x: 320, y: 215, w: 90, gap: 60, tones: { 0: "warn", 1: "found" } }),
        label("f1", 240, 245, "fixed", { size: 13, tone: "muted" }),
        label("f2", 400, 245, "Huffman", { size: 13, tone: "muted" }),
      ),
    },
    {
      short: "Recap",
      title: "Cost and the rule",
      body: [
        "Keep the trees in a min-heap. Each of the `n - 1` merges pops two and pushes one, so building the tree costs `O(n log n)`.",
        "To use the result, store the code table (or the tree) with the data so the decoder can rebuild it. The rule to remember: merge the two lightest, and frequent symbols end up near the root.",
      ],
      chapter: { label: "Recap", tone: "ink" },
      metrics: [
        { label: "Trees left", value: "1", level: "good" },
        { label: "Total bits", value: "15", level: "good" },
      ],
      scene: scene(
        label("r1", 320, 80, "merge the two lightest, n - 1 times", { size: 15, weight: 800 }),
        label("r2", 320, 125, "heap: O(n log n) to build the tree", { size: 13, tone: "muted" }),
        label("r3", 320, 170, "frequent symbols: short codes", {
          size: 13,
          weight: 800,
          tone: "good",
        }),
        label("r4", 320, 205, "rare symbols: long codes", { size: 13, weight: 800, tone: "warn" }),
      ),
    },
  ],
};
