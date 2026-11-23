import type { Lesson } from "../lib/types";

export const uniqueIds: Lesson = {
  id: "unique-ids",
  title: "Unique IDs at Scale",
  summary:
    "Generate millions of unique, roughly time-ordered IDs per second without a single bottleneck.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "Why a single auto-increment column stops working",
    "How UUIDs trade coordination for size and index cost",
    "How a ticket server hands out ranges of IDs",
    "The bit layout of a Snowflake-style ID",
    "Clock and machine-ID failure modes, plus a sizing case",
  ],
  takeaways: [
    "Pick IDs by four needs: uniqueness, sortability, size, and how little coordination they require.",
    "A Snowflake-style ID packs time, machine and sequence into 64 bits, so each server mints IDs alone.",
    "Time-based schemes are only as safe as your clocks and your machine-ID assignment, so guard both.",
  ],
  hud: [
    { label: "Throughput", icon: "gauge" },
    { label: "ID size", icon: "database" },
    { label: "Coordination", icon: "link" },
    { label: "Sortable", icon: "layers" },
    { label: "Collision risk", icon: "alert" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "clients", x: 100, y: 150 },
    { id: "a1", kind: "server", label: "App 1", x: 300, y: 40 },
    { id: "a2", kind: "server", label: "App 2", x: 300, y: 150 },
    { id: "a3", kind: "server", label: "App 3", x: 300, y: 260 },
    { id: "db", kind: "db", label: "Database", x: 480, y: 150 },
    { id: "ids", kind: "service", label: "ID Service", x: 480, y: 40 },
  ],
  links: [
    { id: "y1", from: "you", to: "a1" },
    { id: "y2", from: "you", to: "a2" },
    { id: "y3", from: "you", to: "a3" },
    { id: "a1d", from: "a1", to: "db" },
    { id: "a2d", from: "a2", to: "db" },
    { id: "a3d", from: "a3", to: "db" },
    { id: "a1i", from: "a1", to: "ids" },
    { id: "a2i", from: "a2", to: "ids" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Every row needs a name",
      body: [
        "Orders, messages and posts each need an ID that no other row will ever share. On one database that is trivial: an auto-increment column hands out 1, 2, 3.",
        "Once many app servers create rows at the same time, possibly in different data centers, you need IDs that are unique, cheap to produce, and ideally sortable by creation time. Many systems also want them to fit in 64 bits.",
      ],
      callout: {
        kind: "insight",
        text: "Sortable IDs are more useful than they sound: `ORDER BY id` becomes `ORDER BY created_at`, and range scans stay cheap.",
      },
      metrics: [
        { label: "Throughput", value: "50k / s", level: "warn" },
        { label: "ID size", value: "64 bit", level: "good" },
        { label: "Sortable", value: "wanted", level: "warn" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3"],
        hot: ["a1", "a2", "a3"],
        flows: [
          { link: "y1", label: "create order" },
          { link: "y2", label: "create order" },
          { link: "y3", label: "create order" },
        ],
        bubbles: { a1: "id = ?", a2: "id = ?", a3: "id = ?" },
      },
    },
    {
      short: "Auto-increment",
      title: "One database counter",
      body: [
        "Let the database allocate IDs. It is simple and perfectly ordered, but every insert now waits on one counter, and one machine is the single point of failure for creating anything.",
        "A common patch is several primary databases that each step by the number of servers: server 1 issues 1, 4, 7, server 2 issues 2, 5, 8, and server 3 issues 3, 6, 9. It scales writes a little, but adding a fourth server means changing the step, and IDs are no longer ordered by time across servers.",
      ],
      callout: {
        kind: "warn",
        text: "Pure auto-increment IDs also leak your volume: anyone can read your order count off the next ID.",
      },
      metrics: [
        { label: "Throughput", value: "~5k / s", level: "bad" },
        { label: "ID size", value: "64 bit", level: "good" },
        { label: "Coordination", value: "central", level: "bad" },
        { label: "Sortable", value: "per server", level: "warn" },
        { label: "Collision risk", value: "none", level: "good" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3", "db"],
        hot: ["db"],
        flows: [
          { link: "a1d", label: "next id?" },
          { link: "a2d", label: "next id?" },
          { link: "a3d", label: "next id?" },
        ],
        badges: { db: "one counter, one bottleneck" },
      },
    },
    {
      short: "UUID",
      title: "UUIDs need no coordination",
      body: [
        "A random UUID (version 4) has 122 random bits. Any server can mint one on its own. You would need about 2.7 quintillion of them before a collision reaches 50%, so in practice they never clash.",
        "The costs are size and locality: 16 bytes instead of 8, and no ordering. Random keys land all over a B-tree index, which causes page splits and cache misses on every insert.",
      ],
      callout: {
        kind: "tip",
        text: "Newer time-ordered formats such as UUIDv7 and ULID put a millisecond timestamp in the high bits. They keep the no-coordination property and fix most of the index problem.",
      },
      metrics: [
        { label: "Throughput", value: "unlimited", level: "good" },
        { label: "ID size", value: "128 bit", level: "warn" },
        { label: "Coordination", value: "none", level: "good" },
        { label: "Sortable", value: "no (v4)", level: "bad" },
        { label: "Collision risk", value: "~0", level: "good" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3"],
        hot: ["a2"],
        bubbles: {
          a1: "3f2b9c1e-7a40-4d1b",
          a2: "c91d02aa-18e6-47f3",
          a3: "0be47d55-a3c2-4e89",
        },
        badges: { a2: "16 bytes, random order" },
      },
    },
    {
      short: "Ticket server",
      title: "A ticket server hands out ranges",
      body: [
        "A small dedicated service owns the counter. Instead of one ID per call, each app server asks for a block, say 1,000 IDs, and then hands them out locally from memory.",
        "That is one network call per thousand IDs, so the service rarely sees traffic. If an app crashes, the unused part of its block is simply skipped, which leaves gaps but never duplicates.",
      ],
      callout: {
        kind: "warn",
        text: "The service is still a single point of failure, and it must persist the high-water mark before replying. Run two of them with different offsets, or put them on a replicated store.",
      },
      metrics: [
        { label: "Throughput", value: "100k+ / s", level: "good" },
        { label: "ID size", value: "64 bit", level: "good" },
        { label: "Coordination", value: "1 call / 1k", level: "warn" },
        { label: "Sortable", value: "roughly", level: "warn" },
        { label: "Collision risk", value: "none", level: "good" },
      ],
      scene: {
        show: ["you", "a1", "a2", "ids"],
        hot: ["ids"],
        flows: [
          { link: "a1i", label: "give me 1000" },
          { link: "a1i", reverse: true, tone: "res", delay: 0.8, label: "block 5000 to 5999" },
          { link: "a2i", delay: 0.4 },
        ],
        badges: { ids: "high-water mark: 6000" },
      },
    },
    {
      short: "Snowflake",
      title: "Snowflake: pack time, machine and sequence",
      body: [
        "Twitter's Snowflake design builds a 64-bit ID with no network call at all. It spends the bits as 1 unused sign bit, 41 bits of millisecond timestamp, 10 bits of machine ID, and 12 bits of sequence.",
        "The timestamp counts milliseconds from a custom epoch, so 41 bits last about 69 years. 10 bits allow 1,024 machines, and 12 bits allow 4,096 IDs per machine per millisecond, which is about 4 million per second per machine.",
      ],
      callout: {
        kind: "insight",
        text: "Because the timestamp is in the top bits, IDs sort by time across all machines to within clock skew, and inserts append at the right edge of the index.",
      },
      metrics: [
        { label: "Throughput", value: "4M / s each", level: "good" },
        { label: "ID size", value: "64 bit", level: "good" },
        { label: "Coordination", value: "none", level: "good" },
        { label: "Sortable", value: "by time", level: "good" },
        { label: "Collision risk", value: "none*", level: "good" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3"],
        hot: ["a1", "a2", "a3"],
        bubbles: { a2: "41 time | 10 machine | 12 seq" },
        badges: { a1: "machine 1", a2: "machine 2", a3: "machine 3" },
      },
    },
    {
      short: "Minting",
      title: "Minting an ID on one server",
      body: [
        "To make an ID, the server reads the current millisecond. If it is the same millisecond as the last ID, it increments the sequence. If the sequence overflows past 4,095, it waits until the next millisecond.",
        "In a new millisecond the sequence resets to zero. The three parts are then shifted into place and combined with bitwise OR. The whole thing is a few nanoseconds of arithmetic and one atomic counter.",
      ],
      callout: {
        kind: "tip",
        text: "Make sure the counter is thread-safe, with a lock or compare-and-swap. A race between two threads in the same millisecond is an easy way to create a duplicate.",
      },
      metrics: [
        { label: "Throughput", value: "4M / s each", level: "good" },
        { label: "Coordination", value: "none", level: "good" },
        { label: "Sortable", value: "by time", level: "good" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3", "db"],
        hot: ["a2"],
        flows: [
          { link: "y2", label: "create order" },
          { link: "a2d", delay: 0.8, label: "insert id 7081..." },
        ],
        bubbles: { a2: "t=1731 | m=2 | seq=17" },
      },
    },
    {
      short: "Clock skew",
      title: "When clocks or machine IDs go wrong",
      body: [
        "Two things can quietly produce duplicates. First, a clock that jumps backwards, for instance after an NTP correction, makes a server reuse a millisecond and its sequence numbers. The safe response is to refuse to mint IDs, or wait, until the clock passes the last timestamp seen.",
        "Second, two machines given the same machine ID will collide. Assign IDs through a lease in ZooKeeper or etcd, or from a pool at startup, and never from a hand-edited config that gets copied between hosts.",
      ],
      callout: {
        kind: "warn",
        text: "Across servers there is still skew of a few milliseconds, so Snowflake IDs are sorted by time only approximately. Do not use them as proof of ordering between two machines.",
      },
      metrics: [
        { label: "Throughput", value: "paused", level: "bad" },
        { label: "Coordination", value: "leases", level: "warn" },
        { label: "Sortable", value: "approx.", level: "warn" },
        { label: "Collision risk", value: "if misconfigured", level: "bad" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3"],
        hot: ["a2"],
        flows: [{ link: "y2", tone: "warn", label: "clock went back 40 ms" }],
        badges: { a2: "refusing IDs until caught up", a1: "machine 1", a3: "machine 1 ?!" },
      },
    },
    {
      short: "Sizing case",
      title: "Case: IDs for a chat service",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A messenger sends 100,000 messages per second spread over 20 servers, so each mints 5,000 IDs per second, which is about 5 per millisecond. The 4,096 per millisecond budget is nowhere near tight.",
        "With a custom epoch set to the product's launch date, 41 bits last until roughly 2094. 20 servers fit comfortably in 1,024 machine IDs, even with autoscaling.",
        "A UUID here would double the key size and add random inserts to a table growing by 8.6 billion rows a day. Snowflake keeps the index hot at the right edge and lets the app page through history with `id < last_seen`.",
      ],
      callout: {
        kind: "insight",
        text: "Check the arithmetic before choosing: required IDs per millisecond, years of range, and the machine count you expect at peak.",
      },
      metrics: [
        { label: "Throughput", value: "100k / s", level: "good" },
        { label: "ID size", value: "64 bit", level: "good" },
        { label: "Coordination", value: "lease at boot", level: "good" },
        { label: "Sortable", value: "by time", level: "good" },
        { label: "Collision risk", value: "none", level: "good" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3", "db"],
        hot: ["db"],
        flows: [
          { link: "a1d", label: "5k inserts / s" },
          { link: "a2d", delay: 0.3 },
          { link: "a3d", delay: 0.6 },
        ],
        badges: { db: "index grows at the right edge" },
      },
    },
    {
      short: "Recap",
      title: "Choosing an ID scheme",
      body: [
        "Use a database auto-increment for a single small database. Use UUIDv4 when you need zero coordination and do not care about order or index size. Use UUIDv7, ULID or Snowflake when you want time-ordered keys at scale.",
        "Use a ticket server when IDs must be dense and gap-tolerant, and you are happy to run a tiny, highly available service for it.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: need sorting by time and 64 bits? Snowflake. Need no machine assignment at all? UUIDv7. Need a simple counter? Ticket server.",
      },
      metrics: [
        { label: "Throughput", value: "scheme-dependent", level: "good" },
        { label: "ID size", value: "64 or 128 bit", level: "good" },
        { label: "Coordination", value: "none to some", level: "good" },
        { label: "Sortable", value: "time-ordered", level: "good" },
        { label: "Collision risk", value: "guard clocks", level: "warn" },
      ],
      scene: {
        show: ["you", "a1", "a2", "a3", "ids"],
        badges: { a1: "Snowflake", a2: "UUIDv7", ids: "ticket server" },
      },
    },
  ],
};
