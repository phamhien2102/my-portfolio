import type { Lesson } from "../lib/types";

export const pubsub: Lesson = {
  id: "pubsub",
  title: "Pub/Sub & Events",
  summary:
    "Announce what happened and let any number of services react, without knowing each other.",
  minutes: 10,
  level: "beginner",
  goals: [
    "Why direct calls couple services together",
    "How topics fan one event out to many subscribers",
    "What delivery guarantees mean in practice",
    "How replay and consumer lag work",
    "A case: a slow subscriber and a poison message",
  ],
  takeaways: [
    "Publishers announce facts to a topic; subscribers decide for themselves what to do with them.",
    "Delivery is normally at-least-once, so every subscriber must handle duplicates safely.",
    "Events decouple teams and absorb spikes, but they trade immediate consistency for eventual consistency.",
  ],
  hud: [
    { label: "Subscribers", icon: "users" },
    { label: "Publish time", icon: "timer" },
    { label: "Backlog", icon: "queue" },
    { label: "Delivery", icon: "shield" },
  ],
  nodes: [
    { id: "pub", kind: "service", label: "Orders", sub: "publisher", x: 100, y: 150 },
    { id: "topic", kind: "queue", label: "Topic", sub: "order.placed", x: 320, y: 150 },
    { id: "email", kind: "service", label: "Email", x: 540, y: 30 },
    { id: "search", kind: "service", label: "Search", x: 540, y: 150 },
    { id: "bill", kind: "service", label: "Billing", x: 540, y: 270 },
  ],
  links: [
    { id: "pub-topic", from: "pub", to: "topic" },
    { id: "topic-email", from: "topic", to: "email" },
    { id: "topic-search", from: "topic", to: "search" },
    { id: "topic-bill", from: "topic", to: "bill" },
  ],
  steps: [
    {
      short: "Problem",
      title: "One order, many reactions",
      body: [
        "When a customer places an order, several things must happen: send a confirmation email, update the search index, charge the card, notify the warehouse.",
        "The Orders service could call each one directly. That works until the list grows.",
      ],
      callout: {
        kind: "insight",
        text: "Every new reaction should not require changing the service that caused the event.",
      },
      metrics: [{ label: "Subscribers", value: "0", level: "good" }],
      scene: {
        show: ["pub"],
        hot: ["pub"],
        bubbles: { pub: "order #1042 placed" },
      },
    },
    {
      short: "Direct calls",
      title: "The cost of calling everyone",
      body: [
        "With direct calls Orders knows every downstream service and waits for each. If each takes `100 ms`, the customer waits `300 ms` more. If Email is down, does the order fail?",
        "Adding a fourth reaction means editing and redeploying Orders. The services are tightly coupled in time and in code.",
      ],
      callout: {
        kind: "warn",
        text: "In a chain of synchronous calls, availability multiplies. Three 99.9% services give about 99.7% together.",
      },
      metrics: [
        { label: "Subscribers", value: "3 hard-wired", level: "warn" },
        { label: "Publish time", value: "300 ms", level: "bad" },
        { label: "Delivery", value: "all or fail", level: "bad" },
      ],
      scene: {
        show: ["pub", "topic", "email", "search"],
        hot: ["pub"],
        flows: [
          { link: "pub-topic", tone: "warn", label: "call, wait 100 ms" },
          { link: "topic-email", tone: "warn", delay: 0.5 },
          { link: "topic-search", tone: "warn", delay: 1.0 },
        ],
        badges: { pub: "knows every consumer" },
      },
    },
    {
      short: "Publish",
      title: "Publish an event instead",
      body: [
        "Orders now publishes one small message to a topic: `OrderPlaced {id: 1042, total: 59.90}`. It names a fact in the past tense and does not say who should care.",
        "The broker stores it durably and acknowledges within a few milliseconds. Orders is done, and the customer gets their reply right away.",
      ],
      callout: {
        kind: "tip",
        text: "Name events after what happened (`OrderPlaced`), not what to do (`SendEmail`). Facts stay true as consumers change.",
      },
      metrics: [
        { label: "Subscribers", value: "0", level: "good" },
        { label: "Publish time", value: "5 ms", level: "good" },
        { label: "Delivery", value: "stored", level: "good" },
      ],
      scene: {
        show: ["pub", "topic"],
        hot: ["topic"],
        flows: [
          { link: "pub-topic", label: "OrderPlaced" },
          { link: "pub-topic", reverse: true, tone: "res", delay: 0.7, label: "ack, 5 ms" },
        ],
        bubbles: { topic: "{ id: 1042, total: 59.90 }" },
      },
    },
    {
      short: "Fan-out",
      title: "Fan-out to subscribers",
      body: [
        "Email, Search and Billing each subscribe to the topic. The broker delivers a copy of every event to each one, and each works at its own pace.",
        "A new team can subscribe tomorrow, say a loyalty-points service, without touching Orders at all. That is the main reason to use pub/sub.",
      ],
      callout: {
        kind: "insight",
        text: "Publishers and subscribers only share the event's shape. They need not know about each other's existence, language or deploy schedule.",
      },
      metrics: [
        { label: "Subscribers", value: "3", level: "good" },
        { label: "Publish time", value: "5 ms", level: "good" },
        { label: "Backlog", value: "0", level: "good" },
        { label: "Delivery", value: "all 3", level: "good" },
      ],
      scene: {
        show: ["pub", "topic", "email", "search", "bill"],
        hot: ["topic"],
        flows: [
          { link: "pub-topic", label: "OrderPlaced" },
          { link: "topic-email", delay: 0.6, label: "copy" },
          { link: "topic-search", delay: 0.6 },
          { link: "topic-bill", delay: 0.6 },
        ],
        badges: { email: "confirmation", search: "reindex", bill: "charge card" },
      },
    },
    {
      short: "Guarantees",
      title: "Delivery guarantees",
      body: [
        "At-most-once drops a message if anything fails: fast, but you can lose events. At-least-once retries until the subscriber acknowledges, so nothing is lost but duplicates happen. Exactly-once across systems is mostly a marketing phrase; real systems get it by deduplicating.",
        "Assume at-least-once. Give each event a unique id and make handlers idempotent, so processing `1042` twice charges the card once.",
      ],
      callout: {
        kind: "warn",
        text: "A charge handler that is not idempotent will double-bill the first time a network blip causes a retry.",
      },
      metrics: [
        { label: "Subscribers", value: "3", level: "good" },
        { label: "Delivery", value: "at least once", level: "warn" },
      ],
      scene: {
        show: ["topic", "bill"],
        hot: ["bill"],
        flows: [
          { link: "topic-bill", label: "OrderPlaced #1042" },
          { link: "topic-bill", reverse: true, tone: "warn", delay: 0.7, label: "ack lost" },
          { link: "topic-bill", delay: 1.4, label: "redelivered #1042" },
        ],
        badges: { bill: "seen #1042 already, skip" },
      },
    },
    {
      short: "Replay",
      title: "Retention, replay and lag",
      body: [
        "Many brokers keep events for days instead of deleting them on delivery. Each subscriber tracks its own position (an offset), so it can resume after downtime or rewind to rebuild a new index from history.",
        "The gap between the newest event and a subscriber's position is its lag. Watching lag is the simplest health check for an event system.",
      ],
      callout: {
        kind: "tip",
        text: "Alert on rising lag, not on queue size alone. Lag is the number that tells you how stale a consumer is.",
      },
      metrics: [
        { label: "Subscribers", value: "3", level: "good" },
        { label: "Backlog", value: "40 events", level: "warn" },
        { label: "Delivery", value: "replayable", level: "good" },
      ],
      scene: {
        show: ["topic", "search"],
        hot: ["search"],
        flows: [{ link: "topic-search", label: "resume at offset 9,960" }],
        badges: { topic: "keeps 7 days", search: "lag: 40" },
      },
    },
    {
      short: "Slow reader",
      title: "Case: a slow subscriber",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Billing is down for 10 minutes while Orders keeps publishing 50 events a second. Thirty thousand events wait in the topic.",
        "Orders and Email are not affected at all. When Billing returns it drains the backlog at its own speed, and the customer never saw an error. That isolation is the payoff.",
      ],
      callout: {
        kind: "insight",
        text: "The topic is a buffer between unequal speeds. Size retention to cover your longest plausible outage.",
      },
      metrics: [
        { label: "Subscribers", value: "2 of 3 up", level: "warn" },
        { label: "Publish time", value: "5 ms", level: "good" },
        { label: "Backlog", value: "30,000", level: "bad" },
        { label: "Delivery", value: "pending", level: "warn" },
      ],
      scene: {
        show: ["pub", "topic", "email", "search", "bill"],
        hot: ["topic"],
        down: ["bill"],
        flows: [
          { link: "pub-topic", label: "50 events/s" },
          { link: "topic-email", delay: 0.6 },
          { link: "topic-search", delay: 0.6 },
        ],
        badges: { bill: "down 10 min", topic: "30,000 waiting" },
      },
    },
    {
      short: "Poison",
      title: "Case: a poison message",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "One event has a malformed field and the Email handler crashes on it every time. If it simply retries forever, the whole stream behind that message is stuck.",
        "Set a retry limit, say 5 attempts with growing delays, then move the message to a dead-letter topic. A human or a repair job can inspect it later while healthy events continue.",
      ],
      callout: {
        kind: "warn",
        text: "Alert on dead-letter growth. A silent dead-letter queue is just a place where data goes to be forgotten.",
      },
      metrics: [
        { label: "Subscribers", value: "3", level: "good" },
        { label: "Backlog", value: "1 stuck", level: "warn" },
        { label: "Delivery", value: "5 retries", level: "warn" },
      ],
      scene: {
        show: ["topic", "email", "search", "bill"],
        hot: ["email"],
        flows: [
          { link: "topic-email", tone: "warn", label: "retry 5 of 5, fails" },
          { link: "topic-search", delay: 0.4 },
          { link: "topic-bill", delay: 0.4 },
        ],
        badges: { email: "to dead-letter topic" },
      },
    },
    {
      short: "Recap",
      title: "When to reach for events",
      body: [
        "Use pub/sub when one fact interests many parties, when work can happen later, or when you want to absorb bursts. Use a direct call when the caller needs the answer right now.",
        "Expect eventual consistency: Search may lag Orders by a second. Design for duplicates, keep events small and versioned, and watch lag and dead letters.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: need an answer now, call; announcing a fact, publish.",
      },
      metrics: [
        { label: "Subscribers", value: "3+", level: "good" },
        { label: "Publish time", value: "5 ms", level: "good" },
        { label: "Backlog", value: "~0", level: "good" },
        { label: "Delivery", value: "idempotent", level: "good" },
      ],
      scene: {
        show: ["pub", "topic", "email", "search", "bill"],
        badges: { pub: "announces facts", topic: "durable buffer", search: "own pace" },
      },
    },
  ],
};
