import type { Lesson } from "../lib/types";

export const consistentHashing: Lesson = {
  id: "consistent-hashing",
  title: "Consistent Hashing",
  summary: "Spread keys over many servers so that adding or losing one moves only a small slice.",
  minutes: 10,
  level: "intermediate",
  goals: [
    "Why `hash(key) % N` breaks when N changes",
    "How a hash ring assigns keys to nodes",
    "What happens to keys when a node joins or dies",
    "Why virtual nodes even out the load",
    "A worked case: growing a cache from 3 to 4 nodes",
  ],
  takeaways: [
    "Modulo sharding remaps almost every key when the node count changes; a ring remaps only about 1/N of them.",
    "Each key belongs to the first node clockwise from its hash, so a join or a failure touches one neighbour.",
    "Virtual nodes (often 100 to 200 per server) smooth out uneven load and let big machines take bigger shares.",
  ],
  hud: [
    { label: "Nodes", icon: "server" },
    { label: "Keys moved", icon: "layers" },
    { label: "Cache hit", icon: "gauge" },
    { label: "Hottest node", icon: "alert" },
    { label: "Lookup", icon: "timer" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "clients", x: 100, y: 150 },
    { id: "rt", kind: "lb", label: "Router", x: 300, y: 150 },
    { id: "a", kind: "cache", label: "Node A", x: 440, y: 40 },
    { id: "b", kind: "cache", label: "Node B", x: 440, y: 150 },
    { id: "c", kind: "cache", label: "Node C", x: 440, y: 260 },
    { id: "d", kind: "cache", label: "Node D", x: 590, y: 40 },
  ],
  links: [
    { id: "yr", from: "you", to: "rt" },
    { id: "ra", from: "rt", to: "a" },
    { id: "rb", from: "rt", to: "b" },
    { id: "rc", from: "rt", to: "c" },
    { id: "rd", from: "rt", to: "d" },
  ],
  steps: [
    {
      short: "Sharding",
      title: "One cache is not enough",
      body: [
        "A single cache server runs out of memory long before your data set does, so you split the keys over several servers. A router has to answer one question quickly: which node holds this key?",
        "The obvious answer is `hash(key) % 3`. It is cheap, needs no lookup table, and spreads keys evenly. It works perfectly until the number of nodes changes.",
      ],
      callout: {
        kind: "insight",
        text: "The router and every client must agree on the mapping without talking to each other. That is why the mapping is a pure function of the key.",
      },
      metrics: [
        { label: "Nodes", value: "3", level: "good" },
        { label: "Cache hit", value: "95%", level: "good" },
        { label: "Lookup", value: "O(1)", level: "good" },
      ],
      scene: {
        show: ["you", "rt", "a", "b", "c"],
        hot: ["rt"],
        flows: [
          { link: "yr", label: "GET user:42" },
          { link: "rb", delay: 0.8, label: "hash % 3 = 1" },
        ],
        bubbles: { rt: "hash(key) % 3" },
        badges: { a: "keys 0", b: "keys 1", c: "keys 2" },
      },
    },
    {
      short: "Add a node",
      title: "Add one node and everything moves",
      body: [
        "Traffic grows, so you add a fourth node and the formula becomes `hash(key) % 4`. A key keeps its old home only when both remainders happen to match.",
        "Going from N to N+1 nodes, that is true for about `1/(N+1)` of the keys. So with 3 to 4 nodes, roughly 75% of all keys now point at a server that does not have them.",
      ],
      callout: {
        kind: "warn",
        text: "Every misrouted read is a cache miss that falls through to the database. Resizing a cache this way can look like an outage.",
      },
      metrics: [
        { label: "Nodes", value: "4", level: "good" },
        { label: "Keys moved", value: "75%", level: "bad" },
        { label: "Cache hit", value: "24%", level: "bad" },
        { label: "Lookup", value: "O(1)", level: "good" },
      ],
      scene: {
        show: ["you", "rt", "a", "b", "c", "d"],
        hot: ["d"],
        flows: [
          { link: "yr", label: "GET user:42" },
          { link: "rd", tone: "warn", delay: 0.8, label: "hash % 4 = 3: miss" },
        ],
        bubbles: { rt: "hash(key) % 4" },
        badges: { d: "empty, cold", b: "keys now orphaned" },
      },
    },
    {
      short: "The ring",
      title: "Hash onto a ring instead",
      body: [
        "Consistent hashing treats the hash space, say 0 to `2^32 - 1`, as a circle. Each node is hashed to a point on it, using something like its name or address.",
        "A key is hashed to a point too, and it belongs to the first node you meet walking clockwise. Nodes now own arcs of the ring rather than remainders.",
      ],
      callout: {
        kind: "tip",
        text: "Use a hash with good spread such as MurmurHash or xxHash. It does not need to be cryptographic, only uniform.",
      },
      metrics: [
        { label: "Nodes", value: "3", level: "good" },
        { label: "Keys moved", value: "0%", level: "good" },
        { label: "Cache hit", value: "95%", level: "good" },
      ],
      scene: {
        show: ["rt", "a", "b", "c"],
        hot: ["rt"],
        badges: {
          a: "ring pos 10",
          b: "ring pos 140",
          c: "ring pos 260",
          rt: "sorted list of positions",
        },
      },
    },
    {
      short: "Lookup",
      title: "Finding the owner of a key",
      body: [
        "The router keeps the node positions in a sorted array. To place `user:42`, it hashes the key to, say, 95 and binary-searches for the first position at or after it. That is node B at 140.",
        "If the hash is past the last position, the search wraps to the first one. The lookup costs `O(log N)` and needs no network call.",
      ],
      metrics: [
        { label: "Nodes", value: "3", level: "good" },
        { label: "Keys moved", value: "0%", level: "good" },
        { label: "Cache hit", value: "95%", level: "good" },
        { label: "Lookup", value: "O(log N)", level: "good" },
      ],
      scene: {
        show: ["you", "rt", "a", "b", "c"],
        hot: ["b"],
        flows: [
          { link: "yr", label: "GET user:42" },
          { link: "rb", delay: 0.8, label: "hash 95, next is 140" },
        ],
        bubbles: { rt: "hash(user:42) = 95" },
        badges: { b: "owns 11 to 140" },
      },
    },
    {
      short: "Join",
      title: "A node joins: only one arc moves",
      body: [
        "Node D is hashed to position 200, between B at 140 and C at 260. Only keys in the arc 141 to 200 used to go to C and now go to D. Every other key stays where it was.",
        "On average that is `1/N` of the data, about 25% here, and all of it comes from a single neighbour. D warms up by copying that arc from C, or simply by taking misses.",
      ],
      callout: {
        kind: "insight",
        text: "The cost of change is proportional to the data one node owns, not to the size of the whole cluster.",
      },
      metrics: [
        { label: "Nodes", value: "4", level: "good" },
        { label: "Keys moved", value: "25%", level: "warn" },
        { label: "Cache hit", value: "80%", level: "warn" },
        { label: "Lookup", value: "O(log N)", level: "good" },
      ],
      scene: {
        show: ["you", "rt", "a", "b", "c", "d"],
        hot: ["d", "c"],
        flows: [{ link: "rc", reverse: true, tone: "hand", label: "hand over arc 141 to 200" }],
        badges: { d: "ring pos 200", c: "gives up 25%" },
      },
    },
    {
      short: "Failure",
      title: "A node dies: its neighbour inherits",
      body: [
        "When node C crashes, the arc it owned now belongs to the next node clockwise. Keys on every other node are untouched, so most of the cache keeps serving hits.",
        "The inherited keys are cold and the successor suddenly holds about double its share. That spike is the cost of failure, but it is one node's worth, not the whole cluster's.",
      ],
      callout: {
        kind: "warn",
        text: "If the successor was already near capacity, the extra load can knock it over too and cause a cascade. Leave headroom.",
      },
      metrics: [
        { label: "Nodes", value: "3", level: "warn" },
        { label: "Keys moved", value: "33%", level: "warn" },
        { label: "Cache hit", value: "65%", level: "warn" },
        { label: "Hottest node", value: "2x share", level: "bad" },
      ],
      scene: {
        show: ["you", "rt", "a", "b", "c"],
        down: ["c"],
        hot: ["a"],
        flows: [{ link: "ra", tone: "warn", label: "C's keys now land here" }],
        badges: { a: "load doubled", c: "crashed" },
      },
    },
    {
      short: "Virtual nodes",
      title: "Fix uneven slices with virtual nodes",
      body: [
        "With only three points on a ring, the arcs are rarely equal. One unlucky node can own half the keys while another owns a sixth.",
        "The fix is to hash each server many times, for example `A#1`, `A#2` through `A#150`, giving 150 virtual nodes scattered around the ring. Load variance falls roughly with the square root of the number of virtual nodes.",
        "A server with twice the memory simply gets twice as many virtual nodes.",
      ],
      callout: {
        kind: "tip",
        text: "A failed server's load is also spread over many successors instead of one, which removes the doubling hot spot.",
      },
      metrics: [
        { label: "Nodes", value: "3 x 150", level: "good" },
        { label: "Keys moved", value: "~25%", level: "warn" },
        { label: "Cache hit", value: "95%", level: "good" },
        { label: "Hottest node", value: "+5%", level: "good" },
        { label: "Lookup", value: "O(log 450)", level: "good" },
      ],
      scene: {
        show: ["rt", "a", "b", "c"],
        hot: ["a", "b", "c"],
        badges: { a: "150 vnodes", b: "150 vnodes", c: "150 vnodes", rt: "450 points, sorted" },
      },
    },
    {
      short: "Cache case",
      title: "Case: growing a cache from 3 to 4 nodes",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A cache holds 1,000,000 hot keys and takes 20,000 reads per second at a 95% hit rate. The database can handle 3,000 reads per second.",
        "With modulo sharding, 750,000 keys move. The hit rate drops to about 25% and the database sees roughly 15,000 reads per second, five times what it can serve.",
        "With a ring and virtual nodes, about 250,000 keys move, the hit rate dips to roughly 80%, and the database sees 4,000 reads per second. That is a bad few minutes rather than an outage, and you can throttle the warm-up.",
      ],
      callout: {
        kind: "insight",
        text: "The ring does not remove the miss spike. It shrinks it to the size of one node's share, which a backing store can usually absorb.",
      },
      metrics: [
        { label: "Nodes", value: "3 to 4", level: "good" },
        { label: "Keys moved", value: "250k", level: "warn" },
        { label: "Cache hit", value: "80%", level: "warn" },
        { label: "Hottest node", value: "+8%", level: "good" },
      ],
      scene: {
        show: ["you", "rt", "a", "b", "c", "d"],
        hot: ["d"],
        flows: [
          { link: "rd", label: "warming: misses" },
          { link: "rd", reverse: true, tone: "res", delay: 0.8, label: "filled from DB" },
        ],
        badges: { rt: "DB sees 4k/s, not 15k/s", d: "250k keys inbound" },
      },
    },
    {
      short: "Recap",
      title: "Where it is used and what to remember",
      body: [
        "Dynamo-style stores such as Cassandra and Riak place data this way, as do memcached client libraries, CDN request routers and many load balancers that need sticky routing.",
        "For replication, store each key on the next 3 distinct servers clockwise from its position. Reading or writing a few of them then gives you fault tolerance for free.",
      ],
      callout: {
        kind: "tip",
        text: "Use it when the node set changes and moving data is expensive. For a fixed-size cluster, plain modulo is simpler and just as good.",
      },
      metrics: [
        { label: "Nodes", value: "N", level: "good" },
        { label: "Keys moved", value: "~1/N", level: "good" },
        { label: "Cache hit", value: "stays high", level: "good" },
        { label: "Hottest node", value: "even", level: "good" },
        { label: "Lookup", value: "O(log N)", level: "good" },
      ],
      scene: {
        show: ["you", "rt", "a", "b", "c", "d"],
        badges: { rt: "ring + vnodes", a: "~1/N", b: "~1/N", c: "~1/N", d: "~1/N" },
      },
    },
  ],
};
