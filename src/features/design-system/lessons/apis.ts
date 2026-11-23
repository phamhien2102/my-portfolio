import type { Lesson } from "../lib/types";

export const apis: Lesson = {
  id: "apis",
  title: "REST, RPC & GraphQL",
  summary: "Three ways to shape an API, and how to choose between them.",
  minutes: 11,
  level: "beginner",
  goals: [
    "How REST models resources and uses HTTP verbs",
    "How RPC exposes actions as function calls",
    "How GraphQL lets clients ask for exactly what they need",
    "Which failure modes each style invites",
    "A rule for choosing, and how to version safely",
  ],
  takeaways: [
    "REST is resource-oriented and cache-friendly, RPC is action-oriented and fast, GraphQL is client-shaped and flexible.",
    "Each style has a typical problem: chatty calls, tight coupling, or expensive queries.",
    "Choose by who the clients are, and design every API so it can change without breaking old callers.",
  ],
  hud: [
    { label: "Requests", icon: "link" },
    { label: "Payload", icon: "download" },
    { label: "Latency", icon: "timer" },
    { label: "Coupling", icon: "layers" },
  ],
  nodes: [
    { id: "app", kind: "user", label: "client", x: 100, y: 150 },
    { id: "api", kind: "server", label: "API", x: 330, y: 150 },
    { id: "orders", kind: "service", label: "Orders", x: 550, y: 40 },
    { id: "users", kind: "service", label: "Users", x: 550, y: 260 },
  ],
  links: [
    { id: "app-api", from: "app", to: "api" },
    { id: "api-orders", from: "api", to: "orders" },
    { id: "api-users", from: "api", to: "users" },
  ],
  steps: [
    {
      short: "Problem",
      title: "A client needs an order screen",
      body: [
        "A mobile app wants to show one order: its items, its status and the customer's name. The data lives in two services behind one API.",
        "An API is a contract between caller and server. The shape of that contract decides how many round trips, how many bytes and how much coupling you get.",
      ],
      callout: {
        kind: "insight",
        text: "An API is easy to add to and painful to change. Shape matters more than the technology underneath.",
      },
      metrics: [{ label: "Requests", value: "?", level: "warn" }],
      scene: {
        show: ["app", "api"],
        hot: ["api"],
        bubbles: { app: "order #1042 screen" },
      },
    },
    {
      short: "REST",
      title: "REST: resources and verbs",
      body: [
        "REST models nouns. `GET /orders/1042` reads an order, `POST /orders` creates one, `PUT` replaces it, `DELETE` removes it. Status codes say what happened: `200`, `201`, `404`, `409`.",
        "Because `GET` is safe and cacheable, browsers, proxies and CDNs can reuse responses with no extra work. That is REST's biggest practical advantage.",
      ],
      callout: {
        kind: "tip",
        text: "Make unsafe operations idempotent with a client-supplied key, so a retried `POST` does not create two orders.",
      },
      metrics: [
        { label: "Requests", value: "1", level: "good" },
        { label: "Payload", value: "4 KB", level: "good" },
        { label: "Latency", value: "60 ms", level: "good" },
        { label: "Coupling", value: "low", level: "good" },
      ],
      scene: {
        show: ["app", "api", "orders"],
        hot: ["api"],
        flows: [
          { link: "app-api", label: "GET /orders/1042" },
          { link: "api-orders", delay: 0.6 },
          { link: "app-api", reverse: true, tone: "res", delay: 1.2, label: "200 + order JSON" },
        ],
        bubbles: { app: "GET /orders/1042" },
      },
    },
    {
      short: "Chatty",
      title: "REST's catch: chatty clients",
      body: [
        "The order response holds only a `customerId`. To show a name the client makes a second call, `GET /users/77`, and one more per line item if it wants product details.",
        "On a phone with a `100 ms` round trip, four sequential calls cost `400 ms` before anything is drawn. Responses may also carry fields the screen never uses.",
      ],
      callout: {
        kind: "warn",
        text: "Over-fetching wastes bytes and under-fetching forces extra trips. Both hurt most on slow mobile networks.",
      },
      metrics: [
        { label: "Requests", value: "4", level: "bad" },
        { label: "Payload", value: "18 KB", level: "warn" },
        { label: "Latency", value: "400 ms", level: "bad" },
        { label: "Coupling", value: "low", level: "good" },
      ],
      scene: {
        show: ["app", "api", "orders", "users"],
        hot: ["app"],
        flows: [
          { link: "app-api", tone: "warn", label: "GET /orders/1042" },
          { link: "app-api", tone: "warn", delay: 0.5, label: "GET /users/77" },
          { link: "app-api", tone: "warn", delay: 1.0, label: "GET /products/5" },
        ],
        badges: { app: "4 round trips" },
      },
    },
    {
      short: "RPC",
      title: "RPC: call a function",
      body: [
        "RPC exposes verbs. The client calls `GetOrderWithCustomer(1042)` as if it were a local function, usually over a compact binary protocol like gRPC with a strict schema.",
        "It is fast and well typed, which suits service-to-service traffic. The cost is coupling: the client must know the exact procedures, and caching by generic infrastructure is harder.",
      ],
      callout: {
        kind: "tip",
        text: "RPC is a great default between your own backend services, where you control both ends and want low latency.",
      },
      metrics: [
        { label: "Requests", value: "1", level: "good" },
        { label: "Payload", value: "2 KB", level: "good" },
        { label: "Latency", value: "15 ms", level: "good" },
        { label: "Coupling", value: "high", level: "warn" },
      ],
      scene: {
        show: ["app", "api", "orders", "users"],
        hot: ["api"],
        flows: [
          { link: "app-api", label: "GetOrderWithCustomer" },
          { link: "api-orders", delay: 0.6 },
          { link: "api-users", delay: 0.6 },
          { link: "app-api", reverse: true, tone: "res", delay: 1.3, label: "typed reply" },
        ],
        bubbles: { app: "binary + schema" },
      },
    },
    {
      short: "GraphQL",
      title: "GraphQL: ask for what you need",
      body: [
        "GraphQL exposes one endpoint and a typed graph. The client sends a query naming the exact fields, such as the order's status, item titles and `customer { name }`, and gets back exactly that shape in one round trip.",
        "The server resolves each field, possibly calling several services behind the scenes. Frontend teams can change what they fetch without waiting for a new backend endpoint.",
      ],
      callout: {
        kind: "insight",
        text: "GraphQL moves the join from the client's network to your data center, where hops cost microseconds instead of milliseconds.",
      },
      metrics: [
        { label: "Requests", value: "1", level: "good" },
        { label: "Payload", value: "1.5 KB", level: "good" },
        { label: "Latency", value: "70 ms", level: "good" },
        { label: "Coupling", value: "medium", level: "warn" },
      ],
      scene: {
        show: ["app", "api", "orders", "users"],
        hot: ["api"],
        flows: [
          { link: "app-api", label: "POST /graphql { query }" },
          { link: "api-orders", delay: 0.6 },
          { link: "api-users", delay: 0.6 },
          { link: "app-api", reverse: true, tone: "res", delay: 1.3, label: "exact shape" },
        ],
        bubbles: { app: "order { status customer { name } }" },
      },
    },
    {
      short: "Pitfalls",
      title: "GraphQL's catches",
      body: [
        "A naive resolver runs one query per item (the N+1 problem): 50 items means 51 database calls. Batching, for example with a loader that groups lookups, fixes it.",
        "Clients can also write enormous nested queries. Without depth limits, cost analysis and rate limits, one request can hurt the whole backend. And since everything is `POST /graphql`, HTTP caching no longer works for free.",
      ],
      callout: {
        kind: "warn",
        text: "Set a maximum query depth and a cost budget per request before you expose GraphQL to the public.",
      },
      metrics: [
        { label: "Requests", value: "1", level: "good" },
        { label: "Payload", value: "1.5 KB", level: "good" },
        { label: "Latency", value: "900 ms", level: "bad" },
        { label: "Coupling", value: "medium", level: "warn" },
      ],
      scene: {
        show: ["app", "api", "orders", "users"],
        hot: ["users"],
        flows: [
          { link: "api-users", tone: "warn", label: "50 lookups, one each" },
          { link: "api-users", tone: "warn", delay: 0.25 },
          { link: "api-users", tone: "warn", delay: 0.5 },
        ],
        badges: { users: "N+1 queries" },
      },
    },
    {
      short: "Versioning",
      title: "Evolving without breaking callers",
      body: [
        "Old mobile apps live for years, so you cannot assume clients update. Add fields freely, never remove or rename them silently, and never change the meaning of an existing field.",
        "When a break is unavoidable, introduce `/v2` and keep `/v1` running until usage drops. GraphQL leans on deprecating fields, gRPC on never reusing a field number.",
      ],
      callout: {
        kind: "tip",
        text: "Cheap rule: be liberal in what you accept, conservative in what you send, and track which clients still use old fields.",
      },
      metrics: [
        { label: "Requests", value: "1", level: "good" },
        { label: "Coupling", value: "managed", level: "good" },
      ],
      scene: {
        show: ["app", "api"],
        hot: ["api"],
        flows: [
          { link: "app-api", label: "/v1/orders (old app)" },
          { link: "app-api", delay: 0.7, label: "/v2/orders (new app)" },
        ],
        badges: { api: "both versions live" },
      },
    },
    {
      short: "Recap",
      title: "Which one should you pick?",
      body: [
        "Public APIs for many unknown clients: REST, for its simplicity and caching. Internal service calls where speed and schemas matter: RPC. Rich client apps with varied screens: GraphQL, in front of REST or RPC services.",
        "Many real systems use all three. What matters is that each boundary is chosen on purpose and versioned from day one.",
      ],
      callout: {
        kind: "tip",
        text: "Rule of thumb: REST outside, RPC inside, GraphQL where the client needs to shape the data.",
      },
      metrics: [
        { label: "Requests", value: "1-4", level: "good" },
        { label: "Payload", value: "1.5-18 KB", level: "good" },
        { label: "Latency", value: "15-400 ms", level: "warn" },
        { label: "Coupling", value: "low-high", level: "warn" },
      ],
      scene: {
        show: ["app", "api", "orders", "users"],
        badges: { app: "GraphQL or REST", api: "edge", orders: "RPC inside", users: "RPC inside" },
      },
    },
  ],
};
