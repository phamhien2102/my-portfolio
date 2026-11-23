import type { Lesson } from "../lib/types";

export const observability: Lesson = {
  id: "observability",
  title: "Observability",
  summary: "Use logs, metrics and traces to see what a running system is doing and why it hurts.",
  minutes: 11,
  level: "intermediate",
  goals: [
    "The difference between monitoring and observability",
    "What logs, metrics and traces each answer",
    "Why percentiles beat averages for latency",
    "How to alert on symptoms and SLOs, not noise",
    "How the three signals combine in a real investigation",
  ],
  takeaways: [
    "Metrics tell you that something is wrong, traces show where, and logs explain why.",
    "Track percentiles and error rates per endpoint; averages hide the users who suffer.",
    "Alert on user-facing symptoms and error-budget burn, and keep metric labels low in cardinality.",
  ],
  hud: [
    { label: "Error rate", icon: "alert" },
    { label: "p99 latency", icon: "timer" },
    { label: "Alerts", icon: "shield" },
    { label: "Telemetry", icon: "database" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "Users", x: 100, y: 150 },
    { id: "api", kind: "server", label: "API", x: 330, y: 150 },
    { id: "pay", kind: "service", label: "Payments", x: 560, y: 50 },
    { id: "db", kind: "db", label: "Database", x: 560, y: 250 },
    { id: "col", kind: "queue", label: "Collector", x: 330, y: 280 },
  ],
  links: [
    { id: "ua", from: "you", to: "api" },
    { id: "ap", from: "api", to: "pay" },
    { id: "ad", from: "api", to: "db" },
    { id: "ca", from: "col", to: "api" },
    { id: "cp", from: "col", to: "pay" },
    { id: "cd", from: "col", to: "db" },
  ],
  steps: [
    {
      short: "Problem",
      title: '"Checkout feels slow"',
      body: [
        "A support ticket says checkout is slow for some people. Your servers are up and the CPU looks fine, so nothing obviously broken is visible.",
        "Monitoring answers questions you thought of in advance. Observability is the ability to ask new questions of a live system, using the data it emits, without shipping new code.",
      ],
      callout: {
        kind: "insight",
        text: "You cannot debug what you cannot see. Plan what to record before the incident, not during it.",
      },
      metrics: [
        { label: "Error rate", value: "?", level: "warn" },
        { label: "p99 latency", value: "?", level: "warn" },
        { label: "Alerts", value: "0", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "pay", "db"],
        bubbles: { you: "checkout is slow" },
        badges: { api: "looks fine?" },
      },
    },
    {
      short: "Logs",
      title: "Logs: what happened",
      body: [
        "A log is a timestamped record of one event, such as `payment failed for order 8812`. It carries the detail you need to understand a single case.",
        "Write structured logs, for example JSON with `level`, `order_id` and `trace_id` fields, so you can filter and count them instead of grepping free text. Never log passwords, tokens or card numbers.",
      ],
      callout: {
        kind: "warn",
        text: "Logs are expensive at scale: 1 KB per request at 5,000 requests a second is about 430 GB a day. Sample and set retention.",
      },
      metrics: [{ label: "Telemetry", value: "430 GB/day", level: "warn" }],
      scene: {
        show: ["api", "pay", "db", "col"],
        hot: ["col"],
        flows: [
          { link: "ca", reverse: true, label: "{level:error,order:8812}" },
          { link: "cp", reverse: true, delay: 0.5 },
        ],
        badges: { col: "central log store" },
      },
    },
    {
      short: "Metrics",
      title: "Metrics: how much, how often",
      body: [
        "A metric is a number sampled over time: requests per second, error percentage, queue depth. They are tiny and cheap, so you can keep months of history and draw dashboards.",
        "A good starting set is RED for services: Rate, Errors and Duration. For resources use utilisation, saturation and errors.",
      ],
      callout: {
        kind: "tip",
        text: "Metrics tell you that something changed and when. They rarely tell you why, which is the job of logs and traces.",
      },
      metrics: [
        { label: "Error rate", value: "0.4%", level: "good" },
        { label: "p99 latency", value: "310 ms", level: "good" },
        { label: "Telemetry", value: "~2 MB/day", level: "good" },
      ],
      scene: {
        show: ["you", "api", "db", "col"],
        hot: ["col"],
        flows: [{ link: "ca", reverse: true, label: "req=5000/s err=0.4%" }],
        badges: { col: "time-series store" },
      },
    },
    {
      short: "Percentiles",
      title: "Averages hide the pain",
      body: [
        "Say 98 requests take 100 ms and 2 take 5 seconds. The average is about 200 ms and looks healthy, while 2% of users wait five seconds.",
        "Track percentiles: p50 is the typical user, p99 is the slow tail. Record latency as a histogram, because you cannot average percentiles after the fact.",
      ],
      callout: {
        kind: "insight",
        text: "A page that makes 20 backend calls hits the p99 of at least one of them in about 18% of loads, so tails matter more than they seem.",
      },
      metrics: [
        { label: "Error rate", value: "0.4%", level: "good" },
        { label: "p99 latency", value: "5 s (avg 200 ms)", level: "bad" },
      ],
      scene: {
        show: ["you", "api"],
        hot: ["api"],
        badges: { api: "avg 200 ms, p99 5 s", you: "2% wait 5 s" },
      },
    },
    {
      short: "Traces",
      title: "Traces: where the time went",
      body: [
        "A trace follows one request across services. The API creates a `trace_id`, passes it in a header, and every service records a span with its own start time and duration.",
        "Laid out on a timeline, a trace shows that 40 ms went to the API, 30 ms to the database and 900 ms to payments. You no longer guess which hop is slow.",
      ],
      callout: {
        kind: "tip",
        text: "Put the `trace_id` in every log line. Then you can jump from a slow trace straight to its logs.",
      },
      metrics: [
        { label: "p99 latency", value: "1.0 s", level: "bad" },
        { label: "Telemetry", value: "1% sampled", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay", "db"],
        hot: ["pay"],
        bubbles: { api: "trace 7c1e" },
        flows: [
          { link: "ap", label: "trace 7c1e" },
          { link: "ad", delay: 0.5 },
        ],
        badges: { api: "40 ms", db: "30 ms", pay: "900 ms" },
      },
    },
    {
      short: "Cardinality",
      title: "Watch out for label explosions",
      body: [
        "Metrics are stored once per unique combination of labels. A label like `endpoint` with 20 values is fine. A label like `user_id` with 2 million values creates 2 million separate series.",
        "Cost and query time grow with series count, and a careless label can crash the metrics store. Keep high-cardinality detail in logs and traces instead.",
      ],
      callout: {
        kind: "warn",
        text: "Never put user ids, order ids, URLs with ids or free text in metric labels.",
      },
      metrics: [{ label: "Telemetry", value: "2M series", level: "bad" }],
      scene: {
        show: ["api", "col"],
        hot: ["col"],
        flows: [{ link: "ca", reverse: true, tone: "warn", label: "user_id=... x 2M" }],
        badges: { col: "series count exploding" },
      },
    },
    {
      short: "Alerts",
      title: "Alert on symptoms, not noise",
      body: [
        "Page a human for what users feel: error rate above 2% for 5 minutes, or p99 above 1 s. A disk at 70% can go on a dashboard, not wake someone at 3 a.m.",
        "An SLO such as 99.9% of requests succeed in a month gives an error budget of 0.1%. Alert when you burn it too quickly, for example 10 times the sustainable rate for an hour.",
      ],
      callout: {
        kind: "insight",
        text: "Too many alerts train people to ignore them. Every page should need a human and have a clear next step.",
      },
      metrics: [
        { label: "Error rate", value: "3.1%", level: "bad" },
        { label: "p99 latency", value: "1.2 s", level: "bad" },
        { label: "Alerts", value: "1 paging", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "col"],
        hot: ["col"],
        flows: [{ link: "ca", reverse: true, tone: "warn", label: "errors > 2% for 5 min" }],
        badges: { col: "ALERT: checkout errors" },
      },
    },
    {
      short: "Debugging",
      title: "Case: find the slow checkout",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "The alert fires: p99 for `POST /checkout` jumped from 300 ms to 1.2 s at 14:05. The metric shows when and how big, but not why.",
        "A slow trace shows 900 ms inside Payments. Its logs, found by `trace_id`, say `connection pool exhausted` right after a 14:03 deploy cut the pool size from 50 to 5. Rolling back restores normal latency within a minute.",
      ],
      callout: {
        kind: "tip",
        text: "Also mark deploys on your dashboards. Most incidents begin with a change, and a vertical line makes it obvious.",
      },
      metrics: [
        { label: "Error rate", value: "3.1%", level: "bad" },
        { label: "p99 latency", value: "1.2 s", level: "bad" },
        { label: "Alerts", value: "1 paging", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "pay", "col"],
        hot: ["pay"],
        flows: [
          { link: "ua", tone: "warn", label: "p99 1.2 s" },
          { link: "cp", reverse: true, tone: "warn", delay: 0.5, label: "pool exhausted" },
        ],
        badges: { pay: "pool 5, was 50" },
      },
    },
    {
      short: "Recap",
      title: "Three signals, one workflow",
      body: [
        "Start with a metric or alert to see that users are hurting, follow a trace to find the slow hop, then read that request's logs to learn why.",
        "Instrument the golden signals on every service, propagate a trace id everywhere, log structured events, and alert on user-visible symptoms. Keep the data affordable with sampling and low-cardinality labels.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: metrics to detect, traces to locate, logs to explain.",
      },
      metrics: [
        { label: "Error rate", value: "0.3%", level: "good" },
        { label: "p99 latency", value: "300 ms", level: "good" },
        { label: "Alerts", value: "0", level: "good" },
        { label: "Telemetry", value: "sampled", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pay", "db", "col"],
        badges: { col: "logs + metrics + traces", api: "trace id on every hop" },
      },
    },
  ],
};
