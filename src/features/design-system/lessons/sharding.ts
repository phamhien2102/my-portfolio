import type { Lesson } from "../lib/types";

export const sharding: Lesson = {
  id: "sharding",
  title: "Sharding",
  summary: "Split one huge dataset across machines so no single database has to hold it all.",
  minutes: 9,
  level: "intermediate",
  goals: [
    "When replicas are not enough and you must split writes",
    "How a shard key decides where a row lives",
    "What a hot shard is and how it happens",
    "Why moving data between shards hurts",
  ],
  takeaways: [
    "Shard when data or writes outgrow one machine; replicas cannot fix that.",
    "The shard key decides everything: pick one that spreads load and fits your queries.",
    "Cross-shard queries and resharding are the costs you pay.",
  ],
  hud: [
    { label: "Shards", icon: "database" },
    { label: "Data / shard", icon: "layers" },
    { label: "Busiest shard", icon: "gauge" },
    { label: "Query fan-out", icon: "link" },
  ],
  nodes: [
    { id: "app", kind: "server", label: "App + router", x: 100, y: 150 },
    { id: "one", kind: "db", label: "Database", x: 400, y: 150 },
    { id: "s1", kind: "db", label: "Shard 1", x: 400, y: 40 },
    { id: "s2", kind: "db", label: "Shard 2", x: 400, y: 150 },
    { id: "s3", kind: "db", label: "Shard 3", x: 400, y: 260 },
  ],
  links: [
    { id: "ao", from: "app", to: "one" },
    { id: "a1", from: "app", to: "s1" },
    { id: "a2", from: "app", to: "s2" },
    { id: "a3", from: "app", to: "s3" },
  ],
  steps: [
    {
      short: "Too big",
      metrics: [
        { label: "Shards", value: "1", level: "bad" },
        { label: "Data / shard", value: "4 TB", level: "bad" },
        { label: "Busiest shard", value: "90%", level: "bad" },
        { label: "Query fan-out", value: "1", level: "good" },
      ],
      title: "One machine runs out of room",
      body: [
        "Replicas copy the whole dataset, so they do not help when the data no longer fits on one disk, or when writes alone overwhelm one primary.",
        "Buying a bigger machine (vertical scaling) works for a while, then gets very expensive and then impossible.",
      ],
      scene: {
        show: ["app", "one"],
        hot: ["one"],
        flows: [{ link: "ao", label: "all writes" }],
        badges: { one: "4 TB · 90% CPU" },
      },
    },
    {
      short: "Split",
      metrics: [
        { label: "Shards", value: "3", level: "good" },
        { label: "Data / shard", value: "1.3 TB", level: "good" },
        { label: "Busiest shard", value: "33%", level: "good" },
        { label: "Query fan-out", value: "1", level: "good" },
      ],
      title: "Split the data into shards",
      body: [
        "Divide the rows across several databases called shards. Each shard holds only a slice, so each is smaller, faster, and takes only a share of the writes.",
        "Capacity now grows by adding shards.",
      ],
      scene: {
        show: ["app", "s1", "s2", "s3"],
        hot: ["s1", "s2", "s3"],
        badges: { s1: "1/3 of users", s2: "1/3 of users", s3: "1/3 of users" },
      },
    },
    {
      short: "Shard key",
      metrics: [
        { label: "Shards", value: "3", level: "good" },
        { label: "Data / shard", value: "1.3 TB", level: "good" },
        { label: "Busiest shard", value: "33%", level: "good" },
        { label: "Query fan-out", value: "1", level: "good" },
      ],
      title: "A key decides where a row lives",
      body: [
        "Pick a shard key, such as `user_id`. The router computes `hash(user_id) % 3` and sends the query to that shard.",
        "Every query that includes the key goes to exactly one shard, so it stays fast.",
      ],
      callout: {
        kind: "tip",
        text: "Choose a key that appears in most queries and spreads values evenly. Changing it later means moving all the data.",
      },
      scene: {
        show: ["app", "s1", "s2", "s3"],
        hot: ["s2"],
        flows: [{ link: "a2", label: "user 1042 → shard 2" }],
        badges: { s2: "hash(1042) % 3 = 1" },
      },
    },
    {
      short: "Hot shard",
      metrics: [
        { label: "Shards", value: "3", level: "good" },
        { label: "Data / shard", value: "1.3 TB", level: "good" },
        { label: "Busiest shard", value: "85%", level: "bad" },
        { label: "Query fan-out", value: "1", level: "good" },
      ],
      title: "When one shard gets all the heat",
      body: [
        "If the key is a sequence number or a timestamp, all new rows land on the latest shard. Or one celebrity account may attract a huge share of traffic.",
        "That shard becomes a hot spot while the others idle, and the benefit of splitting is gone.",
      ],
      callout: { kind: "warn", text: "Even splits of data do not mean even splits of load." },
      scene: {
        show: ["app", "s1", "s2", "s3"],
        hot: ["s1"],
        flows: [
          { link: "a1", delay: 0 },
          { link: "a1", delay: 0.25 },
          { link: "a1", delay: 0.5 },
          { link: "a3", delay: 0.4, tone: "res" },
        ],
        badges: { s1: "85% of traffic", s2: "idle", s3: "idle" },
      },
    },
    {
      short: "Cross-shard",
      metrics: [
        { label: "Shards", value: "3", level: "good" },
        { label: "Data / shard", value: "1.3 TB", level: "good" },
        { label: "Busiest shard", value: "33%", level: "good" },
        { label: "Query fan-out", value: "3", level: "warn" },
      ],
      title: "Queries that span shards",
      body: [
        "A query for one user is easy. A query such as 'top 10 products across all users' needs every shard, and the router must gather and merge the results.",
        "Joins and transactions across shards are slow or hard. Design so that data that is used together lives together.",
      ],
      scene: {
        show: ["app", "s1", "s2", "s3"],
        hot: ["s1", "s2", "s3"],
        flows: [
          { link: "a1", label: "scatter" },
          { link: "a2", delay: 0.2 },
          { link: "a3", delay: 0.4 },
        ],
      },
    },
    {
      short: "Resharding",
      metrics: [
        { label: "Shards", value: "3 \u2192 4", level: "warn" },
        { label: "Data / shard", value: "moving", level: "warn" },
        { label: "Busiest shard", value: "33%", level: "good" },
        { label: "Query fan-out", value: "1", level: "good" },
      ],
      title: "Adding a shard is painful",
      body: [
        "With `hash % 3`, changing to `hash % 4` moves most rows to a different shard, and a lot of data has to travel while the system is live.",
        "Consistent hashing, or many small virtual shards mapped onto few machines, limits how much moves. It is the next lesson in a full course.",
      ],
      scene: { show: ["app", "s1", "s2", "s3"], hot: ["s3"], badges: { s3: "rows moving…" } },
    },
  ],
};
