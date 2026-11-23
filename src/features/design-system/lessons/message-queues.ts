import type { Lesson } from "../lib/types";

export const messageQueues: Lesson = {
  id: "message-queues",
  title: "Message Queues",
  summary: "Hand slow work to a line of workers so the user does not have to wait for it.",
  minutes: 9,
  level: "beginner",
  goals: [
    "Why slow work should not run inside the request",
    "How a queue decouples producers from consumers",
    "What happens during a traffic spike",
    "How retries and dead-letter queues handle failure",
  ],
  takeaways: [
    "Do slow work outside the request and reply immediately.",
    "A queue absorbs spikes and decouples producers from consumers.",
    "Expect duplicates: make jobs idempotent and park bad messages in a dead-letter queue.",
  ],
  hud: [
    { label: "API reply", icon: "timer" },
    { label: "Queue depth", icon: "queue" },
    { label: "Workers", icon: "server" },
    { label: "Delivery", icon: "shield" },
  ],
  nodes: [
    { id: "user", kind: "user", label: "User", x: 90, y: 150 },
    { id: "api", kind: "server", label: "API", x: 300, y: 150 },
    { id: "q", kind: "queue", label: "Queue", x: 450, y: 150 },
    { id: "w1", kind: "service", label: "Worker 1", x: 600, y: 50 },
    { id: "w2", kind: "service", label: "Worker 2", x: 600, y: 250 },
  ],
  links: [
    { id: "ua", from: "user", to: "api" },
    { id: "aq", from: "api", to: "q" },
    { id: "q1", from: "q", to: "w1" },
    { id: "q2", from: "q", to: "w2" },
  ],
  steps: [
    {
      short: "Slow work",
      metrics: [
        { label: "API reply", value: "3 s", level: "bad" },
        { label: "Delivery", value: "inline", level: "warn" },
      ],
      title: "The user waits for the slow part",
      body: [
        "A signup should send a welcome email, resize an avatar and update analytics. If the API does all that before replying, the user stares at a spinner for three seconds.",
        "Worse, if the email service is down, the whole signup fails.",
      ],
      scene: {
        show: ["user", "api"],
        hot: ["api"],
        flows: [{ link: "ua", label: "POST /signup" }],
        badges: { api: "email + resize + stats · 3 s" },
      },
    },
    {
      short: "Enqueue",
      metrics: [
        { label: "API reply", value: "20 ms", level: "good" },
        { label: "Queue depth", value: "1", level: "good" },
        { label: "Workers", value: "0", level: "warn" },
      ],
      title: "Write a message and reply",
      body: [
        "Instead, the API drops a small message, 'send welcome email to user 42', onto a queue and replies at once with `202 Accepted`.",
        "The user is done in milliseconds. The slow work will happen, but not on their time.",
      ],
      scene: {
        show: ["user", "api", "q"],
        hot: ["q"],
        flows: [
          { link: "ua", label: "POST /signup" },
          { link: "aq", delay: 0.6, label: "send_email(42)" },
          { link: "ua", reverse: true, tone: "res", delay: 0.9, label: "202" },
        ],
        badges: { api: "reply in 20 ms" },
      },
    },
    {
      short: "Workers",
      metrics: [
        { label: "API reply", value: "20 ms", level: "good" },
        { label: "Queue depth", value: "3", level: "good" },
        { label: "Workers", value: "2", level: "good" },
        { label: "Delivery", value: "ack", level: "good" },
      ],
      title: "Workers pull at their own pace",
      body: [
        "Separate worker processes take messages from the queue, do the work, and acknowledge each one when it is finished.",
        "The producer and consumers never talk directly. You can add, remove or restart workers without touching the API.",
      ],
      scene: {
        show: ["user", "api", "q", "w1", "w2"],
        hot: ["w1", "w2"],
        flows: [
          { link: "q1", label: "job" },
          { link: "q2", delay: 0.5 },
        ],
        badges: { q: "3 waiting" },
      },
    },
    {
      short: "Spike",
      metrics: [
        { label: "API reply", value: "20 ms", level: "good" },
        { label: "Queue depth", value: "10,000", level: "bad" },
        { label: "Workers", value: "2", level: "warn" },
        { label: "Delivery", value: "delayed", level: "warn" },
      ],
      title: "A traffic spike becomes a longer line",
      body: [
        "A marketing email lands and 10,000 signups arrive in a minute. Without a queue, the email service would be crushed.",
        "With one, the messages simply wait. Workers keep a steady rate and the queue absorbs the burst, so it buffers the peak.",
      ],
      callout: {
        kind: "tip",
        text: "Watch queue depth and age. A queue that keeps growing means you need more workers.",
      },
      scene: {
        show: ["user", "api", "q", "w1", "w2"],
        hot: ["q"],
        flows: [
          { link: "ua" },
          { link: "ua", delay: 0.2 },
          { link: "aq", delay: 0.3 },
          { link: "aq", delay: 0.5 },
          { link: "q1", delay: 0.2 },
          { link: "q2", delay: 0.6 },
        ],
        badges: { q: "10,000 waiting" },
      },
    },
    {
      short: "Failure",
      metrics: [
        { label: "API reply", value: "20 ms", level: "good" },
        { label: "Queue depth", value: "3", level: "good" },
        { label: "Workers", value: "1 / 2", level: "warn" },
        { label: "Delivery", value: "redelivered", level: "warn" },
      ],
      title: "A worker crashes mid-job",
      body: [
        "Worker 1 dies before acknowledging its message. Since there was no ack, the queue makes the message visible again and Worker 2 picks it up.",
        "That gives you at-least-once delivery: nothing is lost, but a message may be processed twice.",
      ],
      scene: {
        show: ["user", "api", "q", "w1", "w2"],
        hot: ["w2"],
        down: ["w1"],
        flows: [{ link: "q2", label: "redelivered" }],
        badges: { w1: "crashed, no ack", w2: "retrying" },
      },
    },
    {
      short: "Poison",
      metrics: [
        { label: "API reply", value: "20 ms", level: "good" },
        { label: "Queue depth", value: "3", level: "good" },
        { label: "Workers", value: "2", level: "good" },
        { label: "Delivery", value: "at least once", level: "good" },
      ],
      title: "Idempotency and dead letters",
      body: [
        "Because a job can run twice, make it idempotent: running it again must be harmless, for example by checking 'was this email already sent?'.",
        "Some messages fail every time. After a few attempts, move them to a dead-letter queue where a person can look at them, so one bad message does not block the line.",
      ],
      callout: {
        kind: "insight",
        text: "Queues turn 'must happen now' into 'will happen soon, reliably'. Pick that trade only where the user can afford the delay.",
      },
      scene: {
        show: ["user", "api", "q", "w1", "w2"],
        hot: ["q"],
        badges: { q: "retry 3× → dead letter" },
      },
    },
  ],
};
