import type { Lesson } from "../lib/types";

export const sqlNosql: Lesson = {
  id: "sql-nosql",
  title: "SQL vs NoSQL",
  summary: "Match the database to the shape of your data and the guarantees your queries need.",
  minutes: 11,
  level: "beginner",
  goals: [
    "How relational databases model data and guarantee correctness",
    "What document and key-value stores trade away",
    "Why sharding is easy for some models and painful for others",
    "How consistency trade-offs show up in practice",
    "A decision rule for picking a store",
  ],
  takeaways: [
    "Relational databases give you joins and transactions; most NoSQL stores give you scale and flexible shapes.",
    "Choose by access pattern: how you read and write decides the model more than the hype does.",
    "Real systems often mix stores, with one source of truth and specialised copies for speed.",
  ],
  hud: [
    { label: "Data model", icon: "layers" },
    { label: "Consistency", icon: "shield" },
    { label: "Query power", icon: "database" },
    { label: "Scale out", icon: "server" },
    { label: "Latency", icon: "timer" },
  ],
  nodes: [
    { id: "app", kind: "service", label: "App", x: 100, y: 150 },
    { id: "sql", kind: "db", label: "Relational", sub: "tables + joins", x: 340, y: 40 },
    { id: "doc", kind: "db", label: "Document", sub: "JSON blobs", x: 340, y: 150 },
    { id: "kv", kind: "db", label: "Key-Value", sub: "get / put", x: 340, y: 260 },
    { id: "s1", kind: "db", label: "Shard 1", x: 580, y: 95 },
    { id: "s2", kind: "db", label: "Shard 2", x: 580, y: 205 },
  ],
  links: [
    { id: "a-sql", from: "app", to: "sql" },
    { id: "a-doc", from: "app", to: "doc" },
    { id: "a-kv", from: "app", to: "kv" },
    { id: "doc-s1", from: "doc", to: "s1" },
    { id: "doc-s2", from: "doc", to: "s2" },
    { id: "kv-s1", from: "kv", to: "s1" },
    { id: "kv-s2", from: "kv", to: "s2" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Your data has a shape",
      body: [
        "An online store has customers, orders, products and carts. Some data is tightly linked (an order belongs to a customer), and some is just a lookup (a session token).",
        "Databases make different bets about that shape, and the wrong bet shows up later as slow queries, awkward code or lost data.",
      ],
      callout: {
        kind: "insight",
        text: "SQL and NoSQL are not rival teams. They are different tools optimised for different access patterns.",
      },
      metrics: [{ label: "Data model", value: "undecided", level: "warn" }],
      scene: { show: ["app"], bubbles: { app: "which store?" } },
    },
    {
      short: "Relational",
      title: "Relational: tables and joins",
      body: [
        "A relational database stores rows in tables with a fixed schema. Orders reference customers by id, and a query can join them back together: `SELECT … FROM orders JOIN customers`.",
        "Data is stored once, so changing a customer's email means updating one row. The database enforces types, foreign keys and unique constraints for you.",
      ],
      callout: {
        kind: "tip",
        text: "If you can describe your data as entities with relationships and you do not know every future query, start relational.",
      },
      metrics: [
        { label: "Data model", value: "tables", level: "good" },
        { label: "Query power", value: "joins, any filter", level: "good" },
        { label: "Latency", value: "2 ms", level: "good" },
      ],
      scene: {
        show: ["app", "sql"],
        hot: ["sql"],
        flows: [
          { link: "a-sql", label: "JOIN orders, customers" },
          { link: "a-sql", reverse: true, tone: "res", delay: 0.8, label: "rows" },
        ],
        badges: { sql: "schema enforced" },
      },
    },
    {
      short: "ACID",
      title: "Transactions keep money safe",
      body: [
        "A transfer debits one account and credits another. A transaction makes both writes happen together or not at all (atomicity), and no reader sees the half-finished state (isolation).",
        "These guarantees, together with consistency and durability, are called ACID. A crash between the two writes leaves your data correct instead of short by 100 dollars.",
      ],
      callout: {
        kind: "warn",
        text: "Without transactions you must build rollback and retry logic yourself, and edge cases will find the bugs for you.",
      },
      metrics: [
        { label: "Consistency", value: "strong (ACID)", level: "good" },
        { label: "Latency", value: "5 ms", level: "good" },
      ],
      scene: {
        show: ["app", "sql"],
        hot: ["sql"],
        flows: [
          { link: "a-sql", label: "BEGIN · debit · credit" },
          { link: "a-sql", reverse: true, tone: "res", delay: 0.9, label: "COMMIT" },
        ],
        badges: { sql: "all or nothing" },
      },
    },
    {
      short: "Documents",
      title: "Document stores: one record, one read",
      body: [
        "A document database stores each record as a JSON-like object. An order can carry its line items and shipping address inside it, so one read returns everything the page needs.",
        "There is no fixed schema, so adding a field needs no migration. The price is duplication: if a product name is copied into 10,000 orders, renaming it means touching them all, or accepting that old orders keep the old name.",
      ],
      callout: {
        kind: "insight",
        text: "Embed data you always read together, and reference data that changes independently. That rule drives most document modelling.",
      },
      metrics: [
        { label: "Data model", value: "nested JSON", level: "good" },
        { label: "Query power", value: "by id and indexes", level: "warn" },
        { label: "Latency", value: "1 ms", level: "good" },
      ],
      scene: {
        show: ["app", "doc"],
        hot: ["doc"],
        flows: [
          { link: "a-doc", label: "get order 8841" },
          { link: "a-doc", reverse: true, tone: "res", delay: 0.8, label: "items + address" },
        ],
        badges: { doc: "no joins needed" },
      },
    },
    {
      short: "Key-value",
      title: "Key-value: the simplest, the fastest",
      body: [
        "A key-value store maps a key to an opaque value: `session:abc123` to a blob. The only questions it answers are get, put and delete by key.",
        "That limit is the point. With so little to do, a lookup takes well under a millisecond and one cluster can handle hundreds of thousands of operations per second.",
      ],
      callout: {
        kind: "tip",
        text: "Good for sessions, carts, counters, feature flags and caches. Bad for anything where you ask 'find all items where…'.",
      },
      metrics: [
        { label: "Data model", value: "key → blob", level: "good" },
        { label: "Query power", value: "key lookups only", level: "bad" },
        { label: "Latency", value: "0.5 ms", level: "good" },
      ],
      scene: {
        show: ["app", "kv"],
        hot: ["kv"],
        flows: [
          { link: "a-kv", label: "GET session:abc123" },
          { link: "a-kv", reverse: true, tone: "res", delay: 0.7, label: "{user: 42}" },
        ],
        badges: { kv: "100k ops/s per node" },
      },
    },
    {
      short: "Scale out",
      title: "Scaling: sharding by key",
      body: [
        "One machine eventually runs out of disk or write throughput. Sharding splits the data across machines, with a hash of the key picking the owner: keys A to M on shard 1, N to Z on shard 2.",
        "Documents and key-value pairs shard cleanly, since each record is self-contained. A join across shards is another matter: the rows may live on different machines, so the query turns into network calls.",
      ],
      callout: {
        kind: "warn",
        text: "Relational databases can shard too, but cross-shard joins and transactions get slow and complicated. Plan the shard key early.",
      },
      metrics: [
        { label: "Scale out", value: "add shards", level: "good" },
        { label: "Query power", value: "single-key only", level: "warn" },
        { label: "Latency", value: "2 ms", level: "good" },
      ],
      scene: {
        show: ["app", "doc", "s1", "s2"],
        hot: ["s1", "s2"],
        flows: [
          { link: "doc-s1", label: "key hash → shard" },
          { link: "doc-s2", delay: 0.4 },
        ],
        badges: { s1: "keys A–M", s2: "keys N–Z" },
      },
    },
    {
      short: "Eventual",
      title: "The consistency trade-off",
      body: [
        "To stay available across machines and regions, many NoSQL stores replicate writes asynchronously. A write lands on one node, then spreads to its copies a few milliseconds later.",
        "A read that hits a lagging copy returns old data. This is eventual consistency: all copies agree soon, not instantly.",
      ],
      callout: {
        kind: "insight",
        text: "Fine for a like counter or a feed. Dangerous for an account balance or an inventory count, where a stale read means a double sale.",
      },
      metrics: [
        { label: "Consistency", value: "eventual, ~50 ms lag", level: "warn" },
        { label: "Scale out", value: "multi-region", level: "good" },
        { label: "Latency", value: "1 ms local", level: "good" },
      ],
      scene: {
        show: ["app", "kv", "s1", "s2"],
        hot: ["s2"],
        flows: [
          { link: "kv-s1", label: "write" },
          { link: "kv-s2", delay: 1, tone: "warn", label: "copy arrives later" },
        ],
        badges: { s1: "new value", s2: "old value (50 ms)" },
      },
    },
    {
      short: "Case: shop",
      title: "Case: choosing for an online shop",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Orders and payments need transactions and reports, so they go in a relational database. The product catalog has varied attributes (a shirt has sizes, a laptop has specs), which suits documents.",
        "Sessions and carts are read on every click and are disposable, so they go in a key-value store.",
      ],
      callout: {
        kind: "tip",
        text: "Keep one source of truth for money and orders. Copy data into other stores for speed, and never the reverse.",
      },
      metrics: [
        { label: "Data model", value: "3 stores", level: "good" },
        { label: "Consistency", value: "strong where it counts", level: "good" },
        { label: "Latency", value: "< 5 ms", level: "good" },
      ],
      scene: {
        show: ["app", "sql", "doc", "kv"],
        hot: ["sql", "doc", "kv"],
        flows: [
          { link: "a-sql", label: "orders, payments" },
          { link: "a-doc", label: "catalog" },
          { link: "a-kv", label: "sessions, carts" },
        ],
      },
    },
    {
      short: "Recap",
      title: "A rule of thumb",
      body: [
        "Start from the questions you must answer. Need joins, ad-hoc queries or multi-row transactions: relational. Need flexible nested records read by id: document. Need raw speed on simple lookups: key-value.",
        "A single relational database comfortably serves most products up to several terabytes and thousands of writes per second. Reach for NoSQL when you have outgrown that, or when your shape genuinely does not fit tables.",
      ],
      metrics: [
        { label: "Data model", value: "fit the access pattern", level: "good" },
        { label: "Consistency", value: "strong by default", level: "good" },
        { label: "Scale out", value: "when you must", level: "warn" },
      ],
      scene: {
        show: ["app", "sql", "doc", "kv"],
        badges: { sql: "default choice", doc: "flexible shapes", kv: "fast lookups" },
      },
    },
  ],
};
