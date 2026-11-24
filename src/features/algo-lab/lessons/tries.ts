import { edge, disc, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

// The final trie holds: car, cat, cart, do, dog. Positions are fixed so nodes
// keep their place while words are added.
interface N {
  id: string;
  parent: string | null;
  ch: string;
  x: number;
  y: number;
}
const NODES: N[] = [
  { id: "root", parent: null, ch: "·", x: 320, y: 40 },
  { id: "c", parent: "root", ch: "c", x: 190, y: 110 },
  { id: "ca", parent: "c", ch: "a", x: 190, y: 180 },
  { id: "car", parent: "ca", ch: "r", x: 130, y: 250 },
  { id: "cat", parent: "ca", ch: "t", x: 250, y: 250 },
  { id: "cart", parent: "car", ch: "t", x: 130, y: 320 },
  { id: "d", parent: "root", ch: "d", x: 450, y: 110 },
  { id: "do", parent: "d", ch: "o", x: 450, y: 180 },
  { id: "dog", parent: "do", ch: "g", x: 450, y: 250 },
];

/** Ids on the path of a word, root excluded: "cat" → c, ca, cat. */
const path = (w: string) => Array.from({ length: w.length }, (_, i) => w.slice(0, i + 1));

/** Draw the nodes in `shown`; `ends` carry an end-of-word mark; `tones` colours by id. */
function trie(
  shown: string[],
  ends: string[],
  tones: Record<string, Tone> = {},
  cap?: string,
  res?: string,
) {
  const items: Item[] = [];
  NODES.filter((n) => n.id === "root" || shown.includes(n.id)).forEach((n) => {
    if (n.parent)
      items.push(
        edge(`e-${n.id}`, `n-${n.parent}`, `n-${n.id}`, {
          arrow: "none",
          tone: tones[n.id] === "found" ? "found" : tones[n.id] === "warn" ? "warn" : undefined,
        }),
      );
  });
  NODES.filter((n) => n.id === "root" || shown.includes(n.id)).forEach((n) =>
    items.push(
      disc(`n-${n.id}`, n.x, n.y, n.ch, {
        r: 18,
        tone: tones[n.id] ?? (ends.includes(n.id) ? "done" : undefined),
        sub: ends.includes(n.id) ? "end" : undefined,
      }),
    ),
  );
  return scene(
    items,
    cap && label("cap", 560, 120, cap, { size: 12, weight: 800, anchor: "middle" }),
    res && label("res", 560, 160, res, { size: 12, weight: 800, tone: "good", anchor: "middle" }),
  );
}

const ALL = NODES.slice(1).map((n) => n.id);
const ALL_ENDS = ["car", "cat", "cart", "do", "dog"];

export const tries: AlgoLesson = {
  id: "tries",
  title: "Tries",
  summary:
    "Store words as paths in a tree of letters so prefix questions are answered in one walk.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "How a trie stores words as shared letter paths",
    "Why end-of-word marks are needed",
    "How prefix search and autocomplete use the structure",
    "How a trie trades memory for speed",
  ],
  takeaways: [
    "A trie stores one letter per edge, so words with a common prefix share their first nodes.",
    "Lookups cost O(L) for a word of length L, independent of how many words are stored.",
    "Marking where words end is essential, because a path can be a prefix without being a word.",
  ],
  hud: [
    { label: "Nodes", icon: "branch" },
    { label: "Letters checked", icon: "search" },
    { label: "Words", icon: "list" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "insert(word):",
    "    node = root",
    "    for each letter c in word:",
    "        if node has no child c: create it",
    "        node = child c of node",
    "    mark node as end of word",
    "search(prefix):",
    "    node = root",
    "    for each letter c in prefix:",
    "        if node has no child c: return none",
    "        node = child c of node",
    "    return node",
    "isWord(w): return search(w) exists and is marked end",
    "complete(p): collect every marked node below search(p)",
  ],
  steps: [
    {
      short: "The problem",
      title: "Fast prefix questions",
      body: [
        "Imagine a dictionary and the question 'which words start with `ca`?'. In a sorted list or a hash set you would scan or test every word.",
        "A trie (from re-trie-val) stores words so that all words with a common start share a common path. It begins with an empty root.",
      ],
      metrics: [
        { label: "Nodes", value: "1" },
        { label: "Words", value: "0" },
      ],
      scene: scene(
        trie([], []),
        label("w", 320, 120, "words to store:  car  cat  cart  do  dog", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Insert car",
      title: "Insert 'car': walk and create",
      body: [
        "Start at the root. For each letter, follow the edge for that letter, and create it if it does not exist. `c`, then `a`, then `r`: three new nodes.",
        "Finally mark the last node as the end of a word. The marked `r` says that the path `c-a-r` is a stored word.",
      ],
      metrics: [
        { label: "Nodes", value: "4" },
        { label: "Words", value: "1" },
        { label: "Letters checked", value: "3" },
      ],
      lines: [2, 3, 4, 5, 6],
      scene: trie(
        path("car"),
        ["car"],
        { c: "active", ca: "active" },
        "3 new nodes",
        "r marked as end",
      ),
    },
    {
      short: "Insert cat",
      title: "Insert 'cat': reuse the prefix",
      body: [
        "`c` and `a` already exist, so we just walk through them. Only `t` is missing, so one new node is created under `a` and marked as an end.",
        "That sharing is the point: the more words overlap, the fewer nodes are needed.",
      ],
      metrics: [
        { label: "Nodes", value: "5" },
        { label: "Words", value: "2" },
        { label: "Letters checked", value: "3" },
      ],
      lines: [4, 5, 6],
      scene: trie(
        ["c", "ca", "car", "cat"],
        ["car", "cat"],
        { c: "done", ca: "done", cat: "found" },
        "1 new node",
        "c, a reused",
      ),
    },
    {
      short: "Insert cart",
      title: "Insert 'cart': a word inside a word",
      body: [
        "`car` is already a word, and `cart` extends it. Walk `c-a-r` through existing nodes and add `t` below `r`.",
        "The first `r` keeps its end mark because `car` is still a word on its own. This is why the mark lives on the node, not on the leaf.",
      ],
      callout: {
        kind: "warn",
        text: "Without end marks you could not tell that car is a word while cart also exists. The node alone does not say so.",
      },
      metrics: [
        { label: "Nodes", value: "6" },
        { label: "Words", value: "3" },
        { label: "Letters checked", value: "4" },
      ],
      lines: [4, 5, 6],
      scene: trie(
        ["c", "ca", "car", "cat", "cart"],
        ["car", "cat", "cart"],
        { c: "done", ca: "done", car: "done", cart: "found" },
        "1 new node",
        "car stays marked",
      ),
    },
    {
      short: "Insert do, dog",
      title: "Insert 'do' and 'dog'",
      body: [
        "`d` is new, so `d` and `o` are created, and `o` is marked as the end of `do`. Then `dog` reuses `d` and `o` and adds only `g`.",
        "Now nine letter nodes spell five words with 15 letters in total. Each insert costs `O(L)` for a word of length `L`.",
      ],
      metrics: [
        { label: "Nodes", value: "10" },
        { label: "Words", value: "5" },
        { label: "Letters checked", value: "5" },
        { label: "Cost", value: "O(L) each", level: "good" },
      ],
      lines: [4, 5, 6],
      scene: trie(
        ALL,
        ALL_ENDS,
        { dog: "found", d: "done", do: "done" },
        "3 new nodes",
        "5 words stored",
      ),
    },
    {
      short: "Word or not",
      title: "Search: is 'ca' a word?",
      body: [
        "Walk the letters of the query. `c` exists, `a` exists, so the path is there. But the node `a` has no end mark, so `ca` is a prefix, not a stored word.",
        "Search succeeds only if the whole path exists and the final node is marked. If any letter is missing, the answer is no immediately.",
      ],
      metrics: [
        { label: "Nodes", value: "10" },
        { label: "Letters checked", value: "2" },
        { label: "Words", value: "5" },
        { label: "Cost", value: "O(L)", level: "good" },
      ],
      lines: [9, 10, 11, 13],
      scene: scene(
        trie(
          ALL,
          ALL_ENDS,
          { c: "active", ca: "warn" },
          "'ca': path exists",
          "but no end mark: not a word",
        ),
        ptr("q", "n-ca", "no end", { side: "left", tone: "warn" }),
      ),
    },
    {
      short: "Autocomplete",
      title: "Prefix search and autocomplete",
      body: [
        "To list words starting with `ca`, walk to the node for `ca` in two steps, then collect every end-marked node in the subtree below it: `car`, `cart` and `cat`.",
        "The cost is the prefix length plus the size of the answer. The words under `d` are never touched, no matter how many there are.",
      ],
      callout: {
        kind: "insight",
        text: "A hash set can answer 'is this a word?' fast but cannot list words by prefix. The trie's shape is what makes prefix questions cheap.",
      },
      metrics: [
        { label: "Letters checked", value: "2" },
        { label: "Words", value: "3 found", level: "good" },
        { label: "Cost", value: "O(p + k)", level: "good" },
      ],
      lines: [12, 14],
      scene: trie(
        ALL,
        ALL_ENDS,
        { c: "done", ca: "active", car: "found", cat: "found", cart: "found" },
        "prefix 'ca' →",
        "car  cart  cat",
      ),
    },
    {
      short: "Space vs speed",
      title: "The price: memory",
      body: [
        "A node usually stores a child slot per possible letter, 26 for lowercase English, mostly empty. Many nodes with few words can use far more memory than a plain list of the words.",
        "Compact variants help: store children in a small map, or compress chains of single-child nodes into one edge (a radix tree). Speed stays `O(L)`, memory drops.",
      ],
      callout: {
        kind: "tip",
        text: "Use a trie when prefix queries matter (autocomplete, spell check, routing tables). For plain membership tests a hash set is smaller and just as fast.",
      },
      metrics: [
        { label: "Nodes", value: "up to total letters", level: "warn" },
        { label: "Cost", value: "O(L), any n", level: "good" },
      ],
      scene: scene(
        label("t1", 320, 80, "time: O(L), independent of the number of words", {
          size: 14,
          weight: 800,
          tone: "good",
        }),
        label("t2", 320, 125, "space: up to one node per letter stored", {
          size: 14,
          weight: 800,
          tone: "warn",
        }),
        label("t3", 320, 170, "shared prefixes reduce the node count", { size: 14, weight: 800 }),
        label("t4", 320, 215, "fix: child maps or compressed edges", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "Recap",
      title: "When a trie fits",
      body: [
        "Insert and search walk one letter per step, so both are `O(L)`. An end-of-word mark separates stored words from mere prefixes, and a subtree walk lists all completions.",
        "Choose it for prefix-heavy work, and pay attention to memory. The word count never appears in the time cost.",
      ],
      metrics: [
        { label: "Words", value: "any" },
        { label: "Cost", value: "O(L)", level: "good" },
      ],
      scene: trie(
        ALL,
        ALL_ENDS,
        { car: "found", cat: "found", cart: "found", do: "found", dog: "found" },
        "5 words, 9 letter nodes",
        "O(L) per lookup",
      ),
    },
  ],
};
