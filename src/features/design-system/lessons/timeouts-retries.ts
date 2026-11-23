import type { Lesson } from "../lib/types";

export const timeoutsRetries: Lesson = {
  id: "timeouts-retries",
  title: "Timeouts & Retries",
  summary:
    "Bound how long you wait, retry only what is safe, and avoid turning a blip into an outage.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "Why a missing timeout is a bug waiting to happen",
    "How to pick a timeout from real latency numbers",
    "Retries with exponential backoff and jitter",
    "Why retries need idempotency",
    "How circuit breakers stop retry storms",
  ],
  takeaways: [
    "Every network call needs a timeout, chosen from the dependency's p99 and your own deadline.",
    "Retry only transient, idempotent failures, with exponential backoff, jitter and a small cap.",
    "Retries multiply load when nested, so cap them and add a circuit breaker to fail fast.",
  ],
  hud: [
    { label: "Latency", icon: "timer" },
    { label: "Attempts", icon: "layers" },
    { label: "Success rate", icon: "gauge" },
    { label: "Load on payments", icon: "server" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "Client", x: 100, y: 150 },
    { id: "api", kind: "server", label: "API", x: 330, y: 150 },
    { id: "pay", kind: "service", label: "Payments", x: 560, y: 50 },
    { id: "db", kind: "db", label: "Database", x: 560, y: 250 },
  ],
  links: [
    { id: "ua", from: "you", to: "api" },
    { id: "ap", from: "api", to: "pay" },
    { id: "ad", from: "api", to: "db" },
  ],
  steps: [
    {
      short: "Hanging",
      title: "A call that never returns",
      body: [
        "The API calls the payments service. Payments is stuck on a lock and never answers, and the API has no timeout, so its thread waits forever.",
        "Each stuck request pins a thread and a connection. With 200 threads and 50 requests a second, the pool is exhausted in about 4 seconds and the whole API stops, even for requests that never needed payments.",
      ],
      callout: {
        kind: "warn",
        text: "Many client libraries default to no timeout, or to minutes. A slow dependency then becomes your outage.",
      },
      metrics: [
        { label: "Latency", value: "forever", level: "bad" },
        { label: "Success rate", value: "falling", level: "bad" },
        { label: "Load on payments", value: "normal", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay"],
        hot: ["pay"],
        flows: [{ link: "ap", tone: "warn", label: "waiting..." }],
        badges: { api: "threads piling up", pay: "stuck" },
      },
    },
    {
      short: "Timeouts",
      title: "Set a timeout on every call",
      body: [
        "A timeout turns an unbounded wait into a bounded failure. After 500 ms the API gives up, frees the thread and can return an error or a fallback.",
        "Set both a connect timeout (short, around 100 to 300 ms) and a read timeout for the response. Failing fast is usually better than failing slowly.",
      ],
      callout: {
        kind: "tip",
        text: "Pass a deadline down the chain. If the client allows 2 s in total, each hop gets only what is left of it.",
      },
      metrics: [
        { label: "Latency", value: "capped 500 ms", level: "warn" },
        { label: "Attempts", value: "1", level: "good" },
        { label: "Success rate", value: "99%", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay"],
        hot: ["api"],
        flows: [
          { link: "ap", label: "charge $20" },
          { link: "ap", reverse: true, tone: "warn", delay: 1, label: "timeout 500 ms" },
        ],
        badges: { api: "gave up, freed thread" },
      },
    },
    {
      short: "Choosing",
      title: "How long should the timeout be?",
      body: [
        "Look at the dependency's real latency. Say payments has p50 of 40 ms, p99 of 220 ms and p99.9 of 900 ms. A timeout near 300 to 500 ms cuts off the slow tail without failing normal requests.",
        "Too short and you cause false failures and retries; too long and you hold resources while a dead call drags on.",
      ],
      callout: {
        kind: "insight",
        text: "A good starting rule: timeout a little above the p99 latency, then check it against your overall deadline.",
      },
      metrics: [
        { label: "Latency", value: "p99 220 ms", level: "good" },
        { label: "Attempts", value: "1", level: "good" },
        { label: "Success rate", value: "99.5%", level: "good" },
      ],
      scene: {
        show: ["api", "pay"],
        hot: ["pay"],
        badges: { api: "timeout 400 ms", pay: "p50 40 / p99 220 ms" },
      },
    },
    {
      short: "Retries",
      title: "Retry the transient failures",
      body: [
        "Many failures are brief: a dropped packet, a server restarting, a momentary overload. A second attempt a moment later often succeeds.",
        "Retry on timeouts, connection errors and `503`, but not on `400` or `404`, since repeating a wrong request just fails again.",
      ],
      callout: {
        kind: "tip",
        text: "Cap attempts at 2 or 3. The cost of a retry is extra latency, and the extra load lands on a system that is already struggling.",
      },
      metrics: [
        { label: "Latency", value: "40-900 ms", level: "warn" },
        { label: "Attempts", value: "up to 3", level: "warn" },
        { label: "Success rate", value: "99.95%", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay"],
        flows: [
          { link: "ap", tone: "warn", label: "try 1: failed" },
          { link: "ap", delay: 0.9, label: "try 2" },
          { link: "ap", reverse: true, tone: "res", delay: 1.6, label: "ok" },
        ],
        badges: { api: "retry once" },
      },
    },
    {
      short: "Backoff",
      title: "Backoff and jitter",
      body: [
        "Retrying instantly hits a struggling server again before it recovers. Wait longer after each failure: 100 ms, 200 ms, 400 ms, and so on, called exponential backoff.",
        "Add jitter, a random fraction of that delay. Without it, 10,000 clients that failed together all retry at the same instant and cause the next spike.",
      ],
      callout: {
        kind: "insight",
        text: "A common form is `sleep = random(0, min(cap, base x 2^attempt))`, which spreads retries across the whole window.",
      },
      metrics: [
        { label: "Latency", value: "+100-400 ms", level: "warn" },
        { label: "Attempts", value: "up to 3", level: "warn" },
        { label: "Load on payments", value: "spread out", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay"],
        flows: [
          { link: "ap", tone: "warn", label: "fail, wait 100 ms" },
          { link: "ap", delay: 1, tone: "warn", label: "fail, wait 230 ms" },
          { link: "ap", delay: 2, label: "try 3" },
        ],
        badges: { api: "random delays" },
      },
    },
    {
      short: "Idempotency",
      title: "Retries and double charges",
      body: [
        "A timeout does not mean the request failed. Payments may have charged the card and the reply was lost, so a retry could charge twice.",
        "Make the operation idempotent: the client sends an `Idempotency-Key` header, and the server stores the result under that key. A repeated key returns the saved result instead of acting again.",
      ],
      callout: {
        kind: "warn",
        text: "Reads and `PUT`s are naturally safe to retry. Creating things and moving money are not, unless you add a key.",
      },
      metrics: [
        { label: "Attempts", value: "2", level: "warn" },
        { label: "Success rate", value: "100%, one charge", level: "good" },
      ],
      scene: {
        show: ["api", "pay", "db"],
        hot: ["db"],
        bubbles: { api: "key: 8f3a-91c2" },
        flows: [
          { link: "ap", label: "charge (key 8f3a)" },
          { link: "ad", delay: 0.6, label: "key seen?" },
          { link: "ap", reverse: true, tone: "res", delay: 1.2, label: "same result" },
        ],
        badges: { db: "stores key + result" },
      },
    },
    {
      short: "Retry storm",
      title: "Case: retries make an outage worse",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Payments slows down. Each of 3 layers (client, API, a worker) retries 3 times. One user action can become `3 x 3 x 3 = 27` calls to payments.",
        "A service that was at 90% capacity gets 3 times the traffic and collapses. Now every call times out, which triggers even more retries, so it cannot recover until the load is removed.",
      ],
      callout: {
        kind: "warn",
        text: "Retry at one layer only, normally the one closest to the user, and let the others fail fast.",
      },
      metrics: [
        { label: "Latency", value: "all time out", level: "bad" },
        { label: "Attempts", value: "27 per action", level: "bad" },
        { label: "Success rate", value: "4%", level: "bad" },
        { label: "Load on payments", value: "300%", level: "bad" },
      ],
      scene: {
        show: ["you", "api", "pay"],
        hot: ["pay"],
        flows: [
          { link: "ua", tone: "warn", label: "retry x3" },
          { link: "ap", tone: "warn", label: "retry x3 each" },
          { link: "ap", tone: "warn", delay: 0.3 },
        ],
        badges: { pay: "buried in retries" },
      },
    },
    {
      short: "Breaker",
      title: "Circuit breakers stop the bleeding",
      body: [
        "A circuit breaker counts recent failures. After, say, 50% failures over 20 calls it opens and rejects calls immediately for 30 seconds, without touching the dependency at all.",
        "Then it goes half-open and lets a few probe calls through. If they succeed the breaker closes; if not it stays open. The sick service gets room to recover.",
      ],
      callout: {
        kind: "tip",
        text: 'Pair an open breaker with a fallback: a cached value, a default, or a clear "try again shortly" message.',
      },
      metrics: [
        { label: "Latency", value: "~1 ms fail-fast", level: "good" },
        { label: "Attempts", value: "0 while open", level: "good" },
        { label: "Success rate", value: "partial", level: "warn" },
        { label: "Load on payments", value: "near 0", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay"],
        hot: ["api"],
        flows: [{ link: "ua", reverse: true, tone: "warn", label: "503, retry later" }],
        badges: { api: "breaker OPEN 30 s", pay: "left alone to recover" },
      },
    },
    {
      short: "Recap",
      title: "A checklist for calls you make",
      body: [
        "Set a timeout from the dependency's p99 and your deadline. Retry only transient, idempotent failures, at most 2 or 3 times, with exponential backoff and jitter, and at one layer.",
        "Add a circuit breaker so a slow dependency fails fast. Then watch it: track timeouts, retry counts and breaker state so you can see trouble before users do.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: timeout always; retry if transient and idempotent; break if failures keep coming.",
      },
      metrics: [
        { label: "Latency", value: "bounded", level: "good" },
        { label: "Attempts", value: "max 3", level: "good" },
        { label: "Success rate", value: "99.9%", level: "good" },
        { label: "Load on payments", value: "<= 1.3x", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay", "db"],
        badges: { api: "timeout + retry", pay: "protected", db: "idempotency keys" },
      },
    },
  ],
};
