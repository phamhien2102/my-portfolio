import type { Lesson } from "../lib/types";

export const consensus: Lesson = {
  id: "consensus",
  title: "Consensus & Leader Election",
  summary:
    "How a cluster of unreliable machines agrees on one leader and one log, using majorities and terms.",
  minutes: 14,
  level: "advanced",
  goals: [
    "Why agreement among failing nodes is hard",
    "How majorities and terms prevent two leaders",
    "How a Raft-style election and log replication work",
    "What a leader failure and a network partition look like",
    "How fencing tokens protect resources from a stale leader",
  ],
  takeaways: [
    "Consensus rests on majority quorums: any two majorities share a node, so two leaders cannot both commit.",
    "Terms (epochs) order leaders over time, so any message from an old term is rejected.",
    "Use a proven implementation such as etcd or ZooKeeper, and pair leader leases with fencing tokens.",
  ],
  hud: [
    { label: "Term", icon: "layers" },
    { label: "Leader", icon: "server" },
    { label: "Votes", icon: "users" },
    { label: "Commit latency", icon: "timer" },
    { label: "Availability", icon: "gauge" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "client", x: 100, y: 150 },
    { id: "n1", kind: "service", label: "Node 1", x: 320, y: 40 },
    { id: "n2", kind: "service", label: "Node 2", x: 520, y: 150 },
    { id: "n3", kind: "service", label: "Node 3", x: 320, y: 260 },
  ],
  links: [
    { id: "y1", from: "you", to: "n1" },
    { id: "y3", from: "you", to: "n3" },
    { id: "l12", from: "n1", to: "n2" },
    { id: "l13", from: "n1", to: "n3" },
    { id: "l23", from: "n2", to: "n3" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Many machines, one answer",
      body: [
        "Some jobs must be done by exactly one machine: accepting writes for a shard, running a scheduler, holding a lock. If two machines both believe they are in charge, you get split-brain and corrupted data.",
        "So a group of nodes needs to agree on a single leader, and on the order of the changes that leader makes. That agreement problem is called consensus.",
      ],
      callout: {
        kind: "insight",
        text: "Consensus is the building block behind configuration stores, distributed locks, and strongly consistent databases.",
      },
      metrics: [
        { label: "Term", value: "—", level: "warn" },
        { label: "Leader", value: "none", level: "warn" },
        { label: "Availability", value: "0 writes", level: "bad" },
      ],
      scene: {
        show: ["you", "n1", "n2", "n3"],
        hot: ["n1", "n2", "n3"],
        bubbles: { n1: "I should lead", n2: "No, me", n3: "..." },
      },
    },
    {
      short: "Why hard",
      title: "A slow node looks exactly like a dead one",
      body: [
        "Messages can be delayed, dropped or reordered, and machines can pause for seconds during garbage collection. From the outside, a crashed node and a slow node look the same: you simply hear nothing.",
        "A known result, the FLP impossibility theorem, shows that no algorithm can guarantee agreement in bounded time on a fully asynchronous network if even one node may crash. Practical protocols get around it with timeouts: they are always safe, and make progress whenever the network behaves well enough.",
      ],
      callout: {
        kind: "tip",
        text: "Remember the split: safety (never two leaders) must hold always, while liveness (a leader eventually exists) may need a calm network.",
      },
      metrics: [
        { label: "Term", value: "—", level: "warn" },
        { label: "Leader", value: "unknown", level: "warn" },
        { label: "Availability", value: "stalled", level: "bad" },
      ],
      scene: {
        show: ["n1", "n2", "n3"],
        hot: ["n2"],
        flows: [{ link: "l12", tone: "warn", label: "silence: dead or slow?" }],
        badges: { n2: "paused 3 s (GC)" },
      },
    },
    {
      short: "Majority",
      title: "Quorums: the majority rule",
      body: [
        "The core trick is to require a majority, `floor(N/2) + 1` nodes, for every decision. Any two majorities of the same cluster must share at least one node, so two groups can never both win.",
        "Three nodes need 2 votes and tolerate 1 failure. Five need 3 and tolerate 2. Even sizes waste a machine: 4 nodes still need 3 and still tolerate only 1.",
      ],
      callout: {
        kind: "insight",
        text: "The overlapping node is what carries knowledge between decisions. It will refuse to vote for something that contradicts what it has already accepted.",
      },
      metrics: [
        { label: "Votes", value: "need 2 of 3", level: "good" },
        { label: "Availability", value: "survives 1 failure", level: "good" },
      ],
      scene: {
        show: ["n1", "n2", "n3"],
        hot: ["n1", "n2"],
        badges: { n1: "vote", n2: "vote", n3: "minority: cannot decide" },
      },
    },
    {
      short: "Terms",
      title: "Terms number the leaders",
      body: [
        "Time is divided into terms, each an increasing integer. A term has at most one leader. Every message carries the sender's term.",
        "If a node sees a higher term, it adopts it and steps down. If it sees a lower term, it rejects the message. This is how a stale leader's commands get ignored once the cluster has moved on.",
      ],
      callout: {
        kind: "tip",
        text: "Terms play the role of a logical clock for leadership. They are persisted to disk before a node replies, so a reboot never forgets a vote it already gave.",
      },
      metrics: [
        { label: "Term", value: "4", level: "good" },
        { label: "Leader", value: "none yet", level: "warn" },
        { label: "Votes", value: "0", level: "warn" },
      ],
      scene: {
        show: ["n1", "n2", "n3"],
        hot: ["n1", "n2", "n3"],
        badges: { n1: "term 4", n2: "term 4", n3: "term 4" },
      },
    },
    {
      short: "Election",
      title: "An election, step by step",
      body: [
        "Every follower waits for heartbeats from a leader. Each has a randomised election timeout, say 150 to 300 ms. The first to time out becomes a candidate: it bumps its term to 5, votes for itself, and asks the others for votes.",
        "Each node gives at most one vote per term, and only to a candidate whose log is at least as up to date as its own. With 2 of 3 votes, Node 1 becomes leader and starts sending heartbeats every 50 ms.",
      ],
      callout: {
        kind: "insight",
        text: "Randomised timeouts make simultaneous candidates unlikely. If votes do split, nobody wins, the timeouts expire again, and a new term starts.",
      },
      metrics: [
        { label: "Term", value: "5", level: "good" },
        { label: "Leader", value: "Node 1", level: "good" },
        { label: "Votes", value: "2 of 3", level: "good" },
        { label: "Availability", value: "elected in ~200 ms", level: "warn" },
      ],
      scene: {
        show: ["n1", "n2", "n3"],
        hot: ["n1"],
        flows: [
          { link: "l12", label: "vote for me, term 5" },
          { link: "l12", reverse: true, tone: "res", delay: 0.8, label: "granted" },
          { link: "l13", delay: 0.2 },
        ],
        badges: { n1: "candidate to leader" },
      },
    },
    {
      short: "Replicate",
      title: "Replicating the log and committing",
      body: [
        "Clients send writes to the leader. It appends each one to its log, then sends the entry to its followers. Once a majority, counting itself, has written it to disk, the entry is committed.",
        "Only then does the leader apply it and reply to the client. A commit therefore costs one round trip to the second-fastest node, typically 1 to 5 ms in one data center.",
      ],
      callout: {
        kind: "tip",
        text: "Throughput is capped by the single leader and its disk. Scale by splitting data into many independent consensus groups, one per shard.",
      },
      metrics: [
        { label: "Term", value: "5", level: "good" },
        { label: "Leader", value: "Node 1", level: "good" },
        { label: "Votes", value: "2 of 3 acked", level: "good" },
        { label: "Commit latency", value: "3 ms", level: "good" },
        { label: "Availability", value: "serving", level: "good" },
      ],
      scene: {
        show: ["you", "n1", "n2", "n3"],
        hot: ["n1"],
        flows: [
          { link: "y1", label: "set x = 7" },
          { link: "l12", delay: 0.8, label: "append entry 42" },
          { link: "l12", reverse: true, tone: "res", delay: 1.6, label: "ack" },
        ],
        badges: { n1: "leader, term 5", n2: "log: 42", n3: "log: 41 (lagging)" },
      },
    },
    {
      short: "Leader dies",
      title: "The leader crashes",
      body: [
        "If Node 1 crashes, heartbeats stop. After their election timeouts, followers notice, and one of them, here Node 3, starts an election for term 6.",
        "Because an entry only counts as committed if a majority holds it, the new leader is guaranteed to have every committed entry. Nothing acknowledged to a client is lost, and the cluster is writable again after a few hundred milliseconds.",
      ],
      callout: {
        kind: "warn",
        text: "Writes are unavailable during that gap. If the election timeout is too short, a busy network triggers needless elections; too long, and real failures last longer.",
      },
      metrics: [
        { label: "Term", value: "5 to 6", level: "warn" },
        { label: "Leader", value: "electing", level: "bad" },
        { label: "Votes", value: "2 of 2 live", level: "warn" },
        { label: "Commit latency", value: "stalled ~250 ms", level: "bad" },
        { label: "Availability", value: "writes paused", level: "bad" },
      ],
      scene: {
        show: ["you", "n1", "n2", "n3"],
        down: ["n1"],
        hot: ["n3"],
        flows: [
          { link: "l23", reverse: true, label: "vote for me, term 6" },
          { link: "l23", delay: 0.8, tone: "res", label: "granted" },
        ],
        badges: { n1: "crashed", n3: "new leader, term 6" },
      },
    },
    {
      short: "Partition",
      title: "Case: the old leader is cut off",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Now suppose Node 1 is alive but a network fault isolates it from Nodes 2 and 3. It still believes it leads term 5 and keeps accepting client writes.",
        "But it can reach no one, so it can never gather a majority, and none of those writes commit. Meanwhile Nodes 2 and 3 elect a new leader in term 6 and carry on.",
        "When the network heals, Node 1 sees term 6, steps down, and throws away its uncommitted entries. Clients whose writes never committed received no success reply, so no promise was broken.",
      ],
      callout: {
        kind: "insight",
        text: "This is why the majority rule matters: the minority side can never make progress, so the cluster never has two sources of truth.",
      },
      metrics: [
        { label: "Term", value: "5 vs 6", level: "warn" },
        { label: "Leader", value: "N1 stale, N3 real", level: "warn" },
        { label: "Votes", value: "1 of 3 (N1)", level: "bad" },
        { label: "Commit latency", value: "N1: never", level: "bad" },
        { label: "Availability", value: "majority serves", level: "good" },
      ],
      scene: {
        show: ["you", "n1", "n2", "n3"],
        hot: ["n1", "n3"],
        flows: [
          { link: "y1", tone: "warn", label: "write: no majority" },
          { link: "l12", tone: "warn", delay: 0.6, label: "unreachable" },
          { link: "y3", delay: 1.2, label: "write: committed" },
        ],
        badges: { n1: "stale leader, term 5", n3: "leader, term 6" },
      },
    },
    {
      short: "Fencing",
      title: "A stale leader can still do harm",
      body: [
        "A leader may lose its leadership without noticing. A long GC pause or a stalled VM can outlast its lease, and when it wakes it still believes it leads and writes to a shared resource such as a storage service.",
        "The fix is a fencing token: each new leadership comes with a number from the consensus group, such as the term, and every write to the resource carries it. The resource remembers the highest token seen and rejects anything lower.",
      ],
      callout: {
        kind: "warn",
        text: "A lease or lock with a timeout alone is not safe. Without a token checked at the resource, a paused client can act long after it lost the lock.",
      },
      metrics: [
        { label: "Term", value: "6", level: "good" },
        { label: "Leader", value: "Node 3", level: "good" },
        { label: "Availability", value: "stale writes blocked", level: "good" },
      ],
      scene: {
        show: ["you", "n1", "n2", "n3"],
        hot: ["n1"],
        flows: [
          { link: "l13", tone: "warn", label: "write, token 5: rejected" },
          { link: "l23", delay: 0.8, label: "write, token 6: ok" },
        ],
        badges: { n1: "woke up, thinks it leads", n3: "highest token: 6" },
      },
    },
    {
      short: "Recap",
      title: "What to remember and what to use",
      body: [
        "Consensus gives you a single leader and an agreed order of changes, as long as a majority of nodes can talk. Run 3 nodes to survive one failure, or 5 to survive two, and spread them across failure domains.",
        "Do not write your own. Raft, Paxos and ZAB are subtle, and the bugs show up only under rare timing. Use etcd, Consul or ZooKeeper, or a database built on them, and use their leases together with fencing tokens.",
      ],
      callout: {
        kind: "tip",
        text: "Decision rule: if two nodes acting at once would corrupt data, put the decision behind consensus. Otherwise a simpler, cheaper design usually wins.",
      },
      metrics: [
        { label: "Term", value: "increases", level: "good" },
        { label: "Leader", value: "one per term", level: "good" },
        { label: "Votes", value: "floor(N/2) + 1", level: "good" },
        { label: "Commit latency", value: "1 majority round trip", level: "good" },
        { label: "Availability", value: "while majority is up", level: "warn" },
      ],
      scene: {
        show: ["you", "n1", "n2", "n3"],
        badges: { n1: "majority = 2", n2: "majority = 2", n3: "majority = 2" },
      },
    },
  ],
};
