import { label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson } from "../lib/types";
import type { Tone } from "../lib/types";

const SIZE = 7;

/** The bucket array: `null` is an empty bucket. Cell ids are a0..a6 so entries slide between steps. */
function buckets(table: (string | null)[], tones: Record<number, Tone> = {}) {
  return row(
    table.map((v) => v ?? ""),
    {
      y: 170,
      index: true,
      tones,
      empty: table.flatMap((v, i) => (v === null ? [i] : [])),
    },
  );
}

const EMPTY: (string | null)[] = Array(SIZE).fill(null);
const FILLED: (string | null)[] = [null, "dog", "fox", "cat", null, "owl", null];

export const hashTables: AlgoLesson = {
  id: "hash-tables",
  title: "Hash Tables",
  summary: "Turn a key into an array index so lookups, inserts and deletes take O(1) on average.",
  minutes: 12,
  level: "beginner",
  goals: [
    "How a key becomes a bucket index",
    "Why insert, lookup and delete are O(1) on average",
    "What a hash function must do",
    "Why the table is an array underneath",
  ],
  takeaways: [
    "A hash table turns a key into an index with `hash(key) % size`, then jumps straight to that bucket.",
    "Insert, lookup and delete are O(1) on average because they touch one bucket instead of scanning everything.",
    "A good hash function is deterministic, fast and spreads keys evenly; the O(1) promise depends on it.",
  ],
  hud: [
    { label: "Buckets", icon: "grid" },
    { label: "Items", icon: "list" },
    { label: "Steps", icon: "swap" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "put(key):",
    "    i = hash(key) % size",
    "    table[i] = key",
    "get(key):",
    "    i = hash(key) % size",
    "    return table[i] == key",
    "remove(key):",
    "    i = hash(key) % size",
    "    if table[i] == key: table[i] = empty",
  ],
  steps: [
    {
      short: "The problem",
      title: "Finding a key without searching",
      body: [
        "Suppose you store pet names and need to ask 'is `dog` in here?'. A list makes you check every entry, which is O(n).",
        "A hash table answers by computing where `dog` must live and looking only there. Below is its backbone: an array of 7 empty buckets.",
      ],
      metrics: [
        { label: "Buckets", value: "7" },
        { label: "Items", value: "0", level: "good" },
      ],
      scene: scene(
        buckets(EMPTY),
        label("cap", 320, 90, "7 buckets, all empty", { size: 13, weight: 800 }),
      ),
    },
    {
      short: "Hash it",
      title: "Key to hash to index",
      body: [
        "A hash function turns any key into a big integer. Say `hash('cat')` gives `17`.",
        "That number is too large to be an index, so we fold it into range: `17 % 7 = 3`. The key `cat` belongs in bucket `3`.",
      ],
      callout: {
        kind: "insight",
        text: "The same key always produces the same hash, so you can recompute its home at any time.",
      },
      metrics: [
        { label: "Steps", value: "2" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [2],
      scene: scene(
        buckets(EMPTY, { 3: "active" }),
        label("eq", 320, 70, 'hash("cat") = 17    17 % 7 = 3', { size: 14, weight: 800 }),
        ptr("home", "a3", "cat goes here", { tone: "active" }),
      ),
    },
    {
      short: "Insert cat",
      title: "Insert writes one bucket",
      body: [
        "`put('cat')` computes the index and stores the key in bucket `3`. Nothing else in the table moves or is read.",
      ],
      metrics: [
        { label: "Items", value: "1", level: "good" },
        { label: "Steps", value: "1" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [1, 2, 3],
      scene: scene(
        buckets([null, null, null, "cat", null, null, null], { 3: "found" }),
        label("eq", 320, 70, "17 % 7 = 3", { size: 14, weight: 800 }),
      ),
    },
    {
      short: "More keys",
      title: "Other keys find other buckets",
      body: [
        "`dog` hashes to `22`, and `22 % 7 = 1`. `fox` hashes to `30`, so bucket `2`. `owl` hashes to `12`, so bucket `5`.",
        "The keys land in an order that has nothing to do with when they arrived. A hash table does not keep insertion order.",
      ],
      metrics: [
        { label: "Items", value: "4", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [2, 3],
      scene: scene(
        buckets(FILLED, { 1: "done", 2: "done", 3: "done", 5: "done" }),
        label("eq", 320, 70, "dog: 22 % 7 = 1    fox: 30 % 7 = 2    owl: 12 % 7 = 5", {
          size: 13,
          weight: 800,
        }),
      ),
    },
    {
      short: "Lookup",
      title: "Lookup repeats the same math",
      body: [
        "To find `dog`, hash it again: `22 % 7 = 1`. Go to bucket `1` and compare. It matches, so `dog` is present.",
        "One hash and one comparison. The other buckets are never opened, no matter how many there are.",
      ],
      metrics: [
        { label: "Steps", value: "2" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [4, 5, 6],
      scene: scene(
        buckets(FILLED, { 1: "found" }),
        label("eq", 320, 70, "get(dog): 22 % 7 = 1", { size: 14, weight: 800 }),
        ptr("home", "a1", "found dog", { tone: "found" }),
      ),
    },
    {
      short: "Miss",
      title: "A missing key ends at an empty bucket",
      body: [
        "Look up `emu`, which hashes to `11`. `11 % 7 = 4`, and bucket `4` is empty. If `emu` had been inserted it would be there, so it was not.",
      ],
      callout: {
        kind: "tip",
        text: "A miss is as cheap as a hit: one hash, one bucket, done.",
      },
      metrics: [
        { label: "Steps", value: "2" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [5, 6],
      scene: scene(
        buckets(FILLED, { 4: "warn" }),
        label("eq", 320, 70, "get(emu): 11 % 7 = 4, empty", { size: 14, weight: 800 }),
        ptr("home", "a4", "not found", { tone: "warn" }),
      ),
    },
    {
      short: "Delete",
      title: "Delete clears the bucket",
      body: [
        "`remove('owl')` hashes to bucket `5`, checks the key matches and empties the slot. Again only one bucket is touched.",
        "This is the easy case. When two keys can share a bucket, deleting needs more care, which the next lesson covers.",
      ],
      metrics: [
        { label: "Items", value: "3", level: "good" },
        { label: "Cost", value: "O(1)", level: "good" },
      ],
      lines: [7, 8, 9],
      scene: scene(
        buckets([null, "dog", "fox", "cat", null, null, null], {
          5: "muted",
          1: "done",
          2: "done",
          3: "done",
        }),
        label("eq", 320, 70, "remove(owl): bucket 5 cleared", { size: 14, weight: 800 }),
        ptr("home", "a5", "now empty", { tone: "muted" }),
      ),
    },
    {
      short: "Good hash",
      title: "What makes a good hash function",
      body: [
        "It must be deterministic (same key, same number), fast to compute, and it should spread keys evenly. If every key hashed to `3`, all of them would pile into one bucket and lookups would degrade to O(n).",
        "So the O(1) cost is an average, true when the hash is well spread and the table is not too full. Both properties come back in the next lessons.",
      ],
      callout: {
        kind: "warn",
        text: "Never use a value that changes (such as a mutable object's contents) as a key: its hash changes and the key is lost.",
      },
      metrics: [
        { label: "Items", value: "3", level: "good" },
        { label: "Cost", value: "O(1) avg", level: "good" },
      ],
      lines: [2],
      scene: scene(
        buckets([null, "dog", "fox", "cat", null, null, null], { 1: "done", 2: "done", 3: "done" }),
        label("g1", 320, 70, "deterministic  +  fast  +  evenly spread", { size: 14, weight: 800 }),
        label("g2", 320, 260, "even spread = short buckets = O(1)", { size: 13, tone: "good" }),
      ),
    },
  ],
};
