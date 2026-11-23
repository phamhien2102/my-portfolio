import type { Lesson } from "../lib/types";

export const caching: Lesson = {
  id: "caching",
  title: "Caching",
  summary: "Keep answers you already computed close by, and learn the price of doing so.",
  minutes: 10,
  level: "beginner",
  goals: [
    "The cache-aside pattern: hit, miss, fill",
    "Why a hit can be 20 times faster than a miss",
    "How TTLs keep data from going stale forever",
    "What happens when the cache is full",
  ],
  takeaways: [
    "Cache-aside: check the cache, fall back to the database, then fill the cache.",
    "A TTL bounds how stale data can get; decide that per kind of data.",
    "Watch the hit ratio, and protect against stampedes on hot keys.",
  ],
  hud: [
    { label: "Read latency", icon: "timer" },
    { label: "Cache", icon: "layers" },
    { label: "Hit ratio", icon: "gauge" },
    { label: "DB load", icon: "database" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "User", x: 100, y: 150 },
    { id: "app", kind: "server", label: "App server", x: 330, y: 150 },
    { id: "cache", kind: "cache", label: "Cache", x: 540, y: 50 },
    { id: "db", kind: "db", label: "Database", x: 540, y: 250 },
  ],
  links: [
    { id: "ua", from: "you", to: "app" },
    { id: "ac", from: "app", to: "cache" },
    { id: "ad", from: "app", to: "db" },
  ],
  steps: [
    {
      short: "No cache",
      metrics: [
        { label: "Read latency", value: "40 ms", level: "bad" },
        { label: "Cache", value: "none", level: "warn" },
        { label: "DB load", value: "100%", level: "bad" },
      ],
      title: "Every read hits the database",
      body: [
        "A product page is read thousands of times for every time it changes. Yet without a cache, each read runs the same query again.",
        "The database becomes the bottleneck, and every user pays its 40 ms.",
      ],
      scene: {
        show: ["you", "app", "db"],
        hot: ["db"],
        flows: [
          { link: "ua" },
          { link: "ad", delay: 0.4 },
          { link: "ad", reverse: true, tone: "res", delay: 0.9 },
        ],
        badges: { db: "40 ms per read" },
      },
    },
    {
      short: "Add cache",
      metrics: [
        { label: "Cache", value: "empty", level: "warn" },
        { label: "Hit ratio", value: "0%", level: "warn" },
        { label: "DB load", value: "100%", level: "bad" },
      ],
      title: "Add a fast memory in front",
      body: [
        "A cache such as Redis keeps recent answers in RAM. Reading from it takes about 1 to 2 ms, because there is no disk and no query to plan.",
        "The app checks the cache first and only asks the database when it has to.",
      ],
      scene: {
        show: ["you", "app", "cache", "db"],
        hot: ["cache"],
        badges: { cache: "in RAM · ~2 ms" },
      },
    },
    {
      short: "Miss",
      metrics: [
        { label: "Read latency", value: "42 ms", level: "warn" },
        { label: "Cache", value: "filled", level: "good" },
        { label: "Hit ratio", value: "0%", level: "warn" },
        { label: "DB load", value: "100%", level: "warn" },
      ],
      title: "First read: a miss",
      body: [
        "The cache is empty, so the lookup misses. The app falls back to the database, gets the row, and stores a copy in the cache for next time.",
        "This pattern is called cache-aside: the application, not the cache, is in charge of filling it.",
      ],
      scene: {
        show: ["you", "app", "cache", "db"],
        hot: ["db"],
        flows: [
          { link: "ac", tone: "warn", label: "get product:42", delay: 0 },
          { link: "ad", delay: 0.6 },
          { link: "ad", reverse: true, tone: "res", delay: 1.1 },
          { link: "ac", delay: 1.6, label: "set product:42" },
        ],
        badges: { cache: "miss", db: "40 ms" },
      },
    },
    {
      short: "Hit",
      metrics: [
        { label: "Read latency", value: "2 ms", level: "good" },
        { label: "Cache", value: "warm", level: "good" },
        { label: "Hit ratio", value: "95%", level: "good" },
        { label: "DB load", value: "5%", level: "good" },
      ],
      title: "Next reads: hits",
      body: [
        "The second user asks for the same product. This time the cache has it, and the database is never touched.",
        "If 95 out of 100 reads hit the cache, the database sees only a twentieth of the load.",
      ],
      callout: {
        kind: "tip",
        text: "Watch the hit ratio. A cache with a 50% hit ratio costs you a network hop on every request and saves you half of them.",
      },
      scene: {
        show: ["you", "app", "cache", "db"],
        hot: ["cache"],
        flows: [
          { link: "ac", label: "get product:42" },
          { link: "ac", reverse: true, tone: "res", delay: 0.6, label: "hit" },
        ],
        badges: { cache: "hit · 2 ms" },
      },
    },
    {
      short: "Staleness",
      metrics: [
        { label: "Read latency", value: "2 ms", level: "good" },
        { label: "Cache", value: "stale", level: "bad" },
        { label: "Hit ratio", value: "95%", level: "good" },
        { label: "DB load", value: "5%", level: "good" },
      ],
      title: "The price: stale data",
      body: [
        "Now the product's price changes in the database. The cache still holds the old value, so users keep seeing it.",
        "The simplest defence is a TTL (time to live): each entry expires after, say, 60 seconds and is reloaded on the next miss. You can also delete the key whenever you write.",
      ],
      callout: {
        kind: "warn",
        text: "There are only two hard things: naming and cache invalidation. Decide how stale is acceptable, per kind of data.",
      },
      scene: {
        show: ["you", "app", "cache", "db"],
        hot: ["cache", "db"],
        flows: [{ link: "ad", label: "price = 19.99" }],
        badges: { cache: "price = 24.99 (stale)", db: "price = 19.99" },
      },
    },
    {
      short: "Full cache",
      metrics: [
        { label: "Read latency", value: "2 ms", level: "good" },
        { label: "Cache", value: "full \u00b7 LRU", level: "warn" },
        { label: "Hit ratio", value: "91%", level: "warn" },
        { label: "DB load", value: "9%", level: "warn" },
      ],
      title: "When memory runs out",
      body: [
        "RAM is limited, so the cache cannot keep everything. When it fills, it evicts something, usually the least recently used entry (LRU).",
        "Popular items stay, and rarely read ones fall out. If a hot key expires while many users ask for it at once, they all miss together and hit the database: a stampede. Locking the refill, so one request reloads it, prevents that.",
      ],
      scene: {
        show: ["you", "app", "cache", "db"],
        hot: ["cache"],
        badges: { cache: "LRU evicts oldest" },
      },
    },
  ],
};
