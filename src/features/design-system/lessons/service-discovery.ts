import type { Lesson } from "../lib/types";

export const serviceDiscovery: Lesson = {
  id: "service-discovery",
  title: "Service Discovery & Gateways",
  summary:
    "How callers find healthy instances that come and go, and why a gateway sits at the front door.",
  minutes: 13,
  level: "intermediate",
  goals: [
    "Why hard-coded addresses break in an autoscaling world",
    "How a registry, heartbeats and TTLs track live instances",
    "Client-side versus server-side discovery and load balancing",
    "What an API gateway does for every request",
    "The stale-entry failure and how to contain it",
  ],
  takeaways: [
    "Instances are cattle: their addresses change constantly, so callers look them up instead of memorising them.",
    "A registry is only as good as its health checks, and a stale entry sends real traffic to a dead instance.",
    "A gateway centralises routing, auth and rate limits, but it is on the path of every request so it must stay thin and redundant.",
  ],
  hud: [
    { label: "Lookup", icon: "timer" },
    { label: "Healthy", icon: "server" },
    { label: "Error rate", icon: "alert" },
    { label: "Stale window", icon: "database" },
    { label: "Gateway hop", icon: "layers" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "clients", x: 0, y: 110 },
    { id: "gw", kind: "lb", label: "Gateway", x: 200, y: 110 },
    { id: "reg", kind: "db", label: "Registry", x: 320, y: 0 },
    { id: "lim", kind: "limiter", label: "Limiter", x: 320, y: 220 },
    { id: "a", kind: "service", label: "Orders A", x: 450, y: 0 },
    { id: "b", kind: "service", label: "Orders B", x: 450, y: 110 },
    { id: "c", kind: "service", label: "Orders C", x: 450, y: 220 },
  ],
  links: [
    { id: "yg", from: "you", to: "gw" },
    { id: "gr", from: "gw", to: "reg" },
    { id: "gl", from: "gw", to: "lim" },
    { id: "ga", from: "gw", to: "a" },
    { id: "gb", from: "gw", to: "b" },
    { id: "gc", from: "gw", to: "c" },
    { id: "ra", from: "reg", to: "a" },
    { id: "rb", from: "reg", to: "b" },
    { id: "rc", from: "reg", to: "c" },
  ],
  steps: [
    {
      short: "Moving targets",
      title: "Addresses change all the time",
      body: [
        "The Orders service runs as three copies, each with its own IP. Autoscaling adds a fourth at noon and removes it at night, and a deploy replaces every copy with a new one.",
        "If the gateway had `10.0.1.7` written in a config file, the next deploy would break it. Something has to answer the question: where is Orders right now?",
      ],
      callout: {
        kind: "insight",
        text: "In containers, an instance may live for minutes. Treat addresses as ephemeral facts that must be looked up, never stored.",
      },
      metrics: [
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Error rate", value: "0%", level: "good" },
      ],
      scene: {
        show: ["you", "gw", "a", "b", "c"],
        flows: [{ link: "yg", label: "GET /orders/9" }],
        badges: { a: "10.0.1.7", b: "10.0.2.4", c: "10.0.3.9" },
      },
    },
    {
      short: "Registry",
      title: "A registry keeps the phone book",
      body: [
        "When an instance starts, it tells a registry its name and address: `orders -> 10.0.2.4:8080`. When it stops cleanly, it removes itself.",
        "The registry is a small, highly available store such as Consul, etcd or ZooKeeper, usually replicated by a consensus protocol so it survives the loss of a node.",
      ],
      callout: {
        kind: "tip",
        text: "Make the registry boring and tiny. It holds names and addresses, not business data, and it should be the last thing to fall over.",
      },
      metrics: [
        { label: "Lookup", value: "~1 ms", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
      ],
      scene: {
        show: ["reg", "a", "b", "c"],
        hot: ["reg"],
        flows: [
          { link: "ra", reverse: true, label: "register orders" },
          { link: "rb", reverse: true, delay: 0.3 },
          { link: "rc", reverse: true, delay: 0.6 },
        ],
        badges: { reg: "orders: 3 addresses" },
      },
    },
    {
      short: "Heartbeats",
      title: "Health checks and expiry",
      body: [
        "Instances can crash without saying goodbye. So each one sends a heartbeat every 10 s, or the registry polls a `/health` endpoint. An entry that misses three beats is dropped.",
        "The shorter the interval, the faster dead instances vanish but the more chatter and false alarms you get from a brief GC pause.",
      ],
      callout: {
        kind: "warn",
        text: "A health check that only returns 200 when the process is up will happily report an instance whose database connection is broken. Check real dependencies, carefully.",
      },
      metrics: [
        { label: "Healthy", value: "2 / 3", level: "warn" },
        { label: "Stale window", value: "30 s", level: "warn" },
      ],
      scene: {
        show: ["reg", "a", "b", "c"],
        down: ["b"],
        flows: [
          { link: "ra", reverse: true, label: "heartbeat" },
          { link: "rc", reverse: true, delay: 0.4 },
        ],
        badges: { reg: "B missed 3 beats: removed" },
      },
    },
    {
      short: "Look up",
      title: "Resolving a name at call time",
      body: [
        "In client-side discovery the caller asks the registry for the list, then picks an instance itself. In server-side discovery a load balancer or gateway does that for the caller.",
        "Either way the answer is cached for a few seconds, so the registry is not hit on every request. The cost is a short window where the cache can be wrong.",
      ],
      callout: {
        kind: "insight",
        text: "Client-side discovery saves a hop but puts discovery logic in every language you run. Server-side keeps clients dumb and moves the logic to one place.",
      },
      metrics: [
        { label: "Lookup", value: "~1 ms, cached 5 s", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Gateway hop", value: "~1 ms", level: "good" },
      ],
      scene: {
        show: ["gw", "reg", "a", "b", "c"],
        hot: ["gw"],
        flows: [
          { link: "gr", label: "where is orders?" },
          { link: "gr", reverse: true, tone: "res", delay: 0.8, label: "A, B, C" },
        ],
        bubbles: { gw: "cache 5 s" },
      },
    },
    {
      short: "Balancing",
      title: "Picking one instance",
      body: [
        "Round robin hands out instances in turn and is perfectly fair when requests cost about the same. Least-connections favours the instance with the fewest requests in flight, which handles uneven work better.",
        "A popular middle path is power of two choices: sample two instances at random and send to the less loaded. It avoids stampedes onto a single idle node and needs no global view.",
      ],
      callout: {
        kind: "tip",
        text: "Add weights during a rollout. Send 5% of traffic to the new version first and watch errors before you widen it.",
      },
      metrics: [
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Error rate", value: "0%", level: "good" },
        { label: "Gateway hop", value: "~1 ms", level: "good" },
      ],
      scene: {
        show: ["you", "gw", "a", "b", "c"],
        hot: ["gw"],
        flows: [
          { link: "ga", label: "round robin" },
          { link: "gb", delay: 0.4 },
          { link: "gc", delay: 0.8 },
        ],
        badges: { a: "12 in flight", b: "3 in flight", c: "9 in flight" },
      },
    },
    {
      short: "Gateway",
      title: "The gateway guards the front door",
      body: [
        "Clients should not know the service layout, so they send everything to one gateway. For each request it terminates TLS, checks the token, applies a rate limit, picks a route and forwards it.",
        "Doing this once at the edge keeps every service simpler and gives one place to log and trace. The price is one more hop, typically 1 to 3 ms.",
      ],
      callout: {
        kind: "warn",
        text: "Keep business logic out of the gateway. Once it starts composing orders and prices, it becomes the new monolith and everyone's bottleneck.",
      },
      metrics: [
        { label: "Gateway hop", value: "~2 ms", level: "good" },
        { label: "Error rate", value: "0%", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
      ],
      scene: {
        show: ["you", "gw", "lim", "a", "b", "c"],
        hot: ["gw", "lim"],
        flows: [
          { link: "yg", label: "JWT + request" },
          { link: "gl", delay: 0.6, label: "100 req/s ok" },
          { link: "ga", delay: 1.2, label: "route" },
        ],
        badges: { gw: "auth · TLS · routing", lim: "per-key quota" },
      },
    },
    {
      short: "Case: stale",
      title: "Case: a dead instance is still listed",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Instance B crashes at 12:00:00. The registry waits for three missed beats, so it keeps advertising B for up to 30 s, and the gateway's cache can keep it a few seconds longer.",
        "With three instances, one third of requests in that window go to a dead address. At 300 requests per second that is roughly 100 failures per second until the entry expires.",
      ],
      callout: {
        kind: "tip",
        text: "Defend in layers: a short connect timeout, one retry on a different instance, and outlier ejection that benches an instance after a few consecutive errors.",
      },
      metrics: [
        { label: "Healthy", value: "2 / 3", level: "bad" },
        { label: "Error rate", value: "33%", level: "bad" },
        { label: "Stale window", value: "30 s", level: "bad" },
      ],
      scene: {
        show: ["you", "gw", "a", "b", "c"],
        down: ["b"],
        flows: [
          { link: "gb", tone: "warn", label: "connection refused" },
          { link: "ga", delay: 0.8, label: "retry on A" },
        ],
        badges: { gw: "retry + eject B" },
      },
    },
    {
      short: "Patched",
      title: "After retries and ejection",
      body: [
        "With one retry on a different instance, a request that first hit B succeeds on the second try, so users see a slightly slower response instead of an error. After 3 consecutive failures the gateway stops picking B at all.",
        "The visible error rate drops from about 33% to well under 1%, and it no longer depends on how long the registry takes to expire the entry.",
      ],
      callout: {
        kind: "insight",
        text: "Retries multiply load. Cap them with a budget, such as at most 10% extra requests, or a brief outage turns into a retry storm.",
      },
      metrics: [
        { label: "Healthy", value: "2 / 3", level: "warn" },
        { label: "Error rate", value: "<1%", level: "good" },
        { label: "Stale window", value: "~2 s effective", level: "good" },
        { label: "Gateway hop", value: "~3 ms", level: "good" },
      ],
      scene: {
        show: ["you", "gw", "a", "b", "c"],
        down: ["b"],
        flows: [
          { link: "ga", tone: "res", label: "served by A" },
          { link: "gc", delay: 0.5, tone: "res", label: "served by C" },
        ],
        badges: { b: "ejected for 30 s" },
      },
    },
    {
      short: "Recap",
      title: "The moving parts",
      body: [
        "Instances register, send heartbeats and expire. Callers resolve a name through a registry, cache the answer briefly, balance across what is healthy, and retry safely when a stale entry slips through.",
        "In Kubernetes much of this is built in: a Service gives a stable name, CoreDNS resolves it, and kube-proxy or a service mesh spreads traffic. The ideas are the same, so the failure modes are too.",
      ],
      callout: {
        kind: "tip",
        text: "Whichever tool you use, test the failure on purpose: kill an instance in staging and measure how long errors last.",
      },
      metrics: [
        { label: "Lookup", value: "~1 ms", level: "good" },
        { label: "Healthy", value: "3 / 3", level: "good" },
        { label: "Error rate", value: "<1%", level: "good" },
        { label: "Stale window", value: "~2 s", level: "good" },
        { label: "Gateway hop", value: "~2 ms", level: "good" },
      ],
      scene: {
        show: ["you", "gw", "reg", "lim", "a", "b", "c"],
        badges: { gw: "route + auth", reg: "who is alive?", lim: "protect services" },
      },
    },
  ],
};
