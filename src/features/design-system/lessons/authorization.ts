import type { Lesson } from "../lib/types";

export const authorization: Lesson = {
  id: "authorization",
  title: "Authorization",
  summary:
    "Decide what a known caller may do: roles, ownership, scopes, and where the check must live.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "How authorization differs from authentication",
    "Roles, attributes and ownership as ways to decide",
    "Why the server must check on every request",
    "Insecure direct object references and how to stop them",
    "Scopes and a central policy service",
  ],
  takeaways: [
    "Authorization runs on every request, on the server, after you know who the caller is.",
    "Roles are simple, attributes and ownership checks are precise; real systems mix them and deny by default.",
    "Checking the login but not the resource is the classic bug: always ask whether this user may touch this object.",
  ],
  hud: [
    { label: "Checks / request", icon: "shield" },
    { label: "Check time", icon: "timer" },
    { label: "Roles", icon: "users" },
    { label: "Exposure", icon: "alert" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "alice", x: 100, y: 150 },
    { id: "api", kind: "server", label: "Orders API", x: 310, y: 150 },
    { id: "pol", kind: "service", label: "Policy", sub: "decisions", x: 500, y: 40 },
    { id: "db", kind: "db", label: "Orders DB", x: 500, y: 260 },
    { id: "log", kind: "queue", label: "Audit Log", x: 720, y: 150 },
  ],
  links: [
    { id: "ca", from: "you", to: "api" },
    { id: "ap", from: "api", to: "pol" },
    { id: "ad", from: "api", to: "db" },
    { id: "pl", from: "pol", to: "log" },
    { id: "dl", from: "db", to: "log" },
  ],
  steps: [
    {
      short: "Who may?",
      title: "Logged in does not mean allowed",
      body: [
        "The server knows the caller is Alice. That settles identity, not permission: can Alice read order 42, refund it, or see every customer's orders?",
        "Authorization is the rule that answers this, and it has to run for every request, not just at login.",
      ],
      callout: {
        kind: "insight",
        text: "Authentication is a front door. Authorization is every door inside the building.",
      },
      metrics: [{ label: "Exposure", value: "everything", level: "bad" }],
      scene: {
        show: ["you", "api", "db"],
        flows: [
          { link: "ca", label: "GET /orders/42" },
          { link: "ad", delay: 0.8, label: "SELECT order 42" },
        ],
        bubbles: { you: "signed in as alice" },
      },
    },
    {
      short: "Roles",
      title: "Roles: group permissions under a name",
      body: [
        "Role-based access control gives each user a role such as `customer`, `support` or `admin`, and each role a set of permissions like `orders:read`. Changing who can do what means editing a role, not thousands of users.",
        "It is easy to explain and audit. It also tends to sprawl: after a few years a company has 200 roles and nobody knows which one is safe to remove.",
      ],
      callout: {
        kind: "tip",
        text: "Name roles after jobs, not people, and review them on a schedule. Unused broad roles are where excess access hides.",
      },
      metrics: [
        { label: "Checks / request", value: "1", level: "good" },
        { label: "Check time", value: "< 1 ms", level: "good" },
        { label: "Roles", value: "3", level: "good" },
        { label: "Exposure", value: "per role", level: "warn" },
      ],
      scene: {
        show: ["you", "api", "pol"],
        hot: ["pol"],
        flows: [
          { link: "ap", label: "role customer: read?" },
          { link: "ap", reverse: true, tone: "res", delay: 0.8, label: "allow orders:read" },
        ],
        badges: { pol: "customer, support, admin" },
      },
    },
    {
      short: "Ownership",
      title: "Roles are too coarse: check the resource",
      body: [
        "A customer may read orders, but only their own. The rule is about a relationship between the user and the object: `order.owner_id == user.id`.",
        "Attribute-based rules extend this to context: the order's region, the time of day, the device, the amount. They are expressive, but harder to reason about, so test them heavily.",
      ],
      metrics: [
        { label: "Checks / request", value: "2", level: "warn" },
        { label: "Check time", value: "~2 ms", level: "good" },
        { label: "Exposure", value: "own data only", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pol", "db"],
        hot: ["api"],
        flows: [
          { link: "ad", label: "load order 42" },
          { link: "ad", reverse: true, tone: "res", delay: 0.8, label: "owner = alice" },
          { link: "ap", delay: 1.6, label: "owner == caller?" },
        ],
        badges: { api: "role AND ownership" },
      },
    },
    {
      short: "Server side",
      title: "Enforce on the server, every time",
      body: [
        "Hiding a button in the UI is a courtesy, not a control. Anyone can open dev tools or use `curl` and call the endpoint directly. The server cannot trust the client for anything about permission.",
        "Put checks as close to the data as practical, in one shared layer, so a new endpoint cannot forget them. A rule copied into fifty handlers will be missing from one.",
      ],
      callout: {
        kind: "warn",
        text: "Do not trust IDs, roles or flags sent by the client, including ones inside an unsigned cookie or hidden form field.",
      },
      metrics: [
        { label: "Checks / request", value: "every one", level: "good" },
        { label: "Exposure", value: "UI-only check: none", level: "bad" },
      ],
      scene: {
        show: ["you", "api", "pol"],
        hot: ["api"],
        flows: [
          { link: "ca", tone: "warn", label: "curl, UI skipped" },
          { link: "ap", delay: 0.8, label: "still checked here" },
        ],
        badges: { api: "never trust the client" },
      },
    },
    {
      short: "IDOR case",
      title: "Case: changing 42 to 43 in the URL",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Alice opens `/orders/42`, then edits the URL to `/orders/43`. The handler checks that she is logged in, loads the row, and returns Bob's order, because nobody asked whether it was hers.",
        "This insecure direct object reference is one of the most common real-world breaches. Sequential IDs make it trivial to scrape every record by counting upward.",
      ],
      callout: {
        kind: "warn",
        text: "Random IDs hide the problem, they do not fix it. The fix is the ownership check, on every read and every write.",
      },
      metrics: [
        { label: "Checks / request", value: "1 (login only)", level: "bad" },
        { label: "Exposure", value: "all orders", level: "bad" },
      ],
      scene: {
        show: ["you", "api", "db"],
        hot: ["db"],
        flows: [
          { link: "ca", tone: "warn", label: "GET /orders/43" },
          { link: "ad", delay: 0.8, label: "SELECT order 43" },
          { link: "ca", reverse: true, tone: "warn", delay: 1.6, label: "Bob's order" },
        ],
        badges: { db: "no owner check" },
      },
    },
    {
      short: "Deny default",
      title: "Deny by default, and fail closed",
      body: [
        "Write policy as an allow-list. If no rule says yes, the answer is no, so a forgotten case means a harmless error rather than a data leak.",
        'Failing closed matters when the policy service is down. Returning "allow" to keep the site up turns an outage into a breach. Return 403 for known-but-forbidden, and often 404 so you do not confirm the object exists.',
      ],
      callout: {
        kind: "tip",
        text: "Log every denial with user, action and resource. A burst of denials from one account is an early sign of probing.",
      },
      metrics: [
        { label: "Checks / request", value: "2", level: "warn" },
        { label: "Exposure", value: "no rule, no access", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pol", "log"],
        hot: ["pol"],
        flows: [
          { link: "ap", label: "may alice read 43?" },
          { link: "ap", reverse: true, tone: "warn", delay: 0.8, label: "no rule: deny" },
          { link: "pl", delay: 1.6, label: "denied, recorded" },
        ],
        badges: { pol: "allow-list, fail closed" },
      },
    },
    {
      short: "Scopes",
      title: "Scopes: limiting what a token can do",
      body: [
        "When Alice lets a third-party app act for her, the token it receives carries scopes such as `orders:read`. Even though Alice could refund an order, the app's token cannot.",
        "The effective permission is the intersection of what the user may do and what the token was granted. Ask for the narrowest scope that works, and expire the grant.",
      ],
      metrics: [
        { label: "Checks / request", value: "3", level: "warn" },
        { label: "Roles", value: "3 + scopes", level: "good" },
        { label: "Exposure", value: "scope only", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pol"],
        hot: ["api"],
        flows: [
          { link: "ca", label: "token: orders:read" },
          { link: "ap", delay: 0.8, label: "POST /refund: scope?" },
          { link: "ap", reverse: true, tone: "warn", delay: 1.6, label: "403 missing scope" },
        ],
        badges: { you: "third-party app" },
      },
    },
    {
      short: "Policy hub",
      title: "Pull decisions into one policy service",
      body: [
        "With many services, scattered `if` statements drift apart. A central policy service takes `(user, action, resource)` and returns allow or deny, so rules are written, reviewed and tested in one place.",
        "The price is a network hop on a hot path, often 1 to 3 ms. Mitigate it with a local library or sidecar, short-lived caching of decisions, and a clear plan for when the service is down.",
      ],
      callout: {
        kind: "insight",
        text: "Cached decisions are stale decisions. Keep the cache time short, or a revoked permission keeps working.",
      },
      metrics: [
        { label: "Checks / request", value: "1 central", level: "good" },
        { label: "Check time", value: "1-3 ms", level: "warn" },
        { label: "Exposure", value: "one rulebook", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pol", "log"],
        hot: ["pol"],
        flows: [
          { link: "ap", label: "(alice, read, order 42)" },
          { link: "ap", reverse: true, tone: "res", delay: 0.8, label: "allow" },
          { link: "pl", delay: 1.6, label: "decision logged" },
        ],
        badges: { pol: "one place for rules" },
      },
    },
    {
      short: "Recap",
      title: "A checklist for every endpoint",
      body: [
        "For each request ask: who is calling, which action, which object, and does a rule explicitly allow it. Use roles for broad strokes, ownership and attributes for precision, and scopes to cap delegated access.",
        "Check on the server, near the data, deny by default, fail closed, and log denials. Missing the object-level check is the bug that leaks entire tables.",
      ],
      callout: {
        kind: "tip",
        text: "Write a test per endpoint that calls it as the wrong user. If it returns data, the check is missing.",
      },
      metrics: [
        { label: "Checks / request", value: "1-3", level: "good" },
        { label: "Check time", value: "< 3 ms", level: "good" },
        { label: "Roles", value: "few, reviewed", level: "good" },
        { label: "Exposure", value: "least privilege", level: "good" },
      ],
      scene: {
        show: ["you", "api", "pol", "db", "log"],
        badges: { api: "enforce here", pol: "decide once", log: "audit denials" },
      },
    },
  ],
};
