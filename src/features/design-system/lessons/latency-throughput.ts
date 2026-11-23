import type { Lesson } from "../lib/types";

export const latencyThroughput: Lesson = {
  id: "latency-throughput",
  title: "Latency & Throughput",
  summary: "Two numbers that sound alike but answer different questions, and how load links them.",
  minutes: 11,
  level: "beginner",
  goals: [
    "What latency measures and what throughput measures",
    "Why a fast system can still have low capacity",
    "How parallel workers raise throughput",
    "Why latency explodes as a system nears its limit",
    "Why percentiles tell the truth that averages hide",
  ],
  takeaways: [
    "Latency is how long one request takes; throughput is how many requests finish per second.",
    "Adding workers raises throughput, but only a faster path lowers the latency of a single request.",
    "Near full utilisation queues build and tail latency explodes, so leave headroom and watch p99.",
  ],
  hud: [
    { label: "Latency", icon: "timer" },
    { label: "Throughput", icon: "gauge" },
    { label: "Waiting", icon: "queue" },
    { label: "Workers", icon: "server" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "clients", x: 100, y: 150 },
    { id: "web", kind: "server", label: "Web Server", x: 330, y: 150 },
    { id: "w1", kind: "service", label: "Worker 1", x: 510, y: 40 },
    { id: "w2", kind: "service", label: "Worker 2", x: 510, y: 150 },
    { id: "w3", kind: "service", label: "Worker 3", x: 510, y: 260 },
  ],
  links: [
    { id: "in", from: "you", to: "web" },
    { id: "a", from: "web", to: "w1" },
    { id: "b", from: "web", to: "w2" },
    { id: "c", from: "web", to: "w3" },
  ],
  steps: [
    {
      short: "Two words",
      title: '"Make it faster" means two things',
      body: [
        "When someone says a service is slow, they might mean one page takes too long to appear. Or they might mean the service falls over when many people show up at once.",
        "These are different problems with different cures, and they have different names: latency and throughput.",
      ],
      callout: {
        kind: "insight",
        text: "Always ask which one is hurting. Fixing the wrong one can cost a lot and change nothing.",
      },
      scene: { show: ["you", "web"], bubbles: { you: "why is it slow?" } },
    },
    {
      short: "Latency",
      title: "Latency: how long one request takes",
      body: [
        "Latency is the time from sending a request to getting its answer, measured per request in milliseconds. A page that renders in `40 ms` has a latency of `40 ms`.",
        "It is what one user feels. It is made of network hops, queueing and the actual work, added together.",
      ],
      callout: {
        kind: "tip",
        text: "You lower latency by shortening the path: fewer hops, closer servers, caches, faster queries.",
      },
      metrics: [
        { label: "Latency", value: "40 ms", level: "good" },
        { label: "Workers", value: "1", level: "warn" },
      ],
      scene: {
        show: ["you", "web", "w1"],
        hot: ["w1"],
        flows: [
          { link: "in", label: "request" },
          { link: "a" },
          { link: "a", reverse: true, tone: "res", delay: 0.8 },
          { link: "in", reverse: true, tone: "res", delay: 1.2, label: "answer · 40 ms" },
        ],
      },
    },
    {
      short: "Throughput",
      title: "Throughput: how many per second",
      body: [
        "Throughput is the number of requests the system completes per second (often written rps or QPS). It is a property of the whole system, not of one request.",
        "If one worker handles a request in `40 ms` and handles them one at a time, it finishes `1000 / 40 = 25` requests each second. That is its throughput.",
      ],
      metrics: [
        { label: "Latency", value: "40 ms", level: "good" },
        { label: "Throughput", value: "25 rps", level: "warn" },
        { label: "Workers", value: "1", level: "warn" },
      ],
      scene: {
        show: ["you", "web", "w1"],
        hot: ["web"],
        flows: [
          { link: "in", label: "25 per second" },
          { link: "in", delay: 0.3 },
          { link: "a", delay: 0.6 },
        ],
        badges: { w1: "1 request at a time" },
      },
    },
    {
      short: "Not the same",
      title: "A fast system can have low capacity",
      body: [
        "Picture a one-lane road. A car crosses in 10 seconds (low latency for each car), but only a few cars can pass per minute.",
        "Now picture a ten-lane highway with a long detour: each car takes a minute, yet thousands pass. The two numbers move independently, so you need to track both.",
      ],
      callout: {
        kind: "insight",
        text: "Shipping a truck of hard drives has awful latency (days) and enormous throughput. Plenty of real systems choose that trade on purpose.",
      },
      metrics: [
        { label: "Latency", value: "40 ms", level: "good" },
        { label: "Throughput", value: "25 rps", level: "warn" },
        { label: "Workers", value: "1", level: "warn" },
      ],
      scene: {
        show: ["you", "web", "w1"],
        badges: { w1: "fast, but narrow", you: "cares about latency" },
      },
    },
    {
      short: "Add workers",
      title: "More workers raise throughput",
      body: [
        "To handle more requests per second, run several workers side by side. Three workers, each doing a `40 ms` job, complete about `75` requests per second.",
        "Notice what did not change: any single request still takes `40 ms`. Parallelism buys throughput, not speed for an individual request.",
      ],
      callout: {
        kind: "tip",
        text: "Need both? Shorten the path for latency, then add workers for throughput. They are separate levers.",
      },
      metrics: [
        { label: "Latency", value: "40 ms", level: "good" },
        { label: "Throughput", value: "75 rps", level: "good" },
        { label: "Workers", value: "3", level: "good" },
      ],
      scene: {
        show: ["you", "web", "w1", "w2", "w3"],
        hot: ["w1", "w2", "w3"],
        flows: [
          { link: "a", label: "3 in parallel" },
          { link: "b", delay: 0.2 },
          { link: "c", delay: 0.4 },
        ],
        badges: { web: "spreads the work" },
      },
    },
    {
      short: "Saturation",
      title: "Push past the limit and a queue appears",
      body: [
        "Capacity is `75 rps`. If `100` requests arrive each second, `25` of them cannot start. They wait, and the line grows every second.",
        "Waiting time is added to every request behind them, so latency is no longer `40 ms`. It keeps climbing until something times out or crashes.",
      ],
      callout: {
        kind: "warn",
        text: "Latency does not rise gently. Past roughly 70-80% utilisation it curves sharply upward, because bursts find every worker busy.",
      },
      metrics: [
        { label: "Latency", value: "900 ms", level: "bad" },
        { label: "Throughput", value: "75 rps", level: "warn" },
        { label: "Waiting", value: "25 more / s", level: "bad" },
        { label: "Workers", value: "3", level: "good" },
      ],
      scene: {
        show: ["you", "web", "w1", "w2", "w3"],
        hot: ["web"],
        flows: [
          { link: "in", tone: "warn", label: "100 per second in" },
          { link: "in", tone: "warn", delay: 0.2 },
          { link: "in", tone: "warn", delay: 0.4 },
        ],
        badges: { web: "queue growing", w1: "busy", w2: "busy", w3: "busy" },
      },
    },
    {
      short: "Percentiles",
      title: "Averages hide the slow ones",
      body: [
        "Suppose 99 requests take `40 ms` and one takes `2 s`. The average is about `60 ms`, which looks fine, yet one user in a hundred waited two full seconds.",
        "So report percentiles. p50 is the median, p99 is the time that 99% of requests beat. A page that fires 30 backend calls hits the p99 of at least one of them most of the time.",
      ],
      callout: {
        kind: "insight",
        text: "Tail latency matters more than it looks: slow outliers are often your most active users, because they make the most requests.",
      },
      metrics: [
        { label: "Latency", value: "p50 40 ms · p99 2 s", level: "bad" },
        { label: "Throughput", value: "75 rps", level: "good" },
      ],
      scene: {
        show: ["you", "web", "w1", "w2", "w3"],
        hot: ["w2"],
        flows: [
          { link: "b", tone: "warn", label: "one slow request" },
          { link: "a", reverse: true, tone: "res", delay: 0.3 },
        ],
        badges: { w2: "a 2 s outlier" },
      },
    },
    {
      short: "Little's law",
      title: "Case: how many requests are in flight?",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Little's law links the two numbers: requests in flight equals arrival rate times latency. At `500 rps` with `200 ms` latency, that is `500 x 0.2 = 100` requests being handled at the same moment.",
        "So if each worker handles 10 at once, you need at least 10 workers, plus headroom. If latency doubles to `400 ms` during an incident, the same traffic needs 200 in flight and the pool runs dry.",
      ],
      callout: {
        kind: "tip",
        text: "This is how you size thread pools and connection pools: rate times latency, then add margin.",
      },
      metrics: [
        { label: "Latency", value: "200 ms", level: "good" },
        { label: "Throughput", value: "500 rps", level: "good" },
        { label: "Waiting", value: "100 in flight", level: "warn" },
        { label: "Workers", value: "15", level: "good" },
      ],
      scene: {
        show: ["you", "web", "w1", "w2", "w3"],
        hot: ["web"],
        badges: { web: "500 x 0.2 s = 100", you: "500 rps" },
      },
    },
    {
      short: "Recap",
      title: "Rule of thumb",
      body: [
        "Latency is per request, throughput is per second. Lower latency by shortening the path; raise throughput by adding parallel capacity.",
        "Keep utilisation under about 70%, track p99 rather than the average, and treat a growing queue as the first sign of trouble.",
      ],
      metrics: [
        { label: "Latency", value: "p99 under 200 ms", level: "good" },
        { label: "Throughput", value: "75 rps", level: "good" },
        { label: "Waiting", value: "none", level: "good" },
        { label: "Workers", value: "3", level: "good" },
      ],
      scene: {
        show: ["you", "web", "w1", "w2", "w3"],
        badges: { you: "watch p99", web: "keep headroom", w2: "~70% busy" },
      },
    },
  ],
};
