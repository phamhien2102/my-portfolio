import type { Lesson } from "../lib/types";

export const microservices: Lesson = {
  id: "microservices",
  title: "Monolith vs Microservices",
  summary:
    "When one deployable is a gift, when it becomes a bottleneck, and what splitting it really costs.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "Why a monolith is the right start for most products",
    "What pain pushes teams to split a system up",
    "How services own their data behind a gateway",
    "The costs of the network: latency, failure and availability maths",
    "A decision rule for when to split",
  ],
  takeaways: [
    "A monolith is simple and fast until team size, not traffic, makes every deploy a negotiation.",
    "Splitting trades function calls for network calls, so you pay in latency, partial failure and operational work.",
    "Split along team and data boundaries only when the pain is real, and a modular monolith is often enough.",
  ],
  hud: [
    { label: "Deploys / week", icon: "layers" },
    { label: "Call cost", icon: "timer" },
    { label: "Availability", icon: "shield" },
    { label: "Services", icon: "server" },
    { label: "Teams waiting", icon: "users" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "users", x: 0, y: 110 },
    { id: "mono", kind: "server", label: "Monolith", x: 200, y: 0 },
    { id: "mdb", kind: "db", label: "One DB", x: 320, y: 0 },
    { id: "gw", kind: "lb", label: "Gateway", x: 200, y: 110 },
    { id: "users", kind: "service", label: "Users", x: 450, y: 0 },
    { id: "orders", kind: "service", label: "Orders", x: 450, y: 110 },
    { id: "pay", kind: "service", label: "Payments", x: 450, y: 220 },
    { id: "udb", kind: "db", label: "Users DB", x: 570, y: 0 },
    { id: "odb", kind: "db", label: "Orders DB", x: 570, y: 110 },
    { id: "pdb", kind: "db", label: "Pay DB", x: 570, y: 220 },
  ],
  links: [
    { id: "ym", from: "you", to: "mono" },
    { id: "mm", from: "mono", to: "mdb" },
    { id: "yg", from: "you", to: "gw" },
    { id: "gu", from: "gw", to: "users" },
    { id: "go", from: "gw", to: "orders" },
    { id: "gp", from: "gw", to: "pay" },
    { id: "ud", from: "users", to: "udb" },
    { id: "od", from: "orders", to: "odb" },
    { id: "pd", from: "pay", to: "pdb" },
    { id: "op", from: "orders", to: "pay" },
  ],
  steps: [
    {
      short: "One codebase",
      title: "Everything ships as one program",
      body: [
        "A young shop has users, orders and payments. The simplest design is one codebase, built into one deployable, talking to one database. That is a monolith.",
        "It is easy to start, easy to run and easy to debug, so the question is not whether it works. It is what happens when the company grows around it.",
      ],
      callout: {
        kind: "insight",
        text: "A monolith is a packaging choice, not a quality judgement. Plenty of well-run products serve millions of users from one.",
      },
      metrics: [
        { label: "Deploys / week", value: "5", level: "good" },
        { label: "Services", value: "1", level: "good" },
        { label: "Teams waiting", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "mono", "mdb"],
        flows: [{ link: "ym", label: "POST /checkout" }],
        badges: { mono: "users + orders + pay" },
      },
    },
    {
      short: "Why it wins",
      title: "What a monolith gets right",
      body: [
        "Calling another module is a function call: tens of nanoseconds, no serialisation, no timeout to tune. A checkout that touches orders and payments is one database transaction that either commits or rolls back.",
        "There is one thing to deploy, one log to read and one place to set a breakpoint. A team of eight moves very fast in this setup.",
      ],
      callout: {
        kind: "tip",
        text: "Keep the code modular inside the monolith (clear folders, no reaching into another module's tables). Later splitting becomes a move, not a rewrite.",
      },
      metrics: [
        { label: "Deploys / week", value: "5", level: "good" },
        { label: "Call cost", value: "~50 ns", level: "good" },
        { label: "Availability", value: "99.9%", level: "good" },
        { label: "Services", value: "1", level: "good" },
      ],
      scene: {
        show: ["you", "mono", "mdb"],
        hot: ["mdb"],
        flows: [
          { link: "mm", label: "BEGIN … COMMIT" },
          { link: "mm", reverse: true, tone: "res", delay: 0.8, label: "one transaction" },
        ],
        badges: { mdb: "ACID across all tables" },
      },
    },
    {
      short: "The pain",
      title: "When the team outgrows it",
      body: [
        "At sixty engineers, a single deploy carries everyone's changes. One failing test blocks the whole release, merges queue up, and a bug in the reports module can take checkout down with it.",
        "Notice that traffic is not the issue. The app could still run on a handful of servers. The bottleneck is coordination between people.",
      ],
      callout: {
        kind: "warn",
        text: "If the real problem is a slow query or a missing cache, splitting into services will not fix it. Diagnose before you decompose.",
      },
      metrics: [
        { label: "Deploys / week", value: "1", level: "bad" },
        { label: "Services", value: "1", level: "good" },
        { label: "Teams waiting", value: "6", level: "bad" },
      ],
      scene: {
        show: ["you", "mono", "mdb"],
        hot: ["mono"],
        flows: [{ link: "ym" }],
        badges: { mono: "release train: every 2 weeks", mdb: "schema changes need 6 teams" },
      },
    },
    {
      short: "Split it",
      title: "Carve out services behind a gateway",
      body: [
        "Microservices split the product along business capabilities: Users, Orders, Payments. Each is a small program deployed on its own schedule by one team.",
        "Clients no longer know which service answers. They call a gateway, which routes `/orders/*` to Orders and `/pay/*` to Payments.",
      ],
      callout: {
        kind: "insight",
        text: "A good boundary is one where most changes stay inside a single service. If every feature touches three services, the cut is in the wrong place.",
      },
      metrics: [
        { label: "Deploys / week", value: "30", level: "good" },
        { label: "Services", value: "3", level: "warn" },
        { label: "Teams waiting", value: "1", level: "good" },
      ],
      scene: {
        show: ["you", "gw", "users", "orders", "pay"],
        hot: ["gw"],
        flows: [
          { link: "yg", label: "/orders/42" },
          { link: "go", delay: 0.7, label: "route" },
        ],
        badges: { orders: "team B owns it" },
      },
    },
    {
      short: "Own data",
      title: "Each service owns its data",
      body: [
        "The part people skip is the database. If two services share tables, they are still coupled: a column rename in one breaks the other and you only moved the monolith onto the network.",
        "So each service gets private storage and others must ask through its API. That frees every team to change schema or even pick a different database, at the price of losing cross-service joins and transactions.",
      ],
      callout: {
        kind: "warn",
        text: "A shared database with several services on top is a distributed monolith: all the cost of microservices, none of the independence.",
      },
      metrics: [
        { label: "Deploys / week", value: "30", level: "good" },
        { label: "Services", value: "3", level: "warn" },
        { label: "Teams waiting", value: "0", level: "good" },
      ],
      scene: {
        show: ["gw", "users", "orders", "pay", "udb", "odb", "pdb"],
        hot: ["udb", "odb", "pdb"],
        flows: [{ link: "ud" }, { link: "od", delay: 0.3 }, { link: "pd", delay: 0.6 }],
        badges: { odb: "only Orders may read", pdb: "only Payments may read" },
      },
    },
    {
      short: "Network tax",
      title: "Every call now crosses a network",
      body: [
        "Placing an order used to be a function call. Now Orders sends an HTTP or gRPC request to Payments: roughly 1 to 5 ms inside a data centre, plus serialisation, plus a timeout and a retry policy.",
        "It also adds a failure mode that did not exist: the call can be slow, lost, or answered twice. You must now decide what Orders does when Payments does not reply.",
      ],
      callout: {
        kind: "tip",
        text: "Always set a timeout shorter than your caller's, retry only idempotent calls, and add a circuit breaker so a sick dependency is not hammered.",
      },
      metrics: [
        { label: "Call cost", value: "~2 ms", level: "warn" },
        { label: "Services", value: "3", level: "warn" },
        { label: "Availability", value: "99.7%", level: "warn" },
      ],
      scene: {
        show: ["gw", "orders", "pay", "pdb"],
        hot: ["pay"],
        flows: [
          { link: "op", label: "charge $40" },
          { link: "op", reverse: true, tone: "res", delay: 0.9, label: "ok" },
        ],
        badges: { orders: "timeout 800 ms" },
      },
    },
    {
      short: "Pay is down",
      title: "Availability multiplies, and not in your favour",
      body: [
        "If a request needs Users, Orders and Payments in a chain and each is 99.9% available, the chain is about 99.7%: roughly 26 hours of trouble per year instead of 9.",
        "When Payments goes down, what should checkout do? Fail the whole order, queue it for later, or show a degraded page? Each choice must be designed on purpose.",
      ],
      callout: {
        kind: "insight",
        text: "Independent deploys give you fault isolation only if callers degrade gracefully. Otherwise one sick service drags down its neighbours.",
      },
      metrics: [
        { label: "Call cost", value: "timeout", level: "bad" },
        { label: "Availability", value: "99.7%", level: "bad" },
        { label: "Services", value: "3", level: "warn" },
      ],
      scene: {
        show: ["you", "gw", "orders", "pay"],
        down: ["pay"],
        flows: [
          { link: "yg", label: "/checkout" },
          { link: "op", tone: "warn", delay: 0.6, label: "timeout" },
        ],
        badges: { orders: "fallback: queue the order" },
      },
    },
    {
      short: "Case: 5 hops",
      title: "Case: a page that fans out to five services",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "The product page needs Users, Orders and Payments data, and each call has a p99 of 100 ms. Called one after another, the page waits up to 300 ms in the tail; called in parallel it waits about as long as the slowest.",
        "The more services in a request path, the more likely at least one is slow. At 5 calls with a 1% slow tail, about 5% of page loads hit a slow call.",
      ],
      callout: {
        kind: "tip",
        text: "Fan out in parallel, cache stable answers at the gateway, and keep synchronous call chains to two or three hops.",
      },
      metrics: [
        { label: "Call cost", value: "p99 300 ms", level: "bad" },
        { label: "Availability", value: "99.7%", level: "warn" },
        { label: "Services", value: "5", level: "bad" },
      ],
      scene: {
        show: ["you", "gw", "users", "orders", "pay"],
        hot: ["gw"],
        flows: [
          { link: "gu", label: "parallel" },
          { link: "go", delay: 0.1 },
          { link: "gp", delay: 0.2, tone: "warn", label: "slowest wins" },
        ],
        badges: { gw: "waits for all three" },
      },
    },
    {
      short: "Decide",
      title: "A decision rule",
      body: [
        "Stay with a modular monolith while one team can understand it and deploys are not a queue. Split when independent release speed, scaling one hot component, or strict isolation outweighs the new operational cost.",
        "Start with the seam that hurts most and give it its own data. You will also need tracing, service discovery, per-service dashboards and on-call, so budget for those before you split.",
      ],
      callout: {
        kind: "tip",
        text: "Rule of thumb: if you cannot run a clean monolith, microservices will not save you. You will just have the same mess over HTTP.",
      },
      metrics: [
        { label: "Deploys / week", value: "30+", level: "good" },
        { label: "Call cost", value: "~2 ms", level: "warn" },
        { label: "Availability", value: "99.7%", level: "warn" },
        { label: "Services", value: "3 to 30", level: "warn" },
        { label: "Teams waiting", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "gw", "users", "orders", "pay"],
        badges: { gw: "one front door", users: "own data", orders: "own data", pay: "own data" },
      },
    },
  ],
};
