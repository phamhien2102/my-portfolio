import type { Lesson } from "../lib/types";

export const loadBalancing: Lesson = {
  id: "load-balancing",
  title: "Load Balancing",
  summary: "Spread traffic over many servers, and keep serving when one of them dies.",
  minutes: 9,
  level: "beginner",
  goals: [
    "Why one server is a ceiling and a single point of failure",
    "How a load balancer shares requests",
    "How health checks take a dead server out of rotation",
    "Which algorithm to pick, and what is still left to fail",
  ],
  takeaways: [
    "A load balancer shares traffic and hides individual servers from users.",
    "Health checks remove dead servers automatically; make them test something real.",
    "Pick the algorithm to match the work, and remember the balancer itself needs a spare.",
  ],
  hud: [
    { label: "Servers", icon: "server" },
    { label: "Healthy", icon: "shield" },
    { label: "Load / server", icon: "gauge" },
    { label: "Balancers", icon: "layers" },
  ],
  nodes: [
    { id: "users", kind: "user", label: "Users", x: 100, y: 150 },
    { id: "lb", kind: "lb", label: "Load balancer", x: 320, y: 150 },
    { id: "a", kind: "server", label: "Server A", x: 540, y: 40 },
    { id: "b", kind: "server", label: "Server B", x: 540, y: 150 },
    { id: "c", kind: "server", label: "Server C", x: 540, y: 260 },
  ],
  links: [
    { id: "direct", from: "users", to: "b" },
    { id: "ul", from: "users", to: "lb" },
    { id: "la", from: "lb", to: "a" },
    { id: "lb2", from: "lb", to: "b" },
    { id: "lc", from: "lb", to: "c" },
  ],
  steps: [
    {
      short: "One server",
      metrics: [
        { label: "Servers", value: "1", level: "bad" },
        { label: "Healthy", value: "1 / 1", level: "good" },
        { label: "Load / server", value: "100%", level: "bad" },
        { label: "Balancers", value: "0", level: "warn" },
      ],
      title: "One server is a ceiling",
      body: [
        "Start simple: every user talks to one server. It works until traffic grows past what that machine can handle, and then every user gets slower at once.",
        "There is a second problem. If that server crashes, the whole site is down.",
      ],
      callout: {
        kind: "warn",
        text: "One machine is both your capacity limit and a single point of failure.",
      },
      scene: {
        show: ["users", "b"],
        hot: ["b"],
        flows: [{ link: "direct", label: "all requests" }],
        badges: { b: "100% of traffic" },
      },
    },
    {
      short: "Add a balancer",
      metrics: [
        { label: "Servers", value: "3", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Balancers", value: "1", level: "good" },
      ],
      title: "Put a load balancer in front",
      body: [
        "Add two more servers and place a load balancer in front of them. Users now talk to a single address; the balancer decides which server answers.",
        "You can add servers behind it without users noticing. This is horizontal scaling.",
      ],
      scene: {
        show: ["users", "lb", "a", "b", "c"],
        hot: ["lb"],
        flows: [{ link: "ul", label: "request" }],
        badges: { lb: "one public address" },
      },
    },
    {
      short: "Round robin",
      metrics: [
        { label: "Servers", value: "3", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Load / server", value: "33%", level: "good" },
        { label: "Balancers", value: "1", level: "good" },
      ],
      title: "Share the requests",
      body: [
        "The simplest rule is round robin: first request to A, second to B, third to C, then start over.",
        "Each server now sees a third of the traffic, so the system can handle roughly three times as much.",
      ],
      scene: {
        show: ["users", "lb", "a", "b", "c"],
        hot: ["a", "b", "c"],
        flows: [
          { link: "la", delay: 0 },
          { link: "lb2", delay: 0.45 },
          { link: "lc", delay: 0.9 },
        ],
        badges: { a: "33%", b: "33%", c: "33%" },
      },
    },
    {
      short: "Health checks",
      metrics: [
        { label: "Servers", value: "3", level: "good" },
        { label: "Healthy", value: "2 / 3", level: "warn" },
        { label: "Load / server", value: "50%", level: "warn" },
        { label: "Balancers", value: "1", level: "good" },
      ],
      title: "A server dies",
      body: [
        "The balancer pings every server every few seconds (a health check). When B stops answering, it is marked unhealthy and removed from rotation.",
        "Traffic keeps flowing to A and C. Users may see one failed request; most see nothing at all.",
      ],
      callout: {
        kind: "tip",
        text: "Make health checks test something real, such as a database ping, not just 'the process is up'.",
      },
      scene: {
        show: ["users", "lb", "a", "b", "c"],
        hot: ["a", "c"],
        down: ["b"],
        flows: [
          { link: "la", delay: 0 },
          { link: "lc", delay: 0.6 },
        ],
        badges: { b: "failed health check", a: "50%", c: "50%" },
      },
    },
    {
      short: "Algorithms",
      metrics: [
        { label: "Servers", value: "3", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Load / server", value: "by load", level: "good" },
        { label: "Balancers", value: "1", level: "good" },
      ],
      title: "Pick a smarter rule",
      body: [
        "Round robin assumes all requests cost the same. They don't: one request may stream a video while another returns a tiny JSON reply.",
        "Least connections sends the next request to the server with the fewest in flight. Hashing on user or IP keeps one user on one server, which helps when a server remembers things about them.",
      ],
      scene: {
        show: ["users", "lb", "a", "b", "c"],
        hot: ["b"],
        flows: [{ link: "lb2", label: "fewest connections" }],
        badges: { a: "41 open", b: "6 open", c: "37 open" },
      },
    },
    {
      short: "What's left",
      metrics: [
        { label: "Servers", value: "3", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Load / server", value: "33%", level: "good" },
        { label: "Balancers", value: "1", level: "bad" },
      ],
      title: "Who balances the balancer?",
      body: [
        "We removed the single server but created a single balancer. If it fails, everything behind it is unreachable.",
        "In practice you run two balancers, either sharing one virtual IP or behind DNS, so that either can take over.",
      ],
      callout: {
        kind: "insight",
        text: "Every fix moves the single point of failure somewhere else. The job is to make it a thing that is cheap to duplicate.",
      },
      scene: {
        show: ["users", "lb", "a", "b", "c"],
        hot: ["lb"],
        badges: { lb: "still one box?" },
      },
    },
  ],
};
