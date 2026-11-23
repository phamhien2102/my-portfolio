import type { Lesson } from "../lib/types";

export const storageEngines: Lesson = {
  id: "storage-engines",
  title: "Storage Engines",
  summary:
    "Compare B-trees and LSM-trees by how they turn writes into disk work, and pick by workload.",
  minutes: 14,
  level: "intermediate",
  goals: [
    "How a B-tree updates pages in place",
    "How an LSM-tree turns random writes into sequential ones",
    "What the write-ahead log, memtable and SSTables each do",
    "Why compaction and Bloom filters exist",
    "How to choose an engine for a workload",
  ],
  takeaways: [
    "B-trees update in place and favour reads; LSM-trees append and merge and favour writes.",
    "Every engine pays in read, write or space amplification, and you choose which one to pay.",
    "Pick from the workload: read-heavy and transactional leans B-tree, write-heavy ingest leans LSM.",
  ],
  hud: [
    { label: "Write speed", icon: "gauge" },
    { label: "Read cost", icon: "download" },
    { label: "Write amp", icon: "layers" },
    { label: "Space amp", icon: "database" },
    { label: "Durability", icon: "shield" },
  ],
  nodes: [
    { id: "app", kind: "service", label: "Writes", x: 100, y: 150 },
    { id: "bt", kind: "db", label: "B-tree", sub: "pages", x: 340, y: 40 },
    { id: "mem", kind: "cache", label: "Memtable", sub: "in RAM", x: 340, y: 150 },
    { id: "wal", kind: "queue", label: "WAL", sub: "append-only", x: 340, y: 260 },
    { id: "l0", kind: "db", label: "L0 Files", sub: "SSTables", x: 580, y: 150 },
    { id: "l1", kind: "db", label: "L1 Files", sub: "merged", x: 580, y: 40 },
  ],
  links: [
    { id: "a-bt", from: "app", to: "bt" },
    { id: "a-wal", from: "app", to: "wal" },
    { id: "a-mem", from: "app", to: "mem" },
    { id: "mem-l0", from: "mem", to: "l0" },
    { id: "l0-l1", from: "l0", to: "l1" },
  ],
  steps: [
    {
      short: "Problem",
      title: "Disks like some patterns more than others",
      body: [
        "A database must make writes survive a crash, so sooner or later they reach disk. How they reach it matters enormously.",
        "Writing sequentially, one block after another, is fast on every device: hundreds of MB per second even on a spinning disk. Writing to scattered places forces many small random I/Os, which are far slower and wear SSDs faster.",
      ],
      callout: {
        kind: "insight",
        text: "A storage engine is mostly a policy for turning your writes into a disk-friendly pattern. Two designs dominate.",
      },
      metrics: [
        { label: "Write speed", value: "?", level: "warn" },
        { label: "Durability", value: "must survive crash", level: "warn" },
      ],
      scene: { show: ["app", "wal"], bubbles: { app: "100k writes/s" } },
    },
    {
      short: "B-tree",
      title: "B-tree: update the page in place",
      body: [
        "A B-tree keeps data in fixed-size pages (often 8 or 16 KB) arranged in a sorted tree. To write a key, the engine finds its page, changes it, and writes the page back to the same spot.",
        "Reads are excellent: a lookup touches 3 or 4 pages, and ranges are contiguous. The data stays sorted and compact, with one live copy of each key.",
      ],
      callout: {
        kind: "tip",
        text: "PostgreSQL, MySQL (InnoDB), SQL Server and Oracle all use B-tree variants. It is the default for transactional databases.",
      },
      metrics: [
        { label: "Write speed", value: "20k/s", level: "warn" },
        { label: "Read cost", value: "3-4 pages", level: "good" },
        { label: "Space amp", value: "1.3x", level: "good" },
      ],
      scene: {
        show: ["app", "bt"],
        hot: ["bt"],
        flows: [
          { link: "a-bt", label: "PUT user:42" },
          { link: "a-bt", reverse: true, tone: "res", delay: 0.8, label: "page rewritten" },
        ],
        badges: { bt: "random write, in place" },
      },
    },
    {
      short: "B-tree cost",
      title: "What in-place updates cost",
      body: [
        "Changing 100 bytes still rewrites a whole 8 KB page, so write amplification is already around 80x for tiny writes. A full page splits when it overflows, touching several pages at once.",
        "A crash mid-write could leave a half-written page. So engines first log the change to a write-ahead log (WAL) and may write each page twice. Writes become random I/O plus extra copies.",
      ],
      callout: {
        kind: "warn",
        text: "Random writes are the bottleneck. A write-heavy B-tree workload often hits the disk's IOPS limit long before bandwidth.",
      },
      metrics: [
        { label: "Write speed", value: "20k/s", level: "warn" },
        { label: "Write amp", value: "10-80x", level: "bad" },
        { label: "Durability", value: "WAL protects", level: "good" },
      ],
      scene: {
        show: ["app", "bt", "wal"],
        hot: ["bt"],
        flows: [
          { link: "a-wal", label: "log first" },
          { link: "a-bt", delay: 0.8, tone: "warn", label: "then random page write" },
        ],
        badges: { bt: "8 KB page for 100 B" },
      },
    },
    {
      short: "LSM write",
      title: "LSM-tree: append now, organise later",
      body: [
        "A log-structured merge tree never edits data in place. A write first appends to a sequential WAL for durability, then goes into the memtable, a sorted structure held in RAM.",
        "The write is acknowledged right then, with one sequential append and one memory insert. No random disk I/O happens on the write path.",
      ],
      callout: {
        kind: "insight",
        text: "The WAL is only read after a crash, to rebuild the memtable. In normal life it is write-only.",
      },
      metrics: [
        { label: "Write speed", value: "200k/s", level: "good" },
        { label: "Write amp", value: "low at first", level: "good" },
        { label: "Durability", value: "WAL protects", level: "good" },
      ],
      scene: {
        show: ["app", "wal", "mem"],
        hot: ["wal", "mem"],
        flows: [
          { link: "a-wal", label: "append" },
          { link: "a-mem", delay: 0.2, label: "insert sorted" },
          { link: "a-mem", reverse: true, tone: "res", delay: 1, label: "ack" },
        ],
        badges: { wal: "sequential", mem: "sorted in RAM" },
      },
    },
    {
      short: "Flush",
      title: "Flushing to immutable files",
      body: [
        "When the memtable reaches a size limit (say 64 MB), the engine writes it out in one sequential pass as a sorted, immutable file called an SSTable. The matching WAL segment can then be dropped.",
        "Files are never modified after they are written. That makes them easy to cache, easy to back up, and safe to read without locks.",
      ],
      metrics: [
        { label: "Write speed", value: "200k/s", level: "good" },
        { label: "Space amp", value: "1.5x", level: "good" },
        { label: "Write amp", value: "1x so far", level: "good" },
      ],
      scene: {
        show: ["app", "mem", "l0"],
        hot: ["l0"],
        flows: [{ link: "mem-l0", label: "flush 64 MB, sequential" }],
        badges: { mem: "full", l0: "new SSTable" },
      },
    },
    {
      short: "Read path",
      title: "Reads must look in several places",
      body: [
        "A key might be in the memtable or in any SSTable, so a read checks the memtable first, then files from newest to oldest, stopping at the first match.",
        "To avoid reading files that cannot hold the key, each SSTable carries a Bloom filter: a compact structure that says either 'definitely not here' or 'maybe here'. About 10 bits per key keeps false positives near 1%.",
      ],
      callout: {
        kind: "warn",
        text: "A missing key is the worst case. Without Bloom filters, the engine would have to check every file before saying 'not found'.",
      },
      metrics: [
        { label: "Read cost", value: "1-5 files", level: "warn" },
        { label: "Space amp", value: "1.5x", level: "good" },
      ],
      scene: {
        show: ["app", "mem", "l0"],
        hot: ["mem", "l0"],
        flows: [
          { link: "a-mem", label: "GET key" },
          { link: "mem-l0", delay: 0.7, label: "Bloom filter check" },
        ],
        badges: { mem: "not here", l0: "maybe here" },
      },
    },
    {
      short: "Compaction",
      title: "Compaction keeps reads fast",
      body: [
        "Files pile up, and old versions and deleted keys stay in them. A background compaction job merges several sorted files into one larger sorted file, dropping overwritten and deleted entries.",
        "It is a merge of sorted inputs, so it runs as fast sequential I/O. But the same data is rewritten as it moves down the levels, often 10 to 30 times over its life.",
      ],
      callout: {
        kind: "warn",
        text: "Compaction competes with foreground traffic for disk and CPU. Falling behind causes latency spikes and, eventually, write stalls.",
      },
      metrics: [
        { label: "Write speed", value: "100k/s", level: "warn" },
        { label: "Read cost", value: "1-2 files", level: "good" },
        { label: "Write amp", value: "10-30x", level: "bad" },
        { label: "Space amp", value: "temp 2x", level: "warn" },
      ],
      scene: {
        show: ["app", "l0", "l1"],
        hot: ["l1"],
        flows: [{ link: "l0-l1", tone: "warn", label: "merge + drop old versions" }],
        badges: { l0: "4 small files", l1: "1 big file" },
      },
    },
    {
      short: "Amplification",
      title: "You always pay somewhere",
      body: [
        "Three costs compete. Write amplification is bytes written to disk per byte you wrote. Read amplification is the pages or files read per lookup. Space amplification is the disk used per byte of live data.",
        "A B-tree has low read and space amplification but pays on random writes. An LSM-tree makes ingest cheap and pays on compaction rewrites and multi-file reads. Tuning an engine moves cost from one to another, it does not remove it.",
      ],
      callout: {
        kind: "insight",
        text: "Leveled compaction lowers read and space cost but rewrites more. Size-tiered compaction writes less but reads and stores more.",
      },
      metrics: [
        { label: "Write speed", value: "B 20k · LSM 100k+", level: "warn" },
        { label: "Read cost", value: "B 3 · LSM 1-5", level: "warn" },
        { label: "Write amp", value: "B 10x · LSM 20x", level: "warn" },
        { label: "Space amp", value: "B 1.3x · LSM 1.5x", level: "warn" },
      ],
      scene: {
        show: ["bt", "mem", "l0", "app"],
        hot: ["bt", "l0"],
        badges: { bt: "fast reads, slow writes", l0: "fast writes, slower reads" },
      },
    },
    {
      short: "Case",
      title: "Case: pick an engine for two workloads",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "Workload A is a metrics pipeline: 300,000 data points per second, rarely updated, queried by time range. Appends dominate, so an LSM engine (Cassandra, RocksDB, ClickHouse-style merges) fits, and compaction merges neighbouring time ranges nicely.",
        "Workload B is a shop's orders: 2,000 transactions per second, many point reads and updates, strong consistency. A B-tree database (PostgreSQL, MySQL) fits, since reads are 90% of the traffic and in-place updates are cheap at that rate.",
      ],
      callout: {
        kind: "tip",
        text: "Measure before switching. At modest write rates both engines are fast, and a mature B-tree database is the safer default.",
      },
      metrics: [
        { label: "Write speed", value: "A 300k/s · B 2k/s", level: "good" },
        { label: "Read cost", value: "A range · B point", level: "good" },
      ],
      scene: {
        show: ["app", "bt", "mem", "wal", "l0"],
        hot: ["bt", "l0"],
        flows: [
          { link: "a-bt", label: "B: orders, 90% reads" },
          { link: "a-mem", delay: 0.3, label: "A: metrics, 300k/s" },
        ],
        badges: { bt: "workload B", l0: "workload A" },
      },
    },
    {
      short: "Recap",
      title: "A decision rule",
      body: [
        "Lean B-tree when reads and point updates dominate, latency must be steady, and you want transactions with minimal tuning. Lean LSM when writes dominate, data is mostly appended, and you can afford background compaction.",
        "Check the three amplifications for your workload, keep the WAL on fast durable storage, and watch compaction lag. The engine you pick sets your disk bill and your tail latency.",
      ],
      metrics: [
        { label: "Write speed", value: "LSM wins", level: "good" },
        { label: "Read cost", value: "B-tree wins", level: "good" },
        { label: "Durability", value: "WAL in both", level: "good" },
      ],
      scene: {
        show: ["app", "bt", "mem", "wal", "l0", "l1"],
        badges: { bt: "read-heavy", l1: "write-heavy" },
      },
    },
  ],
};
