import type { Lesson } from "../lib/types";

export const stateless: Lesson = {
  id: "stateless",
  title: "Stateless Services",
  summary: "Keep per-user memory off the web servers so any server can answer any request.",
  minutes: 10,
  level: "beginner",
  goals: [
    "What state is and why it breaks scaling out",
    "Why sticky sessions are only a partial fix",
    "How a shared session store or a signed token removes state",
    "What interchangeable servers make possible",
    "What else hides state: files, caches and timers",
  ],
  takeaways: [
    "A stateless server keeps nothing between requests, so the load balancer can send any request to any server.",
    "Move session data to a shared store or into a signed token the client carries.",
    "Stateless servers can be added, removed and replaced freely, which is what makes autoscaling and safe deploys work.",
  ],
  hud: [
    { label: "Login", icon: "users" },
    { label: "Servers", icon: "server" },
    { label: "Session lives in", icon: "database" },
    { label: "If a server dies", icon: "shield" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "browser", x: 100, y: 150 },
    { id: "lb", kind: "lb", label: "Load Balancer", x: 300, y: 150 },
    { id: "s1", kind: "server", label: "Server 1", x: 450, y: 50 },
    { id: "s2", kind: "server", label: "Server 2", x: 450, y: 250 },
    { id: "store", kind: "cache", label: "Session Store", x: 590, y: 150 },
  ],
  links: [
    { id: "in", from: "you", to: "lb" },
    { id: "a", from: "lb", to: "s1" },
    { id: "b", from: "lb", to: "s2" },
    { id: "sa", from: "s1", to: "store" },
    { id: "sb", from: "s2", to: "store" },
  ],
  steps: [
    {
      short: "Logged out?",
      title: "You logged in, then got logged out",
      body: [
        "A shop runs two web servers behind a load balancer. A customer logs in and fills a cart. On the next click, the site asks them to log in again.",
        "Nothing is broken in the code. The problem is where the login was remembered.",
      ],
      callout: {
        kind: "insight",
        text: "This bug appears the day you add a second server. With one server, in-memory state always works.",
      },
      metrics: [
        { label: "Login", value: "lost", level: "bad" },
        { label: "Servers", value: "2", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2"],
        hot: ["you"],
        bubbles: { you: "please log in again" },
      },
    },
    {
      short: "Local state",
      title: "State stuck in one server's memory",
      body: [
        "On login, Server 1 stored `session[abc123] = {user: 42, cart: [...]}` in its own memory and sent back a cookie holding the id `abc123`.",
        "The next request is balanced to Server 2. It has never heard of `abc123`, so it treats the visitor as a stranger. That remembered data is state, and it lives on one machine only.",
      ],
      metrics: [
        { label: "Login", value: "lost", level: "bad" },
        { label: "Servers", value: "2", level: "good" },
        { label: "Session lives in", value: "Server 1's RAM", level: "bad" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2"],
        hot: ["s2"],
        flows: [
          { link: "in", label: "cookie abc123" },
          { link: "b", tone: "warn", label: "who is abc123?", delay: 0.5 },
        ],
        badges: { s1: "knows abc123", s2: "knows nobody" },
      },
    },
    {
      short: "Sticky",
      title: "Quick fix: sticky sessions",
      body: [
        "The balancer can remember which server a user first hit and keep sending them there, by cookie or by client IP. The session is always found.",
        "It works, but it is a patch. Load becomes uneven when heavy users pile onto one server, and you cannot move a user away without losing their data.",
      ],
      callout: {
        kind: "warn",
        text: "If a sticky server crashes or is replaced, every session on it vanishes and those users are logged out at once.",
      },
      metrics: [
        { label: "Login", value: "kept (while server lives)", level: "warn" },
        { label: "Servers", value: "2", level: "good" },
        { label: "Session lives in", value: "Server 1's RAM", level: "bad" },
        { label: "If a server dies", value: "sessions lost", level: "bad" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2"],
        hot: ["lb"],
        flows: [
          { link: "in", label: "always to Server 1" },
          { link: "a", delay: 0.4 },
        ],
        badges: { lb: "pins user to Server 1", s2: "idle" },
      },
    },
    {
      short: "Shared store",
      title: "Better: put the session in a shared store",
      body: [
        "Keep sessions in a fast store that every server can reach, such as Redis. The server reads the cookie id, looks the session up, and handles the request.",
        "The extra lookup costs about a millisecond on a good network. In return, the web servers hold nothing that matters, so any of them can serve any request.",
      ],
      callout: {
        kind: "tip",
        text: "Give sessions an expiry (a TTL, for example 30 minutes of inactivity) so abandoned ones clean themselves up.",
      },
      metrics: [
        { label: "Login", value: "kept", level: "good" },
        { label: "Servers", value: "2", level: "good" },
        { label: "Session lives in", value: "shared store", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "store"],
        hot: ["store"],
        flows: [
          { link: "sa", label: "GET session abc123" },
          { link: "sa", reverse: true, tone: "res", delay: 0.6, label: "user 42" },
          { link: "sb", delay: 0.2 },
        ],
        badges: { store: "abc123 → user 42" },
      },
    },
    {
      short: "Token",
      title: "Or: let the client carry the state",
      body: [
        "Another option is a signed token (for example a JWT) holding the user id and expiry. The server checks the signature with a secret key and needs no lookup at all.",
        "Tokens are compact and fast to verify, but they are hard to revoke before they expire, and anything inside is visible to the client, so never put secrets in them.",
      ],
      callout: {
        kind: "insight",
        text: "Either way the rule is the same: the server rebuilds what it needs from the request plus shared data, not from its own memory.",
      },
      metrics: [
        { label: "Login", value: "kept", level: "good" },
        { label: "Servers", value: "2", level: "good" },
        { label: "Session lives in", value: "client token", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2"],
        hot: ["you"],
        flows: [
          { link: "in", label: "token with signature" },
          { link: "b", delay: 0.4 },
        ],
        bubbles: { you: "Authorization: Bearer …" },
        badges: { s2: "verifies the signature" },
      },
    },
    {
      short: "Any server",
      title: "Now every server is interchangeable",
      body: [
        "With no local state, the balancer can use plain round robin or least connections. Every request can land anywhere and succeed.",
        "That gives you freedom: add a server in a minute to handle a spike, remove one when quiet, or replace them all during a deploy, and nobody loses their login.",
      ],
      callout: {
        kind: "tip",
        text: "Autoscaling only works because of this. A new server joins the pool with nothing to copy and starts helping straight away.",
      },
      metrics: [
        { label: "Login", value: "kept", level: "good" },
        { label: "Servers", value: "2, add or remove any time", level: "good" },
        { label: "Session lives in", value: "shared store", level: "good" },
        { label: "If a server dies", value: "nothing lost", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "store"],
        hot: ["lb"],
        flows: [
          { link: "a", label: "any server will do" },
          { link: "b", delay: 0.3 },
          { link: "sa", delay: 0.6 },
        ],
        badges: { s1: "interchangeable", s2: "interchangeable" },
      },
    },
    {
      short: "Crash",
      title: "A server dies and users do not notice",
      body: [
        "Server 1 crashes mid-session. The balancer's health check fails and it stops routing there. The next click goes to Server 2, which reads the same session from the store.",
        "The customer keeps their cart and login. The worst case is that one in-flight request fails and gets retried.",
      ],
      metrics: [
        { label: "Login", value: "kept", level: "good" },
        { label: "Servers", value: "1 of 2 up", level: "warn" },
        { label: "Session lives in", value: "shared store", level: "good" },
        { label: "If a server dies", value: "nothing lost", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "store"],
        down: ["s1"],
        flows: [
          { link: "in", label: "next click" },
          { link: "b", delay: 0.4 },
          { link: "sb", reverse: true, tone: "res", delay: 0.9, label: "session intact" },
        ],
        badges: { lb: "Server 1 failed health check" },
      },
    },
    {
      short: "Hidden state",
      title: "Case: state that sneaks in",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Sessions are the famous one, but state hides elsewhere. A file saved to local disk (an uploaded avatar), an in-process cache, a counter in a variable, or a scheduled job all tie data to one machine.",
        "Move uploads to object storage, shared data to a cache or database, and run scheduled jobs on one designated worker or a queue, so only one server does them.",
      ],
      callout: {
        kind: "warn",
        text: "Test it: kill any server at random. If users notice, some state is still living on that machine.",
      },
      metrics: [
        { label: "Login", value: "kept", level: "good" },
        { label: "Servers", value: "2", level: "good" },
        { label: "Session lives in", value: "shared store", level: "good" },
        { label: "If a server dies", value: "lost uploads?", level: "warn" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "store"],
        hot: ["s1"],
        badges: { s1: "avatar.png on local disk", store: "move shared data here" },
      },
    },
    {
      short: "Recap",
      title: "Make servers boring and replaceable",
      body: [
        "Stateless does not mean the system has no data. It means the data lives in a shared store, a database or the request itself, not in any one web server.",
        "Do that and scaling out, rolling deploys and crash recovery become routine. The state still has to live somewhere, so scaling that store is the next problem.",
      ],
      metrics: [
        { label: "Login", value: "kept", level: "good" },
        { label: "Servers", value: "any number", level: "good" },
        { label: "Session lives in", value: "store or token", level: "good" },
        { label: "If a server dies", value: "nothing lost", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "store"],
        badges: { s1: "no local state", s2: "no local state", store: "state lives here" },
      },
    },
  ],
};
