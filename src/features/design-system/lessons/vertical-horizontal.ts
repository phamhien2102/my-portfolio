import type { Lesson } from "../lib/types";

export const verticalHorizontal: Lesson = {
  id: "vertical-horizontal",
  title: "Vertical vs Horizontal Scaling",
  summary: "Buy a bigger machine or add more machines: what each costs and where each one stops.",
  minutes: 11,
  level: "beginner",
  goals: [
    "What scaling up and scaling out mean",
    "Why a bigger machine is simple but capped",
    "How a load balancer spreads work across servers",
    "How horizontal scaling survives failures",
    "A rule for choosing between the two",
  ],
  takeaways: [
    "Vertical scaling means a bigger machine: easy and fast to do, but it has a ceiling and a single point of failure.",
    "Horizontal scaling means more machines behind a load balancer: it has no hard ceiling and survives failures, but the app must cope with being copied.",
    "Start vertical while you are small, and go horizontal when you need the headroom or the redundancy.",
  ],
  hud: [
    { label: "Capacity", icon: "gauge" },
    { label: "Monthly cost", icon: "layers" },
    { label: "Survives a crash", icon: "shield" },
    { label: "Servers", icon: "server" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "users", x: 100, y: 150 },
    { id: "lb", kind: "lb", label: "Load Balancer", x: 290, y: 150 },
    { id: "s1", kind: "server", label: "Server A", x: 480, y: 40 },
    { id: "s2", kind: "server", label: "Server B", x: 480, y: 150 },
    { id: "s3", kind: "server", label: "Server C", x: 480, y: 260 },
  ],
  links: [
    { id: "v", from: "you", to: "s2" },
    { id: "in", from: "you", to: "lb" },
    { id: "a", from: "lb", to: "s1" },
    { id: "b", from: "lb", to: "s2" },
    { id: "c", from: "lb", to: "s3" },
  ],
  steps: [
    {
      short: "Traffic grows",
      title: "One server is no longer enough",
      body: [
        "Your app runs on a single `4-core` machine and it handles `200` requests per second. Then a launch brings twice the traffic and CPU sits at 100%.",
        "You have two ways out: make that machine bigger, or add more machines. Each has a name and a price.",
      ],
      metrics: [
        { label: "Capacity", value: "200 rps", level: "bad" },
        { label: "Monthly cost", value: "$150", level: "good" },
        { label: "Survives a crash", value: "No", level: "bad" },
        { label: "Servers", value: "1", level: "warn" },
      ],
      scene: {
        show: ["you", "s2"],
        hot: ["s2"],
        flows: [
          { link: "v", tone: "warn", label: "400 rps, only 200 fit" },
          { link: "v", tone: "warn", delay: 0.3 },
        ],
        badges: { s2: "4 cores · CPU 100%" },
      },
    },
    {
      short: "Scale up",
      title: "Vertical: a bigger machine",
      body: [
        "Scaling up (vertical) means moving to a machine with more CPU, memory or faster disks, say from `4` cores to `16`. Nothing about your code changes.",
        "It is the quickest fix there is: stop, resize, start. There is still exactly one server, so nothing new to operate or debug.",
      ],
      callout: {
        kind: "tip",
        text: "For a young product, this is often the right answer. A bigger box is cheaper than the engineering time to avoid it.",
      },
      metrics: [
        { label: "Capacity", value: "800 rps", level: "good" },
        { label: "Monthly cost", value: "$600", level: "warn" },
        { label: "Survives a crash", value: "No", level: "bad" },
        { label: "Servers", value: "1", level: "warn" },
      ],
      scene: {
        show: ["you", "s2"],
        hot: ["s2"],
        flows: [
          { link: "v", label: "400 rps" },
          { link: "v", reverse: true, tone: "res", delay: 0.8 },
        ],
        badges: { s2: "4 → 16 cores · 64 GB" },
      },
    },
    {
      short: "The ceiling",
      title: "But there is a ceiling, and a bill",
      body: [
        "Machines only come so big. The largest cloud instances have a couple of hundred cores, and they cost far more than a proportional share: doubling the size often more than doubles the price.",
        "Resizing usually needs a restart, so you take a short outage each time you grow.",
      ],
      callout: {
        kind: "warn",
        text: "You can hit the ceiling suddenly. Plan the move to many machines before the biggest box is the one you are already on.",
      },
      metrics: [
        { label: "Capacity", value: "3,000 rps", level: "good" },
        { label: "Monthly cost", value: "$4,000", level: "bad" },
        { label: "Survives a crash", value: "No", level: "bad" },
        { label: "Servers", value: "1", level: "warn" },
      ],
      scene: {
        show: ["you", "s2"],
        hot: ["s2"],
        badges: { s2: "96 cores · restart to resize" },
      },
    },
    {
      short: "One failure",
      title: "One machine is one point of failure",
      body: [
        "However large the box, if it dies or needs a patch, the whole service is down. Hardware faults, bad deploys and kernel updates all do this.",
        "A very large server makes it worse: more users are affected at once, and recovery is slower.",
      ],
      metrics: [
        { label: "Capacity", value: "0 rps", level: "bad" },
        { label: "Monthly cost", value: "$4,000", level: "bad" },
        { label: "Survives a crash", value: "No", level: "bad" },
        { label: "Servers", value: "0 of 1 up", level: "bad" },
      ],
      scene: {
        show: ["you", "s2"],
        down: ["s2"],
        flows: [{ link: "v", tone: "warn", label: "connection refused" }],
        badges: { you: "site is down" },
      },
    },
    {
      short: "Scale out",
      title: "Horizontal: more machines",
      body: [
        "Scaling out (horizontal) adds several ordinary servers and puts a load balancer in front. The balancer picks a server for each request, perhaps in turn.",
        "Three `4-core` servers give about `600` requests per second, and adding a fourth gives `800`. Capacity grows in steps, with no theoretical cap.",
      ],
      callout: {
        kind: "insight",
        text: "Commodity machines are cheap per unit, and cost grows roughly in a straight line with capacity.",
      },
      metrics: [
        { label: "Capacity", value: "600 rps", level: "good" },
        { label: "Monthly cost", value: "$450", level: "good" },
        { label: "Survives a crash", value: "Yes", level: "good" },
        { label: "Servers", value: "3", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "s3"],
        hot: ["lb"],
        flows: [
          { link: "in", label: "400 rps" },
          { link: "a", delay: 0.3 },
          { link: "b", delay: 0.5 },
          { link: "c", delay: 0.7 },
        ],
        badges: { lb: "round robin" },
      },
    },
    {
      short: "Survive",
      title: "Failures stop being fatal",
      body: [
        "Now Server B crashes. The load balancer notices through health checks and stops sending it traffic. Servers A and C carry on.",
        "You lost a third of the capacity, not all of it. Users see little or nothing, and you can patch machines one at a time with no downtime.",
      ],
      callout: {
        kind: "tip",
        text: "Keep spare capacity. If three servers are at 90% each, losing one overloads the other two.",
      },
      metrics: [
        { label: "Capacity", value: "400 rps", level: "warn" },
        { label: "Monthly cost", value: "$450", level: "good" },
        { label: "Survives a crash", value: "Yes", level: "good" },
        { label: "Servers", value: "2 of 3 up", level: "warn" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "s3"],
        down: ["s2"],
        flows: [
          { link: "in", label: "400 rps" },
          { link: "a", delay: 0.3 },
          { link: "c", delay: 0.5 },
        ],
        badges: { lb: "B failed health check" },
      },
    },
    {
      short: "The catch",
      title: "The price: your app must handle copies",
      body: [
        "More machines bring new work. You need a load balancer, deploys to many hosts, and shared storage, because each server can see only its own memory and disk.",
        "A user's session held in one server's memory is invisible to the others. Making servers interchangeable is the subject of the next lesson on stateless services.",
      ],
      callout: {
        kind: "warn",
        text: "Databases are harder to spread than web servers, because they hold the state. Scaling the app tier is the easy half.",
      },
      metrics: [
        { label: "Capacity", value: "600 rps", level: "good" },
        { label: "Monthly cost", value: "$450 + balancer", level: "warn" },
        { label: "Survives a crash", value: "Yes", level: "good" },
        { label: "Servers", value: "3 + 1 balancer", level: "warn" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "s3"],
        hot: ["s1", "s3"],
        badges: { s1: "has the session?", s3: "no idea who you are" },
      },
    },
    {
      short: "Small shop",
      title: "Case: a startup at 300 requests per second",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A small team serves `300` rps at peak, on a machine that could handle `800`. Going horizontal now would add a balancer, deploy tooling and a shared session store for no benefit.",
        "They stay vertical, keep a recent backup and an image to rebuild from, and revisit when peak load reaches half of what the largest sensible box can do.",
      ],
      metrics: [
        { label: "Capacity", value: "800 rps", level: "good" },
        { label: "Monthly cost", value: "$600", level: "good" },
        { label: "Survives a crash", value: "Restore from backup", level: "warn" },
        { label: "Servers", value: "1", level: "good" },
      ],
      scene: {
        show: ["you", "s2"],
        flows: [
          { link: "v", label: "300 rps" },
          { link: "v", reverse: true, tone: "res", delay: 0.8 },
        ],
        badges: { s2: "37% busy: plenty of room" },
      },
    },
    {
      short: "Big site",
      title: "Case: a site at 50,000 requests per second",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "At `50,000` rps no single machine is close, and downtime costs real money. With `1,000` rps per server and a third spare for peaks and failures, they run about `70` servers across several zones.",
        "A zone loss removes a slice of capacity, not the service. This is where scaling out is not a choice but the only option.",
      ],
      callout: {
        kind: "insight",
        text: "Most large systems use both: fairly big machines for the stateful pieces, many small ones for the stateless tier.",
      },
      metrics: [
        { label: "Capacity", value: "70,000 rps", level: "good" },
        { label: "Monthly cost", value: "$10,500", level: "warn" },
        { label: "Survives a crash", value: "Yes, even a zone", level: "good" },
        { label: "Servers", value: "~70", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "s3"],
        hot: ["lb"],
        flows: [
          { link: "in", label: "50,000 rps" },
          { link: "a", delay: 0.3 },
          { link: "b", delay: 0.5 },
          { link: "c", delay: 0.7 },
        ],
        badges: { lb: "spread across zones" },
      },
    },
    {
      short: "Recap",
      title: "How to choose",
      body: [
        "Scale up first while it is cheap and simple. Scale out when you near the ceiling, need to survive failures, or cannot afford a restart to grow.",
        "To scale out cleanly, keep servers interchangeable: no state in memory, no files on local disk. Then more machines is just a number you change.",
      ],
      metrics: [
        { label: "Capacity", value: "bigger vs wider", level: "good" },
        { label: "Monthly cost", value: "steep vs linear", level: "good" },
        { label: "Survives a crash", value: "no vs yes", level: "good" },
        { label: "Servers", value: "1 vs many", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "s1", "s2", "s3"],
        badges: { s2: "bigger: simple, capped", lb: "wider: resilient, more work" },
      },
    },
  ],
};
