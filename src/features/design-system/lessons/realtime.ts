import type { Lesson } from "../lib/types";

export const realtime: Lesson = {
  id: "realtime",
  title: "Real-time Updates",
  summary:
    "Push changes to users the moment they happen: polling, long polling, SSE and WebSockets.",
  minutes: 11,
  level: "beginner",
  goals: [
    "Why plain HTTP makes the server unable to speak first",
    "The cost of polling and how long polling improves it",
    "When Server-Sent Events are enough and when you need WebSockets",
    "How to fan messages out across many servers",
    "Why reconnects and heartbeats need design",
  ],
  takeaways: [
    "Polling is simple but wastes requests and adds delay; push keeps one connection open instead.",
    "Use SSE for one-way feeds and WebSockets when the client also sends often.",
    "Open connections are stateful, so scale them with a pub/sub layer and plan for reconnect storms.",
  ],
  hud: [
    { label: "Delay", icon: "timer" },
    { label: "Requests/s", icon: "gauge" },
    { label: "Connections", icon: "link" },
    { label: "Server load", icon: "server" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "Browser", x: 100, y: 150 },
    { id: "app", kind: "server", label: "Chat Server", x: 330, y: 150 },
    { id: "bus", kind: "queue", label: "Pub/Sub", x: 560, y: 50 },
    { id: "db", kind: "db", label: "Database", x: 560, y: 250 },
  ],
  links: [
    { id: "ua", from: "you", to: "app" },
    { id: "ab", from: "app", to: "bus" },
    { id: "ad", from: "app", to: "db" },
  ],
  steps: [
    {
      short: "Problem",
      title: "A message should show up instantly",
      body: [
        "In a chat app, a friend sends a message and you expect to see it within a fraction of a second. You never pressed refresh.",
        "But HTTP works one way: the browser asks, the server answers. The server has no way to speak first, so how does new data reach you?",
      ],
      callout: {
        kind: "insight",
        text: "Real-time is not one feature. It is a choice of how a client learns that something changed.",
      },
      metrics: [
        { label: "Delay", value: "?", level: "warn" },
        { label: "Connections", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "app"],
        hot: ["app"],
        bubbles: { app: "new message!" },
        badges: { you: "does not know yet" },
      },
    },
    {
      short: "Polling",
      title: "Simplest idea: ask again and again",
      body: [
        "With polling, the browser sends `GET /messages` every 5 seconds. Most of the time the answer is just an empty list.",
        "On average a message waits half the interval, so about 2.5 seconds, and in the worst case a full 5 seconds.",
      ],
      callout: {
        kind: "tip",
        text: "Polling is fine for a dashboard that refreshes every minute. It gets awkward when the interval needs to be under a second.",
      },
      metrics: [
        { label: "Delay", value: "~2.5 s", level: "warn" },
        { label: "Requests/s", value: "0.2 per user", level: "good" },
        { label: "Connections", value: "short-lived", level: "good" },
        { label: "Server load", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "app"],
        flows: [
          { link: "ua", label: "any news?" },
          { link: "ua", reverse: true, tone: "res", delay: 0.8, label: "nothing" },
        ],
        badges: { app: "poll every 5 s" },
      },
    },
    {
      short: "Poll cost",
      title: "Polling gets expensive at scale",
      body: [
        "Shorten the interval to 1 second for snappier chat and the cost grows fast. With 100,000 users online that is 100,000 requests per second, and over 99% of them return nothing.",
        "Each request also carries headers of several hundred bytes and may repeat a TLS or auth check, so the empty answers are not free.",
      ],
      callout: {
        kind: "warn",
        text: "Delay and load pull in opposite directions with polling: halve the delay and you double the traffic.",
      },
      metrics: [
        { label: "Delay", value: "~0.5 s", level: "good" },
        { label: "Requests/s", value: "100,000", level: "bad" },
        { label: "Connections", value: "short-lived", level: "good" },
        { label: "Server load", value: "high", level: "bad" },
      ],
      scene: {
        show: ["you", "app", "db"],
        hot: ["app"],
        flows: [
          { link: "ua", tone: "warn", label: "100k req/s" },
          { link: "ua", delay: 0.3, tone: "warn" },
          { link: "ua", reverse: true, tone: "res", delay: 0.6, label: "99% empty" },
        ],
        badges: { app: "mostly wasted work" },
      },
    },
    {
      short: "Long polling",
      title: "Long polling: hold the request open",
      body: [
        "Instead of answering right away with nothing, the server keeps the request hanging until a message arrives or about 30 seconds pass. Then the client immediately asks again.",
        "Delay drops to near zero and empty responses mostly vanish. The price is one waiting connection per user, which the server must be able to hold cheaply.",
      ],
      callout: {
        kind: "insight",
        text: "Long polling works through almost any proxy because it is just HTTP, which is why it is a common fallback.",
      },
      metrics: [
        { label: "Delay", value: "~50 ms", level: "good" },
        { label: "Requests/s", value: "~3,300", level: "warn" },
        { label: "Connections", value: "100,000 open", level: "warn" },
        { label: "Server load", value: "medium", level: "warn" },
      ],
      scene: {
        show: ["you", "app"],
        hot: ["app"],
        flows: [
          { link: "ua", label: "any news? (wait)" },
          { link: "ua", reverse: true, tone: "res", delay: 1.2, label: "hello!" },
        ],
        badges: { app: "request parked" },
      },
    },
    {
      short: "SSE",
      title: "Server-Sent Events: a one-way stream",
      body: [
        "With SSE the browser opens one long `text/event-stream` response and the server writes events into it whenever it likes. The browser reconnects by itself and can resume from the last event id.",
        "It only goes server to client, which is exactly right for notifications, live scores and progress bars.",
      ],
      callout: {
        kind: "tip",
        text: "If the client rarely sends anything, SSE plus a normal `POST` for the occasional send is simpler than a WebSocket.",
      },
      metrics: [
        { label: "Delay", value: "~20 ms", level: "good" },
        { label: "Requests/s", value: "~0", level: "good" },
        { label: "Connections", value: "100,000 open", level: "warn" },
        { label: "Server load", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "app"],
        hot: ["app"],
        flows: [
          { link: "ua", reverse: true, tone: "res", label: "event: score 2-1" },
          { link: "ua", reverse: true, tone: "res", delay: 0.8, label: "event: goal" },
        ],
        badges: { you: "one stream, many events" },
      },
    },
    {
      short: "WebSocket",
      title: "WebSockets: a two-way channel",
      body: [
        "A WebSocket starts as an HTTP request with `Upgrade: websocket`. After the handshake, both sides can send small frames at any time with only a few bytes of overhead.",
        "That suits chat, multiplayer games and collaborative editing, where the client sends as often as it receives.",
      ],
      callout: {
        kind: "warn",
        text: "Some corporate proxies and load balancers drop idle upgraded connections, so you still need a heartbeat and a fallback.",
      },
      metrics: [
        { label: "Delay", value: "~10 ms", level: "good" },
        { label: "Requests/s", value: "~0", level: "good" },
        { label: "Connections", value: "100,000 open", level: "warn" },
        { label: "Server load", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "app"],
        hot: ["app"],
        flows: [
          { link: "ua", tone: "hand", label: "Upgrade: websocket" },
          { link: "ua", reverse: true, tone: "hand", delay: 0.8, label: "101 Switching" },
          { link: "ua", delay: 1.6, label: "frame: hi" },
        ],
        badges: { app: "socket stays open" },
      },
    },
    {
      short: "Fan-out",
      title: "Case: users on different servers",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "One chat server can hold perhaps 50,000 to 100,000 idle sockets, so you run several. But Ana is connected to server 1 and her friend Binh to server 2.",
        "When Ana sends a message, server 1 publishes it to a pub/sub channel. Server 2 is subscribed, receives it, and pushes it down Binh's socket. The message is also saved so late joiners can read the history.",
      ],
      callout: {
        kind: "insight",
        text: "Open connections make servers stateful. A shared bus (Redis pub/sub, Kafka, NATS) lets any server reach any user.",
      },
      metrics: [
        { label: "Delay", value: "~25 ms", level: "good" },
        { label: "Connections", value: "50k per server", level: "good" },
        { label: "Server load", value: "medium", level: "warn" },
      ],
      scene: {
        show: ["you", "app", "bus", "db"],
        hot: ["bus"],
        flows: [
          { link: "ab", label: "publish chat:42" },
          { link: "ad", delay: 0.5, label: "save" },
          { link: "ua", reverse: true, tone: "res", delay: 1.1, label: "push" },
        ],
        badges: { bus: "channel per room" },
      },
    },
    {
      short: "Reconnects",
      title: "Failure: a server restarts",
      body: [
        "A deploy restarts a server holding 80,000 sockets. All 80,000 clients notice at once and reconnect in the same second, so the load balancer and auth service get a spike far above normal.",
        "Clients should wait a random delay with exponential backoff and jitter. Servers should send a ping every 20 to 30 seconds so dead connections are detected rather than lingering.",
      ],
      callout: {
        kind: "warn",
        text: "Always design for the reconnect: after it, the client must ask for anything it missed, using the last message id it saw.",
      },
      metrics: [
        { label: "Delay", value: "spike", level: "bad" },
        { label: "Requests/s", value: "80,000 at once", level: "bad" },
        { label: "Connections", value: "0, then rising", level: "bad" },
        { label: "Server load", value: "overloaded", level: "bad" },
      ],
      scene: {
        show: ["you", "app"],
        hot: ["you"],
        down: ["app"],
        flows: [{ link: "ua", tone: "warn", label: "everyone retries now" }],
        badges: { you: "needs backoff + jitter" },
      },
    },
    {
      short: "Recap",
      title: "Choosing a delivery method",
      body: [
        "Updates every minute or slower: poll. Need near-instant but the server only sends: SSE. Client and server both send often: WebSocket. Need to work through any network: long polling as a fallback.",
        "Whatever you pick, plan the fan-out across servers, the heartbeat, and the reconnect with resume.",
      ],
      callout: {
        kind: "tip",
        text: "Start with the simplest option that meets your delay target. You can usually add push later behind the same API.",
      },
      metrics: [
        { label: "Delay", value: "10-50 ms", level: "good" },
        { label: "Requests/s", value: "~0", level: "good" },
        { label: "Connections", value: "1 per user", level: "warn" },
        { label: "Server load", value: "low", level: "good" },
      ],
      scene: {
        show: ["you", "app", "bus", "db"],
        badges: { you: "push", app: "50k sockets", bus: "fan-out", db: "history" },
      },
    },
  ],
};
