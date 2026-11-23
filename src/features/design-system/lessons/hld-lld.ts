import type { Lesson } from "../lib/types";

export const hldLld: Lesson = {
  id: "hld-lld",
  title: "HLD & LLD",
  summary: "Go from a vague requirement to boxes and arrows, then zoom in to classes and APIs.",
  minutes: 8,
  level: "beginner",
  goals: [
    "What high-level and low-level design each answer",
    "How requirements and rough numbers shape the boxes",
    "How to split a system into services and data stores",
    "How to zoom into one box: classes, methods and API contracts",
  ],
  takeaways: [
    "High-level design decides which components exist and how they talk; low-level design decides how one component is built inside.",
    "Start from requirements and rough numbers, because they tell you which boxes you actually need.",
    "Finish by walking one real request through both levels to check that the pieces fit.",
  ],
  hud: [
    { label: "Requests / s", icon: "gauge" },
    { label: "Storage / year", icon: "database" },
    { label: "Components", icon: "layers" },
    { label: "Latency goal", icon: "timer" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "Client", x: 100, y: 150 },
    { id: "api", kind: "server", label: "API", x: 300, y: 150 },
    { id: "ord", kind: "service", label: "Orders", x: 430, y: 40 },
    { id: "pay", kind: "service", label: "Payments", x: 430, y: 150 },
    { id: "inv", kind: "service", label: "Inventory", x: 430, y: 260 },
    { id: "odb", kind: "db", label: "Orders DB", x: 560, y: 40 },
    { id: "pdb", kind: "db", label: "Payments DB", x: 560, y: 150 },
    { id: "stock", kind: "cache", label: "Stock Cache", x: 560, y: 260 },
  ],
  links: [
    { id: "c-a", from: "you", to: "api" },
    { id: "a-o", from: "api", to: "ord" },
    { id: "a-p", from: "api", to: "pay" },
    { id: "a-i", from: "api", to: "inv" },
    { id: "o-d", from: "ord", to: "odb" },
    { id: "p-d", from: "pay", to: "pdb" },
    { id: "i-s", from: "inv", to: "stock" },
  ],
  steps: [
    {
      short: "Blank page",
      title: "Build me a small online shop",
      body: [
        "A one-line brief such as a shop where people browse and place orders hides hundreds of decisions. Jumping straight to code usually means redoing it later.",
        "Design work is a funnel. First decide what must exist and how big it must get (high-level design, HLD). Then decide how each piece works inside (low-level design, LLD).",
      ],
      callout: {
        kind: "insight",
        text: "HLD answers what are the parts and how do they talk. LLD answers how is one part built. Mixing them early is the usual way designs get muddy.",
      },
      metrics: [{ label: "Components", value: "0", level: "warn" }],
      scene: { show: ["you"], bubbles: { you: "Build me a shop" } },
    },
    {
      short: "Requirements",
      title: "Pin down requirements first",
      body: [
        "Functional requirements say what the system does: browse products, place an order, pay, see order history. Non-functional ones say how well: fast, available, consistent where money is involved.",
        "Ask about scope before drawing anything. Is it one country or global? Are there flash sales? Can an order be placed twice by accident? Each answer removes or adds a box.",
      ],
      callout: {
        kind: "tip",
        text: "Write down three or four must-haves and explicitly list what you are leaving out. A stated non-goal saves an hour of debate later.",
      },
      metrics: [
        { label: "Latency goal", value: "< 300 ms", level: "good" },
        { label: "Components", value: "0", level: "warn" },
      ],
      scene: {
        show: ["you"],
        hot: ["you"],
        bubbles: { you: "browse - order - pay" },
        badges: { you: "99.9% uptime" },
      },
    },
    {
      short: "Numbers",
      title: "Do the back-of-envelope maths",
      body: [
        "Say 1 million orders a day. That is about 12 orders per second on average, maybe 10 times that at a sale peak, so roughly 120 per second. Browsing is far heavier, perhaps 100 reads for every order.",
        "At about 2 KB per order, a year is 1,000,000 x 365 x 2 KB, around 730 GB. That fits on one database server today, so you do not need sharding yet. The numbers just told you what not to build.",
      ],
      callout: {
        kind: "insight",
        text: "Estimates need only the right order of magnitude. 12 per second and 12,000 per second lead to completely different designs.",
      },
      metrics: [
        { label: "Requests / s", value: "~1,200 reads, 120 writes", level: "good" },
        { label: "Storage / year", value: "~730 GB", level: "good" },
        { label: "Latency goal", value: "< 300 ms", level: "good" },
      ],
      scene: { show: ["you", "api"], hot: ["api"], badges: { api: "peak ~1,300 req/s" } },
    },
    {
      short: "First boxes",
      title: "Draw the first boxes",
      body: [
        "Start with the simplest thing that meets the numbers: a client, an API that holds the business logic, and a database. That is a valid high-level design, and for many products it is enough.",
        "Resist adding boxes you cannot justify with a requirement. Every box is something that can fail, needs deploying and has to be understood by the next person.",
      ],
      metrics: [
        { label: "Components", value: "3", level: "good" },
        { label: "Requests / s", value: "1,300 on one API", level: "good" },
      ],
      scene: {
        show: ["you", "api", "ord", "odb"],
        hot: ["api"],
        flows: [
          { link: "c-a", label: "POST /orders" },
          { link: "a-o", delay: 0.6 },
          { link: "o-d", delay: 1.2, label: "INSERT order" },
        ],
        badges: { api: "business logic" },
      },
    },
    {
      short: "Split",
      title: "Split along clear responsibilities",
      body: [
        "As the product grows, carve out parts that change for different reasons or scale differently. Payments talks to an external provider and must be audited. Inventory is read constantly and benefits from a cache. Orders is the core record.",
        "Give each service its own data store so teams can change schemas independently. The price: you can no longer join across them in SQL, so cross-service flows need careful design.",
      ],
      callout: {
        kind: "warn",
        text: "Do not split a small system into many services just in case. Every network hop adds latency and a new way to fail; split when ownership or scaling demands it.",
      },
      metrics: [
        { label: "Components", value: "8", level: "warn" },
        { label: "Latency goal", value: "< 300 ms", level: "good" },
      ],
      scene: {
        show: ["you", "api", "ord", "pay", "inv", "odb", "pdb", "stock"],
        hot: ["pay", "inv", "ord"],
        badges: { ord: "owns orders", pay: "owns payments", inv: "reads >> writes" },
      },
    },
    {
      short: "Zoom in",
      title: "Zoom into one box (LLD)",
      body: [
        "Low-level design opens a single box. Inside Orders you might have an `OrderController` that parses requests, an `OrderService` with the rules, and an `OrderRepository` that talks to the database.",
        "Model the nouns as classes: `Order`, `OrderLine`, `Money`, with an `OrderStatus` of `PENDING`, `PAID` or `SHIPPED`. Keep rules (an order needs at least one line) inside the model so they cannot be skipped.",
      ],
      callout: {
        kind: "tip",
        text: "Put dependencies behind interfaces, such as `PaymentGateway`. Then you can swap a provider or fake it in a test without touching the order rules.",
      },
      metrics: [{ label: "Components", value: "1 in focus", level: "good" }],
      scene: {
        show: ["ord", "odb"],
        hot: ["ord"],
        bubbles: { ord: "OrderService.place()" },
        badges: { ord: "Controller - Service - Repo", odb: "orders, order_lines" },
      },
    },
    {
      short: "API contract",
      title: "Define the contract between boxes",
      body: [
        "The boundary between components is an API, and it deserves care. For placing an order: `POST /orders` with a client-supplied `Idempotency-Key` header, returning `201` and an order id, or `409` if the key was already used.",
        "Decide error shapes, pagination (`?cursor=`) and versioning now. Once other teams call your API, changing it is expensive. The contract is the part of LLD that outlives the code.",
      ],
      callout: {
        kind: "insight",
        text: "An idempotency key makes retries safe: a double-click or a network retry returns the original order instead of creating a duplicate charge.",
      },
      metrics: [{ label: "Latency goal", value: "< 300 ms", level: "good" }],
      scene: {
        show: ["you", "api", "ord"],
        hot: ["api"],
        flows: [
          { link: "c-a", label: "POST /orders" },
          { link: "a-o", delay: 0.6, label: "place(cart, key)" },
          { link: "c-a", reverse: true, tone: "res", delay: 1.4, label: "201 + order id" },
        ],
        bubbles: { you: "Idempotency-Key: 7f3a" },
      },
    },
    {
      short: "Walk-through",
      title: "Case: place one order end to end",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Trace a real request through every level. The client calls the API, which asks Inventory to reserve stock from its cache, then Orders to save the order, then Payments to charge the card.",
        "Doing this walk reveals gaps: what if payment fails after stock was reserved? You need a release step, which is a new method on `InventoryService`. Designs are checked by walking requests through them.",
      ],
      callout: {
        kind: "warn",
        text: "Money and stock must not drift apart. Decide up front which step is the source of truth and how a failed step is undone.",
      },
      metrics: [
        { label: "Latency goal", value: "~220 ms", level: "good" },
        { label: "Components", value: "6 touched", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "ord", "pay", "inv", "odb", "pdb", "stock"],
        hot: ["api"],
        flows: [
          { link: "a-i", label: "1 reserve stock" },
          { link: "a-o", delay: 0.5, label: "2 save order" },
          { link: "a-p", delay: 1.0, label: "3 charge card" },
        ],
      },
    },
    {
      short: "Recap",
      title: "From brief to blueprint",
      body: [
        "Requirements and rough numbers decide the boxes. HLD arranges them and the arrows between. LLD fills one box with classes, methods and an API contract. Walk a request through to verify.",
        "Rule of thumb: stay at the highest level that still answers the question in front of you, and zoom in only when a box turns out to be hard.",
      ],
      callout: {
        kind: "tip",
        text: "In an interview or a design doc, spend roughly a third of the time on requirements and numbers, a third on HLD, and the rest on the one or two boxes that matter.",
      },
      metrics: [
        { label: "Requests / s", value: "1,300 peak", level: "good" },
        { label: "Storage / year", value: "~730 GB", level: "good" },
        { label: "Components", value: "8", level: "good" },
        { label: "Latency goal", value: "< 300 ms", level: "good" },
      ],
      scene: {
        show: ["you", "api", "ord", "pay", "inv", "odb", "pdb", "stock"],
        badges: { you: "requirements", api: "HLD", ord: "LLD" },
      },
    },
  ],
};
