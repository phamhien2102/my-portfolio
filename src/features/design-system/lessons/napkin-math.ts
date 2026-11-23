import type { Lesson } from "../lib/types";

export const napkinMath: Lesson = {
  id: "napkin-math",
  title: "Napkin Math",
  summary: "Estimate traffic, storage and bandwidth in your head, close enough to choose a design.",
  minutes: 10,
  level: "beginner",
  goals: [
    "Why rough estimates beat exact ones early on",
    "How to turn daily users into requests per second",
    "How to estimate storage and bandwidth",
    "The latency numbers worth memorising",
    "Cases: sizing servers and a cache hit ratio",
  ],
  takeaways: [
    "Round hard: a day is about 100,000 seconds, and powers of ten are accurate enough to pick a design.",
    "Work in a chain: users to requests per second, then storage and bandwidth, then machines.",
    "Peak is two to three times the average, and memory is far faster than disk or network.",
  ],
  hud: [
    { label: "Requests/sec", icon: "gauge" },
    { label: "Storage", icon: "database" },
    { label: "Bandwidth", icon: "download" },
    { label: "Servers", icon: "server" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "users", x: 100, y: 150 },
    { id: "web", kind: "server", label: "Web Server", x: 330, y: 150 },
    { id: "cache", kind: "cache", label: "Cache", x: 520, y: 40 },
    { id: "db", kind: "db", label: "Database", x: 520, y: 260 },
  ],
  links: [
    { id: "in", from: "you", to: "web" },
    { id: "c", from: "web", to: "cache" },
    { id: "d", from: "web", to: "db" },
  ],
  steps: [
    {
      short: "Why guess",
      title: "Before drawing boxes, size the problem",
      body: [
        "Should this run on one server or fifty? Does the data fit on one disk? You cannot choose a design without a feel for the numbers.",
        "Napkin math gives you that feel in a minute. You do not need the exact answer, only the right order of magnitude: tens, thousands or millions.",
      ],
      callout: {
        kind: "insight",
        text: "A wrong digit is fine. A wrong power of ten means a different architecture.",
      },
      scene: { show: ["you", "web"], bubbles: { you: "10M users a day" } },
    },
    {
      short: "Round it",
      title: "Round numbers on purpose",
      body: [
        "A day has `86,400` seconds. Call it `100,000`, or `10^5`. A month is about `2.5 million` seconds, a year about `30 million`.",
        "Memorise sizes the same way: `1 KB` is a thousand bytes, `1 MB` a million, `1 GB` a billion. Powers of two differ by 2.4%, which does not matter here.",
      ],
      callout: {
        kind: "tip",
        text: "Dividing by 100,000 is just moving the decimal point, so you can do it in your head.",
      },
      scene: {
        show: ["you", "web"],
        badges: { you: "1 day = 10^5 seconds", web: "1 GB = 10^9 bytes" },
      },
    },
    {
      short: "Requests/sec",
      title: "From users to requests per second",
      body: [
        "Say `10 million` people use the app daily and each makes `10` requests. That is `100 million` requests a day, and `100M / 100,000 = 1,000` requests per second on average.",
        "Traffic is never flat. Plan for a peak of two to three times the average, so about `2,500` requests per second.",
      ],
      callout: {
        kind: "warn",
        text: "Sizing for the average is a classic mistake. The system must survive the busiest minute, not the typical one.",
      },
      metrics: [{ label: "Requests/sec", value: "1,000 avg · 2,500 peak", level: "warn" }],
      scene: {
        show: ["you", "web"],
        hot: ["web"],
        flows: [
          { link: "in", label: "~2,500 rps at peak" },
          { link: "in", delay: 0.3 },
        ],
        badges: { you: "10M x 10 = 100M / day" },
      },
    },
    {
      short: "Storage",
      title: "Storage: count, size, time, copies",
      body: [
        "If users create `1 million` posts a day at about `1 KB` each, that is `1 GB` a day, or roughly `365 GB` a year. Over five years, about `2 TB`.",
        "Then multiply by the number of copies you keep. Three replicas turn `2 TB` into `6 TB`. Images and video, at megabytes each, change the picture completely.",
      ],
      callout: {
        kind: "insight",
        text: "Two terabytes fits on one modern disk, so storage is not the hard part here. Traffic is.",
      },
      metrics: [
        { label: "Requests/sec", value: "1,000 avg · 2,500 peak", level: "warn" },
        { label: "Storage", value: "2 TB x 3 = 6 TB", level: "good" },
      ],
      scene: {
        show: ["you", "web", "db"],
        hot: ["db"],
        flows: [{ link: "d", label: "1M posts x 1 KB" }],
        badges: { db: "1 GB / day · 365 GB / yr" },
      },
    },
    {
      short: "Bandwidth",
      title: "Bandwidth: rate times size",
      body: [
        "Multiply requests per second by the size of each response. At `2,500` rps and `50 KB` per page, that is `125 MB` per second, or about `1 Gbit/s` leaving your servers.",
        "A single server's network card is often 1 to 10 Gbit/s, so a gigabit of steady output already needs several machines or a CDN.",
      ],
      callout: {
        kind: "tip",
        text: "Bytes to bits is times eight. Mixing up MB/s and Mbit/s is an easy factor-of-eight error.",
      },
      metrics: [
        { label: "Requests/sec", value: "1,000 avg · 2,500 peak", level: "warn" },
        { label: "Storage", value: "2 TB x 3 = 6 TB", level: "good" },
        { label: "Bandwidth", value: "~1 Gbit/s", level: "warn" },
      ],
      scene: {
        show: ["you", "web"],
        hot: ["you"],
        flows: [{ link: "in", reverse: true, tone: "res", label: "2,500 x 50 KB" }],
        badges: { web: "125 MB/s out" },
      },
    },
    {
      short: "Latency table",
      title: "Numbers worth memorising",
      body: [
        "Reading from memory takes about `100 ns`. A round trip inside one data centre is about `0.5 ms`. Reading from an SSD takes `0.1 ms`, and a spinning disk seek about `10 ms`.",
        "A round trip across a continent is roughly `100-150 ms`. Each step is about a hundred times slower than the one before, which is why caches and nearby servers pay off.",
      ],
      callout: {
        kind: "insight",
        text: "Memory vs disk vs network is the whole story of caching: keep hot data in the fastest place that fits it.",
      },
      metrics: [{ label: "Requests/sec", value: "1,000 avg · 2,500 peak", level: "warn" }],
      scene: {
        show: ["web", "cache", "db"],
        hot: ["cache"],
        flows: [
          { link: "c", label: "memory: 0.1 ms" },
          { link: "d", tone: "warn", label: "disk query: 10 ms", delay: 0.4 },
        ],
        badges: { cache: "~100x faster", db: "slow path" },
      },
    },
    {
      short: "Servers",
      title: "Case: how many web servers?",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Suppose one server comfortably handles `500` requests per second. Peak of `2,500` needs `2,500 / 500 = 5` servers.",
        "Do not stop at five. Add headroom so no machine runs hot, and spare capacity so losing one does not hurt. Eight servers is a sensible answer.",
      ],
      callout: {
        kind: "tip",
        text: "Say the assumptions out loud: 500 rps per server, 2.5x peak, one spare. Reviewers can then correct the inputs, not argue the result.",
      },
      metrics: [
        { label: "Requests/sec", value: "1,000 avg · 2,500 peak", level: "warn" },
        { label: "Storage", value: "2 TB x 3 = 6 TB", level: "good" },
        { label: "Bandwidth", value: "~1 Gbit/s", level: "warn" },
        { label: "Servers", value: "5 + headroom = 8", level: "good" },
      ],
      scene: {
        show: ["you", "web"],
        hot: ["web"],
        badges: { web: "500 rps each x 8", you: "2,500 rps peak" },
      },
    },
    {
      short: "Cache ratio",
      title: "Case: what a cache does to the database",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Reads are `2,000` of those `2,500` requests per second. A database that handles about `1,000` queries per second would drown.",
        "With a cache that answers `95%` of reads, only `5%` reach the database: `2,000 x 0.05 = 100` queries per second. A tenfold reduction from one box.",
      ],
      callout: {
        kind: "warn",
        text: "The hit ratio is a guess until measured. At 80% the database still sees 400 rps, so test the assumption.",
      },
      metrics: [
        { label: "Requests/sec", value: "2,000 reads", level: "warn" },
        { label: "Servers", value: "8 web · 1 cache · 1 db", level: "good" },
      ],
      scene: {
        show: ["you", "web", "cache", "db"],
        hot: ["cache"],
        flows: [
          { link: "c", label: "95% served here" },
          { link: "c", reverse: true, tone: "res", delay: 0.6 },
          { link: "d", tone: "warn", label: "5% = 100 rps", delay: 0.3 },
        ],
        badges: { db: "100 rps, not 2,000" },
      },
    },
    {
      short: "Recap",
      title: "The estimation checklist",
      body: [
        "Chain it: users, then requests per second (with a 2-3x peak), then storage (count x size x time x copies), then bandwidth (rate x size), then machines.",
        "State the assumptions, round to powers of ten, and sanity-check against the latency table. Close enough is the goal.",
      ],
      metrics: [
        { label: "Requests/sec", value: "2,500 peak", level: "warn" },
        { label: "Storage", value: "6 TB", level: "good" },
        { label: "Bandwidth", value: "~1 Gbit/s", level: "warn" },
        { label: "Servers", value: "8", level: "good" },
      ],
      scene: {
        show: ["you", "web", "cache", "db"],
        badges: { you: "10M / day", web: "8 servers", cache: "95% hits", db: "6 TB" },
      },
    },
  ],
};
