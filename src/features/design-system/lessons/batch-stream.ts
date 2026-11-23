import type { Lesson } from "../lib/types";

export const batchStream: Lesson = {
  id: "batch-stream",
  title: "Batch & Stream Processing",
  summary:
    "Process data in big scheduled chunks or one event at a time, and choose by freshness and cost.",
  minutes: 15,
  level: "intermediate",
  goals: [
    "Why an append-only log decouples producers from processors",
    "How batch jobs trade freshness for throughput and simplicity",
    "How stream jobs keep state and use windows",
    "Event time, watermarks and late data",
    "Delivery guarantees and how to choose between the two models",
  ],
  takeaways: [
    "Batch is cheap, simple and easy to re-run, but its answers are hours old.",
    "Streaming gives answers in seconds at the price of state, windows and trickier correctness.",
    "A durable log lets you do both: stream for fresh numbers, replay the log in batch to correct them.",
  ],
  hud: [
    { label: "Throughput", icon: "gauge" },
    { label: "Freshness", icon: "timer" },
    { label: "Cost", icon: "database" },
    { label: "Correctness", icon: "shield" },
    { label: "Backlog", icon: "queue" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "clicks", x: 0, y: 110 },
    { id: "log", kind: "queue", label: "Event Log", x: 210, y: 110 },
    { id: "lake", kind: "db", label: "Data Lake", x: 210, y: 220 },
    { id: "stream", kind: "service", label: "Stream Job", x: 340, y: 0 },
    { id: "batch", kind: "service", label: "Batch Job", x: 340, y: 220 },
    { id: "live", kind: "cache", label: "Live Stats", x: 480, y: 0 },
    { id: "wh", kind: "db", label: "Warehouse", x: 480, y: 220 },
  ],
  links: [
    { id: "yl", from: "you", to: "log" },
    { id: "ll", from: "log", to: "lake" },
    { id: "ls", from: "log", to: "stream" },
    { id: "sv", from: "stream", to: "live" },
    { id: "lb", from: "lake", to: "batch" },
    { id: "bw", from: "batch", to: "wh" },
  ],
  steps: [
    {
      short: "Two questions",
      title: "Two very different questions",
      body: [
        "A shop emits 50,000 click events per second. The finance team wants a precise report of yesterday's revenue by product. The operations team wants to know how many orders arrived in the last minute.",
        "One question is about a large, complete, old dataset. The other is about a tiny, fresh slice that must be answered now. The same data, but two different processing models.",
      ],
      callout: {
        kind: "insight",
        text: "The deciding question is how stale an answer is allowed to be: a day, an hour, a minute, or a second.",
      },
      metrics: [
        { label: "Throughput", value: "50k ev/s", level: "good" },
        { label: "Freshness", value: "?", level: "warn" },
      ],
      scene: {
        show: ["you", "log"],
        flows: [{ link: "yl", label: "50k events / s" }],
        bubbles: { you: "view · add_to_cart · buy" },
      },
    },
    {
      short: "Event log",
      title: "Start with a durable log",
      body: [
        "Events are appended to a partitioned log such as Kafka. Producers write at the end; each consumer remembers its own offset and reads at its own pace, so a slow consumer never blocks a fast one.",
        "The log keeps data for days or weeks, so a new consumer can start from the beginning. That replay ability is what makes both models below practical.",
      ],
      callout: {
        kind: "tip",
        text: "Partition by a key such as `user_id` so all events for one entity stay in order on one partition, and scale consumers up to the partition count.",
      },
      metrics: [
        { label: "Throughput", value: "50k ev/s", level: "good" },
        { label: "Backlog", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "log", "lake"],
        hot: ["log"],
        flows: [
          { link: "yl", label: "append" },
          { link: "ll", delay: 0.6, label: "archive every 5 min" },
        ],
        badges: { log: "retained 7 days", lake: "cheap object storage" },
      },
    },
    {
      short: "Batch",
      title: "Batch: process a big pile, on a schedule",
      body: [
        "Each night a batch job reads the whole of yesterday's files from the lake, usually 4 billion events, aggregates them with Spark or SQL, and writes a clean table to the warehouse. It might take two hours on a rented cluster that is then shut off.",
        "Throughput is excellent and cost is low because machines run only while needed. The answer, however, is hours old, and a bug is fixed by simply running the job again.",
      ],
      callout: {
        kind: "insight",
        text: "Batch jobs are deterministic: same input, same output. That makes them easy to test, easy to backfill and easy to trust.",
      },
      metrics: [
        { label: "Throughput", value: "~600k ev/s", level: "good" },
        { label: "Freshness", value: "~24 h old", level: "bad" },
        { label: "Cost", value: "low", level: "good" },
        { label: "Correctness", value: "exact", level: "good" },
      ],
      scene: {
        show: ["lake", "batch", "wh"],
        hot: ["batch"],
        flows: [
          { link: "lb", label: "read 4B events" },
          { link: "bw", delay: 0.8, label: "daily revenue" },
        ],
        badges: { batch: "runs 02:00, takes 2 h" },
      },
    },
    {
      short: "Stream",
      title: "Stream: act on each event as it arrives",
      body: [
        "A stream job (Flink, Kafka Streams) reads the log continuously and updates running totals as events land. A new order changes the live counter within a second or two.",
        "The job is always on, so it costs money around the clock, and it keeps state, such as the counts so far, that must survive restarts. Correctness becomes your problem in real time.",
      ],
      callout: {
        kind: "warn",
        text: "Stateful streaming is harder to operate than it looks. State size, checkpoints and rebalances need monitoring from day one.",
      },
      metrics: [
        { label: "Throughput", value: "50k ev/s", level: "good" },
        { label: "Freshness", value: "~2 s", level: "good" },
        { label: "Cost", value: "high, always on", level: "warn" },
        { label: "Correctness", value: "approximate", level: "warn" },
      ],
      scene: {
        show: ["log", "stream", "live"],
        hot: ["stream"],
        flows: [
          { link: "ls", label: "each event" },
          { link: "sv", delay: 0.6, label: "orders last min: 412" },
        ],
        badges: { stream: "state: running counts", live: "refreshed every 1 s" },
      },
    },
    {
      short: "Windows",
      title: "Windows slice an endless stream",
      body: [
        "A stream never ends, so to count something you need a window. A tumbling window is fixed and non-overlapping, such as every minute. A sliding window moves in small steps, such as the last 5 minutes updated every 10 s. A session window closes after a gap of inactivity.",
        "Each window needs its own state, and wider or slower-moving windows hold more of it. Choose the smallest window that answers the business question.",
      ],
      callout: {
        kind: "tip",
        text: "Pre-aggregate inside the window instead of storing raw events. Keeping a counter per window uses a few bytes instead of millions of records.",
      },
      metrics: [
        { label: "Freshness", value: "~2 s", level: "good" },
        { label: "Cost", value: "high, always on", level: "warn" },
        { label: "Backlog", value: "0", level: "good" },
      ],
      scene: {
        show: ["log", "stream", "live"],
        hot: ["stream"],
        flows: [
          { link: "ls", label: "event 12:00:41" },
          { link: "sv", delay: 0.7, label: "window 12:00 to 12:01" },
        ],
        badges: { stream: "tumbling 1 min" },
      },
    },
    {
      short: "Case: late",
      title: "Case: an event arrives ten minutes late",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A phone loses signal and sends its `buy` event 10 minutes after it happened. Processing time says 12:10, but the event time says 12:00. Counting by arrival gives the wrong minute.",
        "Streams therefore use event time with a watermark: a moving estimate that says no events older than T are expected. The job closes the 12:00 window once the watermark passes it, with some allowed lateness. Events later than that are dropped or sent to a side output.",
      ],
      callout: {
        kind: "insight",
        text: "Watermarks trade freshness for completeness. A longer wait captures more stragglers but delays every result by the same amount.",
      },
      metrics: [
        { label: "Freshness", value: "~2 s + 30 s wait", level: "warn" },
        { label: "Correctness", value: "99.7% complete", level: "warn" },
        { label: "Backlog", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "log", "stream", "live"],
        hot: ["stream"],
        flows: [
          { link: "yl", tone: "warn", label: "event 12:00, sent 12:10" },
          { link: "ls", delay: 0.9, label: "late by 10 min" },
        ],
        badges: { stream: "watermark 12:09:30", live: "12:00 window: fixed" },
      },
    },
    {
      short: "Failure",
      title: "The stream job crashes",
      body: [
        "Machines fail. The job periodically takes a checkpoint, a snapshot of its state plus the log offsets it has read up to. After a crash it restores the last checkpoint and replays the log from that offset.",
        "That gives at-least-once processing for free: some events are handled twice. To get effectively exactly-once results you need idempotent writes or transactional commits of state and output together.",
      ],
      callout: {
        kind: "warn",
        text: "While the job is down, the log keeps growing. Watch consumer lag and size retention so a long outage does not delete events you have not read.",
      },
      metrics: [
        { label: "Freshness", value: "stale", level: "bad" },
        { label: "Backlog", value: "300k events", level: "bad" },
        { label: "Correctness", value: "at-least-once", level: "warn" },
      ],
      scene: {
        show: ["log", "stream", "live"],
        down: ["stream"],
        flows: [{ link: "ls", tone: "warn", label: "lag growing" }],
        badges: { log: "offset 91,200 unread", live: "last update 12:03" },
      },
    },
    {
      short: "Both",
      title: "Use both: fast path and correct path",
      body: [
        "The lambda pattern runs a stream path for quick, approximate numbers and a batch path that recomputes the exact ones later, replacing the stream's figures. The cost is two code paths that must agree.",
        "The kappa idea uses a single stream engine and fixes mistakes by replaying the log through a corrected job. It is simpler to maintain but needs a log with long retention and a stream engine you trust for heavy reprocessing.",
      ],
      callout: {
        kind: "tip",
        text: "Whichever you choose, put the shared business logic in one library so the fast and the correct path cannot drift apart.",
      },
      metrics: [
        { label: "Throughput", value: "50k ev/s", level: "good" },
        { label: "Freshness", value: "2 s, then exact", level: "good" },
        { label: "Cost", value: "highest", level: "warn" },
        { label: "Correctness", value: "exact after batch", level: "good" },
      ],
      scene: {
        show: ["log", "lake", "stream", "batch", "live", "wh"],
        flows: [
          { link: "ls", label: "fast path" },
          { link: "ll", delay: 0.4, label: "archive" },
          { link: "lb", delay: 0.8, label: "exact path" },
        ],
        badges: { live: "approximate, now", wh: "exact, tomorrow" },
      },
    },
    {
      short: "Recap",
      title: "Choosing with a simple rule",
      body: [
        "Pick by freshness need. If hours-old answers are fine (reports, model training, billing), use batch: it is cheapest and easiest to reason about. If decisions happen in seconds (fraud, alerts, live dashboards), use streaming.",
        "Default to batch and add streaming only for the few metrics that truly need it. Keep the event log as the source of truth either way, so you can always replay, backfill and correct.",
      ],
      callout: {
        kind: "insight",
        text: "Most teams are best served by mostly batch with a thin streaming layer. Real-time everything is expensive and rarely needed.",
      },
      metrics: [
        { label: "Throughput", value: "50k ev/s", level: "good" },
        { label: "Freshness", value: "2 s to 24 h", level: "warn" },
        { label: "Cost", value: "batch < stream", level: "warn" },
        { label: "Correctness", value: "replay to fix", level: "good" },
        { label: "Backlog", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "log", "lake", "stream", "batch", "live", "wh"],
        badges: { log: "source of truth", stream: "seconds", batch: "hours" },
      },
    },
  ],
};
