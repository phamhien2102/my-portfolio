import type { Lesson } from "../lib/types";

export const cap: Lesson = {
  id: "cap",
  title: "CAP & Consistency",
  summary:
    "When the network splits, a replicated store must pick between answering and being right.",
  minutes: 12,
  level: "intermediate",
  goals: [
    "What consistency, availability and partition tolerance mean",
    "Why the real choice is C versus A during a partition",
    "How CP and AP systems behave when replicas cannot talk",
    "How quorums let you tune the trade-off per request",
    "A worked case: a shopping cart versus the last seat",
  ],
  takeaways: [
    "Partitions will happen, so the real question is what to give up while one lasts: correctness or answers.",
    "CP systems refuse requests they cannot answer correctly; AP systems answer with possibly stale data and reconcile later.",
    "Quorums (`R + W > N`) and per-request settings let one system sit at different points on the spectrum.",
  ],
  hud: [
    { label: "Consistency", icon: "layers" },
    { label: "Availability", icon: "gauge" },
    { label: "Latency", icon: "timer" },
    { label: "Network", icon: "link" },
    { label: "Stale reads", icon: "alert" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "client", x: 100, y: 150 },
    { id: "a", kind: "db", label: "Replica A", x: 340, y: 40 },
    { id: "b", kind: "db", label: "Replica B", x: 340, y: 260 },
    { id: "c", kind: "db", label: "Replica C", x: 540, y: 150 },
  ],
  links: [
    { id: "ya", from: "you", to: "a" },
    { id: "yb", from: "you", to: "b" },
    { id: "ab", from: "a", to: "b" },
    { id: "ac", from: "a", to: "c" },
    { id: "bc", from: "b", to: "c" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Copies of the data live on several machines",
      body: [
        "To survive a machine failure and to read from nearby, you keep several copies of every value. Now there is a new problem: copies can disagree.",
        "A client writes `stock = 5` to one replica. Before that change has reached the others, another client reads it from a different replica. What should it see?",
      ],
      callout: {
        kind: "insight",
        text: "Replication makes data available. Keeping the copies in agreement is the hard, expensive part.",
      },
      metrics: [
        { label: "Consistency", value: "?", level: "warn" },
        { label: "Availability", value: "3 replicas", level: "good" },
        { label: "Network", value: "healthy", level: "good" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        hot: ["a", "b", "c"],
        bubbles: { a: "stock = 5", b: "stock = 5", c: "stock = 5" },
      },
    },
    {
      short: "Three letters",
      title: "What C, A and P mean",
      body: [
        "Consistency here means linearizability: every read returns the most recent completed write, as if there were one copy. Availability means every request to a non-failed node gets a real answer, not an error or a timeout.",
        "Partition tolerance means the system keeps working when the network drops or delays messages between nodes. The CAP theorem says that when a partition occurs, you cannot have both C and A.",
      ],
      callout: {
        kind: "warn",
        text: "These are narrow, formal definitions. The everyday word consistency, as in ACID, means something different, so do not mix them up.",
      },
      metrics: [
        { label: "Consistency", value: "latest write", level: "good" },
        { label: "Availability", value: "always answers", level: "good" },
        { label: "Network", value: "may split", level: "warn" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        hot: ["a"],
        badges: { a: "C: one copy illusion", b: "A: no errors", c: "P: survives a split" },
      },
    },
    {
      short: "P is certain",
      title: "You do not get to opt out of partitions",
      body: [
        "Links fail. A switch dies, a cable is cut, a router is misconfigured, or a long garbage-collection pause makes a healthy node look dead. Over enough machines and months, a split is certain.",
        "So the choice is not three-way. If your system spans more than one machine, partitions are part of the environment, and you pick between consistency and availability for the moments they occur.",
      ],
      callout: {
        kind: "tip",
        text: "Ask a sharper question: when two replicas cannot talk, should this operation fail or return possibly stale data?",
      },
      metrics: [
        { label: "Consistency", value: "at risk", level: "warn" },
        { label: "Availability", value: "at risk", level: "warn" },
        { label: "Network", value: "link down", level: "bad" },
      ],
      scene: {
        show: ["a", "b", "c"],
        hot: ["a", "b"],
        flows: [{ link: "ab", tone: "warn", label: "messages lost" }],
        badges: { a: "cannot reach B", b: "cannot reach A" },
      },
    },
    {
      short: "Normal day",
      title: "No partition: both are easy",
      body: [
        "When the network is healthy, the write reaches A, A forwards it to B and C, and they all acknowledge within a few milliseconds. Reads from any replica are correct and every node answers.",
        "CAP only constrains you during a split. Most of the time you are choosing something else: how much latency to spend on agreement, which we come back to at the end.",
      ],
      metrics: [
        { label: "Consistency", value: "strong", level: "good" },
        { label: "Availability", value: "100%", level: "good" },
        { label: "Latency", value: "4 ms", level: "good" },
        { label: "Network", value: "healthy", level: "good" },
        { label: "Stale reads", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        hot: ["a"],
        flows: [
          { link: "ya", label: "write stock = 4" },
          { link: "ab", delay: 0.8, label: "replicate" },
          { link: "ac", delay: 0.8 },
        ],
        badges: { a: "stock = 4", b: "stock = 4", c: "stock = 4" },
      },
    },
    {
      short: "Split",
      title: "The link between A and B breaks",
      body: [
        "Now cut the network so that A is alone on one side, and B and C can still reach each other. The client writes `stock = 3` to A. A cannot tell B or C.",
        "Another client then reads from B and C. They still hold `stock = 4`. The system must now decide how to answer, and each choice sacrifices something.",
      ],
      chapter: { label: "Failure", tone: "red" },
      callout: {
        kind: "warn",
        text: "A cannot distinguish a dead peer from a slow one. It only knows that acknowledgements stopped arriving.",
      },
      metrics: [
        { label: "Consistency", value: "diverging", level: "bad" },
        { label: "Availability", value: "decision needed", level: "warn" },
        { label: "Network", value: "A isolated", level: "bad" },
        { label: "Stale reads", value: "possible", level: "warn" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        down: [],
        hot: ["a"],
        flows: [
          { link: "ya", label: "write stock = 3" },
          { link: "ab", tone: "warn", delay: 0.8, label: "no ack" },
          { link: "ac", tone: "warn", delay: 0.8 },
        ],
        badges: { a: "stock = 3", b: "stock = 4", c: "stock = 4" },
      },
    },
    {
      short: "Choose CP",
      title: "CP: stay correct, refuse to answer",
      body: [
        "A CP system lets only the side with a majority keep serving. B and C hold two of three votes, so they carry on. A, the minority, rejects reads and writes with an error until the link heals.",
        "Nobody ever sees stale data, but some clients get errors. ZooKeeper, etcd, HBase and most relational primary-with-sync-replica setups behave this way.",
      ],
      callout: {
        kind: "insight",
        text: "Pick CP when a wrong answer costs more than no answer: balances, locks, leader election, inventory that must not oversell.",
      },
      metrics: [
        { label: "Consistency", value: "strong", level: "good" },
        { label: "Availability", value: "67% of nodes", level: "warn" },
        { label: "Latency", value: "errors on A", level: "warn" },
        { label: "Network", value: "A isolated", level: "bad" },
        { label: "Stale reads", value: "0", level: "good" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        hot: ["b"],
        flows: [
          { link: "ya", tone: "warn", label: "503: no quorum" },
          { link: "yb", delay: 0.6, label: "read stock" },
          { link: "yb", reverse: true, tone: "res", delay: 1.4, label: "4 (majority side)" },
        ],
        badges: { a: "minority: rejecting", b: "majority: serving" },
      },
    },
    {
      short: "Choose AP",
      title: "AP: always answer, reconcile later",
      body: [
        "An AP system keeps every replica serving. A accepts the write and B and C keep answering reads, so a client may see 4 on one side and 3 on the other. Writes on both sides are queued for later merging.",
        "When the link heals the replicas must reconcile conflicting versions. Common tools are last-write-wins timestamps, vector clocks that detect concurrent edits, and CRDTs that merge by construction. Cassandra, Dynamo and DNS take this path.",
      ],
      callout: {
        kind: "warn",
        text: "Last-write-wins quietly drops one of two concurrent updates, and clock skew can make the wrong one win. Make sure that is acceptable for your data.",
      },
      metrics: [
        { label: "Consistency", value: "eventual", level: "warn" },
        { label: "Availability", value: "100%", level: "good" },
        { label: "Latency", value: "4 ms", level: "good" },
        { label: "Network", value: "A isolated", level: "bad" },
        { label: "Stale reads", value: "until healed", level: "bad" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        hot: ["a", "b"],
        flows: [
          { link: "ya", tone: "res", label: "ok, stock = 3" },
          { link: "yb", reverse: true, tone: "res", delay: 0.6, label: "stock = 4 (stale)" },
        ],
        badges: { a: "stock = 3", b: "stock = 4", c: "stock = 4" },
      },
    },
    {
      short: "Cart vs seat",
      title: "Case: a shopping cart versus the last seat",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A shopping cart is a classic AP workload. If two replicas diverge, merge the carts by taking the union of items. An item that reappears is a minor annoyance, and refusing to add to the cart loses a sale.",
        "Selling the last seat on a flight is the opposite. Two replicas that each accept the same seat create a double booking, which means a stranded customer and compensation costs. Route that write through a CP store or a single owner, and accept an error during a split.",
        "Many real systems use both: an AP store for browsing and the cart, and a CP path for checkout.",
      ],
      callout: {
        kind: "tip",
        text: "Decide per operation, not per company. Ask what it costs to be wrong for a few seconds versus unavailable for a few seconds.",
      },
      metrics: [
        { label: "Consistency", value: "per operation", level: "good" },
        { label: "Availability", value: "cart 100%, seat 67%", level: "warn" },
        { label: "Stale reads", value: "cart only", level: "warn" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        hot: ["a", "b"],
        flows: [
          { link: "ya", tone: "res", label: "add to cart: ok" },
          { link: "yb", tone: "warn", delay: 0.6, label: "book seat 12C: wait" },
        ],
        badges: { a: "AP: cart", b: "CP: seat booking" },
      },
    },
    {
      short: "Quorums",
      title: "Tuning with quorums",
      body: [
        "With N replicas, a write waits for W acknowledgements and a read asks R replicas and takes the newest answer. If `R + W > N`, every read overlaps every write in at least one replica, so reads see the latest value.",
        "With N = 3, setting W = 2 and R = 2 gives that overlap and survives one failure. Setting W = 1 and R = 1 is fast and always available but can return stale data. Setting W = 3 makes writes slow and fail if any replica is down.",
      ],
      callout: {
        kind: "insight",
        text: "Cassandra and DynamoDB expose this as a per-request consistency level, so the same table can serve a cart read cheaply and a checkout read strongly.",
      },
      metrics: [
        { label: "Consistency", value: "R + W > 3", level: "good" },
        { label: "Availability", value: "1 failure ok", level: "good" },
        { label: "Latency", value: "2nd-fastest ack", level: "warn" },
        { label: "Stale reads", value: "0 when overlapping", level: "good" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        hot: ["a", "b"],
        flows: [
          { link: "ya", label: "write, W = 2" },
          { link: "ab", delay: 0.6, label: "ack" },
          { link: "yb", reverse: true, tone: "res", delay: 1.2, label: "read, R = 2" },
        ],
        badges: { a: "wrote", b: "wrote and read", c: "lagging" },
      },
    },
    {
      short: "Recap",
      title: "Beyond CAP: the everyday trade-off",
      body: [
        "Even without a partition, stronger consistency costs latency, because a write must wait for replicas, sometimes across continents. This is the idea behind PACELC: if Partitioned choose A or C, Else choose Latency or Consistency.",
        "Between strong and eventual there are useful middle levels: read-your-writes, monotonic reads, and causal consistency. Pick the weakest one that your feature can tolerate, because weaker is faster and more available.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: money, locks and uniqueness lean CP. Feeds, carts, counters and caches lean AP. Mix them per operation.",
      },
      metrics: [
        { label: "Consistency", value: "pick weakest ok", level: "good" },
        { label: "Availability", value: "pick per op", level: "good" },
        { label: "Latency", value: "pay for C", level: "warn" },
        { label: "Network", value: "assume splits", level: "warn" },
      ],
      scene: {
        show: ["you", "a", "b", "c"],
        badges: { a: "CP: refuse", b: "AP: stale ok", c: "quorum: tune" },
      },
    },
  ],
};
