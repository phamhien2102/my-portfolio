import type { Lesson } from "../lib/types";

export const urlShortener: Lesson = {
  id: "url-shortener",
  title: "Design a URL Shortener",
  summary:
    "Put the pieces together: IDs, storage, caching and reads that outnumber writes 100 to 1.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "Turn a vague idea into numbers and requirements",
    "Generate short, unique codes without collisions",
    "Serve redirects fast with a cache in front",
    "Pick a status code and know what it costs",
  ],
  takeaways: [
    "Estimate first: read-heavy traffic points to caching and replicas.",
    "A counter encoded in base 62 gives short, unique, collision-free codes.",
    "301 saves load, 302 keeps analytics; choose on purpose.",
  ],
  hud: [
    { label: "Writes", icon: "download" },
    { label: "Reads", icon: "users" },
    { label: "Latency", icon: "timer" },
    { label: "Hit ratio", icon: "gauge" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "Client", x: 100, y: 150 },
    { id: "api", kind: "server", label: "API", x: 330, y: 150 },
    { id: "cache", kind: "cache", label: "Cache", x: 520, y: 40 },
    { id: "db", kind: "db", label: "Database", x: 520, y: 150 },
    { id: "ids", kind: "service", label: "ID generator", x: 520, y: 260 },
  ],
  links: [
    { id: "ua", from: "you", to: "api" },
    { id: "ac", from: "api", to: "cache" },
    { id: "ad", from: "api", to: "db" },
    { id: "ai", from: "api", to: "ids" },
  ],
  steps: [
    {
      short: "Requirements",
      metrics: [
        { label: "Writes", value: "40 / s", level: "good" },
        { label: "Reads", value: "4,000 / s", level: "warn" },
      ],
      title: "Start with what it must do",
      body: [
        "A user pastes a long link and gets back `sho.rt/aZ3k9`. Opening the short link sends the browser to the long one.",
        "Assume 100 million new links a month and 100 times as many redirects. That is about 40 writes and 4,000 reads per second: a read-heavy system, and reads must be fast.",
      ],
      callout: {
        kind: "insight",
        text: "Numbers first. They tell you whether you need one database or fifty, and where the real work is.",
      },
      scene: {
        show: ["you", "api"],
        hot: ["api"],
        flows: [{ link: "ua", label: "long URL" }],
        badges: { api: "40 writes/s · 4,000 reads/s" },
      },
    },
    {
      short: "Make a code",
      metrics: [
        { label: "Writes", value: "40 / s", level: "good" },
        { label: "Reads", value: "4,000 / s", level: "warn" },
        { label: "Latency", value: "5 ms", level: "good" },
      ],
      title: "Create: get a unique ID",
      body: [
        "Each link needs a unique short code. Hashing the URL risks collisions, and random strings need a check against the database.",
        "A cleaner way is a counter service that hands out unique numbers. Encode the number in base 62 (`a-z A-Z 0-9`): seven characters cover about 3.5 trillion links.",
      ],
      scene: {
        show: ["you", "api", "ids", "db"],
        hot: ["ids"],
        flows: [
          { link: "ai", label: "next id" },
          { link: "ai", reverse: true, tone: "res", delay: 0.6, label: "125 → cb" },
        ],
        badges: { ids: "base62(counter)" },
      },
    },
    {
      short: "Store",
      metrics: [
        { label: "Writes", value: "40 / s", level: "good" },
        { label: "Reads", value: "4,000 / s", level: "warn" },
        { label: "Latency", value: "12 ms", level: "good" },
      ],
      title: "Save the mapping",
      body: [
        "The API writes `code → long URL` to the database, then returns the short link to the user.",
        "The data is simple: a key and a value, with no joins. A key-value store, or a plain SQL table indexed on the code, both work. Sharding by code spreads it out when it grows.",
      ],
      scene: {
        show: ["you", "api", "ids", "db"],
        hot: ["db"],
        flows: [
          { link: "ad", label: "cb → https://…" },
          { link: "ua", reverse: true, tone: "res", delay: 0.6, label: "sho.rt/cb" },
        ],
        badges: { db: "key: code, value: url" },
      },
    },
    {
      short: "Redirect",
      metrics: [
        { label: "Writes", value: "40 / s", level: "good" },
        { label: "Reads", value: "4,000 / s", level: "warn" },
        { label: "Latency", value: "40 ms", level: "warn" },
        { label: "Hit ratio", value: "0%", level: "warn" },
      ],
      title: "Read: look it up and redirect",
      body: [
        "When someone opens `sho.rt/cb`, the API finds the long URL and replies with a redirect. The browser follows it.",
        "Reads are 99% of the traffic, and the same popular links are requested again and again.",
      ],
      scene: {
        show: ["you", "api", "cache", "db"],
        hot: ["api"],
        flows: [
          { link: "ua", label: "GET /cb" },
          { link: "ua", reverse: true, tone: "res", delay: 0.8, label: "redirect" },
        ],
      },
    },
    {
      short: "Cache",
      metrics: [
        { label: "Writes", value: "40 / s", level: "good" },
        { label: "Reads", value: "4,000 / s", level: "warn" },
        { label: "Latency", value: "2 ms", level: "good" },
        { label: "Hit ratio", value: "95%", level: "good" },
      ],
      title: "Serve hot links from the cache",
      body: [
        "Put a cache in front of the database. A hit returns in about a millisecond; only misses go to the database, and then fill the cache.",
        "A small cache goes a long way here: a few percent of links get most of the clicks, so a high hit ratio is realistic.",
      ],
      scene: {
        show: ["you", "api", "cache", "db"],
        hot: ["cache"],
        flows: [
          { link: "ac", label: "get cb" },
          { link: "ac", reverse: true, tone: "res", delay: 0.6, label: "hit" },
        ],
        badges: { cache: "95% hit ratio", db: "5% of reads" },
      },
    },
    {
      short: "301 vs 302",
      metrics: [
        { label: "Writes", value: "40 / s", level: "good" },
        { label: "Reads", value: "4,000 / s", level: "warn" },
        { label: "Latency", value: "2 ms", level: "good" },
        { label: "Hit ratio", value: "95%", level: "good" },
      ],
      title: "Which redirect code?",
      body: [
        "`301 Moved Permanently` lets browsers remember the target, so later clicks skip your server entirely: cheaper, but you lose the click count.",
        "`302 Found` makes every click come back to you. That costs more traffic but lets you count clicks, change the target, or expire a link.",
      ],
      callout: {
        kind: "tip",
        text: "If analytics or link expiry matter, use 302. If it is purely a shortcut, 301 saves load.",
      },
      scene: {
        show: ["you", "api", "cache", "db"],
        hot: ["api"],
        flows: [{ link: "ua", reverse: true, tone: "res", label: "302 Location: …" }],
        badges: { api: "count the click" },
      },
    },
  ],
};
