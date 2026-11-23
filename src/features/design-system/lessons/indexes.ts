import type { Lesson } from "../lib/types";

export const indexes: Lesson = {
  id: "indexes",
  title: "Indexes",
  summary: "Trade a little write cost and disk space for lookups that skip almost the whole table.",
  minutes: 12,
  level: "beginner",
  goals: [
    "Why a query without an index scans every row",
    "How a B-tree index finds a row in a few steps",
    "How composite and covering indexes work",
    "What indexes cost on every write",
    "Why a query sometimes ignores your index",
  ],
  takeaways: [
    "An index turns a scan of millions of rows into a handful of page reads.",
    "Every index slows writes and uses space, so add the ones your queries need and no more.",
    "Check with the query plan: an index only helps when the query is written to use it.",
  ],
  hud: [
    { label: "Rows scanned", icon: "database" },
    { label: "Query time", icon: "timer" },
    { label: "Index size", icon: "layers" },
    { label: "Write cost", icon: "gauge" },
  ],
  nodes: [
    { id: "app", kind: "service", label: "Query", x: 100, y: 150 },
    { id: "idx", kind: "db", label: "Index", sub: "B-tree", x: 340, y: 40 },
    { id: "tbl", kind: "db", label: "Table", sub: "10M rows", x: 580, y: 150 },
    { id: "idx2", kind: "db", label: "Index 2", sub: "by city", x: 340, y: 260 },
  ],
  links: [
    { id: "scan", from: "app", to: "tbl" },
    { id: "a-i", from: "app", to: "idx" },
    { id: "i-t", from: "idx", to: "tbl" },
    { id: "t-i2", from: "tbl", to: "idx2" },
  ],
  steps: [
    {
      short: "Full scan",
      title: "Finding one user among 10 million",
      body: [
        "A `users` table holds 10 million rows, and you run `SELECT * FROM users WHERE email = 'ada@example.com'`. With no index, the database has no clue where that row is.",
        "It reads the table from the first row to the last and checks each one. This is a full scan, and at roughly 2 million rows per second it takes about 5 seconds.",
      ],
      callout: {
        kind: "warn",
        text: "Small tables hide this. A scan of 1,000 rows is instant, so the problem only appears once the table has grown.",
      },
      metrics: [
        { label: "Rows scanned", value: "10,000,000", level: "bad" },
        { label: "Query time", value: "5 s", level: "bad" },
      ],
      scene: {
        show: ["app", "tbl"],
        hot: ["tbl"],
        flows: [
          { link: "scan", tone: "warn", label: "WHERE email = …" },
          { link: "scan", reverse: true, tone: "res", delay: 1.4, label: "1 row, after 5 s" },
        ],
        badges: { tbl: "reading every row" },
      },
    },
    {
      short: "Book index",
      title: "An index is a sorted lookup structure",
      body: [
        "Think of the index at the back of a book: a sorted list of terms with page numbers. You jump to the term, then jump to the page, instead of reading the whole book.",
        "A database index does the same. It keeps the indexed column in sorted order, each entry holding a pointer to where the full row lives.",
      ],
      metrics: [
        { label: "Rows scanned", value: "—", level: "warn" },
        { label: "Index size", value: "~300 MB", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        hot: ["idx"],
        badges: { idx: "email → row pointer", tbl: "unchanged" },
        bubbles: { idx: "ada@… → page 8,412" },
      },
    },
    {
      short: "B-tree",
      title: "How a B-tree finds a row",
      body: [
        "Most indexes are B-trees: a shallow, wide tree in which each node is one disk page holding hundreds of keys. The root points to a middle layer, which points to leaves.",
        "With about 500 keys per page, three or four levels cover hundreds of millions of rows. Finding your email costs roughly four page reads, then one more to fetch the row.",
      ],
      callout: {
        kind: "insight",
        text: "Lookup cost grows with the logarithm of the table size. Going from 10 million to 1 billion rows adds about one level.",
      },
      metrics: [
        { label: "Rows scanned", value: "1", level: "good" },
        { label: "Query time", value: "0.2 ms", level: "good" },
        { label: "Index size", value: "~300 MB", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        hot: ["idx"],
        flows: [
          { link: "a-i", label: "4 page reads" },
          { link: "i-t", delay: 0.8, label: "pointer" },
          { link: "i-t", reverse: true, tone: "res", delay: 1.6, label: "row" },
        ],
        badges: { idx: "3-4 levels deep" },
      },
    },
    {
      short: "Create it",
      title: "Creating an index",
      body: [
        "You add one with `CREATE INDEX idx_users_email ON users (email)`. The database reads the table once, sorts the emails and builds the tree.",
        "On a big table this takes minutes and can block writes unless you use an online variant such as `CREATE INDEX CONCURRENTLY` in PostgreSQL.",
      ],
      callout: {
        kind: "tip",
        text: "Add indexes on columns you filter, join or sort by. A unique index also enforces that no two rows share a value.",
      },
      metrics: [
        { label: "Rows scanned", value: "1", level: "good" },
        { label: "Query time", value: "5 s → 0.2 ms", level: "good" },
        { label: "Index size", value: "300 MB", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        hot: ["idx"],
        flows: [{ link: "i-t", reverse: true, label: "build: read + sort" }],
        badges: { idx: "built in 3 min" },
      },
    },
    {
      short: "Composite",
      title: "Composite indexes: order matters",
      body: [
        "A composite index covers several columns, such as `(city, signup_date)`. It is sorted by `city` first, then by `signup_date` inside each city.",
        "It serves `WHERE city = 'Hanoi'` and `WHERE city = 'Hanoi' AND signup_date > '2025-01-01'`. It does not help with `signup_date` alone, because that column is only sorted within a city. This is the leftmost-prefix rule.",
      ],
      callout: {
        kind: "insight",
        text: "Put equality columns first and the range column last. One good composite index often replaces two single-column ones.",
      },
      metrics: [
        { label: "Rows scanned", value: "~200", level: "good" },
        { label: "Query time", value: "0.4 ms", level: "good" },
        { label: "Index size", value: "400 MB", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        hot: ["idx"],
        flows: [{ link: "a-i", label: "city = 'Hanoi' AND date > …" }],
        bubbles: { idx: "(city, signup_date)" },
        badges: { idx: "sorted by city, then date" },
      },
    },
    {
      short: "Covering",
      title: "Covering indexes skip the table",
      body: [
        "If the index already holds every column the query needs, the database can answer from the index alone. For `SELECT city, signup_date FROM users WHERE city = …`, it never touches the table.",
        "That saves one random read per result row, which adds up quickly when a query returns thousands of rows.",
      ],
      callout: {
        kind: "tip",
        text: "Most databases can add extra non-key columns to an index (`INCLUDE` in PostgreSQL and SQL Server) for exactly this.",
      },
      metrics: [
        { label: "Rows scanned", value: "~200", level: "good" },
        { label: "Query time", value: "0.1 ms", level: "good" },
        { label: "Index size", value: "450 MB", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        hot: ["idx"],
        flows: [
          { link: "a-i", label: "SELECT city, date" },
          { link: "a-i", reverse: true, tone: "res", delay: 0.8, label: "answered by index" },
        ],
        badges: { tbl: "never touched" },
      },
    },
    {
      short: "Write cost",
      title: "Every index taxes every write",
      body: [
        "Each `INSERT` must add an entry to the table and to every index. An `UPDATE` of an indexed column moves the entry. A `DELETE` removes it from all of them.",
        "A table with 5 indexes does about 6 writes per insert instead of 1. Indexes also take disk and memory: a few of them can easily match the table in size.",
      ],
      callout: {
        kind: "warn",
        text: "Indexing every column is not a fix. On write-heavy tables it can cut insert throughput by half or more.",
      },
      metrics: [
        { label: "Query time", value: "0.2 ms", level: "good" },
        { label: "Index size", value: "900 MB", level: "bad" },
        { label: "Write cost", value: "3 writes / insert", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl", "idx2"],
        hot: ["idx", "idx2"],
        flows: [
          { link: "scan", label: "INSERT user" },
          { link: "i-t", reverse: true, tone: "warn", delay: 0.6, label: "update index" },
          { link: "t-i2", tone: "warn", delay: 0.6 },
        ],
        badges: { tbl: "1 write", idx: "+1 write", idx2: "+1 write" },
      },
    },
    {
      short: "Ignored",
      title: "Why the database ignores your index",
      body: [
        "Wrapping the column in a function breaks the match: `WHERE lower(email) = 'ada@…'` cannot use an index on `email`, because the stored values are not lowercased. Fix it with an expression index or by storing normalised data.",
        "Low-selectivity columns are another case. If `active = true` matches 95% of the rows, reading the index and then the table is slower than one sequential scan, so the planner skips the index.",
      ],
      callout: {
        kind: "tip",
        text: "Run `EXPLAIN` on the query. It shows the plan: an index scan means it worked, a sequential scan means it did not.",
      },
      metrics: [
        { label: "Rows scanned", value: "10,000,000", level: "bad" },
        { label: "Query time", value: "5 s", level: "bad" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        hot: ["idx"],
        flows: [{ link: "scan", tone: "warn", label: "lower(email) = …" }],
        bubbles: { app: "lower(email)" },
        badges: { idx: "skipped by planner" },
      },
    },
    {
      short: "Case",
      title: "Case: the slow admin report",
      chapter: { label: "Case", tone: "amber" },
      body: [
        "A report runs `WHERE city = 'Hanoi' AND status = 'active' ORDER BY signup_date` and takes 8 seconds. `EXPLAIN` shows a sequential scan plus a sort.",
        "Adding a composite index on `(city, status, signup_date)` lets the database jump to the matching range and read it already sorted. The query drops to 15 ms, and one extra write per signup is a fair price.",
      ],
      metrics: [
        { label: "Rows scanned", value: "10M → 4,000", level: "good" },
        { label: "Query time", value: "8 s → 15 ms", level: "good" },
        { label: "Index size", value: "+350 MB", level: "warn" },
        { label: "Write cost", value: "+1 write", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        hot: ["idx"],
        flows: [
          { link: "a-i", label: "city, status, sorted" },
          { link: "a-i", reverse: true, tone: "res", delay: 0.8, label: "4,000 rows" },
        ],
        badges: { idx: "range + order in one pass" },
      },
    },
    {
      short: "Recap",
      title: "A checklist for indexing",
      body: [
        "Index what you filter, join and sort by. Order composite columns equality first, range last. Consider a covering index for hot read queries.",
        "Remember the bill: 1 extra write per index per insert, plus disk. Check `EXPLAIN` before and after, and drop indexes nobody uses.",
      ],
      metrics: [
        { label: "Rows scanned", value: "few", level: "good" },
        { label: "Query time", value: "ms, not s", level: "good" },
        { label: "Index size", value: "watch it", level: "warn" },
        { label: "Write cost", value: "1 per index", level: "warn" },
      ],
      scene: {
        show: ["app", "idx", "tbl"],
        badges: { idx: "read fast", tbl: "write a bit slower" },
      },
    },
  ],
};
