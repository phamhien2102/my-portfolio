import { cell, edge, label, ptr, scene } from "../lib/scenes";
import type { AlgoLesson, Item, Tone } from "../lib/types";

const KEYS = ["A", "B", "C", "D"];
const SLOT_X: Record<string, number> = { A: 170, B: 270, C: 370, D: 470 };
const LIST_Y = 110;
const MAP_Y = 250;
const W = 52;
const GAP = 34;

interface View {
  /** Keys in the list, most recently used first. */
  order: string[];
  /** Keys that are present in the map. */
  inMap: string[];
  /** A node drawn off the list (being moved or evicted). */
  detached?: { key: string; tone: Tone };
  active?: string;
  tones?: Record<string, Tone>;
  mapTones?: Record<string, Tone>;
  note?: string;
  noteTone?: "ink" | "muted" | "warn" | "good";
}

const VALS: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
const text = (k: string) => `${k}:${VALS[k]}`;

function view(v: View) {
  const items: Item[] = [];
  const n = v.order.length;
  const xs = v.order.map((_, i) => 320 - ((n * W + (n - 1) * GAP) / 2 - W / 2) + i * (W + GAP));
  // list arrows (two-way)
  for (let i = 1; i < n; i++)
    items.push(edge(`le${i}`, `n${v.order[i - 1]}`, `n${v.order[i]}`, { arrow: "both" }));
  v.order.forEach((k, i) => {
    items.push(
      cell(`n${k}`, xs[i], LIST_Y, text(k), {
        w: W,
        h: 44,
        tone: v.tones?.[k] ?? (v.active === k ? "active" : undefined),
      }),
    );
  });
  if (v.detached) {
    items.push(
      cell(`n${v.detached.key}`, 320, 40, text(v.detached.key), {
        w: W,
        h: 44,
        tone: v.detached.tone,
      }),
    );
  }
  // hash map slots
  for (const k of KEYS) {
    const present = v.inMap.includes(k);
    items.push(
      cell(`m${k}`, SLOT_X[k], MAP_Y, present ? k : "", {
        w: 44,
        h: 36,
        tone: v.mapTones?.[k] ?? (present ? "plain" : "ghost"),
      }),
    );
    const nodeThere = v.order.includes(k) || v.detached?.key === k;
    if (present && nodeThere)
      items.push(
        edge(`me${k}`, `m${k}`, `n${k}`, {
          dashed: true,
          tone: v.active === k ? "active" : "muted",
        }),
      );
  }
  items.push(
    label("maplabel", 320, MAP_Y + 38, "hash map: key → node", { size: 12, tone: "muted" }),
  );
  if (n > 0) {
    items.push(ptr("mru", `n${v.order[0]}`, "head: newest", { side: "below", tone: "found" }));
    items.push(ptr("lru", `n${v.order[n - 1]}`, "tail: oldest", { side: "below", tone: "warn" }));
  }
  if (v.note)
    items.push(label("note", 320, 205, v.note, { size: 13, weight: 800, tone: v.noteTone }));
  return scene(items);
}

export const lruCache: AlgoLesson = {
  id: "lru-cache",
  title: "LRU Cache",
  summary:
    "A hash map and a doubly linked list give O(1) get and put and always evict the stalest key.",
  minutes: 14,
  level: "advanced",
  goals: [
    "What least recently used eviction means",
    "Why a map alone or a list alone is too slow",
    "How get moves a node to the front of the list",
    "How put evicts the tail when the cache is full",
    "Why both operations are O(1)",
  ],
  takeaways: [
    "An LRU cache keeps a hash map for O(1) lookup and a doubly linked list that orders keys from most to least recently used.",
    "Every get or put moves the touched node to the head, so the tail is always the key to evict.",
    "Because the map hands you the node and the list can unlink and relink it in constant time, both get and put are O(1).",
  ],
  hud: [
    { label: "Cached", icon: "database" },
    { label: "Last op", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "get(key):",
    "    if key not in map: return -1",
    "    node = map[key]",
    "    unlink(node)",
    "    push_front(node)",
    "    return node.value",
    "put(key, value):",
    "    if key in map: update it, move to front, return",
    "    if size == capacity:",
    "        evict tail node and delete its key from map",
    "    node = new node(key, value); push_front(node)",
    "    map[key] = node",
  ],
  steps: [
    {
      short: "The rule",
      title: "Evict what you used longest ago",
      body: [
        "A cache has room for a fixed number of entries, here 3. When it is full and a new key arrives, something must go. The least recently used rule drops the key that has gone untouched the longest.",
        "We need `get(key)` and `put(key, value)` to both run in `O(1)`, which no single simple structure can do.",
      ],
      metrics: [
        { label: "Cached", value: "0 of 3" },
        { label: "Cost", value: "goal: O(1)" },
      ],
      scene: scene(
        label("t1", 320, 80, "capacity = 3", { size: 15, weight: 800 }),
        label("t2", 320, 130, "get(key)  →  O(1)", { size: 14 }),
        label("t3", 320, 170, "put(key, value)  →  O(1), evict the oldest when full", { size: 14 }),
      ),
    },
    {
      short: "Two parts",
      title: "A map for lookup, a list for order",
      body: [
        "A hash map finds any key in `O(1)` but knows nothing about recency. A list can keep recency order but needs a walk to find a key.",
        "So we use both. The list runs from the newest key at the head to the oldest at the tail, and each map entry points straight at its node. Here three puts left the order `C, B, A`.",
      ],
      callout: {
        kind: "insight",
        text: "The map answers 'where is this key?'. The list answers 'which key is oldest?'. Each covers the other's weakness.",
      },
      metrics: [
        { label: "Cached", value: "3 of 3" },
        { label: "Last op", value: "put C" },
      ],
      scene: view({ order: ["C", "B", "A"], inMap: ["A", "B", "C"] }),
    },
    {
      short: "get A",
      title: "get(A): the map jumps to the node",
      body: [
        "`get(A)` asks the map for `A` and receives the node directly, with no walk. We can return its value `1` already.",
        "But `A` was the oldest key and has just been used, so its place in the order must change.",
      ],
      metrics: [
        { label: "Cached", value: "3 of 3" },
        { label: "Last op", value: "get A → 1" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [3, 6],
      scene: view({
        order: ["C", "B", "A"],
        inMap: ["A", "B", "C"],
        active: "A",
        mapTones: { A: "active" },
      }),
    },
    {
      short: "Unlink",
      title: "Unlink the node from its spot",
      body: [
        "Because the list is doubly linked, `A` knows its own neighbour. We set `B.next = null`, the new tail, and `A` is free. No other node was searched or shifted.",
        "A singly linked list could not do this, because it would have to walk to find the node before `A`.",
      ],
      metrics: [
        { label: "Cached", value: "3 of 3" },
        { label: "Last op", value: "unlink A" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [4],
      scene: view({
        order: ["C", "B"],
        inMap: ["A", "B", "C"],
        detached: { key: "A", tone: "active" },
        active: "A",
        mapTones: { A: "active" },
      }),
    },
    {
      short: "To the front",
      title: "Relink it at the head",
      body: [
        "Link `A` in front of `C` and make it the head. The order is now `A, C, B`, and `B` has become the oldest.",
        "Moving a known node to the front is a fixed handful of pointer writes: `O(1)`.",
      ],
      metrics: [
        { label: "Cached", value: "3 of 3" },
        { label: "Last op", value: "A → head" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [5],
      scene: view({
        order: ["A", "C", "B"],
        inMap: ["A", "B", "C"],
        tones: { A: "found" },
      }),
    },
    {
      short: "put D: full",
      title: "put(D, 4) on a full cache",
      body: [
        "The cache already holds 3 keys, so adding `D` means evicting one first. The oldest is at the tail: `B`.",
        "We unlink the tail node, and we also delete its key from the map.",
      ],
      callout: {
        kind: "warn",
        text: "Remove the key from the map too. If you only unlink the node, the map keeps a stale entry pointing at a dead node.",
      },
      metrics: [
        { label: "Cached", value: "2 of 3" },
        { label: "Last op", value: "evict B" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [9, 10],
      scene: view({
        order: ["A", "C"],
        inMap: ["A", "B", "C"],
        detached: { key: "B", tone: "warn" },
        mapTones: { B: "warn" },
        note: "evict the tail",
        noteTone: "warn",
      }),
    },
    {
      short: "Insert D",
      title: "Insert the new key at the head",
      body: [
        "Create a node for `D`, put it at the head, and add `D` to the map. The order is now `D, A, C`, and the cache is full again.",
        "A new key is the most recently used one, so it always goes to the head.",
      ],
      metrics: [
        { label: "Cached", value: "3 of 3" },
        { label: "Last op", value: "put D" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [11, 12],
      scene: view({
        order: ["D", "A", "C"],
        inMap: ["A", "C", "D"],
        tones: { D: "found" },
        mapTones: { D: "found" },
      }),
    },
    {
      short: "Why O(1)",
      title: "Every piece is constant time",
      body: [
        "`get` is one map lookup, one unlink and one relink. `put` is one lookup, at most one eviction (unlink the tail, delete a map entry) and one insert at the head.",
        "None of it depends on how many keys are cached. Updating an existing key works the same way: change its value and move it to the head.",
      ],
      callout: {
        kind: "tip",
        text: "In interviews, state both halves: the map gives O(1) access, the doubly linked list gives O(1) reordering.",
      },
      metrics: [
        { label: "Cached", value: "3 of 3" },
        { label: "Cost", value: "O(1) each", level: "good" },
      ],
      scene: scene(
        label("w1", 320, 70, "get:  map lookup + move to head", { size: 14, weight: 800 }),
        label("w2", 320, 115, "put:  map lookup + (evict tail) + insert at head", {
          size: 14,
          weight: 800,
        }),
        label("w3", 320, 175, "no step depends on the number of cached keys", {
          size: 13,
          tone: "good",
          weight: 800,
        }),
      ),
    },
    {
      short: "Recap",
      title: "The whole design",
      body: [
        "Hash map: key to node, for `O(1)` lookup. Doubly linked list: head newest, tail oldest, for `O(1)` reorder and evict. Space is `O(capacity)`.",
        "A miss on `get` returns a sentinel such as `-1` and changes nothing. Keep map and list in step: every unlink also fixes the map when it is an eviction.",
      ],
      metrics: [
        { label: "Cached", value: "3 of 3" },
        { label: "Cost", value: "O(1) each", level: "good" },
      ],
      scene: view({ order: ["D", "A", "C"], inMap: ["A", "C", "D"], tones: { D: "found" } }),
    },
  ],
};
