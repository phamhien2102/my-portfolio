import type { Lesson } from "../lib/types";

export const replication: Lesson = {
  id: "replication",
  title: "Replication",
  summary: "Keep copies of your data on several machines for speed and for survival.",
  minutes: 9,
  level: "beginner",
  goals: [
    "Why one database is a risk and a read bottleneck",
    "How a primary streams changes to replicas",
    "What replication lag is and when it bites",
    "How failover promotes a replica",
  ],
  takeaways: [
    "Replicas give you spare copies and extra read capacity.",
    "Replication lag causes stale reads; read your own writes from the primary.",
    "Failover promotes a replica; sync versus async is speed against safety.",
  ],
  hud: [
    { label: "Copies", icon: "database" },
    { label: "Read capacity", icon: "gauge" },
    { label: "Replica lag", icon: "timer" },
    { label: "Primary", icon: "server" },
  ],
  nodes: [
    { id: "app", kind: "server", label: "App", x: 70, y: 150 },
    { id: "pri", kind: "db", label: "Primary", x: 290, y: 150 },
    { id: "r1", kind: "db", label: "Replica 1", x: 520, y: 65 },
    { id: "r2", kind: "db", label: "Replica 2", x: 520, y: 235 },
  ],
  links: [
    { id: "ap", from: "app", to: "pri" },
    { id: "p1", from: "pri", to: "r1" },
    { id: "p2", from: "pri", to: "r2" },
    { id: "a1", from: "app", to: "r1" },
    { id: "a2", from: "app", to: "r2" },
  ],
  steps: [
    {
      short: "One copy",
      metrics: [
        { label: "Copies", value: "1", level: "bad" },
        { label: "Read capacity", value: "1\u00d7", level: "warn" },
        { label: "Primary", value: "up", level: "good" },
      ],
      title: "One database, one copy of everything",
      body: [
        "All reads and writes go to a single database. If its disk fails, the data is gone; if it is busy, every query waits.",
        "Backups help with the first problem but restoring takes time, and they do nothing for the second.",
      ],
      callout: {
        kind: "warn",
        text: "A backup is not a replica. Restoring one means downtime and losing everything since the last backup.",
      },
      scene: {
        show: ["app", "pri"],
        hot: ["pri"],
        flows: [{ link: "ap", label: "reads + writes" }],
      },
    },
    {
      short: "Add replicas",
      metrics: [
        { label: "Copies", value: "3", level: "good" },
        { label: "Read capacity", value: "1\u00d7", level: "warn" },
        { label: "Replica lag", value: "50 ms", level: "good" },
        { label: "Primary", value: "up", level: "good" },
      ],
      title: "Stream changes to replicas",
      body: [
        "Add two replicas. Every write goes to the primary, which appends it to a log and ships that log to each replica. The replicas replay it and stay in step.",
        "Now the data exists in three places.",
      ],
      scene: {
        show: ["app", "pri", "r1", "r2"],
        hot: ["pri"],
        flows: [
          { link: "ap", label: "write" },
          { link: "p1", delay: 0.6, label: "log" },
          { link: "p2", delay: 0.6 },
        ],
      },
    },
    {
      short: "Scale reads",
      metrics: [
        { label: "Copies", value: "3", level: "good" },
        { label: "Read capacity", value: "3\u00d7", level: "good" },
        { label: "Replica lag", value: "50 ms", level: "good" },
        { label: "Primary", value: "up", level: "good" },
      ],
      title: "Reads spread out",
      body: [
        "Most apps read far more than they write. Send writes to the primary and spread reads over the replicas.",
        "Two replicas roughly triple your read capacity, and you can add more as you grow.",
      ],
      scene: {
        show: ["app", "pri", "r1", "r2"],
        hot: ["r1", "r2"],
        flows: [
          { link: "a1", reverse: true, tone: "res", label: "read" },
          { link: "a2", reverse: true, tone: "res", delay: 0.4 },
          { link: "ap", delay: 0.8, label: "write" },
        ],
        badges: { r1: "reads", r2: "reads", pri: "writes" },
      },
    },
    {
      short: "Lag",
      metrics: [
        { label: "Copies", value: "3", level: "good" },
        { label: "Read capacity", value: "3\u00d7", level: "good" },
        { label: "Replica lag", value: "800 ms", level: "bad" },
        { label: "Primary", value: "up", level: "good" },
      ],
      title: "Replicas run a little behind",
      body: [
        "Shipping the log takes time, usually milliseconds but sometimes seconds under load. That delay is replication lag.",
        "A user posts a comment, is sent to a replica that has not seen it yet, and the comment seems to vanish. This is a stale read.",
      ],
      callout: {
        kind: "tip",
        text: "Read your own writes from the primary for a short while after the user changes something, or pin that user to the primary.",
      },
      scene: {
        show: ["app", "pri", "r1", "r2"],
        hot: ["r1"],
        flows: [{ link: "a1", reverse: true, tone: "warn", label: "comment missing?" }],
        badges: { pri: "has the comment", r1: "lag 800 ms", r2: "lag 50 ms" },
      },
    },
    {
      short: "Failover",
      metrics: [
        { label: "Copies", value: "2", level: "warn" },
        { label: "Read capacity", value: "2\u00d7", level: "warn" },
        { label: "Primary", value: "down", level: "bad" },
      ],
      title: "The primary dies",
      body: [
        "When the primary stops responding, the system promotes the most up-to-date replica to be the new primary and points the app at it.",
        "This is failover. Done well it takes seconds, and the site keeps working with one less copy.",
      ],
      scene: {
        show: ["app", "pri", "r1", "r2"],
        hot: ["r1"],
        down: ["pri"],
        flows: [{ link: "a1", label: "writes now go here" }],
        badges: { pri: "down", r1: "promoted", r2: "follows r1" },
      },
    },
    {
      short: "Sync vs async",
      metrics: [
        { label: "Copies", value: "3", level: "good" },
        { label: "Read capacity", value: "3\u00d7", level: "good" },
        { label: "Replica lag", value: "0\u201350 ms", level: "good" },
        { label: "Primary", value: "up", level: "good" },
      ],
      title: "How careful is each write?",
      body: [
        "With asynchronous replication, the primary confirms a write at once and ships it later. It is fast, but if the primary dies right then, the last few writes can be lost.",
        "With synchronous replication, it waits for at least one replica to confirm first. Nothing is lost, but every write is slower and depends on that replica being up.",
      ],
      callout: {
        kind: "insight",
        text: "Many systems wait for one replica and let the rest catch up. It is a trade between speed and safety.",
      },
      scene: {
        show: ["app", "pri", "r1", "r2"],
        hot: ["pri", "r1"],
        flows: [{ link: "p1", label: "wait for ack" }],
        badges: { r1: "sync", r2: "async" },
      },
    },
  ],
};
