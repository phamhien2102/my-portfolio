import type { Lesson } from "../lib/types";

export const redundancy: Lesson = {
  id: "redundancy",
  title: "Redundancy & Failover",
  summary:
    "Remove single points of failure with spare capacity, health checks and a clean switch-over.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "What a single point of failure is and how to find one",
    "Active-active versus active-passive designs",
    "How health checks detect a dead server, and how fast",
    "The availability math for parallel and serial parts",
    "Why spare capacity matters as much as spare machines",
  ],
  takeaways: [
    "Every part that can fail alone needs a spare, and the spare must be able to take the whole load.",
    "Failover is only as fast as detection: interval times missed checks sets your outage window.",
    "Redundancy multiplies availability for parallel parts, but every serial dependency still multiplies it down.",
  ],
  hud: [
    { label: "Availability", icon: "gauge" },
    { label: "Capacity", icon: "layers" },
    { label: "Failover time", icon: "timer" },
    { label: "Servers", icon: "server" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "Users", x: 100, y: 150 },
    { id: "lb", kind: "lb", label: "Balancer", x: 330, y: 150 },
    { id: "a", kind: "server", label: "Server A", x: 560, y: 50 },
    { id: "b", kind: "server", label: "Server B", x: 560, y: 250 },
    { id: "mon", kind: "service", label: "Monitor", x: 330, y: 280 },
  ],
  links: [
    { id: "ul", from: "you", to: "lb" },
    { id: "la", from: "lb", to: "a" },
    { id: "lb2", from: "lb", to: "b" },
    { id: "ma", from: "mon", to: "a" },
    { id: "mb", from: "mon", to: "b" },
  ],
  steps: [
    {
      short: "Single point",
      title: "One server, one big risk",
      body: [
        "Everything runs on a single server. Disks fail, kernels panic, and a bad deploy or a power cut takes it down for minutes or hours.",
        "A single commodity server is realistically about 99.9% available, which is roughly 8.8 hours of downtime a year. That is the single point of failure.",
      ],
      callout: {
        kind: "insight",
        text: "Ask of every box in your diagram: if only this one disappears, does the whole system stop?",
      },
      metrics: [
        { label: "Availability", value: "99.9%", level: "warn" },
        { label: "Capacity", value: "100%", level: "good" },
        { label: "Servers", value: "1", level: "bad" },
      ],
      scene: {
        show: ["you", "a"],
        hot: ["a"],
        badges: { a: "if it dies, we are down" },
      },
    },
    {
      short: "Add a spare",
      title: "Add a second server",
      body: [
        "Run two identical servers behind a load balancer. Now either one can serve any request, and one failure is not an outage.",
        "This only works if the servers are interchangeable. Keep sessions and files in a shared store, not on the server's local disk.",
      ],
      callout: {
        kind: "tip",
        text: "Stateless servers are the easiest thing to make redundant. Move state out first, then add copies.",
      },
      metrics: [
        { label: "Availability", value: "99.9999%*", level: "good" },
        { label: "Capacity", value: "200%", level: "good" },
        { label: "Servers", value: "2", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "a", "b"],
        hot: ["lb"],
        flows: [
          { link: "ul", label: "requests" },
          { link: "la", delay: 0.4 },
          { link: "lb2", delay: 0.8 },
        ],
        badges: { lb: "any server can answer" },
      },
    },
    {
      short: "Active-active",
      title: "Active-active: both serve traffic",
      body: [
        "In active-active, the balancer spreads load across all servers. Every box earns its keep, and failure just means the survivors take a bigger share.",
        "The catch is that you must size for it. Two servers each at 70% load cannot absorb a loss, since one would need to run at 140%.",
      ],
      callout: {
        kind: "warn",
        text: "Spare machines are not spare capacity if they are already busy. Plan N+1: enough that losing one still fits.",
      },
      metrics: [
        { label: "Availability", value: "high", level: "good" },
        { label: "Capacity", value: "2 x 50% used", level: "good" },
        { label: "Servers", value: "2 active", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "a", "b"],
        flows: [
          { link: "la", label: "50%" },
          { link: "lb2", label: "50%", delay: 0.5 },
        ],
        badges: { a: "serving", b: "serving" },
      },
    },
    {
      short: "Active-passive",
      title: "Active-passive: a standby waits",
      body: [
        "In active-passive only one server takes traffic and the other sits idle, ready to be promoted. This is common for databases, where two writers would corrupt data.",
        "It is simpler to reason about, but you pay for a machine that does nothing, and the standby must stay in sync with the primary.",
      ],
      callout: {
        kind: "tip",
        text: "A standby you never test is a hope, not a spare. Fail over on purpose every so often.",
      },
      metrics: [
        { label: "Availability", value: "high", level: "good" },
        { label: "Capacity", value: "1 x 100%", level: "warn" },
        { label: "Servers", value: "1 active + 1 idle", level: "warn" },
      ],
      scene: {
        show: ["you", "lb", "a", "b"],
        hot: ["b"],
        flows: [
          { link: "la", label: "all traffic" },
          { link: "la", reverse: true, tone: "res", delay: 0.7 },
        ],
        badges: { a: "primary", b: "standby, in sync" },
      },
    },
    {
      short: "Health checks",
      title: "Detecting a failure",
      body: [
        "A monitor probes each server, for example `GET /health` every 5 seconds. One lost probe may be a blip, so it waits for 3 misses in a row before declaring the server dead.",
        "That means detection takes up to 15 seconds. Probe faster and you recover sooner, but you also risk pulling healthy servers out over a brief hiccup.",
      ],
      callout: {
        kind: "insight",
        text: "Detection time is interval x misses. It is usually the largest part of your failover delay.",
      },
      metrics: [
        { label: "Availability", value: "high", level: "good" },
        { label: "Failover time", value: "up to 15 s", level: "warn" },
        { label: "Servers", value: "2", level: "good" },
      ],
      scene: {
        show: ["lb", "a", "b", "mon"],
        hot: ["mon"],
        flows: [
          { link: "ma", label: "GET /health" },
          { link: "ma", reverse: true, tone: "res", delay: 0.7, label: "200 OK" },
          { link: "mb", delay: 0.4 },
        ],
        badges: { mon: "3 misses = dead" },
      },
    },
    {
      short: "Failover",
      title: "Failure: Server A dies",
      body: [
        "Server A stops answering. After three missed probes the monitor tells the balancer, which stops sending it traffic and routes everything to B.",
        "Requests in flight on A fail, so clients should retry. Users see a few seconds of errors rather than a long outage.",
      ],
      callout: {
        kind: "tip",
        text: "Make requests safe to retry (idempotent), otherwise failover can double-charge a card.",
      },
      metrics: [
        { label: "Availability", value: "degraded", level: "warn" },
        { label: "Capacity", value: "50%", level: "warn" },
        { label: "Failover time", value: "~15 s", level: "warn" },
        { label: "Servers", value: "1 of 2", level: "bad" },
      ],
      scene: {
        show: ["you", "lb", "a", "b", "mon"],
        hot: ["lb"],
        down: ["a"],
        flows: [
          { link: "ma", tone: "warn", label: "no answer" },
          { link: "lb2", label: "all traffic" },
        ],
        badges: { b: "now at 100% of load" },
      },
    },
    {
      short: "Split brain",
      title: "The danger of a false failover",
      body: [
        "Suppose the link between monitor and primary breaks, but the primary is fine. The monitor promotes the standby, and now two servers both believe they are in charge.",
        "In a database that is split brain: both accept writes and the data diverges. Prevent it with a quorum (a majority of 3 or 5 voters must agree) or by fencing the old primary so it cannot write.",
      ],
      callout: {
        kind: "warn",
        text: "Automatic failover trades speed for risk. Systems with state need an odd number of voters and fencing.",
      },
      metrics: [
        { label: "Availability", value: "at risk", level: "bad" },
        { label: "Servers", value: "2 think they lead", level: "bad" },
      ],
      scene: {
        show: ["lb", "a", "b", "mon"],
        hot: ["a", "b"],
        flows: [{ link: "ma", tone: "warn", label: "probe lost" }],
        badges: { a: "still writing!", b: "promoted, writing!" },
      },
    },
    {
      short: "The math",
      title: "Case: how many nines do we get?",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Two independent servers at 99.9% each. Both are down only when both fail: `0.001 x 0.001 = 0.000001`, so 99.9999%. That is about 30 seconds of downtime a year.",
        "But the balancer, the database and the network are in series with them. Chain a 99.99% balancer and a 99.95% database after the pair and the total is about `0.9999 x 0.9995 x 0.999999`, or 99.94%. The weakest serial link dominates.",
      ],
      callout: {
        kind: "insight",
        text: "Redundancy helps parts in parallel. For parts in series, availability multiplies down, so duplicate the balancer and database too.",
      },
      metrics: [
        { label: "Availability", value: "99.94%", level: "warn" },
        { label: "Capacity", value: "200%", level: "good" },
        { label: "Servers", value: "2 + shared parts", level: "warn" },
      ],
      scene: {
        show: ["you", "lb", "a", "b"],
        hot: ["lb"],
        badges: { lb: "99.99% alone", a: "99.9%", b: "99.9%" },
      },
    },
    {
      short: "Recap",
      title: "Rules of thumb",
      body: [
        "Find every single point of failure, then give it a spare that can carry the whole load. Spread spares across racks and availability zones, since one power feed can take out both servers in the same rack.",
        "Detect in seconds, fail over automatically for stateless tiers, and be careful with stateful ones. Test the failover before an incident does it for you.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: stateless gets active-active with N+1 headroom; stateful gets a standby with quorum and fencing.",
      },
      metrics: [
        { label: "Availability", value: "99.99%+", level: "good" },
        { label: "Capacity", value: "N+1 headroom", level: "good" },
        { label: "Failover time", value: "5-15 s", level: "good" },
        { label: "Servers", value: "2+ per tier", level: "good" },
      ],
      scene: {
        show: ["you", "lb", "a", "b", "mon"],
        badges: { lb: "duplicate me too", a: "zone 1", b: "zone 2", mon: "test failover" },
      },
    },
  ],
};
