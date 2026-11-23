import type { Lesson } from "../lib/types";

export const rateLimiting: Lesson = {
  id: "rate-limiting",
  title: "Rate Limiting",
  summary: "Protect your service from clients that ask for too much, by accident or on purpose.",
  minutes: 8,
  level: "intermediate",
  goals: [
    "Why a service needs a speed limit per client",
    "How the token bucket allows bursts but caps the average",
    "What to return when a client is over the limit",
    "How several servers share one counter",
  ],
  takeaways: [
    "Limit per client so one caller cannot starve the rest.",
    "A token bucket allows short bursts but caps the average rate.",
    "Reply 429 with Retry-After, and share counters across servers.",
  ],
  hud: [
    { label: "Allowed", icon: "shield" },
    { label: "Rejected", icon: "alert" },
    { label: "Tokens left", icon: "gauge" },
    { label: "Counters", icon: "database" },
  ],
  nodes: [
    { id: "a", kind: "user", label: "Client A", x: 100, y: 50 },
    { id: "b", kind: "user", label: "Client B", x: 100, y: 250 },
    { id: "rl", kind: "limiter", label: "Rate limiter", x: 310, y: 150 },
    { id: "api", kind: "server", label: "API", x: 520, y: 150 },
    { id: "store", kind: "cache", label: "Shared counters", x: 310, y: 265 },
  ],
  links: [
    { id: "al", from: "a", to: "rl" },
    { id: "bl", from: "b", to: "rl" },
    { id: "lapi", from: "rl", to: "api" },
    { id: "aapi", from: "a", to: "api" },
    { id: "ls", from: "rl", to: "store" },
  ],
  steps: [
    {
      short: "Why",
      metrics: [
        { label: "Allowed", value: "all", level: "bad" },
        { label: "Rejected", value: "0", level: "bad" },
      ],
      title: "One client can hurt everyone",
      body: [
        "A buggy script retries in a tight loop. A scraper downloads your whole catalogue. An attacker guesses passwords. Each can use up capacity that other users need.",
        "Servers cannot tell good traffic from bad by themselves. You have to set a limit per client.",
      ],
      scene: {
        show: ["a", "b", "api"],
        hot: ["api"],
        flows: [{ link: "aapi" }],
        badges: { a: "1,000 req/s", b: "2 req/s", api: "overloaded" },
      },
    },
    {
      short: "Limiter",
      metrics: [
        { label: "Allowed", value: "checked", level: "good" },
        { label: "Rejected", value: "0", level: "good" },
      ],
      title: "Check each request at the door",
      body: [
        "Put a rate limiter in front of the API (often in the gateway). For each request it identifies the caller, by API key, user id or IP, and decides: pass or reject.",
        "Rejected requests cost almost nothing, because they never reach your application.",
      ],
      scene: {
        show: ["a", "b", "rl", "api"],
        hot: ["rl"],
        flows: [{ link: "al" }, { link: "bl", delay: 0.4 }],
      },
    },
    {
      short: "Token bucket",
      metrics: [
        { label: "Allowed", value: "burst ok", level: "good" },
        { label: "Rejected", value: "0", level: "good" },
        { label: "Tokens left", value: "7 / 10", level: "good" },
      ],
      title: "The token bucket",
      body: [
        "Each client has a bucket that holds up to 10 tokens and refills at 5 tokens per second. A request takes one token.",
        "A client that has been quiet can burst 10 requests at once, but over time it cannot average more than 5 per second.",
      ],
      callout: {
        kind: "tip",
        text: "Other options: fixed window (simple, but allows a double burst at the boundary) and sliding window (smoother, a little more work).",
      },
      scene: {
        show: ["a", "b", "rl", "api"],
        hot: ["rl"],
        flows: [
          { link: "al", label: "take 1 token" },
          { link: "lapi", delay: 0.6 },
        ],
        badges: { rl: "A: 7/10 tokens" },
      },
    },
    {
      short: "Over limit",
      metrics: [
        { label: "Allowed", value: "B only", level: "good" },
        { label: "Rejected", value: "A \u00b7 429", level: "warn" },
        { label: "Tokens left", value: "0 / 10", level: "bad" },
      ],
      title: "Out of tokens: reply 429",
      body: [
        "Client A has spent its tokens. The limiter answers `429 Too Many Requests` straight away and the API never sees the call.",
        "Add a `Retry-After` header so well-behaved clients know when to try again, instead of hammering you.",
      ],
      scene: {
        show: ["a", "b", "rl", "api"],
        hot: ["rl"],
        flows: [
          { link: "al", label: "request" },
          { link: "al", reverse: true, tone: "warn", delay: 0.6, label: "429" },
          { link: "bl", delay: 0.3 },
          { link: "lapi", delay: 0.9 },
        ],
        badges: { rl: "A: 0/10 tokens", b: "still served" },
      },
    },
    {
      short: "Many servers",
      metrics: [
        { label: "Allowed", value: "shared", level: "good" },
        { label: "Rejected", value: "A \u00b7 429", level: "warn" },
        { label: "Tokens left", value: "0 / 10", level: "bad" },
        { label: "Counters", value: "Redis", level: "good" },
      ],
      title: "Many limiters, one count",
      body: [
        "With several gateway servers, each counting on its own would let a client make N times the limit by spreading requests around.",
        "So the counters live in a shared fast store such as Redis, updated atomically, and every limiter checks the same numbers.",
      ],
      callout: {
        kind: "warn",
        text: "Decide what happens if the store is down. Failing open keeps the site up; failing closed keeps it safe.",
      },
      scene: {
        show: ["a", "b", "rl", "api", "store"],
        hot: ["store"],
        flows: [
          { link: "ls", label: "INCR client:A" },
          { link: "ls", reverse: true, tone: "res", delay: 0.6 },
        ],
        badges: { store: "atomic counters" },
      },
    },
  ],
};
