import { cell, edge, frame, label, ptr, row, scene } from "../lib/scenes";
import type { AlgoLesson, Tone } from "../lib/types";

const SIZE = 7;
const sized = (t: (string | null)[]) => t.concat(Array(SIZE - t.length).fill(null));

/** Bucket array with stable ids a0..a6. */
function buckets(table: (string | null)[], tones: Record<number, Tone> = {}, y = 110) {
  const t = sized(table);
  return row(
    t.map((v) => v ?? ""),
    { y, index: true, tones, empty: t.flatMap((v, i) => (v === null ? [i] : [])) },
  );
}

/** Chain nodes hanging under a bucket (separate chaining). */
function chain(bucket: number, keys: string[], tones: Record<number, Tone> = {}) {
  const x = 320 - (SIZE * 60 - 8) / 2 + 26 + bucket * 60;
  return keys.flatMap((k, i) => [
    edge(`ce${bucket}-${i}`, i === 0 ? `a${bucket}` : `c${bucket}-${i - 1}`, `c${bucket}-${i}`, {
      arrow: "end",
    }),
    cell(`c${bucket}-${i}`, x, 190 + i * 62, k, { tone: tones[i] }),
  ]);
}

const CAPTION = (t: string, y = 50) => label("cap", 320, y, t, { size: 14, weight: 800 });

export const collisionHandling: AlgoLesson = {
  id: "collision-handling",
  title: "Collision Handling",
  summary: "Two keys, one bucket: chaining and linear probing keep both, at different costs.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "Why collisions are unavoidable",
    "How separate chaining stores colliding keys",
    "How open addressing with linear probing finds a free slot",
    "Why clustering hurts and why deletion needs a tombstone",
  ],
  takeaways: [
    "Collisions are certain once there are more keys than buckets, so every hash table needs a plan for them.",
    "Chaining hangs a list off each bucket; linear probing steps to the next free slot and keeps everything in the array.",
    "With open addressing, a deleted slot must become a tombstone, or later probes stop too early and miss keys.",
  ],
  hud: [
    { label: "Items", icon: "list" },
    { label: "Probes", icon: "search" },
    { label: "Chain length", icon: "link" },
    { label: "Cost", icon: "timer" },
  ],
  pseudocode: [
    "put_chain(key):",
    "    i = hash(key) % size",
    "    append key to chain[i]",
    "get_chain(key):",
    "    for node in chain[hash(key) % size]:",
    "        if node == key: return true",
    "put_probe(key):",
    "    i = hash(key) % size",
    "    while slot[i] is taken:",
    "        i = (i + 1) % size",
    "    slot[i] = key",
    "remove_probe(key):",
    "    mark slot[i] as tombstone, never empty",
  ],
  steps: [
    {
      short: "Collision",
      title: "Two keys, one bucket",
      body: [
        "`ant` hashes to `17`, and `17 % 7 = 3`. Now `bee` hashes to `24`, and `24 % 7 = 3` too. Both want bucket `3`.",
        "Seven buckets cannot give every possible key its own slot, so this will happen. The question is what to do when it does.",
      ],
      callout: {
        kind: "insight",
        text: "A collision is not a bug in the hash function. It is a guarantee of the pigeonhole principle.",
      },
      metrics: [{ label: "Items", value: "1" }],
      lines: [2],
      scene: scene(
        buckets(
          ["", "", "", "ant"].map((v) => v || null),
          { 3: "warn" },
        ),
        CAPTION("insert bee: 24 % 7 = 3, already taken"),
        ptr("p", "a3", "bee wants this", { tone: "warn", side: "below" }),
      ),
    },
    {
      short: "Chaining",
      title: "Chaining: a list per bucket",
      body: [
        "Separate chaining lets each bucket hold a small linked list. `bee` is simply added to the chain at bucket `3`, after `ant`.",
        "Nothing else moves. The table never runs out of room; the chains just grow.",
      ],
      metrics: [
        { label: "Items", value: "2" },
        { label: "Chain length", value: "2", level: "good" },
      ],
      lines: [1, 2, 3],
      scene: scene(
        buckets(
          ["", "", "", "ant"].map((v) => v || null),
          { 3: "done" },
        ),
        chain(3, ["bee"], { 0: "found" }),
        CAPTION("chaining: bucket 3 now holds ant, then bee"),
      ),
    },
    {
      short: "Chain lookup",
      title: "Lookup walks the chain",
      body: [
        "To find `cow`, hash to its bucket, then compare against each node on the chain until one matches or the chain ends. Here the walk visits `ant` then `bee`.",
        "Cost is the chain length. With evenly spread keys chains stay short, so the average is still O(1); in the worst case all keys share one chain and it is O(n).",
      ],
      callout: {
        kind: "warn",
        text: "A poor hash function turns every chain into one long list, and the table into a linked list.",
      },
      metrics: [
        { label: "Probes", value: "2", level: "warn" },
        { label: "Chain length", value: "2", level: "good" },
        { label: "Cost", value: "O(len)" },
      ],
      lines: [4, 5, 6],
      scene: scene(
        buckets(
          ["", "", "", "ant"].map((v) => v || null),
          { 3: "done" },
        ),
        chain(3, ["bee"], { 0: "muted", 1: "found" }),
        CAPTION("get(bee): ant is not bee, next, bee matches"),
      ),
    },
    {
      short: "Probing",
      title: "Open addressing: step to the next slot",
      body: [
        "The other approach keeps everything inside the array. If bucket `3` is full, try `3 + 1`, then `3 + 2`, and so on, wrapping around the end. This is linear probing.",
        "`bee` finds bucket `3` taken, then bucket `4` free, and settles there. The sequence of slots checked is the probe sequence.",
      ],
      metrics: [
        { label: "Items", value: "2" },
        { label: "Probes", value: "2", level: "good" },
      ],
      lines: [8, 9, 10, 11],
      scene: scene(
        buckets(
          ["", "", "", "ant", "bee"].map((v) => v || null),
          { 3: "warn", 4: "found" },
        ),
        CAPTION("probe 3 (taken), probe 4 (free): bee goes to 4"),
        ptr("p", "a4", "free", { tone: "found" }),
      ),
    },
    {
      short: "Probe more",
      title: "Probe sequences get longer",
      body: [
        "Add `cow`, which hashes to `11`, so `11 % 7 = 4`. Slot `4` holds `bee`, so `cow` moves on to slot `5`.",
        "Notice that `cow` did not even hash to the neighbourhood of `ant`, yet it had to step past `bee`. Keys with different homes now compete for the same slots.",
      ],
      metrics: [
        { label: "Items", value: "3" },
        { label: "Probes", value: "2", level: "good" },
      ],
      lines: [9, 10, 11],
      scene: scene(
        buckets(
          ["", "", "", "ant", "bee", "cow"].map((v) => v || null),
          { 4: "warn", 5: "found" },
        ),
        CAPTION("cow: 11 % 7 = 4 is taken, so it lands in 5"),
        ptr("p", "a5", "free", { tone: "found" }),
      ),
    },
    {
      short: "Clustering",
      title: "Clusters snowball",
      body: [
        "Slots `3`, `4` and `5` now form a cluster. Any key that hashes into the cluster must walk to its end, and then it extends the cluster by one more.",
        "That is primary clustering: long runs of full slots make probes longer, which makes runs longer still. It is why open addressing needs the table kept fairly empty.",
      ],
      callout: {
        kind: "insight",
        text: "Chaining degrades gently as it fills. Linear probing degrades sharply near full.",
      },
      metrics: [
        { label: "Items", value: "3" },
        { label: "Probes", value: "3", level: "warn" },
      ],
      lines: [9, 10],
      scene: scene(
        buckets(
          ["", "", "", "ant", "bee", "cow"].map((v) => v || null),
          {
            3: "mark",
            4: "mark",
            5: "mark",
          },
        ),
        frame("cl", 130, 80, 200, 66, "cluster", { tone: "warn" }),
        CAPTION("a key hashing to 3, 4 or 5 must probe to slot 6"),
      ),
    },
    {
      short: "Bad delete",
      title: "Deleting by emptying breaks lookups",
      body: [
        "Remove `bee` by simply blanking slot `4`. Now look up `cow`: its home is slot `4`, which is empty, so the search stops and reports 'not found'.",
        "But `cow` is sitting in slot `5`. Probing relies on an unbroken run from a key's home to its position, and the blank cut that run.",
      ],
      callout: {
        kind: "warn",
        text: "In open addressing, an empty slot means 'nothing was ever placed past here'. Never create one by deleting.",
      },
      metrics: [
        { label: "Items", value: "2" },
        { label: "Probes", value: "1", level: "bad" },
      ],
      lines: [12, 13],
      scene: scene(
        buckets(
          ["", "", "", "ant", "", "cow"].map((v) => v || null),
          { 4: "warn", 5: "muted" },
        ),
        CAPTION("get(cow): slot 4 is empty, so stop: wrong answer"),
        ptr("p", "a4", "stops here", { tone: "warn" }),
      ),
    },
    {
      short: "Tombstone",
      title: "A tombstone keeps the run intact",
      body: [
        "Instead of emptying slot `4`, mark it as a tombstone: 'a key was here, keep probing'. Lookups pass over it, so `get(cow)` continues to slot `5` and finds it.",
        "An insert may reuse a tombstone, and a rebuild of the table clears them all. Chaining avoids this issue because removing a node from a list leaves no gap.",
      ],
      metrics: [
        { label: "Items", value: "2" },
        { label: "Probes", value: "2", level: "good" },
      ],
      lines: [12, 13],
      scene: scene(
        buckets(
          ["", "", "", "ant", "x", "cow"].map((v) => v || null),
          { 4: "muted", 5: "found" },
        ),
        CAPTION("x = tombstone: get(cow) passes slot 4, finds it at 5"),
        ptr("p", "a5", "found cow", { tone: "found" }),
      ),
    },
    {
      short: "Compare",
      title: "Chaining versus probing",
      body: [
        "Chaining is simple, tolerates a full table and makes deletion easy, at the price of a pointer per node. Probing is compact and cache friendly but needs a low load and tombstones.",
        "Either way, collisions only stay cheap if the table is not too full, which is what resizing keeps in check.",
      ],
      metrics: [{ label: "Cost", value: "O(1) avg", level: "good" }],
      scene: scene(
        label("l1", 320, 80, "chaining: list per bucket, easy delete, extra pointers", {
          size: 13,
          weight: 800,
        }),
        label("l2", 320, 130, "probing: all in the array, needs tombstones, clusters", {
          size: 13,
          weight: 800,
        }),
        label("l3", 320, 200, "both need a low load factor to stay O(1)", {
          size: 13,
          tone: "good",
        }),
      ),
    },
  ],
};
