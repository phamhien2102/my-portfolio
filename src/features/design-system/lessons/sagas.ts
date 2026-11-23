import type { Lesson } from "../lib/types";

export const sagas: Lesson = {
  id: "sagas",
  title: "Sagas & Distributed Transactions",
  summary:
    "Keep a multi-service business action consistent without locking every database at once.",
  minutes: 13,
  level: "advanced",
  goals: [
    "Why a single order cannot be one ACID transaction across services",
    "How a saga chains local transactions with compensations",
    "Orchestration versus choreography and their trade-offs",
    "Idempotency and the outbox pattern for safe retries",
    "A rule for choosing a saga over stronger coordination",
  ],
  takeaways: [
    "A saga replaces one big transaction with a series of local ones, plus an undo step for each.",
    "Sagas give eventual consistency, so intermediate states are visible and every step must be idempotent.",
    "Use an orchestrator when the flow is complex and needs visibility, and events when services should stay loosely coupled.",
  ],
  hud: [
    { label: "Local txns", icon: "database" },
    { label: "Compensations", icon: "alert" },
    { label: "Order state", icon: "layers" },
    { label: "Messages", icon: "queue" },
    { label: "End to end", icon: "timer" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "buyer", x: 0, y: 110 },
    { id: "saga", kind: "service", label: "Saga", sub: "orchestrator", x: 200, y: 110 },
    { id: "log", kind: "db", label: "Saga Log", x: 200, y: 220 },
    { id: "pay", kind: "service", label: "Payment", x: 340, y: 0 },
    { id: "stock", kind: "service", label: "Stock", x: 340, y: 110 },
    { id: "ship", kind: "service", label: "Shipping", x: 340, y: 220 },
    { id: "bus", kind: "queue", label: "Event Bus", x: 480, y: 110 },
  ],
  links: [
    { id: "ys", from: "you", to: "saga" },
    { id: "sl", from: "saga", to: "log" },
    { id: "sp", from: "saga", to: "pay" },
    { id: "ss", from: "saga", to: "stock" },
    { id: "sh", from: "saga", to: "ship" },
    { id: "pb", from: "pay", to: "bus" },
    { id: "kb", from: "stock", to: "bus" },
    { id: "hb", from: "ship", to: "bus" },
  ],
  steps: [
    {
      short: "One order",
      title: "One order, three databases",
      body: [
        "Placing an order must charge the card, reserve stock and book a shipment. In a monolith that is one transaction over one database. With microservices each step lives in a different service with its own storage.",
        "No single `BEGIN ... COMMIT` can span them. So what happens when the card is charged but the warehouse has no stock?",
      ],
      callout: {
        kind: "insight",
        text: "The core problem is partial failure. Any step can succeed or fail independently, and a crash can strike between any two of them.",
      },
      metrics: [
        { label: "Local txns", value: "0 / 3", level: "warn" },
        { label: "Order state", value: "NEW", level: "good" },
      ],
      scene: {
        show: ["you", "saga", "pay", "stock", "ship"],
        flows: [{ link: "ys", label: "place order #812" }],
        badges: { pay: "own DB", stock: "own DB", ship: "own DB" },
      },
    },
    {
      short: "Why not 2PC",
      title: "Two-phase commit is the textbook answer",
      body: [
        "Two-phase commit asks every participant to prepare and hold locks, then a coordinator tells all of them to commit. It gives true atomicity.",
        "But participants sit holding locks while the coordinator decides, and if it crashes in the gap they are stuck. Latency is the sum of the slowest participants, and many message queues, SaaS APIs and NoSQL stores do not support it at all.",
      ],
      callout: {
        kind: "warn",
        text: "Locks held across network calls turn a slow service into a system-wide stall. That is why 2PC is rare between independently owned services.",
      },
      metrics: [
        { label: "Local txns", value: "0 / 3", level: "warn" },
        { label: "End to end", value: "locks held ~200 ms", level: "bad" },
      ],
      scene: {
        show: ["saga", "pay", "stock", "ship"],
        hot: ["saga"],
        flows: [
          { link: "sp", tone: "warn", label: "prepare" },
          { link: "ss", tone: "warn", delay: 0.2 },
          { link: "sh", tone: "warn", delay: 0.4 },
        ],
        badges: { saga: "coordinator crash = stuck", pay: "row locked" },
      },
    },
    {
      short: "The saga",
      title: "A saga: local steps plus undo steps",
      body: [
        "A saga splits the business action into a sequence of local transactions. Each one commits immediately in its own service, and each has a compensation that semantically undoes it: charge has refund, reserve has release.",
        "If a later step fails, the saga runs the compensations for the finished steps in reverse. There is no global rollback, only new transactions that cancel the old ones.",
      ],
      callout: {
        kind: "insight",
        text: "A compensation is not a database rollback. The charge really happened and was visible, so the undo is a new, visible refund.",
      },
      metrics: [
        { label: "Local txns", value: "0 / 3", level: "warn" },
        { label: "Order state", value: "PENDING", level: "warn" },
      ],
      scene: {
        show: ["saga", "pay", "stock", "ship"],
        hot: ["saga"],
        badges: {
          pay: "do: charge / undo: refund",
          stock: "do: reserve / undo: release",
          ship: "do: book / undo: cancel",
        },
      },
    },
    {
      short: "Happy path",
      title: "When everything works",
      body: [
        "The saga asks Payment to charge, then Stock to reserve, then Shipping to book. After each reply it records progress, and when the last step returns the order moves to `CONFIRMED`.",
        "Between steps the order is in a visible intermediate state. A customer looking at their account right then sees `PENDING`, and your UI should be honest about that.",
      ],
      callout: {
        kind: "tip",
        text: "Order the steps so the hardest to undo comes last. Charging a card is easy to reverse, while handing a parcel to a courier is not.",
      },
      metrics: [
        { label: "Local txns", value: "3 / 3", level: "good" },
        { label: "Compensations", value: "0", level: "good" },
        { label: "Order state", value: "CONFIRMED", level: "good" },
        { label: "End to end", value: "~180 ms", level: "good" },
      ],
      scene: {
        show: ["you", "saga", "log", "pay", "stock", "ship"],
        flows: [
          { link: "sp", label: "charge $40" },
          { link: "ss", delay: 0.6, label: "reserve 1 unit" },
          { link: "sh", delay: 1.2, label: "book courier" },
        ],
        badges: { saga: "step 3 of 3" },
      },
    },
    {
      short: "Failure",
      title: "A step fails halfway",
      body: [
        "Suppose Shipping cannot find a courier for that address. The card has been charged and one unit is reserved, and both are already committed.",
        "The saga walks backwards: tell Stock to release the unit, then tell Payment to refund the $40. The order ends in `CANCELLED`, and every service is consistent again, just not instantly.",
      ],
      callout: {
        kind: "warn",
        text: "Compensations can fail too. They must be retried until they succeed, so design them to be safe to run more than once.",
      },
      metrics: [
        { label: "Local txns", value: "2 / 3", level: "bad" },
        { label: "Compensations", value: "2", level: "warn" },
        { label: "Order state", value: "CANCELLED", level: "bad" },
        { label: "End to end", value: "~400 ms", level: "warn" },
      ],
      scene: {
        show: ["saga", "pay", "stock", "ship"],
        down: ["ship"],
        flows: [
          { link: "ss", reverse: true, tone: "warn", label: "release unit" },
          { link: "sp", reverse: true, tone: "warn", delay: 0.8, label: "refund $40" },
        ],
        badges: { ship: "no courier" },
      },
    },
    {
      short: "Orchestrate",
      title: "Orchestration: one conductor",
      body: [
        "In orchestration a single saga coordinator holds the plan. It sends commands, waits for replies and records each state change in a durable log, so after a crash it can resume from the last recorded step.",
        "The flow lives in one readable place, and you can ask what state order 812 is in. The risk is that the orchestrator knows about every service, and it must itself be reliable and replicated.",
      ],
      callout: {
        kind: "tip",
        text: "Workflow engines such as Temporal or AWS Step Functions give you the durable log, retries and timers, so you do not hand-build them.",
      },
      metrics: [
        { label: "Local txns", value: "2 / 3", level: "warn" },
        { label: "Order state", value: "PENDING", level: "warn" },
        { label: "Messages", value: "6", level: "good" },
      ],
      scene: {
        show: ["saga", "log", "pay", "stock", "ship"],
        hot: ["saga", "log"],
        flows: [
          { link: "sl", label: "step 2 done" },
          { link: "ss", delay: 0.6, label: "command" },
        ],
        badges: { log: "order 812: step 2", saga: "restart: resume from log" },
      },
    },
    {
      short: "Choreograph",
      title: "Choreography: services react to events",
      body: [
        "In choreography there is no conductor. Payment publishes `PaymentTaken`, Stock listens and publishes `StockReserved`, Shipping listens to that, and a failure event triggers the compensations.",
        "Services stay loosely coupled and there is no central bottleneck. But the overall flow is scattered across many consumers, so it is harder to see, debug and change, and cyclic event chains are easy to create by accident.",
      ],
      callout: {
        kind: "insight",
        text: "A common rule: choreography for two or three steps with simple branching, orchestration once the flow has conditions, timeouts or more than about four participants.",
      },
      metrics: [
        { label: "Local txns", value: "3 / 3", level: "good" },
        { label: "Order state", value: "CONFIRMED", level: "good" },
        { label: "Messages", value: "3 events", level: "good" },
        { label: "End to end", value: "~220 ms", level: "good" },
      ],
      scene: {
        show: ["pay", "stock", "ship", "bus"],
        hot: ["bus"],
        flows: [
          { link: "pb", label: "PaymentTaken" },
          { link: "kb", delay: 0.7, label: "StockReserved" },
          { link: "hb", delay: 1.4, label: "ShipmentBooked" },
        ],
      },
    },
    {
      short: "Case: twice",
      title: "Case: the charge is delivered twice",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Messaging is usually at-least-once: if the reply to a `charge` command is lost, the orchestrator retries and Payment sees it twice. Without protection the customer is charged $80 for a $40 order.",
        "The fix is idempotency. The saga sends a unique key such as `order-812-charge`, and Payment stores it with the result, so a repeat returns the stored result instead of acting again.",
      ],
      callout: {
        kind: "tip",
        text: "Pair this with the outbox pattern: write the state change and the outgoing message in one local transaction, then a relay publishes it. That removes the crash gap between save and send.",
      },
      metrics: [
        { label: "Local txns", value: "1 / 3", level: "warn" },
        { label: "Compensations", value: "0", level: "good" },
        { label: "Messages", value: "2 (1 duplicate)", level: "warn" },
      ],
      scene: {
        show: ["saga", "pay"],
        hot: ["pay"],
        flows: [
          { link: "sp", label: "charge (key 812-c)" },
          { link: "sp", delay: 0.8, tone: "warn", label: "retry, same key" },
          { link: "sp", reverse: true, tone: "res", delay: 1.4, label: "already done" },
        ],
        badges: { pay: "charged once" },
      },
    },
    {
      short: "Recap",
      title: "Choosing and living with sagas",
      body: [
        "Use a saga when a business action spans services and you can tolerate seeing intermediate states for a few hundred milliseconds. Use a single database transaction when the data can live together, and strong coordination only when the stakes demand it.",
        "Checklist: every step has a compensation, every handler is idempotent, state is persisted before and after each step, and there are timeouts plus a dead-letter queue for steps that never finish.",
      ],
      callout: {
        kind: "insight",
        text: "You trade atomicity and isolation for availability and independence. Eventual consistency is a design decision, so make it visible in the product.",
      },
      metrics: [
        { label: "Local txns", value: "3 / 3", level: "good" },
        { label: "Compensations", value: "0 to 2", level: "warn" },
        { label: "Order state", value: "CONFIRMED", level: "good" },
        { label: "Messages", value: "~6", level: "good" },
        { label: "End to end", value: "~200 ms", level: "good" },
      ],
      scene: {
        show: ["you", "saga", "log", "pay", "stock", "ship"],
        badges: {
          saga: "owns the flow",
          log: "durable state",
          pay: "idempotent",
          stock: "idempotent",
          ship: "idempotent",
        },
      },
    },
  ],
};
