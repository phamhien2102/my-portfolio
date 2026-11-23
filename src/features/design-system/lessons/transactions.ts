import type { Lesson } from "../lib/types";

export const transactions: Lesson = {
  id: "transactions",
  title: "Transactions & Isolation",
  summary: "Keep concurrent writes correct: atomic commits, isolation levels, locks and versions.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "What atomicity and the write-ahead log guarantee",
    "Which anomalies concurrent transactions cause",
    "How isolation levels trade safety for speed",
    "Why locks and versioned reads behave differently",
    "Cases: a double-spent balance and a deadlock",
  ],
  takeaways: [
    "A transaction makes several writes succeed or fail as one unit, and the log makes that survive crashes.",
    "Isolation levels are a dial: stronger levels block more anomalies but cost throughput and cause more retries.",
    "Pick the weakest level that keeps your invariant true, and always be ready to retry a failed transaction.",
  ],
  hud: [
    { label: "Committed", icon: "database" },
    { label: "Anomalies", icon: "alert" },
    { label: "Throughput", icon: "gauge" },
    { label: "Conflicts", icon: "layers" },
  ],
  nodes: [
    { id: "a", kind: "service", label: "Txn A", x: 100, y: 40 },
    { id: "b", kind: "service", label: "Txn B", x: 100, y: 200 },
    { id: "db", kind: "db", label: "Database", x: 330, y: 120 },
    { id: "wal", kind: "queue", label: "WAL", sub: "write-ahead log", x: 540, y: 120 },
  ],
  links: [
    { id: "a-db", from: "a", to: "db" },
    { id: "b-db", from: "b", to: "db" },
    { id: "db-wal", from: "db", to: "wal" },
  ],
  steps: [
    {
      short: "Transfer",
      title: "Moving money takes two writes",
      body: [
        "A transfer of `$100` from Alice to Bob is two updates: subtract from Alice, add to Bob. If the server dies between them, `$100` has vanished.",
        "And that is the simple case. With thousands of people writing at once, updates can also interleave in ways nobody planned.",
      ],
      callout: {
        kind: "insight",
        text: "Correctness rules like 'the total never changes' are called invariants. Transactions exist to protect them.",
      },
      metrics: [
        { label: "Committed", value: "0", level: "good" },
        { label: "Anomalies", value: "0", level: "good" },
      ],
      scene: {
        show: ["a", "db"],
        hot: ["a"],
        flows: [
          { link: "a-db", label: "Alice -100" },
          { link: "a-db", delay: 0.9, label: "Bob +100" },
        ],
        bubbles: { a: "transfer $100" },
      },
    },
    {
      short: "Atomic",
      title: "Atomicity: all or nothing",
      body: [
        "Wrap both updates in `BEGIN ... COMMIT`. The database promises that either both become visible or neither does. A crash or an error triggers a `ROLLBACK` that undoes the first write.",
        "Together with consistency, isolation and durability this makes up ACID. Atomicity is the part that handles failure.",
      ],
      callout: {
        kind: "tip",
        text: "Keep transactions short. Every second a transaction stays open holds resources that others may be waiting for.",
      },
      metrics: [
        { label: "Committed", value: "1", level: "good" },
        { label: "Anomalies", value: "0", level: "good" },
        { label: "Throughput", value: "high", level: "good" },
      ],
      scene: {
        show: ["a", "db"],
        hot: ["db"],
        flows: [
          { link: "a-db", label: "BEGIN, 2 updates" },
          { link: "a-db", reverse: true, tone: "res", delay: 0.9, label: "COMMIT ok" },
        ],
        badges: { db: "both or neither" },
      },
    },
    {
      short: "WAL",
      title: "Durability: the write-ahead log",
      body: [
        "Before changing any data page, the database appends the change to a log on disk and flushes it. Only then does it report `COMMIT` to the client.",
        "After a crash it replays the log, redoing committed work and discarding unfinished work. Sequential log appends are cheap, often well under 1 ms on an SSD, which is why this design is everywhere.",
      ],
      callout: {
        kind: "insight",
        text: "The same log feeds replication: followers simply replay the leader's log.",
      },
      metrics: [
        { label: "Committed", value: "1", level: "good" },
        { label: "Anomalies", value: "0", level: "good" },
        { label: "Throughput", value: "high", level: "good" },
      ],
      scene: {
        show: ["a", "db", "wal"],
        hot: ["wal"],
        flows: [
          { link: "db-wal", label: "append, then fsync" },
          { link: "db-wal", reverse: true, tone: "res", delay: 0.9, label: "durable" },
        ],
        badges: { wal: "replayed after crash" },
      },
    },
    {
      short: "Concurrent",
      title: "Two transactions at once",
      body: [
        "Now a second transaction arrives while the first is still running. Atomicity alone says nothing about what each can see of the other's half-finished work.",
        "Isolation is the rule that answers that question. The ideal is serializable: the result looks as if the transactions ran one after another, even though they overlapped.",
      ],
      metrics: [
        { label: "Committed", value: "1", level: "good" },
        { label: "Anomalies", value: "?", level: "warn" },
        { label: "Throughput", value: "high", level: "good" },
      ],
      scene: {
        show: ["a", "b", "db"],
        hot: ["a", "b"],
        flows: [
          { link: "a-db", label: "reads balance" },
          { link: "b-db", delay: 0.4, label: "reads balance" },
        ],
        badges: { db: "overlapping work" },
      },
    },
    {
      short: "Anomalies",
      title: "What goes wrong without isolation",
      body: [
        "A dirty read sees data another transaction has not committed yet, and may later roll back. A non-repeatable read gets two different answers to the same query inside one transaction. A phantom read sees new rows appear mid-transaction.",
        "The nastiest are lost updates and write skew: two transactions each read a value, decide, and write, and one decision overwrites or invalidates the other.",
      ],
      callout: {
        kind: "warn",
        text: "These bugs are rare and timing dependent. They pass every test and show up at 3 a.m. under load.",
      },
      metrics: [
        { label: "Committed", value: "2", level: "good" },
        { label: "Anomalies", value: "3 kinds", level: "bad" },
        { label: "Throughput", value: "highest", level: "good" },
      ],
      scene: {
        show: ["a", "b", "db"],
        hot: ["db"],
        flows: [
          { link: "a-db", tone: "warn", label: "write, not committed" },
          { link: "b-db", reverse: true, tone: "warn", delay: 0.5, label: "dirty read" },
        ],
        badges: { db: "READ UNCOMMITTED" },
      },
    },
    {
      short: "Levels",
      title: "Isolation levels are a dial",
      body: [
        "`READ COMMITTED` blocks dirty reads and is the default in many databases. `REPEATABLE READ` also freezes what a transaction has already read. `SERIALIZABLE` blocks everything, including phantoms and write skew.",
        "Each step up costs something: more waiting or more aborted transactions. Serializable can cut throughput noticeably on write-heavy workloads.",
      ],
      callout: {
        kind: "tip",
        text: "Defaults differ: PostgreSQL uses READ COMMITTED, MySQL InnoDB uses REPEATABLE READ. Check yours before assuming.",
      },
      metrics: [
        { label: "Committed", value: "2", level: "good" },
        { label: "Anomalies", value: "fewer", level: "warn" },
        { label: "Throughput", value: "medium", level: "warn" },
        { label: "Conflicts", value: "some", level: "warn" },
      ],
      scene: {
        show: ["a", "b", "db"],
        hot: ["db"],
        flows: [
          { link: "a-db", label: "write" },
          { link: "b-db", delay: 0.5, label: "waits or retries" },
        ],
        badges: { db: "stronger level", b: "blocked briefly" },
      },
    },
    {
      short: "Locks / MVCC",
      title: "Two ways to enforce it",
      body: [
        "Locking: a writer takes a lock on the rows it touches, and others wait. Simple and strict, but readers can block writers and long waits pile up.",
        "Multi-version concurrency control (MVCC) keeps old versions of each row. Readers see a consistent snapshot and never block writers. The price is extra storage and a background cleanup job.",
      ],
      callout: {
        kind: "insight",
        text: "Optimistic variants skip locks, check at commit time whether anyone else changed the data, and abort if so. They win when conflicts are rare.",
      },
      metrics: [
        { label: "Committed", value: "2", level: "good" },
        { label: "Anomalies", value: "0", level: "good" },
        { label: "Throughput", value: "good", level: "good" },
        { label: "Conflicts", value: "few", level: "good" },
      ],
      scene: {
        show: ["a", "b", "db"],
        hot: ["db"],
        flows: [
          { link: "a-db", label: "writes version 2" },
          { link: "b-db", reverse: true, tone: "res", delay: 0.6, label: "reads version 1" },
        ],
        badges: { db: "versions kept", b: "snapshot view" },
      },
    },
    {
      short: "Double spend",
      title: "Case: two withdrawals, one balance",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Alice has `$100`. Two requests each read the balance, see `$100`, check it covers a `$80` purchase, and write back `$20`. Both succeed and she spent `$160`.",
        "Fixes: read with `SELECT ... FOR UPDATE` so the second request waits, use one atomic statement such as `UPDATE ... SET bal = bal - 80 WHERE bal >= 80`, or run at SERIALIZABLE and retry the loser.",
      ],
      callout: {
        kind: "warn",
        text: "A retry loop is mandatory with stronger isolation. The database will abort some transactions on purpose.",
      },
      metrics: [
        { label: "Committed", value: "2", level: "bad" },
        { label: "Anomalies", value: "lost update", level: "bad" },
        { label: "Conflicts", value: "missed", level: "bad" },
      ],
      scene: {
        show: ["a", "b", "db"],
        hot: ["db"],
        flows: [
          { link: "a-db", tone: "warn", label: "read 100, write 20" },
          { link: "b-db", tone: "warn", delay: 0.4, label: "read 100, write 20" },
        ],
        badges: { db: "balance 20, spent 160" },
      },
    },
    {
      short: "Deadlock",
      title: "Case: a deadlock",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Txn A locks Alice then wants Bob. Txn B locks Bob then wants Alice. Each waits forever for the other.",
        "Databases detect the cycle within about a second, abort one transaction, and let the other proceed. Avoid cycles by always locking rows in the same order, such as ascending account id.",
      ],
      metrics: [
        { label: "Committed", value: "1", level: "warn" },
        { label: "Anomalies", value: "0", level: "good" },
        { label: "Conflicts", value: "1 aborted", level: "bad" },
      ],
      scene: {
        show: ["a", "b", "db"],
        hot: ["b"],
        flows: [
          { link: "a-db", tone: "warn", label: "holds Alice, wants Bob" },
          { link: "b-db", tone: "warn", delay: 0.4, label: "holds Bob, wants Alice" },
        ],
        badges: { b: "aborted, retry", db: "cycle detected" },
      },
    },
    {
      short: "Recap",
      title: "Choosing a level",
      body: [
        "Start from the invariant you must protect. If a single atomic statement can do it, use that and a low isolation level. If a read-then-write is unavoidable, lock the rows or go serializable.",
        "Keep transactions short, touch rows in a consistent order, and retry on serialization failures and deadlocks. Across several databases or services a single transaction no longer exists, so you need sagas or idempotent steps instead.",
      ],
      callout: {
        kind: "tip",
        text: "Rule of thumb: weakest level that keeps the invariant true, plus a retry loop.",
      },
      metrics: [
        { label: "Committed", value: "all", level: "good" },
        { label: "Anomalies", value: "0", level: "good" },
        { label: "Throughput", value: "balanced", level: "good" },
        { label: "Conflicts", value: "retried", level: "good" },
      ],
      scene: {
        show: ["a", "b", "db", "wal"],
        badges: { a: "short txn", b: "retry on abort", db: "pick the level", wal: "durable" },
      },
    },
  ],
};
