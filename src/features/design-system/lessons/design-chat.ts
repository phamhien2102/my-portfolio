import type { Lesson } from "../lib/types";

export const designChat: Lesson = {
  id: "design-chat",
  title: "Design a Chat System",
  summary:
    "Keep millions of live connections, route messages between servers, and never lose or reorder one.",
  minutes: 14,
  level: "advanced",
  goals: [
    "Why chat needs persistent connections instead of polling",
    "How a message is routed to the right server",
    "Delivery guarantees, acknowledgements and deduplication",
    "How to keep messages ordered within a conversation",
    "Presence, offline delivery and message storage",
  ],
  takeaways: [
    "Use long-lived WebSocket connections and a session map so any server can find which server holds the recipient.",
    "Delivery is at-least-once with client-generated ids for deduplication, and order comes from a per-conversation sequence number, not clocks.",
    "Persist before you acknowledge, push or notify for offline users, and keep presence as a soft, expiring signal.",
  ],
  hud: [
    { label: "Delivery latency", icon: "timer" },
    { label: "Connections", icon: "link" },
    { label: "Msgs / s", icon: "gauge" },
    { label: "Delivery", icon: "shield" },
    { label: "Storage", icon: "database" },
  ],
  nodes: [
    { id: "alice", kind: "user", label: "Alice", x: 100, y: 40 },
    { id: "bob", kind: "user", label: "Bob", x: 100, y: 260 },
    { id: "ga", kind: "server", label: "Chat A", x: 300, y: 40 },
    { id: "gb", kind: "server", label: "Chat B", x: 300, y: 260 },
    { id: "sess", kind: "cache", label: "Sessions", x: 430, y: 150 },
    { id: "msgs", kind: "db", label: "Message Store", x: 560, y: 40 },
    { id: "push", kind: "service", label: "Push", x: 560, y: 260 },
  ],
  links: [
    { id: "a-ga", from: "alice", to: "ga" },
    { id: "b-gb", from: "bob", to: "gb" },
    { id: "ga-gb", from: "ga", to: "gb" },
    { id: "ga-s", from: "ga", to: "sess" },
    { id: "gb-s", from: "gb", to: "sess" },
    { id: "ga-m", from: "ga", to: "msgs" },
    { id: "gb-p", from: "gb", to: "push" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Messages should arrive instantly",
      body: [
        "Alice sends hi to Bob and expects it on his screen within a few hundred milliseconds. Now multiply: 500 million users, perhaps 50 million connected at once, sending 100,000 messages per second at peak.",
        "Plain HTTP is request-response, so the server cannot speak first. Polling every second works, but 50 million clients polling means 50 million requests per second, nearly all of them empty.",
      ],
      callout: {
        kind: "insight",
        text: "Chat inverts the web model: the server needs to push to the client. That one fact drives the whole architecture.",
      },
      metrics: [
        { label: "Connections", value: "50M concurrent", level: "warn" },
        { label: "Msgs / s", value: "~100,000", level: "warn" },
        { label: "Delivery latency", value: "goal < 300 ms", level: "good" },
      ],
      scene: { show: ["alice", "bob"], hot: ["alice"], bubbles: { alice: "hi Bob!" } },
    },
    {
      short: "WebSocket",
      title: "Hold a persistent connection",
      body: [
        "Each client opens one WebSocket to a chat server. After the HTTP upgrade the connection stays open in both directions, so the server can push a message the instant it arrives, with no polling.",
        "A single tuned server can hold on the order of 100,000 connections, mostly idle sockets costing a few KB each. 50 million users therefore needs around 500 chat servers, and they are stateful, because each one remembers who is connected to it.",
      ],
      callout: {
        kind: "tip",
        text: "Send small heartbeats every 20 to 30 seconds. They keep NAT and proxy timeouts from silently killing idle sockets and let the server spot dead peers.",
      },
      metrics: [
        { label: "Connections", value: "100K per server", level: "good" },
        { label: "Delivery latency", value: "~20 ms", level: "good" },
      ],
      scene: {
        show: ["alice", "bob", "ga", "gb"],
        hot: ["ga", "gb"],
        flows: [
          { link: "a-ga", tone: "hand", label: "upgrade: websocket" },
          { link: "b-gb", tone: "hand", delay: 0.4 },
        ],
        badges: { ga: "holds Alice's socket", gb: "holds Bob's socket" },
      },
    },
    {
      short: "Routing",
      title: "Find the server that has Bob",
      body: [
        "Alice and Bob are connected to different servers. When Chat A receives Alice's message it must know which server holds Bob. A fast shared session map answers that: it maps `user:bob` to `chat-b`.",
        "Each server writes the entry when a user connects and removes it on disconnect, and entries expire if the server dies. Chat A looks Bob up, then forwards the message directly to Chat B over an internal link.",
      ],
      callout: {
        kind: "insight",
        text: "Alternatives exist: a pub/sub channel per user, or consistent hashing of users to servers. All solve the same problem of locating a stateful connection.",
      },
      metrics: [
        { label: "Delivery latency", value: "~35 ms", level: "good" },
        { label: "Msgs / s", value: "100,000", level: "warn" },
      ],
      scene: {
        show: ["alice", "bob", "ga", "gb", "sess"],
        hot: ["sess"],
        flows: [
          { link: "a-ga", label: "hi Bob" },
          { link: "ga-s", delay: 0.5, label: "where is bob?" },
          { link: "ga-s", reverse: true, tone: "res", delay: 1.0, label: "chat-b" },
          { link: "ga-gb", delay: 1.5 },
          { link: "b-gb", reverse: true, tone: "res", delay: 2.0 },
        ],
        badges: { sess: "user -> server map" },
      },
    },
    {
      short: "Persist",
      title: "Store first, then acknowledge",
      body: [
        "Before telling Alice that the message was sent, Chat A writes it to the message store. If a server crashes after the ack, the message must not vanish, so durability comes before the acknowledgement.",
        "The client then shows a single tick for sent. When Bob's device receives it, it replies with a delivery receipt, which flows back and becomes the double tick. Read receipts work the same way.",
      ],
      callout: {
        kind: "warn",
        text: "Do not ack on receipt alone. An ack that precedes the write promises something you have not yet made safe, and crashes will turn that promise into lost messages.",
      },
      metrics: [
        { label: "Delivery", value: "durable before ack", level: "good" },
        { label: "Delivery latency", value: "~50 ms", level: "good" },
        { label: "Storage", value: "+1 write per msg", level: "warn" },
      ],
      scene: {
        show: ["alice", "ga", "msgs"],
        hot: ["msgs"],
        flows: [
          { link: "a-ga", label: "msg 7f3a: hi" },
          { link: "ga-m", delay: 0.5, label: "INSERT" },
          { link: "a-ga", reverse: true, tone: "res", delay: 1.1, label: "ack: sent" },
        ],
        badges: { msgs: "durable" },
      },
    },
    {
      short: "Dedup",
      title: "At-least-once and duplicates",
      body: [
        "Networks drop acks. If Alice's phone never hears back, it resends, so the server might see the same message twice. Chat systems choose at-least-once delivery and make duplicates harmless.",
        "The client generates a unique id like `7f3a` per message. The server stores messages keyed by it, so a repeat is a no-op that simply re-acknowledges. Exactly-once is built from at-least-once plus idempotence.",
      ],
      callout: {
        kind: "tip",
        text: "Make ids client-generated (UUID or a device counter), not server-assigned, so a retry after a timeout carries the same id as the original.",
      },
      metrics: [
        { label: "Delivery", value: "at-least-once + dedup", level: "good" },
        { label: "Msgs / s", value: "100,000", level: "warn" },
      ],
      scene: {
        show: ["alice", "ga", "msgs"],
        hot: ["ga"],
        flows: [
          { link: "a-ga", label: "resend 7f3a" },
          { link: "ga-m", tone: "warn", delay: 0.6, label: "already stored" },
          { link: "a-ga", reverse: true, tone: "res", delay: 1.2, label: "ack again" },
        ],
        bubbles: { alice: "no ack... retry" },
        badges: { ga: "dedup by message id" },
      },
    },
    {
      short: "Ordering",
      title: "Keep a conversation in order",
      body: [
        "Clocks on different phones disagree by seconds, so timestamps cannot define order. Instead each conversation has a sequence number assigned by the one place that owns it, and messages are shown by sequence.",
        "Route all writes for a conversation through the same shard or partition so a simple counter works. The client notices a gap (it has 41 and 43) and asks for 42. Order only matters within a conversation, so no global ordering is needed.",
      ],
      callout: {
        kind: "insight",
        text: "Per-conversation order is cheap because it is local to one partition. Global order across all chats would be a bottleneck and nobody needs it.",
      },
      metrics: [
        { label: "Delivery", value: "ordered per chat", level: "good" },
        { label: "Delivery latency", value: "~55 ms", level: "good" },
      ],
      scene: {
        show: ["alice", "ga", "msgs", "sess"],
        hot: ["msgs"],
        flows: [
          { link: "ga-m", label: "chat 88: seq 41, 42, 43" },
          { link: "ga-m", reverse: true, tone: "res", delay: 0.8, label: "seq 42 assigned" },
        ],
        bubbles: { alice: "msg 7f3a" },
        badges: { msgs: "partition by chat id" },
      },
    },
    {
      short: "Offline",
      title: "Case: Bob's phone is off",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "The session lookup finds nothing for Bob. The message is already stored, so nothing is lost; the server hands a notification to the push service, which pings his phone through the platform's push channel.",
        "When Bob reconnects, his app tells the server the last sequence it has per conversation and pulls everything newer. Sync-on-connect means the store, not the live socket, is the source of truth.",
      ],
      callout: {
        kind: "warn",
        text: "Push payloads are best effort and may be dropped or delayed. Treat them as a nudge to come and sync, never as the delivery itself.",
      },
      metrics: [
        { label: "Delivery", value: "stored, push sent", level: "warn" },
        { label: "Connections", value: "Bob: 0", level: "warn" },
        { label: "Delivery latency", value: "until he returns", level: "warn" },
      ],
      scene: {
        show: ["alice", "ga", "gb", "sess", "push", "bob"],
        down: ["bob"],
        hot: ["push"],
        flows: [
          { link: "ga-s", label: "where is bob?" },
          { link: "ga-s", reverse: true, tone: "warn", delay: 0.6, label: "not connected" },
          { link: "gb-p", delay: 1.2, label: "push notification" },
        ],
        badges: { bob: "offline" },
      },
    },
    {
      short: "Presence",
      title: "Online status without melting the system",
      body: [
        "Presence is a soft signal. Each heartbeat refreshes a key like `presence:bob` with a 40-second expiry. If heartbeats stop, the key expires and Bob shows as offline with no explicit logout needed.",
        "Fan-out is the danger: telling all 500 friends about every flap would be a storm. Only notify subscribers who currently have Bob's chat or friend list open, and debounce brief disconnects such as walking through a tunnel.",
      ],
      callout: {
        kind: "tip",
        text: "Accept that presence is approximate. Last seen a minute ago is fine; strict accuracy would cost far more than users value.",
      },
      metrics: [
        { label: "Connections", value: "50M heartbeats / 25 s", level: "warn" },
        { label: "Msgs / s", value: "~2M heartbeats / s", level: "warn" },
        { label: "Delivery latency", value: "n/a", level: "good" },
      ],
      scene: {
        show: ["bob", "gb", "sess"],
        hot: ["sess"],
        flows: [
          { link: "b-gb", label: "heartbeat" },
          { link: "gb-s", delay: 0.5, label: "SET bob TTL 40s" },
        ],
        badges: { sess: "expires without heartbeat" },
      },
    },
    {
      short: "Storage",
      title: "Where messages live",
      body: [
        "Chat is write-heavy and append-only, read mostly as the latest page of one conversation. A wide-column or LSM-based store suits this: partition by `chat_id`, cluster rows by sequence, so the latest 50 messages are one contiguous read.",
        "At 100,000 messages per second and roughly 200 bytes each, that is about 20 MB per second, near 1.7 TB per day. Keep recent months on fast storage and move older history to cheaper tiers, loaded when someone scrolls far back.",
      ],
      callout: {
        kind: "insight",
        text: "Access pattern picks the database. Reads are by conversation and recency, with no joins, so a key-value or wide-column store beats a relational one here.",
      },
      metrics: [
        { label: "Storage", value: "~1.7 TB / day", level: "warn" },
        { label: "Msgs / s", value: "100,000 writes", level: "warn" },
        { label: "Delivery latency", value: "page load ~10 ms", level: "good" },
      ],
      scene: {
        show: ["ga", "msgs"],
        hot: ["msgs"],
        flows: [
          { link: "ga-m", label: "append (chat 88, seq 43)" },
          { link: "ga-m", reverse: true, tone: "res", delay: 0.8, label: "last 50 messages" },
        ],
        badges: { msgs: "chat_id + seq" },
      },
    },
    {
      short: "Recap",
      title: "Putting chat together",
      body: [
        "Clients keep a WebSocket to a chat server. A session map locates the recipient's server, the message is stored before it is acknowledged, duplicates are removed by client ids and order comes from per-conversation sequence numbers.",
        "Offline users get a push nudge and sync on reconnect; presence is an expiring heartbeat. When something fails, the store is the truth and clients catch up from it.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: if a guarantee is cheap to achieve locally (order in one chat), provide it; if it would need global coordination (a single order for all chats), do not.",
      },
      metrics: [
        { label: "Delivery latency", value: "~50 ms", level: "good" },
        { label: "Connections", value: "50M on ~500 servers", level: "good" },
        { label: "Msgs / s", value: "100,000", level: "good" },
        { label: "Delivery", value: "at-least-once, ordered", level: "good" },
        { label: "Storage", value: "~1.7 TB / day", level: "warn" },
      ],
      scene: {
        show: ["alice", "bob", "ga", "gb", "sess", "msgs", "push"],
        badges: {
          ga: "stateful sockets",
          sess: "routing",
          msgs: "source of truth",
          push: "offline nudge",
        },
      },
    },
  ],
};
